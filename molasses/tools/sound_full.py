# Full-episode mix: voice (full/vo/full_narration.wav) + synthesised music + a few short SFX.
# No noise beds (no wind / hiss / crowd). Cold-open SFX are taken from vo/todd/sfx.wav (the approved segment).
# -> public/audio/full_mix.wav (loudness-normalised, -14 LUFS integrated target, TP -1.5)
import json, subprocess, wave
import numpy as np
SR = 44100
T = json.load(open('full/timeline_full.json'))
DUR = T['duration']; N = int(DUR * SR)
t = np.arange(N, dtype=np.float64) / SR
rng = np.random.default_rng(1919)

def read_wav(p, ch=1):
    with wave.open(p) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if f.getnchannels() == 2: a = a.reshape(-1, 2)
        else: a = a[:, None]
    out = np.zeros((N, 2), np.float32); n = min(N, len(a)); out[:n] = a[:n] if a.shape[1] == 2 else np.repeat(a[:n], 2, 1)
    return out

W = T['words']
def cue(line, word, nth=0):
    import re
    norm = lambda x: re.sub(r"[^a-z0-9$']", '', x.lower())
    hits = [w for w in W if w['line'] == line and norm(w['w']).startswith(norm(word))]
    return hits[nth]['s']

# ---------------- music: chord per chapter, slow crossfades, pure sines (no hiss)
D2, F2, G2, A2, Bb2, C3, D3, E3, F3, G3, A3 = 73.42, 87.31, 98.0, 110.0, 116.54, 130.81, 146.83, 164.81, 174.61, 196.0, 220.0
CH = {'c1': [D2, A2, D3, F3], 'c2': [Bb2 / 2, F2, D3, F3], 'c3': [F2, C3, F3, A3], 'c4': [D2, A2, D3, E3], 'c5': [G2, D3, G3, Bb2 * 2],
      'c5b': [D2, A2, D3, F3], 'c6': [F2, C3, F3, A3], 'c7': [Bb2 / 2, F2, D3, F3], 'c8': [G2, D3, G3, Bb2 * 2], 'c9': [D2, A2, D3, F3]}
music = np.zeros(N, np.float32)
segs = [(0.0, T['cold']['dur'], [D2, A2, D3, F3])] + [(c['card'], c['end'], CH[c['id']]) for c in T['chapters']] + [(T['chapters'][-1]['end'], DUR, [D2, A2, D3])]
for (a, b, freqs) in segs:
    i0, i1 = max(0, int((a - 3) * SR)), min(N, int((b + 3) * SR))
    tt = t[i0:i1]
    env = np.clip((tt - (a - 3)) / 3, 0, 1) * np.clip(((b + 3) - tt) / 3, 0, 1)
    y = np.zeros(len(tt))
    for k, f in enumerate(freqs):
        for d in (-0.5, 0.0, 0.6):
            ph = rng.uniform(0, 2 * np.pi)
            y += np.sin(2 * np.pi * (f + d) * tt + ph) * (0.6 if d == 0 else 0.3) * (1.0 if k < 2 else 0.55)
            y += 0.12 * np.sin(2 * np.pi * 2 * (f + d) * tt + ph)
    y *= 0.6 + 0.4 * np.sin(2 * np.pi * tt / 21 + a) ** 2  # slow breathing
    music[i0:i1] += (y * env / len(freqs)).astype(np.float32)
music *= np.clip(t / 3, 0, 1).astype(np.float32) * np.clip((DUR - t) / 4, 0, 1).astype(np.float32)

# ---------------- SFX
sfx = np.zeros((N, 2), np.float32)
def put(x, at, g=1.0, pan=0.0):
    i = int(at * SR); n = min(len(x), N - i)
    if n <= 0: return
    sfx[i:i + n, 0] += x[:n] * g * (1 - max(0, pan)); sfx[i:i + n, 1] += x[:n] * g * (1 + min(0, pan))
def lowpass(x, fc):  # simple one-pole, applied twice
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for _ in range(2):
        out = np.empty_like(x)
        for i in range(len(x)): s = a * s + (1 - a) * x[i]; out[i] = s
        x = out
    return x
def creak(dur, f0):
    tt = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 0.25 * np.sin(2 * np.pi * 0.7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (0.4 * np.sign(np.sin(ph)) + 0.6 * np.sin(2.01 * ph)) * (1 + 0.6 * np.sin(2 * np.pi * 9 * tt))
    x = lowpass(x.astype(np.float32), 1800)
    return x * np.sin(np.pi * tt / dur) ** 2
def rumble(dur, fc=140):
    n = int(dur * SR); x = lowpass(rng.standard_normal(n).astype(np.float32), fc)
    x /= np.abs(x).max() + 1e-9; tt = np.arange(n) / SR
    return x * np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 1.5
def thud(f=55, dur=1.2):
    tt = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * tt * (1 - 0.3 * tt)) * np.exp(-tt / 0.25) * (1 - np.exp(-tt / 0.02))).astype(np.float32)
def ticks(n, gap):
    out = np.zeros(int((n * gap + 0.1) * SR), np.float32)
    for k in range(n):
        i = int((k * gap + rng.uniform(0, gap * 0.4)) * SR); L = int(0.025 * SR)
        out[i:i + L] += rng.standard_normal(L).astype(np.float32) * np.exp(-np.arange(L) / (0.004 * SR))
    return out - lowpass(out, 1200)  # keep the click, drop the body

# cold open: the approved segment's SFX, unchanged
cold = read_wav('vo/todd/sfx.wav'); n0 = int(T['cold']['dur'] * SR)
sfx[:n0] += cold[:n0]
# chapters (quiet, short, only where the text describes a sound)
put(creak(2.2, 85), cue('c2_14', 'Groaning') - 0.2, 0.08, -0.3)
put(creak(1.8, 70), cue('c2_14', 'rumbling') - 0.1, 0.08, 0.3)
put(rumble(3.2, 120), cue('c4_02', 'deep') - 0.2, 0.16)
put(thud(52, 1.4), cue('c4_03', 'bang'), 0.22)
put(ticks(14, 0.09), cue('c4_04', 'popping'), 0.10, 0.1)
put(rumble(4.0, 160), cue('c4_05', 'split') - 0.1, 0.18)
put(creak(2.0, 80), cue('c9_08', 'groaned') - 0.2, 0.07)

# ---------------- mix with ducking
vo = read_wav('full/vo/full_narration.wav')
v = np.abs(vo[:, 0]); k = int(0.25 * SR); c = np.cumsum(np.insert(v, 0, 0)); env = (c[k:] - c[:-k]) / k
env = np.concatenate([np.full(k - 1, env[0]), env]); env = np.clip(env / (np.percentile(env[env > 0.003], 60) + 1e-9), 0, 1)
c = np.cumsum(np.insert(env, 0, 0)); k2 = int(0.35 * SR); env = np.concatenate([np.full(k2 - 1, 0), (c[k2:] - c[:-k2]) / k2]).astype(np.float32)
duck = (1 - 0.55 * env)[:, None]
mus = np.stack([music, np.roll(music, 220)], 1) * 0.16
mix = vo * 0.92 + mus * duck + sfx * (1 - 0.3 * env)[:, None]
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open('full/vo/full_mix_raw.wav', 'w') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'full/vo/full_mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', 'public/audio/full_mix.wav'], check=True)
print('ok', DUR)
