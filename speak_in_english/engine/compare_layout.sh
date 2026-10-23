#!/bin/bash
# usage: bash compare_layout.sh <ep> <start_sec> <dur_sec> [name]
# Renders the same fragment with the old composition (LAYOUT=v1) and the new one (LAYOUT=v2), both with v2 characters,
# using the existing voice track. Writes review/layout_test/<name>_v1.mp4, _v2.mp4 and a side-by-side _compare.mp4.
# Episode sources, timelines and released MP4s are not touched.
set -e
cd "$(dirname "$0")"
EP=$1; S=$2; D=$3; N=${4:-$EP}; OUT=../review/layout_test; mkdir -p $OUT
F0=$(python3 -c "print(round($S*30))"); F1=$(python3 -c "print(round(($S+$D)*30))")
TMP=$(mktemp -d)
for L in v1 v2; do (LAYOUT=$L CHAR_STYLE=v2 node $EP.js $F0 $F1 $TMP/$L.mp4 2> $TMP/$L.log) & done; wait
for L in v1 v2; do ffmpeg -loglevel error -y -i $TMP/$L.mp4 -ss $S -t $D -i eps/$EP/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -shortest $OUT/${N}_$L.mp4; done
FONT=$(fc-match -f '%{file}' 'DejaVu Sans:bold' 2>/dev/null || true)
ffmpeg -loglevel error -y -i $OUT/${N}_v1.mp4 -i $OUT/${N}_v2.mp4 -filter_complex \
 "[0:v]scale=540:960,drawtext=fontfile=$FONT:text='ДО':x=20:y=20:fontsize=44:fontcolor=white:box=1:boxcolor=0xB8302E@0.9:boxborderw=12[a];[1:v]scale=540:960,drawtext=fontfile=$FONT:text='ПОСЛЕ':x=20:y=20:fontsize=44:fontcolor=white:box=1:boxcolor=0x2F8A4A@0.9:boxborderw=12[b];[a][b]hstack=inputs=2[v]" \
 -map "[v]" -map 1:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k $OUT/${N}_compare.mp4
rm -rf $TMP; echo "done $OUT/${N}_compare.mp4"
