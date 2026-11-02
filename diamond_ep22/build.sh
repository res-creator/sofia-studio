#!/bin/sh
# sh diamond_ep22/build.sh -> diamond_ep22/your_ring_is_an_ad.mp4 (1080x1920, 30 fps) + subtitles .srt + carousel/*.png (6 key frames)
set -e; cd "$(dirname "$0")"
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt your_ring_is_an_ad.srt
node episode.js carousel carousel
node cover.js
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 your_ring_is_an_ad.mp4 "$T"   # -14 LUFS master
rm -f _video.mp4 _ln.txt; echo done
