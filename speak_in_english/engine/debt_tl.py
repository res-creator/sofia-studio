"""python3 debt_tl.py -> eps/debt/timeline.json  ('Подруга не возвращает долг'; same JSON shape as timeline_v2.py / momshow_tl.py).
New short format (owner's «Правки» doc): A1 / B1 / C1 only, the story never stops, lesson cards pop over the running scene for 3 s
(scene ev 'card'), Sarah speaks only the outro; cheat sheet stays on screen 6-8 s. Grid ~ hook 0-2, A1 2-15, B1 15-32, C1 32-48, payoff 48-58, outro."""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "debt"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t): sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def scene(i, s, e, **ev): scenes.append(dict(id=i, s=round(s, 3), e=round(e, 3), ev={k: round(v, 3) for k, v in ev.items()}))
CARD = 3.0

# ---- hook (0-1.7): frame 0 = cover. Emma happily eats cake next to her new bag, counter ДОЛГ: 5000, «ЧТО СКАЖЕШЬ?»; spoon clinks
cue("ding", 0.35, 0.25); cue("ding", 1.05, 0.2); scene("hook", 0, 1.7); s = 1.7
# ---- A1 (1.7-15): she slaps the table; Emma sobs for the whole cafe, people turn round; the waiter brings the bill, SHE pays: 5000 -> 5420
slap = s + 0.15; cue("thud", slap + 0.12, 0.8); t = say("a1_h", s + 0.05)
sob = t + 0.4; t = say("a1_e", sob); cue("gasp", sob + 0.1, 0.5); turn = sob + 1.9; cue("whoosh", turn, 0.3)
waiter = t + 0.25; cue("whoosh", waiter, 0.35); bill = waiter + 0.9; cue("paper", bill, 0.5); paid = bill + 1.0; cue("register", paid, 0.55); cnt1 = paid + 0.25; cue("pop", cnt1, 0.5)
t = say("a1_e2", cnt1 + 1.0)                                     # 1 s pause before the line (script)
card = max(12.0, t - 1.6); scene("A1", s, max(card + CARD, t + 0.9), slap=slap, sob=sob, turn=turn, waiter=waiter, bill=bill, paid=paid, cnt=cnt1, card=card); s = scenes[-1]["e"]
# ---- B1 (15-32): polite ask; Emma writes an IOU on a napkin; the waiter wipes the table with it and bins it
t = say("b1_h", s + 0.25)
t = say("b1_e", t + 0.45); write = t - 1.6; cue("marker", write, 0.5); cue("marker", write + 0.7, 0.45); sign = t + 0.1; cue("sparkle", sign, 0.4)
t = say("b1_e2", sign + 0.55)
wipe = t + 0.5; cue("whoosh", wipe - 0.4, 0.3); cue("paper", wipe + 0.2, 0.45); cue("paper", wipe + 0.8, 0.4); binT = wipe + 1.7; cue("plop", binT, 0.6)
card = binT + 0.6; scene("B1", s, max(card + CARD + 0.1, 31.9), write=write, sign=sign, wipe=wipe, bin=binT, card=card); s = scenes[-1]["e"]
# ---- C1 (32-48): calm and clear; Emma is 'broke' and pushes the bag under the table with her foot; the tag 4900; music stops
t = say("c1_h", s + 0.3)
t = say("c1_e", t + 0.55); push = t - 1.1; cue("creak", push, 0.4)
t = say("c1_h2", t + 0.7); tag = t - 1.2; cue("impact_soft", tag, 0.5); freeze = t + 0.15
card = t + 0.6; scene("C1", s, card + CARD + 0.1, push=push, tag=tag, freeze=freeze, card=card); s = scenes[-1]["e"]
# ---- payoff (48-58): ping, «Перевод 5420», counter -> 0; "...Even the cake?" / (1 s) "Especially the cake."
phone = s + 0.2; ping = phone + 1.0; cue("ding", ping, 0.7); cnt0 = ping + 0.5; cue("pop", cnt0, 0.5); cue("sparkle", cnt0 + 0.6, 0.4)
t = say("pay_e", cnt0 + 1.3)
t = say("pay_h", t + 1.0); plate = t + 0.3; cue("whoosh", plate, 0.3)
scene("PAY", s, plate + 1.4, phone=phone, ping=ping, cnt=cnt0, plate=plate); s = scenes[-1]["e"]
# ---- outro: cheat sheet + Sarah (only voice-over of the episode); sheet stays ~8 s
for k in range(3): cue("pop", s + 1.0 + 0.18 * k, 0.4)
t = say("outro", s + 0.5); end = max(t + 0.6, s + 8.6); scene("outro", s, end); t = end

for sp in speech:
    x, sr = sf.read(f"{VO}/{sp['id']}.wav"); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
    env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)]); env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    sp["env"] = [round(float(v), 2) for v in env]
    words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz): t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "stamp", "next", "cards", "camera", "chunks"]}; cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.1f}s"); [print(f"  {x['id']:6s} {x['s']:6.2f}-{x['e']:6.2f}  {x['ev']}") for x in scenes]
