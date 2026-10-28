"""python3 eleven_tts_ts.py <ep> [ids...] -> eps/<ep>/vo/<id>.wav + <id>.words.json for EN lines, via ElevenLabs /with-timestamps.
Same voices and processing as eleven_tts.py (48 kHz mono, silence trimmed, peak 0.89); word timings come from the character alignment
(as in prep_checkout.py), so chunked bubbles follow the voice. The raw mp3 + alignment are kept in eps/<ep>/src/.
The API key is injected by the environment/proxy; never write it into files. One request at a time, ~3 s apart.
Env: EL_MODEL (default eleven_v3), SKIP_EXISTING=1."""
import base64, json, os, re, sys, time, subprocess, urllib.request, numpy as np, soundfile as sf
from episodes_v2 import EP, CAST
SR = 48000; MODEL = os.environ.get("EL_MODEL", "eleven_v3")
ep = sys.argv[1]; only = set(sys.argv[2:]); od = f"eps/{ep}/vo"; sd = f"eps/{ep}/src"; os.makedirs(od, exist_ok=True); os.makedirs(sd, exist_ok=True)
hdr = {"Content-Type": "application/json"}
if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
for lid, who, text, ru in EP[ep]["lines"]:
    if who == "nar" or (only and lid not in only): continue
    if os.environ.get("SKIP_EXISTING") and os.path.exists(f"{od}/{lid}.wav"): continue
    vid = CAST[who].get("el")
    if not vid: print("no ElevenLabs voice for", who, "- skipped", lid); continue
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
                                 data=json.dumps({"text": text, "model_id": MODEL}).encode(), headers=hdr)
    r = json.loads(urllib.request.urlopen(req, timeout=180).read())
    mp3 = base64.b64decode(r["audio_base64"]); al = r.get("alignment") or r.get("normalized_alignment")
    open(f"{sd}/{lid}.mp3", "wb").write(mp3); json.dump(dict(model=MODEL, voice=vid, text=text, alignment=al), open(f"{sd}/{lid}.align.json", "w"))
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "-", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=mp3, capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).copy(); thr = 0.01 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]
    a = max(0, idx[0] - 960); x = x[a: idx[-1] + 7200]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    sf.write(f"{od}/{lid}.wav", x.astype(np.float32), SR)
    ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur, depth = [], None, 0; off = a / SR
    for c, s, e in zip(ch, st, en):
        if c == '[': depth += 1; continue
        if c == ']': depth -= 1; continue
        if depth: continue
        if c.isspace():
            if cur: words.append(cur); cur = None
            continue
        if cur is None: cur = [c, s, e]
        else: cur[0] += c; cur[2] = e
    if cur: words.append(cur)
    words = [[w, round(max(0, s - off), 3), round(max(0, e - off), 3)] for w, s, e in words if re.search(r"[A-Za-z]", w)]
    json.dump(words, open(f"{od}/{lid}.words.json", "w"))
    print(ep, lid, who, MODEL, round(len(x) / SR, 2), ' '.join(w[0] for w in words), flush=True); time.sleep(3)
