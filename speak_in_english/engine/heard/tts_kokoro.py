"""python3 tts_kokoro.py <workdir> <models_dir> -> <workdir>/vo/*.wav + durations.json   (free local Kokoro voice, no API)"""
import json, os, sys, subprocess, numpy as np
from kokoro_onnx import Kokoro
S = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json")))
wd, md = sys.argv[1], sys.argv[2]; od = f"{wd}/vo"; os.makedirs(od, exist_ok=True)
kok = Kokoro(f"{md}/kokoro-v1.0.onnx", f"{md}/voices-v1.0.bin"); V = S["voice"]
jobs = []
for i, it in enumerate(S["items"]): jobs += [(f"i{i}_fast", it["fast"], V["fast"]), (f"i{i}_slow", it["slow"], V["slow"])]
jobs.append(("outro", S["outro_voice"], 0.9)); dur = {}
for lid, text, sp in jobs:
    x, sr = kok.create(text, voice=V["voice"], speed=sp, lang=V["lang"]); x = np.asarray(x, np.float32)
    thr = 0.01 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]; x = x[max(0, idx[0] - 240): idx[-1] + 1800]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    p = f"{od}/{lid}.f32"; open(p, "wb").write(x.tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", p, "-ar", "48000", f"{od}/{lid}.wav"], check=True); os.remove(p)
    dur[lid] = round(len(x) / sr, 3); print(lid, dur[lid], flush=True)
json.dump(dur, open(f"{wd}/durations.json", "w"), indent=1)
