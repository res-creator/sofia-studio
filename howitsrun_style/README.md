# howitsrun_style — the channel's look (the ONLY source for characters)

**Style reference: `lawnchair_ep17/` (Larry Walters' lawn chair) and `emu_ep12/` (The Great Emu War).**
Characters come only from this folder. Do NOT copy the look of `tp_ep12/`, `icecream_ep13/` or `pudding_ep18/` (big front busts, crowded collage).

| File | What |
|---|---|
| `style.js` | 1080x1920, palette `PAL`, fonts `FONT` (black / xb / typewriter / emoji), `txt`/`fitTxt`, `layer`/`cam`/`shake`/`pop`/`blink`, plates: `label`, `stampLabel` (REAL STORY · RE-ENACTMENT / place · year), frame-0 `headlineVs` (ARMY vs. 20,000 EMUS) and `headline2` (THE MAN WHO FLEW / IN A LAWN CHAIR), `stampWord`, `bigX`, `calCard`, `report`, the end `questionCard`, `paper` texture, subtitle options `SUBS`, `grade` |
| `people.js` | `person()` full body in profile (+ hat, cap, moustache, tie, badge), `seated()`, `personBust()` (rare close-up), `POSE` presets, `LOOKS` clothes palettes, `SKIN` tones |
| `sets.js` | `sky` (blue day or warm outback), `cloud`, `ground` (lawn / dirt / road), `houses`, `shopFront`, `room` (wall, floor, window, door, frame), `desk` |

## How people look
- Full body, **in profile**, standing in a real place; this is the default shot. Figure height ≈ 600·s px; use s 0.9–1.5 (30–55 % of the frame height).
- Rig outline (~5 px ink), flat fills + one darker side, warm rim light from the left (`RIM.day`); round head, small dot features, `R.expr` faces.
- Identity from clothes + ONE accessory (hat, cap, moustache, tie, glasses, badge). Brand names only as plain text, no logos, no portraits of real people.
- Reactions: expression + a little head tilt / lean. A chest-up `personBust` only for a short punch-line, face above y ≈ 1450.
- Several people in a shot: different facing, spacing ≥ 250 px, nobody's arm or prop over another face; items held in front of the chest, not over the head.

## How the frame looks
- Flat paper-colour backgrounds with one gradient (sky or wall), a sun glow, 2–3 clouds, simple ink-outlined houses or rooms; parallax via `layer`.
- Top of the 3:4 crop: `stampLabel` always on. Frame 0: `headlineVs` / `headline2`. Numbers as paper plates (`label`, `calCard`, `report`, `stampWord`).
- Subtitles with `SUBS` (y 1565, 62 px), a few yellow highlight words. `paper()` texture on top, `grade('day' | 'golden' | 'office')`.
- Example: `hoover_ep19/charsheet.js` (cast sheet). Code to study: `lawnchair_ep17/lawnkit.js`, `emu_ep12/emukit.js`.
