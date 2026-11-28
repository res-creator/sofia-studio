#!/usr/bin/env python3
"""Joint refinement of tools/pack.py: simulated annealing over all pieces at once (position + any rotation),
score = Σ area outside the target + Σ pairwise overlap (fractions of piece area). Starts from scenes/pack.json.
    python3 tools/anneal.py <film dir> <key> <target> <iters> <seed>"""
import json, math, os, sys, random
import numpy as np
from PIL import Image, ImageDraw
D, KEY, TGT, IT, SEED = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
G = json.load(open(os.path.join(D, 'scenes', 'geo.json'))); PK = json.load(open(os.path.join(D, 'scenes', 'pack.json')))
RES = 10.0
T = G[TGT]['rings']; xs = [p[0] for r in T for p in r]; ys = [p[1] for r in T for p in r]
B = (min(xs) - 1500, min(ys) - 1500, max(xs) + 1500, max(ys) + 1500); W, H = int((B[2] - B[0]) / RES), int((B[3] - B[1]) / RES)
def ras(rings, a, dx, dy):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a)); im = Image.new('L', (W, H)); d = ImageDraw.Draw(im)
    for r in rings: d.polygon([((x * c - y * s + dx - B[0]) / RES, (x * s + y * c + dy - B[1]) / RES) for x, y in r], fill=1)
    return np.asarray(im, bool)
tm = ras(T, 0, 0, 0)
S = [dict(p) for p in PK[KEY]]
M = [ras(G[p['piece']]['rings'], p['rot'], p['dx'], p['dy']) for p in S]; N = [m.sum() for m in M]
def score(M):
    o = sum((m & ~tm).sum() / n for m, n in zip(M, N)); v = 0
    for i in range(len(M)):
        for j in range(i + 1, len(M)): v += (M[i] & M[j]).sum() / min(N[i], N[j])
    return o + 1.3 * v
rnd = random.Random(SEED); cur = score(M); best = (cur, [dict(p) for p in S])
for it in range(IT):
    Tmp = .05 * (1 - it / IT) + 1e-4
    i = rnd.randrange(len(S)); p = dict(S[i]); k = rnd.random()
    sc = 1 - .8 * it / IT
    if k < .7: p['dx'] += rnd.gauss(0, 150 * sc); p['dy'] += rnd.gauss(0, 150 * sc)
    else: p['rot'] += rnd.gauss(0, 20 * sc)
    m2 = ras(G[p['piece']]['rings'], p['rot'], p['dx'], p['dy']); old = M[i]; M[i] = m2
    s2 = score(M)
    if s2 < cur or rnd.random() < math.exp((cur - s2) / Tmp): cur = s2; S[i] = p
    else: M[i] = old
    if cur < best[0]: best = (cur, [dict(q) for q in S])
S = best[1]; M = [ras(G[p['piece']]['rings'], p['rot'], p['dx'], p['dy']) for p in S]
for p, m, n in zip(S, M, N):
    p['out_pct'] = round(100 * (m & ~tm).sum() / n, 1); p['rot'] = round(p['rot'], 1); p['dx'] = round(p['dx'], 1); p['dy'] = round(p['dy'], 1)
ov = [round(100 * (M[i] & M[j]).sum() / min(N[i], N[j]), 1) for i in range(len(M)) for j in range(i + 1, len(M))]
print(KEY, 'score', round(best[0], 4), 'overlaps', ov); [print(p) for p in S]
json.dump(dict(score=best[0], pieces=S, overlaps=ov), open(os.path.join(D, 'scenes', f'anneal_{KEY}_{SEED}.json'), 'w'), indent=1)
