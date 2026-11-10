# Editing-style test B — "investigator" (techniques of online scam-investigation videos; no branding, intro, name or catchphrases copied)
16:9 1920x1080, 30 fps, 40.3 s, −14.0 LUFS. Story: Poyais (facts only from poyais_ep29/facts.md; archive images from poyais_ep29/archive/).
Voice: free local Kokoro TTS (am_onyx, speed 1.07) — no ElevenLabs. Word timings: faster-whisper. Pipeline: `python3 voice.py` → `node render.js cues` → `node render.js video _video.mp4` → `python3 mix.py` → `sh ../../../howitsrun_style/master.sh mix.wav _video.mp4 test_b_investigator.mp4 40.29`.

Techniques used
- Dark void "desk" with a soft spotlight, dust drifting in the beam, film grain, heavy vignette.
- Documents/photos as fake-3D perspective cards (strip-rendered trapezoids, yaw/pitch/roll, drop shadows, soft-light sheen), floating and tilting.
- Camera dolly / push-ins between cards and onto details (one global camera transform).
- "Screen-capture" zoom: dim everything, yellow highlight box wipes over the key text (£200,000 · 100 ACRES · £11 5s. · BANK OF POYAIS · Gregor Cazique of Poyais · St Joseph).
- EXHIBIT A/B/C tags (re-created bond and land certificate, the real Bank of Poyais note).
- Typed "case file" headers with a blinking cursor (+ typing clicks).
- Red-string connection board: exhibits → MacGregor portrait, strings draw on, pins.
- Timeline bar 1822 → 1823 → 1826 → 1845 with a playhead and a ghost year counter.
- RGB-split glitch transitions with slice offsets + blips; zoom punches with shake on key numbers; rubber-stamp hits.
- Final "VERDICT" card with ticked items, then "THE COUNTRY: FAKE. / THE MONEY: REAL."
- Sound: synthesized dark score (detuned saw drone, 8th-note pulse bass on one 96 BPM bar grid, boom + reverse-swell tension hits), whooshes, hits, glitch blips, typing, string snaps, ticks; music ducked under the voice.

Weak spots (honest)
- No real 3D: cards are flat planes with fake perspective; no depth of field / real lighting.
- Kokoro voice is clear but flatter than a human narrator; "MacGregor" is pronounced "Mack Gregor".
- No screen recordings / web pages / video clips (we have no licensed footage) — the original genre leans on those a lot.
- The timeline beat is mostly graphics (no photo behind it).
