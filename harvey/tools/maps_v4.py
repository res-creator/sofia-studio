# Harvey v4 — data maps (v3 base + readability pass, see overrides at the end) and the schematic reconstruction, rendered frame by frame to MP4.
# One geographic base for the whole film (Web Mercator): Natural Earth land, Census 2017 state/county boundaries,
# TIGER 2017 water and roads. Data layers: NHC HURDAT2 best track, NHC rainfall supplement (station totals),
# IEM/ASOS hourly precipitation, USGS-derived terrain tiles (terrarium) for the reservoir pools, NOAA NGS aerial imagery.
# Usage: python3 harvey/tools/maps_v3.py SHOT DURATION OUT.mp4 [W H]
import sys, os, math, json, csv, pickle, subprocess, datetime as dt
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
G = ROOT + '/data/gis'
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONTB = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
R = 6378137.0
def merc(lon, lat): return R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
def mercv(lon, lat): return R * np.radians(lon), R * np.log(np.tan(np.pi / 4 + np.radians(lat) / 2))

# colours
C_WATER = (14, 30, 42); C_LAND = (34, 38, 43); C_LINE = (95, 102, 110); C_TEXT = (236, 238, 240)
C_ACC = (255, 122, 69); C_BLUE = (90, 170, 255); C_BAYOU = (70, 140, 210); C_ROAD = (78, 84, 92)

# ---------------- data (cached) ----------------
CACHE = G + '/v3_cache.pkl'
def load():
    if os.path.exists(CACHE): return pickle.load(open(CACHE, 'rb'))
    import shapefile
    D = {}
    BB = (-101, 22, -86, 34)
    def parts(shape):
        pts = np.array(shape.points); idx = list(shape.parts) + [len(pts)]
        return [pts[idx[i]:idx[i + 1]] for i in range(len(idx) - 1)]
    def tomerc(a): x, y = mercv(a[:, 0], np.clip(a[:, 1], -85, 85)); return np.stack([x, y], 1)
    land = []
    for s in shapefile.Reader(G + '/ne_10m_land/ne_10m_land').shapes():
        for p in parts(s):
            if p[:, 0].max() < BB[0] or p[:, 0].min() > BB[2] or p[:, 1].max() < BB[1] or p[:, 1].min() > BB[3]: continue
            land.append(tomerc(p))
    D['land'] = land
    st = []
    r = shapefile.Reader(G + '/cb_2017_us_state_500k/cb_2017_us_state_500k')
    for rec, s in zip(r.records(), r.shapes()):
        if rec['STUSPS'] in ('TX', 'LA', 'OK', 'AR', 'NM', 'MS'):
            st.append((rec['STUSPS'], [tomerc(p) for p in parts(s)]))
    D['states'] = st
    co = {}
    r = shapefile.Reader(G + '/cb_2017_us_county_500k/cb_2017_us_county_500k')
    for rec, s in zip(r.records(), r.shapes()):
        if rec['STATEFP'] in ('48', '22'):
            co[rec['GEOID']] = (rec['NAME'], [tomerc(p) for p in parts(s)])
    D['counties'] = co
    aw = []
    for c in ('48201', '48167', '48157', '48039', '48245', '48361', '48339', '48291', '48071'):
        r = shapefile.Reader(f'{G}/tl_2017_{c}_areawater/tl_2017_{c}_areawater')
        for rec, s in zip(r.records(), r.shapes()):
            if rec['AWATER'] > 400000: aw.append([tomerc(p) for p in parts(s)])
    D['areawater'] = aw
    lw = {}
    WANT = ('Buffalo Byu', 'Brays Byu', 'Greens Byu', 'White Oak Byu', 'Sims Byu', 'Cypress Crk', 'Clear Crk', 'Dickinson Byu', 'Brazos Riv', 'San Jacinto Riv', 'Hunting Byu', 'Halls Byu', 'Langham Crk', 'Bear Crk', 'South Mayde Crk', 'Neches Riv', 'Sabine Riv', 'Taylor Byu')
    for c in ('48201', '48167', '48157', '48039', '48245', '48361', '48339', '48291', '48071'):
        r = shapefile.Reader(f'{G}/tl_2017_{c}_linearwater/tl_2017_{c}_linearwater')
        for rec, s in zip(r.records(), r.shapes()):
            n = rec['FULLNAME']
            if n in WANT: lw.setdefault(n, []).extend(tomerc(p) for p in parts(s))
    D['linear'] = lw
    rd = {}
    RW = ('I- 10', 'I- 45', 'I- 610', 'I- 69', 'US Hwy 59', 'Beltway 8', 'Sam Houston Tollway', 'Hardy Toll Rd', 'US Hwy 290', 'State Hwy 288', 'Grand Pkwy', 'Westpark Tollway', 'State Hwy 6')
    r = shapefile.Reader(G + '/tl_2017_48_prisecroads/tl_2017_48_prisecroads')
    for rec, s in zip(r.records(), r.shapes()):
        n = rec['FULLNAME']
        if n in RW:
            for p in parts(s):
                if -96.3 < p[:, 0].mean() < -94.5 and 29.2 < p[:, 1].mean() < 30.4: rd.setdefault(n, []).append(tomerc(p))
    D['roads'] = rd
    tr = []
    for ln in open(ROOT + '/data/hurdat2_harvey_AL092017.txt').read().splitlines()[1:]:
        f = [x.strip() for x in ln.split(',')]
        lat = float(f[4][:-1]) * (1 if f[4][-1] == 'N' else -1); lon = -float(f[5][:-1])
        tr.append(dict(t=dt.datetime.strptime(f[0] + f[1], '%Y%m%d%H%M'), rec=f[2], st=f[3], lat=lat, lon=lon, kt=int(f[6])))
    D['track'] = tr
    pickle.dump(D, open(CACHE, 'wb')); return D

D = None
def data():
    global D
    if D is None: D = load()
    return D

# ---------------- camera & drawing ----------------
class Cam:
    def __init__(s, lon, lat, span_km, W, H):
        s.cx, s.cy = merc(lon, lat); s.w = span_km * 1000 / math.cos(math.radians(lat)); s.W, s.H = W, H
    def px(s, xy):
        a = np.asarray(xy, float).reshape(-1, 2)
        return np.stack([(a[:, 0] - s.cx) / s.w * s.W + s.W / 2, s.H / 2 - (a[:, 1] - s.cy) / s.w * s.W], 1)
    def ll(s, lon, lat): return s.px([merc(lon, lat)])[0]
    def visible(s, a):
        p = s.px(a); return not (p[:, 0].max() < -50 or p[:, 0].min() > s.W + 50 or p[:, 1].max() < -50 or p[:, 1].min() > s.H + 50)

def lerp(a, b, t): return a + (b - a) * t
def ease(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
def seg(t, a, b): return ease((t - a) / (b - a)) if b > a else float(t >= a)
def cam_path(t, A, B, W, H):
    # A, B = (lon, lat, span_km); zoom interpolated in log space
    e = ease(t); lon = lerp(A[0], B[0], e); lat = lerp(A[1], B[1], e); sp = math.exp(lerp(math.log(A[2]), math.log(B[2]), e))
    return Cam(lon, lat, sp, W, H)

def font(sz, bold=False): return ImageFont.truetype(FONTB if bold else FONT, int(sz))
def text(d, xy, s, sz, fill=C_TEXT, bold=False, anchor='la', alpha=1.0, halo=True):
    if alpha <= 0.01: return
    f = font(sz, bold); col = tuple(fill[:3]) + (int(255 * alpha),)
    if halo: d.text(xy, s, font=f, fill=col, anchor=anchor, stroke_width=max(2, int(sz / 9)), stroke_fill=(10, 12, 14, int(200 * alpha)))
    else: d.text(xy, s, font=f, fill=col, anchor=anchor)

def poly(d, cam, parts, fill=None, outline=None, width=1):
    for p in parts:
        if len(p) < 3 or not cam.visible(p): continue
        q = cam.px(p); q = [tuple(x) for x in q]
        if fill: d.polygon(q, fill=fill)
        if outline: d.line(q + [q[0]], fill=outline, width=width, joint='curve')
def line(d, cam, parts, fill, width):
    for p in parts:
        if len(p) < 2 or not cam.visible(p): continue
        d.line([tuple(x) for x in cam.px(p)], fill=fill, width=width, joint='curve')

def base(cam, S, roads=True, bayous=True, counties=True, county_alpha=90):
    W, H = cam.W, cam.H
    im = Image.new('RGB', (W, H), C_WATER); d = ImageDraw.Draw(im, 'RGBA')
    poly(d, cam, data()['land'], fill=C_LAND + (255,))
    for parts in data()['areawater']: poly(d, cam, parts, fill=C_WATER + (255,))
    if counties:
        for gid, (n, parts) in data()['counties'].items(): poly(d, cam, parts, outline=C_LINE + (county_alpha,), width=max(1, int(S)))
    for stu, parts in data()['states']: poly(d, cam, parts, outline=(150, 156, 164, 200), width=max(1, int(1.6 * S)))
    if roads and cam.w < 250e3:
        for n, parts in data()['roads'].items(): line(d, cam, parts, C_ROAD + (200,), max(1, int(1.6 * S)))
    if bayous and cam.w < 300e3:
        for n, parts in data()['linear'].items(): line(d, cam, parts, C_BAYOU + (170,), max(1, int(1.4 * S)))
    return im, d

def dot(d, xy, r, fill, ring=None):
    x, y = xy; d.ellipse([x - r, y - r, x + r, y + r], fill=fill, outline=ring, width=max(1, int(r / 3)) if ring else 0)

def credit(d, cam, s, S):
    text(d, (cam.W - 18 * S, cam.H - 14 * S), s, 13 * S, fill=(170, 176, 184), anchor='rd', alpha=0.9)
def title(d, cam, s, S, alpha=1, sub=None):
    text(d, (40 * S, 40 * S), s, 30 * S, bold=True, alpha=alpha)
    if sub: text(d, (40 * S, 80 * S), sub, 18 * S, fill=(190, 196, 204), alpha=alpha)

# ---------------- data helpers ----------------
def track_until(t):
    pts = [p for p in data()['track'] if p['t'] <= t]
    return pts
def stations():
    rows = list(csv.DictReader(open(ROOT + '/data/nhc_daily_rain_tx_la.csv')))
    out = []
    for r in rows:
        try: lat = float(r['lat']); lon = float(r['lon'])
        except ValueError: continue
        days = [r[k] for k in list(r)[7:18]]
        full = all(x != '' for x in days[:7])
        tot = float(r['total_in']) if r['total_in'] not in ('', None) else None
        psh = r['source'].startswith('PSH')
        if tot and (full or psh): out.append(dict(name=r['name'], lat=lat, lon=lon, tot=tot, src=r['source']))
    return out
def asos():
    rows = list(csv.DictReader(open(ROOT + '/data/asos_p01i_raw.csv')))
    by = {}
    for r in rows:
        if r['p01i'] in ('M', ''): continue
        t = dt.datetime.strptime(r['valid'], '%Y-%m-%d %H:%M')
        by.setdefault(r['station'], dict(lat=float(r['lat']), lon=float(r['lon']), obs=[]))['obs'].append((t, float(r['p01i'])))
    return by

def rain_col(v):  # inches -> colour (sequential blue -> violet)
    stops = [(0, (40, 70, 110)), (10, (60, 130, 200)), (20, (90, 180, 230)), (30, (150, 120, 230)), (40, (200, 90, 200)), (50, (240, 80, 140)), (60, (255, 220, 230))]
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        if v <= b:
            k = (v - a) / (b - a); return tuple(int(lerp(ca[i], cb[i], k)) for i in range(3))
    return stops[-1][1]

def raster_overlay(im, cam, img, z, x0, y0, alpha=1.0):
    # img: RGBA image whose pixel (0,0) is the NW corner of web-mercator tile (x0, y0) at zoom z, 256 px per tile
    n = 2 ** z; ws = 2 * math.pi * R
    X0 = x0 / n * ws - ws / 2; Y0 = ws / 2 - y0 / n * ws; res = ws / n / 256
    X1 = X0 + img.width * res; Y1 = Y0 - img.height * res
    p0 = cam.px([(X0, Y0)])[0]; p1 = cam.px([(X1, Y1)])[0]
    sx0, sy0 = max(0, p0[0]), max(0, p0[1]); sx1, sy1 = min(cam.W, p1[0]), min(cam.H, p1[1])
    if sx1 <= sx0 or sy1 <= sy0: return
    u0 = (sx0 - p0[0]) / (p1[0] - p0[0]) * img.width; u1 = (sx1 - p0[0]) / (p1[0] - p0[0]) * img.width
    v0 = (sy0 - p0[1]) / (p1[1] - p0[1]) * img.height; v1 = (sy1 - p0[1]) / (p1[1] - p0[1]) * img.height
    crop = img.crop((int(u0), int(v0), max(int(u0) + 1, int(u1)), max(int(v0) + 1, int(v1)))).resize((max(1, int(sx1 - sx0)), max(1, int(sy1 - sy0))), Image.BILINEAR)
    if alpha < 1:
        a = crop.getchannel('A').point(lambda v: int(v * alpha)); crop.putalpha(a)
    im.paste(crop, (int(sx0), int(sy0)), crop)

_POOLS = None
def pools():
    global _POOLS
    if _POOLS is None:
        E = np.load(G + '/terrarium/dem_z14.npy') * 3.28084
        z, x0, y0, W, H = map(int, open(G + '/terrarium/dem_z14.txt').read().split())
        A = np.load(G + '/terrarium/pool_addicks.npy'); B = np.load(G + '/terrarium/pool_barker.npy')
        _POOLS = (E, A, B, z, x0, y0)
    return _POOLS
def pool_image(level_frac):
    # level_frac 0..1: from the basin bottom to the record level (Addicks 109.10 ft, Barker 101.56 ft, HCFCD, Aug 30)
    E, A, B, z, x0, y0 = pools()
    im = np.zeros(E.shape + (4,), np.uint8)
    for M, rec in ((A, 109.10), (B, 101.56)):
        lo = np.percentile(E[M], 2); lvl = lo + (rec - lo) * level_frac
        m = M & (E < lvl); im[m] = (90, 175, 255, 120)
    return Image.fromarray(im, 'RGBA'), z, x0, y0

_AER = None
def aerial():
    global _AER
    if _AER is None:
        d = G + '/noaa_eri/z15'; L = [l.split() for l in open(d + '/list.txt').read().split('\n') if l.strip()]
        xs = sorted({int(a) for a, b in L}); ys = sorted({int(b) for a, b in L})
        im = Image.new('RGBA', (len(xs) * 256, len(ys) * 256), (0, 0, 0, 0))
        for a, b in L:
            try:
                t = Image.open(f'{d}/{a}_{b}.jpg').convert('RGBA')
                arr = np.asarray(t).copy(); blank = (arr[..., :3].sum(-1) < 12); arr[blank, 3] = 0
                im.paste(Image.fromarray(arr), ((int(a) - xs[0]) * 256, (int(b) - ys[0]) * 256))
            except Exception: pass
        _AER = (im, 15, xs[0], ys[0])
    return _AER

# ---------------- shots ----------------
def label_at(d, cam, lon, lat, s, S, a=1, dx=10, dy=-10, sz=17, col=C_TEXT, bold=False, marker=True, mcol=C_ACC):
    p = cam.ll(lon, lat)
    if marker: dot(d, p, 5 * S, mcol + (int(255 * a),), ring=(10, 12, 14, int(255 * a)))
    text(d, (p[0] + dx * S, p[1] + dy * S), s, sz * S, fill=col, alpha=a, bold=bold, anchor='ls')

def draw_track(d, cam, t_end, S, col=(255, 255, 255), a=1.0, dots=True):
    pts = track_until(t_end)
    if len(pts) < 2: return
    xy = cam.px([merc(p['lon'], p['lat']) for p in pts])
    d.line([tuple(q) for q in xy], fill=col + (int(220 * a),), width=int(3 * S), joint='curve')
    if dots:
        for p, q in zip(pts, xy):
            if p['t'].hour == 0: dot(d, q, 3 * S, col + (int(255 * a),))

def F_where(t, W, H, S):
    # Gulf -> Texas coast -> Houston; the track is drawn up to landfall, then the stall
    t0 = dt.datetime(2017, 8, 23, 12); tl = dt.datetime(2017, 8, 26, 3); tend = dt.datetime(2017, 8, 29, 18)
    cam = cam_path(seg(t, 0.45, 0.95), (-94.0, 26.5, 1500), (-95.6, 29.4, 420), W, H)
    im, d = base(cam, S)
    tt = t0 + (tl - t0) * seg(t, 0.05, 0.45) if t < 0.5 else tl + (tend - tl) * seg(t, 0.5, 0.95)
    draw_track(d, cam, tt, S)
    pts = track_until(tt)
    if pts:
        q = cam.ll(pts[-1]['lon'], pts[-1]['lat']); dot(d, q, 8 * S, (255, 255, 255, 230), ring=C_ACC + (255,))
        text(d, (q[0] + 14 * S, q[1] - 12 * S), pts[-1]['t'].strftime('%b %d · ') + ('Hurricane' if pts[-1]['st'] == 'HU' else 'Tropical storm' if pts[-1]['st'] == 'TS' else 'Depression' if pts[-1]['st'] == 'TD' else 'Low'), 16 * S)
    a = seg(t, 0.40, 0.48)
    label_at(d, cam, -97.05, 28.02, 'Landfall near Rockport · Aug 25, ~10 p.m. · Category 4', S, a=a, sz=17)
    label_at(d, cam, -95.369, 29.760, 'HOUSTON', S, a=seg(t, 0.6, 0.75), sz=20, bold=True, mcol=(255, 255, 255))
    credit(d, cam, 'Track: NOAA/NHC best track (HURDAT2)', S); return im

def F_forecast(t, W, H, S):
    cam = cam_path(seg(t, 0.55, 0.95), (-95.6, 29.3, 520), (-95.37, 29.76, 60), W, H)
    im, d = base(cam, S)
    a1 = seg(t, 0.03, 0.12) * (1 - seg(t, 0.5, 0.56))
    if a1 > 0:
        d.rounded_rectangle([40 * S, 120 * S, 640 * S, 300 * S], 12 * S, fill=(12, 14, 16, int(200 * a1)))
        text(d, (60 * S, 150 * S), 'National Hurricane Center · Fri, Aug 25, 4 p.m.', 17 * S, fill=(190, 196, 204), alpha=a1, halo=False)
        text(d, (60 * S, 190 * S), '15 to 30 inches of rain', 30 * S, bold=True, alpha=a1, halo=False)
        text(d, (60 * S, 232 * S), 'isolated maximum amounts of 40 inches', 22 * S, alpha=seg(t, 0.12, 0.2) * a1, halo=False)
        text(d, (60 * S, 268 * S), '"catastrophic and life-threatening flooding"', 18 * S, fill=(255, 190, 160), alpha=seg(t, 0.2, 0.28) * a1, halo=False)
    label_at(d, cam, -95.369, 29.760, 'Houston', S, a=seg(t, 0.25, 0.32), sz=20, bold=True, mcol=(255, 255, 255))
    a3 = seg(t, 0.32, 0.42) * (1 - seg(t, 0.55, 0.6))
    text(d, (W / 2, H - 70 * S), 'Weather Prediction Center, Fri Aug 25: highest flood risk ("High Risk") for greater Houston, three days ahead', 17 * S, alpha=a3, anchor='mm')
    a4 = seg(t, 0.85, 0.95)
    text(d, (W / 2, H - 70 * S), 'Which streets would flood? The forecast could not say.', 22 * S, bold=True, alpha=a4, anchor='mm')
    credit(d, cam, 'NHC Advisory 22; NWS Service Assessment p. 38 · base: Census/TIGER 2017', S); return im

EVAC_FULL = ('48057', '48409', '48391', '48239')      # Calhoun, San Patricio, Refugio, Jackson
EVAC_PART = ('48039', '48469', '48321')              # Brazoria, Victoria, Matagorda (parts)
def F_evac(t, W, H, S):
    cam = Cam(-96.0, 29.0, 430, W, H); im, d = base(cam, S, roads=False, bayous=False)
    co = data()['counties']; a = seg(t, 0.05, 0.25)
    for g in EVAC_FULL: poly(d, cam, co[g][1], fill=C_ACC + (int(120 * a),), outline=C_ACC + (int(255 * a),), width=int(2 * S))
    ap = seg(t, 0.2, 0.35)
    for g in EVAC_PART: poly(d, cam, co[g][1], fill=C_ACC + (int(45 * ap),), outline=C_ACC + (int(200 * ap),), width=int(2 * S))
    for lon, lat, n in ((-97.05, 28.02, 'Rockport'), (-97.07, 27.83, 'Port Aransas')): label_at(d, cam, lon, lat, n, S, a=seg(t, 0.1, 0.25), sz=15)
    ah = seg(t, 0.4, 0.55)
    poly(d, cam, co['48201'][1], outline=(255, 255, 255, int(255 * ah)), width=int(3 * S))
    p = cam.ll(-95.4, 29.86); text(d, (p[0] + 40 * S, p[1] - 30 * S), 'Harris County: no general evacuation order', 19 * S, bold=True, alpha=ah)
    text(d, (40 * S, H - 60 * S), 'Mandatory evacuation orders reported Aug 24–25 (solid: county; light: parts of county) · simplified', 15 * S, alpha=a)
    credit(d, cam, 'Orders as reported by Texas Tribune, ABC13, county releases · Census 2017', S); return im

def F_landfall_stall(t, W, H, S):
    cam = Cam(-96.2, 29.0, 520, W, H); im, d = base(cam, S, roads=False, bayous=False)
    tt = dt.datetime(2017, 8, 25, 12) + (dt.datetime(2017, 8, 29, 18) - dt.datetime(2017, 8, 25, 12)) * seg(t, 0.05, 0.9)
    draw_track(d, cam, tt, S)
    pts = track_until(tt); q = cam.ll(pts[-1]['lon'], pts[-1]['lat']); dot(d, q, 9 * S, (255, 255, 255, 230), ring=C_ACC + (255,))
    text(d, (q[0] + 14 * S, q[1] - 14 * S), pts[-1]['t'].strftime('%a %b %d, %H:%M UTC'), 16 * S)
    label_at(d, cam, -97.05, 28.02, 'Landfall · Aug 25, ~10 p.m. CDT', S, a=seg(t, 0.1, 0.2), sz=16)
    label_at(d, cam, -95.369, 29.760, 'Houston', S, a=1, sz=18, bold=True, mcol=(255, 255, 255))
    text(d, (40 * S, H - 60 * S), 'Position every 6 hours, Aug 25 – Aug 29', 15 * S, alpha=0.9)
    credit(d, cam, 'NOAA/NHC best track (HURDAT2)', S); return im

ASOS_USE = ('IAH', 'HOU', 'DWH', 'LVJ', 'AXH', 'CXO', 'GLS')
NIGHT_ST = ('IAH', 'HOU', 'DWH', 'LVJ', 'AXH')
def F_night(t, W, H, S):
    cam = Cam(-95.33, 29.72, 115, W, H); im, d = base(cam, S)
    A = asos(); t0 = dt.datetime(2017, 8, 26, 18); t1 = dt.datetime(2017, 8, 27, 9)
    now = t0 + (t1 - t0) * seg(t, 0.05, 0.85)
    for st in ASOS_USE:
        s = A[st]; tot = sum(v for (tm, v) in s['obs'] if t0 <= tm <= now and tm.minute >= 50)
        p = cam.ll(s['lon'], s['lat']); r = (6 + tot * 1.6) * S
        dot(d, p, r, rain_col(tot * 1.6) + (190,), ring=(10, 12, 14, 255))
        text(d, (p[0] + r + 6 * S, p[1]), f'{st} {tot:.1f} in', 15 * S, anchor='lm')
    text(d, (40 * S, 40 * S), now.strftime('%a %b %d · %-I:%M %p').replace('AM', 'a.m.').replace('PM', 'p.m.'), 30 * S, bold=True)
    text(d, (40 * S, 80 * S), 'Rain since Saturday 6 p.m. at airport weather stations', 17 * S, fill=(190, 196, 204))
    if now >= dt.datetime(2017, 8, 26, 21, 27):
        a = min(1, (now - dt.datetime(2017, 8, 26, 21, 27)).total_seconds() / 3000 + 0.3)
        d.rounded_rectangle([40 * S, 110 * S, 600 * S, 160 * S], 8 * S, fill=(150, 30, 40, int(200 * a)))
        text(d, (56 * S, 135 * S), '9:27 p.m. · first FLASH FLOOD EMERGENCY', 19 * S, bold=True, alpha=a, anchor='lm', halo=False)
    label_at(d, cam, -95.369, 29.760, 'Downtown', S, a=0.9, sz=15, mcol=(255, 255, 255))
    credit(d, cam, 'Hourly precipitation: NWS ASOS via Iowa Environmental Mesonet · NWS Service Assessment p. 8', S); return im

def F_perez(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.55), (-95.33, 29.80, 70), (-95.39, 29.935, 12), W, H)
    im, d = base(cam, S)
    a = seg(t, 0.45, 0.6)
    for n in ('Hardy Toll Rd', 'Beltway 8', 'I- 45'):
        line(d, cam, data()['roads'].get(n, []), (255, 200, 120, int(230 * a)), int(3 * S))
    label_at(d, cam, -95.3814, 29.9389, 'Hardy Toll Road at Beltway 8', S, a=seg(t, 0.55, 0.7), sz=17, bold=True)
    text(d, (40 * S, H - 60 * S), 'Sgt. Steve Perez was found in this area on Tuesday, Aug 29 (news reports)', 17 * S, alpha=seg(t, 0.65, 0.8))
    credit(d, cam, 'Roads: Census TIGER 2017', S); return im

def F_dickinson(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.5), (-95.3, 29.65, 110), (-95.08, 29.47, 28), W, H)
    im, d = base(cam, S)
    a = seg(t, 0.45, 0.6)
    line(d, cam, data()['linear'].get('Dickinson Byu', []), (120, 200, 255, int(255 * a)), int(4 * S))
    label_at(d, cam, -95.051, 29.461, 'DICKINSON', S, a=seg(t, 0.35, 0.5), sz=19, bold=True, mcol=(255, 255, 255))
    st = [x for x in stations() if x['name'] in ('Dickinson NWS', 'League City 2.7 NE', 'Friendswood 2 NNW')]
    for i, x in enumerate(st):
        aa = seg(t, 0.6 + i * 0.07, 0.68 + i * 0.07); p = cam.ll(x['lon'], x['lat'])
        dot(d, p, 7 * S, rain_col(x['tot']) + (int(230 * aa),), ring=(10, 12, 14, int(255 * aa)))
        text(d, (p[0] + 12 * S, p[1] + 4 * S), f"{x['tot']:.1f} in", 16 * S, alpha=aa, anchor='lm')
    text(d, (40 * S, H - 86 * S), 'Dickinson Bayou: record water level (NHC report)', 17 * S, alpha=seg(t, 0.55, 0.65))
    text(d, (40 * S, H - 60 * S), 'Rain totals, Aug 25 – Aug 31/Sep 1 (NHC rainfall supplement)', 15 * S, alpha=seg(t, 0.65, 0.75), fill=(190, 196, 204))
    credit(d, cam, 'NOAA/NHC TCR AL092017 · Census TIGER 2017', S); return im

def F_reservoirs(t, W, H, S, part='all'):
    # a: city -> west; b: dams + bayou; c: pools rise to record; d: aerial check; e: release + downstream
    A0 = (-95.42, 29.76, 60); A1 = (-95.60, 29.78, 32); A2 = (-95.70, 29.75, 9)
    if part == 'pools':
        cam = cam_path(seg(t, 0.75, 1.0), A1, A2, W, H) if t > 0.75 else cam_path(seg(t, 0.0, 0.2), A0, A1, W, H)
    elif part == 'release':
        cam = cam_path(seg(t, 0.0, 0.3), A1, (-95.52, 29.77, 36), W, H)
    else:
        cam = cam_path(t, A0, A1, W, H)
    im, d = base(cam, S)
    ap = 1.0
    if part == 'pools':
        lvl = seg(t, 0.2, 0.7)
        if lvl > 0:
            pim, z, x0, y0 = pool_image(lvl); raster_overlay(im, cam, pim, z, x0, y0)
        if t > 0.72:
            aim, z, x0, y0 = aerial(); raster_overlay(im, cam, aim, z, x0, y0, alpha=seg(t, 0.8, 0.9))
        d = ImageDraw.Draw(im, 'RGBA')
        text(d, (40 * S, 40 * S), 'Water held behind the dams', 28 * S, bold=True)
        text(d, (40 * S, 80 * S), 'Area below the record pool level (computed from USGS-derived elevation data, approximate)', 15 * S, fill=(190, 196, 204))
        if t > 0.6:
            text(d, (40 * S, 110 * S), 'Record pools, Aug 30: Addicks 109.1 ft · Barker 101.6 ft (HCFCD)', 17 * S, alpha=seg(t, 0.6, 0.68))
        if t > 0.82: text(d, (W / 2, H - 70 * S), 'NOAA aerial photograph, Aug 30, 2017: streets inside Barker reservoir under water', 18 * S, bold=True, alpha=seg(t, 0.84, 0.9), anchor='mm')
    if part in ('all', 'pools', 'release'):
        a = 1 if part != 'all' else seg(t, 0.3, 0.6)
        line(d, cam, data()['linear'].get('Buffalo Byu', []), (120, 200, 255, int(255 * a)), int(4 * S))
        for lon, lat, n in ((-95.6236, 29.7909, 'Addicks Dam'), (-95.6468, 29.7699, 'Barker Dam')): label_at(d, cam, lon, lat, n, S, a=a, sz=16, bold=True)
        p = cam.ll(-95.50, 29.762); text(d, (p[0], p[1] + 22 * S), 'Buffalo Bayou →  downtown', 16 * S, alpha=a, anchor='lm')
        label_at(d, cam, -95.369, 29.760, 'Downtown', S, a=a, sz=15, mcol=(255, 255, 255))
    if part == 'all':
        text(d, (40 * S, 40 * S), 'Addicks and Barker: two flood-control reservoirs west of downtown', 22 * S, bold=True, alpha=seg(t, 0.4, 0.6))
        text(d, (40 * S, 76 * S), 'Gates closed Aug 25, as the operating manual requires', 17 * S, alpha=seg(t, 0.6, 0.75))
    if part == 'release':
        pim, z, x0, y0 = pool_image(1.0); raster_overlay(im, cam, pim, z, x0, y0); d = ImageDraw.Draw(im, 'RGBA')
        line(d, cam, data()['linear'].get('Buffalo Byu', []), (120, 200, 255, 255), int(4 * S))
        k = seg(t, 0.3, 0.55)
        for parts in [data()['linear'].get('Buffalo Byu', [])]:
            line(d, cam, parts, (255, 255, 255, int(200 * k)), int(7 * S))
        text(d, (40 * S, 40 * S), 'Releases begin ≈ midnight, Aug 28', 28 * S, bold=True, alpha=seg(t, 0.3, 0.4))
        text(d, (40 * S, 80 * S), 'Peak combined release by Aug 30: 13,800 cubic feet per second (court record)', 17 * S, alpha=seg(t, 0.45, 0.55))
        text(d, (40 * S, 108 * S), 'About 4,000 homes downstream flooded by the releases (Governor\'s Commission)', 17 * S, alpha=seg(t, 0.62, 0.72))
    credit(d, cam, 'Census TIGER 2017 · terrain: AWS Terrain Tiles (USGS 3DEP) · NOAA NGS aerial imagery', S); return im

def F_east(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.5), (-95.2, 29.6, 260), (-94.1, 30.0, 140), W, H)
    im, d = base(cam, S, roads=False)
    tt = dt.datetime(2017, 8, 28, 0) + (dt.datetime(2017, 8, 31, 0) - dt.datetime(2017, 8, 28, 0)) * seg(t, 0.05, 0.6)
    draw_track(d, cam, tt, S)
    label_at(d, cam, -93.33, 29.77, 'Second landfall, Louisiana · Aug 30', S, a=seg(t, 0.5, 0.6), sz=15)
    for lon, lat, n in ((-94.13, 30.08, 'Beaumont'), (-93.93, 29.90, 'Port Arthur'), (-94.02, 30.13, 'Vidor')):
        label_at(d, cam, lon, lat, n, S, a=seg(t, 0.45, 0.55), sz=16, mcol=(255, 255, 255))
    a = seg(t, 0.65, 0.78); p = cam.ll(-94.01, 29.95)
    dot(d, p, 10 * S, rain_col(60.58) + (int(255 * a),), ring=(10, 12, 14, int(255 * a)))
    text(d, (p[0] + 16 * S, p[1] + 26 * S), '60.58 in · Nederland (Aug 25 – Sep 1)', 20 * S, bold=True, alpha=a, anchor='lm')
    credit(d, cam, 'NOAA/NHC best track; NHC rainfall supplement', S); return im

def F_observed(t, W, H, S):
    cam = Cam(-95.4, 29.6, 520, W, H); im, d = base(cam, S, roads=False, bayous=False)
    st = [x for x in stations() if -98 < x['lon'] < -92.5 and 27.5 < x['lat'] < 31.5]
    st.sort(key=lambda x: x['tot']); k = seg(t, 0.25, 0.8); n = int(len(st) * k)
    for x in st[:n]:
        p = cam.ll(x['lon'], x['lat']); dot(d, p, 3.2 * S, rain_col(x['tot']) + (230,))
    # legend with the forecast band
    lx, ly, lw = 60 * S, H - 120 * S, 520 * S
    for i in range(int(lw)):
        v = i / lw * 60; d.line([(lx + i, ly), (lx + i, ly + 14 * S)], fill=rain_col(v) + (255,))
    a = seg(t, 0.05, 0.2)
    d.rectangle([lx + lw * 15 / 60, ly - 26 * S, lx + lw * 30 / 60, ly - 6 * S], fill=(255, 255, 255, int(70 * a)), outline=(255, 255, 255, int(220 * a)))
    text(d, (lx + lw * 22.5 / 60, ly - 34 * S), 'forecast 15–30 in', 15 * S, alpha=a, anchor='md')
    d.line([(lx + lw * 40 / 60, ly - 26 * S), (lx + lw * 40 / 60, ly + 14 * S)], fill=(255, 255, 255, int(220 * a)), width=int(2 * S))
    text(d, (lx + lw * 40 / 60 + 6 * S, ly - 14 * S), 'isolated 40', 13 * S, alpha=a, anchor='lm')
    for v in (0, 20, 40, 60): text(d, (lx + lw * v / 60, ly + 32 * S), f'{v} in', 13 * S, anchor='mm')
    over40 = sum(1 for x in st if x['tot'] >= 40)
    text(d, (40 * S, 40 * S), 'Forecast and what fell', 28 * S, bold=True)
    text(d, (40 * S, 80 * S), f'{len(st)} reporting stations · {over40} recorded 40 inches or more', 17 * S, alpha=seg(t, 0.8, 0.9))
    credit(d, cam, 'NHC Advisory 22 (Aug 25) · NHC TCR rainfall supplement: storm totals, Aug 25 – Sep 1', S); return im

def F_brazos(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.5), (-95.4, 29.7, 90), (-95.74, 29.6, 26), W, H)
    im, d = base(cam, S)
    a = seg(t, 0.4, 0.55)
    line(d, cam, data()['linear'].get('Brazos Riv', []), (120, 200, 255, int(255 * a)), int(5 * S))
    poly(d, cam, data()['counties']['48157'][1], outline=(255, 255, 255, int(160 * a)), width=int(2 * S))
    label_at(d, cam, -95.76, 29.58, 'Richmond', S, a=a, sz=16, mcol=(255, 255, 255))
    label_at(d, cam, -95.731, 29.626, 'Pecan Grove', S, a=seg(t, 0.6, 0.7), sz=19, bold=True)
    text(d, (40 * S, 40 * S), 'Brazos River, Fort Bend County', 26 * S, bold=True, alpha=a)
    text(d, (40 * S, 78 * S), 'At Richmond it crested more than 10 ft above flood stage on Sept 1 (NWS)', 17 * S, alpha=seg(t, 0.55, 0.65))
    text(d, (40 * S, 104 * S), 'More than 200,000 residents under an evacuation order (NWS)', 17 * S, alpha=seg(t, 0.68, 0.78))
    credit(d, cam, 'NWS Service Assessment p. 27 · Census TIGER 2017', S); return im

def F_kiley(t, W, H, S):
    # RECONSTRUCTION · SCHEMATIC — only the actions in the AFRAS citation; no faces, no house design
    im = Image.new('RGB', (W, H), (16, 18, 21)); d = ImageDraw.Draw(im, 'RGBA')
    gy = H * 0.70
    d.rectangle([0, gy, W, H], fill=(30, 60, 85, 255))                           # flood water
    rx0, rx1, ry = W * 0.40, W * 0.78, H * 0.52
    d.polygon([(rx0, gy), (rx0 + 40 * S, ry), (rx1 - 40 * S, ry), (rx1, gy)], fill=(70, 74, 80, 255))   # generic roof outline
    d.rectangle([W * 0.20, gy - 34 * S, W * 0.32, gy + 6 * S], fill=(90, 96, 104, 255))                  # car, almost covered
    d.rectangle([0, gy - 4 * S, W, gy + 2 * S], fill=(30, 60, 85, 200))
    hx = W * 0.58; d.line([(hx, 0), (hx, H * 0.10)], fill=(200, 200, 200, 255), width=int(2 * S))
    steps = [(0.05, 'Lowered from the helicopter'), (0.20, 'Onto the car'), (0.33, 'Climbs onto the roof'),
             (0.48, 'Carries the bin with the two children down'), (0.64, 'Helps the mother down'), (0.78, 'All three in the rescue basket · hoisted')]
    k = sum(1 for a, _ in steps if t >= a)
    pos = [(hx, H * 0.10), (hx, H * 0.30), (W * 0.26, gy - 50 * S), (W * 0.50, ry - 18 * S), (W * 0.50, gy - 10 * S), (W * 0.50, ry - 18 * S), (hx, gy - 10 * S)]
    i = max(0, min(k, len(pos) - 1)); p = pos[i]
    if k >= 1: d.line([(hx, H * 0.10), (hx, p[1]) if i <= 1 else (hx, H * 0.30)], fill=(220, 220, 220, 255), width=int(2 * S))
    dot(d, p, 9 * S, (255, 200, 80, 255))                                                                # the swimmer (marker)
    if 4 <= k: d.rectangle([W * 0.50 - 14 * S, gy - 24 * S, W * 0.50 + 14 * S, gy - 6 * S], outline=(255, 255, 255, 255), width=int(2 * S))
    if k >= 6:
        by = gy - 30 * S - (gy - H * 0.12) * seg(t, 0.82, 0.98)
        d.rectangle([hx - 22 * S, by, hx + 22 * S, by + 26 * S], outline=(255, 120, 70, 255), width=int(3 * S)); d.line([(hx, 0), (hx, by)], fill=(220, 220, 220, 255), width=int(2 * S))
    for j, (a, s) in enumerate(steps):
        al = seg(t, a, a + 0.05); text(d, (60 * S, (150 + j * 34) * S), f'{j + 1}. {s}', 19 * S, alpha=al if j + 1 < k or j + 1 == k else al * 0.0 + (al if j < k else 0), bold=(j + 1 == k))
    text(d, (60 * S, 60 * S), 'RECONSTRUCTION · SCHEMATIC', 22 * S, bold=True, fill=(255, 200, 80))
    text(d, (60 * S, 96 * S), 'Actions as stated in the AFRAS award citation, 2018 · not to scale · positions and shapes are not the real house', 15 * S, fill=(190, 196, 204))
    return im

SHOTS = {'where': F_where, 'forecast': F_forecast, 'evac': F_evac, 'stall': F_landfall_stall, 'night': F_night, 'perez': F_perez,
         'dickinson': F_dickinson, 'res_intro': lambda t, W, H, S: F_reservoirs(t, W, H, S, 'all'),
         'res_pools': lambda t, W, H, S: F_reservoirs(t, W, H, S, 'pools'), 'res_release': lambda t, W, H, S: F_reservoirs(t, W, H, S, 'release'),
         'east': F_east, 'observed': F_observed, 'brazos': F_brazos, 'kiley': F_kiley}

def render_frame(args):
    shot, t, W, H, SS = args
    im = SHOTS[shot](t, W * SS, H * SS, SS)
    return im.convert('RGB').resize((W, H), Image.LANCZOS).tobytes()

def render(shot, dur, out, W=1280, H=720, fps=25, SS=2):
    from multiprocessing import Pool
    data(); n = max(2, int(round(dur * fps)))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for b in pool.imap(render_frame, [(shot, i / (n - 1), W, H, SS) for i in range(n)], chunksize=4): p.stdin.write(b)
    p.stdin.close(); p.wait()

# ===== V4 OVERRIDES =====
# Readability pass (owner notes): larger objects and labels, more contrast, fewer details; checked at phone size.
C_WATER = (9, 20, 30); C_LAND = (44, 49, 56); C_LINE = (120, 128, 138); C_TEXT = (245, 246, 247)
C_ACC = (255, 128, 64); C_RIVER = (110, 190, 255)
K = 1.45   # global text scale vs v3

def text(d, xy, s, sz, fill=C_TEXT, bold=False, anchor='la', alpha=1.0, halo=True):
    if alpha <= 0.01: return
    f = font(sz * K, bold); col = tuple(fill[:3]) + (int(255 * alpha),)
    if halo: d.text(xy, s, font=f, fill=col, anchor=anchor, stroke_width=max(2, int(sz * K / 7)), stroke_fill=(6, 8, 10, int(230 * alpha)))
    else: d.text(xy, s, font=f, fill=col, anchor=anchor)

def base(cam, S, roads=False, bayous=False, counties=True, county_alpha=55, roadset=None, bayouset=None):
    W, H = cam.W, cam.H
    im = Image.new('RGB', (W, H), C_WATER); d = ImageDraw.Draw(im, 'RGBA')
    poly(d, cam, data()['land'], fill=C_LAND + (255,))
    for parts in data()['areawater']: poly(d, cam, parts, fill=C_WATER + (255,))
    if counties:
        for gid, (n, parts) in data()['counties'].items(): poly(d, cam, parts, outline=C_LINE + (county_alpha,), width=max(1, int(S)))
    for stu, parts in data()['states']: poly(d, cam, parts, outline=(170, 176, 184, 220), width=max(1, int(2 * S)))
    for n in (roadset or ()):
        line(d, cam, data()['roads'].get(n, []), (150, 156, 164, 200), max(1, int(2.2 * S)))
    for n in (bayouset or ()):
        line(d, cam, data()['linear'].get(n, []), C_RIVER + (200,), max(1, int(2.6 * S)))
    return im, d

def credit(d, cam, s, S):
    text(d, (cam.W - 22 * S, cam.H - 18 * S), s, 10.5 * S, fill=(185, 190, 198), anchor='rd', alpha=0.95)
def headline(d, S, s, sub=None, a=1.0):
    d.rectangle([0, 0, 1e5, (124 if sub else 82) * S], fill=(6, 8, 10, int(160 * a)))
    text(d, (40 * S, 26 * S), s, 22 * S, bold=True, alpha=a)
    if sub: text(d, (40 * S, 72 * S), sub, 15.5 * S, fill=(215, 220, 226), alpha=a)
def label_at(d, cam, lon, lat, s, S, a=1, dx=12, dy=-10, sz=15, col=C_TEXT, bold=False, marker=True, mcol=C_ACC, anchor='ls'):
    p = cam.ll(lon, lat)
    if marker: dot(d, p, 8 * S, mcol + (int(255 * a),), ring=(6, 8, 10, int(255 * a)))
    text(d, (p[0] + dx * S, p[1] + dy * S), s, sz * S, fill=col, alpha=a, bold=bold, anchor=anchor)

HOU = ('I- 10', 'I- 45', 'I- 610', 'Beltway 8')

def F_where(t, W, H, S):
    t0 = dt.datetime(2017, 8, 23, 12); tl = dt.datetime(2017, 8, 26, 3); tend = dt.datetime(2017, 8, 29, 18)
    cam = cam_path(seg(t, 0.45, 0.95), (-94.5, 26.8, 1300), (-95.9, 29.2, 380), W, H)
    im, d = base(cam, S, counties=False)
    tt = t0 + (tl - t0) * seg(t, 0.05, 0.45) if t < 0.5 else tl + (tend - tl) * seg(t, 0.5, 0.95)
    pts = track_until(tt)
    if len(pts) > 1:
        xy = cam.px([merc(p['lon'], p['lat']) for p in pts]); d.line([tuple(q) for q in xy], fill=(255, 255, 255, 235), width=int(5 * S), joint='curve')
        q = xy[-1]; dot(d, q, 13 * S, C_ACC + (255,), ring=(255, 255, 255, 255))
    label_at(d, cam, -97.05, 28.02, 'Landfall · Aug 25', S, a=seg(t, 0.40, 0.48), sz=17, bold=True, anchor='rs', dx=-14)
    label_at(d, cam, -95.369, 29.760, 'HOUSTON', S, a=seg(t, 0.55, 0.7), sz=22, bold=True, mcol=(255, 255, 255))
    text(d, (40 * S, H - 74 * S), pts[-1]['t'].strftime('%a, %b %d') if pts else '', 22 * S, bold=True)
    credit(d, cam, 'Track: NOAA/NHC best track', S); return im

def F_forecast(t, W, H, S):
    cam = cam_path(seg(t, 0.55, 0.95), (-95.6, 29.4, 420), (-95.37, 29.76, 55), W, H)
    im, d = base(cam, S, roadset=HOU if t > 0.6 else None)
    a1 = seg(t, 0.03, 0.12) * (1 - seg(t, 0.5, 0.56))
    if a1 > 0:
        d.rounded_rectangle([40 * S, 40 * S, 760 * S, 270 * S], 14 * S, fill=(6, 8, 10, int(215 * a1)))
        text(d, (66 * S, 64 * S), 'Hurricane Center forecast · Fri, Aug 25', 13 * S, fill=(205, 210, 216), alpha=a1, halo=False)
        text(d, (66 * S, 108 * S), '15–30 inches of rain', 30 * S, bold=True, alpha=a1, halo=False)
        text(d, (66 * S, 178 * S), 'in places 40 inches', 19 * S, alpha=seg(t, 0.12, 0.2) * a1, halo=False)
    label_at(d, cam, -95.369, 29.760, 'Houston', S, a=seg(t, 0.25, 0.32), sz=22, bold=True, mcol=(255, 255, 255))
    a4 = seg(t, 0.85, 0.95)
    if a4 > 0: headline(d, S, 'Which streets? The forecast could not say.', a=a4)
    credit(d, cam, 'NHC Advisory 22', S); return im

def F_evac(t, W, H, S):
    cam = Cam(-96.1, 28.9, 360, W, H); im, d = base(cam, S)
    co = data()['counties']; a = seg(t, 0.05, 0.25); ap = seg(t, 0.2, 0.35); ah = seg(t, 0.4, 0.55)
    for g in EVAC_FULL: poly(d, cam, co[g][1], fill=C_ACC + (int(170 * a),), outline=(255, 190, 150, int(255 * a)), width=int(2 * S))
    for g in EVAC_PART: poly(d, cam, co[g][1], fill=C_ACC + (int(70 * ap),), outline=(255, 190, 150, int(200 * ap)), width=int(2 * S))
    poly(d, cam, co['48201'][1], fill=(255, 255, 255, int(25 * ah)), outline=(255, 255, 255, int(255 * ah)), width=int(4 * S))
    p = cam.ll(-95.25, 29.95); text(d, (p[0], p[1] - 60 * S), 'HARRIS COUNTY', 17 * S, bold=True, alpha=ah, anchor='mm')
    text(d, (p[0], p[1] - 30 * S), 'no general order', 15 * S, alpha=ah, anchor='mm')
    headline(d, S, 'Ordered to evacuate: coastal counties', 'solid: whole county · light: parts of county · as reported Aug 24–25', a=a)
    credit(d, cam, 'News reports, county releases · Census 2017', S); return im

def F_landfall_stall(t, W, H, S):
    cam = Cam(-96.3, 29.0, 440, W, H); im, d = base(cam, S, counties=False)
    tt = dt.datetime(2017, 8, 25, 12) + (dt.datetime(2017, 8, 29, 18) - dt.datetime(2017, 8, 25, 12)) * seg(t, 0.05, 0.9)
    pts = track_until(tt); xy = cam.px([merc(p['lon'], p['lat']) for p in pts])
    d.line([tuple(q) for q in xy], fill=(255, 255, 255, 235), width=int(5 * S), joint='curve'); dot(d, xy[-1], 13 * S, C_ACC + (255,), ring=(255, 255, 255, 255))
    label_at(d, cam, -95.369, 29.760, 'Houston', S, sz=20, bold=True, mcol=(255, 255, 255))
    headline(d, S, pts[-1]['t'].strftime('%a, %b %d'), 'Harvey barely moves for four days')
    credit(d, cam, 'NOAA/NHC best track', S); return im

def F_night(t, W, H, S):
    # rising readings at 7 airport stations, then a clear total for Sat 6 p.m. – Sun 9 a.m.
    cam = Cam(-95.02, 29.83, 185, W, H); im, d = base(cam, S, roadset=('I- 10', 'I- 45', 'I- 610'))
    A = asos(); t0 = dt.datetime(2017, 8, 26, 18); t1 = dt.datetime(2017, 8, 27, 9)
    now = t0 + (t1 - t0) * seg(t, 0.04, 0.72)
    tots = {}
    for st in NIGHT_ST:
        s = A[st]; tots[st] = sum(v for (tm, v) in s['obs'] if t0 <= tm <= now and tm.minute >= 50)
        p = cam.ll(s['lon'], s['lat']); dot(d, p, 9 * S, rain_col(tots[st] * 2.2) + (255,), ring=(255, 255, 255, 255))
        text(d, (p[0] + 16 * S, p[1]), st, 15 * S, bold=True, anchor='lm')
    # bar panel
    px0, py0, bw = W - 520 * S, 150 * S, 300 * S
    d.rounded_rectangle([px0 - 24 * S, py0 - 22 * S, W - 30 * S, py0 + 52 * S * len(NIGHT_ST) + 6 * S], 12 * S, fill=(6, 8, 10, 215))
    for i, st in enumerate(sorted(NIGHT_ST, key=lambda s: -sum(v for (tm, v) in A[s]['obs'] if t0 <= tm <= t1 and tm.minute >= 50))):
        y = py0 + i * 52 * S; v = tots[st]
        text(d, (px0, y + 16 * S), st, 15 * S, bold=True, anchor='lm', halo=False)
        d.rectangle([px0 + 84 * S, y, px0 + 84 * S + bw * min(v, 12) / 12, y + 32 * S], fill=rain_col(v * 2.2) + (255,))
        text(d, (px0 + 94 * S + bw * min(v, 12) / 12, y + 16 * S), f'{v:.1f}', 16 * S, bold=True, anchor='lm', halo=False)
    clock = now.replace(minute=0).strftime('%a %-I %p').replace('AM', 'a.m.').replace('PM', 'p.m.')
    headline(d, S, clock, 'Inches of rain since Sat 6 p.m. at 5 airport gauges — points, not a flood map')
    if now >= dt.datetime(2017, 8, 26, 21, 27):
        a = seg(t, 0.2, 0.26) * (1 - seg(t, 0.66, 0.72))
        d.rounded_rectangle([40 * S, 140 * S, 560 * S, 196 * S], 10 * S, fill=(170, 30, 40, int(235 * a)))
        text(d, (60 * S, 168 * S), '9:27 p.m. · flash flood emergency', 16 * S, bold=True, alpha=a, anchor='lm', halo=False)
    if t > 0.74:
        a = seg(t, 0.74, 0.82); mx = max(tots, key=tots.get)
        X = W - 520 * S - 24 * S; d.rounded_rectangle([X, H - 200 * S, W - 30 * S, H - 70 * S], 14 * S, fill=(6, 8, 10, int(225 * a)))
        lo = min(tots.values())
        text(d, (X + 26 * S, H - 178 * S), 'Sat 6 p.m. → Sun 9 a.m. (15 hours)', 15 * S, fill=(215, 220, 226), alpha=a, halo=False)
        text(d, (X + 26 * S, H - 132 * S), f'{lo:.0f} to {tots[mx]:.0f} inches', 28 * S, bold=True, alpha=a, halo=False)
    credit(d, cam, 'NWS ASOS hourly precipitation via Iowa Environmental Mesonet · NWS Service Assessment', S); return im

def F_perez(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.55), (-95.36, 29.82, 60), (-95.39, 29.935, 14), W, H)
    im, d = base(cam, S, roadset=('I- 45', 'I- 610', 'I- 10'))
    a = seg(t, 0.4, 0.55)
    for n in ('Hardy Toll Rd', 'Beltway 8'): line(d, cam, data()['roads'].get(n, []), (255, 205, 120, int(255 * a)), int(6 * S))
    p = cam.ll(-95.3814, 29.9389); r = 26 * S * seg(t, 0.55, 0.65)
    if r > 0: d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], outline=(255, 80, 80, 255), width=int(4 * S))
    text(d, (p[0] + 36 * S, p[1] - 30 * S), 'Hardy Toll Road at Beltway 8', 16 * S, bold=True, alpha=seg(t, 0.55, 0.65))
    if t > 0.65: headline(d, S, 'Sgt. Steve Perez was found here, Aug 29', 'location as given in news reports', a=seg(t, 0.65, 0.75))
    label_at(d, cam, -95.369, 29.760, 'Downtown', S, a=1 - seg(t, 0.3, 0.5), sz=16, mcol=(255, 255, 255))
    credit(d, cam, 'Roads: Census TIGER 2017', S); return im

def F_dickinson(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.5), (-95.25, 29.62, 100), (-95.09, 29.48, 30), W, H)
    im, d = base(cam, S, roadset=('I- 45',))
    a = seg(t, 0.4, 0.55)
    label_at(d, cam, -95.051, 29.461, 'DICKINSON', S, a=seg(t, 0.3, 0.45), sz=22, bold=True, mcol=(255, 255, 255))
    if t > 0.55: headline(d, S, 'Dickinson Bayou: highest level on record', 'NHC Tropical Cyclone Report', a=seg(t, 0.55, 0.65))
    x = [s for s in stations() if s['name'] == 'Dickinson NWS'][0]; aa = seg(t, 0.7, 0.8)
    if aa > 0:
        d.rounded_rectangle([40 * S, H - 170 * S, 640 * S, H - 60 * S], 14 * S, fill=(6, 8, 10, int(225 * aa)))
        text(d, (66 * S, H - 146 * S), 'Rain gauge in Dickinson, Aug 25–31', 15 * S, fill=(205, 210, 216), alpha=aa, halo=False)
        text(d, (66 * S, H - 104 * S), f"{x['tot']:.1f} inches", 28 * S, bold=True, alpha=aa, halo=False)
    credit(d, cam, 'NOAA/NHC TCR and rainfall supplement · Census TIGER 2017', S); return im

def F_reservoirs(t, W, H, S, part='all'):
    A0 = (-95.45, 29.77, 55); A1 = (-95.60, 29.78, 30); A2 = (-95.71, 29.745, 8)
    BB = ('Buffalo Byu',)
    if part == 'pools':
        cam = cam_path(seg(t, 0.72, 0.95), A1, A2, W, H)
    elif part == 'release':
        cam = cam_path(seg(t, 0.0, 0.3), A1, (-95.53, 29.775, 40), W, H)
    else:
        cam = cam_path(t, A0, A1, W, H)
    im, d = base(cam, S, roadset=('I- 10', 'Beltway 8') if part != 'pools' or t < 0.7 else ())
    if part in ('pools', 'release'):
        lvl = seg(t, 0.15, 0.6) if part == 'pools' else 1.0
        if lvl > 0:
            pim, z, x0, y0 = pool_image(lvl); raster_overlay(im, cam, pim, z, x0, y0, alpha=0.85 if t < 0.75 or part == 'release' else 0.85 * (1 - seg(t, 0.75, 0.85)))
        if part == 'pools' and t > 0.72:
            aim, z, x0, y0 = aerial(); raster_overlay(im, cam, aim, z, x0, y0, alpha=seg(t, 0.76, 0.86))
        d = ImageDraw.Draw(im, 'RGBA')
    k = 1 if part != 'all' else seg(t, 0.3, 0.6)
    line(d, cam, data()['linear'].get('Buffalo Byu', []), C_RIVER + (int(255 * k),), int(6 * S))
    for lon, lat, n, dx, anc in ((-95.6236, 29.7909, 'ADDICKS DAM', 14, 'ls'), (-95.6468, 29.7699, 'BARKER DAM', -14, 'rs')):
        label_at(d, cam, lon, lat, n, S, a=k if not (part == 'pools' and t > 0.75) else 1 - seg(t, 0.75, 0.8), sz=15, bold=True, dx=dx, dy=-10 if anc == 'ls' else 14, anchor=anc)
    if part == 'all':
        p = cam.ll(-95.48, 29.762); text(d, (p[0], p[1] + 30 * S), 'Buffalo Bayou → downtown', 14 * S, fill=C_RIVER, alpha=k, anchor='mm')
        label_at(d, cam, -95.369, 29.760, 'Downtown', S, a=1 - seg(t, 0.5, 0.8), sz=16, mcol=(255, 255, 255))
        headline(d, S, 'Two flood-control dams west of downtown', 'Gates closed Aug 25, as the operating manual requires', a=seg(t, 0.45, 0.6))
    if part == 'pools':
        if t < 0.74: headline(d, S, 'Water held behind the dams', 'Shaded: land below the record pool level (elevation estimate — not a surveyed flood line)')
        else: headline(d, S, 'Aug 30, 2017: inside Barker reservoir', 'NOAA aerial photograph — streets under water', a=seg(t, 0.78, 0.86))
        if 0.6 < t < 0.74:
            d.rounded_rectangle([40 * S, H - 150 * S, 760 * S, H - 60 * S], 14 * S, fill=(6, 8, 10, 215))
            text(d, (66 * S, H - 105 * S), 'Record pools Aug 30: Addicks 109.1 ft · Barker 101.6 ft', 15 * S, bold=True, anchor='lm', halo=False)
    if part == 'release':
        kk = seg(t, 0.3, 0.5)
        line(d, cam, data()['linear'].get('Buffalo Byu', []), (255, 255, 255, int(210 * kk)), int(9 * S))
        headline(d, S, 'Releases begin ≈ midnight, Aug 28', 'Peak 13,800 cubic feet per second by Aug 30 (court record)', a=seg(t, 0.3, 0.4))
        a2 = seg(t, 0.62, 0.72)
        if a2 > 0:
            d.rounded_rectangle([40 * S, H - 150 * S, 820 * S, H - 60 * S], 14 * S, fill=(6, 8, 10, int(215 * a2)))
            text(d, (66 * S, H - 105 * S), '≈ 4,000 homes downstream flooded by the releases', 15 * S, bold=True, alpha=a2, anchor='lm', halo=False)
    credit(d, cam, 'Census TIGER 2017 · elevation: AWS Terrain Tiles (USGS 3DEP) · NOAA NGS aerial imagery', S); return im

def F_east(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.5), (-95.2, 29.7, 240), (-94.15, 29.98, 110), W, H)
    im, d = base(cam, S, counties=False)
    tt = dt.datetime(2017, 8, 28, 0) + (dt.datetime(2017, 8, 31, 0) - dt.datetime(2017, 8, 28, 0)) * seg(t, 0.05, 0.6)
    pts = track_until(tt); xy = cam.px([merc(p['lon'], p['lat']) for p in pts])
    d.line([tuple(q) for q in xy], fill=(255, 255, 255, 235), width=int(5 * S), joint='curve')
    for lon, lat, n in ((-94.13, 30.08, 'Beaumont'), (-93.93, 29.90, 'Port Arthur')):
        label_at(d, cam, lon, lat, n, S, a=seg(t, 0.45, 0.55), sz=16, mcol=(255, 255, 255))
    a = seg(t, 0.62, 0.74)
    if a > 0:
        p = cam.ll(-94.01, 29.95); dot(d, p, 14 * S, rain_col(60.58) + (int(255 * a),), ring=(255, 255, 255, int(255 * a)))
        text(d, (p[0] - 20 * S, p[1]), 'Nederland', 16 * S, bold=True, alpha=a, anchor='rm')
        d.rounded_rectangle([40 * S, H - 170 * S, 700 * S, H - 60 * S], 14 * S, fill=(6, 8, 10, int(225 * a)))
        text(d, (66 * S, H - 146 * S), 'Rain gauge near Nederland, Aug 25 – Sep 1', 15 * S, fill=(205, 210, 216), alpha=a, halo=False)
        text(d, (66 * S, H - 104 * S), '60.58 inches', 28 * S, bold=True, alpha=a, halo=False)
    credit(d, cam, 'NOAA/NHC best track and rainfall supplement', S); return im

def F_observed(t, W, H, S):
    cam = Cam(-95.2, 29.75, 470, W, H); im, d = base(cam, S, counties=False)
    st = [x for x in stations() if -98 < x['lon'] < -92.5 and 27.5 < x['lat'] < 31.5]
    st.sort(key=lambda x: x['tot']); n = int(len(st) * seg(t, 0.2, 0.7))
    for x in st[:n]:
        p = cam.ll(x['lon'], x['lat']); dot(d, p, 4.5 * S, rain_col(x['tot']) + (240,))
    over40 = sum(1 for x in st if x['tot'] >= 40)
    lx, ly, lw = 60 * S, H - 150 * S, 620 * S
    d.rounded_rectangle([lx - 24 * S, ly - 80 * S, lx + lw + 30 * S, ly + 76 * S], 14 * S, fill=(6, 8, 10, 215))
    for i in range(int(lw)):
        d.line([(lx + i, ly), (lx + i, ly + 18 * S)], fill=rain_col(i / lw * 60) + (255,))
    a = seg(t, 0.05, 0.15)
    d.rectangle([lx + lw * 15 / 60, ly - 34 * S, lx + lw * 30 / 60, ly - 8 * S], fill=(255, 255, 255, int(60 * a)), outline=(255, 255, 255, int(255 * a)), width=int(2 * S))
    text(d, (lx + lw * 22.5 / 60, ly - 44 * S), 'forecast 15–30', 15 * S, bold=True, alpha=a, anchor='md', halo=False)
    for v in (0, 20, 40, 60): text(d, (lx + lw * v / 60, ly + 48 * S), f'{v} in', 14 * S, anchor='mm', halo=False)
    headline(d, S, 'Rain totals at gauges, Aug 25 – Sep 1', 'each dot is one rain gauge — not a map of flooding')
    a2 = seg(t, 0.72, 0.82)
    if a2 > 0:
        d.rounded_rectangle([W - 560 * S, 150 * S, W - 40 * S, 250 * S], 14 * S, fill=(6, 8, 10, int(225 * a2)))
        text(d, (W - 300 * S, 200 * S), f'{over40} gauges: 40 inches or more', 18 * S, bold=True, alpha=a2, anchor='mm', halo=False)
    credit(d, cam, 'NHC Advisory 22 · NHC TCR rainfall supplement', S); return im

def F_brazos(t, W, H, S):
    cam = cam_path(seg(t, 0.0, 0.5), (-95.45, 29.7, 80), (-95.74, 29.6, 24), W, H)
    im, d = base(cam, S, roadset=('US Hwy 59', 'I- 69'))
    a = seg(t, 0.35, 0.5)
    line(d, cam, data()['linear'].get('Brazos Riv', []), C_RIVER + (int(255 * a),), int(7 * S))
    label_at(d, cam, -95.76, 29.58, 'Richmond', S, a=a, sz=17, mcol=(255, 255, 255))
    label_at(d, cam, -95.731, 29.626, 'PECAN GROVE', S, a=seg(t, 0.55, 0.65), sz=20, bold=True)
    p = cam.ll(-95.80, 29.52); text(d, (p[0], p[1]), 'Brazos River', 15 * S, fill=C_RIVER, alpha=a, anchor='mm')
    headline(d, S, 'Brazos River at Richmond: crest Sept 1', 'more than 10 ft above flood stage · 200,000+ under an evacuation order (NWS)', a=seg(t, 0.5, 0.62))
    credit(d, cam, 'NWS Service Assessment p. 27 · Census TIGER 2017', S); return im

_I45 = None
def i45_state():
    global _I45
    if _I45 is None:
        import shapefile
        r = shapefile.Reader(G + '/tl_2017_48_prisecroads/tl_2017_48_prisecroads'); out = []
        for rec, s in zip(r.records(), r.shapes()):
            if rec['FULLNAME'] == 'I- 45':
                pts = np.array(s.points); x, y = mercv(pts[:, 0], pts[:, 1]); out.append(np.stack([x, y], 1))
        _I45 = out
    return _I45
def F_rita(t, W, H, S):
    cam = Cam(-95.6, 31.45, 900, W, H); im, d = base(cam, S, counties=False)
    a = seg(t, 0.05, 0.3)
    line(d, cam, i45_state(), (255, 205, 120, int(255 * a)), int(6 * S))
    label_at(d, cam, -95.369, 29.760, 'Houston', S, sz=18, bold=True, mcol=(255, 255, 255))
    label_at(d, cam, -96.797, 32.777, 'Dallas', S, sz=18, bold=True, mcol=(255, 255, 255))
    label_at(d, cam, -96.68, 32.59, 'bus fire near Wilmer', S, a=seg(t, 0.3, 0.4), sz=16, dx=16, dy=16, anchor='ls', mcol=(255, 80, 80))
    headline(d, S, 'Hurricane Rita, 2005: 23 evacuees died in a bus fire', 'on I-45, Sept 23 — the day before Rita came ashore (NTSB)', a=seg(t, 0.25, 0.4))
    credit(d, cam, 'NTSB HAR-07/01 · Census TIGER 2017', S); return im

# ---------- Kiley: RECONSTRUCTION — six shots, generic silhouettes, actions from the AFRAS citation only ----------
SKY = (62, 70, 80); WATER = (34, 72, 98); SIL = (22, 25, 29); SWIM = (255, 140, 40); HELM = (255, 222, 70); FAM = (168, 174, 182); ROOF = (84, 88, 96); ROOF2 = (64, 68, 75)
def limb(d, a, b, w, col):
    d.line([a, b], fill=col, width=int(w)); r = w / 2
    for p in (a, b): d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=col)
def person(d, x, y, h, col, pose='stand', helmet=None, face=1):
    # generic silhouette, feet at (x, y); face = +1 right / -1 left
    hd = h * 0.14; nk = (x, y - h * 0.82); sh = (x, y - h * 0.78); hip = (x, y - h * 0.47); w = h * 0.12
    d.ellipse([x - hd * 0.55, y - h, x + hd * 0.55, y - h + hd * 1.1], fill=col)
    if helmet: d.chord([x - hd * 0.66, y - h - hd * 0.1, x + hd * 0.66, y - h + hd * 0.95], 180, 360, fill=helmet)
    limb(d, nk, hip, w * 1.6, col)
    f = face
    if pose == 'hang':
        limb(d, hip, (x - h * 0.04, y), w, col); limb(d, hip, (x + h * 0.06, y - h * 0.03), w, col)
        limb(d, sh, (x - h * 0.03, y - h * 1.1), w * 0.8, col); limb(d, sh, (x + h * 0.03, y - h * 1.1), w * 0.8, col)
        return
    if pose == 'step':
        limb(d, hip, (x - f * h * 0.10, y), w, col); limb(d, hip, (x + f * h * 0.16, y - h * 0.10), w, col)
    else:
        limb(d, hip, (x - h * 0.07, y), w, col); limb(d, hip, (x + h * 0.07, y), w, col)
    if pose in ('stand', 'step'):
        limb(d, sh, (x - h * 0.08, y - h * 0.42), w * 0.8, col); limb(d, sh, (x + h * 0.08, y - h * 0.42), w * 0.8, col)
    elif pose == 'push':
        limb(d, sh, (x + f * h * 0.30, y - h * 0.30), w * 0.8, col); limb(d, sh, (x + f * h * 0.26, y - h * 0.26), w * 0.8, col)
    elif pose == 'carry':
        limb(d, sh, (x + f * h * 0.20, y - h * 0.62), w * 0.8, col); limb(d, sh, (x + f * h * 0.16, y - h * 0.55), w * 0.8, col)
    elif pose == 'reach':
        limb(d, sh, (x + f * h * 0.30, y - h * 0.95), w * 0.8, col); limb(d, sh, (x - f * h * 0.06, y - h * 0.42), w * 0.8, col)
def helicopter(d, cx, cy, s, col=SIL):
    d.ellipse([cx - 130 * s, cy - 48 * s, cx + 95 * s, cy + 48 * s], fill=col)
    d.polygon([(cx + 60 * s, cy - 14 * s), (cx + 280 * s, cy - 24 * s), (cx + 280 * s, cy + 2 * s), (cx + 60 * s, cy + 20 * s)], fill=col)
    d.polygon([(cx + 255 * s, cy - 24 * s), (cx + 290 * s, cy - 76 * s), (cx + 306 * s, cy - 76 * s), (cx + 280 * s, cy - 10 * s)], fill=col)
    d.rectangle([cx - 230 * s, cy - 70 * s, cx + 210 * s, cy - 62 * s], fill=col); d.rectangle([cx - 9 * s, cy - 66 * s, cx + 9 * s, cy - 46 * s], fill=col)
    d.line([(cx - 80 * s, cy + 58 * s), (cx + 45 * s, cy + 58 * s)], fill=col, width=int(7 * s))
def gable(d, x0, x1, y_eave, rise):
    # generic roof end-on: one triangle with shingle lines; the walls are under water
    xm = (x0 + x1) / 2
    d.polygon([(x0, y_eave), (xm, y_eave - rise), (x1, y_eave)], fill=ROOF, outline=(120, 126, 134), width=4)
    for k in range(1, 6):
        yy = y_eave - rise * k / 6; dx = (xm - x0) * (1 - k / 6)
        d.line([(xm - dx, yy), (xm + dx, yy)], fill=ROOF2, width=3)
def roof_y(x, x0, x1, y_eave, rise):
    xm = (x0 + x1) / 2; return y_eave - rise * (1 - abs(x - xm) / (xm - x0))
def car(d, x, y_top, s, col=(120, 126, 134)):
    # side view of a large SUV; the water (drawn after it) covers all but the top
    d.rounded_rectangle([x - 120 * s, y_top + 46 * s, x + 120 * s, y_top + 120 * s], 16 * s, fill=col)
    d.polygon([(x - 95 * s, y_top + 50 * s), (x - 80 * s, y_top), (x + 70 * s, y_top), (x + 100 * s, y_top + 50 * s)], fill=col)
    for a, b in ((-72, -10), (0, 62)): d.polygon([(x + a * s, y_top + 10 * s), (x + b * s, y_top + 10 * s), (x + b * s, y_top + 42 * s), (x + a * s - 6 * s, y_top + 42 * s)], fill=(48, 54, 62))
    for wx in (-75, 75): d.ellipse([x + (wx - 26) * s, y_top + 96 * s, x + (wx + 26) * s, y_top + 148 * s], fill=(30, 33, 37))
def bin_(d, x, y, s):
    d.rectangle([x - 40 * s, y - 36 * s, x + 40 * s, y], fill=(200, 206, 214)); d.rectangle([x - 44 * s, y - 42 * s, x + 44 * s, y - 33 * s], fill=(236, 239, 242))
def rain(d, W, H, S, ph):
    for i in range(80):
        x = (i * 137.3 + ph * 900) % (W + 200) - 100; y = (i * 91.7 + ph * 1600) % H
        d.line([(x, y), (x - 10 * S, y + 36 * S)], fill=(210, 220, 230, 55), width=max(1, int(1.5 * S)))
def water(d, W, H, y): d.rectangle([0, y, W, H], fill=WATER + (232,)); d.line([(0, y), (W, y)], fill=(120, 170, 200, 200), width=3)

KILEY_SHOTS = [(0.00, 0.15, 'Lowered from the helicopter'), (0.15, 0.29, 'Onto the car, then the roof'), (0.29, 0.64, 'A woman pushes a storage bin to him'),
               (0.64, 0.76, 'He carries the bin down first'), (0.76, 0.88, 'Then helps the mother down'), (0.88, 1.00, 'All three in the basket')]
def arc(a, b, u, lift):
    return lerp(a[0], b[0], u), lerp(a[1], b[1], u) - lift * math.sin(math.pi * u)
def kiley_shot(i, u, W, H, S):
    im = Image.new('RGB', (W, H), SKY); d = ImageDraw.Draw(im, 'RGBA'); rain(d, W, H, S, u + i)
    e = ease(u)
    if i == 0:   # wide: five people on a low roof, a car almost under water, swimmer lowered
        wy = H * 0.80; x0, x1, rise = W * 0.50, W * 0.96, 120 * S
        car(d, W * 0.28, wy - 30 * S, 0.75 * S); water(d, W, H, wy); gable(d, x0, x1, wy, rise)
        for k, fx in enumerate((0.60, 0.66, 0.73, 0.80, 0.86)):
            xx = W * fx; person(d, xx, roof_y(xx, x0, x1, wy, rise) + 6 * S, 62 * S, FAM)
        helicopter(d, W * 0.30, H * 0.14, 1.0 * S)
        cy = lerp(H * 0.30, wy - 150 * S, e); d.line([(W * 0.30, H * 0.20), (W * 0.30, cy - 128 * S)], fill=(235, 235, 235), width=int(3 * S))
        person(d, W * 0.30, cy, 118 * S, SWIM, 'hang', helmet=HELM)
    elif i == 1:  # closer: lands on the car top, then steps onto the roof edge
        wy = H * 0.80; x0, x1, rise = W * 0.50, W * 1.40, 300 * S; ct = wy - 70 * S
        car(d, W * 0.26, ct, 1.5 * S); water(d, W, H, wy); gable(d, x0, x1, wy, rise)
        a = (W * 0.24, ct); b = (W * 0.60, roof_y(W * 0.60, x0, x1, wy, rise) + 4 * S)
        x, y = arc(a, b, seg(u, 0.35, 0.9), 60 * S)
        person(d, x, y, 250 * S, SWIM, 'step' if 0.35 < u < 0.9 else 'stand', helmet=HELM)
    elif i == 2:  # on the roof: the woman slides the bin toward him (he refuses, she pushes it back)
        yl, yr = H * 0.80, H * 0.70
        d.polygon([(0, yl), (W, yr), (W, H), (0, H)], fill=ROOF)
        for k in range(1, 7): d.line([(0, yl + k * 26 * S), (W, yr + k * 26 * S)], fill=ROOF2, width=int(3 * S))
        ys = lambda x: yl + (yr - yl) * x / W
        person(d, W * 0.28, ys(W * 0.28), 360 * S, SWIM, 'stand', helmet=HELM)
        bx = W * 0.62 - (W * 0.18) * seg(u, 0.0, 0.35) + (W * 0.06) * seg(u, 0.4, 0.55) - (W * 0.06) * seg(u, 0.6, 0.75)
        person(d, W * 0.80, ys(W * 0.80), 330 * S, FAM, 'push', face=-1); bin_(d, bx, ys(bx), 2.6 * S)
    elif i == 3:  # carries the bin from the roof down to the car top
        wy = H * 0.80; x0, x1, rise = W * 0.46, W * 1.36, 300 * S; ct = wy - 70 * S
        car(d, W * 0.24, ct, 1.5 * S); water(d, W, H, wy); gable(d, x0, x1, wy, rise)
        a = (W * 0.58, roof_y(W * 0.58, x0, x1, wy, rise) + 4 * S); b = (W * 0.26, ct)
        x, y = arc(a, b, e, 50 * S)
        person(d, x, y, 250 * S, SWIM, 'carry', helmet=HELM, face=-1); bin_(d, x - 58 * S, y - 128 * S, 1.7 * S)
    elif i == 4:  # helps the mother down to the car top
        wy = H * 0.80; x0, x1, rise = W * 0.46, W * 1.36, 300 * S; ct = wy - 70 * S
        car(d, W * 0.24, ct, 1.5 * S); water(d, W, H, wy); gable(d, x0, x1, wy, rise)
        bin_(d, W * 0.14, ct, 1.7 * S)
        person(d, W * 0.24, ct, 250 * S, SWIM, 'reach', helmet=HELM)
        a = (W * 0.58, roof_y(W * 0.58, x0, x1, wy, rise) + 4 * S); b = (W * 0.36, ct)
        x, y = arc(a, b, e, 40 * S); person(d, x, y, 235 * S, FAM, 'step', face=-1)
    else:         # the basket goes up with the mother and both children
        wy = H * 0.90; water(d, W, H, wy); helicopter(d, W * 0.50, H * 0.12, 1.15 * S)
        by = lerp(H * 0.80, H * 0.44, e); cx = W * 0.50
        d.line([(cx, H * 0.18), (cx, by - 190 * S)], fill=(235, 235, 235), width=int(3 * S))
        d.line([(cx, by - 190 * S), (cx - 150 * S, by - 120 * S)], fill=(235, 235, 235), width=int(2 * S)); d.line([(cx, by - 190 * S), (cx + 150 * S, by - 120 * S)], fill=(235, 235, 235), width=int(2 * S))
        person(d, cx - 50 * S, by - 6 * S, 190 * S, FAM); person(d, cx + 40 * S, by - 6 * S, 95 * S, FAM)
        d.ellipse([cx + 66 * S, by - 96 * S, cx + 118 * S, by - 56 * S], fill=FAM)
        d.polygon([(cx - 150 * S, by - 120 * S), (cx + 150 * S, by - 120 * S), (cx + 125 * S, by), (cx - 125 * S, by)], outline=(255, 128, 64), width=int(6 * S))
    return im, d
def F_kiley(t, W, H, S):
    i = max(j for j, (a, b, _) in enumerate(KILEY_SHOTS) if t >= a or j == 0); a, b, cap = KILEY_SHOTS[i]
    u = (t - a) / (b - a); im, d = kiley_shot(i, u, W, H, S)
    if i > 0 and u < 0.08:
        prev, _ = kiley_shot(i - 1, 1.0, W, H, S); im = Image.blend(prev, im, u / 0.08); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 0, W, 70 * S], fill=(6, 8, 10, 175))
    text(d, (40 * S, 35 * S), 'RECONSTRUCTION', 17 * S, bold=True, fill=(255, 200, 80), anchor='lm', halo=False)
    text(d, (W - 40 * S, 35 * S), 'based on the award citation · not the real house or people', 12 * S, fill=(215, 220, 226), anchor='rm', halo=False)
    d.rectangle([0, H - 104 * S, W, H], fill=(6, 8, 10, 175))
    text(d, (W / 2, H - 52 * S), cap, 22 * S, bold=True, anchor='mm', halo=False)
    return im

SHOTS = {'where': F_where, 'forecast': F_forecast, 'evac': F_evac, 'stall': F_landfall_stall, 'night': F_night, 'perez': F_perez,
         'dickinson': F_dickinson, 'res_intro': lambda t, W, H, S: F_reservoirs(t, W, H, S, 'all'),
         'res_pools': lambda t, W, H, S: F_reservoirs(t, W, H, S, 'pools'), 'res_release': lambda t, W, H, S: F_reservoirs(t, W, H, S, 'release'),
         'east': F_east, 'observed': F_observed, 'brazos': F_brazos, 'kiley': F_kiley, 'rita': F_rita}

# ---- night map for the sound test: clock driven by narration keyframes (env NIGHT_KEYS = [[sec, "YYYY-mm-dd HH:MM"], ...], NIGHT_DUR)
def F_night_scene(t, W, H, S):
    keys = json.loads(os.environ['NIGHT_KEYS']); dur = float(os.environ['NIGHT_DUR']); sec = t * dur
    ks = [(k[0], dt.datetime.strptime(k[1], '%Y-%m-%d %H:%M')) for k in keys]
    if sec <= ks[0][0]: now = ks[0][1]
    elif sec >= ks[-1][0]: now = ks[-1][1]
    else:
        for (a, ta), (b, tb) in zip(ks, ks[1:]):
            if a <= sec <= b: now = ta + (tb - ta) * ((sec - a) / (b - a)); break
    cam = Cam(-95.02, 29.83, 185, W, H); im, d = base(cam, S, roadset=('I- 10', 'I- 45', 'I- 610'))
    A = asos(); t0 = dt.datetime(2017, 8, 26, 18); tots = {}
    for st in NIGHT_ST:
        s = A[st]; tots[st] = sum(v for (tm, v) in s['obs'] if t0 <= tm <= now and tm.minute >= 50)
        p = cam.ll(s['lon'], s['lat']); r = (9 + tots[st] * 2.2) * S
        dot(d, p, r, rain_col(tots[st] * 2.2) + (235,), ring=(255, 255, 255, 255))
        text(d, (p[0] + r + 8 * S, p[1]), f'{st} {tots[st]:.1f}"', 15 * S, bold=True, anchor='lm')
    label_at(d, cam, -95.369, 29.760, 'Downtown', S, sz=15, mcol=(255, 255, 255))
    clock = now.replace(minute=(now.minute // 10) * 10).strftime('%a, Aug %d · %-I:%M %p').replace('AM', 'a.m.').replace('PM', 'p.m.')
    headline(d, S, clock, 'Inches of rain since 6 p.m. at 5 airport gauges — points, not a flood map')
    if now >= dt.datetime(2017, 8, 26, 21, 27):
        d.rounded_rectangle([40 * S, 140 * S, 600 * S, 196 * S], 10 * S, fill=(170, 30, 40, 235))
        text(d, (60 * S, 168 * S), '9:27 p.m. · FLASH FLOOD EMERGENCY', 16 * S, bold=True, anchor='lm', halo=False)
    credit(d, cam, 'NWS ASOS via Iowa Environmental Mesonet · NWS Service Assessment', S); return im
SHOTS['night_scene'] = F_night_scene

if __name__ == '__main__':
    shot, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    W, H = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (1280, 720)
    if out.endswith('.png'):
        data(); Image.frombytes('RGB', (W, H), render_frame((shot, dur, W, H, 2))).save(out)
    else: render(shot, dur, out, W, H)
