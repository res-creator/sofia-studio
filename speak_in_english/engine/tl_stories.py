"""python3 tl_stories.py -> eps/stories/timeline.json  (rubric «Ответ на вопрос из комментариев», 4 answers: hook / o1..o4 / end (twist + moral) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "stories"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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

# ---- hook: frame 0 = living room, he holds his phone up at her (her sulky face in his story), laughing; she stands with arms crossed; his line at 0.15 s
cue("pop", 0.1, 0.4); cue("msg", 0.05, 0.4)
t = say("hook_b", 0.15)
hev = dict(title_out=2.6, steam=t - 1.2); cue("scratch", t - 1.2, 0.35)
t += 0.35
hev["nar"] = t; e = say("hook", t); hw = word_times("hook")
wat = lambda i: t + hw[i][1]
hev["plate"] = t; cue("pop", t, 0.55)
hev["fight"] = wat(3) - 0.05     # «мы поругались» -> her close-up, steaming
hev["story"] = wat(7) - 0.1      # «выложил» -> phone insert: her sulky face, caption «Women…», 80 views
hev["wide"] = wat(16) - 0.05     # «Четыре ответа» -> wide
cue("whoosh", hev["story"], 0.45); cue("msg", hev["story"] + 0.15, 0.45)
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.1), ev=RD(hev))); t = e + 0.1

# ---- 1 · ХОЛОДНО: "Delete. Now." -> "Can't. Ninety views. I'm famous." (he poses like a star) -> phone insert: the view counter spins like a taxi meter -> narrator
s = t; ev = opt(s)
c = say("o1_h", s + 0.35)
c = say("o1_b", c + 0.35)
ev["pose"] = c - 1.0; cue("sparkle", c - 0.95, 0.45)
ev["meter"] = c + 0.1; cue("whoosh", c + 0.1, 0.4)
for k in range(9): cue("tick", c + 0.3 + k * 0.17, 0.35)
cue("ding", c + 1.9, 0.45)
c = say("o1_nar", c + 0.55)
ev["meter_end"] = c + 0.2
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.2), ev=RD(ev))); t = c + 0.2

# ---- 2 · С ЮМОРОМ: "...your man-flu video next?" -> "That was real flu! I nearly died!" (clutches his forehead, staggers onto the sofa arm) -> the story is still up (insert)
s = t; ev = opt(s)
c = say("o2_h", s + 0.35)
c = say("o2_b", c + 0.35)
ev["clutch"] = c - D["o2_b"] + 0.2; ev["stagger"] = c - 0.9; cue("thud", c - 0.6, 0.35)
ev["still"] = c + 0.35; cue("msg", c + 0.45, 0.4)
c = say("o2_nar", c + 0.65)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=RD(ev))); t = c + 0.25

# ---- 3 · КАК НОСИТЕЛЬ: warm boundary -> "...Okay. Taking it down." -> phone insert: DELETE STORY pressed, the story vanishes with a "poof" -> narrator -> Bella tip
s = t; ev = opt(s)
c = say("o3_h", s + 0.35); cue("sparkle", c - 1.2, 0.4)
c = say("o3_b", c + 0.35)
ev["del"] = c + 0.05; cue("whoosh", c + 0.05, 0.35); ev["press"] = c + 0.45; cue("tick", c + 0.45, 0.7)
ev["poof"] = c + 0.65; cue("poof", c + 0.65, 0.8); cue("sparkle", c + 0.8, 0.4)
c = say("o3_nar", c + 1.2)
ev["smile"] = c - D["o3_nar"] + 0.8
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.15), ev=RD(ev))); t = c + 0.15

# ---- 4 · КОРОЛЕВСКИЙ ОТВЕТ: "...I'll film you building the wardrobe — all four hours of it." -> "...Deleted. Archive too." -> the half-built wardrobe behind him crashes down
s = t; ev = opt(s)
c = say("o4_h", s + 0.35)
c = say("o4_b", c + 0.35)
ev["tap"] = c - D["o4_b"]
ev["wobble"] = c + 0.1; cue("creak", c + 0.1, 0.5)
ev["fall"] = c + 0.6; cue("crash", c + 0.95, 0.85); cue("impact", c + 0.95, 0.5)
ev["jump"] = c + 0.95
scenes.append(dict(id="o4", s=R(s), e=R(c + 2.0), ev=RD(ev))); t = c + 2.0

# ---- twist (music silent): his phone pings; he looks: a new comment under the story -> insert: MUM «She's right. Apologise.» -> "My mum says..." -> she smiles; he hugs her -> moral
s = t; ev = dict(beat=s, ping=s + 0.25)
cue("msg", s + 0.25, 0.6)
ev["insert"] = s + 0.75; cue("whoosh", s + 0.75, 0.35); ev["comment"] = s + 1.15; cue("pop", s + 1.15, 0.5)
c = say("end_b", s + 2.6)
ev["her"] = c + 0.1; ev["hug"] = c + 0.85; cue("sparkle", c + 0.9, 0.4)
c = say("moral", c + 0.55)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.35), ev=RD(ev))); t = c + 0.35

# ---- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ("один", "два", "три", "четыре"):
    x = next((q for q in ow if q[0].lower().startswith(w)), None)
    if x: cue("pop", s + 0.15 + x[1], 0.5)
scenes.append(dict(id="outro", s=R(s), e=R(c + 0.8))); t = c + 0.8

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
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {
    "o4_h": [["Sweet. Next time you need content, just ask.", "Мило. В следующий раз, когда нужен контент, просто попроси."], ["I'll film you building the wardrobe —", "Я сниму, как ты собираешь шкаф —"], ["all four hours of it.", "все четыре часа."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
