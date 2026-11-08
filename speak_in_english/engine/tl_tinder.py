"""python3 tl_tinder.py -> eps/tinder/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "tinder"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
# character lines: phrase segments measured from the squeezed audio (speech between the silences, checked by ASR) -> word timings by characters
SEG = {
    "hook_b": [("It's an ad!", 0.03, 0.72), ("It just popped up!", 0.96, 1.81), ("Honest!", 2.05, 2.5)],
    "o1_h": [("Ad.", 0.02, 0.55), ("Sure.", 0.89, 1.48), ("Liar.", 1.79, 2.3)],
    "o1_b": [("It's true!", 0.03, 0.95), ("Look, it even says 'match'!", 1.09, 2.18)],
    "o2_b": [("It's the algorithm!", 0.12, 1.27), ("It's very clever.", 1.58, 2.6)],
    "o3_h": [("Funny —", 0.0, 0.61), ("an ad with your photo and your bio.", 0.8, 3.61), ("Want to try that again?", 3.91, 5.5)],
    "o3_b": [("…Okay.", 0.03, 0.5), ("I downloaded it.", 0.81, 1.46), ("In March.", 1.79, 2.4)],
    "o4_h": [("Sure.", 0.02, 0.63), ("And the ad also wrote", 0.88, 2.67), ("'six foot,", 2.87, 3.62), ("loves hiking'?", 3.86, 5.08), ("You're five-nine and you get tired on stairs.", 5.35, 8.53)],
    "end_b": [("Wait…", 0.02, 0.32), ("why have YOU got a match with me?", 0.6, 2.93)],
}
def seg_words(lid):
    out = []
    for txt, a, b in SEG[lid]:
        ws = txt.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, k in zip(ws, wt):
            t0 = a + cc / tot * (b - a); cc += k
            if re.fullmatch(r"[—–-]+", w) and out: out[-1][0] += " —"; out[-1][2] = round(a + cc / tot * (b - a), 3); continue
            out.append([w, round(t0, 3), round(a + cc / tot * (b - a), 3)])
    return out
def word_times(lid):
    if lid in SEG: return seg_words(lid)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    return [list(x) for x in w]
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)

# ---- hook: frame 0 = living room, his phone glows on the coffee table (dating app), he is already lunging for it; his line at 0.15 s
cue("whoosh", 0.02, 0.45)
h0 = 0.15; t = say("hook_b", h0)
hev = dict(title_out=2.6, grab=h0 + 0.25, honest=h0 + 2.0)
cue("pop", h0 + 0.27, 0.45); cue("boing", h0 + 0.4, 0.3)
t += 0.3
hev["nar"] = t; e = say("hook", t)
hev["plate"] = t; cue("pop", t, 0.55)
hev["hus"] = wat("hook", t, 3) - 0.08     # «увидела у него открытое приложение» -> his single: phone clutched to the chest, sweat
hev["her"] = wat("hook", t, 9) - 0.08     # «клянётся» -> her close-up, one eyebrow
hev["wide"] = wat("hook", t, 15) - 0.08   # «Четыре ответа» -> wide
cue("gulp", hev["hus"] + 0.3, 0.45); cue("brow", hev["her"] + 0.1, 0.5)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.15), ev=RD(hev))); t = e + 0.15

# ---- 1 · ХОЛОДНО: "Ad. Sure. Liar." (open palm at him on "Liar") -> "It's true! Look, it even says 'match'!" he turns the screen to her -> insert IT'S A MATCH! -> narrator
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o1_h", h0); ev["liar"] = R(h0 + SEG["o1_h"][2][1] - 0.1)
c0 = c + 0.3; c = say("o1_b", c0); ev["show"] = R(c0 + SEG["o1_b"][1][1] - 0.05)
ev["ins"] = R(c + 0.1); cue("ding", c + 0.15, 0.6); cue("sparkle", c + 0.2, 0.5)
ev["ins_out"] = R(c + 1.35)
c = say("o1_nar", c + 1.25)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: "Wow, that ad really knows your type." -> insert: the "ads" are all the same redhead (AMBER 27 / 26 / 28) swiped away -> "It's the algorithm! It's very clever." serious nod -> narrator
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o2_h", h0)
ev["ins"] = R(c + 0.1)
for i in range(3): cue("whoosh", c + 0.45 + i * 0.4, 0.3)
c0 = c + 1.45; ev["ins_out"] = R(c0 - 0.1); c = say("o2_b", c0)
ev["nod"] = R(c0 + 1.5)
c = say("o2_nar", c + 0.45)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 3 · КАК НОСИТЕЛЬ: she takes the phone -> insert: HIS profile (his photo, JAKE 29, EDIT PROFILE) -> calm line -> "...Okay. I downloaded it. In March." he deflates like a balloon -> narrator -> Bella tip
s = t; ev = opt(s)
ev["take"] = R(s + 0.3); cue("whoosh", s + 0.3, 0.4)
ev["ins"] = R(s + 0.55); cue("pop", s + 0.6, 0.45)
h0 = s + 1.7; ev["ins_out"] = R(h0 - 0.1); c = say("o3_h", h0)
c0 = c + 0.3; c = say("o3_b", c0)
ev["deflate"] = R(c0 + 0.05); cue("deflate", c0 + 0.05, 0.6)
c = say("o3_nar", c + 0.5)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: sweet line reading his bio -> insert: bio 6'0" / LOVES HIKING crossed out in red marker -> "...I'm deleting the ad." he goes up on tiptoe next to the height chart
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o4_h", h0)
ev["ins"] = R(c + 0.1); cue("scratch", c + 0.45, 0.35); cue("scratch", c + 0.95, 0.35)
c0 = c + 1.45; ev["ins_out"] = R(c0 - 0.1); c = say("o4_b", c0)
ev["tip"] = R(c0 + 0.1); cue("squeak", c0 + D["o4_b"] + 0.05, 0.35); cue("strain", c0 + D["o4_b"] + 0.25, 0.3)
ev["down"] = R(c + 0.65); cue("thud", c + 0.7, 0.35)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.0), ev=RD(ev))); t = c + 1.0

# ---- twist (music silent): her bag pings -> she looks at her phone -> he peeks -> insert HER screen: IT'S A MATCH! with HIM -> "Wait... why have YOU got a match with me?" -> her guilty grin -> moral (both laugh)
s = t; ev = dict(beat=s, ping=s + 0.3)
cue("msg", s + 0.3, 0.6)
ev["look"] = R(s + 0.6); cue("whoosh", s + 0.6, 0.3)
ev["peek"] = R(s + 1.0)
ev["ins"] = R(s + 1.2); cue("ding", s + 1.25, 0.55)
b0 = s + 2.4; ev["ins_out"] = R(b0 - 0.12); c = say("end_b", b0)
ev["busted"] = R(c + 0.12); cue("gulp", c + 0.2, 0.5)
ev["laugh"] = R(c + 0.85)
c = say("moral", c + 0.85); cue("sparkle", c - D["moral"] + 0.1, 0.4)
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
    "hook_b": [["It's an ad! It just popped up!", "Это реклама! Она сама выскочила!"], ["Honest!", "Честно!"]],
    "o1_b": [["It's true!", "Это правда!"], ["Look, it even says 'match'!", "Смотри, там даже написано «совпадение»!"]],
    "o3_h": [["Funny — an ad with your photo and your bio.", "Забавно — реклама с твоим фото и твоим описанием."], ["Want to try that again?", "Попробуешь ещё раз?"]],
    "o4_h": [["Sure. And the ad also wrote 'six foot, loves hiking'?", "Конечно. И реклама тоже написала «рост метр восемьдесят, люблю походы»?"], ["You're five-nine and you get tired on stairs.", "Ты метр семьдесят пять и устаёшь на лестнице."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
