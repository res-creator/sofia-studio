// Style comparison sheet: same scene in 6 looks. Usage: node lastday_demo/styles.js
require('../lib/fonts');
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs'), path = require('path');
const W = 640, H = 360;
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const T = (c, s, x, y, size, col, al = 'center', w = 700) => { c.fillStyle = col; c.font = `${w} ${size}px FredokaL, NunitoL, NunitoC`; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y); };
const wob = (c, pts, lw, col, a = 1) => { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = c.lineJoin = 'round'; c.globalAlpha = a; c.beginPath(); pts.forEach(([x, y], i) => { const jx = (rnd() - .5) * 2, jy = (rnd() - .5) * 2; i ? c.lineTo(x + jx, y + jy) : c.moveTo(x + jx, y + jy); }); c.stroke(); c.globalAlpha = 1; };
const ring = (c, x, y, r, lw, col, fill) => { c.beginPath(); c.arc(x, y, r, 0, 7); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = col; c.lineWidth = lw; c.stroke(); } };
const heart = (c, x, y, k, fill, stroke) => { c.fillStyle = fill; c.beginPath(); c.moveTo(x, y + 35 * k); c.bezierCurveTo(x - 90 * k, y - 20 * k, x - 45 * k, y - 85 * k, x, y - 35 * k); c.bezierCurveTo(x + 45 * k, y - 85 * k, x + 90 * k, y - 20 * k, x, y + 35 * k); c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); } };
const heights = [60, 95, 50, 120, 75, 55, 105, 70, 45, 90];
// seated stick pair; gy = ground y. mode draws line figures
function pairLines(c, gy, col, lw, headFill) {
  [[255, 1], [385, -1]].forEach(([x, d]) => {
    ring(c, x + d * -4, gy - 78, 12, lw, col, headFill); wob(c, [[x + d * -4, gy - 66], [x, gy - 34]], lw, col);
    wob(c, [[x, gy - 34], [x + d * 28, gy - 30], [x + d * 40, gy]], lw, col); wob(c, [[x, gy - 34], [x + d * 4, gy]], lw, col);
    wob(c, [[x + d * -3, gy - 60], [x + d * 22, gy - 48]], lw, col);
  });
}
const STY = [
  ['1  INK ON PAPER', 'как сейчас, но живее', c => {
    c.fillStyle = '#F3EBDC'; c.fillRect(0, 0, W, H);
    ring(c, 320, 150, 52, 3, '#c0392b', '#f6c453');
    heights.forEach((h, i) => { c.fillStyle = '#e9dfcb'; c.fillRect(20 + i * 62, 300 - h, 50, h); wob(c, [[20 + i * 62, 300], [20 + i * 62, 300 - h], [70 + i * 62, 300 - h], [70 + i * 62, 300]], 2.5, '#1c1a17'); });
    wob(c, [[20, 300], [620, 300]], 3, '#1c1a17'); pairLines(c, 300, '#1c1a17', 3, '#F3EBDC'); heart(c, 320, 238, .3, '#c0392b', '#1c1a17');
  }],
  ['2  CHALKBOARD', 'школьная доска, мел', c => {
    c.fillStyle = '#21392f'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,255,255,${rnd() * .05})`; c.fillRect(rnd() * W, rnd() * H, 2, 2); }
    ring(c, 320, 150, 52, 3, '#ffe27a'); for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28; wob(c, [[320 + Math.cos(a) * 62, 150 + Math.sin(a) * 62], [320 + Math.cos(a) * 82, 150 + Math.sin(a) * 82]], 3, '#ffe27a', .9); }
    heights.forEach((h, i) => wob(c, [[20 + i * 62, 300], [20 + i * 62, 300 - h], [70 + i * 62, 300 - h], [70 + i * 62, 300]], 2.5, '#f4f1e8', .85));
    wob(c, [[20, 300], [620, 300]], 3, '#f4f1e8', .9); pairLines(c, 300, '#f4f1e8', 3, '#21392f'); heart(c, 320, 238, .3, '#ff8a9b');
    T(c, 'who you\'re with', 320, 335, 22, '#f4f1e8', 'center', 500);
  }],
  ['3  CINEMATIC DUSK', 'тёмное кино, контровой свет', c => {
    const g = c.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#0e1230'); g.addColorStop(.6, '#5a2a4a'); g.addColorStop(1, '#f08a3c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = c.createRadialGradient(320, 270, 10, 320, 270, 220); r.addColorStop(0, 'rgba(255,210,120,.95)'); r.addColorStop(.3, 'rgba(255,140,60,.45)'); r.addColorStop(1, 'rgba(255,100,40,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H);
    ring(c, 320, 262, 40, 0, '', '#ffe9b0');
    c.fillStyle = '#0a0a12'; heights.forEach((h, i) => c.fillRect(20 + i * 62, 300 - h * 1.4, 50, h * 1.4)); c.fillRect(0, 300, W, 60);
    pairLines(c, 300, '#ff9a4a', 6, '#ff9a4a'); pairLines(c, 300, '#050508', 3, '#050508');
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(255,255,255,${rnd() * .06})`; c.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
    c.fillStyle = '#000'; c.fillRect(0, 0, W, 34); c.fillRect(0, H - 34, W, 34);
  }],
  ['4  FLAT COLOR VECTOR', 'яркий плоский, как Kurzgesagt', c => {
    ['#ffd36b', '#ffb66b', '#ff9a6b', '#ff7f7f'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 80, W, 80); });
    ring(c, 320, 205, 70, 0, '', '#fff3c2');
    const cols = ['#7b5ea7', '#5d4a8a', '#8a6fbf', '#6a5499']; heights.forEach((h, i) => { c.fillStyle = cols[i % 4]; c.fillRect(20 + i * 62, 300 - h * 1.3, 52, h * 1.3); c.fillStyle = 'rgba(255,230,150,.7)'; for (let k = 0; k < h / 30; k++) c.fillRect(30 + i * 62, 300 - h * 1.3 + 12 + k * 30, 12, 12); });
    c.fillStyle = '#3b2f5a'; c.fillRect(0, 300, W, 60);
    [[255, 1, '#2ec4b6'], [385, -1, '#ff5d73']].forEach(([x, d, col]) => { c.fillStyle = col; c.beginPath(); c.roundRect(x - 16, 255, 32, 45, 12); c.fill(); ring(c, x - d * 3, 240, 15, 0, '', '#ffd9b8'); c.fillStyle = col; c.beginPath(); c.roundRect(x + d * 8, 288, d * 40, 14, 7); c.fill(); });
    heart(c, 320, 232, .3, '#ff3d6e');
  }],
  ['5  COMIC NOIR', 'комикс, ч/б + красный', c => {
    c.fillStyle = '#f2efe6'; c.fillRect(0, 0, W, H);
    for (let y = 0; y < 300; y += 9) for (let x = (y / 9) % 2 ? 4 : 0; x < W; x += 9) { const d = 1 + 2.5 * (y / 300); c.fillStyle = '#111'; c.beginPath(); c.arc(x, y, d * .55, 0, 7); c.fill(); }
    ring(c, 320, 140, 55, 5, '#111', '#d62828');
    c.fillStyle = '#111'; heights.forEach((h, i) => c.fillRect(20 + i * 62, 300 - h * 1.3, 52, h * 1.3)); c.fillRect(0, 300, W, 60);
    pairLines(c, 300, '#f2efe6', 8, '#f2efe6'); pairLines(c, 300, '#d62828', 4, '#f2efe6');
    c.fillStyle = '#ffd60a'; c.fillRect(18, 16, 250, 34); c.strokeStyle = '#111'; c.lineWidth = 4; c.strokeRect(18, 16, 250, 34); T(c, 'THE LAST SUNSET…', 143, 33, 20, '#111', 'center', 800);
    c.strokeStyle = '#111'; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10);
  }],
  ['6  NEON SYNTHWAVE', 'неон, ночной, современно', c => {
    const g = c.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#12002b'); g.addColorStop(1, '#5b1a7a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.beginPath(); c.arc(320, 170, 82, 0, 7); c.clip(); const sg = c.createLinearGradient(0, 90, 0, 250); sg.addColorStop(0, '#ffe14d'); sg.addColorStop(1, '#ff2e93'); c.fillStyle = sg; c.fillRect(220, 80, 200, 180); c.fillStyle = '#5b1a7a'; for (let k = 0; k < 6; k++) c.fillRect(220, 175 + k * 14, 200, 3 + k * 1.5); c.restore();
    c.fillStyle = '#0b0220'; c.fillRect(0, 262, W, 100); c.strokeStyle = '#00e5ff'; c.lineWidth = 1.5; c.shadowColor = '#00e5ff'; c.shadowBlur = 8;
    for (let k = -8; k <= 8; k++) { c.beginPath(); c.moveTo(320 + k * 20, 262); c.lineTo(320 + k * 110, 360); c.stroke(); } for (let k = 0; k < 6; k++) { const y = 262 + k * k * 3 + 4; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.shadowColor = '#ff2e93'; c.shadowBlur = 14; pairLines(c, 262, '#ff7ad1', 3, '#12002b'); c.shadowBlur = 0;
    c.fillStyle = '#0b0220'; heights.forEach((h, i) => c.fillRect(20 + i * 62, 262 - h * .8, 50, h * .8));
  }],
];

const cols = 3, rows = 2, pad = 16, lab = 64;
const out = createCanvas(cols * (W + pad) + pad, rows * (H + lab + pad) + pad), o = out.getContext('2d');
o.fillStyle = '#16161a'; o.fillRect(0, 0, out.width, out.height);
STY.forEach(([name, sub, fn], i) => {
  const c = createCanvas(W, H), x = c.getContext('2d'); fn(x);
  const ox = pad + (i % cols) * (W + pad), oy = pad + Math.floor(i / cols) * (H + lab + pad);
  o.drawImage(c, ox, oy); T(o, name, ox, oy + H + 20, 26, '#fff', 'left', 700); T(o, sub, ox, oy + H + 48, 20, '#b8b8c0', 'left', 500);
});
const dest = path.join(__dirname, 'styles.png'); fs.writeFileSync(dest, out.toBuffer('image/png')); console.log(dest);
