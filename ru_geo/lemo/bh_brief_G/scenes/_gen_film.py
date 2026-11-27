#!/usr/bin/env python3
"""«Мысленный эксперимент» · Высота зданий · board film, part G: the last chapter «ПРЕДЕЛ» to the end of the film,
in the Engineering Briefing Board style (the same kit as ru_geo/lemo/bh_brief).

TIME: this clip covers FILM time 481.72 … 613.54 s (131.82 s). The renderer works in LOCAL time:
    local = film − 481.72          (narration times from ru_geo/building_height/film.json, shifted by −481.72)

One wall, read left to right, designed as a poster first (the final pull-back shows it whole):
  A  x  250–2600   the space elevator: Earth, the cable to ≈ 35 800 км, satellite, cabin, Tsiolkovsky print,
                   «башня до неба», Artsutanov's «трос сверху», counterweight, space debris
  B  x 2650–4950   (top)    steel 13–26 км vs ≈ 35 800 км on one scale → «НЕ ГОДЯТСЯ»
  C  x 2650–4950   (bottom) carbon nanotubes: strong in the lab, only short pieces → waits for a material
  D  x 5050–7000   (top)    the three barriers (ВЕС / ВЕТЕР / ТРОС), the answer stamp «ПРЕДЕЛ — ТРОС»
  E  x 5050–7000   (bottom) the record: Burj Khalifa cut-out, 828 м (со шпилем), the 1 км line, «дальше решит материал»
  F  x 7050–8420   Timur's tower (he reaches the top), what he knows now, the closing question
Ink: graphite = names / rules / facts · blue = measurements and numbers · red = only the decision / the break.
Every camera framing keeps the bottom 250 px of the screen free (subtitles are burned in later): boxes are fitted
to the screen band y 50…800.
    python3 scenes/_gen_film.py      → scenes/film.json, events.json
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
MET = json.load(open(os.path.join(HERE, 'metrics.json')))
OFF = 481.72                     # film time of local 0
DUR = 131.82
BW, BH = 9600, 3950
GX, GY0 = 300, 150                # the whole layout below is shifted by (GX, GY0) on the board at the end
BX = 300                         # zones B–F sit a further 300 px right of the elevator (a clear gap)

def tw(text, size, font='marker'):
    """width of marker lettering in board px (same layout as board.js writeLayout: track .02 em)"""
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
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def tick(x, y, t, s=1.0, color='graphite'):
    return line([[x, y], [x + 40 * s, y + 42 * s], [x + 120 * s, y - 70 * s]], t, .3, color, 11)
def stamp(text, x, y, t, size=110, rot=-5, **k):
    ev(t, 'stamp', .2); return el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), **k)

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
    def fit(s, t, d, box, zmax=1.0, roll=None, a=2, b=2.6):
        x, y, z = fit(box, zmax); return s.to(t, d, x, y, z, roll, a, b)
    def shake(s, t, amp=5, f=9, k=7, dir=(0, 1)):
        s.shakes.append(dict(t=t, amp=amp, f=f, k=k, dir=list(dir)))
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=1.0):
    x0, y0, x1, y1 = box
    if x0 >= 2600: x0 += BX; x1 += BX
    x0 += GX; x1 += GX; y0 += GY0; y1 += GY0
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z

# ===================================================================== the chapter card on black
CARDS = []
def type_card(s, t0, t1, t2):
    CARDS.append(dict(str=s, t0=t0, t1=t1, t2=t2))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ПРЕДЕЛ', 0.05, 0.80, 1.0)          # film 481.77 … 482.72

# ===================================================================== A. the space elevator  (V30 local 1.00–19.63)
EC, ER = (1300, 5300), 2000                   # Earth: centre far below the board, its top (the equator) at y 3300
CBX, CB0, GEO = 1300, 3300, 820               # the cable: x, foot, geostationary height on the board
line(arc(EC, ER, ER, -112, -68, 40), 1.05, .8, lw=10)
hatch(800, 1800, 3420, 1.5, .4, 7)
write('Земля', 560, 3440, 1.6, .6, size=80)
tag('экватор', 1420, 3395, 2.0, size=46, rot=-1)
line([[CBX, CB0], [CBX, GEO]], 1.6, 2.3, lw=9, ea=1.5, eb=2.4)                    # «трос от экватора …»
ink('dim', 3.95, 1.8, 'blue', **{'from': [1560, GEO], 'to': [1560, CB0]}, lw=8, ea=1.6, eb=2.4)   # «… до высоты …»
ink('count', 4.5, 1.6, 'blue', text='≈ {0} {1} км', to=[35, 800], xy=[1640, 2150], size=130)
# the orbit (drafting grey, dashed) and the satellite that «висит над одной точкой»
line(arc(EC, 4480, 4480, -101, -79, 30), 6.55, .8, 'grey', 5, dash=[22, 18])
SX, SY = 1768, 845
line(rect(SX - 22, SY - 18, SX + 22, SY + 18), 7.15, .25, lw=6)
line(rect(SX - 78, SY - 9, SX - 30, SY + 9), 7.4, .2, lw=5); line(rect(SX + 30, SY - 9, SX + 78, SY + 9), 7.55, .2, lw=5)
write('висит над', 1880, 975, 7.6, .6, size=62)
write('одной точкой', 1880, 1050, 8.2, .7, size=62)
# «Кабина ползёт по тросу в космос»: a white magnet rides up the cable
CAB = el(type='magnet', id='cab', xy=[CBX, 3200], r=30, color='white', z=20, arrive=dict(t=9.45, kind='snap', d=.3, lift=70),
         moves=[dict(t=9.8, d=2.0, dy=-1640, a=1.8, b=2.4)])
ev(9.51, 'clack', .1); ev(9.8, 'slide', 2.0)
arrow([1380, 3050], [1380, 2450], 10.0, 1.0, 'blue', 6)
# Tsiolkovsky (pinned print) and his «башня до неба» (dashed, the idea); Artsutanov: hang the cable from above
TS = meta('print_tsiolkovsky'); TW = 460
el(type='print', id='tsiol', src='print_tsiolkovsky', xy=[620, 2290], w=TW, z=8, rot=-1.5,
   arrive=dict(t=11.95, kind='drop', d=.45, lift=220, spin=1.3, land=.6))
ev(12.22, 'land', .2, size='mid')
magnet(500, 2030, 12.35, r=20); magnet(745, 2025, 12.47, r=20)
write('К. Циолковский', 380, 2680, 12.6, .9, size=66)
write('идея: конец XIX века', 380, 2780, 13.5, 1.0, size=58)
def earth_y(x): return EC[1] - math.sqrt(ER ** 2 - (x - EC[0]) ** 2)
line([[880, earth_y(880)], [1005, 1160], [1130, earth_y(1130)]], 14.0, 1.7, lw=7, dash=[26, 20], ea=1.6, eb=2)
write('башня до неба', 330, 1260, 14.45, 1.0, size=92)
arrow([1385, 905], [1385, 1180], 16.15, .45, 'graphite', 7)
write('Ю. Арцутанов:', 1450, 1220, 16.55, .9, size=72)
write('трос сверху', 1450, 1325, 18.1, .8, size=72)

B0 = len(E)
# ===================================================================== B. steel vs the elevator, one scale  (V31 20.18–35.46)
tag('сталь', 2760, 560, 20.3, size=60)
ink('count', 22.0, 1.3, 'blue', text='{0}–{1} км', to=[13, 26], xy=[3150, 605], size=110)
line([[2830, 805], [2833, 805]], 24.0, .12, 'blue', 16)                     # 26 км at the scale of the lift: a dot
ink('ring', 24.15, .5, 'blue', c=[2831, 805], r=46, lw=6)
write('в том же масштабе', 2910, 830, 24.35, .9, size=56)
tag('лифт', 2790, 1060, 25.0, size=60)
ink('dim', 25.2, 2.0, 'blue', **{'from': [2831, 950], 'to': [4831, 950]}, lw=9, ea=1.5, eb=2.5)
write('≈ 35 800 км', 4831, 1075, 26.9, .8, 'blue', 90, align='right')
write('больше чем в 1000 раз', 2760, 1290, 27.35, 1.2, 'blue', 110)
write('мой расчёт на пальцах', 2760, 1405, 28.3, 1.1, size=64)
write('известные материалы', 2760, 1575, 31.6, 1.4, size=92)
stamp('НЕ ГОДЯТСЯ', 4300, 1535, 34.3, size=90, rot=-5)

# ===================================================================== C. carbon nanotubes  (V32 36.01–52.55)
tag('углеродные нанотрубки', 2760, 1890, 36.2, size=60)
TY0, TY1, TX0, TX1 = 2020, 2180, 2830, 4130
line(arc((TX0, 2100), 30, 80, 0, 360, 36), 36.9, .3, lw=7)
line([[TX0, TY0], [TX1, TY0]], 37.1, .45, lw=7); line([[TX0, TY1], [TX1, TY1]], 37.2, .45, lw=7)
line(arc((TX1, 2100), 30, 80, -90, 90, 20), 37.6, .2, lw=7)
for j, yy in enumerate((2050, 2100, 2150)):                                   # a honeycomb wall, in drafting grey
    zz = [[x, yy + (12 if (i % 2) else -12)] for i, x in enumerate(range(TX0 + 40, TX1 - 10, 40))]
    line(zz, 37.7 + j * .2, .45, 'grey', 4)
write('в лаборатории: очень прочные', 2760, 2340, 38.6, 1.5, size=84)
line([[3420, 2530], [4780, 2530]], 41.0, 1.2, 'grey', 9, dash=[30, 22])        # the long thread nobody can grow
write('длинная нить', 3440, 2470, 41.3, .8, size=64)
write('?', 4830, 2575, 42.6, .3, size=140)
for i, (a_, b_) in enumerate([(2780, 2890), (2950, 3030), (3090, 3220), (3280, 3350)]):
    line([[a_, 2530], [b_, 2530]], 44.8 + i * .15, .14, lw=15)
write('только короткие кусочки', 2760, 2660, 45.0, 1.2, size=66)
write('космический лифт ждёт:', 2760, 2795, 46.55, 1.2, size=72)
tag('инженеры', 2790, 2890, 47.6, size=62, rot=-1, strike=dict(t=48.5, d=.25, color='red')); ev(48.5, 'strike', .25)
arrow([3230, 2900], [3400, 2900], 49.0, .3, 'graphite', 7)
write('материал', 3440, 2935, 49.2, .8, 'red', 120)
write('возможно, ещё нет', 3440, 3050, 50.7, 1.1, size=70)

A2 = len(E)
# ===================================================================== A again: counterweight and space debris  (V33 53.09–68.27)
line([[CBX, GEO], [CBX, 440]], 54.8, .7, lw=9)
line(rect(CBX - 75, 330, CBX + 75, 440), 55.5, .45, lw=9)
hatch(CBX - 75, CBX + 75, 440, 55.95, .3, 4)
write('противовес', 1430, 420, 56.2, .9, size=72)
DEB = [(2230, 1610), (2400, 1690), (2120, 1715)]
for i, (dx_, dy_) in enumerate(DEB):
    line([[dx_ - 14, dy_ - 10], [dx_ + 12, dy_ - 14], [dx_ + 16, dy_ + 8], [dx_ - 8, dy_ + 14], [dx_ - 14, dy_ - 10]], 57.6 + i * .2, .2, lw=6)
    line([[dx_ + 40, dy_], [dx_ + 170, dy_]], 57.75 + i * .2, .25, 'grey', 4)
write('космический мусор', 1700, 1840, 58.4, 1.0, size=66)
arrow([2080, 1660], [1350, 1660], 59.8, .55, 'graphite', 7)
line([[1268, 1640], [1284, 1672], [1300, 1645], [1316, 1676], [1332, 1650]], 60.45, .3, 'red', 6)
write('это детали', 1700, 1935, 62.3, .7, size=60)
write('сначала: нить, которая выдержит саму себя', 2760, 3255, 64.6, 2.0, size=82)

A3 = len(E)
# ===================================================================== D. the three barriers  (V34 68.82–83.37)
DX = 5060; TXT = 5490
write('три преграды', DX, 455, 69.0, 1.1, size=120)
tag('ВЕС', DX + 50, 700, 71.2, size=72)
write('сваями и формой башни', TXT, 735, 72.75, 1.4, size=100)
tick(TXT + tw('сваями и формой башни', 100) + 50, 705, 74.15)
tag('ВЕТЕР', DX + 50, 1060, 74.4, size=72)
write('формой и маятником', TXT, 1095, 75.95, 1.2, size=100)
tick(TXT + tw('формой и маятником', 100) + 50, 1065, 77.0)
DM = meta('print_damper'); DPW = 340
el(type='print', id='damper', src='print_damper', xy=[6790, 1080], w=DPW, z=8, rot=2,
   arrive=dict(t=76.5, kind='drop', d=.45, lift=200, spin=1.2, land=.6))
ev(76.77, 'land', .2, size='mid')
magnet(6660, 955, 76.9, r=18); magnet(6920, 960, 77.0, r=18)
tag('ТРОС', DX + 50, 1420, 77.5, size=72)
write('пока тяжелее, чем хочется', TXT, 1455, 78.05, 1.5, size=100)
write('лёгкий: никто не проверил', TXT, 1575, 80.2, 1.5, size=100)
write('?', 6880, 1580, 82.2, .35, 'red', 180)

# the answer  (V35 83.92–103.93)
arrow([DX + 30, 1510], [DX + 30, 1770], 84.0, .35, 'graphite', 8)
write('ответ:', DX, 1875, 84.4, .7, size=100)
ST = stamp('ПРЕДЕЛ — ТРОС', 6130, 1845, 87.35, size=130, rot=-4)
line([[TXT, 765], [TXT + tw('сваями', 100), 765]], 90.1, .35, 'graphite', 8)     # «фундамент льют глубже»
ink('ring', 88.8, .7, 'graphite', c=[6790, 1080], r=[215, 195], lw=7)          # «ветер гасят шаром»
write('трос сам себя не облегчит', DX, 2090, 91.75, 1.5, size=90)
tag('углеродный трос', DX + 50, 2230, 93.7, size=56)
write('заявлен, но не проверен', 5830, 2265, 95.0, 1.4, size=90)
# E. the record
GY2 = 3430
line([[DX, GY2], [6900, GY2]], 96.45, .35, lw=9); hatch(DX, 6900, GY2 + 50, 96.6, .4, 12)
BH_ = 650
el(type='print', id='burj', src='burj', xy=[5250, GY2 - 325], h=BH_, z=10, rot=-4.5,
   arrive=dict(t=96.7, kind='drop', d=.5, lift=240, spin=1.5, land=.6))
ev(96.98, 'land', .2, size='big')
magnet(5262, 2985, 97.1, r=18); magnet(5205, 3330, 97.2, r=18)
TOP = GY2 - 656
ink('dim', 97.3, 1.0, 'blue', **{'from': [5430, GY2], 'to': [5430, TOP]}, lw=8)
line([[5330, TOP], [5410, TOP]], 97.3, .2, 'grey', 4)
ink('count', 97.7, 1.3, 'blue', text='{0} м', to=[828], xy=[5500, 3080], size=110)
write('(со шпилем)', 5500, 3175, 98.9, .7, 'blue', 64)
KM = GY2 - 656 * 1000 / 828
line([[DX, KM], [6300, KM]], 99.25, .9, 'blue', 7, dash=[26, 20])
write('1 км', 6340, KM + 32, 100.0, .5, 'blue', 90)
arrow([5480, TOP - 15], [5480, KM + 20], 100.6, .35, 'blue', 6)
write('дальше решит', 6020, 3000, 101.2, .9, size=90)
write('материал', 6020, 3140, 102.7, .7, 'red', 110)

# ===================================================================== F. Timur reaches the top  (V36 104.48–119.58)
FX = 7100; CX, GY = 7750, 1950; K = 1250 / 1300
prof = [(220, 2000), (208, 1650), (170, 1650), (158, 1350), (120, 1350), (102, 1090), (62, 1090), (42, 860), (26, 860), (0, 700)]
outline = [[CX - w, GY - (2000 - y) * K] for w, y in prof] + [[CX + w, GY - (2000 - y) * K] for w, y in reversed(prof[:-1])]
line([[7380, GY], [8120, GY]], 103.9, .25, lw=10); hatch(7380, 8120, GY + 50, 104.0, .3, 8)
line(outline, 104.1, 1.1, lw=8)
line(circle((CX, 752), 15, 24), 104.6, .15, lw=6)
line([[CX, 768], [CX, 1880]], 104.7, .4, lw=6)
el(type='magnet', id='tcab', xy=[CX, 1870], r=26, color='white', z=20, arrive=dict(t=104.95, kind='snap', d=.3, lift=70),
   moves=[dict(t=105.15, d=1.7, dy=-1060, a=1.8, b=2.4), dict(t=127.9, d=3.4, dy=1040, a=2.2, b=2.2)])
ev(105.0, 'clack', .1); ev(105.15, 'slide', 1.7); ev(127.9, 'slide', 3.4)
el(type='tag', id='timur', text='Тимур', xy=[CX + 70, 1880], size=46, z=12, rot=-2,
   arrive=dict(t=105.0, kind='swing', d=.8, amp=8),
   moves=[dict(t=105.15, d=1.7, dy=-1060, a=1.8, b=2.4), dict(t=127.9, d=3.4, dy=1040, a=2.2, b=2.2)])
ev(105.0, 'tag', .3)
tick(CX - 175, 845, 106.3)
write('верёвка выдержала', FX, 2185, 106.3, 1.1, size=90)
write('чем выше, тем тяжелее', FX, 2300, 109.35, 1.3, size=90)
line([[CX, 830], [CX, 1880]], 110.0, .7, lw=17)                                # the rope, thick now
write('лёгкая нить: пока обещана', FX, 2415, 111.65, 1.5, size=90)
write('лифт на 1 км: дело времени', FX, 2575, 114.55, 1.5, size=90)
L1 = 'лифт в космос: дело '
write(L1 + 'материала', FX, 2690, 117.4, 1.7, size=90)
line([[FX + tw(L1, 90), 2712], [FX + tw(L1 + 'материала', 90), 2712]], 119.15, .35, 'red', 8)

# the closing question  (V37 120.13–130.32)
write('нужна ли башня выше 1 км?', FX, 2900, 120.3, 1.6, size=100)
line([[FX, 3430], [8400, 3430]], 123.3, .3, lw=9)
line(rect(7170, 3010, 7250, 3430), 123.55, .5, lw=8)
write('вверх', 7290, 3110, 124.0, .5, size=64)
line(rect(7520, 3290, 8240, 3430), 124.4, .55, lw=8)
write('вширь', 7560, 3260, 125.1, .5, size=64)
tag('пишите в комментариях', 7720, 3080, 126.2, size=48)

def shift(e, dx, dy=0):
    for k in ('xy', 'from', 'to', 'c'):
        if k == 'to' and e.get('kind') == 'count': continue        # a rolling number's targets, not a point
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1] + dy]
    if 'points' in e: e['points'] = [[x + dx, y + dy] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y + dy] for x, y in st['points']]
for e in E[B0:A2] + E[A3:]: shift(e, BX)        # the elevator's own later marks (A2…A3) stay on the cable
for e in E: shift(e, GX, GY0)

# ===================================================================== camera (one continuous camera; the card hides the start)
c = Cam(*fit([550, 2500, 2450, 3470]))
c.fit(1.6, 2.3, [550, 640, 2450, 1610], a=1.6, b=2.4)                 # ride up the cable as it is drawn
c.fit(3.95, 1.9, [800, 1500, 2600, 2720], a=2, b=2.6)                 # down the dimension to the number
c.fit(6.3, 1.3, [900, 650, 2650, 1460])                                # the orbit, the satellite
c.fit(9.0, 1.0, [700, 2450, 2500, 3420])                               # the cabin at the foot
c.fit(9.8, 2.1, [700, 1100, 2500, 2070], a=1.8, b=2.6)                 # … rides up with it
c.fit(11.7, 1.1, [280, 1880, 1420, 2860])                              # Tsiolkovsky
c.fit(13.85, 1.2, [250, 1900, 1750, 2900])
c.fit(14.2, 1.3, [250, 1080, 1750, 2080], a=1.8, b=2.6)                # up the dashed tower
c.fit(16.0, 1.3, [900, 660, 2600, 1460])                               # Artsutanov: from above
c.fit(19.6, 1.6, [2650, 440, 3950, 1110])                              # B: steel
c.fit(24.9, 2.4, [3550, 440, 4950, 1110], a=1.5, b=2.6)                # ride the long dimension
c.fit(27.2, 1.6, [2650, 440, 4950, 1650])                              # judgement frame
c.fit(35.5, 1.5, [2650, 1800, 4300, 2420])                             # C: nanotubes
c.fit(40.4, 1.4, [2650, 1800, 4950, 2720])
c.fit(46.3, 1.4, [2650, 2380, 4600, 3110])
c.fit(52.7, 1.8, [900, 270, 2650, 1110])                               # back to the cable top: counterweight
c.fit(57.2, 1.3, [1150, 1150, 2650, 1990])                             # debris
c.fit(63.4, 1.6, [2650, 2740, 4600, 3320])                             # the thread that holds itself
c.fit(68.5, 1.8, [5000, 300, 7050, 1250])                              # D: the three barriers
c.fit(77.0, 1.3, [5000, 960, 7050, 1700])
c.fit(83.5, 1.6, [5000, 380, 7050, 2010], a=2, b=3)                    # the judgement frame: all three + the answer
c.shake(87.4, amp=4, f=10, k=8)
c.fit(91.3, 1.3, [5000, 1720, 7050, 2340])
c.fit(96.2, 1.5, [5000, 2560, 7050, 3480])                             # E: the record
c.fit(103.9, 1.4, [7050, 640, 8450, 2010])                             # F: Timur at the top
c.fit(107.9, 1.8, [7050, 760, 8450, 2730], a=2, b=3)
c.fit(119.8, 1.4, [7050, 2780, 8450, 3470])                            # the question
c.fit(126.3, 3.5, [250, 180, 8450 + BX, 3480], a=2, b=3.2)                  # the whole wall, once
c.to(129.9, 1.92, z=z_of(c) * 1.01)

scene = dict(dur=DUR, board=dict(w=BW, h=BH, seed=41, texScale=.4, ghosts=150, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=21000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[], timeOffset=OFF)
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=sorted(EV, key=lambda e: e['t'])), open(os.path.join(FILM, 'events.json'), 'w'), ensure_ascii=False)
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
for s, z in [('сваями и формой башни', 100), ('пока тяжелее, чем хочется', 100), ('лёгкий: никто не проверил', 100),
             ('лифт в космос: дело материала', 90), ('нужна ли башня выше 1 км?', 100), ('лёгкая нить: пока обещана', 90),
             ('заявлен, но не проверен', 90), ('сначала: нить, которая выдержит саму себя', 82), ('висит над одной точкой', 62),
             ('в лаборатории: очень прочные', 84), ('известные материалы', 92), ('больше чем в 1000 раз', 110), ('≈ 35 800 км', 130)]:
    print(f'  {s!r:48} {tw(s, z):6.0f}')
