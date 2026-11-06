# Инфографика «Согне-фьорд против Бурдж-Халифы»: поперечный разрез фьорда в точном вертикальном масштабе.
# Один непрерывный план (две фразы диктора), чтобы движение не обрывалось на склейке.
# Вертикаль: 1 308 м (глубина) и 828 м (башня) в одном масштабе. Горизонталь сжата (разрез схематичный, подписано в углу).
import math, os, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import geo
W, H, FPS, K = 1920, 1080, 30, 2           # K — суперсэмплинг (рисуем в 2× и уменьшаем: гладкие края)
YEL = (255, 214, 0)
SURF, BED = 300, 960                       # уровень воды и самая глубокая точка (пиксели при 1080p)
PPM = (BED - SURF) / 1308.0                # пикселей на метр — один масштаб для глубины и башни
CX = 1010                                  # ось самой глубокой части
def ease(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def ease_out(t): t = max(0.0, min(1.0, t)); return 1 - (1 - t) ** 3

def profile():
    """Профиль дна: U-образный ледниковый жёлоб, крутые стены, плоское дно из осадков, лёгкая асимметрия."""
    xs = np.linspace(0, W, 400)
    def depth_m(x):
        u = (x - CX) / 640.0                                   # полуширина жёлоба
        if abs(u) >= 1: return -900                             # выше воды (горы)
        base = 1308 * (1 - abs(u) ** 3.2)                       # U-форма
        base -= 60 * max(0, u) ** 2                             # северный склон чуть положе
        return base
    ys = [SURF + depth_m(x) * PPM for x in xs]
    # стены над водой: поднимаются к краям кадра
    out = []
    for x, y in zip(xs, ys):
        if y < SURF:
            d = abs(x - CX) - 640
            y = SURF - min(260, 40 + d * 0.9)
        out.append((x, y))
    # мелкая неровность скалы (фиксированная, без мерцания)
    rng = np.random.default_rng(11); n = rng.normal(0, 1, len(out)); n = np.convolve(n, np.ones(5) / 5, 'same') * 6
    return [(x, y + (nn if abs(x - CX) > 540 else 0)) for (x, y), nn in zip(out, n)]

def burj(h, cx, base):
    """Силуэт Бурдж-Халифы: ярусы с отступами и шпиль (~ 25 % высоты)."""
    tiers = [(1.00, 0.00), (0.80, 0.16), (0.66, 0.30), (0.54, 0.42), (0.44, 0.52), (0.35, 0.60), (0.27, 0.67), (0.20, 0.72), (0.14, 0.76)]
    w0 = 64
    L, R = [], []
    for i, (s, y0) in enumerate(tiers):
        y1 = tiers[i + 1][1] if i + 1 < len(tiers) else 0.80
        L += [(cx - w0 / 2 * s, base - h * y0), (cx - w0 / 2 * s, base - h * y1)]
        R += [(cx + w0 / 2 * s, base - h * y0), (cx + w0 / 2 * s, base - h * y1)]
    spire = [(cx - 4, base - h * 0.80), (cx - 1.5, base - h * 0.97), (cx, base - h), (cx + 1.5, base - h * 0.97), (cx + 4, base - h * 0.80)]
    return L + spire + R[::-1]

def label(d, img, xy, s, size=40, fill=(255, 255, 255), anchor='lm', weight=700):
    geo.text_outlined(img, xy, s, size, fill=fill, anchor=anchor, weight=weight, sw=max(2, size // 14))

def build_bg():
    S = lambda v: v * K
    bg = Image.new('RGB', (W * K, H * K))
    a = np.zeros((H * K, W * K, 3), np.float32)
    y = np.arange(H * K)[:, None] / K
    sky = np.clip(y / SURF, 0, 1)
    top, hor = np.array([92, 136, 186]), np.array([196, 214, 228])
    wat0, wat1 = np.array([30, 110, 150]), np.array([4, 18, 46])
    k = np.clip((y - SURF) / (BED - SURF + 60), 0, 1) ** 0.8
    col = np.where(y < SURF, top + (hor - top) * sky, wat0 + (wat1 - wat0) * k)
    a[:] = col[:, None, :] if col.ndim == 2 else col
    bg = Image.fromarray(a.astype(np.uint8))
    d = ImageDraw.Draw(bg, 'RGBA')
    # лучи света в воде
    for i, x in enumerate([700, 900, 1150, 1300]):
        d.polygon([(S(x - 20), S(SURF)), (S(x + 25), S(SURF)), (S(x + 140), S(SURF + 420)), (S(x + 60), S(SURF + 420))], fill=(255, 255, 255, 10))
    bg = bg.filter(ImageFilter.GaussianBlur(K * 6))
    d = ImageDraw.Draw(bg, 'RGBA')
    prof = profile()
    rock = [(S(x), S(y)) for x, y in prof]
    # скала: слоистый серо-коричневый массив
    d.polygon([(0, S(H))] + rock + [(S(W), S(H))], fill=(58, 54, 50, 255))
    for i in range(1, 7):     # слои породы (тёмные полосы, параллельные дну)
        d.line([(x, y + S(28 * i)) for x, y in rock], fill=(46, 43, 40, 255), width=S(10))
    d.line(rock, fill=(120, 112, 100, 255), width=S(4))                          # освещённая кромка
    d.polygon([(S(0), S(BED + 40)), (S(W), S(BED + 40)), (S(W), S(H)), (S(0), S(H))], fill=(40, 37, 34, 255))
    # осадки на дне
    sed = [(x, y) for x, y in rock if abs(x / K - CX) < 330]
    if sed: d.line(sed, fill=(118, 104, 82, 255), width=S(8))
    return bg, prof

def render(out, dur, t_burj):
    bg, prof = build_bg()
    deepest_y = max(y for x, y in prof if abs(x - CX) < 50)
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    hb = 828 * PPM
    global TINT, EMPTY
    m = np.zeros((H * K, W * K), np.uint8); m[SURF * K:, :] = 80
    TINT = Image.new('RGBA', (W * K, H * K), (20, 70, 110, 0)); TINT.putalpha(Image.fromarray(m))
    EMPTY = Image.new('RGBA', (W * K, H * K), (0, 0, 0, 0))
    for i in range(round(dur * FPS)):
        t = i / FPS
        img = bg.copy(); d = ImageDraw.Draw(img, 'RGBA'); S = lambda v: v * K
        # поверхность воды: мягкая волна + блик
        wave = [(S(x), S(SURF + 2.5 * math.sin(x / 70 + t * 1.6) + 1.2 * math.sin(x / 23 - t * 2.3))) for x in range(0, W + 10, 10)]
        d.line(wave, fill=(220, 240, 255, 230), width=S(3))
        # Бурдж-Халифа опускается на дно (за водой — тонировка)
        if t >= t_burj:
            u = ease_out((t - t_burj) / 2.4)
            base = (SURF - hb - 120) + (deepest_y - (SURF - hb - 120)) * u
            poly = [(S(x), S(y)) for x, y in burj(hb, CX, base)]
            tower = Image.new('RGBA', img.size, (0, 0, 0, 0)); td = ImageDraw.Draw(tower)
            td.polygon(poly, fill=(236, 242, 248, 255)); td.line(poly + [poly[0]], fill=(255, 255, 255, 255), width=S(2))
            # подводная часть темнее и синее
            tower = Image.alpha_composite(tower, Image.composite(TINT, EMPTY, tower.split()[3]))
            img = Image.alpha_composite(img.convert('RGBA'), tower).convert('RGB'); d = ImageDraw.Draw(img, 'RGBA')
        frame = img.resize((W, H), Image.LANCZOS).convert('RGBA'); fd = ImageDraw.Draw(frame)
        # шкала глубины: рисуется сверху вниз со счётчиком метров
        u = ease((t - 0.3) / 2.2)
        yb = SURF + (deepest_y - SURF) * u
        X = 300
        fd.line([(X, SURF), (X, yb)], fill=YEL + (255,), width=5)
        for m_ in range(0, 1309, 200):
            yy = SURF + m_ * PPM
            if yy <= yb + 0.5:
                fd.line([(X - 14, yy), (X, yy)], fill=YEL + (255,), width=4)
                label(fd, frame, (X - 24, yy), f'{m_:,} м'.replace(',', ' '), 30, anchor='rm', weight=600)
        if u > 0:
            fd.line([(X - 18, yb), (CX, yb)], fill=YEL + (int(200 * min(1, u * 3)),), width=2)
            cur = int(round(1308 * u))
            label(fd, frame, (X + 24, yb + 34 if u < 1 else yb - 30), f'{cur:,} м'.replace(',', ' '), 58 if u >= 1 else 46, fill=YEL)
        label(fd, frame, (60, 60), 'СОГНЕ-ФЬОРД · РАЗРЕЗ', 44, anchor='lm', weight=800)
        label(fd, frame, (60, 112), 'самая глубокая точка — 1 308 м', 32, fill=(230, 236, 242), weight=600)
        geo.text_outlined(frame, (W - 30, H - 26), 'вертикальный масштаб точный, ширина фьорда сжата', 22, fill=(200, 206, 214), anchor='rm', weight=500, sw=2, shadow=False)
        if t >= t_burj + 2.5:
            k = ease((t - t_burj - 2.5) / 0.5)
            top_y = deepest_y - hb
            a = int(255 * k)
            # подпись башни и «вода над шпилем»
            label(fd, frame, (CX + 60, deepest_y - hb * 0.45), 'Бурдж-Халифа · 828 м', 40, fill=(255, 255, 255))
            bx = CX + 230
            fd.line([(bx, SURF), (bx, top_y)], fill=(255, 90, 90, a), width=5)
            fd.line([(bx - 16, SURF), (bx + 16, SURF)], fill=(255, 90, 90, a), width=5)
            fd.line([(bx - 16, top_y), (bx + 16, top_y)], fill=(255, 90, 90, a), width=5)
            fd.line([(CX + 6, top_y), (bx - 18, top_y)], fill=(255, 90, 90, int(a * 0.7)), width=2)
            if k > 0.3: label(fd, frame, (bx + 28, (SURF + top_y) / 2), '480 м воды над шпилем', 46, fill=(255, 120, 120))
        p.stdin.write(frame.convert('RGB').tobytes())
    p.stdin.close(); p.wait()

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else f'{D}/cache/depth.mp4'
    render(out, float(sys.argv[2]) if len(sys.argv) > 2 else 11.0, float(sys.argv[3]) if len(sys.argv) > 3 else 4.5)
