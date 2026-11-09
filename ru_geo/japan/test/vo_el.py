# Озвучка теста голосом канала (ElevenLabs v3, Todd), по одной фразе — так известна точная длина каждой.
# Ключ подставляет прокси окружения (в коде ключа нет). Не больше 1 запроса одновременно, пауза 3 с.
import json, os, subprocess, time
D = os.path.dirname(os.path.abspath(__file__))
from script import LINES
VOICE = 'g14YnDYCsy3k7XLlcKlO'
TAGS = {0: '[curious] ', 3: '[chuckles] ', 6: '[warmly] '}
os.makedirs(f'{D}/vo_el', exist_ok=True)
for i, l in enumerate(LINES):
    out = f'{D}/vo_el/{i:02d}.mp3'
    if os.path.exists(out) and os.path.getsize(out) > 5000: continue
    body = json.dumps(dict(text=TAGS.get(i, '') + l['text'], model_id='eleven_v3', voice_settings=dict(stability=0.0, similarity_boost=0.8)))
    r = subprocess.run(['curl', '-sS', '-o', out, '-w', '%{http_code}', '-X', 'POST',
                        f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192',
                        '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '-d', body], capture_output=True, text=True).stdout
    print(i, r, os.path.getsize(out), flush=True); time.sleep(3)
durs = [float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{D}/vo_el/{i:02d}.mp3'], capture_output=True, text=True).stdout) for i in range(len(LINES))]
json.dump(durs, open(f'{D}/vo_el/durs.json', 'w')); print([round(d, 2) for d in durs], round(sum(durs), 1))
