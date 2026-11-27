#!/usr/bin/env python3
"""схемы для «Размера Вселенной» (собственная графика; цифры только из сценария)"""
import json, math, os, random
from PIL import Image, ImageDraw, ImageFont
J = '/home/user/sofia-studio/ru_geo/universe_size'; IMG = f'{J}/archive/img'
W, H = 1920, 1080; BG = (14, 14, 17); TXT = (240, 240, 240); OR = (240, 170, 60); BL = (90, 170, 230); GR = (70, 74, 84); SUB = (175, 175, 182); YL = (255, 214, 64)
def F(sz): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', sz)
OUT = {}
def new(title, note=None):
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im); d.text((W / 2, 80), title, font=F(60), fill=TXT, anchor='mm')
    if note: d.text((W / 2, 760), note, font=F(34), fill=SUB, anchor='mm')
    return im, d
def reg(key, im, cap=''): im.save(f'{IMG}/{key}.jpg', quality=92); OUT[key] = dict(file=key + '.jpg', author='собственная графика', license='свободно', cap='', page='', title=cap or key)
def lab(d, xy, t, sz=36, col=TXT, anchor='mm'): d.text(xy, t, font=F(sz), fill=col, anchor=anchor)
# 1. вопрос поверх Ultra Deep Field
bg = Image.open(f'{IMG}/hudf.jpg').convert('RGB'); sc = max(W / bg.width, H / bg.height); bg = bg.resize((int(bg.width * sc), int(bg.height * sc))); l, t = (bg.width - W) // 2, (bg.height - H) // 2; bg = bg.crop((l, t, l + W, t + H))
ov = Image.new('RGB', (W, H), (0, 0, 0)); bg = Image.blend(bg, ov, 0.55); d = ImageDraw.Draw(bg); lab(d, (W / 2, 420), 'Какого размера', 120, YL); lab(d, (W / 2, 570), 'вся Вселенная?', 120, TXT); reg('q_universe', bg)
# 2. свет: сколько идёт до объектов (линейная шкала времени, логарифмическая)
im, d = new('Сколько идёт свет', 'радиосигнал это тот же свет, только невидимый'); rows = [('до Луны', '1,3 секунды', 1.3), ('до Солнца', '8 мин 20 с', 500), ('до Нептуна', '≈ 4 часа', 14400), ('до Вояджера', '≈ 1 сутки', 86400)]
mx = math.log10(86400) + 0.3
for i, (a, b, v) in enumerate(rows):
    y = 230 + i * 125; w = 1150 * (math.log10(v) + 0.3) / mx; lab(d, (130, y), a, 40, SUB, 'lm'); d.rectangle((520, y - 32, 520 + w, y + 32), fill=OR if i == 3 else BL); lab(d, (520 + w + 20, y), b, 44, TXT, 'lm')
d.text((W / 2, 880), 'шкала логарифмическая', font=F(28), fill=GR, anchor='mm'); reg('ruler_light', im)
# 3. скорость и дорога до звезды
im, d = new('Дорога до ближайшей звезды', 'наша прикидка по школьной формуле: расстояние делим на скорость')
for i, (big, sub, col) in enumerate((('17 км/с', 'скорость Вояджера', BL), ('≈ 75 000 лет', 'до ближайшей звезды', OR))):
    x = 480 + i * 960; d.rounded_rectangle((x - 420, 280, x + 420, 640), 30, outline=col, width=5); lab(d, (x, 420), big, 110, col); lab(d, (x, 560), sub, 42)
lab(d, (W / 2, 460), '→', 100, SUB); reg('speed_star', im)
# 4. модель: мяч и горошина
im, d = new('Уменьшим всё: Солнце это пляжный мяч'); d.rectangle((260, 300, 1660, 640), outline=(120, 170, 120), width=6); d.line((960, 300, 960, 640), fill=(120, 170, 120), width=4); d.ellipse((860, 400, 1060, 540), outline=(120, 170, 120), width=4)
d.ellipse((290, 410, 400, 520), fill=OR); lab(d, (345, 570), 'Солнце = пляжный мяч', 30, OR); d.ellipse((1612, 462, 1624, 474), fill=BL); lab(d, (1618, 570), 'Земля = горошина 9 мм', 30, BL)
d.line((420, 700, 1600, 700), fill=SUB, width=4); lab(d, (1010, 735), '≈ 100 метров', 44, TXT); d.text((W / 2, 830), 'футбольное поле, вид сверху', font=F(30), fill=SUB, anchor='mm'); reg('model_field', im)
# 5. модель: линейка расстояний
im, d = new('Линейка модели', 'Вояджер за 49 лет на этой модели: 19 километров'); pts = [(0.1, 'Земля', '100 м', BL), (19, 'Вояджер', '19 км', OR), (29000, 'Проксима', '29 000 км', TXT)]
d.line((220, 440, 1700, 440), fill=SUB, width=6)
for v, nm, lb, col in pts:
    x = 220 + 1480 * (math.log10(v) + 1.2) / 5.8; d.ellipse((x - 16, 424, x + 16, 456), fill=col); lab(d, (x, 360), nm, 44, col); lab(d, (x, 520), lb, 44, TXT)
d.text((W / 2, 640), 'шкала логарифмическая', font=F(28), fill=GR, anchor='mm'); reg('model_ruler', im)
# 6. световой год
im, d = new('Световой год', 'путь света за год')
d.rounded_rectangle((330, 230, 1590, 470), 30, outline=OR, width=5); lab(d, (W / 2, 320), '1 световой год', 70, OR); lab(d, (W / 2, 410), '≈ 9,5 триллиона километров', 56)
d.rounded_rectangle((330, 520, 1590, 700), 30, outline=BL, width=5); lab(d, (W / 2, 610), 'До Проксимы свет идёт чуть больше 4 лет', 48, BL); reg('lightyear', im)
# 7. карта соседних звёзд и курс Вояджера
im, d = new('Куда летит Вояджер', 'не к Проксиме, а в сторону звезды Глизе 445')
random.seed(7)
for _ in range(60): d.ellipse((lambda x, y: (x, y, x + 3, y + 3))(random.randint(200, 1720), random.randint(160, 720)), fill=(60, 64, 76))
sun = (520, 560); prox = (640, 470); gl = (1450, 300)
d.ellipse((sun[0] - 14, sun[1] - 14, sun[0] + 14, sun[1] + 14), fill=YL); lab(d, (sun[0], sun[1] + 40), 'Солнце', 32, YL)
d.ellipse((prox[0] - 8, prox[1] - 8, prox[0] + 8, prox[1] + 8), fill=BL); lab(d, (prox[0] + 110, prox[1] - 22), 'Проксима, 4,2 года', 30, BL)
d.ellipse((gl[0] - 12, gl[1] - 12, gl[0] + 12, gl[1] + 12), fill=OR); lab(d, (gl[0], gl[1] - 44), 'Глизе 445, больше 17 св. лет', 32, OR)
d.line((sun[0], sun[1], gl[0] - 20, gl[1] + 8), fill=OR, width=5); lab(d, (1000, 520), 'курс Вояджера-1', 34, OR); lab(d, (W / 2, 840), 'через 40 000 лет пройдёт от неё ближе чем на 2 световых года', 36); reg('star_map', im)
# 8. Млечный Путь сверху
im, d = new('Млечный Путь', 'диск шире 100 000 световых лет; сотни миллиардов звёзд'); cx, cy, R = 960, 460, 330
random.seed(3)
for arm in range(2):
    for i in range(1400):
        t = i / 1400; a = 3.4 * t * math.pi + arm * math.pi; r = 40 + R * t; x = cx + r * math.cos(a) + random.gauss(0, 14 + 20 * t); y = cy + 0.9 * (r * math.sin(a) + random.gauss(0, 14 + 20 * t)); c = int(120 + 120 * (1 - t)); d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(c, c, 220))
d.ellipse((cx - 55, cy - 50, cx + 55, cy + 50), fill=(255, 220, 150)); sx = cx + 26 / 50 * R * 0.95 + 20; d.ellipse((sx - 9, cy + 130 - 9, sx + 9, cy + 130 + 9), fill=OR); lab(d, (sx + 25, cy + 170), 'Солнце: 26 000 св. лет от центра', 30, OR, 'lm'); lab(d, (cx, 70 + 20), '', 10); d.line((cx - R - 40, cy + 380, cx + R + 40, cy + 380), fill=SUB, width=4); lab(d, (cx, cy + 410), '> 100 000 световых лет', 34, SUB); reg('milkyway_top', im)
# 9. галактика на модели: до Юпитера
im, d = new('Галактика на модели с мячом', 'почти как от настоящего Солнца до Юпитера'); d.ellipse((300, 380, 420, 500), fill=YL); lab(d, (360, 540), 'Солнце', 34, YL); d.ellipse((1500, 420, 1560, 480), fill=OR); lab(d, (1530, 540), 'Юпитер', 34, OR); d.line((420, 440, 1500, 440), fill=SUB, width=6); lab(d, (960, 380), '700 млн км', 70, TXT); lab(d, (960, 500), 'размер Млечного Пути на модели', 36, SUB); reg('model_galaxy', im)
# 10. Местная группа
im, d = new('Местная группа', 'больше пятидесяти галактик, которые держатся тяготением'); G = [(760, 470, 'Млечный Путь', YL, 70), (1360, 400, 'Андромеда: 2,5 млн св. лет', BL, 85), (1120, 590, 'Треугольник', SUB, 45), (610, 360, 'Магеллановы Облака', SUB, 28)]
d.ellipse((520, 250, 1520, 690), outline=GR, width=3)
for x, y, nm, col, r in G: d.ellipse((x - r, y - r // 2, x + r, y + r // 2), fill=col); lab(d, (x, y + r // 2 + 34), nm, 30, col)
reg('local_group', im)
# 11. ступени линейки
im, d = new('Ступени линейки', 'каждая ступень в десятки или тысячи раз длиннее предыдущей'); steps = ['звезда', 'галактика', 'группа галактик']
for i, s in enumerate(steps):
    x = 300 + i * 440; h = 120 + i * 130; d.rectangle((x, 640 - h, x + 380, 640), fill=[BL, OR, YL][i]); lab(d, (x + 190, 600 - h // 2 + 30), s, 40, (14, 14, 17))
reg('ladder3', im)
# 12. наблюдаемая Вселенная
im, d = new('Наблюдаемая Вселенная', 'радиус около 46 миллиардов световых лет, поперечник около 93 миллиардов'); cx, cy = W // 2, 440
for r, a in ((330, 0), (230, 1), (130, 2)): d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=[BL, (60, 110, 160), (50, 80, 110)][a], width=4)
d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=OR); lab(d, (cx, cy + 36), 'мы', 34, OR); d.line((cx, cy, cx + 330, cy), fill=YL, width=4); lab(d, (cx + 200, cy - 30), '46 млрд св. лет', 34, YL); lab(d, (cx, cy + 370), 'поперечник ≈ 93 млрд св. лет (оценка)', 38); reg('observable', im)
# 13. шкала времени
im, d = new('Возраст Вселенной', 'около 13,8 миллиарда лет'); d.line((260, 440, 1660, 440), fill=SUB, width=6)
for x, tt, c in ((260, 'начало', TXT), (260 + 1400 * 0.05, 'первые галактики', BL), (260 + 1400 * 0.67, 'Земля, 4,5 млрд лет назад', OR), (1660, 'сегодня', YL)):
    d.ellipse((x - 14, 426, x + 14, 454), fill=c); lab(d, (x, 520 if x < 800 else 380), tt, 32, c)
lab(d, (W / 2, 640), 'Свет далёких галактик вышел в путь, когда Земли ещё не было', 38); reg('timeline_age', im)
# 14. сравнение: 44 млрд против 13,8
im, d = new('Вояджеру лететь до Андромеды', 'зонд не успел бы, даже стартуй он в момент рождения Вселенной')
for i, (nm, v, col) in enumerate((('полёт Вояджера до Андромеды', 44, OR), ('возраст Вселенной', 13.8, BL))):
    y = 300 + i * 190; w = 1100 * v / 44; lab(d, (200, y - 55), nm, 36, SUB, 'lm'); d.rectangle((200, y - 25, 200 + w, y + 40), fill=col); lab(d, (200 + w + 20, y + 8), f'{v:g} млрд лет'.replace('.', ','), 44, TXT, 'lm')
reg('compare_44', im)
# 15. три геометрии
im, d = new('Какова форма Вселенной', 'пространство вокруг нас почти плоское, в пределах долей процента')
d.polygon([(220, 520), (780, 520), (860, 380), (300, 380)], outline=BL, width=5); lab(d, (540, 640), 'плоская', 38, BL)
d.ellipse((1040, 340, 1300, 600), outline=OR, width=5); d.arc((1040, 440, 1300, 500), 0, 180, fill=OR, width=3); lab(d, (1170, 640), 'сфера', 38, OR)
pts = [(1460 + i * 10, 460 + 70 * math.sin((i / 36) * math.pi * 2 - math.pi / 2) * 0.9) for i in range(37)]; d.line(pts, fill=YL, width=5); d.line([(1460, 400), (1820, 520)], fill=YL, width=4); lab(d, (1640, 640), 'седло', 38, YL); reg('geometry3', im)
# 16. горизонт в море
im, d = new('За горизонтом корабли не исчезают', 'мы их просто не видим; так и со Вселенной')
d.rectangle((0, 470, W, 640), fill=(20, 40, 70)); d.line((0, 470, W, 470), fill=SUB, width=3); d.polygon([(900, 470), (1000, 470), (980, 440), (920, 440)], fill=OR); d.line((950, 440, 950, 380), fill=OR, width=4); d.polygon([(950, 380), (950, 430), (1000, 430)], fill=TXT)
lab(d, (950, 330), 'корабль у самого горизонта', 34, OR); d.polygon([(1250, 470), (1350, 470), (1350, 480), (1250, 480)], fill=GR); lab(d, (1300, 520), 'уже за горизонтом', 30, SUB); reg('horizon', im)
# 17. итоговая линейка
im, d = new('Линейка целиком', 'каждая ступень в десятки или тысячи раз длиннее предыдущей'); L = [('сутки света', 1, 'сутки'), ('ближайшая звезда', 1.5, '4,2 года'), ('диск галактики', 5, '100 000 лет'), ('Андромеда', 6.4, '2,5 млн лет'), ('видимая Вселенная', 10, '93 млрд лет')]
for i, (nm, v, lb) in enumerate(L):
    y = 250 + i * 100; w = 120 + v * 105; d.rectangle((540, y - 28, 540 + w, y + 28), fill=OR if i == 0 else BL); lab(d, (520, y), nm, 34, TXT, 'rm'); lab(d, (540 + w + 18, y), lb, 34, SUB, 'lm')
reg('ruler_all', im)
# 18. «пока не знаем»
im, d = new('Размер всей Вселенной', 'на карте знаний это место подписано: «пока не знаем»'); cx, cy = W // 2, 440
d.ellipse((cx - 400, cy - 300, cx + 400, cy + 300), outline=GR, width=3); d.ellipse((cx - 150, cy - 110, cx + 150, cy + 110), outline=BL, width=5); lab(d, (cx, cy), 'видимая часть', 36, BL); lab(d, (cx, cy + 40), '≈ 93 млрд св. лет', 30, SUB); lab(d, (cx + 250, cy - 220), '?', 140, OR); lab(d, (cx, cy + 340), 'вся Вселенная: пока не знаем', 44, YL); reg('unknown_all', im)
# 19. расширение пространства
im, d = new('Пока свет летел, пространство растягивалось', 'источник уходил всё дальше')
for p, (x0, sc, ttl) in enumerate(((260, 1.0, 'было'), (1040, 1.9, 'стало'))):
    for i in range(5):
        for j in range(4): x = x0 + 70 + i * 110 * sc / 1.3; y = 290 + j * 110 * sc / 1.3; d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=OR if (i, j) == (4, 3) or (i, j) == (0, 0) else BL)
    lab(d, (x0 + 280, 700), ttl, 44, SUB)
reg('expand', im)
# 20. слова «квадриллион»
im, d = new('Условная прикидка', 'игра цифр: расширение пространства она не учитывает'); lab(d, (W / 2, 330), 'больше 1 квадриллиона лет', 76, OR); lab(d, (W / 2, 470), '≈ в 120 000 раз дольше возраста Вселенной', 48); lab(d, (W / 2, 600), 'чтобы пересечь видимую область', 40, SUB); reg('quadrillion', im)
cp = f'{J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')); cr.update(OUT); json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1); print('ok', len(OUT))
