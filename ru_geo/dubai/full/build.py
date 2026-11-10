# Сборка выпуска (шаблон full2; сейчас — «Дубай»). Картинка рендерится кусками параллельно (--jobs), затем склейка и звук.
#   python3 build.py [--4k] [--jobs 4]
import json, os, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.join(D, '..'); RG = os.path.join(J, '..')
sys.path.insert(0, os.path.join(RG, 'lib')); import look, motion
import plan
W, H, FPS = (3840, 2160, 30) if '--4k' in sys.argv else (1920, 1080, 30)
K = W / 1920; TAG = ('4k' if W > 1920 else '1080p')
SEG = os.path.join(RG, 'data', 'pixabay', 'seg'); DATA = os.path.join(RG, 'data')
GRADE = 'eq=contrast=1.10:saturation=1.22:gamma=0.96,colorbalance=rs=-0.05:bs=0.06:bm=-0.01:rh=0.05:gh=0.02:bh=-0.04'
BAR = int(round(H * 0.095))
# финал 4K: HEVC 10 бит ≈ 20 Мбит/с с тегом hvc1 (как рекомендует YouTube); черновик 1080p — H.264
VENC = (['-c:v', 'libx265', '-preset', 'fast', '-crf', '20', '-x265-params', 'vbv-maxrate=20000:vbv-bufsize=40000:log-level=error',
         '-pix_fmt', 'yuv420p10le', '-tag:v', 'hvc1'] if W > 1920 else
        ['-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '14M', '-bufsize', '28M', '-pix_fmt', 'yuv420p'])
P = plan.build(); SEGS = P['segs']; END = P['END']; T0 = P['t_title']
UNTIL = float(sys.argv[sys.argv.index('--until') + 1]) if '--until' in sys.argv else None
if UNTIL:
    SEGS = [s for s in SEGS if s['t0'] < UNTIL]; SEGS[-1] = dict(SEGS[-1], dur=UNTIL - SEGS[-1]['t0']); END = UNTIL
    P['voice'] = [v for v in P['voice'] if v[0] < UNTIL - 1]; TAG_SUFFIX = '_test'
else: TAG_SUFFIX = ''
T_TITLE = next((s['t0'] for s in SEGS if s.get('title2')), P['t_title'])

def frames(path, n):
    vf = f'scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS},{GRADE}'
    total = plan.dur(path); slow = max(1.0, min(2.0, (n / FPS) / max(0.5, total - 0.1)))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-an', '-vf', f'setpts={slow:.3f}*PTS,' + vf, '-frames:v', str(n),
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    last = None
    try:
        for _ in range(n):
            b = p.stdout.read(W * H * 3)
            if len(b) == W * H * 3: last = b
            yield np.frombuffer(last or bytes(W * H * 3), np.uint8).reshape(H, W, 3)
    finally:
        p.stdout.close(); p.kill(); p.wait()

def photo_grade(a):
    a = a.astype(np.float32); l = a.mean(axis=2, keepdims=True)
    a = l + (a - l) * 1.15; a = (a - 128) * 1.06 + 124
    a[..., 2] += np.where(l[..., 0] < 90, 6, -4); a[..., 0] += np.where(l[..., 0] > 160, 5, -3)
    return np.clip(a, 0, 255).astype(np.uint8)

# ---------- надписи ----------
SERIF_PATH = os.path.join(DATA, 'fonts', 'CormorantGaramond.ttf')
def serif(sz):
    f = ImageFont.truetype(SERIF_PATH, int(sz * K)); f.set_variation_by_name('Medium'); return f
TITLE_F, CARD_F, SUB = serif(230), serif(118), look.font(int(28 * K), 500)
HF = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', int(98 * K))
def spaced(d, x, y, s, f, track, fill, anchor='m'):
    ws = [f.getlength(c) for c in s]; tw = sum(ws) + track * (len(s) - 1)
    if anchor == 'm': x -= tw / 2
    for c, w in zip(s, ws): d.text((x, y), c, font=f, fill=fill, anchor='lm'); x += w + track
    return tw
def shadow(lay, k=0.55):
    sh = lay.split()[3].filter(ImageFilter.GaussianBlur(20 * K)); dk = Image.new('RGBA', (W, H)); dk.putalpha(sh.point(lambda v: int(v * k)))
    dk.alpha_composite(lay); return dk
def make_hanko():
    """Печать страны: скруглённый квадрат цвета plan.SEAL, надпись вырезана (белое на цветном), неровная краска."""
    S = int(240 * K); im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((6 * K, 6 * K, S - 6 * K, S - 6 * K), radius=int(22 * K), fill=plan.SEAL['color'] + (255,))
    m = Image.new('L', (S, S), 255); dm = ImageDraw.Draw(m)
    dm.rounded_rectangle((20 * K, 20 * K, S - 20 * K, S - 20 * K), radius=int(12 * K), outline=0, width=int(5 * K))
    f = ImageFont.truetype(os.path.join(DATA, 'fonts', plan.SEAL['font']), int(110 * K), layout_engine=ImageFont.Layout.RAQM)
    try: f.set_variation_by_axes([800])
    except Exception: pass
    dm.text((S / 2, S * 0.47), plan.SEAL['text'], font=f, fill=0, anchor='mm')
    a = np.asarray(im.split()[3], np.float32) * (np.asarray(m, np.float32) / 255)
    rng2 = np.random.default_rng(11)
    ink = np.clip(1.0 - np.maximum(0, rng2.normal(0, 0.25, (S // 6 + 1, S // 6 + 1))).repeat(6, 0).repeat(6, 1)[:S, :S] * 0.6, 0.35, 1)
    im.putalpha(Image.fromarray((a * ink).astype(np.uint8))); return im.rotate(-4, resample=Image.BICUBIC, expand=True)
HANKO = make_hanko(); e = look.ease
def title(img, t):
    u = t - T0
    if u < 0 or t > P['intro_end'] + 0.1: return
    out = max(0.0, min(1.0, (P['intro_end'] - 0.2 - t) / 0.9)); a = e(min(1.0, u / 0.9)) * out
    track = (64 - 34 * look.ease_out(min(1.0, u / 1.3))) * K
    base = sum(TITLE_F.getlength(c) for c in 'ЯПОНИЯ'); tw = base + 30 * K * 5; hs = HANKO.size[0] * 0.80; gap = 40 * K
    x0 = W / 2 - (tw + gap + hs) / 2
    lay = Image.new('RGBA', (W, H)); spaced(ImageDraw.Draw(lay), x0 + (tw - (base + track * 5)) / 2, H * 0.46, 'ЯПОНИЯ', TITLE_F, track, (250, 246, 238, int(255 * a)), 'l')
    if u < 0.9: lay = lay.filter(ImageFilter.GaussianBlur(12 * K * (1 - e(u / 0.9))))
    img.alpha_composite(shadow(lay))
    v = u - 1.25
    if v > 0:
        sc = 0.80 * (1 + 0.7 * (1 - look.ease_out(min(1.0, v / 0.16)))); ha = min(1.0, v / 0.08) * out
        hk = HANKO.resize((int(HANKO.size[0] * sc), int(HANKO.size[1] * sc)), Image.LANCZOS); hk.putalpha(hk.split()[3].point(lambda p: int(p * ha)))
        img.alpha_composite(hk, (int(x0 + tw + gap + hs / 2 - hk.size[0] / 2), int(H * 0.46 - hk.size[1] / 2)))
    if u > 1.8:
        a2 = e(min(1.0, (u - 1.8) / 0.8)) * out
        lay = Image.new('RGBA', (W, H)); spaced(ImageDraw.Draw(lay), W / 2, H * 0.61, 'СКВОЗЬ СТРАНЫ', SUB, 14 * K, (250, 246, 238, int(210 * a2))); img.alpha_composite(lay)
_dm = Image.new('L', (W // 4, H // 4), 0); ImageDraw.Draw(_dm).ellipse((W * 0.02, H * 0.055, W * 0.23, H * 0.195), fill=175)
DIM = _dm.filter(ImageFilter.GaussianBlur(30 * K)).resize((W, H), Image.BILINEAR)
def card(img, t):
    for c in P['cards']:
        u = t - c['t'] - 0.3; L = plan.CARD + 1.4
        if 0 <= u <= L:
            a = e(min(1.0, u / 0.8)) * e(min(1.0, (L - u) / 0.7))
            dim = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dim.putalpha(DIM.point(lambda p: int(p * a))); img.alpha_composite(dim)
            lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
            spaced(d, W / 2, H * 0.40, f'ГЛАВА {c["ch"]}', SUB, 16 * K, (250, 246, 238, int(220 * a)))
            tr = (22 + 10 * (1 - look.ease_out(min(1.0, u / 2.0)))) * K
            fit = CARD_F; wd = sum(fit.getlength(ch) for ch in c['name']) + 32 * K * (len(c['name']) - 1)
            if wd > W * 0.78: fit = serif(118 * W * 0.78 / wd); tr *= W * 0.78 / wd
            spaced(d, W / 2, H * 0.50, c['name'], fit, tr, (250, 246, 238, int(255 * a)))
            hk = HANKO.resize((int(HANKO.size[0] * 0.28), int(HANKO.size[1] * 0.28)), Image.LANCZOS)
            hk.putalpha(hk.split()[3].point(lambda p: int(p * a)))
            if u > 0.5: lay.alpha_composite(hk, (int(W / 2 - hk.size[0] / 2), int(H * 0.60)))
            img.alpha_composite(shadow(lay, 0.85))

# ---------- новые приёмы (правила канала, свой дизайн) ----------
HAND = ImageFont.truetype(os.path.join(DATA, 'fonts', 'Caveat.ttf'), int(88 * K)); HAND.set_variation_by_axes([700])
TEALC = (40, 220, 200)
def cap_plate(img, text, u, L):
    """Подпись места слева внизу: матовое стекло, тонкая рамка, бирюзовая черта."""
    a = e(min(1.0, u / 0.5)) * e(min(1.0, (L - u) / 0.5))
    if a <= 0: return
    f = look.font(int(30 * K), 600); tr = 6 * K; tw = sum(f.getlength(c) for c in text) + tr * (len(text) - 1)
    x0, y1 = int(70 * K), int(H - BAR - 46 * K); h = int(64 * K); w = int(tw + 64 * K); y0 = y1 - h
    reg = img.crop((x0, y0, x0 + w, y1)).filter(ImageFilter.GaussianBlur(14 * K))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=int(10 * K), fill=int(255 * a))
    tint = Image.new('RGBA', (w, h), (12, 16, 20, int(110 * a))); reg = reg.convert('RGBA'); reg.alpha_composite(tint); reg.putalpha(m)
    img.alpha_composite(reg, (x0, y0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle((x0, y0, x0 + w - 1, y1 - 1), radius=int(10 * K), outline=(255, 250, 240, int(80 * a)), width=max(1, int(1.5 * K)))
    d.rectangle((x0 + int(18 * K), y0 + int(16 * K), x0 + int(22 * K), y1 - int(16 * K)), fill=TEALC + (int(255 * a),))
    x = x0 + int(38 * K)
    for c in text:
        d.text((x, y0 + h / 2), c, font=f, fill=(255, 250, 240, int(245 * a)), anchor='lm'); x += f.getlength(c) + tr
def note(img, n, t):
    """Рукописная пометка: текст появляется, стрелка дорисовывается."""
    u = t - n['t']
    if not 0 <= u <= n['dur']: return
    a = e(min(1.0, u / 0.3)) * e(min(1.0, (n['dur'] - u) / 0.35))
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    x, y = n['xy'][0] * W, n['xy'][1] * H; d.text((x, y), n['text'], font=HAND, fill=(255, 255, 255, int(255 * a)), anchor='lm')
    bx = HAND.getbbox(n['text']); sx, sy = x + (bx[2] - bx[0]) * 0.2, y + 50 * K; ex, ey = n['to'][0] * W, n['to'][1] * H
    k = e(min(1.0, max(0.0, (u - 0.25) / 0.6))); pts = []
    for i in range(41):
        q = i / 40 * k; cx, cy = (sx + ex) / 2 - 80 * K, (sy + ey) / 2          # мягкая дуга
        pts.append(((1 - q) ** 2 * sx + 2 * (1 - q) * q * cx + q * q * ex, (1 - q) ** 2 * sy + 2 * (1 - q) * q * cy + q * q * ey))
    if k > 0.02: d.line(pts, fill=(255, 255, 255, int(255 * a)), width=int(6 * K), joint='curve')
    if k > 0.97:
        (px, py), (qx, qy) = pts[-4], pts[-1]; ang = np.arctan2(qy - py, qx - px)
        for sgn in (-1, 1):
            b = ang + np.pi + sgn * 0.5; d.line((qx, qy, qx + 34 * K * np.cos(b), qy + 34 * K * np.sin(b)), fill=(255, 255, 255, int(255 * a)), width=int(6 * K))
    sh = lay.split()[3].filter(ImageFilter.GaussianBlur(8 * K)); dk = Image.new('RGBA', (W, H)); dk.putalpha(sh.point(lambda v: int(v * .6)))
    img.alpha_composite(dk); img.alpha_composite(lay)
def numcard(img, c, t):
    """Карточка с цифрой по центру: цифра всплывает, подпись выезжает."""
    u = t - c['t']
    if not 0 <= u <= c['dur']: return
    a = e(min(1.0, u / 0.35)) * e(min(1.0, (c['dur'] - u) / 0.4)); sc = 0.85 + 0.15 * look.ease_out(min(1.0, u / 0.5))
    lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
    fb = look.font(int(170 * K * sc), 900); d.text((W / 2, H * 0.45), c['big'], font=fb, fill=(255, 250, 240, int(255 * a)), anchor='mm')
    fs = look.font(int(36 * K), 700); tw = fs.getlength(c['small']) + 8 * K * len(c['small']); y = H * 0.58; sl = (1 - look.ease_out(min(1.0, max(0, u - 0.25) / 0.5))) * 60 * K
    d.rounded_rectangle((W / 2 - tw / 2 - 26 * K, y - 34 * K + sl, W / 2 + tw / 2 + 26 * K, y + 34 * K + sl), radius=int(8 * K), fill=TEALC + (int(235 * a),))
    spaced(d, W / 2, y + sl, c['small'], fs, 8 * K, (10, 20, 24, int(255 * a)))
    dim = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dim.putalpha(DIM.point(lambda p: int(p * a * 0.9))); img.alpha_composite(dim)
    sh = lay.split()[3].filter(ImageFilter.GaussianBlur(18 * K)); dk = Image.new('RGBA', (W, H)); dk.putalpha(sh.point(lambda v: int(v * .55)))
    img.alpha_composite(dk); img.alpha_composite(lay)
_WM = {}
def window(fr, u, L):
    """«Окно»: кадр в рамке со скруглёнными углами на чёрном фоне, медленно приближается."""
    sc = 0.80 + 0.05 * (u / max(L, 0.1)); w, h = int(W * sc), int(H * sc)
    im = Image.fromarray(fr).resize((w, h), Image.BILINEAR)
    if (w, h) not in _WM:
        m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=int(34 * K), fill=255); _WM[(w, h)] = m
    out = Image.new('RGB', (W, H), (0, 0, 0)); x, y = (W - w) // 2, (H - h) // 2
    glow = Image.new('L', (W, H), 0); glow.paste(_WM[(w, h)], (x, y)); glow = glow.filter(ImageFilter.GaussianBlur(40 * K)).point(lambda v: int(v * .25))
    out.paste(Image.new('RGB', (W, H), (40, 60, 70)), (0, 0), glow); out.paste(im, (x, y), _WM[(w, h)]); return np.asarray(out)
def title2(fr, t):
    """Название за мостом: кадр из ч/б заливается цветом, буквы проявляются из размытия и стоят ЗА фермой моста и поездом."""
    u = t - T_TITLE; a = fr.astype(np.float32)
    g = a.mean(axis=2, keepdims=True); col = e(min(1.0, max(0.0, (u - 0.4) / 2.2))); a = g + (a - g) * col
    sky = ((a[..., 2] - a[..., 0]) > 28 * (0.4 + 0.6 * col)) & (a[..., 2] > 80)
    mk = Image.fromarray((sky * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2 * K))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
    if u > 0.2:
        al = e(min(1.0, (u - 0.2) / 1.1)) * max(0.0, min(1.0, (P['intro_end'] - 0.3 - t) / 0.9))
        track = (60 - 30 * look.ease_out(min(1.0, (u - 0.2) / 1.8))) * K
        lay = Image.new('RGBA', (W, H)); spaced(ImageDraw.Draw(lay), W / 2, H * 0.36, plan.TITLE, serif(250), track, (255, 252, 244, int(255 * al)))
        if u < 1.3: lay = lay.filter(ImageFilter.GaussianBlur(14 * K * (1 - e((u - 0.2) / 1.1))))
        la = np.asarray(lay.split()[3], np.float32) * np.asarray(mk, np.float32) / 255; lay.putalpha(Image.fromarray(la.astype(np.uint8)))
        img.alpha_composite(lay)
        v = u - 2.0
        if v > 0:
            sc = 0.55 * (1 + 0.7 * (1 - look.ease_out(min(1.0, v / 0.16)))); ha = min(1.0, v / 0.08) * al
            hk = HANKO.resize((int(HANKO.size[0] * sc), int(HANKO.size[1] * sc)), Image.LANCZOS); hk.putalpha(hk.split()[3].point(lambda p: int(p * ha)))
            img.alpha_composite(hk, (int(W * 0.80 - hk.size[0] / 2), int(H * 0.20 - hk.size[1] / 2)))
        if u > 2.6:
            a2 = e(min(1.0, (u - 2.6) / 0.8)) * al
            l2 = Image.new('RGBA', (W, H)); spaced(ImageDraw.Draw(l2), W / 2, H * 0.84, 'СКВОЗЬ СТРАНЫ', SUB, 14 * K, (255, 252, 244, int(230 * a2)))
            img.alpha_composite(shadow(l2, 0.7))
    return np.asarray(img.convert('RGB'))

def shake(t):
    v = t - T_TITLE - 2.0; return int(5 * K * np.sin(v * 60) * (1 - v / 0.25)) if 0 <= v < 0.25 else 0

# ---------- рендер куска ----------
def render(job):
    k, i0, i1 = job; out = f'{D}/part_{TAG}{TAG_SUFFIX}_{k:02d}.mp4'; tmp = out + '.tmp.mp4'
    if os.path.exists(out): return out          # кусок уже готов (продолжение после перезапуска машины)
    vf = f'vignette=angle=PI/5,noise=alls=5:allf=t,drawbox=x=0:y=0:w=iw:h={BAR}:color=black:t=fill,drawbox=x=0:y=ih-{BAR}:w=iw:h={BAR}:color=black:t=fill'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-vf', vf,
                            *VENC, tmp], stdin=subprocess.PIPE)
    XF = 15; prev = None
    for si in range(i0, i1):
        s = SEGS[si]; f0 = round(s['t0'] * FPS); n = round((s['t0'] + s['dur']) * FPS) - f0
        if s.get('img'):   # фото Commons: плавное движение камеры + тот же цвет
            src = (np.frombuffer(x, np.uint8).reshape(H, W, 3) for x in motion.frames(os.path.join(DATA, 'commons_img', s['ss']), n / FPS, mode='auto', W=W, H=H, FPS=FPS, seed=si, fit='auto'))
            src = (photo_grade(x) for x in src)
        else:
            src = frames(f'{SEG}/{s["id"]}_{s["ss"]}.mp4', n)
        for j, fr in enumerate(src):
            t = (f0 + j) / FPS; a = fr
            if s['dis'] and prev is not None and j < XF: a = (prev.astype(np.float32) * (1 - j / XF) + fr * (j / XF)).astype(np.uint8)
            if s.get('title2'): a = title2(a, t)
            if s.get('win'): a = window(a, j / FPS, s['dur'])
            act_n = [n for n in P['notes'] if 0 <= t - n['t'] <= n['dur']]; act_c = [c for c in P['numcards'] if 0 <= t - c['t'] <= c['dur']]
            if s.get('loc') or act_n or act_c or any(0 <= t - c['t'] - 0.3 <= plan.CARD + 1.4 for c in P['cards']):
                img = Image.fromarray(a).convert('RGBA'); card(img, t)
                if s.get('loc') and j / FPS > 0.3: cap_plate(img, s['loc'], j / FPS - 0.3, min(s['dur'], 4.0) - 0.3)
                for n in act_n: note(img, n, t)
                for c in act_c: numcard(img, c, t)
                a = np.asarray(img.convert('RGB'))
            dy = shake(t)
            if dy: a = np.roll(a, dy, axis=0)
            fade = min(1.0, t / 0.6, (END - t) / 2.0)
            if fade < 1: a = (a.astype(np.float32) * max(0.0, fade)).astype(np.uint8)
            enc.stdin.write(np.ascontiguousarray(a).tobytes())
        prev = fr if not s['dis'] or True else prev
    enc.stdin.close(); enc.wait(); os.replace(tmp, out); return out

if __name__ == '__main__':
    jobs = int(sys.argv[sys.argv.index('--jobs') + 1]) if '--jobs' in sys.argv else 4
    # границы кусков — только на кадрах без растворения
    nparts = jobs * 4                              # мелкие куски: после перезапуска машины теряется меньше
    tot = sum(s['dur'] for s in SEGS); cuts = [0]; acc = 0
    for i, s in enumerate(SEGS):
        if acc >= tot * len(cuts) / nparts and not s['dis'] and i > cuts[-1]: cuts.append(i)
        acc += s['dur']
    cuts.append(len(SEGS)); parts = [(k, cuts[k], cuts[k + 1]) for k in range(len(cuts) - 1)]
    print('parts', parts, flush=True)
    if '--audio-only' not in sys.argv:
        with ProcessPoolExecutor(jobs) as ex: outs = list(ex.map(render, parts))
        open(f'{D}/parts.txt', 'w').write(''.join(f"file '{o}'\n" for o in outs))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/parts.txt', '-c', 'copy', f'{D}/v_{TAG}{TAG_SUFFIX}.mp4'], check=True)
        for o in outs: os.remove(o)
    # ---------- звук ----------
    ins, flt = [], []
    for k, (t, f) in enumerate(P['voice']):
        ins += ['-i', f]; ms = int(t * 1000); flt.append(f'[{k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay={ms}|{ms}[v{k}]')
    nv = len(P['voice'])
    flt.append(''.join(f'[v{k}]' for k in range(nv)) + f'amix=inputs={nv}:normalize=0,apad=whole_dur={END:.2f},asplit=2[vo][vk]')
    chs = [c for c in sorted(plan.MUSIC) if c in P['chap_t'] and P['chap_t'][c] < END - 1]; starts = {c: P['chap_t'][c] for c in chs}; mk = []
    for j, c in enumerate(chs):
        a = max(0.0, starts[c] - (1.5 if c else 0)); z = (starts[chs[j + 1]] + 1.5) if j + 1 < len(chs) else END
        fn, g, off = plan.MUSIC[c]; idx = nv + j; ins += ['-stream_loop', '-1', '-ss', str(off), '-i', f'{plan.MUS}/{fn}']; L = z - a; ms = int(a * 1000)
        flt.append(f'[{idx}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:{L:.2f},asetpts=PTS-STARTPTS,volume={g},'
                   f'afade=t=in:d={0.8 if c == 0 else 2.5}:curve=qsin,afade=t=out:st={L-3.5:.2f}:d=3.5:curve=qsin,adelay={ms}|{ms}[m{j}]'); mk.append(f'[m{j}]')
    flt.append(''.join(mk) + f'amix=inputs={len(mk)}:normalize=0[mu]')
    flt.append('[mu][vk]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400[bgd]')
    flt.append(f'[bgd][vo]amix=inputs=2:normalize=0,atrim=0:{END:.2f},loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[a]', '-ar', '48000', '-c:a', 'aac', '-b:a', '320k', f'{D}/a.m4a'], check=True)
    out = f'{D}/japan_{TAG}{TAG_SUFFIX}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/v_{TAG}{TAG_SUFFIX}.mp4', '-i', f'{D}/a.m4a', '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest',
                    '-movflags', '+faststart', out], check=True)
    print('done', out, flush=True)
