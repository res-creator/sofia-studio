# Реплики героев для пилота (ElevenLabs v3). Ключ подставляет прокси; 1 запрос за раз, пауза 3 с.
import json, time, urllib.request, os
P, K = 'pM78bgjPVk0JXtaEnFoj', 'g1G73EpCIdK4HUyDiLYF'
LINES = [('k1', K, '[panicked] Товарищ подполковник!'), ('k2', K, '[scared] Что делать?!'), ('k3', K, '[urgent] Надо докладывать наверх!'),
         ('p1', P, '[calm, firm] Ложное срабатывание.'), ('k4', K, '[nervous whisper] А если нет?..'), ('p2', P, '[quietly] Если бы это была война, их было бы сотни.')]
for k, v, txt in LINES:
    f = f'{k}.mp3'
    if os.path.exists(f): continue
    body = json.dumps({'text': txt, 'model_id': 'eleven_v3', 'language_code': 'ru', 'voice_settings': {'stability': 0.5}}).encode()
    r = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{v}?output_format=mp3_44100_128', data=body, headers={'xi-api-key': 'dummy', 'Content-Type': 'application/json'})
    open(f, 'wb').write(urllib.request.urlopen(r).read()); print(k, 'ok'); time.sleep(3)
