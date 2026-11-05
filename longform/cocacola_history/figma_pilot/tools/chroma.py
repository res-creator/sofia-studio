# Chroma-key a green-screen sheet from Figma AI into separate RGBA sprites (one per figure/object, sorted left->right, top->bottom).
# Green dominance -> alpha, despill of green fringes, connected components -> crops. Usage: python chroma.py sheet.png out_prefix [min_area]
import sys, numpy as np, cv2
src, pre = sys.argv[1], sys.argv[2]; min_area = int(sys.argv[3]) if len(sys.argv) > 3 else 4000
img = cv2.imread(src).astype(np.float32); b, g, r = img[..., 0], img[..., 1], img[..., 2]
dom = g - np.maximum(r, b)                                   # how much greener than the other channels
alpha = np.clip(1.0 - (dom - 25) / 60.0, 0, 1)               # >85 -> background, <25 -> subject
a8 = (alpha * 255).astype(np.uint8)
a8 = cv2.morphologyEx(a8, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
img[..., 1] = np.minimum(g, np.maximum(r, b) + 8)            # despill
solid = (a8 > 128).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(solid, np.ones((9, 9), np.uint8)))
items = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > min_area]
items.sort(key=lambda i: (round(st[i, cv2.CC_STAT_TOP] / 300), st[i, cv2.CC_STAT_LEFT]))
for k, i in enumerate(items):
    x, y, w, h = st[i, :4]; m = (lab[y:y + h, x:x + w] == i)
    rgba = np.dstack([img[y:y + h, x:x + w], a8[y:y + h, x:x + w] * m]).astype(np.uint8)
    cv2.imwrite(f'{pre}_{k}.png', rgba); print(f'{pre}_{k}.png', x, y, w, h)
