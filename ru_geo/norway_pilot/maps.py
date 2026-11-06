# Анимированные карты и инфографика пилота «Норвегия» (1920×1080, 30 fps) → cache/<сцена>.mp4
# Стиль референса: спутниковая карта, медленный наезд, рисующиеся красные линии, жёлтые цифры с обводкой.
import math, os, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import geo
from geo import ease, label, text_outlined, glow_line, polyline_partial
W, H, FPS, SS = 1920, 1080, 30, 1.25
YEL = (255, 214, 0)

def writer(path):
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)

class Cam:
    """База рисуется с запасом SS; кадр = кроп с наездом z (1 → zmax) к точке focus (в пикселях базы)."""
    def __init__(self, proj, center, width_km, highlight='NOR', zmax=1.12, focus=None):
        self.v = geo.View(proj, center, width_km * SS, int(W * SS), int(H * SS))
        self.base = geo.base_map(self.v, highlight).convert('RGBA')
        self.zmax = zmax; self.focus = focus
    def crop(self, u):
        z = 1 + (self.zmax - 1) * ease(u)
        cw, ch = W / z, H / z
        cx, cy = self.v.W / 2, self.v.H / 2
        if self.focus is not None:
            fx, fy = self.v.px(*self.focus); k = ease(u)
            cx += (fx - cx) * 0.35 * k; cy += (fy - cy) * 0.35 * k
        x0, y0 = cx - cw / 2, cy - ch / 2
        img = self.base.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((W, H), Image.BICUBIC)
        T = lambda p: ((p[0] - x0) * z, (p[1] - y0) * z)
        return img, T
    def P(self, lat, lon):
        x, y = self.v.px(lat, lon); return (float(x), float(y))

def pop(t, t0, d=0.35):
    """Масштаб «выпрыгивания» надписи: 0 → 1.12 → 1."""
    u = (t - t0) / d
    if u <= 0: return 0
    if u >= 1: return 1
    return 1.12 * math.sin(u * math.pi / 2) if u < 0.7 else 1.12 - 0.12 * (u - 0.7) / 0.3

def big_text(img, xy, s, size, t, t0, fill=YEL):
    k = pop(t, t0)
    if k <= 0: return
    text_outlined(img, xy, s, max(8, int(size * k)), fill=fill, sw=max(3, size // 11))

LIND, NORDK, ROME = (57.98, 7.05), (71.17, 25.78), (41.90, 12.50)

def run(name, dur, draw, cam):
    out = f'{D}/cache/{name}.mp4'; os.makedirs(f'{D}/cache', exist_ok=True)
    p = writer(out); n = round(dur * FPS)
    for i in range(n):
        t = i / FPS
        img, T = cam.crop(t / dur)
        draw(img, T, t)
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('map', name, dur)

# ---------------- сцены ----------------
def europe(dur):
    cam = Cam((60, 12), (59, 12), 4200, zmax=1.3, focus=(63, 12))
    def draw(img, T, t):
        big_text(img, T(cam.P(62.6, 5.0)), 'НОРВЕГИЯ', 84, t, 0.6)
    run('europe', dur, draw, cam)

def norway_zoom(dur):
    cam = Cam((64.5, 15), (64.6, 15), 2500, zmax=1.1)
    def draw(img, T, t):
        if t > 0.3:
            label(img, T(cam.P(59.91, 10.75)), 'Осло', 36)
        if t > 0.8:
            text_outlined(img, T(cam.P(64.0, 17.0)), 'Швеция', 36, fill=(235, 235, 235), weight=600, sw=3)
            text_outlined(img, T(cam.P(64.5, 27.0)), 'Финляндия', 36, fill=(235, 235, 235), weight=600, sw=3)
        big_text(img, T(cam.P(66.0, 11.0)), 'НОРВЕГИЯ', 76, t, 0.2)
    run('norway_zoom', dur, draw, cam)

def length(dur):
    cam = Cam((64.5, 15), (64.6, 16), 3300, zmax=1.06)
    a, b = cam.P(*LIND), cam.P(*NORDK)
    def draw(img, T, t):
        u = ease((t - 0.6) / 3.0)
        if u > 0:
            pa, pb = T(a), T(b)
            glow_line(img, [pa, (pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u)], (255, 45, 45), 7)
        if t > 0.3: label(img, T(a), 'Линдеснес', 36, color=(255, 255, 255))
        if u >= 1: label(img, T(b), 'Нордкап', 36)
        m = T(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2))
        big_text(img, (m[0] + 300, m[1] + 30), '≈ 1 750 км', 92, t, 3.8)
    run('length', dur, draw, cam)

def rotate(dur):
    # проекция с центром в Линдеснесе: расстояния от него честные, поворот — вокруг (0,0)
    cam = Cam(LIND, (55.0, 12.0), 5900, zmax=1.0)
    v = cam.v
    rings = [r for r in geo.country('NOR') if max(p[1] for p in r) > 57 and max(p[1] for p in r) < 72 and min(p[0] for p in r) > 3]
    ringkm = []
    for r in rings:
        a = np.asarray(r, float); x, y = v.P.fwd(a[:, 1], a[:, 0]); ringkm.append((x, y))
    nx, ny = v.P.fwd(np.array(NORDK[0]), np.array(NORDK[1])); rx, ry = v.P.fwd(np.array(ROME[0]), np.array(ROME[1]))
    ang = math.atan2(float(ry), float(rx)) - math.atan2(float(ny), float(nx))
    if ang > math.pi: ang -= 2 * math.pi
    if ang < -math.pi: ang += 2 * math.pi
    t0, t1 = 0.3, max(1.5, dur - 1.0)
    def draw(img, T, t):
        u = ease((t - t0) / (t1 - t0)); a = ang * u; ca, sa = math.cos(a), math.sin(a)
        ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        for x, y in ringkm:
            X = x * ca - y * sa; Y = x * sa + y * ca
            px, py = v.km_to_px(X, Y)
            pts = [T(p) for p in zip(px.tolist(), py.tolist())]
            if len(pts) > 2: od.polygon(pts, fill=(255, 50, 50, 120), outline=(255, 90, 90, 255))
        img.alpha_composite(ov)
        label(img, T(cam.P(*ROME)), 'Рим', 40)
        label(img, T(cam.P(*LIND)), 'Линдеснес', 32)
        if u >= 1: big_text(img, T(cam.P(47.5, 0.0)), '≈ 1 750 км', 80, t, t1 + 0.05)
    run('rotate', dur, draw, cam)

def _coast_mask(cam):
    """Пиксели побережья Норвегии (граница страны, у которой рядом океан) — в пикселях базы."""
    v = cam.v; Wb, Hb = v.W, v.H
    nm = Image.new('L', (Wb, Hb), 0); d = ImageDraw.Draw(nm)
    for r in geo.country('NOR'):
        pts = v.ring_px(r)
        if len(pts) > 2: d.polygon(pts, fill=255)
    lm = Image.new('L', (Wb, Hb), 0); d = ImageDraw.Draw(lm)
    for r in geo.land():
        pts = v.ring_px(r)
        if len(pts) > 2 and geo._visible(pts, Wb, Hb): d.polygon(pts, fill=255)
    sea = np.asarray(lm, np.uint8) < 128
    sea_near = np.asarray(Image.fromarray((sea * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    edge = np.asarray(nm.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))) > 0
    return edge & sea_near

def coast(dur, name='coast', num=False):
    cam = Cam((64.5, 15), (64.6, 15), 2500, zmax=1.1 if not num else 1.16)
    cm = _coast_mask(cam)
    yy = np.arange(cam.v.H)[:, None] * np.ones((1, cam.v.W))
    top = np.where(cm.any(axis=1))[0]; ymin, ymax = top.min(), top.max()
    glowc = np.array([90, 230, 255], np.float32)
    def draw(img, T, t):
        if num: u = 1.0
        else: u = ease((t - 0.4) / (dur - 1.2))
        lim = ymin + (ymax - ymin) * u
        m = (cm & (yy <= lim)).astype(np.uint8) * 255
        mi = Image.fromarray(m)
        # тот же кроп, что у базы
        z_img, _ = img, T
        # переносим маску в координаты кадра
        p0 = T((0, 0)); p1 = T((cam.v.W, cam.v.H))
        mi = mi.resize((round(p1[0] - p0[0]), round(p1[1] - p0[1])), Image.BILINEAR)
        full = Image.new('L', (W, H), 0); full.paste(mi, (round(p0[0]), round(p0[1])))
        g = full.filter(ImageFilter.GaussianBlur(6)).point(lambda a: min(255, a * 3))
        col = Image.new('RGBA', (W, H), tuple(int(c) for c in glowc) + (0,))
        img.alpha_composite(Image.merge('RGBA', list(col.split()[:3]) + [g]))
        img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), 235)] * 3 + [full]))
        if num:
            big_text(img, (W * 0.68, H * 0.42), '100 915 км', 120, t, 0.1)
            text_outlined(img, (W * 0.68, H * 0.42 + 105), 'береговая линия с островами', 40, fill=(255, 255, 255), weight=600, sw=3) if t > 0.4 else None
    run(name, dur, draw, cam)

def sogne(dur):
    cam = Cam((61.2, 6.6), (61.15, 6.4), 520, zmax=1.12, focus=(61.2, 6.2))
    fj = [(61.08, 4.78), (61.10, 5.10), (61.13, 5.45), (61.17, 5.80), (61.22, 6.10), (61.19, 6.40), (61.24, 6.65),
          (61.22, 6.95), (61.26, 7.15), (61.35, 7.30), (61.44, 7.45), (61.50, 7.60)]
    pts = [cam.P(*p) for p in fj]
    def draw(img, T, t):
        u = ease((t - 0.5) / 3.2)
        glow_line(img, polyline_partial([T(p) for p in pts], u), (255, 45, 45), 8)
        if t > 0.2: label(img, T(cam.P(60.39, 5.32)), 'Берген', 34)
        big_text(img, (W * 0.62, H * 0.2), 'СОГНЕ-ФЬОРД', 80, t, 0.6)
        big_text(img, (W * 0.62, H * 0.2 + 100), '205 км', 96, t, 3.8, fill=(255, 255, 255))
    run('sogne', dur, draw, cam)

def ekofisk(dur):
    cam = Cam((59, 5), (58.6, 5.5), 1500, zmax=1.15, focus=(56.6, 3.3))
    E = (56.54, 3.21)
    def draw(img, T, t):
        p = T(cam.P(*E)); d = ImageDraw.Draw(img)
        for k in range(3):   # пульсирующие круги, как маркер в Google Earth
            ph = ((t * 0.8 + k / 3) % 1.0); r = 10 + ph * 70
            d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), outline=(255, 60, 60, int(255 * (1 - ph))), width=5)
        d.ellipse((p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12), fill=(255, 50, 50, 255), outline=(0, 0, 0, 255), width=2)
        label(img, T(cam.P(58.97, 5.73)), 'Ставангер', 34)
        big_text(img, (p[0] + 40, p[1] - 110), 'ЭКОФИСК · 1969', 72, t, 0.5)
    run('ekofisk', dur, draw, cam)

# ---------------- инфографика: глубина фьорда и Бурдж-Халифа ----------------
def _burj(h_px, base_x, base_y, w=60):
    """Силуэт небоскрёба: ступенчатая башня + шпиль (пропорции Бурдж-Халифы)."""
    pts = []; steps = [(1.0, 0.0), (0.82, 0.18), (0.66, 0.33), (0.52, 0.47), (0.40, 0.58), (0.28, 0.68), (0.18, 0.76), (0.10, 0.82)]
    L = [(base_x - w / 2 * s, base_y - h_px * y) for s, y in steps]
    Rr = [(base_x + w / 2 * s, base_y - h_px * y) for s, y in steps]
    left = []
    for i, (x, y) in enumerate(L):
        left.append((x, y))
        if i + 1 < len(L): left.append((x, L[i + 1][1]))
    right = []
    for i, (x, y) in enumerate(Rr):
        right.append((x, y))
        if i + 1 < len(Rr): right.append((x, Rr[i + 1][1]))
    spire = [(base_x - 3, base_y - h_px * 0.82), (base_x, base_y - h_px), (base_x + 3, base_y - h_px * 0.82)]
    return left + spire + right[::-1]

def depth(dur, name='depth', burj=False):
    top, bottom = 230, 1010           # уровень воды и дно (1308 м)
    sc = (bottom - top) / 1308.0
    rng = np.random.default_rng(5)
    # стены фьорда — неровные скалы
    def wall(xs, side):
        ys = np.linspace(60, bottom + 40, 60); pts = []
        for i, y in enumerate(ys):
            depthk = min(1.0, (y - 60) / (bottom - 60))
            x = xs + side * (230 * (1 - depthk) ** 1.4 + rng.normal(0, 10))
            pts.append((x, y))
        return pts
    wl = wall(560, -1); wr = wall(1360, 1)
    bg = Image.new('RGBA', (W, H), (0, 0, 0, 255)); d = ImageDraw.Draw(bg)
    for y in range(H):   # небо и вода
        if y < top: c = (int(120 + y * 0.25), int(160 + y * 0.2), int(200 + y * 0.15))
        else:
            k = (y - top) / (H - top); c = (int(20 - 14 * k), int(80 - 60 * k), int(130 - 95 * k))
        d.line([(0, y), (W, y)], fill=c + (255,))
    rock = (52, 48, 44, 255)
    d.polygon([(0, 0)] + wl + [(0, H)], fill=rock); d.polygon([(W, 0)] + wr + [(W, H)], fill=rock)
    d.polygon([(0, bottom + 10), (W, bottom + 10), (W, H), (0, H)], fill=(40, 36, 30, 255))
    d.rectangle((0, top - 2, W, top + 2), fill=(200, 230, 255, 180))
    def draw_frame(t):
        img = bg.copy(); d = ImageDraw.Draw(img)
        # шкала глубины
        u = ease((t - 0.3) / 2.0) if not burj else 1.0
        y_now = top + (bottom - top) * u
        d.line([(300, top), (300, y_now)], fill=(255, 214, 0, 255), width=6)
        for m in range(0, 1309, 200):
            y = top + m * sc
            if y <= y_now: d.line([(285, y), (315, y)], fill=(255, 214, 0, 255), width=4); text_outlined(img, (270, y), f'{m} м', 26, fill=(255, 255, 255), anchor='rm', weight=600, sw=2, shadow=False)
        if u >= 1:
            d.line([(285, bottom), (330, bottom)], fill=(255, 214, 0, 255), width=6)
            big_text(img, (W / 2, 140), '1 308 м', 110, t, 2.3 if not burj else -1)
        if burj:
            hb = 828 * sc; s = ease((t - 0.3) / 1.6)
            base_y = top + hb - 0 + (1 - s) * (-hb - 300) + 0
            # башня опускается сверху, основание доходит до глубины 828 м... ставим её на дно, как будто «утонула»
            base_y = bottom - (1 - s) * (bottom + 50)
            poly = _burj(hb, W / 2, base_y, w=70)
            d.polygon(poly, fill=(205, 215, 225, 255), outline=(255, 255, 255, 255))
            if s >= 1:
                spire_y = bottom - hb
                big_text(img, (W / 2 + 330, bottom - hb / 2), 'Бурдж-Халифа 828 м', 54, t, 2.0, fill=(255, 255, 255))
                if t > 2.8:
                    d.line([(W / 2 + 120, top), (W / 2 + 120, spire_y)], fill=(255, 60, 60, 255), width=6)
                    d.line([(W / 2 + 100, top), (W / 2 + 140, top)], fill=(255, 60, 60, 255), width=6)
                    d.line([(W / 2 + 100, spire_y), (W / 2 + 140, spire_y)], fill=(255, 60, 60, 255), width=6)
                    big_text(img, (W / 2 + 360, (top + spire_y) / 2), '≈ 480 м воды', 62, t, 2.9, fill=(255, 90, 90))
        return img
    out = f'{D}/cache/{name}.mp4'; p = writer(out)
    for i in range(round(dur * FPS)):
        p.stdin.write(draw_frame(i / FPS).convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx', name, dur)

# ---------------- версия 2: единый стиль «цифра + что это» ----------------
def cap(img, xy, num, sub, t, t0, size=96, fill=YEL):
    """Жёлтая цифра + белая подпись под ней: что это за число и откуда."""
    big_text(img, xy, num, size, t, t0, fill=fill)
    if sub and t > t0 + 0.25:
        text_outlined(img, (xy[0], xy[1] + size * 0.82), sub, 38, fill=(255, 255, 255), weight=600, sw=3)

def pulse(img, p, t, col=(255, 60, 60)):
    d = ImageDraw.Draw(img)
    for k in range(3):
        ph = ((t * 0.8 + k / 3) % 1.0); r = 10 + ph * 60
        d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), outline=col + (int(255 * (1 - ph)),), width=5)
    d.ellipse((p[0] - 11, p[1] - 11, p[0] + 11, p[1] + 11), fill=col + (255,), outline=(0, 0, 0, 255), width=2)

def europe_line(dur):
    cam = Cam((62, 13), (62.8, 14), 4300, zmax=1.05)
    a, b = cam.P(*LIND), cam.P(*NORDK)
    def draw(img, T, t):
        u = ease((t - 0.3) / 1.6)
        if u > 0:
            pa, pb = T(a), T(b)
            glow_line(img, [pa, (pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u)], (255, 45, 45), 7)
        cap(img, (W * 0.7, H * 0.3), '≈ 1 750 км', 'от мыса Линдеснес до Нордкапа, по прямой', t, 1.2)
    run('europe_line', dur, draw, cam)

def length(dur):
    cam = Cam((64.5, 15), (64.6, 16), 3300, zmax=1.06)
    a, b = cam.P(*LIND), cam.P(*NORDK)
    def draw(img, T, t):
        u = ease((t - 0.2) / 2.0)
        if u > 0:
            pa, pb = T(a), T(b)
            glow_line(img, [pa, (pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u)], (255, 45, 45), 7)
        label(img, T(a), 'мыс Линдеснес', 36)
        label(img, T(b), 'Нордкап', 36)
        cap(img, (W * 0.72, H * 0.42), '≈ 1 750 км', 'по прямой', t, 1.8)
    run('length', dur, draw, cam)

def pin(name, dur, P0, width, lbl, num=None, sub=None, center=None, zmax=1.15, line=None, t_num=0.6):
    cam = Cam(center or P0, center or P0, width, zmax=zmax, focus=P0)
    def draw(img, T, t):
        if line:
            u = ease((t - 0.3) / 1.4)
            glow_line(img, polyline_partial([T(cam.P(*q)) for q in line], u), (255, 45, 45), 8)
        pulse(img, T(cam.P(*P0)), t)
        label(img, (T(cam.P(*P0))[0] + 18, T(cam.P(*P0))[1] - 48), lbl, 40, dot=False)
        if num: cap(img, (W * 0.5, H * 0.8 - 40), num, sub, t, t_num)
    run(name, dur, draw, cam)

def coast2(dur, name, mode):
    """mode: trace — береговая линия «прорисовывается»; main — материк; total — итог."""
    cam = Cam((64.5, 15), (64.6, 15), 2500, zmax=1.1)
    cm = _coast_mask(cam)
    yy = np.arange(cam.v.H)[:, None] * np.ones((1, cam.v.W))
    top = np.where(cm.any(axis=1))[0]; ymin, ymax = top.min(), top.max()
    def draw(img, T, t):
        u = ease((t - 0.2) / max(0.5, dur - 0.8)) if mode == 'trace' else 1.0
        lim = ymin + (ymax - ymin) * u
        m = (cm & (yy <= lim)).astype(np.uint8) * 255
        p0 = T((0, 0)); p1 = T((cam.v.W, cam.v.H))
        mi = Image.fromarray(m).resize((round(p1[0] - p0[0]), round(p1[1] - p0[1])), Image.BILINEAR)
        full = Image.new('L', (W, H), 0); full.paste(mi, (round(p0[0]), round(p0[1])))
        g = full.filter(ImageFilter.GaussianBlur(6)).point(lambda a: min(255, a * 3))
        img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), c) for c in (90, 230, 255)] + [g]))
        img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), 235)] * 3 + [full]))
        if mode == 'main': cap(img, (W * 0.7, H * 0.4), '28 953 км', 'берег материка (Kartverket)', t, 0.3)
        if mode == 'total': cap(img, (W * 0.7, H * 0.4), '100 915 км', 'материк + острова ≈ 2,5 экватора', t, 0.2, size=110)
    run(name, dur, draw, cam)

def sogne2(dur):
    cam = Cam((61.2, 6.6), (61.15, 6.4), 520, zmax=1.12, focus=(61.2, 6.2))
    fj = [(61.08, 4.78), (61.10, 5.10), (61.13, 5.45), (61.17, 5.80), (61.22, 6.10), (61.19, 6.40), (61.24, 6.65),
          (61.22, 6.95), (61.26, 7.15), (61.35, 7.30), (61.44, 7.45), (61.50, 7.60)]
    pts = [cam.P(*p) for p in fj]
    def draw(img, T, t):
        u = ease((t - 0.2) / 2.4)
        glow_line(img, polyline_partial([T(p) for p in pts], u), (255, 45, 45), 8)
        label(img, T(cam.P(60.39, 5.32)), 'Берген', 34)
        label(img, T(cam.P(61.50, 7.60)), 'Шолден', 30)
        cap(img, (W * 0.64, H * 0.16), '205 км', 'Согне-фьорд — от моря до вершины', t, 2.4)
    run('sogne', dur, draw, cam)

def polar(dur, name='polar'):
    """Северная Норвегия + полярный круг (66,56° с. ш.): выше него бывают полярная ночь и полярный день."""
    cam = Cam((68, 18), (68.3, 19), 1500, zmax=1.1)
    circle = [(66.563, lon) for lon in np.linspace(5, 32, 80)]
    def draw(img, T, t):
        u = ease((t - 0.2) / 1.5)
        pts = [T(cam.P(*q)) for q in circle]
        if u > 0:
            n = max(2, int(len(pts) * u)); d = ImageDraw.Draw(img)
            for i in range(0, n - 1, 2): d.line([pts[i], pts[i + 1]], fill=(255, 255, 255, 230), width=5)
        label(img, T(cam.P(69.65, 18.96)), 'Тромсё', 36)
        if t > 0.8: text_outlined(img, (pts[len(pts) // 3][0], pts[len(pts) // 3][1] + 40), 'Северный полярный круг', 38, fill=(255, 255, 255), weight=700, sw=3)
        if name == 'polar': cap(img, (W * 0.5, H * 0.14), 'полярная ночь', 'в Тромсё солнца нет примерно с 27 ноября по 15 января', t, 0.6, size=80)
    run(name, dur, draw, cam)

def ev_chart(dur):
    """Доля электромобилей среди НОВЫХ легковых машин, Норвегия (OFV): 2024 — 88,9 %, 2025 — 95,9 %."""
    bg = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(bg)
    for y in range(H): d.line([(0, y), (W, y)], fill=(12 + y // 60, 22 + y // 40, 44 + y // 30, 255))
    vals = [('2024', 88.9), ('2025', 95.9)]
    X0, Y0, BW, BH = 620, 900, 260, 600
    out = f'{D}/cache/ev_chart.mp4'; p = writer(out)
    for i in range(round(dur * FPS)):
        t = i / FPS; img = bg.copy(); d = ImageDraw.Draw(img)
        text_outlined(img, (W / 2, 110), 'Электромобили среди новых легковых машин', 52, fill=(255, 255, 255), weight=800, sw=3)
        text_outlined(img, (W / 2, 175), 'Норвегия, доля продаж за год · данные OFV', 36, fill=(200, 210, 225), weight=600, sw=2, shadow=False)
        d.line([(X0 - 60, Y0), (X0 + 2 * BW + 300, Y0)], fill=(255, 255, 255, 200), width=4)
        for k, (yr, v) in enumerate(vals):
            x = X0 + k * (BW + 200); u = ease((t - 0.3 - k * 0.6) / 1.2)
            h = BH * v / 100 * u
            d.rectangle((x, Y0 - h, x + BW, Y0), fill=(255, 214, 0, 255) if k == 1 else (150, 170, 190, 255))
            text_outlined(img, (x + BW / 2, Y0 + 50), yr, 46, fill=(255, 255, 255), weight=700, sw=3)
            if u > 0.05: text_outlined(img, (x + BW / 2, Y0 - h - 50), f'{v * u:.1f} %'.replace('.', ','), 64, fill=(255, 214, 0) if k == 1 else (255, 255, 255), sw=4)
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx ev_chart', dur)

def ekofisk2(dur):
    cam = Cam((59, 5), (58.6, 5.5), 1500, zmax=1.15, focus=(56.6, 3.3))
    E = (56.54, 3.21)
    def draw(img, T, t):
        p = T(cam.P(*E)); pulse(img, p, t)
        label(img, T(cam.P(58.97, 5.73)), 'Ставангер', 34)
        label(img, (p[0] + 20, p[1] - 50), 'Экофиск', 42, dot=False)
        cap(img, (W * 0.3, H * 0.2), 'декабрь 1969', 'открыто месторождение, Северное море', t, 0.5, size=84)
    run('ekofisk', dur, draw, cam)

SCENES = dict(europe_line=europe_line, norway_zoom=norway_zoom, length=length, rotate=rotate,
              coast_trace=lambda d: coast2(d, 'coast_trace', 'trace'), coast_main=lambda d: coast2(d, 'coast_main', 'main'),
              coast_total=lambda d: coast2(d, 'coast_total', 'total'), sogne=sogne2, ekofisk=ekofisk2, ev_chart=ev_chart,
              polar=polar, polar2=lambda d: polar(d, 'polar2'),
              pin_lind=lambda d: pin('pin_lind', d, LIND, 900, 'мыс Линдеснес', center=(58.6, 8.0)),
              pin_nordk=lambda d: pin('pin_nordk', d, (71.17, 25.78), 900, 'Нордкап', center=(70.6, 24.0)),
              laerdal=lambda d: pin('laerdal', d, (61.03, 7.30), 260, 'Лердальский тоннель', center=(61.0, 7.2),
                                    line=[(61.065, 7.475), (61.03, 7.38), (60.99, 7.27), (60.93, 7.19)], num='24,5 км',
                                    sub='Лердаль — Аурланн, открыт в 2000 году', t_num=1.0),
              ampere=lambda d: pin('ampere', d, (61.07, 5.54), 160, 'Лавик — Оппедал', center=(61.08, 5.55),
                                   line=[(61.104, 5.512), (61.075, 5.535), (61.046, 5.556)], num='с 2015 года',
                                   sub='электропаром «Ампер», Согне-фьорд', t_num=1.0),
              )

if __name__ == '__main__':
    sys.path.insert(0, D)
    from timeline import build
    import gfx_depth
    _, shots, _ = build()
    want = sys.argv[1:]
    done = set()
    for s in shots:
        k = s.get('map') or s.get('gfx')
        if not k or k in done or (want and k not in want): continue
        done.add(k)
        if s.get('map'): SCENES[k](s['dur'] + 0.2)
        elif k == 'depth': gfx_depth.render(f'{D}/cache/depth.mp4', s['gfx_total'] + 0.3, s['gfx_first'] + 0.15)
        elif k == 'ev_chart': ev_chart(s['gfx_total'] + 0.3)
