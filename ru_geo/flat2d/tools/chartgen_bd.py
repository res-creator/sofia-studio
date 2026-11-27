#!/usr/bin/env python3
"""инфографика для becoming_dad (собственная графика, только цифры из сценария)"""
import json, os
from PIL import Image, ImageDraw, ImageFont
J = '/home/user/sofia-studio/ru_geo/becoming_dad'; os.makedirs(f'{J}/archive/img', exist_ok=True)
W, H = 1920, 1080; BG = (14, 14, 17); TXT = (240, 240, 240); OR = (240, 170, 60); BL = (90, 170, 230); GR = (170, 170, 178)
def font(sz): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', sz)
def base(title): im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im); d.text((W / 2, 80), title, font=font(62), fill=TXT, anchor='mm'); return im, d
OUT = {}
def reg(key, fn, cap, im): im.save(f'{J}/archive/img/{fn}', quality=92); OUT[key] = dict(file=fn, author='собственная графика', license='свободно', cap='', page='', title=cap)
# 1. старт: диапазон
im, d = base('Сколько бегунов на старте'); 
for i, (nm, v, col) in enumerate((('нижняя граница порции', 39, BL), ('чаще всего называют', 300, OR))):
    x = 420 + i * 700; h = 560 * v / 300; d.rectangle((x, 790 - h, x + 300, 790), fill=col); d.text((x + 150, 740 - h), f'{v} млн', font=font(56), fill=TXT, anchor='mm'); d.text((x + 150, 850), nm, font=font(34), fill=GR, anchor='mm')
d.text((W / 2, 960), 'В одной порции: от десятков миллионов до нескольких сотен миллионов', font=font(32), fill=GR, anchor='mm'); reg('start_range', 'start_range.jpg', 'старт', im)
# 2. окно: 6 дней
im, d = base('Окно: шесть дней перед овуляцией'); xs = 260; hs = [160, 215, 270, 330, 410, 520]
for i, h in enumerate(hs):
    x = xs + i * 235; col = OR if i == 5 else BL; d.rectangle((x, 800 - h, x + 170, 800), fill=col); d.text((x + 85, 850), f'−{5 - i}' if i < 5 else 'овуляция', font=font(30), fill=GR, anchor='mm')
d.text((xs + 85, 800 - hs[0] - 40), '≈ 10 %', font=font(40), fill=TXT, anchor='mm'); d.text((xs + 5 * 235 + 85, 800 - hs[5] - 40), 'до трети', font=font(40), fill=TXT, anchor='mm')
d.text((W / 2, 960), 'Форма условная: показаны крайние значения, шанс растёт к овуляции', font=font(30), fill=GR, anchor='mm'); reg('window_chart', 'window_chart.jpg', 'окно', im)
# 3. шансы
im, d = base('Шанс: цикл и год')
for i, (big, sub, col) in enumerate((('1/5–1/3', 'шанс за один цикл', OR), ('8–9 из 10', 'здоровых пар за год', BL))):
    x = 480 + i * 960; d.rounded_rectangle((x - 400, 300, x + 400, 760), 30, outline=col, width=5); d.text((x, 480), big, font=font(120), fill=col, anchor='mm'); d.text((x, 640), sub, font=font(44), fill=TXT, anchor='mm')
d.text((W / 2, 960), 'Оценки по исследованиям; зависят от возраста', font=font(32), fill=GR, anchor='mm'); reg('odds_cards', 'odds_cards.jpg', 'шансы', im)
# 4. предки
im, d = base('Цепочка предков'); import math
n = 24
for i in range(n):
    x = 140 + i * 74; y = 520 + 90 * math.sin(i / 3); d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=BL if i < n - 1 else OR)
    if i: d.line((x - 74 + 26, 520 + 90 * math.sin((i - 1) / 3), x - 26, y), fill=GR, width=4)
d.text((W / 2, 760), '12 000 поколений', font=font(90), fill=TXT, anchor='mm'); d.text((W / 2, 850), 'ни одно не осталось без детей', font=font(40), fill=GR, anchor='mm'); reg('ancestors', 'ancestors.jpg', 'предки', im)
# 5. 1677
im, d = base('Левенгук и микроскоп'); d.line((260, 560, 1660, 560), fill=GR, width=6)
for x, y, t in ((260, 1677, 'микроскоп Левенгука'), (1660, 2026, 'сегодня')):
    d.ellipse((x - 18, 542, x + 18, 578), fill=OR); d.text((x, 640), str(y), font=font(60), fill=TXT, anchor='mm'); d.text((x, 710), t, font=font(32), fill=GR, anchor='mm')
d.text((W / 2, 440), 'почти 350 лет с первого наблюдения', font=font(48), fill=BL, anchor='mm'); reg('leeuwenhoek_1677', 'leeuwenhoek_1677.jpg', '1677', im)
cp = f'{J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')) if os.path.exists(cp) else {}
cr.update(OUT); json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1); print('ok', len(OUT))
