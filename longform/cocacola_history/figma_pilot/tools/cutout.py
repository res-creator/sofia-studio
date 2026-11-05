# Cut a subject out of an illustration with OpenCV GrabCut (local, no downloaded models) inside a box, then make a clean background plate
# (OpenCV inpaint behind the subject) so the subject can move as its own layer.
# Usage: python cutout.py in.png out_prefix x0 y0 x1 y1 [iters]   -> out_prefix_cut.png (RGBA), out_prefix_plate.png
import sys, numpy as np, cv2
src, pre = sys.argv[1], sys.argv[2]; x0, y0, x1, y1 = map(int, sys.argv[3:7]); it = int(sys.argv[7]) if len(sys.argv) > 7 else 6
img = cv2.imread(src); H, W = img.shape[:2]
mask = np.zeros((H, W), np.uint8); bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, (x0, y0, x1 - x0, y1 - y0), bgd, fgd, it, cv2.GC_INIT_WITH_RECT)
fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(fg); keep = np.zeros_like(fg)
if n > 1:
    big = st[1:, cv2.CC_STAT_AREA].max()
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 0.04 * big: keep[lab == i] = 255
alpha = cv2.GaussianBlur(keep, (5, 5), 0)
cv2.imwrite(f'{pre}_cut.png', np.dstack([img, alpha]))
hole = cv2.dilate(keep, np.ones((17, 17), np.uint8))
cv2.imwrite(f'{pre}_plate.png', cv2.inpaint(img, hole, 11, cv2.INPAINT_TELEA)); print('ok', pre)
