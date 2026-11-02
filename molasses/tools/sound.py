# Procedural score + sound design (everything synthesised here -> no third-party copyright).
# Writes public/audio/music.wav, sfx.wav and mix.wav (narration + ducked music + sfx, loudness-normalised).
import json, subprocess, wave
import numpy as np

SR = 44100
tl = json.load(open('src/data/timeline.json'))
DUR = tl['duration']
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(1919)
W = {i: w for i, w in enumerate(tl['words'])}
ws = lambda i: W[i]['s']
# v1 -> v2 timeline mapping (same word anchors as src/lib.tsx toNew)
_t1 = json.load(open('src/data/timeline_v1.json'))
_O = [0] + [x for w in _t1['words'] for x in (w['s'], w['e'])] + [_t1['duration']]
_N = [0] + [x for w in tl['words'] for x in (w['s'], w['e'])] + [tl['duration']]
tn = lambda v: float(np.interp(v, _O, _N))

def read_wav(p):
    with wave.open(p) as f:
        a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if f.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    out = np.zeros(N, np.float32); out[:min(N, len(a))] = a[:N]
    return out

def write_wav(p, x):
    x = np.clip(x, -1, 1)
    st = (x.T * 32767).astype(np.int16) if x.ndim == 2 else np.stack([x, x], 1).__mul__(32767).astype(np.int16)
    with wave.open(p, 'w') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())

def band(x, lo, hi, soft=0.15):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.clip((f - lo * (1 - soft)) / (lo * soft + 1e-9), 0, 1) * np.clip((hi * (1 + soft) - f) / (hi * soft), 0, 1)
    return np.fft.irfft(X * g, len(x)).astype(np.float32)

def env(t0, a, s, r, peak=1.0):  # attack-sustain-release envelope over whole timeline (seconds)
    e = np.zeros(N, np.float32)
    e += np.clip((t - t0) / max(a, 1e-3), 0, 1)
    e *= np.clip(1 - (t - (t0 + a + s)) / max(r, 1e-3), 0, 1) * (t >= t0)
    return e * peak

def smooth(x, sec):
    k = max(1, int(sec * SR)); c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k
    return np.concatenate([np.full(k - 1, y[0]), y]).astype(np.float32)

# ---------------- music: slow dark drone in D minor, no beat, no swells beyond a gentle pad
def pad(freqs, amp):
    y = np.zeros(N, np.float32)
    for k, f in enumerate(freqs):
        for d in (-0.6, 0.0, 0.7):  # gentle chorus
            ph = rng.uniform(0, 2 * np.pi)
            lfo = 1 + 0.002 * np.sin(2 * np.pi * (0.05 + 0.01 * k) * t + ph)
            y += np.sin(2 * np.pi * (f + d) * lfo * t + ph) * (0.6 if d == 0 else 0.3)
            y += 0.18 * np.sin(2 * np.pi * 2 * (f + d) * t + ph)
    return y * amp / len(freqs)

D2, A2, F3, D3, C3, Bb2, E3 = 73.42, 110.0, 174.61, 146.83, 130.81, 116.54, 164.81
music = pad([D2, A2, D3], 0.5) * (0.55 + 0.45 * np.sin(2 * np.pi * t / 23) ** 2)
# chord colour changes follow the story: Dm -> Bb -> (tension) -> Dm
chA = pad([F3, A2 * 2], 0.22) * np.clip(1 - (t - tn(30)) / 4, 0, 1)
chB = pad([Bb2, F3, D3], 0.22) * np.clip((t - tn(30)) / 4, 0, 1) * np.clip(1 - (t - tn(54)) / 4, 0, 1)
chC = pad([C3, E3 * 0.5 * 2, A2], 0.2) * np.clip((t - tn(54)) / 4, 0, 1)
music += chA + chB + chC
air = band(rng.standard_normal(N).astype(np.float32), 2500, 7000) * 0.012 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 17))
music = band(music, 40, 2200) + air
music *= np.clip(t / 3.0, 0, 1) * np.clip((DUR - t) / 3.5, 0, 1)
# tension dip: music thins out in the silence after "splits apart", then returns
music *= 1 - 0.65 * env(ws(73), 0.4, 1.4, 1.6)

# ---------------- SFX (quiet, no hard hits)
noise = lambda: rng.standard_normal(N).astype(np.float32)
sfx = np.zeros((2, N), np.float32)
def add(x, pan=0.0, g=1.0):
    sfx[0] += x * g * (1 - max(0, pan)); sfx[1] += x * g * (1 + min(0, pan))

# wind over the harbour, a mild winter day (0 .. ~24 s), slow gusts
gust = smooth(np.abs(band(noise(), 0.05, 0.4)), 0.5); gust /= gust.max() + 1e-9
wind = band(noise(), 180, 900) * (0.35 + 0.65 * gust) * env(0.0, 2.5, 19.0, 5.0)
add(wind, -0.2, 0.08); add(band(noise(), 250, 1100) * (0.3 + 0.7 * gust[::-1]) * env(0.0, 2.5, 19.0, 5.0), 0.3, 0.065)

# metal creaks: tank strain on "leaking" and before the rupture
def creak(t0, dur, f0=95, g=0.06, pan=0.0):
    m = (t >= t0) & (t < t0 + dur); tt = t[m] - t0
    f = f0 * (1 + 0.25 * np.sin(2 * np.pi * 0.7 * tt) + 0.08 * rng.standard_normal(len(tt)).cumsum() / np.sqrt(len(tt) + 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = (np.sign(np.sin(ph)) * 0.4 + np.sin(ph * 2.01) * 0.6) * (1 + 0.6 * np.sin(2 * np.pi * 9 * tt))
    e = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2
    x = np.zeros(N, np.float32); x[m] = tone * e
    add(band(x, 120, 2400), pan, g)
creak(ws(52) - 0.1, 2.0, 88, 0.07, -0.3)
creak(ws(67) - 0.5, 1.6, 70, 0.075, 0.2)
creak(ws(72) - 0.1, 1.2, 120, 0.1, -0.1)

# steel splitting: a dry tearing crackle (granular), soft attack, not a bang
m = (t >= ws(73) - 0.05) & (t < ws(74) + 1.0)
grains = (rng.random(N) < 0.0025).astype(np.float32) * rng.standard_normal(N).astype(np.float32)
crack = band(grains, 400, 6000) * env(ws(73) - 0.05, 0.15, 0.6, 0.9)
add(crack, 0.1, 0.5); add(band(noise(), 60, 400) * env(ws(73), 0.5, 0.4, 1.4), 0, 0.10)
# rivets popping (small ticks)
for k in range(9):
    tk = ws(73) + 0.08 * k + rng.uniform(0, 0.05); i = int(tk * SR); L = int(0.03 * SR)
    tick = np.zeros(N, np.float32); tick[i:i + L] = rng.standard_normal(L) * np.exp(-np.arange(L) / (0.004 * SR))
    add(band(tick, 1500, 8000), rng.uniform(-0.6, 0.6), 0.12)

# the wave: a low, rolling rumble that builds under the map shot and fades over the photos
rum = band(noise(), 30, 220) * (0.7 + 0.3 * smooth(np.abs(band(noise(), 0.5, 3)), 0.2) / 0.05)
rum = rum / (np.abs(rum).max() + 1e-9)
add(rum * env(ws(75) - 0.6, 3.0, 3.6, 3.2), 0, 0.22)
add(band(noise(), 300, 1800) * env(ws(76), 3.0, 3.0, 3.0), 0.25, 0.018)  # slosh / spray

# crowd murmur under the aftermath photos: many band-limited "voices" with syllabic modulation
crowd = np.zeros(N, np.float32)
for v in range(14):
    syl = smooth(np.clip(band(noise(), 2.5, 6.0) * 30, 0, None), 0.03)
    syl /= syl.max() + 1e-9
    fc = rng.uniform(350, 900)
    crowd += band(noise(), fc * 0.7, fc * 1.6) * syl
crowd = crowd / (np.abs(crowd).max() + 1e-9)
add(band(crowd, 200, 2500) * env(tn(45.0), 1.2, tn(52.5) - tn(45.0), 2.5), -0.15, 0.09)
# distant bell of a fire engine? not used: no invented details. Only general ambience.

# title: low swell, very gentle
add(band(noise(), 40, 160) * env(ws(146) - 1.0, 2.5, 2.0, 4.0), 0, 0.06)

# ---------------- mix
vo = read_wav('vo/narration_timed.wav')
venv = smooth(np.abs(vo), 0.25); venv = np.clip(venv / (np.percentile(venv[venv > 0.003], 60) + 1e-9), 0, 1)
venv = smooth(venv, 0.35)
duck = 1 - 0.55 * venv  # music about -7 dB under the voice
music_st = np.stack([music, np.roll(music, 220)]) * 0.16
mus_d = music_st * duck
sfx_d = sfx * (1 - 0.35 * venv)
mix = np.stack([vo, vo]) * 0.92 + mus_d + sfx_d
write_wav('public/audio/music.wav', music_st)
write_wav('public/audio/sfx.wav', sfx)
write_wav('vo/mix_raw.wav', mix / (np.abs(mix).max() + 1e-9) * 0.9)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'vo/mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', 'public/audio/mix.wav'], check=True)
print('ok', DUR)
