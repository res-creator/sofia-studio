# Озвучка «Девочка в Афганистане»: ElevenLabs v3, голос Todd (stability 0.0), теги эмоций — прямо в SCRIPT.md ([softly] …).
# Ключ подставляет прокси облачной сессии (заголовок xi-api-key: proxy). Один запрос за раз, пауза 3 с; готовые абзацы не перегенерируются.
# Пишет vo/vo_el.mp3, vo/script.txt, vo/segments_el.json (время каждого абзаца и титров глав).
import hashlib, json, os, re, subprocess, sys, time
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.dirname(D)
L = open(f'{J}/SCRIPT.md').read().splitlines()
start = next(i for i, l in enumerate(L) if l.startswith('## ХОЛОДНЫЙ СТАРТ'))
items = []; ch = 0; MAXCH = int(os.environ.get('MAXCH', '99'))
for l in L[start:]:
    t = re.sub(r'\s*<!--.*?-->', '', l).strip()
    if t.startswith('## '):
        ch += 1
        if ch > MAXCH: break
        items.append(dict(kind='chapter', title=t[3:].strip(), n=ch)); continue
    if not t or t.startswith(('*(', '<!--', '---', '>', '|', '#')): continue
    items.append(dict(kind='voice', tts=t, text=re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip()))
FX = ('highpass=f=75,equalizer=f=300:t=q:w=1.2:g=-2.5,equalizer=f=120:t=q:w=0.9:g=1.8,equalizer=f=3200:t=q:w=1.0:g=2.2,'
      'highshelf=f=10000:g=2,deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,alimiter=limit=0.89')
def el(text, out):
    tmp = out + '.part'
    body = json.dumps(dict(text=text, model_id='eleven_v3', language_code='ru', voice_settings=dict(stability=0.0, similarity_boost=0.8)))
    for a in range(3):
        r = subprocess.run(['curl', '-sS', '-m', '300', '-o', tmp, '-w', '%{http_code}', '-X', 'POST',
                            'https://api.elevenlabs.io/v1/text-to-speech/g14YnDYCsy3k7XLlcKlO?output_format=mp3_44100_192',
                            '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '--data-binary', '@-'],
                           input=body, capture_output=True, text=True).stdout
        time.sleep(3)
        if r == '200' and os.path.getsize(tmp) > 3000: os.replace(tmp, out); return
        print('ERR', r, open(tmp, errors='ignore').read()[:200], flush=True)
        if r in ('401', '402', '403', '422'): sys.exit(1)
        time.sleep(10)
    sys.exit(1)
os.makedirs(f'{D}/el', exist_ok=True)
k = 0
for it in items:
    if it['kind'] != 'voice': continue
    k += 1; h = hashlib.md5(it['tts'].encode()).hexdigest()[:10]; it['file'] = f'{D}/el/h_{h}.wav'; raw = f'{D}/el/h_{h}.mp3'
    if not os.path.exists(raw): el(it['tts'], raw); print(k, len(it['tts']), flush=True)
    if not os.path.exists(it['file']): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', FX, '-ar', '48000', '-ac', '1', it['file']], check=True)
if '--gen-only' in sys.argv: sys.exit(0)
dur = lambda p: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
seq, t, segs = [], 0.0, []
def sil(s):
    global t; seq.append(('sil', s)); t += s
cold = True
for it in items:
    if it['kind'] == 'chapter':
        cold = it['n'] == 1
        if it['n'] > 1: sil(2.6 if it['n'] == 2 else 2.4)   # перед главой: титр (перед первой ещё и название)
        segs.append(dict(kind='chapter', t=round(t, 2), title=it['title']))
    else:
        d = dur(it['file']); segs.append(dict(kind='voice', t=round(t, 2), dur=round(d, 2), text=it['text'])); seq.append(('f', it['file'])); t += d; sil(0.35 if cold else 0.6)
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
