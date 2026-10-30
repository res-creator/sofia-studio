"""python3 short/short_build.py <slug>  ->  eps/<slug>_s/{timeline.json, vo/*.wav}  (shortened version of a finished episode, no new voice generation)

Reads the finished full timeline eps/<slug>/timeline.json and the plan short/plan_<slug>.json, then:
  * drops whole speech lines (plan.drop) and cuts whole sentences out of narrator clips (plan.keep = clip-relative ranges to keep),
  * trims clip tails and compresses long silences inside clips (never touches words),
  * shortens the silent gaps between lines (plan.gap / defaults) while protecting every sound-effect / event cue,
  * remaps all sound effects, events, scene borders, word timings and mouth envelopes through ONE time-warp (list of removed intervals),
  * builds a new hook from plan.hook (flash-forward / direct start) and glues the shortened levels after it.
The renderer (tour.js / splitbill.js / photo.js) and audio_v2.py are NOT modified: they run on the new timeline (SHORT=1)."""
import json, os, sys
import numpy as np, soundfile as sf

SR = 48000; FPS = 30
slug = sys.argv[1]
PLAN = json.load(open(f"short/plan_{slug}.json")); TL = json.load(open(f"eps/{slug}/timeline.json"))
SRC = f"eps/{slug}/vo"; OUT = f"eps/{slug}_s"; os.makedirs(f"{OUT}/vo", exist_ok=True)
SP = {s["id"]: s for s in TL["speech"]}; SCN = {s["id"]: s for s in TL["scenes"]}
DROP = set(PLAN.get("drop", [])); KEEP = PLAN.get("keep", {})
PMAX, PKEEP, TAIL, HEAD = PLAN.get("pmax", 0.42), PLAN.get("pkeep", 0.3), 0.07, 0.04
DGAP, LEAD, GAP_NAR, SCENE_END = PLAN.get("dgap", 0.14), PLAN.get("lead", 0.2), PLAN.get("gap_nar", 0.4), PLAN.get("scene_end", 0.35)
INTRO_FULL = 1.15; INTRO = PLAN.get("intro", 0.85); OUTRO_LEAD = PLAN.get("outro_lead", 0.5)   # the level-intro overlay is started 0.3 s late by the renderer (SHORT), so only 0.85 s of the 1.15 s remain
LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]


def active_ranges(x):
    hop = SR // 100; e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)]); thr = e.max() * 0.03
    return e < thr, hop


def edit_clip(cid):
    """-> (new samples, segs[(a, b)] kept clip-relative, new_t(old_rel_t))"""
    x, sr = sf.read(f"{SRC}/{cid}.wav"); assert sr == SR
    quiet, hop = active_ranges(x); act = np.where(~quiet)[0]
    first = act[0] / 100 if len(act) else 0.0; last = (act[-1] + 1) / 100 if len(act) else len(x) / SR
    rngs = [list(r) for r in KEEP.get(cid, [[0.0, len(x) / SR]])]
    segs = []
    for a, b in rngs:
        a = max(a, first - HEAD) if a <= first else a; b = min(b, last + TAIL)
        # compress long silences inside the range
        i = int(round(a * 100)); cur = a
        while i < int(round(b * 100)):
            if i < len(quiet) and quiet[i]:
                j = i
                while j < len(quiet) and quiet[j]: j += 1
                lo, hi = i / 100, min(j / 100, b)
                if hi - lo > PMAX and lo > a + 0.02 and hi < b - 0.02:
                    segs.append((cur, lo + PKEEP / 2)); cur = hi - PKEEP / 2
                i = j
            else: i += 1
        segs.append((cur, b))
    segs = [(max(0, a), min(len(x) / SR, b)) for a, b in segs if b - a > 0.01]
    parts = []; fade = int(0.006 * SR)
    for a, b in segs:
        y = x[int(a * SR):int(b * SR)].copy(); n = min(fade, len(y) // 2)
        if n: y[:n] *= np.linspace(0, 1, n); y[-n:] *= np.linspace(1, 0, n)
        parts.append(y)
    y = np.concatenate(parts) if parts else x
    cum = np.cumsum([0] + [b - a for a, b in segs])

    def new_t(t):
        for (a, b), c0 in zip(segs, cum):
            if t <= b: return c0 + max(0.0, t - a)
        return cum[-1]
    return y, segs, new_t


# ---------------------------------------------------------------- 1. clip edits and the removal intervals they imply
KEPT = [s["id"] for s in TL["speech"] if s["id"] not in DROP]
HOOK_IDS = [i for i, _ in PLAN["hook"]["items"]]
CLIP = {}; REM = []          # REM = removed intervals in ORIGINAL global time
for cid in KEPT:
    if cid.startswith("hook") and cid not in HOOK_IDS: continue
    y, segs, nt = edit_clip(cid); CLIP[cid] = dict(y=y, segs=segs, nt=nt)
    t0 = SP[cid]["t"]; end = t0 + SP[cid]["d"]; prev = 0.0
    if not cid.startswith("hook"):
        for a, b in segs:
            if a > prev + 1e-3: REM.append((t0 + prev, t0 + a))
            prev = b
        if end > t0 + prev + 1e-3: REM.append((t0 + prev, end))
for cid in DROP:
    REM.append((SP[cid]["t"], SP[cid]["t"] + SP[cid]["d"]))

for L in LEVELS: REM.append((SCN[L]["s"] + INTRO, SCN[L]["s"] + INTRO_FULL))
# ---------------------------------------------------------------- 2. gaps between kept items inside every level / outro scene
def merge(iv):
    iv = sorted((a, b) for a, b in iv if b - a > 1e-4); out = []
    for a, b in iv:
        if out and a <= out[-1][1] + 1e-4: out[-1] = (out[-1][0], max(out[-1][1], b))
        else: out.append((a, b))
    return out


def subtract(a, b, cut):
    out = []; cur = a
    for x, y in merge(cut):
        if y <= cur or x >= b: continue
        if x > cur: out.append((cur, x))
        cur = max(cur, y)
    if cur < b: out.append((cur, b))
    return out


def markers(s):   # cue times that must keep their distance to the neighbouring line: all sound effects except ticks + event markers
    m = [c["t"] for c in TL["sfx"] if c["n"] != "tick"]
    for k, v in SCN[s]["ev"].items() if "ev" in SCN[s] else []:
        if k == k.lower() and "_" not in k and not isinstance(v, list): m.append(v)
    return m


for L in LEVELS + ["outro"]:
    sc = SCN[L]; items = [s for s in TL["speech"] if sc["s"] <= s["t"] < sc["e"] and s["id"] not in DROP]
    p0 = sc["s"] + (OUTRO_LEAD if L == "outro" else INTRO); mk = markers(L); prev_end = p0
    for k, s in enumerate(items):
        cid = s["id"]; segs = CLIP[cid]["segs"]; ts = s["t"] + segs[0][0]
        g = PLAN.get("gap", {}).get(cid, LEAD if k == 0 else GAP_NAR if s["who"] == "nar" else DGAP)
        G = (prev_end, ts); silent = subtract(G[0], G[1], REM)
        total = sum(b - a for a, b in silent); prot = merge([(m - 0.12, m + 0.4) for m in mk if G[0] - 0.05 <= m <= G[1] + 0.05])
        keep_zones = merge([(max(a, G[0]), min(b, G[1])) for a, b in prot]); mand = 0.0
        for a, b in silent:
            for pa, pb in keep_zones: mand += max(0.0, min(b, pb) - max(a, pa))
        allow = max(g, mand); need = total - allow
        if need > 1e-3:
            free = []
            for a, b in silent: free += subtract(a, b, keep_zones)
            free.sort(key=lambda r: r[0] - r[1])
            for a, b in free:
                if need <= 1e-3: break
                cut = min(need, b - a - 0.03)
                if cut <= 0.0: continue
                m_ = (a + b) / 2; REM.append((m_ - cut / 2, m_ + cut / 2)); need -= cut
        prev_end = s["t"] + segs[-1][1]
    tail = (prev_end + (PLAN.get("outro_tail", 1.0) if L == "outro" else SCENE_END), sc["e"])
    if tail[1] > tail[0] + 1e-3: REM.append(tail)

for L in LEVELS: REM.append((SCN[L]["s"] + INTRO, SCN[L]["s"] + INTRO_FULL))
REM = merge(REM)

def warp(t, drop_inside=False):
    sub = 0.0
    for a, b in REM:
        if t <= a: break
        if t >= b: sub += b - a
        else:
            if drop_inside: return None
            sub += t - a; break
    return t - sub


# ---------------------------------------------------------------- 3. hook (explicit spec) + shortened levels
H = PLAN["hook"]; hook_t = {}; t = H.get("lead", 0.0)
hook_speech = []
for cid, gap in H["items"]:
    t += gap; hook_t[cid] = t; y = CLIP[cid]["y"]; d = len(y) / SR; hook_speech.append((cid, t, d)); t += d
hook_end = t + H.get("end_gap", 0.5)
base = warp(SCN["A1"]["s"]); T_H = hook_end
mapt = lambda tt: T_H + warp(tt) - base


def env_of(y):
    hop = SR // FPS; n = int(np.ceil(len(y) / hop)); e = np.array([np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    return [round(float(v), 2) for v in np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1.2)]


def new_words(cid, sp):
    out = []; nt = CLIP[cid]["nt"]; segs = CLIP[cid]["segs"]
    for w, a, b in sp.get("words", []):
        ov = [(sa, sb) for sa, sb in segs if a < sb - 1e-3 and b > sa + 1e-3]   # a word counts if any part of it is still in the clip
        if ov: out.append([w, round(nt(max(a, ov[0][0])), 3), round(nt(min(b, segs[-1][1])), 3)])
    return out


speech = []
for cid, t0, d in hook_speech:
    sp = dict(SP[cid]); sp.update(t=round(t0, 3), d=round(d, 3), env=env_of(CLIP[cid]["y"]), words=new_words(cid, SP[cid])); speech.append(sp)
removed = {}
for s in TL["speech"]:
    cid = s["id"]
    if cid.startswith("hook"): continue
    if cid in DROP: removed[cid] = round(mapt(s["t"]), 3); continue
    sp = dict(s); y = CLIP[cid]["y"]; sp.update(t=round(mapt(s["t"] + CLIP[cid]["segs"][0][0]), 3), d=round(len(y) / SR, 3), env=env_of(y), words=new_words(cid, s)); speech.append(sp)
for cid in [c for c in SP if c.startswith("hook") and c not in HOOK_IDS]: removed[cid] = 0.0
speech.sort(key=lambda s: s["t"])
for cid, y in ((c, CLIP[c]["y"]) for c in CLIP):
    sf.write(f"{OUT}/vo/{cid}.wav", y.astype(np.float32), SR)

sfx = []
for c in H.get("sfx", []):
    ref, off = c[1], c[2]; sfx.append(dict(n=c[0], t=round((hook_t[ref] if ref in hook_t else (hook_end if ref == "END" else 0.0 if ref == "START" else float(ref))) + off, 3), g=c[3]))
for c in TL["sfx"]:
    if c["t"] < SCN["A1"]["s"] - 0.001: continue
    w = warp(c["t"], drop_inside=True)
    if w is not None: sfx.append(dict(n=c["n"], t=round(mapt(c["t"]), 3), g=c["g"]))
sfx.sort(key=lambda c: c["t"])

scenes = []
hev = {k: round((hook_t[v[0]] if v[0] in hook_t else 0.0 if v[0] == "START" else hook_end) + v[1], 3) for k, v in H.get("ev", {}).items()}
st = H.get("stamp", ["END", -0.3]); stamp_t = (hook_t[st[0]] if st[0] in hook_t else 0.0 if st[0] == "START" else hook_end) + st[1]
scenes.append(dict(id="hook", s=0.0, e=round(hook_end, 3), stamp_t=round(stamp_t, 3), ev=hev))
for L in LEVELS + ["outro"]:
    sc = SCN[L]; s2 = dict(id=L, s=round(mapt(sc["s"]) if L != "A1" else hook_end, 3), e=round(mapt(sc["e"]), 3))
    if "ev" in sc: s2["ev"] = {k: (round(mapt(v), 3) if not isinstance(v, list) else [round(mapt(q), 3) for q in v]) for k, v in sc["ev"].items()}
    scenes.append(s2)
dur = scenes[-1]["e"]
cfg = dict(TL["cfg"]); cfg["short"] = True
if cfg.get("chunks"):   # long lines shown as meaning chunks: keep only the chunks whose words are still in the (trimmed) clip
    cfg["chunks"] = dict(cfg["chunks"]); kept_n = {sp["id"]: len(sp["words"]) for sp in speech}
    for cid, ch in list(cfg["chunks"].items()):
        if cid not in kept_n: del cfg["chunks"][cid]; continue
        acc = 0; keep_ch = []
        for en, ru in ch:
            n = len(en.split())
            if acc + n <= kept_n[cid]: keep_ch.append([en, ru]); acc += n
            else: break
        cfg["chunks"][cid] = keep_ch
json.dump(dict(fps=FPS, dur=round(dur, 3), ep=slug, cfg=cfg, scenes=scenes, speech=speech, sfx=sfx, removed=removed, orig_dur=TL["dur"]), open(f"{OUT}/timeline.json", "w"), ensure_ascii=False)
nar = sum(s["d"] for s in speech if s["who"] == "nar"); chars = sum(s["d"] for s in speech if s["who"] not in ("nar", "tip"))
print(f"{slug}_s: {TL['dur']:.1f}s -> {dur:.1f}s  (hook {hook_end:.1f}s, speech: characters {chars:.1f}s, Sarah {nar:.1f}s, dropped lines {len(DROP)})")
for sc in scenes: print(f"   {sc['id']:5s} {sc['e']-sc['s']:5.1f}s")
