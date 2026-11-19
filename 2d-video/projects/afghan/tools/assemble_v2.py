# Сборка v2: build/chunks/c*.mp4 + звук (tools/mix_v2.py) → ru_geo/afghan/video/afghan_1080p_v2.mp4
# и отрезок-тест ru_geo/afghan/test/afghan_test2.mp4 (434.09–550.16, вырезан из того же рендера, свой звук −14 LUFS).
import os, subprocess
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(P, 'build'); R = os.path.abspath(os.path.join(P, '../../..'))
run = lambda *a: subprocess.run(list(a), check=True)
ch = sorted(f for f in os.listdir(os.path.join(B, 'chunks')) if f.endswith('.mp4') and 'tmp' not in f)
lst = os.path.join(B, 'chunks', 'list.txt'); open(lst, 'w').write(''.join(f"file '{os.path.join(B, 'chunks', c)}'\n" for c in ch))
sil = os.path.join(B, 'v2_silent.mp4'); run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', sil)
mix = os.path.join(B, 'v2_mix.wav'); run('python3', os.path.join(P, 'tools/mix_v2.py'), mix)
enc = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '4500k', '-bufsize', '9000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart']
f1 = os.path.join(R, 'ru_geo/afghan/video/afghan_1080p_v2.mp4'); run('ffmpeg', '-y', '-v', 'error', '-i', sil, '-i', mix, '-map', '0:v', '-map', '1:a', *enc, '-shortest', f1)
tm = os.path.join(B, 'test2_mix.wav'); run('python3', os.path.join(P, 'tools/mix_v2.py'), tm, '434.09', '550.16')
f2 = os.path.join(R, 'ru_geo/afghan/test/afghan_test2.mp4'); run('ffmpeg', '-y', '-v', 'error', '-ss', '434.09', '-to', '550.16', '-i', sil, '-i', tm, '-map', '0:v', '-map', '1:a', *enc, '-shortest', f2)
for f in (mix, tm): os.remove(f)
print('FINAL', f1, f2)
