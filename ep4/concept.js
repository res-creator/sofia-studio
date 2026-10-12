// Ep4 "Gus at the Hotel" concept stills: node ep4/concept.js outdir
require('../lib/fonts');
const fs = require('fs');
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
const { drawSofia } = require('../lib/sofia');
const { drawGus } = require('../lib/gus');
const { drawCrew } = require('../lib/crew');
const { paint, line, roundRect } = require('../lib/draw');
const U = require('../lib/ui');
const F = require('../lib/fonts');
const W = 1920, H = 1080, FL = 900;
const rect = (c, x, y, w, h, f) => { c.fillStyle = f; c.fillRect(x, y, w, h); };
const smile = { smile: 0.9, open: 0.15 };

function lobby(c) {
  rect(c, 0, 0, W, FL, '#F4E4C8'); rect(c, 0, FL, W, H - FL, '#B8704A');
  for (let i = 0; i < 20; i++) rect(c, i * 100, FL, 4, H - FL, '#9C5A3A');
  rect(c, 0, 760, W, 14, '#C9A66B');
  // window with palm
  paint(c, q => roundRect(q, 1250, 140, 520, 420, 18), '#BFE4FA', { lw: 8 });
  rect(c, 1500, 146, 8, 408, '#fff'); rect(c, 1256, 340, 508, 8, '#fff');
  // sign + clock
  paint(c, q => roundRect(q, 380, 90, 700, 120, 24), '#7A2432', { lw: 8 });
  c.fillStyle = '#F2C744'; c.font = `800 64px ${F.EN}`; c.textAlign = 'center'; c.fillText('GRAND HOTEL', 730, 172);
  for (let k = 0; k < 3; k++) { c.fillStyle = '#F2C744'; c.beginPath(); c.arc(430 + k * 300, 250, 6, 0, 7); c.fill(); }
  // key rack behind desk
  paint(c, q => roundRect(q, 150, 330, 360, 300, 14), '#5A3A26', { lw: 6 });
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { rect(c, 180 + k * 54, 370 + r * 90, 6, 40, '#F2C744'); c.fillStyle = '#F2C744'; c.beginPath(); c.arc(183 + k * 54, 420 + r * 90, 9, 0, 7); c.fill(); }
  // plant
  paint(c, q => roundRect(q, 1700, 800, 110, 100, 8), '#C9693F', { lw: 6 });
  for (let k = 0; k < 5; k++) paint(c, q => { q.ellipse(1755 + (k - 2) * 38, 740 - Math.abs(k - 2) * 20, 28, 80, (k - 2) * 0.4, 0, 7); }, '#3FA45B', { lw: 5 });
}
function lobbyFront(c) { // reception desk + bell + key card
  paint(c, q => roundRect(q, 120, 700, 700, 260, 20), '#7A4A2E', { shade: '#5E3822', sx: 0, sy: -10, lw: 8 });
  rect(c, 120, 700, 700, 30, '#D9B27C'); c.strokeStyle = '#2B1B12'; c.lineWidth = 6; c.strokeRect(120, 700, 700, 30);
  paint(c, q => { q.arc(660, 690, 34, Math.PI, 0); q.closePath(); }, '#F2C744', { lw: 6 });
  paint(c, q => roundRect(q, 620, 684, 80, 14, 5), '#C79A2A', { lw: 5 });
  paint(c, q => roundRect(q, 470, 676, 80, 50, 8), '#fff', { lw: 5 });
  rect(c, 470, 690, 80, 12, '#2B6FD8');
}
function room(c) {
  rect(c, 0, 0, W, FL, '#DCE9F5'); rect(c, 0, FL, W, H - FL, '#9A7A5E');
  for (let i = 0; i < 12; i++) rect(c, i * 170, FL, 5, H - FL, '#7A5C44');
  // bed
  paint(c, q => roundRect(q, 160, 520, 760, 90, 20), '#7A4A2E', { lw: 8 });
  paint(c, q => roundRect(q, 180, 640, 720, 250, 26), '#fff', { shade: '#DDE6F0', sx: 0, sy: -12, lw: 8 });
  paint(c, q => roundRect(q, 180, 740, 720, 150, 26), '#5B8FD8', { shade: '#4472B8', sx: 0, sy: -10, lw: 8 });
  paint(c, q => roundRect(q, 220, 600, 190, 90, 40), '#fff', { lw: 6 }); paint(c, q => roundRect(q, 450, 600, 190, 90, 40), '#fff', { lw: 6 });
  // window w/ curtains
  paint(c, q => roundRect(q, 1180, 150, 420, 380, 12), '#BFE4FA', { lw: 8 });
  paint(c, q => roundRect(q, 1150, 130, 120, 430, 18), '#C8323A', { lw: 6 }); paint(c, q => roundRect(q, 1510, 130, 120, 430, 18), '#C8323A', { lw: 6 });
  // AC unit (broken: warm red light, sweat drops)
  paint(c, q => roundRect(q, 1120, 150, 400, 110, 24), '#F5F7FA', { shade: '#D5DCE6', sx: 0, sy: -8, lw: 8 });
  for (let k = 0; k < 6; k++) rect(c, 1150 + k * 54, 215, 40, 8, '#9AA5B5');
  c.fillStyle = '#E5484D'; c.beginPath(); c.arc(1480, 185, 10, 0, 7); c.fill();
  c.fillStyle = '#6EC3F2'; for (const [x, y] of [[1240, 290], [1350, 320]]) { c.beginPath(); c.moveTo(x, y - 24); c.quadraticCurveTo(x + 16, y + 6, x, y + 12); c.quadraticCurveTo(x - 16, y + 6, x, y - 24); c.fill(); }
  // thermometer sign
  paint(c, q => roundRect(q, 1700, 300, 90, 260, 30), '#fff', { lw: 6 }); rect(c, 1738, 330, 14, 160, '#E5484D'); c.fillStyle = '#E5484D'; c.beginPath(); c.arc(1745, 510, 22, 0, 7); c.fill();
  c.fillStyle = '#2B1B12'; c.font = `800 44px ${F.EN}`; c.textAlign = 'center'; c.fillText('35°', 1745, 620);
  // door with 404
  paint(c, q => roundRect(q, 1680, 640, 200, 260, 10), '#7A4A2E', { lw: 8 });
  paint(c, q => roundRect(q, 1720, 690, 120, 50, 8), '#F2C744', { lw: 5 }); c.fillStyle = '#2B1B12'; c.font = `800 38px ${F.EN}`; c.fillText('404', 1780, 727);
}
function title(c, txt) { U.textOutlined(c, txt, W / 2, 84, 60, '#FFD23F', { olw: 12 }); }
function save(name, fn) { const cv = createCanvas(W, H), c = cv.getContext('2d'); fn(c); fs.writeFileSync(name, cv.toBuffer('image/png')); return cv; }

const out = process.argv[2] || 'ep4';
fs.mkdirSync(out, { recursive: true });
const sofia = (c, x, s = 0.7, p = {}) => drawSofia(c, x, FL - 262 * s, s, Object.assign({ mouth: smile }, p));
const lupe = {};
const cast = save(`${out}/ep4_cast.png`, c => {
  rect(c, 0, 0, W, H, '#F4E4C8'); rect(c, 0, 930, W, 150, '#B8704A');
  const F0 = 930;
  drawSofia(c, 260, F0 - 262 * 0.66, 0.66, { turn: 0.15, mouth: smile, armR: [150, -150], handR: 'open' });
  drawGus(c, 640, F0, 0.84, { face: 1, lids: 0.55, look: 0.3 });
  drawCrew(c, 1060, F0 - 280 * 0.66, 0.66, { mouth: smile, armR: [130, -140], handR: 'open', turn: -0.1 }, 'carmen');
  drawCrew(c, 1480, F0 - 280 * 0.66, 0.66, { mouth: smile, armL: [-120, -150], handL: 'open', turn: 0.1 }, 'pablo');
  for (const [x, n] of [[260, 'SOFIA'], [640, 'GUS'], [1060, 'CARMEN'], [1480, 'PABLO']]) U.textOutlined(c, n, x, 1030, 48, '#FFFFFF', { olw: 10 });
  U.textOutlined(c, 'Episode 4 · Gus at the Hotel', 960, 84, 60, '#FFD23F', { olw: 12 });
  U.textOutlined(c, 'receptionist', 1060, 150, 32, '#7A2432', { olw: 0 }); U.textOutlined(c, 'bellboy', 1480, 150, 32, '#7A2432', { olw: 0 });
});
save(`${out}/ep4_lobby.png`, c => {
  lobby(c);
  drawCrew(c, 430, FL - 280 * 0.7 - 30, 0.7, { mouth: smile, armR: [140, -150], handR: 'open', turn: 0.2 }, 'carmen');
  lobbyFront(c);
  drawSofia(c, 1000, FL - 262 * 0.7, 0.7, { mouth: smile, turn: -0.2 });
  drawGus(c, 1330, FL, 0.8, { face: -1, lids: 0.6, look: -0.3 });
  U.textOutlined(c, 'Can I have a key card, please?', W / 2, 1010, 54, '#FFFFFF', { olw: 12 });
});
save(`${out}/ep4_room.png`, c => {
  room(c);
  drawSofia(c, 1000, FL - 262 * 0.7, 0.7, { mouth: { smile: -0.3, open: 0.2 }, turn: 0.1 });
  drawGus(c, 1450, FL, 0.8, { face: -1, lids: 0.8, look: 0.2, squash: 0.97 });
  U.textOutlined(c, "The air conditioning doesn't work.", W / 2, 1010, 54, '#FFFFFF', { olw: 12 });
});
// combined sheet (half-size tiles)
const S = createCanvas(W, H * 3 / 2 + 0), sc = S.getContext('2d');
sc.fillStyle = '#fff'; sc.fillRect(0, 0, W, S.height);
fs.writeFileSync(`${out}/ok.txt`, 'ok');
