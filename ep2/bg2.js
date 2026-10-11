// Episode 2 backgrounds: clinic waiting room + exam room. World 0..2880 x 0..1920, floor line y=1420.
// Same cel style as lib/bg.js (outline #3a221d, flat fills + one shade). Rendered once, offscreen.
const { createCanvas } = require('@napi-rs/canvas');
const { OL, paint, line, roundRect } = require('../lib/draw');
const F = require('../lib/fonts');

const RES = 1.75, WW = 2880, HH = 1920, FLOOR = 1420;
function mk(fn) { const c = createCanvas(WW * RES, HH * RES), x = c.getContext('2d'); x.scale(RES, RES); fn(x); return c; }

function diamonds(x, base, dot, step = 60) {
  x.fillStyle = base; x.fillRect(0, 0, WW, HH); x.fillStyle = dot;
  for (let yy = 0; yy < HH; yy += step) for (let xx = 0; xx < WW + step; xx += step) {
    const o = ((yy / step) % 2) * step / 2; x.save(); x.translate(xx + o, yy); x.rotate(Math.PI / 4); x.fillRect(-4, -4, 8, 8); x.restore();
  }
}
function floor(x, a, b) {
  x.fillStyle = a; x.fillRect(0, FLOOR, WW, HH - FLOOR);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 30; c++) if ((r + c) % 2) { x.fillStyle = b; x.fillRect(c * 100, FLOOR + r * 80, 100, 80); }
  const g = x.createLinearGradient(0, FLOOR, 0, FLOOR + 140); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, FLOOR, WW, 140);
  x.fillStyle = OL; x.fillRect(0, FLOOR - 2, WW, 4);
}
function wainscot(x, col, edge) { x.fillStyle = col; x.fillRect(0, 1000, WW, FLOOR - 1000); x.fillStyle = edge; x.fillRect(0, 1000, WW, 10); line(x, [[0, 1000], [WW, 1000]], 3, 'rgba(58,34,29,0.35)'); }
function windowSun(x, wx, wy, ww, wh) {
  paint(x, c => roundRect(c, wx - 16, wy - 16, ww + 32, wh + 32, 18), '#FFFFFF', { lw: 6 });
  x.save(); x.beginPath(); roundRect(x, wx, wy, ww, wh, 8); x.clip();
  const g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#7EC8F5'); g.addColorStop(1, '#CDEBFF'); x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
  x.beginPath(); x.arc(wx + ww * 0.7, wy + wh * 0.3, 50, 0, 7); x.fillStyle = '#FFE680'; x.fill();
  x.fillStyle = '#fff'; x.globalAlpha = 0.85; x.beginPath(); x.ellipse(wx + 100, wy + 200, 60, 22, 0, 0, 7); x.fill(); x.globalAlpha = 1; x.restore();
  line(x, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 10, '#FFFFFF'); line(x, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 10, '#FFFFFF');
  x.save(); x.beginPath(); roundRect(x, wx, wy, ww, wh, 8); x.lineWidth = 5; x.strokeStyle = OL; x.stroke(); x.restore();
}
function plant(x, X, Y, s = 1) {
  x.save(); x.translate(X, Y); x.scale(s, s);
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.32; x.save(); x.rotate(a);
    paint(x, c => { c.moveTo(0, 0); c.quadraticCurveTo(26, -70, 0, -150 - (i % 2) * 40); c.quadraticCurveTo(-26, -70, 0, 0); c.closePath(); }, i % 2 ? '#5FAE57' : '#4C9547', { lw: 4 });
    x.restore();
  }
  paint(x, c => { c.moveTo(-60, 0); c.lineTo(60, 0); c.lineTo(48, 90); c.lineTo(-48, 90); c.closePath(); }, '#C98B5B', { shade: '#A86F44', sx: 8, sy: 0, lw: 5 });
  x.restore();
}
function clockFace(x, X, Y, R = 70) {
  paint(x, c => c.arc(X, Y, R, 0, 7), '#FFFFFF', { lw: 7 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(x, [[X + Math.sin(a) * R * 0.78, Y - Math.cos(a) * R * 0.78], [X + Math.sin(a) * R * 0.9, Y - Math.cos(a) * R * 0.9]], 4, OL); }
  line(x, [[X, Y], [X + R * 0.5, Y - R * 0.1]], 7, OL); line(x, [[X, Y], [X - R * 0.05, Y - R * 0.7]], 5, OL);
}
function poster(x, X, Y, w, h, title, col, draw) {
  paint(x, c => roundRect(c, X, Y, w, h, 10), '#FFFFFF', { lw: 5 });
  x.save(); x.beginPath(); roundRect(x, X, Y, w, 44, 10); x.clip(); x.fillStyle = col; x.fillRect(X, Y, w, 44); x.restore();
  x.font = '700 26px ' + F.EN; x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(title, X + w / 2, Y + 32);
  if (draw) draw(x, X + w / 2, Y + 44 + (h - 44) / 2);
}

// door frame only (the door leaf is animated in the scene). Opening: x 1980..2300, y 640..1420
const DOOR = { x: 1980, y: 640, w: 320, h: 780 };
function doorFrame(x, sign) {
  const { x: X, y: Y, w, h } = DOOR;
  paint(x, c => roundRect(c, X - 26, Y - 26, w + 52, h + 26, 8), '#E9E2D6', { lw: 6 });
  // hallway behind (seen when open)
  x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
  const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, '#FFF8E2'); g.addColorStop(1, '#F2E3C4'); x.fillStyle = g; x.fillRect(X, Y, w, h);
  x.fillStyle = '#E4D2AE'; x.fillRect(X, Y + h * 0.78, w, h * 0.22); x.restore();
  line(x, [[X, Y], [X, Y + h]], 5, OL); line(x, [[X + w, Y], [X + w, Y + h]], 5, OL); line(x, [[X, Y], [X + w, Y]], 5, OL);
  if (sign) { // nameplate above the door
    paint(x, c => roundRect(c, X + w / 2 - 150, Y - 120, 300, 70, 14), '#2E6FD8', { lw: 6 });
    x.font = '700 40px ' + F.EN; x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(sign, X + w / 2, Y - 71);
  }
}
// the door leaf: open 0 = closed, 1 = swung open (drawn foreshortened toward the room)
function doorLeaf(ctx, open, label) {
  const { x: X, y: Y, w, h } = DOOR;
  const ww = w * (1 - open * 0.82), skew = open * 60;
  paint(ctx, c => { c.moveTo(X, Y); c.lineTo(X + ww, Y - skew * 0.4); c.lineTo(X + ww, Y + h + skew * 0.2); c.lineTo(X, Y + h); c.closePath(); }, '#9FD0C8', { shade: '#7DB3AA', sx: 10, sy: 0, lw: 6 });
  if (open < 0.6) {
    const k = 1 - open / 0.6;
    ctx.save(); ctx.globalAlpha = k;
    // frosted glass panel
    paint(ctx, c => roundRect(c, X + ww * 0.18, Y + 90, ww * 0.64, 240, 12), '#E6F4F6', { lw: 5 });
    if (label) { ctx.font = '700 ' + Math.round(40 * (ww / w)) + 'px ' + F.EN; ctx.fillStyle = '#2E6FD8'; ctx.textAlign = 'center'; ctx.fillText(label, X + ww / 2, Y + 225); }
    ctx.restore();
  }
  paint(ctx, c => c.arc(X + ww * 0.86, Y + h * 0.55, 14, 0, 7), '#F2C14E', { lw: 4 });
}

const waiting = () => mk(x => {
  diamonds(x, '#E4F2EE', '#D3E8E2');
  wainscot(x, '#BFDCD4', '#A8CCC2');
  floor(x, '#E8DFD0', '#DCD1BE');
  x.fillStyle = '#EEF6F3'; x.fillRect(0, 0, WW, 110); line(x, [[0, 110], [WW, 110]], 6, OL);
  windowSun(x, 120, 380, 380, 440);
  plant(x, 420, 1330, 1.1);
  clockFace(x, 1180, 420);
  poster(x, 1380, 400, 240, 300, 'WASH HANDS', '#3DAA6E', (c, X, Y) => {
    paint(c, q => q.ellipse(X - 30, Y + 10, 34, 48, -0.3, 0, 7), '#FFDCC6', { lw: 4 }); paint(c, q => q.ellipse(X + 30, Y + 10, 34, 48, 0.3, 0, 7), '#FFDCC6', { lw: 4 });
    for (const [dx, dy] of [[-60, -60], [50, -70], [0, -90], [70, 40]]) paint(c, q => q.arc(X + dx, Y + dy, 14, 0, 7), '#BFE6FA', { lw: 3 });
  });
  poster(x, 820, 430, 210, 250, 'HEALTHY FOOD', '#FF9A2E', (c, X, Y) => {
    paint(c, q => q.arc(X - 30, Y, 40, 0, 7), '#E5484D', { lw: 4 }); line(c, [[X - 30, Y - 40], [X - 24, Y - 62]], 5, OL);
    paint(c, q => { q.moveTo(X + 30, Y - 50); q.lineTo(X + 60, Y + 50); q.lineTo(X + 10, Y + 50); q.closePath(); }, '#FF9A2E', { lw: 4 });
  });
  doorFrame(x, 'Dr. Max');
  // small magazine table between chairs and door
  paint(x, c => roundRect(c, 1460, 1260, 260, 26, 8), '#B07A50', { lw: 5 });
  line(x, [[1490, 1286], [1490, 1430]], 12, OL); line(x, [[1690, 1286], [1690, 1430]], 12, OL);
  [['#5BB8F0', -0.1], ['#FF8FA6', 0.12]].forEach(([col, r], i) => { x.save(); x.translate(1560 + i * 70, 1250); x.rotate(r); paint(x, c => roundRect(c, -60, -14, 120, 22, 4), col, { lw: 4 }); x.restore(); });
});

const exam = () => mk(x => {
  diamonds(x, '#F0F5F0', '#E6EDE8');
  x.fillStyle = '#D8E2DA'; x.fillRect(0, 1000, WW, 920); x.fillStyle = '#C5D0C8'; x.fillRect(0, 1000, WW, 8);
  floor(x, '#E5DDD0', '#D8CFC0');
  x.fillStyle = '#F5F8F5'; x.fillRect(0, 0, WW, 110); line(x, [[0, 110], [WW, 110]], 6, OL);
  // medical cabinet (left, behind Sofia)
  paint(x, c => roundRect(c, 60, 380, 280, 500, 14), '#FFFFFF', { lw: 6 });
  line(x, [[200, 390], [200, 870]], 4, '#D0D8D4');
  for (const sy of [520, 660]) paint(x, c => roundRect(c, 68, sy, 264, 8, 4), '#E8ECE8', { lw: 3 });
  for (const [bx, col, h] of [[100, '#5BB8F0', 80], [170, '#FF9EB1', 60], [240, '#8BD8A0', 70], [110, '#FFD54A', 65], [190, '#C8A0E0', 55], [270, '#FF9A2E', 50]]) {
    const sy = bx < 160 ? 440 : 600;
    paint(x, c => roundRect(c, bx - 20, sy - h, 40, h, 10), col, { lw: 4 }); paint(x, c => roundRect(c, bx - 24, sy - h - 8, 48, 14, 6), '#fff', { lw: 3 });
  }
  // eye chart
  paint(x, c => roundRect(c, 470, 380, 190, 270, 8), '#FFFFFF', { lw: 5 });
  x.fillStyle = OL; x.textAlign = 'center';
  [['E', 70, 460], ['F P', 44, 520], ['T O Z', 30, 568], ['L P E D', 22, 606], ['P E C F D', 16, 632]].forEach(([s, sz, yy]) => { x.font = '700 ' + sz + 'px ' + F.EN; x.fillText(s, 565, yy); });
  // diploma + red cross
  paint(x, c => roundRect(c, 1150, 400, 220, 170, 8), '#FFF8E0', { lw: 5 });
  paint(x, c => roundRect(c, 1150, 400, 220, 32, 8), '#C9A27E', { lw: 4 });
  x.fillStyle = '#7A5C42'; x.font = '700 17px ' + F.EN; x.fillText('MEDICAL DIPLOMA', 1260, 423);
  x.fillStyle = '#888'; x.font = '15px ' + F.EN; x.fillText('Dr. Max', 1260, 510);
  paint(x, c => roundRect(c, 1420, 430, 110, 110, 12), '#FFFFFF', { lw: 4 });
  x.fillStyle = '#E54848'; x.fillRect(1453, 452, 44, 66); x.fillRect(1442, 467, 66, 36);
  // window (far right, beyond the door)
  windowSun(x, 2420, 380, 330, 420);
  doorFrame(x, null);
  // stethoscope hook + coat hook near door
  line(x, [[1800, 700], [1800, 730]], 8, OL); paint(x, c => c.arc(1800, 744, 12, 0, 7), '#8C9098', { lw: 4 });
  // plant by the window
  plant(x, 2560, 1330, 1.0);
});

// street outside the clinic: clinic front at left, sidewalk, tree, shops. Sidewalk walking line ~ y 1500
const street = () => mk(x => {
  const g = x.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#7EC8F5'); g.addColorStop(1, '#D4EEFF'); x.fillStyle = g; x.fillRect(0, 0, WW, HH);
  x.beginPath(); x.arc(2450, 260, 110, 0, 7); x.fillStyle = '#FFE680'; x.fill();
  x.fillStyle = 'rgba(255,255,255,0.9)'; for (const [cx, cy, s] of [[1250, 230, 1], [1900, 380, 0.8], [600, 160, 0.7]]) { x.beginPath(); x.ellipse(cx, cy, 120 * s, 40 * s, 0, 0, 7); x.ellipse(cx + 70 * s, cy - 25 * s, 80 * s, 40 * s, 0, 0, 7); x.fill(); }
  // far houses
  [[1150, '#F4B6A0', 520], [1520, '#BFDCD4', 460], [2250, '#F7D58A', 560], [2620, '#C9B8E8', 480]].forEach(([X, col, h]) => {
    paint(x, c => roundRect(c, X - 170, 1260 - h, 340, h, 6), col, { shade: 'rgba(0,0,0,0.08)', sx: 14, sy: 0, lw: 6 });
    for (const [wx, wy] of [[-100, -h + 80], [40, -h + 80], [-100, -h + 230], [40, -h + 230]]) if (-h + 230 + 120 < -60 || wy < -h + 200) paint(x, c => roundRect(c, X + wx, 1260 + wy, 70, 90, 6), '#FFFFFF', { lw: 4 });
  });
  // clinic front (left)
  paint(x, c => roundRect(c, -40, 300, 980, 1000, 0), '#F4F1EA', { shade: '#E2DCCF', sx: 20, sy: 0, lw: 6 });
  paint(x, c => roundRect(c, 180, 360, 560, 120, 20), '#FFFFFF', { lw: 6 });
  x.fillStyle = '#E54848'; x.fillRect(222, 386, 26, 70); x.fillRect(200, 408, 70, 26);
  x.font = '800 74px ' + F.EN; x.fillStyle = '#2E6FD8'; x.textAlign = 'left'; x.fillText('CLINIC', 300, 448);
  windowSun(x, 90, 600, 220, 300);
  paint(x, c => roundRect(c, 470, 640, 300, 660, 8), '#9FD0C8', { shade: '#7DB3AA', sx: 10, sy: 0, lw: 6 });
  paint(x, c => roundRect(c, 520, 700, 200, 220, 10), '#E6F4F6', { lw: 5 }); paint(x, c => c.arc(735, 990, 14, 0, 7), '#F2C14E', { lw: 4 });
  paint(x, c => roundRect(c, 440, 1290, 360, 30, 6), '#D8D2C4', { lw: 5 });
  // sidewalk + curb + road
  x.fillStyle = '#E8E1D4'; x.fillRect(0, 1300, WW, 280);
  for (let X = 0; X < WW; X += 180) line(x, [[X, 1300], [X - 60, 1580]], 3, 'rgba(58,34,29,0.18)');
  line(x, [[0, 1300], [WW, 1300]], 6, OL);
  x.fillStyle = '#CFC6B6'; x.fillRect(0, 1580, WW, 40); line(x, [[0, 1580], [WW, 1580]], 6, OL);
  x.fillStyle = '#6E7480'; x.fillRect(0, 1620, WW, 300); for (let X = 40; X < WW; X += 260) { x.fillStyle = '#F5F5F5'; x.fillRect(X, 1760, 140, 16); }
  // tree
  paint(x, c => roundRect(c, 1765, 900, 70, 420, 20), '#9B6B45', { shade: '#7E5434', sx: 12, sy: 0, lw: 6 });
  for (const [dx, dy, r] of [[0, -40, 210], [-150, 60, 150], [150, 60, 150], [0, 120, 160]]) paint(x, c => c.arc(1800 + dx, 800 + dy, r, 0, 7), '#5FAE57', { shade: '#4C9547', sx: 18, sy: 10, lw: 6 });
  // bench
  paint(x, c => roundRect(c, 2280, 1240, 380, 30, 8), '#C98B5B', { lw: 5 }); paint(x, c => roundRect(c, 2280, 1180, 380, 26, 8), '#C98B5B', { lw: 5 });
  line(x, [[2310, 1270], [2310, 1340]], 12, OL); line(x, [[2630, 1270], [2630, 1340]], 12, OL);
});

// exam table (drawn in the scene so Gus can stand on it): top surface at y = TABLE.top
const TABLE = { x0: 560, x1: 1030, top: 1250 };
function examTable(ctx) {
  const { x0, x1, top } = TABLE;
  paint(ctx, c => roundRect(c, x0, top, x1 - x0, 96, 16), '#A4D4E8', { shade: '#82B8D0', sx: 0, sy: -14, lw: 6 });
  paint(ctx, c => roundRect(c, x0 + 20, top - 12, x1 - x0 - 40, 18, 5), '#FFFFFF', { lw: 3 });
  for (const lx of [x0 + 50, x1 - 50]) paint(ctx, c => roundRect(c, lx - 12, top + 96, 24, 1440 - top - 96, 6), '#7A8A90', { lw: 4 });
  paint(ctx, c => roundRect(c, x0 + 160, 1360, 150, 60, 8), '#C5D0C8', { lw: 4 }); // step stool
}
// waiting-room chair; seat top at y = 1290
function chair(ctx, X, col = '#2E6FD8') {
  paint(ctx, c => roundRect(c, X - 100, 980, 200, 320, 26), col, { shade: 'rgba(0,0,0,0.14)', sx: 10, sy: 0, lw: 6 });
  paint(ctx, c => roundRect(c, X - 120, 1280, 240, 40, 14), col, { shade: 'rgba(0,0,0,0.14)', sx: 0, sy: -8, lw: 6 });
  line(ctx, [[X - 92, 1320], [X - 100, 1440]], 12, OL); line(ctx, [[X + 92, 1320], [X + 100, 1440]], 12, OL);
}

module.exports = { waiting, exam, street, examTable, chair, doorLeaf, DOOR, TABLE, FLOOR, RES, WW, HH };
