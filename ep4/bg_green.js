// Episode 4 — GREEN STREET world (2880 wide x 1080). One world; every shot is a camera on it.
//  bus stop (x 0-360) · FLOWERS shop (380-1140, door centre 825) · café (1160-1640) · tree ·
//  tall pole sign BIG BURGER 2 FOR 1 + arrow (x 1850) · GREEN ST sign + lamp · BIG BURGER (2300-2860, door centre 2600)
const { OL, paint, line, curve, roundRect } = require('../lib/draw');
const F = require('../lib/fonts');
const B = require('./bg4');
const { burgerProp } = require('../lib/town');

const WW = 2880, H = 1080, GW = 830;
const DOOR_FLOWERS = 825, DOOR_BURGER = 2600, SIGN_X = 1850;
const vg = (x, y0, y1, a, b) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
const txt = (x, s, X, Y, size, col, al = 'center') => { x.fillStyle = col; x.font = `800 ${size}px ${F.EN}`; x.textAlign = al; x.fillText(s, X, Y); };

function sky(x) {
  x.fillStyle = vg(x, 0, GW, '#8FD0F7', '#DDF2FF'); x.fillRect(-200, -200, WW + 400, GW + 200);
  x.fillStyle = '#FFFFFF'; x.globalAlpha = 0.9;
  for (const [cx, cy, s] of [[180, 110, 1], [900, 70, 1.2], [1500, 140, 0.9], [2150, 90, 1.25], [2700, 160, 0.85]])
    for (const [dx, dy, r] of [[0, 0, 46], [44, -14, 54], [94, 0, 42], [40, 14, 40]]) { x.beginPath(); x.arc(cx + dx * s, cy + dy * s, r * s, 0, 7); x.fill(); }
  x.globalAlpha = 1;
  // far city skyline (soft, behind everything)
  x.fillStyle = '#B9DDF2';
  for (const [X, w, h] of [[120, 160, 300], [330, 120, 380], [1180, 200, 340], [1420, 130, 420], [1980, 170, 360], [2200, 120, 300], [2700, 180, 380]]) x.fillRect(X, GW - h - 260, w, h + 260);
}
function sidewalk(x) {
  x.fillStyle = '#D9D2C7'; x.fillRect(-200, GW, WW + 400, H - GW);
  x.fillStyle = '#CFC7BA'; for (let X = -160; X < WW + 200; X += 160) x.fillRect(X, GW, 6, H - GW);
  x.fillStyle = vg(x, GW, GW + 90, 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0)'); x.fillRect(-200, GW, WW + 400, 90);
  x.fillStyle = OL; x.fillRect(-200, GW - 2, WW + 400, 4);
  x.fillStyle = '#B8B0A2'; x.fillRect(-200, 1040, WW + 400, 60); line(x, [[-200, 1040], [WW + 200, 1040]], 4, OL);
}
function awning(x, X0, X1, Y, c1, c2) {
  paint(x, c => { c.moveTo(X0 + 20, Y); c.lineTo(X1 - 20, Y); c.lineTo(X1, Y + 56); c.lineTo(X0, Y + 56); c.closePath(); }, c1, { lw: 5 });
  x.save(); x.beginPath(); x.moveTo(X0 + 20, Y); x.lineTo(X1 - 20, Y); x.lineTo(X1, Y + 56); x.lineTo(X0, Y + 56); x.closePath(); x.clip();
  x.fillStyle = c2; for (let X = X0; X < X1; X += 70) x.fillRect(X, Y, 35, 56); x.restore();
  paint(x, c => { for (let X = X0; X < X1 - 1; X += 35) { c.moveTo(X, Y + 56); c.arc(X + 17.5, Y + 56, 17.5, Math.PI, 0, true); } }, c1, { lw: 4 });
  line(x, [[X0, Y + 56], [X1, Y + 56]], 5, OL);
}
function flowerBucket(x, X, Y, col) {
  for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.24; line(x, [[X, Y - 10], [X + Math.sin(a) * 50, Y - 60 - Math.cos(a) * 20]], 4, '#4FA36B'); }
  for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.24, fx = X + Math.sin(a) * 52, fy = Y - 64 - Math.cos(a) * 22;
    paint(x, c => { for (let k = 0; k < 5; k++) { const b = k * 1.2566; c.moveTo(fx + Math.cos(b) * 13 + 9, fy + Math.sin(b) * 13); c.arc(fx + Math.cos(b) * 13, fy + Math.sin(b) * 13, 9, 0, 7); } }, col, { lw: 3 });
    paint(x, c => c.arc(fx, fy, 6, 0, 7), '#FFD23F', { lw: 2.5 }); }
  paint(x, c => { c.moveTo(X - 40, Y - 20); c.lineTo(X + 40, Y - 20); c.lineTo(X + 30, Y + 40); c.lineTo(X - 30, Y + 40); c.closePath(); }, '#9AA7B8', { shade: '#7E8B9C', sx: -8, sy: 0, lw: 5 });
}
function busStop(x) {
  // shelter
  paint(x, c => c.rect(40, 560, 300, GW - 560), 'rgba(190,225,245,0.55)', { lw: 5 });
  for (const X of [40, 340]) paint(x, c => roundRect(c, X - 8, 540, 16, GW - 540 + 6, 5), '#3B4656', { lw: 4 });
  paint(x, c => roundRect(c, 20, 520, 340, 34, 8), '#2E6FD8', { lw: 5 });
  paint(x, c => roundRect(c, 80, 760, 220, 18, 6), '#B5733E', { lw: 4 });
  for (const X of [100, 280]) paint(x, c => c.rect(X - 5, 778, 10, GW - 778), '#3B4656', { lw: 3 });
  // BUS sign pole
  paint(x, c => roundRect(c, 363, 400, 14, GW - 400 + 30, 5), '#3B4656', { lw: 4 });
  paint(x, c => c.arc(370, 380, 40, 0, 7), '#2E6FD8', { lw: 5 });
  txt(x, 'BUS', 370, 392, 28, '#FFFFFF');
}
function flowerShop(x) {
  paint(x, c => c.rect(420, 330, 720, GW - 330), '#F6B3C6', { shade: '#E697AE', sx: -14, sy: 0, lw: 6 });
  paint(x, c => c.rect(400, 300, 760, 44), '#C2577A', { lw: 6 });
  // second floor windows
  for (const X of [470, 680, 940]) B.win(x, X, 380, 130, 110, X !== 680);
  // FLOWERS plaque
  paint(x, c => roundRect(c, 560, 520, 420, 84, 14), '#FFFFFF', { lw: 6 });
  txt(x, 'FLOWERS', 770, 582, 60, '#C2577A');
  for (const k of [-1, 1]) { const fx = 770 + k * 240; paint(x, c => { for (let i = 0; i < 5; i++) { const b = i * 1.2566; c.moveTo(fx + Math.cos(b) * 14 + 11, 562 + Math.sin(b) * 14); c.arc(fx + Math.cos(b) * 14, 562 + Math.sin(b) * 14, 11, 0, 7); } }, '#FF8FA3', { lw: 3 }); paint(x, c => c.arc(fx, 562, 7, 0, 7), '#FFD23F', { lw: 2.5 }); }
  awning(x, 430, 1130, 616, '#C2577A', '#FFFFFF');
  // shop window (left) with flowers inside
  paint(x, c => c.rect(450, 690, 280, GW - 700), '#BFE5F7', { lw: 5 });
  for (let i = 0; i < 5; i++) { const fx = 480 + i * 56; line(x, [[fx, GW - 14], [fx, 740]], 4, '#4FA36B'); paint(x, c => c.arc(fx, 735, 16, 0, 7), ['#FF5C7A', '#FFD23F', '#B07CE0', '#FF8FA3', '#FF9A2E'][i], { lw: 3 }); }
  x.save(); x.globalAlpha = 0.45; x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(500, GW - 10); x.lineTo(600, 690); x.lineTo(650, 690); x.lineTo(550, GW - 10); x.closePath(); x.fill(); x.restore();
  // door
  B.door(x, DOOR_FLOWERS - 56, 680, 112, GW - 680, '#7D4E8A');
  // right window
  paint(x, c => c.rect(920, 690, 190, GW - 700), '#BFE5F7', { lw: 5 });
  paint(x, c => roundRect(c, 950, 712, 130, 56, 8), '#FFFFFF', { lw: 4 });
  txt(x, 'OPEN', 1015, 752, 32, '#2F9466');
  // buckets on the sidewalk
  flowerBucket(x, 500, GW + 10, '#FF5C7A'); flowerBucket(x, 620, GW + 10, '#FFD23F'); flowerBucket(x, 1040, GW + 10, '#B07CE0');
}
function cafe(x) {
  B.bricks(x, 1160, 380, 480, GW - 380, '#F2D27A', '#D9B65A');
  paint(x, c => c.rect(1140, 350, 520, 40), '#B5733E', { lw: 6 });
  B.win(x, 1220, 440, 120, 120, true); B.win(x, 1460, 440, 120, 120, true);
  awning(x, 1170, 1630, 610, '#2F9466', '#FFFFFF');
  paint(x, c => c.rect(1200, 690, 220, GW - 700), '#BFE5F7', { lw: 5 });
  paint(x, c => roundRect(c, 1236, 712, 150, 56, 8), '#FFFFFF', { lw: 4 });
  txt(x, 'CAFE', 1311, 752, 34, '#2F9466');
  B.door(x, 1480, 680, 104, GW - 680, '#2F9466');
}
function arrowShape(c, X, Y, L, h) { // right-pointing block arrow drawn as a shape (no glyphs)
  c.moveTo(X, Y - h * 0.28); c.lineTo(X + L - h * 0.7, Y - h * 0.28); c.lineTo(X + L - h * 0.7, Y - h * 0.62); c.lineTo(X + L, Y);
  c.lineTo(X + L - h * 0.7, Y + h * 0.62); c.lineTo(X + L - h * 0.7, Y + h * 0.28); c.lineTo(X, Y + h * 0.28); c.closePath();
}
function poleSign(x) {
  const X = SIGN_X;
  paint(x, c => roundRect(c, X - 12, 330, 24, GW - 330 + 40, 6), '#3B4656', { lw: 5 });
  paint(x, c => roundRect(c, X - 30, GW + 26, 60, 18, 5), '#3B4656', { lw: 4 });
  paint(x, c => roundRect(c, X - 190, 140, 380, 200, 26), '#E5484D', { shade: '#C93A3F', sx: -10, sy: -8, lw: 7 });
  paint(x, c => roundRect(c, X - 170, 158, 340, 90, 18), '#FFD23F', { lw: 5 });
  txt(x, 'BIG BURGER', X, 222, 50, '#C93A3F');
  txt(x, '2 FOR 1', X - 46, 312, 52, '#FFFFFF');
  paint(x, c => arrowShape(c, X + 70, 294, 96, 50), '#FFFFFF', { lw: 5 });
  // light bulbs around the board
  for (let i = 0; i < 9; i++) { paint(x, c => c.arc(X - 168 + i * 42, 344, 7, 0, 7), '#FFF2B8', { lw: 3 }); }
}
function bigBurger(x) {
  paint(x, c => c.rect(2300, 420, 560, GW - 420), '#E5484D', { shade: '#C93A3F', sx: -14, sy: 0, lw: 6 });
  paint(x, c => c.rect(2280, 400, 600, 40), '#8A2A2E', { lw: 6 });
  // roof burger
  burgerProp(x, 2580, 330, 1.25);
  // sign
  paint(x, c => roundRect(c, 2350, 460, 460, 100, 18), '#FFD23F', { lw: 6 });
  txt(x, 'BIG BURGER', 2580, 530, 66, '#C93A3F');
  awning(x, 2310, 2850, 580, '#FFD23F', '#E5484D');
  // windows + poster
  for (const X of [2330, 2700]) { paint(x, c => c.rect(X, 660, 140, GW - 670), '#BFE5F7', { lw: 5 }); x.save(); x.globalAlpha = 0.45; x.fillStyle = '#fff'; x.beginPath(); x.moveTo(X + 20, GW - 12); x.lineTo(X + 80, 660); x.lineTo(X + 110, 660); x.lineTo(X + 50, GW - 12); x.closePath(); x.fill(); x.restore(); }
  paint(x, c => roundRect(c, 2340, 676, 120, 92, 8), '#FFFFFF', { lw: 4 });
  txt(x, '2 FOR 1', 2400, 714, 26, '#E5484D'); txt(x, '$5', 2400, 754, 34, '#2F9466');
  B.door(x, DOOR_BURGER - 60, 660, 120, GW - 660, '#FFD23F');
}
function drawGreen(x) {
  sky(x);
  B.tree(x, 1720, GW + 6, 1.0);
  busStop(x); flowerShop(x); cafe(x); bigBurger(x);
  // filler building between sign and Big Burger
  paint(x, c => c.rect(1960, 470, 330, GW - 470), '#9FB7D9', { shade: '#87A0C4', sx: -12, sy: 0, lw: 6 });
  B.win(x, 2010, 520, 100, 100, false); B.win(x, 2160, 520, 100, 100, false); B.win(x, 2010, 670, 100, 100, false); B.win(x, 2160, 670, 100, 100, false);
  poleSign(x);
  sidewalk(x);
  B.lamp(x, 1300, GW + 70, 1); B.lamp(x, 2240, GW + 70, 1);
  B.sign(x, 2050, GW + 40, 'GREEN ST');
}

module.exports = { drawGreen, WW, GW, DOOR_FLOWERS, DOOR_BURGER, SIGN_X, arrowShape };
