#!/usr/bin/env python3
"""«Мысленный эксперимент» · Как создать свою страну (create_country) · board film, PART 2:
chapter «ПЛАТФОРМА В МОРЕ» (Sealand), card at film 102.62, up to the next chapter card at film 178.76.
FILM range 102.62–178.76 s (76.14 s). The renderer works in LOCAL time:  local = film − 102.62.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/create_country/film.json (segs → captions).
One window is covered by another clip (3D map of Sealand's location): film 103.62–124.02 = local 1.00–21.40.
Nothing important happens there and no sound events are written for it; the board quietly gets an establishing panel
(Great Britain with Sealand, September 1967, Roy Bates, Roughs Tower print, about 13 km from the shore, Principality of Sealand).
Map: Great Britain / Ireland / France from /tmp/world.geo.json (johan/world.geo.json, Natural Earth 1:110m, public domain),
cached in scenes/geo_gb.json; equirectangular with cos(54.5°). Sealand at 51.895° N, 1.480° E.
Wall (board px, before the OX shift): panels 2900 × 1250 (D is wider), rows y 450…1700 and 2250…3500
  row 1: A 1967 establishing (cover) · B the court case, Chelmsford print · B2 the 3-mile decision
  row 2: C what the court did NOT decide, mercenaries, the boat · D the four ticks for Sealand, prints · E «земля ничья?» bridge
The four ticks keep the order and wording of the brief: население · территория · правительство ·
способность вступать в отношения с другими государствами. Ticks blue; the one empty box gets a red ring.
Ink: graphite = names/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 102.62, 178.76
DUR = round(R1 - R0, 3)                       # 76.14
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(103.62), L(124.02))]
BW, BH = 11000, 4500

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
def person(c, s, t, color='graphite', lw=6, quiet=True):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .08, color, lw, quiet=quiet)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .08, .06, color, lw, quiet=True)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .12, .06, color, lw, quiet=True)
    line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .16, .05, color, lw, quiet=True)
def waves(x0, x1, y, t, d, color='blue', lw=5, amp=9, per=70, quiet=True):
    n = max(8, int((x1 - x0) / per * 6))
    return line([[x0 + (x1 - x0) * i / n, y + amp * math.sin(i * 2 * math.pi / 6)] for i in range(n + 1)], t, d, color, lw, quiet=quiet)
def fort(x, y, s, t, quiet=True, lw=7):
    """the sea fort side-on: two towers standing in the water, a deck, a mast. (x, y) = middle of the waterline"""
    for dx in (-48, 48):
        line(rect(x + (dx - 34) * s, y - 190 * s, x + (dx + 34) * s, y), t, .25, 'graphite', lw, quiet=quiet, fill='grey', fillA=.35); quiet = True
    line(rect(x - 125 * s, y - 225 * s, x + 125 * s, y - 190 * s), t + .25, .2, 'graphite', lw, quiet=True, fill='grey', fillA=.5)
    line(rect(x - 70 * s, y - 262 * s, x + 50 * s, y - 225 * s), t + .4, .15, 'graphite', lw * .8, quiet=True)
    line([[x + 85 * s, y - 225 * s], [x + 85 * s, y - 330 * s]], t + .5, .12, 'graphite', lw * .7, quiet=True)
def buoy(x, y, s, t, quiet=True):
    line([[x - 30 * s, y], [x - 16 * s, y - 50 * s], [x + 16 * s, y - 50 * s], [x + 30 * s, y], [x - 30 * s, y]], t, .2, 'graphite', 6, quiet=quiet, fill='grey', fillA=.3)
    line([[x, y - 50 * s], [x, y - 95 * s]], t + .2, .08, 'graphite', 6, quiet=True)
    line(circle((x, y - 105 * s), 10 * s, 10), t + .26, .06, 'graphite', 6, quiet=True)
def boat(x, y, s, t, quiet=True):
    """a small motor boat, bow to the right. (x, y) = middle of the waterline"""
    line([[x - 110 * s, y - 40 * s], [x + 120 * s, y - 40 * s], [x + 80 * s, y], [x - 100 * s, y], [x - 110 * s, y - 40 * s]], t, .3, 'graphite', 6, quiet=quiet, fill='grey', fillA=.25)
    line([[x - 60 * s, y - 40 * s], [x - 50 * s, y - 85 * s], [x + 20 * s, y - 85 * s], [x + 45 * s, y - 40 * s]], t + .3, .2, 'graphite', 6, quiet=True)
def tick(c, t, color='blue', s=1.0):
    x, y = c
    line([[x - 26 * s, y + 2 * s], [x - 6 * s, y + 24 * s], [x + 34 * s, y - 32 * s]], t, .25, color, 11)
def checkbox(c, t, s=74):
    x, y = c
    line(rect(x - s / 2, y - s / 2, x + s / 2, y + s / 2), t, .2, 'graphite', 7, quiet=True)

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ПЛАТФОРМА В МОРЕ', 102.62, hard=True)     # the part opens on black

# ===================================================================== map data (Great Britain)
GEO = os.path.join(HERE, 'geo_gb.json')
if not os.path.exists(GEO):
    W = json.load(open('/tmp/world.geo.json')); keep = {}
    for f in W['features']:
        n = f['properties']['name']
        if n in ('United Kingdom', 'Ireland', 'France', 'Belgium', 'Netherlands'):
            g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
            keep[n] = [p[0] for p in polys]
    json.dump(keep, open(GEO, 'w'))
GM = json.load(open(GEO))
LON0, LON1, LAT0, LAT1 = -8.8, 3.2, 49.7, 58.9
KY = 1050 / (LAT1 - LAT0); KX = KY * math.cos(math.radians(54.5))
MX0, MY0 = 480, 560
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

# ===================================================================== row 1
# --- A (cover, film 103.62–124.02): «В сентябре 1967 британец Рой Бейтс занял заброшенный морской форт Рафс-Тауэр в Северном море,
#     примерно в 13 км от берега. Его построили в войну и бросили. Бейтс объявил форт княжеством Силенд.»
line(rect(MX0, MY0, MX1, MY1), L(103.8), .6, 'graphite', 4, quiet=True)
tt = L(104.0)
for n, rings in GM.items():
    if n == 'United Kingdom': continue
    for r in rings:
        for piece in clip_ring(r):
            line(piece, tt, .3, 'grey', 4, quiet=True); tt += .03
for r in GM['United Kingdom']:
    for piece in clip_ring(r):
        line(piece, L(104.4), 1.4, 'graphite', 7, quiet=True, fill='grey', fillA=.12)
write('Северное', *P(1.2, 57.0), L(105.6), .5, 'grey', 40, align='center', quiet=True)
write('море', *P(1.2, 56.55), L(105.9), .3, 'grey', 40, align='center', quiet=True)
SL = P(1.480, 51.895)
line(circle(SL, 11, 12), L(106.0), .1, 'blue', 12, fill='blue', fillA=.9, quiet=True)
ink('ring', L(106.1), .35, 'blue', c=SL, r=34, lw=6, quiet=True)
write('Силенд', SL[0] - 20, SL[1] - 52, L(122.2), .5, 'graphite', 40, align='right', quiet=True)
write('в сентябре', 1450, 650, L(108.2), .7, 'graphite', 64, quiet=True)
count('{0}', [1967], 1450, 790, L(108.9), 2.0, size=120, quiet=True)
write('британец Рой Бейтс', 1450, 930, L(111.6), 1.2, 'graphite', 64, quiet=True)
write('занял морской форт', 1450, 1020, L(112.9), 1.0, 'graphite', 64, quiet=True)
write('Рафс-Тауэр', 1450, 1130, L(114.2), .9, 'graphite', 84, quiet=True)
# shore … fort, about 13 km
SHX, FTX, WY = 1500, 2150, 1400
line([[SHX - 40, 1290], [SHX - 10, 1330], [SHX, 1370], [SHX + 10, WY]], L(116.6), .3, 'graphite', 7, quiet=True)
strokes_el([dict(points=[[SHX - 70 + 22 * i, WY], [SHX - 40 + 22 * i, 1330 + 10 * i]], t=round(L(116.8) + .04 * i, 3), d=.05, lw=4) for i in range(3)],
           L(116.8), .2, 'graphite', 4, .6, quiet=True)
waves(SHX + 20, FTX + 150, WY + 8, L(116.9), .6)
fort(FTX, WY, .55, L(117.0))
dim([SHX + 20, WY - 80], [FTX - 80, WY - 80], L(117.8), .6, lw=5, quiet=True)
write('примерно 13 км', (SHX + FTX) / 2 - 30, WY - 110, L(118.0), .9, 'blue', 46, align='center', quiet=True)
write('построили в войну и бросили', 1450, 1530, L(119.2), 1.6, 'grey', 54, quiet=True)
printd('tower', 'print_tower', 2770, 900, L(114.5), 880, rot=1, cred='Рафс-Тауэр (Силенд) · фото: David P Howard, CC BY-SA 2.0')
tag('княжество Силенд', 1480, 1640, L(121.8), size=56, rot=-1.5)

# --- B p6a 124.57–132.05: a year later it came to court; Bates's son fired towards workers at a nearby buoy; heard in Chelmsford
write('через год дело дошло до суда', 3800, 610, L(124.6), 1.9, 'graphite', 74)
BWY = 1180
waves(3820, 5150, BWY + 8, L(126.75), .6, quiet=False)
fort(4950, BWY, .7, L(126.8))
write('сын Бейтса', 4950, BWY - 280, L(127.0), .7, 'graphite', 46, align='center')
buoy(4060, BWY, 1.0, L(128.3))
person((4150, BWY - 10), .9, L(128.5)); person((3990, BWY - 10), .9, L(128.6))
line(bez([4820, BWY - 150], [4500, BWY - 230], [4220, BWY - 110]), L(127.6), .7, 'graphite', 6, dash=[16, 12], arrow=True)
write('стрелял в сторону рабочих', 3800, 1340, L(127.6), 1.6, 'graphite', 62)
write('у соседнего буя', 3800, 1430, L(129.3), .9, 'graphite', 62)
write('это разбирали в Челмсфорде', 3800, 1590, L(130.0), 1.6, 'graphite', 66)
printd('hall', 'print_hall', 5980, 960, L(130.4), 980, rot=-1, cred='Шир-холл в Челмсфорде, современное фото · фото: Stuart Axe, CC BY-SA 4.0')

# --- B2 p6b 132.05–141.71: the court decided: the platform is outside British territorial waters, counted then by three miles;
#     so it has no right to judge here
write('суд решил:', 7100, 620, L(132.1), .8, 'graphite', 84)
CX0, CL3, CFT, CWY = 7350, 8180, 9350, 1290        # coast, 3-mile line, fort, waterline (13 km ≈ 2000 px; 3 miles ≈ 5.6 km)
line([[CX0 - 60, 760], [CX0 - 20, 880], [CX0 + 10, 1000], [CX0 - 10, 1120], [CX0, CWY + 10]], L(132.2), .5, 'graphite', 8)
strokes_el([dict(points=[[7110 + 40 * i, CWY], [7160 + 40 * i, 780 + 25 * (i % 3)]], t=round(L(132.3) + .03 * i, 3), d=.05, lw=4) for i in range(6)],
           L(132.3), .3, 'graphite', 4, .5, quiet=True)
write('берег', 7230, 740, L(132.5), .4, 'grey', 42, align='center', quiet=True)
waves(CX0 + 20, 9700, CWY + 8, L(132.6), .7)
fort(CFT, CWY, .65, L(133.0), quiet=False)
write('платформа', CFT, CWY - 260, L(133.3), .6, 'graphite', 50, align='center')
strokes_el([dict(points=[[CX0 + 40 + 60 * i, 1040], [CX0 + 10 + 60 * i, 1100]], t=round(L(134.6) + .03 * i, 3), d=.04, lw=4) for i in range(13)],
           L(134.6), .5, 'blue', 4, .35)
write('британские', (CX0 + CL3) / 2, 860, L(134.6), .8, 'graphite', 50, align='center')
write('территориальные воды', (CX0 + CL3) / 2, 930, L(135.3), 1.4, 'graphite', 44, align='center')
line([[CL3, 760], [CL3, CWY + 20]], L(137.0), .5, 'blue', 7, dash=[18, 12])
dim([CX0 + 10, 1190], [CL3, 1190], L(137.4), .6, lw=5)
count('{0} мили', [3], (CX0 + CL3) / 2 - 70, 1165, L(137.6), 1.0, size=58)
write('так считали тогда', CL3 + 40, 800, L(138.3), 1.1, 'grey', 42)
arrow([CL3 + 60, 1100], [CFT - 130, 1100], L(133.6), .5, 'graphite', 6)
write('платформа за пределами', 7100, 1440, L(133.0), 1.5, 'graphite', 64)
write('британских территориальных вод', 7100, 1530, L(134.6), 2.2, 'graphite', 64)
write('значит, судить здесь он не вправе', 7100, 1660, L(139.55), 1.9, 'red', 70)

# ===================================================================== row 2
# --- C p7 142.26–158.59: Sealand still shows the ruling as recognition; but the court only answered about its own powers, whether
#     there is a country there it did not decide; then mercenaries and a German diplomat landed; subscribe, don't lose the boat
write('Силенд до сих пор показывает', 500, 2400, L(142.3), 1.8, 'graphite', 66)
write('это решение как', 500, 2490, L(144.3), .9, 'graphite', 66)
tag('признание', 1290, 2470, L(144.9), size=56, rot=-2, strike=dict(t=round(L(145.7), 3), d=.35, color='red'))
ev(L(145.7), 'stroke', .35, color='red')
line(rect(500, 2620, 1550, 2900), L(145.7), .6, 'graphite', 6)
write('суд ответил лишь', 1025, 2700, L(145.8), 1.0, 'graphite', 56, align='center')
write('на вопрос', 1025, 2780, L(146.8), .5, 'graphite', 56, align='center')
write('о своих полномочиях', 1025, 2860, L(147.4), 1.0, 'graphite', 56, align='center')
line(rect(1750, 2620, 2800, 2900), L(148.2), .6, 'graphite', 6, dash=[18, 12])
write('есть ли там', 2275, 2720, L(148.3), .9, 'graphite', 60, align='center')
write('страна?', 2275, 2830, L(149.4), .7, 'graphite', 72, align='center')
write('не решал', 2275, 3010, L(150.55), .7, 'red', 84, align='center')
line([[2050, 3035], [2500, 3030]], L(151.0), .3, 'red', 7, quiet=True)
write('дальше на платформу высадились', 500, 3100, L(151.2), 2.0, 'graphite', 62)
tag('наёмники', 540, 3230, L(153.4), size=52, rot=-1.5)
tag('немецкий дипломат', 1050, 3236, L(154.3), size=52, rot=1)
FW2 = 3380
waves(1850, 3200, FW2 + 8, L(152.6), .6)
fort(3000, FW2, .6, L(152.7), quiet=False)
boat(2250, FW2, .9, L(155.5), quiet=False)
line([[2120, FW2 + 30], [1900, FW2 + 40]], L(155.9), .3, 'blue', 5, dash=[14, 10], quiet=True)
line([[2140, FW2 + 50], [1960, FW2 + 70]], L(156.0), .3, 'blue', 5, dash=[14, 10], quiet=True)
write('катер', 2250, FW2 - 120, L(156.4), .5, 'graphite', 46, align='center')
write('подпишись, чтобы не потерять', 500, 3400, L(155.5), 1.6, 'graphite', 58)
write('катер из виду', 500, 3480, L(157.2), .9, 'graphite', 58)

# --- D p8 159.13–176.61: checking the ticks: territory — the platform; government — the Bates family; residents — by recent
#     years' data one permanent; one box is empty; which one we check on others; e.g. the one who decided the land was nobody's
write('проверяем по галочкам', 3800, 2400, L(159.15), 1.5, 'graphite', 76)
ROWS = [2590, 2770, 2950, 3130]
ITEMS = ['население', 'территория', 'правительство', 'способность вступать в отношения']
BX = 3850
for i, (y, txt) in enumerate(zip(ROWS, ITEMS)):
    checkbox((BX, y - 28), L(159.5) + .2 * i)
    write(txt, BX + 75, y, L(159.55) + .2 * i, .45, 'graphite', 70, quiet=(i > 0))
write('с другими государствами', BX + 75, ROWS[3] + 85, L(160.4), .4, 'graphite', 70, quiet=True)
AX = 4800
tick((BX, ROWS[1] - 28), L(160.85))                              # территория
printd('aerial', 'print_aerial', 7150, 2600, L(161.1), 760, rot=1.2, cred='Силенд с вертолёта · фото: Ryan Lackey, CC BY 2.0')
write('платформа есть', AX, ROWS[1], L(161.6), 1.0, 'blue', 62)
tick((BX, ROWS[2] - 28), L(163.0))                               # правительство
write('есть, семья Бейтсов', AX, ROWS[2], L(163.4), 1.6, 'blue', 62)
printd('bates', 'print_bates', 6250, 2620, L(164.2), 560, rot=-1.5, cred='Рой и Джоан Бейтс, 1978 · общественное достояние')
write('по данным последних лет —', AX, ROWS[0] - 40, L(165.75), 1.5, 'grey', 46)
count('{0} постоянный', [1], AX, ROWS[0] + 40, L(168.3), 1.0, size=66)
tick((BX, ROWS[0] - 28), L(168.9))                               # население
ink('ring', L(169.6), .5, 'red', c=[BX, ROWS[3] - 28], r=[78, 72], lw=7)
write('одна галочка пуста.', 3800, ROWS[3] + 210, L(169.65), 1.1, 'red', 62)
write('?', BX, ROWS[3] - 2, L(170.8), .3, 'graphite', 70, align='center')
write('какая — проверим на других', 4520, ROWS[3] + 210, L(170.85), 1.9, 'graphite', 62)
# --- the bridge to the next chapter (still in D's frame)
write('например, на том, кто решил, что земля ничья', 3800, ROWS[3] + 320, L(173.7), 2.7, 'graphite', 62)
arrow([5380, ROWS[3] + 300], [6700, ROWS[3] + 300], L(176.3), .4, 'blue', 7, dash=[18, 12])

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
def panel(x0, y0, w=2900): return [x0, y0, x0 + w, y0 + 1250]
R1Y, R2Y = 450, 2250
A, B, B2 = (panel(x, R1Y) for x in (400, 3700, 7000))
C = panel(400, R2Y); D = panel(3700, R2Y, 3800); EB = [5300, R2Y, 9100, R2Y + 1250]
CH = [330, 400, 9970, 3560]

c = Cam(*fit(A))
c.drift(L(103.7), 20.2)                                       # (under the clip) map, 1967, the fort, 13 km
c.fit(L(124.05), 1.2, B)                                      # p6 the court, the buoy, Chelmsford
c.drift(L(125.3), 6.5)
c.fit(L(131.85), 1.2, B2)                                     # the 3-mile decision
c.drift(L(133.1), 8.5)
c.fit(L(141.7), 1.5, C)                                       # p7 what the court did not decide, the boat
c.drift(L(143.3), 15.1)
c.fit(L(158.55), 1.3, D)                                      # p8 the four ticks
c.drift(L(159.9), 16.7)
c.fit(L(176.65), 2.0, CH, b=3)                                # chapter pull-back
c.drift(L(178.65), .11, 1.003)

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
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=71, texScale=.3, ghosts=180, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=60000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
