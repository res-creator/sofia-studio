"""python3 tl_bagofbags.py -> eps/bagofbags/timeline.json  (rubric «Наше за границей» (nashe4), 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "bagofbags"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
# o4_h (long character line, no aligner output): words spread inside the speech segments measured from the audio's pauses
SEG_O4 = [("Oliver,", 0.0, 0.56), ("that's not clutter.", 0.88, 1.98), ("That's three generations of shopping,", 2.31, 4.21), ("neatly folded.", 4.48, 5.38),
          ("Some families pass down jewellery.", 6.15, 7.82), ("We pass down bags.", 8.33, 9.40)]
def seg_words(segs):
    out = []
    for txt, a, b in segs:
        ws = txt.split(); wl = [len(w) + 1 for w in ws]; tot = sum(wl); cc = 0
        for w, l in zip(ws, wl): out.append([w, round(a + (b - a) * cc / tot, 3), round(a + (b - a) * (cc + l) / tot, 3)]); cc += l
    return out
def word_times(lid):
    if lid == "o4_h": return seg_words(SEG_O4)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    for i in range(1, len(out)):   # the aligner sometimes returns overlapping/out-of-order words: keep them monotonic
        if out[i][1] < out[i - 1][1]: out[i][1] = out[i - 1][1]
        if out[i][2] < out[i][1]: out[i][2] = out[i][1]
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def frac(lid, t0, f): return R(t0 + D[lid] * f)   # character lines have no word timings: approximate by the share of the line

# ---- hook: frame 0 = Oliver has just pulled the huge bag of bags out from under the sink and holds it up (bags spilling); his line at 0.2 s
cue("rustle", 0.0, 0.6); cue("creak", 0.05, 0.3)
t = say("hook_f", 0.2); cue("rustle_s", 1.3, 0.4)
hev = dict()
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["nest"] = wat("hook", t, 2)      # «главное сокровище» -> insert: the bags nest like a matryoshka, the tiniest says DO NOT TOUCH
hev["wide"] = wat("hook", t, 6)      # «Объясни ему — четыре способа» -> back to the kitchen
cue("whoosh", hev["nest"] - 0.05, 0.45); [cue("pop", hev["nest"] + 0.25 + i * 0.3, 0.45) for i in range(3)]; cue("ding", hev["nest"] + 1.2, 0.35); cue("whoosh", hev["wide"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Bags. Inside bags. Normal." — the bag in his hands starts to breathe by itself; "It's breathing!" — it puffs up huge, he holds it at arm's length
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
ev["breathe"] = R(c + 0.05); cue("breathe", c + 0.05, 0.6)
c0 = c + 0.7; c = say("o1_f", c0); cue("breathe", c0 + 0.9, 0.5)
ev["puff"] = R(c + 0.1); cue("breathe", c + 0.05, 0.8); cue("boing", c + 0.45, 0.35)
ev["sigh"] = R(c + 1.0); cue("deflate", c + 1.0, 0.45)
c = say("o1_nar", c + 1.45)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "It is for... future bags." — "Do they come from the future?" — he carefully peeks inside; insert: a blue time vortex in the bag; back: his hair blown up
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_f", c0)
ev["lean"] = frac("o2_f", c0, 0.45)
ev["vortex"] = R(c + 0.1); cue("warp", c + 0.1, 0.55); cue("tick", c + 0.4, 0.35); cue("tick", c + 0.7, 0.35); cue("tick", c + 1.0, 0.35)
ev["blown"] = R(c + 1.55); cue("boing", c + 1.6, 0.4)
c = say("o2_nar", c + 2.05)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> "We never throw them away. Waste not, want not." — he is impressed, folds his own bag neatly and pats the big one; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.3, 0.45)
c0 = c + 0.3; c = say("o3_f", c0)
ev["fold"] = R(c + 0.1); cue("rustle_s", c + 0.15, 0.5); cue("rustle_s", c + 0.5, 0.45)
ev["folded"] = R(c + 0.85); cue("chime", c + 0.85, 0.3)
c = say("o3_nar", c + 1.25)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line: three bags fan out of the big one (three generations), a neat folded triangle, the tiny bag held up like a jewel; "...Can I be adopted?" — happy tears
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["gens"] = wat("o4_h", h0, 5); [cue("pop", ev["gens"] + i * 0.18, 0.45) for i in range(3)]          # «three generations of shopping»
ev["neat"] = wat("o4_h", h0, 9); cue("rustle_s", ev["neat"], 0.45)                                     # «neatly folded»
ev["jewel"] = wat("o4_h", h0, 15); cue("sparkle", ev["jewel"] + 0.1, 0.45)                              # «Some families pass down jewellery»
ev["proud"] = wat("o4_h", h0, 16)                                                                         # «We pass down bags»
ev["moved"] = R(c + 0.05); cue("gasp", c + 0.08, 0.4)
c0 = c + 0.45; c = say("o4_f", c0)
ev["tears"] = R(c + 0.05); cue("plop", c + 0.2, 0.35); cue("plop", c + 0.5, 0.3)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.9), ev=ev)); t = c + 0.9

# ---- twist (music silent): a week later — Oliver flings open his own cupboard: a little bag with seven bags; "I've started my own. My mum's very worried." — insert: Mum's text; she is proud
s = t; ev = dict(beat=R(s))
ev["open"] = R(s + 0.35); cue("creak", s + 0.4, 0.45)
ev["reveal"] = R(s + 0.7); cue("tada", s + 0.75, 0.3); cue("rustle", s + 0.8, 0.35)
c = say("end_f", s + 1.1)
ev["phone"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("pop", c + 0.4, 0.5); cue("pop", c + 0.85, 0.45)
ev["proud"] = R(c + 1.55); cue("sparkle", c + 1.6, 0.4)
c = say("moral", c + 2.1)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); then the comment question (ask) big above the buttons
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
a0 = c + 0.35; cue("whoosh", a0 - 0.1, 0.45); c = say("ask", a0)
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
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric", "absurd", "comment_q"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Oliver, that's not clutter.", "Оливер, это не хлам."],
                          ["That's three generations of shopping, neatly folded.", "Это три поколения покупок, аккуратно сложенных."],
                          ["Some families pass down jewellery.", "Одни семьи передают по наследству драгоценности."],
                          ["We pass down bags.", "Мы — пакеты."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
