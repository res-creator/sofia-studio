# zhanna_scifi — trial in the Sci-Fi Sitcom Toon style (no portal)
python3 voice/gen.py → python3 prep.py → python3 voice/words.py → python3 prep.py → node render.mjs textaudit → node render.mjs clip 0 10 out/p0.mp4 & clip 10 30 out/p1.mp4 → concat + out/audio.wav → final/.
`node render.mjs still 1,5 | srt | cover | info`. Engine lib/ is MIT (Lemo-Opuscar), see lib/NOTICE.md.
