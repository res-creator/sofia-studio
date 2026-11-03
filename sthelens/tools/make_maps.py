# Map bases for the opening: (1) Pacific Northwest locator (Natural Earth), (2) pre-1980 relief of Mount St. Helens
# from the USGS pre-eruption DEM (doi:10.5066/P91W7C1L, ~1952 topography, CC0). Label anchors -> src/data/maps.json
import json, numpy as np, rasterio, shapefile
from rasterio.warp import transform
from PIL import Image, ImageDraw
OUT = {}
# ---------- (2) local relief
r = rasterio.open('assets/raw/dem/msh_pre_eruption_dem_nad83_utm10.tif'); z = r.read(1).astype(float); z[z > 1e30] = np.nan
z = np.where(np.isnan(z), np.nanmin(z), z)
gy, gx = np.gradient(z, 10.0)
def shade(az, alt):
    az, alt = np.radians(az), np.radians(alt); sl = np.arctan(np.hypot(gx, gy)); asp = np.arctan2(-gx, gy)
    return np.clip(np.sin(alt) * np.cos(sl) + np.cos(alt) * np.sin(sl) * np.cos(az - asp), 0, 1)
hs = 0.7 * shade(315, 40) + 0.3 * shade(20, 55)
t = np.clip((z - 400) / (2950 - 400), 0, 1)
low, mid, high = np.array([46, 58, 46]), np.array([92, 92, 80]), np.array([205, 205, 200])  # forest-dark -> rock -> pale summit
col = np.where(t[..., None] < 0.55, low + (mid - low) * (t[..., None] / 0.55), mid + (high - mid) * ((t[..., None] - 0.55) / 0.45))
lake = (np.hypot(gx, gy) < 0.02) & (z > 950) & (z < 1000)
img = col * (0.35 + 0.85 * hs[..., None]); img[lake] = [38, 58, 74]
img[np.isnan(r.read(1, masked=True).filled(np.nan))] = [22, 26, 24]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('public/map/relief_pre1980.jpg', quality=92)
H, Wd = z.shape
def px(lon, lat):
    x, y = transform('EPSG:4326', r.crs, [lon], [lat]); i, j = r.index(x[0], y[0]); return [round(j / Wd, 4), round(i / H, 4)]
i, j = np.unravel_index(np.argmax(z), z.shape)
OUT['relief'] = {'w': Wd, 'h': H, 'km_per_px': 0.01,
                 'summit': [round(j / Wd, 4), round(i / H, 4)], 'summit_ft': round(float(z.max()) * 3.28084),
                 'spirit_lake': px(-122.1375, 46.2753), 'coldwater2': px(-122.2165, 46.2766),
                 'north_flank': px(-122.1905, 46.2075)}
# ---------- (1) region locator, equirectangular, lon -125.5..-115.5, lat 44.2..49.3
L0, L1, B0, B1 = -125.5, -115.5, 44.2, 49.3; W, Hh = 3840, int(3840 * (B1 - B0) / ((L1 - L0) * np.cos(np.radians(46.8))))
im = Image.new('RGB', (W, Hh), (18, 30, 40)); d = ImageDraw.Draw(im)
P = lambda lo, la: ((lo - L0) / (L1 - L0) * W, (B1 - la) / (B1 - B0) * Hh)
sf = shapefile.Reader('assets/raw/ne/ne_10m_admin_1_states_provinces_lakes')
recs = sf.records(); flds = [f[0] for f in sf.fields[1:]]
for sh, rec in zip(sf.shapes(), recs):
    a = dict(zip(flds, rec)); 
    if a['admin'] not in ('United States of America', 'Canada'): continue
    pts = sh.points; parts = list(sh.parts) + [len(pts)]
    fill = (58, 64, 58) if a['name'] in ('Washington', 'Oregon') else (40, 46, 44)
    for k in range(len(parts) - 1):
        d.polygon([P(*p) for p in pts[parts[k]:parts[k + 1]]], fill=fill, outline=(120, 124, 116))
im.save('public/map/region.jpg', quality=92)
Q = lambda lo, la: [round(P(lo, la)[0] / W, 4), round(P(lo, la)[1] / Hh, 4)]
OUT['region'] = {'w': W, 'h': Hh, 'msh': Q(-122.1919, 46.1978), 'seattle': Q(-122.335, 47.608), 'portland': Q(-122.676, 45.523), 'vancouver': Q(-122.661, 45.639),
                 'wa_label': Q(-120.6, 47.5), 'or_label': Q(-120.6, 44.6)}
json.dump(OUT, open('src/data/maps.json', 'w'), indent=1); print(json.dumps(OUT))
