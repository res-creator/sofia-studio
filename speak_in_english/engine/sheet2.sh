#!/bin/sh
# usage: sheet2.sh out.png frames...  (pingpong frames tiled 4 per row)
OUT=$1; shift; F=$(echo "$@" | tr ' ' ','); rm -f preview2/pingpong_*.png
node pingpong.js 0 0 --png=$F 2>&1 | tail -5
ffmpeg -y -loglevel error -pattern_type glob -i 'preview2/pingpong_*.png' -vf "scale=360:-1,tile=$(echo "$#" | awk '{print ($1<4?$1:4)}')x$(echo "$#" | awk '{print int(($1+3)/4)}')" "$OUT"
