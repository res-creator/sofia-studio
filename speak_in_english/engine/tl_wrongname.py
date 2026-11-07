"""python3 tl_wrongname.py -> eps/wrongname/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "wrongname"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = hallway, his mum already hugs Anna (bouquet squashed); her line at 0.15 s; Anna freezes; narrator + comment plate; photo insert WILL & KATIE
cue("doorbell", 0.0, 0.3); cue("squeak", 0.1, 0.35)
t = say("hook_m", 0.15)
hev = dict(freeze=t + 0.02, title_out=2.6); cue("scratch", t + 0.02, 0.5)
t += 0.35
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["photo"] = wat(7) - 0.1       # «назвала меня именем его бывшей» -> insert: the framed photo WILL & KATIE
cue("ding", hev["photo"] + 0.25, 0.4)
hev["wide"] = wat(12) - 0.05      # «Что сказать?» -> back to the two of them
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "It's Anna." (arms crossed) -> mum: "...Like Katie, but... shorter." (hands show a size, then squeeze it smaller) -> Anna's eye twitches -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35); cue("stamp", c - 0.5, 0.35)
m0 = c + 0.42; c = say("o1_m", m0); mw = word_times("o1_m") or []
sh = next((m0 + w[1] for w in mw if w[0].lower().startswith("short")), c - 0.6)
ev["size"] = sh - 1.2; ev["short"] = sh - 0.05; cue("squeak", sh, 0.45)
ev["twitch"] = c + 0.3
for k in range(3): cue("blink", c + 0.35 + k * 0.22, 0.5)
c = say("o1_nar", c + 1.0)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: "Katie? Great — then Katie can do the dishes." -> "Ha! I like you, Katie." -> mum loads a tall stack of plates into Anna's arms -> narrator
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
ev["point"] = c - 1.3
c = say("o2_m", c + 0.42)
ev["load"] = c + 0.05; cue("whoosh", c + 0.05, 0.4); cue("clank", c + 0.3, 0.55)
ev["wobble"] = c + 0.45; cue("clank", c + 0.9, 0.3)
c = say("o2_nar", c + 1.05)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 3 · КАК НОСИТЕЛЬ: light correction -> mum blushes, hands to her cheeks -> insert: the KATIE photo is laid face-down -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c = say("o3_m", c + 0.42)
ev["flip"] = c + 0.15; cue("thud", c + 0.55, 0.55)
c = say("o3_nar", c + 1.0)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: "...I'm Anna — the upgrade." (sparkles) -> mum lowers her glasses, looks her up and down: "...The upgrade. I like her." -> nods
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o4_h", h0); ow = word_times("o4_h") or []
up = next((h0 + w[1] for w in ow if w[0].lower().startswith("upgrade")), c - 0.6)
ev["shine"] = up - 0.05; cue("sparkle", up, 0.55)
m0 = c + 0.3; ev["scan"] = m0 - 0.05; cue("brow", m0, 0.4)
c = say("o4_m", m0)
ev["nod"] = c + 0.05; cue("pop", c + 0.1, 0.35); cue("pop", c + 0.35, 0.3)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.85), ev=RD(ev))); t = c + 0.85

# ---- twist (music silent): the front door creaks open, the boyfriend walks in: "Mum, this is Anna." -> mum winks: "I know, darling. I was testing her."
#      -> insert: her clipboard «GIRLFRIEND TEST» gets the last tick + PASSED stamp -> Anna's jaw drops, then she laughs; the moral
s = t; ev = dict(beat=s, door=s + 0.3)
cue("creak", s + 0.3, 0.6); cue("knock", s + 0.25, 0.0)
ev["walk"] = s + 0.55
c = say("end_b", s + 1.25)
ev["wink"] = c + 0.1; cue("blink", c + 0.15, 0.6)
c = say("end_m", c + 0.5)
ev["clip"] = c + 0.05; ev["tick"] = c + 0.4; cue("pop", c + 0.45, 0.5); ev["stamp"] = c + 0.85; cue("stamp", c + 0.9, 0.7)
ev["gasp"] = c + 1.35; cue("gasp", c + 1.4, 0.6)
ev["laugh"] = c + 1.8; cue("tada", c + 1.85, 0.45)
c = say("moral", c + 2.0)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in ow if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8
sfx = [x for x in sfx if x["g"] > 0]

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
    "o1_m": [["Of course, dear. Anna.", "Конечно, дорогая. Анна."], ["Like Katie, but... shorter.", "Как Кэти, только… короче."]],
    "o2_h": [["Katie? Great —", "Кэти? Отлично —"], ["then Katie can do the dishes.", "значит, посуду моет Кэти."]],
    "o3_h": [["Oh, it's Anna, actually —", "Ой, вообще-то я Анна —"], ["easy mix-up!", "бывает, легко перепутать!"]],
    "o4_h": [["Lovely to meet you too.", "Мне тоже очень приятно."], ["I'm Anna — the upgrade.", "Я Анна — улучшенная версия."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
