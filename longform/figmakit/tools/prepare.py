# Upscale all plates (x1.875 -> 2880x1620) and props (x1.5) into cache/ with Lanczos + gentle unsharp, so camera push-ins stay crisp.
# cache/ is git-ignored; run once per machine: python3 tools/prepare.py   (needs opencv: pip install opencv-python-headless)
import cv2, glob, os
KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def up(src, dst, k):
    im = cv2.imread(src, cv2.IMREAD_UNCHANGED); h, w = im.shape[:2]
    o = cv2.resize(im, (int(w * k), int(h * k)), interpolation=cv2.INTER_LANCZOS4)
    rgb = o[..., :3]; bl = cv2.GaussianBlur(rgb, (0, 0), 1.2); o[..., :3] = cv2.addWeighted(rgb, 1.35, bl, -0.35, 0)
    os.makedirs(os.path.dirname(dst), exist_ok=True); cv2.imwrite(dst, o)
for kind, k in (('backgrounds', 1.875), ('props', 1.5)):
    for f in glob.glob(f'{KIT}/assets/{kind}/*.png'):
        d = f'{KIT}/cache/{kind}/' + os.path.basename(f)
        if not os.path.exists(d) or os.path.getmtime(d) < os.path.getmtime(f): up(f, d, k); print('cached', d)
