import sys, math, random; sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools'); from dg import *
S = Slug('universe_size')
# 1. сколько идёт свет (логарифмическая шкала, подписи не обрезаются)
im, d = S.new('Сколько идёт свет', 'радиосигнал это тот же свет, только невидимый; шкала логарифмическая')
rows = [('до Луны', '1,3 секунды', 1.3), ('до Солнца', '8 мин 20 с', 500), ('до Нептуна', '≈ 4 часа', 14400), ('до Вояджера', '≈ 1 сутки', 86400)]
for i, (a, b, v) in enumerate(rows):
    y = 250 + i * 120; w = 780 * (math.log10(v) + 0.3) / (math.log10(86400) + 0.3); lab(d, (560, y), a, 40, SUB, 'rm'); d.rectangle((580, y - 32, 580 + w, y + 32), fill=OR if i == 3 else BL); lab(d, (580 + w + 20, y), b, 44, TXT, 'lm')
S.save('ruler_light', im)
# 2. линейка целиком: логарифмическая шкала (годы)
im, d = S.new('Линейка целиком', 'шкала логарифмическая: каждая ступень в десятки или десятки тысяч раз длиннее')
L = [('сутки света', 1 / 365, 'сутки'), ('до ближайшей звезды', 4.2, '4,2 года'), ('диск галактики', 1e5, '100 000 лет'), ('до Андромеды', 2.5e6, '2,5 млн лет'), ('видимая Вселенная', 9.3e10, '93 млрд лет')]
lo, hi = math.log10(1 / 365), math.log10(9.3e10)
for i, (nm, v, lb) in enumerate(L):
    y = 250 + i * 100; w = 120 + 740 * (math.log10(v) - lo) / (hi - lo); lab(d, (600, y), nm, 34, TXT, 'rm'); d.rectangle((620, y - 28, 620 + w, y + 28), fill=OR if i == 0 else BL); lab(d, (620 + w + 18, y), lb, 34, SUB, 'lm')
S.save('ruler_all', im)
# 3. три ступени (условно)
im, d = S.new('Три ступени линейки', 'высоты условные: ступени отличаются в десятки и в десятки тысяч раз')
for i, s in enumerate(['звезда', 'галактика', 'группа галактик']):
    x = 260 + i * 470; h = 140 + i * 120; d.rectangle((x, 640 - h, x + 410, 640), fill=[BL, OR, YL][i]); lab(d, (x + 205, 640 - h // 2), s, fit(d, s, 40, 380), (14, 14, 17))
S.save('ladder3', im)
# 4. возраст Вселенной
im, d = S.new('Возраст Вселенной', 'около 13,8 миллиарда лет'); d.line((260, 450, 1660, 450), fill=SUB, width=6)
for x, tt, c, up in ((260, 'начало', TXT, 0), (260 + 1400 * 0.07, 'первые галактики', BL, 1), (260 + 1400 * 0.67, 'Земля: 4,5 млрд лет назад', OR, 0), (1660, 'сегодня', YL, 1)):
    d.ellipse((x - 14, 436, x + 14, 464), fill=c); lab(d, (x, 380 if up else 530), tt, fit(d, tt, 32, 380), c)
lab(d, (W / 2, 640), 'свет далёких галактик вышел в путь, когда Земли ещё не было', 38); S.save('timeline_age', im)
# 5. «пока не знаем»
im, d = S.new('Размер всей Вселенной'); cx, cy = W // 2, 400
d.ellipse((cx - 420, cy - 270, cx + 420, cy + 270), outline=GR, width=3); d.ellipse((cx - 170, cy - 100, cx + 170, cy + 100), outline=BL, width=5)
lab(d, (cx, cy - 20), 'видимая часть', 36, BL); lab(d, (cx, cy + 30), 'около 93 млрд св. лет', 30, SUB); lab(d, (cx + 300, cy - 190), '?', 140, OR); lab(d, (cx, 740), 'вся Вселенная: «пока не знаем»', 46, YL); S.save('unknown_all', im)
# 6. наблюдаемая Вселенная
im, d = S.new('Наблюдаемая Вселенная', 'радиус около 46 млрд световых лет, поперечник около 93 млрд (оценка)'); cx, cy = W // 2, 430
d.ellipse((cx - 300, cy - 300, cx + 300, cy + 300), outline=BL, width=5); d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=OR); lab(d, (cx, cy + 36), 'мы', 34, OR)
d.line((cx, cy, cx + 300, cy), fill=YL, width=4); lab(d, (cx + 150, cy - 34), '≈ 46 млрд', 34, YL); S.save('observable', im)
# 7. расширение пространства: два кадра с одной сеткой
im, d = S.new('Пока свет летел, пространство растягивалось', 'источник уходил всё дальше')
for x0, k, ttl in ((300, 1.0, 'было'), (1020, 1.6, 'стало')):
    for i in range(4):
        for j in range(4):
            x = x0 + i * 100 * k; y = 270 + j * 80 * k; d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=OR if (i, j) in ((0, 0), (3, 3)) else BL)
    lab(d, (x0 + 150 * k, 690), ttl, 44, SUB)
S.save('expand', im)
# 8. формы Вселенной: плоская, сфера, седло (сетка)
im, d = S.new('Какова форма Вселенной', 'пространство вокруг нас почти плоское, в пределах долей процента')
def proj(x, y, z, ox, oy): return (ox + (x - y) * 60, oy + (x + y) * 28 - z * 50)
def mesh(ox, oy, fz, col):
    n = 7
    for i in range(-n, n + 1, 2):
        pts = [proj(i / 3, j / 3, fz(i / 3, j / 3), ox, oy) for j in range(-n, n + 1)]; d.line(pts, fill=col, width=3)
        pts = [proj(j / 3, i / 3, fz(j / 3, i / 3), ox, oy) for j in range(-n, n + 1)]; d.line(pts, fill=col, width=3)
mesh(430, 420, lambda x, y: 0, BL); lab(d, (430, 640), 'плоская', 40, BL)
mesh(1500, 420, lambda x, y: 0.2 * (x * x - y * y), YL); lab(d, (1500, 640), 'седло', 40, YL)
d.ellipse((860, 270, 1060, 470), outline=OR, width=5); d.arc((860, 340, 1060, 400), 0, 180, fill=OR, width=3); lab(d, (960, 640), 'сфера', 40, OR); S.save('geometry3', im)
# 9. карта звёзд: Проксима в стороне от курса
im, d = S.new('Куда летит Вояджер', 'не к Проксиме, а в сторону звезды Глизе 445'); random.seed(7)
for _ in range(60): x = random.randint(200, 1720); y = random.randint(160, 720); d.ellipse((x, y, x + 3, y + 3), fill=(60, 64, 76))
sun = (520, 520); prox = (560, 650); gl = (1450, 290)
d.ellipse((sun[0] - 14, sun[1] - 14, sun[0] + 14, sun[1] + 14), fill=YL); lab(d, (sun[0] - 10, sun[1] - 40), 'Солнце', 32, YL)
d.ellipse((prox[0] - 8, prox[1] - 8, prox[0] + 8, prox[1] + 8), fill=BL); lab(d, (prox[0] + 30, prox[1] + 30), 'Проксима: 4,2 года', 30, BL, 'lm')
d.ellipse((gl[0] - 12, gl[1] - 12, gl[0] + 12, gl[1] + 12), fill=OR); lab(d, (gl[0], gl[1] - 44), 'Глизе 445: больше 17 св. лет', 32, OR)
d.line((sun[0], sun[1], gl[0] - 18, gl[1] + 8), fill=OR, width=5); lab(d, (980, 440), 'курс Вояджера-1', 34, OR); S.save('star_map', im)
print('ok')
