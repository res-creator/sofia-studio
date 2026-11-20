# ElevenLabs TTS for the episode. Key is injected by the proxy (never stored here).
# One request at a time, ~3 s apart. Usage: python3 voice/gen.py [ids...]
import json, sys, time, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(D, 'script.json')))
ids = sys.argv[1:] or list(S['lines'])
for i, k in enumerate(ids):
    vk, text = S['lines'][k]; vid, model, lang = S['voices'][vk]
    out = os.path.join(D, k + '.mp3')
    if os.path.exists(out) and len(sys.argv) == 1: continue
    body = {'text': text, 'model_id': model}
    if model == 'eleven_multilingual_v2':
        body['language_code'] = lang
        body['voice_settings'] = {'stability': 0.35, 'similarity_boost': 0.8, 'style': 0.55, 'use_speaker_boost': True, 'speed': 1.08}
    else:
        body['voice_settings'] = {'stability': 0.0 if False else 0.5}
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'xi-api-key': 'proxy'})
    try:
        data = urllib.request.urlopen(req, timeout=120).read(); open(out, 'wb').write(data); print(k, len(data))
    except urllib.error.HTTPError as e: print(k, 'ERR', e.code, e.read()[:300])
    time.sleep(3)
