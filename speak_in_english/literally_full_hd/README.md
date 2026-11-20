# «Буквально» — полный эпизод, рисованный стиль «Шуша и Кеша»

Тот же сценарий и голоса, что в `speak_in_english/literally_full` (ветка claude/literally-full-ep), но нарисовано кистью:
наши Том и героиня из пилота (`cast.js`, `hand_kit.js` из ветки claude/literally-compare-ep) + новая Мама (в `render.js`).

```
node render.js still 10,25
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover 25
```
Склейка: concat `out/tmp/chunk_*.mp4` + `out/tmp/mix.wav` -> MP4.
