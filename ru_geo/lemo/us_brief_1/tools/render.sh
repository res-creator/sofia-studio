#!/bin/sh
# Resumable render (the container restarts often): ONE worker writes out/frames/f_%05d.jpg, skipping frames on disk.
#   sh tools/render.sh          start the worker (in the background, detached)   ·   sh tools/render.sh encode
# Part 1: 127.70 s × 30 fps → 3831 frames (local 0 = film 0.00).
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; N=3831
OUT=/home/user/sofia-studio/ru_geo/universe_size/video/parts/board_1.mp4
mkdir -p "$FR" "$HERE/out" "$(dirname "$OUT")"
if [ "$1" = "encode" ]; then
  n=$(ls "$FR" | grep -c '^f_.*\.jpg$'); [ "$n" -ge "$N" ] || { echo "only $n/$N frames"; exit 1; }
  ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v $N -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT" || exit 1
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
pgrep -f "frames.mjs $HERE " >/dev/null && { echo "already running"; exit 0; }
cd "$LIB"
setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 $N > "$HERE/out/render_0.log" 2>&1 < /dev/null &
echo started
