// FX showcase: a numbered catalogue of editing / animation techniques on one neutral flat-2D scene (Max, a mug, a phone).
// node fx.js info | still t1,t2 | seg n1,n2 | sheet | clip a b out.mp4 | audio | list
const fs = require('fs'), {spawn} = require('child_process'), {createCanvas, GlobalFonts} = require('@napi-rs/canvas'), T = require('./toon');
const FD = '/home/user/wt_zhg/speak_in_english/zhanna_grwm/fonts';
for (const [f, n] of [['nunito-cyrillic-900-normal', 'NBC'], ['nunito-latin-900-normal', 'NBL'], ['neucha-cyrillic-400-normal', 'HWC'], ['neucha-latin-400-normal', 'HWL']]) GlobalFonts.registerFromPath(`${FD}/${f}.woff2`, n);
const W = 1080, H = 1920, FPS = 30, INK = '#2a2230', FONT = 'NBL, NBC', HW = 'HWL, HWC';
const cv = createCanvas(W, H), G0 = cv.getContext('2d'); let g = G0;
const CA = createCanvas(W, H), GA = CA.getContext('2d'), CB = createCanvas(W, H), GBb = CB.getContext('2d'), CC = createCanvas(W, H), GCc = CC.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const P01 = (t, a, d) => clamp((t - a) / d), ex = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x), ei = x => x * x * x, eo = x => 1 - Math.pow(1 - clamp(x), 3);
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const spr = (x, d = 7, f = 9) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-d * x) * Math.cos(f * x);
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (x, s = 0) => { const i = Math.floor(x), f = x - i, a = hash(i + s * 57), b = hash(i + 1 + s * 57), k = f * f * (3 - 2 * f); return (a + (b - a) * k) * 2 - 1; };
// drawing helpers (on the global g)
function rr(x, y, w, h, r, fill, lw = 7, stroke = INK) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function ell(x, y, rx, ry, fill, lw = 7, stroke = INK, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function ln(pts, w, col = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function poly(pts, fill, lw = 7, stroke = INK) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); } }
function txt(s, x, y, size, col, font = FONT, align = 'center') { g.font = `${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function otxt(s, x, y, size, col, font = FONT, align = 'center', lw = .24) { g.font = `${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size * lw; g.strokeStyle = '#000'; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); }
function star(x, y, r, fill, lw = 5, n = 8, rot = 0, inner = .45) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r2 = i % 2 ? r * inner : r; p.push([x + Math.cos(a) * r2, y + Math.sin(a) * r2]); } poly(p, fill, lw); }
// partial polyline (draw-on), returns pen tip
function drawOn(pts, p, col, w) { let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(p); const out = [pts[0]]; for (let i = 1; i < pts.length && rem > 0; i++) { const d = seg[i - 1]; if (rem >= d) { out.push(pts[i]); rem -= d; } else { const k = rem / d; out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); rem = 0; } }
  if (out.length > 1) ln(out, w, col); return out[out.length - 1]; }
const bez = (a, c, b, n = 40) => Array.from({length: n + 1}, (_, i) => { const k = i / n; return [(1 - k) ** 2 * a[0] + 2 * (1 - k) * k * c[0] + k * k * b[0], (1 - k) ** 2 * a[1] + 2 * (1 - k) * k * c[1] + k * k * b[1]]; });

// ---------- the neutral character: Max (short brown hair, green sweater) ----------
const MAX = {hair: 'short', front: true, pal: {skin: '#f1c6a2', skinS: '#ddaa84', hair: '#6b4226', brow: '#4a2c18', lip: '#a4574c', top: '#3f9a5a', topS: '#2f7c46', collar: '#2c6e3e', sleeve: '#3f9a5a', arm: '#3f9a5a', bottom: '#3a4a6a', legs: '#3a4a6a', shoe: '#f4f4f4', sole: '#3a4a6a'}};
const CX0 = 360, CY0 = 1660, CS = .8;
const blinkAt = t => { const p = (t + 1.3) % 3.4; return p < .11; };
function man(t, o = {}) { return Object.assign({}, MAX, {x: CX0, y: CY0, s: CS, mood: 'neutral', pose: 'down', blink: blinkAt(t), t}, o); }
// world position of a hand (side s) for a character state (accounts for x, y, s, lean)
function handOf(st, s) { const fn = st.arms || T.POSES[st.pose] || T.POSES.down, a = fn(s), pts = T.solveArm(a[0], a[2], a[1], s, 0), H2 = pts[2], L = st.lean || 0, k = st.s || 1;
  return [st.x + k * (Math.cos(L) * H2[0] - Math.sin(L) * H2[1]), st.y + k * (Math.sin(L) * H2[0] + Math.cos(L) * H2[1])]; }
const HEAD = () => [CX0, CY0 - 1062 * CS];   // face centre in world coords
// arm presets (local coords; s = -1 screen-left, +1 screen-right; a raised hand stays on its own side)
const ARMS = {
  mugR: s => s > 0 ? [[78, -860], [175, -740], [150, -800]] : T.POSES.down(s),                 // mug held in the screen-right hand at chest height
  mugUp: s => s > 0 ? [[78, -860], [190, -960], [205, -1150]] : T.POSES.down(s),               // mug raised high (screen-right side)
  wave: s => s > 0 ? [[78, -860], [190, -930], [215, -1080]] : T.POSES.down(s),
  back: s => [[s * 78, -860], [s * 110, -730], [s * 150, -620]],                                // arms swung back (anticipation)
  tilt: s => s > 0 ? [[78, -860], [190, -770], [190, -880]] : T.POSES.down(s),                 // mug tipped forward
};

// ---------- props ----------
function mug(x, y, k = 1, rot = 0, sx = 1, sy = 1, steam = 0, t = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k * sx, k * sy);
  g.beginPath(); g.arc(50, -58, 30, -Math.PI / 2, Math.PI / 2); g.strokeStyle = INK; g.lineWidth = 26; g.stroke(); g.strokeStyle = '#e2574c'; g.lineWidth = 12; g.stroke();
  rr(-50, -110, 100, 110, 16, '#e2574c', 7); g.save(); g.beginPath(); g.roundRect(-50, -110, 100, 110, 16); g.clip(); g.fillStyle = '#c4443a'; g.fillRect(24, -120, 40, 130); g.restore(); rr(-50, -110, 100, 110, 16, null, 7);
  ell(0, -110, 50, 9, '#7a4a2a', 6); g.save(); g.translate(-6, -52); g.scale(.9, .9); g.beginPath(); g.moveTo(0, 14); g.bezierCurveTo(-26, -6, -14, -30, 0, -14); g.bezierCurveTo(14, -30, 26, -6, 0, 14); g.fillStyle = '#ffffff'; g.fill(); g.restore();
  if (steam > 0) for (let i = 0; i < 3; i++) { const ph = (t * .7 + i * .33) % 1; g.save(); g.globalAlpha = steam * Math.sin(Math.PI * ph) * .8; const bx = -24 + i * 24, by = -130 - ph * 90;
    g.beginPath(); g.moveTo(bx, by + 40); g.bezierCurveTo(bx + 16, by + 24, bx - 16, by + 12, bx, by - 8); g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.lineCap = 'round'; g.stroke(); g.restore(); }
  g.restore(); }
function phone(x, y, k = 1, rot = 0, t = 0, sx = 1, sy = 1) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k * sx, k * sy); rr(-38, -150, 76, 150, 16, '#2c3e66', 7); rr(-29, -138, 58, 118, 8, '#8fd3ff', 0);
  rr(-21, -126, 42, 12, 5, '#ffffff', 0); rr(-21, -106, 30, 10, 5, '#d6efff', 0); rr(-21, -90, 38, 10, 5, '#d6efff', 0); ell(0, -10, 6, 4, '#8fd3ff', 0); g.restore(); }
function lamp(x, y, on = 0) { rr(x - 40, y - 18, 80, 18, 8, '#8a6a4a', 6); ln([[x, y - 18], [x, y - 140]], 12, INK); ln([[x, y - 18], [x, y - 140]], 5, '#c9a87a');
  poly([[x - 60, y - 140], [x + 60, y - 140], [x + 38, y - 226], [x - 38, y - 226]], on > 0 ? `rgb(${Math.round(lerp(240, 255, on))},${Math.round(lerp(214, 236, on))},${Math.round(lerp(150, 170, on))})` : '#f0d696', 6); }
function plant(x, y, k = 1) { g.save(); g.translate(x, y); g.scale(k, k); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .32, L = 230 + (i % 2) * 70; g.save(); g.rotate(a + Math.PI / 2); ell(0, -L / 2 - 60, 30, L / 2, i % 2 ? '#4caf6a' : '#3c9458', 6); ln([[0, -60], [0, -L - 40]], 4, '#2a6e40'); g.restore(); }
  poly([[-80, -80], [80, -80], [62, 70], [-62, 70]], '#d9774a', 7); rr(-90, -100, 180, 30, 8, '#c4643a', 7); g.restore(); }
function clock(x, y, r, t, spin = 0) { ell(x, y, r + 10, r + 10, '#e8a23a', 7); ell(x, y, r, r, '#ffffff', 6); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ln([[x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78], [x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9]], i % 3 ? 4 : 7); }
  const m = -Math.PI / 2 + (t * .2 + spin) * Math.PI * 2, h = -Math.PI / 2 + (.38 + (t * .2 + spin) / 12) * Math.PI * 2;
  ln([[x, y], [x + Math.cos(h) * r * .5, y + Math.sin(h) * r * .5]], 9); ln([[x, y], [x + Math.cos(m) * r * .75, y + Math.sin(m) * r * .75]], 6); ell(x, y, 8, 8, INK, 0); }
// standard prop places
const MUG = [740, 1300], PHONE = [880, 1300], LAMP = [985, 1300], CLOCK = [170, 520];

// ---------- the room ----------
function wall(o) { const n = o.night || 0; g.fillStyle = '#f6e7c8'; g.fillRect(-1600, -1600, 4300, 3140); g.fillStyle = '#efdcb8'; for (let x = -1600; x < 2700; x += 120) g.fillRect(x, -1600, 46, 3140);
  // window
  rr(600, 430, 370, 430, 10, '#ffffff', 8); g.save(); g.beginPath(); g.rect(620, 450, 330, 390); g.clip(); const sky = g.createLinearGradient(0, 450, 0, 840); sky.addColorStop(0, '#9fd6f2'); sky.addColorStop(1, '#d9f0fa'); g.fillStyle = sky; g.fillRect(620, 450, 330, 390);
  ell(880, 530, 46, 46, '#ffe07a', 0); for (const [cx, cy] of [[700, 600], [760, 590]]) ell(cx, cy, 50, 28, '#ffffff', 0);
  if (n > 0) { g.globalAlpha = n; g.fillStyle = '#2b2f63'; g.fillRect(620, 450, 330, 390); ell(870, 540, 36, 36, '#f4efd0', 0); ell(886, 530, 30, 30, '#2b2f63', 0); for (let i = 0; i < 9; i++) ell(640 + hash(i) * 290, 470 + hash(i + 9) * 340, 3, 3, '#ffffff', 0); g.globalAlpha = 1; }
  g.restore(); ln([[785, 450], [785, 840]], 10, '#ffffff'); ln([[620, 645], [950, 645]], 10, '#ffffff'); rr(600, 430, 370, 430, 10, null, 8);
  for (const s of [-1, 1]) { const cx = s < 0 ? 590 : 980; poly([[cx - 40, 410], [cx + 40, 410], [cx + 30 + s * 10, 900], [cx - 30 + s * 10, 900]], '#e0706a', 6); }
  rr(560, 396, 450, 22, 10, '#8a6a4a', 6);
  if (!o.noClock) clock(...CLOCK, 70, o.t || 0, o.spin || 0);
  // baseboard + floor
  g.fillStyle = '#c99a6e'; g.fillRect(-1600, 1540, 4300, 1600); g.fillStyle = '#b98a5e'; for (let y = 1600; y < 3000; y += 90) g.fillRect(-1600, y, 4300, 8);
  g.fillStyle = '#ffffff'; g.fillRect(-1600, 1520, 4300, 26); ln([[-1600, 1520], [2700, 1520]], 6); ln([[-1600, 1546], [2700, 1546]], 6); }
function table() { for (const x of [640, 990]) rr(x - 14, 1320, 28, 340, 8, '#a8744a', 7); rr(600, 1290, 430, 36, 10, '#c48a56', 7); }
function world(o) { const t = o.t || 0, par = o.par || 0;
  g.save(); g.translate(-par * .35, 0); wall(o); g.restore();
  g.save(); g.translate(-par, 0);
  if (o.behind) o.behind();
  table();
  if (o.lamp !== false) lamp(...LAMP, o.lampOn || 0);
  const st = man(t, o.ch || {}); if (o.ch !== false) { if (o.preChar) o.preChar(st); T.draw(g, st); g = o.ctx || g; }
  if (o.mug !== false) { const m = Object.assign({x: MUG[0], y: MUG[1], k: 1, rot: 0, sx: 1, sy: 1, steam: 1}, o.mug || {}); if (m.held) { const hp = handOf(st, 1); m.x = hp[0] + (m.dx || 0); m.y = hp[1] + 50 + (m.dy || 0); }
    if (m.k > .001) mug(m.x, m.y, m.k, m.rot, m.sx, m.sy, m.steam, t); if (m.held) { const hp = handOf(st, 1); ell(hp[0], hp[1], 26 * st.s, 24 * st.s, st.pal.skin, 6); } }
  if (o.phone !== false) { const p = Object.assign({x: PHONE[0], y: PHONE[1], k: 1, rot: 0, sx: 1, sy: 1}, o.phone || {}); if (p.k > .001) phone(p.x, p.y, p.k, p.rot, t, p.sx, p.sy); }
  if (o.extra) o.extra(st);
  g.restore();
  g.save(); g.translate(-par * 1.8, 0); if (o.fg) { plant(-10, 1780, 1.15); plant(1110, 1830, 1.0); } g.restore();
  if (o.night) nightLight(o.night, o.lampOn || 0); }
function nightLight(n, on) { g.save(); g.globalCompositeOperation = 'multiply'; const cx = LAMP[0], cy = LAMP[1] - 180;
  const gr = g.createRadialGradient(cx, cy, 40, cx, cy, 1500), mix = (a, b) => { const A = [255, 255, 255], f = (c, i) => Math.round(lerp(A[i], c[i], n)); return `rgb(${f(a, 0)},${f(a, 1)},${f(a, 2)})`; };
  const k = on; gr.addColorStop(0, mix([lerp(150, 255, k), lerp(150, 246, k), lerp(200, 224, k)])); gr.addColorStop(.35, mix([lerp(120, 200, k), lerp(118, 180, k), lerp(180, 190, k)])); gr.addColorStop(1, mix([64, 62, 112]));
  g.fillStyle = gr; g.fillRect(-1600, -1600, 4300, 4300); g.globalCompositeOperation = 'screen';
  if (on > 0) { const gl = g.createRadialGradient(cx, cy + 40, 10, cx, cy + 40, 520); gl.addColorStop(0, `rgba(255,200,120,${.35 * on})`); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(cx - 600, cy - 560, 1200, 1200); }
  g.restore(); }

// ---------- camera / shots ----------
function applyCam(c, cam) { c.translate(540 + (cam.dx || 0), 960 + (cam.dy || 0)); c.rotate(cam.rot || 0); c.scale(cam.z || 1, cam.z || 1); c.translate(-(cam.x ?? 540), -(cam.y ?? 960)); }
function shot(ctx, cam, o) { const pg = g; g = ctx; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#f6e7c8'; ctx.fillRect(0, 0, W, H); applyCam(ctx, cam); o.ctx = ctx; world(o); ctx.restore(); g = pg; }
const toScreen = (cam, p) => { const z = cam.z || 1, r = cam.rot || 0, dx = (p[0] - (cam.x ?? 540)) * z, dy = (p[1] - (cam.y ?? 960)) * z; return [540 + (cam.dx || 0) + Math.cos(r) * dx - Math.sin(r) * dy, 960 + (cam.dy || 0) + Math.sin(r) * dx + Math.cos(r) * dy]; };
const WIDE = {x: 540, y: 960, z: 1};
const FACE = (z = 1.8) => ({x: CX0, y: HEAD()[1] + 40, z});
const shake = (t, t0, amp, dec = 6) => t < t0 ? [0, 0] : [amp * Math.exp(-dec * (t - t0)) * noise((t - t0) * 22, 1), amp * Math.exp(-dec * (t - t0)) * noise((t - t0) * 22, 2)];
// average n copies of a canvas (motion / zoom blur)
function blurCopies(src, n, fn) { g.save(); for (let i = 0; i < n; i++) { g.globalAlpha = 1 / (i + 1); g.save(); fn(i / Math.max(1, n - 1)); g.drawImage(src, 0, 0); g.restore(); } g.restore(); }
const talkMouth = (t, a, b) => t < a || t > b ? 0 : clamp(.25 + .55 * Math.abs(Math.sin((t - a) * 11)) * (.6 + .4 * Math.sin((t - a) * 3.7)));

// ---------- captions (5 styles) ----------
const CAPW = ['Без', 'coffee', 'я', 'не', 'человек.'], CAPEN = 1, CAPY = 1420, CAPT0 = .45, CAPDT = .4;
const wT = i => CAPT0 + i * CAPDT;
function capLayout(size) { g.font = `${size}px ${FONT}`; while (CAPW.reduce((a, w) => a + g.measureText(w).width, 0) + g.measureText(' ').width * 4 > 900) { size -= 2; g.font = `${size}px ${FONT}`; } CAPSZ = size; const sp = g.measureText(' ').width, ws = CAPW.map(w => g.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (CAPW.length - 1); let x = 540 - tw / 2; return CAPW.map((w, i) => { const r = {w, x, ww: ws[i], cx: x + ws[i] / 2}; x += ws[i] + sp; return r; }); }
function capWord(r, size, fill, sc = 1, dy = 0, stroke = true) { g.save(); g.translate(r.cx, CAPY + dy); g.scale(sc, sc); g.font = `${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (stroke) { g.lineWidth = size * .24; g.strokeStyle = '#000'; g.strokeText(r.w, 0, 0); } g.fillStyle = fill; g.fillText(r.w, 0, 0); g.restore(); }
const YEL = '#ffd23f'; let CAPSZ = 70;
const CAPS = {
  A: t => { if (t < .35) return; const k = spr(P01(t, .35, .45), 6, 10), sc = .55 + .45 * k, L = capLayout(78); g.save(); g.translate(540, CAPY); g.scale(sc, sc); g.translate(-540, -CAPY); L.forEach((r, i) => capWord(r, CAPSZ, i === CAPEN ? YEL : '#ffffff')); g.restore(); },
  B: t => { if (t < .3) return; const L = capLayout(78); let cur = -1; for (let i = 0; i < CAPW.length; i++) if (t >= wT(i)) cur = i; L.forEach((r, i) => { const isC = i === cur; capWord(r, CAPSZ, isC ? '#4fd8ff' : i === CAPEN ? YEL : '#ffffff', isC ? 1 + .08 * (1 - ease(P01(t, wT(i), .25))) : 1); });
    const r = L[CAPEN]; g.save(); g.fillStyle = YEL; g.strokeStyle = '#000'; g.lineWidth = 5; g.beginPath(); g.roundRect(r.x, CAPY + 46, r.ww, 12, 6); g.fill(); g.stroke(); g.restore(); },
  C: t => { const L = capLayout(78); L.forEach((r, i) => { if (t < wT(i)) return; const k = spr(P01(t, wT(i), .35), 7, 11); capWord(r, CAPSZ, i === CAPEN ? YEL : '#ffffff', .4 + .6 * k); }); },
  D: t => { if (t < .35) return; const k = spr(P01(t, .35, .45), 6, 10), L = capLayout(70); const x0 = L[0].x - 34, x1 = L[L.length - 1].x + L[L.length - 1].ww + 34;
    g.save(); g.translate(540, CAPY); g.rotate(-.03); g.scale(.6 + .4 * k, .6 + .4 * k); g.translate(-540, -CAPY); rr(x0 + 10, CAPY - 64, x1 - x0, 128, 26, '#2a2230', 0); rr(x0, CAPY - 72, x1 - x0, 128, 26, '#7b4dff', 7);
    L.forEach((r, i) => { if (i === CAPEN) { rr(r.x - 12, CAPY - 52, r.ww + 24, 88, 18, YEL, 6); capWord(r, CAPSZ, '#2a2230', 1, -8, false); } else capWord(r, CAPSZ, '#ffffff', 1, -8, false); }); g.restore(); },
  E: t => { if (t < .3) return; const L = capLayout(78); L.forEach((r, i) => { const u = t - wT(i); let sc = 1, dy = 0; if (u > 0) { const b = Math.exp(-5 * u) * Math.sin(u * 16); sc = 1 + .32 * Math.max(0, b) + .06 * Math.min(0, b); dy = -26 * Math.max(0, Math.exp(-5 * u) * Math.sin(u * 12)); }
    capWord(r, CAPSZ, i === CAPEN ? YEL : '#ffffff', sc, dy); }); },
};

// ---------- title plate ----------
function plate(n, ru, en, u) { const k = spr(P01(u, 0, .4), 8, 11), sc = .94 + .06 * k; g.save(); g.translate(540, 245); g.scale(sc, sc); g.translate(-540, -245);
  rr(58, 168, 970, 172, 30, 'rgba(42,34,48,0.30)', 0); rr(50, 158, 970, 172, 30, '#fffaf0', 7); ell(138, 244, 56, 56, '#ff5f6d', 6); let f = n > 9 ? 50 : 58; txt(String(n), 138, 246, f, '#ffffff');
  let s = 56; g.font = `${s}px ${FONT}`; while (g.measureText(ru).width > 800 && s > 34) { s -= 2; g.font = `${s}px ${FONT}`; } txt(ru, 214, 218, s, INK, FONT, 'left'); txt(en, 216, 284, 40, '#4a5c96', HW, 'left'); g.restore(); }

// ---------- segments ----------
// each: ru / en (plate), d (s), src (skill), desc, draw(t) -> paints G0 (whole frame), sfx: [[t, type, gain, param]]
const S = [];
const seg = (ru, en, d, src, desc, draw, sfx = []) => S.push({ru, en, d, src, desc, draw, sfx});
const full = (cam, o) => shot(G0, cam, o);

// 1 animated title plate (letter stamps + typed subtitle)
seg('Анимированная плашка', 'animated title plate', 3.6, 'animation-studio (title stamps) + kinetic-cut-video (staggered slam, typed)', 'Буквы заголовка «штампуются» по одной на цветных карточках с пружиной, подзаголовок печатается.',
  t => { full(WIDE, {t, ch: {mood: t > 1.2 ? 'happy' : 'neutral'}});
    const word = 'УТРО', cols = ['#ff5f6d', '#ffb238', '#38b6ff', '#7b4dff']; for (let i = 0; i < 4; i++) { const t0 = .3 + i * .16; if (t < t0) continue; const k = spr(P01(t, t0, .4), 6, 11), sc = 2.2 - 1.2 * k, rot = (hash(i + 3) - .5) * .24;
      g.save(); g.translate(285 + i * 170, 480); g.rotate(rot * (.4 + .6 * k)); g.scale(sc, sc); rr(-72, -84, 144, 168, 14, cols[i], 7); txt(word[i], 0, 6, 120, '#ffffff'); g.restore(); }
    if (t > 1.2) { const s = 'серия 1: кофе', n = Math.floor(clamp((t - 1.2) / .7) * s.length); rr(600, 600, 410, 74, 16, '#2a2230', 0); g.font = `44px ${HW}`; txt(s.slice(0, n), 625, 638, 44, '#ffffff', HW, 'left');
      if (n < s.length || Math.floor(t * 3) % 2) { const x = 625 + g.measureText(s.slice(0, n)).width + 4; rr(x, 616, 5, 44, 2, '#ffd23f', 0); } } },
  [[.3, 'pop', .5, 1], [.46, 'pop', .5, 1.12], [.62, 'pop', .5, 1.25], [.78, 'pop', .5, 1.4], ...Array.from({length: 13}, (_, i) => [1.2 + i * .054, 'type', .18])]);
// 2 hard cut / jump cut
seg('Жёсткая склейка / джамп-кат', 'hard cut / jump cut', 3.4, 'capcut (jump cuts, punch-ins) + animation-studio (hard cut)', 'Мгновенная смена плана без перехода: общий → лицо → кружка.',
  t => { if (t < 1.1) full(WIDE, {t}); else if (t < 2.2) full(FACE(1.9), {t, ch: {mood: 'surprised', look: .6}}); else full({x: 760, y: 1220, z: 2.3}, {t, ch: {mood: 'surprised'}}); },
  [[1.1, 'click', .5], [2.2, 'click', .5]]);
// 3 whip pan with motion blur
seg('Переход «вжух»', 'whip pan + motion blur', 3.6, 'animation-studio (whip transition) + kinetic-cut-video (motion blur)', 'Камера резко «швыряется» в сторону, кадр смазывается и приземляется на новый объект.',
  t => { const A = {x: CX0, y: 840, z: 1.8}, B = {x: 800, y: 1190, z: 1.9}, t0 = 1.2, d = .45, p = P01(t, t0, d), k = spr(p, 9, 8), cam = {x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), z: A.z};
    const o = {t, ch: {mood: 'sleepy', look: t > t0 ? 1 : 0}}; if (p <= 0 || p >= 1) { full(p >= 1 ? B : A, o); return; }
    const k2 = spr(clamp(p + .06), 9, 8), vx = (lerp(A.x, B.x, k2) - cam.x) * cam.z, vy = (lerp(A.y, B.y, k2) - cam.y) * cam.z; shot(GA, cam, o); blurCopies(CA, 10, f => g.translate(-vx * (f - .5) * 3, -vy * (f - .5) * 3)); },
  [[1.15, 'whoosh', .6, .5]]);
// 4 zoom transition
seg('Зум-переход', 'zoom transition', 3.6, 'animation-studio (zoom transition)', 'Камера «влетает» в кружку с радиальным смазом и вылетает уже из другого плана.',
  t => { const t0 = .7, tc = 1.45, t1 = 2.2; if (t < tc) { const p = P01(t, t0, tc - t0), z = 1 * Math.pow(7, ei(p)), cam = {x: lerp(540, MUG[0], ease(p * 1.6)), y: lerp(960, MUG[1] - 55, ease(p * 1.6)), z};
      if (p <= 0) { full(WIDE, {t}); return; } shot(GA, cam, {t}); const amt = .04 + .3 * ei(p); blurCopies(CA, 8, f => { const s = 1 + amt * f; g.translate(540, 960); g.scale(s, s); g.translate(-540, -960); }); }
    else { const p = P01(t, tc, t1 - tc), z = lerp(7, 1.7, eo(p)), cam = {x: CX0, y: HEAD()[1] + 40, z}; const o = {t, ch: {mood: 'surprised'}}; if (p >= 1) { full(cam, o); return; }
      shot(GA, cam, o); const amt = .3 * (1 - eo(p)); blurCopies(CA, 8, f => { const s = 1 + amt * f; g.translate(540, 960); g.scale(s, s); g.translate(-540, -960); }); } },
  [[.75, 'riser', .45, .7], [1.45, 'whoosh', .5, .4]]);
// 5 match cut through an object (clock -> coffee)
function coffeeTop(t, r, rot) { g.fillStyle = '#c48a56'; g.fillRect(0, 0, W, H); g.fillStyle = '#b37a48'; for (let y = -40; y < H; y += 140) g.fillRect(0, y, W, 10);
  g.save(); g.translate(540, 960); g.rotate(rot); ell(0, 0, r * 1.18, r * 1.18, '#e2574c', 9); rr(r * 1.12, -46, 140, 92, 30, '#e2574c', 9); ell(0, 0, r * 1.18, r * 1.18, '#e2574c', 9); ell(0, 0, r, r, '#6e3f22', 8);
  ell(0, 0, r * .86, r * .86, '#8a5630', 0); g.save(); g.scale(r / 250, r / 250); g.beginPath(); g.moveTo(0, 90); g.bezierCurveTo(-150, -10, -80, -150, 0, -60); g.bezierCurveTo(80, -150, 150, -10, 0, 90); g.fillStyle = '#f6e2c4'; g.fill(); g.restore(); g.restore(); }
seg('Склейка через предмет', 'match cut', 3.6, 'kinetic-cut-video (motif match cut)', 'Круглые часы крупно → резкая склейка → кружка кофе сверху в той же точке и того же размера.',
  t => { const tc = 1.6; if (t < tc) { const z = lerp(2.9, 3.6, eio(P01(t, 0, tc))); full({x: CLOCK[0], y: CLOCK[1], z}, {t, spin: t * t * .9}); }
    else coffeeTop(t, 70 * 3.6 * lerp(1, .82, eo(P01(t, tc, 2))), -.15 * eo(P01(t, tc, 2))); },
  [[.1, 'tick', .3], [.5, 'tick', .3], [.9, 'tick', .3], [1.3, 'tick', .3], [1.6, 'clink', .45]]);
// 6 wipe
seg('Шторка', 'wipe', 3.6, 'animation-studio (wipe transition)', 'Цветная диагональная полоса проходит по кадру и открывает за собой следующий план.',
  t => { const p = eio(P01(t, 1.1, .8)), oA = {t, ch: {mood: 'sleepy'}}, oB = {t, ch: {mood: 'happy', arms: ARMS.mugR}, mug: {held: true}}; if (p <= 0) { full(WIDE, oA); return; } if (p >= 1) { full(WIDE, oB); return; }
    full(WIDE, oA); shot(GA, WIDE, oB); const X = lerp(-500, 1700, p), sl = 420; g.save(); g.beginPath(); g.moveTo(-10, -10); g.lineTo(X + sl, -10); g.lineTo(X - sl, H + 10); g.lineTo(-10, H + 10); g.closePath(); g.clip(); g.drawImage(CA, 0, 0); g.restore();
    poly([[X + sl, -10], [X + sl + 90, -10], [X - sl + 90, H + 10], [X - sl, H + 10]], '#ffc83d', 0); ln([[X + sl, -10], [X - sl, H + 10]], 8); ln([[X + sl + 90, -10], [X - sl + 90, H + 10]], 8); },
  [[1.1, 'whoosh', .45, .8]]);
// 7 iris / circle wipe
seg('Круглая шторка', 'iris / circle wipe', 3.6, 'animation-studio (UI.iris circle wipe)', 'Круг сжимается в точку на кружке и раскрывается уже на телефоне.',
  t => { const tc = 1.55, A = WIDE, B = {x: 800, y: 1170, z: 1.7}, closeP = P01(t, .85, tc - .85), openP = P01(t, tc + .15, .7); const first = t < tc + .075;
    const cam = first ? A : B, o = {t, ch: {mood: first ? 'neutral' : 'surprised', look: 1}}; full(cam, o); const c = first ? toScreen(A, [MUG[0], MUG[1] - 55]) : toScreen(B, [PHONE[0], PHONE[1] - 75]);
    const r = first ? lerp(1500, 0, eio(closeP)) : lerp(0, 1500, eio(openP)); if (r >= 1499) return; g.save(); g.beginPath(); g.rect(0, 0, W, H); g.moveTo(c[0] + r, c[1]); g.arc(c[0], c[1], Math.max(0, r), 0, Math.PI * 2, true); g.fillStyle = '#2b2d5c'; g.fill('evenodd'); g.restore();
    if (r > 2) ell(c[0], c[1], r, r, null, 10, '#ffc83d'); },
  [[.9, 'swish', .45, .6], [1.72, 'pop', .4, .8]]);
// 8 crossfade
seg('Плавный наплыв', 'clean crossfade (dissolve)', 3.6, 'animation-studio (dissolve / fade)', 'Один кадр мягко растворяется в другом, без вспышек и глитчей.',
  t => { const p = eio(P01(t, 1.0, 1.1)); full(WIDE, {t, ch: {mood: 'sleepy'}}); if (p > 0) { shot(GA, FACE(1.6), {t, ch: {mood: 'happy', arms: ARMS.mugR}, mug: {held: true}}); g.save(); g.globalAlpha = p; g.drawImage(CA, 0, 0); g.restore(); } },
  [[1.0, 'chime', .25, 1]]);
// 9 push slide
seg('Сдвиг кадра', 'push slide', 3.6, 'animation-studio (push transition)', 'Новый кадр въезжает сбоку и выталкивает старый, плавно, без отскока.',
  t => { const p = eio(P01(t, 1.2, .6)); const oA = {t}, B = {x: 800, y: 1180, z: 1.8}, oB = {t, ch: {mood: 'happy'}}; if (p <= 0) { full(WIDE, oA); return; } if (p >= 1) { full(B, oB); return; }
    shot(GA, WIDE, oA); shot(GBb, B, oB); g.drawImage(CA, -W * p, 0); g.drawImage(CB, W * (1 - p), 0); g.fillStyle = INK; g.fillRect(W * (1 - p) - 4, 0, 8, H); },
  [[1.2, 'whoosh', .45, .45]]);
// 10 paper wipe
function tornSheet(x, y, w, h, txtS) { g.save(); g.translate(x, y); g.rotate(-.06); const pts = []; const N = 26;
  for (let i = 0; i <= N; i++) pts.push([-w / 2 + (i / N) * w, -h / 2 + (hash(i) - .5) * 40]); for (let i = 0; i <= N; i++) pts.push([w / 2 + (hash(i + 40) - .5) * 40, -h / 2 + (i / N) * h]);
  for (let i = N; i >= 0; i--) pts.push([-w / 2 + (i / N) * w, h / 2 + (hash(i + 80) - .5) * 40]); for (let i = N; i >= 0; i--) pts.push([-w / 2 + (hash(i + 120) - .5) * 40, -h / 2 + (i / N) * h]);
  poly(pts.map(([a, b]) => [a + 16, b + 16]), 'rgba(42,34,48,.28)', 0); poly(pts, '#fbf3e0', 6); txt(txtS, 0, 0, 150, '#e2574c', HW); g.restore(); }
seg('Бумажная шторка', 'paper wipe', 3.6, 'animation-studio (paper wipe)', 'Рваный лист бумаги с надписью пролетает через кадр и полностью закрывает его в момент склейки.',
  t => { const p = P01(t, .9, 1.3), tc = 1.55; if (t < tc) full(WIDE, {t, ch: {mood: 'happy', arms: ARMS.mugR}, mug: {held: true}}); else full(WIDE, {t, night: .55, lampOn: 1, ch: {mood: 'sleepy'}});
    if (p > 0 && p < 1) tornSheet(lerp(1900, -820, eio(p)), 960, 1700, 2300, 'ПОЗЖЕ…'); },
  [[.95, 'paper', .5]]);
// 11 collapse to a line
seg('Свёртка в линию', 'squeeze-to-line transition', 3.6, 'kinetic-cut-video (collapse / suck-out)', 'Кадр сплющивается в тонкую линию и раскрывается пружиной уже новым планом.',
  t => { const tc = 1.45; g.fillStyle = INK; g.fillRect(0, 0, W, H); if (t < tc) { const q = ei(P01(t, .85, tc - .85)); shot(GA, WIDE, {t}); g.save(); g.translate(540, 960); g.scale(1 - q * .15, Math.max(.004, 1 - q)); g.translate(-540, -960); g.drawImage(CA, 0, 0); g.restore(); }
    else { const k = spr(P01(t, tc + .05, .55), 7, 9); shot(GA, FACE(1.7), {t, ch: {mood: 'grin'}}); g.save(); g.translate(540, 960); g.scale(.85 + .15 * k, Math.max(.004, k)); g.translate(-540, -960); g.drawImage(CA, 0, 0); g.restore(); } },
  [[.9, 'zip', .4], [1.5, 'pop', .45, .7]]);
// 12 slow push-in
seg('Медленный наезд', 'slow push-in', 3.4, 'animation-studio (Shots.push, slow push-ins) + capcut (keyframes)', 'Камера медленно и плавно приближается к лицу — нагнетание.',
  t => { const p = eio(P01(t, 0, 3.4)), F = FACE(), cam = {x: lerp(540, F.x, p), y: lerp(960, F.y, p), z: lerp(1, 1.45, p), dx: 3 * noise(t * .8, 3), dy: 3 * noise(t * .8, 4)}; full(cam, {t, ch: {mood: t > 1.6 ? 'worried' : 'neutral', look: t > 1.6 ? -.6 : 0}}); },
  [[0, 'riser', .2, 3.2]]);
// 13 punch-in with small shake
seg('Резкий наезд с тряской', 'punch-in + small shake', 3.4, 'capcut (punch-ins) + animation-studio (R.shake)', 'Быстрый «удар» камерой к лицу с маленькой затухающей тряской.',
  t => { const t0 = 1.0, k = ex(P01(t, t0, .16)), F = FACE(1.7), [sx, sy] = shake(t, t0 + .1, 9); full({x: lerp(540, F.x, k), y: lerp(960, F.y, k), z: lerp(1, 1.7, k), dx: sx, dy: sy}, {t, ch: {mood: t >= t0 ? 'shocked' : 'neutral'}}); },
  [[1.0, 'thud', .55]]);
// 14 drama zoom
seg('Драма-зум', 'drama zoom', 3.4, 'animation-studio (snap zoom, close-ups) + kinetic-cut-video (camera hits)', 'Три быстрых рывка камеры к лицу на «дун-дун-ДУН».',
  t => { const steps = [[.6, 1.3], [1.3, 1.75], [2.0, 2.3]]; let z = 1; for (const [a, zz] of steps) { const k = ex(P01(t, a, .12)); z = lerp(z, zz, k); } const F = FACE(), f = clamp((z - 1) / .3);
    full({x: lerp(540, F.x, f), y: lerp(960, F.y, f), z}, {t, ch: {mood: t < .6 ? 'neutral' : t < 1.3 ? 'surprised' : 'shocked', look: 0}}); },
  [[.6, 'dun', .5, 1], [1.3, 'dun', .5, .89], [2.0, 'dun', .6, .75]]);
// 15 Dutch tilt
seg('Голландский угол', 'Dutch tilt', 3.4, 'animation-studio (withCam rot) — task list', 'Камера плавно заваливается на ~11° — «что-то тут не так».',
  t => { const k = spr(P01(t, .7, .9), 5, 6); full({x: 470, y: 1000, z: 1.25, rot: -.19 * k}, {t, ch: {mood: t > .7 ? 'smugside' : 'neutral', look: t > .7 ? 1 : 0}}); },
  [[.7, 'slide', .35]]);
// 16 parallax pan
seg('Параллакс-панорама', 'parallax pan', 3.6, 'animation-studio (Shots.layers parallax)', 'Слои двигаются с разной скоростью: стена медленно, комната средне, растения впереди быстро.',
  t => { const p = eio(P01(t, .2, 3.2)); full({x: 540, y: 1000, z: 1.12}, {t, par: lerp(-170, 170, p), fg: true, ch: {look: lerp(-1, 1, p)}}); },
  [[.2, 'whoosh', .2, 2.8]]);
// 17 spring in/out with overshoot
const popIn = (t, a, b) => { if (t < a) return 0; const k = spr(P01(t, a, .55), 6, 11); if (t < b) return k; const q = P01(t, b, .35); return q < .4 ? 1 + .18 * ease(q / .4) : 1.18 * (1 - ei((q - .4) / .6)); };
seg('Пружина с перелётом', 'spring in/out + overshoot', 3.4, 'kinetic-cut-video (spr) + animation-studio (UI.pop)', 'Предметы выпрыгивают с перелётом размера и уходят с маленьким замахом.',
  t => { full({x: 700, y: 1120, z: 1.4}, {t, ch: {mood: 'happy', look: 1}, mug: {k: popIn(t, .4, 2.5)}, phone: {k: popIn(t, .8, 2.75)}}); },
  [[.4, 'pop', .5, 1], [.8, 'pop', .5, 1.2], [2.5, 'pop', .35, 1.5], [2.75, 'pop', .35, 1.7]]);
// 18 anticipation (crouch -> jump)
seg('Замах перед действием', 'anticipation', 3.6, 'animation-studio (acting: anticipation, squash on landing)', 'Перед прыжком персонаж приседает и отводит руки — зритель «чувствует» прыжок заранее.',
  t => { const c0 = .4, c1 = 1.2, l = 1.85; let sq = 1, dy = 0, arms = null, mood = 'neutral';
    if (t >= c0 && t < c1) { const k = ease(P01(t, c0, .5)); sq = 1 - .14 * k; arms = ARMS.back; mood = 'angry'; }
    else if (t >= c1 && t < l) { const p = (t - c1) / (l - c1); dy = -300 * 4 * p * (1 - p); sq = 1 + .1 * Math.sin(Math.PI * p); arms = T.POSES.cheer; mood = 'happy'; }
    else if (t >= l) { const u = t - l; sq = 1 - .16 * Math.exp(-7 * u) * Math.cos(u * 14); mood = 'grin'; arms = u < .5 ? T.POSES.cheer : null; }
    full(WIDE, {t, ch: {sq, y: CY0 + dy, arms, mood}}); },
  [[1.2, 'boing', .5], [1.85, 'thud', .5]]);
// 19 squash & stretch (bouncing mug)
seg('Сжатие и растяжение', 'squash & stretch', 3.6, 'animation-studio (squash & stretch) + kinetic-cut-video (FX.slam)', 'Кружка падает вытянутой, при ударе сплющивается и пружинит обратно.',
  t => { const hits = [.75, 1.45, 1.95, 2.3], top = 880; let y = MUG[1], sx = 1, sy = 1;
    if (t < hits[0]) { const p = clamp(t / hits[0]); y = lerp(top, MUG[1], p * p); sy = 1 + .22 * p; sx = 1 - .12 * p; }
    else { let i = 0; while (i < hits.length - 1 && t >= hits[i + 1]) i++; const a = hits[i], b = hits[i + 1]; const u = t - a;
      if (b && t < b) { const p = (t - a) / (b - a), hgt = [220, 90, 30][i]; y = MUG[1] - hgt * 4 * p * (1 - p); }
      const amp = [.32, .2, .12, .08][i] * Math.exp(-9 * u); sy = 1 - amp * Math.cos(u * 18); sx = 1 + amp * .8 * Math.cos(u * 18); if (b && t < b) { const p = (t - a) / (b - a), v = Math.abs(1 - 2 * p); sy *= 1 + .12 * v * [1, .6, .3][i]; sx *= 1 - .07 * v * [1, .6, .3][i]; } }
    full({x: 640, y: 1140, z: 1.3}, {t, ch: {mood: 'surprised', look: 1}, mug: {y, sx, sy, steam: 0}}); },
  [[.75, 'thud', .45, 1], [1.45, 'boing', .3, 1.2], [1.95, 'thud', .25, 1.3], [2.3, 'thud', .15, 1.5]]);
// 20 follow-through
seg('Захлёст (инерция)', 'follow-through', 3.6, 'animation-studio (acting) — task list (animation principle)', 'Персонаж резко останавливается, а тело и голова по инерции «проезжают» дальше и пружинят назад.',
  t => { const t1 = .95, p = eo(P01(t, .25, t1 - .25)), x = lerp(-320, CX0, p); const u = t - t1; let lean = 0, tilt = 0, arms = null;
    if (t < t1) lean = .1 * clamp((t - .25) / .2); else { lean = .1 * Math.exp(-4 * u) * Math.cos(u * 9); tilt = .14 * Math.exp(-3.5 * u) * Math.sin(u * 9); const sw = 60 * Math.exp(-3 * u) * Math.sin(u * 9 + .5); arms = s => [[s * 78, -860], [s * 102 + sw, -720], [s * 110 + sw * 1.6, -580]]; }
    full(WIDE, {t, ch: {x, lean, tilt, arms, mood: 'grin'}}); },
  [[.25, 'slide', .4], [.95, 'boing', .3, .8]]);
// 21 smear frame
function armPts(st, s, fn) { const a = fn(s), pts = T.solveArm(a[0], a[2], a[1], s, 0); return pts.map(p => [st.x + p[0] * st.s, st.y + p[1] * st.s]); }
seg('Смазанный кадр', 'smear frame', 3.4, 'task list (animation principle); smear in the style of FX.speedLines', 'На 3–4 кадра рука растягивается в «мазок» — так быстрое движение выглядит мультяшно.',
  t => { const ups = [[.9, 1.05], [2.35, 2.5]]; let k = t < ups[0][0] ? 0 : t < ups[0][1] ? ease(P01(t, ups[0][0], .15)) : t < ups[1][0] ? 1 : 1 - ease(P01(t, ups[1][0], .15));
    const wv = t > 1.1 && t < 2.3 ? Math.sin((t - 1.1) * 10) * 26 : 0;
    const armF = s => { const d = T.POSES.down(s), w = ARMS.wave(s); if (s < 0) return d; return d.map((p, i) => [lerp(p[0], w[i][0], k) + (i === 2 ? wv : 0), lerp(p[1], w[i][1], k)]); };
    full(WIDE, {t, ch: {arms: armF, mood: 'happy'}, preChar: st => { const fast = ups.some(([a, b]) => t > a - .02 && t < b + .1); if (!fast) return;
      const pts = []; for (let i = 0; i < 6; i++) { const tt = t - i * .03; const kk = tt < ups[0][0] ? 0 : tt < ups[0][1] ? ease(P01(tt, ups[0][0], .15)) : tt < ups[1][0] ? 1 : 1 - ease(P01(tt, ups[1][0], .15));
        const a = T.POSES.down(1).map((p, j) => [lerp(p[0], ARMS.wave(1)[j][0], kk), lerp(p[1], ARMS.wave(1)[j][1], kk)]); pts.push(armPts(st, 1, () => a)); }
      const hs = pts.map(p => p[2]), es = pts.map(p => p[1]); const band = (A, w0) => { const L = [], R = []; for (let i = 0; i < A.length; i++) { const a = A[i], b = A[Math.min(A.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, w = w0 * (1 - i / A.length); L.push([a[0] + Math.cos(an) * w, a[1] + Math.sin(an) * w]); R.unshift([a[0] - Math.cos(an) * w, a[1] - Math.sin(an) * w]); } return L.concat(R); };
      poly(band(es, 26), MAX.pal.sleeve, 5); poly(band(hs, 26), MAX.pal.skin, 5); for (let i = 1; i < 4; i++) { const h = hs[i]; ln([[h[0] + 30, h[1]], [h[0] + 70, h[1] + 10]], 5); } }}); },
  [[.9, 'swish', .45, 1.2], [2.35, 'swish', .4, 1]]);
// 22 freeze frame with a label
function splashScene(t, tf) { const tt = Math.min(t, tf); return {t: tt, ch: {arms: ARMS.tilt, mood: tt > .5 ? 'shocked' : 'neutral', look: 1}, mug: {held: true, rot: lerp(0, 1.1, ease(P01(tt, .3, .5))), dx: 10, dy: -10, steam: 0},
  extra: st => { const p = P01(tt, .55, 1); if (p <= 0) return; const h = handOf(st, 1); for (let i = 0; i < 9; i++) { const a = -1.2 + hash(i) * 1.2, v = 300 + hash(i + 5) * 260, x = h[0] + 70 + Math.cos(a) * v * p, y = h[1] - 60 + Math.sin(a) * v * p + 500 * p * p; ell(x, y, 16 + hash(i + 9) * 14, 12 + hash(i + 2) * 10, '#7a4a2a', 5); } }}; }
seg('Стоп-кадр с подписью', 'freeze-frame + label', 3.8, 'animation-studio (freeze frame + red-pencil circle)', 'Действие замирает, кадр обесцвечивается, появляется обводка и подпись-комментарий.',
  t => { const tf = 1.0; if (t < tf) { full(WIDE, splashScene(t, tf)); return; } shot(GA, WIDE, splashScene(t, tf)); const z = lerp(1, 1.05, eo(P01(t, tf, 2.5)));
    g.save(); g.filter = 'grayscale(1) contrast(1.25)'; g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); g.drawImage(CA, 0, 0); g.filter = 'none';
    const c = [700, 1030]; const pts = Array.from({length: 61}, (_, i) => { const a = -2.2 + i / 60 * Math.PI * 2.15; return [c[0] + Math.cos(a) * 200, c[1] + Math.sin(a) * 140]; }); drawOn(pts, eo(P01(t, tf + .1, .45)), '#e8343c', 12); g.restore();
    const k = spr(P01(t, tf + .25, .45), 6, 10); if (k > 0) { g.save(); g.translate(720, 1470); g.rotate(-.04); g.scale(k, k); rr(-330, -62, 660, 124, 20, '#ffd23f', 7); txt('Макс ещё не знает…', 0, 4, 62, INK); g.restore(); } },
  [[1.0, 'scratch', .45], [1.1, 'scribble', .35, .45]]);
// 23 pop-up stickers
function stickerWow(x, y, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); star(0, 0, 130, '#ffd23f', 7, 12, 0, .74); txt('ВАУ', 0, 6, 74, '#e2574c'); g.restore(); }
function stickerHeart(x, y, k, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.beginPath(); g.moveTo(0, 50); g.bezierCurveTo(-90, -10, -50, -90, 0, -40); g.bezierCurveTo(50, -90, 90, -10, 0, 50); g.fillStyle = '#ff5f8a'; g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.stroke(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.restore(); }
function stickerTag(x, y, k, rot, s) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `56px ${FONT}`; const w = g.measureText(s).width + 60; rr(-w / 2, -50, w, 100, 50, '#ffffff', 0); rr(-w / 2 + 10, -40, w - 20, 80, 40, '#38b6ff', 6); txt(s, 0, 4, 56, '#ffffff'); g.restore(); }
seg('Стикер', 'pop-up sticker', 3.4, 'capcut (stickers / text pops) + animation-studio (UI.pop)', 'Стикеры выпрыгивают с пружиной и слегка покачиваются — не на лице.',
  t => { full(WIDE, {t, ch: {mood: 'grin', arms: ARMS.mugR}, mug: {held: true}}); const a = spr(P01(t, .35, .5), 6, 10), b = spr(P01(t, .75, .5), 6, 10), c = spr(P01(t, 1.15, .5), 6, 10);
    if (a > 0) stickerWow(840, 590, a, .12 + .04 * Math.sin(t * 3)); if (b > 0) stickerHeart(610, 1010, b, -.15 + .05 * Math.sin(t * 3.4)); if (c > 0) stickerTag(800, 1430, c, -.05 + .03 * Math.sin(t * 2.6), 'утро спасено'); },
  [[.35, 'pop', .5, 1], [.75, 'pop', .45, 1.3], [1.15, 'pop', .45, 1.15]]);
// 24 arrow / circle annotation
seg('Стрелка и обводка', 'arrow + circle annotation', 3.6, 'animation-studio (red-pencil circle, handwriting reveal) + kinetic-cut-video (drawOn)', 'От руки рисуется стрелка к кружке с подписью, затем телефон обводится кружком.',
  t => { full(WIDE, {t, ch: {mood: 'happy', look: 1}}); const p1 = eo(P01(t, .4, .55)), arr = bez([900, 760], [700, 860], [745, 1150]); const tip = drawOn(arr, p1, '#e8343c', 12);
    if (p1 >= 1) { const a = Math.atan2(arr[40][1] - arr[38][1], arr[40][0] - arr[38][0]); for (const s of [-1, 1]) ln([tip, [tip[0] - Math.cos(a + s * .5) * 50, tip[1] - Math.sin(a + s * .5) * 50]], 12, '#e8343c'); }
    const lk = P01(t, .3, .6); if (lk > 0) { g.save(); g.beginPath(); g.rect(580, 640, 480 * lk, 120); g.clip(); rr(590, 650, 460, 100, 18, '#fffaf0', 6); txt('мой лучший друг', 820, 700, 58, '#e8343c', HW); g.restore(); }
    const p2 = eo(P01(t, 1.5, .5)); if (p2 > .6) drawOn([[885, 1370], [880, 1310]], 1, '#e8343c', 0); const c = PHONE, pts = Array.from({length: 61}, (_, i) => { const a = -1.4 + i / 60 * Math.PI * 2.1; return [c[0] + Math.cos(a) * 85, c[1] - 75 + Math.sin(a) * 120]; }); drawOn(pts, p2, '#e8343c', 10);
    const lk2 = P01(t, 1.8, .5); if (lk2 > 0) { g.save(); g.beginPath(); g.rect(700, 1355, 380 * lk2, 110); g.clip(); rr(720, 1370, 330, 84, 18, '#fffaf0', 6); txt('не трогать', 885, 1412, 52, '#e8343c', HW); g.restore(); } },
  [[.35, 'scribble', .35, .6], [1.5, 'scribble', .35, .6]]);
// 25 speed lines
seg('Линии скорости', 'speed lines', 3.4, 'kinetic-cut-video (FX.speedLines) + anime focus lines', 'Персонаж влетает в кадр с горизонтальными линиями скорости, затем вокруг — фокус-линии.',
  t => { const t1 = .9, p = ex(P01(t, .2, t1 - .2)), x = lerp(-420, CX0, p), v = 1 - P01(t, .5, t1 - .5);
    full(WIDE, {t, ch: {x, lean: .12 * v, mood: t < t1 ? 'angry' : 'grin'}, behind: () => { if (t > t1) { const k = ease(P01(t, t1, .4)), c = HEAD(); g.save(); g.translate(c[0], c[1] + 120); g.rotate(t * .05);
      for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2 + hash(i) * .05, r0 = 520 + hash(i + 3) * 160, r1 = 1600; g.beginPath(); g.moveTo(Math.cos(a - .012) * r1, Math.sin(a - .012) * r1); g.lineTo(Math.cos(a) * lerp(r1, r0, k), Math.sin(a) * lerp(r1, r0, k)); g.lineTo(Math.cos(a + .012) * r1, Math.sin(a + .012) * r1); g.closePath(); g.fillStyle = INK; g.fill(); } g.restore(); } } });
    if (v > 0 && t > .2) for (let i = 0; i < 14; i++) { const y = 600 + hash(i) * 1000, L = (200 + hash(i + 4) * 300) * v, xe = x - 140 - hash(i + 8) * 120; ln([[xe - L, y], [xe, y]], 6 + hash(i) * 6, i % 3 ? INK : '#ffffff'); } },
  [[.2, 'whoosh', .5, .6]]);
// 26 impact frame
seg('Кадр удара', 'impact frame', 3.6, 'animation-studio (impact frame: sunburst behind, star, hold) — без вспышки', 'В момент удара за персонажем раскрываются цветные лучи, звезда и короткая тряска; поза замирает.',
  t => { const t0 = 1.0, on = t >= t0, k = spr(P01(t, t0, .5), 6, 9), [sx, sy] = shake(t, t0, 8, 7);
    full({x: 540, y: 960, z: 1, dx: sx, dy: sy}, {t, ch: {mood: on ? 'laugh' : 'neutral', arms: on ? ARMS.mugUp : ARMS.mugR}, mug: {held: true, dy: on ? 0 : 0},
      behind: () => { if (!on) return; const c = [CX0 + 40, 900]; g.save(); g.translate(c[0], c[1]); g.rotate(t * .12); g.scale(k, k); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; poly([[0, 0], [Math.cos(a) * 2000, Math.sin(a) * 2000], [Math.cos(a + Math.PI / 18) * 2000, Math.sin(a + Math.PI / 18) * 2000]], i % 2 ? '#ffd23f' : '#fff3c4', 0); }
        g.restore(); },
      extra: st => { if (!on) return; const h = handOf(st, 1); star(h[0] + 120, h[1] - 120, 70 * k, '#ffffff', 6, 8, t * .5); star(h[0] + 120, h[1] - 120, 40 * k, '#ff5f6d', 0, 8, t * .5); } }); },
  [[1.0, 'boom', .55], [1.0, 'pop', .3, .6]]);
// 27 speech bubble + typewriter
function bubble(x, y, w, h, tx, ty, k) { g.save(); g.translate(x + w / 2, y + h / 2); g.scale(k, k); g.translate(-(x + w / 2), -(y + h / 2)); poly([[x + 60, y + h - 6], [tx, ty], [x + 140, y + h - 6]], '#ffffff', 7); rr(x, y, w, h, 40, '#ffffff', 7); g.fillStyle = '#ffffff'; g.fillRect(x + 64, y + h - 12, 70, 14); g.restore(); }
seg('Пузырь с печатью', 'speech bubble + typewriter', 3.6, 'animation-studio (G.bubble) + kinetic-cut-video (typed)', 'Пузырь реплики выпрыгивает, текст печатается по буквам синхронно с ртом.',
  t => { const s = 'Ещё пять минут…', a = .55, n = Math.floor(clamp((t - a) / 1.3) * s.length); full(WIDE, {t, ch: {mood: 'sleepy', mouth: t > a && t < a + 1.35 ? talkMouth(t, a, a + 1.35) : 0, talking: t > a && t < a + 1.35}});
    const k = spr(P01(t, .3, .45), 6, 10); if (k > 0) { bubble(560, 470, 470, 190, 450, 800, k); if (k > .9) txt(s.slice(0, n), 795, 563, 52, INK, FONT); } },
  [[.3, 'pop', .4, 1], ...Array.from({length: 14}, (_, i) => [.55 + i * .093, 'type', .2])]);
// 28 counter
seg('Счётчик', 'number counter', 3.4, 'kinetic-cut-video (number roll) + animation-studio (Data.counter)', 'Число быстро «накручивается» и щёлкает пружиной на финальном значении.',
  t => { const v = Math.round(7 * eo(P01(t, .4, 1.4))); full(WIDE, {t, ch: {mood: v >= 7 ? 'cryinglaugh' : 'surprised', arms: ARMS.mugR, look: 1}, mug: {held: true}});
    g.save(); rr(590, 470, 420, 290, 30, '#2a2230', 0); rr(580, 460, 420, 290, 30, '#ffffff', 7); txt('чашек кофе', 790, 520, 46, INK, FONT); txt('сегодня:', 790, 570, 46, INK, FONT);
    const k = v >= 7 ? 1 + .35 * (1 - spr(P01(t, 1.8, .5), 6, 11)) : 1; g.translate(790, 670); g.scale(k, k); otxt(String(v), 0, 0, 130, v >= 7 ? '#e2574c' : '#ffd23f', FONT, 'center', .14); g.restore(); },
  [...[1, 2, 3, 4, 5, 6].map(i => [.4 + 1.4 * (1 - Math.cbrt(1 - (i - .5) / 7)), 'tick', .3]), [1.8, 'pop', .5, 1.3]]);
// 29 lighting change
seg('Свет и настроение', 'lighting change (day -> night)', 3.6, 'animation-studio (lighting: multiply gradient, lamp glow)', 'Комната плавно темнеет к вечеру, затем мягко загорается лампа. Без вспышек.',
  t => { const n = eio(P01(t, .3, 1.4)), on = eio(P01(t, 2.0, .5)); full(WIDE, {t, night: n * .9, lampOn: on, ch: {mood: on > .5 ? 'kind' : 'sleepy', look: on > .2 ? 1 : 0}}); },
  [[2.0, 'switch', .45]]);
// 30-34 caption styles
const capSeg = (L, ru, en, src, desc) => seg(ru, en, 3.8, src, desc, t => { full(WIDE, {t, ch: {mood: 'happy', mouth: talkMouth(t, CAPT0, wT(4) + .35), talking: t > CAPT0 && t < wT(4) + .35}, mug: {}}); CAPS[L](t); });
capSeg('A', 'Подписи A: как сейчас', 'current channel style: phrase pops in', 'current channel captions (zhanna_grwm render.js) + animation-studio Subs', 'Вся фраза сразу, белый/жёлтый с чёрной обводкой, появляется «попом».');
capSeg('B', 'Подписи B: караоке', 'word-by-word karaoke highlight', 'animation-studio (Subs karaoke) + capcut (caption preset)', 'Вся фраза видна, текущее слово меняет цвет; английское слово жёлтое с подчёркиванием.');
capSeg('C', 'Подписи C: слово за словом', 'word-by-word appear', 'animation-studio (Subs pop: words appear as said)', 'Слова добавляются по одному в момент произнесения.');
capSeg('D', 'Подписи D: плашка-стикер', 'box / sticker caption', 'animation-studio (Subs box) + capcut (saved caption preset)', 'Фраза на цветной плашке, английское слово на жёлтом ярлыке.');
capSeg('E', 'Подписи E: прыгающие слова', 'bouncy per-word scale pop', 'kinetic-cut-video (per-letter/word fn) + capcut (text pops)', 'Каждое слово по очереди подпрыгивает и увеличивается с пружиной.');

// ---------- timeline ----------
let acc = 0; S.forEach((s, i) => { s.n = i + 1; s.at = acc; acc += s.d; }); const TOTAL = acc;
function frame(t) { let s = S[S.length - 1]; for (const x of S) if (t >= x.at && t < x.at + x.d) { s = x; break; } const u = t - s.at; g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  s.draw(u); g = G0; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; plate(s.n, s.ru, s.en, u); }

// ---------- audio: light synthesized SFX, no music ----------
function audio(out) { const SR = 48000, N = Math.ceil((TOTAL + .5) * SR), L = new Float32Array(N); let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
  const add = (t0, len, fn, gain) => { const a = Math.floor(t0 * SR); for (let i = 0; i < len * SR && a + i < N; i++) if (a + i >= 0) L[a + i] += gain * fn(i / SR, i / (len * SR)); };
  const lp = (fn, cut) => { let y = 0; const a = 1 - Math.exp(-2 * Math.PI * cut / SR); return (tt, p) => { y += a * (fn(tt, p) - y); return y; }; };
  const SFX = {
    pop: (t0, gn, p = 1) => add(t0, .12, (tt, q) => Math.sin(2 * Math.PI * (600 * p) * tt * (1 - .6 * q)) * Math.exp(-tt * 38), gn),
    click: (t0, gn) => add(t0, .03, (tt) => rnd() * Math.exp(-tt * 300), gn * .7),
    tick: (t0, gn) => add(t0, .05, (tt) => Math.sin(2 * Math.PI * 2400 * tt) * Math.exp(-tt * 120), gn * .6),
    type: (t0, gn) => add(t0 + rnd() * .006, .03, (tt) => (rnd() * .6 + Math.sin(2 * Math.PI * 1800 * tt) * .4) * Math.exp(-tt * 220), gn),
    thud: (t0, gn, p = 1) => add(t0, .35, (tt) => Math.sin(2 * Math.PI * 70 * p * tt * (1 - tt)) * Math.exp(-tt * 12) + rnd() * .2 * Math.exp(-tt * 60), gn),
    boom: (t0, gn) => add(t0, .9, (tt) => Math.sin(2 * Math.PI * (55 + 40 * Math.exp(-tt * 8)) * tt) * Math.exp(-tt * 4.5), gn),
    dun: (t0, gn, p = 1) => add(t0, .7, (tt) => (Math.sin(2 * Math.PI * 98 * p * tt) * .7 + Math.sin(2 * Math.PI * 196 * p * tt) * .3) * Math.exp(-tt * 5), gn),
    boing: (t0, gn, p = 1) => add(t0, .45, (tt) => Math.sin(2 * Math.PI * (220 * p + 140 * Math.sin(tt * 40) * Math.exp(-tt * 5)) * tt) * Math.exp(-tt * 6), gn),
    whoosh: (t0, gn, len = .5) => { const f = lp(() => rnd(), 1800); add(t0, len, (tt, q) => f(tt, q) * Math.sin(Math.PI * q) ** 2 * 2.2, gn); },
    swish: (t0, gn, p = 1) => { const f = lp(() => rnd(), 3200 * p); add(t0, .22, (tt, q) => f(tt, q) * Math.sin(Math.PI * q) * 2, gn); },
    riser: (t0, gn, len = 1) => add(t0, len, (tt, q) => Math.sin(2 * Math.PI * (200 + 500 * q * q) * tt) * q * (1 - q * q) * .6, gn),
    zip: (t0, gn) => add(t0, .45, (tt, q) => Math.sin(2 * Math.PI * (900 - 700 * q) * tt) * (1 - q) * .6, gn),
    slide: (t0, gn) => add(t0, .5, (tt, q) => Math.sin(2 * Math.PI * (300 - 120 * q) * tt) * Math.sin(Math.PI * q) * .6, gn),
    chime: (t0, gn, p = 1) => { for (const [f, d] of [[880 * p, 1.2], [1320 * p, .9]]) add(t0, d, (tt) => Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt * 3.5), gn * .5); },
    clink: (t0, gn) => { for (const f of [2100, 3150, 4400]) add(t0, .5, (tt) => Math.sin(2 * Math.PI * f * tt) * Math.exp(-tt * 9), gn * .35); },
    paper: (t0, gn) => { const f = lp(() => rnd(), 5000); add(t0, .5, (tt, q) => f(tt, q) * Math.sin(Math.PI * q) * (0.6 + .4 * Math.sin(tt * 90)) * 2, gn); },
    scribble: (t0, gn, len = .5) => { const f = lp(() => rnd(), 4000); add(t0, len, (tt) => f(tt) * (.5 + .5 * Math.sin(tt * 60)) * 2, gn); },
    scratch: (t0, gn) => { const f = lp(() => rnd(), 2500); add(t0, .35, (tt, q) => (f(tt, q) * 1.5 + Math.sin(2 * Math.PI * (500 - 400 * q) * tt) * .5) * (1 - q), gn); },
    switch: (t0, gn) => { add(t0, .04, (tt) => rnd() * Math.exp(-tt * 200), gn * .8); add(t0 + .05, .03, (tt) => rnd() * Math.exp(-tt * 260), gn * .5); },
  };
  for (const s of S) { SFX.tick(s.at + .02, .12); for (const [tt, ty, gn, pp] of s.sfx) SFX[ty](s.at + tt, gn, pp); }
  let pk = 0; for (const v of L) pk = Math.max(pk, Math.abs(v)); const norm = pk > 0 ? .5 / pk : 1;   // peak at about -6 dBFS
  const buf = Buffer.alloc(44 + N * 4); buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { const v = Math.round(clamp(L[i] * norm, -1, 1) * 32767); buf.writeInt16LE(v, 44 + i * 4); buf.writeInt16LE(v, 46 + i * 4); } fs.writeFileSync(out, buf); console.log('audio', out, 'peak norm', norm.toFixed(3)); }

const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
const [mode, a1, a2, a3] = process.argv.slice(2);
if (mode === 'info') { S.forEach(s => console.log(String(s.n).padStart(2), fmt(s.at), '-', fmt(s.at + s.d), s.ru, '|', s.en)); console.log('TOTAL', TOTAL.toFixed(2)); }
else if (mode === 'still') { fs.mkdirSync('out/st', {recursive: true}); for (const t of a1.split(',')) { frame(+t); fs.writeFileSync(`out/st/${t}.png`, cv.toBuffer('image/png')); } }
else if (mode === 'seg') { fs.mkdirSync('out/st', {recursive: true}); for (const n of a1.split(',')) { const s = S[+n - 1], us = (a2 || '0.5,1.5,2.8').split(',').map(Number); for (const u of us) { frame(s.at + Math.min(u, s.d - .01)); fs.writeFileSync(`out/st/s${n}_${u}.png`, cv.toBuffer('image/png')); } } }
else if (mode === 'sheet') { const k = +(a1 || .72), cols = 6, tw = 270, th = 480, rows = Math.ceil(S.length / cols), sh = createCanvas(cols * tw, rows * (th + 30)), sg = sh.getContext('2d'); sg.fillStyle = '#222'; sg.fillRect(0, 0, sh.width, sh.height);
  S.forEach((s, i) => { frame(s.at + s.d * k); sg.drawImage(cv, (i % cols) * tw, Math.floor(i / cols) * (th + 30), tw, th); sg.fillStyle = '#fff'; sg.font = `20px ${FONT}`; sg.textAlign = 'left'; sg.fillText(`${s.n} ${fmt(s.at)}`, (i % cols) * tw + 6, Math.floor(i / cols) * (th + 30) + th + 22); });
  fs.writeFileSync(a2 || 'out/sheet.png', sh.toBuffer('image/png')); console.log('sheet'); }
else if (mode === 'clip') { const a = +a1, b = Math.min(+a2, TOTAL), F0 = Math.round(a * FPS), F1 = Math.round(b * FPS);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-crf', '19', '-r', String(FPS), a3]);
  (async () => { for (let i = F0; i < F1; i++) { frame(i / FPS); if (!ff.stdin.write(Buffer.from(cv.data()))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); ff.on('close', c => console.log('done', a3, c)); })(); }
else if (mode === 'audio') audio(a1 || 'out/sfx.wav');
else if (mode === 'list') { let o = '# FX showcase — список приёмов\n\nФайл: `final/fx_showcase.mp4` (1080×1920, 30 fps, лёгкие SFX, без музыки). Одна и та же нейтральная сцена: Макс (каштановые волосы, зелёный свитер), кружка, телефон.\n\n| № | Время | Название | Что это | Источник |\n|---|---|---|---|---|\n';
  for (const s of S) o += `| ${s.n} | ${fmt(s.at)} | ${s.ru} (${s.en}) | ${s.desc} | ${s.src} |\n`; fs.writeFileSync('final/fx_list.md', o); console.log('list written'); }
module.exports = {S, TOTAL};
