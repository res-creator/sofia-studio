#!/bin/sh
# Mercator: portrait, the 1569 wall map (sheet 1 of 14) and the 1595 «Atlas» title page on the light table — silent clip,
# 33.80 s, 1920x1080, 30 fps (clip 0 = film 44.20).   sh build.sh   (LIB defaults to /root/lemo-opuscar). Resumable.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
A=/home/user/sofia-studio/ru_geo/country_sizes/archive/img
[ -f "$HERE/fonts/.merc" ] || { "$PY" -I "$HERE/tools/fonts.py" "$HERE" && touch "$HERE/fonts/.merc"; }
[ -f "$HERE/assets/tex/portrait.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/mercator_portrait.jpg" "$HERE" portrait.jpg 1920 40
[ -f "$HERE/assets/tex/map1569.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/mercator_1569_map.jpg" "$HERE" map1569.jpg 1920 0 95,50,1920,2575
[ -f "$HERE/assets/tex/atlas1595.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/atlas_1595.jpg" "$HERE" atlas1595.jpg 1920 40
sh "$HERE/tools/render.sh" 2      # then, when all frames exist: sh tools/render.sh encode && rm -rf out/frames
