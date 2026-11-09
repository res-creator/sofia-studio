# English TikTok channel — rules & production guide (read this first in a new session)

Step-by-step working order + lessons learned: the project skill `.claude/skills/how-its-run/SKILL.md` (loads automatically in new sessions).
Owner speaks Russian: answer her in Russian, simply. On-screen text, voice and captions are American English.
**Concept (since ep 18, owner, Nov 2026): incredible TRUE stories where, in the end, MONEY decided everything.**
A real hero, a real problem, a failure or a surprise, and a final twist about money ("Not soldiers. Money." — the emu episode).
Best examples: `emu_ep12/` (Army vs. 20,000 emus) and `lawnchair_ep17/` (Larry Walters' lawn-chair flight).
**No more hero-less explainers** (like `icecream_ep13/`, "why the McDonald's machine is always broken"). Not finance advice, not news, no crypto/politics.

## Уже сделано — не повторять (all How It's Run episodes in all branches, checked Nov 2026)
Before every new topic: check this table AND `git fetch origin && git branch -r` for newer episode folders (the skill does this).
If the topic (or the same story with another angle) is here, say so and take the next topic.
| Folder | Branch | Topic | Final file | Length |
|---|---|---|---|---|
| `mcd_ep1/` | main | McDonald's makes money on real estate | `how_mcdonalds_really_makes_money_final.mp4` | 39.6 s |
| `air_ep2/` | main | Airlines oversell seats | `why_airlines_oversell_seats_final.mp4` | 37.8 s |
| `car_ep3/v2/` | main | GM/OnStar shared drivers' data | `your_car_was_reporting_on_you_v2.mp4` | 45.6 s |
| `rent_ep4/` | main | RealPage rent-pricing algorithm | `your_landlords_secret_algorithm_v2.mp4` | 46.8 s |
| `med_ep5/` | main | Medical bill $3,000 → $6,000 after the move to a surgery center | `medical_bill_doubled_v3.mp4` | 35.0 s |
| `amazon_ep6/` | main | Amazon returnless refunds | `amazon_keep_it_v2.mp4` | 35.0 s |
| `doordash_ep8/` | main | DoorDash old pay model: the tip replaced DoorDash's part | `doordash_tip_v2.mp4` | 37.4 s |
| `coke_ep9/` | `claude/sharp-newton-t9y414` | Coca-Cola's 5-cent price ("impossible coin") | `cokes_impossible_coin_v2.mp4` | 39.0 s |
| `wellsfargo_ep10/` | main | Wells Fargo overdraft: the $5 coffee that cost $40 | `the_5_coffee_that_cost_40_v2.mp4` | 67.6 s |
| `scratch_ep11/` | main | Hertz/Thrifty AI damage scanner: 1-inch scuff → $440 | `the_440_scratch.mp4` | 70.2 s |
| `tp_ep12/` | main | Toilet Paper Panic of 1973 (Carson's joke) | `toilet_paper_panic_1973.mp4` | 60.0 s |
| `emu_ep12/` | main (via PR #44) | The Great Emu War, Australia 1932 (**format + style reference**) | `the_great_emu_war.mp4` | 65.2 s |
| `ups_ep12/` | `claude/zen-lamport-5i4rua` | UPS avoids left turns: the shortest route isn't the cheapest | `ups_shortest_route.mp4` | 65.6 s |
| `icecream_ep13/` | main (via PR #42) | Why the McDonald's ice cream machine is "always broken" (old explainer format) | `mcflurry_machine_broken.mp4` | 34.1 s |
| `subscription_ep13/` | `claude/ep16-monopoly-script` | The Comcast cancellation call that wouldn't end (Ryan Block, 2014) | `the_comcast_call_that_wouldnt_end.mp4` | 63.1 s |
| `hotel_ep14/` | `claude/stoic-einstein-g61524` | The $1,400 hotel room (Nassau, 2026) | `the_1400_hotel_room.mp4` | 69.6 s |
| `pepsi_ep15/` | `claude/friendly-clarke-mo1xcl` | Pepsi Harrier jet, John Leonard 1996 (**published — don't remake**) | `the_pepsi_fighter_jet.mp4` | 41.7 s |
| `monopoly_ep16/` | `claude/ep16-monopoly-script` | McDonald's Monopoly game fraud ("the inside man") | `the_monopoly_inside_man.mp4` | 40.4 s |
| `lawnchair_ep17/` | main (via PR #44) | Larry Walters' lawn-chair balloon flight, 1982 (**format + style reference**) | `the_man_who_flew_in_a_lawn_chair.mp4` | 36.3 s |
| `pudding_ep18/` | main (via PR #42) | The Pudding Guy: David Phillips, 12,000+ pudding cups → 1,253,000 airline miles (1999), new format | `the_pudding_guy.mp4` | 57.3 s |
| `hoover_ep19/` | main | Hoover free flights, UK 1992: spend £100 → 2 free flights; £119 vacuum; ~200,000 claims; $60m charges; Hoover Europe sold — first episode in `howitsrun_style/` | `hoover_free_flights.mp4` | 50.5 s |
| `bulbs_ep20/` | main | The Phoebus lightbulb cartel, 1924 (1,000-hour rule, fines) | `the_lightbulb_cartel.mp4` | 49.2 s |
| `sugar_ep21/` | main | Sugar industry paid Harvard scientists (1965–67, revealed 2016), $6,500 | `sugar_paid_scientists.mp4` | 45.1 s |
| `diamond_ep22/` | main | De Beers / N.W. Ayer: the diamond ring as an ad campaign, "A Diamond Is Forever" | `your_ring_is_an_ad.mp4` | 44.0 s |
| `breakfast_ep23/` | main | "Breakfast is the most important meal": 1917 Good Health + Bernays' bacon-and-eggs survey | `who_said_breakfast_matters.mp4` | 45.2 s |
| `listerine_ep24/` | main | Listerine: floor cleaner → mouthwash, the "halitosis" ads of the 1920s | `floor_cleaner_to_mouthwash.mp4` | 42.8 s |
| `camel_ep25/` | main | "More Doctors Smoke Camels" (1946) and the rigged doctors' survey | `more_doctors_smoke.mp4` | 39.4 s |
| `rats_ep26/` | main | The Great Hanoi Rat Hunt, 1902: paid per rat tail | `paid_per_rat_tail.mp4` | 46.9 s |
| `pizza_ep27/` | claude/sweet-brahmagupta-7uiuaz | Bitcoin Pizza, 2010: Laszlo Hanyecz paid 10,000 BTC for two pizzas ($41 then, ~$1.26B at the 2025 peak) | `bitcoin_pizza.mp4` | 35.5 s |
| `longform_rewards/` | main | LONG-FORM YouTube 16:9 "When Paying People Backfired": Hanoi rats, Hoover flights, pudding guy, Wells Fargo fake accounts, Mexico City Hoy No Circula, emu bounty, Goodhart's law | `when_paying_people_backfired.mp4` | 8:13 |
| `longform/cocacola_history/` | main (after PR) | LONG-FORM YouTube 16:9 "How Coca-Cola Took Over the World in 10 Minutes": Pemberton 1886, Candler coupons, $1 bottling deal, contour bottle, Woodruff/WWII, Pepsi, New Coke, today | `how_coca_cola_took_over_the_world.mp4` | 9:21 |
| `eiffel_ep28/` | claude/sweet-brahmagupta-7uiuaz | The man who sold the Eiffel Tower (Victor Lustig, 1925; per the 1961 memoir) — ADULT DOCUMENTARY style (archive photos, stamps), noir-jazz music | `the_man_who_sold_the_eiffel_tower.mp4` | 39.5 s |
| `poyais_ep29/` | claude/sweet-brahmagupta-7uiuaz | The country that didn't exist: Gregor MacGregor's Poyais scheme, 1822 (loan, land, fake dollars, ~250 settlers, <50 came home) — ADULT DOCUMENTARY style, maritime-folk music | `the_country_that_didnt_exist_v2.mp4` (v2, review fixes; v1 `the_country_that_didnt_exist.mp4`) | 50.9 s |
Also: `covers_extra/` (covers only: credit card trap, gym no-shows — uploaded videos); `molasses_full/`, `molasses_calm/` (Boston Molasses Flood 1919,
5.7 min long-form, branch `claude/vibrant-dijkstra-gnvqpv`). Not this channel: `survival/`, `whatif/`, `speak_*`, Sofia `ep/`–`ep3/`.
Carousels made: `carousels_nov/` K1–K6 (supermarket tricks, .99 prices, free apps, casinos, free trials, flight prices). Spare topics (owner's plan): Pizza for 10,000 bitcoin (2010), McDonald's Monopoly fraud (already done as monopoly_ep16), the man who sold the Eiffel Tower (1925), Blockbuster vs Netflix (2000), Toilet Paper Panic v2.
Ideas backlog: `IDEAS.md`. Captions: `CAPTIONS.md`.

## Style reference (owner, Nov 2026) — read before drawing anything
**Эталон стиля — `lawnchair_ep17` и `emu_ep12`. Персонажей брать только из `howitsrun_style/`. Стиль `tp_ep12`, `icecream_ep13` и pudding guy (`pudding_ep18`) НЕ использовать.**
(Style reference = lawnchair_ep17 and emu_ep12. Characters only from `howitsrun_style/` — see its README: full-body profile people in real places,
one accessory each, flat paper backgrounds, stamp/headline plates. Do NOT use the look of tp_ep12, icecream_ep13 or pudding_ep18: big front busts, crowded collage.)
Before animating a new episode: show the owner a character sheet in this style and wait for approval.

## Format
1080x1920, 30 fps. Length: **35–60 s, as long as the story needs**, at the natural voice pace (never speed up the voice or pad scenes); episodes 10–11 ran 67–70 s, ep 12 ran 60 s. Style: Bold Editorial Collage, 2D + 2.5D parallax, selective pseudo-3D,
paper cutouts (white rim, soft shadow, ink outline), paper texture. Palette: cream #F7F5F0, black #171717, red #E63946, yellow #FFC857, blue #4D8DFF.
Story over effects: one visual journey, objects transform into the next scene, something new to see every few seconds, readable without sound.

## Story shape + first second & last frame (owner, Nov 2026 — stats: most viewers leave in the 1st second). These override anything below.
1. **Story spine (mandatory): a real hero → a problem → a failure / surprise → the final twist about money** ("Not soldiers. Money.").
   The money twist is the payoff: who paid, what it cost, how a price/paycheck/bounty decided the outcome — not a moral.
2. **Frame 0 (0.0 s): an ABSURD picture + the conflict in 3–5 big words** (like "ARMY vs. 20,000 EMUS", "SODA POINTS vs. FIGHTER JET").
   A face with a strong emotion is welcome, but the absurdity comes first. Not allowed in frame 0: a full-screen date, a calendar,
   a landscape/establishing shot, a slow intro, "?" in place of a number. (A small date/place stamp is fine.)
3. **The first line = the strangest fact of the story** ("In 1932, Australia's army went to war... against BIRDS."). "You" openers are no longer required.
4. **Sound from 0.0 s** (a hit, a beep, a notification). No silence at the start.
5. **Motion from the first frame**: camera push-in, text pops in, the character reacts. No static opening frame.
6. **Length 35–60 s**, whatever the story needs (see Format).
7. **Last frame: a direct question to the viewer for comments, held ≥ 2 s with no voice** (e.g. "Would YOU have mailed the check? 👇").
   Big, inside the 3:4 crop, above the caption area, over a picture that echoes frame 0 (loop). Asking for comments is allowed; follow/like asks are not.
   Colour emoji on canvas: register `/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf` (see `icecream_ep13/episode.js`).
8. **Carousel**: 6 key frames, PNG 1080x1920, no subtitles, in `<episode>/carousel/`: the absurd hook, 3–4 story beats with the key numbers,
   the money twist, the question card (`node episode.js carousel <dir>` in `icecream_ep13/episode.js` shows how).

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
  Use it as is; extend it only in small, backwards-compatible steps. Latest reference episode: `icecream_ep13/` (`mcfkit.js` sets/props, `episode.js` shots + `carousel` mode, end card; before it `scratch_ep11/`, `tp_ep12/`) (`scankit.js` sets/props, `episode.js` shots,
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
works with sound off; ironic, idea-changing last line; then the 2 s question card (no voice) over a picture that echoes the first frame, so a re-watch loops. No "follow/like" asks.

## US TikTok playbook (from the ep 8 review; apply to every new episode)
Algorithm (not official, but every source agrees): watch time, completion and rewatches first, then shares and saves; likes count least.
1. Frame 0 = an absurd picture + the conflict in 3–5 big words/numbers (e.g. "ARMY vs. 20,000 EMUS") in the top area, plus a small date/place stamp so nobody calls it misleading. Sound and motion from 0.0 s. Most people watch muted.
2. No smear in the first 2 s: slow, clean camera moves; the key card fully in frame.
3. The first line is the strangest true fact; a real hero we follow. (Older episodes opened with "you" + an everyday action — no longer required.)
4. Never reset to an empty/zero scene after the hook: transform the hook objects straight into the explanation. Explain the colour code once (legend).
5. Repeated examples: one big readable line each (e.g. "$3 TIP → DOORDASH PAYS $7"), no small extra cards.
6. Proof on screen: a regulator/court figure as a big stamp with a hit sound, on clean art, ~1.5 s. US viewers trust receipts.
7. A little character humor that doesn't bend facts: the hero's deadpan look at the camera, a recurring object with personality (the DoorDash safe winks, the help bot in ep 11).
8. Strong twist, then the 2 s question card (no voice) over a picture that echoes the first frame (loop).
9. Series identity for follows: same opener style and visual language every episode (the cast and settings can change).
10. Comments: hot-topic angle (tipping culture, hidden fees). The video ends on a direct question to the viewer (last 2 s, no voice); the caption can repeat it. Still no "follow/like" asks.
11. Saves: when the facts allow, one "what you can do" line (in the caption or pinned comment if not in the approved script).
13. **Retention rules from the channel's own YouTube data (Nov 2026).** Viewers who stay watch 72–78 % (good), but 45–56 % swipe in the first second and another 25–30 % leave at 0:04–0:08, exactly where line 3 switches to background ("In 1982, Larry Walters…", "In the U.S., airlines can legally…", "Western Australia. Wheat farmers…"). So:
   - Frame 0:00 = the strangest moment already in motion + big text + sound. No standing character, no title card, no slow zoom on an empty set.
   - Lines 1–3 all push the action forward. Dates/places go into a small on-screen tag, never into the voice right after the hook.
   - Something new (a number, a twist, a reversal) at least every 3 s through 0:15.
   - Target length 30–40 s. End on the question card that loops back to frame 0:00.
12. Before delivery: an independent review pass (a fresh reviewer scores hook / middle retention / sound-off clarity / twist / comments / shares / saves / follow / humor / cover).

## Quality checklist before reporting "done"
1. Stills sheet at key moments + a dense sheet (every 0.5 s) of the final video — look for objects passing under/through each other (draw order!),
   cut text, empty frames, faces covered, subtitles over numbers. 2. ffprobe format/length, blackdetect = 0, loudness (ebur128).
3. STT of the final video = script. 4. Voice gaps > 0.2 s (measure real speech end with silencedetect, not alignment). 5. One final render. 6. Story spine check (hero → problem → failure/surprise → money twist), frame 0 check (absurd picture + 3–5 word conflict + motion), sound at 0.0 s, length 35–60 s, the ≥ 2 s question card at the end. 7. `carousel/` has 6 PNGs 1080x1920.
Lessons: draw buildings that stand behind the road BEFORE vehicles; give every framed text a max width; keep the box below the face in hands.

## How the owner briefs (short is fine)
"New episode: <topic>. Script: <text or 'write one'>. Rules as usual (CHANNEL.md). Make video + cover + caption."
Feedback: one message with all notes and timestamps / screenshots.
