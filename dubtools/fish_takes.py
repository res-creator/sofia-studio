#!/usr/bin/env python3
"""Fish Audio takes per paragraph — drop-in for kokoro_takes.py (owner's choice Nov 2026: Fish "Ethan", the Buckle Up Fish voice).
python3 fish_takes.py SCRIPT_EN.csv OUT_DIR [--voice REF_ID] [--model s2.1-pro-free] [--say FILE.json] [ids...]
--say: {"Word": "spoken spelling"} replacements for the TTS text only (Fish has no phoneme input), e.g. {"Tekong": "Teh-kong"}.
Auth: the cloud network secret for api.fish.audio (Bearer 'proxy') or FISH_API_KEY. Never put a key in code.
One request at a time, 3 s apart (Fish rule). Skips ids whose wav already exists. Writes OUT_DIR/<id>.wav (48 kHz, 24-bit), trimmed."""
import csv, re, sys, os, json, time, subprocess, urllib.request, numpy as np, soundfile as sf
a = sys.argv[1:]
def opt(n, d):
    if n in a: i = a.index(n); v = a[i + 1]; del a[i:i + 2]; return v
    return d
VOICE = opt('--voice', '536d3a5e000945adb7038665781a4aca'); MODEL = opt('--model', 's2.1-pro-free'); SAY = opt('--say', None)
REF = opt('--ref', None); REFTXT = opt('--ref-text', None); SPEED = float(opt('--speed', '1.0'))  # --ref audio + --ref-text file: instant clone (owner-authorized own voice), sent as msgpack
SAY = json.load(open(SAY, encoding='utf-8')) if SAY else {}
CSV, OUT = a[0], a[1]; os.makedirs(OUT, exist_ok=True)
KEY = os.environ.get('FISH_API_KEY', '').strip() or 'proxy'
rows = list(csv.DictReader(open(CSV, encoding='utf-8'))); ids = a[2:] or [r['id'] for r in rows]; by = {r['id']: r for r in rows}

if REF:
    import msgpack
    REFA = open(REF, 'rb').read(); REFT = open(REFTXT, encoding='utf-8').read().strip()
def tts(text):
    d = {'text': text, 'format': 'mp3', 'mp3_bitrate': 192, 'normalize': True, 'latency': 'normal'}
    if SPEED != 1.0: d['prosody'] = {'speed': SPEED, 'volume': 0}
    if REF: d['references'] = [{'audio': REFA, 'text': REFT}]; body = msgpack.packb(d); ctype = 'application/msgpack'
    else: d['reference_id'] = VOICE; body = json.dumps(d).encode(); ctype = 'application/json'
    for att in range(5):
        req = urllib.request.Request('https://api.fish.audio/v1/tts', data=body, method='POST',
                                     headers={'Authorization': f'Bearer {KEY}', 'Content-Type': ctype, 'model': MODEL})
        try:
            with urllib.request.urlopen(req, timeout=240) as r: return r.read()
        except Exception as e:
            msg = getattr(e, 'read', lambda: b'')()[:200]
            print('retry', att, e, msg, flush=True); time.sleep(5 * (att + 1))
    raise SystemExit('fish failed')

for pid in ids:
    out = os.path.join(OUT, pid + '.wav')
    if os.path.exists(out): continue
    t = re.sub(r'\[[^\]]*\]\s*', '', by[pid]['english_narration']).strip()
    for w, s in SAY.items(): t = re.sub(r'\b%s\b' % re.escape(w), s, t)
    mp3 = tts(t); tmp = out + '.mp3'; open(tmp, 'wb').write(mp3)
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', tmp, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.float32).copy(); os.remove(tmp)
    i = np.where(np.abs(x) > 0.004 * np.abs(x).max())[0]; x = x[max(0, i[0] - 1440):i[-1] + 5760]
    f = int(0.012 * 48000); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    sf.write(out, x / np.abs(x).max() * 0.89, 48000, subtype='PCM_24')
    print('%s %5.2f / %s' % (pid, len(x) / 48000, by[pid]['max_duration_s']), flush=True)
    time.sleep(3)
print('done', len(ids))
