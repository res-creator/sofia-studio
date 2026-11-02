#!/bin/sh
# Final audio master + mux for How It's Run episodes: -14 LUFS integrated, true peak -1.5 dBTP (owner's rule).
# The raw mix is too peaky for -14 with loudnorm alone (it lands at ~-16), so: gentle bus compression + limiter, then two-pass loudnorm (linear).
# Usage: sh ../howitsrun_style/master.sh mix.wav _video.mp4 out.mp4 <duration_s>
set -e
IN=$1; VID=$2; OUT=$3; T=$4; TMP=$(mktemp -d)
ffmpeg -v error -y -i "$IN" -af "acompressor=threshold=-26dB:ratio=6:attack=2:release=80:makeup=10dB,alimiter=limit=0.5:attack=1:release=40:level=false" "$TMP/pre.wav"
ffmpeg -v info -i "$TMP/pre.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> "$TMP/ln.txt"
M=$(python3 -c "import json,sys;s=open(sys.argv[1]).read();d=json.loads(s[s.index('{'):s.rindex('}')+1]);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])" "$TMP/ln.txt")
set -- $M
ffmpeg -y -v error -i "$VID" -i "$TMP/pre.wav" -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true -ar 44100 -c:a aac -b:a 192k -t "$T" -movflags +faststart "$OUT"
rm -rf "$TMP"
