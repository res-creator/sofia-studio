"""python3 tl_petrol.py -> eps/petrol/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "petrol"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def word_times(lid):
    try: w = json.load(open(f"{VO}/{lid}.words.json"))
    except FileNotFoundError: return None
    if lid == "o4_h": return [list(x) for x in w]
    out = []
    for word, a, b in w:
        if re.fullmatch(r"[—–-]+", word) and out: out[-1][0] += " —"; out[-1][2] = b; continue
        out.append([word, a, b])
    return out
R = lambda x: round(x, 3)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = the car still coughing black puffs on the driveway, Charlie already dangling the keys at her; his line at 0.2 s
cue("sputter", 0.0, 0.8); cue("jingle", 0.15, 0.6)
t = say("hook_f", 0.2)
hev = dict(keys=0.2); cue("sputter", 1.3, 0.5)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["dash"] = wat("hook", t, 9)      # «пустым баком» -> dashboard insert: needle on E, amber pump light blinking
hev["wide"] = wat("hook", t, 11)     # «Четыре ответа» -> back to the driveway
cue("whoosh", hev["dash"] - 0.05, 0.45); cue("blink", hev["dash"] + 0.25, 0.5); cue("blink", hev["dash"] + 0.75, 0.45); cue("whoosh", hev["wide"], 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.4), ev=hev)); t = e + 0.4

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "At the petrol station, obviously." he waves down the road; cut to the road sign (PETROL 12 MILES); her facepalm
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_f", c0)
ev["wave"] = R(c0 + 0.5); cue("whoosh", c0 + 0.55, 0.35)
ev["sign"] = R(c + 0.12); cue("boing", c + 0.2, 0.5)
ev["palm"] = R(c + 1.2); cue("thud", c + 1.25, 0.55)
c = say("o1_nar", c + 1.6)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» -> "Next time? Great — Saturday, then!" he snatches the keys back; phone calendar insert (SATURDAY: borrow the car); her horror
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_f", c0)
ev["snatch"] = R(c0 + 0.85); cue("whoosh", c0 + 0.85, 0.45); cue("jingle", c0 + 1.0, 0.7)
ev["cal"] = R(c + 0.12); cue("tap", c + 0.5, 0.6); cue("tap", c + 0.7, 0.6); cue("msg", c + 0.95, 0.55)
ev["horror"] = R(c + 1.3); cue("gasp", c + 1.35, 0.6)
c = say("o2_nar", c + 2.0)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> sheepish "Oh! Yes, sorry." he runs off with the petrol can; dashboard insert: the needle sweeps E -> F, the light goes off; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.45)
c0 = c + 0.3; c = say("o3_f", c0)
ev["run"] = R(c + 0.1); cue("whoosh", c + 0.12, 0.55)
ev["fill"] = R(c + 0.55); cue("gauge", c + 0.75, 0.6); ev["full"] = R(c + 1.65); cue("ding", c + 1.65, 0.55)
ev["relief"] = R(c + 2.05); cue("chime", c + 2.1, 0.3)
c = say("o3_nar", c + 2.45)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand line beside the car: she pulls the ticket from the windscreen and waves at the sunglasses; he sweats
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["ticket"] = wat("o4_h", h0, 9); cue("whoosh", ev["ticket"] - 0.1, 0.35)
ev["glasses"] = wat("o4_h", h0, 13); cue("sparkle", ev["glasses"], 0.45)
ev["invoice"] = wat("o4_h", h0, 16); cue("ding", ev["invoice"], 0.3)
ev["gasp"] = R(c + 0.1); cue("gasp", c + 0.12, 0.55)
c0 = c + 0.55; c = say("o4_f", c0)
ev["nod"] = R(c0 + 0.85)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.6), ev=ev)); t = c + 0.6

# ---- twist: deliberate beat (music silent): he reaches in through the window, holds up the sunglasses — they are hers; she realises, puts them on; he grins
s = t; ev = dict(beat=R(s))
ev["reach"] = R(s + 0.2); cue("creak", s + 0.25, 0.35)
ev["lift"] = R(s + 0.75); cue("sparkle", s + 0.8, 0.55)
c = say("end_f", s + 1.3)
ev["look"] = R(c + 0.12); cue("blink", c + 0.3, 0.5)
ev["blush"] = R(c + 0.75); cue("boing", c + 0.8, 0.45)
ev["wear"] = R(c + 1.55); cue("whoosh", c + 1.55, 0.35); cue("pop", c + 1.8, 0.4)
c = say("moral", c + 1.95)
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
cfg["chunks"] = {"o4_h": [["You returned my car with an empty tank,", "Ты вернул машину с пустым баком,"],
                          ["a parking ticket and someone's sunglasses.", "штрафом за парковку и чьими-то очками."],
                          ["Shall I invoice you, or are you buying brunch?", "Выставить тебе счёт — или ты угощаешь бранчем?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
