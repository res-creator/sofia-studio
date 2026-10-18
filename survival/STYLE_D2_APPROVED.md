# Approved visual style: D2 (survival YouTube project)

Status: APPROVED by the owner (2026-10-18). Use for future episodes. Do not re-tune proportions, eyes or small details.
Git tag: `style-d2-approved`.

## Where it lives (`survival/test_style/`)
- `rig.js` — shared skeleton (2-bone IK arms/legs, distance-based walk, lean/crouch/hop), drawing, faces.
  - Style: `SKINS.D2` (bold TV-cartoon ink, `soft` bodies). Characters: `CAST.hero.D2`, `CAST.gary.D2_20` (Gary: legs -20%, belly, belt).
  - `R.who(skin, 'hero'|'gary')` merges a character's own proportions into the skin.
- `props.js` — bat, mug ("SUGAR?"), chair with grip points (hands are IK-placed on them).
- `scene.js` / `render.js` — reference test scene (v2 flag): captions (1–2 lines, kept off the action), blinks, silent-readable gags.
- `views.js` — turnaround (front / 3-4 / profile) and expression sheets.

## Reference outputs (`survival/test_style/out/`)
- `final_test_D2.mp4`, `final_compare_A_vs_D2.mp4`, `final_compare_A_vs_D2_stills.png`
- `D2_turnaround.png`, `D2_expressions.png`, `proportions_before_after.png`, `subtitles_phone_preview.png`

## Rules carried forward
- Hands always on grip points; QA reach check must report 0 errors; planted feet must not slide (walk distances = whole strides).
- Captions: Anton ~100px, 1–2 lines split by meaning, move to the top when the action is low in frame.
- Bleeped swearing allowed rarely, never in the first 15 s, title or thumbnail.
- A+ style and all earlier pilots/tests stay unchanged.

## Next (not started)
Extend the D2 rig for full-length episodes (more poses, sets, front/profile in-scene) — only after the owner says so.
