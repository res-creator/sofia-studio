#!/bin/bash
# series v5: EP=1|2|3. Chunks <= 18 s, at most 2 renders at once (waits only on its own child PIDs); chunk + frame-count checks; chunks deleted after.
set -e; E=$1; D=series/out/c$E; T=$(python3 -c "import json;print(json.load(open('series/timeline_ep$E.json'))['TOTAL'])"); mkdir -p $D series/final; rm -f $D/*.mp4
N=$(python3 -c "import math;print(math.ceil($T/18))"); pids=()
for ((i=0;i<N;i++)); do a=$((i*18)); b=$(((i+1)*18)); EP=$E node render.js clip $a:$b $D/$(printf %02d $i).mp4 > $D/log$i.txt 2>&1 & pids+=($!)
  if (( ${#pids[@]} >= 2 )); then wait ${pids[0]}; pids=("${pids[@]:1}"); fi; done
for p in "${pids[@]}"; do wait $p; done
for ((i=0;i<N;i++)); do f=$D/$(printf %02d $i).mp4; [ -s $f ] || { echo "chunk $i missing"; cat $D/log$i.txt; exit 1; }; done
ls $D/*.mp4 | sed 's/^/file /;s/series\/out\/c'$E'\///' > $D/list.txt
(cd $D && ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy ../video_ep$E.mp4)
ffmpeg -v error -y -i series/out/video_ep$E.mp4 -i series/out/audio_ep$E.wav -c:v copy -af apad -c:a aac -b:a 192k -t $T series/final/ep$E.mp4
F=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 series/final/ep$E.mp4); python3 -c "import sys;sys.exit(abs($F/30-$T)>0.034)" || { echo "FRAMES $F do not match timeline $T"; exit 1; }
rm -rf $D; echo "ep $E timeline $T frames $F duration $(ffprobe -v error -show_entries format=duration -of csv=p=0 series/final/ep$E.mp4)"
