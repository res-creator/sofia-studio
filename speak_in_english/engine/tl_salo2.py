"""python3 tl_salo2.py -> eps/salo2/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (granny twist + moral) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "salo2"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
def est_words(lid, d):   # estimated word timings for character lines (no aligner output): length-weighted with pauses at punctuation
    words = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:…]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz):
        t0 = cc / tot * d; cc += a; wt.append([w, round(t0, 3), round(cc / tot * d, 3)]); cc += p_
    return wt
def wend(lid, w): return next(q[2] for q in est_words(lid, D[lid]) if q[0].lower().strip("…. ").startswith(w))
def wbeg(lid, w): return next(q[1] for q in est_words(lid, D[lid]) if q[0].lower().strip("…. ").startswith(w))
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)

# ---- hook: frame 0 = London party; Nigel holds a rye sandwich with salo up to his eye; the cat on the cupboard (napkin bib) stares at it; his line at 0.15 s
cue("pop", 0.0, 0.35)
t0 = 0.15; t = say("hook_p", t0)
hev = dict(raise_=t0 + wbeg("hook_p", "white") - 0.1, sniff=t0 + wbeg("hook_p", "soap") - 0.05, title_out=2.6)
cue("blink", hev["raise_"] + 0.1, 0.4); cue("gulp", hev["sniff"] + 0.15, 0.35)
t += 0.3
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["salo"] = wat(3) - 0.05      # «Как назвать сало» -> the board close-up
hev["bf"] = wat(6) - 0.05        # «чтобы британец» -> Nigel close-up
hev["cat"] = wat(8) - 0.05       # «попросил добавки?» -> the cat ties its napkin tighter, licks its lips
cue("sparkle", hev["salo"] + 0.1, 0.4); cue("squeak", hev["cat"] + 0.2, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "Fat. Pig. Eat." (deadpan, arms crossed) -> Nigel slowly puts the sandwich back on the board, takes a crisp -> narrator (board close-up)
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
ev["put"] = c + 0.3; ev["land"] = c + 0.3 + 1.0; cue("plop", ev["land"], 0.5)
c0 = c + 0.35; c = say("o1_p", c0)
ev["crisp"] = c0 + wbeg("o1_p", "crisps") - 0.05; cue("scratch", ev["crisp"] + 0.25, 0.2)
c = say("o1_nar", c + 0.3); ev["crunch"] = c - 1.4; cue("snip", ev["crunch"], 0.35)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 2 · С ЮМОРОМ: "like bacon, but it never went to the gym" (she flexes) -> Nigel laughs, holds the sandwich at arm's length -> narrator
s = t; ev = opt(s)
c0 = s + 0.35; c = say("o2_h", c0); ev["flex"] = c0 + wbeg("o2_h", "gym") - 0.35; cue("boing", ev["flex"] + 0.3, 0.35)
c0 = c + 0.3; c = say("o2_p", c0); ev["arm"] = c0 + wbeg("o2_p", "still") - 0.15; cue("whoosh", ev["arm"], 0.3)
c = say("o2_nar", c + 0.35)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 3 · КАК НОСИТЕЛЬ: "It's salo — cured pork fat. Try it on rye bread with garlic." (garlic clove on her palm) -> he rubs the garlic on, bites -> "gorgeous!" (sparkles) -> narrator -> Bella tip
s = t; ev = opt(s)
c0 = s + 0.35; c = say("o3_h", c0); ev["garlic"] = c0 + wbeg("o3_h", "garlic") - 0.4
ev["bite"] = c + 0.15; cue("snip", ev["bite"] + 0.1, 0.45); cue("gulp", ev["bite"] + 0.75, 0.35)
c0 = c + 0.95; c = say("o3_p", c0); ev["wow"] = c0 + wbeg("o3_p", "oh") - 0.05; cue("sparkle", ev["wow"] + 0.1, 0.5)
c = say("o3_nar", c + 0.3)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: she presents the board like a crown on a cushion -> "Two? I'm frightened, but I'm hungry." (a sandwich in each hand, sweating)
s = t; ev = opt(s)
c0 = s + 0.35; c = say("o4_h", c0)
ev["c2"] = c0 + wbeg("o4_h", "it's") - 0.1; ev["c3"] = c0 + wbeg("o4_h", "and") - 0.1; ev["c4"] = c0 + wbeg("o4_h", "show") - 0.1
cue("sparkle", ev["c3"] + 0.3, 0.3)
c0 = c + 0.35; c = say("o4_p", c0); ev["two"] = c0 + 0.05; cue("pop", c0 + 0.2, 0.35); cue("pop", c0 + 0.45, 0.35)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.5), ev=RD(ev))); t = c + 0.5

# ---- twist (music silent): handbag clasp clicks -> Nigel's granny pulls a paper bundle out of her handbag -> insert (paper opens: lardo, tag 1962) -> her line -> wide: the cat leaps onto the table -> moral
s = t; ev = dict(beat=s, clasp=s + 0.1); cue("knob", s + 0.1, 0.5); cue("zip", s + 0.35, 0.4)
ev["pull"] = s + 0.5; cue("whoosh", s + 0.55, 0.35)
ev["insert"] = s + 1.15; cue("feather", s + 1.2, 0.5); cue("tada", s + 1.55, 0.35)
c = say("end_g", s + 2.35)
ev["react"] = c + 0.05; cue("gasp", c + 0.1, 0.4)
ev["jump"] = c + 0.45; cue("whoosh", c + 0.5, 0.45); ev["landc"] = c + 0.95; cue("thud", c + 0.95, 0.45); cue("coo", c + 1.2, 0.3)
c = say("moral", c + 0.6)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the ask «САЛО С ЧЕСНОКОМ ИЛИ БЕЗ?»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in ow if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
c = say("ask", c + 0.3); cue("pop", c - D["ask"], 0.55)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

sfx[:] = [x for x in sfx if x["g"] > 0]
for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    sp["words"] = wt if wt is not None else est_words(sp["id"], sp["d"])
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {
    "o3_h": [["It's salo — cured pork fat.", "Это сало — солёное свиное сало."], ["Try it on rye bread with garlic.", "Попробуй на ржаном хлебе с чесноком."]],
    "o4_h": [["Nigel, this is salo.", "Найджел, это сало."], ["It's crossed borders, fed generations of grandchildren", "Оно пересекало границы, кормило поколения внуков,"], ["and never needed a passport.", "и ему ни разу не понадобился паспорт."], ["Show some respect — take two.", "Прояви уважение — возьми два."]],
    "o2_p": [["Lazy bacon! Love it.", "Ленивый бекон! Обожаю."], ["Still no idea what it is.", "Но всё ещё не понимаю, что это."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
