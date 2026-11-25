#!/bin/sh
# One command: Whittier, Alaska (3D map, 1920x1080, 24 fps). Needs the Lemo-Opuscar library (core tier) and ffmpeg.
#   FETCH=1 sh build.sh   re-download the map tiles and rebuild the terrain assets first
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
PY="$LIB/.venv/bin/python"
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/height.bin" ]; then
  "$PY" -I "$HERE/tools/fetch.py" "$HERE"; "$PY" -I "$HERE/tools/prep.py" "$HERE"
  "$PY" -I "$HERE/tools/fetch_wide.py" "$HERE"; "$PY" -I "$HERE/tools/prep_wide.py" "$HERE"
  "$PY" -I "$HERE/tools/fetch_world.py" "$HERE"; "$PY" -I "$HERE/tools/fetch_mid.py" "$HERE"; "$PY" -I "$HERE/tools/bake.py" "$HERE"
fi
cd "$LIB"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers "${WORKERS:-3}" --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py"
"$PY" core/render/srt.py "$HERE/voice/cues.json" "$HERE/subtitles_en.srt"
sh "$HERE/tools/master.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/whittier.mp4"
node core/render/still.mjs "$HERE" 22.5 --q nosubs=1 --out "$HERE/out/poster" > /dev/null
ffmpeg -v error -y -i "$HERE/out/poster/t_22.5.jpg" -q:v 3 "$HERE/poster.jpg"
echo "done: $HERE/whittier.mp4"
