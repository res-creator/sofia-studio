#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размеры стран · board film, PART 4: chapters «ДРУГИЕ КАРТЫ» and «ВОЗВРАЩАЕМСЯ К МЕРКАТОРУ».
FILM range 439.03–599.49 s (160.46 s, to the end). The renderer works in LOCAL time:  local = film − 439.03.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/country_sizes/film.json (segs → captions).
Wall (board px, 17 000 × 7 300):
  chapter «ДРУГИЕ КАРТЫ» (x 300…10 300)
    row 1 (y  300…3 300)  three projections drawn from boundary data: Mercator · Gall–Peters · Winkel tripel
    row 2 (y 3 300…4 950)  the timeline 1855 · 1921 · 1973 · 1986 · 1998 (broken), seven magnets
    row 3 (y 5 100…7 050)  no perfect map, three users · the orthographic globe · Greenland dragged to the equator
  chapter «ВОЗВРАЩАЕМСЯ К МЕРКАТОРУ» (x 10 800…16 700): Juan's course, Mercator · three questions · the closing question, ruler
World outlines: scenes/geo.py (johan/world.geo.json, public domain), simplified, drawn stroke by stroke.
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the one mark.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
R0, R1 = 439.03, 599.49
DUR = round(R1 - R0, 3)                       # 160.46
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 17000, 7700

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

def brk(x, y, t, h=46):
    """drafting break mark across a line: two short slanted strokes (the line is not to scale)"""
    strokes_el([dict(points=[[x - 18, y + h], [x + 4, y - h]], t=round(t, 3), d=.08, lw=6), dict(points=[[x + 10, y + h], [x + 32, y - h]], t=round(t + .1, 3), d=.08, lw=6)], t, .2, 'graphite', 6, .9)

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

# ===================================================================== marker maps from boundary data (scenes/geo.py)
import sys; sys.path.insert(0, HERE); import geo
WORLD = geo.coast(); AFR = geo.coast(geo.AFRICA); GRL = geo.coast({'GRL'})
CYL = (-180, 180, -58, 84)                         # cylindrical windows: the world without Antarctica
def map_strokes(lines, t, d, color='graphite', lw=5, alpha=.9, order='x'):
    """coastlines drawn stroke by stroke, sweeping west → east; each stroke's time ∝ its length"""
    lines = sorted(lines, key=lambda P: min(p[0] for p in P) if order == 'x' else min(p[1] for p in P))
    tot = sum(geo.plen(P) for P in lines) or 1; acc = 0; st = []
    for P in lines:
        l = geo.plen(P); st.append(dict(points=[[round(x, 1), round(y, 1)] for x, y in P], t=round(t + d * acc / tot, 3), d=round(max(.04, d * l / tot * 1.6), 3), lw=lw)); acc += l
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=st, lw=lw, color=color, alpha=alpha)
def frame_rect(m, t, d, color='grey', lw=5):
    x0, y0, x1, y1 = m.box; return line([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], t, d, color, lw)
def world_map(m, t, d, lw=7, eps=2.5, min_len=14):
    return map_strokes(m.lines(WORLD, eps=eps, min_len=min_len), t, d, 'graphite', lw)
def equator(m, t, d=.5):
    P = m.lines([[(lo, 0) for lo in range(-180, 181, 5)]], eps=1)
    for Q in P: line(Q, t, d, 'grey', 4, dash=[18, 16])
def tissot(m, t, d, lons=(-120, -40, 40, 120), lats=(-30, 0, 30, 60), r=7, lw=5):
    """identical circles on the globe (7° radius) drawn by the projection: how it bends shapes and areas"""
    st = []; i = 0; n = len(lons) * len(lats)
    for la in lats:
        for lo in lons:
            for P in m.lines([geo.small_circle(lo, la, r, 40)], eps=1, clip_box=False):
                st.append(dict(points=[[round(x, 1), round(y, 1)] for x, y in P], t=round(t + d * i / n, 3), d=round(d / n * 1.3, 3), lw=lw))
            i += 1
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=st, lw=lw, color='blue', alpha=.85)
def bbox(P, pad=0):
    xs = [p[0] for Q in P for p in Q]; ys = [p[1] for Q in P for p in Q]
    return [min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad]

# ===================================================================== typewriter cards on black
type_card('ДРУГИЕ КАРТЫ', 439.03, hard=True)        # the part opens on black
type_card('ВОЗВРАЩАЕМСЯ К МЕРКАТОРУ', 548.79)

# ===================================================================== CHAPTER «ДРУГИЕ КАРТЫ» · x 300…10300
# row 1 (y 300…3100): the three projections side by side: Mercator · Gall–Peters · Winkel tripel
M1 = geo.Map(geo.merc, 450, 1120, 2500, CYL)          # sort 1: keeps angles and shapes
M2 = geo.Map(geo.gp, 3350, 1200, 2500, CYL)           # sort 2: keeps areas
M3 = geo.Map(geo.wink, 6250, 1180, 2500)              # the compromise (p4)
print('maps', [round(m.h) for m in (M1, M2, M3)])

# --- p1 440.03–456.12: another map? two main sorts: angles & shapes (like Mercator) / areas; both at once: impossible
write('Значит, нужна другая карта?', 450, 560, L(440.1), 1.4, 'graphite', 120)
tag('1-й сорт', 560, 780, L(442.0), size=64, rot=-2)
tag('2-й сорт', 3460, 780, L(442.6), size=64, rot=1.5)
write('хранят углы и формы', 1000, 840, L(444.25), 1.3, 'graphite', 84)
frame_rect(M1, L(445.6), .5)
world_map(M1, L(445.9), 2.0)
equator(M1, L(447.0))
tag('карта Меркатора', 2250, 2830, L(446.6), size=58, rot=1.5)
write('хранят площади', 3900, 840, L(447.7), .9, 'graphite', 84)
frame_rect(M2, L(447.9), .45)
world_map(M2, L(448.1), 1.8)
equator(M2, L(449.0))
# the same circles on both: on Mercator they stay round but swell to the north; on the equal-area map they keep their area but squash
tissot(M1, L(449.4), 1.4); tissot(M2, L(450.4), 1.4)
write('обе сразу на плоскости —', 3350, 560, L(449.5), 1.3, 'graphite', 96)
write('нельзя', 4620, 562, L(451.0), .6, 'red', 120)
write('каждый картограф выбирает,', 2900, 3090, L(452.3), 1.4, 'graphite', 88, align='center')
write('чем пожертвовать', 2900, 3200, L(454.0), 1.0, 'graphite', 88, align='center')
arrow([2120, 3020], [1650, 2930], L(454.9), .3, 'graphite', 6); arrow([3680, 3020], [4150, 2930], L(455.1), .3, 'graphite', 6)

# row 2 (y 3300…4950): the timeline 1855 … 1998, broken where years are skipped
TL = 3900
YX = {1855: 900, 1921: 3000, 1973: 5000, 1986: 6950, 1998: 8750}
def tick(y, t):
    x = YX[y]; line([[x, TL - 40], [x, TL + 40]], t, .12, 'graphite', 8)
    write(str(y), x, TL - 70, t + .1, .5, 'blue', 110, align='center')

# --- p2 456.82–476.96: Gall 1855; Peters 1973 «честная карта»; Africa gets its honest share of area but looks stretched
ink('ring', L(456.9), .5, 'graphite', c=[3600, 820], r=[200, 80], lw=6)
line([[500, TL], [9700, TL]], L(458.0), 1.2, 'graphite', 7, arrow=True, ea=1.5, eb=2)
brk(1950, TL, L(458.5)); brk(4000, TL, L(458.6))
tick(1855, L(463.3))
tag('Джеймс Галл', 760, TL + 90, L(459.4), size=60, rot=-1.5)
write('шотландский священник', 640, TL + 330, L(458.9), 1.5, 'graphite', 72)
write('придумал проекцию', 640, TL + 440, L(460.9), 1.0, 'graphite', 72)
tick(1973, L(468.1))
tag('Арно Петерс', 4840, TL + 90, L(465.8), size=60, rot=1.5)
write('немецкий историк', 4740, TL + 330, L(466.3), 1.2, 'graphite', 72)
write('продвигал как “честную карту”', 4740, TL + 440, L(470.4), 1.6, 'graphite', 72)
AF2 = M2.lines(AFR, eps=2); ab = bbox(AF2)
map_strokes(AF2, L(472.7), 1.4, 'blue', 9, order='y')
dim([ab[0] - 70, ab[1]], [ab[0] - 70, ab[3]], L(475.0), .8, lw=6, ext=[])
write('честная доля площади', 4750, 2820, L(473.4), 1.2, 'blue', 72)
write('хотя выглядит вытянутой', 4750, 2930, L(475.4), 1.3, 'graphite', 72)
arrow([4900, 2740], [(ab[0] + ab[2]) / 2 + 60, ab[3] - 120], L(473.2), .4, 'blue', 6)

# --- p3 477.67–496.97: the name only in 1986, over 100 years after Gall; cartographers objected; seven organisations
tag('неожиданная деталь', 6600, TL - 640, L(477.8), size=60, rot=-1.5)
write('имя “Галла — Петерса”', 6720, TL + 140, L(479.6), 1.6, 'graphite', 80)
tick(1986, L(482.0))
dim([YX[1855], TL - 230], [YX[1986], TL - 230], L(484.6), 1.6, ext=[[YX[1855], TL - 270, TL - 150], [YX[1986], TL - 270, TL - 150]], ea=1.4, eb=1.8)
write('больше 100 лет', 3900, TL - 280, L(485.8), 1.0, 'blue', 100, align='center')
write('картографы возражали:', 6720, TL + 330, L(487.6), 1.2, 'graphite', 72)
write('равновеликие проекции были и раньше', 6720, TL + 440, L(489.4), 1.8, 'graphite', 72)
for i in range(7): magnet(6880 + i * 130, TL + 640, L(492.0) + i * .2, r=30)
count('{0}', [7], 6740, TL + 680, L(492.0), 1.3, 'blue', 120, align='right')
write('североамериканских организаций', 6720, TL + 820, L(493.0), 1.4, 'graphite', 72)
write('против прямоугольных карт мира', 6720, TL + 930, L(494.8), 1.5, 'graphite', 72)
RX0, RY0 = 8000, TL + 560
line([[RX0, RY0], [RX0 + 520, RY0], [RX0 + 520, RY0 + 300], [RX0, RY0 + 300], [RX0, RY0]], L(495.6), .4, 'grey', 5)
MR = geo.Map(geo.gp, RX0 + 10, RY0 + 20, 500, CYL)
world_map(MR, L(495.8), .6, lw=3, eps=3, min_len=20)
line([[RX0 - 30, RY0 - 30], [RX0 + 550, RY0 + 330]], L(496.4), .2, 'red', 9); line([[RX0 + 550, RY0 - 30], [RX0 - 30, RY0 + 330]], L(496.6), .2, 'red', 9)

# --- p4 497.53–513.97: 1998 National Geographic → Oswald Winkel's projection of 1921; a little of every distortion
tick(1998, L(497.6))
tag('National Geographic', 8560, TL + 90, L(499.9), size=56, rot=-1.5)
write('перешла на проекцию Винкеля', 8420, TL + 330, L(502.0), 1.5, 'graphite', 72)
tag('проекция Винкеля', 6380, 780, L(502.2), size=64, rot=-1.5)
# the Winkel tripel outline: the two edge meridians
edge = [[(-180, la) for la in range(-90, 91, 3)] + [(lo, 90) for lo in range(-180, 181, 10)] + [(180, la) for la in range(90, -91, -3)] + [(lo, -90) for lo in range(180, -181, -10)]]
for i, P in enumerate(M3.lines(edge, eps=1, clip_box=False)): line(P, L(502.5) + .25 * i, .5, 'grey', 5)
world_map(M3, L(502.8), 1.9)
equator(M3, L(504.0))
write('немец Освальд Винкель,', 7300, 840, L(504.2), 1.2, 'graphite', 72)
write('1921', 8150, 840, L(505.4), .5, 'blue', 84)
tick(1921, L(504.4)); tag('Освальд Винкель', 2840, TL + 90, L(504.6), size=56, rot=1)
write('никому не отдаёт всё:', 8900, 1340, L(506.9), 1.3, 'graphite', 80)
tissot(M3, L(508.2), 1.6)
write('понемногу искажает', 8900, 1480, L(508.0), 1.0, 'graphite', 80)
write('— площади', 8980, 1620, L(509.0), .7, 'blue', 80)
write('— формы', 8980, 1750, L(510.4), .6, 'blue', 80)
write('— расстояния', 8980, 1880, L(511.0), .7, 'blue', 80)
write('нигде не врёт', 8900, 2110, L(512.0), .9, 'graphite', 90)
write('слишком сильно', 8900, 2225, L(512.9), .9, 'graphite', 90)

# row 3 (y 5200…7050)
# --- p5 514.66–528.70: no perfect map, nobody's fault; choosing a projection = choosing a question; three users, three answers
write('Идеальной карты не существует', 450, 5470, L(514.8), 1.6, 'graphite', 110)
write('и ничьей вины в этом нет', 450, 5600, L(516.9), 1.4, 'graphite', 80)
write('выбор проекции = выбор вопроса,', 450, 5800, L(518.7), 1.8, 'graphite', 92)
ink('ring', L(520.4), .5, 'red', c=[1690, 5770], r=[330, 82], lw=6)
write('на который карта должна ответить', 450, 5920, L(520.9), 1.8, 'graphite', 72)
printd('compass', 'print_compass', 760, 6380, L(523.0), w=380, rot=-2, size='mid')
magnet(760, 6200, L(523.4), r=20)
tag('штурман', 600, 6620, L(523.5), size=56, rot=-1.5)
write('один ответ', 600, 6870, L(524.0), .7, 'blue', 70)
printd('atlas', 'print_atlas', 1800, 6390, L(525.1), h=500, rot=1.5, size='mid')
magnet(1800, 6160, L(525.5), r=20)
tag('атлас', 1680, 6680, L(525.6), size=56, rot=1)
write('другой', 1680, 6930, L(526.0), .5, 'blue', 70)
PH = (2900, 6390)                                       # a phone with a road map, drawn in marker
line([[PH[0] - 140, PH[1] - 250], [PH[0] + 140, PH[1] - 250], [PH[0] + 140, PH[1] + 250], [PH[0] - 140, PH[1] + 250], [PH[0] - 140, PH[1] - 250]], L(526.4), .5, 'graphite', 8)
line([[PH[0] - 30, PH[1] + 215], [PH[0] + 30, PH[1] + 215]], L(526.9), .1, 'graphite', 6)
for i, R_ in enumerate([[[-110, 120], [-20, 40], [40, -60], [110, -150]], [[-110, -100], [0, -40], [110, -20]], [[-60, 190], [-40, 40], [-80, -200]]]):
    line([[PH[0] + x, PH[1] + y] for x, y in R_], L(527.0) + .15 * i, .25, 'grey', 6)
line([[PH[0] - 20, PH[1] + 40], [PH[0] + 40, PH[1] - 60], [PH[0] + 110, PH[1] - 150]], L(527.6), .3, 'blue', 9)
tag('приложение с дорогами', 2650, 6700, L(526.5), size=56, rot=-1)
write('третий', 2650, 6950, L(527.9), .5, 'blue', 70)

# --- p6 529.42–546.46: the globe; services where a country can be dragged: Greenland to the equator shrinks
GLB = geo.Map(geo.ortho(-15, 30), 4500, 5280, 1600)
GC_ = ((GLB.box[0] + GLB.box[2]) / 2, (GLB.box[1] + GLB.box[3]) / 2); GR = GLB.w / 2
write('самый честный вариант:', 4450, 5190, L(529.5), 1.3, 'graphite', 80)
line(circle(GC_, GR, 72), L(530.3), .8, 'graphite', 7)
world_map(GLB, L(530.8), 1.6, eps=2)
tag('глобус', 5600, 5110, L(531.3), size=66, rot=2)
for i, P in enumerate(GLB.lines(GRL, eps=1.5) + GLB.lines(AFR, eps=1.5)): pass
write('не искажает', 6180, 5700, L(532.3), .8, 'graphite', 76)
write('ни площади,', 6180, 5820, L(533.3), .7, 'graphite', 76)
write('ни формы', 6180, 5940, L(534.6), .6, 'graphite', 76)
M4 = geo.Map(geo.merc, 7050, 5200, 1300, (-75, 35, -12, 80))
frame_rect(M4, L(535.3), .5)
world_map(M4, L(535.6), 1.4, eps=2, min_len=10)
equator(M4, L(536.6))
write('экватор', M4.box[2] + 30, M4(0, 0)[1] + 25, L(536.8), .5, 'grey', 56)
tag('карта Меркатора', 7150, 7000, L(536.0), size=56, rot=-1)
write('плоская карта:', 8550, 5450, L(535.4), 1.0, 'graphite', 80)
write('есть сервисы, где страну', 8550, 5580, L(537.2), 1.3, 'graphite', 72)
write('можно перетащить', 8550, 5690, L(539.3), .9, 'graphite', 72)
write('и она меняет размер', 8550, 5800, L(541.2), 1.2, 'graphite', 72)
# Greenland moved like a magnet: the same shape rotated on the sphere (true size), then drawn by Mercator, step by step
GSRC = (-41, 73); GDST = (-26, 5)
steps = [(-41, 73), (-38, 58), (-35, 45), (-32, 32), (-29, 18), GDST]
GL0 = M4.lines(GRL, eps=1.5)
map_strokes(GL0, L(541.3), .5, 'graphite', 9)
for i, s_ in enumerate(steps[1:]):
    P = M4.lines(geo.rotate_to(GRL, GSRC, s_), eps=1.5, clip_box=False)
    t_ = L(542.9) + .45 * i; last = i == len(steps) - 2
    e_ = map_strokes(P, t_, .3, 'blue' if last else 'graphite', 10 if last else 6)
    if not last: e_['out'] = round(t_ + .45, 3); e_['outD'] = .3
c0 = bbox(GL0); c1 = bbox(M4.lines(geo.rotate_to(GRL, GSRC, GDST), eps=1.5, clip_box=False))
line([[(c0[0] + c0[2]) / 2 + 60, (c0[1] + c0[3]) / 2 + 60], [(c1[0] + c1[2]) / 2 + 30, c1[1] - 40]], L(542.95), 2.2, 'blue', 6, dash=[22, 16], arrow=True)
ink('ring', L(545.5), .5, 'red', c=[(c1[0] + c1[2]) / 2, (c1[1] + c1[3]) / 2], r=[(c1[2] - c1[0]) / 2 + 70, (c1[3] - c1[1]) / 2 + 60], lw=6)
write('съёжится', c1[0] - 110, c1[1] + 20, L(545.6), .6, 'graphite', 76, align='right')
GSHR = c1

# ===================================================================== CHAPTER «ВОЗВРАЩАЕМСЯ К МЕРКАТОРУ» · x 10800…16700 (+DX2 at the end)
CH2 = len(E); DX2 = 600
sh2 = lambda b: [b[0] + DX2, b[1], b[2] + DX2, b[3]]
# --- p7 549.79–568.21: Juan reached port along one course; Greenland stretched for the straight course; the man who thought of sailors
M5 = geo.Map(geo.merc, 10950, 480, 1650, (-80, 20, -5, 82))
frame_rect(M5, L(549.0), .01)                                    # (drawn before the card lifts: it is already on the wall)
world_map(M5, L(549.0), .01, eps=2, min_len=10)
A_, B_ = M5(-9.1, 38.7), M5(-61.2, 13.2)                          # departure (Lisbon) → a Caribbean port: one straight course
line(circle(A_, 16, 14), L(549.0), .01, 'graphite', 9)
printd('ship', 'print_ship', A_[0] - 20, A_[1] - 150, L(549.85), w=330, rot=-2, size='mid')
E[-1]['moves'] = [dict(t=L(551.2), d=2.4, dx=round(B_[0] - A_[0] + 40, 1), dy=round(B_[1] - A_[1], 1), a=1.6, b=2.2)]
line([A_, B_], L(550.6), 1.0, 'graphite', 7, arrow=True)
line(circle(B_, 22, 16), L(553.3), .2, 'graphite', 9)
tag('порт', B_[0] - 60, B_[1] + 70, L(553.5), size=60, rot=-2)
GL5 = M5.lines(GRL, eps=1.5); g5 = bbox(GL5)
map_strokes(GL5, L(553.9), .6, 'graphite', 10)
write('о Гренландии', 12750, 900, L(554.3), .8, 'graphite', 84)
write('не думал вовсе', 12750, 1010, L(555.2), .8, 'graphite', 84)
el(type='stamp', text='НЕ ОШИБКА', xy=[(g5[0] + g5[2]) / 2, (g5[1] + g5[3]) / 2 + 40], size=90, rot=-9, t=L(557.6)); ev(L(557.6), 'stamp', .2)
arrow([g5[2] + 60, (g5[1] + g5[3]) / 2 - 40], [g5[2] + 60, g5[1] + 20], L(559.2), .35, 'blue', 7)
arrow([g5[2] + 60, (g5[1] + g5[3]) / 2 + 40], [g5[2] + 60, g5[3] - 20], L(559.4), .35, 'blue', 7)
write('растянули', 12750, 1400, L(559.1), .7, 'graphite', 84)
write('ради прямого курса', 12750, 1510, L(559.9), 1.2, 'graphite', 84)
write('“Кто это придумал?”', 14900, 700, L(561.6), 1.4, 'graphite', 96, align='center')
printd('mercator', 'print_mercator', 14900, 1420, L(562.6), w=720, rot=1.5, size='big')
magnet(14660, 1000, L(563.0), r=22); magnet(15140, 1005, L(563.1), r=22)
write('человек, который думал', 14900, 2150, L(564.5), 1.3, 'graphite', 88, align='center')
write('о моряках', 14900, 2270, L(566.3), .8, 'graphite', 88, align='center')
line([[14700, 2300], [15110, 2300]], L(567.2), .4, 'red', 8)

# --- p8 568.75–584.67: three questions to ask any map; Mercator's answers; any other answers differently, and that's fine
write('Три вопроса к любой карте', 10950, 3420, L(569.0), 1.8, 'graphite', 110)
QY = [3760, 3960, 4160]
write('что она сохраняет?', 11000, QY[0], L(572.5), 1.2, 'graphite', 84)
write('чем жертвует?', 11000, QY[1], L(573.9), 1.0, 'graphite', 84)
write('для кого сделана?', 11000, QY[2], L(575.0), 1.1, 'graphite', 84)
for i, y in enumerate(QY[:2]): line([[10980, y + 55], [16300, y + 55]], L(575.8) + .1 * i, .4, 'grey', 4)
line([[13300, 3600], [13300, 4230]], L(576.1), .3, 'grey', 4); line([[15050, 3600], [15050, 4230]], L(576.2), .3, 'grey', 4)
tag('карта Меркатора', 13400, 3480, L(576.4), size=52, rot=-1)
write('углы', 13420, QY[0], L(577.4), .5, 'blue', 84)
write('площадями', 13420, QY[1], L(579.0), .8, 'blue', 84)
write('для моряков', 13420, QY[2], L(580.2), .9, 'blue', 84)
tag('любая другая', 15150, 3480, L(581.4), size=52, rot=1.5)
for i, y in enumerate(QY): write('иначе', 15170, y, L(582.0) + .35 * i, .4, 'blue', 84)
write('и это нормально', 13420, 4380, L(583.5), 1.1, 'graphite', 84)

# --- p9 585.37–597.78: the map does not lie, it answers another question; which country did you think bigger? comments, the ruler
write('Карта не врёт:', 10950, 4870, L(585.4), 1.0, 'graphite', 130)
write('она просто отвечает на другой вопрос', 10950, 5010, L(586.5), 1.8, 'graphite', 84)
write('эта — про курсы, а не про площади', 10950, 5180, L(589.0), 2.0, 'graphite', 84)
line(circle((11477, 5150), [130, 62], 30), L(590.4), .4, 'blue', 5)
write('Какую страну вы считали', 10950, 5560, L(591.5), 1.4, 'graphite', 140)
write('больше, чем она есть?', 10950, 5730, L(593.0), 1.2, 'graphite', 140)
write('?', 12900, 5780, L(593.6), .3, 'red', 400, align='center')
tag('напишите в комментариях', 11000, 5900, L(594.3), size=62, rot=-1.5)
el(type='ruler', id='ruler', **{'from': [10950, 6400], 'to': [13300, 6400]}, w=52, z=12, inset=70, magnetR=22,
   arrive=dict(t=L(596.4), kind='drop', d=.45, lift=180, spin=.5, land=.6))
ev(L(596.7), 'ruler', .4)
write('проверим по линейке', 13450, 6430, L(596.8), 1.0, 'blue', 84)

# ===================================================================== camera
def fitm(m, pad=60, top=0): x0, y0, x1, y1 = m.box; return [x0 - pad, y0 - pad - top, x1 + pad, y1 + pad]
c = Cam(*fit([350, 330, 3150, 1350]))
c.to(L(440.1), 3.6, z=z_of(c) * 1.03)
c.fit(L(443.9), 1.4, [350, 640, 3050, 2950], b=2.8)                     # sort 1: the Mercator map
c.fit(L(447.4), 1.3, [3250, 640, 5950, 2950], b=2.8)                    # sort 2: the equal-area map
c.fit(L(449.2), 1.7, [350, 330, 5950, 3260], b=3)                       # both + «нельзя» + the choice
c.to(L(451.0), 5.4, z=z_of(c) * 1.025)
c.fit(L(456.6), 1.2, [3250, 640, 5950, 2950], b=2.8)                    # Gall–Peters
c.fit(L(458.2), 1.5, [420, TL - 420, 3300, TL + 520], a=1.8, b=2.6)     # 1855
c.to(L(460.5), 4.5, z=z_of(c) * 1.02)
c.fit(L(465.4), 1.8, [4500, TL - 420, 6300, TL + 520], a=1.8, b=2.6)    # ride the line to 1973
c.to(L(467.4), 4.5, z=z_of(c) * 1.02)
c.fit(L(472.3), 1.4, [3250, 900, 6550, 3000], b=2.8)                    # Africa on Gall–Peters
c.fit(L(477.5), 1.3, [4400, TL - 720, 7900, TL + 540], b=2.8)           # 1986
c.fit(L(484.1), 1.5, [420, TL - 720, 7900, TL + 540], b=2.8)            # more than 100 years after Gall
c.fit(L(487.3), 1.3, [6500, TL - 300, 9000, TL + 960], b=2.8)           # cartographers objected; seven organisations
c.to(L(489.0), 3.0, z=z_of(c) * 1.02)
c.fit(L(492.0), 1.2, [6500, TL + 50, 8700, TL + 980], b=2.8)
c.fit(L(497.4), 1.3, [6550, TL - 300, 10150, TL + 1000], b=2.8)          # 1998
c.fit(L(501.7), 1.6, [6100, 640, 8900, 2900], a=1.8, b=2.6)             # up to the Winkel map
c.fit(L(506.6), 1.3, [6100, 640, 10350, 2900], b=2.8)                   # a little of everything
c.to(L(508.0), 6.0, z=z_of(c) * 1.02)
c.fit(L(514.4), 1.5, [350, 5100, 3700, 6000], b=2.8)                    # row 3: no perfect map
c.fit(L(522.6), 1.3, [350, 5100, 3700, 7050], b=2.8)                    # navigator, atlas, app
c.to(L(524.0), 5.0, z=z_of(c) * 1.02)
c.fit(L(529.2), 1.4, [4350, 5020, 7000, 7000], b=2.8)                   # the globe
c.fit(L(535.0), 1.4, [6950, 5020, 10300, 7120], b=2.8)                  # the flat map; Greenland dragged
c.to(L(536.6), 6.0, z=z_of(c) * 1.02)
c.fit(L(545.2), 1.0, [GSHR[0] - 500, GSHR[1] - 450, GSHR[2] + 650, GSHR[3] + 250], b=2.8)   # Greenland shrinks
c.fit(L(546.6), 2.1, [300, 300, 10350, 7150], b=3)                      # chapter pull-back
# chapter 2 (the card hides the jump)
rb = [min(A_[0], B_[0]) - 260, min(A_[1], B_[1]) - 380, max(A_[0], B_[0]) + 200, max(A_[1], B_[1]) + 260]
c.fit(L(549.0), .6, sh2(rb))
c.to(L(549.8), 3.5, z=z_of(c) * 1.03)
c.fit(L(553.4), 1.5, sh2([10850, 420, 14000, 2900]), b=2.8)                  # Greenland: not a mistake, stretched for the course
c.to(L(555.0), 6.0, z=z_of(c) * 1.02)
c.fit(L(561.3), 1.4, sh2([13450, 560, 16300, 2380]), b=2.8)                  # who invented it
c.fit(L(568.6), 1.5, sh2([10850, 3250, 16400, 4450]), b=2.8)                 # three questions
c.to(L(570.2), 14.0, z=z_of(c) * 1.025)
c.fit(L(585.2), 1.4, sh2([10850, 4250, 14000, 5300]), b=2.8)                 # the map does not lie
c.fit(L(591.2), 1.4, sh2([10850, 4250, 14400, 6550]), b=2.8)                 # which country? the ruler
c.fit(L(597.0), 2.9, [250, 250, 16750 + DX2, 7150], b=3)                      # the whole wall
c.to(L(599.9), 1, z=z_of(c) * 1.0)

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=53, texScale=.4, ghosts=240, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=40000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
OX = 700
def shift(e, dx):
    for k in ('xy', 'from', 'to', 'c'):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx
for e in E[CH2:]: shift(e, DX2)
for e in E: shift(e, OX)
scene['cam']['x'] += OX; scene['board']['w'] = BW + OX + DX2
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
