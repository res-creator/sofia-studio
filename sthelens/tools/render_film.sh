#!/bin/sh
# Resumable chunked render of the full film (survives container restarts), then mux with the mix.
cd "$(dirname "$0")/.."
mkdir -p out/parts
TOTAL=$(python3 -c "import json,math;print(math.ceil(json.load(open('src/data/film.json'))['duration']*30))")
i=0; a=0
while [ $a -lt $TOTAL ]; do
  b=$((a+899)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=out/parts/p$(printf %02d $i).mp4
  if [ ! -s $f ]; then npx remotion render src/index.ts Film $f.tmp.mp4 --frames=$a-$b --muted --codec=h264 --crf=17 --concurrency=4 --log=error && mv $f.tmp.mp4 $f; rm -rf /tmp/remotion-webpack-bundle-*; fi
  i=$((i+1)); a=$((b+1))
done
ls out/parts/p*.mp4 | sort | sed "s|out/parts/|file '|;s|$|'|" > out/parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/parts/list.txt -i public/audio/film_mix.wav -map 0:v -map 1:a -vf "scale=in_range=full:out_range=limited,format=yuv420p" -c:v libx264 -crf 18 -preset medium -profile:v high -c:a aac -b:a 256k -shortest -movflags +faststart final/msh_full_film.mp4 && echo RENDER_DONE
