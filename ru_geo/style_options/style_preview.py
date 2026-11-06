# Варианты оформления цифр, плашек, карт и графиков: 4 стиля на одних и тех же кадрах → style_A..D.jpg
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib')); sys.path.insert(0, os.path.join(D, '..', 'norway_pilot'))
import geo
DATA = os.path.join(D, '..', 'data')
W, H = 1920, 1080
BG = sys.argv[1] if len(sys.argv) > 1 else '/tmp'

def F(name, size, wght=None):
    f = ImageFont.truetype(os.path.join(DATA, name), size)
    if wght:
        try:
            axes = f.get_variation_axes(); vals = []
            for a in axes:
                n = a['name'] if isinstance(a['name'], str) else a['name'].decode()
                vals.append(wght if n == 'Weight' else a['default'])
            f.set_variation_by_axes(vals)
        except Exception: pass
    return f

def shadow_text(img, xy, s, f, fill, anchor='la', blur=10, alpha=150, spacing=0):
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    d.text((xy[0], xy[1] + 3), s, font=f, fill=(0, 0, 0, alpha), anchor=anchor)
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(img).text(xy, s, font=f, fill=fill, anchor=anchor)

def spaced(s, n=1): return (' ' * 0).join(s) if n == 0 else s.upper()

def bottom_gradient(img, h=420, a=170):
    g = Image.new('L', (1, h)); [g.putpixel((0, y), int(a * (y / h) ** 1.6)) for y in range(h)]
    g = g.resize((W, h)); ov = Image.new('RGBA', (W, h), (0, 0, 0, 0)); ov.putalpha(g)
    img.alpha_composite(ov, (0, H - h))

def letterspace(d, xy, s, f, fill, track=4):
    x, y = xy
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill); x += f.getlength(ch) + track
    return x

# ---------- общие данные для карты ----------
def map_base():
    import maps
    cam = maps.Cam((64.5, 15), (64.6, 16), 3300, zmax=1.0, highlight='NOR')
    img, T = cam.crop(0)
    a, b = T(cam.P(*maps.LIND)), T(cam.P(*maps.NORDK))
    return img, a, b

STYLES = {}

# ===== A. Чистый белый (минимализм, «National Geographic») =====
def A_number(img):
    bottom_gradient(img)
    d = ImageDraw.Draw(img)
    x, y = 120, 760
    d.line([(x, y - 30), (x + 90, y - 30)], fill=(255, 255, 255, 255), width=4)
    shadow_text(img, (x, y), '21 268 млрд крон', F('Inter.ttf', 104, 800), (255, 255, 255, 255))
    letterspace(d, (x + 4, y + 140), 'СТОИМОСТЬ ФОНДА · 31.12.2025 · NBIM', F('Inter.ttf', 30, 500), (255, 255, 255, 210), 3)
def A_tag(img):
    d = ImageDraw.Draw(img)
    d.line([(80, 70), (80, 130)], fill=(255, 255, 255, 255), width=3)
    letterspace(d, (100, 70), 'ЛЕРДАЛЬСКИЙ ТОННЕЛЬ', F('Inter.ttf', 30, 700), (255, 255, 255, 255), 4)
    letterspace(d, (100, 108), 'ВЕСТЛАНН · НОРВЕГИЯ', F('Inter.ttf', 22, 500), (255, 255, 255, 190), 4)
def A_map(img, a, b):
    d = ImageDraw.Draw(img)
    d.line([a, b], fill=(255, 255, 255, 255), width=4)
    for p, s in ((a, 'Линдеснес'), (b, 'Нордкап')):
        d.ellipse((p[0] - 9, p[1] - 9, p[0] + 9, p[1] + 9), fill=(255, 255, 255, 255))
        shadow_text(img, (p[0] + 22, p[1] - 18), s, F('Inter.ttf', 34, 600), (255, 255, 255, 255))
    shadow_text(img, (1180, 430), '≈ 1 750 км', F('Inter.ttf', 110, 800), (255, 255, 255, 255))
    letterspace(d, (1186, 560), 'ПО ПРЯМОЙ', F('Inter.ttf', 28, 500), (255, 255, 255, 210), 4)
def A_chart(img):
    d = ImageDraw.Draw(img); d.rectangle((0, 0, W, H), fill=(14, 18, 24, 255))
    letterspace(d, (160, 120), 'ЭЛЕКТРОМОБИЛИ СРЕДИ НОВЫХ ЛЕГКОВЫХ', F('Inter.ttf', 34, 700), (255, 255, 255, 255), 4)
    letterspace(d, (160, 172), 'НОРВЕГИЯ · ДОЛЯ ПРОДАЖ ЗА ГОД · OFV', F('Inter.ttf', 24, 500), (160, 170, 185, 255), 4)
    for i, (yr, v) in enumerate((('2024', 88.9), ('2025', 95.9))):
        y = 400 + i * 230
        d.text((160, y), yr, font=F('Inter.ttf', 40, 600), fill=(160, 170, 185, 255))
        d.rectangle((340, y + 8, 340 + 1100, y + 52), fill=(40, 46, 56, 255))
        d.rectangle((340, y + 8, 340 + 11 * v, y + 52), fill=(255, 255, 255, 255) if i else (120, 130, 145, 255))
        d.text((340 + 11 * v + 30, y - 10), f'{v:.1f} %'.replace('.', ','), font=F('Inter.ttf', 64, 800), fill=(255, 255, 255, 255))
STYLES['A'] = ('Чистый белый — минимализм в духе National Geographic: белый шрифт Inter, тонкие линии, без цвета', A_number, A_tag, A_map, A_chart)

# ===== B. Скандинавский (светлые карточки, норвежский красный) =====
NAVY, RED, PAPER = (16, 38, 66), (200, 16, 46), (246, 243, 236)
def card(img, box, r=22, a=235):
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((box[0], box[1] + 10, box[2], box[3] + 10), r, fill=(0, 0, 0, 90))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    ImageDraw.Draw(img).rounded_rectangle(box, r, fill=PAPER + (a,))
def B_number(img):
    card(img, (110, 730, 1010, 960))
    d = ImageDraw.Draw(img); d.rounded_rectangle((110, 730, 122, 960), 6, fill=RED)
    d.text((160, 752), '21 268 млрд крон', font=F('Manrope.ttf', 92, 800), fill=NAVY)
    d.text((164, 880), 'стоимость фонда на 31.12.2025 · NBIM', font=F('Manrope.ttf', 34, 600), fill=(90, 100, 115))
def B_tag(img):
    f = F('Manrope.ttf', 32, 700); w = f.getlength('Лердальский тоннель') + 90
    card(img, (70, 60, 70 + w, 124), r=32)
    d = ImageDraw.Draw(img); d.ellipse((96, 82, 116, 102), fill=RED)
    d.text((132, 92), 'Лердальский тоннель', font=f, fill=NAVY, anchor='lm')
def B_map(img, a, b):
    d = ImageDraw.Draw(img)
    d.line([a, b], fill=(255, 255, 255, 255), width=12); d.line([a, b], fill=RED, width=6)
    for p, s in ((a, 'Линдеснес'), (b, 'Нордкап')):
        d.ellipse((p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12), fill=RED, outline=(255, 255, 255), width=4)
        f = F('Manrope.ttf', 30, 700); w = f.getlength(s) + 40
        card(img, (p[0] + 24, p[1] - 26, p[0] + 24 + w, p[1] + 26), r=26)
        ImageDraw.Draw(img).text((p[0] + 44, p[1]), s, font=f, fill=NAVY, anchor='lm')
    card(img, (1120, 400, 1640, 610)); d = ImageDraw.Draw(img)
    d.rounded_rectangle((1120, 400, 1132, 610), 6, fill=RED)
    d.text((1165, 420), '≈ 1 750 км', font=F('Manrope.ttf', 92, 800), fill=NAVY)
    d.text((1168, 545), 'по прямой', font=F('Manrope.ttf', 34, 600), fill=(90, 100, 115))
def B_chart(img):
    d = ImageDraw.Draw(img); d.rectangle((0, 0, W, H), fill=PAPER + (255,))
    d.text((160, 110), 'Электромобили среди новых легковых машин', font=F('Manrope.ttf', 52, 800), fill=NAVY)
    d.text((160, 185), 'Норвегия, доля продаж за год · OFV', font=F('Manrope.ttf', 32, 600), fill=(110, 118, 130))
    for i, (yr, v) in enumerate((('2024', 88.9), ('2025', 95.9))):
        x = 600 + i * 480; h = 6.2 * v
        d.rounded_rectangle((x, 940 - h, x + 220, 940), 16, fill=RED if i else (170, 182, 198))
        d.text((x + 110, 940 - h - 60), f'{v:.1f} %'.replace('.', ','), font=F('Manrope.ttf', 60, 800), fill=NAVY, anchor='mm')
        d.text((x + 110, 985), yr, font=F('Manrope.ttf', 38, 700), fill=(110, 118, 130), anchor='mm')
STYLES['B'] = ('Скандинавский — светлые карточки, тёмно-синий текст и норвежский красный акцент (шрифт Manrope)', B_number, B_tag, B_map, B_chart)

# ===== C. Кино (элегантный, с засечками) =====
CREAM, GOLD = (245, 238, 225), (214, 190, 140)
def C_number(img):
    bottom_gradient(img, 480, 200); d = ImageDraw.Draw(img)
    shadow_text(img, (W / 2, 800), '21 268', F('Playfair.ttf', 150, 600), CREAM + (255,), anchor='mm')
    letterspace(d, (W / 2 - 330, 900), 'МИЛЛИАРДОВ КРОН В ФОНДЕ', F('Inter.ttf', 30, 500), CREAM + (230,), 6)
    d.line([(W / 2 - 60, 960), (W / 2 + 60, 960)], fill=GOLD + (255,), width=2)
    d.text((W / 2, 990), 'на 31 декабря 2025 года · NBIM', font=F('Playfair.ttf', 30, 400), fill=CREAM + (200,), anchor='mm')
def C_tag(img):
    d = ImageDraw.Draw(img)
    shadow_text(img, (80, 60), 'Лердальский тоннель', F('Playfair.ttf', 46, 500), CREAM + (255,))
    d.line([(82, 128), (220, 128)], fill=GOLD + (255,), width=2)
    letterspace(d, (82, 140), 'ВЕСТЛАНН', F('Inter.ttf', 22, 500), CREAM + (200,), 6)
def C_map(img, a, b):
    d = ImageDraw.Draw(img)
    n = 40
    for i in range(0, n, 2):
        p = (a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); q = (a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n)
        d.line([p, q], fill=CREAM + (255,), width=4)
    for p, s in ((a, 'Линдеснес'), (b, 'Нордкап')):
        d.ellipse((p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8), outline=CREAM + (255,), width=3)
        shadow_text(img, (p[0] + 22, p[1] - 22), s, F('Playfair.ttf', 38, 500), CREAM + (255,))
    shadow_text(img, (1380, 470), '1 750', F('Playfair.ttf', 140, 600), CREAM + (255,), anchor='mm')
    letterspace(d, (1260, 560), 'КИЛОМЕТРОВ', F('Inter.ttf', 28, 500), CREAM + (220,), 6)
def C_chart(img):
    d = ImageDraw.Draw(img); d.rectangle((0, 0, W, H), fill=(22, 20, 18, 255))
    d.text((W / 2, 140), 'Электромобили среди новых легковых машин', font=F('Playfair.ttf', 56, 500), fill=CREAM, anchor='mm')
    letterspace(d, (W / 2 - 320, 200), 'НОРВЕГИЯ · ДОЛЯ ПРОДАЖ ЗА ГОД · OFV', F('Inter.ttf', 24, 500), GOLD, 5)
    for i, (yr, v) in enumerate((('2024', 88.9), ('2025', 95.9))):
        cx = 700 + i * 520; r = 170
        d.ellipse((cx - r, 560 - r, cx + r, 560 + r), outline=(70, 64, 58), width=14)
        d.arc((cx - r, 560 - r, cx + r, 560 + r), -90, -90 + 360 * v / 100, fill=GOLD if i else (150, 140, 125), width=14)
        d.text((cx, 560), f'{v:.1f}%'.replace('.', ','), font=F('Playfair.ttf', 76, 600), fill=CREAM, anchor='mm')
        d.text((cx, 790), yr, font=F('Inter.ttf', 34, 500), fill=(190, 180, 165), anchor='mm')
STYLES['C'] = ('Кино — элегантный: цифры с засечками (Playfair Display), кремовый цвет, золотые тонкие линии, кольцевые диаграммы', C_number, C_tag, C_map, C_chart)

# ===== D. Яркий инфографический (весёлый) =====
TEAL, CORAL, INK = (20, 184, 166), (255, 107, 74), (18, 24, 38)
def blob(img, box, col, r=26):
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((box[0] + 8, box[1] + 10, box[2] + 8, box[3] + 10), r, fill=(0, 0, 0, 80))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10))); ImageDraw.Draw(img).rounded_rectangle(box, r, fill=col + (255,))
def D_number(img):
    f = F('Unbounded.ttf', 84, 800); w = f.getlength('21 268 млрд крон') + 80
    blob(img, (W / 2 - w / 2, 730, W / 2 + w / 2, 860), TEAL)
    d = ImageDraw.Draw(img); d.text((W / 2, 795), '21 268 млрд крон', font=f, fill=(255, 255, 255), anchor='mm')
    f2 = F('Manrope.ttf', 34, 700); w2 = f2.getlength('стоимость фонда · 31.12.2025 · NBIM') + 50
    blob(img, (W / 2 - w2 / 2, 880, W / 2 + w2 / 2, 940), (255, 255, 255), r=30)
    d.text((W / 2, 910), 'стоимость фонда · 31.12.2025 · NBIM', font=f2, fill=INK, anchor='mm')
def D_tag(img):
    f = F('Unbounded.ttf', 30, 600); w = f.getlength('Лердальский тоннель') + 100
    blob(img, (70, 60, 70 + w, 130), CORAL, r=35)
    d = ImageDraw.Draw(img); d.ellipse((96, 79, 128, 111), fill=(255, 255, 255)); d.ellipse((106, 89, 118, 101), fill=CORAL)
    d.text((145, 95), 'Лердальский тоннель', font=f, fill=(255, 255, 255), anchor='lm')
def D_map(img, a, b):
    d = ImageDraw.Draw(img)
    d.line([a, b], fill=(255, 255, 255, 255), width=14); d.line([a, b], fill=CORAL, width=8)
    for p, s, c in ((a, 'Линдеснес', TEAL), (b, 'Нордкап', TEAL)):
        d.ellipse((p[0] - 14, p[1] - 14, p[0] + 14, p[1] + 14), fill=(255, 255, 255)); d.ellipse((p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8), fill=c)
        f = F('Manrope.ttf', 30, 800); w = f.getlength(s) + 40
        blob(img, (p[0] + 26, p[1] - 24, p[0] + 26 + w, p[1] + 24), (255, 255, 255), r=24)
        ImageDraw.Draw(img).text((p[0] + 46, p[1]), s, font=f, fill=INK, anchor='lm')
    f = F('Unbounded.ttf', 76, 800); blob(img, (1110, 420, 1110 + f.getlength('≈ 1 750 км') + 70, 540), CORAL)
    d = ImageDraw.Draw(img); d.text((1145, 480), '≈ 1 750 км', font=f, fill=(255, 255, 255), anchor='lm')
def D_chart(img):
    d = ImageDraw.Draw(img); d.rectangle((0, 0, W, H), fill=(245, 248, 252, 255))
    d.text((160, 110), 'Электромобили среди новых легковых машин', font=F('Unbounded.ttf', 46, 700), fill=INK)
    d.text((160, 185), 'Норвегия, доля продаж за год · OFV', font=F('Manrope.ttf', 32, 600), fill=(100, 110, 125))
    for i, (yr, v) in enumerate((('2024', 88.9), ('2025', 95.9))):
        x = 600 + i * 480; h = 6.2 * v
        d.rounded_rectangle((x, 940 - h, x + 220, 940), 30, fill=CORAL if i else TEAL)
        d.text((x + 110, 940 - h + 55), f'{v:.1f}%'.replace('.', ','), font=F('Unbounded.ttf', 38, 800), fill=(255, 255, 255), anchor='mm')
        d.text((x + 110, 985), yr, font=F('Unbounded.ttf', 34, 600), fill=INK, anchor='mm')
STYLES['D'] = ('Яркий — цветные плашки (бирюзовый + коралловый), шрифт Unbounded, весёлый и современный', D_number, D_tag, D_map, D_chart)

if __name__ == '__main__':
    st = Image.open(os.path.join(BG, 'bg_storting.png')).convert('RGBA')
    cave = Image.open(os.path.join(BG, 'bg_cave.png')).convert('RGBA')
    mp, a, b = map_base()
    for k, (title, fn, ft, fm, fc) in STYLES.items():
        frames = []
        im = st.copy(); fn(im); frames.append(im)
        im = cave.copy(); ft(im); frames.append(im)
        im = mp.copy(); fm(im, a, b); frames.append(im)
        im = Image.new('RGBA', (W, H)); fc(im); frames.append(im)
        sheet = Image.new('RGB', (W, H + 90), (12, 14, 18))
        for i, f in enumerate(frames):
            sheet.paste(f.convert('RGB').resize((W // 2, H // 2), Image.LANCZOS), ((i % 2) * W // 2, 90 + (i // 2) * H // 2))
        dd = ImageDraw.Draw(sheet); dd.text((24, 45), f'{k}. {title}', font=F('Inter.ttf', 30, 600), fill=(255, 255, 255), anchor='lm')
        sheet.save(os.path.join(D, f'style_{k}.jpg'), quality=90); print('style', k)
