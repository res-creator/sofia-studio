# How It's Run — owner's style rules (Nov 2026)

Read before writing or editing any episode.

## Tone
- Informative, educational channel. Light, friendly, curious: "a friend telling you something amazing", not news, not true crime, not tense drama.
- Cold opens: a surprising or funny fact, not a disaster or a death. Serious facts may appear, but are told calmly and briefly.
- Narration: warm, a little smile in the voice. Owner's voice: ElevenLabs "How its run Narrator" (Pb6268JrNuO3oSgFg2Io); in Fish via instant clone (`dubtools/fish_takes.py --ref voice_tests/sample2_curious.mp3 --ref-text voice_tests/ref_text.txt --speed 0.92`).

## Pacing
- Text on screen: max 3 s (5 s only for a number that must sink in). Viewers read faster than the narrator speaks — show the text, then go back to footage while the voice finishes.
- A text card is never followed by another text card. Footage between cards.
- On-screen text: max 5–6 words. Never put the whole sentence on screen.
- Think as a viewer: something new every 2–4 s, never wait on a static frame.

## Motion
- Smooth only: no punch-ins, no jerks, no bounce. Slow eased Ken Burns, 0.5–0.6 s dissolves (`smooth: true` / `SMOOTH=1`).
- Motion graphics toolkit: `atlaskit/scenes5.js` (camera dive, kinetic text, counters over blurred photos, animated bars, animated route).

## House look (owner's final choice, Nov 26 2026): FOOTAGE-FIRST
- ONE consistent style for the whole video, no visible mix of borrowed pieces. No beige/sand cards, no "scientific" diagram look.
- Opening (first 15–30 s): fast cuts of REAL footage on the music beat (Johnny Harris energy) + one clean white title over footage. NO paper, NO taped/framed photos, NO grain.
- Body: real footage first (The B1M feel): long smooth shots, thin white location tags with a short vertical line.
- Every number / chart / chapter card sits on a BLURRED, darkened frame of the neighbouring real footage (render.js HOUSE=1 does this automatically: `p._bg` from the nearest photo/video, stills cached in `EP/.cardbg/`). White text, soft grey labels (#D5DAE0), ONE warm accent (coral #E4572E).
- Maps: rare and calm — dark land #2C3540, dark water #141A21, white labels, coral pins/routes. Use a map only when place really matters.
- Same font family everywhere (F.bold labels, F.head big numbers). Text max 3 s.
- Music: rhythmic in the opening, then light and calm under the story.
- Render: `SMOOTH=1 HOUSE=1` (see scratchpad rend.sh pattern: 4 chunks, 2 parallel).

## Thumbnails
- Owner's choice: the Hong Kong look (v5 in `whyhow/style_research/thumbnail_ctr.md`, `covers_v5.py` + `covers_v5.js`): vivid photo, Anton stacked lines — place name white, hook yellow #FFE01B — and one yellow arrow. She does NOT like orange plates.

## Typography and colour
- Tasteful, not loud: one accent colour per video, the rest white or soft grey; no rainbow of bright colours.
- Text sits on soft blurred or darkened backgrounds, never on busy detail.
- Owner will pick a reference channel; match its look once chosen.

## What worked: Hong Kong (EP04) after 12 days — 368 views, 2.4k impressions, CTR 3.3%, retention 34.8% (3:14 of 9:20), 93% from browse/suggested
- Title = surprising fact + question ("Hong Kong Is Mostly Mountains. So Where Do 7.5 Million People Live?"). Statement titles ("How Singapore Made Itself Bigger") get far fewer clicks (Singapore: CTR 1.3% on day 1).
- The cover shows the paradox in ONE photo (green mountains + packed towers) + 3 short lines + arrow.
- Cold open = 3 short lines, ~20 s: the paradox, then the question at once. No long dated story, no sad/heavy opening.
- Familiar city + everyday angle (where people live, tiny homes); 9–11 min; fast cutting.
