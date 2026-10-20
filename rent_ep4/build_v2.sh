#!/bin/sh
# v2: sh rent_ep4/build_v2.sh -> rent_ep4/your_landlords_secret_algorithm_v2.mp4 (1080x1920, 30 fps)
set -e; cd "$(dirname "$0")"
node episode_v2.js cues && python3 mix_v2.py
node episode_v2.js video _video_v2.mp4
ffmpeg -y -v error -i _video_v2.mp4 -i mix_v2.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -t "$(node -e "console.log(require('./episode_v2.js').T)" none)" your_landlords_secret_algorithm_v2.mp4
rm -f _video_v2.mp4; echo done
