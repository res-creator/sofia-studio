"""python3 tl_snore.py -> eps/snore/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "snore"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))

def voiced(lid):   # (start, end) of the voiced part and the inner gaps > 0.25 s (sentence breaks)
    x, sr = sf.read(f"{VO}/{lid}.wav"); x = x if x.ndim == 1 else x.mean(1); hop = sr // 100
    e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]); q = e > e.max() * 0.04
    idx = np.where(q)[0]; a, b = idx[0] / 100, idx[-1] / 100 + 0.01
    gaps, i = [], idx[0]
    while i < idx[-1]:
        if not q[i]:
            j = i
            while not q[j]: j += 1
            if (j - i) / 100 > 0.25: gaps.append((i / 100, j / 100))
            i = j
        else: i += 1
    return a, b, gaps
def est_words(lid):  # char-proportional word timings inside the voiced part; sentences snap to the detected long pauses
    text = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]); words = text.split()
    a, b, gaps = voiced(lid)
    sent, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.!?]$", w) or w.endswith("—"): sent.append(cur); cur = []
    if cur: sent.append(cur)
    # spans: split [a, b] at the gaps if their count matches the sentence breaks, else one span
    if len(gaps) == len(sent) - 1: edges = [a] + [x for g in gaps for x in g] + [b]; spans = [(edges[2 * i], edges[2 * i + 1]) for i in range(len(sent))]
    else: sent = [words]; spans = [(a, b)]
    out = []
    for ws, (s0, s1) in zip(sent, spans):
        wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; pz = [2.0 if re.search(r"[,—…]$", w) else 0 for w in ws]
        tot = sum(wts) + sum(pz[:-1]); cc = 0
        for w, wt, p_ in zip(ws, wts, pz):
            t0 = s0 + cc / tot * (s1 - s0); cc += wt; out.append([w, R(t0), R(s0 + cc / tot * (s1 - s0))]); cc += p_
    return out
def word_times(lid):
    try: return [list(x) for x in json.load(open(f"{VO}/{lid}.words.json"))]
    except FileNotFoundError: return est_words(lid)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = the bedroom in the morning: she (pyjamas, dark circles, messy hair) by the bed, he fresh with a coffee mug, steam; the cat on the bed.
cue("tweet", 0.0, 0.35); cue("slurp", 0.05, 0.4)
t = say("hook_b", 0.2); hev = dict(sip=0.0)
hev["tractor"] = wat("hook_b", 0.2, 7); cue("pop", hev["tractor"] + 0.05, 0.5)   # «Like a tractor» -> a little tractor pops by her head
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["night"] = R(t)                    # «Он храпит всю ночь» -> flashback: night, HE snores (ZZZ, the picture shakes), she lies awake, eyes wide
cue("snore", t + 0.05, 0.55); cue("snore", t + 0.75, 0.45)
hev["morning"] = wat("hook", t, 5)     # «утром говорит, что храпела ты» -> morning: he points at her with an open palm, smiling
cue("whoosh", hev["morning"] - 0.05, 0.4); cue("tweet", hev["morning"], 0.3)
hev["wide"] = wat("hook", t, 10)       # «Четыре ответа» -> the room
cue("whoosh", hev["wide"] - 0.03, 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.35), ev=hev)); t = e + 0.35

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» "Me no! You snore!" -> "Me? I was asleep. I'd know." he nods confidently, then a smug loud sip of coffee
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("stamp", wat("o1_h", s + 0.35, 2), 0.3)
c0 = c + 0.3; c = say("o1_b", c0); ev["nod"] = R(c0)
ev["sip"] = R(c + 0.05); cue("slurp", c + 0.12, 0.6); cue("ding", c + 0.65, 0.25)
c = say("o1_nar", c + 0.85)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» "I'm not sure it was me, actually." -> "Who else? The cat?" (open palm at the bed) -> the cat lifts its head, outraged
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_b", c0); ev["point"] = wat("o2_b", c0, 2)
ev["cat"] = R(c + 0.05); cue("meow", c + 0.45, 0.6); cue("brow", c + 0.3, 0.35)
c = say("o2_nar", c + 1.5)
ev["glare"] = R(c - 0.6)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» she plays the tape: phone insert, then the room shakes (picture on the wall, the cat bristles, his coffee jumps); he is stunned
s = t; ev = opt_start(s)
h0 = s + 0.35; c = say("o3_h", h0); ev["phone"] = wat("o3_h", h0, 1)
ev["play"] = R(c + 0.1); cue("click", c + 0.15, 0.5); cue("tape", c + 0.25, 0.9)
ev["shake"] = R(c + 1.15); cue("bigsnore", c + 1.15, 0.85); cue("rattle", c + 1.2, 0.6)
ev["stop"] = R(c + 2.35); cue("click", c + 2.35, 0.5)
c0 = c + 2.55; c = say("o3_b", c0)
c = say("o3_nar", c + 0.3)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» the neighbours' note under the door; he sweats; "…I'll buy nose strips." -> mirror: he sticks a nose strip on, sad
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ow = word_times("o4_h")
ev["note"] = wat("o4_h", h0, 2); cue("paper", ev["note"] + 0.05, 0.5)                     # «neighbours»
ev["back"] = R(h0 + next(w[1] for w in ow if w[0].lower().startswith("shall")) - 0.15)   # «Shall I tell them it was me?» -> back on them
ev["sweat"] = R(ev["back"] + 0.2); ev["smug"] = R(c - 0.6); cue("sparkle", c - 0.4, 0.35)
c0 = c + 0.4; c = say("o4_b", c0)
ev["mirror"] = R(c + 0.0); cue("whoosh", c, 0.35); ev["stick"] = R(c + 0.7); cue("strip", c + 0.72, 0.6); ev["sigh"] = R(c + 1.25); cue("deflate", c + 1.3, 0.35)
scenes.append(dict(id="o4", s=R(s), e=R(c + 2.3), ev=ev)); t = c + 2.3

# ---- twist (music silent): «НОЧЬЮ» he sleeps with the strip, quiet as a mouse; SHE snores like a tractor (picture shakes, the cat hides);
#      «УТРОМ» he holds up his phone: "Morning, tractor. Want to hear YOUR tape?" -> phone insert (her recording), she covers her face; moral
s = t; ev = dict(night=R(s))
cue("tinysnore", s + 0.35, 0.45); cue("bigsnore", s + 0.95, 0.75); cue("rattle", s + 1.0, 0.5); cue("bigsnore", s + 2.0, 0.75); cue("rattle", s + 2.05, 0.5); cue("tinysnore", s + 2.75, 0.4)
ev["morning"] = R(s + 3.4); cue("whoosh", s + 3.4, 0.4); cue("tweet", s + 3.45, 0.35)
c0 = s + 3.65; c = say("end_b", c0)
ev["tape"] = wat("end_b", c0, 5)        # «Want to hear YOUR tape?» -> he turns the phone to her
ev["play"] = R(c + 0.05); cue("click", c + 0.08, 0.5); cue("tape", c + 0.15, 0.85)
ev["react"] = R(c + 1.15); cue("gasp", c + 1.18, 0.5)
c = say("moral", c + 1.5)
ev["wave"] = R(c - 1.3)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4

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
    sp["words"] = word_times(sp["id"])
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Last night the neighbours asked if we were building an extension.", "Вчера соседи спросили, не делаем ли мы пристройку."],
                          ["Shall I tell them it was me?", "Сказать им, что это была я?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2), s_["words"] if s_["who"] != "nar" else "") for s_ in speech]
