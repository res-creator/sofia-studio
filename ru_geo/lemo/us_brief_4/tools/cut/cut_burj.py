"""Burj Khalifa cut-out from ph_burj.jpg (CC0, Meandmybrix): sky key inside a hand polygon, largest piece,
soft edge, shared grade. Output at the photo's own resolution: kit/objects/burj.png + burj.json.
usage: python -I cut_burj.py <photo> <film dir>"""
import sys, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
src, D = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
x0, y0, x1, y1 = 570, 200, 870, 1080
c = im.crop((x0, y0, x1, y1)); a = np.asarray(c).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
sky = (b > 180) & (b - r > 62)
fg = ~sky
poly = [(806 - x0, 203 - y0), (818 - x0, 203 - y0), (845 - x0, 985 - y0), (777 - x0, 1026 - y0), (775 - x0, 1080 - y0), (575 - x0, 1080 - y0), (578 - x0, 835 - y0)]
pm = Image.new('L', c.size, 0); ImageDraw.Draw(pm).polygon(poly, fill=255)
fg &= np.asarray(pm) > 0
lab, n = ndi.label(fg); sizes = ndi.sum(fg, lab, range(1, n + 1)); fg = lab == (1 + int(np.argmax(sizes)))
fg = ndi.binary_fill_holes(fg)
m = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
# shared grade: lower saturation, a touch warmer, lifted blacks
hsv = np.asarray(c.convert('HSV')).astype(np.float32); hsv[..., 1] *= .72
g2 = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)
g2 = g2 * .93 + 14; g2[..., 0] *= 1.04; g2[..., 2] *= .96
out = Image.fromarray(np.clip(g2, 0, 255).astype(np.uint8)); out.putalpha(m)
bb = out.getbbox(); out = out.crop(bb)
os.makedirs(os.path.join(D, 'kit/objects'), exist_ok=True)
out.save(os.path.join(D, 'kit/objects/burj.png'))
w, h = out.size
meta = {"id": "burj", "size": [w, h], "anchors": {"top": [(812 - x0 - bb[0]) / w, 0.0], "base": [0.5, 1.0]},
        "credit": {"title": "Burj Khalifa Image.jpg", "author": "Meandmybrix", "licence": "CC0", "source": "https://commons.wikimedia.org/wiki/File:Burj_Khalifa_Image.jpg"},
        "how": "sky key (b>180, b-r>62) inside a hand polygon, largest piece, soft edge; photo's own resolution"}
json.dump(meta, open(os.path.join(D, 'kit/objects/burj.json'), 'w'), indent=1)
print('burj', w, h)
