# «Тебя вызвали читать по-английски», выпуск 1 — история от рассказчика (формат the.seventh, свой плоский стиль)

Рассказчик говорит «ты»; новый кадр каждые 1,5–3 с; метафоры: рулетка, дуэль на Диком Западе, звонок-спасение.
Учим: TH (язык между зубами), work / walk.
Голоса: рассказчик и Вова — Fish Audio (s2.1-pro-free), англичанка — ElevenLabs eleven_v3. Смена голоса — в `voice/script.json`.
Субтитры всегда в нижней трети (y≈1560), лица в кадре выше 1400.
```
python3 voice/gen.py && python3 voice/stt.py
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover
```
