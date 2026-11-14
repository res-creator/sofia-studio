# Полная озвучка «Третья мировая»: бесплатный голос Microsoft «Дмитрий» по абзацам SCRIPT.md + студийная обработка,
# сборка в один файл: паузы между абзацами, тишина под музыкальные паузы и заставки глав. Пишет vo.mp3, script.txt, segments.json.
import asyncio, json, os, re, subprocess, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
import edge_tts
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
async def tts(text, out):
    for k in range(10):
        try:
            await edge_tts.Communicate(text, 'ru-RU-DmitryNeural', rate='-7%', pitch='-2Hz').save(out)
            if os.path.getsize(out) > 2000: return
        except Exception as e: err = e
        await asyncio.sleep(5 + 5 * k)
    raise RuntimeError(f'tts failed: {text[:40]}')
os.makedirs(f'{D}/parts', exist_ok=True)
k = 0
for it in items:
    if it['kind'] != 'voice': continue
    k += 1; it['file'] = f'{D}/parts/p{k:03d}.wav'
    if os.path.exists(it['file']): continue
    raw = f'{D}/parts/p{k:03d}.mp3'; asyncio.run(tts(it['text'], raw))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', FX, '-ar', '48000', '-ac', '1', it['file']], check=True); os.remove(raw)
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
lst = f'{D}/concat.txt'
with open(lst, 'w') as f:
    for kind, v in seq:
        if kind == 'f': f.write(f"file '{v}'\n")
        elif v > 0:
            sp = f'{D}/parts/sil_{int(v*1000)}.wav'
            if not os.path.exists(sp): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', str(v), sp], check=True)
            f.write(f"file '{sp}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '48000', '-b:a', '256k', f'{D}/vo.mp3'], check=True)
open(f'{D}/script.txt', 'w').write('\n'.join(s['text'] for s in segs if s['kind'] == 'voice') + '\n')
json.dump(segs, open(f'{D}/segments.json', 'w'), ensure_ascii=False, indent=1)
print('total', round(t / 60, 2), 'min', sum(1 for s in segs if s['kind'] == 'voice'), 'paragraphs')
