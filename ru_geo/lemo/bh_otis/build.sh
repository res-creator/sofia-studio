#!/bin/sh
# Otis print on the light table — silent clip, 15.16 s, 1920x1080, 30 fps.
#   sh build.sh      (LIB defaults to /root/lemo-opuscar)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; PY="$LIB/.venv/bin/python"
OUTD=/home/user/sofia-studio/ru_geo/building_height/video/parts
[ -f "$HERE/fonts/NotoSerif-600.woff2" ] || "$PY" -I "$HERE/tools/fonts.py" "$HERE"
[ -f "$HERE/assets/tex/print.jpg" ] || "$PY" -I "$HERE/tools/prep.py" /home/user/sofia-studio/ru_geo/building_height/archive/img/ph_otis.jpg "$HERE"
cd "$LIB" && node core/render/video.mjs "$HERE" --fps 30 --workers 4 --out "$HERE/out/video.mp4"
mkdir -p "$OUTD"
ffmpeg -y -loglevel error -i "$HERE/out/video.mp4" -t 15.16 -an -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r 30 -movflags +faststart "$OUTD/lighttable.mp4"
cd "$HERE" && node --input-type=module -e "import { EVENTS } from './timeline.js'; import fs from 'fs'; fs.writeFileSync('$OUTD/lighttable_events.json', JSON.stringify(EVENTS, null, 1) + '\n');"
