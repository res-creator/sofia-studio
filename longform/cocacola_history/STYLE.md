# How It's Run — LONG-FORM visual system (16:9) · first used in "How Coca-Cola Took Over the World"

Our own look for the horizontal long-form line. Inspired by the *principle* of rich illustrated YouTube history films
(simple expressive characters inside detailed worlds, constant visual events, visual comedy) — **not** by any one channel's drawings.
Code: `longform/kit/` (look.js, toon.js, props.js, engine.js, sfx.py). Shorts keep `howitsrun_style/` — do not mix the two.

## 1. Characters — "chunky puppets"
- **Proportions:** about 3 heads tall. Big rounded head (wider than tall at the cheeks), a short trapezoid body, thick "noodle" limbs, mitten hands, oval shoes.
  This makes them clearly different from stick-figure channels (no white circle heads, no stick limbs).
- **Faces carry the comedy:** big white oval eyes with a pupil + highlight, thick eyebrows (they do most of the acting), a small nose stroke and 10+ mouth shapes.
  Expressions: `neutral, happy, grin, laugh, shock, angry, sad, worried, smug, think, sleepy, wink, determined, disgust` (toon.js `PRESET_EXPR`).
- **Poses:** `stand, wave, point, cheer, shrug, hold, present, think, facepalm, shock, arms, fist, carry, pour, drink, sit, walk, run` + custom angles.
- **Real people** keep the same model in every scene (use `LOOKS.<name>`, never re-invent a face):
  - John Pemberton — full grey beard + moustache, grey side-parted hair, dark frock suit, thin (from period portraits).
  - Asa Candler — balding with a fringe, moustache, round spectacles, dark suit.
  - Frank Robinson — dark hair, moustache, bow tie.
  - Robert Woodruff — heavy-set, receding hair, dark suit (1920s–50s).
  - People alive today or recent executives: **generic** (no likeness), shown by role only.
- Skin tones vary (`L.SKIN`); crowds mix ages, hair, clothes (props.crowd).

## 2. Line & colour
- **Ink outline** `#1C1A1F`, 5–6 px at scale 1 on everything (characters, props, sets). Rounded joins.
- **Flat fill + one cel-shade band** (`L.shade`) + small white highlights. No gradients on characters; soft gradients only for sky/light.
- **Brand palette** stays as the accent system for plates and titles: cream `#F6EBD3`, ink, red `#D93A35`, yellow `#F7C548`, blue `#2F6DB5`.
- **Era palettes** (`L.ERA`, applied with `L.finish(ctx, era)`: tint + vignette + paper grain):
  | era | when | feel |
  |---|---|---|
  | `gaslight` | 1880s evenings, pharmacy | warm amber lamps, wallpaper, dark wood |
  | `sepia` | 1880s–1910s daylight | warm paper, faded brick |
  | `industry` | bottling plants, 1900s–1920s | brick red, steel grey, smoky sky |
  | `jazz` | 1920s–30s | clean pastel sky, cream walls |
  | `war` | WWII | olive, khaki, grey sea |
  | `pop` | 1950s–70s ads, TV, Pepsi | saturated, high contrast |
  | `tense` | New Coke 1985 | night blues, purple, red alarms |
  | `modern` | today | bright white/blue, glass, screens |

## 3. Worlds (more detail than characters)
- Every set has **3 depths**: far (sky, skyline, 0.2–0.5), mid (buildings, shelves, 0.6–0.9), near (floor, counter, characters, 1.0) + optional foreground (1.2–1.4: a lamp post, a crate, a plant) that slides past the camera.
- Textures from the kit: bricks, planks, tiles, stripes, wallpaper; props with small details (labels on jars, rivets, window frames, signs with readable words).
- "Something to look at, nothing that steals the action": busy edges, calmer centre; the hero action is in the middle third and lit.

## 4. Motion & editing
- **No frozen frames:** every scene has camera motion (`EN.cam` keys; push-in, pan, pull-back reveal, slow breathing drift) **and** at least one moving thing.
- **New visual event every ~2–4 s** (something appears, a reaction, a cut, a reveal, a number lands). Scenes last 2–8 s.
- **Cut on the stressed word** (`at(lineId, 'word')`); `whip` transitions between places, hard `cut` for punchlines, `tear` for time jumps.
- Parallax with `EN.layers` (depth 0.3 → 1.3). Impact shakes `EN.shake`. Comic FX: `burst`, `puff`, `speedLines`, `sparkles`, sweat drops, bubbles.
- **Visual comedy = exaggerated metaphors that are clearly metaphors** (two giant bottles racing, a man buried in coupons, a phone melting from calls) — never staged as if real.

## 5. Type on screen (no big subtitle band)
- Full subtitles live in the **SRT**. On screen only: **dates** (`L.dateCard`, yellow), **sums & numbers** (`L.plate`, cream/red), **key words** (`L.word`, yellow with ink outline),
  **chapter cards** (`L.chapterCard`, 2.6 s, no voice). Fonts: Inter Black (titles), TypeW (typewriter documents).
- Text never covers faces or the hero object; keep it inside x 90…1830, y 70…1010.

## 6. Brands
- Names in plain bold type on labels and signs ("COCA-COLA", "PEPSI"). **No logo copies** (no script lettering, no wave ribbon, no circle logos), no official-looking ads.
- Generic bottles: straight 1890s bottle, curvy contour-style bottle (1916+), plastic modern bottle (`props.bottle` kinds).

## 7. Sound (kit/sfx.py + assemble.py)
- Synthesized SFX only (ours): pops, fizz, clinks, crowds (murmur/cheer/boo), factory clanks, typewriter, phones, plane, gavel, boing, slide whistle.
- One continuous music bed for the whole film, mood per scene from `music` sections: `gaslight/ragtime` (1880s–1910s), `march` (WWII), `pop`, `tension`, `sad`, `modern`, `build`.
  Quiet under the voice (owner's level `mus * 0.1`, ducking 0.7). Master −14 LUFS.
