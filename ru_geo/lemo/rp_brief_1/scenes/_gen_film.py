#!/usr/bin/env python3
"""«Мысленный эксперимент» · Отдалённые места (remote_places) · board film, PART 1: cold open «ХОЛОДНЫЙ СТАРТ» and
chapter «КАК МЕРЯТЬ ПУСТОТУ».
FILM range 0.00–118.15 s (118.15 s). The renderer works in LOCAL time:  local = film − 0.00 (so local = film here).
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/remote_places/film.json (segs → captions).
Map: tools/geo_nemo.py (johan/world.geo.json, public domain, Natural Earth 1:110m) → scenes/geo.json: coastlines in an
AZIMUTHAL EQUIDISTANT projection centred on Point Nemo, so the blue ring of 2 500 km is true (every point of it is
2 500 km from the point) and the nearest coast in the data lies outside it (Antarctica, ≈ 2 700 km).
Side view (elevation): the sea surface is an arc of the Earth's radius (6 371 km) and the station flies 400 km above it,
at its own scale (K_E px/km, scale bar on the wall).
Wall (board px, before the OX/OY shift):
  cold open   x 650…4350, y 500…3800   plan of the point + ring + coasts; side view above it; Verne print (NE);
                                         «не здесь» + ruler (NW)
  chapter 2   x 4700…10300, y 500…4100 2 × 2 blocks: A p2 (from what? the pole of inaccessibility) · B p3 (Lukatela 1992)
                                         C p4 (the coastline changes the point) · D p5 (three rulers)
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the one mark.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
GEO = json.load(open(os.path.join(HERE, 'geo.json')))
R0, R1 = 0.0, 118.15
DUR = round(R1 - R0, 3)                       # 118.15
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 11900, 4500

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[round(x, 1), round(y, 1)], size=size, **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[round(x, 1), round(y, 1)], size=size, **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': [round(v, 1) for v in a], 'to': [round(v, 1) for v in b]}, lw=lw, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[round(x, 1), round(y, 1)], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8, **k):
    e = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6), **k)
    if w: e['w'] = w
    if h: e['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**e)
def credit(id, x, y, t, text, w, rot=-1):
    return el(type='card', id=id, xy=[x, y], w=w, h=70, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=33, x=20, y=46, color='grey')])
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
def dot(c, t, r=11, color='graphite', quiet=True):
    return line(circle(c, r, 14), t, .12, color, r * 1.1, fill=color, fillA=.9, quiet=quiet)
def scalebar(x, y, K, km, t, label=None, size=46):
    """a little scale bar: «1000 км» at this drawing's scale (blue = measurement)"""
    dim([x, y], [x + K * km, y], t, .4, lw=5, arrows=False)
    write(label or f'{km:,} км'.replace(',', ' '), x + K * km / 2, y - 22, t + .25, .4, 'blue', size, align='center')
def waves(x0, y, n, t, w=60, amp=12, color='blue', lw=5, d=.5, quiet=True):
    """a row of little marker waves (water)"""
    st = []
    for i in range(n):
        xa = x0 + i * w * 1.25
        st.append(dict(points=[[round(xa + w * j / 8, 1), round(y - amp * math.sin(math.pi * j / 4), 1)] for j in range(9)], t=round(t + d * i / max(1, n), 3), d=round(d / max(1, n), 3), lw=lw))
    if not quiet: ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=st, lw=lw, color=color, alpha=.8)
# ---- marker sketches (icons drawn by hand, graphite) --------------------------------------------------------------
def person(x, y, t, s=1.0, quiet=True):
    """a stick figure in the water, both arms up (waiting for help); y = water line"""
    line(circle((x, y - 62 * s), 13 * s, 16), t, .15, 'graphite', 7 * s, quiet=quiet)
    line([[x, y - 48 * s], [x, y - 8 * s]], t + .15, .1, 'graphite', 7 * s, quiet=True)
    line([[x - 30 * s, y - 80 * s], [x - 14 * s, y - 52 * s], [x, y - 40 * s], [x + 14 * s, y - 52 * s], [x + 30 * s, y - 80 * s]], t + .25, .2, 'graphite', 7 * s, quiet=True)
def ship(x, y, t, s=1.0, quiet=False):
    """a small ship from the side: hull, deck house, funnel; y = water line"""
    line([[x - 110 * s, y - 40 * s], [x + 120 * s, y - 40 * s], [x + 80 * s, y], [x - 90 * s, y], [x - 110 * s, y - 40 * s]], t, .4, 'graphite', 7 * s, quiet=quiet)
    line(rect(x - 50 * s, y - 80 * s, x + 30 * s, y - 40 * s), t + .4, .25, 'graphite', 6 * s, quiet=True)
    line(rect(x - 20 * s, y - 115 * s, x + 2 * s, y - 80 * s), t + .6, .15, 'graphite', 6 * s, quiet=True)
    waves(x - 140 * s, y + 18 * s, 4, t + .7, 50 * s, 9 * s, d=.3)
def island(x, y, t, s=1.0, quiet=False, palm=True):
    """a small island from the side: a mound with a palm; y = water line"""
    line([[x - 130 * s, y], [x - 80 * s, y - 40 * s], [x - 20 * s, y - 58 * s], [x + 50 * s, y - 45 * s], [x + 130 * s, y]], t, .4, 'graphite', 7 * s, quiet=quiet)
    if palm:
        line([[x - 5 * s, y - 56 * s], [x + 5 * s, y - 110 * s], [x + 12 * s, y - 150 * s]], t + .4, .2, 'graphite', 6 * s, quiet=True)
        for a in (-160, -120, -60, -20):
            line(arc((x + 12 * s + 36 * s * math.cos(math.radians(a)), y - 150 * s + 20 * s * math.sin(math.radians(a))), 40 * s, 26 * s, a + 180 - 50, a + 180 + 10, 6),
                 t + .6, .1, 'graphite', 5 * s, quiet=True)
    waves(x - 170 * s, y + 18 * s, 6, t + .5, 50 * s, 9 * s, d=.3)
def flag(x, y, t, s=1.0, quiet=False):
    """an expedition flag on the ice: pole, flag, a little tent"""
    line([[x - 40 * s, y], [x - 40 * s, y - 160 * s]], t, .2, 'graphite', 7 * s, quiet=quiet)
    line([[x - 40 * s, y - 160 * s], [x + 50 * s, y - 135 * s], [x - 40 * s, y - 110 * s]], t + .2, .2, 'graphite', 6 * s, quiet=True)
    line([[x + 10 * s, y], [x + 70 * s, y - 80 * s], [x + 130 * s, y], [x + 10 * s, y]], t + .4, .3, 'graphite', 6 * s, quiet=True)
    line([[x - 120 * s, y + 4 * s], [x + 170 * s, y + 4 * s]], t + .7, .15, 'grey', 5 * s, quiet=True)
def orbit_icon(x, y, t, s=1.0):
    """the Earth as a circle with an orbit and a station dot"""
    line(circle((x, y), 55 * s, 30), t, .3, 'graphite', 6 * s)
    line(circle((x, y), [130 * s, 60 * s], 40, a0=200), t + .3, .4, 'blue', 5 * s, dash=[14, 10], quiet=True)
    dot((x + 130 * s * math.cos(math.radians(-30)), y + 60 * s * math.sin(math.radians(-30))), t + .7, 12 * s, 'graphite')

# ---- the pole of inaccessibility of a shape: the point of the region farthest from its edge (raster distance map) ----
def pole_of(region_polys, holes=(), res=2):
    xs = [p[0] for r in region_polys for p in r]; ys = [p[1] for r in region_polys for p in r]
    x0, y0 = min(xs) - 10, min(ys) - 10; Wd, Ht = int((max(xs) - x0) / res) + 12, int((max(ys) - y0) / res) + 12
    m = Image.new('L', (Wd, Ht)); d = ImageDraw.Draw(m)
    for r in region_polys: d.polygon([((x - x0) / res, (y - y0) / res) for x, y in r], fill=1)
    for r in holes: d.polygon([((x - x0) / res, (y - y0) / res) for x, y in r], fill=0)
    dt = ndi.distance_transform_edt(np.asarray(m, bool)); iy, ix = np.unravel_index(np.argmax(dt), dt.shape)
    return [x0 + ix * res, y0 + iy * res], float(dt[iy, ix] * res)

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
type_card('ХОЛОДНЫЙ СТАРТ', 0.0, hard=True)     # the film opens on black
type_card('КАК МЕРЯТЬ ПУСТОТУ', 39.82)

# ===================================================================== COLD OPEN · «ХОЛОДНЫЙ СТАРТ»
# --- p0 1.00–20.57: a point on the map more than 2 500 km from any land; you wait for help there; the nearest people
#     are not on a ship and not on an island: they live about 400 km up, on a space station, and fly over in minutes
K = .3                                         # plan: px per km (azimuthal equidistant around the point)
CX, CY = 2400, 2200                            # Point Nemo on the board
RING = K * 2500
# (drawn under the card, so the first frame after it already holds the subject: a person alone in the water)
person(CX, CY + 25, L(.3), 1.0)
waves(CX - 95, CY + 45, 3, L(.6), 46, 8, d=.25)
dim([CX + 45, CY], [CX + RING, CY], L(1.15), 3.4, lw=8)
count('больше {0} км', [2500], CX + 400, CY - 42, L(1.3), 4.0, size=90, sep=True, align='center')
write('до любой суши', CX + 400, CY + 95, L(3.1), .9, 'graphite', 70, align='center')
line(circle((CX, CY), RING, 96, a0=0), L(4.65), 1.7, 'blue', 8)
ev(L(4.65), 'ring', 1.7)
# the coasts: all outside the ring (nearest data vertex ≈ 2 714 km: Antarctica)
tt = L(5.6); segs = [(nm, s) for nm, v in GEO['shapes'].items() for s in v['segs']]
tot = sum(sum(math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) for i in range(1, len(s))) for _, s in segs)
ev(tt, 'stroke', 2.4)
for nm, s in sorted(segs, key=lambda q: math.hypot(*q[1][0])):
    ln = sum(math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]) for i in range(1, len(s)))
    line([[CX + K * x, CY + K * y] for x, y in s], tt, max(.05, 2.4 * ln / tot), 'graphite', 7, quiet=True)
    tt += 2.4 * ln / tot * .55                 # strokes overlap a little: several hands
write('ждёте помощи…', CX - 95, CY - 125, L(7.25), 1.2, 'graphite', 80, align='right')
# not on a ship, not on an island
ship(CX - 300, CY + 420, L(9.0), 1.0)
island(CX + 330, CY + 420, L(9.7), 1.0)
write('не на корабле', CX - 300, CY + 560, L(10.6), .9, 'graphite', 64, align='center')
cross(CX - 300, CY + 360, L(11.5), 70)
write('не на острове', CX + 330, CY + 560, L(11.9), .9, 'graphite', 64, align='center')
cross(CX + 330, CY + 360, L(12.6), 70)
# side view above the plan: the sea is an arc of the Earth (R = 6 371 km), the station 400 km up
KE = .6; EX, EY = CX, 1100
RE, RO = 6371 * KE, (6371 + 400) * KE
def sea(s_km): th = s_km / 6371; return [EX + RE * math.sin(th), EY + RE * (1 - math.cos(th))]
def orb(th): return [EX + RO * math.sin(th), EY + RE - RO * math.cos(th)]
line([sea(s) for s in range(-1050, 1051, 50)], L(13.0), .8, 'blue', 7)
waves(EX - 120, EY + 40, 4, L(13.3), 46, 8, d=.3)
person(EX, EY, L(13.5), .9)
write('вид сбоку', EX - 700, EY - 290, L(13.2), .6, 'grey', 56)
ISS = printd('iss', 'iss', EX, round(EY - 400 * KE, 1), L(13.9), w=300, size='big', z=12)
dim([EX + 190, EY + 4], [EX + 190, EY - 400 * KE], L(14.5), .5)
count('≈ {0} км', [400], EX + 240, EY - 70, L(14.6), 1.3, size=80)
tag('космическая станция', EX - 330, EY - 430, L(15.5), size=56, rot=-1.5)
th1 = .105
line([orb(-.05 + .21 * i / 30) for i in range(31)], L(16.4), .9, 'graphite', 5, dash=[16, 12], arrow=True)
o1 = orb(th1)
ISS['moves'] = [dict(t=L(17.8), d=2.6, dx=round(o1[0] - EX, 1), dy=round(o1[1] - (EY - 400 * KE), 1), dr=round(math.degrees(th1), 2), a=1.6, b=2.2)]
ev(L(17.8), 'slide', 2.6)
write('пролетают над головой', EX - 700, EY - 175, L(17.9), 1.2, 'graphite', 64)
write('за считаные минуты', EX - 700, EY - 95, L(19.0), 1.1, 'graphite', 64)
scalebar(EX + 430, EY - 390, KE, 200, L(14.0))

# --- p1 21.12–36.87: this is Point Nemo in the south Pacific; «Немо» is Latin for «никто»; but the most remote place
#     where people live is not here (which one: at the end); first: how to measure «far»
tag('Точка Немо', CX - 30, CY - 285, L(21.3), size=100, rot=-1.5)
write('юг Тихого океана', CX, CY - 470, L(22.1), 1.2, 'graphite', 80, align='center')
write('Антарктида', CX + 60, CY + 1290, L(22.6), .8, 'graphite', 90, align='center')
write('Южная Америка', CX + 1300, CY + 830, L(23.0), .9, 'graphite', 90, align='center')
write('Новая Зеландия', CX - 1450, CY + 760, L(23.3), .9, 'graphite', 80, align='center')
scalebar(CX - 1350, CY + 1150, K, 1000, L(5.8), size=60)
VX, VY = 3720, 1020
printd('verne', 'print_verne', VX, VY, L(24.0), w=560, rot=1.8, size='mid')
magnet(VX - 205, VY - 300, L(24.45), r=22); magnet(VX + 215, VY - 290, L(24.55), r=22)
credit('cred_verne', VX, VY + 385, L(24.7), 'А. де Невиль · илл. к роману Жюля Верна', 840)
write('«Немо» по-латыни —', 4070, 960, L(24.4), 1.0, 'graphite', 76)
write('«никто»', 4170, 1120, L(25.4), .6, 'red', 110)
write('самое далёкое место,', 360, 800, L(26.4), 1.3, 'graphite', 76)
write('где люди живут, —', 360, 900, L(28.0), 1.2, 'graphite', 76)
write('не здесь', 360, 1030, L(29.85), .7, 'red', 116)
line([[890, 1000], [1200, 1150], [1450, 1450]], L(30.3), .5, 'graphite', 6, dash=[16, 12], arrow=True)
tag('какое — скажу в конце', 380, 1170, L(31.0), size=56, rot=1.2)
write('как измерить «далеко»?', 360, 1340, L(33.9), 1.6, 'graphite', 76)
el(type='ruler', id='ruler0', **{'from': [380, 1460], 'to': [1300, 1460]}, w=44, z=12, inset=55, magnetR=18,
   arrive=dict(t=L(35.4), kind='drop', d=.4, lift=160, spin=.4, land=.6))
ev(L(35.65), 'ruler', .4)

# ===================================================================== CHAPTER 2 · «КАК МЕРЯТЬ ПУСТОТУ»
I_CH2 = len(E)          # chapter 2 is laid out from x 4700 and moved D2 px right (below); block D another DD px
# --- p2 40.82–61.40 (block A): remoteness means nothing until you say from what: land, people, a port, a hospital?
#     the «pole of inaccessibility» = the point farthest from the shore; oceans, continents and ice each have one;
#     different definitions, different winners
write('«отдалённость»', 4800, 730, L(40.9), 1.1, 'graphite', 100)
write('ничего не значит,', 4800, 860, L(42.0), 1.0, 'graphite', 74)
write('пока не сказано, от чего считать', 4800, 970, L(43.3), 1.9, 'graphite', 74)
DC = (5500, 1290)
dot(DC, L(45.55), 13, quiet=False)
for (lbl, tx, ty, ax, ay, t_) in (('от суши', 4830, 1180, 5175, 1195, 45.7), ('от людей', 5730, 1180, 5680, 1205, 46.6),
                                 ('от порта', 4830, 1400, 5175, 1385, 47.4), ('от больницы', 5730, 1400, 5680, 1378, 48.3)):
    arrow([DC[0] + (ax - DC[0]) * .18, DC[1] + (ay - DC[1]) * .18], [ax, ay], L(t_) - .1, .25, 'graphite', 6)
    tag(lbl, tx, ty, L(t_), size=54, rot=(-1.5 if tx < 5000 else 1.3))
# the pole of a continent-like shape: the centre of the largest circle that fits inside
BC = (6850, 1130)
blob = [[BC[0] + 330 * math.cos(a) * (1 + .2 * math.sin(3 * a + .4) + .08 * math.cos(5 * a)), BC[1] + 260 * math.sin(a) * (1 + .14 * math.cos(2 * a + .9))]
        for a in [2 * math.pi * i / 64 for i in range(65)]]
line(blob, L(49.45), 1.0, 'graphite', 8, fill='grey', fillA=.12)
tag('полюс недоступности', 6440, 700, L(50.6), size=56, rot=-1.2)
PB, RB = pole_of([blob])
line(circle(PB, RB - 5, 60), L(52.3), .8, 'blue', 5, dash=[14, 10])
dot(PB, L(52.95), 13, 'red', quiet=False)
write('точка, самая далёкая', BC[0], 1560, L(53.0), 1.0, 'graphite', 60, align='center')
write('от берега', BC[0], 1640, L(53.9), .6, 'graphite', 60, align='center')
# oceans, continents and ice each have one
IY = 1890
waves(4800, IY - 10, 4, L(54.9), 60, 12, d=.5, quiet=False); waves(4840, IY + 40, 3, L(55.1), 60, 12, d=.4)
dot((4960, IY + 10), L(55.5), 12)
write('у океана', 4980, IY + 150, L(55.4), .6, 'graphite', 60, align='center')
mini = [[5560 + 120 * math.cos(a) * (1 + .18 * math.sin(3 * a)), IY + 15 + 80 * math.sin(a) * (1 + .1 * math.cos(2 * a))] for a in [2 * math.pi * i / 36 for i in range(37)]]
line(mini, L(56.85), .5, 'graphite', 6, fill='grey', fillA=.12); dot(pole_of([mini])[0], L(57.3), 12)
write('у материка', 5560, IY + 150, L(57.0), .6, 'graphite', 60, align='center')
floe = [[6020, IY - 50], [6140, IY - 75], [6250, IY - 40], [6280, IY + 40], [6180, IY + 85], [6050, IY + 70], [5990, IY + 10], [6020, IY - 50]]
line(floe, L(57.6), .4, 'graphite', 6)
strokes_el([dict(points=[[6010 + i * 28, IY + 70], [6060 + i * 28, IY - 50]], t=round(L(57.9) + i * .04, 3), d=.06, lw=3) for i in range(8)], L(57.9), .35, 'grey', 3, .6)
dot((6140, IY + 10), L(58.2), 12)
write('у льда', 6140, IY + 150, L(58.0), .5, 'graphite', 60, align='center')
write('разные определения —', 6420, 1930, L(58.5), 1.2, 'graphite', 64)
write('разные победители', 6420, 2040, L(59.9), 1.1, 'red', 70)
for i, p in enumerate(((4960, IY + 10), pole_of([mini])[0], (6140, IY + 10))):
    line(circle(p, 34, 20), L(60.3) + .15 * i, .2, 'graphite', 5, quiet=(i > 0))

# --- p3 61.95–80.71 (block B): in 1992 the engineer Hrvoje Lukatela computed the ocean pole on a computer; no ship, no
#     expedition: only a program and coastline data; first seen in calculations, then named after Jules Verne's hero
write('1992', 7760, 790, L(62.05), 1.0, 'blue', 150)
tag('Хрвое Лукатела', 8240, 700, L(64.6), size=62, rot=1.2)
write('инженер', 8920, 725, L(65.3), .6, 'graphite', 62)
MX0, MY0, MX1, MY1 = 7760, 960, 8560, 1450
line(rect(MX0, MY0, MX1, MY1), L(66.5), .7, 'graphite', 8)
line([[8100, MY1], [8080, MY1 + 70], [8240, MY1 + 70], [8220, MY1]], L(67.1), .25, 'graphite', 7, quiet=True)
MC, MR = (8170, 1215), 150                      # the computed point: equally far from three coasts
coasts = []
for k_, a in enumerate((-150, -30, 90)):
    ux, uy = math.cos(math.radians(a)), math.sin(math.radians(a)); vx, vy = -uy, ux
    pts = []
    for j in range(-6, 7):
        s_ = j * 28; bend = .0028 * s_ * s_ + (6 * math.sin(j * 1.7 + k_) if j else 0)
        pts.append([MC[0] + ux * (MR + bend) + vx * s_, MC[1] + uy * (MR + bend) + vy * s_])
    pts = [p for p in pts if MX0 + 12 < p[0] < MX1 - 12 and MY0 + 12 < p[1] < MY1 - 12]
    coasts.append(pts)
    line(pts, L(66.9) + .12 * k_, .3, 'graphite', 5, quiet=True)
for k_, a in enumerate((-150, -30, 90)):
    tp = [MC[0] + MR * math.cos(math.radians(a)), MC[1] + MR * math.sin(math.radians(a))]
    line([MC, tp], L(67.5) + .12 * k_, .25, 'blue', 5, quiet=(k_ > 0))
dot(MC, L(67.9), 12, 'red', quiet=False)
write('океанский полюс', 8640, 1090, L(66.6), 1.0, 'graphite', 62)
write('на компьютере', 8640, 1180, L(67.5), .8, 'graphite', 62)
ship(9250, 1350, L(68.5), .9)
cross(9250, 1290, L(69.3), 75)
flag(9880, 1350, L(69.7), .9)
cross(9900, 1290, L(70.15), 75)
write('ни корабля', 9250, 1500, L(68.9), .6, 'graphite', 58, align='center')
write('ни экспедиции', 9900, 1500, L(69.9), .7, 'graphite', 58, align='center')
write('только программа', 7760, 1640, L(70.6), 1.0, 'graphite', 70)
write('и данные о береговой линии', 7760, 1745, L(71.8), 1.5, 'graphite', 70)
st = [dict(points=circle(p, 5, 8), t=round(L(72.3) + .02 * i, 3), d=.03, lw=5) for i, p in enumerate([p for c_ in coasts for p in c_[::2]])]
strokes_el(st, L(72.3), .6, 'blue', 5, .9)
write('сначала — в расчётах,', 7760, 1890, L(74.3), 1.3, 'graphite', 70)
write('потом — имя в честь героя Жюля Верна', 7760, 1995, L(77.9), 2.0, 'graphite', 70)
tag('Точка Немо', 9180, 1720, L(79.6), size=64, rot=-1.5)
line([[9170, 1760], [8900, 1520], [8300, 1260]], L(79.9), .5, 'graphite', 5, dash=[14, 10], arrow=True)

# --- p4 81.26–99.57 (block C): why the map matters: the coast can be drawn differently: count a small islet? count an
#     ice shelf? early estimates of such points differed by tens and even hundreds of km; so almost every figure: «около»
write('почему карта важна?', 4800, 2650, L(81.35), 1.1, 'graphite', 90)
BCX, BCY = 5500, 3180
basin = [[BCX + 620 * math.cos(a) * (1 + .1 * math.sin(3 * a + .5) + .06 * math.cos(7 * a)), BCY + 400 * math.sin(a) * (1 + .1 * math.cos(2 * a + .3))]
         for a in [2 * math.pi * i / 80 for i in range(81)]]
line(basin, L(82.5), 1.3, 'graphite', 8, fill='blue', fillA=.07)
write('берег — по-разному', 6200, 2650, L(83.4), 1.0, 'graphite', 64)
P1, R1_ = pole_of([basin])
dot(P1, L(84.3), 12, 'blue', quiet=False)
write('1', P1[0] - 10, P1[1] - 30, L(84.5), .2, 'blue', 56, align='center')
ISL = circle((P1[0] + 70, P1[1] - 40), [42, 28], 20)
line(ISL, L(85.3), .4, 'graphite', 6, fill='grey', fillA=.3)
write('мелкий островок?', 5330, 3720, L(85.7), 1.0, 'graphite', 68)
line([[5620, 3650], [P1[0] + 72, P1[1] - 10]], L(86.0), .3, 'graphite', 4, dash=[12, 9])
P2, _ = pole_of([basin], [ISL])
dot(P2, L(86.7), 12, 'blue')
arrow(P1, P2, L(86.8), .3, 'blue', 4)
# an ice shelf along the west coast: the «coast» moves out to its edge
shelf_edge = [[BCX - 470, BCY - 330], [BCX - 400, BCY - 150], [BCX - 430, BCY + 40], [BCX - 380, BCY + 230], [BCX - 470, BCY + 370]]
shelf = shelf_edge + [[BCX - 900, BCY + 370], [BCX - 900, BCY - 330]]
line(shelf_edge, L(87.25), .6, 'graphite', 6)
hst = []
for j in range(14):
    y_ = BCY - 300 + j * 48
    xe = np.interp(y_, [p[1] for p in shelf_edge], [p[0] for p in shelf_edge])
    # only the strip between the basin's own coast and the shelf edge (inside the basin)
    xs_in = [p[0] for p in basin if abs(p[1] - y_) < 30 and p[0] < BCX]
    xc = min(xs_in) if xs_in else xe - 60
    if xe - xc > 20: hst.append(dict(points=[[round(xc + 6, 1), round(y_ + 14, 1)], [round(xe - 6, 1), round(y_ - 14, 1)]], t=round(L(87.75) + j * .04, 3), d=.06, lw=3))
strokes_el(hst, L(87.75), .6, 'grey', 4, .75)
write('ледяной шельф?', 4780, 3720, L(88.0), .9, 'graphite', 68)
line([[5000, 3650], [BCX - 450, BCY + 250]], L(88.3), .3, 'graphite', 4, dash=[12, 9])
P3, _ = pole_of([basin], [ISL, shelf])
dot(P3, L(88.85), 12, 'blue')
arrow(P2, P3, L(88.9), .3, 'blue', 4)
SX, SY = 6830, 3000
printd('shelf', 'print_shelf', SX, SY, L(87.4), w=600, rot=-1.5, size='mid')
magnet(SX - 230, SY - 210, L(87.8), r=20); magnet(SX + 240, SY - 200, L(87.9), r=20)
credit('cred_shelf', SX, SY + 290, L(88.1), 'край шельфового ледника, Антарктида · NASA', 880)
dim(P1, P3, L(90.2), .7, lw=6)
write('ранние оценки расходились', 6250, 3560, L(89.4), 1.3, 'graphite', 66)
write('на десятки и даже сотни км', 6250, 3665, L(92.0), 1.6, 'blue', 66)
write('почти каждая цифра —', 4780, 3860, L(95.5), 1.1, 'graphite', 70)
write('с пометкой «около»', 4780, 3970, L(97.4), 1.0, 'graphite', 70)
el(type='stamp', text='ОКОЛО', xy=[6720, 3880], size=110, rot=-7, t=L(98.9))
ev(L(98.9), 'stamp', .2)

# --- p5 100.12–116.00 (block D): three rulers: to any land, to housing, to people; three different places, an honest
#     result, not an error; one ruler leads to the ocean, another to an island, the third to space
I_D = len(E)
write('три линейки', 7760, 2650, L(100.2), 1.0, 'graphite', 96)
RY = (2900, 3250, 3600)
for i, (lbl, t_) in enumerate((('до любой суши', 102.5), ('до жилья', 103.7), ('до людей', 104.45))):
    el(type='ruler', id=f'ruler{i + 1}', **{'from': [7780, RY[i]], 'to': [8980, RY[i]]}, w=44, z=12, inset=55, magnetR=18,
       arrive=dict(t=L(t_) - .15, kind='drop', d=.4, lift=160, spin=.4, land=.6))
    ev(L(t_) + .1, 'ruler', .4)
    tag(lbl, 7800, RY[i] - 95, L(t_) + .15, size=54, rot=(-1.2 if i % 2 else 1.2))
for i in range(3):
    arrow([9010, RY[i]], [9330, RY[i]], L(105.1) + .3 * i, .3, 'blue', 6, dash=[14, 10], quiet=(i > 0))
write('три разных места', 8700, 2650, L(105.3), 1.1, 'blue', 70)
write('честный результат', 7760, 3830, L(107.2), 1.2, 'graphite', 66)
tick(8420, 3800, L(108.5), 1.1)
write('а не ошибка расчёта', 7760, 3940, L(108.9), 1.2, 'graphite', 66)
line([[7750, 3915], [8420, 3905]], L(110.0), .3, 'red', 7)
waves(9400, RY[0] + 10, 4, L(110.5), 70, 14, d=.5, quiet=False); waves(9440, RY[0] + 60, 3, L(110.7), 70, 14, d=.4)
write('океан', 9780, RY[0] + 30, L(111.2), .5, 'graphite', 70)
island(9560, RY[1] + 40, L(113.25), .8, palm=True)
write('остров', 9780, RY[1] + 30, L(113.6), .5, 'graphite', 70)
orbit_icon(9530, RY[2] + 10, L(114.6), .9)
write('космос', 9780, RY[2] + 30, L(115.0), .5, 'graphite', 70)

# ===================================================================== camera (one continuous camera; the cards hide the jumps)
c = Cam(*fit([CX - 230, CY - 300, CX + 790, CY + 140]))                 # the person in the water at the point
c.to(L(1.15), 3.4, x=c.cur['x'] + 260, z=z_of(c) * .85, a=1.6, b=2.4)   # ride the radius out
c.fit(L(4.55), 2.3, [CX - 1650, CY - 820, CX + 1700, CY + 1500], b=3)  # the ring, the coasts far away
c.to(L(6.9), .6, z=z_of(c) * 1.01)
c.fit(L(7.1), 1.5, [CX - 720, CY - 330, CX + 800, CY + 620], b=3)       # waiting; not a ship, not an island
c.to(L(8.7), 4.0, z=z_of(c) * 1.03)
c.fit(L(12.85), 1.1, [EX - 720, EY - 470, EX + 760, EY + 120], b=3)     # side view: the station 400 km up
c.to(L(14.0), 3.6, z=z_of(c) * 1.02)
c.to(L(17.7), 2.8, z=z_of(c) * 1.01, a=1.6, b=2.4)
c.fit(L(20.75), 1.3, [CX - 1700, CY - 800, CX + 1700, CY + 1450], b=3)  # Point Nemo: the map
c.to(L(22.1), 1.7, z=z_of(c) * 1.02)
c.fit(L(23.85), 1.0, [3350, 560, 5500, 1460], b=3)                     # Nemo = nobody: the Verne print
c.to(L(24.9), 1.2, z=z_of(c) * 1.02)
c.fit(L(26.15), 1.3, [340, 680, 1360, 1300], b=3)                      # not here; at the end
c.to(L(27.5), 5.9, z=z_of(c) * 1.03)
c.fit(L(33.5), 1.0, [160, 700, 1180, 1500], b=3)                       # how to measure: the ruler
c.to(L(34.5), 2.2, z=z_of(c) * 1.02)
c.fit(L(36.8), 2.5, [300, 560, 4400, 3820], b=3)                       # chapter pull-back: the cold open
c.fit(L(39.9), .6, [5400, 540, 7150, 1500])                            # (under the card) block A
c.to(L(40.8), 4.5, z=z_of(c) * 1.02)
c.fit(L(45.35), 1.0, [5400, 540, 7150, 1500], b=3)
c.to(L(46.4), 2.8, z=z_of(c) * 1.02)
c.fit(L(49.25), 1.2, [5400, 540, 8100, 1720], b=2.8)                   # the pole of inaccessibility
c.to(L(50.5), 3.9, z=z_of(c) * 1.02)
c.fit(L(54.5), 1.2, [5400, 700, 8150, 2120], b=2.8)                   # ocean, continent, ice; different winners
c.to(L(55.8), 5.6, z=z_of(c) * 1.02)
c.fit(L(61.5), 1.3, [8380, 560, 10050, 1520], b=2.8)                    # block B: 1992, Lukatela, the computer
c.to(L(62.9), 5.2, z=z_of(c) * 1.02)
c.fit(L(68.15), 1.0, [8380, 600, 10950, 1560], b=3)                    # no ship, no expedition
c.to(L(69.2), 1.1, z=z_of(c) * 1.01)
c.fit(L(70.35), 1.2, [8380, 900, 10950, 2050], b=3)                    # program + coastline data; calculations; Verne
c.to(L(71.6), 9.0, z=z_of(c) * 1.03)
c.fit(L(80.75), 1.3, [5400, 2500, 7950, 3720], b=2.8)                  # block C: the coast drawn differently
c.to(L(82.1), 6.6, z=z_of(c) * 1.02)
c.fit(L(88.7), 1.4, [5400, 2500, 8100, 4020], b=3)                     # estimates differ; «около»
c.to(L(90.1), 9.4, z=z_of(c) * 1.02)
c.fit(L(99.6), 1.3, [8780, 2500, 11300, 4020], b=2.8)                  # block D: three rulers
c.to(L(100.9), 15.0, z=z_of(c) * 1.03)
c.fit(L(116.05), 2.05, [250, 420, 11550, 4140], b=3)                   # pull-back: the whole wall of this part

def shift(e, dx, dy):
    for k in ('xy', 'c', 'pivot') + (('from', 'to') if e.get('kind') == 'dim' or e['type'] == 'ruler' else ()):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [round(e[k][0] + dx, 1), round(e[k][1] + dy, 1)]
    if 'points' in e: e['points'] = [[round(x + dx, 1), round(y + dy, 1)] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[round(x + dx, 1), round(y + dy, 1)] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx; ex[1] += dy; ex[2] += dy
D2, DD = 700, 400
for e in E[I_CH2:]: shift(e, D2, 0)
for e in E[I_D:]: shift(e, DD, 0)
# the whole wall sits OX px right and OY px down (keeps the board's frame out of the close shots)
OX, OY = 300, 250
for e in E: shift(e, OX, OY)
c.base['x'] += OX; c.base['y'] += OY; BW += OX; BH += OY

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=71, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=30000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves · poles', PB, P1, P2, P3)
