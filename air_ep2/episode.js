// "Why Airlines Sell Seats They Don't Have" — episode 2, Bold Editorial Collage (1080x1920, 30 fps).
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues
// Engine and base kit are shared with episode 1 (mcd_ep1/engine.js, tests/mcd_collage/kit.js) and are not modified.
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const AK = require('./airkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, contact, applyCam, tag, bill, coin, cloud, sparkle, LIGHT } = K;
const { A2, ticket, stamp, airliner, personTop, personFront, miniTicket, CAB, cabinShell, seatTop, seatPos, planeTop, smallSeat, board, moneyStack, check } = AK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { a01: 0.3, a02: 1.7, a03: 3.35, a04: 6.7, a05: 8.25, a06: 9.85, a07: 11.35, a08: 15.2, a09: 18.0, a10: 19.85, a11: 23.55, a12: 27.45, a13: 31.5, a14: 33.4, a15: 38.7 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 43.6;
const w = { seats: at('a07', 'seats'), tickets: at('a07', 'tickets'), wont: at('a08', "won't"), works: at('a09', 'works'), everyone: at('a10', 'everyone'),
  volunteers: at('a11', 'volunteers'), denied: at('a12', 'denied'), qualifying: at('a14', 'qualifying'), cash: at('a14', 'cash'), how: at('a15', 'how') };

// ---------- world regions ----------
const CABX = 5000, MAPX = 10000, ROWX = 15000, GATEX = 20000;
const MAPC = [MAPX, -60], MAPS = 0.78;                       // seat map position / scale
const EXTRA = [MAPX + 300, 250];                            // the 101st ticket's landing spot
const STAND = [CABX, 470];                                   // the passenger without a seat (cabin aisle)
const ROW = i => ROWX + (i - 4) * 190;                       // gate queue (S4)
const GQ = i => GATEX + (i - 2) * 180, GY = 120;             // passengers at the gate (S5)
const PASS_S = 0.45, PASS_C = [GATEX, -330];                 // the boarding pass that gets denied, then becomes money
const S7T = [GATEX - 170, -330], S7M = [GATEX + 250, -20];   // ending: repaired ticket + money stack

// ---------- camera (motion blur comes from the engine on fast moves only) ----------
const KEYS = [
  { t: 2.4, x: 0, y: 0, z: 0.62 }, { t: 3.55, x: 0, y: -12, z: 0.66 }, { t: 4.55, x: 0, y: -30, z: 50, e: 'in' },                         // S2 plane -> into a window
  { t: 4.5501, x: CABX - 520, y: -200, z: 5 }, { t: 5.15, x: CABX, y: 80, z: 0.98, e: 'out5' }, { t: 7.2, x: CABX, y: 80, z: 1.0 },        // cabin reveal
  { t: 8.6, x: CABX, y: 330, z: 1.45 }, { t: 9.35, x: CABX, y: 335, z: 1.5 },                                                             // comedic push to the standing passenger
  { t: 9.75, x: MAPX, y: 0, z: 0.95, e: 'inOut5' }, { t: 13.3, x: MAPX, y: -6, z: 0.98 }, { t: 14.9, x: MAPX + 60, y: 40, z: 1.04 },  // S3 calm explanation
  { t: 15.25, x: ROWX - 300, y: -287, z: 1.15, e: 'inOut5' }, { t: 19.8, x: ROWX + 200, y: -287, z: 1.15, e: 'lin' }, { t: 20.9, x: ROWX + 180, y: -290, z: 1.12 },
  { t: 21.45, x: ROWX, y: -330, z: 0.55, e: 'out5' }, { t: 22.3, x: ROWX, y: -334, z: 0.57 },                                              // S4 track, then everyone arrives -> pull back
  { t: 22.68, x: GATEX, y: -700, z: 1.0, e: 'inOut5' }, { t: 24.3, x: GATEX, y: -700, z: 1.03 }, { t: 25.1, x: GATEX, y: -330, z: 0.78 },  // S5 board -> tilt down to the gate
  { t: 29.4, x: GATEX, y: -320, z: 0.8 }, { t: 31.3, x: GATEX, y: -330, z: 0.84 },
  { t: 32.1, x: GATEX, y: -330, z: 1.8, e: 'inOut5' }, { t: 36.2, x: GATEX, y: -330, z: 1.86 }, { t: 36.9, x: GATEX, y: -300, z: 1.2, e: 'out5' }, // S6 push into the pass, pull back on the money
  { t: 38.0, x: GATEX, y: -300, z: 1.2 }, { t: 38.6, x: GATEX + 40, y: -300, z: 0.95 }, { t: T, x: GATEX + 30, y: -300, z: 1.05 },        // S7 slow push-in
];
const cam = EN.camera(KEYS, {
  breath: t => (t < 2.4 ? 0 : 1) * (1 - 0.7 * seg(t, 9.8, 10.2) * (1 - seg(t, 14.6, 14.9))) * (1 - 0.75 * E.inOut(seg(t, 41.5, T))),
  shakes: [[23.55, 10], [29.95, 8]],
});

// ---------- background: meaningful colour changes with wipes ----------
const BG = [ // [t, colour, wipe, duration, origin]
  [0, A2.cream], [2.4, 'sky'], [4.55, A2.navy], [9.42, A2.cream, 'circle', 0.35, [510, 820]], [13.42, C.yellow, 'circle', 0.32, [795, 1058]],
  [22.4, '#121212', 'down', 0.3], [23.55, C.red, 'circle', 0.35, [510, 900]], [31.7, A2.cream, 'circle', 0.4, [510, 800]],
];
function sky(ctx, t, c) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, A2.sky1); g.addColorStop(1, A2.sky2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); applyCam(ctx, c, A, 0.35); LIGHT.elev = 0.5;
  for (let i = 0; i < 6; i++) { const x = ((-900 + i * 420 - t * 140) % 2520 + 2520) % 2520 - 1260, y = -700 + hash(i * 5) * 1300; ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(x, y); cloud(ctx, 0.9 + hash(i) * 0.8); ctx.restore(); }
  ctx.restore(); LIGHT.elev = 1;
}
function fillBg(ctx, col, t, c) { if (col === 'sky') sky(ctx, t, c); else { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); } }
function background(ctx, t, c) {
  let i = 0; for (let j = 0; j < BG.length; j++) if (t >= BG[j][0]) i = j;
  const [t0, col, wipe, d, o] = BG[i], u = wipe ? E.inOut(seg(t, t0, t0 + d)) : 1;
  if (u < 1 && i > 0) fillBg(ctx, BG[i - 1][1], t, c);
  ctx.save();
  if (u < 1) { ctx.beginPath(); if (wipe === 'circle') ctx.arc(o[0], o[1], Math.max(1, u * 2300), 0, 7); else ctx.rect(0, 0, W, u * H); ctx.clip(); }
  fillBg(ctx, col, t, c); ctx.restore();
}

// ================= S1 HOOK (screen space): ticket, stamp, punch-in, the page tears open =================
const pageC = createCanvas(W, H), pX = pageC.getContext('2d');
const TEAR = []; for (let i = 0; i <= 34; i++) TEAR.push([510 + (hash(i * 13 + 2) - 0.5) * 70 + (i % 2 ? 14 : -14), -60 + i * 60]);
function hook(ctx, t) {
  if (t > 3.3) return;
  pX.setTransform(1, 0, 0, 1, 0, 0); pX.fillStyle = A2.cream; pX.fillRect(0, 0, W, H);
  const settle = E.out(p(t, 0, 0.32)), punch = E.out5(p(t, 1.7, 1.95)), z = (1 + 0.1 * (1 - settle)) * (1 + 0.32 * punch);
  const sh = t > 0.55 && t < 1.0 ? Math.exp(-(t - 0.55) * 10) * Math.sin((t - 0.55) * 80) * 18 : 0;
  const fx = 510, fy = 820 + 40 * punch; // punch-in moves towards the stamp
  pX.save(); pX.translate(fx + sh * 0.4, fy + sh); pX.scale(z, z); pX.translate(-510, -820);
  pX.translate(510, 760); pX.rotate(lerp(0.07, -0.03, settle)); pX.scale(0.92, 0.92);
  ticket(pX, { bg: A2.cream, stamp: p(t, 0.55, 0.7) });
  pX.restore();
  // crack starts, then the page tears in two halves
  const crack = p(t, 2.25, 2.55), tear = p(t, 2.55, 3.15);
  if (tear <= 0) {
    ctx.drawImage(pageC, 0, 0);
    if (crack > 0) { ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); const n = Math.floor(crack * 8); for (let i = 0; i <= n; i++) i ? ctx.lineTo(TEAR[i][0], TEAR[i][1]) : ctx.moveTo(TEAR[i][0], TEAR[i][1]); ctx.stroke(); ctx.restore(); }
    return;
  }
  const half = (side, k) => { const m = E.in(k), dx = side * m * 820, rot = side * m * 0.16;
    ctx.save(); ctx.translate(510 + dx, 960 + m * 120); ctx.rotate(rot); ctx.translate(-510, -960);
    const poly = () => { ctx.beginPath(); ctx.moveTo(side < 0 ? -40 : W + 40, -60); TEAR.forEach(q => ctx.lineTo(q[0], q[1])); ctx.lineTo(side < 0 ? -40 : W + 40, H + 60); ctx.closePath(); };
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = side * 12; poly(); ctx.fillStyle = A2.cream; ctx.fill(); ctx.restore();
    ctx.save(); poly(); ctx.clip(); ctx.drawImage(pageC, 0, 0); ctx.lineWidth = 16; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath(); TEAR.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.restore();
    ctx.restore(); };
  for (const side of [-1, 1]) { for (let g = 2; g >= 1; g--) { ctx.save(); ctx.globalAlpha = 0.25; half(side, clamp(tear - g * 0.06)); ctx.restore(); } half(side, tear); }
}

// ================= S2 AIRPLANE + CABIN =================
const ROWT = r => 4.8 + r * 0.25;                       // one row per eighth note
function cabin(ctx, t) {
  ctx.save(); ctx.translate(CABX, 0); cabinShell(ctx);
  const arrive = p(t, 6.75, 7.5), sx = 0, sy = STAND[1] + (1 - E.out(arrive)) * 420 + Math.abs(Math.sin(arrive * Math.PI * 5)) * -10 * (1 - arrive);
  for (let r = 0; r < CAB.rows; r++) CAB.cols.forEach((x, ci) => {
    const y = CAB.y0 + r * CAB.dy; seatTop(ctx, x, y);
    const u = p(t, ROWT(r) + ci * 0.02, ROWT(r) + ci * 0.02 + 0.3); if (u <= 0) return;
    const turn = E.inOut(p(t, 7.85 + r * 0.03, 8.2 + r * 0.03)), ang = Math.atan2(sx - x, -(sy - y)), look = turn * ang / 0.8;
    personTop(ctx, x, y - 4 - (1 - E.out(u)) * 30, lerp(1.6, 1, E.back(u, 2)), r * 4 + ci, look);
  });
  if (arrive > 0) { // the one passenger left standing
    contact(ctx, sx, sy + 34, 60, 18, 0.35);
    const look = t > 7.55 && t < 8.3 ? Math.sin((t - 7.55) * 9) * 0.9 : 0, shrug = t > w.seats ? 0 : (t > 8.6 && t < 9.2 ? Math.sin((t - 8.6) * 12) * 0.08 : 0);
    personTop(ctx, sx, sy, 1.12 * (1 + shrug), 7, look);
    const qu = E.back(p(t, 7.7, 8.0), 2.4) * (1 - p(t, 9.1, 9.3));
    if (qu > 0) { ctx.save(); ctx.translate(sx + 92, sy - 92); ctx.scale(qu, qu); cut(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 48, 0, 7); }, A2.paper, { sb: 14, sy: 6 });
      ctx.fillStyle = C.red; ctx.font = `66px ${F.black}`; ctx.textAlign = 'center'; ctx.fillText('?', 0, 24); ctx.restore(); }
  }
  ctx.restore();
}

// ================= S3 THE SECRET: 100 seats, 101 tickets =================
const TK = []; for (let i = 0; i < 101; i++) TK.push({ i, t: 11.45 + i * 0.016 + (i === 100 ? 0.0 : 0) });
const TFLY = 0.36;
function seatMap(ctx, t) {
  const drop = E.back(p(t, 9.7, 10.15), 1.3), out = E.inOut(p(t, 14.9, 15.2)); if (drop <= 0) return;
  ctx.save(); ctx.translate(MAPC[0], MAPC[1] + (1 - drop) * 300); ctx.scale(MAPS, MAPS); ctx.globalAlpha = clamp(drop * 2) * (1 - out);
  planeTop(ctx);
  for (let i = 0; i < 100; i++) { const [x, y] = seatPos(i), a = p(t, 9.95 + Math.floor(i / 5) * 0.035, 10.15 + Math.floor(i / 5) * 0.035); if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha *= a; smallSeat(ctx, x, y, t > TK[i].t + TFLY); ctx.restore(); }
  ctx.restore();
  // tickets fly in from the top-right; the 101st finds no seat
  for (const k of TK) {
    const u = (t - k.t) / TFLY; if (u <= 0) continue;
    if (k.i < 100) { if (u >= 1) continue; const [sx2, sy2] = seatPos(k.i), tx = MAPC[0] + sx2 * MAPS, ty = MAPC[1] + sy2 * MAPS, e = E.inOut(u);
      miniTicket(ctx, lerp(MAPX + 600, tx, e), lerp(-900, ty, e) - Math.sin(e * Math.PI) * 120, lerp(1.6, 0.6, e), (1 - e) * 1.2); continue; }
    const e = E.out(clamp(u)), bob = u > 1 ? Math.sin((t - k.t) * 5) * 8 : 0, pulse = u > 1 ? 1 + Math.sin((t - k.t) * 7) * 0.05 : 1;
    ctx.save(); ctx.globalAlpha = 1 - out; miniTicket(ctx, lerp(MAPX + 620, EXTRA[0], e), lerp(-950, EXTRA[1], e) + bob, 2.4 * pulse, (1 - e) * 1.6 - 0.12, C.red); ctx.restore();
  }
  tag(ctx, 'ILLUSTRATIVE EXAMPLE', MAPX - 300, 330, { u: p(t, 10.75, 11.1) * (1 - out), size: 30, bg: C.ink, tape: false, rot: -0.02 });
}
function counters(ctx, t) { // S3 big numbers (screen space, beside the plane body)
  const out = E.inOut(p(t, 14.35, 14.7)); if (t < 10.6 || out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out; ctx.textAlign = 'center';
  const s1 = p(t, 10.75, 11.25); if (s1 > 0) { ctx.font = `150px ${F.black}`; ctx.fillStyle = C.ink; ctx.fillText(String(Math.round(100 * E.out(s1))), 205, 520 + (1 - E.out5(s1)) * 60); ctx.font = `44px ${F.xb}`; ctx.fillText('SEATS', 205, 575); }
  const n = TK.filter(k => t > k.t + TFLY).length;
  if (t > 11.5) { ctx.font = `150px ${F.black}`; ctx.fillStyle = n > 100 ? C.red : C.ink; ctx.fillText(String(n), 815, 520); ctx.font = `44px ${F.xb}`; ctx.fillStyle = C.ink; ctx.fillText('TICKETS', 815, 575);
    if (n > 100) { const k = 1 - spring(t - TK[100].t - TFLY, 3, 7); ctx.save(); ctx.translate(815, 470); ctx.scale(1 + k * 0.25, 1 + k * 0.25); ctx.restore(); } }
  ctx.restore();
}

// ================= S4 THE BET: the queue, no-shows, then everyone =================
const NOSHOW = [2, 5];
function queue(ctx, t) {
  const back = E.inOut(p(t, w.everyone, w.everyone + 0.3)), out = E.inOut(p(t, 22.3, 22.6));
  for (let i = 0; i < 9; i++) {
    const ent = E.back(p(t, 14.95 + i * 0.05, 15.35 + i * 0.05), 1.4); if (ent <= 0) continue;
    const ghost = NOSHOW.includes(i) ? E.inOut(p(t, w.wont + 0.05, w.wont + 0.45)) * (1 - back) : 0;
    ctx.save(); ctx.globalAlpha = 1 - out; contact(ctx, ROW(i), 6, 80, 16, 0.25 * (1 - ghost));
    personFront(ctx, ROW(i), (1 - ent) * 500, 1.0, i, { ghost, pass: 1 - ghost * 0.65 }); ctx.restore();
  }
  for (let j = 0; j < 4; j++) { const u = E.out5(p(t, w.everyone + 0.15 + j * 0.08, w.everyone + 0.6 + j * 0.08)); if (u <= 0) continue; const side = j % 2 ? 1 : -1, x = ROWX + side * (950 + Math.floor(j / 2) * 190);
    ctx.save(); ctx.globalAlpha = 1 - out; personFront(ctx, x + side * (1 - u) * 900, 0, 1.0, 9 + j, { pass: 1 }); ctx.restore(); }
  const ns = p(t, w.wont + 0.35, w.wont + 0.7) * (1 - p(t, w.everyone - 0.2, w.everyone + 0.1));
  tag(ctx, 'NO-SHOWS', ROWX - 95, -560, { u: ns, size: 52, bg: C.ink, rot: -0.04 });
  check(ctx, ROWX + 300, -600, 0.9, p(t, w.works - 0.1, w.works + 0.3) * (1 - p(t, w.everyone - 0.2, w.everyone)));
}

// ================= S5 OVERBOOKED: board, red, volunteers, denied boarding =================
function gate(ctx, t) {
  const out = E.inOut(p(t, 31.3, 31.75)); if (out >= 1) return;
  ctx.save(); ctx.globalAlpha = 1 - out;
  ctx.save(); ctx.translate(GATEX, -700); ctx.scale(0.92, 0.92); board(ctx, t, { flip: 22.75 }); ctx.restore();
  for (let i = 0; i < 5; i++) {
    const vol = i === 0, raise = vol && t > 25.6, step = vol ? E.inOut(p(t, 26.3, 26.9)) : 0, lift = i === 3 ? p(t, 29.45, 29.95) : 0;
    const x = GQ(i) - step * 130 - (vol ? 0 : 0);
    contact(ctx, x, GY + 6, 80, 16, 0.25); personFront(ctx, x, GY, 1.0, [1, 3, 0, 4, 6][i], { arm: raise ? 'up' : null, pass: lift > 0 ? 0 : 1 });
  }
  tag(ctx, 'VOLUNTEERS?', GATEX - 110, -394, { u: p(t, w.volunteers - 0.05, w.volunteers + 0.3), size: 60, bg: A2.paper, fg: C.ink, rot: -0.03 });
  const mu = E.back(p(t, w.volunteers + 0.25, w.volunteers + 0.6), 2);
  if (mu > 0) { ctx.save(); ctx.translate(GATEX + 270, -394); ctx.scale(mu, mu); ctx.rotate(0.1); bill(ctx, 0, 0, 1.25, 0); coin(ctx, 52, -26, 26, 0.1); ctx.restore(); }
  ctx.restore();
}
function deniedPass(ctx, t) { // lifts out of passenger #3's hand, gets stamped, becomes the hero of S6/S7
  const lift = E.inOut(p(t, 29.45, 29.95)); if (lift <= 0 || t > 38.65) return;
  const hx = GQ(3) + 76 * 1.0, hy = GY - 170, s = lerp(0.11, PASS_S, lift);
  const morph = p(t, 36.2, 36.55), toStack = E.inOut(p(t, 38.0, 38.6));
  const x = lerp(lerp(hx, PASS_C[0], lift), S7M[0], toStack), y = lerp(lerp(hy, PASS_C[1], lift), S7M[1] - 230, toStack), sc = lerp(s, 0.22, toStack);
  ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0.12, 0, lift) + toStack * 1.57); ctx.scale(sc, sc);
  ticket(ctx, { bg: t < 31.9 ? C.red : A2.cream, denied: p(t, w.denied + 0.1, w.denied + 0.25) * (1 - p(t, 36.0, 36.25)), hi: p(t, w.qualifying + 0.05, w.qualifying + 0.9) * (1 - morph), toBill: morph, seat: '—' });
  ctx.restore();
  // fan of bills behind the money
  const fan = E.back(p(t, 36.6, 37.05), 1.6) * (1 - toStack); if (fan > 0) for (let i = 0; i < 4; i++) { const a = (i - 1.5) * 0.32 * fan; ctx.save(); ctx.translate(PASS_C[0], PASS_C[1] + 140); ctx.rotate(a); ctx.globalAlpha = clamp(fan * 2); bill(ctx, 0, -230, 3.0, 1.57); ctx.restore(); }
}
function money(ctx, t) {
  if (t < 36.5) return;
  const fade = 1 - p(t, 37.95, 38.25);
  tag(ctx, 'ELIGIBILITY RULES APPLY', GATEX, -60, { u: p(t, 37.3, 37.6) * fade, size: 34, bg: C.ink, tape: false });
  if (t > 38.0) { // ending: money stack + the original ticket, taped back together
    moneyStack(ctx, S7M[0], S7M[1], 1.0, 6, p(t, 38.1, 38.65));
    const sl = E.out5(p(t, 38.15, 38.65));
    ctx.save(); ctx.translate(S7T[0] - (1 - sl) * 1200, S7T[1]); ctx.rotate(-0.07); ctx.scale(0.62, 0.62);
    ticket(ctx, { bg: A2.cream, stamp: 1, tape: p(t, 38.55, 38.8) }); ctx.restore();
  }
}
function cashType(ctx, t) { // S6 headline
  const u1 = p(t, w.cash - 0.05, w.cash + 0.3), u2 = p(t, w.cash + 0.2, w.cash + 0.55), out = p(t, 37.95, 38.25); if (u1 <= 0 || out >= 1) return;
  const mask = (txt, y, size, u, col) => { ctx.save(); ctx.font = `${size}px ${F.black}`; ctx.textAlign = 'center'; ctx.beginPath(); ctx.rect(0, y - size * 0.9, W, size * 1.1); ctx.clip(); ctx.fillStyle = col; ctx.fillText(txt, A[0], y + (1 - E.out5(u)) * size * 1.1); ctx.restore(); };
  ctx.save(); ctx.globalAlpha = 1 - out; mask('CASH', 410, 190, u1, C.ink); mask('COMPENSATION', 480, 76, u2, C.red); ctx.restore();
}
function howMuch(ctx, t) {
  const u = p(t, w.how - 0.05, w.how + 0.35); if (u <= 0) return;
  ctx.save(); ctx.font = `140px ${F.black}`; ctx.textAlign = 'center'; ctx.beginPath(); ctx.rect(0, 260, W, 170); ctx.clip();
  const q = t > w.how + 0.35 ? 1 + (1 - spring(t - w.how - 0.35, 2.5, 6)) * 0.06 : 1;
  ctx.translate(A[0], 400 + (1 - E.out5(u)) * 190); ctx.scale(q, q); ctx.fillStyle = C.ink; ctx.fillText('HOW MUCH?', 0, 0); ctx.restore();
  const s = E.inOut(p(t, w.how + 0.2, w.how + 0.55)); ctx.fillStyle = C.red; ctx.fillRect(A[0] - 340 * s, 422, 680 * s, 14);
}

const ep = {
  T, cam, background,
  world(ctx, t) {
    if (t > 2.3 && t < 4.6) { ctx.save(); ctx.translate(0, t < 3.5 ? Math.sin(t * 2.2) * 8 : 0); airliner(ctx); ctx.restore(); }
    if (t > 4.5 && t < 9.8) cabin(ctx, t);
    if (t > 9.5 && t < 15.3) seatMap(ctx, t);
    if (t > 14.8 && t < 22.7) queue(ctx, t);
    if (t > 22.3 && t < 31.8) gate(ctx, t);
    deniedPass(ctx, t); money(ctx, t);
  },
  overlay(ctx, t) { hook(ctx, t); counters(ctx, t); cashType(ctx, t); howMuch(ctx, t); },
  fg: [ // parallax only where the camera travels: clouds rushing past on the push into the window, a bill in the final frame
    { t0: 2.4, t1: 4.5, tr: 3.0, x: 140, y: 420, k: 'cloud', s: 1.6, rot: 0, par: 1.7, blur: 4, a: 0.95 },
    { t0: 2.4, t1: 4.5, tr: 3.0, x: 940, y: 1180, k: 'cloud', s: 1.3, rot: 0, par: 1.9, blur: 6, a: 0.9 },
    { t0: 38.4, t1: 99, tr: 41, x: 985, y: 660, k: 'bill', s: 2.2, rot: 0.4, par: 1.6, blur: 8 },
  ],
  subs: EN.subtitleGroups(V, Object.keys(ST), { max: 6, replace: [[/U\.S\.,/, 'U.S.,']] }),
  subStyle: { y: 1350, size: 64, maxW: 800, highlight: ['ticket', 'gate', 'seat', 'more', 'tickets', 'betting', 'everyone', 'volunteers', 'denied', 'cash', 'compensation', 'how'] },
  vo: Object.entries(ST),
  music: { b0: 0.55, stop: 6.55, light: 9.55, groove2: 15.55, tension: 22.55, lift: 31.55, pause: 38.55, last: w.how, end: T },
  cues() {
    const c = [['snap', 0.0], ['stamp', 0.55], ['zoom', 1.7, 0.7], ['scratch', 2.25], ['tear', 2.5], ['whoosh', 2.6, 0.8]];
    c.push(['zoom', 3.75, 0.9], ['whoosh', 4.2, 0.9]);
    for (let r = 0; r < CAB.rows; r++) c.push(['pop', ROWT(r) + 0.05]);
    c.push(['tick', 7.0], ['tick', 7.35], ['tag', 7.75], ['wah', 8.65]);
    c.push(['whoosh', 9.38, 0.8], ['thump', 10.05, 0.4], ['tag', 10.75]);
    for (let i = 0; i < 100; i += 10) c.push(['tick', TK[i].t + TFLY]);
    c.push(['stamp', TK[100].t + TFLY, 0.6], ['pop', 13.42]);
    c.push(['whoosh', 14.95, 0.8], ['paper', 15.0], ['scratch', w.wont + 0.05], ['tag', w.wont + 0.4], ['tag', w.works]);
    c.push(['pop', w.everyone + 0.05], ['whoosh', w.everyone + 0.2, 0.6], ['zoom', 20.9, 0.9]);
    c.push(['whoosh', 22.35, 0.9], ['flap', 22.75], ['boom', 23.55], ['tag', w.volunteers], ['coins', w.volunteers + 0.3], ['pop', 25.6], ['rise', w.denied - 0.45], ['stamp', w.denied + 0.1]);
    c.push(['zoom', 31.35, 0.9], ['whoosh', 31.4, 0.6], ['scratch', w.qualifying + 0.05], ['paper', 36.2], ['kaching', 36.55], ['slam', w.cash, 0.5], ['tag', 37.3]);
    c.push(['whoosh', 38.05, 0.6], ['coins', 38.4], ['tape', 38.6], ['tag', w.how]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
