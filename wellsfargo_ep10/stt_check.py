# Speech-to-text check of the final video (ElevenLabs scribe_v1): the transcript must match script.json word for word (punctuation-insensitive).
# Usage: ELEVEN_API_KEYS=... python3 stt_check.py video.mp4
import json, os, re, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__)); V = sys.argv[1]
key = (os.environ.get('ELEVEN_API_KEYS') or '').split(',')[0].strip()
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', V, '-vn', '-ac', '1', '-ar', '16000', f'{D}/_stt.mp3'], check=True)
r = subprocess.run(['curl', '-s', '-m', '300', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', 'xi-api-key: ' + key,
                    '-F', 'model_id=scribe_v1', '-F', 'language_code=en', '-F', f'file=@{D}/_stt.mp3'], capture_output=True).stdout
os.remove(f'{D}/_stt.mp3'); j = json.loads(r); got = j.get('text', '')
NUM = {'5': 'five', '40': 'forty', '100': 'a hundred', '12': 'twelve', '28': 'twentyeight', '90': 'ninety', '35': 'thirtyfive'}
norm = lambda s: re.sub(r'[^a-z0-9 ]', '', s.lower().replace('-', '').replace('’', "'").replace('—', ' ')).split()
want = norm(' '.join(l['text'] for l in json.load(open(f'{D}/script.json')))); have = norm(got)
import difflib
sm = difflib.SequenceMatcher(None, want, have); print('match ratio', round(sm.ratio(), 3))
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op != 'equal': print(op, ' '.join(want[a0:a1]), '->', ' '.join(have[b0:b1]))
print('TRANSCRIPT:', got)
