"""python3 tl_mumtypes.py -> eps/mumtypes/timeline.json  (rubric «4 типа»: hook / t1 / t2 / t3 / t4 / end (twist + moral) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}.
The British tip voice (who='tipgb') is written as who='tip' so the shared captions draw it as the pink tip plate."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "mumtypes"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=("tip" if l[1] == "tipgb" else l[1]), text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        if out and a < out[-1][1]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = her flat; the phone in its stand on the table buzzes and crawls to the edge (MUM · 27), the cat sits next to it; her line at 0.2 s
cue("vibe", 0.0, 0.55); cue("vibe", 0.6, 0.45); cue("vibe", 1.2, 0.45); cue("vibe", 1.8, 0.4)
t = say("hook_h", 0.2)
hev = {}
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["phone"] = R(t - 0.02)                 # «Четыре типа мам» -> insert: the phone screen, MUM · 27 missed calls
hev["four"] = wat("hook", t, 3)            # «четыре английских слова» -> 2x2 teaser of the four mums on video call
hev["cat"] = wat("hook", t, 6)             # «Узнай свою» -> wide: the cat puts its paw on the phone and sighs
cue("whoosh", hev["phone"], 0.4); cue("vibe", hev["phone"] + 0.1, 0.45)
cue("whoosh", hev["four"] - 0.03, 0.35); [cue("pop", hev["four"] + 0.05 + i * 0.12, 0.4) for i in range(4)]
cue("whoosh", hev["cat"] - 0.03, 0.3); cue("vibe", hev["cat"] + 0.05, 0.4); cue("tap", hev["cat"] + 0.55, 0.5); cue("sigh", hev["cat"] + 0.75, 0.75)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.25), ev=hev)); t = e + 0.25

def chapter(k, gag_d, gag_cues):
    """label + buzz -> the cat answers (paw, sigh) -> video call: mum's line -> gag beat -> her reaction + tip -> narrator"""
    global t
    s = t; ev = dict(label=R(s))
    cue("whoosh", s, 0.55); cue("pop", s + 0.08, 0.55); cue("vibe", s + 0.1, 0.5); cue("vibe", s + 0.5, 0.45)
    ev["paw"] = R(s + 0.55); cue("tap", s + 0.6, 0.5); cue("sigh", s + 0.68, 0.7)
    ev["call"] = R(s + 1.05); cue("blink", s + 1.05, 0.4)
    c = say(f"t{k}_mum", s + 1.2)
    ev["gag"] = R(c + 0.1)
    for n, dt, g in gag_cues: cue(n, c + 0.1 + dt, g)
    ev["react"] = R(c + 0.1 + gag_d)
    c = say(f"t{k}_tip", c + 0.1 + gag_d + 0.2); cue("ding", c - D[f"t{k}_tip"] + 0.03, 0.4)
    ev["nar"] = R(c + 0.4)
    c = say(f"t{k}_nar", c + 0.4)
    scenes.append(dict(id=f"t{k}", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25
    return ev

# 01 SHOULD: the pot boils behind her; after the line she pushes a jar of jam at the camera — it bonks against the glass; at «Пока ещё мягкий» the pot boils over
ev1 = chapter(1, 1.25, [("whoosh", 0.15, 0.4), ("thud", 0.55, 0.6), ("squeak", 0.75, 0.35)])
ev1["boil"] = wat("t1_nar", ev1["nar"], 3); cue("plop", ev1["boil"] + 0.05, 0.5); cue("plop", ev1["boil"] + 0.35, 0.4)
# 02 MUST: ladle as a pointer at the chart «SUNDAY — CALL MUM» circled three times; after the line: three taps on the chart; at «Обсуждению» she slams the ladle (stamp)
ev2 = chapter(2, 1.2, [("thud", 0.1, 0.5), ("thud", 0.4, 0.5), ("thud", 0.7, 0.55), ("marker", 0.75, 0.45)])
ev2["slam"] = wat("t2_nar", ev2["nar"], 3); cue("stamp", ev2["slam"], 0.6)
# 03 HAVE TO: table buried in lists, three pairs of glasses round her neck; after the line: she swaps glasses, the pile slides off (paper); insert: the top sheet
ev3 = chapter(3, 1.2, [("pop", 0.1, 0.4), ("pop", 0.35, 0.4), ("paper", 0.6, 0.6), ("whoosh", 0.65, 0.3)])
ev3["sheet"] = ev3["nar"]; cue("whoosh", ev3["sheet"] - 0.03, 0.35)
ev3["shrug"] = wat("t3_nar", ev3["nar"], 8); cue("whoosh", ev3["shrug"] - 0.03, 0.3)
# 04 HAD BETTER: dark room, sunglasses, she leans in to the camera; after the line: insert — her phone, the heroine's photo, green ONLINE; the heroine sinks behind the table
ev4 = chapter(4, 1.35, [("whoosh", 0.05, 0.35), ("blink", 0.25, 0.5), ("blink", 0.65, 0.45), ("brow", 1.1, 0.45)])
ev4["peek"] = wat("t4_nar", ev4["nar"], 2); cue("brow", ev4["peek"] + 0.05, 0.45)

# ---- twist (music silent): she calls herself — "Hi, Mum!" — mum on a yoga mat among other mums: "Can't talk now..." — beeps; she stares at the phone, the cat stares at her
s = t; ev = dict(beat=R(s))
ev["dial"] = R(s + 0.45); cue("tap", s + 0.5, 0.5); cue("ring", s + 0.75, 0.55)
c = say("end_h", s + 1.6)
ev["yoga"] = R(c + 0.15); cue("blink", c + 0.15, 0.4)
c = say("end_mum", c + 0.3)
ev["hang"] = R(c + 0.12); cue("hangup", c + 0.15, 0.6)
ev["stare"] = R(c + 1.0); cue("cricket", c + 1.05, 0.4)
ev["catlook"] = R(c + 1.55); cue("brow", c + 1.6, 0.4)
c0 = c + 2.0; c = say("moral", c0)
ev["moral"] = R(c0); ev["pat"] = R(c0 + 2.2); cue("coo", c0 + 2.3, 0.35)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: КАКАЯ ТВОЯ? 1/2/3/4 with the type names, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question; the ask line bumps the buttons
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
[cue("pop", s + 0.35 + i * 0.12, 0.45) for i in range(4)]
c = say("outro", s + 0.15)
a0 = c + 0.35; c = say("ask", a0); cue("pop", a0 - 0.05, 0.5)
for w in ["один", "два", "три", "четыре"]:
    wt_ = next(x[1] for x in word_times("ask") if x[0].lower().startswith(w)); cue("pop", a0 + wt_, 0.45)
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
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
