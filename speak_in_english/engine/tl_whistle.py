"""python3 tl_whistle.py -> eps/whistle/timeline.json  (rubric «Наше за границей», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro (+ ask), no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "whistle"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
CHUNKS = {"o4_h": [["Whistle away, love.", "Свисти на здоровье, дорогой."],
                   ["But the bonus meeting's at three,", "Но совещание о премии в три,"],
                   ["and I'd hate to know who to blame.", "и мне бы очень не хотелось знать, кто виноват."]],
          "o3_h": [["It's a superstition back home —", "У нас дома есть такое суеверие:"],
                   ["whistling indoors chases money away.", "свист в помещении прогоняет деньги."]]}
def gaps(lid, mn=0.08):
    x, sr = sf.read(f"{VO}/{lid}.wav"); x = x if x.ndim == 1 else x.mean(1); h = sr // 100
    e = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)]); q = e < e.max() * 0.04; out = []; i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if (j - i) / 100 >= mn and i > 0 and j < len(q): out.append((i / 100, j / 100))
            i = j
        else: i += 1
    return out, len(x) / sr
def chunk_words(lid):
    """word timings for a chunked character line: chunk borders = the largest silences, words spread by length inside each chunk"""
    ch = CHUNKS[lid]; g, dur = gaps(lid); big = sorted(sorted(g, key=lambda a: a[0] - a[1])[:len(ch) - 1])
    reg = [(0.0 if i == 0 else big[i - 1][1], dur if i == len(ch) - 1 else big[i][0]) for i in range(len(ch))]; out = []
    for (en, _), (a, b) in zip(ch, reg):
        ws = en.split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in ws]; tot = sum(wts); cc = 0
        for w, k in zip(ws, wts): out.append([w, round(a + cc / tot * (b - a), 3), round(a + (cc + k) / tot * (b - a), 3)]); cc += k
    return out
_wt = word_times
def word_times(lid): return chunk_words(lid) if lid in CHUNKS else _wt(lid)
def wat(lid, t0, i): return R(t0 + word_times(lid)[i][1])

# ---- hook: frame 0 = open-plan London office; the British colleague whistles at his desk (notes in the air), his monitor: BONUS MEETING;
#      her piggy bank in a hard hat with a padlock trembles on her desk; his line at 0.2 s
cue("whistle_s", 0.0, 0.5)
t = say("hook_c", 0.2)
hev = dict()
cue("whistle_s", t + 0.02, 0.45)
t += 0.3
hev["nar"] = R(t); e = say("hook", t)
hev["mon"] = wat("hook", t, 3) - 0.05            # «за день до премии» -> insert: his monitor BONUS MEETING TOMORROW 3 PM
hev["her"] = wat("hook", t, 7) - 0.05            # «Как объяснить британцу?» -> her worried face, hugging the piggy bank
hev["wide"] = wat("hook", t, 10) - 0.05          # «Выбирай ответ» -> back to the office
cue("whoosh", hev["mon"] - 0.05, 0.4); cue("ding", hev["mon"] + 0.25, 0.35); cue("whoosh", hev["her"], 0.3); cue("whoosh", hev["wide"], 0.35)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.3), ev=hev)); t = e + 0.3

def opt_start(s):
    cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); return dict(plate=R(s))

# ---- option 1: «В ЛОБ» -> "Stop! No money!" (both palms out); "Want a fiver?" he holds out a £5 note and whistles on — the note slips out of his fingers and flutters out of the open window
s = t; ev = opt_start(s)
c = say("o1_h", s + 0.35)
ev["slap"] = R(c + 0.05); cue("thud", c + 0.1, 0.35); cue("clank", c + 0.35, 0.4)      # she slaps both palms on her padlocked piggy bank
c0 = c + 0.75; ev["offer"] = R(c0 + 0.5); c = say("o1_c", c0)
ev["whistle"] = R(c + 0.1); cue("whistle", c + 0.1, 0.55)
ev["fly"] = R(c + 0.45); cue("paper", c + 0.5, 0.55); cue("whoosh", c + 0.6, 0.3)
ev["gone"] = R(c + 1.75); cue("pop", c + 1.8, 0.35)
c = say("o1_nar", c + 2.15)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 2: «ВЕЖЛИВО» -> polite; "Bad luck for whom? The pigeons?" -> insert: two pigeons on the window sill turn to each other, outraged, then one turns its back on him
s = t; ev = opt_start(s)
c = say("o2_h", s + 0.35)
c0 = c + 0.3; c = say("o2_c", c0)
ev["pig"] = R(c + 0.05); cue("whoosh", c + 0.05, 0.35)
ev["look"] = R(c + 0.35); cue("coo", c + 0.4, 0.55)
ev["huff"] = R(c + 1.25); cue("feather", c + 1.3, 0.45)
c = say("o2_nar", c + 1.95)
ev["back"] = R(c - 0.9); cue("plop", c - 0.85, 0.35)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» -> calm explanation; "Fair enough." -> he starts whistling again and stops mid-note: the note pops, he presses his lips together; tip
s = t; ev = opt_start(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c0 = c + 0.3; c = say("o3_c", c0)
ev["half"] = R(c + 0.15); cue("whistle_half", c + 0.15, 0.55)
ev["stop"] = R(c + 0.55); cue("pop", c + 0.6, 0.55)
ev["gulp"] = R(c + 0.95); cue("gulp", c + 1.0, 0.5)
c = say("o3_nar", c + 1.55)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.5)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=ev)); t = c + 0.2

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» -> the sweet line (monitor clock ticks to the meeting); he sweats, then slowly seals his own mouth with a sticky note; muffled answer
s = t; ev = opt_start(s); h0 = s + 0.35
c = say("o4_h", h0)
ev["two"] = wat("o4_h", h0, 9) - 0.05                                        # «and I'd hate to know who to blame» -> two-shot, he sweats
ev["sweat"] = R(ev["two"] + 0.4); cue("gulp", ev["two"] + 0.9, 0.45)
ev["pad"] = R(c + 0.15); cue("paper", c + 0.2, 0.3)
ev["lift"] = R(c + 0.6)
ev["stick"] = R(c + 1.95); cue("squeak", c + 1.95, 0.45); cue("thud", c + 2.0, 0.25)
c0 = c + 2.4; c = say("o4_c", c0)
ev["thumbs"] = R(c + 0.1)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.85), ev=ev)); t = c + 0.85

# ---- twist (music silent): «НА СЛЕДУЮЩИЙ ДЕНЬ» — the intern with headphones starts whistling; the Brit leaps up: "Oi! Not indoors!"; she pats her piggy bank
s = t; ev = dict(beat=R(s))
ev["intern"] = R(s + 0.05); cue("whistle_i", s + 0.45, 0.6)
ev["jump"] = R(s + 2.05); cue("whoosh", s + 2.0, 0.45); cue("thud", s + 2.15, 0.45)
c = say("end_c", s + 2.2)
ev["phones"] = R(c + 0.1); cue("whoosh", c + 0.15, 0.25)                         # the intern slowly slides his headphones off, baffled
ev["pat"] = R(c + 0.95); cue("ding", c + 1.2, 0.4); cue("ding", c + 1.6, 0.3)   # she pats her piggy bank's hard hat
c = say("moral", c + 1.95)
ev["moral"] = R(c - D["moral"])
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor), then the comment question `ask`
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
for i, w in enumerate(["один", "два", "три", "четыре"]):
    wt_ = next(x[1] for x in word_times("outro") if x[0].lower().startswith(w)); cue("pop", s + 0.15 + wt_, 0.5)
a0 = c + 0.4; cue("whoosh", a0 - 0.1, 0.45); cue("pop", a0, 0.5)
c = say("ask", a0)
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
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = CHUNKS
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
