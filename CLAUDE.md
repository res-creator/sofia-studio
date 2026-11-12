# Studio — notes for the next session

> **English TikTok channel (money/business stories):** read `CHANNEL.md` first — it has the rules, pipeline, voice and checklist for those episodes.

> **English dubs of travel documentaries (India, Norway, Vietnam):** read `ENGLISH_DUB.md` first.

> **Long-form How It's Run films (YouTube, animated):** Для создания длинных анимационных YouTube-фильмов How It’s Run обязательно сначала прочитай `longform/LONGFORM_STYLE.md` и используй утверждённую систему `longform/figmakit/`. Не разрабатывай новый стиль и анимационный движок с нуля без отдельного задания.

## Hard rules (from the owner)
- Never write API keys into code, git, chat logs or memory. ElevenLabs keys only via env var `ELEVEN_API_KEYS`. Max 2 ElevenLabs requests at once (space calls ~3 s apart).
- English only on screen and in audio. Hashtags in all lowercase.
- Owner talks Russian; answer her in Russian, simply.
- At the end of every task, always give the owner direct GitHub links: the Pull Request, the branch folder, and the final files (MP4, cover, SRT, upload kit).
- The owner closed the Sofia & Gus kids' channel and the disaster-documentary channel (Nov 11, 2026); their files were removed. `lib/fonts.js` stays (used by `tests/mcd_collage`).
