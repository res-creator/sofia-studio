---
name: how-its-run
description: Make a How It's Run episode (English TikTok / YouTube Shorts channel: incredible true stories where, in the end, money decided everything) from a topic to the final MP4, cover, SRT, carousel PNGs and upload kit. Use when the owner asks for a new How It's Run video ("сделай видео для канала How It's Run", "new episode: <topic>"), for fixes to an existing episode (v2), or for a cover / caption / upload kit for one. Not for the Sofia kids' channel.
---

# How It's Run — episode from topic to upload kit

The channel rules live in `CHANNEL.md` (format, palette, voice, subtitles, safe zones, facts, retention, checklist) and `VOICE.md`.
**Read both first, every time** — this skill is the working order and the lessons learned; CHANNEL.md wins if they disagree.
Owner speaks Russian: answer her in Russian, simply. Everything on screen and in audio is American English. Hashtags lowercase.

## The channel format (owner, Nov 2026 — overrides older episodes)
**Incredible TRUE stories where, in the end, MONEY decided everything.** Best references: `emu_ep12/` (Army vs. 20,000 emus, branch
`claude/vibrant-hopper-rwobhr`) and `lawnchair_ep17/` (Larry Walters' lawn-chair flight, branch `claude/friendly-gauss-qry8ah`).
No more hero-less explainers (`icecream_ep13/` "why the McDonald's machine is always broken" is the last of that kind — copy its code, not its format).

## Style (owner, Nov 2026) — mandatory
**Эталон стиля — `lawnchair_ep17` и `emu_ep12`. Персонажей брать только из `howitsrun_style/`. Стиль `tp_ep12`, `icecream_ep13` и pudding guy НЕ использовать.**
- Read `howitsrun_style/README.md`; build the episode kit on `howitsrun_style/style.js`, `people.js`, `sets.js` (episode-specific props go in the episode's own kit file).
- People: `P.person()` full body in profile in a real place (s 0.9–1.5), one accessory each; `personBust` only for a short punch-line.
- After the script is approved and BEFORE any animation: render a character sheet (like `hoover_ep19/charsheet.js`) and wait for the owner's OK.

## The 8 rules — check every episode against them
1. **Story spine: a real hero → a problem → a failure / surprise → the final twist about money** ("Not soldiers. Money."). The money
   twist is the payoff (who paid, what it cost, how a price / bounty / paycheck decided it) — not a moral.
2. **Frame 0 (0.0 s) = an ABSURD picture + the conflict in 3–5 big words** ("ARMY vs. 20,000 EMUS"). A face with a strong emotion is
   welcome, but the absurdity comes first. Never in frame 0: a full-screen date, a calendar, a landscape, a slow intro, "?" instead of a number.
3. **The first line = the strangest fact of the story** ("In 1932, Australia's army went to war... against BIRDS."). "You" openers are not required.
4. **Sound from 0.0 s** (hit, beep, notification). No silence at the start.
5. **Motion from the first frame** (camera push-in, text pops in, the character reacts).
6. **Length 35–60 s**, whatever the story needs, at the natural voice pace.
7. **Last frame: a direct question to the viewer, held ≥ 2 s with no voice** ("Would YOU have mailed the check? 👇"). Comments asks
   are allowed; follow/like asks are not.
8. **Carousel:** 6 key frames, PNG 1080x1920, no subtitles, into `<folder>/carousel/`.

## 0. Setup (cloud container)
```bash
cd /home/user/sofia-studio && npm ci && pip install -q numpy scipy
curl -sS -o /dev/null -w "%{http_code}\n" https://api.elevenlabs.io/v1/models   # must be 200
```
ElevenLabs: keys only via env `ELEVEN_API_KEYS` (in this cloud env the proxy injects auth: `ELEVEN_API_KEYS=proxy`, header `xi-api-key: proxy`).
Never write a key into code, git, chat or memory. Max 2 requests at once, ~3 s apart.

## 0.5 Topic check (before ANY research)
Read the table «Уже сделано — не повторять» in CHANNEL.md, then look for newer episodes in other branches:
```bash
git fetch -q origin && for b in $(git branch -r | grep -v HEAD); do git ls-tree --name-only $b | grep -E "_ep[0-9]+$" | sed "s#^#$b #"; done | sort -k2 -u
```
If the topic (or the same story) is already made — even in an unmerged branch — tell the owner and take the next topic from her queue.
When an episode is finished, add its row (folder, branch, topic, final file, length) to that table.

## 1. Facts first (stop and show the owner)
- Search the web; open the pages (WebFetch) — don't trust search snippets for numbers or quotes.
- Give a short table: fact → source link. Only URLs you actually opened. Mark disputed details ("accounts differ", "reportedly").
- If a quote's exact wording differs between sources, paraphrase it in the script; never invent a quote or number.
- Real people: name them in text/voice, but draw a generic character (no likeness) and say so in the upload kit.

## 2. Script (stop and wait for approval)
- **35–60 s total** = voice + the ≥ 2 s silent question card. At Chris's pace that is **≈ 85–145 words in 10–16 short lines**
  (one line = one ElevenLabs request = one beat). Cut the story to its spine.
- **Line 1 = the strangest fact** and is the hook (picture + voice + frame-0 text say the same thing) → the hero and the problem →
  the failure / surprise → **the money twist** → one clear last spoken line.
- **Write the question card** (on screen only, not voiced): a direct, easy-to-answer question to the viewer, with "YOUR"/"you" and 👇,
  tied to their own experience ("Has this happened at YOUR store? 👇"). It goes into the script table as the last row.
- Show the script as a table: line / voice text / what's on screen. Offer an improved hook. Ask only real questions.
- **Do not generate audio or render anything before the owner approves.**

## 3. Episode folder (copy the latest episode, never edit old ones)
Latest code reference: `icecream_ep13/` (end card with colour emoji, `carousel` mode, louder 0.0 s hit); story references: `emu_ep12/`, `lawnchair_ep17/` (other branches: `git show <branch>:<file>`). New folder `<topic>_ep<N>/`:
| File | Copy from | Change |
|---|---|---|
| `script.json` | — | approved lines `[{id: "s01", text}]` |
| `vo.py`, `speech.py`, `.gitignore` | tp_ep12 | header comment only |
| `stt_check.py` | tp_ep12 | the `NUM` list (number words ↔ digits of this script) |
| `<kit>.js` | new | this episode's props and cast, built on `howitsrun_style/` (people, sets, plates) |
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
`at(id, word)` cuts ~0.12 s before the stressed word. Keep GAP between lines 0.3–0.4 s. After the last line comes the **2 s question card with no voice** (set the last GAP so the card holds ≥ 2.0 s after the speech ends). Never speed up the voice.

## 5. Kit + shots
- Draw the props first and check them on one lineup still (a scratch script drawing every prop on a sheet) before writing shots.
- One visual journey: objects transform into the next scene; something new every 1–2 s; a character we follow, with expressions
  (`R.expr`: worried, skeptical, smug, grin, shocked…), one deadpan look at the camera, big numbers as objects (tags, cards, stamps).
- **Frame 0**: the absurd picture (the soldier aiming at an emu, the man in a lawn chair at 16,000 ft) + the 3–5 word conflict card
  ("ARMY vs. 20,000 EMUS") + the small black date/place stamp; a face with a strong emotion if it fits. Already moving at t = 0: camera push-in, the card
  pops (`E.back`), the face reacts (blink/brow/look change). Check `node episode.js frame 0 f0.png` — it must work as a thumbnail.
  Never reset to an empty scene after the hook.
- **Last shot**: the question card (big, inside y 240–1500, x < 940) over a picture that echoes frame 0, ≥ 2 s, no voice, music/laugh
  bed only; the subtitles are empty there.
  Colour emoji work on canvas after `GlobalFonts.registerFromPath('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 'Emoji')`
  and `ctx.font = '120px Emoji'` (see `icecream_ep13/episode.js` endCard).
- Proof moment: a big stamp with a hit sound (`stampMark`). Show the company's / other side's position if it exists.
- Subtitles: `SPLIT[id]` must sum to the line's word count (the build throws otherwise); numbers as digits via `REPL`.
- Useful commands: `node episode.js shots` (shot list) · `node episode.js still t1,t2,... out.png` (contact sheet) · `node episode.js frame t out.png`.

## 6. Sound
`node episode.js cues && python3 mix.py`. **The first cue is at 0.0 s** (error beep, hit, notification) — no silent start. SFX are synthesized and kept quiet (fx × 0.3, ducked under the voice); music sections follow the story and stop on the loop cut.
**Synthesized "voice-like" SFX (laughs, crowds, screams) can be misheard by STT and by viewers** — in ep 12 a synthetic laugh was transcribed as "[farting]".
Generate those once with ElevenLabs Sound Effects into `<folder>/sfx/` and load them in `mix.py`:
```bash
curl -sS -X POST https://api.elevenlabs.io/v1/sound-generation -H "xi-api-key: proxy" -H "Content-Type: application/json" \
  -d '{"text":"<description>, no music","duration_seconds":2.5,"prompt_influence":0.5}' -o sfx/<name>.mp3
```
then STT the clip alone to confirm it reads as intended (e.g. "[laughs]").

## 7. Build (background) and QC — all must pass before "done"
```bash
sh <folder>/build.sh > <folder>/build.log 2>&1          # run_in_background; ~2–4 min
```
1. Dense sheet of the FINAL MP4, every 0.5 s:
   `ffmpeg -i out.mp4 -vf "fps=2,scale=180:320,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=red,tile=12x5" -frames:v 2 sheet_%d.png`
   Look for: text cut at the frame edge (fit every headline/label to a max width), subtitles over faces or key numbers,
   cue cards/labels covering faces, props cut at the edges, empty frames, draw-order mistakes.
2. The 8 rules: story spine with the money twist, frame 0 = absurd picture + 3–5 word conflict, line 1 = the strangest fact,
   sound at 0.0 s (`ffmpeg -i out.mp4 -t 0.3 -af volumedetect -f null -` shows a non-silent max), motion in the first 0.5 s,
   length 35–60 s, the question card held ≥ 2 s with no voice at the end, 6 carousel PNGs.
3. `ffprobe` (1080x1920, 30 fps, length), `blackdetect` = 0, loudness via `ebur128` (episodes sit at ≈ −16 LUFS after the build's loudnorm).
4. `ELEVEN_API_KEYS=proxy python3 stt_check.py out.mp4` — the transcript must equal the script, with no extra words from SFX.
5. Gaps between voice lines from `cues.json` + `vo/speech.json` (no gap > ~0.5 s).
6. If only the audio changed, remux instead of re-rendering: copy the video stream to `_video.mp4` and run the mux part of `build.sh`.

## 8. Cover, carousel, upload kit
- **Carousel** (`<folder>/carousel/01.png … 06.png`, 1080x1920): 01 the absurd hook, 02–04 story beats with the key numbers, 05 the money twist,
  06 the question card. Pick times between cuts and render with the episode itself (same look, no subtitles over faces):
  ```bash
  mkdir -p carousel; i=1; for t in <t1> <t2> <t3> <t4> <t5> <t6>; do node episode.js frame $t carousel/0$i.png; i=$((i+1)); done
  ```
  Look at all 6 before delivery.
- Cover (`cover.js`, see `COVERS.md`): 1080x1920, 3–5 word headline, key words on a red strip, one hero object, small date stamp,
  everything inside y 240–1680, nothing under the right-hand buttons or the caption area. Check it visually.
- `upload_kit.txt`: TikTok caption (may end with a natural question) + lowercase hashtags · pinned comment with sources and one
  "what you can do" line if the facts allow · the same question as the video's last card at the end of the caption · YouTube Shorts title, description, source links (only pages you opened), hashtags.

## 9. Deliver
- Commit on the session branch (MP4, cover, SRT, upload kit, carousel/, vo/, sfx/, code; build temp files are git-ignored), push, open a PR.
- Reply in Russian: what's in the video (by beats), QC results honestly (STT ratio, loudness, anything fixed on the way),
  and direct GitHub links: the Pull Request, the branch folder, the MP4, the cover, the SRT, the upload kit
  and the carousel folder (`https://github.com/res-creator/sofia-studio/blob/<branch>/<folder>/<file>`, `.../tree/<branch>/<folder>/carousel`).

## Fixes to an existing episode
Never overwrite: add `episode_v2.js`, `mix_v2.py`, `build_v2.sh` (and `vo_v2/` only if lines change) → `*_v2.mp4`. Keep v1 files.
Apply all the owner's timestamped notes in one pass, then run the full QC (section 7) again.

## Hard rules (from the owner)
- Don't change Sofia / Gus / Dr. Max rigs (`lib/`) or published `ep/`, `ep2/`; don't edit old episode folders.
- English only on screen and in audio; hashtags lowercase; the video ends with a question for comments, but no "follow/like" asks.
- Facts: primary or solid sources; allegations stay allegations; illustrative numbers labelled EXAMPLE.
- No model names in commits, PRs or files.
