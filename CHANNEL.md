# English TikTok channel — rules & production guide (read this first in a new session)

Owner speaks Russian: answer her in Russian, simply. On-screen text, voice and captions are American English.
Concept: real, verifiable stories about money, business, famous companies and the hidden mechanics of everyday US spending.
"You use this every day, but you have no idea what's happening behind the scenes." Not finance advice, not news, no crypto/politics.

## Episodes made (don't repeat these topics)
| Folder | Topic | Final file |
|---|---|---|
| `mcd_ep1/` | McDonald's makes money on real estate | `how_mcdonalds_really_makes_money_final.mp4` |
| `air_ep2/` | Airlines oversell seats | `why_airlines_oversell_seats_final.mp4` |
| `car_ep3/v2/` | Car (GM/OnStar) shared driving data | `your_car_was_reporting_on_you_v2.mp4` |
| `rent_ep4/` | RealPage shared pricing software | `your_landlords_secret_algorithm_v2.mp4` |
| `med_ep5/` | Medical bill $3,000 → $6,000 after the move to a surgery center | `medical_bill_doubled_v3.mp4` |
| `amazon_ep6/` | Amazon returnless refunds ($5 item, $8–$12 shipping) | `amazon_keep_it_v2.mp4` |
Also: `covers_extra/` (credit card trap, gym no-shows — uploaded videos). Ideas backlog: `IDEAS.md`. Captions: `CAPTIONS.md`.

## Format
1080x1920, 30 fps, 30–50 s (natural pace beats a target length). Style: Bold Editorial Collage, 2D + 2.5D parallax, selective pseudo-3D,
paper cutouts (white rim, soft shadow, ink outline), paper texture. Palette: cream #F7F5F0, black #171717, red #E63946, yellow #FFC857, blue #4D8DFF.
Story over effects: one visual journey, objects transform into the next scene, a new visual event every 2–4 s, readable without sound.

## Voice (ElevenLabs) — see `VOICE.md`
Chris `iP95p4xoKVk53GoZ742B`, model `eleven_multilingual_v2`, settings for new episodes: stability 0.35, similarity 0.8, style 0.55, speaker boost, speed 0.95.
Keys only via env `ELEVEN_API_KEYS` (in this cloud env the proxy injects auth: run with `ELEVEN_API_KEYS=proxy`). Max 2 requests at once, ~3 s apart.
One request per line (short lines = control over pauses), with previous/next text for continuity. Emphasis by CAPS, short sentences, "...".
Approve the script BEFORE generating; generate each line once. Verify with speech-to-text (scribe_v1) — the full video must match the script.

## Code layout (copy the latest episode, never edit old episodes)
- Engine: `mcd_ep1/engine.js` (camera keys, parallax fg, motion blur on fast moves, world blur, subtitles, CLI `video | still t1,t2 out.png | cues`).
- Primitives: `tests/mcd_collage/kit.js` (cut, rr, tag, coin, bill, sprite, paper texture, palette, fonts).
- Prop kits: `air_ep2/airkit.js`, `car_ep3/carkit.js`, `car_ep3/v2/car3d.js`, `rent_ep4/rentkit.js` (2.5D buildings, `text()` with max-width auto-fit),
  `med_ep5/medkit.js` (heroine with brows, doctor, signs, bills, phone, giant hand), `amazon_ep6/amazonkit.js` (box, buyer, phone, conveyor, truck, warehouse, workers, coins, house).
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
Hook in the first 1–2 s where picture + voice + on-screen text say the same thing; open loop (question answered at the end); new event every 2–4 s;
works with sound off; ironic, idea-changing last line; last frame echoes the first so a re-watch loops. No "follow/like/comment", no forced questions.

## Quality checklist before reporting "done"
1. Stills sheet at key moments + a dense sheet (every 0.5 s) of the final video — look for objects passing under/through each other (draw order!),
   cut text, empty frames, faces covered, subtitles over numbers. 2. ffprobe format/length, blackdetect = 0, loudness (ebur128).
3. STT of the final video = script. 4. Voice gaps > 0.2 s (measure real speech end with silencedetect, not alignment). 5. One final render.
Lessons: draw buildings that stand behind the road BEFORE vehicles; give every framed text a max width; keep the box below the face in hands.

## How the owner briefs (short is fine)
"New episode: <topic>. Script: <text or 'write one'>. Rules as usual (CHANNEL.md). Make video + cover + caption."
Feedback: one message with all notes and timestamps / screenshots.
