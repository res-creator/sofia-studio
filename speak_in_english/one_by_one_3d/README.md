# 3D test — classroom (method from the "animated-3d-story-video" skill, adapted)
Real 3D room in three.js (toon shading, ink outlines, painted canvas textures, one warm key light with soft shadows),
2D cartoon characters (toon.js cutouts) standing inside the world, slow eased camera push (monotone cubic warp from the skill).
Rendered headless in Chromium (SwiftShader, ~0.25 s/frame at 1080x1920) — no GPU needed for this scene size.
```
npm i three@0.170.0 && node sprites.js && node shoot.js still 0,2.5,5 && node shoot.js video 5
```
