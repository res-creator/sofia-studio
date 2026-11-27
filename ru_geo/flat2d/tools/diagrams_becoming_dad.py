#!/usr/bin/env python3
"""Схемы для «Почему почти невозможно стать папой?» (becoming_dad).
Собственная графика; числа только из SCRIPT.md. Схемы нарочито простые (кружки, линии, станции),
без изображений тела. Нижние 250 px пустые (субтитры)."""
import sys, math, random
sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools')
from dg import *
from PIL import Image, ImageDraw

S = Slug('becoming_dad')
LIM = 820  # всё содержимое выше этой линии (ниже 830 субтитры)
DIM = (48, 50, 58)


def sperm(d, x, y, s=1.0, ang=0.0, col=TXT, tail=True, w=None):
    """схематичный бегун: овальная головка, шейка, волнистый хвост; (x,y) центр головки; ang 0 = головкой вправо"""
    ca, sa = math.cos(ang), math.sin(ang)
    P = lambda u, v: (x + u * ca - v * sa, y + u * sa + v * ca)
    hw, hh = 22 * s, 13 * s
    pts = [P(hw * math.cos(t), hh * math.sin(t)) for t in [i * math.pi / 18 for i in range(36)]]
    d.polygon(pts, fill=col)
    lw = max(2, int((w or 6) * s))
    d.line([P(-hw, 0), P(-hw - 22 * s, 0)], fill=col, width=lw + 2)
    if tail:
        tp = [P(-hw - 22 * s - i * 6 * s, 9 * s * math.sin(i * 0.5)) for i in range(26)]
        d.line(tp, fill=col, width=max(2, lw - 2), joint='curve')


def egg(d, x, y, r, col=OR, ring=None):
    d.ellipse((x - r, y - r, x + r, y + r), outline=col, width=8)
    d.ellipse((x - r + 24, y - r + 24, x + r - 24, y + r - 24), fill=(70, 52, 30))
    d.ellipse((x - r * 0.22, y - r * 0.22, x + r * 0.22, y + r * 0.22), fill=col)
    if ring: d.ellipse((x - r - 10, y - r - 10, x + r + 10, y + r + 10), outline=ring, width=10)


def person(d, x, y, s=1.0, col=BL):
    d.ellipse((x - 18 * s, y - 70 * s, x + 18 * s, y - 34 * s), fill=col)
    d.rounded_rectangle((x - 28 * s, y - 28 * s, x + 28 * s, y + 40 * s), int(16 * s), fill=col)


def save(key, im, title):
    # контроль: низ кадра должен быть пустым
    px = im.crop((0, 830, W, H)).getextrema()
    assert all(hi - lo < 6 for lo, hi in px), f'{key}: что-то нарисовано в зоне субтитров'
    S.save(key, im, title)


def axis_log(d, x0, x1, y, lo, hi, ticks):
    d.line((x0, y, x1, y), fill=SUB, width=4)
    X = lambda v: x0 + (x1 - x0) * (math.log10(v) - lo) / (hi - lo)
    for v, t in ticks:
        d.line((X(v), y - 10, X(v), y + 10), fill=SUB, width=3); lab(d, (X(v), y + 34), t, 30, SUB)
    return X


# ---------- 1. забег: от миллионов к одному (лог. шкала)
im, d = S.new('Забег перед рождением каждого из нас', 'шкала логарифмическая: каждая черта — в 10 раз больше')
X = lambda v: 520 + 1250 * math.log10(v) / 8.5
rows = [('старт', 'миллионы', 1e8, BL), ('у финиша', 'несколько сотен', 300, BL), ('приз', 'один', 1, OR)]
for i, (a, b, v, c) in enumerate(rows):
    y = 250 + i * 150; lab(d, (480, y), a, 44, SUB, 'rm'); w = max(14, X(v) - 520)
    d.rectangle((520, y - 40, 520 + w, y + 40), fill=c); lab(d, (520 + w + 24, y), b, 48, TXT, 'lm') if w < 1000 else lab(d, (520 + w - 24, y), b, 48, BG, 'rm')
for k in range(0, 9):
    x = 520 + 1250 * k / 8.5; d.line((x, 690, x, 704), fill=GR, width=3)
d.line((520, 697, 1770, 697), fill=GR, width=3)
save('bd_funnel', im, 'забег: от миллионов к одному')

# ---------- 2. путь в тысячи раз длиннее бегуна (честный линейный масштаб)
im, d = S.new('Путь в тысячи раз длиннее бегуна', 'в одном масштабе; на деле путь ещё длиннее — в несколько тысяч раз')
d.rectangle((210, 520, 1710, 548), fill=OR); lab(d, (960, 600), 'путь: 1000 длин бегуна', 46, OR)
d.rectangle((210, 330, 212, 358), fill=TXT); d.line((211, 320, 211, 250), fill=TXT, width=3); d.polygon([(211, 322), (200, 300), (222, 300)], fill=TXT)
lab(d, (240, 230), 'бегун: черта длиной 1,5 пикселя (под стрелкой)', 40, TXT, 'lm')
d.rectangle((210, 330, 211.5, 358), fill=BL)
save('bd_path', im, 'путь и бегун в одном масштабе')

# ---------- 3. Гоша
im, d = S.new('Знакомьтесь: Гоша')
sperm(d, 1020, 400, 4.2, 0, OR)
lab(d, (1300, 270), 'Гоша', 60, OR, 'lm')
for i, t in enumerate(('один хвост', 'ни карты', 'ни навигатора')):
    lab(d, (260, 560 + i * 70), '• ' + t, 44, TXT, 'lm')
lab(d, (1180, 640), 'против него ≈ 300 млн своих же', 44, BL)
save('bd_gosha', im, 'Гоша')

# ---------- 4. толпа: 3000 точек, одна — Гоша
im, d = S.new('Один против ≈ 300 миллионов', 'каждая точка — 100 000 бегунов; 3000 точек ≈ 300 млн')
cols, rws = 100, 30; x0, y0, st = 165, 200, 16
for i in range(cols * rws):
    cx = x0 + (i % cols) * st; cy = y0 + (i // cols) * st; d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=GR)
gx, gy = x0 + 57 * st, y0 + 14 * st
d.ellipse((gx - 9, gy - 9, gx + 9, gy + 9), fill=OR); d.ellipse((gx - 26, gy - 26, gx + 26, gy + 26), outline=OR, width=5)
lab(d, (W / 2, 720), 'до финиша дойдут единицы', 46, TXT)
save('bd_crowd', im, 'один среди 300 миллионов')

# ---------- 5. обещание: число в конце
im, d = S.new('Два числа этого фильма')
d.rounded_rectangle((140, 220, 900, 700), 30, outline=BL, width=5); lab(d, (520, 390), '?', 160, BL); lab(d, (520, 560), 'число в конце фильма:', 40); lab(d, (520, 620), 'почему вы это слушаете', 40, SUB)
d.rounded_rectangle((1020, 220, 1780, 700), 30, outline=OR, width=5); lab(d, (1400, 390), '≈ 1/3', 140, OR); lab(d, (1400, 540), 'беременностей, выявленных', 38); lab(d, (1400, 595), 'по гормону, — потеря,', 38); lab(d, (1400, 650), 'чаще всего очень рано', 38, SUB)
save('bd_two_numbers', im, 'два числа фильма')

# ---------- 6. треть потерь
im, d = S.new('Беременности, выявленные по гормону', 'оценка по исследованиям: «около трети», чаще всего так рано, что о них не узнают')
x0, x1 = 200, 1720; xm = x0 + (x1 - x0) / 3
d.rectangle((x0, 330, xm, 520), fill=OR); d.rectangle((xm + 6, 330, x1, 520), fill=BL)
lab(d, ((x0 + xm) / 2, 425), '≈ 1/3', 80, BG); lab(d, ((xm + x1) / 2, 425), '≈ 2/3', 80, BG)
lab(d, ((x0 + xm) / 2, 590), 'заканчиваются потерей', 40, OR); lab(d, ((xm + x1) / 2, 590), 'продолжаются', 40, BL)
save('bd_loss_third', im, 'около трети — потеря')

# ---------- 7/8. разброс числа бегунов (линейная шкала)
def range_chart(key, title, note, mark39=False, band_only=False):
    im, d = S.new(title, note)
    x0, x1, y = 200, 1720, 520; X = lambda v: x0 + (x1 - x0) * v / 500
    # полоса разброса с размытыми краями: «от десятков до нескольких сотен миллионов»
    for v in range(0, 500):
        a = 1.0
        if v < 30: a = v / 30
        if v > 300: a = max(0, 1 - (v - 300) / 200)
        c = tuple(int(BG[k] + (BL[k] - BG[k]) * a * 0.75) for k in range(3))
        d.rectangle((X(v), y - 90, X(v + 1), y - 10), fill=c)
    d.line((x0, y, x1, y), fill=SUB, width=4)
    for v in range(0, 501, 100):
        d.line((X(v), y - 8, X(v), y + 12), fill=SUB, width=3); lab(d, (X(v), y + 44), f'{v}' if v else '0', 32, SUB)
    lab(d, (x1 + 50, y + 44), 'млн', 32, SUB, 'lm')
    lab(d, (W / 2, y + 110), 'обычный разброс: от десятков до нескольких сотен миллионов', 38, BL)
    if band_only: pass
    elif mark39:
        d.line((X(39), y - 210, X(39), y), fill=YL, width=6); lab(d, (X(39) + 16, y - 240), '39 млн — нижняя граница обычного диапазона', 40, YL, 'lm')
    else:
        d.line((X(300), y - 210, X(300), y), fill=OR, width=6); lab(d, (X(300), y - 240), '300 млн — называют чаще всего, это верхний край', 40, OR)
    lab(d, (W / 2, 705), 'в одной порции; у каждого своё и меняется от раза к разу', 36, TXT)
    save(key, im, title)
range_chart('bd_range', 'Сколько бегунов на старте', 'граница полосы размыта: точных краёв нет')
range_chart('bd_range_band', 'Реальный разброс огромный', 'граница полосы размыта: точных краёв нет', band_only=True)
range_chart('bd_range39', 'Нижняя отметка: 39 миллионов', 'это просто отметка на графике, сама по себе она ничего не решает', True)

# ---------- 9. каждый двадцатый
im, d = S.new('Ниже отметки — примерно каждый двадцатый', 'среди мужчин, чьи партнёрши забеременели')
for i in range(20):
    x = 250 + (i % 10) * 158; y = 360 + (i // 10) * 220; person(d, x, y, 1.5, OR if i == 13 else GR)
lab(d, (W / 2, 720), '1 из 20 — ниже 39 млн, и всё равно стал отцом', 42, OR)
save('bd_one_in20', im, 'каждый двадцатый')

# ---------- 10. зачем столько
im, d = S.new('Зачем столько бегунов, если нужен один?', 'одна из версий; другие объяснения учёные обсуждают до сих пор')
lab(d, (W / 2, 190), 'единого ответа нет', 44, SUB)
xs = [260, 640, 1020, 1400, 1700]; hs = [300, 200, 130, 80, 50]
for i, (x, h) in enumerate(zip(xs, hs)):
    d.rectangle((x - 60, 620 - h * 1.2, x + 60, 620), fill=BL if i < 4 else OR)
    if i < 4: d.line((x + 110, 420, x + 110, 640), fill=RD, width=8); lab(d, (x + 110, 680), f'фильтр {i + 1}', 32, RD)
lab(d, (260, 270), 'старт', 38, BL); lab(d, (1700, 520), 'хватило', 38, OR)
lab(d, (W / 2, 735), 'запас на дорогу с фильтрами — как лишний бензин в долгий путь', 40, TXT)
save('bd_why_many', im, 'зачем столько: запас')

im, d = S.new('Зачем столько бегунов, если нужен один?')
lab(d, (W / 2, 420), 'единого ответа нет', 90, YL)
save('bd_why_q', im, 'зачем столько')

# ---------- 11. устройство бегуна
im, d = S.new('Как устроен бегун', 'схема, не в масштабе')
cx, cy = 1460, 420
d.ellipse((cx - 140, cy - 85, cx + 140, cy + 85), fill=BL); d.ellipse((cx - 70, cy - 45, cx + 60, cy + 45), fill=(40, 90, 140))
d.rounded_rectangle((cx - 340, cy - 26, cx - 135, cy + 26), 20, fill=OR)
tp = [(cx - 340 - i * 6, cy + 26 * math.sin(i * 0.2)) for i in range(150)]; d.line(tp, fill=TXT, width=10, joint='curve')
lab(d, (cx, cy - 150), 'головка: ДНК', 44, BL)
lab(d, (cx - 180, cy + 160), 'шейка: запас энергии', 40, OR)
lab(d, (720, cy - 110), 'хвост-жгутик', 44, TXT)
d.line((226, cy + 80, 1120, cy + 80), fill=YL, width=4); d.line((226, cy + 66, 226, cy + 94), fill=YL, width=4); d.line((1120, cy + 66, 1120, cy + 94), fill=YL, width=4)
lab(d, (673, cy + 140), '≈ 0,05 мм', 54, YL)
save('bd_parts', im, 'устройство бегуна')

# ---------- 12. 0,05 мм на линейке
im, d = S.new('0,05 мм — это одна двадцатая миллиметра', 'линейка: 1 миллиметр, разделённый на 20 частей')
x0, x1, y = 260, 1660, 450; st = (x1 - x0) / 20
d.rectangle((x0, y - 120, x1, y + 20), outline=SUB, width=4)
for i in range(21):
    h = 90 if i in (0, 20) else (60 if i == 10 else 36); d.line((x0 + i * st, y - 120, x0 + i * st, y - 120 + h), fill=SUB, width=3)
d.rectangle((x0, y - 10, x0 + st, y + 20), fill=YL)
lab(d, (x0, y + 70), '0', 40, SUB); lab(d, (x1, y + 70), '1 мм', 40, SUB)
lab(d, (x0 + st / 2 + 30, y + 140), '← хвост ≈ 0,05 мм', 44, YL, 'lm')
save('bd_ruler', im, '0,05 мм на линейке миллиметра')

# ---------- 13. схема трассы (станции), разные подсветки
ST = [('старт', 200), ('кислая\nсреда', 470), ('шейка матки:\nсито', 760), ('матка', 1050), ('маточная\nтруба', 1330), ('финиш:\nяйцеклетка', 1640)]
def route(key, title, hi, note=None, extra=None):
    im, d = S.new(title, note); y = 430
    d.line((ST[0][1], y, ST[-1][1], y), fill=GR, width=14)
    for i, (nm, x) in enumerate(ST):
        on = i in hi; c = OR if on else SUB
        if i == 5: egg(d, x, y, 46, OR if on else GR)
        else: d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=c if on else GR, outline=c, width=6)
        for j, ln in enumerate(nm.split('\n')): lab(d, (x, y + 90 + j * 46), ln, 36 if on else 32, c)
    if extra: extra(d, y)
    save(key, im, title)
route('bd_route', 'Трасса забега: схема станций', range(6), 'схема-метро, не карта тела')
route('bd_route_acid', 'Первая преграда: кислая среда', [1], extra=lambda d, y: lab(d, (470, y - 110), 'многие гибнут в первые минуты', 38, RD))
route('bd_route_tube', 'Дальше: матка и узкая труба', [3, 4], extra=lambda d, y: lab(d, (1190, y - 110), 'на каждом повороте — меньше', 38, OR))
def _rest(d, y):
    d.rounded_rectangle((1230, y - 170, 1430, y - 60), 20, outline=BL, width=5); lab(d, (1330, y - 115), 'приют', 40, BL)
    lab(d, (1330, y - 210), 'копят силы и ждут сигнала', 36, BL)
route('bd_route_rest', 'В трубе есть «приют»', [4], 'поэтому гонка тянется не минуты, а дни', _rest)
def _q(d, y):
    for x in (615, 905, 1190, 1485): lab(d, (x, y - 70), '?', 70, YL)
route('bd_route_unknown', 'Как бегуны находят дорогу?', [4, 5], 'учёные изучают до сих пор: точной карты нет', _q)

# ---------- 14. сито
im, d = S.new('Слизь шейки матки работает как сито')
d.rectangle((940, 170, 960, 700), fill=GR)
for k in range(8): d.line((915, 190 + k * 70, 985, 190 + k * 70), fill=GR, width=6)
for y in (230, 430, 630):
    sperm(d, 780, y, 1.5, 0, GN); d.line((1000, y, 1230, y), fill=GN, width=5); d.polygon([(1252, y), (1226, y - 16), (1226, y + 16)], fill=GN); sperm(d, 1640, y, 1.5, 0, GN)
for y in (330, 530):
    sperm(d, 870, y, 1.2, 0, RD); lab(d, (915, y - 40), '×', 50, RD)
lab(d, (1500, 740), 'подвижные — дальше', 40, GN); lab(d, (500, 740), 'вялые и неправильные — задержаны', 38, RD)
save('bd_sieve', im, 'сито шейки матки')

# ---------- 15. сколько доходит (лог. шкала)
im, d = S.new('Сколько бегунов доходит', 'шкала логарифмическая; оценки в разных источниках разнятся')
X = lambda v: 560 + 1180 * math.log10(v) / 9
rows = [('старт', 2e7, 5e8, 'десятки–сотни миллионов', BL), ('у маточных труб', 2e3, 9e3, 'несколько тысяч', BL), ('у яйцеклетки', 10, 900, 'сотни или меньше', OR)]
for i, (a, lo, hi, t, c) in enumerate(rows):
    y = 230 + i * 140; lab(d, (520, y), a, 40, SUB, 'rm')
    d.rectangle((560, y - 6, X(lo), y + 6), fill=GR); d.rounded_rectangle((X(lo), y - 34, X(hi), y + 34), 12, fill=c)
    lab(d, (X(hi) + 20, y), t, 40, TXT, 'lm') if X(hi) < 1300 else lab(d, (X(hi), y - 62), t, 40, TXT, 'rm')
y = 650; d.line((560, y, 1740, y), fill=SUB, width=3)
for k, t in ((0, '1'), (3, '1 000'), (6, '1 млн'), (9, '1 млрд')):
    x = 560 + 1180 * k / 9; d.line((x, y - 10, x, y + 10), fill=SUB, width=3); lab(d, (x, y + 36), t, 30, SUB)
save('bd_reach', im, 'сколько доходит')

# ---------- 16. не минуты, а дни
im, d = S.new('Гонка тянется не минуты, а дни', 'линейная шкала в часах')
x0, x1 = 200, 1720; X = lambda h: x0 + (x1 - x0) * h / 120
d.rectangle((x0, 300, X(0.25), 380), fill=RD); lab(d, (x0 + 20, 260), 'первые минуты: кислая среда', 40, RD, 'lm')
d.rectangle((x0, 470, x1, 550), fill=BL); lab(d, (W / 2, 510), 'ожидание в трубе: до 5 дней', 44, BG)
y = 640; d.line((x0, y, x1, y), fill=SUB, width=3)
for dd in range(6):
    x = X(dd * 24); d.line((x, y - 10, x, y + 10), fill=SUB, width=3); lab(d, (x, y + 36), f'{dd} д', 32, SUB)
save('bd_days', im, 'не минуты, а дни')

# ---------- 17. отбор: жёсткий и случайный
im, d = S.new('Отбор: отчасти жёсткий, отчасти случайный')
d.rounded_rectangle((160, 200, 920, 700), 30, outline=RD, width=5); lab(d, (540, 270), 'жёсткий', 56, RD)
for i, t in enumerate(('кислая среда', 'сито слизи', 'форма', 'скорость')): lab(d, (540, 380 + i * 75), t, 42)
d.rounded_rectangle((1000, 200, 1760, 700), 30, outline=YL, width=5); lab(d, (1380, 270), 'случайный', 56, YL)
for i, t in enumerate(('какой поворот', 'когда пришёл', 'кто оказался рядом')): lab(d, (1380, 380 + i * 75), t, 42)
save('bd_selection', im, 'отбор')

# ---------- 18. яйцеклетка: одна за месяц
im, d = S.new('Обычно за месяц созревает одна яйцеклетка', 'одна клетка — один цикл')
for i in range(12):
    x = 210 + (i % 6) * 300; y = 300 + (i // 6) * 250
    d.rounded_rectangle((x - 110, y - 90, x + 110, y + 90), 20, outline=GR, width=4); egg(d, x, y - 10, 46, OR)
    lab(d, (x, y + 65), f'месяц {i + 1}', 28, SUB)
save('bd_egg_month', im, 'одна яйцеклетка в месяц')

# ---------- 19. запас и сколько созревает
im, d = S.new('Запас к рождению — в тысячи раз больше', 'здесь показано лишь 1000 клеток; на деле запас ещё больше')
cols, rws = 50, 20; x0, y0, st = 360, 190, 24
for i in range(cols * rws):
    cx = x0 + (i % cols) * st; cy = y0 + (i // cols) * st; d.rectangle((cx, cy, cx + st - 5, cy + st - 5), fill=OR if i == 0 else GR)
d.rectangle((x0 - 6, y0 - 6, x0 + st + 1, y0 + st + 1), outline=YL, width=4)
lab(d, (W / 2, 720), 'одна клетка сетки = все созревшие за жизнь (несколько сотен)', 38, OR)
save('bd_egg_stock', im, 'запас яйцеклеток')

# ---------- 20. десятки вокруг, внутрь один
im, d = S.new('Вокруг — десятки, внутрь проходит один')
cx, cy, R = 960, 460, 140; egg(d, cx, cy, R, OR)
random.seed(4)
for k in range(30):
    a = 2 * math.pi * k / 30 + random.uniform(-0.05, 0.05); r = R + 45 + random.uniform(0, 40)
    sperm(d, cx + r * math.cos(a), cy + r * math.sin(a), 0.7, a + math.pi, SUB)
sperm(d, cx + (R - 30), cy - 40, 1.0, math.pi + 0.2, YL)

save('bd_egg_crowd', im, 'один внутрь')

# ---------- 21. слияние и смена оболочки
im, d = S.new('Один вошёл — оболочка меняется')
for i, (x, t) in enumerate(((330, '1. головка сливается'), (960, '2. оболочка меняется'), (1590, '3. остальные опоздали'))):
    egg(d, x, 400, 150, OR, ring=(YL if i else None))
    if i == 0: sperm(d, x + 125, 350, 0.9, math.pi + 0.4, YL)
    if i == 2:
        for a in (-0.5, 0.4, 2.7, 3.6): sperm(d, x + 200 * math.cos(a), 400 + 200 * math.sin(a), 0.6, a + math.pi, SUB)
    lab(d, (x, 680), t, 38)
save('bd_fusion', im, 'слияние')

# ---------- 22. Гоша второй
im, d = S.new('Гоша пришёл вторым')
egg(d, 1350, 420, 190, OR, ring=YL)
sperm(d, 1350 + 165, 380, 0.9, math.pi + 0.25, YL); lab(d, (1560, 680), 'первый — внутри', 40, YL)
sperm(d, 900, 420, 2.2, 0, BL); lab(d, (780, 300), 'Гоша', 56, BL); lab(d, (780, 560), 'на шаг позже', 40, BL)
lab(d, (W / 2, 750), 'оболочка уже закрыта', 40, SUB)
save('bd_second', im, 'Гоша второй')

# ---------- 23. сколько живут: часы (линейно)
im, d = S.new('Не самый быстрый, а тот, кто вовремя', 'линейная шкала в часах')
x0, x1 = 520, 1720; X = lambda h: x0 + (x1 - x0) * h / 120
lab(d, (480, 300), 'яйцеклетка', 44, OR, 'rm'); d.rectangle((x0, 260, X(12), 340), fill=OR); d.rectangle((X(12), 260, X(24), 340), fill=(150, 105, 40))
lab(d, (X(24) + 20, 300), '12–24 часа', 44, OR, 'lm')
lab(d, (480, 470), 'бегуны в трубе', 44, BL, 'rm'); d.rectangle((x0, 430, x1, 510), fill=BL); lab(d, (x1 - 20, 470), 'до 5 дней', 44, BG, 'rm')
y = 620; d.line((x0, y, x1, y), fill=SUB, width=3)
for h in range(0, 121, 24):
    d.line((X(h), y - 10, X(h), y + 10), fill=SUB, width=3); lab(d, (X(h), y + 36), f'{h} ч', 30, SUB)
save('bd_lifespan', im, 'часы и дни')

# ---------- 24–26. окно фертильности на шкале дней
def days_axis(d, y=560):
    x0, st = 230, 182
    X = lambda k: x0 + (k + 7) * st
    d.line((X(-7) - 40, y, X(1) + 40, y), fill=SUB, width=4)
    for k in range(-7, 2):
        d.line((X(k), y - 10, X(k), y + 10), fill=SUB, width=3); lab(d, (X(k), y + 40), str(k) if k else '0', 34, SUB)
    lab(d, (X(-3), y + 95), 'дни до овуляции (0 — день овуляции)', 32, SUB)
    return X
im, d = S.new('Окно фертильности ≈ 6 дней')
X = days_axis(d); d.rounded_rectangle((X(-5) - 80, 330, X(0) + 80, 520), 24, fill=(36, 60, 84), outline=BL, width=5)
lab(d, ((X(-5) + X(0)) / 2, 380), 'окно: около 6 дней', 48, BL)
egg(d, X(0), 470, 34, OR); lab(d, (X(0), 250), 'последний — день', 36, OR); lab(d, (X(0), 292), 'овуляции', 36, OR)
save('bd_window', im, 'окно фертильности')

def wait(key, show_egg):
    im, d = S.new('Гоша пришёл за день до овуляции', 'бегунам здесь нужна не скорость, а терпение')
    X = days_axis(d)
    sperm(d, X(-1), 450, 1.6, 0, BL); lab(d, (X(-1) + 20, 330), 'Гоша ждёт', 42, BL, 'rm')
    d.line((X(-1) + 40, 450, X(0) - 50 if show_egg else X(1), 450), fill=BL, width=6)
    if show_egg: egg(d, X(0), 450, 40, OR); lab(d, (X(0) - 30, 330), 'яйцеклетка', 40, OR, 'lm')
    save(key, im, 'Гоша ждёт')
wait('bd_wait_a', False); wait('bd_wait_b', True)

# ---------- 27. шанс по дням vs монетка
def chance(key, coin):
    im, d = S.new('Шанс в дни окна', 'выше трети шанс не поднимался; столбики в одном линейном масштабе')
    yb = 680; Y = lambda p: yb - 460 * p / 50
    for x, p, t, c, v in ((400, 10, 'за 5 дней до овуляции', BL, '≈ 10 %'), (960, 33, 'последние дни перед ней', OR, 'до ≈ 33 %'), (1520, 50, 'орёл или решка', GR, '50 %'))[:3 if coin else 2]:
        d.rectangle((x - 150, Y(p), x + 150, yb), fill=c); lab(d, (x, Y(p) - 40), v, 48, TXT); lab(d, (x, yb + 40), t, 34, SUB)
    d.line((200, yb, 1720, yb), fill=SUB, width=3)
    if coin: d.line((200, Y(50), 1720, Y(50)), fill=GR, width=2)
    save(key, im, 'шанс в дни окна')
chance('bd_chance_a', False); chance('bd_chance_days', True)

# ---------- 28. окно плавает
im, d = S.new('День овуляции плавает от цикла к циклу', 'условный пример: показан сдвиг, а не точные дни')
for i, sh in enumerate((0, 3, -2)):
    y = 260 + i * 160; lab(d, (330, y), f'цикл {i + 1}', 40, SUB, 'rm')
    for k in range(28): d.rectangle((370 + k * 48, y - 22, 370 + k * 48 + 40, y + 22), fill=DIM)
    o = 14 + sh
    for k in range(o - 5, o + 1): d.rectangle((370 + k * 48, y - 22, 370 + k * 48 + 40, y + 22), fill=BL)
    egg(d, 370 + o * 48 + 20, y, 30, OR)
lab(d, (W / 2, 715), 'окно сдвигается — поэтому часто нужно несколько месяцев', 40)
save('bd_shift', im, 'окно плавает')

im, d = S.new('Несколько месяцев попыток — обычное дело')
for k in range(6):
    x = 330 + k * 252; d.rounded_rectangle((x - 100, 300, x + 100, 480), 22, outline=BL, width=5); lab(d, (x, 360), 'месяц', 34, SUB); lab(d, (x, 425), str(k + 1), 56, BL)
lab(d, (W / 2, 600), 'у многих пар получается не с первого цикла', 44)
save('bd_months', im, 'несколько месяцев')

# ---------- 29. шесть событий (по нарастанию)
EV = ['пережить кислоту и слизь', 'дойти до трубы', 'яйцеклетка созрела вовремя', 'встреча в узком окне', 'оплодотворение', 'зародыш закрепился']
def six(key, n):
    im, d = S.new('Минимум шесть событий в одном месяце')
    for i, t in enumerate(EV):
        y = 210 + i * 92; on = i < n; c = GN if on else GR
        d.rounded_rectangle((400, y - 34, 468, y + 34), 12, outline=c, width=5)
        if on: d.line([(414, y), (430, y + 18), (456, y - 18)], fill=GN, width=8)
        lab(d, (500, y), f'{i + 1}. {t}', 46, TXT if on else GR, 'lm')
    save(key, im, 'шесть событий')
six('bd_six_a', 2); six('bd_six_b', 4); six('bd_six_c', 6)

# ---------- 30. шанс за цикл: 100 кружков
def cycle(key, last):
  im, d = S.new('Шанс за один цикл: от 1/5 до 1/3', 'у здоровой пары, по разным исследованиям')
  cols = 20; r = 20
  for i in range(100):
    x = 960 - cols * 26 + (i % cols) * 52 + 26; y = 220 + (i // cols) * 52
    if i < 20: d.ellipse((x - r, y - r, x + r, y + r), fill=OR)
    elif i < 33: d.ellipse((x - r, y - r, x + r, y + r), outline=OR, width=5)
    else: d.ellipse((x - r, y - r, x + r, y + r), fill=GR)
  lab(d, (520, 560), '● 20 из 100 — нижняя оценка', 36, OR); lab(d, (1400, 560), '○ до 33 из 100 — верхняя', 36, OR)
  if last: lab(d, (W / 2, 660), 'чаще нет, чем да — и это норма', 46)
  save(key, im, 'шанс за цикл')
cycle('bd_cycle_a', False); cycle('bd_cycle', True)

# ---------- 31. кубик: два броска, хотя бы одна шестёрка
im, d = S.new('Один месяц ≈ два броска кубика', 'нужна хотя бы одна шестёрка')
def die(x, y, s, n, col=TXT):
    d.rounded_rectangle((x - s, y - s, x + s, y + s), int(s * 0.25), fill=col)
    P = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)], 4: [(-1, -1), (1, -1), (-1, 1), (1, 1)], 5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)], 6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}[n]
    for u, v in P: cx, cy = x + u * s * 0.5, y + v * s * 0.5; rr = s * 0.13; d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=BG)
im2 = im.copy(); d2 = ImageDraw.Draw(im2); _d = d; d = d2
die(760, 400, 120, 6); die(1160, 400, 120, 3); lab(d, (W / 2, 640), 'бросаем дважды: выпадет ли хоть одна шестёрка?', 44)
save('bd_dice_a', im2, 'два броска'); d = _d
die(330, 330, 95, 6); die(560, 330, 95, 3)
lab(d, (445, 520), 'шанс ≈ 1/3', 56, OR)
x0, y0, st = 920, 170, 86
for a in range(6):
    lab(d, (x0 + a * st + st / 2, y0 - 25), str(a + 1), 30, SUB); lab(d, (x0 - 30, y0 + a * st + st / 2), str(a + 1), 30, SUB)
    for b in range(6):
        hit = a == 5 or b == 5; d.rectangle((x0 + b * st + 4, y0 + a * st + 4, x0 + (b + 1) * st - 4, y0 + (a + 1) * st - 4), fill=OR if hit else GR)
lab(d, (x0 + 3 * st, y0 + 6 * st + 40), '11 из 36 исходов ≈ 31 %', 40, OR)
save('bd_dice', im, 'два броска кубика')

# ---------- 32. возраст (форма условная, без чисел по оси Y)
def age(key, men):
    im, d = S.new('Шанс за цикл и возраст', 'форма условная: общая закономерность по группам, не про конкретного человека')
    x0, x1, yb, yt = 300, 1640, 640, 220; X = lambda a: x0 + (x1 - x0) * (a - 20) / 25
    d.line((x0, yb, x1, yb), fill=SUB, width=4); d.line((x0, yb, x0, yt - 20), fill=SUB, width=4)
    for a in range(20, 46, 5): d.line((X(a), yb - 8, X(a), yb + 10), fill=SUB, width=3); lab(d, (X(a), yb + 40), str(a), 32, SUB)
    lab(d, (x1 + 20, yb + 40), 'лет', 32, SUB, 'lm')
    w = [(a, yt + 20 if a <= 32 else yt + 20 + (a - 32) ** 1.6 * 5) for a in [20 + k * 0.5 for k in range(51)]]
    d.line([(X(a), y) for a, y in w], fill=OR, width=8); lab(d, (X(26), yt - 20), 'женщины: выше всего в 20-е и начале 30-х', 36, OR)
    if men:
        m = [(a, yt + 60 + (a - 20) * 3.2) for a in [20 + k for k in range(26)]]
        for k in range(0, len(m) - 1, 2): d.line([(X(m[k][0]), m[k][1]), (X(m[k + 1][0]), m[k + 1][1])], fill=BL, width=8)
        lab(d, (X(42), m[-1][1] - 60), 'мужчины: мягче', 36, BL)
    save(key, im, 'возраст')
age('bd_age_w', False); age('bd_age_wm', True)

# ---------- 33. путь к имплантации
im, d = S.new('Несколько дней пути — и имплантация', 'схема, не в масштабе')
y = 400
for i, (n, x) in enumerate(((1, 250), (2, 520), (4, 790), (8, 1060))):
    R = 70; d.ellipse((x - R, y - R, x + R, y + R), outline=OR, width=6)
    k = int(math.sqrt(n) + 0.99); rr = R / (k + 0.4) * 0.9
    for j in range(n):
        cx = x + ((j % k) - (k - 1) / 2) * rr * 1.9; cy = y + ((j // k) - (math.ceil(n / k) - 1) / 2) * rr * 1.9; d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(150, 105, 40))
    if i < 3: d.line((x + 90, y, x + 180, y), fill=SUB, width=5); d.polygon([(x + 196, y), (x + 172, y - 14), (x + 172, y + 14)], fill=SUB)
lab(d, (655, 520), 'клетка делится и плывёт к матке', 38, OR)
d.line((1250, y, 1340, y), fill=SUB, width=5); d.polygon([(1356, y), (1332, y - 14), (1332, y + 14)], fill=SUB)
d.rectangle((1420, 240, 1460, 600), fill=GR); d.ellipse((1380, 360, 1460, 440), fill=(150, 105, 40))
lab(d, (1560, 330), 'стенка', 38, SUB, 'lm'); lab(d, (1560, 380), 'матки', 38, SUB, 'lm'); lab(d, (1440, 660), 'имплантация', 42, YL)
save('bd_implant', im, 'путь к имплантации')

# ---------- 34. без вины
im, d = S.new('Ранние потери')
for i, t in enumerate(('случаются часто', 'не зависят ни от чьих действий', 'виноватых нет')):
    lab(d, (W / 2, 280 + i * 110), t, 58, OR if i == 2 else TXT)
lab(d, (W / 2, 660), 'это общая картина, а не диагноз', 40, SUB)
save('bd_no_fault', im, 'ранние потери')

# ---------- 35. год попыток
im, d = S.new('Бесплодие: так называют…')
for k in range(12):
    x = 260 + k * 128; d.rounded_rectangle((x - 54, 290, x + 54, 400), 16, outline=BL, width=4); lab(d, (x, 345), str(k + 1), 40, BL)
lab(d, (W / 2, 470), '…отсутствие беременности после года попыток', 48)
lab(d, (W / 2, 590), '12 месяцев', 44, BL)
save('bd_year', im, 'год попыток')

# ---------- 36. каждый шестой
im, d = S.new('С бесплодием сталкивается примерно каждый шестой', 'оценка ВОЗ, 2023: ≈ 17,5 % взрослых за жизнь')
for i in range(6): person(d, 410 + i * 220, 480, 2.4, OR if i == 2 else GR)
save('bd_one_in6', im, 'каждый шестой')

# ---------- 37. к врачу — нормально
im, d = S.new('Если не получилось')
lab(d, (W / 2, 330), 'причины бывают разные', 58)
lab(d, (W / 2, 470), 'обратиться к врачу — совершенно нормально', 58, GN)
save('bd_doctor', im, 'если не получилось')

# ---------- 38. как устроен микроскоп Левенгука (схема)
im, d = S.new('Микроскоп Левенгука: схема', 'держали у самого глаза; не в масштабе')
d.rounded_rectangle((760, 180, 1000, 720), 26, fill=(150, 150, 160)); d.ellipse((866, 326, 894, 354), fill=BG); d.ellipse((870, 330, 890, 350), fill=(150, 200, 240))
lab(d, (720, 250), 'крошечная линза', 40, BL, 'rm'); d.line((700, 275, 866, 334), fill=BL, width=3)
d.line((1060, 340, 1060, 640), fill=SUB, width=8); d.ellipse((1048, 326, 1072, 352), fill=OR)
lab(d, (1100, 300), 'образец на игле', 40, OR, 'lm')
lab(d, (1100, 520), 'винты наводки', 36, SUB, 'lm'); d.line((1000, 600, 1060, 600), fill=SUB, width=6); d.line((1000, 520, 1060, 520), fill=SUB, width=6)
lab(d, (720, 600), 'металлическая', 40, TXT, 'rm'); lab(d, (720, 650), 'пластинка', 40, TXT, 'rm')
d.ellipse((260, 300, 380, 380), outline=TXT, width=5); d.ellipse((304, 324, 336, 356), fill=TXT); lab(d, (320, 430), 'глаз', 36, SUB); d.line((385, 340, 755, 340), fill=GR, width=2)
save('bd_lw_scheme', im, 'схема микроскопа Левенгука')

# ---------- 39. преформизм: человек в человеке
im, d = S.new('Идея конца XVII века: «человек в человеке»', 'так думали тогда; это оказалось неверным')
for i, s in enumerate((2.0, 1.45, 1.0, 0.65, 0.4)):
    c = [BL, OR, BL, OR, BL][i]; x, y = 960, 450
    d.ellipse((x - 40 * s, y - 120 * s - 40 * s, x + 40 * s, y - 120 * s + 40 * s), outline=c, width=5)
    d.rounded_rectangle((x - 60 * s, y - 75 * s, x + 60 * s, y + 90 * s), int(30 * s), outline=c, width=5)
lab(d, (W / 2, 715), 'все люди якобы заранее вложены друг в друга, как матрёшки', 38)
save('bd_preform', im, 'преформизм')

# ---------- 40. хронология
im, d = S.new('Как узнали, откуда берутся люди')
d.line((200, 430, 1720, 430), fill=SUB, width=6)
for x, y1, y2, c in ((330, '1677', 'Левенгук видит', BL), (960, 'конец XVII в.', 'рисунок «человечка»', OR), (1590, 'XIX век', 'встреча двух клеток', GN)):
    d.ellipse((x - 18, 412, x + 18, 448), fill=c); lab(d, (x, 340), y1, 52, c); lab(d, (x, 520), y2, 38)
lab(d, (330, 570), '«существ с хвостами»', 38)
lab(d, (1590, 570), 'увидели под микроскопом', 38)
save('bd_history', im, 'хронология')

# ---------- 41. зачатие — встреча двух клеток
im, d = S.new('Зачатие — это встреча двух клеток', 'XIX век: учёные увидели, как сперматозоид входит в яйцеклетку')
sperm(d, 500, 420, 1.8, 0, BL); lab(d, (380, 560), 'сперматозоид', 40, BL)
lab(d, (680, 420), '+', 90, SUB); egg(d, 900, 420, 115, OR); lab(d, (900, 590), 'яйцеклетка', 40, OR)
lab(d, (1120, 420), '→', 90, SUB); egg(d, 1420, 420, 115, YL); d.ellipse((1380, 395, 1420, 445), fill=BL); lab(d, (1420, 590), 'оплодотворённая клетка', 40, YL)
save('bd_two_cells', im, 'встреча двух клеток')

# ---------- 42. цепочка предков
def chain(key, title, note, last):
    im, d = S.new(title, note); n = 24
    pts = [(150 + i * (1620 / (n - 1)), 430 + 110 * math.sin(i * 0.45)) for i in range(n)]
    d.line(pts, fill=SUB, width=4)
    for i, (x, y) in enumerate(pts):
        c = OR if i == n - 1 else BL; d.ellipse((x - 24, y - 24, x + 24, y + 24), fill=c)
    lab(d, (pts[0][0] + 10, pts[0][1] - 80), '…', 60, SUB); lab(d, (pts[-1][0] - 10, pts[-1][1] + 75), last, 44, OR)
    lab(d, (W / 2, 700), 'ни одно звено не осталось без детей', 44, TXT)
    save(key, im, title)
chain('bd_chain', 'Непрерывная цепочка предков', 'не меньше 12 000 поколений подряд (грубый расчёт)', 'вы')
im, d = S.new('Кто в вашей семье дальше всех?', 'напишите в комментариях')
n = 24; pts = [(150 + i * (1620 / (n - 1)), 430 + 110 * math.sin(i * 0.45)) for i in range(n)]
d.line(pts, fill=SUB, width=4)
for i, (x, y) in enumerate(pts): d.ellipse((x - 24, y - 24, x + 24, y + 24), fill=OR if i == n - 1 else (YL if i == n - 5 else (BL if i > n - 5 else DIM)))
lab(d, (pts[n - 5][0], pts[n - 5][1] - 80), '?', 70, YL); lab(d, (pts[-1][0] - 10, pts[-1][1] + 75), 'вы', 44, OR)
lab(d, (W / 2, 690), 'о ком из предков вам что-то рассказывали?', 44)
save('bd_chain_far', im, 'кто дальше всех')

# ---------- 43. расчёт поколений
im, d = S.new('Откуда 12 000 поколений', 'грубый расчёт; длина поколения — допущение')
lab(d, (W / 2, 280), '≈ 300 000 лет', 80, BL); lab(d, (W / 2, 350), 'возраст древнейших находок нашего вида', 36, SUB)
lab(d, (W / 2, 440), '÷ ≈ 25 лет на поколение', 60, TXT)
d.line((560, 500, 1360, 500), fill=SUB, width=4)
lab(d, (W / 2, 580), '≈ 12 000 поколений', 84, OR)
save('bd_calc', im, 'расчёт поколений')

# ---------- 44. «1 из 400 триллионов»
im, d = S.new('«Один из 400 триллионов»', 'игра с допущениями: итог прыгает на порядки, строгого измерения нет')
lab(d, (W / 2, 340), '1 / 400 000 000 000 000', 100, YL)
lab(d, (W / 2, 470), 'популярная оценка вероятности вашего рождения', 42, TXT)
d.line((420, 300, 1500, 390), fill=RD, width=0)
save('bd_400t', im, 'один из 400 триллионов')

# ---------- 45. звенья цепи
im, d = S.new('Ни одно звено не было гарантировано')
for i in range(8):
    x = 230 + i * 210; y = 430 + (0 if i % 2 else 0)
    if i % 2 == 0: d.rounded_rectangle((x - 110, y - 60, x + 110, y + 60), 60, outline=BL, width=14)
    else: d.rounded_rectangle((x - 110, y - 22, x + 110, y + 22), 22, outline=SUB, width=12)
    lab(d, (x, y), '?', 50, YL)
save('bd_links', im, 'звенья цепи')

# ---------- 46. три масштаба (по нарастанию)
SC = [('один бегун', 'шанс ничтожный', SUB), ('один месяц', 'примерно ¼', OR), ('один год', '8–9 из 10 здоровых пар', BL)]
def scales(key, n):
    im, d = S.new('Почти невозможно? Зависит от масштаба')
    for i, (a, b, c) in enumerate(SC):
        x = 360 + i * 600; on = i < n; cc = c if on else DIM
        d.rounded_rectangle((x - 270, 230, x + 270, 650), 30, outline=cc, width=5)
        lab(d, (x, 320), a, 50, cc if on else GR)
        if on:
            for j, ln in enumerate(b.split(' здоровых ')): lab(d, (x, 460 + j * 70), ln if j == 0 else 'здоровых ' + ln, fit(d, ln, 62 if j == 0 else 40, 500), TXT)
    save(key, im, 'три масштаба')
scales('bd_scale_a', 1); scales('bd_scale_b', 2); scales('bd_scale_c', 3)

# ---------- 47. природа не ставит на одну попытку
im, d = S.new('Природа не ставит на одну попытку')
for i, (a, b, c) in enumerate((('миллионы', 'бегунов в месяц', BL), ('запасные дни', 'в окне ≈ 6 дней', OR), ('много месяцев', 'подряд', GN))):
    x = 360 + i * 600; d.rounded_rectangle((x - 270, 250, x + 270, 610), 30, outline=c, width=5); lab(d, (x, 390), a, fit(d, a, 60, 500), c); lab(d, (x, 490), b, 40)
save('bd_reserves', im, 'запас попыток')

# ---------- 48. ответ
im, d = S.new('Ответ')
rows = [('≥ 6 событий', 'должны совпасть в одном месяце', OR), ('один месяц', 'чаще заканчивается без результата', SUB), ('много попыток', 'запасные дни и много месяцев', BL)]
for i, (a, b, c) in enumerate(rows):
    y = 260 + i * 150; lab(d, (700, y), a, 56, c, 'rm'); lab(d, (760, y), b, 44, TXT, 'lm')
lab(d, (W / 2, 720), 'терпеливая статистика: без чудес и без приговоров', 42, GN)
save('bd_answer', im, 'ответ')

print('ok', len(S.new_keys), 'схем')
