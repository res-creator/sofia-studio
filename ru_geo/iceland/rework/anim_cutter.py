# Анимация «тросорез» (тресковые войны, 1970-е), вид сверху на море.
#   Фаза 1 (0.31): британский траулер идёт вверх и тянет трал на двух тросах; сторожевой корабль входит слева
#                  и проходит за кормой траулера, волоча за собой трос с тросорезом.
#   Фаза 2 (0.345): тросорез цепляет тросы траулера — вспышка, тросы лопаются и сворачиваются.
#   Фаза 3 (0.345): освобождённый трал с уловом отстаёт и уходит на дно (уменьшается, темнеет, пузыри),
#                  траулер уходит без него.
# Запуск (из ru_geo/iceland):  python3 rework/anim_cutter.py [секунды=9.0]  ->  cache/anim_cutter.mp4
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                                   # ru_geo/iceland
sys.path.insert(0, os.path.join(ROOT, '..', 'lib'))
import look

W, H, FPS, SS = 1920, 1080, 30, 2                              # SS — суперсэмплинг векторного слоя
TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 9.0
N = int(round(TOTAL * FPS))
T1, T2 = 0.31 * TOTAL, 0.655 * TOTAL                           # границы фаз
OUT = os.path.join(ROOT, 'cache', 'anim_cutter.mp4')

SEA_A, SEA_B = np.array((16, 45, 85), float), np.array((9, 27, 55), float)
SEA_MID = (13, 37, 70)
HULL_W, DECK_W, SUPER_W = (226, 231, 236), (198, 206, 214), (250, 251, 252)
STEEL = (120, 132, 146)
CORAL = look.ACCENT
CORAL_D, CORAL_L = (214, 82, 54), (255, 170, 148)
WIRE = (205, 214, 224)

def clamp(v, a=0.0, b=1.0): return max(a, min(b, v))
def lerp(a, b, k): return a + (b - a) * k
def rnd(i, salt=0):                                            # детерминированный «случайный» 0..1
    x = math.sin(i * 127.1 + salt * 311.7) * 43758.5453
    return x - math.floor(x)

def pchip(xs, ys):
    """Монотонная кубическая интерполяция (плавная скорость без «перелётов»)."""
    xs, ys = np.array(xs, float), np.array(ys, float)
    h = np.diff(xs); dl = np.diff(ys) / h
    m = np.zeros_like(ys); m[0], m[-1] = dl[0], dl[-1]
    for k in range(1, len(xs) - 1):
        if dl[k - 1] * dl[k] > 0:
            w1, w2 = 2 * h[k] + h[k - 1], h[k] + 2 * h[k - 1]
            m[k] = (w1 + w2) / (w1 / dl[k - 1] + w2 / dl[k])
    def f(x):
        x = clamp(x, xs[0], xs[-1]); k = min(len(xs) - 2, int(np.searchsorted(xs, x, 'right') - 1))
        s = (x - xs[k]) / h[k]
        h00, h10, h01, h11 = 2*s**3 - 3*s**2 + 1, s**3 - 2*s**2 + s, -2*s**3 + 3*s**2, s**3 - s**2
        return h00 * ys[k] + h10 * h[k] * m[k] + h01 * ys[k + 1] + h11 * h[k] * m[k + 1]
    return f

# ---------------- движение ----------------
TX = 1010                                                      # курс траулера (x)
def trawler_base(t):                                           # центр траулера, нос вверх
    return TX + 4 * math.sin(t * 0.7), 320 - 11 * t
STERN_OFF = 100                                                # корма = центр + 100 по y
WARP_DX = (-13, 13)                                            # крепление тросов на корме
NET_GAP, NET_HW = 300, 96                                      # расстояние корма→устье трала, полуширина устья

PY = 560                                                       # курс сторожевика (y)
_px = pchip(np.array([0, 0.31, 0.44, 0.53, 0.655, 1.0]) * TOTAL,
            [-100, 1010, 1500, 1640, 1900, 2950])
def patrol(t): return _px(t), PY + 6 * math.sin(t * 0.9)
CABLE_L, CABLE_ANG = 375, math.radians(8)                      # трос тросореза тянется назад-вниз
def cutter_pos(t):
    x, y = patrol(t); sx = x - 135
    return sx - CABLE_L * math.cos(CABLE_ANG), y + CABLE_L * math.sin(CABLE_ANG) + 4 * math.sin(t * 2.1)

def net_tied(t):                                               # устье трала, пока тросы целы
    x, y = trawler_base(t); return x + 6 * math.sin(t * 1.1 + 0.6), y + STERN_OFF + NET_GAP

def warp_x_at(t, i, y):                                        # x троса i (прямая корма→угол устья) на высоте y
    x, sy = trawler_base(t); a = (x + WARP_DX[i], sy + STERN_OFF)
    m = net_tied(t); b = (m[0] + (NET_HW if i else -NET_HW), m[1])
    k = (y - a[1]) / (b[1] - a[1]); return lerp(a[0], b[0], k)

# моменты перерезания: тросорез протащил трос на 24 px дальше его прямой линии
TCUT = []
for i in (0, 1):
    t = 0.0
    while t < TOTAL:
        cx, cy = cutter_pos(t)
        if cx + 14 - warp_x_at(t, i, cy) >= 24: break
        t += 1 / 600
    TCUT.append(t)
TC2 = max(TCUT)
T3 = max(T2, TC2 + 0.3)                                        # начало погружения

# после обрыва траулер «освобождается» и ускоряется
_fine = np.arange(0, TOTAL + 0.01, 1 / 300)
_acc = np.cumsum([22 * look.ease((s - TC2) / 1.4) for s in _fine]) / 300
def trawler(t):
    x, y = trawler_base(t); return x, y - float(np.interp(t, _fine, _acc))

def net_state(t):
    """Центр устья, масштаб, угол, погружение 0..1."""
    rot = math.radians(2.2 * math.sin(t * 1.05))
    if t <= TC2: return net_tied(t), 1.0, rot, 0.0
    m0 = net_tied(TC2); k = look.ease_out((t - TC2) / 3.0)
    m = (m0[0] - 8 * k, m0[1] + 30 * k)                       # трал отстаёт и сносится назад
    sink = look.ease((t - T3) / max(0.5, TOTAL - T3))
    return m, 1.0 - 0.45 * sink, rot * (1 - 0.6 * sink), sink

def to_world(m, s, rot, p):
    c, sn = math.cos(rot), math.sin(rot)
    return m[0] + s * (p[0] * c - p[1] * sn), m[1] + s * (p[0] * sn + p[1] * c)
def to_local(m, s, rot, p):
    c, sn = math.cos(rot), math.sin(rot); dx, dy = (p[0] - m[0]) / s, (p[1] - m[1]) / s
    return dx * c + dy * sn, -dx * sn + dy * c

# точки разреза (на тросе, в мировых координатах, в момент TCUT)
CUTP = []
for i in (0, 1):
    cx, cy = cutter_pos(TCUT[i]); CUTP.append((cx + 14, cy))

# ---------------- фон: море ----------------
def make_sea():
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    r = np.sqrt(((xx - W * 0.52) / W) ** 2 + ((yy - H * 0.42) / H) ** 2 * 1.4)
    k = np.clip(r / 0.75, 0, 1)[..., None] ** 1.3
    base = SEA_A * (1 - k) + SEA_B * k
    return base

def make_ripples(seed, n, alpha):
    """Текстура коротких дуг-ряби (тайлится по вертикали), рисуется в 2x и сжимается."""
    rng = np.random.default_rng(seed); hh = H + 400
    img = Image.new('L', (W * 2, hh * 2), 0); d = ImageDraw.Draw(img)
    for _ in range(n):
        x, y = rng.uniform(0, W * 2), rng.uniform(0, hh * 2)
        L = rng.uniform(26, 90); bend = rng.uniform(4, 10)
        pts = [(x + L * (u - 0.5), y - bend * (1 - (2 * u - 1) ** 2)) for u in np.linspace(0, 1, 9)]
        d.line(pts, fill=int(alpha * rng.uniform(0.5, 1.0)), width=3)
    return np.asarray(img.resize((W, hh), Image.BOX), float) / 255.0

# ---------------- рисование в 2x ----------------
class Pen:
    def __init__(self, img): self.d = ImageDraw.Draw(img)
    @staticmethod
    def P(p): return (p[0] * SS, p[1] * SS)
    def poly(self, pts, fill, outline=None, w=0):
        self.d.polygon([self.P(p) for p in pts], fill=fill, outline=outline, width=int(w * SS) if w else 0)
    def line(self, pts, fill, w):
        self.d.line([self.P(p) for p in pts], fill=fill, width=max(1, int(round(w * SS))), joint='curve')
    def circ(self, c, r, fill=None, outline=None, w=1):
        self.d.ellipse((SS * (c[0] - r), SS * (c[1] - r), SS * (c[0] + r), SS * (c[1] + r)),
                       fill=fill, outline=outline, width=max(1, int(round(w * SS))))

def ship_pts(c, fwd, pts):                                     # локальные (вдоль носа, вправо) -> мир
    fx, fy = fwd; rx, ry = -fy, fx
    return [(c[0] + a * fx + b * rx, c[1] + a * fy + b * ry) for a, b in pts]

def hull_shape(L, B, bow0, sharp=0.6, transom=0.88):
    half = L / 2; pts = [(-half, -B / 2 * transom)]
    for a in np.linspace(-half + 6, bow0, 4): pts.append((a, -B / 2))
    for u in np.linspace(0, 1, 14)[1:]:
        a = lerp(bow0, half, u); pts.append((a, -B / 2 * (1 - u * u) ** sharp))
    right = [(a, -b) for a, b in reversed(pts)]
    return pts + right[1:]

def rect(a0, a1, b0, b1): return [(a0, b0), (a1, b0), (a1, b1), (a0, b1)]

def draw_trawler(pen, c, fwd, a=255):
    L, B = 200, 54
    pen.poly(ship_pts(c, fwd, hull_shape(L, B, 35, 0.55)), HULL_W + (a,))
    pen.poly(ship_pts(c, fwd, [(x * 0.9, y * 0.8) for x, y in hull_shape(L, B, 35, 0.55)]), DECK_W + (a,))
    pen.poly(ship_pts(c, fwd, rect(-100, -66, -10, 10)), STEEL + (a,))           # кормовой слип
    pen.poly(ship_pts(c, fwd, rect(-82, -76, -25, 25)), (92, 102, 114, a))       # П-рама
    for b in (-12, 12): pen.circ(ship_pts(c, fwd, [(-48, b)])[0], 7, (150, 160, 172, a))   # лебёдки
    pen.poly(ship_pts(c, fwd, rect(-18, 8, -16, 16)), (214, 220, 226, a))
    pen.circ(ship_pts(c, fwd, [(-6, 0)])[0], 6.5, (70, 78, 90, a))               # труба
    pen.poly(ship_pts(c, fwd, rect(14, 58, -19, 19)), SUPER_W + (a,))           # надстройка
    pen.poly(ship_pts(c, fwd, rect(50, 55, -15, 15)), (60, 72, 88, a))           # окна мостика
    pen.poly(ship_pts(c, fwd, rect(78, 86, -2, 2)), (170, 178, 188, a))

def draw_patrol(pen, c, fwd, a=255):
    L, B = 270, 66
    pen.poly(ship_pts(c, fwd, hull_shape(L, B, 55, 0.62)), CORAL + (a,))
    pen.poly(ship_pts(c, fwd, [(x * 0.92, y * 0.8) for x, y in hull_shape(L, B, 55, 0.62)]), CORAL_D + (a,))
    pen.poly(ship_pts(c, fwd, rect(-128, -58, -25, 25)), (236, 120, 92, a))      # вертолётная площадка
    pen.circ(ship_pts(c, fwd, [(-93, 0)])[0], 17, None, (255, 255, 255, a), 2.2)
    pen.poly(ship_pts(c, fwd, rect(-48, 52, -22, 22)), CORAL_L + (a,))           # надстройка
    pen.poly(ship_pts(c, fwd, rect(14, 48, -17, 17)), (255, 214, 202, a))
    pen.poly(ship_pts(c, fwd, rect(44, 49, -14, 14)), (90, 40, 30, a))           # окна мостика
    pen.circ(ship_pts(c, fwd, [(-12, 0)])[0], 6, (255, 240, 234, a))             # мачта
    g = ship_pts(c, fwd, [(84, 0)])[0]; pen.circ(g, 8, (180, 66, 44, a))          # носовое орудие
    pen.line(ship_pts(c, fwd, [(84, 0), (106, 0)]), (180, 66, 44, a), 3)

def draw_wake(pen, pos_fn, t, back, length, spread, n=34, life=1.8, strength=1.0):
    """Кильватер: пена, рождённая в прошлых положениях кормы (кадр не зависит от предыдущих)."""
    for j in range(n):
        te_i = math.floor(t / (life / n)) - j
        te = te_i * life / n
        if te < -2: continue
        age = t - te; k = age / life
        if k >= 1 or k < 0: continue
        sx, sy = pos_fn(te); bx, by = back
        for side in (-1, 1):
            off = side * (6 + spread * k) * (0.7 + 0.6 * rnd(te_i, side))
            px = sx + bx * length * 0.05 * k + (-by) * off
            py = sy + by * length * 0.05 * k + bx * off
            r = 2.0 + 5 * k * rnd(te_i, 3 + side)
            al = int(110 * strength * (1 - k) ** 1.6)
            pen.circ((px, py), r, (235, 242, 250, al))
    # турбулентный след сразу за кормой
    sx, sy = pos_fn(t)
    for j in range(6):
        k = j / 6; r = 6 + 10 * k
        pen.circ((sx + back[0] * 14 * j * strength, sy + back[1] * 14 * j * strength), r, (230, 238, 248, int(55 * strength * (1 - k))))

def curl_line(a, b, s, t, seed, amp=16, waves=2.2):
    """Отрезок a→b, у свободного конца b — завиток с амплитудой s."""
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) + 1e-6
    nx, ny = -dy / L, dx / L; pts = []
    for u in np.linspace(0, 1, 28):
        w = amp * s * u ** 1.6 * math.sin(u * waves * math.pi + t * 3.0 + seed)
        hook = 10 * s * u ** 4                                  # конец закручивается
        pts.append((a[0] + dx * u + nx * (w + hook), a[1] + dy * u + ny * (w + hook) - hook * 0.4))
    return pts

# ---------------- трал (локальные координаты: устье y=0, мешок вниз) ----------------
NET_LEN = 255
def net_w(y):
    if y <= 165: return lerp(NET_HW, 27, look.ease(y / 165) ** 0.9)
    u = (y - 165) / (NET_LEN - 165)
    return (27 + 9 * math.sin(math.pi * min(1, u * 1.15))) * math.sqrt(max(0.0, 1 - max(0.0, (u - 0.7) / 0.3) ** 2))

def draw_net(pen, m, s, rot, t, alpha=1.0, sink=0.0):
    A = lambda v: int(v * alpha)
    W_ = lambda p: to_world(m, s, rot, p)
    ys = np.linspace(0, NET_LEN, 40)
    sway = lambda y: 7 * math.sin(t * 1.6 - y / 70) * (y / NET_LEN)      # хвост мешка «плывёт»
    left = [W_((-net_w(y) + sway(y), y)) for y in ys]; right = [W_((net_w(y) + sway(y), y)) for y in ys]
    body = left + right[::-1]
    pen.poly(body, (180, 200, 220, A(40 + 70 * sink)))                  # при погружении мешок читается пятном
    for f in np.linspace(-1, 1, 9)[1:-1]:                                 # продольные нити
        pen.line([W_((f * net_w(y) + sway(y), y)) for y in ys], (220, 232, 244, A(95)), 1.1)
    for y0 in np.arange(18, NET_LEN - 8, 19):                             # поперечные нити
        w0 = net_w(y0)
        pen.line([W_((u * w0 + sway(y0), y0 + 5 * (1 - u * u))) for u in np.linspace(-1, 1, 12)], (220, 232, 244, A(95)), 1.1)
    pen.line(left, (235, 242, 250, A(220)), 1.8); pen.line(right, (235, 242, 250, A(220)), 1.8)
    # рыба в мешке
    for j in range(13):
        yy = 175 + 62 * rnd(j, 1); ww = net_w(yy) * 0.7
        xx = ww * (2 * rnd(j, 2) - 1) + sway(yy) + 2.5 * math.sin(t * 3 + j)
        ang = rot + math.radians(70 + 40 * rnd(j, 4) + 12 * math.sin(t * 2.4 + j * 1.7))
        c = W_((xx, yy)); L, B = 9 * s, 3.4 * s
        fx, fy = math.cos(ang), math.sin(ang)
        pen.poly([(c[0] + fx * L, c[1] + fy * L), (c[0] - fy * B, c[1] + fx * B), (c[0] - fx * L, c[1] - fy * L), (c[0] + fy * B, c[1] - fx * B)],
                 (196, 212, 228, A(235)))
    # верхняя подбора с поплавками
    head = [W_((x, 3 * math.sin(x / 30 + t))) for x in np.linspace(-NET_HW, NET_HW, 20)]
    pen.line(head, (245, 248, 252, A(255)), 2.6)
    for x in np.linspace(-NET_HW + 8, NET_HW - 8, 9):
        pen.circ(W_((x, 3 * math.sin(x / 30 + t))), 4.2 * s, (250, 222, 120, A(255)))

# ---------------- подписи ----------------
def label(img, anchor_pt, text_pt, s, a, size=27, ha='l', dot=True):
    """Подпись карты: коралловая точка у объекта, тонкая выноска, белый текст заглавными с разрядкой."""
    if a <= 0.01: return
    d = ImageDraw.Draw(img)
    if dot:
        r = 6; x, y = anchor_pt
        d.ellipse((x - r - 2.5, y - r - 2.5, x + r + 2.5, y + r + 2.5), fill=(255, 255, 255, int(255 * a)))
        d.ellipse((x - r, y - r, x + r, y + r), fill=CORAL + (int(255 * a),))
        k = look.ease_out(a)
        ex = lerp(anchor_pt[0], text_pt[0], k); ey = lerp(anchor_pt[1], text_pt[1], k)
        d.line((anchor_pt, (ex, ey)), fill=(255, 255, 255, int(200 * a)), width=2)
    dx = (1 - look.ease_out(a)) * (14 if ha == 'l' else -14)
    tx = text_pt[0] + (10 if ha == 'l' else -10) + dx
    look.text(img, (tx, text_pt[1]), s, size, 700, look.WHITE, ('l' if ha == 'l' else 'r') + 'm', alpha=a, track=4, shadow=0.9)

def fade(t, t0, t1=None, d=0.4):
    a = look.ease((t - t0) / d)
    if t1 is not None: a *= 1 - look.ease((t - t1) / d)
    return a

# ---------------- кадр ----------------
SEA = make_sea()
RIP1, RIP2 = make_ripples(1, 1500, 255), make_ripples(2, 900, 255)
VIGN = None

def background(t):
    off1 = int(t * 9) % 400; off2 = int(t * 16 + 200) % 400
    r1 = RIP1[400 - off1:400 - off1 + H]; r2 = RIP2[400 - off2:400 - off2 + H]
    sh = 0.5 + 0.5 * math.sin(t * 1.3)
    a = (r1 * (0.045 + 0.03 * sh) + r2 * (0.05 + 0.03 * (1 - sh)))[..., None]
    img = SEA * (1 - a) + np.array((150, 190, 225)) * a
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

def down(layer): return layer.reduce(SS)                       # 2x -> 1x усреднением (сглаживание)

def shadow_of(layer1x, r=9, off=(9, 13), a=0.55):
    al = layer1x.split()[3].filter(ImageFilter.GaussianBlur(r)).point(lambda v: int(v * a))
    sh = Image.new('RGBA', (W, H), (2, 8, 20, 0)); sh.putalpha(Image.new('L', (W, H), 0))
    big = Image.new('L', (W, H), 0); big.paste(al, off)
    return Image.merge('RGBA', [Image.new('L', (W, H), 2), Image.new('L', (W, H), 8), Image.new('L', (W, H), 20), big])

def spark(img, p, k, seed):
    """Вспышка в точке разреза: мягкое свечение, лучи, коралловое кольцо. k = 0..1 за 0,5 с."""
    if k <= 0 or k >= 1: return
    glow = Image.new('L', (W, H), 0); d = ImageDraw.Draw(glow)
    r = 26 + 40 * k; a = (1 - k) ** 2.5
    d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=int(255 * a))
    glow = glow.filter(ImageFilter.GaussianBlur(22))
    arr = np.asarray(img, float); g = np.asarray(glow, float)[..., None] / 255
    arr[..., :3] = arr[..., :3] + (255 - arr[..., :3]) * g * np.array((1.0, 0.85, 0.6))
    img.paste(Image.fromarray(arr.astype(np.uint8)))
    lay = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); pen = Pen(lay)
    for j in range(11):
        ang = 2 * math.pi * (j / 11 + 0.3 * rnd(j, seed)); L0 = 6 + 30 * look.ease_out(k); L1 = L0 + 16 + 22 * rnd(j, seed + 1) * (1 - k)
        pen.line([(p[0] + math.cos(ang) * L0, p[1] + math.sin(ang) * L0), (p[0] + math.cos(ang) * L1, p[1] + math.sin(ang) * L1)],
                 (255, 244, 214, int(255 * (1 - k))), 2.4)
    rr = 10 + 46 * look.ease_out(k)
    pen.circ(p, rr, None, CORAL + (int(230 * (1 - k)),), 3)
    pen.circ(p, 9 * (1 - k) + 2, (255, 255, 255, int(255 * (1 - k))))
    img.alpha_composite(down(lay))

def bubbles(pen, m, s, t, sink):
    if t < T3 - 0.2: return
    for j in range(46):
        t0 = T3 - 0.2 + (TOTAL - T3) * rnd(j, 7) * 0.95; life = 0.7 + 0.6 * rnd(j, 8)
        k = (t - t0) / life
        if not 0 <= k < 1: continue
        lx = (2 * rnd(j, 9) - 1) * 70; ly = 40 + 200 * rnd(j, 10) ** 1.3
        c = to_world(m, s, 0, (lx, ly)); c = (c[0] + 6 * k * math.sin(j), c[1] - 14 * k)
        r = 2.5 + (5 + 7 * rnd(j, 11)) * look.ease_out(k)
        a = math.sin(math.pi * k) ** 0.8
        pen.circ(c, r, (220, 236, 250, int(40 * a)), (235, 244, 252, int(210 * a)), 1.6)
        pen.circ((c[0] - r * 0.35, c[1] - r * 0.35), max(0.8, r * 0.22), (255, 255, 255, int(220 * a)))

def frame(t):
    img = background(t)
    lines = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); pen = Pen(lines)
    tr = trawler(t); stern = (tr[0], tr[1] + STERN_OFF)
    pt = patrol(t); pstern = (pt[0] - 135, pt[1])
    m, s, rot, sink = net_state(t)

    # кильватер
    draw_wake(pen, lambda q: (trawler(q)[0], trawler(q)[1] + STERN_OFF), t, (0, 1), 160, 16 + 10 * clamp((t - TC2) / 2), n=26, strength=0.75)
    if pt[0] > -400 and pt[0] < W + 500:
        draw_wake(pen, lambda q: (patrol(q)[0] - 135, patrol(q)[1]), t, (-1, 0), 320, 46, n=34, strength=1.0)

    # тросы траулера
    for i in (0, 1):
        A = (stern[0] + WARP_DX[i], stern[1])
        if t < TCUT[i]:
            B = to_world(m, s, rot, ((NET_HW if i else -NET_HW), 0))
            cx, cy = cutter_pos(t); wx = warp_x_at(t, i, cy)
            tip = cx + 14
            if tip > wx and wx - 60 < cx:                          # тросорез тащит трос — излом
                pen.line([A, (tip, cy), B], WIRE + (255,), 2.0)
            else:
                pen.line([A, B], WIRE + (255,), 2.0)
        else:
            k = look.ease_out((t - TCUT[i]) / 0.7)
            haul = 0.35 * look.ease((t - TCUT[i] - 0.9) / 2.5)       # обрывок выбирают лебёдкой
            P = CUTP[i]; v0 = (P[0] - (trawler(TCUT[i])[0] + WARP_DX[i]), P[1] - (trawler(TCUT[i])[1] + STERN_OFF))
            free = (A[0] + v0[0] * (1 - 0.42 * k - haul) + (8 if i else -8) * k, A[1] + v0[1] * (1 - 0.42 * k - haul))
            pen.line(curl_line(A, free, k, t, i * 2.0), WIRE + (255,), 2.0)

    # трос сторожевика и тросорез
    cxy = cutter_pos(t)
    if cxy[0] > -60 and pt[0] < W + 700:
        mid = ((pstern[0] + cxy[0]) / 2, (pstern[1] + cxy[1]) / 2 + 22)
        cab = [((1 - u) ** 2 * pstern[0] + 2 * u * (1 - u) * mid[0] + u * u * cxy[0],
                (1 - u) ** 2 * pstern[1] + 2 * u * (1 - u) * mid[1] + u * u * cxy[1]) for u in np.linspace(0, 1, 30)]
        pen.line(cab, CORAL_L + (255,), 2.4)
        cx, cy = cxy                                               # тросорез: корпус + два загнутых ножа вперёд
        pen.circ((cx - 3, cy), 7, (70, 80, 94, 255), (245, 248, 252, 255), 2)
        for sgn in (-1, 1):
            pen.line([(cx + 2, cy + sgn * 3), (cx + 13, cy + sgn * 10), (cx + 19, cy + sgn * 6), (cx + 16, cy + sgn * 1.5)], (245, 248, 252, 255), 3.0)

    # трал (свой слой: темнеет, тает, размывается при погружении)
    netl = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); npen = Pen(netl)
    for i in (0, 1):                                               # нижние обрывки тросов висят на трале
        if t >= TCUT[i]:
            k = look.ease_out((t - TCUT[i]) / 0.7)
            Bl = ((NET_HW if i else -NET_HW), 0)
            m0, s0, r0, _ = net_state(TCUT[i]); Pl = to_local(m0, s0, r0, CUTP[i])
            fl = (lerp(Pl[0], Bl[0], 0.45 * k) + (14 if i else -14) * k, lerp(Pl[1], Bl[1], 0.45 * k))
            pts = curl_line(Bl, fl, k, t, 1.3 + i, amp=14)
            npen.line([to_world(m, s, rot, q) for q in pts], WIRE + (255,), 2.0 / max(s, 0.6))
    draw_net(npen, m, s, rot, t, sink=sink)
    net1 = down(netl)
    if sink > 0:
        a = np.asarray(net1, float)
        a[..., :3] = a[..., :3] * (1 - 0.45 * sink) + np.array(SEA_MID) * 0.45 * sink
        a[..., 3] *= (1 - 0.55 * sink)
        net1 = Image.fromarray(a.astype(np.uint8))
        if sink > 0.05: net1 = net1.filter(ImageFilter.GaussianBlur(2.0 * sink))
    if sink > 0:                                                   # тёмное «пятно глубины» под тралом
        dk = Image.new('L', (W, H), 0); dd = ImageDraw.Draw(dk)
        cc = to_world(m, s, rot, (0, 130))
        dd.ellipse((cc[0] - 150 * s, cc[1] - 170 * s, cc[0] + 150 * s, cc[1] + 170 * s), fill=int(70 * math.sin(math.pi * min(1, sink * 1.2)) ** 0.7))
        dk = dk.filter(ImageFilter.GaussianBlur(40))
        img.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), 3), Image.new('L', (W, H), 10), Image.new('L', (W, H), 24), dk]))
    img.alpha_composite(net1)

    img.alpha_composite(down(lines))
    if t >= T3 - 0.2:
        bub = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); bubbles(Pen(bub), m, s, t, sink)
        img.alpha_composite(down(bub))

    # корабли + тени
    ships = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); spen = Pen(ships)
    hd = math.radians(0.8 * math.sin(t * 0.8))
    draw_trawler(spen, tr, (math.sin(hd), -math.cos(hd)))
    if -300 < pt[0] < W + 300:
        ph = math.radians(1.2 * math.sin(t * 0.9 + 1))
        draw_patrol(spen, pt, (math.cos(ph), math.sin(ph)))
    ships1 = down(ships)
    img.alpha_composite(shadow_of(ships1))
    img.alpha_composite(ships1)

    for i in (0, 1):
        spark(img, CUTP[i], (t - TCUT[i]) / 0.5, 20 + i)

    # подписи
    label(img, (tr[0] + 26, tr[1] - 10), (tr[0] + 120, tr[1] - 60), 'ТРАУЛЕР', fade(t, 0.35))
    mw = to_world(m, s, rot, (NET_HW - 6, 60))
    label(img, mw, (mw[0] + 110, mw[1] + 10), 'ТРАЛ', fade(t, 0.9, T3 - 0.1))
    label(img, (pt[0] - 20, pt[1] - 20), (pt[0] - 20, pt[1] - 92), 'СТОРОЖЕВОЙ КОРАБЛЬ', fade(t, 0.75, T1 - 0.3), ha='r')
    label(img, (cxy[0] - 4, cxy[1] - 6), (cxy[0] - 110, cxy[1] - 70), 'ТРОСОРЕЗ', fade(t, T1 + 0.2, TC2 + 0.7), ha='r')
    if t > T3:
        mc = to_world(m, s, rot, (net_w(140) + 4, 140))
        label(img, mc, (mc[0] + 110, mc[1] + 30), 'СЕТЬ С УЛОВОМ УХОДИТ НА ДНО', fade(t, T3 + 0.25), size=31)
    return img.convert('RGB')

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    if len(sys.argv) > 3:                                          # отладка: anim_cutter.py 9 t1,t2,... out_dir -> PNG
        for tt in sys.argv[2].split(','):
            frame(float(tt)).save(os.path.join(sys.argv[3], f'cutter_t{tt}.png'))
        return
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-frames:v', str(N), '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-an',
                          '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
    for i in range(N):
        p.stdin.write(frame(i / FPS).tobytes())
        if i % 30 == 0: print(f'{i}/{N}', flush=True)
    p.stdin.close(); p.wait()
    print('cuts at', [round(x, 2) for x in TCUT], 'phase3', round(T3, 2), '->', OUT, N, 'frames')

if __name__ == '__main__':
    main()
