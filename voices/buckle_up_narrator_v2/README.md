# Buckle Up narrator v2 (English) — the owner's OWN voice, Fish Audio clone

- `ref.mp3` — 1:56 emotional English sample, ElevenLabs eleven_v3, voice "How its run Narrator" (id Pb6268JrNuO3oSgFg2Io),
  designed by the owner in ElevenLabs Voice Design (warm American male, late 30s, baritone). Not a real person's voice.
- `ref_text.txt` — exact words spoken in ref.mp3 (no tags).
- Use THIS voice for all new English films (from 2026-11-26). The old `voices/buckle_up_narrator/` was the boyfriend's voice.
## How to voice with it (any Claude session in this repo)
```
pip install ormsgpack numpy soundfile scipy
python3 dubtools/fish_voice.py --ref voices/buckle_up_narrator_v2/ref.mp3 \
  --ref-text voices/buckle_up_narrator_v2/ref_text.txt \
  --csv <film>/SCRIPT_EN.csv --out <work>/voice_raw --model s2.1-pro-free [--ids F001 F002]
python3 dubtools/master_voice.py <work>/voice_raw <work>/voice   # mandatory mastering
python3 dubtools/onset_check.py <work>/voice                    # regen flagged ids once with --ids
```
- Cloud session: the proxy injects the Fish Audio key (api.fish.audio), set `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`.
- Own computer: key in `~/fish_audio_key.txt` (see FISH_VOICE.md). Never put the key in the repo or chat.
- Emotion: first `[tag]` of `delivery_notes` is sent as a cue. Never speed up; shorten text if a line is longer than max_duration_s.
- One voice for the whole film; test 5 paragraphs first.
- Note: Fish Audio's free model is meant for non-commercial use (their terms).
