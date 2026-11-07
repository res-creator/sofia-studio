# Speech-to-text check (ElevenLabs scribe_v1) of every narration line and every testimony cut.
# usage: python3 tools/stt_check.py script/film.json [ids...]  -> research/stt_check_<name>.json + printed mismatches
import json, subprocess, sys, time, re, os, difflib
SRC = {'w': 'assets/raw/jit/dvids91190_jit_2010-07-23_part1.mp4', 'x': 'assets/raw/jit/dvids91191_jit_2010-07-23.mp4', 'y': 'assets/raw/jit/dvids91195_jit_2010-07-23.mp4'}
sc = sys.argv[1]; only = set(sys.argv[2:]); seq = json.load(open(sc))['seq']
name = os.path.basename(sc).split('.')[0]; outp = f'research/stt_check_{name}.json'
out = json.load(open(outp)) if os.path.exists(outp) else {}
def stt(path):
    r = subprocess.run(['curl', '-s', '-m', '200', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', 'xi-api-key: dummy', '-F', 'model_id=scribe_v1', '-F', 'language_code=en', '-F', f'file=@{path}'], capture_output=True, text=True).stdout
    try: return json.loads(r).get('text', r[:200])
    except Exception: return 'ERROR ' + r[:200]
n = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace('-', ' ')).split()
for it in seq:
    if it[0] not in ('vo', 'bite') or (only and it[1] not in only): continue
    if it[0] == 'vo': p = f'vo/{it[1]}.mp3'; ref = it[2]
    else:
        p = f'/tmp/claude-0/bite_{it[1]}.wav'; parts = []
        for k, (a, b) in enumerate(it[2]):
            q = f'/tmp/claude-0/bp{k}.wav'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(b - a), '-i', SRC[it[4] if len(it) > 4 else 'w'], '-ac', '1', '-ar', '16000', q], check=True); parts.append(q)
        subprocess.run(['ffmpeg', '-v', 'error', '-y'] + sum([['-i', q] for q in parts], []) + ['-filter_complex', ''.join(f'[{k}:a]' for k in range(len(parts))) + f'concat=n={len(parts)}:v=0:a=1', p], check=True); ref = None
    txt = stt(p); out[it[1]] = txt
    if ref:
        r = difflib.SequenceMatcher(None, n(ref), n(txt)).ratio()
        print(f'{it[1]} ratio {r:.2f}\n  REF: {ref}\n  STT: {txt}' if r < 0.97 else f'{it[1]} ok {r:.3f}', flush=True)
    else: print(it[1], 'BITE:', txt, flush=True)
    json.dump(out, open(outp, 'w'), indent=1); time.sleep(3)
