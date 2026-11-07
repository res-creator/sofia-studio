#!/bin/sh
# Resumable chunked render: Opening + main Film (muted video), then one soundtrack (opening mix + film mix, -14 LUFS) and the final mux.
cd "$(dirname "$0")/.."
mkdir -p out/parts final
fr() { python3 -c "import json,math;print(math.ceil(json.load(open('src/data/$1.json'))['duration']*30))"; }
OF=$(fr open); FF=$(fr film)
[ -s out/parts/o00.mp4 ] || { npx remotion render src/index.ts Opening out/parts/o00.tmp.mp4 --muted --codec=h264 --crf=17 --concurrency=4 --log=error && mv out/parts/o00.tmp.mp4 out/parts/o00.mp4; rm -rf /tmp/remotion-webpack-bundle-*; }
i=0; a=0
while [ $a -lt $FF ]; do
  b=$((a+899)); [ $b -ge $FF ] && b=$((FF-1))
  f=out/parts/p$(printf %02d $i).mp4
  if [ ! -s $f ]; then npx remotion render src/index.ts Film $f.tmp.mp4 --frames=$a-$b --muted --codec=h264 --crf=17 --concurrency=4 --log=error && mv $f.tmp.mp4 $f; rm -rf /tmp/remotion-webpack-bundle-*; fi
  i=$((i+1)); a=$((b+1))
done
{ echo "file 'o00.mp4'"; ls out/parts/p*.mp4 | sort | sed "s|out/parts/|file '|;s|$|'|"; } > out/parts/list.txt
OD=$(python3 -c "print($OF/30)"); FD=$(python3 -c "print($FF/30)")
ffmpeg -v error -y -i public/audio/open_mix.wav -i public/audio/film_mix.wav -filter_complex "[0:a]apad,atrim=0:$OD[a];[1:a]apad,atrim=0:$FD[b];[a][b]concat=n=2:v=0:a=1,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 44100 out/full_mix.wav
ffmpeg -v error -y -f concat -safe 0 -i out/parts/list.txt -i out/full_mix.wav -map 0:v -map 1:a -vf "scale=in_range=full:out_range=limited,format=yuv420p" -c:v libx264 -crf 18 -preset medium -profile:v high -c:a aac -b:a 256k -shortest -movflags +faststart final/dwh_full_film.mp4 && echo RENDER_DONE
