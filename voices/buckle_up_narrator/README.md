# Buckle Up narrator voice (English) — Fish Audio clone

- `ref.mp3` — 1:46 emotional English sample (made by the owner's boyfriend in ElevenLabs v3, his voice design).
- `ref_text.txt` — exact words spoken in ref.mp3 (no tags).
- Used for: Japan (2026-11-23) and all next English films.

## How to voice with it (any Claude session in this repo)
```
pip install ormsgpack numpy soundfile scipy
python3 dubtools/fish_voice.py --ref voices/buckle_up_narrator/ref.mp3 \
  --ref-text voices/buckle_up_narrator/ref_text.txt \
  --csv <film>/SCRIPT_EN.csv --out <work>/voice_raw --model s2.1-pro-free [--ids F001 F002]
python3 dubtools/master_voice.py <work>/voice_raw <work>/voice   # mandatory mastering
python3 dubtools/onset_check.py <work>/voice                    # regen flagged ids once with --ids
```
- Cloud session: the proxy injects the Fish Audio key (api.fish.audio), set `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`.
- Own computer: key in `~/fish_audio_key.txt` (see FISH_VOICE.md). Never put the key in the repo or chat.
- Emotion: first `[tag]` of `delivery_notes` is sent as a cue. Never speed up; shorten text if a line is longer than max_duration_s.
- One voice for the whole film; test 5 paragraphs first.
- Note: Fish Audio's free model is meant for non-commercial use (their terms).
