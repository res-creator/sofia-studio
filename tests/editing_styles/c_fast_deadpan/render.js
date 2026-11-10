// Editing-style test C, "fast deadpan" (16:9 1920x1080, 30 fps): fast cuts (~1–1.5 s), flat bright graphics, archive cut-outs,
// pop-up joke labels, zoom punches, a freeze-frame gag, a hard-cut deadpan card, a bar-chart gag, a map with a silly label and an
// expectation-vs-reality split. Techniques only — no branding of any existing channel. Story/facts: ../../../poyais_ep29/facts.md.
// Usage: node render.js out_video.mp4   (frames are streamed straight into ffmpeg, nothing is written to disk)
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const W = 1920, H = 1080, FPS = 30;
const D = __dirname, A = path.join(D, '../../../poyais_ep29/archive');
const WJ = JSON.parse(fs.readFileSync(path.join(D, 'words.json'))); const T = WJ.T + 1.3;
const F = '"Inter Display", Inter, sans-serif', MONO = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
const COL = { teal: '#2EC4B6', yellow: '#FFD23F', coral: '#FF6B6B', navy: '#1B2A41', cream: '#F4F1EA', ink: '#151515', green: '#3DBE6B', red: '#E5383B', sky: '#8ECAE6', jungle: '#2D6A4F' };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), seg = (t, a, b) => clamp((t - a) / (b - a));
const back = u => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }, out3 = u => 1 - Math.pow(1 - u, 3);
const pop = (t, t0, d = 0.22) => back(seg(t, t0, t0 + d));

// ---------- drawing helpers ----------
function bg(x, c) { x.fillStyle = c; x.fillRect(-200, -200, W + 400, H + 400); }
function dots(x, c = 'rgba(0,0,0,0.06)') { x.fillStyle = c; for (let i = 0; i < W; i += 48) for (let j = 0; j < H; j += 48) { x.beginPath(); x.arc(i + 24, j + 24, 3, 0, 7); x.fill(); } }
function text(x, s, cx, cy, size, col = COL.ink, font = F, w = 900, align = 'center') { x.font = `${w} ${size}px ${font}`; x.textAlign = align; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(s, cx, cy); }
function fit(x, s, cx, cy, size, maxW, col, w = 900) { x.font = `${w} ${size}px ${F}`; const m = x.measureText(s).width; if (m > maxW) size *= maxW / m; text(x, s, cx, cy, size, col, F, w); }
function scaled(x, cx, cy, s, fn, rot = 0) { x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s); fn(); x.restore(); }
function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
// sticker label: white rounded box, bold text, slight tilt, pops in
function label(x, s, cx, cy, t, t0, size = 44, bgc = '#fff', fg = COL.ink, rot = -0.03) { if (t < t0) return; const k = pop(t, t0); x.font = `800 ${size}px ${F}`; const w = x.measureText(s).width + size * 0.9, h = size * 1.6;
  scaled(x, cx, cy, k, () => { x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 16; x.shadowOffsetY = 6; x.fillStyle = bgc; rr(x, -w / 2, -h / 2, w, h, h * 0.22); x.fill(); x.shadowColor = 'transparent'; text(x, s, 0, 2, size, fg, F, 800); }, rot); }
// photo cut-out: white border + drop shadow, slides in from a side with a little overshoot
function cutout(x, im, cx, cy, h, t, t0, from = [0, 140], rot = -0.04, crop) { const k = back(seg(t, t0, t0 + 0.28)); if (t < t0) return;
  const [sx, sy, sw, sh] = crop || [0, 0, im.width, im.height]; const w = h * sw / sh;
  x.save(); x.translate(cx + from[0] * (1 - k), cy + from[1] * (1 - k)); x.rotate(rot * k); x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 30; x.shadowOffsetY = 14;
  x.fillStyle = '#fff'; x.fillRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32); x.shadowColor = 'transparent'; x.drawImage(im, sx, sy, sw, sh, -w / 2, -h / 2, w, h); x.restore(); }
function stamp(x, s, cx, cy, size, col, t, t0, rot = -0.14) { if (t < t0) return; const u = seg(t, t0, t0 + 0.14), k = 1.8 - 0.8 * out3(u);
  scaled(x, cx, cy, k, () => { x.globalAlpha = 0.95 * clamp(u * 3); x.font = `900 ${size}px ${F}`; const w = x.measureText(s).width + size * 0.6; x.fillStyle = 'rgba(255,255,255,0.88)'; x.fillRect(-w / 2, -size * 0.72, w, size * 1.44); x.strokeStyle = col; x.lineWidth = size * 0.11; x.strokeRect(-w / 2, -size * 0.72, w, size * 1.44); text(x, s, 0, 4, size, col); x.globalAlpha = 1; }, rot); }
function person(x, cx, cy, s, col) { x.fillStyle = col; x.beginPath(); x.arc(cx, cy - 46 * s, 18 * s, 0, 7); x.fill(); rr(x, cx - 20 * s, cy - 24 * s, 40 * s, 60 * s, 14 * s); x.fill(); }
function shoe(x, cx, cy, s) { scaled(x, cx, cy, s, () => { x.fillStyle = '#6B3E26'; x.beginPath(); x.moveTo(-120, 30); x.lineTo(-120, -60); x.quadraticCurveTo(-110, -90, -60, -80); x.lineTo(-40, -20); x.quadraticCurveTo(60, -10, 120, 10); x.quadraticCurveTo(140, 40, 110, 50); x.lineTo(-120, 50); x.closePath(); x.fill(); x.fillStyle = '#2B1A10'; x.fillRect(-124, 40, 250, 18); x.strokeStyle = '#E9D8B4'; x.lineWidth = 5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-70 + i * 18, -50 + i * 10); x.lineTo(-40 + i * 18, -58 + i * 10); x.stroke(); } }); }
function book(x, cx, cy, s, rot = 0) { scaled(x, cx, cy, s, () => { x.shadowColor = 'rgba(0,0,0,0.3)'; x.shadowBlur = 24; x.shadowOffsetY = 10; x.fillStyle = '#7A2E2E'; x.fillRect(-170, -230, 340, 460); x.shadowColor = 'transparent'; x.fillStyle = '#5E2222'; x.fillRect(-170, -230, 26, 460);
  x.fillStyle = '#E9D8B4'; x.fillRect(-120, -170, 260, 200); text(x, 'SKETCH', 10, -130, 34, '#3A2A1A', SERIF, 700); text(x, 'OF THE', 10, -95, 20, '#3A2A1A', SERIF, 400); text(x, 'MOSQUITO', 10, -60, 30, '#3A2A1A', SERIF, 700); text(x, 'SHORE', 10, -25, 30, '#3A2A1A', SERIF, 700); text(x, '1822', 10, 130, 28, '#E9D8B4', SERIF, 700); }, rot); }
function jungle(x, X, Y, w, h, t) { x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.fillStyle = '#1B4332'; x.fillRect(X, Y, w, h); const cols = ['#2D6A4F', '#40916C', '#52B788', '#1B4332'];
  for (let i = 0; i < 70; i++) { const px = X + ((i * 137) % w), py = Y + h - ((i * 89) % (h * 0.9)), r = 50 + (i * 31) % 90; x.fillStyle = cols[i % 4]; x.beginPath(); x.ellipse(px + Math.sin(t * 2 + i) * 3, py, r, r * 0.45, (i % 5) * 0.6, 0, 7); x.fill(); }
  x.fillStyle = '#8D8D8D'; for (let i = 0; i < 6; i++) { x.fillRect(X + w * 0.3 + i * 38, Y + h - 70 - (i % 2) * 14, 34, 24); } x.restore(); }
function map(x, t, t0) { // flat stylised Atlantic: Britain top-right, Central America bottom-left, dashed route drawn on
  bg(x, COL.sky); x.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 12; i++) x.fillRect(0, 90 * i + 40, W, 2);
  x.fillStyle = '#F2E3B3'; x.strokeStyle = '#151515'; x.lineWidth = 5;
  const blob = pts => { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill(); x.stroke(); };
  blob([[1500, 150], [1560, 120], [1600, 200], [1580, 300], [1620, 380], [1560, 420], [1500, 400], [1520, 300], [1480, 220]]); // Britain
  blob([[1430, 600], [1560, 560], [1700, 600], [1780, 760], [1720, 1000], [1600, 1080], [1470, 1080], [1420, 900]]); // Africa edge
  blob([[0, 300], [380, 260], [520, 380], [470, 520], [600, 640], [700, 720], [760, 820], [690, 860], [600, 800], [500, 760], [380, 700], [200, 650], [0, 640]]); // Americas
  text(x, 'BRITAIN', 1550, 470, 34, COL.ink, F, 800);
  const u = out3(seg(t, t0 + 0.2, t0 + 1.0)); const p0 = [1500, 330], p1 = [660, 770], cpx = 1050, cpy = 300;
  x.setLineDash([22, 16]); x.strokeStyle = COL.red; x.lineWidth = 9; x.beginPath(); x.moveTo(...p0); const N = 40;
  for (let i = 1; i <= N * u; i++) { const s = i / N; x.lineTo((1 - s) ** 2 * p0[0] + 2 * (1 - s) * s * cpx + s * s * p1[0], (1 - s) ** 2 * p0[1] + 2 * (1 - s) * s * cpy + s * s * p1[1]); } x.stroke(); x.setLineDash([]);
  if (u > 0.98) { x.fillStyle = COL.red; x.beginPath(); x.arc(660, 770, 18, 0, 7); x.fill(); } }
function figuresGrid(x, n, total, cx, cy, s, col, t, t0, fadeFrom) { const cols = 25, gap = 46 * s; for (let i = 0; i < total; i++) { const r = Math.floor(i / cols), c = i % cols; const k = clamp((t - t0 - i * 0.004) / 0.12); if (k <= 0) continue;
  let a = 1; if (fadeFrom != null && i >= n) a = 1 - seg(t, fadeFrom + ((i * 7919) % 200) / 200 * 1.2, fadeFrom + ((i * 7919) % 200) / 200 * 1.2 + 0.3); if (a <= 0) continue;
  x.globalAlpha = a; person(x, cx + (c - (cols - 1) / 2) * gap, cy + r * gap * 1.6, s * k, col); } x.globalAlpha = 1; }

// ---------- subtitles (word groups from the whisper timings, with spelling fixes) ----------
const FIX = { 'Poiayas.': 'Poyais.', 'Mac': 'Mac', 'Gregor,': 'Gregor?', 'In': 'In' };
let words = WJ.words.map(([w, a, b]) => [FIX[w] || w, a, b]);
for (let i = 0; i < words.length - 1; i++) if (words[i][0] === 'Mac' && /^Gregor/.test(words[i + 1][0])) { words[i] = ['MacGregor?', words[i][1], words[i + 1][2]]; words.splice(i + 1, 1); if (words[i - 1] && words[i - 1][0] === 'In') words[i - 1][0] = 'And'; }
const groups = []; { let g = []; words.forEach((w, i) => { g.push(w); if (g.length === 3 || /[.,?!]$/.test(w[0]) || i === words.length - 1) { groups.push(g); g = []; } }); }
groups.forEach((g, i) => { g.t0 = g[0][1]; g.t1 = i + 1 < groups.length ? Math.min(groups[i + 1][0][1], g[g.length - 1][2] + 0.6) : g[g.length - 1][2] + 0.5; });
function subs(x, t) { const g = groups.find(g => t >= g.t0 && t < g.t1); if (!g) return; const s = g.map(w => w[0]).join(' ');
  x.font = `800 50px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 12; x.strokeStyle = 'rgba(0,0,0,0.85)'; x.strokeText(s, W / 2, 1000); x.fillStyle = '#fff'; x.fillText(s, W / 2, 1000); }

// ---------- shots ----------
const L = WJ.lines; // [start,end] per voice line
let IM = {};
const PUNCH = [4.46, 8.04, 13.04, 16.18, 21.52, 26.88, 32.62, 35.52];
const shots = [
  [0.0, 1.2, (x, t) => { bg(x, COL.yellow); dots(x); scaled(x, W / 2, 470, pop(t, 0.0, 0.25), () => text(x, '1822', 0, 0, 330, COL.ink)); label(x, 'a true story, somehow', W / 2, 760, t, 0.45, 40, COL.ink, '#fff'); }],
  [1.2, 2.6, (x, t) => { bg(x, COL.teal); dots(x); cutout(x, IM.mac, 760, 470, 640, t, 1.2, [-300, 0], -0.05, [60, 40, 840, 760]); label(x, 'A MAN', 1360, 330, t, 1.35, 70); label(x, '(Scottish)', 1360, 460, t, 1.7, 40, COL.yellow); }],
  [2.6, 3.55, (x, t) => { bg(x, COL.cream); dots(x); scaled(x, 960, 460, pop(t, 2.6), () => { x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 20; x.fillStyle = '#fff'; rr(x, -330, -220, 660, 440, 18); x.fill(); x.shadowColor = 'transparent'; x.strokeStyle = COL.ink; x.lineWidth = 6; rr(x, -300, -190, 600, 380, 12); x.stroke(); text(x, 'LAND FOR SALE', 0, -100, 64, COL.ink); x.fillStyle = COL.green; x.fillRect(-220, -10, 440, 150); text(x, 'GREAT DEAL', 0, 65, 54, '#fff'); }); }],
  [3.55, 5.3, (x, t) => { bg(x, COL.sky); dots(x, 'rgba(255,255,255,0.15)'); const k = pop(t, 3.55); scaled(x, 960, 450, k, () => { x.setLineDash([26, 18]); x.lineWidth = 10; x.strokeStyle = COL.ink; x.beginPath(); x.ellipse(0, 0, 360, 230, -0.2, 0, 7); x.stroke(); x.setLineDash([]); text(x, '???', 0, 0, 170, COL.ink); });
    label(x, '(not a real country)', 960, 800, t, 4.4, 52, COL.red, '#fff', 0.02); }],
  [5.3, 6.9, (x, t) => { bg(x, COL.coral); dots(x); scaled(x, W / 2, 420, pop(t, 5.3), () => text(x, 'POYAIS', 0, 0, 260, '#fff')); label(x, 'say it: poy-EYE-iss', W / 2, 640, t, 5.75, 42); label(x, 'still not real', 1500, 200, t, 6.3, 34, COL.ink, '#fff', 0.08); }],
  [6.9, 8.0, (x, t) => { bg(x, COL.yellow); dots(x); book(x, 960, 470, pop(t, 6.9) * 1.45, -0.06); label(x, 'THE GUIDEBOOK', 1450, 240, t, 7.15, 44); }],
  [8.0, 10.1, (x, t) => { bg(x, COL.navy); const n = Math.round(355 * out3(seg(t, 8.0, 8.6))); scaled(x, 960, 420, 1 + 0.04 * Math.sin(t * 9) * (t < 8.6), () => text(x, String(n), 0, 0, 300, COL.yellow)); text(x, 'PAGES', 960, 640, 90, '#fff'); label(x, 'of very confident writing', 960, 790, t, 8.9, 40); }],
  [10.1, 13.7, (x, t) => { bg(x, COL.cream); dots(x); text(x, 'PAGES', 960, 110, 64, COL.ink); const base = 820, h1 = 600 * out3(seg(t, 10.2, 10.9));
    x.fillStyle = COL.teal; x.fillRect(560, base - h1, 280, h1); x.fillStyle = COL.coral; x.fillRect(1080, base - 6, 280, 6); x.fillStyle = COL.ink; x.fillRect(460, base, 1000, 6);
    text(x, 'GUIDEBOOK', 700, 870, 40, COL.ink, F, 800); text(x, 'ACTUAL COUNTRY', 1220, 870, 40, COL.ink, F, 800); if (t > 10.5) text(x, String(Math.round(355 * out3(seg(t, 10.2, 10.9)))), 700, base - h1 - 50, 56, COL.ink); if (t > 11.9) scaled(x, 1220, base - 60, pop(t, 11.9), () => text(x, '0', 0, 0, 90, COL.red));
    label(x, 'source: math', 1600, 300, t, 12.9, 36, COL.yellow, COL.ink, 0.06); }],
  [13.7, 14.65, (x, t) => { bg(x, COL.teal); dots(x); cutout(x, IM.note, 960, 470, 520, t, 13.7, [0, -500], -0.03); }],
  [14.65, 15.7, (x, t) => { bg(x, COL.teal); dots(x); cutout(x, IM.note, 960, 470, 520, t, 0, [0, 0], -0.03); stamp(x, 'VERY REAL PAPER', 960, 330, 64, COL.green, t, 14.7, 0.05); }],
  [15.7, 16.9, (x, t) => { bg(x, COL.teal); dots(x); cutout(x, IM.note, 960, 470, 520, t, 0, [0, 0], -0.03); stamp(x, 'VERY REAL PAPER', 960, 330, 64, COL.green, t, 0, 0.05); stamp(x, 'VERY FAKE MONEY', 960, 620, 84, COL.red, t, 15.85); }],
  [16.9, 18.55, (x, t) => { bg(x, COL.cream); dots(x); shoe(x, 600, 520, pop(t, 16.9) * 1.6); label(x, 'a cobbler', 600, 260, t, 17.05, 44, COL.yellow);
    scaled(x, 1330, 470, pop(t, 17.65), () => { x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 20; x.fillStyle = '#FFF8E5'; x.fillRect(-330, -190, 660, 380); x.shadowColor = 'transparent'; x.strokeStyle = '#B08D57'; x.lineWidth = 8; x.strokeRect(-300, -160, 600, 320);
      text(x, 'BY ROYAL APPOINTMENT', 0, -100, 30, '#7A5A2E', SERIF, 700); text(x, 'SHOEMAKER', 0, -20, 66, COL.ink, SERIF, 700); text(x, 'TO THE PRINCESS', 0, 60, 48, COL.ink, SERIF, 700); }, 0.03); }],
  [18.55, 19.5, (x, t) => { bg(x, COL.cream); dots(x); shoe(x, 600, 520, 1.6); scaled(x, 1330 + (t - 18.55) * 40, 470, 1.0 + (t - 18.55) * 0.12, () => { x.fillStyle = '#FFF8E5'; x.fillRect(-330, -190, 660, 380); x.strokeStyle = '#B08D57'; x.lineWidth = 8; x.strokeRect(-300, -160, 600, 320);
      text(x, 'BY ROYAL APPOINTMENT', 0, -100, 30, '#7A5A2E', SERIF, 700); text(x, 'SHOEMAKER', 0, -20, 66, COL.ink, SERIF, 700); text(x, 'TO THE PRINCESS', 0, 60, 48, COL.ink, SERIF, 700); }, 0.03); label(x, 'nice.', 1600, 760, t, 18.95, 40); }],
  // freeze frame + record scratch: the previous frame, desaturated, with a red overlay
  [19.5, 20.8, (x, t) => { x.save(); x.filter = 'grayscale(1) brightness(0.8)'; shots[12][2](x, 19.49); x.restore(); x.fillStyle = 'rgba(229,56,59,0.25)'; x.fillRect(0, 0, W, H);
    scaled(x, 960, 440, pop(t, 19.55), () => text(x, 'NO PRINCESS.', 0, 0, 150, '#fff'), -0.04); label(x, '*record scratch*', 360, 140, t, 19.5, 36, COL.ink, '#fff', -0.05); }],
  [20.8, 22.4, (x, t) => { bg(x, '#000'); text(x, 'Also: no country.', 960, 470, 92, '#fff', F, 700); }],
  [22.4, 24.05, (x, t) => { bg(x, COL.yellow); figuresGrid(x, 250, 250, 960, 170, 0.78, COL.ink, t, 22.45); scaled(x, 960, 880, pop(t, 22.5), () => { x.fillStyle = COL.ink; rr(x, -260, -70, 520, 140, 20); x.fill(); text(x, '~250 PEOPLE', 0, 4, 76, COL.yellow); }); }],
  [24.05, 25.4, (x, t) => { map(x, t, 24.05); label(x, 'definitely a country →', 1000, 840, t, 24.5, 42, '#fff', COL.ink, 0.04); label(x, 'POYAIS (allegedly)', 470, 900, t, 24.9, 40, COL.yellow); }],
  [25.4, 27.1, (x, t) => { bg(x, COL.cream); const sp = 940; cutout(x, IM.river, 480, 470, 560, t, 25.4, [-200, 0], -0.02, [0, 0, 1280, 829]); label(x, 'EXPECTATION', 480, 120, t, 25.45, 54, COL.teal, '#fff', 0);
    if (t > 26.2) { x.save(); x.translate(1440 + 400 * (1 - out3(seg(t, 26.2, 26.45))), 0); jungle(x, -440, 190, 880, 570, t); x.restore(); label(x, 'REALITY', 1440, 120, t, 26.25, 54, COL.coral, '#fff', 0); label(x, 'the capital', 1300, 650, t, 26.5, 34, '#fff', COL.ink, -0.05); } }],
  // serious beat: no gags, music off
  [27.1, 30.95, (x, t) => { bg(x, COL.navy); figuresGrid(x, 48, 250, 960, 110, 0.72, '#E8E3D8', t, 27.1 - 2, 27.3); if (t > 28.2) { x.globalAlpha = seg(t, 28.2, 28.6); text(x, 'FEWER THAN 50 MADE IT HOME', 960, 800, 72, '#fff', F, 800); x.globalAlpha = 1; } }],
  [30.95, 33.4, (x, t) => { bg(x, COL.teal); dots(x); cutout(x, IM.mac, 640, 480, 620, t, 30.95, [-300, 0], 0.04, [60, 40, 840, 760]); label(x, 'FRANCE, 1826', 1350, 240, t, 31.9, 40, COL.ink, '#fff'); label(x, 'charged: fraud', 1350, 360, t, 32.1, 44); stamp(x, 'ACQUITTED', 1350, 560, 110, COL.green, t, 32.62, -0.1); }],
  [33.4, 35.15, (x, t) => { bg(x, COL.yellow); dots(x); scaled(x, 960, 430, pop(t, 33.4), () => { x.fillStyle = COL.green; x.beginPath(); x.arc(0, 0, 230, 0, 7); x.fill(); x.fillStyle = '#6B3E26'; x.fillRect(-14, -40, 28, 200); x.fillStyle = COL.jungle;
      for (let i = 0; i < 6; i++) { x.save(); x.rotate(-Math.PI / 2 + (i - 2.5) * 0.5); x.beginPath(); x.ellipse(70, -40, 90, 26, 0, 0, 7); x.fill(); x.restore(); } }); text(x, 'VENEZUELA', 960, 770, 96, COL.ink); label(x, 'retirement plan', 1480, 260, t, 34.1, 38, '#fff', COL.ink, 0.05); }],
  [35.15, 36.8, (x, t) => { bg(x, COL.cream); dots(x); scaled(x, 960, 450, pop(t, 35.15), () => { x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = 20; x.fillStyle = '#E6F4EA'; x.fillRect(-450, -200, 900, 400); x.shadowColor = 'transparent'; x.strokeStyle = COL.green; x.lineWidth = 8; x.strokeRect(-420, -170, 840, 340);
      text(x, 'MILITARY PENSION', 0, -60, 80, COL.ink); text(x, 'STATUS:', -230, 60, 50, COL.ink, F, 700); }); stamp(x, 'APPROVED', 1120, 515, 60, COL.green, t, 35.55, -0.06); }],
  [36.8, T + 1, (x, t) => { bg(x, COL.coral); text(x, 'Tough break.', 960, 470, 110, '#fff', F, 800); if (t > 37.6) label(x, '(it was not a tough break)', 960, 660, t, 37.6, 36, '#fff', COL.ink, 0); }],
];

(async () => {
  IM.mac = await loadImage(path.join(A, 'macgregor.jpg')); IM.river = await loadImage(path.join(A, 'black_river_1822.jpg')); IM.note = await loadImage(path.join(A, 'poyais_dollar.jpg'));
  if (process.argv[2] === 'still') { const ts = process.argv[3].split(',').map(Number); const sc = createCanvas(480 * Math.min(ts.length, 6), 270 * Math.ceil(ts.length / 6)), S = sc.getContext('2d');
    const c = createCanvas(W, H), x = c.getContext('2d'); ts.forEach((t, i) => { frame(x, t); S.drawImage(c, (i % 6) * 480, Math.floor(i / 6) * 270, 480, 270); }); fs.writeFileSync(process.argv[4], sc.toBuffer('image/png')); return; }
  const out = process.argv[2]; const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const c = createCanvas(W, H), x = c.getContext('2d'); const N = Math.ceil(T * FPS);
  for (let f = 0; f < N; f++) { frame(x, f / FPS); const buf = Buffer.from(x.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('video', N, 'frames', T.toFixed(2), 's');
})();
function frame(x, t) { x.setTransform(1, 0, 0, 1, 0, 0); x.filter = 'none'; const sh = shots.find(s => t >= s[0] && t < s[1]) || shots[shots.length - 1];
  // zoom punch on the punchlines (whole frame, ~0.25 s)
  let z = 1; for (const p of PUNCH) if (t >= p && t < p + 0.35) z = 1 + 0.07 * Math.exp(-(t - p) * 9);
  x.save(); x.translate(W / 2, H / 2); x.scale(z, z); x.translate(-W / 2, -H / 2); sh[2](x, t); x.restore(); subs(x, t); }
module.exports = { shots };
