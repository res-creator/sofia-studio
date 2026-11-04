"""python3 tl_console.py -> eps/console/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "console"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)

# ---- hook: frame 0 = sofa, he already holds the console up; his line at 0.15 s; she freezes; narrator + comment plate over quick cuts
cue("tada", 0.0, 0.35); cue("pop", 0.1, 0.4)
t = say("hook_b", 0.15)
hev = dict(freeze=t + 0.02, title_out=2.6); cue("scratch", t, 0.5)
t += 0.35
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["bf"] = wat(8) - 0.1       # «приставку» -> he kisses the console
hev["self"] = wat(9) - 0.05    # «Себе.» -> he already plays (controller in his hands)
hev["wide"] = wat(12) - 0.05   # «Четыре ответа» -> wide
cue("beep", hev["self"] + 0.1, 0.35); cue("beep", hev["self"] + 0.35, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "Thanks. Keep it." -> he is DELIGHTED, hugs the console (hearts) -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
ev["joy"] = c + 0.1; cue("tada", c + 0.12, 0.5)
c = say("o1_b", c + 0.3)
ev["hug"] = c - 0.6; cue("squeak", c - 0.5, 0.5); cue("coo", c + 0.1, 0.45); cue("sparkle", c - 0.4, 0.45)
ev["kiss"] = c + 0.45; cue("pop", c + 0.5, 0.4)
c = say("o1_nar", c + 1.2)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: "...your birthday present is a hair dryer." -> she hands him a hair-dryer box -> "...Fair." -> he tries the dryer on his hair
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
ev["box"] = c - 1.0; cue("whoosh", c - 1.0, 0.4)
ev["give"] = c + 0.05; cue("whoosh", c + 0.05, 0.45); ev["land"] = c + 0.4; cue("thud", c + 0.4, 0.5)
c = say("o2_b", c + 0.75)
ev["dry"] = c + 0.25; cue("hairdryer", c + 0.3, 0.55)
c = say("o2_nar", c + 1.15)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 3 · КАК НОСИТЕЛЬ: sweet line -> "That you'd watch me play?" -> he pats the free cushion next to the TV -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.4, 0.45)
b0 = c + 0.3; c = say("o3_b", b0)
ev["pat"] = b0 + 0.5
for k in range(4): cue("thud", ev["pat"] + 0.08 + k * 0.3, 0.25)
c = say("o3_nar", c + 1.05)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: grand line, she already holds his controller -> TV insert «PASSWORD CHANGED» -> he gasps "You changed the password?!"
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o4_h", h0)
ow = word_times("o4_h")
pw = next((h0 + w[1] for w in ow if w[0].lower().startswith("password")), c - 1.4) if ow else c - 1.4
ev["tv"] = c + 0.02; ev["lock"] = c + 0.12; cue("err", c + 0.12, 0.55)
ev["gasp"] = c + 0.62; cue("gasp", c + 0.64, 0.7)
c = say("o4_b", c + 0.78)
ev["mash"] = c + 0.1
for k in range(5): cue("click", c + 0.12 + k * 0.13, 0.5)
ev["wrong"] = c + 0.8; cue("err", c + 0.8, 0.55)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.4), ev=RD(ev))); t = c + 1.4

# ---- twist (music silent): she plays happily with BOTH controllers, he slides to the edge of the sofa -> "...Can I at least watch?" -> she wins -> moral
s = t; ev = dict(beat=s, play=s + 0.15)
cue("game", s + 0.15, 0.55)
ev["edge"] = s + 1.1; cue("squeak", s + 1.15, 0.35)
c = say("end_b", s + 1.9)
ev["win"] = c + 0.35; cue("game", c + 0.2, 0.45); cue("tada", c + 0.4, 0.55)
ev["dance"] = c + 0.9
c = say("moral", c + 1.5)
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
# long lines as consecutive meaning chunks (each its own bubble)
cfg["chunks"] = {
    "o2_h": [["Great.", "Отлично."], ["Then your birthday present is a hair dryer.", "Тогда тебе на день рождения — фен."]],
    "o3_h": [["It's the thought that counts...", "Главное — внимание…"], ["but what were you thinking?", "но о чём ты думал?"]],
    "o4_h": [["Darling, I'm touched.", "Дорогой, я тронута."], ["I'll treasure it —", "Буду беречь —"], ["especially the password I just changed.", "особенно пароль, который я только что сменила."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
