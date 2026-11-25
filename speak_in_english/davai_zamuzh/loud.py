# Loudness helpers (ITU-R BS.1770 K-weighting). voiced_lufs(): loudness of the voiced part of a short line
# (50 ms frames, gated to frames within 20 dB of the loudest frame) so short lines and pauses are measured fairly.
import numpy as np
from scipy.signal import lfilter
def _biquads(sr):
    # pre-filter (high shelf +4 dB @ 1.5 kHz) and RLB high-pass @ 38 Hz, as in BS.1770 / pyloudnorm
    G, Q, fc = 3.99984385397, .7071752369554193, 1681.9744509555319
    A = 10 ** (G / 40); w0 = 2 * np.pi * fc / sr; al = np.sin(w0) / (2 * Q)
    b1 = [A * ((A + 1) + (A - 1) * np.cos(w0) + 2 * np.sqrt(A) * al), -2 * A * ((A - 1) + (A + 1) * np.cos(w0)), A * ((A + 1) + (A - 1) * np.cos(w0) - 2 * np.sqrt(A) * al)]
    a1 = [(A + 1) - (A - 1) * np.cos(w0) + 2 * np.sqrt(A) * al, 2 * ((A - 1) - (A + 1) * np.cos(w0)), (A + 1) - (A - 1) * np.cos(w0) - 2 * np.sqrt(A) * al]
    Q2, fc2 = .5003270373253953, 38.13547087613982; w0 = 2 * np.pi * fc2 / sr; al = np.sin(w0) / (2 * Q2)
    b2 = [(1 + np.cos(w0)) / 2, -(1 + np.cos(w0)), (1 + np.cos(w0)) / 2]; a2 = [1 + al, -2 * np.cos(w0), 1 - al]
    return (np.array(b1) / a1[0], np.array(a1) / a1[0]), (np.array(b2) / a2[0], np.array(a2) / a2[0])
def kweight(x, sr):
    (b1, a1), (b2, a2) = _biquads(sr); return lfilter(b2, a2, lfilter(b1, a1, x))
def voiced_lufs(x, sr, gate=12.):
    y = kweight(np.asarray(x, float), sr); n = int(.05 * sr); m = len(y) // n
    if m == 0: return -70.
    ms = (y[:m * n].reshape(m, n) ** 2).mean(1); db = 10 * np.log10(ms + 1e-12); keep = db > max(db.max() - gate, -70)
    return float(-.691 + 10 * np.log10(ms[keep].mean() + 1e-12))
def integrated_lufs(x, sr):   # gated integrated loudness (400 ms blocks, 75 % overlap, -70 abs / -10 rel gates)
    y = kweight(np.asarray(x, float), sr); n = int(.4 * sr); h = n // 4
    ms = np.array([(y[i:i + n] ** 2).mean() for i in range(0, max(1, len(y) - n), h)]); l = -.691 + 10 * np.log10(ms + 1e-12)
    ms = ms[l > -70]; rel = -.691 + 10 * np.log10(ms.mean()) - 10; l = -.691 + 10 * np.log10(ms + 1e-12); return float(-.691 + 10 * np.log10(ms[l > rel].mean()))
def to_lufs(x, sr, target): return x * 10 ** ((target - voiced_lufs(x, sr)) / 20)
