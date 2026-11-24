#!/bin/bash
# short cuts from final/part2.mp4: a cold-open teaser (strongest moment) + the scene, re-encoded frame-accurately
set -e; cd "$(dirname "$0")"; S=final/part2.mp4; mkdir -p out/cuts
seg() { ffmpeg -nostdin -v error -y -ss $2 -to $3 -i $S -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
  -af "afade=t=in:d=0.04,afade=t=out:st=$(python3 -c "print(round($3-$2-0.06,3))"):d=0.06" -c:a aac -b:a 192k out/cuts/$1.mp4; }
cut() { n=$1; shift; i=0; : > out/cuts/$n.txt; while (( $# )); do seg ${n}_$i $1 $2; echo "file ${n}_$i.mp4" >> out/cuts/$n.txt; shift 2; i=$((i+1)); done
  (cd out/cuts && ffmpeg -nostdin -v error -y -f concat -safe 0 -i $n.txt -c copy ../../final/cut_$n.mp4); rm -f out/cuts/${n}_*.mp4
  echo "$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 final/cut_$n.mp4)"; }
# Джош ест цветы: teaser «ЭТО МОИ ЦВЕТЫ!» then Josh's entrance → «прячь фикус» + Zvezdana's «always hungry»
cut flowers 20.35 21.85 2.00 32.75
# Крипта рухнула: teaser crash+bleep, then Ryan's entrance → «Я тоже вложилась»
cut crypto 52.55 54.60 32.80 71.60
# Выбор невесты: teaser «he's married», then «ваш выбор?» → the end
cut choice 117.75 119.85 92.70 148.42
rm -rf out/cuts
