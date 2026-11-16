// toon.js — мультяшный стиль «как в референсе»: большие круглые головы, точки-глаза, тёмный контур,
// плоские цвета с мягкой тенью, детальные фоны, рукописные бирки, камера с наездами.
import { E, ease, prog, clamp, lerp, noise, alpha, shade, mix, rng, text, wordTime } from '/engine/core.js';

export const OL = '#2a2321';            // цвет контура
export const LW = 5;                    // толщина контура
export const HAND = 'Caveat';
export const SKIN = { dark: '#7b4a2e', brown: '#a8693f', tan: '#d29a6a', light: '#f3d2b4', pale: '#f7e1cc' };
export const C = { gold: '#f2c037', goldD: '#c8901c', red: '#d9473a', cream: '#f6efe0', paper: '#f4ead2', ink: OL, green: '#5fb84a', sky: '#9fd3ef' };

// ------------------------------------------------------------------ базовые фигуры с контуром
export function path(g, pts, close = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (close) g.closePath(); }
export function fo(g, fill, lw = LW, ol = OL) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw > 0) { g.lineWidth = lw; g.strokeStyle = ol; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); } }
export function rrect(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function box(g, x, y, w, h, fill, o = {}) { rrect(g, x, y, w, h, o.r ?? 4); fo(g, o.grad === false ? fill : vgrad(g, y, h, fill, o.sh ?? 0.12), o.lw ?? LW); }
export function ell(g, x, y, rx, ry, fill, lw = LW, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); fo(g, fill, lw); }
export function poly(g, pts, fill, lw = LW) { path(g, pts); fo(g, fill, lw); }
export function line(g, pts, w = LW, col = OL) { path(g, pts, false); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
// линия с контуром (рука, палка): тёмная толстая + цветная потоньше
export function limb(g, pts, w, col) { line(g, pts, w + LW * 2, OL); line(g, pts, w, col); }
export const vgrad = (g, y, h, c, k = 0.12) => { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(c, k * 0.6)); gr.addColorStop(1, shade(c, -k)); return gr; };
export const hgrad = (g, x, w, c, k = 0.12) => { const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, shade(c, k * 0.5)); gr.addColorStop(1, shade(c, -k)); return gr; };
export function sky(g, cols, y0 = 0, y1 = E.H) { const gr = g.createLinearGradient(0, y0, 0, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); g.fillStyle = gr; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); }
export function softShadow(g, x, y, rx, a = 0.25) { g.save(); g.fillStyle = `rgba(20,10,5,${a})`; g.beginPath(); g.ellipse(x, y, rx, rx * 0.18, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
export function light(g, x, y, r, col = '#fff2c8', a = 0.35) { r = Math.abs(r); if (r < 1) return; g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, alpha(col, a)); gr.addColorStop(1, alpha(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
export function dim(g, a = 0.3, col = '#1a1020') { g.save(); g.fillStyle = alpha(col, a); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }

// ------------------------------------------------------------------ время / слова
const norm = (w) => w.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9-]/g, '');
// время слова (сек от начала шота): первое совпадение по началу слова после (начало шота + after)
export function wt(word, after = 0) { const m = norm(word); if (!m) return null; const w = E.words.find((w) => w.start >= after - 0.05 && norm(w.word).startsWith(m)); return w ? w.start : null; }
export function wend(word, after = 0) { const m = norm(word); const w = E.words.find((w) => w.start >= after - 0.05 && norm(w.word).startsWith(m)); return w ? w.end : null; }
export const at = (info, word, fb = 0.5, after = -0.4) => { if (typeof word === 'number') return word; const v = wt(word, info.shot.start + after); return v != null ? v - info.shot.start : fb * info.dur; };
export const inn = (t, a, d = 0.4) => ease.out(prog(t, a, a + d));
export const pop = (t, a, d = 0.45) => ease.outBack(prog(t, a, a + d));
export const k01 = (t, a, b) => ease.inOut(prog(t, a, b));
export const wob = (t, s = 0, a = 1) => noise(t * 1.3, s) * a;

// ------------------------------------------------------------------ камера: ключи {t, x, y, z} (x,y — точка в центре кадра)
export function camAt(t, keys) {
  if (!keys || !keys.length) return { x: E.W / 2, y: E.H / 2, z: 1 };
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) { const a = keys[i - 1], b = keys[i]; if (t <= b.t) { const k = (b.ease || ease.inOut)((t - a.t) / Math.max(1e-6, b.t - a.t)); return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) }; } }
  return keys[keys.length - 1];
}
// mul: 0..1 «ручная камера» — лёгкое плавание
export function withCam(g, t, keys, fn, sway = 1) {
  const c = camAt(t, keys); const dx = noise(t * 0.35, 4) * 6 * sway, dy = noise(t * 0.3, 9) * 4 * sway;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(c.z, c.z); g.translate(-c.x + dx, -c.y + dy); fn(g, c); g.restore(); return c;
}
export const K = (t, x, y, z = 1, e) => ({ t, x, y, z, ease: e });
export const WIDE = (t) => K(t, E.W / 2, E.H / 2, 1);

// ------------------------------------------------------------------ текстура бумаги + виньетка (поверх всего)
let GRAIN = null;
function grainTile() { if (GRAIN) return GRAIN; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const id = x.createImageData(256, 256); const r = rng(77);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 60; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } x.putImageData(id, 0, 0); GRAIN = c; return c; }
export function finish(g, o = {}) {
  g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0);
  g.globalAlpha = o.grain ?? 0.06; g.globalCompositeOperation = 'overlay'; const p = g.createPattern(grainTile(), 'repeat'); g.fillStyle = p; g.fillRect(0, 0, E.W, E.H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const v = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.45, E.W / 2, E.H / 2, E.W * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(20,10,10,${o.vig ?? 0.32})`); g.fillStyle = v; g.fillRect(0, 0, E.W, E.H);
  g.restore();
}

// ------------------------------------------------------------------ рукописные надписи
export function hand(g, str, x, y, o = {}) { text(g, str, x, y, { size: o.size ?? 44, color: o.color ?? OL, font: HAND, weight: o.weight ?? 700, align: o.align ?? 'center', alpha: o.a ?? 1, spacing: 0 }); }
export function handW(g, str, size, weight = 700) { g.save(); g.font = `${weight} ${size}px "${HAND}"`; const w = g.measureText(str).width; g.restore(); return w; }
// бумажная бирка (как «$300», «1996» в референсе); k — появление 0..1
export function tag(g, str, x, y, k = 1, o = {}) {
  if (k <= 0) return; const size = o.size ?? 46, w = handW(g, str, size) + size * 0.9, h = size * 1.25;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.04); const s = o.noPop ? 1 : ease.outBack(clamp(k)); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  if (o.string) line(g, [[-w / 2 + 14, 0], [o.string[0] - x, o.string[1] - y]], 3, OL);
  g.fillStyle = 'rgba(0,0,0,.18)'; rrect(g, -w / 2 + 5, -h / 2 + 6, w, h, 6); g.fill();
  box(g, -w / 2, -h / 2, w, h, o.bg ?? C.paper, { r: 6, lw: 4, sh: 0.06 });
  hand(g, str, 0, 2, { size, color: o.color ?? OL });
  g.restore();
}
// жёлтая плашка-год в левом верхнем углу (экранная, без камеры)
export function yearTag(g, str, k = 1, o = {}) { if (k <= 0) return; g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); tag(g, str, o.x ?? 150, o.y ?? 90, k, { bg: o.bg ?? '#ffd43b', size: o.size ?? 54, rot: -0.03 }); g.restore(); }
// облачко речи
export function bubble(g, x, y, w, h, k, draw, o = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y); const s = ease.outBack(clamp(k)); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  const tx = o.tail ?? -w * 0.25; rrect(g, -w / 2, -h, w, h, 28); g.fillStyle = '#fff'; g.fill();
  g.beginPath(); g.moveTo(tx - 22, -4); g.lineTo(tx + 10, 40); g.lineTo(tx + 26, -4); g.closePath(); g.fill();
  g.lineWidth = LW; g.strokeStyle = OL; rrect(g, -w / 2, -h, w, h, 28); g.stroke(); g.beginPath(); g.moveTo(tx - 22, 0); g.lineTo(tx + 10, 40); g.lineTo(tx + 26, 0); g.stroke();
  g.fillStyle = '#fff'; g.fillRect(tx - 18, -8, 40, 10);
  g.translate(0, -h / 2); draw(g); g.restore();
}
// стрелка вверх/вниз (цена растёт/падает)
export function arrow(g, x, y, len, dir, col, k = 1) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(1, dir); const L = len * ease.out(clamp(k));
  poly(g, [[-18, 0], [18, 0], [18, -L + 40], [42, -L + 40], [0, -L], [-42, -L + 40], [-18, -L + 40]], col, 5); g.restore();
}

// ------------------------------------------------------------------ ЧЕЛОВЕЧКИ
// o: x,y (ступни), s, t, skin, body:'suit'|'robe'|'toga'|'tunic'|'dress'|'coat', col, col2 (низ/отделка), trim,
//    hat:'none'|'crown'|'turban'|'laurel'|'tophat'|'beret'|'helmet'|'cap'|'fez'|'veil', hatCol,
//    hair:{c, s:'short'|'bald'|'side'|'long'|'curly'|'none'}, beard:null|'full'|'short'|'goatee'|'moustache', beardCol,
//    expr:'neutral'|'smile'|'grin'|'shock'|'sad'|'angry'|'smirk'|'worried'|'closed', talk:bool, look:-1..1, face:1|-1,
//    pose:'idle'|'wave'|'point'|'hold'|'cheer'|'shrug'|'cross'|'give'|'bow'|'think'|'pray'|'sit'|'hips', walk:false|phase, glasses, tie, name
export const POSE = {
  idle: { l: [0.18, 0.15], r: [0.18, 0.15] }, hips: { l: [0.9, -2.0], r: [0.9, -2.0] },
  wave: { l: [0.18, 0.15], r: [2.6, -0.7] }, point: { l: [0.18, 0.15], r: [1.5, 0] }, give: { l: [0.18, 0.15], r: [1.1, 0.2] },
  hold: { l: [1.25, 0.6], r: [1.25, 0.6] }, cheer: { l: [2.7, 0.2], r: [2.7, 0.2] }, shrug: { l: [0.9, 1.6], r: [0.9, 1.6] },
  cross: { l: [0.5, 2.2], r: [0.5, 2.2], cross: true }, think: { l: [0.18, 0.15], r: [0.6, 2.3] }, pray: { l: [0.6, 2.0], r: [0.6, 2.0] },
  stop: { l: [0.18, 0.15], r: [1.7, -0.9] }, writing: { l: [1.0, 0.8], r: [1.2, 0.5] }, bothOut: { l: [1.2, 0.1], r: [1.2, 0.1] },
};
export function person(g, o) {
  const t = o.t ?? 0, s = o.s ?? 1, f = o.face ?? 1, seed = o.seed ?? 1;
  const P = typeof o.pose === 'object' ? o.pose : POSE[o.pose || 'idle'] || POSE.idle;
  const sit = o.sit, robe = ['robe', 'toga', 'dress'].includes(o.body);
  const walk = o.walk !== undefined && o.walk !== false ? o.walk : null;
  const bob = walk !== null ? Math.abs(Math.sin(walk)) * -8 : Math.sin(t * 2.2 + seed) * 2.2;
  const bow = o.bow ?? 0;   // 0..1 поклон
  g.save(); g.translate(o.x, o.y); g.scale(s * f, s);
  softShadow(g, 0, 0, 70, 0.2);
  const skin = o.skin || SKIN.light, col = o.col || '#3a4a6a', col2 = o.col2 || shade(col, -0.25);
  // ноги
  if (!robe || walk !== null) {
    const legC = o.legs || (robe ? col2 : shade(col, -0.35));
    if (sit) { limb(g, [[-20, -70], [40, -70], [40, -5]], 24, legC); limb(g, [[20, -70], [70, -70], [70, -5]], 24, legC); ell(g, 52, -2, 24, 11, '#2b2220', 4); ell(g, 82, -2, 24, 11, '#2b2220', 4); }
    else { const a = walk !== null ? Math.sin(walk) * 22 : 0; limb(g, [[-20, -75], [-20 + a, -8]], 24, legC); limb(g, [[20, -75], [20 - a, -8]], 24, legC);
      ell(g, -20 + a + 8, -4, 24, 11, o.shoe || '#2b2220', 4); ell(g, 20 - a + 8, -4, 24, 11, o.shoe || '#2b2220', 4); }
  } else { ell(g, -22, -6, 24, 10, o.shoe || '#2b2220', 4); ell(g, 26, -6, 24, 10, o.shoe || '#2b2220', 4); }
  g.translate(0, bob + (sit ? 40 : 0));
  // поклон: тело наклоняется вперёд от бёдер
  g.translate(0, -75); g.rotate(bow * 0.55); g.translate(0, 75);
  // руки (сзади, если скрещены — спереди)
  const arm = (side, ang, bend) => {
    const sx = side * 46, sy = -158, L1 = 52, L2 = 50; const a = ang * side, b = (ang + bend) * side;
    const ex = sx + Math.sin(a) * L1, ey = sy + Math.cos(a) * L1, hx = ex + Math.sin(b) * L2, hy = ey + Math.cos(b) * L2;
    limb(g, [[sx, sy], [ex, ey], [hx, hy]], 22, o.sleeve || col); ell(g, hx, hy, 12, 12, skin, 4); return [hx, hy];
  };
  const wav = (k) => (o.pose === 'wave' ? Math.sin(t * 9) * 0.35 * k : 0);
  let hands = {};
  const drawArms = () => { hands.l = arm(-1, P.l[0], P.l[1]); hands.r = arm(1, P.r[0] + wav(1), P.r[1]); };
  if (!P.cross) drawArms();
  // туловище
  if (robe) { path(g, [[-50, -170], [50, -170], [62, -12], [-62, -12]]); fo(g, vgrad(g, -170, 160, col, 0.14)); if (o.trim) { line(g, [[-58, -40], [58, -40]], 10, o.trim); line(g, [[0, -168], [0, -14]], 8, o.trim); } if (o.body === 'toga') { path(g, [[-48, -168], [10, -168], [58, -40], [30, -30]]); fo(g, shade(col, -0.06), 4); } }
  else { rrect(g, -52, -175, 104, 108, 26); fo(g, vgrad(g, -175, 108, col, 0.14)); rrect(g, -50, -95, 100, 26, 8); fo(g, col2, 4);
    if (o.body === 'suit') { poly(g, [[-16, -175], [16, -175], [0, -132]], o.shirt || '#f4f1ea', 4); if (o.tie !== false) poly(g, [[-6, -170], [6, -170], [9, -128], [0, -118], [-9, -128]], o.tie || C.red, 3); line(g, [[-16, -175], [0, -110], [16, -175]], 4); } }
  if (P.cross) { // скрещённые руки спереди
    limb(g, [[-46, -158], [-30, -112], [40, -125]], 22, o.sleeve || col); limb(g, [[46, -158], [30, -112], [-40, -125]], 22, o.sleeve || col); ell(g, 40, -125, 12, 12, skin, 4); ell(g, -40, -125, 12, 12, skin, 4); }
  // голова
  const hx = 0, hy = -240 + (o.headDY || 0);
  g.save(); g.translate(hx, hy); g.rotate(bow * 0.25 + (o.tilt || 0));
  if (o.hat === 'veil' || o.hair?.s === 'long') { const hc = o.hat === 'veil' ? (o.hatCol || '#e9e2d0') : o.hair.c; path(g, [[-66, -10], [66, -10], [74, 70], [-74, 70]]); fo(g, hc); }
  ell(g, 0, 0, 64, 66, skin);
  // волосы
  const hr = o.hair || { s: 'short', c: '#2b2220' };
  if (hr.s === 'short') { g.beginPath(); g.ellipse(0, -14, 66, 56, 0, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(52, -22); g.quadraticCurveTo(0, -38, -52, -20); g.closePath(); fo(g, hr.c, 4); }
  else if (hr.s === 'side') { g.beginPath(); g.ellipse(0, -14, 66, 56, 0, Math.PI * 1.0, Math.PI * 2.0); g.quadraticCurveTo(20, -50, -30, -20); g.quadraticCurveTo(-55, -10, -66, -10); g.closePath(); fo(g, hr.c, 4); }
  else if (hr.s === 'bald') { ell(g, -60, 8, 10, 18, hr.c, 3); ell(g, 60, 8, 10, 18, hr.c, 3); }
  else if (hr.s === 'curly') { for (let i = 0; i < 7; i++) ell(g, -54 + i * 18, -48 + Math.abs(i - 3) * 5, 16, 16, hr.c, 3); }
  // лицо
  const lk = (o.look ?? 0.25) * 10, blink = ((t + seed * 1.7) % 3.9) < 0.12 || o.expr === 'closed';
  const ex = o.expr || 'neutral';
  if (o.glasses) { ell(g, -22 + lk, 4, 17, 15, 'rgba(255,255,255,.35)', 4); ell(g, 24 + lk, 4, 17, 15, 'rgba(255,255,255,.35)', 4); line(g, [[-5 + lk, 4], [7 + lk, 4]], 4); }
  if (blink) { line(g, [[-30 + lk, 4], [-14 + lk, 4]], 4); line(g, [[16 + lk, 4], [32 + lk, 4]], 4); }
  else { const er = ex === 'shock' ? 8 : 6.5; ell(g, -22 + lk, 4, er, er * 1.15, OL, 0); ell(g, 24 + lk, 4, er, er * 1.15, OL, 0); }
  // брови
  const bc = (o.beardCol || hr.c || OL) === 'none' ? OL : OL;
  const brow = { angry: [8, -6], worried: [-7, 6], sad: [-6, 5], shock: [-4, -4], smirk: [4, -2] }[ex] || [0, 0];
  line(g, [[-34 + lk, -18 + brow[0] * 0], [-12 + lk, -18 + brow[0]]], 4, bc); line(g, [[12 + lk, -18 + brow[0]], [34 + lk, -18 + brow[1] * 0]], 4, bc);
  // рот
  const talk = o.talk ? Math.max(0, noise(t * 9, seed) * 0.8 + 0.35) : 0, mx = 2 + lk * 0.8, my = 34;
  if (talk > 0.15 || ex === 'shock') { const h = ex === 'shock' ? 16 : 6 + talk * 12; ell(g, mx, my, 12, h, '#6a2a2a', 4); }
  else if (ex === 'smile' || ex === 'grin') { g.beginPath(); g.arc(mx, my - 12, ex === 'grin' ? 22 : 16, 0.15 * Math.PI, 0.85 * Math.PI); if (ex === 'grin') { g.closePath(); fo(g, '#fff', 4); } else fo(g, null, 4); }
  else if (ex === 'sad' || ex === 'worried') { g.beginPath(); g.arc(mx, my + 12, 14, 1.2 * Math.PI, 1.8 * Math.PI); fo(g, null, 4); }
  else if (ex === 'smirk') { g.beginPath(); g.moveTo(mx - 14, my); g.quadraticCurveTo(mx + 4, my + 6, mx + 18, my - 6); fo(g, null, 4); }
  else if (ex === 'angry') line(g, [[mx - 14, my + 2], [mx + 14, my - 2]], 4);
  else line(g, [[mx - 10, my], [mx + 10, my]], 4);
  // борода
  if (o.beard) { const bcol = o.beardCol || hr.c || '#2b2220';
    if (o.beard === 'full') { g.beginPath(); g.moveTo(-60, 10); g.quadraticCurveTo(-55, 80, 0, 88); g.quadraticCurveTo(55, 80, 60, 10); g.quadraticCurveTo(40, 30, 20, 22); g.quadraticCurveTo(0, 50, -20, 22); g.quadraticCurveTo(-40, 30, -60, 10); g.closePath(); fo(g, bcol, 4); ell(g, mx, my + 4, 10, 6, '#6a2a2a', 3); }
    else if (o.beard === 'short') { g.beginPath(); g.moveTo(-52, 22); g.quadraticCurveTo(0, 90, 52, 22); g.quadraticCurveTo(0, 50, -52, 22); fo(g, bcol, 4); }
    else if (o.beard === 'moustache') { g.beginPath(); g.moveTo(mx - 26, my - 6); g.quadraticCurveTo(mx, my - 22, mx + 26, my - 6); g.quadraticCurveTo(mx, my - 10, mx - 26, my - 6); fo(g, bcol, 4); }
    else if (o.beard === 'goatee') ell(g, mx, my + 22, 14, 16, bcol, 4); }
  if (o.blush) { ell(g, -40, 22, 10, 6, 'rgba(230,110,110,.35)', 0); ell(g, 42, 22, 10, 6, 'rgba(230,110,110,.35)', 0); }
  if (o.sweat) { const k = (t * 1.2) % 1; ell(g, 58, -20 + k * 30, 7, 11, '#9fd3ef', 3); }
  hat(g, o.hat || 'none', o.hatCol, t);
  g.restore();
  if (o.prop) o.prop(g, hands, t);
  g.restore();
  return { hands, head: [o.x, o.y - 240 * s] };
}
export function hat(g, h, col, t) {
  if (h === 'crown') { const c = col || C.gold; path(g, [[-46, -48], [-50, -100], [-26, -74], [0, -108], [26, -74], [50, -100], [46, -48]]); fo(g, vgrad(g, -108, 60, c, 0.18)); ell(g, 0, -80, 7, 7, C.red, 3); ell(g, -36, -66, 5, 5, '#3a8fd9', 3); ell(g, 36, -66, 5, 5, '#3a8fd9', 3); }
  else if (h === 'turban') { const c = col || '#f2ead8'; ell(g, 0, -52, 70, 40, c); line(g, [[-60, -58], [55, -38]], 3); line(g, [[-62, -40], [60, -62]], 3); ell(g, 0, -60, 9, 11, C.gold, 3); }
  else if (h === 'laurel') { for (let i = -4; i <= 4; i++) { if (!i) continue; const a = -Math.PI / 2 + i * 0.32; ell(g, Math.cos(a) * 62, Math.sin(a) * 52 + 4, 14, 7, col || '#6aa84f', 3, a + Math.PI / 2); } }
  else if (h === 'tophat') { const c = col || '#1e1b20'; ell(g, 0, -50, 74, 12, c); rrect(g, -44, -140, 88, 92, 6); fo(g, c); line(g, [[-44, -66], [44, -66]], 10, '#7a2a2a'); }
  else if (h === 'beret') { ell(g, 6, -52, 70, 26, col || '#2b2b3a', 5, -0.1); ell(g, 10, -78, 6, 6, col || '#2b2b3a', 3); }
  else if (h === 'helmet') { const c = col || '#c9a14a'; g.beginPath(); g.ellipse(0, -18, 70, 62, 0, Math.PI, 0); g.closePath(); fo(g, vgrad(g, -80, 70, c, 0.2)); line(g, [[-30, -80], [30, -80]], 16, C.red); }
  else if (h === 'cap') { g.beginPath(); g.ellipse(0, -30, 66, 42, 0, Math.PI, 0); g.closePath(); fo(g, col || '#3a4a6a'); ell(g, 42, -30, 40, 9, col || '#3a4a6a', 4); }
  else if (h === 'fez') { path(g, [[-36, -40], [36, -40], [28, -96], [-28, -96]]); fo(g, col || '#b8322a'); line(g, [[0, -96], [30, -70]], 4); }
  else if (h === 'veil') { g.beginPath(); g.ellipse(0, -14, 70, 62, 0, Math.PI, 0); g.closePath(); fo(g, col || '#e9e2d0'); }
  else if (h === 'mughal') { const c = col || '#f2ead8'; ell(g, 0, -50, 68, 38, c); line(g, [[-58, -50], [58, -54]], 3); ell(g, 10, -72, 9, 9, C.red, 3); line(g, [[10, -80], [30, -130]], 6, '#f6efe0'); }
  else if (h === 'chinese') { g.beginPath(); g.ellipse(0, -30, 60, 44, 0, Math.PI, 0); g.closePath(); fo(g, '#1e1b20'); line(g, [[-100, -50], [-50, -40]], 10, OL); line(g, [[50, -40], [100, -50]], 10, OL); }
  else if (h === 'fur') { const c = col || '#8a5a35'; box(g, -66, -70, 132, 40, c, { r: 18 }); g.beginPath(); g.ellipse(0, -72, 52, 36, 0, Math.PI, 0); g.closePath(); fo(g, '#a8322a'); }
  else if (h === 'tudor') { ell(g, 0, -56, 76, 18, col || '#1e1b20', 5, -0.08); ell(g, 0, -66, 46, 16, col || '#1e1b20', 4); line(g, [[30, -70], [80, -110]], 7, '#f6efe0'); ell(g, -10, -60, 6, 6, C.gold, 3); }
  else if (h === 'hood') { g.beginPath(); g.ellipse(0, -6, 74, 74, 0, Math.PI * 0.9, Math.PI * 2.1); g.closePath(); fo(g, col || '#2b2228'); }
  else if (h === 'bonnet') { ell(g, 0, -46, 80, 18, col || '#5a3a5a', 5); g.beginPath(); g.ellipse(0, -52, 50, 34, 0, Math.PI, 0); g.closePath(); fo(g, col || '#5a3a5a'); ell(g, 36, -66, 12, 12, '#d96a8a', 3); }
  else if (h === 'knight') { g.beginPath(); g.ellipse(0, 4, 76, 80, 0, 0, Math.PI * 2); g.moveTo(50, 12); g.ellipse(0, 12, 50, 52, 0, 0, Math.PI * 2); g.fillStyle = '#9aa0aa'; g.fill('evenodd'); g.lineWidth = LW; g.strokeStyle = OL; g.stroke(); for (let i = -2; i <= 2; i++) line(g, [[i * 24, -72], [i * 24, -50]], 2, '#6a707a'); }
  else if (h === 'military') { g.beginPath(); g.ellipse(0, -40, 66, 30, 0, Math.PI, 0); g.closePath(); fo(g, col || '#3a4a3a'); box(g, -62, -46, 124, 18, '#2b2b2b', { r: 6, lw: 4 }); ell(g, 0, -56, 8, 8, C.gold, 3); }
  else if (h === 'bowler') { g.beginPath(); g.ellipse(0, -46, 54, 42, 0, Math.PI, 0); g.closePath(); fo(g, col || '#2b2622'); ell(g, 0, -46, 72, 12, col || '#2b2622', 4); }
  else if (h === 'kufi') { g.beginPath(); g.ellipse(0, -36, 58, 34, 0, Math.PI, 0); g.closePath(); fo(g, col || '#f2ead8'); }
}

// ------------------------------------------------------------------ ПРЕДМЕТЫ
export function coin(g, x, y, r, col = C.gold, o = {}) { ell(g, x, y, r, r, vgrad(g, y - r, r * 2, col, 0.2), o.lw ?? 4); ell(g, x, y, r * 0.68, r * 0.68, null, 3); if (o.sym) hand(g, o.sym, x, y + 2, { size: r * 0.9, color: shade(col, -0.45) }); }
export function goldBar(g, x, y, w = 90, col = C.gold) { const h = w * 0.36; path(g, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 - w * 0.14, y - h], [x - w / 2 + w * 0.14, y - h]]); fo(g, vgrad(g, y - h, h, col, 0.25), 4); line(g, [[x - w * 0.2, y - h * 0.55], [x + w * 0.1, y - h * 0.55]], 3, shade(col, 0.4)); }
export function barPile(g, x, y, n, w = 90, col = C.gold) { let i = 0; for (let row = 0; i < n; row++) { const per = Math.max(1, 4 - row); for (let j = 0; j < per && i < n; j++, i++) goldBar(g, x + (j - (per - 1) / 2) * w * 0.82, y - row * w * 0.34, w, col); } }
export function sack(g, x, y, s = 1, col = '#b8874e', label) { g.save(); g.translate(x, y); g.scale(s, s); path(g, [[-40, 0], [40, 0], [48, -40], [30, -78], [-30, -78], [-48, -40]]); g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(-62, -40, -26, -76); g.lineTo(26, -76); g.quadraticCurveTo(62, -40, 40, 0); g.closePath(); fo(g, vgrad(g, -80, 80, col, 0.15)); line(g, [[-24, -76], [24, -76]], 8, shade(col, -0.35)); ell(g, 0, -92, 18, 12, col, 4); if (label) hand(g, label, 0, -34, { size: 40, color: '#4a2a12' }); g.restore(); }
export function chest(g, x, y, s = 1, open = 0, glowK = 0) { g.save(); g.translate(x, y); g.scale(s, s); box(g, -80, -80, 160, 80, '#8a5a2b', { r: 6 }); line(g, [[-80, -40], [80, -40]], 8, '#5a3818'); box(g, -14, -56, 28, 26, C.gold, { r: 4, lw: 4 });
  if (open > 0.4) { g.save(); g.translate(0, -80); path(g, [[-80, 0], [80, 0], [70, -64 * open], [-70, -64 * open]]); fo(g, vgrad(g, -64, 64, '#6a4220', 0.1)); g.restore();
    for (let i = 0; i < 7; i++) coin(g, -54 + i * 18, -84 - (i % 2) * 12, 16); if (glowK) light(g, 0, -100, 180, '#ffe08a', 0.6 * glowK); }
  else { path(g, [[-80, -80], [80, -80], [80, -98], [-80, -98]]); g.beginPath(); g.moveTo(-80, -80); g.lineTo(80, -80); g.lineTo(80, -96); g.quadraticCurveTo(0, -136, -80, -96); g.closePath(); fo(g, vgrad(g, -130, 50, '#9a6a35', 0.15)); }
  g.restore(); }
export function camel(g, x, y, s, ph, o = {}) {
  const col = o.col || '#d8a160'; g.save(); g.translate(x, y); g.scale(s * (o.face ?? 1), s);
  softShadow(g, 0, 0, 110, 0.2);
  const legs = [-60, -36, 40, 62]; legs.forEach((lx, i) => { const sw = Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? 0.6 : 0)) * 14; limb(g, [[lx, -110], [lx + sw * 0.4, -55], [lx + sw, -6]], 16, i % 2 ? shade(col, -0.12) : col); });
  g.beginPath(); g.ellipse(0, -125, 92, 42, 0, 0, Math.PI * 2); fo(g, vgrad(g, -170, 90, col, 0.15));
  g.beginPath(); g.ellipse(-10, -160, 46, 36, 0, Math.PI, 0); fo(g, col);
  limb(g, [[70, -130], [104, -170], [116, -210]], 26, col); ell(g, 134, -214, 30, 18, col, 5, 0.15); ell(g, 140, -222, 4, 4, OL, 0); ell(g, 112, -232, 7, 10, col, 4);
  if (o.load) o.load(g);
  if (o.rider) { const r = o.rider; person(g, { ...r, x: -10, y: -150, s: 0.62, t: o.t, sit: true, pose: r.pose || 'idle' }); }
  g.restore();
}
export function palm(g, x, y, s = 1, t = 0) { g.save(); g.translate(x, y); g.scale(s, s); const sw = Math.sin(t * 0.8 + x) * 4; limb(g, [[0, 0], [8, -120], [14 + sw, -260]], 22, '#8a5a35');
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.48; g.save(); g.translate(14 + sw, -260); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(60, -30, 130, 20); g.quadraticCurveTo(60, -5, 0, 0); fo(g, '#4f9a3c', 4); g.restore(); } g.restore(); }
export function scale2(g, x, y, s, tilt, left, right) {
  g.save(); g.translate(x, y); g.scale(s, s); box(g, -70, -16, 140, 16, '#6a4a2a'); limb(g, [[0, -16], [0, -240]], 12, '#8a6a3a'); ell(g, 0, -244, 14, 14, C.gold, 4);
  g.save(); g.translate(0, -236); g.rotate(tilt); limb(g, [[-170, 0], [170, 0]], 10, '#8a6a3a');
  [[-170, left], [170, right]].forEach(([px, fn]) => { g.save(); g.translate(px, 0); g.rotate(-tilt); line(g, [[0, 0], [-60, 110]], 3); line(g, [[0, 0], [60, 110]], 3); g.beginPath(); g.moveTo(-80, 110); g.quadraticCurveTo(0, 150, 80, 110); g.closePath(); fo(g, '#c99a4a'); g.translate(0, 108); if (fn) fn(g); g.restore(); });
  g.restore(); g.restore();
}
export function phone(g, x, y, s, draw) { g.save(); g.translate(x, y); g.scale(s, s); rrect(g, -120, -230, 240, 460, 30); fo(g, '#24242c'); rrect(g, -104, -200, 208, 400, 12); fo(g, '#fbfbfb', 3); g.save(); rrect(g, -104, -200, 208, 400, 12); g.clip(); g.translate(0, -200); draw(g); g.restore(); g.restore(); }
export function scroll(g, x, y, w, h, k = 1, draw) { if (k <= 0) return; g.save(); g.translate(x, y); const hh = h * ease.out(clamp(k)); box(g, -w / 2, -hh / 2, w, hh, '#efe0b8', { r: 6, sh: 0.08 }); limb(g, [[-w / 2 - 10, -hh / 2], [w / 2 + 10, -hh / 2]], 18, '#c9a46a'); limb(g, [[-w / 2 - 10, hh / 2], [w / 2 + 10, hh / 2]], 18, '#c9a46a'); if (draw && k > 0.7) { g.globalAlpha = (k - 0.7) / 0.3; draw(g); } g.restore(); }
export function candle(g, x, y, t) { box(g, x - 10, y - 60, 20, 60, '#f6efe0', { r: 4, lw: 4 }); const fl = 1 + noise(t * 8, x) * 0.15; ell(g, x, y - 76, 9 * fl, 16 * fl, '#ffc94a', 3); light(g, x, y - 76, 220, '#ffd27a', 0.45); }
export function flame(g, x, y, s, t, seed = 0) { g.save(); g.translate(x, y); g.scale(s, s); for (const [c, k] of [['#e8452f', 1], ['#f59b2f', 0.72], ['#ffd94a', 0.45]]) { const w = 60 * k, h = (150 + noise(t * 6, seed) * 30) * k; g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 1.1, -h * 0.5, noise(t * 4, seed + 3) * 20 * k, -h); g.quadraticCurveTo(w * 1.1, -h * 0.5, w, 0); g.closePath(); fo(g, c, k === 1 ? 4 : 0); } g.restore(); light(g, x, y - 80 * s, 260 * s, '#ffb24a', 0.4); }
export function smoke(g, x, y, t, n = 6, s = 1) { for (let i = 0; i < n; i++) { const k = ((t * 0.35 + i / n) % 1); ell(g, x + Math.sin(i * 2 + t) * 30 * k, y - k * 380 * s, (30 + k * 70) * s, (26 + k * 60) * s, alpha('#5a5560', 0.75 * (1 - k)), 0); } }
export function banknoteStack(g, x, y, h, w = 150, col = '#7cc35a') { for (let i = 0; i < h; i++) { const yy = y - i * 22; rrect(g, x - w / 2 + (i % 2) * 4, yy - 22, w, 22, 4); fo(g, i % 2 ? col : shade(col, -0.08), 4); ell(g, x + (i % 2) * 4, yy - 11, 9, 7, shade(col, -0.3), 0); } }

// ------------------------------------------------------------------ ФОНЫ (рисуются в мировых координатах 1920×1080)
export function desert(g, t, o = {}) {
  const sunset = o.sunset; sky(g, sunset ? ['#5d4a8a', '#e3786a', '#f6b26b', '#fbe0a8'] : ['#7ec4ea', '#bfe3f2', '#f6e3b6']);
  const sx = o.sunX ?? 1400, sy = o.sunY ?? 330; ell(g, sx, sy, 90, 90, sunset ? '#ffe3a0' : '#fff6d0', 0); light(g, sx, sy, 400, '#fff0b0', 0.5);
  for (let i = 0; i < 4; i++) { const yy = 560 + i * 25, cx = (i * 530 + 200) % 2200; ell(g, cx, yy - 180 - i * 30, 140, 30, alpha('#fff', sunset ? 0.25 : 0.7), 0); }
  if (o.city) o.city(g);
  const cols = sunset ? ['#e3a46a', '#d48a52', '#c07440'] : ['#f0c487', '#e4ad6c', '#d29757'];
  cols.forEach((c, i) => { const y0 = 640 + i * 110; g.beginPath(); g.moveTo(-E.W, E.H * 2); g.lineTo(-E.W, y0); for (let x = -E.W; x <= E.W * 2; x += 40) g.lineTo(x, y0 + Math.sin(x * 0.004 + i * 2) * (34 - i * 6) + Math.sin(x * 0.011 + i) * 10); g.lineTo(E.W * 2, E.H * 2); g.closePath(); fo(g, vgrad(g, y0 - 40, 300, c, 0.08), 4); });
}
// силуэт Каира: стены, купола, минареты
export function cairo(g, x0, y0, s = 1, col = '#c98f5a') {
  g.save(); g.translate(x0, y0); g.scale(s, s);
  const W2 = 1100; box(g, 0, -150, W2, 150, col, { r: 2 });
  for (let i = 0; i <= 11; i++) box(g, i * 96, -176, 44, 30, col, { r: 2, lw: 4 });
  const bld = [[60, 120, 220], [220, 160, 280], [420, 220, 260], [700, 140, 300], [880, 160, 240]];
  bld.forEach(([x, w, h], i) => { box(g, x, -h, w, h - 150, shade(col, i % 2 ? 0.08 : -0.05), { r: 2 }); });
  // купол мечети + минареты
  g.beginPath(); g.arc(560, -300, 110, Math.PI, 0); g.closePath(); fo(g, vgrad(g, -410, 110, '#e7c48a', 0.15)); box(g, 440, -300, 240, 150, '#d9a96a', { r: 2 }); ell(g, 560, -420, 10, 14, C.gold, 3);
  [[360, 420], [760, 460], [1000, 380]].forEach(([x, h]) => { box(g, x - 18, -h, 36, h - 150, '#e2b67a', { r: 2 }); poly(g, [[x - 24, -h], [x + 24, -h], [x, -h - 60]], '#d9a96a'); box(g, x - 28, -h + 60, 56, 14, '#c99a5a', { r: 2, lw: 4 }); });
  for (let i = 0; i < 14; i++) { const x = 30 + i * 78; rrect(g, x, -110 + (i % 3) * 20, 26, 34, 12); fo(g, '#7a4a2a', 4); }
  g.restore();
}
export function wallRoom(g, o = {}) {   // интерьер: стена + пол + плинтус
  const wall = o.wall || '#e9dcc0', floor = o.floor || '#9a6a42', fy = o.fy ?? 760;
  g.fillStyle = vgrad(g, 0, fy, wall, 0.1); g.fillRect(-E.W, -E.H, E.W * 3, fy + E.H);
  g.fillStyle = vgrad(g, fy, E.H - fy, floor, 0.15); g.fillRect(-E.W, fy, E.W * 3, E.H * 2); line(g, [[-E.W, fy], [E.W * 2, fy]], 6);
  if (o.boards) for (let i = 1; i < 6; i++) line(g, [[-E.W, fy + i * 60 + i * i * 6], [E.W * 2, fy + i * 60 + i * i * 6]], 2, alpha(OL, 0.3));
  box(g, -E.W, fy - 26, E.W * 3, 26, shade(wall, -0.25), { r: 0, lw: 4 });
}
export function window_(g, x, y, w, h, draw, o = {}) { g.save(); rrect(g, x, y, w, h, o.arch ? w / 2 : 6); g.save(); g.clip(); draw(g); g.restore(); fo(g, null, 8, o.frame || '#6a4a2a'); rrect(g, x, y, w, h, o.arch ? w / 2 : 6); fo(g, null, LW); if (o.bars !== false) { line(g, [[x + w / 2, y], [x + w / 2, y + h]], 6, o.frame || '#6a4a2a'); line(g, [[x, y + h * 0.55], [x + w, y + h * 0.55]], 6, o.frame || '#6a4a2a'); } g.restore(); }
export function frame(g, x, y, w, h, draw, col = '#b8873a') { box(g, x - 14, y - 14, w + 28, h + 28, col, { r: 4 }); g.save(); rrect(g, x, y, w, h, 2); g.clip(); draw(g); g.restore(); rrect(g, x, y, w, h, 2); fo(g, null, 4); }
export function rug(g, x, y, w, h, c1 = '#a8322a', c2 = C.gold) { g.save(); g.translate(x, y); g.scale(1, 0.32); rrect(g, -w / 2, -h / 2, w, h, 10); fo(g, c1, 6); rrect(g, -w / 2 + 26, -h / 2 + 26, w - 52, h - 52, 8); fo(g, null, 8, c2); g.restore(); }
export function curtain(g, x, y, w, h, col = '#a8322a', side = 1) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.quadraticCurveTo(x + w * 0.3, y + h * 0.5, x + w * (side > 0 ? 0.55 : 0.2), y + h); g.lineTo(x, y + h); g.closePath(); fo(g, hgrad(g, x, w, col, 0.25)); for (let i = 1; i < 4; i++) line(g, [[x + i * w / 5, y + 10], [x + i * w / 6, y + h - 10]], 3, shade(col, -0.3)); }
export function shelf(g, x, y, w, items = []) { box(g, x, y, w, 16, '#7a5232', { r: 2, lw: 4 }); items.forEach((fn, i) => fn(g, x + (i + 0.5) * w / items.length, y)); }
export function books(g, x, y, n = 6, seed = 3) { const r = rng(seed); let xx = x; for (let i = 0; i < n; i++) { const w = 18 + r() * 10, h = 60 + r() * 30; box(g, xx, y - h, w, h, ['#a8322a', '#3a6aa8', '#5a8a3a', '#c99a3a', '#6a4a8a'][i % 5], { r: 2, lw: 3 }); xx += w + 2; } }
export function vase(g, x, y, col = '#3a7aa8') { g.beginPath(); g.moveTo(x - 16, y - 70); g.quadraticCurveTo(x - 50, y - 30, x - 22, y); g.lineTo(x + 22, y); g.quadraticCurveTo(x + 50, y - 30, x + 16, y - 70); g.closePath(); fo(g, vgrad(g, y - 70, 70, col, 0.2)); }
export function plant(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.45; g.save(); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, -40); g.quadraticCurveTo(26, -110, 0, -150); g.quadraticCurveTo(-26, -110, 0, -40); fo(g, '#5aa04a', 4); g.restore(); } box(g, -36, -50, 72, 50, '#c0703a', { r: 6 }); g.restore(); }
export function clock(g, x, y, r, t, speed = 0.1) { ell(g, x, y, r, r, '#fbf6ea', 6); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(g, [[x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]], 3); } const a1 = t * speed * 2 * Math.PI - Math.PI / 2, a2 = a1 / 12; line(g, [[x, y], [x + Math.cos(a1) * r * 0.75, y + Math.sin(a1) * r * 0.75]], 4); line(g, [[x, y], [x + Math.cos(a2) * r * 0.5, y + Math.sin(a2) * r * 0.5]], 6); }
// карта-пергамент с маршрутом
export function parchment(g, x, y, w, h) { g.save(); g.translate(x, y); g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40; g.lineTo(-w / 2 + a * w, -h / 2 + noise(a * 9, 2) * 8); } for (let i = 0; i <= 30; i++) { const a = i / 30; g.lineTo(w / 2 + noise(a * 9, 4) * 8, -h / 2 + a * h); } for (let i = 0; i <= 40; i++) { const a = i / 40; g.lineTo(w / 2 - a * w, h / 2 + noise(a * 9, 6) * 8); } for (let i = 0; i <= 30; i++) { const a = i / 30; g.lineTo(-w / 2 + noise(a * 9, 8) * 8, h / 2 - a * h); } g.closePath();
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.6); gr.addColorStop(0, '#f6e7c0'); gr.addColorStop(1, '#d9bb84'); fo(g, gr, 5); g.restore(); }
export function dashed(g, pts, k, col = C.red, w = 7) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let rem = tot * clamp(k); g.save(); g.setLineDash([18, 14]); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(...pts[0]); let end = pts[0];
  for (let i = 1; i < pts.length && rem > 0; i++) { const d = L[i - 1], f = Math.min(1, rem / d); end = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; g.lineTo(...end); rem -= d; } g.stroke(); g.restore(); return end; }
// город-силуэт современный
export function skyline(g, y, t, o = {}) { const r = rng(o.seed || 5); let x = -400; while (x < E.W + 400) { const w = 90 + r() * 120, h = 180 + r() * 380; box(g, x, y - h, w, h, o.col || shade('#6a5a8a', (r() - 0.5) * 0.2), { r: 2, lw: 4 }); for (let yy = y - h + 24; yy < y - 20; yy += 34) for (let xx = x + 14; xx < x + w - 20; xx += 30) if (r() > 0.45) { g.fillStyle = o.win || '#ffd77a'; g.fillRect(xx, yy, 14, 18); } x += w + 6; } }
