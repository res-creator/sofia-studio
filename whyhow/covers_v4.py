# Thumbnails v4 — "White over footage + one coral word" design system (designer spec, Nov 26 2026).
# Inter Display Black caps, -0.02em tracking, hanging coral plate, white location kicker, clean grade, local scrim.
# Run: python3 covers_v4.py   (writes *_cover_G.jpg / *_cover_H.jpg + phone-size previews to stdout list)
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1280, 720
import os, json
CORAL = tuple(json.loads(os.environ.get('PLATE', '[228,87,46]'))); PTXT = tuple(json.loads(os.environ.get('PTXT', '[255,255,255]'))); INK = (16, 18, 20); NAVY = np.array([20, 26, 33], float)
FD = '/usr/share/fonts/opentype/inter/'
BLACK, SEMI = FD + 'InterDisplay-Black.otf', FD + 'InterDisplay-SemiBold.otf'

def crop(path, zoom=1.0, ax=0.5, ay=0.5):
    im = Image.open(path).convert('RGB'); s = max(W / im.width, H / im.height) * zoom
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = round((im.width - W) * ax); y = round((im.height - H) * ay); return im.crop((x, y, x + W, y + H))

def grade(im, sat=1.08, teal=0.0, warm=0.0):
    a = np.asarray(im).astype(float) / 255
    for c in range(3):  # dehaze: per-channel levels
        lo, hi = np.percentile(a[..., c], 4), np.percentile(a[..., c], 99.5); a[..., c] = np.clip((a[..., c] - lo) / max(hi - lo, 1e-3), 0, 1)
    a = a + 0.10 * (a - 0.5) * (1 - np.abs(2 * a - 1))            # gentle S-curve
    a = np.clip(a, 0, 1); L = a @ [0.2126, 0.7152, 0.0722]
    a = L[..., None] + (a - L[..., None]) * sat                    # saturation
    if teal: b = (a[..., 2] > a[..., 0]) ; a[..., 1] += teal * 0.04 * b; a[..., 0] -= teal * 0.05 * b
    if warm: a[..., 0] += warm * 0.03 * L; a[..., 2] -= warm * 0.03 * L
    sh = np.clip(1 - L / 0.45, 0, 1)[..., None] * 0.35              # split tone: shadows toward video navy
    a = a * (1 - sh) + (NAVY / 255) * sh
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))

def overlay(im, side='left', blob=None, scrim=0.60):
    a = np.asarray(im).astype(float); X = np.linspace(0, 1, W)[None, :]
    g = np.clip(1 - (X if side == 'left' else 1 - X) / 0.55, 0, 1) * scrim
    if blob: cx, cy, rx, ry = blob; yy, xx = np.mgrid[0:H, 0:W]; g = np.maximum(g, np.clip(1 - ((xx - cx) / rx) ** 2 - ((yy - cy) / ry) ** 2, 0, 1) * 0.35)
    yy, xx = np.mgrid[0:H, 0:W]; d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    g = 1 - (1 - g) * (1 - np.clip((d - 0.55) / 0.45, 0, 1) * 0.22)
    a = a * (1 - g[..., None]) + np.array(INK) * g[..., None]; return Image.fromarray(a.astype(np.uint8))

def track_text(d, x, y, s, font, track, fill):
    for ch in s: d.text((x, y), ch, font=font, fill=fill); x += font.getlength(ch) + track
def width(s, font, track): return sum(font.getlength(c) for c in s) + track * (len(s) - 1)

def compose(src, out, kicker, setup, payoff, x0, top, s1, s2, side='left', arrow=None, gr={}, crop_={}, blob=None, scrim=0.60):
    im = overlay(grade(crop(src, **crop_), **gr), side, blob, scrim).convert('RGBA')
    f1, f2, fk = ImageFont.truetype(BLACK, s1), ImageFont.truetype(BLACK, s2), ImageFont.truetype(SEMI, 30)
    cap1, cap2 = 0.735 * s1, 0.735 * s2; t1, t2 = -0.02 * s1, -0.02 * s2
    top1 = lambda f: f.getbbox('H')[1]                                  # distance from draw y to cap-top
    # text shadow layer
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sh); fg = Image.new('RGBA', (W, H), (0, 0, 0, 0)); df = ImageDraw.Draw(fg)
    # kicker: 3x36 bar + spaced caps, baseline 30 px above setup cap-top
    kb = top - 30; df.rectangle((x0, kb - 30, x0 + 2, kb + 6), fill=(255, 255, 255, 235))
    track_text(df, x0 + 15, kb - fk.getbbox('H')[3], kicker, fk, 0.16 * 30, (255, 255, 255, 235))
    track_text(ds, x0, top + 3 - top1(f1), setup, f1, t1, (0, 0, 0, 115)); track_text(df, x0, top - top1(f1), setup, f1, t1, (255, 255, 255, 255))
    # hanging coral plate
    pad = 0.20 * s2; ptop = top + cap1 + 0.22 * s1 + 0.1 * s1; pw = width(payoff, f2, t2) + 2 * pad; ph = cap2 + 2 * pad
    df.rounded_rectangle((x0 - pad, ptop, x0 - pad + pw, ptop + ph), 10, fill=CORAL + (255,))
    track_text(df, x0, ptop + pad - top1(f2), payoff, f2, t2, PTXT + (255,))
    if arrow:  # tapered white bezier + open chevron head
        (p0, p1, p2, p3) = [np.array(p, float) for p in arrow]; pts = [((1 - t) ** 3) * p0 + 3 * ((1 - t) ** 2) * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3 for t in np.linspace(0, 1, 60)]
        for k in range(len(pts) - 1):
            w = 8 + 8 * k / len(pts); ds.line([tuple(pts[k] + 3), tuple(pts[k + 1] + 3)], fill=(0, 0, 0, 115), width=round(w)); df.line([tuple(pts[k]), tuple(pts[k + 1])], fill='white', width=round(w))
            df.ellipse([*(pts[k] - w / 2), *(pts[k] + w / 2)], fill='white')
        tip = pts[-1]; dvec = pts[-1] - pts[-4]; ang = np.arctan2(dvec[1], dvec[0])
        for s in (+1, -1):
            a2 = ang + np.pi + s * np.radians(38); e = tip + 40 * np.array([np.cos(a2), np.sin(a2)])
            df.line([tuple(tip), tuple(e)], fill='white', width=16); df.ellipse([*(e - 8), *(e + 8)], fill='white'); df.ellipse([*(tip - 8), *(tip + 8)], fill='white')
    sh = sh.filter(ImageFilter.GaussianBlur(7))
    im = Image.alpha_composite(Image.alpha_composite(im, sh), fg).convert('RGB').filter(ImageFilter.UnsharpMask(1.0, 60, 2))
    if os.environ.get('OUTDIR'): out = os.path.join(os.environ['OUTDIR'], os.path.basename(out).replace('.jpg', os.environ.get('SUF', '') + '.jpg'))
    im.save(out, quality=92); return out

SUF = os.environ.get('SUF', '')
outs = [
 compose('ep14_singapore/footage/cm_gardens_by_the_bay_aerial.jpg', 'ep14_singapore/singapore_cover_G.jpg', 'SINGAPORE', 'THIS WAS', 'SEA', 690, 142, 108, 170, side='right', gr=dict(sat=1.08, teal=1), crop_=dict(zoom=1.2, ax=0.12, ay=0.5)),
 compose('ep14_singapore/cover_src_drone4s.jpg', 'ep14_singapore/singapore_cover_H.jpg', 'SINGAPORE', 'THIS WAS', 'SEA', 64, 150, 108, 170, gr=dict(sat=1.08, teal=1)),
 compose('ep15_dubai/footage/gov_nasa_iss_2014_palm_jumeirah.jpg', 'ep15_dubai/dubai_cover_G.jpg', 'DUBAI', 'THEY DRINK', 'THE SEA', 64, 220, 84, 124,
         gr=dict(sat=1.1, teal=1.5, warm=1), crop_=dict(zoom=1.12, ax=0.0, ay=0.45), scrim=0.45),
 compose('ep15_dubai/footage/gov_nasa_iss_2014_palm_world_islands.jpg', 'ep15_dubai/dubai_cover_H.jpg', 'DUBAI', 'THEY DRINK', 'THE SEA', 64, 150, 96, 136, gr=dict(sat=1.1, teal=1.5, warm=1), scrim=0.4),
 compose('ep16_tokyo/footage/cm_e235_yamanote_shibuya_2026.jpg', 'ep16_tokyo/tokyo_cover_G.jpg', 'TOKYO', '20 SECONDS', 'EARLY', 64, 180, 82, 150,
         gr=dict(sat=1.05), crop_=dict(zoom=1.0, ax=0.5, ay=0.22), scrim=0.62),
 compose('ep16_tokyo/footage/pxp_packed_platform_shibuya.jpg', 'ep16_tokyo/tokyo_cover_H.jpg', 'TOKYO', '40 MILLION', 'A DAY', 64, 150, 116, 160, gr=dict(sat=1.05)),
]
print('\n'.join(outs))
