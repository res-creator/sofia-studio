"""python3 tl_notes1.py -> eps/notes1/timeline.json  (story «Записки от соседа», 2nd person, choose-next)
Scenes: hook (night 1) / night2 / morning / night3 / twist / fork / outro."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "notes1"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))

# ---- hook (night 1): frame 0 = cover (dark flat, the note under the door); the note slides in; narrator; the note close-up "Please be quiet."
ev = dict(slide=0.15); cue("paper", 0.2, 0.7); cue("creak", 0.1, 0.3)
c = say("n_hook", 0.45)
ev["note"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.35)
c = say("e1", c + 0.35)
ev["her"] = R(c + 0.3)
c = say("n1", c + 0.45)
scenes.append(dict(id="hook", s=0.0, e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- night 2: tiptoe, phone on silent, the clock 02:59 -> 03:00; the second note "They can hear you."
s = t; ev = dict(tiptoe=R(s))
c = say("n2", s + 0.2)
ev["clock"] = R(c - 1.6); cue("tick", c - 1.5, 0.5); cue("tick", c - 0.5, 0.5)
ev["slide"] = R(c + 0.1); cue("paper", c + 0.15, 0.7)
ev["note"] = R(c + 0.7); cue("whoosh", c + 0.68, 0.35)
c = say("e2", c + 0.95)
ev["her"] = R(c + 0.25)
c = say("n3", c + 0.4)
scenes.append(dict(id="night2", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- morning: she knocks on 4B — silence; texts the landlady; the answer (English on the phone, narrator reads the Russian)
s = t; ev = dict(knock=R(s + 0.3)); [cue("knock", s + 0.3 + i * 0.32, 0.6) for i in range(3)]
c = say("n4", s + 0.4)
ev["phone"] = R(c - 1.3); cue("send", c - 0.6, 0.5)
ev["reply"] = R(c + 0.3); cue("msg", c + 0.3, 0.6)
c = say("n5", c + 0.8)
scenes.append(dict(id="morning", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4

# ---- night 3: 03:00; the third note "Don't answer if they knock."; three knocks on the wall; she freezes; the whisper through the wall
s = t; ev = dict(clock=R(s))
c = say("n6", s + 0.2)
ev["slide"] = R(c - 1.2); cue("paper", c - 1.15, 0.7)
ev["note"] = R(c + 0.15); cue("whoosh", c + 0.13, 0.35)
c = say("e4", c + 0.4)
c = say("n7", c + 0.3)
ev["knock"] = R(c + 0.35); [cue("knock", c + 0.35 + i * 0.45, 0.9) for i in range(3)]
c = say("n8", c + 1.9)
ev["wall"] = R(c + 0.1)
c = say("e5", c + 0.35)
ev["her"] = R(c + 0.1)
c = say("n9", c + 0.45)
scenes.append(dict(id="night3", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- twist (music silent): the notes next to her shopping list on the fridge — the same handwriting. Hers.
s = t; ev = dict(fridge=R(s))
c = say("n10", s + 0.3)
ev["compare"] = R(s + 2.6); cue("whoosh", s + 2.55, 0.4)
ev["same"] = R(c - 1.6); cue("impact", c - 0.7, 0.6)
scenes.append(dict(id="twist", s=R(s), e=R(c + 0.5), ev=ev)); t = c + 0.5

# ---- fork: three knocks again; split screen СТУЧАТЬ / МОЛЧАТЬ
s = t; ev = dict(knock=R(s + 0.1)); [cue("knock", s + 0.1 + i * 0.45, 0.9) for i in range(3)]
c = say("n11", s + 1.6)
ev["split"] = R(s + 1.6 + 3.8); cue("whoosh", ev["split"], 0.5); cue("pop", ev["split"] + 0.25, 0.5); cue("pop", ev["split"] + 0.5, 0.5)
scenes.append(dict(id="fork", s=R(s), e=R(c + 0.5), ev=ev)); t = c + 0.5

# ---- end screen
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.6, 0.5); cue("pop", s + 0.85, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(s + 5.0), ev={})); t = s + 5.0

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2); sp["env"] = [round(float(v), 2) for v in env]
    # word timings: from the audio (speech segments) spread over words by length
    words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—…]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz):
        t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}; cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]
