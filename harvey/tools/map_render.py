# Renders map shots for the final cut at 1920x1080: the maps_v4 shots (drawn at 2560x1440, S=2, then downsampled)
# plus 'sat_dams' — the satellite-style zoom the owner picked (demo option 1): Gulf coast -> the two dams on the
# NOAA aerial of Aug 30, 2017, with the pools (elevation estimate) and Buffalo Bayou drawing itself.
# Usage: python3 map_render.py SHOT DUR OUT.mp4   (env NIGHT_KEYS / NIGHT_DUR for night_scene)
import sys, os, math, subprocess
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import maps_v4 as m
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
W, H, FPS = 1920, 1080, 25
def ease(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
def seg(t, a, b): return ease((t - a) / (b - a))
_P = None
def pools_rgba():
    global _P
    if _P is None:
        from scipy import ndimage
        E, PA, PB, Z, X0, Y0 = m.pools(); a = np.zeros(PA.shape + (4,), np.uint8)
        for M in (PA, PB):
            a[M] = (40, 150, 255, 255); e = M & ~ndimage.binary_erosion(M, iterations=3); a[e] = (150, 225, 255, 255)
        _P = (a, Z, X0, Y0)
    return _P
def glow_line(im, cam, parts, col, w, blur=10):
    g = Image.new('RGBA', im.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(g); m.line(gd, cam, parts, col + (255,), w * 3)
    g = g.filter(ImageFilter.GaussianBlur(blur)); im.paste(g, (0, 0), g); im.paste(g, (0, 0), g)
    d = ImageDraw.Draw(im, 'RGBA'); m.line(d, cam, parts, col + (255,), w); m.line(d, cam, parts, (255, 255, 255, 210), max(1, w // 3))
def F_sat_dams(t, W, H, S):
    k = ease(min(1, t / 0.55))
    span = math.exp(math.log(700) + (math.log(25) - math.log(700)) * k)
    lon = -95.4 + (-95.625 + 95.4) * k; lat = 29.3 + (29.775 - 29.3) * k
    c = m.Cam(lon, lat, span, W, H); im, d = m.base(c, S, counties=span > 200)
    if span < 140:
        aim, z, x0, y0 = m.aerial(); a = min(1, (140 - span) / 80); m.raster_overlay(im, c, aim, z, x0, y0, alpha=a)
        im = Image.blend(im, Image.new('RGB', (W, H), (5, 10, 18)), 0.30 * a)
    if t > 0.58:
        a, z, x0, y0 = pools_rgba(); al = seg(t, 0.58, 0.72); pa = a.copy(); pa[..., 3] = (pa[..., 3].astype(np.float32) * 0.38 * al).astype(np.uint8)
        m.raster_overlay(im, c, Image.fromarray(pa, 'RGBA'), z, x0, y0)
        kk = seg(t, 0.6, 0.92); parts = [p[: max(2, int(len(p) * kk))] for p in m.data()['linear'].get('Buffalo Byu', []) if len(p) > 1]
        if kk > 0.02: glow_line(im, c, parts, (90, 200, 255), int(4 * S), int(8 * S))
    d = ImageDraw.Draw(im, 'RGBA')
    if t < 0.45: m.label_at(d, c, -95.369, 29.760, 'HOUSTON', S, a=1 - seg(t, 0.35, 0.45), sz=20, bold=True, mcol=(255, 255, 255))
    if t > 0.66:
        a = seg(t, 0.66, 0.76)
        for lon_, lat_, n, dx, anc in ((-95.6236, 29.7909, 'ADDICKS DAM', 18, 'ls'), (-95.6468, 29.7699, 'BARKER DAM', -18, 'rs')):
            p = c.ll(lon_, lat_); r = 12 * S; d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], outline=(255, 170, 60, int(255 * a)), width=int(4 * S))
            m.text(d, (p[0] + dx * S, p[1] - 10 * S), n, 16 * S, bold=True, alpha=a, anchor=anc)
        p = c.ll(-95.555, 29.752); m.text(d, (p[0], p[1] + 34 * S), 'Buffalo Bayou → downtown', 14 * S, fill=(150, 215, 255), alpha=seg(t, 0.8, 0.9), anchor='mm')
    if t > 0.6: m.text(d, (40 * S, H - 60 * S), 'Blue: land below the record pool level · elevation estimate, not a surveyed flood line', 13 * S, alpha=seg(t, 0.6, 0.7))
    m.credit(d, c, 'NOAA NGS aerial, Aug 30, 2017 · USGS 3DEP · Census TIGER', S)
    return im
m.SHOTS['sat_dams'] = F_sat_dams
def frame(args):
    shot, t = args
    im = m.SHOTS[shot](t, 2560, 1440, 2)
    return im.convert('RGB').resize((W, H), Image.LANCZOS).tobytes()
if __name__ == '__main__':
    shot, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    m.data(); n = max(2, int(round(dur * FPS)))
    if out.endswith('.png'):
        Image.frombytes('RGB', (W, H), frame((shot, dur))).save(out); sys.exit()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', out + '.part.mp4'], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for b in pool.imap(frame, [(shot, i / (n - 1)) for i in range(n)], chunksize=2): p.stdin.write(b)
    p.stdin.close(); p.wait(); os.replace(out + '.part.mp4', out)
