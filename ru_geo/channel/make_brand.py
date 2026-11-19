# Оформление канала «Сквозь страны»: аватар 800×800 и шапка 2560×1440 (безопасная зона 1546×423 по центру).
# Земля — кадр нашего 3D-глобуса (Natural Earth, public domain), шрифты Cormorant Garamond (OFL) и Inter (OFL).
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import look
SERIF = os.path.join(D, '..', 'data', 'fonts', 'CormorantGaramond.ttf')
CORAL = look.ACCENT
earth = Image.open(f'{D}/anim_globe_t0.35.png').convert('RGB')   # 1920×1080, шар по центру ~ (960,540), радиус ~385

def serif(size, w='Medium'):
    f = ImageFont.truetype(SERIF, size); f.set_variation_by_name(w); return f

def spaced(d, xy, s, f, track, fill, anchor='mm'):
    ws = [f.getlength(c) for c in s]; tw = sum(ws) + track * (len(s) - 1)
    x = xy[0] - tw / 2 if anchor == 'mm' else xy[0]
    for c, w in zip(s, ws):
        d.text((x, xy[1]), c, font=f, fill=fill, anchor='lm'); x += w + track
    return tw

def ring(size, box, width, start, end, alpha=255):
    """кольцо орбиты, «прошивающее» планету: задняя половина бледнее"""
    lay = Image.new('RGBA', size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.arc(box, start, end, fill=CORAL + (alpha,), width=width)
    glow = lay.filter(ImageFilter.GaussianBlur(width * 2))
    return Image.alpha_composite(glow, lay)

# ---------- аватар ----------
S = 1600
av = earth.crop((960 - 520, 540 - 520, 960 + 520, 540 + 520)).resize((S, S), Image.LANCZOS).convert('RGBA')
box = (int(S * 0.04), int(S * 0.36), int(S * 0.96), int(S * 0.64))
back = ring(av.size, box, 14, 180, 360, 110)          # задняя дуга — за планетой (бледно)
front = ring(av.size, box, 18, 0, 180, 255)           # передняя дуга — перед планетой
R = 385 * S / 1040                                    # радиус шара на аватаре
disk = Image.new('L', av.size, 0); ImageDraw.Draw(disk).ellipse((S / 2 - R, S / 2 - R, S / 2 + R, S / 2 + R), fill=255)
bm = back.split()[3]; bm = Image.composite(Image.new('L', av.size, 0), bm, disk); back.putalpha(bm)
av = Image.alpha_composite(Image.alpha_composite(av, back), front)
av.convert('RGB').resize((800, 800), Image.LANCZOS).save(f'{D}/avatar_800.png')

# ---------- шапка ----------
W, H = 2560, 1440
bn = Image.new('RGB', (W, H), (0, 0, 0))
big = earth.resize((int(1920 * 2.2), int(1080 * 2.2)), Image.LANCZOS)    # шар радиусом ~850
bn.paste(big, (int(W * 0.80 - 960 * 2.2), int(H * 0.86 - 540 * 2.2)))   # вспышка солнца ниже надписи
bn = bn.convert('RGBA')
g = Image.new('L', (W, H), 0); dg = ImageDraw.Draw(g)
for x in range(W): dg.line([(x, 0), (x, H)], fill=int(235 * max(0.0, 1 - x / (W * 0.66)) ** 1.4))
bn = Image.alpha_composite(bn, Image.merge('RGBA', [Image.new('L', (W, H), 3)] * 3 + [g]))
cx, cy = W / 2, H / 2
lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
tw = spaced(dl, (cx, cy - 34), 'СКВОЗЬ СТРАНЫ', serif(150, 'Medium'), 34, (248, 243, 232, 255))
dl.line((cx - tw / 2, cy + 52, cx - tw / 2 + 160, cy + 52), fill=CORAL + (255,), width=4)
look.text(lay, (cx - tw / 2, cy + 104), 'ДОКУМЕНТАЛЬНЫЕ ФИЛЬМЫ О СТРАНАХ, ПРИРОДЕ И ЛЮДЯХ', 30, 400, (225, 230, 240), 'ls', track=6, shadow=0)
sh = lay.split()[3].filter(ImageFilter.GaussianBlur(16)); dark = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dark.putalpha(sh.point(lambda v: int(v * 0.7)))
bn = Image.alpha_composite(Image.alpha_composite(bn, dark), lay)
bn.convert('RGB').save(f'{D}/banner_2560x1440.jpg', quality=93)
# проверочные: как шапка выглядит на телефоне (безопасная зона) и на ТВ
bn.convert('RGB').crop((int(cx - 773), int(cy - 211), int(cx + 773), int(cy + 212))).save(f'{D}/banner_safe_preview.jpg', quality=90)
print('ok')
