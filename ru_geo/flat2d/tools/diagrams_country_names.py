#!/usr/bin/env python3
"""Собственные схемы и карты для ролика «Что на самом деле значат названия стран» (country_names).
Все факты из SCRIPT.md / RESEARCH.md; внешние числа (площади, население) подписаны источником.
Границы стран: johan/world.geo.json (открытые данные). Запуск: python3 tools/diagrams_country_names.py"""
import sys, json, math, os
sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools')
from dg import *
from PIL import Image, ImageDraw, ImageFont

S = Slug('country_names')
OCEAN = (20, 30, 46); LAND = (62, 66, 76); DIM = (110, 112, 120)
def FJ(sz): return ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', sz)
GEO = 'собственная графика, данные границ: johan/world.geo.json'

def wrap(d, t, sz, maxw):
    out, cur = [], ''
    for w in t.split():
        c = (cur + ' ' + w).strip()
        if d.textlength(c, font=F(sz)) <= maxw: cur = c
        else: out.append(cur); cur = w
    if cur: out.append(cur)
    return out
def para(d, xy, t, sz, col, maxw, anchor='mm', gap=1.25):
    ls = wrap(d, t, sz, maxw); x, y = xy; y0 = y - (len(ls) - 1) * sz * gap / 2 if anchor == 'mm' else y
    for i, l in enumerate(ls): d.text((x, y0 + i * sz * gap), l, font=F(sz), fill=col, anchor=anchor)
def save(key, im, cap, author='собственная графика', page=''):
    S.save(key, im, cap)
    cp = f'{S.J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8'))
    cr[key].update(cap=cap, author=author, page=page); json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1)
def arrow(d, a, b, col=SUB, w=6, head=22):
    d.line((a, b), fill=col, width=w); ang = math.atan2(b[1] - a[1], b[0] - a[0])
    p1 = (b[0] - head * math.cos(ang - 0.45), b[1] - head * math.sin(ang - 0.45)); p2 = (b[0] - head * math.cos(ang + 0.45), b[1] - head * math.sin(ang + 0.45))
    d.polygon([b, p1, p2], fill=col)

# ---------- типовые схемы ----------
def chain(key, title, steps, note=None, cap=None):
    """steps=[(крупно, мелко, цвет)] слева направо со стрелками"""
    im, d = S.new(title); n = len(steps); gapw = 90; bw = (1800 - gapw * (n - 1)) / n; x = 60
    for i, (big, sub, col) in enumerate(steps):
        d.rounded_rectangle((x, 250, x + bw, 620), 28, outline=col, width=5)
        if any('\u4e00' <= ch <= '\u9fff' for ch in big): d.text((x + bw / 2, 360), big, font=FJ(90), fill=col, anchor='mm')
        else: lab(d, (x + bw / 2, 360), big, fit(d, big, 70, bw - 40), col)
        para(d, (x + bw / 2, 510), sub, 32, TXT, bw - 40)
        if i < n - 1: arrow(d, (x + bw + 12, 435), (x + bw + gapw - 12, 435))
        x += bw + gapw
    if note: para(d, (W / 2, 720), note, 34, SUB, 1700)
    save(key, im, cap or title)
def versions(key, title, cols, note=None, cap=None):
    """cols=[(заголовок, текст, цвет)]"""
    im, d = S.new(title); n = len(cols); gapw = 60; bw = (1800 - gapw * (n - 1)) / n; x = 60
    for h, t, col in cols:
        d.rounded_rectangle((x, 190, x + bw, 650), 28, outline=col, width=5)
        lab(d, (x + bw / 2, 250), h, fit(d, h, 44, bw - 40), col); para(d, (x + bw / 2, 450), t, 38, TXT, bw - 70)
        x += bw + gapw
    if note: para(d, (W / 2, 730), note, 38, YL, 1700)
    save(key, im, cap or title)
def checks(key, title, rows, note=None, cap=None):
    """rows=[(True/False, текст)] ✓ факт / ✗ миф (зачёркнут)"""
    im, d = S.new(title); n = len(rows); step = min(150, 520 / n); y = 260 if n > 2 else 320
    for ok, t in rows:
        col = GN if ok else RD; d.text((150, y), '✓' if ok else '✗', font=F(72), fill=col, anchor='mm')
        sz = fit(d, t, 46, 1560); d.text((230, y), t, font=F(sz), fill=TXT if ok else SUB, anchor='lm')
        if not ok: tw = d.textlength(t, font=F(sz)); d.line((230, y + 4, 230 + tw, y + 4), fill=RD, width=5)
        y += step
    if note: para(d, (W / 2, 740), note, 36, SUB, 1700)
    save(key, im, cap or title)
def tline(key, title, pts, note=None, cap=None, y=430, bw=None):
    """pts=[(доля 0..1, год, подпись, цвет)] год над линией, подпись под ней"""
    im, d = S.new(title); d.line((140, y, 1780, y), fill=SUB, width=6); n = len(pts); bw = bw or min(560, 1640 / n)
    for f, yr, t, c in pts:
        x = 140 + 1640 * f; d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=c)
        lab(d, (x, y - 80), yr, fit(d, yr, 56, bw), c); para(d, (x, y + 60), t, 34, TXT, bw - 30, anchor='ma')
    if note: para(d, (W / 2, 770), note, 32, SUB, 1700)
    save(key, im, cap or title)

# ---------- карты ----------
feats = {f['properties']['name']: f['geometry'] for f in json.load(open('/tmp/world.geo.json'))['features']}
def rings(g): return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]
def laea(lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    def f(lon, lat):
        l, p = math.radians(lon), math.radians(lat)
        k = 1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0); k = math.sqrt(2 / max(k, 1e-6)) * 6371
        return k * math.cos(p) * math.sin(l - l0), k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
    return f
def rmap(title, center, halfh_km, hi=None, markers=(), lines=(), texts=(), box=(60, 140, 1860, 810)):
    """Регион в равновеликой азимутальной проекции. hi={страна: цвет}; markers=[(lon,lat,подпись,цвет,'l'/'r'/'t'/'b')]; lines=[([(lon,lat)...], цвет, ширина, стрелка?)]"""
    im, d = S.new(title); hi = hi or {}; x0, y0, x1, y1 = box; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; sc = (y1 - y0) / 2 / halfh_km; f = laea(*center)
    lay = Image.new('RGB', (W, H), OCEAN); ld = ImageDraw.Draw(lay)
    T = lambda lo, la: (cx + f(lo, la)[0] * sc, cy - f(lo, la)[1] * sc)
    vis = lambda lo, la: math.sin(math.radians(center[1])) * math.sin(math.radians(la)) + math.cos(math.radians(center[1])) * math.cos(math.radians(la)) * math.cos(math.radians(lo - center[0])) > 0.05
    for pass_ in (0, 1):
        for n, g in feats.items():
            if (n in hi) != bool(pass_): continue
            for r in rings(g):
                if not any(vis(lo, la) for lo, la in r): continue
                u = [r[0]]
                for lo, la in r[1:]:
                    while lo - u[-1][0] > 180: lo -= 360
                    while lo - u[-1][0] < -180: lo += 360
                    u.append((lo, la))
                pts = [T(lo, la) if vis(lo, la) else None for lo, la in u]
                if any(p is None for p in pts): continue
                ld.polygon(pts, fill=hi.get(n, LAND), outline=(40, 44, 52))
    for pts, col, w, ar in lines:
        P = [T(lo, la) for lo, la in pts]; ld.line(P, fill=col, width=w, joint='curve')
        if ar: arrow(ld, P[-2], P[-1], col, w, 30)
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle(box, 24, fill=255); im.paste(lay, (0, 0), mask); d = ImageDraw.Draw(im)
    for lo, la, t, col, side in markers:
        x, y = T(lo, la)
        if not (x0 < x < x1 and y0 < y < y1): print('MARKER OUTSIDE', title, t)
        d.ellipse((x - 12, y - 12, x + 12, y + 12), fill=col, outline=(0, 0, 0), width=3)
        if t:
            sz = 34; tw = d.textlength(t, font=F(sz)); off = {'r': (24, 0, 'lm'), 'l': (-24, 0, 'rm'), 't': (0, -40, 'mm'), 'b': (0, 40, 'mm')}[side]
            tx, ty = x + off[0], y + off[1]; bx = {'lm': (tx - 8, tx + tw + 8), 'rm': (tx - tw - 8, tx + 8), 'mm': (tx - tw / 2 - 8, tx + tw / 2 + 8)}[off[2]]
            d.rounded_rectangle((bx[0], ty - 26, bx[1], ty + 26), 10, fill=(14, 14, 17)); d.text((tx, ty), t, font=F(sz), fill=col, anchor=off[2])
    for lo, la, t, col, sz in texts:
        x, y = T(lo, la)
        if not (x0 + 40 < x < x1 - 40 and y0 + 30 < y < y1 - 30): print('TEXT OUTSIDE', title, t); continue
        tw = d.textlength(t, font=F(sz)); d.rounded_rectangle((x - tw / 2 - 10, y - sz * 0.75, x + tw / 2 + 10, y + sz * 0.75), 10, fill=(14, 14, 17)); d.text((x, y), t, font=F(sz), fill=col, anchor='mm')
    d.rounded_rectangle(box, 24, outline=(60, 64, 76), width=3)
    return im, d

# ========== 1. Холодный старт ==========
im, d = S.new('Общая площадь страны, с озёрами и реками')
rows = [('Россия', 17.10, '17,1 млн км²', BL), ('???  «деревня»', 9.98, '9,98 млн км²', OR), ('США', 9.83, '9,83 млн км²', BL), ('Китай', 9.60, '9,60 млн км²', BL)]
for i, (nm, v, lb, col) in enumerate(rows):
    y = 230 + i * 120; w = 1050 * v / 17.10; lab(d, (470, y), nm, 42, OR if col == OR else SUB, 'rm'); d.rectangle((500, y - 38, 500 + w, y + 38), fill=col); lab(d, (500 + w + 20, y), lb, 40, TXT, 'lm')
lab(d, (W / 2, 740), 'длина столбиков пропорциональна площади; данные: справочник ЦРУ (World Factbook)', 30, SUB)
save('cn_area_rank', im, 'Вторая по общей площади страна мира носит имя «деревня» (схема)', page='https://www.cia.gov/the-world-factbook/field/area/country-comparison/')

im, d = S.new('Загадки на карте')
cards = [('дерево', OR), ('креветка', BL), ('лёд', (200, 230, 255)), ('король', YL)]
for i, (t, c) in enumerate(cards):
    x = 60 + i * 460; d.rounded_rectangle((x, 230, x + 420, 560), 28, outline=c, width=5); lab(d, (x + 210, 395), t, fit(d, t, 70, 380), c)
lab(d, (1300, 610), '…который туда ни разу не приплыл', 34, SUB)
lab(d, (W / 2, 730), 'за каждой надписью своя история', 38, TXT)
save('cn_riddles', im, 'Четыре загадки: дерево, креветка, лёд и король (схема)')

im, d = S.new('Одно имя родилось в газете')
d.rounded_rectangle((560, 200, 1360, 640), 20, outline=SUB, width=5); d.rectangle((600, 240, 1320, 320), fill=GR); lab(d, (960, 280), 'ГАЗЕТА', 50, TXT)
for k in range(5): d.rectangle((600, 360 + k * 50, 1320 if k % 2 == 0 else 1180, 380 + k * 50), fill=(50, 54, 62))
lab(d, (960, 470), '?', 200, YL)
lab(d, (W / 2, 730), 'не народ, не моряк, не правитель. Какое имя? Ответ в конце', 36, SUB)
save('cn_newspaper_q', im, 'Одно из названий стран впервые напечатали в газете (схема)')

# ========== 3–4. Канада ==========
lawr = [(-76.4, 44.2), (-75.2, 44.9), (-73.6, 45.5), (-72.6, 46.2), (-71.2, 46.8), (-70.0, 47.5), (-68.5, 48.6), (-66.5, 49.3), (-64.5, 49.9)]
im, d = rmap('1535: Картье поднимается по реке Святого Лаврентия', (-70, 47), 700, {'Canada': (120, 90, 50)},
             markers=[(-71.2, 46.8, 'деревня Стадакона (ныне Квебек)', YL, 'l'), (-73.6, 45.5, 'Ошлага (ныне Монреаль)', SUB, 'b')],
             lines=[(list(reversed(lawr))[:-1] + [(-75.8, 44.6)], OR, 9, False), ([(-61.5, 50.6), (-64.0, 50.0), (-67.5, 49.0), (-69.8, 47.6)], YL, 5, True)],
             texts=[(-62.5, 52.2, 'путь Картье', YL, 34), (-75, 51.3, 'Канада сегодня', TXT, 34), (-73.5, 41.6, 'США', SUB, 34)])
save('cn_map_lawrence', im, 'Река Святого Лаврентия: путь Картье к деревне Стадакона, 1535 (схема)', GEO, 'https://en.wikipedia.org/wiki/Name_of_Canada')
tline('cn_donnacona_tl', 'Картье и семья вождя Донаконны', [(0.12, '1534', 'двое сыновей вождя уходят с Картье во Францию', BL), (0.5, '1535', 'юноши ведут Картье к «канате», то есть к деревне', OR), (0.88, '1536', 'Картье увозит самого вождя во Францию против его воли', RD)],
      note='источники: Википедия «Donnacona», Канадская энциклопедия')
chain('cn_chain_canada', 'Как «деревня» стала страной', [('kanata', 'слово ирокезов реки Святого Лаврентия', BL), ('«деревня»', 'Картье знал значение и записал его', TXT), ('Canada', 'имя всей округи, уже на картах через ≈ 10 лет', OR)], note='в записках Картье: «город» у них называется Canada')
checks('cn_myths_canada', 'Что говорят о Канаде зря', [(False, '«ака нада»: испанское «здесь ничего нет»'), (False, '«ошибка» Картье: он не понял слова'), (True, 'Картье знал: kanata = «деревня»'), (True, 'до Картье надписи «Канада» на картах нет')])

# ========== 5–6. Бразилия ==========
im, d = rmap('Бразилия', (-55, -15), 2600, {'Brazil': OR}, texts=[(-50, -10, 'Бразилия', TXT, 46)])
save('cn_map_brazil', im, 'Бразилия на карте (схема)', GEO)
versions('cn_names_brazil', 'Два имени одной земли', [('Официальное имя', '«Земля Святого Креста» (Терра-ди-Санта-Круш), дали португальцы', BL), ('Имя купцов', '«Бразилия»: по товару, бразильскому дереву для красной краски', OR)], note='купцы победили')
chain('cn_chain_brazil', 'Откуда слово «Бразилия»', [('brasa', '«раскалённые угли» (как считают)', RD), ('пау-бразил', 'дерево, из которого варили красную краску', OR), ('Бразилия', 'страна названа по товару', YL)], note='самая принятая версия; есть и другие')
chain('cn_flow_brazilwood', 'Первый товар на вывоз', [('тупи', 'индейцы рубят бразильское дерево', GN), ('обмен', 'брёвна меняют на европейские вещи', TXT), ('корабли', 'брёвна везут в Европу на продажу', BL), ('краска', 'из древесины варят красную краску', RD)])

# ========== 7–8. Венесуэла ==========
im, d = rmap('Венесуэла: озеро Маракайбо', (-68, 8), 900, {'Venezuela': OR}, markers=[(-71.6, 9.8, 'озеро Маракайбо', YL, 'l')], texts=[(-65.5, 7.0, 'Венесуэла', TXT, 44), (-74.5, 4.5, 'Колумбия', SUB, 34)])
save('cn_map_maracaibo', im, 'Озеро Маракайбо на карте Венесуэлы (схема)', GEO)
versions('cn_versions_venez', 'Откуда имя «Венесуэла»', [('Версия 1: самая известная', '1499: дома на сваях у озера Маракайбо напомнили Венецию. «Маленькая Венеция»', OR), ('Версия 2: географ Энсисо', 'так называли себя местные жители', BL)], note='какая верна, спорят до сих пор')
checks('cn_maybe', 'Почему одна версия популярнее', [(True, 'красивая: сваи, вода, Венеция'), (False, 'доказанная'), (True, 'честная подпись: «возможно»')])

# ========== 9–12. Камерун, Чад ==========
versions('cn_next_two', 'Что увидели, то и записали', [('Камерун', 'река, где кишат креветки', BL), ('Чад', 'огромное озеро', OR)])
im, d = rmap('Камерун: устье реки Вури', (12, 6), 900, {'Cameroon': OR}, markers=[(9.7, 4.05, 'устье реки Вури (Дуала)', YL, 'l')], texts=[(12.8, 6.3, 'Камерун', TXT, 44), (8.0, 9.8, 'Нигерия', SUB, 32), (15.0, 13.8, 'Чад', SUB, 32), (9.0, 2.0, 'Атлантика', BL, 32)])
save('cn_map_cameroon', im, 'Камерун и устье реки Вури (схема)', GEO)
chain('cn_chain_cameroon', 'Река креветок', [('Rio dos Camarões', 'так португальцы назвали реку Вури', BL), ('«Река креветок»', 'перевод с португальского', TXT), ('Камерун', 'по реке названа страна', OR)])
im, d = S.new('Камерунская креветка-призрак')
lab(d, (W / 2, 260), 'Lepidophthalmus turneranus', 64, BL); lab(d, (W / 2, 360), 'реальный вид креветки, живущей в Камеруне', 40, TXT)
d.rounded_rectangle((360, 450, 1560, 640), 24, outline=SUB, width=4); para(d, (W / 2, 545), 'по её массе в реке Вури португальцы и дали реке имя', 38, SUB, 1100)
save('cn_ghost_shrimp', im, 'Камерунская креветка-призрак: научное название (схема)', page='https://en.wikipedia.org/wiki/Cameroon')
chain('cn_shrimp_order', 'Сначала были креветки', [('креветки', 'в реке их очень много', BL), ('река', '«Река креветок»', TXT), ('страна', 'Камерун', OR)])
im, d = rmap('Чад: страна названа по озеру', (17, 14), 1300, {'Chad': OR}, markers=[(14.0, 13.0, 'озеро Чад', BL, 'l')], texts=[(19.5, 15.5, 'Чад', TXT, 50), (8.5, 17.0, 'Нигер', SUB, 32), (8.0, 9.5, 'Нигерия', SUB, 32), (12.0, 6.0, 'Камерун', SUB, 32)])
save('cn_map_chad', im, 'Чад и озеро Чад (схема)', GEO)

# ========== 13–16. Исландия, Гренландия ==========
im, d = rmap('Исландия', (-20, 65), 900, {'Iceland': (200, 230, 255)}, texts=[(-18.5, 65, 'Исландия', TXT, 44)])
save('cn_map_iceland', im, 'Исландия на карте (схема)', GEO)
im, d = S.new('Три имени одного острова')
for i, (who, nm, note, col) in enumerate((('Наддод', '«Страна снега»', 'не прижилось', SUB), ('Гардар', '«Остров Гардара»', 'не прижилось', SUB), ('Флоки', '«Страна льда»', 'осталось', OR))):
    x = 60 + i * 620; d.rounded_rectangle((x, 220, x + 560, 620), 28, outline=col, width=5); lab(d, (x + 280, 290), f'{i + 1}. {who}', 46, TXT); lab(d, (x + 280, 420), nm, fit(d, nm, 52, 520), col); lab(d, (x + 280, 540), note, 36, GN if i == 2 else RD)
    if i < 2: d.line((x + 140, 420 + 4, x + 420, 420 + 4), fill=RD, width=4)
lab(d, (W / 2, 730), 'по «Книге о заселении земли» и сагам', 34, SUB)
save('cn_iceland_names', im, 'Исландия: три имени (схема)')
checks('cn_myth_iceland', 'Имя, чтобы напугать?', [(True, 'по сагам: Флоки увидел фьорд, забитый льдом'), (False, 'имя выбрали, чтобы отпугнуть поселенцев'), (True, 'историки считают это мифом')])
im, d = rmap('Гренландия: автономная часть Дании', (-20, 66), 1900, {'Greenland': GN, 'Denmark': OR, 'Iceland': (200, 230, 255)}, texts=[(-41, 74, 'Гренландия', TXT, 44), (-19, 61.5, 'Исландия', TXT, 32), (10, 58.2, 'Дания', OR, 34)])
save('cn_map_greenland', im, 'Гренландия, Исландия и Дания на карте (схема)', GEO)
chain('cn_chain_greenland', 'Самая старая реклама', [('Эйрик Рыжий', 'по саге выбирает имя для острова', OR), ('«Зелёная земля»', 'чтобы людей было проще заманить', GN), ('лёд', 'остров так и не стал зелёным', (200, 230, 255))])
tline('cn_saga_tl', 'Сага записана спустя века', [(0.08, '≈ 985', 'Эйрик Рыжий приводит поселенцев в Гренландию', OR), (0.86, 'XIII век', 'сагу об Эйрике записывают', BL)], note='поэтому сага рассказ, а не протокол; точнее говорят раскопки. Источник: Википедия «Greenland», «Erik the Red»')

# ========== 17–18. Аргентина, подсказка ==========
im, d = rmap('Аргентина', (-64, -39), 2000, {'Argentina': (200, 205, 215)}, texts=[(-66, -35, 'Аргентина', TXT, 40)])
save('cn_map_argentina', im, 'Аргентина на карте (схема)', GEO)
chain('cn_chain_argentina', 'Имя из слуха', [('argentum', 'по-латыни «серебро»', (200, 205, 215)), ('слух', 'о серебряных горах', TXT), ('Аргентина', 'гор из серебра не нашли, имя осталось', OR)])
tline('cn_tl_argentina', 'Имя раньше страны', [(0.05, '1536', 'имя на карте', OR), (0.233, '1602', 'поэма «Аргентина»', BL), (0.95, '1860', 'имя стало официальным', GN)], note='даты по статье Википедии «Argentina» (раздел об имени); шкала времени равномерная', bw=320)
im, d = S.new('Какое имя напечатали в газете?')
for i, t in enumerate(('самая населённая страна своего континента', 'у неё есть река-тёзка', 'имя впервые напечатано в газете')):
    y = 260 + i * 130; d.ellipse((240, y - 22, 284, y + 22), fill=YL); lab(d, (320, y), t, 46, TXT, 'lm')
lab(d, (W / 2, 690), '?', 110, YL)
save('cn_clue_nigeria', im, 'Подсказки к загадке о газетном имени (схема)')

# ========== 19–21. Австралия ==========
src = Image.open(f'{S.IMG}/old_world_map.jpg').convert('RGB'); c = src.crop((300, 760, 1620, 1090)).resize((1800, 450), Image.LANCZOS)
im, d = S.new('«Южная земля, ещё не известная»'); im.paste(c, (60, 170)); d.rounded_rectangle((60, 170, 1860, 620), 10, outline=SUB, width=3)
lab(d, (W / 2, 680), 'Terra Australis Nondum Cognita: огромный материк, которого никто не видел', 36, YL)
lab(d, (W / 2, 750), 'фрагмент карты Ортелия, 1570 год', 32, SUB)
save('cn_ortelius_south', im, 'Воображаемый южный материк на карте Ортелия, 1570 (фрагмент)', 'Абрахам Ортелий (общественное достояние); подписи: собственная графика', 'https://commons.wikimedia.org/wiki/File:1570_Typus_Ortelius_cropped.jpg')
chain('cn_chain_australia', 'Имя для призрака', [('australis', 'по-латыни «южная»', BL), ('Terra Australis', 'воображаемый южный материк', SUB), ('Австралия', 'имя переписали на настоящий материк', OR)])
tline('cn_tl_australia', 'Как «южная» стала Австралией', [(0.1, '1545', 'на гравюре: воображаемый материк', SUB), (0.37, '1801–1803', 'Флиндерс обходит материк кругом', BL), (0.63, '1814', 'книга и карта Флиндерса', OR), (0.9, '1824', 'Адмиралтейство принимает имя', GN)], note='до этого землю звали Новой Голландией. Даты: Википедия «Names of Australia»; шкала неравномерная')
im, d = S.new('Кто подписывает карту')
for i, (t, col) in enumerate((('тот, кто платил за экспедицию', OR), ('тот, кто первым нарисовал карту', OR), ('местные жители', SUB))):
    y = 250 + i * 140; d.text((180, y), '✓' if i < 2 else '✗', font=F(70), fill=GN if i < 2 else RD, anchor='mm'); lab(d, (260, y), t, 50, col, 'lm')
lab(d, (W / 2, 690), 'написанное на карте повторяют из поколения в поколение', 38, YL)
save('cn_who_names', im, 'Кто давал имена на картах (схема)')

# ========== 22. Филиппины ==========
im, d = rmap('Филиппины: Лейте и Самар', (123, 12), 800, {'Philippines': OR}, markers=[(124.8, 10.9, 'Лейте', YL, 'r'), (125.0, 12.0, 'Самар', YL, 'r')], texts=[(121.0, 16.8, 'Лусон', TXT, 32), (125.0, 7.5, 'Минданао', TXT, 32)])
save('cn_map_phil', im, 'Острова Лейте и Самар на карте Филиппин (схема)', GEO)
tline('cn_tl_phil', 'Как острова стали Филиппинами', [(0.1, '1521', 'Магеллан: «Острова Святого Лазаря»', SUB), (0.5, '1543', 'испанцы называют Лейте и Самар «Филиппинами» в честь принца Филиппа', OR), (0.88, 'позже', 'имя расходится на весь архипелаг', GN)], note='даты: Википедия «Philippines» (раздел об имени); шкала времени неравномерная')
im, d = rmap('Король, который не приплыл', (60, 30), 5200, {'Philippines': OR, 'Spain': YL}, lines=[([(-3.7, 40.4), (20, 47), (50, 47), (80, 38), (105, 25), (121, 14.6)], SUB, 4, True)], texts=[(-5, 33.5, 'Испания: Филипп II', YL, 34), (118, 5, 'Филиппины', OR, 34), (72, 2, 'Мадрид → Манила: ≈ 11 700 км по прямой', TXT, 34)])
save('cn_king_never', im, 'Испания и Филиппины: король туда не плавал (схема)', GEO)

# ========== 23–25. Япония ==========
im, d = S.new('Нихон / Ниппон')
d.text((620, 380), '日', font=FJ(260), fill=OR, anchor='mm'); d.text((1300, 380), '本', font=FJ(260), fill=YL, anchor='mm')
lab(d, (620, 600), 'солнце', 52, OR); lab(d, (1300, 600), 'основа, исток', 52, YL)
lab(d, (W / 2, 730), '«основа солнца»: оба чтения, Нихон и Ниппон, правильные', 38, TXT)
save('cn_kanji', im, 'Иероглифы названия Японии: «основа солнца» (схема)')
im, d = rmap('Восход: если смотреть из Китая', (122, 36), 1500, {'China': (150, 80, 70), 'Japan': OR}, lines=[([(112, 34), (131, 34.5)], YL, 8, True)], texts=[(104, 33, 'Китай', TXT, 44), (139.5, 38, 'Япония', OR, 40), (121.5, 31, 'на восток, к восходу', YL, 32)])
save('cn_map_japan_china', im, 'Япония лежит к востоку от Китая (схема)', GEO)
versions('cn_versions_japan', 'Кто начал называть страну «Нихон»?', [('Одна хроника', 'сменить название попросили японские послы', OR), ('Другая', 'решение приписывают китайской императрице', BL)], note='«сами японцы» — самая вероятная версия, а не точный факт')
chain('cn_chain_japan', 'Как «Нихон» стал «Японией»', [('日本', 'те же иероглифы по-китайски', OR), ('«Сипангу»', 'так записал Марко Поло', BL), ('европейцы', 'слово переходит из языка в язык', SUB), ('Япония', 'то, что на нашей карте', YL)])
src = Image.open(f'{S.IMG}/old_world_map.jpg').convert('RGB'); c = src.crop((1550, 380, 1800, 640)).resize((640, 666), Image.LANCZOS)
im, d = S.new('«Iapan» на карте Ортелия, 1570'); im.paste(c, (380, 140)); d.rounded_rectangle((380, 140, 1020, 806), 10, outline=SUB, width=3)
d.ellipse((380 + 512 - 85, 140 + 316 - 55, 380 + 512 + 85, 140 + 316 + 55), outline=YL, width=6); arrow(d, (1240, 456), (990, 456), YL, 6, 30)
lab(d, (1080, 300), 'Iapan: так европейцы', 40, YL, 'lm'); lab(d, (1080, 360), 'подписали Японию', 40, YL, 'lm'); lab(d, (1080, 560), 'слева: Китай (China)', 36, SUB, 'lm')
save('cn_ortelius_japan', im, 'Япония на карте Ортелия, 1570 (фрагмент)', 'Абрахам Ортелий (общественное достояние); подпись: собственная графика', 'https://commons.wikimedia.org/wiki/File:1570_Typus_Ortelius_cropped.jpg')

# ========== 26–28. Мадагаскар ==========
im, d = rmap('Мадагаскар и Могадишо', (44, -8), 2000, {'Madagascar': OR, 'Somalia': BL}, markers=[(45.34, 2.04, 'Могадишо', BL, 'r')], texts=[(46.8, -19.5, 'Мадагаскар', TXT, 36), (30, -2, 'Африка', SUB, 40)])
save('cn_map_madag', im, 'Мадагаскар и порт Могадишо на карте (схема)', GEO)
chain('cn_chain_madag', 'Версия 1: путаница с портом', [('Могадишо', 'сомалийский порт', BL), ('Марко Поло', 'сам на острове не был, мог перепутать', SUB), ('Мадагаскар', 'картографы повторили ошибку', OR)], note='это гипотеза, учёные спорят до сих пор')
im, d = rmap('Предки малагасийцев пришли из Юго-Восточной Азии', (80, -5), 3800, {'Madagascar': OR, 'Indonesia': BL, 'Malaysia': BL, 'Philippines': BL},
             lines=[([(110, -5), (90, -10), (70, -14), (50.5, -17)], YL, 6, True)], texts=[(112, 8, 'Юго-Восточная Азия', BL, 36), (40, -24, 'Мадагаскар', OR, 36), (78, -2, 'Индийский океан', SUB, 32)])
save('cn_migration', im, 'Путь предков малагасийцев из Юго-Восточной Азии (схема)', GEO)
versions('cn_versions_madag', 'Откуда имя «Мадагаскар»?', [('Версия 1', 'искажённое «Могадишо» у Марко Поло', BL), ('Версия 2', '«остров малайцев» у аль-Идриси, XII век', OR)], note='какая верна, неизвестно')
im, d = S.new('Как зовут остров сами жители')
lab(d, (W / 2, 380), 'Мадагасикара', 130, OR)
lab(d, (W / 2, 560), 'единого имени для всего острова раньше, судя по всему, не было', 38, TXT)
lab(d, (W / 2, 660), 'надпись на карте пришла со стороны', 38, SUB)
save('cn_madagasikara', im, 'Мадагасикара: имя острова у жителей (схема)')

# ========== 29–31. Нигерия ==========
niger = [(-10.7, 9.1), (-9.3, 10.4), (-8.0, 12.65), (-6.3, 13.45), (-4.2, 14.5), (-3.0, 16.7), (-0.05, 16.3), (1.0, 14.9), (2.1, 13.5), (3.6, 11.7), (4.4, 10.3), (4.8, 9.1), (6.0, 8.6), (6.74, 7.8), (6.78, 6.15), (6.3, 4.6)]
im, d = rmap('Река Нигер и страна Нигерия', (-1, 12), 1150, {'Nigeria': GN, 'Niger': (110, 112, 140)}, lines=[(niger, BL, 9, False)],
             texts=[(8.5, 9.5, 'Нигерия', TXT, 40), (11, 17.5, 'Нигер', TXT, 34), (-5.5, 18.5, 'река Нигер', BL, 34), (-2, 4.3, 'Гвинейский залив', SUB, 30)])
lab(d, (W / 2, 780), 'русло показано приблизительно', 30, SUB)
save('cn_map_niger', im, 'Река Нигер и Нигерия (схема)', GEO)
chain('cn_chain_nigeria', 'Река дала корень, журналистка собрала имя', [('Нигер', 'река; происхождение имени неясно, возможно «река рек»', BL), ('«Таймс»', '8 января 1897, статья Флоры Шоу', TXT), ('Нигерия', 'имя страны', GN)])
checks('cn_variants_nigeria', 'Варианты имени', [(False, 'Центральный Судан'), (False, 'Земли хауса'), (True, 'Нигерия: короткое и удобное для карты')])
versions('cn_nigeria_fact', 'Что спорно, а что нет', [('Спорят', 'кто первым предложил слово «Нигерия»', RD), ('Не оспаривает никто', 'текст в «Таймс» 8.01.1897; раньше этого слова историки не нашли', GN)])
im, d = S.new('Самые населённые страны Африки')
rows = [('Нигерия', 232.7, GN), ('Эфиопия', 132.1, BL), ('Египет', 116.5, BL), ('ДР Конго', 109.3, BL)]
for i, (nm, v, col) in enumerate(rows):
    y = 230 + i * 120; w = 1050 * v / 232.7; lab(d, (470, y), nm, 42, GN if col == GN else SUB, 'rm'); d.rectangle((500, y - 38, 500 + w, y + 38), fill=col); lab(d, (500 + w + 20, y), f'≈ {v:.0f} млн'.replace('.', ','), 40, TXT, 'lm')
lab(d, (W / 2, 740), 'оценка ООН на 2024 год (World Population Prospects 2024); столбики в масштабе', 30, SUB)
save('cn_pop_africa', im, 'Нигерия: самая населённая страна Африки (схема)', page='https://population.un.org/wpp/')

# ========== 32–34. Итог ==========
places = {'Canada': OR, 'Brazil': OR, 'Venezuela': OR, 'Cameroon': OR, 'Chad': OR, 'Argentina': OR, 'Philippines': OR, 'Madagascar': OR, 'Nigeria': OR, 'Japan': GN, 'Iceland': GN, 'Australia': GN, 'Greenland': BL}
im, d = S.new('Все надписи нашей карты')
def wt(lon, lat):
    l, p = math.radians(lon), math.radians(lat); a = math.acos(math.cos(p) * math.cos(l / 2)); sa = math.sin(a) / a if a else 1
    return 0.5 * (l * 2 / math.pi + 2 * math.cos(p) * math.sin(l / 2) / sa), 0.5 * (p + math.sin(p) / sa)
sc = 270; cx, cy = W / 2, 515
for n, g in feats.items():
    if n == 'Antarctica': continue
    for r in rings(g): d.polygon([(cx + sc * wt(lo, la)[0], cy - sc * wt(lo, la)[1]) for lo, la in r], fill=places.get(n, LAND))
for t, col, x in (('записали пришельцы', OR, 560), ('выбрали сами', GN, 1060), ('Гренландия', BL, 1400)):
    d.rectangle((x - 30, 772, x - 6, 796), fill=col); lab(d, (x, 784), t, 32, TXT, 'lm')
save('cn_world_all', im, 'Все страны из ролика на одной карте (схема)', GEO)
im, d = S.new('Единой формулы нет')
d.rounded_rectangle((60, 180, 940, 660), 28, outline=OR, width=5); d.rounded_rectangle((980, 180, 1860, 660), 28, outline=GN, width=5)
lab(d, (500, 240), 'записали пришельцы', 46, OR); lab(d, (1420, 240), 'выбрали сами', 46, GN)
for i, t in enumerate(('деревня', 'дерево', 'креветка', 'чужая Венеция')): lab(d, (500, 340 + i * 80), t, 44, TXT)
for i, t in enumerate(('Япония', 'Исландия', 'Австралия')): lab(d, (1420, 340 + i * 80), t, 44, TXT)
lab(d, (W / 2, 740), 'у каждого имени своя история', 38, SUB)
save('cn_summary', im, 'Итог: кто давал имена странам (схема)')
checks('cn_myths_all', 'Красивые истории, которые мы обошли', [(False, '«ака нада»: «здесь ничего нет»'), (False, '«ошибка» Картье'), (False, 'имя, чтобы напугать')], note='настоящие объяснения скромнее и интереснее')
im, d = S.new('Какую надпись разобрать следующей?')
lab(d, (W / 2, 380), 'Напиши страну', 110, YL); lab(d, (W / 2, 530), 'в комментариях', 80, TXT)
lab(d, (W / 2, 690), 'страны редко выбирали имена сами, чаще им их приписывали', 36, SUB)
save('cn_next_country', im, 'Призыв: напиши страну в комментариях (схема)')
print('ok', len(S.new_keys))
