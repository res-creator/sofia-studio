"""python3 scribe_check.py <ep> [ids...] -> scribe_v1 transcript + word gaps for each line (quality check: flat reading, cut ends, long pauses)."""
import sys, json, subprocess, soundfile as sf
from episodes_v2 import EP
ep = sys.argv[1]; only = set(sys.argv[2:])
for lid, who, text, ru in EP[ep]["lines"]:
    if only and lid not in only: continue
    f = f"eps/{ep}/vo/{lid}.wav"
    try: dur = sf.info(f).duration
    except Exception: continue
    lang = "rus" if who == "nar" else "eng"
    r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", "-F", "model_id=scribe_v1", "-F", f"language_code={lang}", "-F", "timestamps_granularity=word", "-F", f"file=@{f}"], capture_output=True, text=True)
    try: j = json.loads(r.stdout)
    except Exception: print(lid, "ERR", r.stdout[:150]); continue
    w = [x for x in j.get("words", []) if x["type"] == "word"]
    gaps = [round(b["start"] - a["end"], 2) for a, b in zip(w, w[1:])]
    first = w[0]["start"] if w else None; last = w[-1]["end"] if w else None
    print(f"{lid:6s} {who:5s} dur={dur:.2f} first={first} last={last} maxgap={max(gaps) if gaps else 0} | {j.get('text','').strip()}")
