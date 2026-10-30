// "When you accidentally become a tour guide" episode renderer (hard_cut camera): node tour.js start end out.mp4 | --png=f1,f2
// Three sets by shot tag: tourist square (hook, A1, A2, C2, under the CITY TOUR sign), old library with a statue (B1, B2), shopping street (C1).
// Crowd = a small fixed cast of reused figures (tourists + 5 extras). Inserts: the upside-down MAP (A1) and a black end card (C2).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const SHORT = !!process.env.SHORT, SLUG = SHORT ? 'tour_s' : 'tour';   // SHORT=1 (via tour_s.js): the shortened cut of this episode, same renderer
const TL = JSON.parse(fs.readFileSync(`eps/${SLUG}/timeline.json`, 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
if (TL.removed) for (const [id, tt] of Object.entries(TL.removed)) if (!SP[id]) SP[id] = { id, t: tt, d: 0.001, who: '', words: [], text: '', env: [0] };   // lines cut from the short version: keep the lookups the scene logic does by id
if (SHORT) { const li = UI.levelIntro; UI.levelIntro = (c, t, sc) => li(c, t + (1.15 - (TL.cfg.intro_u || 1.15)), sc); }   // level intro starts 0.3 s in (0.85 s instead of 1.15 s)
const INTRO_U = SHORT ? (TL.cfg.intro_u || 1.15) : 1.15, HOOKFX = SHORT && !TL.cfg.classic_hook;   // HOOKFX: the new flash-forward hook (off = the original hook)
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const hookFF = t => HOOKFX ? t < hev('back') : t > hev('cut');                       // hook: the crowd-follows-her phase (short cut: flash-forward at the very start)
const hookHorror = t => HOOKFX ? t < hev('back') : t > hev('horror') - 0.1;

// ---------------- cast
const HER = { ...BASE.her_london };
const TST = { ...BASE.tom, top: { type: 'polo', col: '#F2C14E' }, bottom: { type: 'shorts', col: '#C9B48A' } };
const TST2 = { ...BASE.linda, top: { type: 'tee', col: '#7FB0D8' }, bottom: { type: 'skirt', col: '#F2C14E' } };
const GUIDE = { ...BASE.oliver, top: { type: 'polo', col: '#3C6FB4' } };
const EXTRA = [BASE.jay, BASE.priya, BASE.tony, BASE.chloe, BASE.nana];
const G = { her: geom(HER), tst: geom(TST), tst2: geom(TST2), guide: geom(GUIDE) }; EXTRA.forEach((q, i) => { G['e' + i] = geom(q); });
function txt(c, s, x, y, size, col, font = 'Unb9', align = 'center') { c.font = `${size}px ${font}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
const notebookItem = (ctx) => { ctx.save(); ctx.rotate(-0.15); ctx.fillStyle = '#E0474C'; rr(ctx, -50, -120, 100, 130, 8); ctx.fill(); ctx.fillStyle = '#FFFDF8'; rr(ctx, -42, -112, 84, 114, 5); ctx.fill(); ctx.fillStyle = '#C9C3B4'; for (let k = 0; k < 4; k++) ctx.fillRect(-32, -92 + k * 24, 64, 5); ctx.restore(); };
const cameraItem = (ctx) => { ctx.save(); ctx.fillStyle = '#2B2F3A'; rr(ctx, -62, -80, 124, 78, 12); ctx.fill(); ctx.fillStyle = '#6A6F78'; ctx.beginPath(); ctx.arc(0, -42, 26, 0, TAU); ctx.fill(); ctx.fillStyle = '#9FC8E4'; ctx.beginPath(); ctx.arc(0, -42, 15, 0, TAU); ctx.fill(); ctx.restore(); };
const mapItem = (ctx) => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#F4E3B0'; rr(ctx, -110, -170, 220, 170, 8); ctx.fill(); ctx.strokeStyle = '#C9A55E'; ctx.lineWidth = 4; ctx.strokeRect(-100, -160, 200, 150); ctx.strokeStyle = '#7FB0D8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-100, -60); ctx.quadraticCurveTo(0, -140, 100, -50); ctx.stroke(); ctx.restore(); };
const flagItem = (ctx) => { ctx.strokeStyle = '#8A6A4A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -520); ctx.stroke(); ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.moveTo(0, -520); ctx.lineTo(190, -470); ctx.lineTo(0, -420); ctx.fill(); };
function cap(c, gg, g, col) { const x = gg.head.x, y = gg.head.y - g.hh * 0.78; c.save(); c.translate(x, y); paint(c, q => { q.m(-g.hw * 0.98, 0); q.q(0, -g.hh * 0.95, g.hw * 0.98, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 }); c.fillStyle = col; rr(c, g.hw * 0.2, -4, g.hw * 1.0, 18, 8); c.fill(); c.restore(); }
function sunhat(c, gg, g, col) { const x = gg.head.x, y = gg.head.y - g.hh * 0.78; c.save(); c.translate(x, y); paint(c, q => { q.m(-g.hw * 1.5, 6); q.q(0, 40, g.hw * 1.5, 6); q.q(0, -30, -g.hw * 1.5, 6); q.z(); }, col, { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(-g.hw * 0.8, 0); q.q(0, -g.hh * 0.8, g.hw * 0.8, 0); q.z(); }, col, { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#EE5E9A'; c.fillRect(-g.hw * 0.8, -8, g.hw * 1.6, 16); c.restore(); }
function guideBadge(c, g, pop = 1) { const y = g.ySh + 175; c.strokeStyle = '#3C6FB4'; c.lineWidth = 8; c.beginPath(); c.moveTo(-g.sw * 0.35, g.ySh + 20); c.lineTo(-40, y - 50); c.moveTo(g.sw * 0.35, g.ySh + 20); c.lineTo(40, y - 50); c.stroke();
  c.save(); c.translate(0, y); c.scale(pop, pop); c.fillStyle = '#FFFDF8'; c.strokeStyle = '#3C6FB4'; c.lineWidth = 6; rr(c, -150, -58, 300, 130, 14); c.fill(); c.stroke(); c.fillStyle = '#3C6FB4'; rr(c, -150, -58, 300, 32, 12); c.fill();
  fitTxt(c, 'OFFICIAL', 0, 8, 34, '#2B2F3A', 260); fitTxt(c, 'TOUR GUIDE', 0, 46, 38, '#E0474C', 260); c.restore(); }

// ---------------- sets (prerendered, softly blurred)
const BX0 = -2400, BY0 = -3000, BW = 4800, BH = 4800, BS = 0.5;
function facade(c, x, w, top, col, roof) { c.fillStyle = col; c.fillRect(x, top, w, -260 - top); c.fillStyle = roof; c.fillRect(x - 20, top - 50, w + 40, 60);
  for (let wx = x + 50; wx < x + w - 120; wx += 190) for (let wy = top + 120; wy < -520; wy += 300) { c.fillStyle = '#FFFDF8'; rr(c, wx - 10, wy - 10, 120, 200, 8); c.fill(); c.fillStyle = '#9FC8E4'; rr(c, wx, wy, 100, 180, 6); c.fill(); } }
function drawSquare(c) {
  const g = c.createLinearGradient(0, BY0, 0, -300); g.addColorStop(0, '#9FD3F2'); g.addColorStop(1, '#E7F4FB'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  [['#F4C9A8', 2300], ['#EAD9A0', 2000], ['#C9DDB0', 2500], ['#F2B6B0', 2150], ['#D9C6E6', 2400], ['#F0CBA0', 2100]].forEach(([col, top], i) => facade(c, -2400 + i * 820, 800, -top, col, '#8A4A3A'));
  c.fillStyle = '#E8D9C0'; c.fillRect(BX0, -280, BW, 2000); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -260; y < 1700; y += 120) for (let x = BX0 + ((y / 120) % 2) * 80; x < BX0 + BW; x += 160) c.fillRect(x, y, 140, 100);   // cobbles
  // fountain
  c.fillStyle = '#B9C9D6'; c.beginPath(); c.ellipse(1900, -300, 520, 110, 0, 0, TAU); c.fill(); c.fillStyle = '#7FB0D8'; c.beginPath(); c.ellipse(1900, -330, 470, 84, 0, 0, TAU); c.fill(); c.fillStyle = '#B9C9D6'; c.fillRect(1870, -820, 60, 520);
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 10; for (const dx of [-120, 0, 120]) { c.beginPath(); c.moveTo(1900, -820); c.quadraticCurveTo(1900 + dx * 0.8, -1000, 1900 + dx * 1.8, -380); c.stroke(); }
  // cafe umbrellas
  for (const [x, col] of [[-1700, '#EE5E9A'], [-1200, '#F2C14E']]) { c.fillStyle = '#8A6A4A'; c.fillRect(x - 6, -900, 12, 640); c.fillStyle = col; c.beginPath(); c.moveTo(x - 230, -900); c.quadraticCurveTo(x, -1150, x + 230, -900); c.fill(); }
}
function drawLibrary(c) {
  c.fillStyle = '#BFE3F7'; c.fillRect(BX0, BY0, BW, BH); c.fillStyle = '#D9D2C2'; c.fillRect(-1700, -2300, 3400, 2040);                      // stone wall
  c.fillStyle = '#EFE6D6'; c.beginPath(); c.moveTo(-1850, -2300); c.lineTo(0, -3000); c.lineTo(1850, -2300); c.fill();                           // pediment
  c.fillStyle = '#2B3560'; rr(c, -700, -2620, 1400, 170, 14); c.fill(); fitTxt(c, 'CITY LIBRARY', 0, -2535, 110, '#F2C14E', 1300);
  for (let i = 0; i < 6; i++) { const x = -1500 + i * 600; c.fillStyle = '#FFFDF8'; c.fillRect(x, -2240, 110, 1960); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + 80, -2240, 30, 1960); c.fillStyle = '#EFE6D6'; c.fillRect(x - 30, -2290, 170, 50); c.fillRect(x - 30, -300, 170, 40); }
  c.fillStyle = '#5A3A2A'; rr(c, -260, -1500, 520, 1240, 14); c.fill(); c.fillStyle = '#7A5A3A'; rr(c, -230, -1470, 220, 1180, 8); c.fill(); rr(c, 10, -1470, 220, 1180, 8); c.fill();
  c.fillStyle = '#9FC8E4'; for (const x of [-1250, -750, 450, 950]) { rr(c, x, -1900, 200, 520, 100); c.fill(); }
  c.fillStyle = '#C9C3B4'; c.fillRect(BX0, -280, BW, 2000); for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#D9D2C2' : '#CFC7B6'; c.fillRect(-1500 - i * 100, -280 + i * 40, 3000 + i * 200, 40); }
}
function drawStreet(c) {
  const g = c.createLinearGradient(0, BY0, 0, -300); g.addColorStop(0, '#FBD7B0'); g.addColorStop(1, '#FFF1DC'); c.fillStyle = g; c.fillRect(BX0, BY0, BW, BH);
  [['#E27D3C', 2100], ['#5E9E6E', 2300], ['#8E5BD6', 2000], ['#3C8FE0', 2400], ['#EE5E9A', 2150], ['#F2C14E', 2250]].forEach(([col, top], i) => { facade(c, -2400 + i * 820, 800, -top, col, '#5A3A2A'); c.fillStyle = ['#FFFDF8', '#2B2F3A'][i % 2]; rr(c, -2330 + i * 820, -760, 640, 110, 14); c.fill(); fitTxt(c, ['CAFE', 'SOUVENIRS', 'BAKERY', 'TOURS', 'GELATO', 'MAPS'][i], -2010 + i * 820, -705, 66, ['#2B2F3A', '#F2C14E'][i % 2], 580); });
  c.strokeStyle = '#3E471E'; c.lineWidth = 5; c.beginPath(); c.moveTo(BX0, -1100); c.quadraticCurveTo(0, -800, 2400, -1100); c.stroke(); for (let i = 0; i < 24; i++) { const x = BX0 + i * 200; c.fillStyle = ['#EE5E9A', '#F2C14E', '#7CF29A', '#7FB0D8'][i % 4]; c.beginPath(); c.moveTo(x, -1100 + Math.sin(i * 0.3) * 40); c.lineTo(x + 60, -1100 + Math.sin(i * 0.3) * 40); c.lineTo(x + 30, -1010 + Math.sin(i * 0.3) * 40); c.fill(); }
  c.fillStyle = '#B9B2A8'; c.fillRect(BX0, -280, BW, 2000);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BG = { sq: mkBG(drawSquare), lib: mkBG(drawLibrary), street: mkBG(drawStreet) };
function tourSign(c, x) { c.fillStyle = '#8A6A4A'; c.fillRect(x - 12, -1300, 24, 1040); c.fillStyle = '#FFFDF8'; rr(c, x - 330, -1750, 660, 470, 24); c.fill(); c.strokeStyle = '#3C6FB4'; c.lineWidth = 10; rr(c, x - 330, -1750, 660, 470, 24); c.stroke();
  c.fillStyle = '#3C6FB4'; rr(c, x - 330, -1750, 660, 130, 24); c.fill(); fitTxt(c, 'CITY TOUR', x, -1685, 92, '#FFFDF8', 600); fitTxt(c, 'MEETING POINT', x, -1520, 62, '#2B2F3A', 600); fitTxt(c, '10:00  •  FREE', x, -1400, 52, '#E0474C', 600); }
function statue(c, x) { c.fillStyle = '#9A9488'; rr(c, x - 220, -520, 440, 300, 10); c.fill(); c.fillStyle = '#B2AB9C'; rr(c, x - 260, -260, 520, 70, 8); c.fill(); fitTxt(c, 'THE READER', x, -380, 56, '#2B2F3A', 380);
  paint(c, q => { q.m(x - 120, -520); q.l(x - 90, -1120); q.l(x + 90, -1120); q.l(x + 120, -520); q.z(); }, '#6E7F5E', { sd: 8, hd: 4, lw: 4 }); paint(c, q => q.e(x, -1300, 90, 110), '#6E7F5E', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(x - 210, -900); q.l(x - 20, -840); q.l(x - 20, -1010); q.l(x - 210, -1060); q.z(); }, '#3E471E', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#F2C14E'; c.fillRect(x - 200, -1040, 170, 8); }

// ---------------- timing / crowd logic
const setOf = L => L === 'B1' || L === 'B2' ? 'lib' : L === 'C1' ? 'street' : 'sq';
const HERX = 0;
const BASEPOS = { tst: [330, 0, 1], tst2: [600, 0, 1], e0: [870, 0, 1], e1: [190, 70, 0.9], e2: [460, 70, 0.9], e3: [730, 70, 0.9], e4: [1000, 70, 0.9] };
function present(id, t, L) {
  if (L === 'hook') return id === 'tst' || hookFF(t);
  if (L === 'A1') return id === 'tst';
  if (L === 'A2') { if (id === 'tst') return true; if (id === 'tst2') return t > ev('A2', 'arrive'); return ['e0', 'e1', 'e2'].includes(id) && t > ev('A2', 'grow'); }
  return true; }
function posOf(id, t, L) { let [x, y, s] = BASEPOS[id], walk = false;
  if (L === 'C2') x += 230;
  if (L === 'A2' && id === 'tst2') { const a = ev('A2', 'arrive'); x = lerp(x + 1300, x, eOut(P(t, a, a + 0.9))); walk = t < a + 0.9; }
  if (L === 'A2' && ['e0', 'e1', 'e2'].includes(id)) { const i = ['e0', 'e1', 'e2'].indexOf(id), a = ev('A2', 'grow') + i * 0.3; x = lerp(x + 1500, x, eOut(P(t, a, a + 0.9))); walk = t > a && t < a + 0.9; }
  if (L === 'C2' && t > ev('C2', 'run')) { const r = ev('C2', 'run'), d = (id === 'tst' ? 0.15 : id === 'tst2' ? 0.25 : 0.35 + (+id[1] || 0) * 0.12); x = lerp(x, -2900, eIn(P(t, r + d, r + d + 2.3))); walk = true; }
  if (id === 'tst' && L === 'C2' && t > ev('C2', 'guide') - 0.2) x += 0;
  return { x, y, s, walk }; }
const herX = (t, L) => L === 'C2' && t > ev('C2', 'run') ? lerp(0, -2600, eIn(P(t, ev('C2', 'run'), ev('C2', 'run') + 1.9))) : 0;
const guideX = (t) => { const a = ev('C2', 'guide'); return lerp(1900, 330, eOut(P(t, a, a + 0.9))); };
const showGuide = (t, L) => L === 'C2' && t > ev('C2', 'guide');
const hasBadge = (t, L) => L === 'C2' && t > ev('C2', 'badge');

// ---------------- characters
function gest(st, g, who, t, side, base) { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } }
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const clapArm = (g, s, t) => reach(g, s, s * (g.sw * 0.25 + 90 * Math.abs(Math.sin(t * 11))), g.ySh + 260);
const clapping = (t, L) => (L === 'B2' || L === 'C1') && t > ev(L, 'clap') && t < SP[L.toLowerCase() + '_nar'].t + 1.2;
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'worried', turn: 0.3, look: 0.5, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (hasBadge(t, L)) st.afterTorso = cc => guideBadge(cc, g, eBack(P(t, ev('C2', 'badge'), ev('C2', 'badge') + 0.35), 2.5));
  if (L === 'hook') { st.mood = 'surprised'; if (hookFF(t)) { st.mood = 'worried'; st.turn = -0.5; st.look = -0.8; st.lookY = 0.1; } if (hookHorror(t)) { st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.hw * 0.5, g.headY + g.hh * 0.6); st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.6); } if (speaking('hook_h', t, 0.05, 0.3)) { st.mood = 'worried'; gest(st, g, 'her', t, -1, 160); } return st; }
  if (L === 'A1') { st.mood = 'worried'; if (speaking('a1_h', t, 0.05, 0.3)) st.mood = 'sad'; if (t > e('map') - 0.05 && t < SP.a1_h2.t) { st.items = { R: mapItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 20, { planar: true }); st.lookY = 0.5; st.mood = 'worried'; }
    if (t >= SP.a1_h2.t - 0.05) { st.items = { R: mapItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 20, { planar: true }); st.armL = reach(g, -1, -g.sw * 2.1, g.ySh - 50, { planar: true }); st.mood = 'smug'; st.turn = 0.6; st.look = -0.4; if (!speaking('a1_h2', t, 0.05, 0.6)) st.mood = 'worried'; } }
  if (L === 'A2') { st.mood = 'worried'; if (speaking('a2_h', t, 0.05, 0.3)) { st.mood = 'shock'; st.armL = reach(g, -1, -g.sw * 1.5, g.ySh - 100, { planar: true }); st.armR = reach(g, 1, g.sw * 1.5, g.ySh - 100, { planar: true }); } if (speaking('a2_h2', t, 0.05, 0.5)) { st.mood = 'sad'; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'B1') { st.mood = 'worried'; if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (speaking('b1_h2', t, 0.05, 0.3)) st.mood = 'smug'; if (t > e('sweat') - 0.5) { st.mood = 'worried'; st.turn = 0.5; st.look = 0.2; } if (speaking('b1_h3', t, 0.05, 0.5)) { st.mood = 'shock'; st.turn = 0.2; st.look = 0.3; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'B2') { st.mood = 'worried'; if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'smug'; gest(st, g, 'her', t, -1, 160); } if (t > e('look') - 0.05) { st.turn = -0.7; st.look = -1; st.mood = 'surprised'; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 200, { planar: true }); }
    if (speaking('b2_h2', t, 0.05, 0.3)) { st.mood = 'happy'; st.turn = -0.3; st.look = -0.6; } if (t > e('clap')) { st.mood = 'happy'; st.armL = hang(g, -1); st.turn = 0.3; st.look = 0.5; } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (speaking('c1_h2', t, 0.05, 0.3)) { st.mood = 'worried'; st.armL = chest(g, -1); st.armR = chest(g, 1); } if (t > ev('C1', 'turn')) st.mood = 'shock'; if (t > e('clap')) { st.mood = 'shock'; st.blink = 0; } }
  if (L === 'C2') { st.mood = 'angry'; st.turn = 0.4; st.look = 0.6;
    if (t < SP.c2_g.t - 1.0) { st.mood = 'annoyed'; if (speaking('c2_h', t, 0.05, 0.1)) { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh - 120, { planar: true, fist: true }); } }
    if (t >= SP.c2_g.t - 1.0) { st.mood = 'neutral'; st.blink = 0; }
    if (t > SP.c2_g.t) st.mood = 'surprised'; if (speaking('c2_h2', t, 0.05, 0.3)) { st.mood = 'happy'; st.armL = chest(g, -1); st.armR = chest(g, 1); }
    if (speaking('c2_h3', t, 0.05, 0.3)) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 40, { planar: true }); } if (t > SP.c2_g3.t) st.mood = 'worried';
    if (speaking('c2_h4', t, 0.05, 0.4)) { st.mood = 'shock'; st.blink = 0; st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 300, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 300, { planar: true, fist: true }); }
    if (t > ev('C2', 'badge') - 0.5) { st.mood = 'shock'; st.blink = 0; st.armL = hang(g, -1); st.armR = reach(g, 1, g.sw * 1.1, g.ySh + 120); } if (t > ev('C2', 'run') - 0.2) { st.mood = 'angry'; st.turn = -0.7; st.look = -1; st.legPose = 'walk'; st.armL = reach(g, -1, -g.sw * 1.4, g.ySh + 20, { planar: true, fist: true }); st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 20, { planar: true, fist: true }); } }
  return st; }
function tourist(id, t, L) { const cfg = id === 'tst' ? TST : id === 'tst2' ? TST2 : EXTRA[+id[1]], g = G[id], p = posOf(id, t, L), i = id === 'tst' ? 0 : id === 'tst2' ? 1 : +id[1] + 2;
  const st = { t: t + i * 0.7, talk: talk(id === 'tst' ? 'tst' : id === 'tst2' ? 'tst2' : 'friends', t), mood: 'happy', turn: -0.4, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: Math.sin(t * 3 + i) * 5 };
  if (id === 'tst') { st.front = (cc, gg) => cap(cc, gg, g, '#E0474C'); st.items = { L: cameraItem }; st.armL = chest(g, -1, 0.5); }
  if (id === 'tst2') st.front = (cc, gg) => sunhat(cc, gg, g, '#F4E3B0');
  if (id === 'e1') st.front = (cc, gg) => cap(cc, gg, g, '#3C8FE0'); if (id === 'e4') st.front = (cc, gg) => sunhat(cc, gg, g, '#F2C14E');
  if (id === 'e2') { st.items = { R: flagItem }; st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 100); }
  if (id === 'e0') { st.items = { R: cameraItem }; st.armR = reach(g, 1, g.sw * 0.8, g.ySh + 60); }
  if (L === 'hook' && hookFF(t)) { st.mood = 'happy'; st.laugh = true; }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_t', t, 0.05, 0.3)) st.mood = 'surprised'; if (t > ev('A1', 'follow')) { st.mood = 'happy'; st.laugh = true; } }
  if (L === 'A2') { st.mood = 'happy'; gest(st, g, id === 'tst2' ? 'tst2' : 'tst', t, -1, 130); if (p.walk) st.legPose = 'walk'; }
  if (L === 'B1' && t > ev('B1', 'notes') - 0.05) { st.items = { R: notebookItem }; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 180); st.armL = reach(g, -1, -g.sw * 0.3 + Math.sin(t * 12 + i) * 40, g.ySh + 230); st.mood = 'happy'; }
  if (L === 'B1' && speaking('b1_t3', t, 0.05, 0.2)) { st.mood = 'surprised'; }
  if (clapping(t, L)) { st.armL = clapArm(g, -1, t + i * 0.2); st.armR = clapArm(g, 1, t + i * 0.2); st.items = {}; st.mood = 'happy'; st.laugh = true; }
  if (L === 'C1' && speaking('c1_t4', t, 0.05, 0.3) && id === 'tst') { st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 380, { planar: true }); st.armL = reach(g, -1, -g.sw * 0.4, g.ySh - 350); st.turn = 0.6; st.look = 1; }
  if (L === 'C2') { if (t < ev('C2', 'guide') + 0.5) st.mood = 'neutral'; if (t > ev('C2', 'quiet') && t < ev('C2', 'guide')) { st.blink = 0; st.headX = 0; } if (speaking('c2_c', t, 0.05, 0.5)) { st.armL = reach(g, -1, -g.sw * 1.6, g.ySh - 330, { planar: true }); st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 330, { planar: true }); st.mood = 'happy'; st.laugh = true; }
    if (t > ev('C2', 'run')) { st.legPose = 'walk'; st.turn = 0.6; st.look = 1; st.mood = 'happy'; st.laugh = true; } if (speaking('c2_t', t, 0.05, 0.5) && id === 'tst') st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 250, { planar: true }); }
  return st; }
function guideState(t) { const g = G.guide, st = { t, talk: talk('tguide', t), mood: 'worried', turn: 0.5, look: 0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  const a = ev('C2', 'guide'); if (t < a + 0.9) { st.legPose = 'walk'; st.mood = 'surprised'; }
  if (!hasBadge(t, 'C2')) st.afterTorso = cc => guideBadge(cc, g);
  gest(st, g, 'tguide', t, -1, 110);
  if (speaking('c2_g3', t, 0.05, 0.3)) { st.mood = 'smug'; st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 40, { planar: true }); }
  if (speaking('c2_g4', t, 0.05, 0.3) || t > ev('C2', 'badge') - 0.6) { st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 2.3, g.ySh + 140, { planar: true }); }
  if (hasBadge(t, 'C2')) { st.mood = 'happy'; st.laugh = true; st.armL = hang(g, -1); }
  if (t > ev('C2', 'run')) { st.mood = 'surprised'; st.legPose = 'stand'; st.turn = -0.4; st.look = -0.8; }
  return st; }

// ---------------- the world: set + characters by shot tag (clean singles draw only the tagged character)
const TAGS = { sq: ['sq', ['her', 'crowd', 'guide']], lib: ['lib', ['her', 'crowd']], street: ['street', ['her', 'crowd']], cover: ['sq', ['her', 'tst']], her: ['*', ['her']], tst: ['*', ['tst']], tst2: ['*', ['tst2']], guide: ['*', ['guide']],
  crowd: ['*', ['crowd']], herc: ['*', ['her', 'crowd']], flag: ['sq', ['her', 'crowd']] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
const IDS = ['e4', 'e3', 'e2', 'e1', 'e0', 'tst2', 'tst'];
function world(c, t, L, tag) { let [set, who] = TAGS[tag] || TAGS.sq, heads = {}; if (set === '*') set = setOf(L);
  c.drawImage(BG[set], BX0, BY0, BW, BH);
  if (set === 'sq' && L !== 'C2') tourSign(c, -420); if (set === 'sq' && L === 'C2') tourSign(c, -420);
  if (set === 'lib') statue(c, -880);
  for (const id of IDS) { if (!(who.includes('crowd') || who.includes(id))) continue; if (tag === 'tst' && id !== 'tst') continue; if (tag === 'tst2' && id !== 'tst2') continue;
    if (!present(id, t, L)) continue; const p = posOf(id, t, L); const h = K.put(c, id === 'tst' ? TST : id === 'tst2' ? TST2 : EXTRA[+id[1]], tourist(id, t, L), p.x, p.y, p.s);
    if (id === 'tst') heads.tst = h; if (id === 'tst2') heads.tst2 = h; if (id === 'e1') heads.friends = h; }
  if (who.includes('guide') && showGuide(t, L) && !(tag === 'sq' && false)) heads.guide = K.put(c, GUIDE, guideState(t), guideX(t) + (L === 'C2' && t > ev('C2', 'run') ? 0 : 0), 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), herX(t, L), 0);
  for (const k of ['tst', 'tst2', 'guide', 'friends']) if (!heads[k]) heads[k] = OFF; if (!heads.her) heads.her = OFFL;
  if (tag === 'crowd' || tag === 'herc') heads.friends = heads.friends.x < 1e4 ? heads.friends : OFF;
  return heads; }

// ---------------- shots
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hUp = G.her.headY, tHY = G.tst.headY, t2HY = G.tst2.headY, gHY = G.guide.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const SH = { COVER: S(165, fy(hUp, 0.78, 1200), 0.78, 'cover'), WIDE: S(560, -900, 0.42, 'sq'), WIDE_C2: S(760, -900, 0.42, 'sq'), WIDE_L: S(-100, -900, 0.5, 'lib'), WIDE_LIB: S(500, -900, 0.42, 'lib'), WIDE_ST: S(560, -900, 0.42, 'street'),
  WIDE_H: S(480, -1750, 0.46, 'sq'), HER_CU_H: S(0, fy(hUp, 1.5, 1300), 1.5, 'her'), CARD: S(165, fy(hUp, 0.78, 1180), 0.78, 'sq'), CARD_L: S(165, fy(hUp, 0.78, 1180), 0.78, 'lib'), CARD_ST: S(165, fy(hUp, 0.78, 1180), 0.78, 'street'), CARD_C2: S(300, fy(hUp, 0.62, 1180), 0.62, 'sq'),
  HER: S(0, fy(hUp, 1.0), 1.0, 'her'), HER_R: S(0, fy(hUp, 1.0, 1120), 1.0, 'her'), HER_CU: S(0, fy(hUp, 1.6, 960), 1.6, 'her'), HER_X: S(0, fy(hUp, 0.8, 1000), 0.8, 'herc'),
  TST: S(330, fy(tHY, 1.0), 1.0, 'tst'), TST_R: S(330, fy(tHY, 1.0, 1120), 1.0, 'tst'), T2: S(600, fy(t2HY, 1.0), 1.0, 'tst2'), GU: S(330, fy(gHY, 1.0), 1.0, 'guide'),
  CROWD: S(700, fy(tHY, 0.62, 1000), 0.62, 'crowd'), STATUE: S(-520, -800, 0.62, 'lib'), RUN: S(-300, -900, 0.42, 'sq'), MAP: U('map', 1), BLACK: U('black', 2) };
function chunkStarts(id) { const sp = SP[id], ch = (TL.cfg.chunks || {})[id]; if (!ch) return [sp.t]; const W8 = sp.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0;
  return ch.map(([en], i) => { const a = W8.length === tot ? W8[wi][1] : sp.d * i / ch.length; wi += cnt[i]; return sp.t + a; }); }
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (HOOKFX) { if (t < hev('ff2')) return f(SH.WIDE_H); if (t < hev('back') - 0.02) return f(SH.HER_CU_H); return f(SH.COVER); } if (t < hev('cut') - 0.05) return SH.COVER; if (t < hev('horror') - 0.05) return f(SH.WIDE_H); return f(SH.HER_CU_H); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'], W_ = L === 'B1' || L === 'B2' ? SH.WIDE_LIB : L === 'C1' ? SH.WIDE_ST : L === 'C2' ? SH.WIDE_C2 : SH.WIDE;
  if (u < INTRO_U) return f(W_);
  if (L === 'C2' && t > e('black') - 0.03) return f(SH.BLACK);
  if (nar && t >= nar.t - 0.1) return f(L === 'B1' || L === 'B2' ? SH.CARD_L : L === 'C1' ? SH.CARD_ST : SH.CARD);
  if (L === 'A1' && t > e('map') - 0.05 && t < SP.a1_h2.t - 0.1) return f(SH.MAP);
  if (L === 'A2') { if (t > e('arrive') - 0.05 && t < SP.a2_t.t - 0.1) return f(SH.WIDE); if (t > e('grow') - 0.05 && t < nar.t - 0.1) return f(SH.WIDE); }
  if (L === 'B1') { if (t < SP.b1_t.t - 0.1) return f(SH.WIDE_LIB); if (t > e('notes') - 0.05 && t < SP.b1_t3.t - 0.1) return f(SH.WIDE_LIB); if (sp('b1_h3')) return f(SH.HER_CU); }
  if (L === 'B2') { if (t < SP.b2_t.t - 0.1) return f(SH.WIDE_L); if (t > e('look') - 0.05 && t < SP.b2_h2.t - 0.1) return f(SH.STATUE); if (t > e('clap') - 0.05) return f(SH.WIDE_LIB); }
  if (L === 'C1') { if (t < SP.c1_t.t - 0.1) return f(SH.WIDE_ST); if (t > e('clap') - 0.05) return f(SH.WIDE_ST); }
  if (L === 'C2') { const c = chunkStarts('c2_h'); if (sp('c2_h')) { const sh = [SH.HER, SH.HER_CU, SH.HER_X, SH.HER_CU, SH.HER]; let i = 0; for (let k = 0; k < c.length; k++) if (t >= c[k] - 0.05) i = k; return f(sh[i] || SH.HER); }
    if (t > SP.c2_h.t + SP.c2_h.d && t < e('guide') - 0.05) return f(SH.WIDE_C2); if (t >= e('guide') - 0.05 && t < SP.c2_g.t - 0.1) return f(SH.WIDE_C2);
    if (sp('c2_g') || sp('c2_g2') || sp('c2_g3') || sp('c2_g4')) return f(SH.GU); if (sp('c2_c')) return f(SH.CROWD); if (sp('c2_t')) return f(SH.WIDE_C2);
    if (t > e('badge') - 0.05 && t < SP.c2_c.t - 0.1) return f(SH.WIDE_C2); if (t > e('run') - 0.05 && !sp('c2_t')) return f(SH.WIDE_C2); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : who === 'tst' ? SH.TST : who === 'tst2' ? SH.T2 : who === 'tguide' ? SH.GU : who === 'friends' ? SH.CROWD : SH.HER;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return W_; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts
function backdrop(c, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2B3040'); g.addColorStop(1, '#171A24'); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
function caption(c, s, k = 1, y = 1530, col = C.pinkL) { if (k <= 0) return; c.save(); c.globalAlpha = k; UI.textFit(c, 'Nun9', 46, s, 960); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, s, 540, y, col, C.oliveD, 10); c.restore(); }
function mapView(c, t) { backdrop(c, 'map'); const a = ev('A1', 'map'), b = ev('A1', 'turn'), k = eBack(P(t, a, a + 0.3), 1.6), rot = Math.PI * (1 - eIO(P(t, b, b + 0.5)));
  c.save(); c.translate(540, 860); c.scale(k, k); c.rotate(rot); c.rotate(Math.sin(t * 6) * 0.01);
  c.fillStyle = '#F4E3B0'; rr(c, -420, -520, 840, 1040, 14); c.fill(); c.strokeStyle = '#C9A55E'; c.lineWidth = 8; c.strokeRect(-400, -500, 800, 1000);
  c.strokeStyle = '#7FB0D8'; c.lineWidth = 36; c.beginPath(); c.moveTo(-400, 200); c.bezierCurveTo(-150, 80, 150, 340, 400, 140); c.stroke();
  c.strokeStyle = '#FFFDF8'; c.lineWidth = 22; for (const [x0, y0, x1, y1] of [[-400, -250, 400, -300], [-200, -500, -120, 500], [180, -500, 240, 500]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  for (const [x, y, w, h, col] of [[-340, -440, 180, 130, '#C9DDB0'], [30, -140, 190, 150, '#F2B6B0'], [-340, 280, 200, 140, '#D9C6E6'], [270, -430, 110, 120, '#C9DDB0']]) { c.fillStyle = col; rr(c, x, y, w, h, 10); c.fill(); }
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-260, -330, 34, 0, TAU); c.fill(); fitTxt(c, 'MUSEUM', -60, -330, 54, '#2B2F3A', 230); c.fillStyle = '#3C6FB4'; c.beginPath(); c.arc(300, 330, 24, 0, TAU); c.fill(); fitTxt(c, 'YOU ARE HERE', 160, 410, 40, '#3C6FB4', 380);
  c.restore();
  const flipped = rot > 1.5; caption(c, flipped ? '*карта вверх ногами…*' : '*переворачивает карту…*', clamp(P(t, a + 0.3, a + 0.5)), 1530); }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1620); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'ARE YOU A GUIDE?', 0, 4, 54, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['ТЫ ПОШЁЛ БЫ', 'ЗА ТАКИМ ГИДОМ?'], rows: [['A2', 'Can we join?'], ['B1', 'I have no idea.'], ['C1', 'I should probably clarify something.'], ['C2', 'Get out of hand']], cta: ['ОТПРАВЬ ДРУГУ-', 'ТУРИСТУ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her; for (const [i, id] of ['e1', 'tst'].entries()) K.put(cc, id === 'tst' ? TST : EXTRA[1], { t: tt + i, mood: 'happy', laugh: true, turn: -0.4, look: -0.8, armL: hang(G[id], -1), armR: reach(G[id], 1, G[id].sw * 2.0, G[id].ySh - 330 + Math.sin(tt * 8 + i) * 30, { planar: true }), front: (c2, gg) => id === 'tst' ? cap(c2, gg, G.tst, '#E0474C') : null }, 1000 + i * 420, 0);
      K.put(cc, HER, { t: tt, mood: 'happy', turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1) }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'sq';
  let heads, proj;
  if (tag === 'ui:black') { c.fillStyle = '#000000'; c.fillRect(0, 0, W, HH); UI.watermark(c); K.hud(c, t, sc); return; }
  if (tag.startsWith('ui:')) { c.save(); c.translate(sh.x, sh.y); mapView(c, t); c.restore(); heads = { her: OFFL, tst: OFF, tst2: OFF, tguide: OFF, friends: OFF }; proj = p => p; }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  heads.tguide = heads.guide || OFF;
  const names = { tst: ['TOURIST', '#E27D3C'], tst2: ['TOURIST 2', '#5E9E6E'], tguide: ['GUIDE', '#3C6FB4'], friends: ['CROWD', '#EE5E9A'] };
  const hp = proj;
  if (L === 'hook') { if (tag === 'cover' && t < (HOOKFX ? SP.hook_h.t : SP.hook_t.t + 0.1)) coverBadge(c, t); if (HOOKFX && t < hev('back')) K.pop(c, t, 'СЛЕДУЮТ ЗА НЕЙ!', 0.1, hev('back') - 0.1, 540, 1610, C.gold, -0.06, 70); if (HOOKFX && t >= hev('back') && t < hev('back') + 1.1) K.pop(c, t, '*ЧУТЬ РАНЬШЕ…*', hev('back') + 0.05, hev('back') + 1.0, 540, 1610, C.white, -0.04, 60); if (t > hev('cut') + 0.1 && t < hev('horror')) K.pop(c, t, 'СЛЕДУЮТ ЗА НЕЙ!', hev('cut') + 0.1, hev('horror') - 0.1, 540, 1600, C.gold, -0.06, 70);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    if (!tag.startsWith('ui:')) K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_t: -0.2, hook_h: 0.1, hook_h2: HOOKFX ? 0 : 0.6 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('follow') - 0.05 && t < narT - 0.1) K.pop(c, t, 'ИДУТ ЗА НЕЙ!', e('follow'), narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'A2' && t > e('grow') && t < narT - 0.1) K.pop(c, t, 'ТОЛПА РАСТЁТ!', e('grow') + 0.1, narT - 0.2, 540, 1330, C.gold, -0.06, 80);
  if (L === 'B1' && t > e('notes') && t < SP.b1_t3.t - 0.05) K.pop(c, t, '*записывают*', e('notes') + 0.05, SP.b1_t3.t - 0.1, 540, 1330, C.pinkL, -0.05, 70);
  if ((L === 'B2' || L === 'C1') && t > e('clap') && t < narT - 0.1) K.pop(c, t, 'АПЛОДИСМЕНТЫ!', e('clap') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 78);
  if (L === 'C2' && t > e('quiet') && t < e('guide') - 0.05) K.dots(c, t, e('quiet') + 0.05, e('guide') - 0.1, 1450);
  if (L === 'C2' && t > e('run') && t < e('run') + 2.2) K.pop(c, t, 'БЕГОМ!', e('run') + 0.1, e('run') + 2.0, 540, 1330, C.gold, -0.06, 90);
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_t3: 0.5, a2_h2: 0.4, b1_h3: 0.4, b2_h2: 0.5, c1_t4: 0.5, c2_h: 0.3, c2_g4: 0.3, c2_c: 0.4, c2_t: 0.2, c2_h5: 0.6 } });
  K.hud(c, t, sc);
}
E.run(SLUG, NF, renderFrame);
