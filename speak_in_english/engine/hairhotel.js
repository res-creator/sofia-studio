// "Отель за £200, а в номере волос" — rubric «Полезное» (useful4: service situation + 4 answers, worst -> best), hard_cut camera: node hairhotel.js start end out.mp4 | --png=f1,f2
// A posh London hotel room (room 214): a white pillow with ONE long ginger hair; the heroine (pink jumper) recoils beside the bed; Daniel, the beaming
// receptionist (burgundy uniform, gold badge), stands in the doorway. Rain on the sash window, a red double-decker passes in the street.
// Absurd detail: above the bed hangs the portrait of the hotel's founder with huge ginger curls — exactly the colour of the hair.
// o1 «В ЛОБ»: "Hair! Disgusting! Money back!" — "Ah… it's complimentary?" — insert: the hair gets wrapped like a pillow sweet + a COMPLIMENTARY tent card.
// o2 «ВЕЖЛИВО»: "I'm sorry to bother you, there's a tiny hair…" — "Tiny? Then it's practically invisible, madam." (holds the pillow at arm's length,
//   squinting) — gag: he flips the pillow over and pats it.
// o3 «КАК НОСИТЕЛЬ»: "I'm afraid the room hasn't been made up properly…" — "I do apologise. Housekeeping's on the way." — he claps: three housekeepers
//   rush in with linen, a whirlwind over the bed, a fresh bed with a towel swan; tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand line (rainy window on «sea view», she holds the hair up on «souvenir», he sweats on «split the bill») —
//   "…Presidential suite, madam. Hair-free, I promise." (gold key card).
// Twist (music silent): the Presidential suite; she opens the wardrobe — a fluffy ginger cat in a bow tie (OWNER badge): "Ah. That's Biscuit.
//   He actually owns the place." — the cat shakes: ginger hair everywhere. Moral, end screen.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/hairhotel/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const HER = { ...BASE.her_lift };
const DAN = { ...BASE.oliver, hair: { style: 'quiff', col: '#3A2820' }, brow: '#2A1A10', top: { type: 'blazer', col: '#7A1E3A', shirt: '#F7F9FC', tie: '#C9A85A' }, bottom: { type: 'trousers', col: '#22252E' }, shoes: { col: '#1E1612', acc: null } };
const MAIDS = [{ ...BASE.priya }, { ...BASE.chloe }, { ...BASE.linda }].map(m => ({ ...m, top: { type: 'longsleeve', col: '#2B3550' }, bottom: { type: 'skirt', col: '#2B3550' }, shoes: { col: '#1E1612', acc: null } }));
const G = { her: geom(HER), dan: geom(DAN), maid: MAIDS.map(m => geom(m)) };
const X = { her: -720, dan: 870 };
const XS = { her: -420, dan: 1080, cat: -950 };                  // the suite
const HAIR = '#E0782E', HAIRD = '#8A3E12';                       // the hair = the founder's curls = Biscuit's fur
const PIL = { x: -225, y: -665, w: 400, h: 190 }, PIL2 = { x: 225, y: -665 };
const PORT = { x: 0, y: -1800, w: 560, h: 700 };
const WIN = { x0: -1560, x1: -1060, y0: -2450, y1: -1050 };
const DOOR = { x0: 650, x1: 1080, y0: -2150 };
const WARD = { x0: -1260, x1: -640, y0: -2250 };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function sparkle(c, x, y, r, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.fillStyle = '#FFF3A0'; c.strokeStyle = '#D9A520'; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr_ = i % 2 ? r * 0.38 : r; c.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } c.closePath(); c.fill(); c.stroke(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }

// ---------------- props
// the hair: one long curly ginger strand; (0,0) = its middle; k = 1 full length, < 1 coils up (wrapping)
function hairStrand(c, s = 1, k = 1, lw = 14) { c.save(); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  const path = () => { c.beginPath(); const n = 40; for (let i = 0; i <= n; i++) { const u = i / n, a = u * 4.2 * Math.PI, r = lerp(70, 14, 1 - k) * (0.6 + 0.4 * Math.sin(u * 9));
      const x = lerp(-170, 170, u) * k + Math.cos(a) * r * (1 - k * 0.62), y = Math.sin(u * 7) * 18 * k + Math.sin(a) * r * (1 - k * 0.62) * 0.7; i ? c.lineTo(x, y) : c.moveTo(x, y); } };
  path(); c.strokeStyle = HAIRD; c.lineWidth = lw + 8; c.stroke(); path(); c.strokeStyle = HAIR; c.lineWidth = lw; c.stroke();
  path(); c.strokeStyle = 'rgba(255,220,170,.55)'; c.lineWidth = lw * 0.3; c.stroke(); c.restore(); }
// a pillow; mode: 'hair' | 'wrap' (k) | 'clean'; flip in [-1, 1] (scaleY for the flip gag; < 0 = the back side)
function pillow(c, x, y, mode = 'clean', k = 0, flip = 1, s = 1) { c.save(); c.translate(x, y); c.scale(s, s * Math.max(0.06, Math.abs(flip)));
  const w = PIL.w, h = PIL.h, back = flip < 0;
  c.fillStyle = 'rgba(40,30,40,.16)'; c.beginPath(); c.ellipse(0, h * 0.42, w * 0.5, 26, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-w / 2, -h / 2 + 30); q.q(-w / 2 - 10, -h / 2 - 4, -w / 2 + 34, -h / 2); q.q(0, -h / 2 + 18, w / 2 - 34, -h / 2); q.q(w / 2 + 10, -h / 2 - 4, w / 2, -h / 2 + 30);
    q.q(w / 2 - 14, 0, w / 2, h / 2 - 30); q.q(w / 2 + 10, h / 2 + 4, w / 2 - 34, h / 2); q.q(0, h / 2 - 18, -w / 2 + 34, h / 2); q.q(-w / 2 - 10, h / 2 + 4, -w / 2, h / 2 - 30); q.q(-w / 2 + 14, 0, -w / 2, -h / 2 + 30); q.z(); },
    back ? '#F1EEE8' : '#FFFFFF', { sd: 14, hd: 6, lw: 5, line: '#B8B0A8' });
  c.strokeStyle = 'rgba(160,150,140,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-w / 2 + 40, -h / 2 + 30); c.quadraticCurveTo(0, -h / 2 + 50, w / 2 - 40, -h / 2 + 30); c.stroke();
  if (!back && mode === 'hair') { c.save(); c.rotate(-0.06); hairStrand(c, 1.0, 1, 17); c.restore(); }
  if (!back && mode === 'wrap') { const kc = eIO(clamp(k / 0.4)), kw = eBack(clamp((k - 0.35) / 0.3), 2), kt = eBack(clamp((k - 0.6) / 0.3), 2);
    c.save(); c.translate(-40 * kc, -6); if (kw < 1) hairStrand(c, 0.95, 1 - kc * 0.85, 14);
    if (kw > 0) { c.scale(kw, kw); // the hair coiled inside a sweet wrapper with twisted ends (gold foil, clear middle)
      for (const sd of [-1, 1]) paint(c, q => { q.m(sd * 52, 0); q.l(sd * 104, -38); q.q(sd * 96, 0, sd * 104, 38); q.z(); }, '#F2C14E', { sd: 4, hd: 3, lw: 4, line: '#9A7420' });
      paint(c, q => q.e(0, 0, 62, 42), '#F7D46A', { sd: 6, hd: 6, lw: 4, line: '#9A7420' });
      c.save(); c.beginPath(); c.ellipse(0, 0, 50, 32, 0, 0, TAU); c.clip(); c.fillStyle = '#FFF4D8'; c.fillRect(-60, -40, 120, 80); hairStrand(c, 0.3, 0.15, 14); c.restore();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-22, -18, 18, 6, -0.3, 0, TAU); c.fill(); }
    c.restore();
    if (kt > 0) { c.save(); c.translate(105, -48); c.scale(kt, kt); c.rotate(0.06); // COMPLIMENTARY tent card
      c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -78 + 5, -36 + 7, 156, 72, 8); c.fill(); c.fillStyle = '#FFFDF6'; c.strokeStyle = '#B8963E'; c.lineWidth = 3; rr(c, -78, -36, 156, 72, 8); c.fill(); c.stroke();
      fitTxt(c, 'COMPLIMENTARY', 0, -8, 20, '#8A6A1E', 136); fitTxt(c, 'with love', 0, 16, 16, '#B8963E', 120, 'Nun9'); c.restore(); } }
  c.restore(); }
// towel swan on the fresh bed; (0,0) = its base
function swan(c, x, y, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k);
  for (const sd of [-1, 1]) { c.save(); c.scale(sd, 1); paint(c, q => { q.m(0, 0); q.q(120, -10, 110, -90); q.q(70, -40, 10, -60); q.z(); }, '#EAF2F7', { sd: 8, hd: 4, lw: 6, line: '#8A98A8' });
    c.save(); c.translate(26, -20); c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 0); c.quadraticCurveTo(110, -110, 50, -160); c.quadraticCurveTo(26, -176, 14, -150); c.strokeStyle = '#8A98A8'; c.lineWidth = 26; c.stroke(); c.strokeStyle = '#EAF2F7'; c.lineWidth = 18; c.stroke(); c.fillStyle = '#F29A5A'; c.beginPath(); c.moveTo(12, -156); c.lineTo(-12, -146); c.lineTo(12, -140); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(30, -158, 4, 0, TAU); c.fill(); c.restore(); c.restore(); }
  c.restore(); }
// the gold Presidential key card; (0,0) = centre
function keyCard(c, s = 1, rot = 0) { c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -90 + 6, -56 + 8, 180, 112, 14); c.fill();
  const g = c.createLinearGradient(-90, -56, 90, 56); g.addColorStop(0, '#FFE28A'); g.addColorStop(0.5, '#E8B640'); g.addColorStop(1, '#C8902A'); c.fillStyle = g; c.strokeStyle = '#8A6012'; c.lineWidth = 4; rr(c, -90, -56, 180, 112, 14); c.fill(); c.stroke();
  // crown icon (paths)
  c.fillStyle = '#7A1E3A'; c.beginPath(); c.moveTo(-34, -6); c.lineTo(-34, -40); c.lineTo(-17, -22); c.lineTo(0, -46); c.lineTo(17, -22); c.lineTo(34, -40); c.lineTo(34, -6); c.closePath(); c.fill();
  fitTxt(c, 'PRESIDENTIAL', 0, 14, 20, '#5A1428', 160); fitTxt(c, 'SUITE', 0, 36, 18, '#5A1428', 120); c.restore(); }
const cardItem = ctx => { ctx.save(); ctx.translate(0, -40); keyCard(ctx, 0.9, -0.12); ctx.restore(); };
const hairItem = ctx => { ctx.save(); ctx.translate(4, 18); ctx.rotate(Math.PI / 2 + Math.sin(Date.now() * 0) * 0); hairStrand(ctx, 0.6, 1, 13); ctx.restore(); };

// ---------------- the founder's portrait (absurd detail): a gentleman with enormous ginger curls; (0,0) = centre
function curls(c, cx, cy, R, n, seed, col = HAIR) { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 1.25 + Math.PI * 0.87, rr_ = R * (0.92 + 0.16 * hash(seed + i)), x = cx + Math.cos(a) * rr_, y = cy + Math.sin(a) * rr_ * 0.95, r = R * (0.3 + 0.1 * hash(seed + i * 7));
  paint(c, q => q.e(x, y, r, r), col, { sd: 8, hd: 6, lw: 4, line: HAIRD }); c.strokeStyle = HAIRD; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r * 0.45, 0.3, 4.4); c.stroke(); } }
function portrait(c, x, y, who = 'founder') { const { w, h } = PORT; c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 14, -h / 2 + 20, w, h, 16); c.fill();
  const g = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#F2D27A'); g.addColorStop(0.5, '#C9A040'); g.addColorStop(1, '#8A6A1E'); c.fillStyle = g; rr(c, -w / 2, -h / 2, w, h, 16); c.fill();
  c.strokeStyle = '#6A4E12'; c.lineWidth = 5; rr(c, -w / 2, -h / 2, w, h, 16); c.stroke(); rr(c, -w / 2 + 36, -h / 2 + 36, w - 72, h - 72, 8); c.stroke();
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.fillStyle = '#FFE9A8'; c.beginPath(); c.arc(sx * (w / 2 - 18), sy * (h / 2 - 18), 12, 0, TAU); c.fill(); }
  c.save(); rr(c, -w / 2 + 44, -h / 2 + 44, w - 88, h - 88, 6); c.clip();
  const bg = c.createRadialGradient(0, -60, 20, 0, 0, 360); bg.addColorStop(0, '#4E6E5A'); bg.addColorStop(1, '#1E3328'); c.fillStyle = bg; c.fillRect(-w / 2, -h / 2, w, h);
  if (who === 'founder') {
    // jacket + cravat
    paint(c, q => { q.m(-230, 330); q.q(-220, 120, -90, 90); q.l(90, 90); q.q(220, 120, 230, 330); q.z(); }, '#2B2F3A', { sd: 10, hd: 6, lw: 4 });
    paint(c, q => { q.m(-50, 90); q.l(50, 90); q.l(30, 190); q.l(0, 210); q.l(-30, 190); q.z(); }, '#F7F2E6', { sd: 4, hd: 3, lw: 3 });
    paint(c, q => q.e(0, 110, 30, 22), '#7A1E3A', { sd: 4, hd: 3, lw: 3 });
    curls(c, 0, -60, 150, 14, 3);                                                     // the curls behind the face
    paint(c, q => q.e(0, -30, 92, 112), '#F2C9A8', { sd: 10, hd: 6, lw: 4 });           // face
    curls(c, 0, -150, 70, 9, 11);                                                     // the quiff on top
    c.fillStyle = '#2B1A10'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 34, -40, 9, 0, TAU); c.fill(); }
    c.strokeStyle = '#2B1A10'; c.lineWidth = 5; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 18, -66); c.quadraticCurveTo(sx * 36, -76, sx * 54, -66); c.stroke(); }
    // magnificent ginger moustache
    for (const sx of [-1, 1]) paint(c, q => { q.m(0, 18); q.q(sx * 40, -4, sx * 80, 14); q.q(sx * 98, 22, sx * 92, 2); q.q(sx * 104, 30, sx * 70, 34); q.q(sx * 30, 38, 0, 28); q.z(); }, HAIR, { sd: 4, hd: 4, lw: 3, line: HAIRD });
    c.strokeStyle = '#8A4A3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(-18, 48); c.quadraticCurveTo(0, 58, 18, 48); c.stroke();
    c.strokeStyle = '#C9A040'; c.lineWidth = 4; c.beginPath(); c.arc(34, -40, 22, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(54, -32); c.quadraticCurveTo(70, 40, 60, 110); c.stroke();   // monocle
  } else {   // the suite: Biscuit himself, with a crown
    paint(c, q => { q.m(-230, 330); q.q(-220, 130, -90, 110); q.l(90, 110); q.q(220, 130, 230, 330); q.z(); }, '#7A1E3A', { sd: 10, hd: 6, lw: 4 });
    for (const sx of [-1, 1]) paint(c, q => { q.m(sx * 60, -110); q.l(sx * 120, -230); q.l(sx * 150, -80); q.z(); }, '#EBA15E', { sd: 6, hd: 4, lw: 4, line: HAIRD });
    paint(c, q => q.e(0, -20, 150, 130), '#EBA15E', { sd: 10, hd: 6, lw: 4, line: HAIRD });
    c.fillStyle = '#FFF1DE'; c.beginPath(); c.ellipse(0, 40, 80, 56, 0, 0, TAU); c.fill();
    c.strokeStyle = '#C9793A'; c.lineWidth = 12; c.lineCap = 'round'; for (const dx of [-40, 0, 40]) { c.beginPath(); c.moveTo(dx, -150); c.lineTo(dx * 0.8, -100); c.stroke(); }
    for (const sx of [-1, 1]) { c.fillStyle = '#C9D24A'; c.beginPath(); c.ellipse(sx * 55, -20, 26, 28, 0, 0, TAU); c.fill(); c.fillStyle = '#1A1014'; c.beginPath(); c.ellipse(sx * 55, -20, 8, 22, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#E87A92'; c.beginPath(); c.moveTo(-12, 22); c.lineTo(12, 22); c.lineTo(0, 36); c.fill();
    c.fillStyle = '#F2C14E'; c.strokeStyle = '#8A6012'; c.lineWidth = 4; c.beginPath(); c.moveTo(-80, -140); c.lineTo(-80, -210); c.lineTo(-40, -170); c.lineTo(0, -230); c.lineTo(40, -170); c.lineTo(80, -210); c.lineTo(80, -140); c.closePath(); c.fill(); c.stroke();
  }
  c.restore(); c.restore(); }

// ---------------- the room 214 (prerendered, softly blurred)
const BX0 = -3200, BY0 = -4600, BW = 6400, BH = 6000, BS = 0.5;
function wallpaper(c, col, dot) { c.fillStyle = col; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = dot; for (let y = BY0 + 60; y < 0; y += 200) for (let x = BX0 + ((Math.round((y - BY0) / 200)) % 2) * 100; x < BX0 + BW; x += 200) { c.beginPath(); c.moveTo(x, y - 40); c.quadraticCurveTo(x + 26, y, x, y + 40); c.quadraticCurveTo(x - 26, y, x, y - 40); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.05)'; for (let x = BX0; x < BX0 + BW; x += 400) c.fillRect(x, BY0, 14, -BY0); }
function wainscot(c, col) { c.fillStyle = col; c.fillRect(BX0, -900, BW, 900); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(BX0, -900, BW, 26);
  c.strokeStyle = 'rgba(120,100,70,.35)'; c.lineWidth = 8; for (let x = BX0 + 60; x < BX0 + BW; x += 520) { rr(c, x, -800, 440, 640, 12); c.stroke(); }
  c.fillStyle = '#5A3A26'; c.fillRect(BX0, -70, BW, 70); }
function cornice(c) { c.fillStyle = '#F3EDDF'; c.fillRect(BX0, BY0, BW, -3300 - BY0); c.fillStyle = '#E2D8C2'; c.fillRect(BX0, -3360, BW, 80); c.fillStyle = '#D2C6AC'; c.fillRect(BX0, -3290, BW, 26); }
function carpet(c, col, pat) { c.fillStyle = col; c.fillRect(BX0, 0, BW, BY0 + BH); c.fillStyle = pat;
  for (let y = 60; y < BY0 + BH; y += 160) for (let x = BX0 + ((y / 160) % 2) * 80; x < BX0 + BW; x += 160) { c.beginPath(); c.moveTo(x, y - 26); c.lineTo(x + 26, y); c.lineTo(x, y + 26); c.lineTo(x - 26, y); c.fill(); } }
function bedFrame(c, x0, x1, headTop, headCol, duvet, runner) { const cx = (x0 + x1) / 2, w = x1 - x0;
  paint(c, q => { q.m(x0 - 60, -540); q.l(x0 - 60, headTop + 200); q.q(x0 - 60, headTop, cx, headTop - 40); q.q(x1 + 60, headTop, x1 + 60, headTop + 200); q.l(x1 + 60, -540); q.z(); }, headCol, { sd: 18, hd: 8, lw: 6 });
  c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(x0 + w * (0.14 + i * 0.24), headTop + 230 + j * 180, 12, 0, TAU); c.fill(); }
  c.fillStyle = '#4A2E1E'; c.fillRect(x0 - 10, -130, w + 20, 90); for (const lx of [x0 + 20, x1 - 60]) c.fillRect(lx, -40, 40, 40);
  paint(c, q => { q.m(x0, -600); q.l(x1, -600); q.q(x1 + 22, -360, x1 + 6, -110); q.l(x0 - 6, -110); q.q(x0 - 22, -360, x0, -600); q.z(); }, duvet, { sd: 16, hd: 6, lw: 5, line: '#B8B0A8' });
  c.fillStyle = runner; c.fillRect(x0 + 4, -360, w - 8, 80); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x0 + 4, -290, w - 8, 10); }
function drawRoom(c) {
  wallpaper(c, '#2E5B57', 'rgba(201,168,90,.22)'); cornice(c); wainscot(c, '#EFE6D2'); carpet(c, '#7A2E3A', 'rgba(242,193,78,.18)');
  // the sash window (view of a rainy London street: terraces with chimneys, a clock tower)
  const { x0, x1, y0, y1 } = WIN;
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
  const sg = c.createLinearGradient(0, y0, 0, y1); sg.addColorStop(0, '#8E9AA8'); sg.addColorStop(1, '#C9D1D8'); c.fillStyle = sg; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = 'rgba(255,255,255,.55)'; for (const [x, y, r] of [[x0 + 90, y0 + 150, 90], [x0 + 200, y0 + 120, 120], [x0 + 330, y0 + 170, 90], [x1 - 60, y0 + 260, 80]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  c.fillStyle = '#6E7884'; c.fillRect(x0 + 300, y0 + 330, 90, 900); c.beginPath(); c.moveTo(x0 + 290, y0 + 330); c.lineTo(x0 + 345, y0 + 200); c.lineTo(x0 + 400, y0 + 330); c.fill();   // the clock tower
  c.fillStyle = '#F3EDDF'; c.beginPath(); c.arc(x0 + 345, y0 + 410, 34, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0 + 345, y0 + 410); c.lineTo(x0 + 345, y0 + 386); c.moveTo(x0 + 345, y0 + 410); c.lineTo(x0 + 362, y0 + 418); c.stroke();
  for (let i = 0; i < 6; i++) { const bx = x0 - 40 + i * 110, bh = 360 + (i % 3) * 60; c.fillStyle = ['#8A5A4A', '#7A6A5A', '#9A6A50'][i % 3]; c.fillRect(bx, y1 - 180 - bh, 112, bh); c.fillStyle = '#5A4A44'; c.fillRect(bx + 20, y1 - 220 - bh, 22, 50); c.fillRect(bx + 70, y1 - 210 - bh, 18, 40);
    c.fillStyle = '#E9E2C8'; for (let r = 0; r < 3; r++) c.fillRect(bx + 22, y1 - 150 - bh + 40 + r * 100, 26, 50), c.fillRect(bx + 66, y1 - 150 - bh + 40 + r * 100, 26, 50); }
  c.fillStyle = '#5E6670'; c.fillRect(x0, y1 - 180, x1 - x0, 180); c.fillStyle = '#7A828C'; c.fillRect(x0, y1 - 60, x1 - x0, 60);
  c.restore();
  c.fillStyle = '#F7F4EE'; c.fillRect(x0 - 30, y0 - 30, x1 - x0 + 60, 30); c.fillRect(x0 - 30, y1, x1 - x0 + 60, 50); c.fillRect(x0 - 30, y0, 30, y1 - y0); c.fillRect(x1, y0, 30, y1 - y0);
  c.fillRect(x0, (y0 + y1) / 2 - 14, x1 - x0, 28); c.fillRect((x0 + x1) / 2 - 10, y0, 20, y1 - y0); c.fillRect(x0, (y0 * 3 + y1) / 4 - 8, x1 - x0, 16); c.fillRect(x0, (y0 + y1 * 3) / 4 - 8, x1 - x0, 16);
  for (const [cx0, cx1] of [[x0 - 170, x0 + 10], [x1 - 10, x1 + 170]]) paint(c, q => { q.m(cx0, y0 - 140); q.l(cx1, y0 - 140); q.q(cx1 - 30, (y0 + y1) / 2, cx1 + (cx0 < x0 ? -40 : 40), y1 + 220); q.l(cx0 + (cx0 < x0 ? 0 : 0), y1 + 220); q.q(cx0 + 20, (y0 + y1) / 2, cx0, y0 - 140); q.z(); }, '#C9A040', { sd: 14, hd: 8, lw: 5 });
  c.fillStyle = '#8A6A1E'; c.fillRect(x0 - 220, y0 - 170, x1 - x0 + 440, 34);
  // the door (open): corridor with warm light; brass 214 plaque; the door leaf swung open
  const { x0: d0, x1: d1, y0: dy } = DOOR;
  const cg = c.createLinearGradient(0, dy, 0, 0); cg.addColorStop(0, '#E8C890'); cg.addColorStop(1, '#C9A070'); c.fillStyle = cg; c.fillRect(d0, dy, d1 - d0, -dy);
  c.fillStyle = 'rgba(255,240,200,.6)'; c.beginPath(); c.arc((d0 + d1) / 2, dy + 520, 60, 0, TAU); c.fill(); c.fillStyle = '#B8963E'; c.fillRect((d0 + d1) / 2 - 12, dy + 560, 24, 80);
  c.fillStyle = '#7A2E3A'; c.beginPath(); c.moveTo(d0, 0); c.lineTo(d1, 0); c.lineTo(d1 - 80, -300); c.lineTo(d0 + 80, -300); c.fill(); c.fillStyle = '#B49068'; c.fillRect(d0, -320, d1 - d0, 20);
  c.fillStyle = '#F3EDDF'; c.fillRect(d0 - 60, dy - 60, d1 - d0 + 120, 60); c.fillRect(d0 - 60, dy, 60, -dy); c.fillRect(d1, dy, 60, -dy);
  paint(c, q => { q.m(d1 + 60, dy + 20); q.l(d1 + 260, dy + 140); q.l(d1 + 260, -40); q.l(d1 + 60, 0); q.z(); }, '#5A3A26', { sd: 8, hd: 4, lw: 5 });
  c.fillStyle = '#E8C15A'; c.beginPath(); c.arc(d1 + 230, -1050, 16, 0, TAU); c.fill();
  c.fillStyle = '#C9A040'; rr(c, (d0 + d1) / 2 - 110, dy - 240, 220, 130, 18); c.fill(); c.strokeStyle = '#6A4E12'; c.lineWidth = 5; c.stroke(); fitTxt(c, '214', (d0 + d1) / 2, dy - 172, 90, '#3A2A10', 180);
  // the bed (frontal), the bedside table with a lamp and the rate card
  bedFrame(c, -470, 470, -1250, '#D9C3A0', '#FBFAF7', '#C9A040');
  c.fillStyle = '#5A3A26'; c.fillRect(480, -560, 150, 560); c.fillStyle = '#6E4A30'; c.fillRect(470, -580, 170, 30); c.fillStyle = '#C9A040'; c.beginPath(); c.arc(555, -300, 10, 0, TAU); c.fill();
  c.fillStyle = '#C9A040'; c.fillRect(540, -800, 30, 220); c.beginPath(); c.ellipse(555, -590, 60, 18, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(480, -800); q.l(630, -800); q.l(600, -980); q.l(510, -980); q.z(); }, '#F7EBD0', { sd: 6, hd: 4, lw: 4 });
  c.fillStyle = 'rgba(255,240,200,.25)'; c.beginPath(); c.ellipse(555, -880, 180, 140, 0, 0, TAU); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// ---------------- the Presidential suite (prerendered): gold damask, chandelier, a canopy bed, Biscuit's portrait
function drawSuite(c) {
  wallpaper(c, '#E8D3A0', 'rgba(170,120,40,.22)'); cornice(c); wainscot(c, '#F7F0E0'); carpet(c, '#3E2A5A', 'rgba(242,193,78,.22)');
  // tall windows with velvet drapes (right)
  for (const wx of [1500, 2300]) { const sg = c.createLinearGradient(0, -2700, 0, -900); sg.addColorStop(0, '#9AA6B4'); sg.addColorStop(1, '#D6DCE2'); c.fillStyle = sg; c.fillRect(wx, -2700, 520, 1800); c.fillStyle = '#F7F4EE'; c.fillRect(wx + 250, -2700, 20, 1800); c.fillRect(wx, -1820, 520, 20);
    for (const sx of [wx - 120, wx + 520]) paint(c, q => { q.m(sx, -2850); q.l(sx + 140, -2850); q.q(sx + 120, -1800, sx + 160, -700); q.l(sx - 20, -700); q.q(sx + 20, -1800, sx, -2850); q.z(); }, '#7A1E3A', { sd: 14, hd: 8, lw: 5 }); }
  // the canopy bed with a crown pelmet
  c.fillStyle = '#7A1E3A'; for (const sx of [-150, 1050]) paint(c, q => { q.m(sx, -2500); q.l(sx + 120, -2500); q.q(sx + 90, -1500, sx + 140, -300); q.l(sx - 20, -300); q.q(sx + 30, -1500, sx, -2500); q.z(); }, '#7A1E3A', { sd: 14, hd: 8, lw: 5 });
  paint(c, q => { q.m(-200, -2560); q.l(1220, -2560); q.l(1180, -2380); q.q(510, -2300, -160, -2380); q.z(); }, '#C9A040', { sd: 8, hd: 6, lw: 5 });
  c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(380, -2560); c.lineTo(380, -2720); c.lineTo(450, -2640); c.lineTo(510, -2760); c.lineTo(570, -2640); c.lineTo(640, -2720); c.lineTo(640, -2560); c.closePath(); c.fill();
  bedFrame(c, 0, 1020, -1350, '#F3E3B8', '#FFFDF6', '#7A1E3A');
  // chandelier
  c.strokeStyle = '#C9A040'; c.lineWidth = 10; c.beginPath(); c.moveTo(-500, -3300); c.lineTo(-500, -3000); c.stroke(); c.fillStyle = '#E8C15A';
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.ellipse(-500 + i * 70, -2960 + Math.abs(i) * 18, 14, 40, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,250,220,.5)'; c.beginPath(); c.arc(-500 + i * 70, -3010 + Math.abs(i) * 18, 30, 0, TAU); c.fill(); c.fillStyle = '#E8C15A'; }
  c.fillStyle = '#C9A040'; c.beginPath(); c.ellipse(-500, -2960, 260, 34, 0, 0, TAU); c.fill();
  // the wardrobe (body; the doors are live)
  const { x0, x1, y0 } = WARD; c.fillStyle = '#4A2E1E'; c.fillRect(x0 - 40, y0 - 80, x1 - x0 + 80, 100); c.fillRect(x0 - 30, y0, x1 - x0 + 60, -y0);
  c.fillStyle = '#2A1A14'; c.fillRect(x0, y0 + 30, x1 - x0, -y0 - 90);
  c.strokeStyle = '#8A6A4A'; c.lineWidth = 12; c.beginPath(); c.moveTo(x0 + 20, y0 + 220); c.lineTo(x1 - 20, y0 + 220); c.stroke();
  for (const [hx, col] of [[x0 + 110, '#FFFFFF'], [x0 + 230, '#F3E3B8'], [x1 - 130, '#FFFFFF']]) { c.strokeStyle = '#C9A040'; c.lineWidth = 6; c.beginPath(); c.moveTo(hx, y0 + 220); c.lineTo(hx - 60, y0 + 280); c.lineTo(hx + 60, y0 + 280); c.closePath(); c.stroke();
    paint(c, q => { q.m(hx - 70, y0 + 280); q.l(hx + 70, y0 + 280); q.l(hx + 90, y0 + 1000); q.l(hx - 90, y0 + 1000); q.z(); }, col, { sd: 10, hd: 4, lw: 4, line: '#A89880' }); }
  c.fillStyle = '#7A1E3A'; rr(c, x0 + 60, -260, x1 - x0 - 120, 120, 30); c.fill();   // the velvet cushion (the cat sits on it)
}
const BGS = mkBG(drawSuite);

// ---------------- live bits
function rain(c, t, x0, x1, y0, y1, a = 0.55) { c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip(); c.strokeStyle = `rgba(230,240,250,${a})`; c.lineWidth = 4;
  for (let i = 0; i < 40; i++) { const x = x0 + hash(i) * (x1 - x0), sp = 900 + hash(i * 3) * 500, y = y0 + (((t * sp + hash(i * 7) * 3000) % (y1 - y0 + 200)) - 100); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 14, y + 70); c.stroke(); }
  c.fillStyle = 'rgba(230,240,250,.35)'; for (let i = 0; i < 18; i++) { const x = x0 + hash(i * 11) * (x1 - x0), y = y0 + ((hash(i * 13) * (y1 - y0) + t * 40 * hash(i)) % (y1 - y0)); c.beginPath(); c.ellipse(x, y, 7, 10, 0, 0, TAU); c.fill(); }
  c.restore(); }
function bus(c, t, L) { const { x0, x1, y1 } = WIN; let k = -1;
  if (L === 'o4') k = (t - ev('o4', 'sea') - 0.1) / 2.2; else k = ((t + 3) % 9) / 3.2 - 0.2;
  if (k < -0.1 || k > 1.1) return; const bx = lerp(x1 + 120, x0 - 560, k);
  c.save(); c.beginPath(); c.rect(x0, WIN.y0, x1 - x0, y1 - WIN.y0); c.clip(); c.translate(bx, y1 - 70);
  paint(c, q => { q.m(0, 0); q.l(0, -330); q.q(0, -360, 30, -360); q.l(410, -360); q.q(440, -360, 440, -330); q.l(440, 0); q.z(); }, '#D8282E', { sd: 10, hd: 6, lw: 4 });
  c.fillStyle = '#F3EDDF'; c.fillRect(0, -190, 440, 16); c.fillStyle = '#2B3540'; for (let i = 0; i < 4; i++) { rr(c, 20 + i * 104, -330, 84, 90, 10); c.fill(); rr(c, 20 + i * 104, -160, 84, 80, 10); c.fill(); }
  c.fillStyle = '#1E1612'; for (const wx of [80, 360]) { c.beginPath(); c.arc(wx, 0, 36, 0, TAU); c.fill(); } c.restore(); }
// the wardrobe doors in the suite (open on ev 'open')
function wardDoors(c, t, L) { const { x0, x1, y0 } = WARD, k = L === 'end' ? eIO(clamp((t - ev('end', 'open')) / 0.35)) : 0, hw = (x1 - x0) / 2;
  for (const sd of [-1, 1]) { const hx = sd < 0 ? x0 : x1, w = hw * Math.cos(k * 1.35), out = hw * Math.sin(k * 1.35) * 0.25;
    c.save(); c.translate(hx, 0); paint(c, q => { q.m(0, y0 + 20); q.l(-sd * w, y0 + 20 - out); q.l(-sd * w, -40 + out); q.l(0, -40); q.z(); }, '#6E4A30', { sd: 10, hd: 5, lw: 5, line: '#3A2414' });
    if (w > 60) { c.strokeStyle = 'rgba(40,20,10,.4)'; c.lineWidth = 8; rr(c, Math.min(-sd * 40, -sd * (w - 40)), y0 + 160, Math.abs(w) - 80, 700, 16); c.stroke(); rr(c, Math.min(-sd * 40, -sd * (w - 40)), y0 + 1000, Math.abs(w) - 80, 900, 16); c.stroke();
      c.fillStyle = '#E8C15A'; c.beginPath(); c.arc(-sd * (w - 30), -1100, 16, 0, TAU); c.fill(); } c.restore(); } }
// Biscuit: the anthropomorphic ginger cat (hq.catChar) in a bow tie with an OWNER badge
const catOutfit = c => { c.fillStyle = '#1E1612'; c.beginPath(); c.moveTo(0, -560); c.lineTo(-70, -600); c.lineTo(-70, -520); c.closePath(); c.moveTo(0, -560); c.lineTo(70, -600); c.lineTo(70, -520); c.closePath(); c.fill(); c.beginPath(); c.arc(0, -560, 18, 0, TAU); c.fill();
  c.fillStyle = '#F2C14E'; c.strokeStyle = '#8A6012'; c.lineWidth = 4; rr(c, 34, -470, 110, 50, 10); c.fill(); c.stroke(); fitTxt(c, 'OWNER', 89, -444, 26, '#5A1428', 96); };
function catState(t) { const sh = t > ev('end', 'shake') && t < ev('end', 'shake') + 0.8, st = { t, mood: 'neutral', turn: 0, look: 0, outfit: catOutfit, armL: { a: 0.25, b: 0.5 }, armR: { a: 0.25, b: 0.5 } };
  if (t > ev('end', 'cat') && t < ev('end', 'cat') + 0.9) { st.mood = 'neutral'; st.look = 0.6; st.turn = 0.3; }
  if (t > ev('end', 'biscuit')) { st.mood = 'bored'; st.turn = 0.2; st.look = 0.4; }
  if (sh) { st.tilt = Math.sin((t - ev('end', 'shake')) * 40) * 0.25; st.mood = 'shock'; }
  if (t > ev('end', 'shake') + 0.8) { st.mood = 'bored'; st.turn = 0.15; st.look = 0.5; }
  return st; }
function cat(c, t, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const st = catState(t), sh = st.tilt || 0; c.rotate(sh * 0.3); Hq.catChar(c, st); c.restore(); K.mark(c, 'cat', x, y - 520 * s, 420 * s); }
// flying ginger hairs after the shake (world coords, around the wardrobe; spread over the suite)
function hairCloud(c, t) { const u = t - ev('end', 'shake'); if (u < 0) return;
  for (let i = 0; i < 46; i++) { const a = hash(i * 5) * TAU, sp = 380 + hash(i * 9) * 1500, life = clamp(u / 2.5), x = XS.cat + Math.cos(a) * sp * eOut(clamp(u / 1.2)) + Math.sin(t * 2 + i) * 40,
    y = -620 + Math.sin(a) * sp * 0.55 * eOut(clamp(u / 1.2)) + life * 380 * hash(i * 3) + Math.cos(t * 1.7 + i) * 20;
    c.save(); c.translate(x, y); c.rotate(t * (hash(i) - 0.5) * 3 + i); c.globalAlpha = clamp(u / 0.2); hairStrand(c, 0.35 + hash(i * 2) * 0.25, 1, 12); c.restore(); } }
// o3: the housekeepers (navy dress, white apron and cap, a stack of linen); the whirlwind over the bed
const apron = (c, g) => { c.fillStyle = '#FFFFFF'; c.strokeStyle = '#B8B0A8'; c.lineWidth = 4; rr(c, -g.sw * 0.55, g.ySh + 260, g.sw * 1.1, 520, 30); c.fill(); c.stroke(); };
function linen(c, x, y, k = 1) { c.save(); c.translate(x, y); c.scale(k, k); [['#FFFFFF', 0], ['#F7F2E6', -50], ['#FFFFFF', -100], ['#EAF2F7', -150]].forEach(([col, dy]) => { paint(c, q => { q.m(-150, dy); q.l(150, dy); q.l(146, dy - 50); q.l(-146, dy - 50); q.z(); }, col, { sd: 4, hd: 3, lw: 4, line: '#B8B0A8' }); }); c.restore(); }
const maidX = (t, i) => { const a = ev('o3', 'maids') + i * 0.22, k = eIO(clamp((t - a) / 0.75)); return lerp(1250 + i * 260, -260 + i * 260, k); };
function maids(c, t, L) { if (L !== 'o3') return; const t0 = ev('o3', 'maids'), tw = ev('o3', 'whirl'); if (t < t0 - 0.05 || t > tw + 0.25) return;
  for (let i = 2; i >= 0; i--) { const g = G.maid[i], x = maidX(t, i), run = t < t0 + i * 0.22 + 0.75;
    const st = { t, talk: 0, mood: 'happy', turn: -0.4, look: -0.8, legPose: run ? 'walk' : 'stand', headY: run ? -Math.abs(Math.sin(t * 16 + i)) * 18 : 0, armL: reach(g, -1, -g.sw * 0.55, g.ySh + 210, { planar: true }), armR: reach(g, 1, g.sw * 0.55, g.ySh + 210, { planar: true }), items: {},
      afterTorso: (cc, q) => apron(cc, g), front: (cc, q) => { linen(cc, 0, g.ySh + 330, 0.85); cc.fillStyle = '#FFFFFF'; cc.strokeStyle = '#B8B0A8'; cc.lineWidth = 4; rr(cc, q.head.x - 70, q.head.y - g.hh * 1.0, 140, 40, 14); cc.fill(); cc.stroke(); } };
    K.put(c, MAIDS[i], st, x, 0, 0.92); } }
function whirl(c, t, L) { if (L !== 'o3') return; const a = ev('o3', 'whirl') - 0.1, b = ev('o3', 'fresh') + 0.3; if (t < a || t > b) return; const k = Math.min(eOut(clamp((t - a) / 0.25)), 1 - eIn(clamp((t - b + 0.35) / 0.35)));
  c.save(); c.globalAlpha = k; for (let i = 0; i < 14; i++) { const ang = t * 7 + i * 0.9, r = 260 + (i % 4) * 90; paint(c, q => q.e(Math.cos(ang) * r * 0.9, -700 + Math.sin(ang) * r * 0.5, 170 + (i % 3) * 40, 120), '#FFFFFF', { sd: 10, hd: 4, lw: 4, line: '#C9C2B8' }); }
  for (let i = 0; i < 6; i++) { const ang = -t * 6 + i; c.save(); c.translate(Math.cos(ang) * 520, -900 + Math.sin(ang) * 380); c.rotate(ang * 2); c.fillStyle = ['#FFFFFF', '#EAF2F7', '#F7F2E6'][i % 3]; c.strokeStyle = '#B8B0A8'; c.lineWidth = 4; rr(c, -110, -70, 220, 140, 10); c.fill(); c.stroke(); c.restore(); }
  c.strokeStyle = 'rgba(62,71,30,.6)'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const ang = t * 9 + i * 1.3; c.beginPath(); c.arc(0, -700, 520 + i * 30, ang, ang + 0.7); c.stroke(); }
  c.restore(); }

// ---------------- characters
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const hipHand = (g, s) => reach(g, s, s * g.sw * 1.25, g.ySh + 330, { planar: true });
const gest = (st, g, id, t, side, base) => { if (!speaking(id, t)) return; const u = (t - SP[id].t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); };
const clasp = (st, g) => { st.armL = reach(g, -1, -g.sw * 0.12, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, g.sw * 0.12, g.ySh + 300, { planar: true }); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', blink: 0, turn: 0.25, look: 0.7, armL: down(g, -1), armR: down(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'shock'; st.lean = -0.2; st.turn = 0.3; st.look = 0.8; st.lookY = 0.3; st.armR = open(g, 1, 2.1, 160); st.armL = open(g, -1, 1.3, 330);
    if (t > hev('wide')) { st.mood = 'annoyed'; st.lean = 0; st.lookY = 0; st.armR = hipHand(g, 1); st.armL = hipHand(g, -1); } }
  if (L === 'o1') { st.mood = 'annoyed';
    if (speaking('o1_h', t, 0.1, 0.1)) { const u = t - SP.o1_h.t; st.mood = 'angry'; st.headY = -Math.abs(Math.sin(u * 7)) * 14; st.armR = open(g, 1, 2.2, 120 + Math.sin(u * 7) * 30); st.armL = hipHand(g, -1); }
    if (t > SP.o1_r.t) { st.mood = 'shock'; st.armR = down(g, 1); }
    if (t > e('face')) { st.mood = 'annoyed'; st.turn = 0.1; st.look = 0.3; st.armL = hipHand(g, -1); st.armR = hipHand(g, 1); } }
  if (L === 'o2') { st.mood = 'worried';
    if (speaking('o2_h', t, 0.1, 0.1)) { const u = t - SP.o2_h.t; st.mood = 'worried'; st.headY = 24; st.tilt = -0.08; clasp(st, g); st.lookY = 0.2; }
    if (t > SP.o2_r.t) { st.mood = 'surprised'; }
    if (t > e('face')) { st.mood = 'bored'; st.turn = 0.1; st.look = 0.2; st.armL = hipHand(g, -1); st.armR = down(g, 1); } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'smug'; gest(st, g, 'o3_h', t, 1, 150); }
    if (t > SP.o3_r.t) st.mood = 'happy';
    if (t > ev('o3', 'maids')) { st.mood = 'surprised'; st.lean = -0.15; }
    if (t > ev('o3', 'fresh')) { st.mood = 'happy'; st.lean = 0; st.armR = open(g, 1, 1.9, 120); st.armL = open(g, -1, 1.5, 200); } }
  if (L === 'o4') { st.mood = 'smug';
    if (speaking('o4_h', t, 0.1, 0)) { const u = t - SP.o4_h.t; clasp(st, g); st.tilt = 0.05 * Math.sin(u * 2);
      if (t > e('sea') && t < e('souv')) { st.turn = -0.3; st.look = -0.8; st.armL = open(g, -1, 2.0, 140); st.armR = hipHand(g, 1); st.mood = 'bored'; }
      if (t > e('souv')) { st.mood = 'smug'; st.turn = 0.25; st.look = 0.7; st.armR = reach(g, 1, g.sw * 1.45, g.ySh - 40, { planar: true }); st.items = { R: hairItem }; st.armL = hipHand(g, -1); }
      if (t > e('bill')) { st.mood = 'happy'; st.armL = open(g, -1, 1.6, 160); } }
    if (t > endOf('o4_h')) { st.mood = 'smug'; st.armL = hipHand(g, -1); st.armR = hipHand(g, 1); }
    if (t > SP.o4_r.t + 0.4) { st.mood = 'happy'; } }
  return st; }
function herSuite(t) { const g = G.her, st = { t, talk: 0, mood: 'happy', blink: 0, turn: -0.35, look: -0.8, armL: open(g, -1, 2.0, 160), armR: down(g, 1), items: {} };
  if (t > ev('end', 'open')) { st.mood = 'shock'; st.armL = open(g, -1, 1.8, 120); }
  if (t > ev('end', 'biscuit')) { st.mood = 'surprised'; st.turn = 0.35; st.look = 0.8; st.armL = down(g, -1); }
  if (t > ev('end', 'shake')) { st.mood = 'shock'; st.turn = -0.3; st.look = -0.7; st.lean = 0.1; st.armL = open(g, -1, 1.6, 200); st.armR = open(g, 1, 1.6, 200); }
  if (t > ev('end', 'moral')) { st.mood = 'tired'; st.turn = 0; st.look = 0; st.lean = 0; st.armL = hipHand(g, -1); st.armR = hipHand(g, 1); }
  if (t > ev('end', 'kota')) { st.mood = 'smug'; st.turn = -0.3; st.look = -0.8; st.armL = open(g, -1, 2.0, 100); st.armR = hipHand(g, 1); }
  return st; }
// Daniel: the pillow he holds (o2) is drawn by world() using these offsets (local to his feet)
const danPillow = (t, L) => { if (L !== 'o2' || t < ev('o2', 'grab') - 0.05) return null; const g = G.dan, f = ev('o2', 'flip'), u = clamp((t - f) / 0.35);
  const fl = t < f ? 1 : Math.cos(u * Math.PI), held = t > f + 0.4;
  return held ? { x: -g.sw * 0.25, y: g.ySh + 230, flip: fl, s: 0.75 } : { x: -g.sw * 1.35, y: g.ySh + 110, flip: fl, s: 0.8 }; };
function danState(t, L) { const g = G.dan, e = k => ev(L, k), st = { t, talk: talk('recep1', t), mood: 'happy', blink: 0, turn: -0.3, look: -0.8, armL: down(g, -1), armR: down(g, 1), items: {}, front: (c, q) => { c.fillStyle = '#F2C14E'; c.strokeStyle = '#8A6012'; c.lineWidth = 3; rr(c, g.sw * 0.25, g.ySh + 120, 90, 34, 8); c.fill(); c.stroke(); } };
  if (L === 'hook') { st.armL = open(g, -1, 1.9, 120); st.armR = open(g, 1, 1.9, 120); if (speaking('hook_r', t, 0.1, 0.2)) { const u = t - SP.hook_r.t; st.armL = open(g, -1, 2.0, 100 + Math.sin(u * 5) * 20); } if (t > hev('nar') + 0.5) clasp(st, g); }
  if (L === 'o1') { clasp(st, g);
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'surprised'; st.lean = 0.05; }
    if (speaking('o1_r', t, 0.05, 0.3)) { const u = t - SP.o1_r.t; st.mood = 'happy'; st.lean = -0.3; st.lookY = 0.6; st.tilt = -0.1; st.armL = open(g, -1, 1.8, 160 + Math.sin(u * 6) * 15); }
    if (t > e('face')) { st.mood = 'happy'; } }
  if (L === 'o2') { clasp(st, g); st.mood = 'smug';
    const p = danPillow(t, L); if (p) { st.mood = 'skeptical'; st.lean = 0.12; st.tilt = 0.06; st.squint = true; const hy = g.ySh + 110 - g.ySh;
      if (t < e('flip') + 0.4) { st.armL = reach(g, -1, p.x - 150, g.ySh + 120, { planar: true }); st.armR = reach(g, 1, p.x + 150, g.ySh + 120, { planar: true }); }
      else { const pu = Math.max(0, Math.sin((t - e('flip') - 0.4) * 14)); st.mood = 'happy'; st.squint = false; st.lean = 0; st.tilt = 0; st.armL = reach(g, -1, -g.sw * 1.0, g.ySh + 260, { planar: true }); st.armR = reach(g, 1, p.x + 30, g.ySh + 140 + pu * 60, { planar: true }); } } }
  if (L === 'o3') { clasp(st, g);
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (speaking('o3_r', t, 0.05, 0)) { st.mood = 'worried'; st.lean = -0.08; st.headY = 16; }
    if (t > e('clap') - 0.25 && t < e('clap') + 0.5) { const k = Math.abs(Math.sin((t - e('clap') + 0.25) * 9)); st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * (0.15 + 0.5 * k), g.ySh + 120, { planar: true }); st.armR = reach(g, 1, g.sw * (0.15 + 0.5 * k), g.ySh + 120, { planar: true }); }
    if (t > e('maids')) { st.mood = 'happy'; st.turn = 0.3; st.look = -0.2; st.armL = open(g, -1, 1.9, 150); }
    if (t > e('fresh')) { st.turn = -0.3; st.look = -0.8; clasp(st, g); } }
  if (L === 'o4') { clasp(st, g); st.mood = 'neutral';
    if (t > ev('o4', 'souv')) st.mood = 'worried';
    if (t > ev('o4', 'bill')) { st.mood = 'shock'; st.lean = 0.12; }
    if (t > ev('o4', 'gulp')) { st.mood = 'worried'; st.lean = 0; st.headY = Math.sin(clamp((t - ev('o4', 'gulp')) / 0.4) * Math.PI) * 18; }
    if (t > ev('o4', 'card') - 0.1) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 80, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.15, g.ySh + 30, { planar: true }); st.items = { L: cardItem }; }
    if (t > ev('o4', 'promise')) { st.armR = reach(g, 1, -g.sw * 0.15, g.ySh + 150, { planar: true }); } }
  return st; }
function danSuite(t) { const g = G.dan, st = { t, talk: talk('recep1', t), mood: 'happy', blink: 0, turn: -0.3, look: -0.8, armL: down(g, -1), armR: down(g, 1), items: {}, front: danState(0, 'hook').front }; clasp(st, g);
  if (speaking('end_r', t, 0.05, 0.3)) { const u = t - SP.end_r.t; st.mood = 'happy'; st.armL = open(g, -1, 2.0, 120 + Math.sin(u * 4) * 15); }
  if (t > ev('end', 'shake')) { st.mood = 'shock'; clasp(st, g); }
  if (t > ev('end', 'moral') + 0.6) { st.mood = 'worried'; }
  return st; }

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'recep1', 'maids'], cover: ['her', 'recep1'], two: ['her', 'recep1'], her: ['her'], herwin: ['her'], rec: ['recep1'], recw: ['recep1'], pillow: [], bedv: [],
  suite: ['her', 'recep1', 'cat'], cat: ['cat'], recs: ['recep1'], hers: ['her'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const pillowMode = (t, L) => { if (L === 'o1' && t > ev('o1', 'wrap')) return ['wrap', clamp((t - ev('o1', 'wrap')) / 1.1)]; if (L === 'o3' && t > ev('o3', 'fresh') - 0.2) return ['clean', 0]; return ['hair', 0]; };
function circle(c, x, y, r, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; c.strokeStyle = '#E0474C'; c.lineWidth = 16; c.setLineDash([34, 22]); c.lineDashOffset = -t * 60; const pu = 1 + 0.05 * Math.sin(t * 7); c.beginPath(); c.ellipse(x, y, r * 1.35 * pu, r * 0.75 * pu, -0.05, 0, TAU); c.stroke(); c.restore(); }
function worldRoom(c, t, L, tag) { const who = DRAW[tag] || ['her', 'recep1'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); bus(c, t, L); rain(c, t, WIN.x0, WIN.x1, WIN.y0, WIN.y1);
  portrait(c, PORT.x, PORT.y, 'founder');
  if (tag === 'bedv' || tag === 'cover') { const k = tag === 'cover' ? 1 : clamp((t - hev('pillow')) / 0.2); circle(c, PIL.x - 20, PIL.y - 10, 150, t, k); if (tag === 'bedv') circle(c, PORT.x, PORT.y - 100, 190, t + 0.5, clamp((t - hev('pillow') - 0.35) / 0.2)); }
  // tent card on the bedside table
  c.save(); c.translate(560, -640); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -84 + 5, -54 + 6, 168, 108, 8); c.fill(); c.fillStyle = '#FFFDF6'; c.strokeStyle = '#B8963E'; c.lineWidth = 4; rr(c, -84, -54, 168, 108, 8); c.fill(); c.stroke(); fitTxt(c, '£200', 0, -16, 46, '#7A1E3A', 150); fitTxt(c, 'A NIGHT', 0, 28, 24, '#8A6A1E', 140); c.restore();
  const dp = who.includes('recep1') ? danPillow(t, L) : null, pm = pillowMode(t, L);
  if (!(L === 'o2' && t > ev('o2', 'grab') - 0.05)) pillow(c, PIL.x, PIL.y, pm[0], pm[1]); pillow(c, PIL2.x, PIL2.y, 'clean');
  K.mark(c, 'pillow', PIL.x, PIL.y, 200);
  if (L === 'o3' && t > ev('o3', 'fresh') - 0.2) swan(c, -230, -390, 1.05 * eBack(clamp((t - ev('o3', 'fresh') + 0.1) / 0.3), 2));
  if (who.includes('recep1')) { const hd = K.put(c, DAN, danState(t, L), X.dan, 0); heads.recep1 = hd;
    if (dp) { pillow(c, X.dan + dp.x, dp.y, 'hair', 0, dp.flip, dp.s); }
    if (L === 'o4' && t > ev('o4', 'bill') && t < ev('o4', 'card')) sweat(c, hd, t, clamp((t - ev('o4', 'bill')) / 0.3)); }
  if (who.includes('maids')) maids(c, t, L);
  whirl(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (L === 'o3' && heads.her && speaking('o3_h', t) && t > SP.o3_h.t + 1.0) { const g = G.her; for (let i = 0; i < 3; i++) sparkle(c, X.her + g.sw * 1.7 + [-60, 60, 0][i], g.ySh + 60 + [-30, -10, -120][i], 26, eBack(clamp((t - SP.o3_h.t - 1.0 - i * 0.1) / 0.25), 2)); }
  if (L === 'o1' && t > ev('o1', 'wrap') + 0.7 && t < ev('o1', 'wrap') + 1.7) for (let i = 0; i < 4; i++) sparkle(c, PIL.x - 40 + [-120, -150, -60, 20][i], PIL.y + [-70, 40, -100, 70][i], 22, eBack(clamp((t - ev('o1', 'wrap') - 0.7 - i * 0.08) / 0.25), 2) * (1 - clamp((t - ev('o1', 'wrap') - 1.4) / 0.3)));
  return heads; }
function worldSuite(c, t, L, tag) { const who = DRAW[tag] || ['her', 'recep1', 'cat'], heads = {};
  c.drawImage(BGS, BX0, BY0, BW, BH); portrait(c, 510, -1950, 'cat');
  pillow(c, 250, -760, 'clean'); pillow(c, 760, -760, 'clean'); swan(c, 510, -520, 1);
  if (who.includes('cat')) cat(c, t, XS.cat, -255, 0.56);
  wardDoors(c, t, L);
  if (who.includes('recep1')) heads.recep1 = K.put(c, DAN, danSuite(t), XS.dan, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herSuite(t), XS.her, 0);
  hairCloud(c, t);
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const floorAt = (z, sy = 1700) => -(sy - 960) / z;
const SH = { COVER: S(40, floorAt(0.5), 0.5, 'cover'), WIDE: S(40, floorAt(0.5), 0.5, 'wide'),
  TWO: S(110, floorAt(0.53, 1680), 0.53, 'two'),
  HER: S(X.her + 60, fy(HY('her'), 1.0, 860), 1.0, 'her'), HER_CU: S(X.her + 50, fy(HY('her'), 1.3, 920), 1.3, 'her'),
  HERWIN: S(-1080, fy(HY('her'), 0.72, 1020), 0.72, 'herwin'),
  REC: S(X.dan - 60, fy(HY('dan'), 0.95, 820), 0.95, 'rec'), REC_CU: S(X.dan - 40, fy(HY('dan'), 1.2, 900), 1.2, 'rec'), RECW: S(X.dan - 230, fy(HY('dan'), 0.82, 780), 0.82, 'recw'),
  PILLOW: S(PIL.x - 10, PIL.y + 60, 2.1, 'pillow'), BEDV: S(-60, -1300, 0.6, 'bedv'),
  SUITE: S(-40, floorAt(0.42), 0.42, 'suite'), CAT: S(XS.cat, -560, 1.35, 'cat'), RECS: S(XS.dan - 60, fy(HY('dan'), 0.95, 820), 0.95, 'recs'), HERS: S(XS.her - 120, fy(HY('her'), 0.95, 860), 0.95, 'hers'),
  CARD: U('card', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return f(SH.COVER); if (t < hev('pillow')) return f(SH.HER_CU); if (t < hev('wide') - 0.02) return f(SH.BEDV); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_r.t - 0.1) return f(SH.HER); if (t < e('wrap')) return f(SH.REC); if (t < e('face')) return f(SH.PILLOW); return f(SH.HER_CU); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_r.t - 0.1) return f(SH.HER); if (t < e('face')) return f(SH.RECW); return f(SH.HER_CU); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_r.t - 0.1) return f(SH.HER); if (t < e('maids') - 0.02) return f(SH.REC); if (t < e('fresh') + 0.7) return f(SH.WIDE); if (t < SP.o3_tip.t - 0.1) return f(SH.PILLOW); return f(SH.HER); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('sea')) return f(SH.HER); if (t < e('souv')) return f(SH.HERWIN); if (t < e('bill')) return f(SH.HER_CU); if (t < e('gulp')) return f(SH.TWO); if (t < e('promise')) return f(SH.REC); if (t < endOf('o4_r') + 0.05) return f(SH.REC_CU); return f(SH.CARD); }
  if (L === 'end') { if (t < e('cat')) return f(SH.SUITE); if (t < SP.end_r.t - 0.1) return f(SH.CAT); if (t < e('owns')) return f(SH.RECS); if (t < e('shake')) return f(SH.SUITE); if (t < e('moral') - 0.05) return f(SH.CAT); if (t < e('kota')) return f(SH.SUITE); return f(SH.HERS); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = L === 'end' ? worldSuite(c, t, L, tag) : worldRoom(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- insert on a solid backdrop: the gold key card
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
function cardView(c, t) { backdrop(c, t, '#7A1E3A', '#3A0E1E'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'card' });
  const u = t - endOf('o4_r'), k = eBack(clamp((u + 0.05) / 0.3), 1.6);
  c.save(); c.translate(540, 900); c.rotate(-0.08 + Math.sin(t * 2) * 0.02); c.scale(4.2 * k, 4.2 * k); keyCard(c, 1); c.restore();
  for (let i = 0; i < 6; i++) { const a = t * 1.5 + i * TAU / 6; sparkle(c, 540 + Math.cos(a) * 430, 900 + Math.sin(a) * 380, 40, k * (0.6 + 0.4 * Math.abs(Math.sin(t * 5 + i)))); } }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // the rubric label, small, on the plate's top edge
  c.save(); c.translate(0, -165); c.rotate(0.03); UI.font(c, 'Unb9', 30); const rw = c.measureText('ПОЛЕЗНОЕ').width + 60; c.fillStyle = '#3C8FE0'; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, -rw / 2, -26, rw, 52, 26); c.fill(); c.stroke(); c.fillStyle = C.white; c.fillText('ПОЛЕЗНОЕ', 0, 2); c.restore();
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 110, w: 980, h: 355, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then the comment question (ask) big above the buttons
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, askT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Daniel with the gold key card (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gd = G.dan; K.put(c, DAN, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 1.7, gd.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: down(gd, 1), items: { L: cardItem }, front: danState(0, 'hook').front }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.2, look: 0.4, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 60 + Math.sin(t * 8) * 30, { planar: true }), armR: hipHand(g, 1), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  // the question; on the ask line it flips to the comment question
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - eIn(P(t, askT - 0.15, askT))); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = eBack(P(t, askT, askT + 0.3), 2.2); if (qa > 0) { const pu = 1 + 0.03 * Math.sin(t * 6); c.save(); c.translate(540, 290); c.scale(qa * pu, qa * pu); c.rotate(-0.02);
    textFit(c, 'Unb9', 74, 'ТЫ БЫ ПОЖАЛОВАЛАСЬ', 900); strokeText(c, 'ТЫ БЫ ПОЖАЛОВАЛАСЬ', 0, -62, C.oliveD, C.white, 14); textFit(c, 'Unb9', 74, 'ИЛИ ПРОМОЛЧАЛА?', 900); strokeText(c, 'ИЛИ ПРОМОЛЧАЛА?', 0, 42, C.pink, C.white, 14); c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: 70, y: 180, w: 940, h: 220, k: qa, id: 'ask' }); }
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
  const subT = Math.min(svT + 0.7, sp.t + sp.d - 1.0), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (t < askT - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big at the top instead of a caption
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { cardView(c, t); heads = { her: OFFL, recep1: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const names = { recep1: ['DANIEL', '#7A1E3A'] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_r: -0.2, o1_h: -0.22, o1_r: -0.2, o2_h: -0.22, o2_r: -0.2, o3_h: -0.22, o3_r: -0.2, o4_h: -0.15, o4_r: -0.2, end_r: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('hairhotel', NF, renderFrame);
