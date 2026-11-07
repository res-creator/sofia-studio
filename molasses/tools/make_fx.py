# public/audio/whoosh.wav + impact.wav (synthesised transition / impact sounds, no samples)
import numpy as np, wave
SR = 44100; rng = np.random.default_rng(7)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = a * s + (1 - a) * x[i]; y[i] = s
    return y
def save(n, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9; st = np.stack([x, x], 1)
    with wave.open(f'public/audio/{n}.wav', 'w') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
d = 0.55; n = int(d * SR); t = np.arange(n) / SR; noise = rng.standard_normal(n).astype(np.float32)
env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2.2; lo = lp(noise, 500); hi = lp(noise, 2600) - lp(noise, 700); k = np.sin(np.pi * t / d)
save('whoosh', ((lo * (1 - k) + hi * k) * env).astype(np.float32))
d = 1.2; n = int(d * SR); t = np.arange(n) / SR
th = np.sin(2 * np.pi * 48 * t * (1 - 0.25 * t)) * np.exp(-t / 0.28) * (1 - np.exp(-t / 0.004))
bu = lp(rng.standard_normal(n).astype(np.float32), 900) * np.exp(-t / 0.06)
save('impact', (th + 0.5 * bu / np.abs(bu).max()).astype(np.float32))
