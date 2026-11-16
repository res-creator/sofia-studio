"""python3 tl_newgirl1.py -> eps/newgirl1/timeline.json  (story series «Новенькая», ep 1 «Пельмени», choose-what-next)
Scenes: hook / caf / eagle / leo / video / class / night / fork / outro. Same schema as timeline_v2.py."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "newgirl1"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    w = sorted(w, key=lambda x: x[1]); out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out

# ---- hook: frame 0 = cover (title over the live cafeteria; Sonya holds her tray, «MOM» sticker on the dumpling box; Brittany next to her)
ev = {}
t = say("hook_b", 0.2)
ev["push"] = 0.45; cue("whoosh", 0.42, 0.6)                 # Brittany's hand pushes the tray
ev["fly"] = 0.55; cue("boing", 0.6, 0.45)                   # slow-motion dumplings in the air (close-up)
ev["land"] = 1.95; [cue("plop", 1.95 + i * 0.13, 0.55) for i in range(6)]
t = max(t, 2.3)
ev["nar"] = R(t); e = say("hook", t)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.2), ev=ev)); t = e + 0.2

# ---- caf: "Ew. Dog food?" — phones go up; her answer; Brittany mocks the accent; the whole room laughs; narrator over her red ears
s = t; ev = {}
c = say("b1", s + 0.15)
ev["phones"] = R(c - 0.6); [cue("shutter", c - 0.5 + i * 0.22, 0.45) for i in range(4)]
c = say("h1", c + 0.35)
c = say("b2", c + 0.25)
ev["laugh"] = R(c - 0.2); cue("cheer", c - 0.2, 0.55); cue("clapclap", c + 0.1, 0.35)
c = say("n1", c + 0.6)
ev["ears"] = R(c - D["n1"] + 0.4)
scenes.append(dict(id="caf", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- eagle: the last dumpling rolls; the doors fly open — the school mascot (eagle costume) + the principal with coffee; the eagle slips and falls on him
s = t; ev = dict(roll=R(s)); cue("whoosh", s + 0.05, 0.35)
ev["doors"] = R(s + 1.1); cue("doors", s + 1.1, 0.6)
ev["slip"] = R(s + 1.9); cue("squeak", s + 1.9, 0.6)
ev["fall"] = R(s + 2.25); cue("thud", s + 2.35, 0.8); cue("impact", s + 2.4, 0.5)
ev["coffee"] = R(s + 2.4); cue("plop", s + 3.05, 0.5)
ev["hold"] = R(s + 3.3)                                     # the principal, soaked in coffee, holds up the dumpling
c = say("p1", s + 3.6)
ev["point"] = R(c + 0.25); cue("whoosh", c + 0.25, 0.4)    # the whole room points (open palms) at Sonya
ev["smile"] = R(c + 1.2); cue("ding", c + 1.25, 0.25)
scenes.append(dict(id="eagle", s=R(s), e=R(c + 1.9), ev=ev)); t = c + 1.9

# ---- leo: he picks up a dumpling, blows on it, eats it; "These are amazing. Do you have more?"; her first smile; narrator
s = t; ev = dict(walk=R(s))
ev["eat"] = R(s + 1.0); cue("gulp", s + 1.35, 0.5)
c = say("l1", s + 1.75)
ev["smile"] = R(c + 0.1); cue("sparkle", c + 0.15, 0.4)
c = say("n2", c + 0.55)
scenes.append(dict(id="leo", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- video: evening, her room; phone insert: «NEW GIRL CAN'T SPEAK ENGLISH», views climb, comments, a like from TYLER; she puts the phone face down
s = t; ev = dict(room=R(s)); cue("msg", s + 0.25, 0.6)
ev["phone"] = R(s + 0.7); cue("whoosh", s + 0.68, 0.35)
ev["views"] = R(s + 1.0); [cue("tick", s + 1.05 + i * 0.25, 0.35) for i in range(6)]
ev["comments"] = R(s + 2.0); [cue("pop", s + 2.05 + i * 0.35, 0.35) for i in range(3)]
ev["like"] = R(s + 3.3); cue("ding", s + 3.35, 0.5)
c = say("n3", s + 3.1)
ev["down"] = R(c + 0.2); cue("thud", c + 0.35, 0.35)
scenes.append(dict(id="video", s=R(s), e=R(c + 0.9), ev=ev)); t = c + 0.9

# ---- class: SPEECH CONTEST — FRIDAY; Miss Carson; Brittany "So… me again?"; the WINNER board (3 years); Leo whispers
s = t; ev = dict(bell=R(s)); cue("bell", s, 0.45)
c = say("c1", s + 0.4)
c = say("b3", c + 0.3)
ev["board"] = R(c + 0.15); cue("whoosh", c + 0.12, 0.4); [cue("stamp", c + 0.35 + i * 0.3, 0.4) for i in range(3)]
c = say("l2", c + 1.3)
scenes.append(dict(id="class", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- night: mirror, pencil in her teeth, "Th… think. Three. Thursday."; the pencil drops; video call from mum (narrator voices mum) with a pot of dumplings
s = t; ev = dict(mirror=R(s)); cue("tick", s + 0.1, 0.3)
c = say("h2", s + 0.35)
ev["drop"] = R(c + 0.05); cue("drop", c + 0.1, 0.5)
ev["call"] = R(c + 0.5); cue("ring", c + 0.5, 0.45)
c = say("mum", c + 1.4)
ev["pot"] = R(c - 1.2); cue("clank", c - 1.15, 0.4)
scenes.append(dict(id="night", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4

# ---- fork (music silent): the sign-up sheet in the hallway; Sonya with a pen; Brittany behind her; freeze; split screen A / B; narrator
s = t; ev = dict(hall=R(s)); cue("whoosh", s, 0.4)
c = say("b4", s + 0.9)
ev["freeze"] = R(c + 0.25); cue("impact", c + 0.25, 0.6)
ev["split"] = R(c + 0.7); cue("whoosh", c + 0.7, 0.5); cue("pop", c + 0.95, 0.5); cue("pop", c + 1.2, 0.5)
c = say("fork", c + 1.0)
scenes.append(dict(id="fork", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: «А — КОНКУРС / Б — ВИДЕО-ОТВЕТ», СОХРАНИ, ПОДПИСАТЬСЯ (cursor); the ask line big
s = t; cue("whoosh", s, 0.6); cue("impact", s + 0.2, 0.5); cue("pop", s + 0.6, 0.5); cue("pop", s + 0.85, 0.5)
ask0 = s + 1.3; c = say("ask", ask0)
scenes.append(dict(id="outro", s=R(s), e=R(c + 3.0), ev=dict(ask=R(ask0)))); t = c + 3.0

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
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—…]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
