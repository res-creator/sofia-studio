#!/bin/bash
# usage: bash build_pingpong.sh -> eps/pingpong/timeline.json + mix.wav (-14 LUFS). Then: bash render.sh pingpong
set -e
cd "$(dirname "$0")"
python3 pingpong_tl.py
python3 audio_v2.py pingpong
M=$(ffmpeg -hide_banner -nostats -i eps/pingpong/mix_raw.wav -af loudnorm=I=-14:TP=-1.5:print_format=json -f null - 2>&1 | python3 -c "import sys,json,re; t=sys.stdin.read(); d=json.loads(t[t.rindex('{'):]); print('measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s' % (d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset']))")
ffmpeg -y -loglevel error -i eps/pingpong/mix_raw.wav -af "loudnorm=I=-14:TP=-1.5:$M:linear=true" -ar 48000 eps/pingpong/mix.wav       # two-pass, exactly -14 LUFS
echo "eps/pingpong/mix.wav ready"
