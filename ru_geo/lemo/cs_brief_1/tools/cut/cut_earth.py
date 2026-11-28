#!/usr/bin/env python3
"""Earth cut-out from blue_marble.jpg (NASA, public domain): the disc on black is cut by a circle fitted to the
lit pixels (threshold 25), edge feathered 2 px, the shared grade (sat .85, a touch warmer). → kit/objects/earth.png
    python3 -I tools/cut/cut_earth.py <film dir>"""
import json, os, sys
import numpy as np
from PIL import Image
D = sys.argv[1]; SRC = '/home/user/sofia-studio/ru_geo/universe_size/archive/img/blue_marble.jpg'
im = Image.open(SRC).convert('RGB'); a = np.asarray(im, np.float32)
ys, xs = np.nonzero(a.mean(2) > 25); cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
r = ((xs.max() - xs.min()) + (ys.max() - ys.min())) / 4 - 2
x0, y0, x1, y1 = int(cx - r - 4), int(cy - r - 4), int(cx + r + 4), int(cy + r + 4)
a = a[y0:y1, x0:x1] / 255; yy, xx = np.mgrid[y0:y1, x0:x1]
alpha = np.clip((r - np.hypot(xx - cx, yy - cy)) / 2 + .5, 0, 1)
lum = (a * [.2126, .7152, .0722]).sum(-1, keepdims=True); a = lum + (a - lum) * .85
a = a * [1.02, 1.0, .97] * .96 + .03
out = np.dstack([np.clip(a, 0, 1), alpha]); Image.fromarray((out * 255).astype(np.uint8), 'RGBA').save(os.path.join(D, 'kit/objects/earth.png'), optimize=True)
json.dump({'id': 'earth', 'size': [x1 - x0, y1 - y0], 'anchors': {}, 'credit': {'title': 'NASA Blue Marble 2007 West', 'author': 'NASA', 'licence': 'public domain',
           'page': 'https://images.nasa.gov/details/GSFC_20171208_Archive_e002131'}, 'prep': 'tools/cut/cut_earth.py: circle fitted to the lit disc'},
          open(os.path.join(D, 'kit/objects/earth.json'), 'w'), indent=1)
print('earth', x1 - x0, y1 - y0, 'r', r)
