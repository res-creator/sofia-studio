# Brief: building_height in the Engineering Briefing Board style (shared by all chapter agents)

Channel «Мысленный эксперимент» (Russian YouTube). The owner approved the style of
/home/user/sofia-studio/ru_geo/building_height/video/trial_styles_brief.mp4: Engineering Briefing Board for
the board parts, plus a 3D map clip and an Archive Light Table clip in a few places. You make ONE chapter range of
the board film. Others make the other ranges at the same time; do not touch their folders.

## Reference implementation (read it fully before starting)
- /home/user/sofia-studio/ru_geo/lemo/bh_brief/ : the approved board film for film time 0–85.3 s.
  scenes/_gen_film.py generates scenes/film.json (the whole film as data); kit/board.js is the renderer (Canvas 2D,
  Cyrillic fonts, rolling numbers, typewriter cards); tools/frames.mjs + tools/render.sh = resumable render + encode;
  tools/rescheck.mjs (photo resolution rule), tools/bandcheck.mjs (subtitle band / edge check); kit/objects/ = cut-outs
  and prints with .json metadata; tools/cut/cut_burj.py = how a cut-out is made.
- Style rules: /root/lemo-opuscar/styles/briefing-board/STYLE.md (and DEMO.md).
- Narration with exact times: /home/user/sofia-studio/ru_geo/building_height/film.json → segs (kind voice: t, dur,
  text, captions [[start,end,text],…]; kind chapter: t, title). Times are FILM seconds. The full script with sources is
  /home/user/sofia-studio/ru_geo/building_height/SCRIPT.md.
- Photos available (licences in /home/user/sofia-studio/ru_geo/building_height/archive/credits.json):
  archive/img/ph_burj.jpg, ph_burj2.jpg, ph_jeddah88.jpg, ph_damper.jpg, ph_damper2.jpg, ph_taipei.jpg, ph_wright.jpg,
  ph_tsiolkovsky.jpg, ph_otis.jpg (all 1920×1080 copies). Our own drawn diagrams bh_*.jpg are NOT to be pasted in;
  redraw their idea with marker ink. You may fetch a larger original of a photo from its Commons page (see "page" in
  credits.json; one polite request with a User-Agent, Wikimedia often answers 429; then use the local copy and respect
  the 1 source px per screen px rule). Never use generated images, never stock, never invent photos.

## What to build
1. Copy bh_brief to your own folder (name given in your task), keep kit/ and tools/, write a new scenes/_gen_film.py
   for YOUR film-time range. The renderer works in local time; map film time → local time with an offset
   (local = film − range start) and say so at the top of your generator.
2. Every voice paragraph in your range gets marker work that matches what is said at that moment (a picture for every
   sentence: drawings, numbers that roll, tags, magnets, ruler, prints/cut-outs where a real object is named).
   Ink meanings: graphite = names/rules/facts, blue = measurement and numbers, red = only the decision/the break.
3. Each chapter starts with a typewriter card on black (monospace Cyrillic, letter by letter, red block cursor),
   like «ТРОС» in the reference: the chapter title from film.json, typed from chapter t+0.05 to t+0.80, held to t+1.0.
4. The camera rides the wall; at the end of each chapter, if there is time, a short pull-back that shows the
   chapter's part of the wall as a whole.
5. Keep the bottom 250 px free of drawing and text (subtitles are burned in later). No text cut by the frame edge
   while the camera rests. All on-screen words in Russian; no tofu.
6. Facts on screen must be correct even where the narration is loose: Burj Khalifa 828 м is the height WITH the spire
   (write «828 м (со шпилем)» when you show it); geostationary orbit ≈ 35 800 км (write «≈ 35 800 км»).
   Do not add facts the narration does not say.
7. Render 1920×1080, 30 fps, silent, exactly your range length. Use ONE render worker (four agents share 4 CPUs).
   Output: /home/user/sofia-studio/ru_geo/building_height/video/parts/<your file name>.mp4 and events JSON at
   <your folder>/events.json in the same format as the reference ({dur, ev:[{t,type,dur}]}, local time).
8. Before finishing: ~12 stills across your range from the final mp4, look at them, fix problems
   (overlaps, cut text, text in the subtitle band, picture not matching the words). Delete your out/frames after
   encoding. Do not commit or push git.

## Practical
The container restarts about every 30 minutes and kills background processes: launch renders with
`setsid nohup … &`, poll with `timeout 110` loops, keep every Bash call under 2 minutes, restart killed renders
(frames.mjs is resumable). Disk is limited (~3.5 GB shared): delete temporary frames.
Final report: file paths, exact duration, what each paragraph shows (one line each), problems left, stills paths.
