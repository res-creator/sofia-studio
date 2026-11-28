#!/usr/bin/env python3
"""«Мысленный эксперимент» · Опасные места · board film, PART 1: cold open «ХОЛОДНЫЙ СТАРТ» + chapter «ВЫСОТА».
FILM range 0.00–122.65 s (122.65 s). The renderer works in LOCAL time:  local = film − 0.00 (offset 0, so local = film).
All times below are written as L(<film seconds>) so they can be checked against ru_geo/deadly_places/film.json (segs → captions).
One window is covered by another clip (3D terrain map of Everest): film 47.37–55.72 = local 47.37–55.72. Nothing important
is drawn there and no sound events are written for it; the board quietly gets the Everest print, the profile (≈ 9 km) and the
pressure bars (≈ a third), so the wall matches what the voice said under the clip when it ends.
Wall (board px):
  row 1  (y  450…1980)  cold open: p0 stopwatch 15–30 s, the plane at almost 11 km, seven places · p1 no honest ranking,
                        every place its own scale, the most insidious one ahead, protection, «разбор»
  row 2  (y 2600…3980)  ВЫСОТА: p2 Everest print + profile + pressure (under the clip), lifted instantly → 1…several minutes
                        · p3 tables are averages, the brain goes first, trust the watch
  row 3  (y 4480…5960)  p4 climbers print, weeks, more red blood cells, the death zone, > 300 died, the stopwatch paused
                        · p5 Hillary and Tenzing 1953 with oxygen, acclimatisation has a limit
Ink: graphite = names/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
The stopwatch is drawn in marker; its hand is a line that turns about the centre (kit ink moves with dr), one tick per second.
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 0.0, 122.65
DUR = round(R1 - R0, 3)
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(47.37), L(55.72))]
BW, BH = 11000, 6400

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def P2(pts): return [[round(x, 1), round(y, 1)] for x, y in pts]
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=P2(pts), lw=lw, **k)
FS = 1.12
def write(text, x, y, t, d=None, color='graphite', size=72, **k):
    if d is None: d = max(.5, .055 * len(text))
    return ink('write', t, d, color, text=text, xy=[x, y], size=round(size * FS), **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=round(size * FS), **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': list(a), 'to': list(b)}, lw=lw, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8, quiet=False):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    if not quiet: ev(t + .27, 'land', .2, size=size)
    return el(**k)
def credit(id, text, x, y, t, w, rot=-1):
    return el(type='card', id=id, xy=[x, y], w=w, h=56, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=27, x=20, y=9, color='grey', pass_=True)])
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def bez(p0, p1, p2, n=28):
    return [[(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]] for u in [i / n for i in range(n + 1)]]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85, quiet=False):
    if not quiet: ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def person(c, s, t, color='graphite', lw=6, quiet=True, tank=False):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .08, color, lw, quiet=quiet)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .08, .06, color, lw, quiet=True)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .12, .06, color, lw, quiet=True)
    line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .16, .05, color, lw, quiet=True)
    if tank:   # an oxygen cylinder on the back and the hose to the face
        line(rect(x - 17 * s, y - 50 * s, x - 7 * s, y - 24 * s), t + .25, .12, color, lw * .8, quiet=True, fill='grey', fillA=.35)
        line(bez([x - 12 * s, y - 50 * s], [x - 6 * s, y - 70 * s], [x + 8 * s, y - 60 * s], 10), t + .4, .12, color, lw * .6, quiet=True)

# ===================================================================== the stopwatch (marker)
def stopwatch(c, r, t, color='graphite', lw=9, dial=True, quiet=False):
    x, y = c
    line(circle(c, r, 64), t, .6, color, lw, fill='grey', fillA=.07, quiet=quiet)
    line(rect(x - .13 * r, y - r - .22 * r, x + .13 * r, y - r - .06 * r), t + .5, .15, color, lw * .9, quiet=True, fill='grey', fillA=.3)
    line([[x, y - r - .06 * r], [x, y - r]], t + .6, .05, color, lw * .9, quiet=True)
    a = math.radians(-45)
    line([[x + r * 1.0 * math.cos(a), y + r * 1.0 * math.sin(a)], [x + r * 1.13 * math.cos(a), y + r * 1.13 * math.sin(a)]], t + .62, .08, color, lw * 1.4, quiet=True)
    if dial:
        for i in range(12):
            b = math.radians(-90 + 30 * i); r0 = .80 if i % 3 else .74
            line([[x + r * r0 * math.cos(b), y + r * r0 * math.sin(b)], [x + r * .9 * math.cos(b), y + r * .9 * math.sin(b)]], t + .7 + .025 * i, .05,
                 'grey', lw * .6, quiet=True)
    line(circle(c, r * .05, 10), t + .9, .05, color, lw, quiet=True, fill=color, fillA=.9)
def hand(c, r, t, ticks=(), color='blue', lw=8, sweep=None):
    """the hand, drawn at t pointing to 0; ticks = times of one-second steps (6° each); sweep = [(t, d, deg)] for faster turns"""
    tip = [c[0], c[1] - r * .78]
    mv = [dict(t=round(tt, 3), d=.12, dr=6, a=2, b=3) for tt in ticks] + [dict(t=round(tt, 3), d=dd, dr=deg, a=2, b=2.4) for tt, dd, deg in (sweep or [])]
    return line([c, tip], t, .2, color, lw, quiet=True, moves=sorted(mv, key=lambda m: m['t']), pivot=[round(c[0], 1), round(c[1], 1)])
def secs(t0, t1): return [t0 + i for i in range(int(t1 - t0) + 1)]

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ХОЛОДНЫЙ СТАРТ', 0.0, hard=True)     # the part (and the film) opens on black
type_card('ВЫСОТА', 46.37)

# ===================================================================== ROW 1 · cold open
# --- p0 1.00–20.04: 15 to 30 seconds by the aviation table at almost 11 km if the cabin loses its air; where is there even less
#     time? start the stopwatch: seven places on Earth where you cannot survive without protection
SW = (980, 1150); SR = 380
stopwatch(SW, SR, L(1.1))
for txt, b in (('0', -90), ('15', 0), ('30', 90), ('45', 180)):
    rr = SR * .58; write(txt, SW[0] + rr * math.cos(math.radians(b)), SW[1] + rr * math.sin(math.radians(b)) + 18, L(1.8), .3, 'grey', 44, align='center', quiet=True)
line(arc(SW, SR * .66, SR * .66, 0, 90, 30), L(1.6), 1.2, 'blue', 30, alpha=.45)            # the 15…30 s sector
H1 = hand(SW, SR, L(2.0), ticks=secs(L(15.4), L(44.4)))
count('{0}–{1} секунд', [15, 30], 1530, 880, L(1.5), 1.6, size=118)
tag('по авиационной таблице', 1560, 1010, L(3.3), size=54, rot=-1.5)
# the plane at almost 11 km
GX0, GX1, GY = 2560, 3450, 1880; KM = 108                       # ground line, px per km
AX = 2620; PY = GY - 11 * KM + 40                                # "almost" 11 km: a touch under the 11 km tick
line([[GX0, GY], [GX1, GY]], L(5.5), .4, 'graphite', 7)
write('земля', GX1, GY + 70, L(5.7), .4, 'grey', 44, align='right', quiet=True)
for k in (0, 5, 10):
    line([[AX - 18, GY - k * KM], [AX + 18, GY - k * KM]], L(6.0) + .05 * k, .05, 'blue', 5, quiet=True)
PC = (3080, PY)
def plane(c, s, t, color='graphite', lw=7):
    x, y = c
    body = [[x - 170 * s, y - 6 * s], [x + 120 * s, y - 20 * s], [x + 168 * s, y - 6 * s], [x + 175 * s, y + 6 * s], [x + 120 * s, y + 20 * s],
            [x - 150 * s, y + 18 * s], [x - 175 * s, y + 4 * s], [x - 170 * s, y - 6 * s]]
    line(body, t, .5, color, lw, fill='grey', fillA=.15)
    line([[x - 150 * s, y - 8 * s], [x - 190 * s, y - 70 * s], [x - 160 * s, y - 70 * s], [x - 105 * s, y - 14 * s]], t + .45, .2, color, lw, quiet=True)
    line([[x - 10 * s, y + 6 * s], [x - 70 * s, y + 70 * s], [x - 30 * s, y + 70 * s], [x + 50 * s, y + 8 * s]], t + .6, .2, color, lw, quiet=True)
    for i in range(6):
        line(circle((x - 90 * s + i * 38 * s, y - 4 * s), 5 * s, 8), t + .8 + .03 * i, .04, color, lw * .6, quiet=True)
plane(PC, 1.1, L(5.7))
dim([AX, GY], [AX, PY], L(6.6), 1.2, lw=6)
count('почти {0} км', [11], AX + 60, GY - 5.2 * KM, L(8.3), 1.5, size=92)
# the cabin loses its air: dashed puffs leave the fuselage
for i, (dx, dy) in enumerate(((-40, -40), (30, -55), (100, -40))):
    p0 = [PC[0] + dx, PC[1] - 26]; line(bez(p0, [p0[0] + dy * .2, p0[1] - 60], [p0[0] + 50, p0[1] + dy * 2.3], 12), L(10.4) + .3 * i, .45,
                                         'graphite', 5, dash=[12, 10], arrow=True, quiet=(i > 0))
write('если воздух уйдёт', AX + 60, GY - 3.0 * KM, L(10.0), 1.0, 'graphite', 54)
write('из кабины', AX + 60, GY - 3.0 * KM + 75, L(11.2), .6, 'graphite', 54)
write('а где времени ещё меньше?', 1530, 1300, L(12.9), 1.4, 'graphite', 64)
arrow([SW[0] + 130, SW[1] - SR - 160], [SW[0] + 25, SW[1] - SR - .24 * SR], L(15.0), .3, 'blue', 7)   # press the crown
write('включи секундомер', SW[0] + 150, SW[1] - SR - 140, L(15.0), .9, 'blue', 50)
# seven places
for i in range(7): magnet(1580 + i * 135, 1530, L(16.5) + .17 * i, r=30)
write('семь мест Земли,', 1530, 1680, L(16.4), 1.0, 'graphite', 64)
write('где без защиты не выжить', 1530, 1790, L(18.1), 1.4, 'graphite', 64)

# --- p1 20.59–43.42: which one is surely the fastest? there is no honest ranking: every place has its own scale and exact numbers are not
#     everywhere; but there is the most insidious one, we will get to it; nobody gets there suddenly and unprotected: people work and
#     winter there because they have protection; this is an analysis, not a manual
BX = 3850
write('где быстрее всего?', BX, 640, L(20.7), 1.2, 'graphite', 70)
T1 = tag('рейтинг', BX + 40, 770, L(22.4), size=58, rot=-2, strike=dict(t=L(24.5), d=.3, color='red')); ev(L(24.5), 'strike', .3)
PX0, PB = BX + 60, 1270
steps = [(0, 1270 - 170, '2'), (230, 1270 - 260, '1'), (460, 1270 - 110, '3')]
for i, (dx, top, n) in enumerate(steps):
    line(rect(PX0 + dx, top, PX0 + dx + 230, PB), L(22.6) + .15 * i, .3, 'graphite', 7, quiet=(i > 0), fill='grey', fillA=.1)
    write(n, PX0 + dx + 115, top + 80, L(22.9) + .15 * i, .3, 'grey', 64, align='center', quiet=True)
    write('?', PX0 + dx + 115, top - 25, L(23.2) + .2 * i, .3, 'graphite', 80, align='center', quiet=True)
line([[PX0 - 30, PB - 300], [PX0 + 720, PB - 20]], L(24.6), .3, 'red', 10)
write('честного рейтинга нет', BX, 1370, L(24.5), 1.3, 'red', 58)
# every place its own scale
SX = 4900
write('у каждого места своя шкала', SX, 640, L(26.0), 1.5, 'graphite', 66)
for i, (lab, step, q) in enumerate((('секунды', 30, False), ('минуты', 60, True), ('часы', 95, False), ('градусы', 45, True))):
    y = 790 + i * 150; x0, x1 = SX, SX + 1250
    line([[x0, y], [x1, y]], L(26.4) + .3 * i, .35, 'blue', 6, quiet=(i > 0))
    tk = []
    for j, x in enumerate(range(x0, x1 + 1, step)):
        h = 30 if j % 5 == 0 else 16
        tk.append(dict(points=[[x, y - h], [x, y]], t=round(L(26.6) + .3 * i + .004 * j, 3), d=.04, lw=4))
    strokes_el(tk, L(26.6) + .3 * i, .4, 'blue', 4, .8, quiet=True)
    write(lab, x1 + 40, y + 14, L(26.7) + .3 * i, .5, 'grey', 46, quiet=True)
    if q: write('?', x0 + 640, y - 40, L(28.3) + .45 * i, .3, 'graphite', 80, align='center')
write('точные цифры есть не везде', SX, 1400, L(28.0), 1.6, 'graphite', 56)
# the most insidious one, ahead
line(bez([SX + 1260, 1400], [6550, 1300], [6720, 1120]), L(30.3), .8, 'graphite', 6, dash=[16, 12], arrow=True)
line(rect(6600, 880, 6880, 1100), L(30.9), .3, 'graphite', 7, fill='grey', fillA=.1)
write('?', 6740, 1030, L(31.1), .3, 'graphite', 110, align='center')
tag('самое коварное', 6600, 820, L(31.0), size=50, rot=2)
write('подведём к нему', 6430, 1520, L(32.5), 1.0, 'grey', 48, align='center')
# protection: people work and winter there
DC = (4250, 1880)
line(arc(DC, 300, 300, 180, 360, 36), L(35.0), .8, 'graphite', 8, fill='grey', fillA=.12)
line([[DC[0] - 340, DC[1]], [DC[0] + 340, DC[1]]], L(35.0), .3, 'graphite', 7, quiet=True)
person((DC[0] - 70, DC[1]), 1.6, L(36.4)); person((DC[0] + 80, DC[1]), 1.6, L(36.7))
write('никто не попадает туда внезапно:', 4700, 1620, L(34.3), 1.8, 'graphite', 56)
write('люди работают там и зимуют', 4700, 1720, L(36.4), 1.6, 'graphite', 56)
write('потому что у них есть защита', 4700, 1820, L(39.0), 1.6, 'graphite', 56)
el(type='stamp', text='РАЗБОР', xy=[6400, 1700], size=84, rot=-5, t=L(41.1), color='red'); ev(L(41.1), 'stamp', .2)
write('не руководство', 6400, 1880, L(42.0), .9, 'graphite', 56, align='center')

# ===================================================================== ROW 2 · ВЫСОТА
# --- p2 47.37–65.71: (under the clip) Everest, almost 9 km above the sea, a third of the usual pressure — no sound;
#     after the clip: lifted there instantly → by the aviation tables one to several minutes to still act sensibly
PE = dict(x=1000, y=3230, w=1000); PEH = PE['w'] * 1050 / 1526
printd('everest', 'print_everest', PE['x'], PE['y'], L(48.0), w=PE['w'], rot=-1.5, quiet=True)
magnet(PE['x'] - 380, PE['y'] - PEH / 2 + 30, L(48.5), r=20); magnet(PE['x'] + 380, PE['y'] - PEH / 2 + 22, L(48.6), r=20)
credit('cred_everest', 'Эверест на рассвете, снимок с МКС · NASA', PE['x'], PE['y'] + PEH / 2 + 62, L(48.8), 720)
write('вершина Эвереста', 400, 2720, L(49.0), 1.0, 'graphite', 72, quiet=True)
# the profile: sea level y 3880, 9 km at y 2780
SEA, K2 = 3880, (3880 - 2800) / 9
VX = 1700; SUM = (2500, SEA - 8.85 * K2)
line([[VX - 40, SEA], [3150, SEA]], L(49.5), .5, 'blue', 6, quiet=True)
write('уровень моря', 1800, SEA + 70, L(49.7), .5, 'grey', 42, quiet=True)
prof = [[1800, SEA], [1950, SEA - 1.2 * K2], [2080, SEA - 3.0 * K2], [2180, SEA - 4.6 * K2], [2260, SEA - 6.2 * K2], [2330, SEA - 6.9 * K2],
        [2410, SEA - 8.0 * K2], SUM, [2600, SEA - 8.3 * K2], [2700, SEA - 7.4 * K2], [2830, SEA - 5.2 * K2], [2960, SEA - 2.6 * K2], [3100, SEA]]
line(prof, L(49.8), 1.2, 'graphite', 8, fill='grey', fillA=.12, quiet=True)
dim([VX, SEA], [VX, SUM[1]], L(50.5), 1.0, lw=6, quiet=True)
line([[VX, SUM[1]], [SUM[0] - 30, SUM[1]]], L(51.4), .4, 'grey', 4, dash=[10, 12], quiet=True)
count('почти {0} км', [9], VX + 40, SEA - 7.4 * K2, L(50.8), 1.2, size=84, quiet=True)
write('над морем', VX + 40, SEA - 7.4 * K2 + 80, L(51.7), .6, 'graphite', 54, quiet=True)
# the pressure: a full bar at the sea, a third at the summit
QX = 3300
write('давление воздуха', QX, 2780, L(52.3), .9, 'graphite', 62, quiet=True)
line(rect(QX, 2880, QX + 560, 2970), L(52.6), .5, 'blue', 6, fill='blue', fillA=.25, quiet=True)
write('у моря', QX + 590, 2950, L(52.9), .4, 'grey', 46, quiet=True)
line(rect(QX, 3060, QX + 187, 3150), L(53.4), .4, 'blue', 6, fill='blue', fillA=.25, quiet=True)
line(rect(QX + 187, 3060, QX + 560, 3150), L(53.6), .4, 'grey', 4, dash=[10, 10], quiet=True)
write('на вершине', QX + 590, 3130, L(53.8), .4, 'grey', 46, quiet=True)
write('примерно треть', QX, 3290, L(54.2), .8, 'blue', 74, quiet=True)
write('от привычного', QX, 3390, L(54.8), .6, 'graphite', 56, quiet=True)
# after the clip: lifted there instantly
person((1960, SEA - 10), 1.3, L(55.9), quiet=False)
line(bez([2010, SEA - 120], [2150, SEA - 700], [SUM[0] - 40, SUM[1] + 40], 24), L(56.3), .45, 'blue', 7, arrow=True)
write('мгновенно', 2560, SEA - 3.6 * K2, L(56.8), .6, 'blue', 56)
person((SUM[0] + 10, SUM[1] - 6), .9, L(57.1), quiet=False)
# by the aviation tables: one to several minutes
SW2 = (4900, 3320); SR2 = 300
stopwatch(SW2, SR2, L(58.3), dial=True)
write('мин', SW2[0], SW2[1] + 120, L(58.9), .3, 'grey', 46, align='center', quiet=True)
line(arc(SW2, SR2 * .66, SR2 * .66, -60, 120, 30), L(61.4), 1.3, 'blue', 26, alpha=.4)
hand(SW2, SR2, L(59.0), sweep=[(L(61.3), 1.0, 30), (L(62.3), 1.4, 150)])
tag('по авиационным таблицам', 5370, 2880, L(58.6), size=54, rot=-1.5)
count('от {0} до нескольких минут', [1], 5370, 3110, L(61.1), 2.0, size=80)
write('чтобы ещё действовать', 5370, 3260, L(63.25), 1.1, 'graphite', 64)
write('осмысленно', 5370, 3360, L(64.4), .7, 'graphite', 64)

# --- p3 66.26–83.87: the tables are averages, everyone's time is his own; lack of oxygen is insidious: the brain first stops judging
#     soberly, and the person does not notice he is already unwell; so at altitude you cannot trust how you feel — the watch is for that
EX = 7550
write('таблицы усреднённые', EX, 2760, L(66.3), 1.1, 'graphite', 66)
TX0, TY0 = EX, 2830
line(rect(TX0, TY0, TX0 + 700, TY0 + 360), L(66.4), .4, 'graphite', 6)
gr = [dict(points=[[TX0, TY0 + 90 * j], [TX0 + 700, TY0 + 90 * j]], t=round(L(66.7) + .05 * j, 3), d=.08, lw=4) for j in (1, 2, 3)]
gr += [dict(points=[[TX0 + 350, TY0], [TX0 + 350, TY0 + 360]], t=L(66.9), d=.08, lw=4)]
strokes_el(gr, L(66.7), .4, 'grey', 4, .8, quiet=True)
write('≈', TX0 + 525, TY0 + 330, L(67.1), .2, 'blue', 70, align='center')
write('у каждого человека время своё', 8500, 2760, L(67.6), 1.6, 'graphite', 62)
for i, (px, ln) in enumerate(((8650, 260), (9150, 420), (9650, 170))):
    person((px, 3120), 2.1, L(67.9) + .3 * i)
    line([[px - 60, 3190], [px - 60 + ln, 3190]], L(68.4) + .3 * i, .4, 'blue', 14, quiet=(i > 0))
# the head: the brain switches off judgement first
HC = (7800, 3700); hs = .95
head = [(-120, -200), (-40, -232), (60, -215), (130, -160), (150, -90), (145, -40), (178, 8), (150, 26), (156, 60), (140, 84), (146, 110),
        (110, 136), (60, 142), (40, 210)]
back = [(-120, -200), (-172, -120), (-178, -20), (-142, 60), (-92, 110), (-92, 210)]
line([[HC[0] + hs * x, HC[1] + hs * y] for x, y in head], L(69.6), .8, 'graphite', 8)
line([[HC[0] + hs * x, HC[1] + hs * y] for x, y in back], L(69.9), .5, 'graphite', 8, quiet=True)
BRC = (HC[0] - 15 * hs, HC[1] - 110 * hs)
line(circle(BRC, [110 * hs, 72 * hs], 36), L(71.7), .5, 'graphite', 6, fill='grey', fillA=.25)
write('нехватка кислорода коварна:', 8300, 3480, L(69.6), 1.6, 'graphite', 58)
write('мозг сначала перестаёт трезво', 8300, 3580, L(71.7), 1.6, 'graphite', 58)
write('оценивать ситуацию', 8300, 3665, L(73.9), 1.1, 'graphite', 58)
ink('ring', L(72.0), .4, 'blue', c=BRC, r=[150 * hs, 108 * hs], lw=5)
write('и не замечает, что ему уже плохо', 8300, 3780, L(75.3), 1.8, 'graphite', 58)
write('нельзя доверять самочувствию', 8300, 3920, L(78.2), 1.6, 'red', 62)
SW3 = (10350, 3560); SR3 = 150
stopwatch(SW3, SR3, L(80.4), lw=7)
hand(SW3, SR3, L(81.0), ticks=secs(L(81.4), L(83.4)))
write('часы — для этого', SW3[0], SW3[1] + SR3 + 90, L(81.2), .9, 'blue', 50, align='center')

# ===================================================================== ROW 3
# --- p4 84.42–102.99: climbers survive because they acclimatise over weeks: the body makes more red blood cells; above 8 km is the
#     death zone; more than three hundred people died on Everest; the stopwatch is paused; where can't danger be seen at all?
PC_ = dict(x=1000, y=5130, w=1050); PCH = PC_['w'] * 1009 / 1526
printd('climbers', 'print_climbers', PC_['x'], PC_['y'], L(84.5), w=PC_['w'], rot=1.2, size='mid')
magnet(PC_['x'] - 400, PC_['y'] - PCH / 2 + 26, L(84.95), r=20); magnet(PC_['x'] + 400, PC_['y'] - PCH / 2 + 34, L(85.05), r=20)
credit('cred_climbers', 'альпинисты у ступени Хиллари · фото: Debasish Biswas, CC BY-SA 4.0', PC_['x'], PC_['y'] + PCH / 2 + 62, L(85.2), 1130)
write('альпинисты привыкают неделями', 1700, 4640, L(84.6), 1.6, 'graphite', 64)
TLX0, TLX1, TLY = 1720, 3000, 4760
arrow([TLX0, TLY], [TLX1, TLY], L(86.4), 1.0, 'blue', 7)
for i in range(4):
    line([[TLX0 + 40 + i * 300, TLY - 22], [TLX0 + 40 + i * 300, TLY + 22]], L(86.6) + .2 * i, .06, 'blue', 6, quiet=True)
write('недели', TLX1, TLY + 75, L(87.6), .5, 'grey', 44, align='right')
rnd = random.Random(53)
for i, n in enumerate((2, 4, 6, 9)):
    cx = TLX0 + 40 + i * 300
    for j in range(n):
        x = cx - 15 + (j % 3) * 46 + rnd.uniform(-6, 6); y = TLY + 100 + (j // 3) * 46 + rnd.uniform(-6, 6)
        line(circle((x, y), 17, 12), L(88.6) + .5 * i + .05 * j, .08, 'graphite', 5, fill='grey', fillA=.35, quiet=not (j == 0))
write('больше красных кровяных клеток', 1700, 5075, L(88.6), 1.6, 'graphite', 56)
# the death zone on a small profile
SEA3, K3 = 5880, (5880 - 5260) / 9
mp = [[1760, SEA3], [1960, SEA3 - 3.5 * K3], [2120, SEA3 - 6.8 * K3], [2230, SEA3 - 8.85 * K3], [2350, SEA3 - 7.2 * K3], [2560, SEA3]]
line([[1720, SEA3], [2620, SEA3]], L(92.1), .3, 'blue', 5, quiet=True)
line(mp, L(92.1), .6, 'graphite', 7, fill='grey', fillA=.12)
Y8 = SEA3 - 8 * K3
line([[1720, Y8], [2650, Y8]], L(92.6), .5, 'blue', 5, dash=[14, 12])
hat = []
for i in range(8):
    x = 2140 + i * 22; hat.append(dict(points=[[x, Y8], [x + 30, Y8 - 40]], t=round(L(94.4) + .05 * i, 3), d=.06, lw=4))
strokes_el(hat, L(94.4), .5, 'grey', 4, .7, quiet=True)
count('выше {0} км', [8], 2700, Y8 + 20, L(92.4), 1.4, size=70)
tag('зона смерти', 2720, 5120, L(94.4), size=54, rot=-1.5)
write('на Эвересте погибли', 2700, 5560, L(95.6), 1.0, 'graphite', 58)
write('более 300 человек', 2700, 5660, L(96.6), 1.0, 'graphite', 58)
SW4 = (3480, 4920); SR4 = 170
stopwatch(SW4, SR4, L(95.9), lw=7)
hand(SW4, SR4, L(96.5), ticks=secs(L(96.9), L(97.9)))
for dx in (-24, 24):
    line([[SW4[0] + dx, SW4[1] + 40], [SW4[0] + dx, SW4[1] + 110]], L(98.6) + (.1 if dx > 0 else 0), .12, 'blue', 14, quiet=(dx > 0))
write('на паузе', SW4[0], SW4[1] + SR4 + 85, L(98.7), .7, 'blue', 50, align='center')
write('а где опасность', 2700, 5790, L(100.2), .9, 'graphite', 58)
write('вообще нельзя увидеть?', 2700, 5880, L(101.2), 1.3, 'graphite', 58)

# --- p5 103.54–120.49: the first on the summit, Hillary and Tenzing in 1953, climbed with oxygen sets; the body gets used to altitude, but
#     not without limit; that is why we count seconds: altitude has a limit and it is closer than it seems
GX = 4150
write('первые на вершине', GX, 4640, L(103.6), 1.0, 'graphite', 64)
write('Хиллари и Тенцинг', GX, 4760, L(105.8), 1.0, 'graphite', 72)
write('1953', GX, 4900, L(107.6), .8, 'blue', 96)
RG = [[GX + 20, 5560], [GX + 250, 5420], [GX + 470, 5250], [GX + 640, 5160], [GX + 820, 5230]]
line(RG, L(104.0), .7, 'graphite', 7, fill='grey', fillA=.1)
person((GX + 330, 5360), 2.4, L(104.4), tank=True); person((GX + 560, 5215), 2.4, L(104.7), tank=True)
write('шли с кислородными', GX, 5700, L(109.6), 1.0, 'graphite', 58)
write('приборами', GX, 5790, L(110.6), .6, 'graphite', 58)
arrow([GX + 300, 5650], [GX + 300 - 26, 5360 - 2.4 * 40], L(110.8), .5, 'graphite', 5)
# acclimatisation: a curve that rises and levels under a ceiling
OX0, OY0, OX1, OY1 = 5400, 5300, 7350, 4720
arrow([OX0, OY0], [OX1, OY0], L(111.6), .5, 'graphite', 6)
arrow([OX0, OY0], [OX0, OY1 - 40], L(111.7), .5, 'graphite', 6)
write('время на высоте', OX1, OY0 + 75, L(111.9), .6, 'grey', 44, align='right', quiet=True)
write('организм привыкает', OX0 + 30, OY1 - 10, L(111.8), 1.0, 'graphite', 56)
CEIL = 4900
curve = [[OX0 + u * (OX1 - OX0 - 80), OY0 - (OY0 - CEIL - 25) * (1 - math.exp(-4.2 * u))] for u in [i / 40 for i in range(41)]]
line(curve, L(112.0), 1.4, 'blue', 8)
line([[OX0, CEIL], [OX1 - 40, CEIL]], L(113.6), .6, 'red', 6, dash=[18, 12])
write('но не безгранично', OX0 + 40, CEIL - 25, L(113.6), 1.0, 'graphite', 54)
write('предел', OX1 - 40, CEIL - 25, L(117.3), .5, 'red', 60, align='right')
SW5 = (7480, 5600); SR5 = 140
stopwatch(SW5, SR5, L(114.8), lw=7)
hand(SW5, SR5, L(115.2), ticks=secs(L(115.6), L(122.6)))
write('поэтому мы и считаем секунды:', OX0, 5500, L(114.8), 1.5, 'graphite', 58)
write('у высоты есть предел,', OX0, 5620, L(117.3), 1.0, 'graphite', 58)
write('и он ближе, чем кажется', OX0, 5730, L(118.7), 1.4, 'graphite', 58)

# ===================================================================== camera (one continuous camera; the cards hide the start and the jump)
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90
def fit(box, zmax=9):
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    return (x0 + x1) / 2, cy, z
class Cam:
    def __init__(s, x, y, z):
        s.base = dict(x=x, y=y, z=z, roll=0); s.cur = dict(x=x, y=y, lz=math.log(z), roll=0); s.moves = []; s.shakes = []
    def to(s, t, d, x=None, y=None, z=None, roll=None, a=2, b=2.6):
        m = dict(t=round(t, 3), d=round(d, 3), a=a, b=b)
        if x is not None: m['dx'] = round(x - s.cur['x'], 2); s.cur['x'] = x
        if y is not None: m['dy'] = round(y - s.cur['y'], 2); s.cur['y'] = y
        if z is not None: m['dl'] = math.log(z) - s.cur['lz']; s.cur['lz'] = math.log(z)
        s.moves.append(m)
        if d > .6 and (abs(m.get('dx', 0)) * z_of(s) > 500 or abs(m.get('dl', 0)) > .5): ev(t, 'whoosh', d)
        return t + d
    def fit(s, t, d, box, zmax=9, a=2, b=2.6):
        x, y, z = fit(box, zmax); return s.to(t, d, x, y, z, a=a, b=b)
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])

c = Cam(*fit([420, 560, 2560, 1700]))                                    # the stopwatch and 15–30 s
c.to(L(1.2), 3.8, z=z_of(c) * 1.03)
c.fit(L(5.1), 1.4, [400, 520, 3560, 1960], b=3)                          # + the plane at almost 11 km
c.to(L(6.6), 7.5, z=z_of(c) * 1.03)
c.fit(L(16.1), 1.2, [400, 560, 3560, 1940], b=3)                         # seven places
c.to(L(17.4), 2.5, z=z_of(c) * 1.02)
c.fit(L(20.2), 1.5, [3780, 520, 6300, 1420], b=2.8)                      # ranking, its own scales
c.fit(L(26.0), 1.2, [3780, 520, 6980, 1460], b=3)
c.to(L(27.3), 3.0, z=z_of(c) * 1.02)
c.fit(L(33.9), 1.3, [3780, 560, 7000, 1960], b=2.8)                     # protection, «разбор»
c.to(L(35.3), 7.4, z=z_of(c) * 1.03)
c.fit(L(43.4), 2.4, [250, 420, 7150, 2000], b=3)                         # pull-back: the cold-open wall
c.fit(L(46.5), .7, [400, 2650, 3250, 3980], b=2.4)                      # (under the card) to Everest
c.to(L(47.4), 7.6, z=z_of(c) * 1.03)                                     # (under the clip) slow drift
c.fit(L(55.0), .7, [380, 2650, 4200, 3990], b=3)                         # the profile and the pressure, as the clip ends
c.fit(L(57.9), 1.3, [3300, 2640, 7200, 3740], b=2.8)                     # 1 to several minutes
c.to(L(59.3), 6.3, z=z_of(c) * 1.03)
c.fit(L(65.8), 1.4, [7400, 2640, 10600, 3330], b=2.8)                    # tables, everyone's own time
c.to(L(67.3), 2.0, z=z_of(c) * 1.02)
c.fit(L(69.3), 1.2, [7450, 3380, 10600, 3990], b=2.8)                    # the brain, the watch
c.to(L(70.6), 9.4, z=z_of(c) * 1.03)
c.fit(L(80.2), 1.0, [7450, 3350, 10600, 4000], b=3)
c.fit(L(84.0), 1.6, [380, 4560, 3700, 5320], b=2.8)                      # row 3: climbers, weeks, cells
c.to(L(85.7), 6.0, z=z_of(c) * 1.02)
c.fit(L(91.8), 1.2, [380, 4560, 3750, 5940], b=3)                        # the death zone, > 300, pause
c.to(L(93.1), 9.6, z=z_of(c) * 1.02)
c.fit(L(103.1), 1.4, [4050, 4560, 7700, 5880], b=2.8)                    # Hillary and Tenzing, the limit
c.to(L(104.6), 15.6, z=z_of(c) * 1.03)
c.fit(L(120.45), 2.15, [250, 420, 10750, 6000], b=3)                     # pull-back: the whole wall of this part

EV = [e for e in EV if e['type'] == 'key' or not any(a - .05 < e['t'] < b for a, b in COVER)]
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=73, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
