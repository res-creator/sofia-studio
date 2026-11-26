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

## House look (owner's choice, Nov 2026)
- ONE consistent style for the whole video, no visible mix of borrowed pieces.
- Opening (first 15–30 s): fast cuts of REAL footage on the music beat (Johnny Harris energy) + one clean title. NO paper, NO taped/framed photos, NO grain — the owner disliked those.
- Body: real footage first (The B1M feel): long smooth shots, thin white location tags with a short vertical line, clean centred titles.
- Explanations: flat maps and one-number cards (Wendover feel) in the same palette: sand land #EDE6D6, soft blue water #B9CFD8, charcoal text #1F2329, ONE accent (warm coral #E4572E).
- Same font family everywhere (F.bold labels, F.head big numbers). Text max 3 s.
- Music: rhythmic in the opening, then light and calm under the story.
- Reference tests: `whyhow/style_mix/` (approved direction), `style_b1m`, `style_wendover`, `style_jh` (JH: only the opening rhythm is kept).

## Typography and colour
- Tasteful, not loud: one accent colour per video, the rest white or soft grey; no rainbow of bright colours.
- Text sits on soft blurred or darkened backgrounds, never on busy detail.
- Owner will pick a reference channel; match its look once chosen.
