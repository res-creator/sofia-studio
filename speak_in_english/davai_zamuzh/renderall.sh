#!/bin/bash
# chunks <= 18 s, at most 2 renders at once; waits only on its own child PIDs
set -e; P=$1; T=$(python3 -c "import json;print(json.load(open('timeline$P.json'))['TOTAL'])"); mkdir -p out/c$P; rm -f out/c$P/*.mp4
N=$(python3 -c "import math;print(math.ceil($T/18))"); pids=()
for ((i=0;i<N;i++)); do a=$((i*18)); b=$(((i+1)*18)); PART=$P node render.js clip $a:$b out/c$P/$(printf %02d $i).mp4 > out/c$P/log$i.txt 2>&1 & pids+=($!)
  if (( ${#pids[@]} >= 2 )); then wait ${pids[0]}; pids=("${pids[@]:1}"); fi; done
for p in "${pids[@]}"; do wait $p; done
ls out/c$P/*.mp4 | sed 's/^/file /;s/out\/c'$P'\///' > out/c$P/list.txt
(cd out/c$P && ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy ../video$P.mp4)
mkdir -p final; ffmpeg -v error -y -i out/video$P.mp4 -i out/audio$P.wav -c:v copy -c:a aac -b:a 192k -shortest final/part$P.mp4
echo "part $P timeline $T"; ffprobe -v error -show_entries format=duration -of csv=p=0 final/part$P.mp4
