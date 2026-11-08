"""python3 tl_gamer.py -> eps/gamer/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "gamer"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)

def est_words(lid):
    """word timings: aligner json (narrator lines) or a length/punctuation estimate over the clip (English lines)"""
    try: return [list(x) for x in json.load(open(f"{VO}/{lid}.words.json"))]
    except FileNotFoundError: pass
    d = D[lid]; words = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—…]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz):
        t0 = cc / tot * d; cc += a; wt.append([w, round(t0, 3), round(cc / tot * d, 3)]); cc += p_
    return wt
WT = {k: est_words(k) for k in LN}
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def wat(lid, t0, i): return R(t0 + WT[lid][i][1])

# ---- hook: frame 0 = she stands by the door in her evening dress + bag; he is on the sofa in headphones, controller, TV: LEVEL 47. His line at 0.2 s
cue("game", 0.0, 0.3); cue("keys", 0.05, 0.25)
t = say("hook_b", 0.2); hev = {}
hev["nar"] = R(t + 0.25); e = say("hook", t + 0.25)
hev["tap"] = R(hev["nar"] + 0.3); cue("tick", hev["tap"] + 0.1, 0.35); cue("tick", hev["tap"] + 0.6, 0.35)   # her close-up: tapping the watch on her wrist
hev["tv"] = wat("hook", hev["nar"], 6)     # «а он третий час играет» -> insert: TV, LEVEL 47
hev["wide"] = wat("hook", hev["nar"], 13)  # «Четыре ответа» -> wide
cue("whoosh", hev["tv"] - 0.05, 0.4); cue("game", hev["tv"] + 0.05, 0.35); cue("whoosh", hev["wide"] - 0.05, 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- 1 · В ЛОБ: "Game off! Now! Go!" (she points at the door, open palm) -> "Can't pause online, babe. Twelve people need me." -> TV: twelve players wave
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o1_h", h0); cue("stamp", wat("o1_h", h0, 2), 0.35); cue("stamp", wat("o1_h", h0, 3), 0.4)
c0 = c + 0.3; c = say("o1_b", c0)
ev["tv"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.4); cue("cheer", c + 0.3, 0.3); cue("pop", c + 0.35, 0.3); cue("pop", c + 0.6, 0.3)
n0 = c + 0.45; c = say("o1_nar", n0)
ev["her"] = wat("o1_nar", n0, 7) - 0.1                     # «незнакомцам» -> her: stunned, arms drop
cue("deflate", ev["her"] + 0.1, 0.4)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- 2 · ВЕЖЛИВО: "Maybe we could go soon?" -> "Sure, soon. After the boss." (eyes on the TV) -> TV: the boss... and a second, bigger boss climbs out
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o2_h", h0)
c0 = c + 0.3; c = say("o2_b", c0)
ev["tv"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.4); cue("boom", c + 0.3, 0.35)
n0 = c + 0.45; ev["boss2"] = wat("o2_nar", n0, 5) - 0.05; cue("boom", ev["boss2"] + 0.05, 0.55); cue("riser_short", ev["boss2"] - 0.4, 0.25)
c = say("o2_nar", n0)
ev["her"] = R(c + 0.05); cue("deflate", c + 0.12, 0.45)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.85), ev=ev)); t = c + 0.85

# ---- 3 · КАК НОСИТЕЛЬ: "I'm leaving in five minutes — with or without you." -> "…Saving! Saving! Where are my shoes?" — he jumps up and hops on one leg
#      with a trainer; TV: SAVED; tip
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o3_h", h0); ev["watch"] = wat("o3_h", h0, 2); cue("tick", ev["watch"] + 0.1, 0.3)
c0 = c + 0.25; c = say("o3_b", c0); cue("keys", c0 + 0.05, 0.5)
ev["up"] = wat("o3_b", c0, 2) - 0.05; cue("boing", ev["up"], 0.4)       # "Where are my shoes?" -> he leaps up
for k_ in range(4): cue("thud", ev["up"] + 0.35 + k_ * 0.36, 0.3)
ev["tv"] = R(c + 0.75); cue("whoosh", ev["tv"] - 0.03, 0.35); cue("ding", ev["tv"] + 0.45, 0.45)
n0 = ev["tv"] + 0.35; c = say("o3_nar", n0)
ev["her"] = wat("o3_nar", n0, 2) - 0.05
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: the sweet line (she checks her lipstick in a little mirror); on "waiter" his headphones slide down -> "The waiter?! Game over!"
#      -> insert: he yanks the plug out of the socket -> TV black (music dies with it)
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["waiter"] = wat("o4_h", h0, 13)
ev["p2"] = wat("o4_h", h0, 19); cue("sparkle", ev["p2"] + 0.2, 0.4)
cue("gasp", c + 0.08, 0.5)
c0 = c + 0.4; c = say("o4_b", c0)
ev["yank"] = R(c + 0.15); cue("whoosh", ev["yank"] - 0.02, 0.4); cue("zip", ev["yank"] + 0.35, 0.35); cue("powerdown", ev["yank"] + 0.4, 0.7)
ev["dark"] = R(ev["yank"] + 1.0)
scenes.append(dict(id="o4", s=R(s), e=R(ev["dark"] + 1.0), ev=ev)); t = ev["dark"] + 1.0

# ---- twist (music silent): «ЧЕРЕЗ 5 МИНУТ» — he is dressed and ready by the door; she sits on the sofa in HIS headphones with the controller
s = t; ev = dict(beat=R(s))
ev["ready"] = R(s + 0.1); cue("dressup", s + 0.1, 0.45); cue("ding", s + 0.55, 0.35)
ev["her"] = R(s + 1.25); cue("game", s + 1.25, 0.35); cue("keys", s + 1.3, 0.5)
c0 = s + 1.5; c = say("end_h", c0)
ev["tv"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.4); cue("err", c + 0.55, 0.45)
c0 = ev["tv"] + 1.15; c = say("end_b", c0)
ev["win"] = R(c + 0.25); cue("tada", c + 0.3, 0.5)
c = say("moral", c + 0.4)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for w in ["один", "два", "три", "четыре"]:
    wt_ = next(x[1] for x in WT["outro"] if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9))); t = c + 0.9

sfx[:] = [x for x in sfx if x["g"] > 0]
for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    sp["words"] = WT[sp["id"]]
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Take your time, love.", "Не торопись, любимый."],
                          ["The table's booked for two —", "Столик заказан на двоих —"],
                          ["I'm sure the waiter would love to be my player two.", "уверена, официант с радостью станет моим вторым игроком."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
