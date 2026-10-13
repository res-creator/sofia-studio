"""Split one ElevenLabs narrator take (8 lines separated by 2 s breaks) into eps/{EPN}/vo/<id>.wav + words.json"""
import json, os, re, sys, subprocess, numpy as np, soundfile as sf
from episodes_v2 import EP
SR = 48000
EPN = sys.argv[1]
ids = [l[0] for l in EP[EPN]["lines"] if l[1] == "nar"]
os.makedirs(f"eps/{EPN}/vo", exist_ok=True)
txt = {l[0]: l[2] for l in EP[EPN]["lines"]}
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f"eps/{EPN}/nar_all.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
y = np.frombuffer(raw, np.float32).copy(); hop = SR // 100
e = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y) - hop, hop)])
def silences(env, thr, minlen):
    q = env < thr; out = []; i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            out.append((i, j)); i = j
        else: i += 1
    return [(a, b) for a, b in out if b - a >= minlen]
big = sorted(silences(e, e.max() * 0.02, 120), key=lambda r: r[0] - r[1])[:len(ids) - 1]
cuts = sorted((a + b) // 2 * hop for a, b in big)
edges = [0] + cuts + [len(y)]
for k, lid in enumerate(ids):
    seg = y[edges[k]:edges[k + 1]]
    env = np.abs(seg); nz = np.where(env > env.max() * 0.02)[0]
    s0 = max(0, nz[0] - int(0.04 * SR)); s1 = min(len(seg), nz[-1] + int(0.15 * SR)); seg = seg[s0:s1]
    seg = seg / (np.abs(seg).max() + 1e-9) * 0.89
    sf.write(f"eps/{EPN}/vo/{lid}.wav", seg.astype(np.float32), SR)
    # ---- word timings: phrases (ending in punctuation) mapped onto inner pauses
    ee = np.array([np.sqrt(np.mean(seg[i:i + hop] ** 2)) for i in range(0, len(seg) - hop, hop)])
    pauses = [((a + b) / 2 / 100, (b - a) / 100, a / 100, b / 100) for a, b in silences(ee, ee.max() * 0.04, 12) if a > 5 and b < len(ee) - 5]
    words = txt[lid].split()
    W = lambda w: len(re.sub(r"[^\w']", "", w)) + 1.2
    phr = []; cur = []
    for w in words:
        cur.append(w)
        if re.search(r"[.!?:,]»?$", w): phr.append(cur); cur = []
    if cur: phr.append(cur)
    D = len(seg) / SR - 0.15; tot = sum(W(w) for w in words)
    exp = np.cumsum([sum(W(w) for w in p) for p in phr])[:-1] / tot * D   # expected phrase boundaries
    chosen = []
    for x in exp:   # nearest unused pause (prefer long ones)
        best = min((abs(p[0] - x) - 0.4 * p[1], p) for p in pauses if p not in chosen and abs(p[0] - x) < 1.2) if any(abs(p[0] - x) < 1.2 and p not in chosen for p in pauses) else None
        chosen.append(best[1] if best else None)
    bounds = []  # (start, end) per phrase
    t0 = 0.0
    for i, p in enumerate(phr):
        if i < len(chosen) and chosen[i] is not None: t1, nx = chosen[i][2], chosen[i][3]
        elif i < len(exp): t1 = nx = exp[i]
        else: t1 = nx = D
        bounds.append((t0, max(t0 + 0.2, t1))); t0 = nx
    out = []
    for p, (a, b) in zip(phr, bounds):
        tw = sum(W(w) for w in p); c = a
        for w in p: d = (b - a) * W(w) / tw; out.append([w, round(c, 3), round(c + d, 3)]); c += d
    json.dump(out, open(f"eps/{EPN}/vo/{lid}.words.json", "w"), ensure_ascii=False)
    print(lid, round(len(seg) / SR, 2), "phrases", len(phr), "pauses matched", sum(x is not None for x in chosen), "/", len(chosen))
