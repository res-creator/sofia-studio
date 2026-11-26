#!/usr/bin/env python3
"""python3 compose.py <slug> <timeline.json> <out.mp4> [t0 t1]
timeline.json: {"segs":[{"t":0.0,"d":4.0,"type":"clip|photo|card","src":"путь","ss":0.0,"z":[1.0,1.08],"p":[0.5,0.5]}, ...]}  (t, d в секундах фильма, подряд без дыр)
Собирает куски ffmpeg (мягкие затухания), склеивает, накладывает субтитры из film.json и озвучку."""
import json, os, subprocess, sys, tempfile
R = '/home/user/sofia-studio/ru_geo'; slug, tl_path, out = sys.argv[1:4]
film = json.load(open(f'{R}/{slug}/film.json', encoding='utf8')); tl = json.load(open(tl_path, encoding='utf8'))['segs']
t0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0; t1 = float(sys.argv[5]) if len(sys.argv) > 5 else film['total']
W, H, FPS, FADE = 1920, 1080, 30, 0.22
GRADE = 'eq=saturation=0.9:contrast=1.05:brightness=-0.02,vignette=PI/6'
tmp = tempfile.mkdtemp(dir=os.environ.get('TMPDIR_C', '/tmp')); parts = []
def run(cmd): subprocess.run(cmd, check=True, stderr=subprocess.DEVNULL)
for i, s in enumerate(tl):
    a, b = max(s['t'], t0), min(s['t'] + s['d'], t1)
    if b - a < 0.05: continue
    d = b - a; off = a - s['t']; o = f'{tmp}/s{i:04d}.mp4'; src = s['src'] if s['src'].startswith('/') else f'{R}/{s["src"]}'
    fade = f'fade=t=in:st=0:d={FADE},fade=t=out:st={max(0, d - FADE):.3f}:d={FADE}'
    if s['type'] == 'clip':
        vf = f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},{GRADE},{fade},format=yuv420p'
        run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '-1', '-ss', str(s.get('ss', 0) + off), '-i', src, '-t', f'{d:.3f}', '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', o])
    else:  # photo / card: плавное линейное приближение
        z0, z1 = s.get('z', [1.0, 1.08] if s['type'] == 'photo' else [1.0, 1.02]); px, py = s.get('p', [0.5, 0.5]); n = max(2, round(d * FPS))
        zf = f"if(lt(on,1),{z0},{z0}+({z1}-{z0})*on/{n})"
        pre = f'scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,' if s['type'] == 'photo' else 'scale=3840:2160,'
        vf = f"{pre}zoompan=z='{zf}':x='(iw-iw/zoom)*{px}':y='(ih-ih/zoom)*{py}':d={n}:s={W}x{H}:fps={FPS},{(GRADE + ',') if s['type'] == 'photo' else ''}{fade},format=yuv420p"
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', str(FPS), '-i', src, '-t', f'{d:.3f}', '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', o])
    parts.append(o)
open(f'{tmp}/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', f'{tmp}/v.mp4'])
# субтитры (ASS)
def tc(x): x = max(0, x); return f'{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}'
ass = ['[Script Info]', 'ScriptType: v4.00+', f'PlayResX: {W}', f'PlayResY: {H}', '', '[V4+ Styles]',
       'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
       'Style: C,Inter,60,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,4,2,2,120,120,70,1', '', '[Events]', 'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']
for sg in film['segs']:
    if sg['kind'] != 'voice': continue
    for ca, cb, txt in sg['captions']:
        if cb < t0 or ca > t1: continue
        ass.append(f'Dialogue: 0,{tc(ca - t0)},{tc(cb - t0)},C,,0,0,0,,{txt}')
open(f'{tmp}/c.ass', 'w', encoding='utf8').write('\n'.join(ass))
# звук: озвучка (+ музыка, если есть mus.wav рядом)
dur = t1 - t0; aud = ['-ss', str(t0), '-t', f'{dur:.3f}', '-i', f'{R}/{slug}/vo_clone/vo.mp3']
mus = f'{R}/{slug}/music.wav'
if os.path.exists(mus): aud += ['-ss', str(t0), '-t', f'{dur:.3f}', '-i', mus]; af = '[1:a]aresample=48000[v];[2:a]aresample=48000[m];[v][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7[o]'
else: af = '[1:a]aresample=48000,loudnorm=I=-14:TP=-1.5:LRA=7[o]'
run(['ffmpeg', '-v', 'error', '-y', '-i', f'{tmp}/v.mp4', *aud, '-filter_complex', f"[0:v]ass={tmp}/c.ass:fontsdir=/usr/share/fonts[vv];{af}", '-map', '[vv]', '-map', '[o]', '-c:v', 'libx264', '-crf', '21', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out])
print('ok', out, round(dur, 1), 'c'); subprocess.run(['rm', '-rf', tmp])
