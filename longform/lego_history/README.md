# How LEGO Almost Destroyed Itself — How It's Run long-form #2 (stage 1: research + script, waiting for the owner's approval)

| File | What |
|---|---|
| `research.md` | research report: facts with status (confirmed / estimate / disputed) and sources; causes of the crisis; myths to avoid |
| `script.md` | English script v1 (52 lines, ≈ 1,530 words, ≈ 11 min) |
| `script_ru.md` | full Russian translation, line by line |
| `production_plan.md` | chapters + timecodes, visual concept per chapter (Figma vs code), cast, plates, props, generation budget, credits, time |
| `critique.md` | self-critique: retention risks, content risks, proposed v2 changes |
| `estimate.py` | Figma generation budget (v2.1: ≈ 38) |

Production standard: `../LONGFORM_STYLE.md`, `../figmakit/`. Nothing generated, voiced or rendered yet.

## Script v2.1 — FINAL for voicing + production prep
| File | What |
|---|---|
| `script_v2.md` | English script v2.1, final (46 lines, 1,427 words, 8,092 chars, ≈ 10:36) |
| `chapters/*/script.json` | the same script split by chapter for the pipeline |
| `production_v2.md` | scene list, characters + emotions, plates, props, reuse, Figma batches (≈ 38), animation order, voice availability |
| `script_v2_ru.md` | Russian translation, line by line |
| `plan_v2.md` | chapter plan with timecodes + visual storytelling |
| `changes_v2.md` | three hooks compared, key changes vs v1, fact check, v2.1 fixes |
| `critique_v2.md` | critical analysis with scores |

## Full film (draft with temporary voice)
| File | What |
|---|---|
| `how_lego_almost_destroyed_itself.mp4` | the film, 1920×1080, 30 fps, −14 LUFS (temporary Fish Audio voice) |
| `how_lego_almost_destroyed_itself.srt` · `chapters.txt` · `upload_kit.txt` | subtitles, YouTube chapters, title/description/hashtags |
| `how_lego_almost_destroyed_itself_thumbnail.png` | thumbnail (Figma art + code headline, `film/thumbnail.js`) |
| `film/lib.js` | the film's shot library (on top of `figmakit/lib/scene.js` + `puppet.js`) |
| `chapters/<ch>/episode.js` | animation of each chapter; timed to WORDS of the voice |
| `film/voice_fish.py` · `film/align.py` | voice generation + word timings / cue layout / subtitles |
| `film/render_all.sh` · `film/assemble.py` | render all chapters (4 in parallel) · music, mix, master, SRT, chapters |
| `art/` | all Figma art (34 generations), keyed sprites, puppets |

### Replace the voice (e.g. Chris on ElevenLabs after 29 Nov)
1. Put the new mp3 files at `chapters/<ch>/vo/<line id>.mp3` (same ids as `script.json`).
2. `python3 film/align.py` — re-measures every word, re-lays the cue times, rewrites `vo.wav`, `cues.json`, `seg.srt` (sfx/music cues are kept and re-generated in step 3).
3. `sh film/render_all.sh` — every animation beat is tied to words (`at(line, word)`), so the picture follows the new voice automatically.
4. `python3 film/assemble.py`.
Then watch the film once: a new voice has a different rhythm, so check pauses, holds and on-screen numbers (the owner asked for a manual check).
