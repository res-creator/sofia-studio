#!/bin/bash
# usage: bash render.sh <ep> [video_kbps=1600] [max_frames]  ->  out/<ep>.mp4
# Renders the episode in parallel chunks (one per CPU, max 4), then joins them with the mix and
# does a 2-pass H.264 encode. 1600 kbps keeps a ~2 min video under ~28 MB.
set -e
cd "$(dirname "$0")"
EP=$1; VB=${2:-1600}
NF=$(python3 -c "import json,math;print(math.ceil(json.load(open('eps/$EP/timeline.json'))['dur']*30))")
[ -n "$3" ] && NF=$3
J=$(nproc 2>/dev/null || sysctl -n hw.ncpu); [ "$J" -gt 4 ] && J=4
CH=$(( (NF + J - 1) / J )); pids=(); parts=()
for i in $(seq 0 $((J-1))); do
  a=$((i*CH)); b=$(((i+1)*CH)); [ $b -gt $NF ] && b=$NF; [ $a -ge $b ] && continue
  p=eps/$EP/part$i.mp4; parts+=($p)
  node $EP.js $a $b $p 2> eps/$EP/render$i.log & pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
mkdir -p out
bash final_enc.sh $EP $VB out/$EP.mp4 "${parts[@]}"
