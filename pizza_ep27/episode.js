// Episode 27 "Bitcoin Pizza" (How It's Run) — May 2010: Laszlo Hanyecz paid 10,000 BTC for two Papa John's pizzas (~$41 then, ~$1.26B at the
// Oct 2025 peak); he says he wrote the first GPU miner; a California teenager ("jercos") paid ~$25 for the pizzas; Laszlo repeated the offer,
// then wrote "I can't really afford to keep doing it"; in all he says he spent ~100,000 BTC, much of it on pizza — and he doesn't regret it.
// Look: howitsrun_style/ (style reference hoover_ep19 / lawnchair_ep17): full-body profile people in real places, flat sets, paper plates.
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
const S = require('./pizzakit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { W, H, FPS, PAL, layer, cam, shake, pop, blink, label, txt, fitTxt } = ST;
const { LASZLO, KID, pizzaBox, coin, gpu, laptop } = S.CS;

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { p01: 0.3, p02: 0.3, p03: 0.3, p04: 0.3, p05: 0.3, p06: 0.3, p07: 0.3, p08: 0.3, p09: 0.3, p10: 0.3 };
const STt = {}; let T = 0.05; for (const L of LINES) { STt[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; }
const V = EN.voice(`${__dirname}/vo`, STt), at = (id, w, n = 0) => V.at(id, w, n), end = id => STt[id] + SP[id][1];
const tEnd = +(end('p10') + 0.15).toFixed(2);
T = +(tEnd + 2.2).toFixed(2);
const Z = STt;

// ---------- helpers ----------
const FACE = (n, look = [1, 0], t = 0, o = 0, extra = {}) => R.expr(n, { look, blink: blink(t, 3.2, o), ...extra });
const tag = (ctx, s, y, u, o = {}) => label(ctx, s, o.x ?? 540, y, u, { size: o.size || 38, col: o.col || '#171717', fg: o.fg || C.yellow, rot: o.rot ?? 0.015, maxW: 960 });
// the counter: money value rolling from a to b between t0 and t1 (log scale), formatted with commas
const money = v => '$' + Math.round(v).toLocaleString('en-US');
const roll = (t, t0, t1, a, b) => Math.exp(lerp(Math.log(a), Math.log(b), E.inOut(seg(t, t0, t1))));
function plate(ctx, s, x, y, u, o = {}) { if (u <= 0) return; ctx.save(); ctx.translate(x + (o.sh || 0), y); ctx.rotate(o.rot ?? -0.02); ctx.scale(u, u); const w = o.w || 900, h = o.h || 170;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 20), o.col || C.red, { elev: 2 }); fitTxt(ctx, s, 0, h * 0.2, o.size || 110, o.fg || PAL.cream, w - 60); ctx.restore(); }

// ---------- the scale scene (frame 0, p01–p02, p03, end card) ----------
// coins keep dropping onto the right pan; the price tag hangs under the left pan; avalanche (0..1) buries the left pan and crushes the boxes
const BL = 260, BS = 1.35;   // half beam length
function scaleScene(w, t, o = {}) {
  SE.room(w, t, { wall: '#EFE3CB', floor: 'wood', window: 1100 });
  SE.desk(w, 0, 1500, -300, '#8A5A34');
  w.save(); w.translate(0, -300); w.scale(BS, BS);
  const tilt = o.tilt ?? 0.12, av = o.av || 0;
  S.balance(w, tilt, g => { S.boxStack(g, 0.95, av); }, g => { S.coinPile(g, 14 + Math.floor((o.pile || 0)), 300, 3); }, { L: BL });
  const rx = BL * Math.cos(tilt), ry = -560 - BL * Math.sin(tilt) + 260, lx = -rx, ly = -560 + BL * Math.sin(tilt) + 260;
  // falling coins into the right pan (motion from frame 0)
  for (let i = 0; i < (o.rain ?? 6); i++) { const k = ((t * 1.4 + i / 6) % 1); S.flatCoin(w, rx + (hash(i) - 0.5) * 160, lerp(-1500, ry - 60, E.in(k)), 0.9, t * 6 + i); }
  // the avalanche: a wave of coins onto the boxes on the left pan
  if (av > 0) for (let i = 0; i < 110; i++) { const d = clamp(av * 1.5 - i / 220); if (d <= 0) continue; const x0 = lx + (hash(i) - 0.5) * 340, y1 = ly - 20 - hash(i + 7) * 200 * (1 - Math.abs(x0 - lx) / 200);
    S.flatCoin(w, x0, lerp(-1500, y1, E.in(clamp(d * 2))), 1, i); }
  // the price tag on a string under the left pan; flip u (10,000 BTC -> $41); slams in at o.t0
  const t0 = o.t0 ?? 0, k = E.back(seg(t, t0, t0 + 0.2), 1.4), sw = Math.sin((t - t0) * 5) * 0.08 * Math.exp(-(t - t0) * 0.8);
  w.strokeStyle = '#171717'; w.lineWidth = 4; w.beginPath(); w.moveTo(lx - 120, ly + 10); w.lineTo(lx - 120, ly + 150); w.stroke();
  w.save(); w.translate(lx + 100, ly + 150 + lerp(-160, 0, k)); w.rotate(sw - 0.04); const z = lerp(1.6, 1, k) * 0.75; w.scale(z, z); w.translate(0, 105);
  S.priceTag(w, '10,000 BTC', '$41', o.flip || 0, { w: 620, h: 210, size: 104 }); w.restore();
  w.restore();
}
// ---------- overlays (frame 0 headline, honesty stamp, question card) ----------
function overlays(ctx, t) {
  ST.headline2(ctx, '2 PIZZAS', '= 10,000 BTC', 1 - seg(t, Z.p02 - 0.3, Z.p02 - 0.05), 380);
  if (t < tEnd) ST.stampLabel(ctx);
  if (t >= tEnd) ST.questionCard(ctx, t, ['SELL THE PIZZA...'], 'OR KEEP THE BITCOIN?', E.back(seg(t, tEnd, tEnd + 0.35), 2), { y: 500 });
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
// A1 (p01 + p02): the scale with two pizza boxes vs a pile of bitcoins; the "10,000 BTC" tag slams down at 0.0 s; on "forty" it flips to "$41"
const tPizzas = at('p01', 'pizzas'), tForty = at('p02', 'forty');
shot('A1 scale', 0, Z.p03 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -760, 0.86], [2.6, -30, -760, 0.92], [5.0, -150, -700, 1.05]], lt);
  layer(ctx, c, 1, w => scaleScene(w, t, { tilt: 0.12 + Math.sin(t * 3) * 0.015, flip: seg(t, tForty - 0.15, tForty + 0.15) }));
  if (t < Z.p02 - 0.1) tag(ctx, 'MAY 22, 2010', 640, pop(t, 0.05));
  if (t > tForty - 0.1) tag(ctx, 'VALUE IN 2010 · BITCOINTALK', 520, pop(t, tForty + 0.1));
  if (t > tPizzas - 0.1 && t < Z.p02) label(ctx, 'FOR TWO PIZZAS', 540, 790, pop(t, tPizzas - 0.05), { size: 56, col: C.yellow, rot: -0.03 });
  ST.grade(ctx, 'day', 0.2);
}, { type: 'cut' });
// C1 (p03): the counter rolls $41 -> $1,260,000,000; on "BILLION" a coin avalanche crushes the boxes
const tPeak = at('p03', 'peak'), tOne = at('p03', 'one'), tBil = at('p03', 'billion');
shot('C1 billion', Z.p03 - 0.12, Z.p04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -800, 0.84], [4.4, 0, -790, 0.88]], lt);
  const av = seg(t, tBil - 0.25, tBil + 0.45);
  layer(ctx, c, 1, w => scaleScene(w, t, { tilt: lerp(0.12, 0.3, av), av, rain: 6 + Math.floor(seg(t, tOne, tBil) * 14), pile: seg(t, tOne, tBil) * 10, flip: 1, t0: -5 }));
  ctx.save(); ctx.translate(shake(t, tBil, 18), 0);
  plate(ctx, money(roll(t, tOne - 0.05, tBil + 0.3, 41, 1.26e9)), 540, 560, pop(t, tOne - 0.15, 0.25), { size: 118, col: t > tBil + 0.3 ? C.red : PAL.navy, w: 980 });
  ctx.restore();
  tag(ctx, 'PEAK OCT 6, 2025 · COINGECKO', 720, pop(t, tPeak - 0.05));
  if (t > tBil + 0.4) tag(ctx, 'TODAY ≈ $747M (NOV 9, 2026)', 800, pop(t, tBil + 0.5), { size: 34, col: PAL.cream, fg: '#171717', rot: -0.01 });
  ST.grade(ctx, 'day', 0.2);
});
// D1 (p04): Laszlo at his desk, the GPU glowing; deadpan; name tag; on "GPU" the claim plate
const tGpu = at('p04', 'gpu'), tSays = at('p04', 'says');
shot('D1 gpu', Z.p04 - 0.12, Z.p05 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -120, -520, 0.98], [3.2, -40, -540, 1.1]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'wood', window: 900 });
    P.seated(w, -380, 0, 1.15, 1, LASZLO, { face: FACE(t > tSays ? 'smug' : 'tired', t > tGpu ? [1, 0.1] : [1, -0.1], t), armN: { hand: [200, -330], grip: 'fist' } });
    SE.desk(w, 120, 640, -300, '#8A5A34');
    w.save(); w.translate(10, -300); laptop(w, 1.0); w.restore();
    const g = 0.35 + 0.65 * seg(t, tGpu - 0.2, tGpu + 0.2) + 0.1 * Math.sin(t * 9);
    w.save(); w.translate(320, -370); gpu(w, 0.75); w.restore(); S.glow(w, 320, -370, 360, 'rgba(120,255,170,1)', 0.3 * g);
  });
  tag(ctx, 'LASZLO HANYECZ · JACKSONVILLE, FL', 1280, pop(t, Z.p04 + 0.05), { col: PAL.cream, fg: '#171717', size: 40 });
  label(ctx, 'NOT A NEWBIE', 540, 560, pop(t, at('p04', 'newbie') - 0.1), { size: 64, col: C.yellow });
  label(ctx, '"I WROTE THE FIRST GPU MINER"', 540, 690, pop(t, tGpu - 0.05), { size: 50, col: '#2FA37E', fg: PAL.cream, rot: 0.03 });
  ST.grade(ctx, 'office', 0.2);
});
// E1 (p05 "Four days after his offer,"): his forum post (May 18, 2010) pops up; "+4 DAYS"
const tDays = at('p05', 'days'), tCal = at('p05', 'california'), tTwo5 = at('p05', 'two'), tDel = at('p05', 'delivered');
function postShot(ctx, t, lt, date, t0) {
  ST.bg(ctx, '#2E3A59'); ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 24; i++) ctx.fillRect(0, i * 80, W, 30);
  const u = E.back(seg(t, t0, t0 + 0.3), 1.6), z = 1 + lt * 0.02; ctx.save(); ctx.translate(540, 980); ctx.scale(u * z, u * z); ctx.rotate(-0.015);
  S.forumPost(ctx, 'laszlo', date, ["I'll pay 10,000 bitcoins for", 'a couple of pizzas..'], { w: 940, h: 460 }); ctx.restore();
}
shot('E1 post', Z.p05 - 0.12, tCal - 0.12, (ctx, t, lt) => {
  postShot(ctx, t, lt, 'MAY 18, 2010', Z.p05 - 0.12);
  tag(ctx, 'HIS FORUM POST · MAY 18, 2010', 640, pop(t, Z.p05));
  ctx.save(); ctx.translate(560, 1340); ST.stampWord(ctx, '+4 DAYS', 100, seg(t, tDays - 0.05, tDays + 0.35), C.red, -0.1); ctx.restore();
  ST.grade(ctx, 'office', 0.15);
}, { type: 'cut' });
// E2 (p05 "a California teenager"): the map hop CA -> FL; the kid on the left with his phone
shot('E2 map', tCal - 0.12, tTwo5 - 0.12, (ctx, t, lt) => {
  ST.bg(ctx, PAL.paper); ctx.fillStyle = 'rgba(77,141,255,0.12)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 70, W, 3);
  ctx.save(); ctx.translate(540, 900); ctx.scale(1.02 + lt * 0.02, 1.02 + lt * 0.02); S.usMap(ctx, seg(t, tCal + 0.1, tTwo5 + 0.3), t, g => pizzaBox(g, 0.45)); ctx.restore();
  ctx.save(); ctx.translate(0, 0); P.personBust(ctx, 900, 1430, 0.75, KID, { face: FACE('smug', [-0.4, 0], t) }); ctx.restore();
  label(ctx, 'TEENAGER', 640, 560, pop(t, at('p05', 'teenager') - 0.05), { size: 66, col: C.yellow });
  tag(ctx, "BUYER: 'JERCOS', 19 (PER FOX BUSINESS)", 1250, pop(t, tCal + 0.15), { x: 640, size: 34, col: PAL.cream, fg: '#171717' });
  ST.grade(ctx, 'day', 0.15);
}, { type: 'cut' });
// E3 (p05 "had two large Papa John's delivered."): the two boxes land on Laszlo's porch; the door opens
shot('E3 porch', tTwo5 - 0.12, Z.p06 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -120, -330, 0.95], [1.8, -100, -320, 1.05]], lt);
  layer(ctx, c, 1, w => { S.porch(w, t, seg(t, tDel, tDel + 0.4));
    const k = E.out(seg(t, tTwo5 - 0.05, tTwo5 + 0.35)); w.save(); w.translate(lerp(-900, -330, k), lerp(-900, -10, E.in(seg(t, tTwo5 - 0.05, tTwo5 + 0.35)))); S.boxStack(w, 1.0); w.restore();
    if (t > tDel) P.person(w, 40, -10, 1.0, -1, LASZLO, { face: FACE('grin', [1, 0.4], t) });
  });
  label(ctx, '2 LARGE PIZZAS', 540, 560, pop(t, at('p05', 'large') - 0.05), { size: 66, col: C.yellow });
  tag(ctx, 'DELIVERED · JACKSONVILLE, FL', 690, pop(t, tDel));
  ST.grade(ctx, 'day', 0.2);
});
// F1 (p06): the kid winks; "$25 OF PIZZA -> $41 OF BITCOIN"
const t25 = at('p06', 'twenty');
shot('F1 kid', Z.p06 - 0.12, Z.p07 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -60, -600, 1.1], [2.4, -40, -620, 1.18]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#E6D8F0', floor: 'carpet', carpet: '#7A8EA8', window: -700 });
    const wink = t > t25 + 0.2 && t < t25 + 0.75;
    P.person(w, 120, 0, 1.25, -1, KID, P.POSE.phone(FACE(wink ? 'grin' : 'smug', [1, 0], t, 0, wink ? { lid: [1, 0.12] } : {}), g => { rr(g, -14, -60, 28, 100, 8); R.fillStroke(g, '#2A2A30', 4); }));
    w.save(); w.translate(-420, -10); S.boxStack(w, 0.9); w.restore(); });
  plate(ctx, '$25 OF PIZZA', 540, 520, pop(t, t25 - 0.1), { size: 96, col: PAL.navy, w: 800, h: 150 });
  plate(ctx, '→ $41 OF BITCOIN', 540, 690, pop(t, t25 + 0.45), { size: 96, col: '#E8A73A', fg: '#171717', w: 860, h: 150, rot: 0.03 });
  ST.grade(ctx, 'office', 0.18);
}, { type: 'cut' });
// G1 (p07): the same post again: new date June 12, 2010 + stamp "AGAIN"
const tAgain = at('p07', 'again'), tSame = at('p07', 'same');
shot('G1 again', Z.p07 - 0.12, Z.p08 - 0.12, (ctx, t, lt) => {
  postShot(ctx, t, lt, 'JUNE 12, 2010', Z.p07 - 0.12);
  P.personBust(ctx, 860, 1460, 0.8, LASZLO, { face: FACE(t > tSame ? 'grin' : 'smile', [-0.4, 0], t) });
  tag(ctx, 'JUNE 12, 2010', 640, pop(t, tSame - 0.1));
  ctx.save(); ctx.translate(540, 1080); ST.stampWord(ctx, 'AGAIN', 150, seg(t, tAgain - 0.05, tAgain + 0.35), C.red, -0.14); ctx.restore();
  ST.grade(ctx, 'office', 0.15);
}, { type: 'cut' });
// H1 (p08): the quote card (forum style, Aug 4, 2010); Laszlo looks into his empty wallet
const tAfford = at('p08', 'afford');
shot('H1 afford', Z.p08 - 0.12, Z.p09 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, -60, -520, 1.3], [2.8, -40, -540, 1.38]], lt);
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#DCE6EE', floor: 'wood', door: 700 });
    P.person(w, -200, 0, 1.2, 1, LASZLO, P.POSE.read(FACE(t > tAfford ? 'worried' : 'tired', [1, 0.6], t), g => { g.save(); g.translate(40, -20); g.scale(0.6, 0.6); S.wallet(g, t, 1); g.restore(); })); });
  ctx.save(); ctx.translate(540, 560); ctx.scale(pop(t, at('p08', 'i') - 0.1), pop(t, at('p08', 'i') - 0.1)); ctx.rotate(-0.02);
  CL.cutout(ctx, () => rr(ctx, -470, -140, 940, 280, 20), '#F4F6FA', { elev: 2 }); ctx.fillStyle = '#3E5A86'; ctx.fillRect(-470, -140, 12, 280);
  fitTxt(ctx, '"I can\'t really afford', -420, -30, 66, '#171717', 860, 'left', F.black); fitTxt(ctx, 'to keep doing it."', -420, 60, 66, '#171717', 860, 'left', F.black); ctx.restore();
  tag(ctx, 'LASZLO, FORUM POST · AUG 4, 2010', 770, pop(t, Z.p08 + 0.1));
  ST.grade(ctx, 'office', 0.2);
}, { type: 'cut' });
// I1 (p09): a pizza tower grows; "≈100,000 BTC SPENT · HIS ESTIMATE"
const tHund = at('p09', 'hundred'), tMuch = at('p09', 'much'), tPiz9 = at('p09', 'pizza');
shot('I1 tower', Z.p09 - 0.12, Z.p10 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -560, 0.78], [2.2, 0, -900, 0.68], [4.4, 0, -1100, 0.62]], lt);
  const n = Math.floor(lerp(2, 34, E.out(seg(t, Z.p09 + 0.2, tPiz9 + 0.2))));
  layer(ctx, c, 1, w => { SE.room(w, t, { wall: '#EFE3CB', floor: 'wood' });
    for (let i = 0; i < n; i++) { w.save(); w.translate(220 + (hash(i) - 0.5) * 30, -i * 44); w.rotate((hash(i + 3) - 0.5) * 0.06); pizzaBox(w, 0.95); w.restore(); }
    P.person(w, -380, 0, 1.15, 1, LASZLO, { face: FACE('surprised', [0.6, -1], t), armN: { hand: [150, -400], grip: 'point' }, headTilt: -0.15 }); });
  plate(ctx, '≈100,000 BTC SPENT', 540, 520, pop(t, tHund - 0.1), { size: 96, col: C.red, w: 960, h: 160 });
  tag(ctx, 'HIS ESTIMATE · CBS 60 MINUTES, 2019', 670, pop(t, tHund + 0.3));
  label(ctx, 'MUCH OF IT ON PIZZA', 540, 800, pop(t, tMuch), { size: 56, col: C.yellow, rot: 0.03 });
  ST.grade(ctx, 'day', 0.2);
}, { type: 'cut' });
// J1 (p10): Laszlo eats a slice, deadpan to the camera; "I DON'T REGRET IT"
const tReg = at('p10', 'regret');
shot('J1 regret', Z.p10 - 0.12, tEnd, (ctx, t, lt) => {
  ST.bg(ctx, '#EFE3CB'); ctx.fillStyle = 'rgba(160,120,80,0.08)'; for (let x = 0; x < W; x += 110) ctx.fillRect(x, 0, 6, H);
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
  P.personBust(ctx, 540, 1390, 2.0, LASZLO, { face: FACE('tired', [0, 0], t) });
  const bite = t > at('p10', 'you') ? 1 : 0, by = Math.sin(t * 5) * 6;
  ctx.save(); ctx.translate(760, 1330 + by); ctx.rotate(Math.PI + 0.2); S.slice(ctx, 1.3, bite); ctx.restore();
  ctx.restore();
  label(ctx, "\"I DON'T REGRET IT\"", 540, 520, pop(t, tReg - 0.1), { size: 70, col: C.yellow });
  tag(ctx, 'COINTELEGRAPH, 2018', 650, pop(t, Z.p10 + 0.05));
  ST.grade(ctx, 'office', 0.2);
}, { type: 'cut' });
// K (end card, 2 s+): back to the frame-0 picture (boxes on the scale, "10,000 BTC") + the question
shot('K end', tEnd, T + 0.01, (ctx, t, lt) => {
  const c = cam([[0, 0, -1020, 0.8], [2.2, 0, -1020, 0.82]], lt);
  layer(ctx, c, 1, w => scaleScene(w, t, { tilt: 0.12 + Math.sin(t * 3) * 0.015, t0: -5 }));
  ST.grade(ctx, 'day', 0.2);
}, { type: 'cut' });

// ---------- edit, overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { p01: [5, 3], p02: [5], p03: [3, 5], p04: [5, 4, 4], p05: [5, 3, 6], p06: [5, 3], p07: [2, 6], p08: [3, 4, 4], p09: [5, 6, 5], p10: [3, 4] };
const REPL = [[/ten thousand/, '10,000'], [/forty-one dollars/, '$41'], [/One point two six/, '$1.26'], [/twenty-five dollars/, '$25'], [/a hundred thousand/, '100,000']];
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
  if (!o.nosubs) EN.drawSubtitles(ctx, t, SUBS, { ...ST.SUBS, highlight: ['10000', 'pizzas', '$41', '$126', 'billion', 'gpu', 'teenager', '$25', 'again', 'afford', '100000', 'pizza', 'regret'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['stamp', 0.0, 1.6], ['kaching', 0.02, 1.2], ['coins', 0.15, 0.6], ['pop', 0.1, 0.8], ['pop', tPizzas - 0.05, 0.5]];
  for (let i = 0; i < 8; i++) c.push(['clink', 0.6 + i * 0.6, 0.5]);
  c.push(['flip', tForty - 0.15, 0.8], ['pop', tForty + 0.1, 0.4], ['tag', tForty + 0.1, 0.4]);
  c.push(['cut', Z.p03 - 0.12, 0.35], ['pop', tPeak - 0.05, 0.4], ['rise', tOne - 0.2, 0.5]); for (let i = 0; i < 10; i++) c.push(['tick', tOne + i * (tBil - tOne) / 10, 0.6]);
  c.push(['coins', tBil - 0.1, 1.0], ['boom', tBil, 0.7], ['coins', tBil + 0.3, 0.8], ['stamp', tBil + 0.3, 0.5]);
  c.push(['cut', Z.p04 - 0.12, 0.35], ['tag', Z.p04 + 0.05, 0.4], ['hum', Z.p04, 0.5], ['pop', at('p04', 'newbie') - 0.1, 0.4], ['power', tGpu - 0.2, 0.6]);
  c.push(['cut', Z.p05 - 0.12, 0.35], ['blip', Z.p05, 0.5], ['type', Z.p05 + 0.2, 0.4], ['type', Z.p05 + 0.35, 0.4], ['stamp', tDays + 0.05, 0.7]);
  c.push(['cut', tCal - 0.12, 0.35], ['whoosh', tCal + 0.1, 0.5], ['pop', at('p05', 'teenager') - 0.05, 0.4]);
  c.push(['cut', tTwo5 - 0.12, 0.35], ['thump', tTwo5 + 0.3, 0.6], ['click', tDel, 0.6], ['pop', at('p05', 'large') - 0.05, 0.4]);
  c.push(['cut', Z.p06 - 0.12, 0.35], ['pop', t25 - 0.1, 0.5], ['sparkle', t25 + 0.25, 0.5], ['pop', t25 + 0.45, 0.5]);
  c.push(['cut', Z.p07 - 0.12, 0.35], ['blip', Z.p07, 0.4], ['stamp', tAgain + 0.05, 0.8]);
  c.push(['cut', Z.p08 - 0.12, 0.35], ['pop', at('p08', 'i') - 0.1, 0.4], ['wah', tAfford, 0.4]);
  c.push(['cut', Z.p09 - 0.12, 0.35]); for (let i = 0; i < 14; i++) c.push(['tap', Z.p09 + 0.25 + i * (tPiz9 - Z.p09) / 14, 0.6]); c.push(['stamp', tHund, 0.6], ['pop', tMuch, 0.4]);
  c.push(['cut', Z.p10 - 0.12, 0.35], ['snip', at('p10', 'you'), 0.5], ['pop', tReg - 0.1, 0.4]);
  c.push(['cut', tEnd, 0.4], ['kaching', tEnd + 0.05, 0.5], ['pop', tEnd + 0.1, 0.6], ['blip', tEnd + 0.4, 0.4]);
  return c;
}
const MUSIC = { b0: 0, numbers: Z.p03, story: Z.p04, again: Z.p07, broke: Z.p08, tower: Z.p09, hit: tEnd, end: T };

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
  const KEY = [['01_hook', 0.8], ['02_41_dollars', tForty + 0.8], ['03_1_26_billion', tBil + 0.8], ['04_the_offer', tDays + 0.6], ['05_25_vs_41', t25 + 1.0], ['06_question', tEnd + 1.0]];
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
