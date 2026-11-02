#!/bin/sh
# sh bulbs_ep20/build.sh -> bulbs_ep20/the_lightbulb_cartel.mp4 (1080x1920, 30 fps) + subtitles .srt + carousel/*.png (6 key frames)
# trim.py shortens only the over-long pauses inside voice lines (vo/ -> vo_cut/, + vo_cut/speech.json); the voice itself is unchanged.
set -e; cd "$(dirname "$0")"
python3 trim.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt the_lightbulb_cartel.srt
node episode.js carousel carousel
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
sh ../howitsrun_style/master.sh mix.wav _video.mp4 the_lightbulb_cartel.mp4 "$T"   # -14 LUFS master
rm -f _video.mp4 _ln.txt; echo done
