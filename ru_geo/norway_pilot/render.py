# Сборка пилота: кадры по монтажному листу (timeline.py) + надписи + озвучка + музыка → norway_pilot.mp4
# Запуск: python3 render.py [out.mp4] [--audio-only]. Исходники — ../data/media (скачивает fetch_media.py), карты — cache/.
import math, os, re, sys, subprocess
from PIL import Image, ImageDraw, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import geo, media
from timeline import build, FPS
from maps import big_text, YEL
from script import MEDIA
W, H = 1920, 1080
DATA = os.path.join(D, '..', 'data')
MUSIC = os.path.join(DATA, 'music', 'mixkit_188_echoes.mp3')   # Mixkit «Echoes» (Andrew Ev), Mixkit Stock Music Free License
MUSIC_SS = 13.0   # у трека долгое тихое начало — берём с 13-й секунды
MUSIC_END = 220.0 # к 220-й секунде трек затихает
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

def tag(img, s, t):
    """Плашка места в левом верхнем углу (как подписи у референса): «Лердальский тоннель · Вестланн»."""
    if t < 0.15: return
    a = min(1.0, (t - 0.15) / 0.3)
    f = geo.font(34, 700); x, y = 60, 58
    w = f.getbbox(s)[2] + 44
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.rounded_rectangle((x, y, x + w, y + 58), 10, fill=(0, 0, 0, int(150 * a)))
    d.rectangle((x, y, x + 7, y + 58), fill=YEL + (int(255 * a),))
    d.text((x + 24, y + 29), s, font=f, fill=(255, 255, 255, int(255 * a)), anchor='lm')
    img.alpha_composite(ov)

def overlay(img, sh, t):
    if sh.get('loc'): tag(img, sh['loc'], t)
    if sh.get('txt'):
        y = H * (0.74 if sh.get('sub') else 0.8)
        big_text(img, (W / 2, y), sh['txt'], sh.get('size', 104), t, sh.get('t_txt', 0.35))
        if sh.get('sub') and t > sh.get('t_txt', 0.35) + 0.25:
            geo.text_outlined(img, (W / 2, y + 92), sh['sub'], 40, fill=(255, 255, 255), weight=600, sw=3)
    if sh.get('q'):   # жёлтый рукописный «?» как у референса
        k = min(1.0, t / 0.3)
        sz = int(260 * (0.6 + 0.4 * k)); a = math.sin(t * 3) * 4
        q = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
        geo.text_outlined(q, (200, 200), '?', sz, fill=YEL, sw=6, name='Caveat.ttf', weight=700)
        img.alpha_composite(q.rotate(a, resample=Image.BICUBIC), (int(W * 0.72), int(H * 0.18)))

def source(sh):
    if 'm' in sh: return media.path(sh['m'], MEDIA[sh['m']]), sh.get('ss', 0)
    return f"{D}/cache/{sh.get('map') or sh.get('gfx')}.mp4", sh.get('ss', 0)

def video(out_v):
    _, shots, total = build()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out_v], stdin=subprocess.PIPE)
    for sh in shots:
        src, ss = source(sh)
        gen = frames_photo(src, sh['dur'], sh) if is_photo(src) else frames_video(src, ss, sh['dur'], sh)
        need = any(sh.get(k) for k in ('txt', 'q', 'loc'))
        for i, fr in enumerate(gen):
            if need:
                img = Image.frombytes('RGB', (W, H), fr).convert('RGBA'); overlay(img, sh, i / FPS); fr = img.convert('RGB').tobytes()
            p.stdin.write(fr)
        print(f"{sh['start']:7.2f} {sh['key']}", flush=True)
    p.stdin.close(); p.wait()
    return total

def audio(out_a, total):
    paras, _, _ = build()
    ins, flt = ['-i', MUSIC], []
    for i, pa in enumerate(paras):
        ins += ['-i', pa['file']]
        flt.append(f"[{i+1}:a]atrim={pa['trim']:.3f}:{pa['trim'] + pa['len']:.3f},asetpts=PTS-STARTPTS,aresample=48000,adelay={int(pa['start']*1000)}|{int(pa['start']*1000)}[v{i}]")
    vo = ''.join(f'[v{i}]' for i in range(len(paras)))
    first, last_end = paras[0]['start'], paras[-1]['start'] + paras[-1]['len']
    g = (f"if(lt(t,{first-0.6:.2f}),0.45,if(lt(t,{first+0.4:.2f}),0.45-0.25*(t-{first-0.6:.2f}),"
         f"if(lt(t,{last_end+0.3:.2f}),0.20,0.20+0.12*min(1,(t-{last_end+0.3:.2f})/1.0))))")
    xf, endlen = 4.0, 40.0
    a_len = total - endlen + xf
    flt.append(f"[0:a]aresample=48000,asplit[ma][mb];[ma]atrim={MUSIC_SS}:{MUSIC_SS + a_len:.3f},asetpts=PTS-STARTPTS[mA];"
               f"[mb]atrim={MUSIC_END - endlen:.3f}:{MUSIC_END:.3f},asetpts=PTS-STARTPTS[mB];[mA][mB]acrossfade=d={xf}[mm]")
    flt.append(f"[mm]atrim=0:{total:.3f},volume='{g}':eval=frame,afade=t=out:st={total-2.5:.2f}:d=2.5,afade=t=in:d=1.0[m]")
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
