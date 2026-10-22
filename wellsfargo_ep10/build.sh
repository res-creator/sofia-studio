#!/bin/sh
# sh wellsfargo_ep10/build.sh -> wellsfargo_ep10/the_5_coffee_that_cost_40_final.mp4 (1080x1920, 30 fps) + subtitles .srt
set -e; cd "$(dirname "$0")"
node episode.js cues && python3 mix.py
node episode.js srt the_5_coffee_that_cost_40.srt
node episode.js video _video.mp4
ffmpeg -y -v error -i _video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -t "$(node -e "console.log(require('./episode.js').T)" none)" -movflags +faststart the_5_coffee_that_cost_40_final.mp4
rm -f _video.mp4; echo done
