#!/bin/sh
# sh poyais_ep29/build.sh -> poyais_ep29/the_country_that_didnt_exist.mp4 (1080x1920, 30 fps, -14 LUFS) + .srt
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt the_country_that_didnt_exist.srt
node episode.js video _video.mp4
T=$(node episode.js T)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 the_country_that_didnt_exist.mp4 "$T"
rm -f _video.mp4; echo done
