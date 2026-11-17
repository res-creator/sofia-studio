# vedit.py — точечный монтаж готового фильма без полного рендера.
# Берёт старый финальный MP4 (картинка), старый голос, слова, SRT и музыку; применяет правки из JSON:
#   {"cut": [a, b], "vcut": [a2, b2]}        вырезать [a, b] из голоса; картинку вырезать [a2, b2] ⊇ [a, b] (по границам кадров),
#                                            а щели между ними закрыть стоп-кадром (без «вспышек» соседних сцен)
#   {"replace": [a, b], "clip": wav, "video": mp4, "pre": .1, "post": .2, "srt": "..."}   заменить кусок новой фразой и новой картинкой
#   {"insert": t, "clip": wav, "video": mp4, "pre": .25, "post": .3, "srt": "..."}
#   {"vfile": [a, b], "video": mp4}           заменить только картинку (тот же тайминг)
#   {"overlay": [a, b], "png": p, "x": 60, "y": 40}   поверх старой картинки (время в старой шкале)
# Всё выровнено по кадрам (24 к/с); звук собирается сэмпл-в-сэмпл, музыка пересводится заново (mix.py) по сдвинутым меткам.
# usage: python3 vedit.py spec.json
import json, os, subprocess, sys
FPS, SR = 24, 48000; SPF = SR // FPS
spec = json.load(open(sys.argv[1])); W = spec['work']; os.makedirs(W, exist_ok=True)
run = lambda *a: subprocess.run(list(a), check=True)
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
F = lambda t: int(round(t * FPS))
END = F(spec.get('end') or dur(spec['src_video']))
ops = sorted(spec['ops'], key=lambda o: F((o.get('vcut') or o.get('cut') or o.get('replace') or o.get('vfile') or [o.get('insert', 0)])[0]) if 'overlay' not in o else -1)
overlays = [o for o in ops if 'overlay' in o]; ops = [o for o in ops if 'overlay' not in o]
segs = []   # (n_frames, audio, video)  audio: ('old', f0) | ('clip', path, pre_frames) ; video: ('old', f0) | ('freeze', f) | ('file', path)
maps = []   # (old_f0, old_f1, new_f0) для пересчёта времени
c = 0
def old(a, b):
    if b > a: segs.append((b - a, ('old', a), ('old', a)))
for o in ops:
    if 'cut' in o:
        a0, a1 = map(F, o['cut']); v0, v1 = map(F, o.get('vcut') or o['cut']); assert v0 <= a0 and a1 <= v1, o
        old(c, v0)
        if a0 > v0: segs.append((a0 - v0, ('old', v0), ('freeze', v0 - 1)))
        if v1 > a1: segs.append((v1 - a1, ('old', a1), ('freeze', v1)))
        c = v1
    elif 'replace' in o or 'insert' in o:
        a0, a1 = (map(F, o['replace']) if 'replace' in o else (F(o['insert']),) * 2)
        old(c, a0); pre, post = F(o.get('pre', 0.15)), F(o.get('post', 0.25)); n = pre + int(-(-dur(o['clip']) * FPS // 1)) + post
        segs.append((n, ('clip', o['clip'], pre), ('file', o['video']) if o.get('video') else ('freeze', a0 - 1))); o['_new'] = True; o['_n'] = n; o['_pre'] = pre
        c = a1
    elif 'vfile' in o:
        a0, a1 = map(F, o['vfile']); old(c, a0); segs.append((a1 - a0, ('old', a0), ('file', o['video']))); c = a1
old(c, END)
# новая шкала
t = 0; seg_new = []
for s in segs: seg_new.append(t); t += s[0]
TOTAL = t
for s, n0 in zip(segs, seg_new):
    if s[1][0] == 'old': maps.append((s[1][1], s[1][1] + s[0], n0))
def mp(sec, mode='near'):
    f = sec * FPS
    for a, b, n0 in maps:
        if a <= f < b: return (n0 + f - a) / FPS
    # внутри вырезанного: к ближайшей следующей точке
    nxt = [n0 for a, b, n0 in maps if a >= f]; return (min(nxt) if nxt else TOTAL) / FPS
# ---------------------------------------------------------------- звук
raw = os.path.join(W, 'vo.raw')
with open(raw, 'wb') as out:
    for s in segs:
        n = s[0] * SPF
        if s[1][0] == 'old':
            pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', spec['src_vo'], '-af', f'atrim=start_sample={s[1][1] * SPF}:end_sample={s[1][1] * SPF + n},asetpts=N/SR/TB', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        else:
            pcm = b'\0\0' * (s[1][2] * SPF) + subprocess.run(['ffmpeg', '-v', 'error', '-i', s[1][1], '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        pcm = (pcm + b'\0\0' * n)[: n * 2]; out.write(pcm)
VO = os.path.join(W, 'vo_new.wav'); run('ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', raw, VO); os.remove(raw)
# ---------------------------------------------------------------- картинка
ENC = ['-an', '-c:v', 'libx264', '-crf', '19', '-maxrate', '5000k', '-bufsize', '10000k', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-g', '48', '-bf', '2']
parts = []
for i, (s, n0) in enumerate(zip(segs, seg_new)):
    p = os.path.join(W, f'v{i:03d}.mp4'); parts.append(p)
    if os.path.exists(p): continue
    n, v = s[0], s[2]
    if v[0] == 'old':
        a = v[1]; ovs = [o for o in overlays if F(o['overlay'][0]) < a + n and F(o['overlay'][1]) > a]
        args = ['ffmpeg', '-y', '-v', 'error', '-ss', f'{a / FPS:.5f}', '-i', spec['src_video']]
        if ovs:
            fc = '[0:v]setpts=PTS-STARTPTS[b0]'; last = 'b0'
            for k, o in enumerate(ovs):
                st, en = o['overlay'][0] - a / FPS, o['overlay'][1] - a / FPS
                args += ['-loop', '1', '-i', o['png']]
                fl = 'format=rgba' + (f',fade=t=in:st={st:.3f}:d=0.35:alpha=1' if st >= 0 else '') + (f',fade=t=out:st={en - 0.3:.3f}:d=0.3:alpha=1' if en <= n / FPS else '')
                fc += f";[{k + 1}:v]{fl}[o{k}];[{last}][o{k}]overlay={o.get('x', 60)}:{o.get('y', 40)}:shortest=1:enable='between(t,{max(st, 0):.3f},{en:.3f})'[b{k + 1}]"; last = f'b{k + 1}'
            args += ['-filter_complex', fc, '-map', f'[{last}]']
        run(*args, '-frames:v', str(n), *ENC, p)
    elif v[0] == 'freeze':
        run('ffmpeg', '-y', '-v', 'error', '-ss', f'{max(v[1], 0) / FPS:.5f}', '-i', spec['src_video'], '-vf', f'trim=end_frame=1,tpad=stop_mode=clone:stop={n}', '-frames:v', str(n), *ENC, p)
    else:
        run('ffmpeg', '-y', '-v', 'error', '-i', v[1], '-vf', f'tpad=stop_mode=clone:stop={n}', '-frames:v', str(n), *ENC, p)
lst = os.path.join(W, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
VID = os.path.join(W, 'video_new.mp4'); run('ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', VID)
# ---------------------------------------------------------------- музыка, SRT, слова
cues = json.load(open(spec['cues'])); nc = []
for q in cues:
    s0, s1 = mp(q['start']), mp(min(q['end'], END / FPS))
    if s1 - s0 > 0.5: nc.append({**q, 'start': round(s0, 3), 'end': round(s1, 3)})
CU = os.path.join(W, 'music_new.json'); json.dump(nc, open(CU, 'w'), indent=0)
MIX = os.path.join(W, 'mix_new.wav')
run('env', f'VO={VO}', f'CUES={CU}', f'OUT={MIX}', 'python3', spec['mix_py'], f'{TOTAL / FPS:.3f}')
def ts(x): h, m, s = x.split(':'); s, ms = s.split(','); return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000
def fm(x): x = max(0, x); return f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)) % 1000:03d}'
cut_old = [tuple(map(F, o['replace'])) for o in ops if 'replace' in o]
cues_srt = []
for b in open(spec['srt']).read().strip().split('\n\n'):
    L = b.split('\n'); a, e = ts(L[1][:12]), ts(L[1][17:29]); txt = '\n'.join(L[2:])
    if any(r0 <= F(a) < r1 for r0, r1 in cut_old): continue
    na, ne = mp(a), mp(e - 0.01)
    if ne - na < 0.3: continue
    cues_srt.append((na, ne, txt))
for s, n0 in zip(segs, seg_new):
    if s[1][0] == 'clip':
        o = next(o for o in ops if o.get('clip') == s[1][1]); txt = o.get('srt', ''); st = (n0 + s[1][2]) / FPS; en = st + dur(s[1][1])
        words = txt.split(); half = len(words) // 2 if len(txt) > 84 else len(words)
        if half < len(words):
            mid = st + (en - st) * len(' '.join(words[:half])) / len(txt)
            cues_srt += [(st, mid, ' '.join(words[:half])), (mid, en, ' '.join(words[half:]))]
        else: cues_srt.append((st, en, txt))
cues_srt.sort()
for o, n in spec.get('srt_fix', []): cues_srt = [(a, e, t.replace(o, n).strip()) for a, e, t in cues_srt]
cues_srt = [c for c in cues_srt if c[2]]
open(spec['out_srt'], 'w').write('\n'.join(f'{i + 1}\n{fm(a)} --> {fm(e)}\n{t}\n' for i, (a, e, t) in enumerate(cues_srt)))
json.dump({'total': TOTAL / FPS, 'maps': [[a / FPS, b / FPS, n / FPS] for a, b, n in maps]}, open(os.path.join(W, 'timemap.json'), 'w'))
# ---------------------------------------------------------------- сборка
run('ffmpeg', '-y', '-v', 'error', '-i', VID, '-i', MIX, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', spec['out_video'])
print('DONE', spec['out_video'], round(TOTAL / FPS, 2), 's')
