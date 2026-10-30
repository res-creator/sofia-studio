# English TikTok channel — rules & production guide (read this first in a new session)

Owner speaks Russian: answer her in Russian, simply. On-screen text, voice and captions are American English.
Concept: real, verifiable stories about money, business, famous companies and how familiar everyday things are actually run.
"You use this every day, but you have no idea what's happening behind the scenes." Not finance advice, not news, no crypto/politics.
Mix the topics: not only hidden fees and corporate scandals, but also unusual, curious true stories about how ordinary things work
(logistics, design decisions, odd rules, clever systems). The episode should teach something and be fun to watch, not just make people angry.

## Episodes made (don't repeat these topics)
| Folder | Topic | Final file |
|---|---|---|
| `mcd_ep1/` | McDonald's makes money on real estate | `how_mcdonalds_really_makes_money_final.mp4` |
| `air_ep2/` | Airlines oversell seats | `why_airlines_oversell_seats_final.mp4` |
| `car_ep3/v2/` | Car (GM/OnStar) shared driving data | `your_car_was_reporting_on_you_v2.mp4` |
| `rent_ep4/` | RealPage shared pricing software | `your_landlords_secret_algorithm_v2.mp4` |
| `med_ep5/` | Medical bill $3,000 → $6,000 after the move to a surgery center | `medical_bill_doubled_v3.mp4` |
| `amazon_ep6/` | Amazon returnless refunds ($5 item, $8–$12 shipping) | `amazon_keep_it_v2.mp4` |
| `doordash_ep8/` | DoorDash old pay model 2017–2019: the tip replaced DoorDash's part of a $10 guarantee | `doordash_tip_v2.mp4` |
| `scratch_ep11/` | Hertz/Thrifty AI damage scanner, Atlanta 2025: 1-inch scuff → $440, 7-day discount vs up-to-10-day reply (on hirkit) | `the_440_scratch.mp4` |
| `tp_ep12/` | Toilet Paper Panic of 1973: congressman's "may face" warning → Carson's joke without the "may" → empty shelves; twist: everyone's smart move WAS the shortage (on hirkit, `tpkit.js`) | `toilet_paper_panic_1973.mp4` |
Also: `covers_extra/` (credit card trap, gym no-shows — uploaded videos). Ideas backlog: `IDEAS.md`. Captions: `CAPTIONS.md`.

## Format
1080x1920, 30 fps. Length follows the story at the natural voice pace (never speed up the voice or pad scenes); episodes 10–11 ran 67–70 s. Style: Bold Editorial Collage, 2D + 2.5D parallax, selective pseudo-3D,
paper cutouts (white rim, soft shadow, ink outline), paper texture. Palette: cream #F7F5F0, black #171717, red #E63946, yellow #FFC857, blue #4D8DFF.
Story over effects: one visual journey, objects transform into the next scene, something new to see every few seconds, readable without sound.

## Story & animation (what worked in episodes 10–11, on hirkit)
Guidelines, not quotas: pick what the story needs, and keep each episode different.
- An animated mini-story, not an infographic: a real person (or a clearly labelled example) we follow through events. Facts arrive as things that happen to them,
  not as static cards or long document shots. Numbers still appear big and readable, as objects in the scene (a receipt printing, a tag dropping, a coupon flipping).
- Actions follow each other: one beat leads into the next (drive in → scan → phone buzzes → the bill prints → the offer → the dispute). The viewer always knows where we are.
- Close-ups and emotion: front busts with expressions (`R.EXPR`: shocked, skeptical, squint, tired…), reactions on the key numbers, a deadpan look at the camera.
  Mix the angles: extreme close-ups of objects, medium shots, wide establishing shots, POV of a phone in hand, side tracking shots, low angles.
- Light and sets carry the mood: `hirkit/light.js` presets per scene (day, golden, evening, office, dark), rim light on characters, detailed sets
  (airport outside and inside, garage, office) with blurred backgrounds behind close-ups.
- Edit on meaning and on the voice: cut on the stressed word (`at(id, word)`), transitions through objects (dive into the phone screen, torn paper), hold a beat on the payoff.
- Visual humor and a real twist: physical gags that don't bend facts (the help bot's cord too short for the HUMAN AGENT socket, the discount balloon popping on day 7),
  and an ending that turns the story (Hertz's own definition of the fee). Objects can have personality, but don't paint a real company's equipment as a villain
  unless the facts say so; show the company's position when it exists.
- Keep it honest on screen: historical label (place · year) visible but small; possible deadlines shown as deadlines, not as events that happened.
- Series identity: the How It's Run look (paper collage, palette, Chris's voice, frame-0 headline with a stamp, subtitle style). Characters and settings change with the story.

## Voice (ElevenLabs) — see `VOICE.md`
Chris `iP95p4xoKVk53GoZ742B`, model `eleven_multilingual_v2`, settings for new episodes: stability 0.35, similarity 0.8, style 0.55, speaker boost, speed 0.95.
Keys only via env `ELEVEN_API_KEYS` (in this cloud env the proxy injects auth: run with `ELEVEN_API_KEYS=proxy`). Max 2 requests at once, ~3 s apart.
One request per line (short lines = control over pauses), with previous/next text for continuity. Emphasis by CAPS, short sentences, "...".
Approve the script BEFORE generating; generate each line once. Verify with speech-to-text (scribe_v1) — the full video must match the script.

## Code layout (copy the latest episode, never edit old episodes)
- New episodes are built on **hirkit** (`hirkit/`: `rig.js` characters, expressions, front busts; `light.js`; `collage.js`; `edit.js` shot list, cuts on words, tear transition).
  Use it as is; extend it only in small, backwards-compatible steps. Latest reference episode: `scratch_ep11/` (`scankit.js` sets/props, `episode.js` shots,
  `mix.py`, `speech.py` real speech start/end, `stt_check.py`, `cover.js`, `build.sh`). Put new sets and props in the episode's own kit file.
- Engine: `mcd_ep1/engine.js` (read-only: new episodes use only its voice timings and subtitles) (camera keys, parallax fg, motion blur on fast moves, world blur, subtitles, CLI `video | still t1,t2 out.png | cues`).
- Primitives: `tests/mcd_collage/kit.js` (cut, rr, tag, coin, bill, sprite, paper texture, palette, fonts).
- Prop kits: `air_ep2/airkit.js`, `car_ep3/carkit.js`, `car_ep3/v2/car3d.js`, `rent_ep4/rentkit.js` (2.5D buildings, `text()` with max-width auto-fit),
  `med_ep5/medkit.js` (heroine with brows, doctor, signs, bills, phone, giant hand), `amazon_ep6/amazonkit.js` (box, buyer, phone, conveyor, truck, warehouse, workers, coins, house),
  `doordash_ep8/ddkit.js` ($1 bricks yellow/red, pay column, TIP phone, pointing hand, safe, cards, driver/courier).
- Episode folder: `script.json`, `vo.py` → `vo/`, `episode.js`, `mix.py` (synth SFX + music, SFX kept quiet: fx×0.3, ducked under the voice), `build.sh`, `cover.js`.
- Versions: `episode_v2.js`, `vo_v2/`, `mix_v2.py`, `build_v2.sh` → `*_v2.mp4`. Keep v1 files.
- Build: `sh <folder>/build.sh` (cues → mix → render → mux, loudnorm -14). Render ≈ 1–2 min. Run it in the background.

## Subtitles
Existing style (engine `drawSubtitles`), y ≈ 1565, size 62, max 2 lines, hand-made phrase groups (`SPLIT`), numbers as digits ($5, $8–$12),
a few highlighted words in yellow. Never over faces or key numbers. Keep key numbers in the upper/middle part of the frame.

## TikTok safe zones (video + cover)
Profile grid shows a centred ~3:4 crop (y ≈ 240–1680). Bottom caption area y > ~1500, right-hand buttons x > ~940 (y 800–1500).
Title and hero inside the crop, nothing important under the buttons. Cover: 1080x1920 PNG, 3–5 word headline, one key word on a red strip,
one hero object, same look as the video, no logos (brand names as text only). See `COVERS.md`.

## Facts
Primary sources only (court filings, regulators, company filings, solid journalism). Allegations stay allegations; settlements ≠ admissions.
Illustrative numbers are labelled (EXAMPLE / "Say,"). Historical practices are said to be historical. No invented numbers.

## Retention (use sensibly)
Hook in the first 1–2 s where picture + voice + on-screen text say the same thing; open loop (question answered at the end); keep something new happening;
works with sound off; ironic, idea-changing last line; last frame echoes the first so a re-watch loops. No "follow/like/comment", no forced questions.

## US TikTok playbook (from the ep 8 review; apply to every new episode)
Algorithm (not official, but every source agrees): watch time, completion and rewatches first, then shares and saves; likes count least.
1. Frame 0 = the conflict in big words + numbers (e.g. "$9 TIP → DRIVER +$0") in the top area, plus a small date/"EXAMPLE" stamp so nobody calls it misleading. Most people watch muted.
2. No smear in the first 2 s: slow, clean camera moves; the key card fully in frame.
3. "You" + an everyday action (tipping, returns, subscriptions, rent). Self-relevance stops the thumb.
4. Never reset to an empty/zero scene after the hook: transform the hook objects straight into the explanation. Explain the colour code once (legend).
5. Repeated examples: one big readable line each (e.g. "$3 TIP → DOORDASH PAYS $7"), no small extra cards.
6. Proof on screen: a regulator/court figure as a big stamp with a hit sound, on clean art, ~1.5 s. US viewers trust receipts.
7. A little character humor that doesn't bend facts: the hero's deadpan look at the camera, a recurring object with personality (the DoorDash safe winks, the help bot in ep 11).
8. Strong twist + last frame echoes the first (loop). Hold the final number a beat before the hard cut.
9. Series identity for follows: same opener style and visual language every episode (the cast and settings can change).
10. Comments: hot-topic angle (tipping culture, hidden fees). The caption may end with a natural question; the video itself has no "comment/follow" asks.
11. Saves: when the facts allow, one "what you can do" line (in the caption or pinned comment if not in the approved script).
12. Before delivery: an independent review pass (a fresh reviewer scores hook / middle retention / sound-off clarity / twist / comments / shares / saves / follow / humor / cover).

## Quality checklist before reporting "done"
1. Stills sheet at key moments + a dense sheet (every 0.5 s) of the final video — look for objects passing under/through each other (draw order!),
   cut text, empty frames, faces covered, subtitles over numbers. 2. ffprobe format/length, blackdetect = 0, loudness (ebur128).
3. STT of the final video = script. 4. Voice gaps > 0.2 s (measure real speech end with silencedetect, not alignment). 5. One final render.
Lessons: draw buildings that stand behind the road BEFORE vehicles; give every framed text a max width; keep the box below the face in hands.

## How the owner briefs (short is fine)
"New episode: <topic>. Script: <text or 'write one'>. Rules as usual (CHANNEL.md). Make video + cover + caption."
Feedback: one message with all notes and timestamps / screenshots.
