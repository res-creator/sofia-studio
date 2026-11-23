# Fish Audio TTS (key injected by the proxy, never stored). python3 voice/gen.py [ids]
# line = [id, voice, caption text, optional TTS text]; "chorus" lines are generated once per chorus voice (c1..c4) as <id>_<voice>.mp3
import json, sys, time, os, urllib.request
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(os.path.join(D, 'script.json')))
want = sys.argv[1:]
def tts(text, ref, out):
    req = urllib.request.Request('https://api.fish.audio/v1/tts', data=json.dumps({'text': text, 'reference_id': ref, 'format': 'mp3'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer proxy', 'model': 's2.1-pro-free'})
    d = urllib.request.urlopen(req, timeout=180).read(); open(out, 'wb').write(d); print(os.path.basename(out), len(d)); time.sleep(2)
for row in S['lines']:
    k, v, text = row[:3]; say = row[3] if len(row) > 3 else text
    if k == 'c2': continue   # second chant reuses c1
    jobs = [(os.path.join(D, f'{k}_{cv}.mp3'), S['voices'][cv]) for cv in ('c1', 'c2', 'c3', 'c4')] if v == 'chorus' else [(os.path.join(D, k + '.mp3'), S['voices'][v])]
    for out, ref in jobs:
        if (want and k not in want) or (not want and os.path.exists(out)): continue
        tts(say, ref, out)
