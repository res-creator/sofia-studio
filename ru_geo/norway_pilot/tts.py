# Озвучка абзацев: Fish Audio, голос «Russian» (глубокий дикторский, ru), бесплатная модель s2.1-pro-free.
# Ключ в коде не нужен: в облачной сессии его подставляет прокси. Потом align.py находит тайминги склеек.
import json, re, subprocess, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import PARAS
VOICE = '48ec28a45588422b977a86460c11977f'   # «Энергичный Рассказчик» (Fish Audio, публичная модель; голос №1, выбран владелицей)
MODEL = 's2.1-pro-free'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vo'); os.makedirs(OUT, exist_ok=True)
only = sys.argv[1:]
for name, raw in PARAS:
    if only and name not in only: continue
    text = re.sub(r'\[\[\w+\]\]', '', raw).strip()
    body = json.dumps({"text": text, "reference_id": VOICE, "format": "mp3", "mp3_bitrate": 192, "normalize": True})
    r = subprocess.run(['curl', '-sS', '-m', '300', '-X', 'POST', 'https://api.fish.audio/v1/tts',
                        '-H', 'Authorization: Bearer ' + os.environ.get('FISH_API_KEY', 'proxy'), '-H', 'model: ' + MODEL,
                        '-H', 'Content-Type: application/json', '--data-binary', '@-', '-o', f'{OUT}/{name}.mp3', '-w', '%{http_code}'],
                       input=body.encode(), capture_output=True, text=False)
    code = r.stdout.decode()
    if code != '200': raise SystemExit(f'{name}: HTTP {code} {open(f"{OUT}/{name}.mp3", "rb").read()[:300]}')
    print(name, 'ok'); time.sleep(2)
