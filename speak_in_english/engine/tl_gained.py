"""python3 tl_gained.py -> eps/gained/timeline.json  (rubric «Как ответить, когда…»: hook / o1 / o2 / o3 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "gained"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: live dinner, Rose already leaning in; her line at 0.15 s; the heroine freezes; narrator over quick cuts
cue("whoosh", 0.0, 0.35); cue("pop", 0.1, 0.4)
t = say("hook_r", 0.15)
hev = dict(freeze=R(t + 0.02)); cue("scratch", t, 0.55); cue("gasp", t + 0.05, 0.5)
t += 0.3
hev["nar"] = R(t); e = say("hook", t); hw = word_times("hook")
def wat(i): return R(t + hw[i][1])
hev["cake"] = wat(6)        # «Ты поправилась?» -> cut to the cake
hev["rel"] = wat(8)         # «Три ответа» -> the relatives
hev["wide"] = wat(11)       # «от худшего к лучшему» -> wide
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=hev)); t = e + 0.1

# ---- option 1: «В ЛОБ»
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
c = say("o1_h", s + 0.35)
ev["gasp"] = R(c + 0.05); cue("gasp", c + 0.05, 0.7); ev["fork"] = R(c + 0.12); cue("clank", c + 0.45, 0.75)
ev["dim"] = R(c + 0.5); cue("powerdown", c + 0.5, 0.6)
c = say("o1_nar", c + 0.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО»
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
c = say("o2_h", s + 0.35)
c = say("o2_r", c + 0.32)
ev["push"] = R(c - 0.8); cue("whoosh", c - 0.8, 0.45); ev["land"] = R(c - 0.15); cue("thud", c - 0.15, 0.55)
c = say("o2_nar", c + 0.3)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 3: «КАК НОСИТЕЛЬ»
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.6, 0.5)
r0 = c + 0.32; c = say("o3_r", r0)
ev["deflate"] = R(r0 + 0.95); cue("pfff", r0 + 0.95, 0.75)
c = say("o3_nar", c + 0.3)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c), ev=ev)); t = c

# ---- twist: one deliberate beat (music silent), Tom's line, Rose chokes, the heroine smiles
s = t; ev = dict(beat=R(s))
c = say("end_t", s + 0.6)
ev["choke"] = R(c + 0.08); cue("cough", c + 0.08, 0.8); ev["smile"] = R(c + 0.35); cue("rimshot", c + 0.4, 0.7)
scenes.append(dict(id="end", s=R(s), e=R(c + 1.15), ev=ev)); t = c + 1.15

# ---- end screen: question + 1/2/3, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
for k in range(3): cue("pop", s + 0.5 + 0.15 * k, 0.5)
c = say("outro", s + 0.15)
ow = word_times("outro")
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.45))); t = c + 0.45

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
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
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
