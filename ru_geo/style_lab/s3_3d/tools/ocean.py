"""Ocean board textures from data/geo.json (Mercator, map units: width 36): engraved graticule every 15 degrees and three
soft coastal ridges (distance field from the real coastline), plus a fine clay grain.
→ data/ocean_col.png (sRGB colour), data/ocean_bump.png (height, 0.5 = flat). usage: python3 -I tools/ocean.py <s3_3d folder>"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
D = sys.argv[1]
G = json.load(open(os.path.join(D, 'data/geo.json')))
X0, X1, Y0, Y1 = -18.6, 18.6, -7.9, 17.6           # board extent (map units); must match index.html
W = 4096; PX = W / (X1 - X0); H = int(round((Y1 - Y0) * PX))
K = 36 / (2 * math.pi)
merc = lambda lon, lat: (math.radians(lon) * K, math.log(math.tan(math.pi / 4 + math.radians(max(-85, min(85, lat))) / 2)) * K)
pix = lambda x, y: ((x - X0) * PX, (Y1 - y) * PX)
SS = 2
mask = Image.new('L', (W * SS, H * SS), 0); dr = ImageDraw.Draw(mask)
for grp in ('rest', 'africa', 'greenland'):
    for poly in G[grp]:
        for i, ring in enumerate(poly):
            pts = [tuple(v * SS for v in pix(*merc(*p))) for p in ring]
            dr.polygon(pts, fill=255 if i == 0 else 0)
mask = np.asarray(mask.resize((W, H), Image.LANCZOS), np.float32) / 255
# Greenland's footprint is shown empty later: close its fjords so the board under it reads as one calm shape
gm = Image.new('L', (W, H), 0); dg = ImageDraw.Draw(gm)
for poly in G['greenland']:
    dg.polygon([pix(*merc(*p)) for p in poly[0]], fill=255)
gm = np.asarray(gm) > 127
st = np.ones((3, 3), bool)
gm = ndimage.binary_closing(gm, st, iterations=10) | ndimage.binary_fill_holes(gm)
land = (mask > .5) | gm
d = ndimage.distance_transform_edt(~land) / PX               # distance from the coast, map units
rng = np.random.default_rng(7)
def blur_noise(s, a):
    n = rng.standard_normal((H, W)).astype(np.float32); return ndimage.gaussian_filter(n, s) * a
grain = blur_noise(.7, 1.0) * .5 + blur_noise(3, 1.0) * 2.0 + blur_noise(25, 1.0) * 14
# coastal ridges: three soft raised lines that fade with distance
ridge = np.zeros((H, W), np.float32)
for r0, a in ((.16, 1.0), (.34, .7), (.58, .45)):
    ridge += a * np.exp(-((d - r0) / .03) ** 2)
ridge *= (d > .02)
# graticule grooves (lon every 15°, lat every 15° between −60 and 75 in Mercator)
gx = np.zeros((H, W), np.float32)
xs = (np.arange(W) + .5) / PX + X0; ys = Y1 - (np.arange(H) + .5) / PX
for lon in range(-180, 181, 15):
    x, _ = merc(lon, 0); gx += np.exp(-((xs[None, :] - x) / .022) ** 2)
for lat in range(-60, 76, 15):
    _, y = merc(0, lat); gx += np.exp(-((ys[:, None] - y) / .022) ** 2) * (1.6 if lat == 0 else 1)
gx = np.clip(gx, 0, 1.4) * (~land)
bump = .5 + .28 * ridge - .3 * gx + grain * .006
Image.fromarray((np.clip(bump, 0, 1) * 65535).astype(np.uint16)).save(os.path.join(D, 'data/ocean_bump.png'))
# colour: deep clay teal, a lighter shelf near the coast, grooves a touch darker, low-frequency mottling
deep = np.array([0x3d, 0x5f, 0x6a], np.float32); shelf = np.array([0x5a, 0x80, 0x88], np.float32)
k = np.exp(-d / .45)[..., None]
col = deep * (1 - k) + shelf * k
col *= (1 - .10 * gx[..., None]) * (1 + .05 * ridge[..., None]) * (1 + grain[..., None] * .004)
col *= (1 - .38 * np.exp(-d / .05))[..., None]          # baked contact shadow at the foot of every slab (cheap AO)
col[land] = shelf * .7
Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(os.path.join(D, 'data/ocean_col.png'), optimize=True)
print('ocean', W, H)
