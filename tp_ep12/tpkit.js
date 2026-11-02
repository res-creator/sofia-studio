// Episode 12 "The Toilet Paper Panic of 1973" sets, props and cast (on hirkit): toilet rolls and 4-packs, the supermarket shelf
// (stock per slot), a one-point-perspective aisle, the shopping cart, a 1970s wood TV set, a wall of TVs, the late-night studio
// (generic host, no portrait), the press release + scissors, the gas line, a tear-off calendar, newspaper headline, the paper mill.
// Generic places, no logos: names appear as plain text only.
const K = require('../tests/mcd_collage/kit');
const R = require('../hirkit/rig');
const LT = require('../hirkit/light');
const CL = require('../hirkit/collage');
const { C, F, clamp, lerp, seg, E, rr } = K;
const { INK, shade, fillStroke, ell, px } = R;

const W = 1080, H = 1920;
function layer(ctx, c, d, fn) { ctx.save(); ctx.translate(W / 2 + (c.shx || 0) * d, H / 2 + (c.shy || 0) * d); ctx.rotate((c.r || 0) * d); const z = Math.pow(c.z, d); ctx.scale(z, z); ctx.translate(-c.x * d, -c.y * d); fn(ctx); ctx.restore(); }
const txt = (ctx, s, x, y, size, col, align = 'center', font = F.black) => { ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); };
function fitTxt(ctx, s, x, y, size, col, maxW, align = 'center') { ctx.font = `${size}px ${F.black}`; const w = ctx.measureText(s).width; if (w > maxW) size *= maxW / w; txt(ctx, s, x, y, size, col, align); return size; }
const hash = K.hash;

// 1970s palette accents (inside the channel palette)
const AVO = '#8A9A4B', MUST = '#D9A43B', RUST = '#B5532F', BROWN = '#6B4A2E', TEAL = '#3E8C8C', WOOD = '#8B5A34', WOODD = '#6A4024';

// ---------- cast ----------
// the shopper we follow (generic 1973 shopper), the late-night host (generic: suit + tie, no likeness), extras
const SHOP = { skin: '#EDBE98', hair: '#7A4426', hairStyle: 'curly', top: MUST, cuff: '#C38E2A', collar: '#FFFDF8', pants: BROWN, shoes: '#3A2A22', iris: '#5A4026', brow: '#5A2E16', lashes: 1, lips: '#B2524A' };
const HOST = { skin: '#EBC3A1', hair: '#6E6A66', hairStyle: 'short', top: '#2B3A5C', cuff: '#FFFDF8', shirt: '#FFFDF8', pants: '#2B3A5C', shoes: '#1E1E22', iris: '#4A6A8A', brow: '#4A4440' };
const EXTRAS = [
  { skin: '#8D5A3C', hair: '#1E1612', hairStyle: 'short', top: AVO, collar: '#FFFDF8', pants: '#3A3A44', shoes: '#2A2A2A', iris: '#3A2414', brow: '#1E1612', beard: 1 },
  { skin: '#F0C7A6', hair: '#D9B26A', hairStyle: 'long', top: TEAL, pants: '#5A4A3A', shoes: '#4A2A1A', iris: '#3E6A8A', brow: '#9A7A3A', lashes: 1, lips: '#B2524A' },
  { skin: '#C98E66', hair: '#3A2418', hairStyle: 'bun', top: RUST, collar: '#FFFDF8', pants: '#2E3A59', shoes: '#3A2A22', iris: '#3A2414', lashes: 1, lips: '#7A3434' },
  { skin: '#E8B48F', hair: '#4A3222', hairStyle: 'short', top: '#4D8DFF', shirt: '#FFFDF8', pants: '#5A4A3A', shoes: '#2A2A2A', iris: '#4E6B3C', brow: '#3A2416', glasses: 1 },
];
// the host's tie, drawn in bust space after R.bust (same transform as the bust)
function hostTie(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.scale(0.92, 1);
  ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(14, -12); ctx.lineTo(9, 10); ctx.lineTo(-9, 10); ctx.closePath(); fillStroke(ctx, C.red, 3.5);
  ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(9, 10); ctx.lineTo(18, 84); ctx.lineTo(0, 100); ctx.lineTo(-18, 84); ctx.closePath(); fillStroke(ctx, C.red, 3.5);
  ctx.strokeStyle = '#B02A35'; ctx.lineWidth = px(ctx, 3); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-14, 30 + i * 22); ctx.lineTo(14, 22 + i * 22); ctx.stroke(); }
  ctx.restore();
}

// ---------- toilet roll (upright, 3/4 view, base at 0, ~110 wide x 120 tall) ----------
function roll(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s); const w = 56, h = 118, ry = 17;
  ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(-w, 0); ctx.ellipse(0, 0, w, ry, 0, Math.PI, 0, true); ctx.lineTo(w, -h); ctx.closePath();
  const g = ctx.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, '#E4E0D6'); g.addColorStop(0.35, '#FFFEFA'); g.addColorStop(1, '#CFCAC0'); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = px(ctx, 4.5); ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  // the loose sheet edge and a quilted dot pattern
  ctx.strokeStyle = 'rgba(120,110,95,0.45)'; ctx.lineWidth = px(ctx, 2.5); ctx.beginPath(); ctx.moveTo(w * 0.35, -h + 6); ctx.lineTo(w * 0.42, 6); ctx.stroke();
  ctx.fillStyle = 'rgba(150,140,125,0.25)'; for (let i = 0; i < 12; i++) { ell(ctx, -w * 0.6 + (i % 4) * w * 0.38, -h * 0.8 + Math.floor(i / 4) * h * 0.3, 3.5, 3.5); ctx.fill(); }
  ell(ctx, 0, -h, w, ry); fillStroke(ctx, '#FFFEFA', 4.5);
  ell(ctx, 0, -h, w * 0.33, ry * 0.36); fillStroke(ctx, '#B79A74', 3); ell(ctx, 0, -h + 1, w * 0.24, ry * 0.24); ctx.fillStyle = '#5A4632'; ctx.fill();
  if (o.tail) { ctx.beginPath(); ctx.moveTo(w * 0.35, 0); ctx.quadraticCurveTo(w * 0.5, o.tail * 0.5, w * 0.3 + Math.sin(o.wave || 0) * 10, o.tail); ctx.lineTo(w * 0.3 + Math.sin(o.wave || 0) * 10 - 50, o.tail); ctx.quadraticCurveTo(-w * 0.1, o.tail * 0.5, -w * 0.2, 6); ctx.closePath(); fillStroke(ctx, '#FBF8F0', 3.5); }
  ctx.restore();
}
// 4-pack (2 front rolls visible), base centre at 0, ~240 wide x 150 tall; wrapper with a plain label
const PACKC = ['#4D8DFF', '#E63946', '#8A9A4B', '#D9A43B'];
function pack(ctx, s = 1, col = 0, o = {}) {
  ctx.save(); ctx.scale(s, s); const c = PACKC[col % PACKC.length];
  CL.cutout(ctx, () => rr(ctx, -118, -146, 236, 152, 26), 'rgba(255,253,246,1)', { elev: o.elev ?? 0.9, tex: 0.4 });
  // roll seams
  ctx.strokeStyle = 'rgba(120,110,95,0.5)'; ctx.lineWidth = px(ctx, 3); ctx.beginPath(); ctx.moveTo(0, -140); ctx.lineTo(0, 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-100, -140, 18, 140); ctx.fillRect(18, -140, 18, 140);
  // wrapper band + label
  ctx.fillStyle = c; ctx.fillRect(-116, -96, 232, 56); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.strokeRect(-116, -96, 232, 56);
  fitTxt(ctx, o.label || 'BATH TISSUE', 0, -58, 30, '#FFFDF8', 200);
  ctx.restore();
}

// ---------- shelf unit (front view): base centre at (0,0), width w, `rows` shelves; stock(r, i) -> 0..1 (scale of the pack in slot i) ----------
function shelf(ctx, w, o = {}) {
  const rows = o.rows || 4, rh = o.rh || 240, top = -rows * rh - 120, n = o.n || Math.max(1, Math.floor(w / 250));
  CL.cutout(ctx, () => rr(ctx, -w / 2 - 20, top, w + 40, -top, 10), o.back || '#E9E1CE', { elev: 1.2 });
  // pegboard back
  ctx.fillStyle = 'rgba(140,120,90,0.25)'; for (let y = top + 40; y < -30; y += 34) for (let x = -w / 2 + 10; x < w / 2; x += 34) { ell(ctx, x, y, 3.2, 3.2); ctx.fill(); }
  // header sign
  if (o.sign) { ctx.save(); ctx.translate(0, top - 6); CL.cutout(ctx, () => rr(ctx, -w * 0.36, -90, w * 0.72, 100, 12), C.red, { elev: 1.2 }); fitTxt(ctx, o.sign, 0, -22, 60, '#FFFDF8', w * 0.66); ctx.restore(); }
  for (let r = 0; r < rows; r++) {
    const y = -r * rh - 80; // shelf top surface
    // goods first (sit on the shelf)
    for (let i = 0; i < n; i++) { const u = o.stock ? o.stock(r, i) : 1; if (u <= 0.02) continue; const x = -w / 2 + (i + 0.5) * w / n;
      ctx.save(); ctx.translate(x, y); ctx.rotate((hash(r * 17 + i) - 0.5) * 0.04); ctx.scale(u, u); pack(ctx, Math.min(1, (w / n) / 260), (r + i) % 4, { elev: 0.5 }); ctx.restore(); }
    // the shelf lip with the yellow price strip
    rr(ctx, -w / 2 - 6, y, w + 12, 34, 4); fillStroke(ctx, '#D8D2C2', 4);
    ctx.fillStyle = C.yellow; ctx.fillRect(-w / 2, y + 6, w, 22);
    for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; ctx.fillStyle = '#FFFDF8'; ctx.fillRect(x - 36, y + 4, 72, 26); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 2.5); ctx.strokeRect(x - 36, y + 4, 72, 26); txt(ctx, o.price || '39¢', x, y + 26, 22, INK); }
  }
  // kick plate
  rr(ctx, -w / 2 - 20, -60, w + 40, 60, 6); fillStroke(ctx, '#8C8472', 4);
}

// ---------- one-point perspective aisle (world: vanishing point at (0, vy), floor from y = 0 downwards) ----------
// stock: 0..1 fraction of packs left (each pack disappears at its own random threshold); o.t time for flicker
function aisle(ctx, o = {}) {
  const vy = o.vy ?? -560, AW = o.aw || 700, stock = o.stock ?? 1, Wd = 2400;
  // ceiling + back wall
  ctx.fillStyle = '#EFE8D8'; ctx.fillRect(-Wd, -2400, Wd * 2, 2400 + vy);
  ctx.fillStyle = '#E4DCC6'; ctx.fillRect(-Wd, vy - 140, Wd * 2, 140);
  // fluorescent tubes
  for (let k = 0; k < 6; k++) { const d = 1 / (1 + k * 0.7), y = vy - 1500 * d, w = 420 * d; ctx.fillStyle = '#FFFDF2'; rr(ctx, -w / 2, y - 18 * d, w, 36 * d, 8 * d); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3 * d; ctx.stroke(); LT.glow(ctx, 0, y, 380 * d, 'rgba(255,250,225,1)', 0.25); }
  // floor: checker tiles in perspective
  ctx.fillStyle = '#E9E3D3'; ctx.fillRect(-Wd, vy, Wd * 2, 2400);
  for (let j = 0; j < 22; j++) { const d0 = 1 / (1 + j * 0.35), d1 = 1 / (1 + (j + 1) * 0.35), y0 = vy + 1700 * d0, y1 = vy + 1700 * d1;
    for (let i = -6; i < 6; i++) { if ((i + j) % 2) continue; ctx.fillStyle = '#C9C0AB'; ctx.beginPath(); ctx.moveTo(i * 260 * d0, y0); ctx.lineTo((i + 1) * 260 * d0, y0); ctx.lineTo((i + 1) * 260 * d1, y1); ctx.lineTo(i * 260 * d1, y1); ctx.closePath(); ctx.fill(); } }
  // the two gondolas: a run of shelf faces from near (d=1) to far
  for (const side of [-1, 1]) for (let k = 7; k >= 0; k--) {
    const d0 = 1 / (1 + k * 0.45), d1 = 1 / (1 + (k + 1) * 0.45);
    const xo0 = side * AW * d0, xo1 = side * AW * d1, xi0 = side * 1500 * d0, xi1 = side * 1500 * d1;
    const P = (x, yy, d) => [x, vy + yy * d]; // yy: height from the vanishing line, scaled by depth
    const q = (a, b, c2, dd, fill) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c2); ctx.lineTo(...dd); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = Math.max(1.5, 4 * d0); ctx.strokeStyle = INK; ctx.stroke(); };
    // face of the gondola (facing the aisle): quad from (xo0) near to (xo1) far, floor at +1700*d, top at -1300*d
    q(P(xo0, 1700, d0), P(xo1, 1700, d1), P(xo1, -1100, d1), P(xo0, -1100, d0), '#E2D9C3');
    for (let r = 0; r < 5; r++) { const h0 = 1500 - r * 520; // shelf heights
      // packs on this shelf segment
      for (let m = 0; m < 3; m++) { const id = side * 1000 + k * 40 + r * 7 + m, keep = hash(id) < stock; if (!keep) continue;
        const u0 = m / 3 + 0.04, u1 = (m + 1) / 3 - 0.04, da = lerp(d0, d1, u0), db = lerp(d0, d1, u1), xa = side * AW * da, xb = side * AW * db, hp = 300;
        ctx.beginPath(); ctx.moveTo(xa, vy + (h0 - 20) * da); ctx.lineTo(xb, vy + (h0 - 20) * db); ctx.lineTo(xb, vy + (h0 - 20 - hp) * db); ctx.lineTo(xa, vy + (h0 - 20 - hp) * da); ctx.closePath();
        ctx.fillStyle = '#FFFDF6'; ctx.fill(); ctx.lineWidth = Math.max(1.2, 3 * da); ctx.strokeStyle = INK; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xa, vy + (h0 - 140) * da); ctx.lineTo(xb, vy + (h0 - 140) * db); ctx.lineTo(xb, vy + (h0 - 200) * db); ctx.lineTo(xa, vy + (h0 - 200) * da); ctx.closePath(); ctx.fillStyle = PACKC[(k + r + m) % 4]; ctx.fill(); }
      // shelf lip
      ctx.beginPath(); ctx.moveTo(xo0, vy + h0 * d0); ctx.lineTo(xo1, vy + h0 * d1); ctx.lineTo(xo1, vy + (h0 + 50) * d1); ctx.lineTo(xo0, vy + (h0 + 50) * d0); ctx.closePath(); ctx.fillStyle = C.yellow; ctx.fill(); ctx.lineWidth = Math.max(1.2, 3 * d0); ctx.stroke(); }
    // gondola end cap toward the viewer edge (outer side) - simple dark side panel
    q(P(xo0, 1700, d0), P(xi0, 1700, d0), P(xi0, -1100, d0), P(xo0, -1100, d0), k === 0 ? '#CFC5AE' : '#D8CFB9');
  }
  // hanging aisle sign
  if (o.sign !== false) { const d = 0.42, y = vy - 820 * d; ctx.save(); ctx.translate(0, y); ctx.scale(d * 1.7, d * 1.7); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-150, -260); ctx.lineTo(-150, -70); ctx.moveTo(150, -260); ctx.lineTo(150, -70); ctx.stroke();
    CL.cutout(ctx, () => rr(ctx, -260, -80, 520, 150, 14), C.red, { elev: 1 }); txt(ctx, 'AISLE 7', 0, -18, 50, '#FFFDF8'); txt(ctx, 'PAPER GOODS', 0, 44, 42, C.yellow); ctx.restore(); }
}

// ---------- shopping cart (side view, faces +x / handle at -x, wheels on y = 0) ----------
// load: 0..n packs piled in the basket (fractional = the last one dropping in)
function cart(ctx, s = 1, o = {}) {
  ctx.save(); ctx.scale(s, s);
  const bx0 = -230, bx1 = 260, by0 = -460, by1 = -190, chrome = '#C9CED6', chromeD = '#8E959E';
  // frame + wheels
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(220, -40); ctx.moveTo(-200, -40); ctx.lineTo(-250, -470); ctx.moveTo(220, -40); ctx.lineTo(240, -190); ctx.stroke();
  ctx.strokeStyle = chrome; ctx.lineWidth = px(ctx, 7); ctx.stroke();
  for (const x of [-180, 200]) { ell(ctx, x, -18, 22, 22); fillStroke(ctx, '#2A2A2E', 4); ell(ctx, x, -18, 8, 8); ctx.fillStyle = chromeD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(x, -40); ctx.lineTo(x, -18); ctx.stroke(); }
  // handle
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 14); ctx.beginPath(); ctx.moveTo(-250, -470); ctx.lineTo(-300, -500); ctx.stroke(); ctx.strokeStyle = C.red; ctx.lineWidth = px(ctx, 9); ctx.stroke();
  const basket = () => { ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx1 + 30, by0); ctx.lineTo(bx1, by1); ctx.lineTo(bx0 + 30, by1); ctx.closePath(); };
  // back wall of the basket (darker)
  basket(); ctx.fillStyle = 'rgba(80,88,98,0.18)'; ctx.fill();
  // the pile: packs stacked in a pyramid that rises above the rim
  const n = o.load || 0, spots = [];
  for (let row = 0; row < 6; row++) for (let i = 0; i < 4 - (row > 1 ? row - 1 : 0); i++) spots.push([bx0 + 70 + i * 128 + (row > 1 ? (row - 1) * 64 : 0) + (row % 2) * 20, by1 - 4 - row * 104]);
  for (let j = 0; j < Math.min(spots.length, Math.ceil(n)); j++) { const f = clamp(n - j), [x, y] = spots[j], drop = (1 - E.out(f)) * 260;
    ctx.save(); ctx.translate(x, y - drop); ctx.rotate((hash(j * 7) - 0.5) * 0.25 * (1 + (1 - f))); pack(ctx, 0.55, j % 4, { elev: 0.4 }); ctx.restore(); }
  // front wire grid
  ctx.save(); basket(); ctx.clip(); ctx.strokeStyle = chrome; ctx.lineWidth = px(ctx, 4);
  for (let x = bx0 - 40; x < bx1 + 60; x += 34) { ctx.beginPath(); ctx.moveTo(x, by0); ctx.lineTo(x - 30, by1); ctx.stroke(); }
  for (let y = by0 + 34; y < by1; y += 40) { ctx.beginPath(); ctx.moveTo(bx0 - 40, y); ctx.lineTo(bx1 + 60, y); ctx.stroke(); }
  ctx.restore();
  basket(); ctx.lineWidth = px(ctx, 7); ctx.strokeStyle = INK; ctx.stroke(); basket(); ctx.lineWidth = px(ctx, 3.5); ctx.strokeStyle = chrome; ctx.stroke();
  ctx.restore();
}

// ---------- 1970s TV set (front): centred at the screen centre, screen size w x h; screen(ctx, w, h) draws in (0..w, 0..h) ----------
function tvSet(ctx, w, h, screen, o = {}) {
  const m = 46, cw = w + m * 2 + 200, ch = h + m * 2 + 40, x0 = -w / 2 - m, y0 = -h / 2 - m;
  // rabbit ears
  if (o.ears !== false) { ctx.save(); ctx.translate(-20, y0 - 30); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-180, -260); ctx.moveTo(0, 0); ctx.lineTo(140, -280); ctx.stroke(); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = px(ctx, 5); ctx.stroke();
    for (const [x, y] of [[-180, -260], [140, -280]]) { ell(ctx, x, y, 10, 10); fillStroke(ctx, '#C9CED6', 3); } ell(ctx, 0, 6, 60, 30); fillStroke(ctx, '#3A3A3E', 4); ctx.restore(); }
  // legs
  ctx.fillStyle = WOODD; for (const x of [x0 + 40, x0 + cw - 70]) { ctx.beginPath(); ctx.moveTo(x, y0 + ch - 10); ctx.lineTo(x + 30, y0 + ch - 10); ctx.lineTo(x + 22, y0 + ch + 110); ctx.lineTo(x + 8, y0 + ch + 110); ctx.closePath(); fillStroke(ctx, WOODD, 4); }
  // wood cabinet
  CL.cutout(ctx, () => rr(ctx, x0 - 30, y0 - 30, cw, ch, 30), WOOD, { elev: 1.6, tex: 0.6 });
  ctx.save(); rr(ctx, x0 - 30, y0 - 30, cw, ch, 30); ctx.clip(); ctx.strokeStyle = 'rgba(60,30,10,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 26; i++) { const y = y0 - 30 + i * ch / 26; ctx.beginPath(); ctx.moveTo(x0 - 30, y); ctx.bezierCurveTo(x0 + cw * 0.3, y + 14 * Math.sin(i), x0 + cw * 0.6, y - 12 * Math.cos(i * 1.3), x0 + cw, y + 6); ctx.stroke(); } ctx.restore();
  // speaker grille + knobs on the right
  const gx = w / 2 + m + 20; rr(ctx, gx, y0 + 10, 130, h * 0.55, 14); fillStroke(ctx, '#3A2A1E', 4);
  ctx.strokeStyle = '#5A4232'; ctx.lineWidth = 4; for (let y = y0 + 26; y < y0 + h * 0.55; y += 16) { ctx.beginPath(); ctx.moveTo(gx + 10, y); ctx.lineTo(gx + 120, y); ctx.stroke(); }
  for (let i = 0; i < 2; i++) { const ky = y0 + h * 0.68 + i * 110; ell(ctx, gx + 65, ky, 40, 40); fillStroke(ctx, '#D8D2C2', 4); ell(ctx, gx + 65, ky, 14, 14); ctx.fillStyle = '#8C8472'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 4); ctx.beginPath(); ctx.moveTo(gx + 65, ky); ctx.lineTo(gx + 65 + Math.cos(i * 2 + 0.6) * 34, ky + Math.sin(i * 2 + 0.6) * 34); ctx.stroke(); }
  // bezel + CRT
  rr(ctx, -w / 2 - 22, -h / 2 - 22, w + 44, h + 44, 60); fillStroke(ctx, '#2A2622', 5);
  const scr = () => { ctx.beginPath(); ctx.moveTo(-w / 2 + 50, -h / 2); ctx.quadraticCurveTo(0, -h / 2 - 16, w / 2 - 50, -h / 2); ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 50); ctx.quadraticCurveTo(w / 2 + 14, 0, w / 2, h / 2 - 50);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - 50, h / 2); ctx.quadraticCurveTo(0, h / 2 + 16, -w / 2 + 50, h / 2); ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 50); ctx.quadraticCurveTo(-w / 2 - 14, 0, -w / 2, -h / 2 + 50); ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + 50, -h / 2); ctx.closePath(); };
  ctx.save(); scr(); ctx.clip(); ctx.fillStyle = '#1C2430'; ctx.fillRect(-w / 2 - 20, -h / 2 - 20, w + 40, h + 40);
  ctx.translate(-w / 2, -h / 2); if (screen) screen(ctx, w, h); ctx.translate(w / 2, h / 2);
  // scanlines, curvature shade, glass glare
  ctx.fillStyle = 'rgba(0,0,0,0.1)'; for (let y = -h / 2; y < h / 2; y += 6) ctx.fillRect(-w / 2, y, w, 2);
  const g = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.3, 0, 0, Math.max(w, h) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(-w * 0.2, -h * 0.28, w * 0.32, h * 0.12, -0.3, 0, 7); ctx.fill();
  ctx.restore(); scr(); ctx.lineWidth = px(ctx, 5); ctx.strokeStyle = INK; ctx.stroke();
}

// ---------- the late-night studio (screen or full frame): curtain, skyline backdrop, desk, mic, the host bust ----------
// draws in a w x h box at (0,0). o: { face, hands, laugh (0..1 audience), card (text on a cue card), tilt }
function studio(ctx, w, h, t, o = {}) {
  const sc = w / 1080;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip(); ctx.scale(sc, sc); const H2 = h / sc, DY = H2 * 0.8;
  // night skyline backdrop
  let g = ctx.createLinearGradient(0, 0, 0, H2 * 0.7); g.addColorStop(0, '#1E2A50'); g.addColorStop(1, '#4A4A86'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, H2);
  for (let i = 0; i < 14; i++) { const bw = 70 + hash(i) * 70, bh = 220 + hash(i + 40) * 420, bx = i * 80 - 20; ctx.fillStyle = i % 2 ? '#2A3260' : '#323A6E'; ctx.fillRect(bx, H2 * 0.62 - bh, bw, bh);
    ctx.fillStyle = 'rgba(255,214,120,0.8)'; for (let y = H2 * 0.62 - bh + 20; y < H2 * 0.6; y += 34) for (let x = bx + 10; x < bx + bw - 12; x += 24) if (hash(x * 3 + y) > 0.55) ctx.fillRect(x, y, 10, 14); }
  ell(ctx, 840, 160, 54, 54); ctx.fillStyle = '#FFF4D2'; ctx.fill();
  // curtains left/right
  for (const sd of [0, 1]) { ctx.save(); if (sd) { ctx.translate(1080, 0); ctx.scale(-1, 1); }
    ctx.fillStyle = '#7A2030'; ctx.fillRect(0, 0, 200, H2); for (let i = 0; i < 5; i++) { const x = i * 42 + Math.sin(t * 0.8 + i) * 3; ctx.fillStyle = i % 2 ? '#8E2A3A' : '#661A28'; ctx.fillRect(x, 0, 22, H2); }
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(210, 0); ctx.lineTo(210, H2); ctx.stroke(); ctx.restore(); }
  // the host (generic bust, suit + tie) behind the desk
  const hs = o.hs || 1.6, hx = 540, hy = DY - 120 * hs;
  LT.lit(ctx, c => { R.bust(c, hx, hy, hs, HOST, { face: o.face || R.expr('grin', { look: [0, 0.1] }), headTilt: o.tilt || 0, lean: o.lean || 0, hands: o.hands || [] }); hostTie(c, hx, hy, hs); }, { rim: { dir: [1, -0.4], color: '#D8E4FF', w: 6, a: 0.9 } });
  // desk
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.moveTo(60, DY); ctx.lineTo(1020, DY); ctx.lineTo(980, H2 + 40); ctx.lineTo(100, H2 + 40); ctx.closePath(); }, WOOD, { elev: 1.4, tex: 0.6 });
  ctx.fillStyle = WOODD; ctx.fillRect(60, DY, 960, 26); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(60, DY, 960, 26);
  // desk mic + coffee mug + pencil
  ctx.save(); ctx.translate(300, DY); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(40, -110); ctx.stroke(); ctx.strokeStyle = '#C9CED6'; ctx.lineWidth = 5; ctx.stroke();
  ctx.translate(40, -110); ctx.rotate(0.35); rr(ctx, -20, -54, 40, 70, 16); fillStroke(ctx, '#3A3A3E', 4); ctx.strokeStyle = '#8E959E'; ctx.lineWidth = 2; for (let y = -44; y < 10; y += 9) { ctx.beginPath(); ctx.moveTo(-16, y); ctx.lineTo(16, y); ctx.stroke(); } ctx.restore();
  ctx.save(); ctx.translate(780, DY); rr(ctx, -40, -90, 80, 90, 10); fillStroke(ctx, C.yellow, 4); ctx.beginPath(); ctx.arc(46, -48, 22, -1.4, 1.4); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
  // audience laugh: "HA" cards pop at the bottom
  if (o.laugh > 0) for (let i = 0; i < 5; i++) { const u = clamp(o.laugh * 1.6 - i * 0.12), x = 150 + i * 190, y = H2 * 0.9 - Math.sin(t * 9 + i) * 10; if (u <= 0) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * 0.12); ctx.scale(E.back(u, 2), E.back(u, 2)); CL.cutout(ctx, () => rr(ctx, -70, -44, 140, 80, 14), C.yellow, { elev: 1 }); txt(ctx, 'HA', 0, 16, 50, INK); ctx.restore(); }
  ctx.restore();
}
// the ON AIR sign
function onAir(ctx, on = 1) { CL.cutout(ctx, () => rr(ctx, -150, -50, 300, 100, 14), on ? C.red : '#6A3A3A', { elev: 1 }); txt(ctx, 'ON AIR', 0, 20, 54, on ? '#FFFDF8' : '#B88A8A'); if (on) LT.glow(ctx, 0, 0, 220, 'rgba(255,80,80,1)', 0.25); }

// ---------- living room wall (70s wallpaper) ----------
function livingRoom(ctx, x0, y0, w, h, t = 0) {
  ctx.fillStyle = '#E8C98E'; ctx.fillRect(x0, y0, w, h);
  for (let y = y0; y < y0 + h; y += 180) for (let x = x0 + ((y / 180) % 2) * 90; x < x0 + w; x += 180) { ell(ctx, x, y, 70, 70); ctx.fillStyle = '#D9A43B'; ctx.fill(); ell(ctx, x, y, 44, 44); ctx.fillStyle = '#C9772E'; ctx.fill(); ell(ctx, x, y, 18, 18); ctx.fillStyle = '#E8C98E'; ctx.fill(); }
}
// a floor lamp (base at 0)
function lamp(ctx, on = 1) { ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -700); ctx.stroke(); ell(ctx, 0, 0, 70, 18); fillStroke(ctx, '#3A3A3E', 4);
  ctx.beginPath(); ctx.moveTo(-90, -700); ctx.lineTo(90, -700); ctx.lineTo(60, -860); ctx.lineTo(-60, -860); ctx.closePath(); fillStroke(ctx, '#F2E2B8', 5); if (on) LT.glow(ctx, 0, -760, 300, 'rgba(255,220,150,1)', 0.35); }

// ---------- press release (paper, w=760): quote words with the MAY highlight; cut 0..1 removes MAY (it drops out) ----------
const QUOTE = [['“THE U.S.', 0], ['MAY', 1], ['FACE A', 0], ['SERIOUS SHORTAGE', 0], ['OF TOILET PAPER', 0], ['WITHIN A FEW', 0], ['MONTHS.”', 0]];
function pressRelease(ctx, o = {}) {
  const w = 840, h = 960, typed = o.typed ?? 1, cut = o.cut || 0;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 8), '#FFFDF6', { elev: o.elev ?? 1.6 });
  txt(ctx, 'PRESS RELEASE', -w / 2 + 50, -h / 2 + 90, 54, INK, 'left'); ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 50, -h / 2 + 116, w - 100, 6);
  txt(ctx, 'U.S. HOUSE OF REPRESENTATIVES', -w / 2 + 50, -h / 2 + 170, 28, '#5A5450', 'left'); txt(ctx, 'DEC. 11, 1973', w / 2 - 50, -h / 2 + 170, 28, '#5A5450', 'right');
  // the quote, typewriter style, line by line; words appear with `typed` (0..1 over the words)
  const lines = [[0, 1, 2], [3], [4], [5, 6]]; let n = 0, mayAt = [0, 0]; const total = QUOTE.length;
  lines.forEach((ln, li) => { let x = -w / 2 + 50; const y = -h / 2 + 300 + li * 110;
    for (const qi of ln) { const [s, hl] = QUOTE[qi]; n++; ctx.font = `66px ${F.black}`; if (hl) mayAt = [x + ctx.measureText(s).width / 2, y - 26]; const ww = ctx.measureText(s).width;
      if (n / total <= typed + 1e-6) {
        if (hl) { if (cut < 1) { const dy = E.in(clamp((cut - 0.35) / 0.65)) * 900, rot = clamp((cut - 0.35) / 0.65) * 0.6; ctx.save(); ctx.translate(x + ww / 2, y - 26 + dy); ctx.rotate(rot);
            ctx.fillStyle = C.yellow; rr(ctx, -ww / 2 - 12, -50, ww + 24, 74, 10); ctx.fill(); txt(ctx, s, 0, 24, 66, INK); if (cut > 0.3) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.strokeRect(-ww / 2 - 12, -50, ww + 24, 74); ctx.setLineDash([]); } ctx.restore(); }
          if (cut > 0.35) { ctx.fillStyle = '#3A3530'; rr(ctx, x - 12, y - 72, ww + 24, 74, 4); ctx.fill(); } // the hole left in the paper
        } else txt(ctx, s, x, y, 66, INK, 'left');
      }
      x += ww + 26; }
  });
  // signature line
  ctx.fillStyle = 'rgba(90,84,80,0.35)'; for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 + 50, h / 2 - 260 + i * 40, (i === 3 ? 0.5 : 1) * (w - 100), 12);
  txt(ctx, '— A CONGRESSMAN FROM WISCONSIN', -w / 2 + 50, h / 2 - 60, 30, '#5A5450', 'left');
  return mayAt;
}
// scissors (centred at the pivot, pointing +x), open 0..1
function scissors(ctx, s = 1, open = 0.5) {
  ctx.save(); ctx.scale(s, s); const a = open * 0.35;
  for (const sg of [-1, 1]) { ctx.save(); ctx.rotate(sg * a);
    ctx.beginPath(); ctx.moveTo(0, -10 * sg); ctx.lineTo(260, -2 * sg); ctx.lineTo(0, 14 * sg); ctx.closePath(); fillStroke(ctx, '#D8DDE3', 4);
    ell(ctx, -110, 30 * sg, 56, 36, 0.2 * sg); fillStroke(ctx, C.red, 5); ell(ctx, -110, 30 * sg, 30, 16, 0.2 * sg); ctx.fillStyle = '#FFFDF6'; ctx.fill(); ctx.lineWidth = px(ctx, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-60, 20 * sg); ctx.lineTo(0, 0); ctx.lineWidth = px(ctx, 22); ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = px(ctx, 14); ctx.strokeStyle = C.red; ctx.stroke();
    ctx.restore(); }
  ell(ctx, 0, 0, 10, 10); fillStroke(ctx, '#8E959E', 3); ctx.restore();
}

// ---------- 1970s sedan (side, faces +x, wheels on y = 0, ~700 long) ----------
function sedan(ctx, col = RUST, o = {}) {
  ctx.save(); if (o.s) ctx.scale(o.s, o.s);
  ctx.beginPath(); ctx.moveTo(-350, -40); ctx.lineTo(-350, -140); ctx.lineTo(-240, -150); ctx.lineTo(-170, -250); ctx.lineTo(150, -250); ctx.lineTo(230, -150); ctx.lineTo(350, -138); ctx.lineTo(352, -40); ctx.closePath(); fillStroke(ctx, col, 5);
  ctx.fillStyle = '#2C3A4E'; ctx.beginPath(); ctx.moveTo(-150, -235); ctx.lineTo(-20, -235); ctx.lineTo(-20, -160); ctx.lineTo(-215, -160); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(5, -235); ctx.lineTo(140, -235); ctx.lineTo(200, -160); ctx.lineTo(5, -160); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFFDF6'; ctx.fillRect(-356, -70, 712, 16); ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 3); ctx.strokeRect(-356, -70, 712, 16); // chrome bumper line
  ctx.fillStyle = shade(col, 0.25); ctx.fillRect(-340, -132, 680, 10);
  for (const x of [-220, 220]) { ell(ctx, x, -20, 62, 62); fillStroke(ctx, '#262629', 5); ell(ctx, x, -20, 30, 30); fillStroke(ctx, '#D8DDE3', 3); }
  ctx.restore();
}
// gas pump (base at 0)
function pump(ctx) {
  CL.cutout(ctx, () => rr(ctx, -90, -420, 180, 420, 20), C.red, { elev: 1.2 }); rr(ctx, -64, -380, 128, 110, 10); fillStroke(ctx, '#FFFDF6', 4);
  txt(ctx, '0.00', 0, -310, 40, INK); txt(ctx, 'GAS', 0, -200, 44, '#FFFDF8'); ell(ctx, 0, -460, 70, 50); fillStroke(ctx, '#FFFDF6', 5); txt(ctx, 'GAS', 0, -446, 36, C.red);
  ctx.strokeStyle = INK; ctx.lineWidth = px(ctx, 10); ctx.beginPath(); ctx.moveTo(90, -300); ctx.quadraticCurveTo(170, -200, 120, -120); ctx.stroke();
}
// SORRY NO GAS sign on a post (base at 0)
function noGasSign(ctx) {
  ctx.fillStyle = '#5A5450'; ctx.fillRect(-10, -520, 20, 520); ctx.save(); ctx.translate(0, -560); ctx.rotate(-0.04);
  CL.cutout(ctx, () => rr(ctx, -230, -110, 460, 220, 14), '#FFFDF6', { elev: 1.4 }); txt(ctx, 'SORRY', 0, -24, 80, C.red); txt(ctx, 'NO GAS TODAY', 0, 66, 56, INK); ctx.restore();
}

// ---------- tear-off calendar (centred), page text, flip 0..1 (top page tears up and away) ----------
function calendar(ctx, month, year, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -260, -330, 520, 660, 14), '#FFFDF6', { elev: 1.6 });
  ctx.fillStyle = C.red; rr(ctx, -260, -330, 520, 170, 14); ctx.fill(); ctx.fillRect(-260, -200, 520, 40); txt(ctx, month, 0, -222, 78, '#FFFDF8');
  ctx.fillStyle = INK; for (const x of [-150, 150]) { ell(ctx, x, -330, 18, 18); ctx.fill(); }
  txt(ctx, year, 0, 120, 210, INK);
  ctx.fillStyle = 'rgba(90,84,80,0.25)'; for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) ctx.fillRect(-220 + i * 64, 190 + j * 50, 40, 30);
}
// a newspaper front page (centred, w=820): masthead + big headline
function newspaper(ctx, head, sub, o = {}) {
  const w = 820, h = 1000;
  CL.cutout(ctx, () => rr(ctx, -w / 2, -h / 2, w, h, 6), '#F4EFE2', { elev: o.elev ?? 1.6 });
  txt(ctx, 'THE DAILY NEWS', 0, -h / 2 + 90, 70, INK, 'center', 'serif'); ctx.fillStyle = INK; ctx.fillRect(-w / 2 + 40, -h / 2 + 116, w - 80, 5); ctx.fillRect(-w / 2 + 40, -h / 2 + 128, w - 80, 2);
  txt(ctx, o.date || 'DECEMBER 1973', -w / 2 + 40, -h / 2 + 158, 24, '#5A5450', 'left');
  fitTxt(ctx, head, 0, -h / 2 + 330, 150, INK, w - 80); if (sub) fitTxt(ctx, sub, 0, -h / 2 + 410, 46, '#5A5450', w - 80);
  ctx.fillStyle = 'rgba(90,84,80,0.3)'; for (let c = 0; c < 3; c++) for (let i = 0; i < 12; i++) ctx.fillRect(-w / 2 + 40 + c * 255, -h / 2 + 470 + i * 38, i === 11 ? 120 : 225, 14);
}

// ---------- paper mill: machine with gears + conveyor of rolls (t moves the belt). Draws around (0,0) = belt left end ----------
function mill(ctx, t, o = {}) {
  const L = o.len || 1500;
  // machine
  CL.cutout(ctx, () => rr(ctx, -520, -760, 560, 760, 20), '#5E7A8C', { elev: 1.6 });
  ctx.save(); ctx.translate(-380, -560); CL.gear(ctx, 110, 10, t * 1.6, '#C9A35E'); ctx.restore();
  ctx.save(); ctx.translate(-200, -420); CL.gear(ctx, 80, 8, -t * 2.2, MUST); ctx.restore();
  rr(ctx, -480, -250, 200, 70, 10); fillStroke(ctx, '#2C3A4E', 4); txt(ctx, 'RUNNING', -380, -202, 34, '#8EF0A8');
  ell(ctx, -150, -215, 18, 18); ctx.fillStyle = (Math.floor(t * 3) % 2) ? '#8EF0A8' : '#2E6A40'; ctx.fill();
  // giant parent roll feeding in
  ctx.save(); ctx.translate(-560, -380); ctx.rotate(t * 1.2); ell(ctx, 0, 0, 170, 170); fillStroke(ctx, '#FFFDF6', 5); for (let r = 150; r > 40; r -= 22) { ell(ctx, 0, 0, r, r); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,110,95,0.4)'; ctx.stroke(); } ell(ctx, 0, 0, 34, 34); fillStroke(ctx, '#B79A74', 4); ctx.restore();
  // belt
  ctx.save(); rr(ctx, 0, -60, L, 60, 30); fillStroke(ctx, '#3A3A3E', 5); ctx.strokeStyle = '#5A5A60'; ctx.lineWidth = 4; for (let x = (t * 240) % 60; x < L; x += 60) { ctx.beginPath(); ctx.moveTo(x, -56); ctx.lineTo(x - 14, -4); ctx.stroke(); } ctx.restore();
  for (let x = 30; x < L; x += 140) { ell(ctx, x, -30, 22, 22); ctx.fillStyle = '#8E959E'; ctx.fill(); }
  // rolls riding the belt
  for (let x = (t * 240) % 180; x < L - 40; x += 180) { ctx.save(); ctx.translate(x + 60, -60); roll(ctx, 0.95); ctx.restore(); }
  // legs
  ctx.fillStyle = '#3A3A3E'; for (let x = 120; x < L; x += 460) ctx.fillRect(x, 0, 26, 260);
}
// a pallet stack of packs (warehouse), base centre at 0
function palletStack(ctx, rows = 5, cols = 3, s = 1) {
  ctx.save(); ctx.scale(s, s); rr(ctx, -cols * 130 - 20, 0, cols * 260 + 40, 40, 4); fillStroke(ctx, '#B88A52', 4);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { ctx.save(); ctx.translate(-cols * 130 + 130 + c * 260, -r * 160); pack(ctx, 1, (r + c) % 4, { elev: 0.3 }); ctx.restore(); }
  ctx.restore();
}

// ---------- signs & tags ----------
function limitSign(ctx, u = 1) {
  ctx.save(); ctx.scale(u, u); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-160, -250); ctx.lineTo(-120, -150); ctx.moveTo(160, -250); ctx.lineTo(120, -150); ctx.stroke();
  CL.cutout(ctx, () => rr(ctx, -300, -160, 600, 320, 18), C.yellow, { elev: 1.6 }); txt(ctx, 'LIMIT', 0, -50, 96, C.red); txt(ctx, '2 ROLLS', 0, 50, 84, INK); txt(ctx, 'PER CUSTOMER', 0, 120, 42, INK); ctx.restore();
}
// shelf price tag card (big): price text, strike 0..1 draws a red cross-out line
function priceCard(ctx, price, o = {}) {
  CL.cutout(ctx, () => rr(ctx, -220, -130, 440, 260, 18), o.col || '#FFFDF6', { elev: o.elev ?? 1.6 });
  txt(ctx, price, 0, 60, 170, o.fg || INK); fitTxt(ctx, 'PER ROLL', 0, 110, 32, '#5A5450', 300);
  if (o.strike > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-180, 40); ctx.lineTo(-180 + 360 * E.out(o.strike), 40 - 120 * E.out(o.strike)); ctx.stroke(); ctx.restore(); }
}
// thought bubble (centred), content(ctx)
function bubble(ctx, w, h, content, tail = [-1, 1]) {
  CL.cutout(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); }, '#FFFDF6', { elev: 1.4 });
  for (let i = 0; i < 3; i++) { const r = 26 - i * 8; CL.cutout(ctx, () => ell(ctx, tail[0] * (w * 0.3 + i * 50), tail[1] * (h / 2 + 30 + i * 50), r, r), '#FFFDF6', { elev: 1 }); }
  if (content) content(ctx);
}
// a check mark / cross (stroke) at size r
function check(ctx, r, col = '#2FA37E') { ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = r * 0.36; ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.lineTo(-r * 0.15, r * 0.45); ctx.lineTo(r * 0.7, -r * 0.5); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = r * 0.22; ctx.stroke(); ctx.restore(); }

module.exports = { W, H, layer, txt, fitTxt, AVO, MUST, RUST, BROWN, TEAL, WOOD, SHOP, HOST, EXTRAS, hostTie, roll, pack, PACKC, shelf, aisle, cart, tvSet, studio, onAir,
  livingRoom, lamp, pressRelease, scissors, sedan, pump, noGasSign, calendar, newspaper, mill, palletStack, limitSign, priceCard, bubble, check };
