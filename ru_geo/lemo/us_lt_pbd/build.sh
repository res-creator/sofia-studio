#!/bin/sh
# Pale Blue Dot on the light table — silent clip, 16.50 s, 1920x1080, 30 fps (clip 0 = film 89.10).
#   sh build.sh      (LIB defaults to /root/lemo-opuscar). Resumable: rerun after a container restart.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
A=/home/user/sofia-studio/ru_geo/universe_size/archive
[ -f "$HERE/fonts/NotoSerif-600.woff2" ] || "$PY" -I "$HERE/tools/fonts.py" "$HERE"
[ -f "$HERE/assets/tex/pbd.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/src_dl/PIA23645_orig.jpg" "$HERE" pbd.jpg 3200
sh "$HERE/tools/render.sh" 2      # then, when all frames exist: sh tools/render.sh encode && rm -rf out/frames
