# Шаблон «Что ты слышишь / что сказано» (слитная речь)
Озвучка: `python3 tts_el.py <workdir>` (ElevenLabs, голос героини, по одному запросу с паузой 3 с, ключ подставляет прокси) или бесплатная `python3 tts_kokoro.py <workdir> <models_dir>`.
Медленные версии и итог ускоряем `ffmpeg -af atempo=1.3`, иначе ElevenLabs тянет паузы между словами.
Дальше: `python3 timeline.py <workdir>` -> `node render.js <workdir> <silent.mp4>` -> `python3 mix.py <workdir>` (громкость и компрессия внутри) ->
`ffmpeg -i silent.mp4 -i audio.wav -c:v copy -c:a aac -b:a 192k out.mp4`. Новые фразы: правка `script.json` (запас фраз в `spare_items`). Обложка: `node render.js <workdir> cover.png 0`.
