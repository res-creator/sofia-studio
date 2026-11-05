# Voice from Fish Audio (owner's choice, Nov 2026). Default voice: "Ethan" by Fish Official (educational / documentary narrator, male, American English).
# Key ONLY via the environment variable FISH_API_KEY (never in code, git or chat). One request at a time, 3 s apart.
# Fish returns audio without word timings, so every line is force-aligned locally (faster-whisper word timestamps matched to the script words)
# and saved as an ElevenLabs-style <id>.align.json — the animation engine re-times every scene from it.
# Previous files are moved to vo_prev/. Then run: sh build_all.sh
# Usage: FISH_API_KEY=... <venv>/bin/python vo_fish.py [--voice <reference_id>] [--align-only] [chapter ...]
import json, os, sys, time, shutil, subprocess, difflib, re, urllib.request
D = os.path.dirname(os.path.abspath(__file__))
ETHAN = '536d3a5e000945adb7038665781a4aca'          # Fish Official "Ethan" (alternative: Adrian bf322df2096a46f18c579d0baa36f41d)
args = sys.argv[1:]; voice = ETHAN; align_only = False
if '--voice' in args: i = args.index('--voice'); voice = args[i + 1]; del args[i:i + 2]
if '--align-only' in args: args.remove('--align-only'); align_only = True
chs = args or sorted(os.listdir(f'{D}/chapters'))
KEY = os.environ.get('FISH_API_KEY', '').strip()
if not align_only and not KEY: raise SystemExit('Set FISH_API_KEY in the environment (cloud: environment settings -> secrets).')

def tts(text):
    body = json.dumps({'text': text, 'reference_id': voice, 'format': 'mp3', 'mp3_bitrate': 192, 'normalize': True, 'latency': 'normal',
                       'prosody': {'speed': 1.0, 'volume': 0}}).encode()
    req = urllib.request.Request('https://api.fish.audio/v1/tts', data=body, method='POST',
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json', 'model': 's1'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r: return r.read()
        except Exception as e:
            if attempt == 3: raise
            print('retry', e, flush=True); time.sleep(2 ** (attempt + 1))

_W = None
def align(mp3, text):
    """faster-whisper word timestamps -> script words (difflib) -> char-level timings like ElevenLabs."""
    global _W
    if _W is None:
        from faster_whisper import WhisperModel; _W = WhisperModel('base.en', device='cpu', compute_type='int8')
    import numpy as np
    pcm = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
    segs, _ = _W.transcribe(pcm, word_timestamps=True, language='en', beam_size=5)
    hw = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    key = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
    sw = text.split(); A = [key(w) for w in sw]; B = [key(w[0]) for w in hw]
    T0 = [None] * len(sw); T1 = [None] * len(sw)
    for a0, b0, n in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(n): T0[a0 + k], T1[a0 + k] = hw[b0 + k][1], hw[b0 + k][2]
    # fill words whisper wrote differently (numbers: "1886" vs "eighteen eighty-six") by interpolating between known neighbours
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
    i = 0
    while i < len(sw):
        if T0[i] is None:
            j = i
            while j < len(sw) and T0[j] is None: j += 1
            a = T1[i - 1] if i > 0 else 0.0; b = T0[j] if j < len(sw) else dur
            tot = sum(len(w) for w in sw[i:j]) or 1; t = a
            for k in range(i, j): d = (b - a) * len(sw[k]) / tot; T0[k], T1[k] = t, t + d; t += d
            i = j
        else: i += 1
    chars, c0, c1 = [], [], []
    for k, w in enumerate(sw):
        for m, ch in enumerate(w): chars.append(ch); c0.append(T0[k] + (T1[k] - T0[k]) * m / len(w)); c1.append(T0[k] + (T1[k] - T0[k]) * (m + 1) / len(w))
        if k < len(sw) - 1: chars.append(' '); c0.append(T1[k]); c1.append(T1[k])
    return {'characters': chars, 'character_start_times_seconds': c0, 'character_end_times_seconds': c1}

for ch in chs:
    cd = f'{D}/chapters/{ch}'
    for L in json.load(open(f'{cd}/script.json')):
        out = f"{cd}/vo/{L['id']}.mp3"
        if not align_only:
            mark = out + '.fish'
            if os.path.exists(mark): continue
            audio = tts(L['text'])
            os.makedirs(f'{cd}/vo_prev', exist_ok=True)
            for ext in ('.mp3', '.align.json'):
                p = out[:-4] + ext
                if os.path.exists(p): shutil.move(p, f"{cd}/vo_prev/{L['id']}{ext}")
            open(out, 'wb').write(audio); open(mark, 'w').close(); time.sleep(3)
        json.dump(align(out, L['text']), open(out[:-4] + '.align.json', 'w'))
        print(ch, L['id'], 'ok', flush=True)
    subprocess.run([sys.executable, f'{D}/speech.py', ch], check=True)
