# «Жизнь слова», выпуск 1 «GET» — рубрика-скетч (слова — живые персонажи)

Сценарий (после критика): `speak_in_english/notes/SKETCH_RUBRICS.md` (ветка claude/stoic-darwin-80cvue).
GET работает за всех → падает от переработки → слова-аристократы OBTAIN, RECEIVE, BECOME говорят ужасно официально → GET возвращается → отпуск длится 0,4 секунды → тизер FINE.

- `folk.js` — конструктор героев; `cast_get.js` — герои выпуска; `node sheet.js` → out/cast_sheet.png
```
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover 28.8
```
