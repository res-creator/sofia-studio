# Сборка: куски build/chunks/c*.mp4 + build/mix.wav → out/richest_toon_1080p.mp4 и out/richest_toon_phone_720p.mp4
import os, subprocess
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(P, 'build'); O = os.path.join(P, 'out'); os.makedirs(O, exist_ok=True)
ch = sorted(f for f in os.listdir(os.path.join(B, 'chunks')) if f.endswith('.mp4') and 'tmp' not in f)
lst = os.path.join(B, 'chunks', 'list.txt'); open(lst, 'w').write(''.join(f"file '{os.path.join(B, 'chunks', c)}'\n" for c in ch))
run = lambda *a: subprocess.run(list(a), check=True)
f1 = os.path.join(O, 'richest_toon_1080p.mp4'); f2 = os.path.join(O, 'richest_toon_phone_720p.mp4')
run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', os.path.join(B, 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '4500k', '-bufsize', '9000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', f1)
run('ffmpeg', '-y', '-v', 'error', '-i', f1, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', f2)
print('FINAL', f1, f2)
