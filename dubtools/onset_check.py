#!/usr/bin/env python3
"""ONSET CHECK (from the kit): finds takes whose first words sound muffled vs the rest of the take.
python3 onset_check.py [DIR]   (default voice/). severity >= 6 -> regenerate with a lead-in."""
import os, sys, glob, subprocess
import numpy as np
SR = 48000; D = sys.argv[1] if len(sys.argv) > 1 else "voice"; THR = 6.0
def load(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64)
def dull_profile(x, first=1.5, body_from=2.0):
    n = 2048; hop = 512; w = np.hanning(n); idx = np.arange(0, len(x) - n, hop)
    if len(idx) < 20: return None
    F = np.stack([x[j:j + n] * w for j in idx]); S = np.abs(np.fft.rfft(F, axis=1)) ** 2; f = np.fft.rfftfreq(n, 1 / SR)
    db = 10 * np.log10(S.sum(1) + 1e-12); v = db > db.max() - 25
    lo = S[:, (f > 100) & (f < 1000)].sum(1); mid = S[:, (f >= 1000) & (f < 4000)].sum(1); hi = S[:, (f >= 4000) & (f < 10000)].sum(1)
    vow = v & (lo / (S.sum(1) + 1e-12) > 0.5); t = idx / SR; t0 = t[v][0]
    A = vow & (t >= t0) & (t < t0 + first); B = vow & (t >= t0 + body_from)
    if A.sum() < 4 or B.sum() < 10: return None
    r = lambda m, band: 10 * np.log10(band[m].sum() / lo[m].sum())
    air, pres = r(A, hi) - r(B, hi), r(A, mid) - r(B, mid)
    return dict(air_db=round(float(air), 2), pres_db=round(float(pres), 2), sev=round(float(max(0, -air) + 0.5 * max(0, -pres)), 2))
res = {}
for p in sorted(glob.glob(os.path.join(D, "*.wav")) + glob.glob(os.path.join(D, "*.mp3"))):
    m = dull_profile(load(p))
    if m: res[os.path.splitext(os.path.basename(p))[0]] = m
if not res: sys.exit("no takes found in %s/" % D)
for i, m in sorted(res.items(), key=lambda kv: -kv[1]["sev"])[:15]: print(i, m)
bad = [i for i, m in res.items() if m["sev"] >= THR]
v = np.array([m["sev"] for m in res.values()]); print("severity median %.2f, p90 %.2f; checked %d takes" % (np.median(v), np.percentile(v, 90), len(res)))
print("REGENERATE WITH LEAD-IN:", " ".join(bad) if bad else "none")
