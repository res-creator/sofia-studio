# Шаблон «речитатив на бите» (пилот)
`python3 build.py <workdir> tts` (ElevenLabs, по одной реплике с паузой 3 с, ключ подставляет прокси) -> `python3 build.py <workdir> timeline` -> `python3 build.py <workdir> mix` (бит, голоса, громкость, огибающая рта) ->
`node render.js <workdir> <silent.mp4>` -> `ffmpeg -i silent.mp4 -i audio.wav -c:v copy -c:a aac -b:a 192k out.mp4`. Текст и темп: `script.json`. Обложка: `node render.js <workdir> cover.png 0.4`.
Свою музыку (Suno и др.) можно подставить вместо синтетического бита: нужны mp3 и тайминги слов.
