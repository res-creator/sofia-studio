# Укорачивает уже скачанные куски до нужной длины (экономия диска).
import os, subprocess
from plan import build, dur
SEG = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'pixabay', 'seg')
need = {}
for s in build()['segs']: k = f"{s['id']}_{s['ss']}"; need[k] = max(need.get(k, 0), s['dur'])
for k, n in need.items():
    p = f'{SEG}/{k}.mp4'
    if not os.path.exists(p) or dur(p) <= n * 1.1 + 1.3: continue
    tmp = p + '.tmp.mp4'
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-t', f'{n*1.1+1:.2f}', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', tmp])
    if r.returncode == 0: os.replace(tmp, p)
print('ok')
