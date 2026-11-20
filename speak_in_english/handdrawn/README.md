# Наши герои в рисованном стиле «Шуша и Кеша»
- `hand_kit.js` — набор кисти, извлечённый из `shusha/render_hand.js` (ветка claude/eloquent-brahmagupta-nf3pp4): мазки, «картошка», трубки, акварель, бумага, комната, кисти с пальцами.
- `cast.js` — наша героиня (каре, жёлтый кардиган, блузка в горошек, джинсы) и Том (каштановые волосы, синий свитер, тёмные джинсы). Позы рук: down, hips, up, pointL, pointR, cross, shrug, head, presentL, presentR. Эмоции: neutral, happy, surprised, angry, smug, sleepy. Рот по громкости (mouth 0..1), моргание (blink).
- `sheet.js` — лист персонажей: `node sheet.js out.png`.
Запуск: положить папку рядом с `shusha/` в checkout ветки claude/eloquent-brahmagupta-nf3pp4 и выполнить `npm install` в корне (нужны @napi-rs/canvas и @fontsource/neucha).
