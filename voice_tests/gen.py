# Voice test (3 short MP3s): same text, model eleven_multilingual_v2 (the project's model), one request per voice.
# Keys via ELEVEN_API_KEYS (never in code). Usage: python3 gen.py
import json, base64, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import el
D = os.path.dirname(os.path.abspath(__file__))
TEXT = "Sometimes Amazon refunds your order...\n\nAnd tells you to KEEP the item.\n\nSounds like a mistake, right?\n\nNope.\n\nIt's math."
TESTS = [
  ('voice_A_chris.mp3',  'iP95p4xoKVk53GoZ742B', {'stability': 0.35, 'similarity_boost': 0.8, 'style': 0.55, 'use_speaker_boost': True, 'speed': 0.95}),
  ('voice_B_male.mp3',   'UgBBYS2sOqTuMpoF3BR0', {'stability': 0.4,  'similarity_boost': 0.8, 'style': 0.45, 'use_speaker_boost': True, 'speed': 0.97}),
  ('voice_C_female.mp3', 'cgSgspJ2msm6clMCkdW9', {'stability': 0.4,  'similarity_boost': 0.8, 'style': 0.45, 'use_speaker_boost': True, 'speed': 0.97}),
]
for name, vid, vs in TESTS:
    out = f'{D}/{name}'
    if os.path.exists(out): continue
    body = json.dumps({'text': TEXT, 'model_id': 'eleven_multilingual_v2', 'voice_settings': vs})
    j = el._call(el.KEYS[0], f'https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128', body)
    if 'audio_base64' not in j: raise SystemExit(f'EL error {name}: {str(j)[:300]}')
    open(out, 'wb').write(base64.b64decode(j['audio_base64'])); print(name, 'ok'); time.sleep(3)
