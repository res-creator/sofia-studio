#!/usr/bin/env python3
"""Lay true-size outlines inside a bigger true-size outline (4 × France in DR Congo; USA, China, India in Africa).
Raster search (5 km/px): each piece, largest first, tries rotations and positions; score = piece area outside the
target + overlap with pieces already laid (both weighted), a small penalty for rotation. Writes scenes/pack.json
{name: [{piece, rot, dx, dy, out_pct, ovl_pct}]} — rot in degrees about the piece's own origin, dx/dy in km in the
target's frame.
    python3 tools/pack.py <film dir>"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
D = sys.argv[1]; G = json.load(open(os.path.join(D, 'scenes', 'geo.json')))
RES = 6.0

def rot(rings, a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    return [[[x * c - y * s, x * s + y * c] for x, y in r] for r in rings]
def raster(rings, box):
    x0, y0, x1, y1 = box; W, H = int((x1 - x0) / RES) + 1, int((y1 - y0) / RES) + 1
    im = Image.new('L', (W, H)); d = ImageDraw.Draw(im)
    for r in rings: d.polygon([((x - x0) / RES, (y - y0) / RES) for x, y in r], fill=1)
    return np.asarray(im, bool)
def bbox(rings):
    xs = [p[0] for r in rings for p in r]; ys = [p[1] for r in rings for p in r]; return min(xs), min(ys), max(xs), max(ys)

def pack(target, pieces, rots, step=60, wout=3.0, wovl=4.0, wrot=.002, margin=1500):
    T = G[target]['rings']; bx = bbox(T); big = (bx[0] - margin, bx[1] - margin, bx[2] + margin, bx[3] + margin)
    tm = raster(T, big); occ = np.zeros_like(tm); out = []
    for name in pieces:
        best = None
        for a in rots:
            P = rot(G[name]['rings'], a); pb = bbox(P)
            pm = raster(P, pb); ph, pw = pm.shape; n = pm.sum()
            for dx in np.arange(bx[0] - pb[0] - 300, bx[2] - pb[2] + 300, step):
                for dy in np.arange(bx[1] - pb[1] - 300, bx[3] - pb[3] + 300, step):
                    ix, iy = int((pb[0] + dx - big[0]) / RES), int((pb[1] + dy - big[1]) / RES)
                    if ix < 0 or iy < 0 or ix + pw > tm.shape[1] or iy + ph > tm.shape[0]: continue
                    win_t = tm[iy:iy + ph, ix:ix + pw]; win_o = occ[iy:iy + ph, ix:ix + pw]
                    o = (pm & ~win_t).sum() / n; v = (pm & win_o).sum() / n
                    sc = wout * o + wovl * v + wrot * abs(a)
                    if best is None or sc < best[0]: best = (sc, a, float(dx), float(dy), o, v, ix, iy, pm)
        sc, a, dx, dy, o, v, ix, iy, pm = best
        occ[iy:iy + pm.shape[0], ix:ix + pm.shape[1]] |= pm
        out.append(dict(piece=name, rot=a, dx=round(dx, 1), dy=round(dy, 1), out_pct=round(100 * o, 1), ovl_pct=round(100 * v, 1)))
        print(target, out[-1], flush=True)
    cov = (occ & tm).sum() / tm.sum(); print(target, 'covered', round(100 * cov, 1), '%')
    return out

R = {}
R['congo4'] = pack('congo', ['france'] * 4, list(range(-180, 180, 15)), step=40)
R['africa3'] = pack('africa', ['china', 'us48', 'india', 'alaska'], list(range(-45, 46, 15)), step=100)
json.dump(R, open(os.path.join(D, 'scenes', 'pack.json'), 'w'), indent=1)
