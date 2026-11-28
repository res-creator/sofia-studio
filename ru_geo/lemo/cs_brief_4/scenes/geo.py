"""World outlines for the marker maps, from open boundary data (johan/world.geo.json, public domain; Natural Earth 110m).
Coastlines = the edges of all country rings that are NOT shared by two countries (shared edges are land borders).
Projections (unit sphere, y grows DOWN like the board):
  merc   Mercator                     x = λ,                 y = −ln tan(π/4 + φ/2)
  gp     Gall–Peters (equal-area cyl.) x = λ cos45°,         y = −sin φ / cos45°
  wink   Winkel tripel (φ1 = arccos 2/π)
  ortho  orthographic globe centred on (λ0, φ0)
Polylines are simplified with Douglas–Peucker in board px so the marker draws them stroke by stroke."""
import json, math, os, urllib.request

SRC = '/tmp/world.geo.json'
URL = 'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json'
AFRICA = set('DZA AGO BEN BWA BFA BDI CMR CAF TCD COD COG CIV DJI EGY GNQ ERI ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MAR '
             'MOZ NAM NER NGA RWA SEN SLE SOM ZAF SSD SDN SWZ TZA TGO TUN UGA ESH ZMB ZWE'.split())
SKIP = {'ATA', 'ATF'}

def _load():
    if not os.path.exists(SRC): urllib.request.urlretrieve(URL, SRC)
    return json.load(open(SRC))['features']

def _rings(feats, ids=None):
    out = []
    for f in feats:
        if f['id'] in SKIP or (ids is not None and f['id'] not in ids): continue
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for p in polys:
            for r in p: out.append([tuple(map(float, q)) for q in r])
    return out

_MASK = {}
def _mask(ids):
    """land raster at 0.1° (for edges whose two countries do not share the exact vertices)"""
    k = None if ids is None else tuple(sorted(ids))
    if k in _MASK: return _MASK[k]
    from PIL import Image, ImageDraw
    im = Image.new('L', (3600, 1800), 0); d = ImageDraw.Draw(im)
    for f in _load():
        if f['id'] in SKIP or (ids is not None and f['id'] not in ids): continue
        g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for p in polys:
            d.polygon([((q[0] + 180) * 10, (90 - q[1]) * 10) for q in p[0]], fill=255)
            for h in p[1:]: d.polygon([((q[0] + 180) * 10, (90 - q[1]) * 10) for q in h], fill=0)
    _MASK[k] = im.load(); return _MASK[k]
def _land(M, lo, la):
    x, y = int((lo + 180) * 10), int((90 - la) * 10)
    return 0 <= x < 3600 and 0 <= y < 1800 and M[x, y] > 0
def coast(ids=None):
    """outer edges of the union of the chosen countries, chained into polylines (lon, lat)"""
    rings = _rings(_load(), ids); M = _mask(ids)
    def inner(a, b):   # land on both sides of the edge → a land border, not a coast
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L * .35, dx / L * .35
        return _land(M, mx + nx, my + ny) and _land(M, mx - nx, my - ny)
    key = lambda q: (round(q[0], 5), round(q[1], 5))
    cnt = {}
    for r in rings:
        for a, b in zip(r, r[1:]):
            k = frozenset((key(a), key(b))); cnt[k] = cnt.get(k, 0) + 1
    lines = []
    for r in rings:
        cur = []
        for a, b in zip(r, r[1:]):
            dateline = abs(a[0]) > 179.9 and abs(b[0]) > 179.9
            if cnt[frozenset((key(a), key(b)))] == 1 and not dateline and not inner(a, b):
                if not cur: cur = [a]
                cur.append(b)
            elif cur: lines.append(cur); cur = []
        if cur: lines.append(cur)
    # join a ring's last piece with its first when they meet
    return lines

# ---------------------------------------------------------------- projections
R2 = math.radians
def merc(lo, la): la = max(-85, min(85, la)); return R2(lo), -math.log(math.tan(math.pi / 4 + R2(la) / 2))
C45 = math.cos(math.pi / 4)
def gp(lo, la): return R2(lo) * C45, -math.sin(R2(la)) / C45
PHI1 = math.acos(2 / math.pi)
def wink(lo, la):
    l, p = R2(lo), R2(la); a = math.acos(max(-1, min(1, math.cos(p) * math.cos(l / 2))))
    sa = math.sin(a) / a if a > 1e-9 else 1
    return .5 * (l * math.cos(PHI1) + 2 * math.cos(p) * math.sin(l / 2) / sa), -.5 * (p + math.sin(p) / sa)
def ortho(l0, p0):
    l0, p0 = R2(l0), R2(p0)
    def f(lo, la):
        l, p = R2(lo), R2(la); c = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        if c < .06: return None
        return math.cos(p) * math.sin(l - l0), -(math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
    return f

# ---------------------------------------------------------------- sphere helpers
def vec(lo, la): l, p = R2(lo), R2(la); return (math.cos(p) * math.cos(l), math.cos(p) * math.sin(l), math.sin(p))
def unvec(v): return math.degrees(math.atan2(v[1], v[0])), math.degrees(math.asin(max(-1, min(1, v[2]))))
def small_circle(lo, la, r_deg, n=48):
    """points at angular distance r from (lo, la)"""
    p1, l1, d = R2(la), R2(lo), R2(r_deg); out = []
    for i in range(n + 1):
        b = 2 * math.pi * i / n
        p2 = math.asin(math.sin(p1) * math.cos(d) + math.cos(p1) * math.sin(d) * math.cos(b))
        l2 = l1 + math.atan2(math.sin(b) * math.sin(d) * math.cos(p1), math.cos(d) - math.sin(p1) * math.sin(p2))
        out.append((math.degrees(l2), math.degrees(p2)))
    return out
def rotate_to(lines, src, dst):
    """rigid rotation of the sphere carrying point src to dst (thetruesize): the shape keeps its true size"""
    a, b = vec(*src), vec(*dst)
    k = (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]); s = math.sqrt(sum(q * q for q in k)); c = sum(p * q for p, q in zip(a, b))
    if s < 1e-12: return lines
    k = tuple(q / s for q in k); th = math.atan2(s, c)
    def rot(v):
        ct, st = math.cos(th), math.sin(th); kv = sum(p * q for p, q in zip(k, v))
        cr = (k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0])
        return tuple(v[i] * ct + cr[i] * st + k[i] * kv * (1 - ct) for i in range(3))
    return [[unvec(rot(vec(*q))) for q in ln] for ln in lines]

# ---------------------------------------------------------------- simplify, clip
def dp(P, eps):
    if len(P) < 3: return P
    keep = [False] * len(P); keep[0] = keep[-1] = True; st = [(0, len(P) - 1)]
    while st:
        i, j = st.pop(); ax, ay = P[i]; bx, by = P[j]; dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-9; m, mi = -1, -1
        for k in range(i + 1, j):
            d = abs((P[k][0] - ax) * dy - (P[k][1] - ay) * dx) / L if L > 1e-9 else math.hypot(P[k][0] - ax, P[k][1] - ay)
            if d > m: m, mi = d, k
        if m > eps: keep[mi] = True; st += [(i, mi), (mi, j)]
    return [p for p, k in zip(P, keep) if k]
def plen(P): return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(P, P[1:]))
def clip(P, box):
    """split a polyline at a rectangle (segment clipping, Liang–Barsky)"""
    x0, y0, x1, y1 = box; out, cur = [], []
    def cl(a, b):
        t0, t1 = 0, 1; dx, dy = b[0] - a[0], b[1] - a[1]
        for p, q in ((-dx, a[0] - x0), (dx, x1 - a[0]), (-dy, a[1] - y0), (dy, y1 - a[1])):
            if p == 0:
                if q < 0: return None
            else:
                r = q / p
                if p < 0: t0 = max(t0, r)
                else: t1 = min(t1, r)
        if t0 > t1: return None
        return (a[0] + t0 * dx, a[1] + t0 * dy), (a[0] + t1 * dx, a[1] + t1 * dy), t0 > 0, t1 < 1
    for a, b in zip(P, P[1:]):
        r = cl(a, b)
        if r is None:
            if cur: out.append(cur); cur = []
            continue
        pa, pb, cut_a, cut_b = r
        if not cur or cut_a:
            if cur: out.append(cur)
            cur = [pa]
        cur.append(pb)
        if cut_b: out.append(cur); cur = []
    if cur: out.append(cur)
    return out

class Map:
    """a projection placed on the board: lon/lat → board px. box = (x0, y0, width) of the projected window
    window = (lon0, lon1, lat0, lat1) for the cylindrical ones; the whole world for wink/ortho"""
    def __init__(s, proj, x0, y0, width, window=None):
        s.proj = proj
        if window:
            lo0, lo1, la0, la1 = window
            ax, ay = proj(lo0, la1); bx, by = proj(lo1, la0)
        else:
            pts = [proj(lo, la) for lo in range(-180, 181, 5) for la in range(-90, 91, 5)]; pts = [p for p in pts if p]
            ax, ay = min(p[0] for p in pts), min(p[1] for p in pts); bx, by = max(p[0] for p in pts), max(p[1] for p in pts)
        s.k = width / (bx - ax); s.ax, s.ay = ax, ay; s.x0, s.y0 = x0, y0
        s.w, s.h = width, (by - ay) * s.k; s.box = (x0, y0, x0 + s.w, y0 + s.h); s.window = window
    def __call__(s, lo, la):
        p = s.proj(lo, la)
        return None if p is None else (s.x0 + (p[0] - s.ax) * s.k, s.y0 + (p[1] - s.ay) * s.k)
    def lines(s, lines_ll, eps=3.0, min_len=0, densify=2.0, clip_box=True):
        out = []
        for ln in lines_ll:
            # densify in lon/lat so curved projections bend smoothly, then project, split where invisible
            pts = []
            for a, b in zip(ln, ln[1:]):
                n = max(1, int(max(abs(b[0] - a[0]), abs(b[1] - a[1])) / densify))
                for i in range(n): pts.append((a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n))
            pts.append(ln[-1])
            seg = []
            for q in pts:
                p = s(*q)
                if p is None:
                    if len(seg) > 1: out.append(seg)
                    seg = []
                else: seg.append(p)
            if len(seg) > 1: out.append(seg)
        if clip_box and s.window:
            out = [c for P in out for c in clip(P, s.box)]
        res = []
        for P in out:
            P = dp(P, eps)
            if len(P) > 1 and plen(P) >= min_len: res.append(P)
        return res
