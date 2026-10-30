"""ITU-R BS.1770 loudness helpers (K-weighting, 400 ms blocks, absolute -70 / relative -10 LU gating) for 48 kHz audio.
python3 short/loud.py <slug> [dir]  -> per-clip integrated loudness of every speech clip (to find quiet / loud outliers)"""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import lfilter

_PRE = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585])
_RLB = ([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])


def kweight(x):
    return lfilter(*_RLB, lfilter(*_PRE, x))


def lufs(x, sr=48000):
    """integrated gated loudness of a mono signal (np.float array)"""
    if x.ndim > 1: x = x.mean(1)
    y = kweight(x.astype(np.float64)); blk = int(0.4 * sr); hop = int(0.1 * sr)
    if len(y) < blk: return -70.0
    ms = np.array([np.mean(y[i:i + blk] ** 2) for i in range(0, len(y) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-12); g = ms[l > -70]
    if len(g) == 0: return -70.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10; g = ms[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(g.mean() + 1e-12))


if __name__ == "__main__":
    slug = sys.argv[1]; D = sys.argv[2] if len(sys.argv) > 2 else f"eps/{slug}"; TL = json.load(open(f"{D}/timeline.json")); rows = []
    for s in TL["speech"]:
        x, sr = sf.read(f"{D}/vo/{s['id']}.wav"); rows.append((lufs(x, sr), 20 * np.log10(np.abs(x).max() + 1e-9), s["id"], s["who"], s["text"][:40]))
    rows.sort()
    for r in rows[:8]: print("quiet  %.1f LUFS  peak %.1f  %-8s %-8s %s" % r)
    for r in rows[-4:]: print("loud   %.1f LUFS  peak %.1f  %-8s %-8s %s" % r)
    v = np.array([r[0] for r in rows]); print(slug, "clip loudness: median %.1f  min %.1f  max %.1f  spread(p90-p10) %.1f dB" % (np.median(v), v.min(), v.max(), np.percentile(v, 90) - np.percentile(v, 10)))
