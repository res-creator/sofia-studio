#!/bin/sh
# Resumable render (the container restarts often): ONE worker writes out/frames/f_%05d.jpg, skipping frames on disk.
#   sh tools/render.sh          start the worker (in the background, detached)   ·   sh tools/render.sh encode
# Local time = film time − 481.72; 131.82 s at 30 fps → frames 0…3954 (3955 frames), cut to 131.82 s on encode.
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; N=3955; OUT=/home/user/sofia-studio/ru_geo/building_height/video/parts/board_brief_G.mp4
mkdir -p "$FR" "$HERE/out" "$(dirname "$OUT")"
if [ "$1" = "encode" ]; then
  n=$(ls "$FR" | grep -c '^f_.*\.jpg$'); [ "$n" -ge "$N" ] || { echo "only $n/$N frames"; exit 1; }
  ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v $N -t 131.82 -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT"
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
cd "$LIB"
setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 $N >> "$HERE/out/render.log" 2>&1 < /dev/null &
echo started
