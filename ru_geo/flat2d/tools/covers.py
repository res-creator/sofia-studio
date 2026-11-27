#!/usr/bin/env python3
"""обложки 1280x720 для всех роликов: ru_geo/<slug>/cover.jpg"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
R = '/home/user/sofia-studio/ru_geo'
def font(sz): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', sz)
SPEC = {
 'universe_size': ('archive/img/voyager_craft.jpg', ['ДО КРАЯ', 'ВСЕЛЕННОЙ?'], '93 МЛРД СВЕТОВЫХ ЛЕТ'),
 'country_sizes': ('archive/img/africa_vs_greenland.jpg', ['КАРТА', 'ВРЁТ'], 'АФРИКА БОЛЬШЕ ГРЕНЛАНДИИ В 14 РАЗ'),
 'remote_places': ('archive/img/tristan_aerial.jpg', ['СУША В', '2 688 КМ'], 'САМОЕ ОТДАЛЁННОЕ МЕСТО'),
 'deadly_places': ('archive/img/everest_summit.jpg', ['15–30', 'СЕКУНД'], '7 МЕСТ, ГДЕ НЕ ВЫЖИТЬ'),
 'building_height': ('archive/img/heights_main.jpg', ['ПРЕДЕЛ', '1 000 М?'], 'КАК ВЫСОКО МОЖНО ПОСТРОИТЬ'),
 'create_country': ('archive/img/sealand_tower.jpg', ['СВОЯ', 'СТРАНА?'], 'ПЛАТФОРМА В МОРЕ И 4 ГАЛОЧКИ'),
 'country_names': ('archive/img/old_world_map.jpg', ['ЧТО ЗНАЧИТ', 'ИМЯ СТРАНЫ?'], 'ЧАД = ОЗЕРО, АРГЕНТИНА = СЕРЕБРО'),
 'usa_food': ('archive/img/uf_obesity.jpg', ['ЕДА В', 'АМЕРИКЕ'], 'ЧТО С НЕЙ НЕ ТАК?'),
 'becoming_dad': ('archive/img/start_range.jpg', ['300 000 000', 'БЕГУНОВ'], 'ПОЧЕМУ ПОЧТИ НЕВОЗМОЖНО СТАТЬ ПАПОЙ'),
}
def text(d, xy, s, f, fill, outline=(0, 0, 0), w=6):
    x, y = xy
    for dx in range(-w, w + 1, 2):
        for dy in range(-w, w + 1, 2): d.text((x + dx, y + dy), s, font=f, fill=outline)
    d.text(xy, s, font=f, fill=fill)
for slug, (img, lines, sub) in SPEC.items():
    p = f'{R}/{slug}/{img}'
    if not os.path.exists(p): print('нет', slug); continue
    bg = Image.open(p).convert('RGB'); sc = max(1280 / bg.width, 720 / bg.height); bg = bg.resize((int(bg.width * sc), int(bg.height * sc))); l, t = (bg.width - 1280) // 2, (bg.height - 720) // 2; bg = bg.crop((l, t, l + 1280, t + 720))
    bg = ImageEnhance.Brightness(bg).enhance(0.7); ov = Image.new('RGB', (1280, 720), (0, 0, 0)); mask = Image.linear_gradient('L').rotate(90, expand=True).transpose(Image.FLIP_LEFT_RIGHT).resize((1280, 720)); bg = Image.composite(ov, bg, mask.point(lambda v: int(v * 0.6)))
    d = ImageDraw.Draw(bg); y = 90
    for i, ln in enumerate(lines):
        sz = 150 if len(ln) <= 8 else 118 if len(ln) <= 11 else 92; f = font(sz); text(d, (60, y), ln, f, (255, 214, 64) if i == 0 else (255, 255, 255)); y += sz + 10
    text(d, (60, 600), sub, font(40), (230, 230, 235), w=4); bg.save(f'{R}/{slug}/cover.jpg', quality=92); print('ok', slug)
