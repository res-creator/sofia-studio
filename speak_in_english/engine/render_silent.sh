#!/bin/bash
# usage: bash render_silent.sh <ep> [out.mp4] — silent animatic for review (no voices/music): parallel chunks, joined.
# Uses the timeline as it is (estimated timings before voicing). ANIMATIC=1 adds a time code / scene / shot tag.
set -e
cd "$(dirname "$0")"
EP=$1; OUT=${2:-out/${EP}_animatic.mp4}
NF=$(python3 -c "import json,math;print(math.ceil(json.load(open('eps/$EP/timeline.json'))['dur']*30))")
J=$(nproc 2>/dev/null || sysctl -n hw.ncpu); [ "$J" -gt 4 ] && J=4
CH=$(( (NF + J - 1) / J )); pids=(); : > eps/$EP/silent_parts.txt
for i in $(seq 0 $((J-1))); do
  a=$((i*CH)); b=$(((i+1)*CH)); [ $b -gt $NF ] && b=$NF; [ $a -ge $b ] && continue
  echo "file 'spart$i.mp4'" >> eps/$EP/silent_parts.txt
  ANIMATIC=1 node $EP.js $a $b eps/$EP/spart$i.mp4 2> eps/$EP/srender$i.log & pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -loglevel error -f concat -safe 0 -i eps/$EP/silent_parts.txt -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart "$OUT"
rm -f eps/$EP/spart*.mp4 eps/$EP/silent_parts.txt
echo "$OUT"
