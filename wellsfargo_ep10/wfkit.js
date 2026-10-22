// Episode 10 sets and props (on hirkit): the heroine, the clerks, food truck, gas station, supermarket, living room at dusk,
// receipts, fee tags, the phone, and the paper bank machine (belt, arm, balance meter, OVERDRAFT stamp). Generic places, no logos.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell } = R;

const W = 1080, H = 1920;
// 2.5D layer around the camera (world origin = scene centre, floor at y = 0)
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center') { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align); }

// ---------- cast ----------
const MAYA = { skin: '#D99A6C', hair: '#3B2418', hairStyle: 'long', top: C.yellow, cuff: '#E9A93A', shirt: '#FFFDF8', zip: 1, pants: '#2E3A59', shoes: '#F7F5F0', sole: '#C9C1B1', iris: '#5A3A22', brow: '#2B1A10', lashes: 1, lips: '#8E3B3B' };
const VENDOR = { skin: '#7A4E2D', hair: '#1E1612', hairStyle: 'short', beard: 1, top: '#FFFDF8', apron: C.red, pants: '#3A3A3A', shoes: '#3A2A22', iris: '#3A2414' };
const CASHIER = { skin: '#F1C6A4', hair: '#C9A04E', hairStyle: 'bun', top: '#2FA37E', pants: '#2E3A59', shoes: '#3A2A22', iris: '#3D6E8C', lashes: 1, lips: '#B04A4A' };
const BARISTA = { skin: '#F1C6A4', hair: '#B5482A', hairStyle: 'bun', top: '#2B2B2B', apron: C.yellow, pants: '#3A3A3A', shoes: '#5A3A22', iris: '#3D6E8C', lashes: 1 };

// ---------- props ----------
function priceTag(ctx, label, col = '#FFFDF8', fg = INK, s = 1, rot = 0) { // paper price tag with a string hole
  ctx.save(); ctx.rotate(rot); ctx.scale(s, s); ctx.font = `64px ${F.black}`; const w = ctx.measureText(label).width + 70;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2 + 34, -50); ctx.lineTo(w / 2, -50); ctx.lineTo(w / 2, 50); ctx.lineTo(-w / 2 + 34, 50); ctx.lineTo(-w / 2, 0); ctx.closePath(); }, col, { elev: 1.3 });
  ell(ctx, -w / 2 + 30, 0, 9, 9); ctx.fillStyle = 'rgba(40,25,10,0.5)'; ctx.fill(); txt(ctx, label, 16, 22, 64, fg); ctx.restore();
}
function feeTag(ctx, s = 1, rot = 0) { priceTag(ctx, '$35', C.red, '#FFFDF8', s, rot); }
// receipt slip: title + amount; o.stamp 0..1 (OVERDRAFT), o.red (amount in red)
function receipt(ctx, title, amount, o = {}) {
  const w = o.w || 300, h = o.h || 380;
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); for (let j = 0; j <= 10; j++) ctx.lineTo(w / 2 - j * w / 10, h / 2 - (j % 2) * 16); ctx.closePath(); }, '#FFFDF8', { elev: o.elev ?? 1.2, tex: 0.45 });
  ctx.fillStyle = 'rgba(90,84,80,0.35)'; for (let i = 0; i < 3; i++) ctx.fillRect(-w / 2 + 34, -h / 2 + 150 + i * 34, (w - 68) * (0.5 + K.hash(i + title.length) * 0.45), 10);
  fitTxt(ctx, title, 0, -h / 2 + 90, 44, '#5A5450', w - 50);
  txt(ctx, amount, 0, h / 2 - 70, 92, o.red ? C.red : INK);
  if (o.stamp > 0) { const u = clamp(o.stamp); ctx.save(); ctx.globalAlpha = Math.min(1, u * 2) * 0.92; ctx.translate(0, -10); ctx.rotate(-0.22); const sc = 1 + (1 - E.out(u)) * 0.6; ctx.scale(sc, sc);
    ctx.strokeStyle = C.red; ctx.lineWidth = 9; rr(ctx, -w * 0.47, -46, w * 0.94, 92, 12); ctx.stroke(); fitTxt(ctx, 'OVERDRAFT', 0, 20, 58, C.red, w * 0.86); ctx.restore(); }
}
function phone(ctx, screen, s = 1) { // phone in portrait, centred; screen(ctx, w, h) draws the app in local coords (0,0 = top-left)
  ctx.save(); ctx.scale(s, s);
  CL.cutout(ctx, () => rr(ctx, -120, -240, 240, 480, 34), '#1B1D24', { elev: 1.2, tex: 0 });
  ctx.save(); rr(ctx, -106, -222, 212, 444, 22); ctx.clip(); ctx.translate(-106, -222); screen(ctx, 212, 444); ctx.restore();
  rr(ctx, -30, -232, 60, 10, 5); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
}
// generic bank app screen (no logo): header, balance, list of pending card purchases
function bankApp(ctx, w, h, o = {}) {
  ctx.fillStyle = '#F7F5F0'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#2E3A59'; ctx.fillRect(0, 0, w, 74);
  txt(ctx, 'MY BANK', w / 2, 50, 26, '#FFFDF8');
  txt(ctx, 'Checking', 22, 112, 20, '#5A5450', 'left');
  txt(ctx, o.balance || '$100.00', 22, 160, 40, o.neg ? C.red : INK, 'left');
  const items = o.items || [];
  items.forEach((it, i) => { const y = 196 + i * 56; ctx.fillStyle = '#E9E2D2'; ctx.fillRect(14, y, w - 28, 48); txt(ctx, it[0], 26, y + 32, 20, INK, 'left'); txt(ctx, it[1], w - 26, y + 32, 22, INK, 'right'); });
  if (o.note) txt(ctx, o.note, w / 2, h - 30, 18, '#5A5450');
}
function paperBag(ctx, s = 1, kind = 'groceries') { // brown paper bag with produce sticking out, base at 0
  ctx.save(); ctx.scale(s, s);
  if (kind === 'groceries') {
    ctx.save(); ctx.translate(-40, -230); ctx.rotate(-0.25); rr(ctx, -14, -120, 28, 170, 14); fillStroke(ctx, '#E9B66A'); ctx.restore(); // baguette
    ctx.save(); ctx.translate(30, -230); for (let i = 0; i < 5; i++) { ell(ctx, -30 + i * 15, -20 - (i % 2) * 14, 30, 26); fillStroke(ctx, i % 2 ? '#5DBB63' : '#3E9E6A', 3.5); } ctx.restore(); // lettuce
    ctx.save(); ctx.translate(60, -240); ctx.rotate(0.3); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(0, -90); ctx.closePath(); fillStroke(ctx, '#F28C28', 3.5); ctx.restore(); // carrot
  } else { // lunch: a wrapped burrito and a soda
    ctx.save(); ctx.translate(-20, -210); ctx.rotate(-0.2); rr(ctx, -30, -70, 60, 110, 26); fillStroke(ctx, '#D9D2C3'); ctx.restore();
    ctx.save(); ctx.translate(40, -200); rr(ctx, -24, -70, 48, 90, 8); fillStroke(ctx, C.red); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-24, -40, 48, 14); ctx.restore();
  }
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-110, -210); ctx.lineTo(110, -210); ctx.lineTo(100, 0); ctx.lineTo(-100, 0); ctx.closePath(); }, '#C9A27E', { elev: 1 });
  ctx.strokeStyle = 'rgba(90,60,35,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -190); ctx.lineTo(110, -190); ctx.stroke();
  ctx.restore();
}

// ---------- sets (world coords, floor y = 0) ----------
function sky(ctx, top, bot, x0 = -3000, x1 = 3000, y0 = -3000, y1 = 200) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
function cityRow(ctx, y, cols, seed, h0 = 700, lit = 'rgba(255,240,200,0.9)', litP = 0.25) {
  for (let i = 0; i < 16; i++) { const x = -2600 + i * 360, h = h0 + K.hash(seed + i) * 700, col = cols[i % cols.length];
    ctx.fillStyle = col; ctx.fillRect(x, y - h, 330, h + 600); ctx.fillStyle = shade(col, -0.2); ctx.fillRect(x, y - h, 330, 24);
    for (let r = 0; r < h / 120 - 1; r++) for (let q = 0; q < 3; q++) { const v = K.hash(seed * 7 + i * 31 + r * 5 + q); ctx.fillStyle = v < litP ? lit : 'rgba(40,50,80,0.35)'; ctx.fillRect(x + 40 + q * 95, y - h + 70 + r * 120, 60, 70); } }
}
function tree(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#5A3A22'; ctx.fillRect(-16, -300, 32, 300); for (const [dx, dy, r] of [[0, -360, 120], [-90, -300, 90], [90, -300, 95], [0, -470, 90]]) { ell(ctx, dx, dy, r, r); fillStroke(ctx, '#3E9E6A', 5); } ctx.restore(); }

// noon street with the food truck (truck window at x 80..560, counter top y -330)
function streetNoon(ctx, c, t) {
  layer(ctx, c, 0.35, g => { sky(g, '#6FA8FF', '#CFE3FF'); cityRow(g, 120, ['#C7764A', '#D9A441', '#A44A3A', '#E8D9BF'], 3); });
  layer(ctx, c, 0.65, g => { g.fillStyle = '#C9C1B1'; g.fillRect(-3000, -80, 6000, 400); for (let i = 0; i < 6; i++) tree(g, -1500 + i * 620, -60, 1.1); });
  layer(ctx, c, 1, g => { g.fillStyle = '#D8D2C6'; g.fillRect(-3000, 0, 6000, 1400); g.strokeStyle = 'rgba(120,110,100,0.35)'; g.lineWidth = 4; for (let x = -3000; x < 3000; x += 240) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x - 120, 1400); g.stroke(); } });
}
function foodTruck(ctx, t, vendorP) {
  // body
  CL.cutout(ctx, () => rr(ctx, -260, -1000, 1100, 900, 40), '#F7F5F0', { elev: 1.2, tex: 0.3 });
  ctx.fillStyle = C.red; ctx.fillRect(-260, -300, 1100, 70); ctx.fillStyle = C.yellow; ctx.fillRect(-260, -230, 1100, 22);
  // window interior + vendor inside
  ctx.save(); rr(ctx, 60, -760, 520, 450, 18); ctx.clip(); ctx.fillStyle = '#5A3F30'; ctx.fillRect(60, -760, 520, 450);
  ctx.fillStyle = '#B9B9C0'; ctx.fillRect(80, -600, 480, 16); for (let i = 0; i < 4; i++) { ell(ctx, 130 + i * 110, -620, 34, 18); fillStroke(ctx, '#8E8E96', 3); }
  LT.glow(ctx, 320, -700, 300, 'rgba(255,214,140,1)', 0.35);
  if (vendorP) R.figure(ctx, 380, -60, 0.95, -1, VENDOR, { ...vendorP, noShadow: true });
  ctx.restore();
  rr(ctx, 60, -760, 520, 450, 18); ctx.lineWidth = R.px(ctx, 6); ctx.strokeStyle = INK; ctx.stroke();
  CL.cutout(ctx, () => rr(ctx, 40, -330, 560, 40, 8), '#B9B9C0', { elev: 1 }); // counter ledge
  // striped awning
  ctx.save(); ctx.beginPath(); ctx.moveTo(20, -800); ctx.lineTo(620, -800); ctx.lineTo(680, -690); ctx.lineTo(-40, -690); ctx.closePath(); ctx.clip();
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? C.yellow : '#FFFDF8'; ctx.fillRect(-60 + i * 64, -820, 64, 140); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(20, -800); ctx.lineTo(620, -800); ctx.lineTo(680, -690); ctx.lineTo(-40, -690); ctx.closePath(); ctx.lineWidth = R.px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
  // menu board on the side
  CL.cutout(ctx, () => rr(ctx, 640, -760, 170, 300, 14), '#232625', { elev: 0.8 });
  txt(ctx, 'LUNCH', 725, -700, 34, C.yellow); for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(247,245,240,0.6)'; ctx.fillRect(665, -660 + i * 46, 120, 12); }
  // wheels + shadow
  K.contact(ctx, 300, 0, 700, 60, 0.4);
  for (const x of [-60, 640]) { ell(ctx, x, -100, 100, 100); fillStroke(ctx, '#2B2B2B', 6); ell(ctx, x, -100, 44, 44); ctx.fillStyle = '#C9C1B1'; ctx.fill(); }
}

// gas station in late-afternoon light (pump centre x 300, nozzle hole on the car at x -60, y -430)
function gasStation(ctx, c, t) {
  layer(ctx, c, 0.3, g => { sky(g, '#F6A15A', '#FFE1A8'); ell(g, 900, -900, 160, 160); g.fillStyle = '#FFF1C8'; g.fill(); });
  layer(ctx, c, 0.55, g => { g.fillStyle = '#B57A5A'; for (let i = 0; i < 9; i++) { const h = 300 + K.hash(i + 4) * 500; g.fillRect(-2600 + i * 600, -h, 520, h + 400); } g.fillStyle = '#9A6248'; g.fillRect(-3000, -60, 6000, 300); });
  layer(ctx, c, 0.85, g => { // the canopy
    g.fillStyle = '#F7F5F0'; g.fillRect(-2200, -1650, 4400, 160); g.fillStyle = C.red; g.fillRect(-2200, -1520, 4400, 40);
    for (let i = 0; i < 7; i++) { g.fillStyle = '#FFF6D8'; g.fillRect(-1900 + i * 620, -1490, 200, 18); LT.glow(g, -1800 + i * 620, -1460, 260, 'rgba(255,240,200,1)', 0.25); }
    for (const x of [-900, 1100]) { g.fillStyle = '#D8D2C6'; g.fillRect(x - 40, -1480, 80, 1480); }
  });
  layer(ctx, c, 1, g => { g.fillStyle = '#8E8E96'; g.fillRect(-3000, 0, 6000, 1400); g.fillStyle = '#A6A6AE'; g.fillRect(-3000, 0, 6000, 30); g.fillStyle = C.yellow; for (let x = -3000; x < 3000; x += 300) g.fillRect(x, 380, 160, 18); });
}
function pump(ctx, t, amount) { // fuel pump, base at 0
  K.contact(ctx, 0, 0, 220, 40, 0.4);
  CL.cutout(ctx, () => rr(ctx, -130, -880, 260, 880, 26), C.red, { elev: 1.2 });
  ctx.fillStyle = shade(C.red, -0.2); ctx.fillRect(70, -870, 50, 860); ctx.fillStyle = C.yellow; ctx.fillRect(-130, -380, 260, 40);
  CL.cutout(ctx, () => rr(ctx, -100, -820, 200, 150, 14), '#171717', { elev: 0.3, tex: 0 });
  txt(ctx, amount, 0, -728, 56, '#7CFFB5'); txt(ctx, 'GALLONS', 0, -688, 18, '#8E8E96');
  CL.cutout(ctx, () => rr(ctx, -70, -620, 140, 160, 12), '#F7F5F0', { elev: 0.4 });
  for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#2FA37E', C.yellow, '#4D8DFF'][i]; rr(ctx, -54 + i * 40, -600, 30, 46, 6); ctx.fill(); }
}
function car(ctx, t, col = '#4D8DFF') { // compact car, side view facing left, base at 0
  K.contact(ctx, 0, 0, 760, 60, 0.45);
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(-720, -110); ctx.quadraticCurveTo(-730, -330, -560, -360); ctx.lineTo(-330, -380); ctx.quadraticCurveTo(-200, -640, 120, -650); ctx.lineTo(380, -640); ctx.quadraticCurveTo(560, -600, 640, -380); ctx.quadraticCurveTo(740, -360, 740, -110); ctx.closePath(); }, col, { elev: 1.4, tex: 0.3 });
  ctx.fillStyle = '#9EC0F2'; ctx.beginPath(); ctx.moveTo(-250, -400); ctx.quadraticCurveTo(-150, -600, 120, -605); ctx.lineTo(130, -400); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(170, -400); ctx.lineTo(170, -605); ctx.lineTo(360, -600); ctx.quadraticCurveTo(500, -560, 560, -400); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = shade(col, -0.35); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(150, -380); ctx.lineTo(150, -130); ctx.stroke();
  rr(ctx, 380, -470, 70, 60, 10); fillStroke(ctx, shade(col, -0.2), 4); // fuel door
  for (const x of [-480, 470]) { ell(ctx, x, -110, 110, 110); fillStroke(ctx, '#2B2B2B', 6); ell(ctx, x, -110, 52, 52); ctx.fillStyle = '#C9C1B1'; ctx.fill(); }
}

// supermarket checkout under cool light (conveyor top y -330, cashier at x 520)
function market(ctx, c, t) {
  layer(ctx, c, 0.5, g => { g.fillStyle = '#EEF2F7'; g.fillRect(-3000, -2600, 6000, 2800);
    for (let i = 0; i < 6; i++) { g.fillStyle = '#FFFFFF'; g.fillRect(-2600 + i * 900, -2200, 500, 30); LT.glow(g, -2350 + i * 900, -2180, 300, 'rgba(235,245,255,1)', 0.35); }
    for (let row = 0; row < 4; row++) { g.fillStyle = '#B9B9C0'; g.fillRect(-2800, -1500 + row * 300, 5600, 22);
      for (let i = 0; i < 46; i++) { const x = -2780 + i * 122, h = 120 + K.hash(row * 50 + i) * 120, col = ['#E63946', '#FFC857', '#4D8DFF', '#2FA37E', '#F28C28', '#FFFDF8'][(i + row * 2) % 6];
        g.fillStyle = col; g.fillRect(x, -1500 + row * 300 - h, 100, h); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 10, -1500 + row * 300 - h + 14, 80, 16); } }
    g.fillStyle = '#2E3A59'; rr(g, -300, -2050, 600, 130, 16); g.fill(); txt(g, 'AISLE 4', 0, -1965, 64, '#FFFDF8');
  });
  layer(ctx, c, 0.85, g => { g.fillStyle = '#DCD8D0'; g.fillRect(-3000, -40, 6000, 1400); g.strokeStyle = 'rgba(150,150,160,0.4)'; g.lineWidth = 4; for (let x = -3000; x < 3000; x += 220) { g.beginPath(); g.moveTo(x, -40); g.lineTo(x - 200, 1400); g.stroke(); } });
}
function checkout(ctx, t, belt = 0) { // the counter + conveyor, drawn in front of the cashier
  CL.cutout(ctx, () => rr(ctx, -400, -330, 1600, 330, 16), '#4D8DFF', { elev: 1, tex: 0.25 });
  ctx.fillStyle = shade('#4D8DFF', -0.2); ctx.fillRect(-400, -60, 1600, 60);
  CL.cutout(ctx, () => rr(ctx, -380, -372, 1200, 46, 20), '#2B2B2B', { elev: 0.5, tex: 0 });
  ctx.fillStyle = '#4A4A50'; for (let x = -370 - (belt % 60); x < 810; x += 60) ctx.fillRect(Math.max(-370, x), -364, 24, 30);
  // items on the belt
  [[-260, '#F28C28', 90], [-120, '#FFFDF8', 120], [20, C.red, 80]].forEach(([x, col, h]) => { ctx.save(); ctx.translate(x - (belt * 0.6 % 400), -372); CL.cutout(ctx, () => rr(ctx, -40, -h, 80, h, 8), col, { elev: 0.8 }); ctx.restore(); });
}

// living room at dusk (sofa seat y -250, lamp at x -620)
function livingRoom(ctx, c, t, o = {}) {
  layer(ctx, c, 0.4, g => { sky(g, '#3B3F78', '#F2A65A', -3000, 3000, -2600, -400); cityRow(g, -400, ['#2B2E55', '#34386A', '#262947'], 9, 500, 'rgba(255,214,140,0.95)', 0.35); });
  layer(ctx, c, 0.8, g => {
    // wall with the window cut out
    g.save(); g.beginPath(); g.rect(-3000, -2800, 6000, 3000); rr(g, -150, -1700, 900, 1050, 20); g.fillStyle = '#E8CFA8'; g.fill('evenodd'); g.restore();
    g.fillStyle = '#2B2B2B'; g.fillRect(-170, -1720, 940, 24); g.fillRect(-170, -670, 940, 30); g.fillRect(290, -1700, 20, 1040);
    g.fillStyle = C.red; for (const x of [-260, 760]) { g.beginPath(); g.moveTo(x, -1760); g.lineTo(x + 110, -1760); g.quadraticCurveTo(x + 150, -1200, x + 90, -600); g.lineTo(x + 10, -600); g.quadraticCurveTo(x - 40, -1200, x, -1760); g.fill(); }
    rr(g, -1250, -1500, 360, 280, 8); fillStroke(g, '#2B2B2B', 6); g.fillStyle = C.yellow; g.fillRect(-1225, -1475, 310, 230); ell(g, -1070, -1360, 70, 70); g.fillStyle = '#4D8DFF'; g.fill();
    g.fillStyle = '#B98457'; g.fillRect(-3000, 0, 6000, 1600); g.fillStyle = 'rgba(80,45,25,0.25)'; g.fillRect(-3000, 0, 6000, 40);
  });
  layer(ctx, c, 1, g => {
    // floor lamp + warm pool
    LT.glow(g, -620, -1180, 900, 'rgba(255,190,110,1)', 0.45); LT.glow(g, -500, 0, 700, 'rgba(255,200,120,1)', 0.25);
    g.strokeStyle = INK; g.lineWidth = R.px(g, 8); g.beginPath(); g.moveTo(-620, -1180); g.lineTo(-620, 0); g.stroke();
    g.beginPath(); g.moveTo(-720, -1180); g.lineTo(-520, -1180); g.lineTo(-570, -1330); g.lineTo(-670, -1330); g.closePath(); fillStroke(g, '#FFE6B0');
    // sofa
    CL.cutout(g, () => rr(g, -480, -620, 1300, 420, 60), '#5B6C8F', { elev: 1.2, tex: 0.35 });
    CL.cutout(g, () => rr(g, -520, -300, 1380, 300, 50), '#6B7DA3', { elev: 1.2, tex: 0.35 });
    for (const x of [-520, 760]) CL.cutout(g, () => rr(g, x, -470, 100, 470, 40), '#5B6C8F', { elev: 1, tex: 0.35 });
    if (o.bags) { g.save(); g.translate(1050, 0); paperBag(g, 1.2); g.restore(); }
  });
}
function coffeeTable(ctx) { CL.cutout(ctx, () => rr(ctx, -700, -60, 1400, 60, 20), '#8B5A3C', { elev: 1 }); for (const x of [-600, 560]) { ctx.fillStyle = '#6E4630'; ctx.fillRect(x, 0, 40, 300); } }

// ---------- the paper bank machine (hidden world) ----------
function kraft(ctx, seed = 1) { // kraft background with mottling + fibres, screen space
  ctx.fillStyle = '#F2E9D6'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 18; i++) { const x = K.hash(i + seed) * W, y = K.hash(i + 7 + seed) * H, g = ctx.createRadialGradient(x, y, 0, x, y, 200 + K.hash(i + 3) * 380);
    g.addColorStop(0, `rgba(${K.hash(i + 1) > 0.5 ? '214,190,150' : '255,252,240'},0.14)`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.7; ctx.fillStyle = CL.texPattern(ctx); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function belt(ctx, x0, x1, y, t, moving = 1) {
  CL.cutout(ctx, () => rr(ctx, x0, y, x1 - x0, 64, 32), '#3A3A3A', { elev: 1.2, tex: 0 });
  ctx.save(); ctx.beginPath(); rr(ctx, x0 + 20, y + 6, x1 - x0 - 40, 50, 25); ctx.clip(); ctx.fillStyle = '#5A5A60'; const mv = t * 260 * moving; for (let x = x0 - (mv % 80); x < x1; x += 80) ctx.fillRect(x, y + 10, 30, 44); ctx.restore();
  for (let x = x0 + 60; x <= x1 - 60; x += 170) { ctx.save(); ctx.translate(x, y + 104); CL.cutout(ctx, () => ell(ctx, 0, 0, 34, 34), '#8E8E96', { elev: 0.6, tex: 0 }); ctx.rotate(t * 6 * moving); ctx.fillStyle = INK; ctx.fillRect(-3, -26, 6, 52); ctx.restore(); }
}
// the cardboard robot arm: base at (bx, by), claw at target (tx, ty) via 2-bone IK, claw open 0..1
function arm(ctx, bx, by, tx, ty, open = 0.3, col = '#C9A27E') {
  const [e, w] = R.ik([bx, by], [tx, ty], 560, 520, (a, b) => (a[1] < b[1] ? a : b));
  CL.cutout(ctx, () => rr(ctx, bx - 120, by - 40, 240, 120, 20), '#8B5A3C', { elev: 1.5 });
  const seg2 = (a, b, r) => CL.cutout(ctx, () => { ctx.beginPath(); const an = Math.atan2(b[1] - a[1], b[0] - a[0]), n = an + Math.PI / 2;
    ctx.moveTo(a[0] + Math.cos(n) * r, a[1] + Math.sin(n) * r); ctx.lineTo(b[0] + Math.cos(n) * r * 0.8, b[1] + Math.sin(n) * r * 0.8); ctx.lineTo(b[0] - Math.cos(n) * r * 0.8, b[1] - Math.sin(n) * r * 0.8); ctx.lineTo(a[0] - Math.cos(n) * r, a[1] - Math.sin(n) * r); ctx.closePath(); }, col, { elev: 1.6 });
  seg2([bx, by], e, 50); seg2(e, w, 40);
  for (const p of [[bx, by], e]) { CL.cutout(ctx, () => ell(ctx, p[0], p[1], 46, 46), C.yellow, { elev: 1.2 }); ell(ctx, p[0], p[1], 12, 12); ctx.fillStyle = INK; ctx.fill(); }
  // claw
  ctx.save(); ctx.translate(w[0], w[1]); const a = Math.atan2(w[1] - e[1], w[0] - e[0]); ctx.rotate(a - Math.PI / 2);
  for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (0.15 + open * 0.5)); CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(s * 10, 0); ctx.lineTo(s * 40, 80); ctx.lineTo(s * 10, 150); ctx.lineTo(s * 0, 140); ctx.lineTo(s * 18, 80); ctx.closePath(); }, '#8E8E96', { elev: 1.4, tex: 0 }); ctx.restore(); }
  CL.cutout(ctx, () => ell(ctx, 0, 0, 40, 40), '#3A3A3A', { elev: 1, tex: 0 });
  ctx.restore();
  return w;
}
// balance meter: a tall paper tube; value -> green (>= 0) or red (< 0) fill around a zero line; big counter on top
function meter(ctx, value, t, o = {}) {
  const h = 900, zeroY = 200, k = 7; // 7 px per dollar
  CL.cutout(ctx, () => rr(ctx, -150, -h + zeroY - 60, 300, h + 320, 40), '#F7F5F0', { elev: 1.6 });
  ctx.save(); rr(ctx, -120, -h + zeroY - 30, 240, h + 260, 30); ctx.clip(); ctx.fillStyle = '#EDE3D0'; ctx.fillRect(-130, -h + zeroY - 40, 260, h + 300);
  if (value >= 0) { const y = zeroY - value * k; ctx.fillStyle = '#5DBB63'; ctx.fillRect(-130, y, 260, zeroY - y); ctx.fillStyle = '#7FD08A'; ctx.fillRect(-130, y, 260, 16); }
  else { const y = zeroY - value * k; ctx.fillStyle = C.red; ctx.fillRect(-130, zeroY, 260, y - zeroY); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-130, y - 14, 260, 14); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = R.px(ctx, 6); ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(-170, zeroY); ctx.lineTo(170, zeroY); ctx.stroke(); ctx.setLineDash([]);
  txt(ctx, '$0', -200, zeroY + 14, 40, INK, 'right');
  CL.cutout(ctx, () => rr(ctx, -210, -h + zeroY - 230, 420, 150, 24), '#171717', { elev: 1, tex: 0 });
  const v = Math.round(value), s = (v < 0 ? '−$' : '$') + Math.abs(v);
  txt(ctx, s, 0, -h + zeroY - 125, 100, v < 0 ? '#FF6B75' : '#7CFFB5');
  txt(ctx, 'BALANCE', 0, -h + zeroY - 252, 40, INK);
}

module.exports = { W, H, layer, txt, fitTxt, MAYA, VENDOR, CASHIER, BARISTA, priceTag, feeTag, receipt, phone, bankApp, paperBag, sky, tree,
  streetNoon, foodTruck, gasStation, pump, car, market, checkout, livingRoom, coffeeTable, kraft, belt, arm, meter };
