#!/bin/sh
# sh camel_ep25/build.sh -> camel_ep25/more_doctors_smoke.mp4 (1080x1920, 30 fps) + subtitles .srt + carousel/*.png (6 key frames)
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt more_doctors_smoke.srt
node episode.js carousel carousel
node cover.js
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 more_doctors_smoke.mp4 "$T"   # -14 LUFS master
rm -f _video.mp4 _ln.txt; echo done
