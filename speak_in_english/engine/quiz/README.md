# Шаблон «Квиз: Лондон против Нью-Йорка» (новый формат, не трогает старый движок)
Тёмно-тёплая палитра, русский вопрос, отсчёт, две карточки (London / New York).
Порядок: `python3 tts.py <workdir>` (ElevenLabs, по одной реплике, пауза 3 с, ключ подставляет прокси) ->
`python3 timeline.py <workdir>` -> `node render.js <workdir> <silent.mp4>` -> `python3 mix.py <workdir>` ->
`ffmpeg -i silent.mp4 -i audio.wav -c:v copy -c:a aac -b:a 192k out.mp4`. Новые фразы: правка `script.json`.
Обложка: `node render.js <workdir> cover.png 0`.
