# Монтажные приёмы поверх видео (как в After Effects у документальных YouTube-каналов):
#   locator — мини-карта в углу с точкой «где это снято»;  card — фото-карточка / полароид с подписью от руки, выезжает сбоку;
#   circle  — коралловая обводка «маркером» вокруг объекта (+ стрелка и подпись);  badge — значок-подсказка (часы, линейка);
#   split   — экран на 2–3 части, панели выезжают по очереди.
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import look, geo
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'fx_cache'); os.makedirs(CACHE, exist_ok=True)
W, H = 1920, 1080

def _shadowed(img, layer, xy, r=26, a=150, off=(0, 14)):
    sh = Image.new('L', layer.size, 0); sh.paste(layer.split()[3], (0, 0))
    big = Image.new('L', img.size, 0); big.paste(sh, (int(xy[0] + off[0]), int(xy[1] + off[1])))
    big = big.filter(ImageFilter.GaussianBlur(r)).point(lambda v: int(v * a / 255))
    img.alpha_composite(Image.merge('RGBA', [Image.new('L', img.size, 0)] * 3 + [big]))
    img.alpha_composite(layer, (int(xy[0]), int(xy[1])))

def _inout(t, dur, t_in=0.25, d_in=0.45, d_out=0.35):
    """0..1 появление (с «перелётом») и уход в конце плана."""
    k = look.ease_back((t - t_in) / d_in) if t > t_in else 0.0
    if t > dur - d_out: k *= max(0.0, (dur - t) / d_out)
    return k

# ---------- мини-карта ----------
_MAPS = {}
VARIANTS = {'main': ((64.5, 15.0), 1900), 'svalbard': ((71.5, 18.0), 2700), 'south': ((61.0, 9.0), 1100),
            'isl': ((64.9, -18.6), 640, 'ISL')}   # третий элемент — подсвеченная страна (по умолчанию Норвегия)
def _map(variant):
    if variant in _MAPS: return _MAPS[variant]
    p = os.path.join(CACHE, f'locator_{variant}.png')
    c, wkm, *hl = VARIANTS[variant]; S = 420
    v = geo.View(c, c, wkm, S, S)
    if not os.path.exists(p):
        geo.base_map(v, hl[0] if hl else 'NOR').save(p)
    _MAPS[variant] = (Image.open(p).convert('RGBA'), v); return _MAPS[variant]

def locator(img, t, dur, lat, lon, name, variant='main', corner='br'):
    k = _inout(t, dur, 0.35)
    if k <= 0.01: return
    base, v = _map(variant); S = base.size[0]
    card = base.copy(); d = ImageDraw.Draw(card)
    x, y = v.px(lat, lon); x, y = float(x), float(y)
    ph = (t * 0.9) % 1.0; r = 8 + ph * 34
    d.ellipse((x - r, y - r, x + r, y + r), outline=look.ACCENT + (int(255 * (1 - ph)),), width=4)
    d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=look.ACCENT + (255,), outline=(255, 255, 255, 255), width=3)
    # подпись внизу карточки
    band = Image.new('RGBA', (S, 70), (10, 14, 20, 200)); card.alpha_composite(band, (0, S - 70))
    look.text(card, (S / 2, S - 35), name.upper(), 24, 700, look.WHITE, 'mm', track=3, shadow=0)
    m = Image.new('L', (S, S), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, S - 1, S - 1), 28, fill=255)
    card.putalpha(m)
    ImageDraw.Draw(card).rounded_rectangle((1, 1, S - 2, S - 2), 28, outline=(255, 255, 255, 230), width=4)
    sc = 0.78 * (0.85 + 0.15 * min(1.0, k)); size = int(S * sc)
    card = card.resize((size, size), Image.LANCZOS)
    if k < 1: card.putalpha(card.split()[3].point(lambda a: int(a * min(1.0, k))))
    x0 = W - size - 60 + (1 - min(1.0, k)) * 120 if 'r' in corner else 60 - (1 - min(1.0, k)) * 120
    y0 = H - size - 60 if 'b' in corner else 60
    _shadowed(img, card, (x0, y0), r=20, a=120)

# ---------- фото-карточка / полароид ----------
def card(img, t, dur, pic, caption=None, side='r', tilt=-4.0, polaroid=True, width=560, y=None, t_in=0.3):
    """pic — PIL.Image (кадр). Выезжает сбоку с поворотом, белая рамка, подпись от руки (Caveat)."""
    k = _inout(t, dur, t_in, 0.5)
    if k <= 0.01: return
    pw = width; ph = int(pw * pic.size[1] / pic.size[0])
    border = 18; bottom = 92 if (polaroid and caption) else border
    c = Image.new('RGBA', (pw + 2 * border, ph + border + bottom), (250, 248, 244, 255))
    c.paste(pic.convert('RGB').resize((pw, ph), Image.LANCZOS), (border, border))
    if polaroid and caption:
        f = look.font(52, 600, 'Caveat.ttf'); ImageDraw.Draw(c).text((c.size[0] / 2, ph + border + bottom / 2), caption, font=f, fill=(40, 44, 52), anchor='mm')
    ang = tilt + (1 - min(1.0, k)) * (12 if side == 'r' else -12)
    c = c.rotate(ang, resample=Image.BICUBIC, expand=True)
    y0 = (H - c.size[1]) / 2 - 40 if y is None else y
    if side == 'r': x0 = W - c.size[0] - 90 + (1 - min(1.0, k)) * (c.size[0] + 200)
    else: x0 = 90 - (1 - min(1.0, k)) * (c.size[0] + 200)
    _shadowed(img, c, (x0, y0), r=24, a=140, off=(10, 18))

# ---------- обводка маркером ----------
def circle(img, t, dur, cx, cy, rx, ry, label=None, t_in=0.4, arrow=None):
    """cx, cy, rx, ry — в долях кадра. Рисуется «от руки» за 0,6 с (чуть больше 360°, неровная линия)."""
    u = look.ease_out((t - t_in) / 0.6)
    if u <= 0: return
    a_out = 1.0 if t < dur - 0.3 else max(0.0, (dur - t) / 0.3)
    X, Y, RX, RY = cx * W, cy * H, rx * W, ry * H
    n = 90; pts = []
    for i in range(int(n * u) + 1):
        a = -2.2 + 2 * math.pi * 1.08 * i / n
        wob = 1 + 0.04 * math.sin(i * 0.35) + 0.03 * (i / n)
        pts.append((X + RX * wob * math.cos(a), Y + RY * wob * math.sin(a)))
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    if len(pts) > 1: d.line(pts, fill=look.ACCENT + (int(255 * a_out),), width=9, joint='curve')
    if arrow and u >= 1:   # стрелка от подписи к обводке
        ax, ay = arrow; k2 = look.ease_out((t - t_in - 0.6) / 0.35)
        sx, sy = ax * W, ay * H; ex, ey = X + (sx - X) * 0.0 + RX * (1 if sx > X else -1) * 0.9, Y - RY * 0.2
        mx, my = sx + (ex - sx) * k2, sy + (ey - sy) * k2
        d.line([(sx, sy), (mx, my)], fill=look.ACCENT + (int(255 * a_out),), width=8)
        if k2 >= 1:
            ang = math.atan2(ey - sy, ex - sx)
            for s_ in (-1, 1): d.line([(ex, ey), (ex - 34 * math.cos(ang + s_ * 0.5), ey - 34 * math.sin(ang + s_ * 0.5))], fill=look.ACCENT + (int(255 * a_out),), width=8)
    img.alpha_composite(lay)
    if label and u >= 1:
        lx, ly = (arrow[0] * W, arrow[1] * H) if arrow else (X + RX + 30, Y - RY)
        look.text(img, (lx, ly - 10), label, 64, 600, look.WHITE, 'mb' if arrow else 'ls', alpha=min(1.0, (t - t_in - 0.6) / 0.3) * a_out, name='Caveat.ttf', shadow=0.9)

# ---------- значок-подсказка ----------
def badge(img, t, dur, text, icon='clock', pos=(0.5, 0.82)):
    k = _inout(t, dur, 0.4, 0.4)
    if k <= 0.01: return
    f = look.font(44, 700); tw = f.getlength(text)
    bw, bh = int(tw + 130), 96
    c = Image.new('RGBA', (bw, bh), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    d.rounded_rectangle((0, 0, bw - 1, bh - 1), bh // 2, fill=(12, 16, 22, 215), outline=(255, 255, 255, 60), width=2)
    cx, cy = 52, bh / 2
    if icon == 'clock':
        d.ellipse((cx - 24, cy - 24, cx + 24, cy + 24), outline=look.ACCENT + (255,), width=5)
        a = t * 4
        d.line([(cx, cy), (cx + 15 * math.cos(a), cy + 15 * math.sin(a))], fill=(255, 255, 255, 255), width=4)
        d.line([(cx, cy), (cx, cy - 12)], fill=(255, 255, 255, 255), width=4)
    elif icon == 'ruler':
        d.rounded_rectangle((cx - 26, cy - 12, cx + 26, cy + 12), 4, outline=look.ACCENT + (255,), width=4)
        for i in range(5): d.line([(cx - 18 + i * 9, cy - 12), (cx - 18 + i * 9, cy - (2 if i % 2 else 6))], fill=(255, 255, 255, 255), width=3)
    elif icon == 'sun':
        d.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=look.ACCENT + (255,))
        for i in range(8):
            a = i * math.pi / 4 + t
            d.line([(cx + 19 * math.cos(a), cy + 19 * math.sin(a)), (cx + 27 * math.cos(a), cy + 27 * math.sin(a))], fill=look.ACCENT + (255,), width=4)
    d.text((96, bh / 2), text, font=f, fill=(255, 255, 255, 255), anchor='lm')
    s = 0.8 + 0.2 * min(1.0, k)
    c = c.resize((int(bw * s), int(bh * s)), Image.LANCZOS)
    if k < 1: c.putalpha(c.split()[3].point(lambda v: int(v * min(1.0, k))))
    _shadowed(img, c, (pos[0] * W - c.size[0] / 2, pos[1] * H - c.size[1] / 2), r=16, a=110)

# ---------- экран на части ----------
def split(frames, t, labels=None, gap=14, stagger=0.35):
    """frames — список np.array кадров 1920×1080 (по одному на панель). Панели выезжают снизу по очереди."""
    n = len(frames); pw = (W - gap * (n + 1)) / n
    out = Image.new('RGBA', (W, H), (10, 12, 16, 255))
    for i, fr in enumerate(frames):
        k = look.ease_back((t - i * stagger) / 0.5) if t > i * stagger else 0.0
        if k <= 0: continue
        im = Image.fromarray(fr)
        x0 = int(gap + i * (pw + gap)); w_ = int(pw)
        crop = im.crop(((W - w_) // 2, 0, (W - w_) // 2 + w_, H)).resize((w_, H - 2 * gap))
        y0 = gap + (1 - min(1.0, k)) * H * 0.6
        m = Image.new('L', crop.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, crop.size[0] - 1, crop.size[1] - 1), 18, fill=int(255 * min(1.0, k)))
        crop = crop.convert('RGBA'); crop.putalpha(m)
        out.alpha_composite(crop, (x0, int(y0)))
        if labels and k >= 0.9:
            look.text(out, (x0 + w_ / 2, H - 90), labels[i].upper(), 40, 700, look.WHITE, 'mm', track=4, alpha=min(1.0, (t - i * stagger - 0.4) / 0.3))
    return out
