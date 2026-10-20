// "Why Airlines Sell Seats They Don't Have" — FINAL cut, Bold Editorial Collage (1080x1920, 30 fps).
// New script (script_final.json, vo_final/), faster hook, new gamble scene, volunteers vs denied boarding, split-screen ending.
// Usage: node episode_final.js video out.mp4 | still t1,t2,... out.png | cues     (the first cut stays in episode.js)
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const AK = require('./airkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, contact, applyCam, tag, bill, coin, cloud, LIGHT } = K;
const { A2, ticket, stamp, airliner, personFront, miniTicket, seatPos, planeTop, smallSeat, moneyStack, check, seatFront, board2 } = AK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);
const GREEN = '#1E9E6A';

// ---------- voice-over (Chris), word timing ----------
const ST = { b01: 0.25, b02: 2.05, b03: 4.35, b04: 8.85, b05: 11.0, b06: 13.95, b07: 16.4, b08: 20.2, b09: 24.5, b10: 31.1, b11: 32.75 };
const V = EN.voice(`${__dirname}/vo_final`, ST), at = V.at, T = 37.8;
const w = { seat: at('b02', 'seat'), not: at('b02', 'not'), sell: at('b03', 'sell'), seats: at('b03', 'seats'), overbooking: at('b04', 'overbooking'),
  showing: at('b05', 'not'), everyone: at('b06', 'everyone'), ask: at('b07', 'ask'), volunteers: at('b07', 'volunteers'), later: at('b07', 'later'),
  enough: at('b08', 'not'), denied: at('b08', 'denied'), qualifying: at('b09', 'qualifying'), cash: at('b09', 'cash'), five: at('b11', 'five') };
const IMPACT = 2.32, TEAR = 3.32; // on the music grid (bar = 2 s from 0.32)

// ---------- world layout ----------
const MAPX = 10000, MAPC = [MAPX, -60], MAPS = 0.78, EXTRA = [MAPX + 300, 250];
const GAMX = 30000, SET2 = 1700, PS = 1.1, PFY = -40, SEATX = [-170, 170], SEATY = 420, PX = [-320, 0, 320], WHO = [1, 5, 3];
const GATEX = 20000, GY = 100, GQ = [GATEX - 260, GATEX, GATEX + 260], PASS_C = [GATEX, -330], PASS_S = 0.45;
const ENDT = [GATEX - 185, -295], ENDM = [GATEX + 324, 16];

// ---------- camera ----------
const KEYS = [
  { t: 3.3, x: MAPX, y: -60, z: 0.62 }, { t: 4.7, x: MAPX, y: -50, z: 0.68 }, { t: 5.7, x: MAPX, y: -10, z: 0.95 }, { t: 10.4, x: MAPX, y: -12, z: 0.96 },   // plane -> seat map
  { t: 10.8, x: GAMX, y: 40, z: 0.9, e: 'inOut5' }, { t: 13.85, x: GAMX + 10, y: 40, z: 0.92 }, { t: 14.2, x: GAMX + SET2, y: 40, z: 0.9, e: 'inOut5' }, { t: 15.9, x: GAMX + SET2, y: 40, z: 0.94 }, // gamble
  { t: 16.3, x: GATEX, y: -400, z: 0.82, e: 'inOut5' }, { t: 24.3, x: GATEX, y: -395, z: 0.84 },                                                           // volunteers
  { t: 25.0, x: GATEX, y: -330, z: 1.7, e: 'inOut5' }, { t: 28.8, x: GATEX, y: -330, z: 1.75 }, { t: 29.5, x: GATEX, y: -300, z: 1.2, e: 'out5' },          // reveal
  { t: 31.0, x: GATEX, y: -300, z: 1.2 }, { t: 31.55, x: GATEX + 40, y: -300, z: 0.95 }, { t: T, x: GATEX + 40, y: -300, z: 1.02 },                       // ending
];
const cam = EN.camera(KEYS, {
  breath: t => (t < 3.3 ? 0 : 1) * (1 - 0.7 * seg(t, 16.3, 16.8) * (1 - seg(t, 24.0, 24.3))) * (1 - 0.85 * E.inOut(seg(t, 34.5, T))),
  shakes: [[15.32, 10], [23.0, 8]],
});

// ---------- background: colour script ----------
const BG = [[0, A2.cream], [3.3, 'sky'], [5.25, A2.cream, 'circle', 0.35, [510, 800]], [w.overbooking, C.yellow, 'circle', 0.32, [795, 1067]],
  [10.5, A2.cream, 'circle', 0.35, [510, 820]], [13.9, C.yellow, 'left', 0.3], [15.32, C.red, 'circle', 0.35, [510, 820]], [24.45, '#141414', 'circle', 0.4, [510, 800]], [31.0, 'split']];
function sky(ctx, t, c) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A2.sky1); g.addColorStop(1, A2.sky2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); applyCam(ctx, c, A, 0.35); LIGHT.elev = 0.5;
  for (let i = 0; i < 6; i++) { const x = MAPX * 0.35 + ((-900 + i * 420 - t * 140) % 2520 + 2520) % 2520 - 1260, y = -700 + hash(i * 5) * 1300; ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(x, y); cloud(ctx, 0.9 + hash(i) * 0.8); ctx.restore(); }
  ctx.restore(); LIGHT.elev = 1;
}
function split(ctx, t) { // ending: your flight (cream) | the offer (yellow), torn seam
  ctx.fillStyle = A2.cream; ctx.fillRect(0, 0, W, H);
  const u = E.out5(p(t, 31.0, 31.45)), x0 = lerp(W + 60, 540, u);
  const seam = () => { ctx.beginPath(); ctx.moveTo(x0, -20); for (let i = 0; i <= 40; i++) ctx.lineTo(x0 + (hash(i * 3 + 1) - 0.5) * 22, -20 + i * 50); ctx.lineTo(W + 80, H + 20); ctx.lineTo(W + 80, -20); ctx.closePath(); };
  ctx.save(); ctx.shadowColor = 'rgba(60,40,20,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = -10; seam(); ctx.fillStyle = C.yellow; ctx.fill(); ctx.restore();
  ctx.save(); seam(); ctx.lineWidth = 10; ctx.strokeStyle = '#FFFDF8'; ctx.stroke(); ctx.restore();
}
function fillBg(ctx, col, t, c) { if (col === 'sky') sky(ctx, t, c); else if (col === 'split') split(ctx, t); else { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); } }
function background(ctx, t, c) {
  let i = 0; for (let j = 0; j < BG.length; j++) if (t >= BG[j][0]) i = j;
  const [t0, col, wipe, d, o] = BG[i], u = wipe ? E.inOut(seg(t, t0, t0 + d)) : 1;
  if (col === 'split') { if (t < 31.45) fillBg(ctx, BG[i - 1][1], t, c); split(ctx, t); return; }
  if (u < 1 && i > 0) fillBg(ctx, BG[i - 1][1], t, c);
  ctx.save();
  if (u < 1) { ctx.beginPath(); if (wipe === 'circle') ctx.arc(o[0], o[1], Math.max(1, u * 2300), 0, 7); else if (wipe === 'left') ctx.rect(W * (1 - u), 0, W * u, H); else ctx.rect(0, 0, W, u * H); ctx.clip(); }
  fillBg(ctx, col, t, c); ctx.restore();
}

// ================= S1 HOOK: CONFIRMED -> NO SEAT?! -> freeze -> tear =================
const pageC = createCanvas(W, H), pX = pageC.getContext('2d');
const TEARL = []; for (let i = 0; i <= 34; i++) TEARL.push([510 + (hash(i * 13 + 2) - 0.5) * 70 + (i % 2 ? 14 : -14), -60 + i * 60]);
function hook(ctx, t) {
  if (t > TEAR + 0.7) return;
  pX.setTransform(1, 0, 0, 1, 0, 0); pX.fillStyle = A2.cream; pX.fillRect(0, 0, W, H);
  const settle = E.out(p(t, 0, 0.25)), punch = t > IMPACT ? (1 - spring(t - IMPACT, 3, 9)) : 0, z = (1 + 0.06 * (1 - settle)) * (1 + 0.1 * clamp(punch, -1, 1) + 0.06 * p(t, IMPACT, IMPACT + 0.12));
  const sh = t > IMPACT && t < IMPACT + 0.45 ? Math.exp(-(t - IMPACT) * 12) * Math.sin((t - IMPACT) * 90) * 22 : 0;
  pX.save(); pX.translate(510 + sh * 0.4, 820 + sh); pX.scale(z, z); pX.translate(-510, -820);
  pX.translate(510, 760); pX.rotate(lerp(0.05, -0.02, settle)); pX.scale(0.92, 0.92);
  ticket(pX, { bg: A2.cream, seat: '14C' });
  stamp(pX, 'CONFIRMED', 10, 150, 0.72, p(t, 0.1, 0.24), 0.1, GREEN);
  stamp(pX, 'NO SEAT?!', 0, 20, 1.08, p(t, IMPACT - 0.04, IMPACT + 0.08), -0.2, C.red);
  pX.restore();
  if (t > IMPACT && t < IMPACT + 0.2) { pX.save(); pX.globalAlpha = 0.35 * (1 - p(t, IMPACT, IMPACT + 0.2)); pX.fillStyle = '#FFFFFF'; pX.fillRect(0, 0, W, H); pX.restore(); } // impact flash
  const crack = p(t, TEAR - 0.3, TEAR), tear = p(t, TEAR, TEAR + 0.6);
  if (tear <= 0) {
    ctx.drawImage(pageC, 0, 0);
    if (crack > 0) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); const n = Math.floor(crack * 8); for (let i = 0; i <= n; i++) i ? ctx.lineTo(TEARL[i][0], TEARL[i][1]) : ctx.moveTo(TEARL[i][0], TEARL[i][1]); ctx.stroke(); ctx.restore(); }
    return;
  }
  const half = (side, k) => { const m = E.in(k), dx = side * m * 820, rot = side * m * 0.16;
    ctx.save(); ctx.translate(510 + dx, 960 + m * 120); ctx.rotate(rot); ctx.translate(-510, -960);
    const poly = () => { ctx.beginPath(); ctx.moveTo(side < 0 ? -40 : W + 40, -60); TEARL.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(side < 0 ? -40 : W + 40, H + 60); ctx.closePath(); };
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = side * 12; poly(); ctx.fillStyle = A2.cream; ctx.fill(); ctx.restore();
    ctx.save(); poly(); ctx.clip(); ctx.drawImage(pageC, 0, 0); ctx.lineWidth = 16; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath(); TEARL.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.restore();
    ctx.restore(); };
  for (const side of [-1, 1]) { for (let g = 2; g >= 1; g--) { ctx.save(); ctx.globalAlpha = 0.25; half(side, clamp(tear - g * 0.06)); ctx.restore(); } half(side, tear); }
}

// ================= S2 HOW IT WORKS: the plane turns into a seat map; 100 seats, 101 tickets =================
const FILLT = r => 6.32 + Math.floor(r / 4) * 0.25 + (r % 4) * 0.04;    // 4 rows per eighth note
const XT = 7.45;                                                         // the extra ticket
function planeAndMap(ctx, t) {
  const turn = E.inOut(p(t, 4.9, 5.7)), out = E.inOut(p(t, 10.35, 10.6));
  if (turn < 0.5) { // side view, rotating nose-up and turning its belly to the camera
    const u = turn * 2; ctx.save(); ctx.translate(MAPC[0], MAPC[1] + (t < 4.9 ? Math.sin(t * 2.2) * 8 : 0)); ctx.rotate(-Math.PI / 2 * u); ctx.scale(lerp(1, 0.6, u), lerp(1, 0.6, u) * (1 - u * 0.92)); airliner(ctx); ctx.restore();
    return;
  }
  const u = (turn - 0.5) * 2;
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(MAPC[0], MAPC[1]); ctx.scale(MAPS * lerp(0.08, 1, E.back(u, 1.2)), MAPS); planeTop(ctx);
  for (let i = 0; i < 100; i++) { const [x, y] = seatPos(i), r = Math.floor(i / 5), a = p(t, 5.6 + r * 0.025, 5.8 + r * 0.025); if (a <= 0) continue;
    const f = p(t, FILLT(r), FILLT(r) + 0.12); ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(1 + Math.sin(f * Math.PI) * 0.35, 1 + Math.sin(f * Math.PI) * 0.35); smallSeat(ctx, 0, 0, f > 0.5); ctx.restore(); }
  ctx.restore();
  // ticket 101: flies in, finds no seat, bounces off and turns red
  const k = p(t, XT, XT + 0.6); if (k > 0) {
    const tx = k < 0.55 ? lerp(MAPX + 620, MAPX + 30, E.out(k / 0.55)) : lerp(MAPX + 30, EXTRA[0], E.out((k - 0.55) / 0.45)), ty = k < 0.55 ? lerp(-900, -200, E.out(k / 0.55)) : lerp(-200, EXTRA[1], E.inOut((k - 0.55) / 0.45)) - Math.sin(((k - 0.55) / 0.45) * Math.PI) * 140 * (k > 0.55 ? 1 : 0);
    const red = t > w.seats, pulse = red ? 1 + Math.sin((t - w.seats) * 7) * 0.05 : 1;
    ctx.save(); ctx.globalAlpha = 1 - out; miniTicket(ctx, tx, ty + (k >= 1 ? Math.sin(t * 5) * 6 : 0), 2.4 * pulse, (1 - k) * 1.4 - 0.12, red ? C.red : null); ctx.restore();
  }
  tag(ctx, 'ILLUSTRATIVE EXAMPLE', MAPX - 300, 330, { u: p(t, 6.0, 6.35) * (1 - out), size: 30, bg: C.ink, tape: false, rot: -0.02 });
}
function counters(ctx, t) {
  const out = E.inOut(p(t, 10.3, 10.55)); if (t < 5.8 || out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.textAlign = 'center';
  const s1 = p(t, 5.85, 6.3); if (s1 > 0) { ctx.font = `150px ${F.black}`; ctx.fillStyle = C.ink; ctx.fillText(String(Math.round(100 * E.out(s1))), 205, 520 + (1 - E.out5(s1)) * 60); ctx.font = `44px ${F.xb}`; ctx.fillText('SEATS', 205, 575); }
  if (t > 6.3) { let n = 0; for (let r = 0; r < 20; r++) if (t > FILLT(r) + 0.06) n += 5; if (t > w.seats) n = 101;
    const k = t > w.seats ? 1 + (1 - spring(t - w.seats, 3, 7)) * 0.2 : 1; ctx.save(); ctx.translate(815, 520); ctx.scale(k, k);
    ctx.font = `150px ${F.black}`; ctx.fillStyle = n > 100 ? C.red : C.ink; ctx.fillText(String(n), 0, 0); ctx.restore(); ctx.font = `44px ${F.xb}`; ctx.fillStyle = C.ink; ctx.fillText('TICKETS', 815, 575); }
  const ou = p(t, w.overbooking - 0.05, w.overbooking + 0.3);
  if (ou > 0) { ctx.font = `104px ${F.black}`; ctx.beginPath(); ctx.rect(0, 250, W, 125); ctx.clip(); ctx.fillStyle = C.ink; ctx.fillText('OVERBOOKING', A[0], 350 + (1 - E.out5(ou)) * 125); }
  ctx.restore();
}

// ================= S3 THE GAMBLE: 3 passengers, 2 seats; no-shows today, everyone on the next flight =================
function seated(ctx, x, i, s) { personFront(ctx, x, SEATY - 120 + 150 * s, s, i, { pass: 0 }); }
function flightSet(ctx, t, ox, two) {
  const enter = two ? w.everyone - 0.15 : 10.7, sitT = two ? [14.6, 14.82, null] : [null, null, 12.9];
  const seatOf = two ? [0, 1, null] : [null, null, 1];
  SEATX.forEach((sx, j) => { const empty = !two && j === 0 ? p(t, 13.3, 13.6) : 0; seatFront(ctx, ox + sx, SEATY, 1.0, { empty }); });
  const occupied = [false, false];
  for (let i = 0; i < 3; i++) {
    const ent = E.back(p(t, enter + i * 0.08, enter + 0.35 + i * 0.08), 1.6); if (ent <= 0) continue;
    const ghost = !two && i < 2 ? E.inOut(p(t, w.showing + 0.03 + i * 0.12, w.showing + 0.43 + i * 0.12)) : 0;
    const st = sitT[i], hop = st ? E.inOut(p(t, st, st + 0.4)) : 0, x0 = ox + PX[i], y0 = PFY + (1 - ent) * 500;
    if (hop >= 1) { seated(ctx, ox + SEATX[seatOf[i]], WHO[i], PS); occupied[seatOf[i]] = true; continue; }
    const x = lerp(x0, ox + (st ? SEATX[seatOf[i]] : PX[i]), hop), y = lerp(y0, SEATY - 120 + 150 * PS, hop) - Math.sin(hop * Math.PI) * 160;
    contact(ctx, x, y + 6, 90, 18, 0.25 * (1 - ghost) * (1 - hop));
    const raise = two && i === 2 && t > 15.0;
    personFront(ctx, x, y, PS, WHO[i], { ghost, pass: 1 - ghost * 0.65, arm: raise ? 'up' : null });
    if (raise) { const k = E.back(p(t, 15.0, 15.3), 2); ctx.save(); ctx.translate(x + 67 * PS, y - 470 * PS - 40); ctx.rotate(0.12); ctx.scale(0.17 * k, 0.17 * k); ticket(ctx, { bg: C.yellow }); ctx.restore(); }
  }
  SEATX.forEach((sx, j) => { if (occupied[j]) seatFront(ctx, ox + sx, SEATY, 1.0, { front: true }); });
}
function gamble(ctx, t) {
  if (t < 14.4) flightSet(ctx, t, GAMX, false);
  if (t > 13.7) flightSet(ctx, t, GAMX + SET2, true);
  tag(ctx, 'NO-SHOWS', GAMX - 160, -330, { u: p(t, w.showing + 0.45, w.showing + 0.8) * (1 - p(t, 13.85, 14.0)), size: 56, bg: C.ink, rot: -0.04 });
  tag(ctx, 'NEXT FLIGHT', GAMX + SET2 - 250, -610, { u: p(t, 14.05, 14.4) * (1 - p(t, 15.25, 15.4)), size: 40, bg: C.ink, tape: false, rot: -0.03 });
  if (t > 15.3 && t < 16.4) stamp(ctx, 'OVERBOOKED', GAMX + SET2, -180, 0.7, p(t, 15.28, 15.4), -0.12, C.ink);
}

// ================= S4 VOLUNTEERS: board, offer, one volunteer moves to a later flight, then denied boarding =================
function gate(ctx, t) {
  const out = E.inOut(p(t, 24.3, 24.7)); if (out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out;
  const fly = E.inOut(p(t, w.later - 0.1, w.later + 0.5));
  ctx.save(); ctx.translate(GATEX, -720); ctx.scale(0.9, 0.9); board2(ctx, t, { flip: 16.4, later: p(t, w.later + 0.3, w.later + 0.6) }); ctx.restore();
  tag(ctx, 'TAKE A LATER FLIGHT?', GATEX, -410, { u: p(t, w.ask - 0.05, w.ask + 0.3), size: 54, bg: A2.paper, fg: C.ink, rot: -0.03 });
  for (let i = 0; i < 3; i++) {
    const vol = i === 0, raise = vol && t > w.volunteers + 0.15, shake = !vol && t > w.enough && t < w.enough + 0.9 ? Math.sin((t - w.enough) * 30) * 8 * (1 - p(t, w.enough, w.enough + 0.9)) : 0, lift = i === 2 ? p(t, w.denied - 0.45, w.denied) : 0;
    contact(ctx, GQ[i], GY + 6, 80, 16, 0.25); personFront(ctx, GQ[i] + shake, GY, 1.0, WHO[i], { arm: raise ? 'up' : null, pass: lift > 0 || (vol && fly > 0) ? 0 : 1 });
  }
  if (fly > 0) { const hx = GQ[0] + 67, hy = GY - 470, x = lerp(hx, GATEX + 200, fly), y = lerp(hy, -720 + 238 * 0.9, fly) - Math.sin(fly * Math.PI) * 220;
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - fly) * 0.6); ctx.scale(lerp(0.14, 0.09, fly), lerp(0.14, 0.09, fly)); ticket(ctx, { bg: '#121212' }); ctx.restore();
    if (fly >= 1) check(ctx, GQ[0], GY - 560, 0.45, p(t, w.later + 0.5, w.later + 0.8)); }
  ctx.restore();
}
function deniedPass(ctx, t) { // lifts out of passenger #3's hand, stamped, becomes money, then lands on the stack
  const lift = E.inOut(p(t, w.denied - 0.45, w.denied)); if (lift <= 0 || t > 31.6) return;
  const hx = GQ[2] + 76, hy = GY - 170, s = lerp(0.11, PASS_S, lift), morph = p(t, 28.75, 29.1), toStack = E.inOut(p(t, 31.0, 31.5));
  const x = lerp(lerp(hx, PASS_C[0], lift), ENDM[0], toStack), y = lerp(lerp(hy, PASS_C[1], lift), ENDM[1] - 230, toStack), sc = lerp(s, 0.22, toStack);
  ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0.12, 0, lift) + toStack * 1.57); ctx.scale(sc, sc);
  ticket(ctx, { bg: t < 24.6 ? C.red : '#141414', denied: p(t, w.denied + 0.05, w.denied + 0.2) * (1 - p(t, 28.55, 28.8)), hi: p(t, w.qualifying + 0.05, w.qualifying + 0.8) * (1 - morph), toBill: morph, seat: '—' });
  ctx.restore();
  const fan = E.back(p(t, 29.1, 29.5), 1.6) * (1 - toStack); if (fan > 0) for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(PASS_C[0], PASS_C[1] + 140); ctx.rotate((i - 1.5) * 0.32 * fan); ctx.globalAlpha = clamp(fan * 2); bill(ctx, 0, -230, 3.0, 1.57); ctx.restore(); }
}
function ending(ctx, t) {
  if (t < 29.8) return;
  tag(ctx, 'ELIGIBILITY RULES APPLY', GATEX, -60, { u: p(t, 29.9, 30.2) * (1 - p(t, 30.9, 31.1)), size: 34, bg: A2.paper, fg: C.ink, tape: false });
  if (t > 31.0) {
    moneyStack(ctx, ENDM[0], ENDM[1], 1.25, 6, p(t, 31.1, 31.6));
    const sl = E.out5(p(t, 31.1, 31.55)); ctx.save(); ctx.translate(ENDT[0] - (1 - sl) * 1100, ENDT[1]); ctx.rotate(-0.05); ctx.scale(0.58, 0.58); ticket(ctx, { bg: A2.cream, seat: '14C' }); ctx.restore();
  }
}

// ---------- screen-space typography ----------
function maskText(ctx, txt, x, y, size, u, col, font = F.black) { if (u <= 0) return; ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.beginPath(); ctx.rect(0, y - size * 0.9, W, size * 1.12); ctx.clip(); ctx.fillStyle = col; ctx.fillText(txt, x, y + (1 - E.out5(u)) * size * 1.12); ctx.restore(); }
function overlay(ctx, t) {
  hook(ctx, t); counters(ctx, t);
  const out = p(t, 30.9, 31.15);
  if (t > w.cash - 0.1 && out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; maskText(ctx, 'CASH', A[0], 410, 190, p(t, w.cash - 0.05, w.cash + 0.3), '#FFFFFF'); maskText(ctx, 'COMPENSATION', A[0], 480, 76, p(t, w.cash + 0.2, w.cash + 0.55), C.yellow); ctx.restore(); }
  if (t > 31.3) {
    maskText(ctx, 'YOUR FLIGHT', 270, 492, 50, p(t, 31.4, 31.75), C.ink);
    const k = t > w.five + 0.3 ? 1 + (1 - spring(t - w.five - 0.3, 2.5, 6)) * 0.08 : 1;
    ctx.save(); ctx.translate(780, 0); ctx.scale(k, 1); ctx.translate(-780, 0); maskText(ctx, '$500', 780, 730, 160, p(t, w.five - 0.05, w.five + 0.3), C.ink); ctx.restore();
    maskText(ctx, 'HYPOTHETICAL OFFER', 780, 786, 30, p(t, w.five + 0.35, w.five + 0.7), '#3D3D3D', F.xb);
    const q = p(t, 34.95, 35.35); maskText(ctx, 'WOULD YOU TAKE IT?', A[0], 360, 84, q, C.ink);
    const s = E.inOut(p(t, 35.2, 35.55)); ctx.fillStyle = C.red; ctx.fillRect(A[0] - 410 * s, 384, 820 * s, 12);
  }
}

// subtitles: no one-word tails, no dangling "to/a/the/for/from" at the end of a group
function tidySubs(G) {
  const SMALL = ['to', 'a', 'the', 'for', 'from', 'of'];
  for (let i = 0; i < G.length - 1; i++) { const g = G[i], n = G[i + 1];
    if (n.id === g.id && SMALL.includes(g.words[g.words.length - 1].w.toLowerCase())) { n.words.unshift(g.words.pop()); n.t0 = n.words[0].t0 - 0.05; g.t1 = n.t0; } }
  for (let i = G.length - 1; i > 0; i--) { const g = G[i], pr = G[i - 1];
    if (g.words.length === 1 && pr.id === g.id) { pr.words.push(...g.words); pr.t1 = g.t1; G.splice(i, 1); } }
  G.forEach(g => { g.text = g.words.map(x => x.w).join(' ').replace(/five hundred dollars/i, '$500'); });
  return G;
}

const ep = {
  T, cam, background, overlay,
  world(ctx, t) {
    if (t > 3.2 && t < 10.7) planeAndMap(ctx, t);
    if (t > 10.3 && t < 16.4) gamble(ctx, t);
    if (t > 15.8 && t < 24.8) gate(ctx, t);
    deniedPass(ctx, t); ending(ctx, t);
  },
  fg: [ // parallax only on the camera move into the seat map
    { t0: 3.3, t1: 5.2, tr: 3.6, x: 140, y: 420, k: 'cloud', s: 1.5, rot: 0, par: 1.7, blur: 4, a: 0.95 },
    { t0: 3.3, t1: 5.2, tr: 3.6, x: 930, y: 1150, k: 'cloud', s: 1.2, rot: 0, par: 1.9, blur: 6, a: 0.9 },
  ],
  subs: tidySubs(EN.subtitleGroups(V, Object.keys(ST), { max: 6 })),
  subStyle: { y: 1425, size: 64, maxW: 800, highlight: ['confirmed', 'seat', 'legally', 'overbooking', 'everyone', 'volunteers', 'denied', 'involuntarily', 'cash', '$500'] },
  vo: Object.entries(ST),
  music: { b0: 0.32, impact: IMPACT, tear: TEAR, gamble: 11.32, overbooked: 15.32, reveal: 24.32, cash: 29.32, quiet: 32.32, last: 34.95, end: T },
  cues() {
    const c = [['snap', 0.0], ['stamp', 0.12, 0.45], ['stamp', IMPACT, 1], ['slam', IMPACT, 0.6], ['scratch', TEAR - 0.3], ['tear', TEAR - 0.05], ['whoosh', TEAR + 0.1, 0.5]];
    c.push(['paper', 4.9], ['unfold', 5.35], ['tick', 5.65], ['tick', 5.85]);
    for (let g = 0; g < 5; g++) c.push(['pop', 6.32 + g * 0.25]);
    c.push(['pop', XT], ['stamp', w.seats, 0.5], ['slam', w.overbooking, 0.45]);
    c.push(['whoosh', 10.42, 0.6], ['pop', 10.75], ['scratch', w.showing + 0.05], ['tag', w.showing + 0.45], ['pop', 13.15], ['whoosh', 13.88, 0.5], ['tag', 14.05], ['pop', w.everyone], ['pop', 14.82], ['pop', 15.04]);
    c.push(['boom', 15.32], ['stamp', 15.3, 0.6], ['whoosh', 15.95, 0.6], ['flap', 16.4], ['tag', w.ask], ['pop', w.volunteers + 0.15], ['whoosh', w.later - 0.1, 0.4], ['tag', w.later + 0.5]);
    c.push(['rise', w.denied - 0.45], ['stamp', w.denied + 0.05], ['zoom', 24.3, 0.8], ['scratch', w.qualifying + 0.05], ['paper', 28.75], ['kaching', 29.32], ['slam', w.cash, 0.4], ['tag', 29.9]);
    c.push(['whoosh', 31.0, 0.5], ['coins', 31.4], ['tag', 31.4], ['slam', w.five, 0.35], ['tag', w.five + 0.35], ['tag', 34.95, 0.6]);
    return c;
  },
};
// this cut writes its own cue file so the first cut's files stay untouched
if (process.argv[2] === 'cues') { fs.writeFileSync(`${__dirname}/cues_final.json`, JSON.stringify({ T, vo: ep.vo, sfx: ep.cues(), music: ep.music })); console.log('cues ok'); }
else EN.cli(ep, __dirname);
module.exports = ep;
