# How It's Run — LONG-FORM STANDARD (YouTube 16:9, 8–12 min) · approved by the owner, Nov 2026

**Read this first in any new chat that makes a long How It's Run film.** It replaces the earlier code-drawn long-form look
(`longform/kit/`, used only in the Coca-Cola film — do not use that look for new films).
Code for this standard: `longform/figmakit/`. Reference result: `longform/cocacola_history/puppet_candler_10s_v6.mp4`
(character acting) and `longform/cocacola_history/figma_pilot_30s.mp4` (multi-shot scene with props, transitions, parallax).

Owner rules that still apply (see CLAUDE.md / CHANNEL.md): answer the owner in Russian, simply; English only on screen and in audio;
voice = Chris (VOICE.md) unless the owner says otherwise; −14 LUFS; no API keys in code/git/chat; ElevenLabs max 2 parallel requests;
brand names only as plain type (no logo copies); real people drawn after period portraits, living people generic; never hand type `thumb`;
show the script and wait for approval before voicing/animating; give GitHub links at the end; do not merge PRs yourself unless told.

---

## 1. The look (what must never get lost)
- **Rich hand-drawn 2D cartoon illustration**: bold clean ink outlines, painted cel shading, warm cinematic light with soft shadows,
  saturated harmonious colours, deep perspective, dense period detail in every set. Think premium animated YouTube history film.
- **All art comes from Figma AI** (gpt-image-2.5-sunburst) with the prompt templates in `figmakit/prompts/PROMPTS.md`.
  Never fall back to code-drawn vector characters or sets; code only adds light, particles, small FX and type.
- **Characters are puppets made from Figma part sheets** (heads + body + arms), same face/clothes/proportions in every shot.
- Text on screen: few, short, readable (dates, sums, names). No subtitle band — full subtitles go to the SRT. Never ask Figma for text.

## 2. Characters (one-time cost, reused everywhere)
A **main character** = 2 generations (prompts §1 A and B), then 30–60 min of preparation:
1. Download both sheets to `figmakit/assets/characters/<name>/src/`.
2. Key the green screen: `python3 tools/chroma.py src/<heads>.png <dir>/h 3000` and `… src/<body>.png <dir>/b 3000`
   → rename to `head_neutral|blink|smile|talk|surprised|skeptical.png`, `torso.png`, `arm_L_down.png`, `arm_R_down.png`, gesture arms.
3. Check head alignment: `python3 tools/headcheck.py assets/characters/<name>` — every head must be within ±1.5 px (else regenerate or shift).
4. Remove the hollow sleeve stubs: `python3 tools/nostub.py torso.png torso_nostub.png xo yo xa ya xh yh` (read the points on a grid sheet).
5. Measure points: `python3 tools/grid.py /tmp/g.png <parts…>` and fill `character.js` (copy `assets/characters/candler/character.js`):
   head pivot (neck base of the head PNG), body neck, shoulder pivots (just under the shoulder caps), arm tops, elbow line (`elbowY`),
   rest angles, and per gesture its forearm `bend` angle (radians; + = forearm swings to the viewer's left).
6. Test with stills only (`node examples/candler_desk.js still …` adapted to the new character) — look at the arms in close-up.

**Secondary characters** (shop assistants, crowds, lawyers…) = full-body pose sheets (prompts §2, 2 characters × 2 poses per generation),
used as whole sprites: slide in, bob, hop, flinch, swap pose. No rig.

## 3. How the puppet moves (`figmakit/lib/puppet.js`)
- **Head**: whole expression heads swapped on the words (approved: clean swaps look better than blending), auto blinks every ~3 s,
  smooth tilt between keys, small nods on stressed words, head scale/pivot from `character.js`.
- **Body**: breathing, slow sway, shoulder lift for shrugs.
- **Arms** (the part that took the most iterations — keep it exactly like this):
  - The torso has **shoulder caps only** (no sleeve stubs). Each arm is drawn **behind** the torso, its top hidden under the cap,
    so shoulder → elbow → hand is one continuous sleeve.
  - Bends are done on the **straight arm as ONE piece** ("bendy bone": strips rotated along the arm spine across `bendZone` px around the elbow).
    Never cut an arm into two pieces, never put an arm on top of the jacket.
  - When a bend reaches a drawn gesture (palm up, finger, …) the drawn arm fades in over the last ~20 % of the move; on the way back it fades out first.
- Acting is a list of beats tied to the narration words:
  `Puppet.acting({ expr: [[t,'skeptical'],…], blinks: […], tilt: [[t,-0.07],…], nods: [t], shrugs: [[t,1]], gestures: { R: [[t0,t1,'point',{wag:1}]], L: […] } })`.

## 4. Backgrounds (prompts §3)
- One plate per location **and** camera set-up; generate them **empty** (no people) with a clear action space ("desk top mostly clear").
- First shot of a new place may be a wide WITH drawn people (establishing shot) — then cut to the empty plate with puppets.
- Plates are 1536×864; `python3 tools/prepare.py` caches ×1.875 upscales in `figmakit/cache/` (git-ignored) for crisp push-ins.
- **Occluders**: redraw a polygon of the plate on top of the puppet (`S.reveal(ctx, plate, poly)`) — desk edges, armchairs, counters.
- **Parallax**: cut foreground pieces from a plate with a polygon and draw them with depth > 1 (`S.world(ctx, cam, 1.18, …)`); inpaint the
  hole in the base plate once (see `cocacola_history/figma_pilot` wide shot).

## 5. Props & objects
Prop sheets (6 per generation, prompts §4) keyed with `chroma.py` → `figmakit/assets/props/`. Animate in code: fly in, flutter, land with a
dust puff + shake, write with a quill, slide on a desk (squash with `sq` for perspective on a table), foam/particles, dust settling, spider on a thread.
Money and papers: no readable text in the art; numbers/dates are code type.

## 6. Camera, editing, humour (`figmakit/lib/scene.js`)
- Camera keys per shot (`S.camKeys`): slow push-ins, pans, pull-back reveals, quick punch-ins on punchlines; a gentle drift is always on.
- Cut on stressed words (`S.words(chapterDir, offset)` → `at(line, word)`). A new visual event every 2–4 s, shots 2–6 s.
- Transitions: `whip` (place → place), `flash` (reveal / time jump forward), `black` (years pass), hard `cut` (punchline).
- Light & atmosphere on every plate: window beams, dust, smoke from chimneys, glints/sparkles on key objects, warm grade + vignette (`S.grade`).
- Humour = visual exaggeration that is clearly a metaphor (bottle foams over a lawyer, bill gathering dust and cobwebs for years,
  a hero jumping for joy from the frame edge). Never stage invented history as fact.

## 7. Production pipeline for a new film
1. Topic check + research + script (owner approval) — as in CHANNEL.md. Script split into chapters `longform/<film>/chapters/<ch>/script.json`.
2. **Shot list** per chapter: for every line — location plate, characters + their beats, props, camera, transition.
3. **Asset plan + budget**: list what is re-used from `figmakit/assets/` and what must be generated; fill `tools/estimate.py`; tell the owner the number.
4. Generate in Figma (one file per film), download immediately, key/prepare, fill `character.js` files, `python3 tools/prepare.py`.
5. Voice (Chris, VOICE.md) → `vo/*.mp3` + `align.json`; word timings drive everything.
6. Animate each chapter as `longform/<film>/chapters/<ch>/episode.js` using `figmakit/lib/scene.js` + `puppet.js`
   (copy `figmakit/examples/candler_desk.js` for character shots and `cocacola_history/figma_pilot/pilot.js` for multi-shot sequences).
   Stills first, look at them, then render. Parallel agents per chapter are fine (brief them with this document).
7. Sound: SFX stems per chapter (`longform/kit/sfx.py` library), one continuous music bed + −14 LUFS master in an `assemble.py`
   (copy `longform/cocacola_history/assemble.py`), merged SRT, chapter timestamps.
8. QC (section 8), thumbnail (prompts §5 + code headline, see `cocacola_history/thumb_figma.js`), upload kit, PR, links to the owner.

## 8. Quality checklist (every chapter)
- Faces readable, same character model in every shot; no head jumps between expressions (`headcheck.py`).
- **Arms**: no circles/sockets at the shoulders, no hollow sleeve ends, no second sleeve, no broken elbow, hand on the outer side of the
  body for side gestures — check close-ups of every gesture start, middle and end.
- No green fringes around sprites; no unwanted text/letters the generator drew (paint out or regenerate).
- Plates are not frozen: camera drift + at least one moving element; no shot longer than ~6 s without a new event.
- Occluders correct (puppet behind desk edges, no floating bodies). Contact shadows under props.
- 1920×1080, 30 fps, no black frames (except intended 0.35 s dips), −14 LUFS, voice clear over music, SRT synced.

## 9. Typical mistakes (all happened in the tests — don't repeat)
- Putting arm pieces on top of the jacket → visible round joints. Arms go **behind**, under shoulder caps.
- Leaving the generator's sleeve stubs on the torso → "two sleeves" and a broken elbow. Run `nostub.py`.
- Cutting the arm at the elbow into two images → seam and kink. Bend the **whole** arm (`bendy`).
- Swapping the whole arm instantly to a drawn gesture → jump. Bend first, fade the drawn hand in at the end.
- A pointing hand crossing the chest → mirror/choose the gesture so the hand rises on the outer side.
- Smoke/particles drawn as hard circles → blur them (`smoke(…, blur)`), keep them soft and semi-transparent.
- Downloading Figma results later → URLs expire in 7 days; download right after generating.
- Generating people inside location plates you need to animate → generate plates empty.
- Re-generating a character for each scene → never; one character, many scenes.

## 10. Saving credits
- Re-use first: `figmakit/assets/` (characters, props, plates). Period rooms (office, shop, street, factory) can serve several films with a new camera frame / grade.
- One heads sheet + one body sheet per main character for the whole film (and later films). Expressions/gestures are code.
- Secondary characters: 2 characters × 2 poses per sheet. Props: 6 per sheet.
- One plate can give 2–3 shots (wide, push-in, crop) — plan framings before generating.
- Never retry blindly: fix the prompt; ask for "no text" and "empty" explicitly.
- Budget per 10-minute film: **≈ 30–40 Figma generations** (`python3 tools/estimate.py`), fewer when characters/plates are re-used.

## 11. Library (Nov 2026)
`figmakit/assets/` — characters: **candler** (full puppet: 6 heads, jacket, 2 straight arms, palm L/R, point R); extras (full-body poses):
Candler ×3, Benjamin Thomas ×2, Joseph Whitehead ×2. Plates: 1899 office (empty desk view, wide with people), desk drawer close-up,
bottling-plant panorama (c. 1900–1910). Props: one-dollar bill, contract with map, quill, foaming bottle, foam drop, soda glass, inkwell.
