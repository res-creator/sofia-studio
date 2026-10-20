# Sound bed for the animatic (no voice): python3 whatif/animatic/audio.py -> mix.wav
import json, os, numpy as np, scipy.signal as sg, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
C = json.load(open(f'{D}/cues.json')); T = C['T']; N = int(T * SR); rng = np.random.default_rng(11)
t_ = lambda d: np.arange(int(d * SR)) / SR
nz = lambda d: rng.standard_normal(int(d * SR))
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def bp(x, lo, hi): b, a = sg.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return sg.lfilter(b, a, x)
def norm(x, p): return x / (np.max(np.abs(x)) + 1e-9) * p
def env(x, a, r): n = len(x); x = x.copy(); na, nr = int(a * SR), int(r * SR); x[:na] *= np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def sweep_noise(d, f0, f1):
    x = nz(d); out = np.zeros_like(x); seg = 1024
    for i in range(0, len(x), seg): fc = f0 * (f1 / f0) ** (i / len(x)); out[i:i + seg] = bp(x[max(0, i - 2048):i + seg], fc * 0.6, fc * 1.5)[-len(out[i:i + seg]):]
    return out
def chimes(fs, d=1.2, gap=0.09):
    x = np.zeros(int((d + gap * len(fs)) * SR))
    for i, f in enumerate(fs): s = int(i * gap * SR); y = np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) * 3); x[s:s + len(y)] += y
    return norm(x, 0.3)
FX = {
 'drone': lambda: env(norm(sum(np.sin(2 * np.pi * f * t_(3.2)) for f in (55, 82.4, 110.3)) + 0.3 * lp(nz(3.2), 200), 0.3), 0.8, 0.4),
 'whoosh': lambda: norm(sweep_noise(0.6, 300, 4000) * np.sin(np.linspace(0, np.pi, int(0.6 * SR))) ** 1.5, 0.5),
 'wind': lambda: env(norm(lp(nz(2.6), 700) * np.linspace(0.3, 1, int(2.6 * SR)), 0.45), 0.3, 0.2),
 'puff': lambda: env(norm(lp(nz(0.6), 1500) * np.exp(-t_(0.6) * 5), 0.6), 0.01, 0.2),
 'storm': lambda: env(norm(sweep_noise(3.0, 250, 900) + 0.6 * lp(nz(3.0), 150), 0.5), 0.1, 0.4),
 'thunder': lambda: norm(lp(nz(1.6), 400) * np.exp(-t_(1.6) * 2.2) + 0.6 * bp(nz(1.6), 1500, 6000) * np.exp(-t_(1.6) * 25), 0.9),
 'groan': lambda: env(norm(sg.sawtooth(2 * np.pi * np.cumsum(48 + 6 * np.sin(t_(3.0) * 2)) / SR) * 0.5 + lp(nz(3.0), 120), 0.45) * np.linspace(0.4, 1, int(3 * SR)), 0.2, 0.3),
 'creak': lambda: env(norm(bp(sg.sawtooth(2 * np.pi * np.cumsum(140 + 60 * np.sin(t_(0.5) * 40)) / SR), 200, 1500), 0.3), 0.02, 0.15),
 'fire': lambda: env(norm(lp(nz(3.0), 1200) * np.linspace(0.4, 1, int(3 * SR)) + (rng.random(int(3 * SR)) > 0.999) * nz(3.0) * 5, 0.5), 0.1, 0.3),
 'boom': lambda: norm(np.sin(2 * np.pi * np.cumsum(35 + 70 * np.exp(-t_(2.0) * 4)) / SR) * np.exp(-t_(2.0) * 1.5) + 0.4 * lp(nz(2.0), 250) * np.exp(-t_(2.0) * 3), 0.9),
 'dissolve': lambda: chimes((880, 1046.5, 1318.5, 1760)),
}
out = np.zeros(N)
for c in C['cues']:
    x = FX[c['n']](); s = int(c['t'] * SR); x = x[:max(0, N - s)]; out[s:s + len(x)] += x
pad = sum(np.sin(2 * np.pi * f * np.arange(N) / SR) for f in (73.4, 110, 146.8)) * 0.05; out += pad * np.clip(np.arange(N) / SR / 1.5, 0, 1)
f = int(0.5 * SR); out[-f:] *= np.linspace(1, 0, f)
sf.write(f'{D}/mix.wav', (out / max(1, np.max(np.abs(out)) / 0.95)).astype(np.float32), SR); print('mix', T)
