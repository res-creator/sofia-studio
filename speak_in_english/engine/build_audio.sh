#!/bin/bash
# usage: bash build_audio.sh <ep>  ->  eps/<ep>/timeline.json + eps/<ep>/mix.wav (voices + SFX + music, -14 LUFS)
set -e
cd "$(dirname "$0")"
EP=$1
python3 timeline_v2.py $EP
python3 audio_v2.py $EP
ffmpeg -y -loglevel error -i eps/$EP/mix_raw.wav -af loudnorm=I=-14:TP=-1.5 -ar 48000 eps/$EP/mix.wav
echo "eps/$EP/mix.wav ready"
