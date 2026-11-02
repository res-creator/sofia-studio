// Episode 26 "Paid per rat tail" (How It's Run) — Hanoi, 1902: the French built new sewers under their quarter, rats used them and climbed
// out of toilets while plague spread across Asia; the city paid a bounty (reportedly 1 cent) per rat TAIL; at the peak 20,000+ tails a day;
// then rats without tails: people cut the tail, let the rat go to breed more tails; inspectors found rat farms outside the city; the hunt
// failed and the plague came anyway. Twist: "Not hunters. Money." Pay for tails, and you get tails, not fewer rats.
// Look: howitsrun_style/ (style reference lawnchair_ep17 / emu_ep12): full-body profile people in real places, flat sets, paper plates.
// Respectful depiction: Vietnamese townspeople in normal proportions and period clothes; cartoon rats, never gory.
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
const SE = require('../howitsrun_style/sets');
const S = require('./ratkit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const CS = S.CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.3, s02: 0.3, s03: 0.3, s04: 0.3, s05: 0.3, s06: 0.3, s07: 0.3, s08: 0.3, s09: 0.3, s10: 0 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('s10') + 0.15).toFixed(2);
T = +(tEnd + 2.2).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0) => R.expr(n, { look, blink: blink(t, 3.2, o) });
const coinItem = (t, r = 34) => g => { g.save(); g.translate(18, -20); S.coin(g, r, '1¢', { spin: t * 3 }); g.restore(); };
const tailItem = (t, len = 170) => g => { g.save(); g.translate(14, -6); S.tail(g, len, t * 4, 13); g.restore(); };
function glowAt(ctx, x, y, r, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,220,140,1)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
function heart(ctx, x, y, s, u) { if (u <= 0) return; ctx.save(); ctx.translate(x, y - u * 40); ctx.scale(s * E.back(clamp(u * 3), 2), s * E.back(clamp(u * 3), 2)); ctx.globalAlpha *= 1 - clamp((u - 0.7) / 0.3);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -30, -60, 0, -26); ctx.bezierCurveTo(30, -60, 60, -10, 0, 30); ctx.closePath(); R.fillStroke(ctx, C.red, 4); ctx.restore(); }

// ---------- the bounty scene (frame 0, its punch-in and the end card): official behind the table, the hunter hands over a tail ----------
function exchange(ctx, t, lt, keys, o = {}) {
  const c = cam(keys, lt);
  layer(ctx, c, 1, w => {
    S.street(w, t, { n: 12, trees: false }); S.tree(w, -1250, 1.05); S.tree(w, 1150, 1.0);
    CS.cast(w, -820, 0, 0.95, 1, 'woman', { ...R.walk(t * 4), face: FACE('smile', [1, 0], t, 1), armN: { hand: [110, -230], grip: 'hold', item: g => S.basket(g, 0.55, 8, 3) }, armF: { hand: [90, -225], grip: 'hold' } });
    CS.cast(w, 300, 0, 1.15, -1, 'official', { face: FACE(o.offFace || 'smile', [1, -0.1], t, 0.7), lean: 0.05, armN: { hand: [150, -330], grip: 'pinch', item: coinItem(t) } });
    S.bountyTable(w, 40);
    w.save(); w.translate(560, 0); w.scale(-1, 1); S.rat(w, { s: 0.85, mood: 'shock', look: [0.6, -0.4], up: 0.25 }); w.restore();
    CS.cast(w, -300, 0, 1.15, 1, 'hunter', { face: FACE(o.huntFace || 'grin', [1, -0.2], t), armN: { hand: [150, -400], grip: 'pinch', item: tailItem(t) }, lean: 0.04 });
  });
  return c;
}

// ---------- overlays ----------
const tJust = at('s01', 'just');
function overlays(ctx, t) {
  const ha = 1 - seg(t, tJust - 0.3, tJust - 0.08);
  if (ha > 0) { ctx.save(); const u = 0.85 + 0.15 * E.back(seg(t, 0, 0.3), 2); ctx.translate(W / 2, 470); ctx.scale(u, u); ctx.translate(-W / 2, -470); ST.headline2(ctx, 'PAID PER', 'RAT TAIL', ha, 400); ctx.restore();
    label(ctx, 'HANOI · 1902', W / 2, 660, pop(t, 0.12) * ha, { size: 40, col: '#171717', fg: C.yellow, rot: 0.02 }); }
  ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['WHAT OTHER REWARDS'], 'BACKFIRED LIKE THIS?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { arrow: true, y: 530 });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// A1 (s01 "In 1902, a city started paying people for rat tails."): frame 0, the exchange at the bounty table; push in
shot('A1 exchange', 0, tJust - 0.12, (ctx, t, lt) => {
  exchange(ctx, t, lt, [[0, 0, -540, 0.84], [4, 0, -560, 0.94]]);
  ST.grade(ctx, 'golden', 0.2);
}, { type: 'cut' });
// A2 (s01 "Just the tails."): punch-in on the hands: the tail for the coin
shot('A2 just tails', tJust - 0.12, Z.s02 - 0.12, (ctx, t, lt) => {
  exchange(ctx, t, lt + 4, [[0, -40, -700, 1.9], [1.2, -40, -710, 2.05]]);
  label(ctx, 'JUST THE TAILS', 540, 520, pop(t, tJust - 0.05), { size: 72, col: C.yellow });
  ST.grade(ctx, 'golden', 0.22);
});
// B1 (s02 "Hanoi, French colonial Vietnam."): the old postcard
const tFr = at('s02', 'french'), tThe2 = at('s02', 'the'), tShiny = at('s02', 'shiny'), tSewers = at('s02', 'sewers'), tQuarter = at('s02', 'quarter');
shot('B1 postcard', Z.s02 - 0.12, tThe2 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#E9DFC8'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const z = 1.05 + lt * 0.025; ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); S.postcard(ctx, t, { caption: 'HANOI' }); ctx.restore();
  label(ctx, 'HANOI', 540, 470, pop(t, Z.s02), { size: 80, col: C.yellow });
  label(ctx, 'FRENCH COLONIAL VIETNAM', 540, 1350, pop(t, tFr - 0.05), { size: 48, rot: 0.02 });
  ST.grade(ctx, 'golden', 0.2);
});
// B2 (s02 "The French built shiny new sewers under their quarter."): street section, villas above, the camera tilts down to the new pipes
const VX = [-480, 420];
function section(w, t, shine, inside) { SE.sky(w, t, { warm: true, clouds: 2, hills: false }); S.tree(w, -1100, 1); VX.forEach(x => S.villa(w, x, 0.85)); S.tree(w, 1250, 0.9); S.sewers(w, t, VX, { shine, inside }); }
shot('B2 sewers', tThe2 - 0.12, Z.s03 - 0.12, (ctx, t, lt) => {
  const k = E.inOut(seg(t, tSewers - 0.5, tSewers + 0.4)); const c = { ...cam([[0, 0, -420, 0.72], [4, 0, -440, 0.74]], lt) }; c.y = lerp(-420, 120, k);
  layer(ctx, c, 1, w => section(w, t, seg(t, tShiny - 0.1, tShiny + 0.4)));
  label(ctx, 'FRENCH QUARTER', 540, 470, pop(t, at('s02', 'french', 1) - 0.05), { size: 56 });
  label(ctx, 'NEW SEWERS', 540, 625, pop(t, tSewers - 0.05), { size: 74, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'golden', 0.2);
});
// C1 (s03 "Rats loved them."): inside the new pipe: rats running, hearts pop
const tThey = at('s03', 'they'), tToilets = at('s03', 'toilets'), tAnd3 = at('s03', 'and'), tPlague = at('s03', 'plague'), tAsia = at('s03', 'asia');
shot('C1 rats in pipe', Z.s03 - 0.12, tThey - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -100, 180, 1.25], [1.6, 40, 200, 1.35]], lt);
  layer(ctx, c, 1, w => section(w, t, 0.5, g => { for (let i = 0; i < 6; i++) { const x = ((t * 420 + i * 330) % 2000) - 1000; g.save(); g.translate(x, 392); S.rat(g, { s: 0.62, phase: t * 14 + i, run: 1, mood: 'happy' }); g.restore(); } }));
  for (let i = 0; i < 4; i++) heart(ctx, 260 + i * 190, 1000 - (i % 2) * 40, 0.9, (t - (Z.s03 + 0.1 + i * 0.22)) / 1.0);
  label(ctx, 'RATS LOVED THEM', 540, 520, pop(t, Z.s03 + 0.05), { size: 66, col: C.yellow });
  ST.grade(ctx, 'office', 0.24);
});
// C2 (s03 "They climbed out of toilets,"): the French bathroom: a rat pops out of the toilet bowl
shot('C2 toilet', tThey - 0.12, tAnd3 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -600, 1.0], [1.4, 0, -580, 1.08]], lt);
  layer(ctx, c, 1, w => { S.bathroom(w, t); S.toilet(w, seg(t, tToilets - 0.35, tToilets + 0.1), t); });
  label(ctx, 'OUT OF THE TOILETS', 540, 470, pop(t, tToilets - 0.05), { size: 60, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// C3 (s03 "and plague was spreading across Asia."): the PLAGUE notice slaps onto a wall
shot('C3 plague', tAnd3 - 0.12, Z.s04 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#CDBB98'); ctx.fillStyle = 'rgba(90,60,30,0.10)'; for (let y = 0; y < H; y += 60) for (let x = (y / 60) % 2 * 60; x < W; x += 120) ctx.fillRect(x, y, 116, 56);
  const u = pop(t, tPlague - 0.15, 0.3, 1.6); ctx.save(); ctx.translate(540 + shake(t, tPlague + 0.1, 10), 880); const z = (1.25 + lt * 0.03) * u; ctx.scale(z, z); S.plagueNotice(ctx); ctx.restore();
  ST.grade(ctx, 'office', 0.28);
});
// D1 (s04 "So the city made an offer: reportedly one cent for every rat tail."): the bounty notice; BOUNTY stamp; REPORTEDLY tag
const tOffer = at('s04', 'offer'), tRep = at('s04', 'reportedly'), tCent = at('s04', 'cent'), tEvery = at('s04', 'every');
shot('D1 bounty', Z.s04 - 0.12, Z.s05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -700, 1.0], [5, 0, -720, 1.06]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 12, x0: -2400, trees: false }); });
  ctx.save(); ctx.translate(540, 870); const z = 1.0 * pop(t, Z.s04 - 0.05, 0.3, 1.6); ctx.scale(z, z); S.bountyNotice(ctx); ctx.restore();
  ctx.save(); ctx.translate(560, 1340); ST.stampWord(ctx, 'BOUNTY', 110, seg(t, tOffer - 0.05, tOffer + 0.3), C.red, -0.14); ctx.restore();
  label(ctx, 'REPORTEDLY', 740, 440, pop(t, tRep - 0.05), { size: 40, col: '#171717', fg: C.yellow, rot: 0.05 });
  label(ctx, '1¢ = 1 TAIL', 360, 440, pop(t, tCent - 0.05), { size: 64, col: C.yellow, rot: -0.04 });
  ST.grade(ctx, 'golden', 0.2);
});
// E1 (s05 "It worked."): a queue with baskets of tails at the table
const tOver = at('s05', 'over'), tTwenty = at('s05', 'twenty'), tSingle = at('s05', 'single'), tPeak = at('s05', 'peak');
function queue(w, t, n = 5) {
  CS.cast(w, 560, 0, 1.05, -1, 'official', { face: FACE('surprised', [1, 0], t), armN: { hand: [150, -330], grip: 'pinch', item: coinItem(t, 30) } });
  S.bountyTable(w, 340, { sign: 'BOUNTY' });
  for (let i = 0; i < n; i++) { const [who, o] = CS.CROWD[i % CS.CROWD.length], x = -40 - i * 330 + Math.sin(t * 2 + i) * 8;
    CS.cast(w, x, 0, 1.0, 1, who, { face: FACE(i % 2 ? 'smile' : 'grin', [1, 0], t, i), armN: { hand: [120, -220], grip: 'hold', item: g => S.basket(g, 0.55, 9, i) }, armF: { hand: [96, -215], grip: 'hold' } }, o); }
}
shot('E1 queue', Z.s05 - 0.12, tOver - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -40, -560, 0.72], [2, 40, -560, 0.76]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 14, x0: -3000 }); queue(w, t); });
  label(ctx, 'IT WORKED', 540, 500, pop(t, Z.s05 + 0.05), { size: 74, col: PAL.green, fg: PAL.cream });
  label(ctx, 'AT THE PEAK…', 540, 640, pop(t, tPeak - 0.05), { size: 50 });
  ST.grade(ctx, 'golden', 0.2);
});
// E2 (s05 "over twenty thousand tails came in a single day."): the heap of tails grows behind the table; the counter
shot('E2 20000', tOver - 0.12, Z.s06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 300, -560, 0.8], [3, 360, -580, 0.86]], lt);
  const n = Math.floor(lerp(20, 170, E.out(seg(t, tOver - 0.2, tSingle + 0.3))));
  layer(ctx, c, 1, w => { S.street(w, t, { n: 12 }); w.save(); w.translate(160, -10); S.tailHeap(w, n, 760, 380); w.restore();
    CS.cast(w, 820, 0, 1.05, -1, 'official', { face: FACE('shocked', [-1, -0.3], t), headTilt: -0.05 });
    for (let i = 0; i < 2; i++) { w.save(); w.translate(-500 + i * 220, 0); S.basket(w, 0.9, 12, i + 4); w.restore(); } });
  const u = pop(t, tTwenty - 0.1, 0.35); if (u > 0) { ctx.save(); ctx.translate(540 + shake(t, tTwenty + 0.2, 8), 560); ctx.scale(u, u); S.bigPlate(ctx, '20,000+', 120); ctx.restore(); }
  label(ctx, 'TAILS IN ONE DAY', 540, 730, pop(t, tSingle - 0.1), { size: 56, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});
// F1 (s06 "Then officials spotted something odd: rats running around with no tails."): the inspector with a magnifier; tailless rats run past
const tOdd = at('s06', 'odd'), tRats6 = at('s06', 'rats'), tNo = at('s06', 'no');
shot('F1 no tails', Z.s06 - 0.12, Z.s07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 40, -560, 1.0], [3.5, 80, -560, 1.06]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 12 });
    const shocked = t > tNo - 0.1;
    CS.cast(w, -250, 0, 1.15, 1, 'inspector', { face: FACE(shocked ? 'shocked' : 'squint', [1, 0.5], t), lean: 0.08, armN: { hand: [160, -300], grip: 'hold', item: g => S.magnifier(g, 0.9) } });
    for (let i = 0; i < 3; i++) { const u = seg(t, tRats6 - 0.4 + i * 0.35, tRats6 + 1.6 + i * 0.35); if (u <= 0 || u >= 1) continue;
      w.save(); w.translate(lerp(900, -1100, u), 20 + i * 70); w.scale(-1, 1); S.rat(w, { s: 0.8, phase: t * 14 + i, run: 1, tail: 'stub', blush: 1, mood: i === 0 ? 'shock' : 'happy' }); w.restore(); } });
  label(ctx, 'SOMETHING ODD…', 540, 480, pop(t, tOdd - 0.05), { size: 56 });
  label(ctx, 'NO TAILS?!', 600, 1300, pop(t, tNo - 0.05), { size: 70, col: C.red, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'golden', 0.2);
});
// G1 (s07 "People cut off the tail, let the rat go, and let it breed more tails."): three comic panels CUT / FREE / BREED
const tCut = at('s07', 'cut'), tLet = at('s07', 'let'), tGo = at('s07', 'go'), tBreed = at('s07', 'breed'), tMore = at('s07', 'more');
function panel(ctx, y, h, u, title, col, draw) {
  if (u <= 0) return; ctx.save(); ctx.translate(540, y + h / 2); const k = E.back(clamp(u), 1.6); ctx.scale(k, k); ctx.rotate((title.length % 2 ? -1 : 1) * 0.012);
  CL.cutout(ctx, () => rr(ctx, -440, -h / 2, 880, h, 16), '#FBF6EA', { elev: 1.6 });
  ctx.save(); rr(ctx, -440, -h / 2, 880, h, 16); ctx.clip(); ctx.fillStyle = '#E2D3B4'; ctx.fillRect(-440, h / 2 - 70, 880, 70); draw(ctx); ctx.restore();
  rr(ctx, -440, -h / 2, 880, h, 16); ctx.lineWidth = R.px(ctx, 5); ctx.strokeStyle = '#171717'; ctx.stroke();
  label(ctx, title, -300, -h / 2 + 52, 1, { size: 50, col, fg: col === C.yellow ? '#171717' : PAL.cream, rot: -0.03 });
  ctx.restore();
}
shot('G1 trick', Z.s07 - 0.12, Z.s08 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, '#3E4A5C'); ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 24; i++) ctx.fillRect(0, i * 90, W, 30);
  const PH = 330, ground = PH / 2 - 70;
  panel(ctx, 360, PH, seg(t, Z.s07 - 0.1, Z.s07 + 0.2), '1 CUT', C.red, g => {
    const snip = seg(t, tCut, tCut + 0.2), cut = t > tCut + 0.15;
    g.save(); g.translate(80, ground); S.rat(g, { s: 1.0, tail: cut ? 'stub' : true, mood: cut ? 'shock' : 'happy', look: [-0.8, 0] }); g.restore();
    if (cut) { const f = seg(t, tCut + 0.15, tCut + 0.8); g.save(); g.translate(-120 - f * 60, ground - 40 + E.in(f) * 30); S.tailFlat(g, 170, 0.1 + f * 0.4, 1); g.restore(); }
    g.save(); g.translate(-90, ground - 70); S.scissors(g, 0.9, 1 - snip); g.restore();
    g.save(); g.translate(-10, ground - 40); S.snipStar(g, seg(t, tCut + 0.1, tCut + 0.6)); g.restore(); });
  panel(ctx, 360 + PH + 20, PH, seg(t, tLet - 0.15, tLet + 0.15), '2 FREE', PAL.green, g => {
    const u = seg(t, tLet - 0.1, tGo + 0.6);
    g.save(); g.translate(-280, ground); S.crate(g, 180, 130, 0, 0, t); g.restore();
    g.save(); g.translate(lerp(-180, 330, E.inOut(u)), ground); S.rat(g, { s: 0.9, tail: 'stub', phase: t * 14, run: u > 0 && u < 1 ? 1 : 0, mood: 'happy' }); g.restore();
    if (t > tGo - 0.1) fitTxt(g, 'GO!', 330, -40, 60, C.red, 200); });
  panel(ctx, 360 + 2 * (PH + 20), PH, seg(t, tBreed - 0.4, tBreed - 0.1), '3 BREED', C.yellow, g => {
    g.save(); g.translate(-200, ground); S.rat(g, { s: 0.9, tail: 'stub', mood: 'sly' }); g.restore();
    for (let i = 0; i < 4; i++) { const u = seg(t, tBreed + i * 0.18, tBreed + i * 0.18 + 0.3); if (u <= 0) continue;
      g.save(); g.translate(40 + i * 100, ground); const k = E.back(u, 2); g.scale(k, k); S.rat(g, { s: 0.42, phase: t * 6 + i, look: [0.3, -0.2] }); g.restore();
      const cu = seg(t, tMore + i * 0.12, tMore + i * 0.12 + 0.3); if (cu > 0) { g.save(); g.translate(60 + i * 100, ground - 120 - E.out(cu) * 20); g.scale(E.back(cu, 2), E.back(cu, 2)); S.coin(g, 26, '1¢'); g.restore(); } } });
  ST.grade(ctx, 'office', 0.2);
});
// H1 (s08 "Inspectors even found rat farms outside the city."): the shed full of crates; the inspector in the doorway
const tFarms = at('s08', 'farms'), tOutside = at('s08', 'outside');
shot('H1 farm', Z.s08 - 0.12, Z.s09 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -620, 0.6], [2.6, 40, -620, 0.64]], lt);
  layer(ctx, c, 1, w => { SE.sky(w, t, { warm: true, clouds: 2 }); SE.ground(w, 'dirt'); ctx.fillStyle = '#9DBA6A';
    w.fillStyle = '#A9C46E'; w.fillRect(-4000, -40, 8000, 40);
    w.save(); w.translate(320, 0); w.scale(0.8, 0.8); S.shed(w, t, { rats: true }); w.restore();
    CS.cast(w, -620, 0, 1.25, 1, 'inspector', { face: FACE(t > tFarms - 0.1 ? 'shocked' : 'squint', [1, 0], t), lean: -0.06, armN: { hand: [150, -360], grip: 'point' } }); });
  ctx.save(); ctx.translate(560, 560); ST.stampWord(ctx, 'RAT FARM', 120, seg(t, tFarms - 0.05, tFarms + 0.3), C.red, -0.1); ctx.restore();
  label(ctx, 'OUTSIDE THE CITY', 540, 760, pop(t, tOutside - 0.05), { size: 52, col: C.yellow });
  ST.grade(ctx, 'golden', 0.2);
});
// I1 (s09 "The hunt failed, and the plague came anyway."): the RAT HUNT plate gets FAILED; the plague notice slides in
const tFailed = at('s09', 'failed'), tPlague9 = at('s09', 'plague');
shot('I1 failed', Z.s09 - 0.12, Z.s10 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.9], [2, 0, -560, 0.96]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 12 }); S.bountyTable(w, 0, { sign: 'BOUNTY' });
    for (let i = 0; i < 4; i++) { const x = ((t * 380 + i * 520) % 2400) - 1200; w.save(); w.translate(x, 60 + (i % 2) * 90); S.rat(w, { s: 0.75, phase: t * 14 + i, run: 1, tail: i % 2 ? 'stub' : true, mood: 'happy' }); w.restore(); } });
  ctx.save(); ctx.translate(540, 500); CL.cutout(ctx, () => rr(ctx, -380, -80, 760, 150, 18), PAL.cream, { elev: 1.6 }); fitTxt(ctx, 'THE RAT HUNT', 0, 26, 86, '#171717', 700);
  ctx.translate(0, 170); ST.stampWord(ctx, 'FAILED', 120, seg(t, tFailed - 0.05, tFailed + 0.3), C.red, -0.08); ctx.restore();
  const u = seg(t, tPlague9 - 0.25, tPlague9 + 0.15); if (u > 0) { ctx.save(); ctx.translate(lerp(1400, 760, E.out(u)), 980); ctx.scale(0.62, 0.62); S.plagueNotice(ctx, { rot: 0.06 }); ctx.restore(); }
  ST.grade(ctx, 'golden', 0.24);
});
// J1 (s10 "Not hunters. Money."): the hunter holds up the coin; NOT HUNTERS. / MONEY.
const tMoney = at('s10', 'money'), tPay = at('s10', 'pay'), tGet = at('s10', 'get'), tNot = at('s10', 'not', 1);
shot('J1 money', Z.s10 - 0.12, tPay - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -640, 1.25], [2, 20, -650, 1.33]], lt);
  layer(ctx, c, 1, w => { S.street(w, t, { n: 12 });
    CS.cast(w, -100, 0, 1.2, 1, 'hunter', { face: FACE('smug', [-0.2, 0], t), armN: { hand: [140, -420], grip: 'pinch', item: coinItem(t * 0.3, 46) }, armF: { hand: [100, -230], grip: 'pinch', item: tailItem(t, 140) } }); });
  glowAt(ctx, 540 + 230, 760, 260, 0.5 * seg(t, tMoney - 0.1, tMoney + 0.3));
  label(ctx, 'NOT HUNTERS.', 540, 470, pop(t, Z.s10 + 0.02), { size: 66 });
  label(ctx, 'MONEY.', 540, 600, pop(t, tMoney - 0.05), { size: 92, col: C.red, fg: PAL.cream, rot: 0.04 });
  ST.grade(ctx, 'golden', 0.2);
});
// J2 (s10 "Pay for tails, and you get tails, not fewer rats."): the balance: the coin sack vs a growing heap of tails; rats below
shot('J2 balance', tPay - 0.12, tEnd, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(201,135,74,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  const n = Math.floor(lerp(4, 46, E.out(seg(t, tPay, tGet + 0.6)))), tilt = lerp(-0.4, 0.9, E.back(seg(t, tGet - 0.1, tGet + 0.4), 1.6));
  ctx.save(); ctx.translate(510, 720); ctx.scale(0.8, 0.8); S.balance(ctx, tilt, g => S.sack(g, 0.75), g => { g.save(); g.translate(0, -10); S.tailHeap(g, n, 190, 160); g.restore(); }); ctx.restore();
  for (let i = 0; i < 5; i++) { const x = ((t * 300 + i * 260) % 1400) - 160; ctx.save(); ctx.translate(x, 1330 + (i % 2) * 40); S.rat(ctx, { s: 0.6, phase: t * 14 + i, run: 1, tail: i % 2 ? 'stub' : true, mood: 'happy' }); ctx.restore(); }
  label(ctx, 'PAY FOR TAILS → GET TAILS', 540, 470, pop(t, tGet - 0.05), { size: 58, col: C.yellow });
  label(ctx, 'NOT FEWER RATS', 540, 1180, pop(t, tNot - 0.05), { size: 62, col: C.red, fg: PAL.cream, rot: -0.03 });
  ST.grade(ctx, 'day', 0.15);
});
// K (end card, 2 s+): the exchange again (echo of frame 0) + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => { exchange(ctx, t, lt + 4, [[0, 0, -640, 0.8], [2.5, 0, -650, 0.83]], { offFace: 'skeptical', huntFace: 'smug' }); ST.grade(ctx, 'golden', 0.2); }, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [6, 4, 3], s02: [4, 6, 3], s03: [3, 5, 6], s04: [6, 7], s05: [2, 7, 5], s06: [5, 6], s07: [5, 4, 6], s08: [3, 5], s09: [3, 5], s10: [3, 7, 3] };
const REPL = [[/one cent/, '1 cent'], [/twenty thousand/, '20,000']];
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
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['1902', 'sewers', 'toilets', 'plague', 'cent', '20000', 'breed', 'farms', 'failed', 'money'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['slam', 0.0, 2.0], ['ding', 0.02, 1.4], ['pop', 0.12, 1.2], ['clink', 0.5, 1.5], ['squeak', 1.2, 0.6]];
  c.push(['cut', tJust - 0.12, 0.35], ['pop', tJust - 0.05, 0.5], ['kaching', tJust + 0.3, 0.5]);
  c.push(['cut', Z.s02 - 0.12, 0.35], ['pop', Z.s02, 0.5], ['flip', tFr - 0.15, 0.6], ['cut', tThe2 - 0.12, 0.35], ['sparkle', tShiny, 0.5], ['whoosh', tSewers - 0.5, 0.5], ['pop', tSewers - 0.05, 0.5]);
  c.push(['cut', Z.s03 - 0.12, 0.35]); for (let i = 0; i < 4; i++) c.push(['squeak', Z.s03 + 0.1 + i * 0.22, 0.5]);
  c.push(['cut', tThey - 0.12, 0.35], ['splash', tToilets - 0.35, 0.6], ['squeak', tToilets, 0.8], ['cut', tAnd3 - 0.12, 0.35], ['stamp', tPlague + 0.05, 0.7]);
  c.push(['cut', Z.s04 - 0.12, 0.35], ['paper', Z.s04, 0.6], ['stamp', tOffer + 0.1, 0.8], ['tag', tRep - 0.05, 0.4], ['clink', tCent, 0.8], ['pop', tCent - 0.05, 0.4]);
  c.push(['cut', Z.s05 - 0.12, 0.35], ['ding', Z.s05 + 0.1, 0.5], ['steps', Z.s05 + 0.2, 0.5], ['cut', tOver - 0.12, 0.35]); for (let i = 0; i < 10; i++) c.push(['paper', tOver + i * 0.18, 0.35]); c.push(['stamp', tTwenty + 0.15, 0.8], ['coins', tSingle, 0.6]);
  c.push(['cut', Z.s06 - 0.12, 0.35], ['pop', tOdd - 0.05, 0.4]); for (let i = 0; i < 3; i++) c.push(['squeak', tRats6 - 0.2 + i * 0.35, 0.5]); c.push(['boop', tNo - 0.05, 0.6]);
  c.push(['cut', Z.s07 - 0.12, 0.35], ['pop', Z.s07, 0.4], ['snip', tCut + 0.1, 0.8], ['pop', tLet - 0.1, 0.4], ['whoosh', tGo - 0.1, 0.4], ['pop', tBreed - 0.3, 0.4]); for (let i = 0; i < 4; i++) c.push(['squeak', tBreed + i * 0.18, 0.35], ['clink', tMore + i * 0.12, 0.6]);
  c.push(['cut', Z.s08 - 0.12, 0.35], ['stamp', tFarms + 0.1, 0.9], ['pop', tOutside - 0.05, 0.4]);
  c.push(['cut', Z.s09 - 0.12, 0.35], ['stamp', tFailed + 0.1, 0.9], ['whoosh', tPlague9 - 0.25, 0.4], ['thump', tPlague9 + 0.1, 0.5]);
  c.push(['cut', Z.s10 - 0.12, 0.35], ['pop', Z.s10 + 0.02, 0.4], ['kaching', tMoney, 0.7], ['cut', tPay - 0.12, 0.35]); for (let i = 0; i < 8; i++) c.push(['paper', tPay + i * 0.2, 0.3]);
  c.push(['thump', tGet + 0.1, 0.7], ['pop', tGet - 0.05, 0.4], ['squeak', tNot, 0.5], ['pop', tNot - 0.05, 0.4], ['cut', tEnd, 0.4], ['pop', tEnd + 0.05, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, sewers: Z.s02, offer: Z.s04, worked: Z.s05, odd: Z.s06, fail: Z.s09, twist: Z.s10, hit: tEnd, end: T };

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
  const KEY = [['01_hook', 1.0], ['02_toilet_sewers', tToilets + 0.5], ['03_1_cent_bounty', tEvery + 0.3], ['04_20000_a_day', tSingle + 0.4], ['05_cut_free_breed', tMore + 0.7], ['06_question', tEnd + 1.0]];
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
