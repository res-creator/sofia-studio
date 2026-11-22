# Озвучка сценария клоном голоса Todd (fish.audio, бесплатная модель s2.1-pro-free, образец ref_todd.mp3).
# python3 make_clone_vo.py <папка_с_SCRIPT.md>  -> <папка>/vo_clone/vo.mp3, segments.json
# Кэш: абзац -> mp3 по хэшу; запросы по одному, пауза 1 с. Ключ подставляет прокси сессии.
import hashlib, json, os, re, subprocess, sys, time, ormsgpack
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.abspath(sys.argv[1]); O = f'{J}/vo_clone'; os.makedirs(f'{O}/c', exist_ok=True)
REF = open(f'{D}/ref_todd.mp3', 'rb').read(); RT = open(f'{D}/ref_todd.txt', encoding='utf8').read().strip()
L = open(f'{J}/SCRIPT.md', encoding='utf8').read().split('## ТАБЛИЦА ФАКТОВ')[0].splitlines()
start = next(i for i, l in enumerate(L) if l.startswith('## ХОЛОДНЫЙ СТАРТ')); items = []
for l in L[start:]:
    t = l.strip()
    if t.startswith('## '): items.append(dict(kind='chapter', title=t[3:])); continue
    if not t or t.startswith(('---', '#', '|')): continue
    tags = re.findall(r'\[([a-z ]+)\]', t); txt = re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip()
    if txt: items.append(dict(kind='voice', text=txt, tags=tags))
def tts(text, out):
    body = ormsgpack.packb(dict(text=text, references=[dict(audio=REF, text=RT)], format='mp3', mp3_bitrate=192, normalize=True, temperature=0.6, top_p=0.8))
    for a in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '300', '-o', out + '.part', '-w', '%{http_code}', '-X', 'POST', 'https://api.fish.audio/v1/tts', '-H', 'Authorization: Bearer proxy', '-H', 'Content-Type: application/msgpack', '-H', 'model: s2.1-pro-free', '--data-binary', '@-'], input=body, capture_output=True).stdout.decode()
        time.sleep(1)
        if r == '200' and os.path.getsize(out + '.part') > 3000: os.replace(out + '.part', out); return
        print('ERR', r, flush=True); time.sleep(8)
    sys.exit(1)
FX = 'highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,alimiter=limit=0.9'
dur = lambda p: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
seq, t, segs = [], 0.0, []
def sil(s):
    global t; seq.append(s); t += s
k = 0
for it in items:
    if it['kind'] == 'chapter':
        if segs: sil(1.6)
        segs.append(dict(kind='chapter', t=round(t, 2), title=it['title'])); sil(1.0); continue
    k += 1; h = hashlib.md5(it['text'].encode()).hexdigest()[:10]; raw = f'{O}/c/{h}.mp3'; wav = f'{O}/c/{h}.wav'
    if not os.path.exists(raw): tts(it['text'], raw); print(k, len(it['text']), flush=True)
    if not os.path.exists(wav): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', FX, '-ar', '48000', '-ac', '1', wav], check=True)
    d = dur(wav); segs.append(dict(kind='voice', t=round(t, 2), dur=round(d, 2), text=it['text'])); seq.append(wav); t += d
    gap = 0.55 + (0.8 if 'pause' in it['tags'] else 0) + (5.0 if 'Я подожду' in it['text'] else 0); sil(gap)
lst = f'{O}/concat.txt'
with open(lst, 'w') as f:
    for s in seq:
        if isinstance(s, str): f.write(f"file '{s}'\n")
        else:
            sp = f'{O}/c/sil_{int(s*1000)}.wav'
            if not os.path.exists(sp): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', str(s), sp], check=True)
            f.write(f"file '{sp}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '48000', '-b:a', '192k', f'{O}/vo.mp3'], check=True)
json.dump(segs, open(f'{O}/segments.json', 'w'), ensure_ascii=False, indent=1)
print('total', round(t / 60, 2), 'min', sum(1 for s in segs if s['kind'] == 'voice'), 'paragraphs')
