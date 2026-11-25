"""Mid-resolution imagery for the globe's approach to Alaska (so the dive stays sharp between the whole-Earth texture and the region map).
EOX Sentinel-2 cloudless 2016 (layer s2cloudless_3857, CC BY 4.0), zoom 7, lon -166..-132, lat 54..68.
Writes assets/mid_albedo.jpg (Web Mercator crop) and assets/mid_meta.json; every URL goes into raw/manifest.jsonl."""
import sys, os, io, json, math, time, datetime, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image
D = sys.argv[1]; RAW = os.path.join(D, 'raw'); OUT = os.path.join(D, 'assets')
W, S, E, N = -166.0, 54.0, -132.0, 68.0; Z = 7
UA = {'User-Agent': 'map-film/1.0 (research)'}; LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a')
def merc(lon, lat, z): n = 2 ** z * 256; return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
def get(url):
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r: b = r.read()
            LOG.write(json.dumps({'url': url, 'bytes': len(b), 'date': datetime.date.today().isoformat()}) + '\n'); return b
        except Exception:
            if k == 4: raise
            time.sleep(2 + 3 * k)
x0, y0 = merc(W, N, Z); x1, y1 = merc(E, S, Z); tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int(x1 // 256), int(y1 // 256)
im = Image.new('RGB', ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
tm = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg'
jobs = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
with ThreadPoolExecutor(8) as ex:
    for (x, y), b in ex.map(lambda j: (j, get(tm.format(z=Z, x=j[0], y=j[1]))), jobs): im.paste(Image.open(io.BytesIO(b)).convert('RGB'), ((x - tx0) * 256, (y - ty0) * 256))
im = im.crop((int(x0 - tx0 * 256), int(y0 - ty0 * 256), int(x1 - tx0 * 256), int(y1 - ty0 * 256)))
a = (np.asarray(im, np.float32) / 255) ** 2.2; l = (a * [.2126, .7152, .0722]).sum(-1, keepdims=True)
water = (a[..., 2:3] > a[..., 0:1] + .01) & (l < .08)
a = l + (a - l) * .85; a = a * np.array([1.05, 1.0, .9]); a = np.where(water, a * .55 + np.array([.004, .014, .03]), a)
Image.fromarray((np.clip(a, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)).save(os.path.join(OUT, 'mid_albedo.jpg'), quality=90)
json.dump({'z': Z, 'merc': [x0, y0, x1, y1], 'bbox': [W, S, E, N]}, open(os.path.join(OUT, 'mid_meta.json'), 'w'))
print('mid', im.size)
