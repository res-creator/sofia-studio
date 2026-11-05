# Speech-to-text check of the final long-form (ElevenLabs scribe_v1, one request): transcript vs all seg*/script.json lines.
# Usage: ELEVEN_API_KEYS=... python3 stt_check.py when_paying_people_backfired.mp4   (cloud env: ELEVEN_API_KEYS=proxy)
import json, os, re, subprocess, sys, difflib, glob, tempfile
D = os.path.dirname(os.path.abspath(__file__)); V = sys.argv[1]
key = (os.environ.get('ELEVEN_API_KEYS') or 'proxy').split(',')[0].strip()
a = tempfile.mktemp(suffix='.mp3')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', V, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', a], check=True)
r = subprocess.run(['curl', '-s', '-m', '600', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', 'xi-api-key: ' + key,
                    '-F', 'model_id=scribe_v1', '-F', 'language_code=en', '-F', f'file=@{a}'], capture_output=True).stdout
os.remove(a); got = json.loads(r).get('text', '')
W = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'}
def norm(s):
    s = s.lower().replace('’', "'").replace('-', ' ').replace('—', ' ')
    return [w for w in re.sub(r'[^a-z0-9 ]', '', s).split() if not re.fullmatch(r'[0-9]+', w)]   # numbers are checked by ear/plates, words strictly
want = norm(' '.join(l['text'] for f in sorted(glob.glob(f'{D}/chapters/*/script.json')) for l in json.load(open(f)))); have = norm(got)
sm = difflib.SequenceMatcher(None, want, have, autojunk=False); print('match ratio', round(sm.ratio(), 3))
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op != 'equal': print(op, ' '.join(want[a0:a1]), '->', ' '.join(have[b0:b1]))
open(f'{D}/stt_transcript.txt', 'w').write(got + '\n')
