#!/bin/sh
# Rebuild the whole film after a voice change: every chapter (cues -> stems -> srt -> video), then assemble (music, -14 LUFS, SRT, chapters).
# Usage: sh build_all.sh   (about 1-2 hours on 4 CPUs; chapters render one after another)
set -e; cd "$(dirname "$0")"
for c in chapters/*/; do (cd "$c" && node episode.js cues && python3 mix.py && node episode.js srt seg.srt && node episode.js video seg_video.mp4); done
python3 assemble.py
