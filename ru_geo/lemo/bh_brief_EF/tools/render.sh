#!/bin/sh
# Resumable chunked render (the container restarts often; disk is tight): ONE worker renders chunks of CH frames into
# out/frames, encodes each chunk to out/seg_<k>.mp4 and deletes its frames.
#   sh tools/render.sh          start (detached)      ·   sh tools/render.sh encode   (join segments → final mp4)
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
FR=$HERE/out/frames; N=3945; CH=450; DUR=131.49
OUT=/home/user/sofia-studio/ru_geo/building_height/video/parts/board_brief_EF.mp4
mkdir -p "$FR" "$HERE/out"
if [ "$1" = "encode" ]; then
  : > "$HERE/out/segs.txt"; k=0
  while [ $((k * CH)) -lt $N ]; do f=$HERE/out/seg_$(printf %02d $k).mp4; [ -f "$f" ] || { echo "missing $f"; exit 1; }; echo "file '$f'" >> "$HERE/out/segs.txt"; k=$((k + 1)); done
  # no B-frames, so the last packet is the last frame; its duration is cut so the file lasts exactly DUR (131.49 s)
  ffmpeg -v error -y -f concat -safe 0 -i "$HERE/out/segs.txt" -frames:v $N -c:v libx264 -preset medium -crf 17 -bf 0 -pix_fmt yuv420p -r 30 -an -video_track_timescale 3000 "$HERE/out/full.mp4" || exit 1
  ffmpeg -v error -y -i "$HERE/out/full.mp4" -c copy -bsf:v "setts=duration='if(eq(N\,$((N - 1)))\,70\,DURATION)'" -movflags +faststart "$OUT" && rm -f "$HERE/out/full.mp4"
  ffprobe -v error -show_entries format=duration:stream=nb_frames -of csv=p=0 "$OUT"; exit 0
fi
if [ "$1" = "run" ]; then
  k=0
  while [ $((k * CH)) -lt $N ]; do
    a=$((k * CH)); b=$((a + CH)); [ $b -gt $N ] && b=$N; seg=$HERE/out/seg_$(printf %02d $k).mp4
    if [ ! -f "$seg" ]; then
      (cd "$LIB" && node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 $a $b) || exit 1
      ffmpeg -v error -y -framerate 30 -start_number $a -i "$FR/f_%05d.jpg" -frames:v $((b - a)) -c:v libx264 -preset fast -crf 12 -pix_fmt yuv420p -r 30 -an "$seg.tmp.mp4" && mv "$seg.tmp.mp4" "$seg" || exit 1
      i=$a; while [ $i -lt $b ]; do rm -f "$FR/f_$(printf %05d $i).jpg"; i=$((i + 1)); done
    fi
    k=$((k + 1))
  done
  echo done; exit 0
fi
setsid nohup sh "$0" run > "$HERE/out/render.log" 2>&1 < /dev/null &
echo started
