// stage.js — универсальная мультяшная сцена из описания в story/build.py:
//   set (фон), cast (герои с действиями по словам), props (предметы), tags (бирки), year, cam (камера), dim.
// Время любого события — число (сек от начала шота) или слово из озвучки (первое совпадение после начала шота).
import { E, ease, prog, clamp, lerp, noise, shade, alpha, rng } from '/engine/core.js';
import { tpl } from './_registry.js';
import * as T from '../toon.js';
import { person, camel, tag, yearTag, bubble, withCam, K, inn, pop, k01, hand, box, ell, poly, line, limb, coin, sack, chest, barPile, goldBar, light, finish, C, OL, SKIN } from '../toon.js';
import * as CA from '../cast.js';
import { SETS } from './sets.js';

const cache = new Map();
function tm(info, v, fb = 0) {
  if (v == null) return fb; if (typeof v === 'number') return v < 0 ? info.dur + v : v;
  const key = info.shot.id + '|' + v; if (cache.has(key)) return cache.get(key);
  let word = v, after = -0.4; const m = /^(.*)@(-?[\d.]+)$/.exec(v); if (m) { word = m[1]; after = +m[2]; }   // «слово@3» — искать после 3 с
  const r = T.wt(word, info.shot.start + after); const val = r != null && r < info.shot.end + 0.5 ? r - info.shot.start : fb * 1; cache.set(key, val); return val;
}
function castOf(c) { if (!c) return {}; if (typeof c === 'object') return c; const m = /^(\w+)\((.*)\)$/.exec(c); if (m) return CA[m[1]](...m[2].split(',').map((v) => (/^-?[\d.]+$/.test(v) ? +v : v))); return CA[c] || {}; }

// ------------------------------------------------------------------ ПРЕДМЕТЫ
export const PROPS = {
  coin: (g, p, t) => coin(g, 0, 0, p.r || 40, p.col || C.gold, { sym: p.sym }),
  coins: (g, p, t, k) => { const n = Math.round((p.n || 8) * (p.grow ? k : 1)); for (let i = 0; i < n; i++) coin(g, (i % 5 - 2) * 46 + (Math.floor(i / 5) % 2) * 20, -Math.floor(i / 5) * 26, p.r || 28, p.col || C.gold); },
  bars: (g, p, t, k) => barPile(g, 0, 0, Math.max(1, Math.round((p.n || 9) * (p.grow ? k : 1))), p.w || 90, p.col || C.gold),
  sack: (g, p) => sack(g, 0, 0, p.s2 || 1, p.col || '#c99a4a', p.label),
  chest: (g, p, t, k) => chest(g, 0, 0, 1, p.open ?? 1, p.glow ?? 0.6),
  stack: (g, p, t, k) => { const h = Math.max(1, Math.round(lerp(p.from ?? 1, p.n || 12, p.grow ? k : 1))); T.banknoteStack(g, 0, 0, h, p.w || 160, p.col || '#9ad07a'); if (p.label) hand(g, p.label, 0, 50, { size: p.ls || 48, color: p.lc || OL }); },
  tower: (g, p, t, k) => { const h = Math.max(1, Math.round(lerp(p.from ?? 1, p.n || 10, p.grow ? k : 1))); for (let i = 0; i < h; i++) for (let j = -1; j <= 1; j++) goldBar(g, j * 74 + (i % 2) * 37 - 18, -i * 34, 90, p.col || C.gold); if (p.label) hand(g, p.label, 0, 50, { size: p.ls || 48 }); },
  bar: (g, p, t, k) => { const H = (p.h || 400) * (p.grow ? ease.out(k) : 1), w = p.w || 160; box(g, -w / 2, -H, w, H, p.col || C.gold, { r: 6 }); if (p.label) hand(g, p.label, 0, 48, { size: p.ls || 46 }); if (p.val && k > 0.6) hand(g, p.val, 0, -H - 40, { size: p.vs || 54, color: p.vc || OL }); },
  tag: (g, p, t, k) => tag(g, p.text, 0, 0, 1, { size: p.size || 52, bg: p.bg, rot: p.rot, noPop: true }),
  text: (g, p) => hand(g, p.text, 0, 0, { size: p.size || 60, color: p.color || OL }),
  arrow: (g, p, t, k) => T.arrow(g, 0, 0, p.len || 200, p.dir ?? 1, p.col || (p.dir === -1 ? C.red : C.green), 1),
  flame: (g, p, t) => T.flame(g, 0, 0, p.s2 || 1, t, p.seed || 0),
  smoke: (g, p, t) => T.smoke(g, 0, 0, t, p.n || 6, p.s2 || 1),
  scroll: (g, p, t, k) => T.scroll(g, 0, 0, p.w || 360, p.h || 420, 1, (g) => { (p.lines || []).forEach((s, i) => hand(g, s, 0, -p.h / 2 + 70 + i * 56, { size: p.size || 44, color: p.color || '#4a2a12' })); }),
  paper: (g, p) => { const w = p.w || 320, h = p.h || 400; box(g, -w / 2, -h / 2, w, h, '#fbf6ea', { r: 4, sh: 0.05 }); (p.lines || []).forEach((s, i) => hand(g, s, 0, -h / 2 + 60 + i * (p.lh || 54), { size: p.size || 42, color: (p.colors || [])[i] || OL })); if (p.sign) { line(g, [[-w / 2 + 40, h / 2 - 60], [-w / 2 + 120, h / 2 - 90], [-w / 2 + 160, h / 2 - 50], [-w / 2 + 220, h / 2 - 80]], 4, '#2a3a8a'); } },
  board: (g, p) => { const w = p.w || 900, h = p.h || 520; box(g, -w / 2, -h / 2, w, h, p.bg || '#2f4a3a', { r: 6 }); box(g, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, null, { r: 8, lw: 14, grad: false }); (p.lines || []).forEach((s, i) => hand(g, s, p.align === 'left' ? -w / 2 + 50 : 0, -h / 2 + 90 + i * (p.lh || 80), { size: p.size || 64, color: (p.colors || [])[i] || '#f4f1ea', align: p.align || 'center' })); },
  calendar: (g, p) => { box(g, -110, -130, 220, 260, '#fbf6ea', { r: 8 }); box(g, -110, -130, 220, 70, C.red, { r: 8 }); hand(g, p.top || '', 0, -95, { size: 40, color: '#fff' }); hand(g, p.day || '', 0, 20, { size: 110 }); },
  portrait: (g, p, t) => { const w = p.w || 260, h = p.h || 320; T.frame(g, -w / 2, -h / 2, w, h, (g) => { g.fillStyle = p.bg || '#e8d8b0'; g.fillRect(-w, -h, w * 2, h * 2); g.save(); g.translate(0, h / 2 + 140 * (p.ps || 0.8)); g.scale(p.ps || 0.8, p.ps || 0.8); person(g, { ...castOf(p.c), x: 0, y: 0, s: 1, t, expr: p.expr || 'neutral', pose: 'idle' }); g.restore(); }, p.fc || '#b8873a'); if (p.name) tag(g, p.name, 0, h / 2 + 40, 1, { size: 44, noPop: true }); },
  pie: (g, p, t, k) => { const r = p.r || 230, sh = (p.share || 0.1) * (p.grow ? ease.out(k) : 1); ell(g, 0, 0, r, r, p.col || '#e8b06a', 6); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; line(g, [[0, 0], [Math.cos(a) * r, Math.sin(a) * r]], 3, 'rgba(0,0,0,.25)'); }
    if (sh > 0) { const out = p.out ?? 40; g.save(); const am = -Math.PI / 2 + sh * Math.PI; g.translate(Math.cos(am) * out, Math.sin(am) * out); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + sh * Math.PI * 2); g.closePath(); T.fo(g, p.slice || C.gold, 6); g.restore(); } if (p.label) hand(g, p.label, 0, r + 60, { size: p.ls || 54 }); },
  globe: (g, p, t) => { const r = p.r || 220; ell(g, 0, 0, r, r, '#4f9fd9', 6); g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip(); const o = (t * 20) % 400; [[-120, -60, 90, 70], [60, 40, 120, 90], [140, -110, 70, 50], [-60, 120, 60, 40]].forEach(([x, y, a, b]) => ell(g, ((x + o + 400) % 800) - 400, y, a, b, '#6ab84a', 4)); g.restore(); ell(g, 0, 0, r, r, null, 6); },
  book: (g, p) => { box(g, -130, -170, 260, 340, p.col || '#7a2a2a', { r: 8 }); line(g, [[-110, -170], [-110, 170]], 6); if (p.title) (Array.isArray(p.title) ? p.title : [p.title]).forEach((s, i) => hand(g, s, 10, -40 + i * 54, { size: p.size || 46, color: '#f2c037' })); },
  newspaper: (g, p) => { g.rotate(p.rot ?? -0.05); box(g, -300, -380, 600, 760, '#f2ecdc', { r: 2, sh: 0.05 }); hand(g, p.name || 'ГАЗЕТА', 0, -310, { size: 74 }); line(g, [[-270, -270], [270, -270]], 4); (p.lines || []).forEach((s, i) => hand(g, s, 0, -200 + i * 66, { size: p.size || 56, color: i === 0 ? '#a8322a' : OL })); for (let i = 0; i < 6; i++) { g.fillStyle = '#c9c2b0'; g.fillRect(-260, 120 + i * 30, 520 - (i % 3) * 60, 12); } if (p.pic) { box(g, 60, -60, 200, 150, '#d8d0bc', { r: 2, lw: 3 }); } },
  ledger: (g, p, t, k) => { box(g, -300, -220, 600, 440, '#f6efe0', { r: 6 }); line(g, [[0, -220], [0, 220]], 4); (p.lines || []).forEach((s, i) => { if (k * (p.lines.length + 1) > i) hand(g, s, -270 + (i % 2 ? 300 : 0), -170 + Math.floor(i / 2) * 60, { size: 40, align: 'left', color: '#2a3a8a' }); }); },
  octopus: (g, p, t) => { const c = p.col || '#3a6a8a'; for (let i = 0; i < 8; i++) { const a = Math.PI * (0.05 + i * 0.13), L = 380; const pts = []; for (let j = 0; j <= 10; j++) { const d = j / 10 * L; pts.push([Math.cos(a) * d * 1.3 + Math.sin(t * 2 + i + j * 0.5) * 18, Math.sin(a) * d * 0.7 + 40]); } limb(g, pts, 26 - i % 2 * 4, c); } ell(g, 0, -60, 170, 150, c); ell(g, -50, -70, 22, 26, '#fff', 4); ell(g, 50, -70, 22, 26, '#fff', 4); ell(g, -45, -64, 9, 11, OL, 0); ell(g, 55, -64, 9, 11, OL, 0); line(g, [[-80, -110], [-20, -96]], 6); line(g, [[20, -96], [80, -110]], 6); if (p.label) hand(g, p.label, 0, -10, { size: 50, color: '#fff' }); },
  rocket: (g, p, t) => { poly(g, [[0, -260], [60, -130], [60, 120], [-60, 120], [-60, -130]], '#f6efe0'); ell(g, 0, -80, 26, 26, '#4f9fd9', 5); poly(g, [[-60, 40], [-110, 140], [-60, 120]], C.red); poly(g, [[60, 40], [110, 140], [60, 120]], C.red); if (p.fire) T.flame(g, 0, 130, -0.8, t, 7); },
  ticker: (g, p, t, k) => { const w = p.w || 700, h = p.h || 400; box(g, -w / 2, -h / 2, w, h, '#14161c', { r: 10 }); const pts = (p.pts || [0.2, 0.4, 0.3, 0.6, 0.5, 0.8]).map((v, i, a) => [-w / 2 + 40 + i * (w - 80) / (a.length - 1), h / 2 - 40 - v * (h - 80)]); const n = Math.max(2, Math.ceil(pts.length * clamp(k))); line(g, pts.slice(0, n), 8, p.col || '#5fd35a'); const last = pts[n - 1]; ell(g, last[0], last[1], 12, 12, p.col || '#5fd35a', 4); if (p.label) hand(g, p.label, 0, -h / 2 + 44, { size: 44, color: '#f4f1ea' }); },
  podium: (g, p) => { const w = p.w || 300, h = p.h || 160; box(g, -w / 2, -h, w, h, p.col || '#c9a14a', { r: 6 }); hand(g, String(p.place ?? ''), 0, -h / 2 + 6, { size: p.size || 110, color: '#fff' }); },
  boat: (g, p, t) => { const b = Math.sin(t * 2) * 6; g.translate(0, b); poly(g, [[-200, 0], [200, 0], [150, 70], [-150, 70]], p.col || '#8a5a32'); line(g, [[0, 0], [0, -340]], 8); poly(g, [[6, -330], [6, -20], [170, -40]], '#f6efe0', 5); if (p.steam) { box(g, -100, -150, 200, 150, '#f6efe0', { r: 6 }); box(g, -20, -260, 40, 110, C.red, { r: 4 }); T.smoke(g, 0, -270, t, 5, 0.8); } },
  waves: (g, p, t) => { for (let r = 0; r < 4; r++) { g.beginPath(); for (let x = -1200; x <= 1200; x += 30) g.lineTo(x, r * 40 + Math.sin(x * 0.01 + t * 2 + r) * 10); g.lineTo(1200, 500); g.lineTo(-1200, 500); g.closePath(); T.fo(g, shade(p.col || '#3f8fbf', -r * 0.06), 4); } },
  train: (g, p, t) => { box(g, -260, -200, 300, 200, p.col || '#2a3a4a', { r: 10 }); box(g, 40, -150, 220, 150, '#3a4a5a', { r: 6 }); box(g, -230, -280, 50, 80, '#2a2a2a', { r: 4 }); T.smoke(g, -205, -300, t, 6, 0.9); [-200, -80, 60, 200].forEach((x) => { ell(g, x, 0, 46, 46, '#a8322a', 5); ell(g, x, 0, 12, 12, OL, 0); }); },
  cake: (g, p, t, k) => { box(g, -260, -160, 520, 160, '#f2d8b0', { r: 20 }); box(g, -260, -170, 520, 40, '#f6efe0', { r: 20 }); const sh = (p.share || 0.1); if (k > 0) { const w = 520 * sh; g.save(); g.translate(260 - w + 40 * ease.out(k), -40 * ease.out(k)); box(g, 0, -160, w, 160, C.gold, { r: 8 }); g.restore(); } if (p.label) hand(g, p.label, 0, 70, { size: 52 }); },
  domesday: (g, p) => { box(g, -340, -240, 680, 480, '#efe0b8', { r: 8, sh: 0.06 }); line(g, [[0, -240], [0, 240]], 6, '#8a6a3a'); (p.lines || []).forEach((s, i) => hand(g, s, i % 2 ? 170 : -170, -170 + Math.floor(i / 2) * 64, { size: 42, color: s.includes('пустошь') ? '#a8322a' : '#4a2a12' })); },
  monastery: (g, p) => { box(g, -300, -260, 600, 260, '#c9b48a', { r: 2 }); poly(g, [[-330, -260], [330, -260], [0, -380]], '#8a5a3a'); box(g, -60, -420, 120, 160, '#c9b48a', { r: 2 }); poly(g, [[-80, -420], [80, -420], [0, -520]], '#8a5a3a'); line(g, [[0, -520], [0, -580]], 6); line(g, [[-24, -556], [24, -556]], 6); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-240 + i * 150, -40); g.lineTo(-240 + i * 150, -160); g.arc(-210 + i * 150, -160, 30, Math.PI, 0); g.lineTo(-180 + i * 150, -40); g.closePath(); T.fo(g, '#3a2a2a'); } },
  diamond: (g, p, t) => { const r = p.r || 90; poly(g, [[-r, -r * 0.3], [-r * 0.5, -r * 0.8], [r * 0.5, -r * 0.8], [r, -r * 0.3], [0, r]], '#d8f0ff', 5); line(g, [[-r, -r * 0.3], [r, -r * 0.3]], 3); line(g, [[-r * 0.5, -r * 0.8], [-r * 0.2, -r * 0.3], [0, r]], 3); line(g, [[r * 0.5, -r * 0.8], [r * 0.2, -r * 0.3], [0, r]], 3); light(g, 0, -r * 0.3, r * 3, '#ffffff', 0.5 + Math.sin(t * 4) * 0.2); },
  cig: (g, p, t) => { box(g, -60, -8, 120, 16, '#f6efe0', { r: 4, lw: 3 }); box(g, 40, -8, 20, 16, '#d9a058', { r: 2, lw: 3 }); T.smoke(g, -60, -10, t, 4, 0.3); },
  shoe: (g, p) => { g.beginPath(); g.moveTo(-120, 0); g.lineTo(-120, -80); g.quadraticCurveTo(-80, -100, -40, -70); g.quadraticCurveTo(60, -60, 130, -10); g.lineTo(130, 0); g.closePath(); T.fo(g, p.col || '#6a3a2a'); },
  quill: (g, p) => { line(g, [[0, 0], [90, -160]], 5); g.beginPath(); g.moveTo(90, -160); g.quadraticCurveTo(150, -200, 110, -100); g.quadraticCurveTo(80, -100, 60, -80); g.closePath(); T.fo(g, '#f6efe0', 4); },
  question: (g, p, t) => hand(g, '?', 0, Math.sin(t * 3) * 8, { size: p.size || 220, color: p.color || C.red }),
  star: (g, p, t) => { const r = p.r || 70; const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } g.rotate(Math.sin(t * 2) * 0.1); poly(g, pts, p.col || C.gold, 5); },
  table: (g, p) => { const w = p.w || 700; box(g, -w / 2, -30, w, 34, p.col || '#8a5a32', { r: 4 }); box(g, -w / 2 + 30, 4, 26, p.h || 160, shade(p.col || '#8a5a32', -0.2), { r: 4 }); box(g, w / 2 - 56, 4, 26, p.h || 160, shade(p.col || '#8a5a32', -0.2), { r: 4 }); },
  desk: (g, p) => { const w = p.w || 700; box(g, -w / 2, -30, w, 40, p.col || '#7a4a2a', { r: 4 }); box(g, -w / 2 + 20, 10, w - 40, p.h || 200, shade(p.col || '#7a4a2a', 0.08), { r: 4 }); line(g, [[0, 10], [0, 10 + (p.h || 200)]], 4); },
  mic: (g, p) => { limb(g, [[0, 0], [0, -120], [60, -160]], 8, '#3a3a3a'); ell(g, 70, -170, 30, 40, '#5a5a5a', 5, -0.6); },
  laptop: (g, p) => { poly(g, [[-160, 0], [160, 0], [190, 30], [-190, 30]], '#9aa0aa'); box(g, -150, -210, 300, 200, '#2a2a33', { r: 8 }); g.fillStyle = p.screen || '#e8f0ff'; g.fillRect(-134, -194, 268, 168); (p.lines || []).forEach((s, i) => hand(g, s, 0, -150 + i * 44, { size: 38, color: (p.colors || [])[i] || OL })); },
  sign: (g, p) => { limb(g, [[0, 0], [0, -(p.h || 300)]], 14, '#6a4a2a'); box(g, -(p.w || 360) / 2, -(p.h || 300) - 110, p.w || 360, 120, p.bg || '#f6efe0', { r: 6 }); hand(g, p.text || '', 0, -(p.h || 300) - 48, { size: p.size || 56, color: p.color || OL }); },
  dime: (g, p) => coin(g, 0, 0, p.r || 30, '#cfd5e0', { sym: '10' }),
  fence: (g, p) => { for (let i = -10; i <= 10; i++) { box(g, i * 60 - 8, -200, 16, 200, '#6a6a6a', { r: 2, lw: 3 }); poly(g, [[i * 60 - 12, -200], [i * 60 + 12, -200], [i * 60, -226]], '#6a6a6a', 3); } line(g, [[-620, -160], [620, -160]], 8, '#5a5a5a'); line(g, [[-620, -60], [620, -60]], 8, '#5a5a5a'); },
  crown: (g, p) => { g.scale(p.s2 || 1.4, p.s2 || 1.4); g.translate(0, 80); T.hat(g, 'crown', null, 0); },
  cushion: (g, p) => { box(g, -110, -30, 220, 40, '#a8322a', { r: 16 }); g.translate(0, 40); g.scale(1.1, 1.1); T.hat(g, 'crown', null, 0); },
  scaleBig: (g, p, t, k) => T.scale2(g, 0, 0, p.s2 || 1.3, lerp(p.t0 ?? 0, p.t1 ?? 0.2, ease.inOut(k)), (g) => (PROPS[p.l?.k] || (() => {}))(g, p.l || {}, t, 1), (g) => (PROPS[p.r?.k] || (() => {}))(g, p.r || {}, t, 1)),
  map: (g, p, t, k) => { T.parchment(g, 0, 0, p.w || 1200, p.h || 700); (p.lands || []).forEach((pts) => T.poly(g, pts, '#e6cf98', 4)); (p.areas || []).forEach(([pts, col]) => { g.save(); g.globalAlpha = 0.55 * clamp(k * 1.5); T.poly(g, pts, col, 4); g.restore(); }); if (p.route) T.dashed(g, p.route, k, C.red, 8); (p.pins || []).forEach(([x, y, s]) => { ell(g, x, y, 14, 14, C.red, 4); hand(g, s, x, y - 44, { size: 46 }); }); (p.labels || []).forEach(([x, y, s, sz]) => hand(g, s, x, y, { size: sz || 60, color: 'rgba(110,70,30,.7)' })); },
  ruler: (g, p, t, k) => { const w = (p.w || 900) * ease.out(k); box(g, -450, -50, w, 100, '#f2d07a', { r: 6 }); for (let i = 0; i * 30 < w - 10; i++) line(g, [[-450 + i * 30, -50], [-450 + i * 30, -50 + (i % 5 ? 26 : 46)]], 3); if (p.label && k > 0.6) hand(g, p.label, 0, 100, { size: 56 }); },
  clock: (g, p, t) => T.clock(g, 0, 0, p.r || 90, t, p.speed ?? 0.1),
  candle: (g, p, t) => T.candle(g, 0, 0, t),
  plant: (g, p) => T.plant(g, 0, 0, p.s2 || 1),
  palm: (g, p, t) => T.palm(g, 0, 0, p.s2 || 1, t),
  camel: (g, p, t) => camel(g, 0, 0, p.s2 || 1, t * 4, {}),
  bigNum: (g, p, t) => { hand(g, p.text, 6, 8, { size: p.size || 160, color: 'rgba(0,0,0,.35)' }); hand(g, p.text, 0, 0, { size: p.size || 160, color: p.color || C.gold }); },
};

// ------------------------------------------------------------------ шаблон
tpl('stage', 'Generic cartoon scene (set, cast, props, tags, cam) described by data.', {
  draw(g, t, info) {
    const P = info, setF = SETS[P.set] || SETS.plain;
    const raw = P.cam || [[0, 960, 540, 1]];
    const camKeys = raw.map((c) => K(c[0] === 'end' ? info.dur : tm(info, c[0], 0), c[1], c[2], c[3] ?? 1));
    if (raw.length < 2) camKeys.push(K(info.dur, camKeys[0].x, camKeys[0].y, camKeys[0].z * (P.push ?? 1.07)));
    withCam(g, t, camKeys, (g) => {
      setF(g, t, P.setOpts || {}, info);
      const items = [];
      (P.props || []).forEach((p, i) => items.push({ z: p.z ?? (p.y ?? 0) - 2000 * (p.back ? 1 : 0), draw: () => drawProp(g, p, t, info) }));
      (P.cast || []).forEach((a, i) => items.push({ z: a.z ?? (a.y ?? setF.gy ?? 930), draw: () => drawActor(g, a, t, info, i) }));
      items.sort((a, b) => a.z - b.z).forEach((it) => it.draw());
      (P.fx || []).forEach((f) => (FX[f.k] || (() => {}))(g, f, t, info));
      (P.tags || []).filter((x) => !x.screen).forEach((x) => drawTag(g, x, t, info));
      (P.bubbles || []).forEach((b) => { const a = tm(info, b.at, 0), e = b.until != null ? tm(info, b.until, info.dur) : 1e9; if (t < a || t > e) return; bubble(g, b.x, b.y, b.w || 420, b.h || 160, pop(t, a), (g) => { if (b.text) (Array.isArray(b.text) ? b.text : [b.text]).forEach((s, i, arr) => hand(g, s, 0, 6 + (i - (arr.length - 1) / 2) * (b.size || 56) * 1.1, { size: b.size || 56, color: b.color || OL })); if (b.prop) drawProp(g, { ...b.prop, x: 0, y: 0 }, t, info); }, { tail: b.tail ?? -60 }); });
    });
    if (P.dim) T.dim(g, P.dim, P.dimCol || '#101030');
    (P.tags || []).filter((x) => x.screen).forEach((x) => drawTag(g, x, t, info, true));
    if (P.year) yearTag(g, P.year[0], pop(t, tm(info, P.year[1] ?? 0.15, 0.15)), P.year[2] || {});
    if (P.caption) { const a = tm(info, P.caption[1] ?? 0, 0); if (t > a) { g.save(); g.globalAlpha = inn(t, a, 0.3); hand(g, P.caption[0], E.W / 2, E.H - 70, { size: 46, color: '#fff' }); g.restore(); } }
    finish(g, { vig: P.vig ?? 0.32 });
  } });

function drawTag(g, x, t, info, screen) {
  const a = tm(info, x.at ?? 0.2, 0.2), e = x.until != null ? tm(info, x.until, info.dur) : 1e9; if (t < a || t > e) return;
  if (screen) { g.save(); g.setTransform(E.PX, 0, 0, E.PX, 0, 0); }
  tag(g, x.t, x.x, x.y, pop(t, a), { size: x.size || 54, bg: x.bg === 'y' ? '#ffd43b' : x.bg === 'r' ? '#ffd9d0' : x.bg === 'g' ? '#d6f5c8' : x.bg, string: x.string, rot: x.rot });
  if (screen) g.restore();
}
function drawProp(g, p, t, info) {
  const a = tm(info, p.at, p.at == null ? -1 : 0), e = p.until != null ? tm(info, p.until, info.dur) : 1e9; if (t < a || t > e) return;
  const fn = PROPS[p.k]; if (!fn) return;
  const kGrow = p.growTo != null ? k01(t, a, tm(info, p.growTo, a + 1.5)) : clamp((t - a) / 1.2);
  let x = p.x ?? 960, y = p.y ?? 900;
  if (p.move) { const m0 = tm(info, p.move[2] ?? 0, 0), m1 = tm(info, p.move[3] ?? -0.01, info.dur); const k = k01(t, m0, m1); x = lerp(x, p.move[0], k); y = lerp(y, p.move[1], k) - (p.arc ? Math.sin(k * Math.PI) * p.arc : 0); }
  if (p.fall) { const k = clamp((t - a) / 0.6); y = lerp(y - 700, y, ease.outBack ? ease.out(k) : k); }
  g.save(); g.translate(x, y + (p.float ? Math.sin(t * 2 + x) * 8 : 0)); if (p.rot) g.rotate(p.rot); const s = (p.s || 1) * (p.at != null && !p.fall && !p.noPop ? ease.outBack(clamp((t - a) / 0.4)) : 1); g.scale(s * (p.flip ? -1 : 1), s);
  if (p.fade) g.globalAlpha = 1 - k01(t, tm(info, p.fade, info.dur), tm(info, p.fade, info.dur) + 0.5);
  fn(g, p, t, kGrow); g.restore();
}
function drawActor(g, a, t, info, i) {
  const base = castOf(a.c); let st = { ...base, ...a, c: undefined };
  for (const ch of a.on || []) { if (t >= tm(info, ch[0], 0)) st = { ...st, ...ch[1] }; }
  const show = a.show != null ? tm(info, a.show, 0) : -1; if (t < show) return; const hide = a.hide != null ? tm(info, a.hide, info.dur) : 1e9; if (t > hide) return;
  let x = a.x ?? 960, y = a.y ?? 930, walk = false;
  if (a.walk) { const [x0, x1, w0, w1] = a.walk; const t0 = tm(info, w0 ?? 0, 0), t1 = tm(info, w1 ?? -0.01, info.dur); const k = clamp((t - t0) / Math.max(0.1, t1 - t0)); x = lerp(x0, x1, ease.inOut(k)); if (k > 0 && k < 1) walk = t * 6 + i; }
  if (a.jump) { const ja = tm(info, a.jump, 0); y -= Math.max(0, Math.sin(clamp((t - ja) / 0.5) * Math.PI)) * 80; }
  let talk = st.talk; if (Array.isArray(talk)) talk = t >= tm(info, talk[0], 0) && t <= tm(info, talk[1], info.dur);
  const bow = st.bowAt ? k01(t, tm(info, st.bowAt, 0), tm(info, st.bowAt, 0) + 0.4) * (st.bowUntil ? 1 - k01(t, tm(info, st.bowUntil, 0), tm(info, st.bowUntil, 0) + 0.4) : 1) * (st.bowAmt || 1) : (st.bow || 0);
  const alphaK = show >= 0 && a.fadeIn ? inn(t, show, 0.4) : 1;
  g.save(); if (alphaK < 1) g.globalAlpha = alphaK;
  if (a.pop && show >= 0) { const k = pop(t, show); g.translate(x, y); g.scale(k, k); g.translate(-x, -y); }
  person(g, { ...st, x, y, s: a.s ?? 1, t, talk, walk: a.walk ? walk : (st.walking ? t * 6 + i : false), bow, prop: st.hold ? (g, h) => { const hx = (h.l[0] + h.r[0]) / 2, hy = Math.min(h.l[1], h.r[1]); g.save(); const s2 = st.holdS || 0.6; const hk = st.hold.k, down = ['paper', 'scroll', 'ledger', 'newspaper', 'book', 'laptop'].includes(hk) ? ({ paper: st.hold.h || 400, scroll: st.hold.h || 420, ledger: 440, newspaper: 760, book: 340, laptop: 0 }[hk] / 2 - 20) * s2 : 0; g.translate(st.holdOne ? h.r[0] : hx, (st.holdOne ? h.r[1] : hy) + down + (st.holdDY || 0)); g.scale(s2, s2); (PROPS[st.hold.k] || (() => {}))(g, st.hold, t, 1); g.restore(); } : null });
  g.restore();
}
export const FX = {
  coinsFly: (g, f, t, info) => { const a = tm(info, f.at, 0); for (let i = 0; i < (f.n || 8); i++) { const st = a + i * (f.gap || 0.15), k = prog(t, st, st + 0.6); if (k <= 0) continue; const x = lerp(f.from[0], f.to[0] + (i % 3) * 16, k), y = lerp(f.from[1], f.to[1], k) - Math.sin(k * Math.PI) * (f.arc || 160); coin(g, x, y, f.r || 22, f.col || C.gold); } },
  rain: (g, f, t) => { g.save(); g.strokeStyle = 'rgba(200,220,255,.5)'; g.lineWidth = 3; for (let i = 0; i < 120; i++) { const x = (i * 97 + t * 300) % 2200 - 100, y = (i * 53 + t * 1400) % 1300 - 100; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 40); g.stroke(); } g.restore(); },
  snow: (g, f, t) => { for (let i = 0; i < 90; i++) { const x = (i * 211 + Math.sin(t + i) * 30) % 2000, y = (i * 67 + t * 80) % 1150 - 40; ell(g, x, y, 5, 5, 'rgba(255,255,255,.85)', 0); } },
  confetti: (g, f, t, info) => { const a = tm(info, f.at, 0); if (t < a) return; const r = rng(5); for (let i = 0; i < 80; i++) { const x = r() * 1920, y = ((t - a) * (200 + r() * 300) + r() * 200) - 100; box(g, x, y, 14, 22, ['#d94a3a', '#f2c037', '#3a7ad9', '#3aa86a'][i % 4], { r: 2, lw: 0, grad: false }); } },
  shake: () => {},
  flash: (g, f, t, info) => { const a = tm(info, f.at, 0); const k = 1 - clamp((t - a) / 0.4); if (t > a && k > 0) { g.save(); g.fillStyle = `rgba(255,255,255,${k * 0.7})`; g.fillRect(-2000, -2000, 6000, 6000); g.restore(); } },
  dropLine: (g, f, t, info) => { const a = tm(info, f.at, 0), k = k01(t, a, a + (f.d || 1.2)); const pts = f.pts.slice(0, Math.max(2, Math.ceil(f.pts.length * k))); line(g, pts, 10, f.col || C.red); },
};
