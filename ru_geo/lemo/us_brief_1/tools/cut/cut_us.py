"""Cut-outs and prints for universe_size part 1 (all NASA, public domain; ru_geo/universe_size/archive/img).
  earth    blue_marble.jpg   disk: fitted circle on the lit pixels, soft edge
  neptune  neptune.jpg       disk: fitted circle
  print_voyager / print_launch / print_dsn / print_sun   uncut crops on photo paper (kit/tools/make_print.py logic)
Output at the photo's own resolution with the shared grade. usage: python3 -I cut_us.py <img dir> <film dir>"""
import sys, json, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
S, D = sys.argv[1], sys.argv[2]; O = os.path.join(D, 'kit/objects'); os.makedirs(O, exist_ok=True)
def grade(rgb, sat=.8):
    hsv = np.asarray(rgb.convert('HSV')).astype(np.float32); hsv[..., 1] *= sat
    g = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)
    g = g * .95 + 10; g[..., 0] *= 1.03; g[..., 2] *= .97
    return Image.fromarray(np.clip(g, 0, 255).astype(np.uint8))
def save(id, img, mask, credit, how, anchors=None):
    out = grade(img); out.putalpha(mask); bb = out.getbbox(); out = out.crop(bb); out.save(os.path.join(O, id + '.png'))
    json.dump(dict(id=id, size=list(out.size), anchors=anchors or {}, credit=credit, how=how), open(os.path.join(O, id + '.json'), 'w'), indent=1)
    print(id, out.size)
def disk(file, id, thr, credit, shrink=2):
    im = Image.open(os.path.join(S, file)).convert('RGB'); a = np.asarray(im).astype(np.float32)
    lit = a.max(-1) > thr; lab, n = ndi.label(lit); sz = ndi.sum(lit, lab, range(1, n + 1)); lit = lab == 1 + int(np.argmax(sz))
    ys, xs = np.nonzero(lit); cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2; r = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 - shrink
    Y, X = np.mgrid[:a.shape[0], :a.shape[1]]; d = np.hypot(X - cx, Y - cy)
    m = np.clip((r - d) / 1.5 + .5, 0, 1)
    save(id, im, Image.fromarray((m * 255).astype(np.uint8)), credit, f'circle fitted to lit pixels (max channel > {thr}): c=({cx:.0f},{cy:.0f}) r={r:.0f}')
CR = lambda t, p: dict(title=t, author='NASA', licence='public domain', source=p)
disk('blue_marble.jpg', 'earth', 14, CR('NASA Blue Marble 2007 West', 'https://images.nasa.gov/details/GSFC_20171208_Archive_e002131'))
disk('neptune.jpg', 'neptune', 45, CR('Neptune (Voyager 2)', 'https://images.nasa.gov/details/8910708'))
def prt(file, id, crop, w, sat=.85, border=.045):
    im = Image.open(os.path.join(S, file)).convert('RGB').crop(crop)
    if w < im.width: im = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
    x = np.asarray(im, np.float32) / 255; lum = (x * [.2126, .7152, .0722]).sum(-1, keepdims=True); x = lum + (x - lum) * sat
    im = Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)); bd = round(im.width * border)
    p = Image.new('RGBA', (im.width + 2 * bd, im.height + 2 * bd), (250, 249, 245, 255)); p.paste(im, (bd, bd)); p.save(os.path.join(O, id + '.png'))
    json.dump(dict(id=id, w=p.width, h=p.height, anchors={}, print=True, prep=dict(src=file, crop=crop, border=border, sat=sat)), open(os.path.join(O, id + '.json'), 'w'), indent=1)
    print(id, p.size)
prt('voyager_launch.jpg', 'print_launch', (300, 0, 1620, 1900), 1320)
prt('dsn_antenna.jpg', 'print_dsn', (900, 150, 1900, 1100), 1000)
prt('sun_img.jpg', 'print_sun', (700, 150, 1920, 1473), 1220)
prt('voyager_craft.jpg', 'print_voyager', (180, 120, 1500, 1200), 1320, sat=.9)
