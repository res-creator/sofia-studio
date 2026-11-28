#!/bin/sh
# Clay Atlas (style lab, direction 3): render / encode. 14 s · 30 fps · 420 frames · 1920×1080 (WebGL is software here: ss=1 + MSAA 4×)
#   sh render.sh          start/resume the detached frame worker (frames already on disk are skipped)
#   sh render.sh status   frames done
#   sh render.sh encode   sound + H.264 → s3_3d.mp4, then delete the frames
#   sh render.sh data     rebuild data/geo.json, ocean textures, fonts
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LIB:-/root/lemo-opuscar}; export LIB
N=420; FR="$HERE/out/frames"; mkdir -p "$FR"
have=$(ls "$FR" 2>/dev/null | grep -c '^f_.*\.jpg$')
case "${1:-start}" in
  data) cd "$HERE" && node tools/prep.mjs && python3 -I tools/ocean.py "$HERE" && python3 -I tools/fonts.py "$HERE" ;;
  status) echo "$have / $N" ;;
  encode)
    [ "$have" -ge "$N" ] || { echo "not ready ($have / $N)"; exit 1; }
    python3 -I "$HERE/tools/sound.py" "$HERE" &&
    ffmpeg -v error -y -framerate 30 -i "$FR/f_%05d.jpg" -i "$HERE/out/sound.wav" -frames:v $N -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
      -c:a aac -b:a 192k -shortest -movflags +faststart "$HERE/out/tmp.mp4" && mv "$HERE/out/tmp.mp4" "$HERE/s3_3d.mp4" &&
    echo "encoded $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$HERE/s3_3d.mp4") s" ;;
  *)
    pid=$(cat "$HERE/out/render.pid" 2>/dev/null)
    if [ "$have" -ge "$N" ]; then echo done; elif [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then echo "running ($have / $N)"; else
      cd "$LIB"; setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$FR" 30 0 $N "ss=1" >> "$HERE/out/render.log" 2>&1 &
      echo $! > "$HERE/out/render.pid"; echo "started ($have / $N)"; fi ;;
esac
