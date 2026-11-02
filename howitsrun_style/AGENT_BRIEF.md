# Brief for an episode animator (How It's Run, Nov 2026 batch)

You build ONE finished episode in ONE folder of the repo `/home/user/sofia-studio` (branch `claude/sweet-brahmagupta-7uiuaz`).
Other agents build other episodes in parallel in their own folders at the same time.

## Hard limits
- Touch ONLY files inside your episode folder. Do not edit `howitsrun_style/`, `hirkit/`, `CHANNEL.md`, other episodes, or `lib/`.
  If you need a new helper, write it in your episode's kit file.
- Do NOT git commit / push / branch. The lead commits everything.
- Do NOT call ElevenLabs at all (no TTS, no STT, no sound effects): the voice-over is already in `<folder>/vo/` (+ `vo/speech.json`).
  Skip `stt_check.py` runs; just create the file (copy from `hoover_ep19/stt_check.py`, adapt its `NUM` list to your numbers).
- No API keys anywhere. English only on screen. Hashtags lowercase.
- Real people: generic drawings, never a likeness. Brand names only as plain text, never a logo copy.

## Read first
1. `CHANNEL.md` (rules) and `.claude/skills/how-its-run/SKILL.md` (pipeline, QC).
2. `howitsrun_style/README.md`, `style.js`, `people.js`, `sets.js` — the ONLY source of characters and look
   (thin full-body profile people in real places, flat sets, paper plates; style reference `lawnchair_ep17`, `emu_ep12`, `hoover_ep19`).
   Do NOT use the look of `tp_ep12`, `icecream_ep13`, `pudding_ep18` (big front busts, crowded collage).
3. Your approved script with the on-screen plan: `scripts_batch_nov2026.md`, your section. `script.json` in your folder = the spoken lines
   (already voiced — do not change the text).
4. Code template to copy and adapt: `hoover_ep19/` — `episode.js` (shots on voice words, overlays, frame-0 headline, stampLabel,
   question card with `{ arrow: true }`, SPLIT/REPL subtitles, cues, MUSIC, CLI incl. `carousel`), `hoovkit.js` (props on howitsrun_style),
   `cast.js`, `mix.py` (ONE music bar grid via `SECTIONS`, no noise SFX at 0.0 s), `build.sh` (ends with `sh ../howitsrun_style/master.sh` → −14 LUFS),
   `cover.js`, `upload_kit.txt`.

## Make
- `<kit>.js` props/sets/cast for your story (built on howitsrun_style), `cast.js` + `charsheet.js` → `<name>_cast_sheet.png` (cast lineup, for the record),
  `episode.js`, `mix.py`, `build.sh`, `cover.js` → `<name>_cover.png`, `upload_kit.txt`, `stt_check.py`.
- Frame 0 at 0.0 s: the absurd picture + the 3–5 word conflict from the script table (`ST.headlineVs` or `ST.headline2`), sound at 0.0 s
  (a clean hit: `slam`/`ding`/`pop`, never `jet`/noise), motion from the first frame. `ST.stampLabel(ctx)` (REAL STORY · RE-ENACTMENT) always on.
- Every spoken line gets the picture from the table; cut on the stressed words (`at(id, word)`); something new every 1–2 s; no empty frames.
- Subtitles: `EN.drawSubtitles` with `ST.SUBS`; `SPLIT[id]` must sum to the word count; never over faces or key numbers (people's faces above y ≈ 1450).
- Last shot: `ST.questionCard(..., { arrow: true })` with the question from the table, held ≥ 2.0 s, no voice, over a picture echoing frame 0.
- Carousel: `node episode.js carousel carousel` → 6 PNG 1080x1920 without subtitles (hook, 3–4 beats with the numbers, the money twist, the question).
- Upload kit: TikTok caption ending with the question + 3–5 lowercase hashtags (e.g. #truestory #history #money #weirdhistory #howitsrun),
  pinned comment with the sources (from the script file, only those links), YouTube Shorts title + description + sources; say "re-enactment, generic characters".

## Build and QC (all must pass)
- `sh <folder>/build.sh > <folder>/build.log 2>&1` (renders take a few minutes; 4 CPUs are shared with other agents — run it once you're happy with stills).
- Before the full render: `node episode.js still t1,t2,...` contact sheets and look at them (Read the PNG). Fix overlaps, cut text, empty frames,
  props over faces, labels under subtitles, things at the frame edge (x > 940 is under TikTok buttons).
- After: dense sheet of the final MP4 every 0.5 s (`ffmpeg ... fps=2,scale=180:320,drawtext...,tile=12x5`) — look at every frame; fix and rebuild if needed.
- `ffprobe` 1080x1920 30 fps; `blackdetect` = 0; `ebur128` integrated ≈ −14 LUFS; non-silent first 0.3 s; length 35–50 s.

## Report back (short, plain text)
Folder, final length, LUFS, what is in the video beat by beat (one line each), anything you could not do or are unsure about, file list.
