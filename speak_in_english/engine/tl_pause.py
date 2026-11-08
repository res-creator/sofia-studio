"""python3 tl_pause.py -> eps/pause/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "pause"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
def est_words(lid, d):   # estimated word timings for character lines (no aligner output): length-weighted with pauses at punctuation
    words = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:…]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz):
        t0 = cc / tot * d; cc += a; wt.append([w, round(t0, 3), round(cc / tot * d, 3)]); cc += p_
    return wt
def wend(lid, w):   # estimated end time (relative) of the first word starting with w
    return next(q[2] for q in est_words(lid, D[lid]) if q[0].lower().startswith(w))
def wbeg(lid, w):
    return next(q[1] for q in est_words(lid, D[lid]) if q[0].lower().startswith(w))
R = lambda x: round(x, 3)
RD = lambda d: {k: R(v) for k, v in d.items()}
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)

# ---- hook: frame 0 = her bedroom; she holds a birthday balloon, the wall calendar has the 14th circled with a heart; he holds a sheet «BREAK»; his line at 0.15 s
cue("pop", 0.0, 0.35)
t0 = 0.15; t = say("hook_b", t0)
hev = dict(deflate=t0 + wend("hook_b", "break") + 0.05, freeze=t + 0.02, title_out=2.6)
cue("deflate", hev["deflate"], 0.55); cue("scratch", t, 0.45)
t += 0.3
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["her"] = wat(3) - 0.05       # «за неделю до моего...» -> her close-up (sad balloon)
hev["cal"] = wat(6) - 0.05       # «дня рождения» -> calendar close-up: the heart on the 14th
hev["bf"] = wat(9) - 0.05        # «он предложил отдохнуть» -> him with the BREAK sheet
hev["eyes"] = wat(15) - 0.05     # «Это совпадение?» -> her narrowed eyes
hev["wide"] = wat(17) - 0.05     # «Четыре ответа» -> wide
cue("sparkle", hev["cal"] + 0.1, 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "Fine. Bye." -> he whips a packed suitcase out from behind the bed -> "See you on the fifteenth!" -> calendar: 15th circled right after the heart -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
ev["grab"] = c + 0.05; cue("whoosh", c + 0.05, 0.5); cue("zip", c + 0.2, 0.4); cue("thud", c + 0.42, 0.35)
c = say("o1_b", c + 0.45)
ev["wave"] = c - 0.9
ev["cal"] = c + 0.12; ev["circle"] = c + 0.35; cue("squeak", c + 0.4, 0.45); cue("pop", c + 0.95, 0.4)
c = say("o1_nar", c + 0.3)
ev["herR"] = c - 0.1
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 2 · С ЮМОРОМ: "A break? From what — buying presents?" -> he chews his pen nervously, sweat drop -> "No! …Partly. Mostly no." -> she raises an eyebrow
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
ev["pen"] = c + 0.02; cue("gulp", c + 0.1, 0.4)
c = say("o2_b", c + 0.3)
for k in range(3): cue("tick", c - 1.9 + k * 0.6, 0.25)
ev["herW"] = c + 0.12; cue("brow", c + 0.25, 0.5)
c = say("o2_nar", c + 0.35)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 3 · КАК НОСИТЕЛЬ: calm line (open palm to the calendar) -> "…Total coincidence. I'll stay." -> he squats, lays the suitcase down and slowly slides it under the bed -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); ev["palm"] = s + 0.35 + wbeg("o3_h", "birthday") - 0.1; cue("sparkle", ev["palm"] + 0.15, 0.35)
c = say("o3_b", c + 0.3)
ev["squat"] = c + 0.02; ev["tip"] = c + 0.3; cue("thud", c + 0.6, 0.35)
ev["slide"] = c + 0.65; cue("riser_short", c + 0.65, 0.25); cue("creak", c + 0.8, 0.3); cue("thud", c + 1.85, 0.3)
c = say("o3_nar", c + 1.25)
ev["herR"] = c - D["o3_nar"] + 0.0
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: the sweet threat -> he goes pale -> "…The break is cancelled. Totally cancelled." -> he rips the BREAK sheet in half, then again
s = t; ev = opt(s)
c = say("o4_h", s + 0.35)
ev["two"] = s + 0.35 + wbeg("o4_h", "and") - 0.1
c0 = c + 0.35; c = say("o4_b", c0)
ev["rip1"] = c0 + wend("o4_b", "cancelled") + 0.02; ev["rip2"] = c0 + wend("o4_b", "totally") + 0.35
cue("snip", ev["rip1"], 0.0); cue("zip", ev["rip1"], 0.45); cue("zip", ev["rip2"], 0.45)
ev["toss"] = c + 0.1; cue("feather", c + 0.15, 0.4)
scenes.append(dict(id="o4", s=R(s), e=R(c + 0.8), ev=RD(ev))); t = c + 0.8

# ---- twist (music silent): the wardrobe rattles -> doors burst open -> a huge box with a bow «SURPRISE!» crashes out -> insert -> "…I needed a week to build that. It's a bookshelf." -> moral
s = t; ev = dict(beat=s, rattle=s + 0.3)
for k in range(3): cue("knock", s + 0.3 + k * 0.22, 0.35)
ev["burst"] = s + 1.0; cue("creak", s + 0.95, 0.4); cue("impact", s + 1.0, 0.5)
ev["fall"] = s + 1.15; ev["land"] = s + 1.6; cue("thud", s + 1.6, 0.7); cue("boom", s + 1.62, 0.3)
ev["insert"] = s + 2.0; cue("pop", s + 2.05, 0.45); cue("tada", s + 2.15, 0.35)
c = say("end_b", s + 3.25)
ev["face"] = c + 0.1; cue("sparkle", c + 0.2, 0.4)
ev["endw"] = c + 0.9
c = say("moral", c + 0.95)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in ow if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

sfx[:] = [x for x in sfx if x["g"] > 0]
for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    sp["words"] = wt if wt is not None else est_words(sp["id"], sp["d"])
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {
    "o3_h": [["Interesting timing.", "Интересно ты время выбрал."], ["My birthday's on Friday — or is that a coincidence?", "У меня день рождения в пятницу — или это совпадение?"]],
    "o4_h": [["Of course, love. Take the whole week.", "Конечно, любимый. Бери всю неделю."], ["I'll celebrate with the people who remembered —", "Я отпраздную с теми, кто помнил, —"], ["and you can read about it online.", "а ты почитаешь об этом в интернете."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
