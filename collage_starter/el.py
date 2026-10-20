# ElevenLabs TTS with word timestamps. Keys: env ELEVEN_API_KEYS="key1,key2,key3" (or ELEVEN_API_KEY).
# If a key runs out of credits or is rejected, the next key is tried automatically.
import json, sys, base64, subprocess, os
KEYS = [k.strip() for k in (os.environ.get('ELEVEN_API_KEYS') or os.environ.get('ELEVEN_API_KEY') or '').split(',') if k.strip()]
if not KEYS: raise SystemExit('Set ELEVEN_API_KEYS="key1,key2,..." (never write keys into code or chat logs)')
def _call(key, url, body):
    r = subprocess.run(['curl', '-s', '-m', '180', '-X', 'POST', url, '-H', 'xi-api-key: ' + key, '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body.encode(), capture_output=True).stdout
    return json.loads(r)
def tts(voice, text, out, model='eleven_multilingual_v2', vs=None, speed=None):
    vs = dict(vs or {"stability": 0.45, "similarity_boost": 0.8, "style": 0.4, "use_speaker_boost": True})
    if speed: vs['speed'] = speed
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"
    body = json.dumps({"text": text, "model_id": model, "voice_settings": vs})
    last = None
    for i, key in enumerate(KEYS):
        j = _call(key, url, body)
        if 'audio_base64' in j:
            open(out, 'wb').write(base64.b64decode(j['audio_base64']))
            json.dump(j.get('alignment'), open(out.rsplit('.', 1)[0] + '.align.json', 'w'))
            return
        last = j; code = str((j.get('detail') or {}).get('code', ''))
        if code in ('quota_exceeded', 'unauthorized', 'invalid_api_key', 'missing_permissions'):
            print(f'key #{i+1}: {code} -> trying next key', file=sys.stderr); continue
        break  # other errors (rate limit, bad request): do not burn other keys
    raise SystemExit(f'EL error {out}: {str(last)[:300]}')
if __name__ == '__main__':
    tts(sys.argv[1], sys.argv[2], sys.argv[3])
