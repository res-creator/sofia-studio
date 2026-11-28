#!/bin/sh
# Render both clips (1920x1080, 30 fps, silent; WebGL is software here, so 1x) → ru_geo/remote_places/video/parts/
#   sh render.sh           start/resume the two detached workers (one per clip; frames already on disk are skipped)
#   sh render.sh encode    encode every clip whose frames are all on disk, copy its events JSON (exit 0 only when both mp4 exist)
#   sh render.sh status    frames done per clip
# Data (only if missing): assets/world.jpg (from cs_globe, tools/fetch_world.py), assets/tdc_* (tools/fetch_patch.py), fonts (tools/fonts.py)
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
OUT=/home/user/sofia-studio/ru_geo/remote_places/video/parts
CLIPS="nemo:502 tristan:456"
mkdir -p "$OUT"
[ -f "$HERE/assets/tdc_albedo.jpg" ] || (cd "$LIB" && .venv/bin/python -I "$HERE/tools/fetch_patch.py" "$HERE" tdc -12.95 -37.6 -11.95 -36.75)
for c in $CLIPS; do
  name=${c%%:*}; n=${c##*:}; fr="$HERE/out/frames_$name"; mkdir -p "$fr"
  have=$(ls "$fr" 2>/dev/null | grep -c '^f_.*\.jpg$')
  case "${1:-start}" in
    status) echo "$name $have / $n" ;;
    encode)
      if [ "$have" -ge "$n" ]; then
        ffmpeg -v error -y -framerate 30 -i "$fr/f_%05d.jpg" -frames:v $n -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$HERE/out/map_$name.tmp.mp4" && mv "$HERE/out/map_$name.tmp.mp4" "$OUT/map_$name.mp4" &&
        cp "$HERE/map_${name}_events.json" "$OUT/map_${name}_events.json" && echo "$name encoded $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/map_$name.mp4")"
      else echo "$name not ready ($have / $n)"; fi ;;
    *)
      pid=$(cat "$HERE/out/$name.pid" 2>/dev/null)
      if [ "$have" -ge "$n" ]; then echo "$name done"; elif [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then echo "$name running ($have / $n)"; else
        cd "$LIB"; setsid nohup node "$HERE/tools/frames.mjs" "$HERE" "$fr" 30 0 $n "clip=$name" >> "$HERE/out/$name.log" 2>&1 &
        echo $! > "$HERE/out/$name.pid"; echo "$name started ($have / $n)"; cd "$HERE"; fi ;;
  esac
done
if [ "$1" = "encode" ]; then [ -f "$OUT/map_nemo.mp4" ] && [ -f "$OUT/map_tristan.mp4" ]; fi
