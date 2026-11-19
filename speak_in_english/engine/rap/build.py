"""python3 build.py <workdir> tts|timeline|beat|mix   — pilot: rhythmic English lesson on a beat (free synthetic beat + ElevenLabs voices on the grid)"""
import json, os, sys, time, subprocess, urllib.request, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(f"{D}/script.json")); wd = sys.argv[1]; step = sys.argv[2]
BEAT = 60 / S["bpm"]; BAR = 4 * BEAT; SR = 48000; SLOT = 2 * BEAT - 0.12   # a half-bar slot (2 beats) minus a small gap
def bar(n): return n * BAR
# ---- event list (times in seconds) ----
def events():
    E = []
    for t, who, txt in S["intro"]: E.append(dict(kind="talk", who=who, text=txt, t=t, key=f"intro_{who}_{len(E)}"))
    b = 2
    for sec in ("verse1", "chorus", "verse2", "chorus"):
        for l1, l2 in S[sec]:
            E.append(dict(kind="rap", who="teacher", text=l1, t=bar(b), slot=SLOT, bar=b, half=0, key="r_" + l1))
            E.append(dict(kind="rap", who="teacher", text=l2, t=bar(b) + 2 * BEAT, slot=SLOT, bar=b, half=1, key="r_" + l2)); b += 1
    # your turn
    E.append(dict(kind="talk", who="teacher", text=S["turn"]["cue"], t=bar(b), key="turn_cue")); b += 1
    for w, a in S["turn"]["pairs"]:
        E.append(dict(kind="pair", who="teacher", text=w, t=bar(b), key="p_" + w, part="word", bar=b))
        E.append(dict(kind="pair", who="hero", text=a, t=bar(b) + 2 * BEAT, key="p_" + a, part="answer", bar=b, word=w)); b += 1
    for sec in ("chorus",):
        for l1, l2 in S[sec]:
            E.append(dict(kind="rap", who="teacher", text=l1, t=bar(b), slot=SLOT, bar=b, half=0, key="r_" + l1))
            E.append(dict(kind="rap", who="teacher", text=l2, t=bar(b) + 2 * BEAT, slot=SLOT, bar=b, half=1, key="r_" + l2)); b += 1
    for t, who, txt in S["outro"]: E.append(dict(kind="talk", who=who, text=txt, t=bar(b) + t, key=f"outro_{who}_{len(E)}"))
    return E, b
E, nb = events(); TOTAL = round(bar(nb + 1) + 0.5, 2)
if step == "tts":
    od = f"{wd}/vo"; os.makedirs(od, exist_ok=True); hdr = {"Content-Type": "application/json", "Accept": "audio/mpeg"}
    if os.environ.get("ELEVENLABS_API_KEY"): hdr["xi-api-key"] = os.environ["ELEVENLABS_API_KEY"]
    dur = json.load(open(f"{wd}/durations.json")) if os.path.exists(f"{wd}/durations.json") else {}; seen = set()
    for e in E:
        fn = "".join(c if c.isalnum() else "_" for c in e["key"]) + f"_{e['who']}"
        if fn in seen or (os.path.exists(f"{od}/{fn}.wav") and fn in dur): seen.add(fn); continue
        seen.add(fn)
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{S['voices'][e['who']]}?output_format=mp3_44100_128", data=json.dumps({"text": e["text"], "model_id": S["model"]}).encode(), headers=hdr)
        open(f"{od}/{fn}.mp3", "wb").write(urllib.request.urlopen(req, timeout=120).read())
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{od}/{fn}.mp3", "-af", "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse", "-ac", "1", "-ar", "48000", f"{od}/{fn}.wav"], check=True)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{od}/{fn}.wav"], capture_output=True, text=True).stdout)
        dur[fn] = round(d, 3); json.dump(dur, open(f"{wd}/durations.json", "w"), indent=1); print(fn, round(d, 2), flush=True); time.sleep(3)
    sys.exit()
dur = json.load(open(f"{wd}/durations.json"))
def fname(e): return "".join(c if c.isalnum() else "_" for c in e["key"]) + f"_{e['who']}"
# fit rap clips into their slot with atempo (speed up only; max 1.7x)
def fitted(e):
    d = dur[fname(e)]; f = 1.0
    if e["kind"] == "rap" and d > e["slot"]: f = min(1.9, d / e["slot"])
    if e["kind"] == "talk" or e["kind"] == "pair": f = 1.0
    return f, d / f
if step == "timeline":
    TL = {"total": TOTAL, "bpm": S["bpm"], "beat": BEAT, "bar": BAR, "ev": []}
    for e in E:
        f, d = fitted(e); TL["ev"].append({**e, "f": round(f, 3), "dur": round(d, 3), "end": round(e["t"] + d, 3)})
    json.dump(TL, open(f"{wd}/timeline.json", "w"), indent=1, ensure_ascii=False); print("total", TOTAL, "bars", nb)
if step == "mix":
    TL = json.load(open(f"{wd}/timeline.json")); N = int(TL["total"] * SR); rng = np.random.default_rng(1)
    def load(p, f=1.0):
        af = [] if f == 1.0 else ["-af", f"atempo={f}"]
        return np.frombuffer(subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, *af, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).copy()
    def put(buf, x, t, g=1.0):
        i = int(t * SR); x = x * g; buf[i:i + len(x)] += x[:len(buf) - i]
    def level(x, db=-18.0): return x * (10 ** (db / 20) / (np.sqrt(np.mean(x ** 2) + 1e-12)))
    tracks = {"hero": np.zeros(N, np.float32), "teacher": np.zeros(N, np.float32)}
    for e in TL["ev"]:
        x = level(load(f"{wd}/vo/{fname(e)}.wav", e["f"])); put(tracks[e["who"]], x, e["t"])
    voice = tracks["hero"] + tracks["teacher"]
    # beat: kick 1&3, snare 2&4, hats on 8ths, bass; from bar 2 to the start of the outro
    beat = np.zeros(N, np.float32); b0 = bar(2); b1 = bar(nb - 1)
    tk = np.arange(int(0.3 * SR)) / SR
    kick = (np.sin(2 * np.pi * (50 + 110 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 9)).astype(np.float32)
    ts = np.arange(int(0.25 * SR)) / SR
    snare = ((rng.standard_normal(len(ts)) * 0.6 + np.sin(2 * np.pi * 190 * ts)) * np.exp(-ts * 22)).astype(np.float32)
    th = np.arange(int(0.07 * SR)) / SR; hat = (np.diff(rng.standard_normal(len(th) + 1)) * np.exp(-th * 70)).astype(np.float32)
    roots = [55.0, 43.65, 65.41, 49.0]
    for n in range(2, nb - 2):
        for k in range(4):
            t = bar(n) + k * BEAT
            if k in (0, 2): put(beat, kick, t, 0.9)
            else: put(beat, snare, t, 0.5)
            put(beat, hat, t, 0.35); put(beat, hat, t + BEAT / 2, 0.22)
        tb = np.arange(int(2 * BEAT * SR)) / SR; r = roots[((n - 2) // 2) % 4]
        for off in (0, 2 * BEAT):
            put(beat, (np.sin(2 * np.pi * r * tb) * np.exp(-tb * 2.5)).astype(np.float32), bar(n) + off, 0.5)
    # pad throughout
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 261.63, 329.63], [196.0, 246.94, 293.66]]
    pad = np.zeros(N, np.float32); seg = int(2 * BAR * SR); t = np.arange(seg) / SR; env = np.minimum(1, t / 0.8) * np.minimum(1, (2 * BAR - t) / 0.8)
    for i, s0 in enumerate(range(0, N, seg)):
        ch = chords[i % 4]; w = sum(np.sin(2 * np.pi * f * t) for f in ch) / 3; e1 = min(s0 + seg, N); pad[s0:e1] += (w * env).astype(np.float32)[:e1 - s0]
    # duck beat under voice
    ve = np.convolve(np.abs(voice), np.ones(2400) / 2400, "same"); duck = 1 - 0.5 * np.clip(ve / (ve.max() * 0.3 + 1e-9), 0, 1)
    out = voice * 1.0 + beat * 0.30 * duck + pad * 0.05
    out = np.clip(out, -0.98, 0.98)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-14:TP=-1.5:LRA=7", "-ar", "48000", f"{wd}/audio.wav"], input=out.astype(np.float32).tobytes(), check=True)
    # mouth envelopes (30 fps) per speaker, from the raw voice tracks
    fps = 30; spf = SR // fps; env = {}
    for who, tr in tracks.items():
        m = np.array([np.sqrt(np.mean(tr[i * spf:(i + 1) * spf] ** 2)) for i in range(N // spf)]); env[who] = [round(float(min(1, v / 0.12)), 3) for v in m]
    json.dump(env, open(f"{wd}/mouth.json", "w")); print("audio+mouth ok")
