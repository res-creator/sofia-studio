"""python3 tl_taxi3s.py -> eps/taxi3s/timeline.json  (rubric quick3s «Успей за 3 секунды», no levels):
hook / r1..r6 (Russian phrase + 3 s timer, no voice -> the tip voice says the English answer -> silent gag) / end (twist) / score / outro (+ ask).
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "taxi3s"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        if out and a < out[-1][1]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = the cab (side cutaway): she has just jumped in (bag, hairbrush, coffee), Ray turns round; his line at 0.2 s
cue("slam", 0.0, 0.55); cue("traffic", 0.0, 0.5)
t = say("hook_r", 0.2)
hev = dict()
t += 0.35
hev["nar"] = R(t); e = say("hook", t)
hev["her"] = R(t - 0.02)                  # «Шесть фраз для такси» -> her close-up, juggling brush + coffee
hev["dash"] = wat("hook", t, 4)           # «три секунды на каждую» -> the dashboard granny figurine nodding
hev["wide"] = wat("hook", t, 8)           # «Считай баллы» -> back to the wide
cue("whoosh", hev["dash"] - 0.03, 0.35); cue("boing", hev["dash"] + 0.1, 0.3); cue("whoosh", hev["wide"] - 0.03, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

# ---- 6 rounds: card + 3 s timer (ticks, no voice) -> the tip says the answer -> the gag
GAG = {1: 1.55, 2: 2.0, 3: 2.15, 4: 2.45, 5: 2.1, 6: 2.1}    # seconds of gag after the tip line ends
def round_(n, gag):
    s = t; ev = dict(card=R(s))
    cue("whoosh", s, 0.55); cue("pop", s + 0.06, 0.6)
    for k in range(3): cue("tick", s + 0.3 + k, 0.9); cue("tick", s + 0.8 + k, 0.45)
    ev["up"] = R(s + 3.3); cue("buzz", s + 3.25, 0.35)
    a = s + 3.4; ev["ans"] = R(a); c = say(f"t{n}_tip", a); cue("ding", a - 0.02, 0.4)
    gag(ev, a, c)
    e_ = c + GAG[n]
    scenes.append(dict(id=f"r{n}", s=R(s), e=R(e_), ev=ev)); return e_
def g1(ev, a, c):   # mascara on the go -> bump -> the lash line up to the eyebrow
    ev["bump"] = R(c + 0.15); cue("thud", c + 0.15, 0.55); ev["look"] = R(c + 0.7); cue("boing", c + 0.75, 0.35)
def g2(ev, a, c):   # the window rolls down -> a pigeon flies in and calmly sits next to her
    ev["win"] = R(a + 0.05); cue("zip", a + 0.1, 0.4)
    ev["fly"] = R(c + 0.1); cue("feather", c + 0.1, 0.7); ev["land"] = R(c + 0.8); cue("coo", c + 0.85, 0.5)
def g3(ev, a, c):   # Ray's stern eyes in the mirror -> she buckles up, the pigeon too (tiny belt)
    ev["mirror"] = R(a - 0.05); cue("whoosh", a - 0.05, 0.3)
    ev["back"] = R(c + 0.35); ev["click"] = R(c + 0.7); cue("click", c + 0.75, 0.8); ev["pclick"] = R(c + 1.35); cue("click", c + 1.4, 0.55); cue("coo", c + 1.5, 0.3)
def g4(ev, a, c):   # Ray pulls on racing gloves -> the cab roars off -> a granny on a bike with courgettes overtakes it
    ev["gloves"] = R(a + 0.1); cue("zip", a + 0.2, 0.4); cue("zip", a + 0.75, 0.4)
    ev["ext"] = R(c + 0.25); cue("vroom", c + 0.25, 0.7); cue("whoosh", c + 0.3, 0.35)
    ev["bike"] = R(c + 0.85); cue("bell", c + 1.1, 0.5); ev["passed"] = R(c + 1.9)
def g5(ev, a, c):   # the cab stops right in the middle of a huge puddle -> her white sneakers
    ev["brake"] = R(a + 0.05); cue("screech", a + 0.05, 0.55); ev["splash"] = R(a + 0.75); cue("splash", a + 0.75, 0.7)
    ev["shoes"] = R(c + 0.5); cue("whoosh", c + 0.48, 0.3); cue("drip", c + 0.9, 0.5)
def g6(ev, a, c):   # Ray solemnly puts one tiny coin into his wallet, with both hands
    ev["coin"] = R(a + 0.1); cue("sparkle", a + 0.4, 0.4); ev["wallet"] = R(c + 0.8); cue("register", c + 1.0, 0.45)
for n, g in enumerate([g1, g2, g3, g4, g5, g6], 1): t = round_(n, g)

for k in range(1, int(t // 7) + 1): cue("traffic", k * 7.0 - 0.5, 0.45)   # city traffic bed under the cab scenes
# ---- twist (music silent): she runs through the puddle to the office — locked, dark inside; Ray lowers the window: "Miss... it's Saturday."
s = t; ev = dict(run=R(s)); cue("splash", s + 0.25, 0.45); cue("splash", s + 0.6, 0.35)
ev["door"] = R(s + 1.05); cue("knock", s + 1.1, 0.6)
ev["cab"] = R(s + 1.6); cue("zip", s + 1.75, 0.35)
c = say("end_r", s + 2.05)
ev["pigeon"] = R(c + 0.15); cue("coo", c + 0.25, 0.35)
ev["her"] = R(c + 1.0)
c = say("end_h", c + 1.05)
ev["back"] = R(c + 0.15); cue("slam", c + 0.2, 0.4)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- score: back in the cab, the score card (6 / 3 / 0) pops on the narrator's numbers
s = t; ev = dict()
c = say("score", s + 0.25)
for k, i in zip(["s6", "s3", "s0"], [0, 6, 9]): ev[k] = wat("score", s + 0.25, i); cue("pop", ev[k], 0.5)
scenes.append(dict(id="score", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

cue("traffic", scenes[-1]["s"], 0.4)
# ---- end screen: СКОЛЬКО ИЗ 6? 0–2 / 3–4 / 5–6, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question (ask)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
for k in range(3): cue("pop", s + 0.35 + k * 0.15, 0.45)
c = say("outro", s + 0.15)
a0 = c + 0.35; c = say("ask", a0); cue("pop", a0 - 0.05, 0.5)
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
