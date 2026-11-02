// Episode 19 "Hoover free flights" (How It's Run) — UK 1992: spend £100 on Hoover, get two free flights (Europe, then New York/Orlando);
// the cheapest qualifying vacuum cost £119, the tickets were worth far more; ~200,000 claims by March 1993; travel agents swamped; one customer
// went to Maytag's meeting in Iowa; charter planes, three bosses fired, ~$60m charges in 1993; Hoover Europe sold two years later.
// Twist: Hoover thought it gave away flights to sell vacuums — people bought vacuums to get the flights.
// Look: howitsrun_style/ (style reference lawnchair_ep17 / emu_ep12): full-body profile people in real places, flat sets, paper plates.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png [nosubs] | cues | srt out.srt | shots | carousel dir
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const ST = require('../howitsrun_style/style');
const P = require('../howitsrun_style/people');
const SE = require('../howitsrun_style/sets');
const S = require('./hoovkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { CUSTOMER, MANAGER, AGENT, vacBox, PHONE } = S.CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.3, s06: 0.3, s07: 0.35, s08: 0.25, s09: 0.2 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s09') + 0.15).toFixed(2);
T = +(tEnd + 2.2).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) { hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0); R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore(); }
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
function tube(w, x, top, h) { R.tube(w, [[x - 120, 0], [x - 60, top - 420]], 14, '#8A5A34', 4); R.tube(w, [[x + 120, 0], [x + 60, top - 420]], 14, '#8A5A34', 4); }   // poster easel legs
const boxArm = (flip = 1) => ({ hand: [120, -200], grip: 'hold', item: g => vacBox(g, 0.62, flip) });
// a customer walking with the vacuum box, at world (x, y), facing f, walk phase ph
function walker(ctx, x, y, s, L, t, ph, f = 1, face) { P.person(ctx, x, y, s, f, L, { ...R.walk(ph), armN: boxArm(f), armF: { hand: [100, -195], grip: 'hold' }, face: face || FACE('grin', [1, 0], t, ph) }); }

// ---------- overlays ----------
function overlays(ctx, t) {
  ST.headline2(ctx, 'BUY A VACUUM', 'GET 2 FREE FLIGHTS', 1 - seg(t, Z.s02 - 0.3, Z.s02 - 0.08), 420);
  if (t < Z.s02 - 0.1) label(ctx, 'UK · 1992', W / 2, 640, 1, { size: 40, col: '#171717', fg: C.yellow, rot: 0.02 });
  ST.stampLabel(ctx);
  if (t >= tEnd) { ST.questionCard(ctx, t, ['WOULD YOU HAVE'], 'BOUGHT THE VACUUM?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 560 }); }
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const AX = 150, AS = 0.62;   // the airliner at world x = AX, scale AS
// A1 (s01): the queue of customers with vacuum boxes climbing the air stairs; push in
const tAmerica = at('s01', 'america');
function boarding(ctx, t, lt, zoom) {
  const c = cam([[0, 0, -380, zoom[0]], [6, 60, -400, zoom[1]]], lt);
  layer(ctx, c, 1, w => {
    S.apron(w, t); S.airliner(w, AS, {}); w.save(); w.translate(AX, 0); w.restore();
    // the queue: 5 people; each climbs from the ground to the door, staggered
    for (let i = 0; i < 5; i++) { const u = ((t * 0.12 + i * 0.2) % 1), L = S.CROWD[i % 5];
      if (u < 0.45) { const x = lerp(-900, AX - 330 * AS - 40, u / 0.45); walker(w, x, 0, 0.62, L, t, t * 7 + i, 1); }
      else { const k = (u - 0.45) / 0.55, [x, y] = S.stairPt(0, AS, k); walker(w, x - 40, y + 10, 0.62, L, t, t * 6 + i, 1); } }
  });
}
shot('A1 boarding', 0, Z.s02 - 0.12, (ctx, t, lt) => {
  boarding(ctx, t, lt, [0.95, 1.08]);
  label(ctx, '→ AMERICA, FOR FREE', 540, 1330, pop(t, tAmerica - 0.1), { size: 56, col: C.yellow });
  ST.grade(ctx, 'day', 0.2);
}, { type: 'cut' });

// B1 (s02): the Hoover shop: the manager points at the offer poster; Europe, then New York and Orlando
const tSpend = at('s02', 'spend'), tFlights2 = at('s02', 'flights'), tThen = at('s02', 'then'), tNY = at('s02', 'new'), tOrl = at('s02', 'orlando');
shot('B1 offer', Z.s02 - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -160, -560, 0.9], [7, -60, -580, 0.95]], lt);
  layer(ctx, c, 1, w => {
    SE.sky(w, t, { clouds: 2 }); SE.ground(w, 'road'); SE.houses(w, -2200, 3); SE.shopFront(w, 520, 760, 'HOOVER', { awn: S.HRED, signCol: S.HRED });
    P.person(w, -600, 0, 1.0, 1, MANAGER, { face: FACE('smug', [1, -0.2], t), armN: { hand: [150, -380], grip: 'point' } }, { tie: C.red });
    tube(w, -120, -40, 140); w.save(); w.translate(-120, -540); w.scale(0.58, 0.58); S.poster(w, { sub: t > tNY - 0.1 ? 'NOW: NEW YORK · ORLANDO!' : 'GET 2 FREE FLIGHTS · EUROPE' }); w.restore();
  });
  label(ctx, 'SPEND £100', 540, 520, pop(t, tSpend - 0.05), { size: 70, col: C.yellow });
  label(ctx, '2 FREE RETURN FLIGHTS', 540, 640, pop(t, tFlights2 - 0.05), { size: 54 });
  label(ctx, 'NEW YORK', 300, 780, pop(t, tNY - 0.05), { size: 56, col: PAL.navy, fg: PAL.cream, rot: -0.05 });
  label(ctx, 'ORLANDO', 780, 780, pop(t, tOrl - 0.05), { size: 56, col: '#26A69A', fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'day', 0.2);
});
// C1 (s03): the balance: the £119 vacuum vs two tickets; it tips to the tickets on "LOT"
const t119 = at('s03', '119'), tTickets = at('s03', 'tickets'), tLot = at('s03', 'lot');
shot('C1 balance', Z.s03 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const tilt = lerp(-0.3, 0.95, E.back(seg(t, tLot - 0.1, tLot + 0.3), 1.6));
  ctx.save(); ctx.translate(540, 640); S.balance(ctx, t < tTickets ? -0.3 : tilt, g => { S.vacuum(g, 0.55); }, g => { if (t > tTickets - 0.2) { g.save(); g.translate(0, -70); S.tickets(g, 0.5, 1); g.restore(); } }); ctx.restore();
  label(ctx, '£119', 220, 1320, pop(t, t119 - 0.05), { size: 80, col: C.yellow });
  label(ctx, 'WORTH A LOT MORE', 760, 1320, pop(t, tLot - 0.05), { size: 50, col: C.red, fg: PAL.cream, rot: 0.04 });
  label(ctx, 'THE CHEAPEST VACUUM THAT QUALIFIED', 540, 470, pop(t, Z.s03), { size: 40 });
  ST.grade(ctx, 'day', 0.15);
});
// D1 (s04 "People did the math."): the customer outside the shop, box under the arm, grinning at the tickets
const tBy = at('s04', 'by'), t200 = at('s04', '200');
shot('D1 math', Z.s04 - 0.12, tBy - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 200, -520, 1.15], [2, 220, -520, 1.22]], lt);
  layer(ctx, c, 1, w => { SE.sky(w, t, { clouds: 2 }); SE.ground(w, 'road'); SE.shopFront(w, -200, 1100, 'HOOVER', { awn: S.HRED, signCol: S.HRED });
    P.person(w, 240, 0, 1.15, 1, CUSTOMER, { face: FACE('grin', [1, -0.4], t), armN: { hand: [140, -390], grip: 'pinch', item: g => { g.save(); g.translate(30, -40); S.tickets(g, 0.32, 1); g.restore(); } }, armF: boxArm(1) }); });
  label(ctx, '£119 → 2 FLIGHTS', 540, 520, pop(t, Z.s04 + 0.1), { size: 70, col: C.yellow });
  ST.grade(ctx, 'day', 0.2);
});
// D2 (s04 "By March 1993, about 200,000 had claimed flights."): claim envelopes pour onto a pile; the counter
shot('D2 claims', tBy - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -500, 0.9], [3, 0, -520, 0.96]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'tile' });
    for (let i = 0; i < 70; i++) { const tt = tBy - 0.55 + i * 0.03; if (t < tt) break; const f = clamp((t - tt) / 0.4), x = (hash(i) - 0.5) * 900 * (0.4 + i / 100), y = lerp(-1600, -20 - (i / 70) * 380 * (1 - Math.abs(x) / 700), E.in(f));
      w.save(); w.translate(x, y); S.envelope(w, 0.9, i); w.restore(); } });
  const u = pop(t, t200 - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(540 + shake(t, t200 + 0.2, 8), 520); ctx.scale(u, u); CL.cutout(ctx, () => rr(ctx, -360, -95, 720, 170, 20), C.red, { elev: 2 }); txt(ctx, '≈ 200,000', 0, 30, 110, PAL.cream); ctx.restore(); }
  label(ctx, 'CLAIMS BY MARCH 1993', 540, 680, pop(t, t200 + 0.2), { size: 48 });
  ST.grade(ctx, 'office', 0.2);
});
// E1 (s05 "Travel agents couldn't keep up."): the travel agent at her desk, phones ringing, envelopes piling up
const tOne = at('s05', 'one'), tIowa = at('s05', 'iowa'), tConf = at('s05', 'confront');
shot('E1 agency', Z.s05 - 0.12, tOne - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -520, 1.0], [2.3, 0, -540, 1.08]], lt);
  layer(ctx, c, 1, w => { S.agency(w, t);
    P.seated(w, -330, 0, 1.15, 1, AGENT, P.POSE.phone(FACE('worried', [1, 0.2], t), PHONE));
    SE.desk(w, 140, 560, -300, '#8A5A34');
    for (let i = 0; i < 3; i++) { w.save(); w.translate(-20 + i * 130, -300); S.deskPhone(w, (Math.floor(t * 3) + i) % 2, t); w.restore(); }
    for (let i = 0; i < 14; i++) { w.save(); w.translate(300 + (hash(i) - 0.5) * 120, -310 - i * 22); S.envelope(w, 0.55, i + 9); w.restore(); } });
  label(ctx, "COULDN'T KEEP UP", 540, 520, pop(t, at('s05', 'keep') - 0.05), { size: 64, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// E2 (s05 "One angry customer went all the way to Iowa to confront the owner, Maytag."): the shareholders' meeting; the customer stands up and points
shot('E2 iowa', tOne - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -640, 0.78], [4, 120, -600, 0.9]], lt);
  layer(ctx, c, 1, w => { S.meeting(w, t); w.save(); w.translate(0, -260); S.lectern(w); w.restore();
    for (let r = 0; r < 2; r++) for (let i = -5; i <= 5; i++) { const x = i * 190 + r * 90, y = 380 + r * 160; R.ell(w, x, y - 150, 60, 70); R.fillStroke(w, ['#5A3A22', '#2A1E16', '#8A8A88', '#D9B26A'][Math.abs(i + r) % 4], 5); rr(w, x - 80, y - 90, 160, 120, 30); R.fillStroke(w, ['#3E4F78', '#6A4024', '#4A4F57', '#7A3A3A'][Math.abs(i * 3 + r) % 4], 5); }
    P.person(w, 330, 400, 1.15, -1, CUSTOMER, { face: FACE('squint', [1, -0.5], t), armN: { hand: [160, -440], grip: 'point' }, lean: 0.06 }); });
  label(ctx, 'UK → IOWA, USA', 540, 880, pop(t, tIowa - 0.1), { size: 60, col: C.yellow });
  label(ctx, 'ONE ANGRY CUSTOMER', 540, 760, pop(t, tOne - 0.05), { size: 50 });
  ST.grade(ctx, 'office', 0.22);
});
// F1 (s06 "Maytag paid for charter planes,"): a row of charter planes on the apron
const tFired = at('s06', 'fired'), tAnd6 = at('s06', 'and'), t60 = at('s06', '60');
shot('F1 charter', Z.s06 - 0.12, tFired - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -300, -400, 0.82], [2, 150, -400, 0.85]], lt);
  layer(ctx, c, 1, w => { S.apron(w, t); for (let i = 0; i < 3; i++) { w.save(); w.translate(-1500 + i * 1300, 200 - i * 0); S.airliner(w, 0.55, { stairs: false, stripe: [PAL.navy, '#26A69A', C.red][i] }); w.restore(); } });
  label(ctx, 'CHARTER PLANES', 540, 520, pop(t, Z.s06 - 0.1), { size: 70, col: C.yellow });
  ST.grade(ctx, 'day', 0.2);
});
// F2 (s06 "fired three Hoover bosses..."): three office doors, the name plates struck out one by one; a boss walks out with his box
const DOORS = ['PRESIDENT · HOOVER EUROPE', 'VP MARKETING', 'MARKETING SERVICES'];
shot('F2 fired', tFired - 0.12, tAnd6 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -440, 0.86], [2, 40, -440, 0.9]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#E8E2D0', floor: 'tile' });
    DOORS.forEach((d, i) => { w.save(); w.translate(-460 + i * 460, 0); S.door(w, d, seg(t, tFired + i * 0.28, tFired + i * 0.28 + 0.25)); w.restore(); });
    const u = seg(t, tFired, tAnd6 + 0.2); P.person(w, lerp(-200, 520, u), 60, 1.0, 1, MANAGER, { ...R.walk(t * 6), face: FACE('tired', [1, 0.2], t), armN: { hand: [120, -230], grip: 'hold', item: g => S.officeBox(g, 0.7) }, armF: { hand: [100, -225], grip: 'hold' } }, { tie: C.red }); });
  label(ctx, '3 BOSSES FIRED', 540, 520, pop(t, at('s06', 'three') - 0.05), { size: 70, col: C.red, fg: PAL.cream });
  ST.grade(ctx, 'office', 0.2);
});
// F3 (s06 "and took about 60 million dollars in charges in 1993."): the 1993 report with the charges plate
shot('F3 charges', tAnd6 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#5E7A8C'); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 20; i++) ctx.fillRect(0, i * 100, W, 40);
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 930); ctx.scale(z * 1.05, z * 1.05);
  ST.report(ctx, 'MAYTAG · 1993', 'COST OF THE FREE FLIGHTS PROMOTION', [['RESCUE', '£20M', seg(t, tAnd6, tAnd6 + 0.3)], ['CHARGES', '$60M', seg(t, t60 - 0.1, t60 + 0.2)]], { note: '(pretax charges, 1993)' }); ctx.restore();
  ST.grade(ctx, 'office', 0.2);
});
// G1 (s07 "Two years later, it sold Hoover Europe."): the Hoover Europe building gets a SOLD sign
const tSold = at('s07', 'sold');
shot('G1 sold', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.82], [2.5, 0, -560, 0.88]], lt);
  layer(ctx, c, 1, w => { SE.sky(w, t, { clouds: 2 }); SE.ground(w, 'road'); S.building(w, seg(t, tSold - 0.1, tSold + 0.25)); });
  label(ctx, 'TWO YEARS LATER', 540, 520, pop(t, Z.s07), { size: 60, col: C.yellow });
  ST.grade(ctx, 'day', 0.2);
});
// H1 (s08): the poster: big vacuum, small plane; the manager presents it, smug
const tVac9 = at('s09', 'vacuums'), tGet9 = at('s09', 'get');
function posterShot(ctx, t, lt, flip, face, L, acc, f = 1) {
  const c = cam([[0, 0, -600, 0.95], [3, 0, -600, 1.0]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood' });
    w.save(); w.translate(180, -560); w.scale(0.85, 0.85); S.poster(w, { flip, title: 'HOOVER', sub: flip > 0.5 ? 'FREE FLIGHTS! (+ A VACUUM)' : 'VACUUMS! (+ FREE FLIGHTS)' }); w.restore();
    P.person(w, -380, 0, 1.15, 1, L, face, acc); });
}
shot('H1 thought', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  posterShot(ctx, t, lt, 0, { face: FACE('smug', [1, -0.3], t), armN: { hand: [150, -380], grip: 'point' } }, MANAGER, { tie: C.red });
  label(ctx, 'THE PLAN', 540, 520, pop(t, Z.s08), { size: 64 });
  ST.grade(ctx, 'office', 0.2);
});
// H2 (s09): the poster flips (the plane grows, the vacuum shrinks); the customer looks at us, box under the arm
shot('H2 flip', Z.s09 - 0.12, tEnd, (ctx, t, lt) => {
  posterShot(ctx, t, lt, seg(t, tVac9 - 0.1, tGet9 + 0.2), { face: FACE(t > tGet9 ? 'smug' : 'skeptical', [-0.2, 0], t), armN: boxArm(1), armF: { hand: [90, -200], grip: 'hold' }, headTilt: 0.05 }, CUSTOMER, {});
  label(ctx, 'WHAT PEOPLE ACTUALLY BOUGHT', 540, 520, pop(t, tGet9 - 0.05), { size: 50, col: C.yellow });
  ST.grade(ctx, 'office', 0.2);
});
// K (end card, 2 s+): the boarding queue again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { boarding(ctx, t, lt + 6, [1.08, 1.1]); ST.grade(ctx, 'day', 0.2); }, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [6, 5, 7], s02: [5, 7, 7], s03: [8, 7], s04: [4, 8], s05: [5, 9, 5], s06: [5, 4, 10], s07: [7], s08: [5, 5], s09: [5, 4] };
const REPL = [[/100 pounds/, '£100'], [/119 pounds/, '£119'], [/60 million dollars/, '$60 million']];
function subs() {
  const G = [];
  Object.keys(Z).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : Math.min(e0, tEnd);
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
function frame(ctx, t, o = {}) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); overlays(ctx, t); ctx.restore();
  ST.paper(ctx);
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['free.', '£100,', 'Orlando.', '£119', 'LOT', '200,000', 'Iowa', 'fired', '$60', 'million', 'sold', 'flights.', 'vacuums...'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['jet', 0.0, 2.2], ['slam', 0.0, 2.0], ['pop', 0.1, 1.2], ['pop', tAmerica - 0.1, 0.5]];
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', tSpend - 0.05, 0.5], ['pop', tFlights2 - 0.05, 0.4], ['flip', tNY - 0.15, 0.6], ['pop', tNY - 0.05, 0.45], ['pop', tOrl - 0.05, 0.45]);
  c.push(['cut', Z.s03 - 0.12, 0.35], ['tag', t119 - 0.05, 0.5], ['whoosh', tTickets - 0.2, 0.4], ['thump', tLot + 0.1, 0.7], ['clink', tLot + 0.15, 0.5]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['kaching', Z.s04 + 0.2, 0.5], ['cut', tBy - 0.12, 0.35]); for (let i = 0; i < 14; i++) c.push(['paper', tBy + i * 0.15, 0.4]); c.push(['stamp', t200 + 0.15, 0.8]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['ring', Z.s05, 0.5], ['ring', Z.s05 + 0.9, 0.4], ['cut', tOne - 0.12, 0.35], ['applause', tOne, 0.25], ['jet', tIowa - 0.2, 0.4], ['pop', tConf, 0.4]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['jet', Z.s06, 0.5], ['cut', tFired - 0.12, 0.35]); for (let i = 0; i < 3; i++) c.push(['scratch', tFired + i * 0.28, 0.5]); c.push(['steps', tFired + 0.2, 0.5]);
  c.push(['cut', tAnd6 - 0.12, 0.35], ['stamp', tAnd6 + 0.1, 0.6], ['stamp', t60 + 0.1, 0.9]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['slam', tSold + 0.1, 0.6], ['cut', Z.s08 - 0.12, 0.35], ['pop', Z.s08, 0.4]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['whoosh', tVac9 - 0.1, 0.5], ['sparkle', tGet9, 0.5], ['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, deal: Z.s02, math: Z.s03, chaos: Z.s05, fallout: Z.s06, twist: Z.s08, hit: tEnd, end: T };

// ---------- CLI ----------
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(Z), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1, { nosubs: a3 === 'nosubs' }); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'carousel') {
  const KEY = [['01_hook', 0.7], ['02_offer', tOrl + 0.4], ['03_119_vs_tickets', tLot + 0.6], ['04_200000_claims', t200 + 0.6], ['05_60_million', t60 + 0.5], ['06_question', tEnd + 1.0]];
  fs.mkdirSync(a1, { recursive: true }); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  for (const [n, t] of KEY) { frame(ctx, t, { nosubs: true }); fs.writeFileSync(`${a1}/${n}.png`, cv.toBuffer('image/png')); } console.log('carousel ok', KEY.map(k => k[1].toFixed(2)).join(' '));
}
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n') + `\nT = ${T}`);
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST: Z, SH };
