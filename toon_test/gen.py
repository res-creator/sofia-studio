import json, sys, time, os
sys.path.insert(0, '..'); os.environ.setdefault('ELEVEN_API_KEYS', 'proxy-injected')
from el import tts
V = {'earl': 'N2lVS1w4EtoT3dr4eOWO', 'fridge': 'Xb7hH8MSUJpSbSDYk0k2', 'penny': 'FGY2WhTYpPnrIDTdsKH5'}
for i, who, text in json.load(open('lines.json')):
    out = f'vo/{i}.mp3'
    if os.path.exists(out) and '--force' not in sys.argv: continue
    tts(V[who], text, out, model='eleven_v3', vs={"stability": 0.5, "similarity_boost": 0.8})
    print('ok', i, flush=True); time.sleep(1)
