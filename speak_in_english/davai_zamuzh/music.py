# Original light TV-dating-show bed, synthesised in code (no samples, no copyrighted material).
# 104 BPM, C major, 16-bar form: FM electric piano comping, Karplus-Strong plucked-guitar arpeggios, warm bass,
# soft kick, brushed snare swishes on 2 and 4, shaker eighths, convolution reverb.  bed(seconds) -> mono float array at 44.1 kHz.
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 44100; BPM = 104; BEAT = 60 / BPM; BAR = 4 * BEAT
rng = np.random.default_rng(104)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
# chords as MIDI notes (root for the bass + voicing for the keys)
CH = {'C': (48, [60, 64, 67, 71]), 'Am': (45, [60, 64, 67, 69]), 'Dm': (50, [60, 65, 69, 72]), 'G': (43, [59, 62, 65, 67]),
      'F': (41, [60, 64, 65, 69]), 'Em': (40, [59, 62, 64, 67]), 'Gs': (43, [60, 62, 67, 69])}
FORM = ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'Dm', 'Gs', 'F', 'Em', 'Dm', 'G', 'F', 'Em', 'Dm', 'Gs']
def ep(f, d, v):   # FM electric piano: 1:1 body + 14:1 tine, decaying index
    n = int((d + .9) * SR); t = np.arange(n) / SR; I = 1.6 * np.exp(-t * 3.2) + .25
    mod = np.sin(2 * np.pi * f * t); tine = .22 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t * 28)
    car = np.sin(2 * np.pi * f * t + I * mod) + tine
    env = np.minimum(1, t / .004) * np.exp(-t * 1.1) * np.where(t < d, 1, np.exp(-(t - d) * 9))
    return car * env * v
def pluck(f, d, v):   # Karplus-Strong, block-vectorised
    N = max(2, int(round(SR / f))); n = int((d + .6) * SR); y = np.zeros(n + N + 2); y[1:N + 1] = bp(rng.uniform(-1, 1, N + 64), 300, 5000)[64:64 + N]; n += 1
    k = .996 ** (220 / f)
    for s in range(N + 1, n, N):
        e = min(s + N, n); y[s:e] = k * .5 * (y[s - N:e - N] + y[s - N - 1:e - N - 1])
    y = y[1:n]; n -= 1; t = np.arange(n) / SR; y *= np.where(t < d, 1, np.exp(-(t - d) * 12)); return lp(y, 3500) * v
def bass(f, d, v):
    n = int((d + .2) * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)
    env = np.minimum(1, t / .01) * np.exp(-t * 1.6) * np.where(t < d, 1, np.exp(-(t - d) * 25)); return lp(np.tanh(x * env * 1.4), 600) * v
def kick(v):
    n = int(.35 * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(50 + 60 * np.exp(-t * 30)) / SR; return np.sin(ph) * np.exp(-t * 9) * v
def brush(v):   # brushed snare swish
    n = int(.32 * SR); t = np.arange(n) / SR; return bp(rng.standard_normal(n), 900, 7000) * np.minimum(1, t / .025) * np.exp(-t * 11) * v
def shaker(v):
    n = int(.07 * SR); t = np.arange(n) / SR; return hp(rng.standard_normal(n), 5500) * np.minimum(1, t / .01) * np.exp(-t * 60) * v
def add(out, at, x):
    i = int(at * SR); e = min(len(out), i + len(x)); out[i:e] += x[:e - i]
def bed(seconds):
    bars = int(np.ceil(seconds / BAR)) + 1; n = int(bars * BAR * SR) + SR; keys = np.zeros(n); gtr = np.zeros(n); bs = np.zeros(n); dr = np.zeros(n)
    for b in range(bars):
        name = FORM[b % len(FORM)]; root, voi = CH[name]; t0 = b * BAR; sec = (b // len(FORM)) % 2
        for hit, dur, v in ((0, 1.4, .32), (1.5, .45, .2), (2.5, 1.3, .26)):   # gentle syncopated comping
            for m in voi: add(keys, t0 + hit * BEAT + rng.uniform(0, .012), ep(mf(m), dur * BEAT, v * rng.uniform(.9, 1.05)))
        arp = [voi[0] + 12, voi[1] + 12, voi[2] + 12, voi[3] + 12, voi[2] + 12, voi[1] + 12, voi[2] + 12, voi[3] + 12]
        for k, m in enumerate(arp):   # plucked-guitar eighths (softer in the first pass of the form)
            add(gtr, t0 + k * BEAT / 2, pluck(mf(m), BEAT * .9, (.16 if sec else .11) * (1.15 if k % 2 == 0 else .9)))
        for at, m, d in ((0, root, 1.4), (2, root + 7, .9), (3.5, root + (2 if b % 2 else -1), .45)):
            add(bs, t0 + at * BEAT, bass(mf(m), d * BEAT, .3))
        for k in range(4):
            if k in (0, 2): add(dr, t0 + k * BEAT, kick(.22))
            if k in (1, 3): add(dr, t0 + k * BEAT, brush(.22))
        for k in range(8): add(dr, t0 + k * BEAT / 2 + .006, shaker(.07 if k % 2 else .045))
    dry = keys * .8 + gtr * 1.2 + bs + dr
    ir_n = int(1.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 3.6); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    wet = fftconvolve(keys * .8 + gtr * 1.2 + dr * .5, ir)[:n] * .35
    out = hp(dry + wet, 45); out = out[:int(seconds * SR)]; out /= np.abs(out).max() + 1e-9
    f = int(1.0 * SR); out[:f] *= np.linspace(0, 1, f); return out
if __name__ == '__main__':
    import soundfile as sf, sys
    sf.write(sys.argv[1] if len(sys.argv) > 1 else 'out/music_test.wav', bed(30) * .8, SR)
