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

## Episode 4 FULL EPISODE — IN PROGRESS (continue here)
Owner approved scene-3 style (v2) and asked for the full episode (~10–11 min) with REAL ElevenLabs voices.
- ElevenLabs key is a **network secret** on the owner's **Default** cloud environment (host api.elevenlabs.io): the proxy adds the key, so
  `el.py` works with NO env var. First check: `curl -sS https://api.elevenlabs.io/v1/user/subscription` must not say "unauthorized".
- All 109 lines: `ep4/lines_all.json` (episode lines in `ep4/ep_lines.json` + scene-3 lines g01–g09, r01–r08). Who: sofia, gus, rose, tom, dan, phone.
  Current `ep4/vo/*.wav` are TEMPORARY Kokoro voices (`ep4/tts_kokoro.py`). Next: generate real voices with el.py
  (Sofia Jessica eleven_v3, Gus George, others: pick premade voices, send samples to owner first), write `ep4/vo/<id>.mp3` and rebuild `ep4/vo/vo.json`
  (fields: who, text, dur, env = per-frame RMS at 30 fps normalised 0..1) — scene3.js reads vo.json; audio.py reads `vo/<id>.wav` (change to mp3 if needed).
- Cast ready: Sofia, Gus, Mrs. Rose + Biscuit (`lib/rose.js`), Tom + Officer Dan + props map/phone/burger (`lib/town.js`). Sheet: `ep4/ep4_cast.png` (sent to owner).
- Plan (one world per location; close-ups = cameras, see docs/):
  1. intro i01–i06 + scene 1 a01–a12 — GREEN STREET world (to build, ~2880 wide): bus stop, FLOWERS shop (door ~820), tall pole sign "BIG BURGER 2 FOR 1 →" near x 1850,
     Big Burger restaurant at x 2300–2850. Sofia enters flower shop, Gus smells burgers and walks off right.
  2. scene 2 b01–b08 — OAK ST world (`ep4/bg4.js`, left part): Gus alone, lost; phone insert (battery empty). Then walks to Mrs. Rose →
  3. scene 3 (DONE in `ep4/scene3.js`): drop its end card; keep Gus turning right + dog bark + Rose sigh.
  4. scene 4 d01–d22 — CORNER SHOP interior (to build): Tom behind counter, map rack, Tom gives free map, phone gag.
  5. scene 5 e01–e17 — GREEN STREET at flower shop: Sofia + Officer Dan (Dan points right to the Big Burger sign).
  6. scene 6 f01–f11 — GREEN STREET at Big Burger (camera ~[1920,540,1]): Gus arrives with the map, reunion.
  7. practice p00–p11 (say phrase, 3 s YOUR TURN, say again) + outro o01–o04 at Big Burger.
- Engine: generalise `ep4/scene3.js` (poses, keysFor/REACT listener reactions, cuts, CAM per world, bgFor) into `ep4/episode.js`.
  Only 2 CPUs: render in 2 parallel halves with nohup (~45–60 min for 11 min).
