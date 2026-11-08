# Sound for "The Match King": voice (Bryan) on the global timeline, an original synthesized score with a mood per chapter (no samples → ours),
# synthesized SFX (longform/kit/sfx.py + a match strike), music ducked well under the voice. Writes render/mix.wav and the SRT.
# Usage: python3 mix.py   (then master: sh ../../howitsrun_style/master.sh render/mix.wav render/video.mp4 render/master.mp4 T)
import json, os, re, sys, subprocess, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '../kit')); import sfx
SR = 44100
TL = json.loads(subprocess.run(['node', '-e', "const t=require('./timeline.js');console.log(JSON.stringify({L:t.L,E:t.E,W:t.W,cards:t.cards,T:t.T,lines:t.lines}))"], cwd=D, capture_output=True, text=True).stdout)
L, E, Wd, cards, T, lines = TL['L'], TL['E'], TL['W'], TL['cards'], TL['T'], TL['lines']
def at(i, w, n=0):
    h = [x for x in Wd[i] if re.sub(r"[^a-z0-9'’]", '', x[0].lower()).startswith(w.lower())]; return L[i] + h[n][1]
N = int(T * SR) + SR; vo = np.zeros(N); fx = np.zeros(N); mu = np.zeros(N)
def put(b, x, t, g=1.0):
    i = int(t * SR)
    if 0 <= i < N: b[i:i + len(x)] += (x * g)[:N - i]
def pcm(f): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).astype(float)
for i, _ in lines: put(vo, pcm(f'{D}/vo/{i}.mp3'), L[i])
# ---------------- SFX ----------------
S = sfx.SFX; rng = np.random.default_rng(7)
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def hp(x, f): b, a = sg.butter(2, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def strike():   # a match being struck: scrape, flare, crackle
    d = 1.6; t = t_(d); scr = hp(rng.standard_normal(len(t)), 2500) * np.exp(-((t - 0.12) / 0.08) ** 2); fl = lp(rng.standard_normal(len(t)), 900) * (np.minimum(1, t / 0.15)) * np.exp(-t * 2.2)
    cr = np.zeros(len(t)); [cr.__setitem__(slice(k, k + 60), rng.standard_normal(60) * 0.6) for k in rng.integers(int(0.2 * SR), len(t) - 100, 25)]
    x = scr * 0.9 + fl * 0.7 + cr * 0.3; return x / np.max(np.abs(x)) * 0.9
def rainloop(d): x = hp(rng.standard_normal(int(d * SR)), 1500) * 0.25 + lp(rng.standard_normal(int(d * SR)), 400) * 0.2; return x * np.minimum(1, np.minimum(t_(d) / 1.0, (d - t_(d)) / 1.0))
def murmur(d): x = sum(sg.lfilter(*sg.butter(2, [f / (SR / 2), (f * 1.6) / (SR / 2)], 'band'), rng.standard_normal(int(d * SR))) for f in (180, 320, 520)); x = x * (0.6 + 0.4 * np.sin(t_(d) * 1.3)); return x / np.max(np.abs(x)) * 0.5 * np.minimum(1, np.minimum(t_(d) / 1.0, (d - t_(d)) / 1.0))
def F(name, t, g): put(fx, S[name]() if isinstance(name, str) else name, t, g)
F(strike(), 0.6, 0.8)
for c in cards: F(strike(), c['t0'] + 0.25, 0.75)
shots = json.loads(subprocess.run(['node', '-e', "const f=require('./film.js');console.log(JSON.stringify(f.shots.map(s=>[s.t0,s.tr,s.set])))"], cwd=D, capture_output=True, text=True).stdout)
for t0, tr, st in shots:
    if tr in ('whip', 'zoom'): F('whoosh', t0 - 0.1, 0.45)
    if tr == 'flash': F('boom', t0, 0.35)
    if st == 'factory': F(S['hum']() if 'hum' in S else S['rumble'](), t0, 0.12)
for w in ('Poland', 'France', 'Germany'): F('pop', at('m2', w), 0.35); F('kaching', at('m2', w) + 0.5, 0.25)
for k in range(6): F('pop', at('m3', '1930') - 3 + k * 0.45, 0.25)
for w, i, n in (('fifty', 'm2b', 0), ('circle', 'm2b', 0), ('two', 't4', 0)): F('coinburst' if 'coinburst' in S else 'kaching', at(i, w, n), 0.3)
F('stamp', at('h3', 'never'), 0.5); F('stamp', at('m1', 'return') + 1.0, 0.35); F('scratch', at('m1', 'return') + 0.4, 0.25)
F('flutter', at('p3', 'Wall'), 0.4); F('paper', at('p3', 'Wall') + 0.3, 0.3); F(murmur(E['p3'] - at('p3', 'Wall') + 1), at('p3', 'Wall'), 0.35)
F(murmur(E['c1'] - L['c1'] + 1), L['c1'] - 0.3, 0.3)
for k in range(10): F('printfx' if 'printfx' in S else 'tick', L['r4'] + k * 1.4, 0.18)
F('scratch', at('r4', 'forged'), 0.3); F('stamp', at('r4', 'Fake'), 0.35)
F('flip', at('c2', 'eleven'), 0.3); F(rainloop(E['c5'] - L['c5'] + 1.5), L['c5'] - 0.3, 0.5)
F('rumble', at('a1', 'childish'), 0.35); F('slam', at('a3', 'bankrupt'), 0.3); F('stamp', at('a3', 'thirty'), 0.3)
F('sparkle', at('e2', 'money'), 0.3)
# ---------------- score: 84 BPM; felt piano, warm pad, pizzicato bass, low strings; mood per section ----------------
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12); BEAT = 60 / 84
def piano(f, d=1.8): t = t_(d); x = sum((0.6 / h) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.0 + h * 1.5)) for h in range(1, 6)); x[:60] *= np.linspace(0, 1, 60); return lp(x, 3200)
def pad(fs, d): t = t_(d); x = sum(sg.sawtooth(2 * np.pi * f * (1 + dt) * t) for f in fs for dt in (-0.003, 0.003)); x = lp(x, 900); e = np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5); return x * e / (len(fs) * 2)
def pizz(f): t = t_(0.4); return np.sin(2 * np.pi * f * t) * np.exp(-t * 11) * np.minimum(1, t / 0.004)
def tick(): t = t_(0.05); return hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 90)
MAJ = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]     # C Am F G
MIN = [(45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62]), (40, [55, 59, 64])]     # Am F G Em
DARK = [(45, [57, 60, 64]), (44, [56, 60, 63]), (41, [53, 57, 60]), (40, [52, 56, 59])]    # Am Ab(aug feel) F E
def sec(t):   # (progression, piano density 0-2, pizz bass, ticking clock, up an octave)
    if t < L['k1'] - 3: return (DARK, 1, 1, 0, 0)
    if t < L['m1'] - 3: return (MAJ, 1, 1, 0, 1)
    if t < L['r1'] - 3: return (MAJ, 2, 1, 0, 1)
    if t < L['c1'] - 3: return (DARK, 1, 1, 1, 0)
    if t < L['a1'] - 3: return (MIN, 0, 0, 0, 0)
    if t < L['e1'] - 1: return (MIN, 1, 1, 0, 0)
    return (MAJ, 1, 0, 0, 1)
MOTIF = [0, 2, 1, 2, 0, 1, 2, 1]; tb, bar = 1.0, 0
while tb < T - 2:
    prog, dens, pz, tk, up = sec(tb); root, ch = prog[bar % 4]
    put(mu, pad([NOTE(n) for n in ch], 4 * BEAT + 1.5), tb, 0.10)
    for b in range(8):
        pb = tb + b * BEAT / 2
        if pz and b % 2 == 0: put(mu, pizz(NOTE(root - 12)), pb, 0.22)
        if (dens == 2) or (dens == 1 and b % 2 == 0) or (dens == 0 and b == 0): put(mu, piano(NOTE(ch[MOTIF[b]] + (12 if up else 0))), pb, 0.07 if b % 2 else 0.1)
        if tk: put(mu, tick(), pb, 0.12)
    tb += 4 * BEAT; bar += 1
# silence the music on the chapter cards except a low drone + let the strike breathe
for c in cards: i0, i1 = int(c['t0'] * SR), int(c['t1'] * SR); mu[i0:i1] *= np.linspace(1, 0.25, i1 - i0) if False else 0.3
# ---------------- mix ----------------
act = (np.abs(vo) > 0.015).astype(float); k = int(0.6 * SR); cs = np.concatenate([[0], np.cumsum(act)]); env = np.zeros(N)   # moving average via cumulative sum (fast)
lo = np.clip(np.arange(N) - k // 2, 0, N); hi = np.clip(np.arange(N) + k // 2, 0, N); env = (cs[hi] - cs[lo]) / k; dk = np.clip(env * 3, 0, 1)
fade = np.ones(N); fade[int((T - 1.5) * SR):] = np.linspace(1, 0, N - int((T - 1.5) * SR))
out = (vo + fx * 0.3 + mu * 0.55 * (1 - 0.65 * dk)) * fade; out = np.tanh(out * 1.1) * 0.9; out = out[:int(T * SR)]
os.makedirs(f'{D}/render', exist_ok=True); w = wave.open(f'{D}/render/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
# ---------------- SRT: one cue per sentence (long sentences split at commas), timed by the word timings ----------------
def ts(x): x = max(0, x); return f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}'
cues = []
for i, text in lines:
    ws = Wd[i]; cur = []
    for k, (w, a, b) in enumerate(ws):
        cur.append((w, a, b)); txt = ' '.join(x[0] for x in cur)
        if re.search(r'[.?!…:]$', w) or (w.endswith(',') and len(txt) > 50) or len(txt) > 80 or k == len(ws) - 1: cues.append((L[i] + cur[0][1], L[i] + cur[-1][2] + 0.15, txt)); cur = []
open(f'{D}/the_match_king.srt', 'w').write(''.join(f'{n + 1}\n{ts(a)} --> {ts(b)}\n{t}\n\n' for n, (a, b, t) in enumerate(cues)))
print('mix ok', round(T, 2), 's ·', len(cues), 'subtitle cues')
