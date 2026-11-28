#!/usr/bin/env python3
"""«Мысленный эксперимент» · Опасные места (deadly_places) · board film, PART 2:
chapters «НЕВИДИМЫЙ ГАЗ» (card at film 122.65) and «ВОДА» (card at film 220.97), up to film 297.50.
FILM range 122.65–297.50 s (174.85 s). The renderer works in LOCAL time:  local = film − 122.65.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/deadly_places/film.json (segs → captions).
One window is covered by another clip (3D terrain map of Lake Nyos, the gas flowing down the valleys):
film 123.65–141.11 = local 1.00–18.46. Nothing important is drawn there and no sound events are written for it;
the board quietly gets the map of Cameroon with Nyos, the date, and the lake section with the gas running down the valley,
so the wall continues the clip when it ends.
Map: Cameroon and neighbours from /tmp/world.geo.json (johan/world.geo.json, Natural Earth 1:110m, public domain), cached in
scenes/geo_cm.json; equirectangular with cos(7°) for longitude. Lake Nyos at 6.438° N, 10.298° E.
Wall (board px, before the OX shift): panels 2900 × 1250, rows y 450…1700 and 2250…3500
  ГАЗ   row 1: A map + date (cover) · B section, bottle, valley (cover) · C p2 no oxygen · D p3 the survivors' accounts
        row 2: E p4 subscribe, Nyos 1986 print · F p5 1 746, 25 km, ≈ 3 500 cattle · G p6 cause unknown, Monoun · H p6 pipes
  ВОДА  row 1: I sea print, 15 °C · J cold shock · K drowning, plunge print
        row 2: L rule 1-10-1 (and the last «one», p9) · M the hour is a guide, stopwatch · N how cold kills, life jacket
Ink: graphite = names/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 122.65, 297.50
DUR = round(R1 - R0, 3)                       # 174.85
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(123.65), L(141.11))]
BW, BH = 23900, 4000

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
FS = 1.12
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=round(size * FS), **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=round(size * FS), **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': list(a), 'to': list(b)}, lw=lw, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=20, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
OBJ = os.path.join(FILM, 'kit', 'objects')
def printd(id, src, x, y, t, w, rot=0, size='mid', z=8, mags=True, cred=None, credw=None):
    """a print centred at (x, y), w board px wide; two magnets on top; a credit card below"""
    o = json.load(open(os.path.join(OBJ, src + '.json'))); h = w * o['h'] / o['w']
    el(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, w=w, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    ev(t + .27, 'land', .2, size=size)
    if mags:
        magnet(x - w * .36, y - h / 2 + 28, t + .45); magnet(x + w * .36, y - h / 2 + 24, t + .55)
    if cred:
        credit(id + '_cred', cred, x, y + h / 2 + 62, t + .7, credw or len(cred) * 16.5 + 50)
    return h
def credit(id, text, x, y, t, w, rot=-1):
    return el(type='card', id=id, xy=[x, y], w=round(w), h=56, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=27, x=20, y=9, color='grey', pass_=True)])
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def bez(p0, p1, p2, n=28):
    return [[(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]] for u in [i / n for i in range(n + 1)]]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85, quiet=False):
    if not quiet: ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def house(x, y, t, s=1.0, color='graphite', lw=5):          # (x, y) = middle of the floor line
    line(rect(x - 26 * s, y - 34 * s, x + 26 * s, y), t, .12, color, lw, quiet=True)
    line([[x - 34 * s, y - 32 * s], [x, y - 62 * s], [x + 34 * s, y - 32 * s]], t + .1, .1, color, lw, quiet=True)
def person(c, s, t, color='graphite', lw=6, quiet=True):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .08, color, lw, quiet=quiet)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .08, .06, color, lw, quiet=True)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .12, .06, color, lw, quiet=True)
    line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .16, .05, color, lw, quiet=True)
def stopwatch(c, r, t, hand_deg=60, color='graphite', lw=8, quiet=False):
    x, y = c
    line(circle(c, r, 48), t, .6, color, lw, quiet=quiet, fill='grey', fillA=.08)
    line(rect(x - r * .14, y - r - r * .26, x + r * .14, y - r - 2), t + .5, .15, color, lw * .8, quiet=True)
    line([[x - r * .26, y - r - r * .3], [x + r * .26, y - r - r * .3]], t + .62, .1, color, lw * .8, quiet=True)
    for i in range(12):
        a = math.radians(i * 30 - 90); r0 = r * (.80 if i % 3 else .72)
        line([[x + r0 * math.cos(a), y + r0 * math.sin(a)], [x + r * .9 * math.cos(a), y + r * .9 * math.sin(a)]], t + .7 + .03 * i, .05, color, lw * .6, quiet=True)
    if hand_deg is not None:
        a = math.radians(hand_deg - 90)
        line([[x, y], [x + r * .62 * math.cos(a), y + r * .62 * math.sin(a)]], t + 1.1, .2, 'blue', lw, quiet=True)
        line(circle(c, r * .05, 10), t + 1.1, .05, color, lw, quiet=True, fill='grey', fillA=.9)
def bottle(x, y, s, t, quiet=True):                          # (x, y) = bottom centre
    P = [[x - 50 * s, y], [x - 50 * s, y - 150 * s], [x - 22 * s, y - 200 * s], [x - 20 * s, y - 250 * s], [x + 20 * s, y - 250 * s],
         [x + 22 * s, y - 200 * s], [x + 50 * s, y - 150 * s], [x + 50 * s, y], [x - 50 * s, y]]
    line(P, t, .5, 'graphite', 6, quiet=quiet, fill='grey', fillA=.10)
    line(rect(x - 24 * s, y - 275 * s, x + 24 * s, y - 250 * s), t + .5, .12, 'graphite', 6, quiet=True, fill='grey', fillA=.6)
    rnd = random.Random(7)
    for i in range(9):
        bx, by = x + (rnd.random() - .5) * 70 * s, y - 20 * s - rnd.random() * 120 * s
        line(circle((bx, by), 6 * s, 8), t + .65 + i * .05, .05, 'blue', 4, quiet=True)
def lake_blob(c, rx, ry, t, quiet=True):
    line(circle(c, [rx, ry], 24), t, .3, 'blue', 6, quiet=quiet, fill='blue', fillA=.25)

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('НЕВИДИМЫЙ ГАЗ', 122.65, hard=True)     # the part opens on black
type_card('ВОДА', 220.97)

# ===================================================================== map data (Cameroon)
GEO = os.path.join(HERE, 'geo_cm.json')
if not os.path.exists(GEO):
    W = json.load(open('/tmp/world.geo.json')); keep = {}
    for f in W['features']:
        n = f['properties']['name']
        if n in ('Cameroon', 'Nigeria', 'Chad', 'Central African Republic', 'Gabon', 'Equatorial Guinea', 'Republic of the Congo'):
            g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
            keep[n] = [p[0] for p in polys]
    json.dump(keep, open(GEO, 'w'))
GM = json.load(open(GEO))
LON0, LON1, LAT0, LAT1 = 7.0, 17.0, 1.0, 13.6
KY = 1100 / (LAT1 - LAT0); KX = KY * math.cos(math.radians(7))
MX0, MY0 = 520, 540
def P(lon, lat): return [MX0 + (lon - LON0) * KX, MY0 + (LAT1 - lat) * KY]
MX1, MY1 = P(LON1, LAT0)
def clip_ring(ring):
    """polyline pieces of a lon/lat ring inside the map window (Liang–Barsky per segment)"""
    out, cur = [], []
    for (a, b) in zip(ring[:-1], ring[1:]):
        x0, y0, x1, y1 = a[0], a[1], b[0], b[1]; u0, u1 = 0., 1.; dx, dy = x1 - x0, y1 - y0; ok = True
        for p, q in ((-dx, x0 - LON0), (dx, LON1 - x0), (-dy, y0 - LAT0), (dy, LAT1 - y0)):
            if p == 0:
                if q < 0: ok = False; break
            else:
                r = q / p
                if p < 0: u0 = max(u0, r)
                else: u1 = min(u1, r)
        if not ok or u0 > u1:
            if len(cur) > 1: out.append(cur)
            cur = []; continue
        pa = P(x0 + u0 * dx, y0 + u0 * dy); pb = P(x0 + u1 * dx, y0 + u1 * dy)
        if not cur: cur = [pa]
        elif u0 > 0: out.append(cur) if len(cur) > 1 else None; cur = [pa]
        cur.append(pb)
        if u1 < 1: out.append(cur); cur = []
    if len(cur) > 1: out.append(cur)
    return out

# ===================================================================== НЕВИДИМЫЙ ГАЗ · row 1
# --- A (cover, film 123.65–132.6): «Место второе: озеро Ньос в Камеруне. 21 августа 1986 со дна поднялось облако углекислого газа.»
line(rect(MX0, MY0, MX1, MY1), L(123.8), .6, 'graphite', 4, quiet=True)
tt = L(124.0)
for n, rings in GM.items():
    if n == 'Cameroon': continue
    for r in rings:
        for piece in clip_ring(r):
            line(piece, tt, .3, 'grey', 4, quiet=True); tt += .03
for r in GM['Cameroon']:
    line([P(*q) for q in r], L(124.3), 1.2, 'graphite', 7, quiet=True, fill='grey', fillA=.12)
write('Камерун', *P(12.6, 4.1), L(125.0), .6, 'graphite', 50, align='center', quiet=True)
NY = P(10.298, 6.438)
line(circle(NY, 11, 12), L(125.2), .1, 'blue', 12, fill='blue', fillA=.9, quiet=True)
ink('ring', L(125.3), .35, 'blue', c=NY, r=34, lw=6, quiet=True)
write('Ньос', NY[0] + 50, NY[1] + 16, L(125.5), .4, 'graphite', 46, quiet=True)
write('место второе:', 1600, 650, L(123.7), .8, 'grey', 60, quiet=True)
write('озеро Ньос', 1600, 780, L(124.2), .9, 'graphite', 96, quiet=True)
write('в Камеруне', 1600, 880, L(125.1), .8, 'graphite', 70, quiet=True)
write('21 августа 1986', 1600, 1060, L(126.2), 2.0, 'blue', 90, quiet=True)
write('со дна поднялось облако', 1600, 1250, L(130.4), 1.2, 'graphite', 66, quiet=True)
write('углекислого газа', 1600, 1340, L(131.5), 1.0, 'graphite', 66, quiet=True)

# --- B (cover, film 132.6–141.11): dissolved under pressure, like a closed bottle; heavier than air: ran down the valleys, pushed out oxygen
PROF = [[3800, 760], [3950, 800], [4060, 900], [4150, 1040], [4350, 1150], [4600, 1140], [4780, 1020], [4840, 900], [4950, 830],
        [5300, 930], [5700, 1050], [6100, 1130], [6500, 1170]]
line(PROF, L(130.0), 1.4, 'graphite', 8, quiet=True)
line([[4060, 900], [4840, 900]], L(130.9), .3, 'blue', 6, quiet=True)
water = []
for i, (x, y) in enumerate([(4200, 960), (4400, 960), (4600, 960), (4300, 1020), (4520, 1020), (4700, 1000)]):
    water.append(dict(points=[[x - 40, y], [x + 40, y]], t=round(L(131.0) + i * .05, 3), d=.08, lw=5))
strokes_el(water, L(131.0), .4, 'blue', 5, .6, quiet=True)
rnd = random.Random(3)
gas = [dict(points=[[x, y], [x + 4, y + 3]], t=round(L(132.8) + i * .06, 3), d=.05, lw=10)
       for i, (x, y) in enumerate([(4230 + rnd.random() * 500, 1070 + rnd.random() * 55) for _ in range(16)])]
strokes_el(gas, L(132.8), 1.0, 'blue', 10, .8, quiet=True)
arrow([4450, 1100], [4450, 760], L(131.0), .6, 'graphite', 6, dash=[16, 12], quiet=True)
def slope_y(x):
    for (a, b) in zip(PROF[8:-1], PROF[9:]):
        if a[0] <= x <= b[0]: return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])
    return PROF[-1][1]
rnd = random.Random(5); cloud = []
for i in range(150):
    x = 4900 + 1550 * (i / 150) + rnd.random() * 40; top = 150 - 60 * (i / 150)
    y = slope_y(x) - 14 - rnd.random() * top; b = math.radians(-25 + rnd.random() * 20)
    cloud.append(dict(points=[[round(x, 1), round(y, 1)], [round(x + 34 * math.cos(b), 1), round(y + 34 * math.sin(b), 1)]],
                      t=round(L(137.2) + 3.4 * i / 150, 3), d=.06, lw=5))
strokes_el(cloud, L(137.2), 3.4, 'grey', 5, .7, quiet=True)
line(bez([5000, 690], [5600, 720], [6300, 960]), L(138.3), 1.0, 'graphite', 6, dash=[16, 12], arrow=True, quiet=True)
write('растворён под давлением,', 3800, 1350, L(132.7), 1.6, 'graphite', 66, quiet=True)
write('как в закрытой бутылке', 3800, 1440, L(135.2), 1.4, 'graphite', 66, quiet=True)
bottle(4980, 1500, 1.0, L(135.4))
write('тяжелее воздуха —', 5350, 1330, L(137.05), 1.1, 'graphite', 66, quiet=True)
write('стёк по долинам', 5350, 1420, L(138.3), 1.2, 'graphite', 66, quiet=True)
write('и вытеснил кислород', 5350, 1510, L(139.6), 1.3, 'graphite', 66, quiet=True)

# --- C p2 141.8–151.92: people in the cloud quickly lost consciousness; too little oxygen, too much CO2; exact seconds were not measured
write('люди в облаке быстро', 7100, 610, L(141.85), 1.3, 'graphite', 70)
write('теряли сознание', 7100, 705, L(143.1), 1.0, 'graphite', 70)
line(rect(7200, 860, 7360, 1340), L(144.25), .5, 'graphite', 7)
strokes_el([dict(points=[[7212, y], [7348, y]], t=round(L(144.8) + i * .1, 3), d=.08, lw=6) for i, y in enumerate((1325, 1305, 1285))], L(144.8), .4, 'blue', 6, .8)
arrow([7430, 900], [7430, 1300], L(144.5), .6, 'blue', 7)
write('кислорода', 7280, 1440, L(144.3), .6, 'graphite', 58, align='center')
write('не хватало', 7280, 1520, L(144.9), .6, 'graphite', 58, align='center')
line(rect(7800, 860, 7960, 1340), L(145.65), .5, 'grey', 7)
strokes_el([dict(points=[[7812, y], [7948, y]], t=round(L(146.1) + i * .07, 3), d=.06, lw=6) for i, y in enumerate(range(1325, 890, -20))], L(146.1), 1.6, 'grey', 6, .8)
arrow([8040, 1300], [8040, 900], L(146.0), .6, 'blue', 7)
write('углекислого газа', 7880, 1440, L(145.65), 1.0, 'graphite', 58, align='center')
write('слишком много', 7880, 1520, L(146.7), .8, 'graphite', 58, align='center')
stopwatch((9050, 990), 170, L(148.0), hand_deg=None)
write('?', 9050, 1050, L(148.7), .4, 'blue', 140, align='center')
write('точных секунд', 9050, 1290, L(148.05), .9, 'graphite', 60, align='center')
write('не измеряли', 9050, 1370, L(148.9), .8, 'graphite', 60, align='center')
write('воздуха там просто не осталось', 7100, 1630, L(149.85), 1.9, 'graphite', 68)
line([[7100, 1665], [8290, 1660]], L(151.8), .4, 'red', 7)

# --- D p3 152.64–170.19: survivors recalled warmth and a smell like rotten eggs or gunpowder, then lost consciousness; some woke after many
#     hours, weak and confused; many in the cloud never woke; known from accounts and doctors' examinations
tag('рассказы выживших', 10430, 570, L(152.7), size=54, rot=-1.5)
write('тёплое ощущение', 10400, 810, L(153.6), 1.2, 'graphite', 66)
for i in range(3):
    xx = 11080 + i * 55
    line([[xx + 10 * math.sin(k * 1.6), 790 - k * 18] for k in range(7)], L(154.4) + .12 * i, .25, 'blue', 5, quiet=(i > 0))
write('и запах, похожий на', 10400, 930, L(155.15), 1.2, 'graphite', 66)
write('тухлые яйца или порох', 10400, 1020, L(156.4), 1.6, 'graphite', 66)
arrow([11330, 935], [11760, 935], L(157.9), .5, 'graphite', 7)
write('теряли сознание', 11820, 955, L(158.2), 1.2, 'graphite', 66)
write('некоторые приходили в себя', 10400, 1190, L(159.65), 1.4, 'graphite', 62)
write('лишь через много часов,', 10400, 1280, L(161.0), 1.3, 'blue', 62)
write('слабыми и спутанными', 10400, 1370, L(162.3), 1.4, 'graphite', 62)
line(circle((11400, 1255), 52, 30), L(161.9), .4, 'blue', 6)
line([[11400, 1255], [11400, 1218], [11400, 1255], [11428, 1272]], L(162.2), .2, 'blue', 6, quiet=True)
write('многие в облаке уже не очнулись', 10400, 1540, L(164.65), 1.8, 'graphite', 66)
tag('известно по рассказам и осмотрам врачей', 11750, 1250, L(167.05), size=50, rot=1)

# ===================================================================== НЕВИДИМЫЙ ГАЗ · row 2
# --- E p4 170.93–182.14: subscribe; then the rest about Nyos: what is known of the cause, what was done after, how many lives
write('если ты с нами —', 500, 2400, L(170.95), 1.2, 'graphite', 68)
write('подпишись', 500, 2515, L(172.0), .9, 'graphite', 92)
write('дальше места тише не станут', 500, 2625, L(173.1), 1.7, 'graphite', 60)
write('доскажем про Ньос:', 500, 2810, L(175.3), 1.2, 'graphite', 68)
for i, (txt, ft, d) in enumerate((('что известно о причине', 177.0, 1.4), ('что сделали после', 178.6, 1.1), ('сколько жизней унесло озеро', 180.4, 1.6))):
    y = 2940 + 110 * i
    line(rect(520, y - 44, 566, y + 2), L(ft) - .15, .2, 'graphite', 6, quiet=True)
    write(txt, 610, y, L(ft), d, 'graphite', 60)
printd('n86', 'print_nyos1986', 2500, 2760, L(175.4), 1100, rot=1, cred='озеро Ньос вскоре после выброса, 1986 · USGS')

# --- F p5 182.69–197.35: by researchers' estimates 1 746 people died within up to 25 km, and about 3 500 head of cattle;
#     behind the numbers are the villagers, spoken of with respect
write('по оценкам исследователей,', 3800, 2400, L(182.75), 1.5, 'graphite', 62)
CC = (4300, 2980); RR = 400
lake_blob(CC, 46, 28, L(182.9))
write('Ньос', CC[0], CC[1] + 85, L(183.2), .4, 'graphite', 44, align='center', quiet=True)
line(circle(CC, RR, 72), L(186.8), 1.4, 'blue', 5, dash=[20, 14])
EDGE = (CC[0] + RR * math.cos(math.radians(-30)), CC[1] + RR * math.sin(math.radians(-30)))
dim([CC[0] + 50, CC[1] - 29], EDGE, L(187.6), .6, lw=5)
count('до {0} км', [25], EDGE[0] + 40, EDGE[1] - 50, L(187.9), 1.0, size=50)
write('погибли', 5000, 2560, L(184.45), .7, 'graphite', 62)
count('{0}', [1746], 5000, 2745, L(184.8), 2.0, size=150, sep=True)
write('человек', 5450, 2745, L(186.5), .7, 'graphite', 70)
write('а также', 5000, 2880, L(189.06), .6, 'graphite', 58)
count('≈ {0}', [3500], 5000, 3010, L(189.6), 1.8, size=110, sep=True)
write('голов скота', 5490, 3010, L(191.5), .9, 'graphite', 62)
rnd = random.Random(17)
for i, (a, r) in enumerate(((200, .55), (250, .72), (300, .5), (20, .62), (100, .7), (140, .45), (330, .78))):
    house(CC[0] + RR * r * math.cos(math.radians(a)), CC[1] + RR * r * math.sin(math.radians(a)) + 30, L(193.4) + i * .16, .9)
write('за этими цифрами — жители деревень,', 5000, 3200, L(193.15), 2.0, 'graphite', 58)
write('и мы говорим о них с уважением', 5000, 3290, L(195.3), 1.9, 'graphite', 58)

# --- G p6a 198.05–209.89: the cause is not fully known: a landslide is suspected, but it is an assumption; two years earlier
#     a similar event at Lake Monoun, 37 died
write('причину выброса', 7100, 2400, L(198.1), 1.1, 'graphite', 70)
write('до конца не знают', 7100, 2495, L(199.3), 1.3, 'graphite', 70)
printd('pano', 'print_nyospano', 9050, 2590, L(198.4), 1250, rot=-1, cred='озеро Ньос через неделю после выброса, 1986 · USGS')
tag('оползень?', 7120, 2660, L(200.75), size=58, rot=-2)
el(type='stamp', text='ПРЕДПОЛОЖЕНИЕ', xy=[7480, 2810], size=60, rot=-4, t=L(202.45), color='graphite'); ev(L(202.45), 'stamp', .2)
write('двумя годами раньше похожее', 7100, 3010, L(204.05), 2.0, 'graphite', 62)
lake_blob((7160, 3140), 40, 22, L(206.5))
write('на озере Моной', 7240, 3160, L(206.55), 1.2, 'graphite', 62)
write('погибли', 7100, 3360, L(207.4), .6, 'graphite', 62)
count('{0} человек', [37], 7400, 3370, L(207.9), 1.4, size=90)
TL0, TL1, TLY = (8650, 9550, 3250)
line([[TL0 - 120, TLY], [TL1 + 120, TLY]], L(204.5), .6, 'graphite', 6, arrow=True)
for x, nm, tt_ in ((TL0, 'Моной', L(204.9)), (TL1, 'Ньос', L(205.2))):
    line(circle((x, TLY), 12, 12), tt_, .1, 'graphite', 12, fill='grey', fillA=.9, quiet=True)
    write(nm, x, TLY + 80, tt_ + .05, .5, 'graphite', 52, align='center', quiet=True)
dim([TL0, TLY - 70], [TL1, TLY - 70], L(205.3), .6, lw=5)
write('2 года', (TL0 + TL1) / 2, TLY - 100, L(205.6), .5, 'blue', 56, align='center')

# --- H p6b 209.89–218.65: today Nyos has degassing pipes; nobody goes into such a lake in swimming trunks; and the water people go to lightly?
write('сегодня в Ньосе стоят', 10400, 2400, L(209.95), 1.3, 'graphite', 68)
write('трубы для дегазации', 10400, 2495, L(211.2), 1.2, 'graphite', 68)
printd('vent', 'print_vent', 10950, 2990, L(210.4), 1000, rot=1.2, cred='труба дегазации выбрасывает воду с газом, 2006 · USGS')
printd('plat', 'print_platform', 12000, 2950, L(211.5), 600, rot=-1.5, cred='плот с трубой для дегазации · USGS')
write('в такое озеро', 12420, 2700, L(213.15), .9, 'graphite', 62)
write('не ходят в плавках', 12420, 2790, L(214.0), 1.3, 'graphite', 62)
write('а что про воду,', 12420, 3010, L(215.6), 1.0, 'graphite', 62)
write('к которой идут', 12420, 3100, L(216.6), .9, 'graphite', 62)
write('налегке?', 12420, 3190, L(217.55), .7, 'graphite', 62)
arrow([12440, 3270], [13060, 3270], L(218.2), .5, 'blue', 7, dash=[18, 12])

# ===================================================================== ВОДА · row 1
# --- I p7a 221.97–229.5: place three: a cold northern sea; looks harmless, but water colder than 15 °C sets off
write('место третье:', 14100, 600, L(222.0), .9, 'grey', 60)
write('холодное северное море', 14100, 715, L(223.0), 1.6, 'graphite', 82)
printd('sea', 'print_sea', 16250, 1080, L(222.4), 950, rot=1, cred='побережье Северного моря · архив, без ограничений')
write('выглядит безобидно,', 14100, 865, L(224.7), 1.3, 'graphite', 66)
TX, TY0, TY1 = 14230, 1010, 1500
line([[TX - 22, TY1], [TX - 22, TY0 + 22]] + [[TX + 22 * math.cos(math.radians(a)), TY0 + 22 - 22 * math.sin(math.radians(a))] for a in range(180, -1, -15)] + [[TX + 22, TY1]],
     L(226.15), .5, 'graphite', 6)
line(circle((TX, TY1 + 34), 42, 24), L(226.6), .25, 'graphite', 6, quiet=True, fill='blue', fillA=.6)
line([[TX, TY1 + 10], [TX, 1300]], L(226.8), .3, 'blue', 14, quiet=True)
for i, y in enumerate(range(1060, 1480, 60)):
    line([[TX + 22, y], [TX + 40, y]], L(226.7) + .03 * i, .04, 'graphite', 4, quiet=True)
line([[TX - 60, 1250], [TX + 70, 1250]], L(227.5), .3, 'blue', 6, dash=[10, 8])
write('вода холоднее', 14400, 1140, L(226.2), 1.2, 'graphite', 66)
count('{0} °C', [15], 14400, 1305, L(227.4), 1.3, size=120)
write('запускает →', 14400, 1450, L(228.85), .9, 'graphite', 66)

# --- J p7b 228.85–239.1: cold shock: involuntary gasps that cannot be held back, in the first two to three minutes; breath-holding only seconds
write('холодовой шок:', 17400, 640, L(229.5), 1.1, 'graphite', 96)
write('непроизвольные вдохи,', 17400, 810, L(230.67), 1.3, 'graphite', 64)
write('которые не удержать', 17400, 900, L(232.26), 1.3, 'graphite', 64)
GC = (19250, 820)
for i, (dx, dy) in enumerate(((560, -160), (620, -40), (600, 80), (540, 190))):
    line(bez([GC[0] + dx, GC[1] + dy], [GC[0] + dx * .55, GC[1] + dy * .2], [GC[0] + 30, GC[1] + dy * .12]), L(230.9) + .45 * i, .35, 'blue', 6, arrow=True, quiet=(i > 0))
write('вдох', GC[0] + 5, GC[1] + 22, L(230.9), .4, 'blue', 56, align='right')
count('в первые {0}–{1} минуты', [2, 3], 17400, 1060, L(233.78), 1.5, size=70)
line([[17400, 1110], [18900, 1110]], L(234.4), .9, 'blue', 8)
for x in (17400, 18900): line([[x, 1085], [x, 1135]], L(234.4), .1, 'blue', 6, quiet=True)
write('задерживать дыхание удаётся', 17400, 1300, L(235.6), 1.6, 'graphite', 62)
write('лишь на секунды', 17400, 1390, L(237.4), 1.2, 'graphite', 62)
line([[17400, 1460], [17460, 1460]], L(238.4), .2, 'blue', 8)
for x in (17400, 17460): line([[x, 1435], [x, 1485]], L(238.4), .1, 'blue', 6, quiet=True)
write('секунды', 17510, 1478, L(238.5), .5, 'blue', 46)

# --- K p8a 239.86–244.77: with this reaction it is easy to swallow water and drown, even for a good swimmer
printd('plunge', 'print_plunge', 21150, 1030, L(239.95), 1000, rot=-1, cred='учения в Норвегии, 2022 · Корпус морской пехоты США')
write('при такой реакции', 21850, 760, L(239.9), 1.2, 'graphite', 64)
write('легко глотнуть воды', 21850, 850, L(240.9), 1.5, 'graphite', 64)
write('и утонуть —', 21850, 990, L(242.5), .8, 'graphite', 70)
write('даже хорошему пловцу', 21850, 1080, L(243.3), 1.4, 'graphite', 70)
line([[21850 + i * 1300 / 24, 1210 + 14 * math.sin(i * math.pi / 3)] for i in range(25)], L(242.6), .8, 'blue', 6)

# ===================================================================== ВОДА · row 2
# --- L p8b 244.77–257.34 + p9a 257.89–264.93: Giesbrecht's rule «one, ten, one»: a minute to get the breath under control, about ten
#     minutes while the hands obey; a guide, no guarantees. The last «one»: about an hour to unconsciousness from hypothermia, if one stays in the water
tag('правило Гисбрехта', 14120, 2370, L(244.8), size=58, rot=-1.5)
CX = [14480, 15450, 16420]
for i, (n, ft) in enumerate((('1', 246.64), ('10', 247.2), ('1', 247.75))):
    write(n, CX[i], 2650, L(ft), .4, 'blue', 170, align='center')
line([[14610, 2580], [15270, 2580]], L(246.9), .3, 'graphite', 6, quiet=True)
line([[15640, 2580], [16290, 2580]], L(247.5), .3, 'graphite', 6, quiet=True)
for i, (txt, ft, d) in enumerate((('минута, чтобы', 248.34, 1.0), ('взять дыхание', 249.3, .9), ('под контроль', 250.3, .7))):
    write(txt, CX[0], 2800 + 80 * i, L(ft), d, 'graphite', 52, align='center')
for i, (txt, ft, d) in enumerate((('около 10 минут,', 251.4, 1.2), ('пока руки', 253.37, .6), ('слушаются', 254.1, .7))):
    write(txt, CX[1], 2800 + 80 * i, L(ft), d, 'blue' if i == 0 else 'graphite', 52, align='center')
el(type='stamp', text='ОРИЕНТИР', xy=[14560, 3290], size=66, rot=-4, t=L(255.0), color='graphite'); ev(L(255.0), 'stamp', .2)
write('гарантий он не даёт', 14960, 3315, L(255.8), 1.4, 'graphite', 60)
ink('ring', L(257.9), .5, 'blue', c=[CX[2], 2585], r=[95, 118], lw=7)
for i, (txt, ft, d, col) in enumerate((('примерно час', 259.44, 1.0, 'blue'), ('до потери сознания', 260.5, 1.3, 'graphite'),
                                       ('от переохлаждения,', 262.07, 1.3, 'graphite'), ('если остаться в воде', 263.3, 1.4, 'graphite'))):
    write(txt, CX[2], 2800 + 80 * i, L(ft), d, col, 52, align='center')

# --- M p9b 264.93–276.49: the hour is a guide too: much depends on the temperature, the clothes and the person; a stopwatch in such water
#     shows minutes, and those minutes decide everything else
write('час — тоже ориентир:', 17400, 2400, L(264.95), 1.5, 'graphite', 68)
write('многое зависит от', 17400, 2510, L(266.71), 1.1, 'graphite', 62)
tag('температуры', 17440, 2650, L(268.0), size=52, rot=-1)
tag('одежды', 18150, 2655, L(269.3), size=52, rot=1)
tag('самого человека', 18700, 2650, L(270.2), size=52, rot=-1)
stopwatch((17790, 3130), 200, L(271.2), hand_deg=72)
write('секундомер в такой воде', 18200, 2990, L(271.25), 1.5, 'graphite', 60)
write('показывает минуты,', 18200, 3080, L(272.9), 1.0, 'blue', 60)
write('и эти минуты решают', 18200, 3210, L(273.65), 1.6, 'red', 64)
write('всё остальное', 18200, 3300, L(275.5), .9, 'red', 64)

# --- N p10 277.22–296.82: cold does not kill instantly: the body loses heat faster than it makes it, then the muscles weaken, then thinking
#     gets confused; it seems there is time, but the most useful minutes go; warm clothes and a life jacket slow this countdown
write('холод убивает не мгновенно:', 20700, 2400, L(277.25), 1.8, 'graphite', 68)
write('тело теряет тепло быстрее,', 20760, 2560, L(279.17), 1.7, 'graphite', 58)
write('чем вырабатывает', 20760, 2640, L(281.05), 1.1, 'graphite', 58)
PB = (22050, 2700)
person(PB, 1.5, L(279.3), quiet=False)
for i, (a, l) in enumerate(((-150, 120), (-90, 120), (-30, 120), (180, 120), (0, 120))):
    q0 = (PB[0] + 45 * math.cos(math.radians(a)), PB[1] - 50 + 45 * math.sin(math.radians(a)))
    q1 = (PB[0] + (45 + l) * math.cos(math.radians(a)), PB[1] - 50 + (45 + l) * math.sin(math.radians(a)))
    arrow(q0, q1, L(280.0) + .15 * i, .3, 'blue', 5, quiet=(i > 0))
arrow([PB[0] - 20, PB[1] + 120], [PB[0] - 20, PB[1] + 40], L(281.3), .3, 'blue', 3, quiet=True)
write('потом слабеют мышцы', 20760, 2790, L(282.28), 1.3, 'graphite', 58)
write('потом путается мысль', 20760, 2880, L(283.72), 1.3, 'graphite', 58)
for y in (2700, 2840):
    arrow([20720, y - 30], [20720, y + 20], L(282.0) if y == 2700 else L(283.5), .2, 'graphite', 5, quiet=True)
write('человеку кажется, что время есть,', 20760, 3040, L(285.24), 2.0, 'grey', 58)
write('а на деле уходят', 20760, 3130, L(287.3), 1.1, 'graphite', 58)
write('самые полезные минуты', 20760, 3220, L(288.6), 1.6, 'blue', 58)
printd('jacket', 'print_jacket', 22950, 2720, L(290.95), 950, rot=1, cred='спасательные жилеты · фото: Dietmar Rabich, CC BY-SA 4.0')
write('тёплая одежда и жилет', 22480, 3160, L(291.1), 1.3, 'graphite', 60)
write('этот отсчёт замедляют', 22480, 3250, L(292.5), 1.3, 'graphite', 60)

# ===================================================================== camera (one continuous camera; the cards hide the jumps)
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90
def fit(box, zmax=9):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z
class Cam:
    def __init__(s, x, y, z):
        s.base = dict(x=x, y=y, z=z, roll=0); s.cur = dict(x=x, y=y, lz=math.log(z), roll=0); s.moves = []; s.shakes = []
    def to(s, t, d, x=None, y=None, z=None, a=2, b=2.6, quiet=False):
        m = dict(t=round(t, 3), d=round(d, 3), a=a, b=b)
        if x is not None: m['dx'] = round(x - s.cur['x'], 2); s.cur['x'] = x
        if y is not None: m['dy'] = round(y - s.cur['y'], 2); s.cur['y'] = y
        if z is not None: m['dl'] = math.log(z) - s.cur['lz']; s.cur['lz'] = math.log(z)
        s.moves.append(m)
        if not quiet and d > .6 and (abs(m.get('dx', 0)) * z_of(s) > 500 or abs(m.get('dl', 0)) > .5): ev(t, 'whoosh', d)
        return t + d
    def fit(s, t, d, box, zmax=9, a=2, b=2.6, quiet=False):
        x, y, z = fit(box, zmax); return s.to(t, d, x, y, z, a=a, b=b, quiet=quiet)
    def drift(s, t, d, k=1.03): return s.to(t, d, z=z_of(s) * k)
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
def panel(x0, y0): return [x0, y0, x0 + 2900, y0 + 1250]
R1Y, R2Y = 450, 2250
A, B, C, D = (panel(x, R1Y) for x in (400, 3700, 7000, 10300))
EE, F, G, H = (panel(x, R2Y) for x in (400, 3700, 7000, 10300))
I, J, K = (panel(x, R1Y) for x in (14000, 17300, 20600))
LL, M, N = (panel(x, R2Y) for x in (14000, 17300, 20600))
CH1 = [330, 400, 13270, 3560]; CH2 = [13930, 400, 23570, 3560]

c = Cam(*fit(A))
c.drift(L(123.7), 8.4)                                        # (under the clip) the map, the date
c.fit(L(132.3), 1.6, B, quiet=True)                           # (under the clip) the section, the bottle, the valley
c.drift(L(134.0), 7.0)
c.fit(L(141.45), 1.3, C)                                      # p2 no oxygen, no measured seconds
c.drift(L(142.8), 9.2)
c.fit(L(152.25), 1.3, D)                                      # p3 the survivors' accounts
c.drift(L(153.6), 16.6)
c.fit(L(170.45), 1.6, EE)                                     # p4 subscribe, the questions, the 1986 print
c.drift(L(172.1), 10.0)
c.fit(L(182.3), 1.3, F)                                       # p5 1 746, 25 km, cattle, villages
c.drift(L(183.7), 13.8)
c.fit(L(197.7), 1.3, G)                                       # p6 cause unknown, Monoun
c.drift(L(199.1), 10.2)
c.fit(L(209.5), 1.3, H)                                       # p6 pipes; the bridge to water
c.drift(L(210.9), 7.6)
c.fit(L(218.7), 2.1, CH1, b=3)                                # chapter pull-back
c.fit(L(221.06), .8, I, quiet=True)                           # (under the «ВОДА» card)
c.drift(L(222.0), 6.9)
c.fit(L(229.0), 1.1, J)                                       # cold shock
c.drift(L(230.2), 9.0)
c.fit(L(239.45), 1.3, K)                                      # drowning, the plunge print
c.drift(L(240.8), 3.6)
c.fit(L(244.45), 1.3, LL)                                     # rule 1-10-1 and the last «one»
c.drift(L(245.8), 18.7)
c.fit(L(264.6), 1.3, M)                                       # the hour is a guide, stopwatch
c.drift(L(266.0), 10.9)
c.fit(L(276.95), 1.3, N)                                      # how cold kills, the life jacket
c.drift(L(278.3), 15.4)
c.fit(L(293.85), 2.4, CH2, b=3)                               # chapter pull-back
c.drift(L(296.3), 1.2, 1.01)

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
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=67, texScale=.3, ghosts=320, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=60000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
