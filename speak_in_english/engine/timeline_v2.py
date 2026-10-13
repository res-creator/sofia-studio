"""python3 timeline_v2.py gym|lift -> eps/<ep>/timeline.json"""
import json, re, sys, os, numpy as np, soundfile as sf
from episodes_v2 import EP
EPN = sys.argv[1]; E = EP[EPN]; FPS = 30; VO = f"eps/{EPN}/vo"
LN = {l[0]: dict(id=l[0], who=l[1], text=l[2], ru=l[3]) for l in E["lines"]}
def dur(k):
    p = f"{VO}/{k}.wav"
    if os.path.exists(p): return sf.info(p).duration
    return len(LN[k]["text"]) / 14.5 + 0.4   # estimate until real VO exists
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

cue("impact", 0.05, 0.9); cue("whoosh", 0.0, 0.5)
if EPN == "airport": cue("chime", 0.1, 0.55)
for k in range(1, 4): cue("pop", 0.2 + 0.35 * k, 0.6)
h0 = 0.35; e = say("hook", h0); hw = word_times("hook") or []
def find(word):
    for w, a, b in hw:
        if w.lower().strip("«»!?.,").startswith(word.lower()): return h0 + a
    return None
stamp_t = find(E["stamp_word"]) or (e - 1.0); cue("stamp", stamp_t, 0.8)
t = e + 0.45
scenes.append(dict(id="hook", s=0.0, e=round(t, 3), stamp_t=round(stamp_t, 3)))

TICKS = lambda back: [("tick", -back + 0.15 + 0.6 * k, 0.6) for k in range(int(back / 0.6))]
if EPN == "gym":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.35, [("brow", -0.25, 0.7)]), ("a1_nar", 0.55, [("pop", 0.15, 0.5)])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("brow", -0.2, 0.6)]), ("a2_nar", 0.45, [("buzz", 0.9, 0.55)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("pop", 0, 0.5)]), ("b1_nar", 0.35, [("ding", 0.1, 0.55)])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("clank", 1.5, 0.8)]), ("b2_nar", 0.4, [("pop", 0.1, 0.5)]), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("sparkle", -0.1, 0.7)]), ("c1_nar", 0.35, [("pop", 0.1, 0.5)]), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.8), ("drop", -1.9, 0.8)] + TICKS(2.4)), ("c2_her2", 0.45, [("deflate", 0.35, 0.7)]), ("c2_nar", 0.75, [("impact_soft", 0.0, 0.6)])],
    )
    INTRO = 1.15
elif EPN == "dinner":
    E_ = lambda o: ("e", o)
    INS = [("whoosh", -1.55, 0.35), ("gulp", -0.85, 0.85), ("boing", -0.72, 0.6)]
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("plop", E_(-0.3), 0.9)]), ("a1_x3", 0.45, []), ("a1_nar", 1.75, INS)],
        A2=[("a2_x", 0, []), ("a2_her", 0.3, []), ("a2_x2", 0.35, [("clank", -0.15, 0.7)]), ("a2_x3", 0.35, [("plop", E_(-0.45), 0.8), ("plop", E_(-0.25), 0.7), ("plop", E_(-0.05), 0.7)]), ("a2_nar", 1.75, INS + [("buzz", 0.9, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_x", 0, []), ("b1_her", 0.3, []), ("b1_x2", 0.3, [("plop", E_(-0.25), 0.9)]), ("b1_x3", 0.35, []), ("b1_nar", 1.75, INS)],
        B2=[("b2_x", 0, []), ("b2_her", 0.3, []), ("b2_x2", 0.3, [("plop", E_(-0.2), 1.0)]), ("b2_nar", 1.85, INS), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_x", 0, []), ("c1_her", 0.3, []), ("c1_x2", 0.3, [("sparkle", 0.2, 0.6), ("thud", E_(0.05), 1.0)]), ("c1_x3", 0.55, []), ("c1_nar", 1.75, INS), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_x", 0, [("sparkle", 0.6, 0.7)]), ("c2_her", 1.0, [("scratch", -0.8, 0.45)]), ("c2_x2", 2.6, [("cuckoo", -1.45, 0.7)] + TICKS(2.4)), ("c2_her2", 0.4, []), ("c2_x3", 0.75, [("thud", -0.55, 1.0)]), ("c2_nar", 1.85, [("whoosh", -1.55, 0.35), ("nope", -0.9, 0.6)])],
    )
    INTRO = 1.15
elif EPN == "salon":
    def MONT(g, kind="snips"):
        m0 = -g + 0.12
        if kind == "one": return [("MONT", 0, 0), ("snip", -1.7, 1.3), ("sparkle", -1.05, 0.5)]
        base = [("MONT", 0, 0), ("whoosh", m0, 0.7), ("sparkle", -1.05, 0.8), ("spin", -1.25, 0.8)]
        if kind == "clip": return base + [("clipper", m0 + 0.15, 1.4)]
        return base + [("snips", m0 + 0.15, 1.3), ("hairdryer", -1.95, 0.8)]
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, []), ("a1_her2", 3.1, MONT(3.1, "clip")), ("a1_x3", 0.3, []), ("a1_nar", 0.55, [("pop", 0.15, 0.5)])],
        A2=[("a2_x", 0, []), ("a2_her", 0.3, []), ("a2_x2", 0.3, []), ("a2_x3", 2.4, MONT(2.4, "one") + [("register", 1.0, 0.7)]), ("a2_her2", 0.3, []), ("a2_nar", 0.5, [("buzz", 0.9, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_x", 0, []), ("b1_her", 0.3, []), ("b1_x2", 0.3, []), ("b1_x3", 3.1, MONT(3.1)), ("b1_nar", 0.5, [("ding", 0.1, 0.55)])],
        B2=[("b2_x", 0, []), ("b2_her", 0.3, []), ("b2_x2", 0.3, []), ("b2_her2", 0.3, []), ("b2_x3", 0.25, []), ("b2_nar", 3.25, MONT(3.25)), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_x", 0, []), ("c1_her", 0.3, []), ("c1_x2", 0.3, []), ("c1_x3", 3.1, MONT(3.1)), ("c1_nar", 0.5, [("pop", 0.1, 0.5)]), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_x", 0, []), ("c2_her", 0.3, []), ("c2_x2", 2.6, TICKS(2.4)), ("c2_her2", 0.4, []), ("c2_x3", 3.1, MONT(3.1)), ("c2_nar", 0.6, [("impact_soft", 0.0, 0.6)])],
    )
    INTRO = 1.15
elif EPN == "london":
    LV = dict(
        A1=[("a1_her", 0, [("choo", ("e", 0.05), 0.65)]), ("a1_x", 1.0, []), ("a1_nar", 0.6, [("ding", 0.1, 0.5)])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, []), ("a2_nar", 1.1, [("whoosh", -0.85, 0.55), ("coo", -0.7, 0.4)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("bark", -0.35, 0.55)]), ("b1_nar", 1.0, [("UMB", -0.8, 0), ("umbrella", -0.8, 0.8)])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("boing", 0.7, 0.45)]), ("b2_nar", 0.7, [("pop", 0.1, 0.5)]), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("sparkle", ("e", -0.6), 0.6)]), ("c1_nar", 0.9, [("pop", 0.1, 0.5)]), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("coo", -2.4, 0.45)] + TICKS(2.4)), ("c2_her2", 2.3, [("whoosh", -2.0, 0.5), ("tada", -1.35, 0.85)]), ("c2_nar", 0.7, [("impact_soft", 0.0, 0.5)])],
    )
    INTRO = 1.15
elif EPN == "party":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.35, [("riff", ("e", 0.05), 0.6)]), ("a1_nar", 0.65, [("pop", 0.15, 0.5)])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("scratch", -0.3, 0.55)]), ("a2_nar", 0.55, [("buzz", 0.9, 0.55)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, []), ("b1_her2", 1.7, [("KNOB", -1.55, 0), ("knob", -1.55, 0.8), ("boom", -0.85, 1.0)]), ("b1_nar", 0.55, [("ding", 0.1, 0.5)])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, []), ("b2_nar", 2.3, [("FEATHER", -2.05, 0), ("feather", -2.05, 0.9)]), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, []), ("c1_nar", 1.9, [("WRAP", -1.65, 0), ("clapclap", -1.65, 0.8), ("powerdown", -1.05, 0.55)]), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.8), ("drop", -1.9, 0.8)] + TICKS(2.4)), ("c2_her2", 0.45, []), ("c2_nar", 0.85, [("riff", 0.05, 0.6)])],
    )
    INTRO = 2.35
elif EPN == "airport":
    LV = dict(
        A1=[("a1_her", 0, [("LIFT", -0.35, 0), ("strain", -0.3, 0.5)]), ("a1_x", 0.45, []), ("a1_nar", 1.15, [("DROP", -0.95, 0), ("thud", -0.9, 0.9), ("buzz", -0.72, 0.65)])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("PRICE", ("e", 0.05), 0), ("register", ("e", 0.05), 0.8)]), ("a2_nar", 1.05, [("gasp", -0.8, 0.7), ("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, []), ("b1_nar", 3.0, [("OPEN", -2.85, 0), ("zip", -2.85, 0.75), ("whoosh", -2.35, 0.45), ("thud", -1.95, 0.8), ("whoosh", -1.8, 0.45), ("clank", -1.4, 0.7), ("whoosh", -1.25, 0.45), ("boing", -0.85, 0.6), ("ding", -0.5, 0.75)])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, []), ("b2_nar", 1.75, [("RIM", -1.6, 0), ("rimshot", -1.6, 0.95)]), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("STAMP", ("e", 0.2), 0), ("stamp", ("e", 0.22), 1.0)]), ("c1_nar", 1.1, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_x2", 3.7, [("DRESS", -3.4, 0), ("zip", -3.4, 0.7), ("dressup", -3.2, 0.9), ("ding", -0.5, 0.8)]), ("c2_her2", 0.35, []), ("c2_nar", 1.7, [("WADDLE", -1.55, 0), ("squeak", -1.45, 0.5), ("squeak", -1.05, 0.5), ("squeak", -0.65, 0.5), ("squeak", -0.25, 0.45)])],
    )
    INTRO = 1.15
elif EPN == "restaurant":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.35, [("FISH", ("e", 0.25), 0), ("clank", ("e", 0.3), 0.8), ("boing", ("e", 0.55), 0.5)]), ("a1_nar", 0.95, [("buzz", -0.25, 0.5)])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("gasp", -0.25, 0.6)]), ("a2_nar", 0.6, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("SWAP", ("e", 0.2), 0), ("whoosh", ("e", 0.2), 0.5), ("clank", ("e", 0.6), 0.7), ("ding", ("e", 0.9), 0.6)]), ("b1_nar", 1.15, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, []), ("b2_nar", 1.3, [("RIM", -1.15, 0), ("rimshot", -1.15, 0.95)]), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("sparkle", ("e", 0.0), 0.6), ("ding", ("e", 0.1), 0.6)]), ("c1_nar", 0.55, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_her2", 0.45, [("BOTH", ("e", 0.4), 0), ("clank", ("e", 0.4), 0.8), ("clank", ("e", 0.75), 0.8), ("tada", ("e", 0.9), 0.75)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "market":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.35, [("TAG", ("e", -0.55), 0), ("register", ("e", -0.5), 0.75)]), ("a1_nar", 0.75, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("gasp", -0.25, 0.7)]), ("a2_nar", 0.6, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("TAG", 1.0, 0), ("ding", 1.05, 0.65)]), ("b1_nar", 0.65, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("TAG", ("e", -1.25), 0), ("register", ("e", -1.2), 0.7), ("riff", ("e", 0.05), 0.6)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("TAG", ("e", -1.1), 0), ("SHAKE", ("e", -0.1), 0), ("clapclap", ("e", 0.0), 0.6), ("sparkle", ("e", 0.05), 0.6)]), ("c1_nar", 0.9, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("gulp", -1.6, 0.7)] + TICKS(2.4)), ("c2_her2", 0.45, [("register", -0.35, 0.8)]), ("c2_nar", 0.9, [("tada", -0.75, 0.75)])],
    )
    INTRO = 1.15
else:
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_nar", 0.6, [("pop", 0.15, 0.5)])],
        A2=[("a2_x", 0, []), ("a2_her", 0.3, [("bell", -0.05, 0.45)]), ("a2_x2", 0.35, [("brow", -0.2, 0.5)]), ("a2_nar", 0.45, [("buzz", 0.9, 0.55)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_x", 0, []), ("b1_her", 0.3, []), ("b1_x2", 0.25, [("pop", 0, 0.5)]), ("b1_nar", 0.35, [("ding", 0.1, 0.55)])],
        B2=[("b2_x", 0, []), ("b2_her", 0.3, []), ("b2_x2", 0.25, [("pop", 0, 0.5)]), ("b2_nar", 0.35, [("pop", 0.1, 0.5)]), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_x", 0, []), ("c1_her", 0.3, []), ("c1_x2", 0.25, [("sparkle", -0.1, 0.7)]), ("c1_nar", 0.35, [("pop", 0.1, 0.5)]), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_x", 0, []), ("c2_her", 0.3, []), ("c2_x2", 2.6, [("hum", -2.5, 0.6)] + TICKS(2.4)), ("c2_her2", 0.45, [("deflate", 0.35, 0.7)]), ("c2_nar", 0.75, [("impact_soft", 0.0, 0.6)])],
    )
    INTRO = 1.75

for L in ["A1", "A2", "B1", "B2", "C1", "C2"]:
    s = t
    cue("whoosh", s, 0.8); cue("impact", s + 0.32, 0.9); cue("riser_short", s - 0.35, 0.35)
    if EPN == "lift": cue("doors", s + 0.95, 0.6); cue("lift_ding", s + 0.9, 0.7)
    c = s + INTRO; ev = {}; prev_end = c
    if EPN == "party":
        for k in range(3): cue("knock", s + 1.12 + 0.22 * k, 0.9)
        cue("creak", s + 1.82, 0.7); ev["knock"] = round(s + 1.12, 3); ev["open"] = round(s + 1.85, 3)
    for lid, gap, cues in LV[L]:
        c += gap
        for n, off, g in cues:
            if n == "MONT": ev["mont"] = [round(prev_end + 0.12, 3), round(c - 1.0, 3)]; continue
            if n.isupper(): ev[n.lower()] = round(c + D[lid] + off[1] if isinstance(off, tuple) else c + off, 3); continue
            tt = c + D[lid] + off[1] if isinstance(off, tuple) else c + off
            cue(n, tt, g)
            if n in ("plop", "thud") and lid != "c2_x3": ev.setdefault("plop", round(tt, 3))
            if n == "thud" and lid == "c2_x3": ev["plop"] = round(tt, 3)
            if n == "gulp" or n == "nope": ev["ins"] = round(c - 1.6, 3)
        ev[lid] = c; c = say(lid, c); prev_end = c
    t = c + 0.55
    if EPN == "lift": cue("doors", t - 0.45, 0.5)
    scenes.append(dict(id=L, s=round(s, 3), e=round(t, 3), ev={k: (round(v, 3) if not isinstance(v, list) else v) for k, v in ev.items()}))
s = t
cue("whoosh", s, 0.8); cue("impact", s + 0.3, 0.8)
e = say("outro", s + 0.8)
for k in range(6): cue("pop", s + 1.1 + 0.15 * k, 0.5)
t = e + 1.3
scenes.append(dict(id="outro", s=round(s, 3), e=round(t, 3)))

for sp in speech:
    p = f"{VO}/{sp['id']}.wav"
    if os.path.exists(p):
        x, sr = sf.read(p); hop = sr // FPS; n = int(np.ceil(len(x) / hop))
        env = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2)) for i in range(n)])
        env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1.2)
    else:
        n = int(sp["d"] * FPS); env = np.abs(np.sin(np.arange(n) * 0.9)) * 0.8
    sp["env"] = [round(float(v), 2) for v in env]
    wt = word_times(sp["id"])
    if wt is None:
        words = sp["text"].split(); wts = [len(re.sub(r"[^\w']", "", w)) + 1.5 for w in words]
        pz = [3.5 if re.search(r"[.!?:]$", w) else (2.0 if re.search(r"[,—]$", w) else 0) for w in words]
        tot = sum(wts) + sum(pz[:-1]); cc = 0; wt = []
        for w, a, p_ in zip(words, wts, pz):
            t0 = cc / tot * sp["d"]; cc += a; wt.append([w, round(t0, 3), round(cc / tot * sp["d"], 3)]); cc += p_
    sp["words"] = wt
cfg = {k: E.get(k) for k in ["title", "hook_title", "stamp", "next", "cards"]}
cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.1f}s")
