#!/usr/bin/env python3
"""Country outlines for the board, from open boundary data /tmp/world.geo.json (johan/world.geo.json, public domain,
Natural Earth 110m). Needs shapely (any venv):  <venv>/bin/python -I tools/geo/prep_outlines.py <film dir>
Writes scenes/outlines.json: for every shape two projections, in KILOMETRES (x right, y down):
  true  Lambert azimuthal EQUAL-AREA centred on the shape's own centroid  (areas are honest: «истинный размер»)
  merc  plain Mercator at the equator's scale (x = Rλ, y = −R ln tan(π/4 + φ/2)); its area / true area = the map's inflation
Rings are Douglas–Peucker simplified (tolerance in km) so the marker can draw them stroke by stroke."""
import json, math, os, sys
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.ops import unary_union, transform
D = sys.argv[1]; R = 6371.0
G = {f['id'] if f['id'] != '-99' else f['properties']['name']: f for f in json.load(open('/tmp/world.geo.json'))['features']}
AFRICA = 'DZA AGO BEN BWA BFA BDI CMR CAF TCD COD COG CIV DJI EGY GNQ ERI ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY MDG MWI MLI MRT MAR MOZ NAM NER NGA RWA SEN SLE SOM Somaliland ZAF SSD SDN SWZ TZA TGO TUN UGA ESH ZMB ZWE'.split()
def geom(ids, unwrap=False):
    gs = []
    for i in ids:
        g = shape(G[i]['geometry'])
        if unwrap: g = transform(lambda x, y, z=None: ([v + 360 if v < 0 else v for v in x], y), g)
        gs.append(g.buffer(0))
    return unary_union(gs).buffer(0)
def laea(lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    def f(x, y, z=None):
        X, Y = [], []
        for lo, la in zip(x, y):
            l, p = math.radians(lo), math.radians(la)
            k = math.sqrt(2 / (1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)))
            X.append(R * k * math.cos(p) * math.sin(l - l0))
            Y.append(-R * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0)))
        return X, Y
    return f
def merc(x, y, z=None):
    return [R * math.radians(v) for v in x], [-R * math.log(math.tan(math.pi / 4 + math.radians(min(v, 85)) / 2)) for v in y]
def rings(g, tol, minarea):
    ps = list(g.geoms) if isinstance(g, MultiPolygon) else [g]
    out = []
    for p in sorted(ps, key=lambda p: -p.area):
        if p.area < minarea: continue
        s = p.exterior.simplify(tol)
        out.append([[round(x, 1), round(y, 1)] for x, y in s.coords])
    return out
def centred(rs):   # translate so the bbox centre is (0, 0); return bbox size too
    xs = [p[0] for r in rs for p in r]; ys = [p[1] for r in rs for p in r]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    return [[[round(x - cx, 1), round(y - cy, 1)] for x, y in r] for r in rs], [round(max(xs) - min(xs)), round(max(ys) - min(ys))]
SH = dict(africa=(AFRICA, False), greenland=(['GRL'], False), algeria=(['DZA'], False), russia=(['RUS'], True), australia=(['AUS'], False))
out = {}
for k, (ids, uw) in SH.items():
    g = geom(ids, uw); c = g.centroid
    t = transform(laea(c.x, c.y), g); m = transform(merc, g)
    tol = 9 if k in ('algeria', 'greenland') else 14
    tr, tsz = centred(rings(t, tol, 6000)); mr, msz = centred(rings(m, tol * 2, 12000))
    out[k] = dict(centroid=[round(c.x, 2), round(c.y, 2)], area_true=round(t.area), area_merc=round(m.area), inflation=round(m.area / t.area, 2),
                  true=tr, true_size=tsz, merc=mr, merc_size=msz, merc_y_centre=round(-R * math.log(math.tan(math.pi / 4 + math.radians(c.y) / 2))))
    print(k, 'area (km², from the 110m data)', round(t.area / 1e6, 2), 'M · mercator ×', out[k]['inflation'], '· true', tsz, '· merc', msz,
          '· pts', sum(map(len, tr)), sum(map(len, mr)))
json.dump(out, open(os.path.join(D, 'scenes', 'outlines.json'), 'w'))
