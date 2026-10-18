# Cruise Ship — technical production plan

Script: `SCRIPT.md` · lines: `script.json` · rules: `../PRODUCTION_RULES.md`.
Pipeline: the proven Ep1 pipeline (`../ep1/`): `seq.js` edit list from real voice takes → scene modules (`draw`, `cues`, `music`) → `render_all.sh` (blocks, 2 in parallel, ~2 min per minute of video) → `audio.py` (speaker gains, ducking, trimmed drones) → `build.sh` → `srt.js`. The cruise project gets its own folder `survival/cruise/` with copies of these files; Ep1 is not touched.

## 1. Timing estimate
| Scene | Voice | Action / silence | Total |
|---|---|---|---|
| s01 The message | 20 s | 20 s | 0:40 |
| s02 Deck Five | 12 s | 23 s | 0:35 |
| s03 Rule #1 | 8 s | 22 s | 0:30 |
| s04 The galley | 13 s | 32 s | 0:45 |
| s05 Days 2–5 | 16 s | 24 s | 0:40 |
| s06 Night visitor | 7 s | 38 s | 0:45 |
| s07 Last bottle | 21 s | 34 s | 0:55 |
| s08 The speakers | 7 s | 13 s | 0:20 |
| s09 The light | 15 s | 20 s | 0:35 |
| s10 Tunnel | 7 s | 38 s | 0:45 |
| s11 Engine control | 32 s | 33 s | 1:05 |
| s12 Two survivors | 12 s | 23 s | 0:35 |
| s13 The bridge | 23 s | 37 s | 1:00 |
| **Total** | **3:15** | | **≈ 9:10** |
The real length is set by the voice takes; silent beats are kept only where they create tension (s04, s06, s08, s10, s13).

## 2. Characters
| Character | Source | Work |
|---|---|---|
| Hero (waiter, "you") | D2 hero rig, same proportions and face | **costume variant** (needs owner approval): hood off, white shirt collar, black bow tie, mustard waiter jacket (pilot colors). Drawn as a new cast entry + hook, rig untouched |
| Rosa Okafor, chief engineer | new D2 character (like Sarah: existing rig + hooks) | design + sheet for approval: dark skin, hair wrap, orange-grey coveralls, headlamp, tool belt, flare gun prop |
| Infected passengers/crew | `ZB` variants from Ep1 (office/jogger/big) | recolor to cruise clothes: Hawaiian shirt, bathrobe, steward uniform; restrained faces (no "teeth" grin in close-up) |
| Crawling infected (tunnel) | new pose on the rig | crawl pose: hands on floor via grips, knees down (one-off) |
| Bridge figure | silhouette only | captain's coat + cap + bandaged hand, back to camera, on a CCTV screen (no face) |
| Crowd (lifeboats, pool deck) | `crowd()` silhouettes from Ep1 | lighter palette for passengers |

## 3. Locations (new sets in `cruise/lib/sets.js`, same paint/ink helpers)
1. **Pool deck at sunset** — railing, loungers, bar, ceiling PA speaker; reuse sky/city gradients.
2. **Deck 5 cabin corridor** — side view with cabin doors and numbers, emergency strip lights; built like the Ep1 hallway.
3. **Lobby map + stairwell** — deck plan board ("YOU ARE HERE"), CREW ONLY door; stairwell reuses Ep1 `stairwell()` geometry, re-skinned.
4. **Lifeboat deck (wide from above)** — silhouettes, davits, a jammed boat; one wide composition.
5. **Galley** (main set, used in s04–s10) — steel counters, hanging ladles (swing = engine vibration), shelves, oven timer, cold room with service hatch, steel door with porthole; reuse the Ep1 fridge/shelf drawing code.
6. **Crew mess + corridor** — ice machine, tables, the radio; POV corridor drawn as a simple one-point perspective (one function, used twice: s07 corridor, s10 tunnel).
7. **Porthole view** — sea, night sky, lighthouse; rotation for the ship turning.
8. **Service tunnel** — POV only (shares the perspective function) + one side shot.
9. **Engine room / control** — big engines, pipes, red emergency light, console with "STEERING" panel, rudder indicator, fuel gauge, CCTV monitor; reuse `techRoom()` pipes and panel style.
10. **Exterior: the liner at night/dawn** — one ship drawing used for s09 and the final pull-out.

## 4. New animations / props (only what the story needs)
- Carry tray → tilt → glasses fall (s01); slide plate / flick fork (s02); finger on map, push door (s03).
- Drag cart (exists: cart pushing), smother timer with a towel, sit against cart (sitPose exists) (s04).
- Write tally marks, mark a bottle, open cold room, crouch and look (s05).
- Hide behind counter, hold breath (head tilt + expression), pick up wristband (s06).
- Quiet walk (walkPath exists), fill bottles at ice machine, run (exists), slam cart (s07).
- Reach for frying pan (grip on prop) (s08); hold flashlight, hesitate (s09).
- Pack items, open hatch, crawl, wind and slide timer (s10).
- Raise hands, offer bread (s11); cook on stove, hand a plate (s12); grip pan, look up (s13).
- Props: tray + glasses, plate, fork, cart (exists), towel, kitchen timer, marker, bottles, wristband, frying pan (bat-style prop), flashlight (cone light), radio (exists), flare gun, bread, stove, CCTV monitor.

## 5. Reuse from Ep1 / D2 (no rework)
- Rig, IK, walk without foot slide, grips (`test_style/rig.js`, `ep1/lib/cast.js` person/hooks).
- Camera: snap / move / whip / drift (`ep1/lib/core.js cam`), shake, fades, day cards (restyled: plain, serious).
- Timeline from voice takes, captions → SRT only, audio mixer with speaker gains, ducking, trimmed drones; QA reach report with times.
- Infected poses and faces (`zombiePose`, `ZFACE`), crowd silhouettes, stairwell geometry, tech-room pipes/panel, night grade, glow.
- 7 approved Brian takes from the pilot (`survival/vo/l01–l10`) reused as is.

## 6. Voice and sound budget (ElevenLabs, ~4,000 credits left)
- New narration: ~1,700 characters (Brian, `eleven_multilingual_v2`).
- Rosa: ~560 characters (new voice, pick from 2–3 samples, `eleven_v3`); captain PA, Coast Guard, bridge voice: ~350 characters total.
- Estimated cost at the measured rate (~0.22 credits/char): **≈ 600 credits** for voices, **≈ 600–900** for new sound effects (ship horn, PA chime and click, ice machine, metal tunnel, flare gun, phone swarm, engine start, lighthouse wind). Reuse Ep1/pilot SFX where they fit (waves, engine, alarm, groans, door bangs, breath, heartbeat).
- Total ≈ 1,500 credits — fits the balance.

## 7. Production order (minimum iterations)
1. **Approvals (one round):** waiter costume on the D2 hero, Rosa sheet, serious palette sample (one still per main set: galley, corridor, engine room). Stills only, no video.
2. **Voices:** 2–3 Rosa samples → owner picks → generate all new lines in one pass; check with speech-to-text that no tags are spoken.
3. **Edit list:** `seq.js` with real durations; silent beats from this plan; confirm total length.
4. **Sets + characters** in code; stills sheet; QA.
5. **Animate scenes in story order**, stills check per scene, `qa` reach pass (STEP=1 MIN=4).
6. **Sound design + mix** (`audio.py`), loudness −14 LUFS, true peak < −1 dBFS.
7. **Full render**, timeline contact sheet, A/V/SRT sync check, light phone copy, thumbnail ("DAY 1 | DAY 30"), upload kit.

## 8. Risks and simplifications
- POV corridor/tunnel: one shared perspective function, two uses only.
- Lifeboat chaos and the ship turning: single wide compositions with silhouettes and camera moves, no crowd animation.
- The bridge figure is never animated beyond a slow head turn on a CCTV screen (static + cut).
- If time runs short, s12 can be reduced to two compositions without losing story.
- The subscription ends Oct 21: realistic scope before then is approvals + voices + the first scenes; the full render may continue in a new session from these files.
