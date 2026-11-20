# «Слишком прямо», выпуск 1 «Кофейня» — рубрика-скетч (новые герои в каждом выпуске)

Формула: ошибка «в лоб» → катастрофа с абсурдом → «Стоп. Перематываем» → вежливо → неожиданная концовка → тизер.
Сценарий: `speak_in_english/notes/SKETCH_RUBRICS.md` (ветка claude/stoic-darwin-80cvue).

- `folk.js` — конструктор рисованных людей (причёски, одежда, очки, монокль, шляпы) для новых героев каждого выпуска
- `cast_cafe.js` — герои выпуска; `node sheet.js` → out/cast_sheet.png
- `render.js` — кафе, заморозка с титром, слёзы, обморок менеджера, новости, король, таблички, перемотка VHS, стакан DEEMER, улица
```
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover 24.5
```
