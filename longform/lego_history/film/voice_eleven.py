# Final voice for the LEGO film: ElevenLabs, voice "Bryan - Charismatic & Professional" (chosen by the owner), model eleven_multilingual_v2.
# Writes chapters/<ch>/vo/<id>.mp3 (the Fish temp voice is kept in vo_fish/). No key in code: the session proxy adds the credential.
# One request at a time, ~3 s apart (owner's rule: max 2 at once). previous_text/next_text keep the intonation continuous between lines.
# Usage: python3 film/voice_eleven.py [line_id ...]   (no ids = every line)   then: python3 film/align.py
import json, os, sys, time, glob, shutil, subprocess
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE, MODEL = 'bPMKpgEe88vKSwusXTMU', 'eleven_multilingual_v2'
SPEAK = [('Jørgen Vig Knudstorp', 'Yorgen Vig Knudstorp'), ('Kjeld', 'Kyeld'), ('Godtfred', 'Godfred'), ('"leg godt."', '"leg got."')]
def speak(t):
    for a, b in SPEAK: t = t.replace(a, b)
    return t
only = set(sys.argv[1:])
lines = []
for sj in sorted(glob.glob(f'{D}/chapters/*/script.json')): lines += [(os.path.dirname(sj), L) for L in json.load(open(sj))]
for i, (ch, L) in enumerate(lines):
    if only and L['id'] not in only: continue
    out = f"{ch}/vo/{L['id']}.mp3"; os.makedirs(f'{ch}/vo_fish', exist_ok=True)
    if os.path.exists(out) and not os.path.exists(f"{ch}/vo_fish/{L['id']}.mp3"): shutil.copy(out, f"{ch}/vo_fish/{L['id']}.mp3")
    body = {'text': speak(L['text']), 'model_id': MODEL, 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75, 'style': 0.2, 'use_speaker_boost': True},
            'previous_text': speak(lines[i - 1][1]['text']) if i else None, 'next_text': speak(lines[i + 1][1]['text']) if i + 1 < len(lines) else None}
    for k in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '120', '-o', out + '.tmp', '-w', '%{http_code}', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192',
                            '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '--data', json.dumps(body)], capture_output=True, text=True)
        if r.stdout == '200' and os.path.getsize(out + '.tmp') > 2000: os.replace(out + '.tmp', out); break
        print('retry', L['id'], r.stdout, open(out + '.tmp', 'rb').read(200) if os.path.exists(out + '.tmp') else b'', flush=True); time.sleep(6 * (k + 1))
    print(L['id'], r.stdout, flush=True); time.sleep(3)
