# Cruise Ship — "Zombie Outbreak: 30 Days Trapped on a Cruise Ship"

Как продолжить работу без Claude Code. Всё нужное лежит в этой папке.

## Статус (19 октября)
Эпизод собран: `out/zombie_outbreak_cruise.mp4` (5:00), лёгкая версия `out/zombie_outbreak_cruise_light.mp4`,
субтитры `out/cruise.srt`, обложка `out/thumbnail.png`, тексты для YouTube `upload_kit.txt`, раскадровка `out/timeline_sheet.png`.
Чтобы что-то поправить: изменить сцену в `scenes/*.js` → `node render.js video sNN out/blocks/sNN.mp4` → `SKIP_RENDER=1 sh build.sh`.

## Что уже готово
- Сценарий: `SCRIPT.md` (сцены, логика, правдоподобность), текст реплик: `script.json`.
- План производства: `PRODUCTION_PLAN.md`; правила канала: `../PRODUCTION_RULES.md`.
- Озвучка: все 50 реплик в `vo/*.mp3` + `vo/*.json` (тайминги слов). Рассказчик Brian, Rosa — Bella,
  капитан — Bill, береговая охрана — Adam, голос с мостика — Eric. Перегенерация: `python3 tts.py` (нужен доступ к api.elevenlabs.io).
- Звуки: `sfx/*.mp3` (список и промпты — `make_sfx.py`, лог — `sfx/log.txt`). Плюс звуки из `../ep1/sfx`.
- Персонажи: `lib/cast.js` (WAITER, ROSA, заражённые), лист персонажей `out/cast_sheet.png` (`node sheet.js out/cast_sheet.png`).
- Локации: `lib/ship.js`, лист локаций `out/sets_sheet.png` (`node setsheet.js out/sets_sheet.png`).
- Предметы: `lib/props.js`. Монтажный лист (порядок реплик и пауз): `seq.js` (`node seq.js` печатает длительности).
- Сцены: `scenes/a.js` (s01–s03), `scenes/b.js` … `scenes/e.js` — по группам (см. `scenes/index.js`).

## Требования
Node 18+, Python 3 + numpy, ffmpeg. В корне `survival/` выполнить `npm install` (нужен пакет `@napi-rs/canvas`).

## Команды (из папки `survival/cruise`)
- Кадры для проверки: `node render.js still s04 0.5,2,4 out/check.png` (время — от начала сцены).
- Видео одной сцены: `node render.js video s04 out/s04.mp4`.
- Проверка рук/поз: `node render.js qa s04` (должно быть `QA ok`).
- Полная сборка: `sh build.sh` (звук → субтитры .srt → все сцены → склейка → обложка).

## Если сцена ещё не написана
Скопировать структуру из `scenes/a.js`: функция `sNN(ctx, t, TL)` рисует кадр в момент `t`;
`TL.s('s04_1')` — начало реплики, камера `cam(ctx, t, [[время, x, y, zoom, 'cut'|'s'|'m'], ...])`.
Что должно быть в кадре — подробно расписано в `SCRIPT.md` по каждой сцене.
