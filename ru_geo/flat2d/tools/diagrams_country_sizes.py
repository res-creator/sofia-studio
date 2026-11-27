#!/usr/bin/env python3
"""Собственные схемы для ролика country_sizes («Реальный размер стран: почему карта вам врёт»).
python3 tools/diagrams_country_sizes.py  -> archive/img/cs_*.jpg + записи в archive/credits.json
Границы стран: johan/world.geo.json (открытые данные). Все площади: таблица ООН (через RESEARCH.md), кроме отмеченных.
Нижние 250 px кадра свободны (субтитры): весь текст и графика выше y=800."""
import sys, json, math, os, urllib.request
sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools')
from dg import *
from PIL import Image, ImageDraw

S = Slug('country_sizes')
GJ = '/tmp/world.geo.json'
if not os.path.exists(GJ):
    open(GJ, 'wb').write(urllib.request.urlopen('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json', timeout=60).read())
FE = {f['properties']['name']: f['geometry'] for f in json.load(open(GJ))['features']}
AFR = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad', 'Republic of the Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'United Republic of Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe', 'Western Sahara']
LAND = (62, 66, 76); SEA = (20, 30, 44); WH = (255, 255, 255); LINE = (120, 126, 140)
YMAX = 800  # ниже ничего не рисуем
CRED = {}   # ключ -> подпись для title

def rings(g): return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]
def shape(names, filt=None):
    out = []
    for n in names:
        for r in rings(FE[n]):
            if filt is None or filt(n, r): out.append(r)
    return out
def rmean(r): return sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r)
# фильтры
METRO_FR = lambda n, r: not (n == 'France' and rmean(r)[0] < -10)                     # без Французской Гвианы
US48 = lambda n, r: not (n == 'United States of America' and (rmean(r)[0] < -125 or rmean(r)[1] > 49.5))
US_NOHI = lambda n, r: not (n == 'United States of America' and rmean(r)[1] < 25 and rmean(r)[0] < -150)
ALL_W = [n for n in FE if n != 'Antarctica']

# ---------- проекции
def merc(lon, lat): lat = max(-85.05, min(85.05, lat)); return math.radians(lon), math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
def gall(lon, lat): return math.radians(lon) * math.cos(math.pi / 4), math.sin(math.radians(lat)) / math.cos(math.pi / 4)
def wt(lon, lat):
    l, p = math.radians(lon), math.radians(lat); a = math.acos(math.cos(p) * math.cos(l / 2)); sa = math.sin(a) / a if a else 1
    return 0.5 * (l * (2 / math.pi) + 2 * math.cos(p) * math.sin(l / 2) / sa), 0.5 * (p + math.sin(p) / sa)
def lcea(lon, lat): return math.radians(lon), math.sin(math.radians(lat))
def moll(lon, lat):
    p = math.radians(lat); t = p
    for _ in range(30):
        f = 2 * t + math.sin(2 * t) - math.pi * math.sin(p); df = 2 + 2 * math.cos(2 * t)
        if abs(df) < 1e-9: break
        t -= f / df
    return 2 * math.sqrt(2) / math.pi * math.radians(lon) * math.cos(t), math.sqrt(2) * math.sin(t)
def laea(lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    def f(lon, lat):
        l, p = math.radians(lon), math.radians(lat)
        k = 1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0); k = math.sqrt(2 / max(k, 1e-9))
        return 6371 * k * math.cos(p) * math.sin(l - l0), 6371 * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
    return f
def dest(lon, lat, brg, dkm):
    p0, l0, d, b = math.radians(lat), math.radians(lon), dkm / 6371, math.radians(brg)
    p = math.asin(math.sin(p0) * math.cos(d) + math.cos(p0) * math.sin(d) * math.cos(b))
    l = l0 + math.atan2(math.sin(b) * math.sin(d) * math.cos(p0), math.cos(d) - math.sin(p0) * math.sin(p))
    return math.degrees(l), math.degrees(p)

# ---------- карты мира в рамке
def world(im, proj, hi, box, lon=(-180, 180), lat=(-60, 84), names=ALL_W, sea=None, grid=None, land=LAND):
    """рисует сушу в box=(x0,y0,x1,y1), вписывая окно lon/lat; возвращает T(lon,lat)->px"""
    x0, y0, x1, y1 = box; bw, bh = x1 - x0, y1 - y0
    xs, ys = [], []
    for lo in [lon[0] + (lon[1] - lon[0]) * i / 40 for i in range(41)]:
        for la in [lat[0] + (lat[1] - lat[0]) * i / 40 for i in range(41)]:
            X, Y = proj(lo, la); xs.append(X); ys.append(Y)
    sc = min(bw / (max(xs) - min(xs)), bh / (max(ys) - min(ys)))
    cxm, cym = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    T = lambda lo, la: (x0 + bw / 2 + sc * (proj(lo, la)[0] - cxm), y0 + bh / 2 - sc * (proj(lo, la)[1] - cym))
    lay = Image.new('RGB', (bw, bh), sea or BG); ld = ImageDraw.Draw(lay)
    if sea:  # фон проекции
        pass
    TL = lambda lo, la: (T(lo, la)[0] - x0, T(lo, la)[1] - y0)
    if grid:
        for gl in range(-180, 181, grid):
            ld.line([TL(gl, la) for la in range(int(lat[0]), int(lat[1]) + 1, 2)], fill=(44, 50, 62), width=2)
        for gp in range(-80, 81, grid):
            if lat[0] <= gp <= lat[1]: ld.line([TL(lo, gp) for lo in range(-180, 181, 2)], fill=(44, 50, 62), width=2)
    for n in names:
        if n not in FE: continue
        for r in rings(FE[n]):
            ld.polygon([TL(lo, max(-85, min(85, la))) for lo, la in r], fill=hi.get(n, land))
    im.paste(lay, (x0, y0)); return T

def outline_world(proj, hi, title, note, key, cap, labels=(), lat=(-58, 84), lon=(-180, 180)):
    im, d = S.new(title, None); T = world(im, proj, hi, (80, 140, 1840, 720), lon=lon, lat=lat)
    for lo, la, t, c, *an in labels: lab(d, T(lo, la), t, 34, c, an[0] if an else 'mm')
    if note: lab(d, (W / 2, 770), note, fit(d, note, 36, 1760), SUB)
    S.save(key, im, cap); return im

# ---------- сравнение в одном масштабе (равновеликая проекция для каждой фигуры)
def ea(names, filt=None):
    rs = shape(names, filt); pts = [p for r in rs for p in r]
    lo = sum(p[0] for p in pts) / len(pts); la = sum(p[1] for p in pts) / len(pts); f = laea(lo, la)
    P = [[f(*p) for p in r] for r in rs]; xs = [p[0] for r in P for p in r]; ys = [p[1] for r in P for p in r]
    return dict(P=P, x0=min(xs), x1=max(xs), y0=min(ys), y1=max(ys), w=max(xs) - min(xs), h=max(ys) - min(ys), f=f)
def draw_ea(d, A, cx, cy, sc, col, outline=None, width=0):
    mx, my = (A['x0'] + A['x1']) / 2, (A['y0'] + A['y1']) / 2
    for r in A['P']:
        pts = [(cx + (x - mx) * sc, cy - (y - my) * sc) for x, y in r]
        if col: d.polygon(pts, fill=col)
        if outline: d.line(pts + [pts[0]], fill=outline, width=width)
def versus(key, title, items, note=None, cap='', gap=140, top=150, bottom=640):
    """items=[(names, filt, цвет, имя, подпись площади)] в одном масштабе слева направо"""
    im, d = S.new(title, None); As = [ea(n, f) for n, f, *_ in items]
    tw = sum(a['w'] for a in As); th = max(a['h'] for a in As)
    sc = min((1700 - gap * (len(As) - 1)) / tw, (bottom - top) / th)
    x = (W - (tw * sc + gap * (len(As) - 1))) / 2; cy = (top + bottom) / 2
    for A, (_, _, col, nm, ar) in zip(As, items):
        cx = x + A['w'] * sc / 2; draw_ea(d, A, cx, cy, sc, col)
        lab(d, (cx, bottom + 45), nm, 44, col); lab(d, (cx, bottom + 95), ar, 34, TXT); x += A['w'] * sc + gap
    if note: lab(d, (W / 2, 785), note, fit(d, note, 32, 1760), SUB)
    S.save(key, im, cap); return im

def hbars(key, title, items, note=None, cap='', vmax=None, x0=600, wmax=950, top=200, step=None):
    """items=[(подпись, значение, текст значения, цвет)] линейный масштаб"""
    im, d = S.new(title, None); n = len(items); vmax = vmax or max(v for _, v, _, _ in items); step = step or min(130, 520 / n)
    for i, (nm, v, t, c) in enumerate(items):
        y = top + i * step + step / 2; w = wmax * v / vmax
        lab(d, (x0 - 24, y), nm, fit(d, nm, 40, x0 - 80), TXT, 'rm'); d.rectangle((x0, y - step * 0.32, x0 + w, y + step * 0.32), fill=c)
        lab(d, (x0 + w + 20, y), t, fit(d, t, 40, 1880 - x0 - w - 20), TXT, 'lm')
    if note: lab(d, (W / 2, 770), note, fit(d, note, 32, 1760), SUB)
    S.save(key, im, cap); return im

def arrow(d, a, b, col, w=6, head=22):
    d.line([a, b], fill=col, width=w); ang = math.atan2(b[1] - a[1], b[0] - a[0])
    for s in (-1, 1): d.line([b, (b[0] - head * math.cos(ang + s * 0.45), b[1] - head * math.sin(ang + s * 0.45))], fill=col, width=w)
def dim(d, xa, xb, y, t, col, sz=36):
    """размерная линия с засечками"""
    d.line([(xa, y), (xb, y)], fill=col, width=5)
    for x in (xa, xb): d.line([(x, y - 18), (x, y + 18)], fill=col, width=5)
    lab(d, ((xa + xb) / 2, y - 36), t, sz, col)
def tissot(d, T, lon, lat, rkm, col):
    d.polygon([T(*dest(lon, lat, b, rkm)) for b in range(0, 361, 6)], fill=col)

# =====================================================================
# 1. Карта Меркатора: Гренландия и Африка
HG = {'Greenland': OR, **{n: BL for n in AFR}}
outline_world(merc, HG, 'Карта Меркатора: Гренландия и Африка', 'Гренландия (оранжевая) выглядит почти как Африка (синяя)',
              'cs_merc_gl_af', 'Гренландия и Африка на карте Меркатора', labels=[(-41, 74, 'Гренландия', TXT), (20, 8, 'Африка', TXT)], lat=(-58, 84))
# 2. В одном масштабе
versus('cs_af_gl', 'В одном масштабе: Африка больше в 14 раз',
       [(AFR, None, BL, 'Африка', '≈30 млн км²'), (['Greenland'], None, OR, 'Гренландия', '≈2,2 млн км²')],
       'Обе фигуры в равновеликой проекции, масштаб общий', 'Африка и Гренландия в одном масштабе')
# 3. 14 Гренландий
def fourteen():
    im, d = S.new('Сколько Гренландий в Африке? Около 14 по площади', None)
    A = ea(AFR); G = ea(['Greenland']); sc = 520 / A['h']
    draw_ea(d, A, 420, 440, sc, BL); lab(d, (420, 745), 'Африка ≈30 млн км²', 36, BL)
    gw, gh = G['w'] * sc, G['h'] * sc; cols = 5; x0 = 830; y0 = 170
    for i in range(14):
        cx = x0 + (i % cols) * (gw + 28) + gw / 2; cy = y0 + (i // cols) * (gh + 22) + gh / 2; draw_ea(d, G, cx, cy, sc, OR)
    lab(d, (x0 + (cols * (gw + 28)) / 2, 745), '14 × Гренландия ≈2,2 млн км²', 36, OR)
    S.save('cs_14_gl', im, '14 Гренландий рядом с Африкой в одном масштабе')
fourteen()

# 4. Один курс (схема)
def one_course():
    im, d = S.new('Мечта штурмана: один курс от порта до порта', None)
    for x in range(260, 1700, 120): d.line([(x, 160), (x, 700)], fill=(44, 50, 62), width=2)
    for y in range(160, 701, 90): d.line([(260, y), (1660, y)], fill=(44, 50, 62), width=2)
    A, B = (360, 620), (1560, 240)
    pts = [(A[0] + (B[0] - A[0]) * t + 160 * math.sin(math.pi * t) * (1 + 0.6 * math.sin(7 * t)), A[1] + (B[1] - A[1]) * t + 120 * math.sin(math.pi * t)) for t in [i / 60 for i in range(61)]]
    for i in range(0, 60, 2): d.line([pts[i], pts[i + 1]], fill=RD, width=6)
    d.line([A, B], fill=GN, width=8)
    for p in (A, B): d.ellipse((p[0] - 16, p[1] - 16, p[0] + 16, p[1] + 16), fill=YL)
    lab(d, (A[0], A[1] + 50), 'порт отправления', 34, YL); lab(d, (B[0], B[1] - 50), 'порт назначения', 34, YL)
    lab(d, (930, 330), 'один курс: прямая', 38, GN); lab(d, (1180, 640), 'поправки и дрейф', 38, RD)
    lab(d, (W / 2, 770), 'Схема: зелёная линия пересекает все меридианы под одним углом', 32, SUB)
    S.save('cs_one_course', im, 'Схема: один курс против поправок в пути')
one_course()

# 5. Фландрия и Дуйсбург
def flanders():
    im, d = S.new('Фландрия и Дуйсбург', None)
    hi = {'Belgium': (78, 92, 120), 'Germany': (74, 82, 96)}
    T = world(im, merc, hi, (310, 140, 1610, 730), lon=(0.5, 9.5), lat=(49.2, 53.8), names=ALL_W, sea=SEA)
    for lo, la, t in ((4.4, 50.45, 'Бельгия'), (5.6, 52.6, 'Нидерланды'), (8.6, 50.5, 'Германия'), (2.3, 49.6, 'Франция')): lab(d, T(lo, la), t, 34, SUB)
    for lo, la, t, c, anc, dx in ((4.29, 51.13, 'Фландрия:', OR, 'rm', -22), (6.76, 51.43, 'Дуйсбург', BL, 'lm', 22)):
        x, y = T(lo, la); d.ellipse((x - 14, y - 14, x + 14, y + 14), fill=c); lab(d, (x + dx, y - 26), t, 36, c, anc)
    x, y = T(4.29, 51.13); lab(d, (x - 22, y + 22), 'здесь родился Меркатор, 1512', 32, OR, 'rm')
    x, y = T(6.76, 51.43); lab(d, (x + 22, y + 22), 'здесь он жил с 1552,', 32, BL, 'lm'); lab(d, (x + 22, y + 62), 'здесь вышла карта 1569', 32, BL, 'lm')
    S.save('cs_flanders', im, 'Фландрия (место рождения Меркатора) и Дуйсбург на карте')
flanders()

# 6. Латинское название карты
def title1569():
    im, d = S.new('Название карты 1569 года (латынь)', None)
    lines = [('NOVA ET AUCTA ORBIS TERRAE DESCRIPTIO', SUB), ('AD USUM NAVIGANTIUM', YL), ('EMENDATE ACCOMMODATA', YL)]
    for i, (t, c) in enumerate(lines): lab(d, (W / 2, 250 + i * 95), t, fit(d, t, 66, 1700), c)
    d.line([(560, 520), (1360, 520)], fill=GR, width=3)
    lab(d, (W / 2, 600), '«…исправленная для пользы мореплавателей»', fit(d, '«…исправленная для пользы мореплавателей»', 54, 1700), TXT)
    lab(d, (W / 2, 700), 'Новое и полное описание земного шара…', 34, SUB)
    S.save('cs_title_1569', im, 'Латинское название карты 1569 года')
title1569()

# 7. Хронология Меркатора
def tl(key, title, pts, span, hiyrs, cap, note=None):
    """хронология списком сверху вниз (интервалы между строками не в масштабе)"""
    im, d = S.new(title, None); n = len(pts); step = min(95, 520 / n); y0 = 190 + (540 - step * (n - 1)) / 2
    d.line((560, y0, 560, y0 + step * (n - 1)), fill=GR, width=6)
    for i, (yr, t) in enumerate(pts):
        y = y0 + i * step; c = OR if yr in hiyrs else SUB; tc = TXT if yr in hiyrs else SUB
        d.ellipse((544, y - 16, 576, y + 16), fill=c); lab(d, (510, y), str(yr), 48, c, 'rm'); t1 = t.replace('\n', ' '); lab(d, (610, y), t1, fit(d, t1, 40, 1250), tc, 'lm')
    if note: lab(d, (W / 2, 770), note, fit(d, note, 32, 1760), SUB)
    S.save(key, im, cap)
tl('cs_tl_mercator', 'Жизнь Меркатора и «Атлас»', [(1512, 'родился\nво Фландрии'), (1569, 'карта мира\nдля моряков'), (1594, 'умер\nв Дуйсбурге'), (1595, '«Атлас»')], (1500, 1610), (1595,), 'Хронология: Меркатор и «Атлас»')

# 8. Локсодрома и дуга на карте Меркатора (Гавана — Лиссабон)
HAV, LIS = (-82.37, 23.13), (-9.14, 38.72)
def gc_pts(a, b, n=80):
    def v(lo, la): lo, la = math.radians(lo), math.radians(la); return (math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la))
    A, B = v(*a), v(*b); om = math.acos(sum(x * y for x, y in zip(A, B))); out = []
    for i in range(n + 1):
        t = i / n; s1 = math.sin((1 - t) * om) / math.sin(om); s2 = math.sin(t * om) / math.sin(om); P = [s1 * x + s2 * y for x, y in zip(A, B)]
        out.append((math.degrees(math.atan2(P[1], P[0])), math.degrees(math.asin(P[2]))))
    return out
def atlantic(title, key, cap, ruler=False, gc=True):
    im, d = S.new(title, None); T = world(im, merc, {}, (140, 140, 1780, 700), lon=(-100, 10), lat=(5, 60), sea=SEA, grid=10)
    a, b = T(*HAV), T(*LIS)
    if ruler:
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov); ang = math.atan2(b[1] - a[1], b[0] - a[0]); nx, ny = -math.sin(ang), math.cos(ang); ex, ey = math.cos(ang) * 60, math.sin(ang) * 60
        poly = [(a[0] - ex + nx * 4, a[1] - ey + ny * 4), (b[0] + ex + nx * 4, b[1] + ey + ny * 4), (b[0] + ex + nx * 60, b[1] + ey + ny * 60), (a[0] - ex + nx * 60, a[1] - ey + ny * 60)]
        od.polygon(poly, fill=(240, 214, 140, 120)); im.paste(Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')); d = ImageDraw.Draw(im)
        for k in range(0, 41):  # деления линейки
            t = k / 40; x = a[0] - ex + (b[0] + ex - a[0] + ex) * t; y = a[1] - ey + (b[1] + ey - a[1] + ey) * t; L = 22 if k % 5 == 0 else 12
            d.line([(x + nx * 4, y + ny * 4), (x + nx * (4 + L), y + ny * (4 + L))], fill=(60, 50, 30), width=2)
        # меридиан и угол курса у Гаваны
        d.line([a, (a[0], a[1] - 260)], fill=YL, width=4); bear = math.degrees(math.atan2(b[0] - a[0], -(b[1] - a[1])))
        d.arc((a[0] - 150, a[1] - 150, a[0] + 150, a[1] + 150), -90, -90 + bear, fill=YL, width=6)
        lab(d, (a[0] + 30, a[1] - 290), 'север', 32, YL, 'lm'); lab(d, (a[0] + 175, a[1] - 175), 'угол = курс', 36, YL, 'lm')
    if gc:
        d.line([T(*p) for p in gc_pts(HAV, LIS)], fill=BL, width=7)
        lab(d, T(-45, 49.5), 'кратчайший путь: дуга', 36, BL)
    d.line([a, b], fill=OR, width=8)
    for p, t, anc in ((a, 'Гавана', 'rm'), (b, 'Лиссабон', 'lm')):
        d.ellipse((p[0] - 14, p[1] - 14, p[0] + 14, p[1] + 14), fill=WH); lab(d, (p[0] + (-24 if anc == 'rm' else 24), p[1] + 34), t, 36, WH, anc)
    if not ruler: lab(d, T(-64, 18), 'локсодрома: постоянный курс — прямая', 36, OR, 'lm')
    lab(d, (W / 2, 770), 'Карта Меркатора, Северная Атлантика (пример маршрута)', 32, SUB)
    S.save(key, im, cap)
atlantic('Локсодрома на карте Меркатора', 'cs_rhumb', 'Локсодрома и кратчайший путь на карте Меркатора')
atlantic('Линейка между портами: угол к меридиану и есть курс', 'cs_ruler', 'Курс по линейке на карте Меркатора', ruler=True, gc=False)
atlantic('Не самая короткая дорога, зато без поворотов', 'cs_ruler_gc', 'Прямой курс и кратчайшая дуга', ruler=False, gc=True)

# 9. Растяжение по широте (sec φ)
def stretch():
    im, d = S.new('Карта Меркатора: растяжение по широте', None)
    lats = [0, 20, 40, 60, 70]; x0 = 300; bw = 115; gap = 95; base = 690; k = 56  # px на единицу множителя
    lab(d, (x0 - 30, base + 45), 'широта', 30, SUB, 'rm')
    for i, la in enumerate(lats):
        s = 1 / math.cos(math.radians(la)); a = s * s; x = x0 + i * (2 * bw + gap)
        d.rectangle((x, base - s * k, x + bw - 10, base), fill=BL); d.rectangle((x + bw, base - a * k, x + 2 * bw - 10, base), fill=OR if la == 60 else (170, 120, 50))
        lab(d, (x + bw / 2 - 5, base - s * k - 26), '×' + f'{s:.2f}'.rstrip('0').rstrip('.').replace('.', ','), 30, BL)
        lab(d, (x + 1.5 * bw - 5, base - a * k - 26), '×' + f'{a:.1f}'.rstrip('0').rstrip('.').replace('.', ','), 30, OR)
        lab(d, (x + bw - 5, base + 45), f'{la}°', 40, YL if la == 60 else TXT)
    d.line((x0 - 20, base, 1820, base), fill=SUB, width=3)
    lab(d, (465, 200), 'длины', 38, BL, 'lm'); lab(d, (465, 250), 'площади', 38, OR, 'lm')
    d.rectangle((420, 186, 450, 214), fill=BL); d.rectangle((420, 236, 450, 264), fill=OR)
    lab(d, (W / 2, 775), 'Множитель длин = 1 / cos(широты), площадей = его квадрат. Масштаб линейный', 30, SUB)
    S.save('cs_stretch', im, 'Растяжение карты Меркатора по широте')
stretch()

# 10. Одинаковые круги (индикатриса Тиссо) на Меркаторе
def tissot_map(proj, key, title, note, cap, hi=HG, lat=(-58, 84), r=560, box=(80, 140, 1840, 720)):
    im, d = S.new(title, None); T = world(im, proj, hi, box, lat=lat)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for la in (-60, -40, -20, 0, 20, 40, 60):
        if la < lat[0] + 3: continue
        for lo in range(-160, 181, 40): od.polygon([T(*dest(lo, la, b, r)) for b in range(0, 361, 6)], fill=(235, 80, 80, 170))
    im.paste(Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')); d = ImageDraw.Draw(im)
    lab(d, (W / 2, 770), note, fit(d, note, 34, 1760), SUB); S.save(key, im, cap)
tissot_map(merc, 'cs_tissot', 'Одинаковые круги на карте Меркатора', 'На глобусе все красные круги одного размера', 'Одинаковые круги на карте Меркатора', lat=(-64, 84))

# 11. Квадрат у экватора и на 60°
def square60():
    im, d = S.new('Одинаковые квадраты: у экватора и на 60°', None)
    T = world(im, merc, {}, (360, 140, 1000, 720), lon=(-25, 55), lat=(-25, 74), sea=SEA, grid=20)
    for la, c, t in ((0, BL, 'у экватора: ×1'), (60, OR, '60°: длины ×2, площадь ×4')):
        # квадрат 600×600 км на глобусе, центр на 10° в.д.
        dl = math.degrees(1000 / (6371 * math.cos(math.radians(la)))) / 2; dp = math.degrees(1000 / 6371) / 2
        p = [T(15 - dl, la - dp), T(15 + dl, la - dp), T(15 + dl, la + dp), T(15 - dl, la + dp)]
        d.polygon(p, outline=c, width=7); lab(d, (1040, (p[1][1] + p[2][1]) / 2), t, 38, c, 'lm')
    lab(d, (W / 2, 770), 'На глобусе оба квадрата 1000 × 1000 км', 32, SUB)
    S.save('cs_square60', im, 'Два одинаковых квадрата на карте Меркатора')
square60()

# 12. Апельсиновая корка: глобус в долях
def gores():
    im, d = S.new('Шар на плоскость: только с разрывами', None)
    n = 12; gw = 1680 / n; top, bot = 170, 700; sy = (bot - top) / math.pi; sx = gw / math.radians(360 / n)
    for g in range(n):
        lc = -180 + (g + 0.5) * 360 / n; cx = 120 + (g + 0.5) * gw
        lay = Image.new('RGB', (W, H), (0, 0, 0)); ld = ImageDraw.Draw(lay)
        P = lambda lo, la: (cx + sx * math.radians(lo) * math.cos(math.radians(la)), (top + bot) / 2 - sy * math.radians(la))
        edge = [P(-180 / n, la) for la in range(-90, 91, 3)] + [P(180 / n, la) for la in range(90, -91, -3)]
        ld.polygon(edge, fill=(26, 52, 80))
        for nm in FE:
            for r in rings(FE[nm]):
                rel = [(((lo - lc + 180) % 360) - 180, la) for lo, la in r]
                if any(abs(rel[i][0] - rel[i - 1][0]) > 180 for i in range(1, len(rel))): continue
                if min(x for x, _ in rel) > 40 or max(x for x, _ in rel) < -40: continue
                ld.polygon([P(x, la) for x, la in rel], fill=(150, 160, 175) if nm != 'Greenland' else OR)
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(edge, fill=255); im.paste(lay, (0, 0), m)
    lab(d, (W / 2, 750), 'Гаусс, 1827: развернуть шар на плоскость без искажений нельзя', fit(d, 'Гаусс, 1827: развернуть шар на плоскость без искажений нельзя', 36, 1760), TXT)
    S.save('cs_gores', im, 'Глобус, разрезанный на дольки, как апельсиновая корка')
gores()

# 13. Две задачи
S.cards('cs_two_jobs', 'Одна карта, две задачи', [('✓', 'моряку: курс — прямая', GN), ('✗', 'учителю: площади искажены', RD)])

# 14. Цифры ООН: Африка и Гренландия
hbars('cs_bars_af_gl', 'Площадь, млн км² (ООН: суша с внутренними водами)', [('Африка', 30.3, '≈30', BL), ('Гренландия', 2.17, '≈2,2', OR)],
      'Африка с островами ≈ в 14 раз больше Гренландии', 'Африка и Гренландия: площади', top=260, step=160)
# 15. Алжир и Гренландия
versus('cs_alg_gl', 'Гренландия меньше одного Алжира',
       [(['Algeria'], None, BL, 'Алжир', '≈2,38 млн км²'), (['Greenland'], None, OR, 'Гренландия', '≈2,17 млн км²')],
       'Один масштаб, равновеликая проекция. Площади: таблица ООН', 'Алжир и Гренландия в одном масштабе')
outline_world(merc, {'Greenland': OR, 'Algeria': BL}, 'А на карте Меркатора — наоборот', 'Гренландия (оранжевая) и Алжир (синий): глаз привык к этой картинке',
              'cs_merc_alg_gl', 'Гренландия и Алжир на карте Меркатора', labels=[(-62, 72, 'Гренландия', OR, 'rm'), (-14, 28, 'Алжир', BL, 'rm')])
# 16. Во сколько раз раздута площадь
def inflate():
    im, d = S.new('Во сколько раз Меркатор раздувает площадь', None); x0 = 560; k = 85
    for i, (nm, lo, hi_, t, c) in enumerate((('Гренландия', 10, 12, '×10–12', OR), ('Австралия', 1.2, 1.2, '×1,2', BL))):
        y = 300 + i * 200; d.rectangle((x0, y - 50, x0 + lo * k, y + 50), fill=c)
        if hi_ > lo: d.rectangle((x0 + lo * k, y - 50, x0 + hi_ * k, y + 50), fill=tuple(int(v * 0.6) for v in c))
        lab(d, (x0 - 24, y), nm, 44, TXT, 'rm'); lab(d, (x0 + hi_ * k + 24, y), t, 48, c, 'lm')
    d.line((x0, 220, x0, 560), fill=SUB, width=3); d.line((x0 + k, 230, x0 + k, 560), fill=GR, width=2); lab(d, (x0 + k, 590), '×1 = честно', 30, SUB)
    lab(d, (W / 2, 690), 'Гренландия лежит у полюса, Австралия ближе к экватору', 34, TXT)
    lab(d, (W / 2, 770), 'Оценка по широте: площадь растёт как 1 / cos² широты', 32, SUB)
    S.save('cs_inflate', im, 'Во сколько раз раздута площадь на карте Меркатора')
inflate()

# 17. Гренландия, перенесённая к экватору (поворот шара, форма и площадь те же)
def moved(names, to_lon, to_lat=0):
    rs = shape(names); pts = [p for r in rs for p in r]; lc = sum(p[0] for p in pts) / len(pts); pc = sum(p[1] for p in pts) / len(pts); a = math.radians(pc - to_lat)
    out = []
    for r in rs:
        q = []
        for lo, la in r:
            L, P = math.radians(lo - lc), math.radians(la); x, y, z = math.cos(P) * math.cos(L), math.cos(P) * math.sin(L), math.sin(P)
            x2 = x * math.cos(a) + z * math.sin(a); z2 = -x * math.sin(a) + z * math.cos(a)
            q.append((to_lon + math.degrees(math.atan2(y, x2)), math.degrees(math.asin(max(-1, min(1, z2))))))
        out.append(q)
    return out
def shrink():
    im, d = S.new('Перетащим Гренландию к экватору', None)
    T = world(im, merc, {'Greenland': OR, **{n: (60, 100, 140) for n in AFR}}, (80, 140, 1840, 720), lat=(-58, 84))
    for r in moved(['Greenland'], -28, 2): d.polygon([T(*p) for p in r], fill=YL)
    arrow(d, T(-38, 62), T(-30, 14), WH)
    x, y = T(-36, 2); lab(d, (x - 30, y - 22), 'та же Гренландия', 34, YL, 'rm'); lab(d, (x - 30, y + 22), 'у экватора', 34, YL, 'rm')
    lab(d, (W / 2, 770), 'Карта Меркатора. Форма и площадь острова те же, сменилась только широта', 32, SUB)
    S.save('cs_gl_shrink', im, 'Гренландия на своём месте и у экватора на карте Меркатора')
shrink()

# 18. Длина × ширина
def area_rule():
    im, d = S.new('Площадь = длина × ширина', None)
    a = 170; x1, y1 = 330, 300
    d.rectangle((x1, y1, x1 + a, y1 + a), fill=BL); lab(d, (x1 + a / 2, y1 + a + 50), '1 × 1 = 1', 40, BL)
    arrow(d, (620, 385), (820, 385), SUB)
    x2, y2 = 940, 215
    for i in range(2):
        for j in range(2): d.rectangle((x2 + i * a, y2 + j * a, x2 + (i + 1) * a - 6, y2 + (j + 1) * a - 6), fill=OR)
    lab(d, (x2 + a, y2 + 2 * a + 50), '2 × 2 = 4', 40, OR)
    lab(d, (x2 + 2 * a + 40, y2 + a), 'длина ×2', 38, TXT, 'lm'); lab(d, (x2 + 2 * a + 40, y2 + a + 60), 'ширина ×2', 38, TXT, 'lm'); lab(d, (x2 + 2 * a + 40, y2 + a + 130), 'площадь ×4', 44, YL, 'lm')
    lab(d, (W / 2, 770), 'Небольшое растяжение сторон — большая разница в площади', 34, SUB)
    S.save('cs_area_rule', im, 'Площадь растёт как квадрат растяжения')
area_rule()

# 19. Россия
HR = {'Russia': OR, **{n: BL for n in AFR}}
outline_world(merc, HR, 'Россия на карте Меркатора', 'Россия (оранжевая) нависает над миром, Африка (синяя) кажется меньше', 'cs_merc_ru_af', 'Россия и Африка на карте Меркатора',
              labels=[(95, 62, 'Россия', TXT), (20, 8, 'Африка', TXT)])
versus('cs_ru_af', 'В одном масштабе: Африка больше России',
       [(['Russia'], None, OR, 'Россия', '≈17,1 млн км²'), (AFR, None, BL, 'Африка', '≈30 млн км²')], 'Один масштаб, равновеликая проекция', 'Россия и Африка в одном масштабе')
hbars('cs_bars_ru', 'Самая большая страна и целый континент, млн км²',
      [('Африка (континент)', 30.3, '≈30', BL), ('Россия', 17.1, '≈17,1  — самая большая страна', OR), ('Канада', 9.98, '≈10,0', GR), ('Китай', 9.6, '≈9,6', GR)],
      'Площади: таблица ООН (Канада, Китай: там же)', 'Россия, Канада, Китай и Африка: площади')

# 20. Конго и Франция
versus('cs_congo_fr', 'ДР Конго и Франция в одном масштабе',
       [(['Democratic Republic of the Congo'], None, OR, 'ДР Конго', '≈2,34 млн км²'), (['France'], METRO_FR, BL, 'Франция', '≈0,55 млн км² (без заморских)')],
       'Один масштаб, равновеликая проекция', 'ДР Конго и Франция в одном масштабе')
def congo4():
    im, d = S.new('В ДР Конго по площади — четыре Франции и ещё немного', None)
    C = ea(['Democratic Republic of the Congo']); Fr = ea(['France'], METRO_FR); sc = 520 / C['h']
    draw_ea(d, C, 520, 430, sc, OR); lab(d, (520, 740), 'ДР Конго ≈2,34 млн км²', 38, OR)
    fw, fh = Fr['w'] * sc, Fr['h'] * sc
    for i in range(4): draw_ea(d, Fr, 1180 + (i % 2) * (fw + 30), 260 + (i // 2) * (fh + 30), sc, BL)
    lab(d, (1180 + (fw + 30) / 2, 740), '4 × Франция ≈2,2 млн км²', 38, BL)
    S.save('cs_congo_4fr', im, 'ДР Конго и четыре Франции в одном масштабе')
congo4()
def africa_top():
    im, d = S.new('Самые большие страны Африки', None)
    A = ea(AFR); sc = 600 / A['h']; mx, my = (A['x0'] + A['x1']) / 2, (A['y0'] + A['y1']) / 2; cx, cy = 760, 460
    for n in AFR:
        col = OR if n == 'Algeria' else BL if n == 'Democratic Republic of the Congo' else LAND
        for r in rings(FE[n]): d.polygon([(cx + (A['f'](*p)[0] - mx) * sc, cy - (A['f'](*p)[1] - my) * sc) for p in r], fill=col)
    lab(d, (1180, 330), '1. Алжир', 48, OR, 'lm'); lab(d, (1180, 390), '≈2,38 млн км²', 34, TXT, 'lm')
    lab(d, (1180, 520), '2. ДР Конго', 48, BL, 'lm'); lab(d, (1180, 580), '≈2,34 млн км²', 34, TXT, 'lm')
    S.save('cs_africa_top', im, 'Алжир и ДР Конго на карте Африки')
africa_top()

# 21. Бразилия и материковые США
versus('cs_br_us48', 'Бразилия и материковые США в одном масштабе',
       [(['Brazil'], None, OR, 'Бразилия', '≈8,5 млн км² (ООН)'), (['United States of America'], US48, BL, 'США без Аляски и Гавайев', '≈8,1 млн км² (CIA)')],
       'Бразилия больше примерно на 5 %. Цифры из двух разных справочников', 'Бразилия и материковые США в одном масштабе')

hbars('cs_br_us_bars', 'Бразилия и материковые США, млн км²', [('Бразилия (ООН)', 8.51, '≈8,5', OR), ('США без Аляски и Гавайев (CIA)', 8.08, '≈8,1', BL)],
      'Два разных справочника, но разница ≈5 % — вывод не меняется', 'Бразилия и материковые США: площади', top=260, step=170, x0=860, wmax=780)

# 22. Индонезия
def indo_span():
    im, d = S.new('Индонезия: больше 17 000 островов', None)
    I = ea(['Indonesia']); sc = min(1560 / I['w'], 420 / I['h']); cx, cy = W / 2, 380; draw_ea(d, I, cx, cy, sc, OR)
    x0 = cx - I['w'] * sc / 2; x1 = cx + I['w'] * sc / 2; dim(d, x0, x1, 680, 'с запада на восток ≈5 000 км', YL, 40)
    lab(d, (W / 2, 770), 'Равновеликая проекция. Мелкие острова на таком масштабе почти не видны', 32, SUB)
    S.save('cs_indo_span', im, 'Индонезия с запада на восток')
indo_span()
def indo_us():
    im, d = S.new('Индонезия поверх США в одном масштабе', None)
    U = ea(['United States of America'], US48); I = ea(['Indonesia']); sc = min(1500 / max(U['w'], I['w']), 470 / max(U['h'], I['h'])); cx, cy = W / 2, 400
    draw_ea(d, U, cx, cy, sc, (60, 80, 110))
    mx, my = (U['x0'] + U['x1']) / 2, (U['y0'] + U['y1']) / 2
    P = lambda lo, la: (cx + (U['f'](lo, la)[0] - mx) * sc, cy - (U['f'](lo, la)[1] - my) * sc)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov); draw_ea(od, I, cx + 40, cy + 20, sc, (240, 170, 60, 210))
    im.paste(Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')); d = ImageDraw.Draw(im)
    ny, la_ = P(-74.0, 40.71), P(-118.24, 34.05); d.line([la_, ny], fill=WH, width=5)
    for p, t, anc, dx in ((ny, 'Нью-Йорк', 'lm', 20), (la_, 'Лос-Анджелес', 'rm', -20)): d.ellipse((p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12), fill=WH); lab(d, (p[0] + dx, p[1] - 30), t, 36, WH, anc)
    lab(d, (W / 2, 715), 'Нью-Йорк — Лос-Анджелес по прямой ≈3 900 км; Индонезия ≈5 000 км', fit(d, 'Нью-Йорк — Лос-Анджелес по прямой ≈3 900 км; Индонезия ≈5 000 км', 36, 1760), TXT)
    lab(d, (W / 2, 770), 'Оранжевая — Индонезия, синяя — материковые США. Равновеликая проекция', 32, SUB)
    S.save('cs_indo_us', im, 'Индонезия поверх США в одном масштабе')
indo_us()

# 23. США + Китай + Индия против Африки
def stack3():
    im, d = S.new('США + Китай + Индия против Африки, млн км²', None); x0 = 420; k = 1300 / 31
    segs = (('США', 9.5, BL), ('Китай', 9.6, OR), ('Индия', 3.3, GN)); x = x0; y = 300
    for nm, v, c in segs:
        d.rectangle((x, y - 60, x + v * k - 4, y + 60), fill=c); lab(d, (x + v * k / 2, y - 95), nm, 36, c); lab(d, (x + v * k / 2, y), str(v).replace('.', ','), 40, BG); x += v * k
    lab(d, (x0 - 24, y), 'вместе', 40, TXT, 'rm'); lab(d, (x + 20, y), '≈22,4', 40, TXT, 'lm')
    y = 500; d.rectangle((x0, y - 60, x0 + 30.3 * k, y + 60), fill=(90, 120, 200)); lab(d, (x0 - 24, y), 'Африка', 40, TXT, 'rm'); lab(d, (x0 + 30.3 * k / 2, y), '≈30', 44, BG)
    lab(d, (W / 2, 680), 'Таблица ООН. В площади Китая и Индии входят районы', 32, SUB)
    lab(d, (W / 2, 725), 'с оспариваемым статусом: сумма меняется на 1–2 % (оценка)', 32, SUB)
    S.save('cs_stack3', im, 'США, Китай и Индия вместе против Африки')
stack3()
def three_vs_af():
    im, d = S.new('Три гиганта и Африка в одном масштабе', None)
    items = [(['United States of America'], US_NOHI, BL, 'США'), (['China'], None, OR, 'Китай'), (['India'], None, GN, 'Индия')]
    As = [ea(n, f) for n, f, _, _ in items]; A = ea(AFR); sc = 560 / A['h']
    draw_ea(d, A, 1450, 430, sc, (90, 120, 200)); lab(d, (1450, 745), 'Африка ≈30', 40, (130, 160, 230))
    pos = [(470, 300), (840, 330), (640, 600)]
    for Aa, (cx, cy), (_, _, c, nm) in zip(As, pos, items): draw_ea(d, Aa, cx, cy, sc, c)
    lab(d, (650, 745), 'США + Китай + Индия ≈22,4 млн км²', 40, TXT)
    S.save('cs_three_vs_af', im, 'США, Китай и Индия рядом с Африкой в одном масштабе')
three_vs_af()

# 24. Луна и Австралия: ширина
def moon_aus():
    im, d = S.new('Ширина Австралии и поперечник Луны', None)
    Au = ea(['Australia'], lambda n, r: rmean(r)[1] > -40)   # без Тасмании
    sc = 560 / 4000; acx, cy = 560, 400
    draw_ea(d, Au, acx, cy, sc, OR)
    mr = 3474 / 2 * sc; mcx = 1390
    tex = Image.open('/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad/cs/dl/moon_lro.jpg').convert('RGB')
    tex = tex.crop((70, 70, 1850, 1850)).resize((int(2 * mr), int(2 * mr))); m = Image.new('L', tex.size, 0); ImageDraw.Draw(m).ellipse((0, 0, tex.size[0] - 1, tex.size[1] - 1), fill=255)
    im.paste(tex, (int(mcx - mr), int(cy - mr)), m)
    aw = Au['w'] * sc; dim(d, acx - aw / 2, acx + aw / 2, 715, 'Австралия ≈4 000 км', OR, 38); dim(d, mcx - mr, mcx + mr, 715, 'Луна ≈3 500 км', SUB, 38)
    lab(d, (W / 2, 775), 'Один масштаб. Поперечник шара против ширины суши — сравнение условное', 32, SUB)
    print('Australia W-E km (laea):', round(Au['w']))
    S.save('cs_moon_aus', im, 'Ширина Австралии и диаметр Луны в одном масштабе')
moon_aus()
hbars('cs_bars_moon', 'Площадь, млн км²',
      [('Азия', 44.6, '≈44,6', GR), ('Луна', 37.9, '≈38 — вся поверхность', YL), ('Африка', 30.3, '≈30', BL), ('Австралия', 7.7, '≈7,7', OR)],
      'Луна: NASA; материки и Австралия: справочные таблицы', 'Площадь Луны, Азии, Африки и Австралии')

# 25. Правила сравнения
S.cards('cs_rules12', 'Как сравнивать честно', [('1', 'км², а не контуры на глаз', YL), ('2', 'цифры из одного источника', BL)])
hbars('cs_land_water', 'Одна страна — две площади: Канада, млн км²', [('только суша', 8.97, '≈9,0', OR), ('суша + озёра и реки', 9.98, '≈10,0', BL)],
      'Источник: Статистическое управление Канады. Ошибки нет, разный счёт', 'Площадь Канады: суша и суша с водой', top=260, step=170, x0=720, wmax=860)
def disputed():
    im, d = S.new('3. Спорные территории', None)
    poly = [(560, 230), (980, 200), (1160, 300), (1120, 560), (820, 650), (560, 560), (480, 400)]
    d.polygon(poly, fill=BL); hz = [(1160, 300), (1400, 280), (1440, 480), (1120, 560)]
    lay = Image.new('L', (W, H), 0); ImageDraw.Draw(lay).polygon(hz, fill=255); hat = Image.new('RGB', (W, H), BG); hd = ImageDraw.Draw(hat)
    for x in range(-800, 2000, 26): hd.line([(x, 800), (x + 600, 100)], fill=OR, width=8)
    im.paste(hat, (0, 0), lay); d.line(hz + [hz[0]], fill=OR, width=4)
    lab(d, (800, 430), 'страна', 40, BG); lab(d, (1290, 600), 'спорный район', 34, OR)
    lab(d, (W / 2, 710), 'Одни справочники считают его в площади страны, другие нет', 34, TXT)
    lab(d, (W / 2, 770), 'Условная схема, не карта реальной страны', 30, SUB)
    S.save('cs_disputed', im, 'Схема: спорный район и площадь страны')
disputed()

# 26. Веб-Меркатор
def cross():
    im, d = S.new('Вблизи: углы верны, улицы не перекошены', None)
    for x in (520, 960, 1400): d.rectangle((x - 36, 150, x + 36, 700), fill=(70, 74, 84))
    for y in (250, 600): d.rectangle((300, y - 36, 1620, y + 36), fill=(70, 74, 84))
    for x in (520, 960, 1400):
        for y in (250, 600):
            d.line([(x + 36, y - 36), (x + 36, y - 90)], fill=YL, width=4); d.line([(x + 36, y - 36), (x + 90, y - 36)], fill=YL, width=4)
            d.rectangle((x + 36, y - 66, x + 66, y - 36), outline=YL, width=3); lab(d, (x + 130, y - 90), '90°', 32, YL)
    lab(d, (W / 2, 770), 'Схема: на крупном масштабе прямой угол перекрёстка остаётся прямым', 32, SUB)
    S.save('cs_cross', im, 'Схема: прямые углы улиц на веб-Меркаторе')
cross()
def webmerc():
    im, d = S.new('Отдалили до всей планеты: веб-Меркатор', None)
    T = world(im, merc, HG, (610, 130, 1310, 730), lat=(-85.05, 85.05), sea=SEA)
    lab(d, T(-41, 74), 'Гренландия', 30, TXT); lab(d, (1360, 420), 'карта-квадрат,', 32, SUB, 'lm'); lab(d, (1360, 465), 'как в телефоне', 32, SUB, 'lm')
    lab(d, (W / 2, 775), 'Гренландия (оранжевая) снова почти как Африка (синяя)', 32, SUB)
    S.save('cs_webmerc', im, 'Весь мир в проекции веб-Меркатора')
webmerc()

# 27. Два сорта карт (одни и те же круги)
def two_sorts():
    im, d = S.new('Два сорта карт: одни и те же круги', None)
    for proj, box, t, c, lat in ((merc, (60, 170, 940, 650), 'хранит углы и формы', OR, (-70, 80)), (gall, (980, 170, 1860, 650), 'хранит площади', BL, (-75, 80))):
        T = world(im, proj, {}, box, lat=lat); ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        for la in (-60, -30, 0, 30, 60):
            for lo in range(-150, 181, 60): od.polygon([T(*dest(lo, la, b, 900)) for b in range(0, 361, 6)], fill=(235, 80, 80, 180))
        im.paste(Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')); d = ImageDraw.Draw(im); lab(d, ((box[0] + box[2]) / 2, 700), t, 40, c)
    lab(d, (W / 2, 775), 'Слева круги круглые, но растут к полюсам; справа площадь одна, но круги сплющены', fit(d, 'Слева круги круглые, но растут к полюсам; справа площадь одна, но круги сплющены', 32, 1780), SUB)
    S.save('cs_two_sorts', im, 'Одинаковые круги на равноугольной и равновеликой картах')
two_sorts()

# 28. Галл — Петерс
outline_world(gall, HG, 'Проекция Галла — Петерса', 'Площади честные: Африка (синяя) большая, но вытянутая', 'cs_gallpeters', 'Карта мира в проекции Галла — Петерса',
              labels=[(-62, 70, 'Гренландия', OR, 'rm'), (20, 8, 'Африка', TXT)], lat=(-58, 84))
PTS = [(1569, 'Меркатор'), (1855, 'Галл'), (1921, 'Винкель'), (1973, 'Петерс\nпродвигает'), (1986, 'имя\n«Галла — Петерса»'), (1998, 'National Geographic\n→ Винкель')]
tl('cs_tl_gp', 'Кто и когда', PTS, (1550, 2010), (1855, 1973), 'Хронология: Галл и Петерс')
tl('cs_tl_1986', 'Имя «Галла — Петерса» — только в 1986', PTS, (1550, 2010), (1855, 1986), 'Хронология: имя проекции в 1986 году', 'Больше ста лет после Галла')
tl('cs_tl_1998', 'Винкель (1921) и National Geographic (1998)', PTS, (1550, 2010), (1921, 1998), 'Хронология: проекция Винкеля')
def before():
    im, d = S.new('Равновеликие проекции были и раньше', None)
    for i, (proj, yr, nm, lat) in enumerate(((lcea, 1772, 'Ламберт', (-85, 85)), (moll, 1805, 'Мольвейде', (-89, 89)), (gall, 1855, 'Галл', (-85, 85)))):
        x0 = 70 + i * 600; T = world(im, proj, {n: BL for n in AFR}, (x0, 190, x0 + 560, 560), lat=lat)
        lab(d, (x0 + 280, 620), str(yr), 50, OR); lab(d, (x0 + 280, 680), nm, 40, TXT)
    lab(d, (W / 2, 770), 'Три равновеликие проекции: площади на всех честные', 32, SUB)
    S.save('cs_eq_before', im, 'Равновеликие проекции Ламберта, Мольвейде и Галла')
before()
S.cards('cs_seven', 'Ответ картографов', [('7', 'организаций Северной Америки', OR), ('✗', 'против прямоугольных карт мира', RD)])

# 29. Винкель
tissot_map(wt, 'cs_winkel', 'Проекция Винкеля (1921)', 'Понемногу искажает площади, формы и расстояния, но нигде не слишком', 'Карта мира в проекции Винкеля с одинаковыми кругами', lat=(-60, 84))

# 30. Три вопроса — три карты
def three_maps():
    im, d = S.new('Какой вопрос — такая карта', None)
    for i, (proj, who, nm, lat) in enumerate(((merc, 'штурману', 'Меркатор', (-60, 80)), (wt, 'атласу', 'Винкель', (-60, 84)), (merc, 'приложению с дорогами', 'веб-Меркатор', (-85, 85)))):
        x0 = 70 + i * 600
        if i < 2: world(im, proj, HG, (x0, 190, x0 + 560, 560), lat=lat)
        else:
            sub = Image.new('RGB', (W, H), BG); sd = ImageDraw.Draw(sub)
            for x in (x0 + 140, x0 + 420): sd.rectangle((x - 22, 200, x + 22, 560), fill=(70, 74, 84))
            for y in (280, 470): sd.rectangle((x0 + 20, y - 22, x0 + 540, y + 22), fill=(70, 74, 84))
            im.paste(sub.crop((x0, 190, x0 + 560, 570)), (x0, 190))
        lab(d, (x0 + 280, 625), who, fit(d, who, 40, 560), YL); lab(d, (x0 + 280, 685), nm, 38, TXT)
    S.save('cs_three_maps', im, 'Три задачи и три проекции')
three_maps()

# 31. Глобус
def globe():
    im, d = S.new('Глобус: ни площади, ни формы не искажены', None); r = 300; cx, cy = W / 2, 450; l0, p0 = math.radians(-10), math.radians(30)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=SEA)
    def pr(lon, lat):
        l, p = math.radians(lon), math.radians(lat); x = math.cos(p) * math.sin(l - l0); y = math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0)
        c = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        if c < 0: n = math.hypot(x, y) or 1; x, y = x / n, y / n
        return cx + r * x, cy - r * y
    for n, g in FE.items():
        if n == 'Antarctica': continue
        for ring in rings(g): d.polygon([pr(lo, la) for lo, la in ring], fill=HG.get(n, LAND))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(90, 100, 120), width=3)
    lab(d, (cx + r + 40, 300), 'Гренландия', 36, OR, 'lm'); lab(d, (cx + r + 40, 560), 'Африка', 36, BL, 'lm')
    S.save('cs_globe', im, 'Глобус: Гренландия и Африка без искажений')
globe()

# 32. Три вопроса к карте
def qtable():
    im, d = S.new('Три вопроса к любой карте', None)
    rows = ['Что сохраняет?', 'Чем жертвует?', 'Для кого?']; cols = [('Меркатор', OR, ['углы', 'площадями', 'для моряков']), ('Галл — Петерс', BL, ['площади', 'формами', 'сравнить размеры']), ('Винкель', GN, ['понемногу всё', 'понемногу всем', 'для атласа'])]
    x0 = 80; cw = 470; xs = [x0 + 400 + i * cw for i in range(3)]
    for (nm, c, _), x in zip(cols, xs): lab(d, (x + cw / 2 - 20, 190), nm, 42, c)
    for j, r in enumerate(rows):
        y = 300 + j * 140; d.line((x0, y - 70, 1840, y - 70), fill=GR, width=2); lab(d, (x0, y), r, 40, TXT, 'lm')
        for (nm, c, vals), x in zip(cols, xs): lab(d, (x + cw / 2 - 20, y), vals[j], fit(d, vals[j], 38, cw - 40), c if nm == 'Меркатор' else SUB)
    d.rounded_rectangle((xs[0] - 10, 140, xs[0] + cw - 30, 720), 24, outline=OR, width=4)
    S.save('cs_q_table', im, 'Три вопроса к карте: Меркатор, Галл — Петерс, Винкель')
qtable()
cp = f'{S.J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8'))
cr['cs_moon_aus']['author'] = 'собственная графика; изображение Луны: NASA/GSFC (по данным LRO), общественное достояние'
for k in S.new_keys:
    if k != 'cs_moon_aus': cr[k]['author'] = 'собственная графика (границы стран: johan/world.geo.json, открытые данные)'
json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1)
print('ok', len(S.new_keys))
