#!/bin/sh
# First descents: Piccard and Walsh in the «Trieste» sphere and the bathyscaphe on the surface (1960), a card for James Cameron (2012)
# — silent clip, 18.13 s, 1920x1080, 30 fps (clip 0 = film 335.43).   sh build.sh   (LIB defaults to /root/lemo-opuscar). Resumable.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
A=/home/user/sofia-studio/ru_geo/deadly_places/archive/img
[ -f "$HERE/fonts/.deep" ] || { "$PY" -I "$HERE/tools/fonts.py" "$HERE" && touch "$HERE/fonts/.deep"; }
[ -f "$HERE/assets/tex/trieste.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/trieste_1960.jpg" "$HERE" trieste.jpg 1920 40
[ -f "$HERE/assets/tex/pw.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/piccard_walsh.jpg" "$HERE" pw.jpg 1920 40
sh "$HERE/tools/render.sh" 2      # then, when all frames exist: sh tools/render.sh encode && rm -rf out/frames
