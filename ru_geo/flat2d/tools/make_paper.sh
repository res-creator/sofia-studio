#!/usr/bin/env bash
# bash tools/make_paper.sh <slug> [шаги]: полный конвейер «бумажного» ролика. Шаги: vo photos sb render finish (по умолчанию все).
# Нужны ru_geo/<slug>/SCRIPT.md (с разметкой >>), photos.json. Кадры во временной папке сессии, итог ru_geo/<slug>/video/<slug>.mp4
set -e; SL="$1"; shift || true; STEPS="${*:-vo photos sb render finish}"; R=/home/user/sofia-studio/ru_geo; F=$R/flat2d
FR=${FRAMES_DIR:-/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad/fr_$SL}; has() { [[ " $STEPS " == *" $1 "* ]]; }
cd $F
if has vo; then python3 $R/voices_free/make_clone_vo.py $R/$SL && python3 tools/build_film.py $R/$SL && python3 tools/make_env.py $R/$SL; fi
if has photos; then python3 archive/pick.py $SL; fi
if has sb; then python3 tools/auto_paper.py $SL; fi
if has render; then T=$(python3 -c "import json;print(int(json.load(open('$R/$SL/film.json'))['total']*30))"); mkdir -p $FR; H=$((T/4+1))
  for w in 0 1 2 3; do A=$((w*H)); B=$(( (w+1)*H-1 )); [ $B -ge $T ] && B=$((T-1)); RESUME=1 node render.mjs $SL $FR $A-$B > $FR.w$w.log 2>&1 & done; wait; echo "frames: $(ls $FR | wc -l) / $T"; fi
if has finish; then mkdir -p $R/$SL/video; bash tools/finish.sh $SL $FR $FR.big.mp4 41 76 22 18 | grep -E "duration|LUFS|freeze|black" || true
  ffmpeg -v error -y -i $FR.big.mp4 -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -c:a copy -movflags +faststart $R/$SL/video/$SL.mp4; rm -f $FR.big.mp4
  mkdir -p $R/$SL/review; ffmpeg -v error -y -i $R/$SL/video/$SL.mp4 -vf "fps=1/20,scale=480:-1,tile=5x6" -frames:v 1 $R/$SL/review/final_sheet.jpg; ls -la $R/$SL/video; fi
