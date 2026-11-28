# Style lab: one scene, four visual languages (shared brief)

The owner of the Russian science-pop YouTube channel «Мысленный эксперимент» is looking for ONE visual language she can use
for dozens of very different episodes (geography, science, history, strange phenomena, experiments). We make four short
animated clips of the SAME scene, each in a completely different style, so she can compare. These are finished video
clips, not concept descriptions.

## The scene (same in every clip, 12–15 s)
Topic: «Почему Гренландия на картах кажется размером с Африку, хотя на самом деле Африка больше в 14 раз?»
1. A world map appears (Mercator projection, the familiar school map).
2. The camera moves in towards Greenland and Africa.
3. Greenland looks huge, about as big as Africa.
4. The map transforms to show the real proportions of the two (e.g. morph to an equal-area projection, or Greenland is
   lifted off and slid down to the equator, shrinking as it travels, and set next to/inside Africa).
5. The viewer clearly understands the difference (Africa ≈ 30.4 million km², Greenland ≈ 2.17 million km², ≈ 14×).
   A tiny amount of on-screen text is fine (Russian only, e.g. «Гренландия», «Африка», «×14»), but the picture must
   explain it by itself.

## Hard requirements
- 1920×1080, 16:9, 30 fps (60 fps if cheap), H.264 mp4, 12–15 s. Optional subtle sound design (soft whoosh / tick /
  ambient bed, generated in code or numpy; no copyrighted music); silent is acceptable.
- Real geography: real coastlines (Natural Earth 110m/50m; geojson is available e.g. at
  https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json or johan/world.geo.json, also used in
  /home/user/sofia-studio/ru_geo/lemo/cs_brief_1/scenes/geo.py) and correct projection maths (Mercator and an
  equal-area projection such as Equal Earth / Mollweide). Greenland's shrink must be mathematically true.
- Professional animation: smooth camera with eased moves (no linear robot moves), motion that overlaps and settles,
  good transitions, a deliberate palette (3–5 colours), interesting compositions. Real animation, NOT a slide show of
  pictures.
- No AI-generated images, no typical "AI look": no excessive glow/bloom, no random decorative details, no cheap 3D
  (no default materials, no plastic shading, no flat ambient-only lighting). No cartoon characters copied from any
  existing channel or brand; the look must be original.
- Russian text only, Cyrillic fonts that really contain the glyphs (no tofu). Bottom ~120 px: keep important things out.
- Licences: only our own drawing/code, public-domain or clearly free imagery (NASA, Natural Earth, Sentinel-2
  cloudless 2016 by EOX CC BY 4.0, Wikimedia Commons PD/CC). Write a CREDITS file.

## Tools available
Node + Playwright Chromium (require('playwright') works anywhere; launch with no options), ffmpeg, python3 with numpy,
PIL, scipy, skimage. three.js and d3-geo can be loaded from cdn.jsdelivr.net or installed with npm in your folder.
Render frame by frame (deterministic time, not real-time capture), then encode with ffmpeg.
The Lemo-Opuscar style library at /root/lemo-opuscar/styles/<name>/ (STYLE.md, DEMO.md, demo code) has many tested
looks and a frame-exact renderer in /root/lemo-opuscar/core/render (see existing projects under
/home/user/sofia-studio/ru_geo/lemo/ for how they are used). Use it for inspiration and code, but the clip must be a
polished, original piece in your assigned direction, not a copy of a demo.

## Practical
- Container restarts can kill background processes: launch long renders with `setsid nohup … &`, poll with
  `timeout 110 bash -c 'until …'`, keep each Bash call under 2 minutes, make renders resumable.
- 4 CPUs shared by 4 agents: render with one worker. Disk is tight (~6 GB free): delete frames after encoding.
- Your folder gets a .gitignore with frames/, out/frames/, node_modules/, raw/. Do NOT commit or push git.
- Before finishing, look at ~10 stills across the clip yourself and fix anything ugly (aliasing, jitter, cut text,
  muddy colours, empty compositions). Quality matters more than speed: iterate on the look first with single stills,
  then render.
- Final report: mp4 path, duration, a 5–8 line description of the look (palette, type, motion), what makes it reusable
  for other topics (history, science, experiments), stills paths, credits, problems left.
