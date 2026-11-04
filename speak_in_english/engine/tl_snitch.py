"""python3 tl_snitch.py -> eps/snitch/timeline.json  (rubric «Как ответить, когда…», 4 answers: hook / o1 / o2 / o3 / o4 / end (twist) / outro, no levels)
Same schema as timeline_v2.py: {fps, dur, ep, cfg, scenes[{id,s,e,ev}], speech[{id,who,text,ru,t,d,env,words}], sfx[{n,t,g}]}.
Office: Ryan "reminds" the heroine in the #team chat while the boss watches from his glass office."""
import json, re, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "snitch"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
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
def keys(a, b, g=0.35, step=0.11):   # typing clicks
    x = a; i = 0
    while x < b: cue("keys", x + (0.03 if i % 3 == 1 else 0), g * (0.8 + 0.2 * (i % 2))); x += step; i += 1

# ---- hook: live office; Ryan already typing with a smug smile, his line at 0.15 s; the message pops in #team; "Seen by Boss"; the boss's head turns
keys(0.0, 2.5, 0.3)
t = say("hook_r", 0.15)
hev = dict(title_out=2.6, chat=2.6); cue("msg", 2.62, 0.6)
hev["seen"] = R(t + 0.2); cue("ding", t + 0.2, 0.5)
t += 0.45
hev["nar"] = R(t); hev["face"] = R(t - 0.05); e = say("hook", t); hw = word_times("hook")
def wat(i): return R(t + hw[i][1])
hev["boss"] = wat(6)        # «Босс всё видит» -> the boss turns his head behind the glass
cue("whoosh", hev["boss"] - 0.05, 0.4)
hev["wide"] = wat(9)        # «Четыре ответа» -> wide
scenes.append(dict(id="hook", s=0.0, e=R(e + 0.15), ev=hev)); t = e + 0.15

# ---- option 1: «В ЛОБ» — her angry message; the boss's door slides open: "Anna. My office."
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
keys(s + 0.05, s + 0.35 + D["o1_h"], 0.55, 0.075)
c = say("o1_h", s + 0.35)
ev["chat"] = R(c + 0.05); cue("send", c + 0.08, 0.6); ev["seen"] = R(c + 0.45); cue("ding", c + 0.45, 0.5)
ev["boss"] = R(c + 1.1); ev["door"] = R(c + 1.2); cue("doors", c + 1.2, 0.6)
c = say("o1_b", c + 1.75)
ev["sink"] = R(c + 0.15); cue("gulp", c + 0.2, 0.7)
c = say("o1_nar", c + 0.4)
scenes.append(dict(id="o1", s=R(s), e=R(c + 0.35), ev=ev)); t = c + 0.35

# ---- option 2: «ВЕЖЛИВО» — sorry; Ryan adds "she was late on Monday"; a sticky note LATE 09:07 slaps onto her laptop
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
keys(s + 0.2, s + 0.35 + D["o2_h"], 0.3, 0.13)
c = say("o2_h", s + 0.35)
ev["chat"] = R(c + 0.05); cue("send", c + 0.08, 0.6); ev["typing"] = R(c + 0.5)
ev["ryan"] = R(c + 0.95); keys(c + 0.95, c + 1.1 + D["o2_r"], 0.4, 0.09)
c = say("o2_r", c + 1.05)
ev["note"] = R(c + 0.1); cue("whoosh", c + 0.1, 0.5); ev["slap"] = R(c + 0.4); cue("thud", c + 0.4, 0.55)
c = say("o2_nar", c + 0.6)
scenes.append(dict(id="o2", s=R(s), e=R(c + 0.25), ev=ev)); t = c + 0.25

# ---- option 3: «КАК НОСИТЕЛЬ» — calm facts + a doc link; the boss just nods; Ryan's smile drops
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
c = say("o3_h", s + 0.35)
ev["chat"] = R(c + 0.05); cue("send", c + 0.08, 0.6); ev["doc"] = R(c + 0.35); cue("pop", c + 0.35, 0.5); ev["seen"] = R(c + 0.75); cue("ding", c + 0.75, 0.5)
ev["boss"] = R(c + 1.2)
c = say("o3_b", c + 1.35)
ev["wide"] = R(c + 0.05); ev["drop"] = R(c + 0.3); cue("deflate", c + 0.3, 0.45)
c = say("o3_nar", c + 0.5)
c = say("o3_tip", c + 0.38); cue("ding", c - D["o3_tip"] + 0.05, 0.6)
scenes.append(dict(id="o3", s=R(s), e=R(c + 0.3), ev=ev)); t = c + 0.3

# ---- option 4: «КОРОЛЕВСКИЙ ОТВЕТ» — sweet thanks + "your quarterly report? It was due in March."; Ryan sweats, his Q1 folder falls out of the drawer
s = t; cue("whoosh", s, 0.6); cue("pop", s + 0.1, 0.6); ev = dict(plate=R(s))
c = say("o4_h", s + 0.35)
ev["chat"] = R(c + 0.05); cue("send", c + 0.08, 0.6); ev["seen"] = R(c + 0.55); cue("ding", c + 0.55, 0.5)
ev["ryan"] = R(c + 1.1); ev["sweat"] = R(c + 1.15); cue("gulp", c + 1.2, 0.7)
c = say("o4_r", c + 1.35)
ev["drawer"] = R(c + 0.15); cue("clank", c + 0.25, 0.6); ev["fall"] = R(c + 0.35); cue("whoosh", c + 0.35, 0.4); ev["land"] = R(c + 0.8); cue("thud", c + 0.8, 0.7)
scenes.append(dict(id="o4", s=R(s), e=R(c + 1.6), ev=ev)); t = c + 1.6

# ---- twist: one deliberate beat (music silent): the boss has seen everything; "Ryan. My office."; Ryan walks to the glass office
s = t; ev = dict(beat=R(s), stand=R(s + 0.5), door=R(s + 0.65)); cue("doors", s + 0.65, 0.6)
c = say("end_b", s + 1.2)
ev["walk"] = R(c + 0.15); ev["wide"] = R(c + 0.05)
for k in range(9): cue("thud", c + 0.4 + k * 0.45, 0.12)   # footsteps
c = say("moral", c + 0.45)
ev["shut"] = R(c + 0.15); cue("doors", c + 0.15, 0.45); ev["smile"] = R(c + 0.35); cue("sparkle", c + 0.4, 0.4)
scenes.append(dict(id="end", s=R(s), e=R(c + 0.95), ev=ev)); t = c + 0.95

# ---- end screen: question + 1/2/3/4, СОХРАНИ, ПОДПИСАТЬСЯ (cursor)
s = t; cue("whoosh", s, 0.7); cue("impact", s + 0.2, 0.6)
c = say("outro", s + 0.15)
ow = word_times("outro")
for w in ["один,", "два,", "три", "четыре?"]: cue("pop", s + 0.15 + next(x[1] for x in ow if x[0] == w) - 0.05, 0.5)
cue("click", c + 0.55, 0.7)
scenes.append(dict(id="outro", s=R(s), e=R(c + 1.3))); t = c + 1.3

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
    env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "rubric"]}
cfg["camera"] = "hard_cut"; cfg["cards"] = {}; cfg["setting"] = EPN
cfg["chunks"] = {
    "o3_h": [["Thanks for the reminder —", "Спасибо за напоминание —"], ["it's with Sarah for approval, as agreed.", "отчёт у Сары на согласовании, как договаривались."]],
    "o4_h": [["Thank you, Ryan!", "Спасибо, Райан!"], ["Since you're so on top of deadlines,", "Раз ты так следишь за сроками,"], ["could you share your quarterly report?", "поделишься своим квартальным отчётом?"], ["It was due in March.", "Он был нужен в марте."]],
}
json.dump(dict(fps=FPS, dur=R(t), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.2f}s"); [print(s_["id"], s_["s"], s_["e"], s_.get("ev", {})) for s_ in scenes]; [print(" ", s_["id"], s_["t"], round(s_["t"] + s_["d"], 2)) for s_ in speech]
