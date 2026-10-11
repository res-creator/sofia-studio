// Episode 3 backgrounds (preview): airport check-in hall. World 0..2880 x 0..1920, floor line y=1420 (same as ep2/bg2.js).
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { OL, paint, line, roundRect } = require('../lib/draw');
const F = require('../lib/fonts');

const RES = 1.5, WW = 2880, HH = 1920, FLOOR = 1420;
function mk(fn) { const c = createCanvas(WW * RES, HH * RES), x = c.getContext('2d'); x.scale(RES, RES); fn(x); return c; }

function plane(x, X, Y, s) {
  x.save(); x.translate(X, Y); x.scale(s, s);
  paint(x, c => { c.moveTo(-260, 0); c.bezierCurveTo(-260, -40, -200, -50, -120, -50); c.lineTo(200, -50); c.bezierCurveTo(260, -50, 300, -20, 300, 0); c.bezierCurveTo(300, 20, 260, 30, 200, 30); c.lineTo(-200, 30); c.bezierCurveTo(-240, 30, -260, 20, -260, 0); c.closePath(); }, '#FFFFFF', { shade: '#D8DEE8', sx: 0, sy: 10, lw: 5 });
  paint(x, c => { c.moveTo(-200, -46); c.lineTo(-250, -150); c.lineTo(-190, -150); c.lineTo(-120, -48); c.closePath(); }, '#FF7A2F', { lw: 5 });
  paint(x, c => { c.moveTo(-20, 10); c.lineTo(-120, 90); c.lineTo(-60, 90); c.lineTo(60, 14); c.closePath(); }, '#E6EBF2', { lw: 5 });
  x.fillStyle = '#5D7FA8'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(-120 + i * 34, -18, 9, 11, 0, 0, 7); x.fill(); }
  paint(x, c => c.ellipse(255, -16, 22, 14, 0.3, 0, 7), '#5D7FA8', { lw: 4 });
  line(x, [[-240, 6], [290, 6]], 6, '#2E6FD8');
  x.restore();
}

const checkin = () => mk(x => {
  // wall
  x.fillStyle = '#E3ECF5'; x.fillRect(0, 0, WW, HH);
  // big windows, top band
  paint(x, c => c.rect(0, 150, WW, 620), '#9FD3F5', { lw: 0 });
  const g = x.createLinearGradient(0, 150, 0, 770); g.addColorStop(0, '#7EC4F2'); g.addColorStop(1, '#D4EEFF'); x.fillStyle = g; x.fillRect(0, 150, WW, 620);
  x.fillStyle = '#fff'; x.globalAlpha = 0.85; for (const [cx, cy, r] of [[300, 300, 70], [380, 290, 50], [1500, 260, 80], [1590, 270, 55], [2500, 330, 60]]) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } x.globalAlpha = 1;
  x.fillStyle = '#B8C2CC'; x.fillRect(0, 690, WW, 80); // tarmac
  plane(x, 2150, 640, 0.9);
  for (let i = 0; i <= 9; i++) line(x, [[i * 320, 150], [i * 320, 770]], 16, '#FFFFFF');
  line(x, [[0, 150], [WW, 150]], 16, '#FFFFFF'); line(x, [[0, 770], [WW, 770]], 22, '#FFFFFF');
  x.save(); x.strokeStyle = OL; x.lineWidth = 4; x.strokeRect(0, 142, WW, 636); x.restore();
  // lower wall panel
  x.fillStyle = '#C9D7E6'; x.fillRect(0, 780, WW, FLOOR - 780); line(x, [[0, 780], [WW, 780]], 4, 'rgba(58,34,29,0.4)');
  // DEPARTURES board
  paint(x, c => roundRect(c, 240, 820, 760, 360, 18), '#1E2433', { lw: 7 });
  x.fillStyle = '#FFD23F'; x.font = `800 46px ${F.EN}`; x.textAlign = 'left'; x.fillText('DEPARTURES', 280, 880);
  const rows = [['207', 'MADRID', '10:45', 'ON TIME'], ['318', 'PARIS', '11:20', 'ON TIME'], ['042', 'LONDON', '11:50', 'BOARDING'], ['555', 'ROME', '12:15', 'ON TIME']];
  x.font = `700 36px ${F.EN}`;
  rows.forEach((r, i) => { const y = 950 + i * 58; x.fillStyle = i === 0 ? '#FFFFFF' : '#C9D1E0'; x.fillText(r[0], 280, y); x.fillText(r[1], 380, y); x.fillText(r[2], 640, y); x.fillStyle = r[3] === 'BOARDING' ? '#FF8FA3' : '#6FE39B'; x.fillText(r[3], 780, y); });
  // CHECK-IN sign over desk
  paint(x, c => roundRect(c, 2140, 830, 420, 100, 18), '#2E6FD8', { lw: 7 });
  x.fillStyle = '#fff'; x.font = `800 56px ${F.EN}`; x.textAlign = 'center'; x.fillText('CHECK-IN  3', 2350, 900);
  paint(x, c => roundRect(c, 2280, 930, 16, 30, 4), '#B8BEC8', { lw: 4 });
  // floor
  x.fillStyle = '#D7DCE3'; x.fillRect(0, FLOOR, WW, HH - FLOOR);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 20; c++) if ((r + c) % 2) { x.fillStyle = '#CBD1DA'; x.fillRect(c * 150, FLOOR + r * 90, 150, 90); }
  const gf = x.createLinearGradient(0, FLOOR, 0, FLOOR + 140); gf.addColorStop(0, 'rgba(0,0,0,0.15)'); gf.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gf; x.fillRect(0, FLOOR, WW, 140);
  x.fillStyle = OL; x.fillRect(0, FLOOR - 2, WW, 4);
  // queue posts at left
  for (const px of [120, 420]) { paint(x, c => roundRect(c, px - 10, 1270, 20, 260, 8), '#B8BEC8', { lw: 5 }); paint(x, c => c.ellipse(px, 1532, 46, 12, 0, 0, 7), '#8E96A3', { lw: 5 }); }
  paint(x, c => { c.moveTo(130, 1290); c.quadraticCurveTo(270, 1320, 410, 1290); c.lineTo(410, 1310); c.quadraticCurveTo(270, 1340, 130, 1310); c.closePath(); }, '#E5484D', { lw: 4 });
});

// desk = foreground layer (drawn over Anna). Counter top y 1200, x 1380..2120. Bag scale at left of the desk.
function desk(x, kg = null) {
  paint(x, c => roundRect(c, 1380, 1190, 740, 40, 10), '#F4F6F9', { shade: '#D5DBE3', sx: 0, sy: 8, lw: 6 });
  paint(x, c => c.rect(1400, 1226, 700, 300), '#2E6FD8', { shade: '#2459B2', sx: 14, sy: 0, lw: 6 });
  x.fillStyle = '#fff'; x.font = `800 54px ${F.EN}`; x.textAlign = 'center'; x.fillText('FLY  EASY', 1750, 1360);
  // wing logo
  paint(x, c => { c.moveTo(1640, 1420); c.quadraticCurveTo(1750, 1380, 1860, 1420); c.quadraticCurveTo(1750, 1405, 1640, 1420); c.closePath(); }, '#FFD23F', { lw: 3 });
  // bag scale (belt) + display post
  paint(x, c => roundRect(c, 1080, 1450, 320, 70, 12), '#8E96A3', { shade: '#6E7684', sx: 0, sy: 8, lw: 6 });
  for (let i = 0; i < 6; i++) line(x, [[1100 + i * 52, 1462], [1100 + i * 52, 1508]], 4, '#6E7684');
  paint(x, c => roundRect(c, 1330, 1150, 40, 300, 8), '#B8BEC8', { lw: 5 });
  paint(x, c => roundRect(c, 1250, 1090, 200, 90, 14), '#1E2433', { lw: 6 });
  x.fillStyle = kg && kg > 23 ? '#FF5A5A' : '#6FE39B'; x.font = `800 50px ${F.EN}`; x.textAlign = 'center';
  x.fillText(kg == null ? '0.0 KG' : kg.toFixed(1) + ' KG', 1350, 1152);
}



// ------------------------------------------------------------------ shared helpers
function sky(x, y0, y1, a = '#7EC4F2', b = '#D4EEFF') { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, y0, WW, y1 - y0); }
function cloud(x, cx, cy, r) { x.fillStyle = '#fff'; x.globalAlpha = 0.9; for (const [dx, dy, k] of [[0, 0, 1], [r * 0.9, r * 0.1, 0.75], [-r * 0.9, r * 0.15, 0.7], [r * 0.4, -r * 0.4, 0.7]]) { x.beginPath(); x.arc(cx + dx, cy + dy, r * k, 0, 7); x.fill(); } x.globalAlpha = 1; }
function tiles(x, a, b, step = 150) { x.fillStyle = a; x.fillRect(0, FLOOR, WW, HH - FLOOR); for (let r = 0; r < 7; r++) for (let c = 0; c < WW / step + 1; c++) if ((r + c) % 2) { x.fillStyle = b; x.fillRect(c * step, FLOOR + r * 90, step, 90); }
  const gf = x.createLinearGradient(0, FLOOR, 0, FLOOR + 140); gf.addColorStop(0, 'rgba(0,0,0,0.15)'); gf.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gf; x.fillRect(0, FLOOR, WW, 140); x.fillStyle = OL; x.fillRect(0, FLOOR - 2, WW, 4); }
function pill(x, X, Y, w, h, fill, text, size = 44, col = '#fff') { paint(x, c => roundRect(c, X, Y, w, h, 16), fill, { lw: 7 }); x.fillStyle = col; x.font = `800 ${size}px ${F.EN}`; x.textAlign = 'center'; x.fillText(text, X + w / 2, Y + h / 2 + size * 0.35); }
function palm(x, X, Y, s = 1) { x.save(); x.translate(X, Y); x.scale(s, s); paint(x, c => { c.moveTo(-18, 0); c.quadraticCurveTo(-4, -160, 14, -300); c.lineTo(34, -300); c.quadraticCurveTo(24, -150, 22, 0); c.closePath(); }, '#9C6B3F', { lw: 6 });
  for (const [a, l] of [[-2.7, 190], [-2.2, 210], [-1.6, 180], [-0.9, 210], [-0.4, 190], [0.1, 160]]) { x.save(); x.translate(24, -300); x.rotate(a); paint(x, c => { c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -50, l, 12); c.quadraticCurveTo(l * 0.5, 4, 0, 0); c.closePath(); }, '#3DAA6E', { shade: '#2C8556', sx: 0, sy: 6, lw: 5 }); x.restore(); } x.restore(); }
function seatBlock(x, X, Y, w, col = '#2E6FD8', sh = '#2459B2') { // airport bench seen from the front: backs + seats
  paint(x, c => roundRect(c, X, Y - 150, w, 150, 22), col, { shade: sh, sx: 0, sy: -14, lw: 7 });
  for (let i = 1; i < Math.round(w / 170); i++) line(x, [[X + i * 170, Y - 140], [X + i * 170, Y - 10]], 5, 'rgba(58,34,29,0.5)'); }

// ------------------------------------------------------------------ SECURITY
const security = () => mk(x => {
  x.fillStyle = '#E4E9F0'; x.fillRect(0, 0, WW, HH);
  paint(x, c => c.rect(0, 160, WW, 560), '#9FD3F5', { lw: 0 }); sky(x, 160, 720); cloud(x, 500, 330, 70); cloud(x, 2400, 300, 80);
  x.fillStyle = '#B8C2CC'; x.fillRect(0, 650, WW, 70);
  for (let i = 0; i <= 9; i++) line(x, [[i * 320, 160], [i * 320, 720]], 16, '#fff'); line(x, [[0, 160], [WW, 160]], 16, '#fff'); line(x, [[0, 720], [WW, 720]], 22, '#fff');
  x.fillStyle = '#C3CEDB'; x.fillRect(0, 730, WW, FLOOR - 730); line(x, [[0, 730], [WW, 730]], 4, 'rgba(58,34,29,0.4)');
  pill(x, 700, 800, 940, 150, '#5E6676', 'SECURITY', 96, '#FFD23F');
  pill(x, 200, 800, 440, 100, '#E5484D', 'NO LIQUIDS', 48);
  tiles(x, '#D3D8DF', '#C6CCD6');
  // conveyor belt + x-ray tunnel (left)
  paint(x, c => roundRect(c, 120, 1270, 1000, 120, 14), '#4A505C', { shade: '#353A44', sx: 0, sy: -12, lw: 7 });
  for (let i = 0; i < 20; i++) line(x, [[150 + i * 48, 1282], [150 + i * 48, 1330]], 4, '#2C3038');
  for (const lx of [170, 1070]) line(x, [[lx, 1390], [lx, 1420]], 14, OL);
  paint(x, c => roundRect(c, 600, 1030, 420, 270, 18), '#8E96A3', { shade: '#6E7684', sx: 10, sy: 0, lw: 8 });
  paint(x, c => roundRect(c, 650, 1110, 320, 190, 12), '#1E2433', { lw: 7 });
  x.fillStyle = '#6FE39B'; x.font = `800 36px ${F.EN}`; x.textAlign = 'center'; x.fillText('X-RAY', 810, 1085);
  for (const cx of [660, 960]) { paint(x, c => c.rect(cx - 8, 1120, 16, 170), '#3A3F4A', { lw: 3 }); }
  // trays on belt
  for (const tx of [210, 400]) paint(x, c => roundRect(c, tx, 1236, 160, 36, 8), '#7A8494', { shade: '#5E6676', sx: 0, sy: -6, lw: 5 });
  // metal detector arch (frame behind the characters; the lamp is an overlay)
  paint(x, c => roundRect(c, 1700, 760, 60, 660, 12), '#F4F6F9', { shade: '#D5DBE3', sx: 8, sy: 0, lw: 7 });
  paint(x, c => roundRect(c, 2060, 760, 60, 660, 12), '#F4F6F9', { shade: '#D5DBE3', sx: 8, sy: 0, lw: 7 });
  paint(x, c => roundRect(c, 1690, 700, 440, 90, 18), '#F4F6F9', { shade: '#D5DBE3', sx: 0, sy: -10, lw: 7 });
  paint(x, c => roundRect(c, 1730, 1090, 8, 80, 3), '#2E6FD8', { lw: 3 });
  // officer's stool + rope posts
  for (const px of [2300, 2560]) { paint(x, c => roundRect(c, px - 10, 1270, 20, 260, 8), '#B8BEC8', { lw: 5 }); paint(x, c => c.ellipse(px, 1532, 46, 12, 0, 0, 7), '#8E96A3', { lw: 5 }); }
  paint(x, c => { c.moveTo(2310, 1290); c.quadraticCurveTo(2430, 1320, 2550, 1290); c.lineTo(2550, 1310); c.quadraticCurveTo(2430, 1340, 2310, 1310); c.closePath(); }, '#E5484D', { lw: 4 });
});
function lamp(x, on, t) { // overlay on top of the arch (x 1850..1970, y 690)
  const lit = on && (Math.floor(t * 6) % 2 === 0);
  if (lit) { x.save(); x.globalAlpha = 0.35; const g = x.createRadialGradient(1910, 690, 10, 1910, 690, 260); g.addColorStop(0, '#FF3B3B'); g.addColorStop(1, 'rgba(255,59,59,0)'); x.fillStyle = g; x.fillRect(1650, 450, 520, 480); x.restore(); }
  paint(x, c => c.arc(1910, 696, 38, Math.PI, 0), lit ? '#FF3B3B' : '#7B1E1E', { lw: 6 });
  paint(x, c => roundRect(c, 1866, 692, 88, 20, 6), '#8E96A3', { lw: 5 });
}

// ------------------------------------------------------------------ CORRIDOR (+ toilet door)
const corridor = () => mk(x => {
  x.fillStyle = '#F2E9DA'; x.fillRect(0, 0, WW, HH);
  x.fillStyle = '#E3D6C0'; x.fillRect(0, 0, WW, 260); x.fillStyle = '#D6C7AE'; x.fillRect(0, 250, WW, 14);
  for (let i = 0; i < 6; i++) { paint(x, c => roundRect(c, 200 + i * 500, 120, 300, 40, 14), '#FFF8D8', { lw: 5 }); }
  x.fillStyle = '#E8DBC6'; x.fillRect(0, 264, WW, FLOOR - 264);
  for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? '#E0D1B8' : '#EADDC8'; x.fillRect(i * 440 - 60, 264, 300, FLOOR - 264); }
  x.fillStyle = '#8FB3C9'; x.fillRect(0, 1150, WW, FLOOR - 1150); line(x, [[0, 1150], [WW, 1150]], 6, 'rgba(58,34,29,0.5)');
  tiles(x, '#C9B79B', '#BCA987');
  // hanging signs
  const sign = (X, Y, w, txt, col) => { line(x, [[X + 40, 0], [X + 40, Y]], 8, OL); line(x, [[X + w - 40, 0], [X + w - 40, Y]], 8, OL); pill(x, X, Y, w, 140, col, txt, 60); };
  const arrow = (cx, cy, dir) => { line(x, [[cx - 40 * dir, cy], [cx + 40 * dir, cy]], 10, '#fff'); line(x, [[cx + 40 * dir, cy], [cx + 16 * dir, cy - 22]], 10, '#fff'); line(x, [[cx + 40 * dir, cy], [cx + 16 * dir, cy + 22]], 10, '#fff'); };
  sign(240, 380, 700, 'Gates 1-10', '#2E6FD8'); arrow(820, 450, -1); sign(1100, 380, 700, 'Gates 11-20', '#2E6FD8'); arrow(1680, 450, 1);
  // toilet door at the right
  paint(x, c => roundRect(c, 2060, 700, 380, 720, 12), '#8A5A3C', { lw: 8 });
  paint(x, c => c.rect(2090, 735, 320, 685), '#B98A63', { shade: '#9C7350', sx: 10, sy: 0, lw: 6 });
  paint(x, c => c.arc(2250, 560, 80, 0, 7), '#2E6FD8', { lw: 8 }); x.fillStyle = '#fff'; x.font = `800 72px ${F.EN}`; x.textAlign = 'center'; x.fillText('WC', 2250, 586);
  paint(x, c => c.arc(2370, 1090, 14, 0, 7), '#F2C744', { lw: 4 });
  // stick figures on the door
  paint(x, c => c.arc(2200, 860, 22, 0, 7), '#fff', { lw: 5 }); paint(x, c => roundRect(c, 2174, 888, 52, 90, 12), '#fff', { lw: 5 });
  paint(x, c => c.arc(2310, 860, 22, 0, 7), '#fff', { lw: 5 }); paint(x, c => { c.moveTo(2310, 888); c.lineTo(2342, 990); c.lineTo(2278, 990); c.closePath(); }, '#fff', { lw: 5 });
  // bench and plant
  paint(x, c => roundRect(c, 700, 1290, 480, 40, 12), '#B98A63', { lw: 6 }); for (const bx of [740, 1140]) line(x, [[bx, 1330], [bx, 1420]], 12, OL);
  plantPot(x, 1560, 1420, 1.1);
});
function plantPot(x, X, Y, s = 1) { x.save(); x.translate(X, Y); x.scale(s, s); paint(x, c => { c.moveTo(-50, -110); c.lineTo(50, -110); c.lineTo(36, 0); c.lineTo(-36, 0); c.closePath(); }, '#C9693F', { lw: 6 });
  for (const [a, l] of [[-2.2, 150], [-1.7, 190], [-1.2, 170], [-0.8, 140]]) { x.save(); x.translate(0, -110); x.rotate(a); paint(x, c => { c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -40, l, 0); c.quadraticCurveTo(l * 0.5, 14, 0, 0); c.closePath(); }, '#3DAA6E', { lw: 5 }); x.restore(); } x.restore(); }

// ------------------------------------------------------------------ GATE LOUNGE
const lounge = () => mk(x => {
  x.fillStyle = '#E8EEF5'; x.fillRect(0, 0, WW, HH);
  sky(x, 150, 800, '#8FCBF4', '#DDF1FF'); cloud(x, 420, 330, 70); cloud(x, 1650, 280, 90); cloud(x, 2550, 380, 60);
  x.fillStyle = '#9AA5B1'; x.fillRect(0, 700, WW, 100); for (let i = 0; i < 12; i++) line(x, [[i * 260 + 40, 750], [i * 260 + 140, 750]], 8, '#fff');
  plane(x, 1450, 690, 1.15);
  for (let i = 0; i <= 9; i++) line(x, [[i * 320, 150], [i * 320, 800]], 16, '#fff'); line(x, [[0, 150], [WW, 150]], 16, '#fff'); line(x, [[0, 800], [WW, 800]], 22, '#fff');
  x.save(); x.strokeStyle = OL; x.lineWidth = 4; x.strokeRect(0, 142, WW, 666); x.restore();
  x.fillStyle = '#C9D7E6'; x.fillRect(0, 810, WW, FLOOR - 810); line(x, [[0, 810], [WW, 810]], 4, 'rgba(58,34,29,0.4)');
  tiles(x, '#B9C6D8', '#AEBBCE');
  // GATE 12 board is drawn dynamically in the scene (boardGate)
  for (const [sx, n] of [[120, 3], [1620, 5]]) seatBlock(x, sx, 1330, n * 170);
});
function boardGate(x, delayed, t) { // GATE 12 sign at x 1050..1850 y 840
  paint(x, c => roundRect(c, 1020, 830, 860, 250, 20), '#1E2433', { lw: 8 });
  x.fillStyle = '#FFD23F'; x.font = `800 110px ${F.EN}`; x.textAlign = 'left'; x.fillText('GATE 12', 1070, 950);
  x.font = `700 44px ${F.EN}`; x.fillStyle = '#C9D1E0'; x.fillText('MADRID  207', 1075, 1010);
  const blink = delayed && Math.floor(t * 2) % 2 === 0;
  x.font = `800 74px ${F.EN}`; x.fillStyle = delayed ? (blink ? '#FF5A5A' : '#FF9A9A') : '#6FE39B'; x.fillText(delayed ? 'DELAYED' : 'ON TIME', 1075, 1070 - 4);
  x.font = `700 40px ${F.EN}`; x.fillStyle = '#C9D1E0'; x.textAlign = 'right'; x.fillText(delayed ? '12:00' : '10:45', 1850, 1010);
}
function wallClock(x, X, Y, R, minutes) {
  paint(x, c => c.arc(X, Y, R, 0, 7), '#FFFFFF', { lw: 8 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(x, [[X + Math.sin(a) * R * 0.8, Y - Math.cos(a) * R * 0.8], [X + Math.sin(a) * R * 0.9, Y - Math.cos(a) * R * 0.9]], 4, OL); }
  const m = minutes, ha = (m / 720) * Math.PI * 2, ma = (m / 60) * Math.PI * 2;
  line(x, [[X, Y], [X + Math.sin(ha) * R * 0.5, Y - Math.cos(ha) * R * 0.5]], 9, OL); line(x, [[X, Y], [X + Math.sin(ma) * R * 0.75, Y - Math.cos(ma) * R * 0.75]], 6, OL);
}
function seatFront(x, X, w) { // front edge of a bench (covers legs of seated characters)
  paint(x, c => roundRect(c, X, 1330, w, 120, 20), '#2459B2', { shade: '#1D4A94', sx: 0, sy: -12, lw: 7 });
}

// ------------------------------------------------------------------ PLANE CABIN
const cabin = () => mk(x => {
  x.fillStyle = '#EEF0F4'; x.fillRect(0, 0, WW, HH);
  // ceiling + overhead bins
  x.fillStyle = '#DDE2EA'; x.fillRect(0, 0, WW, 330);
  paint(x, c => roundRect(c, 0, 250, WW, 190, 30), '#F7F8FB', { shade: '#DCE0E8', sx: 0, sy: -14, lw: 7 });
  for (let i = 1; i < 12; i++) line(x, [[i * 240, 260], [i * 240, 430]], 4, 'rgba(58,34,29,0.35)');
  // wall with oval windows
  x.fillStyle = '#E9E4DA'; x.fillRect(0, 440, WW, FLOOR - 440);
  const win = (cx, big) => { const w = big ? 330 : 180, h = big ? 440 : 250;
    paint(x, c => roundRect(c, cx - w / 2 - 26, 700 - 26 + (big ? -40 : 0), w + 52, h + 52, 140), '#FFFFFF', { shade: '#D5DBE3', sx: 0, sy: -10, lw: 8 });
    x.save(); x.beginPath(); roundRect(x, cx - w / 2, 700 + (big ? -40 : 0), w, h, 110); x.clip(); sky(x, 600, 1200, '#5FB3F0', '#CFEAFF'); cloud(x, cx - 60, 900, 60); cloud(x, cx + 90, 1000, 80); x.restore();
    x.save(); x.beginPath(); roundRect(x, cx - w / 2, 700 + (big ? -40 : 0), w, h, 110); x.lineWidth = 7; x.strokeStyle = OL; x.stroke(); x.restore(); };
  win(300, false); win(2540, false); win(2180, false); win(540, false);
  // wall panel stripe + floor/carpet
  x.fillStyle = '#2E6FD8'; x.fillRect(0, 1180, WW, 60); line(x, [[0, 1180], [WW, 1180]], 5, OL); line(x, [[0, 1240], [WW, 1240]], 5, OL);
  x.fillStyle = '#5F6E8C'; x.fillRect(0, FLOOR, WW, HH - FLOOR); x.fillStyle = '#6E7D9B'; for (let i = 0; i < 40; i++) x.fillRect(i * 80, FLOOR, 40, HH - FLOOR);
  x.fillStyle = OL; x.fillRect(0, FLOOR - 2, WW, 4);
  // the big window seat window (Gus's window), centre-left
  win(1000, true);
  // signs
  pill(x, 1500, 330, 260, 70, '#2E6FD8', 'ROW 14', 38);
  paint(x, c => c.arc(1900, 380, 26, 0, 7), '#6FE39B', { lw: 5 }); paint(x, c => c.arc(2000, 380, 26, 0, 7), '#FFD23F', { lw: 5 });
});
function windowSky(x, cx, t, big = true) { // dynamic window content overlay (Gary flies here): clip region of the big window
  x.save(); x.beginPath(); roundRect(x, cx - 165, 660, 330, 440, 110); x.clip();
  sky(x, 600, 1200, '#5FB3F0', '#CFEAFF');
  for (let i = 0; i < 4; i++) { const off = ((t * 220 + i * 260) % 900); cloud(x, cx + 400 - off, 820 + (i % 2) * 150, 50 + (i % 3) * 14); }
  return () => x.restore();
}

// ------------------------------------------------------------------ BAGGAGE CLAIM (Madrid)
const baggage = () => mk(x => {
  x.fillStyle = '#FBE9C9'; x.fillRect(0, 0, WW, HH);
  sky(x, 150, 800, '#79C7F2', '#E3F5FF'); x.fillStyle = '#F6D36B'; x.beginPath(); x.arc(2300, 330, 90, 0, 7); x.fill();
  x.fillStyle = '#E6B77A'; x.fillRect(0, 700, WW, 100); x.fillStyle = '#7FBF7A'; x.fillRect(0, 760, WW, 40);
  palm(x, 400, 790, 1.7); palm(x, 1100, 790, 1.4); palm(x, 2000, 790, 1.8); palm(x, 2650, 790, 1.5);
  for (let i = 0; i <= 9; i++) line(x, [[i * 320, 150], [i * 320, 800]], 16, '#fff'); line(x, [[0, 150], [WW, 150]], 16, '#fff'); line(x, [[0, 800], [WW, 800]], 22, '#fff');
  x.save(); x.strokeStyle = OL; x.lineWidth = 4; x.strokeRect(0, 142, WW, 666); x.restore();
  x.fillStyle = '#F2D9A8'; x.fillRect(0, 810, WW, FLOOR - 810); line(x, [[0, 810], [WW, 810]], 4, 'rgba(58,34,29,0.4)');
  pill(x, 760, 850, 1360, 160, '#E5484D', 'BIENVENIDOS A MADRID', 96, '#FFD23F');
  pill(x, 200, 880, 420, 100, '#2E6FD8', 'BAGGAGE  4', 48);
  tiles(x, '#E9C998', '#DDB982');
});
// carousel belt: back strip with moving slats (beltBack) + front rail (beltFront, drawn over the bags' wheels). Slats move LEFT at 300 px/s like the bags.
function beltBack(x, t) {
  paint(x, c => roundRect(c, 200, 1250, 2600, 170, 40), '#4A505C', { shade: '#353A44', sx: 0, sy: -14, lw: 8 });
  x.save(); x.beginPath(); roundRect(x, 220, 1262, 2560, 80, 30); x.clip();
  for (let i = 0; i < 40; i++) { const X = 220 + (((i * 70 - t * 300) % 2800) + 2800) % 2800; line(x, [[X, 1262], [X, 1342]], 5, '#2C3038'); } x.restore();
}
function beltFront(x) { paint(x, c => roundRect(c, 180, 1340, 2640, 90, 20), '#8E96A3', { shade: '#6E7684', sx: 0, sy: -10, lw: 7 }); }
module.exports = { checkin, desk, plane, security, lamp, corridor, lounge, boardGate, wallClock, seatFront, seatBlock, cabin, windowSky, baggage, beltBack, beltFront, palm, cloud, sky, pill, plantPot, RES, WW, HH, FLOOR };
