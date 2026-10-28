"""python3 detective_fit.py <ep> -> tightens the generated voice files to the episode's pace (no new generation).
Originals are kept once in eps/<ep>/vo/raw/ (wav + words.json); the working files in vo/ are rebuilt from them each run:
  * trailing silence -> 0.12 s, pauses inside a line longer than PMAX -> PMAX (dramatic "…" beats keep PMAX);
  * English character lines are time-stretched by TEMPO (ffmpeg atempo: faster, same pitch — no pitch shifting);
  * the narrator is left as generated;
  * clue_e (the detective remembers the cleaner) = cl_c2 up to "Exactly", band-passed, with a short echo.
Word timings are mapped through every edit, so bubbles and subtitles stay in sync."""
import json, os, shutil, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from episodes_v2 import EP
SR = 48000; TEMPO = 1.07; PMAX = 0.42; TAIL = 0.12
ep = sys.argv[1]; vo = f"eps/{ep}/vo"; raw = f"{vo}/raw"; os.makedirs(raw, exist_ok=True)
L = {l[0]: l for l in EP[ep]["lines"]}

def silences(x):
    h = SR // 100; e = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)]); q = e < 0.02 * e.max()
    runs, s = [], None
    for i, v in enumerate(list(q) + [False]):
        if v and s is None: s = i
        if not v and s is not None: runs.append((s * h, i * h)); s = None
    return runs, len(q) * h

def fit(x, words, tempo):
    runs, n = silences(x); keep, cur = [], 0
    for a, b in runs:
        if a == 0: continue                                   # leading silence: already trimmed at generation
        lim = TAIL if b >= n - SR // 100 else PMAX
        if (b - a) / SR > lim: keep.append((cur, a + int(lim * SR / 2))); cur = b - int(lim * SR / 2)
    keep.append((cur, len(x)))
    if runs and runs[-1][1] >= n - SR // 100 and (len(x) - runs[-1][0]) / SR > TAIL: keep[-1] = (keep[-1][0], runs[-1][0] + int(TAIL * SR))
    y = np.concatenate([x[a:b] for a, b in keep])
    def tmap(t):   # source time -> output time (before tempo)
        s, out = int(t * SR), 0
        for a, b in keep:
            if s < a: return out / SR
            if s <= b: return (out + s - a) / SR
            out += b - a
        return out / SR
    w = [[t, tmap(a), tmap(b)] for t, a, b in words]
    if tempo != 1.0:
        r = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={tempo}", "-f", "f32le", "-"], input=y.astype(np.float32).tobytes(), capture_output=True).stdout
        y = np.frombuffer(r, np.float32).copy(); w = [[t, a / tempo, b / tempo] for t, a, b in w]
    d = len(y) / SR
    return y, [[t, round(min(a, d), 3), round(min(b, d), 3)] for t, a, b in w]

for lid, who, *_ in EP[ep]["lines"]:
    if lid == "clue_e": continue
    for ext in (".wav", ".words.json"):
        if not os.path.exists(f"{raw}/{lid}{ext}"): shutil.copy(f"{vo}/{lid}{ext}", f"{raw}/{lid}{ext}")
    x, _ = sf.read(f"{raw}/{lid}.wav"); words = json.load(open(f"{raw}/{lid}.words.json"))
    y, w = fit(x, words, 1.0 if who == "nar" else TEMPO)
    sf.write(f"{vo}/{lid}.wav", y.astype(np.float32), SR); json.dump(w, open(f"{vo}/{lid}.words.json", "w"), ensure_ascii=False)
    print(lid.ljust(8), round(len(x) / SR, 2), "->", round(len(y) / SR, 2))

# clue_e from the fitted cl_c2: up to "Exactly", memory colouring + echo
x, _ = sf.read(f"{vo}/cl_c2.wav"); w = json.load(open(f"{vo}/cl_c2.words.json"))
cut = next(a for t, a, b in w if t.lower().startswith("exactly")); x = x[:int((cut - 0.06) * SR)]
x = x * np.minimum(1, (len(x) - np.arange(len(x))) / (0.05 * SR))
x = sosfilt(butter(2, [300, 3800], btype="band", fs=SR, output="sos"), x)
y = np.zeros(len(x) + int(0.45 * SR))
for dl, g in [(0, 1.0), (0.15, 0.4), (0.3, 0.18)]: i = int(dl * SR); y[i:i + len(x)] += x * g
y = y / np.abs(y).max() * 0.75; sf.write(f"{vo}/clue_e.wav", y.astype(np.float32), SR)
json.dump([q for q in w if q[1] < cut - 0.06], open(f"{vo}/clue_e.words.json", "w"), ensure_ascii=False)
L2 = EP[ep]["lines"]; print("clue_e", round(len(y) / SR, 2))
