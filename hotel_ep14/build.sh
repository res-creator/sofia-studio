#!/bin/sh
# sh hotel_ep14/build.sh -> the_1400_hotel_room.mp4 (1080x1920, 30 fps) + subtitles the_1400_hotel_room.srt
# With the real voice in vo/ (h01..s19 .mp3 + .align.json from vo.py) it builds the final cut. Without it, it builds the NO-VOICE cut
# (the_1400_hotel_room_novoice.mp4): draft timings from vo_draft/, music + SFX + English subtitles, no narration.
set -e; cd "$(dirname "$0")"
OUT=the_1400_hotel_room
if [ -f vo/s19.mp3 ]; then python3 speech.py > /dev/null; NAME=$OUT; else NAME=${OUT}_novoice; fi
node episode.js cues && python3 mix.py
node episode.js srt $OUT.srt
node episode.js video _video.mp4
T=$(node -e "console.log(require('./episode.js').T)" none)
ffmpeg -v info -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> _ln.txt
M=$(python3 -c "import json,re;s=open('_ln.txt').read();d=json.loads(s[s.index('{'):s.rindex('}')+1]);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
set -- $M
ffmpeg -y -v error -i _video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$1:measured_TP=$2:measured_LRA=$3:measured_thresh=$4:offset=$5:linear=false -ar 44100 -c:a aac -b:a 192k -t "$T" -movflags +faststart $NAME.mp4
rm -f _video.mp4 _ln.txt; echo done $NAME.mp4
