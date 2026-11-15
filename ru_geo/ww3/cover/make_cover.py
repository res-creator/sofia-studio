# Обложка «Третья мировая»: кадр из фильма (Петров, «СТАРТ») + крупный текст. 1280×720.
import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(os.path.dirname(os.path.dirname(D)))
src = f'{R}/2d-video/projects/ww3/build/stills/24.8s_24.80.png'
F = '/usr/share/fonts/opentype/inter/'
im = Image.open(src).convert('RGB'); im = im.crop((0, 60, 1707, 1020)).resize((1280, 720))
im = ImageEnhance.Brightness(im).enhance(1.35); im = ImageEnhance.Contrast(im).enhance(1.15)
# тёплая красная подсветка тревоги справа
glow = Image.new('RGB', im.size, (200, 40, 40)); mask = Image.new('L', im.size, 0); md = ImageDraw.Draw(mask)
md.ellipse((700, -200, 1500, 600), fill=90); mask = mask.filter(ImageFilter.GaussianBlur(120)); im = Image.composite(glow, im, mask)
# затемнение слева под текст
sh = Image.new('L', im.size, 0); sd = ImageDraw.Draw(sh)
for x in range(760): sd.line([(x, 0), (x, 720)], fill=int(200 * (1 - x / 760) ** 1.3))
im = Image.composite(Image.new('RGB', im.size, (4, 6, 14)), im, sh)
d = ImageDraw.Draw(im)
def T(xy, s, size, fill, font='Inter-Black.otf', stroke=0):
    d.text(xy, s, font=ImageFont.truetype(F + font, size), fill=fill, stroke_width=stroke, stroke_fill=(0, 0, 0))
T((60, 150), 'ЧТО БУДЕТ, ЕСЛИ', 54, (235, 235, 240), 'Inter-ExtraBold.otf', 2)
T((56, 215), 'ТРЕТЬЯ', 128, (255, 255, 255), stroke=3)
T((56, 345), 'МИРОВАЯ?', 118, (255, 92, 72), stroke=3)
# плашка «СТАРТ»
d.rounded_rectangle((60, 520, 330, 600), 14, fill=(214, 64, 52)); T((88, 527), 'СТАРТ', 56, (255, 240, 232))
T((350, 540), '1983 → 2026', 36, (220, 225, 235), 'Inter-ExtraBold.otf', 2)
im.save(f'{D}/cover.jpg', quality=92); print('ok')
