# Варианты обложки B и C (2–4 крупных слова).
import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(os.path.dirname(os.path.dirname(D)))
ST = f'{R}/2d-video/projects/ww3/build/stills'; F = '/usr/share/fonts/opentype/inter/'
def base(name, crop):
    im = Image.open(f'{ST}/{name}').convert('RGB').crop(crop).resize((1280, 720))
    im = ImageEnhance.Brightness(im).enhance(1.3); return ImageEnhance.Contrast(im).enhance(1.15)
def shade(im, w=760, k=210):
    sh = Image.new('L', im.size, 0); sd = ImageDraw.Draw(sh)
    for x in range(w): sd.line([(x, 0), (x, 720)], fill=int(k * (1 - x / w) ** 1.3))
    return Image.composite(Image.new('RGB', im.size, (4, 6, 14)), im, sh)
def T(d, xy, s, size, fill, font='Inter-Black.otf'):
    d.text(xy, s, font=ImageFont.truetype(F + font, size), fill=fill, stroke_width=3, stroke_fill=(0, 0, 0))
# B: лицо Петрова + «ТРЕТЬЯ МИРОВАЯ?»
im = shade(base('24.8s_24.80.png', (0, 60, 1707, 1020))); d = ImageDraw.Draw(im)
T(d, (56, 190), 'ТРЕТЬЯ', 150, (255, 255, 255)); T(d, (56, 345), 'МИРОВАЯ?', 132, (255, 92, 72))
im.save(f'{D}/cover_B.jpg', quality=92)
# C: бункер, табло «СТАРТ» + «А ЕСЛИ НЕ ОШИБКА?»
im = base('12.4s_12.40.png', (200, 60, 1907, 1020)); im = shade(im, 640, 190); d = ImageDraw.Draw(im)
T(d, (50, 380), 'А ЕСЛИ', 110, (255, 255, 255)); T(d, (50, 500), 'НЕ ОШИБКА?', 110, (255, 92, 72))
im.save(f'{D}/cover_C.jpg', quality=92); print('ok')
