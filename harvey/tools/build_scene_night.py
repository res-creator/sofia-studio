# Harvey — finished 90-120 s scene for the owner: "The night the water rose" (Sat Aug 26 night -> Sun Aug 27 -> a hoist).
# Temporary local voice (Piper; not the narrator). Music: Mixkit Stock Music Free License, logged in
# lahaina/assets/music/music_log.json — 188 "Echoes" (Andrew Ev), 597 "Vertigo", 679 "Epical Drums 04" (Grigoriy Nuzhny),
# 168 "Staring at the Night Sky" (Alejandro Magaña). Archive sound = each clip's own sound. Nothing added.
# Output: harvey/rough/harvey_scene_night_tempvoice.mp4 (+ _phone)
import os, subprocess, wave, json, numpy as np
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
RAW = ROOT + '/assets/raw/dvids'; MUS = os.path.abspath(ROOT + '/../lahaina/assets/music')
TMP = os.environ.get('EX_TMP', '/tmp/harvey_scene'); PIPER = os.environ['PIPER_DIR'] + '/en_US-ryan-medium.onnx'
os.makedirs(TMP, exist_ok=True)
W, H, FPS, SR = 1280, 720, 25, 48000
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'; BG = '0x101214'
def run(c, **k): subprocess.run(c, check=True, **k)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def esc(t): return t.replace(':', '\\:').replace("'", '’').replace(',', '\\,')

# Beats: shots = list of (src, in, seconds or None=rest). nat = level of the clip's own sound. Narration in present tense.
NIGHT = [('map', 'night_scene')]
BEATS = [
 dict(id='n1', shots=NIGHT, vo="Saturday night, August twenty-sixth. Harvey's rain bands settle over Houston, and stay.", hold=0.6),
 dict(id='n2', shots=NIGHT, vo="At 9:27, the weather service issues its first flash flood emergency.", hold=0.8),
 dict(id='n3', shots=NIGHT, vo="By two in the morning, five inches have fallen at Hobby Airport.", hold=0.6),
 dict(id='n4', shots=NIGHT, vo="By nine, more than eleven.", hold=1.6),
 dict(id='d1', shots=[('map', 'dickinson')], vo="In Dickinson, south-east of the city, the water is already inside Matthew Dusek's house.", hold=0.5,
      label=None),
 dict(id='d2', shots=[('black',)], bite=('551726', 22.28, 25.80), hold=1.4, label='Voice: CPO Matthew Dusek, U.S. Coast Guard · interview Sept. 4, 2017'),
 dict(id='m1', shots=[('546389', 42.0, None)], vo="When daylight comes, the highways are rivers.", hold=1.2, nat=0.7, label='Houston, Sunday, Aug. 27, 2017 · Texas National Guard'),
 dict(id='m2', shots=[('546166', 2.0, None)], vo="Cars sit in water up to their windows.", hold=1.0, nat=0.7, label='Houston, Aug. 27 · Coast Guard flood team'),
 dict(id='m3', shots=[('546389', 8.0, 6.0), ('546389', 63.0, None)], vo="In fifteen hours, Harris County's 911 lines take fifty-six thousand calls. The county judge asks anyone with a boat to come and help.", hold=1.0, nat=0.6, label='Houston, Aug. 27 · Texas National Guard'),
 dict(id='r1', shots=[('546164', 27.0, None)], vo="Those who cannot get out go up.", hold=0.4, nat=0.3, label='Houston, Aug. 27 · from a Coast Guard helicopter'),
 dict(id='r2', shots=[('546574', 2.0, None)], vo="Onto their roofs. And wait.", hold=4.2, nat=0, label='Coast Guard hoist camera, Houston, Aug. 27–28'),
 dict(id='h1', shots=[('546164', 45.0, None)], vo="Overhead, Coast Guard crews work down lists of 911 addresses. One roof at a time.", hold=1.0, nat=0.55, label='Coast Guard, Houston, Aug. 27, 2017'),
 dict(id='h2', shots=[('546574', 46.0, None)], hold=9.0, nat=0, label='Coast Guard hoist camera, Houston, Aug. 27–28'),
 dict(id='h3', shots=[('546574', 62.0, None)], hold=13.5, nat=0, label='Coast Guard hoist camera, Houston, Aug. 27–28'),
 dict(id='h4', shots=[('546164', 79.0, None)], hold=6.0, nat=0.6, label='Coast Guard, Houston, Aug. 27, 2017'),
 dict(id='e1', shots=[('546164', 108.0, None)], vo="Across Texas, more than a hundred and twenty-two thousand people would be rescued. That Sunday, it had only begun.", hold=3.5, nat=0.55,
      label='Coast Guard Air Station Houston, Aug. 27, 2017'),
]

for b in BEATS:
    if 'vo' in b:
        p = f"{TMP}/{b['id']}.wav"
        if not (os.path.exists(p) and os.path.exists(p + '.txt') and open(p + '.txt').read() == b['vo']):
            run(['python3', '-m', 'piper', '-m', PIPER, '--length-scale', '1.18', '--sentence-silence', '0.5', '-f', p], input=b['vo'], text=True, capture_output=True)
            open(p + '.txt', 'w').write(b['vo'])
t = 0.0; TL = []
for b in BEATS:
    lead = 0.35 if ('vo' in b or 'bite' in b) else 0.0
    speech = dur(f"{TMP}/{b['id']}.wav") if 'vo' in b else (b['bite'][2] - b['bite'][1]) if 'bite' in b else 0.0
    d = lead + speech + b['hold']; TL.append(dict(b, s=t, sp=t + lead, d=d, speech=speech)); t += d
TOTAL = t; T = {x['id']: x for x in TL}

# night map: one continuous shot over n1..n4; clock keyed to the words
ns = T['n1']['s']; ne = T['n4']['s'] + T['n4']['d']
E_ = lambda k: T[k]['s'] + T[k]['d'] - ns
keys = [[0.0, '2017-08-26 20:30'], [T['n2']['sp'] - ns + 0.3, '2017-08-26 21:27'], [E_('n2') - 0.2, '2017-08-26 21:40'],
        [T['n3']['sp'] - ns + 0.2, '2017-08-27 02:00'], [E_('n3') - 0.2, '2017-08-27 02:20'],
        [T['n4']['sp'] - ns + 0.2, '2017-08-27 09:00'], [ne - ns, '2017-08-27 09:00']]
mp = f'{TMP}/night2_{ne - ns:.2f}.mp4'
env = dict(os.environ, NIGHT_KEYS=json.dumps(keys), NIGHT_DUR=f'{ne - ns:.3f}')
if not os.path.exists(mp): run(['python3', ROOT + '/tools/maps_v4.py', 'night_scene', f'{ne - ns:.3f}', mp, str(W), str(H)], env=env)

FIT = f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color={BG},setsar=1'
def lab(s): return '' if not s else (f",drawbox=x=0:y=ih-56:w=iw:h=56:color=black@0.40:t=fill,drawtext=fontfile={FONT}:text='{esc(s)}':fontsize=17:fontcolor=white@0.9:x=32:y=h-37")
ENC = ['-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p']
segs = []; clip_audio = []   # (src, in, at, len, level)
done_map = False
for x in TL:
    if x['shots'] == NIGHT:
        if not done_map: segs.append(mp); done_map = True
        continue
    if x['shots'][0][0] == 'map':
        m2 = f"{TMP}/{x['shots'][0][1]}_{x['d']:.2f}.mp4"
        if not os.path.exists(m2): run(['python3', ROOT + '/tools/maps_v4.py', x['shots'][0][1], f"{x['d']:.3f}", m2, str(W), str(H)])
        segs.append(m2); continue
    fixed = sum(s[2] for s in x['shots'] if len(s) > 2 and s[2]); at = x['s']
    for j, sh in enumerate(x['shots']):
        out = f"{TMP}/v_{x['id']}_{j}.mp4"
        if sh[0] == 'black':
            run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=black:s={W}x{H}:r={FPS}:d={x["d"]:.3f}', '-vf', 'null' + lab(x.get('label'))] + ENC + [out]); segs.append(out); continue
        src, a, ln = sh[0], sh[1], (sh[2] if len(sh) > 2 and sh[2] else x['d'] - fixed)
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-i', f'{RAW}/dvids_{src}.mp4', '-vf', FIT + f',tpad=stop_mode=clone:stop_duration={ln:.2f}' + lab(x.get('label')), '-t', f'{ln:.3f}'] + ENC + [out])
        segs.append(out); clip_audio.append((src, a, at, ln, x.get('nat', 0))); at += ln
open(TMP + '/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in segs))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', TMP + '/list.txt', '-c', 'copy', TMP + '/video.mp4'])

# ---- sound
N = int((TOTAL + 1) * SR); tt = np.arange(N) / SR
def rd(src, ss=None, t=None, ch=1):
    run(['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', src, '-ac', str(ch), '-ar', str(SR), TMP + '/x.wav'])
    with wave.open(TMP + '/x.wav') as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a.reshape(-1, ch) if ch > 1 else a
def rms(a): return float(np.sqrt((a ** 2).mean())) + 1e-9
voice = np.zeros(N, np.float32); nat = np.zeros(N, np.float32)
def put(buf, at, a, fade=0.05):
    i = int(at * SR); a = a[:max(0, N - i)].copy(); f = min(len(a) // 2, int(fade * SR))
    if f: a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    buf[i:i + len(a)] += a
for x in TL:
    if 'vo' in x: a = rd(f"{TMP}/{x['id']}.wav"); put(voice, x['sp'], a / rms(a) * 0.085)
    if 'bite' in x:
        s, a0, a1 = x['bite']; a = rd(f'{RAW}/dvids_{s}.mp4', a0, a1 - a0); a -= a.mean(); put(voice, x['sp'], a / rms(a) * 0.09)
for src, a0, at, ln, lvl in clip_audio:
    if lvl > 0:
        a = rd(f'{RAW}/dvids_{src}.mp4', a0, ln); put(nat, at, a / rms(a) * 0.05 * lvl, fade=0.2)
def track(n, a0, a1, off, fin, fout, lvl):
    m = rd(f'{MUS}/mk{n}.mp3', off, a1 - a0 + 2, ch=2); m = m / rms(m) * lvl
    out = np.zeros((N, 2), np.float32); i0 = int(a0 * SR); seg = m[:max(0, min(len(m), N - i0))]; out[i0:i0 + len(seg)] = seg
    env = np.clip((tt - a0) / fin, 0, 1) * np.clip((a1 - tt) / fout, 0, 1); return out * env[:, None]
# music by scene: night dread -> dawn pulse -> silence on the roofs -> drums under the hoist -> release
music = (track('188', 0.0, T['m3']['s'] + T['m3']['d'] + 1.0, 8.0, 3.0, 2.5, 0.045)                    # Echoes: the night, rising
         + track('597', T['m1']['s'] - 0.5, T['h1']['s'] + 4.0, 20.0, 2.0, 3.5, 0.040)                  # Vertigo: dawn, the calls, the roofs
         + track('679', T['h1']['s'] + 1.0, T['h4']['s'] + T['h4']['d'], 0.0, 4.0, 2.0, 0.050)          # Epical Drums 04: the hoist
         + track('168', T['e1']['s'] - 0.8, TOTAL + 1.0, 8.0, 2.5, 3.0, 0.042))                         # Staring at the Night Sky: release
def sm(x, w):
    n = int(w * SR); c = np.concatenate([[0], np.cumsum(np.abs(x), dtype=np.float64)]); y = (c[n:] - c[:-n]) / n
    return np.pad(y, (n // 2, len(x) - len(y) - n // 2)).astype(np.float32)
vact = np.clip(sm(voice, 0.35) / 0.02, 0, 1)
duck = 1 - 0.5 * vact
# "And wait." — the music drops away and comes back over the held roof shot
w0 = T['r2']['sp'] - 0.3; w1 = T['r2']['s'] + T['r2']['d']
gap = ((tt > w0) & (tt < w1)).astype(np.float32); gap = np.convolve(gap, np.ones(int(0.5 * SR)) / int(0.5 * SR), 'same') if False else gap
duck *= 1 - 0.7 * np.clip(np.minimum((tt - w0) / 0.5, (w1 - tt) / 1.2), 0, 1)
# the hoist plays without words: drums come up
duck *= 1 + 0.4 * np.clip((tt - T['h2']['s']) / 3, 0, 1) * np.clip((T['h4']['s'] + T['h4']['d'] - tt) / 2, 0, 1)
mix = (voice + nat * (1 - 0.55 * vact))[:, None] + music * duck[:, None]
mix *= np.clip((TOTAL - tt) / 2.5, 0, 1)[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open(TMP + '/mix.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
out = ROOT + '/rough/harvey_scene_night_tempvoice.mp4'
run(['ffmpeg', '-v', 'error', '-y', '-i', TMP + '/video.mp4', '-i', TMP + '/mix.wav', '-filter_complex',
     f"[0:v]drawtext=fontfile={FONT}:text='SCENE TEST · TEMPORARY VOICE (not the narrator)':fontsize=14:fontcolor=white@0.45:x=w-text_w-22:y=16[v];[1:a]loudnorm=I=-15:TP=-1.5[a]",
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])
run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-vf', 'scale=960:540', '-c:v', 'libx264', '-crf', '27', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out.replace('.mp4', '_phone.mp4')])
json.dump([{k: v for k, v in x.items() if k != 'shots'} for x in TL], open(TMP + '/tl.json', 'w'), indent=1)
print('total', round(TOTAL, 1))
