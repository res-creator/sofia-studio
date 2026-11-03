# Deepwater Horizon — sources, archive and remaining limitations

Film: `final/dwh_full_film.mp4` (opening + 9 chapters). Narration and testimony text: `final/dwh_narration_script.md`. Captions: `final/dwh_full_film.srt`. Full fact sheet with page references: `research/facts.md`. Materials log: `research/materials.md`.

## Documents (facts and on-screen pages)
- National Commission on the BP Deepwater Horizon Oil Spill and Offshore Drilling, *Deep Water: The Gulf Oil Disaster and the Future of Offshore Drilling*, report to the President (Jan 2011). Pages shown on screen: p. vii (series of mistakes), p. 2 (Morel's "nightmare well" email), p. 4 (cement evaluation team sent home), p. 107 (the "bladder effect", per both well site leaders' statements), p. 109 (opening: "key error"), p. 119 (no standard procedure; "the pressure data were not ambiguous"), p. 124 (North Sea near miss; advisory never reached the crew, according to Transocean). Also used: pp. 7–17, 102–115.
- National Commission, *Macondo: The Gulf Oil Disaster*, Chief Counsel's Report (Feb 2011): timeline 8:50–9:49 p.m., signals, monitoring.
- U.S. Chemical Safety Board, Macondo Investigation Report, Vols. 1–4 (2014, 2016) and Executive Summary (2016): drill pipe buckling, deadman, control pod wiring faults, mud-gas separator.
- USCG / BOEMRE Joint Investigation Team, Report Vol. I (USCG, 2011) and Vol. II (BOEMRE, 2011), incl. the DNV forensic examination summary: rescue timeline, people on board, BOP closure on April 22 (autoshear), general alarm delay, names and positions.
- U.S. District Court, E.D. Louisiana, MDL 2179, Phase One Findings of Fact and Conclusions of Law (Sept 4, 2014): "bladder effect" not known to exist; BP grossly negligent; Phase Two findings (Jan 2015): 3.19 million barrels discharged.
- U.S. Department of Justice and U.S. EPA (BP and Transocean pleas, 2012–2013); Federal Register 81 FR 25888 (Well Control Rule, 2016).

## Archive (all public domain)
- U.S. Coast Guard via DVIDS: Joint Investigation hearing, July 23, 2010, parts 1–3 (DVIDS 91190, 91191, 91195) — Mike Williams's testimony and the hearing-room pictures; night fire footage (315074, 315070); daytime fire (83700); rescue hoist (315069); medevac at Air Station New Orleans (315068); patrol boat search (315076); hearing photos by PO2 Thomas Blue (1095905 Chris Pleasant, 1095923 Chris Haire, 1095928 Randy Ezell, 1095937 Micah Sandell); Development Driller III by PO3 Patrick Kelley (1095288); debris after the sinking (272213); Discoverer Inspiration (1096998); the recovered blowout preventer by PO1 Thomas M. Blue (1098147).
- U.S. Navy via DVIDS: controlled burn, May 7, 2010, MC1 Jeffery Tilghman Williams (85187).
- NASA Earth Observatory / MODIS Rapid Response Team: oil slick, May 17, 2010.
- Map data: Natural Earth (public domain).
- Music: Mixkit Stock Music Free License — "Silent Descent", "Opalescent", "Vertigo" (Eugenio Mininni).
- Narration: AI voice (ElevenLabs). Schematics of the well and of the blowout preventer: our own reconstructions, labelled on screen, simplified and not to scale.

Not used on purpose: BP's ROV video (BP copyright), TV news, the 2016 feature film, the CSB animation (no rights statement; it contains BP ROV footage), wire-service photos (AP/Getty).

## How the file was checked (honestly)
- Every narration line and every testimony cut: speech-to-text (scribe_v1) against the script (`research/stt_check_film.json`, `research/stt_check_opening.json`). Differences were only number formatting and the spelling of names. Testimony cuts start and end on whole words.
- Stills of the rendered film: contact sheets every 10 s before the final render, and every 10 s of the final file (see the delivery notes).
- Loudness and black-frame detection on the final file (ffmpeg ebur128 / blackdetect). The black passages are intentional (under Williams's account of the explosion and of the water).
- This is not a full viewing or listening. Pacing, the voice transitions and the emotional weight of the testimony still need a human editorial review.

## Remaining limitations
- **No public-domain image of the Deepwater Horizon before April 20.** The film opens chapter 1 with a sister rig at the site (labelled), then the schematic.
- **No pictures of the moment itself** (the explosions, the lifeboats, the jump). Williams's account plays over stills of him at the hearing and over black. The night fire footage was filmed after 11 p.m. and is labelled so.
- **No public-domain photos** of Bob Kaluza, Don Vidrine, Jason Anderson, Dewey Revette, Andrea Fleytas, Capt. Alwin Landry or the Damon B. Bankston. They are named over a roster card or a quote card.
- **The Williams stills** come from one 60-second shot of the hearing video (SD, 640×360), so they are soft. They are used five times with different crops.
- **Contested points are stated as contested or rounded:** the time of the decision (7:45 or 8 p.m. → "around eight"); the first explosion (9:48–9:50 → "about 9:49"); who proposed the "bladder effect" (the court questioned whether it came from Anderson); whether and when the deadman fired (CSB vs DNV/JIT, both given); the general alarm time ("minutes after the first gas alarms"); the volume (4.9 million barrels, government, vs 3.19 million discharged, court).
- **The rescue boat that picked up Williams**: the film says it came from the Bankston, per the Commission (p. 12). Williams himself describes only "a small orange rescue craft".
- **The survivor hoisted in DVIDS 315069** is from "a support vessel"; the Coast Guard does not name it (likely the Bankston). The label says so.
- **SRT:** the testimony lines come from speech-to-text and may contain small transcription errors (checked only where cut). "Lyman Wheeler" in the source STT is corrected to "Wyman Wheeler" (not used in the film).
- **Length:** about 15 minutes. Chapters 1–4 (about 4½ min) rely on the schematic, documents and hearing photos, because the owner asked for the test details in the main film. If that part feels slow, the first cut candidates are: the Morel email (b03), the North Sea near miss (b18), and the "what followed" card (b48–b49).
