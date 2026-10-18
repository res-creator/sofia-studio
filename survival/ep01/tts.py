# ElevenLabs voices with word timestamps (auth injected by the session proxy; no keys in code).
# Usage: python3 tts.py [id ...]  (default: lines missing in vo/). Spaced ~3 s apart.
import json, sys, base64, subprocess, os, time
D = os.path.dirname(os.path.abspath(__file__))
VOICES = {  # who: (voice id, model, settings)
  'N': ('onwK4e9ZLuTAKqWW03F9', 'eleven_multilingual_v2', {"stability": 0.55, "similarity_boost": 0.8, "style": 0.25}),  # Daniel - dry British narrator
  'H': ('TX3LPaxmHKxFdv7VOQHJ', 'eleven_v3', {"stability": 0.5}),   # Liam - the hero
  'G': ('N2lVS1w4EtoT3dr4eOWO', 'eleven_v3', {"stability": 0.5}),   # Callum - Gary from 4B
  'S': ('EXAVITQu4vr4xnSDxMaL', 'eleven_v3', {"stability": 0.5}),   # Sarah - survivor at the door
}
def tts(who, text, out):
    vid, model, vs = VOICES[who]
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": model, "voice_settings": vs})
    j = json.loads(subprocess.run(['curl', '-s', '-m', '180', '-X', 'POST', url, '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body.encode(), capture_output=True).stdout)
    if 'audio_base64' not in j: raise SystemExit(f'EL error {out}: {str(j)[:300]}')
    open(out, 'wb').write(base64.b64decode(j['audio_base64']))
    json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w'))
want = sys.argv[1:]
for L in json.load(open(f'{D}/lines.json')):
    out = f"{D}/vo/{L['id']}.mp3"
    if (want and L['id'] not in want) or (not want and os.path.exists(out)): continue
    tts(L['who'], L['text'], out); print('ok', L['id']); time.sleep(3)
