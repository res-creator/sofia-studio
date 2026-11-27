#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размер Вселенной · board film, PART 1: film time 0.00–127.70
(cold open «ХОЛОДНЫЙ СТАРТ» at 0 and chapter «ШКАЛА СВЕТА» at 54.67).
TIME MAPPING: this part starts the film, so the offset is T0 = 0.00:  local = film − 0.00  (local 0 … 127.70).
Narration: ru_geo/universe_size/film.json. Film 89.10–105.60 (Pale Blue Dot, 14 Feb 1990) is covered by the Archive
Light Table clip: nothing important is drawn there, the camera only drifts slowly to row D, which starts at 105.60.
Ink meanings: graphite = names/rules/facts · blue = measurement and numbers · red = only the one mark to notice.
Every frame keeps the bottom 250 px free (subtitles): cameras are fitted to the screen band y 50…800.
Wall (7400 × 4750 board px), read in four rows:
  A  y  150–1650  cold open: Earth ⇄ Voyager 1 («привет», сутки туда, сутки обратно = двое суток), the house and its threshold;
                  right of it the plan: сутки пути света, the ruler «до края видимого», «какого размера вся Вселенная?»
  B  y 1750–2750  Voyager → the nearest star: 17 км/с, ≈ 75 000 лет, «наша прикидка»
  C  y 2850–3950  ШКАЛА СВЕТА: Земля → Луна (1 с) → Солнце (8 мин 20 с) → Нептун (≈ 4 часа) → Вояджер (сутки, 49 лет)
  D  y 4000–4700  арифметика: в 17–18 тысяч раз; сутки света = 49 лет зонда; антенны; вопрос сутки, ответ сутки, ждать
    python3 scenes/_gen_film.py      → scenes/film.json, events.json
"""
T0 = 0.00
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
def meta(i):
    m = json.load(open(os.path.join(OBJ, i + '.json'))); return m.get('size') or [m['w'], m['h']]
DUR = 127.70
BW, BH = 7400, 4750

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
def circle(c, r, n=40, a0=-90, turn=1.0):
    return [[c[0] + r * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + r * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def pulse(p0, p1, t, d, r=20):
    """the signal: a blue magnet snaps on at p0, rides the line drawn over the same time, pops off at p1"""
    ev(t, 'clack', .1); ev(t + d, 'pop', .1)
    return el(type='magnet', xy=list(p0), r=r, color='blue', z=22, arrive=dict(t=round(t - .12, 3), kind='snap', d=.25, lift=60),
              moves=[dict(t=round(t, 3), d=round(d, 3), dx=p1[0] - p0[0], dy=p1[1] - p0[1], a=2, b=2)],
              leave=dict(t=round(t + d + .05, 3), kind='pop', d=.35, lift=700, to=[0, -60]))
def signal(p0, p1, t, d, dash=True):
    line([p0, p1], t, d, 'blue', 8, arrow=True, dash=[30, 22] if dash else None, ea=2, eb=2)
    pulse(p0, p1, t, d)
def star(c, r, t, d, color='graphite', lw=9):
    pts = []
    for i in range(11):
        a = math.radians(-90 + 36 * i); rr = r if i % 2 == 0 else r * .42
        pts.append([c[0] + rr * math.cos(a), c[1] + rr * math.sin(a)])
    line(pts, t, d, color, lw, ea=1.6, eb=2)
    for i, a in enumerate((-18, 54, 126, 198, 270)):
        a = math.radians(a + 36 - 90 + 18)
        line([[c[0] + r * 1.18 * math.cos(a), c[1] + r * 1.18 * math.sin(a)], [c[0] + r * 1.45 * math.cos(a), c[1] + r * 1.45 * math.sin(a)]], t + d + .06 * i, .1, color, lw * .6)
def wave(x0, x1, y, amp, t, d, color='blue', lw=7, n=6):
    pts = [[x0 + (x1 - x0) * i / 120, y + amp * math.sin(2 * math.pi * n * i / 120)] for i in range(121)]
    return line(pts, t, d, color, lw, ea=1.4, eb=1.6)
def hatch_strokes(pts, t, d, color='grey', lw=5):
    st = [dict(points=p, t=round(t + d * i / len(pts), 3), d=round(d / len(pts) * 1.3, 3), lw=lw) for i, p in enumerate(pts)]
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=st, lw=lw, color=color, alpha=.7)

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
def type_card(s, t0, t1, t2):
    CARDS.append(dict(str=s, t0=t0, t1=t1, t2=t2))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ХОЛОДНЫЙ СТАРТ', 0.05, 0.80, 1.00)
type_card('ШКАЛА СВЕТА', 54.72, 55.47, 55.67)

# ===================================================================== A. cold open 1.00–21.24: «привет» Вояджеру, двое суток
EC, ED = (760, 900), 520                     # Earth (cut-out, NASA Blue Marble)
VC, VW = (2800, 880), 600                    # Voyager 1 (print of the NASA picture)
printx('earth', 'earth', EC[0], EC[1], 1.0, w=ED, z=10, size='big')
tag('Земля', 600, 1240, 1.55, size=58, rot=-2)
vm = meta('print_voyager'); VH = VW * vm[1] / vm[0]
printx('voyager', 'print_voyager', VC[0], VC[1], 1.85, w=VW, rot=-2.5, size='big')
magnet(VC[0] - 230, VC[1] - VH / 2 + 25, 2.25, r=22); magnet(VC[0] + 230, VC[1] - VH / 2 + 18, 2.37, r=22)
tag('Вояджер-1', 2560, 545, 2.5, size=58, rot=1.5)
# «привет», ответ придёт только через двое суток (3.21–6.70): the signal out, the reply back
write('привет!', 1040, 690, 3.25, .65, 'graphite', 84)
OUT0, OUT1 = (1040, 790), (2470, 790)
signal(OUT0, OUT1, 3.95, 1.0)
count('{0} сутки', [1], 1755, 750, 4.45, .55, 'blue', 70, align='center')
BK0, BK1 = (2470, 1010), (1040, 1010)
signal(BK0, BK1, 5.05, .85)
count('{0} сутки', [1], 1755, 1095, 5.55, .4, 'blue', 70, align='center')
write('двое суток', 1755, 1340, 5.9, .75, 'blue', 140, align='center')
ink('ring', 6.65, .6, 'red', c=[1755, 1295], r=[400, 105], lw=8)
# Это самый далёкий предмет, который мы построили (6.70–9.73)
write('самый далёкий предмет,', 3200, 760, 6.85, 1.3, 'graphite', 66)
write('который мы построили', 3200, 850, 8.4, 1.2, 'graphite', 66)
# 18 ноября 2026 года радиосигнал до него шёл около суток (9.73–15.46)
write('18 ноября 2026:', 3200, 1000, 9.8, 1.5, 'graphite', 66)
write('сигнал идёт ≈ сутки', 3200, 1090, 12.3, 1.7, 'blue', 66)
line([[1645, 768], [1865, 768]], 14.2, .35, 'blue', 6)                     # the out-leg «1 сутки» underlined
# Зонд стартовал в 1977 (15.46–19.12)
lm = meta('print_launch'); LW = 290; LH = LW * lm[1] / lm[0]
printx('launch', 'print_launch', 3360, 1380, 15.55, w=LW, rot=2)
magnet(3360, 1380 - LH / 2 + 20, 15.95, r=20)
write('старт', 3560, 1330, 16.2, .6, 'graphite', 66)
write('1977', 3560, 1450, 17.3, .7, 'blue', 100)
# И он едва вышел за порог дома (19.12–21.24): a house round Earth; Voyager just out of the door
house = [[2400, 640], [2400, 500], [1365, 175], [330, 500], [330, 1480], [2400, 1480], [2400, 1180]]
line(house, 19.2, 1.35, 'graphite', 9, ea=1.5, eb=1.8)
line([[2350, 1180], [2470, 1180]], 20.5, .2, 'graphite', 16)                 # the threshold
write('порог дома', 2470, 1585, 20.55, .7, 'graphite', 70)
arrow([2560, 1520], [2445, 1215], 21.0, .3, 'graphite', 6)

# ===================================================================== A'. the plan 21.95–35.72 (right of the house)
write('сутки пути света:', 4150, 520, 22.0, 1.4, 'graphite', 96)
write('далеко или близко?', 4150, 680, 23.6, 1.6, 'graphite', 84)
el(type='ruler', id='ruler', **{'from': [4150, 930], 'to': [5450, 930]}, w=52, z=12, inset=50, magnetR=22,
   arrive=dict(t=25.45, kind='drop', d=.45, lift=170, spin=.6, land=.6))
ev(25.75, 'ruler', .4)
write('измерим зондом всё', 4150, 1090, 26.0, 1.3, 'graphite', 64)
arrow([5500, 930], [6880, 930], 27.5, 1.4, 'blue', 8, dash=[30, 22])
line([[6960, 720], [6930, 800], [6975, 880], [6935, 960], [6970, 1040], [6940, 1120]], 28.75, .5, 'grey', 7)
write('до края видимого', 5560, 860, 28.9, 1.3, 'blue', 72)
tag('в конце', 4200, 1225, 30.25, size=54, rot=-1.5)
write('какого размера', 4150, 1400, 31.3, 1.1, 'graphite', 100)
write('вся Вселенная', 4150, 1530, 32.45, 1.1, 'graphite', 100)
write('?', 4920, 1540, 33.75, .4, 'red', 260)

# ===================================================================== B. the nearest star 36.27–52.35
VB = (4080, 2160)
pv = printx('voyager_b', 'print_voyager', VB[0], VB[1], 36.4, w=330, rot=1.5)
magnet(VB[0] + 120, VB[1] - 115, 36.8, r=18)
write('до ближайшей звезды', 4400, 1950, 37.0, 1.4, 'graphite', 90)
SC = (6820, 2160)
star(SC, 115, 37.75, .8)
# 17 км/с (38.91–42.95)
for i, y in enumerate((2100, 2160, 2220)):
    line([[3830 - 40 * (i % 2), y], [3700 - 40 * (i % 2), y]], 39.1 + .1 * i, .18, 'graphite', 6)
count('≈ {0} км/с', [17], 4080, 2420, 40.4, 1.6, 'blue', 92, align='center')
# дорога заняла бы порядка 75 000 лет (42.95–48.37): the path drawn, the camera rides it
signal((4300, 2160), (6640, 2160), 43.05, 3.6)
count('≈ {0} 000 лет', [75], 5600, 2440, 45.2, 2.4, 'blue', 110, align='center')
# наша прикидка по школьной формуле (48.37–52.35)
tag('наша прикидка', 4530, 2620, 48.5, size=54, rot=-1)
write('время = путь ÷ скорость', 5120, 2645, 49.6, 1.8, 'graphite', 66)

# ===================================================================== C. ШКАЛА СВЕТА 55.67–88.53
AY = 3490                                    # the light axis (not to scale)
printx('earth_c', 'earth', 520, 3330, 55.75, w=240, z=10)
write('меряем светом', 280, 2990, 56.05, 1.2, 'graphite', 90)
write('быстрее него — ничто', 280, 3100, 58.1, 1.5, 'graphite', 62)
# Радиосигнал это тот же свет, только невидимый (60.05–63.52)
wave(1150, 1720, 2975, 32, 60.1, .9)
write('радио = свет', 1790, 3000, 60.95, 1.0, 'graphite', 74)
write('только невидимый', 1790, 3095, 62.05, 1.0, 'graphite', 56)
def tick(x, t): line([[x, AY - 18], [x, AY + 18]], t, .1, 'blue', 6)
# Луна (63.52–66.49)
arrow([660, AY], [1480, AY], 63.6, .55, 'blue', 7)
line(circle((1500, 3355), 52, 36), 64.05, .35, 'graphite', 7)
line(circle((1482, 3340), 11, 14), 64.4, .08, 'grey', 4); line(circle((1520, 3375), 8, 12), 64.48, .08, 'grey', 4)
write('Луна', 1500, 3262, 64.4, .4, 'graphite', 60, align='center'); tick(1500, 64.5)
write('чуть больше 1 с', 1500, 3590, 64.7, 1.0, 'blue', 62, align='center')
# Солнце: 8 мин 20 с (66.49–69.70)
arrow([1520, AY], [2680, AY], 66.5, .55, 'blue', 7)
sm = meta('print_sun'); SW = 290; SH = SW * sm[1] / sm[0]
printx('sun', 'print_sun', 2700, 3305, 66.75, w=SW, rot=-1.5)
magnet(2700, 3305 - SH / 2 + 20, 67.1, r=20)
write('Солнце', 2700, 3120, 67.2, .5, 'graphite', 60, align='center'); tick(2700, 67.0)
count('{0} мин {1} с', [8, 20], 2700, 3600, 67.6, 1.8, 'blue', 82, align='center')
# Солнце вы видите с опозданием на эти 8 минут (69.70–73.07)
EYE = (860, 3740)
line(arc(EYE, 70, 38, 180, 360), 69.8, .2, 'graphite', 6); line(arc(EYE, 70, 38, 0, 180), 69.98, .2, 'graphite', 6)
line(circle(EYE, 17, 16), 70.15, .1, 'graphite', 6)
arrow([2540, 3660], [960, 3735], 70.3, .8, 'graphite', 6)
write('видим с опозданием', 1000, 3860, 70.9, 1.1, 'graphite', 62)
write('на 8 минут', 1660, 3860, 72.0, .6, 'blue', 62)
# Нептун ≈ 4 часа (73.77–78.92)
arrow([2720, AY], [4280, AY], 73.8, .6, 'blue', 7)
printx('neptune', 'neptune', 4300, 3340, 74.0, w=220, z=10)
write('Нептун', 4300, 3200, 74.3, .5, 'graphite', 62, align='center'); tick(4300, 74.4)
tag('самая далёкая планета', 4490, 3285, 74.9, size=42, rot=-1.5, amp=8)
count('≈ {0} часа', [4], 4300, 3600, 76.6, 1.3, 'blue', 82, align='center')
# Вояджер за 49 лет добрался до отметки в сутки (78.92–83.19)
arrow([4320, AY], [6280, AY], 79.0, 1.4, 'blue', 7, ea=1.6, eb=2.2)
printx('voyager_c', 'print_voyager', 6300, 3320, 79.3, w=280, rot=-2)
write('Вояджер-1', 6300, 3165, 79.7, .6, 'graphite', 58, align='center'); tick(6300, 80.4)
count('за {0} лет', [49], 5330, 3420, 79.9, 1.8, 'blue', 78, align='center')
write('сутки', 6300, 3610, 82.2, .55, 'blue', 110, align='center')
# Для нас это почти целая жизнь, для света один оборот Земли (83.19–88.53)
write('для нас — почти целая жизнь', 4450, 3770, 83.3, 1.6, 'graphite', 62)
write('для света — один оборот Земли', 4450, 3870, 85.4, 1.8, 'graphite', 62)
RC = (6500, 3810)
line(circle(RC, 48, 30), 86.3, .3, 'graphite', 6)
line([[RC[0], RC[1] - 62], [RC[0], RC[1] + 62]], 86.6, .15, 'grey', 4)
line(arc(RC, 92, 34, 200, 520, 40), 86.8, .8, 'blue', 6, arrow=True)

# ===================================================================== (89.10–105.60: the Pale Blue Dot light-table clip covers the board)
# ===================================================================== D. арифметика 105.59–125.37
write('свет быстрее зонда', 330, 4170, 105.7, 1.3, 'graphite', 80)
count('в {0}–{1} тысяч раз', [17, 18], 330, 4330, 107.5, 2.3, 'blue', 100)
# сутки света растянулись для Вояджера на 49 лет (111.25–116.45)
line([[1700, 4150], [1790, 4150]], 111.35, .25, 'blue', 14)
write('сутки света', 1840, 4170, 111.6, .9, 'blue', 62)
line([[1700, 4175], [1700, 4420]], 112.6, .3, 'grey', 4, dash=[14, 12])
line([[1700, 4420], [3700, 4420]], 112.95, 1.7, 'graphite', 12, ea=1.3, eb=2.6)
count('{0} лет Вояджера', [49], 2700, 4370, 114.2, 1.6, 'blue', 74, align='center')
# Команды уходят с антенн Сети дальней космической связи (116.45–121.35)
dm = meta('print_dsn'); DW = 400; DH = DW * dm[1] / dm[0]
printx('dsn', 'print_dsn', 4250, 4270, 116.55, w=DW, rot=-1.5, size='big')
magnet(4250 - 150, 4270 - DH / 2 + 22, 116.95, r=20); magnet(4250 + 150, 4270 - DH / 2 + 20, 117.07, r=20)
tag('Сеть дальней космической связи', 3960, 4560, 118.6, size=40, rot=-1, amp=7)
printx('voyager_d', 'print_voyager', 6560, 4290, 119.9, w=280, rot=2)
# Вопрос идёт сутки, ответ сутки, и инженерам остаётся ждать (121.35–125.37)
signal((4500, 4190), (6390, 4190), 121.4, 1.0)
write('вопрос: сутки', 5445, 4145, 121.55, .9, 'blue', 62, align='center')
signal((6390, 4390), (4500, 4390), 122.65, .95, dash=True)
write('ответ: сутки', 5445, 4480, 122.8, .9, 'blue', 62, align='center')
write('ждать', 6760, 4320, 124.0, .6, 'graphite', 100)
ink('ring', 124.7, .55, 'red', c=[6895, 4290], r=[175, 75], lw=8)

# ===================================================================== camera (one continuous camera; only the cards hide it)
c = Cam(*fit([380, 470, 3150, 1600]))
c.to(1.0, 2.4, z=z_of(c) * 1.03, a=1.6, b=3)                            # Earth lands, Voyager lands
c.fit(3.1, 3.4, [400, 480, 3150, 1620], a=1.8, b=2.6)                   # the signal out and back, двое суток
c.fit(6.75, 1.5, [2350, 430, 4080, 1150], a=2, b=2.8)                   # to Voyager: the farthest thing we built
c.fit(9.7, 1.6, [2350, 430, 4080, 1600], a=2, b=2.8)                    # date, сутки
c.to(11.6, 3.6, z=z_of(c) * 1.025)
c.fit(15.4, 1.3, [2450, 450, 4080, 1620], a=2, b=2.8)                   # launch 1977
c.fit(19.0, 1.9, [250, 150, 4080, 1660], a=1.8, b=2.8)                  # pull back: the house and its threshold
c.fit(21.9, 1.7, [3950, 380, 5800, 1150], a=2, b=2.8)                   # the plan: сутки пути света
c.fit(25.3, 1.3, [3950, 400, 5800, 1150], a=2, b=2.8)
c.fit(27.4, 1.6, [4000, 450, 7150, 1150], a=1.8, b=2.6)                 # ride the dashed line to the edge
c.fit(30.1, 1.5, [3950, 560, 6700, 1620], a=2, b=2.8)                   # какого размера вся Вселенная?
c.to(32.0, 3.6, z=z_of(c) * 1.035)
c.fit(35.85, 1.4, [3550, 1780, 7120, 2720], a=2, b=2.8)                 # B: Voyager and the nearest star
c.fit(38.95, 1.3, [3600, 1840, 5450, 2520], a=2, b=2.8)                 # 17 км/с
c.fit(43.0, 3.8, [5100, 1840, 7120, 2520], a=1.6, b=2.4)                # ride the path to the star
c.fit(47.6, 1.2, [3600, 1840, 7120, 2520], a=2, b=2.8)                  # the whole trip and its 75 000 years
c.fit(48.6, 1.4, [4300, 1850, 6750, 2720], a=2, b=2.8)                  # наша прикидка
c.to(50.2, 4.0, z=z_of(c) * 1.03)
c.fit(54.7, .9, [200, 2880, 2450, 3650], a=2, b=2.4)                    # (under the card) row C, the scale of light
c.to(55.7, 4.2, z=z_of(c) * 1.03)
c.fit(59.95, 1.3, [200, 2880, 2450, 3650], a=2, b=2.8)
c.fit(63.4, 1.4, [200, 2880, 2450, 3700], a=2, b=2.8)                   # the Moon
c.fit(66.35, 1.3, [200, 2880, 3000, 3700], a=2, b=2.8)                  # the Sun
c.fit(69.6, 1.3, [200, 2880, 3000, 3900], a=2, b=2.8)                   # seen 8 minutes late
c.fit(73.7, 1.4, [2400, 3050, 5150, 3700], a=2, b=2.8)                  # Neptune
c.fit(78.9, 1.9, [3900, 3050, 6700, 3700], a=1.8, b=2.6)                # ride on to Voyager, сутки
c.fit(83.1, 1.5, [4250, 3060, 6750, 3920], a=2, b=2.8)                  # a lifetime / one turn of the Earth
c.to(84.8, 4.0, z=z_of(c) * 1.025)
c.fit(89.4, 15.6, [250, 3980, 2600, 4560], a=2, b=2.2)                  # (under the PBD clip) slowly to row D
c.fit(105.4, 1.0, [250, 3980, 1900, 4480], a=2, b=2.6)                  # 17–18 thousand times
c.fit(111.15, 1.5, [250, 3980, 3850, 4560], a=2, b=2.8)                 # сутки света → 49 лет
c.to(112.8, 3.4, z=z_of(c) * 1.02)
c.fit(116.35, 1.5, [3600, 3980, 5300, 4650], a=2, b=2.8)                # the antenna
c.fit(119.7, 1.6, [3780, 3980, 7250, 4650], a=2, b=2.8)                 # question a day, answer a day, wait
c.to(121.4, 3.8, z=z_of(c) * 1.02)
c.fit(125.5, 2.1, [0, 0, BW, BH], a=2, b=2.4)                           # pull back: the chapter's wall as a whole

# ===================================================================== write (local time = film − T0)
def shift_t(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('t', 'out') and isinstance(v, (int, float)): o[k] = round(v - T0, 3)
            else: shift_t(v)
    elif isinstance(o, list):
        for v in o: shift_t(v)
shift_t(E); cam = c.json(); shift_t(cam['moves']); shift_t(cam['shakes'])
for cd in CARDS:
    for k in ('t0', 't1', 't2'): cd[k] = round(cd[k] - T0, 3)
evs = [dict(e, t=round(e['t'] - T0, 3)) for e in sorted(EV, key=lambda e: e['t'])]
scene = dict(dur=DUR, board=dict(w=BW, h=BH, seed=31, texScale=.4, ghosts=120, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=19000, min=.8), cam=cam, mbMax=6, elements=E, cards=CARDS, ev=evs, subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=evs), open(os.path.join(FILM, 'events.json'), 'w'), ensure_ascii=False, indent=1)
print('film.json', DUR, 's ·', len(E), 'elements ·', len(evs), 'events ·', len(c.moves), 'camera moves')
