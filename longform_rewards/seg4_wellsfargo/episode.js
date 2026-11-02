process.env.HIR_WIDE = '1';
// Long-form "When Paying People Backfired" (How It's Run, YouTube 16:9) — segment 4, CHAPTER 4 · USA, 2009–2016 · The Fake Accounts.
// Script rows 18–24 (voice lines s01–s07 in script.json). Darker, serious tone in the same paper style: a generic bank branch at night
// and by day, clerks at desks, the daily target board, the BONUS envelope, account cards multiplying, a small fee tag, the
// "PRODUCTS PER CUSTOMER" chart with the "8" goal, a generic Senate hearing, $185M · 2016, 2,000,000 → 3,500,000, fired employees
// with boxes, $3,000,000,000, WANTED: LOYAL CUSTOMERS / PAID FOR: ACCOUNTS. "Wells Fargo" only as plain text; all people generic.
// Usage: node episode.js cues | srt out.srt | still t1,t2,... out.png | frame t out.png [nosubs] | video out.mp4 | shots
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../../tests/mcd_collage/kit');
const EN = require('../../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../../hirkit/rig');
const CL = require('../../hirkit/collage');
const LT = require('../../hirkit/light');
const { makeEdit } = require('../../hirkit/edit');
const ST = require('../../howitsrun_style/style');
const SE = require('../../howitsrun_style/sets');
const RK = require('../../rats_ep26/ratkit');            // read-only: the cartoon rat, coin, magnifier
const HK = require('../../hoover_ep19/hoovkit');         // read-only: the vacuum
const B = require('./bankkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, label, txt, fitTxt } = ST;

// ---------- voice timeline: chapter card 0–3 s, then the lines with 0.7 s gaps ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = 0.7;
const Z = {}; let T = 3.0; for (const L of LINES) { Z[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP; }
const V = EN.voice(`${__dirname}/vo`, Z), end = id => Z[id] + SP[id][1];
const nrm = x => x.toLowerCase().replace(/[^a-z0-9'-]/g, '');
const at = (id, w, n = 0) => { const ws = V.words(id); let m = ws.filter(x => nrm(x.w) === w); if (!m.length) m = ws.filter(x => nrm(x.w).startsWith(w)); if (!m.length) throw new Error(`no word ${id} ${w}`); return (m[n] || m[m.length - 1]).t0; };
const tEnd = +end(LINES[LINES.length - 1].id).toFixed(3);
T = +(tEnd + 0.6).toFixed(2);

// ---------- helpers ----------
const FACE = B.face;
const scene = (ctx, lt, keys, fn) => { const c = cam(keys, lt); layer(ctx, c, 1, fn); return c; };
const fmt = n => Math.round(n).toLocaleString('en-US');
function plate(ctx, s, x, y, u, size = 120, col = C.red, fg = PAL.cream, rot = -0.03) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = E.back(clamp(u), 2); ctx.scale(k, k); RK.bigPlate(ctx, s, size, col, fg); ctx.restore(); }
function stampAt(ctx, s, x, y, size, u, col = C.red, rot = -0.1) { ctx.save(); ctx.translate(x, y); ST.stampWord(ctx, s, size, u, col, rot); ctx.restore(); }
function paperBg(ctx, col = '#E9E3D3', stripe = 'rgba(46,58,89,0.06)') { ST.bg(ctx, col); ctx.fillStyle = stripe; for (let i = 0; i < 40; i++) ctx.fillRect(0, i * 60, W, 4); }
function flash(ctx, t, t0) { const u = seg(t, t0, t0 + 0.25); if (u <= 0 || u >= 1) return; ctx.save(); ctx.globalAlpha = 0.5 * (1 - u); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function puddingCup(ctx, s = 1) { ctx.save(); ctx.scale(s, s); SE.poly(ctx, [[-90, -150], [90, -150], [70, 0], [-70, 0]], '#FFFDF8', 5); ctx.fillStyle = '#E9E3D3'; ctx.fillRect(-80, -70, 160, 30);
  R.ell(ctx, 0, -150, 92, 22); R.fillStroke(ctx, '#7A4A2A', 5); R.tube(ctx, [[30, -160], [120, -260]], 12, '#C9CED6', 4); R.ell(ctx, 22, -152, 26, 12); R.fillStroke(ctx, '#C9CED6', 4); ctx.restore(); }
function iconCard(ctx, x, y, u, rot, draw, cap) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = E.back(clamp(u), 1.8); ctx.scale(k, k);
  CL.cutout(ctx, () => rr(ctx, -210, -230, 420, 460, 18), '#FFFDF8', { elev: 1.6 }); ctx.save(); rr(ctx, -200, -220, 400, 360, 14); ctx.clip(); ctx.fillStyle = '#DCEBF6'; ctx.fillRect(-200, -220, 400, 360); draw(ctx); ctx.restore();
  fitTxt(ctx, cap, 0, 200, 52, '#171717', 360); ctx.restore(); }

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });

// CARD (0–3 s, no voice): CHAPTER 4 · The Fake Accounts · USA · 2009–2016
shot('CARD', 0, Z.s01, (ctx, t) => { B.chapterCard(ctx, t, 'CHAPTER 4', 'The Fake Accounts', 'USA · 2009–2016', { icon: (g, tt) => B.bankIcon(g, 1.0) }); ST.grade(ctx, 'office', 0.25); });

// A1 (s01 "Rats, vacuums and pudding are funny."): the three funny chapters as paper cards
const tVac = at('s01', 'vacuums'), tPud = at('s01', 'pudding'), tFunny = at('s01', 'funny'), tThis = at('s01', 'this');
shot('A1 funny', Z.s01, tThis - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#EDE6D6'); const z = 1 + lt * 0.02; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  iconCard(ctx, 480, 480, seg(t, Z.s01 - 0.05, Z.s01 + 0.25), -0.06, g => { g.save(); g.translate(-10, 90); RK.rat(g, { s: 1.0, mood: 'happy', phase: t * 3, look: [0.6, -0.2] }); g.restore(); }, 'RATS');
  iconCard(ctx, 960, 470, seg(t, tVac - 0.08, tVac + 0.22), 0.04, g => { g.save(); g.translate(0, 120); HK.vacuum(g, 0.72); g.restore(); }, 'VACUUMS');
  iconCard(ctx, 1440, 485, seg(t, tPud - 0.08, tPud + 0.22), -0.03, g => { g.save(); g.translate(-20, 110); puddingCup(g, 1.15); g.restore(); }, 'PUDDING');
  ctx.restore();
  label(ctx, 'FUNNY', W / 2, 820, pop(t, tFunny - 0.05), { size: 70, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'day', 0.15);
});
// A2 (s01 "This one isn't."): the bank branch at night, one window lit
shot('A2 night bank', tThis - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -820, 0.62], [2.5, 0, -790, 0.68]], w => B.bankFront(w, t, { night: true, litWin: 1 }));
  label(ctx, 'THIS ONE ISN\'T.', W / 2, 200, pop(t, at('s01', 'isn') - 0.1), { size: 74, col: '#171717', fg: PAL.cream, rot: -0.02 });
  ST.grade(ctx, 'dark', 0.3);
});

// B1 (s02 "For years, one of America's biggest banks"): the bank by day, customers walking past
const tBiggest = at('s02', 'biggest'), tTold = at('s02', 'told'), tWatch = at('s02', 'watch'), tNumber = at('s02', 'number'), tHow = at('s02', 'how'), tProducts = at('s02', 'products'),
  tEach = at('s02', 'each'), tThe2 = at('s02', 'the'), tGoal = at('s02', 'goal'), tEight = at('s02', 'eight'), tPer = at('s02', 'per'), tSen = at('s02', 'senators'), tQuoted = at('s02', 'quoted'), tEight2 = at('s02', 'eight', 1), tGreat = at('s02', 'great');
shot('B1 bank day', Z.s02 - 0.12, tTold - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -700, 0.6], [2.6, 0, -720, 0.66]], w => { B.bankFront(w, t, { lampX: -1100 });
    B.who(w, -1500 + lt * 160, 60, 1.0, 1, 'customer', { face: FACE('neutral', [1, 0], t), ...R.walk(t * 4.5) }, { tie: false });
    B.who(w, 1500 - lt * 140, 80, 1.0, -1, 'investorB', { face: FACE('smile', [1, 0], t, 1), ...R.walk(t * 4.5 + 1) }, { tie: false }); });
  label(ctx, 'FOR YEARS…', 300, 200, pop(t, Z.s02 + 0.1), { size: 52, rot: -0.03 });
  label(ctx, 'ONE OF AMERICA\'S BIGGEST BANKS', W / 2 + 120, 200, pop(t, tBiggest - 0.05), { size: 60, col: B.NAVY, fg: PAL.cream, rot: 0.02 });
  ST.grade(ctx, 'day', 0.18);
});
// B2 (s02 "told everyone to watch one number:"): the CEO points at the chart in the boardroom; two staff watch
function boardroom(w, t) { SE.room(w, t, { wall: '#E4DCCB', floor: 'carpet', carpet: '#4A5470', window: -1500 }); }
shot('B2 watch', tTold - 0.12, tHow - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -620, 0.7], [2.4, 60, -630, 0.76]], w => { boardroom(w, t);
    w.save(); w.translate(380, -760); w.scale(0.82, 0.82); B.chartBoard(w, t, { grow: seg(t, tNumber - 0.3, tNumber + 0.6) }); w.restore();
    B.who(w, -420, 0, 1.15, 1, 'ceo', { face: FACE('smile', [1, -0.3], t), armN: { hand: [170, -380], grip: 'point' }, lean: 0.04 });
    B.who(w, -1150, 0, 1.0, 1, 'clerkA', { face: FACE('neutral', [1, -0.3], t, 1) }, { tie: false });
    B.who(w, 1250, 0, 1.0, -1, 'investorA', { face: FACE('neutral', [1, -0.2], t, 2) }); });
  label(ctx, 'WATCH ONE NUMBER', W / 2, 190, pop(t, tWatch - 0.05), { size: 66, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// B3 (s02 "how many products each customer had."): the chart close; a customer holding a growing stack of product cards
shot('B3 products', tHow - 0.12, tThe2 - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#E4DCCB');
  ctx.save(); ctx.translate(700, 470); const z = 0.98 + lt * 0.02; ctx.scale(z, z); B.chartBoard(ctx, t, { easel: false, w: 900, h: 600, grow: seg(t, tProducts - 0.2, tProducts + 1.0) }); ctx.restore();
  const n = Math.floor(lerp(0, 5, seg(t, tEach - 0.1, tEach + 1.2)));
  ctx.save(); ctx.translate(1510, 880); B.who(ctx, 0, 0, 0.9, -1, 'customer', { face: FACE(n > 3 ? 'surprised' : 'neutral', [1, -0.4], t), armN: { hand: [120, -260], grip: 'hold' }, armF: { hand: [100, -258], grip: 'hold' } }, { tie: false });
  const kinds = ['CHECKING', 'SAVINGS', 'CREDIT CARD', 'DEBIT CARD', 'ONLINE BANKING'];
  for (let i = 0; i < n + 1; i++) B.acctCard(ctx, kinds[i], { s: 0.42, x: -110, y: -250 - i * 50, rot: (hash(i) - 0.5) * 0.2 });
  ctx.restore();
  label(ctx, 'PER CUSTOMER', 1500, 160, pop(t, at('s02', 'customer') - 0.05), { size: 50, col: B.NAVY, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.18);
});
// B4 (s02 "The CEO's goal was eight per customer."): the CEO at the chart; the GOAL line at 8; the big 8 plate
shot('B4 goal 8', tThe2 - 0.12, tSen - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 80, -640, 0.74], [2.8, 120, -650, 0.8]], w => { boardroom(w, t);
    w.save(); w.translate(420, -760); w.scale(0.82, 0.82); B.chartBoard(w, t, { goal: seg(t, tGoal - 0.1, tEight + 0.2) }); w.restore();
    B.who(w, -300, 0, 1.15, 1, 'ceo', { face: FACE('grin', [1, -0.3], t), armN: { hand: [150, -420], grip: 'point' }, lean: 0.03 }); });
  label(ctx, 'THE CEO\'S GOAL', 420, 200, pop(t, tThe2), { size: 52, rot: -0.03 });
  plate(ctx, '8', 300, 450, pop(t, tEight - 0.08, 0.35), 200, PAL.green);
  label(ctx, 'PER CUSTOMER', 300, 650, pop(t, tPer - 0.05), { size: 44, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'office', 0.2);
});
// B5 (s02 "Senators later quoted his line: "eight is great.""): a generic Senate hearing; senators at the dais, the witness at the table
function hearing(w, t, o = {}) {
  B.hearingRoom(w, t, { emblem: false });
  const sen = [['senA', -900], ['senB', -500], ['senC', -100]];
  sen.forEach(([n, x], i) => B.who(w, x, -170, 0.95, 1, n, { face: FACE(i === 1 && o.point ? 'skeptical' : 'neutral', [1, 0.15], t, i), lean: i === 1 && o.point ? 0.08 : 0, armN: i === 1 && o.point ? { hand: [170, -390], grip: 'point' } : { hand: [120, -260], grip: 'relax' } }));
  B.dais(w, -1150, 150, [[-900, 'SENATOR'], [-500, 'SENATOR'], [-100, 'SENATOR']]);
  B.whoSeated(w, 840, 0, 1.0, -1, 'ceo', { face: FACE(o.witFace || 'worried', [1, -0.2], t, 2), armN: { hand: [130, -300], grip: 'fist' }, armF: { hand: [110, -300], grip: 'fist' } });
  B.witnessTable(w, 520, 'WITNESS');
}
shot('B5 hearing', tSen - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const k = E.inOut(seg(t, tQuoted - 0.4, tQuoted + 0.4));
  scene(ctx, lt, [[0, -150, -540, 0.8], [3.8, -130, -545, 0.84]], w => hearing(w, t, { point: t > tQuoted - 0.2, witFace: t > tEight2 ? 'worried' : 'neutral' }));
  label(ctx, 'SENATE HEARING · 2016', W / 2, 150, pop(t, tSen - 0.05), { size: 48, col: '#171717', fg: C.yellow });
  const u = pop(t, tEight2 - 0.08, 0.35); if (u > 0) { ctx.save(); ctx.translate(W / 2 + shake(t, tGreat, 6), 280); ctx.rotate(0.02); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -430, -80, 860, 150, 18), C.yellow, { elev: 1.8 }); fitTxt(ctx, '“EIGHT IS GREAT”', 0, 30, 92, '#171717', 800); ctx.restore(); }
  ST.grade(ctx, 'evening', 0.28);
});

// C1 (s03 "Employees had daily sales targets,"): the branch by day; a clerk at her desk under the daily target board
const tDaily = at('s03', 'daily'), tTargets = at('s03', 'targets'), tBonuses = at('s03', 'bonuses'), tTied = at('s03', 'tied'), tSo3 = at('s03', 'so'), tCheapest = at('s03', 'cheapest'), tNum3 = at('s03', 'number'), tUp = at('s03', 'up');
function branchDesk(w, t, o = {}) {
  B.branch(w, t, { night: o.night, posterX: -1000, clockX: 1300 });
  w.save(); w.translate(220, -720); B.targetBoard(w, { n: o.n ?? 3, goal: 20, up: o.up || 0 }); w.restore();
  B.whoSeated(w, -560, 0, 1.0, 1, o.who || 'clerkA', { face: o.face || FACE('neutral', [1, 0], t), armN: { hand: o.hand || [150, -320], grip: o.grip || 'relax' }, armF: { hand: [130, -320], grip: 'relax' } }, { tie: false, badge: 'STAFF' });
  B.clerkDesk(w, -150, { papers: o.papers ?? 3, glow: 1, mx: -40 });
  if (o.extra) o.extra(w);
}
shot('C1 targets', Z.s03 - 0.12, tBonuses - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, -100, -620, 0.66], [2.3, 80, -700, 0.78]], w => branchDesk(w, t, { face: FACE('neutral', [0.6, -0.8], t), n: 3 }));
  label(ctx, 'EMPLOYEES', 380, 190, pop(t, Z.s03 + 0.02), { size: 50, rot: -0.03 });
  label(ctx, 'EVERY SINGLE DAY', 1460, 200, pop(t, tDaily - 0.05), { size: 48, col: B.NAVY, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// C2 (s03 "and bonuses tied to them."): the BONUS envelope lands on the desk; a dashed line ties it to the board
shot('C2 bonus', tBonuses - 0.12, tSo3 - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, -120, -560, 0.92], [1.8, -100, -570, 0.98]], w => branchDesk(w, t, { face: FACE('smile', [1, 0.3], t), n: 3 }));
  const u = seg(t, tBonuses - 0.1, tBonuses + 0.3); ctx.save(); ctx.translate(lerp(1900, 1580, E.out(u)), lerp(80, 700, E.out(u))); ctx.rotate(lerp(0.6, -0.08, u)); B.bonusEnvelope(ctx, 1.05, { open: seg(t, tTied, tTied + 0.4) }); ctx.restore();
  const v = seg(t, tTied - 0.05, tTied + 0.5); if (v > 0) { ctx.save(); ctx.setLineDash([18, 14]); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1290, 600); ctx.lineTo(lerp(1290, 1470, v), lerp(600, 650, v)); ctx.stroke(); ctx.restore(); }
  label(ctx, 'TIED TO THE TARGET', 560, 190, pop(t, tTied - 0.05), { size: 54, col: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'office', 0.2);
});
// C3 (s03 "So some of them did the cheapest thing that made the number go up."): the clerk thinks; the number jumps
shot('C3 cheapest', tSo3 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  const n = lerp(3, 20, E.inOut(seg(t, tNum3 - 0.1, tUp + 0.4)));
  scene(ctx, lt, [[0, -60, -640, 0.8], [3.0, 60, -660, 0.86]], w => branchDesk(w, t, { face: FACE(t > tCheapest - 0.1 ? 'smug' : 'worried', t > tCheapest ? [1, 0] : [0.6, -0.8], t), n, up: seg(t, tUp - 0.2, tUp + 0.3) }));
  if (t < tCheapest - 0.05) label(ctx, 'SOME OF THEM…', W / 2, 190, pop(t, tSo3 + 0.05), { size: 50, rot: -0.03 });
  label(ctx, 'THE CHEAPEST WAY TO MAKE THE NUMBER', W / 2, 190, pop(t, tCheapest - 0.05), { size: 50, col: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'office', 0.22);
});

// D1 (s04 "They opened accounts customers never asked for."): the clerk opens accounts; the customer's chair stays empty
const tNever = at('s04', 'never'), tChecking = at('s04', 'checking'), tSavings = at('s04', 'savings'), tCredit = at('s04', 'credit'), tApps = at('s04', 'applications'), tSometimes = at('s04', 'sometimes'), tFees = at('s04', 'fees'), tCust4 = at('s04', 'customer'), tPaid4 = at('s04', 'paid');
shot('D1 never asked', Z.s04 - 0.12, tChecking - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -620, 0.74], [2.7, 40, -630, 0.8]], w => { B.branch(w, t, { posterX: -1300, clockX: 1300 });
    B.whoSeated(w, -620, 0, 1.0, 1, 'clerkB', { face: FACE('squint', [1, 0.3], t), armN: { hand: [150, -320], grip: 'relax' }, armF: { hand: [130, -320], grip: 'relax' } }, { badge: 'STAFF' });
    B.clerkDesk(w, -200, { papers: 2, glow: 1, mx: -60 });
    // the customer's chair, empty
    w.save(); w.translate(360, 0); w.scale(-1, 1); rr(w, -120, -510, 70, 300, 24); R.fillStroke(w, '#5E6E8E', 5); rr(w, -120, -220, 230, 40, 14); R.fillStroke(w, '#5E6E8E', 5); R.tube(w, [[-10, -180], [-10, 0]], 18, '#2A2A30', 4); R.tube(w, [[-90, 0], [70, 0]], 14, '#2A2A30', 4); w.restore();
    const q = pop(t, tNever - 0.1); if (q > 0) { w.save(); w.translate(380, -420); w.scale(q, q); fitTxt(w, '?', 0, 0, 260, '#5E6E8E', 200); w.restore(); }
    for (let i = 0; i < 3; i++) { const u = seg(t, Z.s04 + 0.2 + i * 0.5, Z.s04 + 0.8 + i * 0.5); if (u > 0) B.acctCard(w, ['CHECKING', 'SAVINGS', 'CREDIT CARD'][i], { s: 0.55, x: lerp(-260, -60 + i * 40, E.out(u)), y: lerp(-500, -340 - i * 14, E.out(u)), rot: (i - 1) * 0.1 }); } });
  label(ctx, 'THEY OPENED ACCOUNTS…', 460, 190, pop(t, Z.s04 + 0.05), { size: 52, rot: -0.03 });
  label(ctx, 'NOBODY ASKED FOR', 1380, 200, pop(t, tNever - 0.05), { size: 56, col: C.red, fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.22);
});
// D2 (s04 "Checking accounts. Savings accounts. Credit card applications."): the cards multiply over the screen
const CARDS = []; for (let i = 0; i < 64; i++) CARDS.push({ x: 140 + (i % 8) * 232 + (hash(i) - 0.5) * 60, y: 170 + Math.floor(i / 8) * 96 + (hash(i + 3) - 0.5) * 40, r: (hash(i + 7) - 0.5) * 0.5 });
shot('D2 multiply', tChecking - 0.12, tSometimes - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, -300, -560, 0.62], [4.8, -260, -570, 0.66]], w => { B.branch(w, t, { posterX: -1400, clockX: 1300, poster: false });
    B.whoSeated(w, -1050, 0, 1.0, 1, 'clerkB', { face: FACE('smug', [1, 0], t), armN: { hand: [150, -320 + Math.sin(t * 18) * 6], grip: 'relax' }, armF: { hand: [130, -320], grip: 'relax' } }, { badge: 'STAFF' });
    B.clerkDesk(w, -630, { papers: 4, glow: 1, mx: -60 }); });
  // the cards: CHECKING from 'checking', SAVINGS from 'savings', CREDIT CARD from 'credit'; then they double every 0.3 s
  const kinds = [['CHECKING', tChecking], ['SAVINGS', tSavings], ['CREDIT CARD', tCredit]];
  let n = 0; for (const [, t0] of kinds) if (t > t0 - 0.1) n += 1 + Math.floor(Math.min(20, Math.pow(2, Math.max(0, (t - t0) / 0.32)) - 1));
  n = Math.min(CARDS.length, n);
  const order = CARDS.map((c, i) => i).sort((a, b) => hash(a + 11) - hash(b + 11));
  let k = 0; for (const [kind, t0] of kinds) { if (t < t0 - 0.1) continue; const m = Math.min(20, Math.floor(Math.pow(2, Math.max(0, (t - t0) / 0.32))));
    for (let j = 0; j < m && k < n; j++, k++) { const c = CARDS[order[k]]; if (c.x < 760 && c.y > 560) continue; const u = clamp((t - t0 - j * 0.03) / 0.22); if (u <= 0) continue; ctx.save(); ctx.translate(c.x + 480, c.y); const s = E.back(u, 2) * 0.62; B.acctCard(ctx, kind, { s, rot: c.r, elev: 0.8 }); ctx.restore(); } }
  ctx.save(); ctx.translate(380, 210); CL.cutout(ctx, () => rr(ctx, -250, -70, 500, 140, 14), '#171717', { elev: 1.4 }); fitTxt(ctx, 'NEW ACCOUNTS', 0, -18, 34, C.yellow, 440); fitTxt(ctx, fmt(Math.max(0, n)), 0, 48, 64, PAL.cream, 440); ctx.restore();
  ST.grade(ctx, 'office', 0.24);
});
// D3 (s04 "Sometimes with fees the customer then paid."): a customer at home opens a statement; the FEE tag swings in; PAID
shot('D3 fees', tSometimes - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -600, 0.78], [3.4, 60, -620, 0.86]], w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood', window: -900, frame: { x: 900 } });
    rr(w, 120, -300, 560, 34, 8); R.fillStroke(w, '#B07A4A', 5); for (const lx of [150, 620]) { rr(w, lx, -266, 30, 266, 6); R.fillStroke(w, '#8A5A34', 4.5); }
    B.who(w, -200, 0, 1.1, 1, 'customer', { face: FACE(t > tFees ? 'shocked' : 'neutral', [1, 0.3], t), armN: { hand: [150, -330], grip: 'pinch', item: g => { g.save(); g.translate(30, -60); g.rotate(-0.1); rr(g, -60, -80, 140, 170, 4); R.fillStroke(g, '#FFFDF8', 3.5); g.fillStyle = 'rgba(46,58,89,0.3)'; for (let i = 0; i < 5; i++) g.fillRect(-46, -60 + i * 26, 100, 7); g.restore(); } }, armF: { hand: [120, -320], grip: 'pinch' }, headTilt: t > tFees ? -0.06 : 0 }, { tie: false });
    w.save(); w.translate(420, -300); RK.coin(w, 34, '$', {}); w.restore(); });
  const u = seg(t, tFees - 0.15, tFees + 0.35); if (u > 0) { ctx.save(); ctx.translate(1180, 300 + Math.sin(t * 5) * 6); ctx.rotate(Math.sin(t * 3) * 0.06); ctx.scale(E.back(u, 2), E.back(u, 2)); B.feeTag(ctx, 1.1, 'FEE', { col: C.yellow }); ctx.restore(); }
  label(ctx, 'SOMETIMES…', 400, 190, pop(t, tSometimes), { size: 50, rot: -0.03 });
  stampAt(ctx, 'PAID BY THE CUSTOMER', 1260, 600, 58, seg(t, tPaid4 - 0.1, tPaid4 + 0.25), C.red, -0.06);
  ST.grade(ctx, 'golden', 0.22);
});

// E1 (s05 "In 2016, regulators fined Wells Fargo 185 million dollars."): the calendar 2016, regulators, then the stamp over the bank
const tRegs = at('s05', 'regulators'), tFined = at('s05', 'fined'), tWells = at('s05', 'wells'), t185 = at('s05', '185'), tMil5 = at('s05', 'million'), tBanks = at('s05', 'bank'), tAbout5 = at('s05', 'about'), tTwo = at('s05', 'two'),
  tMay = at('s05', 'may'), tAuth = at('s05', 'authorized'), tA5 = at('s05', 'a'), tYear = at('s05', 'year'), tBigger = at('s05', 'bigger'), tRaised = at('s05', 'raised'), t35 = at('s05', '35'), tMil5b = at('s05', 'million', 2);
shot('E1 regulators', Z.s05 - 0.12, tWells - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -620, 0.74], [3, 60, -630, 0.8]], w => { B.pressRoom(w, t);
    B.who(w, 300, 0, 1.05, -1, 'director', { face: FACE('squint', [1, 0], t), armN: { hand: [130, -300], grip: 'pinch', item: g => { g.save(); g.translate(30, -80); g.rotate(-0.06); rr(g, -70, -100, 150, 190, 4); R.fillStroke(g, '#FFFDF8', 3.5); g.font = `30px ${F.black}`; g.textAlign = 'center'; g.fillStyle = C.red; g.save(); g.scale(-1, 1); g.fillText('FINE', -4, -50); g.restore(); g.fillStyle = 'rgba(46,58,89,0.3)'; for (let i = 0; i < 4; i++) g.fillRect(-50, -20 + i * 24, 110, 7); g.restore(); } } });
    B.who(w, 900, 0, 1.0, -1, 'senA', { face: FACE('neutral', [1, 0], t, 1) }, { L: { top: '#5A6478', cuff: '#4A5468', pants: '#3A4050', hair: '#5A3A22' } }); });
  const u = pop(t, Z.s05 - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(470, 470); ctx.rotate(-0.04); ctx.scale(u * 0.95, u * 0.95); ST.calCard(ctx, 'SEPT', '2016'); ctx.restore(); }
  label(ctx, 'REGULATORS', 1360, 190, pop(t, tRegs - 0.05), { size: 56, col: B.NAVY, fg: PAL.cream, rot: 0.03 });
  stampAt(ctx, 'FINED', 1400, 340, 70, seg(t, tFined - 0.05, tFined + 0.25), C.red, 0.06);
  ST.grade(ctx, 'office', 0.24);
});
shot('E1b 185M', tWells - 0.12, tBanks - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -760, 0.62], [4.5, 0, -800, 0.7]], w => B.bankFront(w, t, { lampX: -1150 }));
  label(ctx, 'WELLS FARGO', W / 2, 200, pop(t, tWells - 0.05), { size: 72, col: PAL.cream, fg: '#171717', rot: -0.02 });
  const u = seg(t, t185 - 0.1, t185 + 0.25); if (u > 0) { ctx.save(); ctx.translate(W / 2 + shake(t, t185 + 0.15, 8), 560); ST.stampWord(ctx, '$185M · 2016', 130, u, C.red, -0.06); ctx.restore(); }
  label(ctx, 'FINED, IN TOTAL', W / 2, 760, pop(t, tMil5 - 0.05), { size: 46, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'day', 0.24);
});
// E2 (s05 "The bank's own count: about two million accounts that may not have been authorized."): the file room; the counter
shot('E2 2M', tBanks - 0.12, tA5 - 0.12, (ctx, t, lt) => {
  const n = seg(t, tBanks, tTwo + 0.6);
  scene(ctx, lt, [[0, 0, -620, 0.74], [5, 40, -640, 0.8]], w => { B.branch(w, t, { wall: 1, poster: false, clockX: 1400, hour: 7 }); w.save(); w.translate(250, 0); B.fileStacks(w, n, { cols: 9, dx: 190 }); w.restore();
    B.who(w, -1100, 0, 1.05, 1, 'investorB', { face: FACE(t > tMay ? 'worried' : 'squint', [1, -0.2], t), armN: { hand: [140, -320], grip: 'pinch', item: g => { g.save(); g.translate(30, -50); rr(g, -50, -70, 110, 140, 6); R.fillStroke(g, '#C9A06A', 3.5); rr(g, -40, -60, 90, 120, 3); R.fillStroke(g, '#FFFDF8', 2.5); g.restore(); } } }, { tie: false, badge: 'AUDIT' }); });
  label(ctx, 'THE BANK\'S OWN COUNT', 470, 180, pop(t, tBanks), { size: 52, rot: -0.03 });
  const c = fmt(Math.round(lerp(0, 2000000, E.out(seg(t, tAbout5 - 0.2, tTwo + 0.5))) / 1000) * 1000);
  plate(ctx, '≈ ' + c, 1180, 330, pop(t, tAbout5 - 0.15), 110, '#171717', PAL.cream, -0.02);
  label(ctx, 'ACCOUNTS', 1180, 480, pop(t, at('s05', 'accounts') - 0.05), { size: 48, col: C.yellow });
  stampAt(ctx, 'MAY NOT BE AUTHORIZED', 1120, 640, 54, seg(t, tAuth - 0.1, tAuth + 0.3), C.red, -0.05);
  ST.grade(ctx, 'office', 0.24);
});
// E3 (s05 "A year later, a bigger review raised it to about 3.5 million."): 2017; the magnifier; 2,000,000 → 3,500,000
shot('E3 3.5M', tA5 - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const n = 1 + seg(t, tRaised - 0.1, t35 + 0.8) * 0.5;
  scene(ctx, lt, [[0, 0, -640, 0.7], [4.8, 0, -660, 0.74]], w => { B.branch(w, t, { poster: false, clockX: 1400, hour: 8 }); w.save(); w.translate(0, 0); w.scale(1, n * 0.9 + 0.1); B.fileStacks(w, 1, { cols: 11, dx: 190 }); w.restore();
    const mu = seg(t, tBigger - 0.3, t35 + 0.6); if (mu > 0) { w.save(); w.translate(lerp(-900, 800, E.inOut(mu)), -260 + Math.sin(mu * 9) * 40); w.scale(2.2, 2.2); RK.magnifier(w, 1); w.restore(); } });
  const u = pop(t, tA5 - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(300, 300); ctx.rotate(-0.05); ctx.scale(u * 0.62, u * 0.62); ST.calCard(ctx, 'AUG', '2017'); ctx.restore(); }
  label(ctx, 'A BIGGER REVIEW', 1450, 190, pop(t, tBigger - 0.05), { size: 52, col: B.NAVY, fg: PAL.cream, rot: 0.03 });
  const v = lerp(2000000, 3500000, E.inOut(seg(t, tRaised, t35 + 0.4)));
  plate(ctx, '≈ ' + fmt(Math.round(v / 10000) * 10000), W / 2 + 60 + shake(t, t35 + 0.4, 8), 470, pop(t, tA5 + 0.2), 130, t > t35 + 0.3 ? C.red : '#171717', PAL.cream, -0.02);
  label(ctx, 'POTENTIALLY UNAUTHORIZED ACCOUNTS', W / 2 + 60, 650, pop(t, t35 + 0.3), { size: 42, col: C.yellow, rot: 0.02 });
  ST.grade(ctx, 'office', 0.24);
});

// F1 (s06 "The regulator's director said it plainly:"): the director at the press podium, camera flashes
const tDir = at('s06', 'director'), tPlain = at('s06', 'plainly'), tEmp6 = at('s06', 'employees'), tSecret = at('s06', 'secretly'), tUnauth = at('s06', 'unauthorized'), tHit = at('s06', 'hit'), tRecv = at('s06', 'receive'),
  tAround = at('s06', 'around'), tFive = at('s06', 'five'), tFired = at('s06', 'fired'), tIn6 = at('s06', 'in'), tAgreed = at('s06', 'agreed'), tThree = at('s06', 'three', 1), tBillion = at('s06', 'billion'), tJustice = at('s06', 'justice'), tSEC = at('s06', 'sec'),
  tWhich = at('s06', 'which'), tFamous = at('s06', 'famous'), tInvestors = at('s06', 'investors'), tInfl = at('s06', 'inflated'), tUnused = at('s06', 'unused'), tUnneeded = at('s06', 'unneeded'), tUnauth2 = at('s06', 'unauthorized', 1), tAcc6 = at('s06', 'accounts', 1);
function press(w, t) { B.pressRoom(w, t); B.who(w, -60, 0, 1.1, 1, 'director', { face: FACE('squint', [1, 0], t), armN: { hand: [160, -340], grip: 'open' }, lean: 0.03 }); w.save(); w.translate(170, 0); B.podium(w, 'REGULATOR'); w.restore(); }
shot('F1 director', Z.s06 - 0.12, tEmp6 - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 40, -640, 0.8], [2.7, 60, -650, 0.88]], w => press(w, t));
  for (const k of [0.3, 1.1, 1.9]) flash(ctx, t, Z.s06 + k);
  label(ctx, 'THE REGULATOR\'S DIRECTOR', 520, 190, pop(t, tDir - 0.05), { size: 52, col: B.NAVY, fg: PAL.cream, rot: -0.03 });
  label(ctx, 'SAID IT PLAINLY', 1400, 330, pop(t, tPlain - 0.05), { size: 52, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'office', 0.22);
});
// F2 (s06 the quote): the director small on the left; the typed quote card
shot('F2 quote', tEmp6 - 0.12, tAround - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 620, -640, 0.8], [6.4, 600, -650, 0.84]], w => press(w, t));
  ctx.save(); ctx.translate(1180, 440); const z = 1 + (t - tEmp6) * 0.008; ctx.scale(z, z);
  B.quoteCard(ctx, 'THE REGULATOR\'S DIRECTOR, 2016', [
    ['EMPLOYEES “SECRETLY OPENED', seg(t, tEmp6 - 0.1, tSecret + 0.8), t > tSecret],
    ['UNAUTHORIZED ACCOUNTS', seg(t, tUnauth - 0.1, tUnauth + 0.8), false],
    ['TO HIT SALES TARGETS', seg(t, tHit - 0.1, tHit + 0.7), t > tHit + 0.2],
    ['AND RECEIVE BONUSES.”', seg(t, tRecv - 0.1, tRecv + 0.7), t > tRecv + 0.2]], { w: 1000, h: 600 });
  ctx.restore();
  ST.grade(ctx, 'office', 0.22);
});
// F3 (s06 "Around five thousand three hundred employees were fired."): staff walk out of the branch with boxes
function boxCarrier(w, x, s, facing, name, t, ph) {
  const wk = R.walk(t * 5 + ph); B.who(w, x, 0, s, facing, name, { ...wk, face: FACE('worried', [1, 0.3], t, ph), armN: { hand: [120, -250], grip: 'hold', item: g => { g.save(); g.translate(-40, 90); B.deskBox(g, 0.85); g.restore(); } }, armF: { hand: [100, -250], grip: 'hold' } }, { tie: false });
}
shot('F3 fired', tAround - 0.12, tIn6 - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, -100, -740, 0.6], [3.8, 0, -760, 0.64]], w => { B.bankFront(w, t, { lampX: 1250 });
    const d = (t - tAround) * 150;
    boxCarrier(w, -200 - d, 1.0, -1, 'clerkA', t, 0); boxCarrier(w, 300 - d, 1.0, -1, 'clerkD', t, 2); boxCarrier(w, 820 - d, 1.0, -1, 'clerkC', t, 4); boxCarrier(w, -800 - d, 1.0, -1, 'clerkB', t, 1); });
  plate(ctx, '≈ 5,300', 700, 210, pop(t, tFive - 0.08, 0.35), 120, '#171717', PAL.cream, -0.02);
  label(ctx, 'EMPLOYEES', 1170, 215, pop(t, at('s06', 'employees', 1) - 0.05), { size: 52, col: C.yellow });
  stampAt(ctx, 'FIRED', 1530, 340, 96, seg(t, tFired - 0.1, tFired + 0.25), C.red, 0.1);
  ST.grade(ctx, 'day', 0.26);
});
// F4 (s06 "In 2020, the bank agreed to pay three billion dollars to settle with the Justice Department and the SEC"): 2020, the settlement, $3,000,000,000
shot('F4 settlement', tIn6 - 0.12, tThree - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#E1D9C6');
  const u = pop(t, tIn6 - 0.05, 0.35); if (u > 0) { ctx.save(); ctx.translate(520, 470); ctx.rotate(-0.05); ctx.scale(u, u); ST.calCard(ctx, 'FEB', '2020'); ctx.restore(); }
  const v = seg(t, at('s06', 'the', 1) - 0.2, at('s06', 'the', 1) + 0.2); if (v > 0) { ctx.save(); ctx.translate(lerp(1900, 1250, E.out(v)), 480); ctx.scale(0.95, 0.95); B.settlement(ctx, seg(t, tAgreed, tAgreed + 0.9)); ctx.restore(); }
  label(ctx, 'THE BANK AGREED TO PAY', 1250, 140, pop(t, tAgreed - 0.05), { size: 48, rot: 0.02 });
  ST.grade(ctx, 'day', 0.2);
});
function moneyPile(ctx, n, t) { for (let i = 0; i < n; i++) { const c = i % 9, r = Math.floor(i / 9); ctx.save(); ctx.translate((c - 4) * 190 + (r % 2) * 60, -r * 40); ctx.rotate((hash(i) - 0.5) * 0.12); rr(ctx, -110, -40, 220, 44, 6); R.fillStroke(ctx, '#CFE9D4', 4); ctx.fillStyle = '#9CCBA8'; ctx.fillRect(-30, -40, 22, 44); ctx.restore(); } }
shot('F4b 3B', tThree - 0.12, tWhich - 0.12, (ctx, t, lt) => {
  paperBg(ctx, '#E1D9C6');
  ctx.save(); ctx.translate(W / 2, 880); moneyPile(ctx, Math.floor(lerp(9, 60, E.out(seg(t, tThree, tBillion + 1.0)))), t); ctx.restore();
  const u = pop(t, tThree - 0.08, 0.4); if (u > 0) { ctx.save(); ctx.translate(W / 2 + shake(t, tBillion + 0.2, 10), 300); ctx.rotate(-0.025); ctx.scale(u, u); RK.bigPlate(ctx, '$3,000,000,000', 150, C.red, PAL.cream); ctx.restore(); }
  label(ctx, 'TO SETTLE', W / 2, 470, pop(t, at('s06', 'settle') - 0.05), { size: 46 });
  label(ctx, 'JUSTICE DEPARTMENT', 640, 600, pop(t, tJustice - 0.05), { size: 52, col: B.NAVY, fg: PAL.cream, rot: -0.03 });
  label(ctx, 'SEC', 1320, 600, pop(t, tSEC - 0.05), { size: 60, col: B.NAVY, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'day', 0.2);
});
// F5 (s06 "which said the famous number investors watched had been inflated by unused, unneeded or unauthorized accounts."): the chart puffs up, gets tagged, crumbles
shot('F5 crumble', tWhich - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 60, -424, 0.85], [6.6, 90, -430, 0.88]], w => { boardroom(w, t);
    w.save(); w.translate(380, -620); w.scale(0.8, 0.8); B.chartBoard(w, t, { goal: 1, infl: seg(t, tInfl - 0.1, tInfl + 0.4) * (1 - seg(t, tAcc6, tAcc6 + 0.3)), crumble: seg(t, tAcc6 - 0.1, tAcc6 + 0.9),
      tags: [['UNUSED', seg(t, tUnused - 0.1, tUnused + 0.3)], ['UNNEEDED', seg(t, tUnneeded - 0.1, tUnneeded + 0.3)], ['UNAUTHORIZED', seg(t, tUnauth2 - 0.1, tUnauth2 + 0.3)]] }); w.restore();
    const sh = t > tAcc6 + 0.1;
    B.who(w, -480, 0, 1.0, 1, 'investorA', { face: FACE(sh ? 'shocked' : 'neutral', [1, -0.4], t), headTilt: sh ? -0.05 : 0 });
    B.who(w, -880, 0, 0.95, 1, 'investorB', { face: FACE(sh ? 'shocked' : 'smile', [1, -0.4], t, 1) }, { tie: false }); });
  label(ctx, 'THE FAMOUS NUMBER', 470, 160, pop(t, tFamous - 0.05), { size: 52, col: C.yellow, rot: -0.03 });
  label(ctx, 'INVESTORS WATCHED', 470, 262, pop(t, tInvestors - 0.05), { size: 46, rot: 0.02 });
  stampAt(ctx, 'INFLATED', 1250, 720, 70, seg(t, tInfl - 0.05, tInfl + 0.25), C.red, 0.06);
  ST.grade(ctx, 'office', 0.24);
});

// G1 (s07 "The bank wanted loyal customers. It paid for accounts. So it got accounts."): the branch after hours, cards rain; the two plates
const tWanted = at('s07', 'wanted'), tPaid7 = at('s07', 'paid'), tGot = at('s07', 'got');
shot('G1 wanted', Z.s07 - 0.12, T + 0.01, (ctx, t, lt) => {
  scene(ctx, lt, [[0, 0, -640, 0.72], [4.6, 0, -660, 0.78]], w => { B.branch(w, t, { night: true, posterX: -1300, clockX: 1300 });
    B.clerkDesk(w, -620, { papers: 8, glow: 1.4, mx: -60 }); B.clerkDesk(w, 700, { papers: 6, glow: 1.4, mx: -60 });
    w.save(); w.translate(40, 0); B.fileStacks(w, 0.5 + 0.5 * seg(t, tGot, tGot + 1), { cols: 5, dx: 150 }); w.restore(); });
  // cards rain from 'got'
  for (let i = 0; i < 26; i++) { const t0 = tGot - 0.1 + hash(i) * 0.9, u = (t - t0) / 1.4; if (u <= 0) continue; const y = lerp(-120, 980, Math.min(1, u)), x = 120 + hash(i + 5) * 1680;
    ctx.save(); ctx.translate(x + Math.sin(u * 6 + i) * 40, y); ctx.rotate(Math.sin(u * 4 + i) * 0.6); B.acctCard(ctx, ['CHECKING', 'SAVINGS', 'CREDIT CARD'][i % 3], { s: 0.4, elev: 0.6 }); ctx.restore(); }
  const a = pop(t, tWanted - 0.08), b = pop(t, tPaid7 - 0.08);
  if (a > 0) { ctx.save(); ctx.translate(W / 2, 260); ctx.rotate(-0.02); ctx.scale(a, a); CL.cutout(ctx, () => rr(ctx, -560, -80, 1120, 150, 16), PAL.cream, { elev: 1.6 }); fitTxt(ctx, 'WANTED: LOYAL CUSTOMERS', 0, 30, 80, PAL.green, 1060); ctx.restore(); }
  if (b > 0) { ctx.save(); ctx.translate(W / 2 + 30, 450); ctx.rotate(0.02); ctx.scale(b, b); CL.cutout(ctx, () => rr(ctx, -500, -80, 1000, 150, 16), C.red, { elev: 1.6 }); fitTxt(ctx, 'PAID FOR: ACCOUNTS', 0, 30, 84, PAL.cream, 940); ctx.restore(); }
  if (t > tGot - 0.1) label(ctx, 'SO IT GOT ACCOUNTS.', W / 2, 640, pop(t, tGot - 0.08), { size: 58, col: '#171717', fg: C.yellow, rot: -0.02 });
  ST.grade(ctx, 'dark', 0.3);
});

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
function overlays(ctx, t) { ST.stampLabel(ctx); }
const REPL = [[/185 million dollars/, '$185 million'], [/about two million/, 'about 2 million'], [/five thousand three hundred/, '5,300'], [/three billion dollars/, '$3 billion']];
const KEEP = [['185', 'million', 'dollars.'], ['five', 'thousand', 'three', 'hundred', 'employees'], ['three', 'billion', 'dollars']];
function subs() {
  const G = [];
  for (const L of LINES) { const ws = V.words(L.id); let cur = [];
    const len = a => a.map(x => x.w).join(' ').length;
    ws.forEach((w, i) => { cur.push(w); const nx = ws[i + 1]; if (!nx) return;
      const punct = /[,.:;!?"”—]$/.test(w.w), L1 = len(cur);
      const rest = ws.slice(i + 1).map(x => x.w).join(' ').length; if (rest < 12 && L1 + 1 + rest <= 72) return; if ((punct && L1 >= 14) || L1 + 1 + nx.w.length > 62) { G.push({ id: L.id, words: cur }); cur = []; } });
    if (cur.length) G.push({ id: L.id, words: cur }); }
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, T);
    let s = g.words.map(x => x.w).join(' ').replace(/ —/g, ' —'); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['eight', 'great', 'bonuses', 'fees', '$185', '35', '5300', 'fired', '$3', 'loyal'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['whoosh', 0.0, 0.8], ['pop', 0.05, 0.6], ['stamp', 0.4, 0.8]];
  const cut = t => c.push(['cut', t, 0.3]);
  cut(Z.s01 - 0.12); c.push(['pop', Z.s01, 0.5], ['squeak', Z.s01 + 0.2, 0.4], ['pop', tVac - 0.08, 0.5], ['pop', tPud - 0.08, 0.5], ['tag', tFunny - 0.05, 0.5]);
  cut(tThis - 0.12); c.push(['hum', tThis, 0.6], ['thump', at('s01', 'isn'), 0.6]);
  cut(Z.s02 - 0.12); c.push(['steps', Z.s02, 0.4], ['pop', Z.s02 + 0.1, 0.4], ['pop', tBiggest - 0.05, 0.5]);
  cut(tTold - 0.12); c.push(['pop', tWatch - 0.05, 0.5]); for (let i = 0; i < 6; i++) c.push(['tick', tNumber - 0.3 + i * 0.15, 0.5]);
  cut(tHow - 0.12); for (let i = 0; i < 6; i++) c.push(['tick', tProducts - 0.2 + i * 0.2, 0.5]); for (let i = 0; i < 5; i++) c.push(['paper', tEach - 0.1 + i * 0.24, 0.5]); c.push(['pop', at('s02', 'customer') - 0.05, 0.4]);
  cut(tThe2 - 0.12); c.push(['pop', tThe2, 0.4], ['rise', tGoal - 0.1, 0.4], ['stamp', tEight, 0.7], ['tag', tPer - 0.05, 0.4]);
  cut(tSen - 0.12); c.push(['pop', tSen - 0.05, 0.4], ['thump', tEight2, 0.6], ['shutter', tEight2 + 0.1, 0.4]);
  cut(Z.s03 - 0.12); c.push(['pop', Z.s03 + 0.02, 0.4], ['tag', tDaily - 0.05, 0.4]);
  cut(tBonuses - 0.12); c.push(['whoosh', tBonuses - 0.1, 0.4], ['paper', tBonuses + 0.2, 0.6], ['kaching', tTied, 0.4]);
  cut(tSo3 - 0.12); c.push(['pop', tSo3 + 0.05, 0.4], ['tag', tCheapest - 0.05, 0.5]); for (let i = 0; i < 8; i++) c.push(['tick', tNum3 - 0.1 + i * 0.1, 0.4]); c.push(['ding', tUp, 0.5]);
  cut(Z.s04 - 0.12); for (let i = 0; i < 3; i++) c.push(['type', Z.s04 + 0.2 + i * 0.5, 0.6], ['paper', Z.s04 + 0.3 + i * 0.5, 0.4]); c.push(['boop', tNever - 0.1, 0.4]);
  cut(tChecking - 0.12); for (const t0 of [tChecking, tSavings, tCredit]) { c.push(['print', t0 - 0.1, 0.5]); for (let i = 0; i < 6; i++) c.push(['paper', t0 + i * 0.16, 0.35]); }
  cut(tSometimes - 0.12); c.push(['paper', tSometimes, 0.5], ['tag', tFees - 0.1, 0.6], ['boop', tFees + 0.1, 0.4], ['stamp', tPaid4, 0.7], ['clink', tPaid4 + 0.1, 0.6]);
  cut(Z.s05 - 0.12); c.push(['flip', Z.s05, 0.5], ['pop', tRegs - 0.05, 0.4], ['stamp', tFined + 0.05, 0.8]);
  cut(tWells - 0.12); c.push(['pop', tWells - 0.05, 0.4], ['stamp', t185 + 0.1, 1.0], ['tag', tMil5 - 0.05, 0.4]);
  cut(tBanks - 0.12); c.push(['pop', tBanks, 0.4]); for (let i = 0; i < 10; i++) c.push(['tick', tAbout5 + i * 0.1, 0.4]); c.push(['ding', tTwo + 0.5, 0.4], ['stamp', tAuth + 0.05, 0.8]);
  cut(tA5 - 0.12); c.push(['flip', tA5, 0.5], ['whoosh', tBigger - 0.3, 0.4], ['pop', tBigger - 0.05, 0.4]); for (let i = 0; i < 12; i++) c.push(['tick', tRaised + i * 0.12, 0.4]); c.push(['thump', t35 + 0.4, 0.6], ['pop', t35 + 0.3, 0.4]);
  cut(Z.s06 - 0.12); for (const k of [0.3, 1.1, 1.9]) c.push(['shutter', Z.s06 + k, 0.5]); c.push(['pop', tDir - 0.05, 0.4], ['pop', tPlain - 0.05, 0.4]);
  cut(tEmp6 - 0.12); for (const t0 of [tEmp6, tUnauth, tHit, tRecv]) for (let i = 0; i < 5; i++) c.push(['type', t0 + i * 0.12, 0.45]);
  cut(tAround - 0.12); c.push(['steps', tAround, 0.6], ['pop', tFive - 0.08, 0.5], ['stamp', tFired + 0.05, 0.9]);
  cut(tIn6 - 0.12); c.push(['flip', tIn6, 0.5], ['whoosh', at('s06', 'the', 1) - 0.2, 0.4], ['scratch', tAgreed, 0.8]);
  cut(tThree - 0.12); c.push(['stamp', tThree, 0.8], ['coins', tBillion, 0.6], ['pop', at('s06', 'settle') - 0.05, 0.4], ['pop', tJustice - 0.05, 0.4], ['pop', tSEC - 0.05, 0.4]);
  cut(tWhich - 0.12); c.push(['pop', tFamous - 0.05, 0.4], ['pop', tInvestors - 0.05, 0.4], ['rise', tInfl - 0.1, 0.5], ['stamp', tInfl + 0.05, 0.6], ['tag', tUnused - 0.1, 0.5], ['tag', tUnneeded - 0.1, 0.5], ['tag', tUnauth2 - 0.1, 0.5], ['fall', tAcc6, 0.7], ['thump', tAcc6 + 0.5, 0.6]);
  cut(Z.s07 - 0.12); c.push(['pop', tWanted - 0.08, 0.5], ['stamp', tPaid7, 0.8]); for (let i = 0; i < 10; i++) c.push(['paper', tGot + i * 0.12, 0.35]); c.push(['thump', tGot + 0.1, 0.5]);
  return c.filter(x => x[1] >= 0 && x[1] < T);
}
const MUSIC = { sections: [[0, 'dark'], [Z.s02, 'tension'], [Z.s05, 'dark'], [Z.s06, 'tension'], [Z.s07, 'soft']] };

// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(Z), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 480, th = 270, cols = Math.min(ts.length, 4), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1, { nosubs: a3 === 'nosubs' }); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n') + `\nT = ${T}`);
else if (mode === 'subs') console.log(SUBS.map(g => `${g.t0.toFixed(2)}-${g.t1.toFixed(2)} ${g.text}`).join('\n'));
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST: Z, SH };
