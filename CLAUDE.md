# Sofia Studio — notes for the next session

Read `HANDOFF.md` first (channel rules, characters, pipeline, QA checklist). This file adds what happened after Episode 1.

## Hard rules (from the channel owner)
- Never write API keys into code, git, chat logs or memory. ElevenLabs keys only via env var `ELEVEN_API_KEYS`. Max 2 ElevenLabs requests at once (space calls ~3 s apart).
- Don't change the approved designs/rigs of Sofia (`lib/sofia.js`), Gus (`lib/gus.js`), Dr. Max (`lib/drmax.js`). New characters go in new files.
- Don't modify published Episode 1 (`ep/`) or Episode 2 (`ep2/`) outputs.
- Never use hand type `thumb`.
- English only on screen and in audio. Hashtags in all lowercase.
- Owner talks Russian; answer her in Russian, simply.

## Episode 2 "Gus at the Doctor" — DONE (published material)
- Pipeline: `sh ep2/build.sh out.mp4` (script.js → timeline.py → make_sfx.js → audio.py → render.js → mux).
- Voices in `ep2/vo/*.mp3`. Dr. Max voice = Chris (premade). Output `ep2/sofia_ep2_gus_at_the_doctor.mp4`, thumbnail, SRT, `ep2/upload_kit.txt`.
- Known rig bug: `drmax` `legs:'walk'` splays legs — use a step bounce instead.

## Episode 3 "Gus at the Airport" — BUILT (needs owner review before publishing)
- Script doc: https://claude.ai/code/artifact/537b0a61-9c6d-4773-8ff6-9cd7617b7b62 . Output: `ep3/sofia_ep3_gus_at_the_airport.mp4` (5:19 incl. 20 s end screen), `ep3/thumbnail.png`, `ep3/sofia_ep3_en.srt`, `ep3/upload_kit.txt`.
- Voices: `python3 ep3/gen_vo.py` (ElevenLabs via proxy-injected key, no env key needed; skips existing mp3; saves `.align.json` used for exact word timing). Sofia Jessica, Gus George, Max Chris (all eleven_v3), Anna/announcer Matilda, Bob Adam, Gary Roger (my picks, owner has not heard samples yet — swap in `VOICES` and delete the mp3s to regenerate). Free tier: ~6200 chars left of 10000.
- Build: `npm ci && pip install scipy`, then `sh ep3/build.sh out.mp4` (script.js → timeline.py → make_sfx.js → audio.py → render.js → mux, ~7 min). Stills: `node ep3/render.js still t1,t2 out.png`.
- Files: scenes.js (all scenes), bg3.js (backgrounds), props3.js, ui3.js (6-phrase tracker/icons), trans.js, srt.py, thumb.js.
- Possible polish: episode is ~5 min (owner target 6–7): add pauses/gags; sofia/crew "walk" legs; Anna looks smiling in the thumbnail.


## Publishing (Ep3) — done via Metricool
- YouTube channel `UCyaA-eJ_Ixi8_HOrHA_P0GA` is connected to Metricool brand 7375148 (timezone Europe/Chisinau). Metricool connector must be enabled in the chat.
- Metricool needs a public HTTPS media URL. Public media repo: `res-creator/sofia-easy-english-media` (raw URLs `https://raw.githubusercontent.com/res-creator/sofia-easy-english-media/main/ep3/<file>`). New repos cannot be created by the integration (403) — the owner creates them, then `add_repo` with push access.
- Scheduled: full Ep3 Tue 2026-10-20 16:00; Shorts 10-21, 10-22, 10-23, 10-26 at 16:00 (Chisinau). Best slots per Metricool benchmark: Tue–Thu ~16:00.
- Subtitles (`sofia_ep3_en.srt`) are not uploaded by Metricool — add in YouTube Studio if wanted.
- Drive connector cannot upload video (bytes must be pasted as base64 text).
