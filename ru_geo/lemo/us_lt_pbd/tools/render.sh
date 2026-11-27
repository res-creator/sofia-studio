#!/bin/sh
# Resumable render (the container restarts often): workers write out/frames/f_%05d.jpg, skipping frames on disk.
#   sh tools/render.sh [workers]     start detached workers (default 2)   ·   sh tools/render.sh encode
# Pale Blue Dot: 16.50 s × 30 fps → 495 frames (clip 0 = film 89.10).
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; N=495; OUT=/home/user/sofia-studio/ru_geo/universe_size/video/parts/lt_pbd.mp4
mkdir -p "$FR" "$HERE/out"
if [ "$1" = "encode" ]; then
  n=$(ls "$FR" | grep -c '^f_.*\.jpg$'); [ "$n" -ge "$N" ] || { echo "only $n/$N frames"; exit 1; }
  mkdir -p "$(dirname "$OUT")"
  ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v $N -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT"
  (cd "$HERE" && node --input-type=module -e "import { EVENTS } from './timeline.js'; import fs from 'fs'; fs.writeFileSync('$(dirname "$OUT")/lt_pbd_events.json', JSON.stringify(EVENTS, null, 1) + '\n');")
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
WK=${1:-2}; per=$(( (N + WK - 1) / WK )); i=0
cd "$LIB"
while [ $i -lt $WK ]; do
  a=$((i * per)); b=$((a + per)); [ $b -gt $N ] && b=$N
  setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 $a $b > "$HERE/out/render_$i.log" 2>&1 < /dev/null &
  i=$((i + 1))
done
echo started $WK
