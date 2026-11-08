# Анимация «трещины в Гриндавике» (ноябрь 2023), вид сверху на городок: дома-блоки, улицы, гавань.
#   a03 («По улицам пошли трещины»): трещины бегут через дороги и между домами (коралловый фронт).
#   a04 («асфальт провалился»): полоса между двумя разломами проседает (грабен: тёмная полоса, тень и уступ),
#        дорога в полосе смещается, пыль, лёгкая тряска.
# Запуск (из ru_geo/iceland):  python3 rework/anim_cracks.py [секунды=2.7]  ->  cache/anim_cracks.mp4
import math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from anim_common import (W, H, SS, CORAL, CORAL_L, look, clamp, lerp, rnd, fade, Pen, layer2x, down, shadow_of,
                         glow, camera, w2s, label, run)

TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 2.7
K = TOTAL / 2.7                                                # всё расписано под 2,7 с
TG0, TG1 = 1.50 * K, 2.12 * K                                   # проседание грабена (a04: «провалился» ≈ 2,04)

LAND, LAND2 = (27, 50, 82), (31, 56, 90)
SEA = (11, 31, 62)
ROAD, ROAD_E = (72, 90, 117), (88, 106, 132)
ROOF, ROOF_D, RIDGE = (232, 237, 242), (204, 212, 222), (176, 187, 200)
CRACK = (7, 12, 24)

ANG = math.radians(-7)                                         # сетка улиц слегка повёрнута
C0 = (960, 520)
def G(x, y):                                                   # локальные координаты сетки -> мир
    dx, dy = x - C0[0], y - C0[1]
    return (C0[0] + dx * math.cos(ANG) - dy * math.sin(ANG), C0[1] + dx * math.sin(ANG) + dy * math.cos(ANG))

def coast_y(x): return 905 + 28 * math.sin(x / 260 + 0.6) + 14 * math.sin(x / 97)

HROADS = [(170, 30), (455, 44), (735, 30)]                    # (y, ширина) в сетке
VROADS = [(250, 30), (640, 30), (1080, 30), (1500, 30), (1860, 30)]

# ---------------- статичный город (2x) ----------------
def build_town():
    img = Image.new('RGBA', (W * SS, H * SS), LAND + (255,)); pen = Pen(img)
    # лёгкие «участки» другого тона
    for i in range(40):
        x, y = rnd(i, 1) * 2100 - 90, rnd(i, 2) * 950 - 40
        pen.poly([G(x, y), G(x + 160, y), G(x + 160, y + 110), G(x, y + 110)], LAND2 + (255,))
    # море и гавань
    xs = np.linspace(-60, W + 60, 80)
    pen.poly([(x, coast_y(x)) for x in xs] + [(W + 60, H + 60), (-60, H + 60)], SEA + (255,))
    pen.line([(x, coast_y(x)) for x in xs], (120, 150, 185, 255), 2.2)
    for x0, L in ((760, 70), (880, 90), (990, 64)):         # причалы
        y0 = coast_y(x0)
        pen.poly([(x0 - 7, y0 - 4), (x0 + 7, y0 - 4), (x0 + 7, y0 + L), (x0 - 7, y0 + L)], (196, 206, 218, 255))
    bw = [(1180 - 260 * math.sin(u * 1.5), coast_y(1180) - 6 + 120 * math.sin(u * 1.4) ** 0.8) for u in np.linspace(0, 1, 30)]   # волнолом
    pen.line(bw, (196, 206, 218, 255), 13)
    for i, (bx, by) in enumerate(((790, 960), (850, 985), (910, 1000), (1020, 975), (720, 990))):   # лодки у причалов
        pen.poly([(bx - 22, by - 7), (bx + 14, by - 7), (bx + 24, by), (bx + 14, by + 7), (bx - 22, by + 7)], (238, 242, 246, 255))
    # дороги
    for y, w in HROADS:
        pts = [G(x, y + 10 * math.sin(x / 400 + y)) for x in np.linspace(-300, 2300, 60)]
        pen.line(pts, ROAD_E + (255,), w + 6); pen.line(pts, ROAD + (255,), w)
    for x, w in VROADS:
        pts = [G(x + 8 * math.sin(y / 300 + x), y) for y in np.linspace(-300, 1000, 50)]
        pts = [p for p in pts if p[1] < coast_y(p[0]) + 10]
        pen.line(pts, ROAD_E + (255,), w + 6); pen.line(pts, ROAD + (255,), w)
    y = 455                                                     # разметка главной улицы
    for x in np.arange(-300, 2300, 46):
        a, b = G(x, y + 10 * math.sin(x / 400 + y)), G(x + 22, y + 10 * math.sin((x + 22) / 400 + y))
        pen.line([a, b], (170, 184, 202, 255), 2.4)
    # дома
    houses = []
    def free(x, y, w, h):
        for ry, rw in HROADS:
            if y + h / 2 > ry - rw / 2 - 12 and y - h / 2 < ry + rw / 2 + 12: return False
        for rx, rw in VROADS:
            if x + w / 2 > rx - rw / 2 - 12 and x - w / 2 < rx + rw / 2 + 12: return False
        p = G(x, y)
        return p[1] + h < coast_y(p[0]) - 16 and -80 < p[0] < W + 80 and -80 < p[1]
    i = 0
    for row_y in list(np.arange(60, 860, 58)):
        x = -120 + 30 * rnd(row_y, 3)
        while x < 2100:
            i += 1
            w, h = 44 + 30 * rnd(i, 4), 30 + 14 * rnd(i, 5)
            big = rnd(i, 6) > 0.95
            if big: w, h = w * 1.9, h * 1.5
            cx, cy = x + w / 2, row_y + 6 * (rnd(i, 7) - 0.5)
            if free(cx, cy, w, h) and rnd(i, 8) > 0.16:
                houses.append((cx, cy, w, h, big))
            x += w + 18 + 26 * rnd(i, 9)
    hl = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); hp = Pen(hl)
    for cx, cy, w, h, big in houses:
        q = lambda a, b: G(cx + a, cy + b)
        hp.poly([q(-w / 2, -h / 2), q(w / 2, -h / 2), q(w / 2, 0), q(-w / 2, 0)], ROOF + (255,))
        hp.poly([q(-w / 2, 0), q(w / 2, 0), q(w / 2, h / 2), q(-w / 2, h / 2)], ROOF_D + (255,))
        hp.line([q(-w / 2 + 2, 0), q(w / 2 - 2, 0)], RIDGE + (255,), 1.6)
        if big: hp.poly([q(-w / 4, -h / 2 - 1), q(-w / 4 + 12, -h / 2 - 1), q(-w / 4 + 12, h / 2), q(-w / 4, h / 2)], (214, 221, 230, 255))
    sh = shadow_of(hl.reduce(SS), r=5, off=(5, 7), a=0.6).resize((W * SS, H * SS), Image.BILINEAR)
    img.alpha_composite(sh); img.alpha_composite(hl)
    return img

# ---------------- трещины ----------------
def jag(a, b, n, amp, seed):
    pts = []
    for k in range(n + 1):
        u = k / n
        off = 0 if k in (0, n) else amp * (rnd(k, seed) - 0.5) * 2 * math.sin(math.pi * u) ** 0.4
        nx, ny = -(b[1] - a[1]), b[0] - a[0]; L = math.hypot(nx, ny); nx, ny = nx / L, ny / L
        pts.append((lerp(a[0], b[0], u) + nx * off, lerp(a[1], b[1], u) + ny * off))
    return pts

def seg_len(pts): return np.concatenate([[0], np.cumsum([math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])])])

# два разлома грабена (почти север–юг, через весь город) + короткие поперечные/кулисные трещины
FAULT_L = jag((870, -40), (985, 900), 26, 14, 11)
FAULT_R = jag((1015, -40), (1125, 900), 26, 14, 12)
CRACKS = [  # (точки, t0, длительность, макс. ширина)
    (FAULT_L, 0.10, 1.05, 10),
    (FAULT_R, 0.22, 1.05, 10),
    (jag((420, 470), (760, 395), 12, 12, 21), 0.35, 0.75, 6),
    (jag((1280, 520), (1650, 455), 12, 12, 22), 0.45, 0.70, 6),
    (jag((560, 210), (300, 330), 10, 10, 23), 0.55, 0.60, 5),
    (jag((1420, 180), (1700, 290), 10, 10, 24), 0.62, 0.60, 5),
    (jag((1180, 760), (1450, 690), 10, 10, 25), 0.70, 0.55, 5),
    (jag((640, 760), (420, 690), 10, 10, 26), 0.75, 0.55, 4.5),
    (jag((930, 300), (760, 250), 8, 7, 27), 0.60, 0.45, 4),
    (jag((1070, 610), (1250, 650), 8, 7, 28), 0.66, 0.45, 4),
]
CR = [(p, t0 * K, d * K, w, seg_len(p)) for p, t0, d, w in CRACKS]

def crack_poly(pts, L, upto, wmax, seed):
    """Многоугольник трещины до длины upto (сужается к концам, рваные края)."""
    if upto <= 1: return None, None
    n = int(np.searchsorted(L, upto))
    P = pts[:n] + ([(lerp(pts[n - 1][0], pts[n][0], (upto - L[n - 1]) / (L[n] - L[n - 1])),
                     lerp(pts[n - 1][1], pts[n][1], (upto - L[n - 1]) / (L[n] - L[n - 1])))] if n < len(pts) else [])
    Ls = seg_len(P); tot = L[-1]
    left, right = [], []
    for i, p in enumerate(P):
        a, b = P[max(0, i - 1)], P[min(len(P) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, ty) + 1e-6; nx, ny = -ty / l, tx / l
        u = Ls[i] / tot
        w = wmax * (math.sin(math.pi * clamp(u, 0.02, 0.98)) ** 0.5) * (0.65 + 0.7 * rnd(i, seed))
        w *= clamp((upto - Ls[i]) / 60 + 0.25)                 # у растущего кончика тоньше
        left.append((p[0] + nx * w / 2, p[1] + ny * w / 2)); right.append((p[0] - nx * w / 2, p[1] - ny * w / 2))
    return left + right[::-1], P[-1]

def band_poly():
    return FAULT_L + FAULT_R[::-1]

# ---------------- кадр ----------------
TOWN = build_town()
BAND = Image.new('L', (W * SS, H * SS), 0); Pen(BAND).poly(band_poly(), 255)
_xs = np.linspace(-60, W + 60, 80)
Pen(BAND).poly([(x, coast_y(x) - 2) for x in _xs] + [(W + 60, H + 60), (-60, H + 60)], 0)      # только суша
SHL = Image.new('L', (W * SS, H * SS), 0); Pen(SHL).line(FAULT_L, 255, 46)
SHL = Image.fromarray((np.asarray(SHL.filter(ImageFilter.GaussianBlur(24)), float) * np.asarray(BAND, float) / 255).astype(np.uint8))
BAND_A = np.asarray(BAND, float)[..., None] / 255
SHL_A = np.asarray(SHL, float)[..., None] / 255

def frame(t):
    world = TOWN.copy()
    k = look.ease((t - TG0) / (TG1 - TG0))                     # проседание 0..1
    if k > 0:
        # содержимое полосы смещается (уступ разрывает дорогу) и темнеет; тень у западного уступа
        shifted = Image.new('RGBA', world.size, (0, 0, 0, 0))
        shifted.paste(world, (int(9 * k * SS), int(7 * k * SS)))
        a = np.asarray(world, float); s = np.asarray(shifted, float)
        s[..., 3:] = 255
        mix = a * (1 - BAND_A) + s * BAND_A
        mix[..., :3] *= 1 - BAND_A * 0.30 * k
        mix[..., :3] *= 1 - SHL_A * 0.50 * k
        world = Image.fromarray(np.clip(mix, 0, 255).astype(np.uint8))
    ov = Image.new('RGBA', world.size, (0, 0, 0, 0)); po = Pen(ov)
    if k > 0:                                                  # светлая стенка восточного уступа
        po.line([(x - 6 * k, y) for x, y in FAULT_R], (128, 140, 158, int(255 * k)), 1 + 9 * k)
    pen = Pen(world)
    tips = []
    for idx, (pts, t0, d, wmax, L) in enumerate(CR):
        g = look.ease_out((t - t0) / d)
        if g <= 0: continue
        wm = wmax * (1 + (1.2 if idx < 2 else 0.4) * k)          # при проседании разломы раскрываются
        poly, tip = crack_poly(pts, L, g * L[-1], wm, idx * 7 + 3)
        if poly is None: continue
        pen.poly(poly, CRACK + (255,))
        # свежий край — тонкий коралловый отсвет, гаснет после остановки трещины
        fresh = 1 - clamp((t - t0 - d) / 0.5)
        if fresh > 0:
            po.poly(poly, None, CORAL_L + (int(150 * fresh),), 1.4)
        if g < 0.999: tips.append(tip)
    # пыль вдоль разломов при проседании
    if 0 < t - TG0 < 1.2 * K:
        u = (t - TG0) / (1.2 * K)
        for j in range(70):
            src = FAULT_L if j % 2 else FAULT_R
            p = src[int(rnd(j, 31) * (len(src) - 1))]
            r = 6 + 22 * look.ease_out(u) * (0.5 + rnd(j, 32))
            po.circ((p[0] + 20 * u * (rnd(j, 33) - 0.5), p[1] - 14 * u), r, (196, 206, 220, int(38 * (1 - u) ** 1.5)))
    world.alpha_composite(ov)

    # камера: медленный наезд + тряска при проседании
    z = 1.035 + 0.06 * look.ease(t / TOTAL)
    sh = 7 * math.exp(-max(0, t - TG0 - 0.3 * K) * 5) * (t > TG0 + 0.12 * K)
    sx, sy = sh * math.sin(t * 61), sh * math.cos(t * 47)
    img = camera(world, z, 960, 540, sx, sy).convert('RGBA')
    S = lambda p: w2s(p, z, 960, 540, sx, sy)
    # кончики растущих трещин
    glow(img, [(*S(p), 16, 0.9) for p in tips], (255, 150, 110), 10)
    for p in tips:
        q = S(p); ImageDraw.Draw(img).ellipse((q[0] - 4, q[1] - 4, q[0] + 4, q[1] + 4), fill=CORAL + (255,))
    # подписи
    look.tag(img, 'Гриндавик, ноябрь 2023', t)
    pa = S(lerp_pt(FAULT_L, FAULT_R, 0.47))
    label(img, pa, (pa[0] + 150, pa[1] - 120), 'ПРОВАЛ', fade(t, TG0 + 0.18 * K, d=0.25), size=30)
    return img.convert('RGB')

def lerp_pt(A, B, u):
    i = int(u * (len(A) - 1)); return ((A[i][0] + B[i][0]) / 2, (A[i][1] + B[i][1]) / 2)

if __name__ == '__main__':
    run(frame, 'anim_cracks', TOTAL)
