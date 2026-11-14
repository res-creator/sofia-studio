"""python3 tl_hairhotel.py -> eps/hairhotel/timeline.json  (rubric «Полезное» (useful4), 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "hairhotel"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
# character lines: words spread inside the speech segments measured from the (squeezed) audio's pauses
SEG = {"o4_h": [("For two hundred pounds I expected a sea view,", 0.04, 3.06), ("not a souvenir from the last guest.", 3.38, 5.46), ("Shall I invite him back to split the bill?", 6.14, 8.11)],
       "o3_h": [("I'm afraid the room hasn't been made up properly.", 0.09, 2.49), ("I'd like fresh bedding, please.", 2.8, 4.24)],
       "o2_h": [("I'm sorry to bother you,", 0.02, 1.46), ("there's a tiny hair…", 1.94, 3.38)],
       "o2_r": [("Tiny?", 0.03, 0.61), ("Then it's practically invisible, madam.", 0.92, 2.66)],
       "o3_r": [("I do apologise.", 0.09, 1.05), ("Housekeeping's on the way.", 1.37, 2.44)],
       "o1_r": [("Ah…", 0.02, 0.48), ("it's complimentary?", 0.79, 1.65)],
       "o4_r": [("…Presidential suite, madam.", 0.02, 1.21), ("Hair-free, I promise.", 1.54, 2.84)],
       "end_r": [("Ah.", 0.03, 0.41), ("That's Biscuit.", 0.71, 1.41), ("He actually owns the place.", 1.71, 3.14)],
       # outro: the aligner returned «три или четыре» after «Пиши»; fixed from the audio's speech segments
       "outro": [("А ты бы ответила как:", 0.04, 1.04), ("один, два,", 1.12, 1.77), ("три или четыре?", 1.85, 2.66), ("Пиши в комментариях!", 2.96, 3.73)]}
def seg_words(segs):
    out = []
    for txt, a, b in segs:
        ws = txt.split(); wl = [len(w) + 1 for w in ws]; tot = sum(wl); cc = 0
        for w, l in zip(ws, wl): out.append([w, round(a + (b - a) * cc / tot, 3), round(a + (b - a) * (cc + l) / tot, 3)]); cc += l
    return out
def word_times(lid):
    if lid in SEG: return seg_words(SEG[lid])
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    for i in range(1, len(out)):   # keep the aligner's words monotonic
        if out[i][1] < out[i - 1][1]: out[i][1] = out[i - 1][1]
        if out[i][2] < out[i][1]: out[i][2] = out[i][1]
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, w):   # time of the first word starting with w
    return R(t0 + next(x[1] for x in word_times(lid) if re.sub(r"[^\w'£-]", "", x[0].lower()).startswith(w)))

# ---- hook: frame 0 = the London hotel room: the white pillow with ONE long ginger hair (circled), she recoils beside the bed,
#      the beaming receptionist in the doorway; above the bed the founder's portrait with the same ginger curls. His line at 0.2 s.
cue("steps", 0.0, 0.3); cue("rain", 0.0, 0.35)
t = say("hook_r", 0.2)
hev = dict()
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["pillow"] = wat("hook", t, "чужой") - 0.05     # «чужой волос» -> portrait + pillow: same ginger
hev["wide"] = wat("hook", t, "как")                 # «Как пожаловаться» -> back to the room
cue("whoosh", hev["pillow"] - 0.05, 0.4); cue("ding", hev["pillow"] + 0.3, 0.35); cue("whoosh", hev["wide"], 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Hair! Disgusting! Money back!" (stamps, palm at the pillow) — "Ah… it's complimentary?" — he admires the hair like
#      a pillow chocolate: insert, the hair gets wrapped like a sweet + a COMPLIMENTARY tent card
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("stamp", s + 0.5, 0.35); cue("stamp", s + 1.45, 0.35)
c0 = c + 0.3; c = say("o1_r", c0)
ev["wrap"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.3); cue("crinkle", c + 0.3, 0.55); cue("sparkle", c + 0.75, 0.45); cue("pop", c + 0.95, 0.45)
ev["react"] = R(c + 1.45)
c = say("o1_nar", c + 1.25)
ev["face"] = wat("o1_nar", c - D["o1_nar"], "конфеткой") - 0.05
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "I'm sorry to bother you, there's a tiny hair…" (shrinks, hands together) — "Tiny? Then it's practically invisible, madam."
#      (he holds the pillow at arm's length, squinting) — gag: he flips the pillow over and pats it: problem gone
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; ev["grab"] = R(c0); c = say("o2_r", c0); cue("whoosh", c0 + 0.05, 0.25)
ev["flip"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.4); cue("plop", c + 0.45, 0.5); [cue("pat", c + 0.75 + i * 0.22, 0.45) for i in range(3)]
c = say("o2_nar", c + 1.35)
ev["face"] = wat("o2_nar", c - D["o2_nar"], "проблема") - 0.05
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> calm fact + request — "I do apologise. Housekeeping's on the way." — he claps: three housekeepers rush in with
#      stacks of linen, a whirlwind over the bed, a fresh bed with a towel swan; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.3, 0.4)
c0 = c + 0.3; c = say("o3_r", c0)
ev["clap"] = R(c - 0.35); cue("clapclap", c - 0.35, 0.55)
ev["maids"] = R(c + 0.1); [cue("steps", c + 0.1 + i * 0.25, 0.4) for i in range(3)]
ev["whirl"] = R(c + 0.95); cue("flap", c + 0.95, 0.6); cue("flap", c + 1.35, 0.5); cue("flap", c + 1.7, 0.45)
ev["fresh"] = R(c + 2.1); cue("tada", c + 2.15, 0.45); cue("sparkle", c + 2.2, 0.5)
c = say("o3_nar", c + 2.5)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.6), ev=ev)); t = c + 0.6

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; on «sea view» the window: London rain and a bus; on «souvenir» she holds the hair up
#      between two fingers; on «split the bill» he sweats — "…Presidential suite, madam." (insert: the gold key card) "Hair-free, I promise."
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["sea"] = wat("o4_h", h0, "sea") - 0.1; cue("rain", ev["sea"], 0.55); cue("bus", ev["sea"] + 0.2, 0.45)
ev["souv"] = wat("o4_h", h0, "not") - 0.05
ev["bill"] = wat("o4_h", h0, "shall") - 0.08
ev["gulp"] = R(c + 0.05); cue("gulp", c + 0.15, 0.5)
c0 = c + 0.6; c = say("o4_r", c0)
ev["card"] = R(c0 + 0.05); cue("sparkle", c0 + 0.15, 0.5); cue("ding", c0 + 0.2, 0.4)
ev["promise"] = wat("o4_r", c0, "hair-free") - 0.08
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.6), ev=ev)); t = c + 0.6

# ---- twist (music silent): the Presidential suite; she opens the wardrobe — a fluffy ginger cat in a bow tie sits inside, ginger hair everywhere;
#      "Ah. That's Biscuit. He actually owns the place." — the cat shakes: a cloud of ginger hair over the fresh suite; the moral
s = t; ev = dict(beat=R(s))
cue("lift_ding", s + 0.1, 0.4)
ev["open"] = R(s + 0.75); cue("creak", s + 0.75, 0.5)
ev["cat"] = R(s + 1.25); cue("meow", s + 1.45, 0.6)
c0 = s + 2.1; c = say("end_r", c0)
ev["biscuit"] = wat("end_r", c0, "that's") - 0.08
ev["owns"] = wat("end_r", c0, "he") - 0.08
ev["shake"] = R(c + 0.15); cue("shake", c + 0.2, 0.55); cue("feather", c + 0.35, 0.45); cue("meow", c + 1.0, 0.45)
c = say("moral", c + 1.25)
ev["moral"] = R(c - D["moral"])
ev["kota"] = wat("moral", c - D["moral"], "даже") - 0.05
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
cfg["chunks"] = {"o4_h": [["For two hundred pounds I expected a sea view,", "За двести фунтов я ждала вид на море,"],
                          ["not a souvenir from the last guest.", "а не сувенир от прошлого гостя."],
                          ["Shall I invite him back to split the bill?", "Может, позвать его обратно и разделить счёт?"]],
                 "o3_h": [["I'm afraid the room hasn't been made up properly.", "Боюсь, номер плохо подготовили."],
                          ["I'd like fresh bedding, please.", "Я бы хотела свежее бельё, пожалуйста."]],
                 "o4_r": [["…Presidential suite, madam.", "…Президентский люкс, мадам."], ["Hair-free, I promise.", "Без волос, обещаю."]],
                 "end_r": [["Ah. That's Biscuit.", "А. Это Бисквит."], ["He actually owns the place.", "Вообще-то отель принадлежит ему."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
