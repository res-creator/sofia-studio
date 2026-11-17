# Сборка: куски build/chunks/c*.mp4 + build/mix.wav → ru_geo/remote/video/remote_1080p.mp4
import os, subprocess
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(P, 'build'); O = os.path.abspath(os.path.join(P, '../../../ru_geo/remote/video')); os.makedirs(O, exist_ok=True)
ch = sorted(f for f in os.listdir(os.path.join(B, 'chunks')) if f.endswith('.mp4') and 'tmp' not in f)
lst = os.path.join(B, 'chunks', 'list.txt'); open(lst, 'w').write(''.join(f"file '{os.path.join(B, 'chunks', c)}'\n" for c in ch))
run = lambda *a: subprocess.run(list(a), check=True)
f1 = os.path.join(O, 'remote_1080p.mp4')
run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', os.path.join(B, 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '4500k', '-bufsize', '9000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', f1)
print('FINAL', f1)
