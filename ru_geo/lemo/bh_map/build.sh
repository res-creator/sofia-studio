#!/bin/sh
# Build the map clip (10.30 s, 1920x1080, 30 fps, silent) → ru_geo/building_height/video/parts/map.mp4
#   sh build.sh              data and fonts if missing, then frames (resumable), encode, events
#   FETCH=1 sh build.sh      re-download the tiles first
#   SS=2 sh build.sh         2x supersampling (default 1: this container renders WebGL in software)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
PY=${PY:-"$LIB/.venv/bin/python"}
OUT=${OUT:-/home/user/sofia-studio/ru_geo/building_height/video/parts}
FR=${FR:-$HERE/out/frames}
mkdir -p "$HERE/raw" "$HERE/assets" "$OUT" "$FR"
cd "$LIB"
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/wide_height.bin" ]; then
  "$PY" -I "$HERE/tools/fetch_wide.py" "$HERE"; "$PY" -I "$HERE/tools/prep_wide.py" "$HERE"   # needs assets/meta.json (world scale, from the demo)
fi
for P in "dxb 54.3 24.2 56.3 25.9" "jed 38.1 20.9 40.1 22.6"; do set -- $P
  if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/$1_height.bin" ]; then
    "$PY" -I "$HERE/tools/fetch_patch.py" "$HERE" "$@"; "$PY" -I "$HERE/tools/prep_patch.py" "$HERE" "$1"; fi
done
[ -f "$HERE/assets/jed_shadow.png" ] && [ "${FETCH:-0}" = "0" ] || "$PY" -I "$HERE/tools/bake.py" "$HERE"
[ -f "$HERE/fonts/FiraSansCondensed-600-sub.woff2" ] || python3 -I "$HERE/tools/fonts.py" "$HERE"
# frames (skips frames already on disk; two workers)
node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 155 "ss=${SS:-1}" &
node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 155 309 "ss=${SS:-1}" &
wait
ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v 309 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT/map.mp4"
cp "$HERE/map_events.json" "$OUT/map_events.json"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/map.mp4"
