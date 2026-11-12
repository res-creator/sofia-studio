#!/usr/bin/env python3
"""atlaskit mix: voice takes placed on the timeline + own synthesized ambient score, wind bed, hits/whooshes; ducking; -14 LUFS.
python3 mix.py EPDIR OUT.wav   (needs EPDIR/timeline.json, EPDIR/voice/<id>.wav, EPDIR/cues.json from `render.js EPDIR cues`)"""
import json, sys, os, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
EP, OUT = sys.argv[1:3]; SR = 48000
TL = json.load(open(os.path.join(EP, 'timeline.json'))); CU = json.load(open(os.path.join(EP, 'cues.json')))
N = int((CU['dur'] + 0.5) * SR); voice = np.zeros(N); rng = np.random.default_rng(7)
for p in TL['paras']:
    x, sr = sf.read(os.path.join(EP, 'voice', p['id'] + '.wav'), dtype='float64'); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = resample_poly(x, SR, sr)
    i = int(p['start'] * SR); voice[i:i + len(x)] += x[:N - i]
# --- score: slow pad chords (sine + detuned partials), section moods ---
def hz(m): return 440 * 2 ** ((m - 69) / 12)
calm = [[50, 57, 62, 65], [46, 53, 62, 65], [53, 60, 65, 69], [48, 55, 64, 67]]      # Dm Bb F C
tense = [[45, 52, 57, 60], [46, 53, 58, 61], [43, 50, 55, 58], [45, 52, 56, 60]]     # Am Bbm Gm Am(maj7-ish)
bright = [[53, 60, 64, 69], [48, 55, 64, 67], [50, 57, 62, 69], [46, 53, 62, 65]]
P = {p['id']: p for p in TL['paras']}
def sect(t):
    if P['P024']['start'] - 3 <= t < P['P036']['start'] - 3: return tense
    if t >= P['P036']['start'] - 3: return bright
    return calm
t = np.arange(N) / SR; pad = np.zeros(N); CH = 9.0
for k in range(int(N / SR / CH) + 2):
    t0 = k * CH; notes = sect(t0)[k % 4]; a, b = int(max(0, (t0 - 2) * SR)), int(min(N, (t0 + CH + 2) * SR))
    if a >= b: continue
    tt = t[a:b]; env = np.clip((tt - (t0 - 2)) / 3, 0, 1) * np.clip(((t0 + CH + 2) - tt) / 3, 0, 1)
    s = sum(np.sin(2 * np.pi * hz(m) * tt * (1 + d)) * g for m in notes for d, g in [(0, 0.5), (0.003, 0.3), (-0.004, 0.3)])
    s += 0.6 * np.sin(2 * np.pi * hz(notes[0] - 12) * tt)
    pad[a:b] += s * env
pad = sosfilt(butter(2, 1400, 'low', fs=SR, output='sos'), pad); pad *= 1 + 0.15 * np.sin(2 * np.pi * 0.07 * t)
# shimmer: sparse soft bell notes
for k in range(int(N / SR / 4.5)):
    tb = k * 4.5 + rng.random() * 2; m = sect(tb)[int(tb / CH) % 4][rng.integers(1, 4)] + 12; i = int(tb * SR); L = int(3 * SR)
    if i + L < N: tt = np.arange(L) / SR; pad[i:i + L] += 0.35 * np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 1.6)
pad /= np.abs(pad).max() + 1e-9
# --- wind bed ---
wn = rng.standard_normal(N); wind = sosfilt(butter(2, [180, 900], 'band', fs=SR, output='sos'), wn)
wind *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t + 1) ** 2; wind /= np.abs(wind).max()
# --- fx ---
fx = np.zeros(N)
def boom(at, g=1.0):
    L = int(1.6 * SR); tt = np.arange(L) / SR; s = np.sin(2 * np.pi * (55 * np.exp(-tt * 2) + 38) * tt) * np.exp(-tt * 3.2); i = int(at * SR); fx[i:i + L] += g * s[:max(0, N - i)]
def whoosh(at, g=0.6):
    L = int(1.1 * SR); n = rng.standard_normal(L); s = sosfilt(butter(2, [400, 4000], 'band', fs=SR, output='sos'), n) * np.sin(np.pi * np.arange(L) / L) ** 2
    i = max(0, int((at - 0.6) * SR)); fx[i:i + L] += g * s[:max(0, N - i)] / (np.abs(s).max() + 1e-9)
def tick(at, g=0.35):
    L = int(0.25 * SR); tt = np.arange(L) / SR; s = np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 40); i = int(at * SR); fx[i:i + L] += g * s[:max(0, N - i)]
for c in CU['shots']:
    if c['scene'] in ('chapter', 'title'): whoosh(c['t']); boom(c['t'] + 0.2, 0.9)
    elif c['scene'] in ('stats', 'myth', 'bars', 'ratio', 'thermo'): tick(c['t'] + 0.3); boom(c['t'] + 0.3, 0.45)
    elif c['scene'] == 'endq': boom(c['t'] + 0.2, 0.6)
boom(0.05, 1.0)  # sound at 0.0 s
# --- ducking envelope from voice ---
env = np.abs(voice); win = int(0.25 * SR); env = np.convolve(env, np.ones(win) / win, 'same'); talk = np.clip(env / 0.02, 0, 1)
talk = np.convolve(talk, np.ones(int(0.6 * SR)) / int(0.6 * SR), 'same')
music = pad * (0.30 - 0.20 * talk) + wind * (0.10 - 0.06 * talk)
mix = voice + music + fx * 0.35
mix = np.stack([mix, mix], 1) / (np.abs(mix).max() + 1e-9) * 0.8
tmp = OUT + '.raw.wav'; sf.write(tmp, mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), OUT], check=True); os.remove(tmp)
print('mix', OUT, N / SR, 's')
