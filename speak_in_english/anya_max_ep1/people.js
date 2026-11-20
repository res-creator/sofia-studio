// New hand-drawn cast for «Аня и Макс. Вьетнам»: Anya, Max, a delivery courier, a market seller.
// Same brush kit and body plan as cast.js (shoulders sy=1215, head hy≈960, feet ≈1690 at by=0).
const K = require('./hand_kit');
const CA = require('./cast');
const {draw: DR, stroke, curve, spot, potato: P, tube} = K;

function face(hx, hy, st, o) {
  for (const s of [-1, 1]) DR(P(hx + s * (o.fw + 6), hy + 34, 18, 26, o.seed + 1 + s, .15), {fill: o.skin, shade: o.skinS, seed: o.seed + 3 + s, lw: 6});
  DR(P(hx, hy + 22, o.fw, o.fh, o.seed + 5, .05), {fill: o.skin, shade: o.skinS, shadeDir: [16, 12], seed: o.seed + 6, lw: 8});
}
function cheeks(hx, hy, col) { spot(hx - 96, hy + 82, 34, 20, col); spot(hx + 96, hy + 82, 34, 20, col); }

// ---------------- Anya: chestnut high ponytail with bangs, freckles, lilac sundress, sandals ----------------
const AN = {skin: '#ffd6b8', skinS: '#f2a882', hair: '#8a4b2a', hairS: '#6a3218', hairL: '#b8703f', dress: '#c9a7ff', dressS: '#a682ec', iris: '#4a7a3a', brow: '#6a3218', lips: '#e0566e'};
function anya(st) {
  const p = AN, x = st.x, by = st.by || 0, sy = 1215 + by, hy = 960 + by;
  CA.legs(x, 1470, 1690, p.skin, p.skinS, '#f2d2a0', '#d8b070', 1500, 40);
  // ponytail behind the head
  const sw = Math.sin((st.t || 0) * 3) * 10;
  for (let k = 4; k >= 0; k--) { const u = k / 4, px = x + 150 + u * 70 + sw * u, py = hy - 150 + u * 280, r = 70 - u * 34; DR(P(px, py, r, r * 1.15, 1510 + k, .08), {fill: p.hair, shade: p.hairS, seed: 1515 + k, lw: 7}); }
  // sundress
  DR([[x - 80, sy - 20], [x + 80, sy - 20], [x + 92, sy + 160], [x + 150, 1480], [x - 150, 1484], [x - 92, sy + 160]], {fill: p.dress, shade: p.dressS, seed: 1520, lw: 8});
  for (const s of [-1, 1]) stroke([[x + s * 50, sy - 20], [x + s * 44, sy - 70]], 6, 1522 + s);
  for (let k = 0; k < 7; k++) spot(x - 110 + k * 36, 1400 + (k % 2) * 30, 8, 8, 'rgba(255,255,255,0.7)');
  CA.arms(st, x, sy, p.skin, p.skinS, p.skin, p.skinS, 1530, 36, 30);
  DR(tube([[x, hy + 120], [x, sy - 20]], 44, 50), {fill: p.skinS, seed: 1540, lw: 6});
  face(x, hy, st, {fw: 140, fh: 150, skin: p.skin, skinS: p.skinS, seed: 1550});
  // hair cap + bangs
  DR([[x - 150, hy + 10], [x - 156, hy - 70], [x - 112, hy - 146], [x - 40, hy - 180], [x + 40, hy - 182], [x + 112, hy - 150], [x + 156, hy - 72], [x + 150, hy + 10], [x + 132, hy - 50], [x + 90, hy - 70], [x + 40, hy - 64], [x, hy - 80], [x - 44, hy - 62], [x - 90, hy - 74], [x - 130, hy - 50]], {fill: p.hair, shade: p.hairS, shadeDir: [0, 12], seed: 1560, lw: 8});
  stroke([[x - 60, hy - 150], [x, hy - 166], [x + 60, hy - 152]], 5, 1561);
  DR(P(x + 120, hy - 150, 22, 18, 1562), {fill: '#ff8fb0', seed: 1563, lw: 5});
  cheeks(x, hy, 'rgba(255,90,120,0.38)');
  for (const [a, b] of [[-80, 66], [-64, 80], [-96, 82], [80, 66], [64, 80], [96, 82]]) spot(x + a, hy + b, 4, 4, 'rgba(160,90,50,0.8)');
  CA.eyes(x, hy + 16, st, {dx: 56, rx: 28, ry: 32, iris: p.iris, lashes: true, brow: p.brow, browW: 6, skin: p.skin});
  stroke([[x + 2, hy + 44], [x - 8, hy + 72], [x + 8, hy + 74]], 5, 1570);
  CA.mouth(x, hy + 110, st, p.lips, 1571);
}

// ---------------- Max: dark hair, short beard, round glasses, headphones, grey tee, khaki shorts ----------------
const MX = {skin: '#f5c29a', skinS: '#e09a70', hair: '#2a1e1a', hairS: '#160e0b', tee: '#9aa8b8', teeS: '#7a889a', shorts: '#c8a46a', shortsS: '#a5823f', iris: '#3a5a8a'};
function max(st) {
  const p = MX, x = st.x, by = st.by || 0, sy = 1205 + by, hy = 930 + by;
  CA.legs(x, 1480, 1690, p.skin, p.skinS, '#3a3a44', '#22222a', 1600, 48);
  DR([[x - 136, 1430], [x + 136, 1426], [x + 140, 1560], [x + 10, 1562], [x, 1520], [x - 10, 1562], [x - 140, 1564]], {fill: p.shorts, shade: p.shortsS, seed: 1605, lw: 7});
  DR([[x - 104, sy - 25], [x + 104, sy - 25], [x + 136, 1460], [x - 134, 1464]], {fill: p.tee, shade: p.teeS, seed: 1610, lw: 8});
  CA.arms(st, x, sy, p.tee, p.teeS, p.skin, p.skinS, 1630, 44, 36);
  DR(tube([[x, hy + 140], [x, sy - 20]], 58, 64), {fill: p.skinS, seed: 1640, lw: 6});
  // headphones round the neck
  if (!st.phonesOn) DR(P(x, sy - 30, 96, 30, 1641, .05), {lw: 12, seed: 1642, col: '#2b2b33'});
  face(x, hy, st, {fw: 128, fh: 158, skin: p.skin, skinS: p.skinS, seed: 1650});
  // beard
  DR([[x - 124, hy + 30], [x - 110, hy + 120], [x - 60, hy + 172], [x, hy + 186], [x + 60, hy + 172], [x + 110, hy + 120], [x + 124, hy + 30], [x + 96, hy + 90], [x + 40, hy + 96], [x, hy + 90], [x - 40, hy + 96], [x - 96, hy + 90]], {fill: p.hair, shade: p.hairS, seed: 1660, lw: 6});
  DR([[x - 130, hy - 20], [x - 136, hy - 100], [x - 96, hy - 170], [x - 20, hy - 196], [x + 60, hy - 190], [x + 120, hy - 140], [x + 136, hy - 60], [x + 128, hy - 10], [x + 110, hy - 80], [x + 40, hy - 110], [x - 30, hy - 104], [x - 100, hy - 80]], {fill: p.hair, shade: p.hairS, shadeDir: [0, 12], seed: 1661, lw: 8});
  cheeks(x, hy, 'rgba(255,90,110,0.25)');
  CA.eyes(x, hy + 10, st, {dx: 50, rx: 25, ry: 29, iris: p.iris, lashes: false, brow: p.hair, browW: 9, skin: p.skin});
  for (const s of [-1, 1]) DR(P(x + s * 50, hy + 10, 42, 40, 1670 + s, .03), {lw: 6, seed: 1672 + s, col: '#2b2b33'});
  stroke([[x - 10, hy + 6], [x + 10, hy + 6]], 6, 1674);
  DR(P(x + 4, hy + 60, 18, 24, 1675, .14), {fill: p.skinS, seed: 1676, lw: 6});
  CA.mouth(x, hy + 116, st, null, 1677);
  if (st.phonesOn) { DR(P(x, hy - 120, 160, 120, 1678, .03).filter(([, y]) => y < hy - 60), {closed: false, lw: 14, seed: 1679, col: '#2b2b33'}); for (const s of [-1, 1]) DR(P(x + s * 142, hy + 10, 34, 50, 1680 + s, .06), {fill: '#3a3a44', seed: 1682 + s, lw: 6}); }
}

// ---------------- Courier: orange jacket and helmet, huge grin ----------------
const CO = {skin: '#e8b08a', skinS: '#cc8c62', jacket: '#ff8a2a', jacketS: '#e06a10', iris: '#3a2620'};
function courier(st) {
  const p = CO, x = st.x, by = st.by || 0, sy = 1210 + by, hy = 950 + by;
  CA.legs(x, 1470, 1690, '#3a4866', '#27324a', '#4a3428', '#2f2018', 1700, 48);
  DR([[x - 110, sy - 25], [x + 110, sy - 25], [x + 140, 1490], [x - 138, 1494]], {fill: p.jacket, shade: p.jacketS, seed: 1710, lw: 8});
  stroke([[x, sy - 10], [x, 1480]], 5, 1711);
  CA.arms(st, x, sy, p.jacket, p.jacketS, p.skin, p.skinS, 1720, 46, 38);
  DR(tube([[x, hy + 130], [x, sy - 20]], 56, 62), {fill: p.skinS, seed: 1730, lw: 6});
  face(x, hy, st, {fw: 132, fh: 150, skin: p.skin, skinS: p.skinS, seed: 1740});
  DR([[x - 150, hy - 10], [x - 150, hy - 110], [x - 90, hy - 182], [x, hy - 200], [x + 90, hy - 182], [x + 150, hy - 110], [x + 150, hy - 10], [x + 120, hy - 40], [x - 120, hy - 40]], {fill: p.jacket, shade: p.jacketS, seed: 1750, lw: 8});
  DR([[x - 160, hy - 30], [x + 160, hy - 30], [x + 150, hy - 6], [x - 150, hy - 6]], {fill: '#fff3e0', seed: 1751, lw: 5});
  cheeks(x, hy, 'rgba(255,90,110,0.25)');
  CA.eyes(x, hy + 30, st, {dx: 50, rx: 24, ry: 26, iris: p.iris, lashes: false, brow: '#2a1e1a', browW: 8, skin: p.skin});
  DR(P(x + 2, hy + 74, 18, 22, 1760, .14), {fill: p.skinS, seed: 1761, lw: 6});
  CA.mouth(x, hy + 118, st, null, 1762);
}
function riceSack(x, y, s = 1) {
  const g = K.g; g.save(); g.translate(x, y); g.scale(s, s);
  DR([[-120, -300], [120, -300], [150, -40], [140, 0], [-140, 0], [-150, -40]], {fill: '#f4ead2', shade: '#dccca6', seed: 1770, lw: 8});
  DR([[-130, -300], [-60, -340], [0, -310], [60, -344], [130, -300]], {closed: false, lw: 7, seed: 1771});
  K.hand('RICE', 0, -200, 70, '#c0283a'); K.hand('20 KG', 0, -120, 76, '#251c1a');
  g.restore();
}

// ---------------- Market seller: conical hat, flowered blouse, apron ----------------
const SE = {skin: '#e9b48e', skinS: '#cf9068', blouse: '#5fb7e8', blouseS: '#3f93c8', apron: '#ffe08a', apronS: '#e8bf50', hair: '#1e1614', iris: '#2a1e1a'};
function seller(st) {
  const p = SE, x = st.x, by = st.by || 0, sy = 1220 + by, hy = 970 + by;
  CA.legs(x, 1480, 1690, '#4a3a5a', '#33263f', '#c0283a', '#90181f', 1800, 46);
  DR([[x - 106, sy - 25], [x + 106, sy - 25], [x + 150, 1500], [x - 148, 1504]], {fill: p.blouse, shade: p.blouseS, seed: 1810, lw: 8});
  for (let k = 0; k < 9; k++) spot(x - 100 + (k % 3) * 90 + (k > 2 ? 20 : 0), sy + 40 + Math.floor(k / 3) * 90, 12, 12, 'rgba(255,255,255,0.8)');
  DR([[x - 90, sy + 130], [x + 90, sy + 130], [x + 120, 1500], [x - 118, 1502]], {fill: p.apron, shade: p.apronS, seed: 1811, lw: 6});
  CA.arms(st, x, sy, p.blouse, p.blouseS, p.skin, p.skinS, 1820, 44, 36);
  DR(tube([[x, hy + 120], [x, sy - 20]], 50, 56), {fill: p.skinS, seed: 1830, lw: 6});
  DR(P(x, hy - 10, 160, 150, 1831, .05), {fill: p.hair, shade: '#0e0a09', seed: 1832, lw: 7});
  face(x, hy, st, {fw: 138, fh: 146, skin: p.skin, skinS: p.skinS, seed: 1840});
  cheeks(x, hy, 'rgba(255,90,110,0.35)');
  CA.eyes(x, hy + 20, st, {dx: 54, rx: 24, ry: 26, iris: p.iris, lashes: true, brow: p.hair, browW: 7, skin: p.skin});
  stroke([[x + 2, hy + 48], [x - 8, hy + 74], [x + 8, hy + 76]], 5, 1850);
  CA.mouth(x, hy + 112, st, '#d9566b', 1851);
  // conical hat (nón lá)
  DR([[x - 250, hy - 70], [x, hy - 290], [x + 250, hy - 70], [x, hy - 40]], {fill: '#f2d892', shade: '#d8b860', seed: 1860, lw: 8});
  for (let k = 1; k < 4; k++) stroke([[x - 250 + k * 62, hy - 70 - k * 55], [x + 250 - k * 62, hy - 70 - k * 55]], 3, 1861 + k);
}
module.exports = {anya, max, courier, seller, riceSack, AN, MX};
