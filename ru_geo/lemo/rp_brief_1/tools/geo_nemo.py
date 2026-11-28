#!/usr/bin/env python3
"""Coastlines around Point Nemo for the board map, from open boundary data /tmp/world.geo.json (johan/world.geo.json,
public domain, Natural Earth 1:110m). Projection: spherical AZIMUTHAL EQUIDISTANT centred on Point Nemo
(48°52.6' S, 123°23.6' W), so every distance FROM THE POINT is true (a ring of radius r km = all points r km away).
Rings are clipped to RMAX km from the point (the clipped edge is not drawn) and simplified (Douglas–Peucker).
    python3 -I tools/geo_nemo.py <film dir>  →  scenes/geo.json {name: {segs: [[[x_km, y_km], …]], ...}, 'dmin': km}
    (x east, y SOUTH — board orientation; origin = the point)
"""
import json, math, os, sys
D = sys.argv[1]; R = 6371.0088; RMAX = 5300
LAT0, LON0 = -48.8767, -123.3933
F = json.load(open('/tmp/world.geo.json'))['features']
p0, l0 = math.radians(LAT0), math.radians(LON0)
def aeqd(lon, lat):
    p, l = math.radians(lat), math.radians(lon)
    cc = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0); cc = max(-1, min(1, cc))
    c = math.acos(cc); k = c / math.sin(c) if c > 1e-9 else 1
    return [R * k * math.cos(p) * math.sin(l - l0), -R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))]
def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy); best, bi = -1, 0
    for i in range(1, len(P) - 1):
        q = P[i]; d = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / L if L else math.hypot(q[0] - a[0], q[1] - a[1])
        if d > best: best, bi = d, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)
def densify(r, step=30):
    out = []
    for i in range(len(r) - 1):
        a, b = r[i], r[i + 1]; n = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) / step))
        out += [[a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n] for j in range(n)]
    return out + [r[-1]]
G = {}; dmin = (1e9, None)
for f in F:
    g = f['geometry']; pls = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    name = f['properties']['name']; segs = []
    for pg in pls:
        ll = pg[0]
        # densify in lon/lat so the projection bends long edges (Antarctica) correctly
        dl = []
        for i in range(len(ll) - 1):
            a, b = ll[i], ll[i + 1]; n = max(1, int(max(abs(b[0] - a[0]), abs(b[1] - a[1])) / .5))
            dl += [[a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n] for j in range(n)]
        dl.append(ll[-1])
        P = [aeqd(*q) for q in dl]
        for q, l in zip(P, dl):
            d = math.hypot(*q)
            if d < dmin[0]: dmin = (d, name, l)
        cur = []
        for q, l in zip(P, dl):
            if math.hypot(*q) <= RMAX and l[1] > -80 and abs(l[0]) < 179.9: cur.append(q)
            else:
                if len(cur) > 1: segs.append(cur)
                cur = []
        if len(cur) > 1: segs.append(cur)
    # Antarctica's ring closes along the dateline and the pole: vertices south of 80° S or on ±180° are left out (no coast there in this sector)
    segs = [[[round(x, 1), round(y, 1)] for x, y in dp(s, 12)] for s in segs if len(s) > 2]
    if segs: G[name] = dict(segs=segs)
for k, v in G.items(): print(k, len(v['segs']), sum(len(s) for s in v['segs']), 'min km', round(min(math.hypot(*p) for s in v['segs'] for p in s)))
print('nearest data vertex', dmin)
json.dump(dict(shapes=G, dmin=round(dmin[0]), centre=[LAT0, LON0], rmax=RMAX), open(os.path.join(D, 'scenes', 'geo.json'), 'w'), separators=(',', ':'))
