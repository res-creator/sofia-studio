"""Build the data for the page (run once): python3 -I tools/prep.py <dir>
 assets/geo.json   Greenland + Africa (Natural Earth 50m via world-atlas@2.0.2, public domain), land coastlines,
                   true areas, centroid, Mercator check numbers
 assets/gl_mask.png  Greenland land mask on a lon/lat grid (for the lifted, re-projected satellite cut-out)
 assets/sat.jpg    Sentinel-2 cloudless 2016 z4 Web-Mercator mosaic (EOX, CC BY 4.0), from ../../lemo/cs_globe/raw
 assets/paper.png  procedural paper texture (own code)
 assets/plate.jpg  Mercator 1569, sheet 1 (public domain), from ../../country_sizes/archive/img
"""
import sys, os, json, math, shutil
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
D = sys.argv[1]; A = os.path.join(D, 'assets'); R = os.path.join(D, 'raw'); os.makedirs(A, exist_ok=True)

def topo(path, obj):
    t = json.load(open(path)); sx, sy = t['transform']['scale']; tx, ty = t['transform']['translate']
    arcs = []
    for a in t['arcs']:
        x = y = 0; pts = []
        for dx, dy in a: x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs, t['objects'][obj]['geometries']

def ring(arcs, idx):
    out = []
    for i in idx:
        p = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(p if not out else p[1:])
    return out

def polys(g):
    return g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]

R_E = 6371.0088
def sph_area(r):   # km², ring on the sphere (lon/lat deg), via the trapezoid formula of the authalic-ish sphere
    s = 0
    for (l1, p1), (l2, p2) in zip(r, r[1:] + r[:1]):
        dl = math.radians(l2 - l1)
        if dl > math.pi: dl -= 2 * math.pi
        if dl < -math.pi: dl += 2 * math.pi
        s += dl * (2 + math.sin(math.radians(p1)) + math.sin(math.radians(p2)))
    return abs(s) * R_E ** 2 / 2

def merc(l, p): return math.radians(l), math.log(math.tan(math.pi / 4 + math.radians(p) / 2))
def planar(r):
    return abs(sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(r, r[1:] + r[:1]))) / 2

def dp(P, eps):
    if len(P) > 8 and abs(P[0][0] - P[-1][0]) < 1e-9 and abs(P[0][1] - P[-1][1]) < 1e-9:   # closed ring: simplify two halves
        h = len(P) // 2; return dp(P[:h + 1], eps)[:-1] + dp(P[h:], eps)
    if len(P) < 3: return [list(p) for p in P]
    P = np.asarray(P); keep = np.zeros(len(P), bool); keep[0] = keep[-1] = True; st = [(0, len(P) - 1)]
    while st:
        i, j = st.pop()
        if j <= i + 1: continue
        a, b = P[i], P[j]; d = b - a; L = math.hypot(*d) or 1e-12
        dist = np.abs(d[0] * (P[i + 1:j, 1] - a[1]) - d[1] * (P[i + 1:j, 0] - a[0])) / L
        k = int(np.argmax(dist))
        if dist[k] > eps: keep[i + 1 + k] = True; st += [(i, i + 1 + k), (i + 1 + k, j)]
    return P[keep].tolist()

arcs, geoms = topo(os.path.join(R, 'countries-50m.json'), 'countries')
byname = {g['properties']['name']: g for g in geoms}
AF = ['Zimbabwe', 'Zambia', 'Uganda', 'Tunisia', 'Togo', 'Tanzania', 'eSwatini', 'S. Sudan', 'Sudan', 'South Africa', 'Somalia',
      'Somaliland', 'Sierra Leone', 'Senegal', 'Rwanda', 'Nigeria', 'Niger', 'Namibia', 'Mozambique', 'Morocco', 'W. Sahara',
      'Mauritania', 'Mali', 'Malawi', 'Madagascar', 'Libya', 'Liberia', 'Lesotho', 'Kenya', 'Guinea-Bissau', 'Guinea', 'Ghana',
      'Gambia', 'Gabon', 'Ethiopia', 'Eritrea', 'Eq. Guinea', 'Egypt', 'Djibouti', "Côte d'Ivoire", 'Dem. Rep. Congo', 'Congo',
      'Chad', 'Central African Rep.', 'Cameroon', 'Burundi', 'Burkina Faso', 'Botswana', 'Benin', 'Angola', 'Algeria']
# Africa: fill = all country rings; stroke = arcs used once (shared land borders dissolved); tiny islands dropped
af_fill, cnt, af_area = [], {}, 0
for n in AF:
    for poly in polys(byname[n]):
        r = ring(arcs, poly[0]); a = sph_area(r)
        if a < 3000: continue
        af_area += a; af_fill.append(poly[0])
        for i in poly[0]: k = i if i >= 0 else ~i; cnt[k] = cnt.get(k, 0) + 1
af_stroke = [dp(arcs[k], .04) for k, c in cnt.items() if c == 1]
af_fill = [dp(ring(arcs, p), .04) for p in af_fill]
gl, gl_area = [], 0
for poly in polys(byname['Greenland']):
    r = ring(arcs, poly[0]); a = sph_area(r); gl_area += a
    if a > 900: gl.append(r)
gl.sort(key=sph_area, reverse=True)
gl_s = [dp(r, .03) for r in gl]
# centroid of Greenland on the sphere (area-weighted mean of the unit vectors of its mask cells)
L0, L1, P0, P1, MW, MH = -75.0, -10.0, 59.0, 84.0, 2600, 1000
img = Image.new('L', (MW * 2, MH * 2), 0); dr = ImageDraw.Draw(img)
for r in gl:
    dr.polygon([((l - L0) / (L1 - L0) * MW * 2, (P1 - p) / (P1 - P0) * MH * 2) for l, p in r], fill=255)
m = np.asarray(img.resize((MW, MH), Image.LANCZOS), np.float32) / 255
lon = L0 + (np.arange(MW) + .5) / MW * (L1 - L0); lat = P1 - (np.arange(MH) + .5) / MH * (P1 - P0)
LO, LA = np.meshgrid(np.radians(lon), np.radians(lat)); w = m * np.cos(LA)
v = np.array([(w * np.cos(LA) * np.cos(LO)).sum(), (w * np.cos(LA) * np.sin(LO)).sum(), (w * np.sin(LA)).sum()])
c_lat = math.degrees(math.asin(v[2] / np.linalg.norm(v))); c_lon = math.degrees(math.atan2(v[1], v[0]))
Image.fromarray((ndimage.binary_dilation(m > .02, iterations=3) * 0 + m * 255).astype(np.uint8)).save(os.path.join(A, 'gl_mask.png'))
# Africa mask (for the closing spotlight), lon -20..55, lat -37..39
AL0, AL1, AP0, AP1, AW, AH = -20.0, 55.0, -37.0, 39.0, 1500, 1520
img = Image.new('L', (AW, AH), 0); dr = ImageDraw.Draw(img)
for r in af_fill:
    dr.polygon([((l - AL0) / (AL1 - AL0) * AW, (AP1 - p) / (AP1 - AP0) * AH) for l, p in r], fill=255)
Image.fromarray(ndimage.gaussian_filter(np.asarray(img, np.float32), 6).astype(np.uint8)).save(os.path.join(A, 'af_mask.png'))
# land coastlines for the hairline layer
larcs, lgeoms = topo(os.path.join(R, 'land-50m.json'), 'land')
coast = []
for g in lgeoms:
    for poly in polys(g):
        for rr in poly:
            r = ring(larcs, rr)
            if sph_area(r) > 4000: coast.append(dp(r, .05))
# Mercator map areas (rad²): Greenland where it is, Africa
mg = sum(planar([merc(l, p) for l, p in r]) for r in gl); ma = sum(planar([merc(l, p) for l, p in r]) for r in af_fill)
out = dict(greenland=gl_s, africa_fill=af_fill, africa_stroke=af_stroke, coast=coast,
           gl_area_km2=gl_area, af_area_km2=af_area, gl_centroid=[c_lon, c_lat], mask=[L0, L1, P0, P1], af_mask=[AL0, AL1, AP0, AP1],
           merc_area_gl=mg, merc_area_af=ma)
json.dump(out, open(os.path.join(A, 'geo.json'), 'w'), separators=(',', ':'))
print(f'Greenland {gl_area/1e6:.3f} M km2, Africa (kept rings) {af_area/1e6:.2f} M km2, ratio {af_area/gl_area:.2f}; '
      f'centroid {c_lat:.2f}N {c_lon:.2f}E; Mercator map areas GL {mg:.4f} AF {ma:.4f} (AF/GL {ma/mg:.2f}); coast rings {len(coast)}')
shutil.copy(os.path.join(D, '../../lemo/cs_globe/raw/world_s2_z4.jpg'), os.path.join(A, 'sat.jpg'))
im = Image.open(os.path.join(D, '../../country_sizes/archive/img/mercator_1569_map.jpg')).convert('RGB'); im.save(os.path.join(A, 'plate.jpg'), quality=93)
# paper: mottling at several scales + fibres; mean 0.5
rng = np.random.default_rng(7); H, W = 1152, 2048
p = np.zeros((H, W), np.float32)
for s, a in [(160, .5), (48, .35), (12, .2), (2.5, .12)]:
    p += a * ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), s, mode='wrap') * (s ** .5)
p = (p - p.mean()) / p.std()
fib = Image.new('L', (W, H), 0); fd = ImageDraw.Draw(fib)
for _ in range(2600):
    x, y = rng.uniform(0, W), rng.uniform(0, H); ang = rng.uniform(0, math.pi); L = rng.uniform(8, 40)
    fd.line([(x, y), (x + L * math.cos(ang), y + L * math.sin(ang))], fill=int(rng.uniform(60, 160)), width=1)
f = ndimage.gaussian_filter(np.asarray(fib, np.float32) / 255, .7)
q = np.clip(.5 + .11 * p + .25 * f, 0, 1)
Image.fromarray((q * 255).astype(np.uint8)).save(os.path.join(A, 'paper.png'))
print('assets ok')
