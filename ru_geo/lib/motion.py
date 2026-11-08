# «Живые» фото в духе After Effects: вместо простого кен-бёрнса — параллакс 2.5D, 3D-наклон, быстрый наезд со смазом,
# быстрая панорама с дотяжкой, фокус-пулл, «два плана из одного фото», а для архивных/вертикальных — карточка-«отпечаток»
# на размытом фоне (наклон, парение, тень). Без нейросетей: только PIL + numpy.
#
#   import motion
#   for fr in motion.frames(path, dur, mode='auto', seed=k, fit=sh.get('fit', False)): pipe.write(fr)
#
# frames() — замена render.frames_photo: генератор сырых RGB-кадров (W*H*3 байт), ровно round(dur*FPS) штук.
import math, os, random, sys
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageEnhance
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import look

MODES = ('parallax', 'tilt3d', 'push', 'pan_fast', 'rack', 'split_zoom')
BIL, BIC = Image.BILINEAR, Image.BICUBIC


# ───────────────────────── общие помощники ─────────────────────────
def _drift(t, k=0.55, lin=0.12):
    """Быстро в первые k доли клипа (ease_out), дальше медленный дрейф — без остановки «в ноль»."""
    return (1 - lin) * look.ease_out(t / k) + lin * t


def _load(path):
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGBA', im.size, (0, 0, 0, 255)); im = Image.alpha_composite(bg, im)
    return im.convert('RGB')


def _prescale(im, need_w, need_h):
    """Уменьшаем исходник до нужного максимума (сэмплинг ≈1:1 — быстрее и без «лестниц»), но не увеличиваем."""
    iw, ih = im.size; s = max(need_w / iw, need_h / ih)
    if s < 1: im = im.resize((max(1, round(iw * s)), max(1, round(ih * s))), Image.LANCZOS)
    return im


class _Cam:
    """Камера по исходнику: кадр W×H, «вписанный» с заполнением (cover), zoom ≥ 1, центр (fx, fy) в долях исходника."""
    def __init__(self, im, W, H):
        self.im, self.W, self.H = im, W, H
        self.iw, self.ih = im.size
        self.base = max(W / self.iw, H / self.ih)          # исходник→экран при zoom=1

    def box(self, z, fx, fy):
        cw, ch = self.W / (self.base * z), self.H / (self.base * z)
        cx = min(max(fx * self.iw, cw / 2), self.iw - cw / 2); cy = min(max(fy * self.ih, ch / 2), self.ih - ch / 2)
        return (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)

    def view(self, z, fx, fy, size=None, im=None, res=BIL):
        return (im or self.im).resize(size or (self.W, self.H), res, box=self.box(z, fx, fy))

    def travel_x(self, z):
        """Сколько (в долях ширины исходника) можно проехать по горизонтали при этом zoom."""
        return max(0.0, 1 - self.W / (self.base * z) / self.iw)


def _mblur(cam, samples, W, H, half=2):
    """Смаз движения: среднее нескольких положений камеры в пол-разрешения (смаз всё равно размытый)."""
    acc = None
    for (z, fx, fy) in samples:
        a = np.asarray(cam.view(z, fx, fy, (W // half, H // half)), np.float32)
        acc = a if acc is None else acc + a
    return Image.fromarray((acc / len(samples)).astype(np.uint8)).resize((W, H), BIL)


def _blend(a, b, w):
    return a if w <= 0.01 else (b if w >= 0.99 else Image.blend(a, b, w))


# ───────────────────────── анализ картинки (без ML) ─────────────────────────
def _small(im, w=384):
    s = w / im.size[0]
    return np.asarray(im.resize((w, max(8, round(im.size[1] * s))), BIL), np.float32) / 255.0


def _box_blur(a, r):
    """Быстрое размытие numpy через интегральное изображение (2D, окно (2r+1)²)."""
    if r < 1: return a
    pad = np.pad(a, ((r + 1, r), (r + 1, r)) + ((0, 0),) * (a.ndim - 2), mode='edge')
    c = pad.cumsum(0).cumsum(1)
    k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)


def _norm(a):
    lo, hi = np.percentile(a, 2), np.percentile(a, 98)
    return np.clip((a - lo) / max(1e-6, hi - lo), 0, 1)


def depth_map(im, w=256):
    """Грубая «карта глубины» без ML (0 — далеко, 1 — близко), гладкая: перспектива (низ кадра ближе) +
    детали/контраст + отличие от цвета верхнего края (небо). Гладкость важнее точности: деформация сетки
    по ней непрерывна — нет ни дыр, ни двоения краёв."""
    a = _small(im, w); h = a.shape[0]
    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    ycc = np.stack([lum, a[..., 2] - lum, a[..., 0] - lum], -1)
    sal = np.linalg.norm(_box_blur(ycc, 2) - ycc.reshape(-1, 3).mean(0), axis=-1)       # «заметность» (Achanta)
    gy, gx = np.gradient(_box_blur(lum, 1)); edge = _box_blur(np.hypot(gx, gy), 5)     # плотность деталей
    sky = np.median(a[: max(2, h // 10)].reshape(-1, 3), 0)
    dsky = np.linalg.norm(_box_blur(a, 3) - sky, axis=-1)                                 # «не небо»
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    vert = np.broadcast_to(yy ** 0.9, (h, w))
    s = 0.40 * vert + 0.20 * _norm(sal) + 0.20 * _norm(edge) + 0.20 * _norm(dsky)
    s = _norm(_box_blur(_box_blur(_box_blur(s, 8), 8), 8))
    return s.astype(np.float32)


def _sample(a, x, y):
    """Билинейная выборка карты a (h×w) в точках x, y (в долях 0..1)."""
    h, w = a.shape
    x = np.clip(x * (w - 1), 0, w - 1); y = np.clip(y * (h - 1), 0, h - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); x1 = np.minimum(x0 + 1, w - 1); y1 = np.minimum(y0 + 1, h - 1)
    fx, fy = x - x0, y - y0
    return (a[y0, x0] * (1 - fx) + a[y0, x1] * fx) * (1 - fy) + (a[y1, x0] * (1 - fx) + a[y1, x1] * fx) * fy


def detail_region(im, frac=0.5, w=256):
    """Самый «контрастный» участок (центр в долях) для окна размером frac кадра — для 'split_zoom'."""
    a = _small(im, w); h = a.shape[0]
    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    var = _box_blur(lum ** 2, 3) - _box_blur(lum, 3) ** 2
    sal = np.linalg.norm(a - a.reshape(-1, 3).mean(0), axis=-1)
    r = max(2, int(min(w, h) * frac / 2))
    s = _box_blur(_norm(var) * 0.6 + _norm(sal) * 0.4, r)
    yy = np.linspace(-1, 1, h)[:, None]; xx = np.linspace(-1, 1, w)[None, :]
    s = s * (1 - 0.35 * (xx ** 2 + yy ** 2))                          # не к самым краям
    y, x = np.unravel_index(np.argmax(s), s.shape)
    return (x + 0.5) / w, (y + 0.5) / h


# ───────────────────────── перспектива (3D-наклон) ─────────────────────────
def _rot(ay, ax, az=0.0):
    cy, sy, cx, sx, cz, sz = math.cos(ay), math.sin(ay), math.cos(ax), math.sin(ax), math.cos(az), math.sin(az)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rx = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    Rz = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return Ry @ Rx @ Rz


def _homog(W, H, k, uc, vc, ay, ax, az=0.0, sx=0.0, sy=0.0, F=None):
    """Плоскость-фото (пиксели u,v, центр uc,vc, масштаб k экр.пикс/пикс) повёрнута на ay/ax/az и спроецирована
    камерой с фокусом F. Возвращает (коэфф. PIL PERSPECTIVE экран→исходник, матрица исходник→экран)."""
    F = F or 1.25 * W
    R = _rot(ay, ax, az)
    Ms = np.array([[k, 0, -k * uc], [0, k, -k * vc], [0, 0, 1.0]])
    P = np.column_stack([R[:, 0], R[:, 1], [0, 0, F]])
    K = np.array([[F, 0, W / 2 + sx], [0, F, H / 2 + sy], [0, 0, 1.0]])
    Hm = K @ P @ Ms
    Hi = np.linalg.inv(Hm); Hi /= Hi[2, 2]
    return tuple(Hi.flatten()[:8]), Hm


def _covers(coef, W, H, iw, ih, m=1.0):
    a, b, c, d, e, f, g, h = coef
    for x, y in ((0, 0), (W, 0), (0, H), (W, H), (W / 2, 0), (W / 2, H), (0, H / 2), (W, H / 2)):
        q = g * x + h * y + 1
        u, v = (a * x + b * y + c) / q, (d * x + e * y + f) / q
        if not (m <= u <= iw - m and m <= v <= ih - m): return False
    return True


_POOL = None


def _ptransform(src, size, coef, mode='RGB', strips=3):
    """Image.transform(PERSPECTIVE) полосами в нескольких потоках (PIL отпускает GIL) — в 2–3 раза быстрее."""
    global _POOL
    w, h = size
    if h < 300: return src.transform(size, Image.PERSPECTIVE, coef, BIL)
    if _POOL is None:
        from concurrent.futures import ThreadPoolExecutor
        _POOL = ThreadPoolExecutor(max(1, min(strips, os.cpu_count() or 1)))
    a, b, c, d, e, f, g, hh = coef
    ys = [round(h * j / strips) for j in range(strips + 1)]
    def one(j):
        y0 = ys[j]   # сдвиг выходных координат на y0: подставляем y+y0
        cf = (a / (hh * y0 + 1), (b) / (hh * y0 + 1), (c + b * y0) / (hh * y0 + 1),
              d / (hh * y0 + 1), e / (hh * y0 + 1), (f + e * y0) / (hh * y0 + 1),
              g / (hh * y0 + 1), hh / (hh * y0 + 1))
        return src.transform((w, ys[j + 1] - y0), Image.PERSPECTIVE, cf, BIL)
    parts = list(_POOL.map(one, range(strips)))
    out = Image.new(src.mode, size)
    for j, p in enumerate(parts): out.paste(p, (0, ys[j]))
    return out


# ───────────────────────── зерно / пыль ─────────────────────────
class _Grain:
    def __init__(self, W, H, amt, dust, seed):
        rng = np.random.default_rng(seed + 7); A = 64
        self.A = A
        # тайлы шума: серое зерно (R=G=B), смещено на A; кладётся ImageChops.add(..., offset=-A) — быстро, в C
        self.tiles = [Image.fromarray(np.clip(A + rng.normal(0, 255 * amt, (H // 2, W // 2)), 0, 255).astype(np.uint8))
                      .resize((W, H), BIL).convert('RGB') for _ in range(6)] if amt > 0 else []
        self.amt, self.dust, self.rng, self.W, self.H = amt, dust, random.Random(seed), W, H

    def __call__(self, img, i):
        if self.tiles:
            img = ImageChops.add(img, self.tiles[(i * 5) % len(self.tiles)], 1.0, -self.A)
        if self.dust and self.rng.random() < 0.35:
            d = ImageDraw.Draw(img); r = self.rng
            for _ in range(r.randint(1, 3)):
                x, y, s = r.uniform(0, self.W), r.uniform(0, self.H), r.uniform(1.2, 3.2)
                col = (235, 235, 230) if r.random() < 0.6 else (25, 22, 20)
                if r.random() < 0.25:   # волосок
                    d.line([(x, y), (x + r.uniform(-30, 30), y + r.uniform(-18, 18))], fill=col, width=1)
                else:
                    d.ellipse((x - s, y - s, x + s, y + s), fill=col)
        return img


# ───────────────────────── режимы ─────────────────────────
def _m_push(im, n, W, H, rnd):
    cam = _Cam(_prescale(im, W * 1.32, H * 1.32), W, H)
    fx0, fy0 = 0.5 + rnd.uniform(-0.06, 0.06), 0.5 + rnd.uniform(-0.05, 0.03)
    fx1, fy1 = fx0 + rnd.uniform(-0.04, 0.04), fy0 + rnd.uniform(-0.03, 0.03)
    z0, z1 = 1.0, 1.28
    st = lambda t: (z0 + (z1 - z0) * _drift(t, 0.4, 0.15), fx0 + (fx1 - fx0) * _drift(t, 0.4, 0.15), fy0 + (fy1 - fy0) * _drift(t, 0.4, 0.15))
    for i in range(n):
        t = i / max(1, n - 1); z, fx, fy = st(t)
        img = cam.view(z, fx, fy)
        zp, _, _ = st(max(0, t - 1 / max(1, n - 1)))
        sp = (z - zp) * 30 / z                     # скорость наезда (доля/кадр ×30)
        if sp > 0.08:
            k = 4
            img = _blend(img, _mblur(cam, [st(max(0, t - j / max(1, n - 1) * 0.8 / k)) for j in range(k + 1)], W, H),
                         min(0.85, (sp - 0.08) * 2.2))
        yield img


def _m_pan(im, n, W, H, rnd):
    iw, ih = im.size
    cam0 = _Cam(im, W, H)
    z = 1.06
    while cam0.travel_x(z) < 0.16 and z < 1.6: z += 0.02
    cam = _Cam(_prescale(im, W * z * max(1.0, iw / ih / (W / H)) + 4, H * z + 4), W, H)
    tr = min(0.42, cam.travel_x(z))
    cw = 1 - tr                                          # ширина окна в долях исходника
    d = rnd.choice((-1, 1)); x0, x1 = (cw / 2, cw / 2 + tr * 0.96) if d > 0 else (1 - cw / 2, 1 - cw / 2 - tr * 0.96)
    fy = 0.5 + rnd.uniform(-0.03, 0.03)
    st = lambda t: (z * (1 + 0.04 * t), x0 + (x1 - x0) * _drift(t, 0.5, 0.12), fy)
    for i in range(n):
        t = i / max(1, n - 1); zz, fx, fy_ = st(t)
        img = cam.view(zz, fx, fy_)
        _, fxp, _ = st(max(0, t - 1 / max(1, n - 1)))
        sp = abs(fx - fxp) * cam.iw * cam.base * zz        # пикселей экрана за кадр
        if sp > 14:
            k = 5
            img = _blend(img, _mblur(cam, [st(max(0, t - j / max(1, n - 1) * 0.9 / k)) for j in range(k + 1)], W, H),
                         min(0.8, (sp - 14) / 40))
        yield img


def _m_rack(im, n, W, H, rnd):
    cam = _Cam(_prescale(im, W * 1.14, H * 1.14), W, H)
    fx0, fy0 = 0.5 + rnd.uniform(-0.05, 0.05), 0.5 + rnd.uniform(-0.04, 0.04)
    for i in range(n):
        t = i / max(1, n - 1)
        u = look.ease(t) * 0.8 + t * 0.2
        img = cam.view(1.02 + 0.11 * u, fx0, fy0)
        fb = 1 - look.ease(min(1, t / 0.42))                # 1 → 0 к 42% клипа
        if fb > 0.01:
            r = 3 + 11 * fb                                   # радиус на экране
            sm = img.resize((W // 4, H // 4), BIL).filter(ImageFilter.GaussianBlur(r / 4)).resize((W, H), BIL)
            sm = ImageEnhance.Brightness(sm).enhance(1 + 0.06 * fb)     # лёгкое «свечение» вне фокуса
            img = _blend(img, sm, min(1, fb * 1.25))
        yield img


def _m_split(im, n, W, H, rnd):
    cam = _Cam(_prescale(im, W * 2.0, H * 2.0), W, H)
    dx, dy = detail_region(im, 0.5)
    zd = min(2.0, max(1.6, 1.6 * cam.iw * cam.base / W))
    cut = n // 2
    for i in range(n):
        if i < cut:
            t = i / max(1, cut - 1)
            yield cam.view(1.0 + 0.07 * (look.ease(t) * 0.7 + t * 0.3), 0.5, 0.5)
        else:
            j = i - cut; t = j / max(1, n - cut - 1)
            punch = 1 + 0.10 * (1 - look.ease_out(min(1, j / 7)))      # «удар» зумом на склейке
            z = zd * (1 + 0.06 * t) * punch
            img = cam.view(z, dx + 0.02 * t, dy)
            if j < 2: img = ImageEnhance.Brightness(img).enhance(1.18 - 0.09 * j)
            yield img


def _m_tilt(im, n, W, H, rnd):
    src = _prescale(im, W * 1.45, H * 1.45); iw, ih = src.size
    base = max(W / iw, H / ih)
    d = rnd.choice((-1, 1)); dv = rnd.choice((-1, 1))
    ay0, ay1 = math.radians(7.5) * d, math.radians(-4.5) * d
    ax0, ax1 = math.radians(3.0) * dv, math.radians(-1.5) * dv
    az0, az1 = math.radians(0.9) * d, math.radians(-0.3) * d
    ang = lambda t: (ay0 + (ay1 - ay0) * (look.ease(t) * 0.8 + t * 0.2), ax0 + (ax1 - ax0) * look.ease(t), az0 + (az1 - az0) * look.ease(t))
    # минимальный масштаб, при котором ни в одном кадре нет краёв
    kmin = base
    for t in np.linspace(0, 1, 9):
        ay, ax, az = ang(t); k = base
        while not _covers(_homog(W, H, k, iw / 2, ih / 2, ay, ax, az)[0], W, H, iw, ih, 2) and k < base * 2: k *= 1.01
        kmin = max(kmin, k)
    for i in range(n):
        t = i / max(1, n - 1); ay, ax, az = ang(t)
        k = kmin * 1.01 * (1 + 0.07 * (look.ease(t) * 0.7 + t * 0.3))
        coef, _ = _homog(W, H, k, iw / 2, ih / 2, ay, ax, az)
        yield _ptransform(src, (W, H), coef)


def _m_parallax(im, n, W, H, rnd, NX=48, NY=27):
    """2.5D: сетка 48×27 деформируется по «карте глубины» — ближние участки наезжают и смещаются сильнее дальних
    (как камера, которая слегка «въезжает» в сцену). Image.MESH — быстро и без дыр."""
    zf1 = 1.20
    src = _prescale(im, W * zf1, H * zf1); iw, ih = src.size
    dep = depth_map(src)
    base = max(W / iw, H / ih)
    gx = np.linspace(0, W, NX + 1); gy = np.linspace(0, H, NY + 1)
    X, Y = np.meshgrid(gx, gy)                                   # вершины сетки на экране
    d = rnd.choice((-1, 1)); dv = rnd.uniform(-1, 1)
    # куда «въезжаем»: чуть к ближнему плану
    cx = 0.5 + rnd.uniform(-0.04, 0.04); cy = 0.52
    def srcpts(t):
        u = look.ease(t) * 0.75 + t * 0.25
        zb, zf = 1.05 + 0.03 * u, 1.06 + 0.10 * u             # далёкое почти стоит, ближнее наезжает
        ob = np.array([d * 0.010 * u, 0.004 * dv * u]); of = np.array([-d * 0.016 * u, -0.010 * u])
        # глубина в точке источника: два прохода (сначала со средним зумом)
        dd = 0.5
        for _ in range(2):
            Z = zb + (zf - zb) * dd
            ox = ob[0] + (of[0] - ob[0]) * dd; oy = ob[1] + (of[1] - ob[1]) * dd
            U = (cx + ox) + (X - W / 2) / (base * Z * iw); V = (cy + oy) + (Y - H / 2) / (base * Z * ih)
            dd = _sample(dep, U, V)
        return np.clip(U, 0, 1) * iw, np.clip(V, 0, 1) * ih
    gxi = [int(round(v)) for v in gx]; gyi = [int(round(v)) for v in gy]
    bands = [(0, NY // 3), (NY // 3, 2 * NY // 3), (2 * NY // 3, NY)]
    global _POOL
    if _POOL is None:
        from concurrent.futures import ThreadPoolExecutor
        _POOL = ThreadPoolExecutor(max(1, min(3, os.cpu_count() or 1)))
    for i in range(n):
        U, V = srcpts(i / max(1, n - 1))
        def band(rr):
            r0, r1 = rr; yo = gyi[r0]; mesh = []
            for r in range(r0, r1):
                for c in range(NX):
                    mesh.append(((gxi[c], gyi[r] - yo, gxi[c + 1], gyi[r + 1] - yo),
                                 (U[r, c], V[r, c], U[r + 1, c], V[r + 1, c], U[r + 1, c + 1], V[r + 1, c + 1], U[r, c + 1], V[r, c + 1])))
            return yo, src.transform((W, gyi[r1] - yo), Image.MESH, mesh, BIL)
        out = Image.new('RGB', (W, H))
        for yo, p in _POOL.map(band, bands): out.paste(p, (0, yo))
        yield out


def _fit(im, n, W, H, rnd):
    """Архив/вертикаль/маленькое фото: карточка целиком на размытой тёмной копии; карточка «живёт» — 3D-наклон,
    парение, мягкая тень; фон медленно плывёт в обратную сторону (параллакс)."""
    iw, ih = im.size
    gray = np.asarray(im.resize((64, 64)), np.float32).std(-1).mean() < 6     # ч/б архив → белая рамка-«отпечаток»
    smax = 1.04
    fs = min(W * 0.80 / iw, H * 0.78 / ih) * smax
    cw, ch = round(iw * fs), round(ih * fs)
    card = im.resize((cw, ch), Image.LANCZOS)
    bd = round(min(cw, ch) * 0.025) if gray else 2
    bcol = (238, 234, 224) if gray else (235, 235, 235)
    mg = 70
    sp = Image.new('RGBA', (cw + 2 * bd + 2 * mg, ch + 2 * bd + 2 * mg), (0, 0, 0, 0))
    sh = Image.new('L', sp.size, 0)
    ImageDraw.Draw(sh).rectangle((mg + 10, mg + 24, mg + cw + 2 * bd + 10, mg + ch + 2 * bd + 24), fill=165)
    sp.putalpha(sh.filter(ImageFilter.GaussianBlur(22)))
    pc = Image.new('RGB', (cw + 2 * bd, ch + 2 * bd), bcol); pc.paste(card, (bd, bd))
    sp.paste(pc, (mg, mg))
    spw, sph = sp.size
    # фон: размытая затемнённая копия (размываем в малом разрешении — быстро и мягко)
    sc = max(W / iw, H / ih) * 1.16
    bsm = im.resize((max(8, round(iw * sc / 4)), max(8, round(ih * sc / 4))), BIL).filter(ImageFilter.GaussianBlur(8))
    bsm = ImageEnhance.Brightness(ImageEnhance.Color(bsm).enhance(0.8)).enhance(0.42)
    bcam = _Cam(bsm, W, H)
    d = rnd.choice((-1, 1)); dv = rnd.choice((-1, 1)); ph = rnd.uniform(0, 6.28)
    for i in range(n):
        t = i / max(1, n - 1); u = look.ease(t) * 0.75 + t * 0.25
        bg = bcam.view(1.02 + 0.06 * u, 0.5 - d * 0.02 * u, 0.5).convert('RGBA')
        ay = math.radians(d * (6.0 - 10.0 * u) + 0.6 * math.sin(6.28 * t * 0.7 + ph))
        ax = math.radians(dv * (3.0 - 4.5 * u) + 0.5 * math.sin(6.28 * t * 0.5 + ph + 1))
        az = math.radians(-d * (1.2 - 1.8 * u))
        k = 0.92 + 0.06 * u                                               # лёгкий наезд карточки (≤1:1)
        fy = -0.012 * H + 7 * math.sin(6.28 * t * 0.45 + ph)           # парение
        fxo = d * 10 * (1 - u)
        _, Hm = _homog(W, H, k, spw / 2, sph / 2 - 8, ay, ax, az, fxo, fy)
        # считаем только прямоугольник, куда попадает карточка (быстрее, чем весь кадр)
        q = Hm @ np.array([[0, spw, spw, 0], [0, 0, sph, sph], [1, 1, 1, 1.0]]); q = q[:2] / q[2]
        x0, y0 = max(0, int(q[0].min()) - 1), max(0, int(q[1].min()) - 1)
        x1, y1 = min(W, int(q[0].max()) + 2), min(H, int(q[1].max()) + 2)
        Hi = np.linalg.inv(Hm) @ np.array([[1, 0, x0], [0, 1, y0], [0, 0, 1.0]]); Hi /= Hi[2, 2]
        fr = _ptransform(sp, (x1 - x0, y1 - y0), tuple(Hi.flatten()[:8]))
        bg.alpha_composite(fr, (x0, y0))
        yield bg.convert('RGB')


_FUN = dict(parallax=_m_parallax, tilt3d=_m_tilt, push=_m_push, pan_fast=_m_pan, rack=_m_rack, split_zoom=_m_split)


def pick_mode(im_or_size, seed=0):
    """Детерминированный выбор режима по seed с учётом формы/размера фото."""
    iw, ih = im_or_size if isinstance(im_or_size, tuple) else im_or_size.size
    asp = iw / ih; rnd = random.Random(seed * 7919 + 13)
    if asp > 2.0: pool = ['pan_fast', 'pan_fast', 'pan_fast', 'tilt3d']        # панорамы — проезд
    elif asp < 1.1: pool = ['push', 'tilt3d', 'rack']                    # вертикаль без fit: только мягкие наезды
    else: pool = ['parallax', 'tilt3d', 'push', 'pan_fast', 'rack', 'split_zoom', 'parallax', 'tilt3d']
    small = max(iw / 1920, ih / 1080) < 0.75
    if small: pool = [p for p in pool if p not in ('parallax', 'split_zoom', 'pan_fast')] or ['tilt3d']
    return pool[rnd.randrange(len(pool))]


def frames(path, dur, mode='auto', W=1920, H=1080, FPS=30, seed=0, fit=False, grain=0.0, dust=False):
    """Генератор сырых RGB-кадров (W*H*3 байт), ровно round(dur*FPS) штук — замена render.frames_photo.
    mode: 'auto' | 'parallax' | 'tilt3d' | 'push' | 'pan_fast' | 'rack' | 'split_zoom'.
    fit=True — фото целиком «карточкой» на размытом фоне (архив/вертикаль/маленькие), режим тогда не важен.
    fit='auto' — сам решает (вертикаль или маленькое фото). grain 0..0.1 — плёночное зерно, dust — пылинки."""
    im = _load(path) if isinstance(path, str) else path.convert('RGB')
    n = round(dur * FPS)
    if fit == 'auto':
        iw, ih = im.size
        fit = iw / ih < 1.15 or max(iw / W, ih / H) < 0.6
    rnd = random.Random(seed * 31 + 5)
    if fit:
        gen = _fit(im, n, W, H, rnd)
    else:
        if mode == 'auto': mode = pick_mode(im, seed)
        gen = _FUN[mode](im, n, W, H, rnd)
    gr = _Grain(W, H, grain, dust, seed) if (grain or dust) else None
    k = 0
    for img in gen:
        if k >= n: break
        if img.size != (W, H): img = img.resize((W, H), BIL)
        if gr: img = gr(img, k)
        yield img.tobytes(); k += 1
    last = img.tobytes() if k else bytes(W * H * 3)
    while k < n: yield last; k += 1
