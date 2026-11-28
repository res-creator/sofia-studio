"""Sound design for the riso clip, made from numpy noise and sines (no samples, no music library).
Printer feed + drum for each ink plate, paper slides for cut-outs, a peel, a long slide whoosh, stamp thunks with a
rising counter tick, a quiet two-note bed and a small chord on «×14». Writes raw/sound.wav (48 kHz stereo)."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR = 48000; DUR = 14.6; N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); Rch = np.zeros(N)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def add(t, x, g=1.0, pan=0.0):
    i = int(t * SR); x = x[:max(0, N - i)]
    L[i:i + len(x)] += x * g * np.sqrt(0.5 * (1 - pan)); Rch[i:i + len(x)] += x * g * np.sqrt(0.5 * (1 + pan))
def env(n, a, d):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d); return e
def noise(sec): return rng.standard_normal(int(sec * SR))

def feed(t, pan=0):            # paper feed "shhk" + drum "ka-chunk"
    n = noise(.32); e = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    add(t, bp(n, 1800, 7000) * e, .22, pan)
    k = int(.25 * SR); tt = np.arange(k) / SR
    thump = np.sin(2 * np.pi * (95 - 40 * tt / .25) * tt) * env(k, .002, .06)
    click = bp(noise(.03), 2000, 6000) * env(int(.03 * SR), .0005, .006)
    add(t + .2, thump, .55, pan); add(t + .2, click, .35, pan); add(t + .26, thump * .6, .3, -pan)
def slide(t, dur=.45, g=.18, pan=0):   # paper cut-out sliding over paper
    n = noise(dur); e = np.sin(np.linspace(0, np.pi, len(n))) ** 1.5
    add(t, bp(n, 600, 4000) * e, g, pan)
def tick(t, f=2400, g=.18, pan=0):
    k = int(.05 * SR); tt = np.arange(k) / SR
    add(t, np.sin(2 * np.pi * f * tt) * env(k, .0005, .012) + .3 * bp(noise(.05), 3000, 8000) * env(k, .0003, .004), g, pan)
def stamp(t, g=.5, pitch=1.0, pan=0):
    k = int(.35 * SR); tt = np.arange(k) / SR
    body = np.sin(2 * np.pi * (120 * pitch - 50 * tt) * tt) * env(k, .002, .07)
    slap = bp(noise(.35), 300, 2500) * env(k, .001, .02)
    add(t, body + .6 * slap, g, pan)
def tone(t, f, dur, g, a=.01, d=.5, pan=0):
    k = int(dur * SR); tt = np.arange(k) / SR
    x = (np.sin(2 * np.pi * f * tt) + .25 * np.sin(2 * np.pi * 2 * f * tt) + .08 * np.sin(2 * np.pi * 3 * f * tt)) * env(k, a, d)
    add(t, x, g, pan)

# bed: two soft low tones, slow swell (a quiet "room" under the print)
tt = np.arange(N) / SR
bed = (np.sin(2 * np.pi * 110 * tt) + .6 * np.sin(2 * np.pi * 164.8 * tt + 1) + .3 * np.sin(2 * np.pi * 220.4 * tt)) \
      * (0.5 + 0.5 * np.sin(2 * np.pi * .21 * tt)) * np.minimum(1, tt / 1.5) * np.minimum(1, (DUR - tt) / 1.2)
hum = lp(rng.standard_normal(N), 400) * .4
L += (bed * .025 + hum * .02); Rch += (bed * .025 + hum * .02)

feed(0.05, -.3); feed(0.85, 0); feed(1.30, .3)
slide(1.6, .5, .2, -.5); slide(3.0, .45, .16, -.5)
tick(3.1, 2100, .12, -.2); tick(3.22, 2500, .12, .2)
tick(3.45, 1800, .08); tick(3.6, 1800, .08)
n = noise(1.0); add(4.4, lp(n, 900) * np.sin(np.linspace(0, np.pi, len(n))) ** 2, .12)   # push in
n = noise(.4); add(5.15, bp(n, 2500, 9000) * np.linspace(0, 1, len(n)) ** 2 * (rng.random(len(n)) > .6), .35, -.2)  # peel
# long slide whoosh with a falling filter (it travels south)
n = noise(3.2); k = len(n); out = np.zeros(k); seg = SR // 20
for i in range(0, k, seg):
    u = i / k; f = 3500 - 2800 * u
    out[i:i + seg] = bp(n[i:i + seg + 400], max(200, f * .5), f)[:len(out[i:i + seg])]
add(5.55, out * np.sin(np.linspace(0, np.pi, k)) ** 1.5, .2, .0)
stamp(8.6, .8, .85); tick(8.62, 900, .15)
slide(9.15, .55, .2, .5)
for i in range(13):
    t = 9.85 + i * .19
    stamp(t, .38, 1 + i * .02, pan=(-.4 + .8 * (i % 5) / 4)); tick(t + .02, 1500 * 2 ** (i / 24), .1)
T14 = 9.85 + 12 * .19
for f, d in [(523.25, 0), (659.25, .05), (783.99, .1), (1046.5, .16)]:
    tone(T14 + .1 + d, f, 2.5, .06, .005, .9)
slide(12.3, 1.2, .06, 0)

mix = np.stack([L, Rch], 1)
mix = np.tanh(mix * 1.4) / 1.4
mix *= 0.7 / np.max(np.abs(mix))
os.makedirs('raw', exist_ok=True)
with wave.open('raw/sound.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', mix.shape)
