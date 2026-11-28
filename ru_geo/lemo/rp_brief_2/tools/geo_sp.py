#!/usr/bin/env python3
"""South Pacific coastlines around Point Nemo for the board map: /tmp/world.geo.json (johan/world.geo.json, Natural Earth
1:110m, public domain), AZIMUTHAL EQUIDISTANT projection centred on Point Nemo (48.877° S, 123.393° W), so every distance
from the point is true (the ≈ 2 690 km circle is a circle). Coasts clipped to the map frame, Douglas–Peucker 12 km.
    python3 -I tools/geo_sp.py <film dir>  →  scenes/geo_sp.json  {coasts: [[[x_km, y_km], …]], pts: {name: [x, y, dist_km]}}
    (x east, y SOUTH; origin = Point Nemo)"""
import json, math, os, sys
D = sys.argv[1]; R = 6371.0088; LON0, LAT0 = -123.393, -48.877
FR = (-4900, -3400, 5600, 3000)            # map frame in km (x0, y0, x1, y1)
def aeqd(lon, lat):
    p0, l0, p, l = math.radians(LAT0), math.radians(LON0), math.radians(lat), math.radians(lon)
    cc = max(-1, min(1, math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0))); c = math.acos(cc)
    k = c / math.sin(c) if c > 1e-9 else 1
    return [R * k * math.cos(p) * math.sin(l - l0), -R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0)), R * c]
def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy); best, bi = -1, 0
    for i in range(1, len(P) - 1):
        q = P[i]; d = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / L if L else math.hypot(q[0] - a[0], q[1] - a[1])
        if d > best: best, bi = d, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)
inside = lambda q: FR[0] <= q[0] <= FR[2] and FR[1] <= q[1] <= FR[3]
def cut(a, b):   # point where segment a(in)→b(out) leaves the frame
    t = 1
    for i, (lo, hi) in enumerate(((FR[0], FR[2]), (FR[1], FR[3]))):
        d = b[i] - a[i]
        if d > 0 and b[i] > hi: t = min(t, (hi - a[i]) / d)
        if d < 0 and b[i] < lo: t = min(t, (lo - a[i]) / d)
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
def clip(P):
    runs, cur = [], []
    for i, q in enumerate(P):
        if inside(q):
            if not cur and i: cur.append(cut(q, P[i - 1]))
            cur.append(q)
        elif cur: cur.append(cut(P[i - 1], q)); runs.append(cur); cur = []
    if cur: runs.append(cur)
    return runs
F = json.load(open('/tmp/world.geo.json'))['features']
coasts = []
for f in F:
    g = f['geometry']; pgs = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    for pg in pgs:
        r = pg[0]
        if f['id'] == 'ATA': r = [p for p in r if p[1] > -89.5]
        P = [aeqd(lon, lat)[:2] for lon, lat in r if abs(lon - LON0) < 179.9 or True]
        for run in clip(P):
            run = dp(run, 12)
            if len(run) >= 2 and sum(math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]) for i in range(1, len(run))) > 150:
                coasts.append([[round(x, 1), round(y, 1)] for x, y in run])
pts = {k: [round(v, 1) for v in aeqd(*ll)] for k, ll in dict(ducie=(-124.786, -24.680), motunui=(-109.4523, -27.2031), maher=(-126.367, -72.967),
                                                              p49=(-123.393, -48.877)).items()}
par = [aeqd(lon, -48.877)[:2] for lon in [LON0 + d for d in range(-70, 71, 2)]]
par = [[round(x, 1), round(y, 1)] for run in clip(par) for x, y in run]
json.dump(dict(frame=FR, coasts=coasts, pts=pts, parallel=par), open(os.path.join(D, 'scenes', 'geo_sp.json'), 'w'))
print(len(coasts), 'coast runs', pts)
