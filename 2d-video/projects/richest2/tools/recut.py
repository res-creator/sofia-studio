# Финальная сборка v2: вставляет перерисованные сцены (build/redo) и вырезает лишние паузы на чёрных карточках.
#   python3 tools/recut.py            → out/richest_toon_1080p.mp4, build/richest_cut.srt
# Исходник видео: build/prev_1080p.mp4 (предыдущая полная сборка). Голос, музыка и субтитры сдвигаются вместе с вырезами.
import json, os, re, subprocess
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(P, 'build'); O = os.path.join(P, 'out')
ROOT = os.path.abspath(os.path.join(P, '../../..')); FPS = 24
fr = lambda t: round(t * FPS) / FPS
# вырезы [a, b) в исходном времени: оставляем ~2 с карточки, голос начинается сразу после
CUTS = [(fr(a), fr(b)) for a, b in [(375.4, 379.5), (618.3, 622.0), (832.1, 836.3), (953.1, 957.7), (1025.3, 1028.0)]]
def remap(t):
    d = 0
    for a, b in CUTS:
        if t >= b: d += b - a
        elif t > a: return a - d
    return t - d
def run(*a, **k): subprocess.run(a, check=True, **k)

END = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(B, 'mix.wav')]))
keep = []; s = 0.0
for a, b in CUTS: keep.append((s, a)); s = b
keep.append((s, END))
NEW_END = sum(b - a for a, b in keep)

# 1) голос без пауз
fc = ';'.join(f'[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS[a{i}]' for i, (a, b) in enumerate(keep))
fc += ';' + ''.join(f'[a{i}]' for i in range(len(keep))) + f'concat=n={len(keep)}:v=0:a=1[o]'
run('ffmpeg', '-y', '-v', 'error', '-i', os.path.join(P, 'input/voiceover.mp3'), '-filter_complex', fc, '-map', '[o]', '-ar', '48000', os.path.join(B, 'vo_cut.wav'))
# 2) музыка: те же треки, сдвинутые по новому времени
cues = json.load(open(os.path.join(P, 'story/music.json')))
for c in cues: c['start'], c['end'] = remap(c['start']), remap(c['end'])
json.dump(cues, open(os.path.join(B, 'music_cut.json'), 'w'), indent=1)
run('python3', os.path.join(P, 'tools/mix.py'), f'{NEW_END:.3f}', env={**os.environ, 'VO': os.path.join(B, 'vo_cut.wav'), 'CUES': os.path.join(B, 'music_cut.json'), 'OUT': os.path.join(B, 'mix_cut.wav')})

# 3) видео: старая сборка + перерисованные сцены, затем вырезы
redo = [(fr(a), fr(b), os.path.join(B, 'redo', f'{i:02d}.mp4')) for i, (a, b) in enumerate(json.load(open(os.path.join(B, 'redo.json'))))]
segs = []; t = 0.0   # (src_index, a, b) в исходном времени
for a, b, f in redo:
    if a > t: segs.append((0, t, a))
    segs.append((f, a, b)); t = b
segs.append((0, t, END))
pieces = []   # режем вырезы внутри сегментов
for src, a, b in segs:
    cur = a
    for ca, cb in CUTS:
        if cb <= cur or ca >= b: continue
        if ca > cur: pieces.append((src, cur, ca, a))
        cur = max(cur, cb)
    if cur < b - 1e-6: pieces.append((src, cur, b, a))
inputs = ['-i', os.path.join(B, 'prev_1080p.mp4')]; idx = {0: 0}
for _, _, f in redo: idx[f] = len(inputs) // 2; inputs += ['-i', f]
fc = []
for i, (src, a, b, s0) in enumerate(pieces):
    off = 0 if src == 0 else s0
    fc.append(f'[{idx[src]}:v]trim=start={a - off:.4f}:end={b - off:.4f},setpts=PTS-STARTPTS,fps={FPS},format=yuv420p[v{i}]')
fc.append(''.join(f'[v{i}]' for i in range(len(pieces))) + f'concat=n={len(pieces)}:v=1:a=0[v]')
f1 = os.path.join(O, 'richest_toon_1080p.mp4'); f2 = os.path.join(O, 'richest_toon_phone_720p.mp4')
run('ffmpeg', '-y', '-v', 'error', *inputs, '-i', os.path.join(B, 'mix_cut.wav'), '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', f'{len(inputs) // 2}:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '5000k', '-bufsize', '10000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', f1)

# 4) субтитры по новому времени
def ts(x): x = max(0, x); h, r = divmod(x, 3600); m, s = divmod(r, 60); return f'{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)) % 1000:03d}'
def pt(s): h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
srt = open(os.path.join(ROOT, 'ru_geo/richest/richest.srt'), encoding='utf-8').read()
srt = re.sub(r'(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)', lambda m: f'{ts(remap(pt(m.group(1))))} --> {ts(remap(pt(m.group(2))))}', srt)
open(os.path.join(B, 'richest_cut.srt'), 'w', encoding='utf-8').write(srt)
print('chapters:', [(c, f'{int(remap(c) // 60)}:{int(remap(c) % 60):02d}') for c in [0, 89.0, 196.3, 373.4, 616.2, 830.0, 951.0]])
print('FINAL', NEW_END)
