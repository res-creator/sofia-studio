"""Fetch public data for the strait (the detailed terrain the camera flies over).

- Elevation + bathymetry: AWS Terrain Tiles (Mapzen/Tilezen "terrarium" PNG), zoom 10.
- Imagery: EOX Sentinel-2 cloudless 2016 (layer s2cloudless_3857, CC BY 4.0), zoom 11.
- Shipping lanes: OpenStreetMap seamark traffic-separation-scheme features via Overpass (ODbL).

usage (library root): .venv/bin/python -I styles/map-explainer/demo/tools/fetch.py styles/map-explainer/demo
Writes raw/terrain_z10.png, raw/s2_z11.jpg, raw/tss.json, raw/manifest.jsonl, raw/bbox.json
"""
import sys, os, io, json, math, time, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

D = sys.argv[1]
RAW = os.path.join(D, 'raw'); os.makedirs(RAW, exist_ok=True)
W, S, E, N = -148.95, 60.70, -148.40, 60.86   # lon/lat box: Whittier, Passage Canal, the tunnel
UA = {'User-Agent': 'map-film/1.0 (research)'}
LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a')


def tile_xy(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def get(url, data=None):
    for k in range(5):
        try:
            req = urllib.request.Request(url, data=data, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                b = r.read()
            LOG.write(json.dumps({'url': url, 'bytes': len(b), 'date': datetime.date.today().isoformat()}) + '\n')
            return b
        except Exception as e:
            if k == 4:
                raise
            time.sleep(2 + 3 * k)


def mosaic(name, tmpl, z, ext):
    dst = os.path.join(RAW, f'{name}_z{z}.{ext}')
    x0, y0 = tile_xy(W, N, z); x1, y1 = tile_xy(E, S, z)
    tx0, ty0, tx1, ty1 = int(x0), int(y0), int(x1), int(y1)
    meta = {'z': z, 'tx0': tx0, 'ty0': ty0, 'tx1': tx1, 'ty1': ty1}
    if not os.path.exists(dst):
        jobs = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
        def one(j):
            x, y = j
            return j, get(tmpl.format(z=z, x=x, y=y))
        im = Image.new('RGB', ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
        with ThreadPoolExecutor(8) as ex:
            for (x, y), b in ex.map(one, jobs):
                im.paste(Image.open(io.BytesIO(b)).convert('RGB'), ((x - tx0) * 256, (y - ty0) * 256))
        im.save(dst, quality=95) if ext == 'jpg' else im.save(dst)
    print(name, meta)
    return meta


meta = {'bbox': [W, S, E, N]}
meta['terrain'] = mosaic('terrain', 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', 12, 'png')
meta['s2'] = mosaic('s2', 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg', 13, 'jpg')
json.dump(meta, open(os.path.join(RAW, 'bbox.json'), 'w'), indent=1)

