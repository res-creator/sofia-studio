# atlaskit — How It's Run documentary graphics (16:9, 1920×1080, 30 fps)

Own graphics only: globe/maps from Natural Earth (public domain, `data/`), cross-sections, counters, charts, cards; free-licence photos with Ken Burns.
Fonts: Anton + JetBrains Mono (`@fontsource`, OFL), Inter (system). Palette = old How It's Run colours on navy.

| File | What |
|---|---|
| `core.js` | canvas, fonts, palette, easing, `key()` keyframes, text/chip, Ken Burns, grade, snow, credit line, coordinates tag |
| `globe.js` | orthographic globe: rotate/zoom, pins with labels, Arctic Circle, distance bracket |
| `scenes.js` | photo, title, chapter, stats, calendar (polar night), split (frozen vs thawed), bars, thermo, ratio, myth, versus, endq, endscreen, sat; `overlays` (head, chip, count, label+arrow, tag, note, ring) |
| `xsec.js` | the signature cutaway: ground + permafrost, stone house (thaw/sink/crack), block on piles (frost, gap, wind, heat, drift, leak, talik), pipes, thermosiphons, probe; `siphon` close-up; `examples` (Alaska pipeline / Qinghai–Tibet railway) |
| `render.js` | `node render.js EPDIR sheet 6 out.jpg` · `stills t1,t2 prefix` · `cues out.json` · `video out.mp4 4` (4 parallel chunks, ~11 min for 14 min of film) |
| `mix.py` | voice on the timeline + own synthesized score (calm / tense / bright sections), wind, hits, ducking, −14 LUFS |
| `srt.py` | SRT from word timings |

## Episode folder (copy `../ep01_norilsk/`)
1. `script.md` → `SCRIPT_EN.csv`; `lexicon.json` for names Kokoro says wrong.
2. Voice: `python3 ../../dubtools/kokoro_takes.py MODELS SCRIPT_EN.csv voice_raw --lexicon lexicon.json --speed 0.88` → `master_voice.py voice_raw voice` → `onset_check.py voice`.
   Speed 0.88 ≈ 175 words/min (1.05 was ~197 wpm — too fast for documentaries).
3. `python3 stt_words.py` (Whisper check + word times) → `python3 align_words.py` → timeline (see the snippet in the EP01 session: chapter gaps 3.2 s, title 4.2 s).
4. Photos: Commons search → `prepare_assets.py COMMONS_DIR` (resizes, writes `assets/credits.json` + `CREDITS.md`, transliterates names: English only on screen).
5. `shots.js`: one list of shots; times by words `at('P012', 'word')` (script words, numbers as spoken).
6. `node ../atlaskit/render.js EP sheet 6 sheet.jpg` → look → `cues` → `python3 ../atlaskit/mix.py EP mix.wav` → `video` → mux.
