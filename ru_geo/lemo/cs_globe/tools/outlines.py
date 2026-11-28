"""Outlines for the globe clip: Greenland, Africa, and 14 copies of Greenland's true-size outline packed inside Africa.
Source: johan/world.geo.json countries.geo.json (public domain), raw/countries.geo.json.
Equal-area throughout: every shape is handled in a spherical Lambert azimuthal equal-area (LAEA) projection, R = 6371 km.
Greenland is projected about its own centre (true shape and area there), then each copy is only translated and rotated
in Africa's LAEA plane (area kept exactly) and projected back to lat/lon for the globe.
The 14 copies are placed by simulated annealing: least area outside Africa + least overlap between copies. A perfect
tiling is impossible for an irregular shape, so the script reports how much of Africa the 14 copies cover and how much they overlap.
usage: python -I <clip>/tools/outlines.py <clip>   (needs numpy, shapely) -> assets/outlines.json
"""
import sys, os, json, math, random
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import unary_union
from shapely import affinity

D = sys.argv[1]
R = 6371.0
src = os.path.join(D, 'raw', 'countries.geo.json')
gj = json.load(open(src))
AF = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad',
      'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia',
      'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
      'Malawi', 'Mali', 'Mauritania', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Sierra Leone',
      'Somalia', 'Somaliland', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'United Republic of Tanzania', 'Togo', 'Tunisia',
      'Uganda', 'Western Sahara', 'Zambia', 'Zimbabwe']
feats = {f['properties']['name']: shape(f['geometry']) for f in gj['features']}
missing = [n for n in AF if n not in feats]
assert not missing, missing


def laea(lon, lat, lon0, lat0):
    l, p, l0, p0 = map(np.radians, (lon, lat, lon0, lat0))
    k = np.sqrt(2 / (1 + np.sin(p0) * np.sin(p) + np.cos(p0) * np.cos(p) * np.cos(l - l0)))
    return R * k * np.cos(p) * np.sin(l - l0), R * k * (np.cos(p0) * np.sin(p) - np.sin(p0) * np.cos(p) * np.cos(l - l0))


def ilaea(x, y, lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    rho = np.hypot(x, y); c = 2 * np.arcsin(np.clip(rho / (2 * R), -1, 1))
    rho = np.where(rho == 0, 1e-9, rho)
    lat = np.arcsin(np.cos(c) * np.sin(p0) + y * np.sin(c) * np.cos(p0) / rho)
    lon = l0 + np.arctan2(x * np.sin(c), rho * np.cos(p0) * np.cos(c) - y * np.sin(p0) * np.sin(c))
    return np.degrees(lon), np.degrees(lat)


def proj(poly, lon0, lat0):
    def ring(r):
        a = np.asarray(r.coords); x, y = laea(a[:, 0], a[:, 1], lon0, lat0); return np.c_[x, y]
    return Polygon(ring(poly.exterior), [ring(i) for i in poly.interiors])


def parts(g): return list(g.geoms) if isinstance(g, MultiPolygon) else [g]


# Greenland about its own centre
GL = feats['Greenland']; GL = max(parts(GL), key=lambda p: p.area)
gc = GL.centroid; G0 = (gc.x, gc.y)
Gp = proj(GL, *G0); Gp = affinity.translate(Gp, -Gp.centroid.x, -Gp.centroid.y)
# Africa about its own centre
AF0 = (17.0, 2.0)
afr = unary_union([feats[n].buffer(0) for n in AF])
Ap_all = unary_union([proj(p, *AF0).buffer(0) for p in parts(afr)])
Ap_all = unary_union([p.buffer(1).buffer(-1) for p in parts(Ap_all)])   # close seams between neighbouring countries
Ap_parts = sorted(parts(Ap_all), key=lambda p: -p.area)
A_main = Ap_parts[0]
A_total = sum(p.area for p in Ap_parts)
print(f'Greenland {Gp.area/1e6:.3f} M km2 · Africa (all parts) {A_total/1e6:.2f} M km2 · mainland {A_main.area/1e6:.2f} · ratio {A_total/Gp.area:.2f} (mainland {A_main.area/Gp.area:.2f})')

# ---------- packing ----------
N = 14
Gs = Gp.simplify(15)
Am = A_main.simplify(15)
rng = random.Random(4)
# start: centres from k-means of points inside Africa (≈ equal-area cells)
pts = []
minx, miny, maxx, maxy = Am.bounds
from shapely.geometry import Point
from shapely.prepared import prep
pa = prep(Am)
while len(pts) < 4000:
    p = (rng.uniform(minx, maxx), rng.uniform(miny, maxy))
    if pa.contains(Point(p)): pts.append(p)
P = np.array(pts); C = P[rng.sample(range(len(P)), N)]
for _ in range(40):
    lab = ((P[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
    C = np.array([P[lab == k].mean(0) if (lab == k).any() else C[k] for k in range(N)])
state = [[c[0], c[1], rng.uniform(0, 360)] for c in C]


def place(s): return affinity.translate(affinity.rotate(Gs, s[2], origin=(0, 0)), s[0], s[1])


polys = [place(s) for s in state]
outA = [p.difference(Am).area for p in polys]
ov = np.zeros((N, N))
for i in range(N):
    for j in range(i + 1, N): ov[i, j] = ov[j, i] = polys[i].intersection(polys[j]).area
cost = lambda: sum(outA) * 1.0 + ov.sum() / 2
cur = cost(); best = (cur, [s[:] for s in state])
T0, ITER = 2.0e5, 26000
for it in range(ITER):
    T = T0 * (1 - it / ITER) ** 2 + 1e3
    i = rng.randrange(N); s = state[i][:]
    st = 260 * (1 - it / ITER) + 20
    s[0] += rng.gauss(0, st); s[1] += rng.gauss(0, st); s[2] += rng.gauss(0, 25 * (1 - it / ITER) + 3)
    p = place(s); o = p.difference(Am).area
    row = np.array([0 if j == i else p.intersection(polys[j]).area for j in range(N)])
    d = (o - outA[i]) + (row.sum() - ov[i].sum())
    if d < 0 or rng.random() < math.exp(-d / T):
        state[i] = s; polys[i] = p; outA[i] = o; ov[i] = row; ov[:, i] = row
        cur += d
        if cur < best[0]: best = (cur, [q[:] for q in state])
state = best[1]
full = [affinity.translate(affinity.rotate(Gp, s[2], origin=(0, 0)), s[0], s[1]) for s in state]
U = unary_union(full)
cov = U.intersection(A_main).area / A_main.area
olap = sum(p.area for p in full) - U.area
outside = U.difference(A_main).area
print(f'packing: union covers {cov*100:.1f}% of mainland Africa · overlap between copies {olap/1e6:.2f} M km2 '
      f'({olap/(N*Gp.area)*100:.1f}% of the 14 copies) · outside the coast {outside/1e6:.2f} M km2')

# reveal order: north to south, then west to east
order = sorted(range(N), key=lambda k: (-round(state[k][1] / 900), state[k][0]))


def back(poly, lon0, lat0, step=12):
    r = poly.exterior.segmentize(step) if hasattr(poly.exterior, 'segmentize') else poly.exterior
    a = np.asarray(r.coords); lo, la = ilaea(a[:, 0], a[:, 1], lon0, lat0)
    return [[round(float(y), 4), round(float(x), 4)] for x, y in zip(lo, la)]   # [lat, lon]


def ll_ring(poly):
    return [[round(c[1], 4), round(c[0], 4)] for c in poly.exterior.coords]


out = {
    'greenland': ll_ring(GL), 'greenland_center': [G0[1], G0[0]],
    'africa': [back(p.simplify(4), *AF0) for p in Ap_parts if p.area > 2e4],
    'copies': [{'ring': back(full[k], *AF0), 'center': [float(v) for v in ilaea(np.array(state[k][0]), np.array(state[k][1]), *AF0)][::-1], 'rot': state[k][2]} for k in order],
    'stats': {'greenland_km2': Gp.area, 'africa_km2': A_total, 'africa_mainland_km2': A_main.area, 'ratio': A_total / Gp.area,
              'coverage_mainland': cov, 'overlap_km2': olap, 'outside_km2': outside},
}
json.dump(out, open(os.path.join(D, 'assets', 'outlines.json'), 'w'))
print('outlines.json', len(out['greenland']), 'pts Greenland,', len(out['africa']), 'Africa parts,', N, 'copies')
