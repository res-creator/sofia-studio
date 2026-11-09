# Тест v3 «Япония»: вступление-обещание, быстрая нарезка 4K-оригиналов Pixabay, кинолук (цвет, зерно, виньетка, полосы),
# название «ニッポン» → «ЯПОНИЯ». Голос Todd (vo_el/), музыка «Do you Shakuhachi» (Antti Luode, CC BY 3.0).
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); RG = os.path.join(D, '..', '..')
sys.path.insert(0, os.path.join(RG, 'lib')); import look
from script import LINES
W, H, FPS = 1920, 1080, 30
if '--4k' in sys.argv: W, H = 3840, 2160
K = W / 1920
DATA = os.path.join(RG, 'data'); V4K = f'{DATA}/pixabay/v4k'
# цвет: глубокие тени с бирюзой, тёплый свет, сочность
GRADE = ('eq=contrast=1.10:saturation=1.22:gamma=0.96,'
         'colorbalance=rs=-0.05:gs=0.0:bs=0.06:rm=0.0:bm=-0.01:rh=0.05:gh=0.02:bh=-0.04')
BAR = int(round(H * 0.095))          # полосы кино ≈ 2,2:1
V0, GAP = 1.0, 0.55

def frames(path, ss, n):
    vf = f'scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS},{GRADE}'
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout or 0)
    slow = max(1.0, min(2.0, (n / FPS) / max(0.5, total - ss - 0.1)))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', path, '-an', '-vf', f'setpts={slow:.3f}*PTS,' + vf, '-frames:v', str(n),
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    last = None
    try:
        for _ in range(n):
            b = p.stdout.read(W * H * 3)
            if len(b) == W * H * 3: last = b
            yield np.frombuffer(last or bytes(W * H * 3), np.uint8).reshape(H, W, 3)
    finally:
        p.stdout.close(); p.kill(); p.wait()

# ---------- тайминг по фразам голоса ----------
durs = json.load(open(f'{D}/vo_el/durs.json')); starts = []; t = V0
for dd in durs: starts.append(t); t += dd + GAP
vo_end = t - GAP
TOTAL = vo_end + LINES[-1].get('hold', 1.0)
ins, flt = [], []
for i in range(len(durs)): ins += ['-i', f'{D}/vo_el/{i:02d}.mp3']; flt.append(f'[{i}:a]adelay={int(starts[i]*1000)}|{int(starts[i]*1000)}[s{i}]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt) + ';' + ''.join(f'[s{i}]' for i in range(len(durs))) +
                f'amix=inputs={len(durs)}:normalize=0[o]', '-map', '[o]', '-ar', '44100', f'{D}/vo_el/all.wav'], check=True)
bounds = [0.0] + [s - 0.15 for s in starts[1:]] + [TOTAL]      # склейка чуть раньше фразы
shots = []
for i, l in enumerate(LINES):
    a, b = bounds[i], bounds[i + 1]; ws = [s[2] for s in l['shots']]; acc = a
    for j, (sid, ss, w) in enumerate(l['shots']):
        d = (b - a) * w / sum(ws)
        shots.append(dict(line=i, t0=acc, dur=d, src=f'{V4K}/{sid}.mp4', ss=ss, id=sid)); acc += d
print('total', round(TOTAL, 1), 'shots', len(shots), [round(s['dur'], 1) for s in shots])

# ---------- кинолук: виньетка + зерно + полосы ----------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIG = (1 - 0.32 * np.clip((r - 0.55) / 0.9, 0, 1) ** 1.6)[..., None]
rng = np.random.default_rng(3)
GRAIN = [rng.normal(0, 5.5, (H // 2, W // 2)).astype(np.float32).repeat(2, 0).repeat(2, 1)[..., None] for _ in range(6)]
def cine(fr, k):
    a = fr.astype(np.float32) * VIG + GRAIN[k % 6]
    a[:BAR] = 0; a[H - BAR:] = 0
    return np.clip(a, 0, 255)

# ---------- название: ニッポン → ЯПОНИЯ ----------
JPF = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', int(150 * K))
SERIF = ImageFont.truetype(os.path.join(DATA, 'fonts', 'CormorantGaramond.ttf'), int(230 * K)); SERIF.set_variation_by_name('Medium')
SUB = look.font(int(30 * K), 500)
def spaced(d, x, y, s, f, track, fill):
    ws = [f.getlength(c) for c in s]; x -= (sum(ws) + track * (len(s) - 1)) / 2
    for c, w in zip(s, ws): d.text((x, y), c, font=f, fill=fill, anchor='lm'); x += w + track
def text_layer(s, f, track, alpha, blur, y):
    lay = Image.new('RGBA', (W, H)); spaced(ImageDraw.Draw(lay), W / 2, y, s, f, track, (250, 246, 238, int(255 * alpha)))
    if blur > 0.3: lay = lay.filter(ImageFilter.GaussianBlur(blur))
    sh = lay.split()[3].filter(ImageFilter.GaussianBlur(20 * K)); dk = Image.new('RGBA', (W, H)); dk.putalpha(sh.point(lambda v: int(v * 0.55)))
    dk.alpha_composite(lay); return dk
T0 = starts[-1] + durs[-1] - 0.2                 # после «Поехали»
def title(img, t):
    u = t - T0
    if u < 0: return
    out = max(0.0, min(1.0, (TOTAL - 0.3 - t) / 0.9))
    e = look.ease
    if u < 2.1:                                   # ニッポン проявляется из размытия
        a = e(min(1.0, u / 0.7)) * (1 - e(max(0.0, (u - 1.5) / 0.6)))
        bl = 14 * K * (1 - min(1.0, u / 0.7)) + 16 * K * e(max(0.0, (u - 1.5) / 0.6))
        img.alpha_composite(text_layer('ニッポン', JPF, 60 * K + 40 * K * e(max(0.0, (u - 1.5) / 0.6)), a, bl, H * 0.47))
    if u > 1.5:                                   # ЯПОНИЯ собирается из размытия
        v = u - 1.5; a = e(min(1.0, v / 0.8)) * out
        img.alpha_composite(text_layer('ЯПОНИЯ', SERIF, (70 - 38 * look.ease_out(min(1.0, v / 2.4))) * K, a, 14 * K * (1 - e(min(1.0, v / 0.8))), H * 0.46))
        if v > 0.9:
            a2 = e(min(1.0, (v - 0.9) / 0.8)) * out
            lay = Image.new('RGBA', (W, H)); spaced(ImageDraw.Draw(lay), W / 2, H * 0.60, 'СКВОЗЬ СТРАНЫ', SUB, 14 * K, (250, 246, 238, int(210 * a2)))
            img.alpha_composite(lay)

out_v = f'{D}/v.mp4'
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out_v], stdin=subprocess.PIPE)
XF = 18; prev = None; gk = 0
for si, s in enumerate(shots):
    n = round((s['t0'] + s['dur']) * FPS) - round(s['t0'] * FPS)
    dissolve = s is shots[-1]                     # мягкий переход только на кадр с названием
    for k, fr in enumerate(frames(s['src'], s['ss'], n)):
        t = (round(s['t0'] * FPS) + k) / FPS
        a = fr
        if dissolve and prev is not None and k < XF: a = (prev.astype(np.float32) * (1 - k / XF) + fr * (k / XF)).astype(np.uint8)
        if t >= T0:
            img = Image.fromarray(a).convert('RGBA'); title(img, t); a = np.asarray(img.convert('RGB'))
        arr = cine(a, gk); gk += 1
        fade = max(0.0, min(1.0, t / 0.6, (TOTAL - t) / 1.0))
        enc.stdin.write((arr * fade).astype(np.uint8).tobytes())
        if not dissolve: prev = fr
enc.stdin.close(); enc.wait()

music = f'{DATA}/music/do_you_shakuhachi.ogg'   # «Do you Shakuhachi», Antti Luode, CC BY 3.0 (Wikimedia Commons)
flt = (f"[1:a]asplit=2[vo][vk];[2:a]atrim=0:{TOTAL:.2f},volume=0.24,afade=t=in:d=1.0,afade=t=out:st={TOTAL-2.5:.2f}:d=2.5[mu];"
       f"[mu][vk]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400[bgd];"
       f"[bgd][vo]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
name = 'japan_test_v4' + ('_4k' if W > 1920 else '') + '.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out_v, '-i', f'{D}/vo_el/all.wav', '-i', music, '-filter_complex', flt,
                '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.2f}', '-movflags', '+faststart', f'{D}/{name}'], check=True)
print('done', name)
