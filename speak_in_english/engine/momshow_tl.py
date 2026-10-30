"""python3 momshow_tl.py -> eps/momshow/timeline.json  (timeline for 'When Mom shows off your English'; same JSON shape as timeline_v2.py)"""
import json, re, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = "momshow"; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
D = {k: sf.info(f"{VO}/{k}.wav").duration for k in LN}
speech, sfx, scenes = [], [], []
def say(lid, t): sp = dict(LN[lid]); sp["t"] = round(t, 3); sp["d"] = round(D[lid], 3); speech.append(sp); return t + D[lid]
def cue(n, t, g=1.0): sfx.append(dict(n=n, t=round(t, 3), g=g))
def scene(i, s, e, **ev): scenes.append(dict(id=i, s=round(s, 3), e=round(e, 3), ev={k: round(v, 3) for k, v in ev.items()}))
def st(lid): return next(x["t"] for x in speech if x["id"] == lid)

# ---- hook: Mom yanks Lena up from her chair, a spotlight lands on her, Aunt Vera waits with her teacup
# Sarah's Russian intro plays over the action (Mom lifts Lena up in front of the guests); nothing else sounds on her voice
t = say("intro", 0.3); up = 0.3 + D["intro"] * 0.3
t = say("hook_m", t + 0.3); spot = t + 0.05; cue("impact_soft", spot, 0.6)
t = say("hook_v", spot + 0.85); cue("sparkle", spot + 0.3, 0.35); scene("hook", 0, t + 0.3, up=up, spot=spot); s = t + 0.3
# ---- S1: put on the spot
cue("gulp", s + 0.05, 0.5); t = say("s1_l", s + 0.55); t = say("s1_m", t + 0.3); scene("S1", s, t + 0.3); s = t + 0.3
# ---- S2: the salad; Mom's smile freezes for a split second (eye twitch), then she brags on
t = say("s2_l", s + 0.1); tw1 = t + 0.15; cue("blink", tw1, 0.5); t = say("s2_v", t + 0.5); push = t + 0.15; cue("plop", push + 0.3, 0.5); t = say("s2_m", t + 0.95); scene("S2", s, t + 0.3, tw1=tw1, push=push); s = t + 0.3
# ---- S3: Dad in the garage, showing off, Netflix; the fork in Mom's hand bends, the tea rattles, a tiny vein pops
t = say("s3_l", s + 0.1); f1 = t + 0.1; cue("creak", f1, 0.35); t = say("s3_n", t + 0.35)
t = say("s3_l2", t + 0.6); t = say("s3_m", t + 0.2); cue("clapclap", st("s3_m") + 0.05, 0.45); f2 = t + 0.1; cue("creak", f2, 0.45)
t = say("s3_l3", t + 0.35); f3 = t + 0.1; cue("brow", f3, 0.6); cue("clank", f3 + 0.35, 0.35); scene("S3", s, t + 1.4, f1=f1, f2=f2, f3=f3); s = t + 1.4
# ---- S4: the reveal; music stops, Mom puts the bent fork down, perfect English, the app streak; Lena is sent to the kitchen
t = say("s4_v", s + 0.1); cut = t + 0.05; cue("scratch", cut, 0.6); down = cut + 0.8; cue("clank", down, 0.55)
t = say("s4_m", down + 0.45); ph = st("s4_m") + D["s4_m"] * 0.55; cue("ding", ph, 0.5)
t = say("s4_l", t + 0.95); cue("gulp", t + 0.05, 0.6)
t = say("s4_m2", t + 0.5); walk = t + 0.15; cue("whoosh", walk + 0.2, 0.4)
t = say("s4_n", walk + 1.8); clink = t + 0.1; cue("ding", clink, 0.6)
# ---- recap: the three phrases pop in over the wide shot, then Sarah asks the viewer (after Nigel and the pops, never on top of them)
r0 = clink + 0.5
for k in range(3): cue("pop", r0 + 0.55 * k, 0.5)
ask = r0 + 1.1 + 0.55; t = say("outro", ask)
end = t + 1.3; scene("S4", s, end, cut=cut, down=down, phone=ph, walk=walk, clink=clink, recap=r0, ask=ask); t = end

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
print(f"{EPN} duration {t:.1f}s")
