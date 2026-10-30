"""python3 saidheard_tl.py -> eps/saidheard/timeline.json  (timeline for the 'Said / Heard' dinner episode; same JSON shape as timeline_v2.py)"""
import json, re, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "saidheard"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t): sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def scene(i, s, e, **ev): scenes.append(dict(id=i, s=round(s, 3), e=round(e, 3), ev={k: round(v, 3) for k, v in ev.items()}))
def st(lid): return next(x["t"] for x in speech if x["id"] == lid)
def en(lid): return next(x["t"] + x["d"] for x in speech if x["id"] == lid)

# ---- hook: cold open in the cloth factory (her line over it), POP -> the real table, Frank's face
cue("impact", 0.05, 0.8); cue("whoosh", 0.0, 0.5)
t = say("hook_d", 0.3); pop = t + 0.15; cue("pop", pop, 0.9); cue("boing", pop + 0.05, 0.5)
t = say("hook_f", pop + 0.45); scene("hook", 0, t + 0.3, pop=pop); s = t + 0.3
# ---- S1: fabric -> curtains
t = say("s1_l", s + 0.1); t = say("s1_d", t + 0.2); scene("S1", s, t + 0.25); s = t + 0.25
# ---- S2: the chef (the parents' two imaginations collide), the hat lands on Frank and stays
t = say("s2_f", s + 0.15); t = say("s2_d", t + 0.25); c0 = t + 0.2; cue("whoosh", c0, 0.7); cue("impact", c0 + 0.05, 0.7)
for k in range(5): cue("clank", c0 + 0.6 + 0.4 * k, 0.5)
c1 = c0 + 2.9; cue("whoosh", c1 - 0.25, 0.6); cue("thud", c1 + 0.1, 0.8)
t = say("s2_l", c1 + 0.9); t = say("s2_m", t + 0.3); t = say("s2_l2", t + 0.15); scene("S2", s, t + 0.35, chaos0=c0, chaos1=c1); s = t + 0.35
# ---- S3: "sympathize" -> a sad Dickens movie in their heads
t = say("s3_d", s + 0.3); d0 = t + 0.1; cue("deflate", d0, 0.6); cue("whoosh", d0, 0.6)
t = say("s3_l", d0 + 1.0); scene("S3", s, t + 0.35, dick0=d0); s = t + 0.35
# ---- S4: Mike comes in and translates; the movies rewind
mk = s + 0.1; cue("doors", mk, 0.6); t = say("s4_m", s + 0.5)
t = say("s4_m2", t + 0.3); f1 = st("s4_m2") + D["s4_m2"] * 0.5
t = say("s4_m3", t + 0.12); f2 = st("s4_m3") + D["s4_m3"] * 0.5
t = say("s4_m4", t + 0.12); f3 = st("s4_m4") + D["s4_m4"] * 0.45
for f in (f1, f2, f3): cue("stamp", f, 0.7); cue("whoosh", f - 0.25, 0.45)
cue("sparkle", f3 + 0.3, 0.6)
scene("S4", s, t + 0.35, mike=mk, fix1=f1, fix2=f2, fix3=f3, warm=st("s4_m4") + 0.1); s = t + 0.35
# ---- S5: chocolate -> the real factory, the boss really does look like a chef
t = say("s5_f", s + 0.15); t = say("s5_d", t + 0.25); h0 = t + 0.1; cue("tada", h0, 0.6); cue("whoosh", h0, 0.6); cue("sparkle", h0 + 0.3, 0.6)
t = say("s5_l", h0 + 1.0); h1 = t + 0.5; cue("whoosh", h1 - 0.2, 0.5); t = say("s5_d2", h1 + 0.1); scene("S5", s, t + 0.35, choc0=h0, choc1=h1); s = t + 0.35
# ---- S6: the toast, deadpan, "Please stop."
t = say("s6_f", s + 0.3); cue("ding", st("s6_f") + 0.35, 0.8); t = say("s6_l", t + 0.25); cue("ding", st("s6_l") + 0.2, 0.7); t = say("s6_d", t + 0.35)
t = say("s6_m", t + 0.9); cue("rimshot", t + 0.1, 0.6); t += 1.2; scene("S6", s, t)

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)]); env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz): t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "stamp", "next", "cards", "camera"]}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.1f}s")
