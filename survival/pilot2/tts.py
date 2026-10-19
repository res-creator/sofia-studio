# New lines for the full pilot via ElevenLabs with timestamps (auth injected by the session proxy; no keys in code).
# Same voices/settings as ../cruise/tts.py. Usage: python3 tts.py [id ...] (default: every missing "new" line).
import json, sys, os, time, importlib.util
D = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('ctts', os.path.join(D, '..', 'cruise', 'tts_lib.py')); C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
want = sys.argv[1:]
for lid, who, scene, text, src, gap in json.load(open(f'{D}/script.json'))['lines']:
    if src != 'new' or (want and lid not in want): continue
    out = f'{D}/vo/{lid}.mp3'
    if not want and os.path.exists(out): continue
    C.tts(who, text, out); print('ok', lid, flush=True); time.sleep(3)
