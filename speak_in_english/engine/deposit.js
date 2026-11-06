// "The deposit" (rubric «A1 vs C2», compact form) renderer, hard_cut camera: node deposit.js start end out.mp4 | --png=f1,f2
// Move-out day in an EMPTY rented flat: bare walls with pale rectangles where the pictures hung, a bare bulb, her moving boxes on the left.
// The heroine (hoodie, jeans) stands left; the landlord (Callum, tweed blazer, glasses) stands right with a HUGE magnifying glass and
// her DEPOSIT envelope (£1,200) in his other hand. The envelope is the running gag: it literally shrinks with every deduction
// (A1 −£50 SCRATCH, B1 −£20 HAIR picked up with tweezers), the DEPOSIT close-up (tag 'ui:dep') shows the sums. The "tiny scratch" is on the
// wall to his right (LENS close-up in the hook, tag 'ui:lens'). C1: her move-in photos on the phone (tag 'ui:phone', dated, scratch circled).
// C2: her speech in 3 chunks, a beat in silence, he pulls out cash at once and the envelope grows back. Short level intros (0.6 s).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/deposit/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'hoodie', col: '#5BA88F' }, bottom: { type: 'jeans', col: '#4F6E9C' }, shoes: { col: '#F4EFE6', acc: '#5BA88F' } };
const LORD = { ...BASE.greg, seed: 61, age: 0.55, skin: '#F0C4A4', hair: { style: 'baldsides', col: '#8A7A6A' }, mustache: '#8A7A6A', brow: '#6A5A4A', glasses: { col: '#2B2F3A' },
  build: { shoulder: 1.12, hip: 1.1, belly: 0.75, arm: 1.1 }, top: { type: 'blazer', col: '#7A6A4E', shirt: '#F3EDDF', tie: '#8A2A2A' }, bottom: { type: 'trousers', col: '#4A4A52' }, shoes: { col: '#3A2A20', acc: null } };
const HX = -400, LX = 400, SX = 820, SY = -1420;   // her, the landlord, the "tiny scratch" on the wall
const G = { her: geom(HER), landlord: geom(LORD) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- the deposit: amount + envelope size over time (cumulative)
const D1 = ev('A1', 'dep'), D2 = ev('B1', 'dep'), CASH = ev('C2', 'cash');
const amount = t => t >= CASH ? '£1,200' : t >= D2 + 0.5 ? '£1,130' : t >= D1 + 0.5 ? '£1,150' : '£1,200';
const envK = t => { if (t >= CASH) return lerp(0.7, 1, eBack(clamp((t - CASH - 0.2) / 0.4), 2)); return 1 - 0.16 * eIO(clamp((t - D1 - 0.5) / 0.35)) - 0.14 * eIO(clamp((t - D2 - 0.5) / 0.35)); };

// ---------------- props (local coords)
function envelopeDraw(c, s, amt) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -146, -88, 300, 190, 10); c.fill();
  c.fillStyle = '#FFFDF6'; rr(c, -150, -95, 300, 190, 10); c.fill(); c.strokeStyle = '#B9AE98'; c.lineWidth = 4; c.stroke();
  c.strokeStyle = '#D8CFBC'; c.lineWidth = 3; c.beginPath(); c.moveTo(-148, -92); c.lineTo(0, 0); c.lineTo(148, -92); c.stroke();
  c.save(); c.translate(0, -48); c.rotate(-0.05); fitTxt(c, 'DEPOSIT', 0, 0, 40, '#C8102E', 220); c.restore();
  fitTxt(c, amt, 0, 42, 68, '#2B2F3A', 250); c.restore(); }
// huge magnifying glass: the hand holds the handle, the glass is above it. o.eye: his magnified eye in the glass; o.scr: the magnified scratch
function lensDraw(c, s, rot, o = {}) { const R = 120; c.save(); c.scale(s, s); c.rotate(rot);
  c.fillStyle = '#5A3A22'; rr(c, -14, -150, 28, 190, 12); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-16, -150, 32, 18);
  c.save(); c.translate(0, -150 - R);
  c.fillStyle = o.eye || o.scr ? 'rgba(235,245,255,.92)' : 'rgba(200,225,245,.45)'; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  if (o.scr) { c.save(); c.rotate(-rot); c.strokeStyle = '#6A5E50'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, -14); c.quadraticCurveTo(0, 6, 44, 12); c.stroke(); c.restore(); }
  if (o.eye) { c.save(); c.rotate(-rot); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(0, 6, 86, 62, 0, 0, TAU); c.fill(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.stroke();
    c.fillStyle = '#4A6A8A'; c.beginPath(); c.arc(-34 + o.look * 20, 10, 38, 0, TAU); c.fill(); c.fillStyle = '#1A1A1A'; c.beginPath(); c.arc(-34 + o.look * 20, 10, 18, 0, TAU); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-24 + o.look * 20, -2, 9, 0, TAU); c.fill();
    c.strokeStyle = '#6A5A4A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-80, -70); c.quadraticCurveTo(-10, -100, 70, -76); c.stroke(); c.restore(); }
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-48, -50, 30, 14, -0.7, 0, TAU); c.fill();
  c.strokeStyle = '#2E2418'; c.lineWidth = 22; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke(); c.strokeStyle = '#7A6A4E'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, R - 4, 0, TAU); c.stroke();
  c.restore(); c.restore(); }
const lensItem = (rot, o = {}) => (ctx) => lensDraw(ctx, 1, rot, o);
const envItem = t => ctx => { ctx.save(); ctx.translate(-30, 40); envelopeDraw(ctx, 0.95 * envK(t), amount(t)); ctx.restore(); };
function cashFan(c, s = 1) { c.save(); c.scale(s, s);
  for (let i = 0; i < 6; i++) { c.save(); c.rotate(-0.75 + i * 0.25); c.translate(0, -110); c.fillStyle = i % 2 ? '#C8463C' : '#B23A32'; rr(c, -48, -90, 96, 180, 8); c.fill(); c.strokeStyle = '#7A2420'; c.lineWidth = 3; c.stroke();
    c.save(); c.translate(0, -50); c.rotate(-Math.PI / 2); fitTxt(c, '£50', 0, 0, 34, '#FFF4E0', 80); c.restore(); c.fillStyle = 'rgba(255,240,220,.5)'; c.beginPath(); c.arc(0, 40, 22, 0, TAU); c.fill(); c.restore(); }
  c.restore(); }
const cashItem = t => ctx => { ctx.save(); ctx.translate(10, 10); envelopeDraw(ctx, 0.7 * envK(t), amount(t)); ctx.translate(-40, -20); cashFan(ctx, 0.9); ctx.restore(); };
// tweezers holding up one long hair (hers)
const hairItem = t => ctx => { ctx.save(); ctx.rotate(-0.25);
  ctx.strokeStyle = '#B8BEC8'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-3, -150); ctx.moveTo(10, 0); ctx.lineTo(3, -150); ctx.stroke();
  ctx.strokeStyle = '#3A2820'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -152); for (let k = 1; k <= 14; k++) ctx.lineTo(Math.sin(k * 1.1 + t * 5) * 22, -152 + k * 26); ctx.stroke(); ctx.restore(); };
const phoneItem = ctx => { ctx.save(); ctx.translate(0, -60); ctx.rotate(0.08); ctx.fillStyle = '#2B2F3A'; rr(ctx, -42, -78, 84, 156, 14); ctx.fill(); ctx.fillStyle = '#4A5060'; ctx.beginPath(); ctx.arc(-18, -56, 9, 0, TAU); ctx.fill(); ctx.restore(); };
function sweat(c, hd, t, k) { if (k <= 0 || !hd || hd.x > 1e4) return; const x = hd.x + hd.hh * 0.75, y = hd.y - hd.hh * 0.85 + ((t * 120) % 60);
  c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F4'; c.strokeStyle = '#2E6A8A'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- the empty flat (prerendered, softly blurred)
const BX0 = -2600, BY0 = -4100, BW = 5200, BH = 5700, BS = 0.5, WALL = '#EDE3D3';
function drawFlat(c) {
  c.fillStyle = WALL; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(160,130,90,.05)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 70, 3970);
  c.fillStyle = '#F7F0E4'; c.fillRect(BX0, BY0, BW, 260); c.fillStyle = '#D9CDB8'; c.fillRect(BX0, BY0 + 260, BW, 16);   // ceiling + cornice
  // pale rectangles where the pictures hung + the nails left behind (empty flat)
  for (const [x, y, w, h] of [[-260, -2300, 420, 520], [260, -2150, 260, 320], [-1600, -2250, 380, 280], [1300, -2350, 300, 420]]) { c.fillStyle = '#F6EFE3'; c.fillRect(x, y, w, h); c.fillStyle = '#6A5E50'; c.beginPath(); c.arc(x + w / 2, y + 30, 7, 0, TAU); c.fill(); }
  // window (left) with a grey London sky and rooftops
  c.fillStyle = '#FFFFFF'; c.fillRect(-2350, -2550, 820, 1350); c.fillStyle = '#B8C6D2'; c.fillRect(-2310, -2510, 740, 1270);
  c.fillStyle = '#8E9AA6'; for (let i = 0; i < 6; i++) { const bw = 125, bh = 300 + hash(i * 5) * 420; c.fillRect(-2310 + i * bw, -1240 - bh, bw - 6, bh); c.fillRect(-2310 + i * bw + 30, -1240 - bh - 70, 24, 70); }
  c.fillStyle = '#FFFFFF'; c.fillRect(-1950, -2510, 26, 1270); c.fillRect(-2310, -1900, 740, 24); c.fillStyle = '#E6DCCB'; c.fillRect(-2380, -1220, 880, 50);
  // door (right), open a crack
  c.fillStyle = '#FFFDF8'; c.fillRect(1700, -2450, 760, 2450); c.fillStyle = '#E2D6C2'; c.fillRect(1750, -2400, 660, 2400); c.fillStyle = '#C9BBA2'; for (const y of [-2300, -1150]) c.fillRect(1820, y, 520, 950);
  c.fillStyle = '#C9A13A'; c.beginPath(); c.arc(1800, -1150, 22, 0, TAU); c.fill();
  // light switch, a socket, the bare bulb on a cord
  c.fillStyle = '#FFFFFF'; rr(c, 1540, -1500, 90, 130, 10); c.fill(); rr(c, -1300, -330, 110, 90, 10); c.fill();
  c.strokeStyle = '#3A3A3A'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, BY0 + 270); c.lineTo(0, -2620); c.stroke(); const g = c.createRadialGradient(0, -2570, 8, 0, -2570, 320); g.addColorStop(0, 'rgba(255,236,170,.75)'); g.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g; c.fillRect(-320, -2890, 640, 640);
  c.fillStyle = '#FFF2C2'; c.beginPath(); c.ellipse(0, -2570, 44, 56, 0, 0, TAU); c.fill(); c.fillStyle = '#8A8A8A'; c.fillRect(-20, -2640, 40, 34);
  // skirting + wooden floor
  c.fillStyle = '#FFFDF8'; c.fillRect(BX0, -130, BW, 130); c.fillStyle = '#D9CDB8'; c.fillRect(BX0, -136, BW, 8);
  c.fillStyle = '#B98A5A'; c.fillRect(BX0, 0, BW, 1600); c.fillStyle = 'rgba(80,50,20,.16)'; for (let y = 0; y < 1600; y += 110) { c.fillRect(BX0, y, BW, 5); for (let x = BX0 + (y / 110 % 2) * 300; x < BX0 + BW; x += 600) c.fillRect(x, y, 5, 110); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.2px)'; d.drawImage(a, 0, 0); return b; };
const BGF = mkBG(drawFlat);
// moving boxes behind her (drawn live, sharp)
function box(c, x, y, w, h, txt) { paint(c, q => { q.m(x, y - h); q.l(x + w, y - h); q.l(x + w, y); q.l(x, y); q.z(); }, '#C9955A', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#B07E46'; c.fillRect(x + w / 2 - 30, y - h, 60, h); c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(x + w / 2 - 30, y - h, 60, 10); if (txt) { c.save(); c.translate(x + w / 2, y - h * 0.45); c.rotate(-0.04); fitTxt(c, txt, 0, 0, 44, '#2B2F3A', w - 40, 'Cav7'); c.restore(); } }
function boxes(c) { box(c, -1150, 0, 360, 300, 'BOOKS'); box(c, -780, 0, 300, 260, 'KITCHEN'); box(c, -1100, -300, 300, 240, 'FRAGILE'); box(c, -1500, 0, 320, 380, 'CLOTHES'); }
function scratch(c) { c.strokeStyle = '#7A6E60'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(SX - 13, SY - 4); c.quadraticCurveTo(SX, SY + 2, SX + 14, SY + 5); c.stroke(); K.mark(c, 'scratch', SX, SY, 60); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const frac = (id, t) => (t - SP[id].t) / SP[id].d;
const lHY = G.landlord.headY;
// landlord's right hand so that the lens (R 120, handle 150) is centred on (wx, wy) in world coords
const lensAt = (g, wx, wy, rot = 0) => reach(g, 1, wx - LX - Math.sin(rot) * 270, wy + Math.cos(rot) * 270, { planar: true });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'worried'; st.look = 0.8; if (t > hev('stun') - 0.1) { st.mood = 'shock'; st.blink = 0; st.look = 0.9; } if (t > hev('back')) st.mood = 'annoyed'; }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'angry'; const f = frac('a1_h', t); st.armR = reach(g, 1, g.sw * (f > 0.6 ? 2.3 : 1.6), g.ySh + 140 + Math.sin(t * 10) * (f > 0.6 ? 6 : 14), { planar: true }); }
    if (t > SP.a1_l.t + 0.3) { st.mood = 'worried'; st.look = 0.8; } if (t > e('dep') - 0.1) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.2)) gest(st, g, 'her', t, 1, 160); if (t > e('lens')) { st.mood = 'shock'; st.blink = 0; st.headX = -10; } if (t > endOf('a2_l')) st.mood = 'annoyed'; }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.2)) { gest(st, g, 'her', t, 1, 160); st.look = 0.5; } if (t > e('hair') - 0.1) { st.mood = 'shock'; st.blink = 0; st.look = 0.9; } if (t > e('dep') + 1) st.mood = 'annoyed'; }
  if (L === 'B2') { st.mood = 'annoyed'; if (speaking('b2_h', t, 0.05, 0.2)) st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 150, { planar: true }); if (t > SP.b2_l.t + 0.3) { st.mood = 'skeptical'; st.look = 0.9; } }
  if (L === 'C1') { st.mood = 'neutral'; if (t > SP.c1_h.t + 0.3) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 70, { planar: true }); st.items = { R: phoneItem }; } if (t > endOf('c1_l')) { st.mood = 'smug'; st.armR = hang(g, 1); st.items = {}; } }
  if (L === 'C2') { st.mood = 'smug'; st.turn = 0.2; st.look = 0.5;
    if (speaking('c2_h', t, 0.05, 0.1)) gest(st, g, 'her', t, 1, 140);
    if (t > endOf('c2_h') + 0.1) { st.mood = 'smug'; st.blink = 1; } if (t > CASH) { st.mood = 'happy'; st.blink = 0; st.look = 0.9; } }
  return st; }
function lordState(t, L) { const g = G.landlord, e = k => ev(L, k), st = { t, talk: talk('landlord', t), mood: 'smug', turn: -0.3, look: -0.7, armL: reach(g, -1, -g.sw * 1.5, g.ySh + 170, { planar: true }), armR: reach(g, 1, g.sw * 1.0, g.ySh + 320, { planar: true }), items: { L: envItem(t), R: lensItem(0.15) } };
  const atScratch = () => { st.armR = lensAt(g, SX, SY, -0.5); st.items.R = lensItem(-0.5, { scr: true }); };
  const atEye = (look) => { st.armR = lensAt(g, LX - 42, lHY + 4, 0.15); st.items.R = lensItem(0.15, { eye: true, look }); st.headFirst = true; };
  if (L === 'hook') { st.mood = 'happy'; atScratch(); st.look = t < 1.5 ? 0.5 : -0.8; st.lookY = t < 1.5 ? 0.15 : 0; if (t > hev('stun')) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'surprised'; st.look = -0.9; }
    if (speaking('a1_l', t, 0.05, 0.1)) { st.mood = 'happy'; st.headY = frac('a1_l', t) < 0.2 ? Math.abs(Math.sin((t - SP.a1_l.t) * 9)) * 16 : 0; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 120 + Math.sin(t * 6) * 10, { planar: true }); }
    if (t > e('scr') - 0.1) { atScratch(); st.look = 0.4; st.lookY = 0.1; } if (t > endOf('a1_l') + 0.1) { st.mood = 'smug'; st.blink = 1; st.look = -0.7; } }
  if (L === 'A2') { st.mood = 'smug'; if (speaking('a2_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('lens')) { st.mood = 'happy'; atEye(-1); st.lookY = 0; } if (t > endOf('a2_l') + 0.3) { st.headFirst = false; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 320, { planar: true }); st.items.R = lensItem(0.15); st.mood = 'smug'; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.2)) st.mood = 'skeptical';
    if (speaking('b1_l', t, 0.05, 0.1)) st.mood = 'skeptical';
    if (t > e('hair') - 0.15) { st.mood = 'smug'; st.blink = 0; st.look = -0.3; st.lookY = -0.2; st.armR = reach(g, 1, g.sw * 1.15, g.ySh - 30 - 60 * eOut(clamp((t - e('hair') + 0.15) / 0.3)), { planar: true }); st.items.R = hairItem(t); } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t > e('proud')) { st.mood = 'smug'; st.blink = 1; st.lookY = -0.25; st.look = -0.2; st.headY = -8; st.armR = reach(g, 1, g.sw * 1.15, g.ySh - 90, { planar: true }); st.items.R = lensItem(0.25); } }
  if (L === 'C1') { st.mood = 'smug'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = frac('c1_h', t) < 0.5 ? 'smug' : 'worried'; st.look = -0.8; }
    if (t > endOf('c1_h')) { st.mood = 'worried'; st.blink = 0; st.look = -0.6; st.armR = hang(g, 1); st.items.R = lensItem(0.4); st.headY = 10; } }
  if (L === 'C2') { st.mood = 'smug'; if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = frac('c2_h', t) < 0.35 ? 'smug' : frac('c2_h', t) < 0.7 ? 'surprised' : 'worried'; st.look = -0.9; }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'shock'; st.blink = 0; st.look = -0.7; st.armR = hang(g, 1); st.items.R = lensItem(0.4); }
    if (t > CASH - 0.05) { const k = eOut(clamp((t - CASH + 0.05) / 0.2)); st.mood = 'worried'; st.look = -0.9; st.armL = reach(g, -1, -g.sw * lerp(1.5, 1.8, k), g.ySh + lerp(170, 100, k), { planar: true }); st.items.L = cashItem(t); } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'landlord'], card: ['her', 'landlord'], two: ['her', 'landlord'], cover: ['her', 'landlord'], her: ['her'], landlord: ['landlord'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGF, BX0, BY0, BW, BH); scratch(c); boxes(c);
  if (who.includes('landlord')) { heads.landlord = K.put(c, LORD, lordState(t, L), LX, 0); K.mark(c, 'deposit', LX - 430, -1150, 170); }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  if (who.includes('landlord')) { const k = L === 'C1' && t > endOf('c1_h') ? 1 : L === 'C2' && t > endOf('c2_h') + 0.2 && t < SP.c2_nar.t ? 1 : 0; sweat(c, heads.landlord, t, k); }
  if (!heads.landlord) heads.landlord = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- full-screen close-ups (solid backdrop)
function CAM_AT(t) { let fr = Math.min(CAM.length - 1, Math.round(t * FPS)); const tag = CAM[fr].tag; while (fr > 0 && CAM[fr - 1].tag === tag) fr--; return fr / FPS; }
const popIn = t => eBack(clamp((t - CAM_AT(t)) / 0.25), 1.6);
// DEPOSIT: the envelope, the red deductions and the new sum
function depView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#24434C'); g.addColorStop(1, '#122328'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'dep' });
  const k0 = popIn(t); c.save(); c.translate(540, 820); c.rotate(-0.03); c.scale(lerp(0.9, 1, k0), lerp(0.9, 1, k0));
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -370, -235, 760, 490, 24); c.fill(); c.fillStyle = '#FFFDF6'; rr(c, -380, -250, 760, 490, 24); c.fill(); c.strokeStyle = '#B9AE98'; c.lineWidth = 6; c.stroke();
  c.strokeStyle = '#D8CFBC'; c.lineWidth = 5; c.beginPath(); c.moveTo(-376, -246); c.lineTo(0, -10); c.lineTo(376, -246); c.stroke();
  c.save(); c.translate(0, -150); c.rotate(-0.05); c.strokeStyle = '#C8102E'; c.lineWidth = 7; rr(c, -210, -48, 420, 96, 14); c.stroke(); fitTxt(c, 'DEPOSIT', 0, 2, 70, '#C8102E', 380); c.restore();
  // the sum: struck through and replaced right after a deduction
  const steps = [[-1e9, '£1,200'], [D1 + 0.35, '£1,150'], [D2 + 0.35, '£1,130']]; let cur = 0; steps.forEach((p, i) => { if (t >= p[0]) cur = i; });
  const since = t - steps[cur][0], prev = cur > 0 ? steps[cur - 1][1] : null; UI.font(c, 'Unb9', 150); c.textAlign = 'center'; c.textBaseline = 'middle';
  if (prev && since < 0.2) { c.fillStyle = '#2B2F3A'; c.fillText(prev, 0, 90); const pw = c.measureText(prev).width; c.strokeStyle = '#C8102E'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-pw / 2 - 10, 96); c.lineTo(-pw / 2 - 10 + (pw + 20) * eOut(since / 0.18), 80); c.stroke(); }
  else { const kk = prev ? eBack(clamp((since - 0.2) / 0.22), 2.4) : 1; c.save(); c.translate(0, 90); c.scale(kk, kk); c.fillStyle = prev ? '#C8102E' : '#2B2F3A'; c.fillText(steps[cur][1], 0, 0); c.restore(); }
  c.restore();
  // the deductions, in his red handwriting, below the envelope (revealed left to right)
  const rows = [[D1 - 0.05, '− £50', 'SCRATCH'], [D2 - 0.05, '− £20', 'HAIR']];
  rows.forEach(([a, sum, what], i) => { if (t < a) return; const r = clamp((t - a) / 0.35), y = 1150 + i * 105; c.save(); c.beginPath(); c.rect(150, y - 60, 40 + 760 * r, 120); c.clip(); c.translate(540, y); c.rotate(-0.03);
    UI.font(c, 'Cav7', 82); c.fillStyle = '#FF6B6B'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(sum, -330, 0); c.fillText(what, 0, 0); c.restore(); }); }
// LENS: the magnifying glass over the "tiny scratch"
function lensView(c, t) { c.fillStyle = WALL; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(160,130,90,.06)'; for (let x = -40; x < W; x += 110) c.fillRect(x, 0, 48, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'lens' });
  const k0 = popIn(t), dx = Math.sin(t * 2.2) * 14, dy = Math.cos(t * 1.7) * 10; c.save(); c.translate(540 + dx, 860 + dy); c.scale(lerp(0.85, 1, k0), lerp(0.85, 1, k0));
  c.save(); c.rotate(-0.7); c.fillStyle = '#5A3A22'; rr(c, -34, 330, 68, 420, 26); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-38, 330, 76, 40); c.restore();
  c.fillStyle = '#F2C9A8'; c.beginPath(); c.ellipse(380, 470, 110, 90, -0.7, 0, TAU); c.fill();   // his hand on the handle
  c.save(); c.beginPath(); c.arc(0, 0, 330, 0, TAU); c.clip(); c.fillStyle = '#F4ECDF'; c.fillRect(-340, -340, 680, 680); c.fillStyle = 'rgba(160,130,90,.08)'; for (let x = -340; x < 340; x += 240) c.fillRect(x, -340, 110, 680);
  c.strokeStyle = '#6A5E50'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-52, -16); c.quadraticCurveTo(0, 8, 56, 18); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-150, -170, 90, 36, -0.7, 0, TAU); c.fill(); c.restore();
  c.strokeStyle = '#2E2418'; c.lineWidth = 56; c.beginPath(); c.arc(0, 0, 330, 0, TAU); c.stroke(); c.strokeStyle = '#7A6A4E'; c.lineWidth = 12; c.beginPath(); c.arc(0, 0, 318, 0, TAU); c.stroke();
  c.restore(); }
// PHONE: her move-in photos (dated), the scratch already on the photo, circled in red
function phoneView(c, t) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#3B4A6E'); g.addColorStop(1, '#1E2640'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  const k0 = popIn(t), circ = ev('C1', 'circle');
  K.phone(c, 540, 1150, 1.12 * lerp(0.9, 1, k0), (q, w, h) => { q.fillStyle = '#FFFFFF'; q.fillRect(0, 0, w, h);
    q.fillStyle = '#2E7CF6'; UI.font(q, 'Nun9', 24); q.textAlign = 'left'; q.textBaseline = 'middle'; q.fillText('‹ Photos', 18, 34);
    fitTxt(q, 'Move-in day', 18, 86, 38, '#1E1E24', 380, 'Unb9', 'left'); fitTxt(q, '1 Sep 2023 · 10:14', 18, 128, 24, '#7A7E88', 380, 'Nun9', 'left');
    const py = 156, ph = 420; q.fillStyle = WALL; q.fillRect(0, py, w, ph); q.fillStyle = '#F6EFE3'; q.fillRect(40, py + 30, 110, 130); q.fillStyle = '#FFFDF8'; q.fillRect(0, py + ph - 50, w, 50); q.fillStyle = '#B98A5A'; q.fillRect(0, py + ph - 10, w, 10);
    q.fillStyle = '#FFFFFF'; q.fillRect(w - 90, py + 60, 70, 100);
    q.strokeStyle = '#6A5E50'; q.lineWidth = 4; q.lineCap = 'round'; q.beginPath(); q.moveTo(196, py + 210); q.quadraticCurveTo(212, py + 216, 230, py + 220); q.stroke();
    if (t > circ) { const r = eOut(clamp((t - circ) / 0.35)); q.strokeStyle = '#E0202E'; q.lineWidth = 7; q.beginPath(); q.ellipse(213, py + 214, 58, 42, -0.1, -1.2, -1.2 + TAU * r); q.stroke(); }
    for (let i = 0; i < 4; i++) { q.fillStyle = ['#E3D8C6', '#D6E1E8', '#E8DCCB', '#CFD8C2'][i]; q.fillRect(14 + i * 100, py + ph + 24, 90, 90); } q.strokeStyle = '#2E7CF6'; q.lineWidth = 5; q.strokeRect(14, py + ph + 24, 90, 90);
    q.fillStyle = '#7A7E88'; UI.font(q, 'Nun9', 22); q.textAlign = 'center'; q.fillText('4 photos', w / 2, h - 30); }); }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(80, fy(hHY, 0.52, 1200), 0.52, 'cover'), WIDE: S(40, fy(hHY, 0.52, 930), 0.52, 'wide'), CARD: S(30, fy(hHY, 0.6, 1100), 0.6, 'card'), TWO: S(60, fy(hHY, 0.72, 1000), 0.72, 'two'),
  HER: S(HX + 30, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.3, 960), 1.3, 'her'),
  LORD: S(LX - 110, fy(lHY, 1.0), 1.0, 'landlord'), LORD_SCR: S(LX + 40, fy(lHY, 0.85, 880), 0.85, 'landlord'), LORD_CU: S(LX - 120, fy(lHY, 1.25, 860), 1.25, 'landlord'), LORD_CASH: S(LX - 170, fy(lHY, 0.95, 900), 0.95, 'landlord'),
  DEP: U('dep', 1), LENS: U('lens', 2), PHONE: U('phone', 3) };
const C2Z = [1.0, 1.18, 1.36].map(z => S(HX + 30, fy(hHY, z, 900), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < 2.5) return SH.COVER; if (t < hev('stun')) return f(SH.LORD_SCR); if (t < hev('lens')) return f(SH.HER_CU); if (t < hev('dep')) return f(SH.LENS); if (t < hev('back')) return f(SH.DEP); return f(SH.TWO); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 0.6) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if ((L === 'A1' || L === 'B1') && t > e('dep') - 0.05) return f(SH.DEP);
  if (L === 'A1' && t > e('scr') - 0.15) return f(SH.LORD_SCR);
  if (L === 'A2' && sp('a2_l')) return f(SH.LORD_CU);
  if (L === 'C1' && t > e('phone') - 0.05 && t < SP.c1_l.t - 0.1) return f(SH.PHONE);
  if (L === 'C1' && sp('c1_l')) return f(SH.LORD_CU);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t < CASH - 0.05) return f(SH.LORD_CU);
    return f(SH.LORD_CASH); }
  const cur = TL.speech.filter(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25).pop();   // handover: the NEXT speaker wins (cut 0.1 s before their line)
  const single = who => who === 'her' ? SH.HER : SH.LORD;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
// title overlay (hook, frame 0 .. 2.5 s): on screen from the first frame (no slide-in), fades out
function title(c, t) { const lines = TL.cfg.hook_title, a = 1 - clamp((t - 2.3) / 0.2); if (a <= 0) return; const rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 450); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore();
  if (global.__QA) global.__QA.ui(c, 'title', { x: 50, y: 275, w: 980, h: 350, k: a, id: 'title' }); }
// short level intro (0.6 s): the level-colour circle left by levelIntroNext shrinks into the level pill, with the level name
function miniIntro(c, t, sc) { const u = t - sc.s; if (u > 0.5 || u < 0) return; const L = sc.id, i = UI.LV.indexOf(L); if (i < 0) return;
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const k = eIO(P(u, 0.05, 0.45)), cx = lerp(540, px, k), cy = lerp(960, py, k), R = lerp(330, 34, k);
  c.save(); c.globalAlpha = 1 - P(u, 0.4, 0.5); c.fillStyle = LVCOL[L]; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
  c.translate(cx, cy); const s = lerp(1, 0.2, k); c.scale(s, s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 230); UI.strokeText(c, L, 0, 10, C.white, C.oliveD, 18); c.restore(); }
function hud(c, t, sc) { UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); miniIntro(c, t, sc); UI.levelIntroNext(c, t); }
// rule: when the camera cuts away from a speaker whose line is over, the bubble is not carried onto the next shot
function liveHeads(heads, proj, t) { const out = { ...heads };
  for (const who of Object.keys(out)) { const q = proj(out[who]); if (q.x >= 0 && q.x <= W) continue; const live = TL.speech.some(s => s.who === who && t >= s.t - 0.1 && t < s.t + s.d); if (!live) delete out[who]; }
  return out; }
const names = { landlord: ['LANDLORD', '#6A4A2A'] };
const HOLD = { hook_l: 0.05, a1_h: 0.05, a1_l: 0.05, a2_h: 0.05, a2_l: 0.05, b1_h: 0.05, b1_l: 0.05, b2_h: 0.05, b2_l: 0.05, c1_h: 0.05, c1_l: 0.05, c2_h: 0.05, c2_l: 0.1 };
const VIEWS = { dep: depView, lens: lensView, phone: phoneView };
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'No! My money! Give!'], ['A2', "I didn't do anything."], ['B2', 'Stop nitpicking.'], ['C1', 'The scratch was already there.']];
    K.outro(c, t, { q: ['ТЕБЕ ВЕРНУЛИ', 'ДЕПОЗИТ?'], qSize: 54, rows, cta: ['ОТПРАВЬ ТОМУ, КТО', 'СНИМАЕТ ЖИЛЬЁ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gd = G.landlord;
        K.put(cc, LORD, { t: tt, mood: 'sad', turn: -0.2, look: -0.4, talk: 0, armL: reach(gd, -1, -gd.sw * 1.2, gd.ySh + 300, { planar: true }), armR: reach(gd, 1, gd.sw * 0.9, gd.ySh + 330, { planar: true }), items: { R: lensItem(0.5) } }, 640, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: { L: ctx => { ctx.save(); ctx.translate(0, -20); cashFan(ctx, 0.9); ctx.restore(); } } }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }   // no watermark on the end screen (it would sit on the ПОДПИСАТЬСЯ button)
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { VIEWS[tag.slice(3)](c, t); heads = { her: OFFL, landlord: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  heads = liveHeads(heads, proj, t);
  if (L === 'hook') { title(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, names, hold: HOLD }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    UI.watermark(c); Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: HOLD });
  hud(c, t, sc);
}
E.run('deposit', NF, renderFrame);
