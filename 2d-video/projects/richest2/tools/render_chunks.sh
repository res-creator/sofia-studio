#!/bin/sh
# Рендер кусками по 60 с: sh tools/render_chunks.sh [первый] [последний] (готовые куски пропускаются; после правки удалить build/chunks/cNNN.mp4)
cd "$(dirname "$0")/../../.."
export PW_CHROMIUM=/opt/pw-browsers/chromium
P=projects/richest2; C=$P/build/chunks; mkdir -p $C
DUR=$(python3 -c "import json;print(json.load(open('$P/config.json'))['duration'])")
N=$(python3 -c "import math;print(math.ceil($DUR/60))")
A=${1:-0}; B=${2:-$((N-1))}
for i in $(seq $A $B); do
  f=$(printf "%s/c%03d.mp4" $C $i); [ -s "$f" ] && continue
  a=$((i*60)); b=$(( (i+1)*60 )); [ $b -gt ${DUR%.*} ] && b=$DUR
  node render.mjs --project $P --from $a --to $b --workers 4 --format jpeg --crf 17 --preset veryfast --out "$f.tmp.mp4" > $C/log_$i.txt 2>&1 && mv "$f.tmp.mp4" "$f" && echo "chunk $i done $(date +%T)"
done
echo RANGE_DONE $A $B
