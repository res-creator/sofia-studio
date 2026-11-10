# Ещё три варианта обложки (D, E, F) — те же приёмы, что в make_cover.py.
import sys, os
sys.argv = ['x']; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'make_cover.py')).read().split('# A: майко')[0])
# D: олень Нары перед словом, осенний храм
img = grade(cover_fit(Image.open(f'{IMG}/eikando_autumn.jpg').convert('RGB')), 1.05, 1.3).convert('RGBA'); img = img.filter(ImageFilter.GaussianBlur(5))
big_word(img, 'ЯПОНИЯ', H * .34, 520, track=14)
hero(img, cut(f'{IMG}/nara_deer_fed.jpg', 'u2net'), H * 0.80, W * 0.52)
plate(img, 'ОЛЕНИ, КОТОРЫЕ КЛАНЯЮТСЯ', W / 2, H * .885, 110)
hk = hanko(210); img.alpha_composite(hk, (W - hk.width - 80, 70)); Dd = finish(img, 'cover_D')
# E: снежные макаки в онсэне
img = grade(cover_fit(frame('218735_1')), 1.1, 1.35, 1.1).convert('RGBA')
g = Image.new('L', (1, H)); [g.putpixel((0, y), int(190 * max(0, 1 - y / (H * .55)) ** 1.3)) for y in range(H)]
top = Image.new('RGBA', (W, H), (8, 20, 30, 0)); top.putalpha(g.resize((W, H))); img.alpha_composite(top)
big_word(img, 'ЯПОНИЯ', H * .18, 430, track=12)
plate(img, 'ОНСЭН ДЛЯ ОБЕЗЬЯН', W * .30, H * .86, 120, bg=(200, 28, 36), fg=CREAM)
hk = hanko(200); img.alpha_composite(hk, (W - hk.width - 80, H - hk.height - 70)); E = finish(img, 'cover_E')
# F: перекрёсток Сибуя
img = grade(cover_fit(frame('181114_1')), 1.05, 1.35, 1.12).convert('RGBA')
dim = Image.new('RGBA', (W, H), (0, 0, 0, 70)); img.alpha_composite(dim)
big_word(img, 'ЯПОНИЯ', H * .42, 560, track=16)
plate(img, 'СТРАНА, ГДЕ ВСЁ НЕ ТАК', W / 2, H * .70, 120)
hk = hanko(220); img.alpha_composite(hk, (80, 70)); F = finish(img, 'cover_F')
sheet = Image.new('RGB', (1280 * 3 + 40, 720 + 260), (24, 24, 28))
for k, im in enumerate((Dd, E, F)):
    sheet.paste(im.resize((1280, 720), Image.LANCZOS), (k * 1300, 0)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (k * 1300, 740))
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (k * 1300 + 340, 740))
    ImageDraw.Draw(sheet).text((k * 1300 + 540, 760), 'DEF'[k], font=look.font(120, 900), fill=(255, 255, 255))
sheet.save(f'{D}/covers_sheet2.jpg', quality=88); print('ok')
