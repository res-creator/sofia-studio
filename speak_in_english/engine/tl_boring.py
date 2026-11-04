"""python3 tl_boring.py -> eps/boring/timeline.json  (rubric «Так говорят только русские»: one typical mistake, ~24 s, no levels)
Scenes: hook (live café scene + title overlay, her line, beat, his answer, he leaves) -> o1 (narrator + lesson card + tip) -> o2 (BORING clock / BORED her) -> end (end screen)."""
import json, re, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "boring"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
ev = {}
# ---- hook: frame 0 = live café scene, she is already yawning; the sigh starts at ~0.2 s
cue("whoosh", 0.0, 0.35)
e = say("hook_h", 0.08)                                  # "[sighing] I'm so boring..."
ev["beat"] = round(e, 3)                                 # the one deliberate beat: music off, the clock ticks
cue("tick", e + 0.05, 0.7); cue("tick", e + 0.35, 0.7)
t = e + 0.55
e = say("hook_d", t)                                     # "Yeah. You kind of are."
ev["d0"] = round(t, 3)
ev["rise"] = round(e + 0.05, 3); cue("creak", e + 0.05, 0.7)          # he gets up (chair scrape)
ev["coat"] = round(e + 0.4, 3); cue("whoosh", e + 0.4, 0.55)          # swings his coat on
ev["walk"] = round(e + 0.7, 3)                                         # walks off to the right
for k in range(3): cue("thud", e + 0.75 + 0.22 * k, 0.25)
ev["weed"] = round(e + 0.75, 3); cue("whoosh", e + 0.8, 0.3)          # a tumbleweed rolls across the table
ev["bell"] = round(e + 1.3, 3); cue("bell", e + 1.3, 0.55)            # café door bell: he's gone
ev["shock"] = round(e + 1.45, 3); cue("gasp", e + 1.5, 0.6)           # her shocked face (close-up)
t = e + 2.05
scenes.append(dict(id="hook", s=0.0, e=round(t - 0.1, 3), ev=dict(ev)))
# ---- o1: narrator + lesson card, then the Bella tip
s = t - 0.1; e = say("n1", t); cue("pop", t + 1.65, 0.5)
nw = word_times("n1"); fw = lambda ws, w: next(a for x, a, b in ws if x.lower().strip("«»!?.,:").startswith(w))
o1 = dict(card=round(t + fw(nw, "i'm") - 0.08, 3), good=round(t + fw(nw, "мне") - 0.05, 3))
cue("buzz", o1["card"] + 0.55, 0.45); cue("ding", o1["good"] + 0.1, 0.55)
t = e + 0.4; e = say("tip1", t); cue("ding", t + 0.02, 0.4)
t = e + 0.3
scenes.append(dict(id="o1", s=round(s, 3), e=round(t - 0.1, 3), ev=o1))
# ---- o2: «BORING» on the slow wall clock vs «BORED» on her yawning face; end screen from «Сохрани»
s = t - 0.1; n2 = t; e = say("n2", t); w2 = word_times("n2")
o2 = dict(clock=round(n2 - 0.1, 3), boring=round(n2 + 0.35, 3), her=round(n2 + next(a for x, a, b in w2 if x.lower().strip("«»!?.,:") == "скучно") - 0.12, 3), bored=0)
o2["bored"] = round(o2["her"] + 0.2, 3)
cue("whoosh", n2 - 0.1, 0.5); cue("stamp", o2["boring"], 0.55)
for k in range(4): cue("tick", n2 + 0.2 + 0.4 * k, 0.45)
cue("whoosh", o2["her"], 0.4); cue("stamp", o2["bored"], 0.55)
endT = round(n2 + fw(w2, "сохрани") - 0.12, 3)
scenes.append(dict(id="o2", s=round(s, 3), e=endT, ev=o2))
q = round(n2 + fw(w2, "какую") - 0.1, 3)
sub = round(e + 0.05, 3)
cue("whoosh", endT, 0.6); cue("pop", endT + 0.25, 0.5); cue("pop", q, 0.5); cue("pop", sub, 0.5); cue("ding", sub + 0.95, 0.5)
dur = round(sub + 1.75, 3)
scenes.append(dict(id="end", s=endT, e=dur, ev=dict(save=round(endT + 0.2, 3), q=q, sub=sub)))

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
cfg = {k: E.get(k) for k in ["title", "hook_title"]}
cfg["camera"] = "hard_cut"; cfg["setting"] = EPN; cfg["rubric"] = E.get("rubric")
json.dump(dict(fps=FPS, dur=dur, ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {dur:.2f}s", json.dumps(scenes, ensure_ascii=False))
print([(s["id"], s["t"], round(s["t"] + s["d"], 2)) for s in speech])
