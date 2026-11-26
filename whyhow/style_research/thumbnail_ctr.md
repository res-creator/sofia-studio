# Thumbnails that win in our niche (YouTube search scan, 26 Nov 2026)

Searched: how dubai/singapore/tokyo works, why does this city exist, why nobody lives here, insane engineering of… Top by views:
- Geography By Geoff — "Why Almost NOBODY Lives On Australia's West Coast" 11.3M in 1 month; two more at 3.9M / 2.0M (3 months). RealLifeLore 1.3M in 3 weeks, Map Pack 2.3M.
  Pattern: bright map, ONE region in red, curved white arrow, 1–2 words in a black box ("UNLIVABLE").
- OBF "Why Tokyo Is Insanely Well Designed" 9.7M; WSJ NYC vs Tokyo 3.0M — side-by-side comparison.
- Fat Rat "How Lee Kuan Yew Built Singapore" 3.0M — BEFORE / AFTER split (1960s | 2026) + person cut-out.
- RocaNews "America's Most Extreme Desert Town" 4.7M — ONE giant number on a real photo ("134°F").
- Leaf of Life 1.9M — objects outlined in yellow + 2 words ("NO ELECTRICITY").
- Calm photo + title-style text (B1M, Wendover, CNBC): 1.5–3.3M but from big channels; weaker for a new channel.

Rules for How It's Run thumbnails:
1. One idea readable in half a second at phone size. 1–3 words (number counts as one).
2. Use a winning shape: before/after split, one giant number, or arrow + highlighted thing.
3. Text adds to the title, never repeats it. Light tone: curiosity, not fear ("THIS WAS SEA", not "TERRIFYING").
4. White Anton with dark outline + ONE coral box (#E4572E). Real photos only, no AI images.
Generator: `whyhow/covers_v2.js` → `*_cover_D.jpg`, `*_cover_E.jpg`.

## v3 (owner: v2 still looked cheap) — `whyhow/covers_v3.js` → `*_cover_F.jpg`
- No outlined Anton text: heavy Inter Black in solid boxes (dark #101214 + one coral box), soft drop shadow.
- One clean, premium real image (NASA ISS photo, aerial photo, night city), stronger grade, light vignette.
- One curved white arrow to the thing the words talk about. Check readability at phone size (336×188).

## v4 — THE thumbnail design system (designer review, owner asked for a cohesive look) — `whyhow/covers_v4.py` → `*_cover_G/H.jpg`
"White over footage + one coral word" — the same look as the videos.
- Font: Inter Display Black only, ALL CAPS, tracking −0.02 em. Setup line 82–116 px white (no plate); payoff ≈1.4× (124–170 px) white on ONE coral plate #E4572E, radius 10, padding 0.20 em, hanging alignment (text edges line up, plate sticks out to the left). No outlines, no Anton, no black plates, no yellow.
- Kicker = the video's location tag: 3×36 white bar + place name, Inter Display SemiBold 30 px, tracking +0.16 em, 30 px above the setup line.
- Grade: per-channel levels (dehaze), gentle S-curve, saturation ≤1.12, shadows toward navy #141A21; scrim from the text side (ink 0.6 → 0 at 55% width), light edge burn, unsharp after resize. Never canvas `saturate(1.3+)`.
- Layout: 64 px margins, text block in the left or right 45%, subject on the opposite third; keep bottom-right (timestamp) and top-right (hover icons) clear.
- Max 4 words. Arrow only if it lands exactly on the named thing. QA at 168×94 and 336×188.
- NOTE: ep15 footage `pb_desalination_plant_7367379.jpg` is a houseplant and `_7382931` a wastewater plant — never use as desalination.

## v5 — OWNER'S CHOICE (Nov 26 2026): her Hong Kong look (CTR 3.3%) — `covers_v5.py` + `covers_v5.js` → `*_cover_I.jpg`
- Vivid, sunny real photo (sat ~1.2, dehazed), soft dark scrim on the left only.
- Anton, stacked left-aligned lines: place name WHITE, the hook in YELLOW #FFE01B (last line biggest). Soft drop shadow, no plates, no orange.
- One curved yellow arrow from the words to the subject. 3 short lines, max ~5 words.
