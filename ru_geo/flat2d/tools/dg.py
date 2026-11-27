"""Общие примитивы для собственных схем (dg.py). Использование:
import sys; sys.path.insert(0, '/home/user/sofia-studio/ru_geo/flat2d/tools'); from dg import *
S = Slug('universe_size')            # папка ролика
im, d = S.new('Заголовок', 'подпись внизу (необязательно)')
... рисуем d (PIL ImageDraw) в 1920x1080; нижние 250 px оставь свободными под субтитры ...
S.save('ключ', im, 'подпись для титров')   # -> archive/img/ключ.jpg + запись в credits.json
Цвета: BG, TXT, OR(оранж), BL(синий), GR(серый), SUB(светло-серый), YL(жёлтый). F(размер) шрифт. lab(d,(x,y),'текст',размер,цвет,anchor)."""
import json, math, os
from PIL import Image, ImageDraw, ImageFont
W, H = 1920, 1080; BG = (14, 14, 17); TXT = (240, 240, 240); OR = (240, 170, 60); BL = (90, 170, 230); GR = (70, 74, 84); SUB = (175, 175, 182); YL = (255, 214, 64); GN = (110, 200, 130); RD = (230, 90, 90)
def F(sz): return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', sz)
def lab(d, xy, t, sz=36, col=TXT, anchor='mm'): d.text(xy, t, font=F(sz), fill=col, anchor=anchor)
def fit(d, t, sz, maxw):
    while sz > 18 and d.textlength(t, font=F(sz)) > maxw: sz -= 2
    return sz
class Slug:
    def __init__(self, slug):
        self.slug = slug; self.J = f'/home/user/sofia-studio/ru_geo/{slug}'; self.IMG = f'{self.J}/archive/img'; os.makedirs(self.IMG, exist_ok=True); self.new_keys = {}
    def new(self, title, note=None):
        im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im); lab(d, (W / 2, 80), title, fit(d, title, 60, 1700), TXT)
        if note: lab(d, (W / 2, 780), note, fit(d, note, 34, 1700), SUB)
        return im, d
    def save(self, key, im, cap=''):
        im.save(f'{self.IMG}/{key}.jpg', quality=92)
        self.new_keys[key] = dict(file=key + '.jpg', author='собственная графика', license='свободно', cap='', page='', title=cap or key)
        cp = f'{self.J}/archive/credits.json'; cr = json.load(open(cp, encoding='utf8')) if os.path.exists(cp) else {}
        cr[key] = self.new_keys[key]; json.dump(cr, open(cp, 'w'), ensure_ascii=False, indent=1)
    def bars(self, key, title, items, note=None, unit='', hi=()):
        """items=[(подпись, значение, подпись_значения)] горизонтальные столбики в линейном масштабе"""
        im, d = self.new(title, note); mx = max(v for _, v, _ in items); n = len(items); step = min(120, 460 / max(1, n))
        for i, (nm, v, lb) in enumerate(items):
            y = 220 + i * step; w = 1000 * v / mx; lab(d, (500, y), nm, fit(d, nm, 34, 440), SUB, 'rm'); d.rectangle((520, y - step * 0.3, 520 + w, y + step * 0.3), fill=OR if nm in hi else BL); lab(d, (520 + w + 16, y), lb or f'{v}{unit}', 38, TXT, 'lm')
        self.save(key, im); return im
    def cards(self, key, title, items, note=None):
        """items=[(крупное, подпись, цвет)] до 3 карточек в ряд"""
        im, d = self.new(title, note); n = len(items); cw = min(560, 1700 // n - 40)
        for i, (big, sub, col) in enumerate(items):
            x = W / 2 + (i - (n - 1) / 2) * (cw + 40); d.rounded_rectangle((x - cw / 2, 260, x + cw / 2, 640), 30, outline=col, width=5); lab(d, (x, 400), big, fit(d, big, 100, cw - 40), col); lab(d, (x, 540), sub, fit(d, sub, 38, cw - 40), TXT)
        self.save(key, im); return im
    def timeline(self, key, title, points, note=None):
        """points=[(доля 0..1, подпись, цвет)] подписи чередуются сверху/снизу"""
        im, d = self.new(title, note); d.line((260, 440, 1660, 440), fill=SUB, width=6)
        for i, (f, t, c) in enumerate(points):
            x = 260 + 1400 * f; d.ellipse((x - 14, 426, x + 14, 454), fill=c); lab(d, (x, 510 if i % 2 == 0 else 370), t, fit(d, t, 32, 420), c)
        self.save(key, im); return im
    def dots(self, key, title, n, big, note=None):
        """n из 100 закрашенных кружков"""
        im, d = self.new(title, note); cols = 20; r = 20; x0 = (W - cols * 2 * (r + 6)) / 2
        for i in range(100): x = x0 + (i % cols) * 2 * (r + 6) + r; y = 200 + (i // cols) * 2 * (r + 6) + r; d.ellipse((x - r, y - r, x + r, y + r), fill=OR if i < n else GR)
        lab(d, (W / 2, 640), big, 90, OR); self.save(key, im); return im
