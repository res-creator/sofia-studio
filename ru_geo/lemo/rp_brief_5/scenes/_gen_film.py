#!/usr/bin/env python3
"""«Мысленный эксперимент» · Отдалённые места (remote_places) · board film, PART 5: the end of «ТРИСТАН-ДА-КУНЬЯ»
(paragraphs from film 461.15) and the chapter «ИТОГ» (card at film 556.90) to the end of the film.
FILM range 461.10–618.86 s (157.76 s). The renderer works in LOCAL time:  local = film − 461.10.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/remote_places/film.json (segs → captions).
Wall (board px):
  row 1  (y  380…2150)  «ТРИСТАН-ДА-КУНЬЯ» p1 surnames, potato patches · p2 neighbours (Соловей ≈ 34 км, Гоф ≈ 350 км)
                         · p3 10 October 1961, evacuation to England · p4 most returned · p5 the point of view
  row 2  (y 2600…5500)  «ИТОГ»  three steel rulers: до любой суши → точка Немо · до жилья → Тристан-да-Кунья ·
                         до людей → depends; the astronauts over Point Nemo; the closing question.
The film ends on the style's native ending: a pull-back to the whole wall, the three rulers readable.
Island positions (Tristan, Inaccessible, Nightingale, Gough) from their latitude/longitude, true scale per map,
the distances written as the narration says them (≈ 34 км, ≈ 350 км); island shapes hand-drawn (too small for the
1:110m coastline data). Great Britain: johan/world.geo.json (Natural Earth 1:110m, public domain), Lambert
azimuthal equal-area; Calshot at 50.82° N, 1.31° W.
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the break.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
R0, R1 = 461.10, 618.86
DUR = round(R1 - R0, 3)                       # 157.76
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 13700, 5950

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
def meta(src): m = json.load(open(os.path.join(OBJ, src + '.json'))); return m['w'], m['h']
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def credit(id, text, x, y, t, w, rot=-.8, size=27):
    """a printed credit strip under a print (CC BY: author and licence)"""
    ev(t + .2, 'land', .1, size='small')
    return el(type='card', id=id, xy=[x, y], w=w, h=56, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=size, x=20, y=38, color='grey')])
def stamp(text, x, y, t, size=150, rot=-6, color='red'):
    ev(t, 'stamp', .2); return el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), color=color)
def ruler(id, a, b, t, w=170):
    ev(t + .25, 'ruler', .4)
    return el(type='ruler', id=id, **{'from': list(a), 'to': list(b)}, w=w, z=12, inset=110, magnetR=48,
              arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=200, spin=.5, land=.6))
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='graphite', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
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
def blob(c, rx, ry, seed, rot=0, n=40):
    """a hand-drawn island outline: a wobbly ellipse"""
    r = random.Random(seed); ph = [r.uniform(0, 6.3) for _ in range(3)]
    cs, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot)); P = []
    for i in range(n + 1):
        a = 2 * math.pi * i / n; k = 1 + .10 * math.sin(3 * a + ph[0]) + .06 * math.cos(5 * a + ph[1]) + .04 * math.sin(7 * a + ph[2])
        x, y = rx * k * math.cos(a), ry * k * math.sin(a)
        P.append([c[0] + x * cs - y * sn, c[1] + x * sn + y * cs])
    return P
def house(x, y, t, s=1.0, color='graphite', lw=6):   # (x, y) = bottom centre
    line(rect(x - 40 * s, y - 60 * s, x + 40 * s, y), t, .25, color, lw)
    line([[x - 52 * s, y - 56 * s], [x, y - 100 * s], [x + 52 * s, y - 56 * s]], t + .25, .2, color, lw)
def person(x, y, t, s=1.0, color='graphite', lw=7):  # (x, y) = feet
    line(circle((x, y - 150 * s), 24 * s, 18), t, .15, color, lw)
    line([[x, y - 124 * s], [x, y - 55 * s]], t + .15, .1, color, lw)
    line([[x - 32 * s, y], [x, y - 55 * s], [x + 32 * s, y]], t + .25, .12, color, lw)
    line([[x - 40 * s, y - 85 * s], [x, y - 105 * s], [x + 40 * s, y - 85 * s]], t + .37, .12, color, lw)
def ship(x, y, t, d=.7, color='graphite', s=1.0, lw=6):
    """a small ship sketch standing on (x, y)"""
    for i, P in enumerate([[[-70, 0], [70, 0], [95, -38], [-95, -38], [-70, 0]], [[0, -38], [0, -150]], [[0, -145], [62, -60], [0, -60]]]):
        line([[x + s * px, y + s * py] for px, py in P], t + i * d / 3, d / 3, color, lw)
def boat(x, y, t, s=1.0, color='graphite', lw=5):
    line([[x - 40 * s, y - 18 * s], [x - 26 * s, y], [x + 26 * s, y], [x + 40 * s, y - 18 * s], [x - 40 * s, y - 18 * s]], t, .2, color, lw)
def waves(x0, x1, y, t, d, color='blue', lw=5, amp=12, wl=70):
    n = int((x1 - x0) / wl * 8)
    return line([[x0 + (x1 - x0) * i / n, y + amp * math.sin(2 * math.pi * (x1 - x0) * i / n / wl)] for i in range(n + 1)], t, d, color, lw)
def scalebar(x, y, K, km, t, label=None, size=44):
    dim([x, y], [x + K * km, y], t, .4, lw=5, arrows=False)
    write(label or f'{km} км', x + K * km / 2, y - 22, t + .25, .4, 'blue', size, align='center')

# ---- Great Britain from the open boundary data (Lambert azimuthal equal-area, km, y south)
RE = 6371.0088
def laea(lon0, lat0):
    p0, l0 = math.radians(lat0), math.radians(lon0)
    def f(lon, lat):
        p, l = math.radians(lat), math.radians(lon)
        k = math.sqrt(2 / (1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)))
        return [RE * k * math.cos(p) * math.sin(l - l0), -RE * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))]
    return f
def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; Ln = math.hypot(dx, dy); best, bi = -1, 0
    for i in range(1, len(P) - 1):
        q = P[i]; dd = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / Ln if Ln else math.hypot(q[0] - a[0], q[1] - a[1])
        if dd > best: best, bi = dd, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)
WG = {f['id']: f for f in json.load(open('/tmp/world.geo.json'))['features']}
g = WG['GBR']['geometry']; GBP = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
fgb = laea(-3.0, 54.5)
GB_RINGS = [dp([fgb(lo, la) for lo, la in pg[0]], 6) for pg in GBP]
CALSHOT = fgb(-1.31, 50.82)

# ===================================================================== camera helpers
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
type_card('ИТОГ', 556.90)

# ===================================================================== ROW 1 · «ТРИСТАН-ДА-КУНЬЯ» (continued)
# --- p1 461.15–479.78: few surnames (Glass, Green, Swain, Hagan, Cotton, Repetto, Lavarello); the Potato Patches near
#     the village; instead of shops and roads: the ship, the garden and neighbours known by name, because there are no others
write('фамилий на острове немного:', 420, 600, L(461.25), 1.6, 'graphite', 76)
SN = [('Гласс', 450, 790, 463.45), ('Грин', 900, 790, 463.95), ('Свейн', 1310, 790, 464.5),
      ('Хейген', 450, 960, 465.05), ('Коттон', 1000, 960, 465.7),
      ('Репетто', 450, 1130, 466.35), ('Лаварелло', 1050, 1130, 467.0)]
for i, (nm, x, y, ft) in enumerate(SN): tag(nm, x, y, L(ft), size=58, rot=(-1.5, 1, -.5, 1.5, -1, .8, -1.2)[i])
PP = (2230, 930)
printd('potato', 'print_potato', PP[0], PP[1], L(469.75), w=880, rot=1.5, size='mid')
credit('cred_potato', 'Картофельные поля · фото: Brian Gratwicke, CC BY 2.0', PP[0], 1330, L(470.2), 900)
tag('Картофельные поля', 1800, 470, L(470.55), size=56, rot=-1.5)
line([[2120, 520], [2160, 600]], L(471.2), .25, 'graphite', 6, arrow=True)
write('вместо магазинов и дорог:', 420, 1500, L(472.25), 1.6, 'graphite', 70)
ship(640, 1880, L(474.15), .6, s=1.1)
write('корабль', 640, 1990, L(474.3), .5, 'graphite', 58, align='center')
GX0, GY0 = 1000, 1720                                          # the garden: a bed with rows
line(rect(GX0, GY0, GX0 + 330, GY0 + 170), L(474.75), .35, 'graphite', 6)
for i in range(5): line([[GX0 + 30 + i * 68, GY0 + 25], [GX0 + 30 + i * 68, GY0 + 145]], L(475.05) + i * .06, .1, 'graphite', 5, quiet=(i > 0), dash=[12, 14])
write('огород', GX0 + 165, 1990, L(475.0), .5, 'graphite', 58, align='center')
for i, px in enumerate((1560, 1700, 1840)): person(px, 1890, L(475.4) + i * .22, .85)
write('соседи', 1700, 1990, L(475.7), .5, 'graphite', 58, align='center')
write('по именам', 1700, 2085, L(476.3), .8, 'graphite', 58, align='center')
write('других нет', 2100, 1900, L(478.1), 1.0, 'red', 70)
line([[2100, 1925], [2450, 1925]], L(479.1), .3, 'red', 6)

# --- p2 480.48–497.46: Nightingale (Соловей) ≈ 34 km; Gough ≈ 350 km; Gough and Inaccessible have no permanent
#     residents, Gough only a weather station; for Tristan: the inner circle, neighbours across the strait
def ll_km(lat, lon, lat0=-37.11, lon0=-12.28):   # km east, km south of Tristan
    return [(lon - lon0) * 111.2 * math.cos(math.radians((lat + lat0) / 2)), -(lat - lat0) * 111.2]
NG_KM, IN_KM, GO_KM = ll_km(-37.42, -12.48), ll_km(-37.30, -12.68), ll_km(-40.32, -9.94)
NP = (3480, 800)
printd('nightingale', 'print_nightingale', NP[0], NP[1], L(480.9), w=780, rot=-1.5, size='mid')
credit('cred_ng', 'остров Соловей · фото: Brian Gratwicke, CC BY 2.0', NP[0], 1150, L(481.3), 800, rot=1)
K = 12.0; TC = (4620, 700)                                     # close-up map, 12 px per km
P_ = lambda v: [TC[0] + K * v[0], TC[1] + K * v[1]]
NGc, INc = P_(NG_KM), P_(IN_KM)
line(blob(TC, 6.0 * K, 5.8 * K, 3), L(480.55), .6, 'graphite', 8, fill='grey', fillA=.14)
line(circle(TC, 7, 8), L(481.0), .1, 'graphite', 12)
tag('Тристан', TC[0] + 120, TC[1] - 40, L(480.9), size=54, rot=1)
line(blob(NGc, 1.6 * K, 1.1 * K, 7, rot=20), L(481.9), .35, 'graphite', 7, fill='grey', fillA=.14)
tag('Соловей', NGc[0] + 70, NGc[1] + 10, L(482.0), size=54, rot=-1)
u = [NGc[0] - TC[0], NGc[1] - TC[1]]; ul = math.hypot(*u); u = [u[0] / ul, u[1] / ul]; nrm = [u[1], -u[0]]
OFF = 34
DA = [TC[0] + u[0] * 6.4 * K + nrm[0] * OFF, TC[1] + u[1] * 6.4 * K + nrm[1] * OFF]
DB = [NGc[0] - u[0] * 1.6 * K + nrm[0] * OFF, NGc[1] - u[1] * 1.6 * K + nrm[1] * OFF]
dim(DA, DB, L(483.3), .9)
count('≈ {0} км', [34], (DA[0] + DB[0]) / 2 - 60, (DA[1] + DB[1]) / 2 + 20, L(484.3), 1.3, size=78, align='right')
scalebar(4450, 1300, K, 10, L(483.9))
# the wider map: Gough, true bearing, ≈ 350 km (as the narration says), 2.2 px per km
K2 = 2.2; T2 = (5420, 620)
gk = math.hypot(*GO_KM); GO2 = [T2[0] + K2 * GO_KM[0] / gk * 350, T2[1] + K2 * GO_KM[1] / gk * 350]
line(circle(T2, 14, 14), L(485.75), .15, 'graphite', 8, fill='grey', fillA=.4)
for v in (NG_KM, IN_KM): line(circle([T2[0] + K2 * v[0], T2[1] + K2 * v[1]], 5, 8), L(485.9), .08, 'graphite', 6, quiet=True)
write('Тристан', T2[0] + 40, T2[1] - 20, L(485.8), .4, 'graphite', 50)
line(blob(GO2, 6.5 * K2 * 1.6, 3.2 * K2 * 1.6, 11, rot=-60), L(486.3), .3, 'graphite', 7, fill='grey', fillA=.2)
tag('Гоф', GO2[0] + 60, GO2[1] + 5, L(486.5), size=54, rot=1.5)
line([T2, GO2], L(486.6), 1.0, 'blue', 6, dash=[18, 14])
count('≈ {0} км', [350], (T2[0] + GO2[0]) / 2 - 40, (T2[1] + GO2[1]) / 2 + 20, L(486.9), 1.4, size=78, align='right')
scalebar(5300, 1500, K2, 100, L(487.2))
tag('Недоступный', 3930, INc[1] + 230, L(488.55), size=52, rot=-1)
line([[4130, INc[1] + 175], [INc[0] - 10, INc[1] + 30]], L(489.0), .3, 'graphite', 5, arrow=True)
write('Гоф и Недоступный:', 3950, 1600, L(488.4), 1.0, 'graphite', 62)
write('без постоянных жителей', 3950, 1690, L(489.6), 1.2, 'graphite', 62)
write('на Гофе — только метеостанция', 3950, 1800, L(490.9), 2.0, 'graphite', 62)
MS = (GO2[0] + 150, GO2[1] - 40)                                 # weather station: a mast with cups and a vane
line([[MS[0], MS[1] + 60], [MS[0], MS[1] - 120]], L(492.2), .2, 'graphite', 6)
line([[MS[0] - 50, MS[1] - 120], [MS[0] + 50, MS[1] - 120]], L(492.4), .15, 'graphite', 5)
for sx in (-50, 50): line(circle((MS[0] + sx, MS[1] - 132), 12, 10), L(492.55), .1, 'graphite', 5, quiet=True)
line([[MS[0], MS[1] - 60], [MS[0] + 55, MS[1] - 75]], L(492.7), .12, 'graphite', 5)
RC = ((TC[0] + INc[0] + NGc[0]) / 3 + 10, (TC[1] + INc[1] + NGc[1]) / 3 + 10)
ink('ring', L(493.7), .9, 'graphite', c=list(RC), r=[400, 390], lw=6)
write('ближний круг', RC[0] + 330, RC[1] - 330, L(494.0), .9, 'graphite', 60)
TP = (3450, 1720)
printd('trng', 'print_trng', TP[0], TP[1], L(495.0), w=640, rot=1.2, size='mid')
credit('cred_trng', 'Тристан с острова Соловей · фото: B. Gratwicke, CC BY 2.0', TP[0], 2020, L(495.4), 720, rot=-.6, size=24)
write('соседи через пролив', 3950, 1950, L(495.95), 1.4, 'graphite', 62)

# --- p3 498.19–519.55: 10 October 1961, an eruption next to the village: all 264 people left in boats for
#     Nightingale; in the morning a Dutch ship picked them up; then to England, a former RAF camp near Calshot, Hampshire
write('10 октября 1961', 6350, 580, L(498.25), 2.0, 'graphite', 84)
IB = 1150                                                       # the island in profile: sea line, cone, village
waves(6330, 7700, IB + 20, L(500.3), .8)
line([[6420, IB], [6640, IB - 150], [6880, IB - 380], [6980, IB - 440], [7080, IB - 380], [7320, IB - 170], [7420, IB - 130], [7560, IB - 60], [7650, IB]], L(500.4), .9, 'graphite', 8)
for i, hx in enumerate((7470, 7540, 7610)): house(hx, IB - 10 - (7650 - hx) * .5 * 0 , L(501.0) + i * .15, .6, lw=5)
tag('посёлок', 7540, IB - 240, L(501.4), size=48, rot=1.5)
VX, VY = 7380, IB - 150                                          # the new vent next to the village (red: the break)
for i, (a, r_) in enumerate(((-110, 120), (-80, 150), (-50, 120), (-135, 90), (-25, 95))):
    line([[VX + 30 * math.cos(math.radians(a)), VY + 30 * math.sin(math.radians(a))], [VX + r_ * math.cos(math.radians(a)), VY + r_ * math.sin(math.radians(a))]], L(502.6) + i * .1, .2, 'red', 7, quiet=(i > 0))
write('извержение', 7150, IB - 360, L(503.1), .8, 'red', 58, align='right')
count('все {0} человека', [264], 6350, 1340, L(504.6), 1.6, size=78)
NGP = (7880, 1350)                                              # boats → Nightingale
line([[7560, IB + 40], [7700, 1270], [NGP[0] - 30, NGP[1] - 30]], L(506.3), .9, 'graphite', 5, dash=[16, 12], arrow=True)
boat(7640, 1205, L(506.5), .8); boat(7730, 1275, L(506.8), .8)
write('на лодках', 7420, 1290, L(506.4), .7, 'graphite', 52, align='right')
tag('остров Соловей', NGP[0], NGP[1], L(507.9), size=52, rot=-1)
write('утром', 6350, 1560, L(509.0), .5, 'graphite', 62)
ship(6800, 1600, L(509.4), .6, s=.9)
tag('голландский корабль', 6950, 1530, L(510.0), size=50, rot=1)
KG = .55; GO = (8800, 900)                                       # Great Britain, equal-area, 0.55 px per km
gx = [p[0] for r in GB_RINGS for p in r]; gy = [p[1] for r in GB_RINGS for p in r]
GOO = [GO[0] - KG * (min(gx) + max(gx)) / 2, GO[1] - KG * (min(gy) + max(gy)) / 2]
tt = L(511.8)
for r in GB_RINGS:
    if len(r) < 4: continue
    ln = sum(math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]) for i in range(1, len(r)))
    dd = max(.08, 1.3 * ln / 3000)
    line([[GOO[0] + KG * x, GOO[1] + KG * y] for x, y in r], tt, dd, 'graphite', 6, fill='grey', fillA=.12, quiet=True); tt += dd * .6
ev(L(511.8), 'stroke', 1.3)
CS = [GOO[0] + KG * CALSHOT[0], GOO[1] + KG * CALSHOT[1]]
tag('Англия', 8420, 470, L(512.1), size=56, rot=-1.5)
line([[7500, 1640], [8000, 1640], [CS[0] - 60, CS[1] + 60]], L(512.4), 1.4, 'graphite', 6, arrow=True, dash=[18, 12])
line(circle(CS, 9, 10), L(516.6), .1, 'graphite', 14)
ink('ring', L(516.8), .5, 'red', c=CS, r=[44, 40], lw=6)
write('бывший лагерь ВВС', 8300, 1560, L(514.5), 1.4, 'graphite', 56)
tag('Кэлшот, графство Хэмпшир', 8250, 1740, L(517.1), size=50, rot=1)
scalebar(9000, 1950, KG, 500, L(513.0))

# --- p4 520.29–542.42: most came back; why: each had own reasons, we do not know them; known: an expedition early 1962
#     found the village mostly intact, only the canning factory destroyed; 1963: about 200 came back, some stayed in England
write('большинство потом вернулось', 9700, 600, L(520.3), 1.7, 'graphite', 70)
line(arc((10840, 760), 260, 120, 200, 340, 20), L(521.0), .6, 'graphite', 7, arrow=True)
write('Почему?', 9700, 900, L(522.1), .6, 'graphite', 96)
write('причины у каждого свои,', 9700, 1020, L(522.8), 1.6, 'graphite', 62)
write('и мы их не знаем', 9700, 1110, L(524.85), 1.2, 'graphite', 62)
tag('известно другое', 9740, 1270, L(526.2), size=54, rot=-1)
write('экспедиция, начало 1962:', 9700, 1430, L(526.9), 2.2, 'graphite', 62)
write('посёлок в основном уцелел', 9700, 1540, L(531.1), 1.8, 'graphite', 62)
tick(10560, 1515, L(533.0))
write('разрушена лишь консервная фабрика', 9700, 1650, L(533.7), 2.2, 'graphite', 62)
FX, FY = 11000, 1520                                             # the canning factory, crossed out (red: the break)
line(rect(FX, FY - 110, FX + 200, FY), L(535.3), .3, 'graphite', 6)
line([[FX + 140, FY - 110], [FX + 140, FY - 200], [FX + 175, FY - 200], [FX + 175, FY - 110]], L(535.55), .2, 'graphite', 6)
cross(FX + 100, FY - 60, L(535.9), 70)
write('1963:', 9700, 1830, L(536.1), .9, 'graphite', 66)
count('вернулись ≈ {0} человек', [200], 9900, 1830, L(538.6), 1.6, size=66)
write('часть осталась в Англии', 9700, 1950, L(540.8), 1.5, 'graphite', 62)

# --- p5 543.18–554.75: for us, the edge of the world; for many islanders the sea is ordinary life and the village home;
#     'remoteness' always speaks from the point of view of the one who looks
SP = (12650, 760)
printd('trsea', 'print_trsea', SP[0], SP[1], L(543.25), w=860, rot=-1.2, size='mid')
credit('cred_trsea', 'Тристан-да-Кунья с моря · фото: B. Gratwicke, CC BY 2.0', SP[0], 1110, L(543.6), 820, rot=.8, size=25)
write('для нас — край света', 12000, 1290, L(543.3), 1.3, 'graphite', 68)
write('для островитян:', 12000, 1420, L(544.75), .9, 'graphite', 62)
write('море — обычная часть жизни', 12000, 1520, L(545.8), 1.5, 'blue', 62)
write('посёлок — дом', 12000, 1620, L(547.4), 1.1, 'graphite', 62)
house(12560, 1630, L(548.5), .75)
write('«отдалённость» —', 12000, 1790, L(549.4), 1.3, 'graphite', 62)
write('с точки зрения того, кто смотрит', 12000, 1890, L(551.0), 2.4, 'red', 62)
eye((13280, 1760), L(553.4), .9)

# ===================================================================== ROW 2 · «ИТОГ»
# --- p6 557.90–573.73: which place is the farthest? where people live permanently: Tristan da Cunha; distance to any
#     land: Point Nemo; everything else depends on the definition and the map
write('Так какое место самое далёкое?', 500, 2880, L(557.95), 1.9, 'graphite', 150)
RY = {'land': 3420, 'home': 4120, 'people': 4820}               # three steel rulers
RX0, RX1, RES = 2550, 7000, 7450
def ruler_row(key, label, t):
    ruler('r_' + key, [RX0, RY[key]], [RX1, RY[key]], t)
    tag(label, 560, RY[key], t + .45, size=150, rot=(-1, 1, -.6)[list(RY).index(key)], amp=6)
ruler_row('home', 'до жилья', L(560.4))
write('где люди живут постоянно', RX0 + 120, RY['home'] + 210, L(562.4), 1.8, 'graphite', 92)
arrow([RX1 + 40, RY['home']], [RES - 40, RY['home']], L(564.3), .3, 'graphite', 9)
write('Тристан-да-Кунья', RES, RY['home'] + 70, L(564.35), 1.5, 'graphite', 200)
ruler_row('land', 'до любой суши', L(566.0))
arrow([RX1 + 40, RY['land']], [RES - 40, RY['land']], L(569.25), .3, 'graphite', 9)
write('точка Немо', RES, RY['land'] + 70, L(569.3), 1.2, 'graphite', 200)
ruler_row('people', 'до людей', L(570.6))
arrow([RX1 + 40, RY['people']], [RES - 40, RY['people']], L(571.6), .3, 'graphite', 9)
QM = write('?', RES, RY['people'] + 70, L(571.95), .3, 'graphite', 200)
write('всё остальное — от определения и от карты', 3500, 2880 + 150, L(570.7), 2.9, 'graphite', 84)

# --- p7 574.28–591.03: what is known firmly: calculations put Point Nemo farthest from land; Tristan remains the most
#     remote inhabited island; but 'the nearest people' and exact kilometres depend on the map, the date, who counts and how
stamp('ТВЁРДО', 10300, 3770, L(574.6), size=150, rot=-7)
write('дальше всех от суши', RES, RY['land'] + 200, L(575.8), 2.3, 'graphite', 92)
tick(RES + 1650, RY['land'] - 30, L(578.4), 2.0)
write('самый удалённый обитаемый остров', RES, RY['home'] + 200, L(579.0), 3.0, 'graphite', 92)
tick(RES + 1950, RY['home'] - 30, L(582.6), 2.0)
QM['erase'] = dict(t=L(583.6), d=.4)
write('«ближайшие люди», точные км —', RES, RY['people'] - 20, L(583.7), 2.4, 'graphite', 100)
write('зависят от карты, от даты', RES, RY['people'] + 110, L(586.1), 2.0, 'blue', 100)
write('и от того, кто и как считает', RES, RY['people'] + 240, L(588.2), 2.6, 'blue', 100)

# --- p8 591.73–608.66: back to the astronauts over the ocean: over Point Nemo in a few minutes, beyond the horizon;
#     on Tristan people live for years, six days' sail to the nearest mainland; the ruler counts km, not who is near
IS = (11100, 3050); HZ = (12450, 3080)
printd('iss', 'print_iss', IS[0], IS[1], L(591.85), w=1000, rot=-1.5, size='mid')
credit('cred_iss', 'МКС · фото: NASA, общественное достояние', IS[0], 3450, L(592.2), 880, rot=.6, size=26)
printd('horizon', 'print_horizon', HZ[0], HZ[1], L(594.4), w=1000, rot=1.5, size='mid')
credit('cred_hz', 'горизонт с борта МКС · NASA', HZ[0], 3470, L(594.7), 640, rot=-.8, size=26)
write('над точкой Немо —', 10750, 4030, L(594.6), 1.3, 'graphite', 80)
write('за считаные минуты', 10750, 4140, L(596.4), 1.4, 'blue', 80)
arrow([12350, 4110], [12850, 4040], L(597.6), .6, 'graphite', 7)
write('за горизонт', 12900, 4060, L(597.9), .9, 'graphite', 64, align='right', rot=0)
write('на Тристане — годами', 10750, 4320, L(598.9), 1.8, 'blue', 80)
count('до большой земли {0} суток пути', [6], 10750, 4430, L(601.3), 3.0, size=80)
write('линейка считает километры,', 500, 5300, L(604.9), 1.9, 'graphite', 150)
write('но не считает, кто рядом', 3700, 5300, L(606.85), 1.8, 'red', 150)

# --- p9 609.21–617.21: and you: is far — to land or to people? write in the comments
write('А вы как считаете:', 10750, 4800, L(609.25), 1.1, 'graphite', 96)
write('далеко — это до суши', 10750, 4930, L(610.4), 1.1, 'graphite', 96)
write('или до людей?', 10750, 5060, L(611.5), .9, 'graphite', 96)
ink('ring', L(610.9), .5, 'red', c=[1180, RY['land']], r=[760, 190], lw=8)
ink('ring', L(611.8), .5, 'red', c=[1000, RY['people']], r=[560, 190], lw=8)
write('ответ — в комментариях', 10750, 5230, L(612.6), 1.5, 'graphite', 72)

# ===================================================================== camera (one continuous camera; the card hides the jump)
c = Cam(*fit([350, 400, 2750, 1300]))
c.to(L(461.2), 6.0, z=z_of(c) * 1.03)                                      # surnames
c.fit(L(469.3), 1.2, [350, 400, 2750, 1420], b=3)                          # + potato patches
c.fit(L(471.9), 1.3, [350, 1280, 2750, 2150], b=2.8)                       # ship, garden, neighbours
c.to(L(473.3), 5.0, z=z_of(c) * 1.02)
c.fit(L(478.6), 1.4, [350, 400, 2750, 2150], b=3)                          # paragraph as a whole
c.fit(L(480.25), 1.3, [3050, 400, 5450, 1400], b=2.8)                      # Nightingale, ≈ 34 km
c.to(L(481.6), 3.4, z=z_of(c) * 1.02)
c.fit(L(485.3), 1.2, [3050, 400, 6200, 1600], b=3)                         # + Gough ≈ 350 km
c.fit(L(488.2), 1.3, [3050, 400, 6200, 2100], b=3)                         # no residents, weather station, the circle
c.to(L(489.6), 7.5, z=z_of(c) * 1.02)
c.fit(L(497.6), 1.4, [6250, 400, 8500, 1450], b=2.8)                       # 10 October 1961
c.to(L(499.1), 5.5, z=z_of(c) * 1.02)
c.fit(L(505.6), 1.3, [6250, 400, 8500, 1800], b=3)                         # boats, Nightingale, the Dutch ship
c.fit(L(511.0), 1.4, [6250, 400, 9600, 2050], b=3)                         # England, Calshot
c.to(L(512.5), 7.0, z=z_of(c) * 1.02)
c.fit(L(519.9), 1.4, [9600, 400, 11500, 1350], b=2.8)                      # most came back; why?
c.to(L(521.4), 4.2, z=z_of(c) * 1.02)
c.fit(L(526.0), 1.2, [9600, 400, 11500, 2050], b=3)                        # what is known
c.to(L(527.3), 14.5, z=z_of(c) * 1.03)
c.fit(L(542.6), 1.4, [11900, 380, 13450, 2050], b=2.8)                     # the point of view
c.to(L(544.0), 9.3, z=z_of(c) * 1.03)
c.fit(L(553.7), 2.4, [300, 300, 13450, 2200], b=3)                          # chapter pull-back: row 1
# card «ИТОГ» 556.90–557.90
c.fit(L(557.0), .6, [400, 2580, 7200, 3650])                               # (under the card) the question
c.to(L(557.9), 2.2, z=z_of(c) * 1.02)
c.fit(L(560.1), 1.3, [400, 2580, 9400, 4450], b=2.8)                       # rulers 'до жилья', 'до любой суши'
c.to(L(561.5), 8.5, z=z_of(c) * 1.02)
c.fit(L(570.2), 1.3, [400, 2580, 9400, 5050], b=3)                         # + 'до людей'
c.to(L(571.6), 2.6, z=z_of(c) * 1.01)
c.fit(L(574.3), 1.2, [400, 2580, 11050, 5100], b=3)                        # known firmly
c.to(L(575.6), 15.6, z=z_of(c) * 1.03)
c.fit(L(591.5), 1.4, [10450, 2580, 13050, 4500], b=2.8)                    # the astronauts, Tristan years
c.to(L(593.0), 11.4, z=z_of(c) * 1.03)
c.fit(L(604.5), 1.2, [400, 4300, 7600, 5450], b=3)                         # the ruler counts km
c.to(L(605.8), 3.0, z=z_of(c) * 1.02)
c.fit(L(608.9), 1.2, [400, 2580, 13050, 5450], b=3)                        # the question: land or people
c.to(L(610.2), 3.2, z=z_of(c) * 1.02)
c.fit(L(613.8), 3.4, [250, 300, 13450, 5500], b=3.2)                       # the native ending: the whole wall

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=61, texScale=.4, ghosts=220, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
print('GB box', [round(v) for v in (GOO[0] + KG * min(gx), GOO[1] + KG * min(gy), GOO[0] + KG * max(gx), GOO[1] + KG * max(gy))], 'Calshot', [round(v) for v in CS])
print('NG', [round(v) for v in NGc], 'IN', [round(v) for v in INc], 'Gough', [round(v) for v in GO2], 'ring', [round(v) for v in RC])
