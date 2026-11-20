// Flat vector cartoon kit: one dark outline weight, flat fills, one soft shade side, big round eyes.
// Drawing primitives + a seated/standing character with mouth/blink/brows/pose.
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const path = require('path');
const F = path.join(__dirname, 'fonts');
for (const [f, n] of [['nunito-cyrillic-900-normal.woff2', 'NC'], ['nunito-latin-900-normal.woff2', 'NL']]) GlobalFonts.registerFromPath(path.join(F, f), n);
const OUT = '#2a1f1d', LW = 7;
let g; const setG = c => { g = c; };

function smoothPath(pts, closed = true) { // quadratic through midpoints -> soft corners
  const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  g.beginPath(); const s = closed ? mid(pts[n - 1], pts[0]) : pts[0]; g.moveTo(...s);
  for (let i = 0; i < (closed ? n : n - 1); i++) { const p = pts[i], q = pts[(i + 1) % n], m = mid(p, q); if (!closed && i === n - 2) g.quadraticCurveTo(p[0], p[1], q[0], q[1]); else g.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  if (closed) g.closePath();
}
function paint(fill, shade, lw = LW, dir = [1, .6]) {
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (shade) { g.save(); g.clip(); g.translate(-dir[0] * 26, -dir[1] * 26); g.globalCompositeOperation = 'source-atop'; g.restore(); }
  if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
}
// shape with a flat shade band on the right/bottom side
function blob(pts, fill, shade, lw = LW) {
  smoothPath(pts); if (fill) { g.fillStyle = fill; g.fill(); }
  if (shade) { g.save(); smoothPath(pts); g.clip(); g.translate(26, 14); smoothPath(pts); g.restore(); g.save(); smoothPath(pts); g.clip(); g.beginPath(); g.rect(-5000, -5000, 10000, 10000); const t = pts.map(([x, y]) => [x - 22, y - 12]); smoothPath(t); g.fillStyle = shade; g.fill('evenodd'); g.restore(); }
  if (lw) { smoothPath(pts); g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
}
function poly(pts, fill, lw = LW) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = LW, shade) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); }
  if (shade) { g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.clip(); g.beginPath(); g.rect(x - rx * 3, y - ry * 3, rx * 6, ry * 6); g.ellipse(x - rx * .18, y - ry * .14, rx, ry, 0, 0, 7); g.fillStyle = shade; g.fill('evenodd'); g.restore(); }
  if (lw) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.strokeStyle = OUT; g.lineWidth = lw; g.stroke(); } }
function rr(x, y, w, h, r, fill, lw = LW) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = OUT; g.lineWidth = lw; g.stroke(); } }
function ln(pts, lw = LW, col = OUT) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function curve(a, c, b, lw = LW, col = OUT) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.stroke(); }
function text(s, x, y, size, col, align = 'center', font = 'NL, NC') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }

// ---------------- character (head + torso, optional desk-seated) ----------------
// p: {skin, skinS, hair, hairS, hairStyle, top, topS, iris, lips, brow, freckles}
// st: {x, y (head centre), s (scale), mouth 0..1, blink, look [-1..1], brows ('up','angry','sad'), mood ('smile','flat','o','grin','sad'), arms ('desk','up','face','none'), alpha, sweat}
function face(p, st) {
  const {x, y} = st, R = 128;
  // hair back
  if (p.hairStyle === 'long') blob([[x - 150, y - 40], [x - 168, y + 120], [x - 150, y + 230], [x - 60, y + 250], [x + 60, y + 250], [x + 150, y + 230], [x + 168, y + 120], [x + 150, y - 40]], p.hair, p.hairS);
  // ears + head
  for (const s of [-1, 1]) ell(x + s * R * .98, y + 18, 22, 30, p.skin);
  ell(x, y, R, R * 1.06, p.skin, LW, p.skinS);
  if (p.freckles) for (const [a, b] of [[-62, 52], [-48, 62], [-76, 64], [62, 52], [48, 62], [76, 64]]) { g.beginPath(); g.arc(x + a, y + b, 3.5, 0, 7); g.fillStyle = '#c8784a'; g.fill(); }
  ell(x - 74, y + 58, 26, 14, 'rgba(255,120,120,0.35)', 0); ell(x + 74, y + 58, 26, 14, 'rgba(255,120,120,0.35)', 0);
  // eyes
  const ex = 46, ey = y - 6, lk = (st.look || 0) * 9;
  for (const s of [-1, 1]) { const cx = x + s * ex;
    if (st.blink) { curve([cx - 26, ey + 4], [cx, ey + 16], [cx + 26, ey + 4], LW); continue; }
    ell(cx, ey, 30, st.mood === 'o' || st.wide ? 38 : 33, '#ffffff', LW - 1);
    ell(cx + lk, ey + 4, st.wide ? 11 : 14, st.wide ? 11 : 15, p.iris || '#2a1f1d', 0); ell(cx + lk + 5, ey - 2, 5, 5, '#ffffff', 0); }
  // brows
  const by = ey - 52 - (st.brows === 'up' ? 12 : 0);
  for (const s of [-1, 1]) { const cx = x + s * ex; const inner = st.brows === 'angry' ? 12 : st.brows === 'sad' ? -10 : 0;
    ln([[cx - s * 26, by + inner], [cx + s * 24, by - 4]], 11, p.brow || OUT); }
  // nose
  curve([x - 4, y + 30], [x + 10, y + 46], [x - 6, y + 52], 5);
  // mouth
  const my = y + 82, m = st.mouth || 0;
  if (m > .12) { const h = 10 + m * 36; ell(x, my + h * .3, 26 + m * 6, h, '#7a2230', LW - 1); ell(x, my + h * .8, 15, h * .3, '#e8707e', 0); }
  else if (st.mood === 'flat') ln([[x - 22, my], [x + 22, my]], 6);
  else if (st.mood === 'sad') curve([x - 24, my + 8], [x, my - 8], [x + 24, my + 8], 6);
  else if (st.mood === 'o') ell(x, my + 4, 12, 14, '#7a2230', LW - 1);
  else curve([x - 26, my - 4], [x, my + 14], [x + 26, my - 4], 6, p.lips || OUT);
  // hair front: bangs
  if (p.hairStyle === 'long' || p.hairStyle === 'bob') blob([[x - 140, y + 20], [x - 140, y - 70], [x - 90, y - 128], [x, y - 146], [x + 90, y - 128], [x + 140, y - 70], [x + 140, y + 20], [x + 120, y - 40], [x + 60, y - 70], [x + 10, y - 62], [x - 40, y - 80], [x - 100, y - 50]], p.hair, p.hairS);
  if (p.hairStyle === 'short') blob([[x - 134, y - 10], [x - 136, y - 80], [x - 80, y - 136], [x + 20, y - 150], [x + 110, y - 120], [x + 138, y - 60], [x + 134, y - 10], [x + 110, y - 60], [x + 40, y - 78], [x - 40, y - 70], [x - 110, y - 58]], p.hair, p.hairS);
  if (p.hairStyle === 'bald') { for (const s of [-1, 1]) blob([[x + s * 100, y - 50], [x + s * 136, y - 30], [x + s * 136, y + 30], [x + s * 112, y + 20]], p.hair, null); }
  if (p.beard) blob([[x - 124, y + 20], [x - 110, y + 100], [x - 60, y + 136], [x, y + 146], [x + 60, y + 136], [x + 110, y + 100], [x + 124, y + 20], [x + 90, y + 60], [x + 40, y + 70], [x, y + 64], [x - 40, y + 70], [x - 90, y + 60]], p.beard, null, LW - 1);
  if (p.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * 46, y - 6, 42, 0, 7); g.strokeStyle = OUT; g.lineWidth = 6; g.stroke(); }
  if (st.sweat) { blob([[x + 140, y - 60], [x + 156, y - 20], [x + 148, y], [x + 132, y], [x + 126, y - 20]], '#8fd2ff', null, 4); }
}
function torso(p, st) {
  const {x, y} = st, sy = y + 170;
  blob([[x - 54, y + 110], [x + 54, y + 110], [x + 60, sy + 20], [x - 60, sy + 20]], p.skin, p.skinS); // neck
  blob([[x - 170, sy + 60], [x - 140, sy], [x - 60, sy - 20], [x + 60, sy - 20], [x + 140, sy], [x + 170, sy + 60], [x + 190, sy + 420], [x - 190, sy + 420]], p.top, p.topS);
  ln([[x - 50, sy - 10], [x, sy + 40], [x + 50, sy - 10]], 6);
}
function arms(p, st) { const {x, y} = st, sy = y + 170, a = st.arms || 'desk';
  const arm = (pts, hand) => { g.save(); ln(pts, 64, OUT); ln(pts, 50, p.top); g.restore(); ell(hand[0], hand[1], 34, 30, p.skin); };
  if (a === 'desk') { arm([[x - 150, sy + 60], [x - 190, sy + 260], [x - 90, sy + 330]], [x - 80, sy + 330]); arm([[x + 150, sy + 60], [x + 190, sy + 260], [x + 90, sy + 330]], [x + 80, sy + 330]); }
  if (a === 'face') { arm([[x - 150, sy + 60], [x - 200, sy + 100], [x - 110, y + 70]], [x - 100, y + 60]); arm([[x + 150, sy + 60], [x + 200, sy + 100], [x + 110, y + 70]], [x + 100, y + 60]); }
  if (a === 'up') { arm([[x - 150, sy + 60], [x - 240, sy - 60], [x - 250, y - 120]], [x - 250, y - 140]); arm([[x + 150, sy + 60], [x + 240, sy - 60], [x + 250, y - 120]], [x + 250, y - 140]); }
}
function person(p, st) { g.save(); g.globalAlpha = st.alpha ?? 1; g.translate(st.x, st.y); g.scale(st.s || 1, st.s || 1); g.translate(-st.x, -st.y);
  torso(p, st); if (st.arms !== 'face') arms(p, st); face(p, st); if (st.arms === 'face') arms(p, st); g.restore(); }

// caption: big white bold, black outline (one phrase at a time)
function caption(s, y, size = 72, col = '#ffffff') { g.font = `${size}px NL, NC`; let f = size; while (g.measureText(s).width > 960) { f -= 3; g.font = `${f}px NL, NC`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = f * .26; g.strokeStyle = '#111111'; g.strokeText(s, 540, y); g.fillStyle = col; g.fillText(s, 540, y); }
module.exports = {setG, get g() { return g; }, OUT, LW, blob, poly, ell, rr, ln, curve, text, person, face, caption, smoothPath, createCanvas};
