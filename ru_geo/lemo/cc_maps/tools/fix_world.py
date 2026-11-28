"""Remove the bright cloud streak over Ireland in assets/world.jpg (a cloud remnant of the z4 mosaic; it shows in the
Sealand fly-in). Inside lat 51–56 N, lon 11–5 W, pixels clearly brighter than their 9×9 median take that median colour.
usage: python3 -I tools/fix_world.py <clip dir>   (idempotent enough: the second run finds nothing left to change)"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
D = sys.argv[1]; P = os.path.join(D, 'assets', 'world.jpg')
im = np.asarray(Image.open(P).convert('RGB'), np.float64); H, W = im.shape[:2]
x0, x1 = int((-11 + 180) / 360 * W), int((-5 + 180) / 360 * W); y0, y1 = int((90 - 56) / 180 * H), int((90 - 51) / 180 * H)
c = im[y0:y1, x0:x1].copy(); l = c.mean(-1)
med = np.stack([ndimage.median_filter(c[..., k], 11) for k in range(3)], -1); lm = med.mean(-1)
m = ndimage.binary_dilation(l > lm * 1.12 + 3, iterations=2)
c[m] = med[m]; im[y0:y1, x0:x1] = c
Image.fromarray(np.clip(im + .5, 0, 255).astype(np.uint8)).save(P, quality=95)
print('pixels replaced:', int(m.sum()))
