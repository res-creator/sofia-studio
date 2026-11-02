# Voice-over for episode 12 "The Great Emu War": channel voice from VOICE.md (Chris, eleven_multilingual_v2, test-A settings),
# one ElevenLabs request per line with previous/next text for continuous intonation; each line is generated once.
# Keys via ELEVEN_API_KEYS (never in code; in the cloud env the proxy injects auth: ELEVEN_API_KEYS=proxy). Usage: python3 vo.py
import json, sys, base64, os, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import el
D = os.path.dirname(os.path.abspath(__file__))
VOICE = 'iP95p4xoKVk53GoZ742B'  # Chris - premade, american, conversational
LINES = json.load(open(f'{D}/script.json'))
os.makedirs(f'{D}/vo', exist_ok=True)
for i, L in enumerate(LINES):
    out = f"{D}/vo/{L['id']}.mp3"
    if os.path.exists(out): continue
    body = json.dumps({'text': L['text'], 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.35, 'similarity_boost': 0.8, 'style': 0.55, 'use_speaker_boost': True, 'speed': 0.95},
        'previous_text': ' '.join(x['text'] for x in LINES[:i])[-400:], 'next_text': LINES[i + 1]['text'] if i + 1 < len(LINES) else ''})
    j = el._call(el.KEYS[0], f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128', body)
    if 'audio_base64' not in j: raise SystemExit(f"EL error {L['id']}: {str(j)[:300]}")
    open(out, 'wb').write(base64.b64decode(j['audio_base64'])); json.dump(j['alignment'], open(out[:-4] + '.align.json', 'w'))
    print(L['id'], 'ok'); time.sleep(3)
