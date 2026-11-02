# The Great Molasses Flood — 60–90 s style test (Remotion)

Deliverables: `final.mp4` (1920x1080, 30 fps, H.264/AAC), `contact_sheet.jpg` (a frame every 2 s), `sources.txt` (every photo + license, map data, audio, facts).

Two voice variants: `final.mp4` (Bryan, vo/bryan) and `final_todd.mp4` (Todd, vo/todd). Each folder has config.json, words, timeline.

Rebuild a variant (VARIANT = bryan | todd):
```
npm i
python3 tools/tts_words.py VOICE_ID vo/VARIANT      # only for a new recording (costs ElevenLabs credits)
python3 tools/timeline.py vo/VARIANT                # lead/tail/beats from config.json -> timeline.json + narration_timed.wav
python3 tools/sound.py vo/VARIANT                   # synthesised music + sfx, ducked under the voice -> mix.wav
tools/render_variant.sh VARIANT out.mp4             # copies timeline + mix into the Remotion project and renders
```
Shots are authored on the first voice's timeline (src/data/timeline_v1.json); `toNew/toOld` in src/lib.tsx keep every cut
locked to the same word in any new recording. Shot list: `src/Main.tsx` (SHOTS). Map data build: tools/build_map.py.
