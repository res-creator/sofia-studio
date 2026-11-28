#!/usr/bin/env python3
"""«Мысленный эксперимент» · Как создать свою страну · board film, PART 4.
FILM range 355.06–462.81 s (107.75 s): chapter «КТО СТАЛ НАСТОЯЩЕЙ» (card at 355.06): the UN 51 → 193, South Sudan, East Timor,
Eritrea, the common pattern (vote by agreement with the former state, under international control), Kosovo.
The renderer works in LOCAL time:  local = film − 355.06.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/create_country/film.json (segs → captions).
No covered windows in this range.
Wall (board px):
  row 1 (y  400…1900)  A the UN: 1945, 51 → 193 (bars), almost four times, «and your platform?»   (prints un_hall, un_flags)
                        B South Sudan: January 2011, almost 4 million, about 99 %, the 2005 peace agreement, July   (prints, Sudan map)
                        C East Timor: UN vote, UN transitional administration, 2002, years of work   (ballot print, outline)
  row 2 (y 2450…3900)  D Eritrea: UN-observed referendum, 1993, years of struggle, no flag on an empty platform (outline)
                        E the common pattern: vote + agreement + international control → flag, anthem, a seat at the UN;
                          the four ticks (the fourth first)   (ballot_box print)
                        F Kosovo: 2008, more than 100 countries, Serbia/Russia/China no, not in the UN, 2010 ICJ (icj_palace print)
Outlines: /tmp/world.geo.json (johan/world.geo.json, Natural Earth 1:110m, public domain), plain equirectangular (cos φ0).
Ink: graphite = names/facts · blue = measurement and numbers, ticks · red = only the break / the decision, crosses.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 355.06, 462.81
DUR = round(R1 - R0, 3)                       # 107.75
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = []
BW, BH = 10900, 4300

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=[[round(x, 1), round(y, 1)] for x, y in pts], lw=lw, **k)
FS = 1.3
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

def platform(cx, cy, t, flag_t=None):
    """an empty sea platform: deck on two legs over the water, a little hut; optionally a flag on it"""
    line([[cx - 190, cy + 175 + 10 * math.sin(i)] for i in range(1)] + [[cx - 190 + 380 * i / 16, cy + 175 + 9 * math.sin(i * math.pi / 2)] for i in range(17)], t, .5, 'blue', 6, alpha=.8)
    line([[cx - 110, cy + 200], [cx - 110, cy]], t + .2, .2, 'graphite', 9, quiet=True)
    line([[cx + 110, cy + 200], [cx + 110, cy]], t + .3, .2, 'graphite', 9, quiet=True)
    line(rect(cx - 170, cy - 50, cx + 170, cy), t + .45, .35, 'graphite', 7, fill='grey', fillA=.18, quiet=True)
    line(rect(cx - 70, cy - 130, cx + 40, cy - 50), t + .75, .25, 'graphite', 6, quiet=True)
    if flag_t is not None:
        line([[cx + 120, cy - 50], [cx + 120, cy - 280]], flag_t, .25, 'graphite', 7)
        line([[cx + 120, cy - 280], [cx + 260, cy - 245], [cx + 120, cy - 210]], flag_t + .2, .3, 'graphite', 6, fill='grey', fillA=.45, quiet=True)
def flag_icon(x, y, t):
    line([[x, y + 40], [x, y - 90]], t, .2, 'graphite', 7)
    line(rect(x, y - 90, x + 110, y - 20), t + .15, .3, 'graphite', 6, fill='blue', fillA=.25, quiet=True)
def note_icon(x, y, t):
    line(circle((x, y + 20), [26, 19], 18), t, .25, 'graphite', 7, fill='graphite', fillA=.8)
    line([[x + 24, y + 16], [x + 24, y - 90], [x + 70, y - 60]], t + .2, .3, 'graphite', 7, quiet=True)
def table_icon(x, y, t):
    line([[x - 90, y - 20], [x + 90, y - 20]], t, .2, 'graphite', 9)
    line([[x - 70, y - 20], [x - 70, y + 50]], t + .15, .1, 'graphite', 7, quiet=True)
    line([[x + 70, y - 20], [x + 70, y + 50]], t + .2, .1, 'graphite', 7, quiet=True)
    line([[x + 125, y - 80], [x + 125, y + 50], [x + 125, y - 10], [x + 175, y - 10], [x + 175, y + 50]], t + .3, .3, 'graphite', 7, quiet=True)

# ===================================================================== typewriter card on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('КТО СТАЛ НАСТОЯЩЕЙ', 355.06, hard=True)

# ===================================================================== ROW 1 · A the UN
# --- p1 356.06–370.98: 1945, the UN was founded with 51 states; today 193; almost four times more; so after the war countries did appear;
#     how were they different from your platform?
write('1945', 450, 640, L(356.4), .8, 'blue', 100)
write('создавали ООН', 790, 640, L(358.3), 1.2, 'graphite', 84)
count('вошли {0} государство', [51], 450, 790, L(359.4), 2.0, size=80)
count('сегодня их {0}', [193], 450, 920, L(361.7), 1.7, size=80)
BX0, BY = 520, 1690; KB = 2.9                    # bars: 51 and 193 states
line(rect(BX0, BY - 51 * KB, BX0 + 180, BY), L(360.7), .5, 'blue', 7, fill='blue', fillA=.25)
write('51', BX0 + 90, BY - 51 * KB - 30, L(361.1), .4, 'blue', 60, align='center', quiet=True)
line(rect(BX0 + 300, BY - 193 * KB, BX0 + 480, BY), L(362.0), .8, 'blue', 7, fill='blue', fillA=.25)
write('193', BX0 + 390, BY - 193 * KB - 30, L(362.8), .5, 'blue', 60, align='center', quiet=True)
line([[BX0 - 60, BY], [BX0 + 560, BY]], L(360.6), .3, 'graphite', 6, quiet=True)
write('1945', BX0 + 90, BY + 75, L(361.0), .4, 'grey', 46, align='center', quiet=True)
write('сегодня', BX0 + 390, BY + 75, L(362.4), .4, 'grey', 46, align='center', quiet=True)
arrow(bez([BX0 + 120, BY - 51 * KB - 110], [BX0 + 200, BY - 193 * KB - 40], [BX0 + 280, BY - 193 * KB + 40], 16)[0],
      [BX0 + 280, BY - 193 * KB + 60], L(363.6), .4, 'blue', 6)
write('почти вчетверо', 1080, 1300, L(363.7), 1.0, 'blue', 70)
write('больше', 1080, 1390, L(364.5), .6, 'blue', 70)
write('после войны страны', 1080, 1560, L(365.3), 1.3, 'graphite', 58)
write('всё-таки появлялись', 1080, 1645, L(366.6), 1.3, 'graphite', 58)
write('чем они отличались', 450, 1880, L(368.8), 1.0, 'graphite', 58)
write('от твоей платформы?', 1175, 1880, L(369.6), 1.2, 'red', 58)
platform(2090, 1560, L(368.9))
write('?', 2090, 1360, L(370.3), .4, 'red', 110, align='center')
mounted('unhall', 'print_unhall', 2610, 740, L(358.6), 660, 1046 / 1744,
        ['зал Генеральной Ассамблеи ООН', 'фото: Mojnsen, CC BY-SA 4.0'], rot=1.2)
mounted('unflags', 'print_unflags', 2600, 1440, L(361.9), 640, 1227 / 1744,
        ['флаги стран — членов ООН', 'United Nations, общ. достояние'], rot=-1.4)

# ===================================================================== ROW 1 · B South Sudan
# --- p2 371.53–391.18: January 2011, almost four million registered, almost all came to vote; about 99 % chose separation from Sudan;
#     this followed from the 2005 peace agreement; in July the country declared independence
tag('Южный Судан', 3400, 470, L(371.55), size=62, rot=-1.5)
write('январь 2011', 3350, 690, L(372.4), 1.3, 'blue', 96)
count('почти {0} миллиона человек', [4], 3350, 830, L(374.8), 2.0, size=74)
write('записались в списки,', 3350, 930, L(377.0), 1.3, 'graphite', 60)
write('и голосовать пришли почти все', 3350, 1020, L(378.5), 2.0, 'graphite', 60)
count('около {0} %', [99], 3350, 1200, L(380.8), 1.9, size=110)
write('выбрали отделение от Судана', 3350, 1300, L(383.1), 1.8, 'graphite', 60)
write('это следовало из мирного соглашения', 3350, 1450, L(385.2), 2.2, 'graphite', 58)
write('2005 года', 3350, 1550, L(387.6), 1.0, 'blue', 72)
write('в июле', 3350, 1720, L(388.9), .7, 'blue', 72)
write('страна объявила независимость', 3690, 1720, L(389.6), 1.6, 'red', 64)
SD = proj(30, 12.5, 30, 5020, 1010)
for nm, tt in (('Sudan', 373.0), ('South Sudan', 373.6)):
    r = max(rings_of(nm), key=len); line([SD(*q) for q in r], L(tt), 1.0, 'graphite', 5, fill='grey', fillA=.10)
ss = max(rings_of('South Sudan'), key=len)
P = [SD(*q) for q in ss]
strokes_el(hatch_poly(P, L(383.2), 1.2, 21, step=26, l=22), L(383.2), 1.2, 'blue', 4, .7)
write('Судан', SD(30, 16.5)[0], SD(30, 16.5)[1], L(373.4), .5, 'grey', 46, align='center')
write('Южный Судан', SD(30, 3.2)[0], SD(30, 3.2)[1] + 70, L(374.0), .6, 'grey', 46, align='center')
BRD = [SD(*q) for q in ss if q[1] > 8.6]
mounted('ssvote', 'print_ssvote', 5990, 800, L(372.6), 720, 1215 / 1744,
        ['референдум в Южном Судане, январь 2011', 'фото: Ranjit Bhaskar (Al Jazeera), CC BY-SA 2.0'], rot=-1.2, csize=24)
mounted('ssflag', 'print_ssflag', 5990, 1520, L(389.2), 560, 1336 / 1636,
        ['день независимости Южного Судана, 2011', 'фото: USAID Africa Bureau, общ. достояние'], rot=1.4, csize=24)

# ===================================================================== ROW 1 · C East Timor
# --- p3 391.88–406.47: the UN organised the vote, then for several years a UN transitional administration worked there;
#     independence came in 2002; not a fast road but years of work after the vote itself
tag('Восточный Тимор', 6900, 470, L(391.9), size=62, rot=1.2)
write('голосование организовала ООН', 6850, 690, L(392.9), 2.0, 'graphite', 62)
write('потом несколько лет там работала', 6850, 800, L(395.0), 2.0, 'graphite', 58)
write('временная администрация ООН', 6850, 890, L(397.1), 1.9, 'graphite', 58)
TY = 1230                                        # a timeline: the vote → several years → 2002
line([[6900, TY], [8780, TY]], L(393.6), 1.2, 'graphite', 6, arrow=True)
line(circle((7000, TY), 16, 12), L(393.9), .15, 'graphite', 10, fill='graphite', fillA=.9, quiet=True)
write('голосование', 7000, TY + 85, L(394.0), .6, 'grey', 46, align='center', quiet=True)
dim((7040, TY - 60), (8280, TY - 60), L(395.6), 1.6)
write('несколько лет', 7710, TY - 100, L(396.2), .8, 'blue', 52, align='center')
line(circle((8450, TY), 16, 12), L(399.2), .15, 'graphite', 10, fill='graphite', fillA=.9, quiet=True)
write('2002', 8520, TY - 80, L(399.5), .8, 'blue', 90, align='center')
write('независимость', 8450, TY + 85, L(400.1), .8, 'red', 50, align='center')
write('это был не быстрый путь,', 6850, 1560, L(401.8), 1.6, 'graphite', 60)
write('а годы работы после самого голосования', 6850, 1660, L(403.6), 2.6, 'graphite', 60)
ET = proj(125.8, -8.8, 170, 9300, 1560)
for r in rings_of('East Timor'):
    line([ET(*q) for q in r], L(392.3), .9, 'graphite', 6, fill='grey', fillA=.15)
write('Восточный Тимор', 9300, 1720, L(392.8), .7, 'grey', 46, align='center')
mounted('ballot', 'print_ballot', 9300, 760, L(393.8), 700, 735 / 980,
        ['бюллетень голосования в Восточном Тиморе', 'миссия ООН UNAMET, CC BY-SA 4.0'], rot=1.0, csize=24)

# ===================================================================== ROW 2 · D Eritrea
# --- p4 407.19–419.67: the referendum went under UN observation, independence in 1993; everywhere years of struggle came first;
#     none of them started with a flag on an empty platform
tag('Эритрея', 500, 2520, L(407.2), size=62, rot=-1.2)
write('референдум шёл под наблюдением ООН', 450, 2740, L(408.0), 2.6, 'graphite', 60)
write('независимость', 450, 2900, L(410.9), .9, 'graphite', 72)
write('1993', 1180, 2900, L(411.8), .8, 'blue', 100)
write('везде до этого', 450, 3060, L(413.1), 1.1, 'graphite', 60)
write('годами шла борьба', 1010, 3060, L(414.2), 1.3, 'graphite', 60)
write('никто из них не начинал', 450, 3330, L(415.8), 1.6, 'graphite', 60)
write('с флага на пустой платформе', 450, 3420, L(417.4), 2.0, 'graphite', 60)
platform(1950, 3460, L(415.9), flag_t=L(418.1))
line([[1700, 3150], [2200, 3700]], L(418.9), .25, 'red', 11)
line([[2200, 3150], [1700, 3700]], L(419.15), .25, 'red', 11, quiet=True)
ER = proj(40, 11, 40, 2680, 3060)
for nm, tt, fa in (('Ethiopia', 407.6, .08), ('Eritrea', 408.2, .10)):
    r = max(rings_of(nm), key=len); line([ER(*q) for q in r], L(tt), .9, 'graphite', 5, fill='grey', fillA=fa)
strokes_el(hatch_poly([ER(*q) for q in max(rings_of('Eritrea'), key=len)], L(411.0), .9, 31, step=22, l=18), L(411.0), .9, 'blue', 4, .75)
write('Эритрея', ER(41.5, 18.6)[0], ER(41.5, 18.6)[1], L(408.6), .5, 'grey', 46, align='center')
write('Эфиопия', ER(39.3, 7.2)[0], ER(39.3, 7.2)[1], L(408.0), .5, 'grey', 46, align='center')

# ===================================================================== ROW 2 · E the common pattern
# --- p5 420.38–437.62: what these cases share: the vote took place by agreement with the former state and under international control;
#     first the vote and the agreement, only then the flag, the anthem and a seat at the UN table; this is the road that is recognised
write('общее у этих случаев одно', 3550, 2600, L(420.4), 1.6, 'graphite', 74)
tag('голосование', 3600, 2700, L(422.0), size=58, rot=-1)
write('по договорённости с прежним государством', 3550, 2960, L(423.9), 2.7, 'graphite', 60)
write('и под международным контролем', 3550, 3060, L(426.8), 2.1, 'graphite', 60)
mounted('box', 'print_box', 5480, 2830, L(422.2), 500, 1316 / 1416,
        ['урна для голосования (иллюстративное фото)', 'фото: WrS.tm.pl, общ. достояние'], rot=1.5, csize=24)
write('1', 3560, 3270, L(429.1), .3, 'blue', 72)
write('сначала голосование и договорённость,', 3650, 3270, L(429.2), 2.4, 'graphite', 60)
write('2', 3560, 3400, L(431.7), .3, 'blue', 72)
write('и только потом', 3650, 3400, L(431.8), 1.2, 'graphite', 60)
flag_icon(3640, 3590, L(432.5)); write('флаг', 3790, 3570, L(432.6), .5, 'graphite', 60)
note_icon(4150, 3570, L(433.2)); write('гимн', 4260, 3570, L(433.3), .5, 'graphite', 60)
table_icon(4650, 3560, L(433.9)); write('место за столом ООН', 4880, 3570, L(434.0), 1.2, 'graphite', 60)
CB = checklist(6050, 2600, L(424.6), 'четыре галочки')
ink('ring', L(426.9), .5, 'graphite', c=[CB[3][0], CB[3][1]], r=62, lw=6)
tick(CB[3], L(428.4))
tick(CB[0], L(435.3)); tick(CB[1], L(435.8)); tick(CB[2], L(436.3))
write('так выглядит путь,', 6050, 3330, L(435.0), 1.2, 'graphite', 64)
write('который признают', 6050, 3430, L(436.3), 1.2, 'red', 70)

# ===================================================================== ROW 2 · F Kosovo
# --- p6 438.38–460.49: Kosovo shows how ambiguous it is: in 2008 it declared independence, more than a hundred countries recognised it;
#     Serbia, Russia and China did not; Kosovo is not in the UN; in 2010 the International Court of Justice found that the declaration
#     itself did not violate international law, but recognition remains political
tag('Косово', 7800, 2520, L(438.4), size=62, rot=1.2)
write('показывает, как всё неоднозначно', 7750, 2720, L(439.3), 2.0, 'graphite', 60)
write('2008', 7750, 2880, L(441.4), .8, 'blue', 100)
write('объявило независимость', 8110, 2880, L(442.4), 1.7, 'graphite', 62)
count('больше {0} стран его признали', [100], 7750, 3010, L(444.2), 2.6, size=70)
write('Сербия, Россия и Китай —', 7750, 3130, L(447.0), 1.8, 'graphite', 62)
write('нет', 8720, 3130, L(448.5), .4, 'red', 62)
write('в ООН Косово не входит', 7750, 3240, L(449.1), 1.6, 'graphite', 62)
table_icon(9280, 3215, L(449.4))
line([[9150, 3110], [9500, 3320]], L(450.3), .2, 'red', 10)
line([[9500, 3110], [9150, 3320]], L(450.5), .2, 'red', 10, quiet=True)
write('2010', 7750, 3420, L(450.9), .8, 'blue', 96)
write('Международный суд ООН признал:', 8090, 3420, L(451.8), 2.0, 'graphite', 58)
write('сама декларация', 7750, 3535, L(453.6), 1.2, 'graphite', 58)
write('международное право не нарушила,', 7750, 3630, L(455.0), 2.4, 'graphite', 58)
write('но признание остаётся политическим', 7750, 3790, L(458.1), 2.3, 'red', 66)
mounted('icj', 'print_icj', 10200, 3000, L(451.2), 720, 1071 / 1396,
        ['Дворец мира в Гааге, Международный суд ООН', 'фото: International Court of Justice, общ. дост.'], rot=-1.2, csize=24)

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

c = Cam(*fit([380, 440, 3000, 1960]))                                   # behind the card: area A (the UN)
c.to(L(355.9), 15.0, z=z_of(c) * 1.04)
c.fit(L(371.2), 1.4, [3250, 400, 6450, 1900], b=2.8)                    # South Sudan: 2011, 4 million, 99 %, 2005, July
c.to(L(372.6), 18.8, z=z_of(c) * 1.03)
c.fit(L(391.5), 1.4, [6750, 400, 9750, 1820], b=2.8)                    # East Timor
c.to(L(392.9), 13.6, z=z_of(c) * 1.03)
c.fit(L(406.7), 1.6, [380, 2450, 3200, 3780], b=2.8)                    # Eritrea
c.to(L(408.3), 11.6, z=z_of(c) * 1.03)
c.fit(L(420.0), 1.4, [3500, 2450, 7300, 3720], b=2.8)                   # the common pattern + the four ticks
c.to(L(421.4), 16.3, z=z_of(c) * 1.02)
c.fit(L(437.9), 1.4, [7650, 2450, 10650, 3860], b=2.8)                  # Kosovo
c.to(L(439.3), 20.8, z=z_of(c) * 1.03)
c.fit(L(460.5), 2.1, [250, 250, 10650, 4000], b=3)                      # chapter pull-back: the whole wall

scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=94, texScale=.36, ghosts=200, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=40000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
