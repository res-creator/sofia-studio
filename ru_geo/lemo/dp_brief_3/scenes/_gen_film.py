#!/usr/bin/env python3
"""«Мысленный эксперимент» · Опасные места · board film, PART 3.
FILM range 297.50–468.60 s (171.10 s): Challenger Deep (end of the previous chapter) + chapter «ХОЛОД И ЖАРА» (card at 355.86).
The renderer works in LOCAL time:  local = film − 297.50.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/deadly_places/film.json (segs → captions).
One window is covered by another clip (Archive Light Table: Trieste 1960, Piccard and Walsh, Cameron):
film 335.43–353.56 = local 37.93–56.06. Nothing is drawn there and no sound events are written for it; the camera quietly
pulls back to the whole Challenger row so the wall is seen as a whole when the clip ends (the chapter's pull-back).
Wall (board px, before the OX shift):
  row 1  (y  450…1950)  p1 the trench section, 11 km, >1000 atm, 1 t vs 1 kg per cm² · p2 Everest inside, >2 km of water, no time known
  row 2  (y 2650…4100)  p3 Vostok: map, print, 21 July 1983, −89,2 °C, station vs satellites · p4 −65 °C, 3,5 km, thin air, wind, work
  row 3  (y 4750…6150)  p5 Death Valley below sea level, 56,7 °C 1913 disputed · p6 54,4 °C, Furnace Creek ground 94 · p7 low basin,
                         July 2024, water + forecast · p8 Mponeng: gold, almost 4 km, rock 60 °C and more
Antarctica outline: /tmp/world.geo.json (johan/world.geo.json, Natural Earth 1:110m, public domain), south polar azimuthal projection.
Ink: graphite = names/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 297.50, 468.60
DUR = round(R1 - R0, 3)                       # 171.10
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(335.43), L(353.56))]
BW, BH = 12500, 9000

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
FS = 1.12
def write(text, x, y, t, d, color='graphite', size=64, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=round(size * FS), **k)
def count(text, to, x, y, t, d, color='blue', size=120, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=round(size * FS), **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': list(a), 'to': list(b)}, lw=lw, **k)
def tag(text, x, y, t, size=54, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=20, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def credit(id, text, x, y, t, w, rot=-1):
    return el(type='card', id=id, xy=[x, y], w=w, h=56, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=27, x=20, y=9, color='grey', pass_=True)])
def mounted(id, src, x, y, t, w, ratio, cred, cw, rot=-1.2):
    """a print with two magnets and its credit card underneath"""
    h = w * ratio
    printd(id, src, x, y, t, w=w, rot=rot)
    magnet(x - w * .36, y - h / 2 + 28, t + .45); magnet(x + w * .36, y - h / 2 + 24, t + .55)
    credit('cred_' + id, cred, x, y + h / 2 + 62, t + .7, cw)
    return h
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def bez(p0, p1, p2, n=28):
    return [[(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]] for u in [i / n for i in range(n + 1)]]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85, quiet=False):
    if not quiet: ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def wave(x0, x1, y, t, d, color='blue', lw=6, amp=10, n=30, **k):
    return line([[x0 + (x1 - x0) * i / n, y + amp * math.sin(i * math.pi / 2.5)] for i in range(n + 1)], t, d, color, lw, **k)
def thermometer(x, y, s, t, color='graphite', fillTo=None, quiet=True):
    """a marker thermometer, bulb centre at (x, y)"""
    line([[x - 18 * s, y - 40 * s], [x - 18 * s, y - 260 * s], *[[x + 18 * s * math.cos(math.radians(a)), y - 260 * s - 18 * s * math.sin(math.radians(a))] for a in range(180, -1, -30)],
          [x + 18 * s, y - 40 * s]], t, .4, color, 6, quiet=quiet)
    line(circle((x, y), 40 * s, 24, a0=-60, turn=.84), t + .35, .25, color, 6, quiet=True, fill='blue', fillA=.5)
    if fillTo is not None: line([[x, y - 30 * s], [x, y - fillTo * s]], t + .6, .5, 'blue', 14 * s, quiet=True)
    for i in range(5): line([[x + 22 * s, y - (80 + 40 * i) * s], [x + 40 * s, y - (80 + 40 * i) * s]], t + .5 + .04 * i, .05, color, 4, quiet=True)
def hatch_area(x0, x1, y0, y1, t, d, n, seed, color='graphite', lw=4, l=26):
    rnd = random.Random(seed); st = []
    for i in range(n):
        x, y = x0 + rnd.random() * (x1 - x0), y0 + rnd.random() * (y1 - y0)
        st.append(dict(points=[[round(x, 1), round(y, 1)], [round(x + l * .7, 1), round(y - l * .7, 1)]], t=round(t + d * i / n, 3), d=.04, lw=lw))
    return st

# ===================================================================== ROW 1 · Challenger Deep
# --- p1 297.52–316.28: place four: Challenger Deep in the Mariana Trench, almost 11 km down; pressure > 1000 atm = more than a tonne
#     on every cm²; at sea level the air presses on the same cm² with about 1 kg
K = 110                                         # px per km in the section
SY = 640; BOT = SY + 11 * K                     # sea surface, bottom of the trench (≈ 11 km)
TX = 1600                                       # trench axis
tag('место четвёртое', 2430, 470, L(297.6), size=54, rot=-1.5)
write('Бездна Челленджера', 2400, 650, L(297.9), 1.9, 'graphite', 84)
write('Марианская впадина', 2400, 750, L(300.2), 1.2, 'grey', 56)
wave(900, 2250, SY, L(298.4), 1.0)
FLOOR = [[900, 1150], [1150, 1170], [1350, 1250], [1470, 1500], [TX, BOT], [1700, 1520], [1830, 1260], [2000, 1180], [2250, 1170]]
line(FLOOR + [[2250, 1930], [900, 1930], [900, 1150]], L(299.0), 1.4, 'graphite', 7, fill='grey', fillA=.16)
line([[820, SY], [900, SY]], L(301.6), .2, 'grey', 4, dash=[12, 10], quiet=True)
line([[820, BOT], [TX - 20, BOT]], L(301.6), .4, 'grey', 4, dash=[12, 10], quiet=True)
dim([820, SY + 10], [820, BOT - 10], L(301.7), 1.2, lw=7)
write('почти', 790, 1150, L(301.7), .5, 'graphite', 56, align='right')
count('{0} км', [11], 790, 1290, L(302.0), 1.6, size=110, align='right')
write('вниз', 790, 1385, L(303.4), .5, 'graphite', 56, align='right')
for i, (dx, dy) in enumerate(((-170, -90), (170, -90), (-120, -230), (120, -230))):
    arrow([TX + dx, BOT + dy], [TX + dx * .3, BOT + dy * .3 - 10], L(304.1) + .15 * i, .4, 'blue', 6, quiet=(i > 0))
write('давление там', 2400, 920, L(304.05), .9, 'graphite', 62)
count('больше {0} атмосфер', [1000], 2400, 1060, L(304.6), 2.0, size=100, sep=True)
write('это больше тонны на каждый см²', 2400, 1200, L(306.63), 2.6, 'graphite', 60)
# pictograms: a tonne on a square centimetre (bottom) and about a kilogram (sea level)
write('на дне', 2640, 1400, L(307.2), .5, 'grey', 48, align='center')
line(rect(2470, 1440, 2810, 1650), L(307.4), .5, 'graphite', 7, fill='grey', fillA=.2)
write('больше 1 т', 2640, 1570, L(307.8), .6, 'blue', 52, align='center')
line(rect(2590, 1660, 2690, 1760), L(308.4), .3, 'blue', 6, fill='blue', fillA=.2)
write('1 см²', 2710, 1745, L(308.7), .4, 'grey', 44)
write('уровень моря', 3340, 1400, L(310.1), .8, 'grey', 48, align='center')
wave(3150, 3530, 1440, L(310.5), .5, 'blue', 4, amp=6, n=14, quiet=True)
line(rect(3300, 1610, 3380, 1658), L(314.45), .3, 'graphite', 6, fill='grey', fillA=.25)
write('примерно 1 кг', 3340, 1575, L(314.6), 1.0, 'blue', 50, align='center')
line(rect(3290, 1660, 3390, 1760), L(312.4), .3, 'blue', 6, fill='blue', fillA=.2)
write('1 см²', 3410, 1745, L(312.7), .4, 'grey', 44)

# --- p2 316.82–334.87: Everest would fit entirely, with more than 2 km of water above; no survival without protection, but no exact
#     time: nobody measured it and we will not invent it; people went down only in strong vehicles; now to the cold: how many degrees?
PEAK = [TX, BOT - 8.85 * K]
EVR = [[1150, BOT], [1290, 1560], [1370, 1480], [1450, 1200], [1530, 1050], PEAK, [1660, 980], [1720, 1110], [1810, 1310], [1920, 1560], [2060, BOT]]
line(EVR, L(316.9), 1.8, 'graphite', 7, fill='grey', fillA=.3, dash=[22, 10])
write('Эверест', 1760, 1100, L(317.6), .8, 'graphite', 54)
line([[PEAK[0] - 60, PEAK[1]], [PEAK[0] + 80, PEAK[1]]], L(319.1), .2, 'grey', 4, dash=[10, 8], quiet=True)
dim([PEAK[0] + 40, PEAK[1] - 8], [PEAK[0] + 40, SY + 14], L(319.2), .9, lw=6)
write('больше 2 км воды', 1700, 800, L(319.6), 1.6, 'blue', 50)
write('без защиты там не выжить', 4200, 640, L(322.22), 1.6, 'graphite', 70)
tag('точного времени нет', 4230, 780, L(323.95), size=56, rot=1.2)
write('никто этого не измерял,', 4200, 990, L(325.53), 1.5, 'graphite', 62)
write('и мы не будем его выдумывать', 4200, 1075, L(327.12), 1.8, 'graphite', 62)
write('туда спускались только', 4200, 1250, L(329.11), 1.2, 'graphite', 62)
write('в прочных аппаратах', 4200, 1335, L(330.2), 1.2, 'graphite', 62)
SC = (5620, 1210)
line(circle(SC, 95, 40), L(330.4), .5, 'graphite', 12, fill='grey', fillA=.25)
line(circle(SC, 70, 32), L(330.7), .3, 'graphite', 5, quiet=True)
line(circle((SC[0] + 40, SC[1] - 20), 16, 14), L(330.9), .15, 'blue', 5, quiet=True)
write('а теперь — на самый мороз:', 4200, 1520, L(331.91), 1.4, 'graphite', 62)
write('сколько там градусов?', 4200, 1610, L(333.41), 1.3, 'blue', 62)
thermometer(5280, 1650, 1.0, L(332.2), quiet=False)
write('?', 5350, 1520, L(333.9), .4, 'blue', 90)

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ХОЛОД И ЖАРА', 355.86)

# ===================================================================== ROW 2 · Vostok
# --- p3 356.86–381.73: place five: Vostok station in Antarctica; 21 July 1983: −89,2 °C, the lowest temperature measured right at a
#     weather station; satellites showed lower, but that is not a direct measurement on the ground → the two records are kept apart
tag('место пятое', 480, 2720, L(356.9), size=54, rot=-1.5)
write('станция «Восток»', 450, 2900, L(357.1), 1.6, 'graphite', 84)
G = json.load(open('/tmp/world.geo.json'))
ANT = next(f for f in G['features'] if f['properties']['name'] == 'Antarctica')['geometry']['coordinates']
MC, MS = (875, 3450), 13.2                       # map centre, px per degree from the pole
def pole(lon, lat):
    r = (90 + lat) * MS; return [MC[0] + r * math.sin(math.radians(lon)), MC[1] - r * math.cos(math.radians(lon))]
rings = sorted([[pole(*q) for q in poly[0] if q[1] > -89.5] for poly in ANT], key=lambda r: -len(r)); tt = L(359.2)
for i, r in enumerate(rings):
    line(r, tt, .9 if i == 0 else .12, 'graphite', 5, quiet=(i > 0), fill='grey', fillA=.12); tt += .05 if i else .9
write('Антарктида', MC[0] - 40, MC[1] - 40, L(359.6), .7, 'grey', 44, align='center')
VO = pole(106.84, -78.46)
line(circle(VO, 11, 12), L(360.2), .1, 'graphite', 12, fill='grey', fillA=.9)
ink('ring', L(360.3), .35, 'graphite', c=VO, r=32, lw=6)
write('Восток', VO[0] - 40, VO[1] + 75, L(360.5), .5, 'graphite', 48, align='right')
VH = mounted('vostok', 'print_vostok', 1850, 3250, L(357.6), 860, 1008 / 1308, 'станция «Восток», 2023–2024 · ААНИИ, CC BY 4.0', 800)
write('21 июля 1983 года', 2500, 2800, L(359.94), 2.4, 'blue', 70)
write('там измерили', 2500, 2900, L(362.73), 1.2, 'graphite', 58)
count('−{0},{1} °C', [89, 2], 2500, 3060, L(365.15), 2.0, size=130)
thermometer(3480, 3070, .9, L(365.3), fillTo=70)
write('самую низкую температуру,', 2500, 3180, L(367.35), 1.8, 'graphite', 60)
write('измеренную прямо на метеостанции', 2500, 3265, L(369.85), 2.0, 'graphite', 60)
write('спутники показывали и ниже,', 2500, 3420, L(372.27), 1.7, 'graphite', 60)
SAT = (4080, 3330)
line(rect(SAT[0] - 28, SAT[1] - 22, SAT[0] + 28, SAT[1] + 22), L(372.5), .2, 'graphite', 6, fill='grey', fillA=.25)
for sx in (-1, 1):
    line(rect(SAT[0] + sx * 38, SAT[1] - 14, SAT[0] + sx * 120, SAT[1] + 14), L(372.7), .2, 'graphite', 5, quiet=True)
arrow([SAT[0], SAT[1] + 40], [SAT[0], SAT[1] + 230], L(373.0), .6, 'blue', 5, dash=[14, 10], quiet=True)
write('но это не прямое измерение на земле', 2500, 3505, L(374.29), 2.6, 'graphite', 60)
tag('рекорд метеостанции', 2530, 3640, L(377.28), size=50, rot=-1)
tag('рекорд из космоса', 3560, 3640, L(379.0), size=50, rot=1)
line([[3460, 3610], [3460, 3800]], L(379.7), .3, 'graphite', 7)
write('считают отдельно', 2500, 3900, L(379.75), 1.6, 'graphite', 62)

# --- p4 382.28–402.94: winter average about −65 °C, the station at about 3,5 km altitude, thin air; bare skin freezes fast, the time
#     depends on the wind; but the winterers work: clothing, heating and rules for going out turn the cold into working conditions
write('зимой в среднем', 4600, 2790, L(382.28), 1.4, 'graphite', 62)
count('около −{0} °C', [65], 4600, 2940, L(384.0), 1.8, size=110)
SEA = 3480; D0, D1, DC = (4650, SEA), (6450, SEA), (5550, 2820)
line([[4600, SEA], [6550, SEA]], L(385.9), .7, 'blue', 5, dash=[16, 12])
write('уровень моря', 6550, SEA + 70, L(386.2), .5, 'grey', 42, align='right')
line(bez(D0, DC, D1, 36) + [list(D0)], L(386.0), 1.0, 'graphite', 7, fill='grey', fillA=.12)
write('лёд', 5550, 3420, L(386.6), .3, 'grey', 46, align='center')
line(rect(5505, 3106, 5595, 3150), L(386.8), .2, 'graphite', 6, fill='grey', fillA=.5, quiet=True)
line([[5600, 3128], [6300, 3128]], L(387.0), .3, 'grey', 4, dash=[10, 8], quiet=True)
dim([6300, SEA - 8], [6300, 3136], L(387.0), .8, lw=6)
write('около 3,5 км', 6340, 3340, L(388.0), 1.2, 'blue', 54)
rnd = random.Random(7)
air = [dict(points=[[x, y], [x + 4, y + 3]], t=round(L(390.3) + i * .1, 3), d=.05, lw=9)
       for i, (x, y) in enumerate([(5450 + rnd.random() * 850, 2960 + rnd.random() * 110) for _ in range(9)])]
strokes_el(air, L(390.3), 1.0, 'blue', 9, .6)
write('воздух разрежён', 4650, 3070, L(390.29), 1.0, 'grey', 50)
write('голая кожа мёрзнет быстро,', 4600, 3650, L(391.79), 1.7, 'graphite', 60)
write('точное время зависит от ветра', 4600, 3735, L(393.78), 2.0, 'graphite', 60)
for i, yy in enumerate((3600, 3650, 3700)):
    line(bez([5900, yy], [6100, yy - 30], [6330 - 40 * i, yy + 5]), L(394.6) + .12 * i, .4, 'grey', 5, quiet=(i > 0), arrow=(i == 1))
write('но зимовщики работают:', 4600, 3890, L(396.07), 1.4, 'graphite', 60)
write('одежда · обогрев · правила выхода', 4600, 3975, L(397.68), 2.2, 'blue', 60)
write('превращают холод в рабочую обстановку', 4600, 4060, L(400.01), 2.6, 'graphite', 60)

# ===================================================================== ROW 3 · Death Valley, Mponeng
# --- p5 403.49–415.85: place six: Death Valley in California, below sea level; the air record, 56,7 °C in 1913, many experts dispute
tag('место шестое', 480, 4820, L(403.5), size=54, rot=-1.5)
write('Долина Смерти', 450, 4990, L(403.7), 1.6, 'graphite', 84)
write('Калифорния', 450, 5090, L(405.5), .8, 'grey', 56)
line([[450, 5380], [1650, 5380]], L(406.0), .7, 'blue', 5, dash=[16, 12])
write('уровень моря', 1650, 5350, L(406.3), .5, 'grey', 40, align='right')
BAS = [[450, 5190], [650, 5220], [790, 5410], [1000, 5465], [1200, 5455], [1360, 5300], [1500, 5185], [1650, 5200]]
line(BAS + [[1650, 5590], [450, 5590], [450, 5190]], L(406.1), 1.0, 'graphite', 7, fill='grey', fillA=.14)
line([[795, 5380], [800, 5418], [1000, 5462], [1200, 5452], [1325, 5380]], L(406.9), .4, 'blue', 4, fill='blue', fillA=.25, quiet=True)
write('ниже уровня моря', 450, 5720, L(406.4), 1.1, 'blue', 60)
mounted('dv', 'print_dv', 2150, 5300, L(404.2), 640, 1214 / 1144, 'Бэдуотер со спутника, 2023 · NASA', 600)
write('рекорд воздуха:', 2700, 4920, L(407.52), 1.2, 'graphite', 62)
count('{0},{1} °C', [56, 7], 2700, 5070, L(408.86), 2.4, size=120)
write('в 1913 году', 2700, 5170, L(411.55), 1.2, 'blue', 62)
write('многие эксперты оспаривают', 2700, 5275, L(413.74), 1.8, 'graphite', 60)
el(type='stamp', text='ОСПАРИВАЮТ', xy=[3760, 5050], size=62, rot=-6, t=L(414.6), color='red'); ev(L(414.6), 'stamp', .2)

# --- p6 416.40–433.17: the reliably measured maximum is lower: 54,4 °C, in 2020 and 2021; the ground at Furnace Creek in 1972 heated to
#     almost 94; here danger is measured in hours without water and shade
write('надёжно измеренный максимум ниже:', 2700, 5445, L(416.4), 2.2, 'graphite', 60)
count('{0},{1} °C', [54, 4], 2700, 5595, L(418.68), 2.0, size=120)
write('в 2020 и 2021 годах', 2700, 5700, L(420.96), 2.0, 'blue', 62)
ink('ring', L(423.3), .5, 'red', c=[2960, 5550], r=[330, 100], lw=7)
write('Фернис-Крик, 1972:', 4400, 4920, L(424.35), 1.4, 'graphite', 62)
write('землю нагрело', 4400, 5010, L(425.8), 1.0, 'graphite', 62)
count('почти до {0} °C', [94], 4400, 5160, L(427.31), 2.2, size=100)
line([[4400, 5300], [5950, 5300]], L(425.0), .6, 'graphite', 8)
strokes_el(hatch_area(4420, 5930, 5330, 5380, L(425.3), .8, 40, 3), L(425.3), .8, 'graphite', 4, .7)
for i in range(4):
    x0 = 5450 + i * 120
    line([[x0 + 14 * math.sin(k / 2), 5280 - k * 12] for k in range(8)], L(428.6) + .12 * i, .3, 'red' if False else 'blue', 4, quiet=(i > 0))
write('опасность здесь измеряется', 4400, 5470, L(430.03), 1.6, 'graphite', 60)
write('часами без воды и тени', 4400, 5560, L(432.29), 1.2, 'graphite', 60)
CK = (5750, 5490)
line(circle(CK, 70, 32), L(431.0), .4, 'graphite', 7)
line([[CK[0], CK[1]], [CK[0], CK[1] - 50]], L(431.4), .1, 'graphite', 7, quiet=True)
line([[CK[0], CK[1]], [CK[0] + 36, CK[1] + 10]], L(431.5), .1, 'graphite', 7, quiet=True)

# --- p7 433.72–451.14: one reason for the heat: the basin lies very low; the air there is compressed and heats up more; July 2024 was the
#     hottest month in this valley in the history of observations; such places need a supply of water and respect for the forecast
mounted('dvterra', 'print_dvterra', 6600, 5250, L(433.9), 760, 1077 / 1416, 'Долина Смерти, данные спутника Terra · NASA', 760)
write('одна из причин жары:', 7150, 4920, L(433.72), 1.6, 'graphite', 62)
write('котловина лежит очень низко', 7150, 5010, L(435.61), 2.0, 'graphite', 62)
VB = [[7150, 5150], [7400, 5180], [7600, 5370], [7900, 5410], [8200, 5370], [8400, 5180], [8650, 5150]]
line(VB, L(436.4), .8, 'graphite', 7)
for i, (p0, p1) in enumerate((([7560, 5080], [7760, 5320]), ([8240, 5080], [8040, 5320]), ([7900, 5060], [7900, 5320]))):
    arrow(p0, p1, L(437.94) + .3 * i, .7, 'blue', 6, quiet=(i > 0))
write('воздух там сжимается', 7150, 5530, L(437.94), 1.5, 'graphite', 60)
write('и нагревается сильнее', 7150, 5615, L(439.5), 1.5, 'graphite', 60)
write('июль 2024 года —', 6250, 5810, L(441.07), 1.6, 'blue', 66)
write('самый жаркий месяц в этой долине', 6250, 5900, L(443.41), 2.0, 'graphite', 60)
write('за всю историю наблюдений', 6250, 5985, L(445.48), 2.0, 'graphite', 60)
write('такие места требуют', 7750, 5810, L(447.76), 1.3, 'graphite', 60)
write('запаса воды', 7750, 5900, L(448.9), .9, 'blue', 62)
write('и уважения к прогнозу', 7750, 5985, L(449.86), 1.2, 'graphite', 60)
BT = (8680, 5860)
line([[BT[0] - 22, BT[1] - 120], [BT[0] + 22, BT[1] - 120], [BT[0] + 22, BT[1] - 95], [BT[0] + 45, BT[1] - 70], [BT[0] + 45, BT[1] + 90],
      [BT[0] - 45, BT[1] + 90], [BT[0] - 45, BT[1] - 70], [BT[0] - 22, BT[1] - 95], [BT[0] - 22, BT[1] - 120]], L(449.0), .5, 'graphite', 6)
line(rect(BT[0] - 45, BT[1] - 20, BT[0] + 45, BT[1] + 90), L(449.4), .2, 'blue', 4, fill='blue', fillA=.3, quiet=True)

# --- p8 451.69–466.45: a place where people made the heat themselves, going for gold: the Mponeng mine in South Africa, almost 4 km down,
#     the rock heats to 60 °C and more; how do they work there?
write('а здесь жар создали сами люди,', 9300, 4920, L(451.69), 2.2, 'graphite', 62)
write('когда пошли за золотом', 9300, 5010, L(453.98), 1.8, 'graphite', 62)
mounted('mponeng', 'print_mponeng', 9950, 5330, L(454.4), 1300, 511 / 1636, 'шахта Мпоненг, ЮАР · фото: JMK, CC BY-SA 4.0', 760)
write('шахта Мпоненг, Южная Африка', 9300, 5800, L(455.93), 2.2, 'graphite', 62)
GX, GY, GB = 11050, 5000, 5900                  # shaft: surface, ≈ 4 km down
line([[10850, GY], [11850, GY]], L(456.6), .5, 'graphite', 8)
line([[11000, GY], [11030, GY - 130], [11070, GY - 130], [11100, GY]], L(457.0), .3, 'graphite', 6, quiet=True)
line([[11050, GY - 130], [11050, GY - 160]], L(457.3), .1, 'graphite', 6, quiet=True)
line([[GX - 20, GY], [GX - 20, GB]], L(458.34), 1.0, 'graphite', 6, quiet=True)
line([[GX + 20, GY], [GX + 20, GB]], L(458.34), 1.0, 'graphite', 6)
line([[GX + 20, GB], [GX + 160, GB]], L(459.3), .3, 'graphite', 6, quiet=True)
strokes_el(hatch_area(10870, GX - 40, GY + 40, GB, L(458.4), 1.4, 45, 5) + hatch_area(GX + 40, 11250, GY + 40, GB - 40, L(458.4), 1.4, 30, 6),
           L(458.4), 1.4, 'grey', 4, .6)
dim([11330, GY + 8], [11330, GB - 8], L(458.4), 1.2, lw=6)
count('почти {0} км', [4], 11370, 5420, L(458.6), 1.4, size=80)
write('вглубь', 11370, 5510, L(459.6), .6, 'graphite', 56)
for i in range(3):
    x0 = GX + 60 + i * 50
    line([[x0 + 10 * math.sin(k / 2), GB - 20 - k * 12] for k in range(7)], L(462.5) + .12 * i, .3, 'blue', 4, quiet=True)
count('порода: до {0} °C и выше', [60], 9300, 5950, L(462.5), 2.0, size=90)
write('Как они там работают?', 9300, 6090, L(464.55), 1.5, 'graphite', 70)

# ===================================================================== camera (one continuous camera)
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=9):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z
class Cam:
    def __init__(s, x, y, z):
        s.base = dict(x=x, y=y, z=z, roll=0); s.cur = dict(x=x, y=y, lz=math.log(z), roll=0); s.moves = []; s.shakes = []
    def to(s, t, d, x=None, y=None, z=None, roll=None, a=2, b=2.6):
        m = dict(t=round(t, 3), d=round(d, 3), a=a, b=b)
        if x is not None: m['dx'] = round(x - s.cur['x'], 2); s.cur['x'] = x
        if y is not None: m['dy'] = round(y - s.cur['y'], 2); s.cur['y'] = y
        if z is not None: m['dl'] = math.log(z) - s.cur['lz']; s.cur['lz'] = math.log(z)
        s.moves.append(m)
        if d > .6 and (abs(m.get('dx', 0)) * z_of(s) > 500 or abs(m.get('dl', 0)) > .5): ev(t, 'whoosh', d)
        return t + d
    def fit(s, t, d, box, zmax=9, a=2, b=2.6):
        x, y, z = fit(box, zmax); return s.to(t, d, x, y, z, a=a, b=b)
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])

R1A = [380, 420, 3500, 1950]
c = Cam(*fit(R1A))
c.to(L(297.6), 6.0, z=z_of(c) * 1.03)
c.fit(L(304.0), 1.4, [800, 420, 3700, 1950], b=2.8)                   # pressure, tonne vs kilogram
c.to(L(305.5), 10.5, z=z_of(c) * 1.02)
c.fit(L(316.5), 1.3, R1A, b=2.8)                                       # Everest inside the trench
c.to(L(317.9), 4.0, z=z_of(c) * 1.02)
c.fit(L(321.9), 1.4, [4150, 440, 6450, 1760], b=2.8)                   # no exact time, strong vehicles, the cold
c.to(L(323.4), 11.5, z=z_of(c) * 1.03)
c.to(L(338.0), 8.0, z=z_of(c) * 1.02)                                   # (under the clip) slow drift
c.fit(L(347.0), 4.0, [380, 380, 6100, 1980], b=3)                       # (under the clip) the whole Challenger row, seen when the clip ends
c.to(L(351.2), 4.6, z=z_of(c) * 1.02)
c.fit(L(355.95), .8, [380, 2650, 2450, 3780], a=1.6, b=2)                # behind the chapter card: Vostok
c.to(L(356.8), 2.8, z=z_of(c) * 1.02)
c.fit(L(359.6), 1.4, [1350, 2650, 4400, 3960], b=2.8)                  # the record, station vs satellites
c.to(L(361.1), 20.7, z=z_of(c) * 1.03)
c.fit(L(382.0), 1.4, [4480, 2680, 6820, 3560], b=2.8)                  # −65, 3,5 km, thin air
c.to(L(383.5), 7.8, z=z_of(c) * 1.02)
c.fit(L(391.4), 1.3, [4480, 3380, 6820, 4120], b=2.8)                  # skin, wind, the winterers
c.to(L(392.8), 9.8, z=z_of(c) * 1.02)
c.fit(L(402.8), 1.3, [380, 4740, 3000, 5800], b=2.8)                   # Death Valley
c.to(L(404.2), 2.8, z=z_of(c) * 1.02)
c.fit(L(407.2), 1.4, [1850, 4760, 4370, 5800], b=2.8)                  # 56,7 disputed, 54,4 reliable
c.to(L(408.7), 15.0, z=z_of(c) * 1.02)
c.fit(L(424.0), 1.3, [4320, 4760, 6100, 5640], b=2.8)                  # Furnace Creek, hours without water
c.to(L(425.4), 7.8, z=z_of(c) * 1.02)
c.fit(L(433.3), 1.4, [6150, 4760, 8900, 6060], b=2.8)                  # the low basin, July 2024, water + forecast
c.to(L(434.8), 16.5, z=z_of(c) * 1.02)
c.fit(L(451.4), 1.4, [9200, 4740, 12000, 6150], b=2.8)                 # Mponeng
c.to(L(452.9), 13.3, z=z_of(c) * 1.02)
c.fit(L(466.45), 2.0, [380, 3050, 12000, 6650], b=3)                  # chapter pull-back (rows 2–3; row 1 stays above the frame)

OX = 600
OY = 900                                        # and OY px lower (keeps the frame out of the pull-backs)
def shift(e, dx, dy):
    for k in ('xy', 'c', 'pivot') + (('from', 'to') if e.get('kind') == 'dim' or e['type'] == 'ruler' else ()):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1] + dy]
    if 'points' in e: e['points'] = [[x + dx, y + dy] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y + dy] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx; ex[1] += dy; ex[2] += dy
for e in E: shift(e, OX, OY)
c.base['x'] += OX; c.base['y'] += OY; BW += OX

EV = [e for e in EV if e['type'] == 'key' or not any(a - .05 < e['t'] < b for a, b in COVER)]
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=73, texScale=.4, ghosts=220, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=40000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
