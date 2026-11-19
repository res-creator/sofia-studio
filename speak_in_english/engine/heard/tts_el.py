"""python3 tts_el.py <workdir> -> <workdir>/vo/*.wav + durations.json  (ElevenLabs; key injected by the proxy, never written here)
One request at a time, 3 s apart (owner's rule). Voice = the heroine's own voice (CAST 'her')."""
import json, os, sys, time, subprocess, urllib.request
S = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json"))); wd = sys.argv[1]; od = f"{wd}/vo"; os.makedirs(od, exist_ok=True)
hdr = {"Content-Type": "application/json", "Accept": "audio/mpeg"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
V = S["voice"]; jobs = []
for i, it in enumerate(S["items"]): jobs += [(f"i{i}_fast", it["fast"]), (f"i{i}_slow", it["slow"])]
jobs.append(("outro", S["outro_voice"]))
dur = json.load(open(f"{wd}/durations.json")) if os.path.exists(f"{wd}/durations.json") else {}
for lid, text in jobs:
    if os.path.exists(f"{od}/{lid}.wav") and lid in dur: continue
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{V['id']}?output_format=mp3_44100_128", data=json.dumps({"text": text, "model_id": V["model"]}).encode(), headers=hdr)
    open(f"{od}/{lid}.mp3", "wb").write(urllib.request.urlopen(req, timeout=120).read())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{od}/{lid}.mp3", "-af", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,alimiter=limit=0.89", "-ac", "1", "-ar", "48000", f"{od}/{lid}.wav"], check=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{od}/{lid}.wav"], capture_output=True, text=True).stdout)
    dur[lid] = round(d, 3); json.dump(dur, open(f"{wd}/durations.json", "w"), indent=1); print(lid, round(d, 2), flush=True); time.sleep(3)
