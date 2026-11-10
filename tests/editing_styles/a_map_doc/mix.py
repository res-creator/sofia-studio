# Sound for editing-style test A: Kokoro voice + synthesized moody documentary bed (soft pad + ticking percussion + pulse bass)
# on one bar grid, ducked under the voice at ~0.1, plus light SFX (whoosh, paper slide, marker squeak, pin drop). -> mix.wav
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
C = json.load(open(f'{D}/cues.json')); T = C['T']; N = int(T * SR)
v, vsr = sf.read(f'{D}/vo.wav'); v = resample_poly(v, SR, vsr) if vsr != SR else v
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
rng = np.random.default_rng(4); t = np.arange(N) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
# ---- music: 92 BPM, 4/4, Am - F - C - G (one bar each), sections by time
BPM = 92; beat = 60 / BPM; bar = 4 * beat
CH = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
def hz(m): return 440 * 2 ** ((m - 69) / 12)
mus = np.zeros(N)
nb = int(T / bar) + 1
for b in range(nb):
    t0 = b * bar; i0 = int(t0 * SR); i1 = min(N, int((t0 + bar + 0.6) * SR))
    if i0 >= N: break
    tt = np.arange(i1 - i0) / SR; ch = CH[b % 4]
    env = np.minimum(1, tt / 0.6) * np.exp(-np.maximum(0, tt - bar) / 0.25)
    pad = sum(np.sin(2 * np.pi * hz(m) * tt * d) for m in ch for d in (1, 1.004, 0.996)) / 9
    mus[i0:i1] += 0.5 * pad * env
    # pulse bass on 8ths
    for k in range(8):
        s = int((t0 + k * beat / 2) * SR); e = min(N, s + int(0.22 * SR))
        if s >= N: break
        q = np.arange(e - s) / SR; mus[s:e] += 0.35 * np.sin(2 * np.pi * hz(ch[0] - 24) * q) * np.exp(-q / 0.09)
    # ticking hats on 16ths (from bar 1), soft kick on 1 and 3
    if b >= 1:
        for k in range(16):
            s = int((t0 + k * beat / 4) * SR); e = min(N, s + int(0.04 * SR))
            if s >= N: break
            n = rng.standard_normal(e - s) * np.exp(-np.arange(e - s) / SR / 0.012); mus[s:e] += (0.18 if k % 4 == 2 else 0.09) * n
        for k in (0, 2):
            s = int((t0 + k * beat) * SR); e = min(N, s + int(0.25 * SR))
            if s >= N: break
            q = np.arange(e - s) / SR; mus[s:e] += 0.5 * np.sin(2 * np.pi * (45 + 60 * np.exp(-q / 0.03)) * q) * np.exp(-q / 0.12)
mus[:] = hp(mus, 40)
# end: thin out
mus *= np.clip((T - t) / 1.2, 0, 1)
# ---- SFX
fx = np.zeros(N)
def add(at, sig, g=1.0):
    s = int(at * SR); e = min(N, s + len(sig))
    if 0 <= s < N: fx[s:e] += g * sig[:e - s]
def whoosh(d=0.45):
    n = rng.standard_normal(int(d * SR)); q = np.arange(len(n)) / SR; env = np.sin(np.pi * q / d) ** 2
    f = 300 + 3000 * np.sin(np.pi * q / d); out = np.zeros_like(n); y = 0; a = 0
    lpn = lp(n, 2500); return bp(n, 300, 4000) * env * 0.7
def paper(d=0.28):
    n = rng.standard_normal(int(d * SR)); q = np.arange(len(n)) / SR; return bp(n, 1500, 7000) * (np.exp(-q / 0.08) * (1 + 0.5 * np.sin(q * 90))) * 0.6
def marker(d=0.45):
    q = np.arange(int(d * SR)) / SR; n = rng.standard_normal(len(q)); tone = np.sin(2 * np.pi * (1800 + 400 * np.sin(q * 30)) * q) * 0.25
    return (bp(n, 2500, 8000) * 0.5 + tone) * (np.minimum(1, q / 0.03) * np.exp(-q / 0.3)) * (0.6 + 0.4 * np.sin(q * 55) ** 2)
def pin(d=0.3):
    q = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * 1300 * q) * np.exp(-q / 0.02) * 0.6 + lp(rng.standard_normal(len(q)), 400) * np.exp(-q / 0.05) * 1.2)
def hit(d=0.6):
    q = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * (50 + 80 * np.exp(-q / 0.04)) * q) * np.exp(-q / 0.18) + lp(rng.standard_normal(len(q)), 1200) * np.exp(-q / 0.04) * 0.5
for a in C['whoosh']: add(a - 0.22, whoosh(), 0.8)
for a in C['paper']: add(a, paper(), 0.7)
for a in C['marker']: add(a, marker(), 0.35)
for a in C['pin']: add(a, pin(), 0.8)
for a in C['hit']: add(0.0, hit(), 0.9)
# ---- mix: duck music under voice
venv = lp(np.abs(voice), 8); dk = np.clip(venv / (venv.max() * 0.25), 0, 1)
vr = np.sqrt(np.mean(voice[voice != 0] ** 2)); mr = np.sqrt(np.mean(mus ** 2)) + 1e-9
out = voice + mus / mr * vr * 0.2 * (1 - 0.6 * dk) + fx * vr * 1.6 * (1 - 0.4 * dk)
out /= np.max(np.abs(out)) / 0.9
sf.write(f'{D}/mix.wav', np.stack([out, out], 1), SR); print('mix ok', round(T, 2))
