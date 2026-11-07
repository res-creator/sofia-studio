# Динамичные голоса для гео-канала (Fish Audio, модель s2.1-pro-free)
Один и тот же текст (начало пилота «Норвегия»). Для сравнения: сейчас в пилоте голос «Russian», 129 слов/мин.

| Файл | Голос Fish Audio (id) | Темп |
|---|---|---|
| 1_energichny_rasskazchik.mp3 | «Энергичный Рассказчик» `48ec28a45588422b977a86460c11977f` | 186 слов/мин |
| 2_youtube_golos.mp3 | «Ютуб шорис» `d9825d48a0dc4953826ffef37be23a54` | 187 слов/мин |
| 3_anatoliy.mp3 | «Анатолий» `7098e7d6b35344068e3510444159e3c6` | 173 слова/мин |
| 4_rasskazchik_chetkiy.mp3 | «Мужской Голос Рассказчика» `6ccdfb6b21e14501adc1fbcb44e50082` | 140 слов/мин |
| 5_molodoy_rasskazchik.mp3 | «Молодой Русский Рассказчик» `c962ed46edfd419abc530d1e33a7435f` | 135 слов/мин |

Сменить голос в пилоте: поменять `VOICE` в `ru_geo/norway_pilot/tts.py`, затем `python3 tts.py && python3 align.py && python3 maps.py && python3 render.py`.
