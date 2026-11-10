# Test C sound: bouncy plucked marimba/ukulele-like bed (synth, 116 BPM, C major), ducked under the voice, with HARD STOPS on the gags
# (freeze-frame, deadpan cards, the serious beat), plus pops / clicks / stamps / a record scratch. Output: mix.wav (44.1 kHz)
import json, numpy as np, soundfile as sf
from scipy.signal import resample_poly, butter, lfilter
SR = 44100; J = json.load(open('words.json')); T = J['T'] + 1.3; N = int(T * SR); t = np.arange(N) / SR
v, vsr = sf.read('vo.wav'); v = resample_poly(v, 147, 80)[:N]; vo = np.zeros(N); vo[:len(v)] = v
rng = np.random.default_rng(3)
def env(n, a=0.004, d=0.25): x = np.arange(n) / SR; return np.minimum(x / a, 1) * np.exp(-x / d)
def pluck(f, dur=0.35, amp=1.0):  # marimba-ish: sine + 4th harmonic, fast decay
    n = int(dur * SR); x = np.arange(n) / SR; return amp * env(n, 0.003, dur / 3) * (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * 4 * f * x) * np.exp(-x * 30))
def add(buf, s, at):
    i = int(at * SR); s = s[:max(0, N - i)]; buf[i:i + len(s)] += s
mus = np.zeros(N); BPM = 116; beat = 60 / BPM
prog = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]]
mel = [0, 2, 1, 2, 0, 1, 2, 1]
for b in range(int(T / beat) + 1):
    tb = b * beat; ch = prog[(b // 4) % 4]
    add(mus, pluck(ch[0] / 2, 0.4, 0.55), tb)                      # bass
    add(mus, pluck(ch[mel[b % 8]] * 2, 0.25, 0.35), tb)            # melody pluck
    if b % 2: add(mus, pluck(ch[(b // 2) % 3] * 2, 0.2, 0.22), tb + beat / 2)
    hat = rng.standard_normal(int(0.03 * SR)) * env(int(0.03 * SR), 0.001, 0.008); add(mus, 0.12 * hat, tb + beat / 2)
# hard stops (music off) on the gags and the serious beat
gate = np.ones(N)
for a, b in [(19.5, 22.4), (27.1, 30.95), (36.8, T)]:
    i, j = int(a * SR), int(b * SR); gate[i:j] = 0
g = np.convolve(gate, np.ones(int(0.012 * SR)) / int(0.012 * SR), mode='same')   # ~12 ms edges = hard but click-free
dk = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same'); dk = np.clip(dk * 3, 0, 1)
mus = mus / np.max(np.abs(mus)) * g * 0.1 * (1 - 0.6 * dk) * 2.2
# SFX
fx = np.zeros(N)
def popfx(): n = int(0.06 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * (900 - 4000 * x) * x) * env(n, 0.001, 0.02)
def click(): n = int(0.02 * SR); return rng.standard_normal(n) * env(n, 0.0005, 0.004)
def thud(): n = int(0.25 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * 70 * x) * env(n, 0.002, 0.07) + 0.4 * rng.standard_normal(n) * env(n, 0.001, 0.015)
def scratch():
    n = int(0.45 * SR); x = np.arange(n) / SR; noise = rng.standard_normal(n); bb, aa = butter(2, [600 / (SR / 2), 3500 / (SR / 2)], 'band'); s = lfilter(bb, aa, noise)
    return s * (0.5 + 0.5 * np.sin(2 * np.pi * (8 + 30 * x) * x)) * env(n, 0.005, 0.18) * 1.6
def whoosh():
    n = int(0.5 * SR); x = np.arange(n) / SR; s = rng.standard_normal(n); bb, aa = butter(2, [300 / (SR / 2), 2500 / (SR / 2)], 'band'); return lfilter(bb, aa, s) * np.sin(np.pi * x / x[-1]) * 0.8
cuts = [0.0, 1.2, 2.6, 3.55, 5.3, 6.9, 8.0, 10.1, 13.7, 16.9, 22.4, 25.4, 30.95, 33.4, 35.15]
for c in cuts: add(fx, 0.5 * popfx(), c)
for c in [1.35, 1.7, 4.4, 5.75, 6.3, 7.15, 8.9, 12.9, 17.05, 18.95, 24.5, 24.9, 25.45, 26.25, 26.5, 31.9, 32.1, 34.1]: add(fx, 0.35 * click(), c)
for c in [14.7, 15.85, 32.62, 35.55]: add(fx, 0.9 * thud(), c)
add(fx, scratch(), 19.5); add(fx, whoosh(), 24.1); add(fx, 0.7 * thud(), 20.8); add(fx, 0.5 * thud(), 36.8)
fx *= 0.3 * (1 - 0.5 * dk)
mix = vo + mus + fx; mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
sf.write('mix.wav', mix, SR); print('mix', round(T, 2))
