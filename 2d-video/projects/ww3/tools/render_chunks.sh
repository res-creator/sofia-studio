#!/bin/sh
# Рендер фильма кусками по 60 с (можно прерывать и перезапускать — готовые куски пропускаются).
# Перерендер куска после правки: удалить build/chunks/cNNN.mp4 и запустить снова.
cd "$(dirname "$0")/../../.."
export PW_CHROMIUM=/opt/pw-browsers/chromium
P=projects/ww3; C=$P/build/chunks; mkdir -p $C
DUR=$(python3 -c "import json;print(json.load(open('$P/config.json'))['duration'])")
N=$(python3 -c "import math;print(math.ceil($DUR/60))")
for i in $(seq 0 $((N-1))); do
  f=$(printf "%s/c%03d.mp4" $C $i); [ -s "$f" ] && continue
  a=$((i*60)); b=$(( (i+1)*60 ))
  node render.mjs --project $P --from $a --to $b --workers 4 --format jpeg --crf 19 --out "$f.tmp.mp4" > $C/log_$i.txt 2>&1 && mv "$f.tmp.mp4" "$f" && echo "chunk $i done $(date +%T)"
done
echo ALLDONE
