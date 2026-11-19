#!/usr/bin/env python3
"""atlaskit mix: voice takes placed on the timeline + own synthesized ambient score, wind bed, hits/whooshes; ducking; -14 LUFS.
python3 mix.py EPDIR OUT.wav   (needs EPDIR/timeline.json, EPDIR/voice/<id>.wav, EPDIR/cues.json from `render.js EPDIR cues`)"""
import json, sys, os, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
EP, OUT = sys.argv[1:3]; SR = 48000
TL = json.load(open(os.path.join(EP, 'timeline.json'))); MJ = json.load(open(os.path.join(EP, 'mix.json'))) if os.path.exists(os.path.join(EP, 'mix.json')) else {}; MT = MJ.get('tense', ['P024', 'P036']); CU = json.load(open(os.path.join(EP, 'cues.json')))
def smooth(x, k):
    c = np.cumsum(np.concatenate([np.zeros(k // 2 + 1), x, np.zeros(k)])); return (c[k:k + len(x)] - c[:len(x)]) / k
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
    if P[MT[0]]['start'] - 3 <= t < P[MT[1]]['start'] - 3: return tense
    if t >= P[MT[1]]['start'] - 3: return bright
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
def click(at, g=0.5):
    L = int(0.06 * SR); n = rng.standard_normal(L) * np.exp(-np.arange(L) / SR * 90); i = int(at * SR); fx[i:i + L] += g * n[:max(0, N - i)]
    L2 = int(0.05 * SR); i2 = i + int(0.09 * SR); n2 = rng.standard_normal(L2) * np.exp(-np.arange(L2) / SR * 120); fx[i2:i2 + L2] += 0.6 * g * n2[:max(0, N - i2)]
def riser(at, dur=2.0, g=0.5):
    L = int(dur * SR); tt = np.arange(L) / SR; n = sosfilt(butter(2, [300, 6000], 'band', fs=SR, output='sos'), rng.standard_normal(L)) * (tt / dur) ** 2
    i = max(0, int((at - dur) * SR)); fx[i:i + L] += g * n[:max(0, N - i)] / (np.abs(n).max() + 1e-9)
for c in CU['shots']:
    s = c.get('sfx')
    if s:
        for k in s.split('+'):
            if k == 'click': click(c['t'])
            elif k == 'boom': boom(c['t'] + 0.05, 0.8)
            elif k == 'whoosh': whoosh(c['t'] + 0.3, 0.5)
            elif k == 'riser': riser(c['t'])
    if c['scene'] == 'globe': whoosh(c['t'] + 0.4, 0.45)
    if c['scene'] in ('chapter', 'title'): whoosh(c['t']); boom(c['t'] + 0.2, 0.9)
    elif c['scene'] in ('stats', 'myth', 'bars', 'ratio', 'thermo'): tick(c['t'] + 0.3); boom(c['t'] + 0.3, 0.45)
    elif c['scene'] == 'endq': boom(c['t'] + 0.2, 0.6)
boom(0.05, 1.0)  # sound at 0.0 s
# --- ducking envelope from voice ---
env = np.abs(voice); win = int(0.25 * SR); env = smooth(env, win); talk = np.clip(env / 0.02, 0, 1)
talk = smooth(talk, int(0.6 * SR))
# --- ambience beds by shot (p.amb: sea | storm | rain | wind | quiet), default wind ---
def bedmask(name):
    msk = np.zeros(N); sh = CU['shots']
    for i, c in enumerate(sh):
        if (c.get('amb') or 'wind') == name:
            a = int(c['t'] * SR); b = int((sh[i + 1]['t'] if i + 1 < len(sh) else CU['dur']) * SR); msk[a:b] = 1
    return smooth(msk, int(0.8 * SR))
bn = np.cumsum(rng.standard_normal(N)); bn = sosfilt(butter(2, 20, 'high', fs=SR, output='sos'), bn)
surf = sosfilt(butter(2, 600, 'low', fs=SR, output='sos'), bn); surf /= np.abs(surf).max() + 1e-9
swell = np.clip(np.sin(2 * np.pi * t / 7.5 + np.sin(t * 0.13)) , 0, 1) ** 3; surf = surf * (0.35 + 0.65 * swell)
hiss = sosfilt(butter(2, 2500, 'high', fs=SR, output='sos'), rng.standard_normal(N)); hiss /= np.abs(hiss).max() + 1e-9
rain = hiss * (0.6 + 0.4 * (rng.random(N) > 0.997)); gust = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t + np.sin(0.37 * t) * 2) ** 2
amb = wind * bedmask('wind') + (0.9 * surf + 0.3 * wind) * bedmask('sea') + (0.8 * surf + 1.1 * wind * gust) * bedmask('storm') + (0.5 * rain + 0.4 * wind) * bedmask('rain')
if not any(c.get('amb') for c in CU['shots']): amb = wind
# --- silence before the shock: mix.json "drop": [para ids] -> music out 1.4 s before, boom on the line ---
mgain = np.ones(N)
for pid in MJ.get('drop', []):
    s0 = P[pid]['start']; a = int((s0 - 1.4) * SR); b = int((s0 + 1.2) * SR); r = np.ones(b - a); fa = int(0.4 * SR); r[:fa] = np.linspace(1, 0, fa); r[fa:-int(0.8 * SR)] = 0; r[-int(0.8 * SR):] = np.linspace(0, 1, int(0.8 * SR))
    mgain[a:b] = np.minimum(mgain[a:b], r[:len(mgain[a:b])]); boom(s0 + 0.02, 1.0)
music = pad * mgain * (0.30 - 0.20 * talk) + amb * mgain * (0.12 - 0.06 * talk)
mix = voice + music + fx * 0.35
mix = np.stack([mix, mix], 1) / (np.abs(mix).max() + 1e-9) * 0.8
tmp = OUT + '.raw.wav'; sf.write(tmp, mix.astype(np.float32), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), OUT], check=True); os.remove(tmp)
print('mix', OUT, N / SR, 's')
