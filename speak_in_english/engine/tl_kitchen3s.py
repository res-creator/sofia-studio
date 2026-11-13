"""python3 tl_kitchen3s.py -> eps/kitchen3s/timeline.json  (rubric quick3s «Успей за 3 секунды»: hook / r1..r6 / bonus / end (twist + score) / outro (+ ask), no levels)
Each round: the Russian word card + a 3-second ticking timer (no voice) -> the tip voice says the English word (pink plate) -> a silent physical gag.
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "kitchen3s"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
        if out and a < out[-1][2]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, R(a), R(b)])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
TIMER = 3.0

# ---- hook: frame 0 = she wears the colander like a helmet (title overlay), her line at 0.2 s; narrator teaser over the wide kitchen + the sweating cactus
cue("pop", 0.0, 0.35)
t = say("hook_h", 0.2)
hev = dict(talk=0.2)
t += 0.25
hev["nar"] = R(t); e = say("hook", t)
hev["wide"] = R(t - 0.05)                  # «Шесть вещей с кухни» -> the wide kitchen (cat, fridge, cactus)
hev["cactus"] = wat("hook", t, 4)          # «три секунды» -> close-up: the cactus in a chef's hat (a first drop of sweat) + a ring
hev["back"] = wat("hook", t, 8)            # «Считай баллы» -> back to her
cue("whoosh", hev["cactus"] - 0.03, 0.35); cue("tick", hev["cactus"] + 0.2, 0.5); cue("tick", hev["cactus"] + 0.7, 0.5); cue("whoosh", hev["back"] - 0.03, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.2), ev=hev)); t = e + 0.2

def timer(s, ev):
    """card + 3 s ticking timer from s; returns the time the timer ends"""
    cue("whoosh", s, 0.55); cue("pop", s + 0.08, 0.6)
    ev["card"] = R(s); ev["tm0"] = R(s + 0.3); ev["tm1"] = R(s + 0.3 + TIMER)
    for k in range(6): cue("tick", s + 0.3 + k * 0.5, 0.75 if k % 2 == 0 else 0.4)
    cue("ding", s + 0.3 + TIMER - 0.02, 0.45)
    return s + 0.3 + TIMER

GAGS = {   # per round: gag length + cues relative to the gag start
    "r1": (2.9, [("whoosh", 0.05, 0.35), ("plop", 0.45, 0.6), ("plop", 0.75, 0.45), ("drop", 1.05, 0.35), ("boing", 1.55, 0.45)]),
    "r2": (2.7, [("zip", 0.1, 0.5), ("zip", 0.45, 0.5), ("zip", 0.8, 0.5), ("zip", 1.15, 0.5), ("pop", 1.55, 0.55), ("deflate", 1.75, 0.4)]),
    "r3": (2.9, [("plop", 0.35, 0.6), ("plop", 0.7, 0.45), ("gulp", 1.35, 0.55), ("coo", 1.9, 0.4)]),
    "r4": (2.9, [("whoosh", 0.1, 0.3), ("whoosh", 0.5, 0.3), ("scratch", 1.0, 0.3), ("plop", 1.35, 0.6), ("thud", 1.5, 0.45), ("coo", 2.1, 0.35)]),
    "r5": (3.0, [("clank", 0.45, 0.55), ("boing", 0.6, 0.35), ("nope", 1.4, 0.5), ("squeak", 1.9, 0.4)]),
    "r6": (2.9, [("whoosh", 0.25, 0.5), ("plop", 0.75, 0.7), ("boing", 1.2, 0.35), ("feather", 1.7, 0.35)]),
}
for i in range(1, 7):
    L = f"r{i}"; s = t; ev = {}
    c = timer(s, ev)
    c = say(f"t{i}_tip", c + 0.08); ev["tip"] = R(c - D[f"t{i}_tip"])
    cue("sparkle", ev["tip"] - 0.02, 0.35)
    g0 = c + 0.1; ev["gag"] = R(g0); gl, cs = GAGS[L]
    for n, dt, g in cs: cue(n, g0 + dt, g)
    scenes.append(dict(id=L, s=R(s), e=R(g0 + gl), ev=ev)); t = g0 + gl

# ---- bonus: «Бонус: крышка...» (she searches the cupboards), timer «КРЫШКА», "lid", the lid avalanche (she ends up knee-deep in lids)
s = t; ev = dict(nar=R(s + 0.1)); cue("whoosh", s, 0.5); cue("creak", s + 0.6, 0.35); cue("creak", s + 1.6, 0.35)
c = say("bonus", s + 0.1)
c = timer(c + 0.15, ev)
c = say("bonus_tip", c + 0.08); ev["tip"] = R(c - D["bonus_tip"]); cue("sparkle", ev["tip"] - 0.02, 0.35)
g0 = c + 0.1; ev["open"] = R(g0); ev["fall"] = R(g0 + 0.35)
cue("creak", g0, 0.5)
for k in range(9): cue("clank", g0 + 0.35 + k * 0.14, 0.5 - k * 0.025)
cue("drop", g0 + 0.5, 0.45); cue("drop", g0 + 1.1, 0.4); cue("clank", g0 + 1.75, 0.35)
scenes.append(dict(id="bonus", s=R(s), e=R(g0 + 2.4), ev=ev)); t = g0 + 2.4

# ---- end: (music silent) the beat in the lids, "Every lid... except the one I need." (she holds the pot without a lid), then the score scale card
s = t; ev = dict(beat=R(s))
c = say("end_h", s + 0.55)
ev["pot"] = R(s + 0.2)
c0 = c + 0.4; ev["score"] = R(c0); cue("whoosh", c0 - 0.05, 0.45)
c = say("score", c0)
wt = word_times("score")
ev["s6"] = R(c0 + wt[0][1]); ev["s3"] = R(c0 + wt[4][1]); ev["s0"] = R(c0 + wt[6][1])
cue("pop", ev["s6"], 0.5); cue("pop", ev["s3"], 0.5); cue("pop", ev["s0"], 0.5); cue("boing", R(c0 + wt[-1][1]), 0.3)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: «СКОЛЬКО ИЗ 6?» 0–2 / 3–4 / 5–6, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question (ask)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for k in range(3): cue("pop", s + 0.45 + k * 0.22, 0.45)
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
