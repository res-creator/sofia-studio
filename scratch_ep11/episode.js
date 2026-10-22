// Episode 11 "The $440 Scratch" (How It's Run) — Atlanta airport, 2025: a rental return, the AI inspection arch, a $440 bill,
// a pay-fast discount, a chat bot, and the 7-day discount vs the up-to-10-day email reply. Built on hirkit (rig, light, collage, edit).
// Story world: wheel -> arch lens -> airport -> return garage -> arch -> terminal -> the bill -> the offer -> inside the chat -> the day path
// -> the review desk (Hertz's statement) -> the $125 line -> back at the arch. Shots cut on voice-over words. 1080x1920, 30 fps.
// Usage: node episode.js video out.mp4 | still t1,t2,... out.png | frame t out.png | cues | srt out.srt
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../tests/mcd_collage/kit');
const EN = require('../mcd_ep1/engine');            // voice timings + subtitle drawing only (read-only use)
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { makeEdit } = require('../hirkit/edit');
const S = require('./scankit');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, ell } = R;
const { W, H, layer, txt, fitTxt, PAT, AGENT } = S;
const FPS = 30;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- voice timeline (natural speed; real speech start/end from vo/speech.json, gaps only) ----------
const LINES = JSON.parse(fs.readFileSync(`${__dirname}/script.json`));
const SP = JSON.parse(fs.readFileSync(`${__dirname}/vo/speech.json`));
const GAP = { s01: 0.25, s02: 0.35, s03: 0.3, s04: 0.3, s05: 0.25, s06: 0.3, s07: 0.3, s08: 0.4, s09: 0.35, s10: 0.25, s11: 0.3, s12: 0.25, s13: 0.6, s14: 0.4, s15: 0.3, s16: 1.2 };
const ST = {}; let T = 0.15; for (const L of LINES) { ST[L.id] = +(T - SP[L.id][0]).toFixed(3); T += SP[L.id][1] - SP[L.id][0] + GAP[L.id]; } T = +T.toFixed(2);
const V = EN.voice(`${__dirname}/vo`, ST), at = (id, w, n = 0) => V.at(id, w, n), end = id => ST[id] + SP[id][1];

// ---------- helpers ----------
function cam(keys, lt) {
  let c; if (lt <= keys[0][0]) c = keys[0]; else if (lt >= keys[keys.length - 1][0]) c = keys[keys.length - 1];
  else for (let i = 1; i < keys.length; i++) if (lt < keys[i][0]) { const a = keys[i - 1], b = keys[i], u = E.inOut(seg(lt, a[0], b[0])); c = [lt, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), lerp(a[4] || 0, b[4] || 0, u)]; break; }
  return { x: c[1] + Math.sin(lt * 0.9) * 4 / c[3], y: c[2] + Math.cos(lt * 0.7) * 3 / c[3], z: c[3], r: (c[4] || 0) + Math.sin(lt * 0.6) * 0.003 };
}
const shake = (t, t0, a = 14) => (t > t0 && t < t0 + 0.35) ? Math.sin((t - t0) * 70) * a * (1 - seg(t, t0, t0 + 0.35)) : 0;
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) { // a softer (half-res, blurred) background plane
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
const blink = (t, p = 3.3, o = 0) => ((t + o) % p) > p - 0.11 ? 1 : 0;
const RIM = { dir: [-1, -0.35], color: '#FFF3D8', w: 8, a: 0.9 }, RIM_COOL = { dir: [1, -0.4], color: '#D8F0FF', w: 8, a: 0.85 };
const pop = (t, t0, d = 0.3, s = 2.2) => t < t0 ? 0 : E.back(seg(t, t0, t0 + d), s);
// a paper label with an arrow (names, places)
function label(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); ctx.scale(u, u); const size = o.size || 56;
  ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width + 50;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -size * 0.85, w, size * 1.35, 12), o.col || '#FFFDF8', { elev: 1.4 }); txt(ctx, s, 0, size * 0.28, size, o.fg || INK);
  if (o.arrow) { ctx.fillStyle = o.col || '#FFFDF8'; ctx.beginPath(); ctx.moveTo(o.arrow * 20 - 22, size * 0.5); ctx.lineTo(o.arrow * 20 + 22, size * 0.5); ctx.lineTo(o.arrow * 60, size * 1.2); ctx.closePath(); ctx.fill(); ctx.lineWidth = R.px(ctx, 4); ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
// Patrick close-up (front bust) over a background; o: {face, hands, tilt, lean, s, x, ny, push, glow, rim}
function patBust(ctx, lt, bg, o) {
  bg(ctx);
  const push = 1 + lt * (o.push ?? 0.03), nx = o.x ?? 540, ny = o.ny ?? 1470;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  const draw = c => R.bust(c, nx, ny, o.s ?? 2.8, PAT, { face: o.face, hands: o.hands || [], headTilt: o.tilt || 0, lean: o.lean || 0 });
  const lo = { rim: o.rim ?? RIM, tint: { x0: nx, y0: 0, x1: nx + 540, y1: 0, color: o.shadeCol || 'rgb(200,205,228)', a: 1 } }; if (o.glow) lo.glow = o.glow;
  LT.lit(ctx, draw, lo); ctx.restore();
}
// blurred terminal background for close-ups
const hallBg = (cx = 300, cy = -900, z = 1.0, light = 'day', blur = 10) => (c, t) => { c.fillStyle = '#E9E2D2'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, { x: cx, y: cy, z }, 1, w => S.terminalIn(w, t || 0, { light, crowd: false }))); LT.haze(c, light === 'evening' ? 'evening' : 'day', 0.1); };

// ---------- the bill (one receipt strip, used by several shots) ----------
const BILL = [['REPAIR', '$250'], ['PROCESSING FEE', '$125'], ['ADMIN FEE', '$65']];
const tL1 = at('s07', 'two-fifty'), tL2 = at('s07', 'one'), tL3 = at('s07', 'sixty-five'), tTot = at('s08', 'four-forty');
// printed length (local units) at time t: each line has fully emerged when its amount is spoken; the TOTAL with "four-forty"
const RLH = 150, RTOP = 130, RW = 520, RLEN = [RTOP, RTOP + RLH, RTOP + 2 * RLH, RTOP + 3 * RLH, RTOP + 3 * RLH + 190];
function billLen(t) { const ks = [[ST.s07 - 0.2, 0], [ST.s07 + 0.5, RLEN[0]], [tL1 + 0.15, RLEN[1]], [tL2 + 0.4, RLEN[2]], [tL3 + 0.2, RLEN[3]], [tTot - 0.3, RLEN[3] + 20], [tTot + 0.15, RLEN[4]]];
  if (t <= ks[0][0]) return 0; for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], E.out(seg(t, ks[i - 1][0], ks[i][0]))); return RLEN[4]; }
// the receipt rising out of the top of the phone: bottom anchored at (x, y) in the current transform, s scale; hl = row index to highlight
function billUp(ctx, x, y, s, t, o = {}) {
  const len = o.len ?? billLen(t); if (len <= 2) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.beginPath(); ctx.rect(-RW, -3000, RW * 2, 3000); ctx.clip(); // only the printed part above the phone
  ctx.translate(0, -len);
  S.receiptStrip(ctx, RW, RLEN[4] + 40, BILL.map((b, i) => [b[0], b[1], o.hl === i ? (o.hlCol || true) : false]), { title: 'DAMAGE CHARGES', lh: RLH, top: RTOP, total: '$440', amtSize: 104, labSize: 40 });
  ctx.restore();
}

// the whole bill, top edge at (x, yTop) in the current transform (no printing clip)
function billAt(ctx, x, yTop, s, o = {}) {
  ctx.save(); ctx.translate(x, yTop); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  S.receiptStrip(ctx, RW, RLEN[4] + 40, BILL.map((b, i) => [b[0], b[1], o.hl === i ? (o.hlCol || true) : false]), { title: 'DAMAGE CHARGES', lh: RLH, top: RTOP, total: '$440', amtSize: 104, labSize: 40, elev: o.elev ?? 1.4 });
  ctx.restore();
}

// ---------- overlays ----------
function stamp2025(ctx, t) { // the historical label, small, top of the 3:4 crop; it lands from the big stamp in B1
  const big = t > t2025 - 0.05 && t < at('s03', 'patrick') - 0.3; if (big) return; // the big stamp in B1 takes its place
  ctx.save(); ctx.translate(W / 2, 262);
  ctx.font = `30px ${F.black}`; const s = 'ATLANTA AIRPORT · 2025', w = ctx.measureText(s).width + 44;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -28, w, 54, 10), '#171717', { elev: 0.8, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore();
}
const tForty = at('s01', 'forty');
function headline(ctx, t) { // frame-0 hook: 1-INCH SCUFF -> $440 (stays through the first two lines)
  const a = 1 - seg(t, ST.s03 - 0.25, ST.s03); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 400);
  const flip = t >= tForty, p = flip ? E.back(seg(t, tForty, tForty + 0.3), 2.4) : 1;
  ctx.font = `80px ${F.black}`; const left = '1-INCH SCUFF', right = flip ? '$440' : ' ? ', wl = ctx.measureText(left + '  →  ').width, wr = ctx.measureText(right).width + 40;
  CL.cutout(ctx, () => rr(ctx, -(wl + wr) / 2 - 30, -76, wl + wr + 60, 114, 16), '#FFFDF8', { elev: 1.4 });
  txt(ctx, left + '  →', -(wl + wr) / 2 + 6, 8, 80, INK, 'left');
  ctx.save(); ctx.translate((wl + wr) / 2 - wr / 2 - 10, -20); ctx.scale(p, p); CL.cutout(ctx, () => rr(ctx, -wr / 2, -52, wr, 96, 12), C.red, { elev: 1 }); txt(ctx, right, 0, 28, 80, '#FFFDF8'); ctx.restore();
  ctx.restore();
}

// ================= SHOTS =================
const SH = []; const shot = (id, t0, t1, draw, out) => SH.push({ id, t0, t1, draw, out });
const garageBg = (c, t, cm, blur = 9) => { c.fillStyle = '#D9D3C6'; c.fillRect(0, 0, W, H); halfPass(c, blur, g => layer(g, cm, 1, w => S.garage(w, t, { sign: false }))); };

// A1 (0 - s02): the rear wheel rolls to a stop; a red scan line sweeps, the box locks on a scuff, the $440 tag drops
const tInch = at('s01', 'inch');
shot('A1 wheel', 0, ST.s02 - 0.12, (ctx, t, lt) => {
  garageBg(ctx, t, { x: -600 + t * 60, y: -600, z: 0.9 }, 8);
  const roll = 1 - E.out(seg(t, 0, 0.9)), x = -120 * roll, z = 3.2 + lt * 0.12, sh = shake(t, tForty, 14);
  ctx.save(); ctx.translate(540 + sh, 1080); ctx.scale(z, z); ctx.translate(300 + x, 92);
  LT.lit(ctx, c => S.carSide(c, { rot: -1.6 * roll - 0.2, scuff: 1 }), { rim: RIM });
  ctx.translate(-300, -92); // wheel centre
  const box = seg(t, tInch - 0.05, tInch + 0.5); S.detectBox(ctx, 92 * 0.7, box, '≈ 1 INCH', 1.6);
  ctx.restore();
  // red scan line sweeping down the wheel
  const sy = lerp(600, 1500, seg(t, 0.05, tInch + 0.1)); if (t < tInch + 0.3) { ctx.save(); ctx.globalAlpha = 1 - seg(t, tInch + 0.1, tInch + 0.3); ctx.fillStyle = 'rgba(230,57,70,0.85)'; ctx.fillRect(0, sy - 4, W, 8); LT.glow(ctx, 540, sy, 300, 'rgba(255,80,90,1)', 0.25); ctx.restore(); }
  // the $440 tag on a string from the box
  if (t >= tForty - 0.1) { const d = E.out(seg(t, tForty - 0.1, tForty + 0.2)), sw = Math.sin((t - tForty) * 7) * 0.12 * (1 - seg(t, tForty, tForty + 1.2));
    const bx = 540 + sh + 0.62 * 64.4 * z, by = 1080 + 0.42 * 64.4 * z;
    // string from the box down-left to the tag (tag stays inside the frame, above the subtitles)
    const tx = lerp(bx, 330, d), ty = lerp(by, 1290, d) + Math.sin((t - tForty) * 7) * 10 * (1 - seg(t, tForty, tForty + 1.2));
    ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - 30, by + 10); ctx.quadraticCurveTo(lerp(bx, tx, 0.5), Math.max(by, ty) + 60, tx + 120, ty); ctx.stroke();
    ctx.translate(tx, ty); ctx.rotate(sw * 0.5 - 0.06); ctx.scale(1.9 * Math.max(0.05, d), 1.9 * Math.max(0.05, d)); priceTag(ctx, '$440', C.red, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'office', { vignette: 0.22 });
});
function priceTag(ctx, label, col = '#FFFDF8', fg = INK) { // paper price tag centred, string hole at the right end
  ctx.save(); ctx.font = `64px ${F.black}`; const w = ctx.measureText(label).width + 70;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(w / 2 - 34, -50); ctx.lineTo(-w / 2, -50); ctx.lineTo(-w / 2, 50); ctx.lineTo(w / 2 - 34, 50); ctx.lineTo(w / 2, 0); ctx.closePath(); }, col, { elev: 1.3 });
  ell(ctx, w / 2 - 30, 0, 9, 9); ctx.fillStyle = 'rgba(40,25,10,0.5)'; ctx.fill(); txt(ctx, label, -16, 22, 64, fg); ctx.restore();
}

// A2 (s02): the arch's camera lens, wide open; it turns to us and keeps staring (it never blinks — the man in the reflection does)
shot('A2 lens', ST.s02 - 0.12, ST.s03 - 0.15, (ctx, t, lt) => {
  ctx.fillStyle = '#2A2E36'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 12, g => layer(g, { x: -460, y: -1250, z: 1.6 }, 1, w => { S.garage(w, t, { sign: false }); S.archFront(w, { on: 1 }); }));
  LT.haze(ctx, 'dark', 0.25);
  const tSp = at('s02', 'spotted'), turn = k(t, tSp - 0.2, tSp + 0.4, E.out), z = 1 + lt * 0.05;
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.rotate(lerp(-0.25, 0, turn)); ctx.scale(lerp(0.82, 1, turn), 1);
  S.lensClose(ctx, 300, { iris: lerp(0.4, 1, turn), look: [lerp(-1, 0, turn), 0] });
  ctx.restore();
  LT.glow(ctx, 540, 1000, 520, 'rgba(120,180,255,1)', 0.12);
  LT.grade(ctx, 'dark', { vignette: 0.3 });
});

// B1 (s03 "Atlanta airport, 2025."): crane down from the sky and the climbing plane to the terminal and the return sign; the big 2025 stamp
const t2025 = at('s03', '2025');
shot('B1 airport', ST.s03 - 0.15, at('s03', 'patrick') - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -1500, 0.62], [2.4, 0, -560, 0.6]], lt);
  ctx.fillStyle = '#FFD9A0'; ctx.fillRect(0, 0, W, H);
  layer(ctx, { ...c, x: c.x * 0.4, y: c.y * 0.6 - 300 }, 1, w => S.terminalExt(w, t + 4, { planePhase: 0.25 }));
  LT.grade(ctx, 'golden', { vignette: 0.16 });
  // big stamp: ATLANTA · 2025, lands at "2025", then flies up into the corner label
  const u = pop(t, t2025 - 0.05, 0.3, 2.6), fly = k(t, at('s03', 'patrick') - 0.75, at('s03', 'patrick') - 0.3);
  if (u > 0 && fly < 1) { ctx.save(); ctx.translate(lerp(540, 540, fly), lerp(760, 262, fly)); const sc = lerp(2.0, 1, fly) * u; ctx.scale(sc, sc); ctx.rotate(lerp(-0.08, 0, fly));
    ctx.font = `30px ${F.black}`; const s = 'ATLANTA AIRPORT · 2025', w = ctx.measureText(s).width + 44; CL.cutout(ctx, () => rr(ctx, -w / 2, -28, w, 54, 10), '#171717', { elev: 1.2, tex: 0 }); txt(ctx, s, 0, 11, 30, C.yellow); ctx.restore(); }
});

// B2 (s03 "Patrick returned a rental Volkswagen."): tracking shot alongside the car as it rolls into the return garage
const tPat = at('s03', 'patrick'), tVW = at('s03', 'volkswagen');
const driver = (face) => g => { R.head(g, 70, -345, 58, PAT, face); };
shot('B2 drive', tPat - 0.12, at('s03', 'from') - 0.12, (ctx, t, lt) => {
  const cx = 200 + lt * 420;
  ctx.fillStyle = '#D9D3C6'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 5, g => layer(g, { x: cx, y: -560, z: 0.9 }, 1, w => S.garage(w, t, { sign: false })));
  layer(ctx, { x: -10, y: -300, z: 1.02 + lt * 0.02 }, 1, w => {
    w.save(); w.translate(0, 0);
    LT.lit(w, c => S.carSide(c, { rot: -t * 4.2, scuff: 1, tag: t > tVW ? 'VOLKSWAGEN' : null, driver: driver(R.expr(t > tVW + 0.3 ? 'smile' : 'neutral', { look: [1, 0], blink: blink(lt, 2.2) })) }), { rim: RIM });
    w.restore();
  });
  // name label pointing at the driver
  label(ctx, 'PATRICK', 610, 470, pop(t, tPat + 0.05), { arrow: 1, size: 64, col: C.yellow });
  label(ctx, 'RENTAL CAR', 330, 640, pop(t, at('s03', 'rental'), 0.3), { size: 46, rot: 0.04 });
  LT.grade(ctx, 'day', { vignette: 0.16 });
});

// B3 (s03 "From Thrifty, a brand owned by Hertz."): low angle on the hanging return sign; the car roof slides by; the OWNED BY HERTZ tag drops
const tOwned = at('s03', 'owned');
shot('B3 sign', at('s03', 'from') - 0.12, ST.s04 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -1280, 0.95, -0.03], [3, 0, -1240, 1.05, 0.02]], lt);
  ctx.fillStyle = '#D9D3C6'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 3, g => layer(g, { ...c, y: c.y - 60 }, 1, w => S.garage(w, t, { sign: false })));
  layer(ctx, c, 1, w => S.hangSign(w, 0, -1430, t - tOwned, seg(t, tOwned - 0.1, tOwned + 0.3)));
  // the car roof passing low in the foreground (out of focus)
  const rx = lerp(-900, 1500, seg(lt, 0.2, 2.8));
  ctx.save(); ctx.filter = 'blur(3px)'; ctx.translate(rx, 2150); ctx.scale(1.6, 1.6); S.carSide(ctx, { rot: -t * 4 }); ctx.restore();
  LT.grade(ctx, 'office', { vignette: 0.2 });
});

// C1 (s04 "The car rolled through an arch."): head-on — the car rolls toward us into the inspection arch
const tArch = at('s04', 'arch'), tCams = at('s04', 'cameras'), tLights = at('s04', 'lights'), tAI = at('s04', 'ai');
function archWorld(ctx, t, o) { // garage end wall + converging lane + the arch (front view); the car inside it
  ctx.fillStyle = '#B4AEA2'; ctx.fillRect(-3000, 0, 6000, 2000);
  ctx.fillStyle = '#E6E0D3'; ctx.fillRect(-3000, -2600, 6000, 2600);
  ctx.fillStyle = '#BDB6A7'; ctx.fillRect(-3000, -2600, 6000, 900);
  for (let x = -2400; x <= 2400; x += 800) { ctx.fillStyle = '#AFA796'; ctx.fillRect(x - 60, -1700, 120, 1700); }
  ctx.fillStyle = '#FFFDF8'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 640, 0); ctx.lineTo(sx * 660, 0); ctx.lineTo(sx * 1700, 2000); ctx.lineTo(sx * 1640, 2000); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = C.yellow; for (let i = 0; i < 6; i++) { const y = 80 + i * i * 60; ctx.fillRect(-14 - i * 4, y, 28 + i * 8, 30 + i * 10); }
  if (o.car) { ctx.save(); ctx.translate(0, o.carY || 0); ctx.scale(o.car, o.car); LT.lit(ctx, c => S.carFront(c, { lights: 1, driver: g => R.headFront(g, -90, -400, 62, PAT, R.expr('neutral', { blink: blink(t, 2.6) })) }), { rim: RIM_COOL }); ctx.restore(); }
  S.archFront(ctx, o.arch || {});
}
shot('C1 arch', ST.s04 - 0.12, tCams - 0.1, (ctx, t, lt) => {
  const c = cam([[0, 0, -470, 0.68], [1.5, 0, -440, 0.72]], lt), u = E.out(seg(lt, 0, 1.4));
  ctx.fillStyle = '#E6E0D3'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => archWorld(w, t, { car: lerp(0.42, 0.85, u), carY: lerp(-40, 0, u), arch: { on: 0.35, pods: [0, 0, 0, 0] } }));
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// C2 ("Cameras."): close on the top beam — the camera pods snap toward the car and fire
shot('C2 cameras', tCams - 0.1, tLights - 0.1, (ctx, t, lt) => {
  const c = cam([[0, -300, -1080, 1.35, 0.03], [0.7, -320, -1090, 1.45, 0.02]], lt);
  const pod = i => -0.5 * K.spring(lt - 0.05 - i * 0.07, 2.5, 6) * (i < 2 ? 1 : -1), fl = Math.max(0, 1 - (lt - 0.35) * 5) * (lt > 0.35 ? 1 : 0);
  ctx.fillStyle = '#E6E0D3'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => archWorld(w, t, { car: 0.85, arch: { on: 0.35, pods: [pod(0), pod(1), pod(2), pod(3)], flash: fl } }));
  if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${0.5 * fl})`; ctx.fillRect(0, 0, W, H); }
  LT.grade(ctx, 'office', { vignette: 0.2 });
});
// C3 ("Lights. An AI scanner."): side view — light bars switch on, the car passes the light curtain, an AI mesh sweeps over it
shot('C3 scan', tLights - 0.1, ST.s05 - 0.15, (ctx, t, lt) => {
  const on = clamp((t - tLights) * 6), cx = lerp(-150, 330, seg(t, tLights - 0.1, ST.s05)), c = cam([[0, 160, -560, 0.92], [2, 180, -560, 0.98]], lt);
  ctx.fillStyle = '#2C3038'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 6, g => layer(g, { x: 0, y: -600, z: 0.8 }, 1, w => S.garage(w, t, { sign: false })));
  ctx.fillStyle = `rgba(20,24,34,${0.55 - 0.2 * on})`; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.archSide(w, 'back', { on, flash: Math.max(0, 1 - Math.abs(t - tAI - 0.1) * 6) });
    w.save(); w.translate(cx, 0); LT.lit(w, g => S.carSide(g, { rot: -t * 3, scuff: 1, scanT: on > 0 ? seg(t, tLights + 0.1, ST.s05 - 0.2) : 0, driver: driver(R.expr('neutral', { look: [1, 0] })) }), { rim: RIM_COOL }); w.restore();
    S.archSide(w, 'front', { on, scanY: (t * 1.3) % 1 });
  });
  label(ctx, 'AI SCANNER', 540, 470, pop(t, tAI - 0.05), { size: 76, col: '#171717', fg: '#7CE3FF' });
  LT.grade(ctx, 'dark', { vignette: 0.22 });
});

// D1 (s05 "Minutes later, his phone buzzed."): Patrick walks through the terminal with his suitcase; the phone buzzes, he stops
const tBuzz = at('s05', 'buzzed');
shot('D1 walk', ST.s05 - 0.15, ST.s06 - 0.12, (ctx, t, lt) => {
  const stop = seg(t, tBuzz, tBuzz + 0.25), wx = lerp(-260, 60, seg(t, ST.s05 - 0.15, tBuzz)) , ph = Math.min(t, tBuzz) * 7.2;
  const c = cam([[0, -100, -470, 1.02], [2, 0, -480, 1.12]], lt);
  ctx.fillStyle = '#E9E2D2'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 4, g => layer(g, { ...c, x: c.x * 0.5 + wx * 0.4 }, 1, w => S.terminalIn(w, t, { boardX: 300 })));
  layer(ctx, c, 1, w => {
    const P = R.walk(ph, { stride: 60 * (1 - stop) + 2, lift: 30 * (1 - stop), bob: 9 * (1 - stop) });
    const buzz = t > tBuzz ? Math.sin(t * 90) * 3 * (1 - seg(t, tBuzz + 0.5, tBuzz + 0.9)) : 0;
    LT.castShadow(w, g => R.figure(g, wx, 0, 1, 1, PAT, P), { x: wx, floorY: 0, skew: 0.5, squash: 0.18, a: 0.22, blur: 3 });
    w.save(); w.translate(wx - 150 + buzz * 0, 0); S.suitcase(w, 0.9, C.red); w.restore();
    const pose = stop > 0 ? { hip: [0, -252], lean: 0.02, legN: { foot: [26, 0] }, legF: { foot: [-24, 0] }, armF: { hand: [-120, -150], grip: 'fist' }, armN: { hand: [40 + buzz, -250], grip: 'relax' } } : { ...P, armF: { hand: [-120, -150 + Math.sin(ph) * 4], grip: 'fist' } };
    LT.lit(w, g => R.figure(g, wx, 0, 1, 1, PAT, { ...pose, face: R.exprMix('neutral', R.expr('surprised', { look: [0.4, 0.8] }), stop) }), { rim: RIM });
    if (t > tBuzz) { w.save(); w.translate(wx + 60, -240); w.strokeStyle = C.red; w.lineWidth = 6; w.lineCap = 'round'; const a = 1 - seg(t, tBuzz + 0.6, tBuzz + 0.9);
      w.globalAlpha = a; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { w.beginPath(); w.arc(0, 0, 40 + i * 22 + ((t * 120) % 20), s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25); w.stroke(); } w.restore(); }
  });
  label(ctx, 'MINUTES LATER', 540, 470, pop(t, ST.s05), { size: 50, col: '#171717', fg: C.yellow });
  LT.grade(ctx, 'day', { vignette: 0.16 });
});

// D2 (s06 "Rear wheel. A scuff. About an inch."): the phone in his hand: the damage report photo zooms onto the rear wheel, the box locks
const tScuff = at('s06', 'scuff'), tAbout = at('s06', 'about');
shot('D2 report', ST.s06 - 0.12, ST.s07 - 0.12, (ctx, t, lt) => {
  hallBg(260, -1000, 1.2, 'day', 12)(ctx, t);
  const z = 1 + lt * 0.03; ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
  const sc = 2.75, px0 = 540, py0 = 1000;
  // his hand under the phone (from below)
  LT.lit(ctx, c => { R.tube(c, [[760, 1980], [690, 1460]], 140, PAT.top, 5); R.hand(c, [640, 1290], -1.9, PAT.skin, 'hold', { size: 2.8 }); }, { rim: RIM });
  ctx.save(); ctx.translate(px0, py0); ctx.rotate(-0.04); S.phone(ctx, (p, w, h) => S.appPhoto(p, w, h, seg(t, ST.s06, tScuff + 0.1), seg(t, tScuff, tAbout + 0.6)), sc); ctx.restore();
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.2 });
});

// E1 (s07 "The bill: two-fifty for the repair."): Patrick holds the phone up; a receipt starts printing out of its top
const phoneItem = (screen, s = 0.42) => c => { c.save(); c.translate(-8, -70); c.rotate(-0.05); S.phone(c, screen, s); c.restore(); };
const billScreen = (p, w, h) => { S.appHeader(p, w, 'DAMAGE CHARGES'); p.fillStyle = '#F7F5F0'; p.fillRect(0, 64, w, h - 64); S.txt(p, 'PRINTING…', w / 2, 240, 22, '#5A5450'); };
shot('E1 bill', ST.s07 - 0.12, tL2 - 0.15, (ctx, t, lt) => {
  patBust(ctx, lt, c => hallBg(-200, -900, 1.0)(c, t), { x: 330, ny: 1480, s: 2.4, push: 0.02,
    face: R.exprMix(R.expr('neutral', { look: [0.6, -0.6], blink: blink(lt, 2) }), R.expr('surprised', { look: [0.6, -0.8] }), k(t, tL1, tL1 + 0.3)), tilt: 0.04,
    hands: [{ side: 1, hand: [150, -30], elbow: [250, 420], grip: 'hold', item: phoneItem(billScreen) }] });
  billUp(ctx, 690, 1080, 0.95, t, { rot: 0.02, hl: t > tL1 - 0.1 ? 0 : -1 });
  LT.grade(ctx, 'day', { vignette: 0.18 });
});
// E2 (s07 "One twenty-five, processing fee."): close on the receipt as the $125 line prints; his eyes follow it up from the bottom edge
shot('E2 $125', tL2 - 0.15, tL3 - 0.15, (ctx, t, lt) => {
  hallBg(-500, -1100, 1.4, 'day', 14)(ctx, t);
  const s = 1.55, len = billLen(t), y0 = 1280 + lt * 20;
  // keep the newest line centred: the strip bottom anchored below the frame
  billUp(ctx, 560, 1330, s, t, { hl: len > RLEN[2] - 30 ? 1 : -1, rot: -0.02 });
  ctx.save(); ctx.translate(0, 0);
  LT.lit(ctx, c => R.bust(c, 95, 1960, 2.3, PAT, { face: R.expr('shocked', { look: [0.7, -0.9], turn: 0.4 }) }), { rim: RIM });
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.2 });
});
// E3 (s07 "Sixty-five, admin fee."): wide — the receipt keeps climbing out of the phone above his head
shot('E3 $65', tL3 - 0.15, tTot - 0.35, (ctx, t, lt) => {
  const c = cam([[0, 60, -760, 1.45], [2.6, 60, -790, 1.38]], lt);
  ctx.fillStyle = '#E9E2D2'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 5, g => layer(g, { ...c, x: c.x + 200 }, 1, w => S.terminalIn(w, t, { boardX: -500, crowd: true })));
  layer(ctx, c, 1, w => {
    LT.castShadow(w, g => R.figure(g, -230, 0, 1, 1, PAT, { lean: -0.05 }), { x: -230, floorY: 0, a: 0.2, blur: 3 });
    w.save(); w.translate(-420, 0); S.suitcase(w, 0.9, C.red); w.restore();
    LT.lit(w, g => R.figure(g, -230, 0, 1, 1, PAT, { lean: -0.06, headTilt: -0.2, armN: { hand: [192, -380], grip: 'hold' }, armF: { hand: [-60, -200], grip: 'relax' },
      face: R.expr('worried', { look: [1, -1] }) }), { rim: RIM });
    w.save(); w.translate(-230 + 192 + 20, -400); S.phone(w, billScreen, 0.3); w.restore();
    billUp(w, -18, -472, 0.5, t, { hl: 2, rot: 0.16 });
  });
  LT.grade(ctx, 'day', { vignette: 0.16 });
});
// E4 (s08 "Total: four-forty."): the TOTAL prints; $440 slams; his shocked face
shot('E4 total', tTot - 0.35, ST.s09 - 0.12, (ctx, t, lt) => {
  hallBg(400, -1000, 1.2, 'day', 12)(ctx, t);
  const sh = shake(t, tTot + 0.1, 16);
  ctx.save(); ctx.translate(sh, 0);
  billUp(ctx, 600, 1420, 0.98, t, { rot: 0.03 });
  ctx.restore();
  // big equation strip
  const u = pop(t, tTot + 0.1, 0.3, 2);
  if (u > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(u, u); ctx.rotate(-0.03); CL.cutout(ctx, () => rr(ctx, -470, -70, 940, 120, 16), C.red, { elev: 1.6 }); fitTxt(ctx, '$250 + $125 + $65 = $440', 0, 18, 70, '#FFFDF8', 880); ctx.restore(); }
  LT.lit(ctx, c => R.bust(c, 105, 1900, 2.1, PAT, { face: R.expr('shocked', { look: [0.6, -0.5], turn: 0.3 }), headTilt: -0.05 }), { rim: RIM });
  LT.grade(ctx, 'day', { vignette: 0.2 });
});

// F1 (s09 "Then came an offer. Pay within two days, save fifty-two bucks."): at the gate, a coupon pops out of the phone with a 2-day stopwatch
const tOffer = at('s09', 'offer'), t52 = at('s09', 'fifty-two'), tWeek = at('s09', 'within', 1), t3250 = at('s09', 'thirty-two');
shot('F1 offer', ST.s09 - 0.12, tWeek - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 80, -330, 1.45], [4.5, 110, -345, 1.55]], lt);
  ctx.fillStyle = '#E9E2D2'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 5, g => layer(g, { ...c, x: c.x - 300 }, 1, w => S.terminalIn(w, t, { light: 'golden', board: false, crowd: false, gate: [300, -1250] })));
  layer(ctx, c, 1, w => {
    S.seats(w, -280, 4);
    LT.lit(w, g => R.figure(g, 10, -60, 1, 1, PAT, { hip: [0, -170], lean: -0.08, legN: { foot: [170, 60] }, legF: { foot: [140, 60] }, armN: { hand: [120, -300], grip: 'hold' }, armF: { hand: [60, -230], grip: 'relax' },
      face: R.exprMix('tired', R.expr('skeptical', { look: [0.5, -0.9] }), seg(t, tOffer, tOffer + 0.4)), headTilt: -0.1 }), { rim: RIM });
    w.save(); w.translate(148, -400); S.phone(w, (p, ww, hh) => S.appNotify(p, ww, hh, 1), 0.26); w.restore();
  });
  // the coupon flying out of the phone
  const u = pop(t, tOffer - 0.1, 0.45, 1.6);
  if (u > 0) { const fy = lerp(1000, 540, E.out(seg(t, tOffer - 0.1, tOffer + 0.4)));
    ctx.save(); ctx.translate(lerp(560, 720, E.out(seg(t, tOffer - 0.1, tOffer + 0.4))), fy + Math.sin(t * 2.5) * 8); ctx.rotate(0.05 + Math.sin(t * 1.7) * 0.02); ctx.scale(u * 0.9, u * 0.9);
    S.coupon(ctx, t > t52 ? '−$52' : 'SAVE', 'PAY IN 2 DAYS', {}); ctx.restore();
    const sw = pop(t, at('s09', 'two') - 0.1, 0.3); if (sw > 0) { ctx.save(); ctx.translate(190, 500); ctx.scale(sw, sw); S.stopwatch(ctx, 70, (t - at('s09', 'two')) * 0.25, { label: '2 DAYS' }); ctx.restore(); }
    if (t > t52) { const st = pop(t, t52, 0.25, 2.6); ctx.save(); ctx.translate(560, 390); ctx.rotate(-0.2); ctx.scale(st * 0.8, st * 0.8); ctx.strokeStyle = C.red; ctx.lineWidth = 8; rr(ctx, -140, -44, 280, 88, 14); ctx.stroke(); txt(ctx, 'OFFER', 0, 22, 62, C.red); ctx.restore(); } }
  LT.grade(ctx, 'golden', { vignette: 0.18 });
});
// F2 (s09 "Within a week, thirty-two fifty."): close — he pinches the coupon; it flips to the 7-day version; his squint
shot('F2 week', tWeek - 0.12, ST.s10 - 0.12, (ctx, t, lt) => {
  const fl = k(t, t3250 - 0.35, t3250 + 0.05), sx = Math.abs(Math.cos(fl * Math.PI)), back = fl > 0.5;
  patBust(ctx, lt, c => hallBg(-300, -1000, 1.1, 'golden', 12)(c, t), { x: 300, ny: 1520, s: 2.4, push: 0.03,
    face: R.expr('squint', { look: [0.9, -0.5], blink: blink(lt, 2.5) }), tilt: 0.06, rim: { ...RIM, color: '#FFDCA0' },
    hands: [{ side: 1, hand: [190, -250], elbow: [290, 300], grip: 'pinch' }] });
  ctx.save(); ctx.translate(690, 830); ctx.rotate(0.06); ctx.scale(1.0 * Math.max(0.04, sx), 1.0);
  S.coupon(ctx, back ? '−$32.50' : '−$52', back ? 'PAY IN 7 DAYS' : 'PAY IN 2 DAYS', { col: back ? '#FFE3A0' : C.yellow, w: 520, bigSize: 120 }); ctx.restore();
  const sw = pop(t, t3250, 0.3); if (sw > 0) { ctx.save(); ctx.translate(800, 480); ctx.scale(sw, sw); S.stopwatch(ctx, 76, 0.1 + (t - t3250) * 0.05, { label: '7 DAYS' }); ctx.restore(); }
  LT.grade(ctx, 'golden', { vignette: 0.18 });
});

// G1 (s10 "Patrick wanted to dispute it."): determined; he lifts the phone. ("He opened the chat."): his finger taps the chat — we dive into the screen
const tDisp = at('s10', 'dispute'), tOpen = at('s10', 'opened');
shot('G1 dispute', ST.s10 - 0.12, tOpen - 0.15, (ctx, t, lt) => {
  patBust(ctx, lt, c => hallBg(200, -950, 1.15, 'golden', 12)(c, t), { x: 400, ny: 1480, s: 2.6, push: 0.04,
    face: R.exprMix('squint', R.expr('skeptical', { look: [0.2, 0.2] }), k(t, tDisp - 0.2, tDisp + 0.3)), tilt: -0.04, rim: { ...RIM, color: '#FFDCA0' },
    hands: [{ side: 1, hand: [150, -120], elbow: [260, 360], grip: 'hold', item: phoneItem((p, w, h) => { S.appHeader(p, w, 'DAMAGE CHARGES'); p.fillStyle = '#F7F5F0'; p.fillRect(0, 64, w, h - 64);
      p.fillStyle = C.red; rr(p, 20, 300, w - 40, 70, 35); p.fill(); fitTxt(p, 'DISPUTE', w / 2, 346, 32, '#FFFDF8', w - 60); }, 0.4) }] });
  label(ctx, 'DISPUTE', 540, 470, pop(t, tDisp), { size: 66, col: C.red, fg: '#FFFDF8' });
  LT.grade(ctx, 'golden', { vignette: 0.18 });
});
const tIn = at('s10', 'chat') + 0.1;
shot('G1b tap', tOpen - 0.15, ST.s11 - 0.1, (ctx, t, lt) => {
  hallBg(-100, -950, 1.3, 'golden', 14)(ctx, t);
  const dive = E.in(seg(t, tIn - 0.35, ST.s11 - 0.1)), z = lerp(2.9, 12, dive), tap = seg(t, at('s10', 'chat') - 0.3, at('s10', 'chat'));
  ctx.save(); ctx.translate(540, lerp(1000, 1180, dive)); ctx.scale(z / 2.9, z / 2.9); ctx.translate(-540, -1000);
  LT.lit(ctx, c => { R.tube(c, [[700, 2100], [660, 1550]], 150, PAT.top, 5); R.hand(c, [620, 1370], -1.9, PAT.skin, 'hold', { size: 3.0 }); }, { rim: RIM });
  ctx.save(); ctx.translate(540, 1000); S.phone(ctx, (p, w, h) => { S.appHeader(p, w, 'MESSAGES'); p.fillStyle = '#F7F5F0'; p.fillRect(0, 64, w, h - 64);
    p.fillStyle = tap > 0.8 ? '#3A72D9' : S.BLUE; rr(p, 30, 180, w - 60, 90, 45); p.fill(); fitTxt(p, 'CHAT', w / 2, 238, 40, '#FFFDF8', w - 80); }, 2.9); ctx.restore();
  LT.lit(ctx, c => R.hand(c, [lerp(240, 400, tap), lerp(1500, 1260, tap)], -0.9, PAT.skin, 'point', { size: 3.0 }), { rim: RIM });
  ctx.restore();
  if (dive > 0.7) { ctx.fillStyle = `rgba(247,245,240,${(dive - 0.7) / 0.3})`; ctx.fillRect(0, 0, W, H); }
  LT.grade(ctx, 'golden', { vignette: 0.16 });
});

// G2 (s11 "It was a bot. It couldn't connect him to a human."): inside the chat — a friendly help bot waves, grabs a plug for HUMAN AGENT; the cord is too short
const tBot = at('s11', 'bot'), tCouldnt = at('s11', "couldn't"), tHuman = at('s11', 'human'), tFlag = at('s11', 'flag'), tLater = at('s11', 'later');
function chatRoom(ctx, t) { // the inside of the chat window: a soft blue paper room with the UI frame edges
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#DCE8FA'); g.addColorStop(1, '#C3D5F0'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 6; i++) { rr(ctx, 70 + (i % 2) * 380, 360 + i * 170, 560, 110, 55); ctx.fill(); }
  ctx.fillStyle = '#2E3A59'; ctx.fillRect(0, 0, W, 190); txt(ctx, 'CLAIM HELP', 540, 140, 52, '#FFFDF8');
  ctx.fillStyle = '#B9C9E2'; ctx.fillRect(0, 1380, W, 540); ctx.fillStyle = 'rgba(46,58,89,0.15)'; ctx.fillRect(0, 1380, W, 14);
}
shot('G2 bot', ST.s11 - 0.1, tFlag - 0.5, (ctx, t, lt) => {
  chatRoom(ctx, t);
  const wave = t < tCouldnt ? Math.sin(t * 9) * 40 : 0, reach = k(t, tCouldnt - 0.1, tHuman - 0.1), fail = t > tHuman - 0.1;
  const bx = lerp(430, 560, reach), tug = fail ? Math.sin((t - tHuman) * 30) * 10 * (1 - seg(t, tHuman + 0.4, tHuman + 0.8)) : 0;
  // socket on the right wall, plug cord from the bot's base
  ctx.save(); ctx.translate(900, 980); S.socket(ctx); ctx.restore();
  const hand = [lerp(190, 300, reach) + tug, lerp(-150 + wave * 0, -260, reach)];
  const hw = [bx + hand[0] * 1.15, 1380 + hand[1] * 1.15];
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(bx - 60, 1340); ctx.quadraticCurveTo(lerp(bx, hw[0], 0.5), lerp(1500, 1380, reach), hw[0], hw[1] + 30); ctx.stroke();
  ctx.save(); ctx.translate(bx, 1380); LT.lit(ctx, c => S.bot(c, 1.15, { face: fail ? 'no' : 'smile', arm: hand, armL: t < tCouldnt ? [-200, -330 + wave] : [-190, -150], blink: blink(lt, 2) > 0, tilt: fail ? Math.sin((t - tHuman) * 12) * 0.08 * (1 - seg(t, tHuman + 0.5, tHuman + 1)) : 0 }), { rim: RIM_COOL }); ctx.restore();
  ctx.save(); ctx.translate(hw[0] + 20, hw[1]); S.plug(ctx, Math.PI / 2); ctx.restore();
  // the gap: "too short" dashed line between plug and socket
  if (fail) { const a = seg(t, tHuman, tHuman + 0.2); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(hw[0] + 90, hw[1]); ctx.lineTo(820, 960); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    label(ctx, 'NO HUMAN', 540, 450, pop(t, tHuman), { size: 70, col: C.red, fg: '#FFFDF8' }); }
  else label(ctx, 'BOT', 540, 450, pop(t, tBot - 0.05), { size: 80, col: S.BLUE, fg: '#FFFDF8' });
  LT.grade(ctx, 'office', { vignette: 0.16 });
});
// G3 (s11 "It could flag his claim... for later."): the bot sticks a flag in the CLAIM card and files it in the LATER tray
shot('G3 later', tFlag - 0.5, tLater + 0.42, (ctx, t, lt) => {
  chatRoom(ctx, t);
  const c0 = [330, 660], dropT = tLater - 0.5, fileU = k(t, dropT, tLater + 0.05), card = [lerp(c0[0], 300, fileU), lerp(c0[1], 1180, fileU) - Math.sin(fileU * Math.PI) * 200];
  ctx.save(); ctx.translate(300, 1320); S.tray(ctx, 'LATER'); ctx.restore();
  ctx.save(); ctx.translate(720, 1380); LT.lit(ctx, c => S.bot(c, 1.1, { face: t > tLater ? 'smile' : 'busy', arm: [-120 + (card[0] - 720) / 1.1 * 0.15, -330], armL: [lerp(-150, (card[0] - 720) / 1.1, fileU), lerp(-380, (card[1] - 1380) / 1.1, fileU)], blink: blink(lt, 1.8) > 0 }), { rim: RIM_COOL }); ctx.restore();
  ctx.save(); ctx.translate(card[0], card[1]); ctx.rotate(-0.08 + fileU * 0.3); S.claimCard(ctx, 1.3, seg(t, tFlag - 0.05, tFlag + 0.25)); ctx.restore();
  label(ctx, 'FLAGGED', 540, 450, pop(t, tFlag), { size: 70, col: C.yellow });
  LT.grade(ctx, 'office', { vignette: 0.16 });
});

// H1 (s12 "So he emailed."): back in the terminal at dusk — deadpan; a paper-plane email leaves the phone
const tEmail = at('s12', 'emailed'), tReply = at('s12', 'a'), tTen = at('s12', 'ten');
shot('H1 email', tLater + 0.42, tReply - 0.12, (ctx, t, lt) => {
  patBust(ctx, lt, c => hallBg(100, -950, 1.15, 'evening', 12)(c, t), { x: 380, ny: 1500, s: 2.5, push: 0.02,
    face: R.expr(t < tEmail ? 'tired' : 'squint', { look: t < tEmail ? [0, 0.1] : [1, -0.4], blink: blink(lt, 2.2) }), tilt: t < tEmail ? 0 : 0.05, rim: { ...RIM, color: '#FFB070' }, shadeCol: 'rgb(190,180,225)',
    hands: [{ side: 1, hand: [140, -60], elbow: [250, 380], grip: 'hold', item: phoneItem((p, w, h) => { S.appHeader(p, w, 'EMAIL'); p.fillStyle = '#F7F5F0'; p.fillRect(0, 64, w, h - 64); p.fillStyle = S.BLUE; rr(p, 30, 340, w - 60, 70, 35); p.fill(); fitTxt(p, 'SEND', w / 2, 386, 30, '#FFFDF8', w - 60); }, 0.4) }] });
  const fu = seg(t, tEmail - 0.1, tReply - 0.12); if (fu > 0) { ctx.save(); ctx.translate(lerp(720, 1250, E.in(fu)), lerp(960, 420, fu) + Math.sin(fu * 9) * 20); ctx.rotate(-0.5); S.paperPlane(ctx, 1.6); ctx.restore(); }
  LT.grade(ctx, 'evening', { vignette: 0.2 });
});

// H2-H3: the day path (calendar tiles on the floor). Two deadlines on the same road: DISCOUNT EXPIRES DAY 7, EMAIL REPLY UP TO 10 DAYS.
// Possible deadlines only: no reply is shown arriving.
const TW = 430, TX0 = -2150; const tileX = d => TX0 + (d - 1) * TW + TW / 2; // centre of DAY d
const tDisc = at('s13', 'discount'), tGone = at('s13', 'gone'), t7 = at('s13', 'seven');
function w_post(ctx, x, y) { ctx.fillStyle = '#5A3A22'; ctx.fillRect(x - 11, y, 22, -y); } // extend a raised sign post down to the road
function dayWorld(ctx, t, skyU) {
  // sky cycles day / night with the days (skyU = days passed, fractional)
  const ph = skyU % 1, night = Math.max(0, Math.sin(ph * Math.PI * 2 - 0.6)) ** 1.3;
  const top = K.lerpCol('#9CC9F0', '#28315E', night), bot = K.lerpCol('#FCE6C2', '#5D4C8A', night);
  S.sky(ctx, top, bot, -4000, 4000, -3000, 0);
  const sa = ph * Math.PI * 2; ell(ctx, Math.cos(sa) * 1400 - 1000 + skyU * 0, -900 - Math.sin(sa) * 700, 80, 80); ctx.fillStyle = night > 0.5 ? '#F4F1E6' : '#FFE29A'; ctx.fill();
  if (night > 0.2) { ctx.fillStyle = `rgba(255,255,255,${night})`; for (let i = 0; i < 40; i++) { ell(ctx, -3500 + K.hash(i) * 7000, -2800 + K.hash(i + 7) * 1900, 5, 5); ctx.fill(); } }
  // hills
  ctx.fillStyle = K.lerpCol('#9DC79B', '#3E4E6A', night); ctx.beginPath(); ctx.moveTo(-4000, 0); for (let x = -4000; x <= 4000; x += 400) ctx.lineTo(x, -220 - Math.sin(x * 0.002) * 120 - K.hash(x) * 60); ctx.lineTo(4000, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = K.lerpCol('#E6D9BE', '#5A5470', night); ctx.fillRect(-4000, 0, 8000, 1800);
  S.dayTiles(ctx, TX0, TW, 10, { hl: { 7: '#FFE3A0', 10: '#D6E5FF' } });
  ctx.save(); ctx.translate(tileX(7) + 330, -360); S.signPost(ctx, ['DISCOUNT EXPIRES:', 'DAY 7'], C.yellow, INK, 0.9); ctx.restore(); w_post(ctx, tileX(7) + 330, -360);
  ctx.save(); ctx.translate(tileX(10) + 230, -10); S.mailbox(ctx, 1.1); ctx.restore();
  ctx.save(); ctx.translate(tileX(10) - 160, -360); S.signPost(ctx, ['EMAIL REPLY:', 'UP TO 10 DAYS'], '#D6E5FF', INK, 0.9); ctx.restore(); w_post(ctx, tileX(10) - 160, -360);
  return night;
}
shot('H2 ten days', tReply - 0.12, ST.s13 - 0.12, (ctx, t, lt) => {
  // pan along the road from DAY 1 to the far sign at DAY 10 (the email plane is a dot far ahead in the sky)
  const u = k(t, tReply - 0.1, tTen + 0.1), c = { x: lerp(tileX(5), tileX(10), u), y: -600, z: lerp(0.7, 0.82, u), r: 0 };
  ctx.fillStyle = '#9CC9F0'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => { dayWorld(w, t, 0.15); w.save(); w.translate(lerp(tileX(4), tileX(11) + 300, u), -1150 - u * 300); w.rotate(-0.25); S.paperPlane(w, 1.4); w.restore(); });
  const s10 = pop(t, tTen, 0.3, 2); if (s10 > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(s10, s10); CL.cutout(ctx, () => rr(ctx, -330, -64, 660, 116, 16), '#2E3A59', { elev: 1.4 }); txt(ctx, 'UP TO 10 DAYS', 0, 22, 70, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.16 });
});
shot('H3 gone', ST.s13 - 0.12, ST.s14 - 0.15, (ctx, t, lt) => {
  // Patrick on DAY 1 with the discount balloon; he hurries day by day (sky cycling); the balloon pops at DAY 7; pull back to both signs
  const go = seg(t, tDisc + 0.25, t7 - 0.05), days = go * 6, px0 = tileX(1) + days * TW - 60 * go, popT = t7 + 0.02, pull = k(t, t7 + 0.35, ST.s14 - 0.2);
  const c = { x: lerp(px0 + 150 + 120 * go, tileX(8) + 330, pull), y: lerp(-430, -620, pull), z: lerp(0.95, 0.6, pull), r: 0 };
  ctx.fillStyle = '#9CC9F0'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    dayWorld(w, t, 0.15 + days);
    const running = go > 0 && go < 1, ph = t * 14, P = running ? R.walk(ph, { stride: 90, lift: 46, bob: 14 }) : { hip: [0, -252], legN: { foot: [24, 0] }, legF: { foot: [-22, 0] } };
    const popped = t > popT, look = popped ? (t < t7 + 0.5 ? [0.6, -1] : [-0.2, 0.15]) : [0.5, -0.8];
    const face = popped ? R.exprMix(R.expr('shocked', { look }), R.expr('tired', { look }), seg(t, t7 + 0.5, t7 + 0.9)) : running ? R.expr('worried', { look: [1, -0.2] }) : R.expr('neutral', { look, blink: blink(lt, 2) });
    const hand = [70, -330];
    LT.castShadow(w, g => R.figure(g, px0, 0, 1, 1, PAT, P), { x: px0, floorY: 0, a: 0.2, blur: 3 });
    LT.lit(w, g => R.figure(g, px0, 0, 1, 1, PAT, { ...P, lean: running ? 0.18 : 0, armN: { hand, grip: 'fist' }, armF: P.armF || { hand: [-14, -64] }, face, headTilt: popped ? 0 : -0.15 }), { rim: RIM });
    // the balloon on its string
    const hw = [px0 + hand[0], hand[1]], bxy = [hw[0] - 170 - (running ? 60 : 0) + Math.sin(t * 2) * 12, -700 + Math.sin(t * 2.6) * 10];
    if (!popped) { w.strokeStyle = INK; w.lineWidth = 3; w.beginPath(); w.moveTo(hw[0], hw[1]); w.quadraticCurveTo(lerp(hw[0], bxy[0], 0.5) + 30, lerp(hw[1], bxy[1], 0.5), bxy[0], bxy[1] - 4); w.stroke(); }
    w.save(); w.translate(bxy[0], bxy[1]); S.balloon(w, '−$32.50', popped ? seg(t, popT, popT + 0.35) : 0, 1.1); w.restore();
  });
  // the comparison, big and readable once both signs are in view
  const cu = pop(t, t7 + 0.4, 0.3, 1.8); if (cu > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(cu, cu);
    CL.cutout(ctx, () => rr(ctx, -440, -120, 880, 120, 16), C.yellow, { elev: 1.6 }); fitTxt(ctx, 'DISCOUNT EXPIRES: DAY 7', 0, -38, 64, INK, 820);
    CL.cutout(ctx, () => rr(ctx, -440, 16, 880, 120, 16), '#D6E5FF', { elev: 1.6 }); fitTxt(ctx, 'EMAIL REPLY: UP TO 10 DAYS', 0, 98, 64, INK, 820); ctx.restore(); }
  LT.grade(ctx, 'day', { vignette: 0.16 });
});

// I1 (s14): the review desk — "HERTZ LATER SAID": a live agent checks the BEFORE / AFTER photos and confirms the damage was new
const tChecked = at('s14', 'checked'), tConf = at('s14', 'confirmed');
shot('I1 agent', ST.s14 - 0.15, ST.s15 - 0.12, (ctx, t, lt) => {
  const c = cam([[0, 0, -700, 0.95], [4.4, 0, -720, 1.03]], lt);
  ctx.fillStyle = '#DDE5EE'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 6, g => layer(g, c, 1, w => S.office(w, t)));
  // the agent behind the desk (front bust), headset
  const lookAt = t < tChecked ? [-0.6, 0.4] : t < tConf ? [0.6, 0.4] : [0, 0.1];
  LT.lit(ctx, g => { R.bust(g, 540, 1080, 1.9, AGENT, { face: R.expr(t > tConf + 0.1 ? 'smile' : 'thinking', { look: lookAt, blink: blink(lt, 2.4) }), headTilt: t < tConf ? 0.04 : 0 });
    g.save(); g.translate(540, 1080 - 112 * 1.9); g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 78 * 1.9 + 8, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    ell(g, -78 * 1.9 - 6, 10, 26, 40); R.fillStroke(g, '#3A3F48', 4); g.lineWidth = 7; g.beginPath(); g.moveTo(-78 * 1.9, 40); g.quadraticCurveTo(-110, 170, -40, 160); g.stroke(); ell(g, -36, 160, 12, 10); R.fillStroke(g, '#3A3F48', 3); g.restore(); },
    { rim: { dir: [0, -1], color: '#E6F0FF', w: 7, a: 0.8 }, glow: { x: 540, y: 1100, r: 700, color: 'rgb(150,190,240)', a: 0.3 } });
  // desk + two monitors in front
  CL.cutout(ctx, () => rr(ctx, -60, 1290, 1200, 700, 0), '#8B6A4E', { elev: 1, tex: 0.3 }); ctx.fillStyle = '#A88464'; ctx.fillRect(-60, 1290, 1200, 18);
  const chk = seg(t, tConf, tConf + 0.4);
  ctx.save(); ctx.translate(250, 1170); ctx.rotate(0.05); S.monitor(ctx, 400, 270, (p, w, h) => S.wheelPhoto(p, w, h, 'BEFORE', 0)); ctx.restore();
  ctx.save(); ctx.translate(830, 1170); ctx.rotate(-0.05); S.monitor(ctx, 400, 270, (p, w, h) => S.wheelPhoto(p, w, h, 'AFTER', 1, chk)); ctx.restore();
  // magnifier sweeping across the photos
  const mx = t < tChecked ? 250 : lerp(250, 850, k(t, tChecked, tChecked + 0.6)); if (t > tChecked - 0.3 && t < tConf + 0.2) { ctx.save(); ctx.translate(mx, 1180 + Math.sin(t * 4) * 10); ell(ctx, 0, 0, 90, 90); ctx.fillStyle = 'rgba(220,240,255,0.25)'; ctx.fill(); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); R.tube(ctx, [[60, 70], [150, 170]], 30, '#5A3A22', 5); ctx.restore(); }
  // the stamp: CONFIRMED NEW
  const st = pop(t, tConf + 0.1, 0.25, 2.6); if (st > 0) { ctx.save(); ctx.translate(800, 1250); ctx.rotate(-0.08); ctx.scale(st * 0.9, st * 0.9); ctx.fillStyle = 'rgba(255,253,248,0.92)'; rr(ctx, -220, -50, 440, 100, 14); ctx.fill(); ctx.strokeStyle = '#1C8A52'; ctx.lineWidth = 9; rr(ctx, -220, -50, 440, 100, 14); ctx.stroke(); txt(ctx, '✓ CONFIRMED NEW', 0, 20, 52, '#1C8A52'); ctx.restore(); }
  label(ctx, 'HERTZ LATER SAID', 540, 470, pop(t, ST.s14 - 0.05), { size: 60, col: '#FFC857' });
  LT.grade(ctx, 'office', { vignette: 0.16 });
});

// J1 (s15 "But look at that one twenty-five again."): the receipt again; a magnifier slides onto the $125 line; Patrick leans in
const tAgain = at('s15', 'again'), tCalls = at('s15', 'calls'), tDetect = at('s15', 'detect'), tEst = at('s15', 'estimate');
shot('J1 look again', ST.s15 - 0.12, tCalls - 0.45, (ctx, t, lt) => {
  hallBg(0, -950, 1.2, 'evening', 13)(ctx, t);
  const z = lerp(1.0, 1.3, k(t, ST.s15, tAgain + 0.2));
  ctx.save(); ctx.translate(560, 800); ctx.scale(z, z); billAt(ctx, 0, -RTOP - RLH * 1.5 - 30, 1.15, { hl: 1, hlCol: 'rgba(230,57,70,0.28)', rot: 0.02 }); ctx.restore();
  const mu = k(t, at('s15', 'one') - 0.3, at('s15', 'one') + 0.2, E.out); if (mu > 0) { ctx.save(); ctx.translate(lerp(1300, 640, mu), 790); ell(ctx, 0, 0, 170, 170); ctx.fillStyle = 'rgba(220,240,255,0.22)'; ctx.fill(); ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke(); R.tube(ctx, [[120, 120], [260, 280]], 46, '#5A3A22', 5); ctx.restore(); }
  LT.lit(ctx, c => R.bust(c, 95, 1980, 2.2, PAT, { face: R.expr('skeptical', { look: [1, -0.6], turn: 0.4 }), headTilt: 0.05 }), { rim: { ...RIM, color: '#FFB070' } });
  LT.grade(ctx, 'evening', { vignette: 0.18 });
});
// J2 (s15 "Hertz calls it 'the cost to detect and estimate the damage.'"): the $125 line tears off and turns over: Hertz's own definition;
// DETECT lights the camera pod, ESTIMATE ticks a calculator
shot('J2 definition', tCalls - 0.45, ST.s16 - 0.12, (ctx, t, lt) => {
  hallBg(-200, -950, 1.25, 'evening', 14)(ctx, t);
  const fl = k(t, tCalls - 0.4, tCalls + 0.15), sx = Math.abs(Math.cos(fl * Math.PI)), back = fl > 0.5, z = 1 + lt * 0.035;
  ctx.save(); ctx.translate(540, 740 + Math.sin(lt * 1.3) * 8); ctx.scale(z, z); ctx.rotate(-0.03 + Math.sin(lt * 0.9) * 0.012);
  ctx.scale(Math.max(0.03, sx), 1);
  if (!back) { CL.cutout(ctx, () => rr(ctx, -430, -120, 860, 240, 18), '#FFFDF8', { elev: 1.8 }); txt(ctx, '$125', -170, 40, 130, C.red); fitTxt(ctx, 'PROCESSING FEE', 230, 30, 46, '#5A5450', 330); }
  else { CL.cutout(ctx, () => rr(ctx, -460, -300, 920, 600, 20), '#FFFDF8', { elev: 1.8 });
    txt(ctx, '$125 PROCESSING FEE', 0, -210, 50, C.red); ctx.fillStyle = 'rgba(90,84,80,0.35)'; ctx.fillRect(-400, -180, 800, 5);
    const wds = [['“THE COST TO', -110, null], ['DETECT', -10, tDetect], ['AND ESTIMATE', 90, tEst], ['THE DAMAGE.”', 190, null]];
    for (const [s, y, tw] of wds) { const on = tw && t > tw - 0.05; if (on) { ctx.font = `86px ${F.black}`; const w = ctx.measureText(s).width + 40; ctx.fillStyle = C.yellow; rr(ctx, -w / 2, y - 70, w, 92, 12); ctx.fill(); } txt(ctx, s, 0, y, 86, INK); }
    fitTxt(ctx, '— HERTZ', 300, 280, 40, '#5A5450', 300); }
  ctx.restore();
  // the two things the fee is for, as props that act on the words
  const dU = pop(t, tDetect - 0.05, 0.3), eU = pop(t, tEst - 0.05, 0.3);
  if (dU > 0) { ctx.save(); ctx.translate(230, 1150); ctx.scale(dU * 1.5, dU * 1.5); S.cameraPod(ctx, 1, { flash: Math.max(0, 1 - (t - tDetect) * 3), on: 1 }); ctx.restore(); label(ctx, 'DETECT', 230, 1340, dU, { size: 48, col: C.yellow }); }
  if (eU > 0) { ctx.save(); ctx.translate(800, 1170); ctx.scale(eU * 0.85, eU * 0.85); ctx.rotate(0.06); CL.cutout(ctx, () => rr(ctx, -110, -150, 220, 300, 22), '#3A3F48', { elev: 1.4, tex: 0.2 }); ctx.fillStyle = '#C9F2D4'; rr(ctx, -84, -124, 168, 70, 10); ctx.fill(); fitTxt(ctx, '$250', 30, -72, 44, INK, 140, 'right');
    for (let i = 0; i < 9; i++) { const bx = -70 + (i % 3) * 70, by = -20 + Math.floor(i / 3) * 56, pr = Math.floor((t - tEst) * 8) % 9 === i; rr(ctx, bx - 26, by - 20, 52, 42, 8); ctx.fillStyle = pr ? C.yellow : '#E9E7E2'; ctx.fill(); } ctx.restore(); label(ctx, 'ESTIMATE', 800, 1340, eU, { size: 48, col: C.yellow }); }
  LT.grade(ctx, 'evening', { vignette: 0.18 });
});

// K1 (s16 "The scanner found the scuff..."): back at the arch at night — a car rolls through, the red box finds the rear wheel again
const tFound = at('s16', 'found'), tAnd = at('s16', 'and'), tLine = at('s16', 'line'), tToo = at('s16', 'too');
shot('K1 found', ST.s16 - 0.12, tAnd - 0.12, (ctx, t, lt) => {
  const cx = lerp(120, 220, seg(lt, 0, 1.6)), c = cam([[0, 300, -380, 1.35], [1.6, 300, -300, 1.6]], lt);
  ctx.fillStyle = '#2C3038'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 6, g => layer(g, { x: 0, y: -600, z: 0.8 }, 1, w => S.garage(w, t, { sign: false })));
  ctx.fillStyle = 'rgba(20,24,34,0.4)'; ctx.fillRect(0, 0, W, H);
  layer(ctx, c, 1, w => {
    S.archSide(w, 'back', { on: 1 });
    w.save(); w.translate(cx + 330, 0); LT.lit(w, g => S.carSide(g, { rot: -t * 2, scuff: 1, scanT: seg(lt, 0, 1.2) }), { rim: RIM_COOL });
    w.translate(-300, -92); S.detectBox(w, 64.4, seg(t, tFound, tFound + 0.5), '≈ 1 INCH', 1.6, 2.2); w.restore();
    S.archSide(w, 'front', { on: 1, scanY: (t * 1.3) % 1 });
  });
  LT.grade(ctx, 'dark', { vignette: 0.24 });
});
// K2 (s16 "...and the bill had a line for that, too."): the arch prints the bill out of its beam; Patrick catches the end and looks at us. Loop: $440.
shot('K2 line', tAnd - 0.12, T + 0.01, (ctx, t, lt) => {
  // closer: the bill hangs from a slot in the arch beam down to Patrick's hand; the $125 line gets its note; he looks at us
  const c = cam([[0, 80, -840, 0.92], [3, 90, -820, 0.98]], lt);
  ctx.fillStyle = '#2C3038'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, 6, g => layer(g, { x: 0, y: -700, z: 0.7 }, 1, w => S.garage(w, t, { sign: false })));
  ctx.fillStyle = 'rgba(20,24,34,0.35)'; ctx.fillRect(0, 0, W, H);
  const pr = k(t, tAnd - 0.1, tLine + 0.1, E.out), SX = 300, SY = -S.ARCH.h - 10, s = 0.95;
  layer(ctx, c, 1, w => {
    S.archFront(w, { on: 1 });
    const len = lerp(60, (RLEN[4] + 40) * s, pr);
    w.save(); w.beginPath(); w.rect(SX - RW, SY, RW * 2, len); w.clip();
    billAt(w, SX, SY, s, { hl: t > tLine - 0.1 ? 1 : -1, hlCol: 'rgba(230,57,70,0.32)', rot: 0, elev: 1.6 }); w.restore();
    rr(w, SX - RW * s / 2 - 30, SY - 26, RW * s + 60, 40, 12); R.fillStroke(w, '#20232A', 4);
    const look = t > tToo ? [0, 0.15] : [0.8, -0.7];
    LT.lit(w, g => R.figure(g, -130, 0, 1.3, 1, PAT, { lean: -0.04, armN: { hand: [150, -380], grip: 'pinch' }, armF: { hand: [-20, -80] },
      face: R.expr(t > tToo ? 'skeptical' : 'squint', { look, blink: blink(lt, 2.7) }), headTilt: t > tToo ? 0.06 : -0.1 }), { rim: RIM_COOL });
  });
  // the note on the $125 line (screen space, always readable)
  if (t > tLine - 0.1) { const u = pop(t, tLine - 0.1, 0.3, 2); ctx.save(); ctx.translate(560, 470); ctx.scale(u, u); ctx.rotate(-0.04);
    ctx.font = `64px ${F.black}`; const str = '$125 = DETECT + ESTIMATE', ww = ctx.measureText(str).width + 50; CL.cutout(ctx, () => rr(ctx, -ww / 2, -56, ww, 100, 14), C.red, { elev: 1.6 }); txt(ctx, str, 0, 18, 64, '#FFFDF8'); ctx.restore(); }
  LT.grade(ctx, 'dark', { vignette: 0.22 });
});
function ARCHY() { return S.ARCH.h + 30; } // receipt slot: just under the beam

// ---------- edit, global overlays, subtitles ----------
SH.sort((a, b) => a.t0 - b.t0);
const ED = makeEdit(SH, W, H);
const SPLIT = { s01: [2, 5], s02: [6, 2], s03: [3, 5, 7], s04: [6, 2, 3], s05: [5], s06: [4, 3], s07: [6, 4, 3], s08: [2], s09: [4, 7, 5], s10: [5, 4], s11: [4, 7, 7], s12: [3, 8], s13: [2, 3], s14: [6, 4, 5], s15: [7, 3, 8], s16: [5, 9] };
const REPL = [[/Four hundred and forty dollars/i, '$440'], [/two-fifty/i, '$250'], [/One twenty-five/i, '$125'], [/Sixty-five/i, '$65'], [/four-forty/i, '$440'], [/fifty-two bucks/i, '$52'],
  [/thirty-two fifty/i, '$32.50'], [/two days/i, '2 days'], [/ten days/i, '10 days'], [/after seven/i, 'after 7'], [/one twenty-five/i, '$125']];
function subs() {
  const G = [];
  Object.keys(ST).forEach(id => { const ws = V.words(id); let k0 = 0; SPLIT[id].forEach(n => { G.push({ id, words: ws.slice(k0, k0 + n) }); k0 += n; }); if (k0 !== ws.length) throw new Error(`subtitle split ${id}: ${k0} vs ${ws.length}`); });
  G.forEach((g, i) => { const nx = G[i + 1], e0 = Math.min(g.words[g.words.length - 1].t1, end(g.id)) + 0.4; g.t0 = g.words[0].t0 - 0.05;
    g.t1 = nx ? (nx.id === g.id ? nx.words[0].t0 - 0.05 : Math.min(e0, nx.words[0].t0 - 0.05)) : T;
    let s = g.words.map(x => x.w).join(' '); for (const [a, b] of REPL) s = s.replace(a, b); g.text = s; });
  return G;
}
const SUBS = subs();
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  headline(ctx, t); stamp2025(ctx, t);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.26; ctx.drawImage(TEX, 0, 0); ctx.restore();
  EN.drawSubtitles(ctx, t, SUBS, { y: 1565, size: 62, maxW: 820, x: 540, highlight: ['$440', '$250', '$125', '$65', '$52', '$32.50', '7', '10', 'detect', 'estimate', 'bot', 'human'] });
}

// ---------- sound cues (for mix.py) ----------
function cues() {
  const c = [['rev', 0.0, 0.25], ['brake', 0.35, 0.3], ['scan', 0.1, 0.5], ['lock', tInch + 0.05, 0.6], ['tag', tForty, 0.9], ['slam', tForty + 0.02, 0.6]];
  c.push(['hum', ST.s02 - 0.1, 0.5], ['servo', at('s02', 'spotted') - 0.15, 0.6], ['blip', at('s02', 'never'), 0.35]);
  c.push(['cut', ST.s03 - 0.15, 0.4], ['jet', ST.s03, 0.45], ['stamp', t2025 - 0.02, 0.8], ['whoosh', tPat - 0.7, 0.35]);
  c.push(['cut', tPat - 0.12, 0.35], ['engine', tPat - 0.1, 0.35], ['tag', tPat + 0.05, 0.6], ['tag', tVW, 0.4], ['cut', at('s03', 'from') - 0.12, 0.35], ['tag', tOwned, 0.6], ['paper', tOwned + 0.05, 0.5]);
  c.push(['cut', ST.s04 - 0.12, 0.35], ['engine', ST.s04 - 0.1, 0.3], ['servo', tCams - 0.05, 0.6], ['shutter', tCams + 0.25, 0.8], ['shutter', tCams + 0.4, 0.6], ['power', tLights - 0.05, 0.7], ['scan', tLights + 0.1, 0.5], ['blip', tAI, 0.5]);
  c.push(['cut', ST.s05 - 0.15, 0.35], ['steps', ST.s05 - 0.1, 0.4], ['buzz', tBuzz - 0.05, 0.9], ['buzz', tBuzz + 0.35, 0.6]);
  c.push(['cut', ST.s06 - 0.12, 0.35], ['blip', ST.s06 + 0.1, 0.4], ['lock', tScuff, 0.6], ['tag', tAbout + 0.3, 0.4]);
  c.push(['print', ST.s07 + 0.05, 0.5], ['print', tL1 - 0.4, 0.5], ['tag', tL1 + 0.05, 0.6], ['cut', tL2 - 0.15, 0.35], ['print', tL2 - 0.1, 0.5], ['tag', tL2 + 0.35, 0.6], ['cut', tL3 - 0.15, 0.35], ['print', tL3 - 0.1, 0.5], ['tag', tL3 + 0.15, 0.6]);
  c.push(['cut', tTot - 0.35, 0.35], ['print', tTot - 0.3, 0.4], ['slam', tTot + 0.1, 0.8], ['kaching', tTot + 0.12, 0.45]);
  c.push(['cut', ST.s09 - 0.12, 0.35], ['sparkle', tOffer - 0.1, 0.5], ['tick', at('s09', 'two'), 0.4], ['tick', at('s09', 'two') + 0.5, 0.4], ['tick', at('s09', 'two') + 1.0, 0.4], ['stamp', t52, 0.5]);
  c.push(['cut', tWeek - 0.12, 0.35], ['flip', t3250 - 0.3, 0.5], ['tick', t3250 + 0.1, 0.35], ['tick', t3250 + 0.7, 0.35]);
  c.push(['cut', ST.s10 - 0.12, 0.35], ['tag', tDisp, 0.5], ['cut', tOpen - 0.15, 0.35], ['tap', at('s10', 'chat') - 0.02, 0.6], ['zoom', tIn - 0.3, 0.5]);
  c.push(['boop', ST.s11 + 0.05, 0.5], ['boop', tBot, 0.5], ['servo', tCouldnt, 0.4], ['twang', tHuman + 0.02, 0.6], ['buzzer', tHuman + 0.15, 0.45], ['cut', tFlag - 0.5, 0.3], ['pop', tFlag, 0.6], ['paper', tLater - 0.3, 0.5], ['thump', tLater + 0.05, 0.4]);
  c.push(['cut', tLater + 0.42, 0.35], ['tap', tEmail - 0.15, 0.5], ['whoosh', tEmail, 0.5], ['cut', tReply - 0.12, 0.35], ['whoosh', tReply, 0.35], ['tag', tTen, 0.6]);
  c.push(['cut', ST.s13 - 0.12, 0.3]); for (let i = 0; i < 6; i++) c.push(['tick', tDisc + 0.25 + i * (t7 - tDisc - 0.3) / 6, 0.5]);
  c.push(['balloonpop', t7 + 0.02, 0.9], ['slam', t7 + 0.47, 0.5]);
  c.push(['cut', ST.s14 - 0.15, 0.35], ['click', tChecked, 0.5], ['click', tChecked + 0.4, 0.5], ['stamp', tConf + 0.1, 0.7]);
  c.push(['cut', ST.s15 - 0.12, 0.35], ['whoosh', at('s15', 'one') - 0.3, 0.35], ['flip', tCalls - 0.35, 0.5], ['shutter', tDetect, 0.6], ['tick', tEst, 0.4], ['tick', tEst + 0.12, 0.4], ['tick', tEst + 0.25, 0.4]);
  c.push(['cut', ST.s16 - 0.12, 0.35], ['scan', ST.s16, 0.4], ['lock', tFound, 0.6], ['cut', tAnd - 0.12, 0.35], ['print', tAnd, 0.6], ['print', tAnd + 0.5, 0.5], ['tag', tLine - 0.1, 0.7], ['slam', tToo + 0.1, 0.4]);
  return c;
}
const MUSIC = { b0: 0, story: ST.s03, bill: ST.s07, offer: ST.s09, chat: ST.s11, wait: ST.s12, climax: ST.s13, hertz: ST.s14, fin: ST.s15, hit: tToo + 0.1, end: T };

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'cues') { fs.writeFileSync(`${__dirname}/cues.json`, JSON.stringify({ T, vo: Object.entries(ST), sfx: cues(), music: MUSIC })); console.log('cues ok, T =', T); }
else if (mode === 'srt') {
  const f = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(a1, SUBS.map((g, i) => `${i + 1}\n${f(g.t0)} --> ${f(g.t1)}\n${g.text}\n`).join('\n')); console.log('srt ok', SUBS.length);
}
else if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 270, th = 480, cols = Math.min(ts.length, 8), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '20px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 6, Math.floor(i / cols) * th + 22); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'shots') console.log(SH.map(s => `${s.id}\t${s.t0.toFixed(2)}–${s.t1.toFixed(2)}\t${(s.t1 - s.t0).toFixed(2)}s`).join('\n'));
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 150 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
module.exports = { T, ST, SH };
