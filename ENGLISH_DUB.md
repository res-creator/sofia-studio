# English dubs of the travel documentaries — workflow (read first)

Owner's boyfriend makes Russian travel documentaries (INDIA, NORWAY, VIETNAM, more later) for his channel.
The owner publishes ENGLISH versions on her channel. His team delivers a kit per film; our only job is the English voice + mix.

## Where the kits are (Google Drive, shared with the owner's connected account)
- INDIA: unpacked from ИНДИЯ.zip, owner lulusfoxyshow@gmail.com. PICTURE_EN_4K.mp4 (7.3 GB) is NOT on Drive (no space).
- НОРВЕГИЯ folder (owner wespeakengtogether@gmail.com): full kit except the picture (4.8 GB, 36:05, 140 paragraphs F001–F140).
- VOICE_ADDON (1) folder: ALL_INSTRUCTIONS_FOR_YOUR_AI.md/.pdf (master instructions for all 3 films + full scripts),
  kokoro_voice.py, master_voice.py, onset_check.py, sample Kokoro_Puck_man_US.mp3.
- ВЬЕТНАМ: described in ALL_INSTRUCTIONS (29:33, 109 paragraphs), folder not found on Drive yet.
- "Google AI Studio" folder: old unrelated prompts/videos (Lulu and Mimi), ignore.

## Voice (decided by the kit owners)
Kokoro TTS (free, Apache 2.0, OK for monetised channel), voice am_puck, US English, speed 1.05, lang en-us.
Runs in the cloud session: `pip install kokoro-onnx soundfile scipy numpy`, models from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 (kokoro-v1.0.onnx, voices-v1.0.bin). Tested: works.
No ElevenLabs needed for these films.

## Pipeline per film
1. kokoro_voice.py → voice_raw/<id>.wav (one take per paragraph, must fit max_duration_s; auto speed-up to 1.12).
2. master_voice.py (MANDATORY) → voice/<id>.wav, -16 LUFS each.
3. onset_check.py → regenerate flagged ids with `kokoro_voice.py --lead <ids> --ids <ids>`, master again.
4. place_voice.py → needs MUSIC_AND_EFFECTS.wav + PICTURE_EN_4K.mp4 → FINAL_EN_4K.mp4 (-14 LUFS, TP ≤ -1 dBTP).

## Split of work (big files can't reach the cloud: Drive tool returns text only, GitHub max 100 MB/file)
- Cloud session: steps 1–3, push voice/ as MP3/FLAC to the repo (`<film>/voice/`).
- Owner's computer (Claude Code in a local folder with picture + music): git pull, run place_voice.py, watch, upload.

## YouTube
Use titles/description/tags from each kit README. Keep the CREDITS block (licences require it) and
"Narration created with AI. Facts checked against sources." Subtitles: re-time SUBTITLES_EN.srt to the final voice.
Each film's last paragraph teases the next film (India→Norway, Norway→Vietnam); keep only if that film follows on her channel.
