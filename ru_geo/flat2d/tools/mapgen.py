#!/usr/bin/env python3
"""python3 tools/mapgen.py country_sizes : рисует собственные карты (данные границ: johan/world.geo.json, открытые) в archive/img + credits.json"""
import json, math, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont
slug = sys.argv[1]; R = '/home/user/sofia-studio/ru_geo'; J = f'{R}/{slug}'; os.makedirs(f'{J}/archive/img', exist_ok=True)
W, H = 1920, 1080; BG = (14, 14, 17); LAND = (70, 74, 84); HI1 = (240, 170, 60); HI2 = (90, 170, 230); TXT = (240, 240, 240)
GJ = '/tmp/world.geo.json'
if not os.path.exists(GJ): open(GJ, 'wb').write(urllib.request.urlopen('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json', timeout=60).read())
feats = {f['properties']['name']: f['geometry'] for f in json.load(open(GJ))['features']}
AFR = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad', 'Republic of the Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Senegal', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'United Republic of Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe', 'Western Sahara']
def rings(g):
    if g['type'] == 'Polygon': return [g['coordinates'][0]]
    return [p[0] for p in g['coordinates']]
def shape(names): return [r for n in names if n in feats for r in rings(feats[n])]
def font(sz, bold=True):
    for p in ['/usr/share/fonts/truetype/inter/Inter-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
def merc(lon, lat): lat = max(-82, min(82, lat)); return math.radians(lon), math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
def gall(lon, lat): return math.radians(lon) * math.cos(math.pi / 4), math.sin(math.radians(lat)) / math.cos(math.pi / 4)
def wt(lon, lat):
    l, p = math.radians(lon), math.radians(lat); a = math.acos(math.cos(p) * math.cos(l / 2)); sa = math.sin(a) / a if a else 1
    x = 0.5 * (l * math.cos(math.acos(2 / math.pi)) + 2 * math.cos(p) * math.sin(l / 2) / sa); y = 0.5 * (p + math.sin(p) / sa); return x, y
def laea(lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    def f(lon, lat):
        l, p = math.radians(lon), math.radians(lat); k = math.sqrt(2 / (1 + math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)))
        return 6371 * k * math.cos(p) * math.sin(l - l0), 6371 * k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
    return f
def centroid(rs):
    pts = [pt for r in rs for pt in r]; return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
def draw_world(proj, hi, title, sub, out, grid=False, tissot=False):
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    allr = [(n, r) for n, g in feats.items() for r in rings(g) if n != 'Antarctica']
    pts = [proj(lo, la) for n, r in allr for lo, la in r]; xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    sc = min((W - 160) / (max(xs) - min(xs)), (H - 260) / (max(ys) - min(ys))); ox = W / 2 - sc * (max(xs) + min(xs)) / 2; oy = H / 2 + 20 + sc * (max(ys) + min(ys)) / 2
    T = lambda p: (ox + sc * p[0], oy - sc * p[1])
    for n, r in allr:
        col = HI1 if n in hi[0] else HI2 if n in hi[1] else LAND
        d.polygon([T(proj(lo, la)) for lo, la in r], fill=col)
    if tissot:
        for la in range(-60, 61, 20):
            for lo in range(-160, 161, 40):
                cs = [T(proj(lo + 7 * math.sin(a) / max(0.2, math.cos(math.radians(la + 7 * math.cos(a) / 2))), la + 7 * math.cos(a))) for a in [i * math.pi / 18 for i in range(37)]]; d.polygon(cs, fill=(255, 90, 90))
    d.text((W / 2, 70), title, font=font(60), fill=TXT, anchor='mm'); d.text((W / 2, H - 55), sub, font=font(34), fill=(190, 190, 195), anchor='mm'); im.save(out, quality=92)
def versus(a, b, na, nb, aa, ab, out, mult=None):
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im); items = []
    for names, col, nm, area in ((a, HI1, na, aa), (b, HI2, nb, ab)):
        rs = shape(names); cx, cy = centroid(rs); f = laea(cx, cy); P = [[f(lo, la) for lo, la in r] for r in rs]; xs = [p[0] for r in P for p in r]; ys = [p[1] for r in P for p in r]
        items.append((P, col, nm, area, min(xs), max(xs), min(ys), max(ys)))
    wsum = sum(i[5] - i[4] for i in items) + 500; hmax = max(i[7] - i[6] for i in items); sc = min((W - 200) / wsum, (H - 420) / hmax)
    x = (W - sum((i[5] - i[4]) * sc for i in items) - 160) / 2
    for P, col, nm, area, x0, x1, y0, y1 in items:
        for r in P: d.polygon([(x + (px - x0) * sc, H / 2 - 50 + (y1 + y0) / 2 * sc - py * sc) for px, py in r], fill=col)
        wcx = x + (x1 - x0) * sc / 2; d.text((wcx, H - 150), nm, font=font(48), fill=col, anchor='mm'); d.text((wcx, H - 95), area, font=font(34), fill=TXT, anchor='mm'); x += (x1 - x0) * sc + 160
    if mult: d.text((W / 2, 70), mult, font=font(72), fill=TXT, anchor='mm')
    im.save(out, quality=92)
OUT = {}
def save(key, fn, cap, build):
    p = f'{J}/archive/img/{fn}'; build(p); OUT[key] = dict(file=fn, author='собственная графика, данные: открытые границы стран (johan/world.geo.json)', license='свободно', cap=cap, page='https://github.com/johan/world.geo.json', title=cap)
afr = AFR
mk = lambda proj, t, s, tis=False: (lambda p: draw_world(proj, (['Greenland'], afr), t, s, p, tissot=tis))
for k in ('mercator_world_map', 'web_mercator_map', 'school_world_map'): save(k, f'{k}.jpg', 'Карта в проекции Меркатора (Гренландия и Африка)', mk(merc, 'Карта Меркатора', 'Гренландия (жёлтая) и Африка (синяя)'))
save('tissot_mercator', 'tissot_mercator.jpg', 'Одинаковые круги на карте Меркатора', mk(merc, 'Одинаковые круги на карте', 'Все красные круги на деле одного размера', True))
save('gall_peters_map', 'gall_peters_map.jpg', 'Проекция Галла-Петерса: площади честные', mk(gall, 'Проекция Галла-Петерса', 'Площади честные, формы растянуты'))
save('winkel_tripel_map', 'winkel_tripel_map.jpg', 'Проекция Винкеля: компромисс', mk(wt, 'Проекция Винкеля', 'Компромисс между формами и площадями'))
v = lambda a, b, na, nb, aa, ab, m: (lambda p: versus(a, b, na, nb, aa, ab, p, m))
save('africa_map', 'africa_vs_greenland.jpg', 'Африка и Гренландия в одном масштабе', v(afr, ['Greenland'], 'Африка', 'Гренландия', '30 млн км²', '2,2 млн км²', '×14'))
OUT['greenland_map'] = dict(OUT['africa_map']); OUT['greenland_map']['file'] = 'africa_vs_greenland.jpg'
save('congo_map', 'congo_vs_france.jpg', 'ДР Конго и Франция в одном масштабе', v(['Democratic Republic of the Congo'], ['France'], 'ДР Конго', 'Франция', '2,3 млн км²', '0,55 млн км²', 'В Конго помещаются 4 Франции'))
OUT['france_map'] = dict(OUT['congo_map'])
save('brazil_map', 'brazil_vs_australia.jpg', 'Бразилия и Австралия в одном масштабе', v(['Brazil'], ['Australia'], 'Бразилия', 'Австралия', '8,5 млн км²', '7,7 млн км²', 'Бразилия чуть больше Австралии'))
OUT['australia_map'] = dict(OUT['brazil_map'])
save('russia_map', 'russia_vs_africa.jpg', 'Россия и Африка в одном масштабе', v(['Russia'], afr, 'Россия', 'Африка', '17 млн км²', '30 млн км²', 'Африка почти вдвое больше России'))
save('indonesia_map', 'indonesia_vs_usa.jpg', 'Индонезия и США в одном масштабе', v(['Indonesia'], ['United States of America'], 'Индонезия', 'США', '1,9 млн км² суши', '9,8 млн км²', 'Индонезия растянулась как США'))
cp = f'{J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')) if os.path.exists(cp) else {}
for k, vv in OUT.items(): cr[k] = vv
json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1); print('ok', len(OUT))
