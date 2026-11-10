// Editing-style test B "investigator" (techniques of online scam-investigation videos; no branding copied):
// dark void + spotlight, documents as fake-3D perspective cards (strip-rendered trapezoids + shadows), camera dolly between cards,
// "screen-capture" zoom with dimmed surround + yellow highlight box, EXHIBIT A/B/C tags, red-string connection board, timeline bar,
// RGB-split glitch transitions, zoom punches on numbers, final verdict card. Story: Poyais (facts from poyais_ep29/facts.md).
// 1920x1080, 30 fps. Voice: vo.wav (Kokoro), timings lines.json + words.json.
// node render.js cues | still t1,t2,... out.png | video out.mp4
const { createCanvas, loadImage } = require('@napi-rs/canvas'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const D = __dirname, W = 1920, H = 1080, FPS = 30, A = path.join(D, '../../../poyais_ep29/archive');
const F = '"Inter Display", Inter, sans-serif', MONO = '"DejaVu Sans Mono", monospace', SERIF = '"DejaVu Serif", serif';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const eo = u => 1 - Math.pow(1 - clamp(u), 3), eio = u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const back = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// ---------- timings ----------
const LN = JSON.parse(fs.readFileSync(path.join(D, 'lines.json'))), WORDS = JSON.parse(fs.readFileSync(path.join(D, 'words.json')));
const T = +(LN[LN.length - 1].b + 1.3).toFixed(2);
const nrm = s => s.toLowerCase().replace(/[^a-z0-9£]/g, '');
function wt(w, after = 0) { const x = WORDS.find(o => o.a >= after - 0.05 && nrm(o.w).startsWith(nrm(w))); if (!x) throw new Error('word ' + w); return x.a; }
const S = LN.map(l => l.a); S[0] = 0; // scene starts
const K = {
  bonds: wt('bonds'), exist: wt('exist'), evidence: wt('evidence'), a200: wt('200', S[2]), london2: wt('london', S[2]), b100: wt('100', S[3]), b11: wt('11', S[3]),
  scot: wt('scotland', S[4]), backed: wt('backed', S[4]), s250: wt('250', S[5]), jungle: wt('jungle'), fifty: wt('50', S[6]),
  gregor: wt('gregor', S[7]), acq: wt('acquitted', S[7]), venez: wt('venezuela'), pension: wt('pension'), funeral: wt('funeral'), fake: wt('fake', S[9]), real: wt('real', S[9]) };
const GLITCH = [0, S[2], S[4], S[6], S[7], S[9]];
// ---------- assets ----------
const mk = (w, h) => { const c = createCanvas(w, h); return [c, c.getContext('2d')]; };
function paper(w, h, tint = '#ece3cf', seed = 1) { const [c, x] = mk(w, h); x.fillStyle = tint; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const r = hash(i * 3.1 + seed); x.fillStyle = `rgba(90,70,40,${0.03 + 0.05 * hash(i + seed * 9)})`; x.fillRect(hash(i * 1.7 + seed) * w, r * h, 2, 2); }
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(80,55,25,0.35)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(60,40,20,0.5)'; x.lineWidth = 3; x.strokeRect(24, 24, w - 48, h - 48); return [c, x]; }
const ctext = (x, s, X, Y, font, col = '#2a2016', al = 'center') => { x.font = font; x.fillStyle = col; x.textAlign = al; x.textBaseline = 'alphabetic'; x.fillText(s, X, Y); };
function lines(x, X, Y, n, w, step = 30) { for (let i = 0; i < n; i++) { x.fillStyle = 'rgba(42,32,22,0.45)'; x.fillRect(X, Y + i * step, w - (i % 3) * w * 0.12, 7); } }
let IMG = {}, CARD = {};
async function load() {
  for (const k of ['poyais_dollar', 'black_river_1822', 'macgregor']) IMG[k] = await loadImage(path.join(A, k + '.jpg'));
  // Exhibit A — bond (re-created)
  { const [c, x] = paper(900, 620, '#efe6d2', 3); ctext(x, 'GOVERNMENT OF POYAIS', 450, 110, `700 40px ${SERIF}`); ctext(x, 'LOAN OF', 450, 190, `italic 34px ${SERIF}`);
    ctext(x, '£200,000', 450, 290, `700 104px ${SERIF}`, '#3a2414'); ctext(x, 'Bond of One Hundred Pounds Sterling', 450, 350, `italic 30px ${SERIF}`); lines(x, 150, 400, 4, 600);
    ctext(x, 'LONDON · 23 OCTOBER 1822', 450, 560, `600 24px ${MONO}`, '#5a4a36'); x.strokeStyle = '#8a2a1a'; x.lineWidth = 5; x.beginPath(); x.arc(770, 520, 50, 0, 7); x.stroke();
    ctext(x, 'RE-CREATED', 110, 585, `600 16px ${MONO}`, '#7a6a56', 'left'); CARD.A = { c, hl: [[0.2, 0.33, 0.8, 0.5]] }; }
  // Exhibit B — land certificate (re-created)
  { const [c, x] = paper(900, 620, '#f1e9d6', 7); ctext(x, 'TERRITORY OF POYAIS', 450, 110, `700 38px ${SERIF}`); ctext(x, 'Certificate of Land', 450, 160, `italic 30px ${SERIF}`);
    ctext(x, '100 ACRES', 450, 280, `700 96px ${SERIF}`, '#3a2414'); ctext(x, 'price paid:  £11 5s.', 450, 370, `700 50px ${SERIF}`, '#3a2414'); lines(x, 150, 420, 3, 600);
    ctext(x, 'at 2s. 3d. per acre', 450, 545, `italic 26px ${SERIF}`, '#5a4a36'); ctext(x, 'RE-CREATED', 110, 585, `600 16px ${MONO}`, '#7a6a56', 'left');
    CARD.B = { c, hl: [[0.13, 0.3, 0.87, 0.48], [0.15, 0.52, 0.85, 0.64]] }; }
  // Exhibit C — the real note
  { const im = IMG.poyais_dollar, [c, x] = mk(1280, 645); x.filter = 'contrast(1.1) brightness(0.95) sepia(0.15)'; x.drawImage(im, 0, 0); x.filter = 'none';
    CARD.C = { c, hl: [[0.79, 0.06, 0.99, 0.36], [0.27, 0.75, 0.47, 0.93]] }; }
  { const im = IMG.black_river_1822, [c, x] = mk(1280, 829); x.drawImage(im, 0, 0); CARD.R = { c }; }
  { const [c, x] = mk(1280, 829); x.filter = 'grayscale(1) brightness(0.45) contrast(1.3)'; x.drawImage(IMG.black_river_1822, 0, 0); x.filter = 'none'; CARD.Rd = { c }; }
  { const im = IMG.macgregor, [c, x] = mk(960, 1191); x.filter = 'grayscale(1) contrast(1.15)'; x.drawImage(im, 0, 0); x.filter = 'none'; CARD.M = { c }; }
  // verdict card
  { const [c, x] = paper(1000, 640, '#ece4d4', 11); ctext(x, 'CASE: POYAIS', 500, 90, `700 30px ${MONO}`, '#5a4a36'); ctext(x, 'VERDICT', 500, 190, `900 96px ${F}`, '#1a1410'); x.fillStyle = '#1a1410'; x.fillRect(150, 220, 700, 6); CARD.V = { c }; }
  // grain + vignette + bg
  CARD.grain = []; for (let k = 0; k < 4; k++) { const [c, x] = mk(480, 270), d = x.createImageData(480, 270); for (let i = 0; i < d.data.length; i += 4) { const v = hash(i * 0.37 + k * 999) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); CARD.grain.push(c); }
  { const [c, x] = mk(W, H), g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)'); x.fillStyle = g; x.fillRect(0, 0, W, H); CARD.vig = c; }
}
// ---------- drawing primitives ----------
const FOC = 1700;
// project a card-local point (u,v in 0..1) for a card centred at (cx,cy) world, size w×h, yaw ry, pitch rx, roll rz
function proj(p, u, v) { const x0 = (u - 0.5) * p.w, y0 = (v - 0.5) * p.h; const cy_ = Math.cos(p.ry || 0), sy = Math.sin(p.ry || 0), cx_ = Math.cos(p.rx || 0), sx = Math.sin(p.rx || 0);
  let x1 = x0 * cy_, z1 = x0 * sy; let y1 = y0 * cx_ - z1 * sx * 0, z2 = z1 + y0 * sx; const k = FOC / (FOC + z2 + (p.z || 0));
  let X = x1 * k, Y = y1 * k; const cr = Math.cos(p.rz || 0), sr = Math.sin(p.rz || 0); return [p.x + X * cr - Y * sr, p.y + X * sr + Y * cr]; }
function card(ctx, img, p, opt = {}) { const N = 40; ctx.save();
  // shadow
  const q = [proj(p, 0, 0), proj(p, 1, 0), proj(p, 1, 1), proj(p, 0, 1)]; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 50 * (p.sc || 1); ctx.shadowOffsetY = 30; ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); q.forEach((a, i) => i ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1])); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
  for (let i = 0; i < N; i++) { const u0 = i / N, u1 = (i + 1) / N; const a = proj(p, u0, 0), b = proj(p, u0, 1), c = proj(p, u1, 0);
    // affine map strip: source rect → parallelogram (a, c, b)
    ctx.save(); ctx.setTransform(...curM(ctx, (c[0] - a[0]) / (img.width / N), (c[1] - a[1]) / (img.width / N), (b[0] - a[0]) / img.height, (b[1] - a[1]) / img.height, a[0], a[1]));
    ctx.drawImage(img, u0 * img.width, 0, img.width / N + 1, img.height, 0, 0, img.width / N + 1.2, img.height); ctx.restore(); }
  // spotlight sheen
  if (opt.sheen !== false) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,240,210,0.25)'; ctx.beginPath(); q.forEach((a, i) => i ? ctx.lineTo(a[0], a[1]) : ctx.moveTo(a[0], a[1])); ctx.closePath(); ctx.fill(); }
  ctx.restore(); return q; }
let CAM = [1, 0, 0, 1, 0, 0];
function curM(ctx, a, b, c, d, e, f) { const [A_, B_, C_, D_, E_, F_] = CAM; return [A_ * a + C_ * b, B_ * a + D_ * b, A_ * c + C_ * d, B_ * c + D_ * d, A_ * e + C_ * f + E_, B_ * e + D_ * f + F_]; }
function setCam(ctx, cx, cy, z, rot = 0) { const c = Math.cos(rot) * z, s = Math.sin(rot) * z; CAM = [c, s, -s, c, W / 2 - (c * cx - s * cy), H / 2 - (s * cx + c * cy)]; ctx.setTransform(...CAM); }
function resetCam(ctx) { CAM = [1, 0, 0, 1, 0, 0]; ctx.setTransform(1, 0, 0, 1, 0, 0); }
function bg(ctx, t, sx = W / 2, sy = H * 0.45) { ctx.fillStyle = '#07080a'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(sx, sy, 20, sx, sy, H * 0.95); g.addColorStop(0, 'rgba(120,110,95,0.42)'); g.addColorStop(0.45, 'rgba(45,42,38,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // desk plane hint
  const d = ctx.createLinearGradient(0, H * 0.72, 0, H); d.addColorStop(0, 'rgba(30,26,22,0)'); d.addColorStop(1, 'rgba(40,33,26,0.6)'); ctx.fillStyle = d; ctx.fillRect(0, H * 0.7, W, H * 0.3);
  // dust in the beam
  for (let i = 0; i < 60; i++) { const x = (hash(i) * W + t * (8 + 14 * hash(i + 4))) % W, y = (hash(i + 9) * H - t * (5 + 6 * hash(i + 2)) + H * 10) % H; const r = Math.hypot(x - sx, y - sy) / (H * 0.7);
    ctx.fillStyle = `rgba(230,220,200,${0.25 * clamp(1 - r)})`; ctx.fillRect(x, y, 2, 2); } }
function tag(ctx, s, x, y, o = {}) { ctx.save(); ctx.font = `700 ${o.size || 26}px ${MONO}`; const w = ctx.measureText(s).width; ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
  ctx.fillStyle = o.bg || '#f2d33b'; ctx.fillRect(x, y - (o.size || 26) - 8, w + 28, (o.size || 26) + 22); ctx.fillStyle = o.col || '#111'; ctx.textAlign = 'left'; ctx.fillText(s, x + 14, y + 3); ctx.restore(); return w + 28; }
function typed(ctx, s, x, y, t0, t, size = 30, col = '#d8d2c4') { const n = Math.floor(clamp((t - t0) * 28, 0, s.length)); ctx.save(); ctx.font = `600 ${size}px ${MONO}`; ctx.fillStyle = col; ctx.textAlign = 'left';
  ctx.fillText(s.slice(0, n) + ((n < s.length || Math.floor(t * 2) % 2) ? '▌' : ''), x, y); ctx.restore(); }
function punch(ctx, s, x, y, t0, t, size, col = '#f2d33b', o = {}) { if (t < t0) return; const u = clamp((t - t0) / 0.22), sc = lerp(1.6, 1, eo(u)), sh = (1 - u) * 14;
  ctx.save(); ctx.translate(x + (hash(Math.floor(t * 60)) - 0.5) * sh, y + (hash(Math.floor(t * 60) + 3) - 0.5) * sh); ctx.scale(sc, sc); ctx.globalAlpha = clamp(u * 3);
  ctx.font = `900 ${size}px ${F}`; ctx.textAlign = o.al || 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = size * 0.12; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }
// screen-capture highlight: dim everything except the box, yellow box wipes in
function highlight(ctx, q, t0, t, dim = 0.62) { if (t < t0) return; const u = eo((t - t0) / 0.35); const [x0, y0, x1, y1] = q; const pad = 10;
  ctx.save(); ctx.fillStyle = `rgba(0,0,0,${dim * clamp((t - t0) / 0.25)})`; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad); ctx.fill('evenodd');
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(255,225,60,0.55)'; ctx.fillRect(x0 - pad, y0 - pad, (x1 - x0 + 2 * pad) * u, y1 - y0 + 2 * pad);
  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#f2d33b'; ctx.lineWidth = 5; ctx.strokeRect(x0 - pad, y0 - pad, (x1 - x0 + 2 * pad) * u, y1 - y0 + 2 * pad); ctx.restore(); }
const boxOf = (p, r) => { const a = proj(p, r[0], r[1]), b = proj(p, r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
function stampTxt(ctx, s, x, y, t0, t, size = 70, col = '#d0281c', rot = -0.08) { if (t < t0) return; const u = clamp((t - t0) / 0.16); ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lerp(2, 1, eo(u)), lerp(2, 1, eo(u))); ctx.globalAlpha = 0.92 * u;
  ctx.font = `900 ${size}px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width + size * 0.6; ctx.strokeStyle = col; ctx.lineWidth = size * 0.09; ctx.strokeRect(-w / 2, -size * 0.7, w, size * 1.4); ctx.fillStyle = col; ctx.fillText(s, 0, size * 0.04); ctx.restore(); }
// pose helpers
const P = (x, y, w, h, o = {}) => ({ x, y, w, h, ...o });
const mixP = (a, b, u) => { const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = lerp(a[k] || 0, b[k] || 0, u); return o; };
// ---------- scenes ----------
function frame(ctx, t) { resetCam(ctx); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const sc = S.findIndex((s, i) => t >= s && (i === S.length - 1 || t < S[i + 1])), t0 = S[sc], tn = sc < S.length - 1 ? S[sc + 1] : T, lt = t - t0, U = clamp(lt / (tn - t0));
  bg(ctx, t);
  if (sc === 0) { // hook: the note floating in the beam, camera pushes in, "DID NOT EXIST"
    const pz = t > K.bonds - 0.1 ? 0.22 * eo((t - K.bonds + 0.1) / 0.18) * (1 - ss((t - K.exist + 0.6) / 0.5)) : 0;
    setCam(ctx, W / 2 + pz * 900, H / 2 - pz * 500, lerp(1.0, 1.18, ss(t / 5.9)) + pz * 2.2, lerp(-0.02, 0.01, U));
    const p = P(W / 2, H * 0.47 + Math.sin(t * 1.3) * 8, 1150, 580, { ry: lerp(-0.55, -0.22, eo(t / 2.2)), rz: -0.04, z: lerp(500, 0, eo(t / 1.2)) }); card(ctx, CARD.C.c, p);
    resetCam(ctx); typed(ctx, 'CASE FILE  //  POYAIS  //  LONDON, 1822', 80, 92, 0.15, t, 30);
    if (pz > 0.18) { highlight(ctx, [690, 470, 1010, 572], K.bonds + 0.1, t, 0.4); tag(ctx, "ST JOSEPH: A CAPITAL THAT WASN'T THERE", 80, H - 150, { size: 30 }); }
    if (t > K.exist - 0.15) stampTxt(ctx, 'DID NOT EXIST', W / 2, H * 0.47, K.exist - 0.15, t, 110);
  } else if (sc === 1) { // pull back: three exhibits slide onto the desk
    setCam(ctx, W / 2, H / 2, lerp(1.08, 1.0, eo(U))); const ks = ['A', 'B', 'C'];
    ks.forEach((k, i) => { const u = eo((lt - i * 0.1) / 0.35); const p = P(W / 2 + (i - 1) * 560, lerp(H * 1.4, H * 0.5, u), 500, k === 'C' ? 252 : 344, { rx: 0.5, ry: (i - 1) * -0.25, rz: (i - 1) * 0.04 }); card(ctx, CARD[k].c, p);
      resetCam(ctx); if (u > 0.9) tag(ctx, 'EXHIBIT ' + k, W / 2 + (i - 1) * 560 - 110, H * 0.5 + 250); setCam(ctx, W / 2, H / 2, lerp(1.08, 1.0, eo(U))); });
    resetCam(ctx); typed(ctx, 'THE EVIDENCE', 80, 92, S[1], t, 34, '#f2d33b');
  } else if (sc === 2 || sc === 3) { // exhibit A / B: dolly in, highlight, punch
    const k = sc === 2 ? 'A' : 'B', C = CARD[k]; const zIn = eio(lt / 0.9);
    const p0 = P(W / 2 + (sc === 2 ? 420 : -420), H / 2, 1000, 690, { ry: sc === 2 ? 0.5 : -0.5, rz: 0.03, z: 300 }), p1 = P(W * 0.47, H * 0.49, 1060, 730, { ry: sc === 2 ? 0.12 : -0.1, rz: sc === 2 ? -0.015 : 0.02 });
    const p = mixP(p0, p1, zIn); const hl1 = sc === 2 ? K.a200 - 0.1 : K.b100 - 0.1, hl2 = sc === 3 ? K.b11 - 0.1 : 1e9;
    const zc = t > hl1 ? lerp(1, 1.25, eio((t - hl1) / 0.6)) : 1; const r = C.hl[t > hl2 ? 1 : 0]; const bx = boxOf(p, r);
    setCam(ctx, lerp(W / 2, (bx[0] + bx[2]) / 2, t > hl1 ? eio((t - hl1) / 0.6) * 0.8 : 0), lerp(H / 2, (bx[1] + bx[3]) / 2, t > hl1 ? eio((t - hl1) / 0.6) * 0.6 : 0), zc);
    card(ctx, C.c, p); const M = CAM.slice(); resetCam(ctx);
    const sb = b => [M[0] * b[0] + M[4], M[3] * b[1] + M[5], M[0] * b[2] + M[4], M[3] * b[3] + M[5]];
    highlight(ctx, sb(boxOf(p, C.hl[0])), hl1, t > hl2 ? -1 : t); if (t > hl2) highlight(ctx, sb(boxOf(p, C.hl[1])), hl2, t);
    tag(ctx, 'EXHIBIT ' + k, 80, 110, { size: 34 });
    if (sc === 2) { if (t > K.london2 - 0.1) tag(ctx, 'OFFERED: 23 OCT 1822', 80, 180, { bg: '#e9e4d8', size: 26 }); }
    else { tag(ctx, '2s. 3d. PER ACRE', 80, 180, { bg: '#e9e4d8', size: 26, alpha: clamp((t - K.b100) * 3) }); }
  } else if (sc === 4) { // exhibit C: the real note, screen-capture zooms
    const p = P(W / 2, H * 0.5, 1500, 756, { ry: lerp(-0.25, 0, eo(lt / 0.7)), z: lerp(200, 0, eo(lt / 0.7)) });
    const r1 = boxOf(p, CARD.C.hl[0]), r2 = boxOf(p, CARD.C.hl[1]); const u1 = eio((lt - 0.5) / 0.7), u2 = eio((t - K.backed + 0.1) / 0.6);
    const fx = lerp(lerp(W / 2, (r1[0] + r1[2]) / 2, u1), (r2[0] + r2[2]) / 2, u2), fy = lerp(lerp(H / 2, (r1[1] + r1[3]) / 2, u1), (r2[1] + r2[3]) / 2, u2), z = lerp(lerp(1, 1.7, u1), 1.45, u2);
    setCam(ctx, lerp(W / 2, fx, Math.max(u1 * 0.85, u2)), lerp(H / 2, fy, Math.max(u1 * 0.85, u2 * 0.92)), z); card(ctx, CARD.C.c, p, { sheen: false }); const M = CAM.slice(); resetCam(ctx);
    const sb = b => [M[0] * b[0] + M[4], M[3] * b[1] + M[5], M[0] * b[2] + M[4], M[3] * b[3] + M[5]];
    if (t < K.backed - 0.1) highlight(ctx, sb(r1), S[4] + 1.0, t); else highlight(ctx, sb(r2), K.backed - 0.1, t);
    tag(ctx, 'EXHIBIT C', 80, 110, { size: 34 }); tag(ctx, 'REAL NOTE · 1820s (ARCHIVE)', 80, 180, { bg: '#e9e4d8', size: 24 });
    if (t > K.scot - 0.1) tag(ctx, 'PRINTED IN SCOTLAND', 80, H - 200, { bg: '#e9e4d8', size: 30 });
    if (t > K.backed) punch(ctx, 'BACKED BY: NOTHING', W - 470, H - 210, K.backed, t, 64, '#ff4a3a');
  } else if (sc === 5) { // the promise: guidebook engraving, ~250 sailed
    setCam(ctx, W / 2 + lerp(-60, 60, U), H / 2, lerp(1.0, 1.12, U)); const p = P(W / 2, H * 0.48, 1240, 803, { ry: lerp(0.2, 0.05, eo(lt / 0.8)), rz: -0.02 }); card(ctx, CARD.R.c, p); resetCam(ctx);
    tag(ctx, 'THE PROMISE  ·  1822 GUIDEBOOK ENGRAVING', 80, 110, { bg: '#e9e4d8', size: 26 }); tag(ctx, 'GOLD → POYAIS DOLLARS', 80, 180, { size: 30, alpha: clamp((lt - 0.4) * 3) });
    punch(ctx, '~250 SAILED', W - 420, H - 220, K.s250, t, 96);
  } else if (sc === 6) { // reality: same engraving goes dark, red
    setCam(ctx, W / 2, H / 2, lerp(1.12, 1.3, U)); const p = P(W / 2, H * 0.48, 1240, 803, { ry: 0.05, rz: -0.02 }); card(ctx, CARD.Rd.c, p, { sheen: false }); resetCam(ctx);
    ctx.fillStyle = `rgba(120,10,10,${0.25 * eo(lt / 0.5)})`; ctx.fillRect(0, 0, W, H);
    stampTxt(ctx, 'JUNGLE', W / 2, H * 0.36, K.jungle, t, 120, '#e8e2d6', -0.05); punch(ctx, 'FEWER THAN 50 CAME HOME', W / 2, H * 0.66, K.fifty - 0.15, t, 92, '#ff4a3a');
  } else if (sc === 7) { // connection board: exhibits → MacGregor, red string
    setCam(ctx, W / 2, H / 2, lerp(1.1, 1.0, eo(U)), lerp(0.015, 0, U));
    const pos = { M: [W / 2, H * 0.47], A: [W * 0.17, H * 0.27], B: [W * 0.17, H * 0.73], C: [W * 0.83, H * 0.5] };
    const cards = { A: P(...pos.A, 440, 303, { rz: -0.06 }), B: P(...pos.B, 440, 303, { rz: 0.05 }), C: P(...pos.C, 520, 262, { rz: 0.04 }), M: P(...pos.M, 430, 534, { rz: -0.02 }) };
    for (const k of ['A', 'B', 'C']) card(ctx, CARD[k].c, cards[k]);
    // strings
    ['A', 'B', 'C'].forEach((k, i) => { const u = eo((lt - 0.3 - i * 0.25) / 0.45); if (u <= 0) return; const [x0, y0] = pos[k], [x1, y1] = pos.M; ctx.save(); ctx.strokeStyle = '#c4161c'; ctx.lineWidth = 5; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(x0, y0 - 120); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 90 + 60, lerp(x0, x1, u), lerp(y0 - 120, y1 - 220, u)); ctx.stroke(); ctx.restore(); });
    card(ctx, CARD.M.c, cards.M);
    for (const k of ['A', 'B', 'C', 'M']) { const [x, y] = pos[k]; ctx.fillStyle = '#d42a20'; ctx.beginPath(); ctx.arc(x, y - (k === 'M' ? 220 : 120), 13, 0, 7); ctx.fill(); }
    resetCam(ctx); if (t > K.gregor - 0.1) tag(ctx, 'GREGOR MACGREGOR  ·  "CAZIQUE OF POYAIS"', W / 2 - 400, H - 90, { size: 30 });
    if (t > K.acq - 0.1) stampTxt(ctx, 'ACQUITTED', W / 2, H * 0.5, K.acq - 0.1, t, 96, '#d0281c', -0.1);
  } else if (sc === 8) { // timeline bar
    setCam(ctx, W / 2, H / 2, lerp(1.0, 1.05, U)); resetCam(ctx);
    const ev = [[1822, 'BONDS SOLD'], [1823, 'SETTLERS FIND JUNGLE'], [1826, 'PARIS: ACQUITTED'], [1845, 'DIES IN VENEZUELA']], x0 = 260, x1 = W - 260, xi = i => lerp(x0, x1, i / 3);
    const pi = 3 * eio((t - S[8]) / (K.funeral - S[8] + 0.3)), k0 = Math.min(2, Math.floor(pi)), yrNow = Math.floor(lerp(ev[k0][0], ev[k0 + 1][0], pi - k0));
    ctx.save(); ctx.font = `900 300px ${F}`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(242,211,59,0.09)'; ctx.fillText(String(yrNow), W / 2, H * 0.36); ctx.restore();
    ctx.strokeStyle = '#4a4740'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, H * 0.5); ctx.lineTo(x1, H * 0.5); ctx.stroke();
    ctx.strokeStyle = '#f2d33b'; ctx.beginPath(); ctx.moveTo(x0, H * 0.5); ctx.lineTo(lerp(x0, x1, pi / 3), H * 0.5); ctx.stroke();
    ev.forEach(([y, s], i) => { const x = xi(i), on = pi >= i - 0.02; ctx.fillStyle = on ? '#f2d33b' : '#4a4740'; ctx.beginPath(); ctx.arc(x, H * 0.5, on ? 20 : 14, 0, 7); ctx.fill();
      ctx.font = `900 ${on ? 72 : 60}px ${F}`; ctx.textAlign = 'center'; ctx.fillStyle = on ? '#f4efe4' : '#6a675f'; ctx.fillText(String(y), x, H * 0.5 - (i % 2 ? -120 : 60));
      ctx.font = `700 32px ${MONO}`; ctx.fillStyle = on ? '#f2d33b' : '#5a574f'; ctx.fillText(s, x, H * 0.5 - (i % 2 ? -175 : 140)); });
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lerp(x0, x1, pi / 3), H * 0.5, 9, 0, 7); ctx.fill();
    if (t > K.pension - 0.1) tag(ctx, 'MILITARY PENSION', W - 640, H * 0.82, { size: 34, alpha: clamp((t - K.pension + 0.1) * 4) });
    if (t > K.funeral - 0.1) tag(ctx, "HERO'S FUNERAL", W - 640, H * 0.82 + 80, { size: 34, bg: '#e9e4d8', alpha: clamp((t - K.funeral + 0.1) * 4) });
    typed(ctx, 'TIMELINE  //  GREGOR MACGREGOR', 80, 92, S[8], t, 30);
  } else { // verdict card + final line
    setCam(ctx, W / 2, H / 2, lerp(1.06, 1.0, eo(U))); const p = P(W / 2, H * 0.4, 1000, 640, { ry: lerp(0.35, 0, eo(lt / 0.6)), rz: -0.015, z: lerp(400, 0, eo(lt / 0.6)) }); card(ctx, CARD.V.c, p); resetCam(ctx);
    const items = [['ACQUITTED', S[9] + 0.5], ['MILITARY PENSION', S[9] + 0.9], ["HERO'S FUNERAL", S[9] + 1.3]];
    items.forEach(([s, a], i) => { if (t < a) return; const u = eo((t - a) / 0.2); ctx.save(); ctx.globalAlpha = u; ctx.font = `800 48px ${F}`; ctx.textAlign = 'center'; ctx.fillStyle = '#1a1410'; ctx.fillText('✓  ' + s, W / 2, H * 0.4 - 20 + i * 70); ctx.restore(); });
    if (t > K.fake - 0.1) punch(ctx, 'THE COUNTRY: FAKE.', W / 2, H * 0.74, K.fake - 0.1, t, 64, '#f4efe4');
    if (t > K.real - 0.1) punch(ctx, 'THE MONEY: REAL.', W / 2, H * 0.83, K.real - 0.1, t, 64, '#f2d33b');
  }
  resetCam(ctx);
  // grain + vignette
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09; ctx.drawImage(CARD.grain[Math.floor(t * FPS) % 4], 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(CARD.vig, 0, 0);
  subs(ctx, t);
  glitch(ctx, t); }
// ---------- subtitles ----------
const DISP = ["In 1822, a man sold bonds in London... for a country that did not exist.", "Let's look at the evidence.", "Exhibit A: a £200,000 loan, offered to London investors.",
  "Exhibit B: land. 100 acres, for just over £11.", "Exhibit C: the Bank of Poyais note. Printed in Scotland. Backed by nothing.", "Settlers traded their gold for these. About 250 sailed.",
  "They found jungle. Fewer than 50 came home.", "The man behind it? Gregor MacGregor. A French court acquitted him.", "He died in Venezuela, with a military pension and a hero's funeral.", "The country was fake. The money was very real."];
// subtitle groups: script words spread over each line's real audio span by character length, cut at punctuation / max 4 words
const GROUPS = (() => { const g = []; DISP.forEach((l, i) => { const ws = l.split(' '), tot = ws.reduce((a, w) => a + w.length + 1, 0), { a, b } = LN[i]; let acc = 0, cur = [];
  ws.forEach((w, k) => { const w0 = a + (b - a) * acc / tot; acc += w.length + 1; cur.push({ w, a: w0, b: a + (b - a) * acc / tot }); if (cur.length >= 4 || /[.,?!:]$/.test(w) || k === ws.length - 1) { g.push(cur); cur = []; } }); }); return g; })();
function subs(ctx, t) { const g = GROUPS.find(x => t >= x[0].a - 0.05 && t < x[x.length - 1].b + 0.12); if (!g) return; const s = g.map(w => w.w).join(' '); ctx.save(); ctx.font = `800 46px ${F}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(W / 2 - w / 2 - 22, H - 92, w + 44, 64); ctx.fillStyle = '#f4efe4'; ctx.fillText(s, W / 2, H - 60); ctx.restore(); }
// ---------- glitch (RGB split + slice offsets) ----------
let GB, GR, GC;
function glitch(ctx, t) { const g = GLITCH.find(x => t >= x && t < x + 0.2); if (g == null) return; const u = (t - g) / 0.2, amt = (1 - u) * 26, fr = Math.floor(t * FPS);
  if (!GB) { GB = mk(W, H); GR = mk(W, H); GC = mk(W, H); }
  GB[1].clearRect(0, 0, W, H); GB[1].drawImage(ctx.canvas, 0, 0);
  for (const [cv, col] of [[GR, '#ff0000'], [GC, '#00ffff']]) { const x = cv[1]; x.globalCompositeOperation = 'source-over'; x.drawImage(GB[0], 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.drawImage(GR[0], amt, 0); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(GC[0], -amt, 0); ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) { const y = hash(fr * 7 + i) * H, h = 10 + hash(fr + i * 3) * 60, dx = (hash(fr * 3 + i) - 0.5) * amt * 6; ctx.drawImage(GB[0], 0, y, W, h, dx, y, W, h); }
  ctx.fillStyle = `rgba(255,255,255,${0.12 * (1 - u)})`; ctx.fillRect(0, 0, W, H); }
// ---------- main ----------
(async () => { await load(); const [mode, a1, a2] = process.argv.slice(2); const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  if (mode === 'cues') { const whoosh = [K.bonds - 0.1, S[1], S[2], S[3], S[4], S[5], S[7], S[9]], hits = [0, K.exist - 0.15, K.a200 - 0.1, K.b100 - 0.1, K.b11 - 0.1, K.backed, K.s250, K.jungle, K.fifty - 0.15, K.acq - 0.1, K.fake - 0.1, K.real - 0.1];
    const ticks = [S[8] + 0.2, S[8] + 1.2, S[8] + 2.0, S[8] + 3.0];
    fs.writeFileSync(path.join(D, 'cues.json'), JSON.stringify({ T, scenes: S, glitch: GLITCH, whoosh, hits, type: [[0.15, 1.6], [S[1], S[1] + 0.5], [S[8], S[8] + 1.1]], strings: [0, 1, 2].map(i => S[7] + 0.3 + i * 0.25), ticks }, null, 1)); console.log('T', T); return; }
  if (mode === 'still') { const ts = a1.split(',').map(Number), cols = Math.min(4, ts.length), rows = Math.ceil(ts.length / cols), sw = 480, sh = 270; const sheet = createCanvas(cols * sw, rows * sh), sx = sheet.getContext('2d');
    ts.forEach((tt, i) => { frame(ctx, tt); sx.drawImage(cv, (i % cols) * sw, Math.floor(i / cols) * sh, sw, sh); sx.fillStyle = '#f00'; sx.font = '20px sans-serif'; sx.fillText(tt.toFixed(2), (i % cols) * sw + 6, Math.floor(i / cols) * sh + 22); });
    fs.writeFileSync(a2, sheet.toBuffer('image/png')); return; }
  if (mode === 'video') { const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < Math.round(T * FPS); f++) { frame(ctx, f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise(r => ff.stdin.once('drain', r)); } ff.stdin.end(); await new Promise(r => ff.on('close', r)); } })();
