"""python3 tl_feet.py -> eps/feet/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "feet"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = Bill's socked feet already up on the seat in front, one shoe still tumbling; his line at 0.2 s; smell lines drift to her
cue("plunk", 0.05, 0.6); cue("plunk", 0.4, 0.5); cue("hum", 0.0, 0.25); cue("sniff", 1.0, 0.5)
t = say("hook_s", 0.2)
hev = dict(feet=0.0)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["socks"] = wat("hook", t, 6)     # «вытянул ноги» -> close-up of the socks: hole, big toe, green smell waves
hev["map"] = wat("hook", t, 8)       # «Лететь ещё шесть часов» -> seat-back flight map: TIME TO DESTINATION 6:00
hev["wide"] = wat("hook", t, 12)     # «Четыре ответа» -> back to the row
cue("whoosh", hev["socks"] - 0.05, 0.45); cue("squeak", hev["socks"] + 0.3, 0.35); cue("whoosh", hev["map"] - 0.05, 0.4); cue("blink", hev["map"] + 0.35, 0.5); cue("whoosh", hev["wide"], 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.35), ev=hev)); t = e + 0.35

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Relax, they're clean socks. Mostly." insert: a fly circles his sock and drops dead; her facepalm
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_s", c0)
ev["fly"] = R(c + 0.08); cue("fly", c + 0.05, 0.6); ev["drop"] = R(c + 0.85); cue("deflate", c + 0.85, 0.35); cue("plunk", c + 1.15, 0.6)
ev["palm"] = R(c + 1.5); cue("plunk", c + 1.55, 0.4)
c = say("o1_nar", c + 1.75)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "But my feet need to breathe." insert: the sock inflates and deflates like a lung; she fans herself with the safety card
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_s", c0)
ev["breathe"] = R(c + 0.08); cue("breath", c + 0.15, 0.6); cue("breath", c + 0.75, 0.6)
ev["fan"] = R(c + 1.45); cue("whoosh", c + 1.5, 0.3); cue("whoosh", c + 1.85, 0.3)
c = say("o2_nar", c + 1.75)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> embarrassed "Oh! Sorry, of course." the feet drop, shoes back on, the smell clears (sparkle); she breathes in, happy; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35)
c0 = c + 0.3; c = say("o3_s", c0)
ev["down"] = R(c + 0.1); cue("whoosh", c + 0.12, 0.45); cue("plunk", c + 0.4, 0.55); cue("plunk", c + 0.62, 0.55)
ev["clean"] = R(c + 0.75); cue("sparkle", c + 0.8, 0.5); ev["relief"] = R(c + 1.15); cue("chime", c + 1.2, 0.3)
c = say("o3_nar", c + 1.7)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line; his toes curl in shame; insert: the socks buckled into their own seat; he grumbles, shoes on
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["seat"] = R(c + 0.08); cue("ding", c + 0.15, 0.45); cue("zip", c + 0.7, 0.4); cue("pop", c + 1.05, 0.35)
c0 = c + 1.6; c = say("o4_s", c0)
ev["shoes"] = R(c0 + 1.6); cue("plunk", c0 + 1.75, 0.55); cue("plunk", c0 + 2.0, 0.55)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.45), ev=ev)); t = c + 0.45

# ---- twist: deliberate beat (music silent): she sits back, victorious; then the granny in front kicks off HER shoes, bare feet poke between the seats;
#      "Ahh, that's better!"; the heroine looks into the camera; Bill grins
s = t; ev = dict(beat=R(s))
ev["kick"] = R(s + 0.55); cue("plunk", s + 0.6, 0.6); cue("plunk", s + 0.8, 0.55)
ev["poke"] = R(s + 0.95); cue("squeak", s + 1.0, 0.45); cue("boing", s + 1.1, 0.35)
c = say("end_g", s + 1.55)
ev["look"] = R(c + 0.1); cue("blink", c + 0.35, 0.5)
c = say("moral", c + 0.75)
ev["grin"] = R(c - 1.6)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

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
cfg["chunks"] = {"o4_h": [["Sir, your socks have more personality than the in-flight film.", "Сэр, у ваших носков больше характера, чем у фильма в самолёте."],
                          ["Shall I ask the crew to give them their own seat?", "Попросить экипаж выделить им отдельное место?"]],
                 "o3_h": [["Sorry, would you mind putting your shoes back on?", "Простите, не могли бы вы обуться?"],
                          ["It's a bit much in here.", "Тут немного тяжеловато."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
