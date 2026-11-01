// The Great Molasses Flood — 30s teaser. Dark archival documentary, 1920x1080 @30fps.
// Usage: node render.js video out.mp4 [t0 t1] | still t1,t2,... out.png
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const W = 1920, H = 1080, FPS = 30, DUR = 30;
const WORDS = JSON.parse(fs.readFileSync(__dirname + '/vo/words.json'));
const F = t => 0.35 + t / 1.1;                       // original voice time -> final time (atempo 1.1 + 0.35 lead)
const wt = (txt, nth = 0) => { let n = 0; for (const [w, a] of WORDS) if (w.toLowerCase().startsWith(txt.toLowerCase())) { if (n++ === nth) return F(a); } throw new Error('word ' + txt); };

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = { out: u => 1 - Math.pow(1 - clamp(u), 3), in: u => Math.pow(clamp(u), 3), io: u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; } };
const lerp = (a, b, u) => a + (b - a) * u;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// palette
const C = { ink: '#0a0806', paper: '#e3d4ae', sep1: '#2a2118', sep2: '#4a3b2a', sep3: '#7a6849', sep4: '#a8946c', amber: '#d98f2b', mol: '#3a1d0b', mol2: '#6b3511', red: '#b02a1c' };
const MONO = '"JetBrains Mono", monospace', SANS = '"Inter Display", "Inter", sans-serif', SERIF = '"Bitstream Charter", "DejaVu Serif", serif';

function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.w || 800} ${o.size || 60}px ${o.font || SANS}`;
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  try { ctx.letterSpacing = (o.ls || 0) + 'px'; } catch (e) {}
  ctx.globalAlpha = o.a == null ? 1 : o.a;
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur || 20; ctx.shadowOffsetY = 4; }
  if (o.stroke) { ctx.lineWidth = o.sw || 6; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color || C.paper; ctx.fillText(s, x, y);
  ctx.restore();
}
const measure = (ctx, s, size, font = SANS, w = 800, ls = 0) => { ctx.save(); ctx.font = `${w} ${size}px ${font}`; try { ctx.letterSpacing = ls + 'px'; } catch (e) {} const m = ctx.measureText(s).width; ctx.restore(); return m; };
const typed = (s, t, t0, cps = 22) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

// ---------- shared pieces ----------
function sky(ctx, top, bot) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function skyline(ctx, seed, base, hmin, hmax, color, x0 = -50, x1 = W + 50, wmin = 70, wmax = 190, windows = 0, wcolor = 'rgba(0,0,0,.25)') {
  const r = rng(seed); let x = x0;
  while (x < x1) {
    const w = wmin + r() * (wmax - wmin), h = hmin + r() * (hmax - hmin);
    ctx.fillStyle = color; ctx.fillRect(x, base - h, w + 1, h + 2);
    if (r() < .35) { ctx.beginPath(); ctx.moveTo(x - 4, base - h); ctx.lineTo(x + w / 2, base - h - 30 - r() * 30); ctx.lineTo(x + w + 4, base - h); ctx.fill(); }
    if (windows) { ctx.fillStyle = wcolor; for (let wy = base - h + 24; wy < base - 20; wy += 38) for (let wx = x + 14; wx < x + w - 24; wx += 30) if (r() < windows) ctx.fillRect(wx, wy, 14, 22); }
    x += w + (r() < .3 ? 6 : 0);
  }
}
function steeple(ctx, x, base, h, color) {
  ctx.fillStyle = color; ctx.fillRect(x - 38, base - h * .55, 76, h * .55);
  ctx.fillRect(x - 28, base - h * .78, 56, h * .24);
  ctx.beginPath(); ctx.moveTo(x - 24, base - h * .78); ctx.lineTo(x, base - h); ctx.lineTo(x + 24, base - h * .78); ctx.fill();
  ctx.fillRect(x - 1.5, base - h - 40, 3, 40);
}
function snow(ctx, t, n = 160, spd = 90, a = .7) {
  const r = rng(77); ctx.fillStyle = `rgba(235,225,200,${a})`;
  for (let i = 0; i < n; i++) { const x0 = r() * W, y0 = r() * H, s = 1 + r() * 3, v = spd * (.5 + r()); const x = (x0 + Math.sin(t * .7 + i) * 30 - t * 18 + W * 2) % W, y = (y0 + t * v) % H; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); }
}
function dimLine(ctx, x, y0, y1, label, a = 1, side = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.amber; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.setLineDash([]);
  for (const y of [y0, y1]) { ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y); ctx.stroke(); }
  txt(ctx, label, x + 34 * side, (y0 + y1) / 2 + 14, { size: 44, font: MONO, w: 700, color: C.amber, align: side > 0 ? 'left' : 'right', shadow: '#000', blur: 12 });
  ctx.restore();
}
function plate(ctx, tag, a = 1) { // archive plate marker
  ctx.save(); ctx.globalAlpha = .75 * a; txt(ctx, tag, 70, 70, { size: 22, font: MONO, w: 500, ls: 4, color: C.sep4 }); ctx.restore();
}

const IMG = {}; const loadAll = async () => { for (const [k, f] of Object.entries({ tank: 'tank_before.jpg', after: 'boston_molasses_disaster.jpg', crew: 'wreckage_elevated_tracks.jpg' })) IMG[k] = await loadImage(__dirname + '/photos/' + f); };
function cover(ctx, im, x, y, w, h, zoom = 1, fx = .5, fy = .5) { // draw image to fill rect, zoom toward focus (fx,fy)
  const sc = Math.max(w / im.width, h / im.height) * zoom, sw = w / sc, sh = h / sc, sx = clamp(fx * im.width - sw / 2, 0, im.width - sw), sy = clamp(fy * im.height - sh / 2, 0, im.height - sh);
  ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
}
function tag(ctx, s, a = 1) { ctx.save(); ctx.fillStyle = 'rgba(8,6,4,.7)'; const w = measure(ctx, s, 24, MONO, 600, 4) + 40; ctx.fillRect(W - 70 - w, H - 110, w, 48); txt(ctx, s, W - 90, H - 77, { size: 24, font: MONO, w: 600, ls: 4, align: 'right', color: C.sep4, a }); ctx.restore(); }
function topShade(ctx, a = .7, h = 620) { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(6,4,2,${a})`); g.addColorStop(1, 'rgba(6,4,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, h); }

// ---------- S1: Boston, Jan 15 1919 ----------
function s1(ctx, t) {
  const u = t / 4.6;
  ctx.save(); ctx.translate(W / 2, H / 2); const z = 1.0 + u * .1; ctx.scale(z, z); ctx.translate(-W / 2 - u * 30, -H / 2);
  sky(ctx, '#4a4338', '#b8a984');
  // far hazy
  skyline(ctx, 11, 700, 110, 240, '#8a7c62', -50, W + 50, 80, 160);
  steeple(ctx, 1280, 700, 560, '#6d6049');
  skyline(ctx, 22, 760, 150, 320, '#5b4e3b', -50, W + 50, 90, 200, .5, 'rgba(10,8,4,.35)');
  steeple(ctx, 420, 760, 420, '#3d3427');
  skyline(ctx, 33, 860, 120, 260, '#2e261b', -50, W + 50, 110, 240, .35, 'rgba(180,150,90,.22)');
  // harbor / street
  const g = ctx.createLinearGradient(0, 840, 0, H); g.addColorStop(0, '#1d1812'); g.addColorStop(1, '#0a0806'); ctx.fillStyle = g; ctx.fillRect(0, 840, W, 300);
  ctx.fillStyle = 'rgba(200,185,150,.08)'; for (let i = 0; i < 14; i++) ctx.fillRect(0, 870 + i * 17 + Math.sin(t * 2 + i) * 2, W, 2);
  snow(ctx, t); ctx.restore();
  // data inserts
  const a = ease.out((t - .3) / .4);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(8,6,4,.72)'; ctx.fillRect(90, 760, 940, 210);
  ctx.fillStyle = C.amber; ctx.fillRect(90, 760, 8, 210);
  const d = typed('JANUARY 15, 1919', t, .5, 26); txt(ctx, d + (Math.floor(t * 3) % 2 ? '_' : ' '), 130, 850, { size: 76, font: MONO, w: 700, color: C.paper });
  txt(ctx, typed('BOSTON, MASSACHUSETTS', t, 1.6, 30), 130, 925, { size: 40, font: MONO, w: 500, color: C.sep4, ls: 3 });
  ctx.restore();
  const clk = ease.out((t - 3.0) / .3); txt(ctx, '12:30 P.M.', W - 90, 860, { size: 54, font: MONO, w: 700, align: 'right', color: C.amber, a: clk * (1 - ease.in((t - 4.3) / .3)), shadow: '#000' });
  plate(ctx, 'ARCHIVE · NORTH END · 1919', a);
}

// ---------- S2: the tank ----------
function tank(ctx, t, shake) {
  const x0 = 560, x1 = 1360, top = 270, base = 800, rx = (x1 - x0) / 2, cx = (x0 + x1) / 2;
  ctx.save(); ctx.translate(shake.x, shake.y);
  const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#15110c'); g.addColorStop(.3, '#5d5037'); g.addColorStop(.55, '#7a6a48'); g.addColorStop(1, '#14100b');
  ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, base - top);
  ctx.beginPath(); ctx.ellipse(cx, base, rx, 46, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#8a7a58'; ctx.beginPath(); ctx.ellipse(cx, top, rx, 46, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4b3f2b'; ctx.beginPath(); ctx.ellipse(cx, top, rx - 14, 36, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3;
  for (let y = top + 90; y < base; y += 90) { ctx.beginPath(); ctx.ellipse(cx, y, rx, 46, 0, 0, Math.PI); ctx.stroke(); }
  const r = rng(5);
  for (let y = top + 90; y < base + 40; y += 90) for (let x = x0 + 26; x < x1; x += 40) { const yy = y + 46 * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2))); ctx.fillStyle = 'rgba(20,14,8,.55)'; ctx.beginPath(); ctx.arc(x, yy - 8, 3.2, 0, 7); ctx.fill(); }
  for (let i = 0; i < 9; i++) { const x = x0 + 60 + r() * 680; ctx.fillStyle = 'rgba(70,40,12,.35)'; ctx.fillRect(x, top + 40, 6 + r() * 10, 100 + r() * 360); }
  // sweet leaks near the end
  ctx.fillStyle = 'rgba(58,29,11,.85)'; for (let i = 0; i < 6; i++) { const lt = clamp((t - (7.0 + i * .2)) / 1.2); ctx.fillRect(x0 + 120 + i * 120, top + 220 + i * 18, 7, lt * 260); }
  // cracks
  const cr = clamp((t - 7.7) / 1.0); if (cr > 0) { ctx.strokeStyle = '#0a0705'; ctx.lineWidth = 5; ctx.beginPath(); let x = cx - 40, y = top + 80; ctx.moveTo(x, y); const rr = rng(9); for (let i = 0; i < 12 * cr; i++) { x += (rr() - .45) * 60; y += 34; ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.restore();
}
function s2(ctx, t) { // t = scene local
  const T = t + 4.6, boom = wt('exploded'), st = T;
  sky(ctx, '#3f392f', '#9d8f74');
  skyline(ctx, 41, 880, 90, 200, '#2a2218', -50, 520, 90, 150); skyline(ctx, 42, 880, 90, 200, '#2a2218', 1400, W + 50, 90, 150);
  ctx.fillStyle = '#1a150e'; ctx.beginPath(); ctx.moveTo(0, 830); ctx.quadraticCurveTo(W / 2, 760, W, 830); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  snow(ctx, T, 90, 70, .5);
  const amp = T < boom ? clamp((T - 6.6) / 2.1) * 9 : 0; const r = rng(Math.floor(T * 30));
  const shake = { x: (r() - .5) * amp * 2, y: (r() - .5) * amp };
  if (T < boom) {
    const pu = clamp((T - 4.6) / 4.2), pw = 969, ph = 760; ctx.save(); ctx.translate(1375 + shake.x, 650 + shake.y); ctx.rotate(-.025 + shake.x * .002); ctx.scale(1 + pu * .07, 1 + pu * .07);
    ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = '#d9cdb0'; ctx.fillRect(-pw / 2 - 16, -ph / 2 - 16, pw + 32, ph + 32); ctx.shadowColor = 'transparent';
    cover(ctx, IMG.tank, -pw / 2, -ph / 2, pw, ph); ctx.restore();
  }
  else { // burst
    const b = T - boom; ctx.save(); ctx.translate((r() - .5) * 24 * (1 - clamp(b / .8)), (r() - .5) * 16 * (1 - clamp(b / .8)));
    const gg = ctx.createRadialGradient(960, 560, 10, 960, 560, 200 + b * 1400); gg.addColorStop(0, `rgba(255,236,190,${1 - clamp(b / .35)})`); gg.addColorStop(.35, `rgba(140,76,22,${.9 - clamp(b / 1.1) * .4})`); gg.addColorStop(1, 'rgba(20,10,4,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
    const rr = rng(3); ctx.fillStyle = C.mol; for (let i = 0; i < 70; i++) { const a = rr() * 6.28, v = 300 + rr() * 1300, s = 6 + rr() * 22; ctx.beginPath(); ctx.arc(960 + Math.cos(a) * v * b, 560 + Math.sin(a) * v * b * .8 + 500 * b * b, s * (1 - clamp(b / 1.2) * .4), 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = `rgba(255,248,230,${.95 * (1 - clamp(b / .22))})`; ctx.fillRect(0, 0, W, H); tag(ctx, 'ILLUSTRATION');
  }
  if (T < boom) {
    // inserts
    const a1 = ease.out((T - wt('two') + .1) / .3) * (T < boom ? 1 : 0);
    const n = Math.round(2300000 * ease.out((T - wt('two')) / (wt('gallons') - wt('two') + .3)));
    ctx.fillStyle = 'rgba(8,6,4,.72)'; ctx.fillRect(90, 90, 760, 210); ctx.fillStyle = C.amber; ctx.fillRect(90, 90, 8, 210);
    ctx.save(); ctx.globalAlpha = a1;
    txt(ctx, n.toLocaleString('en-US'), 130, 205, { size: 112, font: MONO, w: 800, color: C.paper });
    txt(ctx, 'GALLONS OF MOLASSES', 130, 265, { size: 38, font: MONO, w: 500, ls: 3, color: C.amber });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = ease.out((T - 5.3) / .4); ctx.fillStyle = 'rgba(8,6,4,.72)'; ctx.fillRect(90, 330, 760, 120); ctx.fillStyle = C.amber; ctx.fillRect(90, 330, 8, 120);
    txt(ctx, '50 FT TALL · 90 FT WIDE', 130, 405, { size: 44, font: MONO, w: 700, color: C.paper }); ctx.restore();
    tag(ctx, 'ARCHIVAL PHOTO · THE TANK, BEFORE', ease.out((T - 5.0) / .4));
    plate(ctx, 'PURITY DISTILLING CO. · NORTH END, BOSTON', ease.out((T - 4.9) / .4));
  }
}

// ---------- S3: the wave ----------
function s3(ctx, t) {
  const T = t + 9.6, T0 = 9.6, T1 = 15.7, u = (T - T0) / (T1 - T0);
  const r = rng(Math.floor(T * 30) + 5); const sx = (r() - .5) * 8 * u, sy = (r() - .5) * 6 * u;
  ctx.save(); ctx.translate(sx, sy);
  sky(ctx, '#3b352c', '#a39578');
  skyline(ctx, 51, 790, 300, 600, '#3a3024', -60, W + 60, 170, 260, .5, 'rgba(210,180,110,.18)');
  skyline(ctx, 52, 820, 240, 470, '#241d15', -60, W + 60, 140, 240, .45, 'rgba(210,180,110,.14)');
  ctx.fillStyle = '#17120c'; ctx.fillRect(0, 800, W, 300); ctx.strokeStyle = 'rgba(180,160,110,.12)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 830 + i * 45); ctx.lineTo(W, 830 + i * 45); ctx.stroke(); }
  // people for scale (6ft = 72px)
  for (const px of [260, 330, 450, 700]) { ctx.fillStyle = '#0c0906'; ctx.beginPath(); ctx.arc(px, 800 - 66, 8, 0, 7); ctx.fill(); ctx.fillRect(px - 8, 800 - 58, 16, 40); ctx.fillRect(px - 8, 800 - 18, 6, 18); ctx.fillRect(px + 2, 800 - 18, 6, 18); }
  // wave
  const xf = lerp(W + 360, -520, ease.io(clamp((T - T0 + .2) / (T1 - T0 + .1)))) ; const base = 800, hh = 480;
  ctx.beginPath(); ctx.moveTo(xf, base);
  ctx.bezierCurveTo(xf - 10, base - hh * .55, xf + 20, base - hh * .9, xf + 120, base - hh);
  ctx.bezierCurveTo(xf + 40, base - hh * .96, xf - 36, base - hh * .86, xf - 4, base - hh * .74); // curl lip
  ctx.lineTo(xf - 4, base - hh * .74); ctx.bezierCurveTo(xf + 150, base - hh * .98, xf + 300, base - hh * .8, xf + 560, base - hh * .8);
  for (let x = xf + 560; x < W + 800; x += 40) ctx.lineTo(x, base - hh * .8 + Math.sin(x * .02 + T * 5) * 10);
  ctx.lineTo(W + 800, base + 300); ctx.lineTo(xf, base + 300); ctx.closePath();
  const wg = ctx.createLinearGradient(0, base - hh, 0, base); wg.addColorStop(0, '#6b3511'); wg.addColorStop(.35, '#3f1f0b'); wg.addColorStop(1, '#1a0b04'); ctx.fillStyle = wg; ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(230,150,60,.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(xf + 30, base - hh * .9); ctx.bezierCurveTo(xf + 170, base - hh, xf + 320, base - hh * .82, xf + 600, base - hh * .8); ctx.stroke(); ctx.restore();
  // debris at front
  const dr = rng(14); ctx.fillStyle = '#120a05'; for (let i = 0; i < 18; i++) { const dx = xf - 30 + dr() * 140, dy = base - 20 - dr() * 420, s = 8 + dr() * 16; ctx.save(); ctx.translate(dx, dy + Math.sin(T * 6 + i) * 6); ctx.rotate(dr() * 6 + T * 2); ctx.fillRect(-s, -s / 3, s * 2, s / 1.5); ctx.restore(); }
  ctx.restore();
  // HUD
  const a1 = ease.out((T - wt('forty') + .15) / .3);
  if (a1 > 0) { const y0 = base - hh - 80 + 0, y1 = base - 80; ctx.save(); ctx.globalAlpha = a1; ctx.fillStyle = 'rgba(8,6,4,.7)'; ctx.fillRect(110, 140, 520, 190); ctx.fillStyle = C.amber; ctx.fillRect(110, 140, 8, 190);
    const h = Math.round(40 * ease.out((T - wt('forty')) / .6)); txt(ctx, h + ' FT', 150, 255, { size: 120, font: MONO, w: 800 }); txt(ctx, 'WAVE HEIGHT', 150, 310, { size: 34, font: MONO, w: 500, ls: 3, color: C.amber }); ctx.restore(); }
  const a2 = ease.out((T - wt('thirty-five') + .15) / .3);
  if (a2 > 0) { ctx.save(); ctx.globalAlpha = a2; ctx.fillStyle = 'rgba(8,6,4,.7)'; ctx.fillRect(110, 360, 520, 190); ctx.fillStyle = C.red; ctx.fillRect(110, 360, 8, 190);
    const v = Math.round(35 * ease.out((T - wt('thirty-five')) / .7)); txt(ctx, v + ' MPH', 150, 475, { size: 120, font: MONO, w: 800 }); txt(ctx, 'SPEED', 150, 530, { size: 34, font: MONO, w: 500, ls: 3, color: '#e06a58' }); ctx.restore(); }
  tag(ctx, 'ILLUSTRATION · RECONSTRUCTION');
  const a3 = ease.out((T - wt('North') + .1) / .3); if (a3 > 0) txt(ctx, 'NORTH END', W - 100, 130, { size: 52, font: MONO, w: 700, ls: 6, align: 'right', color: C.paper, a: a3, shadow: '#000' });
}

// ---------- S4: destruction ----------
function flood(ctx, level, T, col1 = '#6b3511', col2 = '#1a0b04') {
  const g = ctx.createLinearGradient(0, H - level, 0, H); g.addColorStop(0, col1); g.addColorStop(.25, '#3f1f0b'); g.addColorStop(1, col2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, H - level + Math.sin(x * .012 + T * 3) * 12 + Math.sin(x * .031 - T * 2) * 6); ctx.lineTo(W, H); ctx.fill();
  ctx.strokeStyle = 'rgba(240,160,70,.4)'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x <= W; x += 30) { const y = H - level + Math.sin(x * .012 + T * 3) * 12 + Math.sin(x * .031 - T * 2) * 6; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
}
function kicker(ctx, word, T, t0, sub) {
  const u = ease.out((T - t0) / .18), s = 1.35 - .35 * u; ctx.save(); ctx.translate(W / 2, 330); ctx.scale(s, s); ctx.globalAlpha = u;
  txt(ctx, word, 0, 0, { size: 190, align: 'center', color: C.paper, ls: 14, shadow: '#000', blur: 40, stroke: 'rgba(0,0,0,.6)', sw: 10 }); ctx.restore();
  if (sub) txt(ctx, sub, W / 2, 400, { size: 36, font: MONO, w: 600, align: 'center', ls: 6, color: C.amber, a: u });
}
function s4(ctx, t) {
  const T = t + 15.7, tA = wt('crushed'), tB = wt('swallowed'), tC = wt('trapped');
  const r = rng(Math.floor(T * 30)); ctx.save(); ctx.translate((r() - .5) * 10, (r() - .5) * 8);
  if (T < tB - .12) { // CRUSHED
    const u = clamp((T - (tA - .5)) / 1.6);
    cover(ctx, IMG.after, 0, 0, W, H, 1.12 + u * .3, .62 - u * .05, .62);
    ctx.fillStyle = 'rgba(10,6,3,.28)'; ctx.fillRect(0, 0, W, H); topShade(ctx, .85, 560);
    kicker(ctx, 'CRUSHED', T, tA, 'BUILDINGS'); tag(ctx, 'ARCHIVAL PHOTO · THE AFTERMATH, 1919');
  } else if (T < tC - .12) { // SWALLOWED
    const u = clamp((T - tB) / 1.4);
    sky(ctx, '#2f2a22', '#8a7c62'); skyline(ctx, 71, 900, 200, 420, '#1c160f', -60, W + 60, 140, 240, .4, 'rgba(210,180,110,.12)');
    const hx = lerp(1300, 850, u), hy = 640 + u * 110, ph = T * 10; ctx.save(); ctx.translate(hx, hy); ctx.fillStyle = '#070503';
    ctx.beginPath(); ctx.ellipse(0, 0, 150, 60, -.05, 0, 7); ctx.fill(); // body
    ctx.beginPath(); ctx.moveTo(-110, -30); ctx.lineTo(-170, -130); ctx.lineTo(-215, -150); ctx.lineTo(-250, -120); ctx.lineTo(-215, -108); ctx.lineTo(-150, -70); ctx.lineTo(-80, 0); ctx.fill(); // neck/head
    ctx.beginPath(); ctx.moveTo(140, -30); ctx.quadraticCurveTo(230, 20, 200, 130); ctx.lineTo(180, 120); ctx.quadraticCurveTo(190, 30, 130, 10); ctx.fill(); // tail
    ctx.lineWidth = 22; ctx.strokeStyle = '#070503'; ctx.lineCap = 'round';
    for (const [lx, p] of [[-100, 0], [-60, 2], [90, 1], [120, 3]]) { const a = Math.sin(ph + p) * .55; ctx.beginPath(); ctx.moveTo(lx, 30); ctx.lineTo(lx + Math.sin(a) * 90, 30 + Math.cos(a) * 110); ctx.stroke(); }
    ctx.restore(); flood(ctx, 150 + u * 260, T); kicker(ctx, 'SWALLOWED', T, tB, 'HORSES'); tag(ctx, 'ILLUSTRATION');
  } else { // TRAPPED
    const u = clamp((T - tC) / 2.6);
    cover(ctx, IMG.crew, 0, 0, W, H, 1.0 + u * .22, .30 + u * .18, .62);
    ctx.fillStyle = 'rgba(58,29,11,.30)'; ctx.fillRect(0, 0, W, H); topShade(ctx, .9, 600);
    const bg = ctx.createLinearGradient(0, H - 360, 0, H); bg.addColorStop(0, 'rgba(58,29,11,0)'); bg.addColorStop(1, `rgba(58,29,11,${.35 + u * .5})`); ctx.fillStyle = bg; ctx.fillRect(0, H - 360, W, 360);
    tag(ctx, 'ARCHIVAL PHOTO · RESCUERS IN THE MOLASSES');
    kicker(ctx, 'TRAPPED', T, tC, 'THICK · SUFFOCATING · COLD');
  }
  ctx.restore();
}

// ---------- S5: 21 ----------
function icon(ctx, kind, x, y, s, T, tx) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = C.paper;
  if (kind === 'drop') { ctx.beginPath(); ctx.moveTo(0, -60); ctx.bezierCurveTo(50, 10, 44, 56, 0, 56); ctx.bezierCurveTo(-44, 56, -50, 10, 0, -60); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(0, -64); ctx.bezierCurveTo(46, -10, 52, 20, 40, 44); ctx.bezierCurveTo(30, 62, -30, 62, -40, 44); ctx.bezierCurveTo(-52, 20, -30, -6, -16, -22); ctx.bezierCurveTo(-12, 0, -4, 6, 0, -64); ctx.fill(); }
  const k = ease.out((T - tx) / .18); ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(-70 + 140 * k, -70 + 140 * k); ctx.stroke(); ctx.restore();
}
function s5(ctx, t) {
  const T = t + 21.5, tw = wt('Twenty-one'), tN1 = wt('Not', 0), tN2 = wt('Not', 1);
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .16; cover(ctx, IMG.after, 0, 0, W, H, 1.25 + (T - 21.5) * .02, .55, .6); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, 460, 50, W / 2, 460, 900); g.addColorStop(0, 'rgba(90,60,30,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const n = Math.round(21 * ease.out((T - tw) / .5)), mv = ease.io((T - (tN1 - .15)) / .45);
  const cy = lerp(500, 250, mv), sc = lerp(1, .55, mv);
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(sc, sc); const pop = 1 + .12 * Math.exp(-(T - tw - .45) * 12) * (T > tw + .45 ? 1 : 0);
  ctx.scale(pop, pop); txt(ctx, String(n), 0, 150, { size: 460, font: MONO, w: 800, align: 'center', color: C.paper, shadow: C.amber, blur: 50 }); ctx.restore();
  txt(ctx, 'PEOPLE DIED THAT DAY', W / 2, lerp(790, 420, mv), { size: lerp(54, 36, mv), font: MONO, w: 600, ls: 8, align: 'center', color: C.amber, a: ease.out((T - tw - .5) / .3) });
  for (const [i, tt, k, s] of [[0, tN1, 'drop', 'NOT FROM WATER.'], [1, tN2, 'fire', 'NOT FROM FIRE.']]) {
    const u = ease.out((T - tt) / .16); if (u <= 0) continue; const y = 620 + i * 190;
    ctx.save(); ctx.globalAlpha = u; ctx.translate(0, (1 - u) * 30);
    icon(ctx, k, 560, y, 1.25, T, tt + .5); txt(ctx, s, 680, y + 28, { size: 100, color: C.paper }); ctx.restore();
  }
  plate(ctx, 'BOSTON · JANUARY 15, 1919', .8);
}

// ---------- S6: "From molasses." ----------
function drips(ctx, T, tS, cover) {
  const r = rng(31); ctx.fillStyle = '#3a1d0b';
  const cols = 24, cw = W / cols;
  for (let i = 0; i < cols; i++) { const sp = .7 + r() * .6, wd = cw * (.8 + r() * .5), len = Math.min(H * 1.05, Math.max(0, (T - tS) * (900 + r() * 700) * sp) * cover); const x = i * cw + cw / 2; ctx.fillRect(x - wd / 2, -10, wd, len); ctx.beginPath(); ctx.arc(x, len - 4, wd / 2, 0, 7); ctx.fill(); }
  ctx.fillRect(0, -10, W, 40 + clamp((T - tS) / .5) * 200 * cover);
}
function s6(ctx, t) {
  const T = t + 25.6, tF = wt('From'), tM = wt('molasses.');
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  drips(ctx, T, tF - .1, 1);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(255,170,70,0)'); g.addColorStop(.5, 'rgba(255,170,70,.14)'); g.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const u1 = ease.out((T - tF) / .12), u2 = ease.out((T - tM) / .1), s2 = 1.3 - .3 * u2;
  txt(ctx, 'FROM', W / 2, 400, { size: 110, ls: 24, align: 'center', color: C.sep4, a: u1, shadow: '#000' });
  ctx.save(); ctx.translate(W / 2, 640); ctx.scale(s2, s2); txt(ctx, 'MOLASSES.', 0, 0, { size: 250, align: 'center', color: C.amber, a: u2, shadow: '#000', blur: 40, stroke: '#2a1304', sw: 8 }); ctx.restore();
}

// ---------- S7: tagline ----------
function s7(ctx, t) {
  const T = t + 27.0, tT = wt('This'), tY = wt('they'), tI = wt('in', 1);
  ctx.fillStyle = '#1a0b04'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * .45, 60, W / 2, H * .45, 1000); g.addColorStop(0, 'rgba(120,64,20,.55)'); g.addColorStop(1, 'rgba(10,5,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(240,160,70,.10)'; ctx.lineWidth = 3; for (let i = 0; i < 16; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 40) { const y = 80 + i * 70 + Math.sin(x * .006 + T * .8 + i) * 18; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  const lines = [['THIS IS THE STORY', tT, 'paper', 112], ['THEY DON’T TEACH YOU', tY, 'paper', 112], ['IN SCHOOL.', tI, 'amber', 190]];
  const ys = [400, 560, 790];
  lines.forEach(([s, t0, c, sz], i) => { const u = ease.out((T - t0 + .05) / .25); ctx.save(); ctx.globalAlpha = u; ctx.translate(0, (1 - u) * 36); txt(ctx, s, W / 2, ys[i], { size: sz, align: 'center', color: c === 'amber' ? C.amber : C.paper, shadow: '#000', blur: 30, ls: 3 }); ctx.restore(); });
  const a = ease.out((T - 28.4) / .5);
  txt(ctx, 'THE GREAT MOLASSES FLOOD · BOSTON, 1919', W / 2, 960, { size: 30, font: MONO, w: 500, ls: 8, align: 'center', color: C.sep4, a: a * .9 });
  txt(ctx, 'FORGOTTEN CATASTROPHES', W / 2, 110, { size: 28, font: MONO, w: 600, ls: 12, align: 'center', color: C.amber, a: ease.out((T - 27.2) / .5) });
}

// ---------- scenes + post ----------
const SC = [[0, 4.6, s1], [4.6, 9.6, s2], [9.6, 15.7, s3], [15.7, 21.5, s4], [21.5, 25.6, s5], [25.6, 27.0, s6], [27.0, 30, s7]];
const grain = []; for (let k = 0; k < 6; k++) { const c = createCanvas(960, 540), x = c.getContext('2d'), im = x.createImageData(960, 540), r = rng(k + 100); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } x.putImageData(im, 0, 0); grain.push(c); }
const vig = createCanvas(W, H); { const x = vig.getContext('2d'), g = x.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.78)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
const sceneC = createCanvas(W, H), sx = sceneC.getContext('2d');

function frame(ctx, t) {
  let i = SC.findIndex(s => t >= s[0] && t < s[1]); if (i < 0) i = SC.length - 1; const [a, b, fn] = SC[i];
  sx.clearRect(0, 0, W, H); sx.fillStyle = '#000'; sx.fillRect(0, 0, W, H); fn(sx, t - a);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const fr = Math.floor(t * FPS), r = rng(fr * 7 + 1);
  ctx.save(); ctx.translate((r() - .5) * 3, (r() - .5) * 3); // gate jitter
  // transitions
  if (i === 2 && t - a < .2) { ctx.drawImage(sceneC, 0, 0); } // handled by flash below
  else ctx.drawImage(sceneC, 0, 0);
  ctx.restore();
  // warm/dim grade: multiply sepia
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = i >= 4 ? '#e9dcc4' : '#efdcb6'; ctx.fillRect(0, 0, W, H); ctx.restore();
  // grain
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .38; ctx.drawImage(grain[fr % 6], -(r() * 40), -(r() * 40), W + 80, H + 80); ctx.restore();
  ctx.drawImage(vig, 0, 0);
  // flicker
  ctx.fillStyle = `rgba(0,0,0,${.05 + r() * .07})`; ctx.fillRect(0, 0, W, H);
  // scratches + dust
  ctx.save(); ctx.strokeStyle = 'rgba(230,220,190,.28)'; ctx.lineWidth = 1.5; for (let k = 0; k < 2; k++) if (r() < .5) { const x = r() * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (r() - .5) * 8, H); ctx.stroke(); }
  ctx.fillStyle = 'rgba(230,220,190,.5)'; for (let k = 0; k < 9; k++) if (r() < .45) { ctx.beginPath(); ctx.arc(r() * W, r() * H, .8 + r() * 2.2, 0, 7); ctx.fill(); } ctx.restore();
  // dramatic transitions
  const bound = SC.map(s => s[0]).slice(1);
  for (const bt of bound) { const d = t - bt; if (d > -.08 && d < .0) { ctx.fillStyle = `rgba(0,0,0,${(1 + d / .08) * .9})`; ctx.fillRect(0, 0, W, H); } }
  // glitch slice at hard cuts
  if ([9.6, 21.5].some(bt => t >= bt && t < bt + .1)) { for (let k = 0; k < 6; k++) { const y = r() * H, h = 20 + r() * 60; ctx.drawImage(ctx.canvas, 0, y, W, h, (r() - .5) * 120, y, W, h); } }
  // open / close fades
  if (t < .35) { ctx.fillStyle = `rgba(0,0,0,${1 - t / .35})`; ctx.fillRect(0, 0, W, H); }
  if (t > DUR - .4) { ctx.fillStyle = `rgba(0,0,0,${(t - (DUR - .4)) / .4})`; ctx.fillRect(0, 0, W, H); }
}

(async () => {
await loadAll();
const mode = process.argv[2];
const cv = createCanvas(W, H), cx = cv.getContext('2d');
if (mode === 'still') {
  const ts = process.argv[3].split(',').map(Number), cols = Math.min(3, ts.length), rows = Math.ceil(ts.length / cols);
  const sheet = createCanvas(cols * 640, rows * 360), sc = sheet.getContext('2d');
  ts.forEach((t, k) => { frame(cx, t); sc.drawImage(cv, (k % cols) * 640, Math.floor(k / cols) * 360, 640, 360); });
  fs.writeFileSync(process.argv[4], sheet.toBuffer('image/png'));
} else {
  const out = process.argv[3], t0 = +(process.argv[4] || 0), t1 = +(process.argv[5] || DUR);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  { for (let f = Math.round(t0 * FPS); f < Math.round(t1 * FPS); f++) { frame(cx, f / FPS); if (!ff.stdin.write(cv.data())) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); }
}

})();
