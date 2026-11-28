#!/bin/sh
# Пересборка готовых роликов по очереди (без субтитров, без первой секунды). Переживает перезагрузки:
# сделанные отмечаются файлом-маркером, незаконченный продолжается с готовой картинки (REUSE=1).
# Запуск: setsid nohup sh rebuild_chain.sh building_height universe_size ... > log 2>&1 &
S=/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad
cd /home/user/sofia-studio
for slug in "$@"; do
  [ -f "$S/rebuilt_v2_$slug" ] && continue
  echo "$(date +%T) start $slug"
  if REUSE=1 PRESET=veryfast python3 ru_geo/lemo/assemble_full.py "$slug"; then
    touch "$S/rebuilt_v2_$slug"; echo "$(date +%T) done $slug"
  else echo "$(date +%T) FAIL $slug"; fi
done
