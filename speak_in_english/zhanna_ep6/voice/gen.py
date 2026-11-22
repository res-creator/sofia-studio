# Fish Audio TTS (key injected by the proxy, never stored). python3 voice/gen.py [ids]
# script.json line = [id, voice, caption text, optional TTS text (Brook's Russian in Latin letters)]
import json, sys, time, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(os.path.join(D, 'script.json')))
want = sys.argv[1:]
for k, v, text, *tts in S['lines']:
    out = os.path.join(D, k + '.mp3')
    if (want and k not in want) or (not want and os.path.exists(out)): continue
    req = urllib.request.Request('https://api.fish.audio/v1/tts', data=json.dumps({'text': tts[0] if tts else text, 'reference_id': S['voices'][v], 'format': 'mp3'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer proxy', 'model': 's2.1-pro-free'})
    d = urllib.request.urlopen(req, timeout=180).read(); open(out, 'wb').write(d); print(k, len(d)); time.sleep(2)
