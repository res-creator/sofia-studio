# Карты «как Google Earth» из открытых данных Natural Earth (public domain — можно монетизировать).
# Проекция: азимутальная равнопромежуточная (расстояния от центра проекции честные — нужно для «развернуть страну до Рима»).
# Данные: ru_geo/data (скачать: sh ru_geo/fetch_data.sh).
import math, os
import numpy as np
import shapefile
from PIL import Image, ImageDraw, ImageFilter, ImageFont

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
R = 6371.0
Image.MAX_IMAGE_PIXELS = None

# ---------- проекция ----------
class Proj:
    def __init__(self, lat0, lon0):
        self.p0, self.l0 = math.radians(lat0), math.radians(lon0)
    def fwd(self, lat, lon):
        p, l = np.radians(lat), np.radians(lon)
        dl = l - self.l0
        cc = np.clip(np.sin(self.p0) * np.sin(p) + np.cos(self.p0) * np.cos(p) * np.cos(dl), -1, 1)
        c = np.arccos(cc)
        k = np.where(c < 1e-9, 1.0, c / np.maximum(np.sin(c), 1e-12))
        x = R * k * np.cos(p) * np.sin(dl)
        y = R * k * (np.cos(self.p0) * np.sin(p) - np.sin(self.p0) * np.cos(p) * np.cos(dl))
        return x, y
    def inv(self, x, y):
        rho = np.hypot(x, y); c = rho / R
        rs = np.where(rho < 1e-9, 1e-9, rho)
        lat = np.arcsin(np.clip(np.cos(c) * np.sin(self.p0) + y * np.sin(c) * np.cos(self.p0) / rs, -1, 1))
        lon = self.l0 + np.arctan2(x * np.sin(c), rho * np.cos(self.p0) * np.cos(c) - y * np.sin(self.p0) * np.sin(c))
        return np.degrees(lat), (np.degrees(lon) + 540) % 360 - 180

# ---------- данные ----------
_RAST = None
RAST_BOX = (-30, 70, 30, 80)   # lon0, lon1, lat0, lat1 вырезки eur_hr.png (1/60° на пиксель)
def raster():
    global _RAST
    if _RAST is None: _RAST = np.asarray(Image.open(os.path.join(DATA, 'eur_hr.png')).convert('RGB')).astype(np.float32)
    return _RAST

def _shapes(name, field=None):
    sf = shapefile.Reader(os.path.join(DATA, name, name + '.shp'), encoding='utf-8')
    out = []
    for sr in sf.iterShapeRecords():
        pts, parts = sr.shape.points, list(sr.shape.parts) + [len(sr.shape.points)]
        rings = [pts[parts[i]:parts[i + 1]] for i in range(len(parts) - 1)]
        out.append((sr.record[field] if field else None, rings))
    return out
_CACHE = {}
def land():
    if 'land' not in _CACHE: _CACHE['land'] = [r for _, rs in _shapes('ne_10m_land') for r in rs]
    return _CACHE['land']
def countries():
    if 'cty' not in _CACHE: _CACHE['cty'] = _shapes('ne_10m_admin_0_countries', 'ADM0_A3')
    return _CACHE['cty']
def country(a3):
    return [r for k, rs in countries() if k == a3 for r in rs]

# ---------- вид: центр проекции + окно на экране ----------
class View:
    """proj_center — центр проекции; view_center — что в центре кадра; width_km — ширина кадра."""
    def __init__(self, proj_center, view_center, width_km, W, H):
        self.P = Proj(*proj_center); self.W, self.H = W, H
        self.cx, self.cy = self.P.fwd(*view_center)
        self.kpp = width_km / W
    def px(self, lat, lon):
        x, y = self.P.fwd(np.asarray(lat, float), np.asarray(lon, float))
        return self.W / 2 + (x - self.cx) / self.kpp, self.H / 2 - (y - self.cy) / self.kpp
    def ring_px(self, ring):
        a = np.asarray(ring, float)
        X, Y = self.px(a[:, 1], a[:, 0])
        return list(zip(X.tolist(), Y.tolist()))
    def km_to_px(self, x, y):
        return self.W / 2 + (x - self.cx) / self.kpp, self.H / 2 - (y - self.cy) / self.kpp

def _visible(pts, W, H, pad=200):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return not (max(xs) < -pad or min(xs) > W + pad or max(ys) < -pad or min(ys) > H + pad)

def base_map(v, highlight=None):
    """Спутниковый вид: рельеф Natural Earth на суше, тёмно-синий океан, жёлтые границы."""
    W, H = v.W, v.H
    jj, ii = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    x = (jj - W / 2) * v.kpp + v.cx; y = -(ii - H / 2) * v.kpp + v.cy
    lat, lon = v.P.inv(x, y)
    A = raster(); lon0, lon1, lat0, lat1 = RAST_BOX
    fx = (lon - lon0) / (lon1 - lon0) * (A.shape[1] - 1); fy = (lat1 - lat) / (lat1 - lat0) * (A.shape[0] - 1)
    fx = np.clip(fx, 0, A.shape[1] - 1.001); fy = np.clip(fy, 0, A.shape[0] - 1.001)
    x0 = fx.astype(np.int32); y0 = fy.astype(np.int32); dx = (fx - x0)[..., None]; dy = (fy - y0)[..., None]
    rgb = (A[y0, x0] * (1 - dx) * (1 - dy) + A[y0, x0 + 1] * dx * (1 - dy) + A[y0 + 1, x0] * (1 - dx) * dy + A[y0 + 1, x0 + 1] * dx * dy)
    # «спутниковая» цветокоррекция суши: темнее, насыщеннее, зеленее
    g = rgb / 255.0
    lum = g.mean(axis=2, keepdims=True)
    g = lum + (g - lum) * 0.85
    g = np.clip((g - 0.10) * 1.12, 0, 1) ** 1.7 * 0.95
    g[..., 0] *= 0.80; g[..., 1] *= 0.90; g[..., 2] *= 0.66
    # маска суши
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for ring in land():
        pts = v.ring_px(ring)
        if len(pts) > 2 and _visible(pts, W, H): d.polygon(pts, fill=255)
    m = np.asarray(m.filter(ImageFilter.GaussianBlur(1.2)), np.float32)[..., None] / 255
    # океан: глубокий синий с мягким градиентом у берега
    far = np.asarray(Image.fromarray((m[..., 0] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(W / 60)), np.float32)[..., None] / 255
    deep = np.array([0.035, 0.11, 0.30]); shelf = np.array([0.07, 0.24, 0.46])
    ocean = deep + (shelf - deep) * np.clip(far * 2.2, 0, 1)
    rng = np.random.default_rng(3)
    ocean = ocean + rng.normal(0, 0.006, (H, W, 1))
    out = g * m + ocean * (1 - m)
    img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    # границы стран (тонкие, полупрозрачные жёлтые, как в Google Earth)
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    lw = max(1, round(W / 1100))
    for k, rings in countries():
        for ring in rings:
            pts = v.ring_px(ring)
            if len(pts) > 2 and _visible(pts, W, H): od.line(pts + [pts[0]], fill=(255, 226, 120, 110), width=lw)
    img = Image.alpha_composite(img.convert('RGBA'), ov)
    if highlight: img = highlight_country(img, v, highlight)
    return img.convert('RGB')

def highlight_country(img, v, a3, fill=(255, 255, 255, 38), line=(255, 255, 255, 200), glow=(120, 200, 255)):
    W, H = img.size
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for ring in country(a3):
        pts = v.ring_px(ring)
        if len(pts) > 2: d.polygon(pts, fill=255)
    edge = m.filter(ImageFilter.FIND_EDGES)
    gl = edge.filter(ImageFilter.GaussianBlur(W / 300))
    out = img.convert('RGBA')
    out = Image.alpha_composite(out, Image.merge('RGBA', [Image.new('L', (W, H), c) for c in fill[:3]] + [m.point(lambda a: a * fill[3] // 255)]))
    out = Image.alpha_composite(out, Image.merge('RGBA', [Image.new('L', (W, H), c) for c in glow] + [gl.point(lambda a: min(150, a * 2))]))
    out = Image.alpha_composite(out, Image.merge('RGBA', [Image.new('L', (W, H), c) for c in line[:3]] + [edge.point(lambda a: a * line[3] // 255)]))
    return out

# ---------- шрифты и надписи ----------
def font(size, weight=800, name='Montserrat.ttf'):
    f = ImageFont.truetype(os.path.join(DATA, name), size)
    try: f.set_variation_by_axes([weight])
    except Exception: pass
    return f

def text_outlined(img, xy, s, size, fill=(255, 255, 255), stroke=(0, 0, 0), sw=None, anchor='mm', weight=800, shadow=True, name='Montserrat.ttf'):
    d = ImageDraw.Draw(img); f = font(size, weight, name); sw = sw if sw is not None else max(2, size // 12)
    if shadow:
        sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((xy[0] + size * 0.05, xy[1] + size * 0.07), s, font=f, fill=(0, 0, 0, 170), anchor=anchor, stroke_width=sw, stroke_fill=(0, 0, 0, 170))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(size / 14)))
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=stroke)

def label(img, xy, s, size=34, dot=True, color=(255, 255, 255)):
    """Подпись города/места как в Google Earth: точка + белый текст с тенью."""
    d = ImageDraw.Draw(img); x, y = xy
    if dot:
        r = size * 0.28; d.ellipse((x - r, y - r, x + r, y + r), fill=color + (255,), outline=(0, 0, 0, 255), width=2)
    text_outlined(img, (x + size * 0.6, y), s, size, fill=color, anchor='lm', weight=700, sw=max(2, size // 14))

def polyline_partial(pts, frac):
    """Первые frac (0..1) длины ломаной — для «рисующейся» линии."""
    if frac >= 1: return pts
    L = [0.0]
    for a, b in zip(pts, pts[1:]): L.append(L[-1] + math.dist(a, b))
    tgt = L[-1] * max(0, frac); out = [pts[0]]
    for i in range(1, len(pts)):
        if L[i] <= tgt: out.append(pts[i])
        else:
            a, b = pts[i - 1], pts[i]; t = (tgt - L[i - 1]) / max(1e-9, L[i] - L[i - 1])
            out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)); break
    return out

def glow_line(img, pts, color=(255, 40, 40), width=8, glow=True):
    if len(pts) < 2: return
    W, H = img.size
    if glow:
        g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(g).line(pts, fill=color + (200,), width=width * 3, joint='curve')
        img.alpha_composite(g.filter(ImageFilter.GaussianBlur(width * 1.5)))
    ImageDraw.Draw(img).line(pts, fill=color + (255,), width=width, joint='curve')

def ease(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
