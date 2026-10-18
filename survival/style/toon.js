// Style test D: bright TV-cartoon look (thick ink, flat colours, big eyes, overbite) with our own characters.
// Usage: node toon.js -> toon.png
const { createCanvas } = require('../node_modules/@napi-rs/canvas');
require('../lib');
const W = 1920, H = 1080, INK = '#14110f';
const c = createCanvas(W, H), x = c.getContext('2d');
x.lineJoin = 'round'; x.lineCap = 'round';
function ol(path, fill, lw = 7) { x.beginPath(); path(); if (fill) { x.fillStyle = fill; x.fill(); } x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); }
function E(cx, cy, rx, ry, r = 0) { x.ellipse(cx, cy, rx, ry, r, 0, Math.PI * 2); }
function R(a, b, w, h, r) { x.roundRect(a, b, w, h, r); }
function limb(pts, w, col) { // thick inked tube along points
  for (const [lw, cc] of [[w + 14, INK], [w, col]]) { x.beginPath(); x.moveTo(...pts[0]); pts.slice(1).forEach(p => x.lineTo(...p)); x.lineWidth = lw; x.strokeStyle = cc; x.stroke(); }
}

// ---- room ----
x.fillStyle = '#c7a2d8'; x.fillRect(0, 0, W, H);                       // lilac wall
x.fillStyle = '#b48fc6'; for (let i = 0; i < W; i += 140) x.fillRect(i, 0, 18, 860);  // stripes
x.fillStyle = '#7fb7a0'; x.fillRect(0, 860, W, 220); ol(() => { x.moveTo(0, 860); x.lineTo(W, 860); }, null, 7);  // carpet
ol(() => R(1480, 250, 280, 200, 10), '#f4e7b8'); ol(() => { x.moveTo(1500, 430); x.lineTo(1580, 330); x.lineTo(1640, 400); x.lineTo(1680, 360); x.lineTo(1740, 430); x.closePath(); }, '#8fc2e8', 5); // painting
ol(() => R(1560, 690, 260, 34, 8), '#d7864a'); ol(() => R(1580, 724, 24, 140, 6), '#c47438'); ol(() => R(1776, 724, 24, 140, 6), '#c47438'); // table
ol(() => { x.moveTo(1610, 690); x.lineTo(1630, 600); x.lineTo(1690, 600); x.lineTo(1710, 690); x.closePath(); }, '#f2d36b'); // lamp
ol(() => R(1655, 560, 10, 40, 4), INK, 3);

// ---- the hallway beyond the door gap, Gary in the gap ----
ol(() => R(200, 150, 520, 740, 6), '#e9dcc0', 8);                      // door frame
x.fillStyle = '#3b2f45'; x.fillRect(560, 180, 140, 710);               // dark gap (door ajar)
// Gary: half his face in the gap, mug held up
x.save(); x.beginPath(); x.rect(560, 180, 140, 710); x.clip();
ol(() => E(660, 430, 120, 140), '#b9c69a');                            // grey-green head
x.strokeStyle = INK; x.lineWidth = 5; for (const k of [0, 1, 2]) { x.beginPath(); x.moveTo(590 + k * 30, 300); x.quadraticCurveTo(640 + k * 25, 270, 700 + k * 10, 300); x.stroke(); } // comb-over strands
ol(() => E(628, 400, 44, 50), '#fff', 6); x.fillStyle = INK; x.beginPath(); E(612, 408, 8, 8); x.fill();   // one huge eye
x.fillStyle = '#c94a3c'; x.beginPath(); x.ellipse(628, 400, 44, 50, 0, Math.PI * 1.05, Math.PI * 1.35); x.lineTo(628, 400); x.fill(); // bloodshot corner
ol(() => { x.moveTo(570, 490); x.quadraticCurveTo(630, 560, 700, 500); x.lineTo(700, 520); x.quadraticCurveTo(630, 590, 572, 512); x.closePath(); }, '#fff', 6); // creepy grin
x.lineWidth = 4; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(585 + i * 24, 500 + Math.abs(i - 2) * 4); x.lineTo(585 + i * 24, 540); x.stroke(); }
x.fillStyle = 'rgba(80,90,60,0.35)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(585 + (i * 37) % 110, 560 + (i * 13) % 40, 2.5, 0, 7); x.fill(); } // stubble
ol(() => { x.moveTo(600, 600); x.lineTo(700, 600); x.lineTo(700, 900); x.lineTo(590, 900); x.closePath(); }, '#e8e4d8'); // vest
x.restore();
// door leaf (open towards the gap) + chain across the gap
ol(() => R(230, 180, 330, 710, 4), '#e07a4f', 8);
ol(() => R(270, 230, 250, 250, 8), '#cf6a40', 5); ol(() => R(270, 530, 250, 300, 8), '#cf6a40', 5);
ol(() => E(530, 560, 18, 18), '#f2d36b', 5);
x.strokeStyle = '#d9d9d9'; x.lineWidth = 9; x.setLineDash([16, 8]); x.beginPath(); x.moveTo(548, 420); x.quadraticCurveTo(620, 470, 700, 430); x.stroke(); x.setLineDash([]);
ol(() => E(700, 430, 9, 9), '#bbb', 4);

// mug in front of the gap: mug body first, then fingers wrapped over it (no hand through the mug)
ol(() => R(590, 600, 96, 110, 14), '#f7f3ea');
ol(() => { x.arc(590, 655, 26, Math.PI * 0.5, Math.PI * 1.5); }, null, 14); x.strokeStyle = '#f7f3ea'; x.lineWidth = 7; x.beginPath(); x.arc(590, 655, 26, Math.PI * 0.55, Math.PI * 1.45); x.stroke();
x.fillStyle = '#d6413a'; x.font = '26px Anton'; x.textAlign = 'center'; x.fillText('SUGAR?', 638, 666);
for (let i = 0; i < 4; i++) ol(() => R(664, 606 + i * 25, 40, 23, 11), '#b9c69a', 5);      // four fingers on the front
ol(() => R(650, 588, 20, 44, 10), '#b9c69a', 5);                                              // thumb on top
// ---- hero: big eyes, overbite, hoodie, baseball bat raised with both hands ----
const hx = 1230;
// legs + sneakers
limb([[hx - 20, 700], [hx - 50, 790], [hx - 60, 900]], 38, '#4466a8'); limb([[hx + 30, 700], [hx + 60, 800], [hx + 70, 900]], 38, '#4466a8');
ol(() => { x.moveTo(hx - 110, 925); x.quadraticCurveTo(hx - 110, 885, hx - 60, 885); x.quadraticCurveTo(hx - 20, 885, hx - 20, 925); x.closePath(); }, '#f4f4f4');
ol(() => { x.moveTo(hx + 30, 925); x.quadraticCurveTo(hx + 30, 885, hx + 75, 885); x.quadraticCurveTo(hx + 120, 885, hx + 120, 925); x.closePath(); }, '#f4f4f4');
// bat behind the head, held by both hands at the handle near the right shoulder
x.save(); x.translate(hx + 100, 470); x.rotate(-1.15);
ol(() => { x.moveTo(-10, -9); x.lineTo(250, -26); x.quadraticCurveTo(290, 0, 250, 26); x.lineTo(-10, 9); x.closePath(); }, '#d9a25a'); ol(() => E(-14, 0, 8, 13), '#c08a44', 5);
x.restore();
// body (hoodie)
ol(() => { x.moveTo(hx - 95, 470); x.quadraticCurveTo(hx, 420, hx + 95, 470); x.lineTo(hx + 80, 720); x.quadraticCurveTo(hx, 740, hx - 80, 720); x.closePath(); }, '#e9a92a');
ol(() => { x.moveTo(hx - 70, 640); x.lineTo(hx + 70, 640); x.lineTo(hx + 60, 700); x.lineTo(hx - 60, 700); x.closePath(); }, '#d4951f', 5); // pocket
x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(hx - 18, 470); x.lineTo(hx - 22, 540); x.moveTo(hx + 18, 470); x.lineTo(hx + 22, 540); x.stroke();
// arms up to the bat handle (both hands on it)
limb([[hx - 80, 490], [hx - 40, 590], [hx + 70, 500]], 34, '#e9a92a');
limb([[hx + 80, 490], [hx + 120, 560], [hx + 100, 470]], 34, '#e9a92a');
const fist = (fx, fy) => { ol(() => E(fx, fy, 30, 26), '#f2c9a0'); x.strokeStyle = INK; x.lineWidth = 4; for (const k of [-12, 0, 12]) { x.beginPath(); x.moveTo(fx + k, fy - 20); x.lineTo(fx + k, fy - 6); x.stroke(); } };
fist(hx + 82, 490); fist(hx + 108, 455);
// neck + head
ol(() => R(hx - 22, 380, 44, 60, 14), '#f2c9a0');
ol(() => { x.moveTo(hx - 80, 300); x.quadraticCurveTo(hx - 82, 180, hx, 175); x.quadraticCurveTo(hx + 82, 180, hx + 80, 300); x.quadraticCurveTo(hx + 82, 400, hx, 410); x.quadraticCurveTo(hx - 84, 400, hx - 80, 300); x.closePath(); }, '#f2c9a0');
// hair spikes
ol(() => { x.moveTo(hx - 82, 260); x.lineTo(hx - 90, 190); x.lineTo(hx - 50, 205); x.lineTo(hx - 40, 150); x.lineTo(hx, 190); x.lineTo(hx + 30, 140); x.lineTo(hx + 50, 195); x.lineTo(hx + 95, 175); x.lineTo(hx + 82, 255); x.quadraticCurveTo(hx, 215, hx - 82, 260); x.closePath(); }, '#4a3020');
// huge eyes looking at the door, glasses, sweat
ol(() => E(hx - 48, 290, 38, 42), '#fff'); ol(() => E(hx + 46, 290, 38, 42), '#fff');
x.fillStyle = INK; x.beginPath(); E(hx - 74, 296, 8, 8); x.fill(); x.beginPath(); E(hx + 20, 296, 8, 8); x.fill();
x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); E(hx - 48, 290, 46, 48); x.stroke(); x.beginPath(); E(hx + 46, 290, 46, 48); x.stroke(); x.beginPath(); x.moveTo(hx - 4, 284); x.lineTo(hx + 2, 284); x.stroke();
ol(() => { x.moveTo(hx - 6, 300); x.quadraticCurveTo(hx - 60, 330, hx - 30, 352); x.quadraticCurveTo(hx - 10, 354, hx + 2, 340); }, '#f2c9a0', 6); // nose
ol(() => { x.moveTo(hx - 40, 372); x.quadraticCurveTo(hx, 392, hx + 40, 368); x.quadraticCurveTo(hx, 378, hx - 40, 372); }, '#fff', 5); // nervous overbite
ol(() => { x.moveTo(hx + 96, 230); x.quadraticCurveTo(hx + 116, 262, hx + 100, 272); x.quadraticCurveTo(hx + 84, 262, hx + 96, 230); }, '#9fd6ff', 4); // sweat drop

// ---- text ----
x.save(); x.translate(260, 110); x.rotate(-0.05); ol(() => R(-170, -62, 340, 124, 10), '#fff7c2', 7); x.fillStyle = INK; x.font = '86px Anton'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DAY 2', 0, 4); x.restore();
x.font = '96px Anton'; x.textAlign = 'center'; x.lineWidth = 18; x.strokeStyle = INK; x.strokeText('GARY DOES NOT NEED SUGAR.', W / 2, 1020); x.fillStyle = '#fff'; x.fillText('GARY DOES NOT NEED SUGAR.', W / 2, 1020);
require('fs').writeFileSync(__dirname + '/toon.png', c.toBuffer('image/png'));
