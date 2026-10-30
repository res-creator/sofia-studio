#!/bin/bash
# usage: bash build_saidheard.sh  -> eps/saidheard/timeline.json + mix.wav (voices + SFX + music, -14 LUFS). Then: bash render.sh saidheard
set -e
cd "$(dirname "$0")"
python3 saidheard_tl.py
python3 audio_v2.py saidheard
ffmpeg -y -loglevel error -i eps/saidheard/mix_raw.wav -af loudnorm=I=-14:TP=-1.5 -ar 48000 eps/saidheard/mix.wav
echo "eps/saidheard/mix.wav ready"
