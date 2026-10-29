#!/bin/bash
# usage: bash finish_batch_rbp.sh [rich] [busy] [avoidparty]   (no args = all three, one after another)
# Batch "look rich / pretend busy / avoid party": voices -> audio mix -> render -> releases/<name>.mp4.
# SPENDS ElevenLabs credits: rich ~2 340, busy ~2 190, avoidparty ~2 380 characters (Sarah one take + EN lines eleven_v3 + Bella tips).
# Every line is generated once: existing eps/<ep>/vo/<id>.wav and eps/<ep>/nar_all.mp3 are never re-generated.
# Before each episode the account balance is checked; the script stops if it is not enough. The API key comes from the
# environment/proxy only (never write it into files). Requests go one at a time with ~3 s pauses (eleven_tts_ts.py).
set -e
cd "$(dirname "$0")"
declare -A OUTN=([rich]=look_rich [busy]=pretend_busy [avoidparty]=avoid_party)
EPS=${@:-rich busy avoidparty}
for EP in $EPS; do
  NEED=$(python3 - $EP <<'PY'
import os, sys
from episodes_v2 import EP
e = sys.argv[1]; L = EP[e]["lines"]; vo = f"eps/{e}/vo"
nar = 0 if os.path.exists(f"eps/{e}/nar_all.mp3") else len(' <break time="2.0s" /> '.join(l[2] for l in L if l[1] == "nar"))
en = sum(len(l[2]) for l in L if l[1] != "nar" and not os.path.exists(f"{vo}/{l[0]}.wav"))
print(nar + en)
PY
)
  LEFT=$(curl -sS https://api.elevenlabs.io/v1/user/subscription | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['character_limit'] - d['character_count'])")
  echo "== $EP: needs $NEED characters, account has $LEFT left"
  if [ "$LEFT" -lt "$NEED" ]; then echo "NOT ENOUGH ElevenLabs credits for $EP — stopping (nothing generated for it)"; exit 2; fi
  [ -e eps/$EP/nar_all.mp3 ] || python3 eleven_nar.py $EP
  python3 split_nar.py $EP
  SKIP_EXISTING=1 python3 eleven_tts_ts.py $EP
  [ -d models/sherpa-onnx-whisper-small ] && python3 asr_v2.py $EP en,ru | tee eps/$EP/asr.txt || echo "(Whisper model not installed - listen-back check skipped)"
  bash build_audio.sh $EP
  bash render.sh $EP > eps/$EP/render.log 2>&1
  OUT=../releases/${OUTN[$EP]}.mp4
  [ -e $OUT ] && { echo "$OUT exists - not overwriting"; exit 1; }
  cp out/$EP.mp4 $OUT
  node $EP.js 0 0 --png=0 >/dev/null && cp preview2/${EP}_00000.png ../releases/${OUTN[$EP]}_cover.png
  ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact $OUT
  ffmpeg -nostats -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 Integrated | tail -1
  git add -f eps/$EP/vo eps/$EP/src eps/$EP/nar_all.mp3 eps/$EP/timeline.json $OUT ../releases/${OUTN[$EP]}_cover.png
  echo "DONE: $OUT — check eps/$EP/asr.txt and the contact sheet, then commit & push"
done
