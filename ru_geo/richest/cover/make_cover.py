# Обложки «Самый богатый»: A — Манса Муса из Каталонского атласа (PD) + вопрос; B — «$400 МЛРД?» перечёркнуто; C — портреты-силуэты отсчёта.
import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(D, '../../data/richest_img'); F = '/usr/share/fonts/opentype/inter/'
def fit(im, w, h, cx=0.5, cy=0.5):
    s = max(w / im.width, h / im.height); im = im.resize((int(im.width * s), int(im.height * s)))
    x = int((im.width - w) * cx); y = int((im.height - h) * cy); return im.crop((x, y, x + w, y + h))
def T(d, xy, s, size, fill, font='Inter-Black.otf', st=4):
    d.text(xy, s, font=ImageFont.truetype(F + font, size), fill=fill, stroke_width=st, stroke_fill=(0, 0, 0))
def shade(im, w, k):
    sh = Image.new('L', im.size, 0); sd = ImageDraw.Draw(sh)
    for x in range(w): sd.line([(x, 0), (x, im.height)], fill=int(k * (1 - x / w) ** 1.2))
    return Image.composite(Image.new('RGB', im.size, (10, 8, 6)), im, sh)
musa = Image.open(f'{IMG}/Catalan_Atlas_BNF_Sheet_6_Mansa_Musa.jpg').convert('RGB')
# A
im = fit(musa, 1280, 720, 0.6, 0.45); im = ImageEnhance.Contrast(im).enhance(1.15); im = shade(im, 780, 230); d = ImageDraw.Draw(im)
T(d, (50, 170), 'САМЫЙ', 130, (255, 255, 255)); T(d, (50, 310), 'БОГАТЫЙ', 130, (255, 205, 80)); T(d, (50, 450), 'В ИСТОРИИ?', 110, (255, 255, 255))
im.save(f'{D}/cover_A.jpg', quality=92)
# B
im = fit(musa, 1280, 720, 0.6, 0.45); im = ImageEnhance.Brightness(im).enhance(0.75); im = shade(im, 900, 200); d = ImageDraw.Draw(im)
T(d, (50, 200), '$400 МЛРД?', 140, (255, 205, 80)); d.line([(40, 300), (900, 250)], fill=(230, 60, 50), width=18)
T(d, (55, 400), 'ЭТО МИФ', 120, (255, 255, 255))
im.save(f'{D}/cover_B.jpg', quality=92)
# C — бюст Красса + Рокфеллер + Фуггер в ряд, «№1 ?»
names = ['Roman_Marble_Statue_Head_of_Crassus__Louvre__28027339230_.jpg', 'Albrecht_D_rer_-_Jakob_Fugger__the_Wealthy_-_WGA07011.jpg', 'Portrait_of_J._D._Rockefeller.jpg']
im = Image.new('RGB', (1280, 720), (12, 14, 24))
for i, n in enumerate(names): p = fit(Image.open(f'{IMG}/{n}').convert('RGB'), 427, 720, 0.5, 0.25); im.paste(ImageEnhance.Brightness(p).enhance(0.8), (i * 427, 0))
d = ImageDraw.Draw(im); d.rectangle([0, 470, 1280, 720], fill=(8, 8, 14))
T(d, (60, 495), 'КТО ИЗ НИХ №1?', 120, (255, 205, 80))
im.save(f'{D}/cover_C.jpg', quality=92); print('ok')
