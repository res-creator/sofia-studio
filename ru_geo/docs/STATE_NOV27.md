# Состояние на 27 ноября 2026 (канал «Мысленный эксперимент»)

## Как собирается ролик сейчас
1. Озвучка: `ru_geo/voices_free/make_clone_vo.py <slug>` (готова у всех).
2. Картинки по смыслу текста (важнее всего, владелица не принимает случайный сток):
   - реальные фото: `flat2d/archive/pick.py <slug>` (Wikimedia, лимит запросов очень строгий, идёт медленно) и `archive/nasa_pick.py <slug>` (только для космоса; для других тем даёт неверное);
   - собственная графика: `flat2d/tools/mapgen.py <slug>` (карты, сравнения площадей, локаторы), `chartgen_bh.py`, `chartgen_bd.py` (диаграммы). Данные границ: johan/world.geo.json;
   - сток Pixabay (ключ PIXABAY_API_KEY, переменная окружения, подхватывается при старте сессии): строго по списку слов `<slug>/stock_require`; `<slug>/no_stock` отключает сток совсем.
3. Сборка: `ru_geo/flat2d/compose/compose_auto.py <slug>`; цепочка с сжатием: scratchpad `composechain.sh <slug>` (пишет compose_status.log). Не запускать две сборки одновременно.
4. Проверка: контрольные кадры (ffmpeg tile), отправка файла ≤50 МБ (`*_share.mp4`).

## Готовые ролики (первая версия)
universe_size (хороший), country_sizes (хороший, свои карты), remote_places, deadly_places, building_height, create_country, country_names (хороший), usa_food (слабый), becoming_dad (черновик). Супермаркет отменён владелицей.

## Что улучшать дальше
- usa_food и becoming_dad: нужны графики и схемы, меньше случайного стока.
- Обложки (нет ни одной), ссылки на видео в постах Пикабу (после загрузки на YouTube).
- Хранилище: .git ~23 ГБ, диск часто заполняется; чистить `ru_geo/stock/px*.mp4` (старые) и tmp* в scratchpad. Если стоит `coverr_db.json` битый, удалить и пересоздастся.
- Правило владелицы: кадры должны соответствовать озвученному тексту; быстрая смена кадров; субтитры мелкие; числа и заголовки крупно, но не часто; музыка тихо под голосом.

## 27 Nov evening: NEW STYLE approved by owner
Owner approved «Инженерная доска» (Lemo-Opuscar briefing-board) + 3D map (map-explainer) + Archive Light Table + typewriter chapter cards.
Trial: ru_geo/building_height/video/trial_styles_brief.mp4. Projects: ru_geo/lemo/ (bh_brief = 0–85.3 s, bh_brief_B/CD/EF/G = chapters,
bh_map = Dubai→Jeddah map, bh_otis = Otis light table). Brief for chapter agents: ru_geo/lemo/BRIEF_BRIEFBOARD.md.
Renders are resumable; keeper: `setsid nohup sh ru_geo/lemo/tools/keep_renders.sh >> scratchpad/keep.log 2>&1 &` (restart after every container restart;
a part renders only when its folder has .render_ready). Full assembly: `python3 ru_geo/lemo/assemble_bh_full.py` (needs all parts in building_height/video/parts).
Old compose pipeline (stock + flat diagrams) is retired for this channel. Next: same style for the other 8 videos.
