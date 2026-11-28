"""Terrain patches for the dp_maps clips (adapted from ../rp_maps/tools/fetch_patch.py; same sources as ../bh_map).

- Imagery: EOX Sentinel-2 cloudless 2016 (layer s2cloudless_3857, CC BY 4.0), tile zoom Z
- Elevation: AWS Terrain Tiles (Mapzen/Tilezen "terrarium" PNG), tile zoom min(Z, 13)
Both are reprojected to an equirectangular lat/lon grid over the box and graded like assets/world.jpg (tools/fetch_world.py).
Land only (no sea replacement: both places are far inland).

usage (library root): .venv/bin/python -I <clip>/tools/fetch_patch.py <clip> <name> W S E N Z albedo_km grid_km [mode]
  mode "wide"        : the outer 12 % of the box fades into assets/world.jpg (colour) and to height 0, so the edge melts into the globe
  mode "in:<parent>" : the outer 10 % of the box fades into the parent patch (colour and height, bilinear on the parent grid),
                       so the detailed patch sits seamlessly inside the parent (the page cuts a hole in the parent)
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
Z = int(sys.argv[7]); PX = float(sys.argv[8]); GR = float(sys.argv[9]); MODE = sys.argv[10] if len(sys.argv) > 10 else ''
ZT = min(Z, 13)
RAW = os.path.join(D, 'raw'); OUT = os.path.join(D, 'assets'); os.makedirs(RAW, exist_ok=True)
Image.MAX_IMAGE_PIXELS = None
UA = {'User-Agent': 'lemo-opuscar-film/1.0 (research)'}
LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a')


def tile_xy(lon, lat, z):
    n = 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


def get(url):
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                b = r.read()
            LOG.write(json.dumps({'url': url, 'bytes': len(b), 'date': datetime.date.today().isoformat()}) + '\n'); LOG.flush()
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


def edge_w(lon, lat, band):
    """1 inside, 0 at the box edge, smooth over the outer `band` fraction of each side"""
    u = (lon - W) / (E - W); v = (N - lat) / (N - S)
    U, V = np.meshgrid(np.minimum(u, 1 - u), np.minimum(v, 1 - v))
    w = np.clip(np.minimum(U, V) / band, 0, 1)
    return w * w * (3 - 2 * w)


def latlon_sample(img, bbox, lon, lat, order=1):
    """sample an equirectangular array covering bbox [W,S,E,N] (row 0 = north, pixel centres or grid nodes)"""
    w0, s0, e0, n0 = bbox; H, Wd = img.shape[:2]
    XX, YY = np.meshgrid((lon - w0) / (e0 - w0) * (Wd - 1), (n0 - lat) / (n0 - s0) * (H - 1))
    if img.ndim == 2: return ndimage.map_coordinates(img, [YY, XX], order=order, mode='nearest')
    return np.stack([ndimage.map_coordinates(img[..., c], [YY, XX], order=order, mode='nearest') for c in range(img.shape[2])], -1)


s2, sx, sy = mosaic('s2', 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg', Z, 'jpg')
tr, tx, ty = mosaic('terrain', 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', ZT, 'png')
h = tr[..., 0] * 256 + tr[..., 1] + tr[..., 2] / 256 - 32768

km_lat = 111.2; coslat = math.cos(math.radians((N + S) / 2))
IH = int(round((N - S) * km_lat / PX)); IW = int(round((E - W) * km_lat * coslat / PX))
lon = W + (np.arange(IW) + .5) / IW * (E - W); lat = N - (np.arange(IH) + .5) / IH * (N - S)
out = sample(s2, sx, sy, Z, lon, lat)
# the grade of assets/world.jpg (tools/fetch_world.py): warm land, a little less saturation
a = (out / 255) ** 2.2
l = (a * [.2126, .7152, .0722]).sum(-1, keepdims=True)
a = l + (a - l) * .85
a = a * np.array([1.05, 1.0, .9])          # (no sea darkening: dark rainforest would be taken for water)

GH = int(round((N - S) * km_lat / GR)); GW = int(round((E - W) * km_lat * coslat / GR))
glon = W + np.arange(GW) / (GW - 1) * (E - W); glat = N - np.arange(GH) / (GH - 1) * (N - S)
hg = sample(h, tx, ty, ZT, glon, glat, order=3)

if MODE == 'wide':
    wimg = np.asarray(Image.open(os.path.join(OUT, 'world.jpg')).convert('RGB'), np.float64) / 255
    wa = latlon_sample(wimg ** 2.2, [-180, -90, 180, 90], lon, lat)
    wt = edge_w(lon, lat, .12)[..., None]
    a = a * wt + wa * (1 - wt)
    hg = np.maximum(hg, 0) * edge_w(glon, glat, .12)
elif MODE.startswith('in:'):
    P = MODE[3:]; pm = json.load(open(os.path.join(OUT, f'{P}_meta.json')))
    pa = (np.asarray(Image.open(os.path.join(OUT, f'{P}_albedo.jpg')).convert('RGB'), np.float64) / 255) ** 2.2
    pw0, ps0, pe0, pn0 = pm['bbox']; ph = np.fromfile(os.path.join(OUT, f'{P}_height.bin'), '<f4').reshape(pm['GH'], pm['GW']).astype(np.float64)
    # parent albedo pixels are centred: its pixel-centre box is inset by half a pixel
    dx = (pe0 - pw0) / pm['IW'] / 2; dy = (pn0 - ps0) / pm['IH'] / 2
    pal = latlon_sample(pa, [pw0 + dx, ps0 + dy, pe0 - dx, pn0 - dy], lon, lat)
    phg = latlon_sample(ph, pm['bbox'], glon, glat)
    wt = edge_w(lon, lat, .10)[..., None]
    a = a * wt + pal * (1 - wt)
    wg = edge_w(glon, glat, .10)
    hg = hg * wg + phg * (1 - wg)

Image.fromarray((np.clip(a, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, f'{NAME}_albedo.jpg'), quality=92)
hg = hg.astype(np.float32)
hg.tofile(os.path.join(OUT, f'{NAME}_height.bin'))
json.dump({'bbox': [W, S, E, N], 'GW': GW, 'GH': GH, 'IW': IW, 'IH': IH, 'hmax': float(hg.max()), 'hmin': float(hg.min()),
           'z': Z, 'zt': ZT, 'mode': MODE}, open(os.path.join(OUT, f'{NAME}_meta.json'), 'w'), indent=1)
print(NAME, 'albedo', IW, IH, 'grid', GW, GH, 'h', hg.min(), hg.max())
