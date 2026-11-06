# Сборка пилота: кадры по монтажному листу (timeline.py) + надписи + озвучка + музыка → norway_pilot.mp4
# Запуск: python3 render.py [out.mp4]. Видео Mixkit берутся из ../data/clips (скачивает ../fetch_data.sh).
import math, os, re, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import geo
from timeline import build, FPS
from maps import big_text, YEL
W, H = 1920, 1080
DATA = os.path.join(D, '..', 'data')
CLIPS = os.path.join(DATA, 'clips')
MUSIC = os.path.join(DATA, 'music', 'mixkit_188_echoes.mp3')   # Mixkit «Echoes» (Andrew Ev), Mixkit Stock Music Free License
MUSIC_SS = 13.0   # у трека долгое тихое начало — берём с 13-й секунды
MUSIC_END = 220.0 # к 220-й секунде трек затихает

def frames(path, ss, dur, tint=None):
    """Кадры клипа 1920×1080@30 начиная с ss; если клип короче — чуть замедляем (не больше чем в 1,6 раза)."""
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)
    avail = max(0.5, total - ss - 0.05)
    slow = max(1.0, min(1.6, dur / avail))
    vf = [f'setpts={slow:.4f}*PTS', f'fps={FPS}', 'scale=1920:1080:flags=lanczos', 'unsharp=5:5:0.6']
    if tint == 'blue': vf += ['colorchannelmixer=rr=0.55:gg=0.85:bb=1.25:bg=0.15', 'eq=saturation=1.3:brightness=-0.03']
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', path, '-an', '-vf', ','.join(vf), '-t', str(dur + 0.2),
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    n, last = round(dur * FPS), None
    for i in range(n):
        b = p.stdout.read(W * H * 3)
        if len(b) == W * H * 3: last = b
        yield last
    p.stdout.close(); p.wait()

def overlay(img, sh, t):
    if sh.get('txt'):
        big_text(img, (W / 2, H * 0.8), sh['txt'], 104, t, 0.35)
    if sh.get('q'):   # жёлтый рукописный «?» как у референса
        k = min(1.0, t / 0.3)
        if k > 0:
            sz = int(260 * (0.6 + 0.4 * k)); a = math.sin(t * 3) * 4
            q = Image.new('RGBA', (400, 400), (0, 0, 0, 0))
            geo.text_outlined(q, (200, 200), '?', sz, fill=YEL, sw=6, name='Caveat.ttf', weight=700)
            q = q.rotate(a, resample=Image.BICUBIC)
            img.alpha_composite(q, (int(W * 0.72), int(H * 0.18)))

def video(out_v):
    _, shots, total = build()
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out_v], stdin=subprocess.PIPE)
    for sh in shots:
        if 'clip' in sh: src, ss = f"{CLIPS}/{sh['clip']}.mp4", sh['ss']
        else: src, ss = f"{D}/cache/{sh.get('map') or sh.get('gfx')}.mp4", 0
        for i, fr in enumerate(frames(src, ss, sh['dur'], sh.get('tint'))):
            if sh.get('txt') or sh.get('q'):
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
        flt.append(f"[{i+1}:a]atrim=0:{pa['len']:.3f},aresample=48000,adelay={int(pa['start']*1000)}|{int(pa['start']*1000)}[v{i}]")
    vo = ''.join(f'[v{i}]' for i in range(len(paras)))
    first, last_end = paras[0]['start'], paras[-1]['start'] + paras[-1]['len']
    # музыка: громче в начале (только музыка), под голосом тихая подложка, в конце снова поднимается и затухает
    g = (f"if(lt(t,{first-0.6:.2f}),0.45,if(lt(t,{first+0.4:.2f}),0.45-0.25*(t-{first-0.6:.2f}),"
         f"if(lt(t,{last_end+0.3:.2f}),0.20,0.20+0.12*min(1,(t-{last_end+0.3:.2f})/1.0))))")
    # музыка = начало трека (с MUSIC_SS) + его естественный финал так, чтобы он закончился вместе с роликом (склейка 4 с)
    xf, endlen = 4.0, 40.0
    a_len = total - endlen + xf
    flt.append(f"[0:a]aresample=48000,asplit[ma][mb];[ma]atrim={MUSIC_SS}:{MUSIC_SS + a_len:.3f},asetpts=PTS-STARTPTS[mA];"
               f"[mb]atrim={MUSIC_END - endlen:.3f}:{MUSIC_END:.3f},asetpts=PTS-STARTPTS[mB];[mA][mB]acrossfade=d={xf}[mm]")
    flt.append(f"[mm]atrim=0:{total:.3f},volume='{g}':eval=frame,afade=t=out:st={total-2.5:.2f}:d=2.5,afade=t=in:d=1.0[m]")
    flt.append(f"{vo}amix=inputs={len(paras)}:normalize=0,volume=1.0[vo]")
    flt.append("[vo][m]amix=inputs=2:normalize=0[out]")
    raw = out_a + '.raw.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', raw], check=True)
    # громкость -16 LUFS одним линейным усилением (loudnorm «вытягивает» тихие места — музыка во вступлении стала бы громкой)
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
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/cache/video.mp4', '-i', f'{D}/cache/audio.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '3500k', '-bufsize', '7000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                    '-shortest', '-movflags', '+faststart', out], check=True)
    print('done', out, round(total, 2), 's')
