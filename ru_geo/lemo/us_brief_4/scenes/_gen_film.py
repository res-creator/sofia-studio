#!/usr/bin/env python3
"""«Мысленный эксперимент» · Высота зданий · board film, PART B: film time 85.30–181.86 (the rest of chapter «ТРОС»).
TIME MAPPING: everything below is authored in FILM seconds (narration: ru_geo/building_height/film.json);
at the end every time is shifted by T0 = 85.30, so  local = film − 85.30  (local 0 … 96.56).
The whole wall of the reference part (ru_geo/lemo/bh_brief, film 0–85.3) is kept verbatim with its camera, so at local 0
the board, the ink (pre-drawn, local t < 0) and the camera are exactly the reference's last frame (camera on the long
rope, «рвётся здесь»); scene.clock = T0 keeps the hand-held breath continuous across the cut.
Film 149.04–164.20 is covered by the Archive Light Table clip (Otis 1854): only a slow camera move there.
Ink meanings: graphite = names/rules/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (subtitles): cameras are fitted to the screen band y 50…800.
    python3 scenes/_gen_film.py      → scenes/film.json
"""
T0 = 85.30
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
DUR = 96.56            # local length of this part (film 85.30 → 181.86)
BW, BH = 8200, 4320

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=size, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def circle(c, r, n=40, a0=-90, turn=1.0):
    return [[c[0] + r * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + r * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7): return line([p0, p1], t, d, color, lw, arrow=True)
def hatch(x0, x1, y, t, d, n=8, color='grey'):
    strokes = []
    for i in range(n):
        x = x0 + 30 + (x1 - x0 - 60) * i / max(1, n - 1)
        strokes.append(dict(points=[[x, y], [x + 40, y - 45]], t=round(t + d * i / n, 3), d=round(d / n * 1.2, 3), lw=5))
    ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=5, color=color, alpha=.7)

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
        if d > .6 and (abs(m.get('dx', 0)) * z_of(s) > 500 or abs(m.get('dl', 0)) > .5): ev(t, 'whoosh', d)
        return t + d
    def fit(s, t, d, box, zmax=9, roll=None, a=2, b=2.6):
        x, y, z = fit(box, zmax); return s.to(t, d, x, y, z, roll, a, b)
    def shake(s, t, amp=5, f=9, k=7, dir=(0, 1)):
        s.shakes.append(dict(t=t, amp=amp, f=f, k=k, dir=list(dir)))
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=9):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, t0, t1, t2):
    CARDS.append(dict(str=s, t0=t0, t1=t1, t2=t2))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ХОЛОДНЫЙ СТАРТ', 0.05, 0.75, 0.98)
type_card('ТРОС', 52.6, 53.4, 54.15)
type_card('Почему канат рвётся под собственным весом?', 69.6, 72.9, 73.3)

# ===================================================================== A. cold open 1.0–20.12 (left of the wall)
GY, CX = 2000, 1500                    # ground line and axis of the drawn tower
# the photograph: Burj Khalifa cut out (CC0), standing on the same ground line, left of the drawing
BURJ_H = 1100; bm = meta('burj'); BURJ_W = BURJ_H * bm['size'][0] / bm['size'][1]
BURJ = [210, GY - BURJ_H / 2]
el(type='print', id='burj', src='burj', xy=[BURJ[0], round(BURJ[1], 1)], h=BURJ_H, z=10, rot=-4.5,
   arrive=dict(t=1.0, kind='drop', d=.55, lift=260, spin=1.6, land=.6))
ev(1.33, 'land', .2, size='big')
magnet(232, 1330, 1.45, r=24); magnet(172, 1880, 1.58, r=24)
# the drawn tower: one stepped profile, up one side and down the other
prof = [(220, GY), (208, 1650), (170, 1650), (158, 1350), (120, 1350), (102, 1090), (62, 1090), (42, 860), (26, 860), (0, 700)]
outline = [[CX - w, y] for w, y in prof] + [[CX + w, y] for w, y in reversed(prof[:-1])]
line([[1160, GY], [1860, GY]], 1.05, .25, lw=10)
line(outline, 1.25, 1.25, lw=9)
# «не бетон и не люди»: two tags pinned between the photo and the drawing, struck in red
tag('бетон', 640, 1420, 2.55, size=62, rot=-2, strike=dict(t=3.0, d=.2, color='red')); ev(3.0, 'strike', .2)
tag('люди', 640, 1640, 3.2, size=62, rot=1.5, strike=dict(t=3.9, d=.2, color='red')); ev(3.9, 'strike', .2)
# «Это верёвка, на которой висит лифт» 4.16–6.86: shaft (drafting grey), pulley, cabin, rope
line([[1470, 905], [1470, 1985]], 4.2, .45, 'grey', 5); line([[1530, 905], [1530, 1985]], 4.3, .45, 'grey', 5)
line(circle((1500, 915), 17, 24), 4.75, .2, lw=6)
line([[1474, 1700], [1526, 1700], [1526, 1782], [1474, 1782], [1474, 1700]], 4.95, .25, lw=7)
line([[1500, 932], [1500, 1700]], 5.25, .6, lw=7)
write('верёвка!', 1680, 1212, 5.95, .6, 'red', 84)
arrow([1665, 1190], [1515, 1150], 6.5, .3, 'red', 7)
# «И чем выше башня, тем она тяжелее» 6.86–9.64: the taller tower dashed, its height measured in blue, the rope thick
tall = [[CX - 220, GY], [CX - 170, 1300], [CX - 100, 800], [CX - 40, 450], [CX, 300]]
line(tall, 6.9, .9, 'blue', 7, dash=[26, 22]); line([[2 * CX - x, y] for x, y in tall], 7.0, .9, 'blue', 7, dash=[26, 22])
ink('dim', 6.95, 1.0, 'blue', **{'from': [1165, GY], 'to': [1165, 300]}, lw=9, ea=1.6, eb=2.4)
line([[1500, 330], [1500, 1700]], 8.05, .4, lw=17)
write('выше = тяжелее', 1640, 560, 8.5, 1.0, 'graphite', 110)
# «Тимур, выдуманный лифтёр, едет вверх уже третью минуту» 9.64–14.72
line(circle((1500, 1716), 8, 16), 9.7, .12, lw=4)
line([[1500, 1724], [1500, 1750], [1491, 1772]], 9.82, .15, lw=4); line([[1500, 1750], [1509, 1772]], 9.97, .08, lw=4)
line([[1488, 1736], [1512, 1736]], 10.05, .08, lw=4)
tag('Тимур', 1250, 1742, 10.25, size=40, rot=-2, amp=8)
arrow([1570, 1790], [1570, 1660], 11.8, .4, 'blue', 6)
line(circle((1790, 1650), 38, 40), 12.4, .45, lw=6)
line([[1790, 1650], [1790, 1622]], 12.9, .1, lw=5); line([[1790, 1650], [1812, 1660]], 13.0, .1, lw=5)
write('3 мин', 1845, 1672, 13.2, .5, 'blue', 54)
# «однажды верёвка станет тяжелее всего остального. Что тогда?» 14.72–20.12: the balance
S0 = len(E); SDX = -80       # the balance, laid out at its old x and shifted
SX, SY = 2800, 1600
line([[SX, 1150], [SX, SY]], 14.8, .3, lw=9); line([[SX - 130, SY], [SX + 130, SY]], 15.1, .2, lw=9)
PL, PR = (2520, 1250), (3080, 1110)
line([PL, PR], 15.3, .35, lw=9)
for (px, py), t0 in ((PL, 15.65), (PR, 15.9)):
    line([[px, py], [px - 62, py + 150]], t0, .1, lw=4); line([[px, py], [px + 62, py + 150]], t0 + .08, .1, lw=4)
    line(arc((px, py + 150), 82, 36, 0, 180), t0 + .16, .12, lw=7)
for i in range(4): line(arc((2520, 1392 - i * 13), 54 - i * 9, 15, 180, 540, 30), 16.25 + i * .15, .15, lw=6)
line([[3062, 1225], [3098, 1225], [3098, 1258], [3062, 1258], [3062, 1225]], 16.95, .15, lw=5)
line(circle((3140, 1222), 9, 14), 17.12, .08, lw=4); line([[3140, 1231], [3140, 1258]], 17.22, .08, lw=4)
write('верёвка', 2410, 1505, 17.4, .8, 'graphite', 64)
write('всё остальное', 2930, 1370, 18.25, 1.05, 'graphite', 56)
write('?', 3290, 1330, 19.45, .5, 'red', 250)

def shift(e, dx):
    for k in ('xy', 'from', 'to', 'c'):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y] for x, y in st['points']]
# ===================================================================== B. the plan 30.9–38.9 (behind the map until 30.9)
for e in E[S0:]: shift(e, SDX)
B0 = len(E); BDX = 280
write('Что я покажу', 3750, 760, 30.95, 1.4, 'graphite', 100)
magnet(3800, 935, 32.6, r=28)
line([[3890, 860], [4040, 860]], 32.85, .3, lw=8); hatch(3890, 4040, 860, 33.15, .2, 4)
line([[3965, 865], [3965, 1080]], 33.2, .2, lw=7)
line([[3935, 905], [3952, 920], [3968, 896], [3984, 922], [3998, 904]], 33.4, .2, 'red', 6)
write('где рвётся сталь', 4140, 980, 33.65, 1.6, 'graphite', 74)
write('через 2 минуты', 4140, 1065, 35.35, .65, 'blue', 54)
magnet(3800, 1290, 36.2, r=28)
JW = 300; jm = meta('print_jeddah')
el(type='print', id='jeddah', src='print_jeddah', xy=[3975, 1345], w=JW, z=8, rot=1.5, arrive=dict(t=36.3, kind='drop', d=.45, lift=200, spin=1.2, land=.6))
ev(36.57, 'land', .2, size='mid')
magnet(3870, 1150, 36.7, r=20); magnet(4080, 1150, 36.82, r=20)
write('?', 4150, 1330, 36.95, .25, 'red', 150)
write('главный ответ', 4250, 1290, 37.25, 1.05, 'graphite', 74)
write('в самом конце', 4250, 1375, 38.3, .6, 'blue', 54)

# ===================================================================== C. check 1: the rope 39.43–51.5
for e in E[B0:]: shift(e, BDX)
C0 = len(E); CDX = 600            # zone C sits 300 px further right (laid out at its old x, shifted below)
tag('ПРОВЕРКА 1', 5330, 640, 39.5, size=66, rot=-1.5)
write('верёвка', 5900, 668, 40.1, .85, 'graphite', 96)
OW = 440
el(type='print', id='otis', src='print_otis', xy=[5560, 1085], w=OW, z=8, rot=-2, arrive=dict(t=40.4, kind='drop', d=.45, lift=220, spin=1.4, land=.6))
ev(40.67, 'land', .2, size='mid')
magnet(5385, 895, 40.8, r=20); magnet(5735, 885, 40.92, r=20)
write('лифт, 1854', 5345, 1370, 41.0, .6, 'graphite', 58)
SH0, SH1 = 790, 1520
line([[5930, SH0], [5930, SH1]], 41.05, .4, 'grey', 6); line([[6010, SH0], [6010, SH1]], 41.15, .4, 'grey', 6)
line([[5890, SH0], [6050, SH0]], 41.6, .25, lw=9); hatch(5890, 6050, SH0, 41.75, .15, 4)
CAB = (1115, 1195)
line([[5942, CAB[0]], [5998, CAB[0]], [5998, CAB[1]], [5942, CAB[1]], [5942, CAB[0]]], 41.95, .35, lw=7)
line([[5970, SH0 + 5], [5970, CAB[0]]], 42.35, .45, lw=7)
write('половина пути', 6075, 1215, 42.85, .8, 'blue', 50)
arrow([6068, 1195], [6012, 1170], 43.5, .25, 'blue', 5)
write('вес троса =', 6420, 900, 43.85, 1.1, 'graphite', 72)
write('длина × вес 1 метра', 6420, 1000, 45.0, 1.45, 'graphite', 72)
# the physical answer: a steel ruler laid along the shaft (length is what weighs)
el(type='ruler', id='ruler', **{'from': [5868, SH0 - 10], 'to': [5868, SH1 + 10]}, w=46, z=12, inset=40, magnetR=22,
   arrive=dict(t=46.35, kind='drop', d=.4, lift=160, spin=.6, land=.6))
ev(46.6, 'ruler', .4)
write('длиннее → тяжелее', 6420, 1100, 46.55, 1.5, 'graphite', 72)
HX, HY = 6560, 1450
hand = [arc((HX, HY), 90, 90, 9, 171)]
for a_, b_, c_, d_ in [[-80, -20, -110, -150], [-40, -50, -50, -210], [0, -55, 10, -225], [40, -50, 65, -205], [80, -10, 130, -110]]:
    hand.append([[HX + a_, HY + b_], [HX + c_, HY + d_]])
for i, p in enumerate(hand): line(p, 48.15 + i * .22, .2 if i else .3, lw=7)
write('на пальцах', 6720, 1420, 49.4, 1.0, 'blue', 56)

for e in E[C0:]: shift(e, CDX)

# ===================================================================== E. the rope 54.13–85.3 (lower band of the wall)
Y = 2500
line([[600, Y + 150], [1320, Y + 150]], 54.3, .25, lw=9); hatch(600, 1320, Y + 150, 54.5, .35, 8)
line([[960, Y + 150], [963, Y + 400], [958, Y + 600], [960, Y + 760]], 54.9, .7, lw=9)
tag('стальной канат', 1000, Y + 690, 55.0, size=50, rot=-1.5)
write('прочность стали', 1420, Y + 300, 56.0, 1.3, 'graphite', 72)
ink('count', 57.85, 1.15, 'blue', text='{0}–{1} ГПа', to=[1, 2], xy=[1420, Y + 470], size=140)
write('1 ГПа это:', 2600, Y + 250, 59.35, .9, 'graphite', 72)
line([[2700, Y + 330], [2810, Y + 330], [2810, Y + 440], [2700, Y + 440], [2700, Y + 330]], 60.4, .75, 'blue', 7)
write('1 мм²', 2840, Y + 410, 61.2, .5, 'blue', 60)
line([[2755, Y + 440], [2755, Y + 560]], 61.8, .2, lw=6)
line([[2700, Y + 700], [2722, Y + 560], [2788, Y + 560], [2810, Y + 700], [2700, Y + 700]], 62.0, .7, lw=7)
ink('count', 62.4, 1.5, 'blue', text='{0} кг', to=[100], xy=[2860, Y + 690], size=140)
# the long rope: hung vertically, the lower metres pull on the upper ones
RX = 4800; R0, R1 = Y + 120, Y + 800
line([[4450, R0], [5150, R0]], 64.3, .25, lw=9); hatch(4450, 5150, R0, 64.45, .2, 8)
line([[RX, R0], [RX + 2, R0 + 210], [RX - 2, R0 + 440], [RX, R1]], 64.6, 1.6, lw=9, ea=1.4, eb=1.6)
for i in range(5): arrow([4840, Y + 640 - i * 125], [4840, Y + 700 - i * 125], 66.45 + i * .37, .25, 'blue', 5)
write('нижние метры', 4880, Y + 440, 66.6, 1.0, 'blue', 56)
write('тянут верхние', 4880, Y + 515, 67.6, 1.0, 'blue', 56)
arrow([4740, Y + 740], [4740, Y + 795], 74.2, .3, 'graphite', 5)
write('держит чуть-чуть', 4705, Y + 805, 74.5, 1.4, 'graphite', 54, align='right')
line([[4730, R0 + 20], [4708, R0 + 30], [4708, R1 - 10], [4730, R1]], 76.4, 1.2, 'blue', 6)
write('верх несёт всю длину', 4690, Y + 250, 77.7, 1.9, 'graphite', 56, align='right')
line([[4770, Y + 170], [4788, Y + 186], [4804, Y + 166], [4822, Y + 189], [4838, Y + 171]], 81.6, .5, 'red', 7)
ink('ring', 82.5, .9, 'red', c=[4804, Y + 178], r=[66, 58], lw=7)
write('рвётся здесь', 4890, Y + 200, 83.3, 1.3, 'red', 60)

# ===================================================================== camera (one continuous camera; only the cards hide it)
c = Cam(*fit([-40, 640, 2000, 2060]))
c.fit(1.0, 3.2, [0, 660, 1960, 2040], b=3)                       # the photo lands, the outline draws, tags struck
c.fit(4.15, 1.6, [1150, 860, 2250, 2015])                          # into the shaft: the rope
c.fit(6.85, 1.3, [1000, 250, 2500, 2040], a=1.8, b=3)              # the tower grows, the line rides up
c.fit(9.64, 1.7, [1200, 1585, 2000, 2012], a=2.2, b=3)   # down to the cabin and Timur
c.to(11.4, 3.2, x=1610, z=z_of(c) * 1.04)
c.fit(14.7, 1.6, [2360 + SDX, 1080, 3420 + SDX, 1640], a=2, b=2.8)             # to the balance
c.to(16.4, 3.6, z=1.27, x=2900 + SDX)
c.fit(20.6, 9.4, [3680 + BDX, 660, 4880 + BDX, 1600])                          # (under the map) to the plan
c.to(31.0, 7.8, z=.82)
c.fit(39.43, 1.5, [5250 + CDX, 560, 6450 + CDX, 1570])                         # check 1: tag, photo, shaft
c.fit(43.7, 1.6, [5250 + CDX, 560, 7180 + CDX, 1560], a=2, b=3)                # the arithmetic
c.fit(48.0, 1.5, [6620, 820, 7200 + CDX, 1560], zmax=1.3)               # on the fingers
c.to(49.6, 2.4, z=z_of(c) * 1.03)
c.fit(52.75, 1.2, [560, Y + 60, 1500, Y + 800])                    # (under the card) the rope chapter
c.fit(55.8, 1.5, [560, Y + 60, 2320, Y + 780], a=2, b=3)
c.fit(59.2, 1.3, [2500, Y + 160, 3320, Y + 740], zmax=1.3)
c.fit(63.92, .8, [4400, Y + 40, 5200, Y + 420], zmax=1.5, a=2, b=2.2)           # the second ceiling
c.fit(64.7, 1.7, [4400, Y + 40, 5320, Y + 830], a=1.5, b=2.5)      # ride down the rope as it hangs
c.to(66.6, 3.0, z=z_of(c) * 1.02)
c.fit(73.3, 1.0, [4080, Y + 40, 5160, Y + 840], a=2, b=2.5)
c.to(75.0, 5.0, z=z_of(c) * 1.03)
c.fit(80.2, 2.0, [4140, Y + 50, 5260, Y + 822], a=2, b=3)        # settle on the whole rope, the top in the light: it breaks here
c.to(82.3, 3.0, z=z_of(c) * 1.025, y=c.cur['y'] - 6)
c.shake(81.75, amp=4, f=10, k=8)

# =====================================================================================================================
# PART B (film 85.30–181.86). Free wall: right of the rope (x 5450–8100, y 2420–4250) and the bottom band
# (x 100–5300, y 3420–4250). Reading path: F/G right of the rope → H → I → J leftwards along the bottom.
# ===================================================================== F. 85.68–102.69 «на какой длине канат оборвётся»: 13–26 км
AX0, KM = 5600, 80                     # 0 km at x 5600, 80 board px per km (one scale for both axes)
kx = lambda km: AX0 + KM * km
def km_axis(y, t, labels=True):
    arrow([AX0, y], [kx(28.3), y], t, 1.0, 'blue', 5)
    for i, k in enumerate(range(0, 30, 5)):
        line([[kx(k), y + 5], [kx(k), y + 34]], t + .55 + .07 * i, .08, 'blue', 4)
        if labels: write(str(k) + (' км' if k == 25 else ''), kx(k) - 12, y + 88, t + .6 + .07 * i, .22, 'blue', 42)
def zig(x, y, t, d=.3):   # the break: a small red zigzag across the rope
    return line([[x - 8, y - 45], [x + 9, y - 22], [x - 9, y], [x + 9, y + 22], [x - 7, y + 45]], t, d, 'red', 7)
def wall(x, y0, y1, t):   # an anchor drawn as a wall with hatching on its left
    line([[x, y0], [x, y1]], t, .25, lw=9)
    strokes = [dict(points=[[x, y], [x - 40, y + 38]], t=round(t + .2 + .05 * i, 3), d=.08, lw=5) for i, y in enumerate(range(y0 + 8, y1 - 30, 32))]
    ev(t + .2, 'hatch', .3); el(type='ink', kind='hatch', strokes=strokes, lw=5, color='grey', alpha=.7)

YA, YR = 2840, 2780                    # upper axis, rope on it
write('на какой длине канат оборвётся?', 5560, 2590, 85.9, 2.4, 'graphite', 66)
wall(AX0, 2715, 2850, 88.35)
km_axis(YA, 88.7)
line([[AX0, YR], [kx(13), YR]], 90.3, 2.4, lw=10, ea=1.5, eb=1.8)              # the rope grows along the scale …
zig(kx(13), YR, 92.75)                                                           # … and breaks at 13 km
write('1 ГПа', kx(13), 2968, 92.95, .4, 'blue', 40, align='center')
line([[kx(13) + 30, YR], [kx(26), YR]], 93.15, 1.35, lw=10, dash=[26, 22], ea=1.5, eb=1.8)   # stronger steel: up to 26
zig(kx(26), YR, 94.55)
write('2 ГПа', kx(26), 2968, 94.7, .4, 'blue', 40, align='center')
ink('dim', 93.1, 1.4, 'blue', **{'from': [kx(13), 2712], 'to': [kx(26), 2712]}, lw=6, arrows=False)
ink('count', 93.0, 2.0, 'blue', text='{0}–{1} км', to=[13, 26], xy=[kx(19.5), 2676], size=120, align='center')
tag('расчёт автора', 6950, 3050, 95.8, size=48, rot=-1.5)
write('не учтены: износ, кабина', 6900, 3195, 97.25, 2.6, 'graphite', 56)
write('порядок, а не норма', 6900, 3300, 100.45, 1.5, 'graphite', 64)
line([[6900, 3318], [7140, 3314]], 102.05, .3, 'blue', 6)                       # «порядок» underlined

# ===================================================================== G. 103.24–117.34 запас ×10 → честная длина
tag('запас прочности', 5640, 3060, 105.15, size=50, rot=1)
ink('count', 106.3, 1.4, 'blue', text='×{0}', to=[10], xy=[5650, 3250], size=120)
YB, YBR = 3560, 3500                   # lower axis, rope on it
line([[kx(13), 2995], [kx(9), 3150], [kx(4.5), 3330], [kx(2.1), 3445]], 107.75, .9, 'blue', 7, arrow=True, ea=1.6, eb=2.2)
km_axis(YB, 108.4)
wall(AX0, YB - 125, YB + 10, 108.5)
line([[AX0, YBR], [kx(1.3), YBR]], 109.5, .5, lw=10)
zig(kx(1.3), YBR, 110.05, .25)
line([[kx(1.3) + 22, YBR], [kx(2.6), YBR]], 110.35, .4, lw=10, dash=[16, 14])
zig(kx(2.6), YBR, 110.8, .25)
write('≈ 1,3–2,6 км', 5900, 3530, 110.7, 1.0, 'blue', 90)
write('честная длина', 6480, 3530, 111.5, .9, 'graphite', 60)
tag('тоже расчёт', 5640, 3770, 112.5, size=48, rot=-1)
write('нормы строже', 6050, 3790, 113.6, .9, 'graphite', 64)
write('зависят от конструкции каната', 6050, 3890, 114.65, 2.0, 'graphite', 56)
CS = (7250, 3815)                      # a stranded rope in section: six strands round a core
line(circle(CS, 86, 48), 115.7, .5, lw=6)
line(circle(CS, 24, 20), 116.2, .12, lw=4)
for i in range(6):
    a = math.radians(-90 + 60 * i); line(circle((CS[0] + 52 * math.cos(a), CS[1] + 52 * math.sin(a)), 24, 20), 116.3 + .1 * i, .1, lw=4)

# ===================================================================== H. 118.05–133.28 ≈ 500 м, then lifts in stages
write('+ кабина', 3820, 3560, 118.1, .55, 'graphite', 60)
write('+ качание', 3820, 3650, 118.75, .6, 'graphite', 60)
write('+ износ', 3820, 3740, 119.45, .5, 'graphite', 60)
GH = 4180                              # ground of the shaft drawing
H0 = len(E)
line([[4250, GH], [5150, GH]], 120.2, .3, lw=9)
gst = [dict(points=[[x, GH + 48], [x + 40, GH + 6]], t=round(120.45 + .04 * i, 3), d=.08, lw=5) for i, x in enumerate(range(4270, 5110, 90))]
ev(120.45, 'hatch', .4); el(type='ink', kind='hatch', strokes=gst, lw=5, color='grey', alpha=.7)
line([[4420, GH], [4420, 3700]], 120.9, .5, 'grey', 5); line([[4500, GH], [4500, 3700]], 121.0, .5, 'grey', 5)
line([[4432, 3742], [4488, 3742], [4488, 3818], [4432, 3818], [4432, 3742]], 121.6, .3, lw=6)
line([[4460, 3706], [4460, 3742]], 121.95, .12, lw=5)
tag('один стальной трос', 3840, 3862, 122.4, size=42, rot=-1)
ink('dim', 124.95, .9, 'blue', **{'from': [4360, GH], 'to': [4360, 3822]}, lw=7)
ink('count', 125.1, 1.3, 'blue', text='≈ {0} м', to=[500], xy=[4318, 4045], size=100, align='right')
line([[4326, 3820], [4394, 3820]], 126.05, .2, 'red', 8)                          # the practical limit
line([[4400, 3820], [5070, 3820]], 126.7, .4, lw=8)                              # the big hall, a floor up there
line([[4920, 3820], [4920, 3460]], 127.3, .5, 'grey', 5); line([[5000, 3820], [5000, 3460]], 127.4, .5, 'grey', 5)
line([[4932, 3742], [4988, 3742], [4988, 3818], [4932, 3818], [4932, 3742]], 128.0, .3, lw=6)
write('большой холл', 4528, 3905, 128.85, .8, 'graphite', 46)
arrow([4506, 3790], [4914, 3790], 129.95, .5, 'graphite', 6)                     # вышел …
write('пересел', 4610, 3768, 131.0, .6, 'graphite', 46)                          # … пересел
arrow([4960, 3728], [4960, 3510], 132.0, .5, 'blue', 6)
for e in E[H0:]:
    if e.get('text') != 'один стальной трос': shift(e, 60)

# ===================================================================== I. 133.83–148.48 углеродное волокно: заявка
I0 = len(E)
tag('углеродное волокно', 1760, 3480, 133.9, size=54, rot=-1.5)
write('сталь', 1760, 3640, 135.95, .5, 'graphite', 60)
for i in range(5): magnet(2030 + 70 * i, 3622, 136.45 + .16 * i, r=26)
write('углерод', 1760, 3740, 137.2, .5, 'graphite', 60)
magnet(2030, 3722, 137.75, r=26)
write('в 5 раз легче', 2120, 3742, 137.95, .8, 'blue', 60)
write('до 1 км', 1760, 3890, 138.6, .7, 'blue', 80)
write('без пересадки', 2085, 3890, 139.4, 1.0, 'graphite', 60)
tag('заявка производителя', 1780, 4010, 140.9, size=44, rot=1)
write('испытаний не нашёл', 1760, 4150, 143.15, 1.4, 'graphite', 56)
el(type='stamp', text='ОБЕЩАНИЕ', xy=[2800, 4065], size=72, rot=-7, t=146.0, seed=17); ev(146.0, 'land', .2, size='mid')
for e in E[I0:]: shift(e, 300)

# ===================================================================== (149.04–164.20: the Otis light-table clip covers the board)
# ===================================================================== J. 164.97–179.70 Бурдж-Халифа: 57 лифтов, полкилометра пустоты
GJ = 4180
line([[150, GJ], [1480, GJ]], 164.3, .35, lw=9)
gjs = [dict(points=[[x, GJ + 48], [x + 40, GJ + 6]], t=round(164.55 + .03 * i, 3), d=.08, lw=5) for i, x in enumerate(range(170, 1440, 100))]
ev(164.55, 'hatch', .4); el(type='ink', kind='hatch', strokes=gjs, lw=5, color='grey', alpha=.7)
BH2 = 760; BW2 = BH2 * bm['size'][0] / bm['size'][1]          # 828 м (со шпилем) = 760 board px
el(type='print', id='burj2', src='burj', xy=[360, round(GJ - BH2 / 2, 1)], h=BH2, z=10, rot=-1,
   arrive=dict(t=164.97, kind='drop', d=.55, lift=240, spin=1.4, land=.6))
ev(165.3, 'land', .2, size='big')
magnet(413, 3880, 165.45, r=20); magnet(350, 4110, 165.58, r=20)
tag('Бурдж-Халифа', 640, 3445, 165.1, size=46, rot=-1)
ink('count', 166.0, 1.5, 'blue', text='{0} лифтов', to=[57], xy=[640, 3605], size=110)
line([[940, 3655], [940, 3720]], 167.8, .2, lw=5)                                # a double-deck cabin
line([[900, 3720], [980, 3720], [980, 3880], [900, 3880], [900, 3720]], 168.0, .45, lw=7)
line([[900, 3800], [980, 3800]], 168.45, .15, lw=6)
write('двухэтажная кабина', 1040, 3770, 168.7, 1.3, 'graphite', 46)
arrow([860, 3880], [860, 3722], 170.3, .35, 'blue', 6)
write('до 10 м/с', 1040, 3860, 170.6, .9, 'blue', 76)
MY = 4180 - 500 * BH2 / 828                                    # 500 m up the tower (by the print's own scale)
line([[452, MY - 18], [570, MY - 18]], 172.45, .25, lw=6)                         # Timur at the transfer floor
line(circle((520, MY - 70), 9, 16), 172.7, .12, lw=4)
line([[520, MY - 61], [520, MY - 38], [512, MY - 19]], 172.82, .15, lw=4); line([[520, MY - 38], [528, MY - 19]], 172.97, .08, lw=4)
line([[509, MY - 52], [531, MY - 52]], 173.05, .08, lw=4)
tag('Тимур', 605, MY - 52, 173.2, size=40, rot=-2, amp=8)
ink('dim', 174.7, 1.0, 'blue', **{'from': [580, GJ], 'to': [580, MY]}, lw=7)
write('больше 500 м', 615, 3990, 175.5, .9, 'blue', 64)
write('пустоты', 615, 4075, 176.5, .6, 'graphite', 60)
write('на чём стоит?', 1000, 4110, 177.6, 1.1, 'graphite', 66)
ink('ring', 178.85, .8, 'red', c=[362, GJ + 4], r=[150, 52], lw=7)

# ===================================================================== camera, part B (continues the reference camera)
c.fit(85.5, 1.7, [5420, 2470, 6900, 3010], a=2, b=2.8)            # off the rope to the question
c.fit(90.1, 2.7, [5450, 2470, 6950, 3010], a=1.8, b=2.4)          # ride the rope along the km scale
c.fit(92.95, 1.6, [5450, 2470, 7950, 3010], a=2, b=2.8)           # the whole range 13–26
c.fit(95.55, 1.5, [5450, 2470, 7950, 3350], a=2, b=2.8)           # the notes below
c.to(97.2, 5.6, z=z_of(c) * 1.025)
c.fit(103.05, 1.5, [5450, 2560, 7950, 3660], a=2, b=2.8)          # safety factor ×10
c.fit(108.2, 1.5, [5450, 2930, 7950, 3720], a=2, b=2.8)           # down to the honest length
c.fit(112.25, 1.5, [5450, 2900, 7950, 3990], a=2, b=2.8)          # «тоже расчёт»
c.fit(117.45, 1.8, [3700, 3420, 5240, 4260], a=2, b=2.8)          # left along the bottom: ≈ 500 m, lifts in stages
c.to(119.4, 13.5, z=z_of(c) * 1.03)
c.fit(133.25, 1.7, [2010, 3400, 3360, 4250], a=2, b=2.8)          # carbon fibre
c.to(135.0, 13.5, z=z_of(c) * 1.025)
c.fit(149.4, 14.2, [60, 3380, 1520, 4300], a=2, b=2.2)            # (under the Otis clip) slowly left to the Burj corner
c.to(165.0, 14.2, z=z_of(c) * 1.03, x=c.cur['x'] + 30)
c.fit(179.75, 2.05, [0, 0, 8200, 4320], a=2, b=2.6)               # pull back: the wall as a whole (the chapter is its lower half)

# ===================================================================== local time: shift every time by T0
def shift_t(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('t', 'out') and isinstance(v, (int, float)): o[k] = round(v - T0, 3)
            else: shift_t(v)
    elif isinstance(o, list):
        for v in o: shift_t(v)
shift_t(E); cam = c.json(); shift_t(cam['moves']); shift_t(cam['shakes'])
evs = []
for e in sorted(EV, key=lambda e: e['t']):
    if e['t'] >= T0 - 1e-6: evs.append(dict(e, t=round(e['t'] - T0, 3)))
scene = dict(dur=DUR, clock=T0, board=dict(w=BW, h=BH, seed=27, texScale=.4, ghosts=120, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=19000, min=.8), cam=cam, mbMax=6, elements=E, cards=[], ev=evs, subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=evs), open(os.path.join(FILM, 'events.json'), 'w'), ensure_ascii=False, indent=1)
print('film.json', DUR, 's ·', len(E), 'elements ·', len(evs), 'events ·', len(c.moves), 'camera moves')
