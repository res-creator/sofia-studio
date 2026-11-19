"""python3 tts.py <workdir>  -> <workdir>/vo/*.wav + durations.json   (ElevenLabs; key injected by the environment/proxy, never written here)
One request at a time, 3 s apart (owner's rule: at most 2 concurrent)."""
import json, os, sys, time, subprocess, urllib.request
S = json.load(open(os.path.join(os.path.dirname(__file__), "script.json")))
wd = sys.argv[1]; od = f"{wd}/vo"; os.makedirs(od, exist_ok=True)
hdr = {"Content-Type": "application/json", "Accept": "audio/mpeg"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
jobs = [("intro", "nar", S["intro"])]
for i, q in enumerate(S["questions"]):
    jobs += [(f"q{i}_ru", "nar", q["ru"] + "."), (f"q{i}_uk", "uk", q["uk"]), (f"q{i}_us", "us", q["us"])]
jobs.append(("outro", "nar", S["outro"]))
dur = json.load(open(f"{wd}/durations.json")) if os.path.exists(f"{wd}/durations.json") else {}
for lid, who, text in jobs:
    if os.path.exists(f"{od}/{lid}.wav") and lid in dur: continue
    v = S["voices"][who]; body = {"text": text, "model_id": v["model"]}
    if who == "nar": body["voice_settings"] = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['id']}?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers=hdr)
    mp3 = urllib.request.urlopen(req, timeout=120).read()
    open(f"{od}/{lid}.mp3", "wb").write(mp3)
    # trim leading/trailing silence, normalise peak, write 48k mono wav
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{od}/{lid}.mp3", "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,volume=0dB,alimiter=limit=0.89",
        "-ac", "1", "-ar", "48000", f"{od}/{lid}.wav"], check=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{od}/{lid}.wav"], capture_output=True, text=True).stdout)
    dur[lid] = round(d, 3); json.dump(dur, open(f"{wd}/durations.json", "w"), indent=1)
    print(lid, who, round(d, 2), flush=True); time.sleep(3)
