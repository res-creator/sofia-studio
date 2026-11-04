"""python3 tl_fish.py -> eps/fish/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "fish"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    if lid == "o4_h": return [list(x) for x in w]   # keep the dash token: the meaning chunks count it
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda x: round(x, 3)

# ---- hook: frame 0 = the microwave door already swinging open, the smell cloud rolling out; Mark's line at 0.2 s
cue("ding", 0.0, 0.7); cue("creak", 0.05, 0.35); cue("whoosh", 0.25, 0.45)
t = say("hook_c", 0.2)
hev = dict(gust=0.7); cue("whoosh", 0.75, 0.5); cue("gasp", 1.0, 0.45)
t += 0.3
hev["nar"] = R(t); e = say("hook", t); hw = word_times("hook")
def wat(i): return R(t + hw[i][1])
hev["noses"] = wat(6)       # «Пахнет на весь этаж» -> colleagues holding their noses
hev["wide"] = wat(10)       # «Четыре ответа» -> the whole office under the cloud
cue("sniff", hev["noses"] + 0.1, 0.55); cue("whoosh", hev["wide"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.5), ev=hev)); t = e + 0.5

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> he offers her a forkful, she recoils
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_c", c0)
ev["offer"] = R(c0 + 1.95); cue("whoosh", c0 + 1.95, 0.45)
ev["recoil"] = R(c0 + 2.25); cue("boing", c0 + 2.3, 0.55)
ev["wiggle"] = R(c + 0.2); cue("squeak", c + 0.45, 0.4)
ev["chase"] = R(c + 0.75); cue("whoosh", c + 0.75, 0.35)
c = say("o1_nar", c + 1.3)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> he looks at her desk innocently; insert of her desk; her horrified
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_c", c0)
ev["look"] = R(c0 + 0.95); cue("blink", c0 + 0.95, 0.5)
ev["desk"] = R(c + 0.25); cue("cricket", c + 0.3, 0.35)
ev["horror"] = R(c + 1.15); cue("gasp", c + 1.2, 0.6)
c = say("o2_nar", c + 1.75)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> sheepish, he closes the box, the cloud clears; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.4, 0.45)
c0 = c + 0.3; c = say("o3_c", c0)
ev["close"] = R(c0 + 1.3); cue("clack", c0 + 1.3, 0.8); ev["clear"] = R(c0 + 1.45); cue("feather", c0 + 1.5, 0.4)
ev["relief"] = R(c + 0.15); cue("chime", c + 0.2, 0.3)
c = say("o3_nar", c + 0.85)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; he hugs the box protectively
s = t; ev = opt_start(s)
c = say("o4_h", s + 0.35); cue("sparkle", s + 0.35 + 4.2, 0.4)
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.55)
c0 = c + 0.7; ev["hug"] = R(c0 - 0.1); cue("squeak", c0 - 0.05, 0.45)
c = say("o4_c", c0)
ev["pat"] = R(c + 0.1)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.85), ev=ev)); t = c + 0.85

# ---- twist: deliberate beat (music silent), the CEO sniffs in the doorway, sits down and eats with Mark; the heroine facepalms
s = t; ev = dict(beat=R(s)); cue("sniff", s + 0.35, 0.8); cue("sniff", s + 1.1, 0.6)
ev["door"] = R(s + 0.3)
c = say("end_ceo", s + 1.85)
ev["sit"] = R(c + 0.25); cue("whoosh", c + 0.25, 0.5); cue("thud", c + 0.45, 0.4); cue("munch", c + 0.7, 0.7); cue("munch", c + 1.7, 0.5)
ev["palm"] = R(c + 2.0); cue("thud", c + 2.05, 0.55)
c = say("moral", c + 2.6)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Mark, your salmon has more presence than our CEO.", "Марк, у твоего лосося харизмы больше, чем у директора."],
                          ["Perhaps it could lead the meeting — outside?", "Может, он проведёт совещание — на улице?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
