# QC движения: кадры 4 к/с, 160×90, средняя разница соседних кадров; склейки (scene > 0,2) в минуту,
# самый длинный отрезок «ничего не движется» (разница < THR подряд).   python3 tools/qc_motion.py video.mp4 [from to]
import subprocess, sys
import numpy as np
v = sys.argv[1]; a = sys.argv[2] if len(sys.argv) > 2 else None; b = sys.argv[3] if len(sys.argv) > 3 else None
rng = (['-ss', a, '-to', b] if a else [])
raw = subprocess.run(['ffmpeg', '-v', 'error', *rng, '-i', v, '-vf', 'fps=4,scale=160:90,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32)
d = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2)); import os; THR = float(os.environ.get('THR', 1.2))
run = best = 0; at = 0; bi = 0
for i, x in enumerate(d):
    run = run + 1 if x < THR else 0
    if run > best: best, bi = run, i
sc = subprocess.run(['ffmpeg', '-v', 'info', *rng, '-i', v, '-vf', "select='gt(scene,0.2)',showinfo", '-f', 'null', '-'], capture_output=True, text=True).stderr.count('pts_time')
dur = len(F) / 4
print(f'dur {dur:.1f}s  cuts(scene>0.2) {sc}  per min {sc / dur * 60:.1f}  frames moving {np.mean(d >= THR) * 100:.0f}%  longest static {best / 4:.2f}s at {(float(a or 0) + (bi - best + 1) / 4):.1f}s')
