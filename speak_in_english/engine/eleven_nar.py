"""OPTIONAL (API instead of the website): ELEVENLABS_API_KEY=... python3 eleven_nar.py <ep>  ->  eps/<ep>/nar_all.mp3
Same voice/model as the site: Sarah (EXAVITQu4vr4xnSDxMaL), eleven_multilingual_v2. The key is read from the environment only;
never write it into files. (We made our takes on the website; this script is a convenience and was not used in production.)"""
import json, os, sys, urllib.request
from episodes_v2 import EP
ep = sys.argv[1]
lines = [l[2] for l in EP[ep]["lines"] if l[1] == "nar"]
text = ' <break time="2.0s" /> '.join(lines)
req = urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_44100_128",
    data=json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                     "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True}}).encode(),
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json", "Accept": "audio/mpeg"})
os.makedirs(f"eps/{ep}", exist_ok=True)
open(f"eps/{ep}/nar_all.mp3", "wb").write(urllib.request.urlopen(req).read())
print(f"eps/{ep}/nar_all.mp3 saved; now: python3 split_nar.py {ep}")
