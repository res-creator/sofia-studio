# Placeholder voices (local Kokoro) for the scene-3 style test. Final episode uses ElevenLabs (el.py).
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
D = sys.argv[1] if len(sys.argv) > 1 else 'ep4'
VO = {'gus': ('bm_george', 0.88), 'rose': ('bf_emma', 0.86)}
k = Kokoro('/home/claude/tts/kokoro.onnx', '/home/claude/tts/voices.bin')
out = {}
for lid, who, text in json.load(open(f'{D}/lines.json')):
    v, sp = VO[who]
    a, sr = k.create(text, voice=v, speed=sp, lang='en-gb')
    a = np.asarray(a, dtype=np.float32)
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 600): nz[-1] + 1200]
    sf.write(f'{D}/vo/{lid}.wav', a, sr)
    hop = sr // 30; env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) for i in range(0, len(a), hop)]
    m = max(env) or 1; out[lid] = {'who': who, 'text': text, 'dur': len(a) / sr, 'env': [round(e / m, 3) for e in env]}
    print(lid, round(len(a) / sr, 2))
json.dump(out, open(f'{D}/vo/vo.json', 'w'))
