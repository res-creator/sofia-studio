# Mix for a What-if episode: python3 whatif/audio.py whatif/jupiter -> <ep>/mix.wav
# voice (vo/<id>.wav|mp3) + synthesized SFX from cues.json + light space-synth music ducked under the voice.
import json, sys, os, subprocess, numpy as np, scipy.signal as sg
ep = sys.argv[1]; SR = 44100
TL = json.load(open(f'{ep}/timeline.json')); CUES = json.load(open(f'{ep}/cues.json'))['cues']
T = TL['T'] + 0.5; N = int(T * SR); rng = np.random.default_rng(3)
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, p=0.8): return x / (np.max(np.abs(x)) + 1e-9) * p
def bp(x, lo, hi, o=2): b, a = sg.butter(o, [lo / (SR / 2), min(hi / (SR / 2), 0.99)], 'band'); return sg.lfilter(b, a, x)
def lp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'low'); return sg.lfilter(b, a, x)
def hp(x, f, o=2): b, a = sg.butter(o, f / (SR / 2), 'high'); return sg.lfilter(b, a, x)
def fade(x, a=0.01, r=0.1):
    n = len(x); na, nr = max(1, int(a * SR)), max(1, int(r * SR)); x = x.copy(); x[:na] *= np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d * SR)); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def filt_sweep(x, f0, f1):
    out = np.zeros_like(x); n = len(x); seg = 1024
    for i in range(0, n, seg):
        fc = f0 * (f1 / f0) ** (i / n); y = bp(x[max(0, i - 2048):i + seg], fc * 0.6, fc * 1.5); out[i:i + seg] = y[-len(out[i:i + seg]):]
    return out
S = {}
S['whoosh'] = lambda: norm(filt_sweep(noise(0.45), 300, 4000) * np.sin(np.linspace(0, np.pi, int(0.45 * SR))) ** 1.5, 0.5)
S['pop'] = lambda: norm(fade(sweep(500, 1500, 0.09), 0.002, 0.05), 0.5)
S['boom'] = lambda: norm(np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t_(1.2) * 5)) / SR) * np.exp(-t_(1.2) * 3) + 0.5 * lp(noise(1.2), 300) * np.exp(-t_(1.2) * 4), 0.9)
S['wind'] = lambda: norm(fade(lp(noise(2.6), 500) * (0.6 + 0.4 * np.sin(t_(2.6) * 3)), 0.3, 0.8), 0.35)
S['fire'] = lambda: norm(fade(lp(noise(3.0), 900) * 0.6 + (rng.random(int(3 * SR)) > 0.9993) * rng.standard_normal(int(3 * SR)) * 6, 0.1, 0.6), 0.5)
def _freeze():
    x = sum(np.sin(2 * np.pi * f * t_(1.4)) * np.exp(-t_(1.4) * 2.5) for f in (2093, 2637, 3136, 4186)); return norm(x + 0.2 * hp(noise(1.4), 5000) * np.exp(-t_(1.4) * 3), 0.35)
S['freeze'] = _freeze
S['storm'] = lambda: norm(fade(filt_sweep(noise(3.2), 200, 1200) + 0.5 * filt_sweep(noise(3.2), 1200, 300), 0.3, 0.8), 0.45)
S['boing'] = lambda: norm(np.sin(2 * np.pi * np.cumsum(180 + 220 * np.exp(-t_(0.6) * 6) * (1 + 0.5 * np.sin(2 * np.pi * 14 * t_(0.6)))) / SR) * np.exp(-t_(0.6) * 4), 0.5)
S['crunch'] = lambda: norm(sum(np.roll(bp(noise(0.5), 800, 5000) * np.exp(-t_(0.5) * 18), int(i * 0.05 * SR)) for i in range(5)) + S['boom']()[:int(0.5 * SR)] * 0.5, 0.8)
S['squeeze'] = lambda: norm(fade(sg.sawtooth(2 * np.pi * np.cumsum(90 + 30 * np.sin(t_(2.5) * 9)) / SR) * 0.3, 0.2, 0.4) * np.linspace(0.3, 1, int(2.5 * SR)), 0.3)
def _thud():
    x = np.zeros(int(1.0 * SR)); one = np.sin(2 * np.pi * np.cumsum(60 * np.exp(-t_(0.4) * 6) + 35) / SR) * np.exp(-t_(0.4) * 8)
    for i in range(3): s = int(i * 0.25 * SR); x[s:s + len(one)] += one[:len(x) - s]
    return norm(x, 0.9)
S['thud'] = _thud
S['bubble'] = lambda: norm(np.concatenate([np.concatenate([fade(sweep(300 + 60 * k, 900 + 90 * k, 0.08), 0.002, 0.04), np.zeros(int(0.06 * SR))]) for k in range(10)]), 0.4)
def _sparkle():
    x = np.zeros(int(0.8 * SR))
    for i, f in enumerate((1568, 2093, 2637, 3136)): s = int(i * 0.07 * SR); y = np.sin(2 * np.pi * f * t_(0.5)) * np.exp(-t_(0.5) * 8); x[s:s + len(y)] += y
    return norm(x, 0.35)
S['sparkle'] = _sparkle
S['ding'] = lambda: norm((np.sin(2 * np.pi * 1318 * t_(0.8)) + 0.4 * np.sin(2 * np.pi * 2636 * t_(0.8))) * np.exp(-t_(0.8) * 5), 0.45)
S['drill'] = lambda: norm(fade(sg.square(2 * np.pi * np.cumsum(240 + 40 * np.sin(t_(0.7) * 30)) / SR) * 0.4, 0.02, 0.1), 0.2)
mix_v = np.zeros(N); mix_s = np.zeros(N)
def add(buf, x, t, g=1.0):
    s = int(t * SR); x = x[:max(0, N - s)]; buf[s:s + len(x)] += x * g
def load(path):
    a = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(a, np.float32).astype(np.float64)
for L in TL['lines']:
    f = next((f'{ep}/vo/{L["id"]}.{e}' for e in ('mp3', 'wav') if os.path.exists(f'{ep}/vo/{L["id"]}.{e}')), None)
    add(mix_v, load(f), L['t0'])
for c in CUES: add(mix_s, S[c['n']](), c['t'], 0.8)
# music: 4-chord loop, 112 bpm, pad + pluck arp + soft kick/hat
bpm = 112; beat = 60 / bpm; bar = beat * 4
CH = [(220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (261.6, 329.6, 392.0), (196.0, 246.9, 293.7)]
mus = np.zeros(N)
nb = int(T / bar) + 1
for b in range(nb):
    ch = CH[b % 4]; t0 = b * bar
    pad = sum(sg.sawtooth(2 * np.pi * f * t_(bar)) for f in ch); pad = lp(pad, 900) * 0.05; add(mus, fade(pad, 0.3, 0.3), t0)
    for i in range(8):
        f = ch[i % 3] * (2 if i % 4 >= 2 else 1); x = np.sin(2 * np.pi * f * t_(0.25)) * np.exp(-t_(0.25) * 14) * 0.12; add(mus, x, t0 + i * beat / 2)
    for i in range(4):
        add(mus, np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t_(0.25) * 30)) / SR) * np.exp(-t_(0.25) * 12) * 0.22, t0 + i * beat)
        add(mus, hp(noise(0.05), 7000) * np.exp(-t_(0.05) * 60) * 0.05, t0 + i * beat + beat / 2)
# duck music under voice
venv = np.convolve(np.abs(mix_v), np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
duck = 1 - 0.55 * np.clip(venv / (np.percentile(venv[venv > 0], 90) + 1e-9), 0, 1)
mus *= duck; mus[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))
out = mix_v / (np.max(np.abs(mix_v)) + 1e-9) * 0.8 + mix_s * 0.55 + mus * 0.9
out = out / max(1.0, np.max(np.abs(out)) / 0.95)
import soundfile as sf; sf.write(f'{ep}/mix.wav', out.astype(np.float32), SR); print('mix', round(T, 2), 's')
