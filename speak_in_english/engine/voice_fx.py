"""python3 voice_fx.py <ep> -> colours voice files of characters with an "fx" in CAST (episodes_v2.py).
The dry take is kept as vo/<id>.dry.wav, so the script can be re-run safely.
  smart_speaker      - small-speaker band, light saturation, short plastic box resonance (Homey)
  muffled_recording  - phone-mic recording of the 03:14 order: muffled, room + party noise, hearing-aid whistle.
                       c1_* lines are the court's slowed playback (x0.65, pitch drops like a slowed tape)."""
import os, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
from episodes_v2 import EP, CAST
ep = sys.argv[1]; VO = f"eps/{ep}/vo"; rng = np.random.default_rng(7)
def band(x, sr, lo, hi, order=4): return sosfilt(butter(order, [lo, hi], btype="band", fs=sr, output="sos"), x)
def room(x, sr, ms, amt):
    n = int(sr * ms / 1000); ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n)); ir[0] = 1 / amt
    y = np.convolve(x, ir * amt)[: len(x) + n]; return y
def smart_speaker(x, sr):
    y = band(x, sr, 220, 6500); y = np.tanh(y * 2.2) / np.tanh(2.2); y = room(y, sr, 35, 0.08)
    return y
def muffled(x, sr, lid):
    if lid.startswith("c1_"): x = resample_poly(x, 100, 65)          # slowed playback: longer and lower
    y = band(x, sr, 300, 2400, 3); y = room(y, sr, 260, 0.05)
    t = np.arange(len(y)) / sr
    party = band(rng.standard_normal(len(y)), sr, 150, 1800, 2) * 0.05 + np.sin(2 * np.pi * 55 * t) * 0.06 * (np.mod(t, 0.5) < 0.08)
    y = y + party
    w0 = len(y) / sr - (1.4 if lid.startswith("c1_") else 1.0)       # the whistle (C1 event: 1.4 s before the end)
    env = np.clip((t - w0) / 0.08, 0, 1) * np.clip((w0 + 0.9 - t) / 0.2, 0, 1)
    y = y + np.sin(2 * np.pi * 3150 * t + 3 * np.sin(2 * np.pi * 6 * t)) * env * (0.10 if lid.startswith("c1_") else 0.05)
    return y
for lid, who, text, ru in EP[ep]["lines"]:
    fx = CAST.get(who, {}).get("fx")
    if not fx: continue
    p, dry = f"{VO}/{lid}.wav", f"{VO}/{lid}.dry.wav"
    if not os.path.exists(dry):
        if not os.path.exists(p): print("missing", p); continue
        os.rename(p, dry)
    x, sr = sf.read(dry)
    y = smart_speaker(x, sr) if fx == "smart_speaker" else muffled(x, sr, lid)
    y = y / (np.abs(y).max() + 1e-9) * 0.89
    sf.write(p, y.astype(np.float32), sr); print(ep, lid, fx, round(len(y) / sr, 2))
