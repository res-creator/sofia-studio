"""Country outlines for the board, from open boundary data (johan/world.geo.json, public domain, /tmp/world.geo.json).
Dissolve (shared borders removed, so a continent is one coastline), project (Web-Mercator or Lambert azimuthal
equal-area), clip, Douglas–Peucker simplify. Used by _gen_film.py."""
import json, math, os, urllib.request

SRC = '/tmp/world.geo.json'
if not os.path.exists(SRC):
    open(SRC, 'wb').write(urllib.request.urlopen('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json', timeout=60).read())
FEAT = {f['properties']['name']: f['geometry'] for f in json.load(open(SRC))['features']}
AFRICA = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad',
          'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia',
          'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
          'Malawi', 'Mali', 'Mauritania', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Sierra Leone',
          'Somalia', 'Somaliland', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'United Republic of Tanzania', 'Togo', 'Tunisia',
          'Uganda', 'Western Sahara', 'Zambia', 'Zimbabwe']

def rings(names):
    out = []
    for n in names:
        g = FEAT[n]; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for p in polys: out.append(p[0])          # outer rings only
    return out

def dissolve(rs):
    """remove edges shared by two rings; chain the rest into closed / open polylines (lon, lat)"""
    key = lambda p: (round(p[0], 4), round(p[1], 4))
    cnt = {}
    for r in rs:
        for a, b in zip(r, r[1:]):
            k = frozenset((key(a), key(b))); cnt[k] = cnt.get(k, 0) + 1
    nxt = {}
    for r in rs:
        for a, b in zip(r, r[1:]):
            if key(a) != key(b) and cnt[frozenset((key(a), key(b)))] == 1: nxt.setdefault(key(a), []).append(key(b))
    lines = []
    while nxt:
        s = next(iter(nxt)); L = [s]; cur = s
        while cur in nxt:
            n = nxt[cur].pop(0)
            if not nxt[cur]: del nxt[cur]
            L.append(n); cur = n
            if cur == s: break
        lines.append(L)
    return lines

def merc(lon, lat):
    lat = max(-85, min(85, lat))
    return math.radians(lon), math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

def laea(lon, lat, lon0, lat0, R=6371.0):
    l, p, l0, p0 = map(math.radians, (lon, lat, lon0, lat0))
    k = math.sqrt(2 / (1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)))
    return R * k * math.cos(p) * math.sin(l - l0), R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))

def area(P):
    return abs(sum(P[i][0] * P[i + 1][1] - P[i + 1][0] * P[i][1] for i in range(len(P) - 1))) / 2

def dp(P, eps):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy)
    best, bi = -1, 0
    for i in range(1, len(P) - 1):
        d = abs(dy * (P[i][0] - a[0]) - dx * (P[i][1] - a[1])) / L if L else math.hypot(P[i][0] - a[0], P[i][1] - a[1])
        if d > best: best, bi = d, i
    if best <= eps: return [a, b]
    return dp(P[:bi + 1], eps)[:-1] + dp(P[bi:], eps)

def clip_box(L, x0, y0, x1, y1):
    """split a polyline where it leaves the box (no exact edge intersection needed for marker work: points outside dropped)"""
    out, cur = [], []
    for p in L:
        if x0 <= p[0] <= x1 and y0 <= p[1] <= y1: cur.append(p)
        else:
            if len(cur) > 1: out.append(cur)
            cur = []
    if len(cur) > 1: out.append(cur)
    return out

def great_circle(a, b, n=60):
    def v(lon, lat):
        l, p = math.radians(lon), math.radians(lat); return (math.cos(p) * math.cos(l), math.cos(p) * math.sin(l), math.sin(p))
    A, B = v(*a), v(*b); om = math.acos(sum(x * y for x, y in zip(A, B))); out = []
    for i in range(n + 1):
        t = i / n; s0, s1 = math.sin((1 - t) * om) / math.sin(om), math.sin(t * om) / math.sin(om)
        x, y, z = (s0 * A[k] + s1 * B[k] for k in range(3))
        out.append((math.degrees(math.atan2(y, x)), math.degrees(math.asin(z))))
    return out
