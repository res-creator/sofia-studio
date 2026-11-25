#!/bin/sh
# two-pass loudnorm to -14 LUFS / -1 dBTP and mux (works with ffmpeg 6; the library's mux.sh wants ffmpeg 7+)
set -e
V=$1; A=$2; O=$3
J=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 192k -shortest -movflags +faststart "$O"
ffmpeg -hide_banner -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
