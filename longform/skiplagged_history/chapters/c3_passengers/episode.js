// Part 3 "The Airlines Go After You" (a01–a21, s02–s05) — Case File style: dark desk + light paper-map inserts.
// node episode.js video | still t1,t2,.. out.png | sheet out.png | cues
const C = require('../../lib/casefile'); C.fonts();
const path = require('path'), fs = require('fs');
const D = __dirname, FILM = path.join(D, '../..');
const { W, H, clamp, lerp, eo, eio, ss, back, hash } = C;
const IDS = ['a01', 'a02', 'a03', 'a04', 'a05', 'a07', 'a08', 'a10', 'a11', 'a12', 'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20', 'a21', 's02', 's03', 's04', 's05'];
const tl = C.timeline(FILM, 'c3_passengers', IDS, { lead: 2.4, pause: { a07: 0.45, a12: 0.45, a20: 0.5, a21: 0.2 }, tail: 1.4 });
const T = tl.T, at = tl.at, st = tl.start, en = tl.end;
const K = { stop: at('a01', 'stop'), people: at('a01', 'people'), using: at('a01', 'using'),
  y2018: at('a02', '2018'), passenger: at('a02', 'passenger'), letter: at('a02', 'letter'), corporate: at('a02', 'corporate'),
  subject: at('a03', 'subject'), notice: at('a03', 'notice'), demand: at('a03', 'demand'), reimb: at('a03', 'reimbursement'),
  thirty: at('a04', 'thirty'), january: at('a04', 'january'), whole: at('a04', 'whole'), called: at('a04', 'called'), fraud: at('a04', 'fraud'),
  bill: at('a05', 'bill'), three: at('a05', 'three'), cents: at('a05', 'cents'), pay: at('a05', 'pay'), ten: at('a05', 'ten'), days: at('a05', 'days'),
  collection: at('a05', 'collection'), shut: at('a05', 'shut'), account: at('a05', 'account'), refuse: at('a05', 'refuse'),
  debt: at('a07', 'debt'), paid: at('a07', 'paid'), taken: at('a07', 'taken'), strange: at('a07', 'strange'),
  germany: at('a08', 'germany'), further: at('a08', 'further'), court: at('a08', 'court'),
  round: at('a10', 'round'), oslo: at('a10', 'oslo'), seattle: at('a10', 'seattle'), frankfurt: at('a10', 'frankfurt'), home: at('a10', 'home'), off: at('a10', 'off'), berlin: at('a10', 'berlin'),
  sued: at('a11', 'sued'), two: at('a11', 'two'), euros: at('a11', 'euros'), fare: at('a11', 'fare'), interest: at('a11', 'interest'),
  berlin2: at('a12', 'berlin'), against: at('a12', 'against'), appealed: at('a12', 'appealed'), quietly: at('a12', 'quietly'), dropped: at('a12', 'dropped'),
  july: at('a14', 'july'), nobody: at('a14', 'nobody'), news: at('a14', 'news'),
  seventeen: at('a15', '17'), gnv: at('a15', 'gainesville'), ny: at('a15', 'new'), stop2: at('a15', 'stop'), clt: at('a15', 'charlotte'), clt2: at('a15', 'charlotte', 1), lived: at('a15', 'lived'),
  airport: at('a16', 'airport'), staff: at('a16', 'staff'), carolina: at('a16', 'carolina'), license: at('a16', 'license'), math: at('a16', 'math'),
  cancelled: at('a17', 'cancelled'), dad: at('a17', 'dad'), banned: at('a17', 'banned'), years: at('a17', 'years'),
  rule: at('a18', 'rule'), without: at('a18', 'without'), gain: at('a18', 'gain'), lower: at('a18', 'lower'),
  skiplag: at('a19', 'skiplag'), hundred: at('a19', 'hundred'), fifty: at('a19', 'fifty'), direct: at('a19', 'direct'), four: at('a19', 'four'),
  punish: at('a20', 'punishment'), little: at('a20', 'little'), more: at('a20', 'more'), somewhere: at('a20', 'somewhere'), pricing: at('a20', 'pricing'), win: at('a20', 'win'),
  illegal: at('a21', 'illegal'), breaks: at('a21', 'breaks'), rules: at('a21', 'rules'), teen: at('a21', 'teenager'), wrong: at('a21', 'wrong'), go: at('a21', 'go'),
  oneway: at('s02', 'one'), skipf: at('s02', 'skip'), cancels: at('s02', 'cancels'), ret: at('s02', 'return'),
  bags: at('s03', 'bags'), suitcase: at('s03', 'suitcase'), boston: at('s03', 'boston'), notyou: at('s03', 'not'),
  rerouted: at('s04', 'rerouted'), different: at('s04', 'different'), plan: at('s04', 'plan'),
  often: at('s05', 'often'), miles: at('s05', 'miles'), account2: at('s05', 'account'), like: at('s05', 'like'), airline: at('s05', 'airline') };
const pre = id => st(id) - 0.14;
// scene starts (name, time)
const SC = [['card', 0], ['web', pre('a01')], ['letter', pre('a02')], ['subject', pre('a03')], ['count', pre('a04')], ['fraud', K.called - 0.15],
  ['bill', pre('a05')], ['days', K.pay - 0.12], ['threats', K.collection - 0.35], ['debt', pre('a07')],
  ['germany', pre('a08')], ['eumap', pre('a10')], ['claim', pre('a11')], ['ruling', pre('a12')],
  ['news', pre('a14')], ['usmap', pre('a15')], ['counter', pre('a16')], ['cancel', pre('a17')], ['ruleq', pre('a18')], ['receipts', pre('a19')],
  ['punish', pre('a20')], ['win', K.somewhere - 0.12], ['legal', pre('a21')], ['rulesdoc', K.breaks - 0.25], ['list', K.teen - 0.6],
  ['oneway', pre('s02')], ['bags', pre('s03')], ['reroute', pre('s04')], ['lose', pre('s05')]];
const S = SC.map(x => x[1]), NAMES = SC.map(x => x[0]);
const DARK = new Set(['card', 'web', 'letter', 'subject', 'count', 'fraud', 'bill', 'days', 'threats', 'debt', 'claim', 'ruling', 'news', 'counter', 'cancel', 'ruleq', 'receipts', 'punish', 'win', 'legal', 'rulesdoc']);
// whips on mode changes and a few cuts; glitch on the news cut
const WHIPS = [], GLITCH = [];
for (let i = 1; i < S.length; i++) { const a = DARK.has(NAMES[i - 1]), b = DARK.has(NAMES[i]); if (a !== b) WHIPS.push(S[i]); }
['letter', 'claim', 'receipts', 'legal'].forEach(n => WHIPS.push(S[NAMES.indexOf(n)])); GLITCH.push(S[NAMES.indexOf('news')], S[NAMES.indexOf('cancel')]);
// ---- assets ----
const A = {};
A.site = C.siteCard({ url: 'skiplagged.com', name: 'SKIPLAGGED', tagline: 'hidden-city fares', input: 'Where do you want to go?', rows: [['LAX → BOSTON (via DULLES)', '$216', 'skip the last leg'], ['NEW YORK → CHICAGO (via …)', '$—', '']] });
A.letter = C.docLetter({ from: 'UNITED AIRLINES · CORPORATE SECURITY', date: '2018', subject: ['Notice of Claim Pertaining to Point Beyond', 'Ticketing and Demand for Reimbursement'],
  body: ['Our records show 38 instances since January 2016', 'of "Point Beyond Ticketing" on this account.', '-', 'United describes this as "fraud" under Rule 6', 'of its Contract of Carriage. Amount due:'], amount: '$3,236.76', sign: 'Corporate Security' });
A.collect = C.docLetter({ from: 'COLLECTION AGENCY', date: '', subject: ['Account referred for collection'], body: ['-', '-'], amount: '$3,236.76', seed: 12 });
A.ffcard = (() => { const [c, x] = C.mk(1000, 620); x.fillStyle = '#2b3442'; C.roundRect(x, 0, 0, 1000, 620, 40); x.fill(); x.fillStyle = '#c9a64a'; x.fillRect(0, 420, 1000, 26);
  C.ct(x, 'FREQUENT FLYER', 70, 130, `800 64px ${C.F}`, '#e8ecf2', 'left'); C.ct(x, 'MEMBER  ••••  ••••  2016', 70, 330, `600 48px ${C.MONO}`, '#c8d0dc', 'left'); C.ct(x, 'MILES', 70, 540, `600 34px ${C.MONO}`, '#c8d0dc', 'left'); return c; })();
A.passBig = C.boardingPass({ legs: [['GNV', 'CLT'], ['CLT', 'NYC']], cities: ['GAINESVILLE', 'CHARLOTTE', 'NEW YORK'], carrier: 'AMERICAN AIRLINES', info: [['DATE', 'JUL 2023'], ['STOP', 'CHARLOTTE'], ['CLASS', 'MAIN']], price: '$150', accent: '#3b4a5e' });
A.claim = C.docComplaint({ court: 'LANDGERICHT BERLIN', district: 'BERLIN DISTRICT COURT', caption: ['LUFTHANSA', 'v.', 'PASSENGER'], title: 'CLAIM', claims: ['FARE DIFFERENCE + INTEREST'], amount: '€2,112', date: '2018', seed: 14 });
A.rulecard = (() => { const [c, x] = C.docPaper(1300, 700, '#f3eee2', 22); C.ct(x, "AMERICAN AIRLINES · CONDITIONS OF CARRIAGE", 650, 110, `700 34px ${C.MONO}`, '#5a4a36'); x.fillStyle = '#241c14'; x.fillRect(150, 140, 1000, 4);
  C.ct(x, 'PROHIBITED:', 650, 250, `900 64px ${C.F}`, '#b3241a'); C.ct(x, '“purchasing a ticket without', 650, 370, `italic 600 60px ${C.SERIF}`, '#241c14'); C.ct(x, 'intending to fly all flights', 650, 450, `italic 600 60px ${C.SERIF}`, '#241c14');
  C.ct(x, 'to gain lower fares”', 650, 530, `italic 600 60px ${C.SERIF}`, '#241c14'); C.ct(x, 'policy as quoted to the press, July 2023', 650, 640, `500 26px ${C.MONO}`, '#8a7a66'); return c; })();
A.coc = (() => { const [c, x] = C.docPaper(1000, 1290, '#f1ece0', 23, false); C.ct(x, 'CONTRACT OF CARRIAGE', 500, 120, `700 52px ${C.SERIF}`); C.ct(x, '(the fine print you agreed to)', 500, 170, `italic 30px ${C.SERIF}`, '#5a4a36');
  x.fillStyle = '#241c14'; x.fillRect(80, 200, 840, 3); C.textLines(x, 90, 260, 8, 820, 36, 5); C.ct(x, 'Rule: Prohibited practices —', 90, 600, `700 36px ${C.SERIF}`, '#241c14', 'left'); C.ct(x, 'passengers must fly every flight', 90, 650, `700 36px ${C.SERIF}`, '#241c14', 'left'); C.ct(x, 'on the ticket, in order.', 90, 700, `700 36px ${C.SERIF}`, '#241c14', 'left');
  C.textLines(x, 90, 760, 10, 820, 36, 8); C.ct(x, 'RE-CREATED · PARAPHRASED', 920, 1230, `600 18px ${C.MONO}`, '#8a7a66', 'right'); return c; })();
A.r150 = C.docReceipt({ title: 'SKIPLAG TICKET', rows: [['GNV → CLT → NYC', 'ONE-WAY'], ['STATUS', 'CANCELLED']], total: ['PAID', '$150'], note: 'RE-CREATED · JULY 2023' });
A.r400 = C.docReceipt({ title: 'DIRECT FLIGHT', rows: [['GNV → CLT', 'NONSTOP'], ['STATUS', 'FLOWN']], total: ['PAID', '$400'], note: 'RE-CREATED · JULY 2023', seed: 9 });
A.outPass = C.boardingPass({ legs: [['LAX', 'IAD'], ['IAD', 'BOS']], cities: ['LOS ANGELES', 'WASHINGTON', 'BOSTON'], carrier: 'OUTBOUND', info: [['DATE', 'FRI'], ['LEG', '1 + 2'], ['SEAT', '23C']], price: '$216', accent: '#1f5f8b' });
A.retPass = C.boardingPass({ legs: [['BOS', 'IAD'], ['IAD', 'LAX']], cities: ['BOSTON', 'WASHINGTON', 'LOS ANGELES'], carrier: 'RETURN', info: [['DATE', 'SUN'], ['LEG', '3 + 4'], ['SEAT', '14A']], price: '—', accent: '#3b4a5e' });
A.law = (() => { const [c, x] = C.docPaper(1000, 1200, '#efe6d0', 31, true); C.ct(x, 'CRIMINAL CODE', 500, 150, `700 60px ${C.SERIF}`); C.ct(x, 'index', 500, 210, `italic 34px ${C.SERIF}`, '#5a4a36');
  ['Fraud ........ p. 112', 'Forgery ........ p. 140', 'Hijacking ........ p. 203', 'Skiplagging ........ —', 'Theft ........ p. 377'].forEach((s, i) => C.ct(x, s, 120, 330 + i * 90, `600 44px ${C.SERIF}`, '#241c14', 'left')); return c; })();
// cities [lon, lat]
const OSL = [11.1, 60.19], FRA = [8.57, 50.03], SEA = [-122.31, 47.45], BER = [13.5, 52.37];
const GNV = [-82.27, 29.69], CLT = [-80.94, 35.21], NYC = [-73.78, 40.64], LAX = [-118.41, 33.94], IAD = [-77.46, 38.95], BOS = [-71.01, 42.36], ORD = [-87.9, 41.98];
const scene = t => { let i = 0; while (i < S.length - 1 && t >= S[i + 1]) i++; return i; };
const k = (t, t0, d = 0.3) => clamp((t - t0) / d);
function board(ctx) { C.paperBg(ctx, 0, { board: true }); }
function heading(ctx, s, t, t0, o = {}) { if (t < t0) return; const u = eo(k(t, t0, 0.3)); C.label(ctx, s, o.x ?? W / 2, (o.y ?? H * 0.12) + (1 - u) * 24, { size: o.size || 70, alpha: u, col: o.col || '#f3efe6', plate: o.plate === undefined ? 'rgba(20,22,26,0.82)' : o.plate, maxW: o.maxW || 1700 }); }
function frame(ctx, t) { C.camReset(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; const s = scene(t), name = NAMES[s]; const t0 = S[s], t1 = s < S.length - 1 ? S[s + 1] : T, U = clamp((t - t0) / (t1 - t0));
  let mode = DARK.has(name) ? 'dark' : 'paper';
  switch (name) {
    case 'card': { C.desk(ctx, t); C.chapterCard(ctx, t, 0.1, 'PART 3', 'THE AIRLINES GO AFTER YOU', { mode: 'dark', dur: S[1] - 0.05 }); break; }
    case 'web': { // can't stop the website → go after the people using it
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.08, U) });
      const back_ = eio(k(t, K.stop + 0.3, 0.6)); const p = C.pose(lerp(W / 2, W * 0.27, back_), H * 0.48, lerp(1150, 700, back_), lerp(664, 404, back_), { rx: 0.2, ry: lerp(-0.1, 0.25, back_), rz: -0.02, z: 0 });
      C.card3d(ctx, A.site.c, p, { alpha: lerp(1, 0.55, back_) }); C.camReset(ctx);
      if (t > K.stop) C.stamp(ctx, "CAN'T STOP IT", W * 0.27, H * 0.5, K.stop + 0.35, t, 64, '#d0281c', -0.1);
      const n = 7; for (let i = 0; i < n; i++) { const kk = back(k(t, K.people - 0.05 + i * 0.07, 0.35)); if (kk <= 0) continue; C.person(ctx, W * 0.56 + i * 125, H * 0.86 + (i % 2) * 30, 0.8 * kk, { shirt: ['#4a6fa5', '#a5634a', '#5f8f5a', '#8a5aa5', '#a5944a', '#4a9aa5', '#a54a6f'][i], hair: i % 3 ? '#3a2a1e' : '#6a4a2e' }); }
      if (t > K.people) { C.markerLine(ctx, C.curve([W * 0.42, H * 0.36], [W * 0.66, H * 0.48], -0.25, 40, 2), k(t, K.people, 0.45), C.RED, 9, true); heading(ctx, 'NEW TARGET: THE PASSENGERS', t, K.using - 0.3, { y: H * 0.14, col: '#f2d33b' }); }
      break; }
    case 'letter': case 'subject': case 'count': case 'fraud': { // RECEIPT 03: the letter
      C.desk(ctx, t, { warm: true }); const [sx, sy] = C.shake(t, K.fraud, 14);
      const fly = name === 'letter' ? eo(k(t, t0, 0.7)) : 1; const p = C.pose(W * 0.5, H * 0.52 + (1 - fly) * 900, 760, 980, { rx: 0.08, ry: -0.04, rz: lerp(0.25, -0.02, fly), z: 0 });
      const ctr = r => { const b = C.boxOf(p, r); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; };
      let cx = W / 2, cy = H / 2, z = lerp(1.0, 1.06, U);
      if (name === 'subject') { const c0 = ctr([0.1, A.letter.hl[0][1], 0.9, A.letter.hl[1][3]]); cx = c0[0]; cy = c0[1]; z = lerp(1.55, 1.65, U); }
      if (name === 'count') { const c0 = ctr([0.1, A.letter.hl[2][1], 0.9, A.letter.hl[3][3]]); cx = c0[0] - 330; cy = c0[1]; z = lerp(1.3, 1.38, U); }
      if (name === 'fraud') { const c0 = ctr(A.letter.hl[4]); cx = c0[0] - 330; cy = c0[1]; z = lerp(1.35, 1.42, U); }
      C.cam(ctx, { z, x: cx + sx, y: cy + sy });
      C.card3d(ctx, A.letter.c, p);
      const R = A.letter.hl; const box = i => C.boxOf(p, R[i]);
      if (name === 'letter') { C.highlight(ctx, C.boxOf(p, [0, 0, 1, 0.095]), K.corporate - 0.1, t, { dim: 0.35 }); }
      if (name === 'subject') { const b0 = box(0), b1 = box(1); C.highlight(ctx, [b0[0], b0[1], b1[2], b1[3]], K.notice - 0.15, t, { dim: 0.5 }); C.highlighter(ctx, b0[0] + 230, b0[1] + 6, 330, b0[3] - b0[1] - 6, k(t, K.notice + 0.6, 0.6)); }
      if (name === 'count' || name === 'fraud') { const b2 = box(2), b3 = box(3); if (name === 'count') { C.highlight(ctx, [b2[0], b2[1], b3[2], b3[3]], t0 + 0.1, t, { dim: 0.5 }); C.markerEllipse(ctx, b2[0] + 300, (b2[1] + b2[3]) / 2, 120, 36, k(t, K.thirty - 0.1, 0.45), 7, C.RED, 6); C.markerLine(ctx, [[b2[0] + 560, b2[3] + 4], [b2[2] - 10, b2[3] + 4]], k(t, K.january, 0.4), C.RED, 6, false); }
        else { const b4 = box(4); C.highlight(ctx, b4, K.called - 0.1, t, { dim: 0.55 }); } }
      C.camReset(ctx);
      if (name === 'letter') { C.typed(ctx, 'RECEIPT 03  //  2018', 80, 96, t0 + 0.1, t, 32, '#f2d33b'); C.punch(ctx, '2018', W * 0.84, H * 0.22, K.y2018 - 0.05, t, 130, '#f2d33b', { until: K.letter + 0.3 }); if (t > K.passenger) C.tag(ctx, 'PASSENGER: ANONYMOUS', W - 70, H - 70, { al: 'right', size: 30, alpha: eo(k(t, K.passenger)) }); if (t > K.corporate) C.tag(ctx, 'RE-CREATED LETTER', 70, H - 70, { size: 28, bg: '#e8e2d4', alpha: eo(k(t, K.corporate)) }); }
      if (name === 'subject') { C.typed(ctx, 'SUBJECT LINE', 80, 96, t0, t, 32, '#f2d33b'); if (t > K.reimb - 0.2) C.sticky(ctx, ['= SKIPLAGGING'], W * 0.8, H * 0.2, 440, 0.05, k(t, K.reimb - 0.2), { h: 150, size: 54 }); }
      if (name === 'count') { const v = Math.round(lerp(0, 38, eio(k(t, K.thirty - 0.1, 1.0)))); ctx.save(); ctx.fillStyle = 'rgba(8,9,11,0.78)'; ctx.fillRect(0, 0, W * 0.36, H); ctx.restore(); if (t > K.thirty - 0.1) { C.label(ctx, String(v), W * 0.2, H * 0.4, { size: 260, col: '#f2d33b' }); C.label(ctx, 'TRIPS', W * 0.2, H * 0.58, { size: 70, col: '#f3efe6' }); }
        for (let i = 0; i < v; i++) { ctx.fillStyle = 'rgba(242,211,59,0.9)'; ctx.fillRect(110 + (i % 19) * 24, H * 0.72 + Math.floor(i / 19) * 70, 8, 52); }
        if (t > K.whole) C.tag(ctx, 'SINCE JAN 2016', W * 0.2, H * 0.95, { al: 'center', size: 34, alpha: eo(k(t, K.whole)) }); }
      if (name === 'fraud') { ctx.save(); ctx.fillStyle = 'rgba(8,9,11,0.7)'; ctx.fillRect(0, 0, W * 0.4, H); ctx.restore(); C.stamp(ctx, '"FRAUD"', W * 0.2, H * 0.4, K.fraud - 0.04, t, 130, '#d0281c', -0.1); if (t > K.fraud + 0.4) C.tag(ctx, "UNITED'S WORD, NOT A COURT'S", W * 0.2, H * 0.62, { al: 'center', size: 34, alpha: eo(k(t, K.fraud + 0.4)) }); }
      break; }
    case 'bill': case 'days': { // the amount + ten business days
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: name === 'bill' ? lerp(1.25, 1.35, U) : 1.0, x: W / 2, y: name === 'bill' ? H * 0.58 : H / 2 });
      const p = C.pose(W * (name === 'bill' ? 0.5 : 0.3), H * 0.52, 760, 980, { rx: 0.08, ry: name === 'bill' ? -0.04 : 0.28, rz: -0.02 }); C.card3d(ctx, A.letter.c, p, { alpha: name === 'bill' ? 1 : 0.7 });
      if (name === 'bill') C.highlight(ctx, C.boxOf(p, A.letter.hl[5]), K.three - 0.15, t, { dim: 0.6 });
      C.camReset(ctx);
      if (name === 'bill') { if (t > K.three - 0.1) { ctx.save(); ctx.fillStyle = 'rgba(10,10,12,0.55)'; ctx.fillRect(0, H * 0.06, W, 250); ctx.restore(); C.counter(ctx, { t0: K.three - 0.1, from: 0, to: 3236.76, dur: Math.max(0.8, K.cents - K.three), x: W / 2, y: H * 0.16, size: 170, fmt: v => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }, t); }
        C.todayTag(ctx, '$4,200', W / 2, H * 0.32, K.cents + 0.2, t, { size: 40, al: 'center' }); C.typed(ctx, 'THE BILL', 80, H - 60, t0 + 0.1, t, 34, '#f2d33b'); }
      else { // a calendar of 10 business days filling up
        heading(ctx, 'PAY WITHIN 10 BUSINESS DAYS', t, K.ten - 0.15, { y: H * 0.13, col: '#f2d33b' }); const n = Math.floor(clamp((t - K.ten) / 0.11, 0, 10));
        for (let i = 0; i < 10; i++) { const x = W * 0.52 + (i % 5) * 170, y = H * 0.36 + Math.floor(i / 5) * 190; ctx.save(); ctx.fillStyle = i < n ? '#ece4d4' : 'rgba(236,228,212,0.25)'; ctx.fillRect(x, y, 150, 160); ctx.fillStyle = '#b3241a'; ctx.fillRect(x, y, 150, 34); ctx.font = `900 64px ${C.F}`; ctx.textAlign = 'center'; ctx.fillStyle = '#241c14'; ctx.fillText(String(i + 1), x + 75, y + 120);
          if (i < n) { ctx.strokeStyle = C.RED; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + 20, y + 50); ctx.lineTo(x + 130, y + 150); ctx.moveTo(x + 130, y + 50); ctx.lineTo(x + 20, y + 150); ctx.stroke(); } ctx.restore(); }
        if (t > K.days + 0.3) C.label(ctx, '…OR ELSE', W * 0.73, H * 0.85, { size: 80, col: '#f3efe6', alpha: eo(k(t, K.days + 0.3)) }); }
      break; }
    case 'threats': { // three threats, three stamps
      C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.05, U) });
      const items = [[A.collect.c, K.collection, 'COLLECTIONS', 430, 555], [A.ffcard, K.shut, 'ACCOUNT CLOSED', 520, 323], [A.passBig.c, K.refuse, 'NO MORE FLIGHTS', 540, 216]];
      items.forEach(([img, tk, st_, w, h], i) => { const kk = eo(k(t, tk - 0.35, 0.4)); if (kk <= 0) return; const x = W * (0.19 + i * 0.31), y = H * 0.55; const p = C.pose(x, y + (1 - kk) * 700, w, h, { rx: 0.15, ry: (i - 1) * 0.15, rz: (i - 1) * 0.04 }); C.card3d(ctx, img, p); });
      C.camReset(ctx); items.forEach(([, tk, st_], i) => C.stamp(ctx, st_, W * (0.19 + i * 0.31), H * 0.8, tk + 0.1, t, 48, '#d0281c', -0.12 + i * 0.06));
      heading(ctx, 'OR UNITED MIGHT…', t, t0 + 0.05, { y: H * 0.12 }); break; }
    case 'debt': { // deadpan: a debt for flights not taken
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.12, ss(U)) });
      const r = C.docReceipt({ title: 'STATEMENT', rows: [['FLIGHTS PAID FOR', 'YES'], ['FLIGHTS TAKEN', 'SOME'], ['FLIGHTS NOT TAKEN', 'SOME']], total: ['YOU OWE', '$3,236.76'], note: 'RE-CREATED · ILLUSTRATION' });
      C.flat(ctx, r.c, W * 0.38, H * 0.5, 620, -0.03); C.camReset(ctx);
      if (t > K.paid - 0.1) C.markerEllipse(ctx, W * 0.38, H * 0.5 + 120, 260, 70, k(t, K.taken - 0.1, 0.5), 11, C.RED, 7);
      if (t > K.strange - 0.1) C.sticky(ctx, ['A STRANGE', 'KIND OF DEBT'], W * 0.74, H * 0.42, 520, 0.05, k(t, K.strange - 0.1), { h: 300, size: 72 });
      if (t > K.strange + 0.8) C.punch(ctx, '?', W * 0.88, H * 0.72, K.strange + 0.8, t, 200, '#f2d33b');
      break; }
    case 'germany': case 'eumap': { // paper map — Europe → Atlantic
      let cam; if (name === 'germany') cam = { lon: lerp(14, 11, U), lat: lerp(52, 53, U), R: lerp(3300, 3600, U), dy: 40 };
      else { const zout = eio(k(t, K.round - 0.1, 1.2)), zin = eio(k(t, K.home - 0.2, 1.0)); cam = { lon: lerp(lerp(11, -48, zout), 9.5, zin), lat: lerp(lerp(53, 55, zout), 54.5, zin), R: lerp(lerp(3600, 1150, zout), 4200, zin), dy: 20 }; }
      C.map(ctx, cam, { hl: name === 'germany' ? ['276'] : ['276', '578'], hlCol: 'rgba(240,200,110,0.45)' });
      if (name === 'germany') { const pf = C.mp(...FRA, cam); C.cityDot(ctx, cam, ...FRA, 'FRANKFURT', { dy: 40 }); C.label(ctx, 'GERMANY', pf[0] + 120, pf[1] - 160, { size: 70, col: '#241c14', alpha: eo(k(t, K.germany - 0.1)) });
        if (t > K.further - 0.1) C.sticky(ctx, ['LUFTHANSA', '→ COURT'], W * 0.78, H * 0.28, 440, 0.05, k(t, K.further - 0.1), { h: 230, size: 60, col: '#f6c9bf', ink: '#8b1a12' });
        C.stamp(ctx, 'SUED A PASSENGER', W * 0.35, H * 0.82, K.court - 0.05, t, 70, '#b3241a', -0.04); }
      else { const k1 = k(t, K.oslo - 0.2, 1.3); C.route(ctx, cam, [OSL, FRA, SEA], k1, { col: '#1f5f8b', lw: 7, dot: k1 < 1 ? 'plane' : null, planeS: 0.4, bend: -0.08 });
        const k2 = k(t, K.home - 0.4, 0.9); if (t < K.home + 0.6) C.route(ctx, cam, [SEA, FRA], k2, { col: '#2f7d4f', lw: 7, dot: k2 < 1 ? 'plane' : null, planeS: 0.4, bend: 0.1 });
        const zin = eio(k(t, K.home - 0.2, 1.0));
        if (zin > 0.7) { const po = C.mp(...OSL, cam), pf = C.mp(...FRA, cam), pb = C.mp(...BER, cam); ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = '#1f5f8b'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(pf[0], pf[1]); ctx.lineTo(po[0], po[1]); ctx.stroke(); ctx.restore();
          const kc = k(t, K.off - 0.05, 0.5); const mx = (pf[0] + po[0]) / 2, my = (pf[1] + po[1]) / 2; C.crossOut(ctx, mx - 60, my - 60, mx + 60, my + 60, kc, C.RED, 12);
          if (t > K.off + 0.4) C.writeOn(ctx, 'skipped', mx + 80, my, '56px Marker', C.RED, k(t, K.off + 0.4, 0.4));
          const kb = k(t, K.berlin - 0.25, 0.6); if (kb > 0) C.markerLine(ctx, C.curve(pf, pb, -0.2, 40, 1), kb, '#2f7d4f', 9, true); }
        C.cityDot(ctx, cam, ...OSL, 'OSLO', { dy: -36 }); C.cityDot(ctx, cam, ...FRA, 'FRANKFURT', { al: 'right', dy: 40 }); C.cityDot(ctx, cam, ...SEA, 'SEATTLE', { dy: 40 }); if (zin > 0.6) C.cityDot(ctx, cam, ...BER, 'BERLIN', { dy: 40, alpha: k(t, K.berlin - 0.3) });
        if (t > K.round - 0.1 && zin < 0.5) C.sticky(ctx, ['ROUND TRIP', 'OSLO ⇄ SEATTLE'], W * 0.8, H * 0.2, 470, 0.05, k(t, K.round - 0.1), { h: 200, size: 52 });
        if (zin > 0.8) C.sticky(ctx, ['WENT HOME', 'TO BERLIN'], W * 0.82, H * 0.78, 400, -0.05, k(t, K.berlin), { h: 200, size: 56, col: '#cfe7d2', ink: '#1f5a33' }); }
      break; }
    case 'claim': case 'ruling': { // Lufthansa v. passenger, €2,112 → court against the airline → appeal dropped
      C.desk(ctx, t, { warm: true }); const z = name === 'claim' ? lerp(1.0, 1.1, U) : 1.0; C.cam(ctx, { z, x: W / 2, y: name === 'claim' ? lerp(H / 2, H * 0.6, U) : H / 2 });
      const fly = name === 'claim' ? eo(k(t, t0, 0.5)) : 1; const p = C.pose(name === 'claim' ? W * 0.42 : W * 0.24, H * 0.52 - (1 - fly) * 900, 700, 903, { rx: 0.12, ry: name === 'claim' ? -0.1 : 0.3, rz: -0.03 });
      C.card3d(ctx, A.claim.c, p, { alpha: name === 'claim' ? 1 : 0.6 }); if (name === 'claim') C.highlight(ctx, C.boxOf(p, A.claim.hl[1]), K.two - 0.1, t, { dim: 0.45 });
      if (name === 'claim' && t > K.fare - 0.1) C.highlight(ctx, C.boxOf(p, A.claim.hl[0]), K.fare - 0.1, t, { dim: 0.0 });
      C.camReset(ctx);
      if (name === 'claim') { C.typed(ctx, 'LUFTHANSA  v.  PASSENGER', 80, 96, t0 + 0.1, t, 34, '#f2d33b'); C.punch(ctx, '€2,112', W * 0.78, H * 0.36, K.two - 0.05, t, 150, '#f2d33b');
        if (t > K.euros + 0.3) C.tag(ctx, '≈ $2,300 AT THE TIME', W * 0.78, H * 0.5, { al: 'center', size: 34, bg: '#1d2430', col: '#f2d33b', alpha: eo(k(t, K.euros + 0.3)) });
        if (t > K.interest - 0.1) C.tag(ctx, 'FARE DIFFERENCE + INTEREST', W * 0.78, H * 0.62, { al: 'center', size: 30, alpha: eo(k(t, K.interest - 0.1)) }); }
      else { // court card + appeal card
        const kc = eo(k(t, t0, 0.45)); ctx.save(); ctx.translate(W * 0.64, H * 0.36 + (1 - kc) * 60); ctx.rotate(0.02); ctx.globalAlpha = kc; ctx.fillStyle = '#ece4d4'; ctx.fillRect(-520, -150, 1040, 300); ctx.font = `700 40px ${C.MONO}`; ctx.textAlign = 'center'; ctx.fillStyle = '#5a4a36'; ctx.fillText('BERLIN COURT', 0, -60); ctx.font = `900 76px ${C.F}`; ctx.fillStyle = '#241c14'; ctx.fillText('AGAINST THE AIRLINE', 0, 50); ctx.restore();
        C.stamp(ctx, 'AIRLINE LOST', W * 0.64, H * 0.36 + 120, K.against + 0.2, t, 60, '#2f7d4f', -0.06);
        const ka = eo(k(t, K.appealed - 0.15, 0.4)), kd = eio(k(t, K.dropped, 0.7)); if (ka > 0) { ctx.save(); ctx.translate(W * 0.64 + kd * 120, H * 0.72 + kd * 600); ctx.rotate(-0.04 + kd * 0.6); ctx.globalAlpha = ka * (1 - kd * 0.3); ctx.fillStyle = '#f6f0e1'; ctx.fillRect(-380, -100, 760, 200); ctx.font = `900 80px ${C.F}`; ctx.textAlign = 'center'; ctx.fillStyle = '#b3241a'; ctx.fillText('APPEAL', 0, 28); ctx.restore(); }
        if (t > K.dropped + 0.4) { C.tag(ctx, 'APPEAL DROPPED · OCT 2019', W * 0.64, H * 0.72, { al: 'center', size: 40, alpha: eo(k(t, K.dropped + 0.4)) }); C.tag(ctx, 'NOT A PRECEDENT', W * 0.64, H * 0.84, { al: 'center', size: 34, bg: '#e8e2d4', alpha: eo(k(t, K.dropped + 0.8)) }); }
        if (t > K.quietly - 0.05 && t < K.dropped + 0.3) C.label(ctx, '(quietly)', W * 0.88, H * 0.6, { size: 46, col: '#c8c0b0', alpha: eo(k(t, K.quietly - 0.05)) }); }
      break; }
    case 'news': { // July 2023: the news story
      C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.08, U) });
      ctx.save(); ctx.translate(W / 2, H * 0.48); ctx.fillStyle = '#15181d'; C.roundRect(ctx, -760, -390, 1520, 820, 30); ctx.fill(); ctx.fillStyle = '#26303d'; ctx.fillRect(-720, -350, 1440, 740);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(255,255,255,${0.03 + 0.02 * Math.sin(t * 3 + i)})`; ctx.fillRect(-720, -350 + i * 123, 1440, 60); }
      C.plane(ctx, lerp(-500, 500, ss(U)), -120, 1.6, -0.1, { col: '#c9d3dc' }); const kb = eo(k(t, K.july - 0.1, 0.4)); ctx.fillStyle = '#b3241a'; ctx.fillRect(-720, 170, 300 * kb, 70); ctx.font = `900 44px ${C.F}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; if (kb > 0.9) ctx.fillText('THE NEWS', -700, 222);
      ctx.fillStyle = '#f3efe6'; ctx.fillRect(-720, 240, 1440 * eo(k(t, K.nobody - 0.2, 0.5)), 110); if (t > K.nobody) { ctx.font = `900 58px ${C.F}`; ctx.fillStyle = '#111'; ctx.fillText('AIRLINE BANS TEEN OVER TRAVEL HACK', -690, 315); } ctx.restore();
      C.camReset(ctx); C.typed(ctx, 'JULY 2023', 80, 96, t0 + 0.1, t, 34, '#f2d33b'); if (t > K.news) C.tag(ctx, 'HEADLINE PARAPHRASED', W - 70, H - 50, { al: 'right', size: 26, bg: '#e8e2d4', alpha: eo(k(t, K.news)) });
      break; }
    case 'usmap': { // GNV → CLT → NYC, home pin at Charlotte
      const cam = { lon: lerp(-80.5, -78.5, U), lat: lerp(35, 35.6, U), R: lerp(4200, 4700, U), dy: 30 }; C.map(ctx, cam, { hl: ['840'], hlCol: 'rgba(240,215,150,0.3)' });
      const kr = k(t, K.gnv - 0.1, Math.max(0.8, K.ny - K.gnv)); C.route(ctx, cam, [GNV, CLT, NYC], kr, { col: '#3b4a5e', lw: 8, dot: kr < 1 ? 'plane' : null, planeS: 0.45, bend: -0.06 });
      C.cityDot(ctx, cam, ...GNV, 'GAINESVILLE, FL', { dy: 40 }); if (t > K.clt - 0.2) C.cityDot(ctx, cam, ...CLT, 'CHARLOTTE', { dy: -40, alpha: k(t, K.clt - 0.2) }); if (t > K.ny - 0.2) C.cityDot(ctx, cam, ...NYC, 'NEW YORK', { al: 'right', dy: -40, alpha: k(t, K.ny - 0.2) });
      const pc = C.mp(...CLT, cam); if (t > K.stop2 - 0.1) C.markerEllipse(ctx, pc[0], pc[1], 110, 70, k(t, K.stop2 - 0.1, 0.4), 6, C.RED, 7);
      if (t > K.clt2 - 0.1) { C.pin(ctx, pc[0], pc[1], k(t, K.clt2 - 0.1, 0.5), { col: '#2f7d4f', light: '#8ad6a0' }); C.writeOn(ctx, 'HOME', pc[0] - 230, pc[1] + 20, '72px Marker', '#2f7d4f', k(t, K.lived - 0.1, 0.4)); }
      if (t > K.seventeen - 0.1) C.sticky(ctx, ['AGE: 17'], W * 0.16, H * 0.2, 300, -0.05, k(t, K.seventeen - 0.1), { h: 160, size: 60 });
      C.tag(ctx, 'ONE-WAY · GNV → CLT → NYC', 70, H - 60, { size: 30, alpha: eo(k(t, t0 + 0.3)) }); break; }
    case 'counter': { // check-in counter: generic figure, blank licence with "NC"
      C.desk(ctx, t, { warm: true, sy: H * 0.3 }); C.cam(ctx, { z: lerp(1.0, 1.06, U) });
      ctx.save(); ctx.fillStyle = '#3a3f48'; ctx.fillRect(W * 0.36, H * 0.6, W * 0.6, H * 0.42); ctx.fillStyle = '#4a515c'; ctx.fillRect(W * 0.36, H * 0.6, W * 0.6, 26); ctx.font = `700 40px ${C.MONO}`; ctx.fillStyle = '#c8d0dc'; ctx.textAlign = 'center'; ctx.fillText('CHECK-IN', W * 0.66, H * 0.72); ctx.restore();
      C.person(ctx, W * 0.22, H * 1.0, 1.5, { shirt: '#5a6f8a' }); // generic traveler (no face)
      const kl = eo(k(t, K.carolina - 0.2, 0.4)); if (kl > 0) { ctx.save(); ctx.translate(W * 0.63, lerp(H * 0.9, H * 0.42, kl)); ctx.rotate(-0.05); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillStyle = '#e9edf2'; C.roundRect(ctx, -300, -180, 600, 360, 24); ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#c4ccd6'; ctx.fillRect(-260, -120, 170, 210); ctx.fillStyle = '#9aa3af'; for (let i = 0; i < 4; i++) ctx.fillRect(-50, -100 + i * 50, 300 - i * 40, 18); ctx.font = `900 120px ${C.F}`; ctx.fillStyle = '#1f5f8b'; ctx.textAlign = 'center'; ctx.fillText('NC', 160, 140); ctx.font = `700 26px ${C.MONO}`; ctx.fillStyle = '#5a6f8a'; ctx.fillText("DRIVER'S LICENSE", 0, -140); ctx.restore(); }
      C.camReset(ctx); C.typed(ctx, 'GAINESVILLE AIRPORT', 80, 96, t0 + 0.1, t, 32, '#f2d33b');
      if (t > K.math - 0.2) { C.sticky(ctx, ['NC LICENSE', '+ STOP IN NC', '= ?'], W * 0.86, H * 0.24, 420, 0.06, k(t, K.math - 0.2), { h: 300, size: 56 }); }
      if (t > K.staff) C.tag(ctx, 'ACCOUNTS DIFFER ON WHERE HE WAS STOPPED', 70, H - 50, { size: 26, bg: '#e8e2d4', alpha: eo(k(t, K.staff)) });
      break; }
    case 'cancel': { // ticket cancelled + banned (per his dad)
      C.desk(ctx, t); const [sx, sy] = C.shake(t, K.banned, 14); C.cam(ctx, { z: lerp(1.0, 1.08, U), x: W / 2 + sx, y: H / 2 + sy });
      const p = C.pose(W / 2, H * 0.52, 1300, 520, { rx: 0.3, ry: -0.05, rz: -0.03 }); C.card3d(ctx, A.passBig.c, p); C.camReset(ctx);
      C.stamp(ctx, 'CANCELLED', W * 0.46, H * 0.5, K.cancelled - 0.04, t, 110, '#d0281c', -0.12);
      C.stamp(ctx, 'BANNED · 3 YEARS', W / 2, H * 0.18, K.banned - 0.04, t, 90, '#d0281c', 0.04); if (t > K.dad - 0.1) C.tag(ctx, '(PER HIS DAD — NOT CONFIRMED BY THE AIRLINE)', W / 2, H * 0.9, { al: 'center', size: 32, alpha: eo(k(t, K.dad - 0.1)) });
      break; }
    case 'ruleq': { // American's rule, quote card
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.08, U) }); C.flat(ctx, A.rulecard, W / 2, H * 0.5, 1360, -0.015); C.camReset(ctx);
      C.highlighter(ctx, W / 2 - 420, H * 0.5 + 5, 840, 60, k(t, K.gain - 0.15, 0.6)); C.highlighter(ctx, W / 2 - 520, H * 0.5 - 155, 520, 62, k(t, K.without - 0.1, 0.5), 'rgba(250,150,120,0.5)');
      C.typed(ctx, "AMERICAN'S RULE", 80, 96, t0 + 0.1, t, 34, '#f2d33b'); break; }
    case 'receipts': { // $150 vs $400
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.06, U) });
      const k1 = eo(k(t, K.skiplag - 0.1, 0.4)), k2 = eo(k(t, K.direct - 0.15, 0.4)); if (k1 > 0) C.flat(ctx, A.r150.c, W * 0.3, H * 0.52 + (1 - k1) * 700, 560, -0.04); if (k2 > 0) C.flat(ctx, A.r400.c, W * 0.7, H * 0.5 + (1 - k2) * 700, 680, 0.03);
      C.camReset(ctx); C.punch(ctx, '$150', W * 0.3, H * 0.13, K.hundred - 0.05, t, 120, '#2f9d5f'); C.punch(ctx, '$400', W * 0.7, H * 0.13, K.four - 0.05, t, 160, '#d0281c');
      if (t > K.fifty + 0.3) C.todayTag(ctx, '$160', W * 0.3, H * 0.92, K.fifty + 0.3, t, { size: 30, al: 'center' }); if (t > K.four + 0.4) C.todayTag(ctx, '$420', W * 0.7, H * 0.92, K.four + 0.4, t, { size: 30, al: 'center' });
      break; }
    case 'punish': { // paid too little → paid more
      C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.05, U) }); C.camReset(ctx);
      const kL = eo(k(t, t0 + 0.2, 0.4)), kM = eo(k(t, K.more - 0.2, 0.4)); C.label(ctx, 'PAID TOO LITTLE', W * 0.27, H * 0.45, { size: 84, col: '#2f9d5f', alpha: kL });
      if (kM > 0) { C.markerLine(ctx, C.curve([W * 0.42, H * 0.42], [W * 0.6, H * 0.42], -0.35, 40, 2), k(t, K.more - 0.5, 0.4), C.RED, 10, true); C.label(ctx, 'PAID MORE', W * 0.76, H * 0.45, { size: 110, col: '#d0281c', alpha: kM }); }
      if (t > K.punish - 0.1) C.typed(ctx, 'THE PUNISHMENT:', 80, 96, K.punish - 0.1, t, 36, '#f2d33b'); if (kM > 0.9) C.tag(ctx, '+$250', W * 0.76, H * 0.62, { al: 'center', size: 50, bg: '#d0281c', col: '#fff' });
      break; }
    case 'win': { // pricing team calls it a win (deadpan)
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.04, 1.1, U) });
      ctx.save(); ctx.translate(W * 0.42, H * 0.52); ctx.fillStyle = '#ece4d4'; ctx.fillRect(-520, -330, 1040, 660); ctx.font = `700 34px ${C.MONO}`; ctx.fillStyle = '#5a4a36'; ctx.textAlign = 'center'; ctx.fillText('PRICING TEAM · REVENUE REPORT', 0, -260);
      ctx.strokeStyle = '#241c14'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-420, 220); ctx.lineTo(420, 220); ctx.moveTo(-420, 220); ctx.lineTo(-420, -200); ctx.stroke(); const kg = k(t, t0 + 0.15, Math.max(0.8, K.win - t0 - 0.3));
      ctx.strokeStyle = '#2f7d4f'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-400, 160); ctx.lineTo(-400 + 780 * kg, 160 - 330 * kg); ctx.stroke(); ctx.font = `900 64px ${C.F}`; ctx.fillStyle = '#2f7d4f'; if (kg > 0.9) ctx.fillText('+$250', 250, -120); ctx.restore();
      for (let i = 0; i < 40; i++) { const u = (t - K.win) * 0.9 + hash(i) * 0.2; if (u < 0 || u > 1.3) continue; ctx.save(); ctx.fillStyle = ['#f2d33b', '#d0281c', '#2f7d4f', '#4a6fa5'][i % 4]; ctx.translate(W * (0.1 + hash(i * 3) * 0.8), H * (-0.05 + u * 0.9)); ctx.rotate(u * 6 + i); ctx.fillRect(-8, -4, 16, 8); ctx.restore(); }
      C.camReset(ctx); C.stamp(ctx, 'WIN?', W * 0.82, H * 0.3, K.win - 0.05, t, 120, '#2f7d4f', 0.1); if (t > K.somewhere - 0.1) C.tag(ctx, 'OUR TAKE', W - 70, H - 50, { al: 'right', size: 28, alpha: eo(k(t, K.somewhere - 0.1)) });
      break; }
    case 'legal': { // not illegal
      C.desk(ctx, t, { warm: true }); C.cam(ctx, { z: lerp(1.0, 1.08, U) }); C.flat(ctx, A.law, W * 0.36, H * 0.52, 640, -0.04); C.camReset(ctx);
      C.highlighter(ctx, W * 0.36 - 260, H * 0.52 - 20, 520, 50, k(t, K.illegal - 0.6, 0.5)); C.stamp(ctx, 'NOT ILLEGAL', W * 0.73, H * 0.42, K.illegal - 0.04, t, 110, '#2f7d4f', -0.08);
      C.typed(ctx, 'IS IT A CRIME?', 80, 96, t0 + 0.1, t, 34, '#f2d33b'); break; }
    case 'rulesdoc': { // but it breaks the airline's rules
      C.desk(ctx, t); C.cam(ctx, { z: lerp(1.0, 1.12, U), y: lerp(H / 2, H * 0.55, U) }); const p = C.pose(W * 0.42, H * 0.52, 700, 903, { rx: 0.1, ry: -0.12, rz: -0.02 }); C.card3d(ctx, A.coc, p);
      C.highlight(ctx, C.boxOf(p, [0.06, 0.43, 0.95, 0.56]), K.rules - 0.25, t, { dim: 0.5 }); C.camReset(ctx); C.stamp(ctx, 'AGAINST THE RULES', W * 0.78, H * 0.3, K.rules, t, 70, '#d0281c', 0.06);
      if (t > K.rules + 0.5) C.tag(ctx, 'A CONTRACT, NOT A LAW', W * 0.78, H * 0.48, { al: 'center', size: 34, alpha: eo(k(t, K.rules + 0.5)) }); break; }
    case 'list': case 'oneway': case 'bags': case 'reroute': case 'lose': { // WHAT CAN GO WRONG — light paper, numbered
      const items = ['ONE-WAY ONLY', 'NO CHECKED BAGS', 'REROUTES', 'LOSE MILES, ACCOUNT… AIRLINE'], idx = { list: -1, oneway: 0, bags: 1, reroute: 2, lose: 3 }[name];
      if (name === 'bags' || name === 'reroute') { // map scenes
        const cam = { lon: lerp(-92, -90, U), lat: lerp(38.8, 39.2, U), R: 1950, dy: 60 }; C.map(ctx, cam, { hl: ['840'], hlCol: 'rgba(240,215,150,0.3)' });
        if (name === 'bags') { const kr = k(t, t0 + 0.2, 2.6); const r1 = C.route(ctx, cam, [LAX, IAD, BOS], kr, { col: '#1f5f8b', lw: 8, dot: null, bend: 0.06 }); C.cityDot(ctx, cam, ...LAX, 'LOS ANGELES', { dy: 40 }); const pi = C.cityDot(ctx, cam, ...IAD, 'WASHINGTON', { al: 'right', dy: 44 }); C.cityDot(ctx, cam, ...BOS, 'BOSTON', { dy: -34 });
          if (r1) { C.plane(ctx, r1.p[0], r1.p[1], 0.5, r1.ang, { col: '#2b3442' }); const wave = Math.sin(t * 9) * 0.3; C.suitcase(ctx, r1.p[0] + 10, r1.p[1] - 70, 0.55, wave * 0.4); if (t > K.suitcase) { ctx.save(); ctx.strokeStyle = '#8a3b2a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(r1.p[0] + 40, r1.p[1] - 90); ctx.lineTo(r1.p[0] + 70 + wave * 30, r1.p[1] - 130); ctx.stroke(); ctx.restore(); } }
          if (kr > 0.55) C.person(ctx, pi[0] - 70, pi[1] + 10, 0.35, { shirt: '#4a6fa5' }); if (t > K.notyou - 0.1) C.sticky(ctx, ['BYE!'], (r1 ? r1.p[0] : W / 2) + 160, (r1 ? r1.p[1] : H / 2) - 170, 200, 0.08, k(t, K.notyou - 0.1), { h: 120, size: 56 });
          C.stamp(ctx, 'NO CHECKED BAGS', W * 0.5, H * 0.86, K.bags - 0.05, t, 70, '#b3241a', -0.03); }
        else { const snap = eio(k(t, K.rerouted - 0.05, 0.5)); const mid = [lerp(IAD[0], ORD[0], snap), lerp(IAD[1], ORD[1], snap)]; C.route(ctx, cam, [LAX, mid, BOS], 1, { col: snap > 0.5 ? '#b3241a' : '#1f5f8b', lw: 8, dot: null, bend: 0.06 });
          C.cityDot(ctx, cam, ...LAX, 'LOS ANGELES', { dy: 40 }); const pw = C.cityDot(ctx, cam, ...IAD, 'WASHINGTON', { al: 'right', dy: 44 }); C.cityDot(ctx, cam, ...BOS, 'BOSTON', { dy: -34 }); if (snap > 0.5) C.cityDot(ctx, cam, ...ORD, 'CHICAGO', { dy: -40, col: '#b3241a', alpha: k(t, K.different - 0.2) });
          C.person(ctx, pw[0] - 70, pw[1] + 10, 0.35, { shirt: '#4a6fa5' }); if (t > K.plan - 0.2) { C.sticky(ctx, ['?'], pw[0] - 140, pw[1] - 160, 140, -0.08, k(t, K.plan - 0.2), { h: 140, size: 90 }); C.stamp(ctx, 'PLAN: GONE', W * 0.5, H * 0.86, K.plan, t, 70, '#b3241a', 0.03); } }
        C.camReset(ctx); }
      else { board(ctx); C.cam(ctx, { z: lerp(1.0, 1.05, U) }); C.camReset(ctx); }
      // the checklist panel (top-left on map scenes, centred on the list)
      const listMode = name === 'list'; const PX = listMode ? W * 0.5 : W * 0.2, PY = listMode ? H * 0.53 : H * 0.2, sc = listMode ? 1 : 0.5;
      ctx.save(); ctx.translate(PX, PY); ctx.scale(sc, sc); ctx.rotate(-0.015); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 30; ctx.fillStyle = '#f6f0e1'; ctx.fillRect(-640, -360, 1280, 720); ctx.shadowColor = 'transparent';
      ctx.font = `900 72px ${C.F}`; ctx.textAlign = 'left'; ctx.fillStyle = '#241c14'; ctx.fillText('WHAT CAN GO WRONG', -580, -250); ctx.fillStyle = '#b3241a'; ctx.fillRect(-580, -225, 760, 8);
      items.forEach((s, i) => { const y = -130 + i * 130; const show = listMode ? k(t, K.wrong - 0.2 + i * 0.25, 0.3) : 1; if (show <= 0) return; ctx.globalAlpha = show; const on = i === idx; ctx.fillStyle = on ? '#f2d33b' : 'transparent'; if (on) ctx.fillRect(-600, y - 60, 1200, 100);
        ctx.strokeStyle = '#241c14'; ctx.lineWidth = 5; ctx.strokeRect(-580, y - 42, 64, 64); if (i < idx) { ctx.strokeStyle = C.RED; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-570, y - 10); ctx.lineTo(-548, y + 14); ctx.lineTo(-505, y - 40); ctx.stroke(); }
        ctx.font = `${on ? 900 : 700} 58px ${C.F}`; ctx.fillStyle = '#241c14'; ctx.fillText(`${i + 1}. ${s}`, -480, y + 10); ctx.globalAlpha = 1; });
      ctx.restore();
      if (name === 'oneway') { // outbound + return passes: return gets VOID and tears
        const po = { x: W * 0.62, y: H * 0.4 }, pr = { x: W * 0.62, y: H * 0.74 }; C.flat(ctx, A.outPass.c, po.x, po.y, 1000, -0.02);
        const kv = eio(k(t, K.cancels - 0.1, 0.6)); ctx.save(); ctx.translate(pr.x + kv * 40, pr.y + kv * 80); ctx.rotate(0.02 + kv * 0.12); ctx.globalAlpha = 1 - kv * 0.35; C.flat(ctx, A.retPass.c, 0, 0, 1000, 0); ctx.restore();
        const cx_ = po.x - 500 + A.outPass.pos[1] * 1000 / 1300 + 90; const kc = k(t, K.skipf - 0.05, 0.5); ctx.save(); ctx.strokeStyle = '#b3241a'; ctx.lineWidth = 7; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(cx_, po.y - 190); ctx.lineTo(cx_, lerp(po.y - 190, po.y + 190, kc)); ctx.stroke(); ctx.restore();
        C.stamp(ctx, 'VOID', pr.x, pr.y, K.ret - 0.05, t, 120, '#d0281c', -0.15); if (t > K.oneway - 0.1) C.tag(ctx, 'THE REST OF THE TRIP GOES TOO', W * 0.62, H * 0.95, { al: 'center', size: 32, alpha: eo(k(t, K.cancels)) }); }
      if (name === 'lose') { // miles → 0, account closed, airline banned
        const cards = [['MILES', K.miles], ['ACCOUNT', K.account2], ['YOUR AIRLINE', K.airline]]; cards.forEach(([lab, tk], i) => { const kk = eo(k(t, tk - 0.35, 0.35)); if (kk <= 0) return; const x = W * (0.52 + i * 0.17), y = H * 0.6 + (1 - kk) * 500;
          ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * 0.05); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.fillStyle = '#2b3442'; C.roundRect(ctx, -150, -200, 300, 400, 24); ctx.fill(); ctx.shadowColor = 'transparent';
          ctx.font = `900 40px ${C.F}`; ctx.fillStyle = '#e8ecf2'; ctx.textAlign = 'center'; ctx.fillText(lab, 0, -130);
          if (i === 0) { const v = Math.round(lerp(84210, 0, eio(k(t, tk + 0.1, 0.8)))); ctx.font = `900 64px ${C.F}`; ctx.fillStyle = '#f2d33b'; ctx.fillText(v.toLocaleString('en-US'), 0, 20); }
          else if (i === 1) { ctx.fillStyle = '#c8d0dc'; for (let j = 0; j < 4; j++) ctx.fillRect(-110, -60 + j * 50, 220 - j * 30, 16); }
          else C.plane(ctx, 0, 10, 0.9, -Math.PI / 2, { col: '#c9d3dc' }); ctx.restore();
          C.stamp(ctx, i === 0 ? 'GONE' : i === 1 ? 'CLOSED' : 'BANNED', x, y + 30, tk + 0.25, t, 56, '#d0281c', -0.15 + i * 0.1); });
        if (t > K.like - 0.1) C.tag(ctx, '(LIKE THAT TEENAGER)', W * 0.86, H * 0.95, { al: 'center', size: 30, alpha: eo(k(t, K.like - 0.1)) }); }
      break; }
  }
  C.finish(ctx, t, { mode, fade: t > T - 0.35 ? (t - (T - 0.35)) / 0.35 : (t < 0.25 ? 1 - t / 0.25 : 0) });
  const cv = ctx.canvas; WHIPS.forEach((x, i) => C.whip(ctx, cv, t, x, i % 2 ? -1 : 1)); GLITCH.forEach(x => C.glitch(ctx, cv, t, x));
}
function cues() { const sc = n => S[NAMES.indexOf(n)];
  return { T, whoosh: WHIPS.map(x => x - 0.1).concat([sc('letter') + 0.05, sc('claim') + 0.05]), glitch: GLITCH,
    type: [[0.3, 0.5], [sc('letter') + 0.1, 0.6], [sc('subject'), 0.4], [sc('claim') + 0.1, 0.7], [sc('news') + 0.1, 0.3], [sc('counter') + 0.1, 0.6], [sc('ruleq') + 0.1, 0.5], [K.punish - 0.1, 0.5], [sc('legal') + 0.1, 0.4]],
    stamp: [K.stop + 0.35, K.fraud - 0.04, K.collection + 0.1, K.shut + 0.1, K.refuse + 0.1, K.court - 0.05, K.against + 0.2, K.cancelled - 0.04, K.banned - 0.04, K.win - 0.05, K.illegal - 0.04, K.rules, K.bags - 0.05, K.plan, K.ret - 0.05, K.miles + 0.25, K.account2 + 0.25, K.airline + 0.25],
    hit: [K.y2018 - 0.05, K.thirty - 0.1, K.two - 0.05, K.hundred - 0.05, K.four - 0.05, K.more - 0.2],
    paper: [K.people, K.notice - 0.15, K.reimb - 0.2, K.strange - 0.1, K.further - 0.1, K.round - 0.1, K.berlin, K.appealed - 0.15, K.seventeen - 0.1, K.carolina - 0.2, K.math - 0.2, K.skiplag - 0.1, K.direct - 0.15, K.wrong - 0.2, K.wrong + 0.05, K.wrong + 0.3, K.wrong + 0.55, K.notyou - 0.1],
    marker: [K.people, K.thirty - 0.1, K.january, K.taken - 0.1, K.off - 0.05, K.berlin - 0.25, K.stop2 - 0.1, K.lived - 0.1, K.gain - 0.15, K.more - 0.5, K.skipf - 0.05],
    counter: [[K.three - 0.1, Math.max(0.8, K.cents - K.three)], [K.thirty - 0.1, 1.0], [K.ten, 1.1], [K.miles + 0.1, 0.8]], ding: [K.win - 0.05, K.rerouted - 0.05],
    plane: [K.oslo - 0.2, K.home - 0.4, K.gnv - 0.1, S[NAMES.indexOf('news')] + 0.2, S[NAMES.indexOf('bags')] + 0.2],
    mode: SC.map(([n, x]) => [x, DARK.has(n) ? 'dark' : 'paper']).filter((m, i, a) => i === 0 || m[1] !== a[i - 1][1]) }; }
module.exports = { T, frame, cues, tl };
if (require.main === module) { const m = process.argv[2];
  if (m === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log('T', T); }
  else if (m === 'still') C.stills(process.argv[3].split(',').map(Number), process.argv[4], frame);
  else if (m === 'sheet') { const ts = []; for (let x = 0.3; x < T; x += +(process.argv[4] || 2.0)) ts.push(+x.toFixed(2)); C.stills(ts, process.argv[3], frame, 8, 0.15); }
  else if (m === 'video') C.render(path.join(D, 'seg_video.mp4'), T, frame).then(() => console.log('done', T)); }
