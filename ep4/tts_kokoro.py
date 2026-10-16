# Placeholder voices (local Kokoro) for Ep4. Final episode should use ElevenLabs (el.py).
# python3 ep4/tts_kokoro.py [lines.json]  -> ep4/vo/<id>.wav + ep4/vo/vo.json (skips lines already generated)
import json, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
D = 'ep4'; LJ = sys.argv[1] if len(sys.argv) > 1 else f'{D}/lines.json'
VO = {'gus': ('bm_george', 0.88, 'en-gb'), 'rose': ('bf_emma', 0.86, 'en-gb'), 'sofia': ('af_heart', 0.9, 'en-us'),
      'tom': ('am_puck', 0.9, 'en-us'), 'dan': ('am_onyx', 0.88, 'en-us'), 'phone': ('af_nicole', 0.95, 'en-us')}
k = Kokoro('/home/claude/tts/kokoro.onnx', '/home/claude/tts/voices.bin')
P = f'{D}/vo/vo.json'; out = json.load(open(P)) if os.path.exists(P) else {}
for lid, who, text in json.load(open(LJ)):
    if lid in out and out[lid]['text'] == text and os.path.exists(f'{D}/vo/{lid}.wav'): continue
    v, sp, lang = VO[who]
    a, sr = k.create(text, voice=v, speed=sp, lang=lang)
    a = np.asarray(a, dtype=np.float32)
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 600): nz[-1] + 1200]
    if who == 'phone':  # telephone band
        import scipy.signal as sg; b_, a_ = sg.butter(2, [400 / (sr / 2), 3200 / (sr / 2)], 'band'); a = sg.lfilter(b_, a_, a).astype(np.float32)
    sf.write(f'{D}/vo/{lid}.wav', a, sr)
    hop = sr // 30; env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
    m = max(env) or 1; out[lid] = {'who': who, 'text': text, 'dur': len(a) / sr, 'env': [round(e / m, 3) for e in env]}
    print(lid, round(len(a) / sr, 2), flush=True)
json.dump(out, open(P, 'w'))
