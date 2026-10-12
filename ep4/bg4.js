// Episode 4 backgrounds: hotel entrance, lobby (+reception desk foreground), lift front, room 404, restaurant. World 2880x1920, floor line y=1420 (same as ep2/ep3).
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { OL, paint, line, roundRect, hash } = require('../lib/draw');
const F = require('../lib/fonts');
const B3 = require('../ep3/bg3');
const RES = 1.5, WW = 2880, HH = 1920, FLOOR = 1420;
function mk(fn) { const c = createCanvas(WW * RES, HH * RES), x = c.getContext('2d'); x.scale(RES, RES); fn(x); return c; }
const R = (x, X, Y, w, h, f) => { x.fillStyle = f; x.fillRect(X, Y, w, h); };
const grad = (x, y0, y1, a, b) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
function floorTiles(x, a, b, step = 170, y0 = FLOOR) { R(x, 0, y0, WW, HH - y0, a); for (let r = 0; r < 6; r++) for (let c = 0; c < WW / step + 1; c++) if ((r + c) % 2) R(x, c * step, y0 + r * 100, step, 100, b); line(x, [[0, y0], [WW, y0]], 8, OL); }
function plant(x, X, Y, s = 1) { x.save(); x.translate(X, Y); x.scale(s, s); paint(x, c => { c.moveTo(-60, -130); c.lineTo(60, -130); c.lineTo(44, 0); c.lineTo(-44, 0); c.closePath(); }, '#C9693F', { lw: 6 });
  for (let k = 0; k < 7; k++) paint(x, c => { c.ellipse((k - 3) * 30, -230 - Math.abs(k - 3) * -14 - (k % 2) * 40, 26, 100, (k - 3) * 0.28, 0, 7); }, k % 2 ? '#3FA45B' : '#2F8F4B', { lw: 5 }); x.restore(); }
function clockFace(x, X, Y, r, h, m) { paint(x, c => c.arc(X, Y, r, 0, 7), '#FFFFFF', { lw: 8 }); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(x, [[X + Math.sin(a) * r * 0.8, Y - Math.cos(a) * r * 0.8], [X + Math.sin(a) * r * 0.92, Y - Math.cos(a) * r * 0.92]], 5, OL); }
  const ah = (h % 12 + m / 60) / 12 * Math.PI * 2, am = m / 60 * Math.PI * 2; line(x, [[X, Y], [X + Math.sin(ah) * r * 0.5, Y - Math.cos(ah) * r * 0.5]], 9, OL); line(x, [[X, Y], [X + Math.sin(am) * r * 0.75, Y - Math.cos(am) * r * 0.75]], 6, OL); x.beginPath(); x.arc(X, Y, 8, 0, 7); x.fillStyle = OL; x.fill(); }

// ---------- 1. hotel entrance (street). Revolving door itself is drawn by the scene on top of the dark opening (DOOR.x, DOOR.y).
const DOOR = { x: 1440, floor: 1420, w: 560, h: 760 };
const entrance = () => mk(x => {
  x.fillStyle = grad(x, 0, 900, '#F6B58A', '#FFE3B8'); x.fillRect(0, 0, WW, HH);
  B3.cloud(x, 300, 260, 70); B3.cloud(x, 2500, 200, 60);
  // neighbour houses
  for (const [a, b, h, col] of [[0, 520, 900, '#D9A27A'], [2300, 2880, 1000, '#E3B08A']]) { R(x, a, FLOOR - h, b - a, h, col); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) paint(x, c => roundRect(c, a + 60 + i * 150, FLOOR - h + 80 + j * 190, 90, 130, 8), '#7FB2D6', { lw: 6 }); x.strokeStyle = OL; x.lineWidth = 8; x.strokeRect(a, FLOOR - h, b - a, h); }
  // hotel facade
  paint(x, c => c.rect(560, 330, 1760, FLOOR - 330), '#F2D9B0', { shade: '#DDBE8E', sx: 0, sy: -8, lw: 9 });
  paint(x, c => roundRect(c, 560, 250, 1760, 120, 18), '#7A2432', { lw: 9 });
  x.fillStyle = '#F2C744'; x.font = `800 84px ${F.EN}`; x.textAlign = 'center'; x.fillText('HOTEL PATO REAL', 1440, 336);
  for (let k = 0; k < 2; k++) for (let j = 0; j < 5; j++) { const X = k ? 1900 + (j % 2) * 0 : 640, Y = 420 + Math.floor(j / 1) * 0; }
  for (const X of [650, 900, 1900, 2150]) for (const Y of [430, 700]) { paint(x, c => roundRect(c, X, Y, 190, 200, 12), '#8EC5EA', { lw: 7 }); line(x, [[X + 95, Y], [X + 95, Y + 200]], 5, OL); line(x, [[X, Y + 100], [X + 190, Y + 100]], 5, OL); paint(x, c => roundRect(c, X - 12, Y + 196, 214, 22, 6), '#C9693F', { lw: 5 }); }
  // door opening + awning
  paint(x, c => roundRect(c, DOOR.x - 330, FLOOR - 870, 660, 870, 24), '#B88A5C', { lw: 9 });
  paint(x, c => roundRect(c, DOOR.x - DOOR.w / 2, FLOOR - DOOR.h, DOOR.w, DOOR.h, 16), '#FFE9B8', { lw: 7 });
  const g = x.createLinearGradient(0, FLOOR - DOOR.h, 0, FLOOR); g.addColorStop(0, '#FFF1CC'); g.addColorStop(1, '#F6D79B'); x.fillStyle = g; x.fillRect(DOOR.x - DOOR.w / 2 + 8, FLOOR - DOOR.h + 8, DOOR.w - 16, DOOR.h - 16);
  paint(x, c => { c.moveTo(DOOR.x - 420, FLOOR - 870); c.lineTo(DOOR.x + 420, FLOOR - 870); c.lineTo(DOOR.x + 470, FLOOR - 960); c.lineTo(DOOR.x - 470, FLOOR - 960); c.closePath(); }, '#C8323A', { shade: '#9E232B', sx: 0, sy: 14, lw: 8 });
  for (let i = 0; i < 8; i++) R(x, DOOR.x - 420 + i * 105, FLOOR - 960, 52, 90, 'rgba(255,255,255,0.18)');
  // pavement
  R(x, 0, FLOOR, WW, HH - FLOOR, '#C9C3BC'); for (let c = 0; c < 22; c++) line(x, [[c * 140 - 40, FLOOR], [c * 140 - 90 - 60, HH]], 4, 'rgba(58,34,29,0.25)'); for (let r = 1; r < 5; r++) line(x, [[0, FLOOR + r * r * 30], [WW, FLOOR + r * r * 30]], 4, 'rgba(58,34,29,0.2)'); line(x, [[0, FLOOR], [WW, FLOOR]], 8, OL);
  R(x, DOOR.x - 360, FLOOR + 6, 720, 40, '#7A2432');
  B3.palm(x, 440, FLOOR + 20, 1.1); B3.palm(x, 2480, FLOOR + 20, 1.1);
  plant(x, 1000, FLOOR + 10, 0.9); plant(x, 1880, FLOOR + 10, 0.9);
});

// ---------- 2. lobby: back wall + sofa + key rack. Reception desk is a FOREGROUND piece (desk4) so characters stand behind it.
const lobby = () => mk(x => {
  x.fillStyle = grad(x, 0, FLOOR, '#F8E7C8', '#F0D6A8'); x.fillRect(0, 0, WW, FLOOR);
  for (let i = 0; i < 12; i++) R(x, i * 240 + 30, 40, 70, FLOOR - 160, 'rgba(255,255,255,0.12)');
  R(x, 0, 1010, WW, 24, '#C9A66B'); R(x, 0, FLOOR - 60, WW, 60, '#8B5A3A');
  // big window (Madrid)
  paint(x, c => roundRect(c, 180, 220, 700, 640, 18), '#BFE4FA', { lw: 9 }); R(x, 524, 226, 12, 628, '#fff'); R(x, 186, 530, 688, 12, '#fff');
  R(x, 200, 740, 660, 110, '#E8C99B'); for (const [a, h] of [[220, 80], [330, 110], [470, 70], [560, 120], [700, 90]]) R(x, a, 850 - h, 90, h, '#E0A987');
  // chandelier
  line(x, [[1440, 0], [1440, 150]], 6, OL); paint(x, c => { c.moveTo(1300, 190); c.lineTo(1580, 190); c.lineTo(1500, 270); c.lineTo(1380, 270); c.closePath(); }, '#F2C744', { lw: 7 });
  for (const dx of [-120, -40, 40, 120]) { x.fillStyle = '#FFF6B0'; x.beginPath(); x.ellipse(1440 + dx, 290, 16, 24, 0, 0, 7); x.fill(); }
  // sign RECEPTION
  paint(x, c => roundRect(c, 1980, 160, 640, 120, 22), '#7A2432', { lw: 8 }); x.fillStyle = '#F2C744'; x.font = `800 70px ${F.EN}`; x.textAlign = 'center'; x.fillText('RECEPTION', 2300, 244);
  // key rack + clocks behind the desk
  paint(x, c => roundRect(c, 1960, 330, 680, 420, 16), '#5A3A26', { lw: 7 });
  for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) { const X = 2004 + k * 78, Y = 372 + r * 98; R(x, X, Y, 8, 44, '#F2C744'); x.fillStyle = '#F2C744'; x.beginPath(); x.arc(X + 4, Y + 54, 12, 0, 7); x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke(); }
  for (const [X, lab] of [[2040, 'MADRID'], [2300, 'LONDON'], [2560, 'NEW YORK']]) { clockFace(x, X, 880, 56, 3, 20); x.fillStyle = OL; x.font = `700 26px ${F.EN}`; x.textAlign = 'center'; x.fillText(lab, X, 972); }
  // floor
  floorTiles(x, '#E7D2B1', '#D5B88F', 190);
  // red carpet runner
  paint(x, c => { c.moveTo(560, FLOOR + 6); c.lineTo(1700, FLOOR + 6); c.lineTo(1860, HH); c.lineTo(380, HH); c.closePath(); }, '#B3263A', { shade: '#8E1C2C', sx: 0, sy: 0, lw: 7 });
  // sofa (left) + plants
  const sofa = (X, Y) => { paint(x, c => roundRect(c, X, Y - 260, 520, 170, 40), '#2E6FD8', { shade: '#2459B2', sx: 8, sy: 0, lw: 8 }); paint(x, c => roundRect(c, X - 30, Y - 120, 580, 130, 36), '#3C82F0', { shade: '#2E6FD8', sx: 0, sy: -10, lw: 8 }); line(x, [[X + 30, Y + 10], [X + 30, Y + 50]], 10, OL); line(x, [[X + 490, Y + 10], [X + 490, Y + 50]], 10, OL); };
  sofa(60, 1500); plant(x, 950, FLOOR + 40, 1.0); plant(x, 2750, FLOOR + 40, 1.0);
});
function desk4(x, o = {}) { // reception desk, front view, bottom at y=1620; bell on the counter. x range 1560..2500
  paint(x, c => roundRect(c, 1540, 1285, 1000, 340, 22), '#8B5A3A', { shade: '#6B4228', sx: 0, sy: -12, lw: 9 });
  paint(x, c => roundRect(c, 1510, 1255, 1060, 52, 14), '#E3C08B', { shade: '#C9A06A', sx: 0, sy: -6, lw: 8 });
  for (let k = 0; k < 4; k++) paint(x, c => roundRect(c, 1590 + k * 240, 1350, 190, 220, 12), 'rgba(0,0,0,0.12)', { lw: 5 });
  x.fillStyle = '#F2C744'; x.font = `800 40px ${F.EN}`; x.textAlign = 'center'; x.fillText('WELCOME', 2040, 1480);
  // monitor on the counter (left)
  paint(x, c => roundRect(c, 1620, 1130, 190, 126, 10), '#2B2F3A', { lw: 7 }); paint(x, c => roundRect(c, 1632, 1142, 166, 100, 4), '#8EC5EA', { lw: 0 }); line(x, [[1715, 1256], [1715, 1262]], 8, OL);
  // bell
  const b = o.bellHit ? Math.sin(o.bellHit * 40) * 4 : 0;
  paint(x, c => { c.arc(2330, 1250 + b, 40, Math.PI, 0); c.closePath(); }, '#F2C744', { lw: 7 }); paint(x, c => roundRect(c, 2280, 1246 + b, 100, 16, 6), '#C79A2A', { lw: 6 }); R(x, 2326, 1196 + b, 8, 14, OL);
}

// ---------- 3. lift front: wall with an opening; panels + display are drawn by the scene. Opening x 1080..1800
const LIFT = { x0: 1000, x1: 1880, top: 560 };
const liftWall = () => mk(x => {
  x.fillStyle = grad(x, 0, FLOOR, '#EADCC2', '#E2CFAE'); x.fillRect(0, 0, WW, FLOOR);
  for (let i = 0; i < 9; i++) R(x, i * 330 + 40, 100, 14, FLOOR - 200, 'rgba(122,36,50,0.12)');
  R(x, 0, 1120, WW, 20, '#C9A66B');
  paint(x, c => roundRect(c, LIFT.x0 - 60, LIFT.top - 80, LIFT.x1 - LIFT.x0 + 120, FLOOR - LIFT.top + 80, 20), '#B9A07A', { lw: 9 });
  paint(x, c => roundRect(c, 1180, 300, 520, 130, 20), '#2B2F3A', { lw: 8 });  // floor display plate
  floorTiles(x, '#D9C3A0', '#C4A97F', 190);
  paint(x, c => roundRect(c, 1940, 760, 120, 260, 22), '#C9D1DC', { lw: 7 }); for (const [dy, up] of [[820, true], [920, false]]) { x.beginPath(); x.arc(2000, dy, 28, 0, 7); x.fillStyle = '#F2C744'; x.fill(); x.lineWidth = 5; x.strokeStyle = OL; x.stroke(); line(x, up ? [[1986, dy + 8], [2000, dy - 10], [2014, dy + 8]] : [[1986, dy - 8], [2000, dy + 10], [2014, dy - 8]], 6, OL); }
  plant(x, 560, FLOOR + 30, 1.0); plant(x, 2400, FLOOR + 30, 1.0);
});
function liftInterior(x) { // drawn inside the opening (clip by scene): mirror back wall, rail
  R(x, LIFT.x0, LIFT.top, LIFT.x1 - LIFT.x0, FLOOR - LIFT.top, '#F4EBDD'); R(x, LIFT.x0 + 40, LIFT.top + 60, LIFT.x1 - LIFT.x0 - 80, 560, '#CFE3F2');
  line(x, [[LIFT.x0 + 80, LIFT.top + 140], [LIFT.x0 + 260, LIFT.top + 40]], 14, 'rgba(255,255,255,0.7)'); line(x, [[LIFT.x0 + 40, 1140], [LIFT.x1 - 40, 1140]], 14, '#C79A2A');
  R(x, LIFT.x0, 1280, LIFT.x1 - LIFT.x0, 140, '#D5B88F');
}
function corridor4(x) { // 4th-floor corridor glimpse
  R(x, LIFT.x0, LIFT.top, LIFT.x1 - LIFT.x0, FLOOR - LIFT.top, '#F2E1C4'); R(x, LIFT.x0, 1180, LIFT.x1 - LIFT.x0, 240, '#B3263A');
  for (const X of [1100, 1500]) { paint(x, c => roundRect(c, X, 760, 200, 400, 8), '#8B5A3A', { lw: 6 }); R(x, X + 60, 820, 80, 36, '#F2C744'); }
  x.fillStyle = '#F2C744'; x.font = `800 150px ${F.EN}`; x.textAlign = 'center'; x.fillText('4', 1440, 700);
}

// ---------- 4. room 404 (afternoon)
const room = () => mk(x => {
  x.fillStyle = grad(x, 0, FLOOR, '#FCE9CC', '#F6D8AE'); x.fillRect(0, 0, WW, FLOOR);
  R(x, 0, 1100, WW, 20, '#C9A66B');
  // window with curtains, sun
  paint(x, c => roundRect(c, 330, 260, 560, 640, 14), '#BFE4FA', { lw: 9 }); x.fillStyle = '#FFE066'; x.beginPath(); x.arc(660, 420, 80, 0, 7); x.fill(); R(x, 600, 266, 12, 628, '#fff'); R(x, 336, 560, 548, 12, '#fff');
  paint(x, c => roundRect(c, 260, 220, 160, 700, 24), '#C8323A', { shade: '#9E232B', sx: 6, sy: 0, lw: 8 }); paint(x, c => roundRect(c, 800, 220, 160, 700, 24), '#C8323A', { shade: '#9E232B', sx: -6, sy: 0, lw: 8 });
  // bed
  paint(x, c => roundRect(c, 1080, 780, 1000, 420, 30), '#7A4A2E', { lw: 9 });
  paint(x, c => roundRect(c, 1100, 930, 960, 470, 34), '#FFFFFF', { shade: '#DDE6F0', sx: 0, sy: -14, lw: 9 });
  paint(x, c => roundRect(c, 1100, 1090, 960, 310, 34), '#5B8FD8', { shade: '#4472B8', sx: 0, sy: -12, lw: 9 });
  paint(x, c => roundRect(c, 1160, 860, 340, 140, 60), '#FFFFFF', { lw: 7 }); paint(x, c => roundRect(c, 1600, 860, 340, 140, 60), '#FFFFFF', { lw: 7 });
  // picture, lamp
  paint(x, c => roundRect(c, 1360, 540, 360, 220, 10), '#FFFFFF', { lw: 8 }); R(x, 1380, 560, 320, 180, '#E8A04A'); x.fillStyle = '#6FC96A'; x.beginPath(); x.arc(1480, 700, 70, Math.PI, 0); x.fill(); x.fillStyle = '#FFE066'; x.beginPath(); x.arc(1620, 620, 30, 0, 7); x.fill();
  // door 404
  paint(x, c => roundRect(c, 2400, 700, 330, 720, 12), '#8B5A3A', { lw: 9 }); paint(x, c => roundRect(c, 2480, 790, 170, 76, 10), '#F2C744', { lw: 6 }); x.fillStyle = OL; x.font = `800 58px ${F.EN}`; x.textAlign = 'center'; x.fillText('404', 2565, 848); x.beginPath(); x.arc(2430, 1090, 16, 0, 7); x.fillStyle = '#F2C744'; x.fill();
  // desk + lamp
  paint(x, c => roundRect(c, 2140, 1160, 220, 40, 8), '#C9A06A', { lw: 7 }); R(x, 2170, 1200, 14, 220, OL); R(x, 2320, 1200, 14, 220, OL);
  floorTiles(x, '#B88A5C', '#A47A50', 220);
});
function acUnit(x, broken, t) { // wall AC above the bed; dynamic
  paint(x, c => roundRect(c, 1240, 270, 700, 170, 34), '#F5F7FA', { shade: '#D5DCE6', sx: 0, sy: -10, lw: 9 });
  for (let k = 0; k < 8; k++) R(x, 1290 + k * 78, 395, 54, 10, '#9AA5B5');
  x.fillStyle = broken ? '#E5484D' : '#3DAA6E'; x.beginPath(); x.arc(1880, 320, 14, 0, 7); x.fill();
  paint(x, c => roundRect(c, 1760, 305, 90, 30, 6), '#2B2F3A', { lw: 4 });
  x.fillStyle = broken ? '#E5484D' : '#7FD0FF'; x.font = `800 26px ${F.EN}`; x.textAlign = 'center'; x.fillText(broken ? '--' : '21°', 1805, 329);
}

// ---------- 5. restaurant (breakfast room): back wall, buffet counter (empty trays; food is drawn by the scene), tables
const restaurant = () => mk(x => {
  x.fillStyle = grad(x, 0, FLOOR, '#FFF1D6', '#F7DDB0'); x.fillRect(0, 0, WW, FLOOR);
  R(x, 0, 1090, WW, 20, '#C9A66B');
  for (let i = 0; i < 3; i++) { paint(x, c => roundRect(c, 200 + i * 330, 260, 250, 400, 12), '#BFE4FA', { lw: 8 }); line(x, [[325 + i * 330, 260], [325 + i * 330, 660]], 5, OL); }
  paint(x, c => roundRect(c, 1680, 200, 900, 130, 24), '#7A2432', { lw: 8 }); x.fillStyle = '#F2C744'; x.font = `800 66px ${F.EN}`; x.textAlign = 'center'; x.fillText('BREAKFAST 7:00 - 10:00', 2130, 290);
  // buffet counter (long)
  paint(x, c => roundRect(c, 1420, 1010, 1380, 410, 20), '#8B5A3A', { shade: '#6B4228', sx: 0, sy: -10, lw: 9 });
  paint(x, c => roundRect(c, 1400, 985, 1420, 44, 12), '#E3C08B', { lw: 8 });
  // tables far left
  for (const X of [300, 760]) { paint(x, c => roundRect(c, X, 1190, 300, 30, 10), '#FFFFFF', { lw: 7 }); line(x, [[X + 150, 1220], [X + 150, 1400]], 12, OL); line(x, [[X + 70, 1400], [X + 230, 1400]], 10, OL); for (const dx of [-40, 340]) paint(x, c => roundRect(c, X + dx, 1250, 60, 150, 10), '#2E6FD8', { lw: 6 }); }
  floorTiles(x, '#E9D6B4', '#D8C09A', 200);
});
const BUF = [[1500, 'croissant'], [1630, 'toast'], [1760, 'fruit'], [1890, 'egg'], [2020, 'juice'], [2150, 'cake'], [2280, 'bread'], [2410, 'jam'], [2540, 'croissant'], [2670, 'toast']];
function food(x, kind, X, Y, s = 1) {
  x.save(); x.translate(X, Y); x.scale(s, s);
  if (kind === 'croissant') paint(x, c => { c.moveTo(-50, 0); c.quadraticCurveTo(-30, -60, 0, -50); c.quadraticCurveTo(30, -60, 50, 0); c.quadraticCurveTo(0, -16, -50, 0); c.closePath(); }, '#E8A04A', { shade: '#C9812E', sx: 0, sy: -5, lw: 6 });
  else if (kind === 'toast') { paint(x, c => roundRect(c, -40, -64, 80, 64, 16), '#F2B05A', { lw: 6 }); paint(x, c => roundRect(c, -28, -52, 56, 40, 10), '#FFE3A8', { lw: 3 }); }
  else if (kind === 'fruit') { for (const [dx, col] of [[-26, '#E5484D'], [10, '#FF9D2F'], [38, '#6FC96A']]) { x.fillStyle = col; x.beginPath(); x.arc(dx, -22, 24, 0, 7); x.fill(); x.lineWidth = 5; x.strokeStyle = OL; x.stroke(); } }
  else if (kind === 'egg') { paint(x, c => c.ellipse(0, -20, 46, 24, 0, 0, 7), '#FFFFFF', { lw: 6 }); x.fillStyle = '#FFC93C'; x.beginPath(); x.arc(0, -22, 16, 0, 7); x.fill(); }
  else if (kind === 'juice') { paint(x, c => roundRect(c, -22, -92, 44, 92, 8), '#FFB347', { lw: 6 }); paint(x, c => roundRect(c, -26, -92, 52, 18, 6), '#FFFFFF', { lw: 4 }); }
  else if (kind === 'cake') { paint(x, c => roundRect(c, -48, -50, 96, 50, 10), '#F7C2D8', { lw: 6 }); x.fillStyle = '#E5484D'; x.beginPath(); x.arc(0, -58, 12, 0, 7); x.fill(); }
  else if (kind === 'bread') paint(x, c => roundRect(c, -56, -50, 112, 50, 24), '#D9A05B', { shade: '#B67E3C', sx: 0, sy: -5, lw: 6 });
  else if (kind === 'jam') { paint(x, c => roundRect(c, -28, -52, 56, 52, 10), '#B3263A', { lw: 6 }); paint(x, c => roundRect(c, -30, -64, 60, 16, 5), '#F2C744', { lw: 5 }); }
  x.restore();
}
module.exports = { entrance, lobby, desk4, liftWall, liftInterior, corridor4, room, acUnit, restaurant, food, BUF, plant, clockFace, DOOR, LIFT, WW, HH, FLOOR, RES };
