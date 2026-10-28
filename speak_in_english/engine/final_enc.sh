#!/bin/bash
# usage: bash final_enc.sh <ep> <video_kbps> <out.mp4> <part1.mp4> [part2.mp4 ...]
set -e
cd "$(dirname "$0")"
EP=$1; VB=$2; OUT=$3; shift 3
N=$#; INS=(); FC=""
for f in "$@"; do INS+=(-i "$f"); done
for i in $(seq 0 $((N-1))); do FC+="[$i:v]"; done; FC+="concat=n=$N:v=1:a=0[v]"
P=eps/$EP/pass
ffmpeg -y -loglevel error "${INS[@]}" -i eps/$EP/mix.wav -filter_complex "$FC" -map "[v]" -c:v libx264 -preset slow -tune animation -b:v ${VB}k -pix_fmt yuv420p -pass 1 -passlogfile $P -an -f mp4 /dev/null
ffmpeg -y -loglevel error "${INS[@]}" -i eps/$EP/mix.wav -filter_complex "$FC" -map "[v]" -map $N:a -c:v libx264 -preset slow -tune animation -b:v ${VB}k -pix_fmt yuv420p -pass 2 -passlogfile $P -c:a aac -b:a 160k -movflags +faststart -shortest "$OUT"
ls -la "$OUT"
