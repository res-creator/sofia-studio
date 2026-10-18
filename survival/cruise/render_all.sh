#!/bin/sh
# Renders blocks (default: all, 2 at a time) into out/blocks/<block>.mp4
cd "$(dirname "$0")"
mkdir -p out/blocks
B="${*:-s01 s02 s03 s04 s05 s06 s07 s08 s09 s10 s11 s12 s13}"
set -- $B
while [ $# -gt 0 ]; do
  node render.js video $1 out/blocks/$1.mp4 > out/blocks/$1.log 2>&1 &
  if [ $# -gt 1 ]; then node render.js video $2 out/blocks/$2.mp4 > out/blocks/$2.log 2>&1 & shift; fi
  shift; wait
done
for b in $B; do cat out/blocks/$b.log; done
