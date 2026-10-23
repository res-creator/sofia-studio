"""python3 timeline_long.py trial -> eps/<ep>/timeline.json for a long episode (EP[ep]["seq"]).
Same timeline format as timeline_v2.py (fps, dur, cfg, scenes, speech, sfx), but the montage is data, not code:
seq = [(scene_id, {level, done}, [(line_id, gap, [cues])], tail_s)].
Until real voice files exist (eps/<ep>/vo/<id>.wav) every line gets an estimated length, so a silent animatic
can be cut with the final structure; after voicing, run it again and every timing follows the real audio."""
import json, re, sys, os, numpy as np
from episodes_v2 import EP
EPN = sys.argv[1]; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
os.makedirs(f"eps/{EPN}", exist_ok=True)
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
EST = {}
def dur(k):
    p = f"{VO}/{k}.wav"
    if os.path.exists(p):
        import soundfile as sf
        return sf.info(p).duration
    EST[k] = True; ln = LN[k]
    # estimate: English ~14.5 chars/s; Russian narrator a little slower (Sarah reads ~13 chars/s with pauses)
    return len(ln["text"]) / (13.0 if ln["who"] == "nar" else 14.5) + 0.4
D = {k: dur(k) for k in LN}
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
def est_words(sp):
    words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
    pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
    tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
    for w, a, p_ in zip(words, wts, pz):
        t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    return wt

INTRO = 1.15
t = 0.0
cue("whoosh", 0.0, 0.5); cue("impact", 0.05, 0.9)
for sid, opt, items, tail in E["seq"]:
    s = t; ev = {}
    if opt.get("level"):
        cue("whoosh", s, 0.8); cue("impact", s + 0.32, 0.9); cue("riser_short", s - 0.35, 0.35)
        c = s + INTRO
    else: c = s
    for lid, gap, cues in items:
        c += gap
        for n, off, g in cues:
            tt = c + D[lid] + off[1] if isinstance(off, tuple) else c + off
            if n.isupper(): ev[n.lower()] = round(tt, 3); continue
            cue(n, tt, g)
        ev[lid] = round(c, 3); c = say(lid, c)
    t = c + tail
    sc = dict(id=sid, s=round(s, 3), e=round(t, 3), ev=ev)
    if "done" in opt: sc["done"] = opt["done"]
    if opt.get("level"): sc["level"] = True
    scenes.append(sc)
# outro (standard channel ending)
s = t; cue("whoosh", s, 0.8); cue("impact", s + 0.3, 0.8)
e = say("outro", s + 0.8)
for k in range(6): cue("pop", s + 1.1 + 0.15 * k, 0.5)
t = e + 1.3
scenes.append(dict(id="outro", s=round(s, 3), e=round(t, 3), ev={}))

for sp in speech:
    p = f"{VO}/{sp['id']}.wav"
    if os.path.exists(p):
        import soundfile as sf
        x, sr = sf.read(p); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
        env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
        env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    else:
        n = int(sp["d"] * FPS); env = np.abs(np.sin(np.arange(n) * 0.9)) * 0.8
    sp["env"] = [round(float(v), 2) for v in env]
    sp["words"] = word_times(sp["id"]) or est_words(sp)
# the hook stamp lands on the stamp word of the hook narration
hk = next(x for x in speech if x["id"] == "hook_nar")
sw = next((w for w in hk["words"] if w[0].lower().strip("«»!?.,").startswith(E["stamp_word"].lower())), None)
scenes[0]["stamp_t"] = round(hk["t"] + (sw[1] if sw else hk["d"] - 1.0), 3)
cfg = {k: E.get(k) for k in ["title", "hook_title", "stamp", "next", "cards"]}
for k in ["camera", "chunks", "format"]:
    if E.get(k): cfg[k] = E[k]
cfg["setting"] = EPN; cfg["estimated"] = sorted(EST)   # lines still on estimated timing (no voice file yet)
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.1f}s ({int(t // 60)}:{int(t % 60):02d}), {len(EST)} of {len(LN)} lines on estimated timing")
for sc in scenes: print(f"  {sc['id']:6s} {sc['s']:7.1f}-{sc['e']:7.1f}  ({sc['e'] - sc['s']:.1f}s)")
