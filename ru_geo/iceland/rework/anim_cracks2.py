# Анимация «глубина трещины» (Гриндавик, январь 2024): разрез грунта под улицей, спокойно и бережно.
#   0–2,6 с: «Трещины в городе были такими глубокими» — узкая трещина раскрывается вниз, в темноту;
#            линейка глубины дорисовывается: 10, 20, 30 м…
#   2,6–5,1 с: «в январе рабочий, который их засыпал» — экскаватор опускает ковш и сыплет гравий;
#            почти весь гравий исчезает в глубине, сверху нарастает тонкая «корка».
#   5,1 с–конец: «провалился в одну из них» — корка (без людей!) проседает и уходит вниз, камера медленно
#            опускается вдоль линейки: глубина — десятки метров.
# Запуск (из ru_geo/iceland):  python3 rework/anim_cracks2.py [секунды=6.73]  ->  cache/anim_cracks2.mp4
import math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from anim_common import (W, H, SS, CORAL, CORAL_D, CORAL_L, look, clamp, lerp, rnd, fade, Pen, layer2x, down, shadow_of,
                         glow, camera, w2s, label, pad, run)

TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 6.73
K = TOTAL / 6.73
T_OPEN0, T_OPEN1 = 0.10 * K, 1.90 * K                          # трещина раскрывается («глубокими» ≈ 1,7)
T_RUL0, T_RUL1 = 0.90 * K, 2.70 * K                            # линейка
T_ARM0, T_ARM1 = 2.55 * K, 3.25 * K                            # ковш над трещиной («январе рабочий»)
T_DUMP0, T_DUMP1 = 3.30 * K, 4.95 * K                          # сыплет гравий («засыпал» ≈ 4,4)
T_COL = 5.20 * K                                               # корка уходит вниз («провалился» ≈ 5,18)
T_PUSH = 5.15 * K

SURF = 380                                                     # поверхность улицы (y)
PXM = 20.0                                                     # пикселей на метр
FX = 960                                                       # ось трещины
CRUST_Y = SURF + 34                                            # где застревает гравий

SKY_A, SKY_B = np.array((22, 50, 92), float), np.array((12, 32, 64), float)
ASPH, SOIL = (64, 72, 88), (46, 58, 80)
ROCK1, ROCK2 = (25, 44, 72), (20, 37, 63)
VOID_TOP, VOID_BOT = (12, 20, 36), (2, 4, 10)
GRAVEL = (186, 194, 206)
BODY, BODY_D, TRACK = (234, 238, 243), (204, 212, 222), (70, 78, 92)

HW = 1500                                                      # высота мира (камера опускается вниз)
# ---------------- стенки трещины ----------------
YS = np.linspace(SURF, HW + 20, 120)
def half_w(y):                                                 # полуширина полностью раскрытой трещины
    d = (y - SURF) / PXM
    return 46 * math.exp(-d / 13) + 13 + 3 * math.sin(d * 0.9)
WALL_L = [(FX - half_w(y) + 7 * (rnd(i, 1) - 0.5) + 10 * math.sin(i * 0.37), y) for i, y in enumerate(YS)]
WALL_R = [(FX + half_w(y) + 7 * (rnd(i, 2) - 0.5) + 10 * math.sin(i * 0.37), y) for i, y in enumerate(YS)]
def walls(o, depth):
    """Стенки при раскрытии o (0..1) до глубины depth (y)."""
    L, R = [], []
    for (xl, y), (xr, _) in zip(WALL_L, WALL_R):
        if y > depth: break
        c = (xl + xr) / 2
        tip = clamp((depth - y) / 160)                         # у фронта трещина сходится в линию
        L.append((lerp(c, xl, o * tip), y)); R.append((lerp(c, xr, o * tip), y))
    return L, R
def wall_x(Lw, y):
    ys = [p[1] for p in Lw]; xs = [p[0] for p in Lw]
    return float(np.interp(y, ys, xs))

# ---------------- статичный разрез (2x) ----------------
def build_ground():
    yy = np.linspace(0, 1, SURF * SS)[:, None, None]
    sky = (SKY_A * (1 - yy) + SKY_B * yy) * np.ones((1, W * SS, 1))
    sky = np.concatenate([sky, np.zeros(((HW - SURF) * SS, W * SS, 3))], 0)
    img = Image.fromarray(sky.astype(np.uint8)).convert('RGBA'); pen = Pen(img)
    # слои базальта
    bounds = [SURF + 70] + list(range(SURF + 170, HW + 160, 115))
    prev = [(x, SURF + 70) for x in np.linspace(-20, W + 20, 60)]
    pen.poly([(-20, SURF), (W + 20, SURF), (W + 20, HW + 20), (-20, HW + 20)], ROCK1 + (255,))
    for i, b in enumerate(bounds[1:]):
        cur = [(x, b + 14 * math.sin(x / 210 + i * 1.7) + 8 * math.sin(x / 73 + i)) for x in np.linspace(-20, W + 20, 60)]
        pen.poly(prev + cur[::-1], (ROCK1 if i % 2 else ROCK2) + (255,))
        pen.line(cur, (36, 58, 90, 255), 1.6)
        prev = cur
    rng = np.random.default_rng(5)                             # пузырьки в лаве, вертикальные трещины отдельности
    for _ in range(1300):
        x, y = rng.uniform(0, W), rng.uniform(SURF + 75, HW)
        pen.circ((x, y), rng.uniform(1.2, 3.2), (16, 30, 52, 255))
    for _ in range(200):
        x, y = rng.uniform(0, W), rng.uniform(SURF + 80, HW)
        L = rng.uniform(30, 90); pen.line([(x, y), (x + rng.uniform(-6, 6), y + L)], (31, 52, 82, 255), 1.4)
    # насыпной грунт и асфальт
    pen.poly([(-20, SURF + 14), (W + 20, SURF + 14), (W + 20, SURF + 70), (-20, SURF + 70)], SOIL + (255,))
    for _ in range(700):
        x, y = rng.uniform(0, W), rng.uniform(SURF + 18, SURF + 66)
        pen.circ((x, y), rng.uniform(1.5, 4), (60, 74, 98, 255))
    pen.rect(-20, SURF, W + 20, SURF + 14, ASPH + (255,))
    pen.line([(-20, SURF), (W + 20, SURF)], (150, 162, 180, 255), 2)
    pen.line([(-20, SURF - 2), (W + 20, SURF - 2)], (236, 242, 248, 255), 3)          # тонкий снег
    # дома и фонарь на улице (справа)
    for hx, hw, hh in ((1330, 200, 115), (1580, 160, 95), (1770, 210, 125)):
        x0, y1 = hx, SURF - 2
        pen.poly([(x0, y1), (x0 + hw, y1), (x0 + hw, y1 - hh), (x0 + hw / 2, y1 - hh - 52), (x0, y1 - hh)], (196, 206, 220, 255))
        pen.poly([(x0 - 8, y1 - hh + 4), (x0 + hw / 2, y1 - hh - 54), (x0 + hw + 8, y1 - hh + 4)], (236, 242, 248, 255))
        for wx in range(2):
            pen.rect(x0 + 30 + wx * (hw - 90), y1 - hh + 34, x0 + 60 + wx * (hw - 90), y1 - hh + 70, (72, 88, 116, 255))
    pen.line([(1230, SURF), (1230, SURF - 170), (1265, SURF - 182)], (150, 162, 180, 255), 4)
    return img

GROUND = build_ground()
DEPTH_SHADE = None

# ---------------- экскаватор (вид сбоку, смотрит вправо) ----------------
EX0 = 520                                                      # левый край гусеницы
def excavator(pen, t):
    a = look.ease((t - T_ARM0) / (T_ARM1 - T_ARM0)) - look.ease((t - T_DUMP1 - 0.05) / (0.6 * K))
    bob = 1.2 * math.sin(t * 6.0)                              # работает двигатель
    # гусеница
    pen.rect(EX0, SURF - 36, EX0 + 250, SURF - 2, TRACK + (255,), r=17)
    for i in range(6):
        pen.circ((EX0 + 22 + i * 41, SURF - 19), 11, (110, 120, 136, 255))
        pen.circ((EX0 + 22 + i * 41, SURF - 19), 4, (60, 68, 82, 255))
    # поворотная платформа + кабина
    by = SURF - 36 + bob
    pen.rect(EX0 + 10, by - 70, EX0 + 240, by - 4, BODY + (255,), r=10)
    pen.rect(EX0 + 10, by - 26, EX0 + 240, by - 4, BODY_D + (255,), r=6)
    pen.rect(EX0 + 10, by - 40, EX0 + 240, by - 33, CORAL + (255,))
    pen.rect(EX0 + 150, by - 150, EX0 + 235, by - 66, BODY + (255,), r=10)
    pen.rect(EX0 + 165, by - 138, EX0 + 224, by - 84, (60, 80, 112, 255), r=6)
    pen.rect(EX0 + 30, by - 92, EX0 + 44, by - 66, (90, 100, 116, 255))          # выхлоп
    for j in range(3):                                         # лёгкий дымок
        k = ((t * 0.9 + j / 3) % 1)
        pen.circ((EX0 + 37 + 10 * k, by - 100 - 70 * k), 6 + 12 * k, (200, 210, 224, int(70 * (1 - k))))
    # стрела: плечо 215, рукоять 150
    pv = (EX0 + 205, by - 60)
    a1 = math.radians(lerp(-40, -26, a)); a2 = math.radians(lerp(40, 94, a))
    el = (pv[0] + 215 * math.cos(a1), pv[1] + 215 * math.sin(a1))
    tip = (el[0] + 150 * math.cos(a1 + a2), el[1] + 150 * math.sin(a1 + a2))
    pen.line([pv, el], BODY + (255,), 22); pen.line([el, tip], BODY + (255,), 15)
    pen.line([(pv[0] + 18, pv[1] - 4), (el[0] - 6, el[1] + 14)], (150, 162, 180, 255), 6)     # гидроцилиндр
    pen.circ(pv, 9, (150, 162, 180, 255)); pen.circ(el, 8, (150, 162, 180, 255))
    # ковш: наклоняется при высыпании
    dump = look.ease((t - T_DUMP0) / (0.45 * K)) - look.ease((t - T_DUMP1) / (0.4 * K))
    ang = a1 + a2 + math.radians(lerp(20, -95, dump))
    ca, sa = math.cos(ang), math.sin(ang)
    loc = [(0, -6), (54, -16), (62, 10), (40, 34), (6, 30)]
    pts = [(tip[0] + x * ca - y * sa, tip[1] + x * sa + y * ca) for x, y in loc]
    pen.poly(pts, CORAL + (255,)); pen.circ(tip, 7, (150, 162, 180, 255))
    mouth = ((pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2)
    return mouth, dump

# ---------------- гравий ----------------
NP = 260
def gravel(pen, t, mouth, wl, wr, o_depth):
    """Падающие камешки: рождаются у ковша, летят вниз внутри трещины, тают в глубине."""
    g = 1400.0
    for i in range(NP):
        ts = T_DUMP0 + 0.25 * K + (T_DUMP1 - T_DUMP0 - 0.4 * K) * (i / NP) + 0.02 * rnd(i, 1)
        age = t - ts
        if age < 0: continue
        x0 = mouth[0] + 16 * (rnd(i, 2) - 0.5); y0 = mouth[1]
        y = y0 + 40 * age + 0.5 * g * age * age
        if y > HW: continue
        x = x0 + 18 * (rnd(i, 3) - 0.5) * age * 3
        if y > SURF:                                           # внутри трещины — между стенками
            lo, hi = wall_x(wl, y) + 4, wall_x(wr, y) - 4
            x = clamp(x, lo, hi) if hi > lo else (lo + hi) / 2
        dep = clamp((y - SURF) / (36 * PXM))
        al = int(255 * (1 - dep) ** 1.6)
        if al < 6: continue
        r = 2.2 + 2.6 * rnd(i, 4)
        pen.circ((x, y), r, GRAVEL + (al,))

# корка гравия у верха трещины: растёт, потом уходит вниз кусками
CR_N = 46
def crust(pen, t, wl, wr):
    fill = look.ease((t - T_DUMP0 - 0.5 * K) / (T_DUMP1 - T_DUMP0 - 0.3 * K))
    if fill <= 0: return
    for i in range(CR_N):
        u = rnd(i, 11); v = rnd(i, 12)
        y = CRUST_Y + 26 - 30 * fill * v
        lo, hi = wall_x(wl, y) + 3, wall_x(wr, y) - 3
        x = lerp(lo, hi, u)
        if v > fill + 0.15: continue
        r = 4 + 4 * rnd(i, 13)
        if t > T_COL:                                          # уходит вниз, от середины к краям
            dl = (t - T_COL - 0.18 * abs(u - 0.5) * K)
            if dl > 0:
                y += 30 * dl + 0.5 * 1100 * dl * dl
                lo, hi = wall_x(wl, min(y, HW)) + 3, wall_x(wr, min(y, HW)) - 3
                x = lerp(lo, hi, u)
        dep = clamp((y - SURF) / (36 * PXM))
        al = int(255 * (1 - dep) ** 1.4)
        if al > 5 and y < HW: pen.circ((x, y), r, (170, 178, 192, al), (120, 130, 146, al), 1)

def frame(t):
    world = GROUND.copy(); pen = Pen(world); WH_ = (W, HW)
    o = look.ease_out((t - T_OPEN0) / (T_OPEN1 - T_OPEN0) * 1.3)
    depth = SURF + (HW + 20 - SURF) * look.ease((t - T_OPEN0) / (T_OPEN1 - T_OPEN0))
    breathe = 1 + 0.03 * math.sin(t * 1.4)                     # трещина едва «дышит»
    wl, wr = walls(o * breathe, depth)
    if len(wl) > 1:
        poly = wl + wr[::-1]
        pen.poly(poly, VOID_TOP + (255,))
        # внутри: темнее с глубиной (полосы-градиент), подсветка краёв
        void = layer2x(W, HW); vp = Pen(void)
        for j in range(30):
            y0 = SURF + j * (HW + 20 - SURF) / 30; y1 = y0 + (HW + 20 - SURF) / 30 + 2
            k = min(1, j / 20)
            col = tuple(int(lerp(a, b, k ** 0.7)) for a, b in zip(VOID_TOP, VOID_BOT))
            vp.rect(0, y0, W, y1, col + (255,))
        mask = Image.new('L', world.size, 0); Pen(mask).poly(poly, 255)
        world.paste(void, (0, 0), mask)
        pen.line(wl, (78, 96, 124, 255), 2.2); pen.line(wr, (62, 80, 108, 255), 1.6)
    # тонкая «щель» ниже фронта
    if depth < HW:
        pen.line([(FX + 10 * math.sin(i * 0.37), y) for i, y in enumerate(YS) if depth - 4 < y < depth + 60], (8, 14, 26, 255), 2)
    # падающие камешки по краям при раскрытии
    lay = layer2x(W, HW); lp = Pen(lay)
    if T_OPEN0 < t < T_OPEN1 + 1.0 * K and len(wl) > 2:
        for i in range(30):
            ts = T_OPEN0 + (T_OPEN1 - T_OPEN0) * rnd(i, 21); age = t - ts
            if age < 0: continue
            y = SURF + 10 + 0.5 * 1000 * age * age
            if y > HW: continue
            side = wl if i % 2 else wr
            x = wall_x(side, min(y, depth)) + (6 if i % 2 else -6)
            lp.circ((x, y), 2 + 2 * rnd(i, 22), (150, 160, 178, int(220 * (1 - clamp((y - SURF) / (36 * PXM)))) ))
    mouth, dump = excavator(lp, t)
    if len(wl) > 2:
        crust(lp, t, wl, wr)
        gravel(lp, t, mouth, wl, wr, depth)
    # снег
    for i in range(120):
        sp = 40 + 30 * rnd(i, 41); x = (rnd(i, 42) * W + 25 * math.sin(t * 0.8 + i)) % W
        y = (rnd(i, 43) * (SURF + 40) + sp * t) % (SURF + 40) - 20
        if y < SURF - 4: lp.circ((x, y), 1.4 + 1.6 * rnd(i, 44), (240, 246, 252, int(150 + 90 * rnd(i, 45))))
    world.alpha_composite(lay)

    # камера: лёгкий дрейф; на «провалился» — медленно вниз вдоль линейки
    p = look.ease((t - T_PUSH) / (TOTAL - T_PUSH + 0.4 * K))
    z = 1.02 + 0.005 * math.sin(t * 0.6) + 0.10 * p
    cx, cy = 960 + 6 * math.sin(t * 0.5), 540 + 420 * p
    sh = 3 * math.exp(-max(0, t - T_COL) * 6) * (t > T_COL)
    sx, sy = sh * math.sin(t * 57), sh * math.cos(t * 43)
    img = camera(world, z, cx, cy, sx, sy).convert('RGBA')
    S = lambda q: w2s(q, z, cx, cy, sx, sy, WH_)

    # затемнение глубины на экране (ниже ~30 м — темнота)
    y26 = S((0, SURF + 26 * PXM))[1]
    dk = np.clip((np.arange(H, dtype=float)[:, None] - y26) / (260 * z), 0, 1)
    m = Image.fromarray((dk * np.ones((1, W)) * 200).astype(np.uint8))
    img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), c) for c in (2, 4, 10)] + [m]))

    # линейка глубины
    ra = look.ease((t - T_RUL0) / (T_RUL1 - T_RUL0))
    if ra > 0:
        rx = 1100
        top = S((rx, SURF)); maxd = 45
        cur_d = maxd * ra
        bot = S((rx, SURF + cur_d * PXM))
        d = ImageDraw.Draw(img)
        d.line((top, bot), fill=CORAL + (255,), width=4)
        for mm in range(0, int(cur_d) + 1):
            q = S((rx, SURF + mm * PXM))
            L = 26 if mm % 10 == 0 else 15 if mm % 5 == 0 else 8
            d.line((q, (q[0] + L, q[1])), fill=(255, 255, 255, 230), width=3 if mm % 10 == 0 else 2)
            if mm % 10 == 0 and mm > 0:
                la = clamp((cur_d - mm) / 1.5)
                look.text(img, (q[0] + 40, q[1]), f'{mm} м', 34, 700, look.WHITE, 'lm', alpha=la, shadow=0.9)
        d.ellipse((top[0] - 7, top[1] - 7, top[0] + 7, top[1] + 7), fill=CORAL + (255,), outline=(255, 255, 255), width=3)
        look.text(img, (top[0] + 22, top[1] - 26), '0 м', 30, 700, look.WHITE, 'lm', alpha=ra, shadow=0.9)
        if ra < 1:                                             # бегущая точка на конце линейки
            d.ellipse((bot[0] - 6, bot[1] - 6, bot[0] + 6, bot[1] + 6), fill=(255, 255, 255))

    look.tag(img, 'Гриндавик, январь 2024', t)
    mo = S(mouth)
    pad(img, (mo[0] + 20, mo[1] - 200, mo[0] + 560, mo[1] - 120), fade(t, T_DUMP0 + 0.1 * K, T_COL - 0.25 * K), k=90)
    label(img, (mo[0] + 4, mo[1] + 2), (mo[0] + 90, mo[1] - 160), 'ТРЕЩИНЫ ЗАСЫПАЛИ ГРАВИЕМ',
          fade(t, T_DUMP0 + 0.1 * K, T_COL - 0.25 * K), size=28, ha='l')
    if t > T_COL + 0.35 * K:
        a = fade(t, T_COL + 0.35 * K, d=0.5)
        pad(img, (1230, 470, 1860, 610), a)
        look.text(img, (1260, 520), 'ГЛУБИНА —', 40, 800, look.WHITE, 'lm', alpha=a, track=3, shadow=0.9)
        look.text(img, (1260, 572), 'ДЕСЯТКИ МЕТРОВ', 40, 800, CORAL_L, 'lm', alpha=a, track=3, shadow=0.9)
    return img.convert('RGB')

if __name__ == '__main__':
    run(frame, 'anim_cracks2', TOTAL)
