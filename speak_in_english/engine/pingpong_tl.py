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
# ---- intro: the Russian host explains the game while the cannon rolls in, loads the ball and charges (key words timed with speech-to-text)
i0 = 0.25; cue("whoosh", 0.0, 0.3)       # nothing else is placed on the host voice
t = say("intro", i0)
hear, ans_, three, ready, go = i0 + 1.6, i0 + 2.56, i0 + 3.54, i0 + 4.54, i0 + 5.16
scene("INTRO", 0, t + 0.25, hear=hear, say=ans_, three=three, ready=ready, go=go)
def question(i, s, lead, hold, ready=0.5):
    q = f"q{i}"; cue("whoosh", s, 0.5); cue("impact", s + lead - 0.22, 0.45)
    t = say(q + "_q", s + lead); tm0 = t + ready
    if i == 5: cue("riser_short", t + 0.05, 0.4)
    for k in range(3):
        cue("tick", tm0 + k, 0.7 if i < 5 else 0.85)
        if i == 5: cue("tick", tm0 + k + 0.5, 0.55); cue("thud", tm0 + k + 0.2, 0.35)
    tm1 = tm0 + TIMER; cue("ding", tm1, 0.6); cue("pop", tm1 + 0.08, 0.5)
    if i == 5: cue("impact_soft", tm1 + 0.05, 0.6)
    an = tm1 + 0.35; t = say(q + "_a", an); cue("tada" if i == 5 else "sparkle", t + 0.05, 0.4)      # sound effect after the voice, never on top of it
    e = t + hold; scene(f"Q{i}", s, e, tm0=tm0, tm1=tm1, ans=an, aend=t, gag=an + 0.1)
    return e
t = scene_end = INTRO_END = [x for x in scenes if x["id"] == "INTRO"][0]["e"]
for n, hold in [(1, 3.0), (2, 3.0), (3, 3.0), (4, 3.0), (5, 3.2)]:     # holds = time to read the card (answer + translation + alternatives)
    t = question(n, t, 0.3 if n == 1 else 0.95, hold, ready=1.1 if n == 5 else 0.5)    # rounds 2-5 open with a round banner (difficulty)
# finale: the cannon rolls to the tiny stool, hops on it, the stool folds; then the host asks for the score
s = t; hop = s + 0.9; fold = hop + 0.55; cue("boing", hop, 0.5); cue("squeak", hop + 0.25, 0.4); cue("thud", fold, 0.8); cue("deflate", fold + 0.15, 0.5)
t = say("fin", fold + 0.45); cue("stamp", fold + 0.2, 0.6)
t = say("outro", t + 0.25)
end = t + 2.2; scene("FIN", s, end, hop=hop, fold=fold, ask=fold + 0.25, outro=SP_OUT if False else t - D["outro"])

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
