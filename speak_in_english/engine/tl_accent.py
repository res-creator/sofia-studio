"""python3 tl_accent.py -> eps/accent/timeline.json  (rubric answers4 «Как ответить, когда…»: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}.
Office kitchen by the water cooler; the department parrot (in a tie) on the cooler echoes the last word of Hugo's lines
(its voice = Hugo's own word, pitched up — cfg.parrot, mixed by audio_v2.py)."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "accent"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes, parrot = [], [], [], []
PIT = 1.55   # parrot pitch/speed factor
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
R = lambda x: round(x, 3)
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def echo(word, src, a, b, t):   # the parrot repeats Hugo's last word: returns its end time
    d = (b - a) / PIT; parrot.append(dict(w=word, src=src, a=a, b=b, t=R(t), d=R(d))); cue("squawk", t - 0.12, 0.45); return t + max(d, 0.75)   # its bubble stays >= 0.75 s

# ---- hook: frame 0 = Hugo at the cooler mid-mock, a giant «R» already flying out of his mouth toward her coffee; his line at 0.2 s
hev = {}
c = say("hook_c", 0.2)
hev["r"] = [-0.6, R(0.2 + 1.3), R(0.2 + 2.25)]            # launch times of the three «R»s (flight 0.85 s, plop into her mug)
for r in hev["r"]: cue("plop", r + 0.85, 0.6)
cue("boing", 0.2 + 1.3 + 0.86, 0.25)
hev["par"] = R(c + 0.2); pe = echo("INTERRRESTING!", "hook_c", 2.1, 3.76, c + 0.2)
hev["nar"] = R(pe + 0.15); e = say("hook", pe + 0.15)
hev["mug"] = R(hev["nar"] - 0.03)                            # insert: her mug with three «R»s floating in the coffee
hev["wide"] = wat("hook", hev["nar"], 4)                     # «Четыре ответа» -> back to the cooler
cue("whoosh", hev["mug"], 0.4); cue("whoosh", hev["wide"] - 0.05, 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1 «В ЛОБ»: she stamps and shouts; "It's a tribute!" -> he takes a theatrical bow, a spotlight, roses; the parrot "TRIBUTE!" flaps its wings
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35); cue("stomp", s + 0.35 + 0.1, 0.5); cue("stomp", s + 0.35 + 1.1, 0.5); cue("stomp", s + 0.35 + 2.25, 0.55)
c0 = c + 0.3; c = say("o1_c", c0)
ev["bow"] = R(c + 0.05); cue("tada", c + 0.05, 0.4); cue("clapclap", c + 0.3, 0.45)
ev["par"] = R(c + 0.55); pe = echo("TRIBUTE!", "o1_c", 1.1, 1.69, c + 0.55)
ev["rose"] = R(c + 0.35)
c = say("o1_nar", pe + 0.25)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2 «ВЕЖЛИВО»: quiet request; "...rrreally" -> one more «R» flies into her coffee (splash); the parrot "RRREALLY?"
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_c", c0)
ev["r"] = R(c - 0.15); ev["land"] = R(c - 0.15 + 0.85); cue("whoosh", c - 0.1, 0.35); cue("plop", ev["land"], 0.7)
ev["splash"] = ev["land"]
ev["par"] = R(ev["land"] + 0.4); pe = echo("RRREALLY?", "o2_c", 2.7, 3.46, ev["land"] + 0.4)
ev["mug"] = R(pe + 0.1)
c = say("o2_nar", pe + 0.15); cue("whoosh", ev["mug"], 0.35)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3 «КАК НОСИТЕЛЬ»: dry British humour; "...Fair. That was terrible." -> he deflates, the «R»s in her mug sink; the parrot nods "TERRIBLE!"; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35)
c0 = c + 0.3; c = say("o3_c", c0)
ev["sink"] = R(c + 0.1); cue("deflate", c + 0.1, 0.35)
ev["par"] = R(c + 0.35); pe = echo("TERRIBLE!", "o3_c", 1.88, 2.53, c + 0.35)
c = say("o3_nar", pe + 0.2)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4 «КОРОЛЕВСКИЙ ОТВЕТ»: she sips ("Lovely."), the grand line; he tries "Worcestershire" and the letters crack and crumble out of his mouth
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["sip"] = R(h0 + 0.05); cue("gulp", h0 + 0.5, 0.45)
ev["ch2"] = R(h0 + 1.45); ev["ch3"] = R(h0 + 4.85)
ev["worc"] = R(h0 + 7.96); cue("sparkle", h0 + 7.3, 0.35)
ev["gasp"] = R(c + 0.08); cue("gasp", c + 0.1, 0.55)
c0 = c + 0.45; c = say("o4_c", c0)
ev["l"] = [R(c0 + 0.1), R(c0 + 1.15), R(c0 + 2.15)]           # «WUSS» / «WOR» / «CESTER» pop out of his mouth and crack
for x in ev["l"]: cue("pop", x, 0.5); cue("crack", x + 0.45, 0.55)
ev["palm"] = R(c0 + 3.25)
ev["par"] = R(c + 0.3); pe = echo("MINUTE!", "o4_c", 3.6, 4.19, c + 0.3)
scenes.append(dict(id="o4", s=R(s), e=R(pe + 0.3), ev=ev)); t = pe + 0.3

# ---- twist (music silent): he tries Russian — «ZDRA» falls out letter by letter into a pile on his shoes; "Let's just go with hello." (wave); the parrot "HELLO!"; moral
s = t; ev = dict(beat=R(s))
ev["think"] = R(s + 0.05)
c0 = s + 0.5; c = say("end_c", c0)
ev["z"] = [R(c0 + 0.1 + i * 0.32) for i in range(4)]
for i, x in enumerate(ev["z"]): cue("thud", x + 0.5, 0.35 + 0.05 * i)
ev["wave"] = R(c0 + 2.6)
ev["par"] = R(c + 0.3); pe = echo("HELLO!", "end_c", 3.2, 3.86, c + 0.3)
c = say("moral", pe + 0.25)
ev["moral"] = R(c - D["moral"]); cue("chime", ev["moral"] + 1.2, 0.3)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question «ask»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
ev = dict(ask=R(c + 0.35)); cue("ding", c + 0.3, 0.4)
c = say("ask", c + 0.35)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9), ev=ev)); t = c + 0.9

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
# o4_h: chunk starts from the measured voice segments (0.03 / 1.48 / 4.90 s)
o4 = next(s_ for s_ in speech if s_["id"] == "o4_h")
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric", "absurd", "comment_q"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN; cfg["parrot"] = parrot; cfg["pitch"] = PIT
cfg["chunks"] = {"o4_h": [["Lovely.", "Прелестно."],
                          ["I speak two languages with an accent, Hugo.", "Я говорю на двух языках с акцентом, Хьюго."],
                          ["You speak one — and still can't say 'Worcestershire'.", "Ты — на одном и до сих пор не можешь сказать «Вустершир»."]],
                 "o4_c": [["Wuss... Wor-sester...", "Вус… Вор-сес…"], ["I need a minute.", "Мне нужна минутка."]],
                 "end_c": [["Zdra... zdrast...", "Здра… здраст…"], ["Let's just go with hello.", "Давай просто «привет»."]]}
# measured word starts so the chunk bubbles follow the voice (word count must match the joined chunks)
def setw(lid, starts):
    s_ = next(x for x in speech if x["id"] == lid); ws = " ".join(ch[0] for ch in cfg["chunks"][lid]).split()
    assert len(ws) == len(starts), (lid, len(ws), len(starts))
    s_["words"] = [[w, a, (starts[i + 1] if i + 1 < len(starts) else s_["d"])] for i, (w, a) in enumerate(zip(ws, starts))]
setw("o4_h", [0.03, 1.48, 1.6, 1.94, 2.2, 2.89, 3.1, 3.31, 3.73, 4.9, 5.21, 5.45, 5.8, 6.5, 6.79, 7.0, 7.25, 7.96])
setw("o4_c", [0.07, 1.14, 3.33, 3.52, 3.6, 3.7])
setw("end_c", [0.03, 1.43, 2.62, 2.85, 3.0, 3.1, 3.2])
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]; print(parrot)
