# Remove the hollow sleeve stubs that the generator draws on a jacket/shirt torso: erase everything below a diagonal from the outer shoulder
# to the armpit (feathered), keeping the rounded shoulder caps. Arms are then drawn BEHIND the torso, their tops hidden under the caps.
# Usage: python3 nostub.py torso.png out.png  x_outer y_outer  x_armpit y_armpit  x_hip y_hem      (left side in px; right side is mirrored)
# Example (Candler): python3 nostub.py torso.png torso_nostub.png 52 150 128 330 110 520
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]; xo, yo, xa, ya, xh, yh = map(int, sys.argv[3:9])
im = cv2.imread(src, cv2.IMREAD_UNCHANGED); h, w = im.shape[:2]
L = np.array([(0, yo), (xo, yo), (xa, ya), (xa - 12, ya + 60), (xh, yh), (0, yh)], np.int32)
R = np.array([(w - x, y) for x, y in L], np.int32)
m = np.zeros((h, w), np.uint8); cv2.fillPoly(m, [L, R], 255); m = cv2.GaussianBlur(m, (0, 0), 3)
im[..., 3] = (im[..., 3].astype(np.float32) * (1 - m / 255.0)).astype(np.uint8); cv2.imwrite(dst, im); print('ok', dst)
