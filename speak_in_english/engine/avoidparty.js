// "When you don't want to go to a party" episode renderer (hard_cut camera): node avoidparty.js start end out.mp4 | --png=f1,f2
// Three sets in one world, chosen by the shot tag: her living room (sofa, blanket, phone), Kate at her party (phone call), her front door at night.
// Shots tagged 'ui:<view>' (phone, imagine, doc, black) replace the world with a full-screen insert.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/avoidparty/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_party };
const PAL = { ...BASE.rita, top: { type: 'tee', col: '#F2C14E' }, bottom: { type: 'skirt', col: '#8E5BD6' } };
const PGUEST = { ...BASE.oliver };
const CROWD = [BASE.jay, BASE.priya, BASE.tony, BASE.chloe, BASE.kai];
const G = { her: geom(HER), pal: geom(PAL), pguest: geom(PGUEST) }; CROWD.forEach((q, i) => { G['c' + i] = geom(q); });
const SEAT = 330, HX = -150;                 // she sits on the sofa (upper body dropped by SEAT)
const DPX = 420, DGX = 820;                  // door set: Kate and the guest with the contract
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const phoneItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -96, 68, 120, 12); ctx.fill(); ctx.fillStyle = '#7FB0D8'; rr(ctx, -26, -88, 52, 104, 8); ctx.fill(); ctx.restore(); };
const paperItem = (ctx) => { ctx.save(); ctx.rotate(-0.12); ctx.fillStyle = '#8A5A36'; rr(ctx, -70, -190, 140, 190, 10); ctx.fill(); ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-58, -172, 116, 160); ctx.fillStyle = '#C9C3B4'; for (let k = 0; k < 5; k++) ctx.fillRect(-46, -150 + k * 26, 92, 6); ctx.restore(); };
const balloonItem = col => (ctx) => { ctx.strokeStyle = '#5E6B2F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -320); ctx.stroke(); paint(ctx, q => q.e(0, -420, 80, 100), col, { sd: 6, hd: 3, lw: 3 }); };
const cakeItem = (ctx) => { ctx.fillStyle = '#F7B6CF'; rr(ctx, -110, -130, 220, 120, 16); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -110, -140, 220, 34, 14); ctx.fill(); ctx.fillStyle = '#F2C14E'; for (let i = 0; i < 3; i++) ctx.fillRect(-60 + i * 50, -190, 12, 50); };
const speakerItem = (ctx) => { ctx.fillStyle = '#2B2F3A'; rr(ctx, -130, -360, 260, 380, 24); ctx.fill(); ctx.fillStyle = '#4A4F5B'; ctx.beginPath(); ctx.arc(0, -110, 80, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -270, 44, 0, TAU); ctx.fill(); };
function partyHat(c, gg, g, col = '#EE5E9A') { const x = gg.head.x, y = gg.head.y - g.hh * 0.95; c.save(); c.translate(x, y); c.rotate(-0.15); paint(c, q => { q.m(-g.hw * 0.45, 0); q.l(0, -g.hh * 0.9); q.l(g.hw * 0.45, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, -g.hh * 0.9, 16, 0, TAU); c.fill(); c.restore(); }

// ---------------- sets (prerendered, softly blurred)
const BX0 = -2200, BY0 = -2800, BW = 4400, BH = 4300, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E9DCEB'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = 'rgba(255,255,255,.2)'; for (let x = BX0; x < BX0 + BW; x += 160) c.fillRect(x, BY0, 70, BH);
  c.fillStyle = '#FFFDF8'; rr(c, 700, -2200, 800, 1000, 18); c.fill(); c.fillStyle = '#2B3560'; rr(c, 730, -2170, 740, 940, 10); c.fill();          // night window
  c.fillStyle = '#FFF4B8'; c.beginPath(); c.arc(1240, -1950, 70, 0, TAU); c.fill(); for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(760 + hash(i) * 680, -2150 + hash(i + 5) * 880, 6, 6); }
  c.fillStyle = '#FFFDF8'; c.fillRect(1092, -2170, 16, 940);
  c.fillStyle = '#B07A4E'; c.fillRect(-1700, -1700, 700, 30); for (let i = 0; i < 8; i++) { const h = 150 + hash(i) * 100; c.fillStyle = ['#E0474C', '#3C8FE0', '#F2C14E', '#4CAF6A', '#8E5BD6'][i % 5]; rr(c, -1680 + i * 80, -1700 - h, 66, h, 6); c.fill(); }
  c.fillStyle = '#FFFDF8'; rr(c, -450, -2050, 500, 360, 12); c.fill(); c.fillStyle = '#8CB369'; rr(c, -425, -2025, 450, 310, 8); c.fill(); txt(c, 'HOME', -200, -1910, 70, '#FFFDF8'); txt(c, 'SWEET HOME', -200, -1830, 46, '#FFFDF8');
  c.fillStyle = '#C9A57E'; c.fillRect(BX0, -260, BW, 1600); c.fillStyle = '#B98AC8'; c.beginPath(); c.ellipse(0, 200, 1300, 220, 0, 0, TAU); c.fill();   // floor + rug
}
function drawParty(c) {
  c.fillStyle = '#2A2350'; c.fillRect(BX0, BY0, BW, BH);
  for (let i = 0; i < 40; i++) { c.fillStyle = ['#EE5E9A', '#F2C14E', '#7CF29A', '#7FB0D8'][i % 4]; c.beginPath(); c.arc(BX0 + i * 110, -2300 + Math.sin(i) * 60, 16, 0, TAU); c.fill(); }   // string lights
  c.fillStyle = '#EE5E9A'; rr(c, -900, -2100, 1800, 220, 30); c.fill(); txt(c, 'PARTY TONIGHT!', 0, -1990, 120, '#FFFDF8');
  for (let i = 0; i < 9; i++) { const x = -2000 + i * 500, y = -900; c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(x, y - 380, 100, 0, TAU); c.fill(); rr(c, x - 170, y - 290, 340, 600, 100); c.fill(); }   // dancers' silhouettes
  for (const [x, y, col] of [[-1500, -1500, '#EE5E9A'], [-1250, -1650, '#F2C14E'], [1300, -1550, '#7FB0D8'], [1550, -1700, '#7CF29A']]) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 110, 140, 0, 0, TAU); c.fill(); }
  c.fillStyle = '#3A2F6A'; c.fillRect(BX0, -260, BW, 1600); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, -260, 130, 1600);
}
function drawDoorSet(c) {
  c.fillStyle = '#1E2546'; c.fillRect(BX0, BY0, BW, BH); for (let i = 0; i < 20; i++) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(BX0 + hash(i) * BW, -2700 + hash(i + 3) * 600, 6, 6); }
  c.fillStyle = '#C9B48A'; c.fillRect(-1800, -2100, 3600, 2000); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -2100; y < -100; y += 80) c.fillRect(-1800, y, 3600, 6);   // house wall
  c.fillStyle = '#8A3A3A'; c.beginPath(); c.moveTo(-2000, -2100); c.lineTo(0, -2700); c.lineTo(2000, -2100); c.fill();
  c.fillStyle = '#6A6F78'; c.fillRect(BX0, -260, BW, 1600); c.fillStyle = '#8A8F98'; c.fillRect(-800, -260, 1600, 120);       // porch step
}
const mkBG = fn => { const b = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = b.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; fn(c); return b; };
const BG = { room: mkBG(drawRoom), party: mkBG(drawParty), door: mkBG(drawDoorSet) };
function sofa(c, x0 = -700, x1 = 700) { paint(c, q => { q.m(x0, -760); q.l(x1, -760); q.l(x1, -300); q.l(x0, -300); q.z(); }, '#6A8FC9', { sd: 12, hd: 6, lw: 3 }); }
function sofaFront(c, x0 = -700, x1 = 700) { paint(c, q => { q.m(x0 - 60, -420); q.l(x1 + 60, -420); q.l(x1 + 60, -80); q.l(x0 - 60, -80); q.z(); }, '#7FA2D8', { sd: 10, hd: 5, lw: 3 }); c.fillStyle = '#4A3A2A'; c.fillRect(x0 - 40, -80, 30, 120); c.fillRect(x1 + 10, -80, 30, 120);
  for (const [px, col] of [[-560, '#F7B6CF'], [560, '#F2C14E']]) { c.save(); c.translate(px, -520); c.rotate(px < 0 ? -0.2 : 0.2); paint(c, q => q.e(0, 0, 120, 100), col, { sd: 6, hd: 3, lw: 3 }); c.restore(); } }
function blanket(c) { paint(c, q => { q.m(HX - 330, -520); q.q(HX, -620, HX + 330, -520); q.l(HX + 380, -100); q.q(HX, -60, HX - 380, -100); q.z(); }, '#B9A2E6', { sd: 10, hd: 5, lw: 4 });
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 8; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(HX - 300 + i * 200, -540); c.lineTo(HX - 330 + i * 210, -110); c.stroke(); } }
function table(c, t, L) { paint(c, q => { q.m(500, -330); q.l(880, -330); q.l(880, -300); q.l(500, -300); q.z(); }, '#B98A62', { sd: 3, hd: 2, lw: 3 }); c.fillStyle = '#8A6A4A'; c.fillRect(520, -300, 22, 360); c.fillRect(838, -300, 22, 360);
  c.fillStyle = '#F2C14E'; rr(c, 560, -420, 110, 90, 12); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, 700, -380, 140, 50, 8); c.fill();   // mug + tissues
  if (L === 'hook' && t < SP.hook_h.t - 0.1) { const r = Math.sin(t * 40) * 0.08; c.save(); c.translate(760, -400); c.rotate(r); c.fillStyle = '#2B2F3A'; rr(c, -60, -30, 120, 60, 10); c.fill(); c.restore(); } }
// door: open = 0..1 (swings inward); party glow when open; windows flash after she ends up outside
function door(c, t, open, glow) { const x0 = -280, x1 = 280, top = -1400;
  c.fillStyle = '#FFFDF8'; rr(c, x0 - 40, top - 40, x1 - x0 + 80, -260 - top + 40, 10); c.fill();
  c.fillStyle = glow ? (Math.sin(t * 9) > 0 ? '#F7B6CF' : '#FFE7B8') : '#2B2F3A'; c.fillRect(x0, top, x1 - x0, -260 - top);
  if (open < 1) { const w = (x1 - x0) * (1 - open); paint(c, q => { q.m(x0, top); q.l(x0 + w, top); q.l(x0 + w, -260); q.l(x0, -260); q.z(); }, '#3C6FB4', { sd: 8, hd: 4, lw: 4 });
    c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x0 + w - 50, -820, 18, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.2)'; rr(c, x0 + 40, top + 60, Math.max(0, w - 80), 360, 10); c.fill(); }
  for (const wx of [-1200, 900]) { c.fillStyle = '#FFFDF8'; rr(c, wx - 20, -1550, 340, 520, 10); c.fill(); c.fillStyle = glow ? ['#EE5E9A', '#7CF29A', '#F2C14E', '#7FB0D8'][Math.floor(t * 6 + wx) & 3] : '#FFE7B8'; rr(c, wx, -1530, 300, 480, 6); c.fill(); }
  c.fillStyle = '#2B2F3A'; c.fillRect(380, -1020, 30, 40); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(395, -1000, 12, 0, TAU); c.fill(); }

// ---------------- timing helpers
const doorOpen = (t, L) => { if (L === 'hook') return t > hev('cut') ? eOut(P(t, hev('cut'), hev('cut') + 0.35)) : 0; if (L !== 'C2') return 0; const o = ev('C2', 'open'), cl = ev('C2', 'close');
  if (t > cl) return 1 - eIn(P(t, cl + 0.3, cl + 0.65)); return eOut(P(t, o, o + 0.35)); };
const outside = (t, L) => L === 'C2' && t > ev('C2', 'close') + 0.3;
const herDoorX = (t, L) => L === 'C2' && t > ev('C2', 'close') ? lerp(0, -560, eIO(P(t, ev('C2', 'close'), ev('C2', 'close') + 0.4))) : 0;
const palIn = (t, L) => L === 'C2' && t > ev('C2', 'close') - 0.2;

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const lap = (g, s) => reach(g, s, s * g.sw * 0.5, g.ySh + 260);
const ear = g => reach(g, 1, g.hw * 0.9, g.headY + g.hh * 0.25);
const onCall = (t, L) => ['A1', 'A2', 'B1', 'B2', 'C1'].includes(L) && t > (L === 'A1' || L === 'A2' ? ev(L, 'ring') + 0.4 : SC[L].s) && !(L === 'C1' && t > ev('C1', 'ended') + 0.2) && !(L === 'A2' && t > ev('A2', 'dress') && t < ev('A2', 'eyes'));
function herSofa(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'tired', turn: 0.2, look: 0.4, legPose: 'sit', drop: SEAT, legs: false, armL: lap(g, -1), armR: lap(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'tired'; if (t > SP.hook_p.t - 0.2) { st.items = { R: phoneItem }; st.armR = ear(g); } if (speaking('hook_h', t, 0.05, 0.3)) { st.mood = 'sad'; st.armL = reach(g, -1, -g.hw * 0.3, g.headY - g.hh * 0.4); } }
  if (onCall(t, L)) { st.items = { R: phoneItem }; st.armR = ear(g); }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.3)) st.mood = 'bored'; if (t > e('yawn') - 0.05 && t < endOf('a1_h2') + 0.2) { st.mood = 'tired'; st.armL = reach(g, -1, -g.hw * 0.2, g.headY + g.hh * 0.7); }
    if (t > e('bed') - 0.05) { st.mood = 'happy'; st.turn = -0.5; st.look = -1; st.lookY = 0.4; } if (speaking('a1_h3', t, 0.05, 0.3)) { st.mood = 'smug'; st.turn = 0.2; st.look = 0.4; st.lookY = 0; } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > e('lookdown') - 0.05) { st.mood = 'surprised'; st.lookY = 0.7; st.turn = 0; st.look = 0; }
    if (speaking('a2_h2', t, 0.05, 0.3)) { st.mood = 'shock'; st.lookY = 0; } if (t > e('dress')) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 60, { planar: true }); st.lookY = 0.5; st.mood = 'shock'; }
    if (t > e('eyes') - 0.05) { st.blink = 1; st.mood = 'sad'; st.lookY = 0; } }
  if (L === 'B1') { st.mood = 'worried'; if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (speaking('b1_h2', t, 0.05, 0.4)) st.mood = 'shock'; if (t > SP.b1_p2.t) st.mood = 'worried'; }
  if (L === 'B2') { st.mood = 'sad'; if (t < SP.b2_h.t + 0.3) st.armL = reach(g, -1, -g.hw * 0.2, g.headY + g.hh * 0.75, { fist: true }); if (speaking('b2_h3', t, 0.05, 0.3)) st.mood = 'surprised';
    if (t > e('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('smile') - 0.05) { st.mood = 'happy'; st.laugh = true; }
    if (t > e('tense') - 0.05) { st.mood = 'worried'; st.laugh = false; } if (t > e('ended')) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 0.6, g.ySh + 60, { planar: true }); st.lookY = 0.5; }
    if (t > e('bell') - 0.05) { st.mood = 'shock'; st.blink = 0; st.lookY = 0; st.turn = 0.7; st.look = 1; } }
  return st; }
function herDoor(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'shock', turn: 0.4, look: 0.8, armL: hang(g, -1), armR: reach(g, 1, g.sw * 1.2, g.ySh + 140), items: {} };
  if (L === 'hook') { st.mood = 'surprised'; if (t > hev('horror') - 0.05) { st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 0.6); st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.6); } return st; }
  st.mood = 'worried'; if (t < SP.c2_p.t) st.mood = 'surprised';
  if (speaking('c2_h', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 160, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 160, { planar: true, fist: true }); }
  if (t > e('guests') - 0.05) { st.mood = 'shock'; st.turn = 0.6; st.look = 1; }
  if (speaking('c2_h2', t, 0.05, 0.3)) { st.mood = 'sad'; st.turn = 0.3; st.look = 0.6; }
  if (t > e('paper')) { st.mood = 'surprised'; st.items = {}; }
  if (t > e('doc')) { st.items = { R: paperItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 60, { planar: true }); st.lookY = 0.4; st.mood = 'shock'; }
  if (speaking('c2_h3', t, 0.05, 0.3)) { st.mood = 'angry'; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 300, { planar: true, fist: true }); }
  if (t > e('close') - 0.05) { st.items = {}; st.mood = 'annoyed'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 40, { planar: true }); st.turn = 0.5; st.look = 0.9; if (t < e('close') + 0.4) st.legPose = 'walk'; }
  if (t > e('outside')) { st.mood = 'neutral'; st.armR = hang(g, 1); st.turn = 0.6; st.look = 1; }
  if (t > e('oks')) { st.mood = 'neutral'; st.blink = 0; st.turn = 0.1; st.look = 0.2; }
  if (speaking('c2_h4', t, 0.05, 0.4)) { st.mood = 'bored'; st.turn = 0; st.look = 0; }
  return st; }
function palState(t, L, set) { const g = G.pal, e = k => ev(L, k), st = { t, talk: talk('pal', t), mood: 'happy', turn: -0.2, look: -0.4, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  st.front = (cc, gg) => partyHat(cc, gg, g);
  if (set === 'party') { st.items = { R: phoneItem }; st.armR = ear(g); st.headX = Math.sin(t * 6) * 8; gest(st, g, 'pal', t, -1, 140);
    if (L === 'B2' && speaking('b2_p', t, 0.05, 0.3)) st.mood = 'worried'; if (speaking('c1_p', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 1.2); }
    if (speaking('c1_p2', t, 0.05, 0.4)) { st.mood = 'smug'; st.laugh = true; } return st; }
  st.turn = -0.4; st.look = -0.8; gest(st, g, 'pal', t, -1, 120);
  if (L === 'hook') { st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 360, { planar: true }); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 360, { planar: true }); st.laugh = true; return st; }
  if (t < SP.c2_p.t) { st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 360, { planar: true }); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 360, { planar: true }); st.laugh = true; }
  if (speaking('c2_p2', t, 0.05, 0.3) || speaking('c2_p3', t, 0.05, 0.3)) { st.laugh = true; st.armR = reach(g, 1, g.sw * 1.9, g.ySh - 260, { planar: true }); }
  return st; }
// crowd on the porch; at GUESTS they walk in through the door one by one
const CROWDX = [760, 1020, 1280, 1540, 1800];
function crowdX(i, t, L) { if (L !== 'C2') return CROWDX[i]; const g0 = ev('C2', 'guests') + i * 0.3; return lerp(CROWDX[i], 0, eIO(P(t, g0, g0 + 0.7))); }
const crowdIn = (i, t, L) => L === 'C2' && t > ev('C2', 'guests') + i * 0.3 + 0.7;
function crowdState(i, t, L) { const g = G['c' + i], st = { t: t + i, talk: 0, mood: 'happy', laugh: true, turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  const it = [balloonItem('#EE5E9A'), speakerItem, cakeItem, balloonItem('#7CF29A'), balloonItem('#F2C14E')][i];
  st.items = { R: it }; st.armR = i === 1 ? reach(g, 1, g.sw * 0.6, g.ySh + 120) : i === 2 ? reach(g, 1, g.sw * 0.9, g.ySh + 80, { planar: true }) : reach(g, 1, g.sw * 1.2, g.ySh - 60, { planar: true });
  if (i === 3) { st.armL = reach(g, -1, -g.sw * 1.8, g.ySh - 300 + Math.sin(t * 10) * 40, { planar: true }); st.headX = Math.sin(t * 10) * 10; }   // the dancer
  if (L === 'C2' && t > ev('C2', 'guests') + i * 0.3 && !crowdIn(i, t, L)) { st.legPose = 'walk'; st.turn = -0.6; st.look = -1; }
  st.front = (cc, gg) => partyHat(cc, gg, g, ['#7FB0D8', '#F2C14E', '#7CF29A', '#EE5E9A', '#8E5BD6'][i]);
  return st; }
function guestX(t) { const p = ev('C2', 'paper'); return lerp(DGX + 700, DGX - 380, eOut(P(t, p - 0.6, p + 0.2))); }
function guestState(t) { const g = G.pguest, st = { t, talk: talk('pguest', t), mood: 'happy', turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  if (t < ev('C2', 'paper') + 0.2) st.legPose = 'walk';
  if (t < ev('C2', 'doc')) { st.items = { L: paperItem }; st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 20, { planar: true }); }
  else st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 60, { planar: true });
  return st; }

// ---------------- the world: set + characters by shot tag (clean singles draw only the tagged character)
const TAGS = { room: ['room', ['her']], her: ['room', ['her']], pal: ['party', ['pal']], door: ['door', ['her', 'pal', 'crowd', 'pguest']], dher: ['door', ['her']], dpal: ['door', ['pal']], dguest: ['door', ['pguest']] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const [set, who] = TAGS[tag] || TAGS.room, heads = {};
  c.drawImage(BG[set], BX0, BY0, BW, BH);
  if (set === 'room') { sofa(c); table(c, t, L); if (who.includes('her')) heads.her = K.put(c, HER, herSofa(t, L), HX, 0); blanket(c); sofaFront(c);
    if (L === 'A1' && t > ev('A1', 'bed') && t < SP.a1_h3.t + 0.3) for (let i = 0; i < 5; i++) { const a = t * 2 + i * 1.3; c.fillStyle = '#FFE15A'; c.beginPath(); c.arc(-560 + Math.cos(a) * 160, -560 + Math.sin(a) * 110, 14, 0, TAU); c.fill(); }
    K.mark(c, 'sofa', 0, -450, 600); }
  if (set === 'party') { if (who.includes('pal')) heads.pal = K.put(c, PAL, palState(t, L, 'party'), 0, 0); }
  if (set === 'door') { const glow = doorOpen(t, L) > 0 || outside(t, L); door(c, t, doorOpen(t, L), glow); K.mark(c, 'door', 0, -830, 420);
    if (who.includes('crowd')) for (let i = CROWD.length - 1; i >= 0; i--) if (!crowdIn(i, t, L) && (L === 'C2' ? t > ev('C2', 'open') - 0.1 : t > hev('cut'))) K.put(c, CROWD[i], crowdState(i, t, L), crowdX(i, t, L), 0, 0.96);
    if (who.includes('pguest') && L === 'C2' && t > ev('C2', 'paper') - 0.6 && t < ev('C2', 'close') - 0.2) heads.pguest = K.put(c, PGUEST, guestState(t), guestX(t), 0);
    if (who.includes('pal') && !palIn(t, L) && (L === 'C2' ? t > ev('C2', 'open') - 0.1 : t > hev('cut'))) heads.pal = K.put(c, PAL, palState(t, L, 'door'), DPX, 0);
    if (who.includes('her')) heads.her = K.put(c, HER, herDoor(t, L), herDoorX(t, L), 0); }
  for (const k of ['pal', 'pguest', 'friends']) if (!heads[k]) heads[k] = OFF; if (!heads.her) heads.her = OFFL;
  if (set === 'door' && L === 'hook' && heads.pal !== OFF) heads.friends = { x: 1250, y: -1500, hh: 90 };
  return heads; }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hSit = SEAT + G.her.headY, hUp = G.her.headY, pHY = G.pal.headY, gHY = G.pguest.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(HX + 90, fy(hSit, 0.95, 1100), 0.95, 'room'), ROOM: S(100, -650, 0.6, 'room'), CARD: S(HX + 120, fy(hSit, 0.78, 1180), 0.78, 'her'),
  HER: S(HX + 60, fy(hSit, 1.0), 1.0, 'her'), HER_R: S(HX + 60, fy(hSit, 1.0, 1120), 1.0, 'her'), HER_CU: S(HX + 20, fy(hSit, 1.6, 960), 1.6, 'her'), HER_LOW: S(HX + 60, fy(hSit, 1.0, 1200), 1.0, 'her'),
  PAL: S(60, fy(pHY, 1.0), 1.0, 'pal'), PAL_LOW: S(60, fy(pHY, 1.0, 1200), 1.0, 'pal'),
  D_WIDE: S(500, -1000, 0.5, 'door'), D_TWO: S(220, fy(pHY, 0.75, 880), 0.75, 'door'), D_CARD: S(220, fy(pHY, 0.68, 1010), 0.68, 'door'), D_HOOK: S(560, fy(pHY, 0.62, 1150), 0.62, 'door'),
  D_HER: S(30, fy(hUp, 1.0), 1.0, 'dher'), D_HER_CU: S(10, fy(hUp, 1.6, 960), 1.6, 'dher'), D_PAL: S(DPX, fy(pHY, 1.0), 1.0, 'dpal'), D_GUEST: S(DGX - 380, fy(gHY, 1.0), 1.0, 'dguest'),
  OUT_WIDE: S(-150, -1000, 0.5, 'door'), OUT_HER: S(-560, fy(hUp, 1.0), 1.0, 'dher'),
  PHONE: U('phone', 1), IMAGINE: U('imagine', 2), DOC: U('doc', 3), BLACK: U('black', 4) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.ROOM;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_p.t - 0.1) return SH.COVER; if (sp('hook_p') || sp('hook_p2')) return f(SH.PAL_LOW); if (t < hev('cut') - 0.05) return f(SH.HER_LOW);
    if (t < hev('horror') - 0.05) return f(SH.D_HOOK); return f(SH.D_HER_CU); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(L === 'C2' ? SH.D_WIDE : SH.ROOM);
  if (L === 'C2' && t > e('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(L === 'C2' ? SH.OUT_WIDE : SH.CARD);
  if ((L === 'A1' || L === 'A2') && t > e('ring') - 0.05 && t < SP[l + '_p'].t - 0.1) return f(SH.ROOM);
  if (L === 'A1' && t > e('bed') - 0.05 && t < SP.a1_h3.t - 0.1) return f(SH.ROOM);
  if (L === 'A2') { if (t > e('lookdown') - 0.05 && t < SP.a2_h2.t - 0.1) return f(SH.HER_R); if (t > e('dress') - 0.05 && t < e('eyes') - 0.05) return f(SH.PHONE); if (t > e('eyes') - 0.05) return f(SH.HER_CU); }
  if (L === 'B1' && t > e('imagine') - 0.05) return f(SH.IMAGINE);
  if (L === 'B2' && t > e('freeze') - 0.05) return f(SH.HER_CU);
  if (L === 'C1') { if (t > e('ended') - 0.05 && t < e('bell') - 0.05) return f(SH.PHONE); if (t > e('bell') - 0.05) return f(SH.HER_CU); }
  if (L === 'C2') { if (t > e('open') - 0.05 && t < SP.c2_p.t - 0.1) return f(SH.D_WIDE);
    if (sp('c2_p')) { const p = SP.c2_p; return f(t < p.t + p.d * 0.55 ? SH.D_PAL : SH.D_TWO); }
    if (sp('c2_h')) return f(SH.D_HER); if (sp('c2_p2')) return f(SH.D_PAL);
    if (t > e('guests') - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.D_WIDE); if (sp('c2_h2')) return f(SH.D_HER);
    if (t > e('paper') - 0.6 && t < SP.c2_g.t - 0.1) return f(SH.D_TWO); if (sp('c2_g')) return f(SH.D_GUEST);
    if (t > e('doc') - 0.05 && t < SP.c2_h3.t - 0.1) return f(SH.DOC); if (sp('c2_h3')) return f(SH.D_HER_CU); if (sp('c2_p3')) return f(SH.D_PAL);
    if (t > e('close') - 0.05 && t < SP.c2_h4.t - 0.1) return f(t < e('outside') - 0.05 ? SH.D_TWO : SH.OUT_WIDE); if (sp('c2_h4')) return f(SH.OUT_HER); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.PAL;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.HER; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen inserts
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function phoneView(c, t, L) { backdrop(c, 'phone');
  const scr = (cc, w, h) => { cc.fillStyle = '#1E2230'; cc.fillRect(0, 0, w, h);
    if (L === 'A2') { const a = ev('A2', 'dress'); fitTxt(cc, 'KATE', w / 2, 60, 30, '#FFFFFF', w - 40); cc.fillStyle = '#3A3F55'; rr(cc, 20, 120, w - 120, 90, 24); cc.fill(); fitTxt(cc, 'Party at 8! 🎉'.replace(' 🎉', '!'), 40, 165, 26, '#FFFFFF', w - 160, 'Nun9', 'left');
      const k = eBack(P(t, a, a + 0.3), 1.6); if (k > 0) { cc.save(); cc.translate(w / 2, 330); cc.scale(k, k); cc.fillStyle = '#EE5E9A'; rr(cc, -w / 2 + 20, -100, w - 40, 200, 24); cc.fill(); fitTxt(cc, 'DRESS CODE:', 0, -40, 34, '#FFFFFF', w - 80); fitTxt(cc, 'PAJAMAS', 0, 30, 60, '#FFE15A', w - 80); cc.restore(); } }
    else { cc.fillStyle = '#F2C14E'; cc.beginPath(); cc.arc(w / 2, 230, 90, 0, TAU); cc.fill(); fitTxt(cc, 'K', w / 2, 234, 90, '#FFFFFF', 160); fitTxt(cc, 'KATE', w / 2, 380, 56, '#FFFFFF', w - 40);
      const bl = Math.sin(t * 8) > -0.3; fitTxt(cc, 'CALL ENDED', w / 2, 460, 40, bl ? '#E0474C' : '#7A2A30', w - 40); fitTxt(cc, '05:42', w / 2, 520, 28, '#BFC5CC', w - 40); } };
  K.phone(c, 540, 860, 1.4, scr);
  caption(c, L === 'A2' ? '«ДРЕСС-КОД: ПИЖАМЫ»' : '«ЗВОНОК ЗАВЕРШЁН»', clamp(P(t, ev(L, L === 'A2' ? 'dress' : 'ended') + 0.3, ev(L, L === 'A2' ? 'dress' : 'ended') + 0.5)), 1530); }
function imagineView(c, t) { const a = ev('B1', 'imagine'); c.drawImage(BG.party, 0, 0, BG.party.width, BG.party.height, -900, -500, 2880, 2814);
  c.save(); c.translate(540, 1500); c.scale(0.62, 0.62);
  CROWD.forEach((q, i) => { const g = G['c' + i], x = [-760, -420, 420, 760, 1080][i]; K.put(c, q, { t: t + i, mood: 'happy', laugh: true, turn: 0, look: 0, headX: Math.sin(t * 9 + i) * 12, armL: reach(g, -1, -g.sw * 1.8, g.ySh - 330 + Math.sin(t * 9 + i) * 50, { planar: true }), armR: reach(g, 1, g.sw * 1.8, g.ySh - 330 + Math.cos(t * 9 + i) * 50, { planar: true }), front: (cc, gg) => partyHat(cc, gg, g) }, x, -60 * (i % 2)); });
  const gh = G.her; paint(c, q => { q.m(-260, -560); q.l(260, -560); q.l(260, 0); q.l(-260, 0); q.z(); }, '#6A8FC9', { sd: 8, hd: 4, lw: 3 });   // tiny armchair
  K.put(c, HER, { t, mood: 'annoyed', turn: 0, look: 0, lookY: 0.5, legPose: 'sit', drop: SEAT, legs: false, armL: reach(gh, -1, -110, gh.ySh + 220), armR: reach(gh, 1, 110, gh.ySh + 220) }, 0, 0);
  c.fillStyle = '#C9CED6'; rr(c, -230, -420, 460, 36, 8); c.fill(); paint(c, q => { q.m(-210, -420); q.l(210, -420); q.l(190, -650); q.l(-190, -650); q.z(); }, '#3A3F4B', { sd: 6, hd: 3, lw: 3 });
  c.fillStyle = '#FFFDF8'; rr(c, -260, -2150, 520, 140, 20); c.fill(); fitTxt(c, 'QUIET CORNER', 0, -2080, 64, '#3E471E', 480); c.restore();
  c.save(); const g = c.createRadialGradient(540, 960, 500, 540, 960, 1150); g.addColorStop(0, 'rgba(247,182,207,0)'); g.addColorStop(1, 'rgba(247,182,207,.95)'); c.fillStyle = g; c.fillRect(0, 0, W, HH); c.restore();
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'imagine' });
  const k = eBack(P(t, a + 0.2, a + 0.5), 2); if (k > 0) { c.save(); c.translate(540, 520); c.rotate(-0.04); c.scale(k, k); c.fillStyle = '#3E471E'; rr(c, -380, -70, 760, 140, 30); c.fill(); fitTxt(c, 'WORK FROM PARTY', 0, 4, 64, '#FFE15A', 700); c.restore(); }
  caption(c, '*представляет…*', clamp(P(t, a + 0.1, a + 0.3)), 1600, C.white); }
function docView(c, t) { backdrop(c, 'doc'); const a = ev('C2', 'doc'), k = eBack(P(t, a, a + 0.3), 1.6); c.save(); c.translate(540, 880); c.rotate(-0.03); c.scale(k, k);
  c.fillStyle = '#FFFDF8'; c.fillRect(-400, -520, 800, 1000); c.strokeStyle = '#C9C3B4'; c.lineWidth = 6; c.strokeRect(-400, -520, 800, 1000);
  fitTxt(c, 'PARTY VENUE', 0, -430, 64, '#2B2F3A', 700); fitTxt(c, 'RENTAL AGREEMENT', 0, -360, 56, '#2B2F3A', 700);
  [['HOST:', 'YOU (THE HOMEOWNER)'], ['GUESTS:', '47'], ['CLEANING FEE:', '$500']].forEach(([x, y], i) => { const yy = -220 + i * 150; fitTxt(c, x, -340, yy, 34, '#8A8480', 600, 'Unb9', 'left'); fitTxt(c, y, -340, yy + 56, 46, i === 2 ? '#E0474C' : '#2B2F3A', 680, 'Unb9', 'left'); });
  fitTxt(c, 'SIGN HERE: ____________', -340, 360, 38, '#2B2F3A', 680, 'Unb9', 'left'); c.restore();
  caption(c, '«ДОГОВОР АРЕНДЫ ПЛОЩАДКИ. ХОЗЯЙКА: ТЫ. УБОРКА: $500»', clamp(P(t, a + 0.3, a + 0.5)), 1530); }
function checklist(c, t, a) { const k = eBack(P(t, a, a + 0.3), 2); if (k <= 0) return; c.save(); c.translate(540, 520); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -400 + 8, -130 + 10, 800, 260, 28); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -400, -130, 800, 260, 28); c.fill(); c.stroke();
  [['PARTY INSIDE', 0], ['HOMEOWNER OUTSIDE', 0.3]].forEach(([s, d], i) => { const y = -55 + i * 110, kk = clamp(P(t, a + d, a + d + 0.2)); fitTxt(c, s, -340, y, 52, C.oliveD, 560, 'Unb9', 'left');
    if (kk > 0) { c.save(); c.globalAlpha = kk; c.strokeStyle = '#4CAF6A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(270, y); c.lineTo(295, y + 26); c.lineTo(345, y - 30); c.stroke(); c.restore(); } }); c.restore(); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1620); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'PARTY? NO, THANKS', 0, 4, 56, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['ТЫ ЛЮБИШЬ ВЕЧЕРИНКИ', 'ИЛИ ДОМ?'], rows: [['A2', "I don't have anything to wear."], ['B1', "I'd love to, but…"], ['C1', "I'd rather spend the evening by myself."], ['C2', 'Under no circumstances…']], cta: ['ОТПРАВЬ ПОДРУГЕ-', 'ТУСОВЩИЦЕ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, gp = G.pal; K.put(cc, PAL, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: hang(gp, -1), armR: reach(gp, 1, gp.sw * 2.0, gp.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), front: (c2, gg) => partyHat(c2, gg, gp) }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'tired', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1) }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'room';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); const v = tag.slice(3);
    if (v === 'phone') phoneView(c, t, L); else if (v === 'imagine') imagineView(c, t); else if (v === 'doc') docView(c, t);
    c.restore(); heads = { her: OFFL, pal: OFF, pguest: OFF, friends: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const hp = who => heads[who] && Math.abs(heads[who].x) < 1e4 ? { ...proj(heads[who]), hh: heads[who].hh * cam.z } : null;
  const names = { pal: ['KATE', '#8E5BD6'], pguest: ['GUEST', '#2F3E5C'], friends: ['EVERYONE', '#EE5E9A'] };
  if (L === 'hook') { if (tag === 'room' && t < SP.hook_p.t) coverBadge(c, t); if (t > hev('cut')) K.pop(c, t, 'SURPRISE!', SP.hook_all.t, SP.hook.t - 0.2, 540, 1300, C.gold, -0.08, 120);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_p: 0.2, hook_h: 0.2, hook_p2: 0.05, hook_all: 0.05 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('bed') && t < SP.a1_h3.t - 0.1) K.pop(c, t, 'УЮТНО…', e('bed') + 0.1, SP.a1_h3.t - 0.2, 540, 1300, C.pinkL, -0.06, 90);
  if (L === 'B2' && t > e('freeze') && t < narT - 0.05) K.dots(c, t, e('freeze') + 0.05, narT - 0.05, 1450);
  if (L === 'C1' && t > e('bell') && t < narT - 0.1) K.pop(c, t, 'ДИНЬ-ДОН!', e('bell') + 0.05, narT - 0.2, 540, 1300, C.gold, -0.08, 100);
  if (L === 'C2') { if (t > e('open') && t < SP.c2_p.t - 0.1) K.pop(c, t, 'SURPRISE!', e('open') + 0.2, SP.c2_p.t - 0.2, 540, 1300, C.gold, -0.08, 120);
    if (t > e('oks') && t < SP.c2_h4.t - 0.1) checklist(c, t, e('oks')); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a2_p3: 0.05, a1_h3: 0.4, a2_h2: 0.05, b1_p2: 0.05, b2_p3: 0.3, c1_h3: 0.05, c2_h: 0.3, c2_g: 0.05, c2_p3: 0.05, c2_h4: 0.5 } });
  K.hud(c, t, sc);
}
E.run('avoidparty', NF, renderFrame);
