"""python3 tl_wherehurt.py -> eps/wherehurt/timeline.json  (rubric «Полезное» useful4, 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "wherehurt"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
R = lambda x: round(x, 3)
def say(lid, t):
    sp = dict(LN[lid]); sp["t"] = R(t); sp["d"] = R(D[lid]); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=R(t), g=g))

def segments(lid, gap):   # voiced segments split at silences longer than gap
    x, sr = sf.read(f"{VO}/{lid}.wav"); x = x if x.ndim == 1 else x.mean(1); hop = sr // 100
    e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]); q = e > e.max() * 0.04
    idx = np.where(q)[0]; segs = []; i = idx[0]; a = idx[0]
    while i <= idx[-1]:
        if not q[i]:
            j = i
            while not q[j]: j += 1
            if (j - i) / 100 > gap: segs.append((a / 100, i / 100)); a = j
            i = j
        else: i += 1
    segs.append((a / 100, idx[-1] / 100 + 0.01)); return segs
def phrases(words, pat):
    out, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(pat, w): out.append(cur); cur = []
    if cur: out.append(cur)
    return out
BREAKS = {"o4_h": [3, 7, 11, 18]}
def est_words(lid):  # char-proportional word timings; phrases (sentences, else sentences + commas) snap to the voiced segments; a leading groan is skipped
    text = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]); words = text.split()
    best = None
    if lid in BREAKS:   # phrase starts (word indices) checked by ASR of the voiced segments
        b = [0] + BREAKS[lid] + [len(words)]; ph = [words[b[i]:b[i + 1]] for i in range(len(b) - 1)]; segs = segments(lid, 0.25)
        if len(segs) == len(ph): best = (ph, segs)
    for gap in ((0.25, 0.15, 0.1) if not best else ()):
        segs = segments(lid, gap)
        for pat in (r"[.!?…]$", r"[.!?…,]$"):
            ph = phrases(words, pat)
            if len(segs) == len(ph): best = (ph, segs); break
            if len(segs) == len(ph) + 1 and segs[0][1] - segs[0][0] < 1.0: best = (ph, segs[1:]); break
        if best: break
    if not best: s = segments(lid, 0.25); best = ([words], [(s[0][0], s[-1][1])])
    out = []
    for ws, (s0, s1) in zip(*best):
        wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; pz = [2.0 if re.search(r"[,—…]$", w) else 0 for w in ws]
        tot = sum(wts) + sum(pz[:-1]); cc = 0
        for w, wt, p_ in zip(ws, wts, pz):
            t0 = s0 + cc / tot * (s1 - s0); cc += wt; out.append([w, R(t0), R(s0 + cc / tot * (s1 - s0))]); cc += p_
    return out
def word_times(lid):
    try: return [list(x) for x in json.load(open(f"{VO}/{lid}.words.json"))]
    except FileNotFoundError: return est_words(lid)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])
def wend(lid, t0, i): return R(t0 + word_times(lid)[i][2])

# ---- hook: frame 0 = a London GP's office: the heroine, bent, hand on her lower back, a pink hot water bottle tied on; Dr Fenwick at his desk;
#      the teaching skeleton in the corner wears a scarf and has a thermometer in its mouth.
cue("tick", 0.0, 0.25); cue("squeak", 0.05, 0.3)
t = say("hook_d", 0.2); hev = dict()
t += 0.3
hev["nar"] = R(t); e = say("hook", t)      # «Главный вопрос у врача» -> close: her face + the hot water bottle (steam), she winces
hev["bs"] = wat("hook", t, 7) - 0.05        # «back side» -> teaser: the doctor's face, shocked, blushing
cue("brow", hev["bs"] + 0.05, 0.45)
hev["wide"] = wat("hook", t, 10) - 0.05     # «сейчас поймёшь почему» -> the office (skeleton)
cue("whoosh", hev["wide"], 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» "Here. Everywhere. Big ouch." (she flails, palms all over herself) -> "Everywhere? Even your eyebrows?" (penlight)
#      -> close-up: the light beam lands on her eyebrow, she squints
s = t; ev = opt_start(s)
h0 = s + 0.35; c = say("o1_h", h0); ev["every"] = wat("o1_h", h0, 1)
c0 = c + 0.3; c = say("o1_d", c0); ev["torch"] = wat("o1_d", c0, 2); cue("click", ev["torch"] + 0.05, 0.5)
ev["light"] = R(c + 0.05); cue("ding", c + 0.12, 0.3)
c = say("o1_nar", c + 0.45)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 2: «ВЕЖЛИВО» "I have a pain in my back side." -> "Your... backside?" he blushes and rolls away on his chair to the wall (bonk);
#      narrator: diagram (backside = the bum, red cross), then «Доктор уже у стены» the doctor pressed against the wall
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_d", c0); ev["blush"] = wat("o2_d", c0, 1)
ev["roll"] = R(c + 0.05); cue("roll", c + 0.05, 0.6); cue("thud", c + 0.62, 0.6); cue("nope", c + 0.75, 0.35)
c0 = c + 1.05; ev["diag"] = R(c0); c = say("o2_nar", c0)
ev["wall"] = wat("o2_nar", c0, 6) - 0.05
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» he rolls back in; "I've got a sharp pain in my lower back. It hurts when I bend down." (hand on the lower back, zap;
#      she bends a little and winces) -> "Right, that's helpful. Let's have a look." he snaps on a glove; narrator (diagram: lower back = green); tip
s = t; ev = opt_start(s); cue("roll", s + 0.05, 0.4)
h0 = s + 0.45; c = say("o3_h", h0); ev["zap"] = wat("o3_h", h0, 7); cue("zap", ev["zap"] + 0.05, 0.35)
ev["bend"] = wat("o3_h", h0, 13) - 0.1; cue("zap", ev["bend"] + 0.3, 0.4)
c0 = c + 0.3; c = say("o3_d", c0)
ev["glove"] = R(c + 0.0); cue("snap", c + 0.3, 0.6)
c0 = c + 0.6; c = say("o3_nar", c0)
ev["diag"] = wat("o3_nar", c0, 6) - 0.05
c = say("o3_tip", c + 0.36); ev["tip"] = R(c - D["o3_tip"]); cue("ding", ev["tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=ev)); t = c + 0.15

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» her precise line: his pen scribbles on its own; «saint» -> a halo pops over her head;
#      "...You've just written my notes for me." -> notepad insert (her words, a gold star); he puts the pen down and applauds; the pen rolls off the desk
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["scrib"] = wat("o4_h", h0, 3) - 0.05; cue("scribble", ev["scrib"] + 0.1, 0.4); cue("scribble", wat("o4_h", h0, 7), 0.4)
ev["granny"] = wat("o4_h", h0, 17) - 0.05; cue("creak", ev["granny"] + 0.1, 0.35)
ev["halo"] = wat("o4_h", h0, 23) - 0.05; cue("chime", ev["halo"], 0.45)
c0 = c + 0.35; c = say("o4_d", c0)
ev["notes"] = R(c + 0.05); cue("paper", c + 0.1, 0.5); cue("sparkle", c + 0.3, 0.35)
ev["clap"] = R(c + 1.2); cue("clapclap", c + 1.3, 0.55)
ev["fall"] = R(c + 2.1); cue("plop", c + 2.45, 0.5)
scenes.append(dict(id="o4", s=R(s), e=R(c + 2.6), ev=ev)); t = c + 2.6

# ---- twist (music silent): he bends down for the pen and freezes — zap, crack; "Ah. Lower back. Sharp. Could I borrow your hot water bottle?"
#      -> she unties the bottle and hands it over; the doctor with the pink bottle on his back sighs with relief; moral
s = t; ev = dict(bend=R(s))
ev["freeze"] = R(s + 0.75); cue("crack", s + 0.75, 0.7); cue("zap", s + 0.78, 0.45)
c0 = s + 1.25; c = say("end_d", c0)
ev["ask"] = wat("end_d", c0, 4) - 0.05      # «Could I borrow your hot water bottle?» -> she unties it, smiling
ev["give"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.35); cue("ding", c + 0.7, 0.35); cue("sigh", c + 0.8, 0.45)
c = say("moral", c + 1.1)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.4), ev=ev)); t = c + 0.4

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor); then the comment question «Грелка или таблетка?»
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for w in ["один", "два", "три", "четыре"]:
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
ev = dict(ask=R(c + 0.35)); cue("pop", c + 0.35, 0.6)
c = say("ask", c + 0.4)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.9), ev=ev)); t = c + 0.9

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) if len(x[i*hop:(i+1)*hop]) else 0 for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    sp["words"] = word_times(sp["id"])
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {"o4_h": [["Lower back, doctor.", "Поясница, доктор."],
                          ["Sharp when I bend, dull when I sit.", "Остро, когда наклоняюсь, ноет, когда сижу."],
                          ["I've got the spine of a granny", "У меня спина бабушки"],
                          ["and the patience of a saint.", "и терпение святой."]],
                 "end_d": [["Ah. Lower back. Sharp.", "Ай. Поясница. Остро."], ["Could I borrow your hot water bottle?", "Можно одолжить вашу грелку?"]]}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2), s_["words"] if s_["who"] != "nar" else "") for s_ in speech]
