# Harvey — 60-90 s sound-and-picture test: "Sunday morning, Aug 27" (night -> water in the city -> roofs -> a hoist).
# Temporary local voice (Piper), licensed music (Mixkit Stock Music Free License: 614 "Silent Descent", 593 "Opalescent"),
# original sound of the archive clips. No added effects. Output: harvey/rough/harvey_excerpt_sunday.mp4 (+ _phone).
import os, subprocess, wave, json, numpy as np
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
RAW = ROOT + '/assets/raw/dvids'; MUS = os.path.abspath(ROOT + '/../deepwater/assets/music')
TMP = os.environ.get('EX_TMP', '/tmp/harvey_excerpt'); PIPER = os.environ['PIPER_DIR'] + '/en_US-ryan-medium.onnx'
os.makedirs(TMP, exist_ok=True)
W, H, FPS, SR = 1280, 720, 25, 48000
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'; BG = '0x101214'
def run(c): subprocess.run(c, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def esc(t): return t.replace(':', '\\:').replace("'", '’').replace(',', '\\,')

# ---- the cut. Each beat: picture (src, in) + optional narration / bite; 'hold' = extra seconds of picture after the words.
# nat = level of the clip's own sound (0 = silent clip / muted).
BEATS = [
 dict(id='x0', pic=('black',), hold=2.2, nat=0),
 dict(id='x1', pic=('black',), bite=('551726', 22.28, 25.80), label='Voice: Matthew Dusek, Coast Guard chief · his house in Dickinson · interview Sept. 4, 2017', hold=1.2, nat=0),
 dict(id='x2', pic=('546389', 42.0), vo="By Sunday morning, nearly a foot of rain had fallen overnight at Hobby Airport.", label='Houston, Sunday, Aug. 27, 2017 · Texas National Guard', hold=2.5, nat=0.6),
 dict(id='x3', pic=('546166', 2.0), vo="Roads that had been dry the evening before were under water. And it was still raining.", label='Houston, Aug. 27, 2017 · Coast Guard flood team', hold=2.0, nat=0.6),
 dict(id='x4', pic=('546389', 8.0), vo="In fifteen hours, Harris County's 911 lines took fifty-six thousand calls. The county judge asked anyone with a boat to come and help.", label='Houston, Aug. 27, 2017 · Texas National Guard', hold=3.0, nat=0.6),
 dict(id='x5', pic=('546164', 27.0), vo="Those who could not get out climbed onto their roofs.", label='Houston, Aug. 27, 2017 · from a Coast Guard helicopter', hold=0.8, nat=0.35),
 dict(id='x6', pic=('546574', 2.0), vo="And waited.", label='Coast Guard hoist camera, Houston, Aug. 27–28, 2017', hold=4.5, nat=0, duck=0.0),
 dict(id='x7', pic=('546164', 45.0), vo="The helicopter crews worked from addresses called in to 911, one roof at a time.", label='Coast Guard, Houston, Aug. 27, 2017', hold=1.5, nat=0.45),
 dict(id='x8', pic=('546574', 46.0), hold=10.0, nat=0, label='Coast Guard hoist camera, Houston, Aug. 27–28, 2017'),
 dict(id='x9', pic=('546574', 62.0), hold=15.5, nat=0, label='Coast Guard hoist camera, Houston, Aug. 27–28, 2017'),
 dict(id='x10', pic=('546164', 108.0), vo="Across Texas, more than a hundred and twenty-two thousand people would be rescued. That Sunday, it had only begun.", label='Coast Guard Air Station Houston, Aug. 27, 2017', hold=3.5, nat=0.6),
]

# temp voice
for b in BEATS:
    if 'vo' in b:
        p = f"{TMP}/{b['id']}.wav"
        if not os.path.exists(p) or open(p + '.txt').read() != b['vo'] if os.path.exists(p + '.txt') else True:
            subprocess.run(['python3', '-m', 'piper', '-m', PIPER, '--length-scale', '1.25', '--sentence-silence', '0.45', '-f', p], input=b['vo'], text=True, check=True, capture_output=True)
            open(p + '.txt', 'w').write(b['vo'])
# timeline
t = 0.0; TL = []
for b in BEATS:
    lead = 0.4 if ('vo' in b or 'bite' in b) else 0.0
    speech = dur(f"{TMP}/{b['id']}.wav") if 'vo' in b else (b['bite'][2] - b['bite'][1]) if 'bite' in b else 0.0
    d = lead + speech + b['hold']
    TL.append(dict(b, s=t, sp=t + lead, d=d)); t += d
TOTAL = t
json.dump([{k: v for k, v in x.items()} for x in TL], open(TMP + '/tl.json', 'w'), indent=1)

# picture
FIT = f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color={BG},setsar=1'
def lab(s):
    if not s: return ''
    return (f",drawbox=x=0:y=ih-56:w=iw:h=56:color=black@0.40:t=fill,drawtext=fontfile={FONT}:text='{esc(s)}':fontsize=17:fontcolor=white@0.9:x=32:y=h-37")
segs = []
for x in TL:
    out = f"{TMP}/v_{x['id']}.mp4"
    if x['pic'][0] == 'black':
        vf = 'null' + lab(x.get('label'))
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=black:s={W}x{H}:r={FPS}:d={x["d"]:.3f}', '-vf', vf, '-r', str(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out])
    else:
        src, a = x['pic']
        vf = FIT + f',tpad=stop_mode=clone:stop_duration={x["d"]:.2f}' + lab(x.get('label'))
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-i', f'{RAW}/dvids_{src}.mp4', '-vf', vf, '-t', f'{x["d"]:.3f}', '-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out])
    segs.append(out)
open(TMP + '/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in segs))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', TMP + '/list.txt', '-c', 'copy', TMP + '/video.mp4'])

# sound
N = int((TOTAL + 1) * SR); tt = np.arange(N) / SR
def rd(src, ss=None, t=None, ch=1):
    run(['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', src, '-ac', str(ch), '-ar', str(SR), TMP + '/x.wav'])
    with wave.open(TMP + '/x.wav') as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    return a.reshape(-1, ch) if ch > 1 else a
def rms(a): return np.sqrt((a ** 2).mean()) + 1e-9
voice = np.zeros(N, np.float32); nat = np.zeros(N, np.float32)
def put(buf, at, a, fade=0.05):
    i = int(at * SR); a = a[:max(0, N - i)].copy(); f = min(len(a) // 2, int(fade * SR))
    if f: a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    buf[i:i + len(a)] += a
for x in TL:
    if 'vo' in x: a = rd(f"{TMP}/{x['id']}.wav"); put(voice, x['sp'], a / rms(a) * 0.085)
    if 'bite' in x:
        s, a0, a1 = x['bite']; a = rd(f'{RAW}/dvids_{s}.mp4', a0, a1 - a0); a -= a.mean(); put(voice, x['sp'], a / rms(a) * 0.085)
    if x['pic'][0] != 'black' and x['nat'] > 0:
        a = rd(f"{RAW}/dvids_{x['pic'][0]}.mp4", x['pic'][1], x['d']); put(nat, x['s'], a / rms(a) * 0.05 * x['nat'], fade=0.25)
# music: Silent Descent from the opening into the hoist (its loud section lands on the basket rising), then Opalescent's quiet opening for the aftermath
T = {x['id']: x for x in TL}
hoist = T['x9']['s']; relief = T['x10']['s']
def track(n, a0, a1, off, fin, fout, lvl):
    m = rd(f'{MUS}/mk{n}.mp3', off, a1 - a0 + 2, ch=2); m = m / rms(m) * lvl
    out = np.zeros((N, 2), np.float32); i0 = int(a0 * SR); seg = m[:max(0, min(len(m), N - i0))]; out[i0:i0 + len(seg)] = seg
    env = np.clip((tt - a0) / fin, 0, 1) * np.clip((a1 - tt) / fout, 0, 1); return out * env[:, None]
off614 = max(0.0, 68.0 - hoist)            # 614 builds from ~28 s and is loudest from ~68 s
music = track('614', 0.0, relief + 1.5, off614, 3.0, 2.5, 0.05) + track('593', relief - 0.5, TOTAL + 1, 0.0, 2.5, 3.0, 0.045)
def sm(x, w):
    n = int(w * SR); c = np.concatenate([[0], np.cumsum(np.abs(x), dtype=np.float64)]); y = (c[n:] - c[:-n]) / n
    return np.pad(y, (n // 2, len(x) - len(y) - n // 2)).astype(np.float32)
duck = 1 - 0.55 * np.clip(sm(voice, 0.35) / 0.02, 0, 1)
# room for "And waited.": music drops right down around it and comes back over the held roof shot
w0 = T['x6']['sp'] - 0.6; w1 = T['x6']['sp'] + 2.2
duck *= 1 - 0.75 * np.clip(np.minimum((tt - w0) / 0.6, (w1 + 1.8 - tt) / 1.8), 0, 1) * ((tt > w0) & (tt < w1 + 1.8))
# the hoist plays without words: music up a little
duck *= 1 + 0.35 * np.clip((tt - hoist + 8) / 4, 0, 1) * np.clip((relief - tt) / 1.5, 0, 1)
mix = (voice + nat * (1 - 0.5 * np.clip(sm(voice, 0.35) / 0.02, 0, 1)))[:, None] + music * duck[:, None]
fade = np.clip((TOTAL - tt) / 2.0, 0, 1); mix *= fade[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open(TMP + '/mix.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
os.makedirs(ROOT + '/rough', exist_ok=True)
out = ROOT + '/rough/harvey_excerpt_sunday_tempvoice.mp4'
run(['ffmpeg', '-v', 'error', '-y', '-i', TMP + '/video.mp4', '-i', TMP + '/mix.wav', '-filter_complex',
     f"[0:v]drawtext=fontfile={FONT}:text='TEST EXCERPT · TEMPORARY VOICE (not the narrator)':fontsize=14:fontcolor=white@0.45:x=w-text_w-22:y=16[v];[1:a]loudnorm=I=-15:TP=-1.5[a]",
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])
run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-vf', 'scale=960:540', '-c:v', 'libx264', '-crf', '27', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out.replace('.mp4', '_phone.mp4')])
print('total', round(TOTAL, 1), 'hoist at', round(hoist, 1), 'music 614 offset', round(off614, 1))
