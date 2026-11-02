#!/bin/sh
# sh lawnchair_ep17/build.sh -> lawnchair_ep17/the_man_who_flew_in_a_lawn_chair.mp4 (1080x1920, 30 fps) + subtitles .srt
# Needs the real voice in vo/ (s01..s13 .mp3 + .align.json); vo_draft/ is for layout only and is never built.
set -e; cd "$(dirname "$0")"
for i in $(seq -w 1 13); do [ -f vo/s$i.mp3 ] || { echo "missing vo/s$i.mp3 (real voice) - not building"; exit 1; }; done
python3 speech.py > /dev/null
node episode.js cues && python3 mix.py
node episode.js srt the_man_who_flew_in_a_lawn_chair.srt
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
PRE="volume=10dB,alimiter=limit=0.72:attack=3:release=60:asc=1"   # mix is quiet (-23 LUFS): lift it, catch the peaks, then loudnorm to -14 LUFS / TP <= -1.5
ffmpeg -y -v error -i mix.wav -af "$PRE" -ar 44100 mixp.wav
ffmpeg -v info -i mixp.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> _ln.txt
M=$(python3 -c "import json,re;s=open('_ln.txt').read();d=json.loads(s[s.index('{'):s.rindex('}')+1]);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
set -- $M
ffmpeg -y -v error -i _video.mp4 -i mixp.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=true -ar 44100 -c:a aac -b:a 192k -t "$T" -movflags +faststart the_man_who_flew_in_a_lawn_chair.mp4
rm -f _video.mp4 _ln.txt mixp.wav; echo done
