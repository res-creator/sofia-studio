# Chroma key for sheets that contain GREEN objects (green bricks, trees, lime pieces).
# figmakit/tools/chroma.py keys on "green dominance", which also removes green toys. Here only key-coloured pixels that are
# CONNECTED TO THE SHEET BORDER count as background; everything enclosed by an object stays opaque (glossy green highlights).
# Usage: python3 art/key.py sheet.png out_prefix [min_area] [--glass] [--holes]  -> out_prefix_<k>.png, k = cell of the 4x2 grid (row*4+col)
import sys, numpy as np, cv2
glass = '--glass' in sys.argv; holes = '--holes' in sys.argv; argv = [a for a in sys.argv if a not in ('--glass', '--holes')]   # --holes: enclosed pure-key gaps (film reel, cart, between legs) -> transparent   # --glass: key colour seen THROUGH windows -> dark glass
src, pre = argv[1], argv[2]; min_area = int(argv[3]) if len(argv) > 3 else 3000
img = cv2.imread(src).astype(np.float32); H, W = img.shape[:2]
corners = np.concatenate([img[:6, :6].reshape(-1, 3), img[:6, -6:].reshape(-1, 3), img[-6:, :6].reshape(-1, 3), img[-6:, -6:].reshape(-1, 3)])
bg = np.median(corners, 0)
d = np.sqrt(((img - bg) ** 2).sum(-1))
cand = (d < 70).astype(np.uint8)                                       # key-coloured pixels
n, lab, st, _ = cv2.connectedComponentsWithStats(cand, connectivity=4)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
true_bg = np.isin(lab, list(border))
for j in range(1, n):                                                  # large enclosed key-coloured areas (e.g. inside a ring) are background too
    if j not in border and (st[j, cv2.CC_STAT_AREA] > 1500 or (holes and st[j, cv2.CC_STAT_AREA] > 25 and d[lab == j].mean() < 32)): true_bg |= (lab == j)
if glass:
    enc = (cand > 0) & ~true_bg; enc = cv2.dilate(enc.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & ~true_bg
    img[enc] = (52, 58, 66)
    b0, g0, r0 = img[..., 0], img[..., 1], img[..., 2]
    leak = (g0 > 170) & (g0 - np.maximum(r0, b0) > 85) & ~true_bg            # bright key green seen through glass
    leak[:, int(W * 0.75):][int(H / 2):] = False                                # keep the last cell (tree) untouched
    leak = cv2.dilate(leak.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & ~true_bg
    img[leak] = img[leak] * 0.25 + np.array([60, 66, 72]) * 0.75
ring = cv2.dilate(true_bg.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)   # soft edge zone next to background
soft = np.clip((d - 38) / 52.0, 0, 1)
alpha = np.where(true_bg, 0.0, np.where(ring, np.maximum(soft, 0.0), 1.0))
b, g, r = img[..., 0], img[..., 1], img[..., 2]
gs = np.minimum(g, np.maximum(r, b) + 10)
img[..., 1] = np.where(ring & ~true_bg, gs, g)                          # despill only on the edge ring
a8 = (alpha * 255).astype(np.uint8)
solid = (a8 > 128).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(solid, np.ones((7, 7), np.uint8)))
items = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > min_area]
cell = lambda i: (int((st[i, 1] + st[i, 3] / 2) > H / 2), int((st[i, 0] + st[i, 2] / 2) // (W / 4)))
items.sort(key=lambda i: (cell(i), -st[i, cv2.CC_STAT_AREA]))
seen = set()
for i in items:
    if cell(i) in seen: print('  extra fragment skipped', cell(i), st[i, :4]); continue
    seen.add(cell(i)); k = cell(i)[0] * 4 + cell(i)[1]
    x, y, w, h = st[i, :4]; m = (lab[y:y + h, x:x + w] == i)
    rgba = np.dstack([img[y:y + h, x:x + w], a8[y:y + h, x:x + w] * m]).astype(np.uint8)
    cv2.imwrite(f'{pre}_{k}.png', rgba); print(f'{pre}_{k}.png', x, y, w, h)
