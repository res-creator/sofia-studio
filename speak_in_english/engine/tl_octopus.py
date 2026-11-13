"""python3 tl_octopus.py -> eps/octopus/timeline.json  (rubric «Полезное», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "octopus"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
# voiced segments (from the pauses in the wavs): the aligner returned the hook words out of order; o4_h has no aligner output
SEGS = {"hook": [(0.04, 1.54, "Ждала суп, а пришёл осьминог."), (1.91, 3.40, "Как вернуть блюдо и не поссориться?")],
        "o4_h": [(0.08, 2.0, "He's very handsome, Theo,"), (2.55, 2.72, "but"), (2.97, 4.09, "I ordered a lunch"), (4.26, 5.65, "that doesn't hold my fork back.")]}
def seg_words(segs):
    out = []
    for a, b, s in segs:
        ws = s.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, k in zip(ws, wt): out.append([w, R(a + cc / tot * (b - a)), R(a + (cc + k) / tot * (b - a))]); cc += k
    return out
def word_times(lid):
    if lid in SEGS: return seg_words(SEGS[lid])
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        if out and a < out[-1][1]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = the bowl has just landed: a whole octopus in the soup bowl, a tentacle hanging off the table; Theo presents it, line at 0.2 s
cue("thud", 0.0, 0.4); cue("squelch", 0.1, 0.5)
t = say("hook_w", 0.2)
hev = dict(wave=R(t - 0.3))                # the octopus waves a tentacle at her
cue("squelch", t - 0.25, 0.45)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["her"] = R(t - 0.03)                   # her shocked face
hev["octo"] = wat("hook", t, 3)            # «пришёл осьминог» -> close-up: the octopus in the bowl
hev["wide"] = wat("hook", t, 5)            # «Как вернуть» -> back to the wide (Employee of the month visible)
cue("whoosh", hev["octo"] - 0.03, 0.35); cue("boing", hev["octo"] + 0.15, 0.4); cue("whoosh", hev["wide"] - 0.03, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1 «В ЛОБ»: "No! This not soup! Take!" (pushes the bowl) -> "Not soup? He's swimming, isn't he?" Theo tops the bowl up with water; insert: the octopus swims
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("thud", s + 0.45, 0.45)
c0 = c + 0.25; c = say("o1_w", c0)
ev["pour"] = R(c + 0.05); cue("pour", c + 0.1, 0.8)
ev["swim"] = R(c + 1.2); cue("whoosh", c + 1.18, 0.35); cue("splash", c + 1.35, 0.7); cue("splash", c + 1.95, 0.5)
ev["back"] = R(c + 2.3); ev["squirt"] = R(c + 2.45); cue("splash", c + 2.5, 0.8); cue("gasp", c + 2.75, 0.35)
c = say("o1_nar", c + 3.2)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2 «ВЕЖЛИВО»: "Excuse me, I'm not sure this is mine." -> "Well, he's not mine either." the octopus wraps her fork; insert: tug of war
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.25; c = say("o2_w", c0)
ev["grab"] = R(c + 0.1); cue("squelch", c + 0.15, 0.6)
ev["tug"] = R(c + 0.9); cue("whoosh", c + 0.88, 0.35); cue("strain", c + 1.0, 0.45); cue("boing", c + 1.7, 0.45)
ev["back"] = R(c + 2.4); ev["yank"] = R(c + 2.6); cue("whoosh", c + 2.6, 0.4); cue("thud", c + 2.85, 0.45)
c = say("o2_nar", c + 3.3)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3 «КАК НОСИТЕЛЬ»: "I think there's been a mix-up..." -> "Oh no, table six! Swapping it now." the octopus waves bye-bye, tomato soup lands; insert: the soup
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c0 = c + 0.25; c = say("o3_w", c0)
ev["lift"] = R(c - 0.9); cue("whoosh", c - 0.85, 0.3)
ev["bye"] = R(c + 0.05); cue("coo", c + 0.2, 0.35)
ev["cling"] = R(c + 0.55); cue("strain", c + 0.6, 0.4); ev["let"] = R(c + 1.35); cue("boing", c + 1.38, 0.45)
ev["soup"] = R(c + 1.7); cue("whoosh", c + 1.68, 0.35); cue("plop", c + 1.9, 0.5); cue("chime", c + 2.05, 0.45)
ev["back"] = R(c + 3.0)
c = say("o3_nar", c + 3.05)
c = say("o3_tip", c + 0.4); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4 «КОРОЛЕВСКИЙ ОТВЕТ»: the charming speech (the octopus blushes at "handsome"), Theo melts; "...I'll take him. He likes me." the octopus climbs onto his shoulder
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["blush"] = wat("o4_h", h0, 2)       # «handsome»
ev["fork"] = wat("o4_h", h0, 9)        # «hold my fork back» -> her fork, octopus lets go
cue("sparkle", ev["blush"] + 0.1, 0.35)
c0 = c + 0.6; c = say("o4_w", c0)
ev["climb"] = R(c0 + 0.3); cue("squelch", c0 + 0.4, 0.45); cue("squelch", c0 + 0.85, 0.4)
ev["hug"] = R(c + 0.15); cue("coo", c + 0.25, 0.45)
ev["kiss"] = R(c + 0.9); cue("pop", c + 0.95, 0.5); cue("sparkle", c + 1.0, 0.35)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.8), ev=ev)); t = c + 1.8

# ---- twist (music silent): her tomato soup arrives; the octopus on Theo's shoulder takes her spoon and quietly eats it; the chef in the kitchen hatch; the photo on the wall
s = t; ev = dict(beat=R(s))
ev["soup"] = R(s + 0.05); cue("plop", s + 0.15, 0.4)
ev["spoon"] = R(s + 0.75); cue("squelch", s + 0.8, 0.4)
ev["slurp"] = R(s + 1.3); cue("slurp", s + 1.35, 0.7)
ev["pat"] = R(s + 2.2); cue("gulp", s + 2.25, 0.5)
ev["shock"] = R(s + 2.6); cue("gasp", s + 2.65, 0.45)
c = say("end_c", s + 3.15)
ev["photo"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); cue("tada", c + 0.25, 0.4)
ev["wide"] = R(c + 1.5)
c = say("moral", c + 1.6)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
a0 = c + 0.35; c = say("ask", a0); cue("pop", a0 - 0.05, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.5), ev=dict(ask=R(a0)))); t = c + 1.5

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
cfg["chunks"] = {"o4_h": [["He's very handsome, Theo,", "Он очень симпатичный, Тео,"],
                          ["but I ordered a lunch", "но я заказывала обед,"],
                          ["that doesn't hold my fork back.", "который не держит мою вилку."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
