"""python3 scribe_check.py <ep> [ids...] -> ElevenLabs scribe_v1 transcript + word timings for each EN/RU voice line (QA: flat reading, cut ends, long pauses).
Key comes from the environment/proxy. Prints: id | duration | speech start/end inside the file | longest inner gap | transcript. Saves eps/<ep>/vo/<id>.scribe.json"""
import json, os, subprocess, sys, soundfile as sf
from episodes_v2 import EP
ep = sys.argv[1]; only = set(sys.argv[2:])
for lid, who, text, ru in EP[ep]["lines"]:
    p = f"eps/{ep}/vo/{lid}.wav"
    if (only and lid not in only) or not os.path.exists(p): continue
    mp3 = f"/tmp/{ep}_{lid}.mp3"; subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", p, "-ac", "1", "-b:a", "96k", mp3], check=True)
    lang = "rus" if who == "nar" else "eng"
    r = subprocess.run(["curl", "-sS", "https://api.elevenlabs.io/v1/speech-to-text", "-F", "model_id=scribe_v1", "-F", f"file=@{mp3}", "-F", f"language_code={lang}", "-F", "timestamps_granularity=word", "-F", "tag_audio_events=true"], capture_output=True, text=True).stdout
    try: d = json.loads(r)
    except Exception: print(lid, "ERR", r[:200]); continue
    json.dump(d, open(f"eps/{ep}/vo/{lid}.scribe.json", "w"), ensure_ascii=False)
    ws = [w for w in d.get("words", []) if w.get("type") == "word"]
    gap = max([ws[i + 1]["start"] - ws[i]["end"] for i in range(len(ws) - 1)] + [0])
    dur = sf.info(p).duration
    print(f"{lid:7s}| {dur:5.2f}s | speech {ws[0]['start']:.2f}-{ws[-1]['end']:.2f} | tail {dur - ws[-1]['end']:.2f} | gap {gap:.2f} | {d.get('text','').strip()}" if ws else f"{lid} no words {d}")
