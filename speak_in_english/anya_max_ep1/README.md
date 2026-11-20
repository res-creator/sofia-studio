# «Аня и Макс. Вьетнам» — серия 1 «Сама» (рисованный стиль)

Пара переехала во Вьетнам: Макс говорит по-английски и весь день на созвонах, Аня — A1 и пробует справиться сама.
Сценарий и идея сериала: `speak_in_english/notes/SERIES_VIETNAM_VARYA.md` (ветка claude/stoic-darwin-80cvue).

- `people.js` — новые герои: Аня, Макс, курьер, продавщица (кисть, как cast.js); `node sheet.js` → out/cast_sheet.png
- `render.js` — сцены: квартира, приложение доставки, дверь, рынок, вечер без света, финал «beautiful = покупательница»
```
node render.js still 10,25
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover 22.3
```
