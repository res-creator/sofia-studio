# Ep1 voices via ElevenLabs with timestamps (auth injected by the session proxy; no keys in code).
# Usage: python3 tts.py [id ...]  (default: every missing, non-reused line). Calls spaced ~3 s apart.
import json, sys, base64, subprocess, os, time, shutil
D = os.path.dirname(os.path.abspath(__file__))
VOICES = {
  'N': ('onwK4e9ZLuTAKqWW03F9', 'eleven_multilingual_v2', {"stability": 0.55, "similarity_boost": 0.8, "style": 0.25}),  # Daniel
  'H': ('TX3LPaxmHKxFdv7VOQHJ', 'eleven_v3', {"stability": 0.5}),   # Liam
  'G': ('N2lVS1w4EtoT3dr4eOWO', 'eleven_v3', {"stability": 0.5}),   # Callum
  'S': ('EXAVITQu4vr4xnSDxMaL', 'eleven_v3', {"stability": 0.5}),   # Sarah
  'R': ('pNInz6obpgDQGcFmaJgB', 'eleven_multilingual_v2', {"stability": 0.4, "similarity_boost": 0.7}),  # Adam (radio, filtered in mix)
}
def tts(who, text, out):
    vid, model, vs = VOICES[who]
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": model, "voice_settings": vs})
    r = subprocess.run(['curl', '-s', '-m', '180', '-X', 'POST', url, '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body.encode(), capture_output=True).stdout
    j = json.loads(r)
    if 'audio_base64' not in j: raise SystemExit(f'EL error {out}: {str(j)[:300]}')
    open(out, 'wb').write(base64.b64decode(j['audio_base64']))
    json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w'))
want = sys.argv[1:]
lines = [L for b in json.load(open(f'{D}/script.json'))['blocks'] for L in b['lines']]
for L in lines:
    lid, who, text = L[:3]; out = f"{D}/vo/{lid}.mp3"
    if want and lid not in want: continue
    if len(L) > 3 and not L[3].startswith('@'):   # reuse an approved take from the pilot
        src = os.path.join(D, L[3])
        for ext in ('.mp3', '.align.json'): shutil.copy(src + ext, out[:-4] + ext)
        continue
    if len(L) > 3 or (not want and os.path.exists(out)): continue
    tts(who, text, out); print('ok', lid, flush=True); time.sleep(3)
