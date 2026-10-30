"""python3 short/pauses.py <slug> -> pauses (>=0.16 s) inside every narrator / tip clip, to cut whole sentences cleanly"""
import json, sys, numpy as np, soundfile as sf
slug = sys.argv[1]; TL = json.load(open(f"eps/{slug}/timeline.json"))
for s in TL["speech"]:
    if s["who"] not in ("nar",): continue
    x, sr = sf.read(f"eps/{slug}/vo/{s['id']}.wav"); hop = sr // 100
    e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]); thr = e.max() * 0.03
    q = e < thr; out = []; i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if j - i >= 16: out.append((round(i / 100, 2), round(j / 100, 2)))
            i = j
        else: i += 1
    print(f"{s['id']:9s} dur={len(x)/sr:5.2f} text={s['text'][:70]!r}\n          pauses={out}")
