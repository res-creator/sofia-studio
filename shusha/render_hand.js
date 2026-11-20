// «Шуша и Кеша: Йогурт» v2 — HAND-DRAWN look.
// Every shape: wobbly irregular outline drawn as tapered brush strokes (thick middle, thin ends,
// small gaps/overshoots), fill slightly off-register, watercolor wash + paper, soft one-side shading.
// node shusha/render_hand.js <yogurt|sport> [stills t1,t2]  -> shusha/out/<ep>.mp4
const {createCanvas, GlobalFonts} = require('@napi-rs/canvas');
const {spawn, spawnSync} = require('child_process');
const fs = require('fs'), path = require('path');
const W = 1080, H = 1920, FPS = 30, SR = 44100;
const D = __dirname, F = path.join(D, '..', 'node_modules', '@fontsource');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-cyrillic-400-normal.woff2', 'HC');
GlobalFonts.registerFromPath(F + '/neucha/files/neucha-latin-400-normal.woff2', 'HL');
const FONT = 'HL, HC';
let g;

// ---------------- episodes ----------------
const EPID = process.argv[2] || 'yogurt', STILLS = process.argv[3];
const EPS = {
  yogurt: {voice: 'voice', out: 'yogurt_v2.mp4', set: 'kitchen', title: 'Шуша и Кеша: «Йогурт»', amb: 'hum', end: 'clink',
    dir: [{pose: 'point', angry: true, look: 'left', cam: 'wide'}, {cam: 'wide'}, {pose: 'hips', angry: true, look: 'right', cam: 'sh'}, {cam: 'ke'},
      {pose: 'up', angry: true, shake: true, look: 'right', cam: 'sh'}, {spoon: 1, cam: 'ke'}, {pose: 'cross', angry: true, look: 'right', cam: 'wide'},
      {surprised: true, cam: 'ke'}, {pose: 'point', look: 'left', cam: 'wide'}, {spoon: 1, happy: true, cam: 'ke'}]},
  sport: {voice: 'voice_sport', out: 'sport.mp4', set: 'room', title: 'Шуша и Кеша: «С понедельника»', amb: 'tvhum', item: 'chip',
    sfx: [[3, 'crunch', 0.1, 0.9], [7, 'crunch', 0.2, 0.8], [9, 'rain', 0.6, 0.7]],
    dir: [{pose: 'up', look: 'right', cam: 'wide'}, {spoon: 1, cam: 'ke'}, {pose: 'hips', look: 'right', cam: 'sh'}, {spoon: 1, cam: 'ke'},
      {pose: 'point', look: 'right', cam: 'wide'}, {cam: 'ke'}, {pose: 'sneakers', look: 'right', cam: 'sh'}, {spoon: 1, cam: 'ke'},
      {pose: 'hips', angry: true, look: 'right', cam: 'wide'}, {cam: 'ke', surprised: true}, {pose: 'cross', look: 'right', flat: true, cam: 'sh'}]},
};
const EP = EPS[EPID];
// ---------------- audio prep ----------------
const LINES = JSON.parse(fs.readFileSync(path.join(D, EP.voice, 'lines.json'), 'utf8'));
const GAP = 0.22, START = 0.5, TAIL = 1.6;
const tmp = path.join(D, 'out', 'tmp_' + EPID); fs.mkdirSync(tmp, {recursive: true});
let tt = START; const CUE = [];
LINES.forEach(([who, text], i) => {
  const raw = path.join(D, EP.voice, `raw_${String(i).padStart(2, '0')}_${who}.mp3`), wav = path.join(tmp, `l${i}.wav`);
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
  const fx = who === 'sh' ? `${trim},asetrate=${SR}*1.09,aresample=${SR},atempo=1.04` : `${trim},atempo=0.97`;
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', fx + ',loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', wav]);
  const buf = fs.readFileSync(wav), pcm = new Int16Array(buf.buffer, buf.byteOffset + 44, (buf.length - 44) >> 1);
  const spf = SR / FPS, env = [];
  for (let f = 0; f * spf < pcm.length; f++) { let s = 0, n = 0; for (let k = Math.floor(f * spf); k < Math.min(pcm.length, (f + 1) * spf); k++) { s += pcm[k] * pcm[k]; n++; } env.push(Math.sqrt(s / Math.max(1, n)) / 32768); }
  const mx = Math.max(...env) || 1, dur = pcm.length / SR;
  CUE.push({i, who, text, t0: tt, t1: tt + dur, wav, env: env.map(v => v / mx)});
  tt += dur + GAP;
});
const TOTAL = tt - GAP + TAIL;

// ---------------- palette (muted, warm, watercolor) ----------------
const C = {ink: '#251c1a', wall: '#ffdc8a', wallS: '#f5c35e', floor: '#cf7a3c', floorD: '#a85a22', fridge: '#ffffff', fridgeIn: '#d6f6ff', night: '#26409a', nightD: '#182a6e',
  skin: '#ffc9a1', skinS: '#f39d74', blush: 'rgba(255,80,110,0.5)', hair: '#2fd35a', hairS: '#13a33a', hoodie: '#ff7417', hoodieS: '#de5300', tights: '#ff3434',
  kskin: '#ffc292', kskinS: '#eb955f', beanie: '#8b35ff', beanieS: '#661bd8', khood: '#3f8bf0', khoodS: '#2466c9', table: '#ee9437', tableS: '#c46d18', mustard: '#ffcc12', lamp: '#ffd83a'};

// ---------------- noise / geometry ----------------
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function noise1(seed, closed) { const r = rng(seed); const terms = [1, 2, 3, 5].map((f, k) => ({f: closed ? f : f + r() * .7, a: (1 / (k + 1)) * (.6 + r() * .8), p: r() * 6.28})); return (u) => terms.reduce((s, q) => s + q.a * Math.sin(u * 6.2832 * q.f + q.p), 0) / 1.6; }
function resample(pts, step, closed) {
  const P = closed ? pts.concat([pts[0]]) : pts, out = [];
  for (let i = 0; i < P.length - 1; i++) { const [a, b] = [P[i], P[i + 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)); for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  if (!closed) out.push(P[P.length - 1]); return out;
}
function smoothPts(pts, closed, it = 2) { let p = pts; for (let k = 0; k < it; k++) p = p.map((q, i) => { const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length]; if (!closed && (i === 0 || i === p.length - 1)) return q; return [(a[0] + 2 * q[0] + b[0]) / 4, (a[1] + 2 * q[1] + b[1]) / 4]; }); return p; }
function normals(p, closed) { return p.map((q, i) => { const a = p[Math.max(0, i - 1)] , b = p[Math.min(p.length - 1, i + 1)]; const A = closed ? p[(i - 1 + p.length) % p.length] : a, B = closed ? p[(i + 1) % p.length] : b; const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }); }
function wobble(pts, closed, seed, amp) { const n = noise1(seed, closed), N = normals(pts, closed); return pts.map((q, i) => { const u = i / pts.length, d = amp * n(u); return [q[0] + N[i][0] * d, q[1] + N[i][1] * d]; }); }
// shape generators (return point loops)
const ell = (cx, cy, rx, ry, rot = 0) => { const p = [], n = Math.max(24, Math.round((rx + ry) / 4)); for (let i = 0; i < n; i++) { const a = i / n * 6.2832, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; };
const potato = (cx, cy, rx, ry, seed, irr = .08) => { const n = noise1(seed, true); return ell(cx, cy, rx, ry).map(([x, y], i, a) => { const k = 1 + irr * n(i / a.length); return [cx + (x - cx) * k, cy + (y - cy) * k]; }); };
const rr = (x, y, w, h, r) => { const p = [], seg = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const a = a0 + k / 6 * 1.5708; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }; seg(x + w - r, y + r, -1.5708); seg(x + w - r, y + h - r, 0); seg(x + r, y + h - r, 1.5708); seg(x + r, y + r, 3.1416); return p; };
function tube(path_, w0, w1 = w0) { // thick limb outline with round caps
  const p = smoothPts(resample(path_, 8, false), false, 3), N = normals(p, false), L = [], R = [];
  p.forEach((q, i) => { const w = (w0 + (w1 - w0) * i / (p.length - 1)) / 2; L.push([q[0] + N[i][0] * w, q[1] + N[i][1] * w]); R.push([q[0] - N[i][0] * w, q[1] - N[i][1] * w]); });
  const cap = (c, n, w, dir) => { const out = [], a0 = Math.atan2(n[1], n[0]); for (let k = 1; k < 8; k++) { const a = a0 + dir * k / 8 * Math.PI; out.push([c[0] + Math.cos(a) * w / 2, c[1] + Math.sin(a) * w / 2]); } return out; };
  return L.concat(cap(p[p.length - 1], N[N.length - 1], w1, -1), R.reverse(), cap(p[0], N[0].map(v => -v), w0, -1));
}

// ---------------- textures ----------------
function mk() { const c = createCanvas(W, H); return [c, c.getContext('2d')]; }
const WASH = (() => { const [c, x] = mk(), r = rng(11); for (let i = 0; i < 260; i++) { const px = r() * W, py = r() * H, rad = 40 + r() * 180, gr = x.createRadialGradient(px, py, 0, px, py, rad), dark = r() < .55;
  gr.addColorStop(0, dark ? 'rgba(120,60,20,0.04)' : 'rgba(255,255,245,0.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); }
  // fine pigment edges
  for (let i = 0; i < 4000; i++) { x.fillStyle = r() < .5 ? 'rgba(90,60,30,0.035)' : 'rgba(255,255,255,0.06)'; x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); } return c; })();
const PAPER = (() => { const [c, x] = mk(), r = rng(12), im = x.createImageData(W, H);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 90; im.data[i] = v; im.data[i + 1] = v * .98; im.data[i + 2] = v * .93; im.data[i + 3] = 10; } x.putImageData(im, 0, 0);
  x.strokeStyle = 'rgba(120,100,70,0.05)'; for (let i = 0; i < 1800; i++) { const px = r() * W, py = r() * H; x.lineWidth = .8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 30, py + (r() - .5) * 30); x.stroke(); } return c; })();

// ---------------- hand-drawn primitives ----------------
function pathOf(p) { g.beginPath(); g.moveTo(...p[0]); for (let i = 1; i < p.length; i++) g.lineTo(...p[i]); g.closePath(); }
function brush(p, closed, seed, w, col = C.ink) { // tapered strokes, broken into 2–3 pieces with tiny gaps/overshoots
  const r = rng(seed), n = p.length; if (n < 3) return;
  let cuts = closed ? [Math.floor(r() * n)] : [0];
  if (closed) { const k = 1 + Math.floor(r() * 2); for (let j = 0; j < k; j++) cuts.push(Math.floor(cuts[0] + (j + 1) * n / (k + 1) + (r() - .5) * n * .1)); }
  const segs = closed ? cuts.map((c, j) => [c, (cuts[(j + 1) % cuts.length] + (j === cuts.length - 1 ? n : 0)) + (r() < .6 ? 2 : -1)]) : [[0, n - 1]];
  for (const [a, b0] of segs) {
    const b = Math.max(a + 2, b0), pts = []; for (let i = a; i <= b; i++) pts.push(p[((i % n) + n) % n]);
    const N = normals(pts, false), L = [], R = [], m = pts.length - 1, wv = noise1(seed + a, false);
    pts.forEach((q, i) => { const u = i / m, ww = w * (0.25 + 0.75 * Math.pow(Math.sin(Math.PI * u), 0.5)) * (1 + .18 * wv(u)) / 2; L.push([q[0] + N[i][0] * ww, q[1] + N[i][1] * ww]); R.push([q[0] - N[i][0] * ww, q[1] - N[i][1] * ww]); });
    g.beginPath(); g.moveTo(...L[0]); for (const q of L.slice(1)) g.lineTo(...q); for (const q of R.reverse()) g.lineTo(...q); g.closePath(); g.fillStyle = col; g.fill();
  }
}
// main drawing call
function draw(shapePts, o = {}) {
  const seed = o.seed || 1, closed = o.closed !== false;
  const base = smoothPts(resample(shapePts, 7, closed), closed, 1);
  if (o.fill) {
    const r = rng(seed + 7), off = o.offset ?? 4, fp = wobble(base, closed, seed + 3, o.amp ?? 2.2).map(([x, y]) => [x + (r() - .5) * off, y + (r() - .5) * off]);
    pathOf(fp); g.fillStyle = o.fill; g.fill();
    g.save(); pathOf(fp); g.clip();
    if (o.shade) { const [sx, sy] = o.shadeDir || [16, 12]; g.fillStyle = o.shade; g.globalAlpha = .5; g.fillRect(-2000, -2000, 6000, 6000); g.globalAlpha = 1; g.translate(-sx, -sy); pathOf(fp); g.fillStyle = o.fill; g.fill(); g.translate(sx, sy); }
    const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = o.washA ?? 1; g.drawImage(WASH, 0, 0); g.globalAlpha = 1; g.setTransform(m);
    g.restore();
  }
  if (o.line !== false) brush(wobble(base, closed, seed, o.amp ?? 2.2), closed, seed, o.lw || 7, o.col);
}
const stroke = (pts, lw = 6, seed = 5, amp = 1.5) => draw(pts, {closed: false, lw, seed, amp});
function curve(a, c, b, lw = 6, seed = 5) { const p = []; for (let k = 0; k <= 16; k++) { const u = k / 16; p.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]); } stroke(p, lw, seed); }
function spot(x, y, rx, ry, col) { const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry)); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore(); }
function hand(text, x, y, size, col = C.ink, align = 'center', rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${size}px ${FONT}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(text, 0, 0); g.restore(); }

// ---------------- set ----------------
function kitchen(time) {
  draw(rr(-300, -300, W + 600, 1870, 1), {fill: C.wall, line: false, seed: 2, amp: 0, offset: 0});
  // wallpaper: faint hand stripes + little dots
  for (let x = -40, k = 0; x < W + 60; x += 96, k++) draw([[x, -50], [x + 6, 1560]], {closed: false, lw: 5, seed: 100 + k, amp: 3, col: 'rgba(200,165,110,0.55)'});
  g.fillStyle = 'rgba(190,150,90,0.25)'; const r = rng(9); for (let i = 0; i < 70; i++) { g.beginPath(); g.arc(r() * W, r() * 1500, 4 + r() * 3, 0, 7); g.fill(); }
  // hanging lamp + glow
  spot(560, 300, 520, 420, 'rgba(255,230,160,0.35)');
  stroke([[560, -40], [562, 170]], 5, 21);
  draw([[470, 270], [650, 270], [600, 170], [520, 170]], {fill: C.lamp, shade: '#d7ae4c', seed: 22, lw: 7});
  draw(potato(560, 282, 34, 16, 23), {fill: '#fff6cf', seed: 24, lw: 5});
  // window with night city
  draw(rr(570, 470, 400, 360, 14), {fill: C.night, shade: C.nightD, shadeDir: [-20, -14], seed: 31, lw: 9});
  draw(potato(880, 545, 34, 34, 32), {fill: '#f7e7a6', seed: 33, lw: 5});
  for (const [x, w, h, s] of [[585, 90, 180, 34], [680, 70, 250, 35], [755, 110, 140, 36], [865, 95, 210, 37]]) draw([[x, 822], [x, 822 - h], [x + w, 822 - h], [x + w, 822]], {fill: '#1c2a49', seed: s, lw: 4, line: true});
  g.fillStyle = '#f5d66a'; for (const [x, y] of [[600, 680], [630, 720], [700, 600], [710, 680], [780, 720], [885, 650], [910, 730], [935, 690]]) g.fillRect(x, y, 15, 19);
  stroke([[770, 476], [772, 826]], 8, 38); stroke([[576, 650], [966, 646]], 8, 39);
  draw(rr(548, 820, 444, 30, 8), {fill: '#faf6ee', seed: 40, lw: 6});
  // calendar
  draw([[390, 420], [520, 414], [524, 560], [394, 566]], {fill: '#fbf7ef', seed: 41, lw: 5});
  draw([[390, 420], [520, 414], [521, 452], [391, 458]], {fill: '#e46b5b', seed: 42, lw: 5});
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.fillStyle = 'rgba(60,40,30,0.5)', g.fillRect(408 + i * 28, 476 + j * 26, 14, 8);
  // floor + baseboard
  draw([[-300, 1560], [W + 300, 1556], [W + 300, 2300], [-300, 2300]], {fill: C.floor, shade: C.floorD, shadeDir: [0, -40], seed: 51, lw: 8});
  for (let x = -200, k = 0; x < W + 200; x += 130, k++) draw([[x, 1575], [x - 90, 2000]], {closed: false, lw: 5, seed: 200 + k, amp: 2, col: 'rgba(110,70,40,0.6)'});
  // open fridge
  draw(rr(14, 520, 340, 1060, 26), {fill: C.fridge, shade: '#d9d6cc', shadeDir: [-18, 0], seed: 61, lw: 9});
  draw(rr(34, 770, 300, 790, 12), {fill: C.fridgeIn, seed: 62, lw: 6});
  spot(184, 900, 260, 300, 'rgba(255,255,250,0.85)');
  for (const [y, s] of [[985, 63], [1185, 64], [1385, 65]]) stroke([[40, y], [328, y + 3]], 5, s);
  draw(rr(144, 1086, 70, 96, 14), {fill: C.mustard, shade: '#d29f1f', seed: 66, lw: 6});
  draw(rr(150, 1064, 58, 28, 8), {fill: '#cf4434', seed: 67, lw: 5});
  hand('горчица', 179, 1140, 22, C.ink, 'center', -0.05);
  stroke([[34, 748], [334, 752]], 8, 68); stroke([[62, 600], [64, 700]], 12, 69);
  for (const [x, y, c, s] of [[230, 600, '#7fc4e8', 70], [290, 640, '#f28c3a', 71]]) draw(potato(x, y, 20, 20, s), {fill: c, seed: s, lw: 4}); // magnets
}
function room(time) {
  draw(rr(-300, -300, W + 600, 1870, 1), {fill: '#8fe6c3', line: false, seed: 3, amp: 0, offset: 0});
  for (let x = -40, k = 0; x < W + 60; x += 110, k++) draw([[x, -50], [x + 6, 1560]], {closed: false, lw: 14, seed: 120 + k, amp: 3, col: 'rgba(255,255,245,0.35)'});
  spot(560, 300, 520, 420, 'rgba(255,230,160,0.35)');
  stroke([[560, -40], [562, 170]], 5, 21);
  draw([[470, 270], [650, 270], [600, 170], [520, 170]], {fill: '#ff6a52', shade: '#e04a32', seed: 22, lw: 7});
  draw(potato(560, 282, 34, 16, 23), {fill: '#fff6cf', seed: 24, lw: 5});
  // window (night)
  draw(rr(600, 470, 380, 340, 14), {fill: C.night, shade: C.nightD, shadeDir: [-20, -14], seed: 131, lw: 9});
  draw(potato(900, 540, 30, 30, 132), {fill: '#f7e7a6', seed: 133, lw: 5});
  g.fillStyle = '#f5d66a'; for (const [x, y] of [[640, 700], [700, 660], [760, 720], [880, 690], [930, 740]]) g.fillRect(x, y, 15, 19);
  stroke([[790, 476], [792, 806]], 8, 134); stroke([[606, 640], [976, 636]], 8, 135);
  // poster «БЕГИ!»
  draw([[70, 400], [330, 392], [338, 760], [76, 768]], {fill: '#fff2c9', shade: '#ead79c', seed: 136, lw: 7});
  hand('БЕГИ!', 204, 470, 78, '#e0503f', 'center', -0.04);
  draw(potato(204, 620, 46, 46, 137), {fill: '#7fc4e8', seed: 138, lw: 5}); stroke([[170, 700], [204, 650], [240, 700]], 6, 139); stroke([[150, 640], [204, 610], [260, 660]], 6, 140);
  // plant
  draw([[90, 1420], [230, 1420], [212, 1560], [108, 1560]], {fill: '#f2643a', shade: '#cc4718', seed: 141, lw: 7});
  for (let k = 0; k < 6; k++) { const a = -2.4 + k * .32; draw(potato(160 + Math.cos(a) * 90, 1360 + Math.sin(a) * 110, 30, 70, 142 + k, .1).map(([px, py]) => [px, py]), {fill: '#3cc24a', shade: '#1e9a30', seed: 150 + k, lw: 6}); }
  // floor + rug
  draw([[-300, 1560], [W + 300, 1556], [W + 300, 2300], [-300, 2300]], {fill: C.floor, shade: C.floorD, shadeDir: [0, -40], seed: 51, lw: 8});
  for (let x = -200, k = 0; x < W + 200; x += 130, k++) draw([[x, 1575], [x - 90, 2000]], {closed: false, lw: 5, seed: 200 + k, amp: 2, col: 'rgba(110,70,40,0.6)'});
  draw(potato(470, 1730, 330, 90, 160, .05), {fill: '#ff6f9f', shade: '#e44d80', shadeDir: [0, -16], seed: 161, lw: 7});
}
function sofaBack() {
  draw([[600, 1010], [1130, 1000], [1130, 1320], [604, 1330]], {fill: '#ffb21f', shade: '#e08a00', seed: 170, lw: 8});
  stroke([[866, 1030], [868, 1300]], 5, 171);
}
function sofaFront() {
  draw([[590, 1300], [1130, 1294], [1130, 1450], [594, 1456]], {fill: '#ffbf33', shade: '#e39500', shadeDir: [0, -18], seed: 172, lw: 8});
  draw([[560, 1170], [660, 1166], [664, 1460], [566, 1466]], {fill: '#ffb21f', shade: '#e08a00', seed: 173, lw: 8});
  stroke([[610, 1456], [606, 1530]], 14, 174); stroke([[1100, 1450], [1104, 1530]], 14, 175);
}
function bowl() {
  draw([[900, 1278], [1040, 1278], [1016, 1340], [924, 1340]], {fill: '#2fa2ff', shade: '#1b7fd8', seed: 180, lw: 6});
  for (let k = 0; k < 5; k++) draw(potato(925 + k * 25, 1272 - (k % 2) * 10, 22, 14, 181 + k, .3), {fill: '#f2c45a', seed: 186 + k, lw: 4});
}
function table() {
  draw([[606, 1250], [1120, 1246], [1124, 1300], [610, 1304]], {fill: C.table, shade: C.tableS, shadeDir: [0, -14], seed: 81, lw: 8});
  draw([[636, 1300], [1100, 1300], [1096, 1424], [640, 1420]], {fill: C.tableS, seed: 82, lw: 8});
  draw(tube([[672, 1420], [670, 1595]], 24), {fill: '#8a5a33', seed: 83, lw: 6});
  draw(tube([[1060, 1420], [1064, 1595]], 24), {fill: '#8a5a33', seed: 84, lw: 6});
}
function cup() {
  const x = 630, y = 1150;
  draw([[x, y], [x + 110, y], [x + 98, y + 102], [x + 12, y + 102]], {fill: '#fbfbf8', shade: '#dedcd5', seed: 91, lw: 6});
  draw([[x + 9, y + 28], [x + 101, y + 28], [x + 97, y + 74], [x + 13, y + 74]], {fill: '#ff86ad', seed: 92, lw: 0, line: false});
  hand('ШУША.', x + 55, y + 42, 19, '#fff', 'center', -0.03); hand('НЕ ТРОГАТЬ', x + 55, y + 62, 17, '#fff', 'center', -0.03);
  draw(potato(x + 55, y, 56, 12, 93), {fill: '#f0eee8', seed: 94, lw: 5});
}

// ---------------- hands with fingers ----------------
// type: open | fist | point | hold ; ang = direction the hand points (from elbow to wrist)
function handF(x, y, ang, type, skin, skinS, seed, flip = 1) {
  const dir = [Math.cos(ang), Math.sin(ang)], nrm = [-dir[1] * flip, dir[0] * flip];
  const at = (f, s) => [x + dir[0] * f + nrm[0] * s, y + dir[1] * f + nrm[1] * s];
  const finger = (s, len, bend, w, k) => { const a = at(14, s), m = at(14 + len * .55, s + bend * .5), b = at(14 + len, s + bend); draw(tube([a, m, b], w, w * .85), {fill: skin, seed: seed + k, lw: 4.5, amp: 1}); };
  const curl = (s, k) => draw(potato(...at(24, s), 11, 10, seed + 20 + k, .15), {fill: skin, shade: skinS, seed: seed + 30 + k, lw: 4.5, amp: 1});
  if (type === 'open') { finger(-15, 34, -8, 15, 1); finger(-4, 40, -2, 15, 2); finger(7, 38, 3, 15, 3); finger(17, 30, 8, 13, 4); }
  else if (type === 'point') { curl(-12, 1); curl(0, 2); curl(11, 3); finger(-16, 46, -4, 15, 4); }
  else { curl(-15, 1); curl(-4, 2); curl(7, 3); curl(17, 4); }
  draw(potato(x, y, 27, 24, seed + 40, .12).map(([px, py]) => [x + (px - x) * Math.abs(dir[0]) + (px - x) * .2, py]), {fill: skin, shade: skinS, seed: seed + 41, lw: 5.5, amp: 1.2});
  const th = type === 'open' || type === 'point' ? [at(2, -26), at(18, -40)] : [at(4, -24), at(20, -18)];
  draw(tube([at(-4, -16), ...th], 15, 13), {fill: skin, seed: seed + 42, lw: 4.5, amp: 1});
}

// ---------------- Шуша ----------------
function shusha(st) {
  const x = 470, by = Math.sin(st.time * 1.7) * 3 + st.talkW * Math.sin(st.time * 4.2) * 2.5, sh = 0;
  // legs (striped tights) + shoes
  for (const s of [-1, 1]) {
    const lx = x + s * 42, leg = tube([[lx, 1490], [lx + s * 4, 1690]], 38, 32);
    draw(leg, {fill: '#fbf5ee', seed: 300 + s, line: false});
    g.save(); pathOf(leg); g.clip(); g.fillStyle = C.tights; for (let yy = 1490; yy < 1700; yy += 30) { g.beginPath(); g.moveTo(lx - 30, yy); g.lineTo(lx + 30, yy - 5); g.lineTo(lx + 30, yy + 10); g.lineTo(lx - 30, yy + 15); g.fill(); } g.restore();
    draw(leg, {seed: 302 + s, lw: 6});
    draw(potato(lx + s * 16, 1700, 50, 26, 304 + s, .12), {fill: '#fbfbf8', shade: '#cfd6dc', seed: 306 + s, lw: 7});
    stroke([[lx + s * 16 - 34, 1712], [lx + s * 16 + 34, 1710]], 5, 308 + s);
  }
  // hoodie body
  draw([[x - 92, 1190 + by], [x + 94, 1188 + by], [x + 138, 1505], [x - 136, 1510]], {fill: C.hoodie, shade: C.hoodieS, seed: 310, lw: 8});
  draw([[x - 70, 1395], [x + 72, 1392], [x + 66, 1462], [x - 64, 1465]], {fill: C.hoodieS, seed: 311, lw: 6});
  stroke([[x - 20, 1205 + by], [x - 28, 1290 + by]], 5, 312); stroke([[x + 22, 1205 + by], [x + 26, 1292 + by]], 5, 313);
  // arms
  const poses = {
    down: [[[x - 125, 1340], [x - 122, 1450]], [[x + 125, 1340], [x + 120, 1450]]],
    hips: [[[x - 172, 1320], [x - 112, 1402]], [[x + 172, 1320], [x + 112, 1402]]],
    up: [[[x - 172, 1110], [x - 150, 960]], [[x + 172, 1110], [x + 150, 960]]],
    point: [[[x - 190, 1205], [x - 282, 1132]], [[x + 125, 1340], [x + 120, 1450]]],
    cross: [[[x - 70, 1335], [x + 62, 1300]], [[x + 70, 1335], [x - 62, 1300]]],
    sneakers: [[[x - 170, 1330], [x - 80, 1290]], [[x + 170, 1330], [x + 80, 1290]]],
  };
  const A = poses[st.prevPose || 'down'], B = poses[st.pose || 'down'], kk = st.poseK ?? 1, mix = (p, q) => [p[0] + (q[0] - p[0]) * kk, p[1] + (q[1] - p[1]) * kk];
  const P = [0, 1].map(k => [mix(A[k][0], B[k][0]), mix(A[k][1], B[k][1])]), shoulders = [[x - 92, 1225 + by], [x + 92, 1225 + by]];
  const HT = {down: ['open', 'open'], hips: ['fist', 'fist'], up: ['open', 'open'], point: ['point', 'open'], cross: ['fist', 'fist'], sneakers: ['hold', 'hold']};
  for (let k = 0; k < 2; k++) { const [e, h] = P[k]; const ee = [e[0], e[1] + by], hh = [h[0], h[1] + by]; draw(tube([shoulders[k], ee, hh], 40, 32), {fill: C.hoodie, shade: C.hoodieS, seed: 320 + k, lw: 7});
    if (st.pose === 'sneakers' && kk > .6) continue;
    handF(hh[0], hh[1], Math.atan2(hh[1] - ee[1], hh[0] - ee[0]), (kk < .5 ? HT[st.prevPose || 'down'] : HT[st.pose || 'down'])[k], C.skin, C.skinS, 600 + k * 50, k ? -1 : 1); }
  if (st.pose === 'sneakers' && kk > .6) for (const s of [-1, 1]) { const cx = x + s * 78, cy = 1262 + by; draw([[cx - 70, cy + 30], [cx - 66, cy - 20], [cx - 10, cy - 30], [cx + 30, cy - 4], [cx + 76, cy + 6], [cx + 74, cy + 34]], {fill: '#ff8fc0', shade: '#e0679f', seed: 380 + s, lw: 6}); stroke([[cx - 72, cy + 34], [cx + 76, cy + 36]], 9, 382 + s); for (let k = 0; k < 3; k++) stroke([[cx - 40 + k * 16, cy - 18], [cx - 32 + k * 16, cy - 4]], 4, 384 + k); }
  // neck
  draw(tube([[x + sh, 1110 + by], [x + sh, 1200 + by]], 48, 54), {fill: C.skinS, seed: 340, lw: 6});
  const hx = x + sh, hy = 975 + by;
  // hair buns (spiky)
  for (const s of [-1, 1]) { const bx = hx + s * 128, byy = hy - 178, pts = []; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283 + s * .2, rad = k % 2 ? 46 : 84 + (k % 4) * 6; pts.push([bx + Math.cos(a) * rad, byy + Math.sin(a) * rad]); } draw(pts, {fill: C.hair, shade: C.hairS, seed: 350 + s, lw: 7}); }
  draw(potato(hx, hy - 50, 178, 120, 353, .06), {fill: C.hair, shade: C.hairS, seed: 354, lw: 8});
  // face (big potato head)
  draw(potato(hx, hy + 20, 165, 148, 355, .07), {fill: C.skin, shade: C.skinS, shadeDir: [18, 14], seed: 356, lw: 8});
  // bangs zigzag
  const bang = [[hx - 168, hy - 30]]; for (let k = 0; k <= 8; k++) bang.push([hx - 152 + k * 38, hy - (k % 2 ? 58 : 96) + (k * 7 % 11)]); bang.push([hx + 168, hy - 34], [hx + 150, hy - 140], [hx - 150, hy - 142]);
  draw(bang, {fill: C.hair, shade: C.hairS, shadeDir: [0, 14], seed: 357, lw: 7});
  spot(hx - 112, hy + 72, 40, 24, C.blush); spot(hx + 112, hy + 72, 40, 24, C.blush);
  // eyes
  for (const s of [-1, 1]) {
    const ex = hx + s * 62, ey = hy + 8;
    if (st.blink) { curve([ex - 30, ey], [ex, ey + 8], [ex + 30, ey], 7, 360 + s); continue; }
    if (st.flat) { draw(potato(ex, ey + 6, 30, 30, 362 + s, .1), {fill: '#fffdf8', seed: 364 + s, lw: 6}); draw(potato(ex, ey + 14, 9, 10, 366 + s), {fill: C.ink, line: false, seed: 1}); draw([[ex - 34, ey - 26], [ex + 34, ey - 26], [ex + 34, ey + 6], [ex - 34, ey + 6]], {fill: C.skin, line: false, seed: 2, amp: 0, offset: 0}); stroke([[ex - 32, ey + 6], [ex + 32, ey + 6]], 7, 370 + s); continue; }
    draw(potato(ex, ey, 33, 42, 362 + s, .1), {fill: '#fffdf8', seed: 364 + s, lw: 6});
    const px = st.look === 'left' ? -12 : st.look === 'right' ? 12 : 0;
    draw(potato(ex + px, ey + 7, 11, 13, 366 + s), {fill: C.ink, seed: 368 + s, lw: 0, line: false});
    if (st.angry) curve([ex - 38 * -s, ey - 66], [ex, ey - 60], [ex + 38 * -s, ey - 44], 9, 370 + s); else curve([ex - 30, ey - 62], [ex, ey - 72], [ex + 30, ey - 62], 7, 370 + s);
  }
  stroke([[hx + 2, hy + 28], [hx - 14, hy + 62], [hx + 8, hy + 64]], 5, 374); // nose
  const m = st.mouth || 0, my = hy + 106;
  if (m < 0.15) { if (st.angry) curve([hx - 34, my + 6], [hx, my - 10], [hx + 34, my + 6], 7, 375); else curve([hx - 32, my], [hx, my + 14], [hx + 32, my], 7, 375); }
  else { const h = m < 0.45 ? 14 : 30; draw(potato(hx, my + 4, 34 + h * .3, h, 376, .12), {fill: '#8f2b33', seed: 377, lw: 6}); if (h > 20) spot(hx, my + 4 + h * .45, 16, 9, 'rgba(255,130,140,0.9)'); }
}

// ---------------- Кеша ----------------
function keshaBody(st) {
  const x = 870, by = st.by;
  draw([[x - 122, 1092 + by], [x + 118, 1088 + by], [x + 172, 1300], [x - 168, 1304]], {fill: C.khood, shade: C.khoodS, seed: 400, lw: 8});
  stroke([[x - 30, 1102 + by], [x - 36, 1180 + by]], 5, 401); stroke([[x + 30, 1102 + by], [x + 34, 1182 + by]], 5, 402);
  draw(tube([[x, 1010 + by], [x, 1100 + by]], 62, 70), {fill: C.kskinS, seed: 403, lw: 6});
  const hx = x, hy = 900 + by;
  draw(potato(hx, hy, 118, 162, 404, .06), {fill: C.kskin, shade: C.kskinS, shadeDir: [16, 10], seed: 405, lw: 8});
  // beanie
  const bean = []; for (let k = 0; k <= 20; k++) { const a = Math.PI + k / 20 * Math.PI; bean.push([hx + Math.cos(a) * 124, hy - 66 + Math.sin(a) * 175]); }
  draw(bean, {fill: C.beanie, shade: C.beanieS, seed: 406, lw: 8});
  for (let k = 0; k < 6; k++) stroke([[hx - 90 + k * 36, hy - 110], [hx - 84 + k * 34, hy - 200 + Math.abs(k - 2.5) * 12]], 3, 407 + k, 2);
  draw(rr(hx - 132, hy - 96, 264, 52, 18), {fill: C.beanieS, seed: 414, lw: 7});
  draw(potato(hx + 12, hy - 236, 32, 27, 415, .2), {fill: '#f5a9d8', seed: 416, lw: 6});
  // eyes (sleepy)
  for (const s of [-1, 1]) {
    const ex = hx + s * 48, ey = hy - 4;
    if (st.blink || st.happy) { if (st.happy) curve([ex - 24, ey + 6], [ex, ey - 12], [ex + 24, ey + 6], 7, 420 + s); else curve([ex - 24, ey], [ex, ey + 4], [ex + 24, ey], 7, 420 + s); continue; }
    const open = st.surprised ? 1 : 0.5;
    draw(potato(ex, ey, 27, 30, 422 + s, .1), {fill: '#fffdf8', seed: 424 + s, lw: 0, line: false});
    draw(potato(ex - 4, ey + 9, 10, 12, 426 + s), {fill: C.ink, line: false, seed: 428 + s});
    if (open < 1) draw([[ex - 30, ey - 32], [ex + 30, ey - 32], [ex + 30, ey - 2], [ex - 30, ey - 2]], {fill: C.kskin, line: false, seed: 430 + s, offset: 0, amp: 0});
    draw(potato(ex, ey, 27, 30, 422 + s, .1), {seed: 432 + s, lw: 6});
    stroke([[ex - 30, ey - 30 + 60 * (1 - open)], [ex + 30, ey - 30 + 60 * (1 - open)]], 6, 434 + s);
  }
  draw(potato(hx + 8, hy + 54, 26, 34, 436, .12), {fill: '#e39d78', shade: '#c9805d', seed: 437, lw: 6});
  g.fillStyle = 'rgba(60,40,30,0.5)'; const r = rng(438); for (let k = 0; k < 34; k++) { const a = 0.3 + r() * 2.5, rad = 70 + r() * 30; g.beginPath(); g.arc(hx + Math.cos(a) * rad * (r() < .5 ? 1 : -1), hy + 72 + Math.sin(a) * 50, 2 + r() * 1.5, 0, 7); g.fill(); }
  const m = st.mouth || 0, my = hy + 114;
  if (m < 0.15) stroke([[hx - 30, my], [hx + 2, my + 2], [hx + 30, my - 5]], 7, 440); else { const h = m < 0.45 ? 10 : 22; draw(potato(hx, my, 30, h, 441, .12), {fill: '#7a2b2b', seed: 442, lw: 6}); }
}
function keshaArms(st) {
  const x = 870, by = st.by, sp = st.spoon || 0, h = [x - 150, 1230 - sp * 230];
  draw(tube([[x - 110, 1130 + by], [x - 190, 1240 - sp * 60], h], 42, 36), {fill: C.khood, shade: C.khoodS, seed: 450, lw: 7});
  if (st.item === 'chip') draw(potato(h[0] + 22, h[1] - 40, 30, 22, 453, .25), {fill: '#f2c45a', shade: '#d9a43a', seed: 454, lw: 5});
  else { stroke([[h[0] - 10, h[1]], [h[0] + 50, h[1] - 92]], 10, 451); stroke([[h[0] - 10, h[1]], [h[0] + 50, h[1] - 92]], 5, 452);
  draw(potato(h[0] + 56, h[1] - 106, 16, 24, 453), {fill: '#dfe3ea', seed: 454, lw: 5}); }
  handF(h[0], h[1], -1.2 - sp * 0.4, 'hold', C.kskin, C.kskinS, 700, -1);
  draw(tube([[x + 110, 1130 + by], [x + 172, 1232], [x + 82, 1250]], 42, 36), {fill: C.khood, shade: C.khoodS, seed: 457, lw: 7});
  handF(x + 80, 1250, Math.PI + 0.25, 'open', C.kskin, C.kskinS, 760, -1);
}

// ---------------- direction ----------------
const DIR = EP.dir;
const CAMS = {wide: {z: 1, cx: W / 2, cy: H / 2}, sh: {z: 1.6, cx: 470, cy: 1060}, ke: {z: 1.6, cx: 860, cy: 1060}};

function frame(time) {
  let cur = null, last = CUE[0]; for (const c of CUE) { if (time >= c.t0) last = c; if (time >= c.t0 && time < c.t1) cur = c; }
  const d = DIR[last.i], cam = time < CUE[0].t0 ? CAMS.wide : CAMS[d.cam];
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  const mouth = (who) => { if (!cur || cur.who !== who) return 0; return cur.env[Math.floor((time - cur.t0) * FPS)] || 0; };
  const blinkAt = (seed) => ((time + seed) % 3.7) < 0.12;
  const lastOf = (who) => { let r = null, t0 = 0, pr = null; for (const c of CUE) if (c.who === who && time >= c.t0) { pr = r; r = DIR[c.i]; t0 = c.t0; } return [r || {}, t0, pr || {}]; };
  const [sd, st0, sprev] = lastOf('sh'), [kd, kt0, kprev] = lastOf('ke');
  const talkW = (who) => (cur && cur.who === who ? clamp((time - cur.t0) / 0.25) * clamp((cur.t1 - time) / 0.25) : 0);
  (EP.set === 'room' ? room : kitchen)(time);
  const kst = {time, by: Math.sin(time * 1.5 + 1) * 3 + talkW('ke') * Math.sin(time * 3.6) * 2, mouth: mouth('ke'), blink: blinkAt(1.3), spoon: lerpE(kprev.spoon || 0, kd.spoon || 0, (time - kt0) / 0.5), happy: kd.happy, surprised: kd.surprised, item: EP.item};
  if (EP.set === 'room') { sofaBack(); keshaBody(kst); sofaFront(); keshaArms(kst); bowl(); } else { keshaBody(kst); table(); cup(); keshaArms(kst); }
  shusha({time, talkW: talkW('sh'), mouth: mouth('sh'), blink: blinkAt(0), pose: sd.pose, prevPose: sprev.pose, poseK: ease((time - st0) / 0.45), angry: sd.angry, flat: sd.flat, look: sd.look});
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(PAPER, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,0.12)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (cur) subtitle(cur.text, cur.who);
  if (time < CUE[0].t0 + 1.2) { g.globalAlpha = clamp(CUE[0].t0 + 1.2 - time); hand(EP.title, W / 2, 200, 70, '#fffaf0'); g.globalAlpha = 1; }
}
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
const lerpE = (a, b, k) => a + (b - a) * ease(k);
function wrap(text, maxW) { const words = text.split(' '), out = []; let l = ''; for (const w of words) { const t = l ? l + ' ' + w : w; if (g.measureText(t).width > maxW && l) { out.push(l); l = w; } else l = t; } out.push(l); return out; }
function subtitle(text, who) {
  g.font = `66px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const ls = wrap(text, 920);
  ls.forEach((l, i) => { const y = 1470 + i * 76 - (ls.length - 1) * 38; g.lineWidth = 10; g.strokeStyle = 'rgba(30,20,15,0.9)'; g.lineJoin = 'round'; g.strokeText(l, W / 2, y); g.fillStyle = who === 'sh' ? '#fffaf0' : '#cdeffa'; g.fillText(l, W / 2, y); });
}

// ---------------- output ----------------
const cv = createCanvas(W, H); g = cv.getContext('2d');
const outDir = path.join(D, 'out'), out = path.join(outDir, EP.out);
if (STILLS) { for (const s of STILLS.split(',').map(Number)) { frame(s); fs.writeFileSync(path.join(outDir, `still_${s}.png`), cv.toBuffer('image/png')); } process.exit(0); }
const silent = path.join(tmp, 'silent.mp4');
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', FPS, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', silent], {stdio: ['pipe', 'inherit', 'inherit']});
(async () => {
  for (let i = 0; i < Math.round(TOTAL * FPS); i++) { frame(i / FPS); const b = Buffer.from(g.getImageData(0, 0, W, H).data.buffer); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const args = ['-y', '-v', 'error', '-i', silent, '-stream_loop', '-1', '-i', path.join(D, `sfx/${EP.amb}.mp3`)];
  const ev = CUE.map(c => [c.wav, c.t0, 1.0]);
  if (EP.end) ev.push([path.join(D, `sfx/${EP.end}.mp3`), CUE[CUE.length - 1].t1 + 0.2, 0.8]);
  for (const [li, n, dt, v] of EP.sfx || []) ev.push([path.join(D, `sfx/${n}.mp3`), CUE[li].t0 + dt, v]);
  ev.forEach(([f]) => args.push('-i', f));
  let fc = `[1:a]atrim=0:${TOTAL},asetpts=N/SR/TB,volume=0.12,afade=t=in:d=0.4,afade=t=out:st=${(TOTAL - 0.6).toFixed(2)}:d=0.6[h]`; const lab = ['[h]'];
  ev.forEach(([, s, v], i) => { const ms = Math.round(s * 1000); fc += `;[${i + 2}:a]aresample=48000,volume=${v},adelay=${ms}|${ms}[e${i}]`; lab.push(`[e${i}]`); });
  fc += `;${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=first,alimiter=limit=0.9[a]`;
  args.push('-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', TOTAL.toFixed(2), '-movflags', '+faststart', out);
  if (spawnSync('ffmpeg', args, {stdio: 'inherit'}).status) throw new Error('mix failed');
  fs.rmSync(tmp, {recursive: true, force: true}); console.log(out, TOTAL.toFixed(2));
})();
