#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размер Вселенной · board film, PART 3: chapters «ОДНА ТОЧКА НЕБА» and «КРАЙ, КОТОРЫЙ МЫ ВИДИМ».
FILM range 272.67–454.73 s (182.06 s). The renderer works in LOCAL time:  local = film − 272.67.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/universe_size/film.json (segs → captions).
Film 318.50–359.80 (Hubble deep field paragraphs) is covered by the Archive Light Table clip: nothing is drawn there,
the camera only drifts slowly on the ladder and, at 359.85, pulls back over the chapter's part of the wall.
Wall: upper band (y 450…1700) = «ОДНА ТОЧКА НЕБА», lower band (y 2450…4450) = «КРАЙ, КОТОРЫЙ МЫ ВИДИМ».
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the break.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
R0, R1 = 272.67, 454.73
DUR = round(R1 - R0, 3)                       # 182.06
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 14200, 4800

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=size, **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=size, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid'):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=8, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def stamp(text, x, y, t, size=110, rot=-8, color='red'):
    ev(t, 'stamp', .2); return el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), color=color)
def circle(c, r, n=40, a0=-90, turn=1.0):
    return [[c[0] + r * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + r * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7): return line([p0, p1], t, d, color, lw, arrow=True)
def hatch(x0, x1, y, t, d, n=8, color='grey', down=False):
    strokes = []
    for i in range(n):
        x = x0 + 30 + (x1 - x0 - 60) * i / max(1, n - 1)
        p = [[x, y + 8], [x - 38, y + 52]] if down else [[x, y], [x + 40, y - 45]]
        strokes.append(dict(points=p, t=round(t + d * i / n, 3), d=round(d / n * 1.2, 3), lw=5))
    ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=5, color=color, alpha=.7)
def rot_pts(pts, c, deg):
    a = math.radians(deg); return [[c[0] + (x - c[0]) * math.cos(a) - (y - c[1]) * math.sin(a), c[1] + (x - c[0]) * math.sin(a) + (y - c[1]) * math.cos(a)] for x, y in pts]
def mirror(left, cx):   # one side of a tower outline → the closed-top outline
    return [[x, y] for x, y in left] + [[2 * cx - x, y] for x, y in reversed(left[:-1])]
def spiral(c, R, turns, t, d, a0=0, sgn=1, color='graphite', lw=6, n=40):
    pts = [[c[0] + R * (1 - .8 * u) * math.cos(math.radians(a0 + sgn * 360 * turns * u)),
            c[1] + R * (1 - .8 * u) * math.sin(math.radians(a0 + sgn * 360 * turns * u))] for u in [i / n for i in range(n + 1)]]
    return line(pts, t, d, color, lw)
def wing(c, a, r0, r1, hw):   # a plan wing: a long rounded lobe from the core outward
    u = (math.cos(math.radians(a)), math.sin(math.radians(a))); v = (-u[1], u[0])
    P = lambda s, q: [c[0] + u[0] * s + v[0] * q, c[1] + u[1] * s + v[1] * q]
    pts = [P(r0, -hw), P(r1, -hw)]
    for i in range(1, 12): b = math.radians(-90 + 180 * i / 12); pts.append(P(r1 + hw * math.cos(b), hw * math.sin(b)))
    pts += [P(r1, hw), P(r0, hw)]
    return pts
def stick(x, yf, t, s=1.0, lw=5, look=0):   # a small stick figure standing on yf (look: head tilt, + = up-right)
    h = 16 * s
    line(circle((x + look * 4, yf - 102 * s), h, 16), t, .12, lw=lw)
    line([[x, yf - 86 * s], [x, yf - 44 * s]], t + .12, .1, lw=lw)
    line([[x, yf - 44 * s], [x - 12 * s, yf]], t + .22, .07, lw=lw); line([[x, yf - 44 * s], [x + 12 * s, yf]], t + .29, .07, lw=lw)
    line([[x - 20 * s, yf - 70 * s], [x + 20 * s, yf - 70 * s]], t + .36, .07, lw=lw)

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


# ===================================================================== zones: laid out in layout coords, then spaced apart
ZONES = []          # [name, band, first element index]
def Z(name, band): ZONES.append([name, band, len(E)])
def shift(e, dx):
    for k in ('xy', 'from', 'to', 'c'):
        if k == 'to' and e.get('kind') == 'count': continue   # a count's 'to' holds its numbers, not a point
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
    if 'ext' in e: e['ext'] = [[q[0] + dx] + q[1:] for q in e['ext']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y] for x, y in st['points']]
def objsize(src):
    m = meta(src); return m.get('size') or [m['w'], m['h']]
def bbox(e):
    """(is_text, t_start, [x0, y0, x1, y1]) in board px, generous for text (marker ≈ .55 em per glyph)"""
    ty = e['type']
    if ty == 'ink':
        k = e['kind']; t = e.get('t', 0)
        if k in ('write', 'count'):
            txt = e['text'].replace('{0}', '000'); s = e['size']; w = len(txt) * s * .55; x, y = e['xy']
            if e.get('align') == 'right': x -= w
            elif e.get('align') == 'center': x -= w / 2
            return True, t, [x - 10, y - s * .85, x + w + 10, y + s * .25]
        if k == 'line': P = e['points']
        elif k == 'hatch': P = [p for st in e['strokes'] for p in st['points']]; t = min(st['t'] for st in e['strokes'])
        elif k == 'dim': P = [e['from'], e['to']]
        elif k == 'ring':
            r = e['r'] if isinstance(e['r'], list) else [e['r'], e['r']]; P = [[e['c'][0] - r[0], e['c'][1] - r[1]], [e['c'][0] + r[0], e['c'][1] + r[1]]]
        else: return None
        xs = [q[0] for q in P]; ys = [q[1] for q in P]; lw = e.get('lw', 9) * 2
        return False, t, [min(xs) - lw, min(ys) - lw, max(xs) + lw, max(ys) + lw]
    if ty == 'tag':
        s = e['size']; x, y = e['xy']; w = len(e['text']) * s * .64 + s * 1.7
        return True, e['arrive']['t'], [x - s * .7, y - s * 1.0, x + w, y + s * 1.0]
    if ty == 'magnet':
        x, y = e['xy']; r = e['r'] + 10; return False, e['arrive']['t'], [x - r, y - r, x + r, y + r]
    if ty == 'print':
        W, H = objsize(e['src']); w = e.get('w') or e['h'] * W / H; h = w * H / W; x, y = e['xy']
        return False, e['arrive']['t'], [x - w / 2 - 30, y - h / 2 - 30, x + w / 2 + 30, y + h / 2 + 40]
    if ty == 'stamp':
        x, y = e['xy']; s = e['size']; w = len(e['text']) * s * .7 + s
        return True, e['t'], [x - w / 2, y - s * .9, x + w / 2, y + s * .9]
    return None
# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3)))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ЧТО ДЕРЖИТ ВЕС', 181.86)
type_card('ОДНА ТОЧКА НЕБА', 272.67)
type_card('КРАЙ, КОТОРЫЙ МЫ ВИДИМ', 361.97)

# ===================================================================== small drawn things
def galaxy(c, r, t, d=.5, color='graphite', lw=6, turns=1.1):   # a two-armed spiral seen face-on
    spiral(c, r, turns, t, d / 2, a0=0, sgn=1, color=color, lw=lw); spiral(c, r, turns, t + d / 2, d / 2, a0=180, sgn=1, color=color, lw=lw)
    line(circle(c, max(5, r * .12), 12), t, .08, color, lw)
def star(c, r, t, d=.35, color='graphite', lw=6):
    pts = [[c[0] + (r if i % 2 == 0 else r * .42) * math.cos(math.radians(-90 + 36 * i)),
            c[1] + (r if i % 2 == 0 else r * .42) * math.sin(math.radians(-90 + 36 * i))] for i in range(11)]
    return line(pts, t, d, color, lw)
def voyager(x, y, t, s=1.0, lw=5):   # the probe in marker: dish (facing right), bus, magnetometer boom, antennas
    line([[x, y - 42 * s], [x, y + 42 * s]], t, .1, lw=lw)
    line(arc((x, y), 18 * s, 42 * s, -90, 90, 16), t + .1, .15, lw=lw)
    line([[x - 4 * s, y - 14 * s], [x - 40 * s, y - 14 * s], [x - 40 * s, y + 14 * s], [x - 4 * s, y + 14 * s]], t + .25, .12, lw=lw)
    line([[x - 40 * s, y + 4 * s], [x - 150 * s, y + 40 * s]], t + .37, .12, lw=lw - 1)
    line([[x - 22 * s, y + 14 * s], [x - 60 * s, y + 70 * s]], t + .49, .08, lw=lw - 2)
def wavy(p0, p1, t, d, color='blue', lw=6, amp=14, waves=8, **k):   # a light ray: a wave along p0 → p1
    L_ = math.hypot(p1[0] - p0[0], p1[1] - p0[1]); ux, uy = (p1[0] - p0[0]) / L_, (p1[1] - p0[1]) / L_; n = waves * 12
    pts = [[p0[0] + ux * L_ * i / n - uy * amp * math.sin(2 * math.pi * waves * i / n) * min(1, (n - i) / 12),
            p0[1] + uy * L_ * i / n + ux * amp * math.sin(2 * math.pi * waves * i / n) * min(1, (n - i) / 12)] for i in range(n + 1)]
    return line(pts, t, d, color, lw, arrow=True, **k)
def dots(pts, t, d, color='graphite', lw=8, alpha=.85):   # tiny galaxies: short dabs, each with its own time
    strokes = [dict(points=[[x, y], [x + 7, y - 3]], t=round(t + d * i / len(pts), 3), d=.04, lw=lw) for i, (x, y) in enumerate(pts)]
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1, t, d, color='graphite', lw=7, **k): return line([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], t, d, color, lw, **k)
def polar(c, a, r): return [c[0] + r * math.cos(math.radians(a)), c[1] + r * math.sin(math.radians(a))]

# ===================================================================== UPPER BAND · «ОДНА ТОЧКА НЕБА»
# --- P16 273.67–286.37: Andromeda, the nearest big neighbour, ≈ 2.5 million light years; we see her as she was then
Z('1', 'up')
MW = (520, 1000)
write('ближайшая крупная соседка', 300, 560, L(273.75), 1.3, 'graphite', 66)
galaxy(MW, 80, L(274.0), .6)
write('мы', 490, 1150, L(274.5), .3, 'graphite', 56)
AND = (1650, 965); AW = 560
printd('andromeda', 'print_andromeda', AND[0], AND[1], L(274.95), w=AW, rot=1.5, size='big')
magnet(AND[0] - 235, AND[1] - 255, L(275.35), r=20); magnet(AND[0] + 238, AND[1] - 250, L(275.45), r=20)
tag('галактика Андромеды', 1400, 615, L(275.3), size=50, rot=-1.5)
ink('dim', L(276.35), 1.3, 'blue', **{'from': [MW[0], 1400], 'to': [AND[0], 1400]}, lw=7,
    ext=[[MW[0], 1090, 1420], [AND[0], 1270, 1420]], ea=1.6, eb=2.2)
count('≈ {0},{1} млн световых лет', [2, 5], 1085, 1368, L(276.6), 2.6, size=64, align='center')
wavy([AND[0] - 300, AND[1] - 10], [MW[0] + 120, MW[1] - 5], L(279.75), 2.2, 'blue', 6, amp=13, waves=9)
write('свет вышел в путь 2,5 млн лет назад', 520, 1530, L(279.9), 2.1, 'graphite', 58)
write('мы видим её такой, какой она была тогда', 520, 1625, L(283.4), 2.5, 'graphite', 58)

# --- P17 286.91–301.59: Voyager would need ≈ 44 billion years; the Universe is ≈ 13.8; it would not make it
Z('2', 'up')
X0, K = 2400, 32                       # 0 at x 2400, 32 board px per billion years (one scale for both bars)
YA, YB = 830, 1180
voyager(2330, YA, L(286.95), 1.0)
write('Вояджеру до Андромеды', 2180, 700, L(287.0), 1.3, 'graphite', 58)
line([[X0, YA], [X0 + 44 * K, YA]], L(287.6), 2.6, 'blue', 10, ea=1.5, eb=1.8)
line([[X0 + 44 * K, YA - 26], [X0 + 44 * K, YA + 26]], L(290.2), .1, 'blue', 6)
count('≈ {0} млрд лет', [44], X0 + 44 * K, YA - 40, L(288.9), 2.0, size=80, align='right')
tag('наш расчёт', 2420, 960, L(290.9), size=46, rot=-1.5)
write('возраст Вселенной', X0, YB - 70, L(292.15), 1.1, 'graphite', 56)
line([[X0, YB], [X0 + 13.8 * K, YB]], L(292.6), .8, 'blue', 10)
line([[X0 + 13.8 * K, YB - 26], [X0 + 13.8 * K, YB + 26]], L(293.4), .1, 'blue', 6)
count('≈ {0},{1} млрд лет', [13, 8], X0 + 13.8 * K + 40, YB + 20, L(293.2), 2.6, size=80)
line([[X0 + 13.8 * K, YB - 30], [X0 + 13.8 * K, YA + 20]], L(297.3), .4, 'grey', 5, dash=[16, 12])
ink('ring', L(297.75), .6, 'red', c=[X0 + 13.8 * K, YA], r=[44, 40], lw=7)
write('зонд не успел бы', 2900, 1000, L(298.1), 1.1, 'red', 64)
write('даже стартуй он в момент её рождения', X0, 1330, L(299.3), 2.1, 'graphite', 54)

# --- P18 302.14–310.57: the Milky Way and Andromeda in the Local Group: more than 50 galaxies held by gravity
Z('3', 'up')
LG = (5320, 1000); LRX, LRY = 520, 330
MW3, AN3 = (5150, 1060), (5480, 930)
galaxy(MW3, 55, L(302.3), .5, lw=5)
write('мы', 5115, 1170, L(302.7), .3, 'graphite', 48)
galaxy(AN3, 70, L(303.2), .5, lw=5)
write('Андромеда', 5420, 1052, L(303.6), .7, 'graphite', 48)
line([[LG[0] + LRX * math.cos(math.radians(a)), LG[1] + LRY * math.sin(math.radians(a))] for a in range(-90, 271, 6)],
     L(304.6), 1.4, 'graphite', 7, dash=[24, 18])
tag('Местная группа', 4800, 610, L(305.2), size=54, rot=-1.5)
count('больше {0} галактик', [50], 4800, 1470, L(306.9), 1.6, size=72)
rnd = random.Random(7); pts = []
while len(pts) < 54:
    a = rnd.uniform(0, 2 * math.pi); q = math.sqrt(rnd.uniform(.05, .88))
    x, y = LG[0] + LRX * q * math.cos(a), LG[1] + LRY * q * math.sin(a)
    if math.hypot(x - MW3[0], y - MW3[1]) < 100 or math.hypot(x - AN3[0], y - AN3[1]) < 115: continue
    if (5090 < x < 5200 and 1110 < y < 1190) or (5400 < x < 5680 and 1000 < y < 1070): continue
    if any(math.hypot(x - p[0], y - p[1]) < 42 for p in pts): continue
    pts.append((x, y))
dots(pts, L(307.2), 2.2)
for i, a in enumerate((-60, 10, 80, 150, 215)):
    p0 = [LG[0] + (LRX + 90) * math.cos(math.radians(a)), LG[1] + (LRY + 80) * math.sin(math.radians(a))]
    p1 = [LG[0] + (LRX + 20) * math.cos(math.radians(a)), LG[1] + (LRY + 15) * math.sin(math.radians(a))]
    arrow(p0, p1, L(308.7) + .15 * i, .2, 'graphite', 5)
write('держатся вместе силой тяжести', 4800, 1575, L(308.4), 2.0, 'graphite', 56)

# --- P18 310.57–317.94: one more step of the ruler: star, galaxy, group of galaxies; the steps only get higher
Z('4', 'up')
SX, TW, RS = 6400, 520, 220            # stairs: first tread at x 6400, tread width, rise
tag('ещё одна ступень', 6400, 600, L(310.7), size=52, rot=-1.5)
st = [[SX, 1500 + RS]]
for i in range(3): st += [[SX + TW * i, 1500 - RS * i], [SX + TW * (i + 1), 1500 - RS * i]]
line([[SX - 80, 1500 + RS], [SX, 1500 + RS], [SX, 1500]] + st[1:], L(311.2), 1.3, 'graphite', 9)
star((SX + 130, 1415), 42, L(312.85))
write('звезда', SX + 40, 1580, L(312.95), .6, 'graphite', 60)
galaxy((SX + TW + 150, 1185), 52, L(313.55), .5, lw=5)
write('галактика', SX + TW + 40, 1360, L(313.7), .7, 'graphite', 60)
for i, (dx, dy, r) in enumerate(((100, 990, 30), (190, 950, 22), (260, 1000, 26), (165, 1020, 14), (320, 960, 16))):
    galaxy((SX + 2 * TW + dx, dy), r, L(314.25) + .08 * i, .2, lw=4)
write('группа галактик', SX + 2 * TW + 40, 1140, L(314.4), 1.0, 'graphite', 56)
x3 = SX + 3 * TW
line([[x3, 1500 - RS * 2], [x3, 1500 - RS * 3], [x3 + TW, 1500 - RS * 3], [x3 + TW, 1500 - RS * 4], [x3 + TW * 2, 1500 - RS * 4]],
     L(315.4), 1.0, 'graphite', 7, dash=[22, 18])
arrow([x3 + 2 * TW + 50, 1500 - RS * 4 + 10], [x3 + 2 * TW + 50, 1500 - RS * 5 + 20], L(316.4), .35, 'graphite', 7)
write('дальше — только выше', x3 + 40, 920, L(316.5), 1.3, 'graphite', 58)

# ===================================================================== (318.50–359.80: the Hubble deep field clip covers the board)
# ===================================================================== LOWER BAND · «КРАЙ, КОТОРЫЙ МЫ ВИДИМ»
# --- P22 384.70–393.28 (zone 5b, left of the circle): space stretched while the light flew; it is an estimate
Z('5b', 'lo')
SX0, S1, S2 = 300, 2860, 3200          # the same ruler before and after: ticks spread, the source recedes
write('пока свет летел', SX0, 2720, L(384.8), 1.0, 'graphite', 60)
line(circle((SX0, S1), 9, 12), L(384.7), .1, 'graphite', 6)
for i in range(1, 6): line([[SX0 + 110 * i, S1 - 22], [SX0 + 110 * i, S1 + 22]], L(384.75) + .05 * i, .06, 'grey', 5)
line([[SX0, S1], [SX0 + 550, S1]], L(384.7), .3, 'grey', 4)
star((SX0 + 550, S1 - 75), 28, L(385.0), .25, lw=5)
wavy([SX0 + 525, S1 - 75], [SX0 + 25, S1 - 60], L(385.2), 1.0, 'blue', 5, amp=9, waves=7)
line(circle((SX0, S2), 9, 12), L(386.25), .1, 'graphite', 6)
for i in range(1, 6): line([[SX0 + 200 * i, S2 - 22], [SX0 + 200 * i, S2 + 22]], L(386.3) + .05 * i, .06, 'grey', 5)
line([[SX0, S2], [SX0 + 1000, S2]], L(386.25), .4, 'grey', 4)
for i in range(1, 6): line([[SX0 + 110 * i, S1 + 30], [SX0 + 200 * i, S2 - 30]], L(386.6) + .08 * i, .2, 'blue', 4, dash=[12, 10])
write('пространство растягивалось', SX0, S2 + 130, L(386.4), 1.5, 'graphite', 60)
star((SX0 + 1000, S2 - 75), 28, L(388.15), .25, lw=5)
arrow([SX0 + 585, S1 - 60], [SX0 + 975, S2 - 100], L(388.3), .5, 'graphite', 5)
write('источник уходил всё дальше', SX0, S2 + 235, L(388.5), 1.7, 'graphite', 60)
tag('оценка', SX0 + 30, S2 + 380, L(390.6), size=52, rot=-1.5)
write('может уточняться', SX0 + 340, S2 + 400, L(391.5), 1.4, 'graphite', 58)

# --- P21 362.97–377.65: age ≈ 13.8 billion years; farther light has not reached us; the border: the observable Universe
Z('5', 'lo')
CX5 = 2000                            # the text column starts here; the circle sits 1700 px to its right
O, R = (CX5 + 2800, 3300), 520
line(circle(O, 10, 14), L(363.05), .12, 'graphite', 7)
write('мы', O[0] + 30, O[1] + 80, L(363.2), .3, 'graphite', 52)
write('возраст Вселенной', CX5, 2720, L(363.1), 1.2, 'graphite', 62)
count('≈ {0},{1} млрд лет', [13, 8], CX5, 2850, L(365.3), 2.4, size=92)
for i, a in enumerate((-75, -110, -145)):
    arrow(polar(O, a, .93 * R), polar(O, a, .3 * R), L(368.1) + .3 * i, .4, 'blue', 6)
for i, a in enumerate((-150, -165, 165, 150)):
    line([polar(O, a, 1.45 * R), polar(O, a, 1.1 * R)], L(369.3) + .3 * i, .35, 'blue', 5, dash=[14, 12], arrow=True)
write('свет не успел дойти', CX5, 3010, L(369.9), 1.6, 'graphite', 60)
line(circle(O, R, 90), L(372.4), 1.6, 'graphite', 10)
tag('наблюдаемая Вселенная', CX5 + 30, 3160, L(375.0), size=50, rot=-1.5)
# --- P22 378.20–384.70: ≈ 93 billion ly across; how, if the age is less?   (393.28–397.24: Voyager still inside our galaxy)
DY = 2700
ink('dim', L(378.3), 1.2, 'blue', **{'from': [O[0] - R, DY], 'to': [O[0] + R, DY]}, lw=7,
    ext=[[O[0] - R, O[1] - 20, DY - 20], [O[0] + R, O[1] - 20, DY - 20]])
count('≈ {0} млрд световых лет', [93], O[0], DY - 35, L(378.9), 2.0, size=80, align='center')
write('как так,', CX5, 3330, L(382.85), .6, 'graphite', 58)
write('если возраст меньше?', CX5, 3410, L(383.4), 1.2, 'graphite', 58)
write('93 > 13,8', CX5, 3545, L(384.1), .8, 'red', 90)
galaxy(O, 44, L(393.35), .5, lw=4)
write('Вояджер до сих пор', O[0], O[1] + 205, L(393.6), 1.2, 'graphite', 50, align='center')
write('внутри нашей галактики', O[0], O[1] + 280, L(394.8), 1.5, 'graphite', 50, align='center')
arrow([O[0], O[1] + 150], [O[0], O[1] + 58], L(396.3), .3, 'graphite', 5)
# --- P23 397.80–414.91: the farthest light: the CMB; its source ≈ 46 billion ly today; radius, diameter twice
CMB = (O[0] + 1000, 2770); TX = O[0] + 700
printd('cmb', 'print_cmb', CMB[0], CMB[1], L(400.3), w=760, rot=-1.5, size='mid')
magnet(CMB[0] - 340, CMB[1] - 180, L(400.65), r=20); magnet(CMB[0] + 340, CMB[1] - 185, L(400.75), r=20)
tag('реликтовое излучение', TX, 3060, L(400.6), size=50, rot=-1)
write('остывшее свечение юной Вселенной', TX, 3200, L(402.3), 2.0, 'graphite', 52)
E_ = polar(O, -35, R)
line([[CMB[0] - 400, CMB[1] + 150], [E_[0] + 22, E_[1] - 6]], L(404.0), .4, 'graphite', 5, dash=[14, 12], arrow=True)
ink('dim', L(406.1), 1.1, 'blue', **{'from': list(O), 'to': E_}, lw=7)
count('≈ {0} млрд световых лет', [46], TX, 3370, L(408.7), 2.1, size=76)
write('радиус', TX, 3470, L(411.0), .7, 'blue', 58)
write('диаметр вдвое больше', TX, 3570, L(412.95), 1.5, 'graphite', 58)

# --- P24 415.46–434.14: a rough estimate: Voyager would cross it in > a quadrillion years, 120 000 × the age; number game
Z('6', 'lo')
tag('условная прикидка', 3700, 2660, L(415.5), size=54, rot=-1.5)
voyager(3860, 2880, L(416.9), 1.0)
line([[3900, 2880], [4880, 2880]], L(417.4), 2.0, 'graphite', 6, dash=[22, 18], arrow=True)
write('больше квадриллиона лет', 3700, 3100, L(419.85), 1.6, 'blue', 84)
write('1 000 000 000 000 000', 3700, 3225, L(421.0), 1.0, 'blue', 66)
count('в {0} 000 раз дольше', [120], 3700, 3400, L(421.7), 2.2, size=84)
write('возраста Вселенной', 3700, 3500, L(424.1), 1.3, 'graphite', 60)
tag('игра цифр', 3730, 3660, L(425.7), size=50, rot=1.2)
write('расширение не учтено', 4160, 3680, L(427.0), 1.7, 'graphite', 56)
line([[3700, 3128], [4760, 3122]], L(429.8), .5, 'red', 7)
CB = (5100, 3300)                      # the courier's parcel
rect(CB[0] - 100, CB[1] - 100, CB[0] + 100, CB[1] + 100, L(431.3), .5, 'graphite', 7)
line([[CB[0] - 100, CB[1] - 100], [CB[0] - 50, CB[1] - 150], [CB[0] + 150, CB[1] - 150], [CB[0] + 100, CB[1] - 100]], L(431.8), .3, 'graphite', 7)
line([[CB[0] + 150, CB[1] - 150], [CB[0] + 150, CB[1] + 50], [CB[0] + 100, CB[1] + 100]], L(432.1), .2, 'graphite', 7)
line([[CB[0], CB[1] - 100], [CB[0], CB[1] + 100]], L(432.3), .15, 'grey', 5)
tag('курьерская служба', 4950, 3080, L(431.35), size=46, rot=-1)
stamp('ОТКАЗ', CB[0] + 30, CB[1] + 30, L(433.45), size=90, rot=-10)

# --- P25 434.69–452.58: how many galaxies? ≈ 2 trillion by a model on Hubble data; New Horizons measured less light
Z('7', 'lo')
write('сколько галактик?', 5800, 2700, L(434.8), 1.4, 'graphite', 80)
rnd = random.Random(11); fld = []
while len(fld) < 110:
    x, y = rnd.uniform(5820, 6520), rnd.uniform(2810, 3260)
    if any(math.hypot(x - p[0], y - p[1]) < 30 for p in fld): continue
    fld.append((x, y))
dots(fld, L(437.4), 2.4, lw=7)
tag('модель по данным «Хаббла»', 5830, 3370, L(437.3), size=46, rot=-1)
count('≈ {0} трлн', [2], 5800, 3545, L(440.15), 1.6, size=110)
NH = (7050, 2950)
printd('newhorizons', 'print_newhorizons', NH[0], NH[1], L(442.2), w=420, rot=1.5)
magnet(NH[0] - 170, NH[1] - 175, L(442.55), r=18); magnet(NH[0] + 175, NH[1] - 170, L(442.65), r=18)
tag('«Новые горизонты»', 6850, 3240, L(442.7), size=46, rot=-1.5)
for i, y in enumerate((2880, 3020, 3160)):
    line([[6560, y], [6815, 2950 + (y - 3020) * .3]], L(444.5) + .2 * i, .3, 'blue', 5, dash=[12, 10], arrow=True)
write('свет слабых галактик вместе', 6850, 3375, L(444.6), 1.7, 'graphite', 50)
line([[7650, 3500], [8060, 3500]], L(446.4), .25, 'graphite', 7)
rect(7700, 3000, 7800, 3500, L(446.55), .5, 'graphite', 6, dash=[16, 12])
rect(7880, 3250, 7980, 3500, L(447.1), .4, 'blue', 7)
dots([(7895 + 20 * (i % 4), 3290 + 45 * (i // 4)) for i in range(20)], L(447.4), .4, 'blue', 6, .6)
write('ждали', 7680, 3575, L(446.9), .5, 'graphite', 46)
write('измерили', 7860, 3575, L(447.4), .5, 'blue', 46)
write('заметно меньше, чем ждали', 7650, 2930, L(447.6), 1.5, 'graphite', 52)
write('число галактик это не ограничивает', 5800, 3700, L(449.3), 2.2, 'graphite', 58)
stamp('СПОР ОТКРЫТ', 7350, 3700, L(451.75), size=80, rot=-7)

# ===================================================================== camera (one continuous camera; only the cards and the clip hide it)
ZR = {name: (k0, ZONES[i + 1][2] if i + 1 < len(ZONES) else len(E)) for i, (name, band, k0) in enumerate(ZONES)}
BAND = {name: band for name, band, k0 in ZONES}
PAD = .05                                  # resolved frames keep 5 % in hand for the slow push-ins
DBG = []
def e_txt(*b): return [round(v) for v in b]
def resolve(box, t_end, zmax=9, els=None):
    """Grow a framing box until nothing visible is cut by the frame edge (text) or sits in the subtitle band (anything)."""
    box = list(box); B = [b for b in (bbox(e) for e in (E if els is None else els)) if b and b[1] < t_end]
    for _ in range(12):
        x, y, z = fit(box, zmax); z *= 1 - PAD
        vx0, vx1, vy0, vy1 = x - 960 / z, x + 960 / z, y - 540 / z, y + 540 / z; band = y + (830 - 540) / z
        changed = False
        for txt, _, (x0, y0, x1, y1) in B:
            if x1 < vx0 or x0 > vx1 or y1 < vy0 or y0 > vy1: continue
            need = (y1 > band) or (txt and (x0 < vx0 + 20 / z or x1 > vx1 - 20 / z or y0 < vy0 + 35 / z))
            if not need: continue
            nb = [min(box[0], x0), min(box[1], y0) if txt else box[1], max(box[2], x1), max(box[3], y1)]
            if nb != box: box = nb; changed = True; DBG.append((t_end, e_txt(x0, y0, x1, y1)))
        if not changed: break
    return box
def view(box, zmax):
    x, y, z = fit(box, zmax); z *= 1 - PAD; return x - 960 / z, x + 960 / z
SHOTS = []
def shot(t, d, zone, box, zmax=9, a=2, b=2.6, push=None):
    SHOTS.append(dict(t=t, d=d, zone=zone, box=list(box) if box else None, zmax=zmax, a=a, b=b, push=push))
shot(0, 0, '1', [280, 470, 1300, 1200], zmax=1.1)
shot(L(274.75), 1.5, '1', [280, 470, 1960, 1300], zmax=1.1)                   # the print lands
shot(L(276.2), 1.4, '1', [280, 470, 1960, 1680], zmax=1.1, b=3)              # distance, light, «тогда»
shot(L(286.55), 1.5, '2', [2150, 620, 3300, 1050], zmax=1.1)                  # Voyager, ride the 44 bar
shot(L(288.4), 2.2, '2', [2150, 620, 3880, 1060], zmax=1.1, a=1.8, b=2.4)
shot(L(291.8), 1.4, '2', [2150, 620, 3880, 1380], zmax=1.1, b=3)             # the age bar, the red ring
shot(L(301.75), 1.5, '3', [4750, 520, 5900, 1620], zmax=1.1)                  # the Local Group
shot(L(310.25), 1.5, '4', [6330, 520, 8000, 1760], zmax=1.1)                  # the ladder
shot(L(315.2), 1.3, '4', [6330, 440, 9100, 1760], zmax=1.1, b=3, push=(L(318.6), 40.5, 1.04))   # (under the clip) slow push
shot(L(359.85), 2.0, 'up', None, b=3)                                         # pull-back: the chapter as a whole
shot(L(362.0), .8, '5', [1950, 2620, 5350, 3950])                             # (under the card) the column and the circle
shot(L(378.05), 1.3, '5', [1950, 2560, 5350, 3950], b=3)                      # 93 billion ly above
shot(L(384.45), 1.4, '5b', [250, 2620, 1450, 3700], b=3)                      # the stretch, the estimate
shot(L(393.0), 1.4, '5', [4220, 2700, 5380, 3880], b=3)                       # Voyager inside our galaxy
shot(L(397.65), 1.5, '5', [4220, 2560, 6150, 3950], b=3)                      # the CMB, the radius
shot(L(415.1), 1.6, '6', [3650, 2580, 5600, 3760], push=(L(417.0), 12.0, 1.03))   # the quadrillion
shot(L(434.45), 1.5, '7', [5750, 2620, 6700, 3600])                           # how many galaxies
shot(L(441.85), 1.5, '7', [5750, 2620, 8400, 3800], b=3, push=(L(443.5), 8.5, 1.02))
shot(L(452.65), 2.0, 'lo', None, b=3)                                         # pull-back: the chapter as a whole
# pass 1: frame each shot against its own zone only, see how far each zone's frames reach sideways
reach = {}
for i, s_ in enumerate(SHOTS):
    if s_['zone'] not in ZR: continue
    k0, k1 = ZR[s_['zone']]; t_end = SHOTS[i + 1]['t'] if i + 1 < len(SHOTS) else DUR
    s_['box'] = resolve(s_['box'], t_end, s_['zmax'], E[k0:k1])
    v0, v1 = view(s_['box'], s_['zmax']); r = reach.setdefault(s_['zone'], [v0, v1])
    r[0] = min(r[0], v0); r[1] = max(r[1], v1)
# space the zones of each band so that no frame sees its neighbour
OFF, last = {}, {}
for name, band, k0 in ZONES:
    k0, k1 = ZR[name]; bbs = [b[2] for b in (bbox(e) for e in E[k0:k1]) if b]
    mn, mx = min(b[0] for b in bbs), max(b[2] for b in bbs)
    lr = reach.get(name, [mn, mx]); lr = [min(lr[0], mn), max(lr[1], mx)]
    if band not in last: dx = 0
    else:
        prev_mx, prev_reach = last[band]
        dx = max(prev_mx + (mn - lr[0]), prev_reach) + 250 - mn
    for e in E[k0:k1]: shift(e, dx)
    OFF[name] = dx; last[band] = (mx + dx, lr[1] + dx)
BW = int(max(v[1] for v in last.values()) + 300)
def whole(bands):
    bbs = [b[2] for name, band, k0 in ZONES if band in bands for b in (bbox(e) for e in E[ZR[name][0]:ZR[name][1]]) if b]
    return [min(q[0] for q in bbs) - 60, min(q[1] for q in bbs) - 60, max(q[2] for q in bbs) + 60, max(q[3] for q in bbs) + 60]
for i, s_ in enumerate(SHOTS):
    if s_['zone'] in ZR:
        s_['box'] = [s_['box'][0] + OFF[s_['zone']], s_['box'][1], s_['box'][2] + OFF[s_['zone']], s_['box'][3]]
        t_end = SHOTS[i + 1]['t'] if i + 1 < len(SHOTS) else DUR
        s_['box'] = resolve(s_['box'], t_end, s_['zmax'])          # pass 2 (should change nothing)
    else: s_['box'] = whole({s_['zone']})
s0 = SHOTS[0]; c = Cam(*fit(s0['box'], s0['zmax']))
for s_ in SHOTS[1:]:
    c.fit(s_['t'], s_['d'], s_['box'], s_['zmax'], a=s_['a'], b=s_['b'])
    if s_['push']: pt, pd, pk = s_['push']; c.to(pt, pd, z=z_of(c) * pk)
print('DBG', DBG); print('zone offsets', {k: round(v) for k, v in OFF.items()}, 'board w', BW)
for s_ in SHOTS: print('  shot %.2f  box %s  z %.3f' % (s_['t'], [round(v) for v in s_['box']], fit(s_['box'], s_['zmax'])[2]))

scene = dict(dur=DUR, board=dict(w=BW, h=BH, seed=43, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
