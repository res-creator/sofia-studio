# Word timings via ElevenLabs Scribe (key injected by proxy). One request at a time.
import json, os, sys, time, subprocess
D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(D, 'script.json')))
for k in S['lines']:
    out = os.path.join(D, k + '.words.json')
    if os.path.exists(out): continue
    r = subprocess.run(['curl', '-s', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', 'xi-api-key: proxy',
        '-F', 'model_id=scribe_v1', '-F', 'timestamps_granularity=word', '-F', 'file=@' + os.path.join(D, k + '.mp3')], capture_output=True, text=True)
    j = json.loads(r.stdout); w = [x for x in j.get('words', []) if x.get('type') == 'word']
    json.dump({'text': j.get('text'), 'words': [{'w': x['text'], 's': x['start'], 'e': x['end']} for x in w]}, open(out, 'w'), ensure_ascii=False)
    print(k, j.get('text')); time.sleep(3)
