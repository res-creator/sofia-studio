"""python3 short/snr.py <dir-with-timeline+stems>  -> speech-to-(music+effects) ratio inside speech spans (dB): median / 10th percentile, and the quietest-line level"""
import json, sys
import numpy as np, soundfile as sf
D = sys.argv[1]; TL = json.load(open(f"{D}/timeline.json")); SR = 48000
v, _ = sf.read(f"{D}/stem_voice.wav"); m, _ = sf.read(f"{D}/stem_music.wav"); f, _ = sf.read(f"{D}/stem_fx.wav"); o = m + f
rows = []
for s in TL["speech"]:
    a, b = int(s["t"] * SR), int((s["t"] + s["d"]) * SR); sv = v[a:b]; so = o[a:b]
    if len(sv) < SR // 4: continue
    rows.append((10 * np.log10(np.mean(sv ** 2) / (np.mean(so ** 2) + 1e-12) + 1e-12), 10 * np.log10(np.mean(sv ** 2) + 1e-12), s["id"]))
r = np.array([x[0] for x in rows]); lv = np.array([x[1] for x in rows])
print(f"{D}: speech-to-music+fx median {np.median(r):.1f} dB, p10 {np.percentile(r, 10):.1f} dB, worst {r.min():.1f} dB ({rows[int(r.argmin())][2]}); line level spread (p90-p10) {np.percentile(lv, 90) - np.percentile(lv, 10):.1f} dB")
