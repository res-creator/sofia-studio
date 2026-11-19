// nksets.js — фоны и предметы для «Что если бы вы родились в Северной Корее?» (мир 1920×1080, пол ≈ y 930).
// Правило: никаких лиц правителей — на стенах только пустые рамки со светлым полем; надписи только русские или без текста.
import { E, ease, clamp, lerp, shade, alpha, rng } from '/engine/core.js';
import * as T from '../toon.js';
import { box, ell, poly, line, limb, light, hand, tag, C, OL } from '../toon.js';
import { SETS } from './sets.js';
import { PROPS, tm } from './stage.js';
import { proj } from './ww3sets.js';
import { GEO } from '../geo.js';

const NIGHT = ['#0e1430', '#1c2656', '#2e3470'], DAY = ['#86c8ea', '#cfe9f2', '#f8e6bc'], GREY = ['#9aa4b0', '#d6d8d4'];
const ground = (g, y, col, lw = 5) => { g.fillStyle = T.vgrad(g, y, 400, col, 0.1); g.fillRect(-1500, y, 5000, 1500); line(g, [[-1500, y], [3500, y]], lw); };
const stars = (g, t, n = 120, a = 0.9) => { const r = rng(3); for (let i = 0; i < n; i++) { const x = r() * 2400 - 240, y = r() * 1300 - 120, s = 1.5 + r() * 2.5; ell(g, x, y, s, s, `rgba(255,255,240,${a * (0.5 + 0.5 * Math.sin(t * 2 + i))})`, 0); } };
const clouds = (g, t, n = 4, y = 170, a = 0.85) => { for (let i = 0; i < n; i++) { const x = ((i * 520 + t * 15) % 2600) - 300, yy = y + (i % 2) * 70; ell(g, x, yy, 130, 30, `rgba(255,255,255,${a})`, 0); ell(g, x + 60, yy - 20, 70, 26, `rgba(255,255,255,${a})`, 0); } };
const hills = (g, y, col, amp = 80, seed = 1, bare = false) => { g.beginPath(); g.moveTo(-1500, 2000); for (let x = -1500; x <= 3500; x += 40) g.lineTo(x, y - Math.abs(Math.sin(x * 0.0021 + seed) * amp + Math.sin(x * 0.006 + seed * 3) * amp * 0.35)); g.lineTo(3500, 2000); g.closePath(); T.fo(g, col, 4); if (bare) { const r = rng(seed * 7); for (let i = 0; i < 40; i++) { const x = r() * 1920, yy = y - 20 + r() * 120; line(g, [[x, yy], [x + 6, yy - 18]], 3, 'rgba(60,50,40,.5)'); } } };
const k01 = (t, a, b) => clamp((t - a) / Math.max(1e-3, b - a));
// пустая рамка «портрета»: золото + светлое поле, без изображения
export function emptyFrame(g, x, y, w = 150, h = 190) { T.frame(g, x - w / 2, y - h / 2, w, h, (g) => { g.fillStyle = '#efe6cf'; g.fillRect(x - w, y - h, w * 2, h * 2); light(g, x, y - h * 0.1, w, '#ffffff', 0.35); }, '#c9a14a'); }
const block = (g, x, y, w, h, col, lit = 0.25, seed = 1) => { box(g, x, y - h, w, h, col, { r: 2 }); const r = rng(seed + x); const cols = Math.max(2, Math.round(w / 70)), rows = Math.max(2, Math.round(h / 80)); for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) box(g, x + 14 + i * (w - 20) / cols, y - h + 18 + j * (h - 30) / rows, (w - 20) / cols - 16, (h - 30) / rows - 22, r() < lit ? '#ffd77a' : '#3a4250', { r: 2, lw: 3 }); };
const banner = (g, x, y, w, h = 70, col = '#c8322a') => { box(g, x - w / 2, y, w, h, col, { r: 4 }); for (let i = 0; i < Math.floor(w / 60); i++) box(g, x - w / 2 + 24 + i * 60, y + 22, 30, h - 44, '#f2e4c8', { r: 2, lw: 0, grad: false }); };
// точка внутри многоугольника (для ночных огней)
function inside(pt, ring) { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) c = !c; } return c; }
const LIGHTS = {};
function lightsFor(iso, n, seed, box4) { const key = iso + n + seed; if (LIGHTS[key]) return LIGHTS[key]; const r = rng(seed), out = []; const rings = GEO[iso] || []; let tries = 0;
  while (out.length < n && tries < n * 60) { tries++; const lo = box4[0] + r() * (box4[2] - box4[0]), la = box4[1] + r() * (box4[3] - box4[1]); if (rings.some((rg) => inside([lo, la], rg))) out.push([lo, la, r()]); } return (LIGHTS[key] = out); }

Object.assign(SETS, {
  // Корейский полуостров ночью из космоса. o.view, o.labels:true, o.pyAt — когда «зажечь» Пхеньян, o.label2 — подписи стран
  nightKorea: (g, t, o, info) => {
    const v = o.view || [116.5, 33, 138.5, 43.6]; const pr = proj({ view: v, contain: o.contain });
    g.fillStyle = '#03060e'; g.fillRect(-1500, -1500, 5000, 5000);
    g.save(); if (o.focus) { const [flo, fla, z0, z1] = o.focus, [fx, fy] = pr(flo, fla), zz = lerp(z0, z1 ?? z0, ease.inOut(clamp(t / Math.max(0.1, info.dur)))); g.translate(960, 540); g.scale(zz, zz); g.translate(-fx, -fy); }
    for (const iso of ['CHN', 'PRK', 'KOR', 'JPN', 'RUS', 'MNG']) for (const ring of GEO[iso] || []) { g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = pr(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = iso === 'PRK' ? (o.hlNorth ? '#2a1e22' : '#0d1018') : '#121722'; g.fill(); g.strokeStyle = o.borders ? 'rgba(170,190,220,.45)' : 'rgba(120,140,170,.18)'; g.lineWidth = iso === 'PRK' && o.hlNorth ? 4 : 1.5; g.stroke(); }
    g.save(); g.globalCompositeOperation = 'screen';
    const dot = (lo, la, s, a) => { const [x, y] = pr(lo, la); g.fillStyle = `rgba(255,200,110,${a})`; g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill(); };
    const tw = (i) => 0.75 + 0.25 * Math.sin(t * 2 + i);
    for (const [lo, la, q] of lightsFor('KOR', 1300, 5, [125.5, 34, 130, 38.7])) dot(lo, la, 2.2 + q * 3.2, 0.62 * tw(lo * 50));
    for (const [lo, la, q] of lightsFor('CHN', 1400, 6, [116, 34, 131, 44])) dot(lo, la, 1.6 + q * 2.6, 0.35 * tw(la * 40));
    for (const [lo, la, q] of lightsFor('JPN', 500, 7, [129, 31, 136, 36])) dot(lo, la, 2 + q * 2, 0.4);
    // мегаполисы
    [[127.0, 37.55, 70], [129.07, 35.18, 40], [126.7, 37.45, 40], [128.6, 35.87, 35], [127.4, 36.35, 30], [126.85, 35.15, 30], [121.6, 38.9, 50], [123.4, 41.8, 55], [116.4, 39.9, 70], [117.2, 39.1, 55], [135.5, 34.7, 60], [130.4, 33.6, 40]].forEach(([lo, la, r]) => { const [x, y] = pr(lo, la); light(g, x, y, r * 1.6, '#ffc470', 0.8); });
    const pa = o.pyAt != null ? k01(t, tm(info, o.pyAt, 0), tm(info, o.pyAt, 0) + 0.6) : 1; const [px, py] = pr(125.75, 39.03); light(g, px, py, 36 * pa, '#ffc470', 0.6 * pa); dot(125.75, 39.03, 4 * pa, 0.9);
    g.restore();
    if (o.labels) { const L = [[127.6, 36.4, 'Южная Корея'], [126.6, 40.6, 'Северная Корея'], [122.2, 42.6, 'Китай'], [125.75, 38.55, 'Пхеньян', 34], [127.0, 37.2, 'Сеул', 34]]; L.forEach(([lo, la, s, sz]) => { const [x, y] = pr(lo, la); hand(g, s, x, y, { size: (sz || 46) / (o.focus ? Math.max(1, o.focus[2] * 0.7) : 1), color: 'rgba(235,240,250,.85)' }); }); }
    g.restore();
  },
  // Пхеньян: проспект, высотки, обелиск с огнём, транспаранты без слов
  pyongyang: (g, t, o) => {
    T.sky(g, o.night ? NIGHT : o.dusk ? ['#5d4a8a', '#e3786a', '#f6b26b'] : DAY); if (!o.night) clouds(g, t);
    const r = rng(9); for (let i = 0; i < 9; i++) { const x = -120 + i * 240, h = 300 + r() * 360; block(g, x, 820, 190, h, ['#e8e2d6', '#d8e2ea', '#f2d8c8', '#cfe0d8'][i % 4], o.night ? 0.6 : 0.15, i); }
    // обелиск
    const ox = o.ox ?? 1500; box(g, ox - 40, 160, 80, 660, '#efe6d2', { r: 2 }); for (let j = 0; j < 8; j++) line(g, [[ox - 40, 220 + j * 76], [ox + 40, 220 + j * 76]], 2, 'rgba(0,0,0,.15)');
    poly(g, [[ox - 30, 160], [ox + 30, 160], [ox, 70]], '#e84a2a'); T.flame(g, ox, 120, 0.6, t, 3); light(g, ox, 110, 220, '#ff7a3a', 0.4);
    ground(g, 820, '#b8b4aa'); g.fillStyle = '#8a8a8a'; g.beginPath(); g.moveTo(560, 820); g.lineTo(1360, 820); g.lineTo(2100, 1100); g.lineTo(-180, 1100); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) box(g, 952 - i * 2, 840 + i * 44, 16 + i * 4, 22, '#f2f2f2', { r: 2, lw: 0, grad: false });
    if (o.banners !== false) { banner(g, 420, 520, 300); banner(g, 960, 470, 260, 60, '#c8322a'); }
    if (o.night) T.dim(g, 0.2, '#000020');
  },
  // небольшой северный городок: серые пятиэтажки, голые сопки
  nktown: (g, t, o) => {
    T.sky(g, o.night ? NIGHT : o.winter ? ['#a8b4c0', '#e2e6e8'] : GREY); if (o.night) stars(g, t, 60); else clouds(g, t, 3, 200, 0.6);
    hills(g, 560, o.winter ? '#dfe4e8' : '#9a8f78', 120, 2, !o.winter);
    for (let i = 0; i < 6; i++) block(g, -60 + i * 340, 880, 280, 300 + (i % 2) * 60, ['#b8b4aa', '#c8c2b4', '#aab0b4'][i % 3], o.night ? (o.lit ?? 0.04) : 0.0, i + 3);
    if (o.board !== false) { line(g, [[1620, 880], [1620, 700]], 10, '#5a5a5a'); line(g, [[1840, 880], [1840, 700]], 10, '#5a5a5a'); banner(g, 1730, 600, 300, 100); }
    ground(g, 880, o.winter ? '#e8eef2' : '#8a8478');
    if (o.winter) for (let i = 0; i < 80; i++) ell(g, (i * 211 + Math.sin(t + i) * 30) % 2000, (i * 67 + t * 70) % 1150 - 40, 4, 4, 'rgba(255,255,255,.9)', 0);
    if (o.night) T.dim(g, 0.3, '#000018');
  },
  // квартира: две пустые рамки, динамик на стене, низкий столик
  nkroom: (g, t, o) => {
    T.wallRoom(g, { wall: o.wall || '#d8dcc8', floor: '#a87a4a', fy: 800 });
    if (o.frames !== false) { emptyFrame(g, 820, 250, 150, 190); emptyFrame(g, 1100, 250, 150, 190); }
    if (o.speaker !== false) { box(g, 1500, 170, 130, 150, '#6a5a4a', { r: 10 }); for (let i = 0; i < 5; i++) line(g, [[1520, 200 + i * 22], [1610, 200 + i * 22]], 4, '#3a3028'); if (o.song) for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; g.save(); g.globalAlpha = 1 - k; hand(g, '♪', 1660 + k * 120, 200 - k * 80 + i * 10, { size: 50, color: '#5a4a3a' }); g.restore(); } }
    T.window_(g, 240, 170, 300, 340, (g) => { T.sky(g, o.night ? NIGHT : GREY); hills(g, 420, '#9a8f78', 40, 4); }, {});
    if (o.table !== false) { box(g, 760, 820, 400, 30, '#7a4a2a', { r: 4 }); box(g, 790, 850, 20, 60, '#5a3a22', { r: 2 }); box(g, 1110, 850, 20, 60, '#5a3a22', { r: 2 }); }
    if (o.dark || o.night) { T.dim(g, o.dark ? 0.55 : 0.3, '#05050f'); if (o.candle) { T.candle(g, o.candle, 810, t); light(g, o.candle, 770, 520, '#ffcc70', 0.55); } }
  },
  // класс: доска, две пустые рамки над доской, парты
  nkclass: (g, t, o) => {
    T.wallRoom(g, { wall: '#cfd8c4', floor: '#8a6a4a', fy: 800, boards: true });
    emptyFrame(g, 820, 150, 120, 150); emptyFrame(g, 1100, 150, 120, 150);
    box(g, 460, 260, 1000, 400, '#2f4a3a', { r: 6 }); box(g, 444, 244, 1032, 432, null, { r: 8, lw: 14, grad: false });
    (o.board || []).forEach((s, i) => hand(g, s, 960, 340 + i * 84, { size: 66, color: '#f4f1ea' }));
    T.window_(g, 80, 200, 260, 360, (g) => T.sky(g, o.winter ? ['#a8b4c0', '#e2e6e8'] : DAY), {});
    if (o.desks !== false) for (let i = 0; i < 4; i++) { box(g, 120 + i * 470, 880, 300, 26, '#9a6a3a', { r: 4 }); box(g, 140 + i * 470, 906, 18, 110, '#6a4a2a', { r: 2 }); box(g, 400 + i * 470, 906, 18, 110, '#6a4a2a', { r: 2 }); }
    if (o.cold) { for (let i = 0; i < 6; i++) { const k = (t * 0.5 + i / 6) % 1; g.save(); g.globalAlpha = 0.4 * (1 - k); ell(g, 300 + i * 260, 700 - k * 120, 30 + k * 30, 14, '#ffffff', 0); g.restore(); } T.dim(g, 0.12, '#203050'); }
    if (o.dark) { T.dim(g, 0.55, '#05050f'); if (o.lamp) light(g, o.lamp, 820, 420, '#ffd88a', 0.6); }
  },
  // архив: стеллажи папок, стол с лампой
  archive: (g, t, o) => {
    T.wallRoom(g, { wall: '#4a4a40', floor: '#3a2e26', fy: 820 });
    for (let s = 0; s < 4; s++) { const x = 40 + s * 480; for (let r = 0; r < 4; r++) { box(g, x, 140 + r * 160 + 120, 420, 16, '#5a3a22', { r: 2, lw: 3 }); for (let j = 0; j < 12; j++) box(g, x + 10 + j * 34, 140 + r * 160 + 20 + (j * 7 % 3) * 4, 28, 100 - (j * 7 % 3) * 4, ['#c9b47a', '#b8a06a', '#d8c48a'][(j + r + s) % 3], { r: 2, lw: 3 }); } }
    box(g, 520, 820, 880, 40, '#6a4428', { r: 4 }); box(g, 540, 860, 840, 120, '#5a3a22', { r: 4 });
    limb(g, [[1300, 820], [1300, 640], [1220, 600]], 8, '#2a2a2a'); poly(g, [[1180, 580], [1270, 580], [1290, 640], [1160, 640]], '#2a5a3a'); light(g, 1220, 700, 520, '#ffe9a0', 0.5);
    T.dim(g, 0.18, '#101018');
  },
  // рисовое поле весной: вода, сопки, ростки
  paddy: (g, t, o) => {
    T.sky(g, o.dusk ? ['#5d4a8a', '#e3786a', '#f6b26b'] : DAY); clouds(g, t);
    hills(g, 540, '#8aa070', 110, 3); hills(g, 640, '#7a9a5a', 60, 5);
    g.fillStyle = T.vgrad(g, 660, 500, '#8ab8c8', 0.1); g.fillRect(-1500, 660, 5000, 800); line(g, [[-1500, 660], [3500, 660]], 4);
    for (let i = 0; i < 5; i++) line(g, [[-200, 700 + i * 80], [2200, 690 + i * 86]], 10, '#a88a5a');
    const r = rng(4); for (let i = 0; i < 90; i++) { const x = (i % 18) * 115 + r() * 30, y = 720 + Math.floor(i / 18) * 80 + r() * 20; line(g, [[x, y], [x - 8, y - 30]], 4, '#4a9a3a'); line(g, [[x, y], [x + 8, y - 28]], 4, '#5aaa4a'); }
    for (let i = 0; i < 10; i++) line(g, [[(i * 230 + t * 20) % 2000, 900 + (i % 3) * 40], [(i * 230 + t * 20) % 2000 + 60, 900 + (i % 3) * 40]], 3, 'rgba(255,255,255,.5)');
  },
  // голые сопки и пустое поле (голод)
  barren: (g, t, o) => {
    T.sky(g, ['#7a7870', '#b8b0a0']); hills(g, 560, '#8a7a60', 140, 6, true); hills(g, 700, '#7a6a52', 70, 8, true); ground(g, 860, '#7a6a58');
    const r = rng(8); for (let i = 0; i < 6; i++) { const x = 120 + i * 320 + r() * 40; line(g, [[x, 860], [x, 700]], 8, '#4a3a2a'); line(g, [[x, 760], [x + 40, 720]], 5, '#4a3a2a'); line(g, [[x, 740], [x - 30, 710]], 5, '#4a3a2a'); }
    if (o.house) { box(g, 1300, 700, 320, 160, '#a8a090', { r: 2 }); poly(g, [[1280, 700], [1640, 700], [1460, 620]], '#6a6058'); box(g, 1440, 780, 50, 80, '#3a3028', { r: 2, lw: 4 }); }
    T.dim(g, 0.1, '#302820');
  },
  // рынок чанмадан: навесы, прилавки, товары
  market: (g, t, o) => {
    T.sky(g, GREY); clouds(g, t, 3, 160, 0.6); block(g, -100, 640, 500, 360, '#b8b4aa', 0, 2); block(g, 1500, 640, 520, 320, '#c8c2b4', 0, 5);
    ground(g, 930, '#9a8e7a');
    const cols = ['#3a7ad9', '#d94a3a', '#3aa86a', '#e8a03a', '#8a5ad6'];
    for (let i = 0; i < 5; i++) { const x = 40 + i * 380; poly(g, [[x, 520], [x + 340, 520], [x + 360, 600], [x - 20, 600]], cols[i]); for (let j = 0; j < 6; j++) box(g, x + j * 56, 520, 28, 80, alpha('#ffffff', 0.3), { r: 0, lw: 0, grad: false }); line(g, [[x, 600], [x, 930]], 6, '#5a5a5a'); line(g, [[x + 340, 600], [x + 340, 930]], 6, '#5a5a5a');
      box(g, x + 10, 760, 320, 40, '#8a6a4a', { r: 4 }); const r = rng(i + 3); for (let j = 0; j < 7; j++) { const gx = x + 40 + j * 42, kind = (i + j) % 4; if (kind === 0) ell(g, gx, 744, 18, 16, ['#f2c84a', '#e86a3a', '#6ab84a'][j % 3], 3); else if (kind === 1) box(g, gx - 14, 716, 28, 44, '#d8e8f0', { r: 6, lw: 3 }); else if (kind === 2) box(g, gx - 18, 726, 36, 34, ['#5a7ad9', '#d94a8a'][j % 2], { r: 4, lw: 3 }); else ell(g, gx, 748, 20, 12, '#f2ead8', 3); } }
  },
  // двор, кимчжан: горы капусты, тазы
  kimjang: (g, t, o) => {
    T.sky(g, ['#a8c8e0', '#f2e2c0']); block(g, -80, 720, 2100, 520, '#c8c2b4', 0, 7); ground(g, 930, '#a89a80');
    for (let i = 0; i < 4; i++) { const x = 160 + i * 460; for (let j = 0; j < 14; j++) { const cx = x + (j % 5) * 50 - 100 + (Math.floor(j / 5) % 2) * 25, cy = 900 - Math.floor(j / 5) * 34; ell(g, cx, cy, 34, 26, '#c8e08a', 4); ell(g, cx - 8, cy - 6, 14, 18, '#e8f0c0', 0); } }
    for (let i = 0; i < 3; i++) { const x = 400 + i * 560; ell(g, x, 960, 130, 36, '#d84a2a', 5); ell(g, x, 950, 110, 22, '#c8321a', 0); }
  },
  // завод, который стоит: трубы без дыма
  factory: (g, t, o) => {
    T.sky(g, GREY); hills(g, 600, '#9a8f78', 80, 9);
    for (let i = 0; i < 3; i++) { const x = 380 + i * 420; box(g, x, 220, 80, 520, '#8a7a72', { r: 4 }); for (let j = 0; j < 4; j++) line(g, [[x, 300 + j * 100], [x + 80, 300 + j * 100]], 4, '#a8322a'); if (o.smoke) T.smoke(g, x + 40, 210, t + i, 6, 1.1); }
    box(g, 120, 560, 1680, 370, '#9a8e86', { r: 4 }); for (let i = 0; i < 10; i++) box(g, 170 + i * 162, 620, 110, 140, o.lit ? '#ffd77a' : '#3a4250', { r: 2, lw: 3 }); box(g, 860, 800, 200, 130, '#5a4a40', { r: 4 }); ground(g, 930, '#7a7470');
    if (o.board !== false) banner(g, 960, 470, 400, 70);
  },
  // стройка: кран, леса, кирпич
  site: (g, t, o) => {
    T.sky(g, o.dusk ? ['#5d4a8a', '#e3786a', '#f6b26b'] : DAY); clouds(g, t);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) box(g, 300 + c * 130, 860 - (r + 1) * 90, 124, 86, r < 4 ? '#c8a07a' : alpha('#c8a07a', 0.4), { r: 2, lw: 3 });
    for (let c = 0; c <= 5; c++) line(g, [[290 + c * 130, 860], [290 + c * 130, 300]], 5, '#8a6a3a'); for (let r = 0; r < 6; r++) line(g, [[290, 860 - r * 90], [940, 860 - r * 90]], 4, '#8a6a3a');
    line(g, [[1400, 930], [1400, 140]], 14, '#e8b83a'); line(g, [[1100, 160], [1820, 160]], 12, '#e8b83a'); line(g, [[1680, 160], [1680, 420 + Math.sin(t) * 20]], 3); box(g, 1640, 420 + Math.sin(t) * 20, 80, 50, '#8a7a6a', { r: 2 });
    ground(g, 930, '#a8946a'); for (let i = 0; i < 4; i++) ell(g, 1100 + i * 90, 925, 60, 26, '#8a7452', 4);
  },
  // площадь с парадом: колонны солдат (точками), трибуна без лиц
  parade: (g, t, o) => {
    T.sky(g, DAY); clouds(g, t); block(g, -120, 600, 2200, 260, '#e8e2d6', 0, 11); box(g, 700, 300, 520, 300, '#efe6d2', { r: 2 }); for (let i = 0; i < 6; i++) box(g, 730 + i * 84, 300, 40, 300, '#f8f2e4', { r: 2, lw: 3 });
    ground(g, 600, '#b8b4aa');
    const off = (t * 60) % 120; for (let b = 0; b < 4; b++) for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) { const x = 160 + b * 440 + c * 38 + r * 10, y = 680 + r * 48 + (off * 0.0); ell(g, x, y, 13, 13, '#e8c8a0', 3); box(g, x - 13, y + 12, 26, 26, b % 2 ? '#4a5a3a' : '#5a6a4a', { r: 4, lw: 3 }); }
    banner(g, 960, 230, 520, 60);
  },
  // граница: река ночью, берег Китая с огнями, вышка
  river: (g, t, o) => {
    T.sky(g, o.day ? GREY : NIGHT); if (!o.day) stars(g, t, 70);
    // дальний берег (Китай)
    g.fillStyle = o.day ? '#7a8a6a' : '#141a2a'; g.fillRect(-1500, 470, 5000, 120); T.skyline(g, 500, t, { seed: 7, col: o.day ? '#9aa0aa' : '#1e2440', win: '#ffd77a' }); line(g, [[-1500, 590], [3500, 590]], 4);
    g.fillStyle = T.vgrad(g, 590, 300, o.day ? '#5a8aa8' : '#16264a', 0.15); g.fillRect(-1500, 590, 5000, 300);
    for (let i = 0; i < 12; i++) line(g, [[(i * 190 + t * 25) % 2100 - 100, 620 + (i % 5) * 50], [(i * 190 + t * 25) % 2100 - 30, 620 + (i % 5) * 50]], 3, o.day ? 'rgba(255,255,255,.5)' : 'rgba(255,214,140,.35)');
    if (o.ice) { g.fillStyle = 'rgba(220,235,245,.75)'; g.fillRect(-1500, 590, 5000, 300); for (let i = 0; i < 8; i++) line(g, [[i * 260, 620], [i * 260 + 120, 860]], 3, 'rgba(120,150,180,.6)'); }
    ground(g, 880, o.day ? '#6a7a5a' : '#1e2418'); for (let i = 0; i < 26; i++) { line(g, [[i * 80 - 40, 880], [i * 80 - 40, 760]], 6, '#4a4a4a'); } for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = -80; x < 2100; x += 20) g.lineTo(x, 780 + k * 28 + Math.sin(x * 0.2) * 6); g.lineWidth = 2.5; g.strokeStyle = '#8a8a8a'; g.stroke(); }
    if (o.tower !== false) { const x = o.towerX ?? 1700; line(g, [[x - 60, 880], [x - 30, 560]], 8, '#3a3a3a'); line(g, [[x + 60, 880], [x + 30, 560]], 8, '#3a3a3a'); box(g, x - 70, 500, 140, 70, '#4a4a40', { r: 4 }); if (!o.day) { const a = Math.sin(t * 0.8) * 0.6; g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,250,200,.13)'; g.beginPath(); g.moveTo(x, 530); g.lineTo(x - 700 + a * 500, 900); g.lineTo(x - 400 + a * 500, 900); g.closePath(); g.fill(); g.restore(); } }
    if (o.labels) { hand(g, 'Китай', 960, 430, { size: 54, color: '#f2c037' }); hand(g, 'КНДР', 360, 960, { size: 54, color: '#f2c037' }); }
    if (o.gap) { line(g, [[700, 600], [700, 870]], 5, '#f2c037'); hand(g, o.gap, 780, 740, { size: 50, color: '#f2c037', align: 'left' }); }
  },
  // ДМЗ: заборы, проволока, таблички мин, вышки по обе стороны
  dmz: (g, t, o) => {
    T.sky(g, GREY); hills(g, 520, '#7a8a62', 120, 12); ground(g, 700, '#7a8a5a');
    for (const y of [700, 930]) { for (let i = 0; i < 26; i++) line(g, [[i * 80 - 40, y], [i * 80 - 40, y - 150]], 7, '#5a5a5a'); for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = -80; x < 2100; x += 18) g.lineTo(x, y - 140 + k * 34 + Math.sin(x * 0.25) * 6); g.lineWidth = 2.5; g.strokeStyle = '#9a9a9a'; g.stroke(); } }
    for (let i = 0; i < 6; i++) { const x = 180 + i * 300, y = 820 - (i % 2) * 40; line(g, [[x, y + 40], [x, y - 40]], 6, '#6a4a2a'); poly(g, [[x - 40, y - 40], [x + 40, y - 40], [x, y - 110]], '#e83a2a', 4); hand(g, 'мины', x, y - 58, { size: 26, color: '#fff' }); }
    [[160, 'КНДР'], [1760, 'Юг']].forEach(([x, s]) => { line(g, [[x - 40, 700], [x - 20, 470]], 7, '#3a3a3a'); line(g, [[x + 40, 700], [x + 20, 470]], 7, '#3a3a3a'); box(g, x - 56, 420, 112, 60, '#4a4a40', { r: 4 }); if (o.labels) hand(g, s, x, 380, { size: 44, color: '#f2c037' }); });
    if (o.ruler) { line(g, [[260, 1010], [1660, 1010]], 6, '#f2c037'); line(g, [[260, 985], [260, 1035]], 6, '#f2c037'); line(g, [[1660, 985], [1660, 1035]], 6, '#f2c037'); }
  },
  // джунгли (путь в Лаос)
  jungle: (g, t, o) => {
    T.sky(g, o.night ? NIGHT : ['#5a9a7a', '#c8e0b0']); if (o.night) stars(g, t, 40);
    hills(g, 520, '#3a6a4a', 140, 14); hills(g, 680, '#2f5a3a', 80, 15);
    const r = rng(14); for (let i = 0; i < 18; i++) { const x = -60 + i * 120 + r() * 40, h = 300 + r() * 300; line(g, [[x, 930], [x + 10, 930 - h]], 14, '#4a3a2a'); for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * 0.6 + Math.sin(t + i) * 0.05; g.save(); g.translate(x + 10, 930 - h); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(50, -60, 0, -150); g.quadraticCurveTo(-50, -60, 0, 0); T.fo(g, ['#3a8a4a', '#2f7a3a', '#4a9a5a'][j % 3], 3); g.restore(); } }
    ground(g, 930, '#4a5a32'); if (o.night) T.dim(g, 0.35, '#000018');
  },
  // дальний лагерь: только забор и вышки на склоне, серое небо
  camp: (g, t, o) => {
    T.sky(g, ['#5a5e66', '#9aa0a4']); hills(g, 420, '#6a6a60', 160, 18); hills(g, 640, '#5a5e52', 90, 19);
    for (let i = 0; i < 40; i++) line(g, [[200 + i * 38, 640 - Math.sin(i * 0.15) * 40], [200 + i * 38, 600 - Math.sin(i * 0.15) * 40]], 3, '#3a3a3a');
    g.beginPath(); for (let i = 0; i < 40; i++) g.lineTo(200 + i * 38, 610 - Math.sin(i * 0.15) * 40); g.lineWidth = 2; g.strokeStyle = '#3a3a3a'; g.stroke();
    [[300, 600], [1700, 560]].forEach(([x, y]) => { line(g, [[x - 14, y + 40], [x - 6, y - 60]], 4, '#2a2a2a'); line(g, [[x + 14, y + 40], [x + 6, y - 60]], 4, '#2a2a2a'); box(g, x - 22, y - 86, 44, 28, '#3a3a34', { r: 2, lw: 3 }); });
    ground(g, 930, '#5a5a50'); T.dim(g, 0.12, '#101018');
  },
  // Сеул ночью
  seoul: (g, t, o) => {
    T.sky(g, o.day ? DAY : ['#14183a', '#3a2a6a', '#8a4a7a']); if (!o.day) stars(g, t, 40);
    T.skyline(g, 860, t, { seed: 21, col: o.day ? '#8a9ab8' : '#2a2a5a', win: '#ffd77a' }); T.skyline(g, 930, t, { seed: 22, col: o.day ? '#6a7a98' : '#1e1e48', win: '#ffe9a0' });
    if (!o.day) for (let i = 0; i < 12; i++) light(g, 80 + i * 160, 860, 160, ['#ff6aa0', '#6ad0ff', '#ffd07a'][i % 3], 0.25);
    ground(g, 930, o.day ? '#6a6a7a' : '#2a2a40'); for (let i = 0; i < 20; i++) { const x = (i * 140 + t * 220) % 2100 - 100; ell(g, x, 960, 8, 5, '#ffe9a0', 0); ell(g, 2000 - x, 1000, 8, 5, '#ff5a4a', 0); }
  },
  // ночь в комнате с телевизором: смотрят флешку
  nightTV: (g, t, o) => {
    T.wallRoom(g, { wall: '#2a2e3a', floor: '#2a2420', fy: 800 });
    for (let i = 0; i < 2; i++) { T.curtain(g, 220 + i * 260, 120, 240, 600, '#5a2a3a', i ? -1 : 1); }
    box(g, 1240, 520, 420, 300, '#3a3028', { r: 10 }); box(g, 1270, 545, 360, 240, '#9ad0f0', { r: 18, lw: 4 }); light(g, 1450, 660, 900, '#9ad0f0', 0.35 + Math.sin(t * 7) * 0.05);
    box(g, 1200, 820, 500, 30, '#5a3a22', { r: 4 }); T.dim(g, 0.35, '#05050f'); light(g, 1450, 660, 700, '#9ad0f0', 0.3);
  },
  // центр «Ханавон»: светлый класс, банкомат
  hanawon: (g, t, o) => {
    T.wallRoom(g, { wall: '#eef2f4', floor: '#b8c0c8', fy: 800 }); for (let i = 0; i < 3; i++) T.window_(g, 160 + i * 420, 140, 300, 340, (g) => { T.sky(g, DAY); T.skyline(g, 460, t, { seed: 30 + i, col: '#8a9ab8' }); }, { frame: '#d8dde2' });
    box(g, 1460, 380, 280, 440, '#5a7ab0', { r: 10 }); box(g, 1500, 420, 200, 140, '#bfe6ff', { r: 6, lw: 4 }); hand(g, 'БАНКОМАТ', 1600, 610, { size: 34, color: '#fff' }); box(g, 1520, 650, 160, 20, '#2a2a33', { r: 4, lw: 3 }); for (let i = 0; i < 9; i++) box(g, 1530 + (i % 3) * 50, 690 + Math.floor(i / 3) * 36, 40, 28, '#e8eef2', { r: 3, lw: 3 });
  },
  // кабинет чиновника (распределение)
  bureau: (g, t, o) => {
    T.wallRoom(g, { wall: '#c8c0a8', floor: '#6a4a32', fy: 800 }); emptyFrame(g, 960, 230, 150, 190);
    for (let i = 0; i < 2; i++) { const x = 160 + i * 1420; box(g, x, 300, 200, 500, '#6a4428', { r: 4 }); for (let r = 0; r < 4; r++) for (let j = 0; j < 5; j++) box(g, x + 14 + j * 36, 320 + r * 120, 30, 100, ['#c9b47a', '#b8a06a'][(j + r) % 2], { r: 2, lw: 3 }); }
    box(g, 560, 820, 800, 40, '#5a3a22', { r: 4 }); box(g, 580, 860, 760, 100, '#4a3020', { r: 4 });
  },
  // вокзал/автобус по Китаю: дорога и автобус
  road: (g, t, o) => {
    T.sky(g, o.night ? NIGHT : DAY); if (!o.night) clouds(g, t); hills(g, 640, o.south ? '#4a8a4a' : '#8a9a6a', 90, 22); ground(g, 820, '#8a8a7a'); g.fillStyle = '#5a5a5a'; g.fillRect(-1500, 820, 5000, 160); for (let i = 0; i < 14; i++) box(g, ((i * 180 - t * 300) % 2600 + 2600) % 2600 - 300, 892, 90, 14, '#f2f2f2', { r: 2, lw: 0, grad: false });
    if (o.bus !== false) { const bx = 960 + Math.sin(t * 0.6) * 10; box(g, bx - 330, 620, 660, 230, '#3a7ad9', { r: 30 }); for (let i = 0; i < 6; i++) box(g, bx - 290 + i * 100, 650, 80, 80, '#bfe0ef', { r: 8, lw: 4 }); [bx - 200, bx + 200].forEach((x) => { ell(g, x, 860, 46, 46, '#2a2a2a', 5); ell(g, x, 860, 14, 14, '#9a9a9a', 3); }); }
    if (o.night) T.dim(g, 0.3, '#000018');
  },
  // стадион с массовыми играми: трибуна-мозаика
  stadium: (g, t, o, info) => {
    T.sky(g, o.night ? NIGHT : DAY); box(g, -100, 140, 2120, 660, '#8a8a92', { r: 2 });
    const pics = o.pics || ['sun', 'flower', 'wave']; const ph = Math.floor((t / (o.flip || 1.4)) % pics.length); const pic = pics[ph];
    const cw = 32, chh = 28, nx = 60, ny = 22;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const u = i / nx, v = j / ny; let col = '#f2f2f2';
      if (pic === 'sun') { const d = Math.hypot(u - 0.5, (v - 0.55) * 0.6); col = d < 0.12 ? '#f2c037' : d < 0.2 && Math.floor(Math.atan2(v - 0.55, u - 0.5) * 6) % 2 ? '#f2a03a' : v > 0.8 ? '#3a8ad9' : '#bfe0ef'; }
      else if (pic === 'flower') { const d = Math.hypot(u - 0.5, (v - 0.45) * 0.6); col = d < 0.06 ? '#f2c037' : d < 0.16 && Math.cos(Math.atan2(v - 0.45, u - 0.5) * 5) > 0 ? '#e84a7a' : u > 0.49 && u < 0.51 && v > 0.5 ? '#3aa84a' : '#fdf0e0'; }
      else { col = Math.sin(u * 14 + t * 2) * 0.15 + 0.5 > v ? '#3a8ad9' : '#e8f4ff'; }
      box(g, -60 + i * cw, 170 + j * chh, cw - 3, chh - 3, col, { r: 1, lw: 0, grad: false }); }
    box(g, -100, 800, 2120, 40, '#5a5a62', { r: 2 }); ground(g, 840, '#4a9a4a');
    if (o.night) T.dim(g, 0.15, '#000018');
  },
});
for (const k of Object.keys(SETS)) SETS[k].gy = 930;

// ------------------------------------------------------------------ ПРЕДМЕТЫ
Object.assign(PROPS, {
  // папка-досье: o.name (подпись), o.open, o.stamp
  folder: (g, p, t, k) => { const w = p.w || 520, h = p.h || 380; g.rotate(p.r2 ?? -0.03); box(g, -w / 2, -h / 2 - 30, w * 0.36, 60, '#c9a46a', { r: 10 }); box(g, -w / 2, -h / 2, w, h, '#d8b878', { r: 8 });
    if (p.name) hand(g, p.name, 0, -h / 2 + 80, { size: p.size || 54, color: '#5a3a1a' }); for (let i = 0; i < 3; i++) line(g, [[-w / 2 + 60, -h / 2 + 150 + i * 56], [w / 2 - 60 - (i % 2) * 60, -h / 2 + 150 + i * 56]], 5, 'rgba(90,60,26,.45)');
    (p.lines || []).forEach((s, i) => hand(g, s, -w / 2 + 50, -h / 2 + 150 + i * 60, { size: 40, color: (p.colors || [])[i] || '#3a2a1a', align: 'left' }));
    if (p.stamp) { const sw = Math.max(260, p.stamp.length * 29 + 50); g.save(); g.translate(Math.min(w / 4, w / 2 - sw / 2 - 20), h / 4); g.rotate(-0.25); g.globalAlpha = 0.85 * clamp(k * 2); box(g, -sw / 2, -46, sw, 92, null, { r: 10, lw: 7, grad: false }); g.strokeStyle = p.stampCol || '#c8322a'; g.lineWidth = 7; g.strokeRect(-sw / 2, -46, sw, 92); hand(g, p.stamp, 0, 10, { size: 52, color: p.stampCol || '#c8322a' }); g.restore(); }
    if (p.lock) { box(g, -40, h / 2 - 90, 80, 64, '#8a8a92', { r: 8 }); g.beginPath(); g.arc(0, h / 2 - 90, 28, Math.PI, 0); g.lineWidth = 10; g.strokeStyle = OL; g.stroke(); } },
  frameEmpty: (g, p) => emptyFrame(g, 0, 0, p.w || 150, p.h || 190),
  speaker: (g, p, t) => { box(g, -65, -75, 130, 150, '#6a5a4a', { r: 10 }); for (let i = 0; i < 5; i++) line(g, [[-45, -45 + i * 22], [45, -45 + i * 22]], 4, '#3a3028'); if (p.song !== false) for (let i = 0; i < 3; i++) { const q = (t * 0.8 + i / 3) % 1; g.save(); g.globalAlpha = 1 - q; hand(g, '♪', 90 + q * 120, -40 - q * 80 + i * 10, { size: 54, color: p.nc || '#f2c037' }); g.restore(); } if (p.knob) { ell(g, 0, 100, 26, 26, '#3a3a3a', 4); line(g, [[0, 100], [0, 80]], 4, '#f2f2f2'); hand(g, p.knob, 0, 160, { size: 36, color: p.kc || '#fff' }); } },
  radio: (g, p, t) => { box(g, -200, -120, 400, 240, '#8a5a3a', { r: 20 }); box(g, -170, -90, 200, 180, '#c9b48a', { r: 10, lw: 4 }); for (let i = 0; i < 6; i++) line(g, [[-160, -70 + i * 28], [20, -70 + i * 28]], 3, '#6a4a2a'); ell(g, 110, -30, 44, 44, '#3a3a3a', 5); line(g, [[110, -30], [110, -66]], 6, '#f2f2f2'); ell(g, 110, 60, 22, 22, '#3a3a3a', 4);
    if (p.seal) { box(g, 70, -90, 80, 120, 'rgba(200,50,40,.0)', { r: 4, lw: 0, grad: false }); line(g, [[60, -60], [160, 0]], 10, '#c8322a'); ell(g, 110, -30, 18, 18, '#c8322a', 3); } },
  redtie: (g, p) => { poly(g, [[-150, -40], [150, -40], [40, 30], [0, 60], [-40, 30]], '#d8281e', 5); poly(g, [[-30, 20], [30, 20], [60, 180], [10, 170]], '#c8201a', 5); poly(g, [[-30, 20], [30, 20], [-20, 190], [-60, 160]], '#d8281e', 5); ell(g, 0, 20, 36, 26, '#e83a2a', 5); },
  candy: (g, p) => { box(g, -120, -160, 240, 260, '#f2e2c8', { r: 18 }); poly(g, [[-120, -160], [120, -160], [80, -210], [-80, -210]], '#e8d2b0'); line(g, [[-60, -200], [60, -200]], 6, '#d8281e'); [[-60, -60, '#e84a7a'], [10, -90, '#3a8ad9'], [60, -20, '#f2c037'], [-30, 20, '#3aa84a'], [40, 50, '#e86a3a']].forEach(([x, y, c]) => { ell(g, x, y, 26, 18, c, 4); poly(g, [[x - 26, y], [x - 46, y - 14], [x - 46, y + 14]], c, 3); poly(g, [[x + 26, y], [x + 46, y - 14], [x + 46, y + 14]], c, 3); }); },
  cabbage: (g, p) => { ell(g, 0, 0, 70, 54, '#b8d878', 5); ell(g, -16, -10, 34, 40, '#e8f0c0', 4); line(g, [[0, -50], [10, 40]], 4, '#8ab85a'); },
  bucket: (g, p) => { g.translate(0, 150); poly(g, [[-60, -100], [60, -100], [46, 0], [-46, 0]], '#8a9aa8', 5); g.beginPath(); g.arc(0, -100, 60, Math.PI, 0); g.lineWidth = 5; g.strokeStyle = OL; g.stroke(); if (p.water) ell(g, 0, -96, 56, 10, '#6ab0e0', 3); },
  shovel: (g, p) => { g.translate(70, 0); g.rotate(-0.35); line(g, [[0, -60], [0, 240]], 12, '#8a6a3a'); poly(g, [[-40, 240], [40, 240], [30, 330], [0, 350], [-30, 330]], '#9aa0a8', 5); },
  sdcard: (g, p, t) => { poly(g, [[-60, -80], [30, -80], [60, -50], [60, 80], [-60, 80]], p.col || '#2a2a33', 5); for (let i = 0; i < 4; i++) box(g, -46 + i * 26, -70, 16, 34, '#f2c037', { r: 2, lw: 2 }); hand(g, p.label || '', 0, 30, { size: 34, color: '#fff' }); },
  usb: (g, p) => { box(g, -90, -40, 150, 80, p.col || '#3a7ad9', { r: 14 }); box(g, 60, -26, 60, 52, '#c8ccd0', { r: 4 }); box(g, 80, -14, 14, 10, '#3a3a3a', { r: 1, lw: 0 }); box(g, 80, 4, 14, 10, '#3a3a3a', { r: 1, lw: 0 }); },
  mobile: (g, p, t) => T.phone(g, 0, 0, p.s2 || 0.6, (g) => { g.fillStyle = p.screen || '#e8f0ff'; g.fillRect(-104, -200, 208, 400); (p.lines || []).forEach((s, i) => hand(g, s, 0, -120 + i * 60, { size: 40, color: (p.colors || [])[i] || OL })); if (p.cross) { line(g, [[-60, -60], [60, 60]], 14, C.red); line(g, [[60, -60], [-60, 60]], 14, C.red); } }),
  bike: (g, p) => { const W = (x) => { ell(g, x, 0, 70, 70, null, 7); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; line(g, [[x, 0], [x + Math.cos(a) * 66, Math.sin(a) * 66]], 2); } }; W(-130); W(130); line(g, [[-130, 0], [-20, -110], [100, -110], [130, 0]], 8, '#c8322a'); line(g, [[-20, -110], [0, 0], [100, -110]], 8, '#c8322a'); line(g, [[100, -110], [110, -160]], 7); line(g, [[90, -160], [140, -160]], 8); box(g, -60, -140, 80, 16, '#3a3a3a', { r: 4 });
    if (p.plate) { box(g, -230, -60, 110, 60, '#f6f6f0', { r: 6, lw: 4 }); hand(g, p.plate, -175, -26, { size: 30 }); } },
  coinBig: (g, p, t) => { const sp = p.spin ? Math.cos(t * (p.spin || 6)) : 1; g.scale(Math.abs(sp) * 0.95 + 0.05, 1); T.coin(g, 0, 0, p.r || 150, sp > 0 ? C.gold : '#c9a14a', { sym: sp > 0 ? (p.a || '?') : (p.b || '?') }); },
  stall: (g, p) => { box(g, -200, -20, 400, 40, '#8a6a4a', { r: 4 }); box(g, -190, 20, 20, 120, '#6a4a2a'); box(g, 170, 20, 20, 120, '#6a4a2a'); (p.goods || ['#f2c84a', '#e86a3a', '#6ab84a', '#d8e8f0', '#f2ead8']).forEach((c, i) => ell(g, -150 + i * 75, -44, 30, 24, c, 4)); },
  blanket: (g, p) => { poly(g, [[-220, 0], [220, 0], [190, -60], [-190, -60]], '#b84a4a', 5); for (let i = 0; i < 5; i++) ell(g, -140 + i * 70, -66, 26, 16, ['#e8c06a', '#c8a050', '#6a4a2a', '#e8c06a', '#c8902a'][i], 4); },
  soup: (g, p, t) => { ell(g, 0, 0, 140, 50, '#d8d0c0', 5); ell(g, 0, -10, 120, 34, '#7a9a4a', 0); for (let i = 0; i < 5; i++) line(g, [[-80 + i * 40, -16], [-60 + i * 40, -4]], 5, '#3a6a2a'); T.smoke(g, 0, -40, t, 3, 0.4); },
  wages: (g, p) => { box(g, -160, -90, 320, 180, '#c8d8b8', { r: 8 }); hand(g, p.text || 'зарплата', 0, -20, { size: 46 }); hand(g, p.val || '', 0, 46, { size: 52, color: '#3a6a2a' }); },
  rice: (g, p) => { poly(g, [[-120, 0], [120, 0], [90, -200], [-90, -200]], '#f2ead8', 5); g.beginPath(); g.moveTo(-90, -200); g.quadraticCurveTo(0, -260, 90, -200); T.fo(g, '#f2ead8', 5); hand(g, p.text || 'рис 1 кг', 0, -100, { size: 40 }); },
  bigFolder: (g, p, t, k) => PROPS.folder(g, { ...p, w: 900, h: 620, size: 80 }, t, k),
  barbed: (g, p) => { for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = -600; x <= 600; x += 18) g.lineTo(x, k * 30 + Math.sin(x * 0.3) * 6); g.lineWidth = 3; g.strokeStyle = '#7a7a7a'; g.stroke(); } },
  trio: (g, p, t, k) => { const items = [['основная', '#3aa84a'], ['колеблющаяся', '#e8b83a'], ['враждебная', '#c8423a']]; items.forEach(([s, c], i) => { if (k * 3 < i * 0.9) return; const x = (i - 1) * 520; box(g, x - 220, -150, 440, 300, c, { r: 16 }); hand(g, s, x, 0, { size: 58, color: '#fff' }); hand(g, String(i + 1), x, -90, { size: 60, color: 'rgba(255,255,255,.7)' }); }); },
  arrowDown: (g, p) => { poly(g, [[-40, -120], [40, -120], [40, 0], [90, 0], [0, 110], [-90, 0], [-40, 0]], p.col || C.red, 5); },
});
Object.assign(PROPS, {
  baby: (g, p, t) => { ell(g, 0, 0, 120, 80, '#f2ead8', 5); ell(g, -8, 6, 90, 56, '#e8dcc4', 0); ell(g, 70, -20, 58, 56, '#f6dcc0', 5); ell(g, 58, -26, 5, 4, OL, 0); ell(g, 84, -26, 5, 4, OL, 0); g.beginPath(); g.arc(72, -8, 9, 0.2, Math.PI - 0.2); g.lineWidth = 3; g.strokeStyle = OL; g.stroke(); ell(g, 52, -10, 9, 5, 'rgba(240,120,120,.4)', 0); ell(g, 92, -10, 9, 5, 'rgba(240,120,120,.4)', 0); line(g, [[-60, -20], [-20, 40]], 3, 'rgba(0,0,0,.15)'); },
  logs: (g, p) => { g.translate(0, 70); for (let i = 0; i < 4; i++) { const x = (i % 2) * 60 - 30, y = -Math.floor(i / 2) * 44; box(g, x - 90, y - 20, 180, 40, '#8a5a32', { r: 18 }); ell(g, x + 90, y, 18, 20, '#d8a868', 4); } },
  heart: (g, p, t) => { const s = 1 + Math.sin(t * 5) * 0.06; g.scale(s, s); g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(-90, -20, -50, -90, 0, -50); g.bezierCurveTo(50, -90, 90, -20, 0, 40); T.fo(g, p.col || '#e84a6a', 5); },
  flowers: (g, p) => { line(g, [[0, 0], [-20, -120]], 5, '#3a8a3a'); line(g, [[0, 0], [20, -130]], 5, '#3a8a3a'); line(g, [[0, 0], [0, -140]], 5, '#3a8a3a'); [[-20, -130, '#e84a6a'], [20, -140, '#f2c037'], [0, -150, '#e86a3a']].forEach(([x, y, c]) => ell(g, x, y, 22, 22, c, 4)); },
  passport: (g, p) => { box(g, -130, -180, 260, 360, p.col || '#2a3a7a', { r: 12 }); ell(g, 0, -30, 50, 50, null, 5); hand(g, p.text || 'паспорт', 0, 90, { size: 40, color: '#f2c037' }); },
  key: (g, p) => { ell(g, -80, 0, 44, 44, '#e8c060', 6); ell(g, -80, 0, 16, 16, '#fbf6ea', 4); box(g, -40, -10, 160, 20, '#e8c060', { r: 4 }); box(g, 80, 10, 16, 30, '#e8c060', { r: 2 }); box(g, 104, 10, 16, 22, '#e8c060', { r: 2 }); },
  signal: (g, p, t) => { for (let i = 0; i < 3; i++) { const q = (t * 0.9 + i / 3) % 1; g.save(); g.globalAlpha = 1 - q; g.beginPath(); g.arc(0, 0, 40 + q * 160, -2.4, -0.7); g.lineWidth = 8; g.strokeStyle = p.col || '#5fd35a'; g.stroke(); g.restore(); } },
});
SETS.metro = (g, t, o) => { T.sky(g, ['#3a2a2a', '#6a4a3a']); g.fillStyle = '#5a3a2a'; g.fillRect(-1500, -1500, 5000, 5000);
  g.beginPath(); g.moveTo(-200, 1200); g.lineTo(-200, 200); g.quadraticCurveTo(960, -300, 2120, 200); g.lineTo(2120, 1200); g.closePath(); T.fo(g, '#e8d8b0', 5);
  for (let i = 0; i < 7; i++) { const x = 160 + i * 270; ell(g, x, 170 + Math.abs(i - 3) * 30, 50, 30, '#fff6d0', 4); light(g, x, 190 + Math.abs(i - 3) * 30, 260, '#ffe9a0', 0.4); }
  poly(g, [[300, 1100], [700, 1100], [1500, 300], [1300, 300]], '#8a8a92'); for (let i = 0; i < 20; i++) { const k = ((i / 20) + t * 0.05) % 1; line(g, [[300 + k * 1000, 1100 - k * 800], [700 + k * 800, 1100 - k * 800]], 3, '#5a5a62'); }
  line(g, [[300, 1100], [1300, 300]], 12, '#3a3a3a'); line(g, [[700, 1100], [1500, 300]], 12, '#3a3a3a');
  ground(g, 1000, '#a89a80'); hand(g, o.label || '', 1600, 600, { size: 60, color: '#5a3a2a' }); };
SETS.metro.gy = 930;
