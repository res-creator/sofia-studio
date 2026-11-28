#!/bin/sh
# s2_documentary: sh render.sh [start|status|encode]   (resumable; one worker)
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
N=420; FR="$HERE/frames"; mkdir -p "$FR"
have=$(ls "$FR" 2>/dev/null | grep -c '^f_.*\.jpg$')
case "${1:-start}" in
  status) echo "$have / $N" ;;
  encode)
    [ "$have" -ge "$N" ] || { echo "not ready $have / $N"; exit 1; }
    python3 -I "$HERE/tools/sound.py" "$HERE/sound.wav" &&
    ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -i "$HERE/sound.wav" -frames:v $N -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -r 30 \
      -c:a aac -b:a 192k -shortest -movflags +faststart "$HERE/s2_documentary.tmp.mp4" && mv "$HERE/s2_documentary.tmp.mp4" "$HERE/s2_documentary.mp4" && echo encoded ;;
  *)
    pid=$(cat "$HERE/render.pid" 2>/dev/null)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then echo "running $have / $N"; else
      cd "$LIB"; setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 $N >> "$HERE/render.log" 2>&1 & echo $! > "$HERE/render.pid"; echo "started $have / $N"; fi ;;
esac
