# Rulebook — school stories (ref: 4 videos of the.seventh + Nate is Late frames for character manner)

Method: Claude 3D Animation Master Prompts (stages 1.3, 1.4, 3.3, 3.8), adapted to our 2D flat pipeline.
References used for analysis only; nothing from them is shipped.

## Numbers (measured with OpenCV on every 2nd frame; `scratchpad/measure.py`, `zoom.py`)
| metric | ref v1 | ref v2 | ref v3 | ref v4 | ref median | ours (v4 build) | confidence |
|---|---|---|---|---|---|---|---|
| duration, s | 81 | 107 | 87 | 91 | 89 | 85 | high |
| hard cuts | 34 | 38 | 33 | 50 | 36 | 26 | medium (threshold 0.12 mean abs diff) |
| avg shot, s | 2.3 | 2.7 | 2.6 | 1.8 | 2.4 | 3.2 | medium |
| frames with camera motion, % | 44 | 47 | 41 | 23 | 43 | 2 | medium |
| shots with a push/pan | 21/36 | — | 23/36 | — | ~60% | 2/28 | medium |
| zoom over a moving shot | 12% | — | 14% | — | 13% | 23% | medium |
| zoom speed, %/s | 4.7 | — | 5.6 | — | ~5 | 17.7 | medium |
| brightness (V) | .63 | .61 | .60 | .69 | .62 | .68 | high |
| saturation (S) | .40 | .40 | .39 | .38 | .39 | .39 | high |
| contrast (std) | .19 | .22 | .20 | .21 | .20 | .23 | high |
| edge density | .073 | .093 | .086 | .088 | .087 | .087 | high |
| narration, words/s | ~2.6 | | | | | ~2.9 | medium (Scribe timestamps) |

## Proportions (measured on reference frames by hand; low-medium confidence)
- Adult standing in back-of-class view: ≈ 0.80 of door height; head ≈ 0.33 of body height.
- Seated student seen from behind (far row): head ≈ 190 px of 1920; body overlaps the desk top; chair back right under the torso.
- Foreground: one cropped classmate head at the frame edge, ~40% of frame width, plus the edge of a desk.
- Board ≈ 70% of frame width, top third of the frame; clock centred above it; door at the right edge.

## Rules to follow
1. Shot every ~2.4 s (1.8–2.7). Hard cuts between shots, no zoom transitions.
2. About 60% of shots have a SLOW push-in: 10–14% over the shot (~5%/s), ease in/out. The rest are static. Never faster than 6%/s; no big zooms from wide to face.
3. Colours: brightness ≈ .62, saturation ≈ .39, soft contrast ≈ .20. Warm pastel walls, thin dark outline (#3a2f3a), one flat shadow side per object.
4. Real proportions: adults < door, desks/chairs at human scale, feet on the floor.
5. Two camera sides of one room: (a) from the back — teacher, board, desk, door, students' backs; (b) from the board — students' faces at desks.
6. Inserts (math, plans, notes) = sheets of paper on a desk, handwritten font.
7. Captions: lower third, one line at a time, never over a face.
8. Characters: our own cast in a TV-cartoon manner (toon.js), not copies of anyone's characters.

## Could NOT measure well
- Exact outline thickness per body part on refs (compressed video); character proportions in Nate is Late (only stills).
- Camera speed for v2/v4 zoom (not run).
