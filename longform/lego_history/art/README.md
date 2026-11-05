# LEGO film: art, batch 1 (the toy-town motif), 5 Nov 2026

Figma file: **How It's Run — LEGO long-form assets** (https://www.figma.com/design/YYRAGv2K1QdT5EVduMFfTZ), Tatiana's Team (Starter).
Model: `gpt-image-2.5-sunburst` (the same one used for the approved v6 puppet and the Coca-Cola plates). Requested 1920×1080, received 1536×864 PNG.
**Generations used: 5 of 5 allowed** (no retries). All results were downloaded right away (Figma URLs expire in 7 days).

## Files
| Folder | What |
|---|---|
| `src/` | original green-screen sheets as generated: `k1_bricks.png`, `k2_special.png`, `k6_town.png` |
| `backgrounds/` | plates as generated: `p5_tabletop.png` (P5 hero table), `p9_warehouse.png` (P9 bin warehouse) |
| `props/` | 24 keyed RGBA sprites (below) |
| `preview/` | the 3 check stills (1920×1080) + `assets_contact.jpg` |
| `key.py` | chroma key for sheets with GREEN objects (see Problems 1–2) |
| `prepare.py` | same upscale as `figmakit/tools/prepare.py`, for this folder → `cache/` (git-ignored) |
| `intro_stills.js` | the 3 check shots, built with `figmakit/lib/scene.js` from these assets only |

Rebuild:
```
python3 art/key.py art/src/k1_bricks.png art/props/k1_bricks 3000
python3 art/key.py art/src/k6_town.png art/props/k6_town 3000 --glass
python3 art/prepare.py
node art/intro_stills.js frame 3.5 a.png
```
After keying, the sprites are renamed by their grid cell (0–7, left to right, top to bottom) to the names below.

## Assets (24 sprites + 2 plates)
| Sheet | Sprites |
|---|---|
| **K1 classic bricks** | `brick_red_2x4`, `brick_blue_2x4`, `brick_yellow_2x2`, `brick_white_2x4`, `brick_green_1x4`, `brick_black_2x2`, `brick_1958_worn` (faded, scuffed: for the final shot), `brick_underside_tubes` (for the c4 X-ray) |
| **K2 one-off pieces** | `odd_wing_magenta`, `odd_dome_turquoise`, `odd_arch_lime`, `odd_claw_purple`, `odd_dish_orange`, `odd_pipe_pink`, `odd_gear_grey`, `odd_baseplate_sand` — all have studs, so they visibly still fit |
| **K6 town models** | `town_house_red`, `town_house_yellow`, `town_firestation`, `town_police`, `town_shop`, `town_lighthouse`, `town_racecar`, `town_tree` |
| **P5** | `p5_tabletop`: long oak table in a Danish workshop-playroom, golden light from the right windows, empty top, foreground chairs for depth |
| **P9** | `p9_warehouse`: one-point aisle between endless racks of bins full of odd pieces, hanging lamps, empty floor in the centre |

The style line and the prompt structure follow `../../figmakit/prompts/PROMPTS.md`: §3 for plates, §4 for prop sheets. Changes from the templates: 8 objects per sheet in a 4×2 grid instead of 6; the same ¾ view from slightly above for every object; and "plain flat stud tops" with "no writing on the studs", so no logo appears.

## How the five town states are made (code only, no extra art)
| State | How it is built |
|---|---|
| clean | 15 K6 models placed on P5 in perspective (vanishing point 722, 200), with a heap of K1 bricks in front |
| grow | more of the same models (repeats, flips, scale by depth) |
| sprawl | + up to 260 K2 pieces scattered across the table and bolted onto the buildings; cooler grade |
| crisis | the same layout + darkening, lights out, pieces sliding (planned with S.grade, S.shake, rotation) |
| rebuilt | the clean layout again, built from the K1 types |

Stills A and B are exactly the same code with a `sprawl` switch.

## Fit for animation (honest assessment)
| Asset | Score | Notes |
|---|---|---|
| Bricks K1 | **9/10** | Clean cut-outs with consistent ¾ view and light. They stack, fly, rotate and land. The worn 1958 brick and the underside are exactly what the finale and the c4 X-ray need. |
| One-off pieces K2 | **9/10** | Distinct silhouettes, studs visible, good for piles, rain and "clicks on" moments. |
| Town models K6 | **8/10** | Very readable and charming, and they work at 0.2–0.8 scale. Minus: one fixed angle (no turning), and the generator made a lighthouse instead of a plain tower. For the a2 podium the tower can be stacked in code from K1 bricks. |
| P5 table | **8/10** | Rich light and texture, deep perspective, chairs as a natural foreground layer, room for push-ins. Minus: the camera is lower than the ¾ view of the sprites; it works in the middle distance but would show up on very large foreground objects. |
| P9 warehouse | **9/10** | Strong one-point depth, ideal for pull-backs and parallax. The bins are already full: perfect for "overflow", but an "empty warehouse" would need a code overlay or another plate. |

The style matches the Coca-Cola plates and the v6 puppet: same model, same warm painted look. The sprites have slightly bolder outlines than the plates, and a code colour match (`saturate/sepia` filter) blends them in.

## Problems found
1. **`figmakit/tools/chroma.py` deletes green objects.** It keys on "green dominance", so the green brick, the lime arch and the tree disappeared. I did not change figmakit; `art/key.py` keys on the distance to the real background colour and only treats border-connected green as background. Suggestion for later (needs your OK): add this as an option to figmakit.
2. **Green screen visible through windows** of the police station and the shop. Fixed with `key.py --glass` (recoloured to dark glass).
3. **Camera angle mismatch** between P5 (low, ~15–20°) and the sprites (¾ from above, ~35°). OK in the stills. For the next batches, prompt plates and sprites with the same camera height.
4. **Stud scale differs** between loose bricks and town models. Solved by scaling bricks to ~0.3–0.4× of a model's scale when they are in the same shot.
5. **Shadows are code-drawn** (soft ellipses to the left). They work, but each shot needs a quick check.
6. Code colour matching is needed on every sprite. It is a single filter value per plate, so it's easy to keep consistent.
