# Builds src/data/map.json from real data: Natural Earth 10m (states, land, lakes) + OpenStreetMap (North End extract).
import json, math, sys, xml.etree.ElementTree as ET
import shapefile
from shapely.geometry import shape, box, LineString, Polygon, MultiPolygon, Point
from shapely.ops import polygonize, unary_union, linemerge
A = sys.argv[1]  # assets/map dir
R = 6378.137
def P0(lon, lat): return (R*math.radians(lon), -R*math.log(math.tan(math.pi/4+math.radians(lat)/2)))
O = P0(-71.0589, 42.3601)  # origin = Boston (keeps SVG numbers small for precision)
def P(lon, lat):
    x, y = P0(lon, lat); return (x - O[0], y - O[1])
def proj_geom(g):
    from shapely.ops import transform
    return transform(lambda x, y, z=None: tuple(zip(*[P(a, b) for a, b in zip(x, y)])) if hasattr(x, '__len__') else P(x, y), g)
def d_of(g, nd=2):
    out = []
    polys = [g] if isinstance(g, Polygon) else list(getattr(g, 'geoms', []))
    for p in polys:
        if not isinstance(p, Polygon) or p.is_empty: continue
        for ring in [p.exterior, *p.interiors]:
            c = list(ring.coords)
            out.append('M' + 'L'.join(f'{x:.{nd}f},{y:.{nd}f}' for x, y in c) + 'Z')
    return ''.join(out)
def d_line(coords, nd=3): return 'M' + 'L'.join(f'{x:.{nd}f},{y:.{nd}f}' for x, y in coords)
clipLL = box(-82, 37, -64, 49)
out = {}
# --- Natural Earth
sf = shapefile.Reader(f'{A}/ne/ne_10m_admin_1_states_provinces_lakes')
flds = [f[0] for f in sf.fields[1:]]
states = []
for sr in sf.iterShapeRecords():
    rec = dict(zip(flds, sr.record))
    if rec['adm0_a3'] not in ('USA', 'CAN'): continue
    g = shape(sr.shape.__geo_interface__)
    if not g.intersects(clipLL): continue
    g = g.intersection(clipLL).simplify(0.002 if rec['name'] in ('Massachusetts','Rhode Island','New Hampshire') else 0.006)
    lab = None
    if rec['adm0_a3'] == 'USA':
        lab = rec['postal']
    states.append({'name': rec['name'], 'code': lab, 'country': rec['adm0_a3'], 'd': d_of(proj_geom(g), 1),
                   'c': [round(v, 1) for v in P(rec['longitude'], rec['latitude'])] if rec['longitude'] else None})
out['states'] = states
# --- OSM North End
import glob
nodes = {}; ways = {}; bxs = []
for f in sorted(glob.glob(f'{A}/osm/*.osm')):
    r = ET.parse(f).getroot()
    for n in r.iter('node'): nodes[n.get('id')] = (float(n.get('lon')), float(n.get('lat')))
    for w in r.iter('way'): ways[w.get('id')] = w
    bb = r.find('bounds'); bxs.append(box(float(bb.get('minlon')), float(bb.get('minlat')), float(bb.get('maxlon')), float(bb.get('maxlat'))))
bbox = box(*unary_union(bxs).bounds)
roads, bld, coast, parks, rails, piers, landlines = [], [], [], [], [], [], []
MAJ = {'motorway': 3, 'primary': 3, 'secondary': 3, 'tertiary': 2, 'residential': 2, 'unclassified': 2, 'living_street': 1, 'pedestrian': 1, 'service': 1}
for w in ways.values():
    t = {x.get('k'): x.get('v') for x in w.iter('tag')}
    pts = [nodes[n.get('ref')] for n in w.iter('nd') if n.get('ref') in nodes]
    if len(pts) < 2: continue
    hw = t.get('highway')
    if hw in MAJ:
        roads.append((MAJ[hw], t.get('name'), pts))
        if t.get('bridge') in (None, 'no') and t.get('tunnel') in (None, 'no') and t.get('layer', '0') in ('0', '1'): landlines.append(pts)
    elif 'building' in t and len(pts) > 3: bld.append(pts)
    elif t.get('natural') == 'coastline': coast.append(pts)
    elif t.get('leisure') in ('park',) and len(pts) > 3: parks.append((t.get('name'), pts))
    elif t.get('railway') in ('subway', 'light_rail'): rails.append(pts)
    elif t.get('man_made') == 'pier' and len(pts) > 3 and pts[0] == pts[-1]: piers.append(pts)
# land polygon from coastline (OSM convention: land on the left of the way direction)
lines = [LineString(c) for c in coast]
merged = unary_union(lines + [bbox.exterior])
cells = list(polygonize(merged))
def on_land(pt):
    best = None
    for c in coast:
        for (x1, y1), (x2, y2) in zip(c, c[1:]):
            L = LineString([(x1, y1), (x2, y2)]); dd = L.distance(pt)
            if best is None or dd < best[0]: best = (dd, x1, y1, x2, y2)
    _, x1, y1, x2, y2 = best
    return ((x2-x1)*(pt.y-y1) - (y2-y1)*(pt.x-x1)) > 0
# Coastline here does not close inside the extract, so land is derived from OSM features instead:
# union of buildings, ground-level streets and parks, then a morphological closing to fill blocks.
parts = [LineString(p).buffer(0.00025) for p in landlines] + [Polygon(b).buffer(0.0001) for b in bld] + [Polygon(p).buffer(0) for _, p in parks]
land = unary_union(parts).buffer(0.0007).buffer(-0.0007).simplify(0.00003).intersection(bbox)
land = land.difference(unary_union([Polygon(p).buffer(0) for p in piers]).buffer(0))
land = unary_union([land] + [Polygon(p).buffer(0) for p in piers])
out['ne_land'] = d_of(proj_geom(land), 3)
out['ne_water_bbox'] = d_of(proj_geom(bbox), 3)
out['ne_buildings'] = ''.join(d_of(proj_geom(Polygon(b).buffer(0).simplify(0.000008)), 3) for b in bld)
out['ne_parks'] = [{'name': n, 'd': d_of(proj_geom(Polygon(p).buffer(0)), 3)} for n, p in parks]
out['ne_roads'] = [{'k': k, 'name': n, 'd': d_line([P(*q) for q in p])} for k, n, p in roads]
out['ne_rail'] = [d_line([P(*q) for q in p]) for p in rails]
# Commercial Street merged polyline for labeling
cs = linemerge([LineString(p) for k, n, p in roads if n == 'Commercial Street'])
cs_l = max(getattr(cs, 'geoms', [cs]), key=lambda g: g.length)
out['commercial'] = d_line([P(*q) for q in cs_l.coords])
out['commercial_pts'] = [[round(v, 4) for v in P(*q)] for q in cs_l.coords]
# Tank site: Wikipedia article coordinates 42°22′05″N 71°03′25″W
out['tank'] = [round(v, 4) for v in P(-(71 + 3/60 + 25/3600), 42 + 22/60 + 5/3600)]
out['boston'] = [round(v, 3) for v in P(-71.0589, 42.3601)]
out['bbox'] = [round(v, 3) for v in P(bbox.bounds[0], bbox.bounds[3]) + P(bbox.bounds[2], bbox.bounds[1])]
json.dump(out, open(sys.argv[2], 'w'))
print({k: (len(v) if hasattr(v, '__len__') else v) for k, v in out.items()})
