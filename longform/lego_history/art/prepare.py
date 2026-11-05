# Same upscale as figmakit/tools/prepare.py (plates x1.875, props x1.5, Lanczos + gentle unsharp) for THIS film's assets in art/.
# Output: art/cache/ (git-ignored). Run: python3 art/prepare.py
import cv2, glob, os
ART = os.path.dirname(os.path.abspath(__file__))
def up(src, dst, k):
    im = cv2.imread(src, cv2.IMREAD_UNCHANGED); h, w = im.shape[:2]
    o = cv2.resize(im, (int(w * k), int(h * k)), interpolation=cv2.INTER_LANCZOS4)
    rgb = o[..., :3]; bl = cv2.GaussianBlur(rgb, (0, 0), 1.2); o[..., :3] = cv2.addWeighted(rgb, 1.35, bl, -0.35, 0)
    os.makedirs(os.path.dirname(dst), exist_ok=True); cv2.imwrite(dst, o)
for kind, k in (('backgrounds', 1.875), ('props', 1.5)):
    for f in glob.glob(f'{ART}/{kind}/*.png'):
        d = f'{ART}/cache/{kind}/' + os.path.basename(f)
        if not os.path.exists(d) or os.path.getmtime(d) < os.path.getmtime(f): up(f, d, k); print('cached', d)
