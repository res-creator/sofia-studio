# Sound for the collage test: synthesized SFX at cues.json times + ElevenLabs VO (vo/n*.mp3). Writes mix.wav
import json, subprocess, os, numpy as np, scipy.signal as sg
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
CU = json.load(open(f'{D}/cues.json')); N = int((CU['T'] + 0.5) * SR)
rng = np.random.default_rng(11)
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, p=0.8): return x / (np.max(np.abs(x)) + 1e-9) * p
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f): b, a = sg.butter(2, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def hp(x, f): b, a = sg.butter(2, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def fsweep(f0, f1, d): f = np.geomspace(f0, f1, int(d * SR)); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def whoosh(d=0.5, up=True):
    x = noise(d); n = len(x); out = np.zeros(n); seg = 1024
    for i in range(0, n, seg):
        u = i / n; fc = 400 + 3000 * (u if up else 1 - u); out[i:i + seg] = bp(x[i:i + seg + 2048], fc * 0.6, fc * 1.5)[:len(out[i:i + seg])]
    return norm(out * np.sin(np.linspace(0, np.pi, n)) ** 1.6, 0.5)
def thump(f=65, d=0.45): t = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(f * np.exp(-t * 7) + 38) / SR) * np.exp(-t * 8) + 0.35 * lp(noise(d), 500) * np.exp(-t * 25), 0.95)
def pop(f0=420, f1=1300): d = 0.08; return norm(fsweep(f0, f1, d) * np.exp(-t_(d) * 30), 0.5)
def tick(): f = rng.uniform(900, 1500); d = 0.06; return norm(np.sin(2 * np.pi * f * t_(d)) * np.exp(-t_(d) * 60) + 0.3 * hp(noise(d), 3000) * np.exp(-t_(d) * 90), 0.3)
def paper(): d = 0.12; return norm(bp(noise(d), 1500, 7000) * np.exp(-t_(d) * 28), 0.35)
def clink():
    f = rng.uniform(2400, 3400); d = 0.25; t = t_(d); x = sum(np.sin(2 * np.pi * f * m * t) / (i + 1) for i, m in enumerate([1, 2.76, 5.4])) * np.exp(-t * 18)
    return norm(x, 0.16)
def kaching():
    d = 0.9; t = t_(d); bell = (np.sin(2 * np.pi * 2093 * t) + 0.6 * np.sin(2 * np.pi * 3136 * t) + 0.3 * np.sin(2 * np.pi * 4186 * t)) * np.exp(-t * 5)
    x = 0.5 * bell; x[: int(0.07 * SR)] += 0.6 * hp(noise(0.07), 2500) * np.exp(-t_(0.07) * 40); return norm(x, 0.5)
def fall(): d = 0.5; return norm(fsweep(1800, 500, d) * np.linspace(0.2, 1, int(d * SR)) * 0.6 + 0.4 * whoosh(d), 0.35)
def rumble(): d = 0.6; t = t_(d); return norm(lp(noise(d), 160) * np.sin(np.linspace(0, np.pi, len(t))) + 0.3 * fsweep(50, 90, d), 0.55)
def rise(): d = 0.5; return norm(fsweep(300, 900, d) * np.sin(np.linspace(0, np.pi, int(d * SR))) * 0.5 + whoosh(d), 0.35)
def tape(): d = 0.18; return norm(bp(noise(d), 800, 5000) * (1 - t_(d) / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 70 * t_(d))), 0.35)
def scratch(): d = 0.5; t = t_(d); return norm(bp(noise(d), 2500, 8000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) ** 2 * np.sin(np.linspace(0, np.pi, len(t))), 0.18)
def flutter(): d = 0.35; t = t_(d); return norm(bp(noise(d), 1000, 4000) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t)) * np.exp(-t * 6), 0.12)
def slam(): return norm(thump(55, 0.5) + 0.4 * hp(noise(0.5), 2000) * np.exp(-t_(0.5) * 14), 0.7)
def puff(): d = 0.4; return norm(lp(noise(d), 900) * np.exp(-t_(d) * 9), 0.3)
def coinburst():
    o = np.zeros(int(0.7 * SR))
    for i in range(7): s = int(rng.uniform(0, 0.4) * SR); c = clink(); o[s:s + len(c)] += c[: len(o) - s] * 2
    return norm(o, 0.35)
SFX = {'pop': pop, 'whoosh': whoosh, 'fall': fall, 'thump': thump, 'zoom': lambda: whoosh(0.35), 'puff': puff, 'paper': paper, 'kaching': kaching, 'coins': coinburst,
       'rumble': rumble, 'tape': tape, 'scratch': scratch, 'unfold': lambda: norm(paper() + 0, 0.3), 'tick': tick, 'tag': lambda: pop(300, 900), 'rise': rise, 'clink': clink, 'flutter': flutter, 'slam': slam}
mix = np.zeros(N)
for c in CU['sfx']:
    name, t, g = c[0], c[1], (c[2] if len(c) > 2 else 1.0)
    x = SFX[name]() * g; s = int(t * SR)
    if 0 <= s < N: mix[s:s + len(x)] += x[: N - s]
fx = mix * 0.7
vo = np.zeros(N)
for vid, t in CU['vo']:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/vo/{vid}.mp3', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; s = int(t * SR); vo[s:s + len(a)] += a[: N - s]
duck = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(4410) / 4410, 'same')
out = vo * 1.0 + fx * (1 - 0.35 * np.clip(duck * 3, 0, 1))
out = np.tanh(out * 1.1) * 0.9
import wave
w = wave.open(f'{D}/mix.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', len(CU['sfx']), 'sfx')
