// ww3sets.js — фоны и предметы для «Третьей мировой» (мультяшный стиль, мир 1920×1080, пол ≈ y 930).
import { E, ease, clamp, lerp, noise, shade, alpha, rng } from '/engine/core.js';
import * as T from '../toon.js';
import { box, ell, poly, line, limb, light, hand, tag, coin, C, OL } from '../toon.js';
import { SETS } from './sets.js';
import { PROPS, tm } from './stage.js';
import { GEO } from '../geo.js';

const NIGHT = ['#0e1430', '#1c2656', '#2e3470'], DAY = ['#86c8ea', '#cfe9f2', '#f8e6bc'];
const ground = (g, y, col, lw = 5) => { g.fillStyle = T.vgrad(g, y, 400, col, 0.1); g.fillRect(-1500, y, 5000, 1500); line(g, [[-1500, y], [3500, y]], lw); };
const stars = (g, t, n = 120, a = 0.9) => { const r = rng(3); for (let i = 0; i < n; i++) { const x = r() * 2400 - 240, y = r() * 1300 - 120, s = 1.5 + r() * 2.5; ell(g, x, y, s, s, `rgba(255,255,240,${a * (0.5 + 0.5 * Math.sin(t * 2 + i))})`, 0); } };
const k01 = (t, a, b) => clamp((t - a) / Math.max(1e-3, b - a));

// ================================================================== КАРТА МИРА
// o.view=[lon0,lat0,lon1,lat1]; o.hl={ISO:'#col'}; o.style 'dark'|'paper'; o.arcs=[[lon,lat,lon,lat,col,at,dur]]; o.pins=[[lon,lat,label,at,col]];
// o.lines=[[[lon,lat],...], col, at, dur]; o.labels=[[lon,lat,text,size,col]]; o.pulse=[[lon,lat,r,col,at]]; o.night=true — огни
export function proj(o) {
  const v = o.view || [-170, -58, 190, 80]; const midLat = (v[1] + v[3]) / 2, c = Math.cos(midLat * Math.PI / 180);
  const kx = E.W / ((v[2] - v[0]) * c), ky = E.H / (v[3] - v[1]), k = o.contain ? Math.min(kx, ky) : Math.max(kx, ky);
  const cx = (v[0] + v[2]) / 2, cy = midLat;
  return (lon, lat) => [E.W / 2 + (lon - cx) * c * k, E.H / 2 - (lat - cy) * k];
}
function drawWorld(g, o, t, info) {
  const pr = proj(o), dark = o.style !== 'paper';
  const sea = o.sea || (dark ? '#1b2944' : '#cfe2e8'), land = o.land || (dark ? '#56627a' : '#e8d8b0'), edge = dark ? 'rgba(170,190,220,.45)' : 'rgba(120,90,50,.55)';
  g.fillStyle = sea; g.fillRect(-1500, -1500, 5000, 5000);
  if (dark) { g.save(); g.strokeStyle = 'rgba(120,150,200,.10)'; g.lineWidth = 2; for (let lo = -180; lo <= 180; lo += 15) { const a = pr(lo, -80), b = pr(lo, 85); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } for (let la = -75; la <= 85; la += 15) { const a = pr(-200, la), b = pr(200, la); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } g.restore(); }
  const hl = o.hl || {}; const hlA = o.hlAt != null ? k01(t, tm(info, o.hlAt, 0), tm(info, o.hlAt, 0) + 0.6) : 1;
  for (const iso in GEO) { const col = hl[iso]; for (const ring of GEO[iso]) { g.beginPath(); ring.forEach(([lo, la], i) => { const [x, y] = pr(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
    g.fillStyle = col ? lerpCol(land, col, hlA) : (o.dimOthers && Object.keys(hl).length ? shade(land, -0.18) : land); g.fill(); g.strokeStyle = col ? alpha('#ffffff', 0.7) : edge; g.lineWidth = col ? 3 : 1.4; g.stroke(); } }
  if (o.night) { const r = rng(11); for (let i = 0; i < 260; i++) { const iso = Object.keys(GEO)[Math.floor(r() * 183)]; const ring = GEO[iso][0]; const p = ring[Math.floor(r() * ring.length)]; const [x, y] = pr(p[0], p[1]); ell(g, x + r() * 10, y + r() * 10, 2.5, 2.5, `rgba(255,214,120,${0.5 + 0.5 * Math.sin(t * 3 + i)})`, 0); } }
  (o.lines || []).forEach(([pts, col, at, dur, w]) => { const a = tm(info, at ?? 0, 0), k = k01(t, a, a + (dur || 1.5)); if (k <= 0) return; T.dashed(g, pts.map(([lo, la]) => pr(lo, la)), k, col || C.red, w || 7); });
  (o.arcs || []).forEach(([lo0, la0, lo1, la1, col, at, dur, h], i) => { const a = tm(info, at ?? 0, 0), k = k01(t, a, a + (dur || 1.6)); if (k <= 0) return; const p0 = pr(lo0, la0), p1 = pr(lo1, la1); const mx = (p0[0] + p1[0]) / 2, my = Math.min(p0[1], p1[1]) - (h ?? Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) * 0.35);
    const pts = []; const n = Math.max(2, Math.ceil(40 * ease.inOut(k))); for (let j = 0; j <= n; j++) { const u = j / 40; pts.push([(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * mx + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * my + u * u * p1[1]]); }
    line(g, pts, 11, 'rgba(0,0,0,.35)'); line(g, pts, 6, col || '#ff4a3a'); const hd = pts[pts.length - 1]; light(g, hd[0], hd[1], 60, col || '#ff4a3a', 0.6); ell(g, hd[0], hd[1], 9, 9, '#fff', 3); });
  (o.pulse || []).forEach(([lo, la, r, col, at]) => { const a = tm(info, at ?? 0, 0); if (t < a) return; const [x, y] = pr(lo, la); for (let j = 0; j < 3; j++) { const u = ((t - a) * 0.8 + j / 3) % 1; g.save(); g.globalAlpha = 1 - u; ell(g, x, y, (r || 60) * u, (r || 60) * u, null, 5); g.strokeStyle = col || '#ff4a3a'; g.lineWidth = 5; g.stroke(); g.restore(); } ell(g, x, y, 10, 10, col || '#ff4a3a', 3); });
  (o.labels || []).forEach(([lo, la, s, size, col, at]) => { if (at != null && t < tm(info, at, 0)) return; const [x, y] = pr(lo, la); hand(g, s, x, y, { size: size || 44, color: col || (dark ? 'rgba(235,240,250,.9)' : 'rgba(90,60,30,.85)') }); });
  (o.pins || []).forEach(([lo, la, s, at, col]) => { const a = tm(info, at ?? 0.2, 0.2); if (t < a) return; const [x, y] = pr(lo, la); const k = T.pop(t, a); g.save(); g.translate(x, y); g.scale(k, k); ell(g, 0, 0, 13, 13, col || C.red, 4); if (s) tag(g, s, 0, -56, 1, { size: 40, noPop: true }); g.restore(); });
}
function lerpCol(a, b, k) { const pa = hex(a), pb = hex(b); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`; }
function hex(c) { if (c[0] !== '#') return [128, 128, 128]; const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
SETS.world = (g, t, o, info) => drawWorld(g, o, t, info);

// ================================================================== ФОНЫ
Object.assign(SETS, {
  // бункер под Москвой, 1983: стена-экран, пульты
  bunker: (g, t, o, info) => {
    T.wallRoom(g, { wall: '#2f3d36', floor: '#2a2622', fy: 800 });
    for (let i = 0; i < 9; i++) line(g, [[-200 + i * 260, 0], [-200 + i * 260, 800]], 3, 'rgba(0,0,0,.18)');
    box(g, 360, 90, 1200, 440, '#0f1a14', { r: 10 }); box(g, 344, 74, 1232, 472, null, { r: 12, lw: 14, grad: false });
    g.save(); g.beginPath(); g.rect(360, 90, 1200, 440); g.clip(); drawWorld(g, { view: [-140, 15, 60, 75], sea: '#0c1a12', land: '#1f4a2e', ...o.mapO }, t, info); g.restore();
    if (o.alarm || (o.alarmAt != null && t >= tm(info, o.alarmAt, 0))) { const on = Math.sin(t * 9) > 0; box(g, 690, 210, 540, 160, on ? '#d8281e' : '#6a1410', { r: 10, lw: 6 }); hand(g, o.word || 'СТАРТ', 960, 292, { size: 110, color: '#fff' }); light(g, 960, 290, 700, '#ff3020', on ? 0.45 : 0.15); }
    for (let i = 0; i < 4; i++) { const x = 140 + i * 430; box(g, x, 640, 370, 160, '#5a6a5e', { r: 8 }); box(g, x + 20, 650, 330, 50, '#3a4a40', { r: 4, lw: 3 }); for (let j = 0; j < 8; j++) ell(g, x + 45 + j * 40, 676, 9, 9, ['#ff5040', '#ffd040', '#60e070'][(j + i) % 3], 2); }
    if (o.lamp !== false) { line(g, [[960, 0], [960, 30]], 4); light(g, 960, 30, 500, '#fff2c0', 0.15); }
    if (o.red) T.dim(g, 0.25, '#5a0000');
  },
  // космос: звёзды + край Земли
  orbit: (g, t, o) => { T.sky(g, ['#03050f', '#0a1030']); stars(g, t); const R = 2200, cx = o.ex ?? 960, cy = (o.ey ?? 1050) + R; g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); const gr = g.createRadialGradient(cx, cy - R, 10, cx, cy, R); gr.addColorStop(0, '#5aa0e0'); gr.addColorStop(0.5, '#2a5a9a'); gr.addColorStop(1, '#0a2050'); g.fillStyle = gr; g.fill(); g.clip(); const r = rng(5); for (let i = 0; i < 9; i++) ell(g, cx - 900 + r() * 1800, cy - R + 40 + r() * 140, 140 + r() * 120, 30, 'rgba(255,255,255,.55)', 0); if (o.night) { for (let i = 0; i < 80; i++) ell(g, cx - 1000 + r() * 2000, cy - R + 30 + r() * 200, 3, 3, '#ffd77a', 0); } g.restore(); g.save(); g.beginPath(); g.arc(cx, cy, R + 4, 0, Math.PI * 2); g.lineWidth = 18; g.strokeStyle = 'rgba(120,200,255,.35)'; g.stroke(); g.restore(); },
  // морское дно
  seabed: (g, t, o) => { T.sky(g, ['#0f5a7a', '#0a3a5a', '#06223a']); g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(160,220,255,.06)'; g.beginPath(); g.moveTo(200 + i * 320 + Math.sin(t + i) * 40, -50); g.lineTo(80 + i * 320, 1100); g.lineTo(220 + i * 320, 1100); g.closePath(); g.fill(); } g.restore();
    g.beginPath(); g.moveTo(-500, 1200); g.lineTo(-500, 860); for (let x = -500; x <= 2500; x += 80) g.lineTo(x, 860 + Math.sin(x * 0.004) * 30); g.lineTo(2500, 1200); g.closePath(); T.fo(g, '#c9b27a'); [[200, 880], [1500, 900], [900, 920]].forEach(([x, y], i) => ell(g, x, y, 90 - i * 20, 46, '#7a7a6a'));
    for (let i = 0; i < 5; i++) { const x = (i * 400 + t * (30 + i * 8)) % 2300 - 200, y = 300 + i * 90; ell(g, x, y, 34, 16, ['#f2a03a', '#e8d84a', '#7ad0e0'][i % 3], 3); poly(g, [[x - 30, y], [x - 56, y - 16], [x - 56, y + 16]], ['#f2a03a', '#e8d84a', '#7ad0e0'][i % 3], 3); ell(g, x + 18, y - 4, 4, 4, OL, 0); }
    for (let i = 0; i < 14; i++) { const k = ((t * 0.3 + i / 14) % 1); ell(g, 300 + i * 110 + Math.sin(t + i) * 10, 860 - k * 900, 6, 6, 'rgba(200,240,255,.5)', 2); } },
  // гора Шайенн
  mountain: (g, t, o) => { T.sky(g, o.night ? NIGHT : DAY); if (o.night) stars(g, t, 80); g.beginPath(); g.moveTo(-500, 1200); g.lineTo(-500, 760); g.lineTo(200, 380); g.lineTo(520, 520); g.lineTo(900, 170); g.lineTo(1280, 460); g.lineTo(1600, 300); g.lineTo(2400, 800); g.lineTo(2400, 1200); g.closePath(); T.fo(g, '#8a8580'); poly(g, [[900, 170], [820, 250], [870, 240], [910, 280], [960, 230], [1000, 250]], '#f4f4f4', 4);
    for (let i = 0; i < 12; i++) line(g, [[300 + i * 120, 600 + (i % 3) * 40], [340 + i * 120, 680 + (i % 2) * 50]], 4, 'rgba(0,0,0,.2)');
    g.beginPath(); g.moveTo(760, 930); g.lineTo(760, 700); g.arc(960, 700, 200, Math.PI, 0); g.lineTo(1160, 930); g.closePath(); T.fo(g, '#2a2622'); if (o.door) { ell(g, 960, 760, 150, 150, '#9aa0a8', 8); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ell(g, 960 + Math.cos(a) * 118, 760 + Math.sin(a) * 118, 12, 12, '#6a7078', 4); } ell(g, 960, 760, 50, 50, '#7a8088', 6); }
    ground(g, 930, '#6a7a5a'); line(g, [[860, 930], [700, 1100]], 6, '#5a5a5a'); line(g, [[1060, 930], [1220, 1100]], 6, '#5a5a5a'); },
  // отель «Гринбрайер»
  hotel: (g, t, o) => { T.sky(g, DAY); for (let i = 0; i < 4; i++) ell(g, ((i * 520 + t * 15) % 2400) - 200, 150 + (i % 2) * 60, 120, 28, 'rgba(255,255,255,.85)', 0);
    box(g, 160, 330, 1600, 600, '#f6f3ec', { r: 2 }); box(g, 140, 300, 1640, 50, '#e6e0d4', { r: 2 }); poly(g, [[620, 300], [1300, 300], [960, 140]], '#f6f3ec'); for (let i = 0; i < 7; i++) box(g, 640 + i * 100, 300, 44, 630, '#ffffff', { r: 2 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { box(g, 200 + c * 100, 380 + r * 130, 56, 80, '#4a6a8a', { r: 2, lw: 3 }); box(g, 1340 + c * 100, 380 + r * 130, 56, 80, '#4a6a8a', { r: 2, lw: 3 }); }
    ground(g, 930, '#6ab04a'); for (let i = 0; i < 10; i++) ell(g, 120 + i * 190, 925, 60, 40, '#4a8a3a'); if (o.under) { g.fillStyle = '#4a3a2a'; g.fillRect(-500, 960, 3000, 400); box(g, 560, 980, 800, 90, '#7a7a72', { r: 4 }); hand(g, 'БУНКЕР', 960, 1028, { size: 54, color: '#fff' }); } },
  // командный центр (NORAD)
  command: (g, t, o, info) => { T.wallRoom(g, { wall: '#1c2230', floor: '#14161c', fy: 820 }); box(g, 200, 70, 1520, 520, '#0a0f1a', { r: 8 }); g.save(); g.beginPath(); g.rect(200, 70, 1520, 520); g.clip(); drawWorld(g, { view: [-170, 0, 190, 80], sea: '#08121e', land: '#203a5a', ...o.mapO }, t, info); g.restore(); box(g, 186, 56, 1548, 548, null, { r: 10, lw: 14, grad: false });
    if (o.num != null) { box(g, 760, 200, 400, 240, 'rgba(10,15,26,.85)', { r: 8, lw: 4 }); hand(g, String(o.num), 960, 340, { size: 160, color: o.numCol || '#ff5a3a' }); }
    for (let i = 0; i < 5; i++) { const x = 60 + i * 380; box(g, x, 700, 340, 120, '#3a4456', { r: 6 }); box(g, x + 40, 640, 120, 80, '#0f1a2a', { r: 4, lw: 4 }); line(g, [[x + 60, 690], [x + 90, 670], [x + 120, 684], [x + 140, 660]], 3, '#5fd35a'); }
    if (o.alarm) { const on = Math.sin(t * 9) > 0; T.dim(g, on ? 0.28 : 0.1, '#7a0000'); } if (o.night) T.dim(g, 0.25, '#000010'); },
  // внутри подлодки
  sub: (g, t, o) => { T.wallRoom(g, { wall: '#3a4038', floor: '#2a2a26', fy: 820 }); g.beginPath(); g.ellipse(960, 300, 1200, 520, 0, Math.PI, 0); g.lineTo(2400, -200); g.lineTo(-500, -200); g.closePath(); T.fo(g, '#2a2e2a');
    for (let i = 0; i < 6; i++) limb(g, [[-100, 160 + i * 34], [2100, 150 + i * 34]], 14, ['#7a6a4a', '#5a6a6a', '#8a4a3a'][i % 3]);
    for (let i = 0; i < 6; i++) { const x = 160 + i * 300; ell(g, x, 520, 50, 50, '#e8e2d0', 6); line(g, [[x, 520], [x + Math.cos(t + i) * 34, 520 + Math.sin(t + i) * 34]], 5, C.red); }
    box(g, 120, 640, 1680, 40, '#5a5a52', { r: 4 }); if (o.red !== false) T.dim(g, 0.28, '#6a0a00'); if (o.hot) { g.save(); g.globalAlpha = 0.12; for (let i = 0; i < 8; i++) { g.fillStyle = '#ffb060'; g.fillRect(0, (i * 140 + t * 60) % 1100, 1920, 30); } g.restore(); } },
  // Хиросима
  hiroshima: (g, t, o) => { T.sky(g, o.bloom ? ['#9ad0ea', '#f2e0c8'] : ['#9a8a7a', '#c8b8a0']); ground(g, 860, o.bloom ? '#8a7a5a' : '#7a6a58');
    const r = rng(7); for (let i = 0; i < 9; i++) { const x = -60 + i * 230, h = 120 + r() * 220; poly(g, [[x, 860], [x, 860 - h], [x + 40, 860 - h + 30], [x + 80, 860 - h - 20], [x + 140, 860 - h + 40], [x + 180, 860]], '#a89a88'); for (let j = 0; j < 3; j++) box(g, x + 30 + j * 46, 860 - h + 70, 28, 40, '#3a3230', { r: 2, lw: 3 }); }
    const dx = 1280; box(g, dx - 160, 520, 320, 340, '#b8aa96', { r: 2 }); g.beginPath(); g.moveTo(dx - 110, 520); g.arc(dx, 520, 110, Math.PI, 0); g.lineWidth = 10; g.strokeStyle = OL; g.stroke(); for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6; line(g, [[dx, 520], [dx + Math.cos(a) * 110, 520 + Math.sin(a) * 110]], 5); } for (let j = 0; j < 4; j++) box(g, dx - 130 + j * 70, 600, 40, 70, '#3a3230', { r: 2, lw: 3 });
    if (o.bloom) for (let i = 0; i < 7; i++) { const x = 120 + i * 270; ell(g, x, 840, 90, 60, '#4a8a3a'); for (let j = 0; j < 9; j++) ell(g, x - 60 + (j * 37) % 120, 810 + (j * 23) % 50, 13, 13, '#f28ab0', 3); }
    if (o.rails !== false) { g.fillStyle = '#6a5a4a'; g.fillRect(-500, 930, 3000, 200); line(g, [[-500, 960], [2500, 960]], 6, '#3a3a3a'); line(g, [[-500, 1040], [2500, 1040]], 6, '#3a3a3a'); } },
  // лес (Чернобыль): o.red — рыжий лес, o.snow
  forest: (g, t, o) => { T.sky(g, o.night ? NIGHT : o.dusk ? ['#5a4a6a', '#e3986a'] : DAY); if (o.night) stars(g, t, 80); ground(g, 900, o.snow ? '#e8eef2' : '#6a9a4a'); const r = rng(4); if (o.night) { /* затемнение ниже */ } for (let i = 0; i < 26; i++) { const x = -100 + i * 85 + r() * 30, h = 260 + r() * 260, y = 900 - (i % 3) * 20; box(g, x - 10, y - h * 0.4, 20, h * 0.4, '#6a4a2a', { r: 2, lw: 3 }); const col = o.red && i % 4 !== 0 ? ['#c8642a', '#a84a1e', '#d8823a'][i % 3] : ['#3a7a3a', '#2f6a34', '#4a8a3a'][i % 3]; poly(g, [[x - 80, y - h * 0.35], [x + 80, y - h * 0.35], [x, y - h]], col, 4); poly(g, [[x - 66, y - h * 0.6], [x + 66, y - h * 0.6], [x, y - h * 1.08]], shade(col, 0.08), 4); }
    if (o.plant) { box(g, 1300, 560, 420, 340, '#b8b0a0', { r: 2 }); box(g, 1440, 360, 70, 200, '#d0c8b8', { r: 2 }); line(g, [[1440, 400], [1510, 400]], 8, '#c8322a'); line(g, [[1440, 460], [1510, 460]], 8, '#c8322a'); } if (o.night) T.dim(g, 0.35, '#000020'); },
  // атолл Бикини
  atoll: (g, t, o) => { T.sky(g, o.dusk ? ['#5a6aa8', '#f0a87a'] : ['#5ab0e8', '#cfeaf6']); g.fillStyle = T.vgrad(g, 640, 500, '#2a8ac8', 0.2); g.fillRect(-1500, 640, 5000, 800); g.beginPath(); g.ellipse(960, 820, 760, 150, 0, 0, Math.PI * 2); T.fo(g, '#f2e2a8'); g.beginPath(); g.ellipse(960, 820, 620, 100, 0, 0, Math.PI * 2); T.fo(g, '#5ad0e0', 4);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = 960 + Math.cos(a) * 690, y = 812 + Math.sin(a) * 128; T.palm(g, x, y, 0.45, t + i); }
    if (o.church) { box(g, 300, 700, 180, 120, '#f6f0e0', { r: 2 }); poly(g, [[290, 700], [490, 700], [390, 630]], '#a8523a'); line(g, [[390, 630], [390, 590]], 6); line(g, [[372, 606], [408, 606]], 6); }
    for (let i = 0; i < 5; i++) line(g, [[-200 + i * 500 + (t * 30) % 500, 700 + i * 30], [-120 + i * 500 + (t * 30) % 500, 700 + i * 30]], 4, 'rgba(255,255,255,.6)'); },
  // поле пшеницы: o.frozen, o.dead
  farm: (g, t, o) => { T.sky(g, o.frozen ? ['#5a6070', '#9aa0a8'] : o.dark ? ['#3a3440', '#6a6070'] : DAY); if (!o.frozen && !o.dark) ell(g, 1600, 180, 70, 70, '#fff6d0', 0); if (o.frozen) T.dim(g, 0.1, '#20304a');
    g.beginPath(); g.moveTo(-500, 1200); g.lineTo(-500, 600); g.quadraticCurveTo(900, 540, 2500, 620); g.lineTo(2500, 1200); g.closePath(); T.fo(g, o.frozen ? '#dfe6ea' : o.dead ? '#8a7a5a' : '#d8b04a');
    const r = rng(2); for (let i = 0; i < 70; i++) { const x = -100 + (i % 14) * 150 + r() * 40, y = 660 + Math.floor(i / 14) * 80 + r() * 20, h = 70 + r() * 40, sw = Math.sin(t * 2 + i) * 6; const col = o.frozen ? '#9aa8b0' : o.dead ? '#6a5a3a' : '#c8902a'; line(g, [[x, y + 40], [x + sw, y - h * 0.4]], 5, col); if (!o.dead) ell(g, x + sw, y - h * 0.5, 9, 22, o.frozen ? '#c8d4dc' : '#f2c84a', 3); else line(g, [[x + sw, y - h * 0.4], [x + sw + 20, y - h * 0.2]], 4, col); }
    if (o.snow) for (let i = 0; i < 90; i++) ell(g, (i * 211 + Math.sin(t + i) * 30) % 2000, (i * 67 + t * 80) % 1150 - 40, 5, 5, 'rgba(255,255,255,.9)', 0); },
  // вычислительный центр 80-х
  lab80: (g, t, o) => { T.wallRoom(g, { wall: o.wall || '#c8c0a8', floor: '#6a6a62', fy: 800 }); for (let i = 0; i < 5; i++) { const x = 80 + i * 360; box(g, x, 180, 300, 620, '#d8d4c8', { r: 4 }); ell(g, x + 80, 300, 56, 56, '#3a3a3a', 5); ell(g, x + 220, 300, 56, 56, '#3a3a3a', 5); for (const xx of [x + 80, x + 220]) { const a = t * (i % 2 ? 2 : -2); line(g, [[xx, 300], [xx + Math.cos(a) * 40, 300 + Math.sin(a) * 40]], 6, '#9a9a9a'); } for (let j = 0; j < 6; j++) ell(g, x + 40 + j * 44, 450, 8, 8, ['#ff5a4a', '#5fd35a', '#ffd04a'][(j + i + Math.floor(t * 3)) % 3], 2); box(g, x + 30, 520, 240, 220, '#bcb8a8', { r: 2, lw: 3 }); } },
  // Мадрид, вечер
  madrid: (g, t, o) => { T.sky(g, ['#3a3a6a', '#d8786a', '#f2b87a']); [[-40, 340, 520, '#e8c8a0'], [320, 300, 460, '#d8a888'], [640, 360, 560, '#f2d8b0'], [1020, 300, 480, '#e0b898'], [1340, 340, 540, '#f0d0a8'], [1700, 300, 460, '#d8b090']].forEach(([x, w, h, c]) => { box(g, x, 930 - h, w, h, c, { r: 2 }); box(g, x - 10, 930 - h - 20, w + 20, 24, shade(c, -0.15), { r: 2 }); for (let r = 0; r < 3; r++) for (let j = 0; j < Math.floor(w / 100); j++) { box(g, x + 30 + j * 100, 930 - h + 50 + r * 140, 50, 90, Math.sin(j * 3 + r + x) > 0 ? '#ffd77a' : '#4a3a3a', { r: 2, lw: 3 }); line(g, [[x + 20 + j * 100, 930 - h + 145 + r * 140], [x + 90 + j * 100, 930 - h + 145 + r * 140]], 5); } }); ground(g, 930, '#8a7a6a'); for (let i = 0; i < 4; i++) { const x = 200 + i * 520; line(g, [[x, 930], [x, 640]], 8, '#2a2a2a'); ell(g, x, 630, 24, 30, '#ffe08a', 4); light(g, x, 630, 240, '#ffd07a', 0.4); } },
  // ночное небо (самолёты)
  nightsky: (g, t, o) => { T.sky(g, o.day ? DAY : NIGHT); if (!o.day) stars(g, t, 90); for (let i = 0; i < 5; i++) ell(g, ((i * 600 - t * (o.speed ?? 120)) % 2600 + 2600) % 2600 - 300, 300 + (i % 3) * 200, 220, 40, o.day ? 'rgba(255,255,255,.85)' : 'rgba(120,130,170,.35)', 0); if (o.ground) { ground(g, 980, '#2a3a2a'); for (let i = 0; i < 30; i++) ell(g, (i * 97) % 1920, 1000 + (i % 3) * 20, 4, 4, '#ffd77a', 0); } },
  // северная Норвегия: снег + сияние + пусковая
  aurora: (g, t, o) => { T.sky(g, ['#061026', '#0c2a40', '#173a4a']); stars(g, t, 70); g.save(); g.globalCompositeOperation = 'screen'; for (let j = 0; j < 3; j++) { g.beginPath(); for (let x = -200; x <= 2200; x += 40) g.lineTo(x, 220 + j * 60 + Math.sin(x * 0.004 + t * 0.6 + j) * 70); for (let x = 2200; x >= -200; x -= 40) g.lineTo(x, 380 + j * 60 + Math.sin(x * 0.004 + t * 0.6 + j) * 70); g.closePath(); g.fillStyle = `rgba(${j ? 80 : 60},${220 - j * 30},${150 + j * 40},.22)`; g.fill(); } g.restore();
    g.beginPath(); g.moveTo(-500, 1200); g.lineTo(-500, 760); g.quadraticCurveTo(500, 640, 1100, 760); g.quadraticCurveTo(1600, 860, 2500, 720); g.lineTo(2500, 1200); g.closePath(); T.fo(g, '#e6eef4'); if (o.pad !== false) { line(g, [[1180, 900], [1300, 600]], 14, '#8a8a8a'); line(g, [[1240, 900], [1240, 760]], 10, '#6a6a6a'); } },
  // гостиная: телевизор, телефон
  home: (g, t, o) => { T.wallRoom(g, { wall: o.wall || '#d8c8a0', floor: '#8a6a4a', fy: 800, boards: true }); for (let i = 0; i < 10; i++) line(g, [[i * 200, 0], [i * 200, 800]], 30, 'rgba(255,255,255,.08)'); T.window_(g, 1400, 160, 320, 360, (g) => { T.sky(g, o.night ? NIGHT : DAY); }, {}); if (o.tree) { poly(g, [[260, 800], [460, 800], [360, 360]], '#2f7a3a'); for (let i = 0; i < 9; i++) ell(g, 300 + (i * 53) % 120, 460 + i * 36, 12, 12, ['#d94a3a', '#f2c037', '#3a7ad9'][i % 3], 3); poly(g, [[360, 330], [376, 366], [344, 366]], C.gold, 3); } },
  // Кремль / Белый дом (горячая линия)
  kremlin: (g, t, o) => { T.sky(g, o.night ? NIGHT : DAY); ground(g, 900, '#8a8a8a'); box(g, -100, 600, 2200, 300, '#b8423a', { r: 2 }); for (let i = 0; i < 40; i++) poly(g, [[-100 + i * 56, 600], [-60 + i * 56, 600], [-60 + i * 56, 570], [-74 + i * 56, 556], [-86 + i * 56, 570], [-100 + i * 56, 570]], '#b8423a', 3);
    for (const [x, h] of [[500, 520], [1300, 600]]) { box(g, x - 70, 900 - h, 140, h, '#c8524a', { r: 2 }); poly(g, [[x - 80, 900 - h], [x + 80, 900 - h], [x, 900 - h - 200]], '#3a7a4a'); poly(g, [[x, 900 - h - 260], [x + 16, 900 - h - 228], [x + 50, 900 - h - 228], [x + 22, 900 - h - 208], [x + 32, 900 - h - 176], [x, 900 - h - 196], [x - 32, 900 - h - 176], [x - 22, 900 - h - 208], [x - 50, 900 - h - 228], [x - 16, 900 - h - 228]], '#e83a2a', 3); light(g, x, 900 - h - 220, 120, '#ff6a4a', 0.4); } },
  whitehouse: (g, t, o) => { T.sky(g, o.night ? NIGHT : DAY); ground(g, 900, '#6ab04a'); box(g, 300, 480, 1320, 420, '#f6f4ee', { r: 2 }); box(g, 280, 450, 1360, 40, '#e6e2d8', { r: 2 }); poly(g, [[760, 450], [1160, 450], [960, 330]], '#f6f4ee'); for (let i = 0; i < 6; i++) box(g, 770 + i * 74, 450, 30, 450, '#ffffff', { r: 2, lw: 3 }); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { box(g, 360 + c * 90, 540 + r * 170, 50, 90, '#4a6a8a', { r: 2, lw: 3 }); box(g, 1220 + c * 90, 540 + r * 170, 50, 90, '#4a6a8a', { r: 2, lw: 3 }); } line(g, [[960, 330], [960, 220]], 6); poly(g, [[964, 222], [1060, 240], [964, 262]], '#d94a3a', 3); },
  // пляж Гавайев ночью
  hawaii: (g, t, o) => { T.sky(g, NIGHT); stars(g, t, 80); g.fillStyle = '#16244a'; g.fillRect(-1500, 640, 5000, 400); ground(g, 860, '#c8b080'); for (let i = 0; i < 6; i++) { const x = 160 + i * 330; const on = !o.out || (o.outAt != null && t < o.outAt); line(g, [[x, 860], [x, 560]], 9, '#3a3a3a'); line(g, [[x, 560], [x + 50, 548]], 7, '#3a3a3a'); ell(g, x + 56, 560, 20, 12, on ? '#ffe08a' : '#3a3a3a', 4); if (on) light(g, x + 56, 570, 220, '#ffd07a', 0.45); } T.palm(g, 120, 860, 0.9, t); T.palm(g, 1800, 860, 1.0, t + 1); if (o.flash) { light(g, 1500, 200, 900, '#ff6aa0', 0.35 + Math.sin(t * 2) * 0.1); } },
  // взлётная полоса ночью
  airbase: (g, t, o) => { T.sky(g, o.day ? DAY : NIGHT); if (!o.day) stars(g, t, 60); ground(g, 760, '#3a4a3a'); g.fillStyle = '#4a4a4a'; g.beginPath(); g.moveTo(-400, 1100); g.lineTo(700, 760); g.lineTo(1220, 760); g.lineTo(2300, 1100); g.closePath(); g.fill(); for (let i = 0; i < 8; i++) { const k = i / 8; box(g, 960 - 8 - k * 4, 780 + k * k * 320, 16 + k * 10, 20 + k * 40, '#f2f2f2', { r: 2, lw: 0, grad: false }); } for (let i = 0; i < 10; i++) { ell(g, 700 - i * 110, 770 + i * 34, 6, 6, '#ffd04a', 0); ell(g, 1220 + i * 110, 770 + i * 34, 6, 6, '#ffd04a', 0); } },
  // туманный лист бумаги / стол
  paperdesk: (g, t, o) => { g.fillStyle = T.vgrad(g, 0, 1080, o.col || '#6a4a32', 0.15); g.fillRect(-1500, -1500, 5000, 5000); for (let i = 0; i < 16; i++) line(g, [[-1500, i * 90 + 20], [3500, i * 90 + 40]], 3, 'rgba(30,15,5,.3)'); if (o.lamp !== false) light(g, 960, 300, 1100, '#fff0c0', 0.3); },
});
for (const k of Object.keys(SETS)) SETS[k].gy = 930;
