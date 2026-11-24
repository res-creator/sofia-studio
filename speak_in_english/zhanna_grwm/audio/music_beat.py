# Original background beat for Zhanna (synthesised here, no samples, no third-party rights).
# Laid-back early-2000s style hip-hop groove: 92 BPM, plucked nylon-guitar loop on an Andalusian cadence
# (Am-G-F-E), soft boom-bap drums with swing, finger snaps, deep bass, warm pad.  python3 music_beat.py -> audio/music.mp3
import numpy as np, soundfile as sf, subprocess, os
from scipy.signal import butter, sosfilt
SR = 44100; BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 36; N = int(BARS * BAR * SR) + SR
rng = np.random.default_rng(7)
out = {k: np.zeros(N) for k in ['gtr', 'kick', 'snare', 'hat', 'bass', 'pad', 'snap']}
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def put(track, t, x, g=1.0):
    i = int(t * SR); n = min(len(x), N - i)
    if n > 0: out[track][i:i + n] += x[:n] * g
SW = .58  # swing for 16ths
def pos(bar, step16):  # time of a swung 16th step
    beat, s = divmod(step16, 4); off = [0, SW, 1, 1 + SW][s] * BEAT / 2 if False else [0, SW * .5, .5, .5 + SW * .5][s] * BEAT
    return bar * BAR + beat * BEAT + off
# --- nylon guitar: Karplus-Strong pluck
def pluck(f, d=1.6, bright=.5):
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p) * np.hanning(p) ** .3
    y = np.zeros(n); y[:p] = buf
    for i in range(p, n): y[i] = .996 * (bright * y[i - p] + (1 - bright) * y[i - p - 1] if i - p - 1 >= 0 else y[i - p])
    y = lp(y, 3200); return y * np.exp(-np.arange(n) / SR * 1.6)
cache = {}
def note(m): return 440 * 2 ** ((m - 69) / 12)
def gp(m, d=1.6):
    if m not in cache: cache[m] = pluck(note(m), d)
    return cache[m]
CH = [  # (bass root midi, chord tones for guitar)
    (45, [57, 60, 64, 69]),   # Am
    (43, [55, 59, 62, 67]),   # G
    (41, [53, 57, 60, 65]),   # F
    (40, [52, 56, 59, 64]),   # E (with G#)
]
GPAT = [(0, 0), (3, 2), (6, 1), (8, 3), (10, 2), (12, 1), (14, 2)]  # (16th step, chord tone index): latin-flavoured arpeggio
for bar in range(BARS):
    root, tones = CH[bar % 4]
    for st, ti in GPAT:
        put('gtr', pos(bar, st), gp(tones[ti]), .55 if st in (0, 8) else .42)
    if bar % 4 == 3: put('gtr', pos(bar, 15), gp(tones[3] + 2), .35)  # little pickup note
# --- drums (start after a 4-bar guitar intro)
def kick():
    n = int(.45 * SR); t = np.arange(n) / SR; f = 45 + 75 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) * 1.0 + np.tanh(np.sin(ph) * 3) * .15 * np.exp(-t * 30)
def snare():
    n = int(.3 * SR); t = np.arange(n) / SR; nz = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-t * 18)
    return nz * .6 + np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25) * .5
def hat(open_=False):
    n = int((.18 if open_ else .05) * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n), 7000, 4) * np.exp(-t * (14 if open_ else 70))
def snap():
    n = int(.12 * SR); t = np.arange(n) / SR; return bp(rng.standard_normal(n), 1800, 4000) * np.exp(-t * 55)
K, S, HH, SN = kick(), snare(), hat(), snap()
KPAT = [0, 7, 10]  # boom-bap kick steps
for bar in range(4, BARS):
    for st in KPAT: put('kick', pos(bar, st), K, .95 if st == 0 else .75)
    if bar % 2: put('kick', pos(bar, 15), K, .45)
    for st in (4, 12): put('snare', pos(bar, st), S, .7); put('snap', pos(bar, st) + .006, SN, .5)
    for st in range(0, 16, 2): put('hat', pos(bar, st), HH, .22 if st % 4 == 0 else .14)
    if bar % 4 == 3: put('hat', pos(bar, 14), hat(True), .18)
# --- bass (round sine + soft overtone), syncopated with the kick
def bassnote(m, d):
    n = int(d * SR); t = np.arange(n) / SR; f = note(m); env = np.minimum(1, t * 60) * np.exp(-t * 1.2)
    return (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)) * env
for bar in range(4, BARS):
    root, _ = CH[bar % 4]
    put('bass', pos(bar, 0), bassnote(root - 12, BEAT * 1.6), .8); put('bass', pos(bar, 7), bassnote(root - 12, BEAT * .7), .6); put('bass', pos(bar, 10), bassnote(root, BEAT * 1.2), .5)
# --- warm pad (detuned saws, low-passed)
def pad(tones, d):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in tones[:3]:
        for det in (-.12, .12): f = note(m) * 2 ** (det / 12); y += 2 * ((t * f) % 1) - 1
    y = lp(y, 900, 4); env = np.minimum(1, t / .6) * np.minimum(1, (d - t) / .6); return y * env / 6
for bar in range(8, BARS):
    _, tones = CH[bar % 4]; put('pad', bar * BAR, pad(tones, BAR + .1), .25)
# --- mix
G = {'gtr': 2.4, 'kick': .8, 'snare': .5, 'hat': .45, 'bass': .7, 'pad': .5, 'snap': .45}
mix = sum(lp(out[k], 16000) * g for k, g in G.items())
mix = hp(mix, 30)
# gentle glue: soft clip + tape-ish warmth
mix = np.tanh(mix * 1.4) / 1.4
L = mix + .002 * np.roll(mix, 220); R = mix + .002 * np.roll(mix, 330)
st = np.stack([L, R], 1)
end = int(BARS * BAR * SR); st = st[:end]; fade = int(1.5 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
st /= np.abs(st).max() / .9
os.makedirs('audio', exist_ok=True); sf.write('out/beat.wav', st, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/beat.wav', '-af', 'loudnorm=I=-16:TP=-1.5', '-b:a', '192k', 'out/beat.mp3'], check=True)
print('beat', round(BARS * BAR, 1), 's')
