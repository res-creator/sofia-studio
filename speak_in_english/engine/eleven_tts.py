"""python3 eleven_tts.py <ep> [ids...] -> eps/<ep>/vo/<id>.wav for EN lines, via ElevenLabs (natural voices).
Voice ids come from CAST[who]["el"]. The API key is injected by the environment/proxy; never write it into files.
One request at a time with a pause (owner's rule: at most 2 concurrent requests, ~3 s apart)."""
import json, os, sys, time, subprocess, urllib.request, numpy as np, soundfile as sf
from episodes_v2 import EP, CAST
SR = 48000; MODEL = os.environ.get("EL_MODEL", "eleven_v3")
ep = sys.argv[1]; only = set(sys.argv[2:]); od = f"eps/{ep}/vo"; os.makedirs(od, exist_ok=True)
hdr = {"Content-Type": "application/json", "Accept": "audio/mpeg"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
for lid, who, text, ru in EP[ep]["lines"]:
    if who == "nar" or (only and lid not in only): continue
    vid = CAST[who].get("el")
    if not vid: print("no ElevenLabs voice for", who, "- skipped", lid); continue
    body = {"text": text, "model_id": MODEL}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers=hdr)
    mp3 = urllib.request.urlopen(req, timeout=120).read()
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "-", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=mp3, capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    thr = 0.01 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]
    x = x[max(0, idx[0] - 960): idx[-1] + 7200]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    sf.write(f"{od}/{lid}.wav", x.astype(np.float32), SR); print(ep, lid, who, round(len(x) / SR, 2)); time.sleep(3)
