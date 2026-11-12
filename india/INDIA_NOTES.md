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
1. Voice: Kokoro am_puck, speed 1.05 (see ../ENGLISH_DUB.md). Sample of p001–p003: india/sample_p001-p003.mp3 (all fit max).
   Mastered sample at real film timing 0:00–1:02 (p001–p006): india/sample_mastered_0-62s.mp3. Mastering script: dubtools/master_voice.py.
2. One file per paragraph: voice/p001.mp3 ... p151.mp3. Each must be shorter than max_duration_s (speed up to 1.05–1.10 max, else shorten text; also edit subtitles).
3. Listen to first 3 paragraphs before generating the rest.
4. Mixing needs MUSIC_AND_EFFECTS.wav + picture, which the assistant cannot download (Drive tool returns text only). So the owner runs place_voice.py on her own computer with voice/ folder, SCRIPT_EN.csv, the wav and the mp4 in one folder (python3 + numpy + ffmpeg). Result: FINAL_EN_4K.mp4, target -14 LUFS, peak <= -1 dBTP.
5. Upload: titles, description (credits are legally required, keep "Narration created with AI" line), tags, SRT re-timed to final voice. See README on Drive. Drop the Norway tease in p151 if Norway won't follow on her channel.

## Rules
- Keys only via env var / proxy; max 2 ElevenLabs requests at once.
- Answer the owner in Russian, simply.

## Status (voice DONE in cloud)
- india/voice/p001–p151.mp3: Kokoro am_puck 1.05, all fit max_duration_s at speed 1.05, mastered with dubtools/master_voice.py (-16 LUFS each).
- onset_check flags p061 p075 p101 p143 even after a lead-in retake (dubtools/kokoro_takes.py --lead); listen to them in the final film.
- NEXT (owner's computer, folder with PICTURE_EN_4K.mp4 + MUSIC_AND_EFFECTS.wav): copy india/voice/, india/SCRIPT_EN.csv, india/place_voice.py next to them, `python3 place_voice.py` → FINAL_EN_4K.mp4.

## Status 2026-11-11: FILM BUILT
- Owner's computer: Desktop/India/FINAL_EN_4K.mp4 (7.8 GB, 53:07), mix -14.1 LUFS, TP -1.5 dBFS, all 151 fit.
- Subtitles re-timed to the real voice: india/SUBTITLES_EN.srt (dubtools/make_srt.py). Upload kit: india/upload_kit.txt.
- Left: owner watches the film (p061 p075 p101 p143 starts), uploads to YouTube. Intermediate WAVs in Desktop/India can be deleted after the check.
