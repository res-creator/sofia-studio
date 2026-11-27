"""The print texture: the Commons scan (1920x1080, a later drawing, public domain) on a 40 px paper margin.
Nothing is added to the picture itself. usage: python -I tools/prep.py <src.jpg> <dir>"""
import sys, os
import numpy as np
from PIL import Image
src, D = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('L'), dtype=np.float32) / 255.0
h, w = im.shape; M = 40
paper = np.ones((h + 2 * M, w + 2 * M, 3), np.float32) * np.array([0.925, 0.915, 0.885], np.float32)
rng = np.random.default_rng(7)
paper *= 1 + (rng.standard_normal(paper.shape[:2])[..., None] * 0.012)
tint = np.array([1.0, 0.99, 0.965], np.float32)
paper[M:M + h, M:M + w] = im[..., None] * tint
out = (np.clip(paper, 0, 1) * 255 + 0.5).astype(np.uint8)
Image.fromarray(out).save(os.path.join(D, 'assets', 'tex', 'print.jpg'), quality=95)
print('print.jpg', out.shape)
