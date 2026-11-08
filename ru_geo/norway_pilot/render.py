# Сборка пилота: кадры по монтажному листу (timeline.py) + надписи + озвучка + музыка → norway_pilot.mp4
# Запуск: python3 render.py [out.mp4] [--audio-only]. Исходники — ../data/media (скачивает fetch_media.py), карты — cache/.
import math, os, re, sys, subprocess
from PIL import Image, ImageDraw, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import geo, media, look, fx
import numpy as np
from timeline import build, FPS
from maps import big_text, YEL
from script import MEDIA
W, H = 1920, 1080
DATA = os.path.join(D, '..', 'data')
MUSIC = os.path.join(DATA, 'music', 'mixkit_617_wind_leaves.mp3')   # Mixkit «Wind Leaves» (Eugenio Mininni), Mixkit Stock Music Free License
MUSIC_SS = 1.393  # первый удар трека: склейки вступления совпадают с ритмом
MUSIC_END = 196.0 # к ~196-й секунде трек затихает
G_INTRO, G_BED, G_OUT = 0.30, 0.085, 0.2   # громкость музыки: вступление / под голосом / финал (трек громкий, ~-10 LUFS)
# чистка голоса: срез гула, шумоподавление, де-эссер, мягкий гейт на паузах (вдохи тише), компрессия, разборчивость
VO_CLEAN = ('highpass=f=70,afftdn=nf=-42:tn=1,deesser=i=0.35,agate=threshold=0.02:ratio=2.5:attack=4:release=150:range=0.12,'
            'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=140:makeup=1.6,equalizer=f=3200:t=q:w=1.2:g=1.5')
IMG_EXT = ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp')

def is_photo(path):
    if path.lower().endswith(IMG_EXT): return True
    try: Image.open(path).verify(); return True
    except Exception: return False

def probe(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout or 0)

def frames_video(path, ss, dur, sh):
    """Кадры видео 1920×1080@30 с ss; если исходник короче — замедляем (не больше чем в 2 раза), crop — кадрирование (x,y,w,h в долях)."""
    total = probe(path)
    avail = max(0.3, total - ss - 0.05)
    slow = max(1.0, min(2.0, dur / avail)) * sh.get('slow', 1.0)
    vf = []
    if sh.get('crop'):
        x, y, w, h = sh['crop']; vf.append(f'crop=iw*{w}:ih*{h}:iw*{x}:ih*{y}')
    vf += [f'setpts={slow:.4f}*PTS', f'fps={FPS}', 'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos', 'crop=1920:1080', 'unsharp=5:5:0.5']
    if sh.get('grade') == 'night': vf.append('eq=brightness=-0.04:saturation=1.15')
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', path, '-an', '-vf', ','.join(vf), '-t', str(dur + 0.3),
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    last = None
    for i in range(round(dur * FPS)):
        b = p.stdout.read(W * H * 3)
        if len(b) == W * H * 3: last = b
        if last is None: last = bytes(W * H * 3)
        yield last
    p.stdout.close(); p.wait()

def frames_photo(path, dur, sh):
    """Фото с плавным наездом/панорамой (кен-бёрнс): kb = (zoom0, zoom1, (fx0, fy0), (fx1, fy1)) — центр в долях кадра."""
    im = Image.open(path).convert('RGB')
    z0, z1, f0, f1 = sh.get('kb', (1.0, 1.12, (0.5, 0.5), (0.5, 0.5)))
    iw, ih = im.size; base = max(W / iw, H / ih)
    big = im.resize((int(iw * base * z1 * 1.02) + 2, int(ih * base * z1 * 1.02) + 2), Image.LANCZOS)
    n = round(dur * FPS)
    for i in range(n):
        u = geo.ease(i / max(1, n - 1)) * 0.85 + (i / max(1, n - 1)) * 0.15
        z = z0 + (z1 - z0) * u; fx = f0[0] + (f1[0] - f0[0]) * u; fy = f0[1] + (f1[1] - f0[1]) * u
        sc = big.size[0] / (iw * base)          # масштаб big относительно «вписанного» кадра
        cw, ch = W / z * sc, H / z * sc
        cx = min(max(fx * big.size[0], cw / 2), big.size[0] - cw / 2); cy = min(max(fy * big.size[1], ch / 2), big.size[1] - ch / 2)
        fr = big.crop((cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)).resize((W, H), Image.BICUBIC)
        yield fr.tobytes()

TR_N = dict(fade=12, whip=8, zoom=8, slide=10, flash=8)

def _zoom(a, z, blur=0):
    im = Image.fromarray(a)
    if z != 1:
        cw, ch = W / z, H / z
        im = im.crop(((W - cw) / 2, (H - ch) / 2, (W + cw) / 2, (H + ch) / 2)).resize((W, H), Image.BILINEAR)
    if blur > 0.5: im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im)

def _hblur(a, r):
    """Горизонтальный «смаз» как у whip pan: среднее сдвинутых копий."""
    r = int(r)
    if r < 2: return a
    acc = np.zeros(a.shape, np.float32); k = 0
    for dx in range(-r, r + 1, max(1, r // 6)): acc += np.roll(a, dx, axis=1); k += 1
    return (acc / k).astype(np.uint8)

def transition(kind, A, B, w):
    """A — уходящий кадр, B — новый, w 0..1 по ходу перехода. Переходы в духе After Effects."""
    e = look.ease(w)
    if kind == 'fade':
        return (A.astype(np.float32) * (1 - e) + B.astype(np.float32) * e).astype(np.uint8)
    if kind == 'flash':
        m = (A.astype(np.float32) * (1 - e) + B.astype(np.float32) * e)
        f = (1 - abs(2 * w - 1)) ** 1.5 * 0.85
        warm = np.array([255, 238, 220], np.float32)
        return np.clip(m * (1 - f) + warm * f, 0, 255).astype(np.uint8)
    if kind == 'zoom':   # «удар» зумом: старый кадр влетает в камеру, новый выезжает из увеличения
        if w < 0.5: return _zoom(A, 1 + 0.35 * look.ease(w * 2) ** 2, 10 * w * 2)
        return _zoom(B, 1 + 0.35 * (1 - look.ease((w - 0.5) * 2)) ** 2, 10 * (1 - (w - 0.5) * 2))
    if kind == 'whip':   # быстрая панорама со смазом
        sh = int(W * 0.5 * e) if w < 0.5 else 0
        if w < 0.5: return _hblur(np.roll(A, -int(W * 0.6 * look.ease(w * 2)), axis=1), 60 * w * 2)
        return _hblur(np.roll(B, int(W * 0.6 * (1 - look.ease((w - 0.5) * 2))), axis=1), 60 * (1 - (w - 0.5) * 2))
    if kind == 'slide':  # новый кадр «выталкивает» старый влево
        x = int(W * e)
        out = np.empty_like(A); out[:, :W - x] = A[:, x:]; out[:, W - x:] = B[:, :x]
        return _hblur(out, 24 * (1 - abs(2 * w - 1)))
    return B

def overlay(img, sh, t, tg):
    dur = sh['dur']
    if sh.get('loc'): look.tag(img, sh['loc'], t, t_out=dur - 0.35)
    if sh.get('txt'):
        look.number(img, (120, H * 0.83), sh['txt'], sh.get('sub'), t, sh.get('t_txt', 0.3), sh.get('size', 104), 'l', t_out=dur - 0.35)
    if sh.get('q'):   # рукописный «?» как у референса, теперь коралловый
        k = min(1.0, t / 0.3)
        sz = int(260 * (0.6 + 0.4 * k)); a = math.sin(t * 3) * 4
        q = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
        geo.text_outlined(q, (200, 200), '?', sz, fill=look.ACCENT, sw=0, name='Caveat.ttf', weight=700)
        img.alpha_composite(q.rotate(a, resample=Image.BICUBIC), (int(W * 0.72), int(H * 0.18)))
    # монтажные приёмы поверх кадра
    if sh.get('circle'): fx.circle(img, t, dur, **sh['circle'])
    if sh.get('locator'): fx.locator(img, t, dur, *sh['locator'])
    if sh.get('badge'):
        bt = sh['badge']; fx.badge(img, t, dur, bt[0], bt[1] if len(bt) > 1 else 'clock', bt[2] if len(bt) > 2 else (0.5, 0.82))
    if sh.get('card'):
        c = sh['card']
        if '_pic' not in c: c['_pic'] = still(c['m'], c.get('ss', 0))
        fx.card(img, t, dur, c['_pic'], c.get('caption'), c.get('side', 'r'), c.get('tilt', -4.0), c.get('polaroid', True), c.get('width', 560), c.get('y'))
    if sh.get('title'):   # заголовок поверх нарезки вступления
        look.title_card(img, 'НОРВЕГИЯ', tg, t0=TITLE_T0, size=160)

def still(key, ss=0):
    p = media.path(key, MEDIA[key])
    if is_photo(p): return Image.open(p).convert('RGB')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', p, '-frames:v', '1', '-vf', 'scale=1280:720', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return Image.frombytes('RGB', (1280, 720), raw)

def source(sh):
    if 'm' in sh: return media.path(sh['m'], MEDIA[sh['m']]), sh.get('ss', 0)
    return f"{D}/cache/{sh.get('map') or sh.get('gfx')}.mp4", sh.get('ss', 0)

TITLE_T0 = 2.85

def video(out_v):
    _, shots, total = build()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out_v], stdin=subprocess.PIPE)
    def frames_of(sh, pre):
        # pre кадров уходят на переход: план генерируется длиннее, чтобы общий хронометраж (и синхрон с голосом) не менялся
        d = sh['dur'] + pre / FPS
        if sh.get('split'):     # экран на части: каждая панель — свой исходник
            subs = []
            for pn in sh['split']:
                sp = media.path(pn['m'], MEDIA[pn['m']])
                subs.append(frames_photo(sp, d, pn) if is_photo(sp) else frames_video(sp, pn.get('ss', 0), d, pn))
            def gen_split():
                for i in range(round(d * FPS)):
                    frs = [np.frombuffer(next(g), np.uint8).reshape(H, W, 3) for g in subs]
                    yield fx.split(frs, max(0.0, (i - pre) / FPS), sh.get('labels')).convert('RGB').tobytes()
            gen = gen_split()
        else:
            src, ss = source(sh)
            gen = frames_photo(src, d, sh) if is_photo(src) else frames_video(src, max(0.0, ss - pre / FPS), d, sh)
        need = any(sh.get(k) for k in ('txt', 'q', 'loc', 'title', 'circle', 'locator', 'badge', 'card'))
        for i, fr in enumerate(gen):
            a = np.frombuffer(fr, np.uint8).reshape(H, W, 3)
            if need:
                t = (i - pre) / FPS
                img = Image.fromarray(a).convert('RGBA'); overlay(img, sh, max(0.0, t), sh['start'] + t); a = np.asarray(img.convert('RGB'))
            yield a
    held = []                          # последние кадры предыдущего плана, ждущие перехода
    LIMIT = float(os.environ.get('LIMIT', '1e9'))
    shots = [x for x in shots if x['start'] < LIMIT]
    if os.environ.get('KEYS'): shots = [x for x in shots if x['key'] in os.environ['KEYS'].split(',')]
    for n, sh in enumerate(shots):
        nxt = shots[n + 1] if n + 1 < len(shots) else None
        hold = TR_N.get(nxt.get('tr'), 0) if nxt else 0
        hold = min(hold, int(sh['dur'] * FPS) // 2, int(nxt['dur'] * FPS) // 2) if nxt else 0
        kind = sh.get('tr'); buf = []; N0 = len(held)
        for i, a in enumerate(frames_of(sh, N0)):
            if held:                   # первые кадры этого плана смешиваются с хвостом предыдущего
                A = held.pop(0); w = (i + 0.5) / N0
                p.stdin.write(transition(kind, A, a, w).tobytes()); continue
            buf.append(a)
            if len(buf) > hold: p.stdin.write(buf.pop(0).tobytes())
        held = buf
        print(f"{sh['start']:7.2f} {sh['key']} {sh.get('tr', '')}", flush=True)
    for a in held: p.stdin.write(a.tobytes())
    p.stdin.close(); p.wait()
    return total

def audio(out_a, total):
    paras, _, _ = build()
    ins, flt = ['-i', MUSIC], []
    for i, pa in enumerate(paras):
        ins += ['-i', pa['file']]
        flt.append(f"[{i+1}:a]atrim={pa['trim']:.3f}:{pa['trim'] + pa['len']:.3f},asetpts=PTS-STARTPTS,aresample=48000,{VO_CLEAN},adelay={int(pa['start']*1000)}|{int(pa['start']*1000)}[v{i}]")
    vo = ''.join(f'[v{i}]' for i in range(len(paras)))
    first, last_end = paras[0]['start'], paras[-1]['start'] + paras[-1]['len']
    g = (f"if(lt(t,{first-0.4:.2f}),{G_INTRO},if(lt(t,{first+0.4:.2f}),{G_INTRO}-{G_INTRO-G_BED}*(t-{first-0.4:.2f})/0.8,"
         f"if(lt(t,{last_end+0.3:.2f}),{G_BED},{G_BED}+{G_OUT-G_BED}*min(1,(t-{last_end+0.3:.2f})/1.0))))")
    xf, endlen = 4.0, 40.0
    a_len = total - endlen + xf
    flt.append(f"[0:a]aresample=48000,asplit[ma][mb];[ma]atrim={MUSIC_SS}:{MUSIC_SS + a_len:.3f},asetpts=PTS-STARTPTS[mA];"
               f"[mb]atrim={MUSIC_END - endlen:.3f}:{MUSIC_END:.3f},asetpts=PTS-STARTPTS[mB];[mA][mB]acrossfade=d={xf}[mm]")
    flt.append(f"[mm]atrim=0:{total:.3f},volume='{g}':eval=frame,afade=t=out:st={total-2.5:.2f}:d=2.5,afade=t=in:d=0.05[m]")
    flt.append(f"{vo}amix=inputs={len(paras)}:normalize=0,volume=1.0[vo]")
    flt.append("[vo][m]amix=inputs=2:normalize=0[out]")
    raw = out_a + '.raw.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', raw], check=True)
    # громкость -16 LUFS одним линейным усилением (loudnorm «вытягивает» тихие места)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'volume={-16 - I:.2f}dB,alimiter=limit=0.84:level=false', '-c:a', 'pcm_s16le', out_a], check=True)
    os.remove(raw)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = args[0] if args else f'{D}/norway_pilot.mp4'
    os.makedirs(f'{D}/cache', exist_ok=True)
    total = build()[2] if '--audio-only' in sys.argv else video(f'{D}/cache/video.mp4')
    audio(f'{D}/cache/audio.wav', total)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/cache/video.mp4', '-i', f'{D}/cache/audio.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
                    '-maxrate', '3500k', '-bufsize', '7000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
    print('done', out, round(total, 2), 's')
