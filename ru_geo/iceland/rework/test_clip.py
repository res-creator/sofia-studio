# Тестовый отрывок: рендер подряд идущих планов от k0 до k1 (включительно) + тот же кусок готового звука (cache/audio.wav).
#   python3 rework/test_clip.py u10 u19 send/test_vikings.mp4
import os, subprocess, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, D)
from timeline import build
k0, k1, out = sys.argv[1:4]
_, shots, _ = build()
ks = [x['key'] for x in shots]; i0, i1 = ks.index(k0), ks.index(k1)
sel = shots[i0:i1 + 1]; t0 = sel[0]['start']; dur = sum(x['dur'] for x in sel)
os.environ['KEYS'] = ','.join(x['key'] for x in sel)
import render
tmp = out + '.v.mp4'; render.video(tmp)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ss', f'{t0:.3f}', '-t', f'{dur:.3f}', '-i', f'{D}/cache/audio.wav',
                '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                '-shortest', '-movflags', '+faststart', out], check=True)
os.remove(tmp); print('done', out, f'{t0:.2f}', f'{dur:.2f}')
