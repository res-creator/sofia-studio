#!/bin/sh
# Sealand, 1978: the mercenaries, the son of Bates retakes the platform, Germany sends a diplomat — two real photos of the
# platform on the light table — silent clip, 18.89 s, 1920x1080, 30 fps (clip 0 = film 463.81).   sh build.sh   (LIB defaults to
# /root/lemo-opuscar). Resumable.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
A=/home/user/sofia-studio/ru_geo/create_country/archive/img
[ -f "$HERE/fonts/.deep" ] || { "$PY" -I "$HERE/tools/fonts.py" "$HERE" && touch "$HERE/fonts/.deep"; }
[ -f "$HERE/assets/tex/aerial.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/sealand_aerial.jpg" "$HERE" aerial.jpg 1600 40
[ -f "$HERE/assets/tex/tower.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/sealand_tower.jpg" "$HERE" tower.jpg 1920 40
sh "$HERE/tools/render.sh" 1      # then, when all frames exist: sh tools/render.sh encode && rm -rf out/frames
