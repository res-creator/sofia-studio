# ElevenLabs eleven_v3 TTS. Key injected by the proxy. One request at a time, ~3 s apart.
import json, sys, time, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(os.path.join(D, 'script.json')))
ids = sys.argv[1:] or [k for k in S['lines'] if not os.path.exists(os.path.join(D, k + '.mp3'))]
for k in ids:
    vk, text = S['lines'][k]; vid = S['voices'][vk]
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', data=json.dumps({'text': text, 'model_id': 'eleven_v3'}).encode(), headers={'Content-Type': 'application/json', 'xi-api-key': 'proxy'})
    try: data = urllib.request.urlopen(req, timeout=180).read(); open(os.path.join(D, k + '.mp3'), 'wb').write(data); print(k, len(data))
    except urllib.error.HTTPError as e: print(k, 'ERR', e.code, e.read()[:200])
    time.sleep(3)
