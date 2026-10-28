"""python3 detective_tts.py <ep> [ids...] -> eps/<ep>/vo/<id>.wav + <id>.words.json via ElevenLabs /with-timestamps.
English lines: CAST[who]["el"] on eleven_v3 (delivery tags in [brackets] are spoken as tone, not as words).
The narrator ('nar'): Sarah on eleven_multilingual_v2 (the channel's narrator settings).
Word timings come from the API alignment (no Whisper needed); they are shifted by the silence trim.
Never regenerates a file that exists (owner's rule: don't re-spend credits on good takes); delete a wav to redo it.
One request at a time, ~3 s apart. The API key is injected by the environment/proxy; never write it into files."""
import base64, json, os, re, subprocess, sys, time, urllib.request
import numpy as np, soundfile as sf
from episodes_v2 import EP, CAST
SR = 48000
NAR = dict(el="EXAVITQu4vr4xnSDxMaL", model="eleven_multilingual_v2", settings=dict(stability=0.5, similarity_boost=0.75, style=0.0, use_speaker_boost=True, speed=1.05))
SKIP = {"clue_e"}   # echo of cl_c2, made from that file at the sound stage
ep = sys.argv[1]; only = set(sys.argv[2:]); od = f"eps/{ep}/vo"; os.makedirs(od, exist_ok=True)
hdr = {"Content-Type": "application/json"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]

def words_from(al, text):
    ch, a, b = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur, t0, t1 = [], "", None, None
    for c, s, e in zip(ch, a, b):
        if c.isspace():
            if cur: out.append([cur, t0, t1]); cur = ""
            continue
        if not cur: t0 = s
        cur += c; t1 = e
    if cur: out.append([cur, t0, t1])
    # drop v3 tags like "[nervous]" (they are not spoken)
    res, intag = [], False
    for w in out:
        if w[0].startswith("["): intag = not w[0].endswith("]"); continue
        if intag: intag = not w[0].endswith("]"); continue
        res.append(w)
    return res

for lid, who, text, ru in EP[ep]["lines"]:
    if lid in SKIP or (only and lid not in only): continue
    if os.path.exists(f"{od}/{lid}.wav"): print("keep", lid); continue
    if who == "nar": vid, body = NAR["el"], {"text": text, "model_id": NAR["model"], "voice_settings": NAR["settings"]}
    else: vid, body = CAST[who]["el"], {"text": text, "model_id": "eleven_v3"}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128", data=json.dumps(body).encode(), headers=hdr)
    js = json.loads(urllib.request.urlopen(req, timeout=180).read())
    mp3 = base64.b64decode(js["audio_base64"]); open(f"{od}/{lid}.mp3", "wb").write(mp3)
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "-", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=mp3, capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    thr = 0.01 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]
    i0 = max(0, idx[0] - 960); x = x[i0: idx[-1] + 7200]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    sf.write(f"{od}/{lid}.wav", x.astype(np.float32), SR)
    al = js.get("normalized_alignment") or js.get("alignment")
    if al:
        sh = i0 / SR; d = len(x) / SR
        w = [[t, round(max(0, a - sh), 3), round(min(d, max(0, b - sh)), 3)] for t, a, b in words_from(al, text)]
        json.dump(w, open(f"{od}/{lid}.words.json", "w"), ensure_ascii=False)
    print(ep, lid, who, round(len(x) / SR, 2), "words" if al else "no-align"); time.sleep(3)
