# Обложка 1280×720: фото извержения у Гриндавика (14.01.2024, гражданская оборона Исландии, public domain) + заголовок в стиле канала.
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import look, sources
from media_list import MEDIA, SHOTS
W, H = 1280, 720
src = os.path.join(sources.DATA, MEDIA[SHOTS['a01']['m']]['file'])
im = Image.open(src).convert('RGB'); iw, ih = im.size; s = max(W / iw, H / ih) * 1.08
im = im.resize((int(iw * s), int(ih * s)), Image.LANCZOS)
x0 = (im.size[0] - W) // 2; y0 = int((im.size[1] - H) * 0.55); im = im.crop((x0, y0, x0 + W, y0 + H))
im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.25)).enhance(1.12).convert('RGBA')
g = Image.new('L', (W, H), 0); d = ImageDraw.Draw(g)
for x in range(W): d.line([(x, 0), (x, H)], fill=int(205 * max(0.0, 1 - x / (W * 0.62)) ** 1.3))
im.alpha_composite(Image.merge('RGBA', [Image.new('L', (W, H), 8)] * 3 + [g]))
look.text(im, (64, 150), 'ИСЛАНДИЯ', 132, 800, look.WHITE, 'ls', track=6, shadow=0.9)
ImageDraw.Draw(im).rectangle((68, 182, 300, 192), fill=look.ACCENT + (255,))
look.text(im, (66, 262), 'ОСТРОВ, КОТОРЫЙ', 58, 800, look.WHITE, 'ls', shadow=0.9)
look.text(im, (66, 330), 'ХОЧЕТ ВАС ВЫГНАТЬ', 58, 800, look.ACCENT, 'ls', shadow=0.9)
im.convert('RGB').save(f'{D}/cover.jpg', quality=92)
print('cover.jpg')
