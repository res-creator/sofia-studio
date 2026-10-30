"""python3 pingpong_tl.py -> eps/pingpong/timeline.json  (3 questions: phrase -> real 3 s timer -> natural answer -> short gag; then the stool finale)"""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "pingpong"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t): sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def scene(i, s, e, **ev): scenes.append(dict(id=i, s=round(s, 3), e=round(e, 3), ev={k: round(v, 3) for k, v in ev.items()}))
TIMER = 3.0
def question(i, s, lead, hold, gag):
    q = f"q{i}"; cue("whoosh", s, 0.7); cue("impact", s + lead - 0.1, 0.6)
    t = say(q + "_q", s + lead); tm0 = t + 0.5
    for k in range(3): cue("tick", tm0 + k, 0.8)
    tm1 = tm0 + TIMER; cue("ding", tm1, 0.7); cue("pop", tm1 + 0.08, 0.6)          # time is up
    an = tm1 + 0.35; t = say(q + "_a", an); cue("tada" if i == 1 else "sparkle", an, 0.5)
    e = t + hold; scene(f"Q{i}", s, e, tm0=tm0, tm1=tm1, ans=an, aend=t, gag=an + 0.1)
    return e
t = question(1, 0.0, 0.35, 2.6, "confetti")
t = question(2, t, 0.35, 2.6, "up")
t = question(3, t, 0.35, 2.2, "roll")
# finale: the cannon rolls to the tiny stool, hops on it, the stool folds
s = t; hop = s + 0.9; fold = hop + 0.55; cue("boing", hop, 0.7); cue("squeak", hop + 0.25, 0.6); cue("thud", fold, 0.9); cue("deflate", fold + 0.15, 0.6)
t = say("fin", fold + 0.45); cue("stamp", fold + 0.2, 0.8)
end = t + 3.4; scene("FIN", s, end, hop=hop, fold=fold, ask=fold + 0.25)

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop_ = sr // FPS; n = int(np.ceil(len(x) / hop_))
    env = np.array([np.sqrt(np.mean(x[i*hop_:(i+1)*hop_] ** 2)) for i in range(n)]); env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]; tot = sum(wts); cc = 0; wt = []
    for w, a in zip(words, wts): t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)])
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "stamp", "next", "cards", "camera"]}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=round(end, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {end:.1f}s")
