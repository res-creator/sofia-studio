#!/bin/sh
# Episode 3 build: ep3/vo/*.mp3 (+ .align.json) must exist (python3 ep3/gen_vo.py).  sh ep3/build.sh out.mp4
set -e; cd "$(dirname "$0")/.."
node ep3/script.js && python3 ep3/timeline.py >/dev/null && node ep3/make_sfx.js && python3 ep3/audio.py
T=$(node -e "console.log(require('./ep3/timeline.json').T + 0.3)")
node ep3/render.js video 0 "$T" ep3/_video.mp4
ffmpeg -y -v error -i ep3/_video.mp4 -i ep3/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -tune animation -c:a aac -b:a 192k -shortest "${1:-ep3.mp4}"
echo done "${1:-ep3.mp4}"
