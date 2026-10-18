# Ep1 mix: voices (+ radio band-pass), sfx, looped music beds ducked under dialogue -> out/mix.wav
import json, subprocess, os, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100
C = json.load(open(f'{D}/out/cues.json')); N = int((C['T'] + 0.5) * SR)
cache = {}
def load(f, filt=None):
    k = (f, filt)
    if k not in cache:
        args = ['ffmpeg', '-v', 'error', '-i', os.path.join(D, f)] + (['-af', filt] if filt else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
        a = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2)
        cache[k] = a
    return cache[k]
def put(buf, a, t, v):
    i = int(max(0, t) * SR); j = min(N, i + len(a))
    if j > i: buf[i:j] += a[:j - i] * v
voice = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32); mus = np.zeros((N, 2), np.float32)
GAIN = {'N': 1.7, 'H': 1.25, 'G': 0.78, 'S': 0.65}   # speaker balance: narrator +4.6 dB, hero +1.9 dB, Gary -2.2 dB, Sarah -3.7 dB
RADIO = 'highpass=f=500,lowpass=f=2800,acrusher=bits=8:mix=0.25,volume=1.4'
for v in C['voices']:
    if v['who'] == 'R':
        put(voice, load(v['file'], RADIO), v['t'], 0.9); put(fx, load('sfx/radio.mp3'), v['t'] - 0.05, 0.18)
    else: put(voice, load(v['file']), v['t'], GAIN[v['who']])
for s in C['sfx']:
    a = load(s['file'])
    if s.get('dur'):   # long beds (drone) trimmed to dur seconds with a soft fade-out
        L = min(len(a), int(s['dur'] * SR)); a = a[:L].copy(); fo = min(int(1.5 * SR), L // 2); a[L - fo:] *= np.linspace(1, 0, fo)[:, None]; fi = min(int(0.3 * SR), L // 4); a[:fi] *= np.linspace(0, 1, fi)[:, None]
    put(fx, a, s['t'], s['v'])
for m in C['music']:
    a = load(m['file']); L = int((m['b'] - m['a']) * SR)
    if L <= 0: continue
    reps = int(np.ceil(L / len(a))); seg = np.tile(a, (reps, 1))[:L].copy()
    fi, fo = min(int(0.5 * SR), L // 3), min(int(0.8 * SR), L // 3)
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]; seg[L - fo:] *= np.linspace(1, 0, fo)[:, None]
    put(mus, seg, m['a'], m['v'])
# duck music under dialogue (smoothed voice envelope)
env = np.abs(voice).max(axis=1); win = int(0.25 * SR); cs = np.concatenate([[0], np.cumsum(env, dtype=np.float64)])
env = (cs[np.minimum(np.arange(N) + win // 2, N)] - cs[np.maximum(np.arange(N) - win // 2, 0)]) / win; duck = 1 - 0.45 * np.clip(env / 0.05, 0, 1)
fduck = 1 - 0.25 * np.clip(env / 0.05, 0, 1)
mix = voice + fx * 0.9 * fduck[:, None] + mus * duck[:, None]
peak = np.abs(mix).max(); mix = np.tanh(mix * 1.1) * 0.92
raw = f'{D}/out/mix_raw.f32'; mix.astype(np.float32).tofile(raw)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', str(SR), f'{D}/out/mix.wav'], check=True)
os.remove(raw); print('mix ok', round(C['T'], 1), 's, pre-peak', round(float(peak), 2))
