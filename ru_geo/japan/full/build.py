# Сборка полного выпуска «Япония». Картинка рендерится кусками параллельно (--jobs), затем склейка и звук.
#   python3 build.py [--4k] [--jobs 4]
import json, os, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); J = os.path.join(D, '..'); RG = os.path.join(J, '..')
sys.path.insert(0, os.path.join(RG, 'lib')); import look
import plan
W, H, FPS = (3840, 2160, 30) if '--4k' in sys.argv else (1920, 1080, 30)
K = W / 1920; TAG = '4k' if W > 1920 else '1080p'
SEG = os.path.join(RG, 'data', 'pixabay', 'seg'); DATA = os.path.join(RG, 'data')
GRADE = 'eq=contrast=1.10:saturation=1.22:gamma=0.96,colorbalance=rs=-0.05:bs=0.06:bm=-0.01:rh=0.05:gh=0.02:bh=-0.04'
BAR = int(round(H * 0.095))
P = plan.build(); SEGS = P['segs']; END = P['END']; T0 = P['t_title']

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
    S = int(240 * K); im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((6 * K, 6 * K, S - 6 * K, S - 6 * K), radius=int(22 * K), fill=(196, 28, 36, 255))
    m = Image.new('L', (S, S), 255); dm = ImageDraw.Draw(m)
    dm.rounded_rectangle((20 * K, 20 * K, S - 20 * K, S - 20 * K), radius=int(12 * K), outline=0, width=int(5 * K))
    for ch, yy in (('日', 0.30), ('本', 0.70)): dm.text((S / 2, S * yy), ch, font=HF, fill=0, anchor='mm', stroke_width=int(4 * K), stroke_fill=0)
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
def card(img, t):
    for c in P['cards']:
        u = t - c['t'] - 0.3; L = plan.CARD + 1.4
        if 0 <= u <= L:
            a = e(min(1.0, u / 0.8)) * e(min(1.0, (L - u) / 0.7))
            lay = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(lay)
            spaced(d, W / 2, H * 0.40, f'ГЛАВА {c["ch"]}', SUB, 16 * K, (250, 246, 238, int(220 * a)))
            tr = (22 + 10 * (1 - look.ease_out(min(1.0, u / 2.0)))) * K
            fit = CARD_F; wd = sum(fit.getlength(ch) for ch in c['name']) + 32 * K * (len(c['name']) - 1)
            if wd > W * 0.78: fit = serif(118 * W * 0.78 / wd); tr *= W * 0.78 / wd
            spaced(d, W / 2, H * 0.50, c['name'], fit, tr, (250, 246, 238, int(255 * a)))
            hk = HANKO.resize((int(HANKO.size[0] * 0.28), int(HANKO.size[1] * 0.28)), Image.LANCZOS)
            hk.putalpha(hk.split()[3].point(lambda p: int(p * a)))
            if u > 0.5: lay.alpha_composite(hk, (int(W / 2 - hk.size[0] / 2), int(H * 0.60)))
            img.alpha_composite(shadow(lay, 0.6))
def shake(t):
    v = t - T0 - 1.25; return int(6 * K * np.sin(v * 60) * (1 - v / 0.25)) if 0 <= v < 0.25 else 0

# ---------- рендер куска ----------
def render(job):
    k, i0, i1 = job; out = f'{D}/part_{TAG}_{k:02d}.mp4'
    vf = f'vignette=angle=PI/5,noise=alls=5:allf=t,drawbox=x=0:y=0:w=iw:h={BAR}:color=black:t=fill,drawbox=x=0:y=ih-{BAR}:w=iw:h={BAR}:color=black:t=fill'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-vf', vf,
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '19M' if W > 1920 else '14M', '-bufsize', '38M' if W > 1920 else '28M', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    XF = 15; prev = None
    for si in range(i0, i1):
        s = SEGS[si]; f0 = round(s['t0'] * FPS); n = round((s['t0'] + s['dur']) * FPS) - f0
        for j, fr in enumerate(frames(f'{SEG}/{s["id"]}_{s["ss"]}.mp4', n)):
            t = (f0 + j) / FPS; a = fr
            if s['dis'] and prev is not None and j < XF: a = (prev.astype(np.float32) * (1 - j / XF) + fr * (j / XF)).astype(np.uint8)
            if (T0 <= t <= P['intro_end'] + 0.1) or any(0 <= t - c['t'] - 0.3 <= plan.CARD + 1.4 for c in P['cards']):
                img = Image.fromarray(a).convert('RGBA'); title(img, t); card(img, t); a = np.asarray(img.convert('RGB'))
            dy = shake(t)
            if dy: a = np.roll(a, dy, axis=0)
            fade = min(1.0, t / 0.6, (END - t) / 2.0)
            if fade < 1: a = (a.astype(np.float32) * max(0.0, fade)).astype(np.uint8)
            enc.stdin.write(np.ascontiguousarray(a).tobytes())
        prev = fr if not s['dis'] or True else prev
    enc.stdin.close(); enc.wait(); return out

if __name__ == '__main__':
    jobs = int(sys.argv[sys.argv.index('--jobs') + 1]) if '--jobs' in sys.argv else 4
    # границы кусков — только на кадрах без растворения
    tot = sum(s['dur'] for s in SEGS); cuts = [0]; acc = 0
    for i, s in enumerate(SEGS):
        if acc >= tot * len(cuts) / jobs and not s['dis'] and i > cuts[-1]: cuts.append(i)
        acc += s['dur']
    cuts.append(len(SEGS)); parts = [(k, cuts[k], cuts[k + 1]) for k in range(len(cuts) - 1)]
    print('parts', parts, flush=True)
    if '--audio-only' not in sys.argv:
        with ProcessPoolExecutor(jobs) as ex: outs = list(ex.map(render, parts))
        open(f'{D}/parts.txt', 'w').write(''.join(f"file '{o}'\n" for o in outs))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/parts.txt', '-c', 'copy', f'{D}/v_{TAG}.mp4'], check=True)
        for o in outs: os.remove(o)
    # ---------- звук ----------
    ins, flt = [], []
    for k, (t, f) in enumerate(P['voice']):
        ins += ['-i', f]; ms = int(t * 1000); flt.append(f'[{k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay={ms}|{ms}[v{k}]')
    nv = len(P['voice'])
    flt.append(''.join(f'[v{k}]' for k in range(nv)) + f'amix=inputs={nv}:normalize=0,apad=whole_dur={END:.2f},asplit=2[vo][vk]')
    chs = sorted(plan.MUSIC); starts = {c: P['chap_t'][c] for c in chs}; mk = []
    for j, c in enumerate(chs):
        a = max(0.0, starts[c] - (1.5 if c else 0)); z = (starts[chs[j + 1]] + 1.5) if j + 1 < len(chs) else END
        fn, g = plan.MUSIC[c]; idx = nv + j; ins += ['-stream_loop', '-1', '-i', f'{plan.MUS}/{fn}']; L = z - a; ms = int(a * 1000)
        flt.append(f'[{idx}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:{L:.2f},asetpts=PTS-STARTPTS,volume={g},'
                   f'afade=t=in:d={0.8 if c == 0 else 3}:curve=qsin,afade=t=out:st={L-3:.2f}:d=3:curve=qsin,adelay={ms}|{ms}[m{j}]'); mk.append(f'[m{j}]')
    flt.append(''.join(mk) + f'amix=inputs={len(mk)}:normalize=0[mu]')
    flt.append('[mu][vk]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=400[bgd]')
    flt.append(f'[bgd][vo]amix=inputs=2:normalize=0,atrim=0:{END:.2f},loudnorm=I=-15:TP=-1.5:LRA=11[a]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[a]', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'{D}/a.m4a'], check=True)
    out = f'{D}/japan_{TAG}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/v_{TAG}.mp4', '-i', f'{D}/a.m4a', '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest',
                    '-movflags', '+faststart', out], check=True)
    print('done', out, flush=True)
