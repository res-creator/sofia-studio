#!/bin/sh
# Episode 2 block 1: put l01.mp3 … l13.mp3 into ep2/vo/, then run:  sh ep2/build.sh out.mp4
set -e; cd "$(dirname "$0")/.."
node ep2/script.js && python3 ep2/timeline.py && node ep2/make_sfx.js && python3 ep2/audio.py
T=$(node -e "console.log(require('./ep2/timeline.json').T + 0.3)")
node ep2/render.js video 0 "$T" ep2/_video.mp4
ffmpeg -y -v error -i ep2/_video.mp4 -i ep2/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -tune animation -c:a aac -b:a 192k -shortest "${1:-ep2_block1.mp4}"
echo done "${1:-ep2_block1.mp4}"
