#!/bin/sh
# Episode 3: sh car_ep3/build.sh -> car_ep3/your_car_was_reporting_on_you.mp4 (1080x1920, 30 fps) + cover
# VO (once): ELEVEN_API_KEYS=... python3 vo.py   (already generated in vo/)
set -e; cd "$(dirname "$0")"
node episode.js cues && python3 mix.py
node episode.js video _video.mp4
ffmpeg -y -v error -i _video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -t "$(node -e "console.log(require('./episode.js').T)" none)" your_car_was_reporting_on_you.mp4
node cover.js your_car_was_reporting_on_you_cover.png
rm -f _video.mp4; echo done your_car_was_reporting_on_you.mp4
