# Sound for the v3.1 opening (opening2.js): temp voice (Fish Audio lines h1-h4, c1-c2 at the same cue times as the edit), synthesized SFX (longform/kit/sfx.py,
# ours) and an original synthesized score (no samples -> free for commercial use). Writes v3/opening_mix.wav. Then master to -14 LUFS.
import json, os, sys, subprocess, wave, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D); sys.path.insert(0, os.path.join(R, '../kit')); import sfx
SR = 44100; T = 68.6; N = int(T * SR); O1 = 36.52
t = json.loads(subprocess.run(['node', f'{D}/opening2.js', 'times'], capture_output=True, text=True).stdout)
def pcm(f): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).astype(float)
vo = np.zeros(N); fx = np.zeros(N); mu = np.zeros(N)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if 0 <= i < N: buf[i:i + len(x)] += (x * g)[: N - i]
for ch, off in (('c0_hook', 0), ('c1_system', O1)):
    cu = json.load(open(f'{R}/chapters/{ch}/cues.json'))
    for lid, t0 in cu['vo']:
        if ch == 'c1_system' and lid not in ('c1', 'c2'): continue
        put(vo, pcm(f'{R}/chapters/{ch}/vo/{lid}.mp3'), t0 + off)
S = sfx.SFX
def F(name, t0, g): put(fx, S[name](), t0, g)
# --- SFX on picture events ---
F('shutter', 0.1, 0.4); F('rise', t['thousands'] - 0.3, 0.5); F('whoosh', t['thousands'], 0.6)
for i in range(40): F('tick', t['thousands'] + i * 0.035, 0.12)
F('whoosh', t['most'] - 0.25, 0.5); F('thump', t['exactly'] + 0.42, 0.5); F('click', t['exactly'] + 0.45, 0.7)
F('cut', t['h2'] - 0.12, 0.5); F('rumble', t['lost'], 0.6); F('slidedown', t['lost'] + 0.3, 0.4)
for i in range(18): F('clank', t['lost'] + 0.2 + i * 0.11, 0.15)
F('stamp', t['kroner'] + 0.4, 0.6); F('boom', t['about'] - 0.1, 0.35)
F('cut', t['h3'] - 0.12, 0.4); F('scratch', t['connected'] - 0.1, 0.35); F('heartbeat', t['connected'] + 0.6, 0.4)
F('shutter', t['man'] - 0.25, 0.5); F('paper', t['man'] + 0.2, 0.4); F('flip', t['untangle'], 0.4)
for k in ('thirty', 'joined', 'consulting'): F('tick', t[k], 0.45)
F('whoosh', t['h4'] - 0.2, 0.5); F('thump', t['box'] + 0.3, 0.5); F('slidedown', t['box'] + 0.4, 0.4)
for i in range(30): F('click', t['start'] + i * (t['system'] - t['start']) / 30, 0.25)
F('stamp', t['system'], 0.7); F('rise', O1 - 0.6, 0.4)
F('thump', O1 + 0.4, 0.5); F('paper', t['c1'] - 0.3, 0.5); F('pop', t['billund'], 0.6); F('wind', t['wooden'], 0.3)
F('tap', t['wooden'] + 0.2, 0.4); F('squeak', t['wooden'] + 0.5, 0.25)
for i in range(7): F('thump', (t['name'] + 0.15 if i < 3 else t['godt'] - 0.4) + i * 0.08 + 0.38, 0.3)
F('sparkle', t['well'] + 0.3, 0.4); F('shutter', t['c2'] - 0.15, 0.6); F('paper', t['c2'], 0.3)
F('shutter', t['machine'] - 0.25, 0.5); F('machine', t['machine'] + 0.4, 0.35); F('rise', t['twice'] - 0.1, 0.5); F('stamp', t['twice'] + 0.6, 0.4)
for k in range(24): F('click', t['by49'] - 0.2 + k * 0.09 + 0.45, 0.3)
F('shutter', t['bricks'] - 0.1, 0.5); F('sparkle', t['bricks'] + 0.3, 0.3)
# --- score: 92 BPM, D minor -> D major at the chapter card; pulse bass, felt-piano motif, airy pad, low hits on the big beats ---
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)
def piano(f, d=1.6):
    tt = t_(d); x = sum((0.6 / h) * np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (2.2 + h * 1.6)) for h in range(1, 6)); x[:60] *= np.linspace(0, 1, 60); return lp(x, 3200)
def pad(fs, d):
    tt = t_(d); x = sum(sg.sawtooth(2 * np.pi * f * (1 + dt) * tt) for f in fs for dt in (-0.003, 0.003)); x = lp(x, 900); e = np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.5); return x * e / (len(fs) * 2)
def bassp(f, d=0.3): tt = t_(d); return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 9) * np.minimum(1, tt / 0.005)
def hit(): tt = t_(2.2); return lp(np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-tt * 8)) / SR) * np.exp(-tt * 1.6) + 0.3 * np.random.default_rng(3).standard_normal(len(tt)) * np.exp(-tt * 6), 400)
BEAT = 60 / 92
MIN = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [57, 61, 64])]     # Dm Bb C A
MAJ = [(50, [62, 66, 69]), (47, [59, 62, 66]), (43, [55, 59, 62]), (45, [57, 61, 64])]     # D Bm G A
MOTIF = [0, 2, 1, 2, 0, 1, 2, 1]
tb = 0.0; bar = 0
while tb < T - 1:
    prog = MAJ if tb >= O1 - 0.5 else MIN; root, ch = prog[bar % 4]; dark = t['h2'] - 0.3 <= tb < t['h3'] + 0.5
    put(mu, pad([NOTE(n) for n in ch], 4 * BEAT + 1.5), tb, 0.10)
    for b in range(8):
        pb = tb + b * BEAT / 2
        if tb > 2.5: put(mu, bassp(NOTE(root - 12)), pb, 0.22 if b % 2 == 0 else 0.12)
        if b % 2 == 0 or tb >= O1: put(mu, piano(NOTE(ch[MOTIF[b]] + (12 if not dark else 0))), pb, 0.07 if b % 2 else 0.1)
    tb += 4 * BEAT; bar += 1
for k in ('lost', 'system'): put(mu, hit(), t[k], 0.5)
put(mu, hit(), O1 + 0.3, 0.4); put(mu, hit(), t['y1947'], 0.35)
# --- mix: duck the music under the voice ---
env = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same'); dk = np.clip(env * 3, 0, 1)
fade = np.ones(N); fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
out = (vo * 1.0 + fx * 0.32 + mu * (1.0 - 0.55 * dk)) * fade; out = np.tanh(out * 1.1) * 0.9
w = wave.open(f'{D}/opening2_mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('ok', T)
