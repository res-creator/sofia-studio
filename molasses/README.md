# The Great Molasses Flood — 60–90 s style test (Remotion)

Deliverables: `final.mp4` (1920x1080, 30 fps, H.264/AAC), `contact_sheet.jpg` (a frame every 2 s), `sources.txt` (every photo + license, map data, audio, facts).

Rebuild:
```
npm i
python3 tools/build_map.py assets/map src/data/map.json   # needs Natural Earth + OSM extracts in assets/map (see sources.txt)
python3 tools/timeline.py     # vo/narration.mp3 -> pauses between sentences -> src/data/timeline.json + vo/narration_timed.wav
cp vo/narration_timed.wav public/audio/
python3 tools/sound.py        # synthesised music + sfx, ducked under the voice, mix -> public/audio/mix.wav
node tools/frames.mjs out/cs 0,2,4,...   # stills for a contact sheet
npx remotion render src/index.ts Main final.mp4 --codec=h264 --audio-codec=aac
```
Replace the voice: put a new `vo/narration.mp3` + `vo/narration.align.json` (ElevenLabs with-timestamps), regenerate
`vo/words.json` (see the conversion in the session notes), adjust CUTS in `tools/timeline.py`, then run the steps above.
Shot list with timings: `src/Main.tsx` (SHOTS).
