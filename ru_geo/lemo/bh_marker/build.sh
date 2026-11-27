#!/bin/sh
# «Высота зданий» · доска 0–85.3 с в стиле Marker on Paper (Lemo-Opuscar). Немая картинка 1920×1080, 30 к/с.
#   sh build.sh      → ../../building_height/video/parts/board_marker.mp4 и events.json
# Шрифты: fonts/Caveat-700.ttf / Caveat-400.ttf (OFL, статические копии вариативного Caveat из ru_geo/flat2d/board/fonts);
# glyphs.json — их осевые линии (tools/skeleton.py, кириллица + латиница). Машинка: IBM Plex Mono (OFL).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}
OUT=${OUT:-/home/user/sofia-studio/ru_geo/building_height/video/parts/board_marker.mp4}
[ -f "$HERE/glyphs.json" ] || "$LIB/.venv/bin/python" "$HERE/tools/skeleton.py"
cd "$LIB"
node core/render/events.mjs "$HERE" --out "$HERE/events.json"
node core/render/video.mjs "$HERE" --fps 30 --workers "${WORKERS:-2}" --out "$OUT"
# проверки: node tools/check.mjs 0 85.3 0.2 (низ кадра пуст, тексты не обрезаны); node core/render/readcheck.mjs "$HERE"
