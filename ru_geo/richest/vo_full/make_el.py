# Полная озвучка «Самый богатый человек в истории» голосом Todd (ElevenLabs v3) с эмоциями из moods.py.
# сборка в один файл: паузы между абзацами, тишина под музыкальные паузы и заставки глав. Пишет vo.mp3, script.txt, segments.json.
import asyncio, json, os, re, subprocess, sys, time, certifi
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.dirname(D)
L = open(f'{J}/SCRIPT.md').read().splitlines()
start = next(i for i, l in enumerate(L) if l.startswith('## ХОЛОДНЫЙ СТАРТ'))
items = []; ch = 0
for l in L[start:]:
    t = l.strip()
    if re.match(r'^## (Факты|Список фактов|Три варианта|Варианты)', t): break
    if t.startswith('## '): ch += 1; items.append(dict(kind='chapter', title=re.sub(r'\s*\(.*$', '', t[3:]).replace(' — переозвучить', ''), n=ch)); continue
    m = re.match(r'^\*\(музыкальная пауза\s*≈\s*(\d+)', t)
    if m: items.append(dict(kind='pause', sec=int(m.group(1)), hint=t.strip('*()'))); continue
    if not t or t.startswith(('*(', '<!--', '---', '**[', '>', '- ', '|', '#')): continue
    items.append(dict(kind='voice', text=t))
FX = ('highpass=f=75,equalizer=f=300:t=q:w=1.2:g=-2.5,equalizer=f=120:t=q:w=0.9:g=1.8,equalizer=f=3200:t=q:w=1.0:g=2.2,'
      'highshelf=f=10000:g=2,deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,'
      'aecho=0.85:0.5:28|46:0.10|0.06,alimiter=limit=0.89')
from moods import mood
# ElevenLabs v3, голос Todd (как в «Исландии»). Эмоции из moods.py превращаем в теги v3 — тег ставится,
# только когда настроение меняется, чтобы не было перебора. Ключ подставляет прокси. По одному запросу, пауза 3 с.
FX = FX.replace('aecho=0.85:0.5:28|46:0.10|0.06,', '')   # Todd и так чистый, эхо не нужно
TAG = {'hush': '[whispers]', 'grave': '[serious]', 'tense': '[nervous]', 'alarm': '[nervous]',
       'wonder': '[surprised]', 'warm': '[softly]', 'neutral': ''}
EXTRA = {'Цены в Каире от этого не упадут': '[chuckles]', 'В этом он, пожалуй, мог бы поспорить': '[chuckles]',
         'Правда, коммуналка отдельно': '[chuckles]', 'И Рокфеллер': '[pause]', 'И у него бы ещё осталось': '[chuckles]',
         'Только римскую, а не свою': '[chuckles]', 'Говорят, при этом он ходил': '[chuckles]', 'Вне конкурса': '[pause]'}
FMT = os.environ.get('FMT', 'mp3_44100_192')
def tagged(k, text):
    sents = [x for x in re.split(r'(?<=[.!?…»])\s+', text) if x.strip()]
    out, prev = [], None
    for x in sents:
        m = mood(k, x); t = ''
        if m != prev and TAG[m] != TAG.get(prev, None):
            t = TAG[m] if not (m == 'hush' and len(x) > 90) else '[softly]'   # длинное — вполголоса, короткое — шёпотом
            if m == 'hush' and prev not in (None, 'hush'): t = '[pause] ' + t
        for pre, e in EXTRA.items():
            if x.startswith(pre): t = (t + ' ' + e).strip()
        out.append((t + ' ' + x).strip()); prev = m
    return ' '.join(out)
def el(text, out):
    tmp = out + '.part'
    body = json.dumps(dict(text=text, model_id='eleven_v3', voice_settings=dict(stability=0.0, similarity_boost=0.8)))
    for a in range(4):
        r = subprocess.run(['curl', '-sS', '-o', tmp, '-w', '%{http_code}', '-X', 'POST',
                            f'https://api.elevenlabs.io/v1/text-to-speech/g14YnDYCsy3k7XLlcKlO?output_format={FMT}',
                            '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '-d', body], capture_output=True, text=True).stdout
        time.sleep(3)
        if r == '200' and os.path.getsize(tmp) > 3000: os.replace(tmp, out); return
        print('ERR', r, open(tmp, errors='ignore').read()[:200], flush=True)
        if r in ('401', '402', '403'): sys.exit(1)
    sys.exit(1)
os.makedirs(f'{D}/el', exist_ok=True)
k = 0
for it in items:
    if it['kind'] != 'voice': continue
    k += 1; it['file'] = f'{D}/el/e{k:03d}.wav'
    if os.path.exists(it['file']): continue
    raw = f'{D}/el/e{k:03d}.mp3'
    if not os.path.exists(raw): el(tagged(k, it['text']), raw)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', FX, '-ar', '48000', '-ac', '1', it['file']], check=True)
    print(k, flush=True)
dur = lambda p: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
# сборка: перед главой 2,4 с тишины (заставка), между абзацами 0,6 с, музыкальная пауза — её длительность
seq, t, segs = [], 0.4, []
def sil(s):
    global t; seq.append(('sil', s)); t += s
sil(0.0)
for it in items:
    if it['kind'] == 'chapter':
        if it['n'] > 1: sil(2.4)
        segs.append(dict(kind='chapter', t=round(t, 2), title=it['title']))
    elif it['kind'] == 'pause':
        segs.append(dict(kind='pause', t=round(t, 2), dur=it['sec'], hint=it['hint'])); sil(it['sec'])
    else:
        d = dur(it['file']); segs.append(dict(kind='voice', t=round(t, 2), dur=round(d, 2), text=it['text'])); seq.append(('f', it['file'])); t += d; sil(0.6)
lst = f'{D}/concat_el.txt'
with open(lst, 'w') as f:
    for kind, v in seq:
        if kind == 'f': f.write(f"file '{v}'\n")
        elif v > 0:
            sp = f'{D}/el/sil_{int(v*1000)}.wav'
            if not os.path.exists(sp): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', str(v), sp], check=True)
            f.write(f"file '{sp}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '48000', '-b:a', '256k', f'{D}/vo_el.mp3'], check=True)
open(f'{D}/script.txt', 'w').write('\n'.join(s['text'] for s in segs if s['kind'] == 'voice') + '\n')
json.dump(segs, open(f'{D}/segments_el.json', 'w'), ensure_ascii=False, indent=1)
print('total', round(t / 60, 2), 'min', sum(1 for s in segs if s['kind'] == 'voice'), 'paragraphs')
