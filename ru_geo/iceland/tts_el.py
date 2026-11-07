# Финальная озвучка: ElevenLabs v3, голос Todd (выбран владелицей 7.11.2026; до этого Leonid Fomichev — копия в cache/vo_leonid).
# Паузы/усмешки/эмоции — из tags.py (в сценарий и субтитры не попадают). Ключ не нужен: его подставляет прокси облачной сессии
# (локально — переменная окружения ELEVEN_API_KEYS, первый ключ). Не больше 1 запроса за раз, пауза 3 с.
#   python3 tts_el.py            — все абзацы;   python3 tts_el.py intro grin2   — только эти
# Потом: WHISPER=medium python3 align.py → python3 maps.py <все карты> → python3 render.py
import json, os, re, subprocess, sys, time
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from script import PARAS
from tags import tagged
VOICE = 'g14YnDYCsy3k7XLlcKlO'          # Todd - Clear, Engaging and Educational (ElevenLabs Voice Library)
MODEL = 'eleven_v3'
SETTINGS = dict(stability=0.0, similarity_boost=0.8)   # v3: stability 0.0 = «Creative» — живее (так понравилось владелице)
KEY = (os.environ.get('ELEVEN_API_KEYS', '').split(',')[0].strip() or 'proxy')
OUT = f'{D}/vo'; os.makedirs(OUT, exist_ok=True)

def clean(raw): return re.sub(r'\s+', ' ', re.sub(r'\[\[\w*\]\]', '', raw)).strip()

if __name__ == '__main__':
    only = sys.argv[1:]
    for name, raw in PARAS:
        if only and name not in only: continue
        text = tagged(name, clean(raw))
        body = json.dumps(dict(text=text, model_id=MODEL, voice_settings=SETTINGS, language_code='ru'))
        for attempt in range(3):
            r = subprocess.run(['curl', '-sS', '-m', '600', '-X', 'POST', f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192',
                                '-H', 'xi-api-key: ' + KEY, '-H', 'Content-Type: application/json', '--data-binary', '@-',
                                '-o', f'{OUT}/{name}.mp3', '-w', '%{http_code}'], input=body.encode(), capture_output=True)
            code = r.stdout.decode()
            if code == '200': break
            print(name, 'HTTP', code, open(f'{OUT}/{name}.mp3', 'rb').read()[:300], flush=True); time.sleep(10)
        else: raise SystemExit(f'{name}: failed')
        print(name, 'ok', len(text), 'chars', flush=True); time.sleep(3)
