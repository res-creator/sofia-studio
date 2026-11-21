// Backgrounds in the same TV-cartoon manner: soft pastel fills, thin dark outline, one flat shadow side, simple shapes.
const OUT = '#3a2f3a';
let g; const set = x => { g = x; };
const P = () => g.beginPath();
function fs(fill, lw = 4) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
const rr = (x, y, w, h, r, fill, lw = 4) => { P(); g.roundRect(x, y, w, h, r); fs(fill, lw); };
const ln = (pts, w = 4, col = OUT) => { P(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); };
function cloudTree(x, y, r, col, colS) { const b = [[0, 0, 1], [-.7, .25, .75], [.7, .3, .8], [-.35, -.45, .7], [.4, -.4, .75]];
  P(); b.forEach(([dx, dy, k]) => { g.moveTo(x + dx * r + k * r * .6, y + dy * r); g.arc(x + dx * r, y + dy * r, k * r * .6, 0, 7); }); g.fillStyle = col; g.fill();
  g.save(); g.clip(); g.fillStyle = colS; g.fillRect(x - r * 2, y + r * .15, r * 4, r * 2); g.restore();
  for (const [dx, dy] of [[-.3, -.2], [.35, .05], [-.1, .35]]) { P(); g.arc(x + dx * r, y + dy * r, r * .16, Math.PI * 1.1, Math.PI * 1.7); g.strokeStyle = 'rgba(60,40,30,0.35)'; g.lineWidth = 3; g.stroke(); } }
function building(x, yBase, w, h, wall, wallS, roof, win) {
  rr(x, yBase - h, w, h, 4, wall); g.fillStyle = wallS; g.fillRect(x + w - w * .12, yBase - h + 2, w * .12 - 2, h - 4);
  P(); g.moveTo(x - 14, yBase - h); g.lineTo(x + w * .2, yBase - h - 70); g.lineTo(x + w * .8, yBase - h - 70); g.lineTo(x + w + 14, yBase - h); g.closePath(); fs(roof);
  rr(x + w * .62, yBase - h - 120, 40, 60, 3, wall);
  const cols = Math.max(2, Math.round(w / 140)), rows = Math.max(2, Math.round(h / 170));
  for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols; c++) { const wx = x + (c + .5) * w / cols - 34, wy = yBase - h + 50 + r * (h - 120) / (rows - 1);
    rr(wx, wy, 68, 96, 4, win); ln([[wx + 34, wy], [wx + 34, wy + 96]], 3); rr(wx - 8, wy + 92, 84, 14, 3, wall); }
  rr(x + w / 2 - 50, yBase - 150, 100, 150, 6, '#7a5a8a'); }
// street with pastel houses, sky, trees
function street(t = 0) { const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#f6eed2'); gr.addColorStop(1, '#fbf6e6'); g.fillStyle = gr; g.fillRect(-1000, -1000, 3080, 2400);
  for (const [x, y, w] of [[120, 260, 220], [640, 180, 300], [300, 420, 160]]) rr(x + Math.sin(t * .2) * 10, y, w, 30, 15, 'rgba(200,220,200,0.6)', 0);
  building(-60, 1300, 360, 760, '#e8d07a', '#d4b860', '#6a7aa8', '#9aaee8'); building(320, 1300, 300, 900, '#c8d49a', '#b0bc80', '#5a6a98', '#8aa0e0');
  building(640, 1300, 440, 700, '#f0b070', '#d89a5a', '#7a6a9a', '#a8b8ee');
  cloudTree(40, 1000, 220, '#e8dc68', '#c8b84a'); ln([[40, 1120], [20, 1300]], 22, '#7a5a3a');
  g.fillStyle = '#c9c4d4'; g.fillRect(-1000, 1300, 3080, 220); ln([[-1000, 1300], [2080, 1300]]); g.fillStyle = '#8a8698'; g.fillRect(-1000, 1520, 3080, 1200); ln([[-1000, 1520], [2080, 1520]]);
  for (let x = -40; x < 1100; x += 160) ln([[x, 1300], [x - 40, 1520]], 3, 'rgba(60,50,70,0.3)'); }
// classroom in the same manner, seen from the back of the room
function classroom(t = 0, o = {}) { g.fillStyle = '#f4dcb0'; g.fillRect(-1000, -1000, 3080, 2200); g.fillStyle = '#ebcf9c'; for (let x = -1000; x < 2080; x += 120) g.fillRect(x, -1000, 50, 2200);
  g.fillStyle = '#c8a0c8'; g.fillRect(-1000, 1000, 3080, 200); ln([[-1000, 1000], [2080, 1000]]);
  // window with the street outside
  rr(700, 300, 330, 480, 8, '#ffffff', 5); g.save(); P(); g.rect(714, 314, 302, 452); g.clip(); g.fillStyle = '#cfe6f0'; g.fillRect(714, 314, 302, 452); cloudTree(860, 560, 130, '#a8d070', '#88b050'); g.restore(); ln([[865, 300], [865, 780]], 6); ln([[700, 540], [1030, 540]], 6); rr(690, 776, 350, 20, 4, '#ffffff', 4);
  rr(60, 380, 560, 340, 10, '#7a5a3a', 5); rr(76, 396, 528, 308, 6, '#3a6a5a', 0); (o.board || ['21 ноября', 'Classwork', 'Reading, p. 42']).forEach((s2, i) => { g.font = `46px HWL, HWC`; g.fillStyle = '#eef4e8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s2, 340, 470 + i * 70); });
  rr(330, 160, 140, 140, 70, '#ffffff', 5); ln([[400, 230], [400, 180]], 6); ln([[400, 230], [430, 245]], 6);
  g.fillStyle = '#d8a66a'; g.fillRect(-1000, 1200, 3080, 1600); ln([[-1000, 1200], [2080, 1200]]); for (let x = -1400; x < 2600; x += 170) ln([[540 + (x - 540) * .3, 1200], [x, 2600]], 3, 'rgba(90,55,25,0.3)');
  rr(90, 960, 440, 26, 6, '#b8804a'); rr(110, 986, 400, 200, 6, '#9a6a3a'); }
module.exports = {set, street, classroom, cloudTree, building};
