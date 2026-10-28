#!/bin/bash
# usage: bash final_v2.sh <ep> ...  ->  ../final_v2/<ep>.mp4
# Re-renders finished episodes with the v2 characters (CHAR_STYLE=v2) and the v2 composition (LAYOUT=v2),
# using the existing voice/music mix and timeline. releases/ and the old MP4s are not touched.
cd "$(dirname "$0")"
mkdir -p ../final_v2
for EP in "$@"; do
  [ -e ../final_v2/$EP.mp4 ] && { echo "SKIP $EP (exists)"; continue; }
  export CHAR_STYLE=v2 LAYOUT=v2
  node $EP.js 0 0 --png=0 > /dev/null 2>&1   # computes the camera assist once (cached), so render chunks don't each redo it
  if bash render.sh $EP > eps/$EP/render_v2.log 2>&1 && cp out/$EP.mp4 ../final_v2/$EP.mp4; then
    echo "DONE $EP $(ffprobe -v error -show_entries format=duration -of csv=p=0 ../final_v2/$EP.mp4)s"
  else echo "FAIL $EP (see eps/$EP/render_v2.log)"; fi
done
echo BATCHDONE
