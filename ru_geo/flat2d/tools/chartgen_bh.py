#!/usr/bin/env python3
"""диаграммы высот для building_height (собственная графика)"""
import json, os
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/sofia-studio/ru_geo'; J = f'{R}/building_height'; os.makedirs(f'{J}/archive/img', exist_ok=True)
W, H = 1920, 1080; BG = (14, 14, 17); TXT = (240, 240, 240)
def font(sz):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
def chart(items, title, sub, out, hi=()):
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im); mx = max(v for _, v in items); base = H - 330; top = 200; n = len(items); bw = 120; gap = (W - 200 - n * bw) / max(1, n - 1) if n > 1 else 0
    d.text((W / 2, 70), title, font=font(60), fill=TXT, anchor='mm')
    for i, (nm, v) in enumerate(items):
        x = 100 + i * (bw + gap); h = (base - top) * v / mx; col = (240, 170, 60) if nm in hi else (90, 170, 230)
        d.rectangle((x, base - h, x + bw, base), fill=col); d.text((x + bw / 2, base - h - 36), f'{v:,} м'.replace(',', ' '), font=font(34), fill=TXT, anchor='mm')
        d.text((x + bw / 2, base + 45), nm, font=font(26), fill=(210, 210, 215), anchor='mm')
    d.text((W / 2, H - 230), sub, font=font(32), fill=(170, 170, 178), anchor='mm'); im.save(out, quality=92)
OUT = {}
def save(key, fn, cap, build):
    build(f'{J}/archive/img/{fn}'); OUT[key] = dict(file=fn, author='собственная графика', license='свободно', cap=cap, page='', title=cap)
save('heights_main', 'heights_main.jpg', 'Высоты зданий', lambda p: chart([('Эйфелева', 330), ('Эмпайр', 443), ('Тайбэй 101', 508), ('Бурдж-Халифа', 828), ('Джидда (проект)', 1000)], 'Как высоки здания', 'Джидда-тауэр: проект 1 000 м, достроена лишь часть', p, ('Бурдж-Халифа',)))
save('heights_wright', 'heights_wright.jpg', 'Миля Райта и Бурдж-Халифа', lambda p: chart([('Бурдж-Халифа', 828), ('Джидда (проект)', 1000), ('Миля Райта (проект 1956)', 1609)], 'Миля Райта: 1 609 метров', 'Проект Фрэнка Ллойда Райта 1956 года, так и не построен', p, ('Миля Райта (проект 1956)',)))
save('heights_old', 'heights_old.jpg', 'Рекорды высоты', lambda p: chart([('Эйфелева (1889)', 330), ('Эмпайр (1931)', 443), ('Тайбэй 101 (2004)', 508), ('Бурдж-Халифа (2010)', 828)], 'Рекорды высоты по годам', 'Каждый рекорд выше предыдущего, но не вдвое', p, ('Бурдж-Халифа (2010)',)))
cp = f'{J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')) if os.path.exists(cp) else {}
cr.update(OUT); json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1); print('ok', len(OUT))
