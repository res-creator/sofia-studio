// How It's Run LONG-FORM look (16:9): palette per era, ink outline, textures, light, text plates.
// Original visual identity for the long-form line (see longform/cocacola_history/STYLE.md). Independent from the Shorts look.
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const K = require('../../tests/mcd_collage/kit'); // fonts registered there (K.F.black / K.F.xb) + easing helpers
const { clamp, lerp, seg, E, hash } = K;
const W = 1920, H = 1080, FPS = 30;
const INK = '#1C1A1F', CREAM = '#F6EBD3', RED = '#D93A35', YELLOW = '#F7C548', BLUE = '#2F6DB5';
const F = { black: K.F.black, xb: K.F.xb, type: 'TypeW, monospace' };
// era palettes: wall/sky/ground/wood/accent/shadow tint/light colour
const ERA = {
  gaslight: { sky: ['#2E2440', '#7A4B5A'], wall: '#C98E5A', wall2: '#A9693E', wood: '#7A4A2A', wood2: '#5A3420', floor: '#8C5A34', accent: '#D93A35', light: '#FFD58A', tint: 'rgba(255,170,80,0.10)' },
  sepia:    { sky: ['#F3D9A6', '#E9B97A'], wall: '#E2C394', wall2: '#C9A06A', wood: '#8A5A33', wood2: '#6B4123', floor: '#B98A55', accent: '#D93A35', light: '#FFF0C8', tint: 'rgba(255,200,120,0.08)' },
  industry: { sky: ['#9DB4C0', '#D9CDB0'], wall: '#9A5B44', wall2: '#7E4634', wood: '#6E5038', wood2: '#4F3826', floor: '#7D7468', accent: '#D93A35', light: '#FFE7B0', tint: 'rgba(120,140,160,0.08)' },
  jazz:     { sky: ['#7FC3E8', '#D8F0F7'], wall: '#E8D2A6', wall2: '#C8A877', wood: '#9A6A3E', wood2: '#734B29', floor: '#C9B58C', accent: '#D93A35', light: '#FFF4D6', tint: 'rgba(255,230,180,0.06)' },
  war:      { sky: ['#8FA3A8', '#CFC7A8'], wall: '#7C8456', wall2: '#5E6640', wood: '#7A6040', wood2: '#5A4428', floor: '#8E8460', accent: '#D93A35', light: '#FFE9B8', tint: 'rgba(110,120,80,0.10)' },
  pop:      { sky: ['#3FA9F5', '#BDE8FF'], wall: '#FFD9A0', wall2: '#F2A65A', wood: '#B5793F', wood2: '#8C5A2B', floor: '#E9D3A6', accent: '#E8322E', light: '#FFFFFF', tint: 'rgba(255,255,255,0)' },
  tense:    { sky: ['#1E2A44', '#5B3B5E'], wall: '#5A6378', wall2: '#424A5C', wood: '#5B4636', wood2: '#3E2F24', floor: '#3A3F4D', accent: '#E8322E', light: '#C9D8FF', tint: 'rgba(40,50,90,0.14)' },
  modern:   { sky: ['#2D8CF0', '#A8DCFF'], wall: '#EDEFF3', wall2: '#C9D1DC', wood: '#B48A5E', wood2: '#8A6642', floor: '#D9DDE3', accent: '#E8322E', light: '#FFFFFF', tint: 'rgba(255,255,255,0)' },
};
const SKIN = ['#F2C9A0', '#E8B58A', '#D39A6A', '#B97A4E', '#8E5A36', '#6B4026', '#F6D3B3'];

// ---------- drawing helpers ----------
const lwOf = (ctx, px) => { const m = ctx.getTransform(); const sc = Math.hypot(m.a, m.b) || 1; return px / sc; }; // constant on-screen width
function ink(ctx, fill, lw = 5, o = {}) { if (fill) { ctx.fillStyle = fill; ctx.fill(o.rule || 'nonzero'); } if (lw) { ctx.lineWidth = o.abs ? lwOf(ctx, lw) : lw; ctx.strokeStyle = o.stroke || INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); } }
function rr(ctx, x, y, w, h, r) { r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2 - 0.0001); ctx.closePath(); }
function poly(ctx, pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); }
function shade(ctx, build, side = 1, a = 0.16) { // cel shade: darker band on one side of the current shape
  ctx.save(); build(); ctx.clip(); ctx.globalAlpha *= a; ctx.fillStyle = '#000'; ctx.fillRect(side > 0 ? 0 : -10000, -10000, 10000 * side * side, 20000); ctx.restore(); }
function shadeRect(ctx, build, x0, y0, w, h, a = 0.16) { ctx.save(); build(); ctx.clip(); ctx.globalAlpha *= a; ctx.fillStyle = '#000'; ctx.fillRect(x0, y0, w, h); ctx.restore(); }
function contact(ctx, x, y, w, a = 0.22) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#000'; ell(ctx, x, y, w, w * 0.16); ctx.fill(); ctx.restore(); }
const darken = (c, k = 0.8) => { const n = parseInt(c.slice(1), 16); const f = v => Math.round(clamp(v * k, 0, 255)); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
const lighten = (c, k = 0.2) => { const n = parseInt(c.slice(1), 16); const f = v => Math.round(v + (255 - v) * k); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };

// ---------- textures (deterministic) ----------
function bricks(ctx, x, y, w, h, col, o = {}) { // brick wall with mortar lines and colour variation
  const bw = o.bw || 64, bh = o.bh || 26; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = o.mortar || darken(col, 0.72); ctx.fillRect(x, y, w, h);
  for (let r = 0, yy = y; yy < y + h; r++, yy += bh) for (let xx = x - (r % 2) * bw / 2; xx < x + w; xx += bw) {
    const v = hash(r * 131 + Math.round(xx)); ctx.fillStyle = v < 0.15 ? darken(col, 0.88) : v > 0.88 ? lighten(col, 0.1) : col; ctx.fillRect(xx + 2, yy + 2, bw - 4, bh - 4); }
  ctx.restore(); }
function planks(ctx, x, y, w, h, col, o = {}) { // horizontal (o.vertical) wood planks with grain
  const pw = o.pw || 34; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
  const n = Math.ceil((o.vertical ? w : h) / pw);
  for (let i = 0; i < n; i++) { const v = hash(i * 17 + 3); ctx.fillStyle = v > 0.6 ? lighten(col, 0.07) : v < 0.25 ? darken(col, 0.92) : col;
    if (o.vertical) ctx.fillRect(x + i * pw, y, pw, h); else ctx.fillRect(x, y + i * pw, w, pw);
    ctx.strokeStyle = darken(col, 0.7); ctx.lineWidth = 2; ctx.beginPath(); if (o.vertical) { ctx.moveTo(x + i * pw, y); ctx.lineTo(x + i * pw, y + h); } else { ctx.moveTo(x, y + i * pw); ctx.lineTo(x + w, y + i * pw); } ctx.stroke();
    ctx.globalAlpha = 0.18; ctx.strokeStyle = darken(col, 0.6); ctx.lineWidth = 1.5;
    for (let g = 0; g < 3; g++) { const gy = (o.vertical ? x + i * pw : y + i * pw) + pw * (0.25 + g * 0.25); ctx.beginPath();
      if (o.vertical) { ctx.moveTo(gy, y); ctx.bezierCurveTo(gy + 4, y + h * 0.3, gy - 4, y + h * 0.6, gy, y + h); } else { ctx.moveTo(x, gy); ctx.bezierCurveTo(x + w * 0.3, gy + 3, x + w * 0.6, gy - 3, x + w, gy); } ctx.stroke(); }
    ctx.globalAlpha = 1; }
  ctx.restore(); }
function tiles(ctx, x, y, w, h, a, b, s = 60) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); for (let i = 0; i * s < w + s; i++) for (let j = 0; j * s < h + s; j++) { ctx.fillStyle = (i + j) % 2 ? a : b; ctx.fillRect(x + i * s, y + j * s, s, s); } ctx.restore(); }
function stripes(ctx, x, y, w, h, a, b, s = 40, vertical = true) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = a; ctx.fillRect(x, y, w, h); ctx.fillStyle = b; for (let i = 0; i * s < (vertical ? w : h); i += 2) vertical ? ctx.fillRect(x + i * s, y, s, h) : ctx.fillRect(x, y + i * s, w, s); ctx.restore(); }
function wallpaper(ctx, x, y, w, h, base, dot, s = 46) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = base; ctx.fillRect(x, y, w, h); ctx.fillStyle = dot;
  for (let i = 0; i * s < w + s; i++) for (let j = 0; j * s < h + s; j++) { const cx = x + i * s + (j % 2) * s / 2, cy = y + j * s; ctx.beginPath(); ctx.moveTo(cx, cy - 7); ctx.lineTo(cx + 5, cy); ctx.lineTo(cx, cy + 7); ctx.lineTo(cx - 5, cy); ctx.closePath(); ctx.fill(); } ctx.restore(); }

// ---------- light & atmosphere ----------
function skyGrad(ctx, x, y, w, h, [a, b]) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
function glow(ctx, x, y, r, col = '#FFD58A', a = 0.5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function cloud(ctx, x, y, s = 1, col = '#FFFFFF') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); [[-60, 0, 40], [-20, -22, 48], [30, -14, 42], [62, 4, 32], [0, 8, 44]].forEach(([cx, cy, r]) => { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, 6.28); }); ink(ctx, col, 0); ctx.restore(); }
// whole-frame finish: era tint, vignette, paper grain (cached)
let GRAIN = null;
function finish(ctx, era = 'sepia', o = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const P = ERA[era] || ERA.sepia; if (P.tint) { ctx.fillStyle = P.tint; ctx.fillRect(0, 0, W, H); }
  const v = o.vignette ?? 0.32; const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,10,0,${v})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!GRAIN) { GRAIN = createCanvas(W, H); const gx = GRAIN.getContext('2d'); const id = gx.createImageData(W, H); for (let i = 0; i < W * H; i++) { const n = 128 + (hash(i * 7.31) - 0.5) * 60; id.data[i * 4] = n; id.data[i * 4 + 1] = n * 0.97; id.data[i * 4 + 2] = n * 0.9; id.data[i * 4 + 3] = 255; } gx.putImageData(id, 0, 0); }
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? 0.16; ctx.drawImage(GRAIN, 0, 0); ctx.restore(); }

// ---------- text ----------
function fitText(ctx, s, x, y, size, col, maxW, o = {}) { ctx.font = `${o.weight || ''} ${size}px ${o.font || F.black}`; let sz = size; while (ctx.measureText(s).width > maxW && sz > 10) { sz -= 2; ctx.font = `${size === sz ? '' : ''}${sz}px ${o.font || F.black}`; }
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; if (o.outline) { ctx.lineWidth = o.outline; ctx.strokeStyle = o.oc || INK; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); } ctx.fillStyle = col; ctx.fillText(s, x, y); return sz; }
// paper "callout" plate for dates, sums, key words: pops in with u (0..1), slight tilt, ink outline + drop shadow
function plate(ctx, s, x, y, u, o = {}) {
  if (u <= 0) return; const size = o.size || 64; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03); const k = E.back ? E.back(clamp(u), 2.2) : u; ctx.scale(k, k);
  ctx.font = `${size}px ${o.font || F.black}`; const w = Math.min(ctx.measureText(s).width + size * 0.9, o.maxW || 1500), h = size * 1.45;
  ctx.save(); ctx.translate(8, 10); ctx.globalAlpha = 0.28; rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();
  rr(ctx, -w / 2, -h / 2, w, h, 14); ink(ctx, o.bg || CREAM, 5);
  fitText(ctx, s, 0, size * 0.04, size, o.fg || INK, w - size * 0.6, { font: o.font });
  ctx.restore(); }
// big date: typewriter-style year on a torn paper strip
function dateCard(ctx, s, x, y, u, o = {}) { plate(ctx, s, x, y, u, { size: o.size || 92, bg: o.bg || YELLOW, fg: INK, rot: o.rot ?? 0.03, font: F.black }); }
// chapter title card: number + title; u in 0..1 (in), v 0..1 (out)
function chapterCard(ctx, n, title, sub, u, era = 'sepia') {
  if (u <= 0) return; ctx.save(); const P = ERA[era] || ERA.sepia;
  ctx.globalAlpha = clamp(u * 3); ctx.fillStyle = 'rgba(20,14,10,0.55)'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const k = E.back(clamp(u * 1.6), 1.8); ctx.translate(W / 2, H / 2); ctx.rotate(-0.025); ctx.scale(k, k);
  rr(ctx, -560, -190, 1120, 380, 26); ink(ctx, CREAM, 7);
  rr(ctx, -560, -190, 1120, 90, 26); ink(ctx, P.accent || RED, 7);
  fitText(ctx, n, 0, -145, 46, CREAM, 900, { font: F.black });
  fitText(ctx, title, 0, 10, 104, INK, 1020);
  if (sub) fitText(ctx, sub, 0, 120, 46, '#5A4A3A', 1000, { font: F.type });
  ctx.restore(); }
// on-screen key word (no subtitle band in the long-form): bold word with ink outline, pops at u
function word(ctx, s, x, y, u, o = {}) { if (u <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.04); const k = E.back(clamp(u), 2.5); ctx.scale(k, k);
  fitText(ctx, s, 0, 0, o.size || 110, o.col || YELLOW, o.maxW || 1600, { outline: (o.size || 110) * 0.16, oc: INK }); ctx.restore(); }

module.exports = { W, H, FPS, INK, CREAM, RED, YELLOW, BLUE, F, ERA, SKIN, ink, rr, ell, poly, shade, shadeRect, contact, darken, lighten, bricks, planks, tiles, stripes, wallpaper, skyGrad, glow, cloud, finish, fitText, plate, dateCard, chapterCard, word, lwOf, K, clamp, lerp, seg, E, hash };
