# Figma pilot — 30 s of chapter 3 ("The One-Dollar Deal") in AI-illustrated style

Result: `../figma_pilot_30s.mp4` (1920x1080, 30 fps, 31.6 s, −14 LUFS). Existing chapter-3 voice (no new TTS), kit SFX, the film's music bars.

| Folder / file | What |
|---|---|
| `art/` | 7 originals generated in Figma AI (gpt-image-2.5-sunburst), Figma file "How It's Run — Coca-Cola thumbnail": 01 office wide (with people), 02 empty office, 03 Candler pose sheet (green screen), 04 lawyers pose sheet (green screen), 05 props sheet (green screen), 06 drawer, 07 empire panorama |
| `layers/` | sprites keyed from the green-screen sheets (`tools/chroma.py`): Candler ×3 poses, Thomas ×2, Whitehead ×2, dollar, contract, quill, foaming bottle, foam drop, glass, inkwell |
| `tools/` | `chroma.py` (green-screen key → sprites), `cutout.py` (GrabCut test — not usable for clean cut-outs) |
| `pilot.js` | the edit: shots on word timings, camera/parallax, sprite animation, particles, transitions (`node pilot.js still|frame|video`) |
| `mix_pilot.py` | sound: voice + SFX + music, then `howitsrun_style/master.sh` |
| `frames/` | full-size control frames |

Rebuild: `python3 -c` upscale step → `hi/` (see git history), `node pilot.js video _video.mp4 && python3 mix_pilot.py && sh ../../../howitsrun_style/master.sh _mix.wav _video.mp4 ../figma_pilot_30s.mp4 31.64`
