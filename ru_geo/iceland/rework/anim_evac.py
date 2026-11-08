# Анимация «эвакуация Хеймаэя» (23 января 1973), карта сверху: остров Хеймаэй и южное побережье Исландии.
#   f11 («Стариков и больных вывезли самолётами»): камера близко к острову, у Эльдфетля светится извержение,
#        с аэродрома взлетают коралловые самолётики и уходят на северо-запад (к Рейкьявику).
#   f12 («За шесть часов почти всё население острова оказалось на большой земле»): камера отъезжает,
#        поток белых лодок из гавани в Торлаксхёфн; часы 0 → 6 ч и счётчик жителей до ≈ 5 300.
# Координаты — настоящие (долгота/широта, равнопромежуточная проекция), берег упрощён.
# Запуск (из ru_geo/iceland):  python3 rework/anim_evac.py [секунды=7.73]  ->  cache/anim_evac.mp4
import math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from anim_common import (W, H, SS, CORAL, CORAL_D, CORAL_L, look, clamp, lerp, rnd, fade, Pen, layer2x, down, shadow_of,
                         glow, camera, w2s, label, pad, navy, run)

TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 7.73
K = TOTAL / 7.73
T_F12 = 2.33 * K                                               # начало второй фразы
T_ZOOM0, T_ZOOM1 = 1.25 * K, 3.6 * K                           # отъезд камеры
T_CLK0, T_CLK1 = 0.35 * K, 6.55 * K                            # часы и счётчик («на большой земле» ≈ 6,45)

LON0, LON1, LAT0, LAT1 = -21.85, -19.23, 63.30, 63.96
def P(lat, lon): return ((lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H)

COAST = [(63.79, -21.95), (63.80, -21.85), (63.82, -21.60), (63.835, -21.45), (63.85, -21.40), (63.855, -21.38), (63.87, -21.25),
         (63.865, -21.15), (63.84, -21.03), (63.80, -20.90), (63.76, -20.78), (63.70, -20.62), (63.63, -20.43), (63.57, -20.25),
         (63.535, -20.12), (63.525, -19.98), (63.51, -19.80), (63.49, -19.60), (63.47, -19.40), (63.45, -19.23), (63.44, -19.10)]
HEIM = [(63.448, -20.300), (63.452, -20.285), (63.446, -20.262), (63.444, -20.240), (63.436, -20.226), (63.425, -20.229),
        (63.414, -20.245), (63.403, -20.262), (63.398, -20.279), (63.405, -20.290), (63.418, -20.305), (63.428, -20.322),
        (63.438, -20.318)]
ISLETS = [((63.474, -20.170), 7), ((63.447, -20.190), 6), ((63.420, -20.355), 4), ((63.385, -20.330), 3), ((63.468, -20.235), 3)]
HARBOUR = P(63.442, -20.272)
THORL = P(63.855, -21.375)
AIRPORT = P(63.424, -20.279)
ELDFELL = P(63.433, -20.245)
REYK_DIR = (-0.72, -0.69)                                      # на Рейкьявик (за кадром слева сверху)

LAND, LAND_E = (42, 72, 110), (58, 92, 134)
GLAC = (150, 172, 200)

def smooth(pts, n=6):
    out = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]
        a0 = pts[max(0, i - 1)]; b1 = pts[min(len(pts) - 1, i + 2)]
        for u in np.linspace(0, 1, n, endpoint=False):         # Catmull-Rom
            u2, u3 = u * u, u * u * u
            out.append(tuple(0.5 * ((2 * a[k]) + (-a0[k] + b[k]) * u + (2 * a0[k] - 5 * a[k] + 4 * b[k] - b1[k]) * u2 +
                                    (-a0[k] + 3 * a[k] - 3 * b[k] + b1[k]) * u3) for k in (0, 1)))
    out.append(pts[-1]); return out

def build_map():
    img = Image.fromarray(np.repeat(np.repeat(navy(0.45, 0.62).astype(np.uint8), SS, 0), SS, 1)).convert('RGBA'); pen = Pen(img)
    coast = smooth([P(*c) for c in COAST], 8)
    pen.poly(coast + [(W + 50, -50), (-50, -50)], LAND + (255,))
    # мягкий «рельеф»: несколько светлых пятен, реки, ледник
    lay = layer2x(); lp = Pen(lay)
    for i in range(26):
        x, y = rnd(i, 1) * W, rnd(i, 2) * 380 - 40
        lp.circ((x, y), 60 + 120 * rnd(i, 3), (56, 88, 128, 60))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(30)))
    pen.line(smooth([P(63.99, -21.05), P(63.93, -21.10), P(63.875, -21.20)], 6), (70, 104, 146, 255), 2.4)     # Эльвюсау
    pen.line(smooth([P(63.99, -20.55), P(63.90, -20.66), P(63.82, -20.72), P(63.775, -20.80)], 6), (70, 104, 146, 255), 2.4)  # Тьоурсау
    pen.line(smooth([P(63.80, -19.95), P(63.68, -20.02), P(63.56, -20.03), P(63.525, -20.05)], 6), (70, 104, 146, 255), 2.0)  # Маркарфльоут
    gl = smooth([P(63.648, -19.72), P(63.660, -19.64), P(63.652, -19.55), P(63.628, -19.52), P(63.606, -19.57),
                 P(63.604, -19.66), P(63.622, -19.73), P(63.648, -19.72)], 6)
    pen.line(coast, (150, 180, 214, 255), 2.4)
    # Хеймаэй и островки
    hp = smooth([P(*c) for c in HEIM] + [P(*HEIM[0])], 5)
    pen.poly(hp, LAND_E + (255,)); pen.line(hp, (170, 196, 226, 255), 1.6)
    for (la, lo), r in ISLETS:
        pen.circ(P(la, lo), r, LAND_E + (255,), (170, 196, 226, 255), 1.2)
    # город у гавани и полоса аэродрома
    for i in range(26):
        x = HARBOUR[0] - 22 + 34 * rnd(i, 5); y = HARBOUR[1] + 4 + 14 * rnd(i, 6)
        pen.rect(x, y, x + 3.2, y + 2.4, (226, 232, 240, 255))
    a, b = P(63.428, -20.296), P(63.419, -20.262)
    pen.line([a, b], (150, 164, 184, 255), 4)
    pen.line([(HARBOUR[0] - 3, HARBOUR[1] - 1), (HARBOUR[0] + 10, HARBOUR[1] - 6)], (210, 220, 232, 255), 1.6)
    # Торлаксхёфн: мол
    pen.line([(THORL[0] + 2, THORL[1] + 2), (THORL[0] + 4, THORL[1] + 16), (THORL[0] + 16, THORL[1] + 20)], (210, 220, 232, 255), 2)
    return img

MAP = build_map()

# ---------------- маршрут лодок ----------------
def route(u, lane):
    a, b = HARBOUR, (THORL[0] + 10, THORL[1] + 24)
    mid = ((a[0] + b[0]) / 2 + 60, (a[1] + b[1]) / 2 + 70)     # чуть выгнут в море
    x = (1 - u) ** 2 * a[0] + 2 * u * (1 - u) * mid[0] + u * u * b[0]
    y = (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * mid[1] + u * u * b[1]
    dx = 2 * (1 - u) * (mid[0] - a[0]) + 2 * u * (b[0] - mid[0]); dy = 2 * (1 - u) * (mid[1] - a[1]) + 2 * u * (b[1] - mid[1])
    L = math.hypot(dx, dy); fx, fy = dx / L, dy / L
    w = lane * 26 * math.sin(math.pi * u) ** 0.7                # у причалов поток сужается
    return (x - fy * w, y + fx * w), (fx, fy)

NB = 64
BOATS = [(0.25 * K + (5.4 * K) * (i / NB) ** 1.15 + 0.06 * rnd(i, 1), (2.3 + 0.5 * rnd(i, 2)) * K, 2 * rnd(i, 3) - 1) for i in range(NB)]
def draw_boat(pen, c, f, s, a):
    fx, fy = f; rx, ry = -fy, fx
    pts = [(9, 0), (4, 3.2), (-7, 3.2), (-7, -3.2), (4, -3.2)]
    pen.poly([(c[0] + (u * fx + v * rx) * s, c[1] + (u * fy + v * ry) * s) for u, v in pts], (242, 246, 250, int(255 * a)))

NP = 5
PLANES = [(0.25 * K + i * 0.42 * K, (2.6 + 0.3 * rnd(i, 7)) * K, (rnd(i, 8) - 0.5) * 0.35) for i in range(NP)]
def plane_pos(t, t0, dur, bend):
    u = (t - t0) / dur
    if u < 0 or u > 1: return None
    # разбег по полосе, потом разворот на северо-запад
    a, b = P(63.419, -20.262), P(63.428, -20.296)
    run_ = clamp(u / 0.12)
    if u < 0.12:
        p = (lerp(a[0], b[0], look.ease(run_) ), lerp(a[1], b[1], look.ease(run_))); d = (b[0] - a[0], b[1] - a[1])
    else:
        v = (u - 0.12) / 0.88; v2 = v ** 1.35
        dirx, diry = REYK_DIR[0] + bend, REYK_DIR[1] - bend * 0.5
        L = 1600 * v2
        turn = math.sin(math.pi * clamp(v * 2.2)) * 40 * (1 - v)
        p = (b[0] + dirx * L + turn * 0.4, b[1] + diry * L - turn);
        d = (lerp(b[0] - a[0], dirx * 60, clamp(v * 4)), lerp(b[1] - a[1], diry * 60, clamp(v * 4)))
    L = math.hypot(*d); return p, (d[0] / L, d[1] / L), u

def draw_plane(pen, c, f, s, col):
    fx, fy = f; rx, ry = -fy, fx
    def Q(pts): return [(c[0] + (u * fx + v * rx) * s, c[1] + (u * fy + v * ry) * s) for u, v in pts]
    pen.poly(Q([(13, 0), (10, 1.6), (-11, 1.4), (-13, 0), (-11, -1.4), (10, -1.6)]), col)
    pen.poly(Q([(3, 0), (-3, 13), (-6, 13), (-3, 0), (-6, -13), (-3, -13)]), col)
    pen.poly(Q([(-9, 0), (-12, 5.5), (-14, 5.5), (-12, 0), (-14, -5.5), (-12, -5.5)]), col)

def clock(img, c, r, hrs, a):
    if a <= 0: return
    lay = layer2x(); p = Pen(lay)
    p.circ(c, r, (255, 255, 255, int(28 * a)), (255, 255, 255, int(235 * a)), 3)
    for i in range(12):
        ang = i / 12 * 2 * math.pi
        p.line([(c[0] + math.sin(ang) * r * 0.78, c[1] - math.cos(ang) * r * 0.78), (c[0] + math.sin(ang) * r * 0.9, c[1] - math.cos(ang) * r * 0.9)],
               (255, 255, 255, int(200 * a)), 2.2 if i % 3 == 0 else 1.3)
    # заливка прошедших часов (сектор)
    if hrs > 0.01:
        n = max(2, int(hrs * 12)); pts = [c] + [(c[0] + math.sin(u) * r * 0.7, c[1] - math.cos(u) * r * 0.7) for u in np.linspace(0, hrs / 12 * 2 * math.pi, n)]
        p.poly(pts, CORAL + (int(110 * a),))
    ah = hrs / 12 * 2 * math.pi; am = hrs * 2 * math.pi
    p.line([c, (c[0] + math.sin(am) * r * 0.78, c[1] - math.cos(am) * r * 0.78)], (255, 255, 255, int(255 * a)), 2.4)
    p.line([c, (c[0] + math.sin(ah) * r * 0.52, c[1] - math.cos(ah) * r * 0.52)], CORAL + (int(255 * a),), 4.5)
    p.circ(c, 4.5, (255, 255, 255, int(255 * a)))
    img.alpha_composite(down(lay))

def frame(t):
    world = MAP.copy(); lay = layer2x(); pen = Pen(lay)
    # извержение: светящаяся трещина на востоке острова
    e = ELDFELL; pulse = 0.75 + 0.25 * math.sin(t * 5.3) * math.sin(t * 2.1 + 1)
    pen.line([(e[0] - 3, e[1] - 12), (e[0] + 1, e[1] - 2), (e[0] + 4, e[1] + 10)], CORAL + (255,), 3.2)
    rk = (t * 0.8) % 1                                         # расходящееся коралловое кольцо
    pen.circ(e, 6 + 26 * rk, None, CORAL + (int(200 * (1 - rk)),), 1.6)
    # дым/пепел от извержения, сносимый ветром на запад
    for j in range(16):
        k = ((t * 0.22 + j / 16) % 1)
        pen.circ((e[0] - 90 * k + 4 * math.sin(j), e[1] - 10 - 40 * k), 5 + 26 * k, (120, 120, 132, int(60 * (1 - k) * min(1, k * 6))))
    # лодки
    for i, (t0, dur, lane) in enumerate(BOATS):
        u = (t - t0) / dur
        if not 0 <= u <= 1: continue
        uu = lerp(u, look.ease(u), 0.5)
        c, f = route(uu, lane)
        a = clamp(u / 0.06) * clamp((1 - u) / 0.07)
        for j in range(1, 6):                                  # след
            cb, _ = route(max(0, uu - j * 0.008), lane)
            pen.circ(cb, 1.2 + 0.4 * j, (220, 232, 246, int(80 * a * (1 - j / 6))))
        draw_boat(pen, c, f, 0.95, a)
    # самолёты
    for i, (t0, dur, bend) in enumerate(PLANES):
        r = plane_pos(t, t0, dur, bend)
        if not r: continue
        c, f, u = r
        if u > 0.12:                                           # пунктирный след
            for j in range(1, 22):
                q = plane_pos(t - j * 0.03 * K, t0, dur, bend)
                if q and q[2] > 0.12 and j % 2 == 0: pen.circ(q[0], 1.6, CORAL_L + (int(160 * (1 - j / 22)),))
        sc = 0.75 + 0.55 * look.ease((u - 0.1) / 0.3)          # «набирает высоту» — чуть крупнее
        draw_plane(pen, (c[0] + 5 * sc, c[1] + 7 * sc), f, sc, (2, 8, 20, 90))   # тень
        draw_plane(pen, c, f, sc, CORAL + (255,))
    world.alpha_composite(lay)

    # камера: сначала близко к острову, потом отъезд на всю карту
    zk = look.ease((t - T_ZOOM0) / (T_ZOOM1 - T_ZOOM0))
    z = lerp(1.85, 1.0, zk) * (1 + 0.012 * look.ease(t / TOTAL)) * (1 + 0.004 * math.sin(t * 0.7))
    cx, cy = lerp(HARBOUR[0] - 110, 960, zk), lerp(HARBOUR[1] - 40, 540, zk)
    img = camera(world, z, cx, cy).convert('RGBA')
    S = lambda q: w2s(q, z, cx, cy)
    es = S(e)
    glow(img, [(es[0], es[1], 12 * z, 0.9 * pulse)], (255, 140, 100), 10 * z, 1.0)

    look.tag(img, 'Хеймаэй, 23 января 1973', t)
    # подписи
    hs = S(HARBOUR)
    label(img, (hs[0] - 14 * z, hs[1] + 10 * z), (hs[0] - 14 * z - 150, hs[1] + 10 * z + 70 + 50 * zk), 'ХЕЙМАЭЙ', fade(t, 0.3 * K), size=30, ha='r')
    label(img, (es[0] + 4, es[1] + 2), (es[0] + 110, es[1] + 80 - 30 * zk), 'ИЗВЕРЖЕНИЕ', fade(t, 0.5 * K, T_ZOOM1 + 0.6 * K), size=26)
    ts_ = S(THORL)
    label(img, ts_, (ts_[0] - 30, ts_[1] + 95), 'ТОРЛАКСХЁФН', fade(t, T_ZOOM1 - 0.6 * K), size=30, ha='r')
    a = fade(t, 0.9 * K, T_ZOOM0 + 0.4 * K)                     # пояснение к самолётам на крупном плане
    if a > 0:
        pad(img, (60, 900, 820, 1010), a, k=120)
        pp = Pen(lay2 := layer2x()); draw_plane(pp, (125, 955), (0.0, -1.0), 1.5, CORAL + (int(255 * a),)); img.alpha_composite(down(lay2))
        look.text(img, (170, 955), 'САМОЛЁТЫ — СТАРИКИ И БОЛЬНЫЕ', 30, 700, look.WHITE, 'lm', alpha=a, track=3, shadow=1.0)
    ra = fade(t, T_ZOOM1 - 0.3 * K)
    if ra > 0:
        q = S(P(64.0, -21.55)); d = ImageDraw.Draw(img)
        look.text(img, (40, 158), '↖ РЕЙКЬЯВИК', 26, 700, look.SOFT, 'lm', alpha=ra * 0.9, track=3, shadow=0.9)
    if zk > 0.5:
        look.text(img, S(P(63.86, -20.1)), 'ИСЛАНДИЯ', 46, 800, (150, 178, 210), 'mm', alpha=fade(t, T_ZOOM1 - 0.8 * K, d=0.6) * 0.8, track=14, shadow=0.4)
        look.text(img, S(P(63.60, -20.95)), 'АТЛАНТИЧЕСКИЙ ОКЕАН', 24, 600, (110, 140, 178), 'mm', alpha=fade(t, T_ZOOM1 - 0.8 * K, d=0.6) * 0.8, track=8, shadow=0.0)

    # часы и счётчик (нижний левый угол — открытое море)
    k = clamp((t - T_F12 + 0.15 * K) / (T_CLK1 - T_F12 + 0.15 * K)); k = lerp(k, look.ease(k), 0.5)
    hrs = 6 * k
    ca = fade(t, T_F12 - 0.15 * K, d=0.5)
    if ca > 0:
        pad(img, (60, 760, 760, 1030), ca, k=140)
        clock(img, (165, 895), 74, hrs, ca)
        look.text(img, (275, 850), f'{int(hrs + 0.5)} Ч', 64, 800, look.WHITE, 'lm', alpha=ca, shadow=0.9)
        n = int(round(5300 * k / 10) * 10)
        look.text(img, (275, 925), ('≈ ' if k >= 1 else '') + f'{n:,}'.replace(',', ' ') , 64, 800, CORAL, 'lm', alpha=ca, shadow=0.9)
        look.text(img, (278, 975), 'ЖИТЕЛЕЙ НА БОЛЬШОЙ ЗЕМЛЕ', 22, 600, look.SOFT, 'lm', alpha=ca, track=3, shadow=0.9)
    return img.convert('RGB')

if __name__ == '__main__':
    run(frame, 'anim_evac', TOTAL)
