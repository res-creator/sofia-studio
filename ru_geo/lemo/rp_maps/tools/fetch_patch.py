"""Detailed patch around Tristan da Cunha for the close part of the Tristan clip (same sources as bh_map/tools/fetch_patch.py).

- Imagery: EOX Sentinel-2 cloudless 2016 (layer s2cloudless_3857, CC BY 4.0), zoom 11
- Elevation + bathymetry: AWS Terrain Tiles (Mapzen/Tilezen "terrarium" PNG), zoom 11
Both are reprojected to an equirectangular lat/lon grid over the box and graded like assets/world.jpg (tools/fetch_world.py).
usage (library root): .venv/bin/python -I <clip>/tools/fetch_patch.py <clip> <name> W S E N
Writes raw/<name>_*.{jpg,png}, assets/<name>_albedo.jpg, assets/<name>_height.bin (float32 m, row 0 = north), assets/<name>_meta.json
Every URL goes to raw/manifest.jsonl
"""
import sys, os, io, json, math, time, datetime, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
from scipy import ndimage

D, NAME = sys.argv[1], sys.argv[2]
W, S, E, N = map(float, sys.argv[3:7])
RAW = os.path.join(D, 'raw'); OUT = os.path.join(D, 'assets'); os.makedirs(RAW, exist_ok=True)
UA = {'User-Agent': 'lemo-opuscar-film/1.0 (research)'}
LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a')
Z = 11


def tile_xy(lon, lat, z):
    n = 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


def get(url):
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                b = r.read()
            LOG.write(json.dumps({'url': url, 'bytes': len(b), 'date': datetime.date.today().isoformat()}) + '\n')
            return b
        except Exception:
            if k == 4:
                raise
            time.sleep(2 + 3 * k)


def mosaic(kind, tmpl, z, ext):
    dst = os.path.join(RAW, f'{NAME}_{kind}_z{z}.{ext}')
    x0, y0 = tile_xy(W, N, z); x1, y1 = tile_xy(E, S, z)
    tx0, ty0, tx1, ty1 = int(x0), int(y0), int(x1), int(y1)
    if not os.path.exists(dst):
        jobs = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
        im = Image.new('RGB', ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
        with ThreadPoolExecutor(4) as ex:
            for (x, y), b in ex.map(lambda j: (j, get(tmpl.format(z=z, x=j[0], y=j[1]))), jobs):
                im.paste(Image.open(io.BytesIO(b)).convert('RGB'), ((x - tx0) * 256, (y - ty0) * 256))
        im.save(dst, quality=95) if ext == 'jpg' else im.save(dst)
    return np.asarray(Image.open(dst).convert('RGB'), np.float64), tx0, ty0


def sample(arr, tx0, ty0, z, lon, lat, order=1):
    n = 2 ** z * 256
    X = (lon + 180) / 360 * n - tx0 * 256 - .5
    Y = (1 - np.arcsinh(np.tan(np.radians(lat))) / math.pi) / 2 * n - ty0 * 256 - .5
    XX, YY = np.meshgrid(X, Y)
    if arr.ndim == 2: return ndimage.map_coordinates(arr, [YY, XX], order=order, mode='nearest')
    return np.stack([ndimage.map_coordinates(arr[..., c], [YY, XX], order=order, mode='nearest') for c in range(3)], -1)


s2, sx, sy = mosaic('s2', 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg', Z, 'jpg')
tr, tx, ty = mosaic('terrain', 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', Z, 'png')
h = tr[..., 0] * 256 + tr[..., 1] + tr[..., 2] / 256 - 32768

# albedo grid: ~45 m per pixel north-south
km_lat = 111.2; IH = int(round((N - S) * km_lat / .045)); IW = int(round((E - W) * km_lat * math.cos(math.radians((N + S) / 2)) / .045))
lon = W + (np.arange(IW) + .5) / IW * (E - W); lat = N - (np.arange(IH) + .5) / IH * (N - S)
out = sample(s2, sx, sy, Z, lon, lat)
# the grade of assets/world.jpg (tools/fetch_world.py): warm land, a little less saturation; deep ocean pushed toward navy
a = (out / 255) ** 2.2
l = (a * [.2126, .7152, .0722]).sum(-1, keepdims=True)
water = (a[..., 2:3] > a[..., 0:1] + .01) & (l < .08)
a = l + (a - l) * .85
a = a * np.array([1.05, 1.0, .9])
a = np.where(water, a * .55 + np.array([.004, .014, .03]), a)
# the open sea: the cloudless mosaic here is a patchwork (one cloudy scene, then a flat fill). Keep the imagery only within
# ~2.5 km of land (fading out by ~6 km) and use the flat sea colour of assets/world.jpg elsewhere, so the patch melts into the globe
hl = sample(h, tx, ty, Z, lon, lat)
land = hl > 1
dist = ndimage.distance_transform_edt(~land) * .045          # km to the nearest land
wgt = np.clip(1 - (dist - 2.5) / 3.5, 0, 1); wgt = (wgt * wgt * (3 - 2 * wgt))[..., None]
sea = (np.array([26, 43, 61]) / 255) ** 2.2
a = a * wgt + sea * (1 - wgt)
Image.fromarray((np.clip(a, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, f'{NAME}_albedo.jpg'), quality=92)

# height grid (mesh vertices): ~150 m
GH = int(round((N - S) * km_lat / .15)); GW = int(round((E - W) * km_lat * math.cos(math.radians((N + S) / 2)) / .15))
glon = W + np.arange(GW) / (GW - 1) * (E - W); glat = N - np.arange(GH) / (GH - 1) * (N - S)
hg = sample(h, tx, ty, Z, glon, glat, order=3).astype(np.float32)
hg.tofile(os.path.join(OUT, f'{NAME}_height.bin'))
json.dump({'bbox': [W, S, E, N], 'GW': GW, 'GH': GH, 'IW': IW, 'IH': IH, 'hmax': float(hg.max()), 'hmin': float(hg.min()),
           'z': Z}, open(os.path.join(OUT, f'{NAME}_meta.json'), 'w'), indent=1)
print(NAME, 'albedo', IW, IH, 'grid', GW, GH, 'h', hg.min(), hg.max())
