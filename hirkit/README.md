# hirkit — How It's Run animation kit (experimental)

Built on the character rig from `tests/coffee_scene/` and the Bold Editorial Collage kit (`tests/mcd_collage/kit.js`).
Published episodes and `mcd_ep1/engine.js` are not touched; this kit is used by `tests/coffee_scene_v2/`.

| File | What it gives |
|---|---|
| `rig.js` | Full-body rig (IK arms/legs, hands, walk) + **constant on-screen outline** (`LINE.px`, `px()`), **expressions** with per-eye lids, squint, asymmetric brows (`EXPR`, `expr()`, `exprMix()`), **front head** (`headFront`) and **front bust** for close-ups (`bust`). |
| `light.js` | Light presets per story (`day`, `golden`, `evening`, `office`, `dark` — nothing is darkened by default), `lit()` (rim light, screen glow and form shade masked to one character), `castShadow()`, `glow`, `shafts`, `haze`, `dust`, `grade`. |
| `collage.js` | Paper cutouts (white edge, lifted shadow, light texture), tape, torn edges, cardboard gears, paper $ bill, coin, stamp, `tornReveal` transition. |
| `edit.js` | Shot list: hard cuts by default, `whip` and `tear` transitions (no double exposure), `at(V, line, word)` to cut on voice-over words (`V = engine.voice(...)`). |

Expressions: `neutral, smile, happy, grin, surprised, shocked, skeptical, squint, worried, tired, smug, thinking`.
QC sheet: `node tests/coffee_scene_v2/sheet.js out.png`. Test: `node tests/coffee_scene_v2/scene2.js video out.mp4 | still t1,t2 out.png`.
