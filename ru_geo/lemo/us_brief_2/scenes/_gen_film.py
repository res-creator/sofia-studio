#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размер Вселенной · board film, PART 2: chapters «МЯЧ И ГОРОШИНА» and «НАША ГАЛАКТИКА».
FILM range 127.70–272.67 s (144.97 s). The renderer works in LOCAL time:  local = film − 127.70.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/universe_size/film.json (segs → captions).
Wall (board px):
  row 1  (y  380…2000)  «МЯЧ И ГОРОШИНА» p7 ball & pea · p8 Voyager 19 km · p9 Proxima 29 000 km   (left → right)
  row 2  (y 2420…4000)  p10 Gliese 445 (right) · p11 the light year (left)                          (right → left)
  row 3  (y 4400…6300)  «НАША ГАЛАКТИКА» p12–13 the Milky Way disc · p14 the galaxy on the model · p15 2 billion years
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the one mark.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
R0, R1 = 127.70, 272.67
DUR = round(R1 - R0, 3)                       # 144.97
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 13200, 7250

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
def hatch(x0, x1, y, t, d, n=8, color='grey'):
    st = []
    for i in range(n):
        x = x0 + 30 + (x1 - x0 - 60) * i / max(1, n - 1)
        st.append(dict(points=[[x, y], [x + 40, y - 45]], t=round(t + d * i / n, 3), d=round(d / n * 1.2, 3), lw=5))
    return strokes_el(st, t, d, color, 5, .7)

# ---- drawn things ----------------------------------------------------------------------------------------------
def beach_ball(c, r, t, d=1.1, lw=8):
    """a beach ball: the outline, four seams pole to pole, a cap at the top; two panels hatched"""
    cx, cy = c
    line(circle(c, r, 48), t, d * .4, lw=lw)
    k_ = [-.78, -.3, .3, .78]
    for i, k in enumerate(k_):
        pts = [[cx + r * k * math.sin(math.radians(a)), cy - r * math.cos(math.radians(a))] for a in range(0, 181, 10)]
        line(pts, t + d * .4 + i * d * .1, d * .12, lw=max(4, lw - 3))
    line(circle((cx, cy - r * .93), r * .16, 20), t + d * .85, d * .1, lw=max(4, lw - 3))
    # hatch two panels (between seams −0.78…−0.3 and 0.3…0.78) with short grey strokes
    st = []
    for j, (ka, kb) in enumerate(((-.78, -.3), (.3, .78))):
        for i in range(7):
            a = 35 + i * 18; s_ = math.sin(math.radians(a)); y = cy - r * math.cos(math.radians(a))
            xa, xb = cx + r * ka * s_ + 6, cx + r * kb * s_ - 6
            st.append(dict(points=[[xa, y + 8], [xb, y - 8]], t=round(t + d * .9 + (j * 7 + i) * .025, 3), d=.06, lw=4))
    strokes_el(st, t + d * .9, .4, 'grey', 4, .6)
def pea(c, r, t):
    line(circle(c, r, 24), t, .2, lw=6); line(circle(c, r * .55, 18), t + .2, .1, lw=6); line(circle(c, r * .2, 10), t + .3, .05, lw=6)
def star(c, s, t, color='graphite', lw=6, d=.3):
    x, y = c
    st = [dict(points=[[x - s, y], [x + s, y]], t=round(t, 3), d=d / 3, lw=lw), dict(points=[[x, y - s], [x, y + s]], t=round(t + d / 3, 3), d=d / 3, lw=lw),
          dict(points=[[x - s * .5, y - s * .5], [x + s * .5, y + s * .5]], t=round(t + 2 * d / 3, 3), d=d / 6, lw=lw - 2),
          dict(points=[[x - s * .5, y + s * .5], [x + s * .5, y - s * .5]], t=round(t + 5 * d / 6, 3), d=d / 6, lw=lw - 2)]
    return strokes_el(st, t, d, color, lw, .9)
def sprinkle(box, n, t, d, seed, s=(9, 16), avoid=None, inside=None, color='graphite'):
    """many small star crosses, each with its own time"""
    rnd = random.Random(seed); st = []; k = 0
    while k < n:
        x = rnd.uniform(box[0], box[2]); y = rnd.uniform(box[1], box[3])
        if inside and not inside(x, y): continue
        if avoid and any(a[0] <= x <= a[2] and a[1] <= y <= a[3] for a in avoid): continue
        q = rnd.uniform(*s); tt = round(t + d * k / n, 3)
        st.append(dict(points=[[x - q, y], [x + q, y]], t=tt, d=.05, lw=4)); st.append(dict(points=[[x, y - q], [x, y + q]], t=round(tt + .05, 3), d=.05, lw=4))
        k += 1
    return strokes_el(st, t, d, color, 4, .75)
def probe(c, t, s=1.0, lw=5):
    """Voyager as a marker glyph: the dish (an arc), the bus, the boom"""
    x, y = c
    line(arc((x, y), 26 * s, 26 * s, 200, 340, 12), t, .15, lw=lw)
    line([[x - 12 * s, y + 4 * s], [x + 12 * s, y + 4 * s], [x + 12 * s, y + 20 * s], [x - 12 * s, y + 20 * s], [x - 12 * s, y + 4 * s]], t + .15, .12, lw=lw)
    line([[x + 12 * s, y + 14 * s], [x + 62 * s, y + 34 * s]], t + .27, .08, lw=max(3, lw - 2))
def brk(x, y, t, h=46):
    """drafting break mark across a line: two short slanted strokes (the line is not to scale)"""
    strokes_el([dict(points=[[x - 18, y + h], [x + 4, y - h]], t=round(t, 3), d=.08, lw=6), dict(points=[[x + 10, y + h], [x + 32, y - h]], t=round(t + .1, 3), d=.08, lw=6)], t, .2, 'graphite', 6, .9)
def spiral_arms(c, R, t, d, rx=1.0, ry=1.0, r0=.16, turns=.8, arms=2, rot=0, lw=8, color='graphite'):
    """logarithmic spiral arms of a disc galaxy seen from above (ry < 1: tilted)"""
    b = math.log(1 / r0) / (2 * math.pi * turns)
    for k in range(arms):
        pts = []
        for i in range(41):
            th = 2 * math.pi * turns * i / 40; r = R * r0 * math.exp(b * th); a = th + 2 * math.pi * k / arms + math.radians(rot)
            pts.append([c[0] + r * math.cos(a) * rx, c[1] + r * math.sin(a) * ry])
        line(pts, t + d * k / arms, d / arms, color, lw, ea=1.6, eb=2)
def eye(c, t, s=1.0):
    x, y = c
    line(arc((x, y + 40 * s), 80 * s, 70 * s, 215, 325, 14), t, .2, lw=7)
    line(arc((x, y - 40 * s), 80 * s, 70 * s, 35, 145, 14), t + .2, .2, lw=7)
    line(circle((x, y), 17 * s, 18), t + .4, .12, lw=6)

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
    def push(s, t, d, k): return s.to(t, d, z=z_of(s) * k)
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
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('МЯЧ И ГОРОШИНА', 127.70, hard=True)     # the part opens on black
type_card('НАША ГАЛАКТИКА', 210.61)

# ===================================================================== ROW 1 · «МЯЧ И ГОРОШИНА»
# --- p7 128.70–142.62: shrink everything; the Sun = a beach ball, the Earth = a 9 mm pea ~100 m away, a football pitch
BALL, BR = (1300, 1060), 175
PEA = (3620, 1060)
tag('МОДЕЛЬ', 330, 520, L(128.8), size=62, rot=-2)
write('уменьшим всё', 330, 700, L(129.55), 1.0, 'graphite', 100)
arrow([300, 790], [560, 790], L(130.6), .3, 'blue', 7); arrow([1140, 790], [880, 790], L(130.75), .3, 'blue', 7)
printd('sun', 'print_sun', 640, 1090, L(131.45), w=500, rot=-2.5, size='big')
magnet(430, 900, L(131.95), r=22); magnet(850, 892, L(132.05), r=22)
tag('Солнце', 420, 1370, L(132.1), size=56, rot=1.5)
write('=', 965, 1110, L(132.55), .25, 'graphite', 130)
beach_ball(BALL, BR, L(132.75), 1.1)
write('пляжный мяч', 1300, 1340, L(133.5), .8, 'graphite', 62, align='center')
el(type='print', id='earth', src='earth', xy=[3620, 700], w=210, z=10, rot=0, arrive=dict(t=L(134.4), kind='drop', d=.45, lift=220, spin=1.0, land=.6))
ev(L(134.67), 'land', .2, size='small')
tag('Земля', 3800, 640, L(134.85), size=52, rot=-2)
arrow([3620, 830], [3620, 1010], L(135.15), .25, 'graphite', 6)
pea(PEA, 14, L(135.45))
write('горошина', 3700, 1085, L(135.75), .7, 'graphite', 66)
count('{0} мм', [9], 3700, 1215, L(136.4), 1.1, size=110)
dim([BALL[0], 1480], [PEA[0], 1480], L(138.85), 1.0, ext=[[BALL[0], 1270, 1520], [PEA[0], 1110, 1520]])
count('≈ {0} м', [100], 2460, 1640, L(139.3), 1.2, size=120, align='center')
FX0, FX1, FY0, FY1 = 1530, 3440, 790, 1340              # the football pitch (drafting grey)
line([[FX0, FY0], [FX1, FY0], [FX1, FY1], [FX0, FY1], [FX0, FY0]], L(140.15), .8, 'grey', 6)
line([[2485, FY0], [2485, FY1]], L(140.95), .25, 'grey', 5)
line(circle((2485, 1065), 110, 36), L(141.2), .35, 'grey', 5)
line([[FX0, 930], [FX0 + 200, 930], [FX0 + 200, 1200], [FX0, 1200]], L(141.55), .3, 'grey', 5)
line([[FX1, 930], [FX1 - 200, 930], [FX1 - 200, 1200], [FX1, 1200]], L(141.85), .3, 'grey', 5)
write('футбольное поле', 2485, 755, L(141.4), 1.0, 'graphite', 58, align='center')

# --- p8 143.17–157.02: Voyager, 49 years: ≈ 19 km from the ball on this model; centre of a city → its edge
printd('voyager', 'print_voyager', 5000, 800, L(143.2), w=520, rot=2, size='mid')
magnet(4790, 625, L(143.65), r=20); magnet(5215, 640, L(143.75), r=20)
tag('Вояджер', 4760, 1110, L(143.75), size=56, rot=-1.5)
count('{0} лет полёта', [49], 4700, 1320, L(144.2), 1.6, size=84)
Y19 = 1790
dim([BALL[0], Y19], [7150, Y19], L(146.6), 3.0, ea=1.4, eb=1.8, ext=[[BALL[0], 1540, Y19 + 40]])
brk(4150, Y19, L(148.1))
probe((7130, Y19 - 150), L(149.25), 2.2, lw=7)
count('≈ {0} км', [19], 6150, 1950, L(148.85), 1.4, size=130, align='center')
CITY, CR = (6800, 1030), 290
line(circle(CITY, CR, 48), L(150.45), .6, lw=7)
for i, (p0, p1) in enumerate([((6560, 870), (7040, 1200)), ((6540, 1150), (7060, 900)), ((6800, 745), (6800, 1320)), ((6520, 1030), (7090, 1030))]):
    line([p0, p1], L(151.05) + .1 * i, .1, 'grey', 4)
line(circle(CITY, 14, 14), L(151.5), .1, lw=8)
arrow([CITY[0] + 20, CITY[1] + 40], [CITY[0] + CR - 8, CITY[1] + 120], L(151.7), .5, 'blue', 7)
write('центр', CITY[0] - 30, CITY[1] - 45, L(151.6), .45, 'graphite', 66, align='right')
write('окраина', CITY[0] + CR + 20, CITY[1] + 160, L(152.3), .55, 'graphite', 66)
write('как от центра большого города', 5480, 560, L(150.5), 1.4, 'graphite', 76)
write('до окраины', 5480, 665, L(152.0), .6, 'graphite', 76)
write('для человечества: рекорд', 5480, 1450, L(153.55), 1.5, 'graphite', 76)
write('для космоса:', 5960, 1575, L(155.4), .8, 'graphite', 76, align='right')
write('прогулка', 5990, 1575, L(156.0), .6, 'graphite', 76)
ink('ring', L(156.55), .5, 'red', c=[6150, 1550], r=[200, 66], lw=7)

# --- p9 157.72–176.40: the neighbouring ball: Proxima Centauri ≈ 29 000 km on the model; farther than the far side of the Earth;
#     the ruler, subscribe; it will grow billions of times longer
B3, NB = (8800, 1250), (11700, 1250)
write('где же соседний мяч?', 8450, 610, L(157.75), 1.1, 'graphite', 100)
beach_ball(B3, 85, L(157.9), .8, lw=6)
write('мяч', 8800, 1440, L(158.4), .3, 'graphite', 70, align='center')
line(circle(NB, 85, 40), L(158.55), .35, 'blue', 6, dash=[18, 16])
write('?', NB[0], NB[1] + 40, L(158.85), .2, 'blue', 110, align='center')
printd('proxima', 'print_proxima', 11520, 700, L(159.15), w=520, rot=1.5)
magnet(11300, 525, L(159.6), r=20); magnet(11740, 530, L(159.7), r=20)
el(type='card', id='cred_proxima', xy=[11520, 965], w=760, h=70, rot=1.5, z=9,
   arrive=dict(t=L(159.85), kind='drop', d=.35, lift=120, spin=.6, land=.6),
   lines=[dict(text='снимок Хаббла: Альфа Центавра A и B', font='mono', size=34, x=22, y=47, color='grey', pass_=True)])
tag('Проксима Центавра', 11150, 1450, L(160.1), size=62, rot=-1.5)
YP = 1660
dim([B3[0], YP], [NB[0], YP], L(161.35), 1.9, ext=[[B3[0], 1460, YP + 40], [NB[0], 1350, YP + 40]], ea=1.4, eb=1.8)
brk(9950, YP, L(162.6))
count('≈ {0} км', [29000], 10250, 1840, L(163.35), 1.6, size=120, align='center', sep=True)
GL, GR_ = (9750, 1060), 170                      # the Earth drawn in marker: we, and the opposite point
line(circle(GL, GR_, 44), L(165.85), .55, lw=7)
line(arc(GL, GR_ * .38, GR_, -90, 90, 16), L(166.4), .2, 'grey', 4); line(arc(GL, GR_ * .38, GR_, 90, 270, 16), L(166.55), .2, 'grey', 4)
pa = (GL[0] + GR_ * math.cos(math.radians(-135)), GL[1] + GR_ * math.sin(math.radians(-135)))
pb = (GL[0] + GR_ * math.cos(math.radians(45)), GL[1] + GR_ * math.sin(math.radians(45)))
line(circle(pa, 9, 12), L(166.75), .1, lw=9); write('мы', pa[0] - 25, pa[1] - 10, L(166.8), .2, 'graphite', 66, align='right')
line(arc(GL, GR_ + 26, GR_ + 26, -135, 45, 30), L(166.95), .9, 'blue', 6, dash=[18, 14], arrow=True)
line(circle(pb, 9, 12), L(167.9), .1, lw=9)
write('противоположная', pb[0] + 45, pb[1] + 45, L(167.95), .7, 'graphite', 64)
write('точка Земли', pb[0] + 45, pb[1] + 125, L(168.55), .5, 'graphite', 64)
write('дальше, чем', 9420, 815, L(165.8), .6, 'blue', 80)
el(type='ruler', id='ruler', **{'from': [B3[0] - 60, 1565], 'to': [NB[0] + 40, 1565]}, w=44, z=12, inset=60, magnetR=20,
   arrive=dict(t=L(170.9), kind='drop', d=.4, lift=160, spin=.4, land=.6))
ev(L(171.15), 'ruler', .4)
tag('подпишитесь', 8480, 830, L(173.0), size=66, rot=-2)
arrow([NB[0] + 60, YP], [12550, YP], L(173.95), 1.0, 'blue', 9)
write('в миллиарды раз', 11780, 1830, L(174.4), .9, 'blue', 80)
write('длиннее', 11780, 1930, L(175.35), .5, 'blue', 80)

# ===================================================================== ROW 2 · real distances (light years)
# --- p10 176.95–192.86: not to Proxima, towards Gliese 445 (> 17 ly); in 40 000 years closer than 2 ly; no longer heard
S = (7950, 3480)                         # we (the Sun and the Earth)
line(circle(S, 22, 20), L(176.9), .2, lw=10)
write('мы', S[0] - 40, S[1] + 32, L(177.0), .25, 'graphite', 96, align='right')
PV = (8090, 3390); probe(PV, L(177.1), 2.0, lw=7)
PX = (8950, 3790)
star(PX, 28, L(177.4)); write('Проксима', PX[0] + 50, PX[1] + 32, L(177.5), .5, 'graphite', 90)
line([[PV[0] + 60, PV[1] + 60], [PX[0] - 50, PX[1] - 30]], L(177.6), .6, 'graphite', 6, dash=[20, 16], arrow=True)
xc = ((PV[0] + PX[0]) / 2, (PV[1] + PX[1]) / 2 + 20)
line([[xc[0] - 45, xc[1] - 45], [xc[0] + 45, xc[1] + 45]], L(178.3), .15, 'red', 9); line([[xc[0] + 45, xc[1] - 45], [xc[0] - 45, xc[1] + 45]], L(178.5), .15, 'red', 9)
TE, G = (11150, 2800), (11380, 2560)
line([[PV[0] + 70, PV[1] - 20], TE], L(179.15), 1.8, 'graphite', 8, arrow=True, ea=1.5, eb=2)
star(G, 34, L(181.0), 'graphite', 7)
write('Глизе 445', G[0] - 60, G[1] - 30, L(181.3), .8, 'graphite', 100, align='right')
count('больше {0} св. лет', [17], 9250, 3470, L(183.1), 1.5, size=110)
count('через {0} лет', [40000], 9300, 2760, L(185.8), 1.6, size=110, sep=True)
dim(TE, [G[0] - 22, G[1] + 24], L(188.0), .5, lw=6)
write('< 2 св. лет', 11080, 3010, L(188.5), .9, 'blue', 90)
for i, rr in enumerate((110, 175, 240)):
    line(arc(S, rr, rr, -75, -15, 12), L(190.0) + .2 * i, .25, 'graphite', 6, erase=dict(t=round(L(191.7) + .12 * i, 3), d=.4))
write('вероятно, давно не будет слышно', 7500, 3980, L(190.2), 1.7, 'graphite', 80)

# --- p11 193.41–208.46: the light year ≈ 9.5 trillion km; light from Proxima takes a little over 4 years: we see it as it was
tag('световой год', 760, 2590, L(193.5), size=80, rot=-1.5)
SRC = (980, 3000)
star(SRC, 40, L(195.0), 'graphite', 8)
write('путь света за год', 1150, 2920, L(195.9), 1.2, 'graphite', 96)
arrow([SRC[0] + 70, SRC[1]], [4200, SRC[1]], L(196.3), 1.2, 'blue', 10)
dim([SRC[0], 3110], [4200, 3110], L(197.7), .8, lw=6, arrows=False)
write('≈ 9,5 трлн км', 2590, 3310, L(198.1), 1.6, 'blue', 150, align='center')
PX2 = (4600, 3700)
star(PX2, 34, L(200.8), 'graphite', 7); write('Проксима', PX2[0] - 60, PX2[1] - 70, L(201.0), .6, 'graphite', 90)
eye((1100, 3700), L(201.0), 1.0)
line([[PX2[0] - 70, PX2[1]], [1230, 3700]], L(201.6), 1.4, 'blue', 7, dash=[24, 18], arrow=True)
count('чуть больше {0} лет', [4], 1500, 3650, L(203.0), 1.5, size=104)
write('видим её такой, какой она была', 3020, 3930, L(205.4), 1.6, 'graphite', 84, align='right')
write('4 года назад', 3060, 3930, L(207.05), .8, 'red', 84)

# ===================================================================== ROW 3 · «НАША ГАЛАКТИКА»
# --- p12 211.61–227.18: neighbour stars belong to the Milky Way, a disc over 100 000 ly; Voyager inside, barely moved
C, R = (1700, 5420), 720
SUN = (2040, 5555)                                    # half-way out (|SUN − C| ≈ R/2)
for i, (dx, dy) in enumerate([(0, 0), (70, -40), (-55, 60), (95, 55), (-80, -45), (20, 95), (-25, -90)]):
    star((SUN[0] + dx, SUN[1] + dy), 16 if i else 20, L(211.75) + .18 * i, 'graphite', 5, .2)
write('не в одиночку', 2620, 4990, L(212.2), 1.0, 'graphite', 84)
line(circle(C, [150, 110], 36), L(214.35), .4, lw=8)
spiral_arms(C, R, L(214.8), 1.9, r0=.2, turns=.85, arms=2, rot=20, lw=8)
line(circle(C, R + 30, 64), L(216.6), .7, 'grey', 5, dash=[20, 18])
tag('Млечный Путь', 2620, 4760, L(215.6), size=72, rot=-1.5)
YD = 4590
dim([C[0] - R - 30, YD], [C[0] + R + 30, YD], L(217.15), 1.1, ext=[[C[0] - R - 30, YD - 30, C[1]], [C[0] + R + 30, YD - 30, C[1]]])
count('больше {0} св. лет', [100000], C[0], YD - 50, L(218.0), 2.0, size=96, align='center', sep=True)
ink('ring', L(221.2), .6, 'graphite', c=list(SUN), r=[150, 140], lw=6)
line([[SUN[0] + 150, SUN[1] - 40], [2600, 5250]], L(221.8), .3, 'graphite', 5)
write('Вояджер летит внутри', 2620, 5260, L(222.0), 1.2, 'graphite', 80)
write('и почти не сдвинулся с места', 2620, 5375, L(223.6), 1.8, 'graphite', 74)

# --- p13 227.72–242.97: the Sun half-way out, 26 000 ly from the centre; hundreds of billions of stars, estimated
line(circle(C, 12, 14), L(227.8), .12, lw=12)
write('центр', C[0] - 20, C[1] + 85, L(228.0), .4, 'graphite', 70, align='center')
line(circle(SUN, 16, 14), L(228.3), .12, lw=10)
write('Солнце', SUN[0], SUN[1] + 225, L(228.4), .5, 'graphite', 70, align='center')
dim([C[0] + 20, C[1] + 8], [SUN[0] - 20, SUN[1] - 8], L(229.0), .7, lw=6)
dim([SUN[0] + 20, SUN[1] + 8], [C[0] + (SUN[0] - C[0]) * 2.02, C[1] + (SUN[1] - C[1]) * 2.02], L(229.8), .6, 'grey', 5)
write('полпути', 1790, 5395, L(230.5), .7, 'blue', 60, rot=21)
line([[2440, 5640], [2600, 5600]], L(232.1), .2, 'blue', 5)
count('{0} св. лет', [26000], 2620, 5650, L(232.2), 1.6, size=120, sep=True)
write('от центра', 2620, 5760, L(234.1), .7, 'graphite', 74)
sprinkle([C[0] - R, C[1] - R, C[0] + R, C[1] + R], 46, L(236.0), 2.2, 7, inside=lambda x, y: math.hypot(x - C[0], y - C[1]) < R - 20 and math.hypot(x - C[0], y - C[1]) > 140
         and math.hypot(x - SUN[0], y - SUN[1]) > 120)
write('сотни миллиардов звёзд', 2620, 5920, L(235.95), 1.5, 'blue', 90)
tag('точного счёта нет', 2650, 6075, L(238.6), size=64, rot=-1)
write('оценка по яркости и массе', 2620, 6260, L(240.1), 2.2, 'graphite', 74)

# --- p14 243.69–257.56: back to the beach ball: the galaxy would span 700 million km, almost Sun → Jupiter; stars everywhere
MB = (5000, 5060)
tag('модель', 4800, 4640, L(243.7), size=68, rot=-2)
beach_ball(MB, 110, L(243.9), .9, lw=7)
write('пляжный мяч', MB[0], MB[1] + 200, L(244.6), .7, 'graphite', 68, align='center')
GC, GRX, GRY = (6880, 5060), 1230, 360               # the galaxy on the model (tilted disc)
line(circle(GC, [GRX, GRY], 64), L(245.4), 1.0, 'graphite', 6, dash=[24, 18])
line(circle(GC, [170, 60], 30), L(246.2), .3, lw=7)
spiral_arms(GC, GRX * .95, L(246.5), 1.2, ry=GRY / GRX, r0=.16, turns=.8, arms=2, rot=10, lw=6)
YM = 5530
dim([GC[0] - GRX, YM], [GC[0] + GRX, YM], L(247.9), 1.0, ext=[[GC[0] - GRX, GC[1] + 20, YM + 40], [GC[0] + GRX, GC[1] + 20, YM + 40]])
count('≈ {0} млн км', [700], GC[0], 5690, L(248.2), 1.9, size=110, align='center')
printd('sun2', 'print_sun', 5420, 6010, L(250.7), w=280, rot=-2, size='small')
magnet(5420, 5900, L(251.1), r=18)
printd('jupiter', 'print_jupiter', 8350, 6000, L(251.4), h=260, rot=2, size='small')
magnet(8350, 5880, L(251.8), r=18)
arrow([5600, 6020], [8230, 6020], L(251.55), 1.2, 'blue', 7)
write('почти как от Солнца до Юпитера', 6900, 5975, L(251.7), 1.8, 'graphite', 76, align='center')
sprinkle([GC[0] - GRX, GC[1] - GRY, GC[0] + GRX, GC[1] + GRY], 60, L(253.85), 2.0, 11,
         inside=lambda x, y: ((x - GC[0]) / (GRX - 30)) ** 2 + ((y - GC[1]) / (GRY - 20)) ** 2 < 1 and ((x - GC[0]) / 210) ** 2 + ((y - GC[1]) / 90) ** 2 > 1)
write('сотни миллиардов звёзд', GC[0], 4610, L(256.0), 1.4, 'blue', 84, align='center')

# --- p15 258.11–270.34: Voyager through the whole galaxy ≈ 2 billion years (our estimate); one of many galaxies; past its edge
DC, DRX, DRY = (10450, 5130), 1050, 300
line(circle(DC, [DRX, DRY], 64), L(258.15), .8, 'grey', 5, dash=[20, 16])
line(circle(DC, [150, 55], 30), L(258.6), .25, lw=7)
spiral_arms(DC, DRX * .95, L(258.8), .9, ry=DRY / DRX, r0=.16, turns=.8, arms=2, rot=-20, lw=6)
probe((DC[0] - DRX - 150, DC[1] - 40), L(259.9), 1.2)
tag('Вояджер', 9050, 5470, L(260.0), size=64, rot=-1.5)
arrow([DC[0] - DRX - 60, DC[1]], [DC[0] + DRX + 40, DC[1]], L(260.3), 1.5, 'blue', 8, dash=[26, 18])
count('почти {0} млрд лет', [2], DC[0] + 80, 5640, L(261.8), 1.3, size=120, align='center')
tag('по нашему расчёту', 10000, 5840, L(263.6), size=64, rot=1.5)
write('одна из множества галактик', 9000, 4590, L(265.0), 1.8, 'graphite', 84)
for i, (gx, gy, gs) in enumerate([(12150, 4620, 110), (12500, 5520, 95), (12050, 6080, 120), (9300, 6130, 100), (11450, 6240, 85), (12450, 4980, 70)]):
    line(circle((gx, gy), [gs * .35, gs * .22], 16), L(265.4) + .2 * i, .1, lw=5)
    spiral_arms((gx, gy), gs, L(265.5) + .2 * i, .18, ry=.6, r0=.2, turns=.7, arms=2, rot=30 * i, lw=4)
arrow([DC[0] + DRX + 120, DC[1] - 120], [12350, DC[1] - 250], L(268.4), .7, 'graphite', 8)
write('за край', 11680, 5190, L(268.7), .8, 'graphite', 84)

# ===================================================================== camera (one continuous camera; the cards hide the jumps)
c = Cam(*fit([250, 420, 1700, 1460]))
c.to(L(128.75), 2.6, z=z_of(c) * 1.02)
c.fit(L(131.3), 1.3, [250, 420, 1600, 1460], b=3)                       # the Sun print, = , the beach ball
c.fit(L(134.2), 1.3, [3150, 520, 4300, 1300], b=3)                       # the Earth = a pea, 9 mm
c.fit(L(138.65), 1.6, [220, 460, 4300, 1700], b=3)                       # judgement frame: ball, pea, 100 m, the pitch
c.to(L(140.3), 2.6, z=z_of(c) * 1.02)
c.fit(L(143.05), 1.4, [3150, 480, 5800, 1450], b=2.8)                    # Voyager
c.fit(L(146.2), 1.0, [300, 1000, 2700, 2010], a=2, b=2.2)               # down to the ball: the line starts there …
c.fit(L(147.2), 2.6, [4650, 1000, 7400, 2020], a=1.6, b=2.4)             # … ride it to Voyager on the model
c.fit(L(150.3), 1.4, [5450, 480, 7500, 2020], b=2.8)                     # the city, record / a stroll
c.to(L(151.8), 5.0, z=z_of(c) * 1.025)
c.fit(L(157.55), 1.5, [8350, 460, 12100, 1520], b=2.8)                   # where is the neighbouring ball? Proxima
c.fit(L(161.2), 1.4, [8350, 460, 12100, 1960], b=2.8)                    # ≈ 29 000 km
c.fit(L(165.6), 1.3, [8700, 520, 11750, 1960], b=2.8)                    # farther than the opposite point of the Earth
c.fit(L(169.3), 1.5, [8350, 460, 12650, 1960], b=2.8)                    # the ruler, subscribe, billions of times longer
c.to(L(171.2), 5.0, z=z_of(c) * 1.02)
c.fit(L(176.6), 1.5, [7300, 2950, 9900, 4020], b=2.8)                    # row 2: not to Proxima
c.fit(L(179.0), 2.0, [7300, 2420, 11800, 4020], a=1.8, b=2.6)            # towards Gliese 445
c.to(L(181.2), 9.0, z=z_of(c) * 1.03)
c.fit(L(190.3), 1.2, [7300, 2420, 11800, 4020], b=3)
c.fit(L(193.25), 1.4, [600, 2470, 3300, 3360], b=2.8)                    # the light year
c.fit(L(196.2), 1.6, [600, 2470, 4350, 3380], a=1.8, b=2.6)              # ride the light
c.fit(L(200.7), 1.4, [600, 2470, 4900, 4020], b=2.8)                     # Proxima → us, 4 years
c.to(L(202.2), 5.8, z=z_of(c) * 1.02)
c.fit(L(208.45), 2.05, [200, 360, 12700, 4050], b=3)                     # chapter pull-back: rows 1–2
c.fit(L(210.75), .6, [1300, 4850, 3000, 5900])                           # (under the card) the Milky Way corner
c.fit(L(214.1), 1.6, [800, 4380, 2650, 6200], b=2.8)                     # the disc grows, > 100 000 ly
c.fit(L(221.0), 1.4, [1750, 4920, 4400, 5560], b=2.8)                    # Voyager inside, barely moved
c.fit(L(227.6), 1.4, [880, 4400, 4350, 6100], b=2.8)                     # the Sun half-way, 26 000 ly
c.fit(L(235.7), 1.4, [880, 4400, 4350, 6300], b=2.8)                     # hundreds of billions, no exact count
c.to(L(237.2), 5.5, z=z_of(c) * 1.02)
c.fit(L(243.5), 1.4, [4550, 4500, 6400, 5450], b=2.8)                    # back to the beach ball
c.fit(L(245.3), 1.6, [4550, 4450, 8250, 5800], a=1.8, b=2.6)             # the galaxy on the model, 700 million km
c.fit(L(250.55), 1.4, [4550, 4450, 8600, 6150], b=2.8)                   # Sun → Jupiter
c.to(L(252.0), 5.5, z=z_of(c) * 1.02)
c.fit(L(257.9), 1.5, [8800, 4800, 11700, 5950], b=2.8)                   # 2 billion years
c.fit(L(264.8), 1.5, [8850, 4430, 12650, 6300], b=2.8)                   # one of many galaxies, past its edge
c.fit(L(270.45), 2.1, [200, 360, 12700, 6330], b=3)                      # the whole wall
# the whole wall sits 400 px further right (keeps the board's left frame out of the opening shots)
OX = 800
def shift(e, dx):
    for k in ('xy', 'from', 'to', 'c'):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx
for e in E: shift(e, OX)
c.base['x'] += OX; BW += OX
print('board', BW, BH)

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=41, texScale=.4, ghosts=220, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
