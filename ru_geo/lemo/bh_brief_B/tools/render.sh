#!/bin/sh
# Resumable render (the container restarts often): ONE worker writes out/frames/f_%05d.jpg, skipping frames on disk.
#   sh tools/render.sh          start the worker (in the background, detached)   ·   sh tools/render.sh encode
# Part B: 96.56 s × 30 fps → 2897 frames (local 0 = film 85.30).
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; N=2897; OUT=/home/user/sofia-studio/ru_geo/building_height/video/parts/board_brief_B.mp4
mkdir -p "$FR" "$HERE/out"
if [ "$1" = "encode" ]; then
  n=$(ls "$FR" | grep -c '^f_.*\.jpg$'); [ "$n" -ge "$N" ] || { echo "only $n/$N frames"; exit 1; }
  ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v $N -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT"
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
cd "$LIB"
setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 $N > "$HERE/out/render_0.log" 2>&1 < /dev/null &
echo started
