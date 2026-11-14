// "Коллега свистит в офисе, а «денег не будет»" — rubric «Наше за границей» (scene + 4 answers, worst -> best), hard_cut camera: node whistle.js start end out.mp4 | --png=f1,f2
// Open-plan London office. Graham (British colleague, tweed blazer) sits at his desk and whistles (drawn music notes); his monitor: BONUS MEETING, TOMORROW 3 PM.
// The heroine stands by her desk. Absurd detail: her piggy bank wears a yellow hard hat and is locked with a padlock; it trembles whenever he whistles.
// Hook insert: his monitor close-up (BONUS MEETING · TOMORROW · 3 PM).
// o1 «В ЛОБ»: "Stop! No money!" (both palms out, then slaps them on the piggy bank) — "Want a fiver?" he holds out a £5 note, whistles on — the note slips away and flutters out of the open window.
// o2 «ВЕЖЛИВО»: "Bad luck for whom? The pigeons?" — insert: two pigeons on the window sill turn to each other, outraged; one turns its back.
// o3 «КАК НОСИТЕЛЬ»: "Fair enough." — he starts whistling again and stops mid-note: the note pops; he presses his lips together; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the sweet line — he sweats, then slowly seals his own mouth with a sticky note; muffled answer.
// Twist (music silent): «НА СЛЕДУЮЩИЙ ДЕНЬ» — the intern in headphones whistles; Graham leaps up: "Oi! Not indoors!"; the intern slides his headphones off; she pats her piggy bank.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/whistle/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const COL = { ...BASE.mark, hair: { style: 'quiff', col: '#B8642E' }, brow: '#8A4A22', mustache: '#B8642E',
  top: { type: 'blazer', col: '#7A6A4A', shirt: '#F4EFE6', tie: '#2E5A8A' }, bottom: { type: 'trousers', col: '#4A4236' }, shoes: { col: '#3A2618', acc: null } };
const COLW = { ...COL, mouthW: 0.001 };                     // whistling: the mouth line hides under the drawn pucker
const INT = { ...BASE.jay, top: { type: 'hoodie', col: '#3FA796' } };
const INTW = { ...INT, mouthW: 0.001 };
const G = { her: geom(HER), sit: geom(COL, 360), stand: geom(COL), int: geom(INT, 330) };
const HX = -500, CX = 450, IX = 2250, DT = -720;            // her spot, his chair, the intern's chair, desk-top height
const PX = -870, PY = DT;                                  // piggy bank on her desk
const MX = 50, PADX = CX + 300, MUGX = CX + 480;           // his monitor (between them, screen to camera), sticky pad, mug
const WIN = { x0: -430, x1: 330, y0: -2650, y1: -1450 };     // window (sill = y1), the right pane is open
const PIG = [-170, 130];                                    // the two pigeons on the outside sill
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- whistling: pucker + drawn music notes (no font glyphs)
function noteGlyph(c, s, two) { c.save(); c.scale(s, s); c.fillStyle = '#2E3550'; c.strokeStyle = '#2E3550'; c.lineWidth = 9; c.lineCap = 'round';
  const head = x => { c.save(); c.translate(x, 0); c.rotate(-0.4); c.beginPath(); c.ellipse(0, 0, 24, 17, 0, 0, TAU); c.fill(); c.restore(); };
  head(0); c.beginPath(); c.moveTo(20, -6); c.lineTo(20, -100); c.stroke();
  if (two) { head(70); c.beginPath(); c.moveTo(90, -6); c.lineTo(90, -100); c.stroke(); c.lineWidth = 16; c.beginPath(); c.moveTo(20, -96); c.lineTo(90, -96); c.stroke(); }
  else { c.lineWidth = 9; c.beginPath(); c.moveTo(20, -100); c.quadraticCurveTo(60, -80, 52, -40); c.stroke(); }
  c.restore(); }
// notes rising from (x, y) for spawn times in [t0, t1]; dir = drift side; s = world scale
function notes(c, t, x, y, t0, t1, dir = -1, s = 1, step = 0.24) { const life = 1.7;
  for (let ts = Math.ceil(t0 / step) * step; ts <= Math.min(t, t1); ts += step) { const a = t - ts; if (a < 0 || a > life) continue; const k = Math.round(ts / step);
    c.save(); c.globalAlpha = clamp(a / 0.12) * (1 - P(a, life - 0.4, life)); c.translate(x + dir * (170 + a * 190) * s + Math.sin(a * 5 + k) * 26 * s, y - (20 + a * 230) * s); c.rotate(Math.sin(a * 4 + k) * 0.3);
    noteGlyph(c, s * (0.75 + a * 0.25), k % 3 === 1); c.restore(); } }
// the pucker, drawn over the head (front callback); g = geom
const pucker = (g, turn, k = 1) => (cc, gg) => { if (k <= 0) return; const mx = gg.head.x + turn * g.hw * 0.22, my = gg.head.y + g.hh * 0.56;
  cc.save(); cc.translate(mx, my); cc.scale(k, k); cc.fillStyle = '#C8706A'; cc.beginPath(); cc.ellipse(0, 0, g.hw * 0.13, g.hh * 0.11, 0, 0, TAU); cc.fill();
  cc.fillStyle = '#4A1A22'; cc.beginPath(); cc.ellipse(0, 0, g.hw * 0.055, g.hh * 0.05, 0, 0, TAU); cc.fill(); cc.restore(); };
const mouthAt = (hd, g, turn) => ({ x: hd.x + turn * g.hw * 0.22, y: hd.y + g.hh * 0.56 });

// ---------------- props
function piggy(c, x, y, t, shake = 0, s = 1) { const j = Math.sin(t * 55) * 5 * shake; c.save(); c.translate(x + j, y); c.rotate(Math.sin(t * 47) * 0.03 * shake); c.scale(s, s);
  const O = { sd: 6, hd: 3, lw: 5 };
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, -4, 150, 20, 0, 0, TAU); c.fill();
  for (const lx of [-85, -35, 40, 90]) paint(c, q => { q.m(lx - 20, -60); q.l(lx + 20, -60); q.l(lx + 18, 0); q.l(lx - 18, 0); q.z(); }, '#E88AA8', O);
  paint(c, q => q.e(0, -130, 160, 110), '#F4A7C0', O);                                      // body
  c.strokeStyle = '#C8608A'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.arc(-170, -140, 22, 0.2, 4.2); c.stroke();   // tail curl
  paint(c, q => q.e(160, -120, 42, 46), '#F08AB0', O); c.fillStyle = '#B8507A'; for (const dy of [-14, 14]) { c.beginPath(); c.ellipse(164, -120 + dy, 7, 10, 0, 0, TAU); c.fill(); }   // snout
  for (const ex of [40, 100]) paint(c, q => { q.m(ex - 30, -215); q.l(ex + 6, -270); q.l(ex + 30, -205); q.z(); }, '#E88AA8', O);   // ears
  c.fillStyle = '#2B1A1A'; c.beginPath(); c.arc(110, -160, 11, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(114, -164, 4, 0, TAU); c.fill();
  // the coin slot with a hasp + padlock
  c.fillStyle = '#7A3050'; rr(c, -40, -238, 80, 14, 7); c.fill();
  c.strokeStyle = '#8A8F98'; c.lineWidth = 10; c.beginPath(); c.moveTo(-60, -232); c.lineTo(-60, -205); c.lineTo(60, -205); c.lineTo(60, -232); c.stroke();
  c.save(); c.translate(0, -175 + Math.sin(t * 40) * 4 * shake); c.strokeStyle = '#B8BCC4'; c.lineWidth = 11; c.beginPath(); c.arc(0, -16, 26, Math.PI, 0); c.stroke();
  paint(c, q => { q.m(-38, -16); q.l(38, -16); q.l(38, 40); q.l(-38, 40); q.z(); }, '#F2C14E', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#5A4020'; c.beginPath(); c.arc(0, 8, 8, 0, TAU); c.fill(); c.fillRect(-3, 8, 6, 18); c.restore();
  // yellow hard hat
  c.save(); c.translate(-10, -232); c.rotate(-0.12);
  paint(c, q => { q.m(-120, 0); q.q(-115, -120, 0, -125); q.q(115, -120, 120, 0); q.z(); }, '#F6C81E', { sd: 6, hd: 3, lw: 5 });
  paint(c, q => { q.m(-160, 0); q.l(160, 0); q.l(150, 20); q.l(-150, 20); q.z(); }, '#E8B010', { sd: 3, hd: 2, lw: 4 });
  c.fillStyle = '#E8B010'; rr(c, -18, -122, 36, 110, 12); c.fill(); c.restore();
  c.restore(); K.mark(c, 'piggy', x, y - 200, 200); }
function fiver(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -82 + 6, -46 + 8, 164, 92, 8); c.fill();
  c.fillStyle = '#5FB8A6'; c.strokeStyle = '#2E7A6A'; c.lineWidth = 5; rr(c, -82, -46, 164, 92, 8); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; rr(c, -70, -36, 140, 72, 6); c.stroke(); c.fillStyle = '#E8F4EE'; c.beginPath(); c.arc(38, 0, 24, 0, TAU); c.fill();
  UI.font(c, 'Unb9', 44); c.fillStyle = '#1E4A40'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£5', -24, 4); c.restore(); }
const fiverItem = ctx => { ctx.save(); ctx.translate(-10, -40); ctx.rotate(-0.25); fiver(ctx, 0.9); ctx.restore(); };
function sticky(c, s = 1, rot = 0) { c.save(); c.rotate(rot); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-58 + 5, -50 + 7, 116, 100); c.fillStyle = '#F7E36A'; c.fillRect(-58, -50, 116, 100); c.fillStyle = '#E8CF4A'; c.fillRect(-58, -50, 116, 16); c.restore(); }
const stickyItem = ctx => { ctx.save(); ctx.translate(0, -40); sticky(ctx, 0.95, 0.1); ctx.restore(); };
function mug(c, x, y, t) { c.save(); c.translate(x, y); paint(c, q => { q.m(-48, -120); q.l(48, -120); q.l(44, 0); q.l(-44, 0); q.z(); }, '#F7F2E8', { sd: 4, hd: 2, lw: 4 });
  c.strokeStyle = '#F7F2E8'; c.lineWidth = 14; c.beginPath(); c.arc(54, -62, 24, -1.3, 1.3); c.stroke(); c.fillStyle = '#C2504A'; c.fillRect(-46, -84, 92, 22);
  c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 8; c.lineCap = 'round'; for (let i = 0; i < 2; i++) { const u = (t * 0.6 + i * 0.5) % 1; c.globalAlpha = Math.sin(u * Math.PI) * 0.8; c.beginPath(); c.moveTo(-10 + i * 22, -130 - u * 120); c.quadraticCurveTo(10 + i * 22, -160 - u * 120, -6 + i * 22, -190 - u * 120); c.stroke(); } c.restore(); }
function monitorScreen(c, w, h, t, L, big = false) {   // display content, origin = top-left
  const nextDay = L === 'end';
  c.fillStyle = '#EAF2F8'; c.fillRect(0, 0, w, h); c.fillStyle = '#3E73B8'; c.fillRect(0, 0, w, h * 0.16);
  c.fillStyle = '#FFFFFF'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(w - 30 - i * 30, h * 0.08, h * 0.025, 0, TAU); c.fill(); }
  fitTxt(c, 'CALENDAR', w * 0.06, h * 0.08, h * 0.08, '#FFFFFF', w * 0.5, 'Unb9', 'left');
  // calendar icon (drawn): two rings + grid
  const ix = w * 0.08, iy = h * 0.27, is = h * 0.22; c.fillStyle = '#FFFFFF'; c.strokeStyle = '#C2504A'; c.lineWidth = h * 0.012; rr(c, ix, iy, is, is, is * 0.12); c.fill(); c.stroke(); c.fillStyle = '#C2504A'; c.fillRect(ix, iy, is, is * 0.28);
  c.fillStyle = '#2E3550'; for (const k of [0.3, 0.7]) c.fillRect(ix + is * k - 3, iy - is * 0.1, 6, is * 0.2); c.fillStyle = '#9AA3B2'; for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) c.fillRect(ix + is * (0.15 + q * 0.27), iy + is * (0.42 + r * 0.25), is * 0.16, is * 0.13);
  const pulse = 1 + 0.03 * Math.sin(t * 6);
  c.save(); c.translate(w * 0.62, h * 0.47); c.scale(pulse, pulse); c.fillStyle = '#FFE15A'; c.strokeStyle = '#C9902E'; c.lineWidth = h * 0.012; rr(c, -w * 0.31, -h * 0.17, w * 0.62, h * 0.34, h * 0.04); c.fill(); c.stroke();
  fitTxt(c, 'BONUS', 0, -h * 0.07, h * 0.12, '#2E3550', w * 0.56); fitTxt(c, 'MEETING', 0, h * 0.07, h * 0.12, '#2E3550', w * 0.56); c.restore();
  fitTxt(c, nextDay ? 'TODAY · 3 PM' : 'TOMORROW · 3 PM', w * 0.5, h * 0.8, h * 0.11, '#C2504A', w * 0.88);
  // pound coin
  c.fillStyle = '#E8B04A'; c.beginPath(); c.arc(w * 0.17, h * 0.62, h * 0.07, 0, TAU); c.fill(); fitTxt(c, '£', w * 0.17, h * 0.625, h * 0.09, '#7A5A20', h * 0.12); }
function monitor(c, x, t, L) { const y = DT, sw_ = 500, sh_ = 340;
  c.fillStyle = '#5A606E'; c.fillRect(x - 22, y - 120, 44, 120); rr(c, x - 120, y - 24, 240, 24, 8); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, x - sw_ / 2 - 24, y - 120 - sh_ - 48, sw_ + 48, sh_ + 48, 22); c.fill();
  c.save(); c.translate(x - sw_ / 2, y - 120 - sh_ - 24); c.beginPath(); c.rect(0, 0, sw_, sh_); c.clip(); monitorScreen(c, sw_, sh_, t, L); c.restore(); K.mark(c, 'monitor', x, y - 300, 260); }
function chair(c, x, y, spin = 0) { c.save(); c.translate(x, y); c.rotate(spin);
  paint(c, q => { q.m(-190, -1120); q.q(0, -1190, 190, -1120); q.l(175, -620); q.l(-175, -620); q.z(); }, '#3A4150', { sd: 6, hd: 3, lw: 5 }); c.restore(); }
function deskFront(c, x0, x1) { paint(c, q => { q.m(x0 - 30, DT - 30); q.l(x1 + 30, DT - 30); q.l(x1 + 30, DT); q.l(x0 - 30, DT); q.z(); }, '#D9B98A', { sd: 3, hd: 2, lw: 4 });
  paint(c, q => { q.m(x0, DT); q.l(x1, DT); q.l(x1, 0); q.l(x0, 0); q.z(); }, '#EDE6DA', { sd: 8, hd: 4, lw: 4, inner: k => { k.fillStyle = 'rgba(0,0,0,.06)'; k.fillRect(x0, DT + 40, x1 - x0, 12); } });
  c.fillStyle = '#9AA3B2'; for (const xx of [x0 + 60, x1 - 60]) c.fillRect(xx - 6, DT + 200, 12, 80); }
function pad(c, x, n = 4) { for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#F7E36A' : '#EED556'; c.fillRect(x - 60, DT - 32 - i * 8, 120, 10); } c.fillStyle = '#F7E36A'; c.fillRect(x - 60, DT - 40 - n * 8, 120, 14); }
function headphones(c, hd, g, on) { const r = g.hw * 1.12; c.save(); c.strokeStyle = '#1E2128'; c.lineWidth = 18; c.lineCap = 'round';
  if (on > 0.5) { c.beginPath(); c.arc(hd.x, hd.y - 6, r, Math.PI * 1.06, Math.PI * 1.94); c.stroke(); for (const s of [-1, 1]) { c.fillStyle = '#E0474C'; rr(c, hd.x + s * r - 30, hd.y - 40, 60, 100, 26); c.fill(); c.stroke(); } }
  else { const y = lerp(hd.y + g.hh * 1.55, hd.y, on); c.beginPath(); c.arc(hd.x, y - 40, r * 0.95, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); for (const s of [-1, 1]) { c.fillStyle = '#E0474C'; rr(c, hd.x + s * r * 0.95 - 30, y - 30, 60, 90, 26); c.fill(); c.stroke(); } }
  c.restore(); }
function sweat(c, hd, k, t) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 2; i++) { const u = (t * 1.1 + i * 0.5) % 1, x = hd.x + (i ? -1 : 1) * hd.hh * 0.85, y = hd.y - hd.hh * 0.6 + u * hd.hh * 0.8;
  c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 30); c.quadraticCurveTo(x + 18, y, x, y + 12); c.quadraticCurveTo(x - 18, y, x, y - 30); c.fill(); c.stroke(); } c.restore(); }

// ---------------- pigeons (sill outside the window); st = { face, angry, puff, back, t }
function pigeon(c, x, y, s, st) { const f = st.face || 1, t = st.t || 0, bob = Math.max(0, Math.sin(t * 2.2 + x)) * 10, pf = 1 + 0.12 * (st.puff || 0);
  c.save(); c.translate(x, y); c.scale(s * f, s); const O = { sd: 6, hd: 3, lw: 4 };
  c.strokeStyle = '#E8788A'; c.lineWidth = 9; c.lineCap = 'round'; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 16, -70); c.lineTo(k * 16, -6); c.stroke(); c.beginPath(); c.moveTo(k * 16, -6); c.lineTo(k * 16 + 26, -4); c.stroke(); }
  c.save(); c.scale(pf, pf);
  paint(c, q => { q.m(-110, -150); q.l(-230, -120); q.l(-215, -165); q.l(-235, -205); q.l(-120, -190); q.z(); }, '#6E7885', O);
  paint(c, q => q.e(0, -150, 130, 88), '#9AA3AE', O); c.restore();
  if (st.back) { paint(c, q => q.e(-30, -215 - bob * 0.4, 62, 56), '#9AA3AE', O); c.save(); c.translate(-15, -160); paint(c, q => q.e(10, 0, 110, 64), '#7A8592', O); c.restore(); c.restore(); return; }
  paint(c, q => q.e(95, -212 - bob * 0.6, 62, 56), '#9AA3AE', O);
  paint(c, q => q.e(70, -180, 50, 36), '#4CAF9A', { sd: 4, hd: 2, lw: 3 }); paint(c, q => q.e(86, -188, 28, 18), '#8E5BD6', { sd: 2, hd: 1, lw: 0 });
  const by = -216 - bob * 0.6; paint(c, q => { q.m(150, by); q.l(206, by + 12 - (st.angry ? 6 : 0)); q.l(150, by + 22); q.z(); }, '#F2A03C', { sd: 3, hd: 2, lw: 3 });
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(118, by - 6, 14, 0, TAU); c.fill(); c.fillStyle = '#1E2128'; c.beginPath(); c.arc(122, by - 6, 7, 0, TAU); c.fill();
  if (st.angry) { c.strokeStyle = '#1E2128'; c.lineWidth = 9; c.beginPath(); c.moveTo(98, by - 34); c.lineTo(140, by - 20); c.stroke(); }
  c.save(); c.translate(-15, -160); c.rotate(-0.05 - (st.puff || 0) * 0.25); paint(c, q => q.e(-20, 0, 105, 62), '#7A8592', O); c.restore();
  c.restore(); }
function pigeonState(t, L, i) { const st = { t, face: i ? -1 : 1, angry: 0, puff: 0, back: false };
  if (L === 'o2') { const e = k => ev('o2', k); if (t > e('look')) st.angry = 1; if (t > e('huff')) st.puff = Math.abs(Math.sin((t - e('huff')) * 9)) * clamp(1 - (t - e('huff')) / 1.2) + 0.3;
    if (i === 0 && t > e('back')) { st.back = true; } }
  if (L === 'hook' || L === 'o1') st.face = -1;   // both watch the office
  return st; }

// ---------------- the office (prerendered, softly blurred)
const BX0 = -4400, BY0 = -5400, BW = 9600, BH = 8200, BS = 0.5;
function skyline(c, x0, x1, y0, y1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#8EC5E8'); g.addColorStop(1, '#D8ECF6'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = 'rgba(255,255,255,.8)'; for (const [cx, cy, r] of [[x0 + 160, y0 + 180, 60], [x0 + 230, y0 + 170, 80], [x0 + 320, y0 + 190, 55]]) { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); }
  const base = y1; c.fillStyle = '#A9B4C2';
  for (const [bx, bw, bh] of [[x0, 140, 360], [x0 + 130, 120, 520], [x0 + 420, 160, 300], [x0 + 560, 110, 620], [x0 + 650, 200, 420]]) c.fillRect(bx, base - bh, bw, bh);
  // a clock tower silhouette
  const tx = x0 + 330; c.fillStyle = '#8E98A8'; c.fillRect(tx - 40, base - 780, 80, 780); c.beginPath(); c.moveTo(tx - 50, base - 780); c.lineTo(tx, base - 900); c.lineTo(tx + 50, base - 780); c.fill();
  c.fillStyle = '#F4EFE6'; c.beginPath(); c.arc(tx, base - 700, 30, 0, TAU); c.fill(); c.strokeStyle = '#5A6070'; c.lineWidth = 5; c.beginPath(); c.moveTo(tx, base - 700); c.lineTo(tx, base - 722); c.moveTo(tx, base - 700); c.lineTo(tx + 15, base - 700); c.stroke();
  c.fillStyle = '#7E8A9A'; for (const [bx, bw, bh] of [[x0 + 40, 180, 200], [x0 + 260, 140, 150], [x0 + 500, 220, 240]]) c.fillRect(bx, base - bh, bw, bh);
  c.fillStyle = 'rgba(255,255,255,.5)'; for (let x = x0 + 20; x < x1; x += 46) for (let y = base - 180; y < base - 20; y += 50) if ((x + y) % 3 < 1.5) c.fillRect(x, y, 16, 22); }
function drawOffice(c) {
  c.fillStyle = '#DCE2E6'; c.fillRect(BX0, BY0, BW, -260 - BY0);
  c.fillStyle = '#F4F6F7'; c.fillRect(BX0, BY0, BW, 2300); c.fillStyle = '#C9D0D6'; c.fillRect(BX0, BY0 + 2300, BW, 30);
  for (let x = BX0 + 300; x < BX0 + BW; x += 1100) { c.fillStyle = '#FFFFFF'; rr(c, x, BY0 + 2060, 700, 60, 20); c.fill(); }
  // window with London view; the right pane is pushed open
  c.fillStyle = '#F4F6F7'; c.fillRect(WIN.x0 - 50, WIN.y0 - 50, WIN.x1 - WIN.x0 + 100, WIN.y1 - WIN.y0 + 80);
  skyline(c, WIN.x0, WIN.x1, WIN.y0, WIN.y1);
  c.fillStyle = '#B8B0A0'; c.fillRect(WIN.x0 - 20, WIN.y1 - 40, WIN.x1 - WIN.x0 + 40, 40);   // stone sill outside
  const mid = (WIN.x0 + WIN.x1) / 2; c.fillStyle = '#F4F6F7'; c.fillRect(mid - 14, WIN.y0, 28, WIN.y1 - WIN.y0); c.fillRect(WIN.x0, WIN.y0 + 520, mid - WIN.x0, 22);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(WIN.x0 + 30, WIN.y0); c.lineTo(WIN.x0 + 190, WIN.y0); c.lineTo(WIN.x0 + 30, WIN.y0 + 360); c.fill();
  c.strokeStyle = '#F4F6F7'; c.lineWidth = 22; c.beginPath(); c.moveTo(mid + 14, WIN.y0 + 10); c.lineTo(WIN.x1 - 120, WIN.y0 + 120); c.lineTo(WIN.x1 - 120, WIN.y1 - 120); c.lineTo(mid + 14, WIN.y1 - 30); c.stroke();   // the open pane (edge-on)
  c.fillStyle = '#E9ECEF'; c.fillRect(WIN.x0 - 70, WIN.y1 + 30, WIN.x1 - WIN.x0 + 140, 40);   // inner sill
  // wall clock, framed print, shelf with binders (left); whiteboard, plant (right)
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1350, -2350, 130, 0, TAU); c.fill(); c.strokeStyle = '#2E3550'; c.lineWidth = 16; c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(-1350, -2350); c.lineTo(-1350, -2440); c.moveTo(-1350, -2350); c.lineTo(-1290, -2330); c.stroke();
  c.fillStyle = '#8A6A44'; c.fillRect(-2350, -2000, 700, 30); for (let k = 0; k < 6; k++) { c.fillStyle = ['#3E73B8', '#C2504A', '#4CAF6A', '#F2B33D', '#8E5BD0', '#3E73B8'][k]; c.fillRect(-2320 + k * 110, -2320, 80, 320); }
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#9AA3B2'; c.lineWidth = 14; c.fillRect(1500, -2500, 900, 600); c.strokeRect(1500, -2500, 900, 600);
  c.strokeStyle = '#3E73B8'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(1580, -2050); c.lineTo(1760, -2200); c.lineTo(1940, -2120); c.lineTo(2200, -2380); c.stroke();
  c.strokeStyle = '#C2504A'; c.beginPath(); c.arc(2250, -2100, 70, 0, TAU); c.stroke();
  c.fillStyle = '#C9955A'; c.fillRect(1180, -540, 200, 280); c.fillStyle = '#4CAF6A'; for (const [dx, dy, r] of [[0, -620, 120], [-90, -720, 90], [90, -740, 100], [0, -860, 90]]) { c.beginPath(); c.arc(1280 + dx, dy, r, 0, TAU); c.fill(); }
  c.fillStyle = '#C9955A'; c.fillRect(-2100, -540, 200, 280); c.fillStyle = '#3E8F5A'; for (const [dx, dy, r] of [[0, -620, 110], [-80, -700, 80], [80, -720, 90]]) { c.beginPath(); c.arc(-2000 + dx, dy, r, 0, TAU); c.fill(); }
  // skirting + carpet-tile floor
  c.fillStyle = '#9AA3B2'; c.fillRect(BX0, -260, BW, 70);
  c.fillStyle = '#7E8C9E'; c.fillRect(BX0, -190, BW, BY0 + BH + 190); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 6; for (let x = BX0; x < BX0 + BW; x += 300) { c.beginPath(); c.moveTo(x, -190); c.lineTo(x * 1.3, 2800); c.stroke(); } for (let y = -100; y < 2800; y += 220) c.fillRect(BX0, y, BW, 6);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGO = mkBG(drawOffice);

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const chest = (g, s) => reach(g, s, s * g.sw * 0.1, g.ySh + 170, { planar: true });
const hips = (g, s) => reach(g, s, s * g.sw * 1.15, g.ySh + 420, { planar: true });
const onDesk = (g, s, k = 0.7) => reach(g, s, s * g.sw * k, DT - 20, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gestR = (st, g, id, t, k = 1.6, dy = 120) => { const u = (t - SP[id].t) * 4.5; st.armR = reach(g, 1, g.sw * (k + 0.15 * Math.sin(u)), g.ySh + dy + Math.cos(u) * 22, { planar: true }); };
const toPiggy = (g, dy = 0, dx = 0) => reach(g, -1, PX - HX + dx, PY - 250 + dy, { planar: true });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'annoyed', turn: 0.3, look: 0.75 };
  if (L === 'hook') { st.armL = toPiggy(g, 30, 60); st.armR = hips(g, 1);
    if (t > hev('her') - 0.1) { st.mood = 'worried'; st.look = 0.9; st.armL = toPiggy(g, 10, 40); st.armR = hips(g, 1); }
    if (t > hev('wide')) { st.mood = 'skeptical'; st.armR = hips(g, 1); } }
  if (L === 'o1') { st.mood = 'annoyed'; st.armL = toPiggy(g, 30, 60); st.armR = hips(g, 1);
    if (speaking('o1_h', t, 0.05, 0.05)) { st.mood = 'shock'; st.blink = 0; const sh = Math.sin((t - SP.o1_h.t) * 20) * 10; st.armL = open(g, -1, 1.4, 60 + sh); st.armR = open(g, 1, 1.9, -20 + sh); st.look = 1; }
    if (t > e('slap')) { const k = eOut(P(t, e('slap'), e('slap') + 0.12)); st.mood = 'annoyed'; st.turn = -0.1; st.look = -0.3; st.armL = toPiggy(g, lerp(-60, 40, k), -40); st.armR = toPiggy(g, lerp(-60, 40, k), 120); st.armR = reach(g, 1, PX - HX + 140, PY - 250 + lerp(-60, 40, k), { planar: true }); }
    if (t > SP.o1_c.t) { st.mood = 'skeptical'; st.turn = 0.3; st.look = 0.8; }
    if (t > e('fly')) { st.mood = 'shock'; st.blink = 0; st.turn = 0.1; st.look = 0.4; st.lookY = -0.6; st.armL = toPiggy(g, 20, 60); st.armR = open(g, 1, 1.5, 80); }
    if (t > e('gone') + 0.3) { st.mood = 'annoyed'; st.lookY = -0.2; st.look = 0.8; st.turn = 0.3; } }
  if (L === 'o2') { st.mood = 'happy'; st.armL = chest(g, -1); st.armR = chest(g, 1);
    if (speaking('o2_h', t, 0.05, 0.1)) { st.tilt = 0.06; gestR(st, g, 'o2_h', t, 1.4, 170); }
    if (t > SP.o2_c.t + 0.4) { st.mood = 'skeptical'; st.tilt = 0; } }
  if (L === 'o3') { st.mood = 'happy'; st.armL = toPiggy(g, 30, 60); st.armR = hips(g, 1);
    if (speaking('o3_h', t, 0.05, 0.15)) { gestR(st, g, 'o3_h', t, 1.9, 80); st.look = 0.8; st.tilt = 0.03 * Math.sin(t * 2); }
    if (t > SP.o3_c.t) { st.mood = 'happy'; st.armR = chest(g, 1); }
    if (t > ev('o3', 'stop')) { st.mood = 'smug'; st.blink = 1; }
    if (t > SP.o3_nar.t) { st.blink = 0; st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'happy'; st.armL = toPiggy(g, 30, 60); st.armR = chest(g, 1);
    if (speaking('o4_h', t, 0.05, 0.2)) { st.tilt = 0.05 * Math.sin(t * 1.6); st.look = 0.8; gestR(st, g, 'o4_h', t, 1.7, 110); if (t > e('two')) { st.mood = 'smug'; st.armR = chest(g, 1); } }
    if (t > endOf('o4_h') + 0.2) { st.mood = 'smug'; st.blink = 1; st.armR = hips(g, 1); }
    if (t > e('stick')) { st.blink = 0; st.mood = 'happy'; st.laugh = t < e('stick') + 0.8; } }
  if (L === 'end') { st.mood = 'smug'; st.armL = toPiggy(g, 30, 60); st.armR = hips(g, 1); st.look = 0.8;
    if (t > ev('end', 'pat')) { const u = (t - ev('end', 'pat')) * 9; st.armL = reach(g, -1, PX - HX - 20, PY - 430 + Math.max(0, Math.sin(u)) * -50, { planar: true }); st.mood = 'smug'; st.turn = -0.1; st.look = -0.6; st.lookY = 0.3; st.blink = Math.sin(u) > 0.9 ? 1 : 0; }
    if (t > ev('end', 'moral')) { st.turn = 0.2; st.look = 0.2; st.lookY = 0; st.blink = 0; } }
  return st; }
// Graham: seated (drop 360) behind his desk; stands up in the twist
function colState(t, L) { const e = k => ev(L, k);
  const up = L === 'end' ? eOut(P(t, ev('end', 'jump'), ev('end', 'jump') + 0.22)) : 0, g = up > 0.5 ? G.stand : G.sit;
  const st = { ...base(g, t, 'coll4'), mood: 'happy', turn: -0.3, look: -0.7, legPose: up > 0.5 ? undefined : 'sit', drop: lerp(360, 0, up), legs: false, armL: onDesk(g, -1), armR: onDesk(g, 1) };
  let wh = 0;   // whistling (pucker) 0..1
  if (L === 'hook') { st.mood = 'happy'; st.tilt = 0;
    if (t < SP.hook_c.t - 0.02 || (t > endOf('hook_c') && t < endOf('hook_c') + 0.4)) { wh = 1; st.blink = 1; st.headY = Math.sin(t * 9) * 6; }
    if (speaking('hook_c', t, 0, 0.05)) { st.armR = reach(g, 1, g.sw * (1.6 + 0.15 * Math.sin(t * 5)), g.ySh + 60, { planar: true }); st.look = -0.8; }
    if (t > hev('nar')) { st.look = -0.2; st.turn = -0.5; st.mood = 'happy'; st.blink = 0; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o1_c.t - 0.1) { st.mood = 'happy'; }
    if (t > e('offer')) { const k = eOut(P(t, e('offer'), e('offer') + 0.3)); st.armL = reach(g, -1, -g.sw * lerp(1.0, 2.2, k), g.ySh + lerp(400, -80, k), { planar: true }); if (t < e('fly')) st.items = { L: fiverItem }; }
    if (t > e('whistle')) { wh = 1; st.blink = 1; st.headY = Math.sin(t * 9) * 6; st.turn = -0.2; st.look = -0.3; }
    if (t > e('whistle') + 1.5) { wh = 0; st.blink = 0; st.mood = 'happy'; st.armL = onDesk(g, -1); } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'skeptical'; }
    if (speaking('o2_c', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = t > SP.o2_c.t + 1.0; const u = (t - SP.o2_c.t) * 4; st.armL = reach(g, -1, -g.sw * (1.9 + 0.1 * Math.sin(u)), g.ySh - 120, { planar: true }); st.lookY = -0.3; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.blink = 0; if (t > SP.o3_h.t + 2) st.mood = 'neutral'; }
    if (speaking('o3_c', t, 0.05, 0.1)) { st.mood = 'happy'; st.headY = Math.abs(Math.sin((t - SP.o3_c.t) * 6)) * 14; gestR(st, g, 'o3_c', t, 1.6, 160); }
    if (t > e('half') && t < e('stop')) { wh = 1; st.mood = 'happy'; st.blink = 1; }
    if (t > e('stop')) { st.mood = 'shock'; st.blink = 0; st.talk = 0; st.armR = onDesk(g, 1); }
    if (t > e('gulp')) { st.mood = 'worried'; st.look = -0.8; } }
  if (L === 'o4') { st.mood = 'neutral'; st.armL = onDesk(g, -1); st.armR = onDesk(g, 1);
    if (speaking('o4_h', t, 0.1, 0.1)) { st.mood = 'happy'; if (t > SP.o4_h.t + 1.6) st.mood = 'surprised'; if (t > e('sweat')) st.mood = 'worried'; }
    if (t > endOf('o4_h')) st.mood = 'worried';
    const mo = { x: g.hw * 0.22 * st.turn, y: g.headY + g.hh * 0.56 - 40 };
    if (t > e('pad') && t < e('stick') + 0.35) { const k = eIO(P(t, e('lift'), e('stick'))); st.armR = reach(g, 1, lerp(PADX - CX, mo.x + 60, k), lerp(DT - 60, mo.y + 40, k), { planar: true }); st.headFirst = true; st.items = { R: stickyItem }; st.look = lerp(0.3, -0.7, k); st.lookY = lerp(0.6, 0, k); }
    if (t > e('stick') + 0.35) { st.mood = 'neutral'; st.blink = t < e('thumbs') ? 0 : 1; st.armR = onDesk(g, 1); }
    if (speaking('o4_c', t, 0, 0)) { st.mood = 'sad'; } }
  if (L === 'end') { st.mood = 'neutral'; st.turn = 0.3; st.look = 0.6;
    if (up > 0) { st.mood = 'shock'; st.blink = 0; st.legs = false; st.armL = open(g, -1, 1.6, 80); st.armR = open(g, 1, 2.0, 60 + Math.sin(t * 14) * 18); st.turn = 0.45; st.look = 1; }
    if (speaking('end_c', t, 0, 0.1)) { st.mood = t < SP.end_c.t + 1.4 ? 'shock' : 'angry'; const u = (t - SP.end_c.t) * 5; st.armR = open(g, 1, 2.0 + 0.15 * Math.sin(u), 60 + Math.cos(u) * 30); }
    if (t > endOf('end_c') + 0.1) { st.mood = 'annoyed'; st.armR = hips(g, 1); st.armL = hips(g, -1); } }
  if (wh > 0) { st.talk = 0; st.front = pucker(g, st.turn, wh); }
  return { st, wh, g }; }
function intState(t) { const g = G.int, e = k => ev('end', k), st = { ...base(g, t, 'x'), mood: 'happy', blink: 1, turn: -0.3, look: -0.4, legPose: 'sit', drop: 330, legs: false, armL: onDesk(g, -1, 1.1), armR: onDesk(g, 1, 1.1) };
  let wh = 0, on = 1; st.headY = Math.sin(t * 8) * 8; st.tilt = Math.sin(t * 4) * 0.05;
  if (t > e('intern') + 0.4 && t < e('jump') + 0.05) wh = 1;
  if (t > e('jump') + 0.05) { st.mood = 'shock'; st.blink = 0; st.headY = 0; st.tilt = 0; st.turn = -0.45; st.look = -1; }
  if (t > e('phones')) { const k = eIO(P(t, e('phones'), e('phones') + 0.7)); on = 1 - k; st.mood = 'surprised'; st.armL = reach(g, -1, -g.hw * 1.1, lerp(g.headY, g.ySh + 60, k), { planar: true }); st.armR = reach(g, 1, g.hw * 1.1, lerp(g.headY, g.ySh + 60, k), { planar: true }); st.headFirst = false; }
  if (t > e('phones') + 0.8) { st.armL = onDesk(g, -1, 1.1); st.armR = onDesk(g, 1, 1.1); st.mood = 'worried'; }
  if (wh) st.front = pucker(g, st.turn, 1);
  const front = st.front; st.front = (cc, gg) => { if (front) front(cc, gg); headphones(cc, gg.head, g, on); };
  return { st, wh, g }; }

// ---------------- flying fiver (o1): from his hand to the open window and out
function flyingFiver(c, t, hand) { const t0 = ev('o1', 'fly'), t1 = ev('o1', 'gone'); if (t < t0 || t > t1 + 0.2) return; const u = P(t, t0, t1);
  const ax = hand.x, ay = hand.y, bx = WIN.x1 - 160, by = WIN.y0 + 420, x = lerp(ax, bx, eIO(u)) + Math.sin(u * 14) * 70, y = lerp(ay, by, u) - Math.sin(u * Math.PI) * 260;
  c.save(); c.translate(x, y); c.rotate(Math.sin(u * 11) * 0.9); c.scale(1 - 0.5 * P(u, 0.8, 1), Math.cos(u * 17) * (1 - 0.5 * P(u, 0.8, 1))); fiver(c, 1.0); c.restore(); }
// popping half note (o3)
function notePop(c, t, m) { const t0 = ev('o3', 'stop'), u = (t - t0) / 0.35; if (u < 0 || u > 1) return; c.save(); c.translate(m.x - 80, m.y - 140); c.globalAlpha = 1 - u; c.strokeStyle = '#2E3550'; c.lineWidth = 8; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r0 = 20 + u * 40, r1 = 40 + u * 90; c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); c.stroke(); } c.restore(); }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'coll4'], two: ['her', 'coll4'], her: ['her'], col: ['coll4'], intern: ['int'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const shakeK = (t, L) => { if (L === 'hook') return t < SP.hook_c.t || (t > endOf('hook_c') && t < endOf('hook_c') + 0.5) ? 1 : 0.25;
  if (L === 'o1') return t > ev('o1', 'whistle') && t < ev('o1', 'whistle') + 1.5 ? 1 : 0; if (L === 'o3') return t > ev('o3', 'half') && t < ev('o3', 'stop') ? 1 : 0;
  if (L === 'end') return t > ev('end', 'intern') + 0.4 && t < ev('end', 'jump') ? 0.6 : 0; return 0; };
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'coll4'], heads = {};
  c.drawImage(BGO, BX0, BY0, BW, BH);
  PIG.forEach((x, i) => pigeon(c, x, WIN.y1 - 30, 0.42, pigeonState(t, L, i)));
  // her desk + piggy bank
  deskFront(c, -1180, -680); piggy(c, PX, PY - 30, t, shakeK(t, L));
  c.fillStyle = '#FFFFFF'; c.save(); c.translate(-1080, DT - 30); c.rotate(-0.08); c.fillRect(-60, -10, 120, 10); c.restore();
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  // Graham's chair, Graham, his desk front, monitor, pad, mug
  const cs = colState(t, L), jump = L === 'end' ? P(t, ev('end', 'jump'), ev('end', 'jump') + 0.4) : 0;
  chair(c, CX + jump * 260, 0, jump * 0.15); monitor(c, MX, t, L);
  let colHand = null;
  if (who.includes('coll4')) { const hd = K.put(c, cs.wh ? COLW : COL, cs.st, CX, 0); heads.coll4 = hd; const m = mouthAt(hd, cs.g, cs.st.turn);
    if (L === 'hook') { notes(c, t, m.x, m.y, -1.6, SP.hook_c.t - 0.05, -1); notes(c, t, m.x, m.y, endOf('hook_c'), endOf('hook_c') + 0.4, -1); }
    if (L === 'o1') { notes(c, t, m.x, m.y, ev('o1', 'whistle'), ev('o1', 'whistle') + 1.45, -1); colHand = { x: CX - cs.g.sw * 2.2, y: cs.g.ySh - 120 }; }
    if (L === 'o3') { notes(c, t, m.x, m.y, ev('o3', 'half'), ev('o3', 'stop') - 0.1, -1, 1, 0.16); notePop(c, t, m); }
    if (L === 'o4' && t > ev('o4', 'stick') && t < SC.o4.e + 0.1) { const tk = talk('coll4', t); c.save(); c.translate(m.x, m.y + 10 + tk * 8); sticky(c, 0.95, 0.06 + Math.sin(t * 20) * 0.03 * tk); c.restore(); }
    if (L === 'o4') sweat(c, hd, clamp((t - ev('o4', 'sweat')) / 0.3) * (1 - P(t, ev('o4', 'stick') + 0.6, ev('o4', 'stick') + 0.9)), t); }
  if (L === 'o1' && !colHand) colHand = { x: CX - G.sit.sw * 2.2, y: G.sit.ySh - 120 };
  deskFront(c, -150, 1000); if (!(L === 'end')) pad(c, PADX, L === 'o4' && t > ev('o4', 'pad') ? 3 : 4); else pad(c, PADX, 3); mug(c, MUGX, DT - 30, t);
  // the intern's desk (far right)
  if (who.includes('int') || tag === 'wide') { const is = intState(t); chair(c, IX, 0); if (L === 'end') { const hd = K.put(c, is.wh ? INTW : INT, is.st, IX, 0); heads.int = hd; if (is.wh) { const m = mouthAt(hd, is.g, is.st.turn); notes(c, t, m.x, m.y, ev('end', 'intern') + 0.4, ev('end', 'jump') - 0.1, 1); } }
    deskFront(c, 1900, 2700); c.fillStyle = '#2B2F3A'; rr(c, 2380, DT - 440, 300, 230, 14); c.fill(); c.fillStyle = '#9CC8F0'; rr(c, 2400, DT - 420, 260, 190, 8); c.fill(); c.fillStyle = '#5A606E'; c.fillRect(2515, DT - 210, 30, 190); }
  if (L === 'o1') flyingFiver(c, t, colHand);
  if (!heads.her) heads.her = OFFL; if (!heads.coll4) heads.coll4 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { WIDE: S(-100, -1100, 0.55, 'wide'), COVER: S(-100, -1100, 0.55, 'wide'),
  TWO: S(-120, fy(G.her.headY, 0.62, 830), 0.62, 'two'),
  HER: S(HX - 140, fy(G.her.headY, 0.95, 700), 0.95, 'her'),
  COL: S(CX - 100, fy(G.sit.headY, 1.0, 880), 1.0, 'col'), COL_CU: S(CX - 30, fy(G.sit.headY, 1.3, 900), 1.3, 'col'),
  COL_UP: S(CX + 120, fy(G.stand.headY, 0.8, 900), 0.8, 'col'),
  INTERN: S(IX - 30, fy(G.int.headY, 0.95, 960), 0.95, 'intern'),
  MON: U('monitor', 1), PIGS: U('pigeons', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('mon')) return SH.COVER; if (t < hev('her')) return f(SH.MON); if (t < hev('wide')) return f(SH.HER); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_c.t - 0.1) return f(SH.HER); if (t < e('fly') - 0.05) return f(SH.COL); return f(SH.WIDE); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_c.t - 0.1) return f(SH.HER); if (t < e('pig')) return f(SH.COL); return f(SH.PIGS); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_c.t - 0.1) return f(SH.HER); if (t < SP.o3_nar.t - 0.05) return f(SH.COL); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('two')) return f(SH.HER); if (t < endOf('o4_h') + 0.3) return f(SH.TWO); return f(SH.COL_CU); }
  if (L === 'end') { if (t < e('jump') - 0.05) return f(SH.INTERN); if (t < endOf('end_c') + 0.3) return f(SH.COL_UP); if (t < e('pat') - 0.02) return f(SH.INTERN); if (t < e('moral') - 0.05) return f(SH.HER); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts
function backdrop(c, col) { c.fillStyle = col; c.fillRect(0, 0, W, HH); c.save(); c.globalAlpha = 0.08; c.fillStyle = '#FFFFFF'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(540, 900, 200 + i * 120, 0, TAU); c.lineWidth = 40; c.strokeStyle = '#FFFFFF'; c.stroke(); } c.restore(); }
function monitorView(c, t) { backdrop(c, '#3E5A7A'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'monitor' });
  const u = t - hev('mon'), z = 1 + u * 0.03; c.save(); c.translate(540, 980); c.scale(z, z); c.translate(-540, -980);
  const x0 = 60, y0 = 560, w = 960, h = 660; c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, x0 + 14, y0 + 20, w, h, 36); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, x0, y0, w, h, 36); c.fill();
  c.fillStyle = '#5A606E'; c.fillRect(500, y0 + h, 80, 110); rr(c, 340, y0 + h + 100, 400, 34, 12); c.fill();
  c.save(); c.translate(x0 + 34, y0 + 34); c.beginPath(); c.rect(0, 0, w - 68, h - 68); c.clip(); monitorScreen(c, w - 68, h - 68, t, 'hook', true); c.restore(); c.restore(); }
function pigeonView(c, t) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'pigeons' });
  skyline(c, 0, W, 0, 1290); c.fillStyle = '#B8B0A0'; c.fillRect(0, 1250, W, 120); c.fillStyle = '#9A9282'; c.fillRect(0, 1370, W, 30);
  c.fillStyle = '#D8DCE0'; c.fillRect(0, 1400, W, HH - 1400); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += 180) c.fillRect(x, 1400, 8, HH - 1400);
  const L = 'o2', p0 = pigeonState(t, L, 0), p1 = pigeonState(t, L, 1); p0.face = 1; p1.face = -1; if (t < ev('o2', 'look')) { p0.face = -1; p1.face = 1; }
  pigeon(c, 330, 1265, 1.25, p0); pigeon(c, 760, 1265, 1.25, p1);
  if (t > ev('o2', 'huff')) { const u = t - ev('o2', 'huff'); for (let i = 0; i < 5; i++) { const a = u * 1.2 + i; c.save(); c.globalAlpha = clamp(1 - u / 1.4); c.translate(540 + Math.sin(i * 2.1) * 260 + Math.sin(a * 3) * 30, 1000 - u * 120 * (1 + i * 0.2) - i * 40); c.rotate(a); c.fillStyle = '#C9D0D6'; c.beginPath(); c.ellipse(0, 0, 34, 12, 0, 0, TAU); c.fill(); c.restore(); } }
  // inner sill: a cactus in a pot
  paint(c, q => { q.m(140, 1640); q.l(300, 1640); q.l(280, 1800); q.l(160, 1800); q.z(); }, '#C9603A', { sd: 6, hd: 3, lw: 4 }); paint(c, q => q.e(220, 1540, 60, 110), '#4CAF6A', { sd: 6, hd: 3, lw: 4 });
  // window frame around the view (we look out from inside)
  c.fillStyle = '#F4F6F7'; c.fillRect(0, 0, W, 60); c.fillRect(0, 0, 50, 1400); c.fillRect(W - 50, 0, 50, 1400); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(80, 60); c.lineTo(360, 60); c.lineTo(80, 600); c.fill(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  UI.font(c, 'Unb9', 30); const rw = c.measureText('НАШЕ ЗА ГРАНИЦЕЙ').width + 56; c.fillStyle = C.olive; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -rw / 2, -165 - 30, rw, 52, 26); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillText('НАШЕ ЗА ГРАНИЦЕЙ', 0, -165 - 3);
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 105, w: 980, h: 360, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
function dayCard(c, t) { const s = ev('end', 'beat'), k = eBack(P(t, s, s + 0.25), 2.2) * (1 - P(t, s + 1.75, s + 1.95)); if (k <= 0) return;
  c.save(); c.translate(540, 250); c.rotate(-0.03); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -400 + 8, -64 + 10, 800, 128, 30); c.fill(); c.fillStyle = C.oliveD; rr(c, -400, -64, 800, 128, 30); c.fill();
  UI.textFit(c, 'Unb9', 62, 'НА СЛЕДУЮЩИЙ ДЕНЬ', 720); c.fillStyle = '#FFE15A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('НА СЛЕДУЮЩИЙ ДЕНЬ', 0, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 140, y: 186, w: 800, h: 128, k, id: 'day' }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, aT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Graham (sticky note on his mouth) — owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.stand; const hd = K.put(c, COL, { t, mood: 'happy', blink: 1, turn: -0.2, look: -0.4, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: down(gm, 1), items: {} }, 640, 0);
    c.save(); c.translate(hd.x + gm.hw * 0.22 * -0.2, hd.y + gm.hh * 0.56 + 10); sticky(c, 0.95, 0.08); c.restore();
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, items: {}, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.9, g.ySh + 60 + Math.sin(t * 8 + 1) * 20, { planar: true }) }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const swap = P(t, aT - 0.12, aT + 0.05), q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - swap);
  if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = eBack(P(t, aT - 0.05, aT + 0.3), 2.2);
  if (qa > 0) { c.save(); c.translate(540, 300); c.rotate(-0.02); c.scale(qa, qa); textFit(c, 'Unb9', 76, 'А У ВАС В ОФИСЕ', 860); strokeText(c, 'А У ВАС В ОФИСЕ', 0, -62, C.oliveD, C.white, 16); textFit(c, 'Unb9', 96, 'СВИСТЯТ?', 900); strokeText(c, 'СВИСТЯТ?', 0, 48, C.pink, C.white, 16); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.5, sp.t + sp.d - 0.9), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < aT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); } Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:monitor') monitorView(c, t); else pigeonView(c, t); heads = { her: OFFL, coll4: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { coll4: ['GRAHAM', '#2E5A8A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4 && k !== 'int') onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_c: 0.05, o1_h: -0.12, o1_c: 0.05, o2_h: -0.12, o2_c: -0.12, o3_h: -0.12, o3_c: 0.05, o4_h: 0.05, o4_c: 0.05, end_c: 0.05 } });
  if (L === 'hook') title(c, t);
  if (L === 'end') dayCard(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('whistle', NF, renderFrame);
