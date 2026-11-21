# Сборка пробного куска: build/chunks/c*.mp4 + звук (tools/mix_v2.py) -> ru_geo/paperson/video/paperson_1080p_raw.mp4
import os, subprocess
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(P, 'build'); R = os.path.abspath(os.path.join(P, '../../..'))
run = lambda *a: subprocess.run(list(a), check=True)
ch = sorted(f for f in os.listdir(os.path.join(B, 'chunks')) if f.endswith('.mp4') and 'tmp' not in f)
lst = os.path.join(B, 'chunks', 'list.txt'); open(lst, 'w').write(''.join(f"file '{os.path.join(B, 'chunks', c)}'\n" for c in ch))
sil = os.path.join(B, 'silent.mp4'); run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', sil)
mix = os.path.join(B, 'mix.wav'); run('python3', os.path.join(P, 'tools/mix_v2.py'), mix)
os.makedirs(os.path.join(R, 'ru_geo/paperson/video'), exist_ok=True)
out = os.path.join(R, 'ru_geo/paperson/video/paperson_1080p_raw.mp4')
run('ffmpeg', '-y', '-v', 'error', '-i', sil, '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '4500k', '-bufsize', '9000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', out)
print('FINAL', out)
