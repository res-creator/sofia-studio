// "When you can't say no" episode renderer (hard_cut camera): node cantsayno.js start end out.mp4 | --png=f1,f2
// Two sets: the street with the hotel entrance (hook start, A1, A2, B1 until INSIDE) and the hotel lobby with the reception
// desk (hook after CUT, rest of B1, B2, C1, C2). Her behind the desk on the left, the man / the guest in front of it,
// the queue of guests grows to the right. Shots tagged 'ui:<view>' (dollar, black) replace the world.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/cantsayno/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, EV } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2, ev = k => EV(k);
const hev = k => SC.hook.ev[k];

// ---------------- cast: her (green jumper), the man (Dan in a loud holiday shirt), the guest (Reggie), the queue
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#4CAF6A' }, bottom: { type: 'jeans', col: '#3B4A6A' } };
const MAN = { ...BASE.dan, cap: null, top: { type: 'tee', col: '#F28C28' }, bottom: { type: 'shorts', col: '#3B4A6A' } };
const GUEST = { ...BASE.reggie };
const QCAST = [BASE.margot, BASE.tom, BASE.priya, BASE.ben, BASE.linda, BASE.rita, BASE.oliver, BASE.agnes];
const G = { her: geom(HER), favor: geom(MAN), hguest: geom(GUEST) }; QCAST.forEach((q, i) => { G['q' + i] = geom(q); });
// street
const SHX = -300, SMX = 300;
// lobby
const HX = -500, LMX = 250, DESK = { x0: -980, x1: -40, top: -800 }, QX = 650, QSTEP = 270, DOORX = 1650;
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const lobbyAt = (t, L) => L === 'hook' ? (t < 0.45 || t > hev('cut') - 0.05) : L === 'B1' ? t > ev('inside') - 0.05 : !['A1', 'A2'].includes(L);

// ---------------- props
function bagShape(c, s, col) { c.save(); c.scale(s, s); c.strokeStyle = '#3E471E'; c.lineWidth = 10; c.beginPath(); c.arc(0, -150, 50, Math.PI, 0); c.stroke();
  paint(c, q => { q.m(-110, -150); q.l(110, -150); q.q(130, -20, 100, 0); q.l(-100, 0); q.q(-130, -20, -110, -150); q.z(); }, col, { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-90, -110, 180, 14); c.restore(); }
const bagItem = (s, col) => (ctx) => { ctx.save(); ctx.translate(0, 190 * s); bagShape(ctx, s, col); ctx.restore(); };
function suitcase(c, s, col = '#3C8FE0') { c.save(); c.scale(s, s); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.moveTo(-40, -330); c.lineTo(-40, -420); c.lineTo(40, -420); c.lineTo(40, -330); c.stroke();
  paint(c, q => { q.m(-130, -330); q.l(130, -330); q.l(130, 0); q.l(-130, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 }); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-90, -300, 20, 270); c.fillRect(70, -300, 20, 270);
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-90, 14, 16, 0, TAU); c.arc(90, 14, 16, 0, TAU); c.fill(); c.restore(); }
const caseItem = (ctx) => { ctx.save(); ctx.translate(0, 430 * 0.8); suitcase(ctx, 0.8, '#E0474C'); ctx.restore(); };
const phoneItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#2B2F3A'; rr(ctx, -34, -96, 68, 120, 12); ctx.fill(); ctx.fillStyle = '#7FB0D8'; rr(ctx, -26, -88, 52, 104, 8); ctx.fill(); ctx.restore(); };
const keysItem = (ctx) => { ctx.strokeStyle = '#C9A13B'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 10, 26, 0, TAU); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(0, 34); ctx.rotate(-0.5 + i * 0.5); ctx.fillStyle = '#F2C14E'; ctx.fillRect(-6, 0, 12, 70); ctx.fillRect(-6, 54, 22, 10); ctx.restore(); } };
const receiverItem = (ctx) => { ctx.save(); ctx.rotate(-0.3); ctx.fillStyle = '#2B2F3A'; rr(ctx, -20, -120, 40, 150, 18); ctx.fill(); ctx.restore(); };
const dollarItem = (ctx) => { ctx.save(); ctx.rotate(-0.2); ctx.fillStyle = '#9ED39A'; rr(ctx, -70, -70, 140, 66, 8); ctx.fill(); ctx.strokeStyle = '#2F7A4A'; ctx.lineWidth = 4; rr(ctx, -64, -64, 128, 54, 6); ctx.stroke(); txt(ctx, '$1', 0, -37, 34, '#2F7A4A'); ctx.restore(); };
function shades(c, gg, g, turn) { const hx = gg.head.x + turn * g.hw * 0.2, ey = gg.head.y + g.hh * 0.06;
  c.save(); c.fillStyle = '#16181F'; for (const s of [-1, 1]) { rr(c, hx + s * g.hw * 0.42 - g.hw * 0.31, ey - g.hh * 0.11, g.hw * 0.62, g.hh * 0.22, g.hh * 0.08); c.fill(); } c.fillRect(hx - g.hw * 0.14, ey - g.hh * 0.07, g.hw * 0.28, g.hh * 0.035); c.restore(); }
// lanyard badge on her chest (body coords: feet at 0)
const BADGE = { hotel: ['HOTEL', 'MANAGER', '#3C6FB4'], asst: ['ASSISTANT', 'MANAGER', '#E27D3C'], gm: ['GENERAL', 'MANAGER', '#8E5BD6'], ceo: ['', 'CEO', '#E0474C'] };
function badgeFor(t, L) { if (L === 'hook') return lobbyAt(t, L) ? 'hotel' : null; if (L === 'C1') return t > ev('badge1') + 0.25 ? 'asst' : null;
  if (L === 'C2') { if (t > ev('ceo')) return 'ceo'; if (t > ev('badge2')) return 'gm'; if (t > ev('unbadge') + 0.2) return null; return 'asst'; } return null; }
function badge(c, g, kind, pop = 1) { const b = BADGE[kind]; if (!b) return; const y = g.ySh + 170;
  c.strokeStyle = b[2]; c.lineWidth = 8; c.beginPath(); c.moveTo(-g.sw * 0.35, g.ySh + 20); c.lineTo(-40, y - 50); c.moveTo(g.sw * 0.35, g.ySh + 20); c.lineTo(40, y - 50); c.stroke();
  c.save(); c.translate(0, y); c.scale(pop, pop); c.fillStyle = '#FFFDF8'; c.strokeStyle = b[2]; c.lineWidth = 6; rr(c, -130, -55, 260, 120, 14); c.fill(); c.stroke(); c.fillStyle = b[2]; rr(c, -130, -55, 260, 30, 12); c.fill();
  if (b[0]) { fitTxt(c, b[0], 0, 4, 34, '#2B2F3A', 230); fitTxt(c, b[1], 0, 42, 34, '#2B2F3A', 230); } else fitTxt(c, b[1], 0, 22, 72, b[2], 230); c.restore(); }

// ---------------- sets (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3000, BW = 4800, BH = 4800, BS = 0.5;
function drawStreetBg(c) {
  c.fillStyle = '#BFE3F7'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#D9C6B0'; c.fillRect(BX0, -2800, 2900, 2560);                                  // shops on the left
  for (const wx of [-2200, -1500, -800]) { c.fillStyle = '#FFFDF8'; rr(c, wx, -2500, 420, 540, 12); c.fill(); c.fillStyle = '#9FC8E4'; rr(c, wx + 18, -2482, 384, 504, 8); c.fill(); }
  c.fillStyle = '#3C8FE0'; c.fillRect(-1800, -1500, 1500, 1260); c.fillStyle = '#FFFDF8'; rr(c, -1720, -1420, 1340, 800, 10); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -1500, -1700, 900, 160, 24); c.fill(); txt(c, 'BOOKS', -1050, -1620, 100, '#2B2F3A');
  // the hotel on the right: stone facade, gold sign, revolving door, red carpet
  c.fillStyle = '#EFE6D6'; c.fillRect(500, -2900, 1900, 2660); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -2900; y < -240; y += 90) c.fillRect(500, y, 1900, 6);
  for (const wx of [600, 1000, 1700, 2100]) for (const wy of [-2700, -2150]) { c.fillStyle = '#9FC8E4'; rr(c, wx, wy, 220, 380, 10); c.fill(); }
  c.fillStyle = '#2B3A67'; rr(c, 850, -1700, 1150, 200, 20); c.fill(); txt(c, 'GRAND HOTEL', 1425, -1600, 96, '#F2C14E');
  c.fillStyle = '#8A1C2E'; c.beginPath(); c.moveTo(900, -1480); c.lineTo(1950, -1480); c.lineTo(2050, -1300); c.lineTo(800, -1300); c.fill();
  c.fillStyle = '#C9A13B'; c.fillRect(1050, -1300, 750, 1060); c.fillStyle = '#BFE3F7'; for (let i = 0; i < 3; i++) c.fillRect(1090 + i * 240, -1260, 200, 980);
  c.fillStyle = '#4CAF6A'; for (const px of [880, 1970]) { c.beginPath(); c.arc(px, -560, 110, 0, TAU); c.fill(); c.fillStyle = '#8A5A36'; c.fillRect(px - 60, -470, 120, 230); c.fillStyle = '#4CAF6A'; }
  c.fillStyle = '#D8D2C6'; c.fillRect(BX0, -240, BW, 2100); c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -240, 8, 2100);
  c.fillStyle = '#B23A4E'; c.beginPath(); c.moveTo(1050, -240); c.lineTo(1800, -240); c.lineTo(2000, 600); c.lineTo(850, 600); c.fill();
  c.fillStyle = '#B9B2A4'; c.fillRect(BX0, 600, BW, 40); c.fillStyle = '#6A6F78'; c.fillRect(BX0, 640, BW, 1200);
}
function drawLobbyBg(c) {
  c.fillStyle = '#F3E3C8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#E2CDA8'; for (let x = BX0; x < BX0 + BW; x += 340) c.fillRect(x, -2900, 40, 2660);                     // panels
  c.fillStyle = '#8A1C2E'; c.fillRect(BX0, -700, BW, 460);                                                                   // wainscot
  // key rack behind the desk
  c.fillStyle = '#8A5A36'; rr(c, -1150, -1900, 560, 620, 16); c.fill();
  for (let r = 0; r < 4; r++) for (let i = 0; i < 5; i++) { const x = -1100 + i * 105, y = -1840 + r * 145; c.fillStyle = '#C9A13B'; c.beginPath(); c.arc(x + 30, y + 12, 9, 0, TAU); c.fill(); c.fillRect(x + 26, y + 20, 8, 46); txt(c, String(101 + r * 5 + i), x + 30, y + 92, 26, '#F3E3C8', 'Nun9'); }
  c.fillStyle = '#2B3A67'; rr(c, -260, -2300, 820, 170, 20); c.fill(); txt(c, 'RECEPTION', 150, -2215, 80, '#F2C14E');
  // revolving door on the right + chandelier
  c.fillStyle = '#C9A13B'; c.fillRect(DOORX - 330, -2100, 660, 1860); c.fillStyle = '#BFE3F7'; c.fillRect(DOORX - 290, -2060, 580, 1820); c.fillStyle = '#C9A13B'; c.fillRect(DOORX - 10, -2060, 20, 1820);
  txt(c, 'EXIT', DOORX, -2180, 60, '#2B3A67');
  c.fillStyle = '#F2C14E'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(560 + (i - 3) * 110, -2650 + Math.abs(i - 3) * 30, 30, 0, TAU); c.fill(); }
  for (const px of [-1700, 1050]) { c.fillStyle = '#C98B5A'; rr(c, px - 110, -560, 220, 320, 20); c.fill(); c.fillStyle = '#4CAF6A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(px - 80 + i * 32, -640 - (i % 2) * 70, 60, 110, (i - 2.5) * 0.25, 0, TAU); c.fill(); } }
  c.fillStyle = '#C9B48E'; c.fillRect(BX0, -240, BW, 2100); c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 260) c.fillRect(x, -240, 8, 2100);
}
const mk = fn => { const b = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = b.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); c.filter = 'blur(1.4px)'; fn(c); return b; };
const BG_STREET = mk(drawStreetBg), BG_LOBBY = mk(drawLobbyBg);
// wall clock above the key rack: 12:00 -> 12:45 at CLOCK
const CLK = { x: -300, y: -1650, r: 150 };
function clock(c, t, L) { const m = L === 'B1' ? 45 * eIO(P(t, ev('clock') + 0.2, ev('clock') + 1.0)) : ['B2', 'C1', 'C2'].includes(L) ? 45 + 10 * ['B2', 'C1', 'C2'].indexOf(L) : 0;
  paint(c, q => q.e(CLK.x, CLK.y, CLK.r, CLK.r), '#FFFDF8', { sd: 6, hd: 3, lw: 5 }); c.strokeStyle = '#2B2F3A'; c.lineWidth = 10; c.beginPath(); c.arc(CLK.x, CLK.y, CLK.r, 0, TAU); c.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(CLK.x + Math.sin(a) * CLK.r * 0.82, CLK.y - Math.cos(a) * CLK.r * 0.82, 7, 0, TAU); c.fill(); }
  const hand = (a, len, w) => { c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(CLK.x, CLK.y); c.lineTo(CLK.x + Math.sin(a) * len, CLK.y - Math.cos(a) * len); c.stroke(); };
  c.strokeStyle = '#2B2F3A'; hand(m / 60 * TAU, CLK.r * 0.8, 10); hand((m / 60) / 12 * TAU, CLK.r * 0.5, 14); }
function desk(c, t, L) { const { x0, x1, top } = DESK;
  paint(c, q => { q.m(x0 - 30, top - 40); q.l(x1 + 30, top - 40); q.l(x1 + 30, top); q.l(x0 - 30, top); q.z(); }, '#C9A13B', { sd: 5, hd: 3, lw: 4 });
  paint(c, q => { q.m(x0, top); q.l(x1, top); q.l(x1, 40); q.l(x0, 40); q.z(); }, '#6B3A2A', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#F2C14E'; rr(c, (x0 + x1) / 2 - 240, top + 150, 480, 110, 16); c.fill(); txt(c, 'FRONT DESK', (x0 + x1) / 2, top + 206, 54, '#6B3A2A');
  // desk bell + phone (rings in B2 until she picks it up)
  c.fillStyle = '#C9A13B'; c.beginPath(); c.arc(x1 - 140, top - 40, 40, Math.PI, 0); c.fill();
  const ring = L === 'B2' && t > ev('ring') && t < ev('pickup'), jit = ring ? Math.sin(t * 60) * 8 : 0, off = L === 'B2' && t > ev('pickup') && t < endOf('b2_her3') + 0.3;
  c.save(); c.translate(x0 + 200 + jit, top - 40); c.fillStyle = '#2B2F3A'; rr(c, -80, -50, 160, 50, 12); c.fill(); if (!off) { c.fillStyle = '#3A3F4B'; rr(c, -90, -86, 180, 36, 18); c.fill(); } c.restore();
  if (ring) for (let k = 0; k < 2; k++) { c.strokeStyle = '#E0474C'; c.lineWidth = 8; c.beginPath(); c.arc(x0 + 200, top - 110, 50 + k * 40 + (t * 120) % 40, -2.4, -0.7); c.stroke(); } }
// bags: in her hands in A1, on the ground in A2/B1 street, a pile next to the desk in the lobby that grows each level
const BAGCOL = ['#8E5BD6', '#E9A23B', '#3C8FE0', '#EE5E9A', '#4CAF6A', '#E0474C', '#5E6B2F', '#F2C14E'];
function pile(c, L) { const n = { hook: 8, B1: 2, B2: 3, C1: 5, C2: 7 }[L] || 0;
  for (let i = 0; i < n; i++) { const x = -1250 - (i % 3) * 210 + (Math.floor(i / 3) % 2) * 100, y = 20 - Math.floor(i / 3) * 230; c.save(); c.translate(x, y); if (i % 2) suitcase(c, 0.8, BAGCOL[i]); else bagShape(c, 1.1, BAGCOL[i]); c.restore(); } }

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const onDesk = (g, s) => reach(g, s, s * g.sw * 1.0 + 60, DESK.top + 30);
function herX(t, L) { if (L === 'A2') { const l = ev('left'), r = ev('right'); return SHX - 160 * eIO(P(t, l, l + 0.4)) + 160 * eIO(P(t, r, r + 0.4)) + 160 * eIO(P(t, r, r + 0.4)); } return lobbyAt(t, L) ? HX : SHX; }
function herState(t, L) { const g = G.her, lob = lobbyAt(t, L), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.35, look: 0.8, armL: hang(g, -1), armR: hang(g, 1) };
  if (lob) { st.armL = onDesk(g, -1); st.armR = onDesk(g, 1); }
  gest(st, g, 'her', t, -1, 160);
  const bk = badgeFor(t, L); if (bk) { const p = L === 'C2' && t > ev('ceo') ? eBack(P(t, ev('ceo'), ev('ceo') + 0.35), 2.5) : L === 'C2' && t > ev('badge2') ? eBack(P(t, ev('badge2'), ev('badge2') + 0.35), 2.5) : 1; st.afterTorso = cc => badge(cc, g, bk, p); }
  if (L === 'hook') { if (!lob || t < 0.45) { st.mood = t < 0.45 ? 'shock' : 'happy'; if (t < 0.45) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 200, { planar: true }); } }
    else { st.mood = 'shock'; st.blink = 0; if (speaking('hook_her2', t, 0.05, 0.5)) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 200, { planar: true }); } }
    if (speaking('hook_her', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'A1') { st.mood = 'happy'; const b1 = ev('bag1'), b2 = ev('bag2');
    if (t > b1) { st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 300); st.items = { R: bagItem(0.8, BAGCOL[0]) }; }
    if (t > b2) { st.armL = reach(g, -1, -g.sw * 1.2, g.ySh + 330); st.items = { R: bagItem(0.8, BAGCOL[0]), L: bagItem(1.6, BAGCOL[1]) }; st.tilt = -0.07; st.headX = -20; st.mood = 'worried'; st.laugh = true; }
    if (speaking('a1_her2', t, 0.05, 0.2)) st.laugh = true; }
  if (L === 'A2') { st.mood = 'happy'; const ph = ev('phone') + 0.3;
    if (t > ph) { st.items = { R: phoneItem }; st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 280, { planar: true }); st.armL = reach(g, -1, g.sw * 0.9, g.ySh - 230, { planar: true }); st.turn = 0.4; st.look = 0.9; }
    if ((t > ev('left') && t < ev('left') + 0.4) || (t > ev('right') && t < ev('right') + 0.4)) st.legPose = 'walk';
    if (t > ev('counter')) { st.mood = 'tired'; }
    if (t > ev('shake')) { st.mood = 'tired'; const j = Math.sin(t * 50) * 14; st.armR = reach(g, 1, g.sw * 1.7 + j, g.ySh - 280 + j, { planar: true }); st.armL = reach(g, -1, g.sw * 0.9 + j, g.ySh - 230 - j, { planar: true }); st.headX = Math.sin(t * 40) * 4; }
    if (speaking('a2_her', t, 0.05, 0.2)) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'B1') { if (!lob) { st.mood = 'neutral'; if (speaking('b1_her', t, 0.05, 0.3)) { st.mood = 'worried'; st.laugh = true; } }
    else { st.mood = 'worried'; if (t > ev('keys') && t < ev('leave')) { st.armR = reach(g, 1, LMX - HX - 260, DESK.top - 120); st.items = { R: keysItem }; }
      if (t > ev('leave')) { st.items = { R: keysItem }; st.armR = onDesk(g, 1); st.turn = 0.5; st.look = 1; }
      if (speaking('b1_her2', t, 0.05, 0.2)) st.mood = 'skeptical';
      if (t > ev('clock')) { st.mood = 'tired'; st.turn = 0; st.look = 0.2; st.lookY = -0.4; } } }
  if (L === 'B2') { st.mood = 'neutral';
    if (speaking('b2_her', t, 0.05, 0.2)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 60, { planar: true }); }
    if (t > ev('lookaround') && t < SP.b2_her2.t) { const u = P(t, ev('lookaround'), ev('lookaround') + 0.6); st.turn = Math.sin(u * TAU) * 0.6; st.look = st.turn * 1.4; st.mood = 'worried'; }
    if (speaking('b2_her2', t, 0.05, 0.3)) { st.mood = 'worried'; st.laugh = true; }
    if (t > ev('pickup')) { st.armR = reach(g, 1, g.hw * 0.9, g.headY + g.hh * 0.3); st.items = { R: receiverItem }; st.headFirst = true; st.mood = 'neutral'; }
    if (speaking('b2_her3', t, 0.05, 0.3)) { st.mood = 'happy'; }
    if (t > ev('queue')) { st.mood = 'shock'; st.turn = 0.6; st.look = 1; } }
  if (L === 'C1') { st.mood = 'annoyed';
    if (speaking('c1_her', t, 0.05, 0.2)) st.mood = 'angry';
    if (t > ev('point') - 0.05 && t < SP.c1_m2.t) { st.armL = reach(g, -1, g.sw * 2.6, g.ySh - 100, { planar: true }); st.mood = 'annoyed'; }
    if (t > ev('badge1') - 0.3) { st.mood = 'surprised'; st.lookY = 0.4; }
    if (speaking('c1_her3', t, 0.05, 0.4)) { st.mood = 'shock'; st.lookY = 0; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 200, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 200, { planar: true }); } }
  if (L === 'C2') { st.mood = 'angry';
    if (speaking('c2_her', t, 0.05, 0.1)) { st.armL = reach(g, -1, g.sw * 2.4, g.ySh - 160, { planar: true }); }
    if (t > ev('relief')) { st.mood = 'happy'; } if (t > SP.c2_m3.t + 0.5) { st.mood = 'surprised'; }
    if (t > ev('freeze')) { st.mood = 'shock'; st.blink = 0; }
    if (speaking('c2_her2', t, 0.05, 0.2)) { st.mood = 'worried'; st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 150, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 150, { planar: true }); }
    if (t > ev('dollar') + 0.4) { st.items = { R: dollarItem }; st.armR = reach(g, 1, g.sw * 1.2, g.ySh + 60); st.mood = 'tired'; st.lookY = 0.4; }
    if (t > ev('look2')) { st.lookY = 0; st.turn = 0.6; st.look = 1; } if (t > ev('look3')) { st.turn = 0.6; st.look = 1; st.mood = 'annoyed'; }
    if (speaking('c2_her3', t, 0.05, 0.3)) { st.mood = 'angry'; st.turn = 0.3; st.look = 0.6; }
    if (speaking('c2_her4', t, 0.05, 0.3)) { st.mood = 'angry'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.4, g.ySh - 120, { planar: true, fist: true }); st.items = {}; }
    if (t > ev('respect')) { st.mood = 'surprised'; st.items = {}; }
    if (t > ev('ceo')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0.4; }
    if (speaking('c2_her5', t, 0.05, 0.6)) { st.mood = 'shock'; st.lookY = -0.3; st.armL = reach(g, -1, -g.hw * 1.0, g.headY + 80); st.armR = reach(g, 1, g.hw * 1.0, g.headY + 80); st.headFirst = true; } }
  return st; }
// the man: street x / lobby x
function manX(t, L) { if (L === 'A1') { const a = ev('away'), b = ev('back'); return SMX + 1300 * eIO(P(t, a - 0.3, a + 0.3)) - 1300 * eOut(P(t, b - 0.2, b + 0.4)); }
  if (L === 'B1' && lobbyAt(t, L)) { const v = ev('leave'); return lerp(LMX, DOORX + 600, eIn(P(t, v, v + 0.9))); }
  if (L === 'C1') { const r = ev('return'); return lerp(DOORX + 400, LMX, eOut(P(t, r - 0.9, r + 0.4))); }
  if (L === 'C2') { const x1 = 1350; let x = lerp(LMX, x1, eIO(P(t, ev('exit'), ev('exit') + 1.4)));
    if (t > ev('unbadge') - 1.0) x = lerp(x1, LMX, eIO(P(t, ev('unbadge') - 1.0, ev('unbadge') - 0.2)));
    if (t > endOf('c2_m4')) x = lerp(LMX, x1, eIO(P(t, endOf('c2_m4'), ev('look3') + 0.2))); return x; }
  return lobbyAt(t, L) ? LMX : SMX; }
function manOn(t, L) { if (L === 'hook') return !lobbyAt(t, L); if (L === 'B2') return false; if (L === 'B1') return !lobbyAt(t, L) || t < ev('leave') + 1.0; if (L === 'C1') return t > ev('return') - 0.9; return true; }
function manState(t, L) { const g = G.favor, x = manX(t, L), st = { t, talk: talk('favor', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  gest(st, g, 'favor', t, 1, 160);
  const walkTo = (a, b) => { if (t > a && t < b) st.legPose = 'walk'; };
  let gl = false;
  if (L === 'hook') { st.mood = 'happy'; if (speaking('hook_m', t, 0.05)) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 120, { planar: true }); } }
  if (L === 'A1') { const b1 = ev('bag1'), a = ev('away'), b = ev('back');
    if (t < b1) { st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 240); st.items = { L: bagItem(0.8, BAGCOL[0]) }; }
    if (t > b1 - 0.25 && t < b1 + 0.1) st.armL = reach(g, -1, -(SMX - SHX) + g.sw * 1.5, g.ySh + 300);
    walkTo(a - 0.3, a + 0.3); if (t > a) { st.turn = 0.5; st.look = 0.9; } walkTo(b - 0.2, b + 0.4);
    if (t > b) { st.turn = -0.35; st.look = -0.8; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh + 300); st.items = { L: bagItem(1.6, BAGCOL[1]) }; }
    if (t > ev('bag2') - 0.1) { st.items = {}; st.armL = hang(g, -1); st.mood = 'smug'; } }
  if (L === 'A2') { st.items = {}; if (t < ev('phone') + 0.3) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 80, { planar: true }); st.items = { L: phoneItem }; }
    if (t > ev('pose1')) { const k = Math.floor((t - ev('pose1')) / 0.8) % 3; st.mood = 'smug'; st.turn = -0.1; st.look = -0.2;
      if (k === 0) { st.armL = reach(g, -1, -g.hw * 0.9, g.headY + 40); st.armR = reach(g, 1, g.sw * 0.4, g.ySh + 230); st.headFirst = true; }
      if (k === 1) { st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 380, { planar: true }); st.armR = reach(g, 1, g.sw * 2.1, g.ySh - 380, { planar: true }); st.mood = 'happy'; st.laugh = true; }
      if (k === 2) { st.armR = reach(g, 1, g.sw * 0.3, g.headY + 120); st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 200); st.tilt = -0.08; } } }
  if (L === 'B1') { const lob = lobbyAt(t, L);
    if (!lob) { st.mood = 'happy'; if (t > ev('hotel')) { st.turn = 0.4; st.look = 0.9; st.armR = reach(g, 1, g.sw * 2.4, g.ySh - 160, { planar: true }); } if (speaking('b1_m', t, 0.05, 0.3)) { st.turn = -0.3; st.look = -0.7; } }
    else { st.mood = 'happy'; if (t > ev('keys') - 0.1 && t < ev('leave')) { st.armL = reach(g, -1, -g.sw * 2.0, DESK.top - 120, { planar: true }); st.items = { L: keysItem }; }
      if (t > ev('keys') + 0.4) st.items = {};
      if (speaking('b1_m3', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 40, { planar: true, fist: true }); }
      if (t > ev('leave')) { st.legPose = 'walk'; st.turn = 0.6; st.look = 1; st.mood = 'happy'; } } }
  if (L === 'C1') { gl = true; st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 260); st.items = { R: caseItem }; walkTo(ev('return') - 0.9, ev('return') + 0.4);
    if (speaking('c1_m', t, 0.05, 0.2)) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 80, { planar: true }); }
    if (speaking('c1_m2', t, 0.05, 0.2)) { st.mood = 'happy'; st.laugh = true; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 40, { planar: true, fist: true }); }
    if (t > ev('badge1') - 0.4 && t < ev('badge1') + 0.4) { st.armL = reach(g, -1, HX - x + 140, -1300, { planar: true }); } }
  if (L === 'C2') { gl = true; st.items = { R: caseItem }; st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 260); const ex = ev('exit');
    if (t > ex && t < ev('stop')) { st.turn = 0.6; st.look = 1; if (t < ex + 1.4) st.legPose = 'walk'; }
    if (t > ev('stop')) { st.turn = -0.5; st.look = -0.9; st.mood = 'neutral'; }
    if (speaking('c2_m', t, 0.05, 0.2)) { st.mood = 'smug'; }
    walkTo(ev('unbadge') - 1.0, ev('unbadge') - 0.2);
    if (t > ev('unbadge') - 0.3 && t < ev('badge2') + 0.3) { st.armL = reach(g, -1, HX - LMX + 140, -1300, { planar: true }); st.mood = 'happy'; }
    if (speaking('c2_m3', t, 0.05, 0.3)) { st.mood = 'happy'; st.laugh = true; }
    if (speaking('c2_m4', t, 0.05, 0.1)) { st.mood = 'happy'; } if (t > ev('dollar') - 0.3 && t < ev('dollar') + 0.4) { st.armL = reach(g, -1, HX - LMX + 260, DESK.top - 100, { planar: true }); st.items = { R: caseItem, L: dollarItem }; }
    if (t > endOf('c2_m4')) { st.turn = 0.6; st.look = 1; if (t < ev('look3') + 0.2) st.legPose = 'walk'; }
    if (t > SP.c2_her3.t + 0.2) { st.turn = -0.5; st.look = -0.9; st.legPose = 'stand'; st.mood = 'surprised'; }
    if (t > ev('respect')) { st.mood = 'smug'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 40, { planar: true, fist: true }); }
    if (speaking('c2_m5', t, 0.05, 0.6)) { st.mood = 'happy'; } }
  if (gl) { const tn = st.turn || 0; st.front = (cc, gg) => shades(cc, gg, g, tn); }
  return { st, x }; }
function guestState(t, L) { const g = G.hguest, st = { t, talk: talk('hguest', t), mood: 'annoyed', turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  if (L === 'B2') { const a = ev('guest'); if (t < a + 0.4) st.legPose = 'walk';
    if (speaking('b2_g', t, 0.05, 0.2)) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 100, { planar: true }); }
    if (speaking('b2_g2', t, 0.05, 0.3)) { st.mood = 'skeptical'; st.armL = reach(g, -1, -g.sw * 2.0, DESK.top - 900 + 100, { planar: true }); }
    if (t > ev('ring')) { st.mood = 'annoyed'; st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); } }
  else { st.armL = reach(g, -1, g.sw * 0.55, g.ySh + 230); st.armR = reach(g, 1, -g.sw * 0.55, g.ySh + 250); if (L === 'C2' && t > ev('ceo')) st.mood = 'surprised'; }
  return st; }
function guestX(t, L) { if (L === 'B2') { const a = ev('guest'); return lerp(DOORX, LMX, eOut(P(t, a - 0.5, a + 0.4))); } return L === 'hook' ? LMX : QX - QSTEP; }
const guestOn = (t, L) => L === 'hook' ? lobbyAt(t, L) : ['B2', 'C1', 'C2'].includes(L);
// queue: back to front (further = smaller + higher); B2 builds up at QUEUE, then stays
function queueN(t, L) { if (L === 'hook') return lobbyAt(t, L) ? 8 : 0; if (L === 'B2') return t > ev('queue') ? Math.min(8, Math.floor((t - ev('queue')) / 0.12) + 1) : 0; return ['C1', 'C2'].includes(L) ? 8 : 0; }
function queue(c, t, L) { const n = queueN(t, L); for (let i = n - 1; i >= 0; i--) { const q = QCAST[i], g = G['q' + i], s = 0.9 - i * 0.03, x = QX + i * QSTEP, y = -40 - i * 14;
  const st = { t: t + i, mood: L === 'C2' && t > ev('ceo') ? 'surprised' : ['annoyed', 'bored', 'tired', 'skeptical'][i % 4], turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1) };
  if (i % 3 === 1) { st.armR = reach(g, 1, g.sw * 1.0, g.ySh + 260); st.items = { R: caseItem }; }
  K.put(c, q, st, x, y, s); } }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'favor', 'hguest', 'queue'], card: ['her', 'favor', 'hguest'], two: ['her', 'favor', 'hguest'], her: ['her'], favor: ['favor'], hguest: ['hguest'], queue: ['queue', 'hguest'], clock: [], hotel: ['her', 'favor'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const lob = lobbyAt(t, L), who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(lob ? BG_LOBBY : BG_STREET, BX0, BY0, BW, BH);
  if (lob) { clock(c, t, L); if (who.includes('queue')) queue(c, t, L);
    if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0); desk(c, t, L); pile(c, L);
    if (who.includes('hguest') && guestOn(t, L)) heads.hguest = K.put(c, GUEST, guestState(t, L), guestX(t, L), 0);
    if (who.includes('favor') && manOn(t, L)) { const m = manState(t, L); heads.favor = K.put(c, MAN, m.st, m.x, 0); } }
  else { if (L === 'A2' || (L === 'B1')) { c.save(); c.translate(SHX - 260, 0); bagShape(c, 0.9, BAGCOL[0]); c.restore(); c.save(); c.translate(SHX - 470, 0); bagShape(c, 1.5, BAGCOL[1]); c.restore(); }
    if (who.includes('favor') && manOn(t, L)) { const m = manState(t, L); heads.favor = K.put(c, MAN, m.st, m.x, 0); }
    if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(t, L), 0); }
  for (const k of ['favor', 'hguest']) if (!heads[k]) heads[k] = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const HY = who => G[who].headY;
const fy = (who, z, sy = 900) => HY(who) + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { S_WIDE: S(0, -900, 0.6, 'wide'), S_TWO: S(0, fy('favor', 0.8, 800), 0.8, 'two'), S_CARD: S(0, fy('favor', 0.72, 1000), 0.72, 'card'), S_TWO_LOW: S(0, fy('favor', 0.8, 1150), 0.8, 'two'), S_HOTEL: S(700, -1150, 0.45, 'hotel'),
  S_HER: S(SHX, fy('her', 1.0), 1.0, 'her'), S_HER_R: S(SHX, fy('her', 1.0, 1120), 1.0, 'her'), S_HER_CU: S(SHX, fy('her', 1.6, 960), 1.6, 'her'),
  S_MAN: S(SMX, fy('favor', 1.0), 1.0, 'favor'),
  L_COVER: S(-20, fy('her', 0.6, 1000), 0.6, 'wide'), L_WIDE: S(150, -1000, 0.52, 'wide'), L_TWO: S(-120, fy('favor', 0.78, 820), 0.78, 'two'), L_CARD: S(-120, fy('favor', 0.7, 1010), 0.7, 'card'),
  L_HER: S(HX + 40, fy('her', 1.0), 1.0, 'her'), L_HER_R: S(HX + 40, fy('her', 1.0, 1120), 1.0, 'her'), L_HER_CU: S(HX + 20, fy('her', 1.6, 960), 1.6, 'her'),
  L_MAN: S(LMX, fy('favor', 1.0), 1.0, 'favor'), L_MAN_DOOR: S(1350, fy('favor', 1.0), 1.0, 'favor'), L_GUEST: S(LMX, fy('hguest', 1.0), 1.0, 'hguest'),
  L_QUEUE: S(1300, fy('hguest', 0.6, 980), 0.6, 'queue'), L_CLOCK: S(CLK.x, CLK.y + 60, 1.7, 'clock'),
  DOLLAR: U('dollar', 1), BLACK: U('black', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }); if (L === 'outro') return SH.L_WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < 0.45) return SH.L_COVER; if (t < SP.hook_her.t - 0.1) return f(SH.S_TWO_LOW); if (t < hev('cut') - 0.05) return f(SH.S_HER_R); if (t < SP.hook_her2.t - 0.1) return f(SH.L_WIDE); if (sp('hook_her2')) return f(SH.L_HER_R); return f(SH.L_WIDE); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'], lob = lobbyAt(t, L);
  if (u < 1.15) return f({ A1: SH.S_WIDE, A2: SH.S_TWO, B1: SH.S_WIDE, B2: SH.L_WIDE, C1: SH.L_WIDE, C2: SH.L_HER }[L]);
  if (L === 'C2' && t > ev('black') - 0.03 && t < nar.t + 0.05) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(lob ? SH.L_CARD : SH.S_CARD);
  if (L === 'A1') { if (t > ev('bag1') - 0.3 && t < SP.a1_m2.t - 0.1) return f(SH.S_TWO); if (t > ev('away') - 0.4 && t < SP.a1_m3.t - 0.1) return f(SH.S_WIDE); if (t > ev('bag2') - 0.3) return f(SH.S_HER); }
  if (L === 'A2') { if (t < SP.a2_m.t - 0.1) return f(SH.S_TWO); if (t > ev('left') - 0.05 && t < SP.a2_m4.t - 0.1) return f(SH.S_WIDE); if (t > ev('counter') - 0.05 && t < SP.a2_her2.t - 0.1) return f(SH.S_HER_R); }
  if (L === 'B1') { if (t > ev('hotel') - 0.05 && t < SP.b1_her.t - 0.1) return f(SH.S_HOTEL); if (t > ev('inside') - 0.05 && t < SP.b1_m2.t - 0.1) return f(SH.L_WIDE); if (sp('b1_m2')) return f(SH.L_TWO);
    if (t > ev('leave') - 0.05 && t < ev('clock') - 0.05) return f(SH.L_WIDE); if (t > ev('clock') - 0.05) return f(SH.L_CLOCK); }
  if (L === 'B2') { if (t < SP.b2_g.t - 0.1) return f(SH.L_WIDE); if (t > ev('lookaround') - 0.05 && t < SP.b2_her2.t - 0.1) return f(SH.L_HER_R); if (t > ev('ring') - 0.05 && t < ev('pickup') - 0.05) return f(SH.L_TWO); if (t > ev('queue') - 0.05) return f(SH.L_WIDE); }
  if (L === 'C1') { if (t < SP.c1_her.t - 0.1) return f(SH.L_WIDE); if (t > ev('point') - 0.05 && t < SP.c1_her2.t + 0.6) return f(SH.L_WIDE); if (t > ev('badge1') - 0.6 && t < SP.c1_her3.t - 0.1) return f(SH.L_TWO); if (sp('c1_her3')) return f(SH.L_HER); }
  if (L === 'C2') { const p = SP.c2_her, w = p.words, c2 = w && w.length > 3 ? p.t + w[3][1] : p.t + 1.6, c3 = w && w.length > 9 ? p.t + w[9][1] : p.t + 4;
    if (t < SP.c2_her.t) return f(SH.L_HER);
    if (speaking('c2_her', t, 0.3, 0.1)) return f(t < c2 - 0.1 ? SH.L_HER : t < c3 - 0.1 ? SH.L_QUEUE : SH.L_HER);
    if (t < SP.c2_m.t - 0.1) return f(SH.L_MAN_DOOR); if (sp('c2_m')) return f(SH.L_MAN_DOOR); if (t < SP.c2_m2.t - 0.1) return f(SH.L_HER);
    if (t > ev('unbadge') - 1.1 && t < ev('freeze') - 0.05) return f(SH.L_TWO); if (t > ev('freeze') - 0.05 && t < SP.c2_her2.t - 0.1) return f(SH.L_HER_CU);
    if (t > ev('dollar') - 0.05 && t < ev('look2') - 0.05) return f(SH.DOLLAR); if (t > ev('look2') - 0.05 && t < ev('look3') - 0.05) return f(SH.L_QUEUE); if (t > ev('look3') - 0.05 && t < SP.c2_her3.t - 0.1) return f(SH.L_MAN_DOOR);
    if (sp('c2_her3') || sp('c2_her4')) return f(SH.L_HER_CU); if (t > SP.c2_m6.t - 0.1 && t < ev('ceo') - 0.05) return f(SH.L_MAN_DOOR); if (t > ev('ceo') - 0.05 && t < SP.c2_her5.t - 0.1) return f(SH.L_HER); if (t > SP.c2_her5.t - 0.1) return f(SH.L_HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? (lob ? SH.L_HER : SH.S_HER) : who === 'hguest' ? SH.L_GUEST : (lob ? SH.L_MAN : SH.S_MAN);
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return lob ? SH.L_TWO : SH.S_TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
function plate(c, k, s, col, y = 1250, ink = '#FFFFFF', size = 64) { if (k <= 0) return; c.save(); c.translate(540, y); c.rotate(-0.03); c.scale(k, k); UI.font(c, 'Unb9', size); const w = Math.min(940, c.measureText(s).width + 120);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 8, -60 + 10, w, 120, 30); c.fill(); c.fillStyle = col; rr(c, -w / 2, -60, w, 120, 30); c.fill(); c.strokeStyle = C.white; c.lineWidth = 6; rr(c, -w / 2, -60, w, 120, 30); c.stroke(); fitTxt(c, s, 0, 4, size, ink, w - 60); c.restore(); }
function dollarView(c, t) { if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'dollar' }); const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  const k = eBack(P(t, ev('dollar'), ev('dollar') + 0.35), 2); c.save(); c.translate(540, 960); c.rotate(-0.08); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.3)'; rr(c, -420 + 14, -200 + 20, 840, 400, 30); c.fill(); c.fillStyle = '#9ED39A'; rr(c, -420, -200, 840, 400, 30); c.fill(); c.strokeStyle = '#2F7A4A'; c.lineWidth = 14; rr(c, -390, -170, 780, 340, 20); c.stroke();
  c.fillStyle = '#CFEFC9'; c.beginPath(); c.ellipse(0, 0, 130, 150, 0, 0, TAU); c.fill(); txt(c, '$1', 0, 8, 150, '#2F7A4A'); txt(c, '1', -310, -110, 70, '#2F7A4A'); txt(c, '1', 310, 110, 70, '#2F7A4A'); c.restore();
  plate(c, eBack(P(t, ev('dollar') + 0.5, ev('dollar') + 0.8), 2), 'ЗАРПЛАТА: $1', C.pink, 1450); }
function counter(c, t) { const a = ev('counter'), b = SP.a2_her2.t; if (t < a || t > b + 0.3) return; const u = P(t, a, b - 0.2), n = u < 0.33 ? 1 : u < 0.66 ? 12 : 47, k = eBack(P(t, a, a + 0.25), 2);
  c.save(); c.translate(540, 1580); c.scale(k, k); c.rotate(-0.04); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -230 + 8, -70 + 10, 460, 140, 30); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -230, -70, 460, 140, 30); c.fill();
  c.fillStyle = '#FFFFFF'; rr(c, -190, -32, 90, 64, 12); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-145, 0, 22, 0, TAU); c.fill(); txt(c, 'PHOTO ' + n, 60, 4, 60, n === 47 ? '#F2C14E' : '#FFFFFF'); c.restore();
  const fl = (t - a) % 0.25; if (t < b && fl < 0.06) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, 0, W, HH); } }

// ---------------- frame
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А ТЫ УМЕЕШЬ', 'ГОВОРИТЬ «НЕТ»?'], rows: [['A2', 'Is this enough?'], ['B1', 'Just one minute?'], ['C1', 'I originally agreed to…'], ['C2', 'Under no circumstances…']], cta: ['ОТМЕТЬ ТОГО, КТО', 'НЕ УМЕЕТ ОТКАЗЫВАТЬ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her; K.put(cc, MAN, { t: tt, mood: 'happy', turn: -0.2, look: -0.4, armL: hang(G.favor, -1), armR: reach(G.favor, 1, G.favor.sw * 2.0, G.favor.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), front: (c2, gg) => shades(c2, gg, G.favor, -0.2) }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), afterTorso: c3 => badge(c3, g, 'ceo') }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); return; }
  if (tag === 'ui:dollar') { c.save(); c.translate(sh.x, sh.y); dollarView(c, t); c.restore(); heads = { her: OFFL, favor: OFF, hguest: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { favor: ['STRANGER', '#E27D3C'], hguest: ['GUEST', '#2B3A67'] };
  if (L === 'hook') { K.bubbles(c, t, { id: 'hook' }, heads, proj, { names, hold: { hook_m: 0.2, hook_her: 0.1, hook_her2: 0.4 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'A2') counter(c, t);
  if (L === 'B1' && tag === 'clock') plate(c, eBack(P(t, ev('clock') + 0.2, ev('clock') + 0.5), 2), '12:00 ... 12:45', C.gold, 1250, C.oliveD);
  if (L === 'B1' && tag === 'hotel' && t < SP.b1_m.t - 0.05) plate(c, eBack(P(t, ev('hotel'), ev('hotel') + 0.3), 2), 'GRAND HOTEL', '#2B3A67', 1300, '#F2C14E');
  if (L === 'B2' && t > ev('queue') && t < SP.b2_nar.t - 0.15) K.pop(c, t, 'ОЧЕРЕДЬ!', ev('queue') + 0.3, SP.b2_nar.t - 0.45, 540, 1300, C.gold, -0.08, 100);
  if (L === 'C2' && t > ev('ceo') && t < SP.c2_her5.t - 0.15) K.pop(c, t, 'CEO?!', ev('ceo') + 0.1, SP.c2_her5.t - 0.4, 540, 1620, C.gold, -0.08, 120);
  if (L === 'C2' && t > ev('look1') && t < SP.c2_her3.t - 0.05 && tag !== 'ui:dollar') K.dots(c, t, ev('look2'), SP.c2_her3.t - 0.05, 1450);
  K.bubbles(c, t, sc, heads, proj, { names, hold: { a1_her3: 0.4, b1_m3: 0.3, b2_her3: 0.1, c1_her3: 0.5, c2_her3: 0.4, c2_her5: 0.6 } });
  K.hud(c, t, sc);
}
E.run('cantsayno', NF, renderFrame);
