#!/usr/bin/env python3
"""«Мысленный эксперимент» · Отдалённые места · board film, PART 3: chapter «ДРУГИЕ КРАЙНОСТИ».
FILM range 241.71–343.74 s (102.03 s). The renderer works in LOCAL time:  local = film − 241.71.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/remote_places/film.json (segs → captions).
Film time 316.65–341.59 is covered by an Archive Light Table clip (Trieste 1960, HMS Challenger): only quiet notes there.
Maps: tools/geo.py (johan/world.geo.json, public domain, Natural Earth 1:110m) → scenes/geo.json. Every map is an
azimuthal EQUIDISTANT projection centred on the place it is about (distances from the centre are true).
Wall (board px, before the OX shift):
  row 1  (y  430…2100)  p13  the Arctic pole on drifting ice (+ the 2013 shift, inset ×10) · Antarctica, the Lenin bust, 2021
                        p14  the Eurasian pole (NW China, ≈2600 km) · sea ≠ people
  row 2  (y 2600…4400)  p14  Bouvet ≈1700 km from Antarctica · p15 Bouvet: ≈90 % glacier, no residents, Norway 1928,
                             1979 double flash, «?» · p16 the depth: Challenger Deep ≈ 11 km, Everest drawn at the same
                             scale for a sense of size
Ink: graphite = names, rules, facts · blue = measurement, numbers, water · red = only the one break per beat.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
GEO = json.load(open(os.path.join(HERE, 'geo.json')))
R0, R1 = 241.71, 343.74
DUR = round(R1 - R0, 3)                       # 102.03
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 12000, 5300

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=size, **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=size, **k)
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
def credit(id, text, x, y, w, t, rot=-1):
    el(type='card', id=id, xy=[x, y], w=w, h=60, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
       lines=[dict(text=text, font='mono', size=29, x=22, y=10, color='grey', pass_=True)])
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='graphite', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85):
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def cross(x, y, t, s=40, color='graphite', lw=8):
    line([[x - s, y - s], [x + s, y + s]], t, .15, color, lw); line([[x + s, y - s], [x - s, y + s]], t + .17, .15, color, lw)
def spot(p, t, color='graphite', r=16):   # a place on a map: dot + small ring
    line(circle(p, 6, 10), t, .08, color, 12, quiet=True); line(circle(p, r + 10, 26), t + .1, .25, color, 6)
def person(x, y, t, s=1.0, color='graphite', lw=7):   # a stick figure standing on (x, y)
    line(circle((x, y - 150 * s), 22 * s, 16), t, .15, color, lw, quiet=True)
    line([[x, y - 125 * s], [x, y - 55 * s]], t + .15, .1, color, lw, quiet=True)
    line([[x - 32 * s, y - 100 * s], [x, y - 112 * s], [x + 32 * s, y - 100 * s]], t + .25, .1, color, lw, quiet=True)
    line([[x - 26 * s, y], [x, y - 55 * s], [x + 26 * s, y]], t + .35, .12, color, lw)
def burst(c, r, t, color='graphite', lw=6, n=8):
    for i in range(n):
        a = 2 * math.pi * i / n + .2
        line([[c[0] + r * .35 * math.cos(a), c[1] + r * .35 * math.sin(a)], [c[0] + r * math.cos(a), c[1] + r * math.sin(a)]], t + i * .03, .08, color, lw, quiet=(i > 0))
def wave(x0, y, w, t, d, color='blue', lw=7, amp=16, n=4):
    pts = [[x0 + w * i / 48, y + amp * math.sin(2 * math.pi * n * i / 48)] for i in range(49)]
    return line(pts, t, d, color, lw)

def mapdraw(m, O, K, t, d, color='graphite', lw=6, fill=None, fillA=.10):
    """draw the map's lines (board = O + K·km), one after another over d (by length), longest first"""
    P = lambda p: [O[0] + K * p[0], O[1] + K * p[1]]
    ls = [[P(p) for p in l] for l in m['lines']]
    lens = [sum(math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]) for i in range(1, len(l))) for l in ls]
    order = sorted(range(len(ls)), key=lambda i: -lens[i]); tot = sum(lens); tt = t
    for i in order:
        dd = max(.03, d * lens[i] / tot); k = {}
        if fill and i in m['closed'] and lens[i] > 1500: k = dict(fill=fill, fillA=fillA)
        line(ls[i], tt, dd, color, lw, ea=1.3, eb=1.6, quiet=True, **k); tt += dd
    ev(t, 'stroke', d, color=color)
    return P

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
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=9):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ДРУГИЕ КРАЙНОСТИ', 241.71, hard=True)      # the part opens on black

def shift2(e, dx, dy):
    for k in ('xy', 'c', 'pivot') + (('from', 'to') if e.get('kind') == 'dim' or e['type'] == 'ruler' else ()):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1] + dy]
    if 'points' in e: e['points'] = [[x + dx, y + dy] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y + dy] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx; ex[1:] = [v + dy for v in ex[1:]]

# ===================================================================== ROW 1 · p13 242.71–266.72
# Arctic pole of inaccessibility on drifting ice, ~1000 km from land; 2013 measurements moved it ~200 km;
# Antarctica: linked to a former Soviet station, a Lenin bust stood there; a 2021 study: two poles can be counted
MA = GEO['arctic']; KA = .3; CA = (1300, 1250)
write('Арктический', 470, 560, L(242.75), .8, 'graphite', 76)
write('полюс недоступности', 470, 650, L(243.5), 1.0, 'graphite', 76)
line(circle(CA, 2700 * KA, 90), L(242.8), 1.0, 'grey', 4, dash=[18, 16], quiet=True)
PA = mapdraw(MA, CA, KA, L(242.9), 2.2, 'graphite', 6)
NEW, OLD, NP, NEAR = PA(MA['pts']['new']), PA(MA['pts']['old']), PA(MA['pts']['np']), PA(MA['near'])
line([[NP[0] - 14, NP[1]], [NP[0] + 14, NP[1]]], L(244.6), .1, 'grey', 5, quiet=True); line([[NP[0], NP[1] - 14], [NP[0], NP[1] + 14]], L(244.7), .1, 'grey', 5, quiet=True)
write('Северный полюс', NP[0] - 30, NP[1] + 14, L(244.8), .6, 'grey', 40, align='right')
# drifting ice: hatched floes west and south of the pole, two drift arrows
random.seed(7); st = []
for i in range(90):
    a = random.uniform(math.radians(95), math.radians(265)); r = random.uniform(90, 330)
    x, y = NEW[0] + r * math.cos(a), NEW[1] + .85 * r * math.sin(a)
    if abs(y - NP[1]) < 40 and x > NP[0] - 380: continue
    st.append(dict(points=[[round(x, 1), round(y, 1)], [round(x + 26, 1), round(y - 18, 1)]], t=round(L(245.1) + i * .01, 3), d=.06))
strokes_el(st, L(245.1), .9, 'grey', 4, .6)
arrow([NEW[0] - 360, NEW[1] + 250], [NEW[0] - 220, NEW[1] + 190], L(245.6), .3, 'grey', 5)
arrow([NEW[0] - 300, NEW[1] - 150], [NEW[0] - 160, NEW[1] - 210], L(245.8), .3, 'grey', 5)
tag('дрейфующий лёд', 520, 2010, L(245.3), size=56, rot=-1.2)
spot(NEW, L(244.95), 'graphite')
dim(NEW, NEAR, L(246.4), 1.0)
count('≈ {0} км', [1000], NEW[0] + 50, NEW[1] + 110, L(246.9), 1.4, size=70, sep=True, align='left')
write('до суши', NEW[0] + 50, NEW[1] + 185, L(247.6), .7, 'graphite', 56)
# inset ×10: the 2013 shift (≈195 km between the earlier point and the 2013 point)
MID = [(NEW[0] + OLD[0]) / 2, (NEW[1] + OLD[1]) / 2]; KI = 10.0; IC = (2780, 1260); H = 430
mb = [MID[0] - H / KI, MID[1] - H / KI, MID[0] + H / KI, MID[1] + H / KI]
line(rect(*mb), L(248.8), .3, 'graphite', 4)
line(rect(IC[0] - H, IC[1] - H, IC[0] + H, IC[1] + H), L(249.0), .6, 'graphite', 5)
line([[mb[2], mb[1]], [IC[0] - H, IC[1] - H]], L(249.3), .3, 'grey', 3, dash=[12, 10], quiet=True)
line([[mb[2], mb[3]], [IC[0] - H, IC[1] + H]], L(249.4), .3, 'grey', 3, dash=[12, 10], quiet=True)
I = lambda p: [IC[0] + KI * (p[0] - MID[0]), IC[1] + KI * (p[1] - MID[1])]
iN, iO = I(NEW), I(OLD)
tag('современные измерения', IC[0] - H, IC[1] - H - 110, L(248.9), size=54, rot=-1)
count('{0}', [2013], IC[0] - H + 40, IC[1] - H + 110, L(251.0), 1.2, size=84, align='left')
spot(iO, L(250.2), 'grey'); write('прежнее', iO[0] + 50, iO[1] + 15, L(250.4), .6, 'grey', 48)
arrow(iO, iN, L(252.4), .8, 'blue', 7)
spot(iN, L(253.1), 'graphite'); write('новое', iN[0] + 50, iN[1] + 15, L(253.3), .4, 'graphite', 50)
count('≈ {0} км', [200], (iO[0] + iN[0]) / 2 - 50, IC[1] + 20, L(253.6), 1.3, size=74, align='right')
write('сдвинули', (iO[0] + iN[0]) / 2 - 50, IC[1] + 95, L(254.6), .5, 'graphite', 50, align='right')

i0 = len(E)
MS = GEO['antarctica']; KS = .21; CS = (4250, 1250)
PS = mapdraw(MS, CS, KS, L(255.9), 1.6, 'graphite', 6, fill='grey', fillA=.08)
tag('Антарктида', 3560, 560, L(256.0), size=60, rot=1.2)
STN = PS(MS['pts']['station'])
spot(STN, L(257.3), 'graphite')
write('бывшая советская', STN[0] - 330, STN[1] + 110, L(257.6), .8, 'graphite', 54)
write('станция', STN[0] - 330, STN[1] + 180, L(258.4), .4, 'graphite', 54)
printd('lenin', 'print_lenin', 5820, 950, L(258.3), w=1000, rot=1.2, size='mid')
magnet(5370, 690, L(258.75), r=20); magnet(6270, 700, L(258.85), r=20)
credit('cred_lenin', 'станция «Полюс недоступности», 2007 · Cookson69 (Team N2i), CC BY-SA 3.0', 5820, 1320, 1180, L(259.0))
line([[STN[0] + 30, STN[1] - 10], [5300, 900]], L(258.5), .5, 'graphite', 4, dash=[14, 12])
write('бюст Ленина там стоял', 5330, 560, L(259.8), 1.3, 'graphite', 62)
arrow([5600, 590], [5617, 880], L(260.7), .3, 'graphite', 6)
tag('исследование 2021 года', 5330, 1520, L(261.4), size=56, rot=-1)
write('полюсов можно насчитать:', 5330, 1760, L(263.8), 1.4, 'graphite', 62)
count('{0}', [2], 6150, 1790, L(265.6), .6, size=140)
line(circle((6185, 1745), [70, 75], 30), L(266.2), .4, 'red', 6)
for e in E[i0:]: shift2(e, 350, 0)

# ===================================================================== ROW 1 · p14 267.42–278.88
# land record: Eurasia, NW China, ≈2600 km from the ocean; far from the sea ≠ far from people (two questions)
ME = GEO['eurasia']; KE = .2; OE = (8560, 1250)
PE = mapdraw(ME, OE, KE, L(267.5), 2.2, 'graphite', 6)
TX = 9980
write('на суше рекорд', TX, 600, L(267.5), .8, 'graphite', 62)
tag('Евразия', TX + 20, 730, L(268.0), size=64, rot=-1.2)
POLE = PE(ME['pts']['pole'])
spot(POLE, L(269.2), 'graphite')
write('северо-запад Китая', POLE[0] - 40, POLE[1] - 60, L(269.3), 1.0, 'graphite', 56, align='right')
A1, A2 = PE([2624.0, 337.3]), PE([403.3, 2601.9])        # coast ≈2 600 km away: the Yellow Sea side and the Bay of Bengal side
dim(POLE, A1, L(270.5), .9); dim(POLE, A2, L(271.0), .9)
count('≈ {0} км', [2600], POLE[0] - 60, POLE[1] + 120, L(271.0), 1.6, size=72, sep=True, align='right')
write('от океана', POLE[0] - 60, POLE[1] + 195, L(272.8), .6, 'graphite', 56, align='right')
write('далеко от моря', TX, 1100, L(273.6), 1.0, 'graphite', 70)
wave(TX + 560, 1080, 300, L(274.2), .5)
write('≠', TX + 300, 1300, L(275.2), .3, 'red', 110, align='center')
write('далеко от людей', TX, 1490, L(275.6), 1.0, 'graphite', 70)
for i in range(3): person(TX + 650 + i * 90, 1520, L(276.1) + i * .15, .55)
write('два разных вопроса', TX, 1720, L(277.0), 1.2, 'graphite', 70)

# ===================================================================== ROW 2 · p14 278.88–284.17
# in the ocean: Bouvet Island, ≈1700 km to the Antarctic coast
MB = GEO['bouvet']; KB = .27; OB = (1111, 3433)
PB = mapdraw(MB, OB, KB, L(278.9), 1.1, 'graphite', 6)
BV, BN = PB(MB['pts']['bouvet']), PB(MB['near'])
spot(BV, L(279.3), 'graphite')
tag('остров Буве', BV[0] + 60, BV[1] - 130, L(279.4), size=58, rot=1.2)
write('в океане', BV[0] - 60, BV[1] - 230, L(279.0), .6, 'graphite', 54, align='right')
dim(BV, BN, L(280.9), .9)
count('≈ {0} км', [1700], BV[0] + 70, (BV[1] + BN[1]) / 2 + 20, L(281.6), 1.6, size=70, sep=True, align='left')
write('до берега Антарктиды', BV[0] + 70, (BV[1] + BN[1]) / 2 + 95, L(282.0), 1.2, 'graphite', 50)
write('Антарктида', BN[0] - 300, BN[1] + 110, L(281.5), .6, 'grey', 46)
write('Африка', OB[0] + 1950 * KB, OB[1] - 2780 * KB, L(279.6), .4, 'grey', 46)

# ===================================================================== ROW 2 · p15 284.87–308.02 (laid out at y 4750…, moved up)
# almost all of Bouvet, ≈90 %, glacier; no permanent residents; Norway claimed it in 1928;
# 1979: a US satellite saw a double flash nearby; officially not determined: often thought a test, other versions too
i0 = len(E)
printd('bouvet', 'print_bouvet', 1000, 5230, L(285.0), w=1000, rot=-1.2, size='mid')
magnet(560, 4930, L(285.45), r=20); magnet(1440, 4920, L(285.55), r=20)
credit('cred_bouvet', 'остров Буве, снимок с МКС, 2008 · NASA', 1000, 5640, 760, L(285.7))
write('почти весь Буве', 500, 5830, L(285.4), .9, 'graphite', 60)
line(rect(500, 5890, 1400, 5980), L(286.4), .5, 'graphite', 6)
st = [dict(points=[[500 + i * 18, 5975], [530 + i * 18, 5895]], t=round(L(287.4) + i * .02, 3), d=.06, lw=5) for i in range(44)]
strokes_el(st, L(287.4), .9, 'blue', 5, .7)
count('≈ {0} %', [90], 1440, 5965, L(287.3), 1.4, size=84)
write('покрыт ледником', 500, 6080, L(288.3), .9, 'graphite', 60)
write('постоянных жителей нет', 500, 6260, L(289.4), 1.4, 'graphite', 60)
person(1350, 6290, L(290.0), .7); cross(1350, 6215, L(290.7), 70, 'graphite', 8)

tag('Норвегия', 1800, 4930, L(291.4), size=64, rot=-1.2)
write('объявила остров своим', 1780, 5150, L(292.3), 1.3, 'graphite', 62)
count('{0}', [1928], 1780, 5400, L(293.6), 1.4, size=140)
write('год', 2150, 5400, L(294.5), .3, 'graphite', 56)

tag('1979', 3080, 4930, L(296.1), size=64, rot=1.2)
SC = (3330, 5150)    # the satellite: body, two panels
line(rect(SC[0] - 40, SC[1] - 30, SC[0] + 40, SC[1] + 30), L(298.2), .3, 'graphite', 7, quiet=True)
line(rect(SC[0] - 170, SC[1] - 18, SC[0] - 55, SC[1] + 18), L(298.5), .25, 'graphite', 6, quiet=True)
line(rect(SC[0] + 55, SC[1] - 18, SC[0] + 170, SC[1] + 18), L(298.7), .25, 'graphite', 6, quiet=True)
line([[SC[0] - 55, SC[1]], [SC[0] - 40, SC[1]]], L(298.9), .05, 'graphite', 6, quiet=True)
line([[SC[0] + 40, SC[1]], [SC[0] + 55, SC[1]]], L(298.95), .05, 'graphite', 6)
write('американский спутник', 3080, 5330, L(298.4), 1.3, 'graphite', 58)
IS = (4050, 5520)
line(circle(IS, [55, 38], 20), L(300.0), .25, 'graphite', 6, fill='grey', fillA=.15)
write('Буве', IS[0], IS[1] + 95, L(300.1), .3, 'grey', 44, align='center')
line([[SC[0] + 120, SC[1] + 40], [IS[0] - 160, IS[1] - 150]], L(300.5), .5, 'graphite', 4, dash=[14, 12])
burst((IS[0] - 120, IS[1] - 120), 60, L(300.9)); burst((IS[0] + 30, IS[1] - 140), 60, L(301.2))
write('двойная вспышка', 3080, 5450, L(300.9), 1.0, 'graphite', 58)
write('?', 3120, 6290, L(302.2), .4, 'red', 230, align='center')
write('природа официально', 3260, 6020, L(302.3), 1.0, 'graphite', 58)
write('не установлена', 3260, 6100, L(303.3), .9, 'graphite', 58)
write('часто считают испытанием', 3260, 6220, L(304.6), 1.4, 'graphite', 58)
write('другие версии тоже звучали', 3260, 6330, L(306.3), 1.5, 'graphite', 58)
for e in E[i0:]: shift2(e, 1700, -2150)

# ===================================================================== ROW 2 · p16 308.73–316.65 (then the clip to 341.59)
# vertically, the deepest point of the ocean, the Challenger Deep, ≈ 11 km down (Everest drawn at the same scale)
i0 = len(E)
KD = 118.0; SEA = 4990; BOT = SEA + 11 * KD                    # 11 km → 1298 px
write('по вертикали', 4700, 4880, L(308.8), .8, 'graphite', 62)
wave(4700, SEA, 1700, L(309.2), .9, 'blue', 7, 10, 9)
write('поверхность океана', 5960, SEA - 40, L(309.7), .8, 'blue', 46)
floor = [[5330, 5600], [5480, 5580], [5600, 5640], [5690, 5900], [5750, 6150], [5790, BOT], [5830, BOT - 4], [5875, 6120], [5950, 5800],
         [6060, 5640], [6230, 5610], [6400, 5590]]
line(floor, L(310.0), 1.2, 'graphite', 8)
spot([5810, BOT - 2], L(311.4), 'graphite', 12)
tag('Бездна Челленджера', 5900, BOT + 40, L(311.6), size=56, rot=-1)
dim([6470, SEA], [6470, BOT], L(313.4), 1.2, lw=8)
line([[5830, BOT], [6500, BOT]], L(313.4), .4, 'blue', 3, dash=[12, 10], quiet=True)
count('≈ {0} км', [11], 6040, 5290, L(314.0), 1.3, size=110)
write('вниз', 6120, 5400, L(315.0), .5, 'graphite', 62)
# Everest at the same scale (8.85 km), standing on the same depth: a familiar height for size
EH = 8.85 * KD; EX = 4980
ever = [[4700, BOT], [4780, BOT - EH * .3], [4850, BOT - EH * .5], [4910, BOT - EH * .78], [EX, BOT - EH], [5040, BOT - EH * .84],
        [5090, BOT - EH * .7], [5170, BOT - EH * .42], [5260, BOT]]
line(ever, L(311.9), .9, 'graphite', 7, fill='grey', fillA=.12)
line([[4700, BOT], [5790, BOT]], L(312.6), .4, 'grey', 4, dash=[14, 12], quiet=True)
write('Эверест', EX, BOT + 70, L(312.6), .6, 'graphite', 52, align='center')
write('в том же масштабе', EX, BOT + 130, L(313.0), .8, 'grey', 40, align='center')
# under the archive clip (316.65–341.59): quiet notes, so the wall is whole at the pull-back
write('1960 · 2012 · 2019 …', 5330, 5370, L(320.5), 1.5, 'graphite', 44)
write('спускались считаные единицы', 5330, 5440, L(325.5), 1.5, 'graphite', 44)
write('«Челленджер», 1875: первый замер', 4700, 6450, L(332.0), 1.5, 'grey', 40)
write('вниз и вверх одинаково безлюдно', 4700, 4760, L(337.5), 1.6, 'graphite', 54)
for e in E[i0:]: shift2(e, 1900, -2150)

# ===================================================================== camera (one continuous camera; the card hides the jump)
c = Cam(*fit([430, 470, 2300, 2080]))
c.to(L(242.0), 3.5, z=z_of(c) * 1.03)
c.fit(L(246.0), 2.3, [430, 470, 2400, 2080], b=3)
c.fit(L(248.5), 1.4, [430, 470, 3260, 2080], b=2.8)                      # + the 2013 inset
c.to(L(250.0), 5.4, z=z_of(c) * 1.02)
c.fit(L(255.5), 1.4, [3800, 450, 6950, 2080], b=2.8)                     # Antarctica, the bust
c.to(L(257.0), 4.0, z=z_of(c) * 1.02)
c.fit(L(261.1), 1.2, [3800, 450, 6950, 2080], b=3)
c.to(L(262.4), 4.6, z=z_of(c) * 1.02)
c.fit(L(267.0), 1.6, [7250, 430, 10700, 2100], b=2.8)                    # Eurasia
c.to(L(268.7), 4.4, z=z_of(c) * 1.02)
c.fit(L(273.2), 1.2, [8000, 430, 11000, 2100], b=3)                      # + two questions
c.to(L(274.5), 4.0, z=z_of(c) * 1.02)
c.fit(L(278.5), 1.6, [430, 2560, 2300, 4150], b=2.8)                     # Bouvet on the map
c.to(L(280.2), 4.2, z=z_of(c) * 1.02)
c.fit(L(284.5), 1.4, [2100, 2560, 4700, 4250], b=2.8)                    # Bouvet: print, glacier, Norway
c.to(L(286.0), 9.6, z=z_of(c) * 1.02)
c.fit(L(295.7), 1.4, [3400, 2560, 6200, 4250], b=2.8)                    # 1979, «?»
c.to(L(297.2), 10.9, z=z_of(c) * 1.02)
c.fit(L(308.3), 1.5, [6450, 2480, 8500, 4380], b=2.8)                    # the depth
c.to(L(309.9), 6.5, z=z_of(c) * 1.03)
c.to(L(316.9), 24.0, z=z_of(c) * 1.02)                                   # (under the archive clip)
c.fit(L(341.2), 2.3, [250, 350, 11200, 4450], b=3)                       # chapter pull-back: the whole wall

# the whole wall sits OX px further right (keeps the board's left frame out of the opening shots)
OX = 1300
def shift(e, dx): shift2(e, dx, 0)
for e in E: shift(e, OX)
c.base['x'] += OX; BW += OX

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=61, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
