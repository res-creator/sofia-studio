#!/usr/bin/env python3
"""«Мысленный эксперимент» · Опасные места (deadly_places) · board film, PART 4 (the last): chapters «НЕДРА» and
«КТО ОСТАНОВИЛ СЕКУНДОМЕР». FILM range 468.60–592.36 s (123.76 s). The renderer works in LOCAL time:  local = film − 468.60.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/deadly_places/film.json (segs → captions).
Wall (board px):
  left column  (x 550…3650)   НЕДРА: p25 the Mponeng print, the shaft section (ice slurry down, air below 30 °C, pipes /
                               refrigeration / ventilation), «the only hell cooled on schedule, like milk»;
                               p26 the principle: a person inside a bubble of the right environment, four tags, the stopwatch
  right part   (x 3950…8600)  КТО ОСТАНОВИЛ СЕКУНДОМЕР: the scoreboard of the seven places (photo · place · stopwatch · what kills),
                               filled as the narration says it (p27 readings, p28 causes, p29 ticks «подготовлены»)
  bottom row   (y 3350…4450)  p29 water is the most treacherous (our observation, not a ranking) + the cold-sea print;
                               p30 the gap between place and body, closed by four tags; the stopwatch stopped
  right column (x 8800…10250) p31 remembrance, the question to the viewer
The part ends on the style's native ending: a pull-back to the whole wall with the scoreboard readable.
Ink: graphite = names/facts · blue = measurement and numbers · red = only the decisive mark.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 468.60, 592.36
DUR = round(R1 - R0, 3)                       # 123.76
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 14300, 5300

E, EV = [], []
GROUP = [None]                 # 'T' = scoreboard + right column (moved down by DYT), 'U' = upper row (moved up by DYU)
def el(**k):
    if GROUP[0]: k['_g'] = GROUP[0]
    E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t
def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
def write(text, x, y, t, d, color='graphite', size=80, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=round(size), **k)
def count(text, to, x, y, t, d, color='blue', size=130, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=round(size), **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': list(a), 'to': list(b)}, lw=lw, **k)
def tag(text, x, y, t, size=60, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=22, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def card(id, lines_, x, y, t, w, h, rot=-1, quiet=False):
    if not quiet: ev(t + .2, 'land', .15, size='small')
    return el(type='card', id=id, xy=[x, y], w=w, h=h, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=s, font='mono', size=27, x=20, y=9 + 38 * i, color='grey', pass_=True) for i, s in enumerate(lines_)])
def stamp(text, x, y, t, size=110, rot=-6, color='red'):
    ev(t, 'stamp', .2); return el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), color=color)
def ruler(id, a, b, t, w=110):
    ev(t + .25, 'ruler', .4)
    return el(type='ruler', id=id, **{'from': list(a), 'to': list(b)}, w=w, z=12, inset=90, magnetR=36,
              arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=200, spin=.5, land=.6))
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
def tick(x, y, t, s=1.0, color='graphite', lw=10, quiet=False):
    return line([[x - 34 * s, y - 6 * s], [x - 8 * s, y + 26 * s], [x + 44 * s, y - 40 * s]], t, .3, color, lw, quiet=quiet)
def person(c, s, t, color='graphite', lw=7, quiet=True):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .1, color, lw, quiet=quiet)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .1, .08, color, lw, quiet=True)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .16, .08, color, lw, quiet=True)
    line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .22, .06, color, lw, quiet=True)
def stopwatch(c, r, t, color='graphite', hand_deg=-60, lw=8, quiet=False):
    """a stopwatch in marker: dial, crown and button, ticks, one hand"""
    x, y = c
    line(circle(c, r, 48), t, .5, color, lw, quiet=quiet, fill='grey', fillA=.08)
    line(rect(x - .12 * r, y - r - .28 * r, x + .12 * r, y - r), t + .45, .12, color, lw * .8, quiet=True)
    line([[x - .3 * r, y - r - .28 * r], [x + .3 * r, y - r - .28 * r]], t + .55, .08, color, lw, quiet=True)
    line([[x + .62 * r, y - .78 * r], [x + .8 * r, y - .98 * r]], t + .6, .08, color, lw, quiet=True)
    for i in range(12):
        a = math.radians(i * 30 - 90); r0 = .78 if i % 3 == 0 else .86
        line([[x + r0 * r * math.cos(a), y + r0 * r * math.sin(a)], [x + .94 * r * math.cos(a), y + .94 * r * math.sin(a)]], t + .62 + .02 * i, .04, color, lw * .6, quiet=True)
    a = math.radians(hand_deg)
    line([[x, y], [x + .7 * r * math.cos(a), y + .7 * r * math.sin(a)]], t + .9, .15, 'blue', lw, quiet=True)
    line(circle(c, .06 * r, 10), t + 1.0, .05, color, lw, quiet=True, fill='grey', fillA=.9)

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('НЕДРА', 468.60, hard=True)                    # the part opens on black
type_card('КТО ОСТАНОВИЛ СЕКУНДОМЕР', 506.89)

# ===================================================================== LEFT COLUMN · НЕДРА
# --- p25 469.60–486.66: ice slurry is pumped down; the air in the workings stays below 30 °C; pipes, refrigeration machines and
#     ventilation work against the stopwatch; the only hell on Earth cooled on schedule, like milk in a shop
PM = dict(x=1250, y=640, w=1300); PMH = PM['w'] * 585 / 1526
printd('mine', 'print_mine', PM['x'], PM['y'], L(469.0), w=PM['w'], rot=-1, size='big')
magnet(PM['x'] - 560, PM['y'] - PMH / 2 + 28, L(469.4)); magnet(PM['x'] + 560, PM['y'] - PMH / 2 + 24, L(469.5))
card('cred_mine', ['шахта Мпоненг, ЮАР: надшахтные постройки', 'фото: JMK, Wikimedia Commons, CC BY-SA 4.0'], PM['x'], PM['y'] + PMH / 2 + 75, L(469.6), 860, 96)
GY = 1180; SX = 2420; TY0, TY1 = 1960, 2050
line([[600, GY], [3600, GY]], L(469.65), .5, 'graphite', 8)                                   # the surface
rnd = random.Random(25)
hatch = [dict(points=[[x, y], [x + 40, y + 30]], t=round(L(471.2) + i * .012, 3), d=.03, lw=4)
         for i, (x, y) in enumerate([(620 + rnd.random() * 2900, GY + 60 + rnd.random() * 1000) for _ in range(110)])
         if not (SX - 90 < x < SX + 90) and not (900 < x < SX + 60 and TY0 - 80 < y < TY1 + 220) and not (x > 2560 and y < 1800)]
strokes_el(hatch, L(471.2), 1.4, 'grey', 4, .55, quiet=True)
line([[SX - 45, GY], [SX - 45, TY1]], L(471.2), 1.0, 'graphite', 8, quiet=True)               # the shaft
line([[SX + 45, GY], [SX + 45, TY1]], L(471.25), 1.0, 'graphite', 8)
line([[SX - 45, TY0], [1000, TY0], [1000, TY1], [SX + 45, TY1]], L(472.2), .5, 'graphite', 8, fill='grey', fillA=.08)  # the working
line(rect(SX - 110, GY - 150, SX + 110, GY), L(470.0), .3, 'graphite', 7, quiet=True)       # the headframe, small
line([[SX - 110, GY - 150], [SX, GY - 230], [SX + 110, GY - 150]], L(470.2), .2, 'graphite', 7, quiet=True)
dim([2640, GY], [2640, TY1], L(471.6), 1.0, lw=6)
write('почти 4 км', 2700, 1640, L(472.5), .7, 'blue', 74)
write('порода — 60 °C и выше', 1050, 1560, L(470.9), 1.0, 'grey', 58)
# ice slurry down the shaft
write('вниз — ледяная каша', SX - 90, GY + 110, L(469.65), 1.2, 'blue', 70, align='right')
arrow([SX, GY - 20], [SX, TY0 - 30], L(471.3), 1.3, 'blue', 9, dash=[22, 14])
line([[SX - 10, TY0 + 45], [1100, TY0 + 45]], L(472.6), .9, 'blue', 7, dash=[18, 14], arrow=True, quiet=True)
write('воздух в выработках', 1000, 2170, L(472.8), 1.0, 'graphite', 66)
count('ниже {0} °C', [30], 1000, 2300, L(473.7), 1.3, size=104)
# pipes, refrigeration machines, ventilation
line([[SX + 70, GY - 10], [SX + 70, TY0 - 10]], L(475.1), .8, 'blue', 6, quiet=True)          # a pipe beside the shaft
tag('трубы', 2760, 1760, L(475.15), size=50, rot=-1.5)
line([[2740, 1790], [SX + 80, 1820]], L(475.5), .3, 'graphite', 5, quiet=True)
RB = (2080, GY - 100)
line(rect(RB[0] - 120, RB[1] - 90, RB[0] + 120, RB[1] + 90), L(477.6), .35, 'graphite', 7, fill='grey', fillA=.12)
for i in range(3): line([[RB[0] - 90 + i * 70, RB[1] - 60], [RB[0] - 90 + i * 70, RB[1] + 60]], L(477.9) + .05 * i, .08, 'blue', 5, quiet=True)
line([[RB[0] + 120, RB[1] + 40], [SX - 110, RB[1] + 40]], L(478.0), .25, 'blue', 6, quiet=True)
tag('холодильные машины', 1130, 1070, L(477.6), size=50, rot=1)
line([[1700, 1100], [RB[0] - 125, RB[1]]], L(478.0), .3, 'graphite', 5, dash=[12, 10], quiet=True)
FC = (1180, (TY0 + TY1) / 2)
line(circle(FC, 34, 16), L(478.6), .2, 'graphite', 6, quiet=True)
for k_ in range(3):
    a = math.radians(k_ * 120)
    line([[FC[0], FC[1]], [FC[0] + 30 * math.cos(a), FC[1] + 30 * math.sin(a)]], L(478.7) + .05 * k_, .06, 'graphite', 6, quiet=True)
tag('вентиляция', 2760, 1960, L(478.6), size=50, rot=-1)
line([[2740, 1990], [SX + 60, 2010]], L(479.0), .3, 'graphite', 5, dash=[12, 10], quiet=True)
# the only hell cooled on schedule, like milk in a shop
write('пожалуй, единственный ад на Земле,', 2080, 470, L(479.95), 1.6, 'graphite', 72)
write('который охлаждают по графику,', 2080, 570, L(482.74), 1.4, 'graphite', 72)
MK = (2170, 760)
line([[MK[0] - 50, MK[1] - 50], [MK[0] - 50, MK[1] + 90], [MK[0] + 50, MK[1] + 90], [MK[0] + 50, MK[1] - 50]], L(484.9), .3, 'graphite', 7, fill='grey', fillA=.12)
line([[MK[0] - 50, MK[1] - 50], [MK[0], MK[1] - 100], [MK[0] + 50, MK[1] - 50], [MK[0] - 50, MK[1] - 50]], L(485.15), .2, 'graphite', 7, quiet=True)
line([[MK[0] - 12, MK[1] - 112], [MK[0] + 12, MK[1] - 112]], L(485.3), .05, 'graphite', 7, quiet=True)
write('как молоко в магазине', 2280, 790, L(484.95), 1.3, 'graphite', 72)

# --- p26 487.21–504.74: the common principle: a person carries a small piece of the right environment; a tank, warm clothes,
#     water and shade, a cooling system; the stopwatch shows how long you live without that piece; who of the seven is fastest?
write('заметь общий принцип:', 620, 2640, L(487.25), 1.4, 'graphite', 76)
write('человек приносит с собой маленький', 620, 2750, L(488.81), 1.8, 'graphite', 70)
write('кусочек подходящей среды', 620, 2845, L(491.0), 1.6, 'blue', 70)
BC = (1350, 3330)
line(circle(BC, [330, 370], 56), L(491.4), 1.2, 'blue', 7, dash=[20, 14])
person((BC[0], BC[1] + 170), 3.2, L(490.6), lw=9, quiet=False)
# the four pieces of protection
for i, (txt, tt) in enumerate((('баллон', 493.3), ('тёплая одежда', 494.0), ('вода и тень', 494.92), ('система охлаждения', 495.9))):
    ty = 3020 + i * 150
    tag(txt, 2000, ty, L(tt), size=50, rot=(-1.5 if i % 2 else 1.2))
    line([[1985, ty + 30], [BC[0] + 300 * math.cos(math.radians(-40 + i * 25)), BC[1] + 340 * math.sin(math.radians(-40 + i * 25))]],
         L(tt) + .3, .3, 'graphite', 5, dash=[12, 10], quiet=True)
SW = (3200, 3010)
stopwatch(SW, 170, L(497.3))
write('секундомер показывает,', 2760, 3330, L(497.6), 1.2, 'graphite', 68)
write('сколько ты проживёшь', 2760, 3430, L(499.1), 1.2, 'graphite', 68)
write('без этого кусочка', 2760, 3530, L(500.4), 1.2, 'blue', 68)
write('кто же из семи окажется быстрее всех?', 620, 3880, L(502.15), 2.2, 'graphite', 70)

# ===================================================================== RIGHT · the scoreboard (КТО ОСТАНОВИЛ СЕКУНДОМЕР)
# The table sits far enough right that the table shots never catch the left column's text at the frame edge.
GROUP[0] = 'T'
TX0 = 5350; TX1 = TX0 + 5000
CN, CR, CC_ = TX0 + 430, TX0 + 2150, TX0 + 3550          # columns: place · stopwatch · what kills
HY = 470; RY0, RS = 720, 330
ROWS = [('t_ev', 'Эверест · высота'), ('t_nyos', 'озеро Ньос · газ'), ('t_sea', 'северное море'), ('t_tri', 'Бездна Челленджера'),
        ('t_vos', 'станция «Восток»'), ('t_dv', 'Долина Смерти'), ('t_mine', 'шахта Мпоненг')]
yc = lambda i: RY0 + i * RS
# p27 507.89–524.97: «let's sum up» — the frame of the table and the seven places (photo + name), then the readings as said
write('подведём счёт', TX0, 300, L(507.95), .9, 'graphite', 110)
write('место', CN, HY, L(508.2), .4, 'grey', 68)
write('секундомер', CR, HY, L(508.35), .5, 'grey', 68)
write('что убивает', CC_, HY, L(508.5), .5, 'grey', 68)
line([[TX0, HY + 45], [TX1, HY + 45]], L(508.3), .6, 'graphite', 6, quiet=True)
for i, (tid, name) in enumerate(ROWS):
    t0 = L(508.55) + i * .22
    printd('p_' + tid, tid, TX0 + 190, yc(i), t0, w=360, rot=(-1.5 if i % 2 else 1.5), size='small', z=7)
    write(name, CN, yc(i) + 45, t0 + .15, .5, 'graphite', 140, quiet=True)
    if i < 6: line([[TX0, yc(i) + RS / 2], [TX1, yc(i) + RS / 2]], t0 + .2, .3, 'grey', 4, quiet=True)
line([[CR - 80, HY - 80], [CR - 80, yc(6) + RS / 2]], L(509.6), .4, 'grey', 4, quiet=True)
line([[CC_ - 80, HY - 80], [CC_ - 80, yc(6) + RS / 2]], L(509.7), .4, 'grey', 4, quiet=True)
write('минуты', CR, yc(0) + 45, L(509.6), .7, 'blue', 150)                                  # «На высоте у тебя минуты»
write('минуты и час', CR, yc(2) + 45, L(511.0), 1.0, 'blue', 150)                          # «в холодной воде минуты и час»
write('часы', CR, yc(5) + 45, L(512.9), .5, 'blue', 150)                                    # «в жаре часы»
write('не знаем', CR, yc(3) + 45, L(514.2), .8, 'graphite', 150)                            # «в бездне время мы не знаем»
write('быстрее всех', CR, yc(1) + 25, L(516.0), 1.0, 'red', 150)                           # «Быстрее всех, по описаниям, газ»
write('по описаниям', CR, yc(1) + 118, L(517.5), .9, 'grey', 70)
write('единого рейтинга нет —', TX0, 3030, L(521.45), 1.3, 'graphite', 84)
write('у каждого места своя шкала', TX0 + 1000, 3030, L(522.95), 1.6, 'graphite', 84)
# p28 525.52–543.34: comparing is unfair: they kill differently; there is no single ruler for that
write('кислорода не хватает', CC_, yc(0) + 35, L(529.9), 1.2, 'graphite', 105)
write('кислорода не хватает', CC_, yc(1) + 35, L(530.5), 1.2, 'graphite', 105, quiet=True)
write('давит вода', CC_, yc(3) + 35, L(532.95), .9, 'blue', 105)
write('тело теряет тепло', CC_, yc(4) + 35, L(534.7), 1.0, 'graphite', 105)
write('тело теряет тепло', CC_, yc(2) + 35, L(535.6), 1.0, 'graphite', 105, quiet=True)
write('кожа мёрзнет быстро', CR, yc(4) + 25, L(535.0), 1.0, 'graphite', 100)               # (said in «ХОЛОД И ЖАРА»)
write('время зависит от ветра', CR, yc(4) + 118, L(536.1), 1.1, 'grey', 70)
write('перегревается', CC_, yc(5) + 35, L(538.1), .9, 'graphite', 105)
write('перегревается', CC_, yc(6) + 35, L(539.0), .9, 'graphite', 105, quiet=True)
write('воздух ниже 30 °C', CR, yc(6) + 25, L(539.5), 1.0, 'blue', 100)                    # (said in «НЕДРА»)
write('охлаждают по графику', CR, yc(6) + 118, L(540.4), .8, 'grey', 70)
ruler('rul', [TX0 + 3100, 3120], [TX0 + 4900, 3120], L(541.2), w=100)
line([[TX0 + 3150, 3195], [TX0 + 4850, 3045]], L(542.4), .35, 'graphite', 9)
write('одной линейки нет', TX0 + 3100, 3265, L(542.0), 1.0, 'graphite', 70)

# p29 543.89–560.03: water is the most treacherous — our observation, not a ranking; to Nyos nobody comes in swimming trunks,
#     to the cold sea people do; it looks harmless, the cold is dangerous from the first minutes; elsewhere people go prepared
ink('ring', L(543.95), .5, 'red', c=[CR + 540, yc(2) - 5], r=[660, 120], lw=8)
GROUP[0] = 'U'
write('коварнее всех — вода', TX0, 3700, L(545.0), 1.2, 'graphite', 84)
tag('наше наблюдение, а не рейтинг', TX0 + 10, 3790, L(546.2), size=52, rot=-1)
write('в Ньос не приходят в плавках,', TX0, 4040, L(547.95), 1.6, 'graphite', 62)
write('а к холодному морю приходят', TX0, 4130, L(550.4), 1.6, 'blue', 62)
write('выглядит безобидно,', TX0, 4250, L(552.75), 1.2, 'graphite', 62)
write('а холод опасен с первых минут', TX0, 4340, L(554.3), 1.7, 'graphite', 62)
PS = dict(x=TX0 + 1950, y=3940, w=820); PSH = PS['w'] * 1143 / 1308
printd('sea', 'print_sea', PS['x'], PS['y'], L(547.0), w=PS['w'], rot=1.2, size='mid')
magnet(PS['x'] - 340, PS['y'] - PSH / 2 + 26, L(547.4)); magnet(PS['x'] + 340, PS['y'] - PSH / 2 + 30, L(547.5))
card('cred_sea', ['лёд на берегу Северного моря, Нидерланды', 'архив Anefo, без ограничений'], PS['x'], PS['y'] + PSH / 2 + 70, L(547.7), 720, 96, rot=.8)
GROUP[0] = 'T'
write('идут подготовленными', TX1 + 40, HY, L(556.4), 1.2, 'grey', 50, align='right')
for k_, i in enumerate((0, 3, 4, 5, 6)):
    tick(TX1 + 130, yc(i) + 5, L(557.0) + .35 * k_, 1.5, quiet=(k_ > 0))

# ===================================================================== BOTTOM · the gap between place and body (p30 560.58–575.29)
GROUP[0] = 'U'
GX = TX0 + 2950
write('что общего у всех семи?', GX, 3700, L(560.65), 1.4, 'graphite', 76)
line(rect(GX, 3820, GX + 620, 4060), L(562.0), .4, 'graphite', 8, fill='grey', fillA=.10)
write('место', GX + 310, 3970, L(562.3), .5, 'graphite', 70, align='center')
line(rect(GX + 1180, 3820, GX + 1800, 4060), L(562.6), .4, 'graphite', 8, fill='grey', fillA=.10)
person((GX + 1330, 4040), 2.0, L(562.8))
write('тело', GX + 1560, 3970, L(562.9), .4, 'graphite', 70, align='center')
dim([GX + 640, 3940], [GX + 1160, 3940], L(563.0), .6, 'red', 7)
write('разрыв', GX + 900, 4040, L(563.4), .7, 'red', 62, align='center')
for i, (txt, tt) in enumerate((('привыкание', 564.5), ('одежда', 565.4), ('трубы', 565.9), ('ледяная каша', 566.6))):
    tag(txt, GX + 30 + (i % 2) * 560, 4150 + (i // 2) * 115, L(tt), size=46, rot=(1 if i % 2 else -1.2))
line([[GX + 625, 3870], [GX + 1175, 3870]], L(567.6), .6, 'graphite', 12)                     # the gap closed
write('секундомер можно остановить,', GX, 4480, L(568.45), 1.6, 'graphite', 62)
stopwatch((GX + 2170, 3960), 150, L(568.6), hand_deg=-90, quiet=True)
stamp('СТОП', GX + 2170, 4250, L(570.0), size=90, rot=-7)
write('пока он не стал приговором', GX, 4570, L(570.95), 1.6, 'graphite', 62)
write('но только если знаешь, куда идёшь', GX + 1050, 4660, L(572.8), 2.0, 'blue', 62)

# ===================================================================== RIGHT COLUMN · remembrance, the question (p31 575.84–590.86)
GROUP[0] = 'T'
RX = TX1 + 450
line([[RX - 60, 330], [RX - 60, 2700]], L(575.9), .8, 'grey', 4, quiet=True)
write('помним тех,', RX, 600, L(575.9), .9, 'graphite', 100)
write('кто погиб', RX, 720, L(576.8), .8, 'graphite', 100)
write('в этих местах:', RX, 840, L(577.6), .9, 'graphite', 100)
write('от деревень', RX, 1010, L(578.5), .8, 'graphite', 86)
write('у озера Ньос', RX, 1115, L(579.2), .8, 'graphite', 86)
write('до гор', RX, 1220, L(580.0), .6, 'graphite', 86)
line([[RX, 1460], [RX + 150, 1370], [RX + 260, 1430], [RX + 420, 1280], [RX + 560, 1410], [RX + 700, 1340], [RX + 860, 1460]], L(580.2), .6, 'graphite', 7)
line(circle((RX + 380, 1490), [200, 26], 30, a0=0, turn=.5), L(579.5), .4, 'blue', 6, quiet=True)
# «we started with seconds at altitude and ended with cold water by the shore» — along the scoreboard, row 0 → row 2
line(bez([TX0 - 30, yc(0)], [TX0 - 300, (yc(0) + yc(2)) / 2], [TX0 - 30, yc(2)]), L(580.85), 1.6, 'blue', 8, arrow=True)
write('начали с секунд на высоте,', RX, 1730, L(580.9), 1.4, 'graphite', 80)
write('а закончили холодной', RX, 1835, L(583.0), 1.0, 'graphite', 80)
write('водой у берега', RX, 1940, L(584.0), .9, 'blue', 80)
write('какое из семи мест', RX, 2190, L(585.75), 1.1, 'graphite', 90)
write('удивило тебя', RX, 2305, L(586.9), .8, 'graphite', 90)
write('больше всего?', RX, 2420, L(587.7), .9, 'graphite', 90)
tag('напиши в комментариях', RX + 10, 2540, L(589.0), size=58, rot=-1.5)

GROUP[0] = None
DYT, DYU = 1650, -3340       # the scoreboard moves down, the rows p29/p30 move up above it (so no shot shows them in the subtitle band)
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
    def to(s, t, d, x=None, y=None, z=None, a=2, b=2.6):
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

TOP = [550, 200, 3650, 2350]; SECTION = [550, 1000, 3650, 2350]; PRINC = [550, 2470, 3650, 3950]
TABLE = [TX0 - 250, 170 + DYT, TX0 + 5300, 3330 + DYT]; P29 = [TX0 - 250, 3420 + DYU, TX0 + 2800, 4450 + DYU]; P30 = [GX - 200, 3560 + DYU, GX + 2600, 4700 + DYU]
Q31 = [TX0 - 350, 170 + DYT, RX + 1450, 3240 + DYT]
c = Cam(*fit([650, 230, 3600, 1560]))
c.to(L(469.7), 1.6, z=z_of(c) * 1.03)                          # print + section
c.fit(L(471.3), 1.4, SECTION, b=3)                              # slurry, air below 30 °C
c.to(L(472.8), 6.8, z=z_of(c) * 1.03)
c.fit(L(479.7), 1.4, TOP, b=3)                                  # «the only hell … like milk»
c.to(L(481.2), 5.4, z=z_of(c) * 1.02)
c.fit(L(486.8), 1.5, PRINC, b=3)                                # the principle, the bubble, the stopwatch
c.to(L(488.4), 15.8, z=z_of(c) * 1.03)
x_, y_, z_ = fit([450, 150, 3750, 4050]); c.to(L(504.6), 2.0, x_ + 2550, y_, z_, b=3)               # chapter pull-back: the left column
# card «КТО ОСТАНОВИЛ СЕКУНДОМЕР» 506.89–507.89
c.fit(L(507.0), .7, TABLE)                                      # (under the card) the scoreboard
c.to(L(507.9), 35.5, z=z_of(c) * 1.04)                          # slow push while it fills (p27, p28)
c.fit(L(544.6), 1.4, P29, b=3)                                  # water: our observation
c.to(L(546.1), 9.8, z=z_of(c) * 1.03)
c.fit(L(556.1), 1.3, TABLE, b=3)                                # ticks: prepared
c.to(L(557.5), 2.6, z=z_of(c) * 1.01)
c.fit(L(560.3), 1.4, P30, b=3)                                  # the gap between place and body
c.to(L(561.8), 13.6, z=z_of(c) * 1.03)
c.fit(L(575.5), 1.6, Q31, b=3)                                  # remembrance, «from altitude to cold water», the question
c.to(L(577.2), 10.3, z=z_of(c) * 1.02)
c.fit(L(587.6), 3.0, [450, 150, RX + 1450, 3350 + DYT], b=3.2)            # the native ending: the whole wall

# the whole wall sits OX px further right / OY lower (keeps the board's frame out of the opening shots)
OX, OY = 900, 150
def shift(e, dx, dy):
    for k in ('xy', 'c', 'pivot') + (('from', 'to') if e.get('kind') == 'dim' or e['type'] == 'ruler' else ()):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1] + dy]
    if 'points' in e: e['points'] = [[x + dx, y + dy] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y + dy] for x, y in st['points']]
for e in E:
    g = e.pop('_g', None)
    if g: shift(e, 0, DYT if g == 'T' else DYU)
    shift(e, OX, OY)
c.base['x'] += OX; c.base['y'] += OY; BW += OX; BH += OY

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=73, texScale=.36, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
