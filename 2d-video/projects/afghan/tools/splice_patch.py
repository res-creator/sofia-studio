# Вклеивает перерендеренные отрезки build/patch/pNN.mp4 (segs.json, кадры при 24 к/с) в готовый фильм поверх по времени,
# звук копируется без изменений.   python3 tools/splice_patch.py FILM.mp4
import json, os, subprocess, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(P, 'build', 'patch'); FPS = 24
film = sys.argv[1]; seg = json.load(open(os.path.join(B, 'segs.json')))
args = ['ffmpeg', '-y', '-v', 'error', '-i', film]; fc = []; last = '0:v'
for k, (f0, f1) in enumerate(seg):
    args += ['-i', os.path.join(B, f'p{k:02d}.mp4')]
    a, b = f0 / FPS, f1 / FPS
    fc.append(f'[{k + 1}:v]setpts=PTS-STARTPTS+{a:.6f}/TB[q{k}]')
    fc.append(f"[{last}][q{k}]overlay=eof_action=pass:enable='between(t,{a - 0.001:.4f},{b - 0.5 / FPS:.4f})'[o{k}]"); last = f'o{k}'
tmp = film + '.new.mp4'
args += ['-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '4500k', '-bufsize', '9000k', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'copy', '-movflags', '+faststart', tmp]
subprocess.run(args, check=True); os.replace(tmp, film); print('spliced', len(seg), 'segments into', film)
