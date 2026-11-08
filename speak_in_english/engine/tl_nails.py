"""python3 tl_nails.py -> eps/nails/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "nails"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))

# character lines: word timings spread over the voiced segments measured from the takes (no aligner for EN lines)
SEG = {"hook_b": [("Nice nails.", 0.2, 1.08), ("How much did those cost?", 1.47, 2.70)],
       "o1_b": [("It's OUR money!", 0.02, 1.12), ("We have a spreadsheet!", 1.43, 2.61)],
       "o2_b": [("'Not much' isn't a number.", 0.02, 2.24)],
       "o4_h": [("Less than your new fishing rod.", 0.02, 1.70), ("And unlike the rod, these actually catch something —", 2.61, 5.27), ("compliments.", 6.15, 7.31)],
       "o3_h": [("Enough to make me happy.", 0.03, 1.61), ("That's all you need to know.", 1.92, 2.95)],
       "end_b": [("…Okay.", 0.02, 0.53), ("Same salon.", 0.83, 1.70), ("Mine was more expensive.", 2.02, 3.30)]}
def seg_words(lid):
    out = []
    for txt, a, b in SEG[lid]:
        ws = txt.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, x in zip(ws, wt): out.append([w, R(a + cc / tot * (b - a)), R(a + (cc + x) / tot * (b - a))]); cc += x
    return out
def word_times(lid):
    if lid in SEG: return seg_words(lid)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def wend(lid, t0, i): return R(t0 + word_times(lid)[i][2])

# ---- hook: frame 0 = she admires her fresh pink nails (sparkles), he leans in with a calculator, squinting. His line at 0.05 (voice at ~0.25)
cue("sparkle", 0.0, 0.5); cue("beep", 0.15, 0.3)
t = say("hook_b", 0.05); hev = dict()
hev["tap"] = R(0.05 + 1.5); cue("beep", hev["tap"], 0.35); cue("beep", hev["tap"] + 0.25, 0.35)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)                      # his close-up: squints, taps the calculator
cue("beep", t + 0.3, 0.3); cue("beep", t + 0.55, 0.3); cue("beep", t + 0.8, 0.3)
hev["nails"] = wat("hook", t, 8)                           # «маникюр.» -> insert: her hand, glossy pink nails, sparkles
hev["wide"] = wat("hook", t, 9)                            # «Четыре ответа» -> back to the living room
cue("whoosh", hev["nails"] - 0.05, 0.45); cue("sparkle", hev["nails"] + 0.15, 0.55); cue("whoosh", hev["wide"], 0.4); cue("register", hev["wide"] + 0.25, 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.35), ev=hev)); t = e + 0.35

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "It's OUR money! We have a spreadsheet!" he unrolls a spreadsheet down to the floor (and across it); insert of the rows; facepalm
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.2); cue("stamp", s + 0.75, 0.35)
c0 = c + 0.3; c = say("o1_b", c0)
ev["unroll"] = wat("o1_b", c0, 4)                          # «spreadsheet!»
cue("whoosh", ev["unroll"] - 0.05, 0.45); cue("spin", ev["unroll"] + 0.05, 0.45); cue("thud", ev["unroll"] + 0.75, 0.4)
ev["sheet"] = R(c + 0.12); cue("pop", c + 0.2, 0.4); cue("beep", c + 0.6, 0.3); cue("ding", c + 0.95, 0.35)   # insert: rows ... NAILS ???
ev["palm"] = R(c + 1.45); cue("thud", c + 1.5, 0.5)
c = say("o1_nar", c + 1.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "'Not much' isn't a number." he taps the calculator with a pen; insert: display NOT MUCH -> ERROR
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_b", c0)
ev["tap"] = wat("o2_b", c0, 3)                             # «number.»: pen taps
for k_ in range(3): cue("beep", ev["tap"] + k_ * 0.18, 0.4)
ev["calc"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.35)
for k_ in range(3): cue("beep", c + 0.35 + k_ * 0.17, 0.5)
ev["err"] = R(c + 0.95); cue("err", c + 0.95, 0.55)
ev["roll"] = R(c + 1.55)
c = say("o2_nar", c + 1.7)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> "...Fair enough. They do look great." he puts the calculator away in his pocket; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.0, 0.45)
c0 = c + 0.3; c = say("o3_b", c0)
ev["away"] = R(c + 0.1); cue("whoosh", c + 0.15, 0.35); cue("zip", c + 0.55, 0.4)
ev["smile"] = R(c + 0.9); cue("chime", c + 0.95, 0.3)
c = say("o3_nar", c + 1.25)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> in the pause after "...fishing rod." insert: the new rod in the corner with a big price tag; "compliments" sparkles;
#      "...The rod caught a boot once." -> insert: his phone photo, a wet boot on the hook
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["rod"] = R(h0 + 1.74); cue("whoosh", ev["rod"] - 0.05, 0.4); cue("register", ev["rod"] + 0.25, 0.5)
ev["back"] = R(h0 + 2.55)
ev["show"] = R(h0 + 5.35); ev["comp"] = R(h0 + 6.15); cue("sparkle", ev["comp"] + 0.05, 0.6); cue("chime", ev["comp"] + 0.4, 0.35)
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.45)
c0 = c + 0.5; c = say("o4_b", c0)
ev["photo"] = R(c + 0.12); cue("whoosh", c + 0.1, 0.35); cue("shutter", c + 0.35, 0.45); cue("plop", c + 0.7, 0.4)
ev["photo_e"] = R(c + 1.55)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.55), ev=ev)); t = c + 1.55

# ---- twist (music silent): she looks at his hands; he hides them behind his back; "...Okay. Same salon." he shows his glossy manicure;
#      after the line: insert of his hands; she gasps then laughs; moral: both show their nails
s = t; ev = dict(beat=R(s))
ev["look"] = R(s + 0.1)
ev["hide"] = R(s + 0.55); cue("whoosh", s + 0.55, 0.45); cue("gulp", s + 0.9, 0.4)
c0 = s + 1.3; c = say("end_b", c0)
ev["reveal"] = wat("end_b", c0, 1); cue("sparkle", ev["reveal"] + 0.05, 0.6)
ev["his"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); cue("ding", c + 0.35, 0.5)
ev["laugh"] = R(c + 1.35); cue("gasp", c + 1.38, 0.45)
c = say("moral", c + 1.9)
ev["both"] = R(c - D["moral"] + 0.1); cue("sparkle", ev["both"] + 0.4, 0.4)
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
cfg["chunks"] = {"o4_h": [["Less than your new fishing rod.", "Меньше, чем твоя новая удочка."],
                          ["And unlike the rod, these actually catch something —", "И в отличие от удочки, они хоть что-то ловят —"],
                          ["compliments.", "комплименты."]],
                 "o3_h": [["Enough to make me happy.", "Достаточно, чтобы я была счастлива."],
                          ["That's all you need to know.", "Больше тебе знать не нужно."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
