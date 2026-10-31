#!/bin/sh
# usage: sheet3.sh <slug> out.png frames...   (renders episode frames and tiles them 4 per row)
S=$1; OUT=$2; shift; shift; F=$(echo "$@" | tr ' ' ','); rm -f preview2/${S}_*.png
node $S.js 0 0 --png=$F 2>&1 | tail -5
ffmpeg -y -loglevel error -pattern_type glob -i "preview2/${S}_*.png" -vf "scale=360:-1,tile=$(echo "$#" | awk '{print ($1<4?$1:4)}')x$(echo "$#" | awk '{print int(($1+3)/4)}')" "$OUT"
