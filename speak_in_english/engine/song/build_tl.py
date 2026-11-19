"""python3 song/build_tl.py <workdir>  (run from engine/) -> eps/song/timeline.json + <workdir>/audio.wav
Song pilot: spoken intro (ElevenLabs) + Suno track (word timings from ElevenLabs Scribe) + spoken outro."""
import json, os, sys, subprocess, numpy as np
wd = sys.argv[1]; SR = 48000; FPS = 30
D = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(f"{D}/lines.json"))
def load(p, af=None):
    a = ["ffmpeg", "-loglevel", "error", "-i", p] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(a, capture_output=True).stdout, np.float32).copy()
def dur(p): return len(load(p)) / SR
def envelope(x, scale):
    n = int(np.ceil(len(x) / SR * FPS)); spf = SR // FPS
    return [round(float(min(1.2, np.sqrt(np.mean(x[i*spf:(i+1)*spf]**2) + 1e-12) / scale)), 2) for i in range(n)]
speech = []
# ---- intro
t = 0.3
for who, lid, text in L["intro"]:
    x = load(f"{wd}/vo/{lid}.wav"); d = len(x) / SR
    speech.append(dict(id=lid, who=who, text=text, t=round(t, 3), d=round(d, 3), env=envelope(x, 0.08), words=[], kind="talk")); t += d + 0.3
OFF = round(t + 0.1, 3)
# ---- track words
W = [w for w in json.load(open(f"{wd}/stt.json"))["words"] if w["type"] == "word"]
is_ru = lambda s: any("а" <= c.lower() <= "я" or c.lower() == "ё" for c in s)
trk = load(f"{wd}/track.mp3"); voc = load(f"{wd}/track.mp3", "highpass=f=250,lowpass=f=3500")
scale = float(np.percentile(np.abs(voc), 99)) * 0.5
TD = len(trk) / SR
def seg_env(a, b): return envelope(voc[int(a*SR):int(b*SR)], scale)
def clean(s): return s.strip(" -.,!?").replace("Полет", "Полёт")
words = [dict(w=w["text"], a=w["start"], b=w["end"]) for w in W]
# count-in (first 4 Russian numbers) -> tom
pairs, chorus = [], []; i = 4
fam = {"bright": "IGHT", "snake": "AKE"}
for r in range(2):
    rnd = []
    for k in range(6):
        ru, en = words[i], words[i + 1]; i += 2
        rnd.append(dict(ru=clean(ru["w"]), en=clean(en["w"]).upper(), tr=OFF + ru["a"], te=OFF + en["a"], ra=ru["a"], rb=ru["b"], ea=en["a"], eb=en["b"]))
    # chorus: until the next Russian word (or the end)
    j = i
    while j < len(words) and not is_ru(words[j]["w"]): j += 1
    ch = words[i:j]; i = j
    pairs.append(rnd); chorus.append(ch)
for k, w in enumerate(words[:4]):
    speech.append(dict(id=f"count{k}", who="tom", text=clean(w["w"]), t=round(OFF + w["a"], 3), d=round(w["b"] - w["a"] + 0.1, 3), env=seg_env(w["a"], w["b"] + 0.1), words=[], kind="sing"))
for r, rnd in enumerate(pairs):
    for k, p in enumerate(rnd):
        speech.append(dict(id=f"r{r}p{k}ru", who="tom", text=p["ru"], t=round(p["tr"], 3), d=round(p["rb"] - p["ra"] + 0.08, 3), env=seg_env(p["ra"], p["rb"] + 0.08), words=[], kind="sing"))
        speech.append(dict(id=f"r{r}p{k}en", who="her", text=p["en"], t=round(p["te"], 3), d=round(p["eb"] - p["ea"] + 0.08, 3), env=seg_env(p["ea"], p["eb"] + 0.08), words=[], kind="sing"))
# chorus lines: split into pass1 / echo / pass2 by the sentence pattern (echo = 'Last night.' / 'To the lake.')
lines = []
for r, ch in enumerate(chorus):
    txt = [clean(w["w"]).lower() for w in ch]
    echo_start = 12 if r == 0 else 13   # word counts of the full sentences
    p1, echo, p2 = ch[:echo_start], ch[echo_start:echo_start + (2 if r == 0 else 3)], ch[echo_start + (2 if r == 0 else 3):]
    for part, who, tag in ((p1, "her", "p1"), (echo, "tom", "echo"), (p2, "her", "p2")):
        if not part: continue
        a, b = part[0]["start"] if "start" in part[0] else part[0]["a"], part[-1]["b"]
        ws = [[w["w"], round(OFF + w["a"], 3), round(OFF + w["b"], 3)] for w in part]
        lines.append(dict(r=r, tag=tag, who=who, t=round(OFF + a, 3), e=round(OFF + b, 3), words=ws))
        speech.append(dict(id=f"c{r}{tag}", who=who, text=" ".join(w[0] for w in ws), t=round(OFF + a, 3), d=round(b - a + 0.1, 3), env=seg_env(a, b + 0.1), words=[], kind="sing"))
# ---- outro (starts right after the last sung word)
t = OFF + words[-1]["b"] + 0.7
for who, lid, text in L["outro"]:
    x = load(f"{wd}/vo/{lid}.wav"); d = len(x) / SR
    speech.append(dict(id=lid, who=who, text=text, t=round(t, 3), d=round(d, 3), env=envelope(x, 0.08), words=[], kind="talk")); t += d + 0.35
CARD = round(t, 3); DUR = round(max(CARD + 2.6, OFF + TD), 2)
speech.sort(key=lambda s: s["t"])
TL = dict(fps=FPS, dur=DUR, ep="song", cfg=dict(title="song", camera="hard_cut", chunks={}, cards={}), scenes=[dict(id="S", s=0.0, e=DUR, ev={})], speech=speech, sfx=[],
          song=dict(off=OFF, track_end=round(OFF + TD, 3), last_word=round(OFF + words[-1]["b"], 3), card=CARD, beat=0.54, beat0=round(OFF + words[0]["a"], 3), pairs=pairs, lines=lines,
                    fam=["IGHT", "AKE"], tr=["э брайт лайт ин флайт гэйв э найт э фрайт ласт найт", "э снэйк кэн бэйк э кэйк, мэйк ит, тэйк ит ту зэ лэйк"],
                    ru=["Яркий свет в полёте напугал рыцаря прошлой ночью", "Змея может испечь торт, сделать его и отнести к озеру"]))
os.makedirs("eps/song", exist_ok=True); json.dump(TL, open("eps/song/timeline.json", "w"), ensure_ascii=False)
# ---- audio: intro voices + track + outro voices, voices levelled to the track loudness
N = int((DUR + 0.5) * SR); out = np.zeros(N, np.float32)
def put(x, t, g=1.0):
    k = int(t * SR); out[k:k + len(x)] += (x * g)[:N - k]
def lev(x, db=-17.0): return x * (10 ** (db / 20) / (np.sqrt(np.mean(x ** 2)) + 1e-12))
for s in speech:
    if s["kind"] == "talk": put(lev(load(f"{wd}/vo/{s['id']}.wav")), s["t"])
put(trk, OFF)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", f"{wd}/audio.wav"], input=np.clip(out, -1, 1).astype(np.float32).tobytes(), check=True)
print("OFF", OFF, "DUR", DUR, "card", CARD, "pairs", [len(p) for p in pairs], "lines", [(l["tag"], " ".join(w[0] for w in l["words"])) for l in lines])
