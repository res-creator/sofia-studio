#!/bin/bash
# chunks <= 18 s, at most 2 renders at once; waits only on its own child PIDs
set -e; P=$1; T=$(python3 -c "import json;print(json.load(open('timeline$P.json'))['TOTAL'])"); mkdir -p out/c$P; rm -f out/c$P/*.mp4
N=$(python3 -c "import math;print(math.ceil($T/18))"); pids=()
for ((i=0;i<N;i++)); do a=$((i*18)); b=$(((i+1)*18)); PART=$P node render.js clip $a:$b out/c$P/$(printf %02d $i).mp4 > out/c$P/log$i.txt 2>&1 & pids+=($!)
  if (( ${#pids[@]} >= 2 )); then wait ${pids[0]}; pids=("${pids[@]:1}"); fi; done
for p in "${pids[@]}"; do wait $p; done
for ((i=0;i<N;i++)); do f=out/c$P/$(printf %02d $i).mp4; [ -s $f ] || { echo "chunk $i missing"; cat out/c$P/log$i.txt; exit 1; }; done
ls out/c$P/*.mp4 | sed 's/^/file /;s/out\/c'$P'\///' > out/c$P/list.txt
(cd out/c$P && ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy ../video$P.mp4)
mkdir -p final; ffmpeg -v error -y -i out/video$P.mp4 -i out/audio$P.wav -c:v copy -af apad -c:a aac -b:a 192k -t $T final/part$P.mp4
F=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 final/part$P.mp4); python3 -c "import sys;sys.exit(abs($F/30-$T)>0.034)" || { echo "FRAMES $F do not match timeline $T"; exit 1; }
echo "part $P timeline $T frames $F"; ffprobe -v error -show_entries format=duration -of csv=p=0 final/part$P.mp4
