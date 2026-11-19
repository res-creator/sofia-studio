#!/bin/sh
# Перерисовать отдельные сцены из build/redo.json → build/redo/NN.mp4 (границы по кадрам 24 fps)
cd "$(dirname "$0")/../../.." && mkdir -p projects/richest2/build/redo
python3 -c "
import json
for i,(s,e) in enumerate(json.load(open('projects/richest2/build/redo.json'))): print(i, round(s*24)/24, round(e*24)/24)
" | while read i a b; do
  o=projects/richest2/build/redo/$(printf %02d $i).mp4; [ -f $o ] && continue
  PW_CHROMIUM=/opt/pw-browsers/chromium node render.mjs --project projects/richest2 --from $a --to $b --workers 4 --format jpeg --crf 16 --preset veryfast --out $o.tmp.mp4 < /dev/null > /dev/null 2>&1 && mv $o.tmp.mp4 $o && echo "redo $i done"
done
echo REDO_DONE
