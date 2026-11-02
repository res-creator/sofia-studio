#!/bin/sh
# sh hoover_ep19/build.sh -> hoover_ep19/hoover_free_flights.mp4 (1080x1920, 30 fps) + subtitles .srt + carousel/*.png (6 key frames)
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt hoover_free_flights.srt
node episode.js carousel carousel
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 hoover_free_flights.mp4 "$T"   # -14 LUFS master
rm -f _video.mp4 _ln.txt; echo done
