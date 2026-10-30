"""python3 pingpong_ru.py -> eps/pingpong/vo/<id>.wav for the Russian host lines (who == 'nar'): the channel narrator Sarah, eleven_multilingual_v2 (same voice/settings as eleven_nar.py).
The key is injected by the environment/proxy; one request at a time, ~3 s apart. Existing files are kept."""
import json, os, sys, time, subprocess, urllib.request, numpy as np, soundfile as sf
from episodes_v2 import EP
SR = 48000; od = "eps/pingpong/vo"; os.makedirs(od, exist_ok=True)
hdr = {"Content-Type": "application/json", "Accept": "audio/mpeg"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
for lid, who, text, ru in EP["pingpong"]["lines"]:
    if who != "nar" or os.path.exists(f"{od}/{lid}.wav"): continue
    body = {"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True}}
    req = urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers=hdr)
    mp3 = urllib.request.urlopen(req, timeout=120).read()
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "-", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=mp3, capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).copy(); idx = np.where(np.abs(x) > 0.01 * np.abs(x).max())[0]
    x = x[max(0, idx[0] - 960): idx[-1] + 7200]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    sf.write(f"{od}/{lid}.wav", x.astype(np.float32), SR); print(lid, round(len(x) / SR, 2)); time.sleep(3)
