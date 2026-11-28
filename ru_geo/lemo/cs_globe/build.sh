#!/bin/sh
# Build the globe clip (7.23 s, 1920x1080, 30 fps, silent) → ru_geo/country_sizes/video/parts/globe.mp4 + globe_events.json
#   sh build.sh              data if missing, then frames (resumable), encode, events
#   FETCH=1 sh build.sh      re-download the world imagery and redo the outlines
#   SS=2 sh build.sh         2x supersampling (default 1: this container renders WebGL in software)
#   SHAPELY_PY=...           a python with numpy + shapely for tools/outlines.py (default: python3)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
PY=${PY:-"$LIB/.venv/bin/python"}
OUT=${OUT:-/home/user/sofia-studio/ru_geo/country_sizes/video/parts}
FR=${FR:-$HERE/out/frames}
N=217   # 7.23 s × 30
mkdir -p "$HERE/raw" "$HERE/assets" "$OUT" "$FR"
cd "$LIB"
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/world.jpg" ]; then "$PY" -I "$HERE/tools/fetch_world.py" "$HERE"; fi
if [ ! -f "$HERE/raw/countries.geo.json" ]; then
  curl -sfL -o "$HERE/raw/countries.geo.json" https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json; fi
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/outlines.json" ]; then "${SHAPELY_PY:-python3}" -I "$HERE/tools/outlines.py" "$HERE"; fi
[ -f "$HERE/fonts/FiraSansCondensed-600-sub.woff2" ] || python3 -I "$HERE/tools/fonts.py" "$HERE"
# frames (skips frames already on disk; two workers)
node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 109 "ss=${SS:-1}" &
node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 109 $N "ss=${SS:-1}" &
wait
ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v $N -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT/globe.mp4"
cp "$HERE/globe_events.json" "$OUT/globe_events.json"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/globe.mp4"
