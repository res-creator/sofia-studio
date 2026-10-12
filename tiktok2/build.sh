#!/bin/sh
# TikTok pilot build: voices via python3 tiktok2/gen_vo.py.  sh tiktok2/build.sh out.mp4
set -e; cd "$(dirname "$0")/.."
node tiktok2/script.js && python3 tiktok2/timeline.py >/dev/null && node tiktok2/make_sfx.js && python3 tiktok2/audio.py
T=$(node -e "console.log(require('./tiktok2/timeline.json').T + 0.2)")
node tiktok2/render.js video 0 "$T" tiktok2/_video.mp4
ffmpeg -y -v error -i tiktok2/_video.mp4 -i tiktok2/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 192k -shortest "${1:-tiktok2.mp4}"
echo done "${1:-tiktok2.mp4}"
