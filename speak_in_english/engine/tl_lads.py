"""python3 tl_lads.py -> eps/lads/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "lads"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
# character lines: phrase segments measured from the squeezed audio (speech between the silences) -> word timings by characters
SEG = {
    "hook_m": [("The lads and I are going to Spain.", 0.0, 1.58), ("Just a week.", 1.89, 2.56), ("You don't mind, right?", 2.89, 3.8)],
    "o2_h": [("Great!", 0.0, 0.41), ("Then I'm going to Paris.", 0.63, 1.78), ("With your credit card.", 2.08, 3.18)],
    "o4_h": [("Of course, darling.", 0.0, 1.29), ("Have fun.", 1.42, 2.08), ("I'll be at the spa —", 2.65, 3.54), ("the five-star one.", 4.08, 4.94), ("You're paying for both.", 5.6, 6.46)],
    "end_m": [("Dave can't come.", 0.0, 0.91), ("Mike can't come.", 1.23, 2.17), ("Tom's wife said no...", 2.47, 3.81), ("So,", 4.01, 4.48), ("Paris?", 4.68, 5.17)],
    "o1_m": [("Really?", 0.0, 0.58), ("...Why does that sound scary?", 0.94, 2.6)],
    "o3_h": [("Sure,", 0.0, 0.48), ("as long as we plan a trip together, too.", 0.8, 2.7)],
}
def seg_words(lid):
    out = []
    for txt, a, b in SEG[lid]:
        ws = txt.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, k in zip(ws, wt): t0 = a + cc / tot * (b - a); cc += k; out.append([w, round(t0, 3), round(a + cc / tot * (b - a), 3)])
    return out
def word_times(lid):
    if lid in SEG: return seg_words(lid)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)

# ---- hook: frame 0 = living room, he already holds the fishing rod + cooler box, she has her arms crossed; his line at 0.15 s
cue("pop", 0.05, 0.35)
h0 = 0.15; t = say("hook_m", h0)
hev = dict(title_out=2.6, rod=h0 + 0.2, wink=h0 + 2.89)
cue("boing", h0 + 0.35, 0.3)
t += 0.3
hev["nar"] = t; e = say("hook", t)
hev["plate"] = t; cue("pop", t, 0.55)
hev["shades"] = wat("hook", t, 3) - 0.08   # «муж собрался в отпуск» -> his single: he flips his sunglasses down
hev["her"] = wat("hook", t, 9) - 0.08      # «Без меня.» -> her close-up, glare
hev["wide"] = wat("hook", t, 13) - 0.08    # «Четыре ответа» -> wide
cue("whoosh", hev["shades"] + 0.1, 0.35); cue("brow", hev["her"] + 0.1, 0.5)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.15), ev=RD(hev))); t = e + 0.15

# ---- 1 · ХОЛОДНО: "Fine. Go." (she points at the door) -> "Really? ...Why does that sound scary?" he hugs the cooler box, sweats -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35); ev["door"] = c - 0.55; cue("creak", c - 0.4, 0.35)
c0 = c + 0.3; c = say("o1_m", c0)
ev["hug"] = c0 + 0.9; cue("squeak", c0 + 0.95, 0.4); ev["shake"] = c - 0.2
c = say("o1_nar", c + 0.7); cue("tick", c - 1.5, 0.25); cue("tick", c - 1.0, 0.25)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: "Great! Then I'm going to Paris. With your credit card." -> insert: his card on the Eiffel Tower postcard -> "...How about we all go to Spain?" -> she holds the card out of reach
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o2_h", h0)
ev["card"] = R(h0 + 2.0); cue("whoosh", h0 + 2.0, 0.4); cue("sparkle", h0 + 2.2, 0.4)
ev["ins"] = R(c + 0.12); cue("register", c + 0.25, 0.55)
c0 = c + 1.2; ev["ins_out"] = R(c0 - 0.1); c = say("o2_m", c0)
ev["drop"] = R(c0 + 0.15); cue("clank", c0 + 0.2, 0.45)
ev["grab"] = R(c + 0.1); cue("whoosh", c + 0.15, 0.35); cue("boing", c + 0.55, 0.35)
c = say("o2_nar", c + 0.6)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 3 · КАК НОСИТЕЛЬ: "Sure, as long as we plan a trip together, too." -> "Deal. Anywhere you want." -> handshake (hearts) -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35)
c0 = c + 0.3; c = say("o3_m", c0)
ev["shake"] = R(c + 0.05); cue("clapclap", c + 0.2, 0.4); cue("sparkle", c + 0.15, 0.45)
c = say("o3_nar", c + 0.55)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: sweet line with the spa brochure -> brochure insert (★★★★★, 2 GUESTS) -> "...Both?" gulp -> he opens his wallet: a moth flies out
s = t; ev = opt(s)
h0 = s + 0.35; c = say("o4_h", h0)
ev["broch"] = R(h0 + 2.65); cue("whoosh", h0 + 2.6, 0.4)
ev["ins"] = R(c + 0.1); cue("sparkle", c + 0.2, 0.5); cue("register", c + 0.55, 0.5)
c0 = c + 1.25; ev["ins_out"] = R(c0 - 0.1); c = say("o4_m", c0); cue("gulp", c0 + 0.1, 0.6)
ev["wallet"] = R(c + 0.15); cue("creak", c + 0.25, 0.4)
ev["moth"] = R(c + 0.45); cue("feather", c + 0.5, 0.6)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.6), ev=RD(ev))); t = c + 1.6

# ---- twist (music silent): his phone buzzes -> group chat insert "LADS TRIP": Dave / Mike / Tom drop out as he reads -> "So, Paris?" sheepish -> she shows the Paris postcard -> moral
s = t; ev = dict(beat=s, buzz=s + 0.25)
cue("buzz", s + 0.25, 0.6); cue("buzz", s + 0.7, 0.55)
ev["chat"] = R(s + 0.95); cue("whoosh", s + 0.95, 0.35)
b0 = s + 1.25; c = say("end_m", b0)
for i, k in enumerate(("m1", "m2", "m3")):
    ev[k] = R(b0 + SEG["end_m"][i][1] - 0.05); cue("msg", ev[k], 0.5)
ev["so"] = R(b0 + SEG["end_m"][3][1] - 0.15)
ev["paris"] = R(c + 0.25); cue("pop", c + 0.3, 0.5); cue("tada", c + 0.4, 0.45)
ev["case"] = R(c + 1.0); cue("thud", c + 1.05, 0.4)
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
# long lines as consecutive meaning chunks (each its own bubble)
cfg["chunks"] = {
    "hook_m": [["The lads and I are going to Spain.", "Мы с парнями едем в Испанию."], ["Just a week. You don't mind, right?", "Всего на неделю. Ты же не против?"]],
    "o2_h": [["Great! Then I'm going to Paris.", "Отлично! Тогда я еду в Париж."], ["With your credit card.", "С твоей кредиткой."]],
    "o4_h": [["Of course, darling. Have fun.", "Конечно, дорогой. Отдыхай."], ["I'll be at the spa — the five-star one.", "А я буду в спа — в пятизвёздочном."], ["You're paying for both.", "Платишь за оба."]],
    "end_m": [["Dave can't come. Mike can't come. Tom's wife said no...", "Дэйв не едет. Майк не едет. Тому жена не разрешила…"], ["So, Paris?", "Так что, Париж?"]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
