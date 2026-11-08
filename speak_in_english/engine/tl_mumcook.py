"""python3 tl_mumcook.py -> eps/mumcook/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "mumcook"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = kitchen table, she watches him hopefully; he pokes her cutlet with a fork and sniffs it; his line at 0.15 s; she freezes
cue("pop", 0.05, 0.35); cue("clank", 0.35, 0.25)
t = say("hook_b", 0.15)
hev = dict(poke=0.0, freeze=t + 0.02, title_out=2.6); cue("scratch", t, 0.5)
t += 0.35
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["says"] = wat(3) - 0.05      # «он всё время говорит…» -> he chews, waves the fork like a connoisseur
hev["how"] = wat(11) - 0.05      # «Как ответить…» -> her close-up, arms crossed
hev["wide"] = wat(15) - 0.05     # «Четыре ответа» -> wide
cue("clank", hev["says"] + 0.3, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "Then go to mum." -> "Great idea! She's free on Sunday." -> he already dials mum (phone insert CALLING MUM) -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
ev["idea"] = c + 0.05; cue("ding", c + 0.08, 0.45)
c = say("o1_b", c + 0.3)
ev["grab"] = SP0 = c - 1.2; cue("whoosh", c - 1.15, 0.3)
ev["dial"] = c + 0.1
for k in range(4): cue("pop", c + 0.15 + k * 0.13, 0.3)
ev["insert"] = c + 0.25; cue("ring", c + 0.45, 0.5)
c = say("o1_nar", c + 0.6)
ev["back"] = c + 0.05
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.45), ev=RD(ev))); t = c + 0.45

# ---- 2 · С ЮМОРОМ: socks + "my little sunshine" -> "Yes, please! Ironed socks are the best." -> he happily holds a pair of socks out across the table
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
c = say("o2_b", c + 0.3)
ev["socks"] = c - D["o2_b"] + 0.95; cue("whoosh", ev["socks"], 0.35); cue("sparkle", ev["socks"] + 0.15, 0.4)
ev["offer"] = c + 0.1; cue("boing", c + 0.15, 0.35)
c = say("o2_nar", c + 0.55)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- 3 · КАК НОСИТЕЛЬ: "You're welcome to cook tomorrow. I'll be the judge." (judge paddle) -> "…Toast counts as cooking, right?" (burnt smoking toast)
s = t; ev = opt(s)
c = say("o3_h", s + 0.35)
ev["paddle"] = c - D["o3_h"] + 1.85; cue("pop", ev["paddle"], 0.45)
c = say("o3_b", c + 0.3)
ev["toast"] = c - D["o3_b"] + 0.05; cue("plop", ev["toast"] + 0.05, 0.35); cue("beep", c + 0.05, 0.4)
ev["score"] = c + 0.45; cue("stamp", c + 0.5, 0.45)
c = say("o3_nar", c + 1.0)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: grand line -> "…Your cutlets are lovely. Very lovely." while he shovels everything in -> spotless plate (sparkle)
s = t; ev = opt(s)
c = say("o4_h", s + 0.35)
ev["gulp"] = c + 0.05; cue("gulp", c + 0.1, 0.45)
c0 = c + 0.3; ev["eat"] = c0 - 0.05
for k in range(9): cue("chomp", c0 + k * 0.24, 0.45)
c = say("o4_b", c0)
ev["clean"] = c + 0.25; cue("ding", c + 0.3, 0.6); cue("sparkle", c + 0.32, 0.55)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.0), ev=RD(ev))); t = c + 1.0

# ---- twist (music silent): his phone buzzes on the table, MUM calling -> she taps speaker -> phone insert -> mum: "...She used my recipe — I sent it this morning!"
s = t; ev = dict(beat=s, buzz=s + 0.25)
for k in range(3): cue("vibe", s + 0.25 + k * 0.5, 0.5)
ev["tap"] = s + 1.45; cue("pop", s + 1.5, 0.5)
ev["insert"] = s + 1.65
c = say("end_m", s + 1.95)
ev["recipe"] = c - D["end_m"] + 2.35          # chunk 2 «She used my recipe —» -> two-shot: she holds up the recipe card, he chokes
cue("cough", ev["recipe"] + 0.35, 0.5); cue("sparkle", ev["recipe"] + 0.2, 0.4)
ev["face"] = c + 0.2; cue("thud", c + 0.25, 0.3)
ev["wink"] = c + 0.9; cue("ding", c + 0.95, 0.4)
c = say("moral", c + 1.3)
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
    "o2_h": [["Shall I also iron your socks", "Может, мне ещё гладить тебе носки"], ["and call you 'my little sunshine'?", "и звать тебя «моё солнышко»?"]],
    "o3_h": [["Then you're welcome to cook tomorrow.", "Тогда завтра готовишь ты."], ["I'll be the judge.", "А я буду судить."]],
    "o4_h": [["Your mum's had thirty years of practice", "У твоей мамы тридцать лет практики"], ["and one very loyal customer.", "и один очень преданный клиент."], ["I've had three months —", "У меня — три месяца"], ["and a critic.", "и критик."]],
    "end_m": [["Darling, how was the cutlet?", "Дорогой, как котлета?"], ["She used my recipe —", "Она готовила по моему рецепту —"], ["I sent it this morning!", "я утром отправила!"]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
