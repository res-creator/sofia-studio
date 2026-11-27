#!/usr/bin/env python3
"""графики для usa_food (собственная графика; только цифры из сценария)"""
import json, os, math
from PIL import Image, ImageDraw, ImageFont
J = '/home/user/sofia-studio/ru_geo/usa_food'; os.makedirs(f'{J}/archive/img', exist_ok=True)
W, H = 1920, 1080; BG = (14, 14, 17); TXT = (240, 240, 240); OR = (240, 170, 60); BL = (90, 170, 230); GR = (60, 64, 76); SUB = (170, 170, 178)
def font(sz): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', sz)
OUT = {}
def base(title, sub): im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im); d.text((W / 2, 80), title, font=font(60), fill=TXT, anchor='mm'); d.text((W / 2, H - 165), sub, font=font(32), fill=SUB, anchor='mm'); return im, d
def reg(key, im): fn = key + '.jpg'; im.save(f'{J}/archive/img/{fn}', quality=92); OUT[key] = dict(file=fn, author='собственная графика', license='свободно', cap='', page='', title=key)
def dots(key, title, n, sub, big):
    im, d = base(title, sub); cols = 20; r = 20; x0 = (W - cols * 2 * (r + 6)) / 2
    for i in range(100):
        x = x0 + (i % cols) * 2 * (r + 6) + r; y = 230 + (i // cols) * 2 * (r + 6) + r; d.ellipse((x - r, y - r, x + r, y + r), fill=OR if i < n else GR)
    d.text((W / 2, 690), big, font=font(110), fill=OR, anchor='mm'); reg(key, im)
dots('uf_obesity', 'Взрослые американцы', 40, 'из каждых 100 взрослых', '40 из 100 с ожирением')
dots('uf_diabetes', 'Диабет в США', 12, 'из каждых 100 американцев', '12 из 100 с диабетом')
dots('uf_ultra', 'Ультрапереработанная еда', 55, 'из каждых 100 калорий', '55 из 100 калорий')
def bars(key, title, items, sub, unit=''):
    im, d = base(title, sub); mx = max(v for _, v, _ in items); n = len(items); bw = 300; gap = 220; x0 = (W - n * bw - (n - 1) * gap) / 2
    for i, (nm, v, col) in enumerate(items):
        x = x0 + i * (bw + gap); h = 520 * v / mx; d.rectangle((x, 790 - h, x + bw, 790), fill=col); d.text((x + bw / 2, 740 - h), f'{v}{unit}', font=font(64), fill=TXT, anchor='mm'); d.text((x + bw / 2, 850), nm, font=font(36), fill=SUB, anchor='mm')
    reg(key, im)
bars('uf_bun', 'Булочка: было и стало', [('было', 140, BL), ('стало', 350, OR)], 'калорий в одной булочке', ' ккал')
bars('uf_drinks', 'Покупки напитков после мер', [('до', 100, BL), ('после', 76, OR)], 'условно 100 = до пакета мер; упали на 24%', '')
bars('uf_extra', 'Лишние калории', [('в день', 500, OR)], 'в среднем съедали лишними', ' ккал')
im, d = base('17 ложек сахара в день', 'Расчёт по сценарию: показано 17 ложек'); 
for i in range(17):
    x = 250 + (i % 9) * 170; y = 300 + (i // 9) * 230; d.rounded_rectangle((x, y, x + 120, y + 160), 14, fill=(235, 235, 235)); d.ellipse((x + 20, y + 20, x + 100, y + 70), fill=(255, 255, 255))
reg('uf_sugar', im)
im, d = base('Школьный обед', 'школьников получают обед по программе'); d.text((W / 2, 480), '30 млн', font=font(200), fill=OR, anchor='mm'); reg('uf_school', im)
cp = f'{J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')) if os.path.exists(cp) else {}
cr.update(OUT); json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1); print('ok', len(OUT))
