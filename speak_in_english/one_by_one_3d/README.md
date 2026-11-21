# 3D test — classroom (method from the "animated-3d-story-video" skill, adapted)
Real 3D room in three.js (toon shading, ink outlines, painted canvas textures, one warm key light with soft shadows),
2D cartoon characters (toon.js cutouts) standing inside the world, slow eased camera push (monotone cubic warp from the skill).
Rendered headless in Chromium (SwiftShader, ~0.25 s/frame at 1080x1920) — no GPU needed for this scene size.
```
npm i three@0.170.0 && node sprites.js && node shoot.js still 0,2.5,5 && node shoot.js video 5
```

## Full video (skill animated-3d-story-video, adapted)
- `world.js` + `full.html`: 4 locations (класс x=0, парта x=40, актовый зал x=80, коридор x=120), 28 shots from `timeline.json` (approved script/voice of one_by_one_ep1), `camera_plan.md`.
- `node sprites.js` (cutouts with mouth frames) → `PAGE=full.html node shoot.js video 0:85.06 out/full.mp4` → mux with `../one_by_one_ep1/out/tmp/mix.wav`.
- Deviations from the skill (owner's choices): our own cast instead of the skill's base character; lower-third subtitles kept (channel rule); rendered in the cloud (≈0.3 s/frame, no GPU needed); no depth-of-field pass.
