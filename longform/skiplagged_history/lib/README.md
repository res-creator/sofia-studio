# Case File kit (`lib/casefile.js`) — how to make a chapter
House style: CHANNEL.md rule 14. 1920x1080 @ 30 fps. Examples: `chapters/c0_open/episode.js` (dark desk + map), `chapters/c1_price/episode.js` (light paper chapter).

1. Timeline: `const tl = C.timeline(FILM, 'c2_kid', ['k01', ...], { lead, gap: 0.38, pause: { k14: 0.6 }, tail })` → `tl.T`, `tl.at(id, word, n)`, `tl.start(id)`, `tl.end(id)`.
   It writes `chapters/<ch>/timeline.json` and merges `timeline.json` (global offsets, chapters sorted by folder name c0, c1, c2…).
2. Scenes: an array of start times `S` (cut ~0.12 s before a line), `frame(ctx, t)` switches on the scene. Draw background (`C.desk` dark / `C.paperBg` paper / `C.map`), set camera `C.cam(ctx,{x,y,z,rot})`, draw world objects, `C.camReset(ctx)`, draw screen-space text, then `C.finish(ctx,t,{mode})`, then transitions on the finished canvas: `C.whip(ctx, ctx.canvas, t, tCut, ±1)` / `C.glitch(...)`.
3. Objects: `C.card3d(ctx, canvas, C.pose(x,y,w,h,{rx,ry,rz,z}))` + `C.boxOf(pose,[u0,v0,u1,v1])` for highlight boxes; documents from `C.docComplaint/docLetter/docReceipt/boardingPass/searchCard/siteCard/verdictCard/folder` (all say RE-CREATED); `C.flat` for flat cut-outs on paper.
4. Text: `C.punch` (big pop), `C.label` (plate), `C.typed` (typewriter), `C.tag`, `C.todayTag('$105K', …)` (≈ $X TODAY — every money figure), `C.stamp`, `C.sticky`, `C.writeOn`, `C.chapterCard(ctx,t,t0,'PART 2','TITLE',{mode})`.
5. Marks: `C.highlight(box,t0,t,{dim,until})`, `C.highlighter`, `C.markerEllipse`, `C.markerLine(C.curve(...))`, `C.crossOut`.
6. Maps: `C.map(ctx,{lon,lat,R,dy},{hl:['840']})`, `C.route(ctx,cam,[[lon,lat],...],prog,{dot:'plane'})`, `C.cityDot`, `C.mp(lon,lat,cam)`, `C.pin`.
7. Things: `C.plane` (generic silhouette — never logos/liveries), `C.planeCut` (seat tags), `C.person` (generic figure), `C.suitcase`, `C.bill`, `C.counter`, `C.splitBar`.
8. CLI pattern in each episode.js: `node episode.js still t1,t2 out.png | sheet out.png | cues | video`. Then `python3 ../../sound.py <ch>` → `mix.wav` (needs cues.json).
9. Sound cues keys (cues.json): whoosh, stamp, hit, glitch, paper, marker, ding, plane: [t…]; type, counter, footsteps: [[t, dur]…]; mode: [[t,'dark'|'paper']…] (music colour on a 96-BPM bar grid).
10. Preview/assemble: `python3 sound.py preview c0_open c1_price … out.mp4` (concat + master to −14 LUFS via howitsrun_style/master.sh).
Rules: new visual event every ≤ 2.5–4 s; no real logos; teen never identifiable; no burned subtitles (SRT separate).
