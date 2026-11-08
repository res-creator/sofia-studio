# Сборка теста «Япония» (~1 мин): кадры Pixabay/Mixkit, наложения (дата, сейсмограф, подписи мест, название),
# тестовый голос, музыка Mixkit, гул землетрясения (синтез ffmpeg). Стиль — ../../TERRA_STYLE.md.
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); RG = os.path.join(D, '..', '..')
sys.path.insert(0, os.path.join(RG, 'lib')); import look
from script import LINES
W, H, FPS = 1920, 1080, 30
DATA = os.path.join(RG, 'data'); PX = json.load(open(f'{RG}/iceland/rework/pix_pool.json')); MK = json.load(open(f'{RG}/iceland/rework/mixkit_db.json'))['v']
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
V0 = 2.2                     # голос вступает после того, как напечаталась дата
GRADE = 'eq=contrast=1.05:saturation=1.18:gamma=1.0'

def src(kind, i):
    p = f'{DATA}/pixabay/v/{i}.mp4' if kind == 'px' else f'{DATA}/mixkit/{i}.mp4'
    if not (os.path.exists(p) and os.path.getsize(p) > 50000):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        url = PX[str(i)]['url'] if kind == 'px' else MK[str(i)]['mp4']
        subprocess.run(['curl', '-sS', '-L', '-A', UA, '-o', p, url], check=True)
    return p

def frames(path, ss, n, shake=False):
    vf = f'scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS},{GRADE}'
    if shake: vf = f'scale={int(W*1.06)}:{int(H*1.06)}:force_original_aspect_ratio=increase,crop={W}:{H}:(iw-{W})/2+28*sin(t*47)*min(1\\,t/1.2):(ih-{H})/2+20*cos(t*39)*min(1\\,t/1.2),fps={FPS},{GRADE}'
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout or 0)
    slow = max(1.0, min(2.0, (n / FPS) / max(0.5, total - ss - 0.1)))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', path, '-an', '-vf', f'setpts={slow:.3f}*PTS,' + vf, '-frames:v', str(n),
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    last = None
    for _ in range(n):
        b = p.stdout.read(W * H * 3)
        if len(b) == W * H * 3: last = b
        yield np.frombuffer(last or bytes(W * H * 3), np.uint8).reshape(H, W, 3)
    p.stdout.close(); p.kill(); p.wait()

# ---------- тайминг: фразы по границам предложений голоса ----------
sb = json.load(open(f'{D}/vo/sentences.json')); k = 0; starts = []
for l in LINES:
    starts.append(V0 + sb[k][0]); k += sum(l['text'].count(c) for c in '.?!')
vo_end = V0 + sb[-1][0] + sb[-1][1]
TOTAL = vo_end + LINES[-1].get('hold', 1.0)
bounds = [0.0] + starts[1:] + [TOTAL]
shots = []
for i, l in enumerate(LINES):
    a, b = bounds[i], bounds[i + 1]; ws = [s[3] for s in l['shots']]; acc = a
    for j, s in enumerate(l['shots']):
        d = (b - a) * ws[j] / sum(ws)
        shots.append(dict(line=i, t0=acc, dur=d, src=src(s[0], s[1]), ss=s[2], kind=s[0], id=s[1], first=j == 0)); acc += d
print('total', round(TOTAL, 1), 'shots', len(shots), [round(s['dur'], 1) for s in shots])

# ---------- наложения ----------
SERIF = os.path.join(DATA, 'fonts', 'CormorantGaramond.ttf')
def serif(sz, w='Medium'):
    f = ImageFont.truetype(SERIF, sz); f.set_variation_by_name(w); return f
def spaced(d, x, y, s, f, track, fill, anchor='l'):
    ws = [f.getlength(c) for c in s]; tw = sum(ws) + track * (len(s) - 1)
    if anchor == 'm': x -= tw / 2
    for c, w in zip(s, ws): d.text((x, y), c, font=f, fill=fill, anchor='lm'); x += w + track
    return tw
rng = np.random.default_rng(7); NOISE = rng.standard_normal(4000)
def seis_amp(t):
    tq = starts[2] + 0.8                                # толчок — на словах про плиту
    if t < tq: return 6
    if t < tq + 1.6: return 6 + 200 * (t - tq) / 1.6
    return 6 + 200 * math.exp(-(t - tq - 1.6) / 2.4)
def overlay(img, t):
    d = ImageDraw.Draw(img); li = max(i for i in range(len(LINES)) if bounds[i] <= t)
    # дата печатается, как на телетайпе
    stamp = LINES[0]['stamp']; n = int(min(len(stamp), max(0, (t - 0.4) / 0.07)))
    a = 1.0 if t < starts[2] else max(0.0, 1 - (t - starts[2]) / 0.6)
    if a > 0 and n:
        f = look.font(84, 300); x = 120; y = H - 260
        lay = Image.new('RGBA', img.size); dl = ImageDraw.Draw(lay)
        tw = spaced(dl, x, y, stamp[:n], f, 10, (255, 255, 255, int(255 * a)))
        if int(t * 2) % 2 == 0 or n < len(stamp): dl.rectangle((x + tw + 10, y - 40, x + tw + 16, y + 40), fill=look.ACCENT + (int(255 * a),))
        img.alpha_composite(lay)
    # линия сейсмографа по низу кадра: бежит справа налево, на толчке — всплеск
    if t < starts[4]:
        fa = min(1.0, t / 0.6) * (1.0 if t < starts[4] - 0.6 else max(0.0, (starts[4] - t) / 0.6))
        lay = Image.new('RGBA', img.size); dl = ImageDraw.Draw(lay); pts = []; base = H - 120
        for x in range(0, W, 4):
            tt = t - (W - x) / 900.0                 # точка x показывает то, что было (W-x)/900 секунд назад
            amp = seis_amp(tt) if tt > 0 else 4
            v = NOISE[int((tt * 180) % 3999)] * amp * 0.5 + math.sin(tt * 31) * amp * 0.5
            pts.append((x, base + v))
        dl.line(pts, fill=look.ACCENT + (int(230 * fa),), width=3)
        glow = lay.filter(ImageFilter.GaussianBlur(6)); img.alpha_composite(glow); img.alpha_composite(lay)
    # подпись места (стиль TERRA: маленькие буквы с разрядкой, тонкая линия)
    cap = LINES[li].get('cap')
    if cap:
        u = t - bounds[li]; a = min(1.0, u / 0.5) * max(0.0, min(1.0, (bounds[li + 1] - t) / 0.5))
        lay = Image.new('RGBA', img.size); dl = ImageDraw.Draw(lay)
        dl.line((120, H - 168, 120 + 60 * min(1.0, u / 0.6), H - 168), fill=(255, 255, 255, int(220 * a)), width=2)
        spaced(dl, 120, H - 135, cap, look.font(30, 500), 9, (255, 255, 255, int(255 * a)))
        img.alpha_composite(lay)
    # название фильма
    if LINES[li].get('title'):
        u = t - (starts[li] + 1.2)
        if u > 0:
            a = look.ease(min(1.0, u / 1.2)) * max(0.0, min(1.0, (TOTAL - t) / 0.8))
            f = serif(220); track = 70 - 30 * look.ease_out(min(1.0, u / 2.5))
            lay = Image.new('RGBA', img.size); dl = ImageDraw.Draw(lay)
            spaced(dl, W / 2, H * 0.46, LINES[li]['title'], f, track, (250, 246, 238, int(255 * a)), 'm')
            sh = lay.split()[3].filter(ImageFilter.GaussianBlur(18)); dk = Image.new('RGBA', img.size); dk.putalpha(sh.point(lambda v: int(v * 0.5)))
            img.alpha_composite(dk); img.alpha_composite(lay)

out_v = f'{D}/v.mp4'
if '--audio-only' not in sys.argv:
    # ---------- видео ----------
    out_v = f'{D}/v.mp4'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out_v], stdin=subprocess.PIPE)
    NT = round(TOTAL * FPS); fi = 0; XF = 15     # растворение 0,5 с только перед названием
    prev_tail = None
    for si, s in enumerate(shots):
        n = round((s['t0'] + s['dur']) * FPS) - round(s['t0'] * FPS)
        shake = LINES[s['line']].get('shake', False)
        dissolve = LINES[s['line']].get('title') and s['first']
        for k, fr in enumerate(frames(s['src'], s['ss'], n, shake)):
            t = (round(s['t0'] * FPS) + k) / FPS
            a = fr
            if dissolve and prev_tail is not None and k < XF: a = (prev_tail * (1 - k / XF) + fr * (k / XF)).astype(np.uint8)
            img = Image.fromarray(a).convert('RGBA'); overlay(img, t)
            fade = min(1.0, t / 0.8, (TOTAL - t) / 1.0)
            arr = np.asarray(img.convert('RGB'), np.float32) * max(0.0, fade)
            enc.stdin.write(arr.astype(np.uint8).tobytes()); prev_tail = fr
    enc.stdin.close(); enc.wait()


# ---------- звук: голос, музыка Mixkit, гул землетрясения ----------
tq = starts[2] + 0.8
music = f'{DATA}/music/mixkit_188_echoes.mp3'
flt = (f"[1:a]adelay={int(V0*1000)}|{int(V0*1000)},asplit=2[vo][vk];"
       f"[2:a]atrim=0:{TOTAL:.2f},volume=0.16,afade=t=in:d=1.5,afade=t=out:st={TOTAL-2:.2f}:d=2[mu];"
       f"anoisesrc=d=7:c=brown:a=0.9,lowpass=f=90,volume=2.2,afade=t=in:d=1.4,afade=t=out:st=3:d=4,adelay={int(tq*1000)}|{int(tq*1000)}[rb];"
       f"[mu][rb]amix=inputs=2:normalize=0[bg];[bg][vk]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400[bgd];"
       f"[bgd][vo]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out_v, '-i', f'{D}/vo/all.mp3', '-i', music, '-filter_complex', flt,
                '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.2f}', '-movflags', '+faststart', f'{D}/japan_test.mp4'], check=True)
print('done', f'{D}/japan_test.mp4')
