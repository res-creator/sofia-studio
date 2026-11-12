# Step 5 — Production plan (one documentary, 12–18 min, 1920×1080, 30 fps)

Folder per film: `whyhow/epNN_<slug>/` with `script.md`, `SCRIPT_EN.csv`, `SOURCES.md`, `CREDITS.md`, `voice_raw/`, `voice/`, `shots.json`, `build.sh`.

## 0. Research and script (day 1)
1. Pick the idea (03_video_ideas.md), search YouTube for the same question (avoid a copy).
2. Fact sheet: every number → source in `SOURCES.md` (papers, government data, Reuters/BBC level journalism). Myths named as myths.
3. Script 2,000–2,600 words (≈ 13–17 min at am_puck 1.05 ≈ 150–155 words/min). Structure:
   cold open (0:00–0:45, strangest fact + the question) → 5–7 chapters with a mini-question each → answer + twist → question for comments.
4. **Owner approves the script before voicing.**

## 1. Voice — Kokoro am_puck (free, Apache 2.0)
```
pip install kokoro-onnx soundfile scipy numpy
# models: github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 → kokoro-v1.0.onnx, voices-v1.0.bin
```
- `SCRIPT_EN.csv` columns: `id,start_s,max_duration_s,english_narration` — one row per paragraph (P001…). For our own films
  `max_duration_s` = generous (words ÷ 2.3 + 3 s), `start_s` is filled after voicing (cumulative length + pauses).
- `python3 dubtools/kokoro_takes.py MODELS whyhow/epNN/SCRIPT_EN.csv whyhow/epNN/voice_raw`
- `python3 dubtools/master_voice.py whyhow/epNN/voice_raw whyhow/epNN/voice` (−16 LUFS per take, EQ match, de-ess)
- `python3 dubtools/onset_check.py whyhow/epNN/voice` → regenerate flagged ids with `--lead <ids>`.
- Write numbers the way they should be spoken ("minus fifty degrees", "twenty-one thousand tons") — Kokoro reads symbols badly.
- Listen to the whole voice once; check with speech-to-text (Whisper) that it matches the script.
- Pauses: 0.35 s between paragraphs, 1.0 s before a new chapter.

## 2. Visuals — only free licences or our own graphics
Target mix per film: **~50 % our own graphics** (maps, cross-sections, counters, diagrams), **~40 % free-licence photos/video**, **~10 % title cards / chapter cards**.
That mix is what makes the channel "ours" (step 6).

| Source | Licence | What for | Attribution |
|---|---|---|---|
| Wikimedia Commons | CC0 / CC BY / CC BY-SA / PD (check each file) | real photos of the place (834 files for Norilsk) | yes for BY/BY-SA: author, licence, link — in description |
| NASA (Earth Observatory, Worldview, ISS photos) | public domain (no logo use) | satellite views, night lights | "Courtesy NASA" |
| Copernicus Sentinel-2 (EO Browser / Copernicus Browser) | free, open | true-colour satellite shots, before/after | "Contains modified Copernicus Sentinel data [year]" |
| USGS / NOAA | US public domain | maps, temperature data | credit recommended |
| Natural Earth | public domain | base maps, borders, rivers | not needed |
| OpenStreetMap | ODbL | street maps, building outlines | "© OpenStreetMap contributors" |
| Copernicus DEM GLO-30 | free | 3D terrain | "Copernicus DEM © DLR/Airbus" |
| Pexels / Pixabay / Coverr | own free licences, commercial OK | generic B-roll (snow, tundra, northern lights, pipes) | not needed, but list in CREDITS.md |
| Our code graphics | ours | cross-sections, piles, temperature counters, charts, map flights | — |

Rules: save every file with its licence page URL in `CREDITS.md` at download time. No YouTube/TikTok clips, no TV footage,
no Google Maps/Earth screenshots (their licence does not allow this), no Getty/Shutterstock previews.
No AI-generated "realistic photos" of real places or events. If we ever use an AI illustration (e.g. a "what if" scenario), it must look
clearly illustrated, and we tick the YouTube "altered or synthetic" box if it could be mistaken for real.
Note: the Pexels key behind our proxy returned "Invalid API key" on 12 Nov 2026 — download from pexels.com by hand or fix the key.

### Our graphics kit (new, small): `whyhow/atlaskit/`
Built with node-canvas like our other kits (`tests/mcd_collage/kit.js` primitives, fonts from `lib/fonts.js`) — or Remotion if we decide so; one decision for all films.
- **Map flight**: globe → country → city (Natural Earth + Sentinel tile), a pin with coordinates tag.
- **Cross-section**: ground cut open (active layer brown, permafrost blue, ice lenses), building on piles, heat arrows, animated thaw.
- **Counter / badge**: temperatures, depths, years, tons — big, with a short tick sound.
- **Chart**: line/bar from real data (e.g. bearing capacity drop), always with a source line under it.
- **Photo move**: Ken Burns on Commons photos, gentle parallax (split into 2 layers when the photo allows).
- **Chapter card**: number + mini-question ("2. What is permafrost, really?") on ice-blue.
- Look: dark navy maps, ice-blue `#4D8DFF`, yellow highlights `#FFC857`, cream type, Anton/Inter fonts (OFL).

## 3. Edit and sound
- Shot list `shots.json`: per paragraph — visual type, source file, camera move, on-screen text. New visual every 4–8 s (calmer than Shorts).
- Music: a calm ambient bed, free licence (YouTube Audio Library "no attribution" tracks, or Pixabay Music), −24…−20 LUFS under voice, ducked.
  Change the mood per chapter (wind/arctic ambience, tension for the failure part).
- SFX: wind, creaking ice, low hits on the big numbers — quiet.
- Final mix −14 LUFS integrated, true peak ≤ −1 dBTP (our standard).
- Render 1920×1080 30 fps H.264 (CRF 18) + AAC 192k.
- Subtitles: `python3 dubtools/make_srt.py SCRIPT_EN.csv voice/ subtitles_en.srt` (re-timed to the final edit) — upload as SRT, no burned-in subtitles in long videos.
- Chapters in the description (timestamps from the voice timings).
- Quality check (from CHANNEL.md, adapted): contact sheet every 10 s, blackdetect = 0, ebur128, STT = script, every on-screen number = SOURCES.md.

## 4. Thumbnail + upload kit
- Cutaway thumbnail (02_channel_concept.md): 2 versions for YouTube "Test & compare".
- `upload_kit.md`: title, 2 alternative titles, description (hook 2 lines → chapters → sources → credits → AI-voice note), 3 lowercase hashtags, tags, pinned comment question.
- One 45–60 s Short (9:16) cut from the strongest part, ending with "Full documentary on the channel".

## 5. Time budget per film (after the kit exists)
Research + script 4–6 h · voice 30 min · visuals collection 2–3 h · graphics/edit 4–6 h · thumbnail + kit 1 h → **~2 films per week** is realistic and safe.
First film: +1–2 days to build `atlaskit`.
