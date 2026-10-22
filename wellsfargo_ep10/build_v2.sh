#!/bin/sh
# sh wellsfargo_ep10/build_v2.sh -> wellsfargo_ep10/the_5_coffee_that_cost_40_v2.mp4 (1080x1920, 30 fps) + subtitles _v2.srt
set -e; cd "$(dirname "$0")"
node episode_v2.js cues && python3 mix_v2.py
node episode_v2.js srt the_5_coffee_that_cost_40_v2.srt
node episode_v2.js video _video_v2.mp4
T=$(node -e "console.log(require('./episode_v2.js').T)" none)
ffmpeg -v info -i mix_v2.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> _ln.txt
M=$(python3 -c "import json,re;s=open('_ln.txt').read();d=json.loads(s[s.index('{'):s.rindex('}')+1]);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
set -- $M
ffmpeg -y -v error -i _video_v2.mp4 -i mix_v2.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true -ar 44100 -c:a aac -b:a 192k -t "$T" -movflags +faststart the_5_coffee_that_cost_40_v2.mp4
rm -f _video_v2.mp4 _ln.txt; echo done
