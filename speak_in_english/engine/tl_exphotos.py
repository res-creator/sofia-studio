"""python3 tl_exphotos.py -> eps/exphotos/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "exphotos"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
RD = lambda d: {k: R(v) for k, v in d.items()}
def opt(t):   # option start: plate pops (whoosh + pop)
    cue("whoosh", t, 0.6); cue("pop", t + 0.1, 0.6); return dict(plate=t)
def wt_(lid, t0, w):   # absolute start of the first word of line lid starting with w
    x = next(q for q in word_times(lid) if q[0].lower().startswith(w)); return t0 + x[1]

# ---- hook: frame 0 = living room, he proudly holds his phone out to her (their selfie = his new avatar); his line at 0.15 s
cue("tada", 0.0, 0.3); cue("pop", 0.1, 0.4)
t = say("hook_b", 0.15)
hev = dict(title_out=2.6, solo=1.35)
t += 0.3
hev["nar"] = t; e = say("hook", t)
hev["plate"] = t; cue("pop", t, 0.55)
hev["avatar"] = wt_("hook", t, "поставил") - 0.05     # insert: his profile, the selfie avatar
hev["grid"] = wt_("hook", t, "фото") - 0.1           # the grid scrolls: Kate photos everywhere
cue("whoosh", hev["grid"] + 0.05, 0.35)
hev["face"] = wt_("hook", t, "как") - 0.05           # her face: holding it together (eye twitch)
hev["wide"] = wt_("hook", t, "четыре") - 0.05
cue("blink", hev["face"] + 0.35, 0.4)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "And her? Delete." -> "Who, Kate? She's… part of the archive." -> insert: he scrolls (Kate on the beach, on skis, with a cake...)
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
c = say("o1_b", c + 0.35)
ev["scroll"] = c + 0.05; cue("whoosh", c + 0.1, 0.35)
for k in range(5): cue("tick", c + 0.25 + k * 0.42, 0.3)
c = say("o1_nar", c + 0.6)
ev["twitch"] = wt_("o1_nar", c - D["o1_nar"], "большой") - 0.05; cue("blink", ev["twitch"] + 0.2, 0.45); cue("blink", ev["twitch"] + 0.45, 0.35)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 2 · С ЮМОРОМ: "...or just a guest star?" -> "Guest star! She's got fans, actually." (he proudly turns the phone to her) -> insert: Kate photo, likes roll up to 300
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
c = say("o2_b", c + 0.3)
ev["likes"] = c + 0.05; cue("pop", c + 0.1, 0.4)
for k in range(6): cue("pop", c + 0.3 + k * 0.16, 0.22)
ev["l300"] = c + 1.3; cue("ding", c + 1.3, 0.5)
c = say("o2_nar", c + 0.55)
ev["deadpan"] = c - D["o2_nar"] + 1.0
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 3 · КАК НОСИТЕЛЬ: warm line -> "…Doing it now. Bye, Kate." -> insert: photos fly into the bin one by one -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.0, 0.35)
c = say("o3_b", c + 0.3)
ev["bin"] = c + 0.05
for k in range(4): cue("whoosh", c + 0.2 + k * 0.5, 0.3); cue("plop", c + 0.58 + k * 0.5, 0.3)
c = say("o3_nar", c + 0.7)
ev["warm"] = wt_("o3_nar", c - D["o3_nar"], "запоминай") - 0.05
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: grand line (gallery-guide gestures) -> "Closing the museum! Everything must go!" -> insert: DELETE hammered, counter, phone smokes
s = t; ev = opt(s)
c = say("o4_h", s + 0.35); cue("sparkle", s + 0.6, 0.35)
ev["gallery"] = s + 0.35 + 2.55
c = say("o4_b", c + 0.3)
ev["delete"] = c + 0.05
for k in range(14): cue("tick", c + 0.12 + k * 0.11, 0.35)
ev["smoke"] = c + 1.25; cue("powerdown", c + 1.3, 0.4); cue("deflate", c + 1.35, 0.3)
ev["fried"] = c + 1.9
scenes.append(dict(id="o4", s=R(s), e=R(c + 2.65), ev=RD(ev))); t = c + 2.65

# ---- twist (music silent): ding — a comment under the new avatar (from Kate) -> he reads it out -> her look drops to his feet: holey socks -> moral
s = t; ev = dict(beat=s, ding=s + 0.35)
cue("msg", s + 0.35, 0.7)
ev["notif"] = s + 0.75; cue("pop", s + 0.95, 0.45)
c = say("end_b", s + 2.05)
ev["look"] = c + 0.05
ev["socks"] = c + 0.6; cue("rimshot", c + 0.7, 0.5)
c = say("moral", c + 1.65)
ev["laugh"] = c - D["moral"]
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in ow if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.6))); t = c + 0.6

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = re.sub(r"\[[^\]]*\]\s*", "", sp["text"]).split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—…]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {
    "o3_h": [["I love it.", "Мне нравится."], ["Now, are you going to clear out the old photos, or shall I?", "А теперь — ты сам уберёшь старые фото, или это сделать мне?"]],
    "o4_h": [["Your profile is a museum, darling.", "Твой профиль — музей, дорогой."], ["Lovely new exhibit —", "Чудесный новый экспонат —"], ["but I don't share a gallery with the old collection.", "но я не делю галерею со старой коллекцией."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
