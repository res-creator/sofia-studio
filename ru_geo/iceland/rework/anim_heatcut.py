# Анимация «лава перерезала трубу» (8 февраля 2024), схема сверху, север вверху.
#   j14 («В феврале лава перерезала трубу с горячей водой от Свартсенги»): по трубе от станции Свартсенги
#        к городам бегут тёплые частицы; с востока, от трещины Сундхнукюр, ползёт язык лавы и на «перерезала»
#        режет трубу (вспышка, пар из обрывков).
#   j15 («и посреди зимы десятки тысяч человек на несколько дней остались без отопления»): ниже разреза вода
#        уходит, труба остывает, дома из тёплых становятся холодно-синими, идёт снег, термометр падает.
# Схема упрощённая: станция в центре внизу, Рейкьянесбайр на северо-западе у моря, трещина к востоку от станции.
# Запуск (из ru_geo/iceland):  python3 rework/anim_heatcut.py [секунды=8.37]  ->  cache/anim_heatcut.mp4
import math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from anim_common import (W, H, SS, CORAL, CORAL_D, CORAL_L, look, clamp, lerp, lerpc, rnd, fade, Pen, layer2x, down, shadow_of,
                         glow, camera, w2s, label, pad, spark, navy, run)

TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 8.37
K = TOTAL / 8.37
T_CUT = 1.28 * K                                               # «перерезала» 1,06–1,5
T_PLANT = 2.95 * K                                             # «от Свартсенги»
T_J15 = 3.83 * K
T_WINTER = 4.05 * K                                            # «посреди зимы»
T_PEOPLE = 4.90 * K                                            # «десятки тысяч человек»
T_NOHEAT = 7.15 * K                                            # «остались без отопления»
FLOW_V = 230.0 / K                                             # скорость частиц, px/с

LAND = (24, 46, 78)
SEA = (10, 28, 56)
PIPE = (150, 164, 184)
HOT, HOT_L = (255, 140, 86), (255, 196, 150)
COLD, COLD_L = (110, 170, 235), (180, 214, 250)

def coast_y(x): return 150 + 24 * math.sin(x / 230 + 1.0) + 12 * math.sin(x / 83) + (60 if x < 700 else 60 * clamp((900 - x) / 200)) * 0

# ---------------- трасса трубы ----------------
PLANT = (1060, 800)
def bez(pts, n=40):
    out = []
    for i in range(len(pts) - 1):
        a, b = pts[i], pts[i + 1]; a0 = pts[max(0, i - 1)]; b1 = pts[min(len(pts) - 1, i + 2)]
        for u in np.linspace(0, 1, n, endpoint=False):
            u2, u3 = u * u, u * u * u
            out.append(tuple(0.5 * ((2 * a[k]) + (-a0[k] + b[k]) * u + (2 * a0[k] - 5 * a[k] + 4 * b[k] - b1[k]) * u2 +
                                    (-a0[k] + 3 * a[k] - 3 * b[k] + b1[k]) * u3) for k in (0, 1)))
    out.append(pts[-1]); return out
PATH = bez([(1060, 758), (1050, 640), (1010, 520), (900, 420), (720, 340), (560, 290), (400, 262), (250, 240)], 30)
SL = np.concatenate([[0], np.cumsum([math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(PATH, PATH[1:])])])
TOT_L = SL[-1]
def at(s):
    s = clamp(s, 0, TOT_L); i = min(len(PATH) - 2, int(np.searchsorted(SL, s, 'right') - 1))
    u = (s - SL[i]) / max(1e-6, SL[i + 1] - SL[i]); a, b = PATH[i], PATH[i + 1]
    return (lerp(a[0], b[0], u), lerp(a[1], b[1], u))
CUT_Y = 600
S_CUT = float(SL[int(np.argmin([abs(p[1] - CUT_Y) for p in PATH]))])
CUTP = at(S_CUT)

# ---------------- города ----------------
TOWNS = [  # (центр, радиус, кол-во домов, s на трубе)
    ((470, 235), 120, 70, None),                               # Рейкьянесбайр
    ((250, 215), 60, 18, None),
    ((760, 300), 60, 16, None),
]
HOUSES = []
for ti, (c, r, n, _) in enumerate(TOWNS):
    for i in range(n * 3):
        if len([h for h in HOUSES if h[4] == ti]) >= n: break
        a = rnd(i, 10 + ti) * 2 * math.pi; d = r * math.sqrt(rnd(i, 20 + ti))
        x, y = c[0] + d * math.cos(a) * 1.25, c[1] + d * math.sin(a) * 0.65
        if y > coast_y(x) + 18 and all(math.hypot(x - h[0], y - h[1]) > 20 for h in HOUSES):
            # s ближайшей точки трубы (откуда доходит тепло)
            s = float(SL[int(np.argmin([math.hypot(p[0] - x, p[1] - y) for p in PATH]))])
            HOUSES.append((x, y, 10 + 6 * rnd(i, 30 + ti), 8 + 5 * rnd(i, 40 + ti), ti, s))

# ---------------- лава ----------------
FISS = [(1430, 470), (1410, 560), (1440, 650), (1420, 740), (1450, 830)]
def lava_poly(t):
    """Язык лавы от трещины на запад; фронт x_f(t). Возвращает контур и x фронта."""
    if t < T_CUT: xf = lerp(1330, 1066, look.ease(t / T_CUT) * 0.6 + 0.4 * (t / T_CUT))
    else: xf = 1066 - 120 * look.ease_out((t - T_CUT) / (4.0 * K))
    xf += 3 * math.sin(t * 2.0)
    top, bot = [], []
    for u in np.linspace(0, 1, 34):
        x = lerp(1440, xf, u)
        hw = lerp(100, 62, u ** 0.7) + 8 * math.sin(u * 9 + 1.3) + 5 * math.sin(u * 23)
        yc = 610 + 18 * math.sin(u * 3.1) - 10 * u
        top.append((x, yc - hw)); bot.append((x, yc + hw * 0.92))
    front = []
    a, b = top[-1], bot[-1]
    for v in np.linspace(0, 1, 16)[1:-1]:                      # лопасти фронта
        y = lerp(a[1], b[1], v); x = lerp(a[0], b[0], v) - 26 * math.sin(math.pi * v) - 10 * abs(math.sin(v * 3 * math.pi + t * 1.2))
        front.append((x, y))
    cap = []                                                   # скруглённый край за трещиной (на востоке)
    a, b = bot[0], top[0]; cyc = (a[1] + b[1]) / 2; r = (a[1] - b[1]) / 2
    for v in np.linspace(0, math.pi, 14)[1:-1]:
        cap.append((1440 + 0.35 * r * math.sin(v) + 6 * math.sin(v * 5 + t), cyc + r * math.cos(v)))
    return top + front + bot[::-1] + cap, xf

def build_bg():
    img = Image.new('RGBA', (W * SS, H * SS), LAND + (255,)); pen = Pen(img)
    # топографические горизонтали
    for k in range(9):
        c = (1250 + 60 * rnd(k, 1), 760 + 40 * rnd(k, 2)); r = 90 + 80 * k
        pts = [(c[0] + r * 1.5 * math.cos(a) * (1 + 0.08 * math.sin(3 * a + k)), c[1] + r * 0.8 * math.sin(a) * (1 + 0.08 * math.cos(2 * a + k)))
               for a in np.linspace(0, 2 * math.pi, 120)]
        pen.line(pts, (34, 60, 96, 255), 1.4)
    xs = np.linspace(-50, W + 50, 90)
    pen.poly([(x, coast_y(x)) for x in xs] + [(W + 50, -50), (-50, -50)], SEA + (255,))
    pen.line([(x, coast_y(x)) for x in xs], (120, 150, 185, 255), 2.2)
    # старое лавовое поле (чуть темнее), дорога
    pen.line(bez([(1180, 1100), (1120, 900), (1110, 700), (1060, 520), (960, 380), (880, 240)], 20), (44, 66, 98, 255), 8)
    # станция Свартсенги
    x, y = PLANT
    pen.rect(x - 70, y - 40, x + 70, y + 40, (232, 237, 243, 255), r=8)
    pen.rect(x - 70, y + 10, x + 70, y + 40, (204, 212, 222, 255), r=6)
    for dx in (-36, 0, 36): pen.rect(x + dx - 10, y - 26, x + dx + 10, y - 4, (90, 106, 132, 255), r=3)
    pen.circ((x + 100, y - 6), 26, (214, 222, 232, 255)); pen.circ((x + 100, y - 6), 15, (150, 164, 184, 255))
    return img

BG = build_bg()

def pipe_temp(s, t):
    """1 — горячо, 0 — остыло. Выше разреза тепло держится; ниже — хвост горячей воды уходит к городам, труба остывает."""
    if t < T_CUT: return 1.0
    dt = t - T_CUT
    if s < S_CUT - 8: return 1.0 - 0.35 * clamp(dt / (1.5 * K))
    front = S_CUT + FLOW_V * 1.15 * dt                         # за хвостом воды — остывание
    return clamp(1 - (front - s) / 260) if s < front else 1.0

def house_cold(h, t):
    s = h[5]
    t_reach = T_CUT + (s - S_CUT) / (FLOW_V * 1.15) + 0.5 * K
    t0 = max(t_reach, T_J15 - 0.4 * K)
    return look.ease((t - t0 - 0.4 * K * rnd(int(h[0] + h[1]), 3)) / (2.4 * K))

def frame(t):
    world = BG.copy(); lay = layer2x(); pen = Pen(lay)
    # пар над станцией — постоянное движение
    for j in range(14):
        k = ((t * 0.35 + j / 14) % 1); x0 = PLANT[0] + 100 + 8 * math.sin(j * 2.1)
        pen.circ((x0 - 30 * k + 6 * math.sin(t + j), PLANT[1] - 30 - 120 * k), 10 + 26 * k, (230, 236, 244, int(110 * (1 - k) * min(1, k * 5))))
    # труба: тёмное основание, светящаяся сердцевина по температуре
    pen.line(PATH, (14, 26, 46, 255), 17)
    pen.line(PATH, PIPE + (255,), 12)
    segs = 120
    for i in range(segs):
        s0, s1 = TOT_L * i / segs, TOT_L * (i + 1) / segs
        if abs((s0 + s1) / 2 - S_CUT) < 26 and t >= T_CUT: continue
        hot = pipe_temp((s0 + s1) / 2, t)
        col = lerpc(COLD_L, HOT, hot)
        pen.line([at(s0), at((s0 + s1) / 2), at(s1)], col + (255,), 5.5)
    # частицы горячей воды
    for i in range(70):
        s = (i / 70 * TOT_L + FLOW_V * t) % TOT_L
        if t >= T_CUT:
            dt = t - T_CUT
            s_lin = i / 70 * TOT_L + FLOW_V * t
            # выше разреза поток встаёт (частицы замирают), ниже — уходят и не возвращаются
            s_at_cut = i / 70 * TOT_L + FLOW_V * T_CUT
            s_cut_mod = s_at_cut % TOT_L
            if s_cut_mod < S_CUT:
                s = s_cut_mod + FLOW_V * (1 - math.exp(-dt / (0.25 * K))) * 0.25 * K
                if s > S_CUT - 18: continue
                a = 1 - clamp(dt / (1.2 * K))
            else:
                s = s_cut_mod + FLOW_V * dt
                if s > TOT_L: continue
                a = 1.0
        else:
            a = 1.0
            if abs(s - S_CUT) < 1: pass
        if a <= 0.02: continue
        p = at(s); pen.circ(p, 4.2, HOT_L + (int(255 * a),))
    # дома
    for h in HOUSES:
        x, y, w, hh, ti, s = h
        c = house_cold(h, t)
        roof = lerpc((250, 236, 222), (214, 228, 244), c)
        pen.rect(x - w / 2 + 3, y - hh / 2 + 4, x + w / 2 + 3, y + hh / 2 + 4, (6, 14, 30, 110), r=2)
        pen.rect(x - w / 2, y - hh / 2, x + w / 2, y + hh / 2, roof + (255,), r=2)
        pen.rect(x - 2.5, y - 2, x + 2.5, y + 2, lerpc((255, 170, 90), (80, 110, 150), c) + (255,))
    world.alpha_composite(lay)

    # лава (свой слой, поверх трубы)
    lv = layer2x(); lp = Pen(lv)
    poly, xf = lava_poly(t)
    lp.poly(poly, (74, 30, 26, 255))
    inner = [(x * 0.985 + 0.015 * 1200, y * 0.98 + 0.02 * 610) for x, y in poly]
    lp.poly(inner, (98, 38, 30, 255))
    for j in range(26):                                        # трещины корки
        u = rnd(j, 51); x = lerp(1430, xf + 30, u); y = 610 + 120 * (rnd(j, 52) - 0.5) * (1 - 0.3 * u)
        L = 18 + 22 * rnd(j, 53); ang = rnd(j, 54) * math.pi
        br = 0.6 + 0.4 * math.sin(t * 3 + j)
        lp.line([(x - L * math.cos(ang), y - L * math.sin(ang)), (x, y + 4), (x + L * math.cos(ang), y + L * math.sin(ang))],
                lerpc((150, 50, 30), (255, 150, 80), br) + (255,), 2.2)
    lp.line(poly + [poly[0]], CORAL + (255,), 4)
    for i in range(len(FISS) - 1):
        lp.line([FISS[i], FISS[i + 1]], (255, 220, 160, 255), 5)
    world.alpha_composite(lv)
    # пар из обрывков трубы
    if t > T_CUT:
        st = layer2x(); sp = Pen(st)
        for j in range(18):
            k = ((t - T_CUT) * 0.7 + j / 18) % 1
            if (t - T_CUT) * 0.7 < j / 18: continue
            for side in (-1, 1):
                p = at(S_CUT + side * 120)
                sp.circ((p[0] - 25 * k + 8 * side, p[1] - 90 * k), 8 + 22 * k, (236, 242, 250, int(120 * (1 - k))))
        world.alpha_composite(st)

    # снег
    if t > T_WINTER - 0.3 * K:
        sn = layer2x(); snp = Pen(sn); dens = fade(t, T_WINTER - 0.3 * K, d=0.8 * K)
        for i in range(220):
            if rnd(i, 61) > dens: continue
            sp_ = 60 + 50 * rnd(i, 62)
            x = (rnd(i, 63) * W + 30 * math.sin(t * 0.9 + i) - 25 * t) % W
            y = (rnd(i, 64) * H + sp_ * t) % H
            snp.circ((x, y), 1.6 + 2.2 * rnd(i, 65), (242, 247, 252, int(150 + 100 * rnd(i, 66))))
        world.alpha_composite(sn)

    # камера
    z = 1.02 + 0.05 * look.ease(t / TOTAL)
    sh = 5 * math.exp(-max(0, t - T_CUT) * 5) * (t > T_CUT)
    sx, sy = sh * math.sin(t * 59), sh * math.cos(t * 41)
    cx, cy = 900, 540
    img = camera(world, z, cx, cy, sx, sy).convert('RGBA')
    S = lambda q: w2s(q, z, cx, cy, sx, sy)
    # свечение лавы, трубы и тёплых домов
    lg = [(*S(FISS[i]), 30, 0.55 + 0.15 * math.sin(t * 3 + i)) for i in range(len(FISS))]
    lg += [(*S((x, y)), 40, 0.35) for x, y in poly[::4]]
    glow(img, lg, (255, 120, 70), 26, 0.85)
    hg = [(*S((h[0], h[1])), 13, 0.55 * (1 - house_cold(h, t)) * (0.85 + 0.15 * math.sin(t * 3 + h[0]))) for h in HOUSES]
    glow(img, hg, (255, 170, 100), 9, 0.9)
    spark(img, S(CUTP), (t - T_CUT) / (0.6 * K), 7, scale=1.3)

    look.tag(img, 'Февраль 2024', t, sub='полуостров Рейкьянес')
    ps = S(PLANT)
    la = fade(t, 0.3 * K)
    label(img, (ps[0] + 60, ps[1] + 40), (ps[0] + 190, ps[1] + 120), 'СВАРТСЕНГИ', la, size=30)
    if t > T_PLANT:                                            # «от Свартсенги» — кольцо вокруг станции
        k = (t - T_PLANT) / (0.9 * K)
        if k < 1:
            d = ImageDraw.Draw(img); r = 90 + 80 * look.ease_out(k)
            d.ellipse((ps[0] - r, ps[1] - r, ps[0] + r, ps[1] + r), outline=CORAL + (int(230 * (1 - k)),), width=4)
    lvs = S((1300, 690))
    label(img, lvs, (lvs[0] + 190, lvs[1] + 110), 'ЛАВА', fade(t, 0.45 * K, T_J15), size=30)
    pm = S(at(S_CUT + 300))
    label(img, pm, (pm[0] + 110, pm[1] - 90), 'ТРУБА С ГОРЯЧЕЙ ВОДОЙ', fade(t, 1.6 * K, T_J15 + 0.3 * K), size=26)
    ts_ = S((470, 235))
    label(img, (ts_[0] - 20, ts_[1] + 30), (ts_[0] - 150, ts_[1] + 170), 'РЕЙКЬЯНЕСБАЙР', fade(t, 0.6 * K), size=28)

    # термометр (справа)
    tk = look.ease((t - T_J15 + 0.3 * K) / (T_NOHEAT - T_J15 + 0.5 * K))
    thermo(img, (1745, 330), tk, fade(t, T_J15 - 0.6 * K))

    # итоговые подписи (левый нижний угол — пустое поле)
    a1 = fade(t, T_PEOPLE, d=0.4); a2 = fade(t, T_NOHEAT, d=0.35)
    if a1 > 0:
        pad(img, (60, 830, 900, 1040 if a2 > 0 else 930), a1, k=130)
        look.text(img, (100, 880), 'ДЕСЯТКИ ТЫСЯЧ ЧЕЛОВЕК', 44, 800, look.WHITE, 'lm', alpha=a1, track=3, shadow=0.9)
        if a2 > 0:
            look.text(img, (100 - 20 * (1 - look.ease_out(a2)), 980), 'БЕЗ ОТОПЛЕНИЯ', 54, 800, COLD_L, 'lm', alpha=a2, track=4, shadow=0.9)
    return img.convert('RGB')

def thermo(img, top, k, a):
    """Термометр без чисел: столбик падает, цвет из кораллового в холодный синий."""
    if a <= 0: return
    lay = layer2x(); p = Pen(lay)
    x, y = top; hgt = 300
    col = lerpc(CORAL, COLD, k)
    p.rect(x - 22, y - 12, x + 22, y + hgt, (255, 255, 255, int(40 * a)), r=22, outline=(255, 255, 255, int(230 * a)), w=3)
    p.circ((x, y + hgt + 28), 42, (255, 255, 255, int(40 * a)), (255, 255, 255, int(230 * a)), 3)
    p.circ((x, y + hgt + 28), 31, col + (int(255 * a),))
    lvl = lerp(y + 20, y + hgt - 40, k) + 3 * math.sin(lerp(0, 1, k) * 12)
    p.rect(x - 11, lvl, x + 11, y + hgt + 10, col + (int(255 * a),), r=10)
    for i in range(7):
        yy = y + 20 + i * (hgt - 40) / 6
        p.line([(x + 30, yy), (x + (46 if i % 3 == 0 else 38), yy)], (255, 255, 255, int(200 * a)), 2)
    img.alpha_composite(down(lay))
    look.text(img, (x, y + hgt + 100), 'В ДОМАХ', 24, 700, look.WHITE, 'mm', alpha=a, track=4, shadow=0.9)

if __name__ == '__main__':
    run(frame, 'anim_heatcut', TOTAL)
