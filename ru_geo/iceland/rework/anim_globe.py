# Кинематографичный «пролёт к Исландии»: камера в космосе смотрит на медленно вращающуюся Землю (терминатор,
# тонкий светящийся ободок атмосферы, звёзды, блик солнца у края), затем плавно летит к Исландии.
# Под фразу: «Исландия лежит в Северной Атлантике (0–2.3 с), между Гренландией и Норвегией (2.3–4.4 с),
# прямо под полярным кругом (4.4–5.9 с)».
#   0–2.3   пролёт из космоса к Северной Атлантике
#   2.3–4.4 Исландия в центре, бледные подписи «ГРЕНЛАНДИЯ» (слева) и «НОРВЕГИЯ» (справа), появляется контур Исландии
#   4.4–5.9 дорисовывается пунктир полярного круга (66,56° с. ш.) + подпись «ПОЛЯРНЫЙ КРУГ»; «ИСЛАНДИЯ» держится
# Рендер: настоящая перспективная камера + пересечение лучей со сферой (numpy, по пикселю), текстура Natural Earth I
# (глобально NE1_50M_SR_W 1/30°, вблизи — eur_hr.png 1/60°, тот же цвет), mip-уровни против «ряби», облака — 3D-шум.
# Запуск (из ru_geo/iceland):  python3 rework/anim_globe.py [секунды=5.9]  ->  cache/anim_globe.mp4
#   отладка кадров:            python3 rework/anim_globe.py 5.9 0,2.3,5.8 rework/sheets
import math, os, subprocess, sys, time, zipfile, io
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                                   # ru_geo/iceland
LIB = os.path.join(ROOT, '..', 'lib')
DATA = os.path.join(ROOT, '..', 'data')
sys.path.insert(0, LIB)
import look, geo
Image.MAX_IMAGE_PIXELS = None

W, H, FPS = 1920, 1080, 30
TOTAL = float(sys.argv[1]) if len(sys.argv) > 1 else 5.9
K = TOTAL / 5.9
T1, T2 = 2.3 * K, 4.4 * K                                      # границы фраз
R_KM = 6371.0
HFOV = math.radians(32.0)
TANH = math.tan(HFOV / 2)
ISL = (64.98, -19.0)                                           # центр Исландии
START = (21.0, 6.0)                                            # куда смотрит камера в начале (Африка/Европа/Атлантика)
SUN = (8.0, -52.0)                                             # подсолнечная точка: день над Атлантикой, ночь — справа
H0, H1 = 52000.0, 2260.0                                       # высота камеры, км (в конце Исландия ≈ 40 % ширины кадра)

GDIR = os.path.join(DATA, 'globe')
NE_URL = 'https://naciscdn.org/naturalearth/50m/raster/NE1_50M_SR_W.zip'

def vec(lat, lon):
    p, l = math.radians(lat), math.radians(lon)
    return np.array([math.cos(p) * math.cos(l), math.cos(p) * math.sin(l), math.sin(p)])

# ---------------------------------------------------------------- текстуры
def _grade(rgb):
    """rgb float 0..1 (NE1, пастель) -> «спутник»: тёмный сине-бирюзовый океан с рельефом дна, натуральная суша, яркий лёд."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    water = np.clip((b - r - 0.07) / 0.07, 0, 1)
    lum = rgb.mean(-1)
    t = np.clip((lum - 0.50) / 0.22, 0, 1)[..., None]
    deep = np.array([0.016, 0.058, 0.140], np.float32); shelf = np.array([0.05, 0.20, 0.30], np.float32)
    ocean = deep + (shelf - deep) * t ** 1.3
    L = lum[..., None]
    land = L + (rgb - L) * 0.80
    land = np.clip((land - 0.10) * 1.12, 0, 1) ** 1.9 * 0.86
    land = land * np.array([0.84, 0.88, 0.66], np.float32)
    mn = rgb.min(-1)
    snow = (np.clip((mn - 0.80) / 0.11, 0, 1) * np.clip((b - r + 0.015) / 0.035, 0, 1))[..., None]   # лёд голубоватый, песок тёплый
    ice = np.array([0.86, 0.90, 0.95], np.float32) * np.clip(L / 0.93, 0.6, 1.05) ** 2.2
    land = land + (ice - land) * snow
    w = water[..., None]
    out = land * (1 - w) + ocean * w
    return np.concatenate([np.clip(out, 0, 1) * 255, w * 255], -1).astype(np.uint8)

def _graded(src, path, fit=None):
    if os.path.exists(path): return np.load(path, mmap_mode=None)
    a = np.asarray(src.convert('RGB'))
    out = np.empty(a.shape[:2] + (4,), np.uint8)
    for y in range(0, a.shape[0], 400):
        c = a[y:y + 400].astype(np.float32) / 255
        if fit is not None: c = np.clip(c * fit[0] + fit[1], 0, 1)
        out[y:y + 400] = _grade(c)
    np.save(path, out); return out

def _mips(a, n):
    lv = [a]
    for _ in range(n):                                          # 2x2 среднее (PIL премультиплицирует RGBA — нельзя)
        a = lv[-1]; h2, w2 = a.shape[0] // 2 * 2, a.shape[1] // 2 * 2
        a = a[:h2, :w2].astype(np.uint16)
        lv.append(((a[0::2, 0::2] + a[1::2, 0::2] + a[0::2, 1::2] + a[1::2, 1::2] + 2) // 4).astype(np.uint8))
    return lv

def textures():
    os.makedirs(GDIR, exist_ok=True)
    jpg = os.path.join(GDIR, 'NE1_50M_SR_W.jpg')
    if not os.path.exists(jpg):                                 # Natural Earth I, весь мир (public domain)
        print('downloading', NE_URL, flush=True)
        z = zipfile.ZipFile(io.BytesIO(subprocess.check_output(['curl', '-sS', NE_URL])))
        n = [x for x in z.namelist() if x.endswith('.tif')][0]
        Image.open(io.BytesIO(z.read(n))).convert('RGB').save(jpg, quality=95)
    glob_src = Image.open(jpg).convert('RGB')
    G = _graded(glob_src, os.path.join(GDIR, 'tex50m_v2.npy'))
    hp = os.path.join(GDIR, 'texhr_v2.npy')
    if os.path.exists(hp): Hh = np.load(hp)
    else:
        # цветовая подгонка HR-вырезки к глобальной текстуре (линейно по каналам на перекрытии)
        hr = Image.open(os.path.join(DATA, 'eur_hr.png')).convert('RGB')
        lon0, lon1, lat0, lat1 = geo.RAST_BOX
        gw, gh = glob_src.size
        box = (round((lon0 + 180) / 360 * gw), round((90 - lat1) / 180 * gh), round((lon1 + 180) / 360 * gw), round((90 - lat0) / 180 * gh))
        gcrop = np.asarray(glob_src.crop(box), np.float32) / 255
        hsm = np.asarray(hr.resize(gcrop.shape[1::-1], Image.BOX), np.float32) / 255
        rng = np.random.default_rng(1); iy = rng.integers(0, gcrop.shape[0], 200000); ix = rng.integers(0, gcrop.shape[1], 200000)
        k = np.zeros(3, np.float32); c = np.zeros(3, np.float32)
        for ch in range(3):
            x = hsm[iy, ix, ch]; y = gcrop[iy, ix, ch]
            k[ch], c[ch] = np.polyfit(x, y, 1)
        print('HR colour fit', k, c, flush=True)
        Hh = _graded(hr, hp, (k, c))
    return _mips(G, 5), _mips(Hh, 3)

def clouds_tex(w=2048, h=1024):
    p = os.path.join(GDIR, 'clouds_v2.npy')
    if os.path.exists(p): return np.load(p)
    lat = np.radians(90 - (np.arange(h) + 0.5) / h * 180)[:, None]
    lon = np.radians((np.arange(w) + 0.5) / w * 360 - 180)[None]
    P = np.stack([np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat) + 0 * lon], -1).astype(np.float32)
    rng = np.random.default_rng(7); n = np.zeros((h, w), np.float32)
    for o in range(6):
        f = 2.2 * 2 ** o; a = 0.55 ** o
        for _ in range(14):
            v = rng.normal(size=3); v /= np.linalg.norm(v)
            n += a * np.sin(f * (P @ v.astype(np.float32)) * (1 + 0.4 * rng.random()) + rng.random() * 6.283)
    n = (n - n.mean()) / n.std()
    # больше облаков в умеренных широтах, меньше в субтропиках
    la = (90 - (np.arange(h) + 0.5) / h * 180)[:, None]; al = np.abs(la)
    band = (0.45 * np.exp(-((la - 5) / 9) ** 2) + 0.5 * np.exp(-((al - 55) / 13) ** 2)
            - 0.6 * np.exp(-((al - 22) / 9) ** 2) - 0.3 * np.exp(-((al - 85) / 8) ** 2))
    c = np.clip((n + band - 0.55) / 1.1, 0, 1) ** 1.4
    out = (c * 255).astype(np.uint8); np.save(p, out); return out

def sample(tex, lat, lon, box=None):
    """Билинейная выборка из равнопромежуточной текстуры (по долготе — с переходом через 180°, без шва)."""
    th, tw = tex.shape[:2]
    if box is None:
        fx = (lon + 180) / 360 * tw - 0.5; fy = (90 - lat) / 180 * th - 0.5
    else:
        lon0, lon1, lat0, lat1 = box
        fx = (lon - lon0) / (lon1 - lon0) * tw - 0.5; fy = (lat1 - lat) / (lat1 - lat0) * th - 0.5
    fy = np.clip(fy, 0, th - 1.001)
    x0 = np.floor(fx).astype(np.int32); y0 = fy.astype(np.int32)
    dx = (fx - x0)[:, None]; dy = (fy - y0)[:, None]
    if box is None: x0 %= tw; x1 = (x0 + 1) % tw
    else: x0 = np.clip(x0, 0, tw - 2); x1 = x0 + 1
    y1 = y0 + 1
    t = tex.astype(np.float32) if tex.dtype != np.uint8 else tex
    a = t[y0, x0].astype(np.float32); b = t[y0, x1].astype(np.float32)
    c = t[y1, x0].astype(np.float32); d = t[y1, x1].astype(np.float32)
    return (a * (1 - dx) + b * dx) * (1 - dy) + (c * (1 - dx) + d * dx) * dy

def sample_lod(levels, lod, lat, lon, box=None):
    lod = float(np.clip(lod, 0, len(levels) - 1)); l0 = int(lod); f = lod - l0
    s = sample(levels[l0], lat, lon, box)
    if f > 0.02 and l0 + 1 < len(levels): s = s * (1 - f) + sample(levels[l0 + 1], lat, lon, box) * f
    return s

# ---------------------------------------------------------------- камера и тайминг
def _pchip(xs, ys, x):
    xs, ys = np.asarray(xs, float), np.asarray(ys, float)
    hk = np.diff(xs); dk = np.diff(ys) / hk
    m = np.zeros_like(ys)
    for i in range(1, len(xs) - 1):
        if dk[i - 1] * dk[i] > 0:
            w1, w2 = 2 * hk[i] + hk[i - 1], hk[i] + 2 * hk[i - 1]
            m[i] = (w1 + w2) / (w1 / dk[i - 1] + w2 / dk[i])
    i = int(np.clip(np.searchsorted(xs, x) - 1, 0, len(xs) - 2))
    t = (x - xs[i]) / hk[i]
    h00, h10, h01, h11 = 2 * t**3 - 3 * t**2 + 1, t**3 - 2 * t**2 + t, -2 * t**3 + 3 * t**2, t**3 - t**2
    return h00 * ys[i] + h10 * hk[i] * m[i] + h01 * ys[i + 1] + h11 * hk[i] * m[i + 1]

def zoom_p(t):
    """Доля пути по log(высоты): медленно в начале, разгон, к 2.3 с — Северная Атлантика, плавно дальше, мягкий финал."""
    u = np.clip(t / TOTAL, 0, 1)
    return float(_pchip([0, 0.10, 0.39, 0.746, 1.0], [0, 0.035, 0.56, 0.72, 1.0], u))

def turn_q(t):
    """Поворот: Земля медленно вращается, затем Исландия выходит в центр к ~2.6 с."""
    u = np.clip(t / (2.75 * K), 0, 1)
    return float(_pchip([0, 0.25, 0.75, 1.0], [0, 0.07, 0.86, 1.0], u))

def slerp(a, b, k):
    om = math.acos(np.clip(a @ b, -1, 1))
    if om < 1e-6: return a
    return (math.sin((1 - k) * om) * a + math.sin(k * om) * b) / math.sin(om)

class Cam:
    def __init__(self, t):
        self.t = t
        p = zoom_p(t)
        self.h = math.exp(math.log(H0) + (math.log(H1) - math.log(H0)) * p)
        self.d = 1 + self.h / R_KM
        q = turn_q(t)
        self.n = slerp(vec(*START), vec(*ISL), q)
        n = self.n
        lon = math.atan2(n[1], n[0])
        e = np.array([-math.sin(lon), math.cos(lon), 0.0])
        u = np.cross(n, e)
        self.e, self.u, self.f = e, u, -n
        self.C = n * self.d
        self.kmpx = self.h * 2 * TANH / W

    def project(self, lat, lon):
        """Гео -> экран (x, y, видна ли точка)."""
        lat = np.asarray(lat, float); lon = np.asarray(lon, float)
        p, l = np.radians(lat), np.radians(lon)
        P = np.stack([np.cos(p) * np.cos(l), np.cos(p) * np.sin(l), np.sin(p)], -1)
        V = P - self.C
        z = V @ self.f; x = V @ self.e; y = V @ self.u
        sx = x / z / TANH * (W / 2) + W / 2; sy = -y / z / TANH * (W / 2) + H / 2
        vis = (P @ self.C) > 1.0 + 1e-6
        return sx, sy, vis

# ---------------------------------------------------------------- рендер Земли
JJ, II = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
SX = ((JJ + 0.5 - W / 2) / (W / 2) * TANH).ravel()
SY = (-(II + 0.5 - H / 2) / (W / 2) * TANH).ravel()
PIXANG = 2 * TANH / W
S_DIR = vec(*SUN).astype(np.float32)
ATM = np.array([0.36, 0.62, 1.0], np.float32)

def stars():
    rng = np.random.default_rng(11)
    a = np.zeros((H, W), np.float32)
    n = 1400
    xs = rng.integers(0, W, n); ys = rng.integers(0, H, n); br = rng.random(n) ** 3.5
    a[ys, xs] = 0.15 + 0.85 * br
    im = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    s = np.asarray(im, np.float32) / 255 * 2.2
    big = Image.new('L', (W, H), 0); d = ImageDraw.Draw(big)
    for i in range(30):
        x, y, r = rng.integers(0, W), rng.integers(0, H), 1.1 + rng.random() * 0.9
        d.ellipse((x - r, y - r, x + r, y + r), fill=int(150 + rng.random() * 100))
    s = s + np.asarray(big.filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
    tint = np.array([0.85, 0.9, 1.0], np.float32)
    return np.clip(s, 0, 1)[..., None] * tint * 0.55

TEXG = TEXH = CLOUD = STARS = None
def init():
    global TEXG, TEXH, CLOUD, STARS
    t0 = time.time()
    TEXG, TEXH = textures(); CLOUD = clouds_tex(); STARS = stars()
    print(f'textures ready {time.time() - t0:.1f}s', flush=True)

def earth(cam):
    C = cam.C.astype(np.float32); e, u, f = cam.e, cam.u, cam.f
    Dx = f[0] + SX * e[0] + SY * u[0]; Dy = f[1] + SX * e[1] + SY * u[1]; Dz = f[2] + SX * e[2] + SY * u[2]
    a = Dx * Dx + Dy * Dy + Dz * Dz
    b = C[0] * Dx + C[1] * Dy + C[2] * Dz
    c = cam.d ** 2 - 1
    dist = np.sqrt(np.maximum(cam.d ** 2 - b * b / a, 0))      # ближайшее расстояние луча до центра (в радиусах)
    pr = math.sqrt(c) * PIXANG                                 # размер пикселя у края диска
    cov = np.clip((1 - dist) / pr + 0.5, 0, 1)
    out = np.zeros((W * H, 3), np.float32)
    inv = 1 / np.sqrt(a)
    # фон: звёзды (гаснут, когда Земля заполняет кадр)
    sky = STARS.reshape(-1, 3) * (1 - cov[:, None])
    # атмосфера снаружи диска
    x = np.maximum(dist - 1, 0)
    tc = -b / a
    cx_, cy_, cz_ = C[0] + tc * Dx, C[1] + tc * Dy, C[2] + tc * Dz
    nl = np.maximum(np.sqrt(cx_ * cx_ + cy_ * cy_ + cz_ * cz_), 1e-6)
    sl = (cx_ * S_DIR[0] + cy_ * S_DIR[1] + cz_ * S_DIR[2]) / nl
    sf = np.clip(sl * 0.8 + 0.3, 0.03, 1.0) ** 1.3
    glow = (np.exp(-x / 0.010) * 0.85 + np.exp(-x / 0.045) * 0.22) * sf
    out += sky + glow[:, None] * ATM * (1 - cov[:, None] * 0.6)
    m = cov > 0
    if m.any():
        Dxm, Dym, Dzm, am, bm = Dx[m], Dy[m], Dz[m], a[m], b[m]
        disc = np.maximum(bm * bm - am * c, 0)
        t = (-bm - np.sqrt(disc)) / am
        Px, Py, Pz = C[0] + t * Dxm, C[1] + t * Dym, C[2] + t * Dzm
        nn = np.sqrt(Px * Px + Py * Py + Pz * Pz); Px /= nn; Py /= nn; Pz /= nn
        lat = np.degrees(np.arcsin(np.clip(Pz, -1, 1))); lon = np.degrees(np.arctan2(Py, Px))
        # уровень детализации (texel ≈ пиксель)
        lodg = math.log2(max(cam.kmpx, 1e-3) / (20037.5 / 5400)) + 0.15
        col = sample_lod(TEXG, lodg, lat, lon)
        if cam.kmpx < 9.0:                                      # вблизи — HR-вырезка (Европа + Гренландия + Исландия)
            lon0, lon1, lat0, lat1 = geo.RAST_BOX
            wb = (np.clip((lon - lon0) / 3, 0, 1) * np.clip((lon1 - lon) / 3, 0, 1) *
                  np.clip((lat - lat0) / 2, 0, 1) * np.clip((lat1 - lat) / 2, 0, 1)) * float(np.clip((9.0 - cam.kmpx) / 4, 0, 1))
            hm = wb > 0
            if hm.any():
                lodh = math.log2(max(cam.kmpx, 1e-3) / (20037.5 / 10800)) + 0.15
                hs = sample_lod(TEXH, lodh, lat[hm], lon[hm], geo.RAST_BOX)
                w_ = wb[hm][:, None]
                col[hm] = col[hm] * (1 - w_) + hs * w_
        rgb = col[:, :3] / 255; water = col[:, 3:4] / 255
        # облака (очень мягкие), гаснут при приближении
        ca = 0.30 * (1 - look.ease(zoom_p(cam.t) / 0.62))
        cl = sample(CLOUD[..., None], lat, lon)[:, :1] / 255 * ca
        rgb = rgb * (1 - cl) + np.array([0.92, 0.94, 0.97], np.float32) * cl
        # освещение
        lam = Px * S_DIR[0] + Py * S_DIR[1] + Pz * S_DIR[2]
        day = np.clip((lam + 0.07) / 0.22, 0, 1); day = day * day * (3 - 2 * day)
        shade = (0.30 + 0.70 * np.clip(lam, 0, 1) ** 0.45)[:, None]
        lit = rgb * shade * day[:, None] + rgb * 0.02 * (1 - day[:, None]) + np.array([0.004, 0.008, 0.02], np.float32)
        # красноватая полоса на терминаторе
        tw = np.exp(-((lam - 0.01) / 0.05) ** 2)[:, None] * np.array([0.10, 0.035, 0.0], np.float32) * 0.35
        lit = lit + tw * rgb.mean(1, keepdims=True) * 2
        # солнечный блик на воде
        iv = inv[m]
        Vx, Vy, Vz = -Dxm * iv, -Dym * iv, -Dzm * iv
        Hx, Hy, Hz = Vx + S_DIR[0], Vy + S_DIR[1], Vz + S_DIR[2]
        hn = np.sqrt(Hx * Hx + Hy * Hy + Hz * Hz)
        spec = np.clip((Px * Hx + Py * Hy + Pz * Hz) / hn, 0, 1) ** 400 * 0.16 * day
        lit = lit + spec[:, None] * water * (1 - cl) * np.array([1.0, 0.95, 0.85], np.float32)
        # дымка атмосферы к краю диска
        mu = np.clip(Px * Vx + Py * Vy + Pz * Vz, 0, 1)
        haze = ((1 - mu) ** 3.2 * (0.12 + 0.75 * np.clip(lam + 0.25, 0, 1)))[:, None]
        lit = lit * (1 - haze * 0.45) + ATM * haze * 0.6
        # лёгкая «воздушная» дымка всего диска (из космоса)
        lit = lit + ATM * 0.008 * (1 - zoom_p(cam.t))
        cv = cov[m][:, None]
        out[m] = out[m] * (1 - cv) + lit * cv + glow[m][:, None] * ATM * 0.25 * cv * (1 - cv)
    return out.reshape(H, W, 3)

def flare(arr, cam):
    """Мягкий блик солнца у края диска (только в «космической» части)."""
    k = 1 - np.clip(zoom_p(cam.t) / 0.35, 0, 1)
    if k <= 0: return arr
    # точка края диска в сторону солнца (на экране)
    s = S_DIR.astype(float)
    sx, sy = s @ cam.e, s @ cam.u
    ang = math.atan2(sy, sx)
    rd = math.asin(1 / cam.d)                                  # угловой радиус Земли
    rpx = math.tan(rd) / TANH * (W / 2)
    px, py = W / 2 + math.cos(ang) * rpx * 1.005, H / 2 - math.sin(ang) * rpx * 1.005
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r2 = (xx - px) ** 2 + (yy - py) ** 2
    g = np.exp(-r2 / (2 * 22 ** 2)) * 1.0 + np.exp(-r2 / (2 * 120 ** 2)) * 0.18
    # горизонтальный «анаморфный» штрих
    g += np.exp(-((yy - py) ** 2) / (2 * 1.6 ** 2)) * np.exp(-np.abs(xx - px) / 170) * 0.22
    col = np.array([1.0, 0.93, 0.82], np.float32)
    arr = arr + g[..., None] * col * k
    # призраки по линии к центру кадра
    for f_, r_, a_ in ((0.55, 38, 0.05), (1.25, 22, 0.06), (1.7, 70, 0.035)):
        gx, gy = px + (W / 2 - px) * f_, py + (H / 2 - py) * f_
        rr = np.sqrt((xx - gx) ** 2 + (yy - gy) ** 2)
        arr = arr + (np.clip((r_ - rr) / 3, 0, 1) * a_ * k)[..., None] * np.array([0.6, 0.8, 1.0], np.float32)
    return arr

def finish(arr):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    v = 1 - 0.28 * np.clip((((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2) - 0.25, 0, 1)
    arr = arr * v[..., None]
    hi = arr > 0.78                                             # мягкое «плёночное» плечо только в светах
    arr = np.where(hi, 0.78 + 0.22 * (1 - np.exp(-(arr - 0.78) / 0.22)), arr)
    return np.clip(arr, 0, 1)

# ---------------------------------------------------------------- графика поверх
SS = 2
ISL_RINGS = None
def _rings():
    global ISL_RINGS
    if ISL_RINGS is None: ISL_RINGS = [np.asarray(r, float) for r in geo.country('ISL')]
    return ISL_RINGS

def fade(t, t0, d=0.6): return look.ease((t - t0) / d)

def overlay(img, cam):
    t = cam.t
    lay = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    # контур Исландии
    a_out = fade(t, T1 + 0.9 * K, 0.9 * K)
    if a_out > 0:
        polys = []
        for r in _rings():
            sx, sy, vis = cam.project(r[:, 1], r[:, 0])
            if vis.all(): polys.append([(x * SS, y * SS) for x, y in zip(sx, sy)])
        fill = Image.new('L', lay.size, 0); fd = ImageDraw.Draw(fill)
        for p in polys:
            if len(p) > 2: fd.polygon(p, fill=int(255 * 0.10 * a_out))
        gl = Image.new('L', lay.size, 0); gd = ImageDraw.Draw(gl)
        for p in polys:
            if len(p) > 2: gd.line(p + [p[0]], fill=255, width=7 * SS, joint='curve')
        gl = gl.filter(ImageFilter.GaussianBlur(9 * SS)).point(lambda v: int(v * 0.45 * a_out))
        lay.alpha_composite(Image.merge('RGBA', [Image.new('L', lay.size, 150), Image.new('L', lay.size, 205), Image.new('L', lay.size, 255), gl]))
        lay.alpha_composite(Image.merge('RGBA', [Image.new('L', lay.size, 255)] * 3 + [fill]))
        for p in polys:
            if len(p) > 2: d.line(p + [p[0]], fill=(255, 255, 255, int(235 * a_out)), width=int(2.0 * SS), joint='curve')
    # полярный круг: пунктир дорисовывается слева направо
    k_ac = look.ease((t - T2) / (0.85 * K))
    if k_ac > 0:
        lons = np.arange(-75, 45, 0.04)
        sx, sy, vis = cam.project(np.full_like(lons, 66.5634), lons)
        ok = vis & (sx > -50) & (sx < W + 50) & (sy > -50) & (sy < H + 50)
        if ok.any():
            # пунктир в экранных пикселях, привязан к меридиану Исландии (не «бегает» при зуме)
            seg = np.hypot(np.diff(sx), np.diff(sy)); s = np.concatenate([[0], np.cumsum(seg)])
            s -= np.interp(ISL[1], lons, s)
            xrev = -40 + (W + 80) * k_ac
            on = (np.mod(s, 22.0) < 12.0) & ok & (sx < xrev)
            idx = np.where(on)[0]
            if len(idx):
                br = np.where(np.diff(idx) > 1)[0]
                for g_ in np.split(idx, br + 1):
                    if len(g_) > 1:
                        d.line([(sx[i] * SS, sy[i] * SS) for i in g_], fill=look.ACCENT + (235,), width=int(2.2 * SS))
    img.alpha_composite(lay.resize((W, H), Image.LANCZOS))
    # подписи
    def lab(lat, lon, s, size, alpha, weight=300, track=8, dy=0, fill=look.WHITE, edge_fade=True, halo=True):
        if alpha <= 0.01: return
        x, y, v = cam.project(lat, lon)
        x, y = float(x), float(y) + dy
        if not v: return
        if edge_fade:
            m = min(x, W - x, y, H - y)
            alpha *= float(np.clip((m - 40) / 160, 0, 1))
        if alpha > 0.01:
            if halo:                                            # мягкая тёмная подложка — читается и на льду
                hw_ = len(s) * (size * 0.62 + track) / 2 + size; hh_ = size * 1.1
                hl = Image.new('L', img.size, 0)
                ImageDraw.Draw(hl).ellipse((x - hw_, y - hh_, x + hw_, y + hh_), fill=int(255 * 0.42 * alpha))
                hl = hl.filter(ImageFilter.GaussianBlur(size * 0.9))
                img.alpha_composite(Image.merge('RGBA', [Image.new('L', img.size, c) for c in (4, 14, 30)] + [hl]))
            look.text(img, (x, y), s, size, weight, fill, 'mm', alpha=alpha, track=track, shadow=0.7)
    a_gn = fade(t, T1 + 0.1 * K, 0.7 * K)
    lab(71.0, -41.0, 'ГРЕНЛАНДИЯ', 27, 0.75 * a_gn, track=9)
    lab(63.2, 10.0, 'НОРВЕГИЯ', 27, 0.75 * fade(t, T1 + 0.35 * K, 0.7 * K), track=9)
    lab(63.05, -18.75, 'ИСЛАНДИЯ', 46, fade(t, T2 - 0.7 * K, 0.8 * K), weight=350, track=16, edge_fade=False, halo=False)
    a_pk = fade(t, T2 + 0.55 * K, 0.6 * K)
    if a_pk > 0:
        x, y, v = cam.project(66.5634, -9.5)
        if v: look.text(img, (float(x), float(y) - 30), 'ПОЛЯРНЫЙ КРУГ', 19, 400, (255, 214, 200), 'mm', alpha=0.9 * a_pk, track=7, shadow=0.8)

def frame(t):
    cam = Cam(t)
    arr = earth(cam)
    arr = flare(arr, cam)
    arr = finish(arr)
    img = Image.fromarray((arr * 255 + 0.5).astype(np.uint8)).convert('RGBA')
    overlay(img, cam)
    return img.convert('RGB')

def _render(i): return frame(i / FPS).tobytes()

def main():
    init()
    out = os.path.join(ROOT, 'cache', 'anim_globe.mp4')
    if len(sys.argv) > 3:
        os.makedirs(sys.argv[3], exist_ok=True)
        for tt in sys.argv[2].split(','):
            t0 = time.time(); frame(float(tt)).save(os.path.join(sys.argv[3], f'anim_globe_t{tt}.png'))
            print(tt, f'{time.time() - t0:.1f}s', flush=True)
        return
    N = int(round(TOTAL * FPS)); t0 = time.time()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-frames:v', str(N), '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-an',
                          '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    import multiprocessing as mp
    with mp.get_context('fork').Pool(min(4, os.cpu_count() or 1)) as pool:
        for i, buf in enumerate(pool.imap(_render, range(N), chunksize=1)):
            p.stdin.write(buf)
            if i % 30 == 0: print(f'anim_globe {i}/{N}  {time.time() - t0:.0f}s', flush=True)
    p.stdin.close(); p.wait()
    print('->', out, N, 'frames', TOTAL, 's', f'{time.time() - t0:.0f}s', flush=True)

if __name__ == '__main__':
    main()
