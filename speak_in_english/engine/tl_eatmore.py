"""python3 tl_eatmore.py -> eps/eatmore/timeline.json  (rubric «Наше за границей», 4 answers: hook / o1..o4 / end (twist + moral) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "eatmore"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
# character lines with hand-measured phrase spans (audio energy), so the meaning chunks pop in with the voice
SPANS = {
    "o3_h": [("Feeding you is how she says she loves you.", 0.03, 2.52), ("Tell her: 'I'm stuffed. That was delicious.'", 2.83, 5.66)],
    "o4_h": [("Callum, in this house an empty plate means 'still hungry'.", 0.13, 4.96), ("Leave one dumpling.", 5.5, 7.0), ("It's a white flag.", 7.3, 8.41)],
    "o3_b": [("It worked!", 0.03, 0.77), ("She's...", 1.08, 1.5), ("packing me leftovers.", 1.82, 3.33)],
}
def spread(txt, a, b):
    ws = txt.split(); wl = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wl); out = []; c = a
    for w, l in zip(ws, wl): d = (b - a) * l / tot; out.append([w, R(c), R(c + d)]); c += d
    return out
def word_times(lid):
    if lid in SPANS: return [w for txt, a, b in SPANS[lid] for w in spread(txt, a, b)]
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def opt(s): cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=s)

# ---- hook: frame 0 = her parents' dining table: mum has just put the FIFTH plate in front of Callum (a dumpling tower taller than his head),
#      four empty plates stacked beside him, grandpa asleep with a fork, chewing; Callum whispers to her at 0.2 s
cue("clank", 0.02, 0.45); cue("plop", 0.1, 0.3)
t = say("hook_b", 0.2)
hev = dict(title_out=2.55)
t += 0.3
hev["nar"] = t; e = say("hook", t)
hev["mum"] = t - 0.05                       # «Мама кормит иностранца» -> mum beams, ladle in hand, pot steaming
hev["cu"] = wat("hook", t, 3) - 0.05        # «Научи его выжить» -> Callum close-up behind the tower, sweating
hev["wide"] = wat("hook", t, 7) - 0.05      # «четыре способа» -> wide: grandpa chews in his sleep
cue("plop", hev["mum"] + 0.4, 0.35); cue("gulp", hev["cu"] + 0.3, 0.4); cue("snore", hev["wide"] + 0.1, 0.5)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=RD(hev))); t = e + 0.3

# ---- 1 · В ЛОБ: "Eat. Or she cries." -> mum's lip trembles, a tear -> "...Pass the dumplings." -> he eats with two forks at once in panic
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
ev["tear"] = c + 0.05; cue("sniff", c + 0.15, 0.5)
c = say("o1_b", c + 1.0)
ev["forks"] = c + 0.05
for k in range(8): cue("chomp", c + 0.1 + k * 0.22, 0.45)
ev["beam"] = c + 0.9; cue("sparkle", c + 0.95, 0.35)
ev["facepalm"] = c + 1.3
c = say("o1_nar", c + 1.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 2 · ВЕЖЛИВО: "Maybe say no, but politely?" -> "I did. She heard 'more, please'." -> mum beams and ladles more: the tower grows over his face
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
c = say("o2_b", c + 0.3)
ev["ladle"] = c + 0.05
for k in range(4): cue("plop", c + 0.3 + k * 0.32, 0.5)
ev["hidden"] = c + 1.6; cue("boing", c + 1.65, 0.3)
c = say("o2_nar", c + 2.0)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 3 · КАК НОСИТЕЛЬ: the speech (2 chunks) -> he pats his belly and puts a hand on his heart to mum, she melts (drawn hearts)
#      -> "It worked! She's... packing me leftovers." -> she drops a bag with a tower of containers into his arms -> narrator + tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35)
ev["pat"] = c + 0.1; cue("pop", c + 0.2, 0.3)
ev["melt"] = c + 0.7; cue("sparkle", c + 0.75, 0.45)
c0 = c + 1.25; c = say("o3_b", c0)
ev["bag"] = R(c0 + 1.75); cue("rustle", ev["bag"], 0.55); cue("thud", ev["bag"] + 0.45, 0.4)
ev["stagger"] = c + 0.35; cue("boing", c + 0.4, 0.3)
c = say("o3_nar", c + 1.1)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: the grand line (3 chunks) -> he solemnly leaves ONE dumpling with a tiny white flag in the middle of the plate
#      -> "...One dumpling. For peace." -> mum nods with respect and carries the pot away; grandpa salutes with his fork in his sleep
s = t; ev = opt(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["place"] = c + 0.1; cue("whoosh", c + 0.15, 0.3); cue("clank", c + 0.6, 0.3)
ev["flag"] = c + 0.85; cue("sparkle", c + 0.9, 0.45)
c0 = c + 1.35; c = say("o4_b", c0)
ev["nod"] = c + 0.1; cue("bell", c + 0.2, 0.35)
ev["salute"] = c + 0.9; cue("snore", c + 0.95, 0.45)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.7), ev=RD(ev))); t = c + 1.7

# ---- twist (music silent): «ГОД СПУСТЯ» — Callum's mum's house in England: he puts a SECOND full plate in front of his mum
#      -> "Callum, love... what have they done to you?" -> he proudly holds up the ladle -> moral
s = t; ev = dict(beat=s, place=s + 0.45)
cue("whoosh", s, 0.5); cue("clank", s + 0.85, 0.45)
c = say("end_m", s + 1.3)
ev["proud"] = c + 0.1; cue("ding", c + 0.15, 0.4)
ev["ladle"] = c + 0.6; cue("sparkle", c + 0.65, 0.4)
ev["third"] = c + 1.15; cue("clank", c + 1.25, 0.45); cue("gasp", c + 1.4, 0.45)
c = say("moral", c + 2.0)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «А ТЫ БЫ ОТВЕТИЛА КАК?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor) -> then the comment question «СКОЛЬКО ТАРЕЛОК...»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in word_times("outro") if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
c0 = c + 0.35; cue("whoosh", c0 - 0.1, 0.45); cue("pop", c0, 0.5)
c = say("ask", c0)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9), ev=RD(dict(ask=c0)))); t = c + 0.9

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
    "o3_h": [["Feeding you is how she says she loves you.", "Кормить тебя — это её способ сказать, что она тебя любит."], ["Tell her: 'I'm stuffed. That was delicious.'", "Скажи ей: «Я объелся. Было очень вкусно»."]],
    "o4_h": [["Callum, in this house an empty plate means 'still hungry'.", "Каллум, в этом доме пустая тарелка значит «ещё голоден»."], ["Leave one dumpling.", "Оставь один пельмень."], ["It's a white flag.", "Это белый флаг."]]
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
