"""python3 tl_waiter.py -> eps/waiter/timeline.json  (rubric «Полезное», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "waiter"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))
# voiced segments (from the pauses in the wav): o4_h has no aligner output
SEGS = {"o4_h": [(0.05, 0.6, "Hi!"), (1.05, 3.65, "I've been here so long the menu's gone out of season."), (4.2, 5.95, "Shall we order before spring?")]}
def seg_words(segs):
    out = []
    for a, b, s in segs:
        ws = s.split(); wt = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wt); cc = 0
        for w, k in zip(ws, wt): out.append([w, R(a + cc / tot * (b - a)), R(a + (cc + k) / tot * (b - a))]); cc += k
    return out
def word_times(lid):
    if lid in SEGS: return seg_words(SEGS[lid])
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        if out and a < out[-1][1]: a = out[-1][2]; b = max(a + 0.05, b)   # aligner out of order -> keep monotonic
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = she sits at the table with the closed menu (a bird's nest with chicks on it), the clock shows a red 20-minute wedge;
#      Charlie rushes past with a full tray: "Be right with you!" at 0.2 s
cue("whoosh", 0.05, 0.5); cue("clank", 0.25, 0.3)
t = say("hook_w", 0.2)
hev = dict(gone=R(t + 0.25))
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["her"] = R(t - 0.03)                   # her bored face, chin on the palm
hev["clock"] = wat("hook", t, 1)           # «минут» -> insert: the clock, the minute hand sweeps 20 minutes
hev["nest"] = wat("hook", t, 4)            # «Четыре способа» -> close-up: the nest on her menu, chicks chirping
hev["wide"] = wat("hook", t, 9)            # «до королевского» -> the café wide
cue("whoosh", hev["clock"] - 0.03, 0.35); [cue("tick", hev["clock"] + 0.15 + i * 0.13, 0.4) for i in range(7)]; cue("ding", hev["clock"] + 1.05, 0.3)
cue("whoosh", hev["nest"] - 0.03, 0.3); cue("tweet", hev["nest"] + 0.1, 0.55); cue("whoosh", hev["wide"] - 0.03, 0.3)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1 «В ЛОБ»: "Hey! You! Food!" waving the menu like a flag (the nest hangs on) -> "Food is in the kitchen, madam." he points at the KITCHEN door
#      and walks off through it; the door swings back and forth; she lowers the menu, the chicks are dizzy
s = t; ev = opt_start(s)
ev["stand"] = R(s + 0.1)
c = say("o1_h", s + 0.35); cue("whoosh", s + 0.5, 0.35); cue("whoosh", s + 1.1, 0.35); cue("tweet", s + 1.4, 0.5)
ev["stare"] = R(c + 0.05); c0 = c + 0.5; c = say("o1_w", c0)
ev["walk"] = R(c + 0.1); cue("whoosh", c + 0.12, 0.3)
ev["door"] = R(c + 1.0); cue("creak", c + 1.0, 0.5); cue("thud", c + 1.35, 0.4); cue("thud", c + 1.75, 0.3)
ev["drop"] = R(c + 1.6); cue("deflate", c + 1.65, 0.4); cue("tweet", c + 2.0, 0.4)
ev["peck"] = R(c + 2.05); [cue("knock", c + 2.1 + i * 0.16, 0.3) for i in range(3)]
c = say("o1_nar", c + 2.55)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2 «ВЕЖЛИВО»: he whizzes past behind her with a tower of plates; her timid line drowns in the clatter -> "Be right with you!" whoosh;
#      the wind of him passing blows her napkin onto her face and fluffs the chicks
s = t; ev = opt_start(s)
ev["pass1"] = R(s + 1.3); cue("clatter", s + 0.5, 0.3); cue("whoosh", s + 1.4, 0.4)
c = say("o2_h", s + 1.0)
cue("clatter", s + 1.5, 0.6); cue("clatter", s + 2.1, 0.65); cue("clatter", s + 2.7, 0.6); cue("clank", s + 3.2, 0.45)
c0 = c + 0.2; ev["pass2"] = R(c0 - 0.35); c = say("o2_w", c0); cue("whoosh", c0 - 0.2, 0.55)
ev["wind"] = R(c + 0.05); cue("whoosh", c + 0.05, 0.6); cue("feather", c + 0.25, 0.5)
ev["napkin"] = R(c + 0.6); cue("plop", c + 0.95, 0.4); cue("tweet", c + 1.3, 0.35)
ev["pull"] = R(c + 1.9); cue("whoosh", c + 1.95, 0.3); cue("boing", c + 2.2, 0.35)
c = say("o2_nar", c + 2.75)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3 «КАК НОСИТЕЛЬ»: he rushes by, she catches his eye with a calm smile + open palm; he skids to a stop: "Of course! Sorry, it's mad today."
#      out comes the notepad; insert: the pencil scribbles at lightning speed (smoke); tip
s = t; ev = opt_start(s)
ev["come"] = R(s + 0.05); cue("whoosh", s + 0.15, 0.35)
c = say("o3_h", s + 0.4); cue("sparkle", s + 0.5, 0.45)
ev["skid"] = R(c - 0.55); cue("squeak", c - 0.5, 0.55)
c0 = c + 0.2; c = say("o3_w", c0)
ev["pad"] = R(c - 0.8); cue("zip", c - 0.75, 0.35)
ev["write"] = R(c + 0.1); cue("whoosh", c + 0.08, 0.3); [cue("scribble", c + 0.2 + i * 0.4, 0.55) for i in range(4)]; cue("ding", c + 1.9, 0.4)
ev["back"] = R(c + 2.1); ev["tear"] = R(c + 2.4); cue("zip", c + 2.45, 0.4); ev["run"] = R(c + 2.9); cue("whoosh", c + 2.95, 0.45)
c = say("o3_nar", c + 2.75)
c = say("o3_tip", c + 0.4); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4 «КОРОЛЕВСКИЙ ОТВЕТ»: the sweet line; outside the window the seasons change (autumn leaves at «out of season», snow at «before spring»);
#      he blushes: "...Dessert's on the house, madam." a huge cake slice lands; the chicks dive into the cream, the mother bird steals the cherry
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["autumn"] = wat("o4_h", h0, 8)      # «gone»
ev["snow"] = wat("o4_h", h0, 15)       # «spring?»
ev["hatch"] = R(h0 + 3.0)
cue("feather", ev["autumn"], 0.4); cue("sparkle", ev["snow"] - 0.4, 0.35)
c0 = c + 0.5; ev["blush"] = R(c0 - 0.1); c = say("o4_w", c0)
ev["cake"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("thud", c + 0.35, 0.45); cue("chime", c + 0.45, 0.4)
ev["dive"] = R(c + 0.9); cue("tweet", c + 0.95, 0.55); cue("plop", c + 1.2, 0.4); cue("plop", c + 1.4, 0.35)
ev["cherry"] = R(c + 1.7); cue("pop", c + 1.8, 0.45)
ev["bite"] = R(c + 2.5); cue("gulp", c + 2.7, 0.45)
scenes.append(dict(id="o4", s=R(s), e=R(c + 3.3), ev=ev)); t = c + 3.3

# ---- twist (music silent): he shifts awkwardly, looks up and lifts an open palm toward the wall; tilt up: right above her head «ORDER AT THE COUNTER»;
#      "Ah... madam... you order at the counter." her shock; she slowly hides behind the menu, the chicks peek at her; moral over the wide (the counter)
s = t; ev = dict(beat=R(s))
ev["point"] = R(s + 0.35); cue("blink", s + 0.4, 0.45)
ev["sign"] = R(s + 1.1); cue("whoosh", s + 1.1, 0.35); cue("ding", s + 1.45, 0.5)
c = say("end_w", s + 2.4)
ev["shock"] = R(c + 0.1); cue("gasp", c + 0.12, 0.6)
ev["hide"] = R(c + 0.9); cue("feather", c + 1.0, 0.35); cue("tweet", c + 1.5, 0.4)
ev["wide"] = R(c + 2.75)
c = say("moral", c + 2.85)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
a0 = c + 0.35; c = say("ask", a0); cue("pop", a0 - 0.05, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.9), ev=dict(ask=R(a0)))); t = c + 1.9

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
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—…]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Hi! I've been here so long", "Здравствуйте! Я сижу тут так долго,"],
                          ["the menu's gone out of season.", "что меню уже не по сезону."],
                          ["Shall we order before spring?", "Может, закажем до весны?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
