#!/bin/sh
# Сторож рендеров «Инженерной доски»: каждые 60 с перезапускает оборванные рендеры частей,
# кодирует готовые части. Запуск: setsid nohup sh keep_renders.sh > log 2>&1 &
L=/home/user/sofia-studio/ru_geo/lemo; P=/home/user/sofia-studio/ru_geo/building_height/video/parts
while true; do
  for d in $L/*/; do d=${d%/}
    [ -f $d/tools/render.sh ] || continue
    out=$(grep -o 'OUT=[^ ;]*' $d/tools/render.sh | head -1 | cut -d= -f2)
    [ -n "$out" ] && [ -s "$out" ] && continue
    [ -f $d/.render_ready ] || continue                     # агент ещё не закончил сцену
    if sh $d/tools/render.sh encode > /dev/null 2>&1; then
      echo "$(date +%T) encoded $d"; rm -rf $d/out/frames $d/out/chk; continue
    fi
    pgrep -f "$d/tools/frames.mjs" > /dev/null || { echo "$(date +%T) start $d"; (cd $d && sh tools/render.sh > /dev/null 2>&1); }
  done
  sleep 60
done
