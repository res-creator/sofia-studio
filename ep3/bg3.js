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

module.exports = { checkin, desk, plane, RES, WW, HH, FLOOR };
