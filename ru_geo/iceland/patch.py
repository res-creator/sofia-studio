# Точечная пересборка: перерендерить только исправленные планы и вклеить их в готовый cache/video.mp4,
# потом заново свести с cache/audio.wav. Быстрее полного рендера (≈ 70 мин).
#   python3 patch.py b08,u08 [out.mp4]
# Для каждого плана рендерится окно «соседний — план — соседний» (чтобы переходы были настоящими),
# а вклеивается его середина: от середины предыдущего плана до середины следующего.
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from timeline import build

keys = sys.argv[1].split(','); out = sys.argv[2] if len(sys.argv) > 2 else f'{D}/cache/iceland.mp4'
_, shots, total = build()
idx = {s['key']: i for i, s in enumerate(shots)}
wins = []
for k in keys:
    i = idx[k]; a, b = max(0, i - 1), min(len(shots) - 1, i + 1)
    t0 = shots[a]['start']
    c0 = shots[a]['start'] + shots[a]['dur'] / 2 if a < i else shots[i]['start']
    c1 = shots[b]['start'] + shots[b]['dur'] / 2 if b > i else total
    wins.append(dict(key=k, keys=','.join(shots[j]['key'] for j in range(a, b + 1)), t0=t0, c0=c0, c1=c1, f=f'{D}/cache/patch_{k}.mp4'))

def run(w):
    env = dict(os.environ, KEYS=w['keys'])
    subprocess.run([sys.executable, '-c', f"import sys; sys.path.insert(0, {D!r}); import render; render.video({w['f']!r})"], env=env, check=True)
    print('patch', w['key'], f"{w['c0']:.2f}–{w['c1']:.2f}", flush=True)
with ThreadPoolExecutor(3) as ex: list(ex.map(run, wins))

# вклейка: каждый кусок сдвигаем на его место и показываем только в окне [c0, c1)
ins, flt, last = ['-i', f'{D}/cache/video.mp4'], [], '0:v'
for n, w in enumerate(wins, 1):
    ins += ['-itsoffset', f"{w['t0']:.4f}", '-i', w['f']]
    flt.append(f"[{last}][{n}:v]overlay=enable='between(t,{w['c0']:.4f},{w['c1'] - 0.001:.4f})'[v{n}]"); last = f'v{n}'
tmp = f'{D}/cache/video_patched.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', f'[{last}]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', tmp], check=True)
os.replace(tmp, f'{D}/cache/video.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/cache/video.mp4', '-i', f'{D}/cache/audio.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
                '-maxrate', '3500k', '-bufsize', '7000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
print('done', out)
