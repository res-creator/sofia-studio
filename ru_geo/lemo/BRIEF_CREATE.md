# Brief: create_country in the Engineering Briefing Board style (shared by all chapter agents)

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
- Narration with exact times: /home/user/sofia-studio/ru_geo/create_country/film.json → segs (kind voice: t, dur,
  text, captions [[start,end,text],…]; kind chapter: t, title). Times are FILM seconds. The full script with sources is
  /home/user/sofia-studio/ru_geo/create_country/SCRIPT.md.
- The same style was already used for a whole film: building_height (ru_geo/lemo/bh_brief_B, bh_brief_CD, bh_brief_EF,
  bh_brief_G are chapter projects with their _gen_film.py; the result is ru_geo/building_height/video/building_height_share.mp4).
  Reuse their helpers and ideas (rolling numbers, tags, stamps, prints, dimension lines, camera fit, pull-backs).
- Also look at the universe_size chapter projects (ru_geo/lemo/us_brief_1..4) for the latest helpers (thousands separator in
  rolling numbers, opaque first card frame, chunked resumable render.sh with worker.pid).
- Latest helpers: country_sizes chapter projects ru_geo/lemo/cs_brief_1..4 (outline drawing from geojson, moving ink,
  equal-area overlays, chunked render.sh with worker.pid, bandcheck2.mjs that skips covered windows).
- Archive images (licences/captions in /home/user/sofia-studio/ru_geo/create_country/archive/credits.json, files in archive/img/).
  Check each file's licence there before use; public-domain/CC files only, CC credits on the print card
  («фото: автор, CC BY-SA 4.0»). Real-object photos (sealand_aerial, sealand_tower, roy_bates, maunsell_forts, hutt_*,
  molossia, conch_republic, south_sudan_vote, timor_ballot, un_hall, un_flags, icj_palace, montevideo_conf, chelmsford_hall,
  liber_iss, danube_river …) go on the board as prints where the narration names them. Files whose name starts with cc_
  are our own old diagrams (author «собственная графика»): do NOT paste them, redraw in marker.
- Legal topic: keep it neutral and exact; the narration says «это не юридическая консультация»; on-screen claims exactly as
  the narration words them, including hedges («по словам основателя», «проверить нельзя», «по данным самого княжества»).
  No political jokes; Kosovo/recognition: only what the narration says.
- Outlines/maps: real coastlines from /tmp/world.geo.json (fetch from jsdelivr johan/world.geo.json if missing); distances
  as the narration says them; dimension lines in blue.
- Facts on screen exactly as the narration says them; do not add facts the narration does not say.
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
6. Numbers and dates on screen must match the narration exactly (1933, 1967, 51 → 193 states, about 7 km², etc.).
7. Render 1920×1080, 30 fps, silent, exactly your range length. Use ONE render worker (several agents share 4 CPUs).
   Output: /home/user/sofia-studio/ru_geo/create_country/video/parts/<your file name>.mp4 and events JSON at
   <your folder>/events.json in the same format as the reference ({dur, ev:[{t,type,dur}]}, local time).
8. Before finishing: ~12 stills across your range from the final mp4, look at them, fix problems
   (overlaps, cut text, text in the subtitle band, picture not matching the words). Delete your out/frames after
   encoding. Do not commit or push git.

## Practical
The container restarts about every 30 minutes and kills background processes: launch renders with
`setsid nohup … &`, poll with `timeout 110` loops, keep every Bash call under 2 minutes, restart killed renders
(frames.mjs is resumable). Disk is limited (~3.5 GB shared): delete temporary frames.
Final report: file paths, exact duration, what each paragraph shows (one line each), problems left, stills paths.

## Render keeper
Your tools/render.sh must define `OUT=<full path of your output mp4>` on one line and support `sh tools/render.sh` (start/resume one
detached worker) and `sh tools/render.sh encode` (exit 0 only when the mp4 is written), like bh_brief_B/tools/render.sh.
When your scene is final, `touch <your folder>/.render_ready` and start the render: a keeper script restarts it after container
restarts and encodes it when all frames exist. You may finish your work when the render is running and your checks on
pre-render stills are done; say so in the report.

## The four ticks (a running motif)
The film is built on the four Montevideo conditions: население, территория, правительство, способность вступать в отношения
с другими государствами. Draw them once as a checklist with four boxes (chapter «ЧЕТЫРЕ ГАЛОЧКИ»), then each case gets its
own small checklist where boxes are ticked (blue) or crossed (red) exactly as the narration rules. Keep the same order and
wording of the four items in every chapter so the viewer recognises the motif.
