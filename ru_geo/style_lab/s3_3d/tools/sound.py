"""Sound design for the 14 s clip, all synthesised in numpy (no samples, no music): a quiet warm bed, soft clay taps as the
slabs settle, two mallet notes when Greenland and Africa take colour, an air lift + a long filtered swish for the flight,
a soft thud on landing, ticks for the tags and a warm chord for «×14». → out/sound.wav (48 kHz stereo).
usage: python3 -I tools/sound.py <s3_3d folder>"""
import os, sys
import numpy as np
from scipy import signal
D = sys.argv[1]; SR = 48000; T = 14.0; N = int(SR * T)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
t = np.arange(N) / SR
def put(x, at, pan=0.0, g=1.0):
    i = int(at * SR); n = min(len(x), N - i)
    if n <= 0: return
    L[i:i + n] += x[:n] * g * np.sqrt(.5 * (1 - pan)); R[i:i + n] += x[:n] * g * np.sqrt(.5 * (1 + pan))
def env(n, a, d):
    k = np.arange(n) / SR; return np.minimum(1, k / max(a, 1e-4)) * np.exp(-k / d)
def bp(x, lo, hi, o=2):
    b, a = signal.butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def lp(x, f, o=2):
    b, a = signal.butter(o, f / (SR / 2)); return signal.lfilter(b, a, x)
# bed: two soft low tones + filtered air, slow swell, fades out at the end
bed = (np.sin(2 * np.pi * 110 * t) * .5 + np.sin(2 * np.pi * 164.8 * t) * .3 + np.sin(2 * np.pi * 220.4 * t) * .12)
bed *= .5 + .5 * np.sin(2 * np.pi * t / 7 - 1.3) ** 2
air = lp(rng.standard_normal(N), 900) * .25
fade = np.clip(t / 1.2, 0, 1) * np.clip((T - t) / 1.4, 0, 1)
put((bed * .05 + air * .05) * fade, 0)
# clay taps: a short knock (noise burst through a resonant band + low body)
def tap(f=420, d=.05):
    n = int(SR * .25); k = np.arange(n) / SR
    x = bp(rng.standard_normal(n), f * .7, f * 1.6) * env(n, .0015, d) + np.sin(2 * np.pi * f * .45 * k) * env(n, .002, d * 1.6) * .6
    return x
taps = sorted(rng.uniform(.9, 2.7, 13))
for i, a in enumerate(taps): put(tap(rng.uniform(330, 560)), a, pan=rng.uniform(-.6, .6), g=rng.uniform(.18, .3))
# mallet notes (sine + soft overtone)
def mallet(f, d=1.4):
    n = int(SR * (d * 3)); k = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * k) + .25 * np.sin(2 * np.pi * f * 2.01 * k) + .08 * np.sin(2 * np.pi * f * 3.98 * k)) * env(n, .004, d)
put(mallet(392.0), 3.95, -.3, .16); put(mallet(523.3), 4.25, .3, .14)
# tag ticks
def tick():
    n = int(SR * .06); return bp(rng.standard_normal(n), 2500, 6000) * env(n, .0005, .008)
for a, p in ((4.25, -.3), (4.55, .25), (10.75, .2), (11.05, -.3)): put(tick(), a, p, .25)
# lift: rising band of air (5.9 → 6.9)
def swish(dur, f0, f1, g_shape):
    n = int(SR * dur); x = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    fs = np.geomspace(f0, f1, n // blk + 1)
    for j in range(0, n, blk):
        seg = x[max(0, j - 2048):j + blk]; y = bp(seg, fs[j // blk] * .6, fs[j // blk] * 1.5)
        out[j:j + blk] = y[-len(out[j:j + blk]):]
    k = np.linspace(0, 1, n); return out * g_shape(k)
put(swish(1.2, 300, 1400, lambda k: np.sin(np.pi * k) ** 1.5), 5.8, -.2, .35)
# flight: long soft swish travelling left → right (6.4 → 10.2)
fl = swish(3.9, 900, 380, lambda k: np.sin(np.pi * k) ** 2)
n = len(fl); pan = np.linspace(-.5, .5, n); i0 = int(6.4 * SR)
L[i0:i0 + n] += fl * .3 * np.sqrt(.5 * (1 - pan)); R[i0:i0 + n] += fl * .3 * np.sqrt(.5 * (1 + pan))
# landing: low thud + clay knock + a small second bounce
def thud(f=62, d=.22):
    n = int(SR * .9); k = np.arange(n) / SR; fr = f * (1 + .6 * np.exp(-k / .03))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, .002, d)
put(thud(), 10.33, .1, .6); put(tap(300, .07), 10.33, .1, .35); put(tap(380, .04), 10.52, .1, .12)
# ×14: warm chord (C–E–G–C), slow bloom
ch = sum(mallet(f, 2.2) * w for f, w in ((261.6, .5), (329.6, .4), (392.0, .35), (523.3, .25)))
put(ch, 11.72, 0, .16)
# master: soft limiter, normalise peak to −3 dBFS
st = np.stack([L, R], 1); st = np.tanh(st * 1.3) / 1.3
st *= 10 ** (-3 / 20) / np.abs(st).max()
from scipy.io import wavfile
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
wavfile.write(os.path.join(D, 'out/sound.wav'), SR, (st * 32767).astype(np.int16))
print('sound ok', T, 's')
