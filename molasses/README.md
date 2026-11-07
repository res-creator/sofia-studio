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

## Full episode (full/full_episode.mp4, ~12:52)
```
python3 tools/parse_script.py          # full/script_draft.md -> full/chapters.json (chapters 1..9, cold open reused)
python3 tools/tts_chapters.py          # Todd, eleven_v4, natural speed, one request per chapter -> full/vo/<id>.mp3 + words
python3 tools/full_timeline.py         # cold open + chapter cards + chapters -> full/timeline_full.json + full_narration.wav
cp full/timeline_full.json src/data/full.json && cp vo/todd/timeline.json src/data/timeline.json
python3 tools/sound_full.py            # music + short SFX (no noise beds) -> public/audio/full_mix.wav
COMP=Full node tools/frames.mjs out/full_cs 0,2,4,...    # contact sheet frames
npx remotion render src/index.ts Full full/full_episode.mp4 --codec=h264 --audio-codec=aac
```
Shot list: src/full/Full.tsx (each shot is tied to a script line / word). Components: src/full/kit.tsx, src/full/tank.tsx.

## Version 2 (after the review)
- `python3 tools/full_timeline.py` now places every chapter voice at its exact sample offset (fixes up to 0.4 s drift) and adds an 18 s end card.
- `python3 tools/sound_full.py` → `public/audio/full_mix.wav`.
- Motion: push transitions without overlapping text, kinetic type, drifting photo backgrounds, photo wipes/zooms (src/full/kit.tsx, src/full/Full.tsx).
- `python3 tools/make_srt.py` → `full/full_episode.srt`; `npx remotion still src/index.ts Thumb full/thumbnail.jpg` → thumbnail; `full/upload_kit.txt`.
