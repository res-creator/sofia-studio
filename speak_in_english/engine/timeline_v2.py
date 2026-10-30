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
if EPN == "wrongchat":  # phone hook: SEND -> SENT TO: MR GRANT -> READ -> her eyes -> his head turns
    cue("send", 0.3, 0.8); cue("pop", 0.45, 0.7); cue("msg", 0.95, 0.8); cue("whoosh", 1.3, 0.45); cue("gasp", 1.9, 0.7)
for k in range(1, 4): cue("pop", 0.2 + 0.35 * k, 0.6)
h0 = 0.35
if EPN == "checkout":  # conflict first: UNEXPECTED ITEM! on the screen + error buzz, her line, then the short narrator line
    cue("err", 0.05, 0.8); h0 = say("hook_her", 0.6) + 0.25
if EPN == "mic":  # cover = the meeting; her line; hard cut to the MICROPHONE ON button, then the narrator
    h0 = say("hook_her", 0.6) + 0.15; cue("blink", h0, 0.8); cue("ding", h0 + 0.1, 0.5); h0 += 0.5
if EPN == "teacher":  # cover = teacher in sunglasses; GOOD MORNING, CHAT! -> student -> Not anymore (phone out) -> narrator
    cue("riff", 0.15, 0.35); h0 = say("hook_t", 0.45) + 0.3; h0 = say("hook_s", h0) + 0.3; cue("zip", h0 + 0.1, 0.5); h0 = say("hook_t2", h0)
    hev = dict(phone=round(h0 - 0.2, 3)); cue("pop", h0 - 0.15, 0.6); h0 += 0.4
if EPN == "pretend":  # cover = her with coffee on the street, the man waving; OH MY GOD! IT'S YOU! -> ...Me? -> close-up of her scared face
    h0 = say("hook_m", 0.45) + 0.25; h0 = say("hook_her", h0) + 0.25; h0 = say("hook_m2", h0)
    hev = dict(scared=round(h0 + 0.1, 3)); cue("gasp", h0 + 0.1, 0.6); h0 += 0.6
if EPN == "password":  # cover = laptop INCORRECT PASSWORD; her yell; screen blinks; Incorrect password.
    cue("err", 0.1, 0.8); h0 = say("hook_her", 0.5) + 0.2; cue("blink", h0, 0.7); h0 = say("hook_x", h0 + 0.15)
    hev = dict(blink=round(h0 - 0.9, 3)); cue("buzz", h0 - 0.1, 0.6); h0 += 0.3
if EPN == "cantsayno":  # street: tiny favor? -> Sure! -> HARD CUT to the hotel desk, HOTEL MANAGER badge, huge queue -> HOW DID THIS HAPPEN?!
    h0 = say("hook_m", 0.4) + 0.2; h0 = say("hook_her", h0) + 0.35
    hev = dict(cut=round(h0 - 0.1, 3)); cue("impact", h0 - 0.1, 0.8); cue("hum", h0, 0.5); h0 = say("hook_her2", h0 + 0.45) + 0.3
if EPN == "rich":  # cover = the shiny car + him in sunglasses; that's my car -> Really? -> I'm rich -> KEY insert: RENTAL tag, he hides it
    h0 = say("hook_m", 0.45) + 0.25; h0 = say("hook_f", h0) + 0.25; h0 = say("hook_m2", h0)
    hev = dict(key=round(h0 + 0.1, 3), hide=round(h0 + 1.9, 3)); cue("pop", h0 + 0.15, 0.6); cue("zip", h0 + 1.9, 0.6); h0 += 2.6
if EPN == "busy":  # cover = game on his monitor; boss footsteps -> game closed -> frantic typing -> Working hard? -> Extremely hard! -> monitor: I AM WORKING
    for k in range(3): cue("thud", 0.3 + 0.32 * k, 0.35)
    hev = dict(close=1.2, type=1.35); cue("click", 1.2, 0.7)
    for k in range(10): cue("keys", 1.35 + 0.09 * k, 0.5)
    h0 = say("hook_b", 1.75) + 0.25; h0 = say("hook_w", h0); hev["mon"] = round(h0 + 0.1, 3)
    for k in range(6): cue("keys", h0 + 0.15 + 0.12 * k, 0.45)
    h0 += 2.2
if EPN == "lunch":  # cover = him at the open fridge with her lasagna, her at the door; he chews: Whose lasagna? -> her shocked face: That's my lunch
    cue("gulp", 0.35, 0.5); h0 = say("hook_c", 0.5) + 0.3
    hev = dict(shock=round(h0 - 0.05, 3)); cue("gasp", h0, 0.6); h0 = say("hook_h", h0 + 0.1) + 0.35
if EPN == "togo":  # cover = café counter, barista smiling, her at the front; For here or to go? -> her panic: ...Yes! -> narrator
    h0 = say("hook_b", 0.5) + 0.25
    hev = dict(panic=round(h0 - 0.05, 3)); cue("pop", h0, 0.5); cue("gasp", h0 + 0.1, 0.5); h0 = say("hook_h", h0 + 0.1) + 0.35
if EPN == "avoidparty":  # cover = her on the sofa under a blanket, phone ringing; party? -> not well -> solution! -> HARD CUT: door, crowd, SURPRISE!
    cue("ring", 0.2, 0.6); h0 = say("hook_p", 0.5) + 0.25; h0 = say("hook_h", h0) + 0.25; h0 = say("hook_p2", h0) + 0.3
    hev = dict(cut=round(h0 - 0.05, 3)); cue("creak", h0, 0.7); h0 = say("hook_all", h0 + 0.45); cue("cheer", h0 - 0.5, 0.6); cue("tada", h0 - 0.4, 0.5)
    hev["horror"] = round(h0 + 0.05, 3); cue("gasp", h0 + 0.1, 0.6); h0 += 0.7
if EPN == "tour":  # cover = her in the tourist square, the tourist asks "tour guide?"; HARD CUT: a big group is following her
    h0 = say("hook_t", 0.45) + 0.25; h0 = say("hook_h", h0) + 0.35
    hev = dict(cut=round(h0 - 0.05, 3)); cue("impact", h0 - 0.05, 0.8); cue("whoosh", h0 - 0.1, 0.5); cue("cheer", h0 + 0.05, 0.4)
    h0 = say("hook_h2", h0 + 0.4); hev["horror"] = round(h0 + 0.05, 3); cue("gasp", h0 + 0.1, 0.6); h0 += 0.6
if EPN == "splitbill":  # cover = four-seat table, huge bill; let's split -> BILL insert $300 -> why three hundred?! -> somebody is lying!
    h0 = say("hook_f", 0.5) + 0.3
    hev = dict(bill=round(h0 - 0.05, 3)); cue("register", h0, 0.7); cue("pop", h0 + 0.1, 0.5)
    h0 = say("hook_h", h0 + 0.7) + 0.2; hev["lie"] = round(h0 - 0.1, 3); h0 = say("hook_h2", h0) ; cue("gasp", h0 - 0.2, 0.5); h0 += 0.5
if EPN == "photo":  # cover = her posing by the fountain, friend with phone; ONE good picture? -> HARD CUT to the phone: PHOTOS TAKEN counts up to 847
    h0 = say("hook_h", 0.45) + 0.25; h0 = say("hook_f", h0) + 0.3
    hev = dict(cut=round(h0 - 0.05, 3)); cue("impact", h0 - 0.05, 0.7)
    for k in range(8): cue("shutter", h0 + 0.05 + 0.1 * k, 0.5)
    h0 = say("hook_h2", h0 + 1.1); hev["count"] = round(hev["cut"] + 0.1, 3); h0 += 0.5
e = say("hook", h0); hw = word_times("hook") or []
def find(word):
    for w, a, b in hw:
        if w.lower().strip("«»!?.,").startswith(word.lower()): return h0 + a
    return None
stamp_t = find(E["stamp_word"]) or (e - 1.0); cue("stamp", stamp_t, 0.8)
t = e + 0.45
scenes.append(dict(id="hook", s=0.0, e=round(t, 3), stamp_t=round(stamp_t, 3), **({"ev": hev} if EPN in ("teacher", "pretend", "password", "cantsayno", "rich", "busy", "avoidparty", "tour", "splitbill", "photo", "lunch", "togo") else {})))

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
elif EPN == "names":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.35, [("HUG", ("e", 0.1), 0), ("pop", ("e", 0.1), 0.6)]), ("a1_nar", 0.9, [("buzz", -0.25, 0.45)])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("gasp", -0.25, 0.6)]), ("a2_nar", 0.6, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("FLEX", ("e", -0.9), 0), ("boing", ("e", -0.9), 0.5)]), ("b1_nar", 0.8, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("RIM", ("e", 0.1), 0), ("rimshot", ("e", 0.1), 0.95), ("sparkle", ("e", 0.5), 0.6)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("TAG", ("e", -0.8), 0), ("ding", ("e", -0.8), 0.6)]), ("c1_nar", 0.7, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6), ("RING", ("e", -0.5), 0), ("gasp", ("e", -0.45), 0.7), ("sparkle", ("e", -0.4), 0.8)] + TICKS(2.4)), ("c2_her2", 0.7, [("tada", ("e", 0.1), 0.7)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "sorry":
    ST_ = ("thud", -0.25, 0.9)
    LV = dict(
        A1=[("a1_her", 0, [ST_]), ("a1_x", 0.35, []), ("a1_nar", 0.9, [("buzz", -0.25, 0.45)])],
        A2=[("a2_her", 0, [ST_]), ("a2_x", 0.3, []), ("a2_x2", 1.4, [("FREEZE", -1.3, 0), ("scratch", -1.3, 0.9)]), ("a2_nar", 0.7, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, [ST_]), ("b1_x", 0.3, [("WHEEL", ("e", 0.1), 0), ("clank", ("e", 0.1), 0.7)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, [ST_]), ("b2_x", 0.3, [("RIM", ("e", 0.15), 0), ("rimshot", ("e", 0.15), 0.95)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, [ST_]), ("c1_x", 0.3, []), ("c1_her2", 0.3, []), ("c1_nar", 0.8, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_her2", 0.35, []), ("c2_c1", 0.45, [("CHORUS", -0.05, 0)]), ("c2_c2", 0.12, []), ("c2_c3", 0.12, []), ("c2_c4", 0.12, []), ("c2_c5", 0.55, [("BOOM", -0.05, 0), ("tada", 0.0, 0.8), ("impact", 0.0, 0.8)]), ("c2_nar", 1.0, [])],
    )
    INTRO = 1.15
elif EPN == "vendor":
    PAY = lambda off: [("PAY", off, 0), ("register", off, 0.6)]
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_x2", 0.35, [("BRACE", -0.3, 0), ("pop", -0.3, 0.6)]), ("a1_her", 0.3, []), ("a1_x3", 0.3, [("CARD", 0.9, 0)] + PAY(("e", 0.1))), ("a1_nar", 0.6, [])],
        A2=[("a2_x", 0, []), ("a2_her", 0.3, []), ("a2_x2", 0.3, [("ROSE", ("e", -0.6), 0), ("pop", ("e", -0.6), 0.6)] + PAY(("e", 0.2))), ("a2_nar", 0.5, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_x", 0, []), ("b1_her", 0.3, []), ("b1_x2", 0.3, [("STICK", ("e", -0.4), 0), ("pop", ("e", -0.4), 0.6), ("PIGEON", ("e", 0.3), 0), ("coo", ("e", 0.3), 0.6)] + PAY(("e", 0.7))), ("b1_nar", 0.9, [])],
        B2=[("b2_x", 0, []), ("b2_her", 0.3, []), ("b2_x2", 0.3, [("PARROT", ("e", -0.6), 0), ("whoosh", ("e", -0.6), 0.5)]), ("b2_p", 0.2, PAY(("e", 0.0)) + [("RIM", ("e", 0.25), 0), ("rimshot", ("e", 0.25), 0.9)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_x", 0, []), ("c1_her", 0.3, []), ("c1_x2", 0.3, [("CARDNO", ("e", -1.6), 0), ("pop", ("e", -1.6), 0.6)] + PAY(("e", 0.1))), ("c1_nar", 0.6, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_x", 0, []), ("c2_her", 0.4, []), ("c2_t", 2.3, [("scratch", -2.2, 0.6)] + TICKS(2.1)), ("c2_her2", 0.6, []), ("c2_x2", 0.5, [("SALE", -0.45, 0), ("register", -0.45, 0.9), ("tada", ("e", 0.1), 0.7)]), ("c2_nar", 0.9, [])],
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
elif EPN == "lie":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("SNORE", ("e", -0.6), 0)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("TWIN", ("e", -0.2), 0), ("ding", ("e", -0.2), 0.6)]), ("a2_nar", 0.9, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("DREAM", 0.7, 0), ("whoosh", 0.7, 0.6)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("CAR", ("e", -0.2), 0), ("squeak", ("e", 0.0), 0.6), ("squeak", ("e", 0.25), 0.6), ("whoosh", ("e", 0.3), 0.5)]), ("b2_nar", 1.2, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, [("PHOTO", 1.8, 0), ("ding", 1.8, 0.6)]), ("c1_x", 0.6, [("rimshot", ("e", 0.15), 0.9)]), ("c1_nar", 0.8, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("ZOOM", 0.0, 0), ("whoosh", 0.0, 0.5)]), ("c2_her2", 0.7, [("rimshot", ("e", 0.15), 0.9)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "things":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, []), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("SIP", ("e", -0.3), 0), ("gulp", ("e", -0.3), 0.6)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.4, [("CABLE", ("e", 0.15), 0), ("ding", ("e", 0.4), 0.6)]), ("b1_nar", 1.0, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("STAPLE", 0.8, 0), ("pop", 0.8, 0.6)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("POINTER", ("e", -0.4), 0), ("pop", ("e", -0.4), 0.6), ("rimshot", ("e", 0.2), 0.9)]), ("c1_nar", 0.8, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_x2", 0.4, [("MUSEUM", ("e", 0.2), 0), ("tada", ("e", 0.2), 0.7), ("rimshot", ("e", 0.7), 0.9)]), ("c2_nar", 1.2, [])],
    )
    INTRO = 1.15
elif EPN == "haircut":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("SNIP", ("e", -0.4), 0), ("snips", ("e", -0.4), 0.8)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("PINK", ("e", -0.3), 0), ("whoosh", ("e", -0.3), 0.6), ("sparkle", ("e", -0.1), 0.6)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("MOHAWK", ("e", -0.4), 0), ("hairdryer", ("e", -0.6), 0.6)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("VEIL", ("e", -0.2), 0), ("whoosh", ("e", -0.2), 0.6)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.4, [("CERT", ("e", 0.0), 0), ("tada", ("e", 0.05), 0.6)]), ("c1_nar", 0.9, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("CLIP", ("e", -0.5), 0), ("clipper", ("e", -0.5), 0.8)]), ("c2_x2", 0.5, [("rimshot", ("e", 0.15), 0.9)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "date":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("HEARTS", ("e", -0.9), 0), ("sparkle", ("e", -0.9), 0.6)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("NAPKIN", ("e", -0.7), 0), ("pop", ("e", -0.7), 0.6)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("BOW", ("e", -0.6), 0), ("whoosh", ("e", -0.6), 0.5)]), ("b1_nar", 0.8, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("VIOLIN", ("e", -0.1), 0), ("whoosh", ("e", -0.1), 0.5), ("chime", ("e", 0.1), 0.6)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("RING", ("e", 0.0), 0), ("sparkle", ("e", 0.2), 0.7), ("tada", ("e", 0.1), 0.6)]), ("c1_nar", 1.0, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("STAND", ("e", 0.0), 0), ("whoosh", ("e", 0.1), 0.5)]), ("c2_x2", 0.5, []), ("c2_y", 0.4, [("BOOK", -0.25, 0), ("thud", -0.25, 0.7), ("rimshot", ("e", 0.2), 0.9)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "shoes":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, []), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("CIRCLE", ("e", 0.0), 0), ("spin", ("e", 0.0), 0.6)]), ("a2_nar", 1.4, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("SWAP", ("e", -0.1), 0), ("whoosh", ("e", -0.1), 0.6), ("pop", ("e", 0.3), 0.6)]), ("b1_nar", 1.0, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("PAIR", ("e", -0.9), 0), ("plop", ("e", -0.9), 0.6), ("ding", ("e", 0.1), 0.6)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("VOUCHER", ("e", -0.4), 0), ("register", ("e", -0.4), 0.7)]), ("c1_nar", 1.0, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("BOX", ("e", -0.3), 0), ("thud", ("e", -0.3), 0.7), ("OPEN", ("e", 0.3), 0), ("pop", ("e", 0.3), 0.6)]), ("c2_her2", 0.7, [("PAIRUP", ("e", 0.0), 0), ("tada", ("e", 0.0), 0.7), ("rimshot", ("e", 0.7), 0.9)]), ("c2_nar", 1.3, [])],
    )
    INTRO = 1.15
elif EPN == "marry":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("FOLDER", ("e", -0.6), 0), ("whoosh", ("e", -0.6), 0.6)]), ("a1_nar", 0.8, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("CAL", ("e", -0.2), 0), ("pop", ("e", -0.2), 0.6)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("GERALD", ("e", -0.2), 0), ("creak", ("e", -0.2), 0.7)]), ("b1_nar", 1.0, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("CHURCH", ("e", -0.9), 0), ("bell", ("e", -0.8), 0.7)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.4, [("AWAY", 0.3, 0), ("deflate", 0.3, 0.5)]), ("c1_nar", 1.0, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_x2", 0.6, [("BOOTIES", ("e", 0.0), 0), ("sparkle", ("e", 0.0), 0.7), ("rimshot", ("e", 0.4), 0.9)]), ("c2_nar", 1.0, [])],
    )
    INTRO = 1.15
elif EPN == "weight":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("TAPE", ("e", -0.4), 0), ("zip", ("e", -0.4), 0.7)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("SCALE", ("e", -0.6), 0), ("clank", ("e", -0.6), 0.7)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("TOWEL", ("e", -0.5), 0), ("whoosh", ("e", -0.5), 0.6)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("LENS", 1.0, 0), ("pop", 1.0, 0.6)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("HUG", ("e", -0.6), 0), ("coo", ("e", -0.6), 0.4), ("MEASURE", ("e", 0.3), 0), ("zip", ("e", 0.3), 0.7), ("rimshot", ("e", 1.0), 0.9)]), ("c1_nar", 1.5, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_x2", 0.5, [("PUSH", ("e", 0.0), 0), ("squeak", ("e", 0.0), 0.6), ("rimshot", ("e", 0.6), 0.9)]), ("c2_nar", 1.1, [])],
    )
    INTRO = 1.15
elif EPN == "nosy":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("ROLL", ("e", -0.5), 0), ("whoosh", ("e", -0.5), 0.6)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("SPIN", ("e", -0.6), 0), ("spin", ("e", -0.6), 0.7)]), ("a2_nar", 1.0, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("MIRROR", ("e", -0.2), 0), ("blink", ("e", 0.0), 0.6)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("CALL", ("e", 0.0), 0), ("tick", ("e", 0.2), 0.6), ("tick", ("e", 0.4), 0.6), ("tick", ("e", 0.6), 0.6)]), ("b2_nar", 1.0, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("AWAY", ("e", 0.0), 0), ("whoosh", ("e", 0.0), 0.7)]), ("c1_nar", 1.2, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("BINO", ("e", 0.3), 0), ("brow", ("e", 0.3), 0.7)]), ("c2_her2", 1.0, []), ("c2_x2", 0.4, [("BIRD", ("e", 0.2), 0), ("coo", ("e", 0.3), 0.7), ("rimshot", ("e", 0.8), 0.9)]), ("c2_nar", 1.2, [])],
    )
    INTRO = 1.15
elif EPN == "kyle":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("SPOON", ("e", -0.5), 0), ("zip", ("e", -0.5), 0.5)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("COAT", ("e", 0.0), 0), ("clank", ("e", 0.0), 0.8), ("tada", ("e", 0.1), 0.5)]), ("a2_nar", 1.0, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("SALT", ("e", -0.6), 0), ("sparkle", ("e", -0.6), 0.6)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("CANDLE", ("e", 0.0), 0), ("feather", ("e", 0.0), 0.6), ("zip", ("e", 0.5), 0.5)]), ("b2_nar", 1.0, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.4, [("DROP", ("e", 0.1), 0), ("clank", ("e", 0.1), 0.9)]), ("c1_nar", 1.0, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("PILE", ("e", 0.1), 0), ("clank", ("e", 0.1), 0.9), ("clank", ("e", 0.3), 0.7)]), ("c2_y", 1.0, [("CHAIR", ("e", 0.0), 0), ("creak", ("e", 0.0), 0.7), ("rimshot", ("e", 0.8), 0.9)]), ("c2_nar", 1.4, [])],
    )
    INTRO = 1.15
elif EPN == "quit":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("MUG", ("e", -0.6), 0), ("pop", ("e", -0.6), 0.6)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("DENIED", ("e", -0.2), 0), ("stamp", ("e", -0.2), 0.8)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("BADGE", ("e", -0.3), 0), ("sparkle", ("e", -0.3), 0.7)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("CAL", ("e", -0.4), 0), ("whoosh", ("e", -0.4), 0.6)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("PLANT", ("e", 0.0), 0), ("thud", ("e", 0.0), 0.8), ("rimshot", ("e", 0.6), 0.9)]), ("c1_nar", 1.3, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("LETTER", ("e", -0.6), 0), ("whoosh", ("e", -0.6), 0.5)]), ("c2_x2", 0.4, [("POINT", ("e", -0.4), 0), ("rimshot", ("e", 0.3), 0.9)]), ("c2_nar", 1.1, [])],
    )
    INTRO = 1.15
elif EPN == "wrongchat":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("SHOT", ("e", 0.15), 0), ("shutter", ("e", 0.15), 0.9)]), ("a1_nar", 1.05, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("CHART", ("e", -1.1), 0), ("pop", ("e", -1.1), 0.7)]), ("a2_nar", 0.7, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("SCROLL", ("e", 0.15), 0), ("whoosh", ("e", 0.2), 0.5)] + [("tick", ("e", 0.4 + 0.12 * k), 0.4) for k in range(14)] + [("IDIOTS", ("e", 2.0), 0), ("stamp", ("e", 2.0), 0.8)]), ("b1_x2", 2.3, [("rimshot", ("e", 0.15), 0.9)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, []), ("b2_her2", 2.3, [("DRONE", -2.2, 0), ("drone", -2.1, 0.7), ("DROP", -0.7, 0), ("thud", -0.65, 0.9)]), ("b2_x2", 0.35, [("rimshot", ("e", 0.15), 0.9)]), ("b2_nar", 1.0, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("sparkle", ("e", -0.6), 0.5)]), ("c1_x2", 1.7, [("LUCY", -1.5, 0), ("msg", -1.5, 0.9), ("msg", -1.1, 0.6), ("HIDE", ("e", 0.25), 0), ("zip", ("e", 0.25), 0.6), ("blink", ("e", 0.55), 0.35)]), ("c1_nar", 1.0, [])],
        C2=[("c2_her", 0, [("SIP", 3.0, 0), ("gulp", 3.4, 0.5), ("FOLDER", 8.0, 0), ("thud", 8.6, 0.9)]), ("c2_x", 2.2, [("scratch", -2.1, 0.6)] + TICKS(2.0)), ("c2_x2", 2.5, [("BOSSMSG", -2.2, 0), ("msg", -2.1, 0.8)]), ("c2_her2", 0.35, []), ("c2_nar", 3.2, [("SENT", -2.9, 0), ("send", -2.9, 0.9), ("READ", -1.6, 0), ("msg", -1.6, 0.9), ("FREEZE", -1.2, 0), ("impact_soft", -1.2, 0.8)])],
    )
    INTRO = 1.15
elif EPN == "checkout":
    LV = dict(
        A1=[("a1_x", 0.3, []), ("a1_her", 0.9, [("SCAN", -0.9, 0), ("beep", -0.85, 0.7)]), ("a1_x2", 0.6, [("PLACE", -0.6, 0), ("plop", -0.5, 0.5), ("err", -0.05, 0.7)]), ("a1_her2", 0.2, []), ("a1_nar", 0.3, [])],
        A2=[("a2_her", 0.15, []), ("a2_x", 0.2, []), ("a2_x2", 0.55, [("REMOVE", -0.55, 0)]), ("a2_x3", 0.55, [("BACK", -0.55, 0), ("plop", -0.45, 0.5), ("err", -0.05, 0.7)]),
            ("a2_her2", 0.5, [("LOOK", -0.5, 0)]), ("a2_nar", 0.3, []), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0.1, []), ("b1_d", 1.0, [("WALK", -1.0, 0)]), ("b1_her2", 0.2, []), ("b1_d2", 0.5, [("PRESS", -0.5, 0), ("beep", -0.4, 0.6)]), ("b1_x", 0.25, [("err", -0.1, 0.6)]),
            ("b1_d3", 0.7, [("STARE", -0.7, 0), ("rimshot", ("e", 0.1), 0.9)]), ("b1_nar", 0.75, [])],
        B2=[("b2_x", 0.35, [("ALARM", -0.35, 0), ("alarm", -0.35, 0.5)]), ("b2_her", 0.2, []), ("b2_d", 0.2, []), ("b2_her2", 0.2, []),
            ("b2_nar", 2.7, [("CAM", -2.45, 0), ("servo", -2.45, 0.6), ("ZOOM", -1.5, 0), ("blink", -1.5, 0.5), ("squeak", -1.1, 0.35)])],
        C1=[("c1_her", 0.1, []), ("c1_x", 0.2, []), ("c1_her2", 0.5, [("FREEZE", -0.5, 0)]), ("c1_x2", 0.2, []),
            ("c1_nar", 1.15, [("RATING", -1.0, 0), ("pop", -1.0, 0.6)]), ("c1_tip", 0.15, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0.8, [("FIX", -0.8, 0)]), ("c2_x", 1.7, [("scratch", -1.6, 0.6)] + TICKS(1.5) + [("GREEN", -0.2, 0), ("register", -0.15, 0.7)]), ("c2_her2", 0.2, []),
            ("c2_x2", 0.4, [("TAKE", -0.4, 0)]), ("c2_her3", 0.6, [("TURN", -0.6, 0)]), ("c2_x3", 0.3, []),
            ("c2_nar", 1.7, [("SHOCK", -1.6, 0), ("impact_soft", -1.6, 0.8), ("rimshot", -1.0, 0.9)])],
    )
    INTRO = 1.15
elif EPN == "mic":
    LV = dict(
        A1=[("a1_x", 0.2, []), ("a1_her", 0.35, []), ("a1_her2", 0.75, [("CLICK1", -0.7, 0), ("click", -0.7, 0.6)]),
            ("a1_nar", 1.45, [("STARE", -1.4, 0), ("SIP", -0.7, 0), ("gulp", -0.5, 0.5), ("BROW", 0.35, 0), ("brow", 0.35, 0.7)])],
        A2=[("a2_her", 1.1, [("SLIDE2", -1.1, 0), ("click", -1.1, 0.6), ("NOTICE", -0.55, 0), ("pop", -0.6, 0.5)]), ("a2_x", 0.35, []),
            ("a2_her2", 0.5, [("SHRUG", -0.45, 0)]), ("a2_nar", 0.55, []), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0.85, [("SLIDE12", -0.85, 0), ("click", -0.85, 0.6)]), ("b1_x", 1.35, [("CHOKE", -1.3, 0), ("cough", -1.2, 0.8), ("GLASSES", -0.5, 0)]),
            ("b1_her2", 0.35, []), ("b1_nar", 1.15, [("POINT", -1.1, 0), ("squeak", -0.95, 0.35), ("squeak", -0.6, 0.35)])],
        B2=[("b2_her", 1.75, [("MSG", -1.65, 0), ("msg", -1.65, 0.9), ("LOOKMIC", -0.85, 0), ("blink", -0.8, 0.6)]), ("b2_x", 0.4, []), ("b2_her2", 0.35, []),
            ("b2_x2", 1.45, [("MASH", -1.4, 0)] + [("keys", -1.35 + 0.12 * k, 0.55) for k in range(6)] + [("VOL", -0.6, 0)] + [("vol", -0.6 + 0.09 * k, 0.5) for k in range(5)] + [("impact", 0.0, 0.9)]),
            ("b2_nar", 0.6, [])],
        C1=[("c1_her", 1.0, [("FIX", -1.0, 0), ("sparkle", -0.4, 0.5)]), ("c1_x", 0.35, []), ("c1_her2", 0.35, []),
            ("c1_x2", 1.3, [("LOOK47", -1.25, 0)] + TICKS(1.2)), ("c1_nar", 2.1, [("NOD", -2.05, 0), ("DEL", -1.45, 0), ("click", -1.45, 0.6), ("pop", -1.2, 0.6), ("AWK", -0.65, 0)]),
            ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_x", 0.3, [("LEAN", -0.3, 0)]), ("c2_her", 0.6, [("CALM", -0.6, 0)]),
            ("c2_x2", 3.0, [("CLAP", -2.5, 0)] + [("clap", -2.4 + 0.5 * k, 0.6) for k in range(2)] + [("TOM", -1.35, 0)] + [("clap", -1.35 + 0.19 * k, 0.5 + 0.05 * (k % 2)) for k in range(7)]),
            ("c2_x3", 0.3, []), ("c2_her2", 0.3, []),
            ("c2_x4", 2.9, [("SHARE", -2.75, 0), ("click", -2.5, 0.7), ("TAB", -2.25, 0), ("whoosh", -2.25, 0.5), ("STOPCLAP", -0.75, 0), ("scratch", -0.75, 0.6)]),
            ("c2_x5", 1.8, [("FREEZE", -1.7, 0), ("EXCELLENT", -0.9, 0), ("ding", -0.9, 0.6)]),
            ("c2_nar", 1.25, [("rimshot", -0.95, 0.9)])],
    )
    INTRO = 1.15
elif EPN == "teacher":
    LV = dict(
        A1=[("a1_t", 0.35, [("STRUT", -0.35, 0)]), ("a1_s", 0.45, [("LIFT", -0.45, 0)]), ("a1_t2", 0.3, []), ("a1_s2", 0.3, []),
            ("a1_nar", 1.35, [("OFF", -1.2, 0), ("whoosh", -1.15, 0.3), ("cricket", -0.9, 0.5)])],
        A2=[("a2_t", 1.05, [("ERASE", -1.0, 0), ("squeak", -0.95, 0.35), ("squeak", -0.6, 0.35), ("squeak", -0.3, 0.3)]),
            ("a2_s", 0.45, [("CHEER", -0.45, 0), ("tada", -0.4, 0.5), ("clapclap", -0.3, 0.5)]), ("a2_t2", 0.3, []), ("a2_s2", 0.35, []),
            ("a2_nar", 0.95, [("THUMBS", -0.9, 0), ("boing", -0.85, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_t", 1.05, [("PHONE", -1.05, 0), ("plop", -0.95, 0.5), ("LIVE", -0.5, 0), ("blink", -0.5, 0.6)]),
            ("b1_s", 0.45, [("BUZZ", -0.45, 0)]), ("b1_t2", 0.3, []),
            ("b1_nar", 2.35, [("LIKE", -2.3, 0), ("ding", -2.2, 0.7), ("COMMENT", -1.55, 0), ("pop", -1.5, 0.6), ("STARE", -0.85, 0), ("cricket", -0.8, 0.45)])],
        B2=[("b2_s", 1.5, [("MUSIC", -1.5, 0), ("click", -1.5, 0.6), ("DANCE", -1.15, 0)]), ("b2_t", 0.3, []),
            ("b2_s2", 1.45, [("HIT", -1.3, 0), ("thud", -1.25, 0.8), ("whoosh", -1.2, 0.6), ("plop", -0.75, 0.5), ("plop", -0.5, 0.5), ("plop", -0.3, 0.4)]),
            ("b2_t2", 0.3, []), ("b2_nar", 1.35, [("DOOR", -1.25, 0), ("creak", -1.2, 0.6)])],
        C1=[("c1_p", 0.6, [("STOP", -0.6, 0), ("scratch", -0.6, 0.7)]), ("c1_t", 0.4, [("STRAIGHT", -0.4, 0)]), ("c1_s", 0.35, [("HAND", -0.35, 0)]),
            ("c1_p2", 1.3, [("SCARED", -1.25, 0), ("PPHONE", -0.6, 0), ("pop", -0.55, 0.4)]), ("c1_t2", 0.35, []),
            ("c1_nar", 1.45, [("FADE", -1.35, 0)] + TICKS(1.2)), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_p", 0.35, [("SHOW", -0.35, 0)]), ("c2_t", 0.45, [("FREEZE", -0.4, 0), ("impact_soft", -0.35, 0.6)]),
            ("c2_t2", 2.7, [("LIVE2", -2.6, 0), ("blink", -2.6, 0.6), ("TURN", -1.15, 0), ("whoosh", -1.1, 0.35)]),
            ("c2_p2", 0.45, []), ("c2_t3", 0.3, []),
            ("c2_mom", 0.95, [("COMMENTS", -0.9, 0), ("pop", -0.85, 0.6)]),
            ("c2_t4", 1.2, [("FACE", -0.95, 0), ("deflate", -0.9, 0.45)]), ("c2_s", 0.45, []),
            ("c2_nar", 2.5, [("SLIDE", -2.1, 0), ("BLACK", -0.95, 0)])],
    )
    INTRO = 1.15
elif EPN == "pretend":   # street outside a cafe; her (coffee) + the stranger. Plans: WIDE / CARD / HER / MAN / HER_R / MAN_R / PHONE insert
    LV = dict(
        A1=[("a1_m", 0.3, [("WAVE", -0.3, 0)]), ("a1_her", 0.25, []), ("a1_m2", 0.3, []), ("a1_her2", 0.25, []), ("a1_m3", 0.35, [("LEAN", -0.3, 0)]),
            ("a1_her3", 1.0, [("FREEZE", -0.95, 0), ("NAMEBOX", -0.6, 0), ("pop", -0.55, 0.6)] + TICKS(0.6)),
            ("a1_nar", 1.0, [("STARE", -0.95, 0), ("cricket", -0.8, 0.45)])],
        A2=[("a2_her", 0.25, []), ("a2_m", 0.3, []), ("a2_her2", 0.3, []), ("a2_m2", 0.3, []), ("a2_her3", 0.3, []),
            ("a2_nar", 1.7, [("SMILE1", -1.65, 0), ("SMILE2", -1.1, 0), ("SMILE3", -0.55, 0), ("squeak", -1.1, 0.3), ("squeak", -0.55, 0.35)] + TICKS(1.2)),
            ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_m", 0.35, [("LOOKUP", -0.3, 0)]), ("b1_her", 0.25, [("HAIR", -0.2, 0)]), ("b1_m2", 0.3, []), ("b1_her2", 0.25, []), ("b1_m3", 0.3, []),
            ("b1_her3", 0.3, []), ("b1_nar", 1.2, [("PLAN", -1.15, 0), ("pop", -1.1, 0.6), ("CHECK", -0.6, 0), ("ding", -0.55, 0.6), ("NOD", -0.3, 0)])],
        B2=[("b2_m", 0.6, [("PHONE", -0.55, 0), ("zip", -0.5, 0.5)]), ("b2_her", 0.25, []),
            ("b2_m2", 1.0, [("SELFIE", -0.95, 0), ("shutter", -0.5, 0.8), ("TYPE", -0.2, 0)]),
            ("b2_her2", 0.6, [("SCREEN", -0.55, 0), ("pop", -0.5, 0.6), ("SUSP", -0.1, 0)]), ("b2_m3", 0.3, [("SWEAT", 0.4, 0)]),
            ("b2_nar", 0.7, [])],
        C1=[("c1_her", 0.3, [("SQUINT", -0.3, 0)]), ("c1_m", 0.3, []), ("c1_her2", 0.3, []), ("c1_m2", 0.35, [("SWEAT", -0.3, 0)]), ("c1_her3", 0.3, []),
            ("c1_m3", 1.2, TICKS(1.2)), ("c1_nar", 0.9, [("ARMS", -0.85, 0), ("whoosh", -0.8, 0.35)]), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0.35, [("CALM", -0.3, 0)]), ("c2_m", 1.6, [("PAUSE", -1.55, 0)] + TICKS(1.2) + [("RELIEF", -0.2, 0), ("deflate", -0.15, 0.4)]),
            ("c2_her2", 0.3, [("SHOCK", -0.3, 0), ("impact_soft", -0.25, 0.6)]), ("c2_m2", 0.3, []), ("c2_her3", 0.3, []), ("c2_m3", 0.3, []),
            ("c2_both", 1.1, [("STAREBOTH", -1.05, 0)] + TICKS(0.9)), ("c2_both_m", -D["c2_both"], []),
            ("c2_m4", 1.6, [("SPLIT", -1.55, 0), ("whoosh", -1.5, 0.6), ("BACK", -0.7, 0), ("whoosh", -0.65, 0.5)]),
            ("c2_her4", 0.3, []), ("c2_nar", 1.1, [("RUN", -1.05, 0), ("zip", -1.0, 0.6), ("BLACK", -0.5, 0)])],
    )
    INTRO = 1.15
elif EPN == "password":   # her room, laptop. Plans: WIDE / HER / SCREEN (full-screen laptop insert) / KEYS (keyboard insert) / CARD
    LV = dict(
        A1=[("a1_her", 0.6, [("TYPE", -0.6, 0)] + [("keys", -0.55 + 0.1 * k, 0.5) for k in range(5)]), ("a1_x", 0.35, [("ENTER", -0.35, 0), ("err", -0.1, 0.7)]),
            ("a1_her2", 0.3, []), ("a1_x2", 0.9, [("TYPE2", -0.9, 0)] + [("keys", -0.85 + 0.1 * k, 0.5) for k in range(5)] + [("err", -0.1, 0.7)]),
            ("a1_her3", 0.25, []), ("a1_nar", 1.0, [("ATTEMPTS", -0.95, 0), ("blink", -0.9, 0.6)])],
        A2=[("a2_x", 0.8, [("FORGOT", -0.75, 0), ("click", -0.7, 0.6)]), ("a2_her", 0.3, []),
            ("a2_x2", 0.9, [("TYPE", -0.85, 0)] + [("keys", -0.8 + 0.1 * k, 0.5) for k in range(5)] + [("send", -0.1, 0.6)]),
            ("a2_her2", 1.8, [("MAIL", -1.75, 0), ("click", -1.7, 0.6), ("LOGIN", -1.2, 0), ("buzz", -1.15, 0.6), ("STARE", -0.6, 0)]),
            ("a2_nar", 0.5, []), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_x", 0.8, [("SMS", -0.75, 0), ("msg", -0.7, 0.8)]), ("b1_her", 0.2, []), ("b1_x2", 0.9, [("CODE", -0.85, 0)] + [("keys", -0.8 + 0.1 * k, 0.5) for k in range(6)] + [("err", -0.1, 0.7)]),
            ("b1_her2", 0.3, []), ("b1_x3", 0.3, []), ("b1_her3", 0.25, []),
            ("b1_nar", 2.2, [("SENT", -2.15, 0), ("ding", -2.1, 0.6), ("TOOMANY", -1.4, 0), ("err", -1.35, 0.7), ("EYES", -0.6, 0)])],
        B2=[("b2_x", 1.3, [("NEXTDAY", -1.25, 0), ("whoosh", -1.2, 0.5)]), ("b2_her", 0.3, []),
            ("b2_x2", 2.0, [("CAPTCHA", -1.95, 0), ("pop", -1.9, 0.6)] + [("click", -1.3 + 0.3 * k, 0.55) for k in range(3)] + [("err", -0.1, 0.7)]),
            ("b2_her2", 0.3, []), ("b2_her3", 1.6, [("SELF9", -1.55, 0), ("pop", -1.5, 0.6), ("STARE", -0.6, 0)]),
            ("b2_nar", 0.7, [])],
        C1=[("c1_x", 0.6, [("NEWPW", -0.55, 0)]), ("c1_her", 0.3, []),
            ("c1_x2", 1.0, [("BANANA", -0.95, 0)] + [("keys", -0.9 + 0.1 * k, 0.5) for k in range(7)] + [("err", -0.1, 0.7)]),
            ("c1_x3", 0.9, [("BANANA2", -0.85, 0)] + [("keys", -0.8 + 0.1 * k, 0.5) for k in range(6)] + [("err", -0.1, 0.7)]),
            ("c1_her2", 0.3, []), ("c1_nar", 1.5, [("ROMAN", -1.45, 0), ("pop", -1.4, 0.6), ("LOOKCAM", -0.7, 0)]),
            ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0.4, [("TYPE", -0.4, 0)]), ("c2_her2", 2.8, [("SAVE", -2.75, 0), ("click", -2.7, 0.6)] + TICKS(1.2) + [("ERROR", -1.3, 0), ("err", -1.25, 0.8), ("FREEZE", -0.5, 0)]),
            ("c2_x", 0.3, []), ("c2_her3", 0.3, []), ("c2_x2", 0.7, [("SILENCE", -0.65, 0)]),
            ("c2_x3", 2.4, [("CAPS", -2.35, 0), ("blink", -2.3, 0.6), ("HEAD", -1.4, 0), ("thud", -1.2, 0.8)] + TICKS(0.6)),
            ("c2_her4", 0.6, [("RISE", -0.55, 0)]), ("c2_nar", 1.0, [("BLACK", -0.9, 0)])],
    )
    INTRO = 1.15
elif EPN == "cantsayno":   # street -> hotel entrance -> reception desk. Plans: WIDE / CARD / HER / MAN / GUEST / PHONE insert / BADGE insert
    LV = dict(
        A1=[("a1_m", 0.3, []), ("a1_her", 0.25, []), ("a1_m2", 0.5, [("BAG1", -0.45, 0), ("thud", -0.2, 0.5)]), ("a1_her2", 0.25, []),
            ("a1_m3", 1.1, [("AWAY", -1.05, 0), ("BACK", -0.4, 0), ("whoosh", -0.4, 0.4)]),
            ("a1_her3", 0.8, [("BAG2", -0.75, 0), ("thud", -0.5, 0.8), ("strain", -0.4, 0.5)]), ("a1_nar", 0.6, [])],
        A2=[("a2_m", 0.4, [("PHONE", -0.35, 0)]), ("a2_her", 0.3, []), ("a2_m2", 0.3, [("POSE1", -0.2, 0)]), ("a2_m3", 0.7, [("LEFT", -0.65, 0)]),
            ("a2_m4", 0.7, [("RIGHT", -0.65, 0), ("shutter", -0.1, 0.7)]),
            ("a2_her2", 1.8, [("COUNTER", -1.75, 0)] + [("shutter", -1.7 + 0.25 * k, 0.5) for k in range(6)] + [("SHAKE", -0.3, 0)]),
            ("a2_m5", 0.3, []), ("a2_nar", 0.5, []), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_m", 0.5, [("HOTEL", -0.45, 0)]), ("b1_her", 0.3, []),
            ("b1_m2", 1.3, [("INSIDE", -1.25, 0), ("whoosh", -1.2, 0.4), ("KEYS", -0.3, 0), ("clank", -0.25, 0.6)]),
            ("b1_her2", 0.3, []), ("b1_m3", 0.25, []), ("b1_nar", 1.6, [("LEAVE", -1.55, 0), ("whoosh", -1.5, 0.4), ("CLOCK", -0.9, 0)] + TICKS(0.9))],
        B2=[("b2_g", 0.5, [("GUEST", -0.45, 0)]), ("b2_her", 0.3, []), ("b2_g2", 0.3, []), ("b2_her2", 0.7, [("LOOKAROUND", -0.65, 0)]),
            ("b2_her3", 1.3, [("RING", -1.25, 0), ("bell", -1.2, 0.7), ("PICKUP", -0.4, 0)]),
            ("b2_nar", 1.2, [("QUEUE", -1.15, 0), ("whoosh", -1.1, 0.5), ("hum", -1.0, 0.45)])],
        C1=[("c1_her", 0.8, [("RETURN", -0.75, 0)]), ("c1_m", 0.3, []), ("c1_her2", 0.4, [("POINT", -0.35, 0)]), ("c1_m2", 0.3, []),
            ("c1_her3", 1.1, [("BADGE1", -1.05, 0), ("pop", -0.6, 0.7)]),
            ("c1_nar", 0.6, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0.6, [("EXIT", -0.55, 0)]), ("c2_m", 0.5, [("STOP", -0.45, 0)]), ("c2_m2", 0.6, [("RELIEF", -0.55, 0)]),
            ("c2_m3", 0.7, [("UNBADGE", -0.65, 0), ("BADGE2", 0.6, 0), ("tada", 0.6, 0.5)]),
            ("c2_her2", 0.6, [("FREEZE", -0.55, 0)]), ("c2_m4", 0.3, [("DOLLAR", 0.8, 0), ("pop", 0.8, 0.6)]),
            ("c2_her3", 2.2, [("LOOK1", -2.15, 0), ("LOOK2", -1.4, 0), ("LOOK3", -0.7, 0)] + TICKS(1.8)),
            ("c2_m6", 0.4, []), ("c2_her4", 0.3, []),
            ("c2_m5", 0.8, [("RESPECT", -0.75, 0), ("CEO", 1.2, 0), ("tada", 1.2, 0.6)]),
            ("c2_her5", 0.4, []), ("c2_nar", 0.8, [("BLACK", -0.75, 0)])],
    )
    INTRO = 1.15
elif EPN == "rich":   # parking outside a cafe; him (sunglasses) + his friend, the rental car behind them. Plans: WIDE / CARD / RICH / OWNER / reactions / KEY, WATCH, PHONE, PLATE, DOC inserts
    LV = dict(
        A1=[("a1_f", 0.22, []), ("a1_m", 0.2, []), ("a1_f2", 0.22, []), ("a1_m2", 0.2, []),
            ("a1_nar", 2.1, [("PRESS", -2.05, 0), ("click", -2.0, 0.6), ("ALARM", -1.85, 0), ("alarm", -1.85, 0.5), ("HIDE", -0.75, 0), ("zip", -0.7, 0.4)])],
        A2=[("a2_f", 0.5, [("WATCH", -0.45, 0)]), ("a2_m", 0.2, []), ("a2_f2", 0.22, []), ("a2_m2", 0.2, []),
            ("a2_m3", 4.3, [("CLOSE", -4.25, 0), ("blink", -4.1, 0.6), ("BT", -2.9, 0), ("err", -2.85, 0.5), ("TOY", -1.6, 0), ("toy", -1.55, 0.7)]),
            ("a2_nar", 0.5, []), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_f", 0.22, []), ("b1_m", 0.2, []), ("b1_f2", 0.22, []), ("b1_m2", 0.2, []),
            ("b1_mom", 2.4, [("RING", -2.35, 0), ("ring", -2.3, 0.7), ("ANSWER", -0.6, 0)]), ("b1_m3", 0.2, []),
            ("b1_nar", 0.9, [("STARE", -0.85, 0)])],
        B2=[("b2_f", 0.22, []), ("b2_m", 0.2, []), ("b2_f2", 0.22, []), ("b2_m2", 0.22, []),
            ("b2_f3", 3.2, [("NOTIF", -3.15, 0), ("msg", -3.1, 0.8), ("SWIPE", -0.6, 0), ("zip", -0.55, 0.5)]), ("b2_m3", 0.2, []),
            ("b2_nar", 0.6, [])],
        C1=[("c1_f", 0.4, [("SQUINT", -0.35, 0)]), ("c1_m", 0.22, [("STRAIGHT", -0.3, 0)]), ("c1_f2", 0.22, []), ("c1_f3", 0.8, [("RELIEF", -0.75, 0), ("PHONE", -0.3, 0)]),
            ("c1_nar", 3.1, [("PLATE", -3.05, 0), ("pop", -3.0, 0.6), ("FREEZE", -0.75, 0), ("impact_soft", -0.7, 0.5)] + TICKS(0.6)), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_f", 0.4, [("TURN", -0.35, 0)]), ("c2_m", 0.22, []), ("c2_f2", 0.8, [("PAUSE", -0.75, 0)] + TICKS(0.6)), ("c2_m2", 0.6, [("FREEZE", -0.55, 0), ("impact_soft", -0.5, 0.6)]),
            ("c2_f3", 0.22, []), ("c2_m3", 3.7, [("DOC", -3.65, 0), ("pop", -3.6, 0.6), ("SHADES", -0.55, 0)]), ("c2_f4", 0.22, []), ("c2_m4", 0.22, []),
            ("c2_f5", 1.0, [("HAND", -0.5, 0)] + TICKS(0.6)),
            ("c2_p", 3.3, [("KEYS", -3.25, 0), ("clank", -3.2, 0.6), ("DRIVE", -2.5, 0), ("vroom", -2.5, 0.8), ("PASS", -1.0, 0)]),
            ("c2_m5", 0.45, [("LOOK", -0.45, 0)]), ("c2_nar", 1.7, [("FOB", -1.6, 0), ("click", -1.55, 0.6), ("chirp", -1.4, 0.7), ("BLACK", -0.6, 0)])],
    )
    INTRO = 1.15
elif EPN == "busy":   # open-plan office; him at his desk (monitor, paper piles, hourglass), the boss standing. Plans: WIDE / CARD / WORKER / BOSS / MONITOR, TODO, GLASS inserts; C2 ends on a seminar stage
    LV = dict(
        A1=[("a1_b", 0.22, []), ("a1_w", 0.2, []), ("a1_b2", 0.22, []), ("a1_w2", 0.2, []),
            ("a1_nar", 1.7, [("NOD", -1.65, 0), ("SHUFFLE", -1.2, 0)] + [("feather", -1.15 + 0.3 * k, 0.45) for k in range(4)])],
        A2=[("a2_b", 0.6, [("BACK", -0.55, 0)]), ("a2_w", 0.2, []), ("a2_b2", 0.22, []), ("a2_w2", 0.2, []),
            ("a2_nar", 3.1, [("LEAVE", -3.05, 0), ("SIGH", -2.4, 0), ("FLIP", -1.85, 0), ("pop", -1.8, 0.6)]), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_b", 0.5, [("PILE", -0.45, 0)]), ("b1_w", 0.2, []), ("b1_b2", 0.22, []), ("b1_w2", 0.2, [("HUG", -0.2, 0)]),
            ("b1_nar", 4.4, [("DROP", -4.35, 0), ("feather", -4.3, 0.6), ("TODO", -3.75, 0), ("pop", -3.7, 0.6), ("NOTICE", -0.5, 0)])],
        B2=[("b2_b", 0.4, []), ("b2_w", 0.2, []), ("b2_b2", 2.6, [("OPEN", -2.55, 0), ("click", -2.5, 0.6), ("REPORT", -2.15, 0), ("pop", -2.1, 0.6)]), ("b2_w2", 0.22, []),
            ("b2_nar", 1.3, [("MOUSE", -1.25, 0), ("SWEAT", -0.6, 0)])],
        C1=[("c1_b", 2.8, [("SCROLL", -2.75, 0)] + [("click", -2.7 + 0.45 * k, 0.4) for k in range(5)]), ("c1_w", 0.22, []), ("c1_b2", 0.22, []), ("c1_w2", 0.22, []),
            ("c1_nar", 1.3, [("STARE", -1.25, 0)] + TICKS(1.2)), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_b", 0.4, [("ARMS", -0.35, 0)]), ("c2_w", 0.5, [("STAND", -0.45, 0)]), ("c2_b2", 1.6, [("THINK", -1.55, 0)] + TICKS(1.2)), ("c2_b3", 0.22, []),
            ("c2_w2", 0.22, [("HOPE", -0.25, 0)]), ("c2_b4", 0.22, []),
            ("c2_b5", 1.5, [("STAGE", -1.45, 0), ("whoosh", -1.4, 0.6), ("impact", -1.3, 0.6)]),
            ("c2_w3", 1.8, [("CLAP", -1.75, 0), ("clapclap", -1.7, 0.7), ("clapclap", -1.1, 0.6), ("SILENT", -0.35, 0)]), ("c2_nar", 1.0, [("BLACK", -0.9, 0)])],
    )
    INTRO = 1.15
elif EPN == "lunch":   # office kitchenette: the fridge (open), her lunch box with the ANNA label, him with a fork. Plans: WIDE / CARD / HER / DAN, LABEL insert; C2 ends on a black card
    LV = dict(
        A1=[("a1_h", 0.22, []), ("a1_c", 0.22, [("OFFER", 1.5, 0), ("pop", 1.55, 0.5)]), ("a1_nar", 1.0, [])],
        A2=[("a2_h", 0.22, []), ("a2_c", 0.22, []), ("a2_nar", 1.0, [("SHRUG", -0.95, 0), ("buzz", 0.95, 0.5)]), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_h", 0.22, []), ("b1_c", 0.22, []), ("b1_h2", 0.45, [("LABEL", -0.05, 0), ("pop", -0.05, 0.6)]), ("b1_c2", 0.5, []), ("b1_nar", 1.0, [])],
        B2=[("b2_h", 0.22, []), ("b2_c", 0.22, [("MUG", 1.1, 0), ("pop", 1.15, 0.5)]), ("b2_nar", 1.2, [("SIP", -1.1, 0), ("gulp", -1.0, 0.7)]), ("b2_tip", 0.2, [("ding", 0.05, 0.6)])],
        C1=[("c1_h", 0.22, []), ("c1_c", 0.22, []), ("c1_nar", 1.4, [("STARE", -1.35, 0)] + TICKS(1.2)), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_h", 0.4, []), ("c2_c", 2.6, [("THINK", -2.55, 0)] + TICKS(2.4) + [("OPEN", 2.0, 0), ("creak", 2.05, 0.6)]),
            ("c2_h2", 0.5, []), ("c2_h3", 1.5, [("STINK", -1.45, 0), ("deflate", -1.4, 0.6), ("rimshot", ("e", 0.35), 0.9)]), ("c2_nar", 1.2, [("BLACK", -1.1, 0)])],
    )
    INTRO = 1.15
elif EPN == "togo":   # coffee shop: counter with the espresso machine, barista behind it, her in front. Plans: WIDE / CARD / HER / BAR, CUP insert; C2 ends on a black card
    LV = dict(
        A1=[("a1_h", 0.22, []), ("a1_b", 0.22, [("SHOO", 1.6, 0), ("whoosh", 1.65, 0.5)]), ("a1_nar", 1.0, [])],
        A2=[("a2_h", 0.22, []), ("a2_b", 0.22, [("FLATTER", 0.9, 0), ("pop", 0.95, 0.5)]), ("a2_nar", 1.0, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_h", 0.22, []), ("b1_b", 0.22, []), ("b1_h2", 0.4, [("CUP", ("e", 0.15), 0), ("pop", ("e", 0.15), 0.6)]), ("b1_nar", 1.8, [])],
        B2=[("b2_h", 0.22, []), ("b2_b", 0.22, [("PRICE", 1.4, 0), ("register", 1.45, 0.7)]), ("b2_h2", 0.3, []), ("b2_nar", 1.0, []), ("b2_tip", 0.2, [("ding", 0.05, 0.6)])],
        C1=[("c1_h", 0.22, []), ("c1_b", 0.22, [("CUPS", 1.0, 0), ("plop", 1.05, 0.7)]), ("c1_h2", 0.2, []), ("c1_nar", 1.2, []), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_h", 0.4, []), ("c2_b", 2.6, [("THINK", -2.55, 0)] + TICKS(2.4) + [("TRAY", 0.6, 0), ("clank", 0.65, 0.8)]), ("c2_b2", 0.3, []),
            ("c2_h2", 1.3, [("STARE", -1.25, 0), ("rimshot", ("e", 0.35), 0.9)]), ("c2_nar", 1.2, [("BLACK", -1.1, 0)])],
    )
    INTRO = 1.15
elif EPN == "avoidparty":   # her living room (sofa, blanket, phone) + the friend at her party (phone call), then her front door. Plans: WIDE / CARD / HER / PAL / DOOR / PHONE, IMAGINE, DOC inserts
    LV = dict(
        A1=[("a1_p", 0.7, [("RING", -0.65, 0), ("ring", -0.6, 0.6)]), ("a1_h", 0.2, []), ("a1_p2", 0.22, []), ("a1_h2", 0.22, [("YAWN", -0.25, 0)]), ("a1_p3", 0.22, []),
            ("a1_h3", 1.3, [("BED", -1.25, 0), ("sparkle", -1.2, 0.6)]), ("a1_nar", 0.6, [])],
        A2=[("a2_p", 0.7, [("RING", -0.65, 0), ("ring", -0.6, 0.6)]), ("a2_h", 0.2, []), ("a2_p2", 0.22, []), ("a2_h2", 0.9, [("LOOKDOWN", -0.85, 0)]), ("a2_p3", 0.22, []),
            ("a2_nar", 2.9, [("DRESS", -2.85, 0), ("msg", -2.8, 0.8), ("EYES", -0.6, 0)]), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_h", 0.22, []), ("b1_p", 0.22, []), ("b1_h2", 0.22, []), ("b1_p2", 0.22, []),
            ("b1_nar", 2.8, [("IMAGINE", -2.75, 0), ("whoosh", -2.7, 0.5)])],
        B2=[("b2_h", 0.5, [("cough", -0.45, 0.6)]), ("b2_p", 0.22, []), ("b2_h2", 0.22, []), ("b2_p2", 0.22, []), ("b2_h3", 0.22, []), ("b2_p3", 0.22, []),
            ("b2_nar", 1.1, [("FREEZE", -1.05, 0), ("impact_soft", -1.0, 0.5)] + TICKS(0.6))],
        C1=[("c1_h", 0.22, []), ("c1_p", 0.22, []), ("c1_h2", 0.22, [("SMILE", -0.25, 0)]), ("c1_p2", 0.22, []), ("c1_h3", 0.22, [("TENSE", -0.3, 0)]),
            ("c1_nar", 2.7, [("ENDED", -2.65, 0), ("blink", -2.6, 0.6), ("BELL", -1.0, 0), ("doorbell", -1.0, 0.8)]), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_p", 1.5, [("OPEN", -1.45, 0), ("creak", -1.4, 0.7), ("cheer", -1.0, 0.5)]), ("c2_h", 0.22, []), ("c2_p2", 0.22, []),
            ("c2_h2", 1.9, [("GUESTS", -1.85, 0), ("whoosh", -1.8, 0.4), ("thud", -1.3, 0.5), ("pop", -0.9, 0.5)]),
            ("c2_g", 0.4, [("PAPER", -0.35, 0)]), ("c2_h3", 2.9, [("DOC", -2.85, 0), ("pop", -2.8, 0.6)]), ("c2_p3", 0.22, []),
            ("c2_h4", 2.7, [("CLOSE", -2.65, 0), ("thud", -2.0, 0.8), ("OUTSIDE", -1.7, 0), ("OKS", -1.1, 0), ("ding", -1.05, 0.5), ("ding", -0.75, 0.5)]),
            ("c2_nar", 1.0, [("BLACK", -0.9, 0)])],
    )
    INTRO = 1.15
elif EPN == "tour":   # tourist square (hook, A1, A2, C2) -> old library with a statue (B1, B2) -> street (C1). Plans: WIDE / CARD / HER / TST / ... + MAP, BLACK inserts
    LV = dict(
        A1=[("a1_t", 0.5, []), ("a1_h", 0.25, []), ("a1_t2", 0.25, []), ("a1_h2", 2.4, [("MAP", -2.35, 0), ("pop", -2.3, 0.5), ("TURN", -0.7, 0), ("whoosh", -0.7, 0.4)]),
            ("a1_t3", 0.25, [("FOLLOW", ("e", -0.1), 0)]), ("a1_nar", 0.9, [])],
        A2=[("a2_t", 0.7, [("ARRIVE", -0.65, 0), ("whoosh", -0.6, 0.3)]), ("a2_t2", 0.25, []), ("a2_h", 0.2, []), ("a2_t3", 0.2, []), ("a2_h2", 0.3, []),
            ("a2_nar", 1.4, [("GROW", -1.35, 0), ("pop", -1.3, 0.5), ("pop", -1.0, 0.5), ("pop", -0.7, 0.5)]), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_t", 0.8, [("LIB", -0.75, 0), ("thud", -0.7, 0.4), ("thud", -0.4, 0.4)]), ("b1_h", 0.25, []), ("b1_t2", 0.2, []), ("b1_h2", 0.25, [("NOTES", ("e", 0.0), 0), ("click", ("e", 0.1), 0.5), ("click", ("e", 0.3), 0.5), ("click", ("e", 0.5), 0.5)]),
            ("b1_t3", 0.9, []), ("b1_h3", 0.35, [("SWEAT", 0.3, 0)]), ("b1_nar", 0.8, [])],
        B2=[("b2_t", 0.8, [("STATUE", -0.75, 0)]), ("b2_h", 0.25, []), ("b2_t2", 0.2, []), ("b2_h2", 1.2, [("LOOK", -1.15, 0), ("brow", -1.1, 0.5), ("sparkle", -0.55, 0.5)]),
            ("b2_nar", 1.3, [("CLAP", -1.25, 0), ("clapclap", -1.25, 0.8), ("cheer", -1.2, 0.4)])],
        C1=[("c1_t", 0.8, [("STREET", -0.75, 0)]), ("c1_h", 0.25, []), ("c1_t2", 0.2, []), ("c1_h2", 0.25, []), ("c1_t3", 0.2, []), ("c1_t4", 0.35, [("TURN", -0.3, 0)]),
            ("c1_nar", 1.5, [("CLAP", -1.45, 0), ("clapclap", -1.45, 0.8), ("cheer", -1.4, 0.5)]), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_h", 1.0, [("BACK", -0.95, 0)]), ("c2_g", 2.6, [("QUIET", -2.55, 0)] + TICKS(1.8) + [("GUIDE", -0.7, 0), ("whoosh", -0.7, 0.4)]), ("c2_h2", 0.25, []), ("c2_g2", 0.25, []), ("c2_h3", 0.2, []), ("c2_g3", 0.35, []),
            ("c2_h4", 0.2, [("impact_soft", 0.0, 0.7)]), ("c2_g4", 0.3, [("BADGE", ("e", 0.15), 0), ("pop", ("e", 0.15), 0.6)]),
            ("c2_c", 0.7, [("cheer", -0.1, 0.8)]), ("c2_t", 0.8, [("RUN", -0.75, 0), ("whoosh", -0.7, 0.5), ("thud", -0.4, 0.5), ("thud", -0.1, 0.5)]), ("c2_h5", 0.2, []),
            ("c2_nar", 1.4, [("BLACK", -1.3, 0)])],
    )
    INTRO = 1.15
elif EPN == "splitbill":   # restaurant table for four (the 4th seat has the lobster plate from the start). Plans: WIDE / CARD / singles + BILL, CALC, FLASH, RECEIPT inserts
    LV = dict(
        A1=[("a1_w", 0.6, [("BILLIN", -0.55, 0), ("pop", -0.5, 0.5)]), ("a1_f", 0.25, []), ("a1_h", 0.2, []), ("a1_f2", 0.2, []), ("a1_h2", 0.2, []),
            ("a1_h3", 1.5, [("TOTAL", -1.45, 0), ("register", -1.4, 0.7)]), ("a1_nar", 0.5, [])],
        A2=[("a2_h", 0.6, []), ("a2_f", 0.2, [("P2", 0.0, 0), ("pop", 0.1, 0.4)]), ("a2_f2", 0.2, [("P3", 0.0, 0), ("pop", 0.1, 0.4)]), ("a2_h2", 0.2, [("P4", -0.1, 0)]), ("a2_f3", 0.2, []),
            ("a2_nar", 0.6, []), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_f", 0.6, []), ("b1_h", 0.2, []), ("b1_f2", 0.2, []), ("b1_h2", 0.2, []),
            ("b1_f3", 2.4, [("CALC", -2.35, 0), ("click", -2.3, 0.5), ("click", -2.0, 0.5), ("click", -1.7, 0.5), ("click", -1.4, 0.5), ("click", -1.1, 0.5), ("ding", -0.6, 0.5), ("LOOKS", ("e", 0.0), 0), ("brow", ("e", 0.1), 0.6)]),
            ("b1_nar", 1.7, [])],
        B2=[("b2_w", 0.9, [("WAITER", -0.85, 0), ("thud", -0.8, 0.3), ("thud", -0.5, 0.3)]), ("b2_h", 0.25, []), ("b2_w2", 0.2, []), ("b2_all", 0.2, []), ("b2_w3", 0.3, []), ("b2_h2", 0.2, []), ("b2_w4", 0.2, []),
            ("b2_h3", 0.2, []), ("b2_nar", 1.2, [("FREEZE", -1.15, 0), ("impact_soft", -1.1, 0.5)] + TICKS(0.6))],
        C1=[("c1_h", 0.5, []), ("c1_w", 3.2, [("FLASH", -3.15, 0), ("whoosh", -3.1, 0.5), ("chime", -3.05, 0.5), ("SIT", -1.2, 0), ("pop", -1.2, 0.5), ("BACK", -0.15, 0), ("whoosh", -0.15, 0.4)]),
            ("c1_f", 0.2, []), ("c1_h2", 0.2, []), ("c1_w2", 0.25, []), ("c1_h3", 0.2, []), ("c1_nar", 0.8, []), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_h", 0.6, [("impact_soft", -0.3, 0.4)]), ("c2_w", 0.5, []), ("c2_h2", 0.2, []), ("c2_w2", 0.5, []), ("c2_h3", 0.3, []),
            ("c2_w3", 1.3, [("scratch", -1.25, 0.5)] + TICKS(1.2)), ("c2_h4", 1.9, [("LOB", -1.85, 0), ("register", -1.8, 0.8), ("gasp", -1.4, 0.5)]),
            ("c2_w4", 0.25, []), ("c2_h5", 0.2, []), ("c2_w5", 0.3, [("APRON", 1.1, 0), ("zip", 1.1, 0.5)]),
            ("c2_w6", 0.5, [("SIT", -0.45, 0), ("thud", -0.4, 0.6)]), ("c2_all", 0.25, [("impact_soft", -0.05, 0.7)]), ("c2_nar", 1.2, [])],
    )
    INTRO = 1.15
elif EPN == "photo":   # city park with a fountain; her + friend with the phone + THE pigeon. Photos are full-screen close-ups. Plans: WIDE / CARD / singles + PHOTO, PHONE inserts
    LV = dict(
        A1=[("a1_f", 0.6, []), ("a1_h", 0.2, [("POSE", 0.3, 0)]), ("a1_f2", 0.2, []), ("a1_h2", 1.7, [("SNAP", -1.65, 0), ("shutter", -1.6, 0.9), ("PHOTO", -1.15, 0)]),
            ("a1_f3", 0.4, []), ("a1_nar", 0.8, [])],
        A2=[("a2_h", 0.6, []), ("a2_f", 0.2, [("MV1", ("e", 0.3), 0)]), ("a2_f2", 0.9, [("MV2", ("e", 0.3), 0)]), ("a2_f3", 0.9, []),
            ("a2_h2", 1.8, [("SNAP", -1.75, 0), ("shutter", -1.7, 0.9), ("PHOTO", -1.3, 0)]), ("a2_f4", 0.3, []), ("a2_nar", 0.8, []), ("a2_tip", 0.2, [("ding", 0.05, 0.6)])],
        B1=[("b1_h", 0.6, []), ("b1_f", 0.2, []), ("b1_h2", 2.9, [("BELOW", -2.85, 0), ("shutter", -2.6, 0.6), ("ABOVE", -1.95, 0), ("shutter", -1.7, 0.6), ("LIE", -1.0, 0), ("thud", -1.0, 0.6)]), ("b1_f2", 0.2, []),
            ("b1_h3", 1.7, [("SNAP", -1.65, 0), ("shutter", -1.6, 0.9), ("PHOTO", -1.2, 0)]), ("b1_nar", 0.8, [])],
        B2=[("b2_f", 0.6, []), ("b2_h", 0.2, []), ("b2_f2", 0.2, [("POSE", ("e", 0.1), 0), ("sparkle", ("e", 0.3), 0.5)]),
            ("b2_h2", 2.3, [("PIGEON", -2.25, 0), ("coo", -2.2, 0.8), ("feather", -1.9, 0.6), ("SNAP", -1.6, 0), ("shutter", -1.55, 0.9), ("PHOTO", -1.15, 0)]), ("b2_f3", 0.25, []), ("b2_nar", 0.8, [])],
        C1=[("c1_h", 0.6, []), ("c1_f", 0.2, []), ("c1_h2", 0.2, []), ("c1_f2", 0.3, [("LOOKPH", ("e", 0.0), 0)]),
            ("c1_h3", 2.2, [("LIKES", -2.15, 0), ("msg", -2.1, 0.7), ("pop", -1.4, 0.5), ("pop", -1.0, 0.5)]), ("c1_f3", 0.25, []), ("c1_nar", 0.8, []), ("c1_tip", 0.2, [("ding", 0.05, 0.6)])],
        C2=[("c2_f", 0.5, [("VIEWS", -0.45, 0), ("msg", -0.4, 0.6)]), ("c2_h", 0.2, []), ("c2_f2", 0.2, []),
            ("c2_h2", 2.2, [("FAMOUS", -2.15, 0), ("msg", -2.1, 0.7), ("pop", -1.4, 0.5)]), ("c2_f3", 0.25, []), ("c2_h3", 1.7, [("STRUT", -1.65, 0), ("coo", -1.6, 0.6)]),
            ("c2_m", 0.4, [("MAN", -0.35, 0)]), ("c2_f4", 0.2, []), ("c2_m2", 0.2, []), ("c2_h4", 0.2, []),
            ("c2_h5", 2.6, [("GLASSES", -2.55, 0), ("pop", -2.5, 0.6), ("shutter", -2.2, 0.6), ("shutter", -1.95, 0.6), ("shutter", -1.7, 0.6), ("shutter", -1.5, 0.6), ("YEAR", -1.5, 0), ("tada", -1.5, 0.5)]),
            ("c2_f5", 0.5, []), ("c2_nar", 2.2, [("LOOK", -2.15, 0), ("scratch", -1.4, 0.5), ("BLACK", -0.9, 0)])],
    )
    INTRO = 1.15
elif EPN == "repay":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("COCKTAIL", ("e", -1.0), 0), ("chime", ("e", -1.0), 0.6)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("POSTCARD", ("e", 0.1), 0), ("ding", ("e", 0.1), 0.6)]), ("a2_nar", 1.2, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("JETSKI", ("e", -0.3), 0), ("whoosh", ("e", -0.3), 0.8), ("riser_short", ("e", -0.2), 0.5)]), ("b1_nar", 1.0, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("STATIC", ("e", -0.8), 0), ("scratch", ("e", -0.7), 0.5), ("powerdown", ("e", 0.1), 0.6)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("CARD", ("e", 0.0), 0), ("register", ("e", 0.0), 0.7)]), ("c1_nar", 1.2, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_her2", 0.5, [("CLOSED", ("e", -0.4), 0), ("stamp", ("e", -0.4), 0.8), ("rimshot", ("e", 0.4), 0.9)]), ("c2_nar", 1.1, [])],
    )
    INTRO = 1.15
elif EPN == "dishes":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("PIZZA", ("e", -0.4), 0), ("plop", ("e", -0.4), 0.7)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("NOTE", ("e", 0.0), 0), ("pop", ("e", 0.0), 0.6)]), ("a2_nar", 1.0, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("TV", ("e", -0.3), 0), ("blink", ("e", -0.3), 0.6)]), ("b1_nar", 1.0, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("ROTA", ("e", 0.0), 0), ("pop", ("e", 0.0), 0.6)]), ("b2_nar", 1.2, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("PAPER", ("e", 0.0), 0), ("thud", ("e", 0.0), 0.7), ("clank", ("e", 0.15), 0.6)]), ("c1_nar", 1.1, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("WASH", ("e", 0.0), 0), ("squeak", ("e", 0.1), 0.6), ("squeak", ("e", 0.4), 0.6)]), ("c2_x2", 1.0, [("SIP", ("e", -0.2), 0), ("gulp", ("e", -0.2), 0.6), ("rimshot", ("e", 0.5), 0.9)]), ("c2_nar", 1.2, [])],
    )
    INTRO = 1.15
elif EPN == "loan":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.3, []), ("a1_x2", 0.3, [("TAG", 0.6, 0), ("register", 0.6, 0.7)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("FISH", 1.1, 0), ("ding", 1.1, 0.6)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("COIN", ("e", -0.9), 0), ("drop", ("e", -0.6), 0.8), ("boom", ("e", 0.1), 0.6)]), ("b1_nar", 0.8, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("BOW", ("e", -0.6), 0), ("sparkle", ("e", -0.6), 0.7)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, [("LIST", 1.4, 0), ("whoosh", 1.4, 0.6), ("thud", 2.2, 0.8)]), ("c1_x", 0.5, [("rimshot", ("e", 0.15), 0.9)]), ("c1_nar", 0.8, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4)), ("c2_x2", 0.6, [("IOU", ("e", -0.6), 0), ("pop", ("e", -0.6), 0.7), ("rimshot", ("e", 0.2), 0.9)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "smell":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("PAT", ("e", -0.8), 0), ("whoosh", ("e", -0.7), 0.4)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("SPRAY", ("e", -0.5), 0), ("whoosh", ("e", -0.5), 0.6), ("pop", ("e", -0.2), 0.4)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("ARMS", ("e", 0.0), 0), ("whoosh", ("e", 0.05), 0.9), ("whoosh", ("e", 0.35), 0.7)]), ("b1_nar", 1.1, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("BADGE", 1.2, 0), ("ding", 1.2, 0.6), ("FAN", ("e", 0.1), 0), ("powerdown", ("e", 0.1), 0.7)]), ("b2_nar", 0.9, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.4, [("WILT", ("e", 0.2), 0), ("thud", ("e", 0.6), 0.7), ("rimshot", ("e", 0.8), 0.9)]), ("c1_nar", 1.1, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("OPEN", ("e", 0.1), 0), ("lift_ding", ("e", 0.1), 0.8), ("doors", ("e", 0.2), 0.7)]), ("c2_y", 1.0, [("ENTER", -0.7, 0), ("thud", -0.5, 0.6), ("CLOSE", ("e", 0.2), 0), ("doors", ("e", 0.2), 0.7)]), ("c2_x2", 0.5, [("rimshot", ("e", 0.15), 0.9)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "guest":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("COFFEE", ("e", -0.6), 0), ("plop", ("e", -0.6), 0.6)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("GAME", ("e", -0.5), 0), ("clank", ("e", -0.5), 0.5)]), ("a2_nar", 0.8, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("ALARM", ("e", -0.5), 0), ("ding", ("e", -0.5), 0.6), ("SLIPPERS", ("e", 0.2), 0), ("pop", ("e", 0.2), 0.5)]), ("b1_nar", 0.9, [])],
        B2=[("b2_her", 0, [("COAT", 0.0, 0)]), ("b2_x", 0.3, [("LIE", ("e", -0.3), 0), ("plop", ("e", -0.2), 0.6)]), ("b2_nar", 0.8, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.4, [("BRUSH", ("e", -0.7), 0), ("pop", ("e", -0.7), 0.6), ("rimshot", ("e", 0.3), 0.9)]), ("c1_nar", 0.9, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, [("SUN", 0.5, 0), ("chime", 0.5, 0.5)]), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("DOOR", ("e", 0.3), 0), ("creak", ("e", 0.3), 0.8)]), ("c2_y", 1.0, [("gasp", -0.4, 0.5)]), ("c2_x2", 0.35, [("rimshot", ("e", 0.15), 0.9)]), ("c2_nar", 0.9, [])],
    )
    INTRO = 1.15
elif EPN == "cancel":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("MAT", ("e", -0.8), 0), ("whoosh", ("e", -0.8), 0.6), ("thud", ("e", -0.5), 0.5)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 1.2, [("DEL", -1.0, 0)] + [("tick", -1.0 + 0.12 * k, 0.7) for k in range(6)] + [("WINK", -0.3, 0), ("blink", -0.3, 0.6), ("RACK", ("e", -0.5), 0), ("clank", ("e", -0.4), 0.8)]), ("a2_nar", 0.6, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("BRICK", ("e", -0.9), 0), ("thud", ("e", -0.9), 0.8)]), ("b1_x2", 0.4, [("VISITS", ("e", 0.1), 0), ("ding", ("e", 0.1), 0.6)]), ("b1_nar", 0.7, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("TREAD", ("e", -0.4), 0), ("strain", ("e", -0.3), 0.8), ("thud", ("e", 0.5), 0.8)]), ("b2_nar", 1.0, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.5, [("CRY", -0.2, 0), ("deflate", -0.1, 0.5)]), ("c1_nar", 1.0, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("CANCEL", ("e", 0.1), 0), ("tada", ("e", 0.1), 0.8), ("ding", ("e", 0.5), 0.6)]), ("c2_x2", 1.6, [("FREE", ("e", 0.05), 0), ("ding", ("e", 0.05), 0.6)]), ("c2_b", 0.5, [("BACK", -0.45, 0), ("thud", -0.45, 0.8), ("creak", -0.4, 0.6), ("VISITS2", ("e", 0.1), 0), ("rimshot", ("e", 0.2), 0.9)]), ("c2_nar", 1.0, [])],
    )
    INTRO = 1.15
elif EPN == "courier":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("PHOTO1", ("e", -0.6), 0), ("ding", ("e", -0.6), 0.6)]), ("a1_x2", 0.3, [("STAR", ("e", 0.1), 0), ("sparkle", ("e", 0.1), 0.5)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("PHOTO2", ("e", 0.1), 0), ("ding", ("e", 0.1), 0.6), ("bark", ("e", 0.4), 0.6)]), ("a2_nar", 1.0, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("PHOTO3", ("e", 0.05), 0), ("ding", ("e", 0.05), 0.6)]), ("b1_nar", 1.0, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("PHOTO4", ("e", 0.05), 0), ("plop", ("e", 0.05), 0.6)]), ("b2_nar", 1.0, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.3, [("PHOTO5", ("e", 0.05), 0), ("ding", ("e", 0.05), 0.6)]), ("c1_x2", 1.0, [("GRANNY", -0.4, 0), ("gasp", -0.3, 0.6)]), ("c1_nar", 0.8, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("SLIDE", ("e", 0.3), 0), ("whoosh", ("e", 0.35), 0.5), ("DROP", ("e", 1.0), 0), ("thud", ("e", 1.0), 0.9)]), ("c2_her2", 1.7, [("TROPHY", ("e", 0.15), 0), ("tada", ("e", 0.15), 0.8), ("rimshot", ("e", 0.6), 0.9)]), ("c2_nar", 1.3, [])],
    )
    INTRO = 1.15
elif EPN == "raise":
    LV = dict(
        A1=[("a1_her", 0, []), ("a1_x", 0.3, [("COIN", ("e", -0.2), 0), ("ding", ("e", -0.1), 0.6)]), ("a1_x2", 0.2, [("JAR", ("e", 0.2), 0), ("chime", ("e", 0.25), 0.6)]), ("a1_nar", 0.8, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("SHRED", 1.0, 0), ("clipper", 1.0, 0.5), ("PLATE", ("e", -0.6), 0), ("tada", ("e", -0.5), 0.7)]), ("a2_x2", 0.15, [("CONFETTI", 0.0, 0), ("pop", 0.0, 0.8), ("sparkle", 0.1, 0.6)]), ("a2_nar", 0.6, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("FEEL", ("e", 0.1), 0), ("whoosh", ("e", 0.1), 0.6)] + [("tick", ("e", 0.3 + 0.18 * k), 0.5) for k in range(12)]), ("b1_x2", 2.7, [("SNAP", -0.3, 0), ("pop", -0.3, 0.8)]), ("b1_nar", 0.6, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("DUMP", ("e", -0.7), 0), ("thud", ("e", -0.6), 0.9), ("clank", ("e", -0.35), 0.7), ("thud", ("e", -0.1), 0.8)]), ("b2_x2", 0.35, [("DOG", -0.2, 0), ("bark", 0.0, 0.7), ("HEELS", ("e", 0.15), 0)] + [("tick", ("e", 0.15 + 0.22 * k), 0.8) for k in range(4)] + [("creak", ("e", 1.1), 0.5)]), ("b2_nar", 1.5, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, [("CHART", 0.6, 0), ("pop", 0.6, 0.6)]), ("c1_x", 1.0, [("brow", -0.6, 0.6)]), ("c1_x2", 0.2, [("CACTUS", 0.0, 0), ("sparkle", 0.0, 0.6), ("GROWL", ("e", 0.15), 0), ("rimshot", ("e", 0.3), 0.8)]), ("c1_nar", 1.0, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 0, []), ("c2_x", 2.6, [("scratch", -2.5, 0.6)] + TICKS(2.4) + [("RISE", ("e", 0.3), 0), ("strain", ("e", 0.35), 0.8), ("riser_short", ("e", 0.4), 0.6), ("CEIL", ("e", 1.9), 0), ("impact", ("e", 1.9), 0.9)]), ("c2_ceo", 2.4, []), ("c2_her2", 0.35, []), ("c2_ceo2", 0.35, [("register", ("e", 0.05), 0.8)]), ("c2_x2", 0.5, [("DOWN", -0.3, 0), ("whoosh", -0.3, 0.5), ("rimshot", ("e", 0.15), 0.9)]), ("c2_nar", 1.0, [])],
    )
    INTRO = 1.15
elif EPN == "gift":
    LV = dict(
        A1=[("a1_x", 0, []), ("a1_her", 0.35, []), ("a1_x2", 0.3, [("GROW", ("e", -0.9), 0), ("whoosh", ("e", -0.9), 0.6), ("sparkle", ("e", -0.6), 0.6)]), ("a1_nar", 0.7, [])],
        A2=[("a2_her", 0, []), ("a2_x", 0.3, [("HAT", ("e", -0.7), 0), ("pop", ("e", -0.7), 0.7)]), ("a2_nar", 0.6, [("buzz", 0.95, 0.5)]), ("a2_tip", 0.25, [("ding", 0.05, 0.6)])],
        B1=[("b1_her", 0, []), ("b1_x", 0.3, [("WARDROBE", ("e", 0.05), 0), ("creak", ("e", 0.0), 0.7), ("impact", ("e", 0.15), 0.6)]), ("b1_x2", 0.9, []), ("b1_nar", 0.6, [])],
        B2=[("b2_her", 0, []), ("b2_x", 0.3, [("DOG", ("e", -0.25), 0), ("bark", ("e", -0.05), 0.8), ("bark", ("e", 0.35), 0.7), ("CAT", ("e", 0.6), 0), ("pop", ("e", 0.6), 0.5)]), ("b2_nar", 1.2, []), ("b2_tip", 0.25, [("ding", 0.05, 0.6)])],
        C1=[("c1_her", 0, []), ("c1_x", 0.4, [("TEAR", -0.1, 0), ("deflate", 0.1, 0.5)]), ("c1_her2", 0.7, [("WEAR", 0.0, 0), ("dressup", 0.05, 0.8)]), ("c1_x2", 0.35, [("FLASH", ("e", 0.05), 0), ("blink", ("e", 0.05), 0.9), ("CHAT", ("e", 0.6), 0), ("ding", ("e", 0.6), 0.7), ("ding", ("e", 0.85), 0.5), ("ding", ("e", 1.05), 0.4)]), ("c1_nar", 1.5, []), ("c1_tip", 0.25, [("ding", 0.05, 0.6)])],
        C2=[("c2_her", 1.3, [("MONTH", -1.3, 0), ("chime", -1.25, 0.7)]), ("c2_x", 2.7, [("OPEN", -2.4, 0), ("pop", -2.4, 0.6), ("scratch", -1.7, 0.6)] + TICKS(1.6)), ("c2_her2", 0.6, [("WINK", ("e", 0.05), 0), ("rimshot", ("e", 0.15), 0.9)]), ("c2_nar", 1.2, [])],
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
    t = c + (0.42 if EPN == "mic" else 0.55)
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
for k in ["camera", "chunks"]:   # new episodes only: camera mode ("hard_cut") and long lines split into meaning chunks
    if E.get(k): cfg[k] = E[k]
cfg["setting"] = EPN
json.dump(dict(fps=FPS, dur=round(t, 3), ep=EPN, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx), open(f"eps/{EPN}/timeline.json", "w"), ensure_ascii=False)
print(f"{EPN} duration {t:.1f}s")
