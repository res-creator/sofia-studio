#!/usr/bin/env python3
"""Country outlines for the board, from open boundary data /tmp/world.geo.json (johan/world.geo.json, public domain,
Natural Earth 1:110m). Every shape is projected with a spherical Lambert azimuthal EQUAL-AREA projection centred on
the shape itself (so a shape drawn at k px/km has its TRUE area and only small shape distortion: «истинный размер»),
except the 'merc_*' shapes, which are plain Web-Mercator (EPSG:3857 maths) for the phone map («веб-Меркатор»).
Rings are simplified with Douglas–Peucker (tolerance in km, per shape) so the marker draws them stroke by stroke.
Areas are measured on the unsimplified rings in the equal-area plane.
    python3 -I tools/geo.py <film dir>   →   scenes/geo.json   {name: {rings: [[[x_km, y_km], …]], area, bbox}}
    (x east, y SOUTH — board orientation; origin = the projection centre)
"""
import json, math, os, sys
D = sys.argv[1]; SRC = '/tmp/world.geo.json'
R = 6371.0088
F = {f['id'] if f['id'] != '-99' else f['properties']['name']: f for f in json.load(open(SRC))['features']}

def polys(iso):
    g = F[iso]['geometry']; return [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
def laea(lon0, lat0):
    p0, l0 = math.radians(lat0), math.radians(lon0)
    def f(lon, lat):
        p, l = math.radians(lat), math.radians(lon)
        k = math.sqrt(2 / (1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)))
        return [R * k * math.cos(p) * math.sin(l - l0), -R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))]
    return f
def merc(lon, lat):   # Web-Mercator (spherical), km, y south
    return [R * math.radians(lon), -R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))]
def area(r):   # shoelace, km²
    return abs(sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))) / 2
def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
    best, bi = -1, 0
    for i in range(1, len(P) - 1):
        q = P[i]; d = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / L if L else math.hypot(q[0] - a[0], q[1] - a[1])
        if d > best: best, bi = d, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)
def simp(r, tol):   # closed ring: split at the point farthest from the first, simplify both halves
    r = r[:-1] if r[0] == r[-1] else r
    j = max(range(len(r)), key=lambda i: (r[i][0] - r[0][0]) ** 2 + (r[i][1] - r[0][1]) ** 2)
    out = dp(r[:j + 1], tol)[:-1] + dp(r[j:] + [r[0]], tol)
    return [[round(x, 1), round(y, 1)] for x, y in out]
def centre(rings_ll):   # lon/lat centre of the bounding box (good enough for a projection centre)
    xs = [p[0] for r in rings_ll for p in r]; ys = [p[1] for r in rings_ll for p in r]
    return (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
def outer(iso, keep=None):   # outer rings of a country (holes ignored), optional polygon filter on lon/lat centre
    out = []
    for pg in polys(iso):
        r = pg[0]; c = (sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r))
        if keep is None or keep(*c): out.append(r)
    return out
def shape(rings_ll, tol, minarea=0, proj=None, c=None):
    c = c or centre(rings_ll); f = proj or laea(*c)
    P = [[f(lon, lat) for lon, lat in r] for r in rings_ll]
    A = sum(area(r) for r in P)
    rings = [simp(r, tol) for r in P if area(r) >= minarea]
    xs = [p[0] for r in rings for p in r]; ys = [p[1] for r in rings for p in r]
    return dict(rings=rings, area=round(A), bbox=[round(min(xs)), round(min(ys)), round(max(xs)), round(max(ys))], centre=[round(c[0], 3), round(c[1], 3)])

AFRICA = ('AGO BDI BEN BFA BWA CAF CIV CMR COD COG DJI DZA EGY ERI ETH GAB GHA GIN GMB GNB GNQ KEN LBR LBY LSO MAR MDG MLI MOZ MRT '
          'MWI NAM NER NGA RWA ESH SDN SSD SEN SLE Somaliland SOM SWZ TCD TGO TUN TZA UGA ZAF ZMB ZWE').split()
def coastline(isos):
    """outline of a group of countries: the edges that belong to exactly one country (shared borders cancel), chained"""
    from collections import Counter, defaultdict
    key = lambda p: (round(p[0], 4), round(p[1], 4))
    cnt = Counter(); segs = []
    for iso in isos:
        for pg in polys(iso):
            r = pg[0]
            for i in range(len(r) - 1):
                a, b = key(r[i]), key(r[i + 1])
                if a == b: continue
                cnt[frozenset((a, b))] += 1; segs.append((a, b))
    nxt = defaultdict(list)
    for a, b in segs:
        if cnt[frozenset((a, b))] == 1: nxt[a].append(b)
    rings, used = [], set()
    for s in list(nxt):
        for b0 in nxt[s]:
            if (s, b0) in used: continue
            ring = [s]; a, b = s, b0
            while (a, b) not in used:
                used.add((a, b)); ring.append(b); a = b
                cand = [q for q in nxt.get(a, []) if (a, q) not in used]
                if not cand: break
                b = cand[0]
            if len(ring) > 3: rings.append([list(p) for p in ring])
    return rings

G = {}
G['france'] = shape(outer('FRA', lambda lon, lat: -6 < lon < 10 and 41 < lat < 52), 4)          # metropolitan France + Corsica
G['congo'] = shape(outer('COD'), 4)
G['brazil'] = shape(outer('BRA'), 10)
G['us48'] = shape(outer('USA', lambda lon, lat: lat < 50 and lon > -130), 10)                     # contiguous US: no Alaska, no Hawaii
G['alaska'] = shape(outer('USA', lambda lon, lat: lat > 50), 12)
G['indonesia'] = shape(outer('IDN'), 10)
G['china'] = shape(outer('CHN'), 12)
G['india'] = shape(outer('IND'), 12)
G['australia'] = shape(outer('AUS'), 12)
af = coastline(AFRICA); G['africa'] = shape(af, 14, minarea=20000)
G['africa']['area_union'] = round(sum(area([laea(*G['africa']['centre'])(*p) for p in r]) for r in af))
# Web-Mercator, for the phone map: Greenland and Africa where the map puts them
G['merc_greenland'] = shape(outer('GRL'), 20, proj=merc, c=(0, 0))
G['merc_africa'] = shape(af, 20, minarea=0, proj=merc, c=(0, 0))
G['merc_africa']['rings'] = [r for r in G['merc_africa']['rings'] if len(r) > 6]
# NY and LA on the contiguous-US projection (for the Indonesia comparison)
f48 = laea(*G['us48']['centre']); G['us48']['ny'] = [round(v, 1) for v in f48(-74.006, 40.713)]; G['us48']['la'] = [round(v, 1) for v in f48(-118.244, 34.052)]
json.dump(G, open(os.path.join(D, 'scenes', 'geo.json'), 'w'), separators=(',', ':'))
for k, v in G.items():
    b = v['bbox']; print(f"{k:15s} area {v['area']:>11,} km²  w {b[2] - b[0]:5d} h {b[3] - b[1]:5d} km  rings {len(v['rings'])} pts {sum(len(r) for r in v['rings'])}")
print('africa union-check', G['africa']['area_union'])
