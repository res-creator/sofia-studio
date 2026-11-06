# Оформление канала (выбор владелицы: стиль A «чистый белый» + коралловый акцент из D).
# Белый шрифт Inter без жирной обводки, мягкая тень, подписи заглавными с разрядкой, тонкие линии;
# коралловый — линии на картах, точки, выделение в графиках. Анимации как в After Effects:
# цифра «выезжает» из-под маски и досчитывает, линия-акцент дорисовывается, плашка места раскрывается.
import math, os, re
from PIL import Image, ImageDraw, ImageFilter, ImageFont
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
WHITE = (255, 255, 255)
SOFT = (225, 230, 236)
ACCENT = (255, 107, 74)      # коралловый
ACCENT2 = (20, 184, 166)     # бирюзовый (редко, второй цвет в графиках)
DARK = (14, 18, 24)
_FC = {}

def font(size, weight=700, name='Inter.ttf'):
    key = (size, weight, name)
    if key in _FC: return _FC[key]
    f = ImageFont.truetype(os.path.join(DATA, name), max(6, int(size)))
    try:
        vals = []
        for a in f.get_variation_axes():
            n = a['name'] if isinstance(a['name'], str) else a['name'].decode()
            vals.append(weight if n == 'Weight' else (min(32, max(14, size)) if n == 'Optical size' else a['default']))
        f.set_variation_by_axes(vals)
    except Exception: pass
    _FC[key] = f; return f

def ease(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def ease_out(t): t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3
def ease_back(t):  # лёгкий «перелёт» как в AE (easy ease + overshoot)
    t = max(0.0, min(1.0, t)); c = 1.4; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2

def text(img, xy, s, size, weight=700, fill=WHITE, anchor='la', alpha=1.0, track=0, shadow=0.55, name='Inter.ttf'):
    """Текст с мягкой тенью (без обводки). track — разрядка в пикселях."""
    if alpha <= 0 or not s: return
    s = s.replace('\u202f', '\u2009')        # разряды: тонкий пробел (узкий в Inter почти не виден)
    f = font(size, weight, name)
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    if track:
        w = sum(f.getlength(c) for c in s) + track * (len(s) - 1)
        x, y = xy
        if anchor[0] == 'm': x -= w / 2
        elif anchor[0] == 'r': x -= w
        va = anchor[1] if len(anchor) > 1 else 'a'
        asc, desc = f.getmetrics()
        cap = f.getbbox('Н')[1]                     # верх заглавной от линии «a» (ascender)
        if va in 'at': yb = y + asc - (cap if va == 't' else 0)
        elif va == 'm': yb = y + (asc - cap) / 2
        elif va in 'sb': yb = y if va == 's' else y - desc
        else: yb = y + asc
        for c in s:   # каждая буква по общей базовой линии (иначе запятые «уезжают» вверх)
            d.text((x, yb), c, font=f, fill=fill + (255,), anchor='ls'); x += f.getlength(c) + track
    else:
        d.text(xy, s, font=f, fill=fill + (255,), anchor=anchor)
    if shadow:
        sh = layer.split()[3].filter(ImageFilter.GaussianBlur(max(3, size / 9)))
        sh = sh.point(lambda v: int(v * shadow * alpha))
        img.alpha_composite(Image.merge('RGBA', [Image.new('L', img.size, 0)] * 3 + [sh]), (0, max(1, int(size / 30))))
    if alpha < 1: layer.putalpha(layer.split()[3].point(lambda v: int(v * alpha)))
    img.alpha_composite(layer)

def _count(num, k):
    """«21 268 млрд крон» при k<1 показывает досчитывающее число (как счётчик в AE)."""
    m = re.search(r'\d[\d\s]*(?:,\d+)?', num)
    if not m or k >= 1: return num
    raw = m.group(0); val = float(raw.replace(' ', '').replace(' ', '').replace(',', '.'))
    dec = len(raw.split(',')[1]) if ',' in raw else 0
    cur = val * ease_out(k)
    s = f'{cur:,.{dec}f}'.replace(',', ' ').replace('.', ',')
    return num[:m.start()] + s + num[m.end():]

def number(img, xy, num, sub, t, t0=0.25, size=104, align='l', t_out=None, count=True):
    """Главная цифра: акцентная линия дорисовывается, цифра выезжает из-под маски и досчитывает, подпись проявляется."""
    if t < t0: return
    u = (t - t0)
    a_out = 1.0 if t_out is None else max(0.0, 1 - (t - t_out) / 0.3) if t > t_out else 1.0
    x, y = xy
    anchor = {'l': 'ls', 'm': 'ms', 'r': 'rs'}[align]
    # акцентная линия над цифрой
    lw = 90 * ease_out(u / 0.35)
    d = ImageDraw.Draw(img)
    lx = x if align == 'l' else x - 45 if align == 'm' else x - 90
    if lw > 1: d.rectangle((lx, y - size * 0.95, lx + lw, y - size * 0.95 + 5), fill=ACCENT + (int(255 * a_out),))
    # цифра: подъём на 0,45 с из-под маски
    k = ease_back(u / 0.45)
    shown = _count(num, (u / 0.9) if count else 1)
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    text(layer, (x, y + (1 - k) * size * 0.7), shown, size, 800, WHITE, anchor, alpha=1.0)
    mask = Image.new('L', img.size, 0); ImageDraw.Draw(mask).rectangle((0, y - size * 1.2, img.size[0], y + size * 0.3), fill=int(255 * a_out))
    layer.putalpha(Image.composite(layer.split()[3], Image.new('L', img.size, 0), mask))
    img.alpha_composite(layer)
    if sub:
        sa = ease((u - 0.35) / 0.35) * a_out
        text(img, (x, y + size * 0.42), sub.upper(), max(26, size * 0.32), 600, WHITE, {'l': 'lt', 'm': 'mt', 'r': 'rt'}[align], alpha=sa, track=3, shadow=0.95)

def tag(img, title, t, sub=None, t_out=None):
    """Плашка места: коралловая вертикальная черта растёт, текст выезжает справа налево из-под маски."""
    if t < 0.1: return
    u = t - 0.1
    a_out = 1.0 if t_out is None or t < t_out else max(0.0, 1 - (t - t_out) / 0.3)
    x, y = 72, 62
    h = 58 * ease_out(u / 0.3)
    d = ImageDraw.Draw(img); d.rectangle((x, y, x + 5, y + h), fill=ACCENT + (int(255 * a_out),))
    k = ease_out((u - 0.15) / 0.45)
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    text(layer, (x + 22 - (1 - k) * 40, y + 2), title.upper(), 30, 700, WHITE, 'la', track=4)
    if sub: text(layer, (x + 22 - (1 - k) * 40, y + 40), sub.upper(), 20, 500, SOFT, 'la', track=4, alpha=0.9)
    mask = Image.new('L', img.size, 0); ImageDraw.Draw(mask).rectangle((x + 12, 0, img.size[0], y + 90), fill=int(255 * a_out))
    layer.putalpha(Image.composite(layer.split()[3], Image.new('L', img.size, 0), mask))
    img.alpha_composite(layer)

def map_label(img, p, s, size=34, dot=True, t=1.0):
    if dot:
        d = ImageDraw.Draw(img); r = size * 0.32
        d.ellipse((p[0] - r - 4, p[1] - r - 4, p[0] + r + 4, p[1] + r + 4), fill=(255, 255, 255, 255))
        d.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=ACCENT + (255,))
    text(img, (p[0] + size * 0.75, p[1]), s, size, 600, WHITE, 'lm', alpha=min(1.0, t / 0.3), shadow=0.8)

def title_card(img, s, t, t0=0.0, size=150, y=None):
    """Заголовок вступления: буквы сходятся из широкой разрядки, тонкая коралловая линия под ними."""
    if t < t0: return
    u = t - t0; W, H = img.size; y = y or H / 2
    track = 60 * (1 - ease_out(u / 1.2)) + 18
    a = ease(u / 0.6)
    text(img, (W / 2, y), s, size, 800, WHITE, 'mm', alpha=a, track=track, shadow=0.7)
    lw = 260 * ease_out((u - 0.3) / 0.6)
    if lw > 1: ImageDraw.Draw(img).rectangle((W / 2 - lw / 2, y + size * 0.62, W / 2 + lw / 2, y + size * 0.62 + 5), fill=ACCENT + (int(255 * a),))
