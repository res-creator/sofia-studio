#!/bin/sh
# Challenger Deep: the bathyscaphe «Trieste» (1960) and HMS Challenger (1872 engraving) on the light table — silent clip,
# 24.94 s, 1920x1080, 30 fps (clip 0 = film 316.65).   sh build.sh   (LIB defaults to /root/lemo-opuscar). Resumable.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
A=/home/user/sofia-studio/ru_geo/remote_places/archive/img
[ -f "$HERE/fonts/.deep" ] || { "$PY" -I "$HERE/tools/fonts.py" "$HERE" && touch "$HERE/fonts/.deep"; }
[ -f "$HERE/assets/tex/trieste.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/trieste_1960.jpg" "$HERE" trieste.jpg 1920 40
[ -f "$HERE/assets/tex/challenger.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/hms_challenger.jpg" "$HERE" challenger.jpg 1920 40
sh "$HERE/tools/render.sh" 2      # then, when all frames exist: sh tools/render.sh encode && rm -rf out/frames
