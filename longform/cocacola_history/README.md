# How Coca-Cola Took Over the World in 10 Minutes — How It's Run long-form #1 (YouTube, 1920x1080, 30 fps)

| File | What |
|---|---|
| `how_coca_cola_took_over_the_world.mp4` | the film |
| `how_coca_cola_took_over_the_world_thumbnail_final.png` | FINAL YouTube thumbnail 1280x720 "9 COKES A DAY?!": illustration generated in Figma AI (`art/thumbnail_figma_base.png`, no text/logo) + our type (`node thumb_figma.js`); code-drawn `thumb_final.js`, v1, v2 are drafts |
| `how_coca_cola_took_over_the_world.srt` | English subtitles (upload to YouTube) |
| `script.md` / `script_ru.md` | full English script / Russian translation |
| `sources.md` | fact check + sources for every claim |
| `upload_kit.txt` | title, description with sources, chapters, pinned comment, tags |
| `STYLE.md` | the long-form visual system (characters, colour, worlds, motion, type, brands, sound) |
| `BRIEF.md` | production brief per chapter (what each scene shows) |
| `QC.md` | quality report |
| `chapters/c0_hook … c7_today/` | source of each chapter: `script.json`, `vo/`, `episode.js` (+ kits), `mix.py`, `cues.json`, `seg.srt` |
| `../kit/` | shared long-form kit: look.js, toon.js, props.js, engine.js, sfx.py |

## Voice — IMPORTANT
The current build uses a **temporary voice** (Kokoro-82M, open-source, Apache-2.0 licence, voice `am_michael`; `vo_kokoro.py`),
because the ElevenLabs account had only ~1,200 of 30,000 characters left this month (resets Nov 29, 2026). The film needs ~7,500 characters.
To switch to the channel voice **Chris** (VOICE.md settings) when the quota is back or after a top-up:
```
cd longform/cocacola_history && ELEVEN_API_KEYS=proxy python3 vo_chris.py && sh build_all.sh
```
Every scene, sound cue and subtitle is cued from word timings, so the whole film re-times itself to the new voice (render ≈ 1–2 h on 4 CPUs).
Licence note: the ElevenLabs plan on the account is **Starter**, which includes a commercial licence for generated audio; Kokoro is Apache-2.0 (commercial use allowed).

### Fish Audio voice (owner's choice, Nov 2026)
Voice: **Ethan** (Fish Official, documentary narrator; alternative Adrian). The key is read ONLY from the environment variable `FISH_API_KEY`
(cloud: environment settings → secrets). Commercial use of Fish Audio voices needs a paid Fish Audio plan.
```
cd longform/cocacola_history && <venv-with-faster-whisper>/bin/python vo_fish.py && sh build_all.sh
```
Fish returns audio without word timings; `vo_fish.py` force-aligns every line locally (faster-whisper) so the animation re-times itself.

## Rebuild
`python3 script_lines.py` (lines) → voice → `sh build_all.sh` (all chapters → `assemble.py`: one music bed, −14 LUFS, merged SRT, `chapters.txt`).
Single chapter: `cd chapters/<ch> && node episode.js still 5,10,20 /tmp/x.png` (contact sheet) / `node episode.js video seg_video.mp4`.
