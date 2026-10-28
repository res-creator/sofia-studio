# Тест анимации «NO FIGHTING!» (THE ACCIDENTAL MAFIA BOSS)

Результат: `speak_in_english/mafia/test/no_fighting_test.mp4` — 40,6 с, 1920×1080, 30 fps, H.264 + AAC; временные реплики в пузырях (EN + RU), только звуковые эффекты, без голосов и ElevenLabs.
Короткий тест ходьбы (этап 1): `speak_in_english/mafia/test/stage1_motion_test.mp4` (7 с, без звука).

## Сборка (из `speak_in_english/engine`)
```bash
node mafia_nofight.js 0 0 --png=300,900            # контрольные кадры → preview2/
node mafia_nofight.js 0 1218 /tmp/nofight_silent.mp4   # рендер (~85 с на 4 ядрах)
python3 mafia_test_mix.py /tmp/nofight_silent.mp4 ../mafia/test/no_fighting_test.mp4   # звук + mux
```
Звуки берутся из библиотеки навыка make-2d-video (`kit/audio/sfx.py`) плюс несколько своих в `mafia_test_mix.py` (скретч, сверчки, разбитая чашка, римшот). Нужны numpy, scipy, soundfile.

## Новые модули (переиспользуемые)
| Файл | Что делает |
|---|---|
| `engine/act.js` | `walk()` — ходьба с перемещением: опорная ступня стоит на полу (проскальзывание < 1 px), шаг по фазе от пройденного пути, плавный разгон и остановка, покачивание корпуса, перенос веса, отмашка рук; `poser()` + `GEST` — жесты (rest, point, pointUp, spread, shrug, cross, hips, fists, pocketR, handsUp, chin) с плавными переходами, перелётом (`back`, `snap`) и «живым» дрейфом рук; `foot()` — нога выполняет действие (толкает предмет по полу); `key()` — ключи по времени; `flap()` — движение рта для временных реплик. |
| `engine/faces_plus.js` | Жуткая улыбка `grin(k)`, широкая улыбка `bigSmile`, свист `whistle`, нервная `wobble`; `extras()` — пот, тик глаза, бледность. |
| `engine/props_fx.js` | Палец (`finger`), падение с вращением и отскоками (`fall`), осколки, брызги и лужа, линии скорости, кольца реакции, ноты, пыль. |
| `engine/mafia_set.js` | Персонажи Alex, Tony, Bruno, Marco, Mrs. Patterson; зал Bella Notte; реквизит: блокнот MY PERFECT RESTAURANT PLAN, кастет, бита, чашка, стол со скатертью, стул. |
| `engine/mafia_nofight.js` | Сама тестовая сцена: 15 планов с жёсткими склейками и один быстрый наезд. |

## Изменения в общем риге `hq.js`
Только необязательные «крючки», которые читаются, если параметр задан: `st.legFn` (управление ногой), `st.shoeDir`, `st.eyeOpen`, `st.eyeBig`, `st.iris`, `st.brows`, `st.mouthFn`.
Проверка совместимости: 8 кадров из THE TRIAL, pizzas, restaurant и WRONG CHAT отрендерены старым и новым `hq.js` с одинаковым зерном — **совпали побайтно**.
