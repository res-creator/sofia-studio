"""python3 tl_badphoto.py -> eps/badphoto/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "badphoto"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
def est_words(lid):   # proportional word timings (lines without a words.json)
    words = re.sub(r"\[[^\]]*\]\s*", "", LN[lid]["text"]).split(); d = D[lid]; wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a_, p_ in zip(words, wts, pz):
        t0 = cc / tot * d; cc += a_; wt.append([w, round(t0, 3), round(cc / tot * d, 3)]); cc += p_
    return wt
def wtime(lid, word, fb):   # absolute time of the first word starting with `word`
    sp = next(s for s in speech if s["id"] == lid); wt = word_times(lid) or est_words(lid)
    for w in wt:
        if re.sub(r"[^\w']", "", w[0]).lower().startswith(word): return sp["t"] + w[1]
    return sp["t"] + fb
R = lambda d: {k: round(v, 3) for k, v in d.items()}
def keys(t0, t1, n, g=0.4):
    for k in range(n): cue("keys", t0 + (t1 - t0) * k / max(1, n - 1), g)

# ---- hook: frame 0 = the friend's post on the phone (shutter + likes ticking), her voice "Best night ever! Posted!" at 0.2 s,
#      the heroine's shocked face, then the narrator over the comment plate, the photo close-up and her face
cue("shutter", 0.0, 0.6); cue("pop", 0.15, 0.45)
for k in range(6): cue("tick", 0.5 + k * 0.32, 0.35)
e = say("hook_f", 0.2)
hev = dict(face=e + 0.08, title_out=2.45)
cue("gasp", hev["face"] + 0.05, 0.6)
n0 = e + 0.7; h = say("hook", n0)
hev["plate"] = hev["title_out"] = max(2.45, e + 0.2); cue("pop", hev["plate"], 0.55); cue("boing", hev["face"] + 0.3, 0.4)
hev["photo"] = wtime("hook", "фото", 2.0) - 0.05; hev["circle"] = wtime("hook", "ужасно", 2.6); cue("squeak", hev["circle"], 0.4)
hev["think"] = wtime("hook", "что", 3.4) - 0.05; hev["four"] = wtime("hook", "четыре", 4.3)
t = h + 0.35
scenes.append(dict(id="hook", s=0.0, e=round(t, 3), ev=R(hev)))

# ---- 1 · ХОЛОДНО: she types "Delete." under the post -> the friend (live): "But I look amazing in it!" -> her reply pops and the
#      like counter JUMPS (the drama brings likes) -> narrator over her annoyed face
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict(type0=s + 0.15)
a = say("o1_h", s + 0.35); ev["sent"] = a + 0.02; keys(ev["type0"], ev["sent"] - 0.12, 4); cue("send", ev["sent"], 0.6)
f = say("o1_f", a + 0.4)
ev["jump"] = f + 0.3; cue("msg", ev["jump"] - 0.05, 0.55); cue("ding", ev["jump"] + 0.05, 0.5)
for k in range(5): cue("pop", ev["jump"] + 0.1 + 0.09 * k, 0.35)
n = say("o1_nar", ev["jump"] + 0.75); ev["face"] = ev["jump"] + 1.6
t = n + 0.45; cue("tick", n + 0.05, 0.3)
scenes.append(dict(id="o1", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- 2 · С ЮМОРОМ: she types the potato joke (a drawn potato sticker pops on her face in the photo) -> sent ->
#      the friend's reply "That's you!" + a drawn laughing face -> the friend laughing (live) -> her deadpan face, narrator
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict(type0=s + 0.15)
a = say("o2_h", s + 0.35); ev["sent"] = a + 0.02; keys(ev["type0"], ev["sent"] - 0.15, 10); cue("send", ev["sent"], 0.6)
ev["potato"] = wtime("o2_h", "potato", D["o2_h"] - 0.6) - 0.05; cue("boing", ev["potato"] + 0.02, 0.55)
f = say("o2_f", a + 0.35); ev["reply"] = f - D["o2_f"] - 0.05; cue("msg", ev["reply"], 0.6)
ev["laugh"] = f + 0.1
ev["deadpan"] = ev["laugh"] + 1.2; cue("cricket", ev["deadpan"] + 0.05, 0.4)
n = say("o2_nar", ev["deadpan"] + 0.6); ev["still"] = wtime("o2_nar", "фото", 0.7) - 0.05
t = n + 0.35
scenes.append(dict(id="o2", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- 3 · КАК НОСИТЕЛЬ: her calm line (live, bubble) -> the DM: her message sent, "typing...", the reply "Oh! Sure, sorry."
#      -> the friend (live) puts a hand on her chest -> narrator over her relieved face -> Bella tip
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict()
a = say("o3_h", s + 0.35); ev["sent"] = a + 0.3; cue("send", ev["sent"], 0.6)
ev["dots"] = ev["sent"] + 0.25; cue("pop", ev["dots"], 0.45)
f = say("o3_f", ev["dots"] + 0.55); ev["reply"] = f - D["o3_f"] - 0.05; cue("msg", ev["reply"], 0.6)
ev["sorry"] = f + 0.12
n = say("o3_nar", f + 0.95)
p = say("o3_tip", n + 0.38); cue("ding", p - D["o3_tip"] + 0.02, 0.55)
t = p + 0.3
scenes.append(dict(id="o3", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: sweet smile, she holds up an old school photo of the friend (braces, huge glasses) ->
#      close-up of the school photo -> the friend gasps "Not the school photos!"
s = t; cue("whoosh", s, 0.5); cue("pop", s + 0.05, 0.6)
ev = dict()
a = say("o4_h", s + 0.35); ev["raise"] = wtime("o4_h", "after", 1.9) - 0.2; cue("whoosh", ev["raise"], 0.35)
ev["school"] = a + 0.3; cue("impact", ev["school"] + 0.02, 0.5); cue("sparkle", ev["school"] + 0.1, 0.5)
f = say("o4_f", ev["school"] + 1.5); ev["gasp"] = f - D["o4_f"]
t = f + 0.55
scenes.append(dict(id="o4", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- twist: one deliberate beat (music silent) on the post -> poof, "Post deleted" -> "Deleted! ...But your mum already commented."
#      -> notification «Mum commented: Beautiful girls!» -> her facepalm (music back) -> moral: she pats her school-photo album
s = t; ev = dict(poof=s + 0.45); cue("whoosh", ev["poof"], 0.5); cue("pop", ev["poof"] + 0.12, 0.6)
f = say("end_f", s + 0.75)
ev["notif"] = wtime("end_f", "but", 1.3) - 0.1; cue("msg", ev["notif"], 0.8)
ev["palm"] = f + 0.75; cue("thud", ev["palm"] + 0.12, 0.5); cue("deflate", ev["palm"] + 0.15, 0.55)
m = say("moral", ev["palm"] + 1.35)
mw = word_times("moral") or est_words("moral")
ix = [i for i, w in enumerate(mw) if w[0].lower().startswith("тебя")]
ev["album"] = (m - D["moral"] + mw[ix[0] - 1][1] - 0.05) if ix else m - 1.4; cue("sparkle", ev["album"] + 0.1, 0.45)
t = m + 0.9
scenes.append(dict(id="end", s=round(s, 3), e=round(t, 3), ev=R(ev)))

# ---- end screen: КАКОЙ ОТВЕТ ТВОЙ? + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.6)
o = say("outro", s + 0.2)
for k, w in enumerate(["один", "два", "три", "четыре"]): cue("pop", wtime("outro", w, 1.4 + 0.35 * k) - 0.05, 0.5)
t = o + 1.0
scenes.append(dict(id="outro", s=round(s, 3), e=round(t, 3)))

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    hop = sr // FPS; nn = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(nn)]); env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    sp["words"] = word_times(sp["id"]) or est_words(sp["id"])
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["setting"] = EPN; cfg["cards"] = {}
cfg["chunks"] = {"o4_h": [["You have one hour to delete it.", "У тебя час, чтобы удалить."], ["After that, our school photos go public.", "Потом в сеть уходят наши школьные фото."]]}
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(f"  {x['id']:7s} {x['s']:6.2f}-{x['e']:6.2f}") for x in scenes]; [print(f"    {x['id']:7s} {x['t']:6.2f}+{x['d']:.2f}") for x in speech]
