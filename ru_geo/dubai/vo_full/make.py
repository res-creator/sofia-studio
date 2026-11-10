# Озвучка «Дубая» голосом Todd (ElevenLabs v3) по абзацам vo_full/lines.json. Ключ подставляет прокси.
# По одному запросу, пауза 3 с; ответ пишем во временный файл и сохраняем только при коде 200; готовые файлы не трогаем.
import json, os, subprocess, time
D = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(f'{D}/lines.json'))
FMT = os.environ.get('FMT', 'mp3_44100_192')
for it in L:
    out = f'{D}/{it["id"]}.mp3'
    if os.path.exists(out) and os.path.getsize(out) > 5000: continue
    tmp = out + '.part'
    body = json.dumps(dict(text=it['text'], model_id='eleven_v3', voice_settings=dict(stability=0.0, similarity_boost=0.8)))
    r = subprocess.run(['curl', '-sS', '-o', tmp, '-w', '%{http_code}', '-X', 'POST',
                        f'https://api.elevenlabs.io/v1/text-to-speech/g14YnDYCsy3k7XLlcKlO?output_format={FMT}',
                        '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '-d', body], capture_output=True, text=True).stdout
    if r == '200': os.replace(tmp, out); print(it['id'], 'ok', os.path.getsize(out), flush=True)
    else: print(it['id'], 'ERR', r, open(tmp, errors='ignore').read()[:200], flush=True); os.remove(tmp)
    time.sleep(3)
