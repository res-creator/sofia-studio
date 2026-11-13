"""python3 tl_pickles.py -> eps/pickles/timeline.json  (rubric «Наше за границей», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "pickles"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))

def spread(words, a, b):   # words spread over [a, b] by letter count
    wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]; tot = sum(wts); out = []; cc = 0
    for w, x in zip(words, wts): out.append([w, R(a + (b - a) * cc / tot), R(a + (b - a) * (cc + x) / tot)]); cc += x
    return out
# o4_h: chunk boundaries from the pauses in the audio (0-3.30 | 3.58-5.32 | 6.01-end)
O4 = [("Officer, that jar has survived three winters", 0.0, 3.30), ("and two family weddings.", 3.58, 5.32), ("Your scanner is the least scary thing it's ever met.", 6.01, D["o4_h"] - 0.05)]
O4W = sum((spread(s.split(), a, b) for s, a, b in O4), [])
def word_times(lid):
    if lid == "o4_h": return [list(x) for x in O4W]
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    if lid == "moral":   # the aligner squashed the tail into 0.5 s -> spread «границы … никогда» evenly over the spoken part
        return [list(w[0])] + spread([x[0] for x in w[1:] if x[0] != "—"], 0.64, D["moral"] - 0.12)
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = customs desk, the 3-litre jar of pickles on the belt, Officer Pike bends over it with a magnifier; his line at 0.2 s
cue("beep", 0.0, 0.5); cue("hum", 0.05, 0.25)
hev = {}
c = say("hook_c", 0.2)
hev["xray"] = R(c + 0.25); cue("whoosh", c + 0.22, 0.45); cue("beep", c + 0.35, 0.45)
t = c + 0.3; hev["nar"] = R(t); e = say("hook", t)
hev["wide"] = wat("hook", t, 4) - 0.05                  # «Какой ответ спасёт огурцы?» -> back to the desk, gnome on the shelf
cue("whoosh", hev["wide"], 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Cucumber. Grandma. Mine!" (she slaps the counter on each word); "Your grandma is in the jar?" he recoils;
#      the alarm beacon spins, both of them freeze; a WANTED poster with a granny drops onto the wall
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
for w in (0.0, 1.25, 2.1): cue("thud", s + 0.35 + w + 0.1, 0.35)
c0 = c + 0.3; c = say("o1_c", c0)
ev["recoil"] = R(c0 + 0.85); cue("boing", c0 + 0.9, 0.35)
ev["alarm"] = R(c + 0.12); cue("siren", c + 0.12, 0.55)
ev["wanted"] = R(c + 0.85); cue("whoosh", c + 0.8, 0.35); cue("thud", c + 1.05, 0.5)
c = say("o1_nar", c + 1.45)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "It is a vegetable, I promise." / "Vegetables don't swim, madam."; insert: his pen taps the glass three times,
#      the front pickle opens its eyes and nods; reaction: she sweats, he raises an eyebrow
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_c", c0)
ev["tap"] = R(c + 0.15); [cue("tink", c + 0.35 + i * 0.28, 0.55) for i in range(3)]
ev["nod"] = R(c + 1.3); cue("boing", c + 1.35, 0.45); cue("boing", c + 1.75, 0.35)
ev["react"] = R(c + 2.3); cue("gasp", c + 2.35, 0.45)
c = say("o2_nar", c + 2.75)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> calm facts; "Ah, pickles!" — the scanner screen turns green with a tick, he waves her through; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c0 = c + 0.3; c = say("o3_c", c0)
ev["green"] = R(c + 0.1); cue("ding", c + 0.12, 0.55)
ev["wave"] = R(c + 0.5); cue("whoosh", c + 0.5, 0.3)
c = say("o3_nar", c + 1.25)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.45)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> snow falls on "three winters", confetti on "weddings"; he is stunned; "...The jar may proceed." — he salutes the jar,
#      the belt carries it on with a fanfare
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["c2"] = R(h0 + O4[1][1]); ev["c3"] = R(h0 + O4[2][1])
ev["snow"] = wat("o4_h", h0, 5); cue("chime", ev["snow"], 0.3)        # «three winters»
ev["confetti"] = wat("o4_h", h0, 9); cue("pop", ev["confetti"], 0.5); cue("tada", ev["confetti"] + 0.05, 0.25)   # «family weddings»
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.5)
c0 = c + 0.5; c = say("o4_c", c0)
ev["salute"] = R(c + 0.12); cue("stamp", c + 0.3, 0.35)
ev["belt"] = R(c + 0.55); cue("hum", c + 0.55, 0.4); cue("tada", c + 0.7, 0.45)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.7), ev=ev)); t = c + 1.7

# ---- twist (music silent): Pike looks left and right, unscrews the lid, bites a pickle — CRUNCH over the whole airport (shake, the gnome's glasses slip);
#      "Tell your grandma... we need a second sample." — she smugly pulls a second jar out of her bag; moral
s = t; ev = dict(beat=R(s))
ev["look"] = R(s + 0.05); cue("tick", s + 0.3, 0.3); cue("tick", s + 0.7, 0.3)
ev["open"] = R(s + 1.0); cue("creak", s + 1.0, 0.35); cue("pop", s + 1.3, 0.6)
ev["bite"] = R(s + 1.75); cue("crunch", s + 1.8, 1.0); cue("impact", s + 1.8, 0.45)
c = say("end_c", s + 2.65)
cue("crunch", s + 2.65 + 1.0, 0.45)
ev["jar2"] = R(c + 0.15); cue("whoosh", c + 0.2, 0.35); cue("ding", c + 0.6, 0.5); cue("sparkle", c + 0.6, 0.35)
c = say("moral", c + 1.25)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question «Что везла твоя мама в ручной клади?»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for w in ["один", "два", "три", "четыре"]:
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
c = say("ask", c + 0.35); cue("pop", c - D["ask"], 0.5)
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
cfg["chunks"] = {"o4_h": [[O4[0][0], "Офицер, эта банка пережила три зимы"], [O4[1][0], "и две семейные свадьбы."], [O4[2][0], "Ваш сканер — самое нестрашное, что она видела."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
