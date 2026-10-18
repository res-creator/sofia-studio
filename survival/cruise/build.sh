#!/bin/sh
# Full Cruise Ship build: voices must exist in vo/ (python3 tts.py), sfx in sfx/ (python3 make_sfx.py).
# sh build.sh  ->  out/zombie_outbreak_cruise.mp4 (+ out/cruise.srt, out/thumbnail.png)
set -e
cd "$(dirname "$0")"
node cues.js && python3 audio.py && node srt.js
[ -n "$SKIP_RENDER" ] || ./render_all.sh
for b in s01 s02 s03 s04 s05 s06 s07 s08 s09 s10 s11 s12 s13; do echo "file 'blocks/$b.mp4'"; done > out/list.txt
ffmpeg -y -v error -f concat -safe 0 -i out/list.txt -i out/mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 23 -tune animation -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest out/zombie_outbreak_cruise.mp4
node thumb.js out/thumb_full.png && ffmpeg -y -v error -i out/thumb_full.png -vf scale=1280:720 out/thumbnail.png
ls -la out/zombie_outbreak_cruise.mp4
