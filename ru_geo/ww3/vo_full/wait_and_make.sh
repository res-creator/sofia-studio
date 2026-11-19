#!/bin/sh
# Ждёт, пока бесплатный голос «Дмитрий» снова заработает (проверка раз в 20 минут), затем озвучивает весь текст.
cd "$(dirname "$0")/.."
while true; do
  if python3 -c "
import asyncio, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
import edge_tts
asyncio.run(edge_tts.Communicate('Ночь. Бункер под Москвой. Компьютер пишет одно слово: «Старт».', 'ru-RU-DmitryNeural').save('/tmp/probe.mp3'))
" 2>/dev/null; then
    echo "$(date -u +%H:%M) голос работает, озвучиваю"; python3 vo_full/make.py && echo DONE && exit 0
  else echo "$(date -u +%H:%M) голос пока не работает"; fi
  sleep 1200
done
