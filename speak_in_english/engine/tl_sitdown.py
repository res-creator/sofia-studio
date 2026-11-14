"""python3 tl_sitdown.py -> eps/sitdown/timeline.json  (rubric «Наше за границей» (nashe4), 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "sitdown"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
# long character lines (no aligner output): words spread inside the speech segments measured from the audio's pauses
SEG = {"o4_h": [("Ancient technology.", 0.02, 1.64), ("We sit,", 2.53, 2.97), ("we breathe,", 3.59, 4.09), ("and the passport", 4.88, 5.93), ("we 'lost'", 6.08, 6.76),
                ("always turns up in a pocket.", 7.3, 8.83)],
       "end_c": [("This is your captain.", 0.02, 1.12), ("We're running late.", 1.43, 2.13), ("I'm…", 2.45, 2.86), ("sitting for luck.", 3.16, 4.07)],
       # outro: the aligner returned «три или четыре» after «Пиши»; fixed from the audio's speech segments
       "outro": [("А ты бы ответила как:", 0.04, 1.2), ("один,", 1.51, 1.83), ("два,", 1.86, 2.15), ("три или четыре?", 2.23, 3.16), ("Пиши в комментариях!", 3.44, 4.46)]}
def seg_words(segs):
    out = []
    for txt, a, b in segs:
        ws = txt.split(); wl = [len(w) + 1 for w in ws]; tot = sum(wl); cc = 0
        for w, l in zip(ws, wl): out.append([w, round(a + (b - a) * cc / tot, 3), round(a + (b - a) * (cc + l) / tot, 3)]); cc += l
    return out
def word_times(lid):
    if lid in SEG: return seg_words(SEG[lid])
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    for i in range(1, len(out)):   # keep the aligner's words monotonic
        if out[i][1] < out[i - 1][1]: out[i][1] = out[i - 1][1]
        if out[i][2] < out[i][1]: out[i][2] = out[i][1]
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = the busy US terminal at gate 7: she sits on her suitcase, eyes closed, people rush past; the robot vacuum stands "sitting" beside her;
#      an American passenger with a backpack leans over her — his line at 0.2 s
cue("whir", 0.0, 0.35); cue("steps", 0.0, 0.4)
t = say("hook_p", 0.2)
hev = dict()
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["robot"] = wat("hook", t, 3)     # «посидеть на дорожку» -> close shot: the robot vacuum is "sitting" too
hev["wide"] = wat("hook", t, 6)      # «Четыре попытки» -> back to the terminal
cue("whoosh", hev["robot"] - 0.05, 0.4); cue("beep", hev["robot"] + 0.25, 0.35); cue("beep", hev["robot"] + 0.55, 0.3); cue("whoosh", hev["wide"], 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Shh. Sitting. Tradition." (open palm up, eyes closed) — "Tradition of… blocking gate seven?" — a queue of luggage carts piles up behind her
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_p", c0)
ev["carts"] = R(c + 0.1); [cue("clank", c + 0.25 + i * 0.4, 0.45) for i in range(4)]; cue("honk", c + 1.5, 0.45); cue("honk", c + 1.75, 0.4)
c = say("o1_nar", c + 1.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> "It's a custom. We sit before a trip." — "Can you sit faster? Your flight's boarding." — insert: the board, FINAL CALL blinking; she "sits faster" (bounces)
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_p", c0)
ev["board"] = R(c + 0.1); [cue("alarm", c + 0.3 + i * 0.45, 0.4) for i in range(3)]
ev["bounce"] = R(c + 1.65); [cue("squeak", c + 1.7 + i * 0.22, 0.3) for i in range(6)]
c = say("o2_nar", c + 2.2)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> "It's for luck..." — "Oh, that's actually lovely." — he carefully sits down next to her on his backpack; both close their eyes; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.3, 0.45)
c0 = c + 0.3; c = say("o3_p", c0)
ev["sit"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.3); cue("deflate", c + 0.55, 0.5)
ev["calm"] = R(c + 1.2); cue("chime", c + 1.25, 0.3)
c = say("o3_nar", c + 1.9)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.6), ev=ev)); t = c + 0.6

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; she breathes in; on «pocket» she pulls the passport out of her jacket pocket (insert); "…I need to sit down too." — he plops down
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["breathe"] = R(h0 + 3.55); cue("breath", h0 + 3.6, 0.4)                   # «we breathe»
ev["pass"] = R(h0 + 4.85)                                                  # «and the passport» -> he pats his own pockets, worried
ev["pocket"] = R(h0 + 7.6); cue("zip", h0 + 7.65, 0.4)                     # «always turns up in a pocket» -> she pulls it out
ev["insert"] = R(c + 0.05); cue("sparkle", c + 0.15, 0.5); cue("tada", c + 0.2, 0.35)
c0 = c + 1.45; c = say("o4_p", c0)
ev["plop"] = R(c + 0.05); cue("thud", c + 0.15, 0.55)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.95), ev=ev)); t = c + 0.95

# ---- twist (music silent): the camera pulls back — the whole terminal is sitting on suitcases; PA chime; the captain over the tannoy;
#      on «I'm… sitting for luck» the jet-bridge door: the captain himself sits on his flight bag with the PA handset
s = t; ev = dict(beat=R(s))
ev["reveal"] = R(s + 0.1); cue("boing", s + 0.4, 0.4)
ev["chime"] = R(s + 1.0); cue("pa", s + 1.0, 0.55)
c0 = s + 1.75; c = say("end_c", c0)
ev["capt"] = R(c0 + 2.45 - 0.1)
ev["laugh"] = R(c + 0.1); cue("gasp", c + 0.15, 0.4)
c = say("moral", c + 0.95)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); then the comment question (ask) big above the buttons
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
a0 = c + 0.35; cue("whoosh", a0 - 0.1, 0.45); c = say("ask", a0)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9), ev=dict(ask=R(a0)))); t = c + 0.9

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
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric", "absurd", "comment_q"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Ancient technology.", "Древняя технология."],
                          ["We sit, we breathe,", "Садимся, дышим —"],
                          ["and the passport we 'lost'", "и «потерянный» паспорт"],
                          ["always turns up in a pocket.", "всегда находится в кармане."]],
                 "end_c": [["This is your captain. We're running late.", "Говорит ваш капитан. Мы задерживаемся."],
                           ["I'm… sitting for luck.", "Я… сижу на удачу."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
