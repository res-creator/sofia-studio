// Episode 4 backgrounds, screen space 1920x1080 (rendered at K=1.1 so shots can push in slightly).
//  wide()   — quiet city street: houses, book shop, tree + bench, BANK on the corner, park beyond.
//  gusBG()  — reverse angle behind Gus: brick house, window boxes, door, lamp post.
//  roseBG() — behind Mrs. Rose: the bank's columns + a park tree.
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { OL, paint, line, curve, roundRect } = require('../lib/draw');
const F = require('../lib/fonts');

const K = 1.1, W = 1920, H = 1080;
function mk(fn) { const c = createCanvas(Math.round(W * K), Math.round(H * K)), x = c.getContext('2d'); x.scale(K, K); fn(x); return c; }
const vg = (x, y0, y1, a, b) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };

function sky(x, y1) {
  x.fillStyle = vg(x, 0, y1, '#8FD0F7', '#DDF2FF'); x.fillRect(0, 0, W, y1);
  x.fillStyle = '#FFFFFF'; x.globalAlpha = 0.9;
  for (const [cx, cy, s] of [[260, 120, 1], [1100, 80, 1.3], [1650, 150, 0.9]]) for (const [dx, dy, r] of [[0, 0, 46], [44, -14, 54], [94, 0, 42], [40, 14, 40]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, 7); x.fill(); }
  x.globalAlpha = 1;
}
function sidewalk(x, y0) {
  x.fillStyle = '#D9D2C7'; x.fillRect(0, y0, W, H - y0);
  x.fillStyle = '#CFC7BA'; for (let i = 0; i < 14; i++) x.fillRect(i * 160 - ((y0 / 3) % 160), y0, 6, H - y0);
  x.fillStyle = vg(x, y0, y0 + 90, 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0)'); x.fillRect(0, y0, W, 90);
  x.fillStyle = OL; x.fillRect(0, y0 - 2, W, 4);
}
function win(x, X, Y, w, h, box) {
  paint(x, c => roundRect(c, X - 10, Y - 10, w + 20, h + 20, 6), '#F4EEE4', { lw: 5 });
  paint(x, c => c.rect(X, Y, w, h), '#9ED4F2', { lw: 4 });
  x.save(); x.globalAlpha = 0.5; x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(X + w * 0.15, Y + h); x.lineTo(X + w * 0.5, Y); x.lineTo(X + w * 0.68, Y); x.lineTo(X + w * 0.33, Y + h); x.closePath(); x.fill(); x.restore();
  line(x, [[X + w / 2, Y], [X + w / 2, Y + h]], 5, '#F4EEE4'); line(x, [[X, Y + h / 2], [X + w, Y + h / 2]], 5, '#F4EEE4');
  if (box) {
    paint(x, c => roundRect(c, X - 14, Y + h + 6, w + 28, 34, 6), '#8A5A34', { lw: 4 });
    for (let i = 0; i < 5; i++) { const fx = X + 6 + i * (w - 12) / 4; paint(x, c => c.arc(fx, Y + h + 4, 13, 0, 7), i % 2 ? '#FF8FA3' : '#FFD23F', { lw: 3 }); }
  }
}
function bricks(x, X, Y, w, h, col, mort) {
  paint(x, c => c.rect(X, Y, w, h), col, { lw: 6 });
  x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.strokeStyle = mort; x.lineWidth = 3;
  for (let r = 0, y = Y; y < Y + h; r++, y += 34) { x.beginPath(); x.moveTo(X, y); x.lineTo(X + w, y); x.stroke(); for (let bx = X + (r % 2) * 40; bx < X + w; bx += 80) { x.beginPath(); x.moveTo(bx, y); x.lineTo(bx, y + 34); x.stroke(); } }
  x.restore();
}
function door(x, X, Y, w, h, col) {
  paint(x, c => roundRect(c, X - 12, Y - 12, w + 24, h + 12, 10), '#F4EEE4', { lw: 5 });
  paint(x, c => roundRect(c, X, Y, w, h, 8), col, { shade: 'rgba(0,0,0,0.12)', sx: 10, sy: 0, lw: 5 });
  paint(x, c => roundRect(c, X + 18, Y + 20, w - 36, h * 0.35, 6), '#9ED4F2', { lw: 4 });
  paint(x, c => c.arc(X + w - 22, Y + h * 0.58, 8, 0, 7), '#F2C744', { lw: 3 });
}
function tree(x, X, Y, s) {
  paint(x, c => { c.moveTo(X - 18 * s, Y); c.lineTo(X - 12 * s, Y - 220 * s); c.lineTo(X + 12 * s, Y - 220 * s); c.lineTo(X + 18 * s, Y); c.closePath(); }, '#8A5A34', { shade: '#6B4226', sx: -6, sy: 0, lw: 5 });
  for (const [dx, dy, r] of [[0, -300, 110], [-90, -240, 80], [90, -240, 84], [-50, -360, 76], [60, -370, 80]]) paint(x, c => c.arc(X + dx * s, Y + dy * s, r * s, 0, 7), '#5DBB63', { shade: '#45A04D', sx: -12, sy: -10, lw: 5 });
}
function lamp(x, X, Y, s = 1) {
  paint(x, c => roundRect(c, X - 9 * s, Y - 420 * s, 18 * s, 420 * s, 6), '#3B4656', { lw: 5 });
  paint(x, c => roundRect(c, X - 30 * s, Y - 470 * s, 60 * s, 60 * s, 10), '#FFF2B8', { lw: 5 });
  paint(x, c => { c.moveTo(X - 40 * s, Y - 470 * s); c.lineTo(X + 40 * s, Y - 470 * s); c.lineTo(X, Y - 500 * s); c.closePath(); }, '#3B4656', { lw: 5 });
  paint(x, c => roundRect(c, X - 22 * s, Y - 14 * s, 44 * s, 14 * s, 4), '#3B4656', { lw: 4 });
}
function bank(x, X, Y, w, h, cols = 4, label = true) {
  // stone body + pediment + columns + steps
  paint(x, c => c.rect(X, Y, w, h), '#EDE3CF', { shade: '#D9CDB4', sx: -14, sy: 0, lw: 6 });
  paint(x, c => { c.moveTo(X - 30, Y); c.lineTo(X + w / 2, Y - h * 0.22); c.lineTo(X + w + 30, Y); c.closePath(); }, '#F4ECDC', { shade: '#D9CDB4', sx: 0, sy: -10, lw: 6 });
  paint(x, c => c.rect(X - 30, Y - 4, w + 60, 40), '#F4ECDC', { lw: 6 });
  if (label) { const fs = Math.round(h * 0.12); x.fillStyle = '#8A6A2E'; x.font = `800 ${fs}px ${F.EN}`; x.textAlign = 'center'; x.fillText('BANK', X + w / 2, Y - h * 0.04); }
  for (let i = 0; i < cols; i++) {
    const cx = X + w * (i + 0.5) / cols;
    paint(x, c => c.rect(cx - w * 0.045, Y + 40, w * 0.09, h - 80), '#FBF6EC', { shade: '#E3D8C2', sx: -8, sy: 0, lw: 5 });
    for (let k = -1; k <= 1; k++) line(x, [[cx + k * w * 0.02, Y + 52], [cx + k * w * 0.02, Y + h - 52]], 2.5, '#E3D8C2');
    paint(x, c => c.rect(cx - w * 0.06, Y + 34, w * 0.12, 18), '#F4ECDC', { lw: 4 });
    paint(x, c => c.rect(cx - w * 0.06, Y + h - 52, w * 0.12, 18), '#F4ECDC', { lw: 4 });
  }
  paint(x, c => c.rect(X - 20, Y + h - 30, w + 40, 30), '#E3D8C2', { lw: 5 });
}
function bench(x, X, Y) {
  for (const k of [-1, 1]) paint(x, c => roundRect(c, X + k * 90 - 7, Y - 60, 14, 60, 4), '#3B4656', { lw: 4 });
  paint(x, c => roundRect(c, X - 120, Y - 72, 240, 18, 6), '#B5733E', { lw: 4 });
  paint(x, c => roundRect(c, X - 120, Y - 124, 240, 18, 6), '#B5733E', { lw: 4 });
  paint(x, c => roundRect(c, X - 120, Y - 98, 240, 14, 6), '#B5733E', { lw: 4 });
}
function sign(x, X, Y, txt) {
  paint(x, c => roundRect(c, X - 7, Y - 300, 14, 300, 5), '#3B4656', { lw: 4 });
  paint(x, c => roundRect(c, X - 100, Y - 330, 200, 50, 8), '#2F9466', { lw: 5 });
  x.fillStyle = '#FFFFFF'; x.font = `800 30px ${F.EN}`; x.textAlign = 'center'; x.fillText(txt, X, Y - 294);
}

const GW = 830; // ground line, wide shot
const wide = () => mk(x => {
  sky(x, GW);
  // far park trees behind the bank (right edge)
  tree(x, 1850, GW, 0.9); tree(x, 1760, GW, 0.7);
  // house 1 (red brick)
  bricks(x, -20, 330, 430, GW - 330, '#C8644A', '#A84E38');
  paint(x, c => c.rect(-40, 300, 470, 40), '#7A3A2C', { lw: 6 });
  win(x, 50, 400, 120, 140, true); win(x, 240, 400, 120, 140, true); door(x, 150, 640, 110, GW - 640, '#2E6FD8');
  // book shop (blue)
  paint(x, c => c.rect(410, 400, 400, GW - 400), '#6E9BD6', { shade: '#5A86C2', sx: -12, sy: 0, lw: 6 });
  paint(x, c => roundRect(c, 440, 430, 340, 70, 10), '#FFF4E0', { lw: 5 });
  x.fillStyle = '#2E4E8A'; x.font = `800 50px ${F.EN}`; x.textAlign = 'center'; x.fillText('BOOKS', 610, 482);
  paint(x, c => c.rect(450, 540, 210, 210), '#9ED4F2', { lw: 5 });
  for (let i = 0; i < 6; i++) paint(x, c => c.rect(470 + i * 30, 680 - (i % 3) * 14, 24, 70 + (i % 3) * 14), ['#E5484D', '#FFD23F', '#2F9466'][i % 3], { lw: 3 });
  door(x, 690, 600, 96, GW - 600, '#2A3D73');
  // awning
  paint(x, c => { c.moveTo(430, 510); c.lineTo(800, 510); c.lineTo(820, 560); c.lineTo(410, 560); c.closePath(); }, '#E5484D', { lw: 5 });
  for (let i = 0; i < 6; i++) paint(x, c => c.rect(420 + i * 66, 510, 33, 50), '#FFFFFF', { lw: 0 });
  line(x, [[410, 560], [820, 560]], 5, OL);
  // gap with tree + bench
  tree(x, 950, GW + 6, 1.05); bench(x, 1060, GW + 40);
  // bank
  bank(x, 1290, 470, 520, GW - 470, 4, true);
  // corner sign
  sign(x, 1860, GW + 40, 'OAK ST');
  sidewalk(x, GW);
  // curb at the bottom
  x.fillStyle = '#B8B0A2'; x.fillRect(0, 1040, W, 40); line(x, [[0, 1040], [W, 1040]], 4, OL);
  lamp(x, 1180, GW + 70, 1);
});

const GG = 880;
const gusBG = () => mk(x => {
  sky(x, GG);
  bricks(x, -20, 120, 1100, GG - 120, '#C8644A', '#A84E38');
  paint(x, c => c.rect(-40, 90, 1160, 44), '#7A3A2C', { lw: 6 });
  win(x, 120, 240, 220, 250, true); win(x, 560, 240, 220, 250, true);
  door(x, 840, 540, 180, GG - 540, '#2E6FD8');
  // drainpipe
  paint(x, c => roundRect(c, 1060, 130, 24, GG - 130, 8), '#8E96A3', { lw: 4 });
  // neighbour house (cream)
  paint(x, c => c.rect(1084, 200, 900, GG - 200), '#F2DDB0', { shade: '#E0C894', sx: -14, sy: 0, lw: 6 });
  win(x, 1200, 320, 220, 250, false); win(x, 1580, 320, 220, 250, true);
  paint(x, c => c.rect(1084, 640, 900, 14), '#E0C894', { lw: 4 });
  lamp(x, 1490, GG + 90, 1.35);
  sidewalk(x, GG);
});

const GR = 900;
const roseBG = () => mk(x => {
  sky(x, GR);
  tree(x, 1720, GR, 1.6);
  bank(x, -140, 300, 1640, GR - 300, 5, true);
  sidewalk(x, GR);
});

module.exports = { wide, gusBG, roseBG, K, W, H, GW, GG, GR };
