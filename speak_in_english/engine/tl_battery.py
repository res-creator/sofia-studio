"""python3 tl_battery.py -> eps/battery/timeline.json  (rubric «Полезное», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "battery"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
# o4_h has no aligner output: words spread over its four voiced segments (found from the pauses in the wav)
O4_SEG = [(0.14, 1.44, "My phone's about to die,"), (1.95, 3.79, "and then my mum will think I'm dead too."), (4.78, 5.39, "One plug,"), (5.86, 7.15, "two lives saved.")]
def seg_words(segs):
    out = []
    for a, b, s in segs:
        ws = s.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, k in zip(ws, wt): out.append([w, R(a + cc / tot * (b - a)), R(a + (cc + k) / tot * (b - a))]); cc += k
    return out
def word_times(lid):
    if lid == "o4_h": return seg_words(O4_SEG)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        if out and a < out[-1][1]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = she holds her phone up at the counter (red 1% blinking), the barista blocks the only socket behind the counter; her line at 0.2 s
cue("buzz", 0.0, 0.5); cue("blink", 0.05, 0.35)
t = say("hook_b", 0.2)
hev = dict(peek=0.2)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["phone"] = R(t - 0.02)                 # «Один процент» -> insert: her phone, red 1%
hev["socket"] = wat("hook", t, 3)          # «одна розетка» -> close-up: the only socket (coffee machine + the cactus on charge)
hev["wide"] = wat("hook", t, 5)            # «Как попросить» -> back to the wide (cactus 100% visible)
cue("whoosh", hev["phone"], 0.4); cue("blink", hev["phone"] + 0.3, 0.45); cue("blink", hev["phone"] + 0.75, 0.45)
cue("whoosh", hev["socket"] - 0.03, 0.35); cue("whoosh", hev["wide"] - 0.03, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1 «В ЛОБ»: "Give charge! Now!" (slaps the counter) -> "Charge? That's four pounds fifty." the till rings, a receipt shoots out and unrolls to the floor
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("thud", s + 0.55, 0.5); cue("thud", s + 1.25, 0.45)
c0 = c + 0.25; c = say("o1_b", c0)
ev["till"] = R(c + 0.05); cue("register", c + 0.1, 0.7)
ev["print"] = R(c + 0.4); cue("zip", c + 0.45, 0.5); cue("zip", c + 0.85, 0.45)
ev["rcpt"] = R(c + 1.25); cue("whoosh", c + 1.23, 0.35); cue("stamp", c + 1.5, 0.45)
ev["back"] = R(c + 2.25)
c = say("o1_nar", c + 2.35)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2 «ВЕЖЛИВО»: "...give me electricity?" -> "We've only got oat milk." she gets a carton; insert: her cable stuck into the carton, still 1%
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.25; c = say("o2_b", c0)
ev["milk"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("plop", c + 0.45, 0.55)
ev["plug"] = R(c + 1.2); cue("whoosh", c + 1.18, 0.35); cue("pop", c + 1.5, 0.45); cue("nope", c + 1.9, 0.5)
ev["back"] = R(c + 2.35)
c = say("o2_nar", c + 2.45)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3 «КАК НОСИТЕЛЬ»: "I'm on one percent. Is there anywhere...?" -> "Oh, go on then. Pass it here." she carries the phone like a baby to the socket; insert: charging
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.45)
c0 = c + 0.25; c = say("o3_b", c0)
ev["take"] = R(c + 0.1); cue("coo", c + 0.4, 0.4)
ev["plug"] = R(c + 1.6); cue("knob", c + 1.65, 0.55)
ev["charge"] = R(c + 1.9); cue("whoosh", c + 1.88, 0.35); cue("chime", c + 2.0, 0.45)
ev["back"] = R(c + 2.9)
c = say("o3_nar", c + 2.95)
c = say("o3_tip", c + 0.4); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4 «КОРОЛЕВСКИЙ ОТВЕТ»: the drama speech (faints at "dead"), the barista melts; "...Fine. But I'm telling your mum it was me." open palm for the phone
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["mum"] = wat("o4_h", h0, 8)       # «mum» -> she clutches the phone
ev["dead"] = wat("o4_h", h0, 12)     # «dead» -> fainting pose
ev["plug1"] = wat("o4_h", h0, 14)    # «One plug» -> barista reaction shot (melting)
cue("gasp", ev["dead"] + 0.1, 0.35); cue("sparkle", ev["plug1"], 0.35)
ev["sigh"] = R(c + 0.1)
c0 = c + 0.45; c = say("o4_b", c0)
ev["palm"] = R(c - 0.6)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.5), ev=ev)); t = c + 0.5

# ---- twist (music silent): the barista looks at the socket, yanks the coffee machine plug; the queue is horrified; "Coffee can wait. Her mum can't."
s = t; ev = dict(beat=R(s))
ev["look"] = R(s + 0.1)
ev["yank"] = R(s + 0.75); cue("scratch", s + 0.78, 0.45); cue("powerdown", s + 0.85, 0.6)
ev["queue"] = R(s + 1.35); cue("gasp", s + 1.4, 0.6)
c = say("end_b", s + 2.05)
ev["zap"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); cue("chime", c + 0.25, 0.45)
ev["wide"] = R(c + 1.15); cue("boing", c + 1.2, 0.35)
c = say("moral", c + 1.5)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
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
cfg["chunks"] = {"o4_h": [["My phone's about to die,", "Мой телефон сейчас умрёт,"],
                          ["and then my mum will think I'm dead too.", "и тогда мама решит, что я тоже умерла."],
                          ["One plug, two lives saved.", "Одна розетка — две спасённые жизни."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
