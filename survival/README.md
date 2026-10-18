# Survival series (separate project, not Sofia & Gus)
Faceless "30 days trapped" animated stories. Own package.json/node_modules; does not use ../lib.
Pilot: `pilot_cruise_ship.mp4` (Zombie Outbreak: Cruise Ship, ~53 s, 1920x1080).

Build: `cd survival && npm i && python3 tts.py && python3 make_sfx.py && python3 timeline.py && python3 audio.py && node render.js video _v.mp4 && ffmpeg -i _v.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -shortest out.mp4`
- `lines.json` script (scene per line) · `tts.py` ElevenLabs voice Brian (auth injected by proxy, no keys) · `make_sfx.py` sound effects
- `lib.js` hero (round glasses, mustard top), zombies, labels, captions · `scenes.js` scenes · `render.js video|still`
