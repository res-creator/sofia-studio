# Harvey — numbered demo reel of animation/graphics options for the owner to pick from (about 1 minute, with music).
# All pictures are our verified material: DVIDS/NOAA public-domain footage and photos, NOAA/NWS data, NWS Service Assessment.
# Music: Mixkit "Vertigo" (597, Mixkit Stock Music Free License). Output: harvey/review/harvey_demo_reel.mp4 (+ _phone).
import importlib.util, os, subprocess, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
sp = importlib.util.spec_from_file_location('ss', ROOT + '/tools/style_samples.py'); ss = importlib.util.module_from_spec(sp); sp.loader.exec_module(ss)
m = ss.m; F = ss.F; INTER = ss.INTER; tx = ss.tx
W, H, FPS = 1280, 720, 25
RAW = ROOT + '/assets/raw'; TMP = os.environ.get('DEMO_TMP', '/tmp/harvey_demo'); os.makedirs(TMP, exist_ok=True)
ss.W, ss.H = W, H   # style helpers draw at this size
def ease(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
def seg(t, a, b): return ease((t - a) / (b - a))
def clip_frames(src, start, secs, blur=0):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(start), '-t', str(secs), '-i', f'{RAW}/dvids/dvids_{src}.mp4', '-vf',
                          f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3); return [Image.fromarray(x) for x in a]
def badge(im, n, name):
    d = ImageDraw.Draw(im, 'RGBA')
    d.rounded_rectangle([28, 24, 128, 124], 18, fill=(255, 196, 40, 240)); tx(d, (78, 74), str(n), F(INTER('k'), 64), (15, 15, 15), 'mm')
    d.rounded_rectangle([140, 52, 140 + 14 * len(name) + 40, 98], 12, fill=(0, 0, 0, 170)); tx(d, (160, 75), name, F(INTER('b'), 24), (255, 255, 255), 'lm')
    return im
def grain(im, amt=14, seed=0):
    rng = np.random.default_rng(seed); a = np.asarray(im).astype(np.int16) + rng.normal(0, amt, (H, W, 1)).astype(np.int16)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# 1. Satellite zoom: from the Gulf coast down to the two dams; the bayou draws itself
def s1(t):
    span = math.exp(ss.math.log(700) + (math.log(28) - math.log(700)) * ease(min(1, t / 0.6)))
    lon = -95.4 + (-95.62 + 95.4) * ease(min(1, t / 0.6)); lat = 29.3 + (29.78 - 29.3) * ease(min(1, t / 0.6))
    c = m.Cam(lon, lat, span, W, H); im, d = m.base(c, 1, counties=span > 200)
    if span < 120:
        aim, z, x0, y0 = m.aerial(); a = min(1, (120 - span) / 70); m.raster_overlay(im, c, aim, z, x0, y0, alpha=a)
        im = Image.blend(im, Image.new('RGB', (W, H), (5, 10, 18)), 0.35 * a)
    if t > 0.62:
        m.raster_overlay(im, c, ss.pool_rgba((40, 150, 255), int(110 * seg(t, 0.62, 0.75)), edge=(120, 210, 255)), ss.Z, ss.X0, ss.Y0)
        k = seg(t, 0.65, 0.95); parts = []
        for p in ss.BAYOU:
            if len(p) > 1: parts.append(p[: max(2, int(len(p) * k))])
        if k > 0.02: ss.glow_line(im, c, parts, (90, 200, 255), 4, 8, 1)
    d = ImageDraw.Draw(im, 'RGBA')
    if t < 0.5: ss.label = None; m.label_at(d, c, -95.369, 29.760, 'HOUSTON', 1, sz=18, bold=True, mcol=(255, 255, 255))
    if t > 0.7:
        for lon_, lat_, n in ss.DAMS:
            p = c.ll(lon_, lat_); a = int(255 * seg(t, 0.7, 0.8)); d.ellipse([p[0] - 10, p[1] - 10, p[0] + 10, p[1] + 10], outline=(255, 170, 60, a), width=4)
            tx(d, (p[0] + 18, p[1] - 4), n, F(INTER('b'), 22), (255, 255, 255, a), 'ls', 3, (0, 0, 0, a))
    return im
# 2. Relief 3D: the pool rises inside the dams (elevation estimate), tilted terrain
REL = None
def s2(t):
    global REL
    c = ss.cam(-95.66, 29.78, 24)
    if REL is None:
        E = ss.E; gy, gx = np.gradient(E); light = np.clip(0.75 + (-gx * 0.6 - gy * 0.6) * 0.12, 0, 1.2); h = np.clip((E - 70) / 70, 0, 1)
        base = np.stack([110 + 100 * h, 112 + 90 * h, 96 + 70 * h], -1) * light[..., None]
        REL = Image.fromarray(np.concatenate([np.clip(base, 0, 255), np.full(E.shape + (1,), 255)], -1).astype(np.uint8), 'RGBA')
    im = Image.new('RGB', (W, H), (20, 22, 26)); m.raster_overlay(im, c, REL, ss.Z, ss.X0, ss.Y0)
    pim, z, x0, y0 = m.pool_image(0.15 + 0.85 * ease(t)); m.raster_overlay(im, c, pim, z, x0, y0)
    d = ImageDraw.Draw(im, 'RGBA'); ss.line(d, c, ss.BAYOU, (120, 210, 255, 255), 4)
    out = ss.tilt(im, 0.28 + 0.04 * ease(t)); d = ImageDraw.Draw(out, 'RGBA')
    tx(d, (W - 40, H - 40), 'Water rising behind the dams · elevation estimate', F(INTER('m'), 20), (220, 225, 230), 'rs')
    return out
# 3. Bars grow with counting numbers (broadcast style)
def s3(t):
    im = Image.new('RGB', (W, H), (12, 18, 40)); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 140, W, 210], fill=(230, 30, 50)); tx(d, (40, 175), 'RAIN SINCE SATURDAY 6 P.M.', F(INTER('k'), 36), (255, 255, 255), 'lm')
    for i, (st, vals) in enumerate(sorted(ss.G.items(), key=lambda kv: -kv[1][-1])):
        k = seg(t, 0.1 + i * 0.08, 0.6 + i * 0.08); v = vals[-1] * k; y = 250 + i * 88; L = (W - 470) * v / 12
        d.rectangle([200, y, 200 + L, y + 60], fill=(255, 205, 0) if st == 'HOU' else (0, 170, 255))
        tx(d, (170, y + 30), st, F(INTER('k'), 30), (255, 255, 255), 'rm'); tx(d, (215 + L, y + 30), f'{v:.1f} IN', F(INTER('k'), 34), (255, 255, 255), 'lm')
    return im
# 4. A line chart that draws itself on paper
def s4(t):
    im = ss.paper(W, H, seed=5); d = ImageDraw.Draw(im, 'RGBA'); x0, y0, x1, y1 = 140, 250, W - 230, H - 90
    for i in range(0, 61): x = x0 + (x1 - x0) * i / 60; d.line([(x, y0), (x, y1)], fill=(90, 140, 120, 60 if i % 4 else 120), width=1)
    for i in range(0, 25): y = y1 - (y1 - y0) * i / 24; d.line([(x0, y), (x1, y)], fill=(90, 140, 120, 60 if i % 2 else 120), width=1)
    tx(d, (60, 150), 'Rain at Houston airports', F(ss.SERIFB, 42), (50, 35, 25)); tx(d, (60, 200), 'Saturday 6 p.m. to Sunday 9 a.m., inches', F(ss.SERIF, 24), (70, 55, 40))
    k = seg(t, 0.05, 0.85) * 15
    for st, vals in ss.G.items():
        n = int(k); fr = k - n; pts = [(x0 + (x1 - x0) * i / 15, y1 - (y1 - y0) * v / 12) for i, v in enumerate(vals)]
        cur = pts[:n + 1]
        if n < 15: cur = cur + [(pts[n][0] + (pts[n + 1][0] - pts[n][0]) * fr, pts[n][1] + (pts[n + 1][1] - pts[n][1]) * fr)]
        hl = st == 'HOU'; d.line(cur, fill=(190, 30, 30, 255) if hl else (50, 40, 35, 150), width=6 if hl else 2, joint='curve')
        if hl: tx(d, (cur[-1][0] + 10, cur[-1][1] - 10), f'{vals[min(n, 15)]:.1f}"', F(ss.SERIFB, 30), (190, 30, 30), 'ls')
    return im
# 5. Big number counting over footage
F5 = None
def s5(t):
    global F5
    if F5 is None: F5 = clip_frames('546389', 44.0, 7.0)
    im = F5[min(len(F5) - 1, int(t * (len(F5) - 1)))].copy(); d = ImageDraw.Draw(im, 'RGBA')
    for y in range(H // 2, H): d.line([(0, y), (W, y)], fill=(0, 0, 0, int(200 * (y - H / 2) / (H / 2))))
    v = int(56000 * seg(t, 0.1, 0.6)); tx(d, (60, H - 170), f'{v:,}', F(INTER('k'), 130), (255, 255, 255), 'ls')
    tx(d, (64, H - 90), '911 calls in 15 hours · Harris County', F(INTER('b'), 32), (255, 205, 0, int(255 * seg(t, 0.5, 0.65))), 'ls')
    return im
# 6. Document: the real page, then the line that matters
PAGE = None
def s6(t):
    global PAGE
    if PAGE is None: PAGE = Image.open(TMP + '/sa_p17.png').convert('RGB')
    pw, ph = PAGE.size; sc = pw / 612.0
    qx0, qy0, qx1, qy1 = 72 * sc, 450 * sc, 540 * sc, 475 * sc     # the two lines holding the quote
    z = 1 + 0.32 * seg(t, 0.35, 0.8); cx = pw / 2 + ((qx0 + qx1) / 2 - pw / 2) * seg(t, 0.35, 0.8); cy = ph * 0.42 + ((qy0 + qy1) / 2 - ph * 0.42) * seg(t, 0.35, 0.8)
    vw = pw / z; vh = vw * H / W; box = (cx - vw / 2, cy - vh / 2, cx + vw / 2, cy + vh / 2)
    pg = PAGE.copy(); d = ImageDraw.Draw(pg, 'RGBA'); k = seg(t, 0.15, 0.4)
    d.rectangle([442 * sc, 449 * sc, 442 * sc + (540 - 442) * sc * min(1, k * 2), 462 * sc], fill=(255, 220, 0, 110))
    if k > 0.5: d.rectangle([72 * sc, 463 * sc, 72 * sc + (168 - 72) * sc * min(1, (k - 0.5) * 2), 476 * sc], fill=(255, 220, 0, 110))
    im = pg.crop(tuple(int(v) for v in box)).resize((W, H), Image.LANCZOS)
    bg = Image.new('RGB', (W, H), (30, 32, 36)); im = Image.blend(bg, im, 1.0)
    if t > 0.82:
        d = ImageDraw.Draw(im, 'RGBA'); a = int(255 * seg(t, 0.82, 0.9)); d.rectangle([0, H - 170, W, H], fill=(10, 12, 16, int(a * 0.9)))
        tx(d, (W / 2, H - 110), '"If you have a boat, we need your help."', F(ss.SERIFB, 44), (255, 255, 255, a), 'mm')
        tx(d, (W / 2, H - 55), 'NWS Service Assessment, p. 8 · Harris County Judge Ed Emmett, Aug. 27, 2017', F(INTER('m'), 20), (210, 215, 220, a), 'mm')
    return im
# 7. Chapter title over footage: blurred night, film grain, tracking letters
F7 = None
def s7(t):
    global F7
    if F7 is None: F7 = clip_frames('546494', 2.0, 7.0)
    im = F7[min(len(F7) - 1, int(t * (len(F7) - 1)))].filter(ImageFilter.GaussianBlur(3)); im = Image.blend(im, Image.new('RGB', (W, H), (0, 0, 0)), 0.45)
    d = ImageDraw.Draw(im, 'RGBA'); a = int(255 * seg(t, 0.1, 0.35)); spc = 40 - 26 * ease(t)
    word = 'THE NIGHT'; f = F(INTER('k'), 110); widths = [d.textlength(ch, font=f) for ch in word]; total = sum(widths) + spc * (len(word) - 1); x = W / 2 - total / 2
    for ch, w in zip(word, widths): tx(d, (x, H / 2 - 20), ch, f, (255, 255, 255, a), 'ls'); x += w + spc
    tx(d, (W / 2, H / 2 + 50), 'SATURDAY, AUGUST 26, 2017', F(INTER('b'), 28), (255, 205, 0, int(255 * seg(t, 0.35, 0.55))), 'mm')
    return grain(im, 10, int(t * 1000))
# 8. Transitions: whip-pan, white flash
F8 = None
def s8(t):
    global F8
    if F8 is None: F8 = (clip_frames('546166', 2.0, 3.0), clip_frames('546389', 0.0, 3.0), clip_frames('546164', 27.0, 3.0))
    A, B, C = F8; n = len(A)
    def fr(L, u): return L[min(len(L) - 1, int(u * (len(L) - 1)))]
    if t < 0.30: return fr(A, t / 0.30)
    if t < 0.40:          # whip pan A -> B
        u = (t - 0.30) / 0.10; a = fr(A, 1).transform((W, H), Image.AFFINE, (1, 0, -u * W * 0.6, 0, 1, 0)); b = fr(B, 0).transform((W, H), Image.AFFINE, (1, 0, (1 - u) * W * 0.6, 0, 1, 0))
        im = Image.blend(a, b, u); return im.filter(ImageFilter.BoxBlur(int(30 * math.sin(math.pi * u)) + 1))
    if t < 0.66: return fr(B, (t - 0.40) / 0.26)
    if t < 0.74:          # white flash B -> C
        u = (t - 0.66) / 0.08; base = fr(B, 1) if u < 0.5 else fr(C, 0); return Image.blend(base, Image.new('RGB', (W, H), (255, 255, 255)), 1 - abs(u - 0.5) * 2)
    return fr(C, (t - 0.74) / 0.26)
# 9. Photo: slow push into a detail, circle and label
P9 = Image.open(RAW + '/photos/dvids_img_3709576.jpg').convert('RGB')
def s9(t):
    pw, ph = P9.size; z = 1 + 0.9 * ease(t); cx = pw * (0.5 + 0.12 * ease(t)); cy = ph * (0.5 + 0.08 * ease(t))
    vw = pw / z; vh = vw * H / W; im = P9.crop((int(cx - vw / 2), int(cy - vh / 2), int(cx + vw / 2), int(cy + vh / 2))).resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(im, 'RGBA'); a = seg(t, 0.55, 0.7)
    if a > 0:
        r = 110; x, y = W * 0.55, H * 0.52; d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 205, 0, int(255 * a)), width=6)
        tx(d, (x + r + 20, y), 'streets under water', F(INTER('b'), 34), (255, 255, 255, int(255 * a)), 'lm', 4, (0, 0, 0, int(200 * a)))
    tx(d, (W - 30, H - 30), 'Coast Guard helicopter over Houston, Aug. 27, 2017', F(INTER('m'), 20), (240, 240, 240), 'rs', 3, (0, 0, 0))
    return im
# 10. Split screen: from the air / in the street
F10 = None
def s10(t):
    global F10
    if F10 is None: F10 = (clip_frames('546164', 30.0, 6.0), clip_frames('546948', 0.0, 6.0))
    A, B = F10; i = min(len(A) - 1, int(t * (len(A) - 1)))
    a = A[min(i, len(A) - 1)]; b = B[min(i, len(B) - 1)]; split = int(W * (1 - 0.5 * ease(min(1, t / 0.25))))
    im = a.copy(); im.paste(b.crop((split - W // 4, 0, split - W // 4 + (W - split), H)) if W - split > 0 else b.crop((0, 0, 1, H)), (split, 0))
    d = ImageDraw.Draw(im, 'RGBA'); d.rectangle([split - 3, 0, split + 3, H], fill=(255, 255, 255))
    if t > 0.3:
        tx(d, (40, H - 40), 'FROM THE AIR', F(INTER('k'), 30), (255, 255, 255), 'ls', 4, (0, 0, 0)); tx(d, (W - 40, H - 40), 'IN THE STREET', F(INTER('k'), 30), (255, 255, 255), 'rs', 4, (0, 0, 0))
    return im

SECTIONS = [(s1, 7.0, 'Satellite map zoom'), (s2, 6.0, 'Relief 3D, water rising'), (s3, 5.5, 'Bars + counting numbers'), (s4, 5.5, 'Chart drawing on paper'),
            (s5, 5.5, 'Big number over footage'), (s6, 7.0, 'Real document, key line'), (s7, 5.0, 'Chapter title, film grain'), (s8, 6.0, 'Transitions: whip, flash'),
            (s9, 5.5, 'Photo push-in + highlight'), (s10, 5.5, 'Split screen')]
if __name__ == '__main__':
    out = ROOT + '/review/harvey_demo_reel.mp4'
    total = sum(s[1] for s in SECTIONS)
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-ss', '30', '-i', os.path.abspath(ROOT + '/../lahaina/assets/music/mk597.mp3'),
                          '-filter_complex', f'[1:a]afade=t=in:d=1.5,afade=t=out:st={total - 2.5}:d=2.5,volume=0.9[a]', '-map', '0:v', '-map', '[a]',
                          '-t', f'{total:.2f}', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    prev = None
    for n, (fn, secs, name) in enumerate(SECTIONS, 1):
        N = int(secs * FPS)
        for i in range(N):
            im = fn(i / (N - 1)).convert('RGB')
            if prev is not None and i < 6: im = Image.blend(prev, im, (i + 1) / 7)   # short dissolve between options
            im = badge(im.copy(), n, name); p.stdin.write(im.tobytes())
        prev = fn(1.0).convert('RGB')
        print('section', n, name, flush=True)
    p.stdin.close(); p.wait()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-vf', 'scale=960:540', '-c:v', 'libx264', '-crf', '26', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out.replace('.mp4', '_phone.mp4')], check=True)
    print('done', total)
