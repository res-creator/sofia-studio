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
    t0, t1 = 1.2, 5.0
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
        if u >= 1: big_text(img, T(cam.P(47.5, 0.0)), '≈ 1 750 км', 80, t, t1 + 0.1)
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

SCENES = dict(europe=europe, norway_zoom=norway_zoom, length=length, rotate=rotate, coast=coast,
              coast_num=lambda d: coast(d, 'coast_num', True), sogne=sogne, ekofisk=ekofisk,
              depth=depth, depth2=lambda d: depth(d, 'depth2', True))

if __name__ == '__main__':
    sys.path.insert(0, D)
    from timeline import build
    _, shots, _ = build()
    want = sys.argv[1:]
    for s in shots:
        k = s.get('map') or s.get('gfx')
        if k and (not want or k in want): SCENES[k](s['dur'] + 0.2)
