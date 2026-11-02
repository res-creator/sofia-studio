// Long-form "When Paying People Backfired", chapter 6 (The Emu Exception, 1932): the emu_ep12 world re-framed for 16:9.
// Uses ../../emu_ep12/emukit.js read-only for everything that is drawn in local units (emu, emuCrowd, Lewis gun, truck, people + hats,
// the map, pin, calendar, slips, poster, pound notes, dam, windmill, farmhouse). Its land()/wheat() assume 1080x1920, so the wheatbelt
// is redrawn here for W x H = 1920 x 1080 (landW / wheatW). Plus: the stage, the gunner, crowd helper, small icons for the five plates
// (tail, barcode, account card, license plate, emu) and the chapter card.
const K = require('../../tests/mcd_collage/kit');
const R = require('../../hirkit/rig');
const LT = require('../../hirkit/light');
const CL = require('../../hirkit/collage');
const ST = require('../../howitsrun_style/style');
const S = require('../../emu_ep12/emukit');
const { C, F, clamp, lerp, seg, E, rr, hash } = K;
const { INK, shade, fillStroke, ell, px } = R;
const { W, H, PAL, txt, fitTxt } = ST;
const RIM = { dir: [1, -0.5], color: '#FFF0C8', w: 8, a: 0.9 };

// ---------- the wheatbelt, wide (screen space): o: { hy, px (pan), eaten, windmill {x,s}, house {x,s}, fence {dy}, dam {x,y,w}, rows, wheatDy, dusk, sun } ----------
function landW(ctx, t, o = {}) {
  const hy = o.hy ?? 560, pxn = o.px || 0;
  let g = ctx.createLinearGradient(0, hy - 700, 0, hy); g.addColorStop(0, o.dusk ? '#E9B07A' : '#F2CF8E'); g.addColorStop(1, '#F9EBCB'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
  if (o.sun !== false) { const sx = (o.sunX ?? 1400) - pxn * 0.05, sy = hy - 300; LT.glow(ctx, sx, sy, 300, 'rgba(255,236,190,1)', 0.5); ell(ctx, sx, sy, 64, 64); ctx.fillStyle = '#FFF4D8'; ctx.fill(); }
  for (let i = 0; i < 5; i++) { const cx = ((i * 460 + t * 8 - pxn * 0.1) % 2400 + 2400) % 2400 - 250, cy = hy - 430 + (i % 2) * 110; ctx.fillStyle = 'rgba(255,252,242,0.85)'; for (let j = 0; j < 4; j++) { ell(ctx, cx + j * 50, cy - (j % 2) * 20, 70, 34); ctx.fill(); } }
  ctx.save(); ctx.translate(-pxn * 0.15, 0); ctx.fillStyle = '#B9A27A'; ctx.beginPath(); ctx.moveTo(-600, hy);
  for (let x = -600; x <= W + 1200; x += 60) ctx.lineTo(x, hy - 36 - 26 * Math.sin(x * 0.004) - 16 * Math.sin(x * 0.011 + 1)); ctx.lineTo(W + 1200, hy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9F9068'; for (let i = 0; i < 26; i++) { const x = -500 + i * 120 + hash(i) * 60; ell(ctx, x, hy - 26, 24 + hash(i + 3) * 16, 16); ctx.fill(); }
  ctx.restore();
  g = ctx.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#D9B57A'); g.addColorStop(1, '#C98E5F'); ctx.fillStyle = g; ctx.fillRect(0, hy, W, H - hy);
  ctx.save(); ctx.translate(-pxn * 0.4, 0);
  if (o.house) S.farmhouse(ctx, o.house.x, hy + 8, o.house.s || 0.5);
  if (o.windmill) S.windmill(ctx, o.windmill.x, hy + 14, o.windmill.s || 0.5, t);
  ctx.restore();
  if (o.dam) S.dam(ctx, o.dam.x - pxn * 0.6, o.dam.y, o.dam.w);
  if (o.fence) { ctx.save(); ctx.translate(-pxn * 0.6, 0); const fy = hy + (o.fence.dy ?? 50); ctx.strokeStyle = '#6A4A2A'; ctx.lineWidth = 3; for (const dy of [-30, -14]) { ctx.beginPath(); ctx.moveTo(-300, fy + dy); ctx.lineTo(W + 1200, fy + dy); ctx.stroke(); }
    for (let x = -300; x < W + 1200; x += 110) { rr(ctx, x, fy - 46, 10, 50, 2); fillStroke(ctx, '#8A6440', 3); } ctx.restore(); }
  if (o.wheat !== false) wheatW(ctx, t, hy + (o.wheatDy ?? 24), o.eaten || 0, pxn, o.rows || 8, o.wheatTop);
}
function wheatW(ctx, t, y0, eaten, pxn, rows = 8, top = null) {
  for (let r = 0; r < rows; r++) {
    const d = r / (rows - 1), y = lerp(y0, H + 40, Math.pow(d, 1.5)), s = lerp(0.22, 1.4, d), par = lerp(0.6, 1.2, d);
    if (top && y < top) continue;
    const step = 34 * s, off = ((-pxn * par) % step + step) % step;
    ctx.lineCap = 'round';
    for (let x = -step + off; x < W + step; x += step) {
      const id = Math.floor((x + pxn * par) / step) * 31 + r * 977, gone = hash(id) < eaten, h = (100 + hash(id + 5) * 36) * s, sw = Math.sin(t * 1.4 + x * 0.01 + r) * 6 * s;
      ctx.strokeStyle = S.WHEATD; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw * 0.3, y - h * 0.5, x + (gone ? sw * 0.2 : sw), y - (gone ? h * 0.35 : h)); ctx.stroke();
      if (!gone) { ctx.save(); ctx.translate(x + sw, y - h); ctx.rotate(sw * 0.02); ell(ctx, 0, -14 * s, 9 * s, 24 * s); ctx.fillStyle = S.WHEAT; ctx.fill(); ctx.lineWidth = Math.max(1, 2.5 * s); ctx.strokeStyle = 'rgba(120,80,20,0.7)'; ctx.stroke(); ctx.restore(); }
    }
  }
}
// a softer (half-res, blurred) background plane
const { createCanvas } = require('@napi-rs/canvas');
const HALF = createCanvas(W / 2, H / 2), hx = HALF.getContext('2d');
function halfPass(ctx, blur, draw) {
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, W / 2, H / 2); hx.setTransform(0.5, 0, 0, 0.5, 0, 0);
  R.LINE.dev = 0.5; draw(hx); R.LINE.dev = 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (blur > 0.3) ctx.filter = `blur(${blur.toFixed(1)}px)`; ctx.drawImage(HALF, 0, 0, W, H); ctx.restore();
}
// dark paper stage with a spotlight
function stage(ctx, t, warm = 0) {
  ctx.fillStyle = '#2A2620'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, 560, 60, W / 2, 560, 760); g.addColorStop(0, warm ? '#F7E2B0' : '#E9E2D2'); g.addColorStop(1, 'rgba(42,38,32,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 820, W, H - 820); ell(ctx, W / 2, 820, 560, 50); ctx.fillStyle = 'rgba(255,240,200,0.18)'; ctx.fill();
}
// emu crowds (deterministic)
function crowd(n, seed, x0, x1, y0, y1, s0, s1, face = -1) {
  const out = []; for (let i = 0; i < n; i++) { const d = hash(seed + i * 7.3), y = lerp(y0, y1, d * d); out.push({ i, x: lerp(x0, x1, hash(seed + i * 3.1)), y, s: lerp(s0, s1, (y - y0) / Math.max(1, y1 - y0)), face, ph: hash(seed + i) * 6.3, pk: hash(seed + i * 1.7) }); }
  return out;
}
// gunner kneeling behind the Lewis gun on sandbags (feet at 0, facing +x)
function gunner(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 5; i++) { const bx = 170 + (i % 3) * 110 + (i > 2 ? 55 : 0), by = i > 2 ? -150 : -60; ctx.save(); ctx.translate(bx, by); CL.cutout(ctx, () => rr(ctx, -62, -48, 124, 96, 40), '#C9B48A', { elev: 0.8 }); ctx.restore(); }
  const rec = o.recoil || 0;
  ctx.save(); ctx.translate(190 - rec * 10, -318); ctx.rotate(o.aim || -0.03); ctx.scale(0.55, 0.55); S.lewisGun(ctx, { bipod: 210, flash: o.flash || 0, smoke: o.smoke || 0 }); ctx.restore();
  S.person(ctx, 0, 0, 1, 1, o.L || S.SOL, { hip: [-6, -176], lean: 0.32, legN: { foot: [96, 0] }, legF: { foot: [-118, 0] }, armN: { hand: [118 - rec * 6, -284], grip: 'fist' }, armF: { hand: [96, -330], grip: 'fist' },
    face: o.face || R.expr('squint', { look: [1, 0] }), headTilt: 0.05 }, S.HAT_ARMY);
  ctx.restore();
}
const litP = (ctx, fn) => LT.lit(ctx, fn, { rim: RIM });

// ---------- small icons for the five plates (centred, ~140 px) ----------
function iconTail(ctx) { ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(-70, 20); ctx.bezierCurveTo(-20, -60, 20, 60, 70, -30); ctx.stroke(); ctx.strokeStyle = '#E7A9A0'; ctx.lineWidth = 12; ctx.stroke(); ctx.restore(); }
function iconBarcode(ctx) { CL.cutout(ctx, () => rr(ctx, -80, -56, 160, 112, 8), '#FFFDF8', { elev: 0.6 }); ctx.fillStyle = INK; let x = -64; for (let i = 0; i < 22; i++) { const w = hash(i * 3) < 0.4 ? 7 : 3; ctx.fillRect(x, -40, w, 66); x += w + 3; if (x > 62) break; } fitTxt(ctx, '0 12345 6789', 0, 48, 16, INK, 140, 'center', ST.FONT.type); }
function iconAccount(ctx) { CL.cutout(ctx, () => rr(ctx, -84, -54, 168, 108, 12), '#4D8DFF', { elev: 0.6 }); ctx.fillStyle = C.yellow; rr(ctx, -64, -26, 40, 30, 5); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); fitTxt(ctx, '•••• 0000', 0, 34, 22, '#FFFDF8', 140); }
function iconPlate(ctx) { CL.cutout(ctx, () => rr(ctx, -84, -44, 168, 88, 10), '#F4F6F2', { elev: 0.6 }); ctx.lineWidth = 3; ctx.strokeStyle = '#2E3A59'; rr(ctx, -76, -36, 152, 72, 7); ctx.stroke(); txt(ctx, 'MEXICO', 0, -16, 13, '#2E3A59'); fitTxt(ctx, 'LMX 213', 0, 26, 36, INK, 140); }
function iconEmu(ctx, t = 0) { ctx.save(); ctx.translate(0, 70); ctx.scale(0.22, 0.22); S.emu(ctx, { phase: t * 4, stride: 0.2, look: [0.5, 0] }); ctx.restore(); }
// a plate card with an icon + word + mark (✗ red / ✓ green); u = pop, m = mark 0..1
function choicePlate(ctx, word, icon, ok, u, m, t) {
  if (u <= 0) return; ctx.save(); const k = E.back(clamp(u), 2); ctx.scale(k, k); ctx.rotate((word.length % 2 ? -1 : 1) * 0.02);
  CL.cutout(ctx, () => rr(ctx, -150, -170, 300, 340, 22), ok && m > 0 ? '#E6F5EC' : PAL.cream, { elev: 1.6 });
  ctx.save(); ctx.translate(0, -50); icon(ctx, t); ctx.restore();
  fitTxt(ctx, word, 0, 120, 52, INK, 260);
  if (m > 0) { ctx.save(); ctx.translate(90, -120); const s = E.back(clamp(m), 2.4); ctx.scale(s, s);
    if (ok) { ell(ctx, 0, 0, 56, 56); fillStroke(ctx, PAL.green, 5); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-6, 24); ctx.lineTo(28, -22); ctx.stroke(); }
    else ST.bigX(ctx, 44, 1);
    ctx.restore(); }
  ctx.restore();
}

// ---------- chapter card (0–3 s) ----------
function chapterCard(ctx, t, n, title, place, icon, o = {}) {
  ST.bg(ctx, o.bg || '#E5DCC8'); ctx.fillStyle = 'rgba(120,90,50,0.07)'; for (let i = 0; i < 30; i++) ctx.fillRect(0, i * 40, W, 3);
  const u = E.back(seg(t, 0.0, 0.45), 1.6), z = 1 + t * 0.02;
  ctx.save(); ctx.translate(W / 2, 470 + (1 - u) * 60); ctx.scale(z * (0.85 + 0.15 * u), z * (0.85 + 0.15 * u)); ctx.globalAlpha *= clamp(u * 2); ctx.rotate(-0.015);
  CL.cutout(ctx, () => rr(ctx, -640, -300, 1280, 600, 26), PAL.cream, { elev: 2.2 });
  ctx.save(); ctx.translate(-430, -300); ctx.rotate(-0.04); CL.cutout(ctx, () => rr(ctx, -150, -44, 300, 88, 12), C.red, { elev: 1.2 }); fitTxt(ctx, n, 0, 18, 46, PAL.cream, 270); ctx.restore();
  fitTxt(ctx, title, 0, -60, 120, INK, 1160);
  ctx.save(); ctx.translate(0, 50); const pu = ST.pop(t, 0.35); ctx.scale(pu, pu); if (pu > 0) { ctx.font = `46px ${F.black}`; const w = ctx.measureText(place).width + 50; CL.cutout(ctx, () => rr(ctx, -w / 2, -40, w, 62, 10), '#171717', { elev: 0.8 }); txt(ctx, place, 0, 8, 46, C.yellow); } ctx.restore();
  ctx.save(); ctx.translate(0, 270); icon(ctx, t); ctx.restore();
  ctx.restore();
}

module.exports = { S, RIM, landW, wheatW, halfPass, stage, crowd, gunner, litP, iconTail, iconBarcode, iconAccount, iconPlate, iconEmu, choicePlate, chapterCard };
