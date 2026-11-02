#!/bin/sh
# sh rats_ep26/build.sh -> rats_ep26/paid_per_rat_tail.mp4 (1080x1920, 30 fps) + subtitles .srt + carousel/*.png (6 key frames)
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt paid_per_rat_tail.srt
node episode.js carousel carousel
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 paid_per_rat_tail.mp4 "$T"   # -14 LUFS master
rm -f _video.mp4 _ln.txt; echo done
