# Ole Kirk puppet prep (after figmakit/tools/chroma.py + nostub.py). Idempotent.
# 1) remove the tie knot from every expression head: the torso already has its knot, a second one on the head = "double knot".
# 2) bake a soft contact shadow of the head's collar/chin onto the torso shirt, so the head sits IN the collar, not on top of it.
import glob, cv2, numpy as np
for f in sorted(glob.glob('head_*.png')):
    im = cv2.imread(f, cv2.IMREAD_UNCHANGED); h, w = im.shape[:2]
    b, g, r, a = [im[..., i].astype(np.float32) for i in range(4)]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    yy, xx = np.mgrid[0:h, 0:w]
    tie = (lum < 95) & (r > b) & (yy > 345) & (xx > 95) & (xx < 205) & (a > 0)
    tie = cv2.dilate(tie.astype(np.uint8), np.ones((5, 5), np.uint8))
    tie = cv2.GaussianBlur(tie.astype(np.float32), (0, 0), 1.5)
    im[..., 3] = (a * (1 - np.clip(tie * 1.4, 0, 1))).astype(np.uint8)
    cv2.imwrite(f, im)
t = cv2.imread('torso_nostub.png', cv2.IMREAD_UNCHANGED).astype(np.float32)
h, w = t.shape[:2]; sh = np.zeros((h, w), np.float32)
cv2.ellipse(sh, (270, 98), (78, 22), 0, 0, 360, 1.0, -1)                  # under the head's collar line (knot at 270,74)
sh = cv2.GaussianBlur(sh, (0, 0), 9) * 0.28
for c in range(3): t[..., c] *= (1 - sh)
cv2.imwrite('torso.png', t.astype(np.uint8)); print('ok')
