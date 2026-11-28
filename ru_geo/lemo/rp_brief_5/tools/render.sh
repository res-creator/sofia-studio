#!/bin/sh
# Resumable chunked render (the container restarts often; disk is tight): ONE worker renders chunks of C frames into
# out/frames, encodes each finished chunk to out/chunks/c_XX.mp4 and deletes its frames. Then the chunks are joined.
#   sh tools/render.sh          start the worker (in the background, detached)
#   sh tools/render.sh encode   join the chunks into the final mp4
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; CH=$HERE/out/chunks; N=4733; C=500
OUT=/home/user/sofia-studio/ru_geo/remote_places/video/parts/board_5.mp4
mkdir -p "$FR" "$CH" "$(dirname "$OUT")"
if [ "$1" = "encode" ]; then
  : > "$CH/list.txt"; a=0
  while [ $a -lt $N ]; do f=$(printf 'c_%05d.mp4' $a); [ -f "$CH/$f" ] || { echo "missing $f"; exit 1; }; echo "file '$f'" >> "$CH/list.txt"; a=$((a + C)); done
  ffmpeg -v error -y -f concat -safe 0 -i "$CH/list.txt" -c copy -movflags +faststart "$OUT"
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
if [ "$1" = "worker" ]; then
  echo $$ > "$HERE/out/worker.pid"
  a=0
  while [ $a -lt $N ]; do
    b=$((a + C)); [ $b -gt $N ] && b=$N; f=$(printf 'c_%05d.mp4' $a)
    if [ ! -f "$CH/$f" ]; then
      (cd "$LIB" && node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 $a $b) || exit 1
      ffmpeg -v error -y -framerate 30 -start_number $a -i "$FR/f_%05d.jpg" -frames:v $((b - a)) -c:v libx264 -preset medium -crf 17 \
        -pix_fmt yuv420p -r 30 -an "$CH/$f.tmp.mp4" && mv "$CH/$f.tmp.mp4" "$CH/$f" || exit 1
      i=$a; while [ $i -lt $b ]; do rm -f "$FR/$(printf 'f_%05d.jpg' $i)"; i=$((i + 1)); done
      echo "chunk $f done $(date +%T)"
    fi
    a=$b
  done
  echo ALLDONE; exit 0
fi
# one worker only (the keeper may call this while the worker is between chunks, encoding)
P=$(cat "$HERE/out/worker.pid" 2>/dev/null); [ -n "$P" ] && grep -q "render.sh" /proc/$P/cmdline 2>/dev/null && { echo "worker $P running"; exit 0; }
setsid nohup sh "$0" worker > "$HERE/out/render.log" 2>&1 < /dev/null &
echo started
