// ENGLISH DETECTIVE #1 — WHO STOLE $1,000,000? (1080x1920, hard_cut): node detective1.js start end out.mp4 | --png=f1,f2
// Script: ../detective/EP1_SCRIPT.md (v2). Timeline: timeline_long.py (EP["detective1"].seq). Built on the pizzas/trial renderers:
// one world with five rooms far apart (vault, security post, interrogation room, manager's office, line-up wall),
// still shots with hard cuts, object inserts on a dark backdrop, bubbles with translation, three phrase plates.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, mix, shade, rgba, paint, rr, softShadow, human, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/detective1/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SC, SP, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = UI.W, HH = UI.H, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (sid, k) => { const v = ((SC[sid] || {}).ev || {})[k]; return v === undefined ? 1e9 : v; };
const inS = (t, a, b) => t >= a && t < b;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast: existing designs, new costumes (detective = the heroine)
const DET = { ...BASE.her_london, top: { type: 'blazer', col: '#C8A676', shirt: '#FFFDF8', tie: '#7A4A2A' }, bottom: { type: 'trousers', col: '#4A3F38' }, shoes: { col: '#3A2A20', acc: null } };
const GUARD = { ...BASE.mike, headband: null, beard: '#3A2A1E', cap: { col: '#22305A' }, build: { ...BASE.mike.build, belly: 0.35 },
  top: { type: 'polo', col: '#2B3A67', col2: '#1E2A4E', text: 'SECURITY', textSize: 30, textCol: '#F2C14E' }, bottom: { type: 'trousers', col: '#22252E' }, shoes: { col: '#1E2128', acc: null } };
const CLEANER = { ...BASE.del, h: 1640, build: { shoulder: 1.0, hip: 1.0, belly: 0.1, arm: 1.0 }, cap: { col: '#4E6644' },
  top: { type: 'tee', col: '#7E9077' }, bottom: { type: 'trousers', col: '#6E8067' }, shoes: { col: '#3A2A20', acc: null } };
const MGR = { ...BASE.oliver, hair: { style: 'quiff', col: '#2A1E16' }, brow: '#2A1E16', top: { type: 'blazer', col: '#3A3F4B', shirt: '#F7F9FC', tie: '#C9A24A' }, bottom: { type: 'trousers', col: '#3A3F4B' } };
const CFG = { her: DET, guard: GUARD, cleaner: CLEANER, manager: MGR };
const G = {}; for (const [k, v] of Object.entries(CFG)) G[k] = geom(v);
const NAMES = { guard: ['GUARD', '#2B3A67'], cleaner: ['CLEANER', '#4E6644'], manager: ['MANAGER', '#8A2E4A'] };

// ---------------- world: rooms 10 000 units apart, floor y = 0
const XV = 0, XS = 10000, XI = 20000, XO = 30000, XL = 40000;
const POS = {
  V: { her: XV - 150 },
  S: { her: XS - 900, guard: XS + 380 },
  I: { her: XI - 950, cleaner: XI + 520 },
  O: { her: XO - 760, manager: XO + 260 },
  L: { guard: XL - 650, cleaner: XL, manager: XL + 650, her: XL - 1400 },
};
const SEAT = 330;   // the manager sits behind his desk: drawn lower, legs hidden by the desk
const headW = (who, x, fy = 0) => ({ x, y: fy + G[who].headY, hh: G[who].hh });
const roomOf = x => ['V', 'S', 'I', 'O', 'L'][clamp(Math.round(x / 10000), 0, 4)];

// ---------------- room backgrounds (prerendered once at half size, softly blurred)
const BX0 = -2000, BY0 = -4200, BW = 4000, BH = 5000, BS = 0.5;
function floor(c, col1, col2, lines = 'rgba(0,0,0,.14)') { const fg = c.createLinearGradient(0, 0, 0, 800); fg.addColorStop(0, col1); fg.addColorStop(1, col2); c.fillStyle = fg; c.fillRect(BX0, 0, BW, 800); c.strokeStyle = lines; c.lineWidth = 4; for (let x = BX0; x < BX0 + BW; x += 200) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x * 1.25, 800); c.stroke(); } c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(BX0, -36, BW, 36); }
function wall(c, top, bot) { const g = c.createLinearGradient(0, BY0, 0, 0); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(BX0, BY0, BW, -BY0); }
function drawRoom(c, k) {
  if (k === 'V') {   // vault: steel wall, rivets, the big round door swung open, empty shelves inside
    wall(c, '#3A4252', '#262C38'); c.fillStyle = 'rgba(255,255,255,.05)'; for (let x = BX0; x < BX0 + BW; x += 400) c.fillRect(x, BY0, 8, -BY0);
    c.fillStyle = '#5A6274'; for (let x = BX0 + 200; x < BX0 + BW; x += 400) for (let y = BY0 + 200; y < -100; y += 400) { c.beginPath(); c.arc(x, y, 14, 0, TAU); c.fill(); }
    c.save(); c.translate(700, -1500); c.fillStyle = '#15181F'; c.beginPath(); c.arc(0, 0, 860, 0, TAU); c.fill();
    c.fillStyle = '#2A2E38'; for (let i = 0; i < 4; i++) c.fillRect(-620, -520 + i * 330, 1240, 40); c.fillStyle = '#C9A24A'; c.font = '90px Unb9'; c.textAlign = 'center'; c.fillText('EMPTY', 0, 40); c.restore();
    c.save(); c.translate(-260, -1500); c.scale(0.35, 1); c.fillStyle = '#8A93A6'; c.beginPath(); c.arc(0, 0, 860, 0, TAU); c.fill(); c.fillStyle = '#6E778A'; c.beginPath(); c.arc(0, 0, 700, 0, TAU); c.fill(); c.restore();
    floor(c, '#4A5262', '#30363F');
  }
  if (k === 'S') {   // security post: navy wall with a wall of monitors
    wall(c, '#26304A', '#1C2438'); c.fillStyle = '#121722'; rr(c, -500, -3100, 1600, 1500, 30); c.fill();
    for (let i = 0; i < 6; i++) { const x = -440 + (i % 3) * 510, y = -3040 + Math.floor(i / 3) * 720; const g = c.createLinearGradient(0, y, 0, y + 640); g.addColorStop(0, '#5E86A8'); g.addColorStop(1, '#2E4A66'); c.fillStyle = g; rr(c, x, y, 460, 640, 16); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; for (let s = 0; s < 640; s += 24) c.fillRect(x, y + s, 460, 6); c.fillStyle = '#C9E2F2'; c.font = '34px Unb9'; c.textAlign = 'left'; c.fillText('CAM ' + (i + 1), x + 24, y + 50); }
    c.fillStyle = '#3A4562'; rr(c, -1700, -2500, 700, 400, 20); c.fill(); c.fillStyle = '#F2C14E'; c.font = '64px Unb9'; c.textAlign = 'center'; c.fillText('SECURITY', -1350, -2280);
    floor(c, '#3A4256', '#262C3C');
  }
  if (k === 'I') {   // interrogation room: grey-green wall, one-way mirror
    wall(c, '#55625A', '#3E4A44'); c.fillStyle = '#1E2622'; rr(c, -1500, -2700, 1600, 1100, 14); c.fill(); c.fillStyle = 'rgba(160,200,190,.12)'; c.beginPath(); c.moveTo(-1400, -2650); c.lineTo(-900, -2650); c.lineTo(-1300, -1650); c.lineTo(-1500, -1650); c.fill();
    c.strokeStyle = '#7A8A80'; c.lineWidth = 20; rr(c, -1500, -2700, 1600, 1100, 14); c.stroke();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(BX0, -900, BW, 900); c.fillStyle = '#6E7A70'; c.fillRect(BX0, -930, BW, 30);
    c.fillStyle = '#2B2F3A'; c.fillRect(-10, BY0, 20, 1300);   // lamp cord
    floor(c, '#4A524C', '#333A35');
  }
  if (k === 'O') {   // manager's office: warm wall, night window, steel VAULT door behind the desk
    wall(c, '#D9C7A6', '#C7B28E'); const wg = c.createLinearGradient(0, -900, 0, 0); wg.addColorStop(0, '#7A5232'); wg.addColorStop(1, '#5E3E26'); c.fillStyle = wg; c.fillRect(BX0, -900, BW, 900); c.fillStyle = '#E8DCC8'; c.fillRect(BX0, -930, BW, 34);
    c.fillStyle = '#5E3E26'; rr(c, -1800, -3100, 1100, 1500, 20); c.fill(); const ng = c.createLinearGradient(0, -3050, 0, -1650); ng.addColorStop(0, '#1A2340'); ng.addColorStop(1, '#3A3560'); c.fillStyle = ng; rr(c, -1750, -3050, 1000, 1400, 14); c.fill();
    c.fillStyle = 'rgba(242,193,78,.75)'; for (let i = 0; i < 40; i++) { const x = -1720 + hash(i) * 940, y = -2200 + hash(i + 50) * 520; c.fillRect(x, y, 26, 34); } c.fillStyle = '#1C1830'; for (let i = 0; i < 6; i++) c.fillRect(-1750 + i * 170, -1650 - 300 - hash(i + 9) * 500, 140, 1000);
    c.fillStyle = '#5E3E26'; c.fillRect(-1262, -3050, 24, 1400); c.fillRect(-1750, -2370, 1000, 24);
    // VAULT door: steel, handle wheel, sign
    c.fillStyle = '#6E7686'; rr(c, 150, -2550, 900, 2550, 20); c.fill(); c.fillStyle = '#8A93A6'; rr(c, 210, -2490, 780, 2490, 14); c.fill();
    c.strokeStyle = '#4A5262'; c.lineWidth = 22; c.beginPath(); c.arc(860, -1300, 110, 0, TAU); c.stroke(); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI; c.beginPath(); c.moveTo(860 + Math.cos(a) * 110, -1300 + Math.sin(a) * 110); c.lineTo(860 - Math.cos(a) * 110, -1300 - Math.sin(a) * 110); c.stroke(); }
    c.fillStyle = '#E0474C'; rr(c, 330, -2440, 540, 170, 16); c.fill(); c.fillStyle = '#FFFFFF'; c.font = '104px Unb9'; c.textAlign = 'center'; c.fillText('VAULT', 600, -2318);
    c.fillStyle = '#C9A06A'; c.fillRect(-500, -2650, 560, 440); c.fillStyle = '#2E5E4E'; c.fillRect(-470, -2620, 500, 380); c.fillStyle = '#F2C14E'; c.font = '50px Unb9'; c.fillText('BEST', -220, -2470); c.fillText('BOSS', -220, -2400);
    floor(c, '#8A6A4A', '#6E523A');
  }
  if (k === 'L') {   // line-up wall: height chart in feet, plaques A B C
    wall(c, '#D8D2C2', '#C8C0AC'); c.strokeStyle = '#3E3A34'; c.fillStyle = '#3E3A34'; c.font = '56px Unb9'; c.textAlign = 'left';
    for (let i = 0; i <= 26; i++) { const y = -i * 96; c.lineWidth = i % 4 === 0 ? 8 : 3; c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); if (i % 4 === 0 && i) { c.fillText((i / 4 + 0) + "'", -1950, y + 20); c.fillText((i / 4) + "'", 1830, y + 20); } }
    for (const [x, l] of [[-650, 'A'], [0, 'B'], [650, 'C']]) { c.fillStyle = '#2B2F3A'; rr(c, x - 110, -2330, 220, 200, 20); c.fill(); c.fillStyle = '#F2C14E'; c.font = '150px Unb9'; c.textAlign = 'center'; c.fillText(l, x, -2175); }
    floor(c, '#7A7468', '#5E584E');
  }
}
const BG = {}; for (const k of ['V', 'S', 'I', 'O', 'L']) { const s = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = s.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); drawRoom(c, k); const b = createCanvas(s.width, s.height); const bc = b.getContext('2d'); bc.filter = 'blur(2.2px)'; bc.drawImage(s, 0, 0); BG[k] = b; }

// ---------------- props (world units)
const mopItem = (lift = 0) => (ctx) => { ctx.save(); ctx.translate(0, lift); ctx.fillStyle = '#9C6238'; ctx.fillRect(-9, -520, 18, 1180); ctx.restore(); ctx.save(); ctx.translate(0, 660 + lift); paint(ctx, q => { q.m(-110, -40); q.l(110, -40); q.l(130, 60); q.l(-130, 60); q.z(); }, '#E8E2D0', { sd: 6, hd: 3, lw: 3, inner: k => { k.strokeStyle = '#C9C2AE'; k.lineWidth = 6; for (let i = -100; i <= 100; i += 25) { k.beginPath(); k.moveTo(i, -30); k.lineTo(i * 1.2, 60); k.stroke(); } } }); ctx.restore(); };
const mugItem = (ctx) => { paint(ctx, q => { q.m(-34, -70); q.l(34, -70); q.l(30, 20); q.l(-30, 20); q.z(); }, '#FFFDF8', { sd: 4, hd: 2, lw: 3, inner: k => { k.fillStyle = '#E0474C'; k.font = '20px Unb9'; k.textAlign = 'center'; k.fillText('BOSS', 0, -20); } }); ctx.strokeStyle = '#3E471E'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(38, -28, 20, -1.3, 1.3); ctx.stroke(); };
const donutItem = (ctx) => { paint(ctx, q => q.e(0, -30, 52, 40), '#E2A65A', { sd: 4, hd: 2, lw: 3, inner: k => { k.fillStyle = '#F27AAE'; k.beginPath(); k.ellipse(0, -38, 44, 30, 0, 0, TAU); k.fill(); k.fillStyle = '#5E3E26'; k.beginPath(); k.ellipse(0, -36, 14, 10, 0, 0, TAU); k.fill(); } }); };
const noteItem = (ctx) => { ctx.save(); ctx.rotate(-0.2); paint(ctx, q => { q.m(-46, -130); q.l(46, -130); q.l(46, 0); q.l(-46, 0); q.z(); }, '#FFF3A8', { sd: 3, hd: 2, lw: 3 }); ctx.fillStyle = '#7A4A2A'; ctx.fillRect(-46, -136, 92, 16); ctx.restore(); };
const bagItem = (ctx) => { ctx.strokeStyle = '#1E2A4E'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(0, -40, 60, 0); ctx.stroke(); ctx.save(); ctx.translate(0, 160); gymBag(ctx, 0, 0, 0.62, 0); ctx.restore(); };
// gym bag: closed (open = 0) .. unzipped with cash (open = 1)
function gymBag(c, x, y, s, open, t = 0) { c.save(); c.translate(x, y); c.scale(s, s);
  if (open > 0) { c.save(); c.beginPath(); c.rect(-260, -260, 520, 140); c.clip(); for (let i = 0; i < 7; i++) cash(c, -200 + i * 66, -130 - open * (60 + (i % 3) * 30), 0.7, (i % 2 ? -0.2 : 0.15)); c.restore(); }
  paint(c, q => { q.m(-250, -130); q.q(-280, 0, -240, 120); q.l(240, 120); q.q(280, 0, 250, -130); q.q(0, -170, -250, -130); q.z(); }, '#2B3A67', { sd: 14, hd: 8, lw: 4, inner: k => { k.fillStyle = '#FFFDF8'; k.fillRect(-260, -10, 520, 34); } });
  for (const s2 of [-1, 1]) { paint(c, q => q.e(s2 * 255, -10, 30, 70), '#1E2A4E', { sd: 4, hd: 2, lw: 3 }); }
  c.strokeStyle = '#C9CED6'; c.lineWidth = 8; c.setLineDash([12, 8]); c.beginPath(); c.moveTo(-230, -140); c.quadraticCurveTo(0, -176, 230, -140); c.stroke(); c.setLineDash([]);
  if (open > 0) { c.fillStyle = '#1A1F33'; c.beginPath(); c.moveTo(-230 * open, -142); c.quadraticCurveTo(0, -176 + 60 * open, 230 * open, -142); c.quadraticCurveTo(0, -150 - 50 * open, -230 * open, -142); c.fill(); }
  c.fillStyle = '#C9CED6'; rr(c, lerp(-230, 210, open) - 14, -160, 28, 40, 8); c.fill();
  c.restore(); }
function cash(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); paint(c, q => { q.m(-120, -60); q.l(120, -60); q.l(120, 60); q.l(-120, 60); q.z(); }, '#7FB069', { sd: 6, hd: 3, lw: 3, inner: k => { k.strokeStyle = '#4E7A3A'; k.lineWidth = 4; k.strokeRect(-100, -44, 200, 88); k.fillStyle = '#4E7A3A'; k.font = '54px Unb9'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('$', 0, 4); } }); c.fillStyle = '#F2C14E'; c.fillRect(-26, -62, 52, 124); c.restore(); }
// overlays drawn on top of a character (st.front / st.afterTorso get the head position)
const fedora = (g) => (ctx, o) => { const x = o.head.x, y = o.head.y - g.hh * 0.62, hw = g.hw; ctx.save(); ctx.translate(x, y);
  paint(ctx, q => { q.m(-hw * 0.82, 0); q.q(-hw * 0.86, -hw * 0.95, 0, -hw * 0.98); q.q(hw * 0.86, -hw * 0.95, hw * 0.82, 0); q.z(); }, '#6A4630', { sd: 10, hd: 6, lw: 3, inner: k => { k.fillStyle = '#3A2418'; k.fillRect(-hw, -hw * 0.3, hw * 2, hw * 0.24); k.fillStyle = 'rgba(0,0,0,.18)'; k.beginPath(); k.ellipse(0, -hw * 0.98, hw * 0.3, hw * 0.1, 0, 0, TAU); k.fill(); } });
  paint(ctx, q => q.e(0, 0, hw * 1.45, hw * 0.2), '#5A3A24', { sd: 6, hd: 3, lw: 3 }); ctx.restore(); };
const headphones = (g, t, swing = 1) => (ctx, o) => { const x = o.head.x, ny = o.head.y + g.hh * 1.25, hw = g.hw; ctx.save();
  ctx.strokeStyle = '#2B2F3A'; ctx.lineWidth = 14; ctx.beginPath(); ctx.ellipse(x, ny - 6, hw * 1.0, hw * 0.42, 0, 0.05, Math.PI - 0.05); ctx.stroke();
  for (const s of [-1, 1]) paint(ctx, q => q.e(x + s * hw * 1.0, ny - 24, hw * 0.34, hw * 0.44), '#3A3F4B', { sd: 6, hd: 4, lw: 3, inner: k => { k.fillStyle = '#E0474C'; k.beginPath(); k.arc(x + s * hw * 1.0, ny - 24, hw * 0.12, 0, TAU); k.fill(); } });
  // the cable hangs from the left cup and ends in a plug that is plugged into nothing
  const a = Math.sin(t * 2.3) * 0.12 * swing, cx = x - hw * 1.05, cy = ny + 10, L = g.hh * 2.7, ex = cx + Math.sin(a) * L, ey = cy + Math.cos(a) * L;
  ctx.strokeStyle = '#1A1D24'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx - 30, cy + L * 0.55, ex, ey); ctx.stroke();
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(-a); ctx.scale(1.5, 1.5); ctx.fillStyle = '#2B2F3A'; rr(ctx, -12, 0, 24, 40, 6); ctx.fill(); ctx.fillStyle = '#C9CED6'; ctx.fillRect(-5, 40, 10, 34); ctx.fillStyle = '#2B2F3A'; ctx.fillRect(-5, 52, 10, 4); ctx.fillRect(-5, 62, 10, 4); ctx.restore();
  ctx.restore(); };
const overalls = (g) => (ctx, o) => { const sw = o.sw, y = o.ySh; ctx.save(); paint(ctx, q => { q.m(-sw * 0.5, y + 150); q.l(sw * 0.5, y + 150); q.l(sw * 0.55, y + 420); q.l(-sw * 0.55, y + 420); q.z(); }, '#5E7056', { sd: 6, hd: 3, lw: 3, inner: k => { k.fillStyle = '#4E6044'; k.fillRect(-sw * 0.25, y + 200, sw * 0.5, 90); } });
  ctx.strokeStyle = '#5E7056'; ctx.lineWidth = 26; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * sw * 0.42, y + 160); ctx.lineTo(s * sw * 0.6, y + 10); ctx.stroke(); } ctx.fillStyle = '#F2C14E'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * sw * 0.42, y + 165, 12, 0, TAU); ctx.fill(); } ctx.restore(); };
function sweat(c, hd, k, side = 1) { if (k <= 0) return; for (const [dx, dy, s] of [[0.78, -0.5, 1], [0.95, -0.1, 0.7]]) { const x = hd.x + side * hd.hh * dx, y = hd.y + hd.hh * dy + (1 - k) * -24; c.save(); c.globalAlpha = k; c.translate(x, y); c.scale(s, s); c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(24, 0, 0, 16); c.quadraticCurveTo(-24, 0, 0, -36); c.fill(); c.stroke(); c.restore(); } }
function desk(c, x0, x1, top, col = '#7A5232') { paint(c, q => { q.m(x0, top); q.l(x1, top); q.l(x1, 0); q.l(x0, 0); q.z(); }, col, { sd: 8, hd: 4, lw: 3, inner: k => { k.strokeStyle = 'rgba(0,0,0,.2)'; k.lineWidth = 6; k.strokeRect(x0 + 40, top + 80, x1 - x0 - 80, -top - 120); } }); c.fillStyle = shade(col, 0.75); c.fillRect(x0 - 24, top - 34, x1 - x0 + 48, 40); c.fillStyle = 'rgba(255,240,210,.18)'; c.fillRect(x0 - 24, top - 34, x1 - x0 + 48, 10); }
function console_(c, x0, x1, top) { desk(c, x0, x1, top, '#3A4562'); for (let i = 0; i < 9; i++) { c.fillStyle = ['#E0474C', '#4CAF6A', '#F2C14E'][i % 3]; c.beginPath(); c.arc(x0 + 120 + i * 90, top - 14, 12, 0, TAU); c.fill(); } }
function table(c, x0, x1, top) { c.fillStyle = '#5A6070'; c.fillRect(x0 + 40, top, 26, -top); c.fillRect(x1 - 66, top, 26, -top); paint(c, q => { q.m(x0, top - 40); q.l(x1, top - 40); q.l(x1, top + 10); q.l(x0, top + 10); q.z(); }, '#8A93A6', { sd: 4, hd: 2, lw: 3 }); }
function lamp(c, x, y, k) { c.save(); const lg = c.createRadialGradient(x, y + 600, 40, x, y + 600, 1100); lg.addColorStop(0, `rgba(255,236,170,${0.32 * k})`); lg.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(x - 120, y + 60); c.lineTo(x + 120, y + 60); c.lineTo(x + 1000, y + 1700); c.lineTo(x - 1000, y + 1700); c.fill();
  paint(c, q => { q.m(-140, 70); q.q(0, -110, 140, 70); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#FFF2C0'; c.beginPath(); c.ellipse(x, y + 66, 110, 20, 0, 0, TAU); c.fill(); c.restore(); }
function bucket(c, x) { paint(c, q => { q.m(x - 120, -260); q.l(x + 120, -260); q.l(x + 95, 0); q.l(x - 95, 0); q.z(); }, '#F2C14E', { sd: 8, hd: 4, lw: 3 }); c.strokeStyle = '#3E471E'; c.lineWidth = 8; c.beginPath(); c.arc(x, -260, 110, Math.PI, TAU); c.stroke(); c.fillStyle = '#9CC6DE'; c.beginPath(); c.ellipse(x, -258, 112, 20, 0, 0, TAU); c.fill(); }
function cuffs(c, x, y) { c.save(); c.translate(x, y); c.strokeStyle = '#C9CED6'; c.lineWidth = 12; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 48, 0, 34, 0, TAU); c.stroke(); } c.lineWidth = 8; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.stroke(); c.restore(); }

// ---------------- character states
const lineOf = (who, t) => TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d);
function gest(st, g, who, t, side, base, amp = 1) { const sp = lineOf(who, t); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.45 + Math.sin(u) * 20 * amp), g.ySh + base + Math.cos(u) * 22 * amp); } }
const L_ = sc => sc.id;
function detState(t, L, room) { const g = G.her, st = { t, talk: talk('her', t), mood: 'skeptical', turn: 0.35, look: 0.8, front: fedora(g),
    armL: reach(g, -1, -g.sw * 0.2, g.ySh + 300), armR: reach(g, 1, g.sw * 0.9, g.ySh + 400), items: { L: noteItem } };
  gest(st, g, 'her', t, 1, 200);
  if (room === 'V') { const tu = ev('hook', 'turn'); st.mood = t < tu ? 'worried' : 'angry'; st.turn = t < tu ? -0.9 : 0; st.look = t < tu ? -1 : 0; if (t < tu) st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 400); }
  if (L === 'R1' && speaking('r1_d1', t, 0.1, 0.4)) { st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 3.2, g.ySh + 60); }
  if (L === 'R1' && speaking('r1_d2', t, 0.1, 0.3)) st.mood = 'angry';
  if (L === 'R1' && t > endOf('r1_d2') + 0.3) { st.mood = 'surprised'; }
  if (L === 'R2' && t < SP.r2_d2.t) { st.mood = 'smug'; st.look = 0.4; st.turn = 0.1; }
  if (L === 'R2' && t >= SP.r2_d2.t) { st.mood = 'skeptical'; st.look = 1; }
  if (L === 'END') { st.mood = 'happy'; st.turn = 0.2; st.look = 0.4; st.armL = reach(g, -1, g.sw * 0.25, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.25, g.ySh + 250); st.items = {}; }
  return st; }
function guardState(t, L, room) { const g = G.guard, st = { t, talk: talk('guard', t), mood: 'neutral', turn: -0.35, look: -0.7,
    armL: reach(g, -1, -g.sw * 1.0, g.ySh + 420), armR: reach(g, 1, g.sw * 0.8, g.ySh + 300), items: {} };
  if (room === 'S') { st.items = { R: donutItem }; const b = endOf('ga_g2') + 0.05; if (inS(t, b, b + 0.6)) { st.armR = reach(g, 1, g.hw * 0.35, g.headY + g.hh * 0.7); st.talk = 0.3 + 0.3 * Math.abs(Math.sin(t * 14)); st.mood = 'happy'; st.squint = true; } else if (!lineOf('guard', t)) st.mood = 'bored'; }
  if (room === 'L') { st.turn = 0; st.look = 0; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 420); if (L === 'R2' && t > ev('R2', 'bag')) st.mood = 'shock'; }
  if (L === 'END') { st.mood = 'angry'; st.turn = 0.4; st.look = 0.8; st.armL = reach(g, -1, g.sw * 0.6, g.ySh + 380); st.armR = reach(g, 1, 400, G.manager.ySh + 470 - (G.manager.h - g.h) * 0); st.items = {}; }
  return st; }
function cleanerState(t, L, room) { const g = G.cleaner, st = { t, talk: talk('cleaner', t), mood: 'worried', turn: -0.3, look: -0.7, afterTorso: overalls(g),
    armL: reach(g, -1, -g.sw * 0.9, g.ySh + 420), armR: reach(g, 1, g.sw * 1.1, g.ySh + 260), items: { R: mopItem(0) } };
  if (room === 'I' && speaking('cl_c1', t, 0, 0.3)) { const u = Math.sin(t * 11); st.armR = reach(g, 1, g.sw * (1.1 + u * 0.25), g.ySh + 260); }
  if (room === 'I' && t > SP.cl_c2.t) st.mood = speaking('cl_c2', t) ? 'worried' : 'shock';
  if (room === 'L') { st.turn = 0; st.look = 0; }
  if (L === 'R1') { st.turn = -0.3; st.look = -0.8; st.mood = t < SP.r1_c1.t ? 'shock' : 'worried';
    if (t >= SP.r1_c1.t - 0.1) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.3, g.headY - 40); st.armR = reach(g, 1, g.sw * 1.3, g.headY - 40); if (t > ev('R1', 'drop') - 0.05) st.items = {}; } }
  if (L === 'R2') { st.mood = 'surprised'; st.items = {}; st.turn = 0.2; st.look = 0.8; }
  if (L === 'END') { st.mood = 'tired'; st.squint = true; st.tilt = 0.18; st.talk = 0; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 200); st.items = { R: mopItem(-200) }; st.armL = reach(g, -1, g.sw * 0.4, g.ySh + 240); }
  return st; }
function managerState(t, L, room) { const g = G.manager, st = { t, talk: talk('manager', t), mood: 'smug', turn: -0.3, look: -0.7, front: headphones(g, t),
    armL: reach(g, -1, -g.sw * 1.0, g.ySh + 420), armR: reach(g, 1, g.sw * 0.6, g.ySh + 280), items: { R: mugItem } };
  if (room === 'O') { st.legs = false; st.armL = reach(g, -1, -g.sw * 1.1, g.ySh + 330);
    if (speaking('mg_m2', t, 0, 0) && t > SP.mg_m2.t + 1.2) st.armR = reach(g, 1, g.hw * 1.1, g.headY + g.hh * 0.9);   // taps the headphones
    const s = ev('MG', 'sip'); if (inS(t, s, s + 1.3)) { st.armR = reach(g, 1, g.hw * 0.4, g.headY + g.hh * 0.85); st.squint = true; st.mood = 'happy'; st.headFirst = true; } }
  if (room === 'L') { st.turn = 0; st.look = 0; st.items = { R: mugItem, L: L === 'R2' && t > ev('R2', 'plug') ? null : bagItem }; }
  if (L === 'R2') { const f = ev('R2', 'freeze'); st.look = -0.8; st.turn = -0.3;
    if (t > f) { st.mood = 'surprised'; st.armR = reach(g, 1, g.hw * 0.4, g.headY + g.hh * 0.85); st.headFirst = true; }
    if (t > SP.r2_m1.t - 0.1) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 260); }
    if (t > SP.r2_m2.t - 0.2) { st.mood = 'sad'; st.look = 0.2; } }
  if (L === 'END') { st.mood = 'sad'; st.turn = 0; st.look = 0.3; st.items = {}; st.armL = reach(g, -1, -g.sw * 0.12, g.ySh + 450); st.armR = reach(g, 1, g.sw * 0.12, g.ySh + 450); }
  return st; }

// ---------------- world
function put(c, cfg, st, x, y = 0) { c.save(); c.translate(x, y); const r = human(c, cfg, st); c.restore(); return { x: x + r.head.x, y: y + r.head.y, hh: r.hh }; }
function world(c, t, L, room, solo) { const heads = {}, show = who => !solo || solo === who, p = POS[room];
  c.drawImage(BG[room], (room === 'V' ? XV : room === 'S' ? XS : room === 'I' ? XI : room === 'O' ? XO : XL) + BX0, BY0, BW, BH);
  const X = { V: XV, S: XS, I: XI, O: XO, L: XL }[room];
  if (room === 'V') { heads.her = put(c, DET, detState(t, L, 'V'), p.her); siren(c, X + 900, -3300, t); }
  if (room === 'S') { heads.her = show('her') ? put(c, DET, detState(t, L, 'S'), p.her) : headW('her', p.her);
    heads.guard = show('guard') ? put(c, GUARD, guardState(t, L, 'S'), p.guard) : headW('guard', p.guard); console_(c, XS - 250, XS + 1300, -700); }
  if (room === 'I') { lamp(c, XI - 150, -2950, 1); table(c, XI - 600, XI + 250, -760); bucket(c, XI + 980);
    heads.her = show('her') ? put(c, DET, detState(t, L, 'I'), p.her) : headW('her', p.her);
    heads.cleaner = show('cleaner') ? put(c, CLEANER, cleanerState(t, L, 'I'), p.cleaner) : headW('cleaner', p.cleaner); }
  if (room === 'O') { heads.her = show('her') ? put(c, DET, detState(t, L, 'O'), p.her) : headW('her', p.her);
    heads.manager = show('manager') ? put(c, MGR, managerState(t, L, 'O'), p.manager, SEAT) : headW('manager', p.manager, SEAT);
    desk(c, XO - 320, XO + 760, -700); gymBag(c, XO + 560, -80, 0.62, 0);
    c.fillStyle = '#2B2F3A'; rr(c, XO - 200, -790, 300, 30, 8); c.fill(); c.fillStyle = '#FFFDF8'; c.save(); c.translate(XO + 420, -760); c.rotate(-0.06); c.fillRect(-110, -14, 220, 20); c.restore(); }
  if (room === 'L') { const here = ['R1', 'R2', 'END'].includes(L), cuffed = L === 'END';
    if (here && show('her')) heads.her = put(c, DET, detState(t, L, 'L'), p.her); else if (here) heads.her = headW('her', p.her);
    const clx = cuffed ? p.cleaner - 700 : p.cleaner; heads.cleaner = show('cleaner') ? put(c, CLEANER, cleanerState(t, L, 'L'), clx) : headW('cleaner', clx);
    if (L === 'R1' && t > ev('R1', 'drop') - 0.05 && show('cleaner')) { const k = eOut(P(t, ev('R1', 'drop'), ev('R1', 'drop') + 0.35)); c.save(); c.translate(p.cleaner + 170, 0); c.rotate(lerp(0, 1.45, k)); c.translate(0, -780); mopItem(0)(c); c.restore(); }
    heads.manager = show('manager') ? put(c, MGR, managerState(t, L, 'L'), p.manager) : headW('manager', p.manager);
    if (cuffed && show('manager')) { cuffs(c, p.manager, G.manager.ySh + 470); gymBag(c, p.manager + 380, -10, 0.62, 1, t); }
    const gx = cuffed ? p.manager - 400 : p.guard; heads.guard = show('guard') ? put(c, GUARD, guardState(t, L, 'L'), gx) : headW('guard', gx); }
  return heads; }
function siren(c, x, y, t) { const a = t * 6; c.save(); c.translate(x, y); c.globalCompositeOperation = 'lighter'; for (const s of [0, Math.PI]) { const g = c.createLinearGradient(0, 0, Math.cos(a + s) * 2600, Math.sin(a + s) * 900 + 1400); g.addColorStop(0, 'rgba(255,60,60,.55)'); g.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a + s - 0.25) * 2600, Math.sin(a + s - 0.25) * 900 + 1400); c.lineTo(Math.cos(a + s + 0.25) * 2600, Math.sin(a + s + 0.25) * 900 + 1400); c.fill(); } c.restore();
  c.save(); c.translate(x, y); paint(c, q => { q.m(-90, 0); q.q(-90, -160, 0, -170); q.q(90, -160, 90, 0); q.z(); }, '#FF3B3B', { sd: 6, hd: 4, lw: 3 }); c.fillStyle = '#3A3F4B'; c.fillRect(-120, 0, 240, 50); c.restore(); }

// ---------------- camera: still shots, hard cuts by meaning
const single = (hd, sx, sy, z, tag) => ({ x: hd.x + (W / 2 - sx) / z, y: hd.y + (HH / 2 - sy) / z, z, r: 0, tag });
const wide = (x, z, feetY) => ({ x, y: -(feetY - HH / 2) / z, z, r: 0 });
const H = (who, room, fy = 0) => headW(who, POS[room][who], fy);
const SH = {
  HER_V: single(H('her', 'V'), 520, 980, 1.25, 'her'),
  WIDE_S: wide(XS - 260, 0.55, 1480), HER_S: single(H('her', 'S'), 540, 940, 1.15, 'her'), GUARD: single(H('guard', 'S'), 540, 900, 1.0, 'guard'),
  WIDE_I: wide(XI - 170, 0.55, 1480), HER_I: single(H('her', 'I'), 540, 940, 1.15, 'her'), CLEANER: single(H('cleaner', 'I'), 540, 900, 1.05, 'cleaner'), CLEANER_R: single(H('cleaner', 'I'), 540, 1060, 1.45, 'cleaner'),
  WIDE_O: wide(XO + 20, 0.53, 1480), HER_O: single(H('her', 'O'), 540, 940, 1.15, 'her'), MGR: single(H('manager', 'O', SEAT), 540, 900, 1.05, 'manager'), MGR_R: single(H('manager', 'O', SEAT), 540, 860, 1.3, 'manager'),
  LINEUP: wide(XL, 0.5, 1360), FINAL: wide(XL - 330, 0.46, 1340),
  HER_L: single(H('her', 'L'), 540, 940, 1.15, 'her'), HER_LCU: single(H('her', 'L'), 540, 1000, 1.45, 'her'),
  CLEANER_L: single(H('cleaner', 'L'), 540, 900, 1.05, 'cleaner'), MGR_L: single(H('manager', 'L'), 540, 900, 1.05, 'manager'), MGR_LCU: single(H('manager', 'L'), 540, 960, 1.4, 'manager'),
};
const CUTS = []; const cut = (t, name) => { if (t < 1e8) CUTS.push([t, name]); };
const line = id => SP[id].t - 0.1;
const chunkT = (id, i) => { const ch = TL.cfg.chunks[id], s = SP[id], w = s.words; let n = 0; for (let k = 0; k < i; k++) n += ch[k][0].trim().split(/\s+/).length; return s.t + (w.length >= n + 1 ? w[n][1] : s.d * i / ch.length); };
(function plan() {
  cut(0, 'INS_SAFE'); cut(line('hook_d1'), 'HER_V'); cut(ev('hook', 'lineup'), 'LINEUP');
  cut(SC.GA.s, 'WIDE_S'); cut(line('ga_g1'), 'GUARD'); cut(line('ga_d2'), 'HER_S'); cut(ev('GA', 'mon'), 'INS_MON'); cut(line('ga_g2'), 'GUARD');
  cut(SC.CL.s, 'WIDE_I'); cut(line('cl_c1'), 'CLEANER'); cut(line('cl_d2'), 'HER_I'); cut(line('cl_c2'), 'CLEANER'); cut(endOf('cl_c2') + 0.1, 'CLEANER_R');
  cut(SC.MG.s, 'WIDE_O'); cut(line('mg_m1'), 'MGR'); cut(line('mg_d2'), 'HER_O'); cut(line('mg_m2'), 'MGR'); cut(ev('MG', 'sip') - 0.05, 'MGR_R');
  cut(ev('CLUE', 'log'), 'INS_LOG'); cut(ev('CLUE', 'clock'), 'INS_CLOCK'); cut(ev('CLUE', 'note'), 'INS_NOTE'); cut(ev('CLUE', 'cmp'), 'INS_CMP');
  cut(SC.Q.s, 'LINEUP');
  cut(SC.R1.s, 'HER_L'); cut(ev('R1', 'clock2'), 'INS_CLOCK2'); cut(SP.r1_d2.t + 0.35, 'HER_LCU'); cut(line('r1_c1'), 'CLEANER_L');
  cut(line('r2_d1'), 'HER_LCU'); cut(ev('R2', 'freeze'), 'MGR_L'); cut(line('r2_d3'), 'HER_L'); cut(line('r2_m1'), 'MGR_LCU'); cut(ev('R2', 'plug'), 'INS_PLUG'); cut(chunkT('r2_d4', 1) - 0.05, 'INS_BAG'); cut(line('r2_m2'), 'MGR_LCU');
  cut(SC.END.s, 'FINAL');
  CUTS.sort((a, b) => a[0] - b[0]);
})();
function shotName(t) { let n = 'INS_SAFE'; for (const [ct, name] of CUTS) { if (ct <= t) n = name; else break; } return n; }
const isInsert = n => n.startsWith('INS_');
function shotFor(t) { const n = shotName(t); if (isInsert(n)) return { ...SH.LINEUP, x: -99999, force: true, tag: n }; return { ...SH[n], force: true }; }
const CAM = E.simulateCamera(TL, shotFor, {});
const shake = E.makeShake(TL, ['impact', 'stamp', 'clank']);
function drawWorld(c, t, L, cam, sh) { const room = roomOf(cam.x); c.save(); c.translate(W / 2 + sh.x, HH / 2 + sh.y); c.rotate(sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const heads = world(c, t, L, room, ['her', 'guard', 'cleaner', 'manager'].includes(cam.tag) ? cam.tag : null); const M = c.getTransform(); c.restore(); return { heads, M, room }; }

// ---------------- inserts (object shots on a dark backdrop)
function backdrop(c, a = '#2E3446', b = '#161A24') { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH); }
function paper(c, x, y, w, h, rot, col = '#FFFDF8') { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -w / 2 + 14, -h / 2 + 18, w, h, 16); c.fill(); c.fillStyle = col; rr(c, -w / 2, -h / 2, w, h, 16); c.fill(); return () => c.restore(); }
function tag(c, s, y, col = '#E0474C', sz = 64, rot = -0.03) { c.save(); c.translate(540, y); c.rotate(rot); UI.textFit(c, 'Unb9', sz, s, 920); const w = Math.min(980, c.measureText(s).width + 80); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 8, -sz * 0.9 + 10, w, sz * 1.8, 26); c.fill(); c.fillStyle = col; rr(c, -w / 2, -sz * 0.9, w, sz * 1.8, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -w / 2, -sz * 0.9, w, sz * 1.8, 26); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, 0, 4); c.restore(); }
function redWash(c, t, k = 1) { const p = 0.5 + 0.5 * Math.sin(t * 6); c.fillStyle = `rgba(255,40,40,${(0.08 + 0.12 * p) * k})`; c.fillRect(0, 0, W, HH); }
// frame 0 = the cover: open empty safe, red alarm, $1,000,000 STOLEN!
function insSafe(c, t) { backdrop(c, '#3A2630', '#140E14');
  const cx = 540, cy = 860, R = 360; c.save(); c.translate(cx, cy);
  paint(c, q => { q.m(-430, -430); q.l(430, -430); q.l(430, 430); q.l(-430, 430); q.z(); }, '#6E7686', { sd: 14, hd: 8, lw: 5 });
  c.fillStyle = '#12151C'; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill(); c.fillStyle = '#262A34'; for (let i = 0; i < 3; i++) c.fillRect(-300, -170 + i * 170, 600, 22);
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 3; c.setLineDash([14, 12]); c.strokeRect(-250, -120, 500, 60); c.setLineDash([]);
  c.save(); c.translate(-R - 40, 0); c.scale(0.32, 1); paint(c, q => q.e(0, 0, R + 40, R + 40), '#9AA3B6', { sd: 10, hd: 6, lw: 5, inner: k => { k.strokeStyle = '#5A6274'; k.lineWidth = 26; k.beginPath(); k.arc(0, 0, 140, 0, TAU); k.stroke(); } }); c.restore(); c.restore();
  siren(c, 540, 330, t); redWash(c, t, 1.2);
  const k = 1 + 0.025 * Math.sin(t * 8); c.save(); c.translate(540, 1400); c.scale(k, k); UI.textFit(c, 'Unb9', 150, '$1,000,000', 940); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '$1,000,000', 0, 0, C.gold, '#2B1A12', 18); c.restore();
  c.save(); c.translate(540, 1560); c.rotate(-0.06); c.fillStyle = '#E0474C'; rr(c, -330, -80, 660, 160, 24); c.fill(); c.strokeStyle = C.white; c.lineWidth = 8; rr(c, -330, -80, 660, 160, 24); c.stroke(); txt(c, 'STOLEN!', 0, 6, 110, '#FFFFFF'); c.restore(); }
function hallway(c, x, y, w, h, t) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = '#41566A'; c.fillRect(x, y, w, h); const vx = x + w / 2, vy = y + h * 0.42;
  c.fillStyle = '#566E84'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(vx - w * 0.12, vy + h * 0.1); c.lineTo(vx + w * 0.12, vy + h * 0.1); c.lineTo(x + w, y + h); c.fill();
  c.fillStyle = '#35485A'; c.beginPath(); c.moveTo(x, y); c.lineTo(vx - w * 0.12, vy - h * 0.12); c.lineTo(vx + w * 0.12, vy - h * 0.12); c.lineTo(x + w, y); c.fill();
  c.fillStyle = '#2A3846'; c.fillRect(vx - w * 0.12, vy - h * 0.12, w * 0.24, h * 0.22);
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const dx = vx + s * w * (0.22 + i * 0.13), dw = w * (0.05 + i * 0.03); c.fillStyle = '#7A5A3A'; c.fillRect(dx - dw / 2, vy - h * (0.05 + i * 0.08), dw, h * (0.18 + i * 0.2)); }
  c.fillStyle = 'rgba(255,255,255,.06)'; for (let s = 0; s < h; s += 10) c.fillRect(x, y + s + (t * 60) % 10, w, 3); c.restore(); }
function insMon(c, t) { backdrop(c, '#1C2232', '#0E121A'); const a = ev('GA', 'mon'), k = eBack(P(t, a, a + 0.25), 2);
  c.save(); c.translate(540, 900); c.scale(k, k); c.translate(-540, -900);
  const cams = [['CAM 1 · LOBBY', 0], ['CAM 2 · HALLWAY', 1], ['CAM 3 · PARKING', 0], ['CAM 4 · STAIRS', 0]];
  cams.forEach(([name, main], i) => { const x = 70 + (i % 2) * 480, y = 420 + Math.floor(i / 2) * 560, w = 460, h = 520; c.fillStyle = '#0A0D12'; rr(c, x - 10, y - 10, w + 20, h + 20, 20); c.fill();
    if (main) hallway(c, x, y, w, h, t); else { c.fillStyle = '#2E3E4E'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.06)'; for (let s = 0; s < h; s += 10) c.fillRect(x, y + s, w, 3); c.fillStyle = '#41566A'; c.fillRect(x + 40, y + h * 0.55, w - 80, h * 0.3); }
    c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x + 30, y + 34, 10, 0, TAU); c.fill(); txt(c, name, x + 50, y + 36, 26, '#FFFFFF', 'Unb9', 'left');
    txt(c, '12:00:' + String(14 + Math.floor((t - a) * 1)).padStart(2, '0') + ' AM', x + w - 20, y + h - 30, 24, '#C9E2F2', 'Unb9', 'right');
    if (main) { c.strokeStyle = C.gold; c.lineWidth = 8; rr(c, x - 10, y - 10, w + 20, h + 20, 20); c.stroke(); } });
  c.restore(); tag(c, 'HALLWAY · EMPTY', 1490, '#2B3A67'); }
function insLog(c, t) { backdrop(c, '#1A1F2A', '#0B0E14'); const a = ev('CLUE', 'log'); c.save(); c.translate(540, 900); c.fillStyle = '#0E131C'; rr(c, -480, -520, 960, 1040, 36); c.fill(); c.strokeStyle = '#2E8C86'; c.lineWidth = 6; rr(c, -480, -520, 960, 1040, 36); c.stroke();
  txt(c, 'SECURITY LOG', 0, -440, 54, '#5BE0E6'); c.fillStyle = 'rgba(91,224,230,.3)'; c.fillRect(-420, -390, 840, 4);
  const rows = [['11:52 PM', 'CAMERAS ONLINE', '#9AE6C0'], ['12:00 AM', 'HALLWAY · NO MOTION', '#9AE6C0'], ['12:15 AM', 'ALARM ACTIVATED', '#FF4D4D'], ['', 'VAULT DOOR OPENED', '#FF4D4D']];
  rows.forEach(([tm, s, col], i) => { const k = P(t, a + 0.15 + i * 0.22, a + 0.3 + i * 0.22); if (k <= 0) return; const y = -270 + i * 150 + (i === 3 ? -40 : 0); c.save(); c.globalAlpha = k;
    if (i >= 2) { const bl = 0.55 + 0.45 * Math.abs(Math.sin(t * 7)); c.fillStyle = `rgba(255,60,60,${0.18 * bl})`; rr(c, -440, y - 56, 880, i === 2 ? 112 : 92, 18); c.fill(); }
    if (tm) txt(c, tm, -400, y, i === 2 ? 52 : 40, col, 'Unb9', 'left'); txt(c, s, tm ? -60 : -400, y, i === 2 ? 46 : 36, col, 'Unb9', 'left'); c.restore(); });
  c.restore(); }
function clockFace(c, x, y, R, mins, ring = 0, t = 0) { c.save(); c.translate(x, y); paint(c, q => q.e(0, 0, R, R), '#FFFDF8', { sd: 8, hd: 4, lw: 12 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(Math.sin(a) * R * 0.85, -Math.cos(a) * R * 0.85, i % 3 ? 10 : 18, 0, TAU); c.fill(); }
  if (ring > 0) { c.strokeStyle = `rgba(224,71,76,${ring})`; c.lineWidth = 22; c.beginPath(); c.arc(0, 0, R * 0.62, -Math.PI / 2, -Math.PI / 2 + TAU * (mins / 60) * ring); c.stroke(); }
  const hA = (mins / 60) / 12 * TAU, mA = mins / 60 * TAU; c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; c.lineWidth = 30; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(hA) * R * 0.5, -Math.cos(hA) * R * 0.5); c.stroke();
  c.strokeStyle = '#E0474C'; c.lineWidth = 18; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(mA) * R * 0.78, -Math.cos(mA) * R * 0.78); c.stroke(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, 26, 0, TAU); c.fill(); c.restore(); }
function insClock(c, t, two) { backdrop(c); const a = two ? ev('R1', 'clock2') : ev('CLUE', 'clock'); const ticks = two ? 1 : P(t, a + 0.1, a + 1.25); const mins = two ? 15 : Math.min(15, Math.floor(ticks * 3.999) * 5);
  clockFace(c, 540, 840, 400, mins, two ? eOut(P(t, a, a + 0.35)) : 0, t);
  const k = eBack(P(t, two ? a + 0.05 : a + 1.25, (two ? a + 0.05 : a + 1.25) + 0.25), 2.2); if (k > 0) { c.save(); c.translate(540, 1420); c.scale(k, k); UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '12:15 AM', 0, 0, '#FF5A5A', C.white, 16); c.restore(); } }
function insNote(c, t) { backdrop(c, '#3B3550', '#1F1B2C'); const a = ev('CLUE', 'note'); const done = paper(c, 540, 1150, 960, 900, -0.025, '#FFF3A8');
  c.strokeStyle = 'rgba(60,120,200,.35)'; c.lineWidth = 3; for (let y = -300; y < 420; y += 110) { c.beginPath(); c.moveTo(-470, y); c.lineTo(470, y); c.stroke(); } c.strokeStyle = 'rgba(224,71,76,.5)'; c.beginPath(); c.moveTo(-390, -440); c.lineTo(-390, 440); c.stroke();
  txt(c, 'SUSPECTS', -360, -370, 62, '#2B3A67', 'Cav7', 'left');
  const rows = [['A · GUARD — cameras, hallway empty', '#2B2F3A'], ['B · CLEANER — heard the alarm at 12:00. "Exactly!"', '#2B2F3A'], ['C · MANAGER — office, headphones, "12:15?"', '#2B2F3A']];
  const mk = ev('CLUE', 'note') + (SP.clue_e.d - 0.7);
  rows.forEach(([s, col], i) => { const y = -190 + i * 220; const k = P(t, a - 0.6 + i * 0.05, a - 0.3 + i * 0.05);
    if (i === 1) { const m = eOut(P(t, mk, mk + 0.45)); if (m > 0) { c.fillStyle = 'rgba(242,120,170,.45)'; rr(c, -380, y - 60, 840 * m, 120, 14); c.fill(); } }
    c.save(); c.globalAlpha = clamp(k * 3); UI.font(c, 'Cav7', 58); const lines = UI.wrap(c, s, 820); lines.forEach((l, j) => txt(c, l, -360, y - (lines.length - 1) * 30 + j * 62, 58, col, 'Cav7', 'left')); c.restore(); });
  done(); }
function insCmp(c, t) { backdrop(c); const a = ev('CLUE', 'cmp');
  const plate = (y, l, r, col, d) => { const k = eBack(P(t, a + d, a + d + 0.3), 2); if (k <= 0) return; c.save(); c.translate(540, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -470 + 10, -120 + 14, 940, 240, 34); c.fill(); c.fillStyle = col; rr(c, -470, -120, 940, 240, 34); c.fill(); c.strokeStyle = C.white; c.lineWidth = 8; rr(c, -470, -120, 940, 240, 34); c.stroke(); txt(c, l, 0, -50, 58, '#FFFFFF'); txt(c, r, 0, 40, 100, '#FFFFFF'); c.restore(); };
  plate(620, 'MIDNIGHT', '12:00 AM', '#2B3A67', 0); plate(1260, 'ALARM', '12:15 AM', '#E0474C', 0.35);
  const k = eBack(P(t, a + 0.75, a + 1.0), 2.6); if (k > 0) { c.save(); c.translate(540, 940); c.scale(k, k); UI.font(c, 'Unb9', 220); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '≠', 0, 0, '#FF5A5A', C.white, 16); c.restore(); } }
function insPlug(c, t) { backdrop(c, '#2E3446', '#161A24'); const a = ev('R2', 'plug'), up = eOut(P(t, a + 0.15, a + 0.7));
  c.save(); c.translate(540, 700); paint(c, q => q.e(-260, -120, 150, 200), '#3A3F4B', { sd: 10, hd: 6, lw: 4, inner: k => { k.fillStyle = '#E0474C'; k.beginPath(); k.arc(-260, -120, 60, 0, TAU); k.fill(); } });
  const ex = 20, ey = 460, sw = Math.sin(t * 3.2) * 60;
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 18; c.beginPath(); c.moveTo(-230, 70); c.quadraticCurveTo(-300, 420, ex + sw, ey); c.stroke();
  c.save(); c.translate(ex + sw, ey); c.rotate(-0.1 * (1 - up)); c.fillStyle = '#2B2F3A'; rr(c, -30, 0, 60, 110, 14); c.fill(); c.fillStyle = '#C9CED6'; c.fillRect(-12, 110, 24, 90); c.fillStyle = '#2B2F3A'; c.fillRect(-12, 140, 24, 10); c.fillRect(-12, 166, 24, 10); c.restore();
  if (up > 0) { c.strokeStyle = `rgba(224,71,76,${up})`; c.lineWidth = 12; c.beginPath(); c.arc(ex + sw, ey + 110, 150 + 8 * Math.sin(t * 8), 0, TAU * up); c.stroke(); }
  c.restore();
  const k = eBack(P(t, a + 0.7, a + 0.95), 2.2); if (k > 0) { c.save(); c.translate(540, 1480); c.scale(k, k); UI.font(c, 'Unb9', 64); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'НЕ ПОДКЛЮЧЕНЫ?', 0, 0, C.gold, '#2B1A12', 12); c.restore(); } }
function insBag(c, t) { backdrop(c, '#2E3446', '#161A24'); const a = ev('R2', 'bag'), op = eOut(P(t, a, a + 0.45));
  if (op > 0) { const g = c.createRadialGradient(540, 1000, 50, 540, 1000, 700); g.addColorStop(0, `rgba(242,193,78,${0.35 * op})`); g.addColorStop(1, 'rgba(242,193,78,0)'); c.fillStyle = g; c.fillRect(0, 0, W, HH); }
  gymBag(c, 540, 1120, 1.6, op, t);
  if (op > 0.6) for (let i = 0; i < 6; i++) { const u = P(t, a + 0.35 + i * 0.07, a + 0.9 + i * 0.07); if (u <= 0) continue; cash(c, 540 + (i - 2.5) * 140 + Math.sin(i * 7) * 30, lerp(880, 520 - (i % 2) * 120, eOut(u)), 1.4, (hash(i) - 0.5) * 0.8); }
  const k = eBack(P(t, a + 0.6, a + 0.85), 2.4); if (k > 0) { c.save(); c.translate(540, 1480); c.scale(k, k); UI.textFit(c, 'Unb9', 150, '$1,000,000', 940); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '$1,000,000', 0, 0, C.gold, '#2B1A12', 18); c.restore(); } }
const INSERTS = { INS_SAFE: insSafe, INS_MON: insMon, INS_LOG: insLog, INS_CLOCK: (c, t) => insClock(c, t, false), INS_CLOCK2: (c, t) => insClock(c, t, true), INS_NOTE: insNote, INS_CMP: insCmp, INS_PLUG: insPlug, INS_BAG: insBag };

// ---------------- HUD: suspect chips, the three phrase plates, line-up captions, countdown, stamp
function chip(c, t, sc, letter, role) { const a = sc.s, k = eBack(P(t, a, a + 0.25), 2) * (1 - eIn(P(t, a + 1.9, a + 2.15))); if (k <= 0) return; c.save(); c.translate(60, 250); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, 6, 8, 560, 84, 42); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 0, 0, 560, 84, 42); c.fill(); c.fillStyle = C.gold; c.beginPath(); c.arc(42, 42, 34, 0, TAU); c.fill(); txt(c, letter, 42, 45, 44, '#2B2F3A');
  txt(c, 'SUSPECT · ' + role, 96, 44, 34, '#FFFFFF', 'Unb9', 'left'); c.restore(); }
const PHRASES = [['Where were you?', 'Где ты был?', () => [SP.ga_d1.t + 0.2, SP.ga_g1.t + 1.4]],
  ['I heard the alarm.', 'Я услышал сигнализацию · heard = hear в прошедшем', () => [SP.cl_c2.t + 0.6, endOf('cl_c2') + 0.9]],
  ['I was wearing headphones.', 'Я был в наушниках', () => [SP.mg_m2.t + 1.4, endOf('mg_m2') + 1.0]]];
function phrase(c, t) { for (const [en, ru, span] of PHRASES) { const [a, b] = span(); if (t < a || t > b) continue; const k = eBack(P(t, a, a + 0.25), 2) * (1 - eIn(P(t, b - 0.2, b)));
  c.save(); c.translate(540, 1470); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -480 + 8, -84 + 10, 960, 168, 30); c.fill(); c.fillStyle = C.white; rr(c, -480, -84, 960, 168, 30); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
  c.fillStyle = C.pink; rr(c, -440, -50, 74, 74, 18); c.fill(); txt(c, 'EN', -403, -12, 30, '#FFFFFF');
  fitTxt(c, en, -340, -14, 52, C.oliveD, 790, 'Nun9', 'left'); fitTxt(c, ru, -440, 50, 32, C.pink, 880, 'Nun9', 'left'); c.restore(); } }
function lineupHud(c, t, sc) { // hook: CAN YOU FIND THE THIEF? · Q: WHO STOLE THE MONEY? + roles + "пиши A, B или C" + 3-2-1
  const roles = [['GUARD', -650], ['CLEANER', 0], ['MANAGER', 650]], cam = SH.LINEUP, sx = x => (x - cam.x) * cam.z + W / 2;
  if (sc.id === 'hook') { const a = ev('hook', 'lineup') + 0.15, k = eBack(P(t, a, a + 0.3), 2.2); if (k > 0) { c.save(); c.translate(540, 1500); c.rotate(-0.03); c.scale(k, k); c.fillStyle = '#E0474C'; rr(c, -470, -70, 940, 140, 28); c.fill(); c.strokeStyle = C.white; c.lineWidth = 7; rr(c, -470, -70, 940, 140, 28); c.stroke(); fitTxt(c, 'CAN YOU FIND THE THIEF?', 0, 4, 60, '#FFFFFF', 880); c.restore(); } return; }
  const e = endOf('q_d1');
  roles.forEach(([r, x], i) => { const k = eBack(P(t, e + 0.05 + i * 0.15, e + 0.3 + i * 0.15), 2.4); if (k <= 0) return; c.save(); c.translate(sx(XL + x), 1405); c.scale(k, k); c.fillStyle = '#2B2F3A'; rr(c, -150, -34, 300, 68, 34); c.fill(); fitTxt(c, r, 0, 2, 32, C.gold, 270); c.restore(); });
  const k = eBack(P(t, e + 0.05, e + 0.35), 2.2); if (k > 0) { c.save(); c.translate(540, 1500); c.rotate(-0.02); c.scale(k, k); c.fillStyle = '#E0474C'; rr(c, -470, -66, 940, 132, 28); c.fill(); c.strokeStyle = C.white; c.lineWidth = 7; rr(c, -470, -66, 940, 132, 28); c.stroke(); fitTxt(c, 'WHO STOLE THE MONEY?', 0, 0, 60, '#FFFFFF', 880); c.restore();
    c.save(); c.globalAlpha = clamp(k); txt(c, 'пиши A, B или C', 540, 1585, 36, '#FFFFFF', 'Nun9'); c.restore(); }
  const cd = ev('Q', 'cd'); for (let i = 0; i < 3; i++) { const a = cd + i * 0.8, u = t - a; if (u < 0 || u > 0.8) continue; const kk = eBack(P(u, 0, 0.2), 2.6) * (1 - eIn(P(u, 0.6, 0.8))); c.save(); c.translate(540, 300); c.scale(kk, kk); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(8, 12, 120, 0, TAU); c.fill(); c.fillStyle = i === 2 ? '#E0474C' : C.gold; c.beginPath(); c.arc(0, 0, 120, 0, TAU); c.fill(); c.strokeStyle = C.white; c.lineWidth = 10; c.stroke(); txt(c, String(3 - i), 0, 8, 150, '#FFFFFF'); c.restore(); } }
function stampCase(c, t) { const a = ev('END', 'stamp'), sk = P(t, a - 0.02, a + 0.15); if (sk <= 0) return; const s2 = lerp(2.6, 1, eOut(sk)); c.save(); c.translate(540, 470); c.rotate(-0.1); c.scale(s2, s2); c.globalAlpha = clamp(sk * 3); c.fillStyle = 'rgba(255,253,248,.94)'; rr(c, -400, -100, 800, 200, 26); c.fill(); c.strokeStyle = '#E0474C'; c.lineWidth = 16; rr(c, -400, -100, 800, 200, 26); c.stroke(); fitTxt(c, 'CASE CLOSED', 0, 6, 110, '#E0474C', 720); c.restore(); }
function endCta(c, t) { const sp = SP.end_nar, a = (K.wordT('end_nar', 'пиши') || sp.t + 4.2) - 0.1, k = eBack(P(t, a, a + 0.3), 2.2); if (k <= 0) return; c.save(); c.translate(540, 1300 + Math.sin(t * 7) * 6); c.scale(k, k); c.fillStyle = C.pink; rr(c, -360, -56, 720, 112, 56); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; c.stroke(); txt(c, 'ПИШИ В КОММЕНТЫ', 0, 4, 46, '#FFFFFF'); c.fillStyle = C.white; c.beginPath(); c.moveTo(-30, 70); c.lineTo(30, 70); c.lineTo(0, 110); c.fill(); c.restore(); }

// ---------------- frame
const OFF = { x: W + 9999, y: 0, hh: 0 };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  const n = shotName(t), f = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[f], sh = shake(t);
  let heads = {}, M = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, room = null;
  if (isInsert(n)) { INSERTS[n](c, t); for (const who of ['her', 'guard', 'cleaner', 'manager']) heads[who] = OFF; if (n === 'INS_SAFE' || (n === 'INS_NOTE' ? false : L === 'CLUE')) heads.cleaner = null; }
  else { const r = drawWorld(c, t, L, cam, sh); heads = r.heads; M = r.M; room = r.room; if (room === 'V') redWash(c, t, 0.9); if (room === 'I') { const g = c.createRadialGradient(540, 700, 200, 540, 900, 1300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(0, 0, W, HH); } Hq.vignette(c, W, HH, 0.26); }
  const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f, hh: (p.hh || 0) * Math.hypot(M.a, M.b) });
  for (const k of Object.keys(heads)) if (!heads[k]) delete heads[k];
  // reaction / overlay details on the shots they belong to
  if (n === 'CLEANER_R' || (n === 'CLEANER' && t > SP.cl_c2.t + 1.5)) sweat(c, proj(heads.cleaner), clamp((t - SP.cl_c2.t - 1.2) * 2), -1);
  if (n === 'CLEANER_L') sweat(c, proj(heads.cleaner), 1, -1);
  if (n === 'MGR_R') K.pop(c, t, 'ХЛЮП', ev('MG', 'sip') + 0.15, ev('MG', 'sip') + 1.1, 800, 560, C.white, 0.1, 64);
  if (n === 'CLEANER_L' && t > ev('R1', 'drop')) K.pop(c, t, 'БАХ!', ev('R1', 'drop') + 0.25, ev('R1', 'drop') + 0.9, 820, 1500, C.gold, 0.1, 70);
  if (n === 'MGR_LCU' && t > endOf('r2_m2')) K.pop(c, t, 'БА-ДУМ-ТСС!', endOf('r2_m2') + 0.15, SC.R2.e + 0.1, 540, 1500, C.gold, -0.06, 70);
  if (n === 'FINAL') { const cl = heads.cleaner && proj(heads.cleaner); if (cl) K.pop(c, t, 'Zzz', SC.END.s + 0.6, SC.END.e + 1, cl.x + 110, cl.y - 10, C.white, 0.12, 52); }
  K.bubbles(c, t, sc, heads, proj, { names: NAMES, hold: { q_d1: 0.05, hook_d2: 0.35, r2_d1: 0.2, mg_m2: 0.4, cl_c2: 0.2, r1_c2: 0.4 } });
  if (n === 'WIDE_S') chip(c, t, sc, 'A', 'GUARD'); if (n === 'WIDE_I') chip(c, t, sc, 'B', 'CLEANER'); if (n === 'WIDE_O') chip(c, t, sc, 'C', 'MANAGER');
  if (n === 'LINEUP') lineupHud(c, t, sc);
  phrase(c, t);
  if (L === 'END') { stampCase(c, t); UI.captions(c, t); endCta(c, t); }
  UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.035); UI.watermark(c);
  if (process.env.ANIMATIC) { const s = `АНИМАТИК · ${t.toFixed(1)} · ${L} · ${n}`; c.save(); c.font = '24px Nun9'; const w = c.measureText(s).width + 32; c.fillStyle = 'rgba(0,0,0,.55)'; rr(c, 24, HH - 64, w, 40, 20); c.fill(); c.fillStyle = '#FFFFFF'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(s, 40, HH - 44); c.restore(); }
}
E.run('detective1', NF, renderFrame, W, HH);
