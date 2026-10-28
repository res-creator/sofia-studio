#!/bin/bash
# usage: bash run_queue.sh ep1 ep2 ... — finish episodes one by one; stops when ElevenLabs credits run low.
cd "$(dirname "$0")"
for EP in "$@"; do
  left=$(curl -sS https://api.elevenlabs.io/v1/user/subscription | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['character_limit']-d['character_count'])")
  echo "QUEUE $EP credits_left=$left"
  if [ "$left" -lt 2600 ]; then echo "QUEUE STOP low credits ($left)"; exit 0; fi
  if bash finish_episode.sh $EP > eps/$EP/finish.log 2>&1; then echo "QUEUE OK $EP"; else echo "QUEUE FAIL $EP"; tail -5 eps/$EP/finish.log; exit 1; fi
done
echo "QUEUE ALLDONE"
