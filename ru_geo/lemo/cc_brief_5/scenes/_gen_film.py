#!/usr/bin/env python3
"""«Мысленный эксперимент» · Как создать свою страну · board film, PART 5.
FILM range 462.81–611.82 s (149.01 s → 4470 frames at 30 fps = 149.000 s): chapters «ПОЧЕМУ ТАК ТРУДНО» (card at 462.81, the part
opens on black) and «ВЕРНЁМСЯ НА ПЛАТФОРМУ» (card at 558.0).
The renderer works in LOCAL time:  local = film − 462.81.
All times below are written as L(<film seconds>) so they can be checked against ru_geo/create_country/film.json (segs → captions).
Covered window: film 463.81–482.70 (the archive light-table clip lt_sealand, Sealand 1978). The board still runs through it,
kept simple (a few marker words and the fort sketch), the camera rests on area A.
Wall (board px, before the DX shift):
  row 1 (y  400…1900)  A Sealand 1978 (simple, covered) · B the recognition caveat: capacity to enter relations ≠ recognition;
                        nobody wants to talk to you · C two views of recognition (creates / only records the fact), the treaty is
                        closer to the second, life goes by the first; no embassy, no trade treaty, no UN (un_flags print)
  row 2 (y 2400…3900)  D1 almost all land is already someone's (world map, Natural Earth) · D2 Liberland (border), Hutt River (taxes),
                        Sealand (British waters widened in 1987) — prints liber / coin / aerial · E the sum-up table: the four ticks
                        for Sealand, Liberland, Hutt River (stopped at the fourth) and South Sudan, Timor, Eritrea (started from it)
  row 3 (y 4400…5850)  F your platform: the checklist ticked as said · G the answer to the title question (ballot box print)
                        · H the boat arrives, the official, «Кого вы просите признать вас первым?», the question to viewers
  final pull-back over the whole wall.
Prints: only archive files with free licences (archive/credits.json), CC credits on the card. roy_bates is NOT used.
Ink: graphite = names/facts · blue = measurement and numbers, ticks · red = only the break / the decision, crosses.
Every frame keeps the bottom 250 px free (cameras are fitted to the screen band y 50…800).
    python3 scenes/_gen_film.py      → scenes/film.json and events.json
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__)); FILM = os.path.dirname(HERE)
R0, R1 = 462.81, 611.82
NFR = round((R1 - R0) * 30)                   # 4470 frames
DUR = round(NFR / 30, 3)                      # 149.0
L = lambda ft: round(ft - R0, 3)              # film time → local time
COVER = [[L(463.81), L(482.7)]]
BW, BH = 12000, 6700

E, EV = [], []
def el(**k): E.append(k); return k
def ev(t, type, dur=0, **k): EV.append(dict(t=round(t, 3), type=type, dur=round(dur, 3), **k)); return t

def ink(kind, t, d, color='graphite', quiet=False, **k):
    e = el(type='ink', kind=kind, t=round(t, 3), d=round(d, 3), color=color, **k)
    if not quiet: ev(t, {'write': 'write', 'count': 'count'}.get(kind, 'stroke'), d, color=color)
    return e
def P2(pts): return [[round(x, 1), round(y, 1)] for x, y in pts]
def line(pts, t, d, color='graphite', lw=9, **k): return ink('line', t, d, color, points=P2(pts), lw=lw, **k)
FS = 1.3
def write(text, x, y, t, d=None, color='graphite', size=64, **k):
    if d is None: d = max(.5, .05 * len(text))
    return ink('write', t, d, color, text=text, xy=[x, y], size=round(size * FS), **k)
def tag(text, x, y, t, size=54, **k):
    a = dict(t=round(t, 3), kind='swing', d=.8, amp=k.pop('amp', 10))
    ev(t, 'tag', .3); return el(type='tag', text=text, xy=[x, y], size=size, arrive=a, **k)
def magnet(x, y, t, r=20, color='graphite', **k):
    ev(t + .06, 'clack', .1); return el(type='magnet', xy=[x, y], r=r, color=color, z=20, arrive=dict(t=round(t, 3), kind='snap', d=.3, lift=70), **k)
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
def mounted(id, src, x, y, t, w, ratio, cred, rot=-1.2, csize=24):
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
def arc(c, rx, ry, a0, a1, n=24):
    return [[c[0] + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), c[1] + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))] for i in range(n + 1)]
def bez(p0, p1, p2, n=28):
    return [[(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]] for u in [i / n for i in range(n + 1)]]
def arrow(p0, p1, t, d, color='blue', lw=7, **k): return line([p0, p1], t, d, color, lw, arrow=True, **k)
def strokes_el(strokes, t, d, color='graphite', lw=5, alpha=.85, quiet=False):
    if not quiet: ev(t, 'hatch', d)
    return el(type='ink', kind='hatch', strokes=strokes, lw=lw, color=color, alpha=alpha)
def rect(x0, y0, x1, y1): return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]

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
def box(bc, t, s=34, quiet=True): return line(rect(bc[0] - s, bc[1] - s, bc[0] + s, bc[1] + s), t, .2, 'graphite', 6, quiet=quiet)
def tick(bc, t):
    x, y = bc; ev(t, 'tick', .3)
    return line([[x - 30, y - 2], [x - 8, y + 24], [x + 42, y - 46]], t, .3, 'blue', 11, quiet=True)
def cross(bc, t, r=28):
    x, y = bc; ev(t, 'cross', .3)
    line([[x - r, y - r], [x + r, y + r]], t, .18, 'red', 10, quiet=True)
    line([[x + r, y - r], [x - r, y + r]], t + .18, .18, 'red', 10, quiet=True)

# ---------------------------------------------------------------- marker sketches
def person(c, s, t, color='graphite', lw=6, quiet=True, arm=None, **k):
    x, y = c
    line(circle((x, y - 62 * s), 11 * s, 14), t, .08, color, lw, quiet=quiet, **k)
    line([[x, y - 50 * s], [x, y - 18 * s]], t + .08, .06, color, lw, quiet=True, **k)
    line([[x - 14 * s, y], [x, y - 18 * s], [x + 14 * s, y]], t + .12, .06, color, lw, quiet=True, **k)
    if arm: line([[x - 16 * s, y - 40 * s], [x, y - 44 * s], [arm[0], arm[1]]], t + .16, .06, color, lw, quiet=True, **k)
    else: line([[x - 16 * s, y - 40 * s], [x + 16 * s, y - 40 * s]], t + .16, .05, color, lw, quiet=True, **k)
def waves(x0, x1, y, t, d, step=90, amp=14, color='blue', lw=5, quiet=True, seed=1):
    rnd = random.Random(seed); st = []; n = int((x1 - x0) / step)
    for i in range(n):
        xa = x0 + i * step + rnd.uniform(-10, 10); w = step * .7
        st.append(dict(points=P2(arc((xa + w / 2, y + amp), w / 2, amp, 200, 340, 8)), t=round(t + d * i / n, 3), d=round(d / n * 1.5, 3), lw=lw))
    return strokes_el(st, t, d, color, lw, .8, quiet=quiet)
def fort(x, y, s, t, quiet=True, lw=7):
    """the sea fort side-on: two towers standing in the water, a deck, a mast. (x, y) = middle of the waterline"""
    for dx in (-48, 48):
        line(rect(x + (dx - 34) * s, y - 190 * s, x + (dx + 34) * s, y), t, .25, 'graphite', lw, quiet=quiet, fill='grey', fillA=.35); quiet = True
    line(rect(x - 125 * s, y - 225 * s, x + 125 * s, y - 190 * s), t + .25, .2, 'graphite', lw, quiet=True, fill='grey', fillA=.5)
    line(rect(x - 70 * s, y - 262 * s, x + 50 * s, y - 225 * s), t + .4, .15, 'graphite', lw * .8, quiet=True)
    line([[x + 85 * s, y - 225 * s], [x + 85 * s, y - 330 * s]], t + .5, .12, 'graphite', lw * .7, quiet=True)
def boat(x, y, s, t, quiet=True, **k):
    """a small motor boat, bow to the right. (x, y) = middle of the waterline"""
    line([[x - 110 * s, y - 40 * s], [x + 120 * s, y - 40 * s], [x + 80 * s, y], [x - 100 * s, y], [x - 110 * s, y - 40 * s]], t, .3, 'graphite', 6,
         quiet=quiet, fill='grey', fillA=.25, **k)
    line([[x - 60 * s, y - 40 * s], [x - 50 * s, y - 85 * s], [x + 20 * s, y - 85 * s], [x + 45 * s, y - 40 * s]], t + .3, .2, 'graphite', 6, quiet=True, **k)
def platform(x, sea, s, t, color='graphite', lw=8, quiet=False):
    """a rusty sea platform (as in the cold open): two legs in the water, a deck, a hut"""
    for dx in (-80, 80):
        line([[x + dx * s, sea + 60 * s], [x + dx * s, sea - 180 * s]], t + (.0 if dx < 0 else .12), .25, color, lw, quiet=quiet or dx > 0)
    line([[x - 80 * s, sea - 40 * s], [x + 80 * s, sea - 150 * s]], t + .3, .15, color, lw * .6, quiet=True)
    line([[x + 80 * s, sea - 40 * s], [x - 80 * s, sea - 150 * s]], t + .38, .15, color, lw * .6, quiet=True)
    line(rect(x - 140 * s, sea - 212 * s, x + 140 * s, sea - 180 * s), t + .45, .35, color, lw, quiet=True, fill='grey', fillA=.3)
    line(rect(x - 100 * s, sea - 300 * s, x + 10 * s, sea - 212 * s), t + .75, .3, color, lw * .85, quiet=True, fill='grey', fillA=.12)
    rnd = random.Random(int(x)); st = []
    for i in range(14):
        lx = x + rnd.choice((-80, 80)) * s + rnd.uniform(-6, 12) * s; ly = sea - rnd.uniform(10, 170) * s
        st.append(dict(points=P2([[lx, ly], [lx + 9 * s, ly + 14 * s]]), t=round(t + .9 + .03 * i, 3), d=.05, lw=max(3, lw * .45)))
    strokes_el(st, t + .9, .5, 'grey', max(3, lw * .45), .75, quiet=True)
    return sea - 212 * s                                                     # the deck
def homeflag(x, deck, t, h=300):
    """the home-made flag on the mast (diagonal band, hand stitches)"""
    line([[x, deck], [x, deck - h]], t, .25, 'graphite', 7)
    y0 = deck - h; w, hh = 150, 95
    line(rect(x, y0, x + w, y0 + hh), t + .2, .3, 'graphite', 6, fill='grey', fillA=.12, quiet=True)
    line([[x, y0 + hh], [x + w, y0]], t + .45, .2, 'graphite', 5, quiet=True)
def countries(cx, cy, t, r=48, d=200, n=3, quiet=True):
    """small circles = other states, around a centre; returns their centres"""
    C = []
    for i in range(n):
        a = math.radians(-150 + 120 * i / max(1, n - 1)) if n > 1 else -math.pi / 2
        p = (cx + d * math.cos(a), cy + d * math.sin(a)); C.append(p)
        line(circle(p, r, 22), t + .12 * i, .25, 'graphite', 6, quiet=quiet or i > 0, fill='grey', fillA=.12)
    return C
def building(x, y, t, s=1.0, quiet=True):
    """a building with columns (an embassy, a government)"""
    line([[x - 150 * s, y], [x + 150 * s, y]], t, .15, 'graphite', 6, quiet=quiet)
    line([[x - 150 * s, y - 130 * s], [x, y - 190 * s], [x + 150 * s, y - 130 * s], [x - 150 * s, y - 130 * s]], t + .12, .25, 'graphite', 6,
         quiet=True, fill='grey', fillA=.15)
    for j in range(4): line([[x - 105 * s + 70 * j * s, y - 122 * s], [x - 105 * s + 70 * j * s, y - 8 * s]], t + .3 + .05 * j, .08, 'graphite', 6, quiet=True)
def document(x, y, t, s=1.0, seal=True, quiet=True):
    """a sheet of paper with lines of text and a round seal"""
    line(rect(x - 100 * s, y - 135 * s, x + 100 * s, y + 135 * s), t, .3, 'graphite', 6, quiet=quiet, fill='grey', fillA=.08)
    for j in range(5): line([[x - 70 * s, y - 95 * s + 40 * j * s], [x + (70 - 30 * (j % 2)) * s, y - 95 * s + 40 * j * s]], t + .3 + .06 * j, .1, 'grey', 4, quiet=True)
    if seal: line(circle((x + 45 * s, y + 85 * s), 28 * s, 16), t + .65, .2, 'graphite', 5, quiet=True)
def flag_icon(x, y, t, fillc='blue'):
    line([[x, y + 40], [x, y - 90]], t, .2, 'graphite', 7)
    line(rect(x, y - 90, x + 110, y - 20), t + .15, .3, 'graphite', 6, fill=fillc, fillA=.25, quiet=True)
def phone(x, y, t, s=1.0):
    """an old telephone handset"""
    line(bez([x - 90 * s, y - 20 * s], [x, y - 90 * s], [x + 90 * s, y - 20 * s], 16), t, .3, 'graphite', 14)
    line(circle((x - 92 * s, y - 8 * s), [26 * s, 18 * s], 16), t + .25, .15, 'graphite', 7, fill='graphite', fillA=.7, quiet=True)
    line(circle((x + 92 * s, y - 8 * s), [26 * s, 18 * s], 16), t + .32, .15, 'graphite', 7, fill='graphite', fillA=.7, quiet=True)

# ===================================================================== typewriter cards on black
CARDS = []
def type_card(s, ft, hard=False):   # chapter title from film.json, typed t+0.05 … t+0.80, held to t+1.0
    t0, t1, t2 = L(ft) + .05, L(ft) + .80, L(ft) + 1.0
    CARDS.append(dict(str=s, t0=round(t0, 3), t1=round(t1, 3), t2=round(t2, 3), **({'hard': True} if hard else {})))
    n = len(s.replace(' ', ''))
    for i in range(n): ev(t0 + (t1 - t0) * i / max(1, n - 1), 'key')
type_card('ПОЧЕМУ ТАК ТРУДНО', 462.81, hard=True)
type_card('ВЕРНЁМСЯ НА ПЛАТФОРМУ', 558.0)

# ===================================================================== ROW 1 · A Sealand 1978 (covered by the archive clip: simple)
# --- p1 463.81–482.70: remember the boat? in 1978 mercenaries came to Sealand, hired by a man who called himself prime minister;
#     Bates's son took the platform back and captured the attackers; Germany sent a diplomat for one of them;
#     Sealand calls it recognition, other countries do not
tag('Силенд', 470, 470, L(463.85), size=60, rot=-1.5)
write('1978', 1000, 540, L(464.8), .7, 'blue', 96)
SEA_A = 1500
waves(450, 2550, SEA_A, L(463.9), .8, seed=3)
waves(500, 2500, SEA_A + 70, L(464.1), .8, seed=4)
fort(1650, SEA_A, 1.5, L(464.2), quiet=False)
boat(800, SEA_A, 1.1, L(467.3), quiet=False, moves=[dict(t=L(467.6), d=1.6, dx=300, a=2, b=2.6)], pivot=[800, SEA_A])
write('наёмники', 470, 760, L(467.4), .6, 'graphite', 64)
write('их нанял «премьер»', 470, 860, L(469.0), 1.0, 'graphite', 56)
write('сын Бейтса отбил платформу', 470, 1700, L(472.4), 1.3, 'graphite', 58)
write('нападавшие — в плену', 470, 1800, L(474.8), 1.0, 'graphite', 58)
write('Германия прислала дипломата', 1550, 760, L(476.3), 1.3, 'graphite', 50)
person((2300, 1010), 2.0, L(476.6))
write('Силенд: «признание»', 1650, 1700, L(479.2), 1.0, 'graphite', 58)
write('другие страны: нет', 1650, 1800, L(481.4), .9, 'red', 58)

# ===================================================================== ROW 1 · B the recognition caveat
# --- p2 483.25–496.99: that is why the line about recognition needs a caveat; Montevideo speaks of the capacity to enter into relations,
#     which is not the same as recognition; but if nobody wants to talk to you, how do you enter into these relations?
write('к той строчке про признание', 3100, 540, L(483.3), 1.6, 'graphite', 62)
tag('нужна оговорка', 4950, 520, L(485.5), size=58, rot=2)
write('Монтевидео говорит о', 3100, 720, L(486.4), 1.0, 'graphite', 58)
write('способности', 3100, 870, L(487.4), .7, 'graphite', 72)
write('вступать в отношения', 3100, 970, L(488.6), 1.1, 'graphite', 72)
write('≠', 4520, 930, L(490.0), .3, 'red', 150, align='center')
write('признание', 4720, 930, L(491.3), .8, 'graphite', 80)
write('это не то же самое', 4520, 1060, L(489.9), 1.0, 'grey', 48, align='center', quiet=True)
# nobody wants to talk to you
YC = (4300, 1560)
line(circle(YC, 70, 26), L(492.2), .35, 'graphite', 7, fill='blue', fillA=.15)
write('ты', YC[0], YC[1] + 20, L(492.4), .3, 'graphite', 56, align='center', quiet=True)
OC = [(3600, 1420), (3650, 1760), (5000, 1420), (4950, 1760)]
for i, p in enumerate(OC):
    line(circle(p, 52, 22), L(492.5) + .1 * i, .25, 'graphite', 6, quiet=i > 0, fill='grey', fillA=.12)
    q0 = (YC[0] + (p[0] - YC[0]) * .22, YC[1] + (p[1] - YC[1]) * .22); q1 = (YC[0] + (p[0] - YC[0]) * .8, YC[1] + (p[1] - YC[1]) * .8)
    line([q0, q1], L(493.0) + .15 * i, .3, 'graphite', 5, dash=[12, 10], arrow=True, quiet=True)
    m = ((q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2)
    cross(m, L(494.3) + .25 * i, r=20)
write('если с тобой никто не хочет говорить —', 3100, 1240, L(492.3), 1.9, 'graphite', 54)
write('как вступить', 5250, 1560, L(494.3), .7, 'graphite', 60)
write('в эти отношения?', 5250, 1650, L(495.3), .9, 'red', 60)

# ===================================================================== ROW 1 · C two views of recognition
# --- p3 497.54–514.36: some lawyers think recognition creates a country; others that it only records the fact; the Montevideo treaty is
#     closer to the second, but life often goes by the first; without recognition no embassy opens, no trade treaty, no UN
CX1, CX2 = 6500, 8350
write('одни юристы:', CX1, 540, L(497.6), .7, 'graphite', 56)
write('страну создаёт', CX1, 650, L(498.9), .8, 'graphite', 66)
write('признание', CX1, 750, L(499.7), .7, 'graphite', 66)
write('другие:', CX2, 540, L(500.8), .5, 'graphite', 56)
write('оно лишь', CX2, 650, L(501.4), .5, 'graphite', 66)
write('отмечает факт', CX2, 750, L(502.0), .8, 'graphite', 66)
line([[8200, 470], [8200, 900]], L(500.7), .3, 'grey', 4, dash=[12, 10], quiet=True)
# the treaty card, closer to the second
el(type='card', id='treaty', xy=[9250, 1000], w=760, h=200, rot=1.5, z=9, arrive=dict(t=L(503.4), kind='drop', d=.4, lift=160, spin=.8, land=.6),
   magnets=[[-330, -60, 'graphite']], magnetR=18,
   lines=[dict(text='ДОГОВОР', font='sans', weight=900, size=60, x=50, y=-12, color='graphite', track=5),
          dict(text='Монтевидео · 1933', font='mono', size=36, x=50, y=58, color='grey')])
ev(L(503.65), 'land', .2, size='mid')
arrow([9250, 890], [9050, 800], L(504.4), .35, 'graphite', 6)
write('ближе ко вторым', 9700, 1150, L(504.6), .9, 'graphite', 50)
ink('ring', L(506.2), .5, 'red', c=[6980, 705], r=[540, 112], lw=7)
write('но жизнь часто идёт по первым', CX1, 1010, L(506.3), 1.8, 'red', 56)
# without recognition
write('без признания:', CX1, 1240, L(508.3), .8, 'graphite', 62)
building(6800, 1680, L(508.9), .9, quiet=False)
write('не откроют посольство', 6800, 1800, L(509.3), 1.2, 'graphite', 46, align='center')
cross((6800, 1580), L(510.3), r=60)
document(7800, 1600, L(510.9), .8, quiet=False)
write('не заключат', 7800, 1800, L(511.4), .7, 'graphite', 46, align='center')
write('торговый договор', 7800, 1870, L(511.9), .8, 'graphite', 46, align='center')
cross((7800, 1600), L(512.6), r=60)
mounted('unflags', 'print_unflags', 8950, 1490, L(512.9), 520, 1227 / 1744,
        ['флаги стран — членов ООН', 'United Nations, общ. достояние'], rot=-1.4, csize=22)
write('не возьмут в ООН', 9620, 1400, L(513.0), .8, 'graphite', 46)
cross((9800, 1500), L(513.6), r=50)

# ===================================================================== ROW 2 · D the second difficulty: land
# --- p4 514.91–536.30: the second difficulty, a boring one: almost all land on Earth is already someone's; Liberland tripped over someone
#     else's border, Hutt River over taxes, and Sealand found itself inside British waters when they were widened in 1987;
#     every time someone's land and someone's laws turned out stronger than the flag
write('вторая трудность', 450, 2560, L(514.95), 1.0, 'graphite', 70)
tag('скучная', 1500, 2530, L(516.4), size=56, rot=-2)
write('почти вся суша на Земле уже чья-то', 450, 3740, L(517.3), 2.2, 'graphite', 62)
G = json.load(open('/tmp/world.geo.json'))
MX0, MY0, MK = 470, 2680, 6.4                                  # equirectangular, lon −170…190 → x, lat 84…−56 → y
def wm(lon, lat): return [MX0 + ((lon + 170) % 360) * MK, MY0 + (84 - lat) * MK]
def dp(P, tol):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; Ln = math.hypot(dx, dy)
    best, bi = -1, 0
    for i in range(1, len(P) - 1):
        q = P[i]; dd = abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / Ln if Ln else math.hypot(q[0] - a[0], q[1] - a[1])
        if dd > best: best, bi = dd, i
    if best <= tol: return [a, b]
    return dp(P[:bi + 1], tol)[:-1] + dp(P[bi:], tol)
SHAPES = []
for f in G['features']:
    if f['properties']['name'] in ('Antarctica', 'Fr. S. Antarctic Lands'): continue
    g = f['geometry']; polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    for p in polys:
        r = p[0]
        if max(q[0] for q in r) - min(q[0] for q in r) > 180: continue     # a ring across the date line (Fiji, Russia's tip)
        P = [wm(*q) for q in r]
        if max(q[0] for q in P) - min(q[0] for q in P) > 1500: continue
        xs, ys = [q[0] for q in P], [q[1] for q in P]
        if max(max(xs) - min(xs), max(ys) - min(ys)) < 7: continue
        P = dp(P[:-1], 1.6) + [P[0]]
        if len(P) >= 4: SHAPES.append(P)
SHAPES.sort(key=lambda P: min(q[0] for q in P))
for i, P in enumerate(SHAPES):
    line(P, L(517.3) + 2.0 * i / len(SHAPES), .25, 'graphite', 3, fill='grey', fillA=.28, quiet=True)
ev(L(517.3), 'hatch', 2.2)
print('world map', len(SHAPES), 'shapes,', sum(len(P) for P in SHAPES), 'points; x', MX0, round(MX0 + 360 * MK), 'y', MY0, round(MY0 + 140 * MK))
# the three obstacles
OX = [3700, 4750, 5800]; OY = 2830; OW = 470
tag('Либерленд', OX[0] - 200, 2520, L(519.95), size=50, rot=-1.5)
mounted('liber', 'print_liber', OX[0], OY, L(520.1), OW, 1.0, ['пойма Дуная, снимок с МКС, 2007', 'NASA, общ. достояние'], rot=-1.2, csize=20)
write('чужая граница', OX[0], 3330, L(521.0), .8, 'graphite', 50, align='center')
line([[OX[0] - 200, 3420], [OX[0] + 200, 3420]], L(521.6), .4, 'graphite', 6, dash=[18, 12], quiet=True)
tag('Хатт-Ривер', OX[1] - 200, 2520, L(522.8), size=50, rot=1.2)
mounted('coin', 'print_coin', OX[1], OY, L(522.9), OW, 1.0, ['монета княжества Хатт-Ривер', 'фото: Windshear, CC BY-SA 4.0'], rot=1.2, csize=20)
write('налоги', OX[1], 3330, L(523.4), .5, 'graphite', 50, align='center')
document(OX[1], 3480, L(523.6), .45)
tag('Силенд', OX[2] - 180, 2520, L(524.4), size=50, rot=-1.2)
mounted('aerial', 'print_aerial', OX[2], OY, L(524.5), OW, 740 / 960, ['Силенд с вертолёта', 'фото: Ryan Lackey, CC BY 2.0'], rot=-1.0, csize=20)
write('внутри британских вод', OX[2], 3330, L(525.2), 1.2, 'graphite', 46, align='center')
SD = (OX[2] - 120, 3500)
line([[SD[0] - 270 + 14 * math.sin(i), SD[1] - 170 + 34 * i] for i in range(11)], L(527.0), .3, 'graphite', 6, quiet=True)
line(circle(SD, 10, 10), L(527.2), .1, 'graphite', 9, fill='graphite', fillA=.9, quiet=True)
line(arc((SD[0] - 260, SD[1]), 120, 80, -60, 60, 16), L(527.4), .4, 'blue', 6, dash=[12, 9])
line(arc((SD[0] - 260, SD[1]), 330, 150, -45, 45, 20), L(528.3), .6, 'blue', 6, dash=[12, 9], quiet=True)
arrow([SD[0] - 120, SD[1] + 40], [SD[0] + 50, SD[1] + 40], L(528.4), .4, 'blue', 5)
write('расширили', SD[0] + 110, 3480, L(528.0), .6, 'graphite', 46)
write('1987', SD[0] + 110, 3580, L(529.7), .7, 'blue', 66)
# every time someone's land and laws were stronger than the flag
write('каждый раз чья-то земля и чьи-то законы', 3300, 3730, L(531.95), 2.0, 'graphite', 56)
write('оказывались сильнее флага', 3300, 3830, L(534.0), 1.5, 'red', 56)
flag_icon(4330, 3840, L(535.2), 'grey')

# ===================================================================== ROW 2 · E the sum-up: the four ticks for six cases
# --- p5 536.86–555.85: let us add it up: Sealand, Liberland and Hutt River stopped at the fourth tick; South Sudan, Timor and Eritrea
#     started from it: first an agreement with the others, then all the rest; the difference is not courage and not the size of the land,
#     but who agrees to talk to you
TX = 6650; TY = [2790, 2940, 3090, 3240]; COLS = [8000, 8420, 8840, 9420, 9840, 10260]
write('теперь сложим', TX, 2540, L(536.9), .7, 'graphite', 70)
for i in range(4): write(ITEMS[i], TX, TY[i] + 20, L(537.0) + .15 * i, .5, 'graphite', 46 if i < 3 else 40, quiet=True)
write(ITEMS[4], TX, TY[3] + 75, L(537.6), .5, 'graphite', 40, quiet=True)
NAMES = ['Силенд', 'Либерленд', 'Хатт-Ривер', 'Южный Судан', 'Тимор', 'Эритрея']
NT = [537.7, 538.4, 539.2, 542.4, 543.4, 544.1]
for j, (x, nm) in enumerate(zip(COLS, NAMES)):
    if j == 3:
        write('Южный', x, 2620, L(NT[j]), .4, 'graphite', 40, align='center', quiet=True)
        write('Судан', x, 2680, L(NT[j]) + .3, .4, 'graphite', 40, align='center', quiet=True)
    else: write(nm, x, 2680, L(NT[j]), .5, 'graphite', 40, align='center', quiet=True)
    ev(L(NT[j]), 'write', .5)
    for i in range(4): box((x, TY[i]), L(NT[j]) + .1 + .06 * i)
line([[9130, 2560], [9130, 3330]], L(542.3), .4, 'grey', 4, dash=[12, 10], quiet=True)
# the first three stopped at the fourth: an arrow down each column, a red cross on the fourth box
for j in range(3):
    arrow([COLS[j] + 70, TY[0] - 20], [COLS[j] + 70, TY[3] - 30], L(539.9) + .2 * j, .4, 'grey', 4, quiet=j > 0)
    cross((COLS[j], TY[3]), L(540.9) + .3 * j)
line([[COLS[0] - 80, TY[3] + 55], [COLS[2] + 80, TY[3] + 55]], L(541.8), .4, 'red', 8)
write('остановились', COLS[1], TY[3] + 125, L(541.9), .6, 'red', 40, align='center')
# the other three started from it
for j in range(3, 6): tick((COLS[j], TY[3]), L(545.0) + .25 * (j - 3))
for j in range(3, 6):
    arrow([COLS[j] + 72, TY[3] - 20], [COLS[j] + 72, TY[0] + 10], L(547.5) + .1 * (j - 3), .4, 'blue', 4, quiet=j > 3)
    for i in range(3): tick((COLS[j], TY[i]), L(548.0) + .2 * (j - 3) + .15 * (2 - i))
write('начинали с неё', COLS[4], TY[3] + 125, L(545.0), .8, 'blue', 40, align='center')
write('сначала договорённость с другими,', TX, 3510, L(545.6), 1.6, 'graphite', 50)
write('потом всё остальное', 7800, 3510, L(547.5), 1.0, 'graphite', 50)
tag('не в смелости', 6750, 3640, L(549.7), size=46, rot=-1.5, strike=dict(t=L(550.5), d=.3))
tag('не в размере земли', 7600, 3640, L(551.0), size=46, rot=1.2, strike=dict(t=L(552.0), d=.3))
write('а в том, кто согласен', 8700, 3660, L(552.2), 1.1, 'red', 56)
write('с тобой разговаривать', 8700, 3770, L(553.5), 1.2, 'red', 56)

# ===================================================================== ROW 3 · F your platform
# --- p6 559.00–579.48: now your platform; population: people who live here permanently, so call your friends; territory: the platform is
#     there, although today it lies in British waters; government: you yourself; three ticks you set in one evening; the fourth depends on
#     others, and it breaks almost all such countries
FB = checklist(450, 4560, L(559.05), 'твоя платформа', gap=190)
PXF, SEAF = 3100, 5560
waves(2650, 3550, SEAF, L(559.3), .6, step=70, amp=10, seed=31)
DECK = platform(PXF, SEAF, 1.1, L(559.4), lw=7)
homeflag(PXF + 110, DECK, L(560.0), 260)
NX = 1450
write('нужны люди, которые живут здесь постоянно', NX, FB[0][1] + 22, L(561.95), 2.0, 'graphite', 42)
write('зови друзей', 2650, 4830, L(564.25), .8, 'blue', 50)
line(bez([2900, 4860], [2960, 4980], [PXF - 70, DECK - 110], 12), L(564.6), .3, 'blue', 5, arrow=True, quiet=True)
for j, dx in enumerate((-120, -50, 20)): person((PXF + dx, DECK), 1.3, L(564.7) + .2 * j, quiet=j > 0)
tick(FB[0], L(565.2))
write('платформа есть,', NX, FB[1][1] + 22, L(565.8), .8, 'graphite', 42)
tick(FB[1], L(566.6))
write('хотя сегодня она лежит в британских водах', NX, FB[1][1] + 82, L(567.7), 2.2, 'grey', 38)
line(arc((PXF, SEAF), 520, 130, 200, 340, 26), L(568.4), .8, 'blue', 5, dash=[12, 9], quiet=True)
write('ты сам', NX, FB[2][1] + 30, L(571.6), .5, 'graphite', 56)
tick(FB[2], L(572.0))
ink('ring', L(571.9), .4, 'graphite', c=[PXF + 20, DECK - 80], r=[60, 90], lw=5)
write('три галочки — за вечер', 450, 5640, L(572.6), 1.4, 'blue', 52)
ink('ring', L(575.3), .5, 'graphite', c=[FB[3][0], FB[3][1]], r=62, lw=6)
write('четвёртая зависит от других,', 1450, 5640, L(575.4), 1.5, 'graphite', 52)
write('и она ломает почти все такие страны', 450, 5760, L(577.1), 2.0, 'red', 52)
oc = countries(2100, FB[3][1] + 40, L(575.6), r=34, d=150, n=3)
for i, p in enumerate(oc):
    write('?', p[0], p[1] + 22, L(576.4) + .15 * i, .3, 'graphite', 50, align='center', quiet=True)

# ===================================================================== ROW 3 · G the answer to the title question
# --- p7 580.03–600.35: here is the answer to the question from the title: a country cannot be made by one decision; it is made by the people
#     living on the land, the power that governs it, and the other states that agreed to talk to you as equals; real countries were born
#     of referendums, treaties and long negotiations; the flag came last
GX = 4100
write('ответ на вопрос из названия:', GX, 4540, L(580.1), 1.6, 'graphite', 60)
el(type='card', id='title', xy=[GX + 520, 4720], w=1040, h=150, rot=-1.0, z=9, arrive=dict(t=L(580.9), kind='drop', d=.4, lift=160, spin=.8, land=.6),
   magnets=[[-470, -45, 'graphite'], [470, -45, 'graphite']], magnetR=18,
   lines=[dict(text='Как создать свою страну?', font='sans', weight=700, size=70, x=50, y=26, color='graphite')])
ev(L(581.15), 'land', .2, size='mid')
write('одним решением не создать', 5800, 4740, L(582.1), 1.6, 'red', 64)
write('её создают:', GX, 4960, L(584.35), .7, 'graphite', 60)
person((GX + 70, 5120), 1.3, L(584.9), quiet=False); person((GX + 140, 5120), 1.3, L(585.0))
write('люди, живущие на земле', GX + 260, 5100, L(585.2), 1.3, 'graphite', 54)
building(GX + 105, 5265, L(587.0), .55, quiet=False)
write('власть, которая ею управляет', GX + 260, 5240, L(587.2), 1.6, 'graphite', 54)
for p in [(GX + 50, 5345), (GX + 165, 5345)]: line(circle(p, 32, 18), L(589.2), .25, 'graphite', 6, fill='grey', fillA=.12, quiet=True)
arrow([GX + 85, 5335], [GX + 130, 5335], L(589.5), .2, 'graphite', 4, quiet=True)
write('другие государства,', GX + 260, 5380, L(589.2), 1.2, 'graphite', 54)
write('согласившиеся говорить с тобой на равных', GX + 260, 5470, L(590.8), 2.6, 'graphite', 54)
for yy, tt in ((5080, 586.4), (5220, 588.9), (5440, 593.3)): tick((GX + 1950, yy - 10), L(tt))
# real countries were born of referendums, treaties and long negotiations; the flag came last
write('настоящие страны рождались из', GX, 5620, L(593.9), 1.6, 'graphite', 50)
mounted('box', 'print_box', 6950, 5230, L(595.8), 260, 1316 / 1416, ['урна для голосования, иллюстр.', 'фото: WrS.tm.pl, общ. достояние'],
        rot=1.5, csize=18)
YT = 5740
write('референдумов', GX, YT, L(595.8), .7, 'graphite', 50)
arrow([GX + 560, YT - 20], [GX + 680, YT - 20], L(596.5), .25, 'graphite', 5, quiet=True)
write('договоров', GX + 710, YT, L(596.6), .6, 'graphite', 50)
arrow([GX + 1120, YT - 20], [GX + 1240, YT - 20], L(597.3), .25, 'graphite', 5, quiet=True)
write('долгих переговоров', GX + 1270, YT, L(597.4), 1.0, 'graphite', 50)
arrow([GX + 2080, YT - 20], [GX + 2200, YT - 20], L(598.4), .25, 'red', 5, quiet=True)
flag_icon(GX + 2260, YT, L(598.5))
write('флаг — последним', GX + 2420, YT, L(598.9), 1.0, 'red', 50)

# ===================================================================== ROW 3 · H the boat arrives
# --- p8 600.90–611.82: the boat arrives; the official opens the folder: «The fourth tick is left. Whom do you ask to recognise you first?»;
#     whose call will you start with? write in the comments
HX = 9700; SEAH = 5420
waves(7950, 10650, SEAH, L(600.5), .6, step=80, amp=11, seed=41)
DECKH = platform(HX + 600, SEAH, 1.0, L(600.3), lw=7, quiet=True)
homeflag(HX + 700, DECKH, L(600.6), 230)
BMV = [dict(t=L(600.95), d=1.8, dx=900, a=2, b=2.8)]
boat(8300, SEAH, 1.3, L(600.9), quiet=False, moves=BMV, pivot=[8300, SEAH])
person((8320, SEAH - 52), 1.3, L(601.9), moves=BMV, pivot=[8300, SEAH], arm=(8360, SEAH - 100))
line(rect(8350, SEAH - 135, 8420, SEAH - 85), L(602.2), .2, 'blue', 5, fill='blue', fillA=.3, quiet=True, moves=BMV, pivot=[8300, SEAH])
write('чиновник открывает папку', 7950, 4540, L(601.85), 1.4, 'graphite', 52)
write('«осталась четвёртая галочка.', 7950, 4680, L(603.7), 1.6, 'graphite', 54)
write('кого вы просите', 7950, 4800, L(605.75), .9, 'graphite', 62)
write('признать вас первым?»', 7950, 4910, L(606.7), 1.4, 'red', 62)
MB = [(10300 + 90 * i, 4620) for i in range(4)]
for i, b in enumerate(MB): box(b, L(603.8) + .08 * i, s=30)
for i in range(3): tick(MB[i], L(604.3) + .15 * i)
ink('ring', L(604.9), .4, 'red', c=[MB[3][0], MB[3][1]], r=48, lw=6)
phone(8100, 5640, L(608.6), .8)
write('с чьего звонка начнёшь ты?', 8250, 5650, L(608.6), 1.6, 'graphite', 56)
tag('напиши в комментариях', 8200, 5760, L(610.5), size=48, rot=-1.2)

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

c = Cam(*fit([380, 400, 2700, 1880]))                                   # behind the card: area A (Sealand 1978, covered)
c.to(L(463.0), 19.6, z=z_of(c) * 1.03)
c.fit(L(482.75), 1.3, [3000, 400, 5900, 1880], b=2.8)                  # B the caveat
c.to(L(484.1), 12.8, z=z_of(c) * 1.03)
c.fit(L(497.05), 1.3, [6400, 400, 10200, 1930], b=2.8)                 # C two views, no embassy / treaty / UN
c.to(L(498.4), 15.8, z=z_of(c) * 1.02)
c.fit(L(514.4), 1.4, [380, 2400, 3000, 3880], b=2.8)                   # D1 the world map
c.to(L(515.8), 3.6, z=z_of(c) * 1.02)
c.fit(L(519.5), 1.2, [3150, 2400, 6300, 3880], b=2.8)                  # D2 the three obstacles
c.to(L(520.7), 15.5, z=z_of(c) * 1.02)
c.fit(L(536.4), 1.4, [6550, 2400, 10600, 3880], b=2.8)                 # E the sum-up table
c.to(L(537.8), 17.9, z=z_of(c) * 1.02)
c.fit(L(555.9), 2.0, [250, 300, 10750, 3950], b=3)                     # chapter pull-back: rows 1–2
c.fit(L(558.15), .6, [380, 4400, 3700, 5830], b=2.4)                   # (under the card) F your platform
c.to(L(558.8), 20.6, z=z_of(c) * 1.03)
c.fit(L(579.55), 1.4, [4000, 4400, 7450, 5830], b=2.8)                 # G the answer
c.to(L(580.95), 19.4, z=z_of(c) * 1.02)
c.fit(L(600.4), 1.3, [7850, 4400, 10700, 5830], b=2.8)                 # H the boat, the official, the question
c.to(L(601.7), 8.8, z=z_of(c) * 1.02)
c.fit(L(610.55), 1.25, [250, 300, 10750, 5850], b=3)                   # final pull-back: the whole wall

# the whole wall is shifted right/down by DX, DY so the board's frame stays out of every resting camera
DX, DY = 650, 150
def shx(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('xy', 'c', 'from', 'to', 'pivot') and isinstance(v, list) and len(v) == 2 and isinstance(v[0], (int, float)): o[k] = [round(v[0] + DX, 1), round(v[1] + DY, 1)]
            elif k == 'points': o[k] = [[round(p[0] + DX, 1), round(p[1] + DY, 1)] if not isinstance(p, str) else p for p in v]
            elif k == 'strokes': [shx(q) for q in v]
for e in E: shx(e)
c.base['x'] += DX; c.base['y'] += DY
scene = dict(dur=DUR, clock=R0, board=dict(w=BW, h=BH, seed=95, texScale=.36, ghosts=220, tray=False), hand=1.0, sheen=.07,
             light=dict(x=-1800, y=-2400, r=40000, min=.8), cam=c.json(), mbMax=6, elements=E, cards=CARDS,
             ev=sorted(EV, key=lambda e: e['t']), subs=[])
json.dump(scene, open(os.path.join(HERE, 'film.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(dict(dur=DUR, ev=scene['ev']), open(os.path.join(FILM, 'events.json'), 'w'), separators=(',', ':'))
print('film.json', DUR, 's ·', NFR, 'frames ·', len(E), 'elements ·', len(EV), 'events ·', len(c.moves), 'camera moves')
