#!/usr/bin/env python3
"""«Мысленный эксперимент» · Отдалённые места (remote_places) · board film, PART 4: the first part of chapter
«ТРИСТАН-ДА-КУНЬЯ» (card at 343.74), paragraphs 18–23.
FILM range 343.74–461.10 s (117.36 s). The renderer works in LOCAL time:  local = film − 343.74.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/remote_places/film.json (segs → captions).
COVERED: film 347.36–362.56 (local 3.62–18.82) is covered by the 3D map clip (Tristan da Cunha, ~2400 km to Saint
Helena). Under it the board quietly gets what the narration says there (the ISS print of the island, «самый удалённый
обитаемый остров», the 2 400 km schematic); no sound events are written for that window.
Wall (board px, before the OX shift):
  row 1 (y 450…1950)  A p18 the island · B p19 Edinburgh of the Seven Seas, ≈220, no airport, ≈6 days from Cape Town
                      · C p20 the population range (number line 200…300)
  row 2 (y 2550…3950) D p21–p22 the timeline 1800…1900 (1810 Lambert, 1816, Glass, 1867 renaming, 1892 «Италия»)
                      · E p23 Queen Mary's Peak ≈ 2 060 m, last eruption October 1961
Ink: graphite = names, facts · blue = measurement and numbers · red = only the break (no airport, the wreck,
the conclusion «порядок величины», the eruption).
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 343.74, 461.10
DUR = round(R1 - R0, 3)                       # 117.36
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(347.36), L(362.56))]
BW, BH = 10700, 4700

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
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def credit(id, x, y, w, text, t, rot=-1):
    return el(type='card', id=id, xy=[x, y], w=w, h=60, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=text, font='mono', size=29, x=22, y=10, color='grey', pass_=True)])
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def dot(c, t, r=14, color='graphite'): return line(circle(c, r, 14), t, .12, color, 12, fill=color, fillA=.9)
def cross(x, y, t, s=40, color='red', lw=9):
    line([[x - s, y - s], [x + s, y + s]], t, .15, color, lw); line([[x + s, y - s], [x - s, y + s]], t + .17, .15, color, lw)
def house(x, y, t, s=1.0, color='graphite'):       # (x, y) = middle of the floor line
    line([[x - 90 * s, y], [x - 90 * s, y - 110 * s], [x, y - 190 * s], [x + 90 * s, y - 110 * s], [x + 90 * s, y], [x - 90 * s, y]], t, .6, color, 8)
    line([[x - 22 * s, y], [x - 22 * s, y - 60 * s], [x + 22 * s, y - 60 * s], [x + 22 * s, y]], t + .6, .25, color, 6)
def plane(x, y, t, s=1.0):                          # a small airliner seen from above, nose right
    P = lambda pts: [[x + px * s, y + py * s] for px, py in pts]
    line(P([[-120, 0], [110, 0], [130, 8], [110, 16], [-120, 16]]), t, .35, 'graphite', 7)
    line(P([[-10, 4], [-50, -80], [-25, -80], [40, 4]]), t + .3, .2, 'graphite', 7)
    line(P([[-10, 12], [-50, 96], [-25, 96], [40, 12]]), t + .45, .2, 'graphite', 7)
    line(P([[-100, 4], [-125, -35], [-110, -35], [-80, 4]]), t + .6, .12, 'graphite', 6)
def ship(x, y, t, s=1.0, color='graphite', tilt=0):   # side view, (x, y) = waterline middle
    cs, sn = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
    P = lambda pts: [[x + (px * cs - py * sn) * s, y + (px * sn + py * cs) * s] for px, py in pts]
    line(P([[-130, -40], [130, -40], [100, 10], [-110, 10], [-130, -40]]), t, .4, color, 7)
    line(P([[-60, -40], [-60, -85], [40, -85], [40, -40]]), t + .4, .2, color, 6)
    line(P([[0, -85], [0, -125]]), t + .6, .08, color, 6)
def waves(x0, x1, y, t, d=.4, color='blue'):
    pts = [[x0 + (x1 - x0) * i / 40, y + 9 * math.sin(i * math.pi / 4)] for i in range(41)]
    return line(pts, t, d, color, 5)

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

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ТРИСТАН-ДА-КУНЬЯ', 343.74, hard=True)     # the part opens on black

# ===================================================================== A · p18 344.74–362.56
# «Теперь место, где отдалённость стала домом.» (then the 3D map clip covers 347.36–362.56)
write('отдалённость', 420, 660, L(344.85), 1.0, 'graphite', 96)
write('стала домом', 1150, 660, L(345.85), .9, 'graphite', 96)
house(2000, 680, L(346.55), 1.0)
# --- under the clip (quiet): the island from the ISS, the claim, the distance to Saint Helena
printd('aerial', 'print_aerial', 820, 1330, L(348.2), w=640, rot=-2)
credit('cred_aerial', 820, 1720, 640, 'Тристан-да-Кунья с МКС, 2013 · NASA', L(348.6))
tag('Тристан-да-Кунья', 1350, 1000, L(349.2), size=64, rot=-1.5)
write('южная Атлантика', 1350, 1200, L(350.0), 1.0, 'graphite', 66)
write('самый удалённый', 1350, 1330, L(351.0), 1.0, 'graphite', 66)
write('обитаемый остров', 1350, 1420, L(352.0), 1.0, 'graphite', 66)
TR, SH = (1420, 1700), (2950, 1700)
dot(TR, L(353.2)); dot(SH, L(353.4))
write('Тристан', TR[0], TR[1] + 90, L(353.4), .5, 'graphite', 50, align='center')
write('о. Святой Елены', SH[0], SH[1] + 90, L(355.2), .8, 'graphite', 50, align='center')
dim([TR[0] + 30, TR[1]], [SH[0] - 30, SH[1]], L(355.5), 1.2)
count('≈ {0} км', [2400], (TR[0] + SH[0]) / 2, TR[1] - 40, L(356.7), 1.6, size=84, sep=True, align='center')
write('источники дают чуть по-разному', (TR[0] + SH[0]) / 2, TR[1] + 190, L(359.0), 1.4, 'graphite', 48, align='center')

# ===================================================================== B · p19 363.10–381.02
# the only settlement, Edinburgh of the Seven Seas; 2026 data: ≈ 220 people; no airport, only by ship:
# ≈ 6 days from Cape Town; «это не поездка выходного дня»
write('единственный посёлок', 3700, 620, L(363.2), 1.3, 'graphite', 80)
printd('village', 'print_village', 4400, 1160, L(364.1), w=1440, rot=1.5)
credit('cred_village', 4400, 1580, 1260, 'Эдинбург Семи Морей · фото: michael clarke stuff, CC BY-SA 2.0', L(364.6), rot=.5)
tag('Эдинбург Семи Морей', 5300, 640, L(365.3), size=64, rot=1.5)
write('по данным 2026 года', 5300, 860, L(366.8), 1.4, 'graphite', 64)
count('≈ {0} человек', [220], 5300, 1000, L(369.4), 1.8, size=92)
plane(5420, 1180, L(372.85), .9)
cross(5420, 1185, L(373.75), 60)
write('аэропорта нет', 5620, 1215, L(373.4), .9, 'graphite', 64)
write('только кораблём', 5300, 1390, L(375.2), 1.0, 'graphite', 64)
ship(6250, 1360, L(376.0), .7)
CT, TD = (5360, 1620), (6650, 1620)
dot(CT, L(376.3)); write('Кейптаун', CT[0], CT[1] + 80, L(376.4), .6, 'graphite', 50, align='center')
line([[CT[0] + 30, CT[1]], [TD[0] - 34, TD[1]]], L(376.8), 1.0, 'blue', 6, dash=[18, 12], arrow=True)
dot(TD, L(377.5)); write('Тристан', TD[0], TD[1] + 80, L(377.6), .5, 'graphite', 50, align='center')
count('≈ {0} суток', [6], (CT[0] + TD[0]) / 2, CT[1] - 40, L(378.0), 1.0, size=76, align='center')
write('это не поездка выходного дня', 3700, 1850, L(379.0), 1.8, 'graphite', 70)

# ===================================================================== C · p20 381.57–398.77
# the number is small and it varies; other sources: from 240 to almost 300; it changes with the years, births and
# departures; so «около 220» is an order of magnitude
write('жителей немного,', 7250, 620, L(381.7), 1.3, 'graphite', 76)
write('и число колеблется', 7250, 730, L(384.0), 1.2, 'graphite', 76)
wv = [[8500 + 600 * i / 48, 690 + 40 * math.sin(i * math.pi / 6) * (1 - .4 * (i % 12 > 6))] for i in range(49)]
line(wv, L(384.6), .8, 'blue', 6)
AX0, AY = 7300, 1280
X = lambda v: AX0 + (v - 200) * 26                 # 200 → 7300 … 300 → 9900
line([[X(195), AY], [X(310), AY]], L(385.4), .7, 'graphite', 7, arrow=True)
for i, v in enumerate(range(200, 301, 20)):
    line([[X(v), AY - 22], [X(v), AY + 22]], L(385.6) + .05 * i, .06, 'graphite', 6, quiet=True)
    write(str(v), X(v), AY + 85, L(385.7) + .05 * i, .15, 'graphite', 46, align='center', quiet=True)
write('другие источники:', 7250, 960, L(385.5), 1.1, 'graphite', 62)
line([[X(240), AY - 50], [X(296), AY - 50]], L(387.6), 1.4, 'blue', 16)
line([[X(240), AY - 80], [X(240), AY - 20]], L(387.6), .1, 'blue', 7, quiet=True)
count('от {0} до почти {1}', [240, 300], X(268), AY - 190, L(387.0), 2.4, size=66, align='center')
dot((X(220), AY), L(386.4), 16, 'blue')
write('≈ 220', X(220), AY - 130, L(386.5), .4, 'blue', 56, align='center')
write('меняется с годами:', 7250, 1520, L(390.1), 1.4, 'graphite', 64)
write('+ рождения', 7300, 1630, L(391.8), .7, 'blue', 62)
write('− отъезды', 7900, 1630, L(392.5), .7, 'blue', 62)
write('«около 220» — это', 7250, 1820, L(393.5), 1.6, 'graphite', 70)
write('порядок величины', 8000, 1820, L(396.0), 1.4, 'red', 70)
ink('ring', L(397.6), .6, 'red', c=[X(250), AY + 30], r=[1600, 150], lw=6)

# ===================================================================== D · p21 399.52–423.41 · p22 424.13–441.24
# timeline 1800…1900
AY2 = 3250
Y = lambda yr: 400 + (yr - 1800) * 55            # 1810 → 950 · 1816 → 1280 · 1867 → 4085 · 1892 → 5460
line([[Y(1798), AY2], [Y(1905), AY2]], L(399.6), 1.6, 'graphite', 8, arrow=True)
for i, yr in enumerate(range(1800, 1901, 10)):
    line([[Y(yr), AY2 - 16], [Y(yr), AY2 + 16]], L(399.7) + .14 * i, .05, 'graphite', 5, quiet=True)
write('1800', Y(1800), AY2 + 75, L(399.8), .3, 'grey', 44, align='center', quiet=True)
write('1900', Y(1900), AY2 + 75, L(401.1), .3, 'grey', 44, align='center', quiet=True)
# 1810: first permanent resident, the American Jonathan Lambert
tag('первый постоянный житель', 450, 2700, L(399.9), size=58, rot=-1.5)
write('Джонатан Ламберт', 450, 2900, L(402.0), 1.3, 'graphite', 80)
write('американец', 450, 3010, L(402.3), .8, 'graphite', 60)
dot((Y(1810), AY2), L(404.4), 18)
write('1810', Y(1810), AY2 - 60, L(404.9), .8, 'blue', 84, align='center')
# 1816: Britain annexed the islands; William Glass stayed and started the population
dot((Y(1816), AY2), L(407.6), 18)
write('1816', Y(1816) + 30, AY2 + 110, L(409.6), .8, 'blue', 84, align='center')
write('Британия присоединила острова', 450, 3460, L(407.7), 2.0, 'graphite', 62)
write('остался Уильям Гласс —', 450, 3580, L(412.2), 1.4, 'graphite', 62)
write('от него пошло население', 450, 3690, L(413.6), 1.5, 'graphite', 62)
# 1892: part of the families descend from Italian sailors of the wrecked ship «Италия»
write('часть семей ведёт род', 4500, 2700, L(415.7), 1.2, 'graphite', 62)
write('от итальянских моряков', 4500, 2810, L(416.8), 1.3, 'graphite', 62)
write('с разбитого судна «Италия»', 4500, 2920, L(418.6), 1.6, 'graphite', 62)
ship(5880, 3070, L(419.4), .75, 'graphite', tilt=-14)
line([[5850, 3010], [5875, 3045], [5850, 3070], [5880, 3110]], L(420.4), .3, 'red', 7)
dot((Y(1892), AY2), L(420.8), 18)
write('1892', Y(1892), AY2 + 110, L(421.0), .8, 'blue', 84, align='center')
# 1867: the grand name came later: renamed in honour of Prince Alfred, Duke of Edinburgh
write('громкое название — позже:', 3300, 3460, L(424.25), 1.6, 'graphite', 62)
dot((Y(1867), AY2), L(429.0), 18)
write('1867', Y(1867), AY2 - 60, L(429.4), .9, 'blue', 84, align='center')
write('в честь принца Альфреда,', 3300, 3570, L(432.1), 1.5, 'graphite', 62)
write('герцога Эдинбургского', 3300, 3680, L(433.9), 1.3, 'graphite', 62)
tag('Эдинбург Семи Морей', 4550, 3560, L(435.0), size=58, rot=1.5)
write('звучит как столица —', 4550, 3760, L(436.9), 1.4, 'graphite', 62)
write('и остаётся ею:', 4550, 3870, L(438.6), .9, 'graphite', 62)
write('другого посёлка нет', 4550, 3980, L(439.6), 1.3, 'graphite', 62)

# ===================================================================== E · p23 441.79–460.60
# above the settlement rises the volcano Queen Mary's Peak, ≈ 2 060 m; the island grew from the volcano; it reminds of
# itself from time to time; the last time: October 1961
write('над посёлком — вулкан', 6800, 2700, L(441.9), 1.6, 'graphite', 70)
PSX, PSY, PSW = 7700, 3220, 1560
PSH = PSW * 700 / 1700
printd('sea', 'print_sea', PSX, PSY, L(442.3), w=PSW, rot=0)
credit('cred_sea', PSX, PSY + PSH / 2 + 50, 1100, 'Тристан-да-Кунья с моря · фото: Brian Gratwicke, CC BY 2.0', L(442.7), rot=-.5)
peak = (PSX + (.453 - .5) * PSW, PSY + (.331 - .5) * PSH)
sea = PSY + (.686 - .5) * PSH
DX = PSX + PSW / 2 + 120
tag('Пик королевы Марии', 8650, 2700, L(444.2), size=58, rot=-1.5)
line([[PSX + PSW / 2 + 15, peak[1]], [DX + 40, peak[1]]], L(446.4), .3, 'blue', 4, dash=[12, 10])
line([[PSX + PSW / 2 + 15, sea], [DX + 40, sea]], L(446.4), .3, 'blue', 4, dash=[12, 10], quiet=True)
dim([DX, sea], [DX, peak[1]], L(446.6), .6, lw=6)
count('≈ {0} м', [2060], DX + 70, (sea + peak[1]) / 2 + 30, L(446.7), 1.3, size=80, sep=True)
write('остров вырос из вулкана', 8650, 3500, L(448.0), 1.7, 'graphite', 58)
write('и время от времени', 8650, 3610, L(449.9), 1.2, 'graphite', 58)
write('он напоминает о себе', 8650, 3720, L(451.2), 1.4, 'graphite', 58)
write('последний раз:', 6950, 3830, L(453.6), 1.2, 'graphite', 66)
write('октябрь 1961', 7520, 3830, L(456.2), 1.6, 'blue', 78)
ink('ring', L(458.7), .6, 'red', c=[7770, 3805], r=[300, 75], lw=6)
# the volcano «reminds of itself»: a short red burst over the peak, on the print
for k, ang in enumerate((-120, -90, -60)):
    a_ = math.radians(ang); r0, r1 = 45, 110
    line([[peak[0] + r0 * math.cos(a_), peak[1] - 10 + r0 * math.sin(a_)], [peak[0] + r1 * math.cos(a_), peak[1] - 10 + r1 * math.sin(a_)]],
         L(452.2) + .12 * k, .15, 'red', 6, onPrint=True, quiet=k > 0)

# ===================================================================== camera (one continuous camera; the clip hides the jumps)
c = Cam(*fit([350, 460, 2350, 1000]))
c.to(L(344.6), 2.7, z=z_of(c) * 1.03)
c.fit(L(348.0), 2.0, [350, 460, 3250, 1960], b=3)                         # (under the clip) panel A
c.to(L(350.2), 12.0, z=z_of(c) * 1.02)
c.fit(L(362.75), 1.25, [3650, 460, 6850, 1960], b=2.8)                      # B: the village
c.to(L(364.0), 8.5, z=z_of(c) * 1.02)
c.fit(L(372.6), 1.0, [3650, 460, 6850, 1960], b=3)
c.to(L(373.7), 7.4, z=z_of(c) * 1.02)
c.fit(L(381.3), 1.3, [7150, 460, 10250, 1960], b=2.8)                     # C: the population range
c.to(L(382.7), 15.8, z=z_of(c) * 1.03)
c.fit(L(399.0), 1.4, [380, 2560, 3150, 3920], b=2.8)                      # D: 1810, 1816
c.to(L(400.5), 14.6, z=z_of(c) * 1.03)
c.fit(L(415.2), 1.4, [3250, 2560, 6250, 4020], b=2.8)                     # D: 1892, 1867
c.to(L(416.7), 24.4, z=z_of(c) * 1.03)
c.fit(L(441.3), 1.3, [6750, 2560, 9750, 3910], b=2.8)                     # E: the volcano
c.to(L(442.7), 16.9, z=z_of(c) * 1.03)
c.fit(L(459.75), 1.33, [250, 350, 10200, 4050], b=3)                      # pull-back: this part of the wall

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
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=71, texScale=.4, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=30000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
