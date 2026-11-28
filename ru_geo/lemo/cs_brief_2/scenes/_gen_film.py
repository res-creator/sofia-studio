#!/usr/bin/env python3
"""«Мысленный эксперимент» · Размеры стран · board film, PART 2: the end of «цена карты Меркатора» (paragraphs 6–8)
and the chapter «АФРИКА ПРОТИВ ГРЕНЛАНДИИ» (card at film 177.67).
FILM range 115.10–268.26 s (153.16 s). The renderer works in LOCAL time:  local = film − 115.10.
All times below are written as L(<film seconds>) so they can be checked against
ru_geo/country_sizes/film.json (segs → captions).
Wall (board px):
  row 1  (y  380…2150)  p6 the Mercator grid and Tissot circles · p7 Gauss, the orange peel · p8 sailors / teachers
  row 2  (y 2550…4700)  «АФРИКА ПРОТИВ ГРЕНЛАНДИИ» p9 UN numbers · p10 Greenland < Algeria · p11 inflated ×10–12 / ×1,2
  row 3  (y 5050…7250)  p12 area = length × width (×2 · ×2 = ×4) · p13 Russia vs Africa
Country outlines come from scenes/outlines.json (tools/geo/prep_outlines.py, open boundary data johan/world.geo.json):
«истинный размер» = Lambert equal-area centred on the shape; «карта Меркатора» = plain Mercator at the equator's scale.
Within one comparison both shapes share one scale (board px per km).
Ink: graphite = names, rules, facts · blue = measurement and numbers · red = only the decision / the one mark.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
OBJ = os.path.join(FILM, 'kit', 'objects')
OUTL = json.load(open(os.path.join(HERE, 'outlines.json')))
R0, R1 = 115.10, 268.26
DUR = round(R1 - R0, 3)                       # 153.16
L = lambda ft: round(ft - R0, 3)              # film time → local time
BW, BH = 13400, 7500

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
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
def circle(c, r, n=40, a0=-90, turn=1.0):
    rx, ry = (r, r) if not isinstance(r, (list, tuple)) else r
    return [[c[0] + rx * math.cos(math.radians(a0 + 360 * turn * i / n)), c[1] + ry * math.sin(math.radians(a0 + 360 * turn * i / n))] for i in range(n + 1)]
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85):
    ev(t, 'hatch', d); return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def check(x, y, t, s=1.0, color='graphite'):
    line([[x - 40 * s, y - 5 * s], [x - 10 * s, y + 30 * s], [x + 50 * s, y - 50 * s]], t, .25, color, 9)
def eye(c, t, s=1.0):
    x, y = c
    line(arc((x, y + 40 * s), 80 * s, 70 * s, 215, 325, 14), t, .2, lw=7)
    line(arc((x, y - 40 * s), 80 * s, 70 * s, 35, 145, 14), t + .2, .2, lw=7)
    line(circle((x, y), 17 * s, 18), t + .4, .12, lw=6)

# ---- country outlines from the boundary data -------------------------------------------------------------------
def plen(r): return sum(math.hypot(r[i + 1][0] - r[i][0], r[i + 1][1] - r[i][1]) for i in range(len(r) - 1))
def outline(name, proj, c, S, t, d, color='graphite', lw=7, moves=None, minpx=0, **k):
    """country `name` ('true' = equal-area, 'merc' = Mercator) centred at board point c, S board px per km.
    Rings are drawn one after another, each for a time ∝ its length (the big coast first)."""
    rs = [[[c[0] + x * S, c[1] + y * S] for x, y in r] for r in OUTL[name][proj]]
    rs = [r for r in rs if plen(r) >= minpx]
    tot = sum(plen(r) for r in rs); tt = t; out = []
    for r in rs:
        dd = max(.06, d * plen(r) / tot)
        kk = dict(k)
        if moves: kk['moves'] = moves
        out.append(line(r, tt, dd, color, lw, ea=1.3, eb=1.3, **kk)); tt += dd * .9
    return out
def size_of(name, proj, S): w, h = OUTL[name][proj + '_size']; return w * S, h * S
def slide(t, d, dx, dy, a=2, b=2.6):
    ev(t, 'slide', d); return [dict(t=round(t, 3), d=round(d, 3), dx=round(dx, 1), dy=round(dy, 1), a=a, b=b)]

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
type_card('АФРИКА ПРОТИВ ГРЕНЛАНДИИ', 177.67)

# ===================================================================== ROW 1 · the price of the Mercator map
# --- p6 115.07–135.16: stretched toward the poles; at 60° lengths ×2, areas ×4; the further north the more; only geometry
write('у такой карты есть цена', 420, 560, L(115.15), 1.5, 'graphite', 96)
EQ, U, GX0, NM, MW = 1990, 520, 470, 12, 136          # Mercator grid: equator y, px per radian, left x, meridians, 15° of longitude
GX1 = GX0 + NM * MW
my = lambda lat: EQ - U * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))   # true Mercator spacing
YTOP = my(78)
for i in range(NM + 1):                                   # meridians: straight and parallel
    x = GX0 + i * MW; line([[x, EQ], [x, YTOP]], L(117.05) + .07 * i, .35, 'grey', 4)
line([[GX0 + 40, EQ - 40], [GX0 + 3 * MW + 110, my(70)]], L(118.3), .9, 'blue', 8, arrow=True)       # a constant course = a straight line
write('курс = прямая', GX0 + 3 * MW + 60, my(70) - 50, L(118.7), .9, 'blue', 64)
for i, lat in enumerate((15, 30, 45, 60, 75)):            # parallels: further apart toward the pole
    y = my(lat); line([[GX0, y], [GX1, y]], L(119.85) + .3 * i, .35, 'grey', 4)
    write(f'{lat}°', GX0 - 20, y + 22, L(119.95) + .3 * i, .25, 'grey', 54, align='right')
arrow([GX1 + 90, my(10)], [GX1 + 90, my(76)], L(120.3), 1.2, 'blue', 9)
write('растягивают', GX1 + 140, my(52), L(120.6), .8, 'graphite', 70)
write('к полюсам', GX1 + 140, my(52) + 85, L(121.2), .6, 'graphite', 70)
line([[GX0 - 30, EQ], [GX1 + 30, EQ]], L(122.0), .5, 'graphite', 9)                  # the equator
write('экватор', GX0 - 20, EQ + 22, L(122.2), .4, 'graphite', 54, align='right')
TX = GX0 + 8 * MW + MW / 2                                  # Tissot circles: one column, radius ∝ 1/cos φ
R_EQ = 34
def tissot(lat, t, color='blue'):
    r = R_EQ / math.cos(math.radians(lat)); line(circle((TX, my(lat)), r, 40), t, .45, color, 7); return r
tissot(0, L(122.4))
write('почти честно', TX + 70, EQ - 40, L(122.9), .9, 'graphite', 64)
r60 = tissot(60, L(124.3))
write('60°', TX - r60 - 40, my(60) + 20, L(124.5), .3, 'graphite', 64, align='right')
write('длины ×2', TX + r60 + 30, my(60) - 10, L(126.0), .7, 'blue', 70)
write('площади ×4', TX + r60 + 30, my(60) + 75, L(128.2), .8, 'blue', 70)
tissot(30, L(129.6)); tissot(45, L(130.0)); tissot(75, L(130.5))
write('чем севернее, тем сильнее', GX1 + 140, my(75) - 10, L(130.0), 1.6, 'graphite', 64)
write('хитрости нет —', GX1 + 140, EQ - 200, L(132.4), 1.0, 'graphite', 76)
write('только геометрия', GX1 + 140, EQ - 100, L(133.8), 1.1, 'graphite', 76)

# --- p7 135.71–160.66: a map without distortion? No. Gauss, 1827: a sphere cannot be flattened; the orange peel;
#     Mercator hardly thought of schoolchildren; subscribe: we will return many to their real sizes
P7 = 4000
write('а без искажений?', P7, 560, L(135.75), 1.6, 'graphite', 96)
el(type='stamp', text='НЕЛЬЗЯ', xy=[P7 + 1080, 535], size=92, rot=-6, t=L(138.85), color='red'); ev(L(138.85), 'stamp', .2)
GA = (P7 + 330, 1300)
write('1827 год', P7 + 40, 815, L(139.5), 1.4, 'blue', 96)
printd('gauss', 'print_gauss', GA[0], GA[1], L(141.6), w=520, rot=-1.5, size='mid')
magnet(GA[0] - 170, GA[1] - 300, L(142.05), r=20); magnet(GA[0] + 175, GA[1] - 305, L(142.15), r=20)
tag('математик Гаусс', GA[0] - 230, GA[1] + 430, L(142.3), size=58, rot=1.2)
SP = (P7 + 1250, 1170)                                    # the sphere …
line(circle(SP, 190, 48), L(144.0), .5, lw=8)
line(arc(SP, 70, 190, -90, 90, 16), L(144.5), .2, 'grey', 4); line(arc(SP, 70, 190, 90, 270, 16), L(144.65), .2, 'grey', 4)
line(arc(SP, 190, 55, 0, 180, 16), L(144.8), .2, 'grey', 4)
arrow([SP[0] + 220, SP[1]], [SP[0] + 420, SP[1]], L(145.0), .4, 'graphite', 8)
PL = (SP[0] + 700, SP[1])                                 # … onto a plane: does not go
line([[PL[0] - 220, PL[1] - 160], [PL[0] + 220, PL[1] - 160], [PL[0] + 220, PL[1] + 160], [PL[0] - 220, PL[1] + 160], [PL[0] - 220, PL[1] - 160]], L(145.4), .5, lw=7)
write('?', PL[0], PL[1] + 45, L(145.9), .3, 'graphite', 140, align='center')
write('шар не развернуть на плоскость', SP[0] - 230, 1530, L(144.2), 2.2, 'graphite', 70)
write('ничего не исказив', SP[0] - 230, 1625, L(146.6), 1.1, 'graphite', 70)
OR = (P7 + 3150, 1150)                                    # the orange peel laid flat: six petals, torn gaps between them
line(circle((OR[0], OR[1]), 60, 20), L(147.95), .2, lw=6)
for i in range(6):
    a = math.radians(-90 + 60 * i); a1, a2 = a - math.radians(22), a + math.radians(22)
    tip = (OR[0] + 300 * math.cos(a), OR[1] + 300 * math.sin(a))
    pts = [[OR[0] + 60 * math.cos(a1), OR[1] + 60 * math.sin(a1)], [OR[0] + 200 * math.cos(a1 + .1), OR[1] + 200 * math.sin(a1 + .1)], list(tip),
           [OR[0] + 200 * math.cos(a2 - .1), OR[1] + 200 * math.sin(a2 - .1)], [OR[0] + 60 * math.cos(a2), OR[1] + 60 * math.sin(a2)]]
    line(pts, L(148.2) + .2 * i, .22, 'graphite', 7)
write('апельсиновая корка', OR[0], OR[1] - 350, L(148.3), 1.3, 'graphite', 66, align='center')
for i in range(6):                                        # the gaps: where the peel tears
    a = math.radians(-60 + 60 * i); line([[OR[0] + 90 * math.cos(a), OR[1] + 90 * math.sin(a)], [OR[0] + 210 * math.cos(a), OR[1] + 210 * math.sin(a)]], L(150.3) + .07 * i, .1, 'grey', 5, dash=[14, 12])
write('ровно не ляжет', OR[0], OR[1] + 410, L(150.3), 1.0, 'graphite', 72, align='center')
MP = (P7 + 4450, 1080)
printd('mercator', 'print_mercator', MP[0], MP[1], L(151.6), w=400, rot=1.5, size='mid')
magnet(MP[0], MP[1] - 290, L(152.0), r=20)
tag('Меркатор', MP[0] - 150, MP[1] + 380, L(152.1), size=56, rot=-1.5)
write('о школьниках?', MP[0] + 280, MP[1] - 100, L(152.6), .8, 'graphite', 70)
write('вряд ли', MP[0] + 280, MP[1] + 0, L(153.4), .6, 'graphite', 70)
AF_S = .055                                                # the small Africa (true size) for «вернём к настоящим размерам»
SUBX = P7 + 2350
tag('подпишитесь', SUBX - 650, 1900, L(156.6), size=66, rot=-2)
outline('africa', 'true', (SUBX + 900, 1880), AF_S, L(157.2), 1.2, 'graphite', 6, minpx=40)
write('вернём к настоящим размерам', SUBX - 650, 2085, L(158.3), 2.0, 'graphite', 66)
write('обидно за Африку?', SUBX - 650, 1745, L(154.3), 1.3, 'graphite', 66)

# --- p8 161.21–175.53: for sailors an excellent map; for a geography teacher worse; ~5 centuries later checked against
#     Greenland at every school lesson, though it was made for something else entirely
P8 = 10000
SH = (P8 + 420, 1000)
printd('ship', 'print_ship', SH[0], SH[1], L(161.3), w=760, rot=-1.5, size='big')
magnet(SH[0] - 330, SH[1] - 270, L(161.75), r=20); magnet(SH[0] + 330, SH[1] - 280, L(161.85), r=20)
tag('морякам', SH[0] - 360, 1430, L(161.9), size=62, rot=1.5)
write('отличная карта', SH[0] - 360, 1590, L(162.4), .9, 'graphite', 70)
check(SH[0] + 230, 1560, L(163.2), 1.2)
tag('учителю географии', P8 + 1080, 700, L(163.5), size=62, rot=-1.5)
write('хуже', P8 + 1130, 880, L(165.9), .5, 'red', 84)
GLM_S = .055
GLM = (P8 + 1700, 1330)                                    # Greenland as the Mercator map shows it
outline('greenland', 'merc', GLM, GLM_S, L(168.2), 1.6, 'graphite', 6, minpx=30)
write('Гренландия', GLM[0] + 230, GLM[1] - 60, L(169.0), .7, 'graphite', 60)
write('карта Меркатора', GLM[0] + 230, GLM[1] + 20, L(169.5), .7, 'grey', 50)
write('почти пять веков спустя', P8 + 1080, 1650, L(168.3), 1.4, 'graphite', 66)
write('на каждом уроке', P8 + 1080, 1745, L(170.8), 1.0, 'graphite', 66)
write('а делалась совсем для другого', P8 + 1080, 1900, L(172.9), 1.6, 'graphite', 66)
line([[P8 + 1060, 1880], [SH[0] + 120, 1660], [SH[0] + 60, SH[1] + 300]], L(174.6), .7, 'graphite', 6, arrow=True, dash=[18, 14])

# ===================================================================== ROW 2 · «АФРИКА ПРОТИВ ГРЕНЛАНДИИ»
# --- p9 178.67–197.83: one UN table (land + inland water); Africa with islands ≈ 30 million km²; Greenland ~14× smaller;
#     the map got nothing mixed up; then why? later
S9 = .12
AF = (900, 3420)                                           # Africa, true size (7 900 km tall → 948 px)
tag('таблица ООН', 420, 2730, L(178.8), size=80, rot=-1.5)
write('суша + внутренние воды', 1080, 2760, L(181.3), 1.5, 'graphite', 84)
outline('africa', 'true', AF, S9, L(184.6), 2.0, 'graphite', 8, minpx=25)
write('истинный размер', AF[0], 3990, L(185.6), .9, 'grey', 64, align='center')
write('Африка с островами', 1550, 3080, L(184.9), 1.3, 'graphite', 90)
count('около {0} млн км²', [30], 1550, 3230, L(186.9), 1.6, size=120)
GLT = (1720, 3600)
outline('greenland', 'true', GLT, S9, L(189.7), .9, 'graphite', 8, minpx=15)
write('Гренландия', 1900, 3560, L(190.2), .7, 'graphite', 90)
count('в {0} раз меньше', [14], 1900, 3700, L(191.2), 1.6, size=110)
write('карта ничего не напутала', 1550, 3900, L(193.5), 1.6, 'graphite', 84)
write('тогда зачем так?', 1550, 4020, L(195.3), .9, 'graphite', 84)
tag('об этом чуть позже', 2330, 3995, L(196.4), size=60, rot=1.5)

# --- p10 198.53–213.66: Greenland, ice and all, is smaller than Algeria alone, Africa's largest country;
#     the eye is used to the picture, the ruler does not lie
S10 = .34
P10 = 4100
GL10, AL = (P10 + 2000, 3450), (P10 + 800, 3480)
MV10 = dict(t=L(203.9), d=1.6, dx=AL[0] - GL10[0], dy=AL[1] - GL10[1], a=2, b=2.6)
outline('greenland', 'true', GL10, S10, L(198.6), 1.6, 'graphite', 8, minpx=30, moves=slide(MV10['t'], MV10['d'], MV10['dx'], MV10['dy']))
tag('Гренландия', GL10[0] - 330, 2800, L(199.4), size=70, rot=-1.5, moves=[MV10])
tag('со всем льдом', GL10[0] - 300, 2930, L(201.3), size=58, rot=1.2, moves=[MV10])
outline('algeria', 'true', AL, S10, L(203.0), .9, 'blue', 8)
write('Алжир', AL[0], 4060, L(203.4), .5, 'blue', 90, align='center')
write('самая большая страна Африки', AL[0], 4180, L(205.2), 1.6, 'blue', 76, align='center')
write('истинный размер', AL[0] - 380, 3440, L(202.4), .8, 'grey', 64, align='right')
EYE = (P10 + 3250, 2930)
eye(EYE, L(207.4), 1.3)
write('глаз привык к картинке', P10 + 2850, 3170, L(207.8), 1.4, 'graphite', 70)
MS = .05                                                    # the Mercator picture the eye remembers (one scale for both)
outline('greenland', 'merc', (P10 + 3250, 3640), MS, L(208.4), 1.0, 'grey', 5, minpx=20)
outline('algeria', 'merc', (P10 + 3250, 4040), MS, L(209.2), .4, 'grey', 5)
write('карта Меркатора', P10 + 3250, 4220, L(209.5), .8, 'grey', 60, align='center')
BX, BY, BWD, BK = P10 + 3900, 4100, 150, 1 / 5200       # area bars: height ∝ area (true areas from the same data)
for i, (nm, lab) in enumerate((('algeria', 'Алжир'), ('greenland', 'Гренландия'))):
    h = OUTL[nm]['area_true'] * BK; x = BX + i * 260
    line([[x, BY], [x, BY - h], [x + BWD, BY - h], [x + BWD, BY]], L(210.1) + .4 * i, .4, 'blue' if i == 0 else 'graphite', 7)
    write(lab, x + BWD / 2, BY + 80, L(210.3) + .4 * i, .4, 'blue' if i == 0 else 'graphite', 58, align='center')
line([[BX - 40, BY], [BX + 450, BY]], L(210.0), .2, 'grey', 5)
TOPB = BY - OUTL['algeria']['area_true'] * BK
write('площадь', BX + 205, TOPB - 110, L(210.6), .5, 'graphite', 70, align='center')
write('линейка не обманывает', BX + 205, TOPB - 230, L(211.8), 1.4, 'graphite', 64, align='center')
el(type='ruler', id='ruler', **{'from': [BX - 70, TOPB - 26], 'to': [BX + 480, TOPB - 26]},
   w=36, z=12, inset=40, magnetR=16, arrive=dict(t=L(211.75), kind='drop', d=.4, lift=160, spin=.4, land=.6))
ev(L(212.0), 'ruler', .4)

# --- p11 214.36–231.65: on the map Greenland is inflated ~10–12× (far north); Australia, nearer the equator, only 1.2×;
#     the cold countries suffer most, the warm ones look more modest than they are
S11 = .085
P11 = 9600
G11M, G11T = (P11 + 400, 3350), (P11 + 1050, 3660)
outline('greenland', 'merc', G11M, S11, L(214.4), 1.6, 'grey', 6, minpx=20)
write('карта Меркатора', G11M[0], 3900, L(215.0), .8, 'grey', 66, align='center')
outline('greenland', 'true', G11T, S11, L(215.6), .8, 'graphite', 7, minpx=12)
write('истинный размер', G11T[0], 3900, L(216.2), .8, 'graphite', 66, align='center')
write('раздута в 10–12 раз', P11 + 780, 2800, L(216.8), 1.6, 'blue', 100)
write('примерно', P11 + 780, 2920, L(217.6), .5, 'blue', 66)
write('далеко на севере', P11 + 780, 3270, L(219.2), 1.3, 'graphite', 70)
arrow([P11 + 1450, 3250], [P11 + 1450, 3040], L(219.4), .4, 'graphite', 7)
A11M, A11T = (P11 + 2500, 3550), (P11 + 3100, 3550)
outline('australia', 'merc', A11M, S11, L(221.6), 1.0, 'grey', 6, minpx=20)
write('карта Меркатора', A11M[0], 3830, L(222.2), .8, 'grey', 66, align='center')
outline('australia', 'true', A11T, S11, L(222.6), 1.0, 'graphite', 7, minpx=20)
write('истинный размер', A11T[0], 3830, L(223.0), .8, 'graphite', 66, align='center')
write('Австралия', P11 + 2250, 3070, L(221.8), .8, 'graphite', 90)
write('ближе к экватору', P11 + 2250, 3190, L(222.4), 1.0, 'graphite', 70)
write('всего в 1,2 раза', P11 + 2250, 2860, L(224.6), 1.4, 'blue', 96)
write('холодным странам — обиднее всего', P11 + 300, 4130, L(226.5), 2.0, 'graphite', 84)
write('тёплые кажутся скромнее, чем есть', P11 + 300, 4255, L(229.0), 2.0, 'graphite', 84)

# ===================================================================== ROW 3 · area is length × width; Russia vs Africa
# --- p12 232.20–247.98: the trap in the words: area = length × width; stretch ×2 each way → area ×4; small-looking
#     distortion on screen → a huge difference in area
tag('ловушка в самих словах', 420, 5230, L(232.3), size=70, rot=-1.5)
write('площадь = длина × ширина', 420, 5440, L(234.15), 2.4, 'graphite', 90)
Q = 260; QX, QY = 620, 6280                                 # bottom-left of the small square
line([[QX, QY], [QX + Q, QY], [QX + Q, QY - Q], [QX, QY - Q], [QX, QY]], L(234.4), .6, 'graphite', 8)
write('длина', QX + Q / 2, QY + 75, L(234.9), .5, 'grey', 58, align='center')
write('ширина', QX - 25, QY - Q / 2 + 18, L(235.6), .6, 'grey', 58, align='right')
arrow([QX + Q + 50, QY - Q / 2], [QX + Q + 250, QY - Q / 2], L(237.1), .4, 'graphite', 7)
BXQ = QX + Q + 320                                            # the big square: ×2 each way
line([[BXQ, QY], [BXQ + 2 * Q, QY], [BXQ + 2 * Q, QY - 2 * Q], [BXQ, QY - 2 * Q], [BXQ, QY]], L(237.5), .8, 'graphite', 8)
dim([BXQ, QY + 60], [BXQ + 2 * Q, QY + 60], L(238.0), .6)
write('×2', BXQ + Q, QY + 150, L(238.3), .3, 'blue', 76, align='center')
dim([BXQ - 60, QY], [BXQ - 60, QY - 2 * Q], L(238.6), .6)
write('×2', BXQ - 90, QY - Q + 25, L(238.9), .3, 'blue', 76, align='right')
line([[BXQ + Q, QY], [BXQ + Q, QY - 2 * Q]], L(239.5), .3, 'grey', 5, dash=[16, 12])
line([[BXQ, QY - Q], [BXQ + 2 * Q, QY - Q]], L(239.8), .3, 'grey', 5, dash=[16, 12])
for i, (cx, cy) in enumerate(((0, 1), (1, 1), (0, 0), (1, 0))):
    write(str(i + 1), BXQ + cx * Q + Q / 2, QY - cy * Q - Q / 2 + 30, L(240.2) + .3 * i, .2, 'blue', 80, align='center')
count('площадь ×{0}', [4], BXQ + 2 * Q + 80, QY - 2 * Q + 40, L(241.2), 1.0, size=100)
write('небольшое с виду искажение', 2500, 5800, L(242.2), 2.0, 'graphite', 80)
arrow([2700, 5860], [2700, 6010], L(244.3), .4, 'graphite', 7)
write('огромная разница в площадях', 2500, 6120, L(244.7), 2.4, 'red', 80)

# --- p13 248.53–265.95: Russia looms on the map; 1.5–2× smaller than Africa: 17 million and a bit against 30;
#     still the largest country on the planet (nobody disputes it); a whole continent is bigger than any country
S13 = .1
P13 = 5000
RUM = (P13 + 1000, 5750)
outline('russia', 'merc', RUM, S13, L(248.6), 1.9, 'grey', 6, minpx=35)
write('Россия', P13 + 450, 6480, L(249.0), .6, 'graphite', 90, align='center')
write('карта Меркатора', P13 + 850, 6480, L(249.4), .9, 'grey', 66)
AF13 = (P13 + 2800, 5720)
outline('africa', 'true', AF13, S13, L(250.8), 1.6, 'blue', 8, minpx=25)
write('Африка', AF13[0], 6240, L(251.2), .6, 'blue', 84, align='center')
RUT0 = (P13 + 3700, 5560)
outline('russia', 'true', RUT0, S13, L(251.6), 1.4, 'graphite', 7, minpx=25, moves=slide(L(253.4), 1.6, AF13[0] - RUT0[0], 0))
write('истинный размер', P13 + 2350, 5200, L(251.0), .9, 'grey', 66)
write('в 1,5–2 раза меньше', P13 + 4250, 5350, L(251.8), 1.4, 'blue', 90)
count('{0} млн с небольшим', [17], P13 + 4250, 5520, L(253.0), 1.5, size=100)
write('против 30', P13 + 4250, 5650, L(255.2), .9, 'blue', 100)
tag('самая большая страна планеты', P13 + 4250, 5860, L(256.8), size=66, rot=-1)
write('это никто не оспаривает', P13 + 4250, 6050, L(259.5), 1.6, 'graphite', 72)
write('но целый континент больше любой страны', P13 + 2350, 6430, L(262.3), 2.4, 'red', 84)

# ===================================================================== camera (one continuous camera; the card hides the jump)
c = Cam(*fit([360, 380, 2700, 1200]))
c.to(L(115.3), 1.6, z=z_of(c) * 1.01)
c.fit(L(116.8), 1.6, [300, 380, 3400, 2100], b=2.8)                    # the grid draws, the course is straight
c.fit(L(121.8), 1.4, [300, 450, 3200, 2150], b=2.8)                   # at the equator nearly honest
c.fit(L(129.3), 1.4, [300, 380, 3400, 2100], b=2.8)                    # further north, only geometry
c.to(L(131.0), 4.4, z=z_of(c) * 1.02)
c.fit(L(135.5), 1.4, [P7 - 100, 380, P7 + 2300, 1800], b=2.8)          # without distortion? NO. 1827, Gauss
c.fit(L(143.7), 1.4, [P7 - 100, 450, P7 + 2400, 1830], b=2.8)          # the sphere does not go flat
c.fit(L(147.6), 1.3, [P7 + 900, 650, P7 + 3700, 1620], b=2.8)         # the orange peel
c.fit(L(151.3), 1.2, [P7 + 2700, 640, P7 + 5200, 1620], b=2.8)         # Mercator, schoolchildren?
c.fit(L(154.0), 1.4, [P7 + 900, 1400, P7 + 3900, 2150], b=2.8)        # subscribe: back to real size
c.fit(L(161.0), 1.4, [P8 - 100, 600, P8 + 2400, 1700], b=2.8)          # for sailors
c.fit(L(168.0), 1.4, [P8 - 100, 600, P8 + 2700, 2050], b=2.8)          # 5 centuries later, Greenland, made for another job
c.to(L(170.0), 5.0, z=z_of(c) * 1.02)
c.fit(L(175.6), 1.9, [250, 300, P8 + 2900, 2200], b=3)                 # pull-back: row 1 as a whole
c.fit(L(177.75), .6, [300, 2560, 3300, 3400])                          # (under the card) row 2 corner
c.fit(L(184.3), 1.5, [300, 2620, 3100, 4080], b=2.8)                   # Africa, 30 million, Greenland ×14 smaller
c.to(L(186.0), 7.0, z=z_of(c) * 1.02)
c.fit(L(198.4), 1.4, [P10 - 250, 2700, P10 + 2600, 4250], b=2.8)             # Greenland vs Algeria
c.fit(L(207.2), 1.5, [P10 + 2650, 2750, P10 + 4500, 4300], b=2.8)      # the eye / the ruler
c.fit(L(214.2), 1.5, [P11 - 50, 2650, P11 + 1700, 3960], b=2.8)        # Greenland ×10–12
c.fit(L(221.3), 1.4, [P11 - 100, 2650, P11 + 3600, 4300], b=2.8)       # Australia ×1.2; cold / warm
c.to(L(222.8), 8.5, z=z_of(c) * 1.03)
c.fit(L(232.0), 1.5, [300, 5100, 2900, 6450], b=2.8)                   # area = length × width
c.fit(L(241.9), 1.4, [300, 5100, 4100, 6450], b=2.8)                   # small-looking → huge
c.fit(L(248.4), 1.5, [P13 - 100, 5100, P13 + 2100, 6560], b=2.8)       # Russia on the Mercator map
c.fit(L(250.6), 1.6, [P13 + 2300, 5100, P13 + 6100, 6500], b=2.8)      # true size: Russia onto Africa
c.to(L(252.5), 9.0, z=z_of(c) * 1.02)
c.fit(L(261.9), 1.3, [P13 - 100, 5100, P13 + 6100, 6560], b=2.8)       # a continent > any country
c.fit(L(266.1), 2.0, [250, 300, 13300, 6900], b=3)               # pull-back: the chapter as a whole
# the whole wall sits further right (keeps the board's left frame out of the opening shots)
OX = 700
def shift(e, dx):
    for k in ('xy', 'from', 'to', 'c'):
        if isinstance(e.get(k), list) and len(e[k]) == 2 and not isinstance(e[k][0], list): e[k] = [e[k][0] + dx, e[k][1]]
    if 'points' in e: e['points'] = [[x + dx, y] for x, y in e['points']]
    for st in e.get('strokes', []): st['points'] = [[x + dx, y] for x, y in st['points']]
    for ex in e.get('ext', []): ex[0] += dx
for e in E: shift(e, OX)
c.base['x'] += OX; BW += OX

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=53, texScale=.4, ghosts=220, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=36000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
