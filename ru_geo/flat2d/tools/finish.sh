#!/usr/bin/env bash
# bash tools/finish.sh <film> <кадры> <выход.mp4> <музыка1> <музыка2> ...   (треки mixkit_NN из paperson/music)
set -e; R=/home/user/sofia-studio/ru_geo; F="$1"; FR="$2"; OUT="$3"; shift 3
T=$(python3 -c "import json;print(json.load(open('$R/$F/film.json'))['total'])"); M=$R/paperson/music; TMP=$(mktemp -d)
ARGS=(); FILT=""; n=0; for m in "$@"; do ARGS+=(-i "$M/mixkit_$m.mp3"); n=$((n+1)); done
prev="[0]"; for ((i=1;i<n;i++)); do FILT+="$prev[$i]acrossfade=d=4[c$i];"; prev="[c$i]"; done
ffmpeg -v error -y "${ARGS[@]}" -filter_complex "${FILT}${prev}atrim=0:$T,asetpts=N/SR/TB,volume=0.13,afade=t=in:d=3,afade=t=out:st=$(python3 -c "print($T-5)"):d=5[mus]" -map "[mus]" -ar 48000 -ac 2 $TMP/music.wav
ffmpeg -v error -y -i $R/$F/vo_clone/vo.mp3 -i $TMP/music.wav -filter_complex "[0:a]apad=whole_dur=$T[v];[v][1:a]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7[o]" -map "[o]" -ar 48000 -ac 2 $TMP/mix.wav
ffmpeg -v error -y -framerate 30 -i "$FR/f%05d.jpg" -i $TMP/mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact "$OUT"
echo "--- QA (пусто = нет чёрных/замёрзших кусков дольше порога)"; ffmpeg -i "$OUT" -vf "freezedetect=n=0.0008:d=6,blackdetect=d=1.5:pix_th=0.05" -an -f null - 2>&1 | grep -E "freeze_start|freeze_duration|black_start" | head -20 || true
ffmpeg -i "$OUT" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -n 1
