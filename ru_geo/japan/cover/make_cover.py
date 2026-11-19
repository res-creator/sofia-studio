# Обложки «Японии»: огромное слово, перед ним герой (вырезан rembg), сзади узнаваемый пейзаж, короткая подстрока-крючок, печать 日本.
import os, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); RG = os.path.join(D, '..', '..'); sys.path.insert(0, os.path.join(RG, 'lib')); import look
from rembg import remove, new_session
W, H = 2560, 1440; IMG = f'{RG}/data/commons_img/jp'; SEG = f'{RG}/data/pixabay/seg'
TEAL = (40, 220, 200); CREAM = (255, 250, 240)
def frame(seg, t=1.0):
    p = f'/tmp/cov_{seg}.png'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', f'{SEG}/{seg}.mp4', '-frames:v', '1', p], check=True); return Image.open(p).convert('RGB')
def cover_fit(im):
    s = max(W / im.width, H / im.height); im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2; return im.crop((x, y, x + W, y + H))
def grade(im, bright=1.08, sat=1.25, con=1.08):
    im = ImageEnhance.Brightness(im).enhance(bright); im = ImageEnhance.Color(im).enhance(sat); return ImageEnhance.Contrast(im).enhance(con)
def cut(path, session='u2net_human_seg'):
    c = f'/tmp/cut_{os.path.basename(path)}.png'
    if not os.path.exists(c): remove(Image.open(path).convert('RGB'), session=new_session(session)).save(c)
    im = Image.open(c).convert('RGBA'); a = im.split()[3].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2)); im.putalpha(a)
    return im.crop(im.getbbox())
def hanko(size):
    S = size; im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, S, S), radius=S // 10, fill=(200, 28, 36, 255))
    m = Image.new('L', (S, S), 255); dm = ImageDraw.Draw(m); f = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', int(S * 0.40))
    dm.rounded_rectangle((S * .06, S * .06, S * .94, S * .94), radius=S // 16, outline=0, width=max(2, S // 40))
    for ch, yy in (('日', .30), ('本', .70)): dm.text((S / 2, S * yy), ch, font=f, fill=0, anchor='mm', stroke_width=S // 60, stroke_fill=0)
    im.putalpha(Image.fromarray((np.asarray(im.split()[3], np.float32) * np.asarray(m, np.float32) / 255).astype(np.uint8)))
    return im.rotate(-6, resample=Image.BICUBIC, expand=True)
def big_word(img, text, y, size, fill=CREAM, track=10):
    f = look.font(size, 900); lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    ws = [f.getlength(c) for c in text]; tw = sum(ws) + track * (len(text) - 1)
    if tw > W * 0.94: return big_word(img, text, y, int(size * W * 0.94 / tw), fill, track)
    x = (W - tw) / 2
    for c, w in zip(text, ws): d.text((x, y), c, font=f, fill=fill, anchor='lm'); x += w + track
    sh = lay.split()[3].filter(ImageFilter.GaussianBlur(28)); dk = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dk.putalpha(sh.point(lambda v: int(v * .65)))
    img.alpha_composite(dk); img.alpha_composite(lay); return tw
def plate(img, text, cx, cy, size, bg=TEAL, fg=(10, 20, 24)):
    f = look.font(size, 850); tw = f.getlength(text); pad = size * .35
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    d.rounded_rectangle((cx - tw / 2 - pad, cy - size * .62, cx + tw / 2 + pad, cy + size * .62), radius=int(size * .22), fill=bg + (255,))
    d.text((cx, cy), text, font=f, fill=fg, anchor='mm')
    sh = lay.split()[3].filter(ImageFilter.GaussianBlur(18)); dk = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dk.putalpha(sh.point(lambda v: int(v * .5)))
    img.alpha_composite(dk); img.alpha_composite(lay)
def hero(img, h, height, cx, bottom=H):
    s = height / h.height; h = h.resize((int(h.width * s), int(h.height * s)), Image.LANCZOS)
    a = h.split()[3]; rim = a.filter(ImageFilter.GaussianBlur(14)); glow = Image.new('RGBA', h.size, (255, 230, 200, 0)); glow.putalpha(rim.point(lambda v: int(v * .35)))
    pos = (int(cx - h.width / 2), int(bottom - h.height))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); tmp = Image.new('L', (W, H), 0); tmp.paste(a, (pos[0] + 25, pos[1] + 10)); sh.putalpha(tmp.filter(ImageFilter.GaussianBlur(30)).point(lambda v: int(v * .55)))
    img.alpha_composite(sh); img.alpha_composite(glow, pos); img.alpha_composite(h, pos)
def finish(img, name):
    a = np.asarray(img.convert('RGB'), np.float32); yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2); a *= (1 - .28 * np.clip(r - .7, 0, 1))[..., None]
    a += np.random.default_rng(1).normal(0, 3, a.shape); out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    out.save(f'{D}/{name}.png'); out.resize((1280, 720), Image.LANCZOS).save(f'{D}/{name}.jpg', quality=90); return out

# A: майко перед словом, закатная Фудзи
img = grade(cover_fit(frame('202982_1')), 1.15, 1.3).convert('RGBA'); img = img.filter(ImageFilter.GaussianBlur(2))
big_word(img, 'ЯПОНИЯ', H * .40, 520, track=14)
hero(img, cut(f'{IMG}/maiko_tomitsuyu.jpg'), H * 0.86, W * 0.50)
plate(img, 'ИЗВИНЯЮТСЯ ЗА 20 СЕКУНД', W / 2, H * .875, 118)
hk = hanko(230); img.alpha_composite(hk, (W - hk.width - 90, 70)); A = finish(img, 'cover_A')

# B: гейко перед словом, неоновый переулок Токио
img = grade(cover_fit(frame('41957_1')), 1.05, 1.25).convert('RGBA'); img = img.filter(ImageFilter.GaussianBlur(4))
big_word(img, 'ЯПОНИЯ', H * .36, 520, track=14)
hero(img, cut(f'{IMG}/geiko_lanterns.jpg'), H * 0.90, W * 0.66)
plate(img, 'СТРАНА БЕЗ УРН И МУСОРА', W * .37, H * .86, 108)
hk = hanko(210); img.alpha_composite(hk, (80, 70)); B = finish(img, 'cover_B')

# C: синкансэн и Фудзи, крупная цифра
img = grade(cover_fit(Image.open(f'{IMG}/n700_fuji.jpg').convert('RGB')), 1.05, 1.3).convert('RGBA')
big_word(img, '20 СЕКУНД', H * .30, 400, fill=CREAM, track=8)
plate(img, 'ПОЕЗД УШЁЛ РАНЬШЕ - ИЗВИНИЛИСЬ', W / 2, H * .50, 110, bg=(200, 28, 36), fg=CREAM)
hk = hanko(200); img.alpha_composite(hk, (W - hk.width - 80, H - hk.height - 80)); C = finish(img, 'cover_C')

# лист для выбора + проверка в маленьком размере
sheet = Image.new('RGB', (1280 * 3 + 40, 720 + 260), (24, 24, 28))
for k, im in enumerate((A, B, C)):
    sheet.paste(im.resize((1280, 720), Image.LANCZOS), (k * 1300, 0)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (k * 1300, 740))
    sheet.paste(im.resize((168, 94), Image.LANCZOS), (k * 1300 + 340, 740))
    ImageDraw.Draw(sheet).text((k * 1300 + 540, 760), 'ABC'[k], font=look.font(120, 900), fill=(255, 255, 255))
sheet.save(f'{D}/covers_sheet.jpg', quality=88); print('ok')
