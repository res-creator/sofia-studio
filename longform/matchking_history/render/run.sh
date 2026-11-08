#!/bin/sh
# render the film in 4 parallel chunks, then concat
cd "$(dirname "$0")/.."
N=$(node -e "console.log(Math.round(require('./timeline.js').T*30))"); Q=$(( (N + 3) / 4 ))
for i in 0 1 2 3; do f0=$((i * Q)); f1=$(( (i + 1) * Q )); [ $f1 -gt $N ] && f1=$N; node film.js video render/part$i.mp4 $f0 $f1 2> render/part$i.log & done; wait
printf "file 'part0.mp4'\nfile 'part1.mp4'\nfile 'part2.mp4'\nfile 'part3.mp4'\n" > render/list.txt
ffmpeg -y -v error -f concat -safe 0 -i render/list.txt -c copy render/video.mp4 && echo RENDER_OK
