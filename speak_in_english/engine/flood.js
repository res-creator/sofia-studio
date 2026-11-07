// "Flood: «it's not us»" (rubric «A1 vs C2», compact form, as taxi/halves) renderer, hard_cut camera: node flood.js start end out.mp4 | --png=f1,f2
// Her flat: water drips from the ceiling light fitting into a translucent bucket (the running prop: it fills up level by level),
// Gary from upstairs in a bathrobe and slippers stands at her open front door with a "No.1 NEIGHBOUR" mug.
// Gags: hook — sunny window behind "must be the rain"; A1 — bucket close-up; A2 — a drop lands on her head; B1 — the ceiling stain spreads;
// B2 — "What bush?" the leak waters her houseplant bush and it blooms; C1 — he shuffles off upstairs; C2 — a rubber duck drops out of the light
// fitting into the bucket, silent beat, "That's Gerald. He's mine."
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/flood/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_market, top: { type: 'cardigan', col: '#7FB6A8', col2: '#FFF6E0' } };
const GARY = { ...BASE.reggie, h: 1640, top: { type: 'coat', col: '#86BFE3', col2: '#F4F8FB' }, bottom: { type: 'trousers', col: '#3C5A8A' }, shoes: { col: '#F4F8FB', acc: '#86BFE3' } };
const HX = -260, GX = 590;
const G = { her: geom(HER), gary: geom(GARY) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- room geometry (world: floor y = 0)
const CEIL = -2250, LGT = { x: -720, y: -1880 }, BK = { x: -720, h: 300, wt: 300, wb: 230 }, WIN = { x0: -1560, x1: -1040, y0: -1980, y1: -1160 };
const PLANT = { x: -1300 }, DOOR = { x0: 300, x1: 860, y0: -2060 };
const DUCK_T = ev('C2', 'duck'), PLOP_T = ev('C2', 'plop'), LEAVE_T = ev('C1', 'leave'), HEAD_T = ev('A2', 'head') + 0.34, PLANT_T = ev('B2', 'plant') + 0.22, STAIN_T = ev('B1', 'stain');
// water level in the bucket (0..1): rises through the video; the duck's splash pushes it to the brim
function level(t) { let v = 0.16 + 0.62 * clamp(t / SC.C2.s); if (t > PLOP_T) v = Math.min(0.97, v + 0.12 * eOut(clamp((t - PLOP_T) / 0.3))); return v; }
// the stain on the ceiling grows; it jumps after B1 ("leak in your imagination")
function stainR(t) { return 150 + 3 * Math.min(t, 60) + (t > STAIN_T ? 160 * eOut(clamp((t - STAIN_T) / 0.8)) : 0); }
const waterY = t => -18 - level(t) * (BK.h - 36);
// drops: every 'drip' cue in the timeline is a drop that lands at that time
const DROPS = TL.sfx.filter(s => s.n === 'drip').map(s => s.t);
function dropPath(tl) {   // -> {sx, sy, tx, ty, dur}
  if (Math.abs(tl - HEAD_T) < 0.05) { const hy = G.her.headY - G.her.hh * 0.95; return { sx: HX - 10, sy: CEIL, tx: HX - 10, ty: hy, dur: 0.42, head: true }; }
  if (Math.abs(tl - PLANT_T) < 0.05) return { sx: PLANT.x + 20, sy: CEIL, tx: PLANT.x + 20, ty: -640, dur: 0.48, plant: true };
  return { sx: LGT.x, sy: LGT.y + 30, tx: BK.x, ty: waterY(tl), dur: 0.36 };
}
function drawDrop(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#6FC3F2'; c.beginPath(); c.moveTo(0, -30); c.bezierCurveTo(12, -12, 18, 0, 18, 8); c.arc(0, 8, 18, 0, Math.PI); c.bezierCurveTo(-18, 0, -12, -12, 0, -30); c.fill();
  c.strokeStyle = '#2F7DB8'; c.lineWidth = 3; c.stroke(); c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(-6, 4, 4, 7, -0.4, 0, TAU); c.fill(); c.restore(); }
function drops(c, t) {
  for (const tl of DROPS) { const p = dropPath(tl), u = (t - (tl - p.dur)) / p.dur;
    if (u >= 0 && u < 1) { const k = u * u; drawDrop(c, lerp(p.sx, p.tx, k), lerp(p.sy, p.ty, k), 1.4); }
    const a = t - tl; if (a >= 0 && a < 0.45) {   // splash
      const q = a / 0.45; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#BFE6FA'; c.lineWidth = 6;
      if (!p.head && !p.plant) { c.beginPath(); c.ellipse(p.tx, p.ty, 30 + 90 * q, 8 + 22 * q, 0, 0, TAU); c.stroke(); }
      c.fillStyle = '#8FD3F6'; for (let i = 0; i < 6; i++) { const an = -Math.PI * (0.15 + 0.7 * i / 5), r = 30 + 110 * q; c.beginPath(); c.arc(p.tx + Math.cos(an) * r, p.ty + Math.sin(an) * r * 0.9 + 140 * q * q, 9 * (1 - q) + 3, 0, TAU); c.fill(); }
      c.restore(); } } }

// ---------------- rubber duck (Gerald)
function duck(c, x, y, s = 1, rot = 0, blink = false) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-70, -10); q.q(-80, 40, -20, 50); q.l(50, 50); q.q(95, 40, 85, -5); q.q(70, 10, 40, -5); q.q(0, -30, -70, -10); q.z(); }, '#FFD23F', { sd: 8, hd: 4, lw: 5 });
  paint(c, q => { q.m(-60, -10); q.b(-80, -90, 20, -100, 25, -40); q.q(20, -10, -60, -10); q.z(); }, '#FFD23F', { sd: 6, hd: 3, lw: 5 });
  c.fillStyle = '#F28C28'; c.beginPath(); c.moveTo(-62, -56); c.quadraticCurveTo(-110, -60, -112, -44); c.quadraticCurveTo(-90, -34, -60, -40); c.closePath(); c.fill(); c.strokeStyle = '#B85A10'; c.lineWidth = 4; c.stroke();
  if (blink) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-36, -64); c.lineTo(-18, -64); c.stroke(); }
  else { c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-28, -64, 9, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-31, -67, 3, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(184,120,20,.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-10, 10); c.quadraticCurveTo(20, 30, 50, 12); c.stroke(); c.restore(); }
// where the duck is in the world at t (null = still hidden inside the light fitting)
function duckPos(t) {
  if (t < DUCK_T) return null;
  const fall0 = PLOP_T - 0.32;
  if (t < fall0) { const u = (t - DUCK_T) / (fall0 - DUCK_T); return { x: LGT.x, y: LGT.y + 10 + 60 * eOut(clamp(u * 1.6)), r: Math.sin(t * 22) * 0.15 * (1 - u), s: 1.1 }; }
  if (t < PLOP_T) { const u = (t - fall0) / 0.32; return { x: lerp(LGT.x, BK.x, u), y: lerp(LGT.y + 70, waterY(t) - 10, u * u), r: u * 0.6, s: 1.1 }; }
  const a = t - PLOP_T; return { x: BK.x + Math.sin(a * 2.2) * 30, y: waterY(t) - 22 + Math.sin(a * 5) * 6 + (a < 0.3 ? 40 * Math.sin(a / 0.3 * Math.PI) : 0), r: Math.sin(a * 3) * 0.12, s: 1.1 };
}

// ---------------- the room (prerendered, softly blurred)
const BX0 = -3300, BY0 = -3900, BW = 6600, BH = 5900, BS = 0.5;
function drawWindow(c) { const { x0, x1, y0, y1 } = WIN, w = x1 - x0, h = y1 - y0;
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#5FB3F0'); g.addColorStop(1, '#BFE6FF'); c.fillStyle = g; c.fillRect(x0, y0, w, h);
  // the sun (it is NOT raining)
  const sx = x0 + w * 0.68, sy = y0 + h * 0.28; c.strokeStyle = '#FFD23F'; c.lineWidth = 14; c.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.moveTo(sx + Math.cos(a) * 100, sy + Math.sin(a) * 100); c.lineTo(sx + Math.cos(a) * 150, sy + Math.sin(a) * 150); c.stroke(); }
  c.fillStyle = '#FFD23F'; c.beginPath(); c.arc(sx, sy, 80, 0, TAU); c.fill(); c.fillStyle = '#FFF2A8'; c.beginPath(); c.arc(sx - 20, sy - 20, 34, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; for (const [cx, cy, r] of [[x0 + 120, y0 + 420, 60], [x0 + 190, y0 + 400, 75], [x0 + 260, y0 + 425, 55]]) { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); }
  c.fillStyle = '#7FBF6A'; c.beginPath(); c.moveTo(x0, y1); c.quadraticCurveTo(x0 + w * 0.3, y1 - 200, x0 + w * 0.6, y1 - 120); c.quadraticCurveTo(x0 + w * 0.85, y1 - 60, x1, y1 - 150); c.lineTo(x1, y1); c.fill();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 34; c.strokeRect(x0, y0, w, h); c.lineWidth = 18; c.beginPath(); c.moveTo((x0 + x1) / 2, y0); c.lineTo((x0 + x1) / 2, y1); c.moveTo(x0, (y0 + y1) / 2); c.lineTo(x1, (y0 + y1) / 2); c.stroke();
  c.fillStyle = '#F3EDDF'; c.fillRect(x0 - 60, y1 + 10, w + 120, 50); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x0 - 60, y1 + 60, w + 120, 14);
  for (const s of [-1, 1]) { const cx = s < 0 ? x0 - 40 : x1 + 40; c.fillStyle = '#E9A0B4'; c.beginPath(); c.moveTo(cx - 90, y0 - 70); c.lineTo(cx + 90, y0 - 70); c.quadraticCurveTo(cx + 40 * s, (y0 + y1) / 2, cx + 70, y1 + 40); c.lineTo(cx - 70, y1 + 40); c.quadraticCurveTo(cx - 40 * s, (y0 + y1) / 2, cx - 90, y0 - 70); c.fill();
    c.strokeStyle = 'rgba(160,70,100,.35)'; c.lineWidth = 5; for (const dx of [-40, 0, 40]) { c.beginPath(); c.moveTo(cx + dx, y0 - 60); c.lineTo(cx + dx * 0.8, y1 + 30); c.stroke(); } }
  c.fillStyle = '#C9A06A'; c.fillRect(x0 - 180, y0 - 96, w + 360, 22); }
function drawStairwell(c) { const { x0, x1, y0 } = DOOR;
  c.fillStyle = '#5A5470'; c.fillRect(x0, y0, x1 - x0, -y0); c.fillStyle = '#4A4460';
  for (let k = 0; k < 9; k++) { const sx = x0 + 120 + k * 80, sy = -k * 90; c.fillStyle = k % 2 ? '#6A6480' : '#625C78'; c.fillRect(sx, sy - 90, x1 - sx, 90); c.fillStyle = '#7A7490'; c.fillRect(sx, sy - 90, x1 - sx, 12); }
  c.strokeStyle = '#3A2A20'; c.lineWidth = 14; c.beginPath(); c.moveTo(x0 + 120, -900); c.lineTo(x1, -1550); c.stroke(); c.lineWidth = 8; for (let k = 0; k < 8; k++) { const bx = x0 + 150 + k * 80; c.beginPath(); c.moveTo(bx, -920 - k * 58); c.lineTo(bx, -k * 90 - 80); c.stroke(); }
  c.fillStyle = '#E8DFC0'; rr(c, x0 + 60, y0 + 160, 150, 90, 10); c.fill(); fitTxt(c, 'FLAT 3', x0 + 135, y0 + 205, 34, '#3A2A20', 130);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x0, y0, x1 - x0, 60); }
function drawRightWall(c) {   // wall right of the doorway + the open door leaf + the frame (also drawn in front of Gary when he leaves)
  wallFill(c, DOOR.x1, BX0 + BW);
  c.fillStyle = '#B5824E'; c.beginPath(); c.moveTo(DOOR.x1 + 6, DOOR.y0 + 10); c.lineTo(DOOR.x1 + 150, DOOR.y0 - 70); c.lineTo(DOOR.x1 + 150, 80); c.lineTo(DOOR.x1 + 6, 0); c.closePath(); c.fill();
  c.strokeStyle = '#7A5230'; c.lineWidth = 6; c.stroke(); c.fillStyle = '#E2C04A'; c.beginPath(); c.arc(DOOR.x1 + 120, -1020, 16, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillRect(DOOR.x1 - 4, DOOR.y0 - 60, 60, -DOOR.y0 + 60); c.fillRect(DOOR.x0 - 56, DOOR.y0 - 60, DOOR.x1 - DOOR.x0 + 112, 60);
  c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(DOOR.x1 + 52, DOOR.y0, 10, -DOOR.y0);
  c.fillStyle = '#5A3E2A'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(1260 + k * 130, -1500, 14, 0, TAU); c.fill(); } c.fillStyle = '#C8102E'; rr(c, 1220, -1490, 90, 380, 30); c.fill(); c.fillStyle = '#3C6FB4'; rr(c, 1350, -1490, 80, 320, 30); c.fill();
  c.fillStyle = '#EDE4D0'; c.fillRect(DOOR.x1 + 56, -130, BX0 + BW - DOOR.x1, 130); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(DOOR.x1 + 56, -130, BX0 + BW - DOOR.x1, 10); }
function wallFill(c, x0, x1) { c.fillStyle = '#F4E6C8'; c.fillRect(x0, CEIL, x1 - x0, -CEIL); c.fillStyle = 'rgba(214,170,120,.22)'; for (let x = Math.ceil((x0 - BX0) / 120) * 120 + BX0; x < x1; x += 120) c.fillRect(x, CEIL, 40, -CEIL);
  c.fillStyle = 'rgba(214,170,120,.35)'; for (let x = Math.ceil((x0 - BX0) / 120) * 120 + BX0 + 80; x < x1; x += 120) for (let y = CEIL + 60; y < -150; y += 160) { c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); } }
function drawRoom(c) {
  // ceiling
  c.fillStyle = '#FBF8F2'; c.fillRect(BX0, BY0, BW, CEIL - BY0); c.fillStyle = '#E6DED0'; c.fillRect(BX0, CEIL - 50, BW, 50); c.fillStyle = '#FFFFFF'; c.fillRect(BX0, CEIL - 70, BW, 20);
  wallFill(c, BX0, BX0 + BW); drawStairwell(c);
  // skirting + floor (wooden planks)
  c.fillStyle = '#EDE4D0'; c.fillRect(BX0, -130, DOOR.x0 - BX0, 130); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(BX0, -130, DOOR.x0 - BX0, 10);
  c.fillStyle = '#C08A5A'; c.fillRect(BX0, 0, BW, BY0 + BH); c.strokeStyle = 'rgba(90,50,20,.35)'; c.lineWidth = 5;
  for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x * 1.5, 2000); c.stroke(); } for (let y = 150; y < 2000; y += 220) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  // rug
  c.fillStyle = '#D9607A'; c.beginPath(); c.ellipse(-150, 240, 900, 160, 0, 0, TAU); c.fill(); c.strokeStyle = '#FFE0E8'; c.lineWidth = 10; c.beginPath(); c.ellipse(-150, 240, 820, 130, 0, 0, TAU); c.stroke();
  drawWindow(c);
  // picture frame (a seaside), bookshelf, side table with a lamp
  c.fillStyle = '#7A5230'; c.fillRect(-160, -2080, 380, 290); c.fillStyle = '#BFE6FF'; c.fillRect(-135, -2055, 330, 240); c.fillStyle = '#3C8FC9'; c.fillRect(-135, -1900, 330, 85); c.fillStyle = '#FFD23F'; c.beginPath(); c.arc(100, -1990, 30, 0, TAU); c.fill();
  c.fillStyle = '#8A5A34'; c.fillRect(-2800, -2000, 760, 1880); c.fillStyle = '#6A4224'; for (let k = 0; k < 5; k++) c.fillRect(-2780, -1960 + k * 380, 720, 26);
  for (let k = 0; k < 4; k++) for (let b = 0; b < 9; b++) { const cols = ['#E0474C', '#3C6FB4', '#F2C14E', '#4CAF6A', '#9A6AC9']; c.fillStyle = cols[(k * 3 + b) % 5]; c.fillRect(-2760 + b * 76, -1934 + k * 380 + 30 + hash(k * 9 + b) * 60, 60, 350 - 30 - hash(k * 9 + b) * 60); }
  c.fillStyle = '#8A5A34'; c.fillRect(-1960, -620, 360, 30); c.fillRect(-1940, -590, 24, 590); c.fillRect(-1644, -590, 24, 590);
  c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(-1860, -900); c.lineTo(-1700, -900); c.lineTo(-1660, -720); c.lineTo(-1900, -720); c.fill(); c.fillStyle = '#5A3E2A'; c.fillRect(-1790, -720, 16, 100);
  // the plug socket + a puddle under the bucket
  drawRightWall(c);
}
const mkBG = (fn, clip) => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); if (clip) { c.beginPath(); c.rect(clip[0], BY0, clip[1] - clip[0], BH); c.clip(); } fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.1px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom), FGR = mkBG(drawRightWall, [DOOR.x1 - 6, BX0 + BW]);

// ---------------- dynamic props: ceiling stain, light fitting, bucket, plant
function stain(c, t) { const r = stainR(t); c.save(); c.translate(LGT.x + 60, CEIL - 70); c.scale(1, 0.35);
  for (const [k, a] of [[1.0, 0.22], [0.75, 0.25], [0.5, 0.3]]) { c.fillStyle = `rgba(150,110,60,${a})`; c.beginPath(); for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU, rr2 = r * k * (1 + 0.12 * Math.sin(an * 5 + k * 3)); i ? c.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2) : c.moveTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } c.closePath(); c.fill(); }
  c.strokeStyle = 'rgba(120,80,40,.5)'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.restore();
  if (t > HEAD_T - 3 || t > PLANT_T - 3) { c.fillStyle = 'rgba(150,110,60,.25)'; c.beginPath(); c.ellipse(HX - 10, CEIL - 60, 120, 40, 0, 0, TAU); c.fill(); if (t > PLANT_T - 3) { c.beginPath(); c.ellipse(PLANT.x + 20, CEIL - 60, 130, 40, 0, 0, TAU); c.fill(); } } }
function lightFitting(c, t) { const dw = t > DUCK_T && t < PLOP_T ? Math.sin(t * 30) * 0.08 : 0;
  c.strokeStyle = '#3A3F4B'; c.lineWidth = 8; c.beginPath(); c.moveTo(LGT.x, CEIL - 50); c.lineTo(LGT.x, LGT.y - 120); c.stroke();
  c.fillStyle = '#FFFFFF'; rr(c, LGT.x - 40, CEIL - 60, 80, 24, 8); c.fill();
  c.save(); c.translate(LGT.x, LGT.y - 120); c.rotate(dw);
  const gl = c.createRadialGradient(0, 140, 10, 0, 140, 260); gl.addColorStop(0, 'rgba(255,240,180,.45)'); gl.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = gl; c.fillRect(-260, -120, 520, 520);
  paint(c, q => { q.m(-30, 0); q.l(30, 0); q.q(150, 30, 170, 120); q.l(-170, 120); q.q(-150, 30, -30, 0); q.z(); }, '#F2C14E', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = '#FFF4C0'; c.beginPath(); c.ellipse(0, 122, 150, 18, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(111,195,242,.8)'; c.beginPath(); c.arc(-60, 132, 9, 0, TAU); c.arc(70, 130, 7, 0, TAU); c.fill();   // water beads on the rim
  c.restore(); }
function bucket(c, t, x = BK.x) { const { h, wt, wb } = BK, wy = waterY(t);
  c.save(); c.translate(x, 0);
  c.fillStyle = 'rgba(111,195,242,.35)'; c.beginPath(); c.ellipse(0, 6, wt * 0.95, 34, 0, 0, TAU); c.fill();   // puddle
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 0, wb * 0.75, 20, 0, 0, TAU); c.fill();
  const xAt = y => lerp(wb / 2, wt / 2, -y / h);
  // back rim (inside)
  c.fillStyle = '#C5DCEB'; c.beginPath(); c.ellipse(0, -h, wt / 2, 34, 0, Math.PI, TAU); c.fill();
  // water inside (seen through the translucent plastic)
  c.fillStyle = '#3C9AD8'; c.beginPath(); c.moveTo(-xAt(wy), wy); c.lineTo(-wb / 2, -8); c.quadraticCurveTo(0, 12, wb / 2, -8); c.lineTo(xAt(wy), wy); c.closePath(); c.fill();
  c.fillStyle = '#7CC6F2'; c.beginPath(); c.ellipse(0, wy, xAt(wy), 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#BFE6FA'; c.lineWidth = 4; c.stroke();
  // plastic body
  c.fillStyle = 'rgba(230,244,252,.38)'; c.beginPath(); c.moveTo(-wt / 2, -h); c.lineTo(-wb / 2, -8); c.quadraticCurveTo(0, 12, wb / 2, -8); c.lineTo(wt / 2, -h); c.closePath(); c.fill();
  c.strokeStyle = '#4A7A9A'; c.lineWidth = 6; c.stroke();
  for (const k of [0.33, 0.66]) { const y = -h * k; c.strokeStyle = 'rgba(74,122,154,.45)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-xAt(y), y); c.quadraticCurveTo(0, y + 16, xAt(y), y); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-wt / 2 + 40, -h + 20); c.lineTo(-wt / 2 + 70, -h + 20); c.lineTo(-wb / 2 + 50, -30); c.lineTo(-wb / 2 + 26, -30); c.fill();
  c.strokeStyle = '#4A7A9A'; c.lineWidth = 8; c.beginPath(); c.ellipse(0, -h, wt / 2, 34, 0, 0, TAU); c.stroke();
  c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.moveTo(-wt / 2 + 6, -h + 10); c.quadraticCurveTo(0, -h - 170, wt / 2 - 6, -h + 10); c.stroke();
  c.restore();
  K.mark(c, 'bucket', x, -h / 2, 180); }
function plant(c, t) { const x = PLANT.x, bl = t > PLANT_T ? eBack(clamp((t - PLANT_T - 0.12) / 0.35), 2.4) : 0, wet = t > PLANT_T ? 1 : 0;
  c.save(); c.translate(x, 0);
  paint(c, q => { q.m(-120, -260); q.l(120, -260); q.l(90, 0); q.l(-90, 0); q.z(); }, '#C8693C', { sd: 6, hd: 3, lw: 5 }); c.fillStyle = '#A8552E'; c.fillRect(-130, -290, 260, 40);
  const perk = bl * 30, sway = Math.sin(t * 1.6) * 6;
  for (const [bx, by, r, col] of [[-90, -380, 110, '#4F9A4A'], [90, -390, 110, '#4F9A4A'], [0, -470 - perk, 135, '#5DAE55'], [-60, -540 - perk, 90, '#6CBF60'], [70, -550 - perk, 90, '#6CBF60']]) { c.fillStyle = col; c.beginPath(); c.arc(bx + sway, by, r * (1 + bl * 0.08), 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(-30 + sway, -560 - perk, 40, 0, TAU); c.fill();
  if (wet) { c.fillStyle = 'rgba(111,195,242,.8)'; for (const [dx, dy] of [[-40, -600], [30, -640], [70, -500]]) { c.beginPath(); c.arc(dx + sway, dy - perk, 9, 0, TAU); c.fill(); } }
  if (bl > 0) for (const [dx, dy, s] of [[-70, -600, 1], [60, -620, 0.9], [0, -680, 1.1], [100, -480, 0.8], [-110, -450, 0.8]]) { c.save(); c.translate(dx + sway, dy - perk); c.scale(bl * s, bl * s);
    c.fillStyle = '#FF7FA8'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; c.beginPath(); c.ellipse(Math.cos(a) * 22, Math.sin(a) * 22, 18, 12, a, 0, TAU); c.fill(); } c.fillStyle = '#FFD23F'; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill(); c.restore(); }
  c.restore(); K.mark(c, 'plant', x, -420, 200); }

// ---------------- hand-held items
const mugItem = ctx => { ctx.save(); ctx.rotate(-0.05); ctx.translate(14, -30); ctx.fillStyle = '#FFFFFF'; rr(ctx, -40, -50, 80, 96, 12); ctx.fill(); ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 4; ctx.stroke();
  ctx.lineWidth = 9; ctx.strokeStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(44, -2, 20, -1.2, 1.2); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#2B2F3A'; ctx.beginPath(); ctx.arc(44, -2, 25, -1.2, 1.2); ctx.stroke();
  ctx.fillStyle = '#E0474C'; UI.font(ctx, 'Unb9', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('No.1', 0, -18); UI.font(ctx, 'Unb9', 11); ctx.fillStyle = '#2B2F3A'; ctx.fillText('NEIGHBOUR', 0, 6);
  ctx.strokeStyle = 'rgba(200,200,200,.8)'; ctx.lineWidth = 4; for (const dx of [-14, 8]) { ctx.beginPath(); ctx.moveTo(dx, -60); ctx.bezierCurveTo(dx - 12, -78, dx + 12, -90, dx, -108); ctx.stroke(); } ctx.restore(); };
const phoneItem = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.translate(-10, -70); ctx.fillStyle = '#2B2F3A'; rr(ctx, -46, -80, 92, 160, 14); ctx.fill(); ctx.fillStyle = '#F4F1EC'; rr(ctx, -38, -70, 76, 140, 8); ctx.fill();
  ctx.fillStyle = '#2F7DE1'; ctx.fillRect(-38, -70, 76, 26); ctx.fillStyle = '#2F7DE1'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(24, -20); ctx.quadraticCurveTo(24, 16, 0, 30); ctx.quadraticCurveTo(-24, 16, -24, -20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-2, 9); ctx.lineTo(12, -8); ctx.stroke(); ctx.fillStyle = '#9AA3B2'; ctx.fillRect(-28, 42, 56, 6); ctx.fillRect(-28, 54, 40, 6); ctx.restore(); };
const duckItem = ctx => { duck(ctx, 0, 30, 0.75, 0.1); };

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const frac = (id, t) => (t - SP[id].t) / SP[id].d;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'annoyed', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const up = () => { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 250, { planar: true }); st.look = -0.3; st.lookY = -0.5; };   // open palm up at the ceiling, beside the head
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.look = 0.8; if (t < endOf('hook_g')) up(); else if (t < hev('back')) { st.mood = 'annoyed'; st.look = 0.9; } else st.mood = 'annoyed'; }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'shock'; const f = frac('a1_h', t);
      if (f < 0.35) up(); else if (f < 0.68) st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 60, { planar: true }); else { st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 20, { planar: true }); st.armL = reach(g, -1, g.sw * 0.2, g.ySh + 40, { planar: true }); } }
    if (t > e('shrug')) { st.mood = 'skeptical'; st.look = 0.9; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.2)) { gest(st, g, 'her', t, 1, 160); st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 120, { planar: true }); } if (t > SP.a2_g.t + 0.3) st.mood = 'skeptical';
    if (t > HEAD_T) { const u = t - HEAD_T; st.mood = u < 1.2 ? 'shock' : 'annoyed'; st.blink = u < 0.5 ? 1 : 0; st.lookY = -0.6; st.headY = u < 0.25 ? Math.sin(u / 0.25 * Math.PI) * 26 : 0; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.2)) gest(st, g, 'her', t, 1, 160); if (t > SP.b1_g.t + 0.6) { st.mood = 'shock'; st.blink = 0; } if (t > endOf('b1_g') + 0.3) { st.mood = 'annoyed'; st.lookY = -0.5; st.look = 0.2; } }
  if (L === 'B2') { st.mood = 'skeptical'; if (speaking('b2_h', t, 0.05, 0.2)) { st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 120, { planar: true }); } if (t > SP.b2_g.t + 0.3) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > SP.c1_h.t - 0.1 && t < endOf('c1_g') + 0.3) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.55, g.ySh - 40, { planar: true }); st.items = { R: phoneItem }; } if (t > SP.c1_g.t + 0.2) { st.mood = 'smug'; st.look = 0.9; } }
  if (L === 'C2') { st.mood = 'neutral'; if (t > DUCK_T - 0.1) { st.mood = 'shock'; st.blink = 0; st.look = -0.4; st.lookY = -0.4; } if (t > PLOP_T + 0.2) { st.mood = 'shock'; st.lookY = 0.3; st.look = -0.7; }
    if (t > SP.c2_h.t - 0.1) { st.mood = 'smug'; st.look = 0.8; st.lookY = 0;
      const f = frac('c2_h', t); if (f > 0.4 && f < 0.7) { st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 200, { planar: true }); st.look = -0.5; } else if (f <= 0.4) { st.armL = reach(g, -1, g.sw * 0.3, g.ySh + 140, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.3, g.ySh + 150, { planar: true }); } }
    if (t > endOf('c2_h') + 0.4) { st.mood = 'smug'; st.blink = 1; }
    if (t > SP.c2_g.t + 0.4) { st.mood = 'happy'; st.blink = 0; st.laugh = true; } }
  return st; }
function garyState(t, L) { const g = G.gary, e = k => ev(L, k), st = { t, talk: talk('upstairs', t), mood: 'smug', turn: -0.35, look: -0.8, armL: reach(g, -1, -g.sw * 1.1, g.ySh + 230, { planar: true }), armR: hang(g, 1), items: { L: mugItem } };
  if (L === 'hook') { st.mood = 'happy'; if (speaking('hook_g', t, 0.05, 0.1)) { const f = frac('hook_g', t); st.blink = f > 0.55 ? 1 : 0; if (f > 0.55) st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 30 + Math.sin(t * 6) * 10, { planar: true }); } if (t > hev('gary')) { st.mood = 'smug'; st.blink = 1; st.armL = reach(g, -1, -g.sw * 0.5, g.ySh - 20, { planar: true }); } if (t > hev('gary') + 0.9) { st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 230, { planar: true }); } }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('shrug') - 0.05 && t < endOf('a1_g') + 0.6) { const u = t - e('shrug'); st.mood = 'happy'; st.headY = u < 0.5 ? -Math.abs(Math.sin(u * 9)) * 10 : 0; st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 110 - Math.min(1, u * 5) * 40, { planar: true }); st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 110 - Math.min(1, u * 5) * 40, { planar: true }); } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.2)) st.mood = 'surprised'; if (speaking('a2_g', t, 0.05, 0.3)) { st.mood = 'neutral'; gest(st, g, 'upstairs', t, 1, 150); } if (t > HEAD_T) { st.mood = 'surprised'; st.lookY = -0.5; } }
  if (L === 'B1') { if (speaking('b1_h', t, 0.05, 0.2)) st.mood = 'neutral'; if (t > e('tap') - 0.1) { st.mood = 'smug'; st.blink = frac('b1_g', t) > 0.5 ? 1 : 0; st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 60 + Math.sin(t * 7) * 18, { planar: true }); } if (t > endOf('b1_g') + 0.3) st.armR = hang(g, 1); }
  if (L === 'B2') { if (speaking('b2_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('look') - 0.05 && t < endOf('b2_g') + 0.5) { const u = t - e('look'); st.mood = 'surprised'; st.turn = -0.35 + Math.sin(u * 5) * 0.45; st.look = Math.sin(u * 5) > 0 ? 0.9 : -0.9; st.armR = reach(g, 1, g.sw * 2.1, g.ySh + 90, { planar: true }); }
    if (t > PLANT_T) { st.mood = 'shock'; st.turn = -0.4; st.look = -0.9; st.blink = 0; } }
  if (L === 'C1') { if (speaking('c1_h', t, 0.05, 0.2)) { const f = frac('c1_h', t); st.mood = f < 0.5 ? 'neutral' : 'worried'; }
    if (t > e('nod')) { const u = t - e('nod'); st.mood = 'worried'; st.look = -0.6; st.lookY = 0.3; st.headY = u < 0.8 ? Math.abs(Math.sin(u * 7)) * 22 : 14; }
    if (t > LEAVE_T) { const u = t - LEAVE_T; st.turn = 0.55; st.look = 0.9; st.mood = 'worried'; st.headY = -Math.abs(Math.sin(u * 12)) * 16; } }
  if (L === 'C2') { st.mood = 'smug'; if (t > DUCK_T - 0.1) { st.mood = 'worried'; st.look = -0.9; st.lookY = -0.3; }
    if (speaking('c2_h', t, 0.05, 0.1)) { const f = frac('c2_h', t); st.mood = f < 0.4 ? 'worried' : f < 0.7 ? 'surprised' : 'shock'; st.look = -0.9; st.lookY = 0; }
    if (t > endOf('c2_h')) { st.mood = 'shock'; st.blink = 0; st.look = -0.7; st.headY = t > ev('C2', 'gulp') && t < ev('C2', 'gulp') + 0.4 ? Math.sin((t - ev('C2', 'gulp')) / 0.4 * Math.PI) * 18 : 0; }
    if (t > SP.c2_g.t - 0.1) { st.mood = 'happy'; st.blink = frac('c2_g', t) > 0.45 ? 1 : 0; st.look = -0.6; st.lookY = 0.4; st.armL = reach(g, -1, -g.sw * 0.2, g.ySh + 170, { planar: true }); st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 170, { planar: true }); st.items = {}; }
    if (t > endOf('c2_g') + 0.2) { st.blink = 0; } }
  return st; }
function garyX(t, L) { return L === 'C1' && t > LEAVE_T ? GX + 700 * eIn(clamp((t - LEAVE_T) / 1.0)) : GX; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { win: [], light: [], drip: ['her'], ceil: ['her'], plant: ['her'], wide: ['her', 'gary'], card: ['her', 'gary'], two: ['her', 'gary'], cover: ['her', 'gary'], her: ['her'], gary: ['gary'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  stain(c, t); plant(c, t);
  if (who.includes('gary')) heads.upstairs = K.put(c, GARY, garyState(t, L), garyX(t, L), 0);
  if (L === 'C1' && t > LEAVE_T) c.drawImage(FGR, BX0, BY0, BW, BH);
  bucket(c, t);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  const dp = duckPos(t); if (dp) duck(c, dp.x, dp.y, dp.s, dp.r);
  lightFitting(c, t); drops(c, t);
  K.mark(c, 'light', LGT.x, LGT.y - 60, 170);
  if (!heads.upstairs) heads.upstairs = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- the bucket close-up (insert on a solid backdrop)
function bucketView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#1C3550'); g.addColorStop(1, '#0B1828'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'bucket' });
  const st = CAM_AT(t), k0 = eBack(clamp((t - st) / 0.25), 1.6);
  c.save(); c.translate(540, 1500); const s = 2.25 * lerp(0.92, 1, k0); c.scale(s, s); c.translate(-BK.x, 0);
  bucket(c, t);
  const dp = duckPos(t); if (dp && t > PLOP_T - 0.25) { const fall = t < PLOP_T ? { x: BK.x, y: lerp(-760, waterY(t) - 10, ((t - (PLOP_T - 0.25)) / 0.25) ** 2), r: 0.5, s: 1.1 } : dp; duck(c, fall.x, fall.y, fall.s, fall.r, t > SP.c2_g.t + 0.3 && t < SP.c2_g.t + 0.5); }
  for (const tl of DROPS) { const p = dropPath(tl); if (p.head || p.plant) continue; const u = (t - (tl - 0.3)) / 0.3; if (u >= 0 && u < 1) drawDrop(c, BK.x, lerp(-700, waterY(tl), u * u), 1.2);
    const a = t - tl; if (a >= 0 && a < 0.45) { const q = a / 0.45; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#BFE6FA'; c.lineWidth = 5; c.beginPath(); c.ellipse(BK.x, waterY(tl), 30 + 90 * q, 8 + 22 * q, 0, 0, TAU); c.stroke(); c.restore(); } }
  if (t > PLOP_T && t < PLOP_T + 0.6) { const q = (t - PLOP_T) / 0.6; c.save(); c.globalAlpha = 1 - q; c.fillStyle = '#8FD3F6'; for (let i = 0; i < 10; i++) { const an = -Math.PI * (0.08 + 0.84 * i / 9), r = 60 + 200 * q; c.beginPath(); c.arc(BK.x + Math.cos(an) * r, waterY(t) + Math.sin(an) * r + 300 * q * q, 12, 0, TAU); c.fill(); } c.restore(); }
  c.restore(); }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY, gHY = G.gary.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-20, fy(hHY, 0.56, 1110), 0.56, 'cover'), WIDE: S(-260, -1080, 0.5, 'wide'), CARD: S(-80, fy(hHY, 0.46, 1080), 0.46, 'card'), TWO: S(-90, fy(hHY, 0.64, 1080), 0.64, 'two'),
  DRIP: S(-820, -1130, 0.75, 'drip'), CEIL: S(-700, -1820, 0.95, 'ceil'), LIGHT: S(-720, -1650, 1.25, 'light'), WIN: S(-1300, -1560, 1.15, 'win'), PLANT: S(-1180, -800, 1.0, 'plant'),
  HER: S(HX - 10, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX - 10, fy(hHY, 1.3, 960), 1.3, 'her'), HER_B: S(-500, fy(hHY, 0.78, 900), 0.78, 'her'),
  GARY: S(GX - 40, fy(gHY, 1.0), 1.0, 'gary'), GARY_CU: S(GX - 30, fy(gHY, 1.3, 900), 1.3, 'gary'),
  BUCKET: U('bucket', 1) };
const C2Z = [SH.HER, SH.HER_B, SH.HER_CU];
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('drip')) return SH.COVER; if (t < hev('gary')) return f(SH.DRIP); if (t < hev('sun')) return f(SH.GARY_CU); if (t < hev('back')) return f(SH.WIN); return f(SH.TWO); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 0.6) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('bucket') - 0.05) return f(SH.BUCKET);
  if (L === 'A2' && t > e('head') - 0.05) return f(SH.HER_CU);
  if (L === 'B1' && t > e('stain') - 0.05) return f(SH.CEIL);
  if (L === 'B2' && t > e('plant') - 0.05) return f(SH.PLANT);
  if (L === 'C1' && t > e('leave') - 0.05) return f(SH.TWO);
  if (L === 'C2') { if (t < e('duck') - 0.05) return f(SH.WIDE); if (t < e('plop') - 0.05) return f(SH.LIGHT); if (t < SP.c2_h.t - 0.1) return f(SH.BUCKET);
    if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t < endOf('c2_h') + 0.25) return f(C2Z[2]);
    if (t < e('gulp') - 0.05) return f(SH.GARY);
    return f(SH.GARY_CU); }
  // the latest line that has started wins: the cut to the next speaker comes 0.1 s before his line, never after (no off-screen bubble over the current shot)
  const cur = TL.speech.filter(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25).pop();
  const single = who => who === 'her' ? SH.HER : SH.GARY;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
function CAM_AT(t) { let fr = Math.min(CAM.length - 1, Math.round(t * FPS)); const tag = CAM[fr].tag; while (fr > 0 && CAM[fr - 1].tag === tag) fr--; return fr / FPS; }
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function title(c, t) { const lines = TL.cfg.hook_title, a = 1 - clamp((t - 2.3) / 0.2); if (a <= 0) return; const rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 430); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore();
  if (global.__QA) global.__QA.ui(c, 'title', { x: 50, y: 255, w: 980, h: 350, k: a, id: 'title' }); }
function miniIntro(c, t, sc) { const u = t - sc.s; if (u > 0.5 || u < 0) return; const L = sc.id, i = UI.LV.indexOf(L); if (i < 0) return;
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const k = eIO(P(u, 0.05, 0.45)), cx = lerp(540, px, k), cy = lerp(960, py, k), R = lerp(330, 34, k);
  c.save(); c.globalAlpha = 1 - P(u, 0.4, 0.5); c.fillStyle = LVCOL[L]; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
  c.translate(cx, cy); const s = lerp(1, 0.2, k); c.scale(s, s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 230); UI.strokeText(c, L, 0, 10, C.white, C.oliveD, 18); c.restore(); }
// A1 lesson card drawn here (the shared 'meter' card shows «ГРАММАТИКА 100%», which does not fit this story): her 3 words, then «ВОДА ✗ он не кран»
function cardA1(c, t, sc) { const nar = SP.a1_nar, cd = TL.cfg.cards.A1, u = t - nar.t + 0.15; if (u < 0) return;
  const out = P(t, sc.e - 0.35, sc.e - 0.05), k = eBack(P(u, 0, 0.35), 1.6), x = 90, w = 900, h = 380, y = 330 + (1 - k) * -80, n = t - nar.t;
  const pop = a => eBack(P(n, a, a + 0.3), 2);
  c.save(); c.globalAlpha = clamp(u / 0.15) * (1 - out); c.translate(540, y + h / 2); c.rotate((1 - k) * -0.08); c.translate(-540, -(y + h / 2));
  c.fillStyle = 'rgba(62,71,30,.28)'; rr(c, x + 12, y + 18, w, h, 44); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, x, y, w, h, 44); c.fill(); c.stroke();
  c.fillStyle = LVCOL.A1; rr(c, x + 40, y - 34, 230, 68, 34); c.fill(); c.stroke(); UI.font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A1 • УРОК', x + 155, y + 2);
  const cx = x + 60, cy = y + 60; c.textAlign = 'left';
  const q0 = pop(0.05); if (q0 > 0) { c.save(); c.translate(cx, cy + 50); c.scale(q0, q0); UI.textFit(c, 'Unb9', 58, 'WATER! YOU! STOP!', 640); c.fillStyle = C.oliveD; c.fillText('WATER! YOU! STOP!', 0, 0); c.restore();
    c.save(); c.translate(cx + 780, cy + 50); c.scale(q0, q0); c.fillStyle = C.pink; rr(c, -110, -32, 120, 64, 32); c.fill(); UI.font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText('3', -50, 2); c.restore();
    UI.font(c, 'Nun9', 38); c.fillStyle = '#8A8F7A'; c.fillText('три слова — и…', cx, cy + 120); }
  const q = pop(0.75); if (q > 0) { c.save(); c.translate(cx, cy + 215); c.scale(q, q); UI.textFit(c, 'Unb9', 52, cd.label, 330); c.fillStyle = C.oliveD; c.fillText(cd.label, 0, 0); const wd = c.measureText(cd.label).width;
    UI.cross(c, wd + 50, 0, 36); UI.font(c, 'Nun9', 50); c.fillStyle = C.red; c.fillText(cd.note, wd + 110, 4); c.restore(); }
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x, y, w, h, k: 1, id: 'A1' }); }
function hud(c, t, sc) { if (sc.id === 'A1') cardA1(c, t, sc); else UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); miniIntro(c, t, sc); UI.levelIntroNext(c, t); }
function liveHeads(heads, proj, t) { const out = { ...heads };
  for (const who of Object.keys(out)) { const q = proj(out[who]); if (q.x >= 0 && q.x <= W) continue; const live = TL.speech.some(s => s.who === who && t >= s.t - 0.1 && t < s.t + s.d); if (!live) delete out[who]; }
  return out; }
const names = { upstairs: ['GARY', '#2F5A7C'] };
const HOLD = { hook_g: 0.05, a1_h: 0.05, a1_g: 0.05, a2_h: 0.05, a2_g: 0.05, b1_h: 0.05, b1_g: 0.05, b2_h: 0.05, b2_g: 0.05, c1_h: 0.05, c1_g: 0.05, c2_h: 0.05, c2_g: 0.1 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'Water! You! Stop!'], ['A2', "Water's coming through my ceiling."], ['B2', "Let's not beat about the bush."], ['C1', "I'll need your insurance details."]];
    K.outro(c, t, { q: ['ТЕБЯ ЗАТАПЛИВАЛИ', 'СОСЕДИ?'], qSize: 54, rows, cta: ['ОТПРАВЬ ТОЙ, КОГО', 'ЗАТАПЛИВАЛИ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.gary;
        K.put(cc, GARY, { t: tt, mood: 'happy', blink: Math.sin(tt * 2) > 0.7 ? 1 : 0, turn: -0.2, look: -0.4, lookY: 0.4, talk: 0, armL: reach(gd, -1, -gd.sw * 0.2, gd.ySh + 170, { planar: true }), armR: reach(gd, 1, gd.sw * 0.2, gd.ySh + 170, { planar: true }) }, 620, 0, 0.84);
        duck(cc, 620, (gd.ySh + 150) * 0.84 + Math.sin(tt * 4) * 4, 0.9, 0.05);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0.2, look: 0.3, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.55, g.ySh - 40, { planar: true }), items: { R: phoneItem } }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { bucketView(c, t); heads = { her: OFFL, upstairs: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.22); }
  heads = liveHeads(heads, proj, t);
  if (L === 'hook') { title(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, t < 3.6 ? (p => { const q = proj(p); return { x: q.x, y: Math.max(q.y, 1010) }; }) : proj, { cleanChunks: true, names, hold: HOLD }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.watermark(c); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: HOLD });
  hud(c, t, sc);
}
E.run('flood', NF, renderFrame);
