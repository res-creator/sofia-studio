"""python3 tl_baby.py -> eps/baby/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "baby"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
R = lambda x: round(x, 3)
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    if lid == "o4_h": return [list(x) for x in w]
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def words_of(lid, d=None):
    wt = word_times(lid)
    if wt is not None: return wt
    d = D[lid] if d is None else d
    words = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz):
        t0 = cc / tot * d; cc += a; wt.append([w, round(t0, 3), round(cc / tot * d, 3)]); cc += p_
    return wt
def wat(lid, t0, i): return R(t0 + words_of(lid)[i][1])

# ---- hook: frame 0 = the living room, the heroine holding the baby, the mother-in-law already reaching for him; her line at 0.2 s
cue("coo", 0.0, 0.45)
t = say("hook_m", 0.2)
hev = dict(reach=0.2)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["book"] = wat("hook", t, 6)      # «Опять.» -> she pulls out the huge old baby book (BABY CARE 1979)
hev["wide"] = wat("hook", t, 7)      # «Четыре ответа» -> wide
cue("whoosh", hev["book"] - 0.1, 0.4); cue("thud", hev["book"] + 0.1, 0.6); cue("whoosh", hev["wide"], 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.35), ev=hev)); t = e + 0.35

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "My baby, my rules!" / "Your baby, my grandson, my rules." she simply takes the baby and sits in the armchair; heroine's empty arms
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_m", c0)
ev["take"] = wat("o1_m", c0, 2); cue("whoosh", ev["take"], 0.4); cue("coo", ev["take"] + 0.3, 0.35)
ev["empty"] = R(c + 0.1); cue("boing", c + 0.2, 0.45)
c = say("o1_nar", c + 1.0)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "Thank you, but we're doing fine." / "Fine? He's wearing socks with sandals!" -> insert: the tiny sock + sandal; her deadpan look
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_m", c0)
ev["point"] = wat("o2_m", c0, 1)
ev["feet"] = R(c + 0.1); cue("boing", c + 0.2, 0.55); cue("pop", c + 0.6, 0.4)
ev["deadpan"] = R(c + 1.5); cue("blink", c + 1.6, 0.4)
c = say("o2_nar", c + 1.9)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> warm boundary; she closes the baby book, puts it away; the baby giggles; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.0, 0.4)
c0 = c + 0.3; c = say("o3_m", c0)
ev["close"] = R(c0 + 0.35); cue("thud", c0 + 0.45, 0.4)
ev["relief"] = R(c + 0.1); cue("coo", c + 0.15, 0.45); cue("chime", c + 0.3, 0.3)
c = say("o3_nar", c + 1.1)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> she hands the baby over on "Would you like the night shift?"; night-shift card insert 2:00 4:00 5:00; MIL sweats
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["hand"] = wat("o4_h", h0, 11); cue("whoosh", ev["hand"], 0.35); cue("coo", ev["hand"] + 0.4, 0.3)
ev["card"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.35)
for i in range(3): cue("tick", c + 0.35 + i * 0.3, 0.6); cue("pop", c + 0.35 + i * 0.3, 0.45)
cue("alarm", c + 1.3, 0.35)
c0 = c + 1.75; c = say("o4_m", c0); ev["sweat"] = R(c0)
cue("gulp", c0 + 2.2, 0.45)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- twist (music silent): the baby in her arms starts crying -> "Oh! He wants his mum!" -> she hands him back and hurries out (door slam); he stops at once
s = t; ev = dict(beat=R(s))
ev["cry"] = R(s + 0.35); cue("cry", s + 0.35, 0.75)
c = say("end_m", s + 1.1)
ev["back"] = R(SP_t := (s + 1.1 + 0.35)); cue("whoosh", SP_t, 0.4)
ev["hush"] = R(SP_t + 0.35)
ev["run"] = R(c + 0.05); cue("whoosh", c + 0.1, 0.55)
ev["slam"] = R(c + 0.85); cue("thud", c + 0.85, 0.8); cue("impact", c + 0.87, 0.35)
ev["look"] = R(c + 1.25); cue("coo", c + 1.4, 0.4)
c = say("moral", c + 1.45)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = words_of(sp["id"], sp["d"])
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["You raised a wonderful son — so clearly you know best.", "Вы вырастили чудесного сына — значит, вам виднее."],
                          ["Would you like the night shift?", "Возьмёте ночную смену?"],
                          ["He wakes at two, four and five.", "Он просыпается в два, в четыре и в пять."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
