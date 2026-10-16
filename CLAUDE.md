# Sofia Studio — notes for the next session

Read `HANDOFF.md` first (channel rules, characters, pipeline, QA checklist). This file adds what happened after Episode 1.

**Owner's production standards — follow them for every scene and episode:** `docs/SOP_animation_quality.md` (acting, shots, face, lip-sync, anatomy, listener reactions, QA before export), `docs/SOP_episode_rules.md` (scene plan first, format-specific staging, full-video review), `docs/CLOSEUP_RULE.md` (close-up = same scene, closer camera).

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

## Close-ups (owner's rule, see `docs/CLOSEUP_RULE.md`)
- A close-up is the SAME scene seen through a closer camera. Never draw a separate/enlarged background per shot.
- Ep4 does it in `ep4/scene3.js`: one world (`ep4/bg4.js` drawWide), characters at fixed world positions, `CAM` = [cx, cy, zoom]; `bgFor(cam)` pre-renders the same street through each camera.

## Episode 4 "Gus Gets Lost in the City" — style test DONE (branch `ep4-style-test`)
- Script (Claude Doc): https://claude.ai/code/artifact/14c7b283-0d4a-4a44-963d-081897de9117
- Scene 3 test approved style: static bg, one speaker per shot, held poses switched on words, mouth from voice envelope. `node ep4/scene3.js plan && python3 ep4/audio.py && node ep4/scene3.js video out.mp4` (run render with nohup).
- New cast: `lib/rose.js` (Mrs. Rose on crew rig, Biscuit the dog). Voices are TEMPORARY Kokoro (`ep4/tts_kokoro.py`); network now allows api.elevenlabs.io, but `ELEVEN_API_KEYS` was not set in that session.

## Episode 4 FULL EPISODE — DONE v2, scheduled in Metricool for Thu 22 Oct 2026 16:00 (Chisinau), file ep4/sofia_ep4_youtube.mp4 (80 MB)
- Voices: REAL ElevenLabs for all 109 lines (`python3 ep4/voice_el.py` → `ep4/vo/<id>.mp3` + `.align.json` + trimmed `.wav`, `vo.json` with real word timings).
  Sofia = Jessica eleven_v3 (+ a few emotion tags, see TAGS), Gus = George multilingual_v2, Mrs. Rose = Lily, Tom = Will, Officer Dan = Brian, phone = Sarah (all eleven_v4_turbo).
  The script skips lines whose mp3 exists — delete an mp3 to regenerate only that line.
- CREDITS: the account is on the FREE tier (10 000 chars/month, resets ~12 Nov 2026). After this episode ~330 chars are left — no retakes possible until reset or a paid plan.
  Free tier can only use premade voices via API (library voices → paid_plan_required).
- Build: `node ep4/episode.js plan && python3 ep4/audio_ep.py` then render 4 chunks in parallel with nohup
  (`node ep4/episode.js video part.mp4 FROM TO`, ~11 min total on 4 CPUs), concat + mux `ep4/mix_ep.wav`, then +2.2 dB / alimiter (−13…−14 LUFS).
  `node ep4/episode.js still t1,t2 out.png` for checks. Worlds: `ep4/bg_green.js` (Green Street 2880 wide), `ep4/bg4.js` (Oak St), `ep4/bg_shop.js` (corner shop + counter foreground).
- Output: `ep4/sofia_ep4_gus_gets_lost.mp4` (7:55, 120 MB, NOT in git — over GitHub's 100 MB), `ep4/sofia_ep4_share.mp4` (31 MB), `ep4/thumbnail.png` (`node ep4/thumb.js`), `ep4/sofia_ep4_en.srt`, `ep4/chapters.txt`, `ep4/upload_kit.txt`.
- Length is 7:55 (script is fixed by real voice durations); the plan said ~10–11 min. To go past 8 min (mid-roll ads) the cheapest option is a longer practice block (re-uses existing audio, no credits).
