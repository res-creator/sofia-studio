"""python3 tl_cake.py -> eps/cake/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "cake"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    if lid in ("o4_h", "o1_h", "end_t", "o2_t"): return [list(x) for x in w]
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = Tom at the open fridge, chewing, the EMPTY cake plate + fork in his hands; she has just come in. His line at 0.2 s
cue("munch", 0.0, 0.7); cue("hum", 0.0, 0.25)
t = say("hook_t", 0.2)
hev = dict(chew=0.0)
t += 0.3
hev["nar"] = R(t); e = say("hook", t); cue("munch", t + 0.1, 0.5); cue("pop", t + 0.55, 0.35)   # Tom close-up: he licks the fork
hev["plate"] = wat("hook", t, 6)     # «Весь.» -> insert: the empty plate, crumbs, one last crumb rolls
hev["wide"] = wat("hook", t, 7)      # «Четыре ответа» -> back to the kitchen, Tom shuts the fridge
cue("whoosh", hev["plate"] - 0.05, 0.45); cue("clank", hev["plate"] + 0.2, 0.35); cue("whoosh", hev["wide"], 0.4); cue("thud", hev["wide"] + 0.3, 0.45)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.4), ev=hev)); t = e + 0.4

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Because it was delicious. Thank you!" he hands her the empty plate (to wash); she stares at it, facepalm
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("stamp", wat("o1_h", s + 0.35, 1), 0.35)
c0 = c + 0.3; c = say("o1_t", c0)
ev["rub"] = R(c0 + 0.3)                                  # he pats his belly on "delicious"
ev["give"] = R(c + 0.1); cue("whoosh", c + 0.12, 0.35); cue("clank", c + 0.45, 0.45)
ev["palm"] = R(c + 1.2); cue("thud", c + 1.25, 0.55)
c = say("o1_nar", c + 1.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "Okay. Can I eat your pizza, then?" he eyes the pizza box; insert: lid lifts, his fork sneaks in, her hands slam it shut; she hugs the box
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_t", c0)
ev["eye"] = wat("o2_t", c0, 5); cue("sparkle", ev["eye"] + 0.05, 0.4)
ev["pizza"] = R(c + 0.12); cue("creak", c + 0.3, 0.45); cue("slurp", c + 0.65, 0.5); ev["slam"] = R(c + 1.3); cue("thud", c + 1.32, 0.6)
ev["horror"] = R(c + 1.6); cue("gasp", c + 1.62, 0.45)
c = say("o2_nar", c + 2.3)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> sheepish "Fair. Sorry, I'll replace it." he writes sticky notes and slaps them on the fridge (insert); handshake-ish relief; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.45)
c0 = c + 0.3; c = say("o3_t", c0)
ev["write"] = R(c + 0.1); cue("scratch", c + 0.15, 0.35)
ev["notes"] = R(c + 0.6); cue("stamp", c + 0.95, 0.5); cue("stamp", c + 1.45, 0.5)
ev["relief"] = R(c + 2.05); cue("chime", c + 2.1, 0.3)
c = say("o3_nar", c + 2.45)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; on "Tomorrow." insert: the wall calendar TOMORROW: MY BIRTHDAY; Tom sweats; he drops the fork
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["cal"] = wat("o4_h", h0, 9); cue("whoosh", ev["cal"] - 0.08, 0.4); cue("ding", ev["cal"] + 0.35, 0.4)
ev["guilt"] = wat("o4_h", h0, 10)
ev["smug"] = wat("o4_h", h0, 14); cue("sparkle", ev["smug"] + 0.2, 0.4)
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.55)
c0 = c + 0.55; c = say("o4_t", c0)
ev["drop"] = R(c + 0.25); cue("clank", c + 0.45, 0.55)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.95), ev=ev)); t = c + 0.95

# ---- twist (music silent): NEXT DAY - smoke alarm beeping, Tom walks in proudly with a burnt black cake, candles, smoke
s = t; ev = dict(beat=R(s))
ev["enter"] = R(s + 0.15); cue("smokealarm", s + 0.2, 0.5); cue("smokealarm", s + 1.1, 0.5)
ev["stop"] = R(s + 1.15)
c0 = s + 1.45; c = say("end_t", c0)
ev["flour"] = wat("end_t", c0, 3); ev["eggs"] = wat("end_t", c0, 6); ev["oven"] = wat("end_t", c0, 9); ev["hb"] = wat("end_t", c0, 10)
for k_ in ("flour", "eggs", "oven"): cue("pop", ev[k_] + 0.05, 0.45)
cue("smokealarm", ev["hb"] + 0.2, 0.35)
ev["look"] = R(c + 0.15)
ev["blow"] = R(c + 1.0); cue("whoosh", c + 1.0, 0.5); cue("smokealarm", c + 1.25, 0.6); cue("cough", c + 1.5, 0.45)
c = say("moral", c + 1.6)
ev["mine"] = R(c - 0.9); cue("stamp", c - 0.75, 0.55)
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
cfg["chunks"] = {"o4_h": [["That was my birthday cake, Tom.", "Это был мой торт на день рождения, Том."],
                          ["For my birthday. Tomorrow.", "На мой день рождения. Завтра."],
                          ["Enjoy the guilt — it's calorie-free.", "Наслаждайся чувством вины — в нём нет калорий."]],
                 "end_t": [["I used your flour. And your eggs.", "Я взял твою муку. И твои яйца."],
                           ["And your oven. Happy birthday!", "И твою духовку. С днём рождения!"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
