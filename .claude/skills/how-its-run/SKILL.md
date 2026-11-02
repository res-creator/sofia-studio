---
name: how-its-run
description: Make a How It's Run episode (English TikTok / YouTube Shorts channel about money, business and how everyday things are run) from a topic to the final MP4, cover, SRT and upload kit. Use when the owner asks for a new How It's Run video ("сделай видео для канала How It's Run", "new episode: <topic>"), for fixes to an existing episode (v2), or for a cover / caption / upload kit for one. Not for the Sofia kids' channel.
---

# How It's Run — episode from topic to upload kit

The channel rules live in `CHANNEL.md` (format, palette, voice, subtitles, safe zones, facts, retention, checklist) and `VOICE.md`.
**Read both first, every time** — this skill is the working order and the lessons learned; CHANNEL.md wins if they disagree.
Owner speaks Russian: answer her in Russian, simply. Everything on screen and in audio is American English. Hashtags lowercase.

## 0. Setup (cloud container)
```bash
cd /home/user/sofia-studio && npm ci && pip install -q numpy scipy
curl -sS -o /dev/null -w "%{http_code}\n" https://api.elevenlabs.io/v1/models   # must be 200
```
ElevenLabs: keys only via env `ELEVEN_API_KEYS` (in this cloud env the proxy injects auth: `ELEVEN_API_KEYS=proxy`, header `xi-api-key: proxy`).
Never write a key into code, git, chat or memory. Max 2 requests at once, ~3 s apart.

## 1. Facts first (stop and show the owner)
- Search the web; open the pages (WebFetch) — don't trust search snippets for numbers or quotes.
- Give a short table: fact → source link. Only URLs you actually opened. Mark disputed details ("accounts differ", "reportedly").
- If a quote's exact wording differs between sources, paraphrase it in the script; never invent a quote or number.
- Real people: name them in text/voice, but draw a generic character (no likeness) and say so in the upload kit.

## 2. Script (stop and wait for approval)
- 35–60 s at Chris's natural pace ≈ 140–150 words; 10–16 short lines (one line = one ElevenLabs request = one beat).
- Hook in the first 2 s (picture + voice + frame-0 text say the same thing) → story beats → a real twist (why it happened, not "people are dumb") → one clear last line that invites comments without asking for them. Last frame echoes the first (loop).
- Show the script as a table: line / voice text / what's on screen. Offer an improved hook. Ask only real questions.
- **Do not generate audio or render anything before the owner approves.**

## 3. Episode folder (copy the latest episode, never edit old ones)
Latest reference: `tp_ep12/` (also `scratch_ep11/`). New folder `<topic>_ep<N>/`:
| File | Copy from | Change |
|---|---|---|
| `script.json` | — | approved lines `[{id: "s01", text}]` |
| `vo.py`, `speech.py`, `.gitignore` | tp_ep12 | header comment only |
| `stt_check.py` | tp_ep12 | the `NUM` list (number words ↔ digits of this script) |
| `<kit>.js` | new | this episode's sets, props, cast (on hirkit + `tests/mcd_collage/kit.js`) |
| `episode.js` | tp_ep12 | GAP, shots, SPLIT, REPL, highlight words, headline, stamp, cues, MUSIC |
| `mix.py` | tp_ep12 | SFX additions, music sections |
| `build.sh`, `cover.js`, `upload_kit.txt` | tp_ep12 | names, cover art, texts |
Add a row for the episode in the CHANNEL.md "Episodes made" table.

## 4. Voice
```bash
cd <folder> && ELEVEN_API_KEYS=proxy python3 vo.py && python3 speech.py
```
Chris `iP95p4xoKVk53GoZ742B`, `eleven_multilingual_v2`, stability 0.35 / similarity 0.8 / style 0.55 / speaker boost / speed 0.95,
with previous/next text. Each line generated once. CAPS = emphasis, "..." = a beat. Print the word timings and plan cuts on them:
`at(id, word)` cuts ~0.12 s before the stressed word. Keep GAP between lines 0.3–0.4 s (last line ~1.1 s hold). Never speed up the voice.

## 5. Kit + shots
- Draw the props first and check them on one lineup still (a scratch script drawing every prop on a sheet) before writing shots.
- One visual journey: objects transform into the next scene; something new every 1–2 s; a character we follow, with expressions
  (`R.expr`: worried, skeptical, smug, grin, shocked…), one deadpan look at the camera, big numbers as objects (tags, cards, stamps).
- Frame 0: headline card ("CONFLICT → RESULT") + small black date/place stamp; never reset to an empty scene after the hook.
- Proof moment: a big stamp with a hit sound (`stampMark`). Show the company's / other side's position if it exists.
- Subtitles: `SPLIT[id]` must sum to the line's word count (the build throws otherwise); numbers as digits via `REPL`.
- Useful commands: `node episode.js shots` (shot list) · `node episode.js still t1,t2,... out.png` (contact sheet) · `node episode.js frame t out.png`.

## 6. Sound
`node episode.js cues && python3 mix.py`. SFX are synthesized and kept quiet (fx × 0.3, ducked under the voice); music sections follow the story and stop on the loop cut.
**Synthesized "voice-like" SFX (laughs, crowds, screams) can be misheard by STT and by viewers** — in ep 12 a synthetic laugh was transcribed as "[farting]".
Generate those once with ElevenLabs Sound Effects into `<folder>/sfx/` and load them in `mix.py`:
```bash
curl -sS -X POST https://api.elevenlabs.io/v1/sound-generation -H "xi-api-key: proxy" -H "Content-Type: application/json" \
  -d '{"text":"<description>, no music","duration_seconds":2.5,"prompt_influence":0.5}' -o sfx/<name>.mp3
```
then STT the clip alone to confirm it reads as intended (e.g. "[laughs]").

## 7. Build (background) and QC — all must pass before "done"
```bash
sh <folder>/build.sh > <folder>/build.log 2>&1          # run_in_background; ~4 min for 60 s
```
1. Dense sheet of the FINAL MP4, every 0.5 s:
   `ffmpeg -i out.mp4 -vf "fps=2,scale=180:320,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=red,tile=12x5" -frames:v 2 sheet_%d.png`
   Look for: text cut at the frame edge (fit every headline/label to a max width), subtitles over faces or key numbers,
   cue cards/labels covering faces, props cut at the edges, empty frames, draw-order mistakes.
2. `ffprobe` (1080x1920, 30 fps, length), `blackdetect` = 0, loudness via `ebur128` (episodes sit at ≈ −16 LUFS after the build's loudnorm).
3. `ELEVEN_API_KEYS=proxy python3 stt_check.py out.mp4` — the transcript must equal the script, with no extra words from SFX.
4. Gaps between voice lines from `cues.json` + `vo/speech.json` (no gap > ~0.5 s).
5. If only the audio changed, remux instead of re-rendering: copy the video stream to `_video.mp4` and run the mux part of `build.sh`.

## 8. Cover + upload kit
- Cover (`cover.js`, see `COVERS.md`): 1080x1920, 3–5 word headline, key words on a red strip, one hero object, small date stamp,
  everything inside y 240–1680, nothing under the right-hand buttons or the caption area. Check it visually.
- `upload_kit.txt`: TikTok caption (may end with a natural question) + lowercase hashtags · pinned comment with sources and one
  "what you can do" line if the facts allow · YouTube Shorts title, description, source links (only pages you opened), hashtags.

## 9. Deliver
- Commit on the session branch (MP4, cover, SRT, upload kit, vo/, sfx/, code; build temp files are git-ignored), push, open a PR.
- Reply in Russian: what's in the video (by beats), QC results honestly (STT ratio, loudness, anything fixed on the way),
  and direct GitHub links: the Pull Request, the branch folder, the MP4, the cover, the SRT, the upload kit
  (`https://github.com/res-creator/sofia-studio/blob/<branch>/<folder>/<file>`).

## Fixes to an existing episode
Never overwrite: add `episode_v2.js`, `mix_v2.py`, `build_v2.sh` (and `vo_v2/` only if lines change) → `*_v2.mp4`. Keep v1 files.
Apply all the owner's timestamped notes in one pass, then run the full QC (section 7) again.

## Hard rules (from the owner)
- Don't change Sofia / Gus / Dr. Max rigs (`lib/`) or published `ep/`, `ep2/`; don't edit old episode folders.
- English only on screen and in audio; hashtags lowercase; no "follow/like/comment" asks in the video.
- Facts: primary or solid sources; allegations stay allegations; illustrative numbers labelled EXAMPLE.
- No model names in commits, PRs or files.
