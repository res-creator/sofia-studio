"""python3 tl_carpet.py -> eps/carpet/timeline.json  (rubric «Наше за границей», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "carpet"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = Rupert frozen in front of the huge red wall carpet, palms out at it; she holds a teapot; his line at 0.2 s
cue("boing", 0.0, 0.35)
t = say("hook_g", 0.2)
hev = dict(peek=R(0.2 + D["hook_g"] * 0.42))     # the "..." — he glances at the floor, then back at the wall
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["face"] = R(t + 0.05)                        # insert: close-up of the carpet medallion — the hidden face blinks (Rupert looks away)
cue("whoosh", hev["face"] - 0.05, 0.4); cue("blink", hev["face"] + 0.55, 0.6); cue("blink", hev["face"] + 1.35, 0.6)
hev["wide"] = wat("hook", t, 6) - 0.05           # «Четыре объяснения» -> back to the room
cue("whoosh", hev["wide"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> she chops the air three times, dusts her palms; he strokes the carpet like a dog (it wiggles happily)
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_g", c0)
ev["stroke"] = R(c + 0.1)
for i in range(4): cue("pat", c + 0.25 + i * 0.4, 0.55)
cue("coo", c + 0.9, 0.35)
c = say("o1_nar", c + 1.75)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> polite smile; "My floor feels betrayed" -> he kneels and pats the bare parquet in consolation
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_g", c0)
ev["kneel"] = R(c + 0.05); cue("thud", c + 0.1, 0.45)
for i in range(3): cue("pat", c + 0.45 + i * 0.38, 0.5)
ev["look"] = R(c + 1.55); cue("blink", c + 1.6, 0.5)
c = say("o2_nar", c + 1.9)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> she presents the carpet; "basically art" -> a golden frame, museum ropes and a plaque pop around it; he applauds; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.4, 0.4)
c0 = c + 0.3; c = say("o3_g", c0)
ev["frame"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.4); cue("ding", c + 0.3, 0.5)
ev["ropes"] = R(c + 0.55); cue("pop", c + 0.6, 0.5); cue("pop", c + 0.75, 0.5)
ev["clap"] = R(c + 1.0); cue("clapclap", c + 1.05, 0.5)
c = say("o3_nar", c + 1.8)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the tender line; sepia flashback: a child in bed traces the carpet pattern; Rupert tears up; "May I touch it?" -> the carpet face blushes
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["flash"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.35); cue("chime", c + 0.3, 0.4); cue("chime", c + 1.1, 0.3)
ev["tear"] = R(c + 1.9); cue("whoosh", c + 1.9, 0.3)
c0 = c + 2.15; c = say("o4_g", c0)
ev["touch"] = R(c + 0.1)
ev["blush"] = R(c + 0.75); cue("sparkle", c + 0.75, 0.45); cue("coo", c + 0.85, 0.35)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.7), ev=ev)); t = c + 1.7

# ---- twist (music silent): «МЕСЯЦ СПУСТЯ» — cut-away of two flats: Rupert drumming in front of HIS wall carpet, the neighbour knits in silence
s = t; ev = dict(beat=R(s))
ev["drum"] = R(s + 0.3)
for i in range(9): cue("drum", s + 0.35 + i * 0.19, 0.55 if i % 3 else 0.7)
ev["neigh"] = R(s + 1.25)
c = say("end_g", s + 2.2)
for i in range(4): cue("drum", c + 0.15 + i * 0.17, 0.5)
ev["wink"] = R(c + 0.55); cue("blink", c + 0.6, 0.55)
c = say("moral", c + 1.25)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question `ask`
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
a0 = c + 0.4; cue("whoosh", a0 - 0.1, 0.45); cue("pop", a0, 0.5)
c = say("ask", a0)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9), ev=dict(ask=R(a0)))); t = c + 0.9

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = re.sub(r"\[[^\]]*\]\s*", "", sp["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Rupert, whole generations of us fell asleep tracing those patterns.", "Руперт, целые поколения засыпали, водя пальцем по этим узорам."],
                          ["That carpet raised more children than any nursery.", "Этот ковёр вырастил больше детей, чем любой детский сад."]],
                 "o3_h": [["It's a family heirloom.", "Это семейная реликвия."],
                          ["It keeps the room warm and blocks out noise.", "Он держит тепло и глушит шум."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
