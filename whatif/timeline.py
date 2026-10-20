# Lay out a What-if episode by real voice length: python3 whatif/timeline.py whatif/jupiter
# Each line is one shot: [PRE] + voice + pad (gag beat). Writes <ep>/timeline.json (scenes, lines with words + mouth envelope).
import sys, json, subprocess, os, re
import numpy as np, soundfile as sf
ep = sys.argv[1]; FPS = 30; PRE = 0.12
lines = json.loads(subprocess.check_output(['node', '-e', f"console.log(JSON.stringify(require('./{ep}/script.js')))"]))
pads = json.load(open(f'{ep}/pads.json')) if os.path.exists(f'{ep}/pads.json') else {}
t = 0.0; L = []; S = []
for i, sc, text in lines:
    a, sr = sf.read(f'{ep}/vo/{i}.wav'); a = a if a.ndim == 1 else a.mean(1)
    dur = len(a) / sr; hop = sr // FPS
    rms = np.array([np.sqrt(np.mean(a[k:k + hop] ** 2)) for k in range(0, len(a), hop)])
    env = np.clip(rms / (np.percentile(rms, 95) + 1e-9), 0, 1)
    voiced = np.where(env > 0.12)[0]; v0, v1 = (voiced[0] / FPS, (voiced[-1] + 1) / FPS) if len(voiced) else (0, dur)
    # approximate word timing: weight = letters + pause bonus after punctuation
    toks = text.split(); w = [len(re.sub(r'\W', '', x)) + 1.5 + (3 if re.search(r'[.,!?:]$', x) else 0) for x in toks]
    tot = sum(w); acc = 0; words = []
    for x, ww in zip(toks, w):
        a0 = v0 + (v1 - v0) * acc / tot; acc += ww; a1 = v0 + (v1 - v0) * acc / tot
        words.append({'w': x, 't0': round(t + PRE + a0, 3), 't1': round(t + PRE + a1, 3)})
    t0 = t; t1 = t + PRE + dur + pads.get(sc, 0.35)
    L.append({'id': i, 'scene': sc, 'text': text, 't0': round(t + PRE, 3), 't1': round(t + PRE + dur, 3), 'env': [round(float(e), 3) for e in env], 'words': words})
    S.append({'id': sc, 't0': round(t0, 3), 't1': round(t1, 3), 'line': i})
    t = t1
json.dump({'fps': FPS, 'T': round(t, 3), 'scenes': S, 'lines': L}, open(f'{ep}/timeline.json', 'w'))
print('total', round(t, 2), 's')
