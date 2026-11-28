#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размеры стран · board film, PART 3: chapters «ОБРАЗЫ ВМЕСТО ЦИФР», «ЛУНА И АВСТРАЛИЯ»,
«КАК СРАВНИВАТЬ ЧЕСТНО».
FILM range 268.26–439.03 s (170.77 s). The renderer works in LOCAL time:  local = film − 268.26.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/country_sizes/film.json (segs → captions).
Country outlines: tools/geo.py (johan/world.geo.json, public domain) → scenes/geo.json. Every comparison uses
Lambert azimuthal EQUAL-AREA outlines centred on each shape, all shapes of one comparison at ONE scale (km → px),
labelled «истинный размер»; the phone map at the end is plain Web-Mercator, labelled «веб-Меркатор».
Pieces laid inside a bigger outline (4 × France in DR Congo; USA, China, India in Africa): tools/pack.py + tools/anneal.py
→ scenes/anneal_*.json (rotations allowed, areas untouched).
Wall (board px):
  row 1  (y  430…2050)  «ОБРАЗЫ ВМЕСТО ЦИФР»  p14 Congo/France · p15 Brazil/US · p16 Indonesia · p17 three giants in Africa
  row 2  (y 2600…4300)  «ЛУНА И АВСТРАЛИЯ»    p18 Moon diameter / Australia width · p19 areas
  row 3  (y 4750…6450)  «КАК СРАВНИВАТЬ ЧЕСТНО» p20 rules 1–2 · p21 rule 3 · p22 the phone, web-Mercator
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the one mark.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
GEO = json.load(open(os.path.join(HERE, 'geo.json')))
ANC = json.load(open(os.path.join(HERE, 'anneal_congo4_1.json')))['pieces']
ANA = json.load(open(os.path.join(HERE, 'anneal_africa3_2.json')))['pieces']
R0, R1 = 268.26, 439.03
DUR = round(R1 - R0, 3)                       # 170.77
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 14600, 7300

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
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85):
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def tick(x, y, t, s=1.0, color='graphite', lw=9):
    return line([[x - 34 * s, y - 6 * s], [x - 8 * s, y + 26 * s], [x + 44 * s, y - 40 * s]], t, .3, color, lw)
def cross(x, y, t, s=40, color='red', lw=9):
    line([[x - s, y - s], [x + s, y + s]], t, .15, color, lw); line([[x + s, y - s], [x - s, y + s]], t + .17, .15, color, lw)
def eye(c, t, s=1.0):
    x, y = c
    line(arc((x, y + 40 * s), 80 * s, 70 * s, 215, 325, 14), t, .2, lw=7)
    line(arc((x, y - 40 * s), 80 * s, 70 * s, 35, 145, 14), t + .2, .2, lw=7)
    line(circle((x, y), 17 * s, 18), t + .4, .12, lw=6)
def scalebar(x, y, K, km, t, label=None, size=46):
    """a little scale bar: «1000 км» at this comparison's scale (blue = measurement)"""
    dim([x, y], [x + K * km, y], t, .4, lw=5, arrows=False)
    write(label or f'{km} км', x + K * km / 2, y - 22, t + .25, .4, 'blue', size, align='center')

# ---- country outlines ------------------------------------------------------------------------------------------
def outline(name, K, c, t, d, color='graphite', lw=8, fill=None, fillA=.13, rot=0, moves=None, origin=None, quiet=False, minlen=0, out=None):
    """draw shape `name` at K px/km, its bbox centre at board point c (or its projection origin at `origin`);
    rot (deg) turns it about its projection origin. Rings drawn one after another over d (by length).
    moves: [{t, d, to: [x, y] (new origin), dr}] slide the whole outline (pivot = the origin)."""
    g = GEO[name]; b = g['bbox']
    o = origin or [c[0] - K * (b[0] + b[2]) / 2, c[1] - K * (b[1] + b[3]) / 2]
    cs, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    rings = [[[o[0] + K * (x * cs - y * sn), o[1] + K * (x * sn + y * cs)] for x, y in r] for r in g['rings']]
    lens = [sum(math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]) for i in range(1, len(r))) for r in rings]
    keep = [i for i, l in enumerate(lens) if l >= minlen]; tot = sum(lens[i] for i in keep); tt = t; els = []
    mv = None
    if moves:
        mv = []; cur = list(o)
        for m in moves:
            q = dict(t=round(m['t'], 3), d=round(m['d'], 3), dx=round(m['to'][0] - cur[0], 1), dy=round(m['to'][1] - cur[1], 1), a=m.get('a', 2), b=m.get('b', 2.6))
            if m.get('dr'): q['dr'] = m['dr']
            cur = list(m['to']); mv.append(q); ev(m['t'], 'slide', m['d'])
    for i in keep:
        r = rings[i]; dd = max(.04, d * lens[i] / tot)
        k = dict(fill=fill, fillA=fillA) if fill else {}
        if mv: k.update(moves=mv, pivot=[round(o[0], 1), round(o[1], 1)])
        if out is not None: k['out'] = out
        els.append(line(r + [r[0]] if r[0] != r[-1] else r, tt, dd, color, lw, ea=1.3, eb=1.6, quiet=True, **k)); tt += dd
    if not quiet: ev(t, 'stroke', d, color=color)
    return dict(origin=o, rings=rings, box=[min(p[0] for r in rings for p in r), min(p[1] for r in rings for p in r),
                                             max(p[0] for r in rings for p in r), max(p[1] for r in rings for p in r)], els=els)
def piece_end(target, K, name_piece):
    """board origin of a packed piece: target origin + K·(dx, dy)"""
    return [target['origin'][0] + K * name_piece['dx'], target['origin'][1] + K * name_piece['dy']]
def leftover_point(target_rings, placed, res=6):
    """board point deepest in the part of the target that no piece covers ('и ещё останется немного')"""
    xs = [p[0] for r in target_rings for p in r]; ys = [p[1] for r in target_rings for p in r]
    x0, y0 = min(xs), min(ys); W, H = int((max(xs) - x0) / res) + 2, int((max(ys) - y0) / res) + 2
    T = Image.new('L', (W, H)); dT = ImageDraw.Draw(T)
    for r in target_rings: dT.polygon([((x - x0) / res, (y - y0) / res) for x, y in r], fill=1)
    P = Image.new('L', (W, H)); dP = ImageDraw.Draw(P)
    for r in placed: dP.polygon([((x - x0) / res, (y - y0) / res) for x, y in r], fill=1)
    m = (np.asarray(T, bool) & ~np.asarray(P, bool)).astype(np.float32)
    k = 9; c = np.pad(m, k).cumsum(0).cumsum(1); s = c[2 * k:, 2 * k:] - c[:-2 * k, 2 * k:] - c[2 * k:, :-2 * k] + c[:-2 * k, :-2 * k]
    s = s[:H, :W] * m; iy, ix = np.unravel_index(np.argmax(s), s.shape)
    return [x0 + ix * res, y0 + iy * res]
def transformed(rings, origin_from, origin_to, rot):
    cs, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    return [[[origin_to[0] + (x - origin_from[0]) * cs - (y - origin_from[1]) * sn, origin_to[1] + (x - origin_from[0]) * sn + (y - origin_from[1]) * cs] for x, y in r] for r in rings]

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

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ОБРАЗЫ ВМЕСТО ЦИФР', 268.26, hard=True)     # the part opens on black
type_card('ЛУНА И АВСТРАЛИЯ', 344.40)
type_card('КАК СРАВНИВАТЬ ЧЕСТНО', 383.86)

# ===================================================================== ROW 1 · «ОБРАЗЫ ВМЕСТО ЦИФР»
# --- p14 269.26–286.45: numbers tire, images help. DR Congo (2nd in Africa) holds France a little over 4 times
#     (France without overseas territories): four Frances laid in the heart of Africa, and some is left over
K1 = .42
write('цифры утомляют —', 380, 580, L(269.35), .9, 'graphite', 84)
write('нужны образы', 1150, 580, L(270.3), .8, 'graphite', 84)
tag('истинный размер', 2250, 560, L(270.9), size=54, rot=-1.5)
CG = outline('congo', K1, (1400, 1170), L(271.25), 1.3, 'graphite', 9, fill='grey', fillA=.10)
tag('ДР Конго', 430, 850, L(272.2), size=62, rot=1)
write('2-я по площади', 400, 1010, L(273.0), .8, 'graphite', 58)
write('страна Африки', 400, 1090, L(273.8), .8, 'graphite', 58)
FR0 = (2500, 1190)
FR = outline('france', K1, FR0, L(273.75), .9, 'blue', 8, fill='blue', fillA=.12)
tag('Франция', 2300, 1520, L(274.4), size=58, rot=-1.5)
write('вмещает её', 2500, 790, L(275.0), .7, 'graphite', 62, align='center')
count('чуть больше {0} раз', [4], 2500, 890, L(275.6), 1.1, size=84, align='center')
write('без заморских территорий', 2500, 1660, L(277.15), 1.3, 'graphite', 58, align='center')
placed = []
for i, p in enumerate(ANC):                   # four copies lifted off France and laid into Congo
    tt = L(280.0) + i * .95
    end = piece_end(CG, K1, p)
    o = outline('france', K1, FR0, tt, .25, 'blue', 6, fill='blue', fillA=.16, quiet=True,
                moves=[dict(t=tt + .3, d=.9, to=end, dr=p['rot'], a=1.8, b=2.6)])
    placed += transformed(o['rings'], o['origin'], end, p['rot'])
    write(str(i + 1), end[0] + 0, end[1] + 24, tt + 1.25, .2, 'blue', 76, align='center')
LO = [float(v) for v in leftover_point(CG['rings'], placed)]
write('и ещё останется', 400, 1330, L(284.6), .8, 'graphite', 58)
write('немного', 400, 1410, L(285.4), .5, 'graphite', 58)
line([[880, 1300], [LO[0] - 40, LO[1] + 20]], L(285.6), .4, 'graphite', 6, arrow=True)
ink('ring', L(285.95), .4, 'red', c=LO, r=[56, 48], lw=6)
scalebar(2830, 1360, K1, 1000, L(276.2))

# --- p15 287.16–302.23: Brazil ≈ 8.5 million km², about 5 % more than the contiguous US (no Alaska, no Hawaii);
#     US numbers from another reference, the conclusion holds
K2 = .24
BR = outline('brazil', K2, (4150, 1170), L(287.25), 1.6, 'graphite', 9, fill='grey', fillA=.10)
tag('Бразилия', 3560, 560, L(287.4), size=62, rot=-1.5)
count('≈ {0},5 млн км²', [8], 4250, 590, L(289.3), 1.8, size=84, align='left')
US0 = (5600, 1300)
usb = GEO['us48']['bbox']
USC1 = [4150 - K2 * (usb[0] + usb[2]) / 2, 1120 - K2 * (usb[1] + usb[3]) / 2]
US = outline('us48', K2, US0, L(292.25), 1.0, 'blue', 8, fill='blue', fillA=.12, moves=[dict(t=L(293.5), d=1.3, to=USC1, a=1.8, b=2.6)])
tag('материковые США', 5050, 760, L(292.6), size=56, rot=1, color='blue')
write('≈ на 5 % больше', 5020, 1060, L(295.0), 1.1, 'blue', 74)
write('без Аляски и Гавайев', 5020, 920, L(295.9), 1.1, 'graphite', 58)
tag('США: другой справочник', 5050, 1310, L(298.1), size=52, rot=-1)
write('на вывод не влияет', 5020, 1500, L(300.1), 1.3, 'graphite', 60)
tick(5640, 1470, L(301.6))
scalebar(3620, 1640, K2, 1000, L(289.0))

# --- p16 302.78–320.29: Indonesia looks like crumbs on the map; but it is > 17 000 islands spread west → east over
#     ≈ 5 000 km: like New York → Los Angeles and a bit more; the archipelago is wider than the eye suggests
write('на карте:', 6900, 650, L(302.9), .5, 'graphite', 62)
outline('indonesia', .05, (7110, 740), L(303.4), .8, 'grey', 4, quiet=True)
write('россыпь крошек', 6900, 880, L(304.2), 1.0, 'graphite', 62)
K3 = .2
ID0 = (8350, 880)
ID = outline('indonesia', K3, ID0, L(305.4), 1.8, 'graphite', 8, fill='grey', fillA=.12)
idb = ID['box']
tag('Индонезия', idb[2] + 120, 830, L(305.9), size=60, rot=1.5)
count('более {0} островов', [17000], idb[2] + 60, 1010, L(306.4), 1.8, size=70, sep=True, align='left')
dim([idb[0], 620], [idb[2], 620], L(309.7), 1.6, ext=[[idb[0], 590, ID0[1] - 40], [idb[2], 590, ID0[1] + 30]])
write('запад', idb[0] - 20, 650, L(309.75), .4, 'graphite', 52, align='right')
write('восток', idb[2] + 20, 650, L(310.9), .4, 'graphite', 52)
count('≈ {0} км', [5000], (idb[0] + idb[2]) / 2, 580, L(310.6), 1.4, size=84, sep=True, align='center')
USI = outline('us48', K3, (8250, 1560), L(312.6), 1.2, 'blue', 7, fill='blue', fillA=.08)
ny = [USI['origin'][0] + K3 * GEO['us48']['ny'][0], USI['origin'][1] + K3 * GEO['us48']['ny'][1]]
la = [USI['origin'][0] + K3 * GEO['us48']['la'][0], USI['origin'][1] + K3 * GEO['us48']['la'][1]]
line(circle(la, 12, 12), L(313.0), .1, lw=10); line(circle(ny, 12, 12), L(313.9), .1, lw=10)
write('Лос-Анджелес', la[0] - 30, la[1] + 15, L(313.1), .6, 'graphite', 50, align='right')
write('Нью-Йорк', ny[0] + 20, ny[1] - 55, L(314.0), .5, 'graphite', 50, align='center')
line([la, ny], L(314.3), .6, 'blue', 5, dash=[16, 12])
# a copy of Indonesia slides down onto the US, west tip at LA, below the LA–NY line: it goes past New York
idg = GEO['indonesia']['bbox']
ID1 = [la[0] - K3 * idg[0], max(la[1], ny[1]) + 30 - K3 * idg[1]]
outline('indonesia', K3, ID0, L(315.0), .3, 'graphite', 6, fill='grey', fillA=.14, quiet=True, moves=[dict(t=L(315.35), d=1.2, to=ID1, a=1.8, b=2.6)])
ide = ID1[0] + K3 * idg[2]
write('и ещё', ide + 40, ID1[1] + K3 * idg[1] + 60, L(315.8), .4, 'blue', 58)
write('немного', ide + 40, ID1[1] + K3 * idg[1] + 135, L(316.2), .5, 'blue', 58)
write('шире,', 6900, 1350, L(316.8), .5, 'graphite', 64)
write('чем подсказывает', 6900, 1450, L(317.4), .9, 'graphite', 64)
write('глаз', 6900, 1550, L(318.4), .4, 'graphite', 64)
ink('ring', L(318.9), .6, 'red', c=[(idb[0] + idb[2]) / 2, ID0[1]], r=[(idb[2] - idb[0]) / 2 + 80, 220], lw=7)
scalebar(6950, 1750, K3, 1000, L(312.0))

# --- p17 320.99–342.10: USA + China + India ≈ 22–23 million km² (UN table; disputed areas of China and India change the
#     sum by 1–2 %); Africa ≈ 30, so the three giants together are smaller
K4 = .165
AF = outline('africa', K4, (11000, 1260), L(321.0), 1.6, 'graphite', 9, fill='grey', fillA=.08)
tag('Африка', 10150, 560, L(321.2), size=62, rot=-1.5)
SIDE = {'us48': (13300, 760), 'alaska': (13700, 1150), 'china': (13100, 1300), 'india': (13600, 1750)}
NAMES = {'us48': 'США', 'china': 'Китай', 'india': 'Индия', 'alaska': 'Аляска'}
TS = {'us48': L(321.1), 'alaska': L(321.9), 'china': L(322.4), 'india': L(323.0)}
LAND = {'china': L(324.6), 'us48': L(325.3), 'india': L(326.0), 'alaska': L(326.6)}
for p in ANA:
    nm = p['piece']; st = TS[nm]
    o = outline(nm, K4, SIDE[nm], st, .7 if nm != 'alaska' else .45, 'blue', 7, fill='blue', fillA=.15,
                moves=[dict(t=LAND[nm], d=1.1, to=piece_end(AF, K4, p), dr=p['rot'], a=1.8, b=2.6)])
    ex = piece_end(AF, K4, p)
    cxk = K4 * (GEO[nm]['bbox'][0] + GEO[nm]['bbox'][2]) / 2; cyk = K4 * (GEO[nm]['bbox'][1] + GEO[nm]['bbox'][3]) / 2
    cs, sn = math.cos(math.radians(p['rot'])), math.sin(math.radians(p['rot']))
    lx, ly = ex[0] + cxk * cs - cyk * sn, ex[1] + cxk * sn + cyk * cs
    write(NAMES[nm], lx, ly + 18, LAND[nm] + 1.15, .4, 'blue', 84 if nm != 'alaska' else 54, align='center')
write('США + Китай + Индия', 11950, 640, L(322.4), 1.3, 'graphite', 72)
count('≈ {0}–{1} млн км²', [22, 23], 11950, 780, L(324.5), 2.4, size=96)
tag('таблица ООН', 12000, 950, L(328.7), size=62, rot=1.5)
write('спорные районы Китая и Индии:', 11950, 1180, L(330.1), 2.0, 'graphite', 68)
count('на сумму {0}–{1} %', [1, 2], 11950, 1300, L(334.4), 1.4, size=80)
count('Африка ≈ {0} млн км²', [30], 11950, 1530, L(337.25), 1.6, size=96)
write('три гиганта вместе меньше', 11950, 1690, L(339.6), 1.7, 'red', 80)
scalebar(10000, 1980, K4, 1000, L(321.8))
# ===================================================================== ROW 2 · «ЛУНА И АВСТРАЛИЯ»
# --- p18 345.40–363.24: 'Australia is wider than the Moon': Moon diameter ≈ 3 500 km, Australia west → east ≈ 4 000 km;
#     true, with a catch: a ball's diameter against a land's width; a nice joke, not a strict comparison
K5 = .2
write('«Австралия шире Луны»', 480, 2780, L(345.5), 1.8, 'graphite', 96)
tag('истинный размер', 2700, 2740, L(346.0), size=56, rot=1.5)
printd('moon', 'print_moon', 850, 3400, L(346.2), w=560, rot=-2, size='mid')
magnet(645, 3130, L(346.65), r=20); magnet(1055, 3120, L(346.75), r=20)
el(type='card', id='cred_moon', xy=[850, 3775], w=620, h=60, rot=-1, z=9,
   arrive=dict(t=L(346.9), kind='drop', d=.35, lift=120, spin=.6, land=.6),
   lines=[dict(text='Луна с «Аполлона-13», 1970 · NASA', font='mono', size=29, x=22, y=10, color='grey', pass_=True)])
MC, MR = (1750, 3420), K5 * 3474.8 / 2
line(circle(MC, MR, 64), L(347.9), 1.0, 'graphite', 8)
tag('Луна', 1480, 2960, L(348.2), size=58, rot=-1.5)
dim([MC[0] - MR, MC[1]], [MC[0] + MR, MC[1]], L(348.9), .9)
count('≈ {0} км', [3500], MC[0], MC[1] - 30, L(349.6), 1.5, size=76, sep=True, align='center')
write('диаметр', MC[0], MC[1] + 85, L(350.0), .6, 'graphite', 58, align='center')
AU = outline('australia', K5, (2750, 3430), L(351.5), 1.4, 'graphite', 8, fill='grey', fillA=.10)
tag('Австралия', 2560, 3900, L(352.0), size=58, rot=1)
aub = AU['box']
dim([aub[0], 3000], [aub[2], 3000], L(352.6), 1.1, ext=[[aub[0], 2970, 3300], [aub[2], 2970, 3300]])
count('≈ {0} км', [4000], (aub[0] + aub[2]) / 2, 2965, L(353.5), 1.6, size=76, sep=True, align='center')
write('запад', aub[0] - 20, 3020, L(353.9), .4, 'graphite', 50, align='right')
write('восток', aub[2] + 20, 3020, L(354.4), .4, 'graphite', 50)
scalebar(1450, 3900, K5, 1000, L(352.4))
write('правда с подвохом:', 480, 4080, L(356.15), 1.0, 'red', 76)
write('поперечник шара', 1250, 4080, L(357.7), 1.0, 'graphite', 76)
write('≠', 1930, 4080, L(358.8), .3, 'red', 84)
write('ширина суши', 2020, 4080, L(359.5), .9, 'graphite', 76)
write('красивая шутка, но не строгое сравнение', 480, 4205, L(360.7), 2.0, 'graphite', 70)

# --- p19 363.98–381.56: by area it is different: the Moon's surface is larger than Africa; we call it small;
#     ≈ 38 million km², almost five times Australia; but Asia is bigger
K6 = .1
write('по площади — всё иначе', 4500, 2780, L(364.05), 1.2, 'graphite', 90)
MD, MDR = (4900, 3460), K6 * 2 * 1737.4          # the whole lunar surface laid flat with no area distortion (equal-area: a disc of radius 2R)
line(circle(MD, MDR, 72), L(365.35), 1.1, 'graphite', 8, fill='grey', fillA=.10)
write('вся поверхность Луны', MD[0], MD[1] + MDR + 90, L(365.9), 1.1, 'graphite', 58, align='center')
AF2 = outline('africa', K6, (5880, 3440), L(366.3), 1.2, 'blue', 7, fill='blue', fillA=.12)
write('Африка', 5880, AF2['box'][3] + 90, L(367.2), .5, 'blue', 58, align='center')
write('>', 5380, 3480, L(368.0), .3, 'red', 120, align='center')
write('а мы называем её маленькой', 4500, 4200, L(368.5), 1.6, 'graphite', 70)
count('≈ {0} млн км²', [38], MD[0], MD[1] + 20, L(370.8), 2.4, size=76, align='center')
AUW = GEO['australia']['bbox']; aw = K6 * (AUW[2] - AUW[0])
write('почти в 5 раз больше Австралии', 6500, 2720, L(376.2), 1.8, 'graphite', 70)
for i in range(5):
    cx = 6520 + aw / 2 + i * (aw + 20)
    o = outline('australia', K6, (cx, 2950), L(376.15) + i * .3, .35, 'graphite', 5, fill='grey', fillA=.10, quiet=(i > 0))
    write(str(i + 1), cx - 10, 2985, L(376.4) + i * .3, .2, 'graphite', 50, align='center')
# areas as squares on one baseline (side = √area, the same scale K6): Africa 30.1, Moon 37.9, Asia 44.6 million km²
QY = 3880; QX = 6520; Q = []
for nm, area, col, tt, dash in (('Африка', 30.07e6, 'blue', L(366.9), None), ('Луна', 37.9e6, 'graphite', L(367.5), None), ('Азия больше', 44.58e6, 'red', L(378.85), [18, 14])):
    s_ = K6 * math.sqrt(area)
    k = dict(dash=dash) if dash else dict(fill='blue' if col == 'blue' else 'grey', fillA=.10)
    line(rect(QX, QY - s_, QX + s_, QY), tt, .6, col, 6, **k)
    write(nm, QX + s_ / 2, QY + 75, tt + .4, .6, col, 58, align='center')
    QX += s_ + 50
write('площади как квадраты', 6520, 4200, L(368.0), 1.0, 'grey', 54)
scalebar(7700, 4170, K6, 1000, L(368.6))

# ===================================================================== ROW 3 · «КАК СРАВНИВАТЬ ЧЕСТНО»
# --- p20 384.86–402.32: rule 1: compare square kilometres, not outlines by eye; rule 2: numbers from one source —
#     some count land only, others land with lakes and rivers; so one country has different areas, and no error
write('1', 480, 4960, L(384.95), .2, 'red', 120)
write('сравнивайте км²,', 620, 4950, L(385.2), 1.3, 'graphite', 88)
write('а не контуры на глаз', 620, 5070, L(387.9), 1.4, 'graphite', 88)
eye((900, 5320), L(388.6), 1.3); cross(900, 5320, L(389.4), 80)
line(rect(1250, 5200, 1490, 5440), L(388.9), .5, 'blue', 7)
write('км²', 1370, 5350, L(389.4), .4, 'blue', 76, align='center')
tick(1630, 5330, L(389.9), 1.3, 'graphite')
write('2', 480, 5650, L(390.35), .2, 'red', 120)
write('цифры из одного источника', 620, 5640, L(390.6), 1.6, 'graphite', 88)
def land(cx, cy, s, t, lake_fill):   # a little island with a lake; lake washed (counted) or empty
    pts = [[cx + s * math.cos(a) * (1 + .18 * math.sin(3 * a) + .1 * math.cos(5 * a)), cy + s * .72 * math.sin(a) * (1 + .12 * math.cos(4 * a))]
           for a in [2 * math.pi * i / 40 for i in range(41)]]
    line(pts, t, .6, 'graphite', 6, fill='grey', fillA=.14)
    lk = circle((cx + s * .2, cy - s * .05), [s * .3, s * .18], 24)
    line(lk, t + .6, .3, 'blue', 5, fill='blue' if lake_fill else None, fillA=.25)
for i, (lbl, lf, tt) in enumerate((('только суша', False, L(392.6)), ('суша + озёра и реки', True, L(395.3)))):
    cx = 880 + i * 1100
    land(cx, 5910, 220, tt, lf)
    write(lbl, cx, 6170, tt + .4, 1.0, 'graphite', 60, align='center')
write('≠', 1430, 5940, L(397.0), .3, 'blue', 110, align='center')
write('разные площади —', 480, 6330, L(397.7), 1.3, 'graphite', 76)
write('и ошибки нет', 1200, 6330, L(400.4), .9, 'graphite', 76)
tick(1760, 6300, L(401.4), 1.2)

# --- p21 403.05–418.29: rule 3: disputed territories; some countries' figures include land whose status is disputed;
#     no political judgement: we compare sizes, we do not draw borders; where a figure is disputed, the film says so
I21 = len(E)                                   # p21–p22 are laid out from x 2950 and moved 600 px right (see below)
write('3', 2950, 4960, L(403.1), .2, 'red', 120)
write('спорные территории', 3090, 4950, L(403.35), 1.3, 'graphite', 88)
GC = (3400, 5400)
gpts = [[GC[0] + 360 * math.cos(a) * (1 + .15 * math.sin(2 * a + 1) + .08 * math.cos(5 * a)), GC[1] + 250 * math.sin(a) * (1 + .1 * math.cos(3 * a))]
        for a in [2 * math.pi * i / 48 for i in range(49)]]
line(gpts, L(405.5), .9, 'graphite', 7, fill='grey', fillA=.10)
zone = [[3620, 5230], [3800, 5280], [3820, 5470], [3660, 5550], [3550, 5400], [3620, 5230]]
line(zone, L(406.6), .5, 'graphite', 5, dash=[14, 12])
st = []
for i in range(9):
    x = 3570 + i * 28
    st.append(dict(points=[[x, 5510], [x + 120, 5280]], t=round(L(407.2) + i * .06, 3), d=.08, lw=4))
strokes_el(st, L(407.2), .6, 'grey', 4, .7)
line([[3880, 5390], [4040, 5390]], L(407.9), .25, 'graphite', 5)
write('входит в цифры страны,', 4080, 5370, L(407.95), 1.0, 'graphite', 62)
write('статус оспаривается', 4080, 5460, L(408.7), .9, 'graphite', 62)
tag('политических оценок не даём', 3000, 5800, L(409.6), size=60, rot=-1)
el(type='ruler', id='ruler', **{'from': [3000, 6020], 'to': [3900, 6020]}, w=40, z=12, inset=55, magnetR=18,
   arrive=dict(t=L(411.9), kind='drop', d=.4, lift=160, spin=.4, land=.6))
ev(L(412.15), 'ruler', .4)
write('сравниваем размеры', 3980, 6045, L(412.3), 1.2, 'graphite', 70)
line([[3000, 6190], [3900, 6190]], L(414.1), .5, 'graphite', 7, dash=[22, 14])
write('а не проводим границы', 3980, 6215, L(414.2), 1.3, 'graphite', 70)
cross(3450, 6190, L(415.0), 40)
tag('где цифра спорная — так и говорим', 3000, 6370, L(415.8), size=54, rot=1)

# --- p22 418.98–436.73: the map in your phone is Mercator too, Web-Mercator; for streets it is ideal, angles are not
#     distorted; zoom out to the whole planet and Greenland is huge again
PX0, PY0, PX1, PY1 = 6300, 4850, 6900, 6060                 # the phone
line([[PX0 + 60, PY0], [PX1 - 60, PY0]] + arc((PX1 - 60, PY0 + 60), 60, 60, -90, 0, 6) + [[PX1, PY1 - 60]] + arc((PX1 - 60, PY1 - 60), 60, 60, 0, 90, 6)
     + [[PX0 + 60, PY1]] + arc((PX0 + 60, PY1 - 60), 60, 60, 90, 180, 6) + [[PX0, PY0 + 60]] + arc((PX0 + 60, PY0 + 60), 60, 60, 180, 270, 6),
     L(419.05), 1.0, 'graphite', 9)
line(rect(PX0 + 30, PY0 + 70, PX1 - 30, PY1 - 90), L(419.9), .5, 'graphite', 4)
line(circle(((PX0 + PX1) / 2, PY1 - 45), 18, 14), L(420.4), .1, 'graphite', 5)
write('карта в телефоне —', 7050, 4990, L(419.4), 1.2, 'graphite', 76)
write('тоже проекция Меркатора', 7050, 5100, L(421.8), 1.4, 'graphite', 76)
tag('веб-Меркатор', 7100, 5260, L(426.0), size=62, rot=-1.5)
SX0, SY0, SX1, SY1 = PX0 + 30, PY0 + 70, PX1 - 30, PY1 - 90
ER = round(L(432.0), 3)   # the street grid fades when the map is zoomed out
for i, gx in enumerate((6420, 6540, 6660, 6780)):
    line([[gx, SY0 + 10], [gx, SY1 - 10]], L(427.6) + .1 * i, .15, 'grey', 5, out=ER, quiet=(i > 0))
for i, gy in enumerate((5040, 5200, 5360, 5520, 5680, 5840)):
    line([[SX0 + 10, gy], [SX1 - 10, gy]], L(428.0) + .08 * i, .12, 'grey', 5, out=ER, quiet=True)
line([[6540, 5310], [6585, 5310], [6585, 5360]], L(429.3), .3, 'red', 6, out=ER)
write('для улиц — идеально:', 7050, 5470, L(427.6), 1.0, 'graphite', 70)
write('углы не искажаются', 7050, 5580, L(429.3), 1.4, 'graphite', 70)
# zoom out: the whole planet on Web-Mercator: Greenland and Africa where the map puts them
KM = .021
mg, ma = GEO['merc_greenland'], GEO['merc_africa']
allx = [p[0] for g in (mg, ma) for r in g['rings'] for p in r]; ally = [p[1] for g in (mg, ma) for r in g['rings'] for p in r]
mcx, mcy = (min(allx) + max(allx)) / 2, (min(ally) + max(ally)) / 2
MO = [(SX0 + SX1) / 2 - KM * mcx, (SY0 + SY1) / 2 - KM * mcy]
outline('merc_greenland', KM, None, L(432.3), .7, 'graphite', 5, fill='grey', fillA=.15, origin=MO)
outline('merc_africa', KM, None, L(432.9), .8, 'blue', 5, fill='blue', fillA=.12, origin=MO, minlen=30)
gb = [MO[0] + KM * v for v in (mg['bbox'][0], mg['bbox'][2])] + [MO[1] + KM * v for v in (mg['bbox'][1], mg['bbox'][3])]
abx = [MO[0] + KM * v for v in (ma['bbox'][0], ma['bbox'][2])] + [MO[1] + KM * v for v in (ma['bbox'][1], ma['bbox'][3])]
write('отдалим до всей планеты:', 7050, 5770, L(432.1), 1.2, 'graphite', 70)
write('Гренландия снова огромная', 7050, 5880, L(434.55), 1.7, 'red', 70)
ink('ring', L(434.6), .5, 'red', c=[(gb[0] + gb[1]) / 2, (gb[2] + gb[3]) / 2], r=[(gb[1] - gb[0]) / 2 + 30, (gb[3] - gb[2]) / 2 + 25], lw=6)
write('Гренландия', (gb[0] + gb[1]) / 2, gb[2] - 25, L(433.0), .5, 'graphite', 44, align='center')
write('Африка', (abx[0] + abx[1]) / 2 + 20, abx[3] + 45, L(433.6), .4, 'blue', 44, align='center')

for e in E[I21:]:
    for k in ('xy', 'c', 'pivot') + (('from', 'to') if e.get('kind') == 'dim' or e['type'] == 'ruler' else ()):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + 600, e[k][1]]
    if 'points' in e: e['points'] = [[x + 600, y] for x, y in e['points']]
    for st_ in e.get('strokes', []): st_['points'] = [[x + 600, y] for x, y in st_['points']]

# ===================================================================== camera (one continuous camera; the cards hide the jumps)
c = Cam(*fit([330, 470, 3150, 1720]))
c.to(L(268.6), .4, z=z_of(c))
c.to(L(269.4), 4.0, z=z_of(c) * 1.03)
c.fit(L(273.5), 1.2, [330, 470, 3150, 1720], b=3)                       # Congo + France
c.to(L(274.8), 5.0, z=z_of(c) * 1.02)
c.fit(L(279.8), 1.0, [330, 470, 3150, 1720], b=3)                       # four Frances laid in
c.to(L(281.0), 5.0, z=z_of(c) * 1.03)
c.fit(L(286.75), 1.4, [3500, 470, 6400, 1720], b=2.8)                   # Brazil
c.to(L(288.3), 3.5, z=z_of(c) * 1.02)
c.fit(L(291.9), 1.2, [3500, 470, 6400, 1720], b=3)                      # + the US
c.to(L(293.3), 8.5, z=z_of(c) * 1.03)
c.fit(L(302.4), 1.4, [6850, 470, 9900, 1800], b=2.8)                    # Indonesia
c.to(L(304.0), 8.0, z=z_of(c) * 1.02)
c.fit(L(312.2), 1.0, [6850, 470, 9900, 1800], b=3)
c.to(L(313.3), 7.0, z=z_of(c) * 1.02)
c.fit(L(320.6), 1.4, [9950, 470, 13950, 2060], b=2.8)                   # Africa and the three giants
c.to(L(322.2), 7.0, z=z_of(c) * 1.02)
c.fit(L(329.4), 1.0, [9950, 470, 13950, 2060], b=3)
c.to(L(330.5), 9.5, z=z_of(c) * 1.02)
c.fit(L(342.1), 2.0, [250, 300, 14250, 6450], b=3)                      # chapter pull-back: row 1
c.fit(L(344.55), .6, [420, 2620, 3600, 4250])                           # (under the card) the Moon corner
c.to(L(345.5), 3.0, z=z_of(c) * 1.02)
c.fit(L(348.6), 1.3, [420, 2620, 3600, 4250], b=2.8)                    # Moon diameter, Australia width
c.to(L(350.0), 5.5, z=z_of(c) * 1.02)
c.fit(L(355.7), 1.2, [420, 2620, 3600, 4250], b=3)
c.to(L(357.0), 6.5, z=z_of(c) * 1.02)
c.fit(L(363.6), 1.4, [4450, 2620, 6500, 4250], b=2.8)                   # by area: the Moon > Africa
c.to(L(365.1), 1.6, z=z_of(c) * 1.01)
c.fit(L(366.7), 1.6, [4450, 2620, 8700, 4250], b=2.8)                   # + the squares
c.to(L(368.4), 7.0, z=z_of(c) * 1.01)
c.to(L(375.6), 5.8, z=z_of(c) * 1.02)                                   # 5 × Australia, Asia bigger
c.fit(L(381.6), 2.0, [250, 300, 14250, 6450], b=3)                      # chapter pull-back: row 2
c.fit(L(384.0), .6, [420, 4780, 2750, 6420])                            # (under the card) rules 1–2
c.to(L(385.0), 5.0, z=z_of(c) * 1.02)
c.fit(L(390.1), 1.2, [420, 4780, 2750, 6420], b=3)
c.to(L(391.4), 10.5, z=z_of(c) * 1.02)
c.fit(L(402.6), 1.4, [3500, 4780, 6200, 6440], b=2.8)                   # rule 3
c.to(L(404.1), 13.5, z=z_of(c) * 1.03)
c.fit(L(418.4), 1.4, [6750, 4780, 8850, 6160], b=2.8)                   # the phone
c.to(L(419.9), 11.5, z=z_of(c) * 1.04)
c.fit(L(431.7), 1.0, [6750, 4780, 8850, 6160], b=3)
c.to(L(432.8), 3.8, z=z_of(c) * 1.02)
c.fit(L(436.75), 2.0, [250, 300, 14250, 6450], b=3)                     # chapter pull-back: row 3

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

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=53, texScale=.4, ghosts=220, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves · leftover', LO)
