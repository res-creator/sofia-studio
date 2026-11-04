"""python3 tl_uup.py -> eps/uup/timeline.json  (rubric «Ответ на вопрос из комментариев»: hook / o1 / o2 / o3 / end / outro, no level machinery)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "uup"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda d: {k: round(v, 3) for k, v in d.items()}
def keys(t0, t1, n, g=0.45):
    for k in range(n): cue("keys", t0 + (t1 - t0) * k / max(1, n - 1), g)

# ---- hook: the phone buzzes on the pillow (frame 0 = bedroom + title), his voice reads "Hey... you up?" at 0.2 s,
#      chat insert at 0.55, her lit face at the end of his line, narrator + comment plate
cue("buzz", 0.0, 0.7); cue("buzz", 0.5, 0.5); cue("msg", 0.08, 0.7)
e = say("hook_e", 0.2)
hev = dict(chat=0.55, face=e + 0.12, title_out=2.4)
h = say("hook", e + 0.26)
hev["plate"] = hev["title_out"]; hev["three"] = h - D["hook"] + 3.15
cue("pop", hev["chat"], 0.5); cue("pop", hev["plate"], 0.55)
t = h + 0.12
scenes.append(dict(id="hook", s=0.0, e=round(t, 3), ev=R(hev)))

# ---- option 1 «ХОЛОДНО»: she types "No." (typing in the chat) -> sent -> "typing..." from him at once -> her face -> narrator
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict(plate=s)
a = say("o1_h", s + 0.3); ev["type0"] = s + 0.2; ev["sent"] = s + 0.3 + 0.62; keys(ev["type0"], ev["sent"] - 0.1, 3); cue("send", ev["sent"], 0.6)
ev["dots"] = a + 0.08; cue("pop", ev["dots"], 0.6)
n = say("o1_nar", a + 0.32); ev["face"] = n - D["o1_nar"] + 0.84
t = n + 0.12
scenes.append(dict(id="o1", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- option 2 «С ЮМОРОМ»: "Yes. Still not interested." -> sent -> she slaps the phone face down, blanket over her head -> narrator
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict(plate=s)
a = say("o2_h", s + 0.3); ev["type0"] = s + 0.2; ev["sent"] = a - 0.05; keys(ev["type0"], ev["sent"] - 0.1, 9); cue("send", ev["sent"], 0.6)
ev["flip"] = a + 0.25; cue("thud", ev["flip"] + 0.18, 0.8)
ev["blanket"] = ev["flip"] + 0.5; cue("whoosh", ev["blanket"], 0.45)
n = say("o2_nar", ev["flip"] + 0.12)
t = n + 0.12
scenes.append(dict(id="o2", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- option 3 «КАК НОСИТЕЛЬ»: her calm line (single, bubble) -> the chat shows it sent -> narrator -> Bella tip
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict(plate=s)
a = say("o3_h", s + 0.3); ev["sent"] = a + 0.08; cue("send", ev["sent"], 0.6)
n = say("o3_nar", a + 0.3)
p = say("o3_tip", n + 0.38); cue("ding", p - D["o3_tip"] + 0.02, 0.55)
t = p + 0.12
scenes.append(dict(id="o3", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- twist: one deliberate beat (music silent, "typing..." in the chat) -> his reply arrives -> her stunned/offended face -> end screen
s = t; ev = dict(dots=s + 0.1)
r = say("end_e", s + 0.75); ev["reply"] = r - D["end_e"] - 0.05; cue("msg", ev["reply"], 0.75)
ev["face"] = r + 0.1; cue("rimshot", ev["face"] + 0.05, 0.6)
t = r + 0.7
scenes.append(dict(id="end", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- end screen
s = t; cue("whoosh", s, 0.6)
o = say("outro", s + 0.2)
for k in range(3): cue("pop", s + 0.75 + 0.3 * k, 0.5)
t = o + 0.45
scenes.append(dict(id="outro", s=round(s, 3), e=round(t, 3)))

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)]); env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = re.sub(r"\[[^\]]*\]\s*", "", sp["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a_, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a_; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["setting"] = EPN; cfg["cards"] = {}
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(f"  {x['id']:7s} {x['s']:6.2f}-{x['e']:6.2f}") for x in scenes]; [print(f"    {x['id']:7s} {x['t']:6.2f}+{x['d']:.2f}") for x in speech]
