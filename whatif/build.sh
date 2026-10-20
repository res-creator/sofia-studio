#!/bin/sh
# Build a What-if episode: sh whatif/build.sh whatif/jupiter out.mp4
# Needs <ep>/vo/<id>.wav|mp3 (draft: python3 whatif/tts_kokoro.py <ep>; final: ElevenLabs).
set -e; cd "$(dirname "$0")/.."; EP=$1; OUT=${2:-$EP/out.mp4}
python3 whatif/timeline.py $EP && node $EP/render.js cues && python3 whatif/audio.py $EP
T=$(node -e "console.log(require('./$EP/timeline.json').T + 0.3)"); H=$(node -e "console.log(($T/2).toFixed(2))")
node $EP/render.js video 0 $H $EP/_a.mp4 & node $EP/render.js video $H $T $EP/_b.mp4 & wait
printf "file '_a.mp4'\nfile '_b.mp4'\n" > $EP/_list.txt
ffmpeg -y -v error -f concat -safe 0 -i $EP/_list.txt -i $EP/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -tune animation -pix_fmt yuv420p -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -shortest "$OUT"
rm -f $EP/_a.mp4 $EP/_b.mp4 $EP/_list.txt; echo done "$OUT"
