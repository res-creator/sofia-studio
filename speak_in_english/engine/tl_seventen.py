"""python3 tl_seventen.py -> eps/seventen/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "seventen"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    w = sorted(w, key=lambda x: x[1]); out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = a candle-lit date; he already holds up a judge's scorecard «7/10»; behind them three old judges at the next table
t = say("hook_d", 0.2)
hev = dict(judges=1.25)                       # the judges raise 9, 9, 3 (absurd detail) while he talks
for i in range(3): cue("pop", 1.25 + i * 0.22, 0.4)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)          # her reaction close-up (jaw drops)
cue("boing", t + 0.15, 0.35)
hev["jcu"] = wat("hook", t, 6) - 0.05          # «Какой ответ поднимет оценку?» -> close-up of the judges (9 · 9 · 3, the grumpy one shakes his head)
cue("whoosh", hev["jcu"], 0.4); cue("ding", hev["jcu"] + 0.25, 0.3); cue("ding", hev["jcu"] + 0.45, 0.3); cue("nope", hev["jcu"] + 0.7, 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.35), ev=hev)); t = e + 0.35

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> she whips out her own scorecard «3»; "But I paid for dessert!" (open palm to the tiramisu); his card slides off the table
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o1_h", h0)
ev["three"] = wat("o1_h", h0, 2) - 0.12; cue("whoosh", ev["three"], 0.4); cue("stamp", ev["three"] + 0.12, 0.45)
ev["j3"] = R(c + 0.12); [cue("pop", c + 0.2 + i * 0.16, 0.4) for i in range(3)]; cue("stamp", c + 0.7, 0.3)   # the judges all flip to 3 (at him)
c0 = c + 1.25; c = say("o1_d", c0)
ev["dessert"] = wat("o1_d", c0, 4) - 0.1
ev["slide"] = R(c + 0.12); cue("slide", c + 0.15, 0.55)
ev["fall"] = R(c + 1.0); cue("plop", c + 1.05, 0.5)
ev["peek"] = R(c + 1.4)   # he peeks under the table after his card
c = say("o1_nar", c + 1.85)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "Point one…" he pulls a list out of his jacket; it unrolls, rolls across the floor all the way to the door
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; ev["pull"] = R(c0 - 0.05); c = say("o2_d", c0)
ev["list"] = R(c + 0.05); cue("whoosh", c + 0.05, 0.4); [cue("pop", c + 0.35 + i * 0.22, 0.3) for i in range(4)]   # insert: the top of his list
ev["unroll"] = R(c + 1.85); cue("unroll", c + 1.85, 0.55)
ev["door"] = R(c + 3.4); cue("thud", c + 3.45, 0.35); cue("ding", c + 3.5, 0.3)
ev["slump"] = R(c + 3.85); cue("deflate", c + 3.9, 0.35)
c = say("o2_nar", c + 4.3)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> two dry words + a smile; he laughs; insert: the marker turns the 7 into an 8; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 0.6, 0.35)
c0 = c + 0.3; c = say("o3_d", c0)
ev["draw"] = R(c + 0.05); cue("marker", c + 0.25, 0.6)
ev["show"] = R(c + 1.4); cue("ding", c + 1.45, 0.4)
ev["j8"] = R(c + 2.0); [cue("pop", c + 2.05 + i * 0.16, 0.4) for i in range(3)]   # the judges approve: 8 · 8 · 8
c = say("o3_nar", c + 2.85)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line with her own card (5, then 6.5); he sweats; his card flips itself to 10; "...Ten. Final answer."; judges 10 · 10 · 10
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ow = word_times("o4_h")
def o4w(prefix, n=0, fb=0.0):
    hits = [x for x in (ow or []) if x[0].lower().strip("'.,?—").startswith(prefix)]
    return R(h0 + hits[n][1]) if len(hits) > n else R(h0 + fb)
ev["five"] = o4w("five", 0, 2.3) - 0.1; cue("pop", ev["five"] + 0.05, 0.4)
ev["half"] = o4w("half", 0, 5.4) - 0.1; cue("whoosh", ev["half"], 0.3); cue("pop", ev["half"] + 0.1, 0.4)
ev["compare"] = o4w("still", 0, 6.9) - 0.1
ev["gasp"] = R(c + 0.05); cue("gasp", c + 0.08, 0.45)
ev["flip"] = R(c + 0.55); cue("whoosh", c + 0.6, 0.45); cue("ding", c + 0.95, 0.5)
c0 = c + 1.5; c = say("o4_d", c0)
ev["j10"] = R(c0 + 0.45); cue("tada", c0 + 0.5, 0.3); cue("clap", c0 + 0.6, 0.35)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.75), ev=ev)); t = c + 0.75

# ---- twist (music silent from here to the moral): a loud video-call ringtone in his jacket pocket; he pulls out the phone — his mum (British,
# visiting from England) has been on the call the whole evening (1:12:47); she holds up her own card: 10 for her, 7 for him; his face; judges 7 · 7 · 7
s = t; ev = dict(beat=R(s))
ev["ring"] = R(s + 0.2); cue("ring", s + 0.2, 0.6); cue("buzz", s + 0.25, 0.45)
ev["pull"] = R(s + 0.9); cue("whoosh", s + 0.95, 0.35)
ev["phone"] = R(s + 1.25); cue("click", s + 1.3, 0.45)
c0 = s + 2.1; c = say("end_m", c0)
mw = word_times("end_m")
ev["ten"] = wat("end_m", c0, 3) - 0.15; ev["you"] = wat("end_m", c0, 4) - 0.1
cue("pop", ev["ten"], 0.4); cue("pop", ev["you"] + 0.2, 0.4)
ev["shock"] = R(c + 0.1); cue("boing", c + 0.12, 0.45)
ev["grin"] = R(c + 0.85); cue("sparkle", c + 0.9, 0.35)                                 # she holds up her own card: 10 (mum agrees)
ev["j7"] = R(c + 1.65); [cue("pop", c + 1.65 + i * 0.18, 0.4) for i in range(3)]       # the judges: 7 · 7 · 7 — for him
c = say("moral", c + 2.4)
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
        pz = [3.5 if re.search(r"[.!?:…]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Seven's generous.", "Семь — это щедро."],
                          ["I'd give you five, but you were sweet to the waiter, so six and a half.", "Я бы дала тебе пять, но ты был мил с официантом, так что шесть с половиной."],
                          ["Still want to compare scores?", "Всё ещё хочешь сравнить оценки?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
