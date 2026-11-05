#!/bin/sh
# Render every chapter: cues (sfx + music sections) -> sfx stems (fx.wav) -> picture (seg_video.mp4). 4 chapters in parallel.
# Usage: sh film/render_all.sh [chapter ...]     (from longform/lego_history)
cd "$(dirname "$0")/.."
CH=${*:-"c3_beyond c1_system c5_outsider c4_nomovie c7_stillfits c2_growth c0_hook c6_outsourcing"}
for c in $CH; do
  ( node chapters/$c/episode.js cues >/dev/null && cp film/mix.py chapters/$c/mix.py && python3 chapters/$c/mix.py >/dev/null &&
    node chapters/$c/episode.js video chapters/$c/seg_video.mp4 2> chapters/$c/build.log && echo "done $c" ) &
  while [ "$(pgrep -fc "episode.js video")" -ge 4 ]; do sleep 5; done
done
wait; echo ALL DONE
