# Песня-запоминалка на старом движке (пилот)
1. Трек из Suno -> `<workdir>/track.mp3`; тайминги слов: ElevenLabs Scribe (`speech-to-text`, model scribe_v1, timestamps_granularity=word) -> `<workdir>/stt.json`.
2. Вступление/концовка: `python3 song/tts.py <workdir>` (реплики в `song/lines.json`, по одной с паузой 3 с).
3. Таймлайн и звук: из папки engine `python3 song/build_tl.py <workdir>` -> `eps/song/timeline.json` + `<workdir>/audio.wav`.
4. Кадры: `node song.js a b part.mp4` (4 части параллельно), склейка `ffmpeg -f concat`, звук `-i audio.wav`. Превью: `node song.js 0 0 --png=0,300`.
Сцена: `song.js` (кафе, Том слева спрашивает по-русски, героиня справа отвечает по-английски). Утверждённые эпизоды не менялись.
