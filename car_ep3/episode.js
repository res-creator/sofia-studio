// "Your Car Was Reporting On You" — episode 3, Bold Editorial Collage (1080x1920, 30 fps).
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | cues
// Shared, unmodified: mcd_ep1/engine.js (camera, planes, motion blur, subtitles, render), tests/mcd_collage/kit.js, air_ep2/airkit.js (stamp).
const { createCanvas } = require('@napi-rs/canvas');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');
const { stamp } = require('../air_ep2/airkit');
const CK = require('./carkit');
const { C, F, clamp, lerp, seg, E, spring, hash, rr, cut, flat, contact, tag } = K;
const { P3, text, insuranceDoc, folder, page, badge, xMark, car, CAR_WIN, gauge, dataCard, recChip, reportCard, insurer, riskMeter, arrowDown, legalDoc } = CK;
const { W, H, A } = EN;
const p = (t, a, b) => seg(t, a, b);

// ---------- voice-over (Chris) ----------
const ST = { c01: 0.3, c02: 2.4, c03: 5.9, c04: 7.3, c05: 9.2, c06: 14.6, c07: 19.7, c08: 22.6, c09: 25.3, c10: 32.3, c11: 41.2, c12: 43.1 };
const V = EN.voice(`${__dirname}/vo`, ST), at = V.at, T = 49.0;
const w = { denied: at('c01', 'denied'), records: at('c02', 'records'), police: at('c03', 'police'), chev: at('c04', 'chevrolet'), hard: at('c05', 'hard'), accel: at('c05', 'acceleration'), speeding: at('c05', 'speeding'),
  reports: at('c06', 'reports'), insurance: at('c06', 'insurance'), price: at('c07', 'price'), ticket: at('c07', 'ticket'), one: at('c08', 'one'),
  ftc: at('c09', 'ftc'), accused: at('c09', 'accused'), gm: at('c09', 'general'), collecting: at('c09', 'collecting'), consent: at('c09', 'consent'),
  y2026: at('c10', '2026'), finalized: at('c10', 'finalized'), five: at('c10', 'five-year'), ban: at('c10', 'ban'), certain: at('c10', 'certain'), consumer: at('c10', 'consumer'), trust: at('c12', 'trust') };
const Q = V.end('c12') + 0.15; // the question appears when the voice ends

// ---------- world regions ----------
const DOC = [0, -40], FOLD = [5000, 180], BADGE = [10000, -80], CARP = [11800, 200], CS = 0.95, HUD = [15000, -330];
const CH = 20000, CH_CAR = -560, CH_REP = 0, CH_INS = 650, CH_RISK = 1180, FTC = 25000, BAN = 30000, END = 35000, END_CAR = 360, END_FILE = -210;
const WIN = [CARP[0] + CAR_WIN[0] * CS, CARP[1] + CAR_WIN[1] * CS];

// ---------- camera ----------
const KEYS = [
  { t: 0, x: DOC[0], y: DOC[1], z: 1.0 }, { t: 0.6, x: DOC[0], y: DOC[1], z: 1.0 }, { t: 0.85, x: DOC[0], y: DOC[1] + 30, z: 1.2, e: 'out5' }, { t: 2.1, x: DOC[0], y: DOC[1] + 30, z: 1.24 },
  { t: 2.45, x: 5000, y: 0, z: 1.0, e: 'inOut5' }, { t: 5.6, x: 5000, y: -10, z: 1.08 },                                             // S2 records
  { t: 5.95, x: 10000, y: 0, z: 1.0, e: 'inOut5' }, { t: 7.2, x: 10000, y: 0, z: 1.03 }, { t: 7.5, x: CARP[0], y: 0, z: 0.95, e: 'inOut5' }, { t: 8.9, x: CARP[0], y: -10, z: 0.98 }, // S3 police -> car
  { t: 9.55, x: WIN[0], y: WIN[1], z: 40, e: 'in' }, { t: 9.5501, x: HUD[0] - 500, y: -300, z: 4 }, { t: 10.1, x: HUD[0], y: 0, z: 1.0, e: 'out5' }, { t: 14.3, x: HUD[0], y: -10, z: 1.04 }, // S4 dive into the HUD
  { t: 14.7, x: CH, y: -420, z: 1.0, e: 'inOut5' }, { t: 15.9, x: CH, y: -400, z: 1.0 }, { t: 16.5, x: CH, y: 20, z: 1.0 }, { t: 17.2, x: CH, y: 30, z: 1.0 }, { t: 17.8, x: CH, y: 620, z: 1.0 }, // S5 follow the data
  { t: 18.4, x: CH, y: 620, z: 1.0 }, { t: 19.1, x: CH, y: 300, z: 0.5 }, { t: 19.7, x: CH, y: 300, z: 0.52 }, { t: 20.4, x: CH, y: 900, z: 0.85 }, { t: 22.3, x: CH, y: 905, z: 0.88 },
  { t: 22.75, x: FTC, y: 0, z: 0.95, e: 'inOut5' }, { t: 31.8, x: FTC, y: 10, z: 1.05 },                                                // S6 FTC (slow, serious)
  { t: 32.2, x: BAN, y: 0, z: 1.0, e: 'inOut5' }, { t: 40.6, x: BAN, y: 0, z: 1.06 },                                                   // S7 the ban
  { t: 41.0, x: END, y: 0, z: 0.9, e: 'inOut5' }, { t: T, x: END, y: -40, z: 1.0, e: 'inOut' },                                          // S8 slow push
];
const cam = EN.camera(KEYS, {
  breath: t => (t < 2.45 ? 0 : 1) * (1 - 0.6 * seg(t, 22.8, 23.3) * (1 - seg(t, 31.6, 31.9))) * (1 - 0.85 * E.inOut(seg(t, 46, T))),
  shakes: [[0.6, 16], [7.75, 8], [w.ftc, 6], [w.ban, 14]],
});

// ---------- background: colour script ----------
const BG = [[0, P3.cream], [2.15, P3.dark, 'down', 0.3], [5.6, P3.slate, 'circle', 0.35, [510, 760]], [7.3, C.yellow, 'left', 0.3], [9.5, '#12151F'],
  [14.35, P3.cream, 'circle', 0.4, [510, 1100]], [22.4, '#111111', 'down', 0.3], [31.9, C.red, 'circle', 0.4, [510, 820]], [40.7, P3.slate, 'left', 0.3]];
function background(ctx, t) {
  let i = 0; for (let j = 0; j < BG.length; j++) if (t >= BG[j][0]) i = j;
  const [t0, col, wipe, d, o] = BG[i], u = wipe ? E.inOut(seg(t, t0, t0 + d)) : 1;
  if (u < 1 && i > 0) { ctx.fillStyle = BG[i - 1][1]; ctx.fillRect(0, 0, W, H); }
  ctx.save(); if (u < 1) { ctx.beginPath(); if (wipe === 'circle') ctx.arc(o[0], o[1], Math.max(1, u * 2300), 0, 7); else if (wipe === 'left') ctx.rect(W * (1 - u), 0, W * u, H); else ctx.rect(0, 0, W, u * H); ctx.clip(); }
  ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (t > 7.3 && t < 9.6) { // speed lines behind the car (back plane, moves slower than the car)
    const c = cam(t); ctx.save(); ctx.globalAlpha = 0.35 * p(t, 7.3, 7.6); ctx.fillStyle = '#FFFFFF';
    for (let k = 0; k < 9; k++) { const y = 560 + k * 60 + (hash(k) - 0.5) * 30, x = ((k * 330 - (c.x - CARP[0]) * 0.3 - t * 900) % 1600 + 1600) % 1600 - 300; ctx.fillRect(x, y, 220 + hash(k + 3) * 200, 10); }
    ctx.restore();
  }
}

// ================= scenes (world space) =================
function sDenied(ctx, t) {
  const settle = E.out(p(t, 0, 0.25));
  ctx.save(); ctx.translate(DOC[0], DOC[1]); ctx.rotate(lerp(0.05, -0.02, settle)); ctx.scale(0.92 * (1 + 0.05 * (1 - settle)), 0.92 * (1 + 0.05 * (1 - settle)));
  insuranceDoc(ctx, t, { denied: t > w.denied }); stamp(ctx, 'DENIED', 0, 130, 1.25, p(t, w.denied - 0.05, w.denied + 0.08), -0.18, C.red);
  ctx.restore();
}
const PAGES = []; for (let i = 0; i < 16; i++) PAGES.push({ i, t: 2.7 + i * 0.1, a: -Math.PI / 2 + (hash(i * 3) - 0.5) * 2.6, d: 520 + hash(i * 7) * 520, r: (hash(i) - 0.5) * 2 });
function sRecords(ctx, t) {
  ctx.save(); ctx.translate(FOLD[0], FOLD[1]);
  folder(ctx, { open: p(t, 2.55, 2.85), label: 'DRIVING RECORDS', inside: x => { for (let k = 0; k < 5; k++) { x.save(); x.translate(-150 + k * 75, -120 - k * 6); x.rotate((k - 2) * 0.06); page(x, k); x.restore(); } } });
  for (const pg of PAGES) { const u = (t - pg.t) / 0.9; if (u <= 0) continue; const e = E.out(clamp(u));
    const pos = uu => [Math.cos(pg.a) * pg.d * uu, -120 + Math.sin(pg.a) * pg.d * uu * 0.9 + uu * uu * 120];
    for (let g = 2; g >= 0; g--) { const q = pos(E.out(clamp(u - g * 0.05))); ctx.save(); ctx.globalAlpha = g ? 0.18 * (1 - e) : 1; ctx.translate(q[0], q[1]); ctx.rotate(pg.r * e); ctx.scale(lerp(0.6, 1.0, e), lerp(0.6, 1.0, e)); page(ctx, pg.i); ctx.restore(); } }
  ctx.restore();
}
function sPolice(ctx, t) {
  if (t < 7.6) { ctx.save(); ctx.translate(BADGE[0], BADGE[1]); const sh = t > w.police && t < w.police + 0.4 ? Math.sin((t - w.police) * 60) * 10 * (1 - p(t, w.police, w.police + 0.4)) : 0; ctx.translate(sh, 0); ctx.scale(1.05, 1.05);
    badge(ctx, { grey: p(t, w.police + 0.2, w.police + 0.5) }); xMark(ctx, 0, 0, 1.0, p(t, w.police, w.police + 0.3)); ctx.restore(); }
  if (t > 7.25) { // her own car drives in and brakes
    const u = E.out5(p(t, 7.35, 7.75)), dip = t > 7.75 ? (1 - spring(t - 7.75, 2.5, 6)) : 0, x = CARP[0] - (1 - u) * 1700;
    for (let g = 3; g >= 1 && u < 1; g--) { ctx.save(); ctx.globalAlpha = 0.14; ctx.translate(CARP[0] - (1 - E.out5(clamp(p(t, 7.35, 7.75) - g * 0.05))) * 1700, CARP[1]); ctx.scale(CS, CS); car(ctx, { glass: '#12151F' }); ctx.restore(); }
    ctx.save(); ctx.translate(x, CARP[1]); ctx.scale(CS, CS); ctx.rotate(dip * 0.03); car(ctx, { glass: '#12151F', spin: (1 - u) * 30 }); ctx.restore();
  }
}
const EVT = [{ k: 0, label: 'HARD BRAKING', t: () => w.hard, v: 0.1 }, { k: 1, label: 'ACCELERATION', t: () => w.accel, v: 0.64 }, { k: 2, label: 'SPEEDING', t: () => w.speeding, v: 0.92 }];
function sHud(ctx, t) {
  let v = 0.36 + Math.sin(t * 3.1) * 0.015; for (const e of EVT) { const u = E.out5(p(t, e.t() - 0.05, e.t() + 0.35)); if (u > 0) v = lerp(v, e.v, u); }
  ctx.save(); ctx.translate(HUD[0], HUD[1]); ctx.scale(0.75, 0.75); gauge(ctx, v, { needle: v > 0.72 ? C.red : C.yellow }); ctx.restore();
  ctx.save(); ctx.translate(HUD[0], -20); recChip(ctx, t); ctx.restore(); text(ctx, 'ONSTAR', HUD[0], 60, 30, P3.slateD, F.xb, 'center');
  EVT.forEach((e, i) => { const u = E.back(p(t, e.t() - 0.05, e.t() + 0.3), 1.6), out = E.inOut(p(t, 14.2, 14.5)); if (u <= 0) return;
    ctx.save(); ctx.translate(HUD[0] + (1 - u) * 900 + out * (i - 1) * 40, 130 + i * 120 + out * 700); ctx.scale(0.9, 0.9); ctx.globalAlpha = 1 - out; dataCard(ctx, e.k, e.label); ctx.restore(); });
}
function sChain(ctx, t) {
  // car -> driving data -> report -> insurer, then the risk meter and "no tickets"
  ctx.save(); ctx.translate(CH, CH_CAR); ctx.scale(0.45, 0.45); car(ctx, { glass: '#12151F' }); ctx.restore();
  arrowDown(ctx, CH, CH_CAR + 30, CH_REP - 270, E.inOut(p(t, 15.6, 16.0)), t);
  arrowDown(ctx, CH, CH_REP + 270, CH_INS - 240, E.inOut(p(t, 17.0, 17.3)), t);
  const fl = E.inOut(p(t, 15.85, 16.3)); if (fl < 1) { ctx.save(); ctx.translate(CH, lerp(CH_CAR - 260, CH_REP - 140, fl)); const s = lerp(0.4, 0.3, fl) * E.back(p(t, 14.9, 15.3), 2); ctx.scale(s, s); folder(ctx, { label: 'DRIVING DATA' }); ctx.restore(); }
  const rp = E.back(p(t, 16.15, 16.55), 1.6); if (rp > 0) { ctx.save(); ctx.translate(CH, CH_REP); ctx.scale(0.7 * rp, 0.7 * rp); reportCard(ctx, { risk: 0.85 * p(t, 16.4, 17.0) }); ctx.restore(); }
  const ins = E.back(p(t, 17.15, 17.5), 1.8) * (1 + (t > w.insurance ? (1 - spring(t - w.insurance, 3, 7)) * 0.12 : 0));
  if (ins > 0.01) { ctx.save(); ctx.translate(CH, CH_INS); ctx.scale(ins, ins); insurer(ctx); ctx.restore(); }
  const fr = E.inOut(p(t, 17.15, 17.55)); if (fr > 0 && fr < 1) { ctx.save(); ctx.translate(CH, lerp(CH_REP, CH_INS - 40, fr)); ctx.scale(lerp(0.3, 0.1, fr), lerp(0.3, 0.1, fr)); reportCard(ctx); ctx.restore(); }
  const rm = E.back(p(t, 19.9, 20.3), 1.6); if (rm > 0) { const v = lerp(0.25, 0.86, E.inOut(p(t, w.price + 0.1, w.price + 1.1))) + (t > w.price + 1.1 ? Math.sin(t * 9) * 0.008 : 0);
    ctx.save(); ctx.translate(CH, CH_RISK); ctx.scale(rm, rm); riskMeter(ctx, v); text(ctx, 'RISK SCORE', 0, 120, 44, C.ink, F.black, 'center'); ctx.restore(); }
  tag(ctx, 'TICKETS: 0', CH + 260, CH_INS - 230, { u: p(t, w.ticket - 0.05, w.ticket + 0.3), size: 40, bg: C.ink, rot: 0.05 });
}
const COPIES = [[-0.18, -150, -40], [0.14, 140, -60], [-0.08, -90, 80], [0.2, 170, 70], [-0.25, -200, 120]];
function sFtc(ctx, t) {
  const drop = E.back(p(t, 22.75, 23.15), 1.4), mult = E.out(p(t, w.one, w.one + 0.6)), merge = E.inOut(p(t, w.ftc - 0.25, w.ftc + 0.1));
  COPIES.forEach(([r, dx, dy], i) => { const k = clamp(mult * 1.6 - i * 0.12) * (1 - merge); if (k <= 0) return; ctx.save(); ctx.translate(FTC + dx * k, 60 + dy * k); ctx.rotate(r * k); ctx.scale(0.55, 0.55); legalDoc(ctx, 'COMPLAINT', { kicker: 'CONSUMER' }); ctx.restore(); });
  if (drop > 0) { const s = lerp(0.55, 0.64, merge); ctx.save(); ctx.translate(FTC, 60 - (1 - drop) * 700); ctx.scale(s, s);
    legalDoc(ctx, 'COMPLAINT', { kicker: merge > 0.5 ? 'FTC v. GM + ONSTAR' : 'CONSUMER', hi: p(t, w.collecting - 0.05, w.collecting + 0.9) });
    stamp(ctx, 'ACCUSED', 0, 120, 0.95, p(t, w.accused - 0.05, w.accused + 0.08), -0.16, C.red); ctx.restore(); }
  tag(ctx, 'GM + ONSTAR', FTC + 150, -330, { u: p(t, w.gm - 0.05, w.gm + 0.3), size: 52, bg: C.red, rot: 0.04 });
  tag(ctx, 'WITHOUT PROPER CONSENT', FTC, 420, { u: p(t, w.consent - 0.35, w.consent), size: 36, bg: P3.paper, fg: C.ink, tape: false, rot: -0.02 });
}
function sBan(ctx, t) {
  const drop = E.back(p(t, 32.05, 32.45), 1.4), back = E.inOut(p(t, w.five - 0.1, w.five + 0.35));
  ctx.save(); ctx.translate(BAN, 40 - (1 - drop) * 800); const s = lerp(0.62, 0.5, back); ctx.scale(s, s); if (back > 0.05) ctx.filter = `blur(${(back * 7).toFixed(1)}px)`; ctx.globalAlpha = 1 - back * 0.55;
  legalDoc(ctx, 'FINAL ORDER', { kicker: 'REGULATORY ORDER' }); stamp(ctx, '2026', 0, 140, 1.0, p(t, w.y2026 - 0.05, w.y2026 + 0.08), -0.14, C.ink); stamp(ctx, 'FINAL', 0, 330, 0.8, p(t, w.finalized, w.finalized + 0.12), 0.1, C.red);
  ctx.restore();
}
function sEnd(ctx, t) {
  ctx.save(); ctx.translate(END, END_CAR); ctx.scale(0.8, 0.8); car(ctx, { glass: '#12151F' }); ctx.restore();
  const rise = E.inOut(p(t, 41.6, 42.6)), morph = E.inOut(p(t, 42.4, 43.0)), y = lerp(END_CAR - 170, END_FILE, rise);
  if (rise > 0) { ctx.save(); ctx.setLineDash([12, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(END + 40, END_CAR - 190); ctx.lineTo(END, y + 140); ctx.stroke(); ctx.restore(); }
  if (rise > 0 && morph < 1) { ctx.save(); ctx.translate(END, y); ctx.globalAlpha = 1 - morph; ctx.scale(0.5 + rise * 0.3, 0.5 + rise * 0.3); cut(ctx, () => rr(ctx, -220, -130, 440, 260, 30), '#12151F', { sb: 26, sy: 12, lw: 4 }); ctx.scale(0.5, 0.5); gauge(ctx, 0.6); ctx.restore(); }
  if (morph > 0) { const s = 0.74 * E.back(morph, 1.6), pulse = 1 + (t > Q ? Math.sin((t - Q) * 3) * 0.012 : 0); ctx.save(); ctx.translate(END, END_FILE); ctx.scale(s * pulse, s * pulse); folder(ctx, { label: 'YOUR DRIVING FILE' }); ctx.restore(); }
}

// ---------- screen-space typography ----------
function maskText(ctx, txt, x, y, size, u, col, font = F.black) { if (u <= 0) return; ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.beginPath(); ctx.rect(0, y - size * 0.9, W, size * 1.12); ctx.clip(); ctx.fillStyle = col; ctx.fillText(txt, x, y + (1 - E.out5(u)) * size * 1.12); ctx.restore(); }
const STEPS = [[2.75, 12], [3.1, 48], [3.45, 129], [3.8, 301]];
function overlay(ctx, t) {
  if (t > 2.6 && t < 5.9) { // 12 -> 48 -> 129 -> 301 -> 603
    let n = 0; for (const [s, v] of STEPS) if (t >= s) n = v; if (t >= w.records) n = 603;
    const last = t >= w.records ? w.records : (STEPS.filter(s => t >= s[0]).pop() || [2.6])[0], k = 1 + (1 - spring(t - last, 3, 8)) * (n === 603 ? 0.25 : 0.1);
    const out = p(t, 5.55, 5.85); ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(A[0], 520); ctx.scale(k, k); ctx.font = `240px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = n === 603 ? C.yellow : '#FFFFFF'; if (n) ctx.fillText(String(n), 0, 0); ctx.restore();
    ctx.save(); ctx.globalAlpha = 1 - out; maskText(ctx, 'RECORDS', A[0], 620, 76, p(t, w.records + 0.05, w.records + 0.4), '#FFFFFF'); ctx.restore();
  }
  if (t > w.ftc - 0.1 && t < 32.1) { const o = 1 - p(t, 31.8, 32.05); ctx.save(); ctx.globalAlpha = o; maskText(ctx, 'FTC', A[0], 400, 210, p(t, w.ftc - 0.05, w.ftc + 0.3), '#FFFFFF'); ctx.restore(); }
  if (t > w.five - 0.1 && t < 41.0) { const o = 1 - p(t, 40.6, 40.9); ctx.save(); ctx.globalAlpha = o;
    maskText(ctx, '5-YEAR', A[0], 600, 200, p(t, w.five - 0.05, w.five + 0.3), P3.paper); const k = t > w.ban ? 1 + (1 - spring(t - w.ban, 2.6, 7)) * 0.12 : 1;
    ctx.save(); ctx.translate(A[0], 880); ctx.scale(k, k); ctx.translate(-A[0], -880); maskText(ctx, 'BAN', A[0], 920, 330, p(t, w.ban - 0.06, w.ban + 0.22), C.ink); ctx.restore();
    maskText(ctx, 'CERTAIN DRIVING DATA', A[0], 1030, 50, p(t, w.certain - 0.05, w.certain + 0.35), '#FFFFFF', F.xb);
    maskText(ctx, 'TO CONSUMER REPORTING AGENCIES', A[0], 1092, 40, p(t, w.consumer - 0.05, w.consumer + 0.35), '#FFFFFF', F.xb); ctx.restore(); }
  if (t > Q) { maskText(ctx, 'WOULD YOU TRUST IT?', A[0], 340, 88, p(t, Q, Q + 0.4), C.ink); const s = E.inOut(p(t, Q + 0.25, Q + 0.6)); ctx.fillStyle = C.red; ctx.fillRect(A[0] - 420 * s, 366, 840 * s, 12); }
}

// subtitles: hand-made phrase groups (word counts per line) so no group splits a phrase or leaves a one-word tail
const SPLIT = { c01: [5], c02: [3, 8], c03: [4], c04: [4], c05: [5, 6], c06: [7, 4], c07: [5, 4], c08: [6], c09: [7, 4, 6], c10: [4, 3, 5, 4], c11: [4], c12: [5, 7] };
function manualSubs() {
  const G = []; const ids = Object.keys(ST);
  ids.forEach((id, li) => { const ws = V.words(id); let k = 0;
    SPLIT[id].forEach(n => { const words = ws.slice(k, k + n); k += n; G.push({ id, words, li }); });
    if (k !== ws.length) throw new Error(`subtitle split mismatch ${id}: ${k} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1]; g.t0 = g.words[0].t0 - 0.05;
    const end = g.words[g.words.length - 1].t1 + 0.5; g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(end, nx.words[0].t0 - 0.05)) : end + 0.4;
    g.text = g.words.map(x => x.w).join(' ').replace(/six hundred and three/i, '603'); });
  return G;
}

const ep = {
  T, cam, background, overlay,
  world(ctx, t) {
    if (t < 2.5) sDenied(ctx, t);
    if (t > 2.1 && t < 6.0) sRecords(ctx, t);
    if (t > 5.6 && t < 9.6) sPolice(ctx, t);
    if (t > 9.5 && t < 14.8) sHud(ctx, t);
    if (t > 14.3 && t < 22.8) sChain(ctx, t);
    if (t > 22.4 && t < 32.3) sFtc(ctx, t);
    if (t > 31.9 && t < 41.1) sBan(ctx, t);
    if (t > 40.6) sEnd(ctx, t);
  },
  fg: [ // parallax: flying records near the lens; one record page in the final frame
    { t0: 2.7, t1: 5.7, tr: 4.0, x: 120, y: 360, k: 'receipt', s: 1.2, rot: -0.4, par: 1.7, blur: 8 },
    { t0: 2.9, t1: 5.7, tr: 4.0, x: 970, y: 1150, k: 'receipt', s: 1.0, rot: 0.35, par: 1.9, blur: 9 },
    { t0: 41.5, t1: 99, tr: 47, x: 980, y: 700, k: 'receipt', s: 1.1, rot: 0.3, par: 1.5, blur: 8 },
  ],
  subs: manualSubs(),
  subStyle: { y: 1425, size: 64, maxW: 800, highlight: ['denied', '603', 'chevrolet', 'onstar', 'ftc', 'five-year', 'ban', 'ticket', 'trust'] },
  vo: Object.entries(ST),
  music: { b0: 0.6, drop: 6.6, car: 7.6, groove: 8.6, lead: 14.6, serious: 22.6, build: 32.6, hit: w.ban, quiet: 40.6, last: Q, end: T },
  cues() {
    const c = [['snap', 0.0], ['stamp', w.denied, 1], ['slam', w.denied, 0.6], ['whoosh', 2.1, 0.7], ['paper', 2.6], ['paper', 2.75]];
    STEPS.forEach(s => c.push(['tick', s[0]])); for (let i = 0; i < 16; i += 3) c.push(['flutter', PAGES[i].t]);
    c.push(['slam', w.records, 0.5], ['whoosh', 5.6, 0.6], ['cut', w.police], ['cut', w.police + 0.15], ['whoosh', 7.3, 0.8], ['thump', 7.75, 0.5]);
    c.push(['zoom', 8.95, 0.9], ['blip', 10.1], ['blip', w.hard], ['blip', w.accel], ['blip', w.speeding]);
    c.push(['whoosh', 14.35, 0.6], ['pop', 15.0], ['pulse', 15.85], ['pop', 16.2], ['pulse', 17.15], ['pop', w.insurance], ['zoom', 18.5, 0.6], ['rise', w.price], ['tag', w.ticket]);
    c.push(['whoosh', 22.4, 0.7], ['paper', 22.8], ['flutter', w.one], ['flutter', w.one + 0.2], ['flutter', w.one + 0.4], ['boom', w.ftc], ['stamp', w.accused, 0.8], ['tag', w.gm], ['scratch', w.collecting], ['tag', w.consent - 0.3]);
    c.push(['whoosh', 31.9, 0.7], ['thump', 32.3, 0.5], ['stamp', w.y2026, 0.6], ['stamp', w.finalized, 0.5], ['slam', w.ban, 1], ['boom', w.ban], ['tag', w.certain], ['tag', w.consumer]);
    c.push(['whoosh', 40.7, 0.5], ['pulse', 41.6], ['paper', 42.5], ['pop', 42.9], ['tag', Q, 0.5]);
    return c;
  },
};
EN.cli(ep, __dirname);
module.exports = ep;
