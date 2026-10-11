# Generate ep3 voice-over: python3 ep3/gen_vo.py [id ...]   (skips existing mp3; 2 s between calls, one at a time)
# Auth: ELEVEN_API_KEYS env if set, otherwise the sandbox proxy injects the key. Never write keys into files.
import json, sys, os, time, base64, subprocess
VOICES = {  # who: (voice_id, model, settings)
 'sofia': ('cgSgspJ2msm6clMCkdW9', {'stability': 0.5, 'similarity_boost': 0.8}),
 'gus':   ('JBFqnCBsd6RMkjVDRZzb', {'stability': 0.5, 'similarity_boost': 0.8}),
 'drmax': ('iP95p4xoKVk53GoZ742B', {'stability': 0.5, 'similarity_boost': 0.8}),   # Chris
 'anna':  ('XrExE9yKIg1WjnnlVkGX', {'stability': 0.5, 'similarity_boost': 0.8}),   # Matilda
 'announcer': ('XrExE9yKIg1WjnnlVkGX', {'stability': 0.5, 'similarity_boost': 0.8}),
 'bob':   ('pNInz6obpgDQGcFmaJgB', {'stability': 0.5, 'similarity_boost': 0.8}),   # Adam
 'gary':  ('CwhRBWXzGAHq8TQ4Fs17', {'stability': 0.5, 'similarity_boost': 0.8}),   # Roger
}
here = os.path.dirname(os.path.abspath(__file__))
keys = [k.strip() for k in os.environ.get('ELEVEN_API_KEYS', '').split(',') if k.strip()] or [None]
lines = json.load(open(here + '/lines.json'))
ids = sys.argv[1:] or list(lines)
for i in ids:
    out = f'{here}/vo/{i}.mp3'
    if os.path.exists(out): continue
    vid, vs = VOICES[lines[i]['who']]
    body = json.dumps({'text': lines[i]['text'], 'model_id': 'eleven_v3', 'voice_settings': vs})
    cmd = ['curl', '-s', '-m', '180', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128',
           '-H', 'Content-Type: application/json', '--data-binary', '@-']
    if keys[0]: cmd += ['-H', 'xi-api-key: ' + keys[0]]
    j = json.loads(subprocess.run(cmd, input=body.encode(), capture_output=True).stdout or b'{}')
    if 'audio_base64' not in j: raise SystemExit(f'{i}: {str(j)[:300]}')
    open(out, 'wb').write(base64.b64decode(j['audio_base64']))
    json.dump(j.get('alignment'), open(f'{here}/vo/{i}.align.json', 'w'))
    print('ok', i, flush=True); time.sleep(2.5)
