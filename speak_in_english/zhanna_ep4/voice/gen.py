# Fish Audio TTS (key injected by the proxy, never stored). python3 voice/gen.py [ids]   (python3 voice/gen.py --take N ids  -> voice/takes/<id>_N.mp3)
# script.json lines: [id, voice, caption text, optional tts text]
import json, sys, time, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(os.path.join(D, 'script.json')))
args = sys.argv[1:]; take = None
if args[:1] == ['--take']: take = args[1]; args = args[2:]
for k, v, text, *tts in S['lines']:
    out = os.path.join(D, 'takes', f'{k}_{take}.mp3') if take else os.path.join(D, k + '.mp3')
    if (args and k not in args) or (not args and os.path.exists(out)): continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    req = urllib.request.Request('https://api.fish.audio/v1/tts', data=json.dumps({'text': tts[0] if tts else text, 'reference_id': S['voices'][v], 'format': 'mp3'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer proxy', 'model': 's2.1-pro-free'})
    d = urllib.request.urlopen(req, timeout=180).read(); open(out, 'wb').write(d); print(k, len(d)); time.sleep(2)
