# Вставить перерисованные сцены build/redo/NN.mp4 (границы из build/redo.json) в готовый фильм, звук берётся из старого файла
import json, subprocess, os
R = '/home/user/sofia-studio/2d-video/projects/ww3toon/build'
SRC = '/home/user/sofia-studio/ru_geo/ww3/video_toon/ww3_toon_1080p.mp4'
OUT = R + '/ww3_toon_fixed.mp4'
P = R + '/splice'; os.makedirs(P, exist_ok=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SRC]))
rd = [[round(a * 24) / 24, round(e * 24) / 24] for a, e in json.load(open(R + '/redo.json'))]
enc = ['-an', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '24', '-maxrate', '6000k', '-bufsize', '12000k']
parts, cur = [], 0.0
for i, (a, e) in enumerate(rd):
    if a - cur > 0.02:
        f = f'{P}/old_{i:02d}.mp4'
        if not os.path.exists(f): subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{cur:.4f}', '-i', SRC, '-t', f'{a - cur:.4f}', *enc, f], check=True)
        parts.append(f)
    f = f'{P}/new_{i:02d}.mp4'
    if not os.path.exists(f): subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{R}/redo/{i:02d}.mp4', '-t', f'{e - a:.4f}', *enc, f], check=True)
    parts.append(f); cur = e
if dur - cur > 0.02:
    f = f'{P}/old_end.mp4'; subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{cur:.4f}', '-i', SRC, '-t', f'{dur - cur:.4f}', *enc, f], check=True); parts.append(f)
open(P + '/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', P + '/list.txt', '-i', SRC, '-map', '0:v', '-map', '1:a', '-c', 'copy', '-movflags', '+faststart', OUT], check=True)
print(OUT, subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', OUT]).decode().strip(), dur)
