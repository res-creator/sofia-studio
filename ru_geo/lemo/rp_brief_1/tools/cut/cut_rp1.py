"""Cut-outs and prints for remote_places part 1 (ru_geo/remote_places/archive/img; licences in archive/credits.json).
  iss          iss_station.jpg (NASA/Roscosmos, public domain): the station keyed off black space (max channel above the
               local background, closed, holes filled, largest parts kept), crop y < 1000 (the Earth below is left out)
  print_verne  nemo_verne.jpg (A. de Neuville, public domain / CC0): uncut crop on photo paper, the engraver's signature cropped off
  print_shelf  ice_shelf_edge.jpg (NASA / Maria-Jose Vinas, public domain): uncut crop on photo paper
Output at the photo's own resolution with the shared grade. usage: python3 -I cut_rp1.py <img dir> <film dir>"""
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
# --- the ISS
im = Image.open(os.path.join(S, 'iss_station.jpg')).convert('RGB').crop((0, 0, 1920, 1000)); a = np.asarray(im).astype(np.float32)
mx = a.max(-1); bg = ndi.uniform_filter1d(np.percentile(mx, 25, axis=1), 41)[:, None]   # background per row (space brightens toward the Earth)
fg = mx > bg + 32
fg = ndi.binary_closing(fg, iterations=3) & (mx > bg + 26)   # closing links the parts; near-background pixels stay out
holes = ndi.binary_fill_holes(fg) & ~fg; hl, hn = ndi.label(holes); hs = ndi.sum(holes, hl, range(1, hn + 1))
fg |= np.isin(hl, [i + 1 for i, s in enumerate(hs) if s < 2500])   # small holes only: the space seen between modules stays open
lab, n = ndi.label(fg); sz = ndi.sum(fg, lab, range(1, n + 1)); keep = [i + 1 for i, s in enumerate(sz) if s > 1500]
m = np.isin(lab, keep); m = ndi.binary_opening(m, iterations=1)
mk = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))
save('iss', im, mk, dict(title='International Space Station from Soyuz MS-08 (2018)', author='NASA / Roscosmos', licence='public domain',
     source='ru_geo/remote_places/archive/img/iss_station.jpg'), f'keyed off black space: max channel > row background (25th percentile, smoothed) + 32, kept > +26, closed x3, holes < 2500 px filled, parts > 1500 px; crop 0,0,1920,1000')
# --- prints
def prt(file, id, crop, w, sat=.85, border=.045):
    im = Image.open(os.path.join(S, file)).convert('RGB').crop(crop)
    if w < im.width: im = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
    x = np.asarray(im, np.float32) / 255; lum = (x * [.2126, .7152, .0722]).sum(-1, keepdims=True); x = lum + (x - lum) * sat
    im = Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)); bd = round(im.width * border)
    p = Image.new('RGBA', (im.width + 2 * bd, im.height + 2 * bd), (250, 249, 245, 255)); p.paste(im, (bd, bd)); p.save(os.path.join(O, id + '.png'))
    json.dump(dict(id=id, w=p.width, h=p.height, anchors={}, print=True, prep=dict(src=file, crop=crop, border=border, sat=sat)), open(os.path.join(O, id + '.json'), 'w'), indent=1)
    print(id, p.size)
prt('nemo_verne.jpg', 'print_verne', (0, 230, 1323, 1850), 1323, sat=1)
prt('ice_shelf_edge.jpg', 'print_shelf', (0, 0, 1920, 1440), 1920, sat=.9)
