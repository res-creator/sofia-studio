# Survival Ep.1 — "Zombie Outbreak: Your First 5 Days of Survival" (full version)

Style D2 (approved, `../STYLE_D2_APPROVED.md`). Length 7:20 (natural pace, no padding).

## Outputs (`out/`)
- `zombie_outbreak_ep1.mp4` — final 1080p30 episode with mix and burned-in captions
- `thumbnail.png` (1280x720), `ep1.srt` (English subtitles), `../upload_kit.txt` (title, description, chapters, tags)
- `cast_sheet.png`, `sets_sheet.png`, `sheet_<block>.png` — QA contact sheets

## Pipeline
`sh build.sh` = `cues.js` → `audio.py` → `srt.js` → `render_all.sh` (blocks, 2 in parallel) → concat + mux → thumbnail.
- Script / lines: `script.json` (canonical text, voices, reused pilot takes), `SCRIPT_EP1.md` (approved story fixes + shot plan)
- Edit list: `seq.js` (lines, gaps, silent beats; times come from the real voice takes)
- Scenes: `scenes/cold|day1|day2|day3|day4|day5|final.js` — each exports `draw`, `capTop`, `cues` (sfx), `music`
- Library: `lib/core.js` (timeline, camera with snap/whip/move, captions, cards, stamps), `lib/cast.js` (Sarah, infected x3, cat, rat, pigeon, duck, backpack/radio on the D2 rig — rig.js untouched), `lib/sets.js` (apartment, hallway, supermarket, stairwell + climbing feet, roof + city + facade/street, stair-house tech room), `lib/act.js` (walking paths, sitting, props)
- Voices: `tts.py` (ElevenLabs via the session proxy, no keys in code), SFX/music: `make_sfx.py`
- QA: `node render.js qa <block>` (reach errors with times; `STEP=1 MIN=4` for the strict pass), `node render.js still <block> t1,t2,.. out.png`
