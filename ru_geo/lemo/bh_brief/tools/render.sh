#!/bin/sh
# Resumable render (the container restarts often): two workers write out/frames/f_%05d.jpg, skipping frames on disk.
#   sh tools/render.sh          start the workers (in the background, detached)   ·   sh tools/render.sh encode
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; N=2559; OUT=/home/user/sofia-studio/ru_geo/building_height/video/parts/board_brief.mp4
mkdir -p "$FR" "$HERE/out"
if [ "$1" = "encode" ]; then
  n=$(ls "$FR" | grep -c '^f_.*\.jpg$'); [ "$n" -ge "$N" ] || { echo "only $n/$N frames"; exit 1; }
  ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -frames:v $N -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$OUT"
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
cd "$LIB"
for W in "0 1280" "1280 $N"; do set -- $W
  setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 $1 $2 > "$HERE/out/render_$1.log" 2>&1 < /dev/null &
done
echo started
