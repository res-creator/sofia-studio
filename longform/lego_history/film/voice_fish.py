# Voice for the LEGO film: Fish Audio TTS (free model s2.1-pro-free), voice "Conversational Narrator" (542fc7aab61e4561bae5ebd536d717c0),
# speed 0.9. Writes chapters/<ch>/vo/<id>.mp3. No key in code: the request goes through the session proxy, which adds the credential.
# Names are respelled ONLY for the speech engine (SPEAK); subtitles and alignment use the script text.
# Usage: python3 film/voice_fish.py [line_id ...]   (no ids = every line that has no mp3 yet)
import json, os, sys, time, glob, subprocess
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE, MODEL = '542fc7aab61e4561bae5ebd536d717c0', 's2.1-pro-free'
SPEAK = [('Jørgen Vig Knudstorp', 'Yorgen Vig Knudstorp'), ('Kjeld', 'Kyeld'), ('Godtfred', 'Godfred'), ('Poul Plougmann', 'Paul Plowman'),
         ('"leg godt."', '"leg got."'), ('Toys "R" Us', 'Toys R Us')]
def speak(t):
    for a, b in SPEAK: t = t.replace(a, b)
    return t
only = set(sys.argv[1:])
for sj in sorted(glob.glob(f'{D}/chapters/*/script.json')):
    ch = os.path.dirname(sj); os.makedirs(f'{ch}/vo', exist_ok=True)
    for L in json.load(open(sj)):
        out = f"{ch}/vo/{L['id']}.mp3"
        if (only and L['id'] not in only) or (not only and os.path.exists(out)): continue
        body = json.dumps({'text': speak(L['text']), 'reference_id': VOICE, 'format': 'mp3', 'mp3_bitrate': 192, 'normalize': True, 'prosody': {'speed': 0.9}})
        for k in range(5):
            r = subprocess.run(['curl', '-sS', '-o', out, '-w', '%{http_code}', '-X', 'POST', 'https://api.fish.audio/v1/tts', '-H', 'Authorization: Bearer proxy',
                                '-H', 'Content-Type: application/json', '-H', f'model: {MODEL}', '--data', body], capture_output=True, text=True)
            if r.stdout == '200' and os.path.getsize(out) > 2000: break
            print('retry', L['id'], r.stdout, open(out, 'rb').read(200) if os.path.exists(out) else b''); time.sleep(4 * (k + 1))
        print(L['id'], r.stdout, flush=True); time.sleep(2)
