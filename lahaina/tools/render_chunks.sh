#!/bin/sh
# resumable render: video-only chunks of 2000 frames, then concat + mux the full mix
cd "$(dirname "$0")/.."
mkdir -p out/parts
TOTAL=$(python3 -c "import json,math;print(math.ceil(json.load(open('src/data/full.json'))['duration']*30))")
i=0; a=0
while [ $a -lt $TOTAL ]; do
  b=$((a+1999)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=out/parts/p$(printf %02d $i).mp4
  if [ ! -s $f ]; then
    npx remotion render src/index.ts Full $f.tmp.mp4 --frames=$a-$b --muted --codec=h264 --crf=19 --concurrency=4 --log=error && mv $f.tmp.mp4 $f
  fi
  i=$((i+1)); a=$((b+1))
done
ls out/parts/p*.mp4 | sort | sed "s/^/file '..\//;s/$/'/" | sed "s|file '../out/parts/|file '|" > out/parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/parts/list.txt -i public/audio/full_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/full_raw.mp4 && echo RENDER_DONE
