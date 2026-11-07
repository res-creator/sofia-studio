# Maui outline (Natural Earth 10m land) + Lahaina streets/buildings (OSM) -> src/data/map.json (screen-ready, km)
import json, math, shapefile, xml.etree.ElementTree as ET
from shapely.geometry import shape, box, Polygon, MultiPolygon
O = (-156.45, 20.80)  # map origin (Maui centre)
def P(lon, lat):
    x = (lon - O[0]) * 111.32 * math.cos(math.radians(O[1])); y = -(lat - O[1]) * 110.57
    return round(x, 3), round(y, 3)
sf = shapefile.Reader('assets/raw/ne/ne_10m_land.shp')
bb = box(-157.4, 20.4, -155.8, 21.4)  # Maui + Molokai + Lanai + Kahoolawe
paths = []
for s in sf.shapes():
    g = shape(s.__geo_interface__).intersection(bb)
    if g.is_empty: continue
    for poly in (g.geoms if isinstance(g, MultiPolygon) else [g]):
        if not isinstance(poly, Polygon): continue
        pts = [P(*c) for c in poly.exterior.coords]
        paths.append('M' + 'L'.join(f'{x},{y}' for x, y in pts) + 'Z')
root = ET.parse('assets/raw/lahaina.osm').getroot()
nodes = {n.get('id'): (float(n.get('lon')), float(n.get('lat'))) for n in root.iter('node')}
roads, major, bld = [], [], []
for w in root.iter('way'):
    tags = {t.get('k'): t.get('v') for t in w.iter('tag')}
    pts = [P(*nodes[n.get('ref')]) for n in w.iter('nd') if n.get('ref') in nodes]
    if len(pts) < 2: continue
    d = 'M' + 'L'.join(f'{x},{y}' for x, y in pts)
    hw = tags.get('highway')
    if 'building' in tags: bld.append(d + 'Z')
    elif hw in ('primary', 'trunk', 'secondary'): major.append({'d': d, 'name': tags.get('name', '')})
    elif hw in ('tertiary', 'residential', 'unclassified', 'service', 'living_street'): roads.append(d)
json.dump({'origin': O, 'land': paths, 'roads': roads, 'major': major, 'bld': bld,
           'lahaina': P(-156.6825, 20.8783), 'kahului': P(-156.4729, 20.8893)}, open('src/data/map.json', 'w'))
print(len(paths), 'land', len(roads), 'roads', len(major), 'major', len(bld), 'buildings', [m['name'] for m in major][:10])
