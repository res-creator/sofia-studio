# Collage documentary starter

Read `README.md` fully before doing anything — section "ДЛЯ CLAUDE" is your operating manual.
If the user writes "делай" (optionally with a topic), execute the whole pipeline from README.md yourself: facts → script → voice → storyboard → scenes → stills → one full render → MP4 checks → short report.
Also read `skill/vizavi-motion/SKILL.md` (+ references) unless a vizavi-motion skill is already installed. The user's brief beats skill defaults (here: 1080x1920, 30 fps).
Never write API keys into code, git or chat: ElevenLabs keys only via env var ELEVEN_API_KEYS. Max 2 ElevenLabs requests at once.
Reuse kit.js and engine.js; a new video is a copy of example/ with a new script and scenes.
