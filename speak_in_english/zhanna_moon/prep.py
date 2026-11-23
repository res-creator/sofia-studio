# Zhanna «my moon» episode: trims voices (Zhanna sped up 1.2x), lays the story on a 117 BPM card grid (one polaroid every 4 beats),
# keeps a SILENT window before the end card for the TikTok trend sound, adds light SFX (never inside the window). No music.
# Outputs timeline.json + out/audio.wav.   python3 prep.py
import json, math, subprocess, numpy as np, soundfile as sf, os
S = json.load(open('voice/script.json')); SR = 44100; os.makedirs('out', exist_ok=True)
B4 = 4 * 60 / 117   # 2.051 s = 4 beats
B2 = B4 / 2          # flips land on the 2-beat grid (on the beat), average ~2 s per card, each card >= 1.25 s
# pieces: (piece id, card or None, start word time in the trimmed take). Each card flips on the 4-beat grid; its phrase starts ~0.1 s after the flip
PIECES = {'z2': [('z2a', None, 0), ('z2b', 'moon', 1.24), ('z2c', 'ex', 2.40), ('z2d', 'exh', 3.84)],
  'z3': [('z3a', 'man', 0), ('z3b', 'flag', 1.62), ('z3c', 'dance', 3.08), ('z3d', 'miami', 5.98), ('z3e', 'her', 7.40)],
  'z4': [('z4a', 'rich', 0), ('z4b', 'rig', 1.80), ('z4c', 'soul', 3.46), ('z4d', 'cash', 6.02), ('z4e', 'scam', 7.82)],
  'z6': [('z6a', 'stay', 0), ('z6b', 'cutlets', 2.08), ('z6c', 'nomoon', 3.40), ('z6d', 'keeper', 5.04)]}
def load(k, who):
    o = f'out/v_{k}.wav'; tempo = 1.2 if who == 'z' else 1.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={tempo}', '-ar', str(SR), '-ac', '1', o], check=True)
    return sf.read(o)[0]
def envelope(a):
    env = []
    for i in range(int(len(a) / SR * 30) + 1):
        seg = a[int(i * SR / 30): int((i + 1) * SR / 30)]; env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
    mx = max(env) or 1; return [round(min(1, e / mx * 1.6), 3) for e in env]
A = {k: (who, text, load(k, who)) for k, who, text in S['lines']}
L, clips, CL = [], [], []
def put_line(k, at):
    who, text, a = A[k]; L.append({'id': k, 'who': who, 'text': text, 'at': round(at, 3), 'end': round(at + len(a) / SR, 3), 'env': envelope(a)}); clips.append((at, a)); return at + len(a) / SR
def cut_point(a, w):   # quietest 10 ms just before word time w
    if w <= 0: return 0
    i0, i1 = int(max(0, w - .25) * SR), int(w * SR); k = int(.01 * SR); best = i1; bv = 1e9
    for i in range(i0, i1 - k, k // 2):
        v = np.mean(a[i:i + k] ** 2)
        if v < bv: bv, best = v, i + k // 2
    return best
def put_piece(pid, who, text, seg, at):
    L.append({'id': pid, 'who': who, 'text': text, 'at': round(at, 3), 'end': round(at + len(seg) / SR, 3), 'env': envelope(seg)}); clips.append((at, seg)); return at + len(seg) / SR
PT = json.load(open('voice/pieces.json'))   # piece texts
e = put_line('z1', .35); grid = None; lastcard = None
def flip_after(t):
    global grid
    if grid is None: grid = t; return t
    n = math.ceil((t - grid) / B2 - 1e-6); return grid + n * B2
for k in ['z2', 'z3', 'z4', 'z5', 'z6']:
    who, text, a = A[k]
    if k == 'z5':
        if lastcard: lastcard['end'] = round(e + .35, 3); lastcard = None
        e = put_line('z5', e + .45); PCUT = round(L[-1]['at'] + 1.15, 3); continue
    P = PIECES[k]; cuts = [cut_point(a, w) for _, _, w in P] + [len(a)]
    for j, (pid, card, w) in enumerate(P):
        seg = a[cuts[j]:cuts[j + 1]]
        if card is None: e = put_piece(pid, who, PT[pid], seg, e + .35); continue
        f = flip_after(max(e - .25, lastcard['at'] + 1.25 if lastcard else 0)) if grid is not None else e + .25
        if grid is None: grid = f
        at = max(f + .1, e + .12)
        if lastcard: lastcard['end'] = round(f, 3)
        lastcard = {'id': card, 'at': round(f, 3), 'end': None, 'grp': pid}; CL.append(lastcard)
        e = put_piece(pid, who, PT[pid], seg, at)
W0 = round(max(L[-1]['end'] + .5, lastcard['at'] + 1.6), 3); lastcard['end'] = round(W0 - .1, 3); W1 = round(W0 + 6.0, 3)   # SILENT window (trend sound only)
e = put_line('z7', W1 + .15); e = put_line('p1', e + .25); e = put_line('z8', e + .3)
END = round(e + .45, 3); TOTAL = round(END + 5.0, 3)
voice = np.zeros(int(TOTAL * SR) + SR)
for at, a in clips: i = int(at * SR); voice[i:i + len(a)] += a
fx = np.zeros_like(voice); rng = np.random.default_rng(7)
def tone(f, d, v=.2, shape=lambda x: np.exp(-x * 6)):
    x = np.arange(int(d * SR)) / SR; return v * np.sin(2 * np.pi * f * x) * shape(x / d)
def put(at, a):
    i = int(at * SR); assert not (W0 - .05 < at + len(a) / SR and at < W1), 'SFX inside the silent window'; fx[i:i + len(a)] += a[:len(fx) - i]
def shutter(v=.22):
    n = rng.standard_normal(int(.05 * SR)) * np.exp(-np.linspace(0, 9, int(.05 * SR))); n2 = rng.standard_normal(int(.04 * SR)) * np.exp(-np.linspace(0, 9, int(.04 * SR)))
    return np.concatenate([n * v, np.zeros(int(.06 * SR)), n2 * v * .7])
put(.05, tone(2637, .5, .06) + tone(3520, .5, .035))                      # sparkle at the hook
for c in CL: put(c['at'], shutter(.16))                                     # polaroid click on every flip
sc = [c for c in CL if c['id'] == 'scam'][0]; put(sc['at'] + .05, tone(70, .35, .5) + tone(110, .35, .25))   # stamp thud
n = rng.standard_normal(int(.5 * SR)); n = np.convolve(n, np.ones(12) / 12, 'same') * np.hanning(len(n)) * .25; put(PCUT - .1, n)   # newspaper rustle
put(END, tone(1046, 1.2, .1) + tone(1568, 1.2, .06))                       # end card chime
mix = voice + fx
assert np.abs(mix[int(W0 * SR):int(W1 * SR)]).max() == 0
mix = mix / max(1e-6, np.abs(mix).max()) * .89
sf.write('out/audio_raw.wav', mix, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/audio_raw.wav', '-af', 'loudnorm=I=-15:TP=-1.5', '-ar', '44100', 'out/audio.wav'], check=True)
json.dump({'L': L, 'CL': CL, 'B4': B4, 'PCUT': PCUT, 'W0': W0, 'W1': W1, 'END': END, 'TOTAL': TOTAL}, open('timeline.json', 'w'), ensure_ascii=False)
for l in L: print(l['id'], l['at'], l['end'])
for c in CL: print('  card', c['id'], c['at'], c['end'])
print('PCUT', PCUT, 'W0', W0, 'W1', W1, 'END', END, 'TOTAL', TOTAL)
