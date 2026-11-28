#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размеры стран · board film, PART 1: film time 0.00–115.10
(cold open «ХОЛОДНЫЙ СТАРТ» at 0, chapter «КАРТА 1569 ГОДА» at 43.22, up to the end of paragraph 5).
TIME MAPPING: this part starts the film, so the offset is T0 = 0.00:  local = film − 0.00  (local 0 … 115.10).
Narration: ru_geo/country_sizes/film.json. Two windows are covered by other clips; nothing important is drawn there
and no sound events are written for them:  3.92–11.15 (3D globe: Greenland vs Africa at true size) and
44.20–78.00 (Archive Light Table: the 1569 map and the 1595 Atlas). Under them the board quietly gets what the
narration has just said (the true-size panel; the blank Mercator chart of the Atlantic) and the camera drifts on.
Ink meanings: graphite = names/rules/facts · blue = measurement and numbers · red = only the break / the verdict.
Every frame keeps the bottom 250 px free (subtitles): cameras are fitted to the screen band y 50…800.
Outlines: open boundary data (johan/world.geo.json, public domain), dissolved and simplified (scenes/geo.py).
  Web-Mercator where the board says «карта Меркатора»; Lambert azimuthal equal-area, one scale, for «истинный размер».
Wall (4800 × 5000 board px), three rows:
  A  y   60–1900  cold open: the school wall map (Mercator: Greenland ≈ Africa) · the questions · true size, в 14 раз
  B  y 2100–3250  Жуан: ship, третья неделя, компас точен, the course the map bends, один курс, порт, Фландрия
  C  y 3450–4900  КАРТА 1569 ГОДА (after the clip): Mercator chart of the Atlantic, локсодрома = прямая, the great
                  circle as an arc, the rhumb-line print, Эдвард Райт; Жуан lays the ruler, takes the angle, СПАСЕНИЕ
    python3 scenes/_gen_film.py      → scenes/film.json, events.json
"""
T0 = 0.00
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from geo import FEAT, AFRICA, rings, dissolve, merc, laea, dp, clip_box, great_circle, area

OBJ = os.path.join(FILM, 'kit', 'objects')
def meta(i):
    m = json.load(open(os.path.join(OBJ, i + '.json'))); return m.get('size') or [m['w'], m['h']]
DUR = 115.10
BW, BH = 4800, 5000
COVER = [(3.92, 11.15), (44.20, 78.00)]

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t
def ink(kind, t, d, color='graphite', **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=size, **k)
def count(text, to, x, y, t, d, color='blue', size=100, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=size, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=24, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printx(id, src, x, y, t, w=None, h=None, rot=0, z=10, size='mid', **k):
    a = dict(t=round(t, 3), kind='drop', d=.5, lift=240, spin=1.4, land=.6)
    ev(t + .3, 'land', .2, size=size)
    d = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=a, **k)
    if w: d['w'] = w
    if h: d['h'] = h
    return el(**d)
def stamp(text, x, y, t, size=110, rot=-6, **k):
    ev(t, 'stamp', .2); return el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), **k)
def circle(c, r, n=40, a0=-90, turn=1.0):
    return [[c[0] + r * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + r * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(polys, t, d, color='graphite', lw=7, alpha=.85, weight_by_len=True):
    """many polylines drawn one after another over [t, t+d] as one ink element (coastlines)"""
    L = [sum(math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]) for i in range(len(p) - 1)) for p in polys]
    tot = sum(L) if weight_by_len else len(L); st = []; acc = 0
    for p, l in zip(polys, L):
        w = l if weight_by_len else 1
        st.append(dict(points=[[round(x, 1), round(y, 1)] for x, y in p], t=round(t + d * acc / tot, 3), d=round(max(.08, d * w / tot), 3), lw=lw))
        acc += w
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=st, lw=lw, color=color, alpha=alpha)
def tally(x0, y0, t, d, groups=3, n=7, h=95, gap=24, ggap=60, color='graphite'):
    st, k, N = [], 0, groups * (n + 1)
    for g in range(groups):
        gx = x0 + g * (n * gap + ggap)
        for i in range(n):
            st.append(dict(points=[[gx + i * gap, y0], [gx + i * gap + 4, y0 + h]], t=round(t + d * k / N, 3), d=.07, lw=7)); k += 1
        st.append(dict(points=[[gx - 14, y0 + h * .75], [gx + (n - 1) * gap + 18, y0 + h * .2]], t=round(t + d * k / N, 3), d=.12, lw=7)); k += 1
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=st, lw=7, color=color, alpha=.85)

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
    def fit(s, t, d, box, zmax=1.25, roll=None, a=2, b=2.6):
        x, y, z = fit(box, zmax); return s.to(t, d, x, y, z, roll, a, b)
    def shake(s, t, amp=5, f=9, k=7, dir=(0, 1)):
        s.shakes.append(dict(t=t, amp=amp, f=f, k=k, dir=list(dir)))
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=1.25):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, t0, t1, t2, **k):
    CARDS.append(dict(str=s, t0=t0, t1=t1, t2=t2, **k))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ХОЛОДНЫЙ СТАРТ', 0.05, 0.80, 1.00, hard=True)
type_card('КАРТА 1569 ГОДА', 43.27, 44.02, 44.22)

# ===================================================================== geometry
def simplify_all(lines, eps, minbox):
    out = []
    for L in lines:
        P = dp(L, eps)
        xs, ys = [p[0] for p in P], [p[1] for p in P]
        if len(P) >= 3 and max(max(xs) - min(xs), max(ys) - min(ys)) >= minbox: out.append(P)
    return sorted(out, key=lambda P: -len(P))
AF_LL = dissolve(rings(AFRICA)); GL_LL = dissolve(rings(['Greenland']))
# --- A: Web-Mercator panel (школьная карта): x = XA + SA·λ, y = YA − SA·ln tan(π/4 + φ/2)
SA, LON_A, YTOP = 430, -75, merc(0, 84)[1]
XA0, YA0 = 450, 250
def pa(lon, lat): X, Y = merc(lon, lat); return XA0 + SA * (X - math.radians(LON_A)), YA0 + SA * (YTOP - Y)
MERC_AF = simplify_all([[pa(*p) for p in L] for L in AF_LL], 2.5, 22)
MERC_GL = simplify_all([[pa(*p) for p in L] for L in GL_LL], 2.5, 22)
# --- A: true size, Lambert azimuthal equal-area, both at KT px per km (centred on each shape)
KT = .15
AFC, GLC = (3990, 1010), (3840, 735)
TRUE_AF = simplify_all([[(AFC[0] + KT * x, AFC[1] - KT * y) for x, y in (laea(*p, 17, 2) for p in L)] for L in AF_LL], 2.5, 18)
TRUE_GL = simplify_all([[(GLC[0] + KT * x, GLC[1] - KT * y) for x, y in (laea(*p, -41, 72) for p in L)] for L in GL_LL], 2.5, 18)
RATIO = sum(area(P) for P in TRUE_AF) / sum(area(P) for P in TRUE_GL)
# --- C: Mercator chart of the North Atlantic: lon −85…5, lat 22…56
SC, LON_C, LAT_C0, LAT_C1 = 1500, -85, 22, 56
XC0, YC0 = 300, 3610
YC_TOP = merc(0, LAT_C1)[1]
def pc(lon, lat): X, Y = merc(lon, lat); return XC0 + SC * (X - math.radians(LON_C)), YC0 + SC * (YC_TOP - Y)
CX1, CY1 = pc(5, LAT_C0)
ALL = dissolve(rings([n for n in FEAT if n not in ('Antarctica',)]))
coast = []
for L in ALL:
    for part in clip_box(L, LON_C, LAT_C0, 5, LAT_C1): coast.append([pc(*p) for p in part])
COAST = simplify_all(coast, 3, 28)
P1LL, P2LL = (-15.4, 28.1), (-70.9, 42.3)          # порт отправления / порт назначения (unnamed on the board)
P1, P2 = pc(*P1LL), pc(*P2LL)
GC = [pc(*p) for p in great_circle(P1LL, P2LL, 60)]
print('area ratio Africa/Greenland (equal-area, as drawn) = %.2f' % RATIO, '· coast lines', len(COAST), '· P1', P1, 'P2', P2)

# ===================================================================== A. cold open 1.00–3.92: the Mercator picture
GLB = [min(p[0] for L in MERC_GL for p in L), min(p[1] for L in MERC_GL for p in L), max(p[0] for L in MERC_GL for p in L), max(p[1] for L in MERC_GL for p in L)]
AFB = [min(p[0] for L in MERC_AF for p in L), min(p[1] for L in MERC_AF for p in L), max(p[0] for L in MERC_AF for p in L), max(p[1] for L in MERC_AF for p in L)]
print('merc Greenland box', [round(v) for v in GLB], 'Africa box', [round(v) for v in AFB])
line(MERC_GL[0], 1.05, .95, 'graphite', 9, ea=1.4, eb=1.8)
if len(MERC_GL) > 1: strokes_el(MERC_GL[1:], 1.9, .3, 'graphite', 6)
line(MERC_AF[0], 1.6, 1.1, 'graphite', 9, ea=1.4, eb=1.8)
if len(MERC_AF) > 1: strokes_el(MERC_AF[1:], 2.6, .3, 'graphite', 6)
EQY = pa(0, 0)[1]
line([[AFB[0] - 50, EQY], [AFB[2] + 60, EQY]], 2.3, .5, 'grey', 4, dash=[18, 14])
tag('Гренландия', 470, GLB[3] + 95, 2.25, size=52, rot=-2)
tag('Африка', 470, (AFB[1] + AFB[3]) / 2 + 40, 2.55, size=52, rot=1.5)
tag('карта Меркатора', 1020, 330, 2.95, size=44, rot=-1, amp=7)

# ===================================================================== (3.92–11.15 globe clip) true-size panel, no sound
line(TRUE_AF[0], 5.0, 1.0, 'graphite', 9, ea=1.4, eb=1.8)
if len(TRUE_AF) > 1: strokes_el(TRUE_AF[1:], 6.0, .2, 'graphite', 6)
line(TRUE_GL[0], 6.4, .5, 'blue', 9, ea=1.4, eb=1.8)
tag('истинный размер', 4120, 290, 7.0, size=46, rot=-1.5, amp=7)
tag('Гренландия', 4000, 760, 7.3, size=40, rot=1, amp=6)
write('Африка больше', 3740, 1790, 7.8, .9, 'graphite', 76)
count('в {0} раз', [14], 4310, 1790, 8.8, .9, 'blue', 96)

# ===================================================================== A. 11.15–22.64: school walls, who, the price
FX0, FX1, FY0, FY1 = 360, AFB[2] + 110, 165, AFB[3] + 60
line([[FX0 - 40, FY0], [FX1 + 40, FY0]], 11.35, .45, 'graphite', 24)          # top rod
line([[FX0 + 40, FY0 - 6], [(FX0 + FX1) / 2, 70], [FX1 - 40, FY0 - 6]], 11.8, .5, 'grey', 5)   # the cord
magnet((FX0 + FX1) / 2, 70, 12.2, r=24)                                        # the hook
line([[FX0, FY0 + 12], [FX0, FY1], [FX1, FY1], [FX1, FY0 + 12]], 12.35, .9, 'graphite', 7, ea=1.6, eb=2)
line([[FX0 - 40, FY1 + 10], [FX1 + 40, FY1 + 10]], 13.1, .35, 'graphite', 24)  # bottom rod
CL = 1700
write('как это попало', CL, 470, 11.95, .9, 'graphite', 90)
write('на школьные стены?', CL, 590, 12.85, 1.0, 'graphite', 90)
write('кто это придумал', CL, 770, 13.85, 1.0, 'graphite', 90)
write('?', CL + 790, 780, 14.85, .25, 'red', 130)
tag('ответ — в конце', CL + 40, 905, 15.05, size=50, rot=-1.5)
write('один картограф', CL, 1120, 16.6, 1.1, 'graphite', 90)
write('решил задачу моряков', CL, 1240, 18.95, 1.4, 'graphite', 84)
write('и заплатил Гренландией', CL, 1360, 20.6, 1.3, 'graphite', 84)
gc_ = ((GLB[0] + GLB[2]) / 2, (GLB[1] + GLB[3]) / 2)
ink('ring', 21.85, .6, 'red', c=[round(gc_[0]), round(gc_[1])], r=[round((GLB[2] - GLB[0]) / 2 + 55), round((GLB[3] - GLB[1]) / 2 + 45)], lw=9)
arrow([CL - 20, 1335], [GLB[2] + 75, gc_[1] + 120], 22.2, .4, 'graphite', 6)

# ===================================================================== B. Жуан 23.34–41.08
BY = 2620                                     # the course line
sm = meta('print_ship'); SHW = 640; SHH = SHW * sm[1] / sm[0]
printx('ship', 'print_ship', 700, 2600, 23.4, w=SHW, rot=-1.5, size='big')
magnet(700 - 230, 2600 - SHH / 2 + 24, 23.8, r=22); magnet(700 + 230, 2600 - SHH / 2 + 18, 23.92, r=22)
tag('Жуан', 410, 3020, 23.6, size=64, rot=-2)
tag('выдуманный моряк', 410, 3150, 24.6, size=46, rot=1)
write('третья неделя без берега', 1150, 2210, 26.0, 1.6, 'graphite', 80)
tally(1170, 2265, 26.9, 1.2)
cm = meta('print_compass'); CMW = 380
printx('compass', 'print_compass', 1360, 2905, 28.2, w=CMW, rot=2)
magnet(1360, 2905 - CMW / 2 + 22, 28.6, r=20)
tag('компас точен', 1600, 2880, 28.75, size=48, rot=-1)
line([[1080, BY], [4000, BY]], 29.3, .8, 'graphite', 6, dash=[26, 20])       # where the course should go
bend = [[1080 + 2680 * u, BY - 330 * u ** 2] for u in [i / 40 for i in range(41)]]
line(bend, 30.0, 1.3, 'blue', 8, arrow=True, ea=1.5, eb=2)                      # where the map takes him
ink('dim', 31.35, .45, 'blue', **{'from': [3820, BY - 330], 'to': [3820, BY - 8]}, lw=6, ext=[])
write('десятки миль', 3260, 2225, 31.4, 1.1, 'blue', 66)
# the port
PX = 4080
line([[PX, BY], [PX, BY - 150]], 33.3, .2, 'graphite', 7)
line([[PX, BY - 150], [PX + 85, BY - 122], [PX, BY - 95]], 33.5, .2, 'graphite', 6)
line(circle((PX, BY), 20, 16), 33.7, .15, 'graphite', 8)
write('порт', PX - 60, BY + 120, 35.75, .5, 'graphite', 72)
write('один курс', 2300, 2740, 32.85, .9, 'graphite', 84)
arrow([1080, BY], [PX - 40, BY], 33.9, 1.3, 'graphite', 9)                    # one course, straight to the port
write('ни разу не свернув', 2300, 2860, 36.0, 1.4, 'graphite', 72)
tag('кто решил задачу?', 2330, 2985, 37.9, size=46, rot=-1)
write('жил во Фландрии', 2300, 3140, 39.9, 1.0, 'graphite', 80)

# ===================================================================== (44.20–78.00 light-table clip) the chart, no sound
GRID = []
for lon in range(-80, 5, 10): GRID.append([pc(lon, LAT_C0), pc(lon, LAT_C1)])
for lat in (30, 40, 50): GRID.append([pc(LON_C, lat), pc(5, lat)])
strokes_el(GRID, 70.0, 1.6, 'grey', 4, alpha=.6, weight_by_len=False)
strokes_el(COAST, 71.8, 4.5, 'graphite', 6, alpha=.85)
tag('карта Меркатора', XC0 + 40, YC0 + 90, 76.6, size=44, rot=-1.5, amp=6)

# ===================================================================== C. 78.55–96.81 локсодрома
write('главная находка: курс по компасу —', XC0, YC0 - 70, 78.6, 2.0, 'graphite', 78)
write('прямая', XC0 + 1310, YC0 - 70, 81.4, .6, 'blue', 78)
line([P1, P2], 80.9, 1.5, 'blue', 9, ea=1.6, eb=2)
for p in (P1, P2): line(circle(p, 16, 14), 80.85 if p is P1 else 82.45, .15, 'graphite', 9)
ANG = math.degrees(math.atan2(P2[1] - P1[1], P2[0] - P1[0]))                    # board angle of the course (≈ −163°)
def at_lon(lon):
    x = pc(lon, 0)[0]; u = (x - P1[0]) / (P2[0] - P1[0]); return [x, P1[1] + u * (P2[1] - P1[1])]
for i, lon in enumerate((-30, -50, -60)):
    q = at_lon(lon)
    ink('arc', 85.8 + .45 * i, .4, 'blue', c=[round(q[0]), round(q[1])], r=75, a0=-90, a1=round(ANG, 2), ccw=True, lw=6)
mid = at_lon(-40); LB = 620; LBY = at_lon(-55)[1]
write('локсодрома', LB, LBY + 230, 83.4, 1.0, 'graphite', 100)
write('линия постоянного курса', LB, LBY + 330, 85.75, 1.6, 'graphite', 66)
pr = meta('print_rhumb'); PRW = 860; PRH = PRW * pr[1] / pr[0]; PRC = (3430, 3790)
printx('rhumb', 'print_rhumb', PRC[0], PRC[1], 84.1, w=PRW, rot=-1, size='big')
magnet(PRC[0] - 330, PRC[1] - PRH / 2 + 22, 84.5, r=20); magnet(PRC[0] + 330, PRC[1] - PRH / 2 + 18, 84.62, r=20)
el(type='card', id='credit', xy=[PRC[0] + 150, PRC[1] + PRH / 2 + 55], w=560, h=56, rot=-1, z=9, magnetR=13,
   magnets=[[-262, 0]], lines=[dict(text='схема: Jacob Rus, CC BY-SA 4.0', font='mono', size=26, x=36, y=10, color='graphite')],
   arrive=dict(t=85.0, kind='drop', d=.4, lift=150, spin=.8, land=.6))
ev(85.25, 'land', .2, size='small')
# кратчайший путь выглядит дугой (88.12–92.33)
line(GC, 89.9, 1.5, 'graphite', 7, dash=[24, 18], ea=1.6, eb=2)
top = min(GC, key=lambda p: abs(p[0] - 1250))
write('кратчайший путь — дуга', top[0], top[1] - 95, 90.9, 1.4, 'graphite', 70, align='center')
# таблицы Эдварда Райта (92.33–96.65)
WX = 3990
write('точные таблицы', WX, 3620, 92.45, 1.0, 'graphite', 72)
TB = []
for i in range(5): TB.append([[WX, 3690 + 70 * i], [WX + 640, 3690 + 70 * i]])
for x in (WX, WX + 210, WX + 640): TB.append([[x, 3690], [x, 3970]])
strokes_el(TB, 93.4, 1.0, 'graphite', 5, alpha=.8, weight_by_len=False)
for i in range(4):
    strokes_el([[[WX + 30, 3740 + 70 * i], [WX + 150, 3740 + 70 * i]], [[WX + 250, 3740 + 70 * i], [WX + 560 - 40 * (i % 2), 3740 + 70 * i]]],
               93.9 + .15 * i, .3, 'grey', 4, alpha=.6)
tag('Эдвард Райт', WX + 30, 4085, 94.95, size=52, rot=-1.5)
write('англичанин', WX, 4250, 95.6, .8, 'graphite', 66)

# ===================================================================== C. 97.36–114.52 Жуан с линейкой
printx('ship2', 'print_ship', 3140, 4530, 97.45, w=300, rot=2)
magnet(3140, 4530 - 150 + 18, 97.85, r=18)
tag('Жуан', 2880, 4790, 97.9, size=46, rot=-2)
ux, uy = (P2[0] - P1[0]), (P2[1] - P1[1]); Ln = math.hypot(ux, uy); nx, ny = -uy / Ln, ux / Ln     # normal (points down-right)
if ny < 0: nx, ny = -nx, -ny
OFF = 52
el(type='ruler', id='ruler', **{'from': [P1[0] + nx * OFF + ux / Ln * 40, P1[1] + ny * OFF + uy / Ln * 40],
                                'to': [P2[0] + nx * OFF - ux / Ln * 40, P2[1] + ny * OFF - uy / Ln * 40]},
   w=54, z=12, inset=60, magnetR=22, arrive=dict(t=99.4, kind='drop', d=.45, lift=170, spin=.6, land=.6))
ev(99.7, 'ruler', .4)
tag('порт отправления', P1[0] - 260, P1[1] + 125, 101.1, size=42, rot=-1.5, amp=7)
tag('порт назначения', P2[0] - 500, P2[1] - 110, 102.0, size=42, rot=1, amp=7)
# снимает угол и выставляет курс (102.91–105.87)
line([P1, [P1[0], P1[1] - 300]], 102.95, .35, 'blue', 6, dash=[18, 14])
write('С', P1[0] - 18, P1[1] - 320, 103.25, .2, 'blue', 56)
ink('arc', 103.45, .6, 'blue', c=[round(P1[0]), round(P1[1])], r=230, a0=-90, a1=round(ANG, 2), ccw=True, lw=9)
write('угол = курс', P1[0] - 560, P1[1] - 300, 104.2, 1.1, 'blue', 84)
# не самая короткая, зато без поворотов (105.87–110.74)
write('не самая короткая', LB, LBY + 430, 105.95, 1.3, 'graphite', 66)
for i, (txt, t) in enumerate((('без поворотов', 108.4), ('без гаданий', 109.6))):
    y = 4440 + 125 * i
    line([[3360, y - 30], [3385, y - 5], [3430, y - 60]], t - .25, .25, 'blue', 8)
    write(txt, 3460, y, t, .9, 'graphite', 74)
stamp('СПАСЕНИЕ', 4200, 4735, 113.2, size=78, rot=-6)

# ===================================================================== camera (one continuous camera; only the cards hide it)
MAPA = [FX0 - 60, 40, FX1 + 60, FY1 + 30]
c = Cam(*fit(MAPA))
c.to(1.0, 2.9, z=z_of(c) * 1.03, a=1.6, b=3)                                     # Greenland, Africa, «карта Меркатора»
c.fit(4.0, 6.5, [3330, 220, 4700, 1880], a=2, b=2.4)                              # (under the globe clip) to the true-size panel
c.fit(11.5, 1.6, [250, 40, 4720, FY1 + 30], a=2, b=2.8)                      # school walls: the frame, the questions
c.fit(14.9, 1.4, [1500, 330, 3050, 1450], a=2, b=2.8)                             # ответ в конце, один картограф
c.to(16.4, 4.2, z=z_of(c) * 1.03)
c.fit(20.9, 1.2, [250, 40, 4720, FY1 + 30], a=2, b=2.8)                      # заплатил Гренландией
c.fit(22.75, 1.3, [250, 2100, 2250, 3260], a=2, b=2.8)                            # B: Жуан
c.to(24.1, 3.7, z=z_of(c) * 1.03)
c.fit(28.0, 1.1, [300, 2120, 2300, 3260], a=2, b=2.8)                             # компас точен
c.fit(29.2, 2.0, [1150, 2120, 4600, 3260], a=1.8, b=2.6)                          # ride the course the map bends
c.to(31.3, 4.8, z=z_of(c) * 1.02)
c.fit(37.7, 1.4, [2250, 2650, 4450, 3200], a=2, b=2.8)                            # Фландрия
c.fit(41.1, 1.9, [0, 0, BW, 3300], a=2, b=2.4)                                    # pull back: the cold open's wall
c.fit(44.3, 32.0, [XC0 - 50, YC0 - 170, CX1 + 70, CY1 + 60], a=2, b=2.2)          # (under the card + clip) slowly to row C
c.to(78.0, 4.6, z=z_of(c) * 1.02)
c.fit(83.25, 1.3, [XC0 - 50, YC0 - 170, 3900, CY1 + 60], a=2, b=2.8)              # локсодрома + the printed diagram
c.fit(87.9, 1.4, [XC0 - 50, YC0 - 170, CX1 + 70, CY1 + 60], a=2, b=2.8)          # кратчайший путь — дуга
c.fit(92.2, 1.3, [2930, 3440, 4720, 4320], a=2, b=2.8)                            # Эдвард Райт
c.fit(97.2, 1.4, [XC0 - 50, YC0 - 170, 3700, CY1 + 80], a=2, b=2.8)               # Жуан, the ruler
c.fit(102.8, 1.0, [130, P1[1] - 520, 3050, P1[1] + 200], a=2, b=2.8)   # the angle
c.fit(105.7, 1.3, [XC0 - 50, YC0 - 170, CX1 + 70, CY1 + 60], a=2, b=2.8)          # not the shortest
c.fit(108.0, 1.2, [2850, 4000, 4720, 4860], a=2, b=2.8)                           # без поворотов, без гаданий, СПАСЕНИЕ
c.to(109.3, 3.6, z=z_of(c) * 1.03)
c.to(113.6, 1.3, x=2400, y=4175, z=.385, a=2, b=2.4)                               # pull back: the chapter's wall so far

# ===================================================================== write (local time = film − T0)
def shift_t(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('t', 'out') and isinstance(v, (int, float)): o[k] = round(v - T0, 3)
            else: shift_t(v)
    elif isinstance(o, list):
        for v in o: shift_t(v)
EV = [e for e in EV if e['type'] == 'key' or not any(a - .05 < e['t'] < b for a, b in COVER)]
shift_t(E); cam = c.json(); shift_t(cam['moves']); shift_t(cam['shakes'])
for cd in CARDS:
    for k in ('t0', 't1', 't2'): cd[k] = round(cd[k] - T0, 3)
evs = [dict(e, t=round(e['t'] - T0, 3)) for e in sorted(EV, key=lambda e: e['t'])]
scene = dict(dur=DUR, board=dict(w=BW, h=BH, seed=53, texScale=.4, ghosts=120, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=16000, min=.8), cam=cam, mbMax=6, elements=E, cards=CARDS, ev=evs, subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=evs), open(os.path.join(FILM, 'events.json'), 'w'), ensure_ascii=False, indent=1)
print('film.json', DUR, 's ·', len(E), 'elements ·', len(evs), 'events ·', len(c.moves), 'camera moves')
