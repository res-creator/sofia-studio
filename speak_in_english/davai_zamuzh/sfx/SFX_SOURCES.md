# Звуковые эффекты — источники

Источник выбрала владелица: myinstants.com. Звуки скачаны в sfx/myinstants/ (как недоверенные медиа, обрабатывались только ffmpeg).
Очищенные версии лежат в sfx/clean/: обрезана тишина, ограничены пики (без клиппинга), громкость выровнена до −18 LUFS.

**Важно:** звуки на myinstants загружают пользователи, права на них не гарантированы. Клипы из известных шоу, игр, песен и мемов (Seinfeld, Deltarune, FNF, BBC/CNN, iPhone и т. п.) я специально не брал, но полностью исключить Content ID нельзя.

| Звук | Файл | Название на myinstants | URL | Длина |
|---|---|---|---|---|
| аплодисменты, коротко | clean/applause_short.wav | SHORT Applause | https://www.myinstants.com/media/sounds/short-applause.mp3 | 2.2 с |
| аплодисменты, долго | clean/applause_long.wav | crowd applause long | https://www.myinstants.com/media/sounds/applause-1.mp3 | 13.0 с |
| лёгкий смех | clean/laugh_light.wav | Sitcom laughing short | https://www.myinstants.com/media/sounds/sitcom-laughing-short.mp3 | 5.0 с |
| большой смех | clean/laugh_big.wav | Audience laughing | https://www.myinstants.com/media/sounds/audience-laughing.mp3 | 4.8 с |
| сочувственное «а-ах» | clean/aww.wav | Aww | https://www.myinstants.com/media/sounds/studio-audience-awwww-sound-fx.mp3 | 1.4 с |
| удивлённое «о-о» | clean/ooh.wav | Sitcom Crowd Ooh | https://www.myinstants.com/media/sounds/sitcom-crowd-ooh_sRDaL7d.mp3 | 1.9 с |
| недовольный зал «у-у» | clean/boo.wav | Audience Boo 1 (4s) | https://www.myinstants.com/media/sounds/audience-boo-1-4s.mp3 | 4.1 с |
| крики и свист | clean/cheer_whistle.wav | 9-Applause Cheering | https://www.myinstants.com/media/sounds/9-applause-cheering.mp3 | 3.7 с |
| барабанная дробь с тарелкой | clean/drumroll.wav | Drum roll with cymbal crash | https://www.myinstants.com/media/sounds/drum-roll-with-cymbal-crash_3hrkGoY.mp3 | 7.5 с |
| тиканье часов | clean/clock.wav | Clock Tick Tock | https://www.myinstants.com/media/sounds/clock-tick-tock.mp3 | 5.0 с |
| шорох газеты | clean/newspaper.wav | Open Newspaper | https://www.myinstants.com/media/sounds/open-newspaper.mp3 | 1.9 с |
| хруст | clean/crunch.wav | Apple Crunch | https://www.myinstants.com/media/sounds/apple-crunch.mp3 | 4.3 с |
| бип цензуры | clean/beep.wav | Censor Beep 1 | https://www.myinstants.com/media/sounds/censor-beep-1.mp3 | 0.2 с |
| шлепок | clean/slap.wav | Slap Sound Effect No Copyright | https://www.myinstants.com/media/sounds/slap-sound-effect-no-copyright.mp3 | 0.5 с |
| «Срочные новости» | clean/news_sting.wav | News Intro Breaking News | https://www.myinstants.com/media/sounds/news_intro-maximilien_-1801238420_2.mp3 | 5.1 с |
| «Астропрогноз» | clean/chime.wav | Magic Chimes | https://www.myinstants.com/media/sounds/magic-chimes.mp3 | 4.3 с |
| сигнал телефона | clean/phone.wav | Message Tone | https://www.myinstants.com/media/sounds/message-tone_tezPBhx.mp3 | 5.1 с |
| мяу кота (серия v5) | clean/meow.wav | CAT MEOW!!! | https://www.myinstants.com/media/sounds/cat-meow_Li0Ycr1.mp3 | 0.8 с |

Лирическую подложку на myinstants не нашёл (там только песни, у которых есть правообладатели), поэтому остаётся наша синтезированная подложка из prep.py.

**Проверка речи.** Whisper с VAD:
- в аплодисментах, дроби, часах, газете, хрусте, бипе, шлепке, «новостях» и телефоне речи нет;
- в смехе слышно «ха-ха», в «о-о» — «No!», то есть голоса толпы;
- первый вариант «Crowd Cheer + Applause» дал фразу «Thank you very much», поэтому я заменил его на «9-Applause Cheering» (в нём есть свист).

Предпрослушивание: sfx_preview.mp3 (≈48 с), девять звуков зала. Перед каждым Эльвира называет номер и звук.

Старый шорт-лист Storyblocks не использовался: тариф аккаунта не включает скачивание аудио.
