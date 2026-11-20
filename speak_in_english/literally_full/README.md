# «Буквально» — полный эпизод (thin-line стиль)

Том выучил 1000 английских идиом — и каждая сбывается буквально.
Персонажи: Парень (Том), Девушка (Кейт), Мама — из `linestyle/cast.js` (ветка claude/eloquent-brahmagupta-nf3pp4).

- `cast_anim.js` — копия cast.js + анимация: рот по громкости голоса, моргание, взгляд, брови, настроение рта, наклон головы, новые позы рук (hold, point, shrug, up), позы по сторонам `P.arms`.
- `render.js` — комната, камера, реплики, карточки, гэги (облако, уши, кошки/собаки, ведро, машинка по стене, лёд и рыба, лошади, мама в двери), звук.
- `voice/script.json`, `voice/gen.py` (ElevenLabs, ключ подставляет прокси), `voice/stt.py` (тайминги слов).

Сборка (нужен `node_modules` с @napi-rs/canvas в корне репо):
```
node render.js still 10,25          # кадры для проверки
for i in 0 1 2 3; do node render.js chunk $i 4 & done; wait
node render.js audio && node render.js srt && node render.js cover 24.8
```
затем склеить `out/tmp/chunk_*.mp4` + `out/tmp/mix.wav` (см. команду в PR).
