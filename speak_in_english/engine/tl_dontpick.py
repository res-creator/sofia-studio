"""python3 tl_dontpick.py -> eps/dontpick/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "dontpick"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = she is calling him (phone at her ear); his phone on the stand rings «DON'T ANSWER»; he lunges and slaps his palm over it
cue("ring", 0.0, 0.55); cue("buzz", 0.05, 0.4)
t = say("hook_b", 0.2)
hev = dict(slap=0.95); cue("thud", 0.98, 0.5)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["list"] = R(t - 0.05)                      # insert: his contact list — «DON'T ANSWER», right under it «PIZZA GUY (FAMILY)»
hev["pizza"] = R(t + 1.3); cue("whoosh", t - 0.08, 0.45); cue("pop", t + 0.35, 0.4); cue("ding", t + 1.35, 0.35)
hev["wide"] = wat("hook", t, 7) - 0.05        # «Какой твой?» -> back to the kitchen: she taps her foot, he whistles innocently
cue("whoosh", hev["wide"], 0.35); [cue("tick", hev["wide"] + 0.3 + i * 0.3, 0.35) for i in range(3)]
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.55), ev=hev)); t = e + 0.55

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> she shoves her phone at him; "It's a reminder!"; she calls again to test — his phone rings, he hits DECLINE out of habit; steam
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_b", c0)
ev["call"] = R(c + 0.15); cue("click", c + 0.2, 0.5)
ev["ring"] = R(c + 0.5); cue("ring", c + 0.5, 0.55)
ev["decline"] = R(c + 1.25); cue("click", c + 1.25, 0.6); cue("nope", c + 1.3, 0.4)
ev["steam"] = R(c + 1.9); cue("boing", c + 1.95, 0.35); cue("strain", c + 2.0, 0.3)
c = say("o1_nar", c + 2.55)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "It's just a name. Like 'Bob'." — he proudly shows the contact «BORING BOB»; her deadpan stare, slow facepalm
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; ev["pick"] = R(c0 - 0.1); c = say("o2_b", c0)
ev["bob"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.4); cue("pop", c + 0.35, 0.5); cue("cricket", c + 0.9, 0.35)
ev["palm"] = R(c + 1.85); cue("thud", c + 2.2, 0.3)
c = say("o2_nar", c + 2.6)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> calm question; he blushes and erases «DON'T ANSWER» letter by letter; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35)
c0 = c + 0.3; c = say("o3_b", c0)
ev["erase"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35); [cue("keys", c + 0.35 + i * 0.1, 0.45) for i in range(12)]
ev["blush"] = R(c + 1.75); cue("sparkle", c + 1.8, 0.3)
c = say("o3_nar", c + 2.25)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; she turns her phone to him: «ALWAYS ANSWER»; he types frantically: «ALWAYS ANSWER, MY QUEEN»
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["gasp"] = R(c - 1.3); cue("gasp", c - 1.25, 0.4)
ev["show"] = R(c + 0.15); cue("whoosh", c + 0.13, 0.4); cue("sparkle", c + 0.45, 0.4)
ev["type"] = R(c + 1.55); [cue("keys", c + 1.6 + i * 0.075, 0.5) for i in range(14)]
c0 = c + 2.75; c = say("o4_b", c0)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.1), ev=ev)); t = c + 0.1

# ---- twist (music silent from here to the moral): his screen «ALWAYS ANSWER, MY QUEEN» + crown; she is smug; he calls her to check —
# her phone lights up: «HE'LL WAIT»; "'He'll wait'?! Since when?!"; his deadpan stare; moral
s = t; ev = dict(beat=R(s))
ev["queen"] = R(s); cue("tada", s + 0.15, 0.35)
ev["smug"] = R(s + 1.25)
ev["dial"] = R(s + 1.8); cue("click", s + 1.95, 0.5)
ev["ring"] = R(s + 2.35); cue("ring", s + 2.35, 0.55); cue("buzz", s + 2.4, 0.4)
ev["hell"] = R(s + 2.6)
c = say("end_h", s + 3.75)
ev["stare"] = R(c + 0.1); cue("blink", c + 0.25, 0.5)
c = say("moral", c + 1.25)
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
cfg["chunks"] = {"o4_h": [["Funny. I've saved you as 'Always Answer'.", "Забавно. А я записала тебя как «Всегда брать»."],
                          ["One of us is about to update their contacts —", "Кто-то из нас сейчас обновит контакты —"],
                          ["and it won't be me.", "и это буду не я."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
