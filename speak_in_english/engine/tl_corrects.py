"""python3 tl_corrects.py -> eps/corrects/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "corrects"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    if lid == "o4_h": return [list(x) for x in w]   # segment-aligned EN words (see chunks), "—" kept as its own word
    w = sorted(w, key=lambda x: x[1]); out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def scrib(t0, d, g=0.45):
    n = max(1, int(d / 0.5)); [cue("scribble", t0 + i * 0.5, g) for i in range(n)]

# ---- hook: frame 0 = a candle-lit date; he leans over her napkin with a big red pen, correcting her: "Small thing: it's 'I've been', not 'I was'."
scrib(0.0, 1.0, 0.4)
t = say("hook_d", 0.2)
hev = dict(grade=R(t - 0.2)); cue("scribble", t - 0.2, 0.45); cue("pop", t + 0.05, 0.4)          # he adds «B+» and circles it
t += 0.25
hev["nar"] = R(t); e = say("hook", t)
hev["nap"] = R(t - 0.05); cue("whoosh", t - 0.08, 0.45); cue("ding", t + 0.6, 0.35)               # insert: the napkin — «I was» struck out, «I've been», «B+»
hev["wide"] = wat("hook", t, 7) - 0.05                                                               # «Какой ответ…» -> back to the table: he clicks the pen proudly, she stares
cue("whoosh", hev["wide"], 0.35); [cue("click", hev["wide"] + 0.25 + i * 0.22, 0.45) for i in range(3)]
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.45), ev=hev)); t = e + 0.45

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> she slaps the table: "Stop teach me!"; he corrects even that; insert: «teach» -> «teachING» with an arrow; steam from her ears
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("thud", s + 0.45, 0.55)
c0 = c + 0.3; c = say("o1_d", c0)
ev["arrow"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); scrib(c + 0.35, 1.5, 0.5); cue("pop", c + 1.7, 0.45)
ev["steam"] = R(c + 2.15); cue("boing", c + 2.2, 0.35); cue("strain", c + 2.25, 0.3)
c = say("o1_nar", c + 2.75)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "Thank you, I'm still learning." / "No problem! And it's 'think', not 'sink'." — insert: he draws a sinking ship on the napkin; her slow facepalm
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_d", c0)
ev["ship"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); scrib(c + 0.3, 1.5, 0.5); cue("drop", c + 1.9, 0.4); cue("plop", c + 2.1, 0.35)
ev["palm"] = R(c + 2.45); cue("thud", c + 2.8, 0.3)
c = say("o2_nar", c + 3.15)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> the soft boundary; he slides the pen into his pocket next to the five others and blushes; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35)
c0 = c + 0.3; c = say("o3_d", c0)
ev["pocket"] = R(c + 0.1); cue("whoosh", c + 0.15, 0.3); cue("click", c + 0.75, 0.55)
ev["blush"] = R(c + 1.2); cue("sparkle", c + 1.25, 0.3)
c = say("o3_nar", c + 1.95)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; she takes his pen; insert: she writes «MANNERS» on his napkin, grade «C-», circles it; "…Is there extra credit?"
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["take"] = R(h0 + word_times("o4_h")[9][1] - 0.1); cue("whoosh", ev["take"], 0.4)   # on «shall I circle that…» the pen changes hands
ev["circle"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); scrib(c + 0.3, 1.0, 0.5); cue("scribble", c + 1.4, 0.55); cue("gasp", c + 1.9, 0.35)
c0 = c + 2.45; c = say("o4_d", c0)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.1), ev=ev)); t = c + 0.1

# ---- twist (music silent from here to the moral): he takes a pen from his pocket, writes on a fresh napkin, slides it to her;
# "No corrections. Just one question." — insert: «A+  FRIDAY?»; she blushes and smiles; moral
s = t; ev = dict(beat=R(s))
ev["write"] = R(s); scrib(s + 0.35, 1.0, 0.45)
ev["slide"] = R(s + 1.45); cue("whoosh", s + 1.5, 0.45)
c = say("end_d", s + 2.15)
ev["fri"] = R(c + 0.1); cue("ding", c + 0.3, 0.45); cue("sparkle", c + 0.6, 0.4)
ev["yes"] = R(c + 2.0); cue("blink", c + 2.15, 0.5)
c = say("moral", c + 3.15)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); then the comment question (ask) big above the buttons
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
ask0 = c + 0.45; c = say("ask", ask0); cue("pop", ask0 - 0.05, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.0), ev=dict(ask=R(ask0)))); t = c + 1.0

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
cfg["chunks"] = {"o4_h": [["Your grammar's flawless, darling.", "Грамматика у тебя безупречная, дорогой."],
                          ["Shame about the manners —", "Жаль, что с манерами хуже —"],
                          ["shall I circle that for you?", "обвести тебе это?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
