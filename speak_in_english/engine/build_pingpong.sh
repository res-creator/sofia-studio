#!/bin/bash
# usage: bash build_pingpong.sh -> eps/pingpong/timeline.json + mix.wav (-14 LUFS). Then: bash render.sh pingpong
set -e
cd "$(dirname "$0")"
python3 pingpong_tl.py
python3 audio_v2.py pingpong
ffmpeg -y -loglevel error -i eps/pingpong/mix_raw.wav -af loudnorm=I=-14:TP=-1.5 -ar 48000 eps/pingpong/mix.wav
echo "eps/pingpong/mix.wav ready"
