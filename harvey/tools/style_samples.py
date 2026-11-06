# Harvey — graphics style samples for the owner to choose one look for all maps and diagrams.
# Same data in every style: (1) map — Addicks/Barker pools (elevation estimate), Buffalo Bayou, releases from ≈ midnight Aug 28;
# (2) diagram — cumulative rain at 5 Houston airport gauges, Sat 6 p.m. → Sun 9 a.m. (NWS ASOS via IEM).
# Output: harvey/review/styles/<style>_map.png, <style>_chart.png and style_<n>_<style>.jpg (both frames together).
import importlib.util, os, math, datetime as dt, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
sp = importlib.util.spec_from_file_location('m', ROOT + '/tools/maps_v4.py'); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
OUT = ROOT + '/review/styles'; os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080
FI = '/usr/share/fonts/opentype/inter/'; FD = '/usr/share/fonts/truetype/'
def F(name, sz): return ImageFont.truetype(name, int(sz))
INTER = lambda w: FI + {'r': 'Inter-Regular.otf', 'm': 'Inter-Medium.otf', 'b': 'Inter-Bold.otf', 'k': 'InterDisplay-Black.otf', 's': 'Inter-SemiBold.otf'}[w]
SERIF = FD + 'liberation/LiberationSerif-Regular.ttf'; SERIFB = FD + 'liberation/LiberationSerif-Bold.ttf'
MONO = FD + 'jetbrains-mono/JetBrainsMono-Medium.ttf'; MONOB = FD + 'jetbrains-mono/JetBrainsMono-Bold.ttf'

D = m.data(); E, PA, PB, Z, X0, Y0 = m.pools()
BAYOU = D['linear'].get('Buffalo Byu', []); ROADS = {n: D['roads'].get(n, []) for n in ('I- 10', 'Beltway 8', 'State Hwy 6', 'Grand Pkwy')}
DAMS = [(-95.6236, 29.7909, 'ADDICKS DAM'), (-95.6468, 29.7699, 'BARKER DAM')]
def pool_rgba(col, alpha, edge=None):
    a = np.zeros(PA.shape + (4,), np.uint8)
    for M in (PA, PB): a[M] = col + (alpha,)
    if edge:
        from scipy import ndimage
        for M in (PA, PB): e = M & ~ndimage.binary_erosion(M, iterations=3); a[e] = edge + (255,)
    return Image.fromarray(a, 'RGBA')
def gauges():
    A = m.asos(); t0 = dt.datetime(2017, 8, 26, 18); hrs = [t0 + dt.timedelta(hours=h) for h in range(16)]; out = {}
    for st in ('HOU', 'IAH', 'LVJ', 'DWH', 'AXH'):
        obs = A[st]['obs']; out[st] = [sum(v for tm, v in obs if t0 <= tm <= h and tm.minute >= 50) for h in hrs]
    return hrs, out
HRS, G = gauges()

def poly(d, cam, parts, **k): m.poly(d, cam, parts, **k)
def line(d, cam, parts, col, w): m.line(d, cam, parts, col, int(w))
def glow_line(im, cam, parts, col, w, blur=10, strength=2):
    g = Image.new('RGBA', im.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(g); line(gd, cam, parts, col + (255,), w * 3)
    g = g.filter(ImageFilter.GaussianBlur(blur))
    for _ in range(strength): im.paste(g, (0, 0), g)
    d = ImageDraw.Draw(im, 'RGBA'); line(d, cam, parts, col + (255,), w); line(d, cam, parts, (255, 255, 255, 200), max(1, w // 3))
def spread(ys, gap):
    # ys: {key: y}; returns label y positions at least `gap` apart, keeping order
    order = sorted(ys, key=lambda k: ys[k]); out = {}; last = -1e9
    for k in order: y = max(ys[k], last + gap); out[k] = y; last = y
    return out
def tx(d, xy, s, font, fill, anchor='la', stroke=0, sfill=None):
    d.text(xy, s, font=font, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=sfill)
def cam(lon=-95.60, lat=29.785, span=32): return m.Cam(lon, lat, span, W, H)
def downtown_arrow(d, c, font, col):
    p = c.ll(-95.47, 29.762); tx(d, (W - 60, p[1] + 60), 'Buffalo Bayou → downtown Houston, 17 mi', font, col, 'rs')

# ---------------- 1. SATELLITE: real NOAA aerial photo base, glowing data ----------------
def sat_map():
    c = cam(-95.62, 29.78, 30); im = Image.new('RGB', (W, H), (8, 10, 12))
    aim, z, x0, y0 = m.aerial(); m.raster_overlay(im, c, aim, z, x0, y0)
    im = Image.blend(im, Image.new('RGB', (W, H), (5, 10, 18)), 0.45)
    m.raster_overlay(im, c, pool_rgba((40, 150, 255), 95, edge=(120, 210, 255)), Z, X0, Y0)
    glow_line(im, c, BAYOU, (90, 200, 255), 5, 12, 2)
    d = ImageDraw.Draw(im, 'RGBA')
    for lon, lat, n in DAMS:
        p = c.ll(lon, lat); d.ellipse([p[0] - 14, p[1] - 14, p[0] + 14, p[1] + 14], outline=(255, 170, 60, 255), width=5)
        tx(d, (p[0] + 26, p[1] - 6), n, F(INTER('b'), 30), (255, 255, 255), 'ls', 4, (0, 0, 0))
    d.rectangle([0, 0, W, 170], fill=(0, 0, 0, 120))
    tx(d, (70, 60), 'AUG 28 · ≈ MIDNIGHT', F(INTER('b'), 30), (255, 170, 60)); tx(d, (70, 100), 'The Corps begins releasing water', F(INTER('k'), 54), (255, 255, 255))
    tx(d, (70, H - 50), 'NOAA aerial photograph, Aug 30, 2017 · blue: land below the record pool level (elevation estimate)', F(INTER('m'), 22), (220, 225, 230))
    downtown_arrow(d, c, F(INTER('s'), 26), (180, 225, 255))
    return im
def glass_chart(bg, title, sub, col_line, font_t, font_n, grid, txtcol, panel=(10, 14, 20, 170)):
    im = bg.copy(); d = ImageDraw.Draw(im, 'RGBA')
    x0, y0, x1, y1 = 160, 300, W - 300, H - 150
    d.rounded_rectangle([x0 - 80, y0 - 190, x1 + 60, y1 + 90], 28, fill=panel)
    tx(d, (x0 - 40, y0 - 160), title, font_t, txtcol); tx(d, (x0 - 40, y0 - 100), sub, F(INTER('m'), 24), txtcol[:3] + (180,) if len(txtcol) == 4 else txtcol)
    ymax = 12
    for v in (0, 3, 6, 9, 12):
        y = y1 - (y1 - y0) * v / ymax; d.line([(x0, y), (x1, y)], fill=grid, width=2); tx(d, (x0 - 16, y), f'{v}"', F(INTER('m'), 22), txtcol, 'rm')
    for i, h in enumerate(HRS):
        if i % 3 == 0:
            x = x0 + (x1 - x0) * i / 15; tx(d, (x, y1 + 34), h.strftime('%-I %p').replace('AM', 'a.m.').replace('PM', 'p.m.'), F(INTER('m'), 22), txtcol, 'mm')
    LY = spread({st: y1 - (y1 - y0) * v[-1] / ymax for st, v in G.items()}, 42)
    for st, vals in G.items():
        pts = [(x0 + (x1 - x0) * i / 15, y1 - (y1 - y0) * v / ymax) for i, v in enumerate(vals)]
        hl = st == 'HOU'
        d.line(pts, fill=(col_line if hl else txtcol[:3] + (110,)), width=8 if hl else 3, joint='curve')
        tx(d, (pts[-1][0] + 14, LY[st]), f'{st} {vals[-1]:.1f}"', font_n if hl else F(INTER('m'), 22), col_line if hl else txtcol, 'lm')
    return im
def sat_chart():
    bg = sat_map().filter(ImageFilter.GaussianBlur(18))
    return glass_chart(bg, 'Rain since Saturday 6 p.m.', '5 airport gauges, inches · NWS ASOS', (255, 170, 60, 255), F(INTER('k'), 50), F(INTER('b'), 30), (255, 255, 255, 40), (240, 244, 248))

# ---------------- 2. RELIEF 3D: shaded terrain, tilted, water as a lit plane ----------------
def relief_img(c):
    E2 = E.copy(); gy, gx = np.gradient(E2); light = np.clip(0.55 + (-gx * 0.6 - gy * 0.6) * 0.09, 0, 1)
    h = np.clip((E2 - 70) / 70, 0, 1)
    base = np.stack([60 + 90 * h, 64 + 80 * h, 58 + 55 * h], -1) * light[..., None]
    rgba = np.concatenate([np.clip(base, 0, 255), np.full(E2.shape + (1,), 255)], -1).astype(np.uint8)
    im = Image.new('RGB', (W, H), (20, 22, 26)); m.raster_overlay(im, c, Image.fromarray(rgba, 'RGBA'), Z, X0, Y0)
    m.raster_overlay(im, c, pool_rgba((50, 140, 230), 200, edge=(160, 220, 255)), Z, X0, Y0)
    return im
def tilt(im, k=0.30):
    w, h = im.size; src = [(0, 0), (w, 0), (w, h), (0, h)]; dst = [(w * k, h * 0.12), (w * (1 - k), h * 0.12), (w * 1.05, h * 0.98), (-w * 0.05, h * 0.98)]
    A = []; B = []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    coef = np.linalg.solve(np.array(A, float), np.array(B, float))
    return im.transform((w, h), Image.PERSPECTIVE, tuple(coef), Image.BICUBIC, fillcolor=(14, 16, 20))
def relief_map():
    c = cam(-95.66, 29.78, 24); im = relief_img(c); d = ImageDraw.Draw(im, 'RGBA'); line(d, c, BAYOU, (120, 210, 255, 255), 6)
    for n, parts in ROADS.items(): line(d, c, parts, (230, 225, 210, 110), 3)
    pins = [c.ll(lon, lat) for lon, lat, _ in DAMS]
    t = tilt(im); sky = Image.new('RGB', (W, H)); sd = ImageDraw.Draw(sky)
    for y in range(H): sd.line([(0, y), (W, y)], fill=(int(18 + 20 * y / H), int(22 + 22 * y / H), int(30 + 26 * y / H)))
    mask = tilt(Image.new('RGB', (W, H), (255, 255, 255))).convert('L').point(lambda v: 255 if v > 200 else 0)
    sky.paste(t, (0, 0), mask); d = ImageDraw.Draw(sky, 'RGBA')
    # pins stand up from the tilted ground
    k = 0.30
    def proj(p):
        x, y = p; v = y / H; yy = H * 0.12 + v * (H * 0.98 - H * 0.12); l = W * k * (1 - v) + (-W * 0.05) * v; r = W * (1 - k) * (1 - v) + W * 1.05 * v
        return l + (r - l) * x / W, yy
    for (lon, lat, n), p in zip(DAMS, pins):
        q = proj(p); d.line([q, (q[0], q[1] - 140)], fill=(255, 255, 255, 230), width=4); d.ellipse([q[0] - 9, q[1] - 9, q[0] + 9, q[1] + 9], fill=(255, 170, 60))
        d.rounded_rectangle([q[0] - 10, q[1] - 196, q[0] + 300, q[1] - 140], 10, fill=(10, 12, 16, 220)); tx(d, (q[0] + 8, q[1] - 168), n, F(INTER('b'), 30), (255, 255, 255), 'lm')
    tx(d, (70, 70), 'Water held behind the dams', F(INTER('k'), 56), (255, 255, 255)); tx(d, (70, 140), 'Terrain from USGS elevation data · blue: land below the record pool level (estimate)', F(INTER('m'), 24), (215, 220, 226))
    return sky
def relief_chart():
    im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
    for y in range(H): d.line([(0, y), (W, y)], fill=(int(18 + 18 * y / H), int(22 + 20 * y / H), int(30 + 24 * y / H)))
    d = ImageDraw.Draw(im, 'RGBA'); tx(d, (70, 70), 'Rain since Saturday 6 p.m.', F(INTER('k'), 56), (255, 255, 255)); tx(d, (70, 140), 'by Sunday 9 a.m. · 5 airport gauges · NWS ASOS', F(INTER('m'), 24), (215, 220, 226))
    ox, oy, bw, gap = 360, 880, 170, 110; dx, dy = 60, -36
    for i, (st, vals) in enumerate(sorted(G.items(), key=lambda kv: -kv[1][-1])):
        v = vals[-1]; h = v / 12 * 560; x = ox + i * (bw + gap); hl = st == 'HOU'
        front = (255, 160, 60) if hl else (80, 160, 235); side = tuple(int(c * 0.65) for c in front); top = tuple(min(255, int(c * 1.25)) for c in front)
        d.polygon([(x, oy), (x + bw, oy), (x + bw, oy - h), (x, oy - h)], fill=front)
        d.polygon([(x + bw, oy), (x + bw + dx, oy + dy), (x + bw + dx, oy - h + dy), (x + bw, oy - h)], fill=side)
        d.polygon([(x, oy - h), (x + bw, oy - h), (x + bw + dx, oy - h + dy), (x + dx, oy - h + dy)], fill=top)
        tx(d, (x + bw / 2 + 20, oy - h - 70), f'{v:.1f}"', F(INTER('k'), 46 if hl else 36), (255, 255, 255), 'mm')
        tx(d, (x + bw / 2, oy + 44), st, F(INTER('b'), 30), (220, 225, 230), 'mm')
    d.polygon([(ox - 60, oy + 4), (ox + 5 * (bw + gap) + 40, oy + 4), (ox + 5 * (bw + gap) + 40 + dx, oy + 4 + dy), (ox - 60 + dx, oy + 4 + dy)], fill=(255, 255, 255, 25))
    return im

# ---------------- 3. NEWSROOM: bold, saturated, broadcast weather look ----------------
def news_map():
    c = cam(-95.58, 29.78, 32); im = Image.new('RGB', (W, H), (12, 18, 40)); d = ImageDraw.Draw(im, 'RGBA')
    poly(d, c, D['land'], fill=(26, 38, 74, 255))
    for parts in D['areawater']: poly(d, c, parts, fill=(12, 18, 40, 255))
    for n, parts in ROADS.items(): line(d, c, parts, (90, 110, 170, 255), 4)
    m.raster_overlay(im, c, pool_rgba((0, 200, 255), 150, edge=(140, 240, 255)), Z, X0, Y0)
    glow_line(im, c, BAYOU, (0, 230, 255), 6, 10, 1); d = ImageDraw.Draw(im, 'RGBA')
    for lon, lat, n in DAMS:
        p = c.ll(lon, lat); d.rectangle([p[0] + 14, p[1] - 52, p[0] + 14 + 330, p[1] - 4], fill=(230, 30, 50, 255)); tx(d, (p[0] + 28, p[1] - 28), n, F(INTER('k'), 32), (255, 255, 255), 'lm')
        d.ellipse([p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12], fill=(255, 255, 255), outline=(230, 30, 50), width=5)
    d.rectangle([0, H - 170, W, H - 70], fill=(230, 30, 50, 245)); d.rectangle([0, H - 70, W, H], fill=(10, 12, 20, 240))
    tx(d, (70, H - 120), 'RELEASES BEGIN · ≈ MIDNIGHT, AUG 28', F(INTER('k'), 48), (255, 255, 255), 'lm')
    tx(d, (70, H - 35), 'Peak 13,800 cubic feet per second by Aug 30 (court record) · blue: land below record pool level (estimate)', F(INTER('s'), 24), (230, 235, 240), 'lm')
    d.rectangle([W - 330, 50, W - 60, 120], fill=(10, 12, 20, 230)); tx(d, (W - 195, 85), 'WEST HOUSTON', F(INTER('k'), 30), (255, 255, 255), 'mm')
    return im
def news_chart():
    im = Image.new('RGB', (W, H), (12, 18, 40)); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 0, W, 150], fill=(230, 30, 50)); tx(d, (70, 75), 'RAIN SINCE SATURDAY 6 P.M.', F(INTER('k'), 60), (255, 255, 255), 'lm')
    tx(d, (W - 70, 75), 'BY SUN 9 A.M.', F(INTER('k'), 40), (255, 255, 255), 'rm')
    for i, (st, vals) in enumerate(sorted(G.items(), key=lambda kv: -kv[1][-1])):
        v = vals[-1]; y = 230 + i * 150; L = (W - 620) * v / 12; hl = st == 'HOU'
        d.rectangle([300, y, 300 + L, y + 100], fill=(255, 205, 0) if hl else (0, 170, 255))
        tx(d, (250, y + 50), st, F(INTER('k'), 44), (255, 255, 255), 'rm'); tx(d, (320 + L, y + 50), f'{v:.1f} IN', F(INTER('k'), 52), (255, 255, 255), 'lm')
    tx(d, (70, H - 40), 'Airport rain gauges · NWS ASOS via Iowa Environmental Mesonet', F(INTER('s'), 24), (200, 210, 230), 'lm')
    return im

# ---------------- 4. ARCHIVE PAPER: survey-map look, ink and red pencil ----------------
def paper(w=W, h=H, seed=3):
    rng = np.random.default_rng(seed); n = rng.normal(0, 1, (h // 4, w // 4)); n = np.array(Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(float)
    base = np.stack([232 + 0.06 * (n - 128), 220 + 0.06 * (n - 128), 196 + 0.06 * (n - 128)], -1)
    yy, xx = np.mgrid[0:h, 0:w]; vig = 1 - 0.18 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    return Image.fromarray(np.clip(base * vig[..., None], 0, 255).astype(np.uint8))
def paper_map():
    c = cam(-95.60, 29.785, 32); im = paper(); d = ImageDraw.Draw(im, 'RGBA')
    for n, parts in ROADS.items(): line(d, c, parts, (90, 70, 50, 160), 3)
    for parts in D['areawater']: poly(d, c, parts, fill=(150, 180, 190, 255))
    pr = pool_rgba((70, 120, 160), 120, edge=(40, 70, 110)); m.raster_overlay(im, c, pr, Z, X0, Y0); d = ImageDraw.Draw(im, 'RGBA')
    line(d, c, BAYOU, (40, 70, 110, 255), 5)
    for lon, lat, n in DAMS:
        p = c.ll(lon, lat); d.ellipse([p[0] - 60, p[1] - 40, p[0] + 60, p[1] + 40], outline=(190, 30, 30, 230), width=6)
        tx(d, (p[0] + 70, p[1] - 30), n.title(), F(SERIFB, 40), (60, 40, 30), 'ls')
    for x in range(0, W, 120): d.line([(x, 0), (x, H)], fill=(120, 100, 80, 40), width=1)
    for y in range(0, H, 120): d.line([(0, y), (W, y)], fill=(120, 100, 80, 40), width=1)
    tx(d, (80, 90), 'WEST HOUSTON — AUGUST 28, 1917'.replace('1917', '2017'), F(SERIFB, 52), (50, 35, 25))
    d.rectangle([80, 160, 760, 166], fill=(190, 30, 30))
    tx(d, (80, 200), 'Releases begin about midnight', F(SERIF, 38), (60, 45, 35))
    d.rectangle([W - 560, H - 190, W - 80, H - 80], outline=(190, 30, 30, 255), width=5); tx(d, (W - 320, H - 135), 'BLUE: BELOW RECORD POOL LEVEL', F(MONOB, 26), (190, 30, 30), 'mm')
    tx(d, (80, H - 60), 'Elevation estimate from USGS data · roads and water: Census TIGER 2017', F(SERIF, 26), (90, 70, 55))
    return im
def paper_chart():
    im = paper(seed=5); d = ImageDraw.Draw(im, 'RGBA')
    x0, y0, x1, y1 = 220, 240, W - 330, H - 160
    for i in range(0, 61): x = x0 + (x1 - x0) * i / 60; d.line([(x, y0), (x, y1)], fill=(90, 140, 120, 70 if i % 4 else 140), width=1)
    for i in range(0, 25): y = y1 - (y1 - y0) * i / 24; d.line([(x0, y), (x1, y)], fill=(90, 140, 120, 70 if i % 2 else 140), width=1)
    tx(d, (80, 90), 'Rain at Houston airports', F(SERIFB, 56), (50, 35, 25)); tx(d, (80, 165), 'Saturday 6 p.m. to Sunday 9 a.m., inches', F(SERIF, 34), (70, 55, 40))
    for v in (0, 3, 6, 9, 12): tx(d, (x0 - 18, y1 - (y1 - y0) * v / 12), f'{v}', F(SERIF, 30), (60, 45, 35), 'rm')
    for i, h in enumerate(HRS):
        if i % 3 == 0: tx(d, (x0 + (x1 - x0) * i / 15, y1 + 38), h.strftime('%-I %p').lower(), F(SERIF, 28), (60, 45, 35), 'mm')
    LY = spread({st: y1 - (y1 - y0) * v[-1] / 12 for st, v in G.items()}, 44)
    for st, vals in G.items():
        pts = [(x0 + (x1 - x0) * i / 15, y1 - (y1 - y0) * v / 12) for i, v in enumerate(vals)]; hl = st == 'HOU'
        d.line(pts, fill=(190, 30, 30, 255) if hl else (50, 40, 35, 170), width=7 if hl else 3, joint='curve')
        tx(d, (pts[-1][0] + 16, LY[st]), f'{st}  {vals[-1]:.1f}', F(SERIFB if hl else SERIF, 34 if hl else 28), (190, 30, 30) if hl else (60, 45, 35), 'lm')
    tx(d, (80, H - 60), 'Source: NWS ASOS hourly precipitation via Iowa Environmental Mesonet', F(SERIF, 26), (90, 70, 55))
    return im

# ---------------- 5. BLUEPRINT: engineering drawing ----------------
BP = (16, 52, 104)
def grid(im, step=40, col=(255, 255, 255)):
    d = ImageDraw.Draw(im, 'RGBA')
    for x in range(0, W, step): d.line([(x, 0), (x, H)], fill=col + (38 if x % (step * 5) else 70,), width=1)
    for y in range(0, H, step): d.line([(0, y), (W, y)], fill=col + (38 if y % (step * 5) else 70,), width=1)
def blue_map():
    c = cam(-95.60, 29.785, 32); im = Image.new('RGB', (W, H), BP); grid(im); d = ImageDraw.Draw(im, 'RGBA')
    for n, parts in ROADS.items(): line(d, c, parts, (255, 255, 255, 110), 2)
    pr = pool_rgba((255, 255, 255), 45, edge=(255, 255, 255)); m.raster_overlay(im, c, pr, Z, X0, Y0); d = ImageDraw.Draw(im, 'RGBA')
    line(d, c, BAYOU, (255, 230, 120, 255), 5)
    for lon, lat, n in DAMS:
        p = c.ll(lon, lat); d.line([(p[0], p[1]), (p[0] + 120, p[1] - 120), (p[0] + 460, p[1] - 120)], fill=(255, 255, 255), width=3)
        d.ellipse([p[0] - 10, p[1] - 10, p[0] + 10, p[1] + 10], outline=(255, 230, 120), width=4); tx(d, (p[0] + 130, p[1] - 132), n, F(MONOB, 34), (255, 255, 255), 'ls')
    d.rectangle([W - 700, H - 230, W - 60, H - 60], outline=(255, 255, 255), width=3)
    for i, (a, b) in enumerate([('SHEET', 'WEST HOUSTON RESERVOIRS'), ('EVENT', 'RELEASES BEGIN ≈ 00:00 AUG 28 2017'), ('PEAK', '13,800 CFS BY AUG 30'), ('SHADED', 'BELOW RECORD POOL LEVEL (EST.)')]):
        y = H - 210 + i * 40; tx(d, (W - 680, y), a, F(MONO, 22), (180, 210, 255)); tx(d, (W - 540, y), b, F(MONOB, 22), (255, 255, 255))
    tx(d, (70, 80), 'FIG. 4 — WATER HELD BEHIND THE DAMS', F(MONOB, 44), (255, 255, 255))
    return im
def blue_chart():
    im = Image.new('RGB', (W, H), BP); grid(im); d = ImageDraw.Draw(im, 'RGBA')
    x0, y0, x1, y1 = 220, 220, W - 360, H - 160
    d.line([(x0, y0), (x0, y1), (x1, y1)], fill=(255, 255, 255), width=4)
    for v in (0, 3, 6, 9, 12):
        y = y1 - (y1 - y0) * v / 12; d.line([(x0 - 14, y), (x0, y)], fill=(255, 255, 255), width=3); tx(d, (x0 - 24, y), f'{v:02d} IN', F(MONO, 24), (255, 255, 255), 'rm')
    for i, h in enumerate(HRS):
        if i % 3 == 0: x = x0 + (x1 - x0) * i / 15; d.line([(x, y1), (x, y1 + 14)], fill=(255, 255, 255), width=3); tx(d, (x, y1 + 40), h.strftime('%H:00'), F(MONO, 24), (255, 255, 255), 'mm')
    LY = spread({st: y1 - (y1 - y0) * v[-1] / 12 for st, v in G.items()}, 44)
    for st, vals in G.items():
        pts = [(x0 + (x1 - x0) * i / 15, y1 - (y1 - y0) * v / 12) for i, v in enumerate(vals)]; hl = st == 'HOU'
        d.line(pts, fill=(255, 230, 120) if hl else (180, 210, 255), width=6 if hl else 2)
        for p in pts[::3]: d.rectangle([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5], outline=(255, 230, 120) if hl else (180, 210, 255), width=2)
        tx(d, (pts[-1][0] + 18, LY[st]), f'{st} {vals[-1]:05.2f}', F(MONOB if hl else MONO, 28), (255, 230, 120) if hl else (200, 220, 255), 'lm')
    tx(d, (70, 80), 'FIG. 2 — CUMULATIVE RAINFALL, SAT 18:00 → SUN 09:00', F(MONOB, 40), (255, 255, 255))
    tx(d, (70, H - 60), 'NWS ASOS · IOWA ENVIRONMENTAL MESONET', F(MONO, 22), (180, 210, 255))
    return im

# ---------------- 6. EDITORIAL LIGHT: clean newspaper-graphic look ----------------
def light_map():
    c = cam(-95.60, 29.785, 32); im = Image.new('RGB', (W, H), (242, 241, 237)); d = ImageDraw.Draw(im, 'RGBA')
    for parts in D['areawater']: poly(d, c, parts, fill=(205, 222, 232, 255))
    for n, parts in ROADS.items(): line(d, c, parts, (190, 188, 182, 255), 4)
    m.raster_overlay(im, c, pool_rgba((70, 140, 200), 140), Z, X0, Y0); d = ImageDraw.Draw(im, 'RGBA')
    line(d, c, BAYOU, (30, 90, 160, 255), 6)
    for lon, lat, n in DAMS:
        p = c.ll(lon, lat); d.ellipse([p[0] - 11, p[1] - 11, p[0] + 11, p[1] + 11], fill=(214, 40, 40)); tx(d, (p[0] + 22, p[1] - 4), n.title(), F(INTER('b'), 34), (25, 25, 25), 'ls', 6, (242, 241, 237))
    tx(d, (80, 70), 'Water held behind the dams', F(SERIFB, 64), (20, 20, 20)); tx(d, (80, 150), 'Releases began about midnight on Aug. 28; the pools peaked on Aug. 30.', F(INTER('r'), 30), (70, 70, 70))
    d.rectangle([80, H - 120, 120, H - 90], fill=(70, 140, 200, 140)); tx(d, (135, H - 105), 'Land below the record pool level (estimate from elevation data)', F(INTER('m'), 26), (60, 60, 60), 'lm')
    return im
def light_chart():
    im = Image.new('RGB', (W, H), (242, 241, 237)); d = ImageDraw.Draw(im, 'RGBA')
    tx(d, (80, 70), 'A night of rain', F(SERIFB, 64), (20, 20, 20)); tx(d, (80, 150), 'Inches since Saturday 6 p.m. at five Houston airports', F(INTER('r'), 30), (70, 70, 70))
    x0, y0, x1, y1 = 200, 260, W - 360, H - 160
    for v in (0, 3, 6, 9, 12):
        y = y1 - (y1 - y0) * v / 12; d.line([(x0, y), (x1, y)], fill=(200, 198, 192), width=2); tx(d, (x0 - 16, y), f'{v}', F(INTER('m'), 26), (100, 100, 100), 'rm')
    for i, h in enumerate(HRS):
        if i % 3 == 0: tx(d, (x0 + (x1 - x0) * i / 15, y1 + 36), h.strftime('%-I %p').replace('AM', 'a.m.').replace('PM', 'p.m.'), F(INTER('m'), 24), (100, 100, 100), 'mm')
    LY = spread({st: y1 - (y1 - y0) * v[-1] / 12 for st, v in G.items()}, 44)
    for st, vals in G.items():
        pts = [(x0 + (x1 - x0) * i / 15, y1 - (y1 - y0) * v / 12) for i, v in enumerate(vals)]; hl = st == 'HOU'
        d.line(pts, fill=(214, 40, 40) if hl else (150, 150, 150), width=7 if hl else 3, joint='curve')
        tx(d, (pts[-1][0] + 16, LY[st]), f'{st} {vals[-1]:.1f}', F(INTER('b') if hl else INTER('m'), 32 if hl else 26), (214, 40, 40) if hl else (110, 110, 110), 'lm')
    tx(d, (80, H - 60), 'Source: NWS ASOS hourly precipitation via Iowa Environmental Mesonet', F(INTER('r'), 24), (110, 110, 110))
    return im

STYLES = [('satellite', 'Satellite — real NOAA aerial photo, glowing data', sat_map, sat_chart),
          ('relief3d', 'Relief 3D — shaded terrain, tilted, standing pins', relief_map, relief_chart),
          ('newsroom', 'Newsroom — bold broadcast colours and banners', news_map, news_chart),
          ('archive', 'Archive paper — survey map, ink, red pencil', paper_map, paper_chart),
          ('blueprint', 'Blueprint — engineering drawing', blue_map, blue_chart),
          ('editorial', 'Editorial light — clean newspaper graphic', light_map, light_chart)]
if __name__ == '__main__':
    for i, (key, title, fm, fc) in enumerate(STYLES, 1):
        a = fm(); b = fc(); a.save(f'{OUT}/{key}_map.png'); b.save(f'{OUT}/{key}_chart.png')
        sheet = Image.new('RGB', (1920, 1080 + 60), (255, 255, 255)); sd = ImageDraw.Draw(sheet)
        sheet.paste(a.resize((960, 540), Image.LANCZOS), (0, 60)); sheet.paste(b.resize((960, 540), Image.LANCZOS), (960, 60))
        sheet.paste(a.resize((480, 270), Image.LANCZOS), (0, 600 + 60)); sheet.paste(b.resize((480, 270), Image.LANCZOS), (480, 600 + 60))
        tx(sd, (20, 30), f'{i}. {title}', F(INTER('b'), 34), (20, 20, 20), 'lm')
        tx(sd, (1000, 600 + 60 + 135), 'Left: the same frames at phone size', F(INTER('m'), 28), (60, 60, 60), 'lm')
        sheet = sheet.crop((0, 0, 1920, 600 + 60 + 270 + 20)); sheet.save(f'{OUT}/style_{i}_{key}.jpg', quality=88)
        print('done', key)
