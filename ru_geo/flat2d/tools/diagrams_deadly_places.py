#!/usr/bin/env python3
"""Собственные схемы для «7 мест, где человек не выживет без защиты» (deadly_places).
Все числа берутся из SCRIPT.md (и RESEARCH.md для уточнений: 8849 м, 10 900 м); оценочные помечены «≈»/«оценка».
Запуск: python3 tools/diagrams_deadly_places.py"""
import sys, json, math
sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools')
from dg import *
from PIL import Image, ImageDraw

S = Slug('deadly_places')
CY = (120, 210, 230); DK = (34, 38, 46); WATER = (30, 70, 120); WATER2 = (18, 40, 80)
LIMIT = 830  # ниже этой линии ничего (субтитры)


def arrow(d, a, b, col=SUB, w=6, head=22):
    d.line((a, b), fill=col, width=w)
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    p1 = (b[0] - head * math.cos(ang - 0.45), b[1] - head * math.sin(ang - 0.45))
    p2 = (b[0] - head * math.cos(ang + 0.45), b[1] - head * math.sin(ang + 0.45))
    d.polygon([b, p1, p2], fill=col)


def box(d, xyxy, col, big=None, small=None, bsz=48, ssz=32, fillc=None, bcol=None, scol=TXT, lines=None):
    x0, y0, x1, y1 = xyxy
    d.rounded_rectangle(xyxy, 26, outline=col, width=5, fill=fillc)
    cx = (x0 + x1) / 2; w = x1 - x0 - 40
    if lines:  # несколько строк, по центру
        n = len(lines); hh = (y1 - y0) / (n + 1)
        for i, (t, sz, c) in enumerate(lines):
            lab(d, (cx, y0 + hh * (i + 1)), t, fit(d, t, sz, w), c)
        return
    if big and small:
        lab(d, (cx, y0 + (y1 - y0) * 0.38), big, fit(d, big, bsz, w), bcol or col)
        lab(d, (cx, y0 + (y1 - y0) * 0.72), small, fit(d, small, ssz, w), scol)
    elif big:
        lab(d, (cx, (y0 + y1) / 2), big, fit(d, big, bsz, w), bcol or col)


def note(d, t, y=785, col=SUB, sz=34):
    lab(d, (W / 2, y), t, fit(d, t, sz, 1760), col)


# ---------------- карты ----------------
GJ = json.load(open('/tmp/world.geo.json'))
FEATS = [(f['properties']['name'], f['geometry']) for f in GJ['features']]


def rings(g):
    return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]


def laea(lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)

    def f(lon, lat):
        l, p = math.radians(lon), math.radians(lat)
        k = 1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        k = math.sqrt(2 / max(k, 1e-6)) * 6371
        return k * math.cos(p) * math.sin(l - l0), k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
    return f


def regional(title, center, km_per_px, hi=(), box_=(60, 140, 1860, 760), note_t=None, sea=(16, 30, 48)):
    """карта региона в равновеликой азимутальной проекции; возвращает (im, d, T(lon,lat)->(x,y))"""
    im, d = S.new(title, None)
    x0, y0, x1, y1 = box_
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    f = laea(*center)
    lay = Image.new('RGB', (W, H), BG); ld = ImageDraw.Draw(lay)
    ld.rectangle(box_, fill=sea)
    for n, g in FEATS:
        for r in rings(g):
            pts = []
            ok = False
            for lo, la in r:
                # отбрасываем точки на обратной стороне
                ang = math.degrees(math.acos(max(-1, min(1, math.sin(math.radians(center[1])) * math.sin(math.radians(la)) + math.cos(math.radians(center[1])) * math.cos(math.radians(la)) * math.cos(math.radians(lo - center[0]))))))
                if ang > 100: continue
                x, y = f(lo, la); pts.append((cx + x / km_per_px, cy - y / km_per_px)); ok = True
            if ok and len(pts) > 2:
                ld.polygon(pts, fill=OR if n in hi else GR, outline=(40, 42, 50))
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rectangle(box_, fill=255)
    im.paste(lay, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.rectangle(box_, outline=(60, 64, 74), width=2)
    if note_t: note(d, note_t)

    def T(lon, lat):
        x, y = f(lon, lat); return cx + x / km_per_px, cy - y / km_per_px
    return im, d, T


def dot(d, p, col=YL, r=14):
    d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=col, outline=BG, width=3)


def tag(d, p, t, col=TXT, sz=34, dx=24, dy=0, anchor='lm'):
    x, y = p[0] + dx, p[1] + dy
    bb = d.textbbox((x, y), t, font=F(sz), anchor=anchor)
    d.rounded_rectangle((bb[0] - 10, bb[1] - 8, bb[2] + 10, bb[3] + 8), 10, fill=(14, 14, 17))
    d.text((x, y), t, font=F(sz), fill=col, anchor=anchor)


# 1. семь мест на карте мира (равнопромежуточная проекция)
def world_map():
    im, d = S.new('Семь мест из этого ролика', None)
    x0, y0, x1, y1 = 110, 140, 1810, 790
    lat_top, lat_bot = 80, -85
    sx = (x1 - x0) / 360; sy = (y1 - y0) / (lat_top - lat_bot)
    P = lambda lo, la: (x0 + (lo + 180) * sx, y0 + (lat_top - la) * sy)
    d.rectangle((x0, y0, x1, y1), fill=(16, 30, 48))
    for n, g in FEATS:
        for r in rings(g):
            pts = [P(lo, max(lat_bot, min(lat_top, la))) for lo, la in r]
            if len(pts) > 2: d.polygon(pts, fill=GR)
    places = [  # (lon, lat, подпись, dx, dy, anchor)
        (86.93, 27.99, '1 Эверест', 26, -30, 'lm'),
        (10.30, 6.44, '2 озеро Ньос', -26, 0, 'rm'),
        (3.0, 56.0, '3 Северное море', -26, -10, 'rm'),
        (142.59, 11.37, '4 Марианская впадина', 0, 50, 'mm'),
        (106.84, -78.46, '5 станция «Восток»', 26, -34, 'lm'),
        (-116.9, 36.4, '6 Долина Смерти', 26, -30, 'lm'),
        (27.42, -26.43, '7 шахта Мпоненг', 26, 10, 'lm'),
    ]
    for lo, la, t, dx, dy, an in places:
        p = P(lo, la); dot(d, p, YL, 15); tag(d, p, t, YL, 32, dx, dy, an)
    S.save('seven_map', im, 'семь мест на карте мира')


# 2. время полезного сознания на высоте
def tuc(key, show_everest):
    title = 'Сколько остаётся на высоте' if show_everest else 'Если воздух уйдёт из кабины'
    im, d = S.new(title, None)
    gx0, gy0, gy1 = 360, 200, 760  # ось высоты 0..12 км
    lab(d, (W / 2, 140), 'сколько времени остаётся, чтобы действовать осмысленно', 34, SUB)
    ky = lambda km: gy1 - (gy1 - gy0) * km / 12
    d.line((gx0, gy0, gx0, gy1), fill=SUB, width=5); d.line((gx0, gy1, 1800, gy1), fill=SUB, width=5)
    for km in range(0, 13, 2):
        d.line((gx0 - 14, ky(km), gx0, ky(km)), fill=SUB, width=4); lab(d, (gx0 - 24, ky(km)), f'{km} км', 30, SUB, 'rm')
    lab(d, (1250, gy1 - 30), 'уровень моря', 30, SUB, 'mm')
    # самолёт: почти 11 км
    y = ky(10.7); d.line((gx0, y, 1340, y), fill=BL, width=4)
    lab(d, (gx0 + 30, y - 36), 'почти 11 км: высота полёта самолёта', 32, BL, 'lm')
    lab(d, (1360, y), '15–30 секунд', 54, BL if show_everest else OR, 'lm')
    if show_everest:
        y2 = ky(8.85)
        d.polygon([(gx0 + 120, gy1), (gx0 + 430, y2), (gx0 + 760, gy1)], fill=(80, 84, 96))
        d.line((gx0 + 430, y2, 1340, y2), fill=OR, width=4)
        lab(d, (gx0 + 470, y2 + 34), 'Эверест: почти 9 км', 32, OR, 'lm')
        lab(d, (1360, y2 - 26), 'от 1 до', 48, OR, 'lm'); lab(d, (1360, y2 + 28), 'нескольких минут', 44, OR, 'lm')
    note(d, 'по авиационным таблицам; значения усреднённые, у каждого человека время своё', 805, SUB, 32)
    S.save(key, im, 'время полезного сознания по высоте')


# 3. у каждого места своя шкала
ROWS = [
    ('Высота', 'секунды и минуты', 'по авиационной таблице', BL),
    ('Газ (Ньос)', '«быстро»', 'секунды не измеряли', CY),
    ('Холодная вода', 'минуты и час', 'ориентир, не гарантия', BL),
    ('Бездна', 'нет данных', 'никто не измерял', GR),
    ('Мороз («Восток»)', 'зависит от ветра', 'точного времени нет', BL),
    ('Жара (Долина Смерти)', 'часы', 'без воды и тени', BL),
    ('Шахта', 'нет данных', 'работают только с охлаждением', GR),
]


def scales(key, hi=None, title='У каждого места своя шкала'):
    im, d = S.new(title, None)
    rows = ROWS if not hi else [(a, b, ('быстрее всех, по описаниям' if a.startswith(hi) else c), e) for a, b, c, e in ROWS]
    y = 175
    lab(d, (130, 140), 'место', 30, SUB, 'lm'); lab(d, (720, 140), 'сколько времени без защиты', 30, SUB, 'lm')
    for i, (pl, sc, nt, col) in enumerate(rows):
        yy = y + i * 86
        c = OR if hi and pl.startswith(hi) else TXT
        cs = OR if hi and pl.startswith(hi) else (SUB if col == GR else TXT)
        d.rounded_rectangle((110, yy, 1810, yy + 72), 14, fill=(40, 34, 22) if hi and pl.startswith(hi) else DK)
        lab(d, (140, yy + 36), pl, 36, c, 'lm')
        lab(d, (720, yy + 36), sc, 38, cs, 'lm')
        lab(d, (1790, yy + 36), nt, 30, OR if hi and pl.startswith(hi) else SUB, 'rm')
    S.save(key, im, 'у каждого места своя шкала')


# 4. защита в каждом месте
PROT = [
    ('Эверест', 'привыкание неделями, кислородные баллоны'),
    ('Ньос', 'трубы для дегазации озера'),
    ('Северное море', 'тёплая одежда и жилет'),
    ('Бездна', 'прочный аппарат: стальная оболочка'),
    ('«Восток»', 'одежда, обогрев, правила выхода'),
    ('Долина Смерти', 'запас воды, тень, прогноз'),
    ('Шахта Мпоненг', 'ледяная каша, холодильные машины, вентиляция'),
]


def protection():
    im, d = S.new('Люди там работают, потому что есть защита', None)
    for i, (pl, pr) in enumerate(PROT):
        yy = 150 + i * 90
        d.rounded_rectangle((110, yy, 1810, yy + 76), 14, fill=DK)
        lab(d, (140, yy + 38), pl, 38, OR, 'lm')
        lab(d, (620, yy + 38), pr, fit(d, pr, 36, 1170), TXT, 'lm')
    S.save('protection', im, 'защита в каждом месте')


# 5. давление на вершине Эвереста ≈ треть
def pressure_third():
    im, d = S.new('Давление воздуха', None)
    base = 740; hmax = 520
    for x, frac, t, col, v in ((620, 1.0, 'уровень моря', BL, '100%'), (1300, 1 / 3, 'вершина Эвереста', OR, '≈ треть')):
        d.rectangle((x - 150, base - hmax * frac, x + 150, base), fill=col)
        lab(d, (x, base - hmax * frac - 44), v, 52, col)
        lab(d, (x, base + 40), t, 38, TXT)
    d.line((300, base, 1620, base), fill=SUB, width=4)
    S.save('pressure_third', im, 'давление на вершине Эвереста')


# 6. коварство гипоксии
def hypoxia_chain():
    im, d = S.new('Чем коварна нехватка кислорода', None)
    steps = [('1', 'кислорода', 'не хватает'), ('2', 'мозг перестаёт', 'трезво оценивать'), ('3', 'человек не замечает,', 'что ему уже плохо')]
    for i, (n, a, b) in enumerate(steps):
        x = 330 + i * 630
        box(d, (x - 260, 190, x + 260, 520), [BL, OR, RD][i], lines=[(n, 70, [BL, OR, RD][i]), (a, 40, TXT), (b, 40, TXT)])
        if i < 2: arrow(d, (x + 275, 355), (x + 350, 355), SUB, 6)
    d.rounded_rectangle((330, 590, 1590, 720), 24, outline=YL, width=5)
    lab(d, (W / 2, 655), 'не доверяй самочувствию: смотри на часы', 44, YL)
    S.save('hypoxia_chain', im, 'гипоксия: мозг страдает первым')


# 7. зона смерти (масштаб по высоте)
def death_zone():
    im, d = S.new('Зона смерти: выше 8 километров', None)
    gx0, gy0, gy1 = 330, 170, 760
    ky = lambda km: gy1 - (gy1 - gy0) * km / 10
    d.rectangle((gx0, ky(10), 1800, ky(8)), fill=(70, 30, 34))
    lab(d, (1780, ky(9.3)), 'зона смерти', 48, RD, 'rm')
    d.line((gx0, gy0, gx0, gy1), fill=SUB, width=5)
    for km in (0, 2, 4, 6, 8):
        d.line((gx0 - 14, ky(km), gx0, ky(km)), fill=SUB, width=4); lab(d, (gx0 - 24, ky(km)), f'{km} км', 30, SUB, 'rm')
    d.polygon([(gx0 + 120, gy1), (gx0 + 520, ky(8.85)), (gx0 + 980, gy1)], fill=(96, 100, 112))
    d.polygon([(gx0 + 452, ky(8)), (gx0 + 520, ky(8.85)), (gx0 + 593, ky(8))], fill=(235, 235, 240))
    d.line((gx0 + 540, ky(8.6), gx0 + 760, ky(7.2)), fill=OR, width=3)
    tag(d, (gx0 + 760, ky(7.2)), 'вершина Эвереста, 8849 м', OR, 36, 10, 0, 'lm')
    lab(d, (gx0 + 1100, gy1 - 30), 'уровень моря', 30, SUB, 'mm')
    d.line((gx0, ky(8), 1800, ky(8)), fill=RD, width=4)
    lab(d, (1780, ky(8) + 34), '8 км', 32, RD, 'rm')
    S.save('death_zone', im, 'зона смерти на Эвересте')


# 8. акклиматизация
def acclim():
    im, d = S.new('Привыкание к высоте занимает недели', None)
    import random
    random.seed(5)
    for i, (cnt, t) in enumerate(((22, 'до подъёма'), (40, 'после недель на высоте'))):
        cx = 600 + i * 720; cy = 420; R = 230
        d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=SUB, width=5, fill=(30, 22, 26))
        pts = []; tries = 0
        while len(pts) < cnt and tries < 200000:
            tries += 1; x, y = random.uniform(-R + 30, R - 30), random.uniform(-R + 30, R - 30)
            if x * x + y * y < (R - 30) ** 2 and all((x - a) ** 2 + (y - b) ** 2 > 40 ** 2 for a, b in pts): pts.append((x, y))
        assert len(pts) == cnt
        for x, y in pts: d.ellipse((cx + x - 17, cy + y - 17, cx + x + 17, cy + y + 17), fill=RD)
        lab(d, (cx, cy + R + 50), t, 40, TXT)
    arrow(d, (870, 420), (1050, 420), SUB, 8, 30)
    note(d, 'организм вырабатывает больше красных кровяных клеток (схематично, без масштаба)', 790, SUB, 32)
    S.save('acclim', im, 'акклиматизация: больше красных клеток крови')


# 9. 1953 год
def first_ascent():
    im, d = S.new('Первое восхождение на Эверест', None)
    box(d, (160, 200, 860, 640), OR, lines=[('1953', 110, OR), ('Эдмунд Хиллари', 44, TXT), ('и Тенцинг Норгей', 44, TXT)])
    box(d, (1060, 200, 1760, 640), BL, lines=[('шли', 44, TXT), ('с кислородными', 50, BL), ('приборами', 50, BL)])
    note(d, 'организм привыкает к высоте, но не безгранично', 740, SUB, 38)
    S.save('first_ascent', im, 'первое восхождение, 1953')


# 10. Ньос: газ в глубине как в закрытой бутылке
def co2_bottle():
    im, d = S.new('Озеро Ньос: газ на дне, как в закрытой бутылке', None)
    # чаша кратера
    d.polygon([(220, 260), (1500, 260), (1360, 740), (360, 740)], fill=(60, 56, 50))
    d.polygon([(260, 300), (1460, 300), (1330, 710), (390, 710)], fill=WATER)
    d.polygon([(330, 500), (1400, 500), (1330, 710), (390, 710)], fill=WATER2)
    import random
    random.seed(2)
    for _ in range(70):
        x = random.uniform(440, 1280); y = random.uniform(530, 690); r = random.uniform(5, 10)
        if abs(y - 610) < 34 or abs(x - 860) < 30: continue
        d.ellipse((x - r, y - r, x + r, y + r), outline=(190, 220, 240), width=2)
    lab(d, (860, 400), 'верхняя вода', 40, TXT)
    tag(d, (860, 610), 'на глубине растворён углекислый газ', CY, 36, 0, 0, 'mm')
    lab(d, (1540, 560), 'давление', 36, SUB, 'lm'); lab(d, (1540, 606), 'держит газ', 36, SUB, 'lm'); lab(d, (1540, 652), 'в воде', 36, SUB, 'lm')
    lab(d, (860, 195), '21 августа 1986: газ вырвался наверх', 40, OR)
    arrow(d, (860, 570), (860, 240), OR, 8, 30)
    S.save('co2_bottle', im, 'схема: углекислый газ растворён в глубине озера')


# 11. облако CO2 стекает по долине
def co2_valley():
    im, d = S.new('Газ тяжелее воздуха: он стёк по долинам', None)
    ground = [(100, 360), (380, 330), (600, 470), (900, 690), (1250, 720), (1550, 640), (1820, 520), (1820, 780), (100, 780)]
    # облако
    gas = [(380, 330), (600, 470), (900, 690), (1250, 720), (1550, 640), (1560, 560), (1200, 560), (900, 520), (600, 360), (400, 300)]
    d.polygon(gas, fill=(70, 120, 110))
    d.polygon(ground, fill=(72, 66, 56))
    d.polygon([(110, 360), (370, 332), (370, 300), (110, 320)], fill=WATER)
    lab(d, (240, 270), 'озеро', 36, BL)
    for x in (1000, 1080, 1160):
        d.rectangle((x - 22, 668, x + 22, 712), fill=(150, 140, 120)); d.polygon([(x - 30, 670), (x, 640), (x + 30, 670)], fill=(150, 140, 120))
    lab(d, (1110, 760), 'деревня в низине', 32, TXT)
    arrow(d, (520, 330), (840, 560), CY, 7, 28)
    lab(d, (1250, 470), 'облако углекислого газа', 38, CY)
    lab(d, (1250, 520), 'вытеснило кислород', 38, CY)
    lab(d, (W / 2, 180), 'воздух', 40, SUB)
    S.save('co2_valley', im, 'схема: облако газа стекает в низину')


# 12. что рассказывали выжившие
def symptoms():
    im, d = S.new('Что рассказывали выжившие', None)
    steps = [('тёплое', 'ощущение', OR), ('запах тухлых', 'яиц или пороха', YL), ('потеря', 'сознания', RD), ('очнулись через', 'много часов', BL)]
    for i, (a, b, c) in enumerate(steps):
        x = 270 + i * 460
        box(d, (x - 200, 230, x + 200, 520), c, lines=[(a, 40, TXT), (b, 40, TXT)])
        if i < 3: arrow(d, (x + 210, 375), (x + 255, 375), SUB, 6, 18)
    lab(d, (1650, 575), 'слабые и спутанные', 32, SUB)
    note(d, 'многие в облаке уже не очнулись · по рассказам и осмотрам врачей', 700, SUB, 36)
    S.save('nyos_symptoms', im, 'Ньос: рассказы выживших')


# 13. карта: Камерун и озеро Ньос
NYOS = (10.30, 6.44); MONOUN = (10.59, 5.58)


def cameroon_locator():
    im, d, T = regional('Озеро Ньос, Камерун', (14, 3), 5.2, hi=('Cameroon',))
    p = T(*NYOS); dot(d, p, YL, 15); tag(d, p, 'озеро Ньос', YL, 38, 28, -6)
    lab(d, (T(5, 12)[0], T(5, 12)[1]), 'Африка', 40, SUB)
    S.save('nyos_map', im, 'карта: озеро Ньос в Камеруне')


def nyos_radius():
    im, d, T = regional('Погибшие: в радиусе до 25 км от озера', NYOS, 0.4, hi=('Cameroon',))
    p = T(*NYOS); r = 25 / 0.4
    d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), outline=RD, width=6)
    dot(d, p, YL, 14); tag(d, p, 'озеро Ньос', YL, 34, 24, -30)
    d.line((p[0], p[1], p[0], p[1] + r), fill=RD, width=4); tag(d, (p[0], p[1] + r + 30), 'радиус 25 км', RD, 34, 0, 0, 'mm')
    tag(d, T(11.0, 5.9), 'Камерун', TXT, 34, 0, 0, 'mm')
    tag(d, T(9.75, 6.75), 'Нигерия', TXT, 34, 0, 0, 'mm')
    tag(d, (1840, 725), 'границы упрощены', SUB, 30, 0, 0, 'rm')
    note(d, 'по оценкам исследователей: 1746 человек и около 3500 голов скота', 800, TXT, 36)
    S.save('nyos_radius', im, 'карта: радиус до 25 км вокруг Ньоса')


def nyos_monoun():
    im, d, T = regional('Два озера, два выброса', (10.8, 6.0), 1.1, hi=('Cameroon',))
    for (lo, la), t1, t2, dy in ((NYOS, 'Ньос, 1986', '1746 погибших (оценка)', -40), (MONOUN, 'Моной, 1984', '37 погибших', 30)):
        p = T(lo, la); dot(d, p, YL, 15); tag(d, p, t1, YL, 38, 28, dy - 22); tag(d, p, t2, TXT, 32, 28, dy + 26)
    tag(d, T(8.6, 6.8), 'Нигерия', SUB, 34, 0, 0, 'mm')
    tag(d, T(13.0, 3.8), 'Камерун', TXT, 34, 0, 0, 'mm')
    note(d, 'причина выброса в Ньосе до конца не известна: подозревают оползень', 800, SUB, 34)
    S.save('nyos_monoun', im, 'карта: озёра Ньос и Моной')


# 14. холодовой шок
def cold_shock():
    im, d = S.new('Холодовой шок', None)
    # термометр
    tx = 300
    d.rounded_rectangle((tx - 30, 170, tx + 30, 640), 30, outline=SUB, width=5)
    d.ellipse((tx - 60, 600, tx + 60, 720), outline=SUB, width=5, fill=BL)
    d.rectangle((tx - 16, 470, tx + 16, 640), fill=BL)
    d.line((tx + 40, 470, tx + 90, 470), fill=OR, width=5); lab(d, (tx + 100, 470), '15 °C', 44, OR, 'lm')
    lab(d, (tx + 100, 530), 'если вода', 32, SUB, 'lm'); lab(d, (tx + 100, 570), 'холоднее →', 32, SUB, 'lm')
    box(d, (720, 170, 1800, 330), BL, '2–3 минуты', 'первые: непроизвольные вдохи, их не удержать', 64, 34)
    box(d, (720, 370, 1800, 530), BL, 'секунды', 'столько удаётся задерживать дыхание', 64, 34)
    box(d, (720, 570, 1800, 730), RD, 'риск', 'глотнуть воды и утонуть, даже хорошему пловцу', 64, 34)
    S.save('cold_shock', im, 'холодовой шок в воде холоднее 15 °C')


# 15. правило 1-10-1
def rule1101(key, hi):
    im, d = S.new('Правило Гисбрехта «1 — 10 — 1»', None)
    items = [('1 минута', 'взять дыхание', 'под контроль'), ('≈ 10 минут', 'пока руки', 'слушаются'), ('≈ 1 час', 'до потери сознания', 'от переохлаждения')]
    for i, (a, b, c) in enumerate(items):
        x = 360 + i * 600; col = OR if i == hi else (BL if hi is None else GR)
        box(d, (x - 270, 190, x + 270, 590), col, lines=[(a, 72, col if col != GR else SUB), (b, 38, TXT if col != GR else SUB), (c, 38, TXT if col != GR else SUB)])
    if hi == 2:
        note(d, 'ориентир: зависит от температуры воды, одежды и самого человека', 700, TXT, 38)
    else:
        note(d, 'это ориентир, гарантий он не даёт', 700, TXT, 40)
    S.save(key, im, 'правило 1-10-1')


# 16. как убивает холод
def hypothermia():
    im, d = S.new('Холод убивает не мгновенно', None)
    steps = [(('тело теряет тепло', 'быстрее, чем', 'вырабатывает'), BL), (('слабеют', 'мышцы'), OR), (('путается', 'мысль'), RD)]
    for i, (ls, c) in enumerate(steps):
        x = 340 + i * 620
        box(d, (x - 270, 200, x + 270, 470), c, lines=[(t, 40, TXT) for t in ls])
        if i < 2: arrow(d, (x + 280, 335), (x + 340, 335), SUB, 6, 20)
    d.rounded_rectangle((330, 560, 1590, 700), 24, outline=GN, width=5)
    lab(d, (W / 2, 630), 'тёплая одежда и жилет замедляют отсчёт', 44, GN)
    S.save('hypothermia', im, 'как холод отнимает время')


# 17. Марианская впадина на карте
CHALL = (142.59, 11.37)


def mariana_map():
    im, d, T = regional('Бездна Челленджера, Марианская впадина', (135, 21), 8.0)
    p = T(*CHALL); dot(d, p, YL, 15); tag(d, p, 'Бездна Челленджера', YL, 38, 28, 0)
    tag(d, T(138.5, 36.5), 'Япония', SUB, 32, 0, 0, 'mm')
    tag(d, T(119.5, 12.5), 'Филиппины', SUB, 32, 0, 0, 'mm')
    tag(d, T(155, 22), 'Тихий океан', BL, 36, 0, 0, 'mm')
    S.save('mariana_map', im, 'карта: Марианская впадина')


# 18. давление: 1 кг против больше тонны на см²
def pressure_blocks():
    im, d = S.new('Сила давления на каждый квадратный сантиметр', None)
    s = 13; gap = 3; cols = 40; rows = 25  # 1000 квадратиков
    gx = 820; gy = 160
    for i in range(1000):
        x = gx + (i % cols) * (s + gap); y = gy + (i // cols) * (s + gap)
        d.rectangle((x, y, x + s, y + s), fill=RD)
    lab(d, (gx + cols * (s + gap) / 2, gy + rows * (s + gap) + 40), 'на дне: больше 1000 кг', 44, RD)
    d.rectangle((380 - s / 2, 400 - s / 2, 380 + s / 2, 400 + s / 2), fill=BL)
    lab(d, (380, 470), 'уровень моря:', 40, BL); lab(d, (380, 520), '≈ 1 кг', 52, BL)
    note(d, '1 квадратик = 1 килограмм на квадратный сантиметр · давление на дне больше 1000 атмосфер', 790, SUB, 30)
    S.save('pressure_blocks', im, 'давление: уровень моря и дно впадины')


# 19. Эверест во впадине (в масштабе)
def everest_in_trench():
    im, d = S.new('Эверест поместился бы во впадину', None)
    top, bot = 160, 760; depth = 10.9
    ky = lambda km: top + (bot - top) * km / depth  # km вниз от поверхности
    d.rectangle((400, top, 1800, bot), fill=WATER2)
    d.line((400, top, 1800, top), fill=BL, width=5); lab(d, (390, top), 'поверхность океана', 30, BL, 'rm')
    d.line((400, bot, 1800, bot), fill=SUB, width=5); lab(d, (390, bot), '≈ 10,9 км', 34, TXT, 'rm')
    ev = 8.849; peak = ky(depth - ev)
    d.polygon([(700, bot), (1100, peak), (1500, bot)], fill=(110, 112, 124))
    d.polygon([(1045, peak + 60), (1100, peak), (1155, peak + 60)], fill=(235, 235, 240))
    lab(d, (1100, bot - 120), 'Эверест 8849 м', 44, TXT)
    d.line((1300, top + 6, 1300, peak), fill=OR, width=5)
    d.line((1270, top + 6, 1330, top + 6), fill=OR, width=5); d.line((1270, peak, 1330, peak), fill=OR, width=5)
    lab(d, (1350, (top + peak) / 2), 'больше 2 км воды', 40, OR, 'lm')
    lab(d, (390, (top + bot) / 2), 'в масштабе', 30, SUB, 'rm')
    S.save('everest_trench', im, 'Эверест и глубина впадины в масштабе')


# 20. кто спускался на дно
def dives():
    im, d = S.new('Кто спускался на дно Бездны Челленджера', None)
    box(d, (160, 200, 900, 620), OR, lines=[('1960', 100, OR), ('Жак Пикар и Дон Уолш', 38, TXT), ('батискаф «Триест»', 38, SUB)])
    box(d, (1020, 200, 1760, 620), BL, lines=[('2012', 100, BL), ('Джеймс Кэмерон', 38, TXT), ('одиночный спуск', 38, SUB)])
    note(d, 'оба раза людей берегла стальная оболочка, которая держит давление', 720, TXT, 38)
    S.save('dives', im, 'спуски на дно впадины')


# 21. карта Антарктиды и станция «Восток»
def antarctica_map():
    im, d, T = regional('Станция «Восток», Антарктида', (0, -90), 8.5, box_=(60, 140, 1860, 790))
    p = T(106.84, -78.46); dot(d, p, YL, 15); tag(d, p, 'станция «Восток»', YL, 38, 28, 0)
    q = T(0, -90); dot(d, q, TXT, 10); tag(d, q, 'Южный полюс', TXT, 32, -24, 0, 'rm')
    S.save('vostok_map', im, 'карта: станция «Восток» в Антарктиде')


# 22. температуры «Востока»
def vostok_temps():
    im, d = S.new('Мороз на станции «Восток»', None)
    x = 700; top, bot = 170, 740
    ky = lambda t: top + (bot - top) * (0 - t) / 100  # 0 .. −100
    d.rounded_rectangle((x - 34, top - 20, x + 34, bot + 20), 34, outline=SUB, width=5)
    d.rectangle((x - 18, ky(-89.2), x + 18, bot + 10), fill=BL)
    for t in (0, -20, -40, -60, -80, -100):
        d.line((x - 60, ky(t), x - 40, ky(t)), fill=SUB, width=3); lab(d, (x - 70, ky(t)), f'−{-t}°' if t else '0°', 30, SUB, 'rm')
    for t, a, b, col in ((-65, '≈ −65°', 'зимой в среднем', BL), (-89.2, '−89,2°', 'рекорд станции, 21.07.1983', OR)):
        d.line((x + 40, ky(t), x + 130, ky(t)), fill=col, width=5); lab(d, (x + 145, ky(t) - 24), a, 48, col, 'lm'); lab(d, (x + 145, ky(t) + 26), b, 32, TXT, 'lm')
    lab(d, (x + 145, ky(-20)), 'спутники показывали и ниже,', 32, SUB, 'lm')
    lab(d, (x + 145, ky(-20) + 44), 'но это не измерение на земле', 32, SUB, 'lm')
    S.save('vostok_temps', im, 'температуры станции «Восток»')


# 23. высота станции «Восток»
def vostok_alt():
    im, d = S.new('Станция стоит высоко: воздух разрежён', None)
    base = 720; k = 520 / 8.849
    for x, h, t, v, col in ((560, 3.5, 'станция «Восток»', '≈ 3,5 км', BL), (1360, 8.849, 'Эверест', '8,85 км', GR)):
        d.rectangle((x - 130, base - h * k, x + 130, base), fill=col)
        lab(d, (x, base - h * k - 40), v, 48, col if col != GR else SUB); lab(d, (x, base + 40), t, 38, TXT)
    d.line((300, base, 1620, base), fill=SUB, width=4); lab(d, (1630, base), 'уровень моря', 30, SUB, 'lm')
    S.save('vostok_alt', im, 'высота станции «Восток»')


# 24. карта: Долина Смерти
def dv_map():
    im, d, T = regional('Долина Смерти, Калифорния (США)', (-105, 38), 3.4, hi=('United States of America',))
    p = T(-116.87, 36.46); dot(d, p, YL, 15); tag(d, p, 'Долина Смерти', YL, 38, 26, -30)
    lab(d, T(-98, 39), 'США', 44, BG)
    S.save('dv_map', im, 'карта: Долина Смерти')


# 25. рекорды Долины Смерти (0..100 °C, линейно)
def dv_temps():
    im, d = S.new('Жара в Долине Смерти', None)
    x0, x1, y = 160, 1620, 470
    kx = lambda t: x0 + (x1 - x0) * t / 100
    d.line((x0, y, x1, y), fill=SUB, width=5)
    for t in range(0, 101, 20):
        d.line((kx(t), y - 12, kx(t), y + 12), fill=SUB, width=4); lab(d, (kx(t), y + 40), f'{t} °C', 30, SUB)
    marks = [(54.4, '54,4°', 'воздух, 2020 и 2021', 'надёжно измерено', GN, -1), (56.7, '56,7°', 'воздух, 1913', 'многие оспаривают', RD, 1), (93.9, 'почти 94°', 'земля, Фернис-Крик', '1972', OR, -1)]
    for t, a, b, c, col, side in marks:
        X = kx(t)
        if side < 0:
            d.line((X, y, X, 330), fill=col, width=5); lab(d, (X, 250), a, 56, col); lab(d, (X, 190), b, 34, TXT); lab(d, (X, 305), c, 30, SUB)
        else:
            d.line((X, y, X, 590), fill=col, width=5); lab(d, (X, 640), a, 56, col); lab(d, (X, 700), b, 34, TXT); lab(d, (X, 745), c, 30, SUB)
        d.ellipse((X - 12, y - 12, X + 12, y + 12), fill=col)
    S.save('dv_temps', im, 'рекорды жары Долины Смерти')


# 26. почему жарко: котловина ниже уровня моря
def dv_basin():
    im, d = S.new('Котловина ниже уровня моря', None)
    d.polygon([(100, 250), (420, 280), (700, 640), (1220, 640), (1500, 280), (1820, 250), (1820, 780), (100, 780)], fill=(110, 86, 60))
    d.line((100, 560, 1820, 560), fill=BL, width=4); lab(d, (110, 530), 'уровень моря', 32, BL, 'lm')
    lab(d, (960, 700), 'дно долины ниже уровня моря', 34, TXT)
    for x in (620, 960, 1300):
        arrow(d, (x, 230), (x if x == 960 else (x + 60 if x < 960 else x - 60), 520), OR, 7, 26)
    lab(d, (960, 180), 'воздух опускается, сжимается и нагревается', 40, OR)
    lab(d, (1800, 740), 'схема, не в масштабе', 30, (230, 220, 200), 'rm')
    S.save('dv_basin', im, 'схема: почему котловина нагревается')


def july2024():
    im, d = S.new('Долина Смерти', None)
    box(d, (360, 220, 1560, 640), OR, lines=[('июль 2024', 96, OR), ('самый жаркий месяц', 48, TXT), ('за всю историю наблюдений', 44, SUB)])
    S.save('dv_july2024', im, 'июль 2024 в Долине Смерти')


# 27. карта: шахта Мпоненг
def sa_map():
    im, d, T = regional('Шахта Мпоненг, Южная Африка', (25, -27), 2.6, hi=('South Africa',))
    p = T(27.42, -26.43); dot(d, p, YL, 15); tag(d, p, 'шахта Мпоненг', YL, 38, 28, -20)
    lab(d, T(22.5, -30.5), 'ЮАР', 44, BG)
    S.save('mponeng_map', im, 'карта: шахта Мпоненг')


# 28. глубина шахты и температура породы
def mine_depth():
    im, d = S.new('Шахта Мпоненг: почти 4 км вглубь', None)
    top, bot = 200, 760; ky = lambda km: top + (bot - top) * km / 4
    d.rectangle((400, top, 1800, bot), fill=(92, 74, 60))
    d.rectangle((400, bot - 60, 1800, bot), fill=(170, 70, 40))
    d.line((400, top, 1800, top), fill=GN, width=5); lab(d, (390, top), 'поверхность', 30, GN, 'rm')
    for km in (1, 2, 3, 4):
        lab(d, (390, ky(km) if km < 4 else bot - 10), f'{km} км', 30, SUB, 'rm')
    d.rectangle((760, top, 800, ky(3.9)), fill=(20, 20, 24))
    lab(d, (1300, bot - 30), 'порода внизу: 60 °C и выше', 44, YL)
    lab(d, (830, top + 60), 'ствол шахты', 34, TXT, 'lm')
    S.save('mine_depth', im, 'глубина шахты и жар породы')


# 29. как охлаждают шахту
def mine_cooling():
    im, d = S.new('Как охлаждают шахту', None)
    for i, (a, b) in enumerate((('ледяная каша', 'закачивают вниз'), ('трубы и', 'холодильные машины'), ('вентиляция', 'гонит воздух'))):
        y = 170 + i * 200
        box(d, (120, y, 760, y + 160), CY if i == 0 else BL, a, b, 46, 34)
        arrow(d, (770, y + 80), (1010, 450), SUB, 6, 22)
    d.rounded_rectangle((1020, 300, 1800, 600), 26, outline=GN, width=5)
    lab(d, (1410, 365), 'воздух в выработках', 38, TXT)
    lab(d, (1410, 445), 'ниже 30 °C', 70, GN)
    lab(d, (1410, 535), 'а порода: 60 °C и выше', 36, YL)
    S.save('mine_cooling', im, 'схема охлаждения шахты')


# 30. принцип: кусочек подходящей среды
def bubble():
    im, d = S.new('Человек приносит с собой кусочек своей среды', None)
    cx, cy = 960, 450
    d.ellipse((cx - 170, cy - 170, cx + 170, cy + 170), outline=GN, width=6, fill=(22, 36, 28))
    lab(d, (cx, cy - 20), 'человек', 44, TXT); lab(d, (cx, cy + 34), 'и его защита', 32, GN)
    items = [('кислородный баллон', 'высота', -1, -1), ('тёплая одежда', 'мороз, холодная вода', 1, -1), ('вода и тень', 'жара', -1, 1), ('система охлаждения', 'шахта', 1, 1)]
    for t, s, sx, sy in items:
        x = cx + sx * 560; y = cy + sy * 190
        box(d, (x - 330, y - 80, x + 330, y + 80), OR, t, s, 40, 30)
        arrow(d, (x - sx * 335, y), (cx + sx * 180, cy + sy * 70), SUB, 5, 18)
    S.save('bubble', im, 'общий принцип защиты')


# 31. четыре способа убить
def four_ways():
    im, d = S.new('Убивают по-разному', None)
    cols = [('не хватает', 'кислорода', 'высота,', 'газ', BL), ('давит', 'вода', 'бездна', '', CY), ('тело теряет', 'тепло', 'Антарктида,', 'северное море', BL), ('тело', 'перегревается', 'долина,', 'шахта', OR)]
    for i, (a, b, c, c2, col) in enumerate(cols):
        x = 260 + i * 467
        box(d, (x - 215, 200, x + 215, 600), col, lines=[(a, 38, TXT), (b, 46, col), (c, 34, SUB), (c2, 34, SUB)])
    note(d, 'одной линейки для этого нет', 700, TXT, 42)
    S.save('four_ways', im, 'четыре способа, которыми убивает среда')


# 32. коварство воды
def insidious():
    im, d = S.new('Почему коварнее всех вода', None)
    box(d, (160, 200, 900, 560), GR, lines=[('озеро Ньос', 50, SUB), ('туда не приходят', 38, TXT), ('в плавках', 38, TXT)])
    box(d, (1020, 200, 1760, 560), OR, lines=[('холодное море', 50, OR), ('к нему приходят налегке,', 36, TXT), ('а холод опасен с первых минут', 34, TXT)])
    note(d, 'это наше наблюдение, а не рейтинг', 680, SUB, 40)
    S.save('insidious', im, 'почему холодная вода коварна')


# 33. разрыв между местом и телом
def gap():
    im, d = S.new('Опасен разрыв между местом и телом', None)
    box(d, (120, 250, 600, 560), RD, lines=[('место', 64, RD), ('какое оно', 34, TXT), ('на самом деле', 34, TXT)])
    box(d, (1320, 250, 1800, 560), GN, lines=[('тело', 64, GN), ('что ему нужно,', 34, TXT), ('чтобы жить', 34, TXT)])
    for i, t in enumerate(('привыкание', 'одежда', 'трубы', 'ледяная каша')):
        y = 230 + i * 92
        d.rounded_rectangle((680, y, 1240, y + 74), 16, fill=DK, outline=OR, width=3); lab(d, (960, y + 37), t, 38, OR)
    note(d, 'защита закрывает разрыв, если знаешь, куда идёшь', 700, TXT, 40)
    S.save('gap', im, 'разрыв между местом и телом')


if __name__ == '__main__':
    world_map(); tuc('tuc_plane', False); tuc('tuc_everest', True)
    scales('scales'); scales('scales_gas', 'Газ', 'Подведём счёт'); protection()
    pressure_third(); hypoxia_chain(); death_zone(); acclim(); first_ascent()
    co2_bottle(); co2_valley(); symptoms(); cameroon_locator(); nyos_radius(); nyos_monoun()
    cold_shock(); rule1101('rule_1101', None); rule1101('rule_1101_hour', 2); hypothermia()
    mariana_map(); pressure_blocks(); everest_in_trench(); dives()
    antarctica_map(); vostok_temps(); vostok_alt()
    dv_map(); dv_temps(); dv_basin(); july2024()
    sa_map(); mine_depth(); mine_cooling(); bubble(); four_ways(); insidious(); gap()
    print('ok', len(S.new_keys))
