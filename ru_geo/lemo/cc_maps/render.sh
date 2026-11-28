#!/bin/sh
# Render the three clips (1920x1080, 30 fps, silent; WebGL is software here, so 1x) → ru_geo/create_country/video/parts/
#   sh render.sh           start/resume ONE detached worker that renders the clips one after another (frames on disk are skipped)
#   sh render.sh encode    encode every clip whose frames are all on disk (temp file, then move), copy its events JSON,
#                          then delete that clip's frames (disk is tight)
#   sh render.sh status    frames done per clip
#   sh render.sh data      (re)build the data: nested patches (wide z9, medium z11, detailed z13) per place, the Ireland fix of world.jpg
# Data: assets/world.jpg (copied from ../dp_maps, streak over Ireland removed by tools/fix_world.py), assets/{sl,lb,ht}{w,m,d}_*
# (tools/fetch_patch.py; SEA=.75 for the two coastal places), assets/siga_osm.json (OSM relation 19735507, via Nominatim)
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}; export LIB
OUT=/home/user/sofia-studio/ru_geo/create_country/video/parts
CLIPS="sealand:612 liberland:604 hutt:588"
mkdir -p "$OUT" "$HERE/out"
if [ "$1" = "data" ]; then
  (cd "$LIB" && PY=.venv/bin/python &&
   SEA=.75 $PY -I "$HERE/tools/fetch_patch.py" "$HERE" slw -1.2 50.9 3.4 53.4 9 0.3 1.0 wide &&
   SEA=.75 $PY -I "$HERE/tools/fetch_patch.py" "$HERE" slm 0.7 51.55 2.1 52.3 11 0.07 0.25 in:slw &&
   SEA=.75 $PY -I "$HERE/tools/fetch_patch.py" "$HERE" sld 1.22 51.83 1.62 52.03 13 0.022 0.075 in:slm &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" lbw 16.6 44.4 21.2 47.0 9 0.3 1.0 wide &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" lbm 18.45 45.45 19.35 46.05 11 0.07 0.25 in:lbw &&
   $PY -I "$HERE/tools/fetch_patch.py" "$HERE" lbd 18.76 45.69 18.99 45.84 13 0.022 0.075 in:lbm &&
   SEA=.75 $PY -I "$HERE/tools/fetch_patch.py" "$HERE" htw 111.8 -31.0 117.6 -25.6 9 0.3 1.0 wide &&
   SEA=.75 $PY -I "$HERE/tools/fetch_patch.py" "$HERE" htm 113.85 -28.55 115.05 -27.6 11 0.07 0.25 in:htw &&
   SEA=.75 $PY -I "$HERE/tools/fetch_patch.py" "$HERE" htd 114.33 -28.17 114.62 -27.98 13 0.022 0.075 in:htm &&
   python3 -I "$HERE/tools/fix_world.py" "$HERE")
  exit 0
fi
case "${1:-start}" in
  status|encode)
    for c in $CLIPS; do
      name=${c%%:*}; n=${c##*:}; fr="$HERE/out/frames_$name"
      have=$(ls "$fr" 2>/dev/null | grep -c '^f_.*\.jpg$')
      if [ "$1" = status ]; then
        if [ -f "$OUT/map_$name.mp4" ] && [ "$have" -eq 0 ]; then echo "$name encoded"; else echo "$name $have / $n"; fi
      elif [ "$have" -ge "$n" ]; then
        ffmpeg -v error -y -framerate 30 -i "$fr/f_%05d.jpg" -frames:v $n -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -r 30 -an -movflags +faststart "$HERE/out/map_$name.tmp.mp4" && mv "$HERE/out/map_$name.tmp.mp4" "$OUT/map_$name.mp4" &&
        cp "$HERE/map_${name}_events.json" "$OUT/map_${name}_events.json" && echo "$name encoded $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/map_$name.mp4")" &&
        rm -rf "$fr"
      else echo "$name not ready ($have / $n)"; fi
    done ;;
  *)
    pid=$(cat "$HERE/out/worker.pid" 2>/dev/null)
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then echo "worker running ($pid)"; sh "$0" status; exit 0; fi
    # one worker, the clips in turn (4 shared CPUs: never two renders at once)
    cd "$LIB"
    setsid nohup sh -c "for c in $CLIPS; do name=\${c%%:*}; n=\${c##*:}; [ -f '$OUT/'map_\$name.mp4 ] && continue;
      node '$HERE/tools/frames.mjs' '$HERE' '$HERE/out/frames_'\$name 30 0 \$n clip=\$name >> '$HERE/out/'\$name.log 2>&1 || exit 1; done" > /dev/null 2>&1 &
    echo $! > "$HERE/out/worker.pid"; echo "worker started ($!)"; cd "$HERE" ;;
esac
