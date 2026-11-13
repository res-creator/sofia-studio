"""python3 tl_lostbag.py -> eps/lostbag/timeline.json  (rubric «Полезное» (useful4), 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "lostbag"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = baggage claim, empty carousel (only a trombone in a knitted hat rides it), she holds up her phone with the photo of her red suitcase;
#      Denise behind the LOST BAGGAGE desk, bored; her line at 0.2 s
cue("hum", 0.0, 0.35); cue("clank", 0.05, 0.25)
t = say("hook_a", 0.2)
hev = dict()
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["phone"] = R(t - 0.05)            # «Чемодан потерян» -> insert: her phone, the photo of the red suitcase
hev["salo"] = wat("hook", t, 5)       # «самое ценное» -> the photo turns into an x-ray: salo inside, glowing
hev["wide"] = wat("hook", t, 7)       # «Как требовать» -> back to the hall (the trombone rides by)
cue("whoosh", hev["phone"], 0.45); cue("pop", hev["phone"] + 0.15, 0.4); cue("sparkle", hev["salo"], 0.45); cue("whoosh", hev["wide"] - 0.05, 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Bag lost! You find! Fast!" -> "I'm not a sniffer dog" — and then she sniffs the air anyway (nose up, left, right)
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
c0 = c + 0.3; c = say("o1_a", c0)
ev["sniff"] = R(c + 0.1)
for i in range(3): cue("sniff", c + 0.15 + i * 0.42, 0.6)
ev["sniffend"] = R(c + 1.45)
c = say("o1_nar", c + 1.7)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> timid -> "Maybe it's just shy." — Denise on her knees at the carousel, a torch under the belt; the trombone rides over her head
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_a", c0)
ev["peek"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("thud", c + 0.3, 0.4); cue("click", c + 0.6, 0.5)
ev["tromb"] = R(c + 1.0); cue("honk", c + 1.25, 0.5)
c = say("o2_nar", c + 1.6)
ev["facepalm"] = R(c - 0.6)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> calm, clear request -> "Of course. Fill this in — here's your number." — she slides a form + a reference-number slip; insert: the form, stamp
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.0, 0.4)
c0 = c + 0.3; c = say("o3_a", c0)
ev["give"] = R(c0 + 0.9); cue("paper", c0 + 0.95, 0.5)
ev["form"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("stamp", c + 0.95, 0.7)
ev["formend"] = R(c + 1.8)
c = say("o3_nar", c + 1.9)
c = say("o3_tip", c + 0.36); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the grand speech about grandma's salo; Denise grabs the radio: "Code red. Pork on the loose." -> red beacon, siren
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["two"] = R(h0 + D["o4_h"] * 0.56)   # «Find it before…» -> two-shot (Denise's eyes widen)
c0 = c + 0.45; ev["radio"] = R(c0 - 0.3); cue("crackle", c0 - 0.25, 0.5)
c = say("o4_a", c0)
ev["beacon"] = R(c - 0.6); cue("siren", c - 0.55, 0.45)
ev["wide"] = R(c + 0.15)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.8), ev=ev)); t = c + 0.8

# ---- twist (music silent): Denise types, freezes, raises her brows; insert: the monitor — BAG FOUND, LISBON, FIRST CLASS (salo in a first-class seat); her line; heroine's joy
s = t; ev = dict(beat=R(s))
cue("typing", s + 0.05, 0.5)
ev["brows"] = R(s + 0.6); cue("brow", s + 0.65, 0.5)
ev["screen"] = R(s + 0.95); cue("ding", s + 1.1, 0.45); cue("sparkle", s + 1.4, 0.35)
c = say("end_a", s + 2.45)
ev["joy"] = R(c + 0.1); cue("gasp", c + 0.12, 0.5)
ev["tears"] = R(c + 0.6)
c = say("moral", c + 1.1)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question (ask) big on screen
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
c = say("ask", c + 0.5); cue("pop", c - D["ask"] - 0.05, 0.5)
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
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric", "comment_q"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Denise, somewhere out there my grandmother's salo is travelling alone.", "Дениз, где-то там бабушкино сало путешествует в одиночестве."],
                          ["Find it before it starts a new life without me.", "Найдите его, пока оно не начало новую жизнь без меня."]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
