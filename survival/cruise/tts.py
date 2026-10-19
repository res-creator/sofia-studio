# Cruise Ship voices via ElevenLabs with timestamps (auth injected by the session proxy; no keys in code).
# Usage: python3 tts.py [id ...]  (default: every missing line). Lines marked reuse:lXX copy the approved pilot take.
import json, sys, base64, subprocess, os, time, shutil
D = os.path.dirname(os.path.abspath(__file__))
from tts_lib import VOICES, tts
want = sys.argv[1:]
for sc in json.load(open(f'{D}/script.json'))['scenes']:
    for L in sc['lines']:
        lid, who, text = L[:3]; out = f'{D}/vo/{lid}.mp3'
        if want and lid not in want: continue
        if len(L) > 3 and L[3].startswith('reuse:'):
            src = os.path.join(D, '..', 'vo', L[3][6:])
            for ext in ('.mp3', '.align.json'): shutil.copy(src + ext, out[:-4] + ext)
            continue
        if not want and os.path.exists(out): continue
        tts(who, text, out); print('ok', lid, flush=True); time.sleep(3)
