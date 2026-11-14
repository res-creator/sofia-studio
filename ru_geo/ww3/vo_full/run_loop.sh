#!/bin/sh
# перезапускает make.py, пока не озвучит всё (сервер Microsoft то отвечает, то нет)
cd "$(dirname "$0")"
for i in $(seq 1 60); do
  python3 make.py >> make.log 2>&1 && { echo DONE >> make.log; exit 0; }
  echo "retry $i $(date +%T)" >> make.log; sleep 120
done
