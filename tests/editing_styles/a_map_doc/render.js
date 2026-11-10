// Editing-style test A ("map documentary"): 1920x1080 30 fps. Techniques: globe zoom, hand-drawn route line with a ship dot,
// paper textures + grain, archive cut-outs with white borders/shadows/parallax, red marker circles/arrows that draw on,
// highlighter on a quote, taped sticky notes, write-on annotations, push-ins, whip pans, map pin crossed out -> jungle.
// Usage: node render.js video out_video.mp4 | node render.js still t1,t2,.. out.png | node render.js cues
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const D = __dirname, R = path.join(D, '../../..');
const tc = require(path.join(R, 'longform/matchking_history/node_modules/topojson-client'));
const WA = require(path.join(R, 'longform/matchking_history/node_modules/world-atlas/countries-50m.json'));
GlobalFonts.registerFromPath(path.join(D, '../fonts/PermanentMarker-Regular.ttf'), 'Marker');
GlobalFonts.registerFromPath(path.join(D, '../fonts/Caveat.ttf'), 'Caveat');
GlobalFonts.registerFromPath(path.join(D, '../fonts/SpecialElite-Regular.ttf'), 'Typer');
const W = 1920, H = 1080, FPS = 30;
const TM = JSON.parse(fs.readFileSync(path.join(D, 'timing.json')));
const T = 40.0;
// word time lookup: nth occurrence (0-based) of a word, by prefix match
function at(word, n = 0) { let k = 0; for (const w of TM.words) { if (w[0].toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^poyeis/, 'poyais').replace(/^kaz.*/, 'cazique').startsWith(word)) { if (k === n) return w[1]; k++; } } throw new Error('word ' + word); }
const L = TM.lines.map(l => l[0]);
// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
const eback = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const mix = (a, b, k) => a + (b - a) * k;
function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const RED = '#C9271C', INK = '#2A221A', PAPER = '#EADFC6';
// ---------- textures ----------
function paperTex(w, h, base, seed, fib = true) { const c = createCanvas(w, h), x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, w, h); const r = rnd(seed);
  for (let i = 0; i < 260; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); const cx = r() * w, cy = r() * h, rr = 30 + r() * 220; x.save(); x.translate(cx, cy); x.scale(rr, rr * (0.5 + r()));
    g.addColorStop(0, `rgba(${r() < 0.5 ? '120,90,50' : '255,250,235'},${0.03 + r() * 0.05})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); }
  if (fib) { x.lineWidth = 1; for (let i = 0; i < 900; i++) { x.strokeStyle = `rgba(90,70,40,${0.04 + r() * 0.06})`; const a = r() * 7, l = 6 + r() * 26, px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + r() * 4, py + Math.sin(a) * l * 0.5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); } }
  return c; }
const PAPERTEX = paperTex(W, H, '#E6DAC0', 7);
const CARD = paperTex(W, H, '#9C7A55', 11);   // cardboard desk
const OCEANTEX = paperTex(W, H, '#AFC1BD', 3, false);
const GRAIN = [0, 1, 2, 3].map(k => { const c = createCanvas(W / 2, H / 2), x = c.getContext('2d'), d = x.createImageData(W / 2, H / 2), r = rnd(99 + k); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
// ---------- map ----------
const FEAT = tc.feature(WA, WA.objects.countries).features;
const RINGS = []; for (const f of FEAT) { const g = f.geometry; if (!g) continue; const P = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; for (const p of P) RINGS.push({ id: f.id, ring: p[0] }); }
const RAD = Math.PI / 180;
function proj(lon, lat, cam) { const l0 = cam.lon * RAD, p0 = cam.lat * RAD, l = lon * RAD, p = lat * RAD;
  const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
  const x = Math.cos(p) * Math.sin(l - l0), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0);
  return [W / 2 + cam.R * x, H / 2 - cam.R * y, cosc]; }
function landPath(x, cam, filter) { x.beginPath(); for (const r of RINGS) { if (filter && !filter(r.id)) continue; let pen = false, anyOn = false;
    const pts = r.ring.map(([lo, la]) => proj(lo, la, cam));
    // cheap cull
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9; for (const p of pts) { if (p[2] > 0) { anyOn = true; minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); } }
    if (!anyOn || maxx < -50 || minx > W + 50 || maxy < -50 || miny > H + 50) continue;
    for (const p of pts) { if (p[2] <= 0) { pen = false; continue; } if (!pen) { x.moveTo(p[0], p[1]); pen = true; } else x.lineTo(p[0], p[1]); } x.closePath(); } }
function drawMap(x, cam, opt = {}) {
  // space / ocean
  x.fillStyle = '#14181c'; x.fillRect(0, 0, W, H);
  x.save(); x.beginPath(); x.arc(W / 2, H / 2, cam.R, 0, 7); x.clip(); x.drawImage(OCEANTEX, 0, 0);
  // graticule
  x.strokeStyle = 'rgba(60,80,80,0.18)'; x.lineWidth = 1.2;
  for (let lo = -180; lo < 180; lo += 10) { x.beginPath(); let pen = false; for (let la = -80; la <= 80; la += 2) { const p = proj(lo, la, cam); if (p[2] <= 0) { pen = false; continue; } pen ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); pen = true; } x.stroke(); }
  for (let la = -80; la <= 80; la += 10) { x.beginPath(); let pen = false; for (let lo = -180; lo <= 180; lo += 2) { const p = proj(lo, la, cam); if (p[2] <= 0) { pen = false; continue; } pen ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); pen = true; } x.stroke(); }
  // land: shadow then fill then coast
  x.save(); x.translate(4, 6); landPath(x, cam); x.fillStyle = 'rgba(40,50,50,0.25)'; x.fill(); x.restore();
  landPath(x, cam); x.fillStyle = '#E4D6B6'; x.fill('nonzero');
  if (opt.hl) { landPath(x, cam, id => id === '340'); x.fillStyle = `rgba(232,190,70,${0.55 * opt.hl})`; x.fill(); }
  landPath(x, cam); x.strokeStyle = 'rgba(92,70,45,0.75)'; x.lineWidth = 1.6; x.stroke();
  if (opt.borders) { x.strokeStyle = `rgba(92,70,45,${0.35 * opt.borders})`; x.lineWidth = 1; x.setLineDash([5, 5]); landPath(x, cam); x.stroke(); x.setLineDash([]); }
  if (opt.after) opt.after(x);
  x.globalCompositeOperation = 'multiply'; x.globalAlpha = 0.55; x.drawImage(PAPERTEX, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.restore();
  // globe rim shading
  if (cam.R < 1400) { const g = x.createRadialGradient(W / 2 - cam.R * 0.3, H / 2 - cam.R * 0.35, cam.R * 0.2, W / 2, H / 2, cam.R); g.addColorStop(0, 'rgba(255,250,230,0.10)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
    x.fillStyle = g; x.beginPath(); x.arc(W / 2, H / 2, cam.R, 0, 7); x.fill(); }
}
// ---------- hand-drawn primitives ----------
function markerEllipse(x, cx, cy, rx, ry, prog, seed = 1, col = RED, lw = 8) { if (prog <= 0) return; const r = rnd(seed); const a0 = -2.2 + r() * 0.4, turn = 2 * Math.PI * 1.12, N = 90, j = [r(), r(), r()];
  x.save(); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.globalAlpha = 0.92; x.beginPath();
  for (let i = 0; i <= N * prog; i++) { const k = i / N, a = a0 + turn * k, rr = 1 + 0.06 * Math.sin(a * 2 + j[0] * 6) + 0.04 * k + 0.02 * Math.sin(a * 5 + j[1] * 9);
    const px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.restore(); }
function markerLine(x, pts, prog, col = RED, lw = 8, head = true) { if (prog <= 0) return; let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let rem = tot * prog; x.save(); x.strokeStyle = col; x.lineWidth = lw; x.lineCap = 'round'; x.lineJoin = 'round'; x.globalAlpha = 0.92; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); let last = pts[0], prev = pts[0];
  for (let i = 1; i < pts.length && rem > 0; i++) { const k = Math.min(1, rem / seg[i - 1]); last = [mix(pts[i - 1][0], pts[i][0], k), mix(pts[i - 1][1], pts[i][1], k)]; prev = pts[i - 1]; x.lineTo(last[0], last[1]); rem -= seg[i - 1]; } x.stroke();
  if (head && prog > 0.97) { const a = Math.atan2(last[1] - prev[1], last[0] - prev[0]); x.beginPath(); x.moveTo(last[0] - Math.cos(a - 0.5) * 34, last[1] - Math.sin(a - 0.5) * 34); x.lineTo(last[0], last[1]); x.lineTo(last[0] - Math.cos(a + 0.5) * 34, last[1] - Math.sin(a + 0.5) * 34); x.stroke(); }
  x.restore(); return last; }
function curve(p0, p1, bend, n = 40) { const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const c = [mx - dy * bend, my + dx * bend]; const o = [];
  for (let i = 0; i <= n; i++) { const t = i / n; o.push([(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0] + Math.sin(t * 19) * 2, (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1] + Math.cos(t * 23) * 2]); } return o; }
function writeOn(x, s, X, Y, font, col, prog, align = 'left') { if (prog <= 0) return; x.save(); x.font = font; x.textAlign = align; x.textBaseline = 'alphabetic'; const w = x.measureText(s).width; const left = align === 'center' ? X - w / 2 : X;
  x.beginPath(); x.rect(left - 10, Y - 200, (w + 30) * prog, 300); x.clip(); x.fillStyle = col; x.fillText(s, X, Y); x.restore(); }
function tape(x, cx, cy, w, rot) { x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = 'rgba(236,226,196,0.78)'; x.shadowColor = 'rgba(0,0,0,0.18)'; x.shadowBlur = 4; x.beginPath(); x.moveTo(-w / 2, -18);
  for (let i = 0; i <= 6; i++) x.lineTo(-w / 2 + (w * i) / 6, -18 + (i % 2) * 2); x.lineTo(w / 2 + 3, 0); x.lineTo(w / 2, 18); for (let i = 6; i >= 0; i--) x.lineTo(-w / 2 + (w * i) / 6, 18 - (i % 2) * 2); x.lineTo(-w / 2 - 3, 0); x.closePath(); x.fill(); x.restore(); }
function sticky(x, lines, cx, cy, w, rot, k, opt = {}) { if (k <= 0) return; const s = opt.pop === false ? 1 : eback(clamp(k)); x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s); x.globalAlpha = clamp(k * 3);
  const h = opt.h || w; x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 22; x.shadowOffsetY = 10; x.fillStyle = opt.col || '#F4D85A'; x.fillRect(-w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
  x.fillStyle = 'rgba(0,0,0,0.05)'; x.fillRect(-w / 2, h / 2 - 16, w, 16); x.fillStyle = opt.ink || INK; x.textAlign = 'center'; x.textBaseline = 'middle';
  const fs = opt.size || 54; lines.forEach((l, i) => { x.font = `${fs}px Marker`; x.fillText(l, 0, (i - (lines.length - 1) / 2) * fs * 1.12 + 4); }); x.restore(); if (opt.tape !== false) tape(x, cx + Math.sin(rot) * h * 0.5, cy - Math.cos(rot) * h * 0.5, w * 0.45, rot + 0.05); }
const IM = {};
function cutout(x, im, cx, cy, w, rot, opt = {}) { const h = w * im.height / im.width, b = opt.border ?? 14; x.save(); x.translate(cx, cy); x.rotate(rot);
  x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 30; x.shadowOffsetX = 8; x.shadowOffsetY = 16; x.fillStyle = opt.paper || '#F5F1E6'; x.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b); x.shadowColor = 'transparent';
  x.filter = opt.filter || 'sepia(0.25) contrast(1.08)'; x.drawImage(im, -w / 2, -h / 2, w, h); x.filter = 'none'; if (opt.inner) opt.inner(x, w, h); x.restore(); return { w, h }; }
function highlighter(x, X, Y, w, h, prog) { if (prog <= 0) return; x.save(); x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(250,224,40,0.75)'; x.beginPath();
  const ww = w * prog; x.moveTo(X, Y + 4); x.lineTo(X + ww, Y); x.lineTo(X + ww + 6, Y + h - 2); x.lineTo(X - 4, Y + h + 2); x.closePath(); x.fill(); x.restore(); }
function pin(x, px, py, k, label, crossed = 0) { if (k <= 0) return; const drop = (1 - eout(clamp(k * 1.6))) * -160; x.save(); x.translate(px, py + drop); x.globalAlpha = clamp(k * 4);
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(6, 4 - drop, 12, 5, 0, 0, 7); x.fill(); x.strokeStyle = '#555'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -46); x.stroke();
  const g = x.createRadialGradient(-6, -60, 2, 0, -54, 20); g.addColorStop(0, '#ff8a7a'); g.addColorStop(1, '#B3170E'); x.fillStyle = g; x.beginPath(); x.arc(0, -54, 17, 0, 7); x.fill(); x.restore();
  if (label) sticky(x, [label], px + 150, py - 120 + drop, 250, 0.05, clamp((k - 0.25) * 2.5), { h: 92, size: 40, col: '#F2EBD9', tape: true });
  if (crossed > 0) { const c = clamp(crossed); markerLine(x, [[px - 70, py - 110], [px + 70, py + 30]], clamp(c * 2), RED, 12, false); markerLine(x, [[px + 70, py - 110], [px - 70, py + 30]], clamp(c * 2 - 1), RED, 12, false); } }
function vignette(x, a = 0.55) { const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); x.fillStyle = g; x.fillRect(0, 0, W, H); }
// ---------- scene times ----------
const S = { s2: L[1] - 0.05, s3: L[2] - 0.15, s4: L[3] - 0.12, s5: L[4] - 0.12, s6: L[5] - 0.1, s7: L[6] - 0.1, s8: L[7] - 0.1 };
const BR = [-84.95, 15.92], LON = [-0.12, 51.5], LEITH = [-3.17, 55.98];
// map camera keyframes per time
const CAMK = [[0, -30, 36, 400], [4.4, -70, 22, 900], [S.s2 - 0.05, -84, 16, 2300], [S.s3, -85.6, 15.2, 5200]];
function camAt(t, K) { let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++; const a = K[i], b = K[i + 1]; const k = eio(lin(t, a[0], b[0])); return { lon: mix(a[1], b[1], k), lat: mix(a[2], b[2], k), R: Math.exp(mix(Math.log(a[3]), Math.log(b[3]), k)) }; }
// ---------- scenes ----------
function sceneGlobe(x, t) { // 0 .. s3
  const cam = camAt(t, CAMK); const hl = lin(t, at('honduras') - 0.6, at('honduras') + 0.2);
  drawMap(x, cam, { hl, borders: lin(t, S.s2, S.s2 + 1), after: g => {
    const p = proj(...BR, cam);
    if (t > 4.2 && t < S.s2 + 0.3) { const k = lin(t, at('exist') - 0.25, at('exist') + 0.35); markerEllipse(g, p[0], p[1], 120, 95, eout(k), 3); if (k > 0.6) { g.save(); g.font = '120px Marker'; g.fillStyle = RED; g.globalAlpha = clamp((k - 0.6) * 3); g.textAlign = 'center'; g.fillText('?', p[0], p[1] + 42); g.restore(); } }
    if (t > S.s2) { const hp = proj(-86.6, 14.6, cam); writeOn(g, 'Honduras (today)', hp[0] - 40, hp[1] + 40, '64px Caveat', INK, lin(t, at('honduras') - 0.1, at('honduras') + 0.7)); }
  } });
  // 1822 taped label + arrow toward the coast
  if (t < S.s2 + 0.4) sticky(x, ['1822'], 300, 210 - 400 * eio(lin(t, S.s2 - 0.1, S.s2 + 0.4)), 260, -0.06, lin(t, 0.15, 0.55), { h: 130, size: 82 });
  if (t < S.s2) { const p = proj(...BR, cam); writeOn(x, 'a country that', 1270, 190, '88px Caveat', '#F2EBD9', lin(t, 2.3, 3.1)); writeOn(x, "didn't exist?", 1310, 280, '88px Caveat', '#F2EBD9', lin(t, at('exist') - 0.6, at('exist') + 0.2));
    markerLine(x, curve([1460, 300], [p[0] + 60, p[1] - 80], 0.22), eout(lin(t, 3.0, 4.4)), '#F2EBD9', 6); }
  if (t > S.s2) { const p = proj(...BR, cam); sticky(x, ['POYAIS'], p[0] + 300, p[1] - 220, 330, 0.06, lin(t, at('poyais') - 0.15, at('poyais') + 0.35), { h: 140, size: 74 });
    markerLine(x, curve([p[0] + 170, p[1] - 170], [p[0] + 18, p[1] - 18], -0.2), eout(lin(t, at('poyais') + 0.3, at('poyais') + 0.9)), RED, 7); }
}
function desk(x, ox = 0, oy = 0) { x.drawImage(CARD, ox * 0.3 % W, 0); x.drawImage(CARD, ox * 0.3 % W - W, 0); x.drawImage(CARD, ox * 0.3 % W + W, 0); }
function sceneNote(x, t) { // s3 .. s4 : portrait + banknote + marker circle + arrow
  const t0 = S.s3; const push = eio(lin(t, at('banknote') - 0.2, at('cazique') + 0.3)), pull = eio(lin(t, at('him') - 0.45, at('him') + 0.2));
  desk(x, -t * 40);
  // camera transform
  const cs = 1 + 0.4 * push * (1 - pull) + 0.04 * lin(t, t0, S.s4), cx = mix(W / 2, 1180, push * (1 - pull)), cy = mix(H / 2, 690, push * (1 - pull));
  x.save(); x.translate(W / 2, H / 2); x.scale(cs, cs); x.translate(-cx, -cy);
  const kp = eout(lin(t, t0 + 0.05, t0 + 0.55)); const portrait = IM.mac;
  cutout(x, portrait, mix(-300, 520, kp) - (t - t0) * 6, 520, 470, -0.05, {});
  writeOn(x, 'Gregor MacGregor', 300, 960, '70px Caveat', '#F7F0DC', lin(t, at('gregor') - 0.1, at('gregor', 1) + 0.4));
  tape(x, 520, 190, 180, 0.08);
  const kn = eout(lin(t, at('banknote') - 0.45, at('banknote') + 0.1)); const nx = mix(2400, 1240, kn) + (t - t0) * 5, ny = 560, nw = 1020, rot = 0.035;
  let noteGeo; if (kn > 0) { noteGeo = cutout(x, IM.note, nx, ny, nw, rot, { border: 0, filter: 'sepia(0.3) contrast(1.1)', inner: (g, w, h) => {
      const s = w / 1280; const ox = -w / 2, oy = -h / 2;
      const kc = lin(t, at('cazique') - 0.1, at('cazique') + 0.7); markerEllipse(g, ox + 515 * s, oy + 515 * s, 205 * s, 70 * s, eout(kc), 5, RED, 9 / s * s);
      // underline under Gregor
      markerLine(g, [[ox + 450 * s, oy + 510 * s], [ox + 585 * s, oy + 506 * s]], eout(lin(t, at('cazique') + 0.4, at('cazique') + 0.8)), RED, 6, false);
    } }); tape(x, nx - 380, ny - 300, 160, -0.3); tape(x, nx + 420, ny + 290, 160, -0.25); }
  // arrow note -> portrait
  const ka = lin(t, at('him') - 0.35, at('him') + 0.25); if (ka > 0) markerLine(x, curve([nx - 420, ny + 120], [640, 470], 0.3), eout(ka), RED, 10);
  if (ka > 0.7) { writeOn(x, "that's him!", 640, 330, '78px Marker', RED, lin(t, at('him') + 0.05, at('him') + 0.55)); }
  x.restore();
}
function sceneBook(x, t) { // s4 .. s5 : guidebook page + highlighter + engraving
  const t0 = S.s4; desk(x, 300 - t * 30);
  const cs = 1 + 0.06 * lin(t, t0, S.s5); x.save(); x.translate(W / 2, H / 2); x.scale(cs, cs); x.translate(-W / 2 - 30 * lin(t, t0, S.s5), -H / 2);
  // engraving (parallax, behind)
  const ke = eout(lin(t, t0 + 0.25, t0 + 0.85)); cutout(x, IM.river, mix(2300, 1420, ke) + (t - t0) * 14, 430, 760, 0.06, {});
  writeOn(x, "the guidebook's picture of Poyais", 1080, 770, '52px Caveat', '#F7F0DC', lin(t, t0 + 0.9, t0 + 1.8));
  // book page
  const kb = eout(lin(t, t0 - 0.05, t0 + 0.4)); x.save(); x.translate(mix(-500, 620, kb), 560); x.rotate(-0.04);
  x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = 36; x.shadowOffsetY = 18; x.fillStyle = '#EFE4CC'; x.fillRect(-380, -470, 760, 940); x.shadowColor = 'transparent';
  x.globalCompositeOperation = 'multiply'; x.drawImage(PAPERTEX, 0, 0, 760, 940, -380, -470, 760, 940); x.globalCompositeOperation = 'source-over';
  x.fillStyle = INK; x.textAlign = 'center'; x.font = '30px Typer'; x.fillText('SKETCH OF THE MOSQUITO SHORE', 0, -390); x.font = 'italic 26px "DejaVu Serif"'; x.fillText('including the Territory of Poyais · 1822', 0, -350);
  x.fillStyle = 'rgba(42,34,26,0.35)'; for (let i = 0; i < 4; i++) x.fillRect(-300, -280 + i * 40, 600 - (i % 2) * 120, 12);
  x.textAlign = 'left'; x.fillStyle = INK; x.font = '40px "DejaVu Serif"'; const q = ['"...one of the most', 'healthy and beautiful', 'spots in the world."'];
  q.forEach((s, i) => { const y = -80 + i * 66; highlighter(x, -310, y - 42, x.measureText(s).width + 20, 54, eio(lin(t, at('healthy') - 0.5 + i * 0.75, at('healthy') + 0.25 + i * 0.75))); x.fillStyle = INK; x.fillText(s, -300, y); });
  x.fillStyle = 'rgba(42,34,26,0.35)'; for (let i = 0; i < 6; i++) x.fillRect(-300, 160 + i * 40, 600 - (i % 3) * 90, 12);
  x.font = '22px Typer'; x.fillStyle = 'rgba(42,34,26,0.7)'; x.textAlign = 'center'; x.fillText('(re-created page)', 0, 440); x.restore();
  tape(x, mix(-500, 620, kb) - 300, 110, 170, -0.4);
  x.restore();
}
function sceneMapClose(x, t, mode) { // s5 (pin) and s7 (crossed + jungle)
  const base = mode === 'pin' ? S.s5 : S.s7; const cam = { lon: -84.95 + 0.25 * lin(t, base, base + 3), lat: 15.75, R: mode === 'pin' ? 6500 + 1500 * lin(t, base, base + 2.4) : 8000 + 1800 * lin(t, base, base + 3.8) };
  const jung = mode === 'jungle' ? lin(t, at('farms') - 0.1, at('jungle') + 0.6) : 0;
  drawMap(x, cam, { borders: 0, after: g => { if (jung > 0) { g.save(); landPath(g, cam); g.clip(); const p = proj(...BR, cam); const r = rnd(5);
      for (let i = 0; i < 420; i++) { const a = r() * 7, d = Math.pow(r(), 0.7) * 1100, px = p[0] + Math.cos(a) * d, py = p[1] + Math.sin(a) * d * 0.8; const appear = d / 1100; if (eio(jung) < appear) continue;
        const rr = 26 + r() * 46; g.fillStyle = ['#2F4A22', '#3E5E2A', '#516F31', '#26401B'][i % 4]; g.globalAlpha = 0.92; const sc = eout(clamp((eio(jung) - appear) * 6)); for (let k = 0; k < 6; k++) { const aa = k / 6 * 6.283 + i; g.beginPath(); g.ellipse(px + Math.cos(aa) * rr * 0.45 * sc, py + Math.sin(aa) * rr * 0.35 * sc, rr * 0.5 * sc + 0.1, rr * 0.22 * sc + 0.1, aa, 0, 7); g.fill(); } }
      g.globalAlpha = 1; g.restore(); } } });
  const p = proj(...BR, cam);
  if (mode === 'pin') { pin(x, p[0], p[1], lin(t, at('joseph') - 0.9, at('joseph') - 0.2), 'ST. JOSEPH'); writeOn(x, 'the capital?', p[0] + 40, p[1] + 110, '64px Caveat', INK, lin(t, at('joseph') + 0.1, at('joseph') + 0.7)); }
  else { pin(x, p[0], p[1], 1, 'ST. JOSEPH', lin(t, at('capital', 1) - 0.15, at('capital', 1) + 0.35));
    sticky(x, ['NO CAPITAL'], 360, 260, 360, -0.07, lin(t, at('capital', 1) - 0.1, at('capital', 1) + 0.3), { h: 120, size: 56, col: '#F2EBD9' });
    sticky(x, ['NO FARMS'], 400, 430, 330, 0.05, lin(t, at('farms') - 0.1, at('farms') + 0.3), { h: 120, size: 56, col: '#F2EBD9' });
    sticky(x, ['JUST JUNGLE'], 1520, 820, 420, -0.04, lin(t, at('jungle') - 0.05, at('jungle') + 0.35), { h: 130, size: 62 }); }
}
function sceneRoute(x, t) { // s6 : zoom out to the Atlantic, route line + ship dots
  const t0 = S.s6; const k = eio(lin(t, t0 - 0.05, t0 + 1.0)); const cam = { lon: mix(-84.9, -45, k), lat: mix(15.9, 34, k), R: Math.exp(mix(Math.log(8000), Math.log(950), k)) };
  drawMap(x, cam, { after: g => {
    const a = proj(...LON, cam), a2 = proj(...LEITH, cam), b = proj(...BR, cam);
    const r1 = curve([a[0], a[1]], [b[0], b[1]], -0.16, 60), r2 = curve([a2[0], a2[1]], [b[0], b[1]], -0.2, 60);
    const kr = eio(lin(t, t0 + 0.9, at('london') + 0.6));
    g.save(); g.setLineDash([14, 12]); markerLine(g, r1, kr, '#8B1A12', 6, false); markerLine(g, r2, eio(lin(t, t0 + 1.3, at('leith') + 0.5)), '#8B1A12', 6, false); g.restore();
    for (const [rr, kk] of [[r1, kr], [r2, eio(lin(t, t0 + 1.3, at('leith') + 0.5))]]) { if (kk <= 0) continue; const i = Math.min(rr.length - 1, Math.floor(kk * (rr.length - 1))); const q = rr[i];
      g.fillStyle = '#1B1B1B'; g.beginPath(); g.arc(q[0], q[1], 13, 0, 7); g.fill(); g.strokeStyle = '#F2EBD9'; g.lineWidth = 4; g.stroke(); }
    g.fillStyle = INK; g.beginPath(); g.arc(a[0], a[1], 8, 0, 7); g.fill(); g.beginPath(); g.arc(a2[0], a2[1], 8, 0, 7); g.fill(); g.beginPath(); g.arc(b[0], b[1], 9, 0, 7); g.fill();
    writeOn(g, 'London', a[0] + 18, a[1] + 44, '54px Caveat', INK, lin(t, at('london') - 0.2, at('london') + 0.3));
    writeOn(g, 'Leith', a2[0] + 18, a2[1] - 10, '54px Caveat', INK, lin(t, at('leith') - 0.2, at('leith') + 0.3));
    writeOn(g, 'Black River', b[0] - 10, b[1] + 50, '50px Caveat', INK, lin(t, t0 + 0.9, t0 + 1.5));
  } });
  sticky(x, ['~250', 'SETTLERS'], 330, 250, 330, 0.06, lin(t, at('250') - 0.2, at('250') + 0.25), { h: 230, size: 64 });
  writeOn(x, '1822 – 1823', 200, 450, '50px Typer', '#F2EBD9', lin(t, at('250') + 0.5, at('250') + 1.2));
}
function sceneEnd(x, t) { // s8 : desk, fewer than 50 sticky, note returns, question writes on
  const t0 = S.s8; desk(x, -900 - t * 30); const cs = 1 + 0.07 * lin(t, t0, T); x.save(); x.translate(W / 2, H / 2); x.scale(cs, cs); x.translate(-W / 2, -H / 2);
  const kn = eout(lin(t, t0 - 0.05, t0 + 0.5)); cutout(x, IM.note, mix(2400, 1250, kn), 420, 860, -0.03, { border: 0, filter: 'sepia(0.35) contrast(1.1) brightness(0.92)', inner: (g, w, h) => {
      const s = w / 1280; markerEllipse(g, -w / 2 + 785 * s, -h / 2 + 240 * s, 120 * s, 45 * s, eout(lin(t, at('sell') - 0.2, at('sell') + 0.6)), 9, RED, 8);
      markerLine(g, [[-w / 2 + 660 * s, -h / 2 + 200 * s], [-w / 2 + 920 * s, -h / 2 + 290 * s]], eout(lin(t, at('there') - 0.3, at('there') + 0.1)), RED, 8, false); } });
  tape(x, 1250 - 380, 170, 150, -0.3);
  sticky(x, ['FEWER', 'THAN 50', 'CAME HOME'], 420, 420, 440, -0.06, lin(t, at('50') - 0.4, at('50') + 0.05), { h: 400, size: 70 });
  writeOn(x, '~250', 300, 740, '90px Marker', '#F7F0DC', lin(t, at('50') + 0.15, at('50') + 0.5)); markerLine(x, [[285, 712], [520, 690]], eout(lin(t, at('50') + 0.5, at('50') + 0.8)), RED, 9, false);
  writeOn(x, '< 50', 560, 750, '90px Marker', RED, lin(t, at('50') + 0.75, at('home') + 0.3));
  writeOn(x, 'How do you sell a country', 960, 770, '82px Caveat', '#F7F0DC', lin(t, at('sell') - 0.5, at('country', 1) + 0.3));
  writeOn(x, "that isn't there?", 1040, 860, '82px Caveat', '#F7F0DC', lin(t, at('isn') - 0.2, at('there') + 0.35));
  x.restore();
}
// ---------- subtitles ----------
const GROUPS = (() => { const g = []; let cur = []; TM.words.forEach((w, i) => { cur.push(w); const end = /[.,?!]$/.test(w[0]) || cur.length >= 6 || i === TM.words.length - 1; if (end) { g.push(cur); cur = []; } }); return g; })();
const FIX = s => s.replace(/Poyeis/gi, 'Poyais').replace(/Kaz[a-z]*/gi, 'Cazique').replace(/Mack Gregor|Mac Gregor/g, 'MacGregor').replace(/it's ruler/i, 'its ruler');
function subs(x, t) { const g = GROUPS.find((g, i) => t >= g[0][1] - 0.05 && t < (GROUPS[i + 1] ? Math.min(GROUPS[i + 1][0][1] - 0.05, g[g.length - 1][2] + 0.6) : g[g.length - 1][2] + 0.6)); if (!g) return;
  const s = FIX(g.map(w => w[0]).join(' ')); x.save(); x.font = '600 46px Inter'; x.textAlign = 'center'; const w = x.measureText(s).width; x.fillStyle = 'rgba(10,10,10,0.62)'; x.beginPath(); x.roundRect(W / 2 - w / 2 - 22, H - 118, w + 44, 66, 10); x.fill();
  x.fillStyle = '#FFFFFF'; x.fillText(s, W / 2, H - 70); x.restore(); }
// ---------- frame ----------
const SCN = [[0, S.s3, sceneGlobe], [S.s3, S.s4, sceneNote], [S.s4, S.s5, sceneBook], [S.s5, S.s6, (x, t) => sceneMapClose(x, t, 'pin')], [S.s6, S.s7, sceneRoute], [S.s7, S.s8, (x, t) => sceneMapClose(x, t, 'jungle')], [S.s8, 99, sceneEnd]];
const WHIP = [S.s3, S.s4, S.s5, S.s8]; // whip-pan cuts (others: hard cut / zoom)
const off = createCanvas(W, H), ox = off.getContext('2d');
function sceneAt(t) { return SCN.find(s => t >= s[0] && t < s[1]); }
function frame(x, t, fi) {
  const sc = sceneAt(t); ox.setTransform(1, 0, 0, 1, 0, 0); sc[2](ox, t);
  // whip pan: 0.18 s before and after the cut, smear horizontally
  const wc = WHIP.find(c => Math.abs(t - c) < 0.2);
  if (wc !== undefined) { const k = 1 - Math.abs(t - wc) / 0.2, dir = t < wc ? -1 : 1; const d = k * k * 900 * dir; x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) { x.globalAlpha = 1 / (i + 1.2); const dd = d + i * k * 70 * dir; x.drawImage(off, dd, 0); x.drawImage(off, dd - Math.sign(dd || 1) * W, 0); } x.globalAlpha = 1; }
  else x.drawImage(off, 0, 0);
  // slight camera shake-free breathing + grain + vignette
  vignette(x); x.globalCompositeOperation = 'overlay'; x.globalAlpha = 0.09; x.drawImage(GRAIN[fi % 4], 0, 0, W, H); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  subs(x, t);
  // fade in/out
  const f = Math.min(lin(t, 0, 0.25), 1 - lin(t, T - 0.5, T)); if (f < 1) { x.fillStyle = `rgba(0,0,0,${1 - f})`; x.fillRect(0, 0, W, H); }
}
// cues for the sound mix
function cues() { return { T, whoosh: [...WHIP, S.s6 + 0.1, S.s7], paper: [0.15, S.s3 + 0.05, at('banknote') - 0.45, S.s4, S.s4 + 0.25, at('poyais') - 0.15, at('250') - 0.2, at('capital', 1) - 0.1, at('farms') - 0.1, at('jungle') - 0.05, at('50') - 0.4, S.s8],
  marker: [at('exist') - 0.25, at('poyais') + 0.3, at('cazique') - 0.1, at('him') - 0.35, at('healthy') - 0.5, at('capital', 1) - 0.15, at('50') + 0.5, at('sell') - 0.2], pin: [at('joseph') - 0.6], hit: [0.12] }; }
(async () => {
  IM.mac = await loadImage(path.join(R, 'poyais_ep29/archive/macgregor.jpg')); IM.river = await loadImage(path.join(R, 'poyais_ep29/archive/black_river_1822.jpg')); IM.note = await loadImage(path.join(R, 'poyais_ep29/archive/poyais_dollar.jpg'));
  const mode = process.argv[2]; const cv = createCanvas(W, H), x = cv.getContext('2d');
  if (mode === 'cues') { fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify(cues())); console.log(JSON.stringify(cues())); return; }
  if (mode === 'still') { const ts = process.argv[3].split(',').map(Number); const sw = 640, sh = 360, cols = Math.min(4, ts.length); const sheet = createCanvas(sw * cols, sh * Math.ceil(ts.length / cols)), s = sheet.getContext('2d');
    ts.forEach((t, i) => { frame(x, t, Math.round(t * FPS)); s.drawImage(cv, (i % cols) * sw, Math.floor(i / cols) * sh, sw, sh); s.fillStyle = 'red'; s.font = '24px Inter'; s.fillText(t.toFixed(2), (i % cols) * sw + 8, Math.floor(i / cols) * sh + 28); });
    fs.writeFileSync(process.argv[4], sheet.toBuffer('image/png')); return; }
  const out = process.argv[3]; const N = Math.round(T * FPS);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { frame(x, i / FPS, i); const buf = x.getImageData(0, 0, W, H).data; if (!ff.stdin.write(Buffer.from(buf.buffer))) await new Promise(r => ff.stdin.once('drain', r)); if (i % 150 === 0) console.log('frame', i, '/', N); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done');
})();
