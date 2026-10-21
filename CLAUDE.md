# Sofia Studio — notes for the next session

> **English TikTok channel (money/business stories):** read `CHANNEL.md` first — it has the rules, pipeline, voice and checklist for those episodes. The notes below are for the Sofia kids' channel.

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

## Episode 3 "Gus at the Airport" — IN PROGRESS
- Approved script (84 lines: l01–l75, r1–r6, q01–q03), target 6–7 min: Claude Doc https://claude.ai/code/artifact/537b0a61-9c6d-4773-8ff6-9cd7617b7b62
- New cast approved by owner: `lib/crew.js` → `drawCrew(ctx, x, hipY, s, pose, who)`, who = `anna` (check-in), `annaFA` (flight attendant, hat), `bob` (security officer), `maxVac` (Dr. Max in Hawaiian shirt). Same pose API as Dr. Max (hip = floor − 280·s). Uncle Gary = `drawGus({tie:false, hold: gary})` (see `gary()` in `ep3/preview.js`).
- Preview: `node ep3/preview.js video out.mp4 | still t1,t2 out.png | lineup out.png`; background `ep3/bg3.js` (check-in hall + `desk(ctx, kg)` foreground with scale display).
- NEXT: 1) check network: `curl -sS -o /dev/null -w "%{http_code}" https://api.elevenlabs.io/v1/models` (must not be 000/403);
  2) pick voices for Anna, Bob, Gary (send samples to owner); 3) generate all 84 lines (Sofia Jessica eleven_v3, Gus George, Max Chris), save as `ep3/vo/<id>.mp3`;
  4) build ep3 pipeline by copying ep2 (script.js, timeline.py, scenes, render, audio) + remaining backgrounds: security gate, corridor+WC, gate lounge (window, GATE 12 DELAYED), plane cabin, Madrid baggage claim; 5) thumbnail + upload kit.
- Why a new session: the previous session's network blocked api.elevenlabs.io and storage.googleapis.com, so generated audio could not be downloaded. The owner does NOT want to download/upload audio by hand.
