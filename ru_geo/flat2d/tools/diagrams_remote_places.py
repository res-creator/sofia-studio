#!/usr/bin/env python3
"""Собственные схемы и карты для ролика «Самое отдалённое место человечества» (ru_geo/remote_places).
Числа берутся из SCRIPT.md; координаты мест: NOAA (Точка Немо), Wikipedia (остальные точки), границы суши: johan/world.geo.json.
Запуск: python3 tools/diagrams_remote_places.py   -> archive/img/rp_*.jpg + записи в archive/credits.json
Нижние 250 px каждого кадра пустые (субтитры)."""
import sys, math, json, os, urllib.request
sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools')
from dg import *
import numpy as np

S = Slug('remote_places')
SAFE = H - 250            # ниже этой линии ничего не рисуем
OCEAN = (20, 30, 46); LAND = (88, 94, 106); EDGE = (60, 64, 76)
GJ = '/tmp/world.geo.json'
if not os.path.exists(GJ):
    open(GJ, 'wb').write(urllib.request.urlopen('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json', timeout=60).read())
FEATS = {f['properties']['name']: f['geometry'] for f in json.load(open(GJ))['features']}

def rings(g): return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]
def T(d, xy, t, sz=36, col=TXT, anchor='mm', maxw=None):
    """подпись с тёмной обводкой; размер не меньше 30"""
    if maxw: sz = max(30, fit(d, t, sz, maxw))
    d.text(xy, t, font=F(sz), fill=col, anchor=anchor, stroke_width=4, stroke_fill=BG)
def wrap(d, t, sz, maxw):
    out, cur = [], ''
    for w in t.split():
        nx = (cur + ' ' + w).strip()
        if d.textlength(nx, font=F(sz)) <= maxw: cur = nx
        else: out.append(cur); cur = w
    if cur: out.append(cur)
    return out
def para(d, xy, t, sz, col, maxw, anchor='mm', gap=1.25):
    ls = wrap(d, t, sz, maxw); x, y = xy; y0 = y - (len(ls) - 1) * sz * gap / 2 if anchor[1] == 'm' else y
    for i, l in enumerate(ls): d.text((x, y0 + i * sz * gap), l, font=F(sz), fill=col, anchor=anchor[0] + 'm')
    return len(ls)
def save(key, im, title):
    d = ImageDraw.Draw(im); d.rectangle((0, SAFE, W, H), fill=BG)   # гарантия: низ пустой
    S.save(key, im, title)
def hav(lon1, lat1, lon2, lat2):
    p1, p2 = math.radians(lat1), math.radians(lat2); dl = math.radians(lon2 - lon1)
    h = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2; return 2 * 6371 * math.asin(math.sqrt(h))
def dest(lon, lat, brg, km):
    p1, l1, b, a = math.radians(lat), math.radians(lon), math.radians(brg), km / 6371
    p2 = math.asin(math.sin(p1) * math.cos(a) + math.cos(p1) * math.sin(a) * math.cos(b))
    l2 = l1 + math.atan2(math.sin(b) * math.sin(a) * math.cos(p1), math.cos(a) - math.sin(p1) * math.sin(p2)); return math.degrees(l2), math.degrees(p2)

# ---------- карта: азимутальная равновеликая проекция, панель y 140..820 ----------
PY0, PY1 = 140, 770
def laea(lon0, lat0):
    l0, p0 = math.radians(lon0), math.radians(lat0)
    def f(lon, lat):
        l, p = math.radians(lon), math.radians(lat)
        c = math.sin(p0) * math.sin(p) + math.cos(p0) * math.cos(p) * math.cos(l - l0)
        k = math.sqrt(2 / max(1e-6, 1 + c)) * 6371
        return k * math.cos(p) * math.sin(l - l0), k * (math.cos(p0) * math.sin(p) - math.sin(p0) * math.cos(p) * math.cos(l - l0))
    return f
class Map:
    def __init__(self, center, half_km, title, note=None, cx=W / 2):
        self.im, self.d = S.new(title, None); self.f = laea(*center); self.sc = (PY1 - PY0) / 2 / half_km; self.cx = cx; self.cy = (PY0 + PY1) / 2; self.center = center
        lay = Image.new('RGB', (W, H), OCEAN); ld = ImageDraw.Draw(lay)
        for n, g in FEATS.items():
            for r in rings(g):
                if all(math.sin(math.radians(center[1])) * math.sin(math.radians(la)) + math.cos(math.radians(center[1])) * math.cos(math.radians(la)) * math.cos(math.radians(lo - center[0])) < 0.05 for lo, la in r): continue
                pts = list(r)
                ld.polygon([self.P(lo, la) for lo, la in pts], fill=LAND, outline=EDGE)
        mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rectangle((0, PY0, W, PY1), fill=255); self.im.paste(lay, (0, 0), mask)
        self.d = ImageDraw.Draw(self.im)
        if note: T(self.d, (W / 2, PY1 + 34), note, 34, SUB, maxw=1800)
    def P(self, lon, lat):
        x, y = self.f(lon, lat); return self.cx + x * self.sc, self.cy - y * self.sc
    def dot(self, lon, lat, col, r=13):
        x, y = self.P(lon, lat); self.d.ellipse((x - r, y - r, x + r, y + r), fill=col, outline=BG, width=3); return x, y
    def label(self, lon, lat, t, col, dx=24, dy=0, sz=38, anchor='lm'):
        x, y = self.P(lon, lat); T(self.d, (x + dx, y + dy), t, sz, col, anchor)
    def circle(self, lon, lat, km, col, width=5, dash=False):
        pts = [self.P(*dest(lon, lat, b, km)) for b in range(0, 361, 3)]
        for i in range(len(pts) - 1):
            if dash and i % 2: continue
            self.d.line((pts[i], pts[i + 1]), fill=col, width=width)
    def gc(self, a, b, col, width=5, dash=False):
        n = 60; L = hav(*a, *b); brg = None
        pts = []
        for i in range(n + 1):
            t = i / n; p1, l1 = math.radians(a[1]), math.radians(a[0]); p2, l2 = math.radians(b[1]), math.radians(b[0]); dd = L / 6371
            if dd == 0: pts.append(self.P(*a)); continue
            A = math.sin((1 - t) * dd) / math.sin(dd); B = math.sin(t * dd) / math.sin(dd)
            x = A * math.cos(p1) * math.cos(l1) + B * math.cos(p2) * math.cos(l2); y = A * math.cos(p1) * math.sin(l1) + B * math.cos(p2) * math.sin(l2); z = A * math.sin(p1) + B * math.sin(p2)
            pts.append(self.P(math.degrees(math.atan2(y, x)), math.degrees(math.atan2(z, math.hypot(x, y)))))
        for i in range(n):
            if dash and i % 2: continue
            self.d.line((pts[i], pts[i + 1]), fill=col, width=width)
        return pts[n // 2]
    def save(self, key, title):
        self.d.rectangle((0, PY0, W, PY0 + 2), fill=EDGE); self.d.rectangle((0, PY1 - 2, W, PY1), fill=EDGE); save(key, self.im, title)

NEMO = (-123.3933, -48.8767); DUCIE = (-124.78, -24.67); MOTU = (-109.45, -27.20); MAHER = (-126.37, -72.97)
TRIS = (-12.28, -37.11); HEL = (-5.72, -15.95); CAPE = (18.42, -33.92); NIGHT = (-12.48, -37.42); INACC = (-12.68, -37.30); GOUGH = (-9.94, -40.32)
BOUV = (3.37, -54.42)

def iss_icon(d, x, y, s=1.0, col=TXT):
    d.rectangle((x - 70 * s, y - 6 * s, x + 70 * s, y + 6 * s), fill=col)
    for dx in (-60, -35, 35, 60): d.rectangle((x + dx * s - 9 * s, y - 34 * s, x + dx * s + 9 * s, y + 34 * s), fill=BL)
    d.rectangle((x - 16 * s, y - 14 * s, x + 16 * s, y + 14 * s), fill=col)
def ship_icon(d, x, y, col=OR, s=1.0):
    d.polygon([(x - 40 * s, y - 8 * s), (x + 40 * s, y - 8 * s), (x + 28 * s, y + 14 * s), (x - 28 * s, y + 14 * s)], fill=col); d.rectangle((x - 12 * s, y - 28 * s, x + 14 * s, y - 8 * s), fill=col)

# ===================== 1. Точка Немо на картах =====================
def nemo_region(key, title, note, names, ring_label, center_label, title_cap):
    m = Map((NEMO[0] + 2, NEMO[1] - 1), 3300, title, note)
    m.circle(*NEMO, 2688, OR, 6)
    if names: m.gc(NEMO, MAHER, OR, 3, dash=True)
    m.dot(*NEMO, OR, 16)
    if center_label: m.label(*NEMO, center_label, OR, 28, 0, 42)
    if names:
        m.dot(*DUCIE, BL); m.label(*DUCIE, 'о. Дюси', BL, -24, -6, 38, 'rm')
        m.dot(*MOTU, BL); m.label(*MOTU, 'Моту-Нуи', BL, 24, -30, 38, 'lm')
        m.dot(*MAHER, BL); m.label(*MAHER, 'о. Махер', BL, 24, 24, 38, 'lm')
    if ring_label:
        x, y = m.P(*dest(*NEMO, 250, 2688)); T(m.d, (x - 20, y), ring_label, 38, OR, 'rm')
    m.save(key, title_cap)
nemo_region('rp_nemo_circle', 'Точка, откуда до любой суши больше 2 500 км', 'Южная часть Тихого океана. Круг: всё, что ближе к точке, чем любая суша', False, 'больше 2 500 км', '?', 'Круг вокруг точки: до суши больше 2 500 км')
nemo_region('rp_nemo_map', 'Точка Немо: ближайшая суша ≈ 2 690 км', 'Три ближайшие земли лежат на краю круга', True, '≈ 2 690 км', 'Точка Немо', 'Точка Немо и три ближайшие земли')

# мир: где точка Немо (равнопромежуточная проекция с сеткой)
def world_map(key, title, note, coords):
    im, d = S.new(title, None); k = 4.4; X0 = (W - 360 * k) / 2; LAT0 = 80; Y0 = PY0
    PX = lambda lo, la: (X0 + (lo + 180) * k, Y0 + (LAT0 - la) * k)
    lay = Image.new('RGB', (W, H), OCEAN); ld = ImageDraw.Draw(lay)
    for n, g in FEATS.items():
        for r in rings(g):
            u = [list(r[0])]
            for lo, la in r[1:]:
                pv = u[-1][0]
                while lo - pv > 180: lo -= 360
                while lo - pv < -180: lo += 360
                u.append([lo, la])
            if n == 'Antarctica': u = u + [[u[-1][0], -90], [u[0][0], -90]]
            for off in (-360, 0, 360): ld.polygon([PX(lo + off, la) for lo, la in u], fill=LAND)
    for la in range(-60, 81, 30): ld.line((PX(-180, la), PX(180, la)), fill=(40, 52, 72), width=2)
    for lo in range(-180, 181, 30): ld.line((PX(lo, 80), PX(lo, -75)), fill=(40, 52, 72), width=2)
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rectangle((X0, PY0, X0 + 360 * k, PY1), fill=255); im.paste(lay, (0, 0), mask); d = ImageDraw.Draw(im)
    x, y = PX(*NEMO)
    if coords:
        d.line((PX(-180, NEMO[1]), PX(180, NEMO[1])), fill=YL, width=3); d.line((PX(NEMO[0], 80), PX(NEMO[0], 80 - (PY1 - PY0) / k)), fill=YL, width=3)
        T(d, (x + 30, y + 40), '≈ 49° ю. ш.', 40, YL, 'lm'); T(d, (x + 16, PY0 + 40), '≈ 123° з. д.', 40, YL, 'lm')
    d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=OR, outline=BG, width=3); T(d, (x - 28, y - 40), 'Точка Немо', 44, OR, 'rm')
    if note: T(d, (W / 2, PY1 + 34), note, 34, SUB, maxw=1800)
    save(key, im, title)
world_map('rp_nemo_world', 'Точка Немо: южная часть Тихого океана', None, False)
world_map('rp_nemo_coords', 'Координаты точки Немо', 'примерно 49° южной широты и 123° западной долготы', True)

# ===================== 2. МКС ближе, чем суша (разрез в масштабе) =====================
def iss_vs_land(key, title, dist_lbl):
    im, d = S.new(title, None); k = 1400 / 2690; x0 = 240; y0 = 690
    d.rectangle((x0 - 60, y0, x0 + 1400, y0 + 40), fill=OCEAN); d.rectangle((x0 + 1400, y0 - 30, x0 + 1520, y0 + 40), fill=LAND)
    T(d, (x0 + 1460, y0 + 80), 'суша', 34, SUB)
    d.ellipse((x0 - 12, y0 - 12, x0 + 12, y0 + 12), fill=OR); T(d, (x0, y0 + 80), 'точка', 34, OR)
    yi = y0 - 400 * k
    for yy in range(int(yi) + 30, y0 - 10, 22): d.line((x0, yy, x0, yy + 11), fill=TXT, width=4)
    iss_icon(d, x0, yi, 0.8); T(d, (x0 + 90, yi), 'МКС ≈ 400 км вверх', 44, TXT, 'lm')
    d.line((x0 + 20, y0 - 40, x0 + 1390, y0 - 40), fill=OR, width=5); d.polygon([(x0 + 1400, y0 - 40), (x0 + 1375, y0 - 54), (x0 + 1375, y0 - 26)], fill=OR)
    T(d, (x0 + 700, y0 - 80), dist_lbl, 46, OR)
    T(d, (W / 2, PY1 + 34), 'масштаб соблюдён (1 км = 1 км), кривизна Земли не показана', 32, SUB)
    save(key, im, title)
iss_vs_land('rp_iss_vs_land_a', 'Ближайшие люди: над головой', 'до суши больше 2 500 км')
iss_vs_land('rp_iss_vs_land', 'Кто ближе к точке Немо?', 'до ближайшей суши ≈ 2 690 км')

# ===================== 3. текстовые карточки по словам диктора =====================
im, d = S.new('«Немо» по-латыни', None)
T(d, (W / 2, 330), 'НЕМО', 170, OR); T(d, (W / 2, 520), '=  «никто»', 110, TXT)
save('rp_nemo_latin', im, '«Немо» значит «никто»')

im, d = S.new('Вопрос ролика', None)
T(d, (W / 2, 330), 'Как измерить', 110, TXT); T(d, (W / 2, 480), 'слово «далеко»?', 110, YL)
save('rp_q_far', im, 'Как измерить «далеко»?')

im, d = S.new('Далеко — от чего?', None)
for i, (t, c) in enumerate((('от суши', BL), ('от людей', OR), ('от порта', GN), ('от больницы', RD))):
    x = 260 + i * 467; d.rounded_rectangle((x - 200, 300, x + 200, 560), 28, outline=c, width=6); T(d, (x, 430), t, 48, c, maxw=360)
T(d, (W / 2, 700), 'пока не сказано, от чего считать, «отдалённость» ничего не значит', 36, SUB, maxw=1760)
save('rp_from_what', im, 'Далеко от чего?')

# полюс недоступности: настоящий расчёт на схеме (точка воды, самая далёкая от берега)
def blob(cx, cy, R, seed, amp=0.22, n=360):
    rs = np.random.RandomState(seed); ks = rs.randint(2, 7, 5); ph = rs.rand(5) * 6.28; am = rs.rand(5) * amp
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n; r = R * (1 + sum(am[j] * math.sin(ks[j] * a + ph[j]) for j in range(5)) / 2.2); pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts
def pole_panel(box, islands, seed=7):
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0
    m = Image.new('L', (w, h), 0); md = ImageDraw.Draw(m)
    md.polygon(blob(w / 2, h / 2, min(w, h) * 0.46, seed), fill=255)
    for (ix, iy, ir) in islands: md.ellipse((ix - ir, iy - ir, ix + ir, iy + ir), fill=0)
    A = np.array(m) > 0
    ys, xs = np.nonzero(A[::3, ::3]); ys *= 3; xs *= 3
    land = ~A; ly, lx = np.nonzero(land[::2, ::2]); ly *= 2; lx *= 2
    edge = np.zeros_like(land); edge[1:-1, 1:-1] = land[1:-1, 1:-1] & ~(land[:-2, 1:-1] & land[2:, 1:-1] & land[1:-1, :-2] & land[1:-1, 2:])
    ey, ex = np.nonzero(edge)
    best = (-1, 0, 0)
    for s in range(0, len(xs), 2000):
        dx = xs[s:s + 2000, None] - ex[None, :]; dy = ys[s:s + 2000, None] - ey[None, :]; dm = np.sqrt((dx * dx + dy * dy).min(axis=1)); i = int(dm.argmax())
        if dm[i] > best[0]: best = (float(dm[i]), int(xs[s + i]), int(ys[s + i]))
    return m, best
def draw_pole(im, d, box, islands, seed=7, col=OR):
    x0, y0, x1, y1 = box; m, (r, px, py) = pole_panel(box, islands, seed)
    land = Image.new('RGB', (x1 - x0, y1 - y0), LAND); sea = Image.new('RGB', (x1 - x0, y1 - y0), OCEAN); land.paste(sea, (0, 0), m); im.paste(land, (x0, y0))
    cx, cy = x0 + px, y0 + py
    for a in range(0, 360, 6):
        if a % 12: continue
        p = lambda aa: (cx + r * math.cos(math.radians(aa)), cy + r * math.sin(math.radians(aa)))
        d.line((p(a), p(a + 6)), fill=col, width=4)
    d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=col, outline=BG, width=3)
    return cx, cy, r
im, d = S.new('Полюс недоступности', None)
cx, cy, r = draw_pole(im, d, (560, 150, 1360, 800), [])
T(d, (cx, cy - 46), 'полюс', 40, OR); d.line((cx, cy, cx + r, cy), fill=YL, width=4); T(d, (cx + r / 2, cy + 36), 'до берега', 34, YL)
T(d, (W / 2, PY1 + 34), 'точка, самая далёкая от берега: круг касается суши в нескольких местах (схема)', 34, SUB, maxw=1800)
save('rp_pole_def', im, 'Что такое полюс недоступности')

im, d = S.new('Свой полюс у океана, у материка и у льда', None)
for i, (big, sub, c) in enumerate((('океан', 'дальше всего от берега', BL), ('материк', 'дальше всего от океана', OR), ('лёд', 'на дрейфующем льду', TXT))):
    x = W / 2 + (i - 1) * 590; d.rounded_rectangle((x - 270, 260, x + 270, 620), 30, outline=c, width=5); T(d, (x, 390), big, 84, c, maxw=480); T(d, (x, 530), sub, 36, TXT, maxw=500)
T(d, (W / 2, 720), 'разные определения дают разных победителей', 38, SUB)
save('rp_pole_kinds', im, 'Три вида полюсов недоступности')

im, d = S.new('1992: точку нашли расчётом', None)
for i, (t, c) in enumerate((('данные о береговой линии', BL), ('программа на компьютере', OR), ('точка на карте', YL))):
    x = 340 + i * 620; d.rounded_rectangle((x - 250, 300, x + 250, 540), 28, outline=c, width=6); para(d, (x, 420), t, 46, c, 440)
    if i < 2: d.line((x + 265, 420, x + 350, 420), fill=SUB, width=6); d.polygon([(x + 372, 420), (x + 345, 404), (x + 345, 436)], fill=SUB)
T(d, (W / 2, 660), 'инженер Хрвое Лукатела: ни корабля, ни экспедиции', 40, TXT)
save('rp_lukatela', im, '1992: расчёт Хрвое Лукателы')

# как берег сдвигает полюс: одна и та же схема без островка и с островком
im, d = S.new('Нарисуй берег иначе — и полюс сдвинется', None)
pa = draw_pole(im, d, (100, 170, 900, 730), [], seed=11, col=BL)
isl = [(pa[0] - 100 - 0.5 * pa[2], pa[1] - 170 - 0.35 * pa[2], 20)]
pb = draw_pole(im, d, (1020, 170, 1820, 730), isl, seed=11, col=OR)
gx, gy = pa[0] - 100 + 1020, pa[1]
d.ellipse((gx - 11, gy - 11, gx + 11, gy + 11), outline=BL, width=4)
d.line((gx, gy, pb[0], pb[1]), fill=YL, width=4)
T(d, (500, 775), 'без островка', 40, BL); T(d, (1420, 775), 'учли маленький островок', 40, OR)
ix, iy = 1020 + isl[0][0], 170 + isl[0][1]; T(d, (ix - 30, iy - 40), 'островок', 34, TXT, 'mm')
print('shift px', round(math.hypot(gx - pb[0], gy - pb[1])))
save('rp_coast_shift', im, 'Учёт островка сдвигает полюс')

im, d = S.new('Почему везде «около»', None)
T(d, (W / 2, 380), '≈', 260, YL)
T(d, (W / 2, 620), 'почти каждая цифра в этом ролике будет с пометкой «около»', 42, TXT, maxw=1760)
save('rp_okolo', im, 'Почему цифры «около»')

def rulers(key, full):
    im, d = S.new('Три линейки', None)
    rows = (('до любой суши', 'океан: Точка Немо', BL), ('до жилья', 'остров: Тристан-да-Кунья', OR), ('до людей', 'космос: МКС над океаном', YL))
    for i, (a, b, c) in enumerate(rows):
        y = 260 + i * 170; d.rounded_rectangle((160, y - 60, 760, y + 60), 24, outline=c, width=5)
        for t in range(10): d.line((190 + t * 60, y + 60, 190 + t * 60, y + (30 if t % 5 else 10)), fill=c, width=4)
        T(d, (460, y - 12), a, 46, c)
        if full: d.line((800, y, 920, y), fill=SUB, width=5); d.polygon([(945, y), (918, y - 16), (918, y + 16)], fill=SUB); T(d, (980, y), b, 48, TXT, 'lm', maxw=900)
    T(d, (W / 2, 760), 'три разных места: это честный результат, а не ошибка', 38, SUB)
    save(key, im, 'Три линейки отдалённости')
rulers('rp_rulers', False); rulers('rp_rulers_full', True)

# сколько плыть (наша прикидка)
im, d = S.new('Сколько плыть до ближайшей суши?', None)
items = (('15 узлов (≈ 28 км/ч)', 2690 / 27.8 / 24), ('10 узлов (≈ 18,5 км/ч)', 2690 / 18.52 / 24))
for i, (nm, days) in enumerate(items):
    y = 300 + i * 150; w = 1150 * days / 7; d.rectangle((560, y - 40, 560 + w, y + 40), fill=BL if i else OR)
    T(d, (530, y), nm, 38, SUB, 'rm'); T(d, (560 + w + 20, y), f'≈ {days:.0f} суток', 46, TXT, 'lm')
T(d, (W / 2, 600), '2 690 км до ближайшей суши, плыть без остановок', 40, TXT)
T(d, (W / 2, 680), 'наша прикидка: расстояние делим на скорость судна', 36, SUB)
save('rp_ship_days', im, 'Сколько плыть до суши: прикидка')

# ===================== 4. МКС =====================
im, d = S.new('Один оборот станции ≈ 90 минут', None)
x0, x1, y = 160, 1760, 430; n = 16; w = (x1 - x0) / n
for i in range(n):
    xa = x0 + i * w; d.rectangle((xa, y - 50, xa + w / 2, y + 50), fill=(250, 200, 90)); d.rectangle((xa + w / 2, y - 50, xa + w, y + 50), fill=(30, 40, 70))
    d.ellipse((xa - 9, y - 80, xa + 9, y - 62), fill=YL)
T(d, (x0, y + 100), '0 ч', 36, SUB, 'lm'); T(d, (x1, y + 100), '24 ч', 36, SUB, 'rm')
T(d, (W / 2, 260), '24 часа ÷ 90 минут = 16 оборотов', 50, TXT)
T(d, (W / 2, 600), '16 восходов в сутки', 70, YL)
T(d, (W / 2, 700), 'светлое: день на орбите, тёмное: ночь (схема)', 34, SUB)
save('rp_iss_orbit', im, '16 восходов в сутки')

im, d = S.new('Станция: ≈ 8 км/с, люди на борту без перерыва', None)
x0, x1, y = 200, 1720, 470; k = (x1 - x0) / 26
d.rectangle((x0, y - 34, x1, y + 34), fill=BL)
for yr in range(2000, 2027, 5): xx = x0 + (yr - 2000) * k; d.line((xx, y + 40, xx, y + 60), fill=SUB, width=4); T(d, (xx, y + 95), str(yr), 36, SUB)
T(d, (x0, y - 90), 'ноябрь 2000', 44, OR, 'lm'); T(d, (x1, y - 90), '2026', 44, OR, 'rm')
T(d, (W / 2, 280), '≈ 8 км/с', 90, YL)
T(d, (W / 2, 700), 'пустой станции над океаном почти не бывает', 40, TXT)
save('rp_iss_years', im, 'МКС: 8 км/с, экипаж с 2000 года')

im, d = S.new('Когда ближайшие люди не на станции', None)
cx, cy, R = 700, 470, 290
d.ellipse((cx - R - 40, cy - R - 40, cx + R + 40, cy + R + 40), fill=OCEAN)
for a in range(0, 360, 8): p = lambda aa: (cx + R * math.cos(math.radians(aa)), cy + R * math.sin(math.radians(aa))); d.line((p(a), p(a + 4)), fill=YL, width=5)
d.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=OR); T(d, (cx, cy + 46), 'точка', 34, OR)
d.line((cx, cy, cx - R, cy), fill=YL, width=3); T(d, (cx - R / 2, cy - 36), '400 км', 36, YL)
ship_icon(d, cx + 150, cy - 120, TXT, 1.1)
T(d, (1110, 330), 'Радиус круга = высота МКС', 40, YL, 'lm', maxw=780)
T(d, (1110, 420), 'Корабль внутри круга', 40, TXT, 'lm', maxw=780)
T(d, (1110, 475), 'ближе к точке, чем станция', 40, TXT, 'lm', maxw=780)
T(d, (1110, 580), 'Поэтому это прикидка,', 38, SUB, 'lm', maxw=780); T(d, (1110, 630), 'а не измерение', 38, SUB, 'lm', maxw=780)
save('rp_ship_near', im, 'Корабль ближе 400 км отменяет прикидку')

# ===================== 5. жизнь и затопленные аппараты =====================
im, d = S.new('Почему у точки Немо мало жизни', None)
for i, (t, c) in enumerate((('мало питательных веществ в воде', BL), ('мало планктона', GN), ('мало всего остального', SUB))):
    x = 340 + i * 620; d.rounded_rectangle((x - 260, 300, x + 260, 540), 28, outline=c, width=6); para(d, (x, 420), t, 44, c, 460)
    if i < 2: d.line((x + 275, 420, x + 350, 420), fill=SUB, width=6); d.polygon([(x + 372, 420), (x + 345, 404), (x + 345, 436)], fill=SUB)
T(d, (W / 2, 680), 'так описывают этот район (упрощённая схема)', 36, SUB)
save('rp_life_chain', im, 'Почему мало жизни')

im, d = S.new('≈ 260 отработавших аппаратов в районе', None)
cols, rws, r, g = 26, 10, 18, 20
x0 = (W - cols * (2 * r + g) + g) / 2
for i in range(260):
    x = x0 + (i % cols) * (2 * r + g) + r; y = 200 + (i // cols) * (2 * r + g) + r; d.ellipse((x - r, y - r, x + r, y + r), fill=OR)
T(d, (W / 2, 790), 'оценка; одна точка — один аппарат', 36, SUB)
save('rp_260', im, '≈ 260 затопленных аппаратов (оценка)')

im, d = S.new('Управляемое падение (схема)', None)
ecx, ecy, ER = W / 2, 1900, 1250
d.ellipse((ecx - ER, ecy - ER, ecx + ER, ecy + ER), fill=OCEAN)
d.arc((ecx - ER - 300, ecy - ER - 300, ecx + ER + 300, ecy + ER + 300), 215, 325, fill=SUB, width=4)
def onarc(a, rr): return ecx + rr * math.cos(math.radians(a)), ecy + rr * math.sin(math.radians(a))
pts = [onarc(246 + t * 44, ER + 300 * (1 - t) ** 1.5) for t in [i / 40 for i in range(41)]]
for i in range(40): d.line((pts[i], pts[i + 1]), fill=OR, width=6)
bx, by = pts[0]; d.ellipse((bx - 16, by - 16, bx + 16, by + 16), fill=YL); T(d, (bx, by - 50), '1. торможение', 40, YL)
mx, my = pts[14]; T(d, (mx - 40, my + 80), '2. вход в атмосферу', 40, OR)
fx, fy = pts[-1]
for k in range(8): d.ellipse((fx - 50 + k * 12, fy - 4 - (k % 3) * 6, fx - 42 + k * 12, fy + 4 - (k % 3) * 6), fill=TXT)
T(d, (fx + 30, fy + 60), '3. обломки — в пустой океан', 40, TXT, 'mm')
T(d, (W / 2, 160), 'так затопили «Мир» (2001); так планируют свести и МКС', 38, SUB, maxw=1760)
T(d, (W / 2, 790), 'орбита', 32, SUB) if False else None
save('rp_deorbit', im, 'Управляемое затопление: схема')

# ===================== 6. другие полюса =====================
AP_NEW = (-176.15, 85.80); AP_OLD = (-174.85, 84.05)
m = Map((-150, 82), 2300, 'Арктический полюс недоступности', 'на дрейфующем льду; около 1 000 км до суши')
m.circle(*AP_NEW, 1008, OR, 5, dash=True)
m.dot(0, 90, SUB, 9); m.label(0, 90, 'Северный полюс', SUB, 20, -26, 34)
m.dot(*AP_OLD, BL, 11); m.label(*AP_OLD, 'прежняя оценка', BL, -26, 26, 36, 'rm')
m.dot(*AP_NEW, OR, 13); m.label(*AP_NEW, 'по измерениям 2013 года', OR, 26, 10, 38)
x, y = m.P(*dest(*AP_NEW, 200, 1008)); T(m.d, (x - 10, y + 40), '≈ 1 000 км', 40, OR, 'rm')
T(m.d, (W - 60, PY0 + 50), 'сдвиг ≈ 200 км', 44, YL, 'rm')
m.save('rp_arctic', 'Арктический полюс недоступности')

ANT = (54.97, -82.10)
m = Map((30, -82), 2500, 'Полюс недоступности Антарктиды', 'исследование 2021 года: таких полюсов можно насчитать два')
m.dot(0, -90, SUB, 9); m.label(0, -90, 'Южный полюс', SUB, 20, 30, 34)
m.dot(*ANT, OR, 14); m.label(*ANT, 'бывшая советская станция', OR, 26, -22, 40); m.label(*ANT, '(там стоял бюст Ленина)', OR, 26, 26, 36)
m.save('rp_antarctic', 'Полюс недоступности Антарктиды')

EUR = (86.67, 46.28); URU = (87.58, 43.80)
m = Map(EUR, 3100, 'Дальше всего от океана: северо-запад Китая', 'далеко от моря не значит далеко от людей')
m.circle(*EUR, 2600, OR, 5, dash=True)
m.dot(*EUR, OR, 14); m.label(*EUR, 'полюс недоступности Евразии', OR, 26, -30, 38)
m.dot(*URU, BL, 11); m.label(*URU, 'город Урумчи', BL, 22, 30, 36)
m.gc(EUR, dest(*EUR, 172, 2600), OR, 3); x, y = m.P(*dest(*EUR, 172, 1500)); T(m.d, (x - 24, y), '≈ 2 600 км до океана', 40, OR, 'rm')
m.save('rp_eurasia', 'Полюс недоступности Евразии')

COAST = dest(*BOUV, 180, 1700)
m = Map((4, -62), 1500, 'Остров Буве', 'постоянных жителей нет')
m.gc(BOUV, COAST, OR, 5, dash=True); m.dot(*COAST, OR, 9)
m.dot(*BOUV, YL, 14); m.label(*BOUV, 'о. Буве (Норвегия)', YL, 26, -10, 42)
x, y = m.P(BOUV[0], (BOUV[1] + COAST[1]) / 2); T(m.d, (x + 26, y), '≈ 1 700 км до берега Антарктиды', 40, OR, 'lm')
m.save('rp_bouvet', 'Остров Буве: до Антарктиды ≈ 1 700 км')

im, d = S.new('Буве: почти весь остров подо льдом', None)
cols = 20; r = 20
x0 = (W - cols * 2 * (r + 6)) / 2
for i in range(100):
    x = x0 + (i % cols) * 2 * (r + 6) + r; y = 200 + (i // cols) * 2 * (r + 6) + r; d.ellipse((x - r, y - r, x + r, y + r), fill=(200, 225, 245) if i < 90 else GR)
T(d, (W / 2, 560), '≈ 90 % покрыто ледником', 80, (200, 225, 245)); T(d, (W / 2, 680), 'одна точка = 1 % площади острова', 36, SUB)
save('rp_bouvet_90', im, 'Буве: ≈ 90 % подо льдом')

im, d = S.new('Остров Буве: две даты', None)
d.line((200, 430, 1720, 430), fill=SUB, width=6)
for x, yr, a, b, c in ((520, '1928', 'Норвегия объявила', 'остров своим', BL), (1400, '1979', 'спутник заметил рядом', 'двойную вспышку', OR)):
    d.ellipse((x - 18, 412, x + 18, 448), fill=c); T(d, (x, 350), yr, 70, c); T(d, (x, 520), a, 40, TXT); T(d, (x, 575), b, 40, TXT)
T(d, (W / 2, 700), 'природу вспышки официально не установили', 40, SUB)
save('rp_bouvet_dates', im, 'Буве: 1928 и 1979')

# ===================== 7. глубина =====================
im, d = S.new('Бездна Челленджера: ≈ 11 км вниз', None)
top, k = 190, 52; x0, x1 = 300, 820
d.rectangle((x0, top, x1, top + 11 * k), fill=OCEAN); d.line((x0 - 30, top, x1 + 30, top), fill=BL, width=5)
d.polygon([(x0, top + 11 * k), (x1, top + 11 * k), (x1, top + 11 * k + 16), (x0, top + 11 * k + 16)], fill=LAND)
for km in range(0, 12, 2): yy = top + km * k; d.line((x0 - 40, yy, x0 - 10, yy), fill=SUB, width=3); T(d, (x0 - 50, yy), f'{km} км', 34, SUB, 'rm')
T(d, (x1 + 50, top), 'поверхность океана', 38, BL, 'lm'); T(d, (x1 + 50, top + 11 * k), 'дно: ≈ 11 км', 44, OR, 'lm')
T(d, (1000, 360), 'Люди на дне побывали:', 44, TXT, 'lm')
for i, t in enumerate(('1960', '2012', '2019', 'и позже')): T(d, (1060, 430 + i * 60), t, 44, YL, 'lm')
T(d, (1000, 700), 'спускались считаные единицы', 40, SUB, 'lm')
save('rp_depth', im, 'Бездна Челленджера ≈ 11 км')

im, d = S.new('Вверх и вниз в одном масштабе', None)
k = 1.4; surf = 760; xl = 560
d.rectangle((0, surf, W, surf + 2), fill=BL); d.rectangle((xl - 40, surf + 2, xl + 40, surf + 11 * k), fill=OR)
iss_icon(d, xl, surf - 400 * k, 0.7)
for yy in range(int(surf - 400 * k) + 30, surf - 10, 22): d.line((xl, yy, xl, yy + 11), fill=TXT, width=3)
T(d, (xl + 90, surf - 400 * k), 'вверх: МКС ≈ 400 км', 46, TXT, 'lm')
T(d, (xl + 90, surf - 30), 'вниз: дно Бездны ≈ 11 км', 46, OR, 'lm')
T(d, (W - 80, 400), 'и там, и там', 40, SUB, 'rm'); T(d, (W - 80, 455), 'почти никого', 40, SUB, 'rm')
save('rp_up_down', im, 'Вверх и вниз: 400 км и 11 км')

# ===================== 8. Тристан-да-Кунья =====================
m = Map((-4, -27), 1900, 'Тристан-да-Кунья: южная Атлантика', 'источники дают расстояние чуть по-разному', cx=W / 2 - 80)
mid = m.gc(TRIS, HEL, OR, 5, dash=True)
m.dot(*HEL, BL, 12); m.label(*HEL, 'о. Святой Елены (ближайшие жители)', BL, 24, 0, 36)
m.dot(*TRIS, OR, 15); m.label(*TRIS, 'Тристан-да-Кунья', OR, -26, 0, 42, 'rm')
T(m.d, (mid[0] + 30, mid[1]), '≈ 2 400 км', 44, OR, 'lm')
m.save('rp_tristan_loc', 'Тристан: до Святой Елены ≈ 2 400 км')

m = Map((3, -34), 1700, 'Только кораблём: из Кейптауна ≈ 6 суток', 'аэропорта на острове нет')
mid = m.gc(CAPE, TRIS, OR, 6, dash=True)
m.dot(*CAPE, BL, 13); m.label(*CAPE, 'Кейптаун', BL, 24, -30, 40)
m.dot(*TRIS, OR, 15); m.label(*TRIS, 'Тристан-да-Кунья', OR, -26, 0, 42, 'rm')
ship_icon(m.d, mid[0], mid[1] - 50, TXT, 1.0); T(m.d, (mid[0], mid[1] + 50), '≈ 6 суток', 46, TXT)
m.save('rp_cape_route', 'Из Кейптауна на Тристан: ≈ 6 суток')

im, d = S.new('Сколько людей на Тристане?', None)
x0, x1, y = 200, 1720, 470; k = (x1 - x0) / 300
d.line((x0, y, x1, y), fill=SUB, width=4)
for v in range(0, 301, 50): xx = x0 + v * k; d.line((xx, y - 14, xx, y + 14), fill=SUB, width=4); T(d, (xx, y + 50), str(v), 34, SUB)
d.rectangle((x0 + 240 * k, y - 110, x0 + 295 * k, y - 60), fill=BL); T(d, (x1, y - 160), 'другие источники: 240 — почти 300', 38, BL, 'rm')
xx = x0 + 220 * k; d.ellipse((xx - 18, y - 18, xx + 18, y + 18), fill=OR); T(d, (xx - 30, y - 85), 'данные 2026: ≈ 220', 44, OR, 'rm')
T(d, (W / 2, 660), 'число колеблется: рождения, отъезды; верен лишь порядок величины', 36, SUB, maxw=1760)
save('rp_population', im, 'Население Тристана: ≈ 220 (2026)')

def history(key, hi):
    im, d = S.new('Как заселили Тристан', None)
    x0, x1, y = 200, 1720, 450; k = (x1 - x0) / 100
    d.line((x0, y, x1, y), fill=SUB, width=6)
    for yr in (1800, 1850, 1900): xx = x0 + (yr - 1800) * k; T(d, (xx, y + 50), str(yr), 32, GR)
    pts = ((1810, 'Джонатан Ламберт', 'первый житель', -1), (1816, 'Британия присоединила;', 'остался Уильям Гласс', 1), (1867, 'посёлок назван', 'в честь принца Альфреда', -1), (1892, 'крушение судна «Италия»:', 'итальянские моряки', 1))
    for yr, a, b, side in pts:
        xx = x0 + (yr - 1800) * k; c = OR if (hi is None or yr == hi) else GR; tc = TXT if (hi is None or yr == hi) else GR
        d.ellipse((xx - 16, y - 16, xx + 16, y + 16), fill=c)
        yy = y - 210 if side < 0 else y + 120
        anc = 'rm' if yr == 1892 else 'lm'; ax = xx + 20 if yr == 1892 else xx - 20
        T(d, (ax, yy), str(yr), 54, c, anc); T(d, (ax, yy + 62), a, 36, tc, anc); T(d, (ax, yy + 106), b, 36, tc, anc)
    save(key, im, 'Хронология Тристана')
history('rp_history_1867', 1867)
for _y in (1810, 1816, 1892): history(f'rp_history_{_y}', _y)

im, d = S.new('Эдинбург Семи Морей', None)
T(d, (W / 2, 280), '1867', 120, OR)
T(d, (W / 2, 440), 'посёлок назвали в честь принца Альфреда,', 46, TXT); T(d, (W / 2, 510), 'герцога Эдинбургского', 46, TXT)
T(d, (W / 2, 660), 'другого посёлка на острове нет', 42, YL)
save('rp_rename_1867', im, '1867: переименование посёлка')

# схема острова (приблизительно, по координатам)
def island_scheme(key, title, show_peak, show_potato):
    im, d = S.new(title, None); cx, cy, kx = W / 2 - 60, 455, 40  # px на км
    lat0 = -37.11; lon0 = -12.285
    P = lambda lo, la: (cx + (lo - lon0) * 111.32 * math.cos(math.radians(lat0)) * kx, cy - (la - lat0) * 111.32 * kx)
    d.rectangle((0, PY0, W, PY1), fill=OCEAN)
    isl = blob(cx, cy, 6.0 * kx, 3, amp=0.10)
    d.polygon(isl, fill=(70, 96, 70))
    for rr, col in ((4.2, (96, 110, 80)), (2.4, (120, 118, 96)), (1.0, (150, 140, 120))): d.polygon(blob(cx, cy, rr * kx, 3, amp=0.06), fill=col)
    vx, vy = P(-12.311, -37.067); d.ellipse((vx - 14, vy - 14, vx + 14, vy + 14), fill=OR, outline=BG, width=3)
    T(d, (vx - 30, vy - 40), 'Эдинбург Семи Морей', 42, OR, 'rm'); T(d, (vx - 30, vy + 8), 'единственный посёлок', 34, TXT, 'rm')
    if show_peak:
        px, py = P(-12.288, -37.095); d.polygon([(px, py - 22), (px - 20, py + 14), (px + 20, py + 14)], fill=TXT)
        T(d, (cx + 6.4 * kx, py), 'Пик королевы Марии', 42, TXT, 'lm'); T(d, (cx + 6.4 * kx, py + 52), '≈ 2 060 м', 42, YL, 'lm')
        d.line((px + 24, py, cx + 6.2 * kx, py), fill=TXT, width=3)
    if show_potato:
        qx, qy = P(-12.335, -37.150); d.rectangle((qx - 14, qy - 14, qx + 14, qy + 14), fill=GN, outline=BG, width=3)
        T(d, (qx - 30, qy + 10), 'Картофельные поля', 40, GN, 'rm')
    d.line((W - 420, PY1 - 40, W - 420 + 5 * kx, PY1 - 40), fill=SUB, width=5); T(d, (W - 420 + 2.5 * kx, PY1 - 75), '5 км', 32, SUB)
    T(d, (W / 2, PY1 + 34), 'схема, положение точек приблизительное', 32, SUB)
    save(key, im, title)
island_scheme('rp_island', 'Остров Тристан: один посёлок', False, False)
island_scheme('rp_island_peak', 'Остров вырос из вулкана', True, False)

im, d = S.new('Фамилии острова', None)
names = ('Гласс', 'Грин', 'Свейн', 'Хейген', 'Коттон', 'Репетто', 'Лаварелло')
for i, nm in enumerate(names):
    row = 0 if i < 4 else 1; n = 4 if row == 0 else 3; j = i if row == 0 else i - 4
    x = W / 2 + (j - (n - 1) / 2) * 430; y = 300 + row * 200
    d.rounded_rectangle((x - 195, y - 70, x + 195, y + 70), 24, outline=OR, width=4); T(d, (x, y), nm, 56, TXT, maxw=360)
T(d, (W / 2, 700), 'фамилий на острове немного', 40, SUB)
save('rp_surnames', im, 'Фамилии Тристана')

m = Map((-11.1, -38.75), 250, 'Ближний круг Тристана', 'на Гофе и Недоступном постоянных жителей нет; на Гофе метеостанция', cx=W / 2 + 40)
mid = m.gc(TRIS, GOUGH, BL, 4, dash=True); T(m.d, (mid[0] + 26, mid[1] - 10), '≈ 350 км', 44, BL, 'lm')
for (lo, la, nm, col, dx, dy, an, rr) in ((*TRIS, 'Тристан', OR, 28, -14, 'lm', 16), (*NIGHT, 'Соловей', TXT, -22, 30, 'rm', 9), (*INACC, 'Недоступный', SUB, -22, -24, 'rm', 9), (*GOUGH, 'Гоф (метеостанция)', BL, 26, 0, 'lm', 11)):
    m.dot(lo, la, col, rr); m.label(lo, la, nm, col, dx, dy, 40, an)
x, y = m.P(*NIGHT); T(m.d, (x + 22, y + 52), '≈ 34 км до Тристана', 36, TXT, 'lm')
m.save('rp_neighbours', 'Соседи Тристана: Соловей, Недоступный, Гоф')

im, d = S.new('10 октября 1961: эвакуация', None)
steps = (('извержение рядом с посёлком', RD), ('264 человека на лодках уходят на остров Соловей', OR), ('утром их забирает голландский корабль', BL), ('Англия: бывший лагерь ВВС у Кэлшота, Хэмпшир', TXT))
for i, (t, c) in enumerate(steps):
    x = 255 + i * 470; d.rounded_rectangle((x - 210, 250, x + 210, 620), 26, outline=c, width=5); T(d, (x, 300), str(i + 1), 54, c); para(d, (x, 470), t, 36, TXT, 370)
    if i < 3: d.polygon([(x + 250, 435), (x + 222, 418), (x + 222, 452)], fill=SUB)
save('rp_evac', im, 'Эвакуация 1961 года')

im, d = S.new('Эвакуация и возвращение', None)
rows = (('1961', 'эвакуированы', 264, '264 человека', OR), ('1963', 'вернулись', 200, '≈ 200 человек', BL))
for i, (yr, a, v, lb, c) in enumerate(rows):
    y = 270 + i * 150; w = 880 * v / 264; T(d, (220, y), yr, 54, c, 'rm'); T(d, (250, y), a, 38, SUB, 'lm')
    d.rectangle((580, y - 40, 580 + w, y + 40), fill=c); T(d, (580 + w + 20, y), lb, 42, TXT, 'lm')
T(d, (W / 2, 640), 'часть людей осталась в Англии', 40, SUB)
save('rp_return', im, 'Возвращение на Тристан')

im, d = S.new('Самое далёкое место, где люди живут', None)
T(d, (W / 2, 360), 'не здесь', 120, OR)
T(d, (W / 2, 560), 'ответ — в конце ролика', 60, TXT)
save('rp_q_where', im, 'Где живут дальше всех?')

im, d = S.new('Ранние оценки расходились', None)
d.rectangle((0, PY0, W, PY1), fill=OCEAN)
for (x, y, t) in ((760, 430, 'оценка 1'), (1120, 400, 'оценка 2')):
    d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=OR, outline=BG, width=3); T(d, (x, y - 50), t, 38, OR)
d.line((780, 429, 1100, 401), fill=YL, width=4)
T(d, (W / 2, 560), 'десятки, а иногда и сотни километров', 48, YL)
T(d, (W / 2, 650), 'одна и та же точка, разные карты берега', 38, TXT)
T(d, (W / 2, PY1 + 34), 'схема: расстояние между точками условное', 32, SUB)
save('rp_estimates', im, 'Ранние оценки расходились')

im, d = S.new('Двойная вспышка 1979 года', None)
T(d, (W / 2, 300), 'официально не установлено', 64, YL)
T(d, (W / 2, 450), 'часто считают испытанием', 50, TXT)
T(d, (W / 2, 540), 'звучали и другие версии', 50, SUB)
save('rp_flash', im, 'Вспышка 1979: версии')

im, d = S.new('≈ 220 человек на Тристане', None)
cols, r, g = 22, 17, 13; x0 = (W - cols * (2 * r + g) + g) / 2
for i in range(220):
    x = x0 + (i % cols) * (2 * r + g) + r; y = 190 + (i // cols) * (2 * r + g) + r; d.ellipse((x - r, y - r, x + r, y + r), fill=OR)
T(d, (W / 2, 720), 'одна точка — один человек; верен порядок величины, а не точное число', 34, SUB, maxw=1760)
save('rp_220_dots', im, '≈ 220 жителей')

im, d = S.new('Вулкан напоминает о себе', None)
T(d, (W / 2, 300), 'последний раз:', 54, SUB); T(d, (W / 2, 450), 'октябрь 1961', 120, RD)
T(d, (W / 2, 610), 'Пик королевы Марии, ≈ 2 060 м', 44, TXT)
save('rp_volcano_1961', im, 'Последнее извержение: 1961')

im, d = S.new('1962: экспедиция на остров', None)
for i, (t, c) in enumerate((('посёлок в основном уцелел', GN), ('разрушена лишь консервная фабрика', RD))):
    x = W / 2 + (i - 0.5) * 820; d.rounded_rectangle((x - 380, 260, x + 380, 560), 30, outline=c, width=6); para(d, (x, 410), t, 54, c, 680)
save('rp_1962', im, 'Экспедиция 1962 года')

# ===================== 9. итог =====================
im, d = S.new('Так какое место самое далёкое?', None)
for i, (a, b, c) in enumerate((('до любой суши', 'Точка Немо', BL), ('самое далёкое жильё', 'Тристан-да-Кунья', OR))):
    x = W / 2 + (i - 0.5) * 820; d.rounded_rectangle((x - 380, 240, x + 380, 600), 30, outline=c, width=6); T(d, (x, 340), a, 44, SUB, maxw=700); T(d, (x, 470), b, 66, c, maxw=700)
T(d, (W / 2, 700), 'всё остальное зависит от определения и от карты', 40, TXT)
save('rp_answer', im, 'Ответ: Точка Немо и Тристан')

im, d = S.new('Что известно твёрдо, а что зависит', None)
for i, (hd, lines, c) in enumerate((('твёрдо', ('Точка Немо дальше всех', 'от суши', 'Тристан: самый удалённый', 'обитаемый остров'), GN), ('зависит от карты и даты', ('«ближайшие люди»', 'точные километры', 'кто и как считает'), YL))):
    x = W / 2 + (i - 0.5) * 860; d.rounded_rectangle((x - 400, 200, x + 400, 740), 30, outline=c, width=5); T(d, (x, 270), hd, 50, c, maxw=740)
    for j, t in enumerate(lines): T(d, (x, 380 + j * 80), t, 42, TXT, maxw=740)
save('rp_firm', im, 'Твёрдо и спорно')

im, d = S.new('Километры и люди', None)
for i, (a, b, c2, c) in enumerate((('МКС над точкой Немо', 'считаные минуты', 'и уходит за горизонт', BL), ('Тристан-да-Кунья', 'люди живут годами', '6 суток до большой земли', OR))):
    x = W / 2 + (i - 0.5) * 820; d.rounded_rectangle((x - 380, 240, x + 380, 640), 30, outline=c, width=6); T(d, (x, 320), a, 46, c, maxw=700); T(d, (x, 450), b, 54, TXT, maxw=700); T(d, (x, 540), c2, 40, SUB, maxw=700)
T(d, (W / 2, 730), 'линейка считает километры, но не считает, кто рядом', 38, TXT, maxw=1760)
save('rp_minutes_years', im, 'Минуты над океаном и годы на острове')

im, d = S.new('А вы как считаете?', None)
T(d, (W / 2, 330), 'Далеко — это', 100, TXT); T(d, (W / 2, 480), 'до суши или до людей?', 100, YL, maxw=1760)
T(d, (W / 2, 660), 'напишите в комментариях', 46, SUB)
save('rp_q_end', im, 'Вопрос зрителям')
print('ok', len(S.new_keys))
