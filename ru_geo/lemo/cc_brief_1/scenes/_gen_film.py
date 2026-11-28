#!/usr/bin/env python3
"""«Мысленный эксперимент» · Как создать свою страну · board film, PART 1: cold open «ХОЛОДНЫЙ СТАРТ» + chapter «ЧЕТЫРЕ ГАЛОЧКИ».
FILM range 0.00–102.62 s (102.62 s). The renderer works in LOCAL time:  local = film − 0.00 (offset 0, so local = film).
All times below are written as L(<film seconds>) so they can be checked against ru_geo/create_country/film.json (segs → captions).
The film opens with a separate title card made by the assembler, so this part has NO «ХОЛОДНЫЙ СТАРТ» card: it starts on the
board at local 0 (the first second is cut anyway). The «ЧЕТЫРЕ ГАЛОЧКИ» card is typed at film 41.19 as usual.
No clip windows are covered in this range.
Wall (board px):
  row 1  (y  450…2060)  cold open: p0 the rusty platform, the home-made flag up the mast, «отныне это страна», the boat, who is on it,
                        four empty boxes, the one that is not yours (red ring) · p1 the promise: four live examples (marker sketches:
                        platform in the sea, disputed bank, farm with a prince, garden in the desert), which tick breaks almost
                        everyone, not legal advice, «РАЗБОР»
  row 2  (y 2600…4060)  ЧЕТЫРЕ ГАЛОЧКИ: p2 rules older than you, 1933, the Americas (real coastline), Montevideo, the treaty card,
                        still quoted · p3 THE CHECKLIST MOTIF (население / территория / правительство / отношения с другими
                        государствами, four empty boxes, numbered) · p4 the strange line (exists regardless of recognition):
                        pinned with a magnet, «запомни!», sounds like a loophole → a trap; who already had such a platform?
Montevideo photo (archive montevideo_conf, CC BY 3.0) is NOT used: it is a modern convention, not 1933, and only 263 px tall;
the treaty is shown as a marker map of the Americas + a printed card instead.
Ink: graphite = names/facts · blue = measurement and numbers · red = only the break / the decision.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from geo import FEAT, rings, dissolve, merc, dp, clip_box
R0, R1 = 0.0, 102.62
DUR = round(R1 - R0, 3)
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 10400, 6000

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
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
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
def person(c, s, t, color='graphite', lw=6, quiet=True, arm=None):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .08, color, lw, quiet=quiet)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .08, .06, color, lw, quiet=True)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .12, .06, color, lw, quiet=True)
    if arm: line([[x - 16 * s, y - 40 * s], [x, y - 44 * s], [arm[0], arm[1]]], t + .16, .06, color, lw, quiet=True)
    else: line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .16, .05, color, lw, quiet=True)
def waves(x0, x1, y, t, d, step=90, amp=14, color='blue', lw=5, quiet=False, seed=1):
    rnd = random.Random(seed); st = []; n = int((x1 - x0) / step)
    for i in range(n):
        xa = x0 + i * step + rnd.uniform(-10, 10); w = step * .7
        st.append(dict(points=P2(arc((xa + w / 2, y + amp), w / 2, amp, 200, 340, 8)), t=round(t + d * i / n, 3), d=round(d / n * 1.5, 3), lw=lw))
    return strokes_el(st, t, d, color, lw, .8, quiet=quiet)
def boxes4(x, y, t, s=44, gap=62, quiet=True, color='graphite', lw=5):
    for i in range(4): line(rect(x + i * gap, y, x + i * gap + s, y + s), t + .06 * i, .1, color, lw, quiet=quiet or i > 0)

# ===================================================================== marker sketches
def platform(x, sea, s, t, color='graphite', lw=8, rust=True, hut=True, quiet=False):
    """a rusty sea platform: two legs in the water, a deck, a hut"""
    for dx in (-80, 80):
        line([[x + dx * s, sea + 60 * s], [x + dx * s, sea - 180 * s]], t + (.0 if dx < 0 else .12), .25, color, lw, quiet=quiet or dx > 0)
    line([[x - 80 * s, sea - 40 * s], [x + 80 * s, sea - 150 * s]], t + .3, .15, color, lw * .6, quiet=True)
    line([[x + 80 * s, sea - 40 * s], [x - 80 * s, sea - 150 * s]], t + .38, .15, color, lw * .6, quiet=True)
    line(rect(x - 140 * s, sea - 212 * s, x + 140 * s, sea - 180 * s), t + .45, .35, color, lw, quiet=True, fill='grey', fillA=.3)
    if hut: line(rect(x - 100 * s, sea - 300 * s, x + 10 * s, sea - 212 * s), t + .75, .3, color, lw * .85, quiet=True, fill='grey', fillA=.12)
    if rust:
        rnd = random.Random(int(x)); st = []
        for i in range(14):
            lx = x + rnd.choice((-80, 80)) * s + rnd.uniform(-6, 12) * s; ly = sea - rnd.uniform(10, 170) * s
            st.append(dict(points=P2([[lx, ly], [lx + 9 * s, ly + 14 * s]]), t=round(t + .9 + .03 * i, 3), d=.05, lw=max(3, lw * .45)))
        strokes_el(st, t + .9, .5, 'grey', max(3, lw * .45), .75, quiet=True)
def flag_shape(x0, y0, w, h, t, mv=None, color='graphite', lw=6):
    k = dict(moves=mv, pivot=[x0, y0]) if mv else {}
    line(rect(x0, y0, x0 + w, y0 + h), t, .35, color, lw, fill='grey', fillA=.12, **k)
    line([[x0, y0 + h], [x0 + w, y0]], t + .3, .2, color, lw * .8, quiet=True, **k)          # a diagonal band
    line(rect(x0 + 12, y0 + 12, x0 + w - 12, y0 + h - 12), t + .5, .4, 'grey', 3, dash=[8, 8], quiet=True, **k)   # hand stitches

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
# «ХОЛОДНЫЙ СТАРТ» is NOT typed here: the assembler makes the opening title card.
type_card('ЧЕТЫРЕ ГАЛОЧКИ', 41.19)

# ===================================================================== ROW 1 · cold open
# --- p0 1.00–20.09: a rusty platform in the sea, a flag you sewed yourself, up the mast: from now on this is a country and you are its
#     founder; in a minute a boat comes; who is on it depends on four ticks, and one of them is not in your power
SEA = 1350; PX = 1000; PS = 1.6
waves(320, 2840, SEA, L(.3), .9, quiet=True, seed=3)
waves(380, 2780, SEA + 70, L(.6), .9, quiet=True, seed=4)
waves(440, 2720, SEA + 140, L(.9), .9, quiet=True, seed=5)
platform(PX, SEA, PS, L(1.2))
write('ржавая платформа', 380, 760, L(2.2), .9, 'graphite', 60)
write('посреди моря', 380, 850, L(3.1), .7, 'grey', 50)
DECK = SEA - 212 * PS                                         # 1010.8
person((1120, DECK), 2.0, L(4.1), quiet=False, arm=(1185, DECK - 100))
FX, FY, FW, FH = 1192, DECK - 125, 160, 100                  # the flag in the hand, then up the mast
UP = [dict(t=L(6.6), d=1.4, dy=-300, a=2, b=2.6)]
flag_shape(FX, FY, FW, FH, L(4.3), mv=UP)
write('сшил сам', FX + FW + 30, FY + 68, L(5.0), .6, 'grey', 46, moves=UP, pivot=[FX, FY])
line([[FX, DECK], [FX, 560]], L(6.1), .5, 'graphite', 8)                                      # the mast
arrow([1640, FY + 60], [1640, FY - 200], L(6.6), .6, 'blue', 6)
write('отныне это страна', 1720, 700, L(8.2), 1.3, 'graphite', 72)
tag('основатель', 1720, 820, L(10.4), size=56, rot=-2)
line(bez([1700, 880], [1450, 900], [1210, DECK - 150], 12), L(10.9), .35, 'graphite', 5, arrow=True, quiet=True)
# the boat, in a minute
BX = 2450; MV = [dict(t=L(12.0), d=2.4, dx=-260, a=2, b=2.6)]
line([[BX - 160, SEA - 20], [BX + 160, SEA - 20], [BX + 120, SEA + 35], [BX - 120, SEA + 35], [BX - 160, SEA - 20]], L(11.75), .45, 'graphite', 7,
     fill='grey', fillA=.15, moves=MV, pivot=[BX, SEA])
line(rect(BX - 70, SEA - 110, BX + 50, SEA - 20), L(12.15), .3, 'graphite', 6, quiet=True, moves=MV, pivot=[BX, SEA])
for i in range(3): line([[BX - 260 + 180 + 40 * i, SEA - 5 + 15 * i], [BX - 260 + 330 + 60 * i, SEA + 10 + 25 * i]], L(13.6) + .1 * i, .3, 'grey', 4,
                        dash=[14, 10], quiet=True)
write('через минуту', 1880, 1600, L(11.9), .9, 'graphite', 56)
write('?', BX - 260 - 10, SEA - 32, L(14.7), .3, 'graphite', 90, align='center')
write('кто на нём приплывёт?', 1820, 1170, L(14.6), 1.3, 'graphite', 56)
# four ticks, one not in your power
QX = 2980; QY = [620, 780, 940, 1100]; QS = 110
write('четыре галочки', 2940, 560, L(16.0), .9, 'graphite', 56)
for i, y in enumerate(QY): line(rect(QX, y, QX + QS, y + QS), L(16.4) + .25 * i, .25, 'graphite', 8, quiet=i > 0)
ink('ring', L(17.8), .45, 'red', c=[QX + QS / 2, QY[3] + QS / 2], r=[95, 88], lw=8)
write('тебе не подвластна', QX + QS + 50, QY[3] + 80, L(18.4), 1.2, 'graphite', 52)

# --- p1 20.80–38.85: the promise — all four ticks on live examples: a platform in the sea, a disputed bank, a farm with a prince, a garden in
#     the desert; at the end: which tick breaks almost everyone; not legal advice, an analysis of open sources
AX = 4600
write('Вот что я обещаю:', AX, 580, L(20.85), .9, 'graphite', 72)
write('все четыре галочки — на живых примерах', AX, 700, L(21.9), 2.4, 'graphite', 58)
EXC = [5000, 5850, 6700, 7550]; EY = 1250                    # sketch ground line
# 1 platform in the sea
waves(EXC[0] - 260, EXC[0] + 260, EY, L(24.85), .4, step=70, amp=10, quiet=True, seed=11)
platform(EXC[0], EY, .9, L(25.0), lw=6, quiet=True)
line([[EXC[0] + 60, EY - 191], [EXC[0] + 60, EY - 360]], L(25.9), .2, 'graphite', 5, quiet=True)
line(rect(EXC[0] + 60, EY - 360, EXC[0] + 150, EY - 305), L(26.0), .2, 'graphite', 5, quiet=True, fill='grey', fillA=.15)
write('платформа в море', EXC[0], EY + 120, L(25.2), .9, 'graphite', 50, align='center')
# 2 a disputed bank: a river, the bank between two dashed claims
R = EXC[1]
line(bez([R - 120, 870], [R + 40, 1050], [R - 40, EY + 20], 20), L(27.0), .4, 'blue', 6, quiet=True)
line(bez([R - 30, 870], [R + 130, 1050], [R + 50, EY + 20], 20), L(27.05), .4, 'blue', 6, quiet=True)
line([[R - 280, 900], [R - 140, 1000], [R - 240, EY]], L(27.4), .4, 'grey', 4, dash=[12, 10], quiet=True)
line([[R + 280, 900], [R + 150, 1050], [R + 260, EY]], L(27.5), .4, 'grey', 4, dash=[12, 10], quiet=True)
write('?', R - 200, 1120, L(27.8), .25, 'graphite', 80, align='center', quiet=True)
write('?', R + 220, 1120, L(27.9), .25, 'graphite', 80, align='center', quiet=True)
write('спорный берег', R, EY + 120, L(27.0), .8, 'graphite', 50, align='center')
# 3 a farm with a prince: a barn, field rows, a crown
F = EXC[2]
line([[F - 230, EY], [F + 240, EY]], L(28.25), .2, 'graphite', 5, quiet=True)
line([[F - 200, EY], [F - 200, EY - 150], [F - 110, EY - 230], [F - 20, EY - 150], [F - 20, EY]], L(28.3), .4, 'graphite', 6, quiet=True, fill='grey', fillA=.12)
strokes_el([dict(points=P2([[F + 20 + 40 * i, EY - 10], [F + 60 + 30 * i, EY - 120]]), t=round(L(28.5) + .04 * i, 3), d=.06, lw=4) for i in range(6)],
           L(28.5), .3, 'grey', 4, .8, quiet=True)
line([[F - 170, 990], [F - 170, 920], [F - 140, 960], [F - 110, 905], [F - 80, 960], [F - 50, 920], [F - 50, 990], [F - 170, 990]], L(28.7), .35,
     'graphite', 6, quiet=True, fill='grey', fillA=.2)
write('ферма с принцем', F, EY + 120, L(28.4), .8, 'graphite', 50, align='center')
# 4 a garden in the desert: sun, dunes, a fenced plot with sprouts
G = EXC[3]
line(circle((G + 170, 930), 40, 18), L(29.5), .25, 'graphite', 5, quiet=True)
line(bez([G - 250, EY], [G - 160, EY - 120], [G - 70, EY], 14), L(29.6), .3, 'grey', 5, quiet=True)
line([[G - 240, EY], [G + 250, EY]], L(29.6), .2, 'graphite', 5, quiet=True)
line(rect(G - 40, EY - 70, G + 200, EY), L(29.8), .3, 'graphite', 5, quiet=True)
strokes_el([dict(points=P2([[G - 10 + 45 * i, EY - 8], [G - 10 + 45 * i, EY - 50], [G + 5 + 45 * i, EY - 62]]), t=round(L(30.1) + .05 * i, 3), d=.07, lw=4)
            for i in range(5)], L(30.1), .35, 'graphite', 4, .85, quiet=True)
write('огород в пустыне', G, EY + 120, L(29.5), .9, 'graphite', 50, align='center')
for i, x in enumerate(EXC): boxes4(x - 115, EY + 165, L(30.3) + .1 * i, quiet=i > 0)
# at the end: which tick breaks almost everyone
write('в конце:', AX, 1620, L(30.85), .5, 'graphite', 64)
write('какая из галочек ломает почти всех?', AX, 1735, L(31.4), 2.0, 'graphite', 64)
write('это не юридическая консультация,', AX, 1890, L(34.2), 1.8, 'graphite', 64)
write('а разбор по открытым источникам', AX, 2005, L(36.5), 1.8, 'graphite', 64)
el(type='stamp', text='РАЗБОР', xy=[7350, 1880], size=84, rot=-5, t=L(37.3), color='red'); ev(L(37.3), 'stamp', .2)

# ===================================================================== ROW 2 · ЧЕТЫРЕ ГАЛОЧКИ
# --- p2 42.19–59.20: rules older than you; in 1933 the countries of the Americas signed in Montevideo the treaty on the rights and duties
#     of states; it is old, but when people argue whether a country stands before you, they still quote it
write('Правила придумали задолго до тебя', 400, 2690, L(42.25), 1.9, 'graphite', 66)
TY = 2880
arrow([450, TY], [2950, TY], L(42.6), .9, 'graphite', 6)
line([[700, TY - 22], [700, TY + 22]], L(44.3), .1, 'blue', 6, quiet=True)
write('1933', 700, TY + 95, L(44.4), .8, 'blue', 78, align='center')
person((2780, TY - 8), 1.2, L(43.5))
write('ты', 2850, TY - 30, L(43.7), .3, 'graphite', 50)
# the Americas: real coastline (open boundary data), Mercator, lon −130…−30, lat −56…60
LON0, LON1, LAT0, LAT1 = -130, -30, -56, 60
MY0, MY1 = merc(0, LAT1)[1], merc(0, LAT0)[1]
MH = 980; MS = MH / (MY0 - MY1); MX0, MYT = 420, 3040
def pm(lon, lat): X, Y = merc(lon, lat); return MX0 + MS * (X - math.radians(LON0)), MYT + MS * (MY0 - Y)
ALL = dissolve(rings([n for n in FEAT if n not in ('Antarctica', 'Greenland')]))
coast = []
for Lq in ALL:
    for part in clip_box(Lq, LON0, LAT0, LON1, LAT1):
        P = dp([pm(*p) for p in part], 2.2)
        xs, ys = [p[0] for p in P], [p[1] for p in P]
        if len(P) >= 3 and max(max(xs) - min(xs), max(ys) - min(ys)) >= 26: coast.append(P)
coast.sort(key=lambda P: -len(P))
MAPW = MS * math.radians(LON1 - LON0)
print('americas map', round(MX0), MYT, round(MX0 + MAPW), MYT + MH, '· lines', len(coast))
strokes_el([dict(points=P2(P), t=round(L(44.9) + 1.6 * i / len(coast), 3), d=round(max(.08, 1.4 * len(P) / len(coast[0])), 3), lw=5) for i, P in enumerate(coast)],
           L(44.9), 2.0, 'graphite', 5, .9)
write('страны Америки', 1350, 3200, L(46.9), .9, 'graphite', 62)
line(bez([1340, 3170], [1200, 3130], [MX0 + MAPW * .45, 3300], 12), L(47.6), .35, 'graphite', 5, arrow=True, quiet=True)
MV_ = pm(-56.16, -34.9)
line(circle(MV_, 12, 12), L(49.2), .15, 'graphite', 9, fill='graphite', fillA=.9)
ink('ring', L(49.35), .3, 'graphite', c=[round(MV_[0]), round(MV_[1])], r=34, lw=5)
tag('Монтевидео', round(MV_[0]) + 80, round(MV_[1]) - 40, L(49.4), size=50, rot=-1.5)
# the treaty card
CX, CY, CW, CH = 2450, 3470, 1000, 470
el(type='card', id='treaty', xy=[CX, CY], w=CW, h=CH, rot=-1.2, z=9, arrive=dict(t=L(51.0), kind='drop', d=.4, lift=160, spin=.8, land=.6),
   magnets=[[-CW / 2 + 50, -CH / 2 + 40, 'graphite'], [CW / 2 - 50, -CH / 2 + 40, 'graphite']], magnetR=22,
   lines=[dict(text='ДОГОВОР', font='sans', weight=900, size=84, x=60, y=-95, color='graphite', track=6),
          dict(rule=True, x=60, y=-70, w=330, h=6, color='graphite'),
          dict(text='о правах и обязанностях', font='sans', weight=500, size=58, x=60, y=10, color='graphite'),
          dict(text='государств', font='sans', weight=500, size=58, x=60, y=80, color='graphite'),
          dict(text='Монтевидео · 1933', font='mono', size=40, x=60, y=170, color='grey')])
ev(L(51.25), 'land', .2, size='mid')
line(bez([MV_[0] + 40, MV_[1] + 30], [1500, 3800], [CX - CW / 2 - 20, CY + 60], 20), L(51.4), .5, 'grey', 4, dash=[12, 10], arrow=True, quiet=True)
tag('старый', CX + CW / 2 + 70, CY - CH / 2 + 10, L(53.1), size=54, rot=3)
write('когда спорят, страна перед тобой или нет,', 1350, 3890, L(54.6), 2.2, 'graphite', 56)
write('цитируют до сих пор именно его', 1350, 3995, L(57.0), 1.6, 'graphite', 56)
line(bez([2360, 3978], [2950, 4010], [2860, CY + CH / 2 + 25], 14), L(58.0), .35, 'graphite', 5, arrow=True, quiet=True)

# --- p3 59.74–81.06: THE FOUR TICKS (the running motif: same order and wording in every chapter)
#     1 население (постоянное: live here always, not for the weekend) · 2 территория (определённая: the land has borders) ·
#     3 правительство (someone really governs) · 4 отношения с другими государствами (the capacity to enter into them)
KX = 3950; KY = [2930, 3210, 3490, 3770]; KS = 110; TX = KX + KS + 60
write('Там четыре галочки', KX, 2720, L(59.8), 1.0, 'graphite', 74)
ITEMS = [('население', 'постоянное: живут здесь всегда, а не заехали на выходные', L(60.95), L(63.15), 2.9),
         ('территория', 'определённая: у земли есть границы', L(68.2), L(70.7), 1.5),
         ('правительство', 'кто-то реально управляет', L(72.3), L(74.2), 1.3),
         ('отношения с другими государствами', 'способность вступать в них', L(77.1), L(79.2), 1.2)]
for i, (lab, sub, t1, t2, d2) in enumerate(ITEMS):
    y = KY[i]
    write(str(i + 1), KX - 55, y, t1 - .05, .2, 'grey', 56, align='center', quiet=True)
    line(rect(KX, y - 85, KX + KS, y + 25), t1, .3, 'graphite', 9)
    write(lab, TX, y, t1 + .2, max(.6, .05 * len(lab)), 'graphite', 70)
    write(sub, TX, y + 72, t2, d2, 'graphite', 44, quiet=True)
# icons (x 5900…6550)
IX = 6000
for j, dx in enumerate((-60, 40, 140)): person((IX + dx, KY[0] + 20), 1.7, L(63.6) + .2 * j)
line([[IX + 230, KY[0] + 20], [IX + 230, KY[0] - 60], [IX + 300, KY[0] - 120], [IX + 370, KY[0] - 60], [IX + 370, KY[0] + 20], [IX + 230, KY[0] + 20]],
     L(64.4), .4, 'graphite', 6, quiet=True, fill='grey', fillA=.12)
blob = [[IX - 80, KY[1] - 60], [IX + 60, KY[1] - 110], [IX + 220, KY[1] - 80], [IX + 360, KY[1] - 100], [IX + 390, KY[1] - 10],
        [IX + 300, KY[1] + 50], [IX + 120, KY[1] + 40], [IX - 40, KY[1] + 60], [IX - 100, KY[1] + 10], [IX - 80, KY[1] - 60]]
line(blob, L(70.7), .9, 'graphite', 7, dash=[18, 12], fill='grey', fillA=.15)
GB = (IX + 150, KY[2] + 20)                                    # a building with columns
line([[GB[0] - 170, GB[1]], [GB[0] + 170, GB[1]]], L(74.2), .2, 'graphite', 6, quiet=True)
line([[GB[0] - 170, GB[1] - 150], [GB[0], GB[1] - 215], [GB[0] + 170, GB[1] - 150], [GB[0] - 170, GB[1] - 150]], L(74.35), .3, 'graphite', 6,
     fill='grey', fillA=.15)
for j in range(5): line([[GB[0] - 130 + 65 * j, GB[1] - 140], [GB[0] - 130 + 65 * j, GB[1] - 8]], L(74.6) + .07 * j, .1, 'graphite', 6, quiet=True)
for j, cx in enumerate((IX - 20, IX + 320)):                    # two countries and the arrows between them
    line(circle((cx, KY[3] - 30), 62, 24), L(79.2) + .2 * j, .3, 'graphite', 6, quiet=j > 0, fill='grey', fillA=.12)
arrow([IX + 55, KY[3] - 50], [IX + 245, KY[3] - 50], L(79.8), .3, 'graphite', 5)
arrow([IX + 245, KY[3] - 10], [IX + 55, KY[3] - 10], L(80.1), .3, 'graphite', 5, quiet=True)

# --- p4 81.61–100.47: the strange line: a country exists whether others recognised it or not; sounds like a loophole; remember it, we will come
#     back, and it will turn out to be a trap; meanwhile: who already had such a platform? and how did it end?
SX = 7050
write('Есть там и странная строчка:', 6980, 2720, L(81.65), 1.6, 'graphite', 66)
line([[SX - 40, 2810], [SX - 40, 3010]], L(83.5), .2, 'graphite', 9, quiet=True)
write('страна существует независимо от того,', SX, 2880, L(83.65), 2.5, 'graphite', 64)
write('признали её другие или нет', SX, 2985, L(86.3), 1.8, 'graphite', 64)
wav = [[SX + 10 * i, 3030 + 9 * math.sin(i * .9)] for i in range(0, 118)]
line(wav, L(88.0), .5, 'graphite', 5, quiet=True)
# sounds like a loophole: a fence with a gap
FY0, FY1 = 3200, 3340; posts = [7060, 7180, 7300, 7520, 7640]
for j, x in enumerate(posts): line([[x, FY1], [x, FY0]], L(88.3) + .05 * j, .1, 'graphite', 7, quiet=j > 0)
for yy in (FY0 + 35, FY1 - 40):
    line([[posts[0], yy], [posts[2], yy]], L(88.6), .2, 'graphite', 6, quiet=True)
    line([[posts[3], yy], [posts[4], yy]], L(88.7), .15, 'graphite', 6, quiet=True)
arrow([7410, FY1 + 20], [7410, FY0 - 40], L(89.0), .3, 'blue', 6, quiet=True)
write('лазейка?', 7760, 3300, L(88.4), .7, 'graphite', 64)
magnet(SX - 40, 2800, L(90.0), r=26)
tag('запомни!', 8700, 3150, L(90.4), size=56, rot=-3)
line(bez([8790, 3140], [8800, 3080], [8600, 3045], 10), L(91.0), .3, 'graphite', 5, arrow=True, quiet=True)
write('→ ловушка', 7760, 3420, L(92.9), 1.0, 'red', 64)
# who already had such a platform? how did it end?
platform(7250, 3800, .8, L(94.6), lw=6, quiet=False)
waves(7000, 7500, 3800, L(94.6), .3, step=60, amp=9, quiet=True, seed=21)
write('?', 7400, 3530, L(95.6), .3, 'graphite', 96, align='center')
write('у кого такая платформа уже была?', 7560, 3640, L(95.2), 1.8, 'graphite', 56)
write('и чем всё кончилось?', 7560, 3750, L(98.6), 1.2, 'graphite', 56)

# ===================================================================== camera
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

c = Cam(*fit([300, 500, 2300, 1640]))                                     # the platform
c.to(L(.2), 7.6, z=z_of(c) * 1.03)
c.fit(L(7.9), 1.2, [300, 480, 2850, 1650], b=3)                          # + «отныне это страна», the boat
c.to(L(9.2), 6.3, z=z_of(c) * 1.02)
c.fit(L(15.6), 1.2, [300, 480, 3720, 1650], b=3)                         # + four boxes
c.to(L(16.9), 3.3, z=z_of(c) * 1.02)
c.fit(L(20.3), 1.4, [4500, 470, 6400, 1560], b=2.8)                      # the promise
c.to(L(21.8), 4.6, z=z_of(c) * 1.02)
c.fit(L(26.6), 1.3, [4500, 470, 8000, 1560], b=3)                        # all four examples
c.fit(L(30.5), 1.2, [4500, 480, 8000, 2060], b=3)                       # which tick breaks; not legal advice
c.to(L(31.8), 6.8, z=z_of(c) * 1.02)
c.fit(L(38.85), 2.3, [250, 420, 8100, 2080], b=3)                        # pull-back: the cold-open wall
c.fit(L(41.35), .6, [300, 2600, 3100, 3080], b=2.4)                      # (under the card) rules, timeline
c.to(L(42.0), 2.5, z=z_of(c) * 1.02)
c.fit(L(44.5), 1.3, [300, 2600, 3400, 4060], b=3)                        # the Americas, Montevideo, the treaty
c.to(L(45.9), 13.3, z=z_of(c) * 1.03)
c.fit(L(59.3), 1.3, [3820, 2620, 6650, 3880], b=2.8)                     # the four ticks
c.to(L(60.7), 20.0, z=z_of(c) * 1.03)
c.fit(L(81.15), 1.3, [6900, 2620, 9150, 3900], b=2.8)                    # the strange line
c.to(L(82.5), 17.8, z=z_of(c) * 1.03)
c.fit(L(100.4), 2.1, [250, 420, 9200, 4080], b=3)                        # pull-back: the whole wall of this part

# the whole wall is shifted right by DX so the board's left frame stays out of every resting camera
DX = 700
def shx(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('xy', 'c', 'from', 'to', 'pivot') and isinstance(v, list) and len(v) == 2 and isinstance(v[0], (int, float)): o[k] = [round(v[0] + DX, 1), v[1]]
            elif k == 'points': o[k] = [[round(p[0] + DX, 1), p[1]] if not isinstance(p, str) else p for p in v]
            elif k == 'strokes': [shx(q) for q in v]
for e in E: shx(e)
c.base['x'] += DX
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=91, texScale=.4, ghosts=180, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
