// Part 4 "The $9.4 Million Verdict" (v01–v11) — dark evidence desk + red-string board (Case File style).
// The copyright half of the award was for American's logo. NEVER draw anything resembling the real logo:
// the logo is shown only as an empty frame with a generic plane symbol, labelled "AMERICAN'S LOGO (NOT SHOWN)".
// node episode.js video | still t1,t2,.. out.png | sheet out.png | cues
const C = require('../../lib/casefile'); C.fonts();
const path = require('path'), fs = require('fs');
const D = __dirname, FILM = path.join(D, '../..');
const { W, H, clamp, lerp, eo, eio, ss, back, hash } = C;
const IDS = ['v01', 'v02', 'v03', 'v05', 'v06', 'v07', 'v08', 'v09', 'v10', 'v11'];
const tl = C.timeline(FILM, 'c4_verdict', IDS, { lead: 2.5, pause: { v01: 0.3, v02: 0.6, v05: 0.45, v06: 0.2, v08: 0.3, v10: 0.5 }, tail: 1.4 });
const T = tl.T, at = tl.at, st = tl.start, en = tl.end;
const K = {
  trick: at('v01', 'trick'), illegal: at('v01', 'illegal'), website: at('v01', 'website'), owing: at('v01', 'owing'), nine0: at('v01', 'nine'),
  south: at('v02', 'southwest'), y2021: at('v02', '2021'), settled: at('v02', 'settled'),
  y2023: at('v03', '2023'), american: at('v03', 'american'), sued3: at('v03', 'sued'), jury3: at('v03', 'jury'), fort: at('v03', 'fort'), texas: at('v03', 'texas'),
  october: at('v05', 'october'), decided: at('v05', 'decided'), nine: at('v05', 'nine'), forAm: at('v05', 'american'),
  part: at('v06', 'part'), headlines: at('v06', 'headlines'), skipped: at('v06', 'skipped'), look: at('v06', 'look'), money6: at('v06', 'money'),
  four7: at('v07', 'four'), copyright: at('v07', 'copyright'), not1: at('v07', 'not'), tickets: at('v07', 'tickets'), not2: at('v07', 'not', 1), data: at('v07', 'data'),
  logo: at('v07', 'logo'), artwork: at('v07', 'artwork'), shown: at('v07', 'shown'), pages: at('v07', 'pages'),
  four8: at('v08', 'four'), taken: at('v08', 'taken'), revenue: at('v08', 'revenue'),
  trademark: at('v09', 'trademark'), usual: at('v09', 'usual'), rejected: at('v09', 'rejected'), breach: at('v09', 'breach'), thrown: at('v09', 'thrown'), trial: at('v09', 'trial'),
  didnt: at('v10', "didn't"), illegal10: at('v10', 'illegal'), logo10: at('v10', 'logo'), revenue10: at('v10', 'revenue'),
  y2025: at('v11', '2025'), final: at('v11', 'final')
};
// scene starts (cut ~0.12 s before a line or on a stressed word)
const S = [0, st('v01') - 0.12, K.website - 0.1, st('v02') - 0.12, st('v03') - 0.12, K.jury3 - 0.12, st('v05') - 0.12, st('v06') - 0.12, st('v07') - 0.12, K.logo - 0.12,
  st('v08') - 0.12, st('v09') - 0.12, K.breach - 0.12, st('v10') - 0.12, K.logo10 - 0.2, st('v11') - 0.12];
// ---- assets ----
const A = {};
A.south = C.docComplaint({ district: 'NORTHERN DISTRICT OF TEXAS', caption: ['SOUTHWEST AIRLINES', 'v.', 'SKIPLAGGED'], title: 'COMPLAINT', claims: ['DISPLAYING ITS FARES'], date: '2021', seed: 12 });
A.aa = C.docComplaint({ district: 'NORTHERN DISTRICT OF TEXAS · FORT WORTH', caption: ['AMERICAN AIRLINES', 'v.', 'SKIPLAGGED'], title: 'COMPLAINT', claims: ['TRADEMARK', 'BREACH OF CONTRACT', 'COPYRIGHT'], date: 'AUGUST 2023', seed: 14 });
A.verdict = C.docComplaint({ district: 'NORTHERN DISTRICT OF TEXAS · FORT WORTH', caption: ['AMERICAN AIRLINES', 'v.', 'SKIPLAGGED'], title: 'JURY VERDICT', claims: ['FOR THE PLAINTIFF'], amount: '$9,400,000', date: 'OCTOBER 15, 2024', seed: 16 });
A.site = C.siteCard({ name: 'SKIPLAGGED', tagline: 'hidden-city fares', input: 'Where do you want to go?', rows: [['FLIGHTS THROUGH YOUR CITY', '$$'], ['AIRLINE NAMES · SCHEDULES', '···']], note: 'RE-CREATED · generic layout' });
const claimDoc = (title, sub, seed) => { const [c, x] = C.docPaper(900, 560, '#f1ece0', seed); C.ct(x, 'CLAIM', 450, 110, `700 34px ${C.MONO}`, '#5a4a36'); x.fillStyle = '#241c14'; x.fillRect(120, 140, 660, 4);
  C.ct(x, title, 450, 270, `900 84px ${C.F}`, '#241c14', 'center', 800); C.ct(x, sub, 450, 360, `italic 34px ${C.SERIF}`, '#5a4a36', 'center', 800); C.textLines(x, 120, 410, 3, 660, 34, seed); return c; };
A.tm = claimDoc('TRADEMARK', '"looks like it\'s endorsed"', 31); A.bc = claimDoc('BREACH OF CONTRACT', 'website terms of use', 33);
A.notIllegal = (() => { const [c, x] = C.docPaper(1300, 560, '#efe7d6', 41); C.ct(x, 'WHAT THE JURY SAID ABOUT', 650, 120, `700 40px ${C.MONO}`, '#5a4a36'); C.ct(x, 'HIDDEN-CITY TICKETS', 650, 290, `900 110px ${C.F}`, '#241c14', 'center', 1200); C.ct(x, '(nothing)', 650, 420, `italic 54px ${C.SERIF}`, '#5a4a36'); return c; })();
// ---- local drawing helpers ----
const scene = t => { let i = 0; while (i < S.length - 1 && t >= S[i + 1]) i++; return i; };
function gavel(ctx, x, y, s, ang) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.fillStyle = '#6b3d1f'; ctx.fillRect(-12, -10, 24, 260); ctx.fillStyle = '#4a2a14'; C.roundRect(ctx, -90, -70, 180, 80, 18); ctx.fill(); ctx.fillStyle = '#c9a66b'; ctx.fillRect(-90, -48, 180, 10); ctx.fillRect(-90, -20, 180, 10); ctx.restore(); }
function block(ctx, x, y) { ctx.fillStyle = '#4a2a14'; C.roundRect(ctx, x - 130, y, 260, 46, 10); ctx.fill(); ctx.fillStyle = '#6b3d1f'; C.roundRect(ctx, x - 110, y - 22, 220, 30, 8); ctx.fill(); }
function jury(ctx, x0, y, n, k, t) { for (let i = 0; i < n; i++) { const u = eo(clamp(k * n - i)); if (u <= 0) continue; const x = x0 + i * 120; ctx.save(); ctx.globalAlpha = u; ctx.translate(x, y + (1 - u) * 40 + Math.sin(t * 2 + i) * 2);
    ctx.fillStyle = '#c9c1b0'; ctx.beginPath(); ctx.arc(0, -70, 30, 0, 7); ctx.fill(); C.roundRect(ctx, -42, -36, 84, 90, 24); ctx.fill(); ctx.fillStyle = '#5a4a36'; ctx.fillRect(-56, 40, 112, 26); ctx.restore(); } }
// generic picture frame with an EMPTY canvas + a neutral plane symbol (never the real logo)
function logoFrame(ctx, cx, cy, s, k, t) { if (k <= 0) return; const u = back(clamp(k)); ctx.save(); ctx.translate(cx, cy); ctx.scale(s * u, s * u); ctx.rotate(-0.02 + Math.sin(t * 0.8) * 0.006);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = '#b8892f'; ctx.fillRect(-330, -250, 660, 500); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#7a5a1c'; ctx.lineWidth = 10; ctx.strokeRect(-300, -220, 600, 440); ctx.fillStyle = '#e9e4d8'; ctx.fillRect(-280, -200, 560, 400);
  ctx.setLineDash([16, 12]); ctx.strokeStyle = '#a49c8c'; ctx.lineWidth = 5; ctx.strokeRect(-230, -150, 460, 300); ctx.setLineDash([]);
  C.plane(ctx, 0, -20, 0.9, -0.5, { col: '#c9cfd6', strokeCol: '#8f98a3' }); ctx.font = `900 120px ${C.F}`; ctx.fillStyle = 'rgba(80,70,60,0.55)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 150, 70); ctx.restore(); }
function cork(ctx) { const X = C.tex(); ctx.drawImage(X.board, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, W, H); }
function pinCard(ctx, lines, x, y, w, h, rot, k, col, ink) { if (k <= 0) return; C.sticky(ctx, lines, x, y, w, rot, k, { h, size: 58, col: col || '#efe7d6', ink: ink || '#241c14', tape: false }); if (k > 0.5) C.pin(ctx, x, y - h / 2 + 30, (k - 0.5) * 2, {}); }
function string(ctx, a, b, prog, sag = 60) { if (prog <= 0) return; const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag]); }
  C.markerLine(ctx, pts, prog, '#c4211a', 5, false); }
function frame(ctx, t) { C.camReset(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const s = scene(t); const t0 = S[s], t1 = s < S.length - 1 ? S[s + 1] : T, U = clamp((t - t0) / (t1 - t0));
  let mode = 'dark';
  if (s === 0) { // chapter card on the dark desk
    C.desk(ctx, t, { warm: true }); C.chapterCard(ctx, t, 0.15, 'PART 4', 'THE $9.4 MILLION VERDICT', { mode: 'dark', dur: S[1] - 0.15 });
  } else if (s === 1) { // "so if the trick isn't illegal…" — the trick card: LEGAL
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.08, U), x: W / 2 + lerp(-20, 20, U) });
    C.sticky(ctx, ['THE TRICK'], W * 0.36, H * 0.42, 520, -0.05, (t - t0) / 0.35, { h: 260, size: 96 });
    C.camReset(ctx); C.stamp(ctx, 'LEGAL', W * 0.62, H * 0.46, K.illegal - 0.05, t, 130, '#2f7d4f', 0.08);
    C.typed(ctx, 'RECAP  //  NOT A CRIME', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
  } else if (s === 2) { // "…how does a website end up owing $9.4M?"
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.02, 1.1, U) });
    const p = C.pose(W * 0.5, H * 0.55 + Math.sin(t) * 5, 1000, 585, { rx: 0.28, ry: lerp(-0.3, -0.1, eo((t - t0) / 0.8)), rz: -0.02, z: lerp(200, 0, eo((t - t0) / 0.5)) }); C.card3d(ctx, A.site.c, p, { alpha: 0.85 });
    C.camReset(ctx); C.counter(ctx, { t0: K.nine0 - 0.05, from: 0, to: 9400000, dur: 0.9, x: W * 0.5, y: H * 0.5, size: 200 }, t);
    if (t > K.nine0 + 1.0) C.punch(ctx, '?', W * 0.86, H * 0.5, K.nine0 + 1.0, t, 260, '#f2d33b');
    C.typed(ctx, 'OWED BY:  A WEBSITE', 80, 96, K.website, t, 32, '#f2d33b');
  } else if (s === 3) { // Southwest 2021 → SETTLED
    C.desk(ctx, t, { sy: H * 0.5 }); C.cam(ctx, { z: lerp(1.0, 1.1, U), rot: lerp(0.01, -0.01, U) });
    const p = C.pose(W * 0.4, H * 0.54, 620, 800, { rx: lerp(0.5, 0.18, eo((t - t0) / 0.7)), ry: 0.22, rz: 0.04, z: lerp(260, 0, eo((t - t0) / 0.5)) }); C.card3d(ctx, A.south.c, p);
    const hl = C.boxOf(p, [0.06, 0.16, 0.62, 0.27]); C.highlight(ctx, hl, K.south - 0.05, t, { dim: 0.35, until: K.settled - 0.1 });
    C.camReset(ctx); C.typed(ctx, 'SOUTHWEST  ·  2021', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
    C.label(ctx, 'ROUND 2', W * 0.78, H * 0.3, { size: 80, alpha: eo((t - t0 - 0.2) / 0.3), col: '#f3efe6' });
    C.stamp(ctx, 'SETTLED', W * 0.76, H * 0.56, K.settled - 0.05, t, 120, '#c9a227', -0.07);
  } else if (s === 4) { // RECEIPT 04: American v. Skiplagged, 2023
    C.desk(ctx, t, { warm: true }); const [sx, sy] = C.shake(t, K.sued3, 12); C.cam(ctx, { x: W / 2 + sx, y: H / 2 + sy, z: lerp(1.0, 1.12, U) });
    const p = C.pose(W * 0.5, H * 0.56 + Math.sin(t * 1.1) * 5, 680, 877, { rx: lerp(0.55, 0.2, eo((t - t0) / 0.8)), ry: -0.12, rz: -0.03, z: lerp(320, 0, eo((t - t0) / 0.55)) }); C.card3d(ctx, A.aa.c, p);
    const hl = C.boxOf(p, [0.06, 0.16, 0.62, 0.27]); C.highlight(ctx, hl, K.american - 0.05, t, { dim: 0.4, until: K.sued3 + 0.6 });
    const ks = [K.sued3 + 0.7, K.sued3 + 1.3, K.sued3 + 1.9]; A.aa.hl.slice(0, 3).forEach((r, i) => { if (i < 2 && t > ks[i + 1]) return; C.highlight(ctx, C.boxOf(p, r), ks[i], t, { dim: 0.45, until: i < 2 ? ks[i + 1] : undefined }); });
    C.camReset(ctx); C.typed(ctx, 'RECEIPT 04  //  2023', 80, 96, t0 + 0.05, t, 32, '#f2d33b'); C.stamp(ctx, 'SUED', W * 0.79, H * 0.3, K.sued3 - 0.04, t, 110, '#d0281c', 0.08);
  } else if (s === 5) { // the jury, Fort Worth, Texas
    C.desk(ctx, t, { sy: H * 0.38 }); C.cam(ctx, { z: lerp(1.08, 1.0, eo(U)) });
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(W * 0.12, H * 0.6, W * 0.76, 30); jury(ctx, W * 0.5 - 5.5 * 120, H * 0.56, 12, (t - t0) / 0.9, t);
    C.camReset(ctx); C.label(ctx, '12 JURORS', W / 2, H * 0.2, { size: 84, alpha: eo((t - t0 - 0.15) / 0.3) });
    if (t > K.fort - 0.1) C.tag(ctx, 'FORT WORTH, TEXAS', W / 2, H * 0.86, { size: 44, al: 'center', alpha: eo((t - K.fort + 0.1) / 0.3) });
  } else if (s === 6) { // the verdict: gavel + counter
    C.desk(ctx, t, { warm: true, sy: H * 0.45 }); const [sx, sy] = C.shake(t, K.decided, 18); C.cam(ctx, { x: W / 2 + sx, y: H / 2 + sy, z: lerp(1.0, 1.06, U) });
    const p = C.pose(W * 0.28, H * 0.56, 560, 722, { rx: 0.2, ry: 0.3, rz: -0.05, z: 60 }); C.card3d(ctx, A.verdict.c, p, { alpha: 0.9 });
    const g = t < K.decided ? lerp(-0.9, -1.25, eo((t - t0) / 0.5)) : lerp(-0.2, -0.35, eo((t - K.decided) / 0.4)); block(ctx, W * 0.24, H * 0.86); gavel(ctx, W * 0.33, H * 0.72, 0.9, g + Math.PI / 2 - 0.2);
    C.camReset(ctx); C.typed(ctx, 'OCTOBER 2024', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
    C.counter(ctx, { t0: K.nine - 0.05, from: 0, to: 9400000, dur: 1.0, x: W * 0.64, y: H * 0.42, size: 170 }, t);
    C.todayTag(ctx, '$9.7M', W * 0.64 - 190, H * 0.58, K.nine + 1.05, t, { size: 40 });
    C.stamp(ctx, 'FOR AMERICAN', W * 0.66, H * 0.76, K.forAm - 0.05, t, 76, '#d0281c', -0.05);
  } else if (s === 7) { // red-string board: what was the money for?
    cork(ctx); C.cam(ctx, { z: lerp(1.0, 1.1, U), x: W / 2 + lerp(30, -30, U) });
    const ctr = [W * 0.5, H * 0.52]; pinCard(ctx, ['$9.4M'], ctr[0], ctr[1], 420, 220, -0.03, (t - t0) / 0.3, '#f2d33b');
    const items = [[['TRADEMARK'], W * 0.18, H * 0.25, -0.06], [['CONTRACT'], W * 0.82, H * 0.24, 0.05], [['COPYRIGHT'], W * 0.17, H * 0.8, 0.04], [['REVENUE'], W * 0.83, H * 0.8, -0.05]];
    items.forEach(([l, x, y, r], i) => { const k0 = K.part + i * 0.35; pinCard(ctx, l, x, y, 380, 170, r, (t - k0) / 0.3); string(ctx, [x, y], ctr, (t - k0 - 0.15) / 0.5, 40); });
    C.camReset(ctx); C.typed(ctx, 'THE PART MOST HEADLINES SKIPPED', W / 2, 110, K.part - 0.2, t, 44, '#f2d33b', { al: 'center', cps: 40 });
    if (t > K.money6) C.markerEllipse(ctx, ctr[0], ctr[1], 270, 150, (t - K.money6) / 0.5, 6, '#f2d33b', 9);
    mode = 'paper';
  } else if (s === 8) { // split bar: copyright half; not tickets, not flight data
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.05, U) }); C.camReset(ctx);
    C.splitBar(ctx, { x: W * 0.1, y: H * 0.2, w: W * 0.8, h: 150, t0: K.four7 - 0.1, size: 60, parts: [['COPYRIGHT  $4.7M', 0.5, '#f2d33b'], ['?', 0.5, '#3a3f48']] }, t);
    C.sticky(ctx, ['THE TICKETS'], W * 0.3, H * 0.66, 470, -0.05, (t - K.not1 + 0.1) / 0.3, { h: 220, size: 80 }); C.crossOut(ctx, W * 0.3 - 200, H * 0.66 - 90, W * 0.3 + 200, H * 0.66 + 90, (t - K.tickets) / 0.4, C.RED, 16);
    C.sticky(ctx, ['FLIGHT DATA'], W * 0.7, H * 0.66, 470, 0.05, (t - K.not2 + 0.1) / 0.3, { h: 220, size: 80 }); C.crossOut(ctx, W * 0.7 - 200, H * 0.66 - 90, W * 0.7 + 200, H * 0.66 + 90, (t - K.data) / 0.4, C.RED, 16);
    C.typed(ctx, 'HALF #1', 80, 96, K.four7, t, 32, '#f2d33b'); C.punch(ctx, 'FOR COPYRIGHT', W / 2, H * 0.6, K.copyright - 0.05, t, 130, '#f2d33b', { until: K.not1 - 0.12 });
  } else if (s === 9) { // the logo — shown only as an empty frame
    C.desk(ctx, t, { warm: true, sy: H * 0.4 }); C.cam(ctx, { z: lerp(1.12, 1.0, eo((t - t0) / 1.0)) + 0.05 * U });
    logoFrame(ctx, W * 0.36, H * 0.5, 1.15, (t - t0) / 0.45, t); C.camReset(ctx);
    C.tag(ctx, "AMERICAN'S LOGO (NOT SHOWN)", W * 0.36, H * 0.93, { size: 36, al: 'center', alpha: eo((t - t0 - 0.3) / 0.3) });
    if (t > K.artwork - 0.1) { const k = eo((t - K.artwork + 0.1) / 0.3); C.label(ctx, 'TREATED AS', W * 0.78, H * 0.36, { size: 72, alpha: k }); C.label(ctx, 'ARTWORK', W * 0.78, H * 0.47, { size: 110, col: '#f2d33b', alpha: k }); }
    if (t > K.shown - 0.1) C.sticky(ctx, ['SHOWN ON', 'ITS PAGES'], W * 0.78, H * 0.72, 420, 0.05, (t - K.shown + 0.1) / 0.3, { h: 230, size: 64 });
    C.punch(ctx, '$4.7M', W * 0.36, H * 0.13, t0 + 0.2, t, 110, '#f2d33b');
  } else if (s === 10) { // revenue half: bills flow from the site
    C.desk(ctx, t); C.camReset(ctx);
    C.splitBar(ctx, { x: W * 0.1, y: H * 0.2, w: W * 0.8, h: 150, t0: t0 - 2, size: 60, parts: [['COPYRIGHT  $4.7M', 0.5, '#f2d33b'], ['REVENUE  $4.7M', 0.5, t > K.four8 ? '#7fae7a' : '#3a3f48']] }, t);
    const p = C.pose(W * 0.32, H * 0.66, 760, 444, { rx: 0.25, ry: 0.25, rz: -0.03 }); C.card3d(ctx, A.site.c, p, { alpha: 0.9 });
    for (let i = 0; i < 14; i++) { const u = (t - K.taken - i * 0.12) / 1.1; if (u <= 0 || u > 1) continue; const e = eio(u); C.bill(ctx, lerp(W * 0.42, W * 0.78, e), lerp(H * 0.64, H * 0.74, e) - Math.sin(e * Math.PI) * 180, 1.1, (hash(i) - 0.5) * 0.8 + e * 2, 1); }
    const pile = clamp((t - K.taken - 0.6) / 2.2); for (let i = 0; i < Math.floor(pile * 12); i++) C.bill(ctx, W * 0.78 + (hash(i * 3) - 0.5) * 120, H * 0.84 - i * 10, 1.15, (hash(i) - 0.5) * 0.4, 1);
    C.label(ctx, "SKIPLAGGED'S REVENUE", W * 0.72, H * 0.52, { size: 58, alpha: eo((t - K.revenue + 0.1) / 0.3), col: '#f3efe6' });
    C.typed(ctx, 'HALF #2', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
  } else if (s === 11) { // trademark → REJECTED
    C.desk(ctx, t, { sy: H * 0.45 }); const [sx, sy] = C.shake(t, K.rejected, 12); C.cam(ctx, { x: W / 2 + sx, y: H / 2 + sy, z: lerp(1.0, 1.08, U) });
    const p = C.pose(W * 0.48, H * 0.52, 960, 597, { rx: lerp(0.5, 0.2, eo((t - t0) / 0.6)), ry: -0.1, rz: -0.03, z: lerp(240, 0, eo((t - t0) / 0.5)) }); C.card3d(ctx, A.tm, p);
    if (t > K.trademark) { const a = C.proj(p, 0.2, 0.52), b = C.proj(p, 0.8, 0.52); C.markerLine(ctx, C.curve(a, b, 0.01, 30, 2), (t - K.trademark) / 0.5, C.RED, 9, false); }
    C.camReset(ctx); if (t > K.usual - 0.1) C.sticky(ctx, ['THE USUAL WAY', 'TO FIGHT OVER', 'A LOGO'], W * 0.84, H * 0.3, 380, 0.06, (t - K.usual + 0.1) / 0.3, { h: 300, size: 50 });
    C.stamp(ctx, 'REJECTED', W * 0.5, H * 0.56, K.rejected - 0.05, t, 150, '#d0281c', -0.12); C.typed(ctx, 'THE JURY  //  NO DAMAGES', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
  } else if (s === 12) { // breach of contract → thrown out before trial
    C.desk(ctx, t, { sy: H * 0.45 }); C.cam(ctx, { z: lerp(1.0, 1.08, U), rot: lerp(-0.01, 0.01, U) });
    const p0 = C.pose(W * 0.2, H * 0.56, 540, 336, { rx: 0.2, ry: 0.3, rz: -0.08, z: 140 }); C.card3d(ctx, A.tm, p0, { alpha: 0.5 });
    const fly = clamp((t - K.thrown - 0.2) / 0.7); const p = C.pose(W * 0.55 + fly * W * 0.7, H * 0.52 - Math.sin(fly * Math.PI) * 120, 960, 597, { rx: 0.2, ry: -0.1 - fly * 0.6, rz: 0.03 + fly * 0.9, z: lerp(200, 0, eo((t - t0) / 0.5)) }); C.card3d(ctx, A.bc, p);
    C.camReset(ctx); if (t > K.thrown - 0.05) C.stamp(ctx, 'THROWN OUT', W * 0.5, H * 0.3, K.thrown - 0.05, t, 120, '#d0281c', 0.06);
    if (t > K.trial - 0.1) C.label(ctx, 'BEFORE TRIAL', W * 0.5, H * 0.8, { size: 96, col: '#f2d33b', alpha: eo((t - K.trial + 0.1) / 0.3) });
    C.typed(ctx, 'SUMMARY JUDGMENT  //  2024', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
  } else if (s === 13) { // what the jury did NOT say
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.08, U) });
    const p = C.pose(W * 0.5, H * 0.52, 1200, 517, { rx: lerp(0.45, 0.15, eo((t - t0) / 0.6)), ry: 0.05, rz: 0.02, z: lerp(240, 0, eo((t - t0) / 0.5)) }); C.card3d(ctx, A.notIllegal, p);
    C.camReset(ctx); C.stamp(ctx, 'NOT ILLEGAL', W * 0.74, H * 0.82, K.illegal10 - 0.05, t, 90, '#2f7d4f', -0.06);
  } else if (s === 14) { // NOT THE TRICK. THE LOGO.
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.06, U) }); logoFrame(ctx, W * 0.5, H * 0.58, 0.75, 1, t); C.camReset(ctx);
    ctx.save(); ctx.fillStyle = `rgba(0,0,0,${0.55 * eo((t - t0) / 0.3)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    C.punch(ctx, 'NOT THE TRICK.', W / 2, H * 0.36, t0 + 0.05, t, 150, '#f3efe6'); C.punch(ctx, 'THE LOGO.', W / 2, H * 0.6, K.logo10 + 0.15, t, 190, '#f2d33b');
    if (t > K.revenue10 - 0.1) C.label(ctx, '+ THE REVENUE', W / 2, H * 0.82, { size: 80, col: '#7fae7a', alpha: eo((t - K.revenue10 + 0.1) / 0.3) });
  } else { // v11: FINAL · 2025
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.12, U) });
    const p = C.pose(W * 0.5, H * 0.55, 600, 774, { rx: 0.2, ry: lerp(-0.25, -0.05, U), rz: -0.02 }); C.card3d(ctx, A.verdict.c, p);
    C.camReset(ctx); C.typed(ctx, 'MAY 2025', 80, 96, t0 + 0.05, t, 32, '#f2d33b'); C.stamp(ctx, 'FINAL · 2025', W * 0.5, H * 0.5, K.final - 0.05, t, 120, '#d0281c', -0.1);
  }
  C.finish(ctx, t, { mode, fade: t > T - 0.35 ? (t - (T - 0.35)) / 0.35 : 0 });
  const cv = ctx.canvas; [S[3], S[4], S[11]].forEach(x => C.glitch(ctx, cv, t, x)); [S[1], S[5], S[6], S[8], S[10], S[13], S[15]].forEach((x, i) => C.whip(ctx, cv, t, x, i % 2 ? -1 : 1)); C.whip(ctx, cv, t, S[7], 1); C.whip(ctx, cv, t, S[9], -1); C.whip(ctx, cv, t, S[12], 1); C.whip(ctx, cv, t, S[14], -1); C.whip(ctx, cv, t, S[2], 1);
}
function cues() { return { T,
  whoosh: [S[1], S[2], S[5], S[6], S[7], S[8], S[9], S[10], S[12], S[13], S[14], S[15], K.thrown + 0.2].map(x => x - 0.1),
  stamp: [K.illegal - 0.05, K.settled - 0.05, K.sued3 - 0.04, K.forAm - 0.05, K.rejected - 0.05, K.thrown - 0.05, K.illegal10 - 0.05, K.final - 0.05],
  hit: [K.decided, K.nine - 0.05, K.logo10 + 0.15, 0.15], glitch: [S[3], S[4], S[11]],
  paper: [S[1] + 0.05, S[3], S[4], K.not1 - 0.1, K.not2 - 0.1, K.usual - 0.1, K.shown - 0.1, ...[0, 1, 2, 3].map(i => K.part + i * 0.35)],
  marker: [K.tickets, K.data, K.money6], ding: [K.artwork - 0.1],
  type: [[S[1] + 0.05, 0.6], [K.website, 0.5], [S[3] + 0.05, 0.6], [S[4] + 0.05, 0.6], [S[6] + 0.05, 0.4], [K.part - 0.2, 1.0], [S[11] + 0.05, 0.7], [S[12] + 0.05, 0.8], [S[15] + 0.05, 0.3]],
  counter: [[K.nine0 - 0.05, 0.9], [K.nine - 0.05, 1.0], [K.taken, 1.6]], footsteps: [[S[5], 0.8]],
  mode: [[0, 'dark'], [S[7], 'paper'], [S[8], 'dark']] }; }
module.exports = { T, frame, cues, tl };
if (require.main === module) { const m = process.argv[2];
  if (m === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log('T', T); }
  else if (m === 'still') C.stills(process.argv[3].split(',').map(Number), process.argv[4], frame);
  else if (m === 'sheet') { const ts = []; for (let x = 0.1; x < T; x += 1.0) ts.push(+x.toFixed(2)); C.stills(ts, process.argv[3], frame, 8, 0.15); }
  else if (m === 'video') C.render(path.join(D, 'seg_video.mp4'), T, frame).then(() => console.log('done', T)); }
