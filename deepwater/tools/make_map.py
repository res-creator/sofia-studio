# Gulf of Mexico locator from Natural Earth admin-1 (public domain). Rig position: Macondo, MC 252 (28.7381 N, 88.3659 W).
import json, shapefile, numpy as np
from PIL import Image, ImageDraw
L0, L1, B0, B1 = -93.6, -83.6, 26.4, 31.6
W = 3840; H = int(W * (B1 - B0) / ((L1 - L0) * np.cos(np.radians(29))))
im = Image.new('RGB', (W, H), (14, 42, 60)); d = ImageDraw.Draw(im)
P = lambda lo, la: ((lo - L0) / (L1 - L0) * W, (B1 - la) / (B1 - B0) * H)
sf = shapefile.Reader('../sthelens/assets/raw/ne/ne_10m_admin_1_states_provinces_lakes')
flds = [f[0] for f in sf.fields[1:]]
for sh, rec in zip(sf.shapes(), sf.records()):
    a = dict(zip(flds, rec))
    if a['admin'] not in ('United States of America', 'Mexico'): continue
    fill = (64, 70, 62) if a['name'] == 'Louisiana' else (44, 50, 46)
    pts = sh.points; parts = list(sh.parts) + [len(pts)]
    for k in range(len(parts) - 1):
        d.polygon([P(*p) for p in pts[parts[k]:parts[k + 1]]], fill=fill, outline=(120, 124, 116))
im.save('public/img/map_gulf.jpg', quality=92)
Q = lambda lo, la: [round(P(lo, la)[0] / W, 4), round(P(lo, la)[1] / H, 4)]
json.dump({'w': W, 'h': H, 'rig': Q(-88.3659, 28.7381), 'nola': Q(-90.0715, 29.9511), 'venice': Q(-89.355, 29.277), 'fourchon': Q(-90.199, 29.106), 'la': Q(-92.0, 30.6), 'ms': Q(-89.6, 31.2), 'gulf': Q(-90.5, 27.4)}, open('src/data/map.json', 'w'), indent=1)
print(W, H)
