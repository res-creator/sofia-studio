"""python3 tl_didntget.py -> eps/didntget/timeline.json  (rubric answers4 with SIX level options A1..C2: hook / o1..o6 / outro, no level machinery)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}.
Running prop: the parcel with her name. A1-A2-B1: the courier carries it one step closer to his van each time; B2: he throws it
"over her head" onto the porch canopy; C1: he fetches it back (slowly); C2: she pays by card and gets it."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "didntget"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
# o6_h: hand-placed word timings from the voiced segments of the squeezed take (0-2.25 / 2.42-4.66 / 5.02-6.83), so the chunk bubbles follow the voice
O6 = [("I'd love to pay, but at that speed", 0.0, 2.25), ("I think I've just agreed to adopt your van.", 2.42, 4.66), ("Once more, in slow motion?", 5.02, 6.83)]
def spread(seg):
    out = []
    for txt, a, b in seg:
        ws = txt.split(); wl = [len(w) + 1.5 for w in ws]; tot = sum(wl); c = 0
        for w, l in zip(ws, wl): out.append([w, R(a + c / tot * (b - a)), R(a + (c + l) / tot * (b - a))]); c += l
    return out
def word_times(lid):
    if lid == "o6_h": return spread(O6)
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, t0, word):
    return R(t0 + next(x[1] for x in word_times(lid) if x[0].lower().strip("«».,!?:—– ").startswith(word)))

# ---- hook: frame 0 = he is already rattling it off on her doorstep, the parcel with her name held out; his van at the kerb behind
cue("knock", 0.0, 0.35)
t = say("hook_c", 0.2); hev = {}
hev["nar"] = R(t + 0.25); e = say("hook", hev["nar"])
hev["van"] = wat("hook", hev["nar"], "шесть") - 0.05      # «Шесть уровней» -> the van with its slogan
cue("whoosh", hev["van"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.25), ev=hev)); t = e + 0.25

def opt_start(s): cue("whoosh", s, 0.55); cue("pop", s + 0.08, 0.6); return dict(plate=R(s))
STEP = 0.55   # walk time for one step toward the van

# ---- o1 A1: "What? Again? Slow!" -> he repeats it LOUDER and faster (her hair blown back); one step toward the van
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.3)
c0 = c + 0.2; ev["loud"] = R(c0); cue("impact", c0 + 0.05, 0.55); c = say("o1_c", c0)
ev["step"] = R(c + 0.05); cue("whoosh", c + 0.05, 0.3)
c = say("o1_nar", c + 0.55)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- o2 A2: the labelled mistake "Sorry, I not understand you." (red cross) -> "No worries, I not understand you too." (also crossed);
# both stare at the parcel, question marks; another step; narrator + the correct form on the tip plate
s = t; ev = opt_start(s)
h0 = s + 0.3; c = say("o2_h", h0); ev["wrong"] = R(h0 + 0.75); cue("nope", h0 + 0.8, 0.45)
c0 = c + 0.3; c = say("o2_c", c0); ev["wrong2"] = R(c0 + 1.0); cue("nope", c0 + 1.05, 0.4)
ev["stare"] = R(c + 0.1); cue("blink", c + 0.15, 0.5)
ev["step"] = R(c + 0.5); cue("whoosh", c + 0.5, 0.3)
c = say("o2_nar", c + 1.05)
c = say("o2_tip", c + 0.36); ev["tip"] = R(c - D["o2_tip"]); cue("ding", ev["tip"] + 0.05, 0.45)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- o3 B1: "Can you repeat that, please?" -> word for word, same speed (replay icon); third step = he is at the van
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.3)
c0 = c + 0.25; ev["replay"] = R(c0); cue("scratch", c0 - 0.05, 0.35); c = say("o3_c", c0)
ev["step"] = R(c + 0.05); cue("whoosh", c + 0.05, 0.3)
ev["blink"] = R(c + 0.35); cue("blink", c + 0.4, 0.45)
c = say("o3_nar", c + 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- o4 B2: "Sorry, that went right over my head." -> he lifts the parcel over his head, "Here, catch!" and lobs it OVER her head:
# it lands on the porch canopy above her door; she ducks, then looks up
s = t; ev = opt_start(s)
c = say("o4_h", s + 0.3)
c0 = c + 0.25; ev["lift"] = R(c0 + 0.1); c = say("o4_c", c0)
ev["throw"] = R(c - 0.35); cue("whoosh", ev["throw"], 0.5)
ev["land"] = R(ev["throw"] + 0.75); cue("thud", ev["land"], 0.6); cue("boing", ev["land"] + 0.05, 0.35)
ev["look"] = R(ev["land"] + 0.35)
c = say("o4_nar", ev["land"] + 0.55)
c = say("o4_tip", c + 0.36); ev["tip"] = R(c - D["o4_tip"]); cue("ding", ev["tip"] + 0.05, 0.45)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- o5 C1: "I didn't quite catch that. Could you say it a bit more slowly?" -> slow-motion: he walks back (snail), takes the
# parcel down from the canopy and holds it out to her: "Six... pounds... customs. Card or cash?"
s = t; ev = opt_start(s)
c = say("o5_h", s + 0.3); cue("sparkle", c - 1.0, 0.4)
c0 = c + 0.25; c = say("o5_c", c0)
ev["walk"] = R(c0 + 0.05); ev["grab"] = R(c0 + 2.6); cue("squeak", ev["grab"] + 0.2, 0.35); ev["give"] = R(c0 + 3.5); cue("pop", ev["give"] + 0.3, 0.4)
c = say("o5_nar", c + 0.3); ev["smile"] = R(c - D["o5_nar"] + 1.5)
c = say("o5_tip", c + 0.36); ev["tip"] = R(c - D["o5_tip"]); cue("ding", ev["tip"] + 0.05, 0.45)
scenes.append(dict(id="o5", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- o6 C2: the royal line; on "adopt your van" the van gets a pink bow and blinks its headlights at her.
# beat (music silent), his sigh "...My mum says I talk like a microwave." -> microwave DING over his head; she taps her card, PAID; moral
s = t; ev = opt_start(s); h0 = s + 0.3
c = say("o6_h", h0)
ev["adopt"] = wat("o6_h", h0, "adopt"); cue("sparkle", ev["adopt"] + 0.1, 0.45); cue("boing", ev["adopt"] + 0.25, 0.3)
ev["beat"] = R(c + 0.05)
c0 = c + 0.7; c = say("o6_c", c0)
ev["ding"] = R(c + 0.05); cue("lift_ding", c + 0.05, 0.6)
ev["pay"] = R(c + 0.55); cue("register", c + 0.75, 0.45)
ev["moral"] = R(c + 0.95); c = say("moral", ev["moral"])
scenes.append(dict(id="o6", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- end screen: question + A1..C2 buttons, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); then the comment question big
s = t; cue("whoosh", s, 0.7); cue("impact_soft", s + 0.2, 0.5)
c = say("outro", s + 0.15)
oev = dict(ask=R(c + 0.3))
for i in range(6): cue("pop", s + 0.15 + 1.25 + i * 0.3, 0.45)
c = say("ask", c + 0.3); cue("pop", oev["ask"], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.55), ev=oev)); t = c + 0.55

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
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
cfg["chunks"] = {"o6_h": [["I'd love to pay, but at that speed", "Я бы с радостью заплатила, но на такой скорости"],
                          ["I think I've just agreed to adopt your van.", "кажется, я только что согласилась усыновить ваш фургон."],
                          ["Once more, in slow motion?", "Ещё раз, в замедленной съёмке?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
