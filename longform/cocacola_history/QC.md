# Quality report — "How Coca-Cola Took Over the World in 10 Minutes" (Nov 5, 2026)

| Check | Result |
|---|---|
| Length | 9:21 (560.8 s) — target 9–11 min ✔ (8 parts, 7 chapter cards, 5 s end card) |
| Format | 1920x1080, 30 fps, H.264 + AAC ✔ |
| Loudness | −14.0 LUFS integrated, true peak −1.0 dBFS ✔ (master.sh + measured gain) |
| Black frames | 0 (blackdetect ≥ 0.3 s) ✔ |
| Sound at 0.0 s | yes (bottle pop + fizz), first 0.3 s max −3.1 dB ✔ |
| Voice sync | every scene, plate and sound cue is cut on word timings from the voice alignment; STT check (ElevenLabs scribe) vs. script: match 0.989, every number/date heard correctly (1886, May 8th, 1891, $2,300, 1894–1913, 1895, 1899, 1915, 1919, $25 million, 1931, 1941, 64, 1898, 12 oz / 6.5 oz, 1971, 1975, ≈200,000, April 23rd 1985, 99-year-old, 1,500, July 11th, 79 days, 31,000+, 33 billion, 200+, 2024, $47 billion, 2.2 billion) ✔ |
| Visual density | 171 illustrated scenes + 7 chapter cards; average scene 3.0–3.8 s per chapter; camera always moving; contact sheet every 4 s of the final film checked frame by frame, every chapter also checked every 1 s by its animator ✔ |
| Characters | one model per real person (Pemberton, Candler, Robinson, Woodruff) via `kit/toon.js` LOOKS; everyone alive/recent is generic ✔ |
| Text on screen | dates/sums/key words as plates, nothing cut at the frame edge in the checked frames; no burned-in subtitle band (full SRT: 172 cues) ✔ |
| Brands | names in plain type only, no logo copies; disclaimer in the description ✔ |
| Facts | every claim mapped in `sources.md`; disputed points worded carefully ("by the usual count", "reportedly", "by its own later estimate", "by most accounts") ✔ |

## Known limitations (honest list)
1. **Temporary voice.** The narration is Kokoro-82M (`am_michael`, Apache-2.0), not the channel voice Chris: the ElevenLabs Starter plan had ~1,200 of 30,000 characters left (resets Nov 29, 2026); the film needs ~7,500.
   Swap: `ELEVEN_API_KEYS=proxy python3 vo_chris.py && sh build_all.sh` — the whole film re-times itself automatically. Kokoro sounds clean but less expressive than Chris.
2. **Illustrations are drawn in code** (our long-form kit: vector characters, textured sets, parallax, camera). No AI image generator was used: the only connected one (ElevenLabs) shares the empty quota, and code-drawn layers keep the characters consistent and animatable. The worlds are detailed but flatter than hand-painted backgrounds.
3. **Music is synthesized** (ours): ragtime / march / pop / tension moods on one bar grid, quiet under the voice. No third-party music.
4. **GitHub copy is compressed** (two-pass ≈1.15 Mbit/s video) to fit GitHub's 100 MB limit. A full-quality master (≈400 MB, CRF 18) is rebuilt by `python3 assemble.py`; upload that one to YouTube if possible.
5. A few scenes are under 2 s where the voice line is very short (sugar avalanche, "lights out", the $1 bill) — intentional quick cuts.
