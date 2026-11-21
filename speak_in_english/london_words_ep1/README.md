# «Первый день в Лондоне» — 5 слов + бонус (3D house style, our toon cast)
Сценарий: `speak_in_english/notes/SCRIPT_LONDON_WORDS.md` (claude/stoic-darwin-80cvue), после критика.
Слова: cheers, alright?, queue, loo, fancy a…? + бонус love.
Голоса: ElevenLabs eleven_v3 (рассказчик — свой голос, офицер Christopher, бариста Lucy, бабушка Beatrice, паб — смесь).
Реплики n7–n10, g4 — Fish Audio (клон по нашим же клипам; у ElevenLabs закончились кредиты), h4 — вырезан из h3, p1 — смесь голосов.
```
node sprites.js && node prep.js            # sprites, timeline.json, out/mix.wav, SRT
PAGE=full.html node shoot.js still <t,...> # stills
PAGE=full.html node shoot.js video 0:68.09 out/full.mp4   # (в 4 параллельных частях быстрее)
```
