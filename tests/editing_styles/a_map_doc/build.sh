#!/bin/sh
# Editing-style test A build: voice -> cues -> render -> mix -> master (-14 LUFS)
set -e; cd "$(dirname "$0")"
[ -f vo.wav ] || python3 voice.py
node render.js cues > /dev/null
node render.js video _video.mp4
python3 mix.py
sh ../../../howitsrun_style/master.sh mix.wav _video.mp4 test_a_map_doc.mp4 40.0
rm -f _video.mp4
