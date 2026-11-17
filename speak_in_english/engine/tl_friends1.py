"""python3 tl_friends1.py -> eps/friends1/timeline.json  (#1millionstories film story «Друзья», 1st person)
Scenes: hook (café, can't understand) / office (late laugh) / alone (evening) / show (about the series + quote stickers) / study (montage) / joke (a year later) / bday / outro."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "friends1"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
    return sorted([list(x) for x in w], key=lambda x: x[1])

# hook: frame 0 = cover; the barista machine-guns a question; letter cloud over Sonya; narrator
ev = {}; cue("hum", 0.0, 0.25)
c = say("bar", 0.2)
ev["cloud"] = 0.5; [cue("pop", 0.5 + i * 0.35, 0.3) for i in range(6)]
c = say("hook", c + 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(c + 0.25), ev=ev)); t = c + 0.25
# office: colleagues laugh, she laughs a second late; "What's so funny?"
s = t; ev = dict(laugh=R(s + 0.1)); cue("cheer", s + 0.1, 0.35)
c = say("n1", s + 0.3)
ev["late"] = R(c - 1.2)
c = say("col1", c + 0.3)
ev["blush"] = R(c + 0.1); cue("cricket", c + 0.3, 0.3)
scenes.append(dict(id="office", s=R(s), e=R(c + 0.9), ev=ev)); t = c + 0.9
# alone: evening room, the phone «MOM» she doesn't press
s = t; ev = dict(room=R(s))
c = say("n2", s + 0.3)
scenes.append(dict(id="alone", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3
# show: the laptop — orange sofa, six cups; about the series; quote stickers
s = t; ev = dict(laptop=R(s)); cue("click", s + 0.1, 0.5)
c = say("n3", s + 0.4)
c = say("n4", c + 0.35)
ev["stickers"] = R(c + 0.2)
for i, lid in enumerate(["tip1", "tip2", "tip3"]):
    ev[f"st{i}"] = R(c + 0.25); cue("pop", c + 0.25, 0.5); c = say(lid, c + 0.4)
scenes.append(dict(id="show", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4
# study: montage — seasons counter, notebook, mugs
s = t; ev = dict(mont=R(s)); [cue("tick", s + 0.3 + i * 0.6, 0.35) for i in range(10)]
c = say("n5", s + 0.3)
c = say("n6", c + 0.4)
scenes.append(dict(id="study", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4
# joke: a year later, the same café; Tom runs in late with two coffees; her joke; silence; laughter
s = t; ev = dict(card=R(s)); cue("whoosh", s, 0.4)
c = say("n7", s + 0.2)
ev["run"] = R(c + 0.1); cue("doors", c + 0.15, 0.5)
c = say("col2", c + 0.7)
c = say("her1", c + 0.35)
ev["beat"] = R(c + 0.05)
ev["laugh"] = R(c + 1.0); cue("cheer", c + 1.0, 0.6); cue("clapclap", c + 1.2, 0.4)
c = say("n8", c + 0.9)
scenes.append(dict(id="joke", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3
# bday: colleagues at her door with a cake; "We'll always be there for you"; narrator ending
s = t; ev = dict(door=R(s)); cue("doorbell", s + 0.1, 0.5)
ev["cake"] = R(s + 0.8); cue("sparkle", s + 0.85, 0.4)
c = say("col3", s + 0.9)
c = say("n9", c + 0.4)
scenes.append(dict(id="bday", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3
# end screen
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.6, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(s + 4.0), ev={})); t = s + 4.0

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2); sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = re.sub(r"\[[^\]]*\]\s*", "", sp["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—…]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}; cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]
