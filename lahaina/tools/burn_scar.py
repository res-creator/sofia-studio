# burn scar outline from Sentinel-2 (pre 2023-08-03 vs post 2023-08-13), Lahaina crop -> src/data/burn.json (km, same origin as map.json)
import json, math, numpy as np
from PIL import Image, ImageFilter
from rasterio import features
from rasterio.transform import from_bounds
from shapely.geometry import shape
B = (-156.705, 20.86, -156.655, 20.90)
pre = np.asarray(Image.open('assets/raw/s2/pre_lahaina.png')).astype(float)
post = np.asarray(Image.open('assets/raw/s2/post_lahaina.png')).astype(float)
br = lambda a: a.mean(2)
drop = br(pre) - br(post)
land = (pre[:, :, 0] > pre[:, :, 2] * 0.9) & (br(pre) > 60)
mask = ((drop > 28) & land).astype(np.uint8) * 255
m = np.asarray(Image.fromarray(mask).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(3)))
h, w = m.shape; T = from_bounds(*B, w, h)
O = json.load(open('src/data/map.json'))['origin']
P = lambda lon, lat: [round((lon - O[0]) * 111.32 * math.cos(math.radians(O[1])), 4), round(-(lat - O[1]) * 110.57, 4)]
polys = []
for g, v in features.shapes((m > 0).astype(np.uint8), mask=(m > 0), transform=T):
    s = shape(g).buffer(0.0002).buffer(-0.0002).simplify(0.0002)
    if s.area < 2e-6: continue
    polys.append([P(x, y) for x, y in s.exterior.coords])
polys.sort(key=lambda p: -len(p))
def chaikin(pts, n=3):
    for _ in range(n):
        q = []
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            q += [[x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25], [x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]]
        pts = q + [q[0]]
    return [[round(a, 4), round(b, 4)] for a, b in pts]
polys = [chaikin(p) for p in polys if len(p) > 25][:3]
json.dump({'polys': polys[:6], 'bounds_km': [P(B[0], B[3]), P(B[2], B[1])]}, open('src/data/burn.json', 'w'))
print(len(polys), [len(p) for p in polys[:6]], 'burned px', int((m > 0).sum()), 'area km2 ~', round((m > 0).sum() * 1e-4, 2))
