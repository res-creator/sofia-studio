"""python3 tl_movein.py -> eps/movein/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "movein"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = her doorway, he already stands there with a big suitcase, toothbrush held up; his line at 0.15 s; she freezes
cue("tada", 0.0, 0.35); cue("pop", 0.1, 0.4)
t = say("hook_b", 0.15)
hev = dict(freeze=t + 0.02, title_out=2.6); cue("scratch", t, 0.5)
t += 0.35
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["week"] = wat(3) - 0.05      # «встречаемся неделю» -> her close-up (mug frozen halfway)
hev["case"] = wat(9) - 0.1       # «чемоданом» -> he pats the huge suitcase
hev["wide"] = wat(12) - 0.05     # «Четыре ответа» -> wide
cue("thud", hev["case"] + 0.25, 0.4); cue("thud", hev["case"] + 0.5, 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "No." -> his face sinks -> "Can I leave my toothbrush, though?" -> he plants it in a cup on her shelf (sparkle) -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
ev["sink"] = c + 0.05; cue("deflate", c + 0.05, 0.35)
c = say("o1_b", c + 0.6)
ev["plant"] = c + 0.1; cue("whoosh", c + 0.15, 0.4); ev["cup"] = c + 0.7; cue("clank", c + 0.72, 0.35); cue("sparkle", c + 0.85, 0.5)
ev["grin"] = c + 0.95
c = say("o1_nar", c + 1.45)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: "...without a hat." -> he slowly takes off the beanie -> bald (shine) -> "...Now you have." -> she drops her mug
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
ev["grab"] = c + 0.1; ev["off"] = c + 0.55; cue("whoosh", c + 0.5, 0.4); ev["shine"] = c + 0.7; cue("ding", c + 0.72, 0.6); cue("sparkle", c + 0.75, 0.5)
c = say("o2_b", c + 1.0)
ev["stare"] = c + 0.15; ev["drop"] = c + 0.45; cue("drop", c + 0.45, 0.4); ev["crash"] = c + 0.85; cue("clank", c + 0.85, 0.55)
c = say("o2_nar", c + 1.35)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 3 · КАК НОСИТЕЛЬ: warm line -> "Right. Sure. Slow. I can do slow." -> he backs out of the door in slow motion with the suitcase -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c = say("o3_b", c + 0.3)
ev["slow"] = c + 0.05; cue("riser_short", c + 0.05, 0.3)
for k in range(4): cue("thud", c + 0.25 + k * 0.33, 0.22)
c = say("o3_nar", c + 1.45)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: grand line (the cat watches from the sofa) -> cat close-up: arches + hisses -> "...She hates me."
s = t; ev = opt(s)
c = say("o4_h", s + 0.35)
ev["cat"] = c + 0.05; ev["hiss"] = c + 0.35; cue("hiss", c + 0.35, 0.7)
c = say("o4_b", c + 1.5)
ev["smug"] = c + 0.1
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.85), ev=RD(ev))); t = c + 0.85

# ---- twist (music silent): he lifts the suitcase to leave -> it bursts open -> food containers «MUM» spill -> insert -> "Mum packed for a month." -> moral
s = t; ev = dict(beat=s, lift=s + 0.3)
cue("strain", s + 0.3, 0.35)
ev["burst"] = s + 1.0; cue("boing", s + 1.0, 0.6); cue("impact", s + 1.05, 0.45)
for k in range(5): cue("clank", s + 1.2 + k * 0.14, 0.3)
ev["insert"] = s + 1.75; cue("pop", s + 1.8, 0.45)
c = say("end_b", s + 3.15)
ev["face"] = c + 0.25; cue("thud", c + 0.3, 0.3)
ev["eat"] = c + 0.9; cue("plop", c + 1.0, 0.35)
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
    "hook_b": [["Surprise!", "Сюрприз!"], ["Let's move in together!", "Давай жить вместе!"], ["It's been a whole week!", "Прошла целая неделя!"]],
    "o4_h": [["Darling, you're lovely.", "Дорогой, ты прелесть."], ["But my cat has to approve —", "Но тебя должна одобрить моя кошка —"], ["and she's still deciding about my last boyfriend.", "а она до сих пор думает насчёт моего прошлого парня."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
