# TTS mix: ElevenLabs (eleven_v3) + Fish Audio. Keys are injected by the proxy (never stored here).
# One request at a time, ~3 s apart. Usage: python3 voice/gen.py [ids...]  (no ids = only missing lines)
import json, sys, time, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(D, 'script.json')))
ids = sys.argv[1:] or [k for k in S['lines'] if not os.path.exists(os.path.join(D, k + '.mp3'))]
for k in ids:
    vk, text = S['lines'][k]; prov, vid = S['voices'][vk]; out = os.path.join(D, k + '.mp3')
    if prov == 'eleven':
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', data=json.dumps({'text': text, 'model_id': 'eleven_v3'}).encode(), headers={'Content-Type': 'application/json', 'xi-api-key': 'proxy'})
    else:
        req = urllib.request.Request('https://api.fish.audio/v1/tts', data=json.dumps({'text': text, 'reference_id': vid, 'format': 'mp3'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer proxy', 'model': 's2.1-pro-free'})
    try:
        data = urllib.request.urlopen(req, timeout=180).read(); open(out, 'wb').write(data); print(k, len(data))
    except urllib.error.HTTPError as e: print(k, 'ERR', e.code, e.read()[:300])
    time.sleep(3)
