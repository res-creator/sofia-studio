"""python3 gen_fish.py -> mum<i>.mp3, nar<i>.mp3 via fish.audio (free model s2.1-pro-free). Key: injected by the proxy for api.fish.audio (never in code). One request at a time, 3 s apart."""
import json, os, time, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(f"{D}/script.json", encoding="utf-8"))
VOICE = {"mum": "b6d5ed38678e4c48b292388207c6ef89", "nar": "7ac07cd587b2454090ae01f3ab9f0fd4"}
KEY = os.environ.get("FISH_API_KEY", "").strip() or "proxy"
def tts(text, voice):
    body = json.dumps({"text": text, "reference_id": voice, "format": "mp3", "mp3_bitrate": 192, "normalize": True, "latency": "normal"}).encode()
    req = urllib.request.Request("https://api.fish.audio/v1/tts", data=body, method="POST", headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "model": "s2.1-pro-free"})
    for a in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r: return r.read()
        except Exception as e:
            if a == 3: raise
            print("retry", e, flush=True); time.sleep(2 ** (a + 1))
for who in ("mum", "nar"):
    for i, text in enumerate(S[who]):
        f = f"{D}/{who}{i}.mp3"
        if os.path.exists(f) and os.path.getsize(f) > 1000: continue
        open(f, "wb").write(tts(text, VOICE[who])); print(who, i, os.path.getsize(f), flush=True); time.sleep(3)
