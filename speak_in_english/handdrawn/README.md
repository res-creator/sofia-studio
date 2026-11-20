# Наши герои в рисованном стиле «Шуша и Кеша» + песня
- `hand_kit.js` — набор кисти из `shusha/render_hand.js` (ветка claude/eloquent-brahmagupta-nf3pp4): мазки, «картошка», трубки, акварель, бумага, комната, кисти с пальцами.
- `cast.js` — героиня (каре, жёлтый кардиган, блузка в горошек) и Том (синий свитер). Позы: down, hips, up, cheer, pointL, pointR, cross, shrug, head, presentL, presentR. Эмоции: neutral, happy, surprised, angry, smug, sleepy.
- `handsong.js` — ролик-песня по таймлайну из `speak_in_english/engine/eps/song/timeline.json` (ветка claude/song-ep): `node handsong.js <timeline.json> a b part.mp4` (4 части параллельно), превью `--png=t1,t2 <dir>`. Звук: `audio.wav` из `song/build_tl.py`.
- `sheet.js` — лист персонажей.
Запуск: папку положить рядом с `shusha/` в checkout ветки claude/eloquent-brahmagupta-nf3pp4 (переименовав в `ourcast/`) и сделать `npm install` в корне (@napi-rs/canvas, @fontsource/neucha).
