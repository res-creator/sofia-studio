# INDIA (English dub) — notes for the next session

## What this is
Documentary "INDIA / AS IT IS", 53:07, 4K. Boyfriend's channel publishes the Russian version.
Owner (lulusfoxys / taneasirbu08) makes the ENGLISH version for her own channel.
Source kit came from boyfriend's Drive (account lulusfoxyshow@gmail.com), file ИНДИЯ.zip (9 GB), unpacked into a Drive folder.
His kit includes README_FOR_YOUR_AI.md (full instructions, YouTube texts) — the plan below follows it.

## Kit files (on Drive, owner lulusfoxyshow@gmail.com)
SCRIPT_EN.md/.csv (151 paragraphs p001–p151, 7461 words), SUBTITLES_EN.srt, COVER_EN.jpg,
YOUTUBE_DESCRIPTION_EN.txt, CREDITS_FULL_EN.md, place_voice.py, mix_and_mux.sh,
MUSIC_AND_EFFECTS.wav (875 MB), VOICE_GUIDE_RU.wav (875 MB), PICTURE_EN_4K.mp4 (7.3 GB, NOT uploaded by owner: no Drive space).
Saved here: india/SCRIPT_EN.csv (columns id, chapter, start_s, max_duration_s, english_narration, delivery_notes, ...).

## Plan
1. One calm warm adult narrator voice, same settings for all paragraphs (ElevenLabs v3; delivery_notes tags like [warm] may go at start of text; never read notes aloud).
2. One file per paragraph: voice/p001.mp3 ... p151.mp3. Each must be shorter than max_duration_s (speed up to 1.05–1.10 max, else shorten text; also edit subtitles).
3. Listen to first 3 paragraphs before generating the rest.
4. Mixing needs MUSIC_AND_EFFECTS.wav + picture, which the assistant cannot download (Drive tool returns text only). So the owner runs place_voice.py on her own computer with voice/ folder, SCRIPT_EN.csv, the wav and the mp4 in one folder (python3 + numpy + ffmpeg). Result: FINAL_EN_4K.mp4, target -14 LUFS, peak <= -1 dBTP.
5. Upload: titles, description (credits are legally required, keep "Narration created with AI" line), tags, SRT re-timed to final voice. See README on Drive. Drop the Norway tease in p151 if Norway won't follow on her channel.

## Rules
- Keys only via env var / proxy; max 2 ElevenLabs requests at once.
- Answer the owner in Russian, simply.
