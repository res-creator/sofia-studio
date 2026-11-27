#!/bin/sh
# Hubble Ultra Deep Field (+ Webb's first deep field) on the light table — silent clip, 41.30 s, 1920x1080, 30 fps
# (clip 0 = film 318.50).   sh build.sh      (LIB defaults to /root/lemo-opuscar). Resumable: rerun after a container restart.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
A=/home/user/sofia-studio/ru_geo/universe_size/archive
[ -f "$HERE/fonts/NotoSerif-600.woff2" ] || "$PY" -I "$HERE/tools/fonts.py" "$HERE"
[ -f "$HERE/assets/tex/hudf.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/src_dl/GSFC_20171208_Archive_e001061_orig.jpg" "$HERE" hudf.jpg 2300
[ -f "$HERE/assets/tex/webb.jpg" ] || "$PY" -I "$HERE/tools/prep.py" "$A/img/jwst2.jpg" "$HERE" webb.jpg 1881
sh "$HERE/tools/render.sh" 2      # then, when all frames exist: sh tools/render.sh encode && rm -rf out/frames
