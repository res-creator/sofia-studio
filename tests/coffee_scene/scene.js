// "Paying for coffee" — 12 s character-animation test (1080x1920, 30 fps, no audio).
// Shots: cafe wide -> push to the order -> cup handover -> card -> terminal close-up (APPROVED) -> smile close-up + walk out
//        -> dive into the terminal screen -> the payment travels through the bank network -> drops into a coin machine.
// CLI: node scene.js video out.mp4 | still t1,t2,... out.png
const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const K = require('../mcd_collage/kit');
const R = require('./rig');
const CF = require('./cafe');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell } = R;

const W = 1080, H = 1920, FPS = 30, T = 12;
const k = (t, a, b, e = E.inOut) => e(seg(t, a, b));

// ---------- camera keys (log-zoom interpolation) + handheld drift ----------
function cam(keys, t, drift = 1) {
  let c;
  if (t <= keys[0].t) c = { ...keys[0] }; else if (t >= keys[keys.length - 1].t) c = { ...keys[keys.length - 1] };
  else for (let i = 1; i < keys.length; i++) if (t < keys[i].t) { const a = keys[i - 1], b = keys[i], u = (E[b.e || 'inOut'])(seg(t, a.t, b.t));
    c = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), r: lerp(a.r || 0, b.r || 0, u) }; break; }
  c.x += Math.sin(t * 0.9) * 6 * drift / c.z; c.y += Math.cos(t * 0.7) * 4 * drift / c.z; c.r = (c.r || 0) + Math.sin(t * 0.6) * 0.004 * drift;
  return c;
}
const CAFE_CAM = [
  { t: 0, x: 120, y: -640, z: 0.5 },
  { t: 1.5, x: 260, y: -620, z: 0.56 },
  { t: 2.9, x: 470, y: -520, z: 0.98 },
  { t: 4.6, x: 520, y: -500, z: 1.06 },
  { t: 5.75, x: 455, y: -440, z: 2.4, e: 'in' },
  // (terminal close-up cut-in 5.75 - 7.4)
  { t: 7.4, x: 335, y: -500, z: 2.3 },
  { t: 7.95, x: 330, y: -505, z: 2.5 },
  { t: 8.6, x: 180, y: -520, z: 0.95 },
  { t: 8.85, x: 330, y: -470, z: 1.1 },
  { t: 9.5, x: 451, y: -414, z: 34, e: 'in' },
];
const cafeCam = t => { const c = cam(CAFE_CAM, t); if (t > 5.4 && t < 7.4) c.x += 0; return c; };

// ---------- render surfaces ----------
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
const TEX = K.paperTexture(W, H);
function halfPass(ctx, blur, draw, alpha = 1) {
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0); draw(hx);
  ctx.save(); ctx.globalAlpha = alpha; if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}

// ---------- shot A: the cafe ----------
function cafeFrame(ctx, t, c) {
  c = c || cafeCam(t);
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H);
  const bb = clamp((c.z - 0.62) / 1.4) * 5;
  halfPass(ctx, bb, g => CF.drawCafe(g, t, c, 'back', W, H));
  CF.drawCafe(ctx, t, c, 'hero', W, H);
  halfPass(ctx, 3 + clamp(c.z - 0.5) * 4, g => CF.drawCafe(g, t, c, 'fg', W, H));
  // warm grade + vignette
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,190,120,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---------- shot B: terminal close-up (screen space) ----------
function handCard(ctx, x, y, a, s) { // big hand + red sleeve from the top right, holding a card
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  R.tube(ctx, [[160, -150], [30, -10]], 64, C.red, 5); R.tube(ctx, [[48, -28], [34, -12]], 72, '#B82533', 4);
  R.hand(ctx, [10, 4], Math.atan2(14, -20) + Math.PI * 0, CF.CUST.skin, 'pinch', { over: c => { c.save(); c.translate(42, -14); c.rotate(-0.25); R.card(c, 1.1); c.restore(); } });
  ctx.restore();
}
function termClose(ctx, t) {
  const t0 = 5.75, lt = t - t0;
  // blurred cafe behind (the counter area, barista visible)
  ctx.fillStyle = '#F6E7CC'; ctx.fillRect(0, 0, W, H);
  const bc = { x: 640 + lt * 20, y: -620, z: 1.6, r: 0 };
  halfPass(ctx, 9, g => { CF.drawCafe(g, Math.min(t, 7.3), bc, 'back', W, H); CF.drawCafe(g, Math.min(t, 7.3), bc, 'hero', W, H); });
  ctx.fillStyle = 'rgba(40,25,15,0.18)'; ctx.fillRect(0, 0, W, H);
  // slow push
  const z = 1 + lt * 0.035, sh = (t > 6.08 && t < 6.3) ? Math.sin((t - 6.08) * 80) * 6 * (1 - seg(t, 6.08, 6.3)) : 0;
  ctx.save(); ctx.translate(W / 2 + sh, H * 0.52); ctx.scale(z, z); ctx.rotate(Math.sin(t * 0.7) * 0.01); ctx.translate(-W / 2, -H * 0.52);
  // counter top (perspective slab)
  ctx.beginPath(); ctx.moveTo(-200, 1330); ctx.lineTo(1280, 1330); ctx.lineTo(1500, 2100); ctx.lineTo(-420, 2100); ctx.closePath(); fillStroke(ctx, '#9C6B45', 8);
  ctx.strokeStyle = 'rgba(80,45,25,0.35)'; ctx.lineWidth = 5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-200 - i * 40, 1380 + i * 120); ctx.bezierCurveTo(300, 1360 + i * 130, 700, 1420 + i * 120, 1300 + i * 40, 1370 + i * 125); ctx.stroke(); }
  ctx.fillStyle = '#B98457'; ctx.fillRect(-200, 1330, 1480, 16);
  // contact shadow + stand
  K.contact(ctx, 560, 1360, 360, 60, 0.35);
  rr(ctx, 380, 1290, 360, 70, 26); fillStroke(ctx, '#2B2B2B', 7);
  // terminal body (tilted back)
  ctx.save(); ctx.translate(560, 1300); ctx.rotate(-0.05);
  rr(ctx, -270, -880, 540, 880, 60); fillStroke(ctx, '#2E3138', 8);
  ctx.save(); rr(ctx, -270, -880, 540, 880, 60); ctx.clip(); ctx.fillStyle = '#3A3E47'; ctx.fillRect(-270, -880, 90, 880); ctx.fillStyle = C.red; ctx.fillRect(-270, -110, 540, 34); ctx.restore();
  // contactless mark
  ctx.strokeStyle = '#C9CDD6'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-30, -815, 14 + i * 16, -0.75, 0.75); ctx.stroke(); }
  // screen
  const st = t >= 6.55 ? 'ok' : t >= 6.1 ? 'wait' : 'pay';
  rr(ctx, -215, -730, 430, 360, 26); fillStroke(ctx, '#11161D', 6);
  ctx.save(); rr(ctx, -205, -720, 410, 340, 20); ctx.clip();
  const okU = k(t, 6.55, 6.75, E.out);
  ctx.fillStyle = '#1B2430'; ctx.fillRect(-205, -720, 410, 340);
  if (okU > 0) { ctx.fillStyle = '#21A46B'; ctx.beginPath(); ctx.arc(0, -550, okU * 330, 0, 7); ctx.fill(); }
  ctx.textAlign = 'center';
  if (st !== 'ok' || okU < 0.6) {
    ctx.font = `120px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('$5.00', 0, -540);
    ctx.font = `40px ${F.black}`; ctx.fillStyle = C.yellow; ctx.fillText(st === 'pay' ? 'TAP CARD' : 'PROCESSING', 0, -450);
    if (st === 'wait') for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(255,200,87,${0.3 + 0.7 * (Math.floor(t * 10) % 3 === i ? 1 : 0)})`; ctx.beginPath(); ctx.arc(-40 + i * 40, -410, 10, 0, 7); ctx.fill(); }
  } else {
    const p = E.back(seg(t, 6.62, 6.9), 2.5);
    ctx.save(); ctx.translate(0, -600); ctx.scale(p, p); ell(ctx, 0, 0, 62, 62); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.strokeStyle = '#21A46B'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-28, 2); ctx.lineTo(-6, 24); ctx.lineTo(30, -22); ctx.stroke(); ctx.restore();
    ctx.font = `66px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('APPROVED', 0, -460);
    ctx.font = `44px ${F.black}`; ctx.fillStyle = C.yellow; ctx.fillText('$5.00', 0, -405);
  }
  ctx.restore();
  // glare
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.moveTo(-205, -720); ctx.lineTo(-60, -720); ctx.lineTo(-205, -480); ctx.closePath(); ctx.fill();
  // keypad
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  keys.forEach((kk, i) => { const cx = -150 + (i % 3) * 150, cy = -300 + Math.floor(i / 3) * 62; rr(ctx, cx - 56, cy - 24, 112, 48, 14);
    fillStroke(ctx, i === 9 ? C.red : i === 11 ? '#21A46B' : i === 10 || i < 9 ? '#F7F5F0' : '#F7F5F0', 4); if (kk) { ctx.font = `30px ${F.black}`; ctx.fillStyle = INK; ctx.fillText(kk, cx, cy + 11); } });
  ctx.restore();
  // waves from the tap
  if (t > 6.08 && t < 6.9) for (let i = 0; i < 3; i++) { const u = seg(t, 6.08 + i * 0.12, 6.6 + i * 0.12); if (u <= 0 || u >= 1) continue;
    ctx.save(); ctx.globalAlpha = 1 - u; ctx.strokeStyle = C.yellow; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(520, 480, 80 + u * 380, 0, 7); ctx.stroke(); ctx.restore(); }
  // approved burst: glow + sparkles
  if (t > 6.55) { const u = seg(t, 6.55, 7.3); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 760, 0, 540, 760, 700);
    g.addColorStop(0, `rgba(255,220,120,${0.45 * (1 - u * 0.6)})`); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + K.hash(i) * 0.3, d = 300 + E.out(u) * (260 + K.hash(i + 9) * 300); ctx.save(); ctx.globalAlpha = 1 - seg(u, 0.6, 1);
      ctx.translate(540 + Math.cos(a) * d, 760 + Math.sin(a) * d * 0.9); ctx.rotate(u * 6 + i); ctx.fillStyle = i % 2 ? C.yellow : C.red; ctx.fillRect(-12, -6, 24, 12); ctx.restore(); } }
  // the hand with the card: comes in, taps the top of the terminal, lifts away
  const inU = k(t, t0, 6.08, E.out), outU = k(t, 6.85, 7.35, E.in);
  const hx0 = lerp(1250, 700, inU) + outU * 500, hy0 = lerp(-100, 330, inU) - outU * 500 + (t > 6.08 && t < 6.25 ? 10 : 0);
  handCard(ctx, hx0, hy0, 0.2, 2.6);
  ctx.restore();
}

// ---------- shot C: the payment travels through the bank network ----------
const PATH = [[0, 0], [260, 480], [860, 700], [1500, 460], [2100, 760], [2700, 980]];
function spline(u) {
  const n = PATH.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), s = f - i;
  const p0 = PATH[Math.max(0, i - 1)], p1 = PATH[i], p2 = PATH[i + 1], p3 = PATH[Math.min(n, i + 2)];
  const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s * s + (-a + 3 * b - 3 * c + d) * s * s * s);
  return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
}
const NET0 = 9.4, NET1 = 10.85;
const packetU = t => { const u = seg(t, NET0 + 0.1, 10.62); return u * u * (3 - 2 * u) * 0.92 + u * 0.08; };
function netCam(t) {
  const p = spline(packetU(t)), p2 = spline(packetU(t + 0.15));
  const z0 = lerp(5, 0.95, k(t, NET0, NET0 + 0.45, E.out)), dive = k(t, 10.45, 10.85, E.in);
  const door = [2780, 900];
  return { x: lerp(lerp(p[0], p2[0], 0.6), door[0], dive), y: lerp(lerp(p[1], p2[1], 0.6) - 60, door[1], dive), z: z0 * Math.exp(dive * Math.log(9)), r: Math.sin(t * 1.3) * 0.02 };
}
function netLayer(ctx, c, d, fn) { // parallax around the camera
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(c.r * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore();
}
function packet(ctx, x, y, a, s, glow = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 220); g.addColorStop(0, `rgba(255,200,87,${0.7 * glow})`); g.addColorStop(1, 'rgba(255,200,87,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 220, 0, 7); ctx.fill(); ctx.restore();
  rr(ctx, -95, -55, 190, 110, 26); fillStroke(ctx, C.yellow, 8); rr(ctx, -80, -42, 160, 84, 18); ctx.lineWidth = 5; ctx.strokeStyle = C.red; ctx.stroke();
  ctx.font = `58px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText('$5.00', 0, 20);
  ctx.restore();
}
function tower(ctx, x, h, w, col, lit, seed) {
  ctx.fillStyle = col; ctx.fillRect(x, -h, w, h + 2000);
  for (let r = 0; r < h / 70; r++) for (let c = 0; c < w / 60 - 1; c++) { const v = K.hash(seed * 31 + r * 7 + c); if (v < 0.45) continue;
    ctx.fillStyle = v > 0.9 ? C.red : v > 0.7 ? lit : 'rgba(120,170,255,0.35)'; ctx.fillRect(x + 30 + c * 60, -h + 40 + r * 70, 28, 34); }
}
function netWorld(ctx, t) {
  const c = netCam(t);
  const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0C1424'); bg.addColorStop(1, '#1B2B4D'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // far data city
  netLayer(ctx, c, 0.3, g => { for (let i = -8; i < 24; i++) tower(g, i * 260, 900 + K.hash(i) * 900, 220, '#16223D', '#FFC857', i + 40); });
  // grid floor of light dots
  netLayer(ctx, c, 0.55, g => { g.fillStyle = 'rgba(77,141,255,0.35)'; for (let x = -1200; x < 4000; x += 90) for (let y = -600; y < 2200; y += 90) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } });
  // mid towers
  netLayer(ctx, c, 0.7, g => { for (let i = -4; i < 14; i++) { const x = i * 420 + 80; tower(g, x, 500 + K.hash(i + 3) * 700, 260, '#22345C', '#FFE3A1', i + 7); g.fillStyle = '#4D8DFF'; g.fillRect(x, -500 - K.hash(i + 3) * 700, 260, 8); } });
  netLayer(ctx, c, 1, g => {
    // the rail: dark tube + bright core + running dashes
    g.lineCap = 'round'; g.lineJoin = 'round';
    const line = () => { g.beginPath(); for (let i = 0; i <= 120; i++) { const p = spline(i / 120); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } };
    line(); g.strokeStyle = '#0A0F1A'; g.lineWidth = 60; g.stroke(); line(); g.strokeStyle = '#2B3F6B'; g.lineWidth = 44; g.stroke();
    line(); g.strokeStyle = C.red; g.lineWidth = 10; g.setLineDash([50, 40]); g.lineDashOffset = -t * 900; g.stroke(); g.setLineDash([]);
    // network gate (arch) the packet passes through
    const gp = spline(0.4), passed = packetU(t) > 0.4, fl = passed ? 1 - seg(t, NET0 + 0.55, NET0 + 1.1) : 0;
    g.save(); g.translate(gp[0], gp[1]); g.rotate(-0.25);
    g.lineWidth = 34; g.strokeStyle = INK; g.beginPath(); g.arc(0, 0, 210, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.lineWidth = 20; g.strokeStyle = passed ? '#21C47B' : C.yellow; g.stroke();
    if (fl > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(80,255,160,${fl * 0.6})`; g.lineWidth = 60; g.stroke(); g.restore(); }
    rr(g, -150, -330, 300, 70, 16); fillStroke(g, INK, 0); g.font = `40px ${F.black}`; g.textAlign = 'center'; g.fillStyle = passed ? '#7CFFB5' : C.yellow; g.fillText('NETWORK', 0, -280); g.restore();
    // the bank: classic facade with an open vault door
    g.save(); g.translate(2780, 1060);
    rr(g, -560, -60, 1120, 120, 8); fillStroke(g, '#D9D2C3', 6);
    g.fillStyle = '#F7F5F0'; g.fillRect(-500, -760, 1000, 700); g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(-500, -760, 1000, 700);
    g.beginPath(); g.moveTo(-560, -760); g.lineTo(0, -1060); g.lineTo(560, -760); g.closePath(); fillStroke(g, C.red, 6);
    g.font = `110px ${F.black}`; g.textAlign = 'center'; g.fillStyle = C.yellow; g.fillText('BANK', 0, -810);
    for (const x of [-420, -260, 260, 420]) { rr(g, x - 40, -740, 80, 680, 10); fillStroke(g, '#EDE3D0', 5); }
    // vault opening (dark with warm light)
    ell(g, 0, -340, 190, 190); fillStroke(g, '#1B120C', 8);
    const vg = g.createRadialGradient(0, -340, 0, 0, -340, 190); vg.addColorStop(0, 'rgba(255,200,87,0.9)'); vg.addColorStop(1, 'rgba(255,140,60,0.1)'); g.fillStyle = vg; g.beginPath(); g.arc(0, -340, 185, 0, 7); g.fill();
    g.save(); g.translate(-230, -340); g.scale(0.35, 1); ell(g, 0, 0, 200, 200); fillStroke(g, '#B9B9C0', 8); ell(g, 0, 0, 120, 120); fillStroke(g, '#8E8E96', 6); g.restore();
    g.restore();
    // packet + trail
    const u = packetU(t), p = spline(u), q = spline(Math.max(0, u - 0.01)), a = Math.atan2(p[1] - q[1], p[0] - q[0]) * 0.4;
    for (let i = 1; i <= 14; i++) { const pu = spline(Math.max(0, u - i * 0.012)); g.fillStyle = i % 2 ? `rgba(255,200,87,${0.6 - i * 0.04})` : `rgba(230,57,70,${0.6 - i * 0.04})`; g.beginPath(); g.arc(pu[0], pu[1], 28 - i * 1.6, 0, 7); g.fill(); }
    const em = k(t, NET0, NET0 + 0.3, E.out), sc = lerp(0.4, 1, em) * (1 - 0.6 * k(t, 10.45, 10.65));
    if (t < 10.66) packet(g, p[0], p[1], a, sc);
  });
  // foreground light motes
  netLayer(ctx, c, 1.6, g => { for (let i = 0; i < 26; i++) { const x = K.hash(i) * 3400 - 400, y = K.hash(i + 70) * 1600 - 300; g.fillStyle = i % 3 ? 'rgba(77,141,255,0.35)' : 'rgba(255,200,87,0.35)'; g.beginPath(); g.arc(x, y, 18 + K.hash(i + 5) * 26, 0, 7); g.fill(); } });
  // portal flash at the start (the terminal screen we dove through)
  const fl = 1 - seg(t, NET0, NET0 + 0.35); if (fl > 0) { ctx.fillStyle = `rgba(33,164,107,${fl})`; ctx.fillRect(0, 0, W, H); }
}

// ---------- shot D: the coin machine ----------
const MAC0 = 10.7;
function gear(ctx, x, y, r, n, a, col, hub = C.yellow) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, w = Math.PI / n * 0.55;
    ctx.lineTo(Math.cos(a0 - w * 1.2) * r * 0.86, Math.sin(a0 - w * 1.2) * r * 0.86); ctx.lineTo(Math.cos(a0 - w * 0.7) * r, Math.sin(a0 - w * 0.7) * r);
    ctx.lineTo(Math.cos(a0 + w * 0.7) * r, Math.sin(a0 + w * 0.7) * r); ctx.lineTo(Math.cos(a0 + w * 1.2) * r * 0.86, Math.sin(a0 + w * 1.2) * r * 0.86); }
  ctx.closePath(); fillStroke(ctx, col, 7);
  ctx.save(); ctx.clip(); ctx.fillStyle = shade(col, -0.2); ctx.beginPath(); ctx.arc(r * 0.3, r * 0.3, r, 0, 7); ctx.fill(); ctx.restore();
  for (let i = 0; i < 5; i++) { const aa = i / 5 * Math.PI * 2; ell(ctx, Math.cos(aa) * r * 0.5, Math.sin(aa) * r * 0.5, r * 0.13, r * 0.13); ctx.fillStyle = '#171717'; ctx.fill(); }
  ell(ctx, 0, 0, r * 0.24, r * 0.24); fillStroke(ctx, hub, 6); ell(ctx, 0, 0, r * 0.08, r * 0.08); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
function coin(ctx, x, y, r, spin = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.15, Math.abs(Math.cos(spin))), 1);
  ell(ctx, 0, 0, r, r); fillStroke(ctx, '#F4B73A', 6); ell(ctx, 0, 0, r * 0.78, r * 0.78); ctx.lineWidth = 5; ctx.strokeStyle = '#C98A1E'; ctx.stroke();
  ctx.font = `${r * 1.1}px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = C.red; ctx.fillText('$', 0, r * 0.38); ctx.restore();
}
function macCam(t) {
  const lt = t - MAC0, fall = coinY(t);
  const keys = [{ t: 0, x: 0, y: -1150, z: 1.7 }, { t: 0.45, x: 0, y: -820, z: 1.45 }, { t: 1.3, x: 20, y: -260, z: 0.74 }];
  const c = cam(keys, lt, 0.5); if (lt < 0.45) c.y = lerp(c.y, fall - 120, 0.5); return c;
}
const LAND = 11.12;
function coinY(t) { const u = seg(t, MAC0, LAND); return lerp(-1500, -700, u * u); }
function machineWorld(ctx, t) {
  const c = macCam(t), lt = t - MAC0, spd = 0.6 + 4 * k(t, LAND, LAND + 0.35, E.out), ang = (t - LAND) * spd * (t > LAND ? 1 : 0.15) + lt * 0.4;
  const bg = ctx.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H * 0.45, 1300); bg.addColorStop(0, '#3A2A22'); bg.addColorStop(1, '#141210'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // far gears (dim, parallax)
  halfPass(ctx, 5, g => netLayer(g, c, 0.5, h => { h.globalAlpha = 0.5; for (let i = 0; i < 7; i++) gear(h, -900 + i * 380, -900 + (i % 2) * 700, 160 + (i % 3) * 50, 14, ang * (i % 2 ? -0.7 : 0.7), '#5A463C', '#6E4630'); }));
  netLayer(ctx, c, 1, g => {
    // pipes + rivets frame
    g.lineCap = 'butt'; for (const [x0, y0, x1, y1] of [[-700, -700, -700, 700], [700, -500, 700, 700], [-700, 560, 700, 560]]) { g.strokeStyle = INK; g.lineWidth = 64; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#B9B9C0'; g.lineWidth = 48; g.stroke(); }
    // gears: big red, yellow right, small blue left (meshed: speed ~ 1/r)
    gear(g, 0, -120, 300, 18, ang, C.red);
    gear(g, 455, -330, 180, 11, -ang * 300 / 180 + 0.12, C.yellow, C.red);
    gear(g, -400, 150, 150, 9, -ang * 2 + 0.2, '#4D8DFF');
    gear(g, 470, 140, 120, 8, ang * 300 / 180 * 180 / 120 * 0.98 + 0.3, '#F7F5F0', C.red);
    // hopper / funnel on top
    g.beginPath(); g.moveTo(-200, -1020); g.lineTo(200, -1020); g.lineTo(60, -760); g.lineTo(-60, -760); g.closePath(); fillStroke(g, '#B9B9C0', 7);
    g.fillStyle = C.yellow; g.fillRect(-200, -1040, 400, 26); g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(-200, -1040, 400, 26);
    rr(g, -60, -770, 120, 120, 10); fillStroke(g, '#8E8E96', 7); // chute into the big gear
    // slot lights + a gauge with a needle that jumps on landing
    for (let i = 0; i < 5; i++) { const on = t > LAND && Math.floor((t - LAND) * 12 + i) % 2 === 0; ell(g, -420 + i * 70, -560, 20, 20); fillStroke(g, on ? C.yellow : '#5A463C', 5); }
    g.save(); g.translate(-450, -320); ell(g, 0, 0, 110, 110); fillStroke(g, '#F7F5F0', 8);
    for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.75 + i / 8 * Math.PI * 1.5; g.strokeStyle = i > 6 ? C.red : INK; g.lineWidth = 6; g.beginPath(); g.moveTo(Math.cos(a - Math.PI / 2) * 70, Math.sin(a - Math.PI / 2) * 70); g.lineTo(Math.cos(a - Math.PI / 2) * 90, Math.sin(a - Math.PI / 2) * 90); g.stroke(); }
    const nd = -2.2 + 3.2 * K.spring(t - LAND, 2.2, 5) * (t > LAND ? 1 : 0); g.rotate(nd); g.strokeStyle = C.red; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -80); g.stroke(); ell(g, 0, 0, 16, 16); fillStroke(g, INK, 0); g.restore();
    // piston pumping
    const pp = t > LAND ? Math.sin((t - LAND) * 14) * 40 : 0;
    rr(g, 560, 300 + pp, 90, 200, 10); fillStroke(g, '#8E8E96', 6); rr(g, 540, 260, 130, 60, 10); fillStroke(g, C.red, 6);
    // conveyor at the bottom carrying coins into the vault
    rr(g, -760, 600, 1520, 70, 35); fillStroke(g, '#2B2B2B', 7);
    for (let i = 0; i < 12; i++) { const x = -720 + ((i * 140 + t * 260) % 1480); ell(g, x, 635, 16, 16); fillStroke(g, '#5A5A60', 4); }
    for (let i = 0; i < 6; i++) { const x = -700 + ((i * 260 + t * 260) % 1400); coin(g, x, 560, 34, t * 3 + i); }
    // steam puffs from the pipe after the landing
    if (t > LAND) for (let i = 0; i < 5; i++) { const u = ((t - LAND) * 1.4 + i * 0.2) % 1; g.fillStyle = `rgba(255,255,255,${0.5 * Math.sin(u * Math.PI)})`; g.beginPath(); g.arc(700 + u * 80, -520 - u * 260, 30 + u * 50, 0, 7); g.fill(); }
    // the coin: morphs from the packet, falls into the funnel, rattles in the chute
    const cy = coinY(t), mU = k(t, MAC0, MAC0 + 0.25);
    if (t < LAND + 0.05) { if (mU < 1) { g.save(); g.globalAlpha = 1 - mU; packet(g, 0, cy, 0, 0.8 * (1 - mU * 0.5)); g.restore(); } coin(g, Math.sin(t * 20) * 6 * (1 - mU), cy, 70 * mU + 1, t * 8); }
    else { const u = seg(t, LAND, LAND + 0.3); coin(g, 0, lerp(-700, -640, u), 70 * (1 - u * 0.4), t * 14); }
    // landing flash
    if (t > LAND && t < LAND + 0.4) { const u = seg(t, LAND, LAND + 0.4); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,200,87,${1 - u})`; g.lineWidth = 16; g.beginPath(); g.arc(0, -700, 90 + u * 260, 0, 7); g.stroke(); g.restore(); }
  });
  // foreground gear (blurred, close to the lens)
  halfPass(ctx, 7, g => netLayer(g, c, 1.6, h => gear(h, -760, 420, 340, 16, -ang * 0.8, '#C42D3A', C.yellow)));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sp = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, 900); sp.addColorStop(0, 'rgba(255,200,120,0.18)'); sp.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---------- edit: shots + transitions ----------
const A = createCanvas(W, H), ax = A.getContext('2d'), B = createCanvas(W, H), bx = B.getContext('2d');
function shotAt(ctx, t) {
  if (t < 5.75) return cafeFrame(ctx, t);
  if (t < 7.4) return termClose(ctx, t);
  if (t < NET0) return cafeFrame(ctx, t);
  if (t < MAC0) return netWorld(ctx, t);
  return machineWorld(ctx, t);
}
// blended transitions [t0, t1, from, to]
const MIX = [[5.62, 5.82, t => cafeFrame(ax, t), t => termClose(bx, Math.max(t, 5.75))], [7.36, 7.46, t => termClose(ax, Math.min(t, 7.39)), t => cafeFrame(bx, Math.max(t, 7.4))],
  [9.32, 9.5, t => cafeFrame(ax, Math.min(t, 9.39)), t => netWorld(bx, Math.max(t, NET0))], [10.62, 10.82, t => netWorld(ax, Math.min(t, 10.84)), t => machineWorld(bx, Math.max(t, MAC0))]];
function frame(ctx, t) {
  ctx.globalAlpha = 1; ctx.filter = 'none';
  const m = MIX.find(([a, b]) => t >= a && t < b);
  if (m) { const u = E.inOut(seg(t, m[0], m[1])); m[2](t); m[3](t); ctx.drawImage(A, 0, 0); ctx.globalAlpha = u; ctx.drawImage(B, 0, 0); ctx.globalAlpha = 1; }
  else shotAt(ctx, t);
  // paper texture + vignette (channel look)
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.35; ctx.drawImage(TEX, 0, 0); ctx.restore();
}
// motion blur on the fast dives: average sub-frames
const SUB = createCanvas(W, H), sx = SUB.getContext('2d');
function frameMB(ctx, t) {
  const fast = (t > 5.55 && t < 5.85) || (t > 9.1 && t < 9.6) || (t > 10.45 && t < 10.9);
  if (!fast) return frame(ctx, t);
  const n = 3; for (let j = 0; j < n; j++) { frame(sx, t - j * 0.5 / FPS / n * 2); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(SUB, 0, 0); } ctx.globalAlpha = 1;
}

// ---------- CLI ----------
const [mode, a1, a2] = process.argv.slice(2);
if (mode === 'still') {
  const ts = a1.split(',').map(Number), tw = 360, th = 640, cols = Math.min(ts.length, 6), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(tw * cols, th * rows), sc = sheet.getContext('2d'), cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ts.forEach((t, i) => { frameMB(ctx, t); sc.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * th, tw, th); sc.fillStyle = '#E63946'; sc.font = '26px sans-serif'; sc.fillText(t.toFixed(2), (i % cols) * tw + 8, Math.floor(i / cols) * th + 30); });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
} else if (mode === 'frame') { const cv = createCanvas(W, H), ctx = cv.getContext('2d'); frameMB(ctx, +a1); fs.writeFileSync(a2, cv.toBuffer('image/png')); }
else if (mode === 'video') (async () => {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(T * FPS), T0 = Date.now();
  for (let f = 0; f < N; f++) { frameMB(ctx, f / FPS); const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 60 === 0) process.stderr.write(`${f}/${N} ${((Date.now() - T0) / 1000).toFixed(0)}s\n`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
})();
