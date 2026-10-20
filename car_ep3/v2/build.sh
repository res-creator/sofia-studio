#!/bin/sh
# v2: sh car_ep3/v2/build.sh -> car_ep3/v2/your_car_was_reporting_on_you_v2.mp4 (1080x1920, 30 fps). v1 stays in car_ep3/.
set -e; cd "$(dirname "$0")"
node episode.js cues && python3 mix.py
node episode.js video _video.mp4
ffmpeg -y -v error -i _video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -t "$(node -e "console.log(require('./episode.js').T)" none)" your_car_was_reporting_on_you_v2.mp4
rm -f _video.mp4; echo done
