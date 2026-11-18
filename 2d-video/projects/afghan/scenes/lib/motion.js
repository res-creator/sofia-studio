// motion.js — «живость» уровня референсов: поп текста по кривой 60%→105%→100%, счётчики, частицы эмоций,
// сплит-экран с падающими панелями, анимация поз и действий, печать в такт голосу, фоновая жизнь, предметы в руках.
// Все времена событий в params хранятся АБСОЛЮТНЫМИ (секунды фильма); R(i, a) переводит в локальные секунды шота.
import { E, ease, clamp, lerp, noise, rng, shade, OL, fo, rr, el, ln, pg, bx, vg, blob, glow, htxt, fig } from './pro.js';
import { tag, big } from '/projects/remote/scenes/lib/sets.js';

const FR = () => 1 / (E.fps || 24);
export const R = (i, a) => (a == null ? 1e9 : a - i.shot.start);

// ------------------------------------------------------------------ поп по кривой референса
// 4 кадра: масштаб 0,6 → 1,05, ещё 2 кадра: → 1,0; поворот −8° → −2°; прозрачность 0,4 → 1
export function pop2(t, a) {
  if (t < a) return null; const f = (t - a) / FR();
  const k = f < 4 ? 0.6 + 0.45 * ease.out(f / 4) : 1.05 - 0.05 * ease.out(clamp((f - 4) / 2));
  return { k, rot: lerp(-0.14, -0.035, ease.out(clamp(f / 6))), a: 0.4 + 0.6 * clamp(f / 4) };
}
// уход: быстро сжимается за 4 кадра
const out2 = (t, b) => (b == null || t < b ? 1 : 1 - ease.in(clamp((t - b) / (4 * FR()))));
export function ptxt(g, s, x, y, size, t, a, o = {}) {
  const p = pop2(t, a); if (!p) return; const k = p.k * out2(t, o.until); if (k <= 0.01) return;
  g.save(); g.globalAlpha *= p.a; big(g, s, x, y, size, k, o.col || '#ffffff', o.rot ?? p.rot); g.restore();
}
export function ptag(g, s, x, y, t, a, o = {}) {
  const p = pop2(t, a); if (!p) return; const k = p.k * out2(t, o.until); if (k <= 0.01) return;
  g.save(); g.globalAlpha *= p.a; tag(g, s, x, y, k, { size: o.size ?? 72, bg: o.bg, rot: o.rot ?? p.rot, col: o.col }); g.restore();
}
// ------------------------------------------------------------------ счётчик 0 → N с подписью
const fmt = (v, dec) => { const s = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v)); return Math.abs(v) < 10000 ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
export function countUp(g, t, a, from, to, x, y, o = {}) {
  const p = pop2(t, a); if (!p) return; const d = o.dur ?? 1.0, v = lerp(from, to, ease.out(clamp((t - a) / d)));
  const s = (o.pre || '') + fmt(v, o.dec) + (o.suf || ''), size = o.size ?? 190;
  g.save(); g.globalAlpha *= p.a; big(g, s, x, y, size, p.k, o.col || '#ffd43b', o.rot ?? p.rot); g.restore();
  if (o.unit) ptxt(g, o.unit, x + (o.ux ?? 0), y + size * 0.62 + (o.uy ?? 0), o.usize ?? 64, t, a + d * 0.7, { col: o.ucol || '#ffffff' });
}
export const countTicks = (a, d = 1.0, n = 6) => [...Array(n)].map((_, k) => a + d * ease.out(k / n) * 0.9);

// ------------------------------------------------------------------ частицы эмоций
const star = (g, r) => { g.beginPath(); for (let k = 0; k < 10; k++) { const rr2 = k % 2 ? r * 0.45 : r, an = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } g.closePath(); };
const heart = (g, r) => { g.beginPath(); g.moveTo(0, r * 0.9); g.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.4); g.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.4, -r * 0.1, 0, r * 0.9); g.closePath(); };
export function burst(g, t, a, x, y, kind = 'stars', o = {}) {
  const life = o.life ?? 0.9; if (t < a || t > a + life + 0.6) return; const N = o.n ?? 18, r = rng(o.seed ?? 7), sp = o.speed ?? 520;
  for (let i = 0; i < N; i++) {
    const an = (o.dir ?? -Math.PI / 2) + (r() - 0.5) * (o.spread ?? Math.PI * 2), v = sp * (0.45 + r() * 0.75), dl = r() * (o.stagger ?? 0.08), lt = t - a - dl; if (lt < 0) continue;
    const L = life * (0.7 + r() * 0.5); if (lt > L) continue; const u = lt / L, fly = ease.out(clamp(lt / (8 * FR()))) * 0.35 + lt * 0.65;
    const px = x + Math.cos(an) * v * fly, py = y + Math.sin(an) * v * fly + (o.grav ?? 300) * lt * lt, sz = (o.size ?? 22) * (0.6 + r() * 0.6) * (u < 0.15 ? u / 0.15 : 1 - Math.max(0, u - 0.7) / 0.3);
    if (sz <= 0.5) continue; g.save(); g.translate(px, py); g.rotate(r() * 6 + lt * (r() - 0.5) * 8); g.globalAlpha *= clamp(1.4 - u);
    if (kind === 'stars') { star(g, sz); fo(g, ['#ffd43b', '#fff3a0', '#ffffff'][i % 3], 3); }
    else if (kind === 'hearts') { heart(g, sz); fo(g, ['#ff7aa8', '#ff4f86', '#ffc2d6'][i % 3], 3); }
    else if (kind === 'sparkle') { g.beginPath(); for (let k = 0; k < 8; k++) { const rr2 = k % 2 ? sz * 0.25 : sz, an2 = k * Math.PI / 4; g.lineTo(Math.cos(an2) * rr2, Math.sin(an2) * rr2); } g.closePath(); fo(g, '#ffffff', 0); }
    else if (kind === 'hair') { ln(g, [[-sz, 0], [0, sz * 0.25], [sz, 0]], 4, o.col || '#3a2a20'); }
    else if (kind === 'dust') { el(g, 0, 0, sz, sz * 0.8, o.col || 'rgba(214,196,160,.85)', 0); }
    else if (kind === 'notes') { htxt(g, i % 2 ? '♪' : '♫', 0, 0, sz * 3, o.col || '#ffffff'); }
    else if (kind === 'steam') { g.globalAlpha *= 0.5; el(g, 0, 0, sz * 1.6, sz * 1.2, '#ffffff', 0); }
    else if (kind === 'lines') { ln(g, [[0, 0], [sz * 3, 0]], 6, o.col || '#ffffff'); }
    g.restore();
  }
}
// капля пота: появляется за 1–2 кадра и стекает
export function sweatDrop(g, t, a, x, y, s = 1) { if (t < a) return; const u = clamp((t - a) / 1.1); if (u >= 1) return; g.save(); g.translate(x, y + u * 60 * s); g.scale(s * (t - a < FR() * 2 ? 0.6 : 1), s); g.globalAlpha *= 1 - u * 0.6; g.beginPath(); g.moveTo(0, -18); g.quadraticCurveTo(14, 4, 0, 11); g.quadraticCurveTo(-14, 4, 0, -18); fo(g, '#bfe6ff', 3); g.restore(); }
// красный крест-печать: хлопок за 3 кадра
export function stampX(g, t, a, x, y, r = 120, o = {}) {
  if (t < a) return; const f = (t - a) / FR(), k = f < 3 ? lerp(1.6, 0.95, f / 3) : lerp(0.95, 1, clamp((f - 3) / 2)); g.save(); g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.08); g.globalAlpha *= clamp(f / 2 + 0.3);
  for (const [w, c] of [[r * 0.36, '#141212'], [r * 0.24, o.col || '#e2483a']]) { ln(g, [[-r, -r], [r, r]], w, c); ln(g, [[r, -r], [-r, r]], w, c); } g.restore();
}
export function stampOK(g, t, a, x, y, r = 90) { if (t < a) return; const f = (t - a) / FR(), k = f < 3 ? lerp(1.5, 0.95, f / 3) : 1; g.save(); g.translate(x, y); g.scale(k, k); for (const [w, c] of [[r * 0.34, '#141212'], [r * 0.22, '#4fb04a']]) ln(g, [[-r * 0.9, 0], [-r * 0.25, r * 0.6], [r, -r * 0.7]], w, c); g.restore(); }

// ------------------------------------------------------------------ сплит-экран: панели падают сверху за 7 кадров, без отскока
// panels: [{at, x, y, w, h, draw(g, t), zoom}]; draw рисует сцену 1920×1080, панель показывает её «cover»
export function panel(g, t, P, o = {}) {
  if (t < P.at) return; const u = ease.out(clamp((t - P.at) / (7 * FR()))), dy = (1 - u) * -(P.y + P.h + 60);
  g.save(); g.translate(0, dy); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(P.x + 10, P.y + 14, P.w, P.h);
  g.save(); g.beginPath(); g.rect(P.x, P.y, P.w, P.h); g.clip(); const sc = Math.max(P.w / 1920, P.h / 1080) * (P.zoom ?? 1) * (1 + 0.035 * (t - P.at)), fx = P.fx ?? 960, fy = P.fy ?? 540;
  g.translate(P.x + P.w / 2, P.y + P.h / 2); g.scale(sc, sc); g.translate(-fx, -fy); P.draw(g, t - P.at, t); g.restore();
  g.lineWidth = 12; g.strokeStyle = '#f6f1e4'; g.strokeRect(P.x, P.y, P.w, P.h); g.lineWidth = 3; g.strokeStyle = OL; g.strokeRect(P.x - 6, P.y - 6, P.w + 12, P.h + 12); g.restore();
}
export const split = (g, t, panels) => panels.forEach((P) => panel(g, t, P));

// ------------------------------------------------------------------ позы как ключи: [[t, 'pose'|array], ...], переход за 7 кадров
const POSES = {
  idle: [[-100, -170, 1], [100, -170, -1]], hips: [[-95, -190, -1], [95, -190, 1]], point: [[-100, -175, 1], [235, -330, 1]], shrug: [[-165, -300, -1], [165, -300, 1]],
  tea: [[-100, -175, 1], [62, -255, -1]], reach: [[-100, -175, 1], [175, -250, -1]], chin: [[-100, -175, 1], [22, -372, -1]], desk: [[-70, -215, 1], [75, -215, -1]],
  cheer: [[-150, -540, -1], [150, -540, 1]], hush: [[-100, -175, 1], [12, -380, -1]], wave: [[-100, -175, 1], [190, -500, 1]], hug: [[-30, -250, 1], [150, -250, -1]],
  hold: [[-100, -175, 1], [135, -265, -1]], hold2: [[-60, -255, 1], [135, -265, -1]], up: [[-100, -175, 1], [150, -470, -1]], knock: [[-100, -175, 1], [205, -360, 1]],
  cut: [[-40, -300, 1], [150, -420, -1]], face: [[-30, -390, 1], [30, -390, -1]], sweep: [[60, -200, 1], [130, -240, -1]], fist: [[-100, -175, 1], [8, -330, -1]], down: [[-90, -160, 1], [90, -160, -1]],
};
const P_ = (p) => (typeof p === 'string' ? POSES[p] || POSES.idle : p);
export function poseAt(t, keys, d = 7 * FR()) {
  if (typeof keys === 'string') return P_(keys); if (!(Array.isArray(keys) && keys[0] && keys[0].length === 2 && typeof keys[0][0] === 'number')) return keys;
  let cur = P_(keys[0][1]);
  for (let i = 1; i < keys.length; i++) { const [tk, pk] = keys[i]; if (t < tk) break; const u = ease.out(clamp((t - tk) / d)), nx = P_(pk); cur = cur.map((h, j) => [lerp(h[0], nx[j][0], u), lerp(h[1], nx[j][1], u), u < 0.5 ? h[2] : nx[j][2]]); }
  return cur;
}
// значение по ключам с плавным переходом: kv(t, [[t, v], ...], d)
export function kv(t, keys, d = 7 * FR(), fn = ease.out) { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [tk, nv] = keys[i]; if (t < tk) break; v = lerp(v, nv, fn(clamp((t - tk) / d))); } return v; }
// фигура с действиями: o.poses, o.walk {x0, x1, at, dur}, o.nod [t…], o.bowAt, o.jumpAt, o.exprs [[t, expr]]
export function actor(g, x, y, s, o, t) {
  const oo = { ...o }; let X = x;
  if (o.poses) oo.pose = poseAt(t, o.poses);
  if (o.exprs) { let e = o.exprs[0][1]; for (const [tk, ek] of o.exprs) if (t >= tk) e = ek; oo.expr = e; }
  if (o.walk) { const W = o.walk, u = clamp((t - W.at) / W.dur); X = lerp(W.x0, W.x1, W.lin ? u : ease.out(u) * 0.25 + u * 0.75); if (u > 0 && u < 1) { oo.step = (t - W.at) * (W.rate ?? 9); oo.flip = W.x1 < W.x0 ? !o.flip : o.flip; } }
  if (o.nods) { let tl = 0; for (const n of o.nods) { const u = (t - n) / 0.45; if (u > 0 && u < 1) tl += Math.sin(u * Math.PI) * 0.16; } oo.tilt = (o.tilt ?? 0) + tl; }
  if (o.shakes) { let tl = 0; for (const n of o.shakes) { const u = (t - n) / 0.8; if (u > 0 && u < 1) tl += Math.sin(u * Math.PI * 4) * 0.4 * (1 - u); } oo.turn = (o.turn ?? 0) + tl; }
  if (o.bowAt != null) { const u = t - o.bowAt; oo.bow = u < 0 ? 0 : u < 0.8 ? 0.45 * ease.out(u / 0.8) : u < 1.3 ? 0.45 : 0.45 * (1 - ease.inOut((u - 1.3) / 0.6)); }
  if (o.jumpAt) { let L = 0; for (const j of [].concat(o.jumpAt)) { const u = (t - j) / 0.5; if (u > 0 && u < 1) L += Math.sin(u * Math.PI) * 120; } oo.lift = L; }
  if (o.veilKeys) oo.veil = kv(t, o.veilKeys, 0.6, ease.inOut);
  fig(g, X, y, s, oo, t);
  return X;
}
// ------------------------------------------------------------------ печать в такт голосу: буквы слова появляются между его началом и концом
export function typed(s, gt, w0) {
  const Wd = E.words; let i = Wd.findIndex((w) => w.start >= w0 - 0.06); if (i < 0) return s;
  const tok = s.split(' '); let out = '';
  for (let j = 0; j < tok.length; j++) { const w = Wd[i + j]; if (!w || gt < w.start) break; const u = clamp((gt - w.start) / Math.max(0.08, w.end - w.start)); out += (j ? ' ' : '') + tok[j].slice(0, Math.max(1, Math.ceil(tok[j].length * u))); }
  return out;
}
export function typeLine(g, s, x, y, size, gt, w0, o = {}) {
  const str = typed(s, gt, w0); if (!str) return; g.save(); g.font = `700 ${size}px "Caveat"`; const full = g.measureText(s).width; g.textAlign = 'left'; g.textBaseline = 'middle';
  if (o.stroke !== false) { g.lineJoin = 'round'; g.lineWidth = size * 0.14; g.strokeStyle = o.sc || '#141212'; g.strokeText(str, x - full / 2, y); } g.fillStyle = o.col || '#ffffff'; g.fillText(str, x - full / 2, y); g.restore();
}
// ------------------------------------------------------------------ фоновая жизнь
export function dust(g, t, x0, y0, w, h, n = 40, seed = 3) { const r = rng(seed); g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < n; i++) { const bx0 = r() * w, by0 = r() * h, sp = 6 + r() * 14, ph = r() * 9; const px = x0 + ((bx0 + t * sp + noise(t * 0.3 + ph, i) * 30) % w + w) % w, py = y0 + ((by0 - t * sp * 0.4 + noise(t * 0.25, i + 9) * 20) % h + h) % h; g.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + ph)); g.fillStyle = '#fff3d0'; g.beginPath(); g.arc(px, py, 2 + r() * 3, 0, Math.PI * 2); g.fill(); } g.restore(); }
export function flicker(t, seed = 1) { const n = noise(t * 7, seed); return n > 0.82 ? 0.55 : 1 - Math.max(0, n) * 0.08; }
// прохожие на заднем плане: маленькие фигуры идут слева направо и обратно
export function passers(g, t, list, y = 700, s = 0.32) {
  list.forEach(([who, x0, v, ph], k) => { const span = 2600, X = ((x0 + v * t) % span + span) % span - 340; fig(g, X, y, s, { ...who, step: t * 9 + (ph || 0), flip: v < 0, seed: 70 + k }, t + k); });
}
// ------------------------------------------------------------------ предметы в руках (локальные координаты кисти)
export const scissors = (open) => (g, x, y) => { g.save(); g.translate(x + 26, y - 30); g.rotate(-0.7); const a = 0.08 + 0.32 * open; [a, -a].forEach((r, k) => { g.save(); g.rotate(r); bx(g, -6, -96, 12, 92, '#c8ccd4', 5, 4, 0.2); g.beginPath(); g.ellipse(0, 18, 18, 14, 0, 0, Math.PI * 2); g.lineWidth = 9; g.strokeStyle = OL; g.stroke(); g.lineWidth = 5; g.strokeStyle = k ? '#e2483a' : '#3a6aa8'; g.stroke(); g.restore(); }); el(g, 0, -4, 6, 6, '#8a8a8a', 3); g.restore(); };
export const dryer = (on, t = 0) => (g, x, y) => { g.save(); g.translate(x + 10, y - 20); g.rotate(-0.25); bx(g, -16, -10, 32, 90, '#e2483a', 10, 4); bx(g, -40, -70, 150, 64, '#e2483a', 30, 5); bx(g, 100, -60, 34, 44, '#3a3a3a', 6, 4); if (on) for (let k = 0; k < 4; k++) { const u = ((t * 2.2 + k / 4) % 1); g.save(); g.globalAlpha = 0.7 * (1 - u); ln(g, [[150 + u * 120, -50 + k * 10 - 10], [190 + u * 120, -54 + k * 10 - 10 + Math.sin(t * 20 + k) * 6]], 5, '#ffffff'); g.restore(); } g.restore(); };
export const broom = (g, x, y) => { g.save(); g.translate(x, y); g.rotate(0.35); ln(g, [[0, -120], [0, 170]], 12, OL); ln(g, [[0, -120], [0, 170]], 7, '#b8864a'); pg(g, [[-40, 170], [40, 170], [60, 250], [-60, 250]], '#d8b85a', 4); for (let k = -50; k <= 50; k += 16) ln(g, [[k * 0.7, 190], [k, 246]], 2, '#8a6a2a'); g.restore(); };
export const money = (g, x, y) => { g.save(); g.translate(x + 10, y - 16); g.rotate(-0.2); for (let k = 2; k >= 0; k--) { bx(g, -50 + k * 6, -30 - k * 8, 100, 54, '#7ab07a', 4, 3, 0.1); el(g, k * 6, -3 - k * 8, 14, 14, '#5a8a5a', 2); } g.restore(); };
export const toolbag = (g, x, y) => { g.save(); g.translate(x, y + 70); bx(g, -70, 0, 140, 90, '#7a5236', 14, 5); g.beginPath(); g.arc(0, 0, 36, Math.PI, 0); g.lineWidth = 9; g.strokeStyle = OL; g.stroke(); ln(g, [[-30, 0], [-50, -40]], 8, '#9a9aa0'); ln(g, [[30, 0], [45, -50]], 10, '#6a6a70'); g.restore(); };
export const handbag = (g, x, y) => { g.save(); g.translate(x, y + 50); bx(g, -50, 0, 100, 70, '#8a4a6a', 12, 4); g.beginPath(); g.arc(0, 0, 26, Math.PI, 0); g.lineWidth = 7; g.strokeStyle = OL; g.stroke(); g.restore(); };
export const cloth = (g, x, y) => { g.save(); g.translate(x, y); pg(g, [[-20, -10], [60, -30], [40, 120], [-30, 140]], vg(g, -30, 170, '#c84a6a', 0.15), 4); g.restore(); };
export const folder = (g, x, y) => { g.save(); g.translate(x + 10, y - 20); g.rotate(-0.15); bx(g, -44, -60, 88, 116, '#e8d8a8', 6, 4); ln(g, [[-28, -30], [28, -30]], 4, '#8a7a5a'); ln(g, [[-28, -10], [20, -10]], 4, '#8a7a5a'); ln(g, [[-28, 10], [24, 10]], 4, '#8a7a5a'); g.restore(); };
export const comb = (g, x, y) => { g.save(); g.translate(x + 8, y - 30); g.rotate(-0.4); bx(g, -8, -60, 16, 70, '#3a3a3a', 4, 3); for (let k = 0; k < 6; k++) ln(g, [[8, -54 + k * 11], [26, -54 + k * 11]], 4, '#3a3a3a'); g.restore(); };
export const book = (g, x, y) => { g.save(); g.translate(x + 10, y - 30); g.rotate(-0.1); pg(g, [[-70, -40], [0, -30], [0, 50], [-70, 40]], '#f4efe2', 4); pg(g, [[70, -40], [0, -30], [0, 50], [70, 40]], '#f4efe2', 4); for (let k = 0; k < 4; k++) { ln(g, [[-58, -22 + k * 16], [-12, -16 + k * 16]], 3, '#8a8aa0'); ln(g, [[12, -16 + k * 16], [58, -22 + k * 16]], 3, '#8a8aa0'); } g.restore(); };
export { tag, big, glow, blob };
