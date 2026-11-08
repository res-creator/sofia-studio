"""python3 tl_gymgift.py -> eps/gymgift/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "gymgift"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, i): return next(s for s in speech if s["id"] == lid)["t"] + word_times(lid)[i][1]
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)

# ---- hook: frame 0 = anniversary living room, he already holds out a pink envelope with a bow, the gym card sticking out; his line at 0.15 s
cue("tada", 0.0, 0.35); cue("pop", 0.1, 0.4)
t = say("hook_b", 0.15)
hev = dict(ch2=wat("hook_b", 2) - 0.05, gym=wat("hook_b", 4) - 0.08, title_out=2.6)       # «...of gym!» -> card pops up out of the envelope
cue("boing", hev["gym"] + 0.05, 0.35)
hev["freeze"] = t + 0.02; cue("scratch", t, 0.5)
t += 0.3
hev["nar"] = t; e = say("hook", t)
hev["plate"] = t; cue("pop", t, 0.55)
hev["take"] = wat("hook", 3) - 0.05     # «парень подарил» -> she takes the card (her close-up)
hev["card"] = wat("hook", 8) - 0.08     # «абонемент» -> insert: the gym card
hev["wide"] = wat("hook", 13) - 0.05    # «Четыре ответа» -> wide
cue("whoosh", hev["card"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "Gym. For me. Why?" -> "For balance! I got myself a pizza voucher." -> he proudly whips out a pizza voucher (sparkle) -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
c = say("o1_b", c + 0.25)
ev["voucher"] = wat("o1_b", 6) - 0.1; cue("whoosh", ev["voucher"], 0.45); cue("sparkle", ev["voucher"] + 0.2, 0.5)
ev["kiss"] = c + 0.1; cue("pop", c + 0.25, 0.35)
c = say("o1_nar", c + 0.75)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: couples' push-ups? -> "Yes! I booked us a trainer!" -> phone insert: a huge trainer flexing, BOOKED -> her shocked face
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
c = say("o2_b", c + 0.25)
ev["phone"] = c - 1.0
ev["insert"] = c + 0.05; cue("pop", c + 0.1, 0.5); ev["flex"] = c + 0.6; cue("boing", c + 0.65, 0.45); ev["booked"] = c + 1.0; cue("thud", c + 1.05, 0.5)
ev["react"] = c + 1.75
c = say("o2_nar", c + 1.9)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 3 · КАК НОСИТЕЛЬ: gentle line -> "...No. It was on sale. Sorry." -> he hides the envelope (SALE sticker) behind his back -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c = say("o3_b", c + 0.25)
ev["hide"] = wat("o3_b", 1) - 0.05; cue("whoosh", ev["hide"], 0.4)
c = say("o3_nar", c + 0.35)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: sweet line (she mimes running) -> "...Wait, there's a second envelope!" -> he frantically pats his pockets
s = t; ev = opt(s)
c = say("o4_h", s + 0.35)
ev["run"] = wat("o4_h", 7) - 0.05
c = say("o4_b", c + 0.25)
ev["pat"] = next(x for x in speech if x["id"] == "o4_b")["t"] + 0.35
for k in range(6): cue("thud", ev["pat"] + k * 0.22, 0.25)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.6), ev=RD(ev))); t = c + 0.6

# ---- twist (music silent): she reads the card -> insert: MEMBER: WILL (circled) -> "Oh. That one's mine. Yours is the flowers in the car." -> window: the car with flowers -> moral
s = t; ev = dict(beat=s, read=s + 0.05)
ev["insert"] = s + 0.75; cue("pop", s + 0.8, 0.45)
ev["circle"] = s + 1.35; cue("scratch", s + 1.35, 0.35)
c = say("end_b", s + 2.35)
ev["point"] = wat("end_b", 4) - 0.1
ev["car"] = c + 0.05; cue("ding", c + 0.3, 0.5); cue("sparkle", c + 0.35, 0.5)
ev["swap"] = c + 1.35; cue("whoosh", c + 1.4, 0.4)
c = say("moral", c + 1.25)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in ow if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
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
cfg["chunks"] = {
    "hook_b": [["Happy anniversary!", "С годовщиной!"], ["Twelve months… of gym!", "Двенадцать месяцев… спортзала!"]],
    "o2_h": [["Wow, so romantic.", "Вау, как романтично."], ["Do they do couples' push-ups?", "А там есть отжимания для пар?"]],
    "o3_h": [["That's thoughtful,", "Это заботливо,"], ["but it's not really an anniversary gift, is it?", "но это ведь не совсем подарок на годовщину, правда?"]],
    "o4_h": [["Thank you! I'll use it every day —", "Спасибо! Буду ходить каждый день —"], ["to run away from men", "чтобы убегать от мужчин,"], ["who give gym cards on anniversaries.", "которые дарят абонементы на годовщину."]],
    "end_b": [["Oh. That one's mine.", "Ой. Этот мой."], ["Yours is the flowers in the car.", "А твой подарок — цветы в машине."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
