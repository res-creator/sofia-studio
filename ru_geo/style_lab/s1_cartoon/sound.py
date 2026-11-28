# Generated sound design (numpy only): ambient bed, soft pops, whooshes, landing thump, rising plucks, a closing chime.
import numpy as np, wave
SR = 48000; T = 14.0; N = int(SR * T); out = np.zeros((N, 2))
rng = np.random.default_rng(7)
def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); sig = sig[:max(0, N - i)]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    out[i:i + len(sig), 0] += sig * gain * l; out[i:i + len(sig), 1] += sig * gain * r
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, k):  # one-pole low-pass
    y = np.zeros_like(x); acc = 0.0
    a = k
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
def pop(f=520, dur=.18, drop=.55):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f * (1 + drop * np.exp(-t / .02)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * env(n, .002, .045)
def pluck(f, dur=.5):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)) * env(n, .003, .12)
def whoosh(dur, peak=.5, bright=.08):
    n = int(dur * SR); x = rng.standard_normal(n); t = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2 * np.exp(-((t / dur - peak) ** 2) * 3)
    k = bright * (0.3 + e)  # filter opens with the swell
    y = np.zeros(n); acc = 0
    for i in range(n): acc += k[i] * (x[i] - acc); y[i] = acc
    return y * e * 3
def thump():
    n = int(.6 * SR); t = np.arange(n) / SR
    f = 55 + 70 * np.exp(-t / .03); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .14)
    return s + .25 * lp(rng.standard_normal(n), .05) * env(n, .001, .05)
# ambient bed: soft chord (D maj9-ish) with slow swell + filtered air
t = np.arange(N) / SR
bed = sum(np.sin(2 * np.pi * f * t + p) * a for f, a, p in [(146.83, .5, 0), (220, .35, 1), (277.18, .25, 2), (329.63, .22, 3), (440, .12, 4)])
bed *= (0.6 + 0.4 * np.sin(2 * np.pi * t / 7)) * np.minimum(1, t / 1.5) * np.minimum(1, (T - t) / 1.2)
air = lp(rng.standard_normal(N), .02) * 1.2
out[:, 0] += bed * .035 + air * .05; out[:, 1] += bed * .035 + lp(rng.standard_normal(N), .02) * 1.2 * .05
# events
add(whoosh(.9, .4), 0.0, .25)
for i, tt in enumerate(np.linspace(.4, 1.45, 9)): add(pop(380 + 40 * i, .16, .4), tt, .18, -0.6 + i * .15)
add(whoosh(2.1, .45, .05), 1.7, .35)
add(pop(640), 3.15, .3, -.2); add(pop(560), 3.35, .3, .2)
add(pluck(880, .3), 4.0, .12, -.3); add(pluck(880, .3), 4.12, .12, .2)
add(pop(300, .25, .2), 5.5, .2)
add(whoosh(2.8, .35, .06), FLY0 := 5.95, .45)
add(thump(), 8.75, .6); add(pluck(392, .8), 8.78, .12)
add(whoosh(2.6, .5, .04), 9.0, .3)
scale = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.5, 1479.98]
for i in range(13): add(pluck(scale[i], .45), 10.75 + i * .11, .16, -.5 + i / 13)
for f in [587.33, 739.99, 880, 1174.66]: add(pluck(f, 2.2) * 1.0, 12.25, .12)
add(pop(700), 11.2, .22, -.4); add(pop(760), 11.4, .22, .4); add(pop(820, .14), 12.5, .15, -.4); add(pop(860, .14), 12.65, .15, .4)
# gentle limiter + normalize
out = np.tanh(out * 1.4); out /= np.max(np.abs(out)) / 0.7
w = wave.open('raw/sound.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close(); print('ok')
