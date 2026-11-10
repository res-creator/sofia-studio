// Part 2 "The Kid with the Search Engine" (k01–k14) — DARK EVIDENCE DESK chapter of the Case File style (+ one map insert, OUR TAKE).
// node episode.js video | still t1,t2,.. out.png | sheet out.png | cues
const C = require('../../lib/casefile'); C.fonts();
const path = require('path'), fs = require('fs');
const D = __dirname, FILM = path.join(D, '../..');
const { W, H, clamp, lerp, eo, eio, ss, back, hash } = C;
const IDS = ['k01', 'k01b', 'k02', 'k03', 'k04', 'k05', 'k07', 'k08', 'k09', 'k10', 'k11', 'k12', 'k13', 'k14'];
const tl = C.timeline(FILM, 'c2_kid', IDS, { lead: 2.6, pause: { k01b: 0.2, k04: 0.25, k09: 0.3, k11: 0.3, k13: 0.2 }, tail: 1.9 }); const T = tl.T, at = tl.at, st = tl.start, en = tl.end;
const K = {
  so: at('k01', 'obvious'), why: at('k01', 'why'), every: at('k01', 'everyone'), hunt: at('k01b', 'hunt'), hand: at('k01b', 'hand'),
  y2013: at('k02', '2013'), age: at('k02', '20-year-old'), ny: at('k02', 'new'), named: at('k02', 'aktarer'), built: at('k02', 'built'), auto: at('k02', 'automatically'),
  called: at('k03', 'skiplagged'), type: at('k03', 'type'), go: at('k03', 'go'), shows: at('k03', 'shows'), pass: at('k03', 'pass'),
  put: at('k04', 'put'), trick: at('k04', 'trick'), while_: at('k04', 'while'), just: at('k04', 'just'), access: at('k04', 'accessible'),
  nov: at('k05', 'november'), enough: at('k05', 'enough'), united: at('k05', 'united'), orbitz: at('k05', 'orbitz'), sued: at('k05', 'sued'), seventy: at('k05', 'seventy'), lost: at('k05', 'lost'),
  acc: at('k07', 'according'), bans: at('k07', 'bans'), because: at('k07', 'because'), logistical: at('k07', 'logistical'), safety: at('k07', 'safety'), concerns: at('k07', 'concerns'),
  was22: at('k08', '22'), asked: at('k08', 'asked'), internet: at('k08', 'internet'), as: at('k08', 'as'), bullied: at('k08', 'bullied'), corps: at('k08', 'corporations'), support: at('k08', 'support'), wrote: at('k08', 'wrote'),
  dec: at('k09', 'december'), sixteen: at('k09', 'sixteen'), strangers: at('k09', 'strangers'), thirty: at('k09', 'thirty-three'), lawyers: at('k09', 'lawyers'),
  lawsuit10: at('k10', 'lawsuit'), plan: at('k10', 'plan'), made: at('k10', 'made'), famous: at('k10', 'famous'),
  lot: at('k11', 'lot'), never: at('k11', 'never'), now: at('k11', 'now'), exactly: at('k11', 'exactly'), find: at('k11', 'find'),
  y2015: at('k12', '2015'), judge: at('k12', 'judge'), threw: at('k12', 'threw'), out: at('k12', 'out'), not: at('k12', 'not'), right: at('k12', 'right'), because2: at('k12', 'because'),
  court: at('k12', 'court'), nosay: at('k12', 'no'), over: at('k12', 'over'),
  orbitz2: at('k13', 'orbitz'), settled: at('k13', 'settled'), united2: at('k13', 'united'), again: at('k13', 'again'),
  round: at('k14', 'round'), kid: at('k14', 'kid') };
// scene starts
const S = [0, st('k01') - 0.15, st('k02') - 0.15, K.built - 0.12, st('k03') - 0.12, st('k04') - 0.12, st('k05') - 0.15, st('k07') - 0.12, st('k08') - 0.12, st('k09') - 0.12,
  st('k10') - 0.15, st('k11') - 0.12, st('k12') - 0.15, st('k13') - 0.12, st('k14') - 0.12];
const GLITCH = [S[6], S[12]], WHIPS = [S[2], S[4], S[5], S[7], S[8], S[9], S[10], S[13], S[14]];
const scene = t => { let i = 0; while (i < S.length - 1 && t >= S[i + 1]) i++; return i; };
// ---------------- assets ----------------
const A = {};
// a hand-hunted fare card (generic): small search card with one hidden-city row circled
A.hunt = [0, 1, 2, 3, 4, 5].map(i => C.searchCard({ url: 'fare search', head: 'ONE-WAY  ·  1 ADULT', query: ['NEW YORK → CHICAGO', 'DENVER → DALLAS', 'MIAMI → ATLANTA', 'BOSTON → CHICAGO', 'SEATTLE → DENVER', 'AUSTIN → PHOENIX'][i] + '?',
  rows: [['TRY: … via ' + ['CHICAGO', 'DALLAS', 'ATLANTA', 'CHICAGO', 'DENVER', 'PHOENIX'][i], ['$' + (140 + i * 23)][0], 'checked by hand'], ['TRY: another city', '—', 'no luck']], note: 'RE-CREATED · ILLUSTRATION' }));
// founder index card (generic figure, no likeness)
A.index = (() => { const w = 1000, h = 640, [c, x] = C.docPaper(w, h, '#f4efe2', 41, false); x.fillStyle = '#c94a3f'; x.fillRect(0, 110, w, 4); for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(80,120,170,0.35)'; x.fillRect(0, 170 + i * 52, w, 2); }
  C.ct(x, 'FILE: THE FOUNDER', 50, 80, `400 44px Typer`, '#241c14', 'left'); x.fillStyle = '#d8d0bf'; x.fillRect(60, 170, 300, 380); C.person(x, 210, 560, 0.95, { shirt: '#5b6b7d', hair: '#2a1e16', skin: '#d9a77c' });
  x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(60, 520, 300, 30); C.ct(x, 'ILLUSTRATION · NOT A LIKENESS', 210, 542, `600 16px ${C.MONO}`, '#f4efe2');
  [['NAME', 'AKTARER ZAMAN'], ['AGE', '20'], ['CITY', 'NEW YORK'], ['YEAR', '2013']].forEach(([a, b], i) => { C.ct(x, a, 410, 230 + i * 100, `600 26px ${C.MONO}`, '#7a6a56', 'left'); C.ct(x, b, 410, 272 + i * 100, `400 46px Typer`, '#241c14', 'left', 560); });
  return { c, rows: [0, 1, 2, 3].map(i => [0.4, (195 + i * 100) / h, 0.98, (285 + i * 100) / h]) }; })();
A.site = C.siteCard({ name: 'SKIPLAGGED', tagline: 're-created · not a screenshot', input: 'Where do you want to go?', rows: [], note: 'RE-CREATED INTERFACE · ILLUSTRATION' });
A.siteRes = C.siteCard({ name: 'SKIPLAGGED', tagline: 're-created · not a screenshot', input: 'CHICAGO', rows: [['NYC → CHICAGO', '$289', 'direct'], ['NYC → MILWAUKEE  (get off in CHICAGO)', '$139', 'passes through CHICAGO']], note: 'RE-CREATED INTERFACE · EXAMPLE FARES' });
A.complaint = C.docComplaint({ district: 'NORTHERN DISTRICT OF ILLINOIS', caption: ['UNITED AIRLINES', 'ORBITZ', 'v.', 'SKIPLAGGED', 'AKTARER ZAMAN'], title: 'COMPLAINT', claims: ['UNFAIR COMPETITION'], amount: '$75,000', date: 'NOVEMBER 2014', seed: 3 });
// quote slip for the lawsuit's reason
A.quote = (() => { const w = 1400, h = 620, [c, x] = C.docPaper(w, h, '#efe8d8', 52, false); C.ct(x, 'FROM THE LAWSUIT — UNITED BANS HIDDEN-CITY TICKETS OVER:', 70, 90, `600 28px ${C.MONO}`, '#7a6a56', 'left', w - 140);
  x.fillStyle = '#241c14'; x.fillRect(70, 110, w - 140, 3); C.ct(x, '“LOGISTICAL', w / 2, 290, `700 120px ${C.SERIF}`, '#241c14'); C.ct(x, 'AND PUBLIC SAFETY', w / 2, 420, `700 96px ${C.SERIF}`, '#241c14'); C.ct(x, 'CONCERNS”', w / 2, 540, `700 96px ${C.SERIF}`, '#241c14');
  return { c, hl: [[0.08, 0.28, 0.92, 0.5], [0.1, 0.55, 0.9, 0.72], [0.25, 0.75, 0.75, 0.92]] }; })();
// re-created fundraising page (no real branding)
const QUOTE = ['“As a 22-year-old with a startup', 'being bullied by these large', 'corporations, your support', 'means so much to me.”'];
A.fund = (() => { const w = 1300, h = 860, [c, x] = C.mk(w, h); x.fillStyle = '#f7f7f5'; C.roundRect(x, 0, 0, w, h, 20); x.fill(); x.fillStyle = '#dfe3e8'; C.roundRect(x, 0, 0, w, 64, 20); x.fill(); x.fillRect(0, 40, w, 24);
  ['#ef6a5e', '#f5bf4f', '#61c454'].forEach((cl, i) => { x.fillStyle = cl; x.beginPath(); x.arc(40 + i * 34, 32, 11, 0, 7); x.fill(); }); x.fillStyle = '#fff'; C.roundRect(x, 160, 14, w - 220, 36, 18); x.fill(); C.ct(x, 'crowdfunding page · Dec 2014', 190, 40, `500 20px ${C.MONO}`, '#7a808a', 'left');
  C.ct(x, 'LEGAL DEFENSE FUND', 70, 150, `900 58px ${C.F}`, '#1f2937', 'left'); C.ct(x, 'for Skiplagged · organizer: Aktarer Zaman', 70, 200, `500 28px ${C.F}`, '#6b7280', 'left');
  x.fillStyle = '#e5e7eb'; C.roundRect(x, 70, 700, w - 140, 34, 17); x.fill(); C.ct(x, 'GOAL $20,000', w - 70, 790, `700 30px ${C.MONO}`, '#6b7280', 'right'); C.ct(x, 'RE-CREATED PAGE', 70, 790, `600 20px ${C.MONO}`, '#9ca3af', 'left');
  return { c, w, h }; })();
// headline slips (re-created, generic wording)
A.heads = ['UNITED SUES 22-YEAR-OLD OVER CHEAP-TICKET SITE', 'THE TRICK AIRLINES HATE', '“HIDDEN CITY” FARES: HOW IT WORKS', 'STRANGERS FUND KID’S LEGAL FIGHT', 'AIRLINE vs. 22-YEAR-OLD'].map((s, i) => { const w = 900, h = 220, [c, x] = C.docPaper(w, h, '#f2ede1', 60 + i, false);
  x.fillStyle = '#241c14'; x.fillRect(30, 40, w - 60, 4); C.ct(x, 'NEWS · DEC 2014', 40, 30, `600 20px ${C.MONO}`, '#7a6a56', 'left'); C.ct(x, s, w / 2, 135, `900 48px ${C.SERIF}`, '#1a1410', 'center', w - 70); C.ct(x, 'RE-CREATED HEADLINE', w - 40, 200, `600 16px ${C.MONO}`, '#9a8a76', 'right'); return { c }; });
A.settled = (() => { const w = 900, h = 520, [c, x] = C.docPaper(w, h, '#f1ece0', 71, false); C.ct(x, 'ORBITZ  ·  SKIPLAGGED', w / 2, 120, `700 46px ${C.SERIF}`, '#241c14'); C.ct(x, 'SETTLEMENT', w / 2, 200, `400 40px Typer`, '#5a4a36'); C.textLines(x, 90, 260, 6, w - 180, 34, 5); C.ct(x, 'RE-CREATED', w - 50, h - 30, `600 16px ${C.MONO}`, '#9a8a76', 'right'); return { c }; })();
// donor dots positions (1,600 donors shown as 160 dots)
const DOTS = Array.from({ length: 160 }, (_, i) => [i % 20, Math.floor(i / 20), hash(i * 3.7)]);
// map pings for "famous"
const PINGS = Array.from({ length: 70 }, (_, i) => [-122 + hash(i * 1.7) * 52, 27 + hash(i * 2.9) * 20, hash(i * 5.1)]);
const NYC = [-74.0, 40.71], CHI = [-87.9, 41.98];
// ---------------- frame ----------------
function frame(ctx, t) { C.camReset(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const s = scene(t); const t0 = S[s], t1 = s < S.length - 1 ? S[s + 1] : T, U = clamp((t - t0) / (t1 - t0));
  let mode = 'dark';
  if (s === 0) { // chapter card on the desk
    C.desk(ctx, t); C.cam(ctx, { z: 1.03 }); C.card3d(ctx, A.complaint.c, C.pose(W * 0.7, H * 0.6, 520, 671, { rx: 0.3, ry: -0.3, rz: 0.08, z: 140 }), { alpha: 0.35 }); C.camReset(ctx);
    C.chapterCard(ctx, t, 0.15, 'PART 2', 'THE KID WITH THE SEARCH ENGINE', { mode: 'dark', dur: S[1] - 0.15 + 0.2, out: false });
  } else if (s === 1) { // k01 + k01b: why wasn't everyone doing it? → hunting fares by hand: cards pile up one by one
    C.desk(ctx, t, { sy: H * 0.5 }); C.cam(ctx, { z: lerp(1.0, 1.12, U), x: W / 2 + lerp(-20, 30, U), rot: lerp(-0.01, 0.012, U) });
    const n = Math.floor(clamp((t - (S[1] + 0.5)) / ((K.hand - S[1] - 0.5) / 6), 0, 6));
    const H0 = S[1] + 0.5, HS = (K.hand - H0) / 6; for (let i = 0; i < 6; i++) { const ti = H0 + i * HS; if (t < ti) break; const u = eo((t - ti) / 0.35); const p = C.pose(W * (0.3 + 0.08 * i) + (1 - u) * 300, H * (0.5 + 0.03 * (i % 2)) - (1 - u) * 200, 760, 446, { rx: 0.35, ry: -0.12 + 0.05 * (i % 3), rz: -0.08 + 0.035 * i, z: (1 - u) * 200 });
      C.card3d(ctx, A.hunt[i].c, p, { alpha: i < n - 2 ? 0.7 : 1 }); const q = C.boxOf(p, A.hunt[i].hl[0]); if (t > ti + 0.25) C.markerEllipse(ctx, (q[0] + q[2]) / 2, (q[1] + q[3]) / 2, (q[2] - q[0]) * 0.55, (q[3] - q[1]) * 0.7, (t - ti - 0.25) / 0.3, 10 + i, C.RED, 6); }
    C.camReset(ctx);
    if (t < K.hunt - 0.5) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H); C.punch(ctx, 'SO OBVIOUS…', W / 2, H * 0.42, S[1] + 0.2, t, 130, '#f3efe6', { until: K.why - 0.1 }); C.punch(ctx, 'WHY WASN’T', W / 2, H * 0.4, K.why - 0.05, t, 130, '#f2d33b', { until: K.hunt - 0.5 }); C.punch(ctx, 'EVERYONE DOING IT?', W / 2, H * 0.57, K.every - 0.05, t, 120, '#f2d33b', { until: K.hunt - 0.5 }); }
    if (t > K.hand - 0.1) C.stamp(ctx, 'BY HAND', W * 0.78, H * 0.22, K.hand - 0.1, t, 110, '#d0281c', 0.06);
    C.typed(ctx, 'BEFORE 2013  //  HIDDEN-CITY FARES', 80, 96, S[1] + 0.1, t, 32, '#f2d33b');
  } else if (s === 2) { // k02 first half: RECEIPT 02 index card (2013, 20, New York, Aktarer Zaman)
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.1, U), x: W / 2 + lerp(30, -20, U) });
    const p = C.pose(W * 0.48, H * 0.54 + Math.sin(t) * 5, 1000, 640, { rx: lerp(0.5, 0.18, eo((t - t0) / 0.7)), ry: -0.14, rz: -0.03, z: lerp(260, 0, eo((t - t0) / 0.6)) }); C.card3d(ctx, A.index.c, p);
    [[K.named, 0], [K.age, 1], [K.ny, 2], [K.y2013, 3]].forEach(([tk, r]) => { if (t > tk - 0.05) C.highlighter(ctx, ...(b => [b[0], b[1], b[2] - b[0], b[3] - b[1]])(C.boxOf(p, A.index.rows[r])), (t - tk + 0.05) / 0.35); });
    C.camReset(ctx); C.typed(ctx, 'RECEIPT 02  //  2013', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
    C.punch(ctx, 'AGE: 20', W * 0.83, H * 0.82, K.age, t, 96, '#f2d33b', { rot: -0.05 });
  } else if (s === 3) { // k02 second half: he built a site → site card, results fill "automatically"
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.05, 1.13, U) });
    const u = eo((t - t0) / 0.45); const p = C.pose(W * 0.5, H * 0.53 + (1 - u) * 300, 1300, 760, { rx: lerp(0.6, 0.22, u), ry: 0.08, rz: 0.02, z: (1 - u) * 200 });
    ctx.filter = 'brightness(0.8)'; C.card3d(ctx, t > K.auto - 0.1 ? A.siteRes.c : A.site.c, p); ctx.filter = 'none';
    C.camReset(ctx); C.punch(ctx, 'BUILT A SITE', W * 0.2, H * 0.92, t0 + 0.05, t, 80, '#f3efe6', { al: 'left' });
    if (t > K.auto - 0.1) { C.stamp(ctx, 'AUTOMATIC', W * 0.8, H * 0.18, K.auto - 0.05, t, 80, '#d0281c', 0.05); }
  } else if (s === 4) { // k03: SKIPLAGGED · type a city → it shows flights passing THROUGH it (mini route)
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.12, 1.22, U), x: W / 2 + lerp(-40, 40, U), y: H / 2 + lerp(-30, 10, U) });
    const p = C.pose(W * 0.5, H * 0.53, 1300, 760, { rx: 0.2, ry: 0.06, rz: 0.015 }); ctx.filter = 'brightness(0.8)'; C.card3d(ctx, t > K.go ? A.siteRes.c : A.site.c, p); ctx.filter = 'none';
    if (t > K.type && t < K.go) { const q = C.boxOf(p, [0.05, 0.21, 0.95, 0.34]); C.highlight(ctx, q, K.type, t, { dim: 0.45, until: K.go }); }
    if (t > K.shows - 0.1) { const q = C.boxOf(p, [0.05, 0.53, 0.95, 0.69]); C.highlight(ctx, q, K.shows - 0.1, t, { dim: 0.5 }); }
    C.camReset(ctx); C.punch(ctx, 'SKIPLAGGED', W / 2, H * 0.13, K.called - 0.05, t, 110, '#f2d33b', { until: K.type - 0.1 });
    if (t > K.pass - 0.15) { const k = eo((t - K.pass + 0.15) / 0.4); ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(10,12,16,0.82)'; C.roundRect(ctx, W * 0.58, H * 0.74, W * 0.38, 190, 18); ctx.fill();
      const y = H * 0.74 + 105, xa = W * 0.61, xb = W * 0.77, xc = W * 0.93; ctx.strokeStyle = '#f2d33b'; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xa + (xc - xa) * clamp((t - K.pass) / 0.6), y); ctx.stroke(); ctx.setLineDash([]);
      [[xa, 'NYC'], [xb, 'CHICAGO'], [xc, 'MILWAUKEE']].forEach(([xx, n], i) => { ctx.fillStyle = i === 1 ? '#f2d33b' : '#9aa3af'; ctx.beginPath(); ctx.arc(xx, y, i === 1 ? 16 : 11, 0, 7); ctx.fill(); ctx.font = `800 28px ${C.F}`; ctx.textAlign = 'center'; ctx.fillStyle = '#f3efe6'; ctx.fillText(n, xx, y - 36); });
      ctx.font = `700 24px ${C.MONO}`; ctx.fillStyle = '#f2d33b'; ctx.fillText('GET OFF HERE', xb, y + 60); ctx.restore(); }
  } else if (s === 5) { // k04: paraphrase card "around for a while · not very accessible" + highlighter
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.08, U), rot: lerp(0.01, -0.01, U) });
    const p = C.pose(W * 0.5, H * 0.5, 1400, 620, { rx: 0.22, ry: lerp(-0.18, -0.08, U), rz: -0.02, z: lerp(120, 0, eo((t - t0) / 0.5)) });
    if (!A.para) { const w = 1400, h = 620, [c, x] = C.docPaper(w, h, '#efe8d8', 57, false); C.ct(x, 'AKTARER ZAMAN, TO CNN (2014) — PARAPHRASED', 70, 90, `600 28px ${C.MONO}`, '#7a6a56', 'left', w - 140); x.fillStyle = '#241c14'; x.fillRect(70, 110, w - 140, 3);
      C.ct(x, 'The trick had been around', w / 2, 290, `400 82px Typer`, '#241c14'); C.ct(x, 'for a while.', w / 2, 390, `400 82px Typer`, '#241c14'); C.ct(x, 'It just wasn’t very accessible.', w / 2, 520, `400 74px Typer`, '#241c14'); A.para = { c }; }
    C.card3d(ctx, A.para.c, p); const q = C.boxOf(p, [0.18, 0.75, 0.84, 0.9]); if (t > K.access - 0.15) C.highlighter(ctx, q[0], q[1], q[2] - q[0], q[3] - q[1], (t - K.access + 0.15) / 0.45);
    const q2 = C.boxOf(p, [0.12, 0.33, 0.88, 0.67]); if (t > K.trick - 0.1 && t < K.just) C.markerLine(ctx, [[q2[0], q2[3] + 6], [q2[2], q2[3] - 4]], (t - K.trick + 0.1) / 0.8, C.RED, 6, false);
    C.camReset(ctx); C.typed(ctx, 'IN HIS WORDS (PARAPHRASE)', 80, 96, t0 + 0.05, t, 30, '#f2d33b');
  } else if (s === 6) { // k05: RECEIPT 03 — complaint, SUED, $75,000 + ≈ $100K TODAY
    C.desk(ctx, t, { warm: true }); const [sx, sy] = C.shake(t, K.sued, 16); C.cam(ctx, { z: lerp(1.0, 1.14, ss(U)), x: W / 2 + sx, y: H / 2 + sy + lerp(0, 40, U) });
    const p = C.pose(W * 0.42, H * 0.55, 680, 877, { rx: lerp(0.4, 0.14, eo((t - t0) / 1.2)), ry: lerp(-0.3, -0.12, eo((t - t0) / 1.4)), rz: -0.03, z: lerp(140, 0, eo((t - t0) / 0.9)) }); C.card3d(ctx, A.complaint.c, p);
    C.highlight(ctx, C.boxOf(p, [0.06, 0.16, 0.6, 0.27]), K.united - 0.05, t, { dim: 0.35, until: K.sued - 0.05 });
    C.highlight(ctx, C.boxOf(p, A.complaint.hl[0]), K.sued + 0.5, t, { dim: 0.35, until: K.seventy - 0.1 });
    C.highlight(ctx, C.boxOf(p, A.complaint.hl[1]), K.seventy - 0.05, t, { dim: 0.45 });
    C.stamp(ctx, 'SUED', W * 0.42, H * 0.43, K.sued - 0.04, t, 120, '#d0281c', -0.1);
    C.camReset(ctx); C.typed(ctx, 'RECEIPT 03  //  NOV 2014', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
    C.punch(ctx, 'NOVEMBER 2014', W * 0.79, H * 0.32, K.nov - 0.05, t, 90, '#f3efe6', { until: K.united - 0.15 }); C.punch(ctx, '“ACCESSIBLE ENOUGH”', W * 0.79, H * 0.45, K.enough - 0.1, t, 64, '#f2d33b', { until: K.united - 0.15 });
    C.label(ctx, 'UNITED + ORBITZ', W * 0.79, H * 0.2, { size: 64, alpha: eo((t - K.united + 0.1) / 0.3) * (t > K.united - 0.1 ? 1 : 0) });
    if (t > K.sued + 0.5) C.label(ctx, 'UNFAIR COMPETITION', W * 0.79, H * 0.3, { size: 50, col: '#f2d33b', alpha: eo((t - K.sued - 0.5) / 0.3) });
    C.counter(ctx, { t0: K.seventy - 0.05, from: 0, to: 75000, dur: 0.8, x: W * 0.79, y: H * 0.56, size: 150 }, t);
    C.todayTag(ctx, '$100K', W * 0.79, H * 0.72, K.seventy + 0.9, t, { size: 40, al: 'center' });
    if (t > K.lost - 0.05) C.tag(ctx, 'LOST REVENUE (THEIR CLAIM)', W * 0.79, H * 0.83, { size: 30, al: 'center', alpha: eo((t - K.lost + 0.05) / 0.3) });
  } else if (s === 7) { // k07: the lawsuit's reason — quote slip, BANNED tag, highlights
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.02, 1.1, U), x: W / 2 + lerp(-30, 30, U) });
    const u = eo((t - t0) / 0.5); const p = C.pose(W * 0.5, H * 0.56, 1400, 620, { rx: lerp(0.5, 0.2, u), ry: 0.1, rz: 0.02, z: (1 - u) * 220 });
    C.card3d(ctx, A.quote.c, p, { alpha: clamp((t - K.because + 0.3) / 0.3) * 0.75 + 0.25 });
    [K.logistical, K.safety - 0.25, K.concerns].forEach((tk, i) => { if (t > tk - 0.05) { const q = C.boxOf(p, A.quote.hl[i]); C.highlighter(ctx, q[0], q[1], q[2] - q[0], q[3] - q[1], (t - tk + 0.05) / 0.4); } });
    C.camReset(ctx); C.typed(ctx, 'PER THE LAWSUIT  //  2014', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
    if (t > K.bans - 0.1) C.stamp(ctx, 'BANNED BY UNITED', W * 0.5, H * 0.16, K.bans - 0.05, t, 80, '#d0281c', -0.04, { alpha: t > K.because ? 0.5 : 0.92 });
    if (t > K.acc - 0.05 && t < K.bans) C.punch(ctx, 'THE LAWSUIT SAYS…', W / 2, H * 0.16, K.acc - 0.05, t, 90, '#f3efe6');
  } else if (s === 8) { // k08: AGE 22 → he asks the internet → re-created fund page, quote typed in sync
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.1, U), x: W / 2 + lerp(20, -30, U), y: H / 2 + lerp(-10, 20, U) });
    const u = eo((t - K.asked + 0.3) / 0.5); const p = C.pose(W * 0.47, H * 0.54 + (1 - u) * 500, 1300, 860, { rx: lerp(0.6, 0.18, u), ry: -0.06, rz: -0.015, z: (1 - u) * 200 });
    // compose the page with the typed quote for this frame
    if (u > 0) { if (!A.fundLive) A.fundLive = C.mk(A.fund.w, A.fund.h); const [fc, fx] = A.fundLive; fx.clearRect(0, 0, A.fund.w, A.fund.h); fx.drawImage(A.fund.c, 0, 0);
      const all = QUOTE.join('\n'), k = clamp((t - K.as + 0.05) / (K.me - K.as + 0.3 || 1)); let n = Math.floor(all.length * k); let y = 320;
      QUOTE.forEach(line => { const m = Math.max(0, Math.min(line.length, n)); fx.font = `italic 600 54px ${C.SERIF}`; fx.fillStyle = '#1f2937'; fx.textAlign = 'left'; fx.fillText(line.slice(0, m), 70, y); n -= line.length + 1; y += 84; });
      if (t > K.wrote - 0.1) C.ct(fx, '— Aktarer Zaman, to donors, 2014', A.fund.w - 70, 660, `500 30px ${C.F}`, '#6b7280', 'right');
      ctx.filter = 'brightness(0.88)'; C.card3d(ctx, fc, p); ctx.filter = 'none'; if (t > K.bullied - 0.05) { const q = C.boxOf(p, [0.04, 0.42, 0.62, 0.5]); C.highlight(ctx, q, K.bullied - 0.05, t, { dim: 0.4, until: K.support - 0.1 }); } }
    C.camReset(ctx);
    if (t < K.asked + 0.2) { C.punch(ctx, 'ZAMAN', W * 0.5, H * 0.3, t0 + 0.05, t, 120, '#f3efe6'); C.sticky(ctx, ['AGE: 22'], W * 0.5, H * 0.6, 420, -0.04, (t - K.was22 + 0.1) / 0.3, { h: 240, size: 96 }); }
    C.typed(ctx, 'DEC 2014  //  HE ASKS THE INTERNET', 80, 96, K.asked - 0.1, t, 30, '#f2d33b');
    if (t > K.support - 0.1) C.punch(ctx, '“BULLIED”', W * 0.86, H * 0.84, K.support - 0.1, t, 86, '#f2d33b', { rot: -0.05 });
  } else if (s === 9) { // k09: donor counter $33,000 · 1,600+ donors · bar overshoots the $20K goal
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.08, U) });
    C.camReset(ctx);
    // dots grid (each dot = 10 donors)
    const n = Math.floor(160 * clamp((t - t0 - 0.15) / (K.thirty - t0))); const gx = W * 0.08, gy = H * 0.3, cs = 34;
    for (let i = 0; i < n; i++) { const [cx, cy, r] = DOTS[i]; const a = clamp((t - t0 - 0.15 - i * (K.thirty - t0) / 160) / 0.2); ctx.fillStyle = `rgba(242,211,59,${0.4 + 0.6 * a})`; ctx.beginPath(); ctx.arc(gx + cx * cs, gy + cy * cs, 11 * back(a), 0, 7); ctx.fill(); }
    if (t > K.sixteen) C.label(ctx, '1,600+ STRANGERS', gx + 10 * cs, gy + 9 * cs, { size: 54, alpha: eo((t - K.sixteen) / 0.3) });
    if (t > K.sixteen) C.tag(ctx, 'EACH DOT = 10 DONORS', gx, gy - 40, { size: 24, alpha: eo((t - K.sixteen) / 0.3) });
    C.counter(ctx, { t0: K.thirty - 0.1, from: 0, to: 33000, dur: 1.0, x: W * 0.74, y: H * 0.4, size: 160 }, t);
    // progress bar vs goal
    const bx = W * 0.52, by = H * 0.62, bw = W * 0.4, gk = 20000 / 33000; ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bx, by, bw * gk, 40); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw * gk, 40);
    const v = 33000 * eio(clamp((t - K.thirty + 0.1) / 1.0)); ctx.fillStyle = '#4caf6a'; ctx.fillRect(bx, by, bw * v / 33000, 40); C.tag(ctx, 'GOAL $20,000', bx + bw * gk, by + 100, { size: 26, al: 'center', bg: '#e5e7eb' });
    if (v > 20000) C.stamp(ctx, 'GOAL SMASHED', W * 0.74, H * 0.83, K.thirty + 0.6, t, 64, '#4caf6a', -0.05);
    C.todayTag(ctx, '$44K', W * 0.74, H * 0.52, K.thirty + 1.0, t, { size: 34, al: 'center' });
    C.typed(ctx, 'BY END OF DECEMBER 2014', 80, 96, t0 + 0.05, t, 32, '#f2d33b');
  } else if (s === 10 || s === 11) { // k10 + k11 — OUR TAKE: headlines fly in, then the map lights up with searches
    const mapK = s === 11 ? eo((t - S[11]) / 0.5) : 0;
    if (s === 10) { C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.12, U), rot: lerp(-0.01, 0.01, U) });
      A.heads.forEach((h, i) => { const ti = S[10] + 0.15 + i * 0.75; if (t < ti) return; const u = eo((t - ti) / 0.35); const p = C.pose(W * (0.3 + 0.12 * (i % 3)) + (1 - u) * (i % 2 ? 500 : -500), H * (0.28 + 0.15 * i), 900, 220, { rx: 0.25, ry: 0.1 * (i % 2 ? 1 : -1), rz: -0.06 + 0.03 * i, z: (1 - u) * 160 }); C.card3d(ctx, h.c, p); });
      C.camReset(ctx); if (t > K.famous - 0.1) C.punch(ctx, 'FAMOUS.', W / 2, H * 0.52, K.famous - 0.05, t, 220, '#f2d33b', { rot: -0.04 });
      if (t > K.plan - 0.1) C.sticky(ctx, ['NOT THE PLAN'], W * 0.84, H * 0.18, 380, 0.06, (t - K.plan + 0.1) / 0.3, { h: 170, size: 54 });
    } else { mode = 'paper'; const cam = { lon: lerp(-97, -96, U), lat: lerp(38.5, 38.8, U), R: lerp(1750, 1880, U), dy: 30 }; C.map(ctx, cam, { hl: ['840'], hlCol: 'rgba(240,215,150,0.35)' });
      const k = clamp((t - S[11]) / (en('k11') - S[11])); const n = Math.floor(PINGS.length * eio(k));
      for (let i = 0; i < n; i++) { const [lo, la, r] = PINGS[i]; const p = C.mp(lo, la, cam); const ti = S[11] + (i / PINGS.length) * (en('k11') - S[11]); const a = clamp((t - ti) / 0.4); ctx.strokeStyle = `rgba(179,36,26,${0.8 * (1 - a)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p[0], p[1], 10 + 50 * a, 0, 7); ctx.stroke(); ctx.fillStyle = '#b3241a'; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, 7); ctx.fill(); }
      C.camReset(ctx); C.sticky(ctx, ['NOW EVERYONE', 'KNEW WHERE', 'TO LOOK'], W * 0.83, H * 0.73, 400, 0.05, (t - K.exactly + 0.1) / 0.3, { h: 300, size: 50 });
      C.label(ctx, 'SEARCHES FOR HIDDEN-CITY FARES', W * 0.38, H * 0.1, { size: 46, col: '#241c14', alpha: eo((t - S[11]) / 0.4) }); C.tag(ctx, 'ILLUSTRATION', W * 0.38, H * 0.17, { size: 22, al: 'center', bg: '#e8ddc4', col: '#5a4a36' }); }
    C.camReset(ctx); C.tag(ctx, 'OUR TAKE', 80, 110, { size: 34, bg: '#d0281c', col: '#fff' });
  } else if (s === 12) { // k12: 2015 — DISMISSED · NO JURISDICTION (ILLINOIS) · "Skiplagged was right" crossed out
    C.desk(ctx, t, { warm: true }); const [sx, sy] = C.shake(t, K.threw, 14); C.cam(ctx, { z: lerp(1.0, 1.1, U), x: W / 2 + sx, y: H / 2 + sy });
    const p = C.pose(W * 0.36, H * 0.55, 640, 826, { rx: 0.22, ry: -0.18, rz: -0.04 }); C.card3d(ctx, A.complaint.c, p);
    C.stamp(ctx, 'DISMISSED', W * 0.36, H * 0.5, K.threw - 0.02, t, 116, '#d0281c', -0.12);
    C.camReset(ctx); C.typed(ctx, 'APRIL 2015  //  FEDERAL COURT', 80, 96, t0 + 0.05, t, 32, '#f2d33b'); C.punch(ctx, '2015', W * 0.76, H * 0.32, K.y2015 - 0.05, t, 160, '#f3efe6', { until: K.not - 0.15 }); C.punch(ctx, 'A FEDERAL JUDGE', W * 0.76, H * 0.5, K.judge - 0.05, t, 64, '#f2d33b', { until: K.not - 0.15 });
    if (t > K.not - 0.1) { C.sticky(ctx, ['SKIPLAGGED', 'WAS RIGHT'], W * 0.76, H * 0.32, 470, 0.05, (t - K.not + 0.1) / 0.3, { h: 260, size: 66 }); C.crossOut(ctx, W * 0.76 - 230, H * 0.32 - 120, W * 0.76 + 230, H * 0.32 + 120, (t - K.right) / 0.45, C.RED, 14); }
    if (t > K.court - 0.15) { C.sticky(ctx, ['WRONG COURT'], W * 0.76, H * 0.7, 470, -0.04, (t - K.court + 0.15) / 0.3, { h: 180, size: 64, col: '#f6c9bf', ink: '#8b1a12' });
      C.tag(ctx, 'NO JURISDICTION (ILLINOIS)', W * 0.76, H * 0.88, { size: 32, al: 'center', alpha: eo((t - K.nosay + 0.1) / 0.3) * (t > K.nosay - 0.1 ? 1 : 0) }); }
  } else if (s === 13) { // k13: Orbitz had already settled · United didn't try again
    C.desk(ctx, t); C.cam(ctx, { z: lerp(1.02, 1.1, U) });
    const u = eo((t - t0) / 0.4); const p = C.pose(W * 0.33, H * 0.52 + (1 - u) * 300, 900, 520, { rx: 0.3, ry: -0.15, rz: -0.05, z: (1 - u) * 150 }); C.card3d(ctx, A.settled.c, p);
    C.stamp(ctx, 'SETTLED', W * 0.33, H * 0.55, K.settled - 0.05, t, 100, '#4f7a3a', -0.08); C.tag(ctx, 'FEB 2015 · BEFORE THE RULING', W * 0.33, H * 0.86, { size: 28, al: 'center', alpha: eo((t - K.settled) / 0.3) * (t > K.settled ? 1 : 0) });
    C.camReset(ctx); if (t > K.united2 - 0.1) { C.label(ctx, 'UNITED:', W * 0.74, H * 0.42, { size: 70, alpha: eo((t - K.united2 + 0.1) / 0.3) }); C.punch(ctx, 'DIDN’T TRY AGAIN', W * 0.74, H * 0.55, K.try_ || at('k13', 'try') - 0.05, t, 76, '#f2d33b'); }
  } else { // k14: ROUND ONE — scoreboard: THE KID 1 · AIRLINES 0
    C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.04, 1.1, U) }); C.camReset(ctx);
    const bx = W / 2, by = H * 0.53, k = back(clamp((t - t0) / 0.4)); ctx.save(); ctx.translate(bx, by); ctx.scale(k, k);
    ctx.fillStyle = '#14171c'; C.roundRect(ctx, -700, -260, 1400, 520, 30); ctx.fill(); ctx.strokeStyle = '#f2d33b'; ctx.lineWidth = 6; C.roundRect(ctx, -700, -260, 1400, 520, 30); ctx.stroke();
    ctx.font = `400 50px Typer`; ctx.fillStyle = '#d8d2c4'; ctx.textAlign = 'center'; ctx.fillText('ROUND ONE', 0, -170);
    ctx.font = `900 64px ${C.F}`; ctx.fillStyle = '#f3efe6'; ctx.fillText('THE KID', -360, -60); ctx.fillText('THE AIRLINE', 360, -60);
    const flip = clamp((t - K.kid + 0.05) / 0.3); ctx.font = `900 200px ${C.F}`; ctx.fillStyle = '#f2d33b'; ctx.save(); ctx.translate(-360, 140); ctx.scale(1, flip < 1 ? Math.max(0.05, Math.abs(Math.cos(flip * Math.PI))) : 1); ctx.fillText(flip > 0.5 ? '1' : '0', 0, 0); ctx.restore();
    ctx.fillStyle = '#9aa3af'; ctx.fillText('0', 360, 140); ctx.fillStyle = '#5a6270'; ctx.fillRect(-8, -100, 16, 260); ctx.restore();
  }
  C.finish(ctx, t, { mode, fade: t > T - 0.35 ? (t - (T - 0.35)) / 0.35 : 0 });
  const cv = ctx.canvas; GLITCH.forEach(x => C.glitch(ctx, cv, t, x)); WHIPS.forEach((x, i) => C.whip(ctx, cv, t, x, i % 2 ? -1 : 1));
}
function cues() { return { T,
  whoosh: [...WHIPS.map(x => x - 0.1), S[1] - 0.1], glitch: GLITCH, stamp: [K.hand - 0.1, K.auto - 0.05, K.sued - 0.04, K.bans - 0.05, K.threw - 0.02, K.settled - 0.05, K.thirty + 0.6],
  hit: [0.15, K.why - 0.05, K.called - 0.05, K.age, K.famous - 0.05, K.kid - 0.05, K.seventy - 0.05], ding: [K.thirty + 0.6, K.kid],
  paper: [0, 1, 2, 3, 4, 5].map(i => S[1] + 0.5 + i * (K.hand - S[1] - 0.5) / 6).concat([ S[2], S[5], S[7], K.asked - 0.3, ...A.heads.map((_, i) => S[10] + 0.15 + i * 0.75), K.not - 0.1, K.court - 0.15, S[13], K.was22 - 0.1, K.plan - 0.1, K.exactly - 0.1]),
  marker: [K.hunt - 0.35, K.access - 0.15, K.right, K.logistical], type: [[S[1] + 0.1, 0.8], [S[2] + 0.05, 0.6], [K.as, K.me - K.as + 0.3], [S[12] + 0.05, 0.8], [K.type, K.go - K.type]],
  counter: [[K.seventy - 0.05, 0.8], [K.thirty - 0.1, 1.0]],
  mode: [[0, 'dark'], [S[11], 'paper'], [S[12], 'dark']] }; }
K.me = at('k08', 'me');
module.exports = { T, frame, cues, tl };
if (require.main === module) { const m = process.argv[2];
  if (m === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log('T', T); }
  else if (m === 'still') C.stills(process.argv[3].split(',').map(Number), process.argv[4], frame);
  else if (m === 'sheet') { const ts = []; for (let x = 0.1; x < T; x += 1.0) ts.push(+x.toFixed(2)); C.stills(ts, process.argv[3], frame, 10, 0.12); }
  else if (m === 'video') C.render(path.join(D, 'seg_video.mp4'), T, frame).then(() => console.log('done', T)); }
