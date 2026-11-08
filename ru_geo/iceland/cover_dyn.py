# Обложка 1280×720 в стиле больших кинематографичных обложек: огромное объёмное слово «ИСЛАНДИЯ» в небе, нижний край букв уходит
# за хребет (буквы стоят «за» горой), лава на переднем плане, тонкий подзаголовок с разрядкой. Фон — кадр Pixabay 234084 (лавовый поток,
# Исландия, Pixabay Content License). Без логотипов и значков чужих каналов.
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageChops
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import look
W, H = 1280, 720
SRC = sys.argv[1] if len(sys.argv) > 1 else f'{D}/rework/cover/f234_11.png'
OUT = sys.argv[2] if len(sys.argv) > 2 else f'{D}/cover.jpg'
S = 2   # рисуем в 2× для гладких краёв

bg = Image.open(SRC).convert('RGB')
iw, ih = bg.size; sc = max(W * S / iw, H * S / ih) * 1.06
bg = bg.resize((int(iw * sc), int(ih * sc)), Image.LANCZOS)
x0 = (bg.size[0] - W * S) // 2; y0 = int((bg.size[1] - H * S) * 0.35)
bg = bg.crop((x0, y0, x0 + W * S, y0 + H * S))
bg = ImageEnhance.Contrast(ImageEnhance.Color(bg).enhance(1.35)).enhance(1.12)

# линия горизонта по столбцам: сверху вниз до первого тёмного пикселя (небо светлое, хребет тёмный)
a = np.asarray(bg.convert('L').filter(ImageFilter.GaussianBlur(6)), np.float32)
Ws, Hs = a.shape[1], a.shape[0]
hor = np.zeros(Ws)
for x in range(Ws):
    col = a[:, x]; thr = col[:int(Hs * 0.15)].mean() * 0.62
    idx = np.where(col[int(Hs * 0.12):] < thr)[0]
    hor[x] = (idx[0] + int(Hs * 0.12)) if len(idx) else Hs * 0.5
k = 61; hor = np.convolve(np.pad(hor, k // 2, mode='edge'), np.ones(k) / k, mode='valid')
sky = np.zeros((Hs, Ws), np.uint8)
yy = np.arange(Hs)[:, None]
sky[yy < hor[None, :]] = 255
sky_m = Image.fromarray(sky).filter(ImageFilter.GaussianBlur(2.5))

# цветокоррекция: холодное небо, тёплая лава, виньетка
base = bg.convert('RGBA')
vig = Image.new('L', (Ws, Hs), 0); dv = ImageDraw.Draw(vig)
for i in range(60):
    t = i / 60; dv.ellipse((-Ws * 0.25 + t * Ws * 0.18, -Hs * 0.35 + t * Hs * 0.2, Ws * 1.25 - t * Ws * 0.18, Hs * 1.35 - t * Hs * 0.2), fill=int(150 * (1 - t)))
vig = ImageChops.invert(vig.filter(ImageFilter.GaussianBlur(80)))
dark = Image.new('RGBA', (Ws, Hs), (4, 8, 16, 255))
base = Image.composite(base, dark, vig.point(lambda v: int(255 - (255 - v) * 0.55)))

# заголовок
TXT = 'ИСЛАНДИЯ'
f = ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Black.otf', 300 * S)
tw = int(f.getlength(TXT)); asc, desc = f.getmetrics()
tile = Image.new('L', (tw + 40 * S, asc + desc + 40 * S), 0)
ImageDraw.Draw(tile).text((20 * S, 20 * S), TXT, font=f, fill=255)
tile = tile.crop(tile.getbbox())
tile = tile.resize((int(tile.size[0] * 0.80), int(tile.size[1] * 1.0)), Image.LANCZOS)   # чуть уже, как плакатный шрифт
maxw = int(Ws * float(os.environ.get('WID', '0.90')))
if tile.size[0] > maxw: tile = tile.resize((maxw, int(tile.size[1] * maxw / tile.size[0])), Image.LANCZOS)
tw, th = tile.size
cx = Ws // 2; top = int(Hs * float(os.environ.get('TOP', '0.10')))
ox, oy = cx - tw // 2, top

# заливка букв: лёд — от белого сверху к ледяному голубому снизу, мелкая «изморозь»
grad = np.zeros((th, tw, 3), np.float32)
t = np.linspace(0, 1, th)[:, None]
top_c, bot_c = np.array([255, 255, 255]), np.array([120, 200, 240])
grad[:] = (top_c * (1 - t) + bot_c * t)[:, None, :][:, 0, :][:, None, :]
rng = np.random.default_rng(3)
noise = Image.fromarray((rng.random((th // 3, tw // 3)) * 255).astype(np.uint8)).resize((tw, th), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
grad *= (0.9 + 0.1 * np.asarray(noise, np.float32)[..., None] / 255)
fill = Image.fromarray(np.clip(grad, 0, 255).astype(np.uint8)).convert('RGBA')
# тёплый отсвет лавы снизу на буквах
warm = Image.new('RGBA', (tw, th), (255, 120, 40, 0)); wa = np.zeros((th, tw), np.uint8)
wa[:] = (np.clip((np.linspace(0, 1, th) - 0.55) / 0.45, 0, 1) ** 1.6 * 150).astype(np.uint8)[:, None]
warm.putalpha(Image.fromarray(wa)); fill.alpha_composite(warm)
# фаска: тиснение по альфе
emb = tile.filter(ImageFilter.GaussianBlur(3 * S))
e = np.asarray(emb, np.float32); gy = np.zeros_like(e); gx = np.zeros_like(e)
gy[1:-1] = e[2:] - e[:-2]; gx[:, 1:-1] = e[:, 2:] - e[:, :-2]
light = np.clip(-(gy + gx * 0.6) * 1.4, -255, 255)
f_arr = np.asarray(fill, np.float32)
f_arr[..., :3] = np.clip(f_arr[..., :3] + light[..., None] * 0.8, 0, 255)
fill = Image.fromarray(f_arr.astype(np.uint8)); fill.putalpha(tile)

layer = Image.new('RGBA', (Ws, Hs), (0, 0, 0, 0))
# тень и тёплое свечение
sh = Image.new('RGBA', (Ws, Hs), (0, 0, 0, 0)); shm = Image.new('L', (Ws, Hs), 0); shm.paste(tile, (ox + 10 * S, oy + 18 * S))
sh.putalpha(shm.filter(ImageFilter.GaussianBlur(18 * S)).point(lambda v: int(v * 0.75)))
layer.alpha_composite(sh)
# объём: выдавливание вниз-вправо тёмным ледяным цветом
depth = 14 * S
for i in range(depth, 0, -1):
    c = int(28 + 40 * (1 - i / depth))
    ext = Image.new('RGBA', tile.size, (c // 2, c, int(c * 1.6), 255)); ext.putalpha(tile)
    layer.alpha_composite(ext, (ox + int(i * 0.35), oy + i))
layer.alpha_composite(fill, (ox, oy))
# тонкий светлый контур сверху
edge = tile.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 60 else 0).filter(ImageFilter.GaussianBlur(0.8))
el = Image.new('RGBA', tile.size, (255, 255, 255, 0)); el.putalpha(edge.point(lambda v: int(v * 0.45)))
layer.alpha_composite(el, (ox, oy))

# буквы «за хребтом»: показываем только над линией горизонта
la = np.asarray(layer.split()[3], np.float32) * (np.asarray(sky_m, np.float32) / 255)
layer.putalpha(Image.fromarray(la.astype(np.uint8)))
base.alpha_composite(layer)

# подзаголовок с разрядкой и линиями
sub = 'ОСТРОВ, КОТОРЫЙ ХОЧЕТ ВАС ВЫГНАТЬ'
fs = look.font(26 * S, 600); track = 6 * S
sw = sum(fs.getlength(ch) + track for ch in sub) - track
sy = int(Hs * 0.86)
sx = (Ws - sw) / 2
glow = Image.new('RGBA', (Ws, Hs), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
gd.rectangle((sx - 60 * S, sy - 34 * S, sx + sw + 60 * S, sy + 12 * S), fill=(0, 0, 0, 120))
base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(26 * S)))
look.text(base, (sx, sy), sub, 26 * S, 600, look.WHITE, 'ls', track=track, shadow=0.9)
d = ImageDraw.Draw(base)
for x1, x2 in ((sx - 110 * S, sx - 26 * S), (sx + sw + 26 * S, sx + sw + 110 * S)):
    d.line((x1, sy - 9 * S, x2, sy - 9 * S), fill=(255, 255, 255, 200), width=2 * S)

out = base.convert('RGB').resize((W, H), Image.LANCZOS)
out = ImageEnhance.Sharpness(out).enhance(1.15)
out.save(OUT, quality=93); print(OUT)
