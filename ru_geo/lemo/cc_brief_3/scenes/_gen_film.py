#!/usr/bin/env python3
"""«Мысленный эксперимент» · Как создать свою страну · board film, PART 3.
FILM range 178.76–355.06 s (176.30 s): chapter «ЗЕМЛЯ НИЧЬЯ?» (card at 178.76): Liberland, Hutt River, Molossia, Conch Republic.
The renderer works in LOCAL time:  local = film − 178.76.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/create_country/film.json (segs → captions).
Two windows are covered by 3D map clips made by another agent (the board still runs there, kept simple):
  film 179.76–199.90 = local  1.00–21.14  (Liberland's location)
  film 235.19–254.78 = local 56.43–76.02  (Hutt River farm in Western Australia)
Wall (board px):
  row 1 (y  400…1900)  A Liberland: 2015, Jedlička, Danube floodplain, about 7 km², the founder's logic (covered)
                        B Croatia guards / Serbia: not violated, not recognised / 2023 police / disputed ≠ nobody's
                        C the founder's numbers (cannot be checked) + Liberland's four-ticks checklist
  row 2 (y 2500…4100)  D Casley 1970, wheat quotas, Hutt River, about 75 km², Western Australia (covered)
                        E stamps, coins, passports; war and peace; 23 residents, about 40 000 tourists; guests vs tax office
                        F not recognised; 2017 court, more than 2 700 000 dollars of tax; sovereignty argument; dissolution, land sold
                        G Hutt River's four-ticks checklist; «a country drawn on a map»
  row 3 (y 4700…6200)  H Molossia (Kevin Baugh, Nevada, < 5 ha, own currency, taxes as «foreign aid», micronations)
                        I Key West 1982 (independence, checkpoint, war on the USA, surrender, a billion; checkpoint removed)
Outlines: /tmp/world.geo.json (johan/world.geo.json, Natural Earth 1:110m, public domain), plain equirectangular (cos φ0).
Ink: graphite = names/facts · blue = measurement and numbers, ticks · red = only the break / the decision, crosses.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 178.76, 355.06
DUR = round(R1 - R0, 3)                       # 176.30
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [(L(179.76), L(199.90)), (L(235.19), L(254.78))]
BW, BH = 12500, 7300

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
FS = 1.12
def write(text, x, y, t, d, color='graphite', size=64, **k): return ink('write', t, d, color, text=text, xy=[x, y], size=round(size * FS), **k)
def count(text, to, x, y, t, d, color='blue', size=120, **k): return ink('count', t, d, color, text=text, to=to, xy=[x, y], size=round(size * FS), **k)
def dim(a, b, t, d, color='blue', lw=7, **k): return ink('dim', t, d, color, **{'from': list(a), 'to': list(b)}, lw=lw, **k)
def tag(text, x, y, t, size=54, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=20, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
def stamp(text, x, y, t, size=60, rot=-5, color='red'):
    el(type='stamp', text=text, xy=[x, y], size=size, rot=rot, t=round(t, 3), color=color); ev(t, 'stamp', .2)
def printd(id, src, x, y, t, w=None, h=None, rot=0, size='mid', z=8):
    k = dict(type='print', id=id, src=src, xy=[x, y], z=z, rot=rot, arrive=dict(t=round(t, 3), kind='drop', d=.45, lift=220, spin=1.3, land=.6))
    if w: k['w'] = w
    if h: k['h'] = h
    ev(t + .27, 'land', .2, size=size); return el(**k)
def credit(id, lines, x, y, t, rot=-1, size=24):
    """a printed credit card: one or two lines of mono text (author, licence)"""
    lines = [lines] if isinstance(lines, str) else lines
    w = round(max(len(s) for s in lines) * size * .6 + 44); h = round(size * 1.3 * len(lines) + 26)
    y0 = -h / 2 + 13 + size * .95
    return el(type='card', id=id, xy=[x, y], w=w, h=h, rot=rot, z=9, arrive=dict(t=round(t, 3), kind='drop', d=.35, lift=120, spin=.6, land=.6),
              lines=[dict(text=s, font='mono', size=size, x=22, y=round(y0 + i * size * 1.3), color='grey') for i, s in enumerate(lines)])
def mounted(id, src, x, y, t, w, ratio, cred, rot=-1.2, csize=26):
    """a print with two magnets and its credit card underneath"""
    h = w * ratio
    printd(id, src, x, y, t, w=w, rot=rot)
    magnet(x - w * .36, y - h / 2 + 28, t + .45); magnet(x + w * .36, y - h / 2 + 24, t + .55)
    n = 1 if isinstance(cred, str) else len(cred)
    credit('cred_' + id, cred, x, y + h / 2 + 22 + (csize * 1.3 * n + 26) / 2, t + .7, size=csize)
    return h
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
def hatch_poly(poly, t, d, seed, step=34, l=30):
    """short diagonal strokes inside a polygon"""
    xs, ys = [p[0] for p in poly], [p[1] for p in poly]
    def inside(x, y):
        c = False
        for i in range(len(poly) - 1):
            (x0, y0), (x1, y1) = poly[i], poly[i + 1]
            if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0): c = not c
        return c
    rnd = random.Random(seed); pts = []
    y = min(ys) + step / 2
    while y < max(ys):
        x = min(xs) + step / 2 + (rnd.random() - .5) * 8
        while x < max(xs):
            if inside(x, y) and inside(x + l * .6, y - l * .6): pts.append((x, y))
            x += step
        y += step
    pts.sort(key=lambda p: p[0] + p[1])
    return [dict(points=[[round(x, 1), round(y, 1)], [round(x + l * .6, 1), round(y - l * .6, 1)]], t=round(t + d * i / max(1, len(pts)), 3), d=.04, lw=4) for i, (x, y) in enumerate(pts)]

# ---------------------------------------------------------------- the four ticks (same order and wording in every chapter)
ITEMS = ['население', 'территория', 'правительство', 'способность вступать в отношения', 'с другими государствами']
def checklist(x, y, t, title, gap=135):
    """title + four hand-drawn boxes with the four Montevideo items; returns the box centres"""
    write(title, x, y, t, 1.0, 'graphite', 70)
    B = []
    for i in range(4):
        by = y + 150 + i * gap; bc = (x + 36, by - 22); B.append(bc)
        line(rect(bc[0] - 34, bc[1] - 34, bc[0] + 34, bc[1] + 34), t + .5 + .25 * i, .25, 'graphite', 6, quiet=(i > 0))
        write(ITEMS[i], x + 110, by, t + .6 + .25 * i, .5, 'graphite', 56 if i < 3 else 50, quiet=True)
    write(ITEMS[4], x + 110, y + 150 + 3 * gap + 62, t + 1.6, .5, 'graphite', 50, quiet=True)
    return B
def tick(bc, t):
    x, y = bc; ev(t, 'tick', .3)
    return line([[x - 30, y - 2], [x - 8, y + 24], [x + 42, y - 46]], t, .3, 'blue', 11, quiet=True)
def cross(bc, t):
    x, y = bc; ev(t, 'cross', .3)
    line([[x - 28, y - 28], [x + 28, y + 28]], t, .18, 'red', 10, quiet=True)
    line([[x + 28, y - 28], [x - 28, y + 28]], t + .18, .18, 'red', 10, quiet=True)
def squiggle(bc, t):
    x, y = bc; return line([[x - 28 + 56 * i / 16, y + 9 * math.sin(i * math.pi / 4)] for i in range(17)], t, .35, 'graphite', 8)

# ---------------------------------------------------------------- outlines from Natural Earth
G = json.load(open('/tmp/world.geo.json'))
def rings_of(name):
    g = next(f for f in G['features'] if f['properties']['name'] == name)['geometry']
    P = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    return [p[0] for p in P]
def proj(lon0, lat0, k, cx, cy):
    c = math.cos(math.radians(lat0))
    return lambda lon, lat: [round(cx + (lon - lon0) * c * k, 1), round(cy - (lat - lat0) * k, 1)]

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ЗЕМЛЯ НИЧЬЯ?', 178.76, hard=True)

# ===================================================================== ROW 1 · Liberland
# --- p1 179.76–199.90 (covered by the 3D map clip): 2015, the Czech Vít Jedlička declared Liberland a country: a piece of the Danube
#     floodplain on the border of Croatia and Serbia, about 7 km²; the founder's logic: the two draw the border differently → nobody's
tag('Либерленд', 480, 470, L(179.9), size=60, rot=-1.5)
write('2015', 450, 690, L(180.0), .8, 'blue', 100)
write('Вит Едличка', 760, 690, L(181.3), 1.4, 'graphite', 84)
write('объявил страной Либерленд', 450, 800, L(182.6), 1.6, 'graphite', 58)
write('участок поймы Дуная', 450, 900, L(184.9), 1.3, 'graphite', 58)
write('на границе Хорватии и Сербии', 450, 985, L(186.2), 1.6, 'graphite', 58)
count('около {0} км²', [7], 450, 1140, L(188.6), 1.6, size=96)
tag('логика основателя', 480, 1280, L(191.1), size=50, rot=1)
write('Хорватия и Сербия', 450, 1450, L(192.5), 1.2, 'graphite', 58)
write('по-разному проводят границу,', 450, 1535, L(193.8), 1.5, 'graphite', 58)
write('значит, участок ничей', 450, 1640, L(195.4), 1.6, 'graphite', 62)
# the scheme: the river, two different border lines, a pocket between them
RV = [[x - 80, y] for x, y in [[1820, 760], [1790, 900], [1840, 1050], [1900, 1200], [1880, 1360], [1800, 1500], [1760, 1650], [1800, 1800]]]
line(RV, L(184.0), 1.0, 'blue', 16, alpha=.7)
write('Дунай', 1850, 860, L(184.6), .5, 'blue', 46)
POCKET = [[x - 80, y] for x, y in [[1835, 1040], [1660, 1110], [1600, 1260], [1640, 1420], [1810, 1490]]]
line(POCKET, L(193.0), .9, 'graphite', 6, dash=[18, 12])
line([[1790, 990], [1820, 1200], [1780, 1400], [1720, 1530]], L(193.8), .8, 'grey', 6, dash=[18, 12])
strokes_el(hatch_poly(POCKET + [[1800, 1360], [1820, 1200], [1755, 1040]], L(195.6), 1.0, 11), L(195.6), 1.0, 'blue', 4, .6)
write('Хорватия', 1420, 1700, L(186.4), .6, 'grey', 46, align='center')
write('Сербия', 1900, 1700, L(187.2), .5, 'grey', 46, align='center')
mounted('liber', 'print_liber', 2380, 1080, L(185.2), 720, 1.0,
        ['пойма Дуная у Горня-Сиги, снимок с МКС, 2007', 'NASA, общественное достояние'], rot=1.2)

# --- p2 200.45–219.21: Croatia disagrees and guards the land; Serbia: its sovereignty is not violated, but no recognition either;
#     2023: Croatian police removed the unauthorised buildings; «disputed land» and «nobody's land» turned out to be different things
mounted('danube', 'print_danube', 5480, 1010, L(200.6), 860, 1232 / 1852,
        ['Дунай у Эрдута (иллюстративное фото)', 'фото: Ян Пешула, общественное достояние'])
write('Хорватия', 3250, 600, L(200.5), 1.0, 'graphite', 84)
write('не согласна и охраняет участок', 3250, 700, L(201.4), 2.2, 'graphite', 58)
SH = (4560, 520)                                 # a shield: «guards»
line([[SH[0] - 70, SH[1] - 60], [SH[0] + 70, SH[1] - 60], [SH[0] + 70, SH[1] + 10], *bez([SH[0] + 70, SH[1] + 10], [SH[0] + 60, SH[1] + 70], [SH[0], SH[1] + 100], 10),
      *bez([SH[0], SH[1] + 100], [SH[0] - 60, SH[1] + 70], [SH[0] - 70, SH[1] + 10], 10), [SH[0] - 70, SH[1] - 60]], L(203.0), .7, 'graphite', 7, fill='grey', fillA=.2)
write('Сербия', 3250, 900, L(203.9), 1.0, 'graphite', 84)
write('её суверенитет не нарушен,', 3250, 1000, L(205.0), 1.6, 'graphite', 58)
write('но и страной это не признала', 3250, 1085, L(207.2), 2.0, 'graphite', 58)
write('2023', 3250, 1260, L(209.8), .8, 'blue', 96)
write('хорватская полиция убрала', 3250, 1360, L(211.8), 1.6, 'graphite', 58)
write('самовольные постройки', 3250, 1445, L(213.9), 1.5, 'graphite', 58)
HU = (4540, 1340)                                # a shed, then crossed
line([[HU[0] - 90, HU[1] + 70], [HU[0] - 90, HU[1] - 20], [HU[0], HU[1] - 95], [HU[0] + 90, HU[1] - 20], [HU[0] + 90, HU[1] + 70], [HU[0] - 90, HU[1] + 70]],
     L(212.3), .7, 'graphite', 7, fill='grey', fillA=.18)
line(rect(HU[0] - 22, HU[1] + 10, HU[0] + 22, HU[1] + 70), L(212.9), .2, 'graphite', 5, quiet=True)
line([[HU[0] - 120, HU[1] - 110], [HU[0] + 120, HU[1] + 100]], L(214.6), .25, 'red', 11)
line([[HU[0] + 120, HU[1] - 110], [HU[0] - 120, HU[1] + 100]], L(214.85), .25, 'red', 11, quiet=True)
tag('земля спорная', 3290, 1600, L(215.8), size=54, rot=-1)
tag('земля ничья', 4200, 1600, L(217.0), size=54, rot=1.5)
write('— разные вещи', 3250, 1820, L(218.2), 1.0, 'red', 64)

# --- p3 219.91–234.64: according to the founder, hundreds of thousands of citizenship applications; this number cannot be checked;
#     no permanent residents; a government exists but is not let onto the land; two ticks are empty, the third is on paper
tag('по словам основателя', 6380, 470, L(219.95), size=52, rot=-1.2)
write('заявок на гражданство —', 6330, 660, L(221.3), 1.3, 'graphite', 60)
write('сотни тысяч', 6330, 790, L(222.4), 1.0, 'blue', 92)
for i in range(4):                               # a pile of application forms
    line(rect(7500 + i * 26, 600 - i * 22, 7680 + i * 26, 830 - i * 22), L(222.3) + .1 * i, .2, 'graphite', 5, quiet=(i > 0), fill='grey', fillA=.08)
stamp('ПРОВЕРИТЬ НЕЛЬЗЯ', 8420, 720, L(224.0), size=76, rot=-5, color='graphite')
LB = checklist(6330, 1000, L(225.0), 'Либерленд по галочкам')
cross(LB[0], L(226.6)); write('постоянных жителей нет', 7250, LB[0][1] + 22, L(226.9), 1.2, 'graphite', 52)
write('есть, но на землю его не пускают', 7250, LB[2][1] + 22, L(228.4), 3.4, 'graphite', 52)
cross(LB[1], L(232.3)); write('земля спорная', 7250, LB[1][1] + 22, L(232.6), .8, 'grey', 52)
squiggle(LB[2], L(233.5)); tag('на бумаге', 8330, LB[2][1] + 100, L(233.6), size=50, rot=-2)

# ===================================================================== ROW 2 · Hutt River
# --- p4 235.19–254.58 (covered by the 3D map clip): «take your own land»: the Australian farmer Leonard Casley; 1970, a quarrel with the
#     authorities over wheat quotas; declared the farm a separate state, the Principality of Hutt River; about 75 km² in Western Australia
write('тогда берём свою землю', 450, 2640, L(235.7), 1.5, 'graphite', 66)
write('австралийский фермер', 450, 2750, L(237.6), 1.2, 'grey', 56)
write('Леонард Кейзли', 450, 2870, L(239.9), 1.2, 'graphite', 84)
write('1970', 450, 3030, L(241.1), .8, 'blue', 96)
write('поссорился с властями', 450, 3130, L(243.3), 1.3, 'graphite', 58)
write('из-за квот на пшеницу', 450, 3215, L(245.0), 1.2, 'graphite', 58)
WH = (1450, 3120)                                # a wheat ear
line([[WH[0], WH[1] + 120], [WH[0], WH[1] - 110]], L(245.5), .4, 'graphite', 6)
for j in range(5):
    yy = WH[1] - 80 + j * 34
    line(circle((WH[0] - 22, yy), [20, 11], 14), L(245.8) + .08 * j, .1, 'graphite', 5, quiet=True)
    line(circle((WH[0] + 22, yy), [20, 11], 14), L(245.85) + .08 * j, .1, 'graphite', 5, quiet=True)
write('объявил ферму отдельным государством:', 450, 3360, L(246.0), 2.0, 'graphite', 56)
write('княжество Хатт-Ривер', 450, 3490, L(248.2), 1.5, 'graphite', 84)
count('около {0} км²', [75], 450, 3640, L(250.5), 1.6, size=96)
AU = proj(134, -26, 26, 2380, 3170)
ring = max(rings_of('Australia'), key=len)
line([AU(*q) for q in ring], L(252.1), 1.2, 'graphite', 6, fill='grey', fillA=.12)
line([AU(129, -14.9), AU(129, -31.7)], L(253.2), .5, 'grey', 5, dash=[14, 10])
write('Западная Австралия', AU(121, -33)[0], AU(121, -33)[1] + 150, L(253.4), 1.0, 'grey', 46, align='center')
HR = AU(114.42, -28.07)
line(circle(HR, 12, 12), L(253.6), .1, 'graphite', 12, fill='grey', fillA=.9)
ink('ring', L(253.7), .35, 'red', c=HR, r=36, lw=6)

# --- p5 255.34–272.97: for years he issued stamps, coins and passports, once even declared war on Australia, and a few days later peace;
#     according to the principality itself 23 residents, about 40 000 tourists a year; for the guests a country, for the tax office not
mounted('casley', 'print_casley', 3620, 2930, L(255.4), 740, 1448 / 1636,
        ['Леонард Кейзли (справа) встречает гостя, 2010', 'фото: ElectronicsForDogs, CC BY-SA 4.0'], rot=-1.4, csize=26)
write('он годами выпускал', 4180, 2640, L(255.6), 1.3, 'graphite', 58)
write('марки, монеты и паспорта', 4180, 2730, L(257.1), 1.6, 'graphite', 58)
ST = (4300, 2960)                                # a postage stamp with a perforated edge
line([[ST[0] - 80 + 160 * (i // 2) / 6 if i % 2 == 0 else ST[0] - 80 + 160 * (i // 2 + .5) / 6, ST[1] - 100 + (0 if i % 2 == 0 else 8)] for i in range(13)] +
     [[ST[0] + 80, ST[1] + 100], [ST[0] - 80, ST[1] + 100], [ST[0] - 80, ST[1] - 100]], L(256.6), .5, 'graphite', 5, fill='grey', fillA=.15)
write('марки', ST[0], ST[1] + 175, L(257.0), .4, 'grey', 44, align='center')
mounted('coin', 'print_coin', 4720, 3000, L(257.6), 360, 1.0, ['монета княжества', 'Windshear, CC BY-SA 4.0'], rot=2, csize=26)
mounted('passport', 'print_passport', 5620, 2990, L(258.7), 640, 1344 / 1744,
        ['«паспортный контроль» в Хатт-Ривер, 2010', 'фото: ElectronicsForDogs, CC BY-SA 4.0'], rot=1, csize=26)
write('объявил Австралии войну,', 4180, 3450, L(259.4), 1.6, 'graphite', 56)
write('а через несколько дней — мир', 4180, 3540, L(261.1), 1.7, 'blue', 56)
tag('по данным самого княжества', 3300, 3620, L(262.95), size=50, rot=-1)
count('жителей: {0}', [23], 3250, 3810, L(265.0), 1.5, size=96)
count('туристов: около {0} в год', [40000], 3250, 3940, L(266.6), 2.4, size=72, sep=True)
write('для гостей это была страна,', 4760, 3730, L(269.2), 1.8, 'graphite', 58)
write('для налоговой службы — нет', 4760, 3825, L(271.1), 1.7, 'red', 58)
mounted('border', 'print_border', 5950, 3800, L(269.4), 560, 1268 / 1852,
        ['въезд в Хатт-Ривер с дороги, 2010', 'фото: ElectronicsForDogs, CC BY-SA 4.0'], rot=-1, csize=26)

# --- p6 273.68–292.38: Australia did not recognise the principality; 2017, the court of Western Australia ordered Casley to pay
#     more than 2 700 000 dollars of tax and called the sovereignty argument legally untenable; later dissolution announced, land sold
write('Австралия княжество не признала', 6650, 2640, L(273.7), 2.0, 'graphite', 62)
write('2017', 6650, 2800, L(275.8), .8, 'blue', 92)
write('— суд Западной Австралии', 6960, 2800, L(276.9), 1.5, 'graphite', 60)
write('обязал Кейзли заплатить', 6650, 2910, L(278.5), 1.6, 'graphite', 60)
count('больше {0}', [2700000], 6650, 3060, L(280.8), 2.2, size=96, sep=True)
write('долларов налогов', 6650, 3160, L(283.2), 1.2, 'blue', 62)
GV = (8400, 2960)                                # a court gavel
line([[GV[0] - 10, GV[1] - 40], [GV[0] + 140, GV[1] + 110]], L(277.2), .3, 'graphite', 12)
line([[GV[0] - 110, GV[1] - 20], [GV[0] + 10, GV[1] - 140], [GV[0] + 50, GV[1] - 100], [GV[0] - 70, GV[1] + 20], [GV[0] - 110, GV[1] - 20]],
     L(277.4), .4, 'graphite', 8, fill='grey', fillA=.3, quiet=True)
line([[GV[0] - 120, GV[1] + 200], [GV[0] + 60, GV[1] + 200]], L(277.7), .2, 'graphite', 8, quiet=True)
write('и назвал довод о суверенитете', 6650, 3310, L(284.0), 1.8, 'graphite', 58)
stamp('ЮРИДИЧЕСКИ НЕСОСТОЯТЕЛЕН', 7450, 3470, L(286.9), size=64, rot=-4, color='red')
write('позже княжество объявило о роспуске,', 6650, 3660, L(288.4), 2.4, 'graphite', 56)
write('а землю продали', 6650, 3750, L(291.1), 1.1, 'graphite', 56)

# --- p7 293.09–310.72: Casley's ticks: the land is real, the government is his family, residents exist though few; the fourth went worse:
#     Australia did not accept the principality's passports; you can draw your own country on a map, but that will not make it one for others
HB = checklist(9350, 2650, L(293.2), 'Хатт-Ривер по галочкам')
tick(HB[1], L(296.0)); write('земля настоящая', 10050, HB[1][1] + 22, L(296.2), 1.0, 'graphite', 50)
tick(HB[2], L(298.1)); write('его семья', 10050, HB[2][1] + 22, L(298.3), .6, 'graphite', 50)
tick(HB[0], L(298.9)); write('есть, хотя их мало', 10050, HB[0][1] + 22, L(299.4), 1.0, 'graphite', 50)
ink('ring', L(300.6), .5, 'graphite', c=[HB[3][0], HB[3][1]], r=62, lw=6)
cross(HB[3], L(303.8))
write('паспорта княжества Австралия не принимала', 9350, 3400, L(302.5), 2.3, 'red', 54)
write('свою страну можно нарисовать на карте,', 9350, 3570, L(305.4), 2.3, 'graphite', 54)
write('но другим она от этого не станет страной', 9350, 3660, L(307.95), 2.6, 'graphite', 54)
MP = (11250, 3080)                               # a country drawn on a map: an outline with a flag
line(rect(MP[0] - 200, MP[1] - 190, MP[0] + 200, MP[1] + 190), L(305.6), .5, 'grey', 5)
line([[MP[0] - 120, MP[1] + 60], [MP[0] - 140, MP[1] - 40], [MP[0] - 60, MP[1] - 110], [MP[0] + 60, MP[1] - 90], [MP[0] + 140, MP[1] - 10],
      [MP[0] + 110, MP[1] + 110], [MP[0] - 10, MP[1] + 130], [MP[0] - 120, MP[1] + 60]], L(306.0), .8, 'graphite', 6, fill='grey', fillA=.15)
line([[MP[0], MP[1] + 40], [MP[0], MP[1] - 140]], L(306.8), .2, 'graphite', 6, quiet=True)
line([[MP[0], MP[1] - 140], [MP[0] + 90, MP[1] - 115], [MP[0], MP[1] - 90]], L(307.0), .3, 'red', 5, fill='red', fillA=.5, quiet=True)

# ===================================================================== ROW 3 · Molossia, Key West
# --- p8 311.45–329.97: even smaller than a vegetable garden: the American Kevin Baugh lives in Nevada on a plot of less than 5 hectares,
#     the Republic of Molossia with its own currency; pays taxes, though he calls them foreign aid; a joke, but the taxes are real;
#     such invisible countries are called micronations
write('бывает и меньше огорода', 450, 4850, L(311.5), 1.5, 'graphite', 70)
write('американец', 450, 4970, L(313.0), .7, 'grey', 56)
write('Кевин Бо', 800, 4970, L(313.6), .9, 'graphite', 84)
write('живёт в Неваде', 450, 5070, L(314.6), 1.1, 'graphite', 58)
US = proj(-96, 38, 13.5, 2150, 5000)
usr = max(rings_of('United States of America'), key=len)
line([US(*q) for q in usr if q[1] < 50], L(314.2), 1.2, 'graphite', 5, fill='grey', fillA=.12)
NV = US(-119.6, 39.2)
line(circle(NV, 11, 12), L(315.3), .1, 'graphite', 12, fill='grey', fillA=.9)
ink('ring', L(315.4), .35, 'red', c=NV, r=32, lw=6)
write('Невада', NV[0], NV[1] - 50, L(315.6), .5, 'grey', 42, align='center')
count('участок меньше {0} гектаров', [5], 450, 5200, L(316.0), 1.8, size=70)
write('республика Молоссия', 450, 5350, L(318.0), 1.6, 'graphite', 80)
write('со своей валютой', 450, 5450, L(319.8), 1.2, 'graphite', 58)
CN = (1250, 5425)
line(circle(CN, 46, 30), L(320.2), .3, 'graphite', 6, fill='grey', fillA=.2)
line(circle(CN, 32, 24), L(320.4), .2, 'graphite', 4, quiet=True)
mounted('molossia', 'print_molossia', 3300, 5130, L(318.2), 820, 1285 / 1852,
        ['Республика Молоссия на параде в Неваде, 2024', 'фото: Wheeler Cowperthwaite, CC BY 2.0'], rot=1.2, csize=26)
write('налоги платит,', 450, 5620, L(321.0), 1.0, 'graphite', 58)
write('хотя называет их иностранной помощью', 450, 5705, L(322.0), 2.6, 'graphite', 58)
write('шутка, но налоги настоящие', 450, 5830, L(324.9), 2.0, 'blue', 62)
write('таких стран-невидимок зовут', 450, 5990, L(327.2), 1.7, 'graphite', 58)
tag('микронации', 1480, 5945, L(329.0), size=64, rot=-1.5)

# --- p9 330.52–352.76: Key West: in 1982 the Florida city declared independence in protest against a checkpoint on the road to the
#     islands, declared war on the USA, surrendered almost at once and asked for a billion in aid; the checkpoint was soon removed;
#     nothing is known about the billion; but those who really became countries went another way
write('ещё один случай: Ки-Уэст', 4500, 4850, L(330.6), 1.5, 'graphite', 70)
mounted('conch', 'print_conch', 4950, 5310, L(331.0), 820, 1284 / 1852,
        ['Республика Конч, Ки-Уэст (современное фото)', 'фото: Eric Salard, CC BY-SA 2.0'], rot=-1, csize=26)
FL = proj(-83, 28, 100, 6030, 5230)
run = [q for q in usr if q[0] > -87.6 and q[1] < 31.0 and q[0] < -79.9]
line([FL(*q) for q in run], L(332.2), 1.2, 'graphite', 6)
write('Флорида', FL(-82.6, 29.6)[0] + 40, FL(-82.6, 29.6)[1], L(333.2), .6, 'grey', 46, align='center')
KEYS = [(-80.43, 25.40), (-80.55, 25.12), (-80.78, 24.90), (-81.05, 24.74), (-81.35, 24.66), (-81.60, 24.60), (-81.78, 24.56)]
line([FL(*q) for q in KEYS], L(339.3), .9, 'grey', 5, dash=[12, 9])
KW = FL(-81.78, 24.56)
line(circle(KW, 11, 12), L(332.9), .1, 'graphite', 12, fill='grey', fillA=.9)
write('Ки-Уэст', KW[0] - 30, KW[1] + 70, L(333.0), .5, 'graphite', 46, align='center')
BP = FL(-80.47, 25.42)                           # the checkpoint on the road to the islands
line([[BP[0] - 46, BP[1] - 26], [BP[0] + 46, BP[1] - 26]], L(339.9), .2, 'graphite', 12)
line([[BP[0] - 40, BP[1] - 26], [BP[0] - 40, BP[1] + 20]], L(340.0), .1, 'graphite', 6, quiet=True)
write('блокпост', BP[0] + 70, BP[1] - 10, L(340.0), .5, 'grey', 42)
line([[BP[0] - 70, BP[1] - 80], [BP[0] + 60, BP[1] + 40]], L(345.8), .2, 'red', 10)
line([[BP[0] + 60, BP[1] - 80], [BP[0] - 70, BP[1] + 40]], L(346.0), .2, 'red', 10, quiet=True)
write('1982', 6800, 5000, L(333.0), .8, 'blue', 96)
write('город во Флориде', 6800, 5100, L(334.95), 1.2, 'graphite', 56)
write('объявил независимость', 6800, 5180, L(336.2), 1.3, 'graphite', 56)
write('в протест против блокпоста', 6800, 5290, L(337.6), 1.6, 'graphite', 56)
write('на дороге к островам', 6800, 5370, L(339.2), 1.2, 'graphite', 56)
write('объявил войну США', 6800, 5500, L(340.3), 1.6, 'graphite', 56)
arrow([7420, 5480], [7580, 5480], L(341.9), .3, 'graphite', 6, quiet=True)
write('сдался почти сразу', 7620, 5500, L(342.3), 1.6, 'graphite', 56)
write('и попросил миллиард помощи', 6800, 5595, L(343.8), 1.7, 'blue', 60)
write('блокпост вскоре убрали', 6800, 5720, L(345.5), 1.4, 'graphite', 58)
tag('про миллиард сведений нет', 6830, 5840, L(346.9), size=50, rot=1.2)
write('но те, кто стал страной по-настоящему,', 4550, 6030, L(348.8), 2.6, 'graphite', 58)
write('шли иным путём', 5850, 6030, L(351.6), 1.1, 'red', 64)
arrow([6450, 6010], [7900, 6010], L(352.0), .7, 'red', 8)

# ===================================================================== camera (one continuous camera)
SAFE_Y0, SAFE_Y1, SAFE_X = 50, 800, 90      # the drawing band on screen: nothing below y = 830 (subtitles)
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

c = Cam(*fit([380, 380, 3000, 1900]))                                   # behind the card: area A (Liberland)
c.to(L(179.0), 20.6, z=z_of(c) * 1.04)                                   # (under the clip) slow drift
c.fit(L(199.95), 1.4, [3200, 440, 6100, 1860], b=2.8)                    # Croatia guards, Serbia, 2023, disputed ≠ nobody's
c.to(L(201.4), 17.9, z=z_of(c) * 1.03)
c.fit(L(219.45), 1.4, [6250, 380, 9050, 1760], b=2.8)                    # the founder's numbers + Liberland's ticks
c.to(L(220.9), 13.6, z=z_of(c) * 1.03)
c.fit(L(234.8), 2.6, [380, 2520, 3000, 3880], a=1.6, b=2.4)              # (under the clip) area D, Hutt River
c.to(L(237.5), 17.3, z=z_of(c) * 1.03)
c.fit(L(254.85), 1.4, [3200, 2530, 6250, 3580], b=2.8)                   # stamps, coins, passports, war and peace
c.to(L(256.3), 6.4, z=z_of(c) * 1.02)
c.fit(L(262.75), 1.3, [3200, 3400, 6450, 4200], b=2.8)                   # 23 residents, 40 000 tourists, guests vs tax office
c.to(L(264.1), 9.2, z=z_of(c) * 1.02)
c.fit(L(273.4), 1.4, [6600, 2520, 9300, 3800], b=2.8)                    # not recognised, 2017 court, dissolution
c.to(L(274.9), 17.7, z=z_of(c) * 1.03)
c.fit(L(292.75), 1.4, [9250, 2520, 11550, 3720], b=2.8)                  # Hutt River's ticks
c.to(L(294.2), 16.9, z=z_of(c) * 1.03)
c.fit(L(311.2), 1.4, [380, 4700, 3800, 6060], b=2.8)                     # Molossia
c.to(L(312.7), 17.4, z=z_of(c) * 1.03)
c.fit(L(330.2), 1.4, [4400, 4720, 7900, 5700], b=2.8)                    # Key West: print, map, 1982
c.to(L(331.7), 8.0, z=z_of(c) * 1.02)
c.fit(L(339.8), 1.4, [4450, 4950, 8450, 6110], b=2.8)                    # war, surrender, a billion, the checkpoint, another way
c.to(L(341.3), 11.4, z=z_of(c) * 1.02)
c.fit(L(352.85), 2.1, [250, 250, 12150, 6300], b=3)                      # chapter pull-back: the whole wall

EV = [e for e in EV if e['type'] == 'key' or not any(a - .05 < e['t'] < b for a, b in COVER)]
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=91, texScale=.36, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=40000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
