# Jupiter animatic (style prototype)

19.4 s, 1080x1920, 30 fps, no voice. Output: `jupiter_animatic.mp4`.

Build:
```
node whatif/animatic/index.js cues && python3 whatif/animatic/audio.py
node whatif/animatic/index.js video _v.mp4   # then mux with mix.wav (see git history / build steps)
node whatif/animatic/index.js still 1,5,9 sheet.png   # preview frames
```

Structure:
- `camera.js` — keyframed camera (`camAt`) + shake (`apply`).
- `world.js` — reusable painters: space, banded Jupiter, cloud bands, particle streaks, vignette.
- `scenes/0N_*.js` — one file per shot: `{ id, dur, sfx, draw(ctx, u, t), shimmer? }`, `u` = scene-local time.
- `index.js` — sequencer, scene transitions (cut / white / fade / flash), heat-shimmer pass, render CLI.
- Mascot: `lib/dummy.js` (`drawDummyFx` with `glow`, `squash`, `tint`, pose params).

To add a scene: drop a file in `scenes/`, add it to the list and to `TRANS` in `index.js`.
