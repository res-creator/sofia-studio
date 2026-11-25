"""Sea mask from OpenStreetMap coastlines (raw/coast.json, ODbL): coastline ways drawn as barriers on the image grid,
then the sea is flood-filled from known sea points. Used because the terrain tiles fill Passage Canal and other fjords
with false positive heights here.  mask(raw_dir, bbox, z, merc_box, size, seeds) -> bool array (True = sea)"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def merc(lon, lat, z):
    n = 2 ** z * 256
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


def mask(raw, z, mbox, size, seeds):
    x0, y0, x1, y1 = mbox; W, H = size
    im = Image.new('L', size, 0); dr = ImageDraw.Draw(im)
    for e in json.load(open(os.path.join(raw, 'coast.json')))['elements']:
        pts = []
        for g in e.get('geometry', []):
            x, y = merc(g['lon'], g['lat'], z)
            pts.append(((x - x0) / (x1 - x0) * W, (y - y0) / (y1 - y0) * H))
        if len(pts) > 1: dr.line(pts, fill=255, width=3)
    wall = np.asarray(im) > 0
    lab, n = ndimage.label(~wall)
    sea = np.zeros_like(wall)
    for lon, lat in seeds:
        x, y = merc(lon, lat, z); c = int((x - x0) / (x1 - x0) * W); r = int((y - y0) / (y1 - y0) * H)
        if 0 <= r < H and 0 <= c < W and lab[r, c]: sea |= lab == lab[r, c]
    return sea | (wall & ndimage.binary_dilation(sea, iterations=3))
