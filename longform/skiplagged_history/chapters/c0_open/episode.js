// Cold open (o01–o06) of "Flying Farther Is Cheaper. Airlines Will Ban You for It." — Case File style.
// node episode.js video | still t1,t2,.. out.png | sheet out.png | cues
const C = require('../../lib/casefile'); C.fonts();
const path = require('path'), fs = require('fs');
const D = __dirname, FILM = path.join(D, '../..');
const { W, H, clamp, lerp, eo, eio, ss, back } = C;
const IDS = ['o01', 'o02', 'o03', 'o05', 'o06'];
const tl = C.timeline(FILM, 'c0_open', IDS, { pause: { o05: 0.5 } }); const T = tl.T, at = tl.at, st = tl.start;
// ---- key times ----
const K = { y2014: at('o01', '2014'), united: at('o01', 'united'), sued: at('o01', 'sued'), age: at('o01', '22'), cheap: at('o01', 'too'),
  s1: st('o02') - 0.12, later: at('o02', 'later'), another: at('o02', 'another'), nine: at('o02', 'nine'), website: at('o02', 'website'),
  s2: st('o03') - 0.15, banned: at('o03', 'banned'), three: at('o03', 'three'), dad: at('o03', 'dad'), planning: at('o03', 'planning'), off: at('o03', 'off'), home: at('o03', 'hometown'),
  s3: st('o05') - 0.2, why: at('o05', 'why'), la1: at('o05', 'los'), five: at('o05', 'five'), la2: at('o05', 'los', 1), bos: at('o05', 'boston'), two: at('o05', 'two'), sixteen: at('o05', 'sixteen'),
  s4: st('o06') - 0.1, legally: at('o06', 'legally'), cost: at('o06', 'cost'), nine2: at('o06', 'nine'), open: at('o06', "let's"), file: at('o06', 'file') };
const SCN = [0, K.s1, K.s2, K.s3, K.s4, K.open - 0.12];
// ---- assets ----
const A = {};
A.complaint = C.docComplaint({ district: 'NORTHERN DISTRICT OF ILLINOIS', caption: ['UNITED AIRLINES', 'ORBITZ', 'v.', 'SKIPLAGGED', 'AKTARER ZAMAN'], title: 'COMPLAINT', claims: ['UNFAIR COMPETITION'], amount: '$75,000', date: 'NOVEMBER 2014', seed: 3 });
A.aa = C.docComplaint({ district: 'NORTHERN DISTRICT OF TEXAS · FORT WORTH', caption: ['AMERICAN AIRLINES', 'v.', 'SKIPLAGGED'], title: 'JURY VERDICT', claims: ['FOR THE PLAINTIFF'], amount: '$9,400,000', date: 'OCTOBER 2024', seed: 9 });
A.pass = C.boardingPass({ legs: [['GNV', 'CLT'], ['CLT', 'NYC']], cities: ['GAINESVILLE', 'CHARLOTTE', 'NEW YORK'], carrier: 'AIRLINE', flight: '— — —', date: 'JUL 2023', seat: '—', price: '$150', accent: '#3b4a5e' });
A.folder = C.folder({ label: 'CASE FILE', sub: 'HIDDEN-CITY TICKETING' });
const LAX = [-118.41, 33.94], IAD = [-77.46, 38.95], BOS = [-71.01, 42.36];
// ---- helpers ----
const scene = t => { let i = 0; while (i < SCN.length - 1 && t >= SCN[i + 1]) i++; return i; };
function frame(ctx, t) { C.camReset(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const s = scene(t); const t0 = SCN[s], t1 = s < SCN.length - 1 ? SCN[s + 1] : T, U = clamp((t - t0) / (t1 - t0));
  let mode = 'dark';
  if (s === 0) { // RECEIPT 01 — the complaint, push-in, SUED, AGE 22, TOO CHEAP?
    C.desk(ctx, t, { warm: true }); const [sx, sy] = C.shake(t, K.sued, 16);
    const z = lerp(1.0, 1.16, ss(t / 7)); C.cam(ctx, { x: W / 2 + sx, y: H / 2 + sy, z, rot: lerp(-0.015, 0.01, U) });
    const p = C.pose(W * 0.42, H * 0.56 + Math.sin(t * 1.2) * 6, 680, 877, { rx: lerp(0.45, 0.16, eo(t / 1.3)), ry: lerp(-0.35, -0.12, eo(t / 1.6)), rz: -0.035, z: lerp(80, 0, eo(t / 1.1)) });
    C.card3d(ctx, A.complaint.c, p);
    const hl = C.boxOf(p, [0.06, 0.16, 0.6, 0.27]); C.highlight(ctx, hl, K.united - 0.05, t, { dim: 0.35, until: K.sued + 0.9 });
    C.stamp(ctx, 'SUED', W * 0.42, H * 0.47, K.sued - 0.04, t, 120, '#d0281c', -0.1);
    C.camReset(ctx);
    C.typed(ctx, 'RECEIPT 01  //  NOV 2014', 80, 96, 0.05, t, 32, '#f2d33b');
    if (t < K.cheap - 0.1) { const k = eo(t / 0.35); C.label(ctx, 'AN AIRLINE', W * 0.8, H * 0.16 + (1 - k) * 30, { size: 72, alpha: k * clamp((K.cheap - 0.1 - t) / 0.2) }); C.label(ctx, 'v. A 22-YEAR-OLD', W * 0.8, H * 0.25 + (1 - k) * 30, { size: 72, col: '#f2d33b', alpha: k * clamp((K.cheap - 0.1 - t) / 0.2) }); }
    if (t > K.age - 0.05) { const k = eo((t - K.age + 0.05) / 0.3); C.sticky(ctx, ['AGE: 22'], W * 0.8, H * 0.45, 300, 0.06, k, { h: 170, size: 64 }); }
    C.punch(ctx, 'TOO CHEAP?', W * 0.74, H * 0.7, K.cheap - 0.05, t, 150, '#f2d33b', { rot: -0.04 });
  } else if (s === 1) { // ten years later: verdict card + $9.4M counter
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.04, 1.12, U), x: W / 2 + lerp(-30, 30, U) });
    const p0 = C.pose(W * 0.28, H * 0.55, 520, 671, { rx: 0.25, ry: 0.35, rz: -0.06, z: 120 }); C.card3d(ctx, A.complaint.c, p0, { alpha: 0.55 });
    const u = eo((t - K.another + 0.15) / 0.45); const p = C.pose(lerp(W * 1.3, W * 0.66, u), H * 0.54, 560, 722, { rx: 0.2, ry: -0.3, rz: 0.05 }); if (u > 0) C.card3d(ctx, A.aa.c, p);
    C.camReset(ctx); C.typed(ctx, '2014  →  2024', 80, 96, K.later - 0.3, t, 34, '#f2d33b');
    C.counter(ctx, { t0: K.nine - 0.05, from: 0, to: 9400000, dur: 1.0, x: W * 0.5, y: H * 0.47, size: 190 }, t);
    C.todayTag(ctx, '$9.7M', W * 0.5 - 210, H * 0.67, K.nine + 1.05, t, { size: 44 });
  } else if (s === 2) { // the teenager's boarding pass
    C.desk(ctx, t, { sy: H * 0.5 }); const [sx, sy] = C.shake(t, K.banned, 14); C.cam(ctx, { z: lerp(1.0, 1.1, U), x: W / 2 + sx, y: H / 2 + sy });
    const p = C.pose(W / 2, H * 0.5 + Math.sin(t) * 5, 1300, 520, { rx: lerp(0.65, 0.32, eo((t - t0) / 0.8)), ry: -0.06, rz: -0.03, z: lerp(300, 0, eo((t - t0) / 0.6)) }); C.card3d(ctx, A.pass.c, p);
    // cross the last leg (CLT → NYC) at "planning to get off"
    const a = C.proj(p, 0.48, 0.41), b = C.proj(p, 0.62, 0.41); C.crossOut(ctx, a[0] - 10, a[1] - 60, b[0] + 30, b[1] + 60, (t - K.planning) / 0.5, C.RED, 16);
    const hc = C.proj(p, (A.pass.pos[1]) / 1300, 0.46); C.markerEllipse(ctx, hc[0], hc[1], 150, 80, (t - K.home + 0.2) / 0.5, 4, C.RED, 9);
    C.camReset(ctx); C.stamp(ctx, 'BANNED', W * 0.5, H * 0.2, K.banned - 0.04, t, 110, '#d0281c', 0.05);
    C.punch(ctx, '3 YEARS', W * 0.82, H * 0.82, K.three, t, 110, '#f2d33b', { rot: -0.05 }); if (t > K.dad - 0.05) C.tag(ctx, '(PER HIS DAD)', W * 0.82 - 150, H * 0.93, { size: 30, alpha: eo((t - K.dad + 0.05) / 0.3) });
    if (t > K.home - 0.1) { C.writeOn(ctx, 'HOME', hc[0] - 70, hc[1] - 110, '64px Marker', C.RED, (t - K.home + 0.1) / 0.5); }
    C.typed(ctx, 'JULY 2023', 80, 96, t0 + 0.1, t, 32, '#f2d33b');
  } else if (s === 3 || s === 4) { // paper map: $588 vs $216 → FARTHER = CHEAPER; then the promise
    mode = 'paper'; const cam = { lon: lerp(-95.5, -95.0, U), lat: lerp(38.6, 38.9, U), R: lerp(1900, 2050, ss((t - K.s3) / 9)), dy: 20 };
    C.map(ctx, cam, { hl: ['840'], hlCol: 'rgba(240,215,150,0.35)' });
    const k1 = (t - K.la1) / 1.2, k2 = (t - K.la2) / 1.9;
    C.route(ctx, cam, [LAX, IAD], k1, { col: '#b3241a', lw: 9, dot: k1 < 1 ? 'plane' : null, planeS: 0.45, bend: -0.1 });
    C.route(ctx, cam, [LAX, IAD, BOS], k2, { col: '#1f5f8b', lw: 9, dot: k2 < 1 ? 'plane' : null, planeS: 0.45, bend: 0.06, dash: [6, 12] });
    C.cityDot(ctx, cam, ...LAX, 'LOS ANGELES', { dy: 46 }); C.cityDot(ctx, cam, ...IAD, 'WASHINGTON', { al: 'right', dy: 44 }); if (t > K.la2) C.cityDot(ctx, cam, ...BOS, 'BOSTON', { alpha: clamp((t - K.la2) / 0.4), dy: -34 });
    const pd = C.mp(...IAD, cam), pb = C.mp(...BOS, cam);
    if (t > K.five - 0.1) C.sticky(ctx, ['$588'], pd[0] - 330, pd[1] + 200, 270, -0.06, (t - K.five + 0.1) / 0.3, { h: 150, size: 90, col: '#f6c9bf', ink: '#8b1a12' });
    if (t > K.two - 0.1) C.sticky(ctx, ['$216'], pb[0] + 90, pb[1] + 210, 270, 0.07, (t - K.two + 0.1) / 0.3, { h: 150, size: 90, col: '#cfe3f2', ink: '#13466b' });
    if (t > K.sixteen + 0.35 && t < K.legally - 0.15) { C.stamp(ctx, 'FARTHER = CHEAPER', W * 0.5, H * 0.2, K.sixteen + 0.35, t, 96, '#b3241a', -0.04); }
    if (s === 4) { // the promise: two questions written on the map
      const k = eo((t - K.s4) / 0.4); ctx.save(); ctx.fillStyle = `rgba(232,221,196,${0.55 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore();
      C.sticky(ctx, ['LEGAL?'], W * 0.3, H * 0.42, 380, -0.05, (t - K.legally + 0.1) / 0.3, { h: 220, size: 88 });
      if (t > K.legally + 0.5) C.markerEllipse(ctx, W * 0.3, H * 0.42, 240, 150, (t - K.legally - 0.5) / 0.5, 9, C.RED, 8);
      C.sticky(ctx, ['WHY $9.4M?'], W * 0.69, H * 0.48, 470, 0.05, (t - K.nine2 + 0.1) / 0.3, { h: 220, size: 80, col: '#f6c9bf', ink: '#8b1a12' });
    }
  } else { // "Let's open the file": whip to the desk, folder flips open
    C.desk(ctx, t, { warm: true }); const u = eio((t - t0) / 0.9); C.cam(ctx, { z: lerp(1.25, 1.05, u) });
    ctx.save(); ctx.translate(W / 2, H * 0.55); ctx.fillStyle = '#efe7d6'; ctx.fillRect(-640, -400, 1280, 820); C.textLines(ctx, -560, -300, 14, 1100, 52, 4); ctx.restore();
    const fl = clamp((t - K.file + 0.05) / 0.6); ctx.save(); ctx.translate(W / 2, H * 0.55 - 430); if (fl < 1) { ctx.scale(1, Math.max(0.001, Math.cos(fl * Math.PI / 2))); ctx.drawImage(A.folder.c, -750, 0, 1500, 1000); } ctx.restore();
    C.camReset(ctx); if (fl > 0.6) C.punch(ctx, 'CASE FILE: SKIPLAGGING', W / 2, H * 0.5, K.file + 0.45, t, 100, '#f2d33b');
  }
  C.finish(ctx, t, { mode, fade: t > T - 0.35 ? (t - (T - 0.35)) / 0.35 : 0 });
  // transitions on top of the finished frame
  const cv = ctx.canvas; [K.s1].forEach(x => C.glitch(ctx, cv, t, x)); C.glitch(ctx, cv, t, K.s2); C.whip(ctx, cv, t, K.s3, 1); C.whip(ctx, cv, t, SCN[5], -1);
}
function cues() { return { T, whoosh: [K.s3 - 0.1, SCN[5] - 0.1, 0.0], stamp: [K.sued - 0.04, K.banned - 0.04, K.sixteen + 0.35], hit: [0.0, K.nine - 0.05, K.cheap - 0.05, K.three], glitch: [K.s1, K.s2],
  type: [[0.05, 0.9], [K.later - 0.3, 0.6], [SCN[2] + 0.1, 0.4]], paper: [K.another - 0.15, SCN[2], K.age - 0.05, K.five - 0.1, K.two - 0.1, K.legally - 0.1, K.nine2 - 0.1, K.file - 0.05], marker: [K.planning, K.home - 0.2, K.legally + 0.5],
  counter: [[K.nine - 0.05, 1.0]], plane: [K.la1, K.la2], mode: [[0, 'dark'], [K.s3, 'paper'], [SCN[5], 'dark']] }; }
module.exports = { T, frame, cues, tl };
if (require.main === module) { const m = process.argv[2];
  if (m === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log('T', T); }
  else if (m === 'still') C.stills(process.argv[3].split(',').map(Number), process.argv[4], frame);
  else if (m === 'sheet') { const ts = []; for (let x = 0.1; x < T; x += 1.0) ts.push(+x.toFixed(2)); C.stills(ts, process.argv[3], frame, 8, 0.15); }
  else if (m === 'video') C.render(path.join(D, 'seg_video.mp4'), T, frame).then(() => console.log('done', T)); }
