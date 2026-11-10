# Editing-style test C — "fast deadpan" (pacing/humor of fast explainer channels; techniques only, no branding)
16:9 1920x1080, 30 fps, ~39 s. Story: Gregor MacGregor / Poyais (facts from poyais_ep29/facts.md; jokes sit on top of true facts).
Voice: free local TTS (Kokoro am_michael, speed 1.22) — no ElevenLabs credits. Word timings: faster-whisper.
Pipeline: `python3 tts.py` → `python3 mix.py` → `node render.js _video.mp4` → `sh ../../../howitsrun_style/master.sh mix.wav _video.mp4 test_c_fast_deadpan.mp4 <T>`.
Preview stills: `node render.js still 1,2,3 out.png`.

Techniques used:
- 22 cuts in 39 s (a new visual every ~1–1.7 s); flat bright colour backgrounds (yellow/teal/coral/navy) with a dot grid.
- Archive images as white-bordered cut-outs that slide in with overshoot (portrait, Poyais dollar note, 1822 Black River engraving).
- Pop-up sticker labels for asides: "(not a real country)", "say it: poy-EYE-iss", "still not real", "source: math", "nice.", "(Scottish)", "retirement plan".
- Zoom punches (whole-frame 7% kick) on 8 punchlines.
- Counter gag (0 → 355 pages) and bar-chart gag (guidebook pages 355 vs. actual country 0).
- Rubber stamps: VERY REAL PAPER / VERY FAKE MONEY, ACQUITTED, APPROVED.
- Freeze-frame + desaturate + "*record scratch*" + music hard stop ("NO PRINCESS.").
- Hard cut to a plain black card for a deadpan beat ("Also: no country.") and an end card ("Tough break.").
- Map with an animated dashed route and silly labels ("definitely a country →", "POYAIS (allegedly)").
- Split screen EXPECTATION (1822 engraving) vs. REALITY (flat jungle).
- Serious beat handled straight: navy card, music off, figures fade 250 → 48, "FEWER THAN 50 MADE IT HOME".
- Music: synthesized bouncy plucked bed (116 BPM), ducked under the voice, hard stops on gags. SFX: pops on cuts, clicks on labels, stamp thuds, record scratch, whoosh.
