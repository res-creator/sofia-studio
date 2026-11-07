"""python3 tl_mlm.py -> eps/mlm/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "mlm"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = café table, Mia already leaning in waving the BE YOUR OWN BOSS flyer at her, brochures fanned out, a shake bottle; her line at 0.2 s
cue("whoosh", 0.0, 0.5); cue("feather", 0.1, 0.5)
t = say("hook_m", 0.2)
hev = dict(wave=0.2)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["flyer"] = wat("hook", t, 4)     # «Нужно только вложить триста» -> flyer insert: BE YOUR OWN BOSS / START: £300
hev["wide"] = wat("hook", t, 8)      # «Четыре ответа» -> back to the table
cue("whoosh", hev["flyer"] - 0.05, 0.45); cue("stamp", hev["flyer"] + 0.75, 0.5); cue("whoosh", hev["wide"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.4), ev=hev)); t = e + 0.4

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "It's a triangle of opportunity!" Mia flips up a chart board; insert: the triangle OPPORTUNITY chart (YOU at the bottom, £ arrows up to ME); her facepalm
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_m", c0)
ev["board"] = R(c0 + 1.45); cue("whoosh", c0 + 1.45, 0.4); cue("pop", c0 + 1.65, 0.5)
ev["chart"] = R(c + 0.12); cue("sparkle", c + 0.3, 0.45); cue("ding", c + 0.85, 0.35)
ev["palm"] = R(c + 1.45); cue("thud", c + 1.5, 0.55)
c = say("o1_nar", c + 1.8)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "I will drive a Tesla." Mia pulls a toy car out of her bag and rolls it across the table into her coffee cup; her deadpan
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_m", c0)
ev["toy"] = R(c + 0.1); cue("vroom", c + 0.15, 0.5); cue("toy", c + 0.3, 0.4)
ev["bump"] = R(c + 1.15); cue("clank", c + 1.15, 0.45)
ev["dead"] = R(c + 1.45); cue("cricket", c + 1.5, 0.35)
c = say("o2_nar", c + 1.95)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> Mia deflates; "can I add you to the group chat?" -> phone insert BOSS BABES flood; she smiles, palms out: no thanks; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.0, 0.4)
c0 = c + 0.3; c = say("o3_m", c0)
ev["deflate"] = R(c0 + 0.1); cue("deflate", c0 + 0.15, 0.4)
ev["chat"] = R(c + 0.12); cue("msg", c + 0.4, 0.5); cue("msg", c + 0.65, 0.5); cue("msg", c + 0.9, 0.5); cue("msg", c + 1.1, 0.45)
ev["nope"] = R(c + 1.5); cue("pop", c + 1.55, 0.4)
c = say("o3_nar", c + 1.9)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> sweet smile, she lifts her phone "Shall I invite her?"; Mia sweats and hugs the shake bottle
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["phone"] = R(h0 + 4.9); cue("blink", ev["phone"], 0.4)
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.55)
c0 = c + 0.45; c = say("o4_m", c0)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- twist: deliberate beat (music silent): Mia's phone buzzes on the table; insert: "Upline: You owe me £900"; her shock; then a forced grin and she holds out a shake bottle
s = t; ev = dict(beat=R(s))
ev["buzz"] = R(s + 0.15); cue("buzz", s + 0.15, 0.6); cue("buzz", s + 0.75, 0.55)
ev["msg"] = R(s + 0.55); cue("msg", s + 0.75, 0.6)
ev["shock"] = R(s + 1.9); cue("gulp", s + 2.0, 0.55)
ev["offer"] = R(s + 2.35); cue("whoosh", s + 2.35, 0.35)
c = say("end_m", s + 2.6)
ev["look"] = R(c + 0.15); cue("cricket", c + 0.25, 0.3)
c = say("moral", c + 0.75)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

ANCH = {"o4_h": {5: 2.0, 13: 4.97}, "o2_m": {4: 1.44, 8: 2.77, 9: 3.21}, "o1_m": {4: 1.59}, "o3_m": {1: 0.95, 2: 2.01}}
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
    if sp["id"] in ANCH:   # snap the estimated word starts to the real pauses (energy gaps) of the squeezed audio
        an = ANCH[sp["id"]]; xs = [0.0] + [wt[i][1] for i in sorted(an)] + [sp["d"]]; ys = [0.0] + [an[i] for i in sorted(an)] + [sp["d"]]
        wt = [[w, round(float(np.interp(a, xs, ys)), 3), round(float(np.interp(b, xs, ys)), 3)] for w, a, b in wt]
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["I'd love to join — as soon as your upline buys me lunch.", "С радостью вступлю — как только твоя наставница угостит меня обедом."],
                          ["Shall I invite her?", "Позвать её?"]],
                 "o2_m": [["That's what I said!", "Я тоже так говорила!"],
                          ["Now I drive a... well, I will drive a Tesla.", "А теперь я езжу на… ну, буду ездить на Тесле."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
