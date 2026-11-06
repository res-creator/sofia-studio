# LEGO v3 — new visual direction (code-drawn 2.5D/3D), first 68 s for review

The owner rejected the Figma-puppet version (archived: `../art`, `../film`, `../chapters/*/episode.js`, `../how_lego_almost_destroyed_itself.mp4`).
v3 is drawn entirely in code. There is no AI art and no Figma: it costs no Figma credits.

| File | What |
|---|---|
| `eng.js` | small software 3D renderer on canvas: camera, LEGO-style bricks with studs, one-off pieces, boxes, cylinders, prisms; key/fill light, gloss, inked edges, depth fog, contact shadows; kinetic type, captions, bokeh, grain, vignette |
| `opening.js` | the opening (cold open h1–h4, chapter 1 card, c1–c2): 12 shots, each with its own visual idea, timed to the words of the voice |
| `audio.py` | temp voice (Fish Audio, same files as before) + synthesized SFX (`longform/kit/sfx.py`) + an original synthesized score → `opening_mix.wav` |
| `archive/` | archival material with sources/licences (`SOURCES.md`) |
| `lego_v3_opening.mp4` | the result: 1920×1080, 30 fps, 1:08.6, −14 LUFS |

## Rebuild
```
cd v3
npm i
python3 audio.py
node opening.js video /tmp/v.mp4
sh ../../../howitsrun_style/master.sh opening_mix.wav /tmp/v.mp4 lego_v3_opening.mp4 68.6
```
