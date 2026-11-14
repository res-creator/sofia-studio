// lib.js — shared helpers for the WW3 film (started in ww3-test; extended for the full film below): Cyrillic word timing, Russian labels, Petrov's officer cap,
// a 2D orthographic globe with hand-made coarse continents, the polar early-warning map, the red phone.
import { E, V, S, clamp, lerp, ease, prog, text, FONTS, alpha, seg, circle, ring, rr, poly, glow, mix, shade, linGrad, radGrad, rng } from '/engine/core.js';
import { drawFigure, headPos, bigFace, POSES, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { PETROV, WHO, COL } from './cast.js';

// ---------- word timing (engine wordTime strips Cyrillic, so use a Unicode-aware one) ----------
const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]/gu, '');
export function wt(word, after = 0) { const m = norm(word); const w = E.words.find((w) => w.start >= after - 0.05 && norm(w.word).startsWith(m)); return w ? w.start : null; }
export const lt = (info, word, fb = 0) => { const v = wt(word, info.shot.start - 0.3); return v == null ? fb : v - info.shot.start; };

// ---------- text ----------
export function label(g, str, x, y, o = {}) {
  const { size = V(34, 40), color = S().ui.cream, a = 1, align = 'center', spacing = 3, weight = 900, glowA = 0.5 } = o;
  if (a <= 0) return;
  text(g, str, x, y, { size, color, font: FONTS.ui, weight, align, spacing, alpha: a, glow: o.glow ?? 14, glowColor: alpha(color, glowA) });
}
// lower-third nameplate (gold bar + name + role)
export function nameplate(g, t, o = {}) {
  const { name, role, x = V(150, 90), y = E.H - V(250, 520), start = 0, color = S().ui.gold, dur = 99 } = o;
  const p = ease.out(prog(t, start, start + 0.5)) * clamp((dur - t) / 0.3); if (p <= 0) return;
  g.save(); g.globalAlpha *= p;
  g.fillStyle = color; g.fillRect(x, y - 44, 8, 104);
  text(g, name, x + 30 + (1 - p) * 30, y - 10, { size: V(48, 52), color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2, glow: 14, glowColor: 'rgba(0,0,0,.6)' });
  text(g, role, x + 32 + (1 - p) * 50, y + 40, { size: V(26, 30), color, font: FONTS.ui, weight: 800, align: 'left', spacing: 4 });
  g.restore();
}

// ---------- Petrov's officer cap (фуражка), drawn over the plain head ----------
export function officerCap(g, hx, hy, r, facing = 1, o = {}) {
  const c = o.color || PETROV.color, dark = shade(c, -0.45), band = shade(c, -0.6);
  const draw = (col, colBand, colVisor, dx = 0, dy = 0) => {
    g.save(); g.translate(hx + dx, hy + dy);
    if (o.front) {
      g.fillStyle = col; g.beginPath(); g.ellipse(0, -r * 0.92, r * 1.35, r * 0.42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = col; g.fillRect(-r * 1.0, -r * 0.92, r * 2.0, r * 0.3);
      g.fillStyle = colBand; g.fillRect(-r * 1.0, -r * 0.64, r * 2.0, r * 0.22);
      g.fillStyle = colVisor; g.beginPath(); g.ellipse(0, -r * 0.42, r * 0.95, r * 0.2, 0, 0, Math.PI); g.fill();
    } else {
      g.scale(facing, 1);
      g.fillStyle = col; g.beginPath(); g.ellipse(r * 0.08, -r * 0.95, r * 1.3, r * 0.36, -0.06, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(-r * 0.95, -r * 0.92); g.lineTo(r * 1.05, -r * 0.98); g.lineTo(r * 0.98, -r * 0.5); g.lineTo(-r * 0.92, -r * 0.48); g.closePath(); g.fill();
      g.fillStyle = colBand; g.beginPath(); g.moveTo(-r * 0.93, -r * 0.66); g.lineTo(r * 1.0, -r * 0.7); g.lineTo(r * 0.98, -r * 0.48); g.lineTo(-r * 0.92, -r * 0.46); g.closePath(); g.fill();
      g.fillStyle = colVisor; g.beginPath(); g.moveTo(r * 0.55, -r * 0.5); g.quadraticCurveTo(r * 1.45, -r * 0.5, r * 1.6, -r * 0.3); g.lineTo(r * 0.6, -r * 0.36); g.closePath(); g.fill();
    }
    g.restore();
  };
  if (o.rim) draw(o.rim, o.rim, o.rim, (o.rimDir?.[0] ?? 0) * r * 0.12, (o.rimDir?.[1] ?? -1) * r * 0.12);
  draw(c, band, dark);
  if (!o.noBadge) { const bx = o.front ? 0 : facing * r * 0.75, by = o.front ? -r * 0.55 : -r * 0.6; circle(g, hx + bx, hy + by, r * 0.1, S().ui.gold); glow(g, hx + bx, hy + by, r * 0.3, S().ui.gold, 0.35); }
}
// Petrov full figure with cap; returns head position
export function petrov(g, o) {
  drawFigure(g, { outfit: PETROV, ...o });
  const [hx, hy, r] = headPos(o);
  officerCap(g, hx, hy, r, o.facing ?? 1, { rim: o.rim?.color, rimDir: o.rim?.dir });
  return [hx, hy, r];
}
export function chairAt(g, x, GY, s, facing, color) { g.save(); g.translate(x, 0); g.scale(facing, 1); FX.chair(g, -18 * s, GY, s, color); g.restore(); }

// ---------- red phone (side view) ----------
export function redPhone(g, x, y, s = 1, lift = 0) {
  const red = S().ui.accent, dk = shade(red, -0.5);
  rr(g, x - 46 * s, y - 34 * s, 92 * s, 34 * s, 10 * s); g.fillStyle = shade(red, -0.25); g.fill();
  rr(g, x - 30 * s, y - 44 * s, 60 * s, 14 * s, 6 * s); g.fillStyle = dk; g.fill();
  circle(g, x, y - 18 * s, 10 * s, dk); for (let i = 0; i < 8; i++) { const a = i * 0.7; circle(g, x + Math.cos(a) * 7 * s, y - 18 * s + Math.sin(a) * 7 * s, 1.6 * s, shade(red, 0.3)); }
  const ly = y - 50 * s - lift * 120 * s, lx = x + lift * 30 * s;
  g.save(); g.translate(lx, ly); g.rotate(-lift * 0.5);
  seg(g, [[-48 * s, 0], [48 * s, 0]], 16 * s, red); circle(g, -50 * s, 6 * s, 14 * s, red); circle(g, 50 * s, 6 * s, 14 * s, red);
  seg(g, [[-40 * s, -5 * s], [40 * s, -5 * s]], 3 * s, alpha(shade(red, 0.5), 0.7));
  g.restore();
  g.strokeStyle = dk; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x + 46 * s, y - 14 * s); g.bezierCurveTo(x + 80 * s, y, x + 70 * s, ly + 30 * s, lx + 60 * s, ly + 8 * s); g.stroke();
}

// ---------- globe ----------
const LAND = {
  na: [[-166, 68], [-156, 71], [-140, 70], [-128, 70], [-115, 68], [-95, 72], [-85, 70], [-80, 63], [-90, 58], [-82, 53], [-78, 58], [-70, 60], [-62, 58], [-56, 52], [-66, 45], [-70, 42], [-76, 38], [-81, 31], [-80, 26], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-92, 18], [-87, 21], [-88, 15], [-83, 9], [-79, 9], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-114, 31], [-117, 33], [-122, 37], [-124, 42], [-124, 48], [-130, 54], [-136, 58], [-147, 61], [-153, 58], [-160, 56], [-158, 60], [-164, 63]],
  gl: [[-73, 78], [-60, 82], [-35, 83], [-20, 80], [-20, 72], [-30, 68], [-42, 60], [-50, 62], [-54, 67], [-58, 75]],
  sa: [[-80, 9], [-75, 11], [-62, 10], [-52, 5], [-50, 0], [-35, -6], [-39, -14], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-67, -50], [-70, -55], [-74, -50], [-74, -40], [-71, -30], [-71, -18], [-76, -14], [-81, -6], [-80, -1]],
  af: [[-17, 21], [-13, 28], [-9, 33], [-5, 36], [10, 37], [11, 33], [20, 31], [32, 31], [34, 27], [38, 18], [43, 12], [51, 12], [48, 5], [40, -3], [40, -11], [36, -20], [32, -28], [26, -34], [19, -35], [16, -29], [12, -17], [13, -8], [9, -1], [9, 4], [4, 6], [-4, 5], [-9, 5], [-13, 9], [-17, 14]],
  eu: [[-9, 43], [-9, 39], [-6, 36], [0, 39], [3, 43], [8, 44], [12, 44], [16, 40], [18, 40], [13, 45], [19, 42], [23, 38], [26, 40], [29, 41], [36, 36], [35, 32], [34, 28], [39, 22], [43, 15], [45, 13], [52, 16], [57, 19], [59, 23], [56, 26], [50, 29], [48, 30], [52, 28], [57, 25], [62, 25], [67, 24], [73, 21], [77, 8], [80, 13], [80, 16], [87, 22], [92, 22], [94, 17], [98, 16], [98, 8], [101, 3], [104, 1], [103, 9], [106, 9], [109, 12], [108, 21], [115, 23], [120, 27], [122, 31], [121, 37], [118, 38], [122, 40], [126, 38], [129, 35], [129, 42], [135, 44], [141, 52], [140, 58], [150, 59], [156, 58], [163, 62], [172, 61], [178, 65], [180, 69], [160, 70], [150, 71], [140, 72], [130, 71], [120, 73], [110, 76], [100, 78], [90, 76], [80, 73], [70, 73], [60, 70], [55, 68], [44, 68], [40, 66], [33, 69], [25, 71], [16, 69], [10, 63], [5, 61], [6, 58], [10, 59], [12, 56], [10, 54], [8, 54], [5, 52], [2, 51], [-1, 47], [-2, 47], [-1, 44]],
  uk: [[-5, 50], [1, 51], [2, 53], [-1, 55], [-2, 57], [-3, 58.6], [-5, 58.5], [-6, 56], [-5, 54], [-3, 54], [-5, 52]],
  ie: [[-10, 52], [-6, 52], [-6, 55], [-8, 55], [-10, 54]],
  is: [[-24, 65.5], [-22, 66.4], [-16, 66.5], [-13.5, 65.2], [-15, 64.3], [-18, 63.4], [-22, 63.8]],
  jp: [[130, 31], [132, 34], [136, 34], [140, 35], [141, 38], [142, 40], [141, 43], [145, 44], [142, 45.5], [140, 43], [139, 40], [137, 37], [133, 35.5], [130, 33.5]],
  au: [[114, -22], [114, -26], [115, -34], [118, -35], [124, -33], [131, -31], [135, -35], [138, -34], [140, -38], [147, -39], [150, -37], [153, -31], [153, -25], [146, -19], [145, -15], [142, -11], [141, -17], [136, -15], [137, -12], [132, -11], [130, -15], [126, -14], [122, -18]],
  ta: [[145, -41], [148, -41], [148, -43], [146, -43.5]],
  nz1: [[172.7, -34.5], [174.5, -36], [176, -37.5], [178.5, -37.7], [177, -39.5], [176, -41.5], [174.8, -41.3], [175, -39.5], [173.8, -39.2], [174.5, -37.5]],
  nz2: [[172.7, -40.5], [174.3, -41.5], [173, -43.5], [171.2, -44.5], [169, -46.6], [166.5, -46], [167.5, -44.5], [170.5, -42.8]],
  mg: [[44, -25], [47, -25], [50, -15], [49, -12], [44, -16]],
  bo: [[109, 2], [117, 7], [119, 1], [116, -4], [110, -3]],
  su: [[95, 5], [98, 4], [106, -6], [104, -5]],
  ng: [[131, -1], [141, -3], [150, -10], [141, -9], [138, -8]],
  cu: [[-85, 21.8], [-82, 23.1], [-77.5, 22.5], [-74.2, 20.2], [-77.2, 19.9], [-81, 21.6]],
  hi: [[-78, 20], [-72, 19.9], [-68.4, 18.6], [-71.5, 17.6], [-74.4, 18.3]],
  tw: [[120.1, 23], [121.5, 25.2], [121.9, 24.6], [120.8, 22]],
  sv: [[11, 78.5], [16, 80], [27, 80.2], [24, 77.4], [17, 76.6], [14, 77.6]],
  lk: [[79.8, 9.6], [81.8, 7.5], [81.3, 6.2], [80, 6.1]],
  an: Array.from({ length: 37 }, (_, i) => [-180 + i * 10, -72 - 3 * Math.sin(i * 0.5)]),
};
const LAND_KEYS = Object.keys(LAND);
const D2R = Math.PI / 180;
function densify(pts, step = 2) {
  const out = [];
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / step)); for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }
  return out;
}
const DENSE = Object.fromEntries(LAND_KEYS.map((k) => [k, densify(LAND[k], k === 'an' ? 4 : 1.5)]));
export function proj(lon, lat, lon0, lat0) {
  const l = lon * D2R, p = lat * D2R, l0 = lon0 * D2R, p0 = lat0 * D2R, cl = Math.cos(p), dl = l - l0;
  return [cl * Math.sin(dl), Math.cos(p0) * Math.sin(p) - Math.sin(p0) * cl * Math.cos(dl), Math.sin(p0) * Math.sin(p) + Math.cos(p0) * cl * Math.cos(dl)];
}
function landPath(g, cx, cy, R, key, lon0, lat0) {
  const pts = DENSE[key].map(([lo, la]) => proj(lo, la, lon0, lat0));
  if (pts.every((p) => p[2] < 0)) return false;
  g.beginPath();
  pts.forEach((p, i) => { let [x, y] = p; if (p[2] < 0) { const n = Math.hypot(x, y) || 1; x /= n; y /= n; } const X = cx + R * x, Y = cy - R * y; i ? g.lineTo(X, Y) : g.moveTo(X, Y); });
  g.closePath(); return true;
}
// a few hundred "city lights" (lon, lat) clusters
const CITIES = [[-74, 40.7], [-87.6, 41.8], [-118, 34], [-122.4, 37.8], [-95, 29.7], [-80, 25.8], [-79.4, 43.7], [-73.6, 45.5], [-99, 19.4], [-46.6, -23.5], [-43, -22.9], [-58.4, -34.6], [-70.6, -33.4], [-77, -12], [-74, 4.6], [-0.1, 51.5], [2.35, 48.85], [13.4, 52.5], [12.5, 41.9], [-3.7, 40.4], [4.9, 52.4], [16.4, 48.2], [21, 52.2], [30.5, 50.4], [37.6, 55.75], [30.3, 59.9], [28.9, 41], [31.2, 30], [3.4, 6.5], [36.8, -1.3], [28, -26.2], [18.4, -33.9], [55.3, 25.2], [51.4, 35.7], [72.9, 19], [77.2, 28.6], [88.4, 22.6], [80.3, 13], [100.5, 13.7], [106.8, -6.2], [103.8, 1.35], [121, 14.6], [114.2, 22.3], [121.5, 31.2], [116.4, 39.9], [126.9, 37.5], [139.7, 35.7], [135.5, 34.7], [151.2, -33.9], [145, -37.8], [153, -27.5], [115.9, -32], [174.8, -36.9], [174.8, -41.3], [-21.9, 64.1], [10.75, 59.9], [18.1, 59.3], [24.9, 60.2], [60.6, 56.8], [82.9, 55], [104.3, 52.3], [131.9, 43.1], [69.2, 41.3], [44.8, 41.7], [-6.3, 53.3], [-9.1, 38.7], [9.2, 45.5], [8.5, 47.4], [-112, 33.4], [-104.9, 39.7], [-122.3, 47.6], [-84.4, 33.7], [-77, 38.9], [-71, 42.4], [-90, 35]];
export const PLACES = { is: [-19, 65], au: [134, -25], nz: [173, -41] };
// globe(g, cx, cy, R, {lon0, lat0, night:0..1, lights:0..1, hl:{key:k}, land, ocean, t})
export function globe(g, cx, cy, R, o = {}) {
  const { lon0 = 0, lat0 = 20, night = 0.5, lights = 0, hl = {}, t = 0, lightDir = [-0.6, 0.45] } = o;
  const M = o.M, ui = S().ui;
  const ocean = o.ocean || shade(M.sky[1], -0.25), land = o.land || mix(M.grass, M.wall, 0.45);
  glow(g, cx, cy, R * 1.35, M.rim, 0.22);                                  // atmosphere
  g.fillStyle = radGrad(g, cx + lightDir[0] * R * 0.5, cy - lightDir[1] * R * 0.5, R * 0.1, R * 1.25, [shade(ocean, 0.25), ocean, shade(ocean, -0.55)]);
  circle(g, cx, cy, R, g.fillStyle);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  for (const k of LAND_KEYS) { if (landPath(g, cx, cy, R, k, lon0, lat0)) { g.fillStyle = land; g.fill(); g.strokeStyle = alpha(shade(land, 0.35), 0.6); g.lineWidth = Math.max(1, R * 0.004); g.stroke(); } }
  // highlights
  for (const [k, a] of Object.entries(hl)) { if (a <= 0) continue; const keys = k === 'nz' ? ['nz1', 'nz2'] : k === 'au' ? ['au', 'ta'] : [k];
    for (const kk of keys) if (landPath(g, cx, cy, R, kk, lon0, lat0)) { g.fillStyle = alpha(ui.gold, 0.85 * a); g.fill(); g.strokeStyle = alpha('#fff6dc', a); g.lineWidth = R * 0.008; g.stroke(); } }
  // day/night shading: dark crescent away from the light
  const lx = cx + lightDir[0] * R, ly = cy - lightDir[1] * R;
  g.fillStyle = radGrad(g, lx, ly, R * 0.3, R * 2.1, [alpha('#000', 0), alpha('#000', 0.15 * night), alpha(M.dark, 0.85 * night)]); g.fillRect(cx - R, cy - R, R * 2, R * 2);
  if (lights > 0) for (let i = 0; i < CITIES.length; i++) { const [lo, la] = CITIES[i]; const [x, y, z] = proj(lo, la, lon0, lat0); if (z < 0.08) continue;
    const X = cx + R * x, Y = cy - R * y, d = Math.hypot(X - lx, Y - ly) / (R * 2), tw = 0.75 + 0.25 * Math.sin(t * 2 + i);
    const a = lights * clamp(d * 1.6 - 0.3) * z * tw; if (a <= 0.02) continue; glow(g, X, Y, R * 0.05, M.practical, 0.55 * a); circle(g, X, Y, Math.max(1, R * 0.006), alpha('#fff1c8', a)); }
  // limb highlight
  g.restore();
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.arc(cx - lightDir[0] * R * 0.03, cy + lightDir[1] * R * 0.03, R * 0.985, 0, Math.PI * 2, true); g.fillStyle = alpha(M.rim, 0.75); g.fill('evenodd'); g.restore();
  return (lon, lat) => { const [x, y, z] = proj(lon, lat, lon0, lat0); return [cx + R * x, cy - R * y, z]; };
}

// ---------- polar early-warning map (phosphor outlines on a screen) ----------
// arcs: list of {p:0..1 progress}; drawn from launch points across the pole
const LAUNCH = [[-106, 47], [-101, 46], [-111, 48], [-104, 42], [-97, 48]];
const TARGET = [[37.6, 55.7], [39, 57], [36, 54], [41, 56], [35, 56.5]];
export function polarMap(g, x, y, w, h, t, o = {}) {
  const { arcs = [], col = '#7fe8c8', alarm = 0, zoom = 1, cxo = 0, cyo = 0 } = o;
  const red = S().ui.accent;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = linGrad(g, 0, y, 0, y + h, [mix('#06141a', red, alarm * 0.18), '#030a0e']); g.fillRect(x, y, w, h);
  g.strokeStyle = alpha(col, 0.08); g.lineWidth = 1; for (let gx = x; gx < x + w; gx += w / 16) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); } for (let gy = y; gy < y + h; gy += h / 9) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
  const cx = x + w / 2 + cxo, cy = y + h * 0.52 + cyo, R = Math.min(w, h) * 0.62 * zoom;
  for (const r of [0.33, 0.66, 1]) ring(g, cx, cy, R * r, 1, alpha(col, 0.12));
  for (const k of ['na', 'gl', 'eu', 'uk', 'is', 'jp', 'ie']) { if (landPath(g, cx, cy, R, k, -30, 90)) { g.fillStyle = alpha(col, 0.07); g.fill(); g.strokeStyle = alpha(col, 0.7); g.lineWidth = 2; g.stroke(); } }
  const P = (lo, la) => { const [px, py] = proj(lo, la, -30, 90); return [cx + R * px, cy - R * py]; };
  arcs.forEach((a, i) => {
    if (a.p <= 0) return; const L = LAUNCH[i % 5], T = TARGET[i % 5], N = 60, upto = Math.floor(N * clamp(a.p));
    const pts = []; for (let k = 0; k <= upto; k++) { const u = k / N, lo = lerp(L[0], T[0] + (T[0] < L[0] ? 360 : 0), u), la = lerp(L[1], T[1], u) + Math.sin(u * Math.PI) * 22; pts.push(P(lo > 180 ? lo - 360 : lo, Math.min(89, la))); }
    if (pts.length > 1) { g.setLineDash([10, 8]); seg(g, pts, 3, alpha(red, 0.9)); g.setLineDash([]); const hd = pts[pts.length - 1]; glow(g, hd[0], hd[1], 40, red, 0.9); circle(g, hd[0], hd[1], 6, '#ffe0d6'); }
    const st = P(L[0], L[1]); ring(g, st[0], st[1], 10 + 4 * Math.sin(t * 8 + i), 2, alpha(red, 0.9));
  });
  // scanlines
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let sy = y; sy < y + h; sy += 4) g.fillRect(x, sy, w, 1.5);
  g.restore();
}
// big flashing «СТАРТ» banner
export function startBanner(g, x, y, w, h, t, a = 1) {
  const red = S().ui.accent, on = (Math.floor(t * 2.6) % 2 === 0) ? 1 : 0.35;
  g.save(); g.globalAlpha *= a;
  rr(g, x, y, w, h, 10); g.fillStyle = mix('#200606', red, 0.75 * on); g.fill();
  g.strokeStyle = alpha('#ffd8cc', 0.8 * on); g.lineWidth = 4; g.stroke();
  text(g, 'СТАРТ', x + w / 2, y + h / 2 + 4, { size: h * 0.62, color: mix('#5a1a14', '#fff2ea', on), font: FONTS.ui, weight: 900, spacing: h * 0.08, glow: 30 * on, glowColor: alpha(red, 0.9) });
  glow(g, x + w / 2, y + h / 2, w * 0.8, red, 0.35 * on);
  g.restore();
}

// =====================================================================================================
// FULL-FILM ADDITIONS (ww3): cue timing, figures by id + hats, captions/sources, counters, maps, icons.
// =====================================================================================================

// ---------- cue timing: shots.json → "cues": {"name": "слово" | seconds}; fallback = fraction of the shot ----------
export function cue(info, name, fb = 0.3) {
  const c = info.cues?.[name] ?? info.shot?.cues?.[name];
  if (typeof c === 'number') return c;
  if (typeof c === 'string') { const v = wt(c, (info.shot?.start ?? 0) - 0.3); if (v != null) return v - (info.shot?.start ?? 0); }
  return fb * info.dur;
}
// several cues at once: cues(info, {a:0.2, b:0.6}) → {a: s, b: s}
export const cues = (info, fbs) => Object.fromEntries(Object.entries(fbs).map(([k, f]) => [k, cue(info, k, f)]));
// appear at a (fade-in fi), disappear before the cut (fo)
export const showAt = (t, a, dur, fi = 0.4, fo = 0.3) => ease.out(prog(t, a, a + fi)) * clamp((dur - t) / fo);
export const popAt = (t, a, d = 0.45) => ease.outBack(prog(t, a, a + d));
// camera presets: push / pull / drift / roll; every template moves the camera
export function camMove(t, dur, o = {}) {
  const k = ease.inOut(clamp(t / dur)), m = o.move || 'push', z0 = o.z ?? 1, a = o.amt ?? 1;
  const c = { z: z0, x: o.x ?? 0, y: o.y ?? 0, r: o.r ?? 0 };
  if (m === 'push') c.z = z0 * (1 + 0.07 * a * k);
  else if (m === 'pull') c.z = z0 * (1 + 0.07 * a * (1 - k));
  else if (m === 'driftL') { c.x += 50 * a * (k - 0.5); c.z = z0 * (1 + 0.02 * k); }
  else if (m === 'driftR') { c.x -= 50 * a * (k - 0.5); c.z = z0 * (1 + 0.02 * k); }
  else if (m === 'rise') { c.y += 40 * a * (k - 0.5); c.z = z0 * (1 + 0.03 * k); }
  else if (m === 'roll') { c.r += 0.02 * a * (k - 0.5); c.z = z0 * (1 + 0.04 * k); }
  return c;
}
export const fmtNum = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ---------- hats the rig can't draw ----------
export function pilotka(g, hx, hy, r, facing = 1, o = {}) {
  const c = o.color || COL.arkhipov, dk = shade(c, -0.4);
  const dr = (col, dx = 0, dy = 0) => { g.save(); g.translate(hx + dx, hy + dy);
    if (o.front) { poly(g, [[-r * 0.92, -r * 0.55], [r * 0.92, -r * 0.55], [r * 0.62, -r * 1.02], [-r * 0.62, -r * 1.02]], col); }
    else { g.scale(facing, 1); poly(g, [[-r * 0.98, -r * 0.48], [r * 0.95, -r * 0.62], [r * 0.7, -r * 1.0], [-r * 0.9, -r * 1.12]], col); }
    g.restore(); };
  if (o.rim) dr(o.rim, (o.rimDir?.[0] ?? 0) * r * 0.12, (o.rimDir?.[1] ?? -1) * r * 0.12);
  dr(c); g.save(); g.translate(hx, hy); if (!o.front) g.scale(facing, 1);
  seg(g, o.front ? [[-r * 0.6, -r * 0.62], [r * 0.6, -r * 0.62]] : [[-r * 0.9, -r * 0.6], [r * 0.85, -r * 0.7]], r * 0.06, dk);
  const bx = o.front ? 0 : r * 0.55, by = o.front ? -r * 0.78 : -r * 0.78; circle(g, bx, by, r * 0.09, S().ui.gold); g.restore();
}
export function flightHelmet(g, hx, hy, r, facing = 1, o = {}) {
  const c = o.color || '#8f96a6';
  if (o.rim) { g.fillStyle = o.rim; g.beginPath(); g.arc(hx + (o.rimDir?.[0] ?? 0) * r * 0.1, hy + (o.rimDir?.[1] ?? -1) * r * 0.1, r * 1.12, Math.PI * 0.95, Math.PI * 2.05); g.fill(); }
  g.fillStyle = c; g.beginPath(); g.arc(hx, hy - r * 0.05, r * 1.12, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); g.fill();
  g.fillStyle = shade(c, -0.55); g.save(); g.translate(hx, hy); g.scale(o.front ? 1 : facing, 1);
  if (o.front) rr(g, -r * 0.8, -r * 0.62, r * 1.6, r * 0.38, r * 0.15); else rr(g, r * 0.1, -r * 0.62, r * 1.0, r * 0.36, r * 0.14); g.fill();
  g.strokeStyle = alpha('#ffffff', 0.35); g.lineWidth = r * 0.06; g.beginPath(); g.arc(0, -r * 0.05, r * 0.95, Math.PI * 1.15, Math.PI * 1.45); g.stroke(); g.restore();
}
export function headset(g, hx, hy, r, facing = 1, o = {}) {
  const c = o.color || '#2b2e3c';
  g.strokeStyle = o.rim ? alpha(o.rim, 0.9) : c; g.lineWidth = r * 0.14; g.beginPath(); g.arc(hx, hy - r * 0.05, r * 1.06, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  const ex = hx - facing * r * 0.15; circle(g, ex, hy + r * 0.05, r * 0.32, o.rim ? shade(o.rim, -0.3) : c); circle(g, ex, hy + r * 0.05, r * 0.2, '#101219');
  seg(g, [[ex, hy + r * 0.2], [hx + facing * r * 0.55, hy + r * 0.7], [hx + facing * r * 0.85, hy + r * 0.58]], r * 0.07, o.rim ? alpha(o.rim, 0.8) : c);
}
export function lei(g, sx, sy, s = 1, o = {}) {
  const c = o.color || COL.lei; for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + i * 0.112); const x = sx + Math.cos(a) * 19 * s, y = sy + 4 * s + Math.sin(a) * 12 * s; circle(g, x, y, 6.2 * s, i % 2 ? c : shade(c, 0.25)); }
}
export function hat(g, name, hx, hy, r, facing = 1, o = {}) {
  switch (name) {
    case 'officerCap': return officerCap(g, hx, hy, r, facing, o);
    case 'whiteCap': return officerCap(g, hx, hy, r, facing, { ...o, color: '#e9e5dc', noBadge: false });
    case 'navalCap': return officerCap(g, hx, hy, r, facing, { ...o, color: '#dcd8cf' });
    case 'officerCapBlue': return officerCap(g, hx, hy, r, facing, { ...o, color: shade(COL.shoup, -0.15) });
    case 'pilotka': return pilotka(g, hx, hy, r, facing, o);
    case 'flightHelmet': return flightHelmet(g, hx, hy, r, facing, o);
    case 'headset': return headset(g, hx, hy, r, facing, o);
  }
}
// figure by cast id (cast.js WHO): draws figure + hat (+ lei). o = drawFigure options. Returns [hx, hy, r].
export function fig(g, who, o = {}) {
  const W = WHO[who] || WHO.crew, oo = { outfit: W.outfit, ...o };
  drawFigure(g, oo);
  const [hx, hy, r] = headPos(oo), f = oo.facing ?? 1;
  if (W.hat === 'lei') { const p = oo.pose || POSES.stand, s = (oo.s ?? 1) * (W.outfit.kid ? 0.72 : 1); lei(g, oo.x + f * s * p.sh[0], oo.y + s * p.sh[1], s); }
  else if (W.hat !== 'none') hat(g, W.hat, hx, hy, r, f, { rim: o.rim?.color, rimDir: o.rim?.dir });
  return [hx, hy, r];
}
// giant close-up by cast id (bigFace + hat). Characters with noFace (Shoup) are shown from behind: no face features.
export function bigHead(g, who, cx, cy, r, o = {}) {
  const W = WHO[who] || WHO.crew;
  if (W.noFace) {
    g.save(); g.translate(cx, cy); g.fillStyle = W.outfit.color || S().ink; g.beginPath(); g.ellipse(0, r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(0, 0, r * 1.06, 0, Math.PI * 2); g.arc((o.rimSide ?? -1) * r * 0.07, 0, r, 0, Math.PI * 2, true); g.fillStyle = o.rimColor || '#ffc68a'; g.fill('evenodd');
    circle(g, 0, 0, r, S().ink); g.restore();
  } else bigFace(g, cx, cy, r, { outfit: W.outfit, ...o });
  if (W.hat === 'lei') lei(g, cx, cy + r * 0.95, r / 26 * 1.6);
  else if (W.hat !== 'none') hat(g, W.hat, cx, cy, r, 1, { front: true });
}

// ---------- captions, sources, plates ----------
// source line (bottom-right, small): «SIPRI, январь 2026»
export function source(g, str, a = 1, o = {}) {
  if (a <= 0 || !str) return;
  text(g, str, o.x ?? E.W - V(70, 60), o.y ?? E.H - V(84, 250), { size: o.size ?? V(24, 30), color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 700, align: o.align ?? V('right', 'center'), spacing: 1.5, alpha: a });
}
// test caption plate «ИСПЫТАНИЕ, 1962, ТИХИЙ ОКЕАН» (mandatory over archive test footage)
export function plate(g, str, a = 1, o = {}) {
  if (a <= 0 || !str) return;
  const size = o.size ?? V(30, 36), x = o.x ?? V(80, 60), y = o.y ?? E.H - V(96, 260);
  g.save(); g.globalAlpha *= a; g.font = `900 ${size}px "${FONTS.ui}"`; if ('letterSpacing' in g) g.letterSpacing = '3px';
  const w = g.measureText(str).width + 52; g.restore();
  g.save(); g.globalAlpha *= a; rr(g, x, y - size * 0.95, w, size * 1.9, 8); g.fillStyle = 'rgba(6,8,16,.72)'; g.fill(); g.fillStyle = o.color || S().ui.gold; g.fillRect(x, y - size * 0.95, 6, size * 1.9); g.restore();
  text(g, str, x + 28, y, { size, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 3, alpha: a });
}
// big number (gold), optional unit + small label under it
export function bigNum(g, str, x, y, o = {}) {
  const { size = V(150, 130), color = S().ui.gold, a = 1, sub, subColor = S().ui.cream, s = 1 } = o; if (a <= 0) return;
  g.save(); g.translate(x, y); g.scale(s, s);
  text(g, str, 0, 0, { size, color, font: FONTS.ui, weight: 900, spacing: 2, glow: 30, glowColor: alpha(color, 0.55), alpha: a });
  if (sub) text(g, sub, 0, size * 0.72, { size: size * 0.24, color: subColor, font: FONTS.ui, weight: 800, spacing: 4, alpha: a });
  g.restore();
}
// timeline strip «1 ЧАС · СУТКИ · МЕСЯЦ · ГОД · 10 ЛЕТ» with active index (fractional = moving marker)
export const HOURS = ['1 ЧАС', 'СУТКИ', 'МЕСЯЦ', 'ГОД', '10 ЛЕТ'];
export function hoursStrip(g, t, active, o = {}) {
  const { y = E.H * V(0.16, 0.2), w = V(1400, 900), a = 1, labels = HOURS } = o, x0 = (E.W - w) / 2, n = labels.length, ui = S().ui;
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  seg(g, [[x0, y], [x0 + w, y]], 4, alpha(ui.cream, 0.25));
  const pk = clamp(active / (n - 1)); seg(g, [[x0, y], [x0 + w * pk, y]], 5, ui.gold);
  labels.forEach((l, i) => { const x = x0 + (w * i) / (n - 1), on = active >= i - 0.01, cur = Math.abs(active - i) < 0.5;
    circle(g, x, y, cur ? 16 : 10, on ? ui.gold : '#2a2e44'); if (cur) glow(g, x, y, 60, ui.gold, 0.4 + 0.1 * Math.sin(t * 4));
    text(g, l, x, y + V(52, 56), { size: cur ? V(36, 34) : V(28, 28), color: on ? ui.cream : alpha(ui.cream, 0.45), font: FONTS.ui, weight: 900, spacing: 3 }); });
  g.restore();
}

// ---------- flat world map (equirectangular) ----------
// worldMap(g, x, y, w, h, {lon0, lon1, lat0, lat1, land, ocean, cold:0..1 (north turns blue), coldLat, hl:{key:a}, grid}) → P(lon,lat)
export function worldMap(g, x, y, w, h, o = {}) {
  const { lon0 = -170, lon1 = 190, lat0 = 80, lat1 = -58, cold = 0, coldLat = 38, hl = {}, grid = true } = o, ui = S().ui;
  const M = o.M || { sky: ['#0b1430', '#13204a'], grass: '#2e5a52', wall: '#3a3f60', rim: '#b8c8ff' };
  const P = (lon, lat) => { let L = lon; if (L < lon0) L += 360; return [x + ((L - lon0) / (lon1 - lon0)) * w, y + ((lat0 - lat) / (lat0 - lat1)) * h]; };
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = o.ocean || linGrad(g, 0, y, 0, y + h, ['#0a1630', '#06102a']); g.fillRect(x, y, w, h);
  if (grid) { g.strokeStyle = alpha(ui.blueprint, 0.08); g.lineWidth = 1; for (let lo = -180; lo <= 180; lo += 30) { const [gx] = P(lo, 0); g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); } for (let la = -60; la <= 90; la += 30) { const [, gy] = P(0, la); g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); } }
  const land = o.land || mix(M.grass, M.wall, 0.5);
  for (const k of LAND_KEYS) { if (k === 'an' && lat1 > -60) continue;
    for (const sh of [0, 360, -360]) { g.beginPath(); DENSE[k].forEach(([lo, la], i) => { let L = lo + sh; const X = x + ((L - lon0) / (lon1 - lon0)) * w, Y = y + ((lat0 - la) / (lat0 - lat1)) * h; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath();
      const key = k === 'nz1' || k === 'nz2' ? 'nz' : k === 'ta' ? 'au' : k; const ha = hl[key] || 0;
      g.fillStyle = land; g.fill(); g.strokeStyle = alpha(shade(land, 0.4), 0.7); g.lineWidth = 1.5; g.stroke();
      if (ha > 0) { g.fillStyle = alpha(ui.gold, 0.85 * ha); g.fill(); g.strokeStyle = alpha('#fff6dc', ha); g.lineWidth = 2.5; g.stroke(); }
      if (cold > 0) { g.save(); g.clip(); const [, cy] = P(0, coldLat); g.fillStyle = linGrad(g, 0, y, 0, cy + 60, [alpha(COL.cold, 0.75 * cold), alpha(COL.cold, 0.5 * cold), alpha(COL.cold, 0)]); g.fillRect(x, y, w, cy + 60 - y); g.restore(); }
    } }
  g.restore();
  g.strokeStyle = alpha(M.rim || ui.blueprint, 0.35); g.lineWidth = 2; g.strokeRect(x, y, w, h);
  return P;
}
// map marker: pulsing dot + label
export function marker(g, x, y, t, o = {}) {
  const { a = 1, color = S().ui.accent, label: lb, r = 10, side = 1, size = V(28, 30) } = o; if (a <= 0) return;
  g.save(); g.globalAlpha *= a; glow(g, x, y, r * 5, color, 0.5); circle(g, x, y, r, color); ring(g, x, y, r * (1.6 + 0.6 * ((t * 1.2) % 1)), 2.5, alpha(color, 1 - ((t * 1.2) % 1)));
  if (lb) text(g, lb, x + side * (r + 14), y, { size, color: S().ui.cream, font: FONTS.ui, weight: 900, align: side > 0 ? 'left' : 'right', spacing: 2, glow: 10, glowColor: 'rgba(0,0,0,.8)' });
  g.restore();
}
// dashed arc between two points (shipping lanes, cables, trajectories drawn small)
export function arcLine(g, a, b, p = 1, o = {}) {
  const { lift = 0.25, color = S().ui.gold, w = 3, dash = [12, 9] } = o; if (p <= 0) return [a[0], a[1]];
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * lift, N = 40, pts = [];
  for (let i = 0; i <= N * clamp(p); i++) { const u = i / N; pts.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]]); }
  if (dash) g.setLineDash(dash); seg(g, pts, w, color); g.setLineDash([]); return pts[pts.length - 1];
}

// ---------- icons (line art, blueprint-ish). icon(g, name, x, y, s, color) ----------
export function icon(g, name, x, y, s = 1, color = '#e8f0ff', o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (pts, w = 5) => seg(g, pts, w, color);
  switch (name) {
    case 'switch': rr(g, -40, -26, 80, 52, 10); g.stroke(); L([[0, 0], [24, -40]], 8); circle(g, 24, -42, 9, color); circle(g, 0, 0, 7, color); break;
    case 'sub': g.beginPath(); g.ellipse(0, 0, 70, 18, 0, 0, Math.PI * 2); g.stroke(); rr(g, -12, -40, 30, 22, 6); g.stroke(); L([[4, -40], [4, -58]]); L([[-70, 0], [-86, -12]]); L([[-70, 0], [-86, 12]]); break;
    case 'screen': rr(g, -54, -38, 108, 70, 8); g.stroke(); L([[-20, 44], [20, 44]]); for (let i = 0; i < 3; i++) L([[-34, -16 + i * 16], [-34 + 30 + i * 14, -16 + i * 16]], 4); break;
    case 'chip': rr(g, -34, -34, 68, 68, 6); g.stroke(); for (let i = -2; i <= 2; i++) { L([[i * 13, -34], [i * 13, -48]], 4); L([[i * 13, 34], [i * 13, 48]], 4); L([[-34, i * 13], [-48, i * 13]], 4); L([[34, i * 13], [48, i * 13]], 4); } break;
    case 'cap': g.beginPath(); g.ellipse(0, -14, 50, 15, 0, 0, Math.PI * 2); g.stroke(); rr(g, -34, -12, 68, 22, 5); g.stroke(); g.beginPath(); g.ellipse(4, 14, 36, 8, 0, 0, Math.PI); g.stroke(); circle(g, 0, -2, 5, color); break;
    case 'pins': for (const [px, py] of [[-34, 10], [0, -16], [32, 14]]) { L([[px, py + 30], [px, py - 14]], 4); poly(g, [[px, py - 14], [px + 26, py - 6], [px, py + 2]], color); } L([[-60, 40], [60, 40]], 4); break;
    case 'rocket': L([[-30, 40], [0, -40]], 5); poly(g, [[0, -52], [8, -36], [-8, -36]], color); for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha *= 0.6; L([[-58 + i * 30, -50 + i * 6], [-30 + i * 30, -60 + i * 4]], 4); g.restore(); } break;
    case 'satellite': rr(g, -14, -14, 28, 28, 4); g.stroke(); rr(g, -62, -9, 40, 18, 2); g.stroke(); rr(g, 22, -9, 40, 18, 2); g.stroke(); L([[-22, 0], [-14, 0]]); L([[14, 0], [22, 0]]); L([[0, 14], [0, 26]]); break;
    case 'radar': g.beginPath(); g.arc(0, 10, 40, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); L([[0, 10], [0, 50]]); L([[-26, 50], [26, 50]]); L([[0, 10], [18, -18]], 4); break;
    case 'check': L([[-26, 0], [-6, 22], [30, -24]], 9); break;
    case 'cross': L([[-24, -24], [24, 24]], 8); L([[24, -24], [-24, 24]], 8); break;
    case 'lock': rr(g, -26, -6, 52, 42, 7); g.fill(); g.beginPath(); g.arc(0, -6, 17, Math.PI, 0); g.stroke(); break;
    case 'nav': g.beginPath(); g.arc(0, -10, 24, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(0, 34); g.closePath(); g.stroke(); circle(g, 0, -10, 8, color); break;
    case 'cloud': g.beginPath(); g.arc(-20, 6, 20, Math.PI * 0.5, Math.PI * 1.5); g.arc(4, -10, 26, Math.PI, Math.PI * 2); g.arc(30, 6, 18, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); g.stroke(); break;
    case 'clock': ring(g, 0, 0, 34, 5, color); L([[0, 0], [0, -22]]); L([[0, 0], [16, 8]]); break;
    case 'bank': poly(g, [[-50, -20], [0, -50], [50, -20]], color); for (let i = -2; i <= 2; i++) L([[i * 20, -14], [i * 20, 30]], 6); L([[-54, 38], [54, 38]], 6); break;
    case 'phone': rr(g, -24, -44, 48, 88, 10); g.stroke(); L([[-8, 34], [8, 34]], 4); break;
    case 'wheat': L([[0, 50], [0, -40]], 4); for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(-9, -30 + i * 16, 6, 11, -0.6, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(9, -30 + i * 16, 6, 11, 0.6, 0, Math.PI * 2); g.fill(); } break;
    case 'person': circle(g, 0, -34, 14, color); L([[0, -18], [0, 18]], 8); L([[0, 18], [-14, 50]], 7); L([[0, 18], [14, 50]], 7); L([[0, -8], [-18, 14]], 6); L([[0, -8], [18, 14]], 6); break;
    case 'bulb': g.beginPath(); g.arc(0, -10, 28, Math.PI * 0.75, Math.PI * 2.25); g.lineTo(10, 26); g.lineTo(-10, 26); g.closePath(); g.stroke(); L([[-10, 36], [10, 36]], 5); break;
    case 'tv': rr(g, -50, -34, 100, 68, 8); g.stroke(); L([[-20, -50], [0, -36], [20, -50]], 4); break;
    case 'fish': g.beginPath(); g.ellipse(0, 0, 36, 16, 0, 0, Math.PI * 2); g.stroke(); poly(g, [[30, 0], [52, -16], [52, 16]], color); circle(g, -20, -4, 4, color); break;
    case 'steam': for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 20, 40); g.bezierCurveTo(i * 20 - 14, 14, i * 20 + 14, -6, i * 20, -36); g.stroke(); } break;
  }
  g.restore();
}
// the seven "close calls" icons, in film order (1 switch … 7 rocket)
export const SEVEN = ['switch', 'sub', 'screen', 'chip', 'cap', 'pins', 'rocket'];
export const SEVEN_LABEL = ['ГОЛДСБОРО, 1961', 'Б-59, 1962', 'ТРЕВОГА, 1979', 'МИКРОСХЕМА, 1980', 'ПЕТРОВ, 1983', '«ЭЙБЛ АРЧЕР», 1983', 'РАКЕТА, 1995'];

// little "pine/palm" and generic helpers for sets
export function palm(g, x, y, s = 1, color = '#0e0f16', t = 0, seed = 1) {
  const sw = Math.sin(t * 0.8 + seed) * 6 * s, tx = x + 30 * s + sw, ty = y - 300 * s;
  g.strokeStyle = color; g.lineWidth = 14 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10 * s, y - 160 * s, tx, ty); g.stroke();
  for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * (Math.PI * 0.95 / 6) + Math.sin(t + i) * 0.04; g.lineWidth = 9 * s; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * 90 * s, ty + Math.sin(a) * 60 * s - 20 * s, tx + Math.cos(a) * 160 * s, ty + Math.sin(a) * 40 * s + 50 * s); g.stroke(); }
}
export function oleander(g, x, y, s = 1, a = 1, seed = 3) {
  if (a <= 0) return; const r = rng(seed); g.save(); g.globalAlpha *= a;
  for (let i = 0; i < 5; i++) { const ang = (i / 5) * Math.PI * 2 + r(); g.fillStyle = i % 2 ? COL.oleander : shade(COL.oleander, 0.15); g.beginPath(); g.ellipse(x + Math.cos(ang) * 9 * s, y + Math.sin(ang) * 9 * s, 10 * s, 6 * s, ang, 0, Math.PI * 2); g.fill(); }
  circle(g, x, y, 4 * s, '#ffe3a8'); g.restore();
}
