#!/bin/sh
# Episode 2 FINAL cut: sh air_ep2/build_final.sh -> air_ep2/why_airlines_oversell_seats_final.mp4 (1080x1920, 30 fps)
# VO (once): ELEVEN_API_KEYS=... python3 vo_final.py   (already generated in vo_final/). The first cut is built by build.sh.
set -e; cd "$(dirname "$0")"
node episode_final.js cues && python3 mix_final.py
node episode_final.js video _video_final.mp4
ffmpeg -y -v error -i _video_final.mp4 -i mix_final.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -t "$(node -e "console.log(require('./episode_final.js').T)" none)" why_airlines_oversell_seats_final.mp4
rm -f _video_final.mp4; echo done why_airlines_oversell_seats_final.mp4
