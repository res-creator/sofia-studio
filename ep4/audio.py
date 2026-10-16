# Ep4 scene-3 test mix: voice wavs (ep4/vo) + sfx from plan.json + the ep2 ukulele loop, ducked under voice. -> ep4/mix.wav
import json, subprocess, os, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
P = json.load(open(f'{D}/plan.json')); T = P['T'] + 0.5; N = int(T * SR)
rng = np.random.default_rng(7)
def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, min(n // 2, int(a * SR))); nr = max(1, min(n // 2, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return sg.lfilter(b, a, x)
def hp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, p=0.8): return x / (np.max(np.abs(x)) + 1e-9) * p
def sweep(f0, f1, d): f = np.geomspace(f0, f1, len(t_(d))); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def chime(notes, d=0.35, gap=0.08):
    out = np.zeros(int((d + gap * len(notes)) * SR))
    for i, f in enumerate(notes):
        t = t_(d); x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7); s = int(i * gap * SR); out[s:s + len(x)] += x
    return norm(out, 0.5)
def knock(f=160): t = t_(0.25); return norm(np.sin(2 * np.pi * f * t) * np.exp(-t * 25) + 0.4 * bp(noise(0.25), 800, 2000) * np.exp(-t * 40), 0.7)
def squelch(d): t = t_(d); return norm(bp(noise(d), 200, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)) * env(len(t), 0.01, 0.03), 0.5)
def waddle():
    out = np.zeros(int(2.2 * SR))
    for i in range(7): x = squelch(0.07); s = int(i * 0.3 * SR); out[s:s + len(x)] += x
    return norm(out, 0.35)
def bark():
    d = 0.16; t = t_(d); f = 520 * np.exp(-t * 5) + 300; ph = 2 * np.pi * np.cumsum(f) / SR
    x = bp(sg.sawtooth(ph) + 0.5 * noise(d), 400, 2600) * env(len(t), 0.004, 0.06); return norm(x, 0.8)
LIB = {'waddle': waddle, 'bark': bark, 'pop': lambda: norm(sweep(500, 1400, 0.09) * env(int(0.09 * SR), 0.002, 0.05), 0.6),
       'card': lambda: chime((880, 1318), 0.4, 0.07), 'tick': lambda: chime((1318, 1760), 0.3, 0.05), 'ding': lambda: chime((784, 1046, 1568), 0.45, 0.1)}
GAIN = {'waddle': 0.7, 'bark': 0.8, 'pop': 0.5, 'card': 0.5, 'tick': 0.45, 'ding': 0.6}
def load(f): return np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']), np.float32).copy()
voice = np.zeros(N); fx = np.zeros(N)
def add(buf, x, t, g=1.0):
    s = int(t * SR); e = min(N, s + len(x))
    if 0 <= s < N: buf[s:e] += x[:e - s] * g
for L in P['lines']: add(voice, norm(load(f"{D}/vo/{L['id']}.wav"), 0.9), L['t0'])
for e in P['sfx']: add(fx, LIB[e['name']](), e['t'], GAIN[e['name']])
# ukulele loop (same as ep2), C G Am F at 112 bpm
BPM = 112; beat = 60 / BPM
def pluck(f, d=0.5):
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)): out[i] = buf[i % n]; buf[i % n] = 0.5 * (buf[i % n] + buf[(i + 1) % n]) * 0.996
    return out * env(len(out), 0.002, 0.15)
CH = {'C': [261.6, 329.6, 392.0, 523.3], 'G': [196.0, 293.7, 392.0, 493.9], 'Am': [220.0, 261.6, 329.6, 440.0], 'F': [174.6, 261.6, 349.2, 440.0]}
BASS = {'C': 65.4, 'G': 49.0, 'Am': 55.0, 'F': 43.7}; cache = {}
def pl(f): 
    if f not in cache: cache[f] = pluck(f)
    return cache[f]
bar = 4 * beat; loop = np.zeros(int(bar * 4 * SR) + SR)
for bi, ch in enumerate(['C', 'G', 'Am', 'F']):
    for p in [0, 0.75, 1.5, 2, 2.75, 3.5]:
        for j, f in enumerate(CH[ch]): x = pl(f) * (0.22 if p in (0, 2) else 0.14); s = int((bi * bar + p * beat + j * 0.012) * SR); loop[s:s + len(x)] += x
    for p in (0, 1.5, 2, 3): t = t_(0.4); x = np.sin(2 * np.pi * BASS[ch] * t) * np.exp(-t * 5) * 0.5; s = int((bi * bar + p * beat) * SR); loop[s:s + len(x)] += x
    for k in range(8): x = hp(noise(0.05), 6000) * np.exp(-t_(0.05) * 60) * (0.07 if k % 2 else 0.04); s = int((bi * bar + k * beat / 2) * SR); loop[s:s + len(x)] += x
L4 = int(bar * 4 * SR); music = np.tile(loop[:L4], int(N / L4) + 2)[:N]
venv = np.convolve(np.abs(voice), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same'); duck = 1 - 0.7 * np.clip(venv * 8, 0, 1)
fade = np.ones(N); fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
mix = voice + fx * 0.8 + music * duck * fade * 0.36
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.95
p = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', f'{D}/mix.wav'], stdin=subprocess.PIPE)
p.communicate((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); print('mix done', round(T, 1))
