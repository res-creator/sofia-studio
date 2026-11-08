# Voice for "The Match King": ElevenLabs, voice Bryan (chosen by the owner), eleven_multilingual_v2 — same settings as the LEGO film.
# Reads the lines from script_v1.md (**id** text [refs]), writes vo/<id>.mp3. One request at a time, ~3 s apart. No key in code (the proxy adds it).
# Usage: python3 voice.py [line_id ...]
import re, json, os, sys, time, subprocess
D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(f'{D}/vo', exist_ok=True)
VOICE, MODEL = 'bPMKpgEe88vKSwusXTMU', 'eleven_multilingual_v2'
SPEAK = [('Kreuger', 'Kroyger'), ('Kalmar', 'Kalmar'), ('Lee, Higginson', 'Lee Higginson')]
L = [(i, re.sub(r'\s*\[[\d,]+\]\s*$', '', t).strip()) for i, t in re.findall(r'^\*\*(\w+)\*\* (.+)$', open(f'{D}/script_v1.md').read(), re.M)]
json.dump(L, open(f'{D}/vo/lines.json', 'w'), ensure_ascii=False, indent=0)
def speak(t):
    for a, b in SPEAK: t = t.replace(a, b)
    return t
only = set(sys.argv[1:])
for k, (i, t) in enumerate(L):
    if only and i not in only: continue
    out = f'{D}/vo/{i}.mp3'
    if not only and os.path.exists(out): continue
    body = {'text': speak(t), 'model_id': MODEL, 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.2, 'use_speaker_boost': True},
            'previous_text': speak(L[k - 1][1]) if k else None, 'next_text': speak(L[k + 1][1]) if k + 1 < len(L) else None}
    for a in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '120', '-o', out + '.tmp', '-w', '%{http_code}', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192',
                            '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '--data', json.dumps(body)], capture_output=True, text=True)
        if r.stdout == '200' and os.path.getsize(out + '.tmp') > 2000: os.replace(out + '.tmp', out); break
        print('retry', i, r.stdout, flush=True); time.sleep(6 * (a + 1))
    print(i, r.stdout, flush=True); time.sleep(3)
