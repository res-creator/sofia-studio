"""python3 tl_spoiler.py -> eps/spoiler/timeline.json  (rubric answers4 «Как ответить, когда…»: hook / o1 / o2 / o3 / o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "spoiler"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
    for i in range(1, len(out)):   # keep word times monotonic (the aligner swapped two words in `moral`)
        if out[i][1] < out[i - 1][1] + 0.08: out[i][1] = round(out[i - 1][1] + 0.12, 3)
        if out[i][2] < out[i][1] + 0.08: out[i][2] = round(out[i][1] + 0.12, 3)
        if out[i - 1][2] > out[i][1]: out[i - 1][2] = out[i][1]
    return out
R = lambda x: round(x, 3)
# character lines shown as meaning chunks, timed by the real pauses in the takes: id -> [(en, ru, seg_start, seg_end)]
CHUNKS = {
    "o1_f": [("Okay.", "Хорошо.", 0.0, 0.52), ("And then the dog dies too.", "А потом ещё и собака умирает.", 0.84, 2.37)],
    "o2_f": [("Don't worry, the wedding is fine.", "Не волнуйся, свадьба — нормально.", 0.15, 2.31), ("The funeral, though...", "А вот похороны…", 2.64, 3.72)],
    "o3_h": [("No spoilers, please —", "Без спойлеров, пожалуйста —", 0.1, 1.43), ("I'm only on episode three.", "я только на третьей серии.", 1.82, 3.16)],
    "o4_h": [("One more word, darling,", "Ещё одно слово, дорогая,", 0.08, 1.49), ("and I'll tell you how your book ends.", "и я расскажу, чем кончается твоя книга.", 1.8, 3.58)],
    "end_f": [("...Wait. Which show are you watching?", "…Стоп. А ты какой сериал смотришь?", 0.0, 2.31), ("Oh, that one?", "А, этот?", 3.2, 3.91), ("The butler did it.", "Убийца — дворецкий.", 4.44, 5.61)],
}
def seg_words(sp):
    out = []
    for en, ru, a, b in CHUNKS[sp["id"]]:
        ws = en.split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wts); cc = 0
        for w, x in zip(ws, wts): out.append([w, round(a + cc / tot * (b - a), 3), round(a + (cc + x) / tot * (b - a), 3)]); cc += x
    return out
# inner beats of the friend's lines (from the silences in the takes)
O1F_DOG = 0.84; O2F_FUN = 2.64; EF_WHICH = 0.89; EF_OH = 3.2; EF_BUTLER = 4.44

# ---- hook: live sofa scene, Priya already leaning in; her line at 0.15 s; the heroine freezes with popcorn at her mouth
cue("whoosh", 0.0, 0.3); cue("pop", 0.08, 0.35)
t = say("hook_f", 0.15)
hev = dict(freeze=R(t + 0.02)); cue("scratch", t, 0.55); cue("gasp", t + 0.05, 0.5); cue("drop", t + 0.25, 0.5)
t += 0.45
hev["nar"] = R(t); e = say("hook", t); hw = word_times("hook")
def wat(i): return R(t + hw[i][1])
hev["tv"] = wat(2)          # «третьей серии» -> TV insert: EPISODE 3 of 10
hev["fr"] = wat(5)          # «а подруга уже рассказала финал» -> Priya, proud
hev["four"] = wat(9)        # «Четыре ответа» -> two-shot
cue("pop", hev["tv"], 0.45)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=hev)); t = e + 0.1

def plate_in(s): cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6)

# ---- option 1: «В ЛОБ» — she yells, popcorn flies up; Priya nods and spoils more; tears; popcorn rains on her head
s = t; plate_in(s); ev = dict(plate=R(s))
c = say("o1_h", s + 0.3)
ev["throw"] = R(c - 0.75); cue("boing", c - 0.7, 0.45); ev["duck"] = R(c + 0.05)
f0 = c + 0.6; c = say("o1_f", f0)
ev["dog"] = R(f0 + O1F_DOG); ev["tears"] = R(c + 0.1); cue("deflate", c + 0.1, 0.55)
ev["rain"] = R(c + 0.15); [cue("plop", c + 0.2 + 0.13 * k, 0.35) for k in range(4)]
c = say("o1_nar", c + 1.25)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» — polite; Priya pats her and reassures… the funeral; she hides behind a cushion
s = t; plate_in(s); ev = dict(plate=R(s))
c = say("o2_h", s + 0.3)
f0 = c + 0.3; c = say("o2_f", f0)
ev["fun"] = R(f0 + O2F_FUN); ev["cushion"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.45); cue("thud", c + 0.4, 0.55)
ev["peek"] = R(c + 0.75); cue("squeak", c + 0.8, 0.4); ev["poke"] = R(c + 1.05); cue("boing", c + 1.1, 0.35)
c = say("o2_nar", c + 1.45)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 3: «КАК НОСИТЕЛЬ» — short + where you are (remote at the TV: EP 3); Priya clamps her mouth shut (zip); tip plate
s = t; plate_in(s); ev = dict(plate=R(s))
c = say("o3_h", s + 0.3); ev["ep3"] = R(c - 1.5)
f0 = c + 0.3; c = say("o3_f", f0)
ev["zip"] = R(c + 0.05); cue("zip", c + 0.05, 0.7); ev["key"] = R(c + 0.6); cue("whoosh", c + 0.6, 0.45); cue("ding", c + 1.05, 0.3)
c = say("o3_nar", c + 1.4)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» — she sweetly takes Priya's book and opens it at the last page; Priya snatches it back
s = t; plate_in(s); ev = dict(plate=R(s)); cue("sparkle", s + 0.2, 0.5)
h0 = s + 0.35; ev["take"] = R(h0 + 0.2); cue("whoosh", h0 + 0.2, 0.4)
c = say("o4_h", h0)
ev["book"] = R(c - 1.6); cue("paper", c - 1.55, 0.6)          # «…how your book ends» -> insert: the last page
f0 = c + 0.3; ev["snatch"] = R(f0 - 0.05); cue("whoosh", f0 - 0.05, 0.6); cue("gasp", f0, 0.6)
c = say("o4_f", f0)
ev["hug"] = R(c + 0.05); ev["scoot"] = R(c + 0.45); cue("squeak", c + 0.5, 0.45); ev["sip"] = R(c + 0.95); cue("gulp", c + 1.1, 0.5)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.6), ev=ev)); t = c + 1.6

# ---- twist: one deliberate beat (music silent), Priya: wait… which show? (TV insert) the butler did it. Bowl lands on her head. Moral.
s = t; ev = dict(beat=R(s))
f0 = s + 0.65; c = say("end_f", f0)
ev["which"] = R(f0 + EF_WHICH); ev["tv"] = R(f0 + 2.36); ev["tv_out"] = R(f0 + EF_OH - 0.06); cue("pop", f0 + 2.36, 0.5)
ev["butler"] = R(f0 + EF_BUTLER); cue("impact", c + 0.05, 0.6)
ev["bowl"] = R(c + 0.1); cue("boing", c + 0.1, 0.5); cue("clank", c + 0.55, 0.6); [cue("plop", c + 0.6 + 0.11 * k, 0.3) for k in range(5)]
ev["rim"] = R(c + 0.9); cue("rimshot", c + 0.95, 0.6); ev["pick"] = R(c + 1.4); cue("pop", c + 1.6, 0.3); cue("gulp", c + 1.85, 0.4)
c = say("moral", c + 2.15)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.8))); t = c + 1.8

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None and sp["id"] in CHUNKS: wt = seg_words(sp)
    if wt is None:
        words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["chunks"] = {k: [[en, ru] for en, ru, _, _ in v] for k, v in CHUNKS.items()}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
