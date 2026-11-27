#!/usr/bin/env python3
"""«Мысленный эксперимент» · Высота зданий · board film, chapters «ДЖИДДА: КИЛОМЕТР» and «МИЛЯ РАЙТА»
(film time 350.23–481.72 s, 131.49 s) in the Engineering Briefing Board style.

TIME MAPPING: the renderer works in local time.  local = film − 350.23  (OFFSET below).
Narration: ru_geo/building_height/film.json (segs, film seconds).  Every time in this file is LOCAL.

The wall is one height chart on a single ground line (GY), 1.2 board px per metre:
  Burj Khalifa (photo cut-out + drawn outline, 828 м со шпилем) · Taipei 101 (drawn) · Jeddah Tower (drawn, ≥ 1 км,
  photo print of the construction, 63rd / 100th floor marks, piles in a section under it) · a lift panel tied to the
  Jeddah observation level by a projection line · Wright's mile-high tower drawn in marker (no image of his drawing),
  his 1954 portrait as a print, tripod plan · the ceiling question and the rope at the far right.
Ink: graphite = names/rules/facts · blue = measurement and numbers · red = only the break / the verdict.
Every frame keeps the bottom 250 px free of drawing (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json + events.json
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
meta = lambda i: json.load(open(os.path.join(OBJ, i + '.json')))
OFFSET = 350.23
DUR = 131.49
BW, BH = 8700, 3900

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=72, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=size, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=26, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def circle(c, r, n=40, a0=-90, turn=1.0):
    return [[c[0] + r * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + r * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def ellipse(c, rx, ry, rot, n=40):
    a = math.radians(rot); out = []
    for i in range(n + 1):
        u = 2 * math.pi * i / n; x, y = rx * math.cos(u), ry * math.sin(u)
        out.append([c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a)])
    return out
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def hatch_in(xl, xr, y0, y1, t, d, step=34, color='grey', lw=4):
    """diagonal hatching inside a tower outline between heights y0 (low) and y1 (high); xl(y)/xr(y) give the walls"""
    strokes = []; ys = []
    y = y0 - 10
    while y > y1 + 20: ys.append(y); y -= step
    for i, y in enumerate(ys):
        a, b = xl(y) + 8, xr(y - 30) - 8
        if b - a < 10: continue
        strokes.append(dict(points=[[round(a, 1), round(y, 1)], [round(b, 1), round(y - 30, 1)]], t=round(t + d * i / len(ys), 3), d=round(max(.05, d / len(ys) * 1.3), 3), lw=lw))
    ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=.6)
def hatch(x0, x1, y, t, d, n=8, color='grey'):
    strokes = []
    for i in range(n):
        x = x0 + 30 + (x1 - x0 - 60) * i / max(1, n - 1)
        strokes.append(dict(points=[[x, y], [x + 40, y - 45]], t=round(t + d * i / n, 3), d=round(d / n * 1.2, 3), lw=5))
    ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=5, color=color, alpha=.7)
def stick(cx, foot, t, h=110, lw=5, cup=False, color='graphite'):
    """a small marker stick figure standing on y = foot"""
    r = h * .12; head = (cx, foot - h + r)
    line(circle(head, r, 18), t, .12, color, lw)
    neck, hip = foot - h + 2 * r, foot - h * .42
    line([[cx, neck], [cx, hip]], t + .12, .12, color, lw)
    line([[cx, hip], [cx - h * .13, foot]], t + .24, .08, color, lw); line([[cx, hip], [cx + h * .13, foot]], t + .32, .08, color, lw)
    line([[cx - h * .2, neck + h * .22], [cx, neck + h * .08], [cx + h * .2, neck + h * .16]], t + .4, .1, color, lw)
    if cup:
        x, y = cx + h * .2, neck + h * .16
        line([[x - 6, y - 16], [x - 3, y + 10], [x + 17, y + 10], [x + 20, y - 16]], t + .5, .12, color, lw - 1)
        line(arc((x + 24, y - 3), 8, 7, -90, 90, 10), t + .62, .06, color, lw - 2)
        for i, dx in enumerate((0, 10)):
            line([[x + 2 + dx, y - 24], [x + 6 + dx, y - 36], [x + 1 + dx, y - 48]], t + .7 + i * .06, .1, 'grey', 3)

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
    def fit(s, t, d, box, zmax=9, roll=None, a=2, b=2.6, ax='c'):
        x, y, z = fit(box, zmax, ax); return s.to(t, d, x, y, z, roll, a, b)
    def frame(s, t, d, left, z, bottom=2935, a=2, b=2.6):
        """frame with its left edge at board x = left and board y = bottom on the band's lower edge (screen y 800)"""
        return s.to(t, d, left + 960 / z, bottom - (SAFE_Y1 - 540) / z, z, None, a, b)
    def shake(s, t, amp=5, f=9, k=7, dir=(0, 1)):
        s.shakes.append(dict(t=t, amp=amp, f=f, k=k, dir=list(dir)))
    def json(s): return dict(x=s.base['x'], y=s.base['y'], z=s.base['z'], roll=0, moves=s.moves, shakes=s.shakes)
def z_of(c): return math.exp(c.cur['lz'])
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
def fit(box, zmax=9, ax='c'):
    """camera that shows box inside the drawing band; ax 'l' / 'r' pins the box's left / right edge to the frame margin
    (when the band's height limits the zoom, the frame is wider than the box: say on which side the extra goes)"""
    x0, y0, x1, y1 = box
    z = min(zmax, (1920 - 2 * SAFE_X) / (x1 - x0), (SAFE_Y1 - SAFE_Y0) / (y1 - y0))
    cy = (y0 + y1) / 2 + (540 - (SAFE_Y0 + SAFE_Y1) / 2) / z
    cx = (x0 + x1) / 2 if ax == 'c' else x0 + (960 - SAFE_X) / z if ax == 'l' else x1 - (960 - SAFE_X) / z
    return cx, cy, z

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, t0, t1, t2):
    CARDS.append(dict(str=s, t0=t0, t1=t1, t2=t2))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ДЖИДДА: КИЛОМЕТР', 0.05, 0.80, 1.0)                 # film 350.23
FC = 431.96 - OFFSET                                            # 81.73
type_card('МИЛЯ РАЙТА', FC + .05, FC + .80, FC + 1.0)           # film 431.96

# ===================================================================== the chart
GY, K = 2900, 1.2                    # ground line, board px per metre
H = lambda m: GY - m * K
KM1, KM15 = H(1000), H(1500)         # 1700, 1100

# ---------------------------------------------------------------- P1 1.00–15.45 Burj Khalifa, 828 m, Taipei
BURJ_H = 850; bm = meta('burj')
el(type='print', id='burj', src='burj', xy=[430, GY - BURJ_H / 2], h=BURJ_H, z=10, rot=-2.5,
   arrive=dict(t=1.05, kind='drop', d=.55, lift=260, spin=1.6, land=.6))
ev(1.38, 'land', .2, size='big')
magnet(452, 2230, 1.5, r=24); magnet(398, 2780, 1.62, r=24)
line([[120, GY], [1950, GY]], 1.1, .5, lw=10)
tag('Бурдж-Халифа', 120, 1880, 1.75, size=52, rot=-1.5)
write('открылась: январь 2010', 110, 1990, 2.3, 1.9, 'graphite', 50)
# the drawn Burj, to scale (top of the spire = 828 m)
BX = 1150; top = H(828)
fr = lambda f: GY - (GY - top) * f
prof = [(150, GY), (142, fr(.2)), (112, fr(.2)), (104, fr(.38)), (78, fr(.38)), (70, fr(.55)), (46, fr(.55)), (38, fr(.7)), (20, fr(.7)), (14, fr(.8)), (0, top)]
line([[BX - w, y] for w, y in prof] + [[BX + w, y] for w, y in reversed(prof[:-1])], 4.65, 1.4, lw=8)
ink('dim', 5.6, 1.1, 'blue', **{'from': [945, GY], 'to': [945, top]}, lw=8, ea=1.6, eb=2.4)
ink('count', 6.3, 1.4, 'blue', text='{0} м (со шпилем)', to=[828], xy=[1260, 1965], size=74)
# Taipei 101, drawn (no number on screen)
TX = 1660; tt = H(508); tb = GY - 60
tp = [[TX - 95, GY], [TX - 95, tb]]
seg_h = (tb - (tt + 110)) / 8
for i in range(8):
    y0 = tb - i * seg_h; y1 = y0 - seg_h
    tp += [[TX - 62, y0], [TX - 82, y1]]
tp += [[TX - 30, tt + 110], [TX - 12, tt + 60], [TX, tt]]
line(tp + [[2 * TX - x, y] for x, y in reversed(tp[:-1])], 7.25, 1.3, lw=7)
line([[BX + 40, tt], [TX - 40, tt]], 8.4, .5, 'grey', 4, dash=[14, 12])
tag('Тайбэй', 1540, 2180, 9.35, size=48, rot=2)
write('прежний рекордсмен', 1480, 2105, 9.85, 1.3, 'graphite', 48)
write('рекорд до сих пор', 1090, 1800, 11.0, 1.3, 'graphite', 62, align='right')
arrow([BX, top - 25], [BX, 1790], 13.1, .45, 'blue', 6, dash=[16, 12])
write('?', 1195, 1820, 13.55, .3, 'graphite', 110)
write('желающие есть', 1290, 1790, 13.8, 1.2, 'graphite', 56)

# ---------------------------------------------------------------- P2 16.00–31.83 Jeddah: ≥ 1 km, height not named, 2018 stop at 63
JX = 2500
jw = lambda y: 175 - 145 * ((GY - y) / (GY - KM1)) ** .85     # half-width of the drawn Jeddah tower at height y
jl = lambda y: JX - jw(min(GY, max(KM1, y))); jr = lambda y: JX + jw(min(GY, max(KM1, y)))
ys = [GY - i * (GY - KM1) / 16 for i in range(17)]
line([[1950, GY], [2950, GY]], 16.05, .4, lw=10)
line([[jl(y), y] for y in ys] + [[jr(y), y] for y in reversed(ys)], 16.3, 1.6, lw=8)
line([[1300, KM1], [2950, KM1]], 17.9, 1.0, 'blue', 6, dash=[24, 18])
write('не ниже 1 км', 2380, 1655, 18.3, 1.1, 'blue', 80, align='right')
line([[jl(KM1), KM1], [JX - 8, KM1 - 150], [JX, KM1 - 205]], 19.4, .4, lw=7, dash=[18, 14])
line([[jr(KM1), KM1], [JX + 8, KM1 - 150], [JX, KM1 - 205]], 19.5, .4, lw=7, dash=[18, 14])
write('?', 2530, 1460, 20.4, .3, 'graphite', 130)
write('высоту не называют', 2390, 1805, 20.5, 1.3, 'graphite', 64, align='right')
write('так высоко — ещё никто', 2440, 1530, 21.3, 1.6, 'graphite', 72, align='right')
tag('Джидда', 2010, 1385, 16.9, size=48, rot=-1.5)
JW = 420
el(type='print', id='jeddah', src='print_jeddah', xy=[4235, 2525], w=JW, z=8, rot=1.8, arrive=dict(t=23.8, kind='drop', d=.5, lift=220, spin=1.3, land=.6))
ev(24.1, 'land', .2, size='mid')
magnet(4080, 2240, 24.25, r=22); magnet(4385, 2250, 24.37, r=22)
F63, F100 = 2598, 2420                                           # schematic floor marks on the drawing
hatch_in(jl, jr, GY, F63, 26.0, .9)
line([[jl(F63) - 30, F63], [2770, F63]], 26.5, .35, 'red', 8)
write('2018: стоп, 63-й этаж', 2800, 2622, 26.85, 1.4, 'red', 60)
write('несколько лет — недостроена', 2800, 2712, 28.75, 1.9, 'graphite', 54)

# ---------------------------------------------------------------- P3 32.38–45.57 2025 restart, past the 100th floor, 2028 plan
write('2025: снова строят', 2800, 2522, 32.5, 1.6, 'graphite', 58)
hatch_in(jl, jr, F63, F100, 34.6, .7, color='blue', lw=4)
line([[jl(F100) - 30, F100], [2770, F100]], 36.5, .3, 'blue', 7)
write('выше 100-го этажа', 2800, 2442, 36.8, 1.5, 'blue', 60)
tag('план: 2028', 2830, 2262, 39.1, size=54, rot=-1, moves=[dict(t=42.75, d=.55, dx=150, dr=3, a=2, b=3), dict(t=43.9, d=.55, dx=150, dr=-2, a=2, b=3)])
ev(42.75, 'slide', .5); ev(43.9, 'slide', .5)
write('сроки двигаются', 3600, 2280, 44.5, 1.1, 'graphite', 48)

# ---------------------------------------------------------------- P4 46.30–63.07 lifts: up to 10 m/s, 600+ m, a bit over a minute
OBS = H(640)                                                     # 2132: the observation level used for the lift panel
line([[2950, GY], [5960, GY]], 46.3, .6, lw=10)
line([[jr(OBS) + 10, OBS], [4870, OBS]], 46.35, 1.3, 'blue', 5, dash=[20, 16])
line([[4870, OBS], [5180, OBS]], 47.55, .25, lw=9); hatch(4870, 5180, OBS, 47.7, .2, 5)
write('смотровая площадка', 4880, OBS - 40, 46.9, 1.3, 'graphite', 52)
SX0, SX1 = 4985, 5065
line([[SX0, OBS + 5], [SX0, GY]], 47.9, .4, 'grey', 5); line([[SX1, OBS + 5], [SX1, GY]], 48.0, .4, 'grey', 5)
CAB = (2790, 2865)
line([[SX0 + 8, CAB[0]], [SX1 - 8, CAB[0]], [SX1 - 8, CAB[1]], [SX0 + 8, CAB[1]], [SX0 + 8, CAB[0]]], 48.3, .3, lw=6)
line([[(SX0 + SX1) / 2, OBS + 8], [(SX0 + SX1) / 2, CAB[0]]], 48.55, .5, lw=6)
ink('count', 48.9, 1.7, 'blue', text='до {0} м/с', to=[10], xy=[5150, 2300], size=92)
arrow([5100, 2560], [5100, 2400], 49.2, .3, 'blue', 6)
ink('dim', 51.85, 1.0, 'blue', **{'from': [4905, GY], 'to': [4905, OBS]}, lw=7)
write('600+ м', 4860, 2560, 52.5, .8, 'blue', 76, align='right')
line(circle((5240, 2625), 44, 40), 54.1, .45, lw=6)
line([[5240, 2625], [5240, 2593]], 54.6, .1, lw=5); line([[5240, 2625], [5266, 2636]], 54.7, .1, lw=5)
write('чуть больше минуты', 5310, 2650, 54.8, 1.3, 'blue', 52)
stick(5700, GY - 4, 56.2, h=118, cup=True)
write('быстрее кофе', 5310, 2770, 57.2, 1.1, 'graphite', 56)
el(type='card', id='src', xy=[5480, 1930], w=660, h=160, rot=-1.2, z=9, magnetR=18,
   magnets=[[-300, -56], [300, -56]],
   lines=[dict(text='по описаниям проекта', font='sans', size=52, x=60, y=-2, color='graphite', weight=600),
          dict(text='не замер', font='sans', size=52, x=60, y=60, color='graphite', weight=700)],
   arrive=dict(t=59.3, kind='drop', d=.45, lift=180, spin=1.0, land=.6))
ev(59.55, 'land', .2, size='small')

# ---------------------------------------------------------------- P5 63.62–79.44 piles, the rule, and the rope that does not grow
PX0, PX1, PY0, PY1 = 2250, 2750, 2935, 3560
line([[PX0, PY0], [PX1, PY0], [PX1, PY1], [PX0, PY1], [PX0, PY0]], 63.7, .7, 'grey', 4, dash=[16, 12])
depths = [3300, 3420, 3360, 3500, 3380, 3530, 3440, 3330, 3480, 3400, 3290]
for i, dpt in enumerate(depths):
    x = 2350 + i * 30
    line([[x, GY + 8], [x, dpt]], 64.0 + i * .14, .22, 'graphite', 6)
ink('count', 64.4, 1.6, 'blue', text='≈ {0} свай', to=[270], xy=[2200, 3090], size=86, align='right')
ink('dim', 66.4, .9, 'blue', **{'from': [2705, GY + 10], 'to': [2705, 3530]}, lw=6)
write('самые длинные ≈ 110 м', 2200, 3215, 67.0, 1.6, 'blue', 62, align='right')
write('выше башня → глубже корни', 2200, 3375, 69.25, 1.9, 'graphite', 68, align='right')
magnet(1262, 3352, 71.6, r=22)
arrow([JX, 2840], [JX, 2280], 74.2, .5, 'blue', 7)
arrow([2228, 2960], [2228, 3510], 74.7, .5, 'blue', 7)
line([[5115, OBS + 20], [5135, OBS + 20], [5135, CAB[0] - 8], [5115, CAB[0] - 8]], 75.9, .8, 'blue', 5)
write('а трос не растёт', 5150, 2510, 77.9, 1.1, 'red', 66)

# ---------------------------------------------------------------- P6 82.73–98.05 Wright's mile: idea not new, the portrait, the mile, nuclear lifts, never built
line([[2950, KM1], [7500, KM1]], 82.9, 3.0, 'blue', 6, dash=[24, 18], ea=1.6, eb=2.2)
WX, WY, WW = 6360, 1640, 420
el(type='print', id='wright', src='print_wright', xy=[WX, WY], w=WW, z=8, rot=-2, arrive=dict(t=86.2, kind='drop', d=.5, lift=220, spin=1.5, land=.6))
ev(86.5, 'land', .2, size='mid')
magnet(WX - 150, WY - 255, 86.65, r=22); magnet(WX + 150, WY - 262, 86.77, r=22)
tag('Фрэнк Ллойд Райт', 6140, 2030, 87.2, size=50, rot=-1.5)
write('архитектор, США', 6110, 2150, 87.9, 1.0, 'graphite', 54)
write('середина XX века', 6110, 2235, 88.7, 1.0, 'graphite', 54)
MX, MT = 7250, H(1609)
mw = lambda y: 120 * ((y - MT) / (GY - MT)) ** .8
my = [MT + (GY - MT) * i / 20 for i in range(21)]
line([[5960, GY], [8450, GY]], 89.4, .5, lw=10)
line([[MX - mw(y), y] for y in reversed(my)] + [[MX + mw(y), y] for y in my[1:]], 89.75, 1.6, lw=7, dash=[22, 14])
write('башня в милю', 6600, 1040, 90.6, 1.0, 'graphite', 80)
line([[MX, GY - 10], [MX, 1350]], 91.35, .7, 'grey', 4)
for i, rot in enumerate((0, 60, 120)): line(ellipse((6520, 2370), 58, 20, rot, 30), 91.5 + i * .15, .15, lw=4)
line(circle((6520, 2370), 7, 10), 91.95, .05, lw=6)
write('лифты на ядерной тяге', 7120, 2340, 91.6, 1.4, 'graphite', 50, align='right')
write('(так писали о проекте)', 7120, 2410, 93.3, 1.1, 'graphite', 42, align='right')
write('не построена', 7120, 2530, 94.8, .9, 'graphite', 56, align='right')
magnet(MX, 2700, 96.6, r=24)
write('рисунок остался', 7120, 2610, 96.7, 1.0, 'graphite', 56, align='right')

# ---------------------------------------------------------------- P7 98.75–113.67 a mile > 1.5 km; tripod; nothing to test it with
line([[1300, KM15], [7500, KM15]], 98.85, 1.6, 'blue', 6, dash=[24, 18])
write('1,5 км', 1270, 1135, 99.2, .6, 'blue', 120, align='right')
ink('dim', 98.9, 1.4, 'blue', **{'from': [7440, GY], 'to': [7440, MT]}, lw=8, ea=1.6, eb=2.4)
write('миля > 1,5 км', 7500, 1480, 99.6, 1.1, 'blue', 130)
# sway: arcs either side of the top, then the tripod plan
line(arc((MX, 2150), 300, 300, -110, -98, 8), 101.0, .3, 'blue', 6, arrow=True)
line(arc((MX, 2150), 300, 300, -70, -82, 8), 101.3, .3, 'blue', 6, arrow=True)
write('меньше качается', 7520, 1985, 102.6, 1.3, 'graphite', 64)
TC = (7880, 2290)
line(circle(TC, 150, 40), 104.9, .4, 'grey', 4, dash=[12, 10])
for i, a in enumerate((-90, 30, 150)):
    line([TC, [TC[0] + 130 * math.cos(math.radians(a)), TC[1] + 130 * math.sin(math.radians(a))]], 105.25 + i * .15, .15, lw=9)
write('треножник', 7660, 2560, 105.6, .9, 'graphite', 72)
write('проверить нечем:', 6090, 2720, 107.8, 1.2, 'graphite', 54)
tag('лифты', 6140, 2830, 109.7, size=46, rot=-1.5, strike=dict(t=110.3, d=.2, color='red')); ev(110.3, 'strike', .2)
tag('тросы', 6480, 2830, 110.7, size=46, rot=1.5, strike=dict(t=111.3, d=.2, color='red')); ev(111.3, 'strike', .2)

# ---------------------------------------------------------------- P8 114.40–129.34 where is the ceiling? there is one; the rope again
stick(8000, GY - 4, 114.5, h=118)
arrow([8095, 2700], [8095, 2840], 114.9, .35, 'blue', 5)
tag('Тимур', 7600, 2845, 115.3, size=44, rot=-2)
write('где потолок?', 7520, 2725, 117.1, 1.0, 'graphite', 76)
CEIL = 720
line([[700, CEIL], [8450, CEIL]], 118.6, 2.2, 'red', 7, dash=[30, 20], ea=1.6, eb=2.2)
write('ни лифт, ни сталь?', 5300, CEIL + 120, 121.4, 1.2, 'graphite', 96)
el(type='stamp', text='ЕСТЬ', xy=[7990, CEIL + 210], size=120, rot=-6, t=123.5); ev(123.5, 'stamp', .1)
RX = 8250
line([[RX, GY - 8], [RX, 330]], 123.85, 1.8, 'graphite', 9, ea=1.4, eb=1.8)
tag('трос', 8300, 1760, 125.0, size=64, rot=3)
write('такого ещё не делали', 8200, 1210, 126.0, 1.7, 'graphite', 84, align='right')

# ===================================================================== camera (one continuous camera; only the cards hide it)
c = Cam(*fit([110, 1790, 1400, 3080]))
c.fit(1.0, 3.0, [90, 1790, 1600, 3090], b=3)                       # the photo lands, its tag, the opening date
c.fit(4.4, 1.8, [120, 1700, 2000, 3080], a=2, b=3)                  # the drawn Burj, 828 m, Taipei
c.to(6.4, 3.4, z=z_of(c) * 1.03)
c.fit(10.7, 1.6, [90, 1640, 2250, 3090], a=2, b=2.8)               # the record holds; challengers
c.fit(15.6, 2.4, [60, 1300, 3480, 2935], a=2, b=3, ax='l')          # Jeddah rises over 1 km
c.to(20.2, 3.0, z=z_of(c) * 1.02)
c.fit(23.4, 1.6, [2300, 2000, 4550, 2935], a=2, b=2.8)              # the photo of the building site
c.fit(25.8, 1.5, [2250, 2120, 4550, 2930], zmax=1.0, a=2, b=3)      # the stop at the 63rd floor
c.to(27.4, 4.0, z=z_of(c) * 1.03)
c.fit(32.1, 1.5, [2250, 2110, 4550, 2930], zmax=1.0, a=2, b=3)      # 2025, past the 100th floor
c.fit(38.8, 1.4, [2260, 2100, 4560, 2930], zmax=1.0, a=2, b=3)      # the 2028 plan slides
c.to(40.3, 5.6, z=z_of(c) * 1.02)
c.fit(46.1, 1.9, [2560, 1950, 5400, 2930], a=1.8, b=3, ax='l')              # ride the projection line to the lift panel
c.fit(48.4, 1.6, [4560, 1990, 6100, 2930], a=2, b=3, ax='l')
c.to(50.1, 6.0, z=z_of(c) * 1.025)
c.fit(58.9, 1.4, [4560, 1830, 6150, 2930], a=2, b=3, ax='l')                # the source card
c.fit(63.3, 1.9, [1250, 2850, 2900, 3600], zmax=1.15, a=2, b=3)     # down to the piles
c.to(65.3, 3.6, z=z_of(c) * 1.02)
c.fit(69.0, 1.3, [1250, 2850, 2900, 3600], zmax=1.15, a=2, b=3)     # the rule
c.fit(73.9, 1.4, [1250, 2150, 2950, 3600], a=2, b=3)                # tower up, roots down
c.fit(75.4, 1.8, [4560, 1830, 6150, 2930], a=2, b=3, ax='l')                # the rope: it does not grow
c.to(77.3, 2.2, z=z_of(c) * 1.02)
c.fit(79.5, 2.2, [80, 1350, 6100, 3600], a=1.8, b=3)                # chapter pull-back: the Jeddah wall
c.frame(81.9, .7, 2775, .46)                           # (under the card) onto the 1 km line
c.fit(82.85, 3.3, [6060, 1250, 7980, 2935], a=1.8, b=2.6, ax='l')           # ride the line to Wright
c.fit(86.3, 2.6, [6060, 1250, 7700, 2330], a=2, b=3, ax='l')
c.fit(89.3, 1.8, [6060, 950, 8200, 2930], a=2, b=3, ax='l')                 # the mile tower, nuclear lifts, never built
c.fit(91.4, 2.3, [6060, 1900, 7700, 2930], a=2, b=3, ax='l')
c.to(94.0, 4.0, z=z_of(c) * 1.025)
c.fit(98.6, 2.0, [100, 950, 8600, 3620], a=1.8, b=3)                # the mile against Burj and Jeddah
c.to(100.6, .6, z=z_of(c) * 1.005)
c.fit(101.0, 1.7, [6800, 1760, 8640, 2935], a=2, b=3, ax='r')               # sway, tripod
c.to(102.7, 4.0, z=z_of(c) * 1.03)
c.fit(107.4, 1.6, [6060, 1950, 7800, 2930], a=2, b=3, ax='l')               # nothing to test it with
c.to(109.0, 4.5, z=z_of(c) * 1.02)
c.frame(114.1, 1.6, 7140, 1.215, bottom=2930, a=2, b=3)               # Timur: where is the ceiling?
c.frame(118.4, 2.4, 2765, 1920 / (8725 - 2765), a=1.8, b=3)              # rise to the ceiling
c.to(120.8, 5.6, y=c.cur['y'] - 12)                # the rope, all the way up
c.fit(126.6, 3.4, [60, 300, 8650, 3600], a=1.8, b=3.2)              # the whole wall
c.to(130.0, 1.49, z=z_of(c) * 1.006)

scene = dict(dur=DUR, board=dict(w=BW, h=BH, seed=41, texScale=.4, ghosts=150, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=22000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=sorted(EV, key=lambda e: e['t'])), open(os.path.join(FILM, 'events.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
