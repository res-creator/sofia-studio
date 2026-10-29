// "When you pretend to know someone" episode renderer (hard_cut camera): node pretend.js start end out.mp4 | --png=f1,f2
// A street outside a cafe: her (coat, takeaway coffee) on the left, the stranger (Tom, blue sweater) on the right.
// Shots tagged 'ui:<view>' (phone, black) replace the world: the selfie on his phone, the cut to black.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/pretend/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'cardigan', col: '#C98B5A', col2: '#F5EBDD' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const MAN = { ...BASE.tom };
const G = { her: geom(HER), stranger: geom(MAN) };
const HERX = -300, MX = 300;
const HY = who => G[who].headY;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
const cupItem = (ctx) => { paint(ctx, q => { q.m(-34, -120); q.l(34, -120); q.l(26, 0); q.l(-26, 0); q.z(); }, '#FFFDF8', { sd: 4, hd: 2, lw: 3 });
  ctx.fillStyle = '#9C6238'; ctx.fillRect(-31, -84, 62, 34); ctx.fillStyle = '#EE5E9A'; ctx.beginPath(); ctx.arc(0, -67, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3E471E'; rr(ctx, -40, -138, 80, 22, 8); ctx.fill(); };
const phoneItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -96, 68, 120, 12); ctx.fill(); ctx.fillStyle = '#7FB0D8'; rr(ctx, -26, -88, 52, 104, 8); ctx.fill(); ctx.restore(); };
function sweat(c, hd, k, side = 1) { if (k <= 0) return; const x = hd.x + side * hd.hh * 0.75, y = hd.y - hd.hh * 0.55 + (1 - k) * -20; c.save(); c.globalAlpha = k; c.fillStyle = '#8FD3F7'; c.strokeStyle = '#3C8FE0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 34); c.quadraticCurveTo(x + 22, y, x, y + 14); c.quadraticCurveTo(x - 22, y, x, y - 34); c.fill(); c.stroke(); c.restore(); }

// ---------------- street outside a cafe (prerendered, softly blurred)
const BX0 = -2200, BY0 = -2900, BW = 4400, BH = 4700, BS = 0.5;
function drawStreetBg(c) {
  c.fillStyle = '#BFE3F7'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#E9C9A8'; c.fillRect(BX0, -2700, BW, 2460);                                    // building facade
  c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -2700; y < -240; y += 70) c.fillRect(BX0, y, BW, 5);
  for (const wx of [-1900, -1300, 1000, 1600]) { c.fillStyle = '#FFFDF8'; rr(c, wx, -2500, 380, 520, 12); c.fill(); c.fillStyle = '#9FC8E4'; rr(c, wx + 18, -2482, 344, 484, 8); c.fill(); c.fillStyle = '#FFFDF8'; c.fillRect(wx + 182, -2482, 16, 484); }
  // cafe front: awning, window, door
  c.fillStyle = '#5E6B2F'; c.fillRect(-1150, -1900, 2300, 1660);
  c.fillStyle = '#FFE7B8'; rr(c, -1060, -1500, 1300, 1000, 14); c.fill();                     // warm window
  c.fillStyle = 'rgba(158,98,56,.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-900 + i * 260, -620, 70, Math.PI, 0); c.fill(); c.fillRect(-940 + i * 260, -620, 80, 120); }   // chairs inside
  c.fillStyle = '#F7B6CF'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-860 + i * 340, -1360, 26, 0, TAU); c.fill(); }   // pendant lamps
  c.fillStyle = '#FFFDF8'; c.fillRect(-420, -1500, 14, 1000);
  c.fillStyle = '#8A5A36'; rr(c, 380, -1500, 360, 1260, 10); c.fill(); c.fillStyle = '#FFE7B8'; rr(c, 430, -1440, 260, 520, 8); c.fill(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(680, -860, 16, 0, TAU); c.fill();
  for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#FFFDF8' : '#EE5E9A'; c.beginPath(); c.moveTo(-1200 + i * 200, -1900); c.lineTo(-1000 + i * 200, -1900); c.lineTo(-1000 + i * 200, -1700); c.quadraticCurveTo(-1100 + i * 200, -1640, -1200 + i * 200, -1700); c.fill(); }
  c.fillStyle = '#3E471E'; rr(c, -500, -2160, 1000, 200, 30); c.fill(); txt(c, 'CAFÉ', 0, -2058, 130, '#F3EDDF', 'Unb9');
  // menu board + plants
  c.fillStyle = '#2B2F3A'; rr(c, 900, -900, 320, 420, 12); c.fill(); txt(c, 'TODAY', 1060, -830, 44, '#F2C14E', 'Cav7'); txt(c, 'latte  £3', 1060, -740, 40, '#F3EDDF', 'Cav7'); txt(c, 'cake  £4', 1060, -670, 40, '#F3EDDF', 'Cav7');
  c.fillStyle = '#8A5A36'; c.beginPath(); c.moveTo(930, -480); c.lineTo(880, -240); c.moveTo(1190, -480); c.lineTo(1240, -240); c.strokeStyle = '#2B2F3A'; c.lineWidth = 16; c.stroke();
  for (const px of [-1500, 1500]) { c.fillStyle = '#C98B5A'; rr(c, px - 110, -560, 220, 320, 20); c.fill(); c.fillStyle = '#4CAF6A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(px - 80 + i * 32, -640 - (i % 2) * 70, 60, 110, (i - 2.5) * 0.25, 0, TAU); c.fill(); } }
  // sidewalk + curb
  c.fillStyle = '#D8D2C6'; c.fillRect(BX0, -240, BW, 1240); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -240, 8, 1240);
  c.fillStyle = '#B9B2A4'; c.fillRect(BX0, 560, BW, 40); c.fillStyle = '#6A6F78'; c.fillRect(BX0, 600, BW, 1200);
}
const BGB = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); { const c = BGB.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; drawStreetBg(c); }
function lamp(c) { c.strokeStyle = '#2B2F3A'; c.lineWidth = 26; c.beginPath(); c.moveTo(-1150, 40); c.lineTo(-1150, -2250); c.stroke(); c.fillStyle = '#2B2F3A'; rr(c, -1230, -2390, 160, 160, 30); c.fill(); c.fillStyle = '#FFE7B8'; rr(c, -1205, -2365, 110, 110, 20); c.fill(); }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const cross = (g, st) => { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); st.items = {}; };
// x positions: SPLIT -> both walk out, BACK -> both return, RUN -> she runs off to the left
function herX(t, L) { if (L !== 'C2') return HERX; const s = ev('split'), b = ev('back'), r = ev('run');
  if (t > r) return lerp(HERX, -1900, eIn(P(t, r, r + 0.7)));
  if (t > b) return lerp(-1300, HERX, eOut(P(t, b, b + 0.55)));
  if (t > s) return lerp(HERX, -1300, eIO(P(t, s, s + 0.6))); return HERX; }
function manX(t, L) { if (L === 'B2') { const a = ev('selfie') - 0.3, b = ev('type'); return lerp(MX, HERX + 330, eIO(P(t, a, a + 0.35))) + (t > b ? lerp(0, MX - HERX - 330, eIO(P(t, b, b + 0.35))) : 0); }
  if (L === 'A1') { const w = ev('wave'); return lerp(MX + 500, MX, eOut(P(t, w - 0.6, w + 0.3))); }
  if (L !== 'C2') return MX; const s = ev('split'), b = ev('back');
  if (t > b) return lerp(1300, MX, eOut(P(t, b, b + 0.55))); if (t > s) return lerp(MX, 1300, eIO(P(t, s, s + 0.6))); return MX; }
const walking = (t, L) => (L === 'C2' && ((t > ev('split') && t < ev('split') + 0.6) || (t > ev('back') && t < ev('back') + 0.55)));
function herState(t, L) { const g = G.her, st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.15, g.ySh + 170), items: { R: cupItem } };
  gest(st, g, 'her', t, -1, 160);
  if (L === 'hook') { st.mood = 'happy'; st.turn = 0.1; st.look = 0.2;
    if (t > SP.hook_m.t + 0.2) { st.mood = 'surprised'; st.turn = 0.4; st.look = 0.9; }
    if (speaking('hook_her', t, 0.05, 0.2)) { st.mood = 'surprised'; st.armL = reach(g, -1, g.sw * 0.2, g.ySh + 60); }
    if (t > hev('scared') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0.15; st.look = 0.3; } }
  if (L === 'A1') { st.mood = 'happy';
    if (speaking('a1_her2', t, 0.05, 0.2)) { st.mood = 'happy'; st.laugh = true; }
    if (t > SP.a1_m3.t + 0.3) { st.mood = 'worried'; }
    if (t > ev('freeze') - 0.05 && t < SP.a1_her3.t) { st.mood = 'shock'; st.blink = 0; st.turn = 0.1; st.look = 0.2; }
    if (speaking('a1_her3', t, 0.05, 0.2)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 60, { planar: true }); }
    if (t > ev('stare')) { st.mood = 'worried'; st.laugh = true; } }
  if (L === 'A2') { st.mood = 'happy';
    if (speaking('a2_her', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 260, { planar: true }); }
    if (t > ev('smile1') - 0.05) { st.mood = 'happy'; st.laugh = true; st.turn = 0.3; st.look = 0.7; }
    if (t > ev('smile2') - 0.05) { st.headX = Math.sin(t * 30) * 3; }
    if (t > ev('smile3') - 0.05) { st.tilt = 0.06; st.headX = Math.sin(t * 40) * 5; } }
  if (L === 'B1') { st.mood = 'neutral';
    if (t > ev('lookup') - 0.05) st.mood = 'worried';
    if (t > ev('hair') - 0.05 && t < endOf('b1_her') + 0.1) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.hw * 0.95, g.headY - g.hh * 0.2); st.headFirst = true; }
    if (speaking('b1_her2', t, 0.05, 0.2)) { st.mood = 'smug'; }
    if (speaking('b1_her3', t, 0.05, 0.2)) { st.mood = 'smug'; st.turn = 0.25; st.look = 0.5; }
    if (t > ev('plan') - 0.05) { st.mood = 'smug'; st.turn = 0; st.look = 0; }
    if (t > ev('nod')) { st.mood = 'happy'; st.headX = 0; st.tilt = Math.sin(P(t, ev('nod'), ev('nod') + 0.6) * TAU * 2) * 0.05; } }
  if (L === 'B2') { st.mood = 'happy'; const s0 = ev('selfie');
    if (speaking('b2_her', t, 0.05)) { st.mood = 'happy'; st.laugh = true; }
    if (t > s0 - 0.1 && t < ev('type') + 0.2) { st.mood = 'happy'; st.laugh = true; st.turn = 0.1; st.look = 0.1; st.tilt = 0.08; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 260, { planar: true }); }
    if (t > ev('type') + 0.2) { st.mood = 'neutral'; }
    if (t > ev('susp') - 0.05) { st.mood = 'skeptical'; st.turn = 0.4; st.look = 0.9; }
    if (speaking('b2_her2', t, 0.05, 0.2)) { st.mood = 'skeptical'; st.armL = reach(g, -1, g.sw * 1.6, g.ySh + 20); } }
  if (L === 'C1') { st.mood = 'skeptical'; st.turn = 0.4; st.look = 0.9;
    if (speaking('c1_her', t, 0.05)) { gest(st, g, 'her', t, -1, 140); }
    if (speaking('c1_her3', t, 0.05, 0.3)) { st.mood = 'annoyed'; }
    if (t > ev('arms') - 0.05) { st.mood = 'annoyed'; cross(g, st); st.items = { R: cupItem }; st.armR = reach(g, 1, -g.sw * 0.4, g.ySh + 200); } }
  if (L === 'C2') { st.mood = 'neutral';
    if (speaking('c2_her', t, 0.05, 0.1)) { st.mood = 'smug'; st.turn = 0.3; st.look = 0.7; }
    if (t > ev('relief') - 0.05) { st.mood = 'surprised'; }
    if (t > ev('shock') - 0.05) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 200, { planar: true }); }
    if (speaking('c2_her2', t, 0.05, 0.2)) { st.mood = 'angry'; st.armL = reach(g, -1, g.sw * 2.2, g.ySh + 20); }
    if (speaking('c2_her3', t, 0.05, 0.2)) { st.mood = 'skeptical'; st.armL = hang(g, -1); }
    if (t > ev('stareboth') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.turn = 0.35; st.look = 0.9; st.armL = hang(g, -1); }
    if (speaking('c2_both', t, 0.05, 0.1)) { st.mood = 'happy'; st.laugh = false; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 330 + Math.sin(t * 9) * 30, { planar: true }); }
    if (t > ev('split') - 0.05 && t < ev('back')) { st.turn = -0.6; st.look = -0.9; st.mood = 'happy'; st.legPose = 'walk'; }
    if (t > ev('back') && t < ev('back') + 0.55) { st.legPose = 'walk'; st.turn = 0.5; st.look = 0.9; st.mood = 'worried'; }
    if (speaking('c2_her4', t, 0.05, 0.2)) { st.mood = 'smug'; st.turn = 0.2; st.look = 0.5; }
    if (t > ev('run') - 0.05) { st.mood = 'happy'; st.turn = -0.7; st.look = -1; st.legPose = 'walk'; st.t = t * 1.8; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 100 + Math.sin(t * 22) * 80, { planar: true }); } }
  return st; }
function manState(t, L) { const g = G.stranger, st = { t, talk: talk('stranger', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  gest(st, g, 'stranger', t, 1, 160);
  const wave = (f = 8) => { st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 360 + Math.sin(t * f) * 40, { planar: true }); };
  if (L === 'hook') { st.mood = 'happy'; wave(); if (speaking('hook_m', t, 0.05)) { st.laugh = false; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 330, { planar: true }); } if (t > SP.hook_m2.t - 0.1) { st.armR = hang(g, 1); st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 80, { planar: true }); } }
  if (L === 'A1') { if (t < ev('wave') + 0.6) { wave(); if (t < ev('wave') + 0.3) st.legPose = 'walk'; }
    if (speaking('a1_m3', t, 0.05, 0.2) || (t > ev('lean') && t < SP.a1_her3.t)) { st.mood = 'smug'; st.headX = -30; st.tilt = -0.05; }
    if (t > ev('stare')) { st.mood = 'surprised'; st.blink = 0; st.headX = 0; st.tilt = 0; } }
  if (L === 'A2') { if (speaking('a2_m', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 280, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 280, { planar: true }); }
    if (t > ev('smile1') - 0.05) { st.laugh = true; st.turn = -0.3; st.look = -0.7; }
    if (t > ev('smile2') - 0.05) { st.headX = Math.sin(t * 34) * 3; }
    if (t > ev('smile3') - 0.05) { st.tilt = -0.06; st.headX = Math.sin(t * 44) * 5; } }
  if (L === 'B1') { st.mood = 'happy';
    if (t > ev('lookup') - 0.05 && t < endOf('b1_m') + 0.2) { st.mood = 'surprised'; st.headX = -40; st.lookY = 0.2; st.armR = reach(g, 1, g.hw * 0.6, g.headY + g.hh * 0.5); }
    if (speaking('b1_m3', t, 0.05, 0.3)) st.mood = 'worried';
    if (t > ev('nod')) { st.mood = 'happy'; st.tilt = Math.sin(P(t, ev('nod'), ev('nod') + 0.6) * TAU * 2) * 0.05; } }
  if (L === 'B2') { const p = ev('phone'), s0 = ev('selfie');
    if (t > p - 0.05) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.2, g.ySh - 80, { planar: true }); }
    if (t > s0 - 0.3 && t < ev('type') + 0.1) { st.mood = 'happy'; st.laugh = true; st.turn = -0.05; st.look = -0.1; st.armR = reach(g, 1, g.sw * 2.3, g.ySh - 520, { planar: true }); st.tilt = -0.06; }
    if (t > ev('type') + 0.1) { st.armR = reach(g, 1, g.sw * 0.3, g.ySh + 20); st.lookY = 0.5; st.turn = -0.1; st.look = -0.1; }
    if (t > ev('susp')) { st.mood = 'worried'; st.lookY = 0; st.turn = -0.35; st.look = -0.8; }
    if (speaking('b2_m3', t, 0.05, 0.4)) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'C1') { st.mood = 'smug';
    if (t > SC.C1.ev.sweat - 0.05) st.mood = 'worried';
    if (speaking('c1_m2', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 160 + Math.sin(t * 6) * 40, { planar: true }); }
    if (t > endOf('c1_her3')) { st.mood = 'worried'; st.turn = -0.1; st.look = 0.3; st.lookY = -0.3; }
    if (speaking('c1_m3', t, 0.05, 0.3)) { st.mood = 'worried'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 60, { planar: true }); st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 60, { planar: true }); }
    if (t > ev('arms')) { st.mood = 'worried'; } }
  if (L === 'C2') { st.mood = 'worried';
    if (t > ev('pause') - 0.05) { st.mood = 'surprised'; st.blink = 0; }
    if (t > ev('relief') - 0.05) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 360, { planar: true }); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 360, { planar: true }); }
    if (t > SP.c2_her2.t) { st.mood = 'worried'; st.laugh = false; st.armL = hang(g, -1); st.armR = hang(g, 1); }
    if (speaking('c2_m2', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 120, { planar: true }); }
    if (speaking('c2_m3', t, 0.05, 0.3)) { st.mood = 'sad'; st.armR = reach(g, 1, g.hw * 0.6, g.headY + g.hh * 0.6); st.headFirst = false; }
    if (t > ev('stareboth') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.armR = hang(g, 1); st.armL = hang(g, -1); }
    if (speaking('c2_both_m', t, 0.05, 0.1)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 330 + Math.sin(t * 9) * 30, { planar: true }); }
    if (t > ev('split') - 0.05 && t < ev('back')) { st.turn = 0.6; st.look = 0.9; st.mood = 'happy'; st.legPose = 'walk'; }
    if (t > ev('back') && t < ev('back') + 0.55) { st.legPose = 'walk'; st.turn = -0.5; st.look = -0.9; }
    if (speaking('c2_m4', t, 0.05, 0.2)) { st.mood = 'surprised'; st.armL = reach(g, -1, -g.sw * 1.9, g.ySh - 200, { planar: true }); }
    if (t > ev('run')) { st.mood = 'shock'; st.turn = -0.6; st.look = -1; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 250, { planar: true }); } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'stranger'], card: ['her', 'stranger'], two: ['her', 'stranger'], her: ['her'], stranger: ['stranger'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { c.drawImage(BGB, BX0, BY0, BW, BH); const who = DRAW[tag] || DRAW.wide, heads = {};
  lamp(c);
  if (who.includes('stranger')) heads.stranger = K.put(c, MAN, manState(t, L), manX(t, L), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(t, L), 0);
  if (!heads.stranger) heads.stranger = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const fy = (who, z, sy = 900) => HY(who) + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(0, fy('stranger', 0.74, 820), 0.74, 'wide'), WIDE: S(0, -900, 0.6, 'wide'), FAR: S(0, -1000, 0.42, 'wide'), CARD: S(0, fy('stranger', 0.72, 1000), 0.72, 'card'), TWO: S(0, fy('stranger', 0.8, 800), 0.8, 'two'),
  HER: S(HERX, fy('her', 1.0), 1.0, 'her'), HER_R: S(HERX, fy('her', 1.0, 1120), 1.0, 'her'), HER_CU: S(HERX, fy('her', 1.7, 960), 1.7, 'her'),
  MAN: S(MX, fy('stranger', 1.0), 1.0, 'stranger'), MAN_R: S(MX, fy('stranger', 1.0, 1120), 1.0, 'stranger'), MAN_CU: S(MX, fy('stranger', 1.6, 960), 1.6, 'stranger'),
  PHONE: U('phone', 1), BLACK: U('black', 2) };
const selfieWin = () => [ev('type'), SP.b2_her2.t - 0.1];
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_her.t - 0.1) return SH.COVER; if (t < SP.hook_m2.t - 0.1) return f(SH.HER_R); if (t < hev('scared') - 0.05) return f(SH.MAN_R); return f(SH.HER_CU); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(L === 'C2' ? SH.HER : SH.WIDE);
  if (L === 'C2' && t > ev('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1') { if (t < SP.a1_m.t - 0.1) return f(SH.WIDE); if (t > ev('stare') - 0.05) return f(SH.MAN_R);
    if (t > ev('freeze') - 0.05 && t < SP.a1_her3.t - 0.1) return f(SH.HER_R); }
  if (L === 'A2' && t > ev('smile1') - 0.05) { if (t < ev('smile2') - 0.05) return f(SH.TWO); if (t < ev('smile3') - 0.05) return f(SH.HER_CU); return f(SH.MAN_CU); }
  if (L === 'B1') { if (t > ev('plan') - 0.05 && t < ev('nod') - 0.05) return f(SH.HER_R); if (t > ev('nod') - 0.05) return f(SH.TWO); if (sp('b1_m')) return f(SH.MAN); }
  if (L === 'B2') { const [a, b] = selfieWin(); if (t > ev('phone') - 0.05 && t < a) return f(SH.WIDE); if (t >= a && t < b) return f(SH.PHONE);
    if (t > ev('susp') - 0.05 && t < SP.b2_her2.t + 0.2 && t < SP.b2_m3.t - 0.1) return f(SH.HER); if (sp('b2_m3')) return f(SH.MAN_CU); }
  if (L === 'C1') { if (t > endOf('c1_her3') + 0.1 && t < SP.c1_m3.t - 0.1) return f(SH.MAN_R); if (t > endOf('c1_m3') && t < nar.t) return f(SH.HER); }
  if (L === 'C2') { const p = SP.c2_her, w = p.words, c2 = w && w.length > 3 ? p.t + w[3][1] : p.t + 1.5;
    if (speaking('c2_her', t, 0.1, 0.1)) return f(t < c2 - 0.1 ? SH.HER : t < endOf('c2_her') - 0.6 ? SH.MAN_R : SH.HER);
    if (t < ev('relief') - 0.05) return f(SH.MAN_R); if (t < SP.c2_her2.t - 0.1) return f(SH.MAN_CU);
    if (t > ev('stareboth') - 0.05 && t < SP.c2_m4.t - 0.1) return f(t < SP.c2_both.t - 0.1 ? SH.TWO : SH.FAR);
    if (sp('c2_m4')) return f(SH.MAN); if (sp('c2_her4')) return f(SH.HER_CU); if (t > ev('run') - 0.05) return f(SH.FAR); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.MAN;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: name box, the "plan" note, the selfie on his phone
function noteBox(c, x, y, k, lines, col = C.white, w = 560) { if (k <= 0) return; const h = 70 + lines.length * 74; c.save(); c.translate(x, y); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -w / 2 + 8, -h / 2 + 10, w, h, 28); c.fill(); c.fillStyle = col; c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 28); c.fill(); c.stroke();
  lines.forEach(([s, cl, sz], i) => { const tick = s.endsWith(' ✓'), y = -h / 2 + 70 + i * 74; if (tick) s = s.slice(0, -2);
    fitTxt(c, s, tick ? -28 : 0, y, sz || 50, cl || C.oliveD, w - (tick ? 130 : 60)); if (tick) { const tw = Math.min(c.measureText(s).width, w - 130); c.save(); c.strokeStyle = '#4CAF6A'; c.lineWidth = 10; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); const x0 = -28 + tw / 2 + 24; c.moveTo(x0, y); c.lineTo(x0 + 14, y + 16); c.lineTo(x0 + 42, y - 18); c.stroke(); c.restore(); } }); c.restore(); }
function banner(c, k, en, col, ru, y = 1250) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.03); c.scale(k, k); const hh = ru ? 132 : 112;
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -460 + 8, -hh / 2 + 10, 920, hh, 26); c.fill(); c.fillStyle = col; rr(c, -460, -hh / 2, 920, hh, 26); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -460, -hh / 2, 920, hh, 26); c.stroke();
  fitTxt(c, en, 0, ru ? -18 : 2, 60, C.white, 860); if (ru) fitTxt(c, ru, 0, 38, 30, '#FFFFFF', 860, 'Nun9'); c.restore(); }
function selfiePic(c, w, h, t) { c.fillStyle = '#E9C9A8'; c.fillRect(0, 0, w, h); c.fillStyle = '#5E6B2F'; c.fillRect(0, h * 0.5, w, h * 0.5); c.fillStyle = '#FFE7B8'; c.fillRect(w * 0.08, h * 0.56, w * 0.6, h * 0.4);
  c.save(); c.translate(w * 0.5, h * 1.55); c.scale(0.24, 0.24);
  const gh = G.her, gm = G.stranger;
  K.put(c, MAN, { t, mood: 'happy', laugh: true, turn: -0.1, look: 0, tilt: -0.08, armL: hang(gm, -1), armR: reach(gm, 1, gm.sw * 2.2, gm.ySh - 500, { planar: true }) }, 330, 0);
  K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0, tilt: 0.08, armL: reach(gh, -1, -gh.sw * 1.6, gh.ySh - 260, { planar: true }), armR: reach(gh, 1, gh.sw * 1.15, gh.ySh + 170), items: { R: cupItem } }, -300, 0);
  c.restore(); }
function phoneView(c, t) { const [a] = selfieWin(), typed = 'With my old friend… ', n = Math.floor(clamp(P(t, a + 0.15, a + 1.2)) * typed.length);
  const ins = (cc, w, h) => { cc.fillStyle = '#14161E'; cc.fillRect(0, 0, w, h);
    cc.save(); cc.beginPath(); cc.rect(0, 60, w, 360); cc.clip(); cc.translate(0, 60); selfiePic(cc, w, 360, t); cc.restore();
    fitTxt(cc, 'NEW POST', w / 2, 32, 24, '#FFFFFF', 300);
    cc.fillStyle = '#FFFDF8'; rr(cc, 16, 440, w - 32, 150, 18); cc.fill();
    fitTxt(cc, typed.slice(0, n) + (Math.sin(t * 12) > 0 && n < typed.length ? '|' : ''), 34, 480, 26, '#2B2F3A', w - 70, 'Nun9', 'left');
    if (n >= typed.length) { cc.fillStyle = '#FFE15A'; rr(cc, 30, 515, 250, 52, 12); cc.fill(); fitTxt(cc, 'NAME: ???' + (Math.sin(t * 10) > 0 ? '|' : ''), 46, 541, 28, '#E0474C', 220, 'Unb9', 'left'); }
    cc.fillStyle = '#EE5E9A'; rr(cc, w - 150, h - 90, 130, 60, 30); cc.fill(); fitTxt(cc, 'POST', w - 85, h - 60, 26, '#FFFFFF', 110); };
  const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' });
  K.phone(c, 540, 900, 1.45, ins);
  const k = clamp(P(t, a + 1.2, a + 1.45)); if (k > 0) { c.save(); c.globalAlpha = k; UI.font(c, 'Nun9', 44); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, '«С моей старой подругой… ИМЯ: ???»', 540, 1540, C.pinkL, C.oliveD, 10); c.restore(); } }

// ---------------- cover badge + frame
function nameBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1560); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -300 + 6, -62 + 10, 600, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -300, -62, 600, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -300, -62, 600, 124, 62); c.stroke();
  fitTxt(c, 'NAME: ???', 0, 4, 64, '#E0474C', 520); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ТЫ ДЕЛАЛ(А) ВИД,', 'ЧТО УЗНАЛ(А)?'], rows: [['A2', "It's been a long time!"], ['B1', 'I decided to try something new.'], ['C1', "We've mistaken each other."], ['C2', 'I have no recollection of…']], cta: ['ОТПРАВЬ ТОМУ, КТО', 'ЗАБЫВАЕТ ИМЕНА'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her; K.put(cc, MAN, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: hang(G.stranger, -1), armR: reach(G.stranger, 1, G.stranger.sw * 2.0, G.stranger.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }) }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.15, g.ySh + 170), items: { R: cupItem } }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag === 'ui:phone') { c.save(); c.translate(sh.x, sh.y); phoneView(c, t); c.restore(); heads = { her: OFFL, stranger: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const hp = who => heads[who] && Math.abs(heads[who].x) < 1e4 ? { ...proj(heads[who]), hh: heads[who].hh * cam.z } : null;
  if (L === 'hook') { if (tag !== 'her') nameBadge(c, t);
    const k = eBack(P(t, hev('scared'), hev('scared') + 0.3), 2); banner(c, k, 'WHO IS THIS GUY?!', '#E0474C', 'КТО ЭТО ВООБЩЕ?!', 1250);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { names: { stranger: ['???', '#3C6FB4'] }, hold: { hook_m: 0.2, hook_her: 0.2, hook_m2: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  // A1: empty name field over her frozen head
  if (L === 'A1' && tag === 'her' && t > ev('namebox') && t < SP.a1_her3.t - 0.1) { const h = hp('her'); if (h) noteBox(c, h.x + 40, h.y - h.hh * 2.0, eBack(P(t, ev('namebox'), ev('namebox') + 0.3), 2), [['NAME:', C.oliveD, 54], ['???', '#E0474C', 86]], '#FFE15A', 420); }
  if (L === 'A2' && t > ev('smile2')) { const k = eBack(P(t, ev('smile2'), ev('smile2') + 0.25), 2); if (SP.a2_nar.t - t > 0.15) K.pop(c, t, 'НЕЛОВКО…', ev('smile2'), SP.a2_nar.t - 0.35, 540, 1300, C.pinkL, -0.06, 90 * Math.min(1, k + 0.4)); }
  if (L === 'B1' && tag === 'her' && t > ev('plan') && t < ev('nod')) { const h = hp('her'), k = eBack(P(t, ev('plan'), ev('plan') + 0.3), 2), ok = t > ev('check');
    if (h) noteBox(c, 540, h.y - h.hh * 2.3, k, [['ПЛАН:', C.pink, 46], ['SMILE ✓', C.oliveD, 50], ['NOD ✓', C.oliveD, 50], [ok ? 'SAY NOTHING SPECIFIC ✓' : 'SAY NOTHING SPECIFIC…', ok ? '#4CAF6A' : C.oliveD, 46]], C.white, 760); }
  if (L === 'B2' && tag === 'stranger' && t > SP.b2_m3.t) { const h = hp('stranger'); if (h) sweat(c, h, clamp(P(t, SP.b2_m3.t + 0.3, SP.b2_m3.t + 0.7)), -1); }
  if (L === 'C1' && tag === 'stranger' && t > SC.C1.ev.sweat) { const h = hp('stranger'), s0 = SC.C1.ev.sweat; if (h) { sweat(c, h, clamp(P(t, s0, s0 + 0.4)), -1); sweat(c, { ...h, y: h.y + h.hh * 0.5 }, clamp(P(t, s0 + 0.5, s0 + 0.9)), 1); } }
  if (L === 'C1' && t > endOf('c1_her3') + 0.15 && t < SP.c1_m3.t - 0.05) K.dots(c, t, endOf('c1_her3') + 0.15, SP.c1_m3.t - 0.05, 1450);
  if (L === 'C2') { if (t > endOf('c2_her') + 0.1 && t < ev('relief') - 0.05) K.dots(c, t, endOf('c2_her') + 0.1, ev('relief') - 0.05, 1450);
    if (t > ev('stareboth') && t < SP.c2_both.t - 0.05) K.dots(c, t, ev('stareboth') + 0.1, SP.c2_both.t - 0.05, 1450);
    if (t > ev('run')) K.pop(c, t, 'NOPE!', ev('run') + 0.1, ev('black') - 0.05, 420, 1250, C.pinkL, -0.1, 110); }
  K.bubbles(c, t, sc, heads, proj, { names: { stranger: ['???', '#3C6FB4'] }, hold: { a1_her3: 0.5, b1_her3: 0.1, c1_m3: 0.6, c2_m: 0.4, c2_her4: 0.4 } });
  K.hud(c, t, sc);
}
E.run('pretend', NF, renderFrame);
