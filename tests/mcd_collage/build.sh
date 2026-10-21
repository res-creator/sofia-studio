#!/bin/sh
# Collage-documentary test: sh build.sh  ->  mcd_collage_test.mp4 (1080x1920, 30 fps, ~23 s)
set -e; cd "$(dirname "$0")"
node render.js cues && python3 mix.py
node render.js video _video.mp4
ffmpeg -y -v error -i _video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -shortest mcd_collage_test.mp4
echo done mcd_collage_test.mp4
