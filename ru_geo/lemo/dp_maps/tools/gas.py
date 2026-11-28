"""Schematic spread of a dense gas layer from Lake Nyos down the real valleys (for the Nyos clip; drawn, not a simulation of 1986).

On the nyd height grid (assets/nyd_height.bin, ~50 m) a shortest-arrival search starts from the lake surface. The layer is
~10 m deep: from a cell it can only reach neighbours no more than 10 m above the lowest ground on its way so far
(initial level: lake surface + 45 m, so it spills over the lowest point of the crater rim), and it moves faster downhill.
Output assets/nyd_gas.png (grid size): R = arrival time 0..1 (of TMAX), G = layer strength (thins with distance and on
slopes; 0 where not reached), B = 255 on the lake.
Meta (lake level, reached box, flow paths [[row, col, arrival 0..1], ...] from the lake outward) in assets/nyd_gas.json.
usage: python3 -I <clip>/tools/gas.py <clip>
"""
import sys, os, json, heapq, math
import numpy as np
from PIL import Image
from scipy import ndimage

D = sys.argv[1]; A = os.path.join(D, 'assets')
m = json.load(open(os.path.join(A, 'nyd_meta.json'))); GW, GH = m['GW'], m['GH']; W, S, E, N = m['bbox']
h = np.fromfile(os.path.join(A, 'nyd_height.bin'), '<f4').reshape(GH, GW).astype(np.float64)
dy = (N - S) / (GH - 1) * 111.2e3; dx = (E - W) / (GW - 1) * 111.2e3 * math.cos(math.radians((N + S) / 2))
LAT, LON = 6.438, 10.298
ci, cj = int(round((N - LAT) / (N - S) * (GH - 1))), int(round((LON - W) / (E - W) * (GW - 1)))
# lake: the flat surface around the centre (within 1.3 km)
II, JJ = np.mgrid[0:GH, 0:GW]
near = np.hypot((II - ci) * dy, (JJ - cj) * dx) < 1300
lev = np.median(h[ci - 3:ci + 4, cj - 3:cj + 4])
flat = near & (np.abs(h - lev) < 9)
lab, _ = ndimage.label(flat); lake = lab == lab[ci, cj]
lake = ndimage.binary_closing(lake, iterations=2) & near
print('lake level', lev, 'cells', lake.sum(), 'area km2', lake.sum() * dx * dy / 1e6)

TH, LIFT0, MAXD = 10.0, 45.0, 13000.0
INF = 1e18
pred = np.full((GH, GW), -1, np.int64); arr = np.full((GH, GW), INF); floor = np.full((GH, GW), INF); dist = np.zeros((GH, GW))
pq = []
for i, j in zip(*np.nonzero(lake)):
    arr[i, j] = 0; floor[i, j] = lev + LIFT0; heapq.heappush(pq, (0.0, i, j))
nb = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
while pq:
    t, i, j = heapq.heappop(pq)
    if t > arr[i, j]: continue
    for di, dj in nb:
        a, b = i + di, j + dj
        if a < 0 or b < 0 or a >= GH or b >= GW: continue
        d = math.hypot(di * dy, dj * dx); dh = h[a, b] - h[i, j]
        fl = min(floor[i, j], h[i, j] + TH)
        if h[a, b] > fl: continue
        nd = dist[i, j] + d
        if nd > MAXD: continue
        slope = -dh / d
        sp = .35 + 6 * max(0., slope) - 2 * max(0., -slope)       # downhill fast, uphill slow
        nt = t + d / max(.08, sp)
        if nt < arr[a, b]:
            arr[a, b] = nt; pred[a, b] = i * GW + j; floor[a, b] = min(fl, h[a, b] + TH); dist[a, b] = nd; heapq.heappush(pq, (nt, a, b))
reach = arr < INF
TMAX = float(np.percentile(arr[reach], 99.5))
print('reached cells', reach.sum(), 'TMAX', TMAX, 'max dist m', dist[reach].max())
r = np.clip(arr / TMAX, 0, 1)
# strength: thick near the lake and in valley floors, thinner far away
valley = np.clip((ndimage.uniform_filter(h, 15) - h) / 40 + .5, 0, 1)
st = np.clip(1 - dist / MAXD, 0, 1) ** .6 * (.45 + .55 * valley)
st[lake] = 1
img = np.zeros((GH, GW, 3), np.uint8)          # RGB only (no alpha: browsers premultiply it and lose R where it is 0)
img[..., 0] = (np.where(reach, r, 1) * 255).astype(np.uint8)
img[..., 1] = np.clip(ndimage.gaussian_filter(np.where(reach, st, 0), 1.0) * 255, 0, 255).astype(np.uint8)   # 0 = not reached
img[..., 2] = (lake * 255).astype(np.uint8)
Image.fromarray(img, 'RGB').save(os.path.join(A, 'nyd_gas.png'))
# flow paths for the puffs that ride the front: from ~70 cells spread over the reach back to the lake (predecessors)
rng = np.random.default_rng(3); cand = np.argwhere(reach & ~lake & (r > .25) & (r < .97)); paths = []
for k in rng.choice(len(cand), 70, replace=False):
    i, j = cand[k]; P = []
    while i >= 0:
        P.append([int(i), int(j), round(float(r[i, j]), 4)]); q = pred[i, j]
        if q < 0: break
        i, j = divmod(int(q), GW)
    paths.append(P[::-1][::2])
ri, rj = np.nonzero(reach)
json.dump({'lake_level': float(lev), 'lake_cells': int(lake.sum()), 'i0': int(ri.min()), 'i1': int(ri.max()), 'j0': int(rj.min()), 'j1': int(rj.max()),
           'tmax': TMAX, 'paths': paths}, open(os.path.join(A, 'nyd_gas.json'), 'w'), indent=1)
