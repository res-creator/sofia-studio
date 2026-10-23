"""python3 tts_v2.py gym|lift  -> eps/<ep>/vo/<id>.wav (EN lines via Kokoro)"""
import os, sys, numpy as np, soundfile as sf, librosa
from kokoro_onnx import Kokoro
from scipy.signal import resample_poly
from episodes_v2 import EP, CAST
M = "models"; SR = 48000
kok = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
only = set(sys.argv[2:])
for ep in sys.argv[1].split(","):
    od = f"eps/{ep}/vo"; os.makedirs(od, exist_ok=True)
    for lid, who, text, ru in EP[ep]["lines"]:
        if who == "nar" or (only and lid not in only): continue
        c = CAST[who]; text = EP[ep].get("say", {}).get(lid, text)   # optional TTS-only wording
        x, sr = kok.create(text, voice=c["voice"], speed=c["speed"], lang=c["lang"])
        x = resample_poly(x, SR, sr).astype(np.float32)
        # NO artificial pitch shifting: it makes voices robotic. Pick a naturally suited Kokoro voice instead.
        thr = 0.004 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]
        x = x[max(0, idx[0] - 960): idx[-1] + 7200]; x = x / (np.abs(x).max() + 1e-9) * 0.89
        sf.write(f"{od}/{lid}.wav", x.astype(np.float32), SR); print(ep, lid, who, round(len(x) / SR, 2))
