# «Знакомство с британской мамой» — мини-история, рисованный стиль

Том хочет понравиться британской маме Кейт. Она говорит вежливо по-английски, а в облачке — что думает на самом деле (по-русски).
Финал: Том уходит, уверенный что провалился, а мама доедает его торт: «Not bad at all» = «Лучший торт в моей жизни!».

Код: `render.js` (+ `hand_kit.js`, `cast.js` — рисованные Том и героиня; мама — в render.js).
```
node render.js still 10,25
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover 12.6
```
Голоса: `voice/script.json`, `voice/gen.py` (ElevenLabs, ключ подставляет прокси), `voice/stt.py`.
