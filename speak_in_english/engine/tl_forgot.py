"""python3 tl_forgot.py -> eps/forgot/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "forgot"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = his car has just skidded back into the empty petrol station (tyre smoke), he jumps out; she stands with two coffees; his line at 0.2 s
cue("screech", 0.0, 0.7); cue("slam", 0.12, 0.5)
t = say("hook_m", 0.2)
hev = dict(peek=0.2)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["clock"] = wat("hook", t, 7)     # «вернулся через двадцать минут» -> insert: the shop clock, the minute hand sweeps 20 minutes
hev["wide"] = wat("hook", t, 11)     # «Четыре ответа» -> back to the forecourt
cue("whoosh", hev["clock"] - 0.05, 0.45); [cue("tick", hev["clock"] + 0.2 + i * 0.16, 0.45) for i in range(6)]; cue("ding", hev["clock"] + 1.2, 0.35); cue("whoosh", hev["wide"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.35), ev=hev)); t = e + 0.35

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> she barks like a caveman, he shrugs with both palms out; she squeezes the cups -> coffee squirts out of both lids
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_m", c0)
ev["shrug"] = R(c0 + 0.15)
ev["squirt"] = R(c + 0.12); cue("squirt", c + 0.2, 0.7); cue("boing", c + 0.25, 0.35)
ev["drip"] = R(c + 1.1); cue("plop", c + 1.15, 0.5)
c = say("o1_nar", c + 1.5)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "Me too! Why is it so quiet?" he smiles, contented; insert: her seat is covered with his sandwiches; her jaw drops
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_m", c0)
ev["seat"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.4); cue("crunch", c + 0.55, 0.65); cue("crunch", c + 0.95, 0.55)
ev["horror"] = R(c + 1.45); cue("gasp", c + 1.5, 0.6)
c = say("o2_nar", c + 2.05)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> calm facts; he apologises, walks to the car and opens her door like a chauffeur; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.45)
c0 = c + 0.3; c = say("o3_m", c0)
ev["walk"] = R(c + 0.1); cue("whoosh", c + 0.12, 0.35)
ev["door"] = R(c + 0.75); cue("creak", c + 0.8, 0.45)
ev["bow"] = R(c + 1.15); cue("chime", c + 1.2, 0.35)
ev["smile"] = R(c + 1.7)
c = say("o3_nar", c + 2.3)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line, she sips her free refill; he panics; "Please get in" -> on his knees wiping her seat with a cloth
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["sip"] = wat("o4_h", h0, 6); cue("gulp", ev["sip"] + 0.1, 0.5)          # «free refills»
ev["dar"] = wat("o4_h", h0, 8)                                              # «Honestly, darling»
ev["purpose"] = wat("o4_h", h0, 15); cue("sparkle", ev["purpose"], 0.35)    # «on purpose»
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.55)
c0 = c + 0.5; ev["kneel"] = R(c0 - 0.05); cue("thud", c0, 0.45)
c = say("o4_m", c0); cue("squeak", c0 + 0.6, 0.35); cue("squeak", c0 + 1.3, 0.35); cue("squeak", c0 + 2.0, 0.3)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.6), ev=ev)); t = c + 0.6

# ---- twist: beat (music silent): she opens the back door to get in — a strange granny with a basket is already sitting there; granny's line; shock; he grins sheepishly
s = t; ev = dict(beat=R(s))
ev["open"] = R(s + 0.35); cue("creak", s + 0.4, 0.45)
ev["reveal"] = R(s + 0.75); cue("boing", s + 0.8, 0.45)
c = say("end_g", s + 1.15)
ev["shock"] = R(c + 0.12); cue("gasp", c + 0.15, 0.6)
ev["grin"] = R(c + 0.85); cue("blink", c + 0.95, 0.5)
c = say("moral", c + 1.55)
ev["moral"] = R(c - D["moral"])
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
cfg["chunks"] = {"o4_h": [["Twenty minutes of silence and free refills.", "Двадцать минут тишины и бесплатный кофе."],
                          ["Honestly, darling, next time leave without me on purpose —", "Честно, дорогой, в следующий раз уезжай без меня нарочно —"],
                          ["I might not come back.", "я могу и не вернуться."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
