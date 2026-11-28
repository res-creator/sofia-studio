"""Subtle sound design for s2_documentary, all synthesised here (numpy): python3 -I tools/sound.py out.wav
ambient bed (low pad + air), a whoosh on the double exposure, a pen-scratch as the outlines draw, a paper lift, the long
glide south, a soft landing thud, one quiet bell on «×14»."""
import sys, wave
import numpy as np
from scipy import signal
SR, DUR = 48000, 14.0
n = int(SR * DUR); t = np.arange(n) / SR; rng = np.random.default_rng(3)
def env(a, b, c, d):   # trapezoid: rise a->b, hold, fall c->d (s), raised-cosine edges
    e = np.zeros(n); e[(t >= b) & (t <= c)] = 1
    r = (t > a) & (t < b); e[r] = .5 - .5 * np.cos(np.pi * (t[r] - a) / (b - a))
    f = (t > c) & (t < d); e[f] = .5 + .5 * np.cos(np.pi * (t[f] - c) / (d - c))
    return e
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x)
noise = lambda: rng.standard_normal(n)
L = np.zeros(n); Rr = np.zeros(n)
# bed: a low open fifth with slow beating, and filtered air
pad = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(55, .5, 0), (55.3, .4, 1), (82.4, .28, 2), (110.2, .18, .5), (164.8, .06, 1.3)])
pad *= .5 + .5 * np.sin(2 * np.pi * t / 7.0) ** 2
air = lp(noise(), 900) * .35
bed = (pad * .09 + air * .05) * env(0, 1.5, DUR - 1.2, DUR)
L += bed; Rr += bed
# whoosh: the plate dissolves into the satellite map
w = bp(noise(), 300, 2500) * env(1.9, 2.8, 2.9, 3.7) * .10
L += w * .8; Rr += w
# pen scratch while the graticule and outlines draw
s = bp(noise(), 2500, 7000) * (1 + .6 * np.sin(2 * np.pi * 13 * t)) * (env(2.7, 3.0, 4.0, 4.6) * .3 + env(4.0, 4.3, 5.7, 6.1)) * .018
L += s; Rr += s * .7
# paper lift
lift = bp(noise(), 600, 4000) * env(7.5, 7.7, 7.8, 8.3) * .05
L += lift; Rr += lift
# the glide south: a long whoosh whose band slides down
g = np.zeros(n); x = noise(); seg = (t > 7.9) & (t < 11.5)
for k, (lo, hi) in enumerate([(1400, 4200), (900, 2800), (500, 1800), (300, 1100)]):
    g += bp(x, lo, hi) * env(7.9 + k * .75, 8.6 + k * .75, 8.8 + k * .75, 9.8 + k * .75)
g *= .055
L += g * np.clip(1.2 - (t - 8) / 4, .4, 1.2); Rr += g * np.clip((t - 8) / 3, .4, 1.2)
# landing: soft thud + paper tap
tt = t - 11.35; m = tt > 0
thud = np.zeros(n); thud[m] = np.sin(2 * np.pi * 62 * tt[m] * (1 - .15 * np.minimum(tt[m], .4))) * np.exp(-tt[m] * 7) * .22
tap = np.zeros(n); tap[m] = bp(noise(), 1500, 6000)[m] * np.exp(-tt[m] * 40) * .05
L += thud + tap; Rr += thud + tap
# «×14»: one quiet bell
tb = t - 12.6; m = tb > 0; bell = np.zeros(n)
for f, a, d in [(440, .5, 2.2), (659.3, .22, 1.6), (880.7, .12, 1.0), (1318.5, .05, .6)]:
    bell[m] += a * np.sin(2 * np.pi * f * tb[m]) * np.exp(-tb[m] * d)
bell *= .045 * np.minimum(1, tb.clip(0) * 200)
L += bell; Rr += bell * .9
out = np.stack([L, Rr], 1)
out *= env(0, .05, DUR - .4, DUR)[:, None]
out *= 10 ** (-6 / 20) / np.abs(out).max()
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((out * 32767).astype('<i2').tobytes())
print('sound ok')
