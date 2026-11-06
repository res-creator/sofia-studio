# Анимированные карты и инфографика выпуска «Исландия» (1920×1080, 30 fps) → cache/<сцена>.mp4
# Карты: Natural Earth (public domain), проекция азимутальная равнопромежуточная (../lib/geo.py). Стиль: белый Inter + коралловый акцент.
import math, os, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import geo, look
from geo import ease, polyline_partial, glow_line
W, H, FPS, SS = 1920, 1080, 30, 1.25
ACC = look.ACCENT; WHITE = (255, 255, 255)

def writer(path):
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)

_BASES = {}
class Cam:
    """База рисуется с запасом SS; кадр = кроп с наездом z (1 → zmax) к точке focus."""
    def __init__(self, proj, center, width_km, highlight='ISL', zmax=1.12, focus=None, z0=1.0):
        key = (proj, center, width_km, highlight)
        self.v = geo.View(proj, center, width_km * SS, int(W * SS), int(H * SS))
        if key not in _BASES: _BASES[key] = geo.base_map(self.v, highlight).convert('RGBA')
        self.base = _BASES[key]; self.zmax = zmax; self.z0 = z0; self.focus = focus
    def crop(self, u):
        z = self.z0 + (self.zmax - self.z0) * ease(u)
        cw, ch = W / z, H / z
        cx, cy = self.v.W / 2, self.v.H / 2
        if self.focus is not None:
            fx, fy = self.v.px(*self.focus); k = ease(u)
            cx += (float(fx) - cx) * 0.35 * k; cy += (float(fy) - cy) * 0.35 * k
        x0, y0 = cx - cw / 2, cy - ch / 2
        img = self.base.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((W, H), Image.BICUBIC)
        T = lambda p: ((p[0] - x0) * z, (p[1] - y0) * z)
        return img, T
    def P(self, lat, lon):
        x, y = self.v.px(lat, lon); return (float(x), float(y))

def run(name, dur, draw, cam):
    out = f'{D}/cache/{name}.mp4'; os.makedirs(f'{D}/cache', exist_ok=True)
    p = writer(out); n = round(dur * FPS)
    for i in range(n):
        t = i / FPS
        img, T = cam.crop(t / dur)
        draw(img, T, t)
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('map', name, round(dur, 2), flush=True)

def cap(img, xy, num, sub, t, t0, size=96):
    look.number(img, (xy[0], xy[1] + size * 0.35), num, sub, t, t0, size, align='m')

def pulse(img, p, t, col=ACC, r0=11):
    d = ImageDraw.Draw(img)
    for k in range(3):
        ph = ((t * 0.8 + k / 3) % 1.0); r = 10 + ph * 60
        d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), outline=col + (int(255 * (1 - ph)),), width=5)
    d.ellipse((p[0] - r0, p[1] - r0, p[0] + r0, p[1] + r0), fill=col + (255,), outline=(0, 0, 0, 255), width=2)

def lbl(img, p, s, size=34, t=1.0, t0=0.0, dot=True, dx=0, dy=0):
    if t < t0: return
    look.map_label(img, (p[0] + dx, p[1] + dy), s, size, dot, t - t0)

def bigname(img, p, s, t, t0=0.2, size=44):
    """Крупная подпись территории (без точки), проявляется."""
    if t < t0: return
    look.text(img, p, s.upper(), size, 700, WHITE, 'mm', alpha=min(1.0, (t - t0) / 0.4), track=8, shadow=0.9)

def dashed(img, pts, u=1.0, col=(255, 255, 255, 230), w=5, step=2):
    pts = polyline_partial(pts, u); d = ImageDraw.Draw(img)
    for i in range(0, len(pts) - 1, step): d.line([pts[i], pts[i + 1]], fill=col, width=w)

def arrow(img, a, b, u, col=ACC, w=9, head=34):
    if u <= 0: return
    e = (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)
    glow_line(img, [a, e], col, w)
    if u > 0.95:
        ang = math.atan2(e[1] - a[1], e[0] - a[0]); d = ImageDraw.Draw(img)
        d.polygon([e, (e[0] - head * math.cos(ang - 0.45), e[1] - head * math.sin(ang - 0.45)),
                   (e[0] - head * math.cos(ang + 0.45), e[1] - head * math.sin(ang + 0.45))], fill=col + (255,))

def soft_blob(img, p, r, col, a):
    lay = Image.new('L', img.size, 0); ImageDraw.Draw(lay).ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=int(255 * a))
    lay = lay.filter(ImageFilter.GaussianBlur(r * 0.45))
    img.alpha_composite(Image.merge('RGBA', [Image.new('L', img.size, c) for c in col] + [lay]))

# ---------- точки ----------
REY, KEF, GRI, SVA = (64.146, -21.94), (63.99, -22.62), (63.842, -22.433), (63.878, -22.43)
LAKI, HEIM, THORL, EYJA = (64.07, -18.23), (63.43, -20.27), (63.856, -21.38), (63.63, -19.62)
KATLA, VIK, HOLU, BARD = (63.63, -19.05), (63.419, -19.006), (64.87, -16.83), (64.64, -17.53)
OK, ASKJA, THING, HEKLA = (64.60, -20.87), (65.03, -16.75), (64.255, -21.13), (63.99, -19.67)
MOSCOW, BERGEN = (55.75, 37.62), (60.39, 5.32)
ISL_C = (64.9, -18.6)

# ---------- сцены ----------
def atlantic(dur):
    """Где Исландия: Северная Атлантика, Гренландия, Норвегия, полярный круг."""
    cam = Cam((66, -10), (65.5, -12), 3600, zmax=1.18, focus=ISL_C)
    circ = [(66.563, lon) for lon in np.linspace(-40, 25, 120)]
    def draw(img, T, t):
        bigname(img, T(cam.P(72.5, -35)), 'Гренландия', t, 0.4)
        bigname(img, T(cam.P(64.5, 12.5)), 'Норвегия', t, 0.9)
        bigname(img, T(cam.P(60.0, -26.0)), 'Атлантический океан', t, 1.6, 30)
        u = ease((t - 1.8) / 1.4)
        if u > 0: dashed(img, [T(cam.P(*q)) for q in circ], u)
        if t > 2.6: look.text(img, T(cam.P(67.6, 0.0)), 'Северный полярный круг', 30, 600, WHITE, 'mm', alpha=min(1, (t - 2.6) / 0.4), shadow=0.9)
        pulse(img, T(cam.P(*REY)), t)
        lbl(img, T(cam.P(*REY)), 'Рейкьявик', 36, t, 0.3)
    run('atlantic', dur, draw, cam)

def moscow(dur):
    cam = Cam((60, 8), (60.5, 8), 5200, highlight='ISL', zmax=1.06)
    a, b = cam.P(*REY), cam.P(*MOSCOW)
    gc = [(REY[0] + (MOSCOW[0] - REY[0]) * k + 6 * math.sin(math.pi * k), REY[1] + (MOSCOW[1] - REY[1]) * k) for k in np.linspace(0, 1, 60)]
    def draw(img, T, t):
        u = ease((t - 0.3) / 1.8)
        glow_line(img, polyline_partial([T(cam.P(*q)) for q in gc], u), ACC, 7)
        lbl(img, T(a), 'Рейкьявик', 36); lbl(img, T(b), 'Москва', 36, t, 1.6)
        cap(img, (W * 0.5, H * 0.78), '≈ 3 300 км', 'от Рейкьявика до Москвы по прямой', t, 1.5)
    run('moscow', dur, draw, cam)

def _shift_rings(rings, src_c, dst_c, view):
    """Переносит контур страны в другое место без искажения площади (в км проекции с центром src_c)."""
    P1 = geo.Proj(*src_c); P2 = geo.Proj(*dst_c)
    out = []
    for r in rings:
        a = np.asarray(r, float); x, y = P1.fwd(a[:, 1], a[:, 0])
        lat, lon = P2.inv(x, y); X, Y = view.px(lat, lon); out.append(list(zip(X.tolist(), Y.tolist())))
    return out

def bulgaria(dur):
    cam = Cam(ISL_C, (64.9, -12.0), 1900, zmax=1.06)
    bg = _shift_rings(geo.country('BGR'), (42.7, 25.3), (64.95, -2.5), cam.v)
    def draw(img, T, t):
        a = min(1.0, max(0.0, (t - 0.8) / 0.6))
        if a > 0:
            lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
            for r in bg:
                pts = [T(p) for p in r]
                if len(pts) > 2: d.polygon(pts, fill=ACC + (int(110 * a),)); d.line(pts + [pts[0]], fill=ACC + (int(255 * a),), width=4)
            img.alpha_composite(lay)
            look.text(img, T(cam.v.px(64.9, -2.5)), 'БОЛГАРИЯ', 34, 700, WHITE, 'mm', alpha=a, track=6)
            look.text(img, (T(cam.v.px(64.9, -2.5))[0], T(cam.v.px(64.9, -2.5))[1] + 44), '111 000 км²', 30, 600, WHITE, 'mm', alpha=a)
        cap(img, (W * 0.3, H * 0.84), '103 000 км²', 'площадь Исландии', t, 0.3)
    run('bulgaria', dur, draw, cam)

def population(dur):
    cam = Cam(ISL_C, (64.85, -19.0), 900, zmax=1.12, focus=REY)
    def draw(img, T, t):
        pulse(img, T(cam.P(*REY)), t); lbl(img, T(cam.P(*REY)), 'Рейкьявик', 36, t, 0.2)
        soft_blob(img, T(cam.P(64.08, -21.85)), 70, ACC, 0.35 * min(1, t / 0.6))
        cap(img, (W * 0.64, H * 0.80), '≈ 394 000', 'жителей на 1 января 2026 года (Статистическое бюро Исландии)', t, 0.5)
    run('population', dur, draw, cam)

RIDGE = [(60.0, -29.5), (61.5, -27.2), (62.8, -24.9), (63.8, -22.7), (64.05, -21.4), (64.6, -20.0), (64.4, -18.6), (64.6, -17.2), (65.1, -16.7),
         (65.7, -16.8), (66.2, -17.4), (66.6, -18.4), (67.5, -18.5), (69.0, -16.5), (70.5, -15.5)]
def ridge(dur, name='ridge'):
    cam = Cam(ISL_C, (64.9, -19.0), 1700, zmax=1.1)
    def draw(img, T, t):
        u = ease((t - 0.2) / 2.0)
        glow_line(img, polyline_partial([T(cam.P(*q)) for q in RIDGE], u), ACC, 8)
        if name == 'ridge':
            k = ease((t - 2.0) / 1.0)
            c = T(cam.P(65.0, -18.0))
            arrow(img, (c[0] - 260, c[1] + 260), (c[0] - 470, c[1] + 260), k, WHITE, 8, 30)
            arrow(img, (c[0] + 260, c[1] + 260), (c[0] + 470, c[1] + 260), k, WHITE, 8, 30)
            if t > 2.3:
                a = min(1, (t - 2.3) / 0.4)
                look.text(img, (c[0] - 560, c[1] - 330), 'СЕВЕРО-АМЕРИКАНСКАЯ', 28, 700, WHITE, 'mm', alpha=a, track=4)
                look.text(img, (c[0] - 560, c[1] - 292), 'ПЛИТА', 28, 700, WHITE, 'mm', alpha=a, track=4)
                look.text(img, (c[0] + 560, c[1] - 330), 'ЕВРАЗИЙСКАЯ', 28, 700, WHITE, 'mm', alpha=a, track=4)
                look.text(img, (c[0] + 560, c[1] - 292), 'ПЛИТА', 28, 700, WHITE, 'mm', alpha=a, track=4)
            cap(img, (W * 0.5, H * 0.88), '≈ 2 см в год', 'плиты расходятся по Срединно-Атлантическому хребту', t, 2.6, 84)
        if name == 'hotspot':
            c = T(cam.P(64.4, -17.4)); r = 120 + 25 * math.sin(t * 2.5)
            soft_blob(img, c, r, (255, 150, 60), 0.75 * min(1, t / 0.8))
            soft_blob(img, c, r * 0.45, (255, 230, 150), 0.6 * min(1, t / 0.8))
            cap(img, (W * 0.5, H * 0.86), 'горячая точка', 'поток горячей мантии под центром острова', t, 0.6, 84)
    run(name, dur, draw, cam)

VOLC = [('Гекла', HEKLA), ('Катла', KATLA), ('Эйяфьядлайёкюдль', EYJA), ('Лаки', LAKI), ('Гримсвётн', (64.42, -17.33)), ('Бардарбунга', BARD),
        ('Аскья', ASKJA), ('Крафла', (65.73, -16.78)), ('Рейкьянес', (63.89, -22.3)), ('Снайфедльсйёкюдль', (64.81, -23.78)),
        ('Эрайвайёкюдль', (64.0, -16.65)), ('Вестманнаэйяр', HEIM), ('Хенгидль', (64.08, -21.32)), ('Тейстарейкир', (65.9, -16.95))]
def volcanoes(dur):
    cam = Cam(ISL_C, (64.85, -18.9), 1000, zmax=1.08)
    def draw(img, T, t):
        for i, (n, p) in enumerate(VOLC):
            t0 = 0.2 + i * 0.13
            if t < t0: continue
            q = T(cam.P(*p)); k = look.ease_back((t - t0) / 0.3); r = 12 * k
            d = ImageDraw.Draw(img); d.ellipse((q[0] - r, q[1] - r, q[0] + r, q[1] + r), fill=ACC + (255,), outline=(255, 255, 255, 255), width=3)
            if n in ('Гекла', 'Катла', 'Аскья', 'Лаки', 'Крафла', 'Рейкьянес', 'Бардарбунга'):
                look.text(img, (q[0] + 20, q[1]), n, 30, 600, WHITE, 'lm', alpha=min(1, (t - t0) / 0.3), shadow=0.9)
        cap(img, (W * 0.5, H * 0.86), '≈ 30', 'активных вулканических систем', t, 2.2)
    run('volcanoes', dur, draw, cam)

def viking(dur):
    cam = Cam((63, -6), (63.2, -7), 2900, zmax=1.08)
    route = [BERGEN, (61.6, 0.5), (62.2, -6.8), (63.0, -13.0), (63.6, -18.5), (64.0, -21.5), REY]
    def draw(img, T, t):
        lbl(img, T(cam.P(*BERGEN)), 'Норвегия', 34)
        u = ease((t - 0.3) / 2.2)
        dashed(img, [T(cam.P(*q)) for q in np.array([np.interp(np.linspace(0, len(route) - 1, 80), range(len(route)), [r[i] for r in route]) for i in (0, 1)]).T], u, ACC + (255,), 7, 2)
        if u >= 1: pulse(img, T(cam.P(*REY)), t); lbl(img, T(cam.P(*REY)), 'Рейкьявик', 36, t, 2.5)
        cap(img, (W * 0.5, H * 0.84), 'около 874 года', 'первые постоянные поселенцы — из Норвегии (по «Книге о заселении»)', t, 0.8, 84)
    run('viking', dur, draw, cam)

def pin(name, dur, P0, width, label, num=None, sub=None, center=None, zmax=1.15, line=None, t_num=0.6, extra=(), size=40):
    cam = Cam(center or P0, center or P0, width, zmax=zmax, focus=P0)
    def draw(img, T, t):
        if line:
            u = ease((t - 0.3) / 1.4)
            glow_line(img, polyline_partial([T(cam.P(*q)) for q in line], u), ACC, 8)
        for n, p in extra: lbl(img, T(cam.P(*p)), n, 32, t, 0.5)
        pulse(img, T(cam.P(*P0)), t)
        q = T(cam.P(*P0)); look.text(img, (q[0] + 24, q[1] - 52), label, size, 700, WHITE, 'lm', alpha=min(1, t / 0.4), shadow=0.9)
        if num: cap(img, (W * 0.5, H * 0.82), num, sub, t, t_num)
    run(name, dur, draw, cam)

def haze(dur):
    """Лаки, 1783: ядовитая дымка расходится над Европой."""
    cam = Cam((57, -4), (57.0, -4.0), 4700, highlight=None, zmax=1.05)
    src = cam.P(*LAKI)
    def draw(img, T, t):
        s = T(src); k = ease(t / max(1, dur - 0.5))
        for i in range(6):
            tt = k - i * 0.1
            if tt <= 0: continue
            p = (s[0] + (T(cam.P(50, 5))[0] - s[0]) * tt * 1.05, s[1] + (T(cam.P(50, 5))[1] - s[1]) * tt * 1.05)
            soft_blob(img, p, 140 + 260 * tt, (205, 150, 90), 0.35)
        pulse(img, s, t); lbl(img, s, 'Лаки', 34)
        lbl(img, T(cam.P(51.5, -0.12)), 'Лондон', 30, t, 1.0); lbl(img, T(cam.P(48.86, 2.35)), 'Париж', 30, t, 1.4)
        cap(img, (W * 0.5, H * 0.84), 'лето 1783', 'сухой туман над Европой: в Англии и Франции солнце было красным', t, 0.5, 84)
    run('haze', dur, draw, cam)

def heimaey(dur):
    cam = Cam((63.7, -20.6), (63.75, -20.6), 420, zmax=1.12, focus=HEIM)
    def draw(img, T, t):
        a, b = T(cam.P(63.44, -20.27)), T(cam.P(*THORL))
        u = ease((t - 0.8) / 1.8)
        for off in (-18, 0, 18):
            pts = [(a[0] + (b[0] - a[0]) * s + off * math.sin(math.pi * s), a[1] + (b[1] - a[1]) * s) for s in np.linspace(0, 1, 40)]
            dashed(img, pts, u, (255, 255, 255, 220), 4, 2)
        pulse(img, a, t); look.text(img, (a[0] + 26, a[1] + 40), 'Хеймаэй', 40, 700, WHITE, 'lm', shadow=0.9)
        lbl(img, b, 'Торлауксхёбн', 32, t, 0.6)
        cap(img, (W * 0.5, H * 0.84), '23 января 1973', 'около 5 300 жителей — за ночь на большую землю', t, 0.3, 80)
    run('heimaey', dur, draw, cam)

def ashcloud(dur):
    cam = Cam((57, -1), (57.5, -1.5), 4700, highlight=None, zmax=1.05)
    s0 = cam.P(*EYJA)
    def draw(img, T, t):
        s = T(s0); k = ease(t / max(1, dur - 0.6))
        for i in range(8):
            tt = k - i * 0.07
            if tt <= 0: continue
            tgt = T(cam.P(53 - 2 * math.sin(i), 12 + 3 * math.cos(i)))
            p = (s[0] + (tgt[0] - s[0]) * tt, s[1] + (tgt[1] - s[1]) * tt)
            soft_blob(img, p, 120 + 220 * tt, (120, 120, 125), 0.42)
        pulse(img, s, t); lbl(img, s, 'Эйяфьядлайёкюдль', 32)
        cap(img, (W * 0.5, H * 0.84), 'апрель 2010', 'облако пепла идёт на Европу', t, 1.0, 92)
    run('ashcloud', dur, draw, cam)

FISS = [(63.905, -22.385), (63.885, -22.39), (63.865, -22.40), (63.85, -22.405)]
BARR = [(63.866, -22.48), (63.862, -22.455), (63.858, -22.43), (63.852, -22.41), (63.845, -22.395)]
def reykjanes(dur, name='reyk_loc'):
    cam = Cam((63.95, -22.2), (63.98, -22.1) if name == 'reyk_loc' else (63.87, -22.43), 170 if name == 'reyk_loc' else 22, zmax=1.12,
              focus=GRI if name != 'reyk_loc' else None)
    def draw(img, T, t):
        if name == 'reyk_loc':
            for i, (n, p) in enumerate([('Рейкьявик', REY), ('аэропорт Кеблавик', KEF), ('Свартсенги', SVA)]): lbl(img, T(cam.P(*p)), n, 32, t, 0.4 + 0.4 * i)
            pulse(img, T(cam.P(*GRI)), t); q = T(cam.P(*GRI)); look.text(img, (q[0] + 24, q[1] + 44), 'Гриндавик', 42, 700, WHITE, 'lm', shadow=0.9)
            cap(img, (W * 0.5, H * 0.16), '≈ 50 км', 'от Рейкьявика', t, 1.6, 72)
        else:
            u = ease((t - 0.3) / 1.2)
            glow_line(img, polyline_partial([T(cam.P(*q)) for q in FISS], u), (255, 120, 40), 12)
            if name == 'reyk_barrier':
                k = ease((t - 0.8) / 1.4); d = ImageDraw.Draw(img)
                pts = polyline_partial([T(cam.P(*q)) for q in BARR], k)
                if len(pts) > 1: d.line(pts, fill=(240, 240, 240, 255), width=14, joint='curve')
                if t > 2.0: look.text(img, (W * 0.5, H * 0.86), 'ЗАЩИТНЫЕ ВАЛЫ — ДО 8 МЕТРОВ', 40, 700, WHITE, 'mm', alpha=min(1, (t - 2) / 0.4), track=5)
            q = T(cam.P(*GRI)); look.text(img, (q[0], q[1] + 40), 'Гриндавик', 40, 700, WHITE, 'mm', shadow=0.9)
            if name == 'reyk_fissure': cap(img, (W * 0.5, H * 0.84), '4 км', 'трещина извержения, 18 декабря 2023', t, 1.2, 92)
    run(name, dur, draw, cam)

def _bg():
    bg = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(bg)
    for y in range(H): d.line([(0, y), (W, y)], fill=(14 + y // 90, 18 + y // 80, 26 + y // 60, 255))
    return bg

def chart(name, dur, title, sub, items, vmax=None, fmt=lambda v: f'{v:g}', unit=''):
    """Столбики: items = [(подпись, значение, выделить)]."""
    bg = _bg(); n = len(items); vmax = vmax or max(v for _, v, _ in items)
    BW = min(260, int(1300 / n) - 60); gap = min(380, (1400 - n * BW) / max(1, n - 1)) if n > 1 else 0
    X0, Y0, BH = (W - (n * BW + (n - 1) * gap)) / 2, 880, 560
    p = writer(f'{D}/cache/{name}.mp4')
    for i in range(round(dur * FPS)):
        t = i / FPS; img = bg.copy(); d = ImageDraw.Draw(img)
        look.text(img, (W / 2, 110), title, 54, 800, WHITE, 'mm', alpha=min(1, t / 0.4))
        look.text(img, (W / 2, 175), sub.upper(), 26, 600, look.SOFT, 'mm', alpha=min(1, t / 0.6), track=3)
        d.line([(X0 - 60, Y0), (X0 + n * BW + (n - 1) * gap + 60, Y0)], fill=(255, 255, 255, 200), width=4)
        for k, it in enumerate(items):
            lab, v, hi = it[:3]; shown = it[3] if len(it) > 3 else None
            x = X0 + k * (BW + gap); u = ease((t - 0.3 - k * 0.45) / 1.1); h = BH * v / vmax * u
            d.rounded_rectangle((x, Y0 - max(h, 1), x + BW, Y0), 14, fill=ACC + (255,) if hi else (120, 132, 148, 255))
            look.text(img, (x + BW / 2, Y0 + 50), lab, 34, 700, WHITE, 'mm')
            if u > 0.05: look.text(img, (x + BW / 2, Y0 - h - 50), (shown if shown and u > 0.98 else fmt(v * u) + unit), 56, 800, WHITE, 'mm')
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx', name, flush=True)

def timeline(dur):
    """9 извержений у Гриндавика, декабрь 2023 — август 2025."""
    bg = _bg()
    ev = [('18.12.23', 3), ('14.01.24', 2), ('08.02.24', 2), ('16.03.24', 54), ('29.05.24', 24), ('22.08.24', 15), ('20.11.24', 18), ('01.04.25', 1), ('16.07.25', 20)]
    import datetime as dt
    t0d = dt.date(2023, 12, 1); t1d = dt.date(2025, 9, 1); span = (t1d - t0d).days
    X0, X1, Y = 160, W - 160, 640
    p = writer(f'{D}/cache/timeline.mp4')
    for i in range(round(dur * FPS)):
        t = i / FPS; img = bg.copy(); d = ImageDraw.Draw(img)
        look.text(img, (W / 2, 120), 'Извержения у Гриндавика', 56, 800, WHITE, 'mm', alpha=min(1, t / 0.4))
        look.text(img, (W / 2, 190), 'кратерный ряд Сундхнукюр · данные Метеослужбы Исландии'.upper(), 24, 600, look.SOFT, 'mm', track=3)
        u = ease(t / 1.0); d.line([(X0, Y), (X0 + (X1 - X0) * u, Y)], fill=(255, 255, 255, 220), width=4)
        for yr, m in ((2024, 1), (2025, 1)):
            x = X0 + (X1 - X0) * (dt.date(yr, m, 1) - t0d).days / span
            d.line([(x, Y - 20), (x, Y + 20)], fill=(255, 255, 255, 200), width=3); look.text(img, (x, Y + 60), str(yr), 34, 700, WHITE, 'mm')
        for k, (ds, days) in enumerate(ev):
            tk = 0.8 + k * 0.32
            if t < tk: continue
            dd, mm, yy = ds.split('.'); x = X0 + (X1 - X0) * (dt.date(2000 + int(yy), int(mm), int(dd)) - t0d).days / span
            w = max(14, (X1 - X0) * days / span); hh = 70 + 3 * days ** 0.9
            kk = look.ease_back((t - tk) / 0.35)
            d.rounded_rectangle((x, min(Y - 9, Y - hh * kk), x + w, Y - 8), 6, fill=ACC + (255,))
            look.text(img, (x + w / 2, Y - hh * kk - 30), str(k + 1), 34, 800, WHITE, 'mm')
        cap(img, (W / 2, H * 0.86), '9 извержений', 'с декабря 2023 по август 2025 года', t, 3.9, 84)
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx timeline', flush=True)

def _buffer_mask(cam, km, a3='ISL'):
    m = Image.new('L', (cam.v.W, cam.v.H), 0); d = ImageDraw.Draw(m); r = km / cam.v.kpp
    for ring in geo.country(a3):
        pts = cam.v.ring_px(ring)
        if len(pts) < 3 or not geo._visible(pts, cam.v.W, cam.v.H, pad=int(r) + 50): continue
        d.polygon(pts, fill=255)
        if r > 0.5:
            d.line(pts + [pts[0]], fill=255, width=int(2 * r), joint='curve')
            for q in pts[::max(1, len(pts) // 400)]: d.ellipse((q[0] - r, q[1] - r, q[0] + r, q[1] + r), fill=255)
    return m

_ZM = {}
def codzones(dur, upto=3):
    """Рыболовная зона: 12 → 50 → 200 морских миль; upto — сколько колец показать (прежние сразу, новое — с анимацией)."""
    cam = Cam(ISL_C, (65.0, -18.6), 2150, zmax=1.04)
    Z = [(12, '1958', '12 миль'), (50, '1972', '50 миль'), (200, '1975', '200 миль')][:upto]
    if 'm' not in _ZM:
        # зона ограничена срединной линией с соседями (Гренландия, Фарерские острова, Ян-Майен): берём ближе к Исландии, чем к ним
        steps = list(range(0, 400, 15))
        def dcls(a3s):
            out = np.full((cam.v.H, cam.v.W), 255, np.uint8)
            for i, r in enumerate(steps[::-1]):
                m = np.zeros((cam.v.H, cam.v.W), bool)
                for a3 in a3s: m |= np.asarray(_buffer_mask(cam, max(r, 0.5), a3)) > 127
                out[m] = len(steps) - 1 - i
            return out
        dI, dO = dcls(['ISL']), dcls(['GRL', 'FRO', 'NOR'])
        own = dI <= dO
        def zone(km): return Image.fromarray(((np.asarray(_buffer_mask(cam, km)) > 127) & (own | (km < 100))).astype(np.uint8) * 255)
        _ZM['m'] = [zone(nm * 1.852) for nm in (12, 50, 200)]
    masks = _ZM['m']
    def draw(img, T, t):
        p0 = T((0, 0)); p1 = T((cam.v.W, cam.v.H)); size = (round(p1[0] - p0[0]), round(p1[1] - p0[1]))
        n = len(Z)
        for k in range(n - 1, -1, -1):
            tk = 0.3 if k == n - 1 else -1.0
            if t < tk: continue
            a = min(1.0, (t - tk) / 0.6)
            m = masks[k].resize(size, Image.BILINEAR); full = Image.new('L', (W, H), 0); full.paste(m, (round(p0[0]), round(p0[1])))
            edge = full.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(5))
            img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), c) for c in ACC] + [full.point(lambda v: int(v * 0.16 * a))]))
            img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), 255)] * 3 + [edge.point(lambda v: int(v * a))]))
        nm, yr, lab = Z[-1]
        look.text(img, (W * 0.83, H * 0.14), yr, 64, 800, WHITE, 'mm'); look.text(img, (W * 0.83, H * 0.21), lab.upper(), 34, 700, WHITE, 'mm', track=5)
    run(f'zone{Z[-1][0]}', dur, draw, cam)

def giuk(dur):
    cam = Cam((65, -10), (64.0, -8.0), 4200, highlight='ISL', zmax=1.06)
    route = [(69.0, 33.0), (71.0, 20.0), (69.5, 5.0), (65.5, -6.0), (62.5, -14.0), (58.0, -22.0), (54.0, -28.0)]
    def draw(img, T, t):
        u = ease((t - 0.6) / 2.2)
        dashed(img, [T(cam.P(*q)) for q in np.array([np.interp(np.linspace(0, len(route) - 1, 90), range(len(route)), [r[i] for r in route]) for i in (0, 1)]).T], u, (255, 255, 255, 230), 6, 2)
        if t > 1.0: look.text(img, T(cam.P(70.5, 15.0)), 'советские подлодки', 30, 600, WHITE, 'mm', alpha=min(1, (t - 1) / 0.4), shadow=0.9)
        pulse(img, T(cam.P(*KEF)), t); q = T(cam.P(*KEF)); look.text(img, (q[0] - 24, q[1] - 48), 'база НАТО Кеблавик', 38, 700, WHITE, 'rm', shadow=0.9)
    run('giuk', dur, draw, cam)

def icemap(dur):
    cam = Cam(ISL_C, (64.85, -18.9), 950, zmax=1.1, focus=(64.4, -16.8))
    G = [('Ватнайёкюдль', (64.42, -16.8)), ('Лаунгйёкюдль', (64.65, -20.2)), ('Хофсйёкюдль', (64.8, -18.8)), ('Мюрдальсйёкюдль', (63.65, -19.15))]
    def draw(img, T, t):
        for i, (n, p) in enumerate(G):
            if t < 0.3 + 0.35 * i: continue
            q = T(cam.P(*p)); look.text(img, q, n, 38 if i == 0 else 30, 700, WHITE, 'mm', alpha=min(1, (t - 0.3 - 0.35 * i) / 0.4), shadow=1.0)
        cap(img, (W * 0.5, H * 0.86), '≈ 10 %', 'площади страны покрыто ледниками', t, 1.6)
    run('icemap', dur, draw, cam)

def apollo(dur):
    """9 из 12 человек, ходивших по Луне, тренировались в Исландии."""
    bg = _bg(); p = writer(f'{D}/cache/apollo.mp4')
    def person(d, x, y, s, col):
        d.ellipse((x - 26 * s, y - 120 * s, x + 26 * s, y - 68 * s), fill=col)
        d.rounded_rectangle((x - 40 * s, y - 60 * s, x + 40 * s, y + 40 * s), int(30 * s), fill=col)
    for i in range(round(dur * FPS)):
        t = i / FPS; img = bg.copy(); d = ImageDraw.Draw(img)
        look.text(img, (W / 2, 130), 'Люди, которые ходили по Луне', 54, 800, WHITE, 'mm', alpha=min(1, t / 0.4))
        for k in range(12):
            x = W / 2 + (k - 5.5) * 130; tk = 0.2 + 0.08 * k
            if t < tk: continue
            a = min(1, (t - tk) / 0.25); hi = k < 9 and t > 1.6 + 0.08 * k
            col = (ACC if hi else (120, 132, 148)) + (int(255 * a),)
            person(d, x, 620, 1.3, col)
        cap(img, (W / 2, H * 0.86), '9 из 12', 'тренировались в Исландии в 1965 и 1967 годах', t, 2.6, 96)
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx apollo', flush=True)

def lava16(dur):
    """14 км³ лавы Лаки = слой 16 м над Москвой в пределах МКАД (≈ 880 км²); пятиэтажка ≈ 15 м."""
    bg = _bg(); p = writer(f'{D}/cache/lava16.mp4'); G = 860; M = 38   # пикселей на метр
    for i in range(round(dur * FPS)):
        t = i / FPS; img = bg.copy(); d = ImageDraw.Draw(img)
        look.text(img, (W / 2, 120), '14 км³ лавы', 60, 800, WHITE, 'mm', alpha=min(1, t / 0.4))
        look.text(img, (W / 2, 190), 'если разлить по Москве в пределах МКАДа (≈ 880 км²)'.upper(), 26, 600, look.SOFT, 'mm', track=3, alpha=min(1, t / 0.6))
        for bx in (330, 760, 1190):   # пятиэтажки
            d.rectangle((bx, G - 15 * M, bx + 380, G), fill=(196, 200, 206, 255))
            for fl in range(5):
                for wi in range(8): d.rectangle((bx + 18 + wi * 45, G - 15 * M + 22 + fl * 3 * M, bx + 46 + wi * 45, G - 15 * M + 22 + fl * 3 * M + 52), fill=(70, 86, 104, 255))
        u = ease((t - 0.8) / 2.4); lh = 16 * M * u
        lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
        ld.rectangle((0, G - lh, W, G), fill=(255, 92, 30, 175))
        img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(1)))
        d.rectangle((0, G, W, H), fill=(30, 26, 24, 255))
        if u > 0.1:
            d.line([(120, G - lh), (W - 120, G - lh)], fill=(255, 255, 255, 230), width=3)
            look.text(img, (W - 140, G - lh - 30), f'{16 * u:.0f} м', 54, 800, WHITE, 'rm')
        look.text(img, (565, G + 60), 'пятиэтажка ≈ 15 м', 30, 600, WHITE, 'mm')
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx lava16', flush=True)

def carbfix(dur):
    """CO₂ растворяют в воде, закачивают в базальт, через ~2 года он становится камнем."""
    bg = _bg(); p = writer(f'{D}/cache/carbfix.mp4'); G = 360
    rng = np.random.default_rng(5); bub = [(rng.uniform(-60, 60), rng.uniform(0, 1), rng.uniform(6, 13)) for _ in range(60)]
    for i in range(round(dur * FPS)):
        t = i / FPS; img = bg.copy(); d = ImageDraw.Draw(img)
        d.rectangle((0, G, W, H), fill=(52, 54, 60, 255))
        for k in range(14):
            for j in range(5): d.polygon([(k * 150 + j * 30, G + 80 + j * 130), (k * 150 + 70 + j * 30, G + 60 + j * 130), (k * 150 + 120 + j * 30, G + 130 + j * 130), (k * 150 + 40 + j * 30, G + 160 + j * 130)], outline=(80, 82, 90, 255))
        d.rectangle((W / 2 - 22, G - 120, W / 2 + 22, H - 120), fill=(180, 186, 196, 255))
        look.text(img, (W / 2, 80), 'CO₂ + вода → базальт → камень', 52, 800, WHITE, 'mm', alpha=min(1, t / 0.4))
        look.text(img, (W / 2 + 60, G - 60), 'скважина', 30, 600, WHITE, 'lm')
        look.text(img, (120, G + 40), 'БАЗАЛЬТ', 30, 700, look.SOFT, 'lm', track=6)
        for bx, ph, r in bub:
            y = G - 100 + ((ph + t * 0.25) % 1.0) * (H - 260 - G + 100)
            depth = (y - G) / (H - 260 - G)
            col = (120, 200, 255, 230) if depth < 0.75 or t < 1.5 else (240, 240, 240, 255)
            d.ellipse((W / 2 + bx - r, y - r, W / 2 + bx + r, y + r), fill=col)
        k = ease((t - 1.5) / 2.0)
        for j in range(int(40 * k)):
            x = W / 2 + (j % 10 - 4.5) * 70 + (j // 10) * 12; y = H - 200 + (j // 10) * 22
            d.polygon([(x, y - 14), (x + 14, y), (x, y + 14), (x - 14, y)], fill=(245, 245, 245, 255))
        cap(img, (W * 0.74, H * 0.86), '< 2 лет', '≈ 95 % CO₂ стало камнем (Science, 2016)', t, 2.0, 84)
        p.stdin.write(img.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print('gfx carbfix', flush=True)

def final(dur):
    cam = Cam((62, -15), (62, -15), 5200, highlight='ISL', zmax=1.25, z0=1.0, focus=ISL_C)
    def draw(img, T, t):
        pulse(img, T(cam.P(*HEIM)), t); lbl(img, T(cam.P(*HEIM)), 'Хеймаэй', 32, t, 0.5)
        bigname(img, T(cam.P(66.9, -18.6)), 'Исландия', t, 0.8, 56)
    run('final', dur, draw, cam)

pct = lambda v: f'{v:.0f}'.replace('.', ',')
SCENES = dict(
    atlantic=atlantic, moscow=moscow, bulgaria=bulgaria, population=population, ridge=ridge, hotspot=lambda d: ridge(d, 'hotspot'),
    volcanoes=volcanoes, viking=viking,
    thing=lambda d: pin('thing', d, THING, 650, 'Тингвеллир', '930 год', 'здесь начал собираться альтинг', center=(64.2, -21.3), t_num=0.8),
    forest=lambda d: chart('forest', d, 'Леса Исландии', 'доля площади страны, %', [('до викингов', 32, False, '25–40 %'), ('сегодня', 2, True), ('цель к 2100', 12, False)], 40, pct, ' %'),
    laki=lambda d: pin('laki', d, LAKI, 620, 'Лаки', '8 июня 1783', 'трещина 25 км, больше 130 жерл', center=(64.1, -18.3),
                       line=[(63.98, -18.43), (64.03, -18.33), (64.07, -18.23), (64.12, -18.13), (64.17, -18.03)], t_num=1.2),
    lava16=lava16, haze=haze,
    livestock=lambda d: chart('livestock', d, 'Погибло скота после Лаки', '1783–1784, доля поголовья', [('овцы', 80, True), ('коровы', 50, False), ('лошади', 50, False)], 100, pct, ' %'),
    heimaey=heimaey, ashcloud=ashcloud,
    reyk_loc=reykjanes, reyk_fissure=lambda d: reykjanes(d, 'reyk_fissure'), reyk_barrier=lambda d: reykjanes(d, 'reyk_barrier'),
    timeline=timeline,
    powermix=lambda d: chart('powermix', d, 'Откуда электричество Исландии', 'доля выработки, %', [('реки и ГЭС', 70, True), ('геотермальные ТЭС', 30, False)], 100, pct, ' %'),
    alu=lambda d: chart('alu', d, 'Куда уходит электричество', 'доля потребления, примерно', [('алюминиевые заводы', 70, True), ('всё остальное', 30, False)], 100, pct, ' %'),
    carbfix=carbfix, zone12=lambda d: codzones(d, 1), zone50=lambda d: codzones(d, 2), zone200=lambda d: codzones(d, 3), giuk=giuk,
    banks=lambda d: chart('banks', d, 'Три банка против всей страны', 'середина 2008 года', [('ВВП Исландии', 1, False), ('активы трёх банков', 11, True)], 11, lambda v: f'× {v:.0f}' if v > 1.2 else '× 1'),
    tourists=lambda d: chart('tourists', d, 'Иностранные туристы в Исландии', 'человек в год, млн', [('2008', 0.5, False), ('2018', 2.3, True)], 2.5, lambda v: f'{v:.1f}'.replace('.', ','), ' млн'),
    icemap=icemap,
    holuhraun=lambda d: pin('holuhraun', d, HOLU, 600, 'Холухрёйн', '≈ 85 км²', 'новое лавовое поле, 2014–2015', center=(64.75, -17.1), extra=[('Бардарбунга', BARD)], t_num=1.0),
    katla=lambda d: pin('katla', d, KATLA, 420, 'Катла', 'с 1918 года', 'спит под ледником Мюрдальсйёкюдль', center=(63.55, -19.1), extra=[('Вик', VIK)], t_num=1.0),
    ok=lambda d: pin('ok', d, OK, 560, 'Окйёкюдль', '2014', 'ледник признан «умершим»', center=(64.6, -21.0), t_num=1.0),
    askja=lambda d: pin('askja', d, ASKJA, 650, 'Аскья', None, None, center=(65.0, -16.9)),
    apollo=apollo, final=final,
)

if __name__ == '__main__':
    sys.path.insert(0, D)
    from timeline import build
    _, shots, _ = build()
    want = sys.argv[1:]
    done = {}
    for s in shots:   # одна сцена может стоять на нескольких планах подряд — берём общую длительность
        k = s.get('map')
        if k: done[k] = max(done.get(k, 0), s.get('gfx_total', s['dur']))
    for k, dur in done.items():
        if want and k not in want: continue
        if os.path.exists(f'{D}/cache/{k}.mp4') and not want: continue
        SCENES[k](dur + 0.3)
