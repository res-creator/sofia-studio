# ElevenLabs TTS with word timestamps. Auth is injected by the session proxy; no keys in code.
# Usage: python3 tts.py [id ...]   (default: all lines missing in vo/)
import json, sys, base64, subprocess, os, time
VOICE = 'nPczCjzI2devNBz1zQrb'  # Brian (premade) - deep calm narrator
VS = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True}
D = os.path.dirname(os.path.abspath(__file__))
def tts(text, out):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": VS})
    r = subprocess.run(['curl', '-s', '-m', '180', '-X', 'POST', url, '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body.encode(), capture_output=True).stdout
    j = json.loads(r)
    if 'audio_base64' not in j: raise SystemExit(f'EL error {out}: {str(j)[:300]}')
    open(out, 'wb').write(base64.b64decode(j['audio_base64']))
    json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w'))
lines = json.load(open(f'{D}/lines.json'))
want = sys.argv[1:]
for L in lines:
    out = f"{D}/vo/{L['id']}.mp3"
    if (want and L['id'] not in want) or (not want and os.path.exists(out)): continue
    tts(L['text'], out); print('ok', L['id']); time.sleep(3)
