// "When you try to take one good photo" episode renderer (hard_cut camera): node photo.js start end out.mp4 | --png=f1,f2
// One city park with a fountain. HER, her FRIEND with the phone, THE PIGEON (one fixed drawing, a few prepared poses: idle / strut / fly / sunglasses) and the AGENCY MAN in C2.
// The bad photos are full-screen close-ups (closed eyes, fountain only, giant foot, pigeon in the face), then the phone feed (likes / views / headline).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/photo/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_market };
const FRI = { ...BASE.kai, top: { type: 'hoodie', col: '#3C8FE0' } };
const AGENT = { ...BASE.mark, top: { type: 'blazer', col: '#2B2F3A' } };
const G = { her: geom(HER), fri: geom(FRI), agent: geom(AGENT) };
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const phoneItem = (ctx) => { ctx.save(); ctx.rotate(-0.05); ctx.fillStyle = '#2B2F3A'; rr(ctx, -40, -120, 80, 140, 14); ctx.fill(); ctx.fillStyle = '#4A4F5B'; ctx.beginPath(); ctx.arc(0, -90, 12, 0, TAU); ctx.fill(); ctx.restore(); };
const folderItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#E27D3C'; rr(ctx, -70, -150, 140, 170, 10); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -56, -136, 112, 130, 6); ctx.fill(); ctx.fillStyle = '#C9C3B4'; for (let k = 0; k < 4; k++) ctx.fillRect(-42, -118 + k * 24, 84, 5); ctx.restore(); };

// ---------------- THE pigeon: one drawing, a few prepared poses. st = { face: -1|1, pose: 'idle'|'strut'|'fly', t, glasses }
function pigeon(c, x, y, s, st) { const f = st.face || -1, t = st.t || 0, fly = st.pose === 'fly', bob = st.pose === 'strut' ? Math.sin(t * 9) * 12 : st.pose === 'idle' ? Math.max(0, Math.sin(t * 2.2)) * 26 : 0, flap = fly ? Math.sin(t * 22) : 0;
  c.save(); c.translate(x, y); c.scale(s * f, s); const O = { sd: 6, hd: 3, lw: 4 };
  if (!fly) { c.strokeStyle = '#E8788A'; c.lineWidth = 9; c.lineCap = 'round'; const sw = st.pose === 'strut' ? Math.sin(t * 9) * 22 : 0; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 16, -86); c.lineTo(k * 16 + k * sw, -6); c.stroke(); c.beginPath(); c.moveTo(k * 16 + k * sw, -6); c.lineTo(k * 16 + k * sw + 30, -4); c.stroke(); } }
  c.translate(0, -bob * 0.3 + (fly ? 0 : 0));
  paint(c, q => { q.m(-110, -150); q.l(-230, -120); q.l(-215, -165); q.l(-235, -205); q.l(-120, -190); q.z(); }, '#6E7885', O);                // tail
  paint(c, q => q.e(0, -165, 135, 92), '#9AA3AE', O);                                                                                       // body
  paint(c, q => q.e(95, -222 - bob * 0.6, 62, 56), '#9AA3AE', O);                                                                           // head
  paint(c, q => q.e(70, -192, 50, 36), '#4CAF9A', { sd: 4, hd: 2, lw: 3 }); paint(c, q => q.e(86, -200, 28, 18), '#8E5BD6', { sd: 2, hd: 1, lw: 0 });   // shiny neck
  paint(c, q => { q.m(150, -226 - bob * 0.6); q.l(206, -214 - bob * 0.6); q.l(150, -204 - bob * 0.6); q.z(); }, '#F2A03C', { sd: 3, hd: 2, lw: 3 });  // beak
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(118, -232 - bob * 0.6, 14, 0, TAU); c.fill(); c.fillStyle = '#1E2128'; c.beginPath(); c.arc(121, -232 - bob * 0.6, 7, 0, TAU); c.fill();   // eye
  if (st.glasses) { const gy = -232 - bob * 0.6; c.fillStyle = '#12141A'; rr(c, 92, gy - 17, 54, 32, 10); c.fill(); rr(c, 60, gy - 14, 26, 6, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(100, gy - 12, 14, 5); }
  c.save(); c.translate(-15, -175); c.rotate(fly ? -0.9 - flap * 0.55 : -0.05); paint(c, q => q.e(-20, fly ? -90 : 0, fly ? 55 : 105, fly ? 150 : 62), '#7A8592', O); c.restore();   // wing
  if (!fly) { c.strokeStyle = '#3A4350'; c.lineWidth = 6; for (const k of [-1, 0]) { c.beginPath(); c.moveTo(-80 + k * 22, -192); c.lineTo(-60 + k * 22, -140); c.stroke(); } }
  c.restore(); }

// ---------------- the park (prerendered, softly blurred)
const BX0 = -2600, BY0 = -3000, BW = 5200, BH = 4800, BS = 0.5;
function drawPark(c) {
  const g = c.createLinearGradient(0, BY0, 0, -300); g.addColorStop(0, '#8FD0F2'); g.addColorStop(1, '#E4F4FA'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  for (const [x, y, r] of [[-1800, -2300, 190], [-1500, -2260, 260], [900, -2450, 200], [1250, -2400, 270]]) { c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.beginPath(); c.arc(x + r * 0.9, y + 30, r * 0.75, 0, TAU); c.fill(); }
  c.fillStyle = '#9DD08A'; c.beginPath(); c.moveTo(BX0, -900); c.quadraticCurveTo(-800, -1300, 600, -900); c.quadraticCurveTo(1800, -600, BX0 + BW, -1000); c.lineTo(BX0 + BW, -250); c.lineTo(BX0, -250); c.fill();   // hills
  for (const [x, h, s] of [[-2000, 1700, 1], [-1300, 1900, 1.1], [1700, 1800, 1], [2300, 2000, 1.2], [-300, 1450, 0.8]]) { c.fillStyle = '#8A5A3A'; c.fillRect(x - 40, -h * 0.55 - 250, 80, h * 0.55); c.fillStyle = ['#4CAF6A', '#5EBF6E', '#3E9A5A'][Math.abs(x) % 3]; for (const [dx, dy, r] of [[0, -h * 0.55 - 250, 340 * s], [-200 * s, -h * 0.4 - 250, 250 * s], [210 * s, -h * 0.42 - 250, 260 * s], [0, -h * 0.8 - 250, 250 * s]]) { c.beginPath(); c.arc(x + dx, dy, r, 0, TAU); c.fill(); } }
  c.fillStyle = '#D9C6A0'; c.fillRect(BX0, -260, BW, 2000); c.fillStyle = '#C9B48A'; c.beginPath(); c.moveTo(-2600, 1200); c.lineTo(-700, -260); c.lineTo(500, -260); c.lineTo(-300, 1700); c.fill();      // path
  c.fillStyle = '#9DD08A'; c.fillRect(BX0, -260, BW, 60);
  for (let i = 0; i < 40; i++) { c.fillStyle = ['#EE5E9A', '#F2C14E', '#FFFFFF'][i % 3]; const x = BX0 + hash(i) * BW, y = -230 + hash(i + 7) * 120; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); }
  // fountain (right of centre)
  const fx = 1000; c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(fx, -120, 720, 110, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(fx - 640, -330); q.l(fx + 640, -330); q.l(fx + 590, -90); q.l(fx - 590, -90); q.z(); }, '#C9D3DC', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#7FC4E8'; c.beginPath(); c.ellipse(fx, -330, 640, 92, 0, 0, TAU); c.fill(); c.fillStyle = '#9ED8F2'; c.beginPath(); c.ellipse(fx, -338, 560, 66, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(fx - 70, -330); q.l(fx + 70, -330); q.l(fx + 44, -1000); q.l(fx - 44, -1000); q.z(); }, '#C9D3DC', { sd: 6, hd: 3, lw: 4 }); paint(c, q => q.e(fx, -1000, 250, 56), '#B9C4CE', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#9ED8F2'; c.beginPath(); c.ellipse(fx, -1006, 210, 36, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 14; c.lineCap = 'round'; for (const dx of [-300, -150, 0, 150, 300]) { c.beginPath(); c.moveTo(fx + dx * 0.2, -1020); c.quadraticCurveTo(fx + dx * 0.6, -1420 + Math.abs(dx) * 0.7, fx + dx * 1.1, -380); c.stroke(); }
  // bench + lamp on the left
  c.fillStyle = '#8A5A3A'; rr(c, -2150, -700, 700, 70, 10); c.fill(); rr(c, -2150, -520, 700, 60, 10); c.fill(); c.fillRect(-2120, -460, 40, 230); c.fillRect(-1530, -460, 40, 230); c.fillRect(-2120, -820, 40, 170);
  c.fillStyle = '#2B2F3A'; c.fillRect(-1230, -1700, 30, 1440); c.fillStyle = '#FFE7B8'; rr(c, -1290, -1840, 150, 170, 20); c.fill();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BG = { park: mkBG(drawPark) };

// ---------------- timing helpers
const FX = -380, HX = 330;                    // friend / her base x
const hardPose = (t, L) => L === 'A1' && t < ev('A1', 'photo');
function herX(t, L) { if (L === 'A2') { const a = ev('A2', 'mv1'), b = ev('A2', 'mv2'); return HX + 160 * eIO(P(t, a, a + 0.5)) + 170 * eIO(P(t, b, b + 0.5)); } return HX; }
function pigeonState(t, L) { const base = { face: -1, pose: 'idle', t, glasses: false }; let x = 1250, y = 0, s = 0.62;
  if (L === 'hook' || L === 'A1' || L === 'A2' || L === 'B1') return { ...base, x, y, s };
  if (L === 'B2') { const a = ev('B2', 'pigeon'), b = ev('B2', 'snap') + 0.35;
    if (t < a) return { ...base, x, y, s };
    if (t < b) { const k = eIO(P(t, a, b)); return { ...base, pose: 'fly', x: lerp(1250, -80, k), y: lerp(-80, -520, Math.sin(k * Math.PI)) - k * 150, s: lerp(0.62, 2.2, k), face: -1 }; }
    return { ...base, x: 760, y: 0, s: 0.62 }; }
  if (L === 'C1') return { ...base, x: 760, y: 0, s };
  if (L === 'C2') { const a = ev('C2', 'strut'), gl = t >= ev('C2', 'glasses'); const k = eIO(P(t, a, a + 1.5)); return { ...base, pose: t > a && t < a + 1.5 ? 'strut' : 'idle', x: lerp(760, 1020, k), y: 0, s: gl ? 1.0 : lerp(0.62, 0.74, k), glasses: gl, face: -1 }; }
  return { ...base, x, y, s }; }
const agentX = t => { const a = ev('C2', 'man'); return lerp(1900, 640, eOut(P(t, a, a + 0.9))); };
const agentIn = t => t > ev('C2', 'man');
const lyingFriend = (t, L) => L === 'B1' && t >= ev('B1', 'lie') && t < SP.b1_f2.t + 1.2 + 0.0 && true;
const flashAmt = t => { let a = 0; for (const s of TL.sfx) if (s.n === 'shutter' && t >= s.t && t < s.t + 0.25) a = Math.max(a, Math.exp(-(t - s.t) * 18)); return a; };

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const hip = (g, s) => reach(g, s, s * g.sw * 1.15, g.ySh + 400, { planar: true });
const aim = (g) => ({ armR: reach(g, 1, g.sw * 0.55, g.ySh - 60), armL: reach(g, -1, g.sw * 0.05, g.ySh - 30) });
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'happy', turn: -0.35, look: -0.7, armL: hang(g, -1), armR: hang(g, 1), items: {}, x: herX(t, L) };
  const pose = () => { st.mood = 'happy'; st.armL = hip(g, -1); st.armR = reach(g, 1, g.hw * 1.1, g.headY - g.hh * 0.2); st.turn = -0.15; st.look = -0.4; st.tilt = 0.06; };
  if (L === 'hook') { pose(); if (t > hev('cut') - 0.1) { st.mood = 'angry'; st.tilt = 0; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 300, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 300, { planar: true, fist: true }); st.turn = 0; st.look = 0; } return st; }
  if (L === 'A1') { pose(); if (t > e('snap') - 0.04 && t < e('snap') + 0.15) st.blink = 1; if (t > e('photo') - 0.05) { st.mood = 'worried'; st.tilt = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); } if (speaking('a1_h2', t, 0.05, 0.4)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 120, { planar: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 120, { planar: true }); } }
  if (L === 'A2') { st.mood = 'neutral'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 150); } if (t > e('mv1') - 0.05 && t < SP.a2_h2.t - 0.3) { st.legPose = 'walk'; st.mood = 'smug'; st.turn = -0.6; st.look = -0.9; }
    if (t >= e('mv2') + 0.55 && t < e('snap')) { st.legPose = 'stand'; pose(); } if (t > e('snap') - 0.04 && t < e('snap') + 0.15) st.blink = 0; if (speaking('a2_h2', t, 0.05, 0.4)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 260, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 260, { planar: true }); } }
  if (L === 'B1') { st.mood = 'worried'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'worried'; gest(st, g, 'her', t, 1, 150); } if (t > e('below') - 0.1) { st.mood = 'smug'; st.armL = hip(g, -1); st.armR = hip(g, 1); } if (t > e('lie') && t < SP.b1_h2.t + 0.3) { st.mood = 'surprised'; st.armL = hang(g, -1); }
    if (speaking('b1_h2', t, 0.05, 0.3)) { st.mood = 'confused' in {} ? 'surprised' : 'surprised'; } if (speaking('b1_h3', t, 0.05, 0.4)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 250, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 250, { planar: true, fist: true }); } }
  if (L === 'B2') { st.mood = 'neutral'; if (speaking('b2_h', t, 0.05, 0.3)) { st.mood = 'worried'; gest(st, g, 'her', t, 1, 150); } if (t > e('pose') - 0.05) { pose(); st.mood = 'happy'; st.tilt = 0.1; } if (t > e('pigeon') + 0.3 && t < e('photo')) { st.mood = 'shock'; st.blink = 0; st.tilt = 0; st.turn = -0.6; st.look = -1; }
    if (t >= e('photo')) { st.mood = 'angry'; st.tilt = 0; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 300, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 300, { planar: true, fist: true }); } }
  if (L === 'C1') { st.mood = 'tired'; st.armL = hip(g, -1); st.armR = hip(g, 1); if (speaking('c1_h', t, 0.05, 0.3) || speaking('c1_h2', t, 0.05, 0.3)) { st.mood = 'angry'; gest(st, g, 'her', t, 1, 150); } if (t > e('likes') - 0.05) { st.mood = 'surprised'; st.armR = hang(g, 1); } if (speaking('c1_h3', t, 0.05, 0.4)) st.mood = 'confused' in {} ? 'surprised' : 'surprised'; }
  if (L === 'C2') { st.mood = 'neutral'; st.armL = hip(g, -1); st.armR = hang(g, 1); if (speaking('c2_h', t, 0.05, 0.3)) { st.mood = 'happy'; } if (speaking('c2_h2', t, 0.05, 0.4)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 300, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 300, { planar: true, fist: true }); }
    if (speaking('c2_h3', t, 0.05, 0.3)) st.mood = 'bored'; if (t > e('man')) { st.turn = 0.3; st.look = 0.7; } if (speaking('c2_h4', t, 0.05, 0.4)) { st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 330, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 330, { planar: true, fist: true }); }
    if (t > e('glasses') - 0.1) { st.mood = 'annoyed'; st.turn = 0.3; st.look = 0.7; } if (speaking('c2_h5', t, 0.05, 0.4)) { st.mood = 'angry'; st.armL = hip(g, -1); st.armR = hip(g, 1); st.turn = 0.1; st.look = 0.3; }
    if (t > e('look') - 0.05) { st.mood = 'neutral'; st.turn = 0; st.look = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); st.blink = 0; } }
  return st; }
function friendState(t, L) { const g = G.fri, e = k => ev(L, k), st = { t, talk: talk('pfr', t), mood: 'happy', turn: 0.45, look: 0.8, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const shoot = () => { Object.assign(st, aim(g)); st.items = { R: phoneItem }; st.mood = 'happy'; st.lookY = 0; };
  if (L === 'hook') { shoot(); if (t > hev('cut') - 0.1) { st.mood = 'smug'; } return st; }
  if (L === 'A1') { shoot(); if (t > e('photo') - 0.05) { st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 120); st.armL = hang(g, -1); st.mood = 'worried'; } if (speaking('a1_f3', t, 0.05, 0.5)) st.mood = 'worried'; }
  if (L === 'A2') { shoot(); if (t > SP.a2_f3.t) st.mood = 'smug'; if (t > e('photo') - 0.05) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 120); st.armL = hang(g, -1); } if (speaking('a2_f', t, 0.05, 0.3) || speaking('a2_f2', t, 0.05, 0.3)) { st.armL = reach(g, -1, g.sw * 1.4, g.ySh - 100, { planar: true }); } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_f', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 100); }
    if (t > e('below') - 0.05 && t < e('above') - 0.05) { shoot(); st.legPose = 'squat'; st.drop = 520; st.legs = true; }
    if (t > e('above') - 0.05 && t < e('lie') - 0.05) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 0.5, g.headY - 380); st.armL = reach(g, -1, g.sw * 0.2, g.headY - 300); st.lookY = -0.6; st.mood = 'happy'; }
    if (t >= e('lie') - 0.05) { shoot(); st.mood = 'smug'; st.turn = 0.5; } if (t >= e('photo') + 0.0) { st.mood = 'happy'; } }
  if (L === 'B2') { st.mood = 'happy'; if (speaking('b2_f', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 280, { planar: true }); } if (t > e('pose') - 0.1 && t < e('photo')) shoot(); if (t > e('pigeon') + 0.3 && t < e('photo')) st.mood = 'surprised'; if (t >= e('photo')) { st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 120); st.armL = hang(g, -1); st.mood = 'smug'; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_f', t, 0.05, 0.3)) { st.mood = 'smug'; gest(st, g, 'pfr', t, 1, 150); } if (t > e('lookph') - 0.05) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh - 40); st.lookY = 0.5; st.mood = 'surprised'; } if (speaking('c1_f3', t, 0.05, 0.5)) { st.mood = 'smug'; st.lookY = 0; st.armR = reach(g, 1, g.sw * 0.7, g.ySh + 120); st.items = { R: phoneItem }; } }
  if (L === 'C2') { st.mood = 'neutral'; if (t > ev('C2', 'views') - 0.5) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh - 40); st.lookY = 0.5; st.mood = 'surprised'; } if (speaking('c2_f2', t, 0.05, 0.4)) st.mood = 'smug'; if (speaking('c2_f4', t, 0.05, 0.4)) { st.mood = 'happy'; st.lookY = 0; }
    if (speaking('c2_f3', t, 0.05, 0.3)) { st.mood = 'smug'; st.lookY = 0; } if (t > ev('C2', 'glasses') - 0.1) { st.mood = 'happy'; st.laugh = true; st.lookY = 0; } if (speaking('c2_f5', t, 0.05, 0.4)) { st.mood = 'smug'; st.laugh = false; Object.assign(st, aim(g)); st.items = { R: phoneItem }; st.lookY = 0; } }
  return st; }
function agentState(t) { const g = G.agent, st = { t, talk: talk('agent', t), mood: 'happy', turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: { R: folderItem } };
  st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 140); const a = ev('C2', 'man'); if (t < a + 0.9) st.legPose = 'walk'; gest(st, g, 'agent', t, -1, 120); if (speaking('c2_m2', t, 0.05, 0.4)) st.mood = 'smug'; return st; }

// ---------------- the world: park + characters by shot tag (clean singles draw only the tagged character)
const TAGS = { park: ['her', 'fri', 'agent', 'pig'], her: ['her'], fri: ['fri'], pig: ['pig'], agent: ['agent'], hp: ['her', 'pig'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = TAGS[tag] || TAGS.park, heads = {};
  c.drawImage(BG.park, BX0, BY0, BW, BH);
  const pg = pigeonState(t, L), flying = pg.pose === 'fly';
  if (who.includes('pig') && !flying) pigeon(c, pg.x, pg.y, pg.s, pg);
  if (who.includes('fri')) { const st = friendState(t, L);
    if (lyingFriend(t, L) && tag === 'park') { c.save(); c.translate(-1500, -70); c.rotate(Math.PI / 2 * 0.97); c.scale(0.8, 0.8); const h = K.put(c, FRI, st, 0, 0); c.restore(); const M = c.getTransform(); heads.pfr = { x: -1500 + 1280, y: -150, hh: 130 }; }
    else { const h = K.put(c, FRI, st, FX, 0); heads.pfr = h; } }
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(t, L), 0);
  if (who.includes('agent') && agentIn(t) && L === 'C2') heads.agent = K.put(c, AGENT, agentState(t), agentX(t), 0);
  if (who.includes('pig') && flying) pigeon(c, pg.x, pg.y, pg.s, pg);
  if (L === 'C2' && t > ev('C2', 'glasses')) { for (let i = 0; i < 4; i++) { const ph = (t - ev('C2', 'glasses')) * 7 + i * 1.7, k = Math.max(0, Math.sin(ph)); if (k > 0.2) { c.save(); c.translate(pg.x - 320 + i * 220, -330 - (i % 2) * 180); c.rotate(ph); c.fillStyle = `rgba(255,255,255,${k * 0.9})`; for (let r = 0; r < 4; r++) { c.rotate(Math.PI / 4); c.fillRect(-6, -60 * k, 12, 120 * k); } c.restore(); } } }
  for (const k of ['pfr', 'agent']) if (!heads[k]) heads[k] = OFF; if (!heads.her) heads.her = OFFL; return heads; }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hUp = G.her.headY, fHY = G.fri.headY, aHY = G.agent.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(250, fy(hUp, 0.6, 1210), 0.6, 'park'), WIDE: S(300, -900, 0.5, 'park'), PIG_CU: S(1020, -230, 1.3, 'park'), WIDE_B: S(-100, -900, 0.5, 'park'), WIDE_F: S(300, fy(hUp, 0.55, 1000), 0.55, 'park'), CARD: S(260, fy(hUp, 0.62, 1180), 0.62, 'park'),
  HER: S(HX, fy(hUp, 1.0), 1.0, 'her'), HER_R: S(HX, fy(hUp, 1.0, 1120), 1.0, 'her'), HER_CU: S(HX, fy(hUp, 1.6, 960), 1.6, 'her'), HER_CU_H: S(HX, fy(hUp, 1.5, 1300), 1.5, 'her'), HER_A2: S(HX + 330, fy(hUp, 1.0), 1.0, 'her'),
  FRI: S(FX, fy(fHY, 1.0), 1.0, 'fri'), FRI_R: S(FX, fy(fHY, 1.0, 1120), 1.0, 'fri'), AGENT: S(640, fy(aHY, 1.0), 1.0, 'agent'),
  PHOTO: U('photo', 1), PHONE: U('phone', 2), FEED: U('feed', 3), VIEWS: U('views', 4), FAMOUS: U('famous', 5), BLACK: U('black', 6) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cut') - 0.05) return SH.COVER; if (t < SP.hook_h2.t - 0.1) return f(SH.PHONE); return f(SH.HER_CU_H); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('black') - 0.03) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('photo') - 0.05 && t < SP.a1_h2.t - 0.1) return f(SH.PHOTO);
  if (L === 'A2') { if (t > e('photo') - 0.05 && t < SP.a2_h2.t - 0.1) return f(SH.PHOTO); if (t > e('mv1') - 0.3 && t < e('photo') - 0.05 && !sp('a2_f3')) return f(SH.WIDE_F); if (sp('a2_f') || sp('a2_f2') || sp('a2_f3')) return f(SH.WIDE_F); }
  if (L === 'B1') { if (t > e('below') - 0.05 && t < SP.b1_f2.t - 0.1) return f(SH.WIDE_B); if (t > e('photo') - 0.05 && t < SP.b1_h3.t - 0.1) return f(SH.PHOTO); }
  if (L === 'B2') { if (t > e('pose') - 0.05 && t < e('pigeon') - 0.05 && !sp('b2_f2')) return f(SH.WIDE); if (t > e('pigeon') - 0.05 && t < e('photo') - 0.05) return f(SH.WIDE_F); if (t > e('photo') - 0.05 && t < SP.b2_h2.t - 0.1) return f(SH.PHOTO); }
  if (L === 'C1') { if (t > e('likes') - 0.05 && t < SP.c1_h3.t - 0.1) return f(SH.FEED); if (sp('c1_f2')) return f(SH.FRI_R); }
  if (L === 'C2') { if (t > e('views') - 0.05 && t < SP.c2_f.t - 0.1) return f(SH.VIEWS); if (t > e('famous') - 0.05 && t < SP.c2_h2.t - 0.1) return f(SH.FAMOUS); if (t > e('strut') - 0.05 && t < SP.c2_m.t - 0.1) return f(SH.WIDE_F); if (sp('c2_m') || sp('c2_m2')) return f(SH.AGENT);
    if (t > e('glasses') - 0.05 && t < e('year') + 0.1) return f(SH.PIG_CU); if (t > e('glasses') - 0.05 && t < SP.c2_f5.t - 0.1 && !sp('c2_h5')) return f(SH.WIDE_F); if (t > e('look') - 0.05) return f(SH.HER_CU); if (sp('c2_h3')) return f(SH.WIDE_F); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? (L === 'A2' ? SH.HER_A2 : SH.HER) : who === 'pfr' ? SH.FRI : who === 'agent' ? SH.AGENT : SH.HER;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- full-screen photos and the phone feed
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1560, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
// content of a photo, origin = centre of an 820 x 960 frame
function photoContent(c, kind, t) { c.save(); c.beginPath(); c.rect(-410, -480, 820, 960); c.clip();
  c.drawImage(BG.park, 100, 600, 1300, 1400, -410, -480, 820, 960);
  const fount = () => { c.save(); c.translate(0, 140); paint(c, q => { q.m(-300, 120); q.l(300, 120); q.l(270, 260); q.l(-270, 260); q.z(); }, '#C9D3DC', { sd: 8, hd: 4, lw: 4 }); c.fillStyle = '#9ED8F2'; c.beginPath(); c.ellipse(0, 120, 300, 46, 0, 0, TAU); c.fill(); paint(c, q => { q.m(-34, 120); q.l(34, 120); q.l(22, -230); q.l(-22, -230); q.z(); }, '#C9D3DC', { sd: 6, hd: 3, lw: 4 }); paint(c, q => q.e(0, -230, 130, 30), '#B9C4CE', { sd: 6, hd: 3, lw: 4 });
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 9; c.lineCap = 'round'; for (const dx of [-160, -80, 0, 80, 160]) { c.beginPath(); c.moveTo(dx * 0.15, -240); c.quadraticCurveTo(dx * 0.6, -400 + Math.abs(dx) * 0.8, dx * 1.2, 110); c.stroke(); } c.restore(); };
  c.fillStyle = '#C9B48A'; c.fillRect(-410, 330, 820, 150);
  if (kind === 'eyes') { fount(); const g = G.her; K.put(c, HER, { t, mood: 'happy', blink: 1, turn: 0, look: 0, armL: hip(g, -1), armR: reach(g, 1, g.hw * 1.1, g.headY - g.hh * 0.2), tilt: 0.06 }, 0, 470, 0.46); }
  if (kind === 'fountain') { fount(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(360, 420, 0, 0, TAU); c.fill(); }
  if (kind === 'foot') { fount(); const g = G.her; K.put(c, HER, { t, mood: 'happy', turn: 0, look: 0, armL: hip(g, -1), armR: reach(g, 1, g.hw * 1.1, g.headY - g.hh * 0.2) }, 0, -40, 0.2);
    paint(c, q => { q.m(-330, 480); q.l(330, 480); q.l(110, -10); q.l(-110, -10); q.z(); }, '#4A6FA8', { sd: 10, hd: 5, lw: 5 });                                          // giant leg
    paint(c, q => { q.m(-420, 480); q.l(-420, 330); q.q(-300, 250, -120, 330); q.l(330, 330); q.q(470, 350, 470, 430); q.l(470, 480); q.z(); }, '#FFFDF8', { sd: 10, hd: 5, lw: 5 });          // giant sneaker
    c.fillStyle = '#E0474C'; c.fillRect(-420, 440, 890, 22); c.strokeStyle = '#C9C3B4'; c.lineWidth = 6; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-160 + i * 60, 340); c.lineTo(-130 + i * 60, 380); c.stroke(); } }
  if (kind === 'pigeon') { fount(); const g = G.her; K.put(c, HER, { t, mood: 'shock', blink: 0, turn: 0, look: 0, armL: hang(g, -1), armR: hang(g, 1) }, -300, 470, 0.58); pigeon(c, 150, 560, 3.0, { face: 1, pose: 'idle', t: 0.5 }); }
  c.restore(); }
function photoFrame(c, kind, t, k, ang, label, sub) { c.save(); c.translate(540, 800); c.rotate(ang); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -460 + 14, -540 + 22, 920, 1180, 18); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -460, -540, 920, 1180, 18); c.fill(); c.save(); c.translate(0, -60); photoContent(c, kind, t); c.restore();
  c.fillStyle = '#3E471E'; fitTxt(c, label, 0, 540, 54, '#3E471E', 780, 'Cav9'); c.restore(); }
const PH = { A1: ['eyes', 'ФОТО №1', -0.03], A2: ['fountain', 'ФОТО №2', 0.025], B1: ['foot', 'ФОТО №…', -0.025], B2: ['pigeon', 'ФОТО!', 0.02] };
function photoView(c, t, L) { backdrop(c, 'photo'); const [kind, lab, ang] = PH[L], a = ev(L, 'photo'), k = eBack(P(t, a, a + 0.3), 1.8); photoFrame(c, kind, t, k, ang, lab);
  const cap = { A1: '«У МЕНЯ ЗАКРЫТЫ ГЛАЗА!»', A2: '«ГДЕ Я? ТОЛЬКО ФОНТАН»', B1: '«ОГРОМНАЯ НОГА, КРОШЕЧНАЯ ГОЛОВА»', B2: '«ГОЛУБЬ ЗАКРЫЛ ВСЁ ЛИЦО»' }[L]; caption(c, cap, clamp(P(t, a + 0.3, a + 0.5)), 1580);
  const f = flashAmt(t); if (f > 0) { c.fillStyle = `rgba(255,255,255,${f * 0.8})`; c.fillRect(0, 0, W, HH); } }
function gridThumbs(c, t, a) { const kinds = ['eyes', 'fountain', 'foot', 'pigeon', 'eyes', 'fountain', 'foot', 'pigeon', 'eyes']; kinds.forEach((kd, i) => { const col = i % 3, row = Math.floor(i / 3), k = eBack(P(t, a + 0.1 + i * 0.07, a + 0.4 + i * 0.07), 1.8); if (k <= 0) return;
  c.save(); c.translate(260 + col * 280, 1250 + row * 190); c.scale(k, k); c.beginPath(); c.rect(-120, -85, 240, 170); c.clip(); c.fillStyle = '#FFFDF8'; c.fillRect(-120, -85, 240, 170); c.save(); c.translate(0, 4); c.scale(0.19, 0.19); photoContent(c, kd, t); c.restore(); c.restore(); }); }
function phoneView(c, t) { backdrop(c, 'phone'); const a = hev('cut'), k = eBack(P(t, a, a + 0.25), 1.6), n = Math.round(1 + 846 * eOut(P(t, a + 0.1, a + 1.1)));
  c.save(); c.translate(540, 840); c.scale(k, k); c.fillStyle = '#FFFDF8'; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -440, -150, 880, 300, 40); c.fill(); c.stroke(); fitTxt(c, 'PHOTOS TAKEN:', 0, -70, 56, '#3E471E', 780); fitTxt(c, String(n), 0, 45, 150, '#E0474C', 780); c.restore();
  c.save(); c.fillStyle = '#12141A'; rr(c, 80, 1130, 920, 640, 36); c.fill(); c.restore(); gridThumbs(c, t, a + 0.2);
  caption(c, '*847 фотографий… и ни одной хорошей*', clamp(P(t, a + 1.0, a + 1.2)), 1045, C.white);
  const f = flashAmt(t); if (f > 0) { c.fillStyle = `rgba(255,255,255,${f * 0.6})`; c.fillRect(0, 0, W, HH); } }
const fmt = n => Math.round(n).toLocaleString('en-US');
function feedView(c, t) { backdrop(c, 'feed'); const a = ev('C1', 'likes'), k = eBack(P(t, a, a + 0.3), 1.6), likes = 1200 * eOut(P(t, a + 0.5, a + 1.6));
  c.save(); c.translate(540, 820); c.scale(k, k); c.fillStyle = '#FFFDF8'; rr(c, -440, -640, 880, 1340, 36); c.fill(); c.fillStyle = '#3C8FE0'; c.beginPath(); c.arc(-370, -575, 34, 0, TAU); c.fill(); fitTxt(c, '@my_best_friend', -310, -575, 40, '#2B2F3A', 560, 'Nun9', 'left');
  c.save(); c.translate(0, -60); c.scale(0.92, 0.92); photoContent(c, 'pigeon', t); c.restore();
  c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(-380, 560); c.bezierCurveTo(-440, 500, -350, 440, -380, 480); c.bezierCurveTo(-410, 440, -320, 500, -380, 560); c.fill(); fitTxt(c, 'PHOTO OF PIGEON', -330, 500, 46, '#3E471E', 700, 'Unb9', 'left'); fitTxt(c, fmt(likes) + ' LIKES', -330, 610, 62, '#E0474C', 700, 'Unb9', 'left'); c.restore();
  caption(c, '«ФОТО ГОЛУБЯ: 1 200 ЛАЙКОВ»', clamp(P(t, a + 0.4, a + 0.6)), 1580); }
function viewsView(c, t) { backdrop(c, 'views'); const a = ev('C2', 'views'), k = eBack(P(t, a, a + 0.3), 1.6), q = eOut(P(t, a + 0.2, a + 1.3));
  c.save(); c.translate(540, 820); c.scale(k, k); c.fillStyle = '#FFFDF8'; rr(c, -440, -560, 880, 1120, 36); c.fill(); fitTxt(c, 'PIGEON POST', 0, -480, 54, '#3E471E', 780);
  [['VIEWS', 2400000 * q, '#3C8FE0'], ['LIKES', 910000 * q, '#E0474C'], ['SHARES', 120000 * q, '#4CAF6A']].forEach(([lab, v, col], i) => { const y = -320 + i * 190; fitTxt(c, lab, -380, y - 40, 36, '#8A8480', 300, 'Unb9', 'left'); fitTxt(c, fmt(v), -380, y + 30, 92, col, 780, 'Unb9', 'left'); });
  c.strokeStyle = '#EE5E9A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-380, 460); for (let i = 1; i <= 20; i++) { const u = i / 20; if (u > q) break; c.lineTo(-380 + u * 760, 460 - Math.pow(u, 2.4) * 280); } c.stroke(); c.restore();
  caption(c, '«ПРОСМОТРЫ РАСТУТ…»', clamp(P(t, a + 0.3, a + 0.5)), 1580); }
function famousView(c, t) { backdrop(c, 'famous'); const a = ev('C2', 'famous'), k = eBack(P(t, a, a + 0.3), 1.8);
  for (let i = 0; i < 26; i++) { const x = (hash(i) * W + Math.sin(t * 3 + i) * 30), y = ((t * 220 + hash(i + 9) * HH) % HH); c.fillStyle = ['#EE5E9A', '#F2C14E', '#7CF29A', '#7FB0D8'][i % 4]; c.save(); c.translate(x, y); c.rotate(t * 4 + i); c.fillRect(-9, -18, 18, 36); c.restore(); }
  c.save(); c.translate(540, 860); c.scale(k, k); c.rotate(-0.02); c.fillStyle = '#FFFDF8'; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -440, -600, 880, 1200, 36); c.fill(); c.stroke(); c.save(); c.translate(0, -140); c.scale(0.86, 0.86); photoContent(c, 'pigeon', t); c.restore();
  c.fillStyle = '#EE5E9A'; rr(c, -420, 250, 840, 320, 28); c.fill(); fitTxt(c, "THE INTERNET'S", 0, 320, 50, '#FFFFFF', 760); fitTxt(c, 'NEW FAVORITE', 0, 400, 62, '#FFE15A', 760); fitTxt(c, 'PIGEON.', 0, 490, 92, '#FFFFFF', 760); c.restore();
  caption(c, '«НОВЫЙ ЛЮБИМЕЦ ИНТЕРНЕТА — ГОЛУБЬ»', clamp(P(t, a + 0.3, a + 0.5)), 1580); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1620); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'ONE GOOD PHOTO?', 0, 4, 56, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['СКОЛЬКО ФОТО ДО', 'ОДНОГО ХОРОШЕГО?'], rows: [['A2', 'Can you take another one?'], ['B1', 'The perfect angle'], ['C1', 'A single decent photo'], ['C2', 'Incredibly photogenic']], cta: ['ОТПРАВЬ ДРУГУ-', 'ФОТОГРАФУ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her; pigeon(cc, 1250, 0, 1.0, { face: -1, pose: 'strut', t: tt, glasses: true });
      K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1) }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'park';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); K.hud(c, t, sc); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); const v = tag.slice(3); if (v === 'photo') photoView(c, t, L); else if (v === 'phone') phoneView(c, t); else if (v === 'feed') feedView(c, t); else if (v === 'views') viewsView(c, t); else if (v === 'famous') famousView(c, t); c.restore(); heads = { her: OFFL, pfr: OFF, agent: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); const f = flashAmt(t); if (f > 0) { c.fillStyle = `rgba(255,255,255,${f * 0.75})`; c.fillRect(0, 0, W, HH); } }
  const names = { pfr: ['FRIEND', '#3C8FE0'], agent: ['AGENCY', '#2F3E5C'] };
  if (L === 'hook') { if (tag === 'park' && t < SP.hook_h.t + 0.1) coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    if (!tag.startsWith('ui:')) K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_h: -0.2, hook_f: -0.1, hook_h2: 0.6 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A2' && t > e('mv1') && t < e('photo') - 0.1 && tag !== 'ui:photo') { K.pop(c, t, '← ЧУТЬ-ЧУТЬ →', e('mv1') + 0.05, e('photo') - 0.2, 540, 1330, C.pinkL, -0.05, 64); }
  if (L === 'B1' && t > e('below') && t < SP.b1_f2.t - 0.1) { const lab = t < e('above') ? 'СНИЗУ' : t < e('lie') ? 'СВЕРХУ' : 'ЛЁЖА'; K.pop(c, t, lab, e('below') - 0.05, SP.b1_f2.t - 0.15, 540, 1330, C.gold, -0.05, 84); }
  if (L === 'B2' && t > e('pigeon') && t < e('photo') - 0.1) K.pop(c, t, 'КУ-КУ-УУ!', e('pigeon') + 0.1, e('photo') - 0.25, 540, 1330, C.gold, -0.06, 84);
  if (L === 'C2' && t > e('glasses') && t < SP.c2_f5.t - 0.1) { const k = eBack(P(t, e('year'), e('year') + 0.35), 2.2); if (k > 0) { c.save(); c.translate(540, 1360); c.scale(k, k); c.rotate(-0.04); c.fillStyle = '#F2C14E'; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -430, -90, 860, 180, 36); c.fill(); c.stroke(); fitTxt(c, 'PIGEON OF', 0, -30, 70, C.oliveD, 760); fitTxt(c, 'THE YEAR', 0, 40, 76, '#E0474C', 760); c.restore(); } }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_f3: 0.5, a2_h2: 0.2, a2_f4: 0.3, b1_h3: 0.4, b2_f3: 0.3, c1_f2: 0.3, c1_h3: 0.3, c2_f2: 0.3, c2_h4: 0.3, c2_h5: 0.5, c2_f5: 0.6 } });
  K.hud(c, t, sc);
}
E.run('photo', NF, renderFrame);
