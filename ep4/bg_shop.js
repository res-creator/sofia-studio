// Episode 4 — CORNER SHOP interior (1920 x 1080 world). Back wall shelves, street door with a bell (left),
// MAPS rack, counter + till on the right. drawShop() = background, counterFront() = foreground (drawn over Tom's legs).
const { OL, paint, line, curve, roundRect } = require('../lib/draw');
const F = require('../lib/fonts');
const B = require('./bg4');

const W = 1920, H = 1080, GW = 800, DOOR_X = 190, RACK_X = 620, COUNTER = [1180, 1760], COUNTER_TOP = 860;
const txt = (x, s, X, Y, size, col, al = 'center') => { x.fillStyle = col; x.font = `800 ${size}px ${F.EN}`; x.textAlign = al; x.fillText(s, X, Y); };

function shelfItems(x, X0, X1, Y, seed) {
  const cols = ['#E5484D', '#FFD23F', '#2F9466', '#2E6FD8', '#FF9A2E', '#B07CE0', '#FFFFFF'];
  let X = X0 + 8, i = seed;
  while (X < X1 - 40) {
    const kind = i % 3, col = cols[(i * 5) % cols.length];
    if (kind === 0) { const w = 44, h = 70; paint(x, c => roundRect(c, X, Y - h, w, h, 6), col, { shade: 'rgba(0,0,0,0.12)', sx: -6, sy: 0, lw: 4 }); paint(x, c => c.rect(X + 6, Y - h + 22, w - 12, 20), '#FFFFFF', { lw: 0 }); X += w + 8; }
    else if (kind === 1) { const w = 40, h = 52; paint(x, c => roundRect(c, X, Y - h, w, h, 4), col, { lw: 4 }); line(x, [[X + 4, Y - h + 10], [X + w - 4, Y - h + 10]], 3, 'rgba(0,0,0,0.25)'); X += w + 6; }
    else { const w = 60, h = 84; paint(x, c => { c.moveTo(X + 6, Y - h); c.lineTo(X + w - 6, Y - h); c.lineTo(X + w, Y); c.lineTo(X, Y); c.closePath(); }, col, { lw: 4 }); X += w + 8; }
    i++;
  }
}
function drawShop(x) {
  // walls + floor
  x.fillStyle = '#CFEAD9'; x.fillRect(-100, -100, W + 200, GW + 100);
  x.fillStyle = '#BFE0CC'; for (let X = -40; X < W + 100; X += 120) x.fillRect(X, 0, 60, GW);
  paint(x, c => c.rect(-100, GW - 46, W + 200, 46), '#FFFFFF', { lw: 5 });
  x.fillStyle = '#D9A86C'; x.fillRect(-100, GW, W + 200, H - GW + 100);
  x.strokeStyle = '#C08F55'; x.lineWidth = 4;
  for (let Y = GW + 40; Y < H; Y += 60) { x.beginPath(); x.moveTo(-100, Y); x.lineTo(W + 100, Y); x.stroke(); }
  for (let r = 0, Y = GW; Y < H; r++, Y += 60) for (let X = (r % 2) * 120 - 100; X < W + 100; X += 240) { x.beginPath(); x.moveTo(X, Y); x.lineTo(X, Y + 60); x.stroke(); }
  x.fillStyle = OL; x.fillRect(-100, GW - 2, W + 200, 4);
  // street door with window + bell
  paint(x, c => roundRect(c, DOOR_X - 110, 300, 220, GW - 300, 8), '#F4EEE4', { lw: 6 });
  paint(x, c => roundRect(c, DOOR_X - 92, 318, 184, GW - 318, 6), '#2F9466', { shade: '#247A53', sx: 10, sy: 0, lw: 5 });
  paint(x, c => roundRect(c, DOOR_X - 70, 340, 140, 220, 6), '#BFE5F7', { lw: 5 });
  x.save(); x.beginPath(); roundRect(x, DOOR_X - 70, 340, 140, 220, 6); x.clip(); B.tree(x, DOOR_X + 20, 640, 0.5); x.restore();
  line(x, [[DOOR_X - 70, 340], [DOOR_X + 70, 340]], 5, OL);
  paint(x, c => c.arc(DOOR_X + 70, 590, 9, 0, 7), '#F2C744', { lw: 3 });
  line(x, [[DOOR_X + 112, 300], [DOOR_X + 140, 300], [DOOR_X + 140, 320]], 4, '#3B4656');
  paint(x, c => { c.moveTo(DOOR_X + 126, 346); c.quadraticCurveTo(DOOR_X + 126, 318, DOOR_X + 140, 318); c.quadraticCurveTo(DOOR_X + 154, 318, DOOR_X + 154, 346); c.closePath(); }, '#F2C744', { lw: 4 });
  // shop window (right of door)
  paint(x, c => roundRect(c, 340, 250, 300, 260, 8), '#F4EEE4', { lw: 6 });
  paint(x, c => c.rect(358, 268, 264, 224), '#BFE5F7', { lw: 4 });
  x.save(); x.beginPath(); x.rect(358, 268, 264, 224); x.clip();
  x.fillStyle = '#E5A08C'; x.fillRect(358, 330, 120, 200); x.fillStyle = '#9FB7D9'; x.fillRect(500, 360, 130, 200); x.restore();
  line(x, [[490, 268], [490, 492]], 5, '#F4EEE4');
  // back shelves (centre/right)
  for (const [X0, X1] of [[760, 1120], [1200, 1860]]) {
    paint(x, c => c.rect(X0, 170, X1 - X0, GW - 216), '#B5733E', { shade: '#9A5F33', sx: -10, sy: 0, lw: 6 });
    paint(x, c => c.rect(X0 + 16, 186, X1 - X0 - 32, GW - 248), '#8A5A34', { lw: 4 });
    for (let k = 0; k < 4; k++) { const Y = 300 + k * 120; shelfItems(x, X0 + 16, X1 - 16, Y - 6, k * 3 + X0); paint(x, c => c.rect(X0 + 10, Y - 6, X1 - X0 - 20, 14), '#C98A52', { lw: 4 }); }
  }
  // SHOP sign on the wall
  paint(x, c => roundRect(c, 1290, 70, 480, 84, 16), '#FFD23F', { lw: 6 });
  txt(x, 'CORNER SHOP', 1530, 130, 52, '#3a221d');
  // MAPS rack (stands on the floor)
  const R = RACK_X;
  paint(x, c => roundRect(c, R - 10, 420, 20, GW + 60 - 420, 6), '#3B4656', { lw: 4 });
  paint(x, c => roundRect(c, R - 70, GW + 50, 140, 18, 6), '#3B4656', { lw: 4 });
  for (let r = 0; r < 3; r++) for (let k = -1; k <= 1; k += 2) {
    const Y = 470 + r * 110, X = R + k * 60;
    paint(x, c => roundRect(c, X - 46, Y, 92, 70, 6), '#FFF6DE', { shade: '#EADBB8', sx: 6, sy: 4, lw: 4 });
    line(x, [[X - 40, Y + 46], [X + 40, Y + 46]], 6, '#F2C744'); line(x, [[X - 6, Y + 6], [X - 6, Y + 64]], 6, '#F2C744');
    paint(x, c => c.arc(X + 22, Y + 22, 9, 0, 7), '#8ED28A', { lw: 3 });
  }
  paint(x, c => roundRect(c, R - 110, 350, 220, 70, 12), '#2E6FD8', { lw: 5 });
  txt(x, 'MAPS $5', R, 400, 42, '#FFFFFF');
}
function counterFront(x) {
  const [X0, X1] = COUNTER;
  // till on the counter
  paint(x, c => roundRect(c, X1 - 250, COUNTER_TOP - 130, 180, 110, 10), '#3B4656', { lw: 5 });
  paint(x, c => roundRect(c, X1 - 230, COUNTER_TOP - 116, 140, 44, 6), '#9EE6B8', { lw: 4 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) paint(x, c => roundRect(c, X1 - 228 + i * 48, COUNTER_TOP - 64 + j * 0, 36, 24, 4), '#E9EDF2', { lw: 3 });
  // counter body
  paint(x, c => c.rect(X0, COUNTER_TOP, X1 - X0, 1000 - COUNTER_TOP), '#E07B3C', { shade: '#C4652B', sx: -14, sy: 0, lw: 6 });
  paint(x, c => roundRect(c, X0 - 20, COUNTER_TOP - 14, X1 - X0 + 40, 32, 8), '#F4EEE4', { lw: 6 });
  for (let X = X0 + 70; X < X1 - 20; X += 140) paint(x, c => roundRect(c, X - 40, COUNTER_TOP + 34, 80, 1000 - COUNTER_TOP - 68, 8), '#F08C4E', { lw: 4 });
}

module.exports = { drawShop, counterFront, W, GW, DOOR_X, RACK_X, COUNTER, COUNTER_TOP };
