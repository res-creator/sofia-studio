# Medical cartoon — 15 s style test ("YOUR BODY AT 3 AM")
Style test only (no voice-over, no paid generation). Original characters: Brain, Heart, Stomach.

- `medical_test.mp4` 1920x1080 / 30 fps / 15 s (procedural SFX only)
- `characters.png`, `storyboard.png`
- Source: `art.js` (ink/cel helpers) · `characters.js` (rigs) · `sets.js` (bedroom, control room) · `scenes.js` (choreography, camera) · `sfx.js` · `render.js` · `sheet.js`

Rebuild: `npm install` in repo root, then
```
node sfx.js && node render.js video v.mp4 && ffmpeg -i v.mp4 -i sfx.wav -c:v copy -c:a aac -shortest medical_test.mp4
node sheet.js .
```
