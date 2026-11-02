#!/bin/sh
# sh sugar_ep21/build.sh -> sugar_ep21/sugar_paid_scientists.mp4 (1080x1920, 30 fps) + subtitles .srt + carousel/*.png (6 key frames) + cover
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt sugar_paid_scientists.srt
node episode.js carousel carousel
node cover.js
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 sugar_paid_scientists.mp4 "$T"   # -14 LUFS master
rm -f _video.mp4 _ln.txt; echo done
