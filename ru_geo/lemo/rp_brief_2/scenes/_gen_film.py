#!/usr/bin/env python3
"""«Мысленный эксперимент» · Отдалённые места · board film, PART 2: chapter «ТОЧКА НЕМО».
FILM range 118.15–241.71 s (123.56 s). The renderer works in LOCAL time:  local = film − 118.15.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/remote_places/film.json (segs → captions).
One window is covered by another clip (3D map: Point Nemo and the three nearest lands at ≈ 2 690 km):
film 134.25–150.96 = local 16.10–32.81. Nothing important is drawn there and no sound events are written for it;
the board quietly gets the same ≈ 2 690 km circle and the three lands, so the wall matches the clip when it ends.
Map: tools/geo_sp.py → scenes/geo_sp.json (johan/world.geo.json, Natural Earth 1:110m, public domain), AZIMUTHAL EQUIDISTANT
projection centred on Point Nemo (distances from the point are true), K px per km.
Wall (board px, before the OX shift):
  row 1  (y  450…2060)  p6 the map + coordinates · p8 the station: 90 min, 16 sunrises, closer than land · p9 8 km/s, since Nov 2000
  row 2  (y 2650…3950)  p10 water, clouds, shadows · subscribe · parcels 6 days · p11 little life, ≈ 260 spacecraft · p12 Mir 2001, ISS later
Ink: graphite = names/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
G = json.load(open(os.path.join(HERE, 'geo_sp.json')))
R0, R1 = 118.15, 241.71
DUR = round(R1 - R0, 3)                       # 123.56
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(134.25), L(150.96))]
BW, BH = 11000, 4500

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
FS = 1.12                                     # all lettering a little larger than the first draft
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=round(size * FS), **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=round(size * FS), **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': list(a), 'to': list(b)}, lw=lw, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def credit(id, text, x, y, t, w, rot=-1):
    return el(type='card', id=id, xy=[x, y], w=w, h=56, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=27, x=20, y=9, color='grey', pass_=True)])
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def bez(p0, p1, p2, n=28):
    return [[(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]] for u in [i / n for i in range(n + 1)]]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85, quiet=False):
    if not quiet: ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def tick(x, y, t, s=1.0, color='graphite', lw=9):
    return line([[x - 34 * s, y - 6 * s], [x - 8 * s, y + 26 * s], [x + 44 * s, y - 40 * s]], t, .3, color, lw)

def moving(moves, pivot):
    """absolute targets [(t, d, (x, y))] → the kit's additive ink moves about `pivot`"""
    out, cur = [], list(pivot)
    for t, d, to in moves:
        out.append(dict(t=round(t, 3), d=round(d, 3), dx=round(to[0] - cur[0], 1), dy=round(to[1] - cur[1], 1), a=1.8, b=2.4)); cur = list(to)
        ev(t, 'slide', d)
    return dict(moves=out, pivot=[round(pivot[0], 1), round(pivot[1], 1)]) if out else {}
def station(c, s, t, color='graphite', moves=(), quiet=False, lw=6):
    """the station in marker: a truss, two pairs of solar wings, a small module"""
    x, y = c; k = moving(moves, c)
    line([[x - 95 * s, y], [x + 95 * s, y]], t, .15, color, lw, quiet=quiet, **k)
    for sx in (-1, 1):
        for j, off in enumerate((62, 88)):
            xx = x + sx * off * s
            line(rect(xx - 9 * s, y - 52 * s, xx + 9 * s, y + 52 * s), t + .12 + .06 * j + (.12 if sx > 0 else 0), .12, color, lw * .8, quiet=True, **k)
    line(rect(x - 18 * s, y - 14 * s, x + 18 * s, y + 14 * s), t + .4, .12, color, lw * .8, quiet=True, fill='grey', fillA=.2, **k)
def ship(c, s, t, color='graphite', quiet=False, lw=7):
    """a small ship side-on: hull, cabin, mast"""
    x, y = c
    line([[x - 70 * s, y - 22 * s], [x + 80 * s, y - 22 * s], [x + 55 * s, y + 12 * s], [x - 55 * s, y + 12 * s], [x - 70 * s, y - 22 * s]], t, .3, color, lw, quiet=quiet, fill='grey', fillA=.15)
    line(rect(x - 30 * s, y - 52 * s, x + 18 * s, y - 22 * s), t + .3, .15, color, lw * .8, quiet=True)
    line([[x + 40 * s, y - 22 * s], [x + 40 * s, y - 80 * s]], t + .45, .1, color, lw * .8, quiet=True)
def person(c, s, t, color='graphite', lw=6, quiet=True):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .08, color, lw, quiet=quiet)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .08, .06, color, lw, quiet=True)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .12, .06, color, lw, quiet=True)
    line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .16, .05, color, lw, quiet=True)
def sunrise(c, s, t, quiet=True):
    x, y = c
    line([[x - 24 * s, y], [x + 24 * s, y]], t, .06, 'graphite', 4, quiet=quiet)
    line(arc((x, y), 12 * s, 12 * s, 180, 360, 10), t + .05, .08, 'blue', 5, quiet=True)

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ТОЧКА НЕМО', 118.15, hard=True)     # the part opens on black

# ===================================================================== ROW 1 · the map
# --- p6 119.15–133.70: coordinates ≈ 49° S, 123° W; even a ship here: help comes from afar, many days to any shore
K = .2
FR = G['frame']; MX0, MY0 = 450, 640                     # board position of the map frame's top-left corner
P = lambda q: [MX0 + K * (q[0] - FR[0]), MY0 + K * (q[1] - FR[1])]
NEMO = P([0, 0]); MX1, MY1 = P([FR[2], FR[3]])
line(rect(MX0, MY0, MX1, MY1), L(119.2), .7, 'graphite', 4, quiet=True)
coasts = sorted(G['coasts'], key=lambda r: -len(r)); tt = L(119.5)
for i, r in enumerate(coasts):
    line([P(q) for q in r], tt, .12 if len(r) < 10 else .25, 'graphite', 5, quiet=(i > 0)); tt += .04
write('Тихий океан', MX0 + 60, MY0 + 110, L(119.7), .7, 'grey', 52)
write('Новая Зеландия', MX0 + 30, MY1 - 30, L(120.2), .7, 'grey', 40)
write('Южная Америка', MX1 - 30, MY1 - 300, L(120.4), .7, 'grey', 40, align='right')
write('Антарктида', NEMO[0] + 200, MY1 - 25, L(120.6), .5, 'grey', 40)
line(circle(NEMO, 11, 12), L(119.3), .1, 'graphite', 12, fill='grey', fillA=.9)
ink('ring', L(119.45), .35, 'graphite', c=NEMO, r=34, lw=6)
tag('точка Немо', NEMO[0] - 430, NEMO[1] - 110, L(119.6), size=50, rot=-1.5)
COLX = MX1 + 150
write('координаты точки:', COLX, 760, L(119.25), 1.0, 'graphite', 70)
line([P(q) for q in G['parallel']], L(120.5), 1.6, 'blue', 5, dash=[18, 14])
count('≈ {0}° ю. ш.', [49], COLX, 900, L(120.6), 1.8, size=96)
write('широта', COLX + 520, 895, L(122.0), .5, 'grey', 46)
line([[NEMO[0], MY0 + 8], [NEMO[0], MY1 - 8]], L(123.1), 1.0, 'blue', 5, dash=[18, 14])
count('≈ {0}° з. д.', [123], COLX, 1030, L(123.2), 1.8, size=96)
write('долгота', COLX + 560, 1025, L(125.3), .5, 'grey', 46)
ship((NEMO[0] + 8, NEMO[1] - 62), 1.0, L(126.6))
write('даже если здесь корабль —', COLX, 1260, L(126.8), 1.4, 'graphite', 60)
write('помощь придёт издалека', COLX, 1350, L(129.0), 1.4, 'graphite', 60)
SH = {'nz': P([-4250, 1380]), 'sa': P([3350, 1450]), 'an': P([-60, 2470])}
for i, k_ in enumerate(('nz', 'sa', 'an')):
    a = SH[k_]; f = .13
    arrow([NEMO[0] + (a[0] - NEMO[0]) * f, NEMO[1] + (a[1] - NEMO[1]) * f], a, L(130.8) + .35 * i, .6, 'graphite', 6, dash=[16, 12], quiet=(i > 0))
write('к любому берегу —', COLX, 1500, L(130.9), 1.0, 'graphite', 60)
write('много суток пути', COLX, 1590, L(132.0), 1.1, 'blue', 64)

# --- (cover 134.25–150.96, the 3D map clip) the same ≈ 2 690 km circle and the three nearest lands, no sound
RC = 2690 * K
line(circle(NEMO, RC, 72), L(136.0), 2.2, 'blue', 5, dash=[20, 14], quiet=True)
dim(NEMO, [NEMO[0] + RC * math.cos(math.radians(-20)), NEMO[1] + RC * math.sin(math.radians(-20))], L(137.0), .8, lw=5, quiet=True)
count('≈ {0} км', [2690], NEMO[0] + 260, NEMO[1] - 140, L(137.5), 1.2, size=50, sep=True, quiet=True)
for i, (k_, nm, dx, al) in enumerate((('ducie', 'Дюси', -30, 'right'), ('motunui', 'Моту-Нуи', 30, 'left'), ('maher', 'Махер', 30, 'left'))):
    q = P(G['pts'][k_][:2])
    line(circle(q, 9, 12), L(140.4) + 3 * i, .1, 'graphite', 10, fill='grey', fillA=.9, quiet=True)
    write(nm, q[0] + dx, q[1] + (16 if k_ != 'maher' else -18), L(140.5) + 3 * i, .5, 'graphite', 44, align=al, quiet=True)

# ===================================================================== ROW 1 · the station (p8, p9)
# --- p8 151.73–169.13: back to the cosmonauts; one orbit ≈ 90 minutes, 16 sunrises a day; passing over this area, the people
#     on board are closer to the point than anyone on land; but only at the moment of the pass
write('вернёмся к космонавтам', 3950, 560, L(151.85), 1.3, 'graphite', 70)
printd('iss', 'print_iss', 4380, 930, L(152.1), w=820, rot=-1.5, size='mid')
magnet(4060, 690, L(152.55), r=20); magnet(4700, 680, L(152.65), r=20)
credit('cred_iss', 'МКС, снимок с «Союза», 2018 · NASA', 4380, 1268, L(152.8), 640)
EC = (5330, 920)
line(circle(EC, 220, 56), L(153.6), .8, 'graphite', 8, fill='grey', fillA=.10)
write('Земля', EC[0], EC[1] + 18, L(154.0), .4, 'grey', 50, align='center')
line(arc(EC, 310, 310, -150, 195, 60), L(154.2), 1.4, 'blue', 6, arrow=True)
station((EC[0] + 310 * math.cos(math.radians(-150)), EC[1] + 310 * math.sin(math.radians(-150))), .45, L(154.0), quiet=True, lw=5)
write('один оборот вокруг Земли', 5730, 700, L(153.7), 1.6, 'graphite', 60)
count('≈ {0} минут', [90], 5730, 830, L(155.9), 1.6, size=96)
count('{0} восходов в сутки', [16], 5730, 1000, L(158.1), 1.6, size=70)
for i in range(16):
    sunrise((5760 + i * 58, 1100), 1.0, L(158.3) + i * .1, quiet=(i > 0))
# the pass over the area: station path, ocean surface, the point, the land far away
write('над этим районом:', 3950, 1440, L(160.65), 1.1, 'graphite', 62)
line(bez([3990, 1650], [5370, 1540], [6740, 1650]), L(160.7), 1.0, 'grey', 4, dash=[14, 12], quiet=True)
line(bez([3990, 1910], [5370, 1810], [6740, 1910]), L(160.9), 1.0, 'blue', 7)
NX = 5000; NY = 1910 - 2 * (NX - 3990) / 2750 * (1 - (NX - 3990) / 2750) * 200 + 0
def surf_y(x): u = (x - 3990) / 2750; return (1 - u) ** 2 * 1910 + 2 * u * (1 - u) * 1810 + u * u * 1910
def path_y(x): u = (x - 3990) / 2750; return (1 - u) ** 2 * 1650 + 2 * u * (1 - u) * 1540 + u * u * 1650
NY = surf_y(NX)
line(circle((NX, NY), 10, 12), L(161.4), .1, 'graphite', 12, fill='grey', fillA=.9)
write('точка Немо', NX, NY + 85, L(161.5), .6, 'graphite', 50, align='center')
LX = 6480
line([[LX - 160, surf_y(LX - 160)], [LX - 90, surf_y(LX) - 50], [LX + 20, surf_y(LX) - 62], [LX + 120, surf_y(LX) - 40], [LX + 200, surf_y(LX + 200)]],
     L(162.0), .5, 'graphite', 7, fill='grey', fillA=.2)
person((LX + 10, surf_y(LX) - 64), 1.0, L(162.4))
write('суша', LX + 20, surf_y(LX) + 85, L(162.6), .4, 'graphite', 50, align='center')
S0 = (4250, path_y(4250)); S1 = (NX, path_y(NX)); S2 = (5900, path_y(5900))
station(S0, .5, L(160.8), moves=[(L(161.2), 1.6, S1), (L(167.3), 1.5, S2)])
write('станция', 4250, 1585, L(161.0), .5, 'graphite', 46, align='center', out=L(162.6))
dim([NX, S1[1] + 45], [NX, NY - 25], L(163.3), .6, lw=6)
dim([NX + 60, 1760], [LX - 170, 1760], L(165.3), 1.0, lw=6)
count('≈ {0} км до суши', [2690], (NX + LX) / 2 - 40, 1735, L(165.5), 1.2, size=50, sep=True, align='center')
write('люди на борту ближе к точке,', 5180, 1440, L(163.3), 1.7, 'graphite', 58)
write('чем любой человек на суше', 5180, 1520, L(165.3), 1.6, 'graphite', 58)
write('но лишь в момент пролёта', 3950, 2045, L(167.25), 1.5, 'red', 60)

# --- p9 169.68–189.06: ≈ 8 km/s; people aboard continuously since November 2000; so «the nearest people» holds almost always:
#     there is no empty station over the ocean; but it is an estimate, not a measurement, and a ship nearby cancels it
SP = (7330, 690)
station(SP, .55, L(169.75))
for i, yy in enumerate((-30, 0, 30)):
    line([[SP[0] - 150, SP[1] + yy], [SP[0] - 75, SP[1] + yy]], L(170.3) + .08 * i, .15, 'grey', 5, quiet=True)
arrow([SP[0] + 75, SP[1]], [SP[0] + 420, SP[1]], L(170.6), .6, 'blue', 7)
write('скорость', 7850, 600, L(169.9), .7, 'graphite', 62)
count('≈ {0} км/с', [8], 7850, 740, L(171.95), 1.4, size=110)
write('люди живут на ней непрерывно', 7150, 900, L(173.9), 1.6, 'graphite', 64)
arrow([7150, 1060], [9900, 1060], L(174.6), 1.0, 'graphite', 7)
line([[7150, 1030], [7150, 1090]], L(174.6), .1, 'graphite', 7, quiet=True)
for i in range(9):
    person((7420 + i * 290, 1040), .75, L(175.0) + i * .14)
write('с ноября 2000 года', 7150, 1160, L(176.1), 1.3, 'blue', 62)
write('сегодня', 9900, 1160, L(177.2), .5, 'graphite', 54, align='right')
T9 = tag('«ближайшие люди»', 7150, 1370, L(178.0), size=62, rot=-1.5, strike=dict(t=L(188.3), d=.35, color='red'))
write('справедливы почти всегда:', 7150, 1530, L(180.1), 1.4, 'graphite', 60)
write('пустой станции над океаном не бывает', 7150, 1620, L(181.95), 2.0, 'graphite', 60)
el(type='stamp', text='ПРИКИДКА', xy=[7480, 1820], size=84, rot=-5, t=L(184.6), color='red'); ev(L(184.6), 'stamp', .2)
write('а не измерение', 7880, 1850, L(185.4), 1.0, 'graphite', 62)
ship((9300, 1450), 1.1, L(186.8))
line(bez([9180, 1495], [9300, 1510], [9440, 1495]), L(187.2), .3, 'blue', 5, quiet=True)
write('корабль поблизости', 9300, 1580, L(187.1), .9, 'graphite', 52, align='center')
write('её отменит', 9300, 1660, L(187.9), .6, 'red', 52, align='center')

# ===================================================================== ROW 2 · ocean, parcels, the cemetery, Mir
# --- p10 189.61–205.91: no landmarks from orbit over the ocean: water, clouds and their shadow; subscribe — even on Tristan,
#     which comes near the end; parcels go there by ship, six days
write('над океаном ориентиров', 450, 2760, L(189.7), 1.2, 'graphite', 68)
write('почти не различить:', 450, 2850, L(191.0), 1.0, 'graphite', 68)
PO = dict(x=1000, y=3340, w=1000); PH = PO['w'] * 888 / 1200
printd('ocean', 'print_ocean', PO['x'], PO['y'], L(192.0), w=PO['w'], rot=1, size='mid')
magnet(PO['x'] - 380, PO['y'] - PH / 2 + 30, L(192.45), r=20); magnet(PO['x'] + 380, PO['y'] - PH / 2 + 25, L(192.55), r=20)
credit('cred_ocean', 'облака над Тихим океаном, шаттл, 1992 · NASA', PO['x'], PO['y'] + PH / 2 + 62, L(192.7), 820)
pp = lambda fx, fy: [PO['x'] + (fx - .5) * PO['w'], PO['y'] + (fy - .5) * PH]
for i, (lbl, col, y, fx, fy, tt) in enumerate((('вода', 'blue', 3080, .50, .17, L(193.4)), ('облака', 'graphite', 3280, .80, .52, L(193.95)),
                                               ('и их тень', 'graphite', 3480, .30, .64, L(194.6)))):
    write(lbl, 1620, y, tt, .5, col, 60)
    arrow([1600, y - 20], pp(fx, fy), tt + .2, .5, col, 5, onPrint=True, quiet=True)
write('подпишитесь —', 2050, 2800, L(195.45), 1.0, 'graphite', 70)
write('новый ролик найдёт вас', 2050, 2900, L(196.4), 1.3, 'graphite', 60)
write('даже на Тристане', 2050, 2990, L(197.9), 1.2, 'graphite', 60)
tag('о нём — ближе к концу', 2060, 3120, L(199.4), size=50, rot=1)
BX, BY = 2160, 3400
line(rect(BX - 80, BY - 60, BX + 80, BY + 60), L(201.75), .4, 'graphite', 7, fill='grey', fillA=.15)
line([[BX, BY - 60], [BX, BY + 60]], L(202.1), .1, 'graphite', 5, quiet=True)
line([[BX - 80, BY], [BX + 80, BY]], L(202.2), .1, 'graphite', 5, quiet=True)
write('посылки', BX, BY + 130, L(202.0), .5, 'graphite', 50, align='center')
line([[BX + 110, BY + 10], [3020, BY + 10]], L(202.6), .8, 'blue', 6, dash=[18, 12], arrow=True)
ship((2620, BY - 25), .8, L(202.8))
IX = 3150
line([[IX - 110, BY + 40], [IX - 50, BY - 20], [IX, BY - 50], [IX + 60, BY - 15], [IX + 110, BY + 40]], L(203.3), .4, 'graphite', 7, fill='grey', fillA=.2)
line([[IX - 150, BY + 40], [IX + 150, BY + 40]], L(203.6), .2, 'blue', 5, quiet=True)
write('Тристан', IX, BY + 130, L(203.4), .5, 'graphite', 50, align='center')
write('идут кораблём:', 2050, 3700, L(203.25), .9, 'graphite', 62)
count('{0} суток', [6], 2050, 3840, L(204.4), 1.2, size=110)

# --- p11 206.46–220.98: little life at Point Nemo (by the descriptions): the water is poor in nutrients; but the area has another fame:
#     used-up spacecraft are sent here; by estimates there are about 260 of them
WX0, WX1, WY0, WY1 = 3800, 4650, 2860, 3860
line([[WX0 + i * (WX1 - WX0) / 24, WY0 + 14 * math.sin(i * math.pi / 3)] for i in range(25)], L(206.5), .7, 'blue', 6)
line([[WX0, WY1], [WX1, WY1]], L(206.8), .3, 'graphite', 6, dash=[16, 12], quiet=True)
for x in (WX0, WX1):
    line([[x, WY0 + 30], [x, WY1]], L(206.9), .3, 'grey', 4, dash=[10, 14], quiet=True)
FC = (4230, 3330)
line(circle(FC, [60, 26], 30), L(207.3), .4, 'graphite', 6, fill='grey', fillA=.15)
line([[FC[0] + 58, FC[1]], [FC[0] + 100, FC[1] - 28], [FC[0] + 100, FC[1] + 28], [FC[0] + 58, FC[1]]], L(207.7), .2, 'graphite', 6, quiet=True)
line(circle((FC[0] - 30, FC[1] - 6), 4, 8), L(207.9), .05, 'graphite', 6, quiet=True)
rnd = random.Random(11)
dots = [dict(points=[[x, y], [x + 4, y + 3]], t=round(L(210.0) + i * .12, 3), d=.05, lw=8)
        for i, (x, y) in enumerate([(WX0 + 70 + rnd.random() * 700, WY0 + 120 + rnd.random() * 820) for _ in range(9)])]
strokes_el(dots, L(210.0), 1.1, 'blue', 8, .7)
write('жизни очень мало', 4800, 2790, L(206.55), 1.2, 'graphite', 72)
write('(по описаниям)', 4800, 2875, L(208.0), .9, 'grey', 52)
write('вода бедна', 4800, 3010, L(209.75), .8, 'graphite', 62)
write('питательными веществами', 4800, 3095, L(210.55), 1.5, 'graphite', 62)
write('зато у района другая слава:', 4800, 3250, L(212.35), 1.6, 'graphite', 64)
write('сюда уводят отработавшие', 4800, 3390, L(214.35), 1.5, 'graphite', 62)
write('космические аппараты', 4800, 3475, L(216.0), 1.4, 'graphite', 62)
TG = (6450, 3560)
for i, (p0, p1) in enumerate((([6650, 2700], [6900, 3000]), ([6980, 2800], [7020, 3250]), ([6300, 2700], [6520, 3050]))):
    line(bez(p0, p1, TG), L(214.6) + .45 * i, .8, 'graphite', 5, dash=[16, 12], arrow=True, quiet=(i > 0))
    line(circle(p0, 9, 10), L(214.5) + .45 * i, .08, 'graphite', 10, fill='grey', fillA=.9, quiet=True)
rnd = random.Random(260); bits = []
for i in range(260):
    a = rnd.random() * 2 * math.pi; r = math.sqrt(rnd.random())
    x, y = TG[0] + 250 * r * math.cos(a), TG[1] + 120 + 130 * r * math.sin(a); b = rnd.random() * math.pi; l = 9 + rnd.random() * 9
    bits.append(dict(points=[[round(x, 1), round(y, 1)], [round(x + l * math.cos(b), 1), round(y + l * math.sin(b), 1)]], t=round(L(218.1) + 2.4 * i / 260, 3), d=.04, lw=4))
strokes_el(bits, L(218.1), 2.4, 'graphite', 4, .8)
write('по оценкам, их там', 4800, 3640, L(218.0), 1.2, 'graphite', 58)
count('≈ {0}', [260], 4800, 3830, L(219.0), 1.8, size=130)

# --- p12 221.53–239.55: the most notable guests: debris; Mir was sunk in the South Pacific in 2001; the ISS is also planned to go there at
#     the end of its service life; a controlled fall is aimed where it harms no one
write('самые заметные гости: обломки', 7450, 2760, L(221.6), 2.2, 'graphite', 68)
printd('mir', 'print_mir', 7860, 3330, L(224.35), w=740, rot=-1.5, size='mid')
magnet(7600, 3010, L(224.8), r=20); magnet(8120, 3000, L(224.9), r=20)
credit('cred_mir', 'станция «Мир», 1995 · NASA', 7860, 3740, L(225.0), 520)
write('«Мир» затопили', 8400, 2930, L(224.45), 1.2, 'graphite', 64)
write('в южной части Тихого океана', 8400, 3015, L(226.9), 1.9, 'graphite', 58)
write('в 2001 году', 8400, 3130, L(229.0), 1.0, 'blue', 84)
SS = (8520, 3290)
station(SS, .5, L(229.45))
write('МКС тоже планируют туда', 8400, 3460, L(230.0), 1.6, 'graphite', 58)
write('в конце срока службы', 8400, 3540, L(232.0), 1.6, 'graphite', 58)
TT = [10000, 3640]
line(bez([SS[0] + 80, SS[1] + 10], [9750, 3240], [TT[0] - 10, TT[1] - 50]), L(232.6), 1.2, 'graphite', 5, dash=[16, 12], arrow=True)
write('управляемое падение целят туда,', 8400, 3700, L(235.15), 1.9, 'graphite', 58)
write('где оно никому не навредит', 8400, 3780, L(237.4), 1.8, 'red', 58)
ink('ring', L(235.4), .45, 'red', c=TT, r=48, lw=7)
ink('ring', L(235.8), .5, 'red', c=TT, r=96, lw=6)
line(circle(TT, 9, 10), L(236.2), .08, 'red', 12, fill='red', fillA=.9, quiet=True)

# ===================================================================== camera (one continuous camera; the card hides the start)
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

MAPBOX = [400, 600, 3780, 1980]
c = Cam(*fit(MAPBOX))
c.to(L(119.3), 6.0, z=z_of(c) * 1.03)
c.fit(L(126.2), 1.2, [1000, 600, 3780, 1700], b=3)                     # the ship and the column
c.to(L(127.5), 2.8, z=z_of(c) * 1.02)
c.fit(L(130.5), 1.2, MAPBOX, b=3)                                       # arrows to every shore
c.to(L(131.8), 3.5, z=z_of(c) * 1.02)
c.to(L(135.0), 12.0, z=z_of(c) * 1.05)                                  # (under the clip) slow drift
c.fit(L(149.0), 1.8, MAPBOX, b=3)                                       # (under the clip) back to the whole map, circle drawn
c.fit(L(151.5), 1.4, [3880, 440, 6780, 1340], b=2.8)                   # the station: 90 min, 16 sunrises
c.to(L(153.0), 7.0, z=z_of(c) * 1.02)
c.fit(L(160.3), 1.2, [3880, 1360, 6780, 2110], b=3)                    # the pass over the area
c.to(L(161.6), 7.6, z=z_of(c) * 1.03)
c.fit(L(169.3), 1.4, [7080, 480, 9980, 1250], b=2.8)                   # 8 km/s, since November 2000
c.to(L(170.8), 6.7, z=z_of(c) * 1.02)
c.fit(L(177.6), 1.3, [7080, 1250, 9980, 1960], b=3)                    # «the nearest people», the estimate, the ship
c.to(L(179.0), 9.5, z=z_of(c) * 1.02)
c.fit(L(189.1), 1.6, [380, 2650, 3400, 3900], b=2.8)                   # row 2: water, clouds, parcels
c.to(L(190.8), 13.0, z=z_of(c) * 1.03)
c.fit(L(205.9), 1.5, [3700, 2680, 7100, 3880], b=2.8)                  # little life, ≈ 260 spacecraft
c.to(L(207.5), 13.0, z=z_of(c) * 1.03)
c.fit(L(221.0), 1.4, [7380, 2680, 10150, 3880], b=2.8)                 # Mir, the ISS, the aim
c.to(L(222.5), 16.8, z=z_of(c) * 1.03)
c.fit(L(239.65), 2.0, [300, 380, 10250, 3980], b=3)                    # chapter pull-back

# the whole wall sits OX px further right (keeps the board's left frame out of the opening shots)
OX = 600
def shift(e, dx):
    for k in ('xy', 'c', 'pivot') + (('from', 'to') if e.get('kind') == 'dim' or e['type'] == 'ruler' else ()):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx
for e in E: shift(e, OX)
c.base['x'] += OX; BW += OX

EV = [e for e in EV if e['type'] == 'key' or not any(a - .05 < e['t'] < b for a, b in COVER)]
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=61, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
