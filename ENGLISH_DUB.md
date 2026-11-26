# English dubs of the travel documentaries — workflow (read first)

Owner's boyfriend makes Russian travel documentaries (INDIA, NORWAY, VIETNAM, more later) for his channel.
The owner publishes ENGLISH versions on her channel. His team delivers a kit per film; our only job is the English voice + mix.

## Where the kits are (Google Drive, shared with the owner's connected account)
- INDIA: unpacked from ИНДИЯ.zip, owner lulusfoxyshow@gmail.com. PICTURE_EN_4K.mp4 (7.3 GB) is NOT on Drive (no space).
- НОРВЕГИЯ folder (owner wespeakengtogether@gmail.com): full kit except the picture (4.8 GB, 36:05, 140 paragraphs F001–F140).
  Norway voice, subtitles, cover, upload kit DONE: see norway/NORWAY_NOTES.md.
- VOICE_ADDON (1) folder: ALL_INSTRUCTIONS_FOR_YOUR_AI.md/.pdf (master instructions for all 3 films + full scripts),
  kokoro_voice.py, master_voice.py, onset_check.py, sample Kokoro_Puck_man_US.mp3.
- JAPAN (folder shared by link, archive mislabeled КИТАЙ): DONE — see japan/JAPAN_NOTES.md.
- ВЬЕТНАМ folder on Drive (added later): voice, subtitles, cover, upload kit DONE — see vietnam/VIETNAM_NOTES.md.
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

## New voice test (2026-11-23)
Owner's boyfriend made an emotional English sample in ElevenLabs (eleven_v3, his own voice design), 1:46. Cloned zero-shot in Fish Audio
(reference audio sent with each request, dubtools/fish_tts.py; model s2.1-pro-free, because creating a saved model / paid models need API credit).
Delivery-note tags from SCRIPT_EN.csv are passed as [tag] at the start of each line. Probe: japan/sample_fish_voice_0-60s.mp3 (F001–F008, all fit max).
Voice files saved in repo: voices/buckle_up_narrator/ (ref.mp3, ref_text.txt, README.md).
Open: rights (ElevenLabs ToS on using output to clone elsewhere; Fish free-model terms for monetised use) — owner/boyfriend to confirm.
Fish Audio facts (official pages, 2026-11-23): s2.1-pro-free = $0, same quality as s2.1-pro, "fair use", BUT free use is personal/non-commercial only
(terms + plan FAQ). Paid API s2.1-pro $15 / 1M UTF-8 bytes (≈ $1 per 50-min English film). For monetised channel use paid API. Guide: FISH_VOICE.md, script dubtools/fish_voice.py.
- 2026-11-26: owner's own designed voice saved: voices/buckle_up_narrator_v2/ (use for new films). Probe: japan/sample_new_narrator_0-60s.mp3.
