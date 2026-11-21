# «Читаем по цепочке», выпуск 1 — история от рассказчика (школьный урок английского)

Сценарий: `speak_in_english/notes/SCRIPT_READ_ONE_BY_ONE.md` (ветка claude/stoic-darwin-80cvue), после критика.
Учим: thoroughly («ТхА-рэ-ли» = тщательно), May I go out? → Can I go to the bathroom?, on duty.
Голоса (ElevenLabs): рассказчик — свой голос (HZ9z…), англичанка — Veronica, Саша — Garry, хор класса — 4 голоса вместе.
Музыка: новая, ElevenLabs Music (пиццикато, лёгкая), `sfx/music.mp3`.
```
python3 voice/gen.py && python3 voice/stt.py     # хор: ffmpeg amix ca..cd -> c1.mp3
node render.js still 1                           # готовит wav до параллельного рендера
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover
```
