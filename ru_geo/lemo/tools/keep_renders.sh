#!/bin/sh
# Сторож рендеров «Инженерной доски»: каждые 60 с перезапускает оборванные рендеры частей,
# кодирует готовые части. Запуск: setsid nohup sh keep_renders.sh > log 2>&1 &
L=/home/user/sofia-studio/ru_geo/lemo; P=/home/user/sofia-studio/ru_geo/building_height/video/parts
while true; do
  for d in $L/*/; do d=${d%/}
    [ -f $d/tools/render.sh ] || continue
    out=$(grep -o 'OUT=[^ ;]*' $d/tools/render.sh | head -1 | cut -d= -f2)
    [ -n "$out" ] && [ -s "$out" ] && ffprobe -v error "$out" > /dev/null 2>&1 && continue
    [ -f $d/.render_ready ] || continue                     # агент ещё не закончил сцену
    busy=0; pgrep -f "$d/" > /dev/null && busy=1                       # любой процесс этой папки (кадры, кодирование)
    [ -f $d/out/worker.pid ] && kill -0 $(cat $d/out/worker.pid) 2>/dev/null && busy=1
    [ $busy = 1 ] && continue
    if sh $d/tools/render.sh encode > $d/out/encode.log 2>&1; then
      echo "$(date +%T) encoded $d"; rm -rf $d/out/frames $d/out/chk; continue
    fi
    echo "$(date +%T) start $d"; (cd $d && sh tools/render.sh > /dev/null 2>&1)
  done
  sleep 60
done
