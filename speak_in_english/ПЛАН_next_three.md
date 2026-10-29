# Партия из трёх TikTok-серий: план производства (ветка `claude/tiktok-next-three`)

Основа: ветка серии teacher (`claude/wonderful-goldberg-qebii7`). Серии resume в GitHub на момент старта не было; её работа не затронута.

| № | Серия | slug | Итоговый файл |
|---|---|---|---|
| 1 | WHEN YOU PRETEND TO KNOW SOMEONE | `pretend` | `releases/pretend_to_know.mp4` |
| 2 | WHEN YOU FORGET YOUR PASSWORD | `password` | `releases/forgot_password.mp4` |
| 3 | WHEN YOU CAN'T SAY NO | `cantsayno` | `releases/cant_say_no.mp4` |

## Итог (29.10.2026): все три видео готовы

| Серия | Длительность | Громкость | Файлы |
|---|---|---|---|
| pretend | 2:34 | −14.2 LUFS | `releases/pretend_to_know.mp4`, `releases/pretend_to_know_cover.png`, `releases/pretend_to_know_tiktok.md` |
| password | 2:34 | −14.4 LUFS | `releases/forgot_password.mp4`, `releases/forgot_password_cover.png`, `releases/forgot_password_tiktok.md` |
| cantsayno | 2:49 | −14.0 LUFS | `releases/cant_say_no.mp4`, `releases/cant_say_no_cover.png`, `releases/cant_say_no_tiktok.md` |

- Владелица пополнила ElevenLabs (10 000 символов) и попросила не сокращать текст, поэтому видео длиннее 2:10.
- ElevenLabs: счётчик аккаунта вырос с 0 до 4 268 из 10 000; осталось 5 732.
- Рендеры: `engine/pretend.js`, `engine/password.js`, `engine/cantsayno.js` (камера hard_cut). Озвучка: `engine/eps/<slug>/vo`, `nar_all.mp3`, `timeline.json`.
- Whisper всё распознал. Две реплики он записал с ошибкой из-за созвучия, но звучат они правильно: «too weak» → «2-Week», британское «why are you» → «wire you».

Ниже — исходный план (28.10), до озвучки.

## 1. Почему остановились: баланс ElevenLabs (28.10.2026)

`GET /v1/user/subscription`: тариф **free**, использовано 9 368 из 10 000, **осталось 632 символа**. Лимит обновится **25.11.2026**. Докупить символы на бесплатном тарифе нельзя (`can_extend_character_limit: false`), нужен платный тариф.

Расход на партию (английские реплики eleven_v3 считаются вместе с тегами вроде `[excited]`, диктор идёт одним дублем с `<break>`):

| Серия | Английские реплики | Bella | Sarah (дубль) | Итого |
|---|---|---|---|---|
| pretend | 1 565 | 48 | 688 | **2 301** |
| password | 1 335 | 51 | 682 | **2 068** |
| cantsayno | 1 621 | 40 | 693 | **2 354** |
| **Всего** | | | | **6 723** (≈7 400 с запасом ~10 % на пересъёмку) |

**Не хватает ≈6 100 символов** (≈6 800 с запасом). Даже на одну серию 632 символов не хватит. Озвучка не запускалась.

## 2. Что уже готово

- `engine/episodes_v2.py`: `EP["pretend"]`, `EP["password"]`, `EP["cantsayno"]`. Тексты владельца, переводы, `camera="hard_cut"`, `chunks` для длинных реплик, карточки meter/eq/c2, подсказки Bella на A2 и C1.
  Новые голоса в `CAST` (только существующие голоса ElevenLabs, уже звучавшие на канале): `stranger` = Liam, `favor` = Brian, `hguest` = Daniel. Система в password = `machine` (Matilda, голос кассы из checkout). Героиня = Jessica, tip = Bella, диктор = Sarah.
- `engine/timeline_v2.py`: монтажные листы (хук + 6 уровней) с паузами под гэги, звуками и СОБЫТИЯМИ для рендера.
- `engine/audio_v2.py`: для трёх серий включены уже существующие звуки (клавиатура, ошибка, сообщение, затвор камеры). Старые серии сводятся как раньше.
- `releases/*_tiktok.md`: подпись, хештеги, закреплённый комментарий и описание обложки для каждой серии.

## 3. Длительность (оценка до озвучки)

Скорость речи откалибрована по настоящей озвучке teacher/mic/checkout: англ. ≈13.8 симв/с, диктор ≈16 симв/с.

| Серия | Хук | A1 | A2 | B1 | B2 | C1 | C2 | Концовка | **Итого** |
|---|---|---|---|---|---|---|---|---|---|
| pretend | 11 | 17 | 20 | 22 | 24 | 28 | 36 | 6 | **≈2:44** |
| password | 11 | 15 | 20 | 24 | 23 | 29 | 36 | 6 | **≈2:44** |
| cantsayno | 12 | 16 | 24 | 20 | 25 | 28 | 46 | 6 | **≈2:57** |

(по уровням: оценка ±1–2 с)

⚠️ Полный текст даёт 2:45–2:55, это больше цели 1:40–2:10. Сценарий не сокращён: это решение владельца. Варианты:
- **pretend** −7 реплик (a1_m, a1_her, b1_m2, b1_her2, c1_m, c2_m2, c2_her3) → ≈2:28, экономия 246 символов;
- **password** −6 (a1_her2, b1_x3, b1_her3, b2_her, c1_x2, c2_x) → ≈2:34, −146 символов;
- **cantsayno** −8 (a1_m2, a2_m3, b1_m3, b2_g2, c1_m, c2_m6, c2_her4, c2_m2) → ≈2:37, −305 символов.
Чтобы выйти на 2:10, кроме этих сокращений нужно урезать паузы под гэги, примерно на 15–20 с на серию.

## 4. Раскадровка (камера `hard_cut`, планы по CAMERA.md)

Общий набор планов в каждой серии: `WIDE`, `CARD` (с началом `*_nar` до конца уровня), `HER` / `<ИМЯ>`, реакции `HER_R` / `<ИМЯ>_R`, вставки предметов на тёмном фоне. Образец: `shotHard` в `teacher.js` / `wrongchat.js`. Героиня = `BASE.her_lift` с одеждой по серии, как в `checkout.js`.

### pretend: улица у кафе (рендер на базе `teacher.js`; собеседник = `BASE.tom` в куртке)
- **Хук (кадр 0 = обложка):** она с кофе, он машет. «OH MY GOD! IT'S YOU!» → `HER_R` «…Me?» → `MAN` «Don't you remember me?» → `HER` крупно, испуг (ev `scared`), плашка WHO IS THIS GUY?!
- **A1:** WAVE (он подходит, общий план) → диалог склейками → FREEZE: её лицо застыло, над головой NAMEBOX «NAME: ???» и тиканье → «…Buddy?» → STARE, `MAN_R` с удивлением.
- **A2:** реплики в `CARD`/`WIDE`, неловкая пауза SMILE1→2→3: улыбки растут, по разу на каждый скрип.
- **B1:** LOOKUP (он рассматривает её), HAIR (она поправляет волосы), PLAN: «мысленная схема» над головой, SAY NOTHING SPECIFIC ✓ (CHECK) → NOD.
- **B2:** PHONE → SELFIE (затвор, вспышка, оба в кадре) → вставка телефона SCREEN «WITH MY OLD FRIEND… NAME: ???» → SUSP: она щурится → SWEAT у него.
- **C1:** SQUINT → допрос склейками → пауза с тиканьем перед «…A special one?» → ARMS: она скрещивает руки.
- **C2:** длинная речь частями → PAUSE + тиканье → RELIEF: он выдыхает «THANK GOD! ME NEITHER!» → SHOCK у неё → STAREBOTH (оба молча, тиканье) → хором «IT WAS NICE SEEING YOU!» (две дорожки разом) → SPLIT (расходятся в разные стороны) → BACK (оба возвращаются) → «What's your name?» → «Nope.» → RUN (убегает) → BLACK.

### password: комната, ноутбук (рендер на базе `mic.js`: там уже есть экран, клавиатура и вставки)
- **Хук:** вставка экрана INCORRECT PASSWORD (красная), злая героиня, крик → экран мигает → «Incorrect password.».
- **A1:** TYPE (точки пароля, звуки клавиш) → ENTER → ошибка ×2 → ATTEMPTS REMAINING: 1 (мигает).
- **A2:** FORGOT PASSWORD? (клик) → поле email → «We sent you a code» → MAIL → LOGIN: «TO OPEN YOUR EMAIL, PLEASE LOG IN.» → STARE на неё.
- **B1:** SMS на телефоне «482916» → CODE (ввод) → EXPIRED → новый код: SENT → TOOMANY «TOO MANY REQUESTS. TRY AGAIN TOMORROW.» → EYES: она медленно закрывает глаза.
- **B2:** NEXTDAY (плашка «НА СЛЕДУЮЩИЙ ДЕНЬ», солнце в окне) → CAPTCHA 3×3 светофоры, клики, ошибка → SELF9: девять одинаковых фото героини → STARE.
- **C1:** NEWPW → BANANA «Banana123» → TOO WEAK → BANANA2 «Banana123!@#» → «must contain a special character» → ROMAN «MUST CONTAIN A ROMAN NUMERAL» → LOOKCAM (взгляд в камеру).
- **C2:** длинная речь частями → SAVE → тиканье → ERROR «NEW PASSWORD CANNOT BE THE SAME AS YOUR OLD PASSWORD» → FREEZE → «Yes.» → крик → тишина → CAPS: вставка клавиатуры, горит CAPS LOCK ● → HEAD: голова на стол (бух) → «rate your experience?» ★★★★★ → RISE → «NO.» → BLACK.

### cantsayno: улица → вход в отель → стойка регистрации (рендер на базе `checkout.js`: стойка = прилавок; собеседник = `BASE.jay`, гость = `BASE.reggie`)
- **Хук:** улица: «tiny favor?» — «Sure!» → резкая склейка (ev `cut`): стойка отеля, бейдж HOTEL MANAGER, длинная очередь → «HOW DID THIS HAPPEN?!».
- **A1:** BAG1 (она держит сумку) → AWAY/BACK (он уходит и возвращается) → BAG2: сумка вдвое больше, героиня кренится. Карточка meter «проблем: 2».
- **A2:** PHONE (он отдаёт телефон) → POSE1 → LEFT/RIGHT (она шагает влево-вправо) → COUNTER PHOTO 1 → 12 → 47 (затворы) → SHAKE: телефон дрожит.
- **B1:** HOTEL (вывеска) → INSIDE (склейка в холл, сумки на тележке) → KEYS (связка ключей) → LEAVE → CLOCK 12:00 → 12:45 на стене.
- **B2:** GUEST (`BASE.reggie` с пустой вешалкой для полотенец) → LOOKAROUND → RING (телефон на стойке) → PICKUP → QUEUE: очередь появляется за её спиной.
- **C1:** RETURN: он в солнечных очках с чемоданом → POINT на очередь → BADGE1 ASSISTANT MANAGER на шею → «Wait, what?!».
- **C2:** EXIT → STOP → RELIEF → UNBADGE/BADGE2 GENERAL MANAGER → FREEZE → DOLLAR ($1 крупно, вставка) → LOOK1/2/3: доллар → очередь → дверь, тиканье → «No.» → «I SAID NO!» → RESPECT → CEO на бейдже → «NOOOOO!» → BLACK.

Концовка у всех: `K.outro` как в teacher, 4 фразы (A2, B1, C1, C2 из подписей в `releases/*_tiktok.md`), кнопка подписки с курсором.

## 5. Как продолжить, когда будут символы (из `speak_in_english/engine`)

```bash
curl -sS https://api.elevenlabs.io/v1/user/subscription   # нужно ≥ 2 400 свободных символов на одну серию
python3 eleven_nar.py pretend && python3 split_nar.py pretend   # Sarah, один дубль
python3 eleven_tts.py pretend                                    # her/stranger/tip, по одной реплике с паузой 3 с
python3 asr_v2.py pretend en,ru
python3 timeline_v2.py pretend && bash build_audio.sh pretend
cp teacher.js pretend.js   # переделать по разделу 4, превью prev_v2.py, затем render.sh и final_enc.sh
```
Затем то же для `password` и `cantsayno`. Эпизоды делаются по очереди: озвучка следующего только после проверки предыдущего.
