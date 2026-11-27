#!/usr/bin/env python3
"""«Мысленный эксперимент» · Высота зданий · board film, part CD: chapters «ЧТО ДЕРЖИТ ВЕС» and «ВЕТЕР».
FILM range 181.86–350.23 s (168.37 s). The renderer works in LOCAL time:  local = film − 181.86.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/building_height/film.json (segs → captions).
Wall: upper band (y 380…1850) = «ЧТО ДЕРЖИТ ВЕС», lower band (y 2550…3950) = «ВЕТЕР».
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the break.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
R0, R1 = 181.86, 350.23
DUR = round(R1 - R0, 3)                       # 168.37
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 14200, 4700

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
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
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
GAP = 1700
def space_zones():
    off = {}; last = {}
    for i, (name, band, k0) in enumerate(ZONES):
        k1 = ZONES[i + 1][2] if i + 1 < len(ZONES) else len(E)
        bbs = [b[2] for b in (bbox(e) for e in E[k0:k1]) if b]
        mn, mx = min(b[0] for b in bbs), max(b[2] for b in bbs)
        dx = 0 if band not in last else last[band] + GAP - mn
        for e in E[k0:k1]: shift(e, dx)
        off[name] = dx; last[band] = mx + dx
    return off, last

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3)))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ЧТО ДЕРЖИТ ВЕС', 181.86)
type_card('ВЕТЕР', 260.09)

# ===================================================================== UPPER BAND · «ЧТО ДЕРЖИТ ВЕС»
# --- P1 182.86–198.53: floors carry the floors above; 192 piles ≈ 43 m; a pile hands the weight to dense ground
Z('1', 'up')
GY = 1200
line([[300, GY], [1520, GY]], L(182.95), .3, lw=10)
hatch(300, 1520, GY, L(183.1), .4, 16, down=True)
line([[360, 560], [600, 560], [600, GY], [360, GY], [360, 560]], L(183.0), .7, lw=8)
for i in range(1, 6): line([[360, 560 + 107 * i], [600, 560 + 107 * i]], L(183.55) + .07 * i, .08, lw=6)
for i in range(6):     # the weight grows floor by floor (blue: a measured quantity)
    arrow([650, 575 + 107 * i], [650, 650 + 107 * i], L(183.95) + .2 * i, .18, 'blue', 4 + 1.6 * i)
write('низ несёт весь верх', 320, 480, L(184.0), 1.3, 'graphite', 70)
BURJ_H = 760
printd('burj', 'burj', 1010, GY - BURJ_H / 2, L(185.35), h=BURJ_H, rot=-1.5, size='big')
magnet(1005, 560, L(185.9), r=20); magnet(1012, 1110, L(186.0), r=20)
tag('Бурдж-Халифа', 1180, 640, L(186.1), size=50, rot=-2)
for i in range(6): line([[900 + 40 * i, GY + 10], [900 + 40 * i, GY + 430]], L(186.5) + .12 * i, .25, lw=8)
count('{0} сваи', [192], 1220, 1380, L(186.7), 1.7, size=110)
ink('dim', L(188.6), .7, 'blue', **{'from': [860, GY + 10], 'to': [860, GY + 430]}, lw=7)
write('≈ 43 м', 835, 1450, L(189.4), .6, 'blue', 84, align='right')
write('свая = бетонный столб', 1220, 1510, L(191.2), 1.5, 'graphite', 60)
arrow([1210, 1490], [1112, 1455], L(192.7), .25, 'graphite', 5)
arrow([1000, GY + 40], [1000, GY + 400], L(193.0), .9, 'blue', 9)
line([[820, GY + 440], [1180, GY + 440]], L(193.9), .3, lw=8)
hatch(820, 1180, GY + 440, L(194.1), .6, 12, color='graphite', down=True)
write('плотный слой', 1220, GY + 480, L(195.75), .9, 'graphite', 60)
write('не проседает', 1220, GY + 580, L(196.9), .9, 'graphite', 60)

# --- P2 199.08–212.69: Y plan — three wings lean on the core and on each other
Z('2', 'up')
YC = (2560, 900)
tag('вид сверху', 2130, 470, L(199.2), size=48, rot=-1.5)
line(circle(YC, 80, 36), L(201.3), .45, lw=9)
for i, a in enumerate((-90, 30, 150)): line(wing(YC, a, 80, 360, 70), L(201.75) + .45 * i, .45, lw=8)
write('3 крыла', 2130, 1260, L(201.9), .7, 'graphite', 66)
write('ствол', 2740, 720, L(203.1), .6, 'graphite', 62)
arrow([2735, 735], [2625, 845], L(203.6), .25, 'graphite', 5)
for i, a in enumerate((-90, 30, 150)):
    u = (math.cos(math.radians(a)), math.sin(math.radians(a)))
    arrow([YC[0] + u[0] * 330, YC[1] + u[1] * 330], [YC[0] + u[0] * 125, YC[1] + u[1] * 125], L(203.7) + .3 * i, .3, 'blue', 6)
PC = 3270              # three people standing back to back (side view; the third one behind, in grey)
t0 = L(205.65)
line(circle((PC, 722), 25, 18), t0, .12, 'grey', 5); line([[PC, 748], [PC, 940], [PC - 22, 1080]], t0 + .12, .2, 'grey', 5); line([[PC, 940], [PC + 22, 1080]], t0 + .3, .08, 'grey', 5)
for k, sg in enumerate((-1, 1)):
    q = lambda x, y: [PC + sg * x, y]; t1 = t0 + .45 + .55 * k
    line(circle(q(52, 762), 30, 18), t1, .12, lw=6)
    line([q(30, 795), q(88, 945), q(168, 1080)], t1 + .12, .2, lw=6); line([q(88, 945), q(128, 1080)], t1 + .32, .08, lw=6)
    line([q(38, 840), q(122, 905)], t1 + .4, .1, lw=6)
line([[PC - 210, 1080], [PC + 210, 1080]], t0 + 1.5, .2, lw=6)
write('спиной к спине', 3050, 1200, L(207.0), 1.2, 'graphite', 64)
write('крепче простой колонны', 2130, 1450, L(208.6), 1.6, 'graphite', 66)
write('и не тяжелее нужного', 2130, 1560, L(211.1), 1.3, 'graphite', 66)

# --- P3 213.24–228.10: concrete pumped 606 m up in 2008 (record); cooled in the Dubai heat
Z('3', 'up')
TX, TG = 4400, 1650
line([[3650, TG], [4750, TG]], L(213.3), .3, lw=10)
line(mirror([[TX - 120, TG], [TX - 100, 1300], [TX - 75, 1000], [TX - 50, 750], [TX - 20, 560], [TX, 450]], TX), L(213.5), 1.2, lw=8)
line([[3990, 1560], [4150, 1560], [4150, 1625], [3990, 1625], [3990, 1560]], L(214.9), .4, lw=7)
line(circle((4020, 1636), 13, 14), L(215.3), .1, lw=5); line(circle((4120, 1636), 13, 14), L(215.4), .1, lw=5)
write('2008', 4650, 880, L(215.9), .6, 'graphite', 80)
line([[4150, 1590], [TX, 1590], [TX, 560]], L(216.4), 2.0, lw=8, ea=1.6, eb=2)
for i, y in enumerate((1430, 1180, 930, 690)): arrow([TX + 40, y + 70], [TX + 40, y], L(217.6) + .3 * i, .2, 'blue', 5)
write('насос', 3990, 1530, L(218.4), .5, 'graphite', 54)
ink('dim', L(218.5), 1.2, 'blue', **{'from': [4580, TG], 'to': [4580, 560]}, lw=8, ea=1.6, eb=2.4)
count('{0} м', [606], 4650, 700, L(219.0), 1.6, size=150)
tag('мировой рекорд', 4650, 1030, L(220.8), size=52, rot=-1.5)
line(circle((3790, 650), 50, 30), L(222.2), .35, lw=7)
for i in range(8):
    a = math.radians(i * 45); line([[3790 + 68 * math.cos(a), 650 + 68 * math.sin(a)], [3790 + 98 * math.cos(a), 650 + 98 * math.sin(a)]], L(222.55) + .04 * i, .05, lw=5)
write('жара', 3920, 690, L(222.9), .5, 'graphite', 64)
for i in range(3):
    a = math.radians(i * 60); line([[3720 - 55 * math.cos(a), 950 - 55 * math.sin(a)], [3720 + 55 * math.cos(a), 950 + 55 * math.sin(a)]], L(224.0) + .12 * i, .1, lw=6)
write('бетон охлаждали', 3800, 975, L(224.45), 1.0, 'graphite', 58)
write('иначе схватится', 3660, 1130, L(225.6), .8, 'graphite', 56)
write('раньше времени', 3660, 1200, L(226.5), .8, 'graphite', 56)

# --- P4 228.81–247.71: strength is not the main barrier; the taper; the debate is about foundation and slenderness
Z('4', 'up')
DX = 6300
write('прочность материала', 5450, 600, L(228.9), 1.3, 'graphite', 72)
write('не главная преграда', 5450, 705, L(230.6), 1.4, 'red', 72)
line(mirror([[DX - 170, 1700], [DX - 140, 1400], [DX - 105, 1150], [DX - 70, 900], [DX - 35, 720], [DX, 650]], DX), L(232.25), 1.0, lw=8)
write('сужается кверху', 5450, 900, L(232.4), .9, 'graphite', 60)
for i, (y, ln) in enumerate(((760, 40), (980, 75), (1220, 115), (1480, 160))):
    arrow([6530, y], [6530, y + ln], L(233.9) + .25 * i, .2, 'blue', 5 + 2 * i)
write('нагрузка падает кверху', 6600, 1000, L(234.0), 1.3, 'blue', 56)
write('сталь и бетон справляются', 5450, 1040, L(235.2), 1.3, 'graphite', 54)
line([[6200, 650], [6560, 650]], L(237.4), .5, lw=6, dash=[22, 18])
write('нынешний рекорд', 6600, 665, L(237.6), 1.0, 'graphite', 54)
line([[DX - 35, 720], [DX - 14, 430]], L(239.0), .5, 'blue', 6, dash=[20, 16]); line([[DX + 35, 720], [DX + 14, 430]], L(239.1), .5, 'blue', 6, dash=[20, 16])
arrow([DX, 610], [DX, 420], L(239.6), .3, 'blue', 6)
write('материалы позволяют выше', 6600, 470, L(239.4), 1.6, 'graphite', 54)
line([[6050, 1700], [6550, 1700]], L(242.9), .3, lw=9); hatch(6050, 6550, 1700, L(243.1), .4, 10, down=True)
tag('фундамент', 5500, 1300, L(243.5), size=54, rot=-1.5)
tag('тонкость башни', 5500, 1470, L(244.6), size=54, rot=1.2)
tag('сталь сломается', 5500, 1640, L(245.9), size=54, rot=-1, strike=dict(t=L(246.8), d=.25, color='red')); ev(L(246.8), 'strike', .25)

# --- P5 248.40–257.75: Timur on the observation deck, the floor trembles; wind; coffee; it will sway
Z('5', 'up')
EX, EB = 7950, 1800
TOWER5 = [[EX - 90, EB], [EX - 60, 1000], [EX - 30, 760], [EX, 680]]
line(mirror(TOWER5, EX), L(248.5), .8, lw=8)
line([[EX + 40, 1000], [8280, 1000]], L(249.3), .3, lw=8); line([[8280, 1000], [8280, 945], [EX + 45, 945]], L(249.6), .3, lw=5)
stick(8140, 998, L(250.0), s=1.0, lw=5)
tag('Тимур', 8310, 850, L(250.4), size=44, rot=-2, amp=8)
for i in range(6):
    x0 = EX + 60 + i * 38; line([[x0, 1020], [x0 + 10, 1034], [x0 + 20, 1020], [x0 + 30, 1034]], L(251.0) + .08 * i, .08, lw=4)
write('пол дрожит', EX + 40, 1120, L(251.5), .8, 'graphite', 58)
for i, y in enumerate((800, 880, 960)):
    line([[7450, y], [7520, y - 12], [7600, y + 6], [7680, y - 8], [7770, y]], L(252.6) + .15 * i, .3, 'graphite', 6, arrow=True)
write('ветер', 7450, 735, L(252.9), .5, 'graphite', 64)
CUPX, CUPY = 8480, 1240
line([[CUPX - 70, CUPY], [CUPX - 55, CUPY + 140], [CUPX + 55, CUPY + 140], [CUPX + 70, CUPY]], L(253.7), .6, lw=7)
line(arc((CUPX + 70, CUPY + 60), 32, 38, -80, 100, 16), L(254.3), .2, lw=6)
line([[CUPX - 62, CUPY + 22], [CUPX - 30, CUPY + 12], [CUPX, CUPY + 24], [CUPX + 30, CUPY + 12], [CUPX + 62, CUPY + 22]], L(254.6), .3, 'water', 5)
write('кофе', CUPX - 70, CUPY + 220, L(254.9), .5, 'graphite', 56)
for k, deg in enumerate((-2.5, 2.5)):
    pts = rot_pts(mirror(TOWER5, EX), (EX, EB), deg)
    line(pts, L(256.35) + .4 * k, .5, 'blue', 5, dash=[20, 16])
line(arc((EX, EB), 1160, 1160, -94, -86, 12), L(257.1), .35, 'blue', 6, arrow=True)

# ===================================================================== LOWER BAND · «ВЕТЕР»
# --- P6 261.09–278.20: stronger wind up high; vortices shed from side to side; resonance, like a swing
Z('6', 'lo')
FB = 3950
line([[300, FB], [900, FB]], L(261.15), .25, lw=10); hatch(300, 900, FB, L(261.3), .3, 8, down=True)
line(mirror([[520, FB], [545, 3400], [570, 3000], [590, 2800], [600, 2700]], 600), L(261.2), .8, lw=8)
for i, (y, ln) in enumerate(((3800, 60), (3500, 110), (3200, 160), (2900, 210))):
    arrow([505 - ln - 30 * (i > 1), y], [505 + (i * 15), y], L(261.7) + .25 * i, .2, 'blue', 5 + i)
write('наверху сильнее', 650, 2790, L(262.3), .9, 'blue', 60)
tag('вид сверху', 1060, 2700, L(263.1), size=46, rot=-1.5)
VC = (1250, 3150)
line(circle(VC, 70, 32), L(263.2), .3, lw=8)
line([[1000, 3065], [1150, 3060], [1250, 3040], [1350, 3058]], L(263.5), .5, 'graphite', 5, arrow=True)
line([[1000, 3235], [1150, 3240], [1250, 3260], [1350, 3242]], L(263.7), .5, 'graphite', 5, arrow=True)
for i, (cx, cy, sg, ft) in enumerate(((1450, 3080, 1, 266.0), (1620, 3220, -1, 267.1), (1790, 3080, 1, 268.1), (1960, 3220, -1, 268.8))):
    spiral((cx, cy), 48, 1.5, L(ft), .45, a0=180, sgn=sg, lw=6)
write('вихри', 1500, 2960, L(266.4), .6, 'graphite', 62)
wave = [[1050 + i * 11, 3600 + (10 + 80 * i / 100) * math.sin(i * 2 * math.pi / 18)] for i in range(101)]
line(wave, L(269.4), 3.0, 'blue', 6, ease='linear')
write('качание', 1050, 3460, L(269.6), .8, 'blue', 56)
write('всё сильнее', 1720, 3800, L(272.0), .9, 'blue', 56)
write('резонанс', 2260, 3010, L(274.0), .9, 'red', 92)
line([[2330, 3700], [2380, 3150], [2620, 3150], [2670, 3700]], L(275.0), .6, lw=7)
SW = (2500, 3150); s25 = math.radians(25)
line([[2475, 3150], [2475 + 400 * math.sin(s25), 3150 + 400 * math.cos(s25)]], L(275.6), .2, lw=5)
line([[2525, 3150], [2525 + 400 * math.sin(s25), 3150 + 400 * math.cos(s25)]], L(275.7), .2, lw=5)
sx, sy = 2500 + 400 * math.sin(s25), 3150 + 400 * math.cos(s25)
line([[sx - 50, sy + 6], [sx + 60, sy - 6]], L(275.9), .15, lw=8)
line(arc(SW, 400, 400, 55, 125, 20), L(276.2), .5, 'blue', 5, dash=[18, 14])
arrow([sx + 120, sy - 70], [sx + 55, sy - 25], L(276.8), .3, 'blue', 7)
write('толчок вовремя', 2350, 3800, L(277.0), 1.0, 'graphite', 56)

# --- P7 278.90–295.67: the Y plan, setbacks in a spiral; the wind «gets confused»; wind tunnel, first version swayed too much
Z('7a', 'lo')
GC = (3700, 3150)
tag('Бурдж-Халифа', 3110, 2640, L(279.0), size=50, rot=-1.5)
for i, a in enumerate((-90, 30, 150)): line(wing(GC, a, 60, 300, 60), L(279.4) + .4 * i, .4, lw=8)
write('в плане — буква Y', 3100, 2800, L(281.1), 1.1, 'graphite', 62)
SX0 = 4550
stepL = [[SX0 - 160, 3950], [SX0 - 160, 3700], [SX0 - 125, 3700], [SX0 - 125, 3400], [SX0 - 90, 3400], [SX0 - 90, 3100], [SX0 - 55, 3100], [SX0 - 55, 2850], [SX0 - 25, 2850], [SX0 - 25, 2700], [SX0, 2640]]
stepR = [[SX0 + 160, 3950], [SX0 + 160, 3550], [SX0 + 125, 3550], [SX0 + 125, 3250], [SX0 + 90, 3250], [SX0 + 90, 2950], [SX0 + 55, 2950], [SX0 + 55, 2750], [SX0 + 25, 2750], [SX0 + 25, 2700], [SX0, 2640]]
line(stepL + list(reversed(stepR[:-1])), L(282.7), 1.2, lw=7)
spl = [[SX0 + (150 - 130 * (3950 - y) / 1300) * math.sin(math.radians((3950 - y) * .55)), y] for y in range(3950, 2690, -20)]
line(spl, L(283.4), 1.0, 'blue', 5, dash=[16, 14])
write('уступы по спирали', 4770, 3700, L(283.6), 1.0, 'graphite', 58)
for i, y in enumerate((3050, 3150, 3250)): line([[3130, y], [3300, y]], L(284.2) + .12 * i, .2, 'graphite', 5, arrow=True)
for i, (cx, cy, r, sg) in enumerate(((4090, 2990, 26, 1), (4170, 3120, 40, -1), (4080, 3260, 20, 1), (4180, 3420, 32, -1), (4070, 3530, 24, 1))):
    spiral((cx, cy), r, 1.3, L(286.5) + .3 * i, .3, a0=60 * i, sgn=sg, lw=5)
write('ветер запутывается', 3100, 3700, L(286.4), 1.4, 'graphite', 60)
write('вихри в один ритм', 3100, 3820, L(288.9), 1.1, 'graphite', 60)
line([[3090, 3802], [3650, 3796]], L(290.15), .3, 'red', 7); ev(L(290.15), 'strike', .3)
Z('7b', 'lo')
WT = (5100, 2950, 5900, 3250)
line([[WT[0], WT[1]], [WT[2], WT[1]], [WT[2], WT[3]], [WT[0], WT[3]], [WT[0], WT[1]]], L(290.8), .7, lw=7)
line(circle((5170, 3100), 60, 28), L(291.5), .25, lw=5)
for i in range(3):
    a = math.radians(90 + i * 120); line([[5170, 3100], [5170 + 55 * math.cos(a), 3100 + 55 * math.sin(a)]], L(291.75) + .06 * i, .06, lw=5)
for i, y in enumerate((3040, 3160)): line([[5270, y], [5470, y]], L(292.0) + .1 * i, .2, 'graphite', 4, arrow=True)
MOD = [[5600, 3250], [5625, 3020], [5650, 3250]]
line(MOD, L(292.2), .3, lw=7)
write('аэродинамическая труба', 5100, 2890, L(292.3), 1.2, 'graphite', 54)
for k, deg in enumerate((-6, 6)): line(rot_pts(MOD, (5625, 3250), deg), L(293.6) + .3 * k, .3, 'blue', 5, dash=[12, 10])
write('первый вариант', 5100, 3420, L(293.7), .8, 'graphite', 56)
write('качался слишком сильно', 5100, 3530, L(294.6), 1.0, 'red', 56)

# --- P8 296.23–310.83: Taipei tower; the 660 t steel ball; it moves against the sway and damps up to 40 %
Z('8a', 'lo')
printd('taipei', 'print_taipei', 6450, 3050, L(296.4), w=380, rot=-2)
magnet(6320, 2845, L(296.8), r=20); magnet(6585, 2840, L(296.9), r=20)
tag('башня в Тайбэе', 6290, 3400, L(297.3), size=48, rot=1.2)
stick(6720, 3700, L(298.6), s=1.1, lw=5, look=1)
line([[6740, 3570], [6830, 3420], [6900, 3290]], L(299.3), .5, 'grey', 4, dash=[14, 12], arrow=True)
printd('damper', 'print_damper', 7130, 3000, L(299.9), w=600, rot=1.5, size='big')
magnet(6870, 2770, L(300.35), r=22); magnet(7395, 2765, L(300.45), r=22)
tag('стальной шар', 7490, 2780, L(301.2), size=52, rot=-1.5)
count('{0} т', [660], 7490, 3030, L(301.8), 1.8, size=140)
Z('8b', 'lo')
TB = 8500
line([[TB - 70, 3900], [TB - 55, 2760], [TB + 55, 2760], [TB + 70, 3900]], L(303.95), .7, lw=7)
for i, y in enumerate((3300, 3420, 3540)): line([[8180, y], [8400, y]], L(304.1) + .15 * i, .3, 'graphite', 5, arrow=True)
write('ветер', 8180, 3260, L(304.3), .5, 'graphite', 56)
line(rot_pts([[TB - 70, 3900], [TB - 55, 2760], [TB + 55, 2760], [TB + 70, 3900]], (TB, 3900), 3), L(304.75), .5, 'blue', 5, dash=[18, 14])
line([[TB, 2790], [TB - 25, 2970]], L(305.3), .2, lw=5); line(circle((TB - 28, 3005), 34, 24), L(305.5), .3, lw=6)
arrow([TB - 70, 3005], [TB - 170, 3005], L(306.0), .3, 'blue', 7)
write('навстречу', 8090, 3120, L(306.0), .7, 'blue', 54)
write('по данным разработчиков', 8650, 3500, L(307.4), 1.2, 'graphite', 46)
count('до {0} %', [40], 8650, 3400, L(308.9), 1.4, size=120)
dw = [[8650 + i * 6, 3700 + 70 * math.exp(-i / 30) * math.sin(i * 2 * math.pi / 16)] for i in range(91)]
line(dw, L(309.2), 1.5, 'blue', 5, ease='linear')

# --- P9 311.38–324.13: «comfort»; coffee must not move in waves; sway makes you seasick, the ball saves you
Z('9', 'lo')
write('инженеры:', 9450, 2720, L(311.4), .7, 'graphite', 58)
tag('комфорт', 9800, 2700, L(312.3), size=56, rot=-1.5)
CX9, CY9 = 9700, 3000
line([[CX9 - 140, CY9], [CX9 - 110, CY9 + 330], [CX9 + 110, CY9 + 330], [CX9 + 140, CY9]], L(313.6), .8, lw=8)
line(arc((CX9 + 140, CY9 + 130), 60, 75, -80, 100, 18), L(314.4), .3, lw=7)
cw = [[CX9 - 130 + i * 13, CY9 + 45 + 16 * math.sin(i * 2 * math.pi / 7)] for i in range(21)]
line(cw, L(315.4), .6, 'water', 6)
write('кофе не должен', 9450, 3460, L(315.6), .9, 'graphite', 56)
write('ходить волнами', 9450, 3540, L(316.5), .9, 'graphite', 56)
write('качка →', 9450, 3680, L(318.4), .8, 'graphite', 56)
write('морская болезнь', 9690, 3680, L(319.4), 1.2, 'graphite', 56)
line([[9685, 3662], [10150, 3656]], L(321.5), .3, 'red', 7); ev(L(321.5), 'strike', .3)
write('шар спасает', 9450, 3800, L(322.3), .9, 'graphite', 56)

# --- P10 324.86–333.94: the ball is open to visitors; hidden detail became a sight
Z('10', 'lo')
printd('damper2', 'print_damper2', 10900, 3000, L(325.0), w=640, rot=-1.2)
magnet(10610, 2795, L(325.4), r=22); magnet(11185, 2790, L(325.5), r=22)
tag('открыт для посетителей', 10600, 2680, L(325.7), size=48, rot=1)
for i, x in enumerate((10660, 10760, 10860)):
    stick(x, 3720, L(326.6) + .25 * i, s=.9, lw=5, look=1)
    line([[x + 10, 3600], [x + 60 + 40 * i, 3280]], L(327.4) + .15 * i, .3, 'grey', 4, dash=[12, 10])
line(arc((10900, 3150), 200, 60, 20, 160, 18), L(328.1), .5, 'blue', 5, arrow=True)
line([[11400, 2830], [11400, 3270]], L(329.2), .3, lw=9)
for i in range(7): line([[11400, 2860 + 60 * i], [11440, 2830 + 60 * i]], L(329.4) + .05 * i, .05, 'grey', 5)
line(circle((11530, 3050), 55, 28), L(330.0), .4, 'grey', 5, dash=[12, 10])
write('обычно за стеной', 11430, 2770, L(330.3), 1.1, 'graphite', 52)
arrow([11530, 3140], [11530, 3330], L(331.6), .3, 'graphite', 6)
tag('достопримечательность', 11330, 3440, L(332.2), size=50, rot=-1.2)

# --- P11 334.66–347.93: wind is tamed by shape and ball; limits? yes; we hit it earlier than thought; how high, where next
Z('11', 'lo')
write('ветер гасят:', 12350, 2660, L(334.7), .8, 'graphite', 60)
tag('формой', 12380, 2780, L(335.0), size=52, rot=-1.5)
tag('шаром', 12720, 2780, L(335.6), size=52, rot=1.2)
write('пределов нет?', 12350, 3080, L(336.5), 1.2, 'graphite', 90)
stamp('ЕСТЬ', 13300, 3020, L(338.35), size=100, rot=-8)
line([[12350, 3330], [13700, 3330]], L(339.0), .6, lw=6, dash=[24, 18])
write('предел', 13480, 3305, L(339.4), .6, 'graphite', 52)
line([[12350, 3800], [12500, 3800], [12500, 3650], [12650, 3650], [12650, 3500], [12800, 3500], [12800, 3340]], L(339.6), 1.2, 'blue', 8)
ink('ring', L(340.9), .6, 'red', c=[12800, 3335], r=[62, 42], lw=7)
write('раньше, чем думали', 12900, 3460, L(341.0), 1.0, 'graphite', 54)
write('как высоко забрались', 12900, 3620, L(343.3), 1.2, 'graphite', 54)
write('куда целятся дальше', 12900, 3740, L(345.6), 1.2, 'graphite', 54)
arrow([13500, 3760], [13740, 3600], L(346.9), .4, 'graphite', 7)

# ===================================================================== camera (one continuous camera; only the cards hide it)
ZR = {name: (k0, ZONES[i + 1][2] if i + 1 < len(ZONES) else len(E)) for i, (name, band, k0) in enumerate(ZONES)}
BAND = {name: band for name, band, k0 in ZONES}
PAD = .05                                  # resolved frames keep 5 % in hand for the slow push-ins
def resolve(box, t_end, zmax=9, els=None):
    """Grow a framing box until nothing visible is cut by the frame edge (text) or sits in the subtitle band (anything)."""
    box = list(box); B = [b for b in (bbox(e) for e in (E if els is None else els)) if b and b[1] < t_end]
    for _ in range(12):
        x, y, z = fit(box, zmax); z *= 1 - PAD
        vx0, vx1, vy0, vy1 = x - 960 / z, x + 960 / z, y - 540 / z, y + 540 / z; band = y + (830 - 540) / z
        changed = False
        for txt, _, (x0, y0, x1, y1) in B:
            if x1 < vx0 or x0 > vx1 or y1 < vy0 or y0 > vy1: continue
            need = (y1 > band) or (txt and (x0 < vx0 or x1 > vx1 or y0 < vy0))
            if not need: continue
            nb = [min(box[0], x0), min(box[1], y0) if txt else box[1], max(box[2], x1), max(box[3], y1)]
            if nb != box: box = nb; changed = True
        if not changed: break
    return box
def view(box, zmax):
    x, y, z = fit(box, zmax); z *= 1 - PAD; return x - 960 / z, x + 960 / z
SHOTS = []
def shot(t, d, zone, box, zmax=9, a=2, b=2.6, push=None):
    SHOTS.append(dict(t=t, d=d, zone=zone, box=list(box) if box else None, zmax=zmax, a=a, b=b, push=push))
shot(0, 0, '1', [280, 400, 1500, 1260], zmax=1.05)
shot(L(185.25), 1.6, '1', [520, 440, 1850, 1680], zmax=1.05)                   # the photo lands, the piles
shot(L(191.0), 1.5, '1', [520, 1130, 1950, 1820], zmax=1.05, b=3)              # the pile, the dense layer
shot(L(198.6), 1.5, '2', [2100, 420, 3500, 1300])                             # the Y plan
shot(L(208.3), 1.2, '2', [2100, 420, 3500, 1620], b=3)
shot(L(212.8), 1.6, '3', [3600, 420, 5300, 1700])                             # the pump and 606 m
shot(L(221.9), 1.3, '3', [3580, 420, 4950, 1300], b=3)
shot(L(228.4), 1.4, '4', [5400, 400, 7300, 1200], push=(L(233.0), 4.0, 1.02))  # strength / taper
shot(L(237.0), 1.2, '4', [5400, 380, 7300, 1250])
shot(L(242.6), 1.3, '4', [5400, 420, 7300, 1800], b=3)
shot(L(247.9), 1.4, '5', [7400, 620, 8700, 1460])                             # Timur on the deck
shot(L(257.8), 2.1, 'up', None, b=3)                                          # chapter pull-back
shot(L(260.5), .6, '6', [280, 2650, 2300, 4000], push=(L(262.0), 6.0, 1.03))  # (under the card) the wind
shot(L(273.5), 1.3, '6', [1000, 2650, 2900, 3900], b=3)                       # resonance, the swing
shot(L(278.4), 1.5, '7a', [3050, 2580, 4800, 3880])                           # the Y plan, the spiral
shot(L(290.4), 1.3, '7b', [5050, 2800, 6000, 3600], b=3)                      # wind tunnel
shot(L(295.8), 1.4, '8a', [6150, 2700, 6900, 3750])                           # Taipei
shot(L(299.7), 1.2, '8a', [6150, 2650, 8050, 3760], b=3)                      # the ball
shot(L(303.6), 1.3, '8b', [8050, 2650, 9300, 3800])                           # the damping diagram
shot(L(310.9), 1.4, '9', [9400, 2600, 10400, 3830])                           # coffee and comfort
shot(L(324.4), 1.4, '10', [10500, 2650, 12100, 3720])                         # open to visitors
shot(L(334.2), 1.4, '11', [12300, 2560, 13800, 3850], push=(L(336.0), 5.0, 1.03))   # limits
shot(L(347.95), 2.2, 'all', None, b=3)                                        # the whole wall
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
    else: s_['box'] = whole({'up'} if s_['zone'] == 'up' else {'up', 'lo'})
s0 = SHOTS[0]; c = Cam(*fit(s0['box'], s0['zmax']))
for s_ in SHOTS[1:]:
    c.fit(s_['t'], s_['d'], s_['box'], s_['zmax'], a=s_['a'], b=s_['b'])
    if s_['push']: pt, pd, pk = s_['push']; c.to(pt, pd, z=z_of(c) * pk)
c.shake(L(251.1), amp=3, f=11, k=6, dir=(1, 0))
print('zone offsets', {k: round(v) for k, v in OFF.items()}, 'board w', BW)
for s_ in SHOTS: print('  shot %.2f  box %s  z %.3f' % (s_['t'], [round(v) for v in s_['box']], fit(s_['box'], s_['zmax'])[2]))

scene = dict(dur=DUR, board=dict(w=BW, h=BH, seed=31, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
