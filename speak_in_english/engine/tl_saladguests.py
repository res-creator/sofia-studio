"""python3 tl_saladguests.py -> eps/saladguests/timeline.json  (rubric types4 «4 типа гостей», no levels: hook / t1 / t2 / t3 / t4 / end (night twist) / outro (+ ask))
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}.
The British tip voice ('tipgb' in the cast) is written as who='tip' so UI.captions draws the pink tip plate and the bubbles skip it."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "saladguests"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=("tip" if l[1] == "tipgb" else l[1]), text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
# t3_greg has no aligner output: words spread over its voiced segments (found from the pauses in the wav; the groan comes first)
G_SEG = [(0.96, 2.12, "This is too much..."), (2.67, 3.60, "Oh, go on then,"), (3.88, 4.85, "one more spoonful.")]
def seg_words(segs):
    out = []
    for a, b, s in segs:
        ws = s.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, k in zip(ws, wt): out.append([w, R(a + cc / tot * (b - a)), R(a + (cc + k) / tot * (b - a))]); cc += k
    return out
def word_times(lid):
    if lid == "t3_greg": return seg_words(G_SEG)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        if out and a < out[-1][1]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = the festive table, the salad basin on its own chair (napkin bib + party hat), the hostess with the ladle; her line at 0.2 s
cue("pop", 0.05, 0.35)
t = say("hook_h", 0.2); hev = dict(ladle=0.2)
cue("plop", 0.75, 0.45)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["basin"] = wat("hook", t, 3)       # «у таза салата» -> close-up: the basin on its chair, hat, napkin, spoon standing upright
hev["guests"] = wat("hook", t, 5)      # «Ты какой номер?» -> wide: the four guests hold up their plates
cue("whoosh", hev["basin"] - 0.03, 0.35); cue("boing", hev["basin"] + 0.25, 0.35); cue("whoosh", hev["guests"] - 0.03, 0.3); cue("clank", hev["guests"] + 0.15, 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.25), ev=hev)); t = e + 0.25

def ch_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(label=R(s))

# ---- 01 · ANOTHER (Theo): "Can I have another plate?" -> she ladles, he scrapes it clean in a blink, the plate lands on his tower of spotless plates, another plate is up
s = t; ev = ch_start(s)
c = say("t1_theo", s + 0.35)
ev["serve"] = R(c + 0.1); cue("plop", c + 0.4, 0.55)
ev["gulp"] = R(c + 0.75); cue("gulp", c + 0.8, 0.5); cue("sparkle", c + 1.15, 0.45)
ev["stack"] = R(c + 1.35); cue("clank", c + 1.45, 0.55)
ev["plate2"] = R(c + 1.75); cue("whoosh", c + 1.75, 0.3)
c = say("t1_tip", c + 2.2); cue("ding", c - D["t1_tip"] + 0.05, 0.5)
n0 = c + 0.3; c = say("t1_nar", n0)
ev["grow"] = [wat("t1_nar", n0, 1), wat("t1_nar", n0, 3), wat("t1_nar", n0, 5)]   # «одну» «одну» «ещё» -> the tower grows by one plate each time
for g_ in ev["grow"]: cue("clank", g_, 0.45)
scenes.append(dict(id="t1", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- 02 · ENOUGH (Priscilla): she covers her plate with her palm; the hostess calmly ladles the salad right onto her palm
s = t; ev = ch_start(s)
ev["cover"] = R(s + 0.2); cue("thud", s + 0.3, 0.35)
c = say("t2_prisc", s + 0.4)
ev["serve"] = R(c + 0.25); cue("whoosh", c + 0.3, 0.3); cue("plop", c + 0.75, 0.6)
ev["palm"] = R(c + 0.85)                # close-up: salad on her palm
ev["shock"] = R(c + 1.8); cue("gasp", c + 1.85, 0.45)
c = say("t2_tip", c + 2.55); cue("ding", c - D["t2_tip"] + 0.05, 0.5)
n0 = c + 0.3; c = say("t2_nar", n0)
ev["again"] = wat("t2_nar", n0, 2); cue("plop", ev["again"] + 0.25, 0.5)   # «Хозяйка...» -> one more ladle on the palm
scenes.append(dict(id="t2", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- 03 · TOO MUCH (Greg): groans, leans back (the chair creaks), pushes the plate away... and pulls it right back; one more spoonful
s = t; ev = ch_start(s); g0 = s + 0.35
c = say("t3_greg", g0); cue("strain", g0 + 0.15, 0.55)
ev["push"] = R(g0 + 1.0); cue("whoosh", g0 + 1.05, 0.3)
ev["pull"] = R(g0 + 2.65); cue("whoosh", g0 + 2.7, 0.35); cue("strain", g0 + 2.75, 0.4)
ev["spoon"] = R(g0 + 3.9); cue("plop", g0 + 4.25, 0.5)
ev["creak"] = R(c + 0.2); cue("creak", c + 0.25, 0.6); cue("boing", c + 0.75, 0.35)
c = say("t3_tip", c + 1.3); cue("ding", c - D["t3_tip"] + 0.05, 0.5)
n0 = c + 0.3; c = say("t3_nar", n0)
ev["spoon2"] = wat("t3_nar", n0, 4); cue("gulp", ev["spoon2"] + 0.3, 0.45)   # «Но ложечку» -> he eats one more spoonful
scenes.append(dict(id="t3", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- 04 · A LITTLE (Mrs Higgins): a tiny pinch -> the hostess builds a mound higher than her hairdo; on «полтаза» the basin is half empty
s = t; ev = ch_start(s)
c = say("t4_higg", s + 0.35)
ev["serve"] = R(c + 0.15)
ev["heap"] = [R(c + 0.45), R(c + 0.95), R(c + 1.45)]
for h_ in ev["heap"]: cue("plop", h_ + 0.1, 0.55)
ev["peek"] = R(c + 2.1); cue("squeak", c + 2.2, 0.4)
c = say("t4_tip", c + 2.7); cue("ding", c - D["t4_tip"] + 0.05, 0.5)
n0 = c + 0.3; c = say("t4_nar", n0)
ev["half"] = wat("t4_nar", n0, 6) - 0.05; cue("whoosh", ev["half"], 0.35); cue("boing", ev["half"] + 0.3, 0.35)   # «полтаза» -> the basin, half empty
scenes.append(dict(id="t4", s=R(s), e=R(c + 0.5), ev=ev)); t = c + 0.5

# ---- twist (music silent): night, kitchen, light only from the open fridge; the four guests eat from the basin with ONE spoon in turns; the hostess in her dressing gown in the doorway
s = t; ev = dict(beat=R(s))
cue("creak", s + 0.05, 0.5); cue("hum", s + 0.1, 0.35)
ev["pass"] = [R(s + 0.35), R(s + 1.05), R(s + 1.75), R(s + 2.45)]   # the spoon goes round: Greg, Priscilla, Mrs Higgins, Theo
for p_ in ev["pass"]: cue("gulp", p_ + 0.25, 0.35)
ev["door"] = R(s + 3.1); cue("knob", s + 3.15, 0.45)    # cut: the hostess in the doorway
c = say("end_theo", s + 3.95)
ev["freeze"] = R(c + 0.1); cue("scratch", c + 0.12, 0.35)
c = say("moral", c + 0.55)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: КАКОЙ ТЫ ГОСТЬ? buttons 1-4 with the type names, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question on «ask»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i in range(4): cue("pop", s + 0.3 + i * 0.22, 0.45)
a0 = c + 0.35; c = say("ask", a0); cue("pop", a0 - 0.05, 0.5)
for i in (3, 4, 5, 7): cue("pop", wat("ask", a0, i), 0.4)
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
cfg["chunks"] = {"t3_greg": [["This is too much...", "Это слишком много…"], ["Oh, go on then, one more spoonful.", "Ну ладно, уговорили, ещё ложечку."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["who"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
