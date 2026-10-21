# v2 (new lines n01-n05; m-lines copied from vo/). Voice-over for "Why Her Medical Bill Doubled": one ElevenLabs request per scene line (voice Chris, American),
# with previous/next text for continuous intonation. Keys via ELEVEN_API_KEYS (never in code). Usage: python3 vo.py
import json, sys, base64, os, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import el
D = os.path.dirname(os.path.abspath(__file__))
VOICE = 'iP95p4xoKVk53GoZ742B'  # Chris - premade, american, conversational
LINES = json.load(open(f'{D}/script_v2.json'))
for i, L in enumerate(LINES):
    out = f"{D}/vo_v2/{L['id']}.mp3"
    if os.path.exists(out): continue
    body = json.dumps({'text': L['text'], 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.3, 'use_speaker_boost': True},
        'previous_text': ' '.join(x['text'] for x in LINES[:i])[-400:], 'next_text': LINES[i + 1]['text'] if i + 1 < len(LINES) else ''})
    j = el._call(el.KEYS[0], f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128', body)
    if 'audio_base64' not in j: raise SystemExit(f"EL error {L['id']}: {str(j)[:300]}")
    open(out, 'wb').write(base64.b64decode(j['audio_base64'])); json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w'))
    print(L['id'], 'ok'); time.sleep(3)
