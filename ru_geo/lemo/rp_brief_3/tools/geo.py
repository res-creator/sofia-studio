#!/usr/bin/env python3
"""Coastline maps for the board, from open boundary data /tmp/world.geo.json (johan/world.geo.json, public domain,
Natural Earth 1:110m). The world coastline = the edges that belong to exactly one country polygon (shared land borders
cancel). Every map is an AZIMUTHAL EQUIDISTANT projection centred on the place it is about, so a circle of radius d km
around the centre is exactly «d km from here» (the 1 000 km ring of the Arctic pole, the 2 600 km ring of the Eurasian
pole, the 1 700 km line from Bouvet). The lines are clipped to a circle or a rectangle (open polylines) and simplified
with Douglas–Peucker so the marker draws them stroke by stroke.
    python3 -I tools/geo.py <film dir>  →  scenes/geo.json  {map: {lines: [[[x_km, y_km], …]], pts: {name: [x, y]}, …}}
    (x east, y SOUTH — board orientation; origin = the projection centre)
"""
import json, math, os, sys
from collections import Counter, defaultdict
D = sys.argv[1]; SRC = '/tmp/world.geo.json'; R = 6371.0088
FEAT = json.load(open(SRC))['features']

def aeqd(lon0, lat0):
    p0, l0 = math.radians(lat0), math.radians(lon0)
    def f(lon, lat):
        p, l = math.radians(lat), math.radians(lon)
        cc = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        c = math.acos(max(-1, min(1, cc)))
        k = c / math.sin(c) if c > 1e-9 else 1
        return [R * k * math.cos(p) * math.sin(l - l0), -R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))]
    return f
def gc(a, b):   # great-circle km between (lon, lat) points
    l1, p1, l2, p2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    return R * math.acos(max(-1, min(1, math.sin(p1) * math.sin(p2) + math.cos(p1) * math.cos(p2) * math.cos(l1 - l2))))

def coast_rings(feats, eps=.2):
    """coast = polygon edges with land on one side only: points eps° to either side of each edge's midpoint are tested
    against all polygons (shared borders that do not match exactly at 1:110m still cancel). Runs of coast edges are kept
    as polylines; a ring that is coast all round stays closed."""
    polys = []
    for f in FEAT:
        g = f['geometry']; P = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for pg in P:
            r = pg[0]; xs = [p[0] for p in r]; ys = [p[1] for p in r]
            polys.append((min(xs), min(ys), max(xs), max(ys), r))
    def land(x, y):
        for x0, y0, x1, y1, r in polys:
            if x < x0 or x > x1 or y < y0 or y > y1: continue
            c = False; n = len(r)
            for i in range(n - 1):
                (ax, ay), (bx, by) = r[i], r[i + 1]
                if (ay > y) != (by > y) and x < ax + (y - ay) * (bx - ax) / (by - ay): c = not c
            if c: return True
        return False
    out = []
    for f in feats:
        g = f['geometry']; P = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for pg in P:
            r = pg[0]; flags = []
            for i in range(len(r) - 1):
                (ax, ay), (bx, by) = r[i], r[i + 1]; mx, my = (ax + bx) / 2, (ay + by) / 2
                dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L * eps, dx / L * eps
                flags.append(land(mx + nx, my + ny) != land(mx - nx, my - ny))
            if all(flags): out.append([list(p) for p in r]); continue
            if not any(flags): continue
            j = flags.index(False); n = len(flags); run = []
            for k in range(1, n + 1):
                i = (j + k) % n
                if flags[i]:
                    if not run: run = [list(r[i])]
                    run.append(list(r[i + 1]))
                elif run:
                    out.append(run); run = []
            if run: out.append(run)
    return out
ATA = coast_rings([f for f in FEAT if f['id'] == 'ATA'])
WORLD = coast_rings(FEAT)

def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
    best, bi = -1, 0
    for i in range(1, len(P) - 1):
        q = P[i]; d = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / L if L else math.hypot(q[0] - a[0], q[1] - a[1])
        if d > best: best, bi = d, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)

def clip(line, inside, cross):
    """split a polyline into the runs inside the window; crossings interpolated onto the edge"""
    out, cur = [], []
    for i, p in enumerate(line):
        if inside(p):
            if not cur and i > 0: cur.append(cross(line[i - 1], p))
            cur.append(p)
        else:
            if cur: cur.append(cross(cur[-1], p)); out.append(cur); cur = []
    if cur: out.append(cur)
    return out
def bisect(inside):
    def f(a, b):   # a inside, b outside (or reverse): the edge point by bisection
        if not inside(a): a, b = b, a
        for _ in range(30):
            m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
            if inside(m): a = m
            else: b = m
        return a
    return f

def make_map(rings, centre, window, tol, minlen=0, pts=None):
    f = aeqd(*centre)
    if window[0] == 'circle':
        rr = window[1]; inside = lambda p: p[0] ** 2 + p[1] ** 2 <= rr * rr
    else:
        x0, y0, x1, y1 = window[1]; inside = lambda p: x0 <= p[0] <= x1 and y0 <= p[1] <= y1
    lines, closed = [], []
    for r in rings:
        P = [f(*p) for p in r]
        # skip rings whose great-circle distance is beyond the window (avoids antipodal wrap)
        if all(not inside(p) for p in P): continue
        if all(inside(p) for p in P) and r[0] == r[-1]:
            s = dp(P, tol); s[-1] = s[0]
            if sum(math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) for i in range(1, len(s))) >= minlen:
                closed.append(len(lines)); lines.append(s)
            continue
        # rotate a closed ring so it starts outside, then clip
        if r[0] == r[-1] and not all(inside(p) for p in P):
            j = next(i for i, p in enumerate(P) if not inside(p)); P = P[j:-1] + P[:j + 1]
        for run in clip(P, inside, bisect(inside)):
            s = dp(run, tol)
            if sum(math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) for i in range(1, len(s))) >= max(minlen, 1): lines.append(s)
    lines = [[[round(x, 1), round(y, 1)] for x, y in l] for l in lines]
    return dict(lines=lines, closed=closed, centre=centre, window=window, pts={k: [round(v, 1) for v in f(*ll)] for k, ll in (pts or {}).items()})

def nearest(rings, p):
    best = (1e9, None)
    for r in rings:
        for q in r:
            d = gc(p, q)
            if d < best[0]: best = (d, q)
    return best

M = {}
# Arctic pole of inaccessibility: 2013 position 85°48′N 176°09′W; the earlier position 84°03′N 174°51′W
AP_NEW, AP_OLD = (-176.15, 85.8), (-174.85, 84.05)
M['arctic'] = make_map(WORLD, AP_NEW, ('circle', 2700), 12, 60, dict(new=AP_NEW, old=AP_OLD, np=(0, 90)))
# Antarctica, centred on the South Pole; the former Soviet station «Полюс недоступности» 82°06′S 54°58′E
M['antarctica'] = make_map(ATA, (0, -90), ('circle', 3300), 14, 80, dict(station=(54.97, -82.1), sp=(0, -90)))
# Eurasia, centred on its pole of inaccessibility (north-west China) 46°17′N 86°40′E
EP = (86.67, 46.28)
M['eurasia'] = make_map(WORLD, EP, ('rect', [-6300, -4300, 6300, 3900]), 18, 120, dict(pole=EP))
# Bouvet Island 54°25′S 3°21′E and the Antarctic coast to the south
BV = (3.36, -54.42)
M['bouvet'] = make_map(WORLD, BV, ('rect', [-2300, -2900, 2600, 2300]), 14, 80, dict(bouvet=BV))
for nm, (rings, p) in dict(arctic=(WORLD, AP_NEW), arctic_old=(WORLD, AP_OLD), eurasia=(WORLD, EP), bouvet_ata=(ATA, BV)).items():
    d, q = nearest(rings, p); print(f'{nm:12s} nearest coast {d:7.0f} km at {q}')
    key = {'arctic': 'arctic', 'eurasia': 'eurasia', 'bouvet_ata': 'bouvet'}.get(nm)
    if key: M[key]['near'] = [round(v, 1) for v in aeqd(*M[key]['centre'])(*q)]; M[key]['near_km'] = round(d)
print('old → new', round(gc(AP_OLD, AP_NEW)), 'km')
json.dump(M, open(os.path.join(D, 'scenes', 'geo.json'), 'w'), separators=(',', ':'))
for k, v in M.items(): print(k, len(v['lines']), 'lines', sum(len(l) for l in v['lines']), 'pts', v['pts'])
