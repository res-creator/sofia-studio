#!/bin/sh
# sh eiffel_ep28/build.sh -> eiffel_ep28/the_man_who_sold_the_eiffel_tower.mp4 (1080x1920, 30 fps, -14 LUFS) + .srt
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt the_man_who_sold_the_eiffel_tower.srt
node episode.js video _video.mp4
T=$(node episode.js T)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 the_man_who_sold_the_eiffel_tower.mp4 "$T"
rm -f _video.mp4; echo done
