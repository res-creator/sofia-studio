# Test B sound: Kokoro voice + synthesized dark investigative score (low drone, pulsing bass on one bar grid, tension hits)
# + SFX (whooshes on card moves, hits on punches/stamps, glitch blips, typing clicks, string snaps, timeline ticks). → mix.wav (44.1 kHz stereo)
import json, numpy as np, soundfile as sf
from scipy.signal import resample_poly, butter, sosfilt
SR = 44100; C = json.load(open('cues.json')); T = C['T']; N = int(T * SR) + SR
rng = np.random.default_rng(7)
vo, vsr = sf.read('vo.wav'); vo = resample_poly(vo, 147, 80)  # 24k → 44.1k
V = np.zeros(N); V[:len(vo)] = vo[:N]
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, r): e = np.ones(n); a = max(1, int(a * SR)); e[:a] = np.linspace(0, 1, a); e *= np.exp(-np.arange(n) / (r * SR)); return e
def add(buf, x, t):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x)); buf[i:j] += x[:j - i]
# ---------- music ----------
M = np.zeros(N); tt = np.arange(N) / SR
saw = lambda f: 2 * ((tt * f) % 1) - 1
drone = lp(saw(55) + 0.6 * saw(55.3) + 0.4 * saw(82.4), 220) * 0.35
swell = 0.6 + 0.4 * np.sin(2 * np.pi * tt / 8)
M += drone * swell
BPM = 96; beat = 60 / BPM; bar = 4 * beat
roots = [55, 55, 43.65, 49.0]  # A A F G (A minor feel)
nb = int(T / bar) + 1
for b in range(nb):
    r = roots[b % 4]
    for k in range(8):  # eighth-note pulse bass
        t0 = b * bar + k * beat / 2
        if t0 > T - 1.0: break
        n = int(0.22 * SR); x = np.arange(n) / SR
        tone = np.sign(np.sin(2 * np.pi * r * x)) * 0.5 + np.sin(2 * np.pi * r * x)
        add(M, lp(tone, 300) * env(n, 0.005, 0.09) * (0.55 if k % 2 == 0 else 0.35), t0)
    # high tension tick on beat 4
    n = int(0.08 * SR); add(M, hp(rng.standard_normal(n), 6000) * env(n, 0.001, 0.02) * 0.25, b * bar + 3 * beat)
# tension hits (low boom + reversed swell) on scene starts with glitches
for t0 in C['glitch'][1:]:
    n = int(1.2 * SR); x = np.arange(n) / SR
    add(M, np.sin(2 * np.pi * 45 * x * (1 - 0.3 * x)) * env(n, 0.002, 0.35) * 0.9, t0)
    n2 = int(0.6 * SR); sw = lp(rng.standard_normal(n2), 1500) * np.linspace(0, 1, n2) ** 2 * 0.35; add(M, sw, t0 - 0.6)
# end: music cuts on the last word, a final boom
end = C['scenes'][-1]
M[int((T - 0.9) * SR):] *= np.linspace(1, 0, N - int((T - 0.9) * SR))
# ---------- sfx ----------
FX = np.zeros(N)
def whoosh(t0, d=0.45):
    n = int(d * SR); x = rng.standard_normal(n); e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    y = np.concatenate([bp(x[i:i + 2048], 300 + 3000 * (i / n), 900 + 5000 * (i / n)) for i in range(0, n, 2048)])[:n]
    add(FX, y * e * 0.8, t0 - d * 0.5)
def hit(t0, g=1.0):
    n = int(0.5 * SR); x = np.arange(n) / SR
    y = np.sin(2 * np.pi * 70 * x * (1 - 0.4 * x)) * env(n, 0.001, 0.12) + lp(rng.standard_normal(n), 2500) * env(n, 0.001, 0.03) * 0.6
    add(FX, y * g, t0)
def blip(t0):
    for k in range(5):
        n = int(0.03 * SR); f = 400 + 1600 * rng.random(); x = np.arange(n) / SR
        add(FX, np.sign(np.sin(2 * np.pi * f * x)) * 0.18, t0 + k * 0.035)
    n = int(0.18 * SR); add(FX, hp(rng.standard_normal(n), 3000) * env(n, 0.001, 0.05) * 0.4, t0)
def typing(a, b):
    t = a
    while t < b:
        n = int(0.025 * SR); add(FX, bp(rng.standard_normal(n), 2000, 6000) * env(n, 0.001, 0.008) * 0.35, t); t += 0.035 + 0.03 * rng.random()
def snap(t0):
    n = int(0.12 * SR); x = np.arange(n) / SR; add(FX, np.sin(2 * np.pi * 900 * x * (1 - 2 * x)) * env(n, 0.001, 0.03) * 0.3, t0)
def tick(t0):
    n = int(0.06 * SR); x = np.arange(n) / SR; add(FX, np.sin(2 * np.pi * 1800 * x) * env(n, 0.001, 0.015) * 0.35, t0)
for t0 in C['glitch']: blip(t0)
for t0 in C['whoosh']: whoosh(t0)
for t0 in C['hits']: hit(t0, 1.2 if t0 == 0 else 0.9)
for a, b in C['type']: typing(a, b)
for t0 in C['strings']: snap(t0 + 0.35)
for t0 in C['ticks']: tick(t0)
# ---------- mix: duck music under the voice ----------
def ma(x, k):
    c = np.cumsum(np.concatenate([[0], x])); y = (c[k:] - c[:-k]) / k; return np.concatenate([np.full(k // 2, y[0]), y, np.full(len(x) - len(y) - k // 2, y[-1])])
ve = ma(np.abs(V), int(0.05 * SR)); dk = ma(np.clip(ve / 0.05, 0, 1), int(0.25 * SR))
mus = M / (np.max(np.abs(M)) + 1e-9); fx = FX / (np.max(np.abs(FX)) + 1e-9); v = V / (np.max(np.abs(V)) + 1e-9)
out = v * 0.9 + mus * 0.12 * (1 - 0.6 * dk) + fx * 0.32 * (1 - 0.4 * dk)
out = out[:int(T * SR)]
st = np.stack([out, out], 1); st[:, 0] = out + 0.0; sf.write('mix.wav', st / max(1, np.max(np.abs(st)) / 0.95), SR)
print('mix ok', round(len(out) / SR, 2))
