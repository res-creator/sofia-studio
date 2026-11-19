"""python3 tts_kokoro.py <workdir> <models_dir> -> <workdir>/vo/*.wav + durations.json   (free local Kokoro voices, no API)"""
import json, os, sys, subprocess, numpy as np
from kokoro_onnx import Kokoro
S = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json")))
wd, md = sys.argv[1], sys.argv[2]; od = f"{wd}/vo"; os.makedirs(od, exist_ok=True)
kok = Kokoro(f"{md}/kokoro-v1.0.onnx", f"{md}/voices-v1.0.bin")
jobs = [("intro", "a", S["intro"])]
for i, it in enumerate(S["items"]): jobs += [(f"i{i}_lit", "a", it["lit"]), (f"i{i}_what", "b", "Sorry, what?"), (f"i{i}_real", "b", it["real"])]
jobs.append(("outro", "b", S["outro"])); dur = {}
for lid, who, text in jobs:
    v = S["voices"][who]; x, sr = kok.create(text, voice=v["voice"], speed=v["speed"], lang=v["lang"])
    x = np.asarray(x, np.float32); thr = 0.01 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]
    x = x[max(0, idx[0] - 240): idx[-1] + 1800]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    p = f"{od}/{lid}.f32"; open(p, "wb").write(x.tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", p, "-ar", "48000", f"{od}/{lid}.wav"], check=True); os.remove(p)
    dur[lid] = round(len(x) / sr, 3); print(lid, who, dur[lid], flush=True)
json.dump(dur, open(f"{wd}/durations.json", "w"), indent=1)
