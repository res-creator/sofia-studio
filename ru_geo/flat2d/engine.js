// Плоский 2D-мультфильм: движок (персонажи, камера, субтитры, титры, инфокарточки). Всё рисуется кодом, canvas 1920×1080, 30 к/с.
export const W = 1920, H = 1080, FPS = 30, INK = '#2a2230';
export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export let g = null; export let LW = 7; let ENV = [];
export const SCENES = {};            // имя -> { bg(st), fg(st) }
export const EMBLEMS = {}; export const CARD_BG = {};           // эмблемы для титров глав
export function init(canvas, env) { g = canvas.getContext('2d'); ENV = env || []; }
// ---------- архивные фото ----------
export const PHOTOS = {}; export const CREDITS = {};
export async function loadPhotos(film) {
  let cr = {}; try { cr = await (await fetch(`/${film}/archive/credits.json`)).json(); } catch (e) { return; }
  Object.assign(CREDITS, cr);
  await Promise.all(Object.keys(cr).map((k) => new Promise((res) => { const im = new Image(); im.onload = () => { PHOTOS[k] = im; res(); }; im.onerror = () => { console.log('ERR photo ' + k); res(); }; im.src = `/${film}/archive/img/${cr[k].file}`; })));
}
let GRAIN = null;
export function grain(t, a = 0.1) {
  if (!GRAIN) { GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 256; const x = GRAIN.getContext('2d'), d = x.createImageData(256, 256); let r = 1; for (let i = 0; i < d.data.length; i += 4) { r = (r * 1664525 + 1013904223) >>> 0; const v = r >>> 24; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); }
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'overlay'; const ox = (Math.floor(t * 24) * 53) % 256, oy = (Math.floor(t * 24) * 97) % 256; for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) g.drawImage(GRAIN, x, y); g.restore();
}
/** фото на весь кадр (cover) в мировых координатах 0..W, 0..H; tone: color | bw | sepia */
export function drawPhoto(key, tone = 'color', dim = 0.12) {
  const im = PHOTOS[key]; g.fillStyle = '#0c0c10'; g.fillRect(-1400, -400, 4800, 1900); if (!im) return;
  const cs = Math.max(W / im.width, H / im.height) * 1.02, w = im.width * cs, h = im.height * cs;
  g.save(); g.filter = tone === 'bw' ? 'grayscale(1) contrast(1.08) brightness(.95)' : tone === 'sepia' ? 'grayscale(1) sepia(.55) contrast(1.08) brightness(.92)' : 'saturate(.9) contrast(1.05)'; g.drawImage(im, W / 2 - w / 2, H / 2 - h / 2, w, h); g.restore();
  g.fillStyle = `rgba(20,12,6,${dim})`; g.fillRect(0, 0, W, H);
}
/** фото-«открытка», приколотая поверх сцены */
export function polaroid(key, x, y, w, rot = 0, note = '') {
  const im = PHOTOS[key]; if (!im) return; const h = w * im.height / im.width;
  g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = '#f7f4ec'; g.fillRect(-w / 2 - 18, -h / 2 - 18, w + 36, h + 80); g.shadowColor = 'transparent'; g.drawImage(im, -w / 2, -h / 2, w, h);
  if (note) { g.font = '900 34px Nunito'; g.fillStyle = INK; g.textAlign = 'center'; g.fillText(note, 0, h / 2 + 46); } g.restore();
}

// ---------- примитивы ----------
export const poly = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
export const rrect = (x, y, w, h, r = 0) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
export const ell = (x, y, rx, ry, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); };
export const circ = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); };
export const fillO = (fill, w = LW) => { if (fill) { g.fillStyle = fill; g.fill(); } g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
export const R = (x, y, w, h, fill, r = 0, lw) => { rrect(x, y, w, h, r); fillO(fill, lw); };
export const P = (pts, fill, lw) => { poly(pts); fillO(fill, lw); };
export const E = (x, y, rx, ry, fill, lw) => { ell(x, y, rx, ry); fillO(fill, lw); };
export const C = (x, y, r, fill, lw) => { circ(x, y, r); fillO(fill, lw); };
export const line = (pts, w = LW, col = INK) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
export const shade = (pathFn, x0, a = 0.14, y0 = -600, y1 = 600) => { g.save(); pathFn(); g.clip(); g.fillStyle = `rgba(40,10,40,${a})`; g.fillRect(x0, y0, 600, y1 - y0); g.restore(); };
export const setLW = (v) => { LW = v; };
export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
function tube(a, w, fill) { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = w + LW * 1.6; g.beginPath(); a.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.strokeStyle = fill; g.lineWidth = w; g.beginPath(); a.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }

// ---------- общие декорации ----------
export const windows = (x, y, w, h, cols, rows, fill = '#8fa3b8', lit = null, seed = 1) => { const r = rng(seed), cw = w / cols, ch = h / rows; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { g.fillStyle = lit && r() < lit ? '#ffe28a' : fill; g.fillRect(x + i * cw + cw * 0.2, y + j * ch + ch * 0.2, cw * 0.6, ch * 0.55); } };
export const building = (x, y, w, h, fill, o = {}) => { R(x, y - h, w, h, fill, 0, o.lw || 5); windows(x, y - h, w, h, o.cols || Math.max(2, Math.round(w / 46)), o.rows || Math.max(2, Math.round(h / 50)), o.win || '#8fa3b8', o.lit, o.seed || 1); if (o.roof) { R(x - 6, y - h - 10, w + 12, 12, o.roof, 3, 4); } };
export const tree = (x, y, s = 1, fill = '#6aa84f', trunk = '#7a4a22') => { R(x - 8 * s, y - 80 * s, 16 * s, 80 * s, trunk, 3, 4); C(x, y - 110 * s, 52 * s, fill, 5); C(x - 34 * s, y - 80 * s, 34 * s, fill, 5); C(x + 34 * s, y - 84 * s, 36 * s, fill, 5); };
export const cloud = (x, y, s = 1, fill = '#ffffff') => { g.save(); g.translate(x, y); g.scale(s, s); ell(0, 0, 90, 34); fillO(fill, 5); ell(-50, -18, 44, 30); fillO(fill, 5); ell(30, -26, 52, 36); fillO(fill, 5); ell(0, 0, 88, 32); g.fillStyle = fill; g.fill(); g.restore(); };
export const stack = (x, y, h = 330, w = 44) => { const n = 7, sh = h / n; for (let i = 0; i < n; i++) { const wi = lerp(w, w * 0.72, i / n), wj = lerp(w, w * 0.72, (i + 1) / n); P([[x - wi / 2, y - i * sh], [x + wi / 2, y - i * sh], [x + wj / 2, y - (i + 1) * sh], [x - wj / 2, y - (i + 1) * sh]], i % 2 ? '#ffffff' : '#e0443a', 5); } };
export const star = (x, y, r, fill = '#ffe28a') => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } P(p, fill, 4); };
export const ferris = (x, y, r = 120) => { g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.strokeStyle = '#d8423a'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; line([[x + Math.cos(a) * r, y + Math.sin(a) * r], [x - Math.cos(a) * r, y - Math.sin(a) * r]], 5, '#e8d8b0'); } for (let i = 0; i < 12; i++) { const a = i * TAU / 12; R(x + Math.cos(a) * r - 9, y + Math.sin(a) * r - 8, 18, 22, ['#ffd24a', '#4aa3e0', '#ef7d92'][i % 3], 4, 4); } P([[x - 8, y], [x + 8, y], [x + r * 0.5, y + r * 1.4], [x - r * 0.5, y + r * 1.4]], '#6a6a6a', 4); };
export const bus = (x, y, s = 1, col = '#e8a21c', open = 0) => { g.save(); g.translate(x, y); g.scale(s, s); R(-150, -150, 300, 130, col, 20, 6); R(-150, -60, 300, 16, '#b87b10', 4, 5); for (let i = 0; i < 5; i++) R(-132 + i * 54, -132, 44, 46, '#bfe6f6', 6, 5); C(-88, -18, 24, '#3a3a44', 6); C(88, -18, 24, '#3a3a44', 6); C(-88, -18, 9, '#cfcfd6', 4); C(88, -18, 9, '#cfcfd6', 4); R(110, -112, 26, 64, '#bfe6f6', 4, 5); R(-160, -48, 14, 16, '#ffd24a', 4, 4); g.restore(); };
export const truck = (x, y, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); R(-150, -130, 250, 106, '#d8362d', 10, 6); R(100, -110, 90, 86, '#d8362d', 12, 6); R(112, -98, 60, 38, '#bfe6f6', 6, 5); R(-130, -96, 200, 14, '#fff', 3, 4); C(-90, -20, 26, '#3a3a44', 6); C(120, -20, 26, '#3a3a44', 6); R(-110, -160, 120, 20, '#cfcfd6', 6, 5); R(-60, -176, 50, 18, '#ffd24a', 5, 5); g.restore(); };
export const smoke = (x, y, t, n = 5, col = '#bdbdc8') => { for (let i = 0; i < n; i++) { const k = ((t * 0.25 + i / n) % 1); C(x + Math.sin(k * 6 + i) * 24 + k * 30, y - k * 260, 24 + k * 50, col, 5); } };
export const flame = (x, y, s = 1, t = 0) => { g.save(); g.translate(x, y); g.scale(s, s); const w = Math.sin(t * 9) * 5; P([[-40, 0], [-30, -60 + w], [-12, -30], [-2, -110 - w], [14, -40], [30, -80 + w], [42, 0]], '#ff8a1e', 5); P([[-22, 0], [-14, -36], [0, -64 - w], [12, -34], [24, 0]], '#ffd24a', 4); g.restore(); };
export const person_silhouette = (x, y, s = 1, col = '#5b5b6a') => { g.save(); g.translate(x, y); g.scale(s, s); C(0, -92, 18, col, 4); P([[-18, -72], [18, -72], [24, -20], [-24, -20]], col, 4); R(-16, -22, 12, 22, col, 4, 4); R(4, -22, 12, 22, col, 4, 4); g.restore(); };

// ---------- персонажи ----------
const SKIN = '#f7c9a0', SKIN2 = '#d9a273', SKIN3 = '#f2b891';
export const WHO = {
  boy: { shirt: '#19b8b0', pants: '#3b5b9c', hair: '#8a4b2a', hairType: 'spiky', sole: '#e5483a', style: 'tee', skin: SKIN },
  mom: { shirt: '#c8503a', pants: '#5a3b4a', hair: '#3b2a30', hairType: 'bun', sole: '#7a4a2a', style: 'dress', skin: SKIN },
  fireman: { shirt: '#4a5568', pants: '#4a5568', hair: '#5a3a22', hairType: 'short', sole: '#2a2a30', style: 'jacket', skin: SKIN3, acc: ['helmet', 'stripes'] },
  lieut: { shirt: '#4a5568', pants: '#4a5568', hair: '#3a2a22', hairType: 'short', sole: '#2a2a30', style: 'jacket', skin: SKIN, acc: ['cap', 'stripes'] },
  worker: { shirt: '#f2f2f2', pants: '#4a5568', hair: '#6a4a2a', hairType: 'short', sole: '#2a2a30', style: 'jacket', skin: SKIN, acc: ['hardhat'] },
  granny: { shirt: '#8a5a9c', pants: '#5a3b4a', hair: '#cfcfd8', hairType: 'bun', sole: '#5a3a22', style: 'dress', skin: SKIN2, acc: ['scarf'] },
  teacher: { shirt: '#7a9c4a', pants: '#3b3b4a', hair: '#7a4a2a', hairType: 'bob', sole: '#2a2a30', style: 'dress', skin: SKIN, acc: ['glasses'] },
  swede: { shirt: '#f5a623', pants: '#3b5b7c', hair: '#f0d070', hairType: 'short', sole: '#2a2a30', style: 'jacket', skin: SKIN, acc: ['hivis'] },
  anchor: { shirt: '#2f3f5f', pants: '#2f3f5f', hair: '#3a3a40', hairType: 'short', sole: '#1a1a20', style: 'jacket', skin: SKIN, acc: ['tie'] },
  militia: { shirt: '#5a6a7a', pants: '#3b3b4a', hair: '#3a2a22', hairType: 'short', sole: '#1a1a20', style: 'jacket', skin: SKIN, acc: ['cap', 'mask'] },
  dad: { shirt: '#6a7a5a', pants: '#3b4a5a', hair: '#4a3022', hairType: 'short', sole: '#2a2a30', style: 'jacket', skin: SKIN },
  kid2: { shirt: '#ef7d92', pants: '#3b5b9c', hair: '#3a2a22', hairType: 'bun', sole: '#e5483a', style: 'tee', skin: SKIN },
  // Титаник
  shon: { shirt: '#b8a07a', pants: '#4a4a52', hair: '#c4622d', hairType: 'spiky', sole: '#3a2a22', style: 'vest', skin: SKIN, acc: ['flatcap'] },
  smom: { shirt: '#5a7ab0', pants: '#5a3b4a', hair: '#e8c870', hairType: 'bun', sole: '#5a3a22', style: 'dress', skin: SKIN, acc: ['scarf'] },
  sboy: { shirt: '#ef7d92', pants: '#3b5b9c', hair: '#f0d070', hairType: 'short', sole: '#3a2a22', style: 'tee', skin: SKIN },
  steward: { shirt: '#f4f4f4', pants: '#2f3f5f', hair: '#3a2a22', hairType: 'short', sole: '#1a1a20', style: 'jacket', skin: SKIN, acc: ['cap', 'tie'] },
  officer: { shirt: '#1f2f5a', pants: '#1f2f5a', hair: '#3a3a40', hairType: 'short', sole: '#1a1a20', style: 'jacket', skin: SKIN, acc: ['cap', 'beard', 'buttons'] },
  brother: { shirt: '#6a5a4a', pants: '#3b3b4a', hair: '#c4622d', hairType: 'short', sole: '#3a2a22', style: 'vest', skin: SKIN, acc: ['hat'] },
  sailor: { shirt: '#e8e8f0', pants: '#2f3f5f', hair: '#6a4a2a', hairType: 'short', sole: '#2a2a30', style: 'jacket', skin: SKIN, acc: ['cap'] },
  kidsw: { shirt: '#ef7d92', pants: '#3b5b9c', hair: '#f0d070', hairType: 'short', sole: '#3a2a22', style: 'tee', skin: SKIN },
};
export const POSES = { hang: [60, -118], belly: [10, -146], hip: [66, -134], wave: [86, -262], point: [112, -214], up: [70, -280], cheek: [38, -250], clasp: [8, -150], hold: [58, -170], reach: [120, -240], out: [100, -150], handsup: [76, -300], cover: [26, -250] };
const BROW = { flat: [0, 0], sad: [-9, 4], surprised: [-15, -15], angry: [8, -5], smug: [-2, -9], grin: [-6, -6], sleep: [0, 0], worry: [-12, 2] };
const blinkAt = (t, seed) => { const per = 2.6 + (seed % 5) * 0.4, ph = (t + seed * 0.7) % per; return ph < 0.08 ? 0.5 : ph < 0.16 ? 1 : ph < 0.24 ? 0.5 : 0; };
export function drawChar(c) {
  const P_ = WHO[c.who] || WHO.boy, s = c.s || 1, flip = c.flip || 1, acc = P_.acc || [], skin = P_.skin || SKIN, lw = LW / s; const oldLW = LW; LW = lw;
  g.save(); g.translate(c.x, c.y + (c.bob || 0)); if (c.rot) g.rotate(c.rot); g.scale(s * flip, s); g.globalAlpha = c.alpha ?? 1;
  if (c.bust) { g.beginPath(); g.rect(-200, -420, 400, 420 - (c.bustCut ?? 150)); g.clip(); }
  const sh = 0.14, ph = c.step ? c.step * TAU : 0;
  for (const side of [-1, 1]) {
    const sw = c.step ? Math.sin(ph + (side > 0 ? 0 : Math.PI)) : 0, lift = c.step ? Math.max(0, Math.cos(ph + (side > 0 ? 0 : Math.PI))) * 10 : 0;
    const hip = [side * 16, -124], foot = [side * 20 + sw * 22, -6 - lift];
    if (c.sit) { tube([[side * 16, -124], [side * 60, -110], [side * 66, -40]], 13, P_.pants); }
    else tube([hip, foot], 13, P_.pants);
    g.save(); g.translate(c.sit ? side * 66 + 5 : foot[0] + 5, c.sit ? -36 : foot[1] + 4); R(-18, -12, 40, 20, '#ffffff', 9, lw); g.fillStyle = P_.sole; rrect(-18, 2, 40, 7, 3); g.fill(); rrect(-18, 2, 40, 7, 3); g.lineWidth = lw * 0.8; g.strokeStyle = INK; g.stroke(); g.restore();
  }
  const dress = P_.style === 'dress', topY = -216, botY = dress ? -62 : -120, tw = 40, bw = dress ? 66 : P_.style === 'jacket' ? 56 : 52;
  const torso = () => poly([[-tw, topY], [tw, topY], [bw, botY], [-bw, botY]]);
  torso(); fillO(P_.shirt, lw); shade(torso, bw * 0.35, sh);
  if (P_.style === 'tee') R(-34, -190, 22, 24, '#12948e', 5, lw * 0.8);
  else if (P_.style === 'jacket') { line([[0, topY + 4], [0, botY]], lw * 0.8); for (const yy of [-190, -160, -130]) C(10, yy, 3.5, '#ffd24a', 2); P([[-tw, topY + 2], [-8, topY + 2], [-2, topY + 26], [-22, topY + 4]], '#ffffff', lw * 0.7); P([[tw, topY + 2], [8, topY + 2], [2, topY + 26], [22, topY + 4]], '#ffffff', lw * 0.7); }
  else if (P_.style === 'vest') { P([[-tw, topY], [-14, topY], [0, botY + 20], [-bw, botY]], '#7a5a3a', lw * 0.8); P([[tw, topY], [14, topY], [0, botY + 20], [bw, botY]], '#7a5a3a', lw * 0.8); line([[0, topY + 14], [0, botY + 20]], lw * 0.7); }
  else { line([[-tw, topY + 2], [0, topY + 20], [tw, topY + 2]], lw * 0.8); }
  if (acc.includes('stripes')) { R(-bw + 4, -170, bw * 2 - 8, 9, '#f6e25a', 2, lw * 0.5); R(-bw + 4, -140, bw * 2 - 8, 9, '#f6e25a', 2, lw * 0.5); }
  if (acc.includes('hivis')) { R(-bw + 6, -176, bw * 2 - 12, 10, '#e8f05a', 2, lw * 0.5); }
  if (acc.includes('tie')) P([[-5, topY + 18], [5, topY + 18], [8, topY + 70], [0, topY + 82], [-8, topY + 70]], '#3a5fc8', lw * 0.7);
  if (acc.includes('buttons')) { for (const yy of [-196, -176, -156]) { C(-14, yy, 3.5, '#ffd24a', 2); C(14, yy, 3.5, '#ffd24a', 2); } }
  if (acc.includes('scarf')) { R(-tw - 2, topY - 4, tw * 2 + 4, 20, '#e8c050', 8, lw * 0.8); }
  R(-13, -230, 26, 20, skin, 6, lw); shade(() => rrect(-13, -230, 26, 20, 6), 3, sh);
  const pa = c.pose || {};
  for (const side of [-1, 1]) {
    const key = side < 0 ? (pa.L || 'hang') : (pa.R || 'hang'); const tgt = Array.isArray(key) ? key : POSES[key] || POSES.hang;
    const sx = side * 42, sy = -204, hxx = side * Math.abs(tgt[0]), hy = tgt[1] + (c.armBob || 0), el = [(sx + hxx) / 2 + side * 14, (sy + hy) / 2 + 8];
    tube([[sx, sy], el, [hxx, hy]], 14, P_.shirt); g.lineCap = 'round'; g.strokeStyle = skin; g.lineWidth = 11; g.beginPath(); g.moveTo(...el); g.lineTo(hxx, hy); g.stroke(); C(hxx, hy, 11, skin, lw * 0.9);
  }
  // предмет в руках
  if (c.item === 'teddy') { g.save(); g.translate(0, -150); E(0, 6, 24, 26, '#a8743c', lw * 0.8); E(0, -26, 19, 18, '#b8844c', lw * 0.8); for (const sx of [-14, 14]) E(sx, -40, 7, 7, '#a8743c', lw * 0.7); g.fillStyle = INK; g.beginPath(); g.arc(-7, -27, 2.6, 0, TAU); g.arc(7, -27, 2.6, 0, TAU); g.fill(); E(0, -20, 6, 4.5, '#d9b58a', lw * 0.5); g.restore(); }
  if (c.item === 'bag') { g.save(); g.translate(c.bagX ?? 70, -110); R(-24, -30, 48, 60, '#c8603a', 8, lw * 0.8); R(-14, -14, 28, 20, '#a8452a', 4, lw * 0.6); g.restore(); }
  if (c.item === 'case') { g.save(); g.translate(64, -108); R(-30, -22, 60, 44, '#8a5a32', 6, lw * 0.8); R(-8, -30, 16, 10, '#5a3a1e', 3, lw * 0.6); g.restore(); }
  if (c.item === 'paper') { g.save(); g.translate(40, -250); g.rotate(-0.2); R(-26, -34, 52, 66, '#fffdf0', 3, lw * 0.7); for (let i = 0; i < 4; i++) line([[-18, -22 + i * 14], [18, -22 + i * 14]], lw * 0.4); g.restore(); }
  if (c.item === 'dosi') { g.save(); g.translate(80, -214); R(-12, -18, 24, 36, '#f5a623', 4, lw * 0.7); R(-8, -12, 16, 10, '#bfe6f6', 2, lw * 0.5); g.restore(); }
  if (c.item === 'pillow') { g.save(); g.translate(0, -140); R(-40, -26, 80, 52, '#fff', 14, lw * 0.8); g.restore(); }
  // голова
  g.save(); g.translate(0, -275 + 56); g.rotate((c.tilt || 0) * Math.PI / 180); g.translate(0, -56);
  const HX = 64, HY = 56, ht = P_.hairType;
  if (ht === 'bun') { if (c.who === 'granny' || c.who === 'mom' || c.who === 'smom') R(-72, -54, 144, 84, 36, P_.hair, lw); C(0, -66, 22, P_.hair, lw); }
  if (ht === 'bob') R(-74, -52, 148, 108, 34, P_.hair, lw);
  for (const sd of [-1, 1]) E(sd * 62, 8, 13, 17, skin, lw);
  const head = () => ell(0, 0, HX, HY); head(); fillO(skin, lw); shade(head, 30, sh);
  if (ht === 'spiky') { const sp = [], n = 9; for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; sp.push([Math.cos(a) * 66, Math.sin(a) * 60 - 2]); if (i < n) { const a2 = Math.PI + ((i + 0.5) / n) * Math.PI; sp.push([Math.cos(a2) * 86, Math.sin(a2) * 82 - 8 - (i % 2) * 14]); } } sp.push([50, -14], [14, -26], [-20, -18], [-52, -12]); P(sp, P_.hair, lw); }
  else if (ht === 'short') { g.beginPath(); g.moveTo(-64, -6); g.quadraticCurveTo(-66, -70, 0, -66); g.quadraticCurveTo(66, -70, 64, -6); g.quadraticCurveTo(40, -36, 0, -34); g.quadraticCurveTo(-40, -34, -64, -6); g.closePath(); fillO(P_.hair, lw); }
  else if (ht === 'bun' || ht === 'bob') { g.beginPath(); g.moveTo(-64, -6); g.quadraticCurveTo(-60, -64, 0, -62); g.quadraticCurveTo(60, -64, 64, -6); g.quadraticCurveTo(30, -34, -64, -6); g.closePath(); fillO(P_.hair, lw); }
  g.fillStyle = 'rgba(255,120,130,.55)'; for (const sd of [-1, 1]) { ell(sd * 44, 24, 12, 7); g.fill(); }
  const emo = c.emo || 'flat', sleepy = emo === 'sleep', wide = emo === 'surprised' ? 1.18 : 1, blink = sleepy ? 1 : (c.blink ?? blinkAt(c.t || 0, c.seed || 3)), ery = 24 * wide * (1 - blink * 0.92);
  for (const sd of [-1, 1]) {
    const ex = sd * 20; E(ex, -8, 20 * (emo === 'surprised' ? 1.05 : 1), Math.max(2, ery), '#ffffff', lw * 0.85);
    const look = c.look || 0, pr = emo === 'surprised' ? 4.5 : 7, lx = ex + look * 8, ly = -8 + (c.lookY || 0) * 6 + (emo === 'sad' || emo === 'worry' ? 4 : 0);
    if (blink < 0.7) { g.fillStyle = INK; g.beginPath(); g.arc(lx, ly, pr, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(lx - 2, ly - 2, 2, 0, TAU); g.fill(); }
    if (emo === 'smug') { g.save(); ell(ex, -8, 20, 24); g.clip(); g.fillStyle = skin; g.fillRect(ex - 24, -40, 48, 28); line([[ex - 22, -16], [ex + 22, -16]], lw * 0.9); g.restore(); }
  }
  if (acc.includes('glasses')) { for (const sd of [-1, 1]) { circ(sd * 22, -8, 26); g.lineWidth = lw * 0.9; g.strokeStyle = INK; g.stroke(); } line([[-4, -8], [4, -8]], lw * 0.8); }
  const [bi, bo] = BROW[emo] || BROW.flat; g.lineCap = 'round'; g.lineWidth = 9; g.strokeStyle = ht === 'bun' && c.who === 'granny' ? '#9a9aa4' : '#4a2a18';
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 6, -42 + bi + (c.browLift || 0)); g.lineTo(sd * 38, -38 + bo + (c.browLift || 0)); g.stroke(); }
  if (acc.includes('beard')) { P([[-50, 20], [50, 20], [40, 60], [0, 78], [-40, 60]], '#7a7a86', lw * 0.8); }
  const my = 30, m3 = c.mouth || 0;
  if (m3 > 0) { const rx = [0, 12, 17, 22][m3], ry = [0, 6, 12, 18][m3]; ell(0, my, rx, ry); g.fillStyle = '#6b1d2e'; g.fill(); g.save(); ell(0, my, rx, ry); g.clip(); g.fillStyle = '#fff'; g.fillRect(-rx, my - ry, rx * 2, ry * 0.5); g.fillStyle = '#ef7d92'; ell(0, my + ry * 0.75, rx * 0.65, ry * 0.5); g.fill(); g.restore(); ell(0, my, rx, ry); g.lineWidth = lw * 0.85; g.strokeStyle = INK; g.stroke(); }
  else if (emo === 'surprised') { E(0, my + 4, 11, 14, '#6b1d2e', lw * 0.85); }
  else if (emo === 'grin') { g.beginPath(); g.moveTo(-26, my - 4); g.quadraticCurveTo(0, my + 26, 26, my - 4); g.closePath(); g.fillStyle = '#6b1d2e'; g.fill(); g.fillStyle = '#fff'; g.fillRect(-18, my - 3, 36, 6); g.lineWidth = lw * 0.85; g.strokeStyle = INK; g.stroke(); }
  else if (emo === 'sleep') { E(0, my + 2, 7, 5, '#6b1d2e', lw * 0.8); }
  else { g.lineWidth = lw * 0.9; g.strokeStyle = INK; g.lineCap = 'round'; g.beginPath(); if (emo === 'sad' || emo === 'worry') { g.moveTo(-14, my + 6); g.quadraticCurveTo(0, my - 4, 14, my + 6); } else if (emo === 'smug') { g.moveTo(-14, my + 2); g.quadraticCurveTo(4, my + 8, 18, my - 6); } else { g.moveTo(-13, my + 2); g.lineTo(13, my + 2); } g.stroke(); }
  if (acc.includes('mask')) { P([[-40, 14], [40, 14], [34, 52], [0, 62], [-34, 52]], '#d8d8e0', lw * 0.8); }
  if (acc.includes('helmet')) { g.beginPath(); g.moveTo(-70, -10); g.quadraticCurveTo(-70, -86, 0, -90); g.quadraticCurveTo(70, -86, 70, -10); g.closePath(); fillO('#f6c21a', lw); R(-80, -16, 160, 12, '#e0a810', 5, lw * 0.8); }
  if (acc.includes('hardhat')) { g.beginPath(); g.moveTo(-68, -14); g.quadraticCurveTo(-68, -82, 0, -84); g.quadraticCurveTo(68, -82, 68, -14); g.closePath(); fillO('#f2f2f2', lw); R(-76, -20, 152, 10, '#cfcfd6', 5, lw * 0.8); }
  if (acc.includes('cap')) { g.beginPath(); g.moveTo(-68, -16); g.quadraticCurveTo(-66, -80, 0, -82); g.quadraticCurveTo(66, -80, 68, -16); g.closePath(); fillO(c.who === 'steward' ? '#f4f4f4' : c.who === 'officer' ? '#1f2f5a' : '#5a6a7a', lw); R(-72, -20, 144, 12, '#2a2a30', 5, lw * 0.8); C(0, -38, 6, '#ffd24a', 2); }
  if (acc.includes('flatcap')) { g.beginPath(); g.moveTo(-66, -14); g.quadraticCurveTo(-60, -78, 10, -72); g.quadraticCurveTo(70, -66, 70, -16); g.closePath(); fillO('#6a5a46', lw); R(-30, -22, 100, 10, '#4a3e30', 4, lw * 0.7); }
  if (acc.includes('hat')) { R(-82, -26, 164, 12, '#3a3a40', 5, lw * 0.8); R(-48, -78, 96, 56, '#3a3a40', 12, lw); }
  if (c.sweat) { g.save(); g.translate(60, -34 + c.sweat * 8); g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(12, 4, 0, 12); g.quadraticCurveTo(-12, 4, 0, -14); g.fillStyle = '#8fd8ff'; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = INK; g.stroke(); g.restore(); }
  if (emo === 'sleep') { g.fillStyle = '#fff'; g.font = '900 34px Nunito'; g.strokeStyle = INK; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.strokeText('z', 70 + i * 22, -50 - i * 26); g.fillText('z', 70 + i * 22, -50 - i * 26); } }
  g.restore(); g.restore(); LW = oldLW;
}

// ---------- камера, шоты, кадры ----------
function interp(arr, t) { // [[t,v...]...] -> значения (линейно с easing)
  if (!Array.isArray(arr[0])) return arr; if (t <= arr[0][0]) return arr[0].slice(1); const L = arr[arr.length - 1]; if (t >= L[0]) return L.slice(1);
  for (let i = 0; i < arr.length - 1; i++) if (t >= arr[i][0] && t <= arr[i + 1][0]) { const k = ease((t - arr[i][0]) / (arr[i + 1][0] - arr[i][0])); return arr[i].slice(1).map((v, j) => typeof v === 'number' ? lerp(v, arr[i + 1][j + 1], k) : v); }
}
const stepFn = (arr, t, def) => { if (!arr) return def; if (!Array.isArray(arr[0])) return arr; let v = arr[0][1]; for (const [tt, vv] of arr) if (t >= tt) v = vv; return v; };
const camFor = (spec, actors, sceneCam) => {
  if (Array.isArray(spec)) return { cx: spec[0], cy: spec[1], z0: spec[2], z1: spec[3] ?? spec[2] * 1.05 };
  if (spec === 'w' || !spec) return sceneCam || { cx: 960, cy: 560, z0: 1.05, z1: 1.12 };
  const m = /^([ac])(\d)$/.exec(spec); if (m) { const a = actors[+m[2]]; if (a) { const s = a.s || 1; return m[1] === 'a' ? { cx: a.x, cy: a.y - 170 * s, z0: 1.7, z1: 1.85 } : { cx: a.x, cy: a.y - 262 * s, z0: 2.6, z1: 2.9 }; } }
  return sceneCam || { cx: 960, cy: 560, z0: 1.05, z1: 1.12 };
};
export function layout(film) { // интервалы: титры глав и участки абзацев
  const segs = film.segs, items = [];
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (s.kind === 'chapter') { if (s.t > 0.01) items.push({ kind: 'card', a: s.t - 1.6, b: s.t + 1.0, title: s.title }); }
    else { let b = film.total; for (let j = i + 1; j < segs.length; j++) { b = segs[j].kind === 'chapter' ? segs[j].t - 1.6 : segs[j].t; break; } items.push({ kind: 'voice', a: i === 0 ? 0 : s.t, b, seg: s }); }
  }
  items[0] && items[0].kind === 'voice' && (items[0].a = 0); return items;
}
export function makeFilm(film, SB) {
  const L = layout(film); const bySeg = new Map();
  for (const it of L) if (it.kind === 'voice') { const sb = SB.find((x) => it.seg.text.startsWith(x.m)); if (!sb) console.log('NO SB for', it.seg.text.slice(0, 40)); it.sb = sb || SB[0]; const span = it.b - it.a, n = Math.max(1, Math.round(span / (it.sb.shotLen || 2.8))); it.n = n; }
  return { film, L, SB };
}
const drawCardTitle = (title, t0, t) => { // плашка-заставка главы
  const k = (t - t0); const em = EMBLEMS[title] || EMBLEMS.default;
  if (CARD_BG[title] && PHOTOS[CARD_BG[title]]) { drawPhoto(CARD_BG[title], 'color', 0.5); g.fillStyle = 'rgba(255,217,138,.16)'; g.fillRect(0, 0, W, H); } else { g.fillStyle = '#ffd98a'; g.fillRect(0, 0, W, H); for (let i = -2; i < 14; i++) { g.fillStyle = i % 2 ? '#ffc76b' : '#ffd98a'; g.fillRect(i * 160 + ((k * 40) % 320), 0, 160, H); } }
  g.save(); g.translate(W / 2, 400); const sc = 0.9 + 0.1 * ease(k / 0.25); g.scale(sc, sc); if (em) em(k); g.restore();
  g.save(); g.translate(W / 2, 760); g.scale(0.92 + 0.08 * ease(k / 0.3), 0.92 + 0.08 * ease(k / 0.3)); g.font = '900 100px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const words = title.split(' '); const lines = []; let cur = ''; for (const w of words) { if ((cur + ' ' + w).trim().length > 20 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } lines.push(cur);
  const lh = 112, y0 = -(lines.length - 1) * lh / 2; lines.forEach((ln, i) => { g.lineWidth = 22; g.strokeStyle = INK; g.strokeText(ln, 0, y0 + i * lh); g.fillStyle = '#fff'; g.fillText(ln, 0, y0 + i * lh); }); g.restore();
};
function drawCaption(film, t) {
  let c = null; for (const s of film.segs) if (s.kind === 'voice' && t >= s.t - 0.05 && t < s.t + s.dur + 0.1) { c = s.captions.find(([a, b]) => t >= a - 0.02 && t < b + 0.02); if (c) break; } if (!c) return;
  const k = ease((t - c[0]) / 0.1), sc = 0.9 + 0.1 * k; g.save(); g.translate(W / 2, 1008); g.scale(sc, sc); let fs = 76; g.font = `900 ${fs}px Nunito`; const mw = g.measureText(c[2]).width; if (mw > 1780) fs = Math.floor(fs * 1780 / mw); g.font = `900 ${fs}px Nunito`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = fs * 0.21; g.strokeStyle = '#000'; g.strokeText(c[2], 0, 0); g.fillStyle = '#fff'; g.fillText(c[2], 0, 0); g.restore();
}
export function renderFrame(M, f, extra = {}) {
  const t = f / FPS, film = M.film;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const it = M.L.find((x) => t >= x.a && t < x.b) || M.L[M.L.length - 1];
  if (it.kind === 'card') { drawCardTitle(it.title, it.a, t); return; }
  const sb = it.sb, seg = it.seg, pt = t - seg.t;
  let sc = sb; if (sb.seq) { const e = sb.seq.find((q) => pt < q.to) || sb.seq[sb.seq.length - 1]; sc = { ...sb, ...e }; }
  if (sb.after && t > seg.t + seg.dur + 0.4) sc = { ...sc, ...sb.after, cams: sb.after.cams || ['w'] };
  const span = it.b - it.a, shotLen = span / it.n, si = Math.min(it.n - 1, Math.floor((t - it.a) / shotLen)), sk = ((t - it.a) - si * shotLen) / shotLen;
  if (sb.photos && !sb._np) { const ps = sb.photos.map((q) => ({ ...q })).sort((x, y) => x.from - y.from); ps.forEach((q, i) => { if (i === 0 && q.from < 0.8) q.from = 0; const nx = ps[i + 1]; if (nx && nx.from - q.to < 1.0) q.to = nx.from; if (!nx && q.to > seg.dur - 1.0) q.to = 1e9; }); const bn = []; (sb.seq || []).forEach((e) => { if (e.to < 90) bn.push(e.to); }); for (let k = 1; k < it.n; k++) bn.push((it.a - seg.t) + k * shotLen); ps.forEach((q, i) => { const pv = ps[i - 1]; if (q.to < 1e8) { const B = bn.filter((x) => x > q.to && x <= q.to + 0.9).sort((x, y) => x - y)[0]; if (B !== undefined) q.to = B; } const Bf = bn.filter((x) => x < q.from && x >= q.from - 0.9).sort((x, y) => y - x)[0]; if (Bf !== undefined && (!pv || Bf >= pv.to)) q.from = Bf; }); sb._np = ps; }
  const ph = sb._np && sb._np.find((q) => pt >= q.from && pt < q.to);
  if (ph) sc = { ...sc, scene: 'photo', sp: { src: ph.src, tone: ph.tone, cap: ph.cap, dim: ph.dim }, cams: ['w'], actors: ph.actors || [], sticker: true, fg: null, hud: null, dim: null, tilt: null, punch: null };
  const actors = (sc.actors || []).map((a) => { const o = resolveActor(a, pt, t, f); if (!ph && !o.bust && o.y > 945) o.y = 945; return o; });
  const cams = sc.cams || ['w']; const cs = camFor(cams[si % cams.length], actors, sc.cam);
  const z = (Math.abs(cs.z1 - cs.z0) < 0.01 ? lerp(cs.z0, cs.z0 * 1.04, ease(sk)) : lerp(cs.z0, cs.z1, ease(sk))) * (1 + (sc.punch && t >= seg.t + sc.punch ? Math.exp(-(t - seg.t - sc.punch) * 14) * 0.07 : 0));
  let zz = z, ccx = cs.cx, ccy = cs.cy; if (ph) { const k = ease((pt - ph.from) / (ph.to - ph.from)); zz = lerp(ph.z0 ?? 1.03, ph.z1 ?? 1.13, k); ccx = ph.cx ?? 960; ccy = ph.cy ?? 540; }
  g.save(); g.translate(W / 2, H / 2); if (sc.tilt) g.rotate(typeof sc.tilt === 'function' ? sc.tilt(pt) : sc.tilt); g.scale(zz, zz); g.translate(-ccx, -ccy); LW = 7 / Math.sqrt(zz);
  const S = SCENES[sc.scene] || SCENES.room, st = { t, pt, f, sp: sc.sp || {}, seg, dur: seg.dur, shot: si };
  S.bg && S.bg(st); if (sc.sticker) drawSticker(actors); else actors.forEach((a) => { if (a.custom) a.custom(a, st); else drawChar(a); }); S.fg && S.fg(st); if (sc.fg) sc.fg(st);
  g.restore();
  if (sc.hud) sc.hud(st); if (S.hud) S.hud(st, sc);
  if (sc.dim) { const d = typeof sc.dim === 'function' ? sc.dim(pt) : sc.dim; if (d > 0) { g.fillStyle = `rgba(20,14,40,${d})`; g.fillRect(0, 0, W, H); } }
  if (!extra.nocap) drawCaption(film, t);
  if (t < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; g.fillRect(0, 0, W, H); }
  if (t > film.total - 1.2) { g.fillStyle = `rgba(0,0,0,${clamp((t - (film.total - 1.2)) / 1.0)})`; g.fillRect(0, 0, W, H); }
}
function resolveActor(a, pt, t, f) {
  const o = { ...a, t, bob: -Math.abs(Math.sin(t * Math.PI * 1.7 + (a.seed || 0))) * (a.still ? 0 : 4), tilt: (a.tilt ?? 2) * Math.sin(t * 1.3 + (a.seed || 0)), seed: a.seed || 3 };
  if (a.move) { const v = interp(a.move, pt); o.x = v[0]; o.y = v[1] ?? a.y; if (v[2] != null) o.s = v[2]; }
  if (a.emos) o.emo = stepFn(a.emos, pt, a.emo); if (a.looks) { const v = interp(a.looks, pt); o.look = v[0]; }
  if (a.poses) { const L = stepFn(a.poses.map(([tt, l]) => [tt, l]), pt, 'hang'); const Rr = stepFn(a.poses.map(([tt, , r]) => [tt, r]), pt, 'hang'); o.pose = { L, R: Rr }; }
  if (a.walk) { const [t0, t1] = a.walk; o.step = (pt >= t0 && pt <= t1) ? (t * 1.6) % 1 : 0; }
  if (a.talk) { const [t0, t1] = a.talk; if (pt >= t0 && pt <= t1) { const e = ENV[f] ?? 0, e2 = Math.max(e, ((ENV[f - 1] ?? 0) + (ENV[f + 1] ?? 0)) / 2); o.mouth = e2 > 0.45 ? 3 : e2 > 0.22 ? 2 : e2 > 0.07 ? 1 : 0; } }
  if (a.sweatAt) { const [t0, t1] = a.sweatAt; o.sweat = (pt >= t0 && pt <= t1) ? 1 : 0; }
  if (a.fade) { const [t0, t1, a0, a1] = a.fade; o.alpha = lerp(a0, a1, ease((pt - t0) / (t1 - t0))); }
  if (a.flipAt) { o.flip = stepFn(a.flipAt, pt, 1); }
  return o;
}

let OC = null;
function drawSticker(actors) { // персонажи как «вырезки» с белым контуром и тенью поверх фото
  const main = g, cv = main.canvas; if (!OC) { OC = document.createElement('canvas'); OC.width = cv.width; OC.height = cv.height; }
  const o = OC.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, OC.width, OC.height); o.setTransform(main.getTransform());
  g = o; actors.forEach((a) => drawChar(a)); g = main;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const k = 1.6, f = [[4, 0], [-4, 0], [0, 4], [0, -4]].map(([x, y]) => `drop-shadow(${x * k}px ${y * k}px 0 #fbf8f0)`).join(' ');
  g.filter = f + ` drop-shadow(${8 * k}px ${12 * k}px ${14 * k}px rgba(0,0,0,.55))`; g.drawImage(OC, 0, 0); g.filter = 'none'; g.restore();
}
SCENES.photo = {
  bg(st) { drawPhoto(st.sp.src, st.sp.tone || 'color', st.sp.dim ?? 0.1); },
  fg(st) { /* зерно и виньетка поверх всего кадра рисуются в hud */ },
  hud(st, sc) {
    const c = CREDITS[st.sp.src]; const vg = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); const bg = g.createLinearGradient(0, 860, 0, H); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = bg; g.fillRect(0, 860, W, H - 860); grain(st.t, st.sp.tone === 'color' ? 0.06 : 0.12);
    const label = st.sp.cap || (c && c.cap) || ''; const txt = (label ? label + '. ' : '') + (c ? 'Фото: ' + c.author + ', ' + c.license : ''); if (!txt) return;
    g.save(); g.font = '700 26px Nunito'; const w = Math.min(1820, g.measureText(txt).width + 34); g.fillStyle = 'rgba(10,10,16,.68)'; g.beginPath(); g.roundRect(30, 28, w, 46, 10); g.fill(); g.fillStyle = '#f2efe6'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, 46, 52, 1790); g.restore();
  },
};
