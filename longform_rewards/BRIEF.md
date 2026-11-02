# Brief for a long-form chapter animator (How It's Run, YouTube 16:9, "When Paying People Backfired")

The long-form video is cut into 8 segment folders `longform_rewards/seg0_intro … seg7_rule`. Each agent builds the PICTURE + VOICE/SFX STEMS
of its segment(s). The lead joins all segments, adds ONE continuous music bed, masters to −14 LUFS, merges subtitles, makes the thumbnail.

## Hard limits (same as the shorts)
- Touch ONLY files inside your segment folder(s). Do not edit `howitsrun_style/`, `hirkit/`, `mcd_ep1/`, `tests/`, other folders, `lib/`.
  Need a helper? Put it in your own kit file. You may `require` (read-only) kits of earlier episodes (`../../rats_ep26/ratkit`, `../../hoover_ep19/hoovkit`,
  `../../emu_ep12/emukit`, `../../pudding_ep18/pudkit`, `../../lawnchair_ep17/lawnkit`) — check that they don't assume 1080x1920 for what you use.
- No git commit/push/branch. No ElevenLabs calls at all (voice is ready in `<seg>/vo/*.mp3` + `vo/speech.json`; do not change `script.json`).
- No API keys anywhere. English only on screen. Real people (Phillips, Stumpf, Cordray, Vann, Davis, the Major…) = generic drawings, never a likeness.
  Brands (Hoover, Healthy Choice, Wells Fargo, Maytag) only as plain text — no logos, no brand colors/stagecoach copies.
- Never use hand type `thumb`.

## Read first
1. `CHANNEL.md`, `.claude/skills/how-its-run/SKILL.md`, `howitsrun_style/README.md`, `style.js`, `people.js`, `sets.js` — the ONLY look:
   thin full-body profile people in real places, flat sets, paper plates, stamps. Style reference: `lawnchair_ep17`, `emu_ep12`, `hoover_ep19`, `rats_ep26`.
   Do NOT use the look of `tp_ep12`, `icecream_ep13`, `pudding_ep18` (big front busts, crowded collage) — the pudding chapter must be redrawn in howitsrun_style.
2. `longform_rewards/script.md` — the script table: column "On screen" = your picture plan per line; facts + sources at the top.
3. Code template: `rats_ep26/episode.js` (+ `ratkit.js`, `mix.py`, `build.sh`). Copy and adapt.

## 16:9 mode
- First line of your `episode.js`, BEFORE any require: `process.env.HIR_WIDE = '1';` → `ST.W, ST.H` = 1920x1080, `ST.SUBS` = wide subtitle band
  (y 985, size 52, maxW 1400), `stampLabel`/`headline2`/`headlineVs`/`questionCard` get wide default y. Use ST.W/ST.H everywhere, never 1080/1920 literals
  (if you copy code from a vertical episode, re-frame every layout for a wide screen: sets left↔right, people at 0.8–1.1 scale, plates beside people, not above).
- Safe area: keep text and faces inside x 96…1824, y 90…890. Subtitle band y ≈ 900–1040: no faces, no key numbers there. No TikTok rail — use the full width.
- `ST.stampLabel(ctx)` (REAL STORY · RE-ENACTMENT) always on (top centre).

## Timing contract (the lead depends on it)
- Segment time starts at 0.0. Voice lines in `script.json` order; gap between lines 0.7 s (0.5–1.0 if a beat needs it).
- Segments 1–7 open with a CHAPTER CARD 0.0–3.0 s, no voice: paper card, small "CHAPTER n" (seg7: no number), big title, place/year, a little motion + SFX at 0.0
  (`pop`/`whoosh`/`stamp`, never noise). First voice line starts at 3.0 s. Titles:
  seg1 "CHAPTER 1 · HANOI, 1902 · The Rat Tails"; seg2 "CHAPTER 2 · BRITAIN, 1992 · The Free Flights"; seg3 "CHAPTER 3 · USA, 1999 · The Pudding Guy";
  seg4 "CHAPTER 4 · USA, 2009–2016 · The Fake Accounts"; seg5 "CHAPTER 5 · MEXICO CITY, 1989 · The License Plates"; seg6 "CHAPTER 6 · AUSTRALIA, 1932 · The Emu Exception";
  seg7 "THE RULE · Goodhart's Law".
- seg0_intro: NO chapter card. Frame 0 at 0.0 s = the absurd picture (hand with scissors over a cartoon rat, a coin) + `ST.headline2`/`headlineVs` "PAID PER RAT TAIL",
  a clean hit sound (`slam`+`ding`) at 0.0 and motion from the first frame; voice s01 starts at 0.3 s. Line s03 shows the six chapter icons
  (rat · vacuum · pudding cup · bank · car plate · emu) flying in on the words.
- Segment end = last voice end + 0.6 s (hold the picture, no fade to black). seg7 only: then the END CARD 6.0 s, no voice:
  `ST.questionCard(..., { arrow: true })` "What reward at YOUR job" / "do people game? 👇" over a picture echoing the cold open (rat runs off, coin spins).
- Something new on screen every 1–2 s; cut on stressed words (`at(id, word)`); no empty frames; numbers appear as paper plates/stamps when spoken.

## Files to make in each segment folder
- `<kit>.js` (props/sets), `episode.js` with CLI: `cues` | `srt out.srt` | `still t1,t2,... out.png` | `frame t out.png [nosubs]` | `video out.mp4` | `shots`
  and `module.exports`-style `T` like the shorts (`node -e "console.log(require('./episode.js').T)" none` must print the length).
- `cues.json` (written by `node episode.js cues`): `{ "T": <len>, "vo": [[id, t], ...], "sfx": [[name, t, gain], ...], "music": { "sections": [[t, mood], ...] } }`
  with moods from: `light` (bright, drums), `calm` (bright, soft drums), `up` (bright + melody, for wins/offers), `tension` (minor, drums), `dark` (minor, soft), `soft` (no drums).
  First section at 0.0. The lead turns these into one music bed for the whole film — do NOT make music yourself.
- `mix.py` (copy the SFX part of `rats_ep26/mix.py`, drop the music part): writes `vo.wav` (voice only) and `fx.wav` (SFX × 0.3, NOT ducked), both mono 44.1 kHz 16-bit,
  exactly `round((T) * 44100)` samples, no tanh/limiter.
- `seg.srt` (`node episode.js srt seg.srt`), segment-local times; `SPLIT`/`REPL` like the shorts so each cue is ≤ 2 lines at the wide band.
- `build.sh`: `export HIR_WIDE=1; python3 speech.py >/dev/null; node episode.js cues; python3 mix.py; node episode.js srt seg.srt; node episode.js video seg_video.mp4`
  (no master.sh, no audio in `seg_video.mp4`; H.264 yuv420p 1920x1080 30 fps, `-crf 18 -preset medium`).

## QC before you report
- Stills first (`node episode.js still ...` and Read the PNG): overlaps, cut text, props over faces, labels under subtitles, empty frames, edge of frame.
- After the render: dense sheet of `seg_video.mp4` every 1 s (`ffmpeg -i seg_video.mp4 -vf "fps=1,scale=320:180,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=red,tile=8x6" sheet_%02d.png`) — look at every frame, fix, re-render if needed.
- `ffprobe` 1920x1080 30 fps; duration == T (±0.05); `blackdetect` = 0; `vo.wav` and `fx.wav` length == T.
- 4 CPUs are shared by 4 agents: render the full video once, when stills are right.

## Report back (short, plain text)
Folder(s), T of each segment, the picture beat by beat (one line per spoken line), what you could not do or are unsure about, file list.
