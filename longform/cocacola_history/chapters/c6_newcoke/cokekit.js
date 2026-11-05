// Local props & sets for chapters 6 (New Coke) and 7 (The Real Secret). Same file in both chapter folders (keep them identical).
// Everything in the long-form look: ink outline, flat fill + one shade band, small highlights. Brand names only as plain type.
const L = require('../../../kit/look'), P = require('../../../kit/props'), { toon, LOOKS } = require('../../../kit/toon');
const { INK, CREAM, RED, YELLOW, BLUE, ink, rr, ell, poly, clamp, lerp, E, hash, fitText, darken, lighten } = L;

// ---------- generic 1985 / modern cast (no real people) ----------
const CAST = {
  scientist: { skin: '#F2C9A0', hair: { style: 'bald', col: '#8A8378' }, glasses: 'round', top: '#FFFFFF', top2: '#9CC3E0', tie: '#2F6DB5', pants: '#4A4F5C' },
  scientist2: { skin: '#B97A4E', hair: { style: 'bun', col: '#151313' }, glasses: 'round', top: '#FFFFFF', top2: '#E9E3D6', pants: '#3A3A48' },
  exec: LOOKS.exec80s,
  dad: { skin: '#E8B58A', hair: { style: 'short', col: '#5A3A22' }, stache: 1, top: '#8A5AA8', pants: '#4A3A2E', build: 'round' },
  mom: { skin: '#F2C9A0', hair: { style: 'curly', col: '#D9B25A' }, top: '#2F8A6A', pants: '#2A2A38' },
  teen: { skin: '#8E5A36', hair: { style: 'curly', col: '#151313' }, top: '#F7C548', pants: '#2F6DB5', build: 'thin' },
  trucker: { skin: '#D39A6A', hair: { style: 'short', col: '#2B1E16' }, stache: 1, top: '#D93A35', pants: '#2F4A6A', hat: 'cap', hatCol: '#2F6DB5', build: 'round' },
  protester: { skin: '#F6D3B3', hair: { style: 'long', col: '#A4462A' }, top: '#2F6DB5', pants: '#3A3A48' },
  operator: { skin: '#B97A4E', hair: { style: 'bun', col: '#2B1E16' }, top: '#E07A3A', pants: '#3A3A48' },
  operator2: { skin: '#F2C9A0', hair: { style: 'side', col: '#5A3A22' }, glasses: 'round', top: '#9CC3E0', tie: '#4A4F5C', pants: '#3A3A48' },
  operator3: { skin: '#E8B58A', hair: { style: 'long', col: '#151313' }, top: '#8A5AA8', pants: '#3A3A48' },
  grown: { skin: '#E8B58A', hair: { style: 'side', col: '#5A3A22' }, top: '#4A6A8A', top2: '#F4F0E6', pants: '#3A3A48' },
  grandpa: { skin: '#EBC09A', hair: { style: 'bald', col: '#E9E6E0' }, stache: 1, stacheCol: '#E9E6E0', glasses: 'round', top: '#7A5A3A', top2: '#F4F0E6', bow: '#D93A35', pants: '#5A4A3A', build: 'round' },
  boy: { skin: '#E8B58A', hair: { style: 'side', col: '#5A3A22' }, top: '#D93A35', pants: '#2F6DB5', build: 'thin' },
  guide: { skin: '#D39A6A', hair: { style: 'bun', col: '#2B1E16' }, glasses: 'round', top: '#2A3140', top2: '#F4F0E6', pants: '#2A3140' },
  anchor: { skin: '#F2C9A0', hair: { style: 'side', col: '#2B1E16' }, top: '#2F4A6A', top2: '#F4F0E6', tie: '#D93A35', pants: '#2F4A6A' },
  modernExec: { skin: '#8E5A36', hair: { style: 'short', col: '#151313' }, top: '#2E3440', top2: '#F4F0E6', pants: '#2E3440' },
  bottler: { skin: '#E8B58A', hair: { style: 'short', col: '#2B1E16' }, top: '#2F6DB5', pants: '#3A3A48', hat: 'helmet', hatCol: '#F7C548' },
  driver: { skin: '#B97A4E', hair: { style: 'short', col: '#151313' }, top: '#D93A35', pants: '#2A2A38', hat: 'cap', hatCol: '#D93A35' },
  shopkeeper: { skin: '#F2C9A0', hair: { style: 'long', col: '#2B1E16' }, top: '#2F8A6A', apron: '#F6EBD3', pants: '#2A2A38' },
  detective: { skin: '#E8B58A', hair: { style: 'short', col: '#5A3A22' }, stache: 1, top: '#9A7A52', top2: '#F4F0E6', tie: '#5A2A2A', pants: '#5A4A3A', hat: 'bowler', hatCol: '#6B5238' },
};

// ---------- small comic helpers ----------
const HEAD_Y = -236; // head centre above the feet at s = 1 (toon geometry)
function headset(ctx, x, y, s, flip) { ctx.save(); ctx.translate(x, y + HEAD_Y * s); ctx.scale(s * (flip ? -1 : 1), s);
  ctx.beginPath(); ctx.arc(0, -4, 70, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#4A4F5C'; ctx.stroke();
  for (const sx of [-1, 1]) { rr(ctx, sx * 66 - 12, -20, 24, 34, 8); ink(ctx, '#2A2E36', 4); }
  ctx.beginPath(); ctx.moveTo(-62, 12); ctx.quadraticCurveTo(-55, 50, -18, 50); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); ell(ctx, -14, 50, 9, 7); ink(ctx, '#2A2E36', 3); ctx.restore(); }
function blindfold(ctx, x, y, s) { ctx.save(); ctx.translate(x, y + (HEAD_Y - 9) * s); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-66, -22); ctx.quadraticCurveTo(0, -30, 66, -22); ctx.lineTo(66, 14); ctx.quadraticCurveTo(0, 6, -66, 14); ctx.closePath(); ink(ctx, '#2A2E36', 5);
  ctx.beginPath(); ctx.moveTo(62, -6); ctx.quadraticCurveTo(90, -10, 100, 12); ctx.moveTo(62, 0); ctx.quadraticCurveTo(86, 10, 92, 32); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#2A2E36'; ctx.stroke(); ctx.restore(); }
function sweat(ctx, x, y, s = 1, t = 0) { const ph = (t * 1.6) % 1; ctx.save(); ctx.translate(x, y + ph * 30 * s); ctx.scale(s, s); ctx.globalAlpha = 1 - ph * 0.6; ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(12, 2, 0, 8); ctx.quadraticCurveTo(-12, 2, 0, -18); ink(ctx, '#9CD3F0', 3.5); ctx.restore(); }
// a 1980s soda can: o.label big word, o.sub small line, o.col
function can(ctx, x, y, s = 1, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); const col = o.col || RED;
  const body = () => { ctx.beginPath(); ctx.moveTo(-40, -8); ctx.lineTo(-40, -150); ctx.quadraticCurveTo(-40, -164, -32, -168); ctx.lineTo(32, -168); ctx.quadraticCurveTo(40, -164, 40, -150); ctx.lineTo(40, -8); ctx.quadraticCurveTo(40, 0, 30, 0); ctx.lineTo(-30, 0); ctx.quadraticCurveTo(-40, 0, -40, -8); ctx.closePath(); };
  body(); ink(ctx, col, 5); L.shade(ctx, body, 1, 0.18); ctx.save(); body(); ctx.clip(); ctx.globalAlpha = 0.4; ctx.fillStyle = '#FFF'; rr(ctx, -30, -150, 9, 140, 4); ctx.fill(); ctx.restore();
  ell(ctx, 0, -168, 32, 7); ink(ctx, '#C9CDD2', 4); rr(ctx, -6, -172, 16, 6, 3); ink(ctx, '#A9AEB4', 2.5);
  rr(ctx, -40, -112, 80, 52, 2); ink(ctx, o.band || CREAM, 4); fitText(ctx, o.label || 'NEW', 0, -86, 30, o.fg || col, 70);
  if (o.face) { ctx.restore(); face(ctx, x, y - 34 * s, s * 0.85, o.face); return; }
  if (o.sub !== '') fitText(ctx, o.sub || 'COCA-COLA', 0, -36, 13, CREAM, 70); ctx.restore(); }
// protest sign with big readable words (2 lines max)
function sign(ctx, x, y, w, h, text, o = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); rr(ctx, -9, h / 2 - 10, 18, o.stick ?? 260, 4); ink(ctx, '#8A5A33', 4); rr(ctx, -w / 2, -h / 2, w, h, 6); ink(ctx, o.bg || CREAM, 6);
  const lines = text.split('|'); lines.forEach((ln, i) => fitText(ctx, ln, 0, (i - (lines.length - 1) / 2) * h * 0.38, h * (lines.length > 1 ? 0.3 : 0.42), o.fg || RED, w - 30)); ctx.restore(); }
// two dot eyes + mouth on a bottle/can (for comic "bottle reacts" beats). mood: 'happy'|'sad'|'shock'|'smug'
function face(ctx, x, y, s = 1, mood = 'happy') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sx of [-1, 1]) { ell(ctx, sx * 12, 0, 8, mood === 'shock' ? 11 : 9); ink(ctx, '#FFF', 3); ctx.beginPath(); ctx.arc(sx * 12, 2, 3.6, 0, 6.27); ctx.fillStyle = INK; ctx.fill();
    if (mood === 'sad') { ctx.beginPath(); ctx.moveTo(sx * 4, -12); ctx.lineTo(sx * 20, -16); ink(ctx, null, 3.5); } if (mood === 'smug') { ctx.beginPath(); ctx.moveTo(sx * 4, -13); ctx.lineTo(sx * 20, -10); ink(ctx, null, 3.5); } }
  ctx.beginPath(); if (mood === 'sad') { ctx.moveTo(-8, 20); ctx.quadraticCurveTo(0, 13, 8, 20); ink(ctx, null, 3.5); } else if (mood === 'shock') { ell(ctx, 0, 19, 5, 7); ink(ctx, '#5A1A1A', 3); } else { ctx.moveTo(-9, 14); ctx.quadraticCurveTo(0, 23, 9, 14); ink(ctx, null, 3.5); }
  ctx.restore(); }
function trophy(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -44, -24, 88, 24, 5); ink(ctx, '#5A3420', 5); rr(ctx, -12, -70, 24, 48, 4); ink(ctx, '#E3B23C', 5);
  ctx.beginPath(); ctx.moveTo(-50, -150); ctx.lineTo(50, -150); ctx.quadraticCurveTo(48, -70, 0, -66); ctx.quadraticCurveTo(-48, -70, -50, -150); ctx.closePath(); ink(ctx, '#F7C548', 5);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 54, -122, 20, sx > 0 ? -1.6 : 1.6, sx > 0 ? 1.6 : 4.7); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#F7C548'; ctx.stroke(); }
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFF'; rr(ctx, -34, -142, 10, 50, 4); ctx.fill(); ctx.restore(); }
function confetti(ctx, x0, x1, y0, h, t, n = 60, seed = 0) { const cols = [RED, YELLOW, BLUE, '#2F8A6A', CREAM, '#E07A3A']; for (let i = 0; i < n; i++) { const v = hash(i * 3.3 + seed), u = hash(i * 7.1 + seed), ph = (t * (0.25 + u * 0.2) + v) % 1;
  const x = lerp(x0, x1, v) + Math.sin(t * 3 + i) * 30, y = y0 + ph * h; ctx.save(); ctx.translate(x, y); ctx.rotate(t * (2 + u * 4) + i); ctx.scale(1, Math.cos(t * 5 + i)); ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-9, -5, 18, 10); ctx.restore(); } }
// red marker circle / heart / check drawn progressively (u 0..1)
function markerPath(ctx, pts, u, col = RED, w = 12) { const n = Math.max(2, Math.floor(pts.length * clamp(u))); if (u <= 0) return; ctx.save(); ctx.beginPath(); for (let i = 0; i < n; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w + 7; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); ctx.restore(); }
const ringPts = (cx, cy, rx, ry, n = 60) => Array.from({ length: n + 6 }, (_, i) => { const a = -2.2 + i / n * 6.6; return [cx + Math.cos(a) * rx * (1 + 0.04 * Math.sin(i)), cy + Math.sin(a) * ry]; });
const heartPts = (cx, cy, r, n = 90) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI + i / n * 6.283; const x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); return [cx + x * r / 16, cy - y * r / 16]; });
const checkPts = (cx, cy, r) => { const a = [[cx - r, cy], [cx - r * 0.3, cy + r * 0.7], [cx + r, cy - r * 0.9]], out = []; for (let k = 0; k < 2; k++) for (let i = 0; i <= 10; i++) out.push([lerp(a[k][0], a[k + 1][0], i / 10), lerp(a[k][1], a[k + 1][1], i / 10)]); return out; };
// big rubber stamp text (slams in at u)
function stamp(ctx, s, x, y, u, o = {}) { if (u <= 0) return; const k = u < 1 ? 1 + (1 - E.out(clamp(u))) * 1.6 : 1; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.08); ctx.scale(k, k); ctx.globalAlpha = clamp(u * 3);
  const size = o.size || 80; ctx.font = `${size}px ${L.F.black}`; const w = Math.min(ctx.measureText(s).width + size * 0.8, o.maxW || 1600), h = size * 1.5;
  rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fillStyle = 'rgba(246,235,211,0.85)'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = o.col || RED; ctx.stroke(); rr(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 8); ctx.lineWidth = 4; ctx.stroke();
  fitText(ctx, s, 0, 4, size, o.col || RED, w - size * 0.6); ctx.restore(); }
// rolling counter plate: number n formatted with commas
const fmt = n => Math.round(n).toLocaleString('en-US');
// hand-drawn wobbly arrow (pointing from (x0,y0) to (x1,y1)), drawn progressively with u
function handArrow(ctx, x0, y0, x1, y1, u, col = YELLOW, t = 0) { if (u <= 0) return; const pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1; const w = Math.sin(k * 6.5 + 0.6) * 22 * Math.sin(k * Math.PI);
    pts.push([lerp(x0, x1, k) + nx / l * w, lerp(y0, y1, k) + ny / l * w]); }
  markerPath(ctx, pts, clamp(u / 0.75), col, 18); if (u > 0.75) { const v = E.back(clamp((u - 0.75) / 0.25), 2), a = Math.atan2(y1 - pts[38][1], x1 - pts[38][0]); ctx.save(); ctx.translate(x1, y1); ctx.rotate(a); ctx.scale(v, v);
    poly(ctx, [[14, 0], [-46, -38], [-34, 0], [-46, 38]]); ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.fillStyle = col; ctx.fill(); ctx.stroke(); ctx.restore(); } }

// ---------- sets ----------
// 1985 desk with a phone (x centre, y = floor); ring 0..1 shake
function desk(ctx, x, y, w = 360, o = {}) { ctx.save(); rr(ctx, x - w / 2, y - 150, w, 26, 6); ink(ctx, o.col || '#8A6A4A', 5); rr(ctx, x - w / 2 + 14, y - 124, 26, 124, 4); ink(ctx, darken(o.col || '#8A6A4A', 0.75), 4); rr(ctx, x + w / 2 - 40, y - 124, 26, 124, 4); ink(ctx, darken(o.col || '#8A6A4A', 0.75), 4);
  rr(ctx, x + w / 2 - 140, y - 124, 100, 90, 4); ink(ctx, darken(o.col || '#8A6A4A', 0.85), 4); ctx.restore(); }
// melting phone: u 0..1 melt amount
function meltPhone(ctx, x, y, s, u, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const m = E.inOut(clamp(u));
  ctx.beginPath(); ctx.moveTo(-60, -60 + m * 20); ctx.quadraticCurveTo(0, -70 + m * 40, 60, -60 + m * 30); ctx.lineTo(70 + m * 30, 0); for (let i = 0; i <= 6; i++) { const xx = 70 + m * 30 - i * (140 + m * 60) / 6, dr = (i % 2 ? 1 : 0.4) * m * (40 + 30 * Math.sin(t * 3 + i)); ctx.lineTo(xx, dr); } ctx.closePath(); ink(ctx, '#C9302C', 5);
  ctx.beginPath(); ctx.arc(0, -32 + m * 20, 18 * (1 - m * 0.3), 0, 6.27); ink(ctx, CREAM, 4); for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i * 0.33) % 1; ctx.save(); ctx.globalAlpha = (1 - ph) * 0.6 * m; L.cloud(ctx, -30 + i * 30, -80 - ph * 120, 0.3 + ph * 0.3, '#B8B8C0'); ctx.restore(); } ctx.restore(); }
// call-centre wall board with lamps blinking
function callBoard(ctx, x, y, w, h, t, title = 'CONSUMER HOTLINE') { rr(ctx, x, y, w, h, 10); ink(ctx, '#2A2E36', 6); rr(ctx, x + 14, y + 14, w - 28, 60, 6); ink(ctx, RED, 4); fitText(ctx, title, x + w / 2, y + 45, 40, CREAM, w - 60);
  const cols = Math.floor((w - 40) / 46), rows = Math.floor((h - 110) / 40); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const on = hash(i * 13 + j * 7 + Math.floor(t * 6) * 3.1) > 0.45; ctx.beginPath(); ctx.arc(x + 40 + i * 46, y + 104 + j * 40, 12, 0, 6.27); ink(ctx, on ? '#FF5A4A' : '#5A2A2A', 3); if (on) L.glow(ctx, x + 40 + i * 46, y + 104 + j * 40, 30, '#FF5A4A', 0.25); } }
// cartoon world map (equirectangular-ish blobs) in a w x h box at (x,y top-left)
const LAND = [[[60, 80], [180, 40], [300, 50], [330, 90], [290, 130], [260, 170], [230, 205], [205, 235], [185, 262], [150, 232], [118, 190], [80, 150], [50, 110]],
  [[232, 262], [282, 272], [322, 300], [312, 352], [282, 402], [262, 442], [246, 420], [240, 370], [222, 320]], [[330, 30], [382, 20], [402, 52], [360, 72]],
  [[452, 80], [522, 58], [562, 80], [542, 122], [502, 142], [470, 132], [455, 110]], [[460, 172], [542, 160], [592, 202], [602, 262], [572, 322], [542, 372], [512, 362], [492, 302], [462, 252], [447, 202]],
  [[562, 60], [702, 40], [852, 50], [932, 92], [902, 142], [862, 182], [802, 202], [762, 242], [722, 222], [682, 202], [642, 192], [602, 162], [572, 132], [552, 100]],
  [[800, 322], [882, 312], [912, 352], [882, 392], [822, 392], [797, 362]], [[880, 230], [920, 240], [930, 270], [895, 268]]];
function worldMap(ctx, x, y, w, h, o = {}) { ctx.save(); rr(ctx, x, y, w, h, 18); ink(ctx, o.sea || '#4F8FC8', 7); ctx.save(); rr(ctx, x, y, w, h, 18); ctx.clip();
  ctx.globalAlpha = 0.18; ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 12, y); ctx.lineTo(x + i * w / 12, y + h); ctx.stroke(); } for (let j = 1; j < 6; j++) { ctx.beginPath(); ctx.moveTo(x, y + j * h / 6); ctx.lineTo(x + w, y + j * h / 6); ctx.stroke(); } ctx.globalAlpha = 1;
  for (const pg of LAND) { poly(ctx, pg.map(([a, b]) => [x + a / 1000 * w, y + b / 480 * h])); ink(ctx, o.land || '#8CCB74', 5); }
  ctx.restore(); ctx.restore(); }
const mapPt = (x, y, w, h, a, b) => [x + a / 1000 * w, y + b / 480 * h];
// spots on land for pins (deterministic), in map units
const SPOTS = [[160, 110], [220, 160], [120, 140], [260, 120], [200, 210], [270, 300], [290, 350], [255, 400], [480, 95], [520, 100], [500, 125], [540, 90], [490, 200], [530, 230], [560, 280], [520, 320], [470, 230], [600, 100], [680, 90], [760, 80],
  [840, 100], [880, 120], [700, 150], [760, 170], [820, 160], [650, 175], [730, 210], [850, 340], [880, 360], [830, 370], [900, 255], [580, 210], [440, 210], [180, 70], [300, 70], [230, 230], [565, 250], [610, 120], [800, 120], [720, 120]];
// container ship (x centre, y waterline), going right
function ship(ctx, x, y, s = 1, t = 0, o = {}) { ctx.save(); ctx.translate(x, y + Math.sin(t * 1.4 + x) * 4 * s); ctx.rotate(Math.sin(t * 1.2 + x) * 0.012); ctx.scale(s * (o.flip ? -1 : 1), s);
  poly(ctx, [[-260, -60], [250, -60], [210, 20], [-240, 20]]); ink(ctx, o.hull || '#2F4A6A', 6); rr(ctx, -250, -60, 500, 14, 3); ink(ctx, RED, 0);
  const cc = [RED, YELLOW, BLUE, '#2F8A6A', '#E07A3A', CREAM]; for (let i = 0; i < 7; i++) for (let j = 0; j < 2 + (i % 3 === 1 ? 1 : 0); j++) { rr(ctx, -200 + i * 52, -104 - j * 40, 50, 40, 3); ink(ctx, cc[(i * 3 + j) % cc.length], 4); }
  rr(ctx, 170, -170, 60, 110, 4); ink(ctx, CREAM, 5); for (let i = 0; i < 2; i++) { rr(ctx, 180 + i * 24, -155, 16, 14, 2); ink(ctx, '#9CC7E8', 2.5); } rr(ctx, 186, -205, 22, 36, 3); ink(ctx, RED, 4);
  ctx.restore(); }
// modern glass tower
function tower(ctx, x, y, w, h, col = '#9CC3E0', o = {}) { rr(ctx, x, y - h, w, h, 6); ink(ctx, col, 5); ctx.save(); rr(ctx, x, y - h, w, h, 6); ctx.clip(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFF';
  poly(ctx, [[x + w * 0.1, y - h], [x + w * 0.35, y - h], [x - w * 0.2, y], [x - w * 0.45, y]]); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = darken(col, 0.75); ctx.lineWidth = 2.5;
  for (let r = y - h + 30; r < y; r += o.floor || 34) { ctx.beginPath(); ctx.moveTo(x, r); ctx.lineTo(x + w, r); ctx.stroke(); } for (let c = x + 30; c < x + w; c += o.col || 40) { ctx.beginPath(); ctx.moveTo(c, y - h); ctx.lineTo(c, y); ctx.stroke(); } ctx.restore(); rr(ctx, x, y - h, w, h, 6); ink(ctx, null, 5); }
// window blinds (night / day)
function blinds(ctx, x, y, w, h, sky, o = {}) { rr(ctx, x, y, w, h, 6); ink(ctx, sky, 6); if (o.scene) { ctx.save(); rr(ctx, x, y, w, h, 6); ctx.clip(); o.scene(ctx); ctx.restore(); }
  for (let i = 0; i < h / 26 * (o.down ?? 0.35); i++) { rr(ctx, x - 6, y + i * 26, w + 12, 18, 4); ink(ctx, o.col || '#E9E3D6', 3); } rr(ctx, x, y, w, h, 6); ink(ctx, null, 6); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ink(ctx, null, 5); }
// potted plant / floor lamp (set dressing)
function plant(ctx, x, y, s = 1, t = 0) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4 + Math.sin(t * 1.3 + i) * 0.04; ctx.save(); ctx.translate(0, -90); ctx.rotate(a); ell(ctx, 0, -70, 20, 70); ink(ctx, i % 2 ? '#3E8E4A' : '#5FA85A', 4); ctx.restore(); }
  poly(ctx, [[-50, -100], [50, -100], [36, 0], [-36, 0]]); ink(ctx, '#C46A4A', 5); ctx.restore(); }
function floorLamp(ctx, x, y, s = 1, on = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -5, -380, 10, 380, 4); ink(ctx, '#3A3438', 4); ell(ctx, 0, -2, 46, 10); ink(ctx, '#3A3438', 4);
  poly(ctx, [[-60, -380], [60, -380], [40, -470], [-40, -470]]); ink(ctx, '#F2D9A0', 5); if (on) L.glow(ctx, 0, -400, 260, '#FFD58A', 0.4); ctx.restore(); }
function couch(ctx, x, y, w = 560, col = '#B5793F') { ctx.save(); rr(ctx, x - w / 2, y - 250, w, 150, 30); ink(ctx, col, 6); rr(ctx, x - w / 2 - 30, y - 170, 70, 150, 24); ink(ctx, darken(col, 0.9), 6); rr(ctx, x + w / 2 - 40, y - 170, 70, 150, 24); ink(ctx, darken(col, 0.9), 6);
  rr(ctx, x - w / 2 + 30, y - 120, w - 60, 90, 18); ink(ctx, lighten(col, 0.1), 6); rr(ctx, x - w / 2, y - 30, 20, 30, 4); ink(ctx, '#3A2A24', 4); rr(ctx, x + w / 2 - 20, y - 30, 20, 30, 4); ink(ctx, '#3A2A24', 4); ctx.restore(); }
// 1980s TV on a cabinet (screen callback)
function tv85(ctx, x, y, s, screen) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(ctx, -170, -120, 340, 120, 8); ink(ctx, '#6B4123', 5); rr(ctx, -150, -400, 300, 280, 18); ink(ctx, '#3A3438', 6);
  rr(ctx, -130, -380, 220, 200, 22); ink(ctx, '#1E2A2E', 5); if (screen) { ctx.save(); rr(ctx, -126, -376, 212, 192, 20); ctx.clip(); screen(ctx, -126, -376, 212, 192); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#FFF'; rr(ctx, -120, -370, 60, 180, 18); ctx.fill(); ctx.restore(); }
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(120, -350 + i * 50, 12, 0, 6.27); ink(ctx, '#C9CDD2', 4); } ctx.beginPath(); ctx.moveTo(-40, -400); ctx.lineTo(-90, -480); ctx.moveTo(40, -400); ctx.lineTo(90, -480); ink(ctx, null, 4); ctx.restore(); }
// spray particles (spit-take) from (x,y) towards dir, u 0..1
function spray(ctx, x, y, u, dir = 1, col = '#5A2E18') { if (u <= 0 || u >= 1) return; ctx.save(); for (let i = 0; i < 26; i++) { const a = (hash(i * 3.7) - 0.5) * 0.9, v = 300 + hash(i * 1.9) * 500, d = u * v; ctx.globalAlpha = 1 - u;
  ctx.beginPath(); ctx.arc(x + Math.cos(a) * d * dir, y + Math.sin(a) * d + u * u * 160, 6 + hash(i) * 7, 0, 6.27); ink(ctx, col, 2.5); } ctx.restore(); }
// tear-off calendar with rotating day pages
function bigCalendar(ctx, x, y, s, top, big, small, flip = 0, prev = '') { P.calendar(ctx, x, y, s, top, big, small); if (flip > 0 && flip < 0.5) { ctx.save(); ctx.translate(x, y - 56 * s); ctx.scale(s, s); ctx.transform(1, 0, 0, Math.cos(flip * Math.PI), 0, 0); rr(ctx, -90, 0, 180, 166, 8); ink(ctx, CREAM, 5); fitText(ctx, big, 0, 36, 40, INK, 160); fitText(ctx, prev, 0, 106, 70, INK, 160); ctx.restore(); } }
// a museum display: pedestal + glass case
function pedestal(ctx, x, y, w = 260, h = 220, label = '') { rr(ctx, x - w / 2 - 20, y - 24, w + 40, 24, 4); ink(ctx, '#C9C1B0', 5); rr(ctx, x - w / 2, y - h, w, h - 24, 4); ink(ctx, '#E9E3D6', 5); L.shade(ctx, () => rr(ctx, x - w / 2, y - h, w, h - 24, 4), 1, 0.12);
  rr(ctx, x - w / 2 - 20, y - h - 22, w + 40, 24, 4); ink(ctx, '#C9C1B0', 5); if (label) { rr(ctx, x - w * 0.38, y - h * 0.62, w * 0.76, 56, 4); ink(ctx, '#B8954F', 4); fitText(ctx, label, x, y - h * 0.62 + 29, 24, INK, w * 0.7, { font: L.F.type }); } }
function glassCase(ctx, x, y, w, h) { ctx.save(); rr(ctx, x - w / 2, y - h, w, h, 6); ctx.fillStyle = 'rgba(200,230,245,0.18)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(28,26,31,0.8)'; ctx.stroke();
  ctx.globalAlpha = 0.4; ctx.fillStyle = '#FFF'; poly(ctx, [[x - w / 2 + 20, y - h + 10], [x - w / 2 + 50, y - h + 10], [x - w / 2 + 10, y - h * 0.4], [x - w / 2 + 10, y - h * 0.6]]); ctx.fill(); ctx.restore(); }
function column(ctx, x, y, h, w = 90, col = '#E9E3D6') { rr(ctx, x - w / 2 - 16, y - 30, w + 32, 30, 4); ink(ctx, col, 5); rr(ctx, x - w / 2, y - h + 30, w, h - 60, 2); ink(ctx, col, 5); ctx.save(); ctx.strokeStyle = darken(col, 0.8); ctx.lineWidth = 3; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - w / 2 + i * w / 4, y - h + 34); ctx.lineTo(x - w / 2 + i * w / 4, y - 34); ctx.stroke(); } ctx.restore();
  rr(ctx, x - w / 2 - 20, y - h, w + 40, 34, 4); ink(ctx, col, 5); }
// spotlight cone from above
function spot(ctx, x, y0, y1, w0, w1, a = 0.25, col = '#FFF4D6') { ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; poly(ctx, [[x - w0 / 2, y0], [x + w0 / 2, y0], [x + w1 / 2, y1], [x - w1 / 2, y1]]); ctx.fill(); ctx.restore(); }
// modern store (shopfront with fridges)
function store(ctx, x, y, w, h, sign = 'MARKET', col = '#2F8A6A') { ctx.save(); rr(ctx, x, y - h, w, h, 6); ink(ctx, '#E9EDF2', 6); rr(ctx, x + 10, y - h + 12, w - 20, 60, 6); ink(ctx, col, 4); fitText(ctx, sign, x + w / 2, y - h + 43, 36, CREAM, w - 50);
  rr(ctx, x + 24, y - h + 96, w * 0.62, h - 110, 6); ink(ctx, '#BFE3F0', 5); for (let i = 0; i < 3; i++) { rr(ctx, x + 40 + i * (w * 0.6 - 30) / 3, y - h + 112, (w * 0.6 - 60) / 3, h - 150, 4); ink(ctx, '#F4F7FA', 3); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) P.bottle(ctx, x + 58 + i * (w * 0.6 - 30) / 3 + c * 28, y - h + 168 + r * (h - 170) / 3.4, 0.2, { kind: 'modern', label: '' }); }
  rr(ctx, x + w * 0.7, y - h + 96, w * 0.24, h - 96, 4); ink(ctx, '#7FB2E5', 5); ctx.restore(); }
module.exports = { sign, CAST, HEAD_Y, headset, blindfold, sweat, can, face, trophy, confetti, markerPath, ringPts, heartPts, checkPts, stamp, fmt, handArrow, desk, meltPhone, callBoard, worldMap, mapPt, SPOTS, LAND, ship, tower, blinds, plant, floorLamp, couch, tv85, spray, bigCalendar, pedestal, glassCase, column, spot, store };
