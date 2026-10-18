#!/bin/bash
# usage: bash finish_episode.sh <ep>
# Voices -> ASR check -> audio mix -> render -> releases/<ep>.mp4. Spends ElevenLabs credits (~1.5-2k chars per episode).
set -e
cd "$(dirname "$0")"
EP=$1
python3 eleven_nar.py $EP
python3 split_nar.py $EP
EL_MODEL=eleven_multilingual_v2 SKIP_EXISTING=1 python3 eleven_tts.py $EP a2_her  # keep the intentional A2 mistake (v3 auto-corrects it)
SKIP_EXISTING=1 python3 eleven_tts.py $EP
python3 asr_v2.py $EP en,ru | tee eps/$EP/asr.txt
bash build_audio.sh $EP
bash render.sh $EP > eps/$EP/render.log 2>&1
[ -e ../releases/$EP.mp4 ] && { echo "releases/$EP.mp4 exists - not overwriting"; exit 1; }
cp out/$EP.mp4 ../releases/$EP.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 ../releases/$EP.mp4
ffmpeg -nostats -i ../releases/$EP.mp4 -af ebur128 -f null - 2>&1 | grep -A1 Integrated | tail -1
git add -f eps/$EP/vo eps/$EP/nar_all.mp3 eps/$EP/timeline.json ../releases/$EP.mp4
echo "DONE: releases/$EP.mp4 — check eps/$EP/asr.txt, then commit & push"
