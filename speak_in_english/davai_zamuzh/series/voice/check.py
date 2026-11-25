# transcribe + median f0 + duration for mp3s (faster-whisper small int8)
import sys, subprocess, numpy as np, soundfile as sf, io
from faster_whisper import WhisperModel
m = WhisperModel('small', compute_type='int8')
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ar', '16000', '-ac', '1', '-f', 'wav', '-'], capture_output=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float32')[0]
def f0(a, sr=16000):
    fr = []; n = 640
    for i in range(0, len(a) - n, n // 2):
        x = a[i:i + n]; 
        if np.sqrt((x ** 2).mean()) < .02: continue
        c = np.correlate(x, x, 'full')[n - 1:]; lo, hi = sr // 400, sr // 70; k = lo + np.argmax(c[lo:hi])
        if c[k] > .3 * c[0]: fr.append(sr / k)
    return np.median(fr) if fr else 0
lang = None
for p in sys.argv[1:]:
    if p.startswith('--lang='): lang = p[7:]; continue
    a = load(p); pad = np.concatenate([np.zeros(9600, 'float32'), a, np.zeros(9600, 'float32')])
    segs, info = m.transcribe(pad, language=lang, beam_size=5)
    print(f'{p.split("/")[-1]:18s} {len(a)/16000:5.2f}s f0={f0(a):5.0f}  {"".join(s.text for s in segs).strip()}', flush=True)
