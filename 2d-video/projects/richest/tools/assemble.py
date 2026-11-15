# Сборка финала: куски рендера → архивные вставки в «окна» шаблона archive → звук (build/mix.wav) → out/.
#   python3 tools/assemble.py            (из папки проекта или откуда угодно)
import json, os, subprocess, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.abspath(os.path.join(P, '../../..'))
B = os.path.join(P, 'build'); OUT = os.path.join(P, 'out'); os.makedirs(OUT, exist_ok=True)
story = json.load(open(os.path.join(P, 'story/shots.json')))
clips = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'ru_geo/richest/archive.json')))['clips']}
run = lambda *a: subprocess.run(list(a), check=True)

# 1) склейка кусков
chunks = sorted(f for f in os.listdir(os.path.join(B, 'chunks')) if f.endswith('.mp4') and not f.endswith('.tmp.mp4'))
lst = os.path.join(B, 'chunks', 'list.txt')
open(lst, 'w').write(''.join(f"file '{os.path.join(B, 'chunks', c)}'\n" for c in chunks))

# 2) архивные отрезки под размер окна
RECT = {'16:9': (231, 90, 1458, 820), '4:3': (413, 90, 1093, 820)}
segdir = os.path.join(B, 'arch'); os.makedirs(segdir, exist_ok=True)
segs = []
for s in story['shots']:
    if s['tpl'] != 'archive': continue
    p = s['params']; c = clips[p['clip']]; x, y, w, h = RECT[p.get('aspect', '16:9')]
    d = s['end'] - s['start']; f = os.path.join(segdir, f"{s['id']}.mp4")
    src = os.path.join(ROOT, c['file'])
    if not os.path.exists(f) and src.lower().endswith(('.jpg', '.jpeg', '.png')):   # фото: статично, целиком в окне
        run('ffmpeg', '-y', '-v', 'error', '-loop', '1', '-t', f'{d + 0.1:.3f}', '-i', src, '-vf',
            f'scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=0x0a0c12,setsar=1,fps=24,format=yuv420p',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', f)
    if not os.path.exists(f):
        run('ffmpeg', '-y', '-v', 'error', '-ss', str(p.get('from', 0)), '-t', f'{d + 0.1:.3f}', '-i', src, '-an',
            '-vf', f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,fps=24,eq=saturation=0.92,fade=in:0:5,format=yuv420p',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', f)
    segs.append((s['start'], s['end'], x, y, f))
print(len(segs), 'archive inserts')

# 3) наложение + звук
args = ['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst]
for a, b, x, y, f in segs: args += ['-itsoffset', f'{a:.3f}', '-i', f]
mix = os.path.join(B, 'mix.wav'); args += ['-i', mix]
fc, last = [], '0:v'
for i, (a, b, x, y, f) in enumerate(segs):
    fc.append(f"[{last}][{i + 1}:v]overlay={x}:{y}:eof_action=pass:enable='between(t,{a:.3f},{b:.3f})'[v{i}]"); last = f'v{i}'
final = os.path.join(OUT, os.environ.get('FINAL', 'richest_final_1080p.mp4'))
args += ['-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-map', f'{len(segs) + 1}:a', '-c:v', 'libx264', '-preset', 'medium',
         '-crf', '20', '-maxrate', '4500k', '-bufsize', '9000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k', '-shortest',
         '-movflags', '+faststart', final]
run(*args)
if os.environ.get('FINAL'): sys.exit(0)
phone = os.path.join(OUT, 'richest_phone_720p.mp4')
run('ffmpeg', '-y', '-v', 'error', '-i', final, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-maxrate', '1500k',
    '-bufsize', '3000k', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', phone)
print('FINAL', final, phone)
