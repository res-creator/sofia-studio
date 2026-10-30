#!/bin/sh
# usage: sheet.sh out.png frames...   (renders momshow frames and tiles them 4 per row)
OUT=$1; shift; F=$(echo "$@" | tr ' ' ','); rm -f preview2/momshow_*.png
node momshow.js 0 0 --png=$F 2>&1 | tail -5
ffmpeg -y -loglevel error -pattern_type glob -i 'preview2/momshow_*.png' -vf "scale=360:-1,tile=$(echo "$#" | awk '{print ($1<4?$1:4)}')x$(echo "$#" | awk '{print int(($1+3)/4)}')" "$OUT"
