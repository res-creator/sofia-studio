// Part 1 "The Price That Makes No Sense" (p01–p15) — the LIGHT PAPER chapter of the Case File style.
// node episode.js video | still t1,t2,.. out.png | sheet out.png | cues
const C = require('../../lib/casefile'); C.fonts();
const path = require('path'), fs = require('fs');
const D = __dirname, FILM = path.join(D, '../..');
const { W, H, clamp, lerp, eo, eio, ss, back, hash } = C;
const IDS = ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08b', 'p08', 'p09', 'p11', 'p12', 'p13', 'p14', 'p15'];
const tl = C.timeline(FILM, 'c1_price', IDS, { lead: 2.4, pause: { p04: 0.3, p06: 0.4, p08b: 0.5, p14: 0.3 }, tail: 1.8 }); const T = tl.T, at = tl.at, st = tl.start, en = tl.end;
const K = { blogger: at('p01', 'blogger'), jan: at('p01', 'january'), united: at('p01', 'united'), los: at('p01', 'los'),
  dulles: at('p02', 'dulles'), five: at('p02', 'five'), boston: at('p03', 'boston'), same: at('p03', 'same'), two: at('p03', 'two'),
  same2: at('p04', 'same'), half: at('p04', 'half'), free: at('p04', 'free'), want: at('p04', "don't"),
  people: at('p05', 'people'), buy: at('p05', 'buy'), walk: at('p05', 'walk'), wash: at('p05', 'washington'),
  hidden: at('p06', 'hidden'), skip: at('p06', 'skiplagging'), why: at('p07', 'why'), distance: at('p07', 'distance'), cost: at('p07', 'cost'),
  did: at('p08b', 'did'), more: at('p08b', 'more'), math: at('p08b', 'math'), market: at('p08', 'market'), pay: at('p08', 'pay'),
  hub: at('p09', 'hub'), lots: at('p09', 'lots'), premium: at('p09', 'premium'), conn: at('p11', 'connection'), competes: at('p11', 'competes'), cuts: at('p11', 'cuts'),
  bargain: at('p12', 'bargain'), cash: at('p12', 'cash'), both: at('p12', 'both'), mix: at('p13', 'mix'), money: at('p13', 'money'), only: at('p13', 'only'), actually: at('p13', 'actually'),
  skipl: at('p14', 'skip'), cheap: at('p14', 'cheap'), expensive: at('p14', 'expensive'), position: at('p15', 'position'), must: at('p15', 'must'), whether: at('p15', 'whether'), problem: at('p15', 'problem') };
// scene starts
const S = [0, st('p01') - 0.15, st('p02') - 0.15, st('p04') - 0.15, st('p05') - 0.12, K.walk - 0.1, st('p06') - 0.12, st('p07') - 0.12, st('p08b') - 0.12, st('p08') - 0.12, st('p09') - 0.12, st('p11') - 0.12, st('p12') - 0.12, st('p13') - 0.12, st('p14') - 0.12, st('p15') - 0.12];
const WHIPS = [S[4], S[6], S[7], S[10], S[12], S[14], S[15]];
// ---- assets ----
const A = {};
A.search = C.searchCard({ url: 'airline blog · fare search · Jan 2015', head: 'ONE-WAY  ·  UNITED  ·  1 ADULT', query: 'LOS ANGELES (LAX)  →', rows: [['LAX → WASHINGTON DULLES', '$588', 'nonstop'], ['LAX → BOSTON', '$216', 'connects in WASHINGTON DULLES · same first flight']], note: 'RE-CREATED from Cranky Flier, Jan 5 2015' });
A.passA = C.boardingPass({ legs: [['LAX', 'IAD']], cities: ['LOS ANGELES', 'WASHINGTON'], carrier: 'UNITED', info: [['FLIGHT', 'FLIGHT 1'], ['TO', 'DULLES'], ['TYPE', 'NONSTOP']], price: '$588', accent: '#8b2a22' });
A.passB = C.boardingPass({ legs: [['LAX', 'IAD'], ['IAD', 'BOS']], cities: ['LOS ANGELES', 'WASHINGTON', 'BOSTON'], carrier: 'UNITED', info: [['FLIGHT', 'FLIGHT 1 + 2'], ['TO', 'BOSTON'], ['VIA', 'DULLES']], price: '$216', accent: '#1f5f8b' });
A.notice = (() => { const [c, x] = C.docPaper(1200, 640, '#f3eee2', 21); C.ct(x, "THE AIRLINE'S POSITION", 600, 120, `700 40px ${C.MONO}`, '#5a4a36'); x.fillStyle = '#241c14'; x.fillRect(200, 150, 800, 4);
  C.ct(x, 'YOU MUST FLY', 600, 300, `900 110px ${C.F}`, '#241c14'); C.ct(x, 'TO BOSTON.', 600, 430, `900 110px ${C.F}`, '#b3241a'); C.ct(x, '(see: conditions of carriage)', 600, 540, `italic 32px ${C.SERIF}`, '#5a4a36'); return c; })();
const LAX = [-118.41, 33.94], IAD = [-77.46, 38.95], BOS = [-71.01, 42.36];
const FEED = [[-87.9, 41.98], [-84.43, 33.64], [-95.34, 29.98], [-80.29, 25.8], [-104.67, 39.86], [-90.37, 38.75], [-81.68, 30.49], [-83.35, 42.21], [-75.24, 39.87], [-86.68, 36.12]];
const RIV = [[-87.9, 41.98, '#c9d3dc'], [-84.43, 33.64, '#d9cdbd'], [-75.24, 39.87, '#cfd8c8'], [-80.94, 35.21, '#e0d2d0']];
const scene = t => { let i = 0; while (i < S.length - 1 && t >= S[i + 1]) i++; return i; };
const USCAM = (U, z = 0) => ({ lon: lerp(-95.5, -94.5, U), lat: lerp(38.6, 39.0, U), R: 1900 * (1 + z), dy: 20 });
function board(ctx) { C.paperBg(ctx, 0, { board: true }); }
function frame(ctx, t) { C.camReset(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const s = scene(t); const t0 = S[s], t1 = s < S.length - 1 ? S[s + 1] : T, U = clamp((t - t0) / (t1 - t0));
  let mode = 'paper';
  if (s === 0) { // chapter card on paper
    C.paperBg(ctx, t); C.cam(ctx, { z: lerp(1.04, 1.0, eo(t / 2)) }); C.camReset(ctx); C.chapterCard(ctx, t, 0.0, 'PART 1', 'THE PRICE THAT MAKES NO SENSE', { mode: 'paper', dur: S[1] + 0.1 });
  } else if (s === 1 || s === 2) { // the fare search: typing, source tag, results rows highlighted
    board(ctx); const z = s === 1 ? lerp(1.0, 1.08, ss(U)) : lerp(1.08, 1.18, ss(U)); C.cam(ctx, { z, x: W / 2 + (s === 2 ? lerp(0, 40, U) : 0), y: H / 2 + (s === 2 ? lerp(0, 70, U) : 0) });
    const w = 1300 * 1.02, h = 760 * 1.02; C.flat(ctx, A.search.c, W / 2, H * 0.5, w, -0.012, { blur: 30 });
    // query typing overlay
    const qx = W / 2 - w / 2, qy = H * 0.5 - h / 2;
    const rows = A.search.hl.map(r => [qx + r[0] * w, qy + r[1] * h, qx + r[2] * w, qy + r[3] * h]);
    { const qy0 = qy + 160 * 1.02, qh = 96 * 1.02; const nq = Math.floor(clamp((t - S[1] - 0.4) * 12, 0, 19)); if (s === 1) { ctx.save(); ctx.fillStyle = "#fff"; ctx.fillRect(qx + 64, qy0 + 4, w - 140, qh - 8); ctx.restore(); C.typed(ctx, 'LOS ANGELES (LAX)  →'.slice(0, nq), qx + 100, qy0 + 65 * 1.02, 0, 99, 45, '#111827', { font: C.F, weight: 700, cursor: true }); } }
    if (s === 1 && t > K.jan - 0.1) C.markerEllipse(ctx, qx + w * 0.3, qy + 40, 190, 40, (t - K.jan + 0.1) / 0.5, 6, C.RED, 6);
    ctx.save(); ctx.fillStyle = '#f4f5f7'; const hideA = t < K.five - 0.2, hideB = t < K.boston - 0.1; if (hideA) ctx.fillRect(rows[0][0], rows[0][1], rows[0][2] - rows[0][0], rows[0][3] - rows[0][1]); if (hideB) ctx.fillRect(rows[1][0], rows[1][1], rows[1][2] - rows[1][0], rows[1][3] - rows[1][1]); ctx.restore();
    if (s === 1) { const hq = [qx + 60, qy + 160 * 1.02, qx + w - 60, qy + 256 * 1.02]; C.highlight(ctx, hq, S[1] + 1.9, t, { dim: 0.25, until: K.blogger + 0.3 }); if (t > S[1] + 0.4) for (let i = 0; i < 2; i++) { const yy = qy + (300 + i * 140) * 1.02; const sh = 0.5 + 0.5 * Math.sin(t * 4 - i); ctx.fillStyle = `rgba(210,214,220,${0.5 + 0.3 * sh})`; C.roundRect(ctx, qx + 60, yy, w - 120, 116, 14); ctx.fill(); } }
    if (s === 2) { C.highlight(ctx, rows[0], K.five - 0.1, t, { dim: 0, until: K.boston - 0.2 }); C.highlight(ctx, rows[1], K.two - 0.1, t, { dim: 0.25 }); if (t > K.same - 0.1) C.markerLine(ctx, C.curve([rows[1][0] + 360, rows[1][3] + 10], [rows[1][0] + 1000, rows[1][3] + 6], 0.03, 30, 1.5), (t - K.same + 0.1) / 0.5, C.RED, 7, false); }
    C.camReset(ctx);
    if (s === 1) { const sb = clamp((t - K.united) / 2.6); if (sb > 0) { ctx.save(); ctx.fillStyle = '#dfe3e8'; ctx.fillRect(qx + 60, qy + 300 * 1.02, (w - 120), 26); ctx.fillStyle = '#2f5d8a'; ctx.fillRect(qx + 60, qy + 300 * 1.02, (w - 120) * sb, 26); ctx.restore(); C.label(ctx, sb < 1 ? 'SEARCHING FARES…' : 'RESULTS', W / 2, qy + 380 * 1.02, { size: 54, col: '#6b7280' }); }
      if (t > K.blogger - 0.1) C.sticky(ctx, ['AIRLINE BLOG', 'JAN 2015'], W * 0.84, H * 0.2, 330, 0.06, (t - K.blogger + 0.1) / 0.3, { h: 190, size: 50 });
      if (t > K.united - 0.1) C.tag(ctx, 'ONE-WAY · UNITED · FROM LAX', 70, H - 70, { size: 34, alpha: eo((t - K.united + 0.1) / 0.3) }); }
    else { if (t > K.two + 0.6) { C.todayTag(ctx, '$295', W - 420, H - 70, K.two + 0.6, t, { size: 40 }); } if (t > K.five + 0.5 && t < K.boston) C.todayTag(ctx, '$800', W - 420, H - 70, K.five + 0.5, t, { size: 40 }); }
  } else if (s === 3) { // two passes: SAME FLIGHT, LESS THAN HALF, +1 FREE FLIGHT
    board(ctx); C.cam(ctx, { z: lerp(1.0, 1.06, U), rot: lerp(0.01, -0.005, U) });
    const ua = eo((t - t0) / 0.4), ub = eo((t - t0 - 0.15) / 0.4); C.flat(ctx, A.passA.c, W * 0.4 - (1 - ua) * 1500, H * 0.29, 1050, -0.025); C.flat(ctx, A.passB.c, W * 0.4 + (1 - ub) * 1500, H * 0.71, 1050, 0.02);
    // flight boxes ("FLIGHT 1") on both passes
    const fa = [W * 0.4 - 525 + 70 * 1050 / 1300, H * 0.29 - 210 + 412 * 1050 / 1300 - 18], fb = [W * 0.4 - 525 + 70 * 1050 / 1300, H * 0.71 - 210 + 412 * 1050 / 1300 - 18];
    C.markerEllipse(ctx, fa[0] + 70, fa[1], 120, 46, (t - K.same2 + 0.1) / 0.4, 3); C.markerEllipse(ctx, fb[0] + 90, fb[1], 140, 46, (t - K.same2 + 0.1) / 0.4 - 0.4, 5);
    if (t > K.same2 + 0.4) C.markerLine(ctx, [[fa[0] + 70, fa[1] + 50], [fb[0] + 90, fb[1] - 50]], (t - K.same2 - 0.4) / 0.3, C.RED, 7, false);
    C.camReset(ctx); if (t > K.same2) C.sticky(ctx, ['SAME FLIGHT'], W * 0.83, H * 0.2, 380, -0.05, (t - K.same2) / 0.3, { h: 130, size: 48 });
    C.punch(ctx, 'LESS THAN HALF', W * 0.83, H * 0.5, K.half - 0.05, t, 110, '#b3241a', { strokeCol: '#f4ecd8', rot: -0.03, maxW: 560 });
    if (t > K.free - 0.1) C.sticky(ctx, ['+1 FREE FLIGHT', '(UNWANTED)'], W * 0.83, H * 0.78, 420, 0.05, (t - K.free + 0.1) / 0.3, { h: 190, size: 50, col: '#cfe3f2', ink: '#13466b' });
  } else if (s === 4) { // map: plane LA → DC, the Boston leg
    const cam = USCAM(U, 0.03 * U); C.map(ctx, cam, {}); const k = (t - t0 - 0.2) / 2.2; const r = C.route(ctx, cam, [LAX, IAD], k, { col: '#1f5f8b', lw: 9, dot: k < 1 ? 'plane' : null, planeS: 0.5, bend: 0.06, dash: [6, 12] });
    if (t > K.buy - 0.1) C.route(ctx, cam, [IAD, BOS], (t - K.buy + 0.1) / 0.9, { col: '#1f5f8b', lw: 9, dot: 'plane', planeS: 0.5, bend: 0.1, dash: [6, 12] });
    C.cityDot(ctx, cam, ...LAX, 'LOS ANGELES', { dy: 46 }); C.cityDot(ctx, cam, ...IAD, 'WASHINGTON', { al: 'right', dy: 44 }); C.cityDot(ctx, cam, ...BOS, 'BOSTON', { dy: -34 });
    if (t > K.buy) { const pb = C.mp(...BOS, cam); C.sticky(ctx, ['BUY: BOSTON'], pb[0] + 40, pb[1] + 280, 330, 0.05, (t - K.buy) / 0.3, { h: 130, size: 48 }); }
    if (t > K.people - 0.1) C.label(ctx, 'THE OBVIOUS MOVE', W * 0.3, H * 0.14, { size: 70, col: '#241c14', alpha: eo((t - K.people + 0.1) / 0.3) });
  } else if (s === 5) { // walk out at Washington while the plane goes on to Boston
    C.paperBg(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.05, U) });
    // airport floor + exit sign
    ctx.fillStyle = '#d9cdb2'; ctx.fillRect(0, H * 0.78, W, H * 0.22); ctx.fillStyle = '#2b3442'; C.roundRect(ctx, W * 0.66, H * 0.12, 560, 150, 18); ctx.fill(); C.label(ctx, 'EXIT  ·  WASHINGTON (IAD)', W * 0.66 + 280, H * 0.12 + 75, { size: 40, col: '#f2d33b', maxW: 520 });
    ctx.fillStyle = '#c3b392'; ctx.fillRect(W * 0.82, H * 0.32, 220, H * 0.46); ctx.fillStyle = '#efe6cf'; ctx.fillRect(W * 0.835, H * 0.35, 190, H * 0.43);
    const px = lerp(W * 0.25, W * 0.86, eio((t - t0) / (t1 - t0 + 0.3))); C.person(ctx, px, H * 0.82, 1.6, { walk: t * 7, bag: true, shirt: '#4a6fa5' });
    // plane continues overhead toward Boston
    const pxp = lerp(-200, W + 300, (t - t0) / 3.2); C.plane(ctx, pxp, H * 0.3, 1.6, -0.06, { col: '#e9edf2', shadow: false }); C.tag(ctx, '→ BOSTON  ·  1 EMPTY SEAT', Math.max(40, Math.min(W - 560, pxp - 260)), H * 0.3 + 210, { size: 36, alpha: clamp((t - t0) / 0.4) });
  } else if (s === 6) { // hidden-city ticketing / skiplagging
    board(ctx); C.cam(ctx, { z: lerp(1.0, 1.06, U) }); C.camReset(ctx);
    C.sticky(ctx, ['HIDDEN-CITY', 'TICKETING'], W * 0.38, H * 0.48, 640, -0.04, (t - K.hidden + 0.15) / 0.3, { h: 380, size: 96 });
    if (t > K.skip - 0.15) { C.sticky(ctx, ['a.k.a.', 'SKIPLAGGING'], W * 0.73, H * 0.55, 520, 0.05, (t - K.skip + 0.15) / 0.3, { h: 320, size: 76, col: '#cfe3f2', ink: '#13466b' }); C.markerLine(ctx, C.curve([W * 0.73 - 210, H * 0.55 + 90], [W * 0.73 + 210, H * 0.55 + 80], 0.04, 30, 2), (t - K.skip - 0.2) / 0.5, C.RED, 8, false); }
    else if (t > K.hidden + 1.0) C.writeOn(ctx, 'the website is coming up →', W * 0.6, H * 0.86, '72px Caveat', '#f4ecd8', (t - K.hidden - 1.0) / 0.9);
  } else if (s === 7) { // not by distance, not by cost
    board(ctx); C.camReset(ctx); C.label(ctx, 'WHY IS LONGER CHEAPER?', W / 2, H * 0.16, { size: 80, col: '#f4ecd8', plate: 'rgba(36,28,20,0.85)' });
    C.sticky(ctx, ['PRICE BY', 'DISTANCE'], W * 0.32, H * 0.56, 520, -0.05, (t - K.why) / 0.3, { h: 300, size: 76 }); C.crossOut(ctx, W * 0.32 - 230, H * 0.56 - 140, W * 0.32 + 230, H * 0.56 + 140, (t - K.distance) / 0.45);
    C.sticky(ctx, ['PRICE BY', 'COST'], W * 0.7, H * 0.56, 520, 0.05, (t - K.distance - 0.3) / 0.3, { h: 300, size: 76, col: '#cfe3f2', ink: '#13466b' }); C.crossOut(ctx, W * 0.7 - 230, H * 0.56 - 140, W * 0.7 + 230, H * 0.56 + 140, (t - K.cost) / 0.45);
  } else if (s === 8) { // joke chart: "how math normally works"
    C.paperBg(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.05, U) }); const ox = 330, oy = H * 0.82, gw = 1260, gh = 640; ctx.strokeStyle = '#241c14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ox, oy - gh); ctx.lineTo(ox, oy); ctx.lineTo(ox + gw, oy); ctx.stroke();
    C.writeOn(ctx, 'DISTANCE →', ox + gw - 10, oy + 70, '54px Marker', '#241c14', (t - t0) / 0.5, 'right'); ctx.save(); ctx.translate(ox - 50, oy - gh + 10); ctx.rotate(-Math.PI / 2); C.writeOn(ctx, 'PRICE →', -gh + 30, 0, '54px Marker', '#241c14', (t - t0) / 0.5); ctx.restore();
    // normal math line (dashed, rising)
    if (t > K.did - 0.2) { ctx.save(); ctx.setLineDash([16, 14]); C.markerLine(ctx, [[ox + 20, oy - 40], [ox + gw - 80, oy - gh + 60]], (t - K.did + 0.2) / 0.8, '#7a6a56', 6, true); ctx.restore(); }
    const pD = [ox + gw * 0.62, oy - gh * 0.72], pB = [ox + gw * 0.82, oy - gh * 0.24];
    if (t > K.did) { ctx.fillStyle = '#b3241a'; ctx.beginPath(); ctx.arc(pD[0], pD[1], 20, 0, 7); ctx.fill(); C.writeOn(ctx, 'WASHINGTON  $588', pD[0] - 30, pD[1] - 40, '50px Marker', '#b3241a', (t - K.did) / 0.4, 'right'); }
    if (t > K.more - 0.3) { ctx.fillStyle = '#1f5f8b'; ctx.beginPath(); ctx.arc(pB[0], pB[1], 20, 0, 7); ctx.fill(); C.writeOn(ctx, 'BOSTON  $216', pB[0] + 30, pB[1] + 70, '50px Marker', '#1f5f8b', (t - K.more + 0.3) / 0.4, 'right');
      C.markerEllipse(ctx, pB[0], pB[1], 70, 60, (t - K.more) / 0.4, 7); }
    if (t > K.math - 0.2) C.sticky(ctx, ['HOW MATH', 'NORMALLY WORKS'], ox + 430, oy - 140, 600, -0.06, (t - K.math + 0.2) / 0.3, { h: 250, size: 72 });
  } else if (s === 9) { // price by market: A → B
    board(ctx); C.cam(ctx, { z: lerp(1.0, 1.05, U) }); C.camReset(ctx);
    C.label(ctx, 'PRICE = WHAT PEOPLE', W / 2, H * 0.22, { size: 90, col: '#f4ecd8', plate: 'rgba(36,28,20,0.85)', alpha: eo((t - t0) / 0.3) });
    if (t > K.market - 0.1) C.label(ctx, 'FROM A TO B WILL PAY', W / 2, H * 0.36, { size: 90, col: '#f2d33b', plate: 'rgba(36,28,20,0.85)', alpha: eo((t - K.market + 0.1) / 0.3) });
    const ax = W * 0.25, bx = W * 0.75, y = H * 0.68; C.sticky(ctx, ['A'], ax, y, 220, -0.05, (t - K.market) / 0.3, { h: 200, size: 120 }); C.sticky(ctx, ['B'], bx, y, 220, 0.05, (t - K.market - 0.2) / 0.3, { h: 200, size: 120 });
    if (t > K.market + 0.4) C.markerLine(ctx, C.curve([ax + 150, y], [bx - 150, y], -0.15, 40, 2), (t - K.market - 0.4) / 0.6, C.RED, 9, true);
    if (t > K.pay - 0.1) C.punch(ctx, '$ ?', W / 2, y - 120, K.pay - 0.1, t, 120, '#b3241a', { strokeCol: '#f4ecd8' });
  } else if (s === 10 || s === 11) { // hub: planes stack into DC ($$$); Boston: rivals race, price drops
    const cam = s === 10 ? { lon: lerp(-86, -82, U), lat: lerp(37, 38.5, U), R: lerp(2600, 3300, ss(U)), dy: 0 } : { lon: lerp(-80, -76, U), lat: lerp(39, 40.5, U), R: 3100, dy: 0 };
    C.map(ctx, cam, {}); const pD = C.mp(...IAD, cam), pB = C.mp(...BOS, cam);
    if (s === 10) { FEED.forEach((f, i) => { const k = (t - K.lots + 0.3 - i * 0.18) / 1.4; C.route(ctx, cam, [f, IAD], k, { col: 'rgba(36,28,20,0.55)', lw: 5, dot: k < 1 ? 'plane' : null, planeS: 0.38, bend: (i % 2 ? 0.1 : -0.1), dash: [4, 10] }); });
      C.cityDot(ctx, cam, ...IAD, 'WASHINGTON', { al: 'right', dy: 50, size: 54 }); C.markerEllipse(ctx, pD[0], pD[1], 110, 90, (t - K.hub) / 0.5, 2);
      if (t > K.hub) C.sticky(ctx, ['HUB'], pD[0] + 210, pD[1] - 170, 220, 0.06, (t - K.hub) / 0.3, { h: 140, size: 70 });
      const k = clamp((t - K.premium + 0.2) / 0.6); if (t > K.lots) C.sticky(ctx, ['NONSTOP TO DC:', '$$$'], pD[0] - 360, pD[1] + 250, 400, -0.05, (t - K.lots) / 0.3, { h: 200, size: 60, col: '#f6c9bf', ink: '#8b1a12' });
    } else { RIV.forEach((r, i) => { const k = (t - K.competes - i * 0.2) / 1.6; C.route(ctx, cam, [[r[0], r[1]], BOS], k, { col: 'rgba(36,28,20,0.45)', lw: 5, dot: k < 1 ? 'plane' : null, planeS: 0.42, bend: 0.12, dash: [4, 10] }); });
      const k0 = (t - t0 - 0.1) / 1.2; C.route(ctx, cam, [IAD, BOS], k0, { col: '#1f5f8b', lw: 8, dot: k0 < 1 ? 'plane' : null, planeS: 0.5, bend: 0.1, dash: [6, 12] });
      C.cityDot(ctx, cam, ...IAD, 'WASHINGTON', { al: 'right', dy: 50, size: 50 }); C.cityDot(ctx, cam, ...BOS, 'BOSTON', { dy: -40, size: 54 });
      if (t > K.conn) C.sticky(ctx, ['RIVAL NONSTOPS', 'TO BOSTON'], W * 0.24, H * 0.25, 420, -0.05, (t - K.competes) / 0.3, { h: 200, size: 56 });
      if (t > K.conn + 0.2 && t < K.cuts - 0.1) C.label(ctx, 'COMPETITION →', W * 0.5, H * 0.9, { size: 64, col: '#241c14', alpha: clamp((t - K.conn - 0.2) / 0.3) });
      if (t > K.cuts - 0.1) C.sticky(ctx, ['TO BOSTON', 'VIA DC: $'], Math.min(W - 230, pB[0] + 160), pB[1] + 300, 380, 0.05, (t - K.conn) / 0.3, { h: 200, size: 66, col: '#cfe3f2', ink: '#13466b' });
      if (t > K.cuts + 0.3) C.punch(ctx, 'PRICE CUT', W * 0.62, H * 0.86, K.cuts + 0.3, t, 96, '#1f5f8b', { strokeCol: '#f4ecd8' }); }
  } else if (s === 12 || s === 13) { // the plane cutaway: $ and $$$ on the same plane; hub money; only works if you go to Boston
    C.paperBg(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.05, U), y: H / 2 + (s === 13 ? lerp(0, -30, U) : 0) }); const tags = ['$', '$$$', '$', '$$$', '$$$', '$', '$$$', '$', '$$$', '$'];
    const rv = s === 12 ? clamp((t - t0) / 2.2) : 1;
    // beats: glow the $ seats on "bargain", flip seats to $$$ on "cash machine", punch-in on two neighbours on "both", pan along the body in the hub-money part, a YOU seat on "actually"
    const flip = {}, flipTo = {}; let glow = [];
    if (s === 12) { if (t > K.bargain - 0.1 && t < K.cash - 0.2) glow = [0, 2, 5, 7, 9]; if (t > K.cash - 0.15) { [1, 3, 6, 8].forEach((i, j) => { flip[i] = clamp((t - K.cash + 0.15 - j * 0.12) / 0.3); flipTo[i] = '$$$'; tags[i] = '$'; }); if (t > K.cash + 0.4 && t < K.both - 0.2) glow = [1, 3, 4, 6, 8]; } }
    else if (t > K.actually - 0.3) { flip[4] = clamp((t - K.actually + 0.3) / 0.35); flipTo[4] = 'you'; glow = [4]; }
    let cz = 1, cxx = W / 2, cyy = H / 2; if (s === 12 && t > K.both - 0.1) { const k = eio((t - K.both + 0.1) / 0.5); cz = lerp(1.0, 1.9, k); cxx = lerp(W / 2, W * 0.36, k); cyy = lerp(H / 2, H * 0.55, k); }
    if (s === 13) { const k = clamp((t - t0) / (K.actually - 0.3 - t0)); cz = lerp(1.35, 1.15, k); cxx = lerp(W * 0.3, W * 0.62, eio(k)); if (t > K.actually - 0.3) { const k2 = eio((t - K.actually + 0.3) / 0.5); cz = lerp(1.15, 1.6, k2); cxx = lerp(W * 0.62, W / 2 - 40 + (4 - 4.5) * 114 + 20, k2); } }
    C.camReset(ctx); C.paperBg(ctx, t); C.cam(ctx, { z: cz, x: cxx, y: cyy });
    C.planeCut(ctx, W / 2 - 40, H * 0.52, 1.0, { tags, reveal: rv, flip, flipTo, glow }, t);
    C.camReset(ctx);
    if (s === 12) { if (t > K.bargain - 0.1) C.sticky(ctx, ['$ = BARGAIN', 'HUNTER'], W * 0.22, H * 0.18, 420, -0.05, (t - K.bargain + 0.1) / 0.3, { h: 190, size: 56, col: '#cfe7d2', ink: '#1f5a33' });
      if (t > K.cash - 0.1) C.sticky(ctx, ['$$$ = CASH', 'MACHINE'], W * 0.74, H * 0.18, 420, 0.05, (t - K.cash + 0.1) / 0.3, { h: 190, size: 56, col: '#f6c9bf', ink: '#8b1a12' });
      C.punch(ctx, 'SAME PLANE', W / 2, H * 0.86, K.both, t, 110, '#241c14', { strokeCol: '#f4ecd8' }); if (t > K.both + 0.3) { C.tag(ctx, '$  PAID LESS', W * 0.2, H * 0.3, { size: 40, bg: '#cfe7d2', col: '#1f5a33' }); C.tag(ctx, '$$$  PAID MORE', W * 0.52, H * 0.3, { size: 40, bg: '#f6c9bf', col: '#8b1a12' }); } }
    else { C.label(ctx, 'THAT MIX = HUB MONEY', W / 2, H * 0.16, { size: 76, col: '#f4ecd8', plate: 'rgba(36,28,20,0.85)' });
      for (let i = 0; i < 10; i++) { const u = ((t - t0) * 0.7 + i * 0.1) % 1; C.bill(ctx, lerp(W * 0.2 + i * 130, W / 2, u), lerp(H * 0.62, H * 0.92, u), 0.7, i * 0.3, 1 - u); }
      if (t > K.actually + 0.2) C.label(ctx, 'YOU →  BOSTON', W * 0.5, H * 0.28, { size: 70, col: '#2f5d8a', plate: 'rgba(244,236,216,0.9)', alpha: clamp((t - K.actually - 0.2) / 0.3) });
      C.sticky(ctx, ['ONLY WORKS IF YOU', 'ACTUALLY GO TO BOSTON'], W / 2, H * 0.84, 860, -0.02, (t - K.actually + 0.3) / 0.3, { h: 200, size: 60 }); }
  } else if (s === 14) { // skip the last flight: scissors cut, equation
    board(ctx); C.cam(ctx, { z: lerp(1.0, 1.06, U) }); C.flat(ctx, A.passB.c, W / 2, H * 0.4, 1200, -0.015); const cutX = W / 2 - 600 + A.passB.pos[1] * 1200 / 1300 + 110;
    const k = clamp((t - K.skipl) / 0.6); ctx.save(); ctx.strokeStyle = '#b3241a'; ctx.lineWidth = 7; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(cutX, H * 0.4 - 250); ctx.lineTo(cutX, lerp(H * 0.4 - 250, H * 0.4 + 250, k)); ctx.stroke(); ctx.restore();
    if (k > 0.95) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = '#c8b894'; ctx.fillRect(cutX, H * 0.4 - 240, 380, 420); ctx.restore(); C.writeOn(ctx, 'skipped', cutX + 40, H * 0.4 + 30, '80px Marker', '#b3241a', (t - K.skipl - 0.6) / 0.4); }
    C.camReset(ctx); if (t > K.cheap - 0.1) C.label(ctx, 'CHEAP PRICE', W * 0.3, H * 0.84, { size: 86, col: '#1f5f8b', alpha: eo((t - K.cheap + 0.1) / 0.3), plate: 'rgba(244,236,216,0.9)' });
    if (t > K.expensive - 0.1) C.label(ctx, '+ EXPENSIVE TRIP', W * 0.7, H * 0.84, { size: 86, col: '#b3241a', alpha: eo((t - K.expensive + 0.1) / 0.3), plate: 'rgba(244,236,216,0.9)' });
  } else { // the airline's official position (joke beat)
    board(ctx); C.cam(ctx, { z: lerp(1.0, 1.07, U) }); C.flat(ctx, A.notice, W * 0.42, H * 0.46, 1100, -0.03, { blur: 34 }); C.stamp(ctx, 'OFFICIAL', W * 0.62, H * 0.24, K.must, t, 70, '#b3241a', 0.12);
    C.camReset(ctx); if (t > K.whether - 0.1) { C.person(ctx, W * 0.88, H * 0.97, 1.15, { shirt: '#4a6fa5' }); C.sticky(ctx, ['WANT TO BE', 'IN BOSTON?'], W * 0.8, H * 0.38, 380, 0.05, (t - K.whether + 0.1) / 0.3, { h: 200, size: 56, col: '#cfe3f2', ink: '#13466b' }); }
    if (t > K.problem - 0.1) C.stamp(ctx, 'NOT OUR PROBLEM', W * 0.42, H * 0.87, K.problem - 0.1, t, 80, '#241c14', -0.03);
  }
  C.finish(ctx, t, { mode, fade: t > T - 0.35 ? (t - (T - 0.35)) / 0.35 : (t < 0.25 ? 1 - t / 0.25 : 0) });
  const cv = ctx.canvas; WHIPS.forEach((x, i) => C.whip(ctx, cv, t, x, i % 2 ? -1 : 1));
}
function cues() { return { T, whoosh: WHIPS.map(x => x - 0.1), type: [[0.15, 0.5], [st('p01') + 0.3, 0.8]], paper: [S[1], S[3], S[3] + 0.15, K.blogger - 0.1, K.free - 0.1, K.hidden - 0.15, K.skip - 0.15, K.why, K.distance + 0.3, K.math - 0.2, K.market, K.hub, K.lots, K.competes, K.conn, K.bargain - 0.1, K.cash - 0.1, K.actually - 0.3, K.whether - 0.1],
  marker: [K.same - 0.1, K.same2 - 0.1, K.distance, K.cost, K.did - 0.2, K.more, K.market + 0.4, K.hub, K.skipl, K.skip - 0.2], hit: [K.half - 0.05, K.pay - 0.1, K.both, K.cuts + 0.3, K.cheap - 0.1, K.expensive - 0.1], stamp: [K.must, K.problem - 0.1],
  plane: [S[4] + 0.2, K.buy - 0.1, S[5], K.lots - 0.3, K.competes], counter: [], footsteps: [[S[5], (S[6] - S[5])]], ding: [K.five - 0.2, K.boston - 0.1], mode: [[0, 'paper']] }; }
module.exports = { T, frame, cues, tl };
if (require.main === module) { const m = process.argv[2];
  if (m === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log('T', T); }
  else if (m === 'still') C.stills(process.argv[3].split(',').map(Number), process.argv[4], frame);
  else if (m === 'sheet') { const ts = []; for (let x = 0.3; x < T; x += 2.0) ts.push(+x.toFixed(2)); C.stills(ts, process.argv[3], frame, 8, 0.15); }
  else if (m === 'video') C.render(path.join(D, 'seg_video.mp4'), T, frame).then(() => console.log('done', T)); }
