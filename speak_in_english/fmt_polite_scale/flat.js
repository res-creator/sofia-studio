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

// ---------------- character v2 (reference proportions: egg head, big close eyes, close-fitting hair, thin neck/arms, drawn hands) ----------------
// p: {skin, skinS, hair, hairS, hairL, hairStyle ('part'|'short'|'bald'|'bun'), top, topS, collar, iris, lips, brow, freckles, beard, glasses}
// st: {x, y (head centre), s, mouth, blink, look, brows, mood, wide, arms ('desk'|'face'|'up'|'none'), alpha, sweat}
function headPts(x, y) { const P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
  const rx = 132 * (sn > 0 ? 1 - .2 * sn * sn : 1), ry = sn > 0 ? 160 : 150; P.push([x + c * rx, y + sn * ry]); } return P; }
function headPath(x, y) { const P = headPts(x, y); g.beginPath(); P.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); }
function face(p, st) {
  const {x, y} = st;
  if (p.hairStyle === 'bun') ell(x + 10, y - 196, 64, 54, p.hair, LW, p.hairS);
  for (const s of [-1, 1]) { ell(x + s * 128, y + 6, 20, 30, p.skin); curve([x + s * 124, y - 6], [x + s * 136, y + 6], [x + s * 126, y + 20], 4); }
  headPath(x, y); g.fillStyle = p.skin; g.fill();
  g.save(); headPath(x, y); g.clip(); g.beginPath(); g.ellipse(x + 92, y + 40, 70, 150, 0, 0, 7); g.fillStyle = p.skinS; g.globalAlpha = .35; g.fill(); g.restore();
  headPath(x, y); g.strokeStyle = OUT; g.lineWidth = LW; g.stroke();
  if (p.beard) blob([[x - 128, y + 10], [x - 116, y + 90], [x - 66, y + 140], [x, y + 156], [x + 66, y + 140], [x + 116, y + 90], [x + 128, y + 10], [x + 92, y + 66], [x + 40, y + 76], [x, y + 70], [x - 40, y + 76], [x - 92, y + 66]], p.beard, null, LW - 1);
  if (p.freckles) for (const [a, b] of [[-70, 58], [-56, 68], [-84, 70], [70, 58], [56, 68], [84, 70]]) { g.beginPath(); g.arc(x + a, y + b, 3.5, 0, 7); g.fillStyle = '#c8784a'; g.fill(); }
  ell(x - 82, y + 62, 24, 12, 'rgba(255,110,110,0.30)', 0); ell(x + 82, y + 62, 24, 12, 'rgba(255,110,110,0.30)', 0);
  // eyes: big, almost touching
  const ex = 50, ey = y - 6, lk = (st.look || 0) * 10, R = st.wide ? 50 : 46, Ry = st.wide ? 56 : 50;
  for (const s of [-1, 1]) { const cx = x + s * ex;
    if (st.blink) { curve([cx - 34, ey + 4], [cx, ey + 20], [cx + 34, ey + 4], LW); continue; }
    ell(cx, ey, R, Ry, '#ffffff', LW - 1);
    if (st.mood === 'sleepy') { g.save(); g.beginPath(); g.ellipse(cx, ey, R, Ry, 0, 0, 7); g.clip(); g.fillStyle = p.skin; g.fillRect(cx - R, ey - Ry, R * 2, Ry * .9); g.restore(); ln([[cx - R + 4, ey - Ry * .1], [cx + R - 4, ey - Ry * .1]], LW - 1); }
    const pr = st.wide ? 10 : 13; ell(cx + lk, ey + 6, pr, pr + 1, OUT, 0); ell(cx + lk + 4, ey + 1, 4, 4, '#ffffff', 0); }
  if (p.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * ex, ey, R + 8, 0, 7); g.strokeStyle = OUT; g.lineWidth = 6; g.stroke(); }
  // brows: short thick arcs
  const by = ey - Ry - 22 - (st.brows === 'up' ? 14 : 0);
  for (const s of [-1, 1]) { const cx = x + s * ex, inner = st.brows === 'angry' ? 14 : st.brows === 'sad' ? -12 : 0;
    g.beginPath(); g.moveTo(cx - s * 30, by + 6 + inner); g.quadraticCurveTo(cx, by - 8 + inner * .4, cx + s * 30, by + 4); g.strokeStyle = p.brow || OUT; g.lineWidth = 12; g.lineCap = 'round'; g.stroke(); }
  // nose: small hook
  curve([x + 2, y + 44], [x + 16, y + 60], [x - 2, y + 64], 5);
  // mouth
  const my = y + 100, m = st.mouth || 0;
  if (m > .12) { const h = 8 + m * 30; g.beginPath(); g.moveTo(x - 30, my - 4); g.quadraticCurveTo(x, my - 10, x + 30, my - 4); g.quadraticCurveTo(x + 26, my + h, x, my + h + 4); g.quadraticCurveTo(x - 26, my + h, x - 30, my - 4); g.fillStyle = '#7a2230'; g.fill(); g.strokeStyle = OUT; g.lineWidth = LW - 1; g.stroke(); ell(x, my + h * .7, 13, h * .25, '#e8707e', 0); }
  else if (st.mood === 'flat' || st.mood === 'sleepy') ln([[x - 18, my], [x + 18, my]], 6);
  else if (st.mood === 'sad') curve([x - 22, my + 8], [x, my - 6], [x + 22, my + 8], 6);
  else if (st.mood === 'o') ell(x, my + 4, 12, 14, '#7a2230', LW - 1);
  else curve([x - 24, my - 4], [x, my + 12], [x + 24, my - 4], 6, OUT);
  // front hair (close to the skull)
  if (p.hairStyle === 'part' || p.hairStyle === 'bun') {
    for (const s of [-1, 1]) blob([[x, y - 160], [x + s * 70, y - 154], [x + s * 128, y - 110], [x + s * 150, y - 30], [x + s * 152, y + 90], [x + s * 146, y + 196], [x + s * 112, y + 200], [x + s * 116, y + 80], [x + s * 112, y - 10], [x + s * 86, y - 78], [x + s * 30, y - 118]], p.hair, null);
    for (const s of [-1, 1]) ln([[x + s * 30, y - 146], [x + s * 90, y - 128], [x + s * 122, y - 84]], 10, p.hairL || 'rgba(255,255,255,0.3)');
  }
  if (p.hairStyle === 'short') { blob([[x - 136, y - 20], [x - 140, y - 100], [x - 96, y - 160], [x - 10, y - 178], [x + 80, y - 168], [x + 136, y - 116], [x + 140, y - 20], [x + 116, y - 70], [x + 60, y - 96], [x + 10, y - 86], [x - 50, y - 100], [x - 110, y - 70]], p.hair, null); ln([[x - 60, y - 150], [x + 40, y - 158]], 9, p.hairL || 'rgba(255,255,255,0.3)'); }
  if (p.hairStyle === 'bald') for (const s of [-1, 1]) blob([[x + s * 106, y - 70], [x + s * 136, y - 40], [x + s * 140, y + 30], [x + s * 118, y + 24]], p.hair, null);
  if (st.sweat) blob([[x + 150, y - 70], [x + 166, y - 30], [x + 158, y - 10], [x + 142, y - 10], [x + 136, y - 30]], '#8fd2ff', null, 4);
}
function torso(p, st) {
  const {x, y} = st, sy = y + 220;
  blob([[x - 34, y + 120], [x + 34, y + 120], [x + 38, sy + 10], [x - 38, sy + 10]], p.skinS, null); // thin neck
  blob([[x - 150, sy + 70], [x - 132, sy + 18], [x - 70, sy - 6], [x + 70, sy - 6], [x + 132, sy + 18], [x + 150, sy + 70], [x + 160, sy + 420], [x - 160, sy + 420]], p.top, p.topS);
  if (p.collar) { for (const s of [-1, 1]) blob([[x, sy + 20], [x + s * 70, sy - 4], [x + s * 76, sy + 30], [x + s * 30, sy + 54]], p.collar, null, 5); }
  else curve([x - 44, sy - 4], [x, sy + 36], [x + 44, sy - 4], 6);
  if (p.pendant) { ell(x, sy + 52, 10, 12, p.pendant, 4); }
}
function hand(hx, hy, flip, skin) { g.save(); g.translate(hx, hy); g.scale(flip, 1);
  blob([[-30, -20], [20, -26], [44, -10], [46, 14], [20, 26], [-30, 22]], skin, null, 6); for (const k of [-8, 6]) ln([[24, k], [42, k + 2]], 4);
  blob([[-6, -24], [10, -46], [24, -40], [12, -18]], skin, null, 5); g.restore(); }
function arms(p, st) { const {x, y} = st, sy = y + 220, a = st.arms || 'desk';
  const arm = (pts) => { ln(pts, 50, OUT); ln(pts, 38, p.top); ln(pts.slice(-2), 38, p.top); };
  if (a === 'desk') { arm([[x - 136, sy + 50], [x - 172, sy + 230], [x - 96, sy + 300]]); hand(x - 84, sy + 300, 1, p.skin); arm([[x + 136, sy + 50], [x + 172, sy + 230], [x + 96, sy + 300]]); hand(x + 84, sy + 300, -1, p.skin); }
  if (a === 'face') { arm([[x - 136, sy + 50], [x - 190, sy + 60], [x - 124, y + 90]]); hand(x - 112, y + 80, 1, p.skin); arm([[x + 136, sy + 50], [x + 190, sy + 60], [x + 124, y + 90]]); hand(x + 112, y + 80, -1, p.skin); }
  if (a === 'up') { arm([[x - 136, sy + 50], [x - 230, sy - 40], [x - 240, y - 110]]); hand(x - 240, y - 130, 1, p.skin); arm([[x + 136, sy + 50], [x + 230, sy - 40], [x + 240, y - 110]]); hand(x + 240, y - 130, -1, p.skin); }
}
function person(p, st) { g.save(); g.globalAlpha = st.alpha ?? 1; g.translate(st.x, st.y); g.scale(st.s || 1, st.s || 1); g.translate(-st.x, -st.y);
  if (p.hairStyle === 'part' || p.hairStyle === 'bun') {} torso(p, st); if (st.arms !== 'face') arms(p, st); face(p, st); if (st.arms === 'face') arms(p, st); g.restore(); }

// caption: big white bold, black outline (one phrase at a time)
function caption(s, y, size = 72, col = '#ffffff') { g.font = `${size}px NL, NC`; let f = size; while (g.measureText(s).width > 960) { f -= 3; g.font = `${f}px NL, NC`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = f * .26; g.strokeStyle = '#111111'; g.strokeText(s, 540, y); g.fillStyle = col; g.fillText(s, 540, y); }
module.exports = {setG, get g() { return g; }, OUT, LW, blob, poly, ell, rr, ln, curve, text, person, face, caption, smoothPath, createCanvas};
