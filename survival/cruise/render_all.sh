#!/bin/sh
# Renders blocks (default: all, 2 at a time) into out/blocks/<block>.mp4
cd "$(dirname "$0")"
mkdir -p out/blocks
B="${*:-cold day1 day2 day3 day4 day5 final}"
set -- $B
while [ $# -gt 0 ]; do
  node render.js video $1 out/blocks/$1.mp4 > out/blocks/$1.log 2>&1 &
  if [ $# -gt 1 ]; then node render.js video $2 out/blocks/$2.mp4 > out/blocks/$2.log 2>&1 & shift; fi
  shift; wait
done
for b in $B; do cat out/blocks/$b.log; done
