"""python3 tl_sickday.py -> eps/sickday/timeline.json  (rubric answers4 «Как ответить, когда…»: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}.
USA beach. She is "on sick leave" in a striped beach chair; her boss liked her beach photo and video-calls her.
Absurd detail: a seagull flies around with her thermometer in its beak (also in the liked photo).
Twist: the boss lies on the neighbouring beach chair in the same panama hat."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "sickday"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
R = lambda x: round(x, 3)
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = her in the beach chair, the phone notification «Your boss liked your photo» already up, the boss's voice at 0.2 s (video call)
hev = {}
cue("msg", 0.0, 0.55); cue("waves", 0.0, 0.5)
c = say("hook_b", 0.2)
hev["spit"] = R(c + 0.1); cue("gulp", c + 0.05, 0.5); cue("splash", c + 0.25, 0.5)   # she chokes on her drink: a spray of water
hev["nar"] = R(c + 0.95); e = say("hook", c + 0.95)
hev["photo"] = R(hev["nar"] - 0.05); cue("whoosh", hev["photo"], 0.4)              # insert: the liked photo (seagull with her thermometer behind her)
hev["wide"] = wat("hook", hev["nar"], 3)                                             # «Какой из четырёх…» -> wide beach
cue("squawk", hev["wide"] + 0.2, 0.35); cue("whoosh", hev["wide"] - 0.05, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1 «В ЛОБ»: panic "Not me! Photoshop!" -> boss raises a magnifier to the camera; insert: her shoulder under the lens — the strap tan line; she throws a towel over it
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.5)
ev["mag"] = R(c + 0.05); cue("squeak", c + 0.3, 0.3)             # the boss leans in and raises a magnifier to his camera
c = say("o1_b", c + 0.85)
ev["lens"] = R(c + 0.1); cue("zoom", c + 0.1, 0.5); cue("ding", c + 0.55, 0.4)
ev["towel"] = R(c + 1.45); cue("whoosh", c + 1.45, 0.35)
c = say("o1_nar", c + 1.0)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- option 2 «ВЕЖЛИВО»: a fake cough, hand on the forehead, "I'm so sorry, I feel really bad." -> "You look really great for 'really bad'."; insert: the cocktail umbrella in her water bottle
s = t; ev = opt_start(s)
ev["cough"] = R(s + 0.5); cue("cough", s + 0.5, 0.6)
c = say("o2_h", s + 1.15)
ev["squint"] = R(c + 0.05)                                              # he squints at the screen
c = say("o2_b", c + 0.6)
ev["bottle"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("ding", c + 0.45, 0.45)
ev["hide"] = R(c + 1.3); cue("pop", c + 1.6, 0.4)
c = say("o2_nar", c + 1.4)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- option 3 «КАК НОСИТЕЛЬ»: calm, she holds up the doctor's note -> "Fair enough. Get well soon." (he sighs, shrugs); she leans back; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.5)
ev["note"] = R(s + 0.5 + 2.55); cue("paper", s + 0.5 + 2.55, 0.5)
c = say("o3_b", c + 0.3)
ev["sigh"] = R(c - D["o3_b"] - 0.05); cue("deflate", c - D["o3_b"] - 0.1, 0.3)
ev["relax"] = R(c + 0.15); cue("creak", c + 0.25, 0.3)
ev["gull"] = R(c + 0.55); cue("squawk", c + 1.0, 0.4)                    # the seagull lands on her beach chair, thermometer in its beak
c = say("o3_nar", c + 1.25)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line in three chunks (sunglasses on in the first pause, a sip in the second);
#      then the boss freezes (long pause, "...") and grabs a pen: "...Send me the name of that clinic."
s = t; ev = opt_start(s); h0 = s + 0.5
c = say("o4_h", h0)
ev["ch2"] = R(h0 + 4.42); ev["ch3"] = R(h0 + 9.05)
ev["glasses"] = R(h0 + 3.6); cue("whoosh", h0 + 3.65, 0.3); cue("sparkle", h0 + 3.9, 0.35)
ev["jaw"] = R(h0 + 8.2); cue("boing", h0 + 8.3, 0.25)
ev["sip"] = R(c + 0.05); cue("gulp", c + 0.3, 0.4)
ev["freeze"] = R(c + 0.6); cue("tick", c + 0.9, 0.25); cue("tick", c + 1.4, 0.25)
c0 = c + 1.95; c = say("o4_b", c0)
ev["pen"] = R(c0 + 0.6); cue("paper", c0 + 0.9, 0.4); cue("paper", c + 0.2, 0.4)
ev["note"] = R(c + 0.15)                                                 # he writes it down and shows the notepad: «CLINIC?»
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.0), ev=ev)); t = c + 1.0

# ---- twist (music silent): hard cut to the widest shot — the boss on the neighbouring beach chair, same panama hat, phone in hand
s = t; ev = dict(beat=R(s)); cue("squawk", s + 0.15, 0.45)
ev["turn"] = R(s + 0.5)
c0 = s + 1.2; c = say("end_b", c0)
ev["shock"] = R(c + 0.05); cue("gasp", c + 0.05, 0.55)
ev["drop"] = R(c + 0.55); cue("whoosh", c + 0.55, 0.3); cue("boing", c + 1.0, 0.45); ev["bonk"] = R(c + 1.0)   # the seagull drops the thermometer on his head
ev["stars"] = R(c + 1.0)
c = say("moral", c + 1.8)
ev["moral"] = R(c - D["moral"]); cue("chime", ev["moral"] + 1.2, 0.3)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question «ask»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
ev = dict(ask=R(c + 0.35)); cue("ding", c + 0.3, 0.4)
c = say("ask", c + 0.35)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.2), ev=ev)); t = c + 1.2

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
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric", "absurd", "comment_q"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Sea air, sunshine, vitamin D.", "Морской воздух, солнце, витамин D."],
                          ["I'm recovering so hard I'll be back twice as productive.", "Я выздоравливаю так усердно, что вернусь вдвое продуктивнее."],
                          ["You're welcome.", "Не за что."]],
                 "o3_h": [["Doctor said fresh air and rest.", "Врач сказал: свежий воздух и отдых."],
                          ["I'm just following doctor's orders.", "Я просто выполняю предписания врача."]]}
# measured word starts so the chunk bubbles follow the voice (word count must match the joined chunks)
def setw(lid, starts):
    s_ = next(x for x in speech if x["id"] == lid); ws = " ".join(ch[0] for ch in cfg["chunks"][lid]).split()
    assert len(ws) == len(starts), (lid, len(ws), len(starts))
    s_["words"] = [[w, a, (starts[i + 1] if i + 1 < len(starts) else s_["d"])] for i, (w, a) in enumerate(zip(ws, starts))]
setw("o4_h", [0.04, 0.45, 1.4, 2.6, 3.15, 4.42, 4.62, 5.3, 5.6, 6.18, 6.4, 6.62, 6.9, 7.4, 7.55, 9.05, 9.3])
setw("o3_h", [0.16, 0.5, 0.8, 1.1, 1.4, 1.65, 2.66, 2.85, 3.05, 3.5, 4.0])
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
