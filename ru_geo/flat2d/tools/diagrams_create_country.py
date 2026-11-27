#!/usr/bin/env python3
"""Собственные схемы для ролика «Как создать свою страну?» (ru_geo/create_country).
Числа и факты только из SCRIPT.md / RESEARCH.md (Википедия), карты: границы стран johan/world.geo.json (открытые данные).
Запуск: python3 tools/diagrams_create_country.py  -> archive/img/<ключ>.jpg + записи в archive/credits.json"""
import sys, json, math, os
sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools')
from dg import *
from PIL import Image, ImageDraw

S = Slug('create_country')
BOT = 820  # ниже этой линии ничего (субтитры)
DIM = (95, 98, 108)


def wrap(d, t, sz, maxw):
    out, cur = [], ''
    for w in t.split():
        nx = (cur + ' ' + w).strip()
        if d.textlength(nx, font=F(sz)) <= maxw: cur = nx
        else:
            if cur: out.append(cur)
            cur = w
    if cur: out.append(cur)
    return out


def para(d, xy, t, sz, col, maxw, lh=1.22, anchor='mm'):
    """многострочный текст по центру точки xy"""
    ls = wrap(d, t, sz, maxw); x, y = xy; y0 = y - (len(ls) - 1) * sz * lh / 2
    for i, l in enumerate(ls): d.text((x, y0 + i * sz * lh), l, font=F(sz), fill=col, anchor=anchor)
    return len(ls)


def arrow(d, a, b, col=SUB, w=6, head=22):
    d.line((a, b), fill=col, width=w); ang = math.atan2(b[1] - a[1], b[0] - a[0])
    p1 = (b[0] - head * math.cos(ang - 0.45), b[1] - head * math.sin(ang - 0.45)); p2 = (b[0] - head * math.cos(ang + 0.45), b[1] - head * math.sin(ang + 0.45))
    d.polygon([b, p1, p2], fill=col)


def box(d, x, y, st, s=74):
    """чекбокс: yes / no / q / paper / off / hi"""
    col = {'yes': GN, 'no': RD, 'q': YL, 'paper': OR, 'off': DIM, 'hi': YL}[st]
    d.rounded_rectangle((x, y - s / 2, x + s, y + s / 2), 12, outline=col, width=6)
    cx, cy = x + s / 2, y
    if st == 'yes': d.line([(cx - 22, cy + 2), (cx - 6, cy + 18), (cx + 24, cy - 20)], fill=GN, width=10, joint='curve')
    elif st == 'no': d.line((cx - 18, cy - 18, cx + 18, cy + 18), fill=RD, width=9); d.line((cx - 18, cy + 18, cx + 18, cy - 18), fill=RD, width=9)
    elif st == 'q': lab(d, (cx, cy + 2), '?', 54, YL)
    elif st == 'paper': lab(d, (cx, cy + 2), '~', 60, OR)


COND = ['Постоянное население', 'Определённая территория', 'Правительство', 'Отношения с другими странами']


def checklist(key, title, rows, note=None, cap=''):
    """rows=[(название, пояснение, состояние)]"""
    im, d = S.new(title, note); n = len(rows); step = 150 if n <= 4 else 120; y0 = 230 if n == 4 else 260
    for i, (nm, val, st) in enumerate(rows):
        y = y0 + i * step; box(d, 300, y, st)
        tc = DIM if st == 'off' else (YL if st == 'hi' else TXT)
        vc = {'yes': GN, 'no': RD, 'q': YL, 'paper': OR, 'off': DIM, 'hi': SUB}[st]
        if val:
            lab(d, (420, y - 24), nm, fit(d, nm, 46, 1350), tc, 'lm'); lab(d, (420, y + 30), val, fit(d, val, 34, 1350), vc, 'lm')
        else:
            lab(d, (420, y), nm, fit(d, nm, 46, 1350), tc, 'lm')
    S.save(key, im, cap); return im


def flow(key, title, steps, note=None, cap='', last_hi=False):
    """steps=[(текст, цвет)] прямоугольники слева направо со стрелками"""
    im, d = S.new(title, note); n = len(steps); gap = 90; bw = (1760 - gap * (n - 1)) / n; x = 80
    for i, (t, col) in enumerate(steps):
        d.rounded_rectangle((x, 300, x + bw, 620), 28, outline=col, width=6)
        para(d, (x + bw / 2, 460), t, 40 if n <= 3 else 36, col, bw - 50)
        if i < n - 1: arrow(d, (x + bw + 12, 460), (x + bw + gap - 12, 460), SUB)
        x += bw + gap
    S.save(key, im, cap); return im


def cardgrid(key, title, items, note=None, cap='', top=250, h=420):
    """items=[(крупно, текст, цвет)] до 4 карточек"""
    im, d = S.new(title, note); n = len(items); gap = 40; cw = (1760 - gap * (n - 1)) / n; x = 80
    for big, t, col in items:
        d.rounded_rectangle((x, top, x + cw, top + h), 28, outline=col, width=5)
        lab(d, (x + cw / 2, top + 95), big, fit(d, big, 76, cw - 50), col)
        para(d, (x + cw / 2, top + 265), t, 36, TXT, cw - 50)
        x += cw + gap
    S.save(key, im, cap); return im


# ---------- карты ----------
GJ = '/tmp/world.geo.json'
if not os.path.exists(GJ):
    import urllib.request
    open(GJ, 'wb').write(urllib.request.urlopen('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json', timeout=60).read())
FEATS = [(f['properties']['name'], f['geometry']) for f in json.load(open(GJ))['features']]


def rings(g): return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]


def mapframe(title, bbox, hi, note=None, box_xy=(80, 150, 1840, BOT - 60), robin=False):
    """bbox=(lon0,lat0,lon1,lat1); hi={страна: цвет}; возвращает im,d,T(lon,lat)->px"""
    im, d = S.new(title, note); lo0, la0, lo1, la1 = bbox; k = math.cos(math.radians((la0 + la1) / 2))
    X0, Y0, X1, Y1 = box_xy; sc = min((X1 - X0) / ((lo1 - lo0) * k), (Y1 - Y0) / (la1 - la0))
    cx, cy = (X0 + X1) / 2, (Y0 + Y1) / 2; mlo, mla = (lo0 + lo1) / 2, (la0 + la1) / 2
    T = lambda lo, la: (cx + (lo - mlo) * k * sc, cy - (la - mla) * sc)
    sea = Image.new('RGB', (W, H), BG); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle(box_xy, fill=255)
    ImageDraw.Draw(sea).rectangle(box_xy, fill=(20, 30, 46)); im.paste(sea, (0, 0), m)
    lay = Image.new('RGB', (W, H), (20, 30, 46)); ld = ImageDraw.Draw(lay)
    for nm, g in FEATS:
        for r in rings(g):
            ld.polygon([T(lo, la) for lo, la in r], fill=hi.get(nm, GR), outline=(30, 34, 40))
    im.paste(lay, (0, 0), m); d = ImageDraw.Draw(im)
    lab(d, (W / 2, 80), title, fit(d, title, 60, 1700), TXT)  # заголовок поверх, если карта залезла
    return im, d, T


def marker(d, p, text, off, col=YL, sz=38, r=13):
    x, y = p; tx, ty = x + off[0], y + off[1]
    if off != (0, 0): d.line((x, y, tx, ty), fill=col, width=4)
    d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=BG, width=3)
    anc = 'lm' if off[0] > 0 else ('rm' if off[0] < 0 else 'mm')
    bb = d.textbbox((tx + (10 if off[0] > 0 else -10 if off[0] < 0 else 0), ty), text, font=F(sz), anchor=anc)
    d.rounded_rectangle((bb[0] - 12, bb[1] - 8, bb[2] + 12, bb[3] + 8), 10, fill=(14, 14, 17))
    d.text((tx + (10 if off[0] > 0 else -10 if off[0] < 0 else 0), ty), text, font=F(sz), fill=col, anchor=anc)


# 1. четыре пустые галочки (холодный старт)
im, d = S.new('Четыре галочки', 'одна из них тебе не подвластна')
for i in range(4):
    x = 480 + i * 320; d.rounded_rectangle((x - 90, 330, x + 90, 510), 22, outline=TXT, width=8); lab(d, (x, 600), f'{i + 1}', 56, SUB)
S.save('cc_boxes4', im, 'четыре пустые галочки')

# 2. карта четырёх примеров
im, d, T = mapframe('Четыре живых примера', (-170, -48, 180, 72), {'United Kingdom': BL, 'Croatia': BL, 'Republic of Serbia': BL, 'Australia': BL, 'United States of America': BL})
marker(d, T(-119.6, 39.24), 'Молоссия: огород в пустыне', (60, 150))
marker(d, T(1.48, 51.89), 'Силенд: платформа в море', (-60, -95))
marker(d, T(18.87, 45.77), 'Либерленд: спорный берег', (60, 150))
marker(d, T(114.45, -28.07), 'Хатт-Ривер: ферма с принцем', (-60, -150))
S.save('cc_cases_map', im, 'карта: где были четыре примера')

# 3. Монтевидео 1933
im, d, T = mapframe('Монтевидео, 1933', (-128, -56, -28, 34), {'Uruguay': OR}, box_xy=(560, 140, 1360, BOT - 40))
marker(d, T(-56.16, -34.9), 'Монтевидео (Уругвай)', (-110, 60), YL, 36)
para(d, (285, 420), 'Конвенция о правах и обязанностях государств', 40, TXT, 430)
para(d, (285, 600), 'подписали страны Америки', 34, SUB, 430)
para(d, (1640, 430), 'цитируют до сих пор, когда спорят, страна это или нет', 34, SUB, 440)
S.save('cc_montevideo', im, 'Монтевидео на карте Америки, 1933')

# 4. четыре условия по очереди
for i in range(4):
    EXPL = ['люди живут здесь всегда, а не заехали на выходные', 'у земли есть границы', 'кто-то реально управляет', 'способность вступать в отношения с другими странами']
    # текущий пункт жёлтый с пояснением; остальные серые (прошлые с пояснением)
    rows2 = [(COND[j], EXPL[j] if j <= i else '', 'hi' if j == i else 'off') for j in range(4)]
    checklist(f'cc_cond{i + 1}', 'Конвенция Монтевидео, статья 1', rows2, cap=f'четыре условия, пункт {i + 1}')

# 5. статья 3
im, d = S.new('Конвенция Монтевидео, статья 3')
d.rounded_rectangle((200, 220, 1720, 600), 30, outline=OR, width=6)
para(d, (W / 2, 410), '«Политическое существование государства не зависит от признания другими государствами»', 52, TXT, 1400)
lab(d, (W / 2, 690), 'звучит как лазейка', 40, YL)
S.save('cc_art3', im, 'статья 3: существование не зависит от признания')

# 6/7/28. расстояния от берега (линейный масштаб)
def sea_limits(key, title, limits, note, cap):
    im, d = S.new(title, note); X0, X1 = 300, 1760; KM = 25; px = (X1 - X0) / KM; Y = 470
    d.rectangle((X0, 200, X1, 680), fill=(20, 30, 46)); d.rectangle((120, 200, X0, 680), fill=GR)
    lab(d, (210, 440), 'берег', 34, TXT); lab(d, (210, 490), 'Англии', 34, TXT)
    for nm, km, col in limits:
        x = X0 + km * px; d.rectangle((X0, 200, x, 680), fill=tuple(int(c * 0.35 + 20) for c in col))
        d.line((x, 200, x, 680), fill=col, width=6); lab(d, (x, 240), nm, 32, col, 'rm' if x > 1200 else 'lm' if False else 'rm')
    # платформа ≈13 км (≈7 морских миль)
    xp = X0 + 13 * px; d.rectangle((xp - 26, Y - 26, xp + 26, Y + 26), fill=YL); lab(d, (xp, Y + 70), 'Силенд ≈ 13 км', 36, YL)
    for km in range(0, KM + 1, 5):
        x = X0 + km * px; d.line((x, 700, x, 715), fill=SUB, width=3); lab(d, (x, 742), f'{km} км', 28, SUB)
    d.line((X0, 700, X1, 700), fill=SUB, width=3)
    S.save(key, im, cap); return im

sea_limits('cc_sea13', 'Рафс-Тауэр: ≈ 13 км от берега', [], 'масштаб линейный; место платформы показано условно', 'форт в 13 км от берега')
sea_limits('cc_limit3', 'Британские воды в 1968 году', [('3 мили ≈ 5,6 км', 5.556, BL)], 'платформа за пределами 3 миль: суд решил, что судить не вправе', 'граница вод 3 мили')
sea_limits('cc_limit12', 'С 1987 года: 12 морских миль', [('3 мили', 5.556, DIM), ('12 миль ≈ 22 км', 22.22, BL)], 'Силенд оказался внутри британских вод', 'граница вод 12 миль')

# 8. на какой вопрос ответил суд
im, d = S.new('На что ответил суд в Челмсфорде')
for i, (q, a, col) in enumerate((('Может ли британский суд судить за выстрелы у платформы?', 'Нет: платформа вне 3-мильных вод', GN), ('Есть ли там государство?', 'Суд этого не решал', YL))):
    y = 290 + i * 250; d.rounded_rectangle((140, y - 100, 1780, y + 100), 26, outline=col, width=5)
    para(d, (W / 2, y - 38), q, 42, TXT, 1550); lab(d, (W / 2, y + 50), a, fit(d, a, 44, 1550), col)
S.save('cc_court_q', im, 'суд решал только вопрос о своих полномочиях')

# 9. Силенд по галочкам
checklist('cc_check_sealand', 'Силенд по галочкам', [('Территория', 'платформа есть', 'yes'), ('Правительство', 'семья Бейтсов', 'yes'), ('Постоянное население', 'один постоянный житель (данные последних лет)', 'paper'), ('Четвёртая галочка', 'проверим на других', 'q')], cap='Силенд по галочкам')

# 10. Либерленд: где и почему «ничей»
im, d, T = mapframe('Либерленд: пойма Дуная', (13.2, 42.1, 23.2, 47.6), {'Croatia': BL, 'Republic of Serbia': OR})
lab(d, T(16.2, 45.25), 'Хорватия', 40, TXT); lab(d, T(20.9, 44.1), 'Сербия', 40, TXT)
marker(d, T(18.87, 45.77), 'Либерленд ≈ 7 км²', (130, -110), YL, 40)
S.save('cc_liber_map', im, 'Либерленд на карте')

im, d = S.new('Почему основатель решил, что земля ничья', 'схема, не в масштабе')
d.rectangle((120, 170, 1800, 740), fill=(26, 30, 36))
# нынешнее русло Дуная (прямое) и старая граница по кадастру (извилистая)
riv = [(900 + 60 * math.sin(t / 40), 170 + t) for t in range(0, 571, 10)]
d.line(riv, fill=BL, width=46)
old = [(900 + 60 * math.sin(t / 40) + 230 * math.sin(t / 95 + 0.4), 170 + t) for t in range(0, 571, 10)]
for i in range(0, len(old) - 1, 2): d.line((old[i], old[i + 1]), fill=OR, width=8)
lab(d, (380, 230), 'Хорватия', 44, TXT); lab(d, (1520, 230), 'Сербия', 44, TXT)
lab(d, (1180, 700), 'Дунай сейчас', 34, BL); lab(d, (560, 700), 'старое русло', 34, OR)
para(d, (390, 440), 'Хорватия: граница по старому руслу (кадастр)', 34, OR, 460)
para(d, (1530, 440), 'Сербия: граница по нынешнему руслу', 34, BL, 460)
S.save('cc_liber_logic', im, 'спор о границе по Дунаю: две линии')

# 11. Либерленд: что сделали соседи
cardgrid('cc_liber_status', 'Земля спорная, но не ничья', [('Хорватия', 'не согласна и охраняет участок', RD), ('Сербия', 'суверенитет не нарушен, но страной это не признала', OR), ('2023', 'хорватская полиция убрала самовольные постройки', BL)], cap='позиции Хорватии и Сербии')

# 12. Либерленд по галочкам
cardgrid('cc_liber_claims', 'Заявки на гражданство', [('«сотни тысяч»', 'по словам основателя', YL), ('?', 'проверить эту цифру нельзя', DIM)], cap='заявки на гражданство: цифра основателя')
checklist('cc_check_liber', 'Либерленд по галочкам', [('Постоянное население', 'постоянных жителей нет', 'no'), ('Правительство', 'есть, но на землю его не пускают', 'paper')], note='две галочки пусты, третья на бумаге', cap='Либерленд по галочкам')

# 13. Хатт-Ривер на карте
im, d, T = mapframe('Хатт-Ривер, Западная Австралия', (108, -44, 158, -9), {'Australia': GR})
marker(d, T(115.86, -31.95), 'Перт', (-60, 40), SUB, 36, 10)
marker(d, T(114.45, -28.07), 'ферма Кейзли ≈ 75 км²', (110, -60), YL, 40)
lab(d, T(134, -25), 'Австралия', 44, TXT)
S.save('cc_hutt_map', im, 'Хатт-Ривер на карте Австралии')

# 14. жители и туристы
cardgrid('cc_hutt_people', 'По данным самого княжества', [('23', 'постоянных жителя', OR), ('≈ 40 000', 'туристов в год', BL)], note='цифры княжества, независимой проверки нет', cap='жители и туристы по данным княжества')

# хронология Хатт-Ривер (линейная шкала 1970-2020)
def hutt_tl(key, hi):
    im, d = S.new('Княжество Хатт-Ривер', 'шкала времени линейная'); X0, X1 = 200, 1720; Y = 470
    xf = lambda yr: X0 + (yr - 1970) / 50 * (X1 - X0); d.line((X0, Y, X1, Y), fill=SUB, width=6)
    for yr in range(1970, 2021, 10): d.line((xf(yr), Y - 10, xf(yr), Y + 10), fill=SUB, width=3)
    ev = [(1970, ['1970', 'ферма объявлена', 'государством'], 'up'), (1977, ['1977', '«война» Австралии,', 'через несколько дней мир'], 'down'), (2017, ['2017', 'суд: больше $2,7 млн', 'налогов'], 'up'), (2020, ['2020', 'роспуск,', 'землю продали'], 'down')]
    for yr, ls, pos in ev:
        x = xf(yr); col = YL if yr in hi else SUB; d.ellipse((x - 16, Y - 16, x + 16, Y + 16), fill=col)
        ys = [Y - 210, Y - 150, Y - 100] if pos == 'up' else [Y + 70, Y + 125, Y + 175]
        ax = 'lm' if yr < 1980 else 'rm'; xx = x - 20 if yr < 1980 else x + 20
        for (t, yy, sz) in zip(ls, ys, (46, 34, 34)): d.text((xx, yy), t, font=F(sz), fill=col if t == ls[0] else (TXT if yr in hi else SUB), anchor=ax)
    S.save(key, im, 'хронология Хатт-Ривер'); return im
hutt_tl('cc_hutt_tl1977', (1977,))
hutt_tl('cc_hutt_tl2017', (2017, 2020))

cardgrid('cc_hutt_court', 'Верховный суд Западной Австралии, 2017', [('> $2,7 млн', 'налогов должен заплатить Кейзли (австрал. долларов)', OR), ('довод о суверенитете', 'юридически несостоятелен', RD)], cap='решение суда 2017 года')

checklist('cc_check_hutt', 'Хатт-Ривер по галочкам', [('Территория', 'земля настоящая', 'yes'), ('Правительство', 'семья Кейзли', 'yes'), ('Постоянное население', 'есть, хотя мало', 'yes'), ('Отношения с другими странами', 'паспорта княжества Австралия не принимала', 'no')], cap='Хатт-Ривер по галочкам')

# 17. Молоссия: карта и площадь в масштабе
im, d, T = mapframe('Молоссия, штат Невада, США', (-126, 24, -66, 50), {'United States of America': GR})
marker(d, T(-119.59, 39.24), 'Молоссия: участок меньше 5 га', (90, 110), YL, 40)
S.save('cc_molossia_map', im, 'Молоссия на карте США')

im, d = S.new('Бывает и меньше огорода', 'площади в одном масштабе (квадраты той же площади)')
side_h = 520; side_m = side_h * math.sqrt(4.6 / 7500)
d.rectangle((420, 220, 420 + side_h, 220 + side_h), fill=OR); lab(d, (420 + side_h / 2, 220 + side_h / 2 - 30), 'Хатт-Ривер', 46, BG); lab(d, (420 + side_h / 2, 220 + side_h / 2 + 30), '≈ 75 км²', 44, BG)
mx = 1290; d.rectangle((mx, 220 + side_h - side_m, mx + side_m, 220 + side_h), fill=YL)
lab(d, (mx + 30, 640), 'Молоссия', 46, YL, 'lm'); lab(d, (mx + 30, 695), 'меньше 5 га', 40, TXT, 'lm'); arrow(d, (mx + 40, 610), (mx + side_m / 2 + 4, 220 + side_h - side_m - 8), YL, 4, 16)
S.save('cc_size_molossia', im, 'Хатт-Ривер и Молоссия в одном масштабе')

cardgrid('cc_micronations', 'Микронации', [('Силенд', 'платформа в море', BL), ('Либерленд', 'спорный берег', BL), ('Хатт-Ривер', 'ферма', BL), ('Молоссия', 'участок в пустыне', BL)], note='объявили себя странами; ни одно государство их не признало', cap='микронации')

# 18. Ки-Уэст 1982
im, d, T = mapframe('Ки-Уэст, Флорида, 1982', (-88.5, 23.6, -78.5, 31.2), {'United States of America': GR})
road = [T(-80.48, 25.45), T(-80.40, 25.10), T(-80.75, 24.85), T(-81.10, 24.70), T(-81.50, 24.62), T(-81.78, 24.555)]
d.line(road, fill=SUB, width=6)
marker(d, T(-81.78, 24.555), 'Ки-Уэст', (-90, 70), YL, 42)
marker(d, T(-80.48, 25.45), 'блокпост на шоссе к островам', (60, -120), RD, 38)
S.save('cc_conch_map', im, 'Ки-Уэст и блокпост на карте')

flow('cc_conch_steps', 'Республика Конч, 1982', [('«Независимость» в протест против блокпоста', YL), ('«Война» США и почти сразу сдача', OR), ('Просьба о миллиарде помощи', BL), ('Блокпост вскоре убрали', GN)], note='про миллиард сведений нет', cap='как Ки-Уэст «отделился»')

# 19. ООН 51 -> 193 (столбики в одном масштабе)
im, d = S.new('Государства в ООН'); base = 720; k = 470 / 193
for x, v, t, col in ((700, 51, '1945', BL), (1220, 193, 'сегодня', OR)):
    h = v * k; d.rectangle((x - 120, base - h, x + 120, base), fill=col); lab(d, (x, base - h - 50), str(v), 64, col); lab(d, (x, base + 45), t, 40, TXT)
d.line((480, base, 1440, base), fill=SUB, width=3)
lab(d, (1590, 420), 'почти', 40, SUB); lab(d, (1590, 480), 'вчетверо', 40, SUB); lab(d, (1590, 540), 'больше', 40, SUB)
S.save('cc_un_bars', im, 'ООН: 51 и 193 государства')

# 20. Южный Судан: референдум
im, d = S.new('Южный Судан, январь 2011', 'данные референдума (Википедия): явка 97,6%, за отделение 98,8%')
for i, (nm, v, t, col) in enumerate((('записались', 3.95, '≈ 3,9 млн', BL), ('пришли голосовать', 3.85, '≈ 3,85 млн', GN))):
    y = 270 + i * 140; w = 900 * v / 4.0; lab(d, (520, y), nm, 38, SUB, 'rm'); d.rectangle((550, y - 40, 550 + w, y + 40), fill=col); lab(d, (570 + w, y), t, 40, TXT, 'lm')
lab(d, (W / 2, 610), '≈ 99% за отделение от Судана', 64, OR)
S.save('cc_ss_vote', im, 'референдум в Южном Судане: цифры')

im, d, T = mapframe('Южный Судан отделился от Судана', (17, 1, 43, 24), {'South Sudan': OR, 'Sudan': BL})
lab(d, T(30, 16), 'Судан', 44, TXT); lab(d, T(30.5, 7.3), 'Южный Судан', 42, BG)
marker(d, T(31.58, 4.85), 'независимость: июль 2011', (330, 40), YL, 36)
S.save('cc_ss_map', im, 'Судан и Южный Судан на карте')

# 21. Восточный Тимор
im, d, T = mapframe('Восточный Тимор', (117.5, -12.5, 131.5, -5.5), {'East Timor': OR})
lab(d, T(126.0, -8.0), 'Восточный Тимор', 44, OR); lab(d, T(122.2, -10.6), 'Индонезия', 38, SUB)
S.save('cc_timor_map', im, 'Восточный Тимор на карте')

def tl3(key, title, ev, note=None, cap=''):
    """ev=[(доля, год, подпись, цвет)] линейная шкала"""
    im, d = S.new(title, note); X0, X1, Y = 260, 1660, 470; d.line((X0, Y, X1, Y), fill=SUB, width=6)
    for i, (f, yr, t, col) in enumerate(ev):
        x = X0 + (X1 - X0) * f; d.ellipse((x - 16, Y - 16, x + 16, Y + 16), fill=col)
        up = i % 2 == 0; lab(d, (x, Y - 150 if up else Y + 75), yr, 48, col); para(d, (x, Y - 85 if up else Y + 150), t, 34, TXT, 480)
    S.save(key, im, cap); return im

tl3('cc_timor_tl', 'Восточный Тимор: годы после голосования', [(0.0, '1999', 'голосование, организованное ООН', YL), (0.5, '1999–2002', 'временная администрация ООН', BL), (1.0, '2002', 'независимость', GN)], 'шкала линейная: 1999–2002', 'Восточный Тимор: хронология')

# 22. Эритрея
im, d, T = mapframe('Эритрея', (30, 2, 50, 19.5), {'Eritrea': OR, 'Ethiopia': BL})
lab(d, T(38.8, 15.6), 'Эритрея', 40, BG); lab(d, T(39.5, 8.5), 'Эфиопия', 44, TXT)
marker(d, T(38.93, 15.33), 'референдум под наблюдением ООН, независимость в 1993', (-60, -170), YL, 34)
S.save('cc_eritrea_map', im, 'Эритрея на карте')

cardgrid('cc_three_real', 'Кто стал страной по-настоящему', [('Эритрея', '1993: референдум под наблюдением ООН', GN), ('Вост. Тимор', '2002: голосование ООН, потом временная администрация ООН', GN), ('Южный Судан', '2011: референдум по мирному соглашению 2005', GN)], note='никто не начинал с флага на пустой платформе', cap='три пути к признанию')

# 23. общий путь
flow('cc_path', 'Путь, который признают', [('Договорённость с прежним государством', BL), ('Голосование под международным контролем', BL), ('Флаг, гимн, место в ООН', OR)], cap='путь к признанию')

# 24. Косово
im, d, T = mapframe('Косово, 2008', (16.5, 40.6, 25.5, 46.3), {'Kosovo': OR, 'Republic of Serbia': BL})
lab(d, T(20.9, 42.62), 'Косово', 38, BG); lab(d, T(20.9, 44.3), 'Сербия', 44, TXT)
S.save('cc_kosovo_map', im, 'Косово и Сербия на карте')
cardgrid('cc_kosovo', 'Косово: признание неоднозначно', [('> 100', 'стран признали независимость', GN), ('нет', 'Сербия, Россия, Китай', RD), ('ООН', 'Косово не входит', DIM), ('2010', 'Международный суд ООН: декларация право не нарушила', BL)], cap='Косово: признание')

# 25. Силенд 1978
flow('cc_sealand1978', 'Силенд, 1978', [('Наёмники «премьера» захватили платформу', RD), ('Сын Бейтса отбил её и взял пленных', GN), ('Германия прислала дипломата ради одного из них', BL), ('Силенд: «признание». Другие страны: нет', YL)], cap='Силенд, 1978')

# 26. способность ≠ признание
im, d = S.new('Оговорка к статье 3')
d.rounded_rectangle((120, 260, 860, 620), 28, outline=BL, width=6); para(d, (490, 440), 'Способность вступать в отношения (Монтевидео)', 46, BL, 640)
lab(d, (W / 2, 440), '≠', 140, TXT)
d.rounded_rectangle((1060, 260, 1800, 620), 28, outline=OR, width=6); para(d, (1430, 440), 'Признание другими странами', 46, OR, 640)
lab(d, (W / 2, 720), 'а если с тобой никто не хочет говорить?', 40, YL)
S.save('cc_capacity', im, 'способность вступать в отношения и признание')

# 27. две школы и что даёт признание
im, d = S.new('Что создаёт страну? Два взгляда юристов')
for i, (t, sub, col) in enumerate((('Признание создаёт страну', 'жизнь часто идёт так', OR), ('Признание лишь отмечает факт', 'Монтевидео ближе сюда', BL))):
    x = 500 + i * 920; d.rounded_rectangle((x - 400, 250, x + 400, 560), 28, outline=col, width=6); para(d, (x, 380), t, 50, col, 720); lab(d, (x, 640), sub, 40, TXT)
S.save('cc_theories', im, 'две точки зрения на признание')
checklist('cc_no_recog', 'Без признания не будет', [('Посольства', '', 'no'), ('Торгового договора', '', 'no'), ('Места в ООН', '', 'no')], cap='что закрыто без признания')

# 28. что остановило микронации
cardgrid('cc_obstacles', 'Чья-то земля и чьи-то законы сильнее флага', [('Либерленд', 'чужая граница: участок охраняет Хорватия', RD), ('Хатт-Ривер', 'налоги: суд 2017 года', RD), ('Силенд', 'с 1987 года внутри британских вод', RD)], cap='что остановило микронации')

# 29. итоговая таблица
im, d = S.new('Теперь сложим')
for i, (hd, nm, t, col) in enumerate((('Остановились на 4-й галочке', 'Силенд · Либерленд · Хатт-Ривер', 'никто не согласился признать', RD), ('С 4-й галочки начинали', 'Южный Судан · Тимор · Эритрея', 'сначала договорённость с другими, потом всё остальное', GN))):
    y = 300 + i * 250; d.rounded_rectangle((120, y - 105, 1800, y + 105), 26, outline=col, width=5)
    lab(d, (170, y - 55), hd, 42, col, 'lm'); lab(d, (170, y + 5), nm, fit(d, nm, 44, 1580), TXT, 'lm'); lab(d, (170, y + 62), t, fit(d, t, 32, 1580), SUB, 'lm')
lab(d, (W / 2, 740), 'разница: кто согласен с тобой разговаривать', 40, YL)
S.save('cc_compare', im, 'сравнение микронаций и признанных стран')

# 30/32. твоя платформа
checklist('cc_you3', 'Твоя платформа', [('Постоянное население', 'зови друзей, пусть живут здесь постоянно', 'yes'), ('Территория', 'платформа есть (сегодня в британских водах)', 'yes'), ('Правительство', 'ты сам', 'yes'), ('Отношения с другими странами', '', 'off')], cap='твоя платформа: три галочки')
checklist('cc_you4', 'Твоя платформа', [('Постоянное население', 'друзья', 'yes'), ('Территория', 'платформа', 'yes'), ('Правительство', 'ты сам', 'yes'), ('Отношения с другими странами', 'зависит от других', 'q')], cap='четвёртая галочка зависит от других')

# 31. формула
im, d = S.new('Из чего складывается страна')
for i, (t, col) in enumerate((('люди, живущие на земле', BL), ('власть, которая ею управляет', BL), ('другие государства, согласные говорить на равных', OR))):
    x = 340 + i * 620; d.rounded_rectangle((x - 270, 260, x + 270, 560), 28, outline=col, width=6); para(d, (x, 410), t, 42, col, 470)
    if i < 2: lab(d, (x + 310, 410), '+', 80, TXT)
lab(d, (W / 2, 680), 'одним решением страну не создать', 44, YL)
S.save('cc_formula', im, 'из чего складывается страна')
flow('cc_flag_last', 'Как рождались настоящие страны', [('Референдум', BL), ('Договоры и долгие переговоры', BL), ('Флаг: последним', OR)], cap='флаг приходил последним')

print('ok', len(S.new_keys))
