#!/bin/sh
# Episode 4 build: ep4/vo/*.mp3 (+ .align.json) must exist (python3 ep4/gen_vo.py).  sh ep4/build.sh out.mp4
set -e; cd "$(dirname "$0")/.."
node ep4/script.js && python3 ep4/timeline.py >/dev/null && node ep4/make_sfx.js && python3 ep4/audio.py
T=$(node -e "console.log(require('./ep4/timeline.json').T + 0.3)")
node ep4/render.js video 0 "$T" ep4/_video.mp4
ffmpeg -y -v error -i ep4/_video.mp4 -i ep4/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -tune animation -c:a aac -b:a 192k -shortest "${1:-ep4.mp4}"
echo done "${1:-ep4.mp4}"
