# Quiet mix for the mood test: voice + low wind + sparse soft piano (A minor) -> mix.wav
import json, os, subprocess, numpy as np, scipy.signal as sg, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
TL = json.load(open(f'{D}/timeline.json')); T = TL['T'] + 0.3; N = int(T * SR); rng = np.random.default_rng(5)
t_ = lambda d: np.arange(int(d * SR)) / SR
def add(b, x, t, g=1): s = int(t * SR); x = x[:max(0, N - s)]; b[s:s + len(x)] += x * g
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
voice = np.zeros(N); mus = np.zeros(N)
for L in TL['lines']:
    a, sr = sf.read(f'{D}/vo/{L["id"]}.wav'); a = a if a.ndim == 1 else a.mean(1)
    a = np.interp(np.arange(int(len(a) * SR / sr)) / SR, np.arange(len(a)) / sr, a); add(voice, a, L['t0'])
wind = lp(rng.standard_normal(N), 260); wind *= (0.6 + 0.4 * np.sin(np.arange(N) / SR * 0.7)); wind /= np.max(np.abs(wind))
def note(f, d=3.5): x = t_(d); return (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(4 * np.pi * f * x) + 0.1 * np.sin(6 * np.pi * f * x)) * np.exp(-x * 1.3) * (1 - np.exp(-x * 80))
seq = [(0.4, 220.0), (0.4, 329.6), (2.4, 261.6), (4.2, 196.0), (4.2, 293.7), (6.4, 246.9), (8.4, 174.6), (8.4, 261.6), (10.6, 220.0), (10.6, 329.6), (12.6, 440.0), (14.4, 329.6), (14.4, 220.0)]
for t, f in seq: add(mus, note(f), t, 0.25)
pad = sum(np.sin(2 * np.pi * f * np.arange(N) / SR) for f in (110, 164.8)) * 0.04; mus += pad * np.clip(np.arange(N) / SR / 2, 0, 1)
out = voice / np.max(np.abs(voice)) * 0.85 + wind * 0.07 + mus * 0.5
fade = int(0.8 * SR); out[:fade] *= np.linspace(0, 1, fade); out[-fade:] *= np.linspace(1, 0, fade)
sf.write(f'{D}/mix.wav', (out / max(1, np.max(np.abs(out)) / 0.95)).astype(np.float32), SR); print('ok', T)
