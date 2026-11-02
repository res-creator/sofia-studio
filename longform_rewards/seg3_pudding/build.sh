#!/bin/sh
# sh longform_rewards/seg3_pudding/build.sh -> seg_video.mp4 (1920x1080, 30 fps, no audio) + vo.wav + fx.wav + cues.json + seg.srt
set -e; cd "$(dirname "$0")"
export HIR_WIDE=1
python3 speech.py > /dev/null
node episode.js cues
python3 mix.py
node episode.js srt seg.srt
node episode.js video seg_video.mp4
echo done
