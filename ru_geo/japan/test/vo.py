# Тестовая озвучка (бесплатный голос Microsoft Edge TTS «Дмитрий»; только для черновика — в выпуск пойдёт голос владелицы канала).
# Каждая фраза — отдельный файл, чтобы знать её точную длину для монтажа.
import asyncio, json, os, subprocess, sys, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'   # сертификат прокси окружения
import edge_tts
D = os.path.dirname(os.path.abspath(__file__))
from script import LINES
async def one(i, text):
    out = f'{D}/vo/{i:02d}.mp3'
    if os.path.exists(out) and os.path.getsize(out) > 2000: return
    for k in range(15):
        try:
            await edge_tts.Communicate(text, 'ru-RU-DmitryNeural', rate='-6%').save(out); return
        except Exception as e:
            print('retry', i, type(e).__name__, flush=True); await asyncio.sleep(6)
    raise SystemExit('tts failed')
os.makedirs(f'{D}/vo', exist_ok=True)
for i, l in enumerate(LINES):
    asyncio.run(one(i, l['text']))
durs = [float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{D}/vo/{i:02d}.mp3'],
                             capture_output=True, text=True).stdout) for i in range(len(LINES))]
json.dump(durs, open(f'{D}/vo/durs.json', 'w')); print([round(d, 2) for d in durs], round(sum(durs), 1))
