// "Paying for coffee" v2 — comparison test on hirkit (12 s, 1080x1920, 30 fps, no audio).
// A wide: he walks in (daylight) | B1 insert: the price on the menu | B2 close-up: skeptical look, then he accepts
// | whip | C medium: the cup handover, the card comes out | D insert: tap, APPROVED, screen light on the hand
// | E close-up: lit by the terminal screen, relieved smile | F the screen | tear | G hidden world: the $5 in a paper machine.
// CLI: node scene2.js video out.mp4 | still t1,t2,... out.png
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../mcd_collage/kit');
const R = require('../../hirkit/rig');
const LT = require('../../hirkit/light');
const CL = require('../../hirkit/collage');
const { makeEdit } = require('../../hirkit/edit');
const CF = require('./cafe2');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, fillStroke, ell } = R;

const W = 1080, H = 1920, FPS = 30, T = 12;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// camera keys (log zoom) + a light handheld drift
function cam(keys, t, drift = 1) {
  let c;
  if (t <= keys[0].t) c = { ...keys[0] }; else if (t >= keys[keys.length - 1].t) c = { ...keys[keys.length - 1] };
  else for (let i = 1; i < keys.length; i++) if (t < keys[i].t) { const a = keys[i - 1], b = keys[i], u = (E[b.e || 'inOut'])(seg(t, a.t, b.t));
    c = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), r: lerp(a.r || 0, b.r || 0, u) }; break; }
  c.x += Math.sin(t * 0.9) * 5 * drift / c.z; c.y += Math.cos(t * 0.7) * 4 * drift / c.z; c.r = (c.r || 0) + Math.sin(t * 0.6) * 0.003 * drift;
  return c;
}
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) {
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
// the cafe as a full shot (back slightly soft, hero sharp and lit, foreground blurred)
function cafeShot(ctx, t, c, o = {}) {
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, o.backBlur ?? clamp((c.z - 0.62) / 1.4) * 4, g => CF.drawCafe(g, t, c, 'back', W, H));
  LT.haze(ctx, 'day', 0.1);
  CF.drawCafe(ctx, t, c, 'hero', W, H, o);
  if (o.fg !== false) halfPass(ctx, 3 + clamp(c.z - 0.5) * 4, g => CF.drawCafe(g, t, c, 'fg', W, H));
}
// the cafe as a soft background for close-ups
function cafeBokeh(ctx, t, c, blur = 10) {
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H);
  halfPass(ctx, blur, g => { CF.drawCafe(g, t, c, 'back', W, H); CF.drawCafe(g, t, c, 'hero', W, H, { noCust: true, flat: true }); });
}

// ---------- A: establishing wide ----------
const A_CAM = [{ t: 0, x: 60, y: -760, z: 0.5 }, { t: 2.1, x: 250, y: -600, z: 0.6 }];
function shotA(ctx, t) { cafeShot(ctx, t, cam(A_CAM, t)); LT.grade(ctx, 'day', { vignette: 0.12 }); }

// ---------- B1: insert, the price on the menu board ----------
function shotB1(ctx, t, lt) {
  // menu centre in wall space (820, -1550) -> camera so that the d=0.82 layer centres it
  const c = { x: 300 + (820 - 300) / 0.82 + lt * 30, y: -620 - 930 / 0.82 + lt * 10, z: 2.05 + lt * 0.3, r: -0.035 };
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H);
  CF.drawCafe(ctx, t, c, 'back', W, H);
  CF.layer(ctx, c, 0.82, g => LT.glow(g, 1170, -1610, 240, 'rgba(255,214,120,1)', 0.35), W, H); // pendant light falls on the price
  LT.grade(ctx, 'day', { vignette: 0.2 });
}

// ---------- B2 / E: front close-ups ----------
const KEYRIM = { dir: [-1, -0.3], color: '#FFF0D0', w: 7, a: 0.9 };
function bustShot(ctx, t, lt, mode) {
  const bc = mode === 'skeptic' ? { x: -760 + lt * 25, y: -980, z: 1.25 } : { x: -560 - lt * 20, y: -820, z: 1.3 };
  cafeBokeh(ctx, t, bc, 11);
  LT.glow(ctx, 260, 700, 520, 'rgba(255,248,225,1)', 0.25); // window bloom behind his left shoulder
  const push = 1 + lt * 0.035, nx = 540, ny = 1470;
  ctx.save(); ctx.translate(nx, ny); ctx.scale(push, push); ctx.translate(-nx, -ny);
  let face, hands = [], tilt = 0, lean = 0;
  if (mode === 'skeptic') {
    // looks up at the price, one brow up + narrowed eye, hand to the chin, then shrugs it off and smiles
    const think = k(lt, 0.35, 0.65) * (1 - k(lt, 1.05, 1.3)), ok = k(lt, 1.05, 1.3);
    face = R.exprMix(R.expr('skeptical', { look: [0.55, -0.75], turn: 0.25 }), R.expr('smile', { look: [0.2, 0.1], turn: 0.1 }), ok);
    if (lt < 1.05) face.lid = face.lid.map((v, i) => i === 0 ? v + 0.06 * Math.sin(lt * 5) : v); // the squint "weighs" the price
    face.blink = lt > 0.18 && lt < 0.28 ? 1 : 0; face.shadeSide = 1;
    hands = think > 0.02 ? [{ side: -1, hand: R.mix([-150, 420], [-30, -18], think), grip: 'fist' }] : [];
    tilt = -0.06 * (1 - ok) + Math.sin(clamp((lt - 1.15) / 0.35) * Math.PI) * 0.06; // little nod on "ok"
  } else {
    // lit from below by the terminal screen: brows pop up for a beat, then a relieved happy smile; the cup in his hand
    const rel = k(lt, 0.4, 0.7);
    face = R.exprMix(R.expr('surprised', { look: [0.1, 0.6], mouth: 'smile0' }), R.expr('happy', { look: [0.1, 0.2] }), rel);
    face.shadeSide = 1; face.blush = 0.7;
    hands = [{ side: 1, hand: [96, 120], grip: 'hold', item: c => { c.save(); c.translate(0, 58); R.cup(c, 0.95); c.restore(); } }];
    tilt = Math.sin(clamp((lt - 0.55) / 0.5) * Math.PI) * -0.05; lean = -0.02 * rel;
  }
  const s = 3.05, draw = c => R.bust(c, nx, ny, s, CF.CUST, { face, hands, headTilt: tilt, lean });
  const o = { rim: KEYRIM, tint: { x0: 540, y0: 0, x1: 1080, y1: 0, color: 'rgb(200,195,225)', a: 1 } };
  if (mode === 'glow') o.glow = { x: 560, y: 2150, r: 1150, color: 'rgb(60,160,105)', a: 0.5 * k(lt, -0.2, 0.2) };
  LT.lit(ctx, draw, o);
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.22 });
}

// ---------- C: medium two-shot, slightly low and over the counter clutter ----------
const C_CAM = [{ t: 4.25, x: 500, y: -420, z: 1.12, r: 0.02 }, { t: 5.95, x: 462, y: -430, z: 1.26, r: 0.008 }];
function nearClutter(ctx, t, c) { // big out-of-focus cups at the counter edge, bottom right (moves faster than the scene)
  const px0 = (500 - c.x) * 1.8, sc = c.z / 1.12;
  halfPass(ctx, 9, g => { g.save(); g.translate(930 + px0, 1960); g.scale(2.4 * sc, 2.4 * sc); for (let i = 0; i < 3; i++) { g.save(); g.translate(-60 + i * 30, -i * 38); R.cup(g, 1.1); g.restore(); }
    g.translate(-260, 0); rr(g, -50, -150, 100, 150, 16); fillStroke(g, '#F7F5F0'); g.restore(); });
}
function shotC(ctx, t) { const c = cam(C_CAM, t); cafeShot(ctx, t, c, { fg: false }); nearClutter(ctx, t, c); LT.grade(ctx, 'day', { vignette: 0.16 }); }

// ---------- D / F: the terminal close-up (screen space) ----------
function terminalArt(ctx, t) { // terminal on the counter, screen centre ≈ (560, 750)
  ctx.beginPath(); ctx.moveTo(-200, 1330); ctx.lineTo(1280, 1330); ctx.lineTo(1500, 2100); ctx.lineTo(-420, 2100); ctx.closePath(); fillStroke(ctx, '#9C6B45', 8);
  ctx.strokeStyle = 'rgba(80,45,25,0.35)'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-200 - i * 40, 1380 + i * 120); ctx.bezierCurveTo(300, 1360 + i * 130, 700, 1420 + i * 120, 1300 + i * 40, 1370 + i * 125); ctx.stroke(); }
  ctx.fillStyle = '#B98457'; ctx.fillRect(-200, 1330, 1480, 16);
  K.contact(ctx, 560, 1360, 360, 60, 0.35);
  // sunlight patch on the counter + screen light spill
  LT.glow(ctx, 180, 1450, 420, 'rgba(255,236,190,1)', 0.25);
  const ok = k(t, 6.6, 6.8, E.out); LT.glow(ctx, 560, 1380, 380, ok > 0 ? 'rgba(90,255,160,1)' : 'rgba(200,220,255,1)', 0.18 + 0.25 * ok);
  rr(ctx, 380, 1290, 360, 70, 26); fillStroke(ctx, '#2B2B2B', 7);
  ctx.save(); ctx.translate(560, 1300); ctx.rotate(-0.05);
  rr(ctx, -270, -880, 540, 880, 60); fillStroke(ctx, '#2E3138', 8);
  ctx.save(); rr(ctx, -270, -880, 540, 880, 60); ctx.clip(); ctx.fillStyle = '#3A3E47'; ctx.fillRect(-270, -880, 90, 880); ctx.fillStyle = C.red; ctx.fillRect(-270, -110, 540, 34);
  const sh = ctx.createLinearGradient(-270, 0, 270, 0); sh.addColorStop(0, 'rgba(255,240,210,0.18)'); sh.addColorStop(0.4, 'rgba(255,240,210,0)'); ctx.fillStyle = sh; ctx.fillRect(-270, -880, 540, 880); ctx.restore();
  ctx.strokeStyle = '#C9CDD6'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-30, -815, 14 + i * 16, -0.75, 0.75); ctx.stroke(); }
  const st = t >= 6.6 ? 'ok' : t >= 6.15 ? 'wait' : 'pay';
  rr(ctx, -215, -730, 430, 360, 26); fillStroke(ctx, '#11161D', 6);
  ctx.save(); rr(ctx, -205, -720, 410, 340, 20); ctx.clip();
  ctx.fillStyle = '#1B2430'; ctx.fillRect(-205, -720, 410, 340);
  if (ok > 0) { ctx.fillStyle = '#21A46B'; ctx.beginPath(); ctx.arc(0, -550, ok * 330, 0, 7); ctx.fill(); }
  ctx.textAlign = 'center';
  if (st !== 'ok' || ok < 0.6) {
    ctx.font = `120px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('$5.00', 0, -540);
    ctx.font = `40px ${F.black}`; ctx.fillStyle = C.yellow; ctx.fillText(st === 'pay' ? 'TAP CARD' : 'PROCESSING', 0, -450);
    if (st === 'wait') for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(255,200,87,${0.3 + 0.7 * (Math.floor(t * 10) % 3 === i ? 1 : 0)})`; ctx.beginPath(); ctx.arc(-40 + i * 40, -410, 10, 0, 7); ctx.fill(); }
  } else {
    const p = E.back(seg(t, 6.66, 6.92), 2.5);
    ctx.save(); ctx.translate(0, -600); ctx.scale(p, p); ell(ctx, 0, 0, 62, 62); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.strokeStyle = '#21A46B'; ctx.lineWidth = 18; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-28, 2); ctx.lineTo(-6, 24); ctx.lineTo(30, -22); ctx.stroke(); ctx.restore();
    ctx.font = `66px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('APPROVED', 0, -460);
    ctx.font = `44px ${F.black}`; ctx.fillStyle = C.yellow; ctx.fillText('$5.00', 0, -405);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.moveTo(-205, -720); ctx.lineTo(-60, -720); ctx.lineTo(-205, -480); ctx.closePath(); ctx.fill();
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].forEach((kk, i) => { const cx = -150 + (i % 3) * 150, cy = -300 + Math.floor(i / 3) * 62; rr(ctx, cx - 56, cy - 24, 112, 48, 14);
    fillStroke(ctx, i === 9 ? C.red : i === 11 ? '#21A46B' : '#F7F5F0', 4); if (kk) { ctx.font = `30px ${F.black}`; ctx.fillStyle = INK; ctx.fillText(kk, cx, cy + 11); } });
  ctx.restore();
}
function handCard(ctx, x, y, a, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  R.tube(ctx, [[160, -150], [30, -10]], 64, C.red); R.tube(ctx, [[48, -28], [34, -12]], 72, '#B82533', 4);
  R.hand(ctx, [10, 4], Math.atan2(14, -20), CF.CUST.skin, 'pinch', { over: c => { c.save(); c.translate(42, -14); c.rotate(-0.25); R.card(c, 1.1); c.restore(); } });
  ctx.restore();
}
function shotD(ctx, t, lt) {
  cafeBokeh(ctx, Math.min(t, 7.3), { x: 680 + lt * 25, y: -640, z: 1.6 }, 9);
  const z = 1 + lt * 0.04, sh = (t > 6.15 && t < 6.35) ? Math.sin((t - 6.15) * 80) * 6 * (1 - seg(t, 6.15, 6.35)) : 0;
  ctx.save(); ctx.translate(W / 2 + sh, H * 0.52); ctx.scale(z, z); ctx.rotate(Math.sin(t * 0.7) * 0.01); ctx.translate(-W / 2, -H * 0.52);
  terminalArt(ctx, t);
  if (t > 6.13 && t < 6.95) for (let i = 0; i < 3; i++) { const u = seg(t, 6.13 + i * 0.12, 6.6 + i * 0.12); if (u <= 0 || u >= 1) continue;
    ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = C.yellow; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(520, 480, 80 + u * 360, 0, 7); ctx.stroke(); ctx.restore(); }
  // the card arrives (continuing the reach from shot C), taps, lifts away; the screen lights the hand
  const inU = k(t, 5.95, 6.15, E.out), outU = k(t, 6.95, 7.4, E.in);
  const hx0 = lerp(1150, 700, inU) + outU * 500, hy0 = lerp(80, 330, inU) - outU * 500 + (t > 6.15 && t < 6.3 ? 10 : 0);
  const ok = k(t, 6.6, 6.8);
  LT.lit(ctx, c => handCard(c, hx0, hy0, 0.2, 2.6), { glow: { x: 560, y: 760, r: 640, color: ok > 0 ? 'rgb(80,200,130)' : 'rgb(120,130,160)', a: 0.4 + 0.4 * ok }, rim: { dir: [-1, -0.5], color: '#FFF0D0', w: 6, a: 0.7 } });
  ctx.restore();
  LT.grade(ctx, 'day', { vignette: 0.2 });
}
// F: tight on the screen before the tear
const F_CENTER = [W / 2, 820];
function shotF(ctx, t, lt) {
  cafeBokeh(ctx, 7.3, { x: 680, y: -640, z: 1.6 }, 12);
  const z = 1.9 + lt * 0.5;
  ctx.save(); ctx.translate(F_CENTER[0], F_CENTER[1]); ctx.scale(z, z); ctx.rotate(-0.02); ctx.translate(-560, -760); terminalArt(ctx, 7.3); ctx.restore();
  LT.glow(ctx, F_CENTER[0], F_CENTER[1], 700, 'rgba(90,255,160,1)', 0.18);
  LT.grade(ctx, 'day', { vignette: 0.2 });
}

// ---------- G: the hidden world (paper collage) ----------
const G0 = 8.95;
function billPos(t) {
  if (t < 9.95) { const u = seg(t, G0, 9.95); return { x: lerp(-60, -150, u), y: lerp(-760, 250, u * u), r: Math.sin(t * 7) * 0.5 * (1 - u) + 0.05, s: 0.72 }; }
  const b = Math.exp(-(t - 9.95) * 12) * Math.sin((t - 9.95) * 30) * 10; // little bounce on landing
  let x; if (t < 10.3) x = lerp(-150, 380, E.inOut(seg(t, 9.95, 10.3))); else if (t < 10.55) x = 380; else x = lerp(380, 1120, E.in(seg(t, 10.55, 11.3)));
  return { x, y: 250 - Math.abs(b), r: 0, s: 0.72 };
}
const STAMP_T = 10.4;
function gCam(t) {
  const b = billPos(t), pull = k(t, 11.1, 12.0);
  const c = { x: lerp(b.x + 140, 1180, pull), y: lerp(t < 9.95 ? b.y + 160 : 120, -40, pull), z: lerp(1.25, 0.74, pull), r: lerp(Math.sin(t * 1.1) * 0.02, 0, pull) };
  if (t > STAMP_T && t < STAMP_T + 0.35) c.y += Math.sin((t - STAMP_T) * 70) * 14 * (1 - seg(t, STAMP_T, STAMP_T + 0.35));
  return c;
}
function gLayer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(c.r * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
function shotG(ctx, t) {
  const c = gCam(t);
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.6; ctx.fillStyle = CL.texPattern(ctx); ctx.fillRect(0, 0, W, H); ctx.restore();
  // back sheets (slow parallax)
  gLayer(ctx, c, 0.55, g => {
    CL.cutout(g, () => { g.beginPath(); g.moveTo(-1600, -2200); g.lineTo(2600, -2200); for (let x = 2600, i = 0; x >= -1600; x -= 40, i++) g.lineTo(x, -820 + (K.hash(i) - 0.5) * 26 + Math.sin(x / 300) * 40); g.closePath(); }, '#4D8DFF', { lw: 0, elev: 1.2 });
    CL.cutout(g, () => { g.beginPath(); g.moveTo(-1600, 2400); g.lineTo(2600, 2400); for (let x = 2600, i = 0; x >= -1600; x -= 40, i++) g.lineTo(x, 640 + (K.hash(i + 99) - 0.5) * 26 + Math.sin(x / 260) * 30); g.closePath(); }, C.yellow, { lw: 0, elev: 1.2 });
    CL.tape(g, -300, -840, 180, 0.3); CL.tape(g, 1300, 650, 180, -0.25);
    // faded paper scraps in the back: receipts and cards drifting slowly
    g.save(); g.globalAlpha = 0.55; [[-700, -300, 0.2], [500, -560, -0.15], [1700, -250, 0.1], [-200, 900, -0.2]].forEach(([x, y, r], i) => { g.save(); g.translate(x, y + Math.sin(t + i) * 10); g.rotate(r);
      if (i % 2) R.card(g, 2.2); else CL.cutout(g, () => { g.beginPath(); g.moveTo(-70, -160); g.lineTo(70, -160); for (let j = 0; j <= 7; j++) g.lineTo(70 - j * 20, 160 + (j % 2) * 12); g.closePath(); }, '#FFFDF8', { elev: 0.5 }); g.restore(); }); g.restore();
  });
  gLayer(ctx, c, 1, g => {
    const ang = (t - G0) * (0.6 + 5 * k(t, 11.25, 11.6, E.out) * 1);
    // conveyor
    CL.cutout(g, () => rr(g, -760, 300, 1900, 60, 30), '#3A3A3A', { elev: 1 });
    g.save(); g.beginPath(); rr(g, -740, 306, 1860, 48, 24); g.clip(); g.fillStyle = '#5A5A60'; const mv = (t < 10.3 || t > 10.55) ? t * 300 : 10.3 * 300; for (let x = -760 - (mv % 80); x < 1160; x += 80) g.fillRect(x, 310, 30, 40); g.restore();
    for (let x = -700; x <= 1080; x += 160) { g.save(); g.translate(x, 400); CL.cutout(g, () => ell(g, 0, 0, 34, 34), '#8E8E96', { elev: 0.6 }); g.rotate(t * 6); g.fillStyle = INK; g.fillRect(-3, -26, 6, 52); g.restore(); }
    for (let x = -700; x <= 1080; x += 320) { g.lineWidth = R.px(g, 10); g.strokeStyle = INK; g.beginPath(); g.moveTo(x, 430); g.lineTo(x - 40, 640); g.moveTo(x, 430); g.lineTo(x + 40, 640); g.stroke(); }
    // the bill (drawn before the machine so it slides into the slot)
    const b = billPos(t);
    if (t < 11.32) { g.save(); g.translate(b.x, b.y); g.rotate(b.r); CL.bill(g, b.s, { stamp: k(t, STAMP_T, STAMP_T + 0.05), elev: t < 9.95 ? 2.5 : 1 }); g.restore(); }
    // stamp station
    const down = t < STAMP_T ? E.in(seg(t, 10.28, STAMP_T)) : 1 - E.out(seg(t, 10.5, 10.75));
    g.save(); g.translate(380, lerp(-120, 196, down)); g.scale(1.05, 1.05); CL.stamp(g); g.restore();
    g.save(); g.lineWidth = R.px(g, 8); g.strokeStyle = INK; g.beginPath(); g.moveTo(380, -900); g.lineTo(380, lerp(-340, -24, down)); g.stroke(); g.restore();
    CL.cutout(g, () => rr(g, 200, -980, 360, 90, 12), '#8B5A3C');
    if (t > STAMP_T && t < STAMP_T + 0.4) { const u = seg(t, STAMP_T, STAMP_T + 0.4); g.save(); g.globalAlpha = 1 - u; g.strokeStyle = C.red; g.lineWidth = R.px(g, 6);
      for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; g.beginPath(); g.moveTo(380 + Math.cos(a) * (150 + u * 60), 230 + Math.sin(a) * (60 + u * 40)); g.lineTo(380 + Math.cos(a) * (200 + u * 120), 230 + Math.sin(a) * (90 + u * 70)); g.stroke(); } g.restore(); }
    // the machine (cardboard box with gears)
    g.save(); g.translate(1000, 0);
    CL.cutout(g, () => { g.beginPath(); g.moveTo(0, -520); g.lineTo(760, -560); g.lineTo(780, 430); g.lineTo(-10, 430); g.closePath(); }, '#C9A27E', { elev: 1.6 });
    g.fillStyle = '#A9825E'; g.fillRect(0, -520, 760, 30);
    CL.cutout(g, () => rr(g, -14, 186, 70, 124, 10), '#2B2B2B', { elev: 0.3 }); // the slot
    g.save(); g.translate(330, -40); CL.gear(g, 190, 16, ang, C.red); g.restore();
    g.save(); g.translate(580, -300); CL.gear(g, 120, 11, -ang * 190 / 120 + 0.15, C.yellow, C.red); g.restore();
    g.save(); g.translate(560, 240); CL.gear(g, 110, 10, -ang * 190 / 110 + 0.3, '#4D8DFF'); g.restore();
    for (let i = 0; i < 4; i++) { const on = t > 11.3 && Math.floor((t - 11.3) * 10 + i) % 2 === 0; g.save(); g.translate(110 + i * 70, -440); CL.cutout(g, () => ell(g, 0, 0, 20, 20), on ? C.yellow : '#8B5A3C', { elev: 0.4 }); if (on) LT.glow(g, 0, 0, 60, 'rgba(255,210,100,1)', 0.6); g.restore(); }
    g.save(); g.translate(130, -200); CL.cutout(g, () => ell(g, 0, 0, 80, 80), '#F7F5F0'); const nd = -2.1 + 3.1 * K.spring(t - 11.3, 2.2, 5) * (t > 11.3 ? 1 : 0); g.rotate(nd);
    g.strokeStyle = C.red; g.lineWidth = R.px(g, 8); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -58); g.stroke(); g.restore();
    CL.tape(g, 40, -500, 140, -0.4); CL.tape(g, 740, 410, 140, 0.5);
    // paper steam puffs once the machine runs
    if (t > 11.3) for (let i = 0; i < 4; i++) { const u = ((t - 11.3) * 1.3 + i * 0.25) % 1; g.save(); g.globalAlpha = Math.sin(u * Math.PI); g.translate(700 + u * 60, -600 - u * 260); CL.cutout(g, () => ell(g, 0, 0, 40 + u * 40, 30 + u * 30), '#FFFFFF', { elev: 0.5, lw: 3 }); g.restore(); }
    g.restore();
  });
}

// ---------- the edit ----------
const shots = [
  { id: 'A wide', t0: 0, t1: 2.1, draw: shotA },
  { id: 'B1 menu', t0: 2.1, t1: 2.8, draw: (c, t, lt) => shotB1(c, t, lt) },
  { id: 'B2 skeptic', t0: 2.8, t1: 4.25, draw: (c, t, lt) => bustShot(c, t, lt, 'skeptic'), out: { type: 'whip', dur: 0.3, dir: -1 } },
  { id: 'C handover', t0: 4.25, t1: 5.95, draw: shotC },
  { id: 'D tap', t0: 5.95, t1: 7.35, draw: (c, t, lt) => shotD(c, t, lt) },
  { id: 'E glow', t0: 7.35, t1: 8.75, draw: (c, t, lt) => bustShot(c, t, lt, 'glow') },
  { id: 'F screen', t0: 8.75, t1: 9.3, draw: (c, t, lt) => shotF(c, t, lt), out: { type: 'tear', dur: 0.62, at: () => F_CENTER } },
  { id: 'G hidden', t0: 9.3, t1: 12.01, draw: (c, t) => shotG(c, t) },
];
const ED = makeEdit(shots, W, H);
const TEX = K.paperTexture(W, H);
function frame(ctx, t) {
  ED.frame(ctx, t);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.3; ctx.drawImage(TEX, 0, 0); ctx.restore();
}

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 360, th = 640, cols = Math.min(ts.length, 6), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frame(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '26px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 8, Math.floor(i / cols) * th + 30); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frame(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frame(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 60 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
