"""python3 tts.py <workdir> -> <workdir>/vo/<id>.wav (ElevenLabs; key injected by the proxy; one request at a time, 3 s apart)"""
import json, os, sys, time, subprocess, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(f"{D}/lines.json")); wd = sys.argv[1]; od = f"{wd}/vo"; os.makedirs(od, exist_ok=True)
hdr = {"Content-Type": "application/json", "Accept": "audio/mpeg"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
for who, lid, text in L["intro"] + L["outro"]:
    if os.path.exists(f"{od}/{lid}.wav"): continue
    v = L["voices"][who]; body = {"text": text, "model_id": v["model"]}
    if v["model"] == "eleven_multilingual_v2": body["language_code"] = "ru"
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['id']}?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers=hdr)
    try: data = urllib.request.urlopen(req, timeout=120).read()
    except urllib.error.HTTPError as e:
        if "language_code" in body: body.pop("language_code"); req = urllib.request.Request(req.full_url, data=json.dumps(body).encode(), headers=hdr); data = urllib.request.urlopen(req, timeout=120).read()
        else: raise
    open(f"{od}/{lid}.mp3", "wb").write(data)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{od}/{lid}.mp3", "-af", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse", "-ac", "1", "-ar", "48000", f"{od}/{lid}.wav"], check=True)
    print(lid, who, subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{od}/{lid}.wav"], capture_output=True, text=True).stdout.strip(), flush=True); time.sleep(3)
