"""A print texture: a public-domain NASA image in colour, resized to at most <maxw> px wide, on a 40 px paper margin.
Nothing is added to the picture itself. usage: python -I tools/prep.py <src.jpg> <dir> <name> <maxw>"""
import sys, os
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
src, D, name, maxw = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
im = Image.open(src).convert('RGB')
if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
im = np.asarray(im, dtype=np.float32) / 255.0
h, w = im.shape[:2]; M = 40
paper = np.ones((h + 2 * M, w + 2 * M, 3), np.float32) * np.array([0.925, 0.915, 0.885], np.float32)
rng = np.random.default_rng(7)
paper *= 1 + (rng.standard_normal(paper.shape[:2])[..., None] * 0.012)
paper[M:M + h, M:M + w] = im
out = (np.clip(paper, 0, 1) * 255 + 0.5).astype(np.uint8)
os.makedirs(os.path.join(D, 'assets', 'tex'), exist_ok=True)
Image.fromarray(out).save(os.path.join(D, 'assets', 'tex', name), quality=95)
print(name, 'image', (w, h), 'print', (w + 2 * M, h + 2 * M))
