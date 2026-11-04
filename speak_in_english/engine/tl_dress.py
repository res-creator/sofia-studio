"""python3 tl_dress.py -> eps/dress/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / tw (twist, silent) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "dress"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
# hand-measured word timings (energy envelope) for the lines whose timing drives gags / chunks
MANUAL = {
    "hook_f": [["Surprise!", 0.1, 0.95], ["...Oh.", 1.05, 1.35], ["Nice", 1.7, 1.95], ["dress.", 1.98, 2.4]],
    "o4_h": [["Darling,", 0.05, 0.65], ["it's", 0.7, 0.9], ["not", 0.9, 1.15], ["a", 1.15, 1.25], ["coincidence", 1.25, 1.95], ["—", 1.95, 2.25], ["it's", 2.3, 2.55], ["a", 2.55, 2.65], ["dress", 2.65, 3.0], ["code.", 3.0, 3.45], ["Everyone,", 4.0, 4.5], ["photo!", 4.6, 5.2]],
}

# ---- hook: Chloe already in the doorway with a gift at 0 s, her line at 0.15 s; "...Oh." -> both look down at the SAME red dress; freeze; narrator over quick cuts
cue("doorbell", 0.0, 0.35); cue("pop", 0.1, 0.4)
t = say("hook_f", 0.15)
hev = dict(oh=R(0.15 + 1.05), look=R(0.15 + 1.2)); cue("scratch", 0.15 + 1.15, 0.55)
hev["freeze"] = R(t + 0.02); cue("gasp", t + 0.05, 0.5)
t += 0.35
hev["nar"] = R(t); e = say("hook", t); hw = word_times("hook")
def wat(i): return R(t + hw[i][1])
hev["dress"] = wat(4)      # «подруга пришла в таком же платье» -> the two dresses insert
hev["guests"] = wat(9)     # «Четыре ответа» -> guests in party hats
hev["wide"] = wat(11)      # «от худшего к лучшему» -> wide
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.15), ev=hev)); t = e + 0.15

def opener(s): cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6)

# ---- option 1: «В ЛОБ» — Chloe takes the cake and marches out, door slam
s = t; opener(s); ev = dict(plate=R(s))
c = say("o1_h", s + 0.35)
ev["gasp"] = R(c + 0.05); cue("gasp", c + 0.05, 0.7)
c = say("o1_f", c + 0.3)
ev["grab"] = R(c + 0.3); cue("whoosh", c + 0.3, 0.5); cue("plop", c + 0.6, 0.5)
ev["march"] = R(c + 0.95); ev["out"] = R(c + 2.3)
for k in range(5): cue("thud", c + 1.05 + k * 0.27, 0.25)
ev["slam"] = R(c + 2.45); cue("impact", c + 2.45, 0.75); cue("doors", c + 2.3, 0.4)
c = say("o1_nar", c + 2.8)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- option 2: «ВЕЖЛИВО» — Chloe twirls, smug; the heroine's smile twitches
s = t; opener(s); ev = dict(plate=R(s))
c = say("o2_h", s + 0.35)
c = say("o2_f", c + 0.3)
ev["twirl"] = R(c + 0.05); cue("spin", c + 0.05, 0.6); cue("sparkle", c + 0.4, 0.6)
ev["twitch"] = R(c + 1.35); cue("boing", c + 1.45, 0.45)
c = say("o2_nar", c + 2.05)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- option 3: «КАК НОСИТЕЛЬ» — both laugh, high five
s = t; opener(s); ev = dict(plate=R(s))
c = say("o3_h", s + 0.35)
c = say("o3_f", c + 0.3)
ev["five"] = R(c + 0.3); ev["clap"] = R(c + 0.7); cue("clapclap", c + 0.65, 0.8); cue("sparkle", c + 0.7, 0.6)
c = say("o3_nar", c + 1.6)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» — dress code! guests rush in, group photo (phone camera insert, 3-2-1, flash)
s = t; opener(s); ev = dict(plate=R(s))
h0 = s + 0.35; c = say("o4_h", h0)
ev["rush"] = R(h0 + 4.0); cue("whoosh", h0 + 4.0, 0.5); cue("cheer", h0 + 4.3, 0.4)
c = say("o4_f", c + 0.25)
ev["hug"] = R(c - D["o4_f"] + 0.1)
ev["phone"] = R(c + 0.15); cue("pop", c + 0.15, 0.4)
for k in range(3): cue("tick", c + 0.45 + k * 0.4, 0.6)
ev["flash"] = R(c + 1.65); cue("shutter", c + 1.65, 0.9)
ev["photo"] = R(c + 1.85); cue("tada", c + 1.9, 0.45)
c = say("o4_nar", c + 2.2)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- twist (no lines): music silent; the door creaks open, mum walks in in the SAME red dress; freeze; everyone laughs; a new photo with mum
s = t; ev = dict(beat=R(s)); cue("creak", s + 0.3, 0.6)
ev["door"] = R(s + 0.3); ev["walk"] = R(s + 0.5); ev["stop"] = R(s + 1.5)
ev["freeze"] = R(s + 1.6); cue("scratch", s + 1.6, 0.7)
ev["her"] = R(s + 1.75); cue("gasp", s + 1.8, 0.6)
ev["chl"] = R(s + 2.3); ev["mum"] = R(s + 2.85); cue("sparkle", s + 2.95, 0.5)
ev["laugh"] = R(s + 3.45); cue("rimshot", s + 3.45, 0.7); cue("cheer", s + 3.5, 0.6)
ev["flash"] = R(s + 4.55); cue("shutter", s + 4.55, 0.9)
ev["photo"] = R(s + 4.7)
c = say("moral", s + 4.85)
scenes.append(dict(id="tw", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w_ in ("один", "два", "три", "четыре"):
    x_ = next(q for q in ow if q[0].lower().startswith(w_)); cue("pop", c - D["outro"] + x_[1], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9))); t = c + 0.9

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); x = x.mean(1) if x.ndim > 1 else x; hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = MANUAL.get(sp["id"]) or word_times(sp["id"])
    if wt is None:
        words = re.sub(r"\[[^\]]*\]\s*", "", sp["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Darling, it's not a coincidence —", "Дорогая, это не совпадение —"], ["it's a dress code.", "это дресс-код."], ["Everyone, photo!", "Все, фото!"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
