#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размер Вселенной (universe_size) · board film, PART 4: film time 454.73 … 580.58 (125.85 s),
chapters «ЧТО ЗА КРАЕМ» (card 454.73) and «ФИНАЛ» (card 507.54) to the end of the film. Engineering Briefing Board style,
the kit of ru_geo/lemo/bh_brief_B / bh_brief_G.

TIME MAPPING: everything below is authored in FILM seconds (narration: ru_geo/universe_size/film.json); at the end every time
is shifted by OFF = 454.73, so    local = film − 454.73     (local 0 … 125.85).

One wall (8450 × 3700), designed as a poster first; the final pull-back shows it whole:
  top band  (y 230–1760)   «ЧТО ЗА КРАЕМ»
     A  x  230–3450   the visible part as a circle on the map of knowledge: deep-field print inside, Voyager at the edge,
                      «что дальше?», light that has not arrived, the outside (similar to ours = an assumption,
                      unreachable in principle), ≈ 93 млрд св. лет across, stamp «ПОКА НЕ ЗНАЕМ»
     B  x 3500–5400   space almost flat (within fractions of a percent); infinite / huge finite: both agree
     C  x 5500–8250   the horizon at sea: the eye line, a ship before it, a ship beyond it
  bottom band (y 1950–3470) «ФИНАЛ»: the whole ruler, Earth → Voyager (light day, 19 km on the model) → nearest star →
     galaxy disc → Andromeda → the edge of the visible; «привет» there and back; the steps; right block: the closing
     question, the dashed continuation (perhaps infinite), the message card to Voyager.
Ink: graphite = names / rules / facts · blue = measurement and numbers · red = only the decision / the break.
Every framing keeps the bottom 250 px of the screen free (subtitles): boxes are fitted to the screen band y 50…800.
    python3 scenes/_gen_film.py      → scenes/film.json, events.json
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
MET = json.load(open(os.path.join(HERE, 'metrics.json')))
OFF = 454.73                     # film time of local 0
DUR = 125.85                     # film 454.73 → 580.58
BW, BH = 8450, 3700

def tw(text, size, font='marker'):
    m = MET[font]; return sum(m.get(c, 500) for c in text) * size / 1000 + .02 * size * (len(text) - 1)

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t
def ink(kind, t, d, color='graphite', **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d=None, color='graphite', size=72, **k):
    if d is None: d = max(.5, min(1.8, len(text) * .055))
    return ink('write', t, d, color, text=text, xy=[x, y], size=size, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printed(id, src, x, y, t, w=None, h=None, rot=0, z=8, size='mid'):
    k = dict(w=w) if w else dict(h=h)
    el(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6), **k)
    ev(t + .27, 'land', .2, size=size)
def stamp(text, x, y, t, size=110, rot=-5, **k):
    ev(t, 'stamp', .2); return el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), **k)
def circle(c, r, n=40, a0=-90, turn=1.0):
    return [[c[0] + r * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + r * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def tick(x, y, t, s=1.0, color='graphite'):
    return line([[x, y], [x + 40 * s, y + 42 * s], [x + 120 * s, y - 70 * s]], t, .3, color, 10)
def spiral(c, r, t, d=.7, color='graphite', lw=6, dash=None):
    """a small two-armed galaxy sketch"""
    k = dict(dash=dash) if dash else {}
    for arm in (0, 180):
        pts = [[c[0] + r * (.12 + .88 * u) * math.cos(math.radians(arm + 300 * u)), c[1] + .55 * r * (.12 + .88 * u) * math.sin(math.radians(arm + 300 * u))]
               for u in [i / 22 for i in range(23)]]
        line(pts, t + (.0 if arm == 0 else d * .45), d * .55, color, lw, **k)
    line(circle(c, r * .12, 12), t, .1, color, lw)
def wavy(p0, p1, t, d, color='blue', lw=6, amp=14, waves=6, **k):
    n = 60; pts = []
    L = math.hypot(p1[0] - p0[0], p1[1] - p0[1]); ux, uy = (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L
    for i in range(n + 1):
        u = i / n; s = amp * math.sin(u * waves * 2 * math.pi)
        pts.append([p0[0] + (p1[0] - p0[0]) * u - uy * s, p0[1] + (p1[1] - p0[1]) * u + ux * s])
    return line(pts, t, d, color, lw, **k)
def lemniscate(c, a, t, d, color='graphite', lw=8):
    pts = []
    for i in range(61):
        q = 2 * math.pi * i / 60; den = 1 + math.sin(q) ** 2
        pts.append([c[0] + a * math.cos(q) / den, c[1] + a * math.sin(q) * math.cos(q) / den])
    return line(pts, t, d, color, lw)
def ship(x, y, rot, t, d=.7, color='graphite', s=1.0):
    """a small ship sketch standing on (x, y), tilted by rot degrees (the surface normal)"""
    shape = [[[-70, 0], [70, 0], [95, -38], [-95, -38], [-70, 0]], [[0, -38], [0, -150]], [[0, -145], [62, -60], [0, -60]]]
    ca, sa = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    for i, P in enumerate(shape):
        Q = [[x + s * (px * ca - py * sa), y + s * (px * sa + py * ca)] for px, py in P]
        line(Q, t + i * d / 3, d / 3, color, 6)

class Cam:
    """Absolute camera targets turned into the kit's additive eased moves."""
    def __init__(s, x, y, z):
        s.base = dict(x=x, y=y, z=z, roll=0); s.cur = dict(x=x, y=y, lz=math.log(z), roll=0); s.moves = []; s.shakes = []
    def to(s, t, d, x=None, y=None, z=None, roll=None, a=2, b=2.6):
        m = dict(t=round(t, 3), d=round(d, 3), a=a, b=b)
        if x is not None: m['dx'] = round(x - s.cur['x'], 2); s.cur['x'] = x
        if y is not None: m['dy'] = round(y - s.cur['y'], 2); s.cur['y'] = y
        if z is not None: m['dl'] = math.log(z) - s.cur['lz']; s.cur['lz'] = math.log(z)
        if roll is not None: m['dr'] = roll - s.cur['roll']; s.cur['roll'] = roll
        s.moves.append(m)
        if d > .6 and (abs(m.get('dx', 0)) * z_of(s) > 500 or abs(m.get('dy', 0)) * z_of(s) > 400 or abs(m.get('dl', 0)) > .5): ev(t, 'whoosh', d)
        return t + d
    def fit(s, t, d, box, zmax=1.0, roll=None, a=2, b=2.6, sx=90):
        x, y, z = fit(box, zmax, sx); return s.to(t, d, x, y, z, roll, a, b)
    def shake(s, t, amp=5, f=9, k=7, dir=(0, 1)):
        s.shakes.append(dict(t=t, amp=amp, f=f, k=k, dir=list(dir)))
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
SAFE_Y0, SAFE_Y1 = 50, 800      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=1.0, sx=90):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * sx) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z

# ===================================================================== chapter cards on black (film time)
CARDS = []
def type_card(s, t0, t1, t2):
    CARDS.append(dict(str=s, t0=t0, t1=t1, t2=t2))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ЧТО ЗА КРАЕМ', 454.78, 455.53, 455.73)
type_card('ФИНАЛ', 507.59, 508.34, 508.54)

# ===================================================================== A. the visible part  (V1 455.73–472.67)
C, R = (1450, 1000), 600                         # the edge of the visible, drawn as a circle on the map
line(circle(C, R, 72), 455.8, 1.2, lw=10, ea=1.6, eb=2.2)
printed('hudf', 'print_hudf', 1450, 760, 456.15, w=440, rot=-1.5)          # what we see: a deep field full of galaxies
magnet(1265, 560, 456.5, r=20); magnet(1640, 565, 456.62, r=20)
VA = math.radians(-35); VX, VY = C[0] + R * math.cos(VA), C[1] + R * math.sin(VA)
printed('voyager', 'print_voyager', round(VX + 40, 1), round(VY - 30, 1), 456.95, w=340, rot=3, z=10)  # Voyager reached the edge
magnet(VX - 80, VY - 150, 457.3, r=20); magnet(VX + 160, VY - 135, 457.42, r=20)
write('край видимого', C[0], 360, 457.5, .9, size=76, align='center')
write('что дальше?', 2240, 470, 458.6, .8, size=96)
for i, y in enumerate((700, 800, 900)):                                    # light from beyond: it has not arrived
    wavy([3380, y], [2330, y + 25], 459.5 + .2 * i, .9, 'blue', 6, dash=[24, 16])
    line([[2300, y - 5], [2300, y + 55]], 460.35 + .2 * i, .1, 'grey', 6)
write('свет оттуда не дошёл', 2200, 1080, 460.3, 1.1, size=68)
write('проверить не можем', 2200, 1175, 461.6, 1.0, size=68)

# ===================================================================== B. space almost flat; infinite or huge finite
B0x = 3550
sheet = [[3700, 560], [5150, 560], [5340, 860], [3510, 860], [3700, 560]]
line(sheet, 463.3, .9, lw=8)
for i in range(1, 6):
    u = i / 6; line([[3700 + (5150 - 3700) * u, 560], [3510 + (5340 - 3510) * u, 860]], 463.9 + .06 * i, .25, 'grey', 4)
for j in range(1, 3):
    v = j / 3; line([[3700 + (3510 - 3700) * v, 560 + 300 * v], [5150 + (5340 - 5150) * v, 560 + 300 * v]], 464.25 + .08 * j, .3, 'grey', 4)
write('пространство почти плоское', 3510, 470, 464.3, 1.5, size=84)
write('в пределах долей процента', 3510, 990, 466.4, 1.5, 'blue', 72)
# the two answers that both agree with it
arrow([4000, 1250], [3540, 1250], 468.4, .4, 'graphite', 8); arrow([3990, 1250], [4440, 1250], 468.45, .4, 'graphite', 8)
lemniscate((3990, 1160), 110, 468.9, .6)
tag('бесконечная', 3600, 1420, 469.2, size=54, rot=-1.5)
line(arc((4850, 3000), 1600, 1600, -100, -80, 30), 470.0, .8, lw=8)            # a huge sphere: a gentle arc
line(arc((4850, 3000), 1600, 1600, -80, -72, 12), 470.7, .3, lw=8, dash=[22, 18])
tag('огромная конечная', 4630, 1580, 470.9, size=54, rot=1)
tick(4110, 1400, 471.9); tick(5240, 1565, 472.15)
write('обе согласуются', 3510, 1700, 472.0, .7, size=72)

# ===================================================================== C. the horizon at sea  (V2 473.39–480.06)
write('граница видимого ≈ горизонт в море', 5560, 470, 473.5, 1.8, size=82)
SC, SR = (6750, 4300), 3100
def surf(x): return SC[1] - math.sqrt(SR ** 2 - (x - SC[0]) ** 2)
line(arc(SC, SR, SR, -90 - math.degrees(math.asin(1200 / SR)), -90 + math.degrees(math.asin(1420 / SR)), 60), 474.0, 1.3, 'blue', 9)
wst = [dict(points=[[x, surf(x) + 40], [x + 30, surf(x + 30) + 30], [x + 60, surf(x + 60) + 40]], t=round(474.6 + .05 * i, 3), d=.12, lw=4)
       for i, x in enumerate(range(5700, 8050, 190))]
ev(474.6, 'hatch', .6); el(type='ink', kind='hatch', strokes=wst, lw=4, color='blue', alpha=.6)
OX = 5650; OY = surf(OX)                                                    # the observer on the shore
line(circle((OX, OY - 135), 14, 18), 475.0, .15, lw=5)
line([[OX, OY - 120], [OX, OY - 60], [OX - 18, OY]], 475.1, .2, lw=5); line([[OX, OY - 60], [OX + 18, OY]], 475.25, .1, lw=5)
line([[OX - 22, OY - 95], [OX + 22, OY - 95]], 475.3, .1, lw=5)
EYE = (OX + 12, OY - 138)
d_ = math.hypot(EYE[0] - SC[0], EYE[1] - SC[1]); ang = math.atan2(EYE[1] - SC[1], EYE[0] - SC[0]) + math.acos(SR / d_)
TP = (SC[0] + SR * math.cos(ang), SC[1] + SR * math.sin(ang))
sl = (TP[1] - EYE[1]) / (TP[0] - EYE[0]); XE = 8200
line([EYE, [XE, EYE[1] + sl * (XE - EYE[0])]], 475.5, 1.1, 'blue', 6, dash=[26, 18])
line([[TP[0], TP[1] - 30], [TP[0], TP[1] + 30]], 476.3, .12, 'blue', 6)
write('горизонт', TP[0], TP[1] + 120, 476.35, .7, 'blue', 62, align='center')
ship(6230, surf(6230) - 6, math.degrees(math.asin((6230 - SC[0]) / SR)), 476.7, .6)      # a ship before the horizon
ship(7800, surf(7800) - 6, math.degrees(math.asin((7800 - SC[0]) / SR)), 477.2, .8)      # a ship beyond it: still there
write('корабли не исчезают', 6550, 780, 477.3, 1.1, size=70)
write('мы их просто не видим', 6550, 880, 478.6, 1.2, size=70)
arrow([7830, 905], [7820, 1150], 479.6, .3, 'graphite', 6)
print('sight line at 7800:', round(EYE[1] + sl * (7800 - EYE[0])), ' ship top ≈', round(surf(7800) - 156))

# ===================================================================== A again: beyond the edge  (480.06–492.67)
spiral((520, 560), 95, 480.6, .7, dash=[18, 12])
write('за краем', 270, 880, 481.0, .6, size=68)
write('похожее на наше', 270, 970, 482.9, 1.0, size=68)
spiral((640, 1420), 80, 483.4, .6, dash=[18, 12])
tag('допущение', 300, 1100, 484.85, size=50, rot=-1.5)
write('проверить нечем', 270, 1270, 485.9, .9, size=64)
spiral((3130, 1330), 85, 487.5, .6, dash=[18, 12])                          # a region beyond, unreachable in principle
line([[3030, 1240], [3230, 1420]], 490.4, .2, 'red', 8); line([[3230, 1240], [3030, 1420]], 490.6, .2, 'red', 8)
write('по стандартной модели:', 2200, 1310, 488.0, 1.2, size=60)
write('часть недостижима', 2200, 1400, 490.0, .9, size=60)
write('и в принципе', 2200, 1490, 491.4, .7, size=60)

# ===================================================================== V3 493.11–505.39: ≈ 93 млрд св. лет; the whole: unknown
ink('dim', 493.3, 1.3, 'blue', **{'from': [C[0] - R, 1000], 'to': [C[0] + R, 1000]}, lw=8)
ink('count', 495.3, 2.0, 'blue', text='≈ {0} млрд св. лет', to=[93], xy=[C[0], 1150], size=84, align='center')
write('видимая часть', C[0], 1260, 494.2, .8, size=64, align='center')
tag('вся Вселенная', 2230, 1620, 498.7, size=50, rot=-1)
write('размер неизвестен', 2760, 1650, 499.6, 1.1, size=64)
stamp('ПОКА НЕ ЗНАЕМ', 560, 1640, 503.7, size=64, rot=-5, seed=23)

# ===================================================================== F. the final ruler  (bottom band)
AY = 2900                                                                  # the ruler's axis
MK = dict(earth=450, voy=1150, star=2450, disc=3800, andr=4850, edge=6150)
NS, VS = 84, 84                                                            # name / value lettering on the ruler
def mtick(x, t, color='graphite'): return line([[x, AY - 32], [x, AY + 32]], t, .12, color, 8)
# V4 508.54–524.06: back to Voyager, then the ruler grows mark by mark
EM = meta('earth')
el(type='print', id='earth', src='earth', xy=[MK['earth'], AY], h=230, z=10, rot=0,
   arrive=dict(t=508.65, kind='drop', d=.5, lift=240, spin=.6, land=.6)); ev(508.92, 'land', .2, size='mid')
write('Земля', MK['earth'], 2755, 509.0, .5, size=NS, align='center')
printed('voyager2', 'print_voyager', MK['voy'], 2575, 509.2, w=400, rot=-2)
magnet(MK['voy'] - 150, 2425, 509.55, r=20); magnet(MK['voy'] + 150, 2420, 509.67, r=20)
line([[MK['earth'] + 120, AY], [MK['voy'], AY]], 509.8, .6, lw=10)
mtick(MK['voy'], 510.35)
write('Вояджер', MK['voy'], 2850, 510.0, .6, size=NS, align='center')
write('сутки света', MK['voy'], 3010, 510.5, .9, 'blue', VS, align='center')
ink('count', 511.5, 1.6, 'blue', text='{0} км на нашей модели', to=[19], xy=[1420, 2610], size=62)
line([[MK['voy'], AY], [MK['star'], AY]], 514.4, .8, lw=10); mtick(MK['star'], 515.15)
SX_, SY_ = MK['star'], 2600                                                # the nearest star, drawn
line(circle((SX_, SY_), 42, 24), 515.2, .25, lw=7)
for i in range(8):
    a = math.radians(22.5 + 45 * i); r0, r1 = 62, 62 + (34 if i % 2 else 58)
    line([[SX_ + r0 * math.cos(a), SY_ + r0 * math.sin(a)], [SX_ + r1 * math.cos(a), SY_ + r1 * math.sin(a)]], 515.45 + .04 * i, .06, lw=6)
write('ближайшая звезда', MK['star'], 2850, 515.4, 1.1, size=NS, align='center')
line([[MK['star'], AY], [MK['disc'], AY]], 516.9, .7, lw=10); mtick(MK['disc'], 517.55)
DX_, DY_ = MK['disc'], 2600                                                # the galaxy disc, drawn edge-on-ish
line(arc((DX_, DY_), 270, 75, 0, 360, 60), 517.2, .6, lw=7)
line(arc((DX_, DY_), 75, 40, 0, 360, 30), 517.7, .2, lw=7)
line(arc((DX_ - 20, DY_ + 5), 190, 48, 200, 330, 20), 517.85, .15, 'grey', 5); line(arc((DX_ + 20, DY_ - 5), 190, 48, 20, 150, 20), 517.95, .15, 'grey', 5)
write('диск галактики', MK['disc'], 2850, 517.6, .9, size=NS, align='center')
line([[MK['disc'], AY], [MK['andr'], AY]], 518.0, .55, lw=10); mtick(MK['andr'], 518.5)
printed('andromeda', 'print_andromeda', MK['andr'], 2585, 518.1, w=330, rot=2)
magnet(MK['andr'] - 120, 2450, 518.45, r=18); magnet(MK['andr'] + 125, 2455, 518.55, r=18)
write('Андромеда', MK['andr'], 2850, 518.55, .6, size=NS, align='center')
line([[MK['andr'], AY], [MK['edge'], AY]], 519.0, .65, lw=10); mtick(MK['edge'], 519.6)
printed('jwst', 'print_jwst', MK['edge'], 2585, 519.2, w=320, rot=-1.5)
magnet(MK['edge'] - 120, 2450, 519.55, r=18); magnet(MK['edge'] + 120, 2445, 519.65, r=18)
write('граница видимого', MK['edge'], 2850, 519.7, 1.0, size=NS, align='center')
write('на каждой отметке', 4950, 3260, 520.4, 1.0, size=72)
write('рекорд всё меньше', 4950, 3360, 521.7, 1.0, size=72)
# V5 524.61–536.6: «привет» there and back
printed('dsn', 'print_dsn', 430, 2370, 524.75, w=330, rot=-2)
magnet(310, 2230, 525.1, r=18); magnet(555, 2225, 525.2, r=18)
line(arc((800, 2470), 300, 230, 200, 335, 30), 527.0, 1.4, 'blue', 7, arrow=True, ea=1.4, eb=1.8)     # out: about a day
write('«привет»', 560, 2180, 525.5, .8, size=60)
write('сегодня → у зонда ≈ через сутки', 1420, 2185, 527.3, 2.4, 'blue', 62)
line(arc((800, 2470), 230, 140, -20, -160, 30), 531.2, 1.2, 'blue', 7, dash=[22, 16], arrow=True, ea=1.4, eb=1.8)
write('ответ: ещё ≈ сутки', 1420, 2285, 531.4, 1.4, 'blue', 62)
write('для Вселенной: мгновение', 1420, 2390, 534.7, 1.4, size=62)
# V6 537.15–552.41: the ruler assembled, step by step
STEPS = [('earth', 'voy', 538.95), ('voy', 'star', 540.0), ('star', 'disc', 541.1), ('disc', 'andr', 542.3), ('andr', 'edge', 543.5)]
for a_, b_, t_ in STEPS:
    xa, xb = MK[a_] + (120 if a_ == 'earth' else 0), MK[b_]
    line(arc(((xa + xb) / 2, 3075), (xb - xa) / 2, 55, 180, 0, 30), t_, .5, 'blue', 6)
write('чуть больше 4 св. лет', MK['star'], 3010, 540.1, 1.0, 'blue', VS, align='center')
write('> 100 000 св. лет', MK['disc'], 3010, 541.2, .9, 'blue', VS, align='center')
write('≈ 2,5 млн св. лет', MK['andr'] + 60, 3010, 542.4, .9, 'blue', VS, align='center')
ink('count', 543.55, 1.3, 'blue', text='≈ {0} млрд св. лет', to=[93], xy=[MK['edge'] + 20, 3010], size=VS, align='center')
write('каждая ступень в десятки', 2400, 3260, 544.9, 1.4, size=72)
write('или десятки тысяч раз длиннее', 2400, 3360, 546.6, 1.6, size=72)
ink('ring', 549.6, .8, 'red', c=[(MK['earth'] + 120 + MK['voy']) / 2, 3100], r=[400, 70], lw=7)
write('нашему зонду — самая первая', 330, 3260, 550.0, 1.4, size=72)

# ===================================================================== V7 553.11–569.17: so how big is the Universe?
RX = 6600
write('Так какого размера Вселенная?', RX, 2130, 553.2, 1.6, size=84)
write('видимая часть: ≈ 93 млрд св. лет', RX, 2245, 555.0, 1.8, 'blue', 70)
ink('ring', 556.6, .6, 'blue', c=[MK['edge'] + 20, 2985], r=[370, 75], lw=6)
line([[MK['edge'] + 30, AY], [6900, AY]], 558.3, .7, lw=10, dash=[30, 22])
lemniscate((7080, AY - 5), 110, 558.9, .7)
write('?', 7260, AY + 35, 559.5, .3, size=110)
write('целая: возможно, бесконечна', RX, 2355, 558.5, 1.5, size=70)
write('и мы не знаем', RX, 2460, 560.4, .8, size=70)
line([[MK['earth'] + 120, AY], [MK['edge'], AY]], 561.4, 2.0, 'blue', 15, alpha=.55)   # the part that has a size
write('размер — только у видимой части', RX, 2565, 562.0, 1.6, size=64)
ink('ring', 565.3, .7, 'graphite', c=[MK['voy'], 2575], r=[240, 200], lw=6)
write('наш рекорд крошечный,', 330, 3360, 565.8, 1.0, size=72)
write('но он единственный', 330, 3460, 567.0, 1.0, size=72)

# ===================================================================== V8 569.73–579.08: the question to you
tag('вопрос вам', RX + 20, 2720, 569.8, size=52, rot=-1.5)
CW, CH = 1240, 470; CXc, CYc = 7600, 3220
el(type='card', id='msg', xy=[CXc, CYc], w=CW, h=CH, rot=1.2, z=8,
   arrive=dict(t=570.6, kind='drop', d=.45, lift=200, spin=1.0, land=.6),
   lines=[dict(text='Вояджеру-1: одно сообщение', font='sans', size=64, weight=700, x=60, y=-125, color='graphite'),
          dict(rule=True, x=60, y=-30, w=CW - 120, h=4, color='grey'),
          dict(rule=True, x=60, y=60, w=CW - 120, h=4, color='grey'),
          dict(text='ответ — через двое суток', font='sans', size=56, weight=600, x=60, y=180, color='blue')],
   magnets=[[-CW / 2 + 40, -CH / 2 + 40], [CW / 2 - 40, -CH / 2 + 40]], magnetR=22)
ev(570.87, 'land', .2, size='mid'); ev(570.93, 'clack', .1)
tag('напишите в комментариях', 7450, 2720, 577.2, size=50, rot=1)

# ===================================================================== camera (film time; the cards hide the cuts)
c = Cam(*fit([700, 280, 2350, 1700]))
c.to(455.8, 2.4, z=z_of(c) * 1.04)                                         # the edge draws, the prints land
c.fit(458.3, 1.5, [1000, 300, 3420, 1300], a=2, b=2.8)                     # «что дальше?», light from beyond
c.to(459.9, 3.2, z=z_of(c) * 1.03)
c.fit(463.0, 1.6, [3430, 380, 5420, 1060], a=2, b=2.8)                     # B: space almost flat
c.fit(468.1, 1.3, [3430, 380, 5420, 1760], a=2, b=2.8)                     # both answers
c.to(469.5, 3.5, z=z_of(c) * 1.03)
c.fit(473.2, 1.6, [5500, 340, 7300, 1520], a=2, b=2.8)                     # C: the horizon at sea
c.fit(476.4, 1.6, [5500, 340, 8250, 1600], a=2, b=2.8)                     # … the ship beyond it
c.to(478.1, 1.8, z=z_of(c) * 1.02)
c.fit(480.0, 1.8, [220, 380, 1750, 1720], a=2, b=2.8)                      # back to the edge: beyond it
c.to(481.9, 5.0, z=z_of(c) * 1.03)
c.fit(487.4, 1.4, [1900, 1150, 3450, 1760], a=2, b=2.8)                    # unreachable in principle
c.fit(493.0, 1.4, [760, 320, 2300, 1700], a=2, b=2.8)                      # ≈ 93 млрд св. лет across
c.fit(498.5, 1.3, [1200, 800, 3450, 1760], a=2, b=2.8)                     # the whole: unknown
c.fit(500.9, 2.3, [220, 260, 3450, 1760], a=2, b=2.8)                      # the map: «пока не знаем»
c.fit(505.45, 1.9, [200, 220, 8250, 1780], a=2, b=2.8, sx=50)              # the chapter's part of the wall
c.fit(507.75, .6, [240, 2140, 2350, 3110])                                 # (under the card) the final band
c.to(508.6, 2.8, z=z_of(c) * 1.03)
c.fit(511.4, 1.4, [240, 2140, 2350, 3110], a=2, b=2.8)
c.fit(514.3, 1.5, [900, 2160, 3400, 3110], a=1.8, b=2.6)                   # ride the ruler: the star
c.fit(516.8, 1.3, [2150, 2160, 5250, 3110], a=1.8, b=2.6)                  # the galaxy, Andromeda
c.fit(518.4, 1.3, [3500, 2160, 6550, 3110], a=1.8, b=2.6)                  # the edge of the visible
c.fit(520.1, 3.0, [240, 2160, 6550, 3420], a=2, b=2.8)                     # every mark makes the record smaller
c.fit(524.5, 1.5, [230, 2100, 2300, 2800], a=2, b=2.8)                     # «привет»
c.to(526.0, 9.0, z=z_of(c) * 1.03)
c.fit(536.9, 1.5, [240, 2340, 6550, 3170], a=2, b=2.8)                     # the ruler assembled
c.fit(544.6, 1.4, [240, 2340, 4800, 3420], a=2, b=2.8)                     # each step; our probe gets the first
c.to(546.0, 6.5, z=z_of(c) * 1.02)
c.fit(552.9, 1.5, [5750, 2040, 8250, 3020], a=2, b=2.8)                    # so how big is it?
c.fit(561.2, 1.6, [230, 2040, 8250, 3470], a=2, b=2.8, sx=50)              # only the visible part has a size
c.fit(565.2, 1.4, [230, 2160, 2600, 3500], a=2, b=2.8)                     # our record: tiny, the only one
c.fit(569.5, 1.6, [6500, 2040, 8250, 3480], a=2, b=2.8)                    # the question to you
c.to(571.2, 3.6, z=z_of(c) * 1.02)
c.fit(575.0, 3.6, [200, 220, 8250, 3500], a=2, b=3.2, sx=40)               # the whole wall, once: one briefing
c.to(578.7, 1.9, z=z_of(c) * 1.008)

# ===================================================================== local time: shift every time by OFF
def shift_t(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('t', 'out', 't0', 't1', 't2') and isinstance(v, (int, float)): o[k] = round(v - OFF, 3)
            else: shift_t(v)
    elif isinstance(o, list):
        for v in o: shift_t(v)
shift_t(E); shift_t(CARDS); cam = c.json(); shift_t(cam['moves']); shift_t(cam['shakes'])
evs = sorted([dict(e, t=round(e['t'] - OFF, 3)) for e in EV], key=lambda e: e['t'])
scene = dict(dur=DUR, clock=OFF, board=dict(w=BW, h=BH, seed=53, texScale=.4, ghosts=150, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=21000, min=.8), cam=cam, mbMax=6, elements=E, cards=CARDS, ev=evs, subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=evs), open(os.path.join(FILM, 'events.json'), 'w'), ensure_ascii=False)
print('film.json', DUR, 's ·', len(E), 'elements ·', len(evs), 'events ·', len(c.moves), 'camera moves')
for s, z in [('граница видимого ≈ горизонт в море', 82), ('пространство почти плоское', 84), ('в пределах долей процента', 72),
             ('свет оттуда не дошёл', 68), ('похожее на наше', 68), ('по стандартной модели:', 60), ('размер неизвестен', 64),
             ('сегодня → у зонда ≈ через сутки', 62), ('для Вселенной: мгновение', 62), ('19 км на нашей модели', 62),
             ('ближайшая звезда', 84), ('граница видимого', 84), ('чуть больше 4 св. лет', 84), ('> 100 000 св. лет', 84),
             ('≈ 2,5 млн св. лет', 84), ('≈ 93 млрд св. лет', 84), ('каждая ступень в десятки', 72), ('или десятки тысяч раз длиннее', 72),
             ('нашему зонду — самая первая', 72), ('Так какого размера Вселенная?', 84), ('видимая часть: ≈ 93 млрд св. лет', 70),
             ('целая: возможно, бесконечна', 70), ('размер — только у видимой части', 64), ('корабли не исчезают', 70), ('мы их просто не видим', 70)]:
    print(f'  {s!r:40} {tw(s, z):6.0f}')
