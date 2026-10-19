# Full pilot — "Zombie Outbreak: 30 Days Trapped on a Cruise Ship" (flat pilot style, ~7:00)

The original 53-second pilot (`../pilot_cruise_ship.mp4`, untouched) continued to day 30 in the same flat style.
No burned-in subtitles and no "TO BE CONTINUED": subtitles ship as `out/pilot_full.srt`.

## Files
- `script.json` — every line in order: `[id, voice, scene, text, source, pause before]`. Source `pilot` = `../vo`, `cruise` = `../cruise/vo`, `new` = `vo/`.
- `tts.py` — makes the missing `new` lines (ElevenLabs, same voices as the cruise episode; auth via the proxy, no keys). `node timeline.js` — line/word/scene times.
- `lib.js` — the flat people with IK arms/legs (stand / walk / sit on a seat / crouch; props drawn in the hands), Rosa, props.
- `common.js` — camera, light, sets (galley, engine room, crew mess, corridor, outside). Scenes: `scenes_pilot.js` (original pilot), `scenes_b.js`, `scenes_c.js`, `scenes_d.js`.
- `audio.py` — mix → `out/mix.wav`; `srt.js` → `out/pilot_full.srt`; `lineup.js` — pose check sheet.

## Build (from this folder; needs node, python3 + numpy, ffmpeg; `npm install` in `..`)
    node timeline.js && python3 audio.py && node srt.js
    node render.js video out/part1.mp4 0 210 & node render.js video out/part2.mp4 210 418.7; wait
    printf "file 'part1.mp4'\nfile 'part2.mp4'\n" > out/list.txt
    ffmpeg -f concat -safe 0 -i out/list.txt -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/zombie_outbreak_cruise_full.mp4
Check frames: `node render.js still tunnel:12,engine:4.5 out/check.png` (scene:seconds). Pose errors print as "QA".
