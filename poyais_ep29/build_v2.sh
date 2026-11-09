#!/bin/sh
# v2 (review fixes): sh poyais_ep29/build_v2.sh -> poyais_ep29/the_country_that_didnt_exist_v2.mp4 (1080x1920, 30 fps, -14 LUFS) + _v2.srt
set -e; cd "$(dirname "$0")"
python3 speech_v2.py > /dev/null
node episode_v2.js cues && python3 mix_v2.py
node episode_v2.js srt the_country_that_didnt_exist_v2.srt
node episode_v2.js video _video_v2.mp4
T=$(node episode_v2.js T)
sh ../howitsrun_style/master.sh mix_v2.wav _video_v2.mp4 the_country_that_didnt_exist_v2.mp4 "$T"
rm -f _video_v2.mp4; echo done
