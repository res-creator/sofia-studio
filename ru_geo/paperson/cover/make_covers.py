# Обложки «Бумажные сыновья» (не по шаблону «лицо и красный кружок»): на архивных фото. Запуск: python3 make_covers.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps
import os, random
D = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(D, '../../../2d-video/projects/paperson/assets/archive/')
F = lambda sz, w='Black': ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', sz)
W, H = 1920, 1080
def cover(im, w=W, h=H):
    return ImageOps.fit(im.convert('RGB'), (w, h), Image.LANCZOS)
def text_o(d, xy, s, font, fill, stroke=0, sc=(0, 0, 0), anchor='la'):
    d.text(xy, s, font=font, fill=fill, stroke_width=stroke, stroke_fill=sc, anchor=anchor)
def shadow_paste(base, im, xy, ang=0, blur=24, off=(10, 16)):
    im = im.convert('RGBA').rotate(ang, expand=True, resample=Image.BICUBIC)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.paste((0, 0, 0, 150), mask=im.split()[3]); sh = sh.filter(ImageFilter.GaussianBlur(blur))
    base.paste(sh, (xy[0] + off[0], xy[1] + off[1]), sh); base.paste(im, xy, im)
def tag(base, xy, s, fill=(255, 212, 59), fg=(24, 22, 20), size=54, ang=-3):
    f = F(size, 'ExtraBold'); w = int(f.getlength(s)) + 52; h = int(size * 1.55)
    t = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(t); d.rounded_rectangle((0, 0, w - 1, h - 1), 10, fill=fill); d.text((w // 2, h // 2 + 2), s, font=f, fill=fg, anchor='mm')
    shadow_paste(base, t, xy, ang, 10, (5, 8))
# ---------------------------------------------------------------- A: документ на бумаге
a = Image.new('RGB', (W, H), (238, 229, 208)); rnd = random.Random(3); d = ImageDraw.Draw(a)
for _ in range(9000): x, y = rnd.randrange(W), rnd.randrange(H); c = rnd.randrange(-9, 9); d.point((x, y), fill=(238 + c, 229 + c, 208 + c))
a = a.filter(ImageFilter.GaussianBlur(0.6)); d = ImageDraw.Draw(a)
doc = Image.open(A + 'paperson.jpg').convert('RGB'); doc = doc.resize((int(doc.width * 2.45), int(doc.height * 2.45)), Image.LANCZOS); doc = ImageOps.expand(doc, 12, (246, 242, 232))
shadow_paste(a, doc, (1190, 100), -5, 26, (14, 22))
# красная печать
st = Image.new('RGBA', (560, 190), (0, 0, 0, 0)); sd = ImageDraw.Draw(st); sd.rounded_rectangle((6, 6, 553, 183), 18, outline=(196, 40, 28, 235), width=11); sd.text((280, 98), 'ЧУЖОЕ ИМЯ', font=F(80), fill=(196, 40, 28, 235), anchor='mm')
shadow_paste(a, st, (1150, 730), 8, 4, (3, 4))
text_o(d, (90, 170), 'ЧУЖОЙ', F(270), (26, 24, 22)); text_o(d, (90, 440), 'СЫН', F(270), (26, 24, 22)); text_o(d, (96, 770), 'НА БУМАГЕ', F(138), (196, 40, 28))
tag(a, (92, 70), 'ПОДЛИННЫЙ ДОКУМЕНТ', size=52)
a.save(os.path.join(D, 'cover_a.jpg'), quality=92)
# ---------------------------------------------------------------- B: надписи на стене барака
b = cover(Image.open(A + 'carved.jpg')); b = ImageEnhance.Brightness(b).enhance(0.62); b = ImageEnhance.Contrast(b).enhance(1.15)
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for i in range(H): od.line((0, i, W, i), fill=(10, 8, 6, int(40 + 150 * (i / H) ** 1.6)))
b = Image.alpha_composite(b.convert('RGBA'), ov).convert('RGB'); d = ImageDraw.Draw(b)
text_o(d, (90, 520), 'ЧУЖОЕ', F(330), (255, 255, 255), 10); text_o(d, (90, 800), 'ИМЯ', F(250), (255, 212, 59), 10)
tag(b, (90, 70), 'НАДПИСИ НА СТЕНЕ БАРАКА', size=50, ang=-2)
tag(b, (1180, 840), '1000 ВОПРОСОВ', fill=(196, 40, 28), fg=(255, 255, 255), size=72, ang=4)
b.save(os.path.join(D, 'cover_b.jpg'), quality=92)
# ---------------------------------------------------------------- C: стихи на стене, вопрос-загадка
c = cover(Image.open(A + 'poetry.jpg')); c = ImageEnhance.Brightness(c).enhance(0.55); c = c.filter(ImageFilter.GaussianBlur(1.2)); d = ImageDraw.Draw(c)
d.rectangle((0, 0, 40, H), fill=(255, 212, 59))
text_o(d, (110, 150), 'УЧИ', F(330), (255, 255, 255), 8); text_o(d, (110, 450), 'ЧУЖУЮ', F(330), (255, 255, 255), 8); text_o(d, (110, 750), 'ЖИЗНЬ', F(330), (255, 212, 59), 8)
tag(c, (1150, 80), 'ЗАВТРА ДОПРОС', fill=(255, 255, 255), size=62, ang=3)
c.save(os.path.join(D, 'cover_c.jpg'), quality=92)
# сравнение (в уменьшенном виде = как в ленте)
sh = Image.new('RGB', (W // 2 * 3 + 40, H // 2 + 20), (16, 16, 16))
for i, n in enumerate('abc'): sh.paste(Image.open(os.path.join(D, f'cover_{n}.jpg')).resize((W // 2, H // 2), Image.LANCZOS), (10 + i * (W // 2 + 10), 10))
sh.save(os.path.join(D, 'compare.jpg'), quality=88); print('ok')
