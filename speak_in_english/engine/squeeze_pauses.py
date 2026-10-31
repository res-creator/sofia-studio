"""python3 squeeze_pauses.py <ep> <max_gap_s> id[,id...] [tail_s]  -> shortens inner silences longer than max_gap (no new ElevenLabs calls) and trims the dead tail."""
import sys, numpy as np, soundfile as sf
ep, mg, ids = sys.argv[1], float(sys.argv[2]), sys.argv[3].split(","); tail = float(sys.argv[4]) if len(sys.argv) > 4 else 0.18
for lid in ids:
    f = f"eps/{ep}/vo/{lid}.wav"; x, sr = sf.read(f); hop = sr // 100
    e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]); q = e < e.max() * 0.03
    keep = np.ones(len(x), bool); i = 0; saved = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if 0 < i and j < len(q) and (j - i) / 100 > mg:   # inner silence only
                a = i * hop + int(mg * sr / 2); b = j * hop - int(mg * sr / 2); keep[a:b] = False; saved += (b - a) / sr
            i = j
        else: i += 1
    y = x[keep]; env = np.abs(y); nz = np.where(env > env.max() * 0.03)[0]; end = min(len(y), nz[-1] + int(tail * sr)); y = y[:end]
    y = y.copy(); n = int(0.03 * sr); y[-n:] *= np.linspace(1, 0, n)
    sf.write(f, y.astype(np.float32), sr); print(lid, round(len(x) / sr, 2), "->", round(len(y) / sr, 2))
