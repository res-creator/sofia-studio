"""python3 tighten_vo.py <ep> -> trims silent tails and shortens long inner pauses in eps/<ep>/vo/*.wav (voices are NOT sped up).
EN lines: inner pauses > 0.32 s -> 0.28 s; narrator: > 0.55 s -> 0.45 s; tail after the last loud frame -> 0.15 s. Word timings follow."""
import json, sys, os, numpy as np, soundfile as sf
from episodes_v2 import EP
ep = sys.argv[1]; vo = f"eps/{ep}/vo"
for lid, who, text, ru in EP[ep]["lines"]:
    p = f"{vo}/{lid}.wav"
    if not os.path.exists(p): continue
    x, sr = sf.read(p); hop = sr // 100
    e = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)]); q = e < e.max() * 0.03
    runs, k = [], 0
    while k < len(q):
        if q[k]:
            j = k
            while j < len(q) and q[j]: j += 1
            runs.append((k, j)); k = j
        else: k += 1
    mx, keep = (55, 45) if who == "nar" else (32, 28)
    cuts = [(a + keep // 2, b - keep // 2) for a, b in runs if a > 3 and b < len(q) - 3 and b - a > mx]
    if runs and runs[-1][1] >= len(q) - 1 and len(q) - runs[-1][0] > 18: cuts.append((runs[-1][0] + 15, len(q) + 50))
    if not cuts: continue
    keepm = np.ones(len(x), bool)
    for a, b in cuts: keepm[a * hop: b * hop] = False
    y = x[keepm]; fade = int(0.01 * sr); y[-fade:] *= np.linspace(1, 0, fade)
    sf.write(p, y.astype(np.float32), sr)
    wp = f"{vo}/{lid}.words.json"
    if os.path.exists(wp):
        def shift(tt): return tt - sum(min(max(tt - a / 100, 0), (b - a) / 100) for a, b in cuts)
        w = [[s, round(shift(a), 3), round(shift(b), 3)] for s, a, b in json.load(open(wp))]
        json.dump(w, open(wp, "w"), ensure_ascii=False)
    print(lid, round(len(x) / sr, 2), "->", round(len(y) / sr, 2))
