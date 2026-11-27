# тест улучшенной озвучки: предложения по отдельности, ударения, короткие управляемые паузы
# python3 voice_test.py <папка> <макс_символов> <выход.mp3>
import hashlib, json, os, re, subprocess, sys, time, ormsgpack
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.abspath(sys.argv[1]); MAXC = int(sys.argv[2]); OUT = sys.argv[3]
REF = open(f'{D}/ref_todd.mp3', 'rb').read(); RT = open(f'{D}/ref_todd.txt', encoding='utf8').read().strip()
A = '́'
STRESS = {'Вояджер': 'Воя' + A + 'джер', 'Вояджеру': 'Воя' + A + 'джеру', 'Вояджера': 'Воя' + A + 'джера', 'Вояджере': 'Воя' + A + 'джере', 'Проксимы': 'Прокси' + A + 'мы', 'Проксима': 'Прокси' + A + 'ма', 'радиосигнал': 'радиосигна' + A + 'л', 'Андромеды': 'Андроме' + A + 'ды', 'километров': 'киломе' + A + 'тров', 'километра': 'киломе' + A + 'тра', 'километры': 'киломе' + A + 'тры', 'световых': 'светов' + A + 'ых'}
def st(s):
    s = s.replace('«Вояджер-один»', '«Воя' + A + 'джер-оди' + A + 'н»').replace('Вояджер-один', 'Воя' + A + 'джер-оди' + A + 'н').replace('Вояджером', 'Воя' + A + 'джером')
    return re.sub(r'\b\w+\b', lambda m: STRESS.get(m.group(0), m.group(0)), s)
L = open(f'{J}/SCRIPT.md', encoding='utf8').read().split('## ТАБЛИЦА ФАКТОВ')[0].splitlines()
paras = []
for l in L:
    t = l.strip()
    if not t or t.startswith(('---', '#', '|', '>>')): continue
    t = re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip()
    if t: paras.append(t)
chosen, n = [], 0
for p in paras:
    if n + len(p) > MAXC and chosen: break
    chosen.append(p); n += len(p)
def tts(text, out):
    body = ormsgpack.packb(dict(text=text, references=[dict(audio=REF, text=RT)], format='mp3', mp3_bitrate=192, normalize=True, temperature=0.45, top_p=0.7))
    for a in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '300', '-o', out + '.part', '-w', '%{http_code}', '-X', 'POST', 'https://api.fish.audio/v1/tts', '-H', 'Authorization: Bearer proxy', '-H', 'Content-Type: application/msgpack', '-H', 'model: s2.1-pro-free', '--data-binary', '@-'], input=body, capture_output=True).stdout.decode()
        time.sleep(1)
        if r == '200' and os.path.getsize(out + '.part') > 3000: os.replace(out + '.part', out); return
        print('ERR', r, flush=True); time.sleep(8)
    sys.exit(1)
W = f'{os.path.dirname(OUT)}/vt'; os.makedirs(W, exist_ok=True)
FX = 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=2,alimiter=limit=0.9'
seq = []
def sil(s):
    p = f'{W}/sil_{int(s*1000)}.wav'
    if not os.path.exists(p): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', str(s), p], check=True)
    seq.append(p)
for p in chosen:
    sents = re.split(r'(?<=[.!?…])\s+(?=[«"А-ЯЁA-Z])', p)
    # короткие фразы склеиваем (минимум ~40 знаков), чтобы не рубить интонацию
    parts, buf = [], ''
    for s in sents:
        buf = (buf + ' ' + s).strip()
        if len(buf) >= 45: parts.append(buf); buf = ''
    if buf: parts.append(buf)
    for i, s in enumerate(parts):
        txt = st(s); h = hashlib.md5(txt.encode()).hexdigest()[:10]; raw = f'{W}/{h}.mp3'; wav = f'{W}/{h}.wav'
        if not os.path.exists(raw): tts(txt, raw); print(len(txt), flush=True)
        if not os.path.exists(wav): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', FX + ',silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=1:stop_duration=0.35:stop_threshold=-45dB', '-ar', '48000', '-ac', '1', wav], check=True)
        seq.append(wav); sil(0.28 if i < len(parts) - 1 else 0.6)
lst = f'{W}/list.txt'; open(lst, 'w').write(''.join(f"file '{s}'\n" for s in seq))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '44100', '-b:a', '160k', OUT], check=True)
print('ok', OUT, round(float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT], capture_output=True, text=True).stdout), 1), 'сек;', len(chosen), 'абзацев')
