// Outro "The Verdict" (z00 … z04) + ~20 s end-screen tail. Paper section (analyst argument, $588 vs $216) → dark desk (verdict, twist, question).
// End screen: calm desk with two EMPTY areas for YouTube's end-screen elements (left: video box, right: subscribe circle). No like/subscribe text.
// node episode.js video | still t1,t2,.. out.png | sheet out.png | cues
const C = require('../../lib/casefile'); C.fonts();
const path = require('path'), fs = require('fs');
const D = __dirname, FILM = path.join(D, '../..');
const { W, H, clamp, lerp, eo, eio, ss, back, hash } = C;
const IDS = ['z00', 'z00b', 'z01', 'z01b', 'z03', 'z04'];
const END = 20.0;
const tl = C.timeline(FILM, 'c5_outro', IDS, { lead: 0.4, pause: { z00: 0.3, z00b: 0.4, z01: 3.3, z01b: 0.5, z03: 0.4 }, tail: 2.2 + END });
const T = tl.T, at = tl.at, st = tl.start, en = tl.end;
const K = {
  analysts: at('z00', 'analysts'), brett: at('z00', 'brett'), cranky: at('z00', 'cranky'), argue: at('z00', 'argue'), everyone: at('z00', 'everyone'), fairer: at('z00', 'fairer'),
  fewer: at('z00', 'fewer'), smaller: at('z00', 'smaller'), routes: at('z00', 'routes'), altogether: at('z00', 'altogether'),
  wrong: at('z00b', 'wrong'), costs: at('z00b', 'costs'), defending: at('z00b', 'defending'), shorter: at('z00b', 'shorter'), three: at('z00b', 'three'),
  verdict: at('z01', 'verdict'),
  twist: at('z01b', 'twist'), week: at('z01b', 'week'), skift: at('z01b', 'skift'), still: at('z01b', 'still'), selling: at('z01b', 'selling'), trick: at('z01b', 'trick'), survived: at('z01b', 'survived'), logo: at('z01b', 'logo'), expensive: at('z01b', 'expensive'),
  never: at('z03', 'never'), little: at('z03', 'little'), saw: at('z03', 'saw'), everyone3: at('z03', 'everyone'), paying: at('z03', 'paying'),
  hundred: at('z04', 'hundred'), risk: at('z04', 'risk'), four: at('z04', 'four'), without: at('z04', 'without'), which: at('z04', 'which'), comments: at('z04', 'comments')
};
const ENDT = en('z04') + 2.2; // end-screen starts
const S = [0, K.fewer - 0.15, st('z00b') - 0.12, st('z01') - 0.12, st('z01b') - 0.12, K.trick - 0.15, st('z03') - 0.12, st('z04') - 0.12, ENDT];
// ---- assets ----
const A = {};
A.quote = (() => { const [c, x] = C.docPaper(1400, 760, '#f3eee2', 51); C.ct(x, 'THE AIRLINES\' SIDE', 700, 110, `700 40px ${C.MONO}`, '#5a4a36'); x.fillStyle = '#241c14'; x.fillRect(250, 140, 900, 4);
  C.ct(x, 'BRETT SNYDER', 700, 270, `900 110px ${C.F}`, '#241c14'); C.ct(x, 'airline analyst · Cranky Flier blog', 700, 340, `italic 40px ${C.SERIF}`, '#5a4a36');
  C.ct(x, 'ARGUES: IF EVERYONE DID IT…', 700, 470, `700 50px ${C.F}`, '#b3241a'); C.ct(x, 'not fairer prices —', 700, 560, `italic 48px ${C.SERIF}`, '#241c14'); C.ct(x, 'PARAPHRASED', 1300, 720, `600 20px ${C.MONO}`, '#8a7a66', 'right'); return c; })();
A.passA = C.boardingPass({ legs: [['LAX', 'IAD']], cities: ['LOS ANGELES', 'WASHINGTON'], carrier: 'SHORTER TRIP', info: [['TO', 'DULLES'], ['TYPE', 'NONSTOP'], ['YEAR', '2015']], price: '$588', accent: '#8b2a22' });
A.passB = C.boardingPass({ legs: [['LAX', 'IAD'], ['IAD', 'BOS']], cities: ['LOS ANGELES', 'WASHINGTON', 'BOSTON'], carrier: 'LONGER TRIP', info: [['TO', 'BOSTON'], ['VIA', 'DULLES'], ['YEAR', '2015']], price: '$216', accent: '#1f5f8b' });
const ROWS = [['THE TRICK', 'LEGAL', '#2f7d4f'], ['THE RULES', 'BROKEN', '#b3241a'], ['LUFTHANSA', 'LOST', '#2f7d4f'], ['THE TEENAGER', 'BANNED (PER DAD)', '#b3241a'], ['THE WEBSITE', '$9.4M — FOR A LOGO', '#b3241a']];
A.verdict = C.verdictCard({ case: 'CASE FILE: SKIPLAGGING', title: 'VERDICT', rows: ROWS });
A.site = C.siteCard({ name: 'SKIPLAGGED', tagline: 'one week after the verdict', input: 'Washington, DC  →  Philadelphia', rows: [['AMERICAN · ONE-WAY', '$162', 'incl. $35 fee · reported by Skift, Oct 23 2024']], note: 'RE-CREATED from Skift report' });
A.rA = C.docReceipt({ title: 'TICKET A', rows: [['ROUTE', 'GNV→CLT→NYC'], ['YOU FLY', 'GNV→CLT'], ['RISK', 'YES']], total: ['TOTAL', '$150'], note: 'skip the last leg' });
A.rB = C.docReceipt({ title: 'TICKET B', rows: [['ROUTE', 'GNV→CLT'], ['YOU FLY', 'GNV→CLT'], ['RISK', 'NONE']], total: ['TOTAL', '$400'], note: 'direct' });
const LAX = [-118.41, 33.94], IAD = [-77.46, 38.95], BOS = [-71.01, 42.36];
const HUBS = [[-87.9, 41.98], [-84.43, 33.64], [-97.04, 32.9], [-104.67, 39.86], [-77.46, 38.95]];
const SPOKES = [[-122.38, 37.62], [-122.31, 47.45], [-112.01, 33.43], [-111.98, 40.79], [-93.22, 44.88], [-90.37, 38.75], [-86.68, 36.12], [-80.29, 25.8], [-81.31, 28.43], [-71.01, 42.36], [-73.78, 40.64], [-95.34, 29.98], [-83.35, 42.21], [-80.94, 35.21], [-118.41, 33.94], [-98.47, 29.53], [-76.67, 39.18], [-82.89, 39.99]];
const LINKS = []; SPOKES.forEach((s, i) => { LINKS.push([HUBS[i % HUBS.length], s]); if (i % 3 === 0) LINKS.push([HUBS[(i + 2) % HUBS.length], s]); });
// ---- helpers ----
const scene = t => { let i = 0; while (i < S.length - 1 && t >= S[i + 1]) i++; return i; };
function frame(ctx, t) { C.camReset(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const s = scene(t); const t0 = S[s], t1 = s < S.length - 1 ? S[s + 1] : T, U = clamp((t - t0) / (t1 - t0));
  let mode = 'dark';
  if (s === 0) { // the airlines' side: analyst quote card over a busy route map
    mode = 'paper'; const cam = { lon: -95, lat: 38.5, R: lerp(1950, 2050, U), dy: 20 }; C.map(ctx, cam, { hl: ['840'], hlCol: 'rgba(240,215,150,0.3)' });
    LINKS.forEach(([a, b], i) => C.route(ctx, cam, [a, b], (t - 0.1 - i * 0.05) / 0.6, { col: 'rgba(31,95,139,0.75)', lw: 4, dash: [8, 8], bend: 0.08 }));
    HUBS.forEach(h => C.cityDot(ctx, cam, h[0], h[1], null, { r: 13, col: '#b3241a' }));
    const k = eo((t - K.analysts + 0.2) / 0.5); ctx.save(); ctx.fillStyle = `rgba(232,221,196,${0.45 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (k > 0) { C.cam(ctx, { z: lerp(1.0, 1.05, U) }); C.flat(ctx, A.quote, W / 2, H * 0.5 + (1 - k) * 80, 1150 * lerp(0.9, 1, k), -0.02, { alpha: k }); C.camReset(ctx);
      if (t > K.cranky) C.highlighter(ctx, W / 2 - 300, H * 0.5 - 70, 600, 46, (t - K.cranky) / 0.6);
      if (t > K.argue) C.markerLine(ctx, C.curve([W / 2 - 330, H * 0.5 + 40], [W / 2 + 330, H * 0.5 + 34], 0.01, 30, 2), (t - K.argue) / 0.5, C.RED, 8, false);
      C.sticky(ctx, ['IF EVERYONE', 'DID IT…'], W * 0.85, H * 0.2, 380, 0.06, (t - K.everyone + 0.1) / 0.3, { h: 240, size: 58 });
      C.stamp(ctx, 'NOT FAIRER PRICES', W * 0.5, H * 0.86, K.fairer - 0.05, t, 80, '#b3241a', -0.04); }
  } else if (s === 1) { // fewer flights · smaller planes · routes cut — the map empties
    mode = 'paper'; const cam = { lon: -95, lat: 38.5, R: 2050, dy: 20 }; C.map(ctx, cam, { hl: ['840'], hlCol: 'rgba(240,215,150,0.3)' });
    LINKS.forEach(([a, b], i) => { const gone = t > K.fewer + 0.1 + (i % 6) * 0.25 + (i % 2) * (K.routes - K.fewer) * 0.6; if (gone) return; C.route(ctx, cam, [a, b], 1, { col: 'rgba(31,95,139,0.75)', lw: 4, dash: [8, 8], bend: 0.08 }); });
    HUBS.forEach((h, i) => { const p = C.mp(h[0], h[1], cam); const sc = t > K.smaller ? lerp(0.5, 0.22, eo((t - K.smaller - i * 0.1) / 0.5)) : 0.5; C.plane(ctx, p[0], p[1] - 30, sc, -0.3, { col: '#1d2430' }); });
    C.sticky(ctx, ['FEWER FLIGHTS'], W * 0.22, H * 0.82, 440, -0.05, (t - K.fewer + 0.1) / 0.3, { h: 170, size: 64 });
    C.sticky(ctx, ['SMALLER PLANES'], W * 0.5, H * 0.86, 440, 0.04, (t - K.smaller + 0.1) / 0.3, { h: 170, size: 64 });
    C.sticky(ctx, ['ROUTES CUT'], W * 0.78, H * 0.82, 440, -0.04, (t - K.routes + 0.1) / 0.3, { h: 170, size: 64, col: '#f6c9bf', ink: '#8b1a12' });
    C.tag(ctx, 'BRETT SNYDER · CRANKY FLIER (ARGUMENT)', 70, 100, { size: 28 });
  } else if (s === 2) { // they're not wrong — but $588 vs $216
    mode = 'paper'; C.paperBg(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.06, U), x: W / 2 + lerp(-20, 20, U) });
    const kA = eo((t - t0) / 0.5), kB = eo((t - K.defending + 0.1) / 0.5);
    C.flat(ctx, A.passA.c, W * 0.5 - (1 - kA) * 200, H * 0.3, 1050 * (0.9 + 0.1 * kA), -0.02, { alpha: kA, border: 0 });
    if (kB > 0) C.flat(ctx, A.passB.c, W * 0.5 + (1 - kB) * 200, H * 0.7, 1050 * (0.9 + 0.1 * kB), 0.02, { alpha: kB, border: 0 });
    C.camReset(ctx); if (t > K.wrong - 0.1 && t < K.defending) C.sticky(ctx, ['IT DOES', 'COST THEM'], W * 0.86, H * 0.66, 360, 0.06, (t - K.wrong + 0.1) / 0.3, { h: 260, size: 60 });
    if (t > K.shorter) C.markerEllipse(ctx, W * 0.5 + 360, H * 0.3, 190, 110, (t - K.shorter) / 0.5, 3, C.RED, 9);
    C.punch(ctx, 'ALMOST 3×', W * 0.5, H * 0.5, K.three - 0.05, t, 130, '#b3241a', { rot: -0.06, strokeCol: 'rgba(244,236,216,0.95)' });
  } else if (s === 3) { // So, the verdict. — rows revealed one by one
    C.desk(ctx, t, { warm: true }); const k = eo((t - t0) / 0.5); C.cam(ctx, { z: lerp(1.08, 1.0, eo((t - t0) / 1.2)) + 0.03 * U });
    const vw = 1250, vh = vw * A.verdict.h / 1400, y0 = H * 0.53 - vh / 2 + (1 - k) * 300;
    ctx.save(); ctx.globalAlpha = k; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.drawImage(A.verdict.c, W / 2 - vw / 2, y0, vw, vh); ctx.restore();
    // cover the rows not yet revealed (paper-coloured slips that peel away)
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - vw / 2, y0, vw, vh); ctx.clip();
    ROWS.forEach((r, i) => { const tr = K.verdict + 0.55 + i * 0.6; const ry = y0 + A.verdict.rowY[i] * vh; const u = eo((t - tr) / 0.3); if (u >= 1) return; ctx.save(); ctx.fillStyle = '#ece4d4'; ctx.fillRect(W / 2 - vw / 2 + 60 + u * vw, ry - 50, vw - 120, 74); ctx.restore(); }); ctx.restore();
    C.camReset(ctx); C.typed(ctx, 'CASE FILE  //  CLOSED', 80, 96, t0 + 0.1, t, 32, '#f2d33b');
  } else if (s === 4) { // the twist: still selling, a week later
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.1, U), rot: lerp(-0.01, 0.01, U) });
    const p = C.pose(W * 0.5, H * 0.56 + Math.sin(t) * 5, 1150, 672, { rx: lerp(0.5, 0.2, eo((t - t0) / 0.7)), ry: -0.08, rz: -0.02, z: lerp(260, 0, eo((t - t0) / 0.5)) }); C.card3d(ctx, A.site.c, p);
    if (t > K.still - 0.05) C.highlight(ctx, C.boxOf(p, A.site.hl[0]), K.still - 0.05, t, { dim: 0.45 });
    C.camReset(ctx); C.typed(ctx, 'A WEEK LATER', 80, 96, K.week - 0.1, t, 40, '#f2d33b'); C.label(ctx, 'THE TWIST', W * 0.5, H * 0.14, { size: 84, alpha: eo((t - K.twist + 0.1) / 0.3) });
    if (t > K.skift - 0.1) C.tag(ctx, 'STILL SELLING (PER SKIFT)', W * 0.5, H * 0.94, { size: 44, al: 'center', alpha: eo((t - K.skift + 0.1) / 0.3) });
  } else if (s === 5) { // the trick survived · the logo was the expensive part
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.05, U) }); C.camReset(ctx);
    C.punch(ctx, 'THE TRICK SURVIVED', W / 2, H * 0.36, K.trick - 0.05, t, 130, '#7fae7a'); C.punch(ctx, 'THE LOGO WAS', W / 2, H * 0.58, K.logo - 0.05, t, 110, '#f3efe6'); C.punch(ctx, 'THE EXPENSIVE PART', W / 2, H * 0.74, K.expensive - 0.05, t, 120, '#f2d33b');
    C.stamp(ctx, '$4.7M', W * 0.86, H * 0.2, K.expensive + 0.35, t, 70, '#d0281c', 0.1);
  } else if (s === 6) { // you saw what everyone else was paying for — the seat map
    mode = 'paper'; C.paperBg(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.06, U), x: W / 2 + lerp(30, -30, U) });
    const tags = ['$$$', '$', '$$$', '$$$', '$', 'you', '$$$', '$', '$$$', '$$$'];
    C.planeCut(ctx, W / 2, H * 0.55, 1.05, { tags, reveal: clamp((t - t0) / 1.0), glow: t > K.saw ? [5] : [] }, t); C.camReset(ctx);
    if (t < K.saw - 0.1) { C.label(ctx, 'YOU PAID TOO LITTLE?', W / 2, H * 0.17, { size: 86, col: '#241c14', alpha: eo((t - K.never + 0.2) / 0.3) }); if (t > K.little + 0.2) C.crossOut(ctx, W / 2 - 500, H * 0.12, W / 2 + 500, H * 0.22, (t - K.little - 0.2) / 0.4, C.RED, 12); }
    else C.label(ctx, 'YOU SAW THE PRICES', W / 2, H * 0.17, { size: 96, col: '#b3241a', alpha: eo((t - K.saw + 0.1) / 0.3) });
    if (t > K.everyone3) C.sticky(ctx, ['$$$ = EVERYONE', 'ELSE\'S TICKET'], W * 0.83, H * 0.86, 440, 0.05, (t - K.everyone3) / 0.3, { h: 200, size: 52 });
  } else if (s === 7) { // the comment question: two receipts
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.05, U) });
    const kA = eo((t - t0) / 0.5), kB = eo((t - K.four + 0.2) / 0.5);
    if (kA > 0) C.flat(ctx, A.rA.c, W * 0.3, H * 0.52 + (1 - kA) * 200, 560, -0.05, { alpha: kA });
    if (kB > 0) C.flat(ctx, A.rB.c, W * 0.7, H * 0.52 + (1 - kB) * 200, 560, 0.05, { alpha: kB });
    C.camReset(ctx); C.stamp(ctx, 'WITH THE RISK', W * 0.3, H * 0.86, K.risk, t, 54, '#d0281c', -0.05); C.stamp(ctx, 'WITHOUT IT', W * 0.7, H * 0.86, K.without, t, 54, '#2f7d4f', 0.05);
    if (t > K.which - 0.1) { const k = eo((t - K.which + 0.1) / 0.3); ctx.save(); ctx.fillStyle = `rgba(0,0,0,${0.45 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); C.label(ctx, 'WHICH TICKET ARE YOU BUYING?', W / 2, H * 0.14, { size: 92, col: '#f2d33b', alpha: k }); }
    if (t > K.comments - 0.1) C.sticky(ctx, ['TELL ME', 'BELOW ↓'], W / 2, H * 0.5, 380, -0.04, (t - K.comments + 0.1) / 0.3, { h: 240, size: 70 });
  } else { // end screen: calm desk, two empty areas for YouTube elements
    C.desk(ctx, t, { warm: true, sy: H * 0.45 }); const k = eo((t - t0) / 1.2);
    // softly drifting case papers at the edges (never in the element areas)
    ctx.save(); ctx.globalAlpha = 0.5 * k; C.flat(ctx, A.passB.c, W * 0.5 + Math.sin(t * 0.2) * 20, H * 0.93, 700, 0.04, {}); C.flat(ctx, A.rA.c, W * 0.93, H * 0.12, 260, 0.12, {}); C.flat(ctx, A.rB.c, W * 0.06, H * 0.14, 240, -0.1, {}); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 3; ctx.setLineDash([14, 12]); C.roundRect(ctx, 150, 340, 820, 462, 18); ctx.stroke(); ctx.beginPath(); ctx.arc(1450, 571, 170, 0, 7); ctx.stroke(); ctx.restore();
    C.label(ctx, "HOW IT'S RUN", W / 2, H * 0.12, { size: 64, col: '#f2d33b', alpha: k }); C.label(ctx, 'CASE FILE', W / 2, H * 0.2, { size: 34, col: '#d8d2c4', alpha: k * 0.8 });
  }
  C.finish(ctx, t, { mode, fade: t > T - 0.6 ? (t - (T - 0.6)) / 0.6 : 0 });
  const cv = ctx.canvas; C.whip(ctx, cv, t, S[2], 1); C.whip(ctx, cv, t, S[3], -1); C.glitch(ctx, cv, t, S[4]); C.whip(ctx, cv, t, S[5], 1); C.whip(ctx, cv, t, S[6], -1); C.whip(ctx, cv, t, S[7], 1);
}
function cues() { return { T,
  whoosh: [S[2], S[3], S[5], S[6], S[7]].map(x => x - 0.1), glitch: [S[4]],
  stamp: [K.fairer - 0.05, K.risk, K.without, K.expensive + 0.35, ...ROWS.map((_, i) => K.verdict + 0.55 + i * 0.6)],
  hit: [K.three - 0.05, K.trick - 0.05, K.expensive - 0.05], ding: [K.saw],
  paper: [K.everyone - 0.1, S[7], K.analysts - 0.2, K.fewer - 0.1, K.smaller - 0.1, K.routes - 0.1, S[2], K.defending - 0.1, K.wrong - 0.1, K.hundred - 0.2, K.four - 0.2, K.comments - 0.1, K.everyone3],
  marker: [K.cranky, K.argue, K.shorter, K.little + 0.2], plane: [0.2], type: [[S[3] + 0.1, 0.6], [K.week - 0.1, 0.4]],
  mode: [[0, 'paper'], [S[3], 'dark'], [S[6], 'paper'], [S[7], 'dark']] }; }
module.exports = { T, frame, cues, tl };
if (require.main === module) { const m = process.argv[2];
  if (m === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log('T', T, 'end screen at', ENDT.toFixed(2)); }
  else if (m === 'still') C.stills(process.argv[3].split(',').map(Number), process.argv[4], frame);
  else if (m === 'sheet') { const ts = []; for (let x = 0.1; x < T; x += 1.0) ts.push(+x.toFixed(2)); C.stills(ts, process.argv[3], frame, 8, 0.15); }
  else if (m === 'video') C.render(path.join(D, 'seg_video.mp4'), T, frame).then(() => console.log('done', T)); }
