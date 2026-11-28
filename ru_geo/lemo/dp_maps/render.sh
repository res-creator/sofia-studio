#!/bin/sh
# Render both clips (1920x1080, 30 fps, silent; WebGL is software here, so 1x) → ru_geo/deadly_places/video/parts/
#   sh render.sh           start/resume the two detached workers (one per clip; frames already on disk are skipped)
#   sh render.sh encode    encode every clip whose frames are all on disk (temp file, then move), copy its events JSON
#   sh render.sh status    frames done per clip
#   sh render.sh data      (re)build the terrain data: patches, the seam fix east of Everest, the gas field of Nyos
# Data: assets/world.jpg (copied from ../rp_maps), assets/{evw,evd,nyw,nyd}_* (tools/fetch_patch.py), assets/nyd_gas.* (tools/gas.py)
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
OUT=/home/user/sofia-studio/ru_geo/deadly_places/video/parts
CLIPS="everest:251 nyos:524"
mkdir -p "$OUT" "$HERE/out"
if [ "$1" = "data" ] || [ ! -f "$HERE/assets/nyd_gas.png" ]; then
  (cd "$LIB" && PY=.venv/bin/python &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" evw 84.9 26.3 89.0 29.7 9 0.3 1.0 wide &&
   $PY -I "$HERE/tools/fix_seam.py" "$HERE" evw 748 &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" evd 86.70 27.80 87.15 28.17 13 0.022 0.075 in:evw &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" nyw 8.6 4.9 12.0 8.0 9 0.3 1.0 wide &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" nyd 10.16 6.30 10.44 6.58 13 0.02 0.05 in:nyw &&
   $PY -I "$HERE/tools/gas.py" "$HERE")
  [ "$1" = "data" ] && exit 0
fi
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
if [ "$1" = "encode" ]; then [ -f "$OUT/map_everest.mp4" ] && [ -f "$OUT/map_nyos.mp4" ]; fi
