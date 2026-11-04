"""python3 tl_size.py -> eps/size/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "size"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
def wat(lid, t0, i, fb):
    w = word_times(lid)
    return R(t0 + w[i][1]) if w and len(w) > i else R(t0 + fb)

# ---- hook: live boutique, the clerk already eyeing the dress; her line at 0.15 s; the heroine raises a brow; narrator over quick cuts
cue("whoosh", 0.0, 0.35); cue("pop", 0.1, 0.4)
t = say("hook_c", 0.15)
hev = dict(react=R(t + 0.02)); cue("scratch", t, 0.5)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["dress"] = wat("hook", t, 2, 1.0)      # «платье» -> dress insert
hev["clerk"] = wat("hook", t, 4, 1.8)      # «продавщица» -> the clerk, nose up
hev["wide"] = wat("hook", t, 8, 3.2)       # «Четыре ответа» -> wide
cue("sparkle", hev["dress"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=hev)); t = e + 0.1

def plate_in(s): cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1 «В ЛОБ»: the clerk drapes a scarf over the heroine's shoulder
s = t; ev = plate_in(s)
c = say("o1_h", s + 0.5)
c = say("o1_c", c + 0.3)
ev["drape"] = R(c + 0.2); cue("whoosh", c + 0.2, 0.5); cue("feather", c + 0.5, 0.8)
ev["react"] = R(c + 0.7)
ev["tug"] = R(c + 1.25); cue("whoosh", c + 1.25, 0.35); cue("boing", c + 1.7, 0.45)   # she tugs at it -> it wraps round her head
c = say("o1_nar", c + 2.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2 «ВЕЖЛИВО»: the clerk flips the FITTING ROOM sign -> FOR BRAVE PEOPLE
s = t; ev = plate_in(s)
c = say("o2_h", s + 0.5)
c0 = c + 0.3; c = say("o2_c", c0)
ev["flip"] = R(c + 0.1); cue("squeak", c + 0.1, 0.6); cue("boing", c + 0.25, 0.45)
ev["sign"] = R(c + 0.5); cue("pop", c + 0.55, 0.5)
ev["gulp"] = R(c + 1.75); cue("gulp", c + 1.8, 0.7)
c = say("o2_nar", c + 2.75)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 3 «КАК НОСИТЕЛЬ»: the clerk stiffens, polite frozen smile
s = t; ev = plate_in(s)
c = say("o3_h", s + 0.5); cue("sparkle", c - 1.2, 0.5)
r0 = c + 0.3; ev["stiff"] = R(r0 - 0.05); cue("creak", r0 - 0.05, 0.6)
c = say("o3_c", r0)
ev["twitch"] = R(c + 0.35); cue("blink", c + 0.4, 0.6); cue("blink", c + 0.75, 0.6)   # frozen smile, one eye twitches
ev["walk"] = R(c + 0.9); cue("feather", c + 0.95, 0.4)
c = say("o3_nar", c + 1.5)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4 «КОРОЛЕВСКИЙ ОТВЕТ»: the clerk goes pale and fiddles with her tape
s = t; ev = plate_in(s)
c = say("o4_h", s + 0.5)
ev["pale"] = R(c + 0.15); cue("powerdown", c + 0.15, 0.4)
c = say("o4_c", c + 0.3)
for k in range(8): cue("tick", c + 0.1 + k * 0.17, 0.5)
ev["knot"] = R(c + 0.2); ev["tight"] = R(c + 1.35); cue("squeak", c + 1.35, 0.5)   # she twists the tape into a knot
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.8), ev=ev)); t = c + 1.8

# ---- twist: one deliberate beat (music silent), she pins on the NEW MANAGER badge, badge insert, the clerk faints onto the scarves; moral
s = t; ev = dict(beat=R(s))
h0 = s + 0.55; c = say("end_h", h0)
_tx = re.sub(r"\[[^\]]*\]\s*", "", LN["end_h"]["text"]); ev["pin"] = R(h0 + D["end_h"] * _tx.index("I'm") / len(_tx))   # on «I'm the new manager»
cue("stamp", ev["pin"] + 0.25, 0.7); cue("ding", ev["pin"] + 0.3, 0.5)
ev["badge"] = R(c + 0.15); cue("tada", c + 0.2, 0.55)
ev["sway"] = R(c + 1.45); cue("boing", c + 1.55, 0.55)
ev["fall"] = R(c + 1.9); cue("plop", c + 2.35, 0.9); cue("feather", c + 2.4, 0.9); cue("rimshot", c + 2.65, 0.6)
ev["rain"] = R(c + 2.4)   # scarves fly up and float down onto her; the heroine shrugs
c = say("moral", c + 3.5)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for k, w in enumerate(["один", "два", "три", "четыре"]):
    cue("pop", (wat("outro", s + 0.15, [6, 7, 8, 10][k], 2.2 + 0.4 * k)), 0.45)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.3))); t = c + 1.3

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    if x.ndim > 1: x = x.mean(1)
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
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["How kind of you to worry.", "Как мило, что вы волнуетесь."], ["Could I speak to the manager about your fashion advice?", "Можно поговорить с менеджером о ваших советах?"]],
                 "end_h": [["Oh wait — I'm the new manager.", "Ой, подождите — новый менеджер — это я."], ["I start on Monday.", "Выхожу в понедельник."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
