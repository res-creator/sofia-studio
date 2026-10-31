// "Friend is an hour late: I'm upset" episode renderer (hard_cut camera): node late.js start end out.mp4 | --png=f1,f2
// Cafe (togo/passport layout): she waits behind a round-cloth table with a tower of empty glasses that grows by one glass per level (running gag); a wall clock spins; Emma stands on the right.
// Props: dress twirl (A1), cat in a tote bag (B1), honking traffic (B2), a cup that says BRENDA (C1), a phone with a map (C2), the whole tower falls (C2).
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/late/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const rnd = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#7FB0D8' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#F4EFE6', acc: '#C98B5A' } };
const EMM = { ...BASE.chloe, top: { type: 'cardigan', col: '#F2C14E', col2: '#FFF6F0' }, bottom: { type: 'skirt', col: '#E8A91C' }, shoes: { col: '#E0474C', acc: null } };
const G = { her: geom(HER), emma: geom(EMM) };
const HX = -430, EX = 470, CT = -610;                       // her / Emma feet x, table top height
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props held in a hand
const big = (f, k = 1.5) => ctx => { ctx.scale(k, k); f(ctx); };
const catBag0 = ctx => { ctx.save(); ctx.rotate(0.05); ctx.fillStyle = '#E0474C'; rr(ctx, -110, -130, 220, 150, 22); ctx.fill(); ctx.strokeStyle = '#8A1C2E'; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = '#8A1C2E'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, -130, 52, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#F28C28'; ctx.beginPath(); ctx.arc(0, -150, 62, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(-58, -170); ctx.lineTo(-50, -232); ctx.lineTo(-14, -190); ctx.fill(); ctx.beginPath(); ctx.moveTo(58, -170); ctx.lineTo(50, -232); ctx.lineTo(14, -190); ctx.fill();   // cat head + ears
  ctx.fillStyle = '#1B1E26'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 26, -168, 8, 12, 0, 0, TAU); ctx.fill(); } ctx.fillStyle = '#EE5E9A'; ctx.beginPath(); ctx.arc(0, -150, 8, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#1B1E26'; ctx.lineWidth = 3; for (const s of [-1, 1]) for (const d of [-6, 6]) { ctx.beginPath(); ctx.moveTo(s * 14, -146 + d); ctx.lineTo(s * 62, -150 + d * 2); ctx.stroke(); } ctx.restore(); };
const cupDraw = ctx => { ctx.save(); ctx.rotate(-0.06); ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.moveTo(-70, -190); ctx.lineTo(70, -190); ctx.lineTo(52, 0); ctx.lineTo(-52, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#9AA3B2'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#C98B5A'; ctx.fillRect(-64, -140, 128, 70); fitTxt(ctx, 'BRENDA', 0, -104, 34, '#2B2F3A', 112);
  ctx.fillStyle = '#7A4E2E'; rr(ctx, -78, -208, 156, 28, 10); ctx.fill(); ctx.restore(); };
const phoneDraw = ctx => { ctx.save(); ctx.rotate(-0.1); ctx.fillStyle = '#1B1E26'; rr(ctx, -80, -250, 160, 270, 20); ctx.fill(); ctx.fillStyle = '#DCEFFF'; rr(ctx, -68, -236, 136, 242, 12); ctx.fill();
  ctx.strokeStyle = '#9CC8F0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-68, -150); ctx.lineTo(68, -190); ctx.moveTo(-20, -236); ctx.lineTo(10, 6); ctx.stroke();
  ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(22, -150, 22, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(8, -134); ctx.lineTo(22, -102); ctx.lineTo(36, -134); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(22, -150, 8, 0, TAU); ctx.fill();
  fitTxt(ctx, 'KING ST', 0, -30, 26, '#1F2A44', 120); ctx.restore(); };
const catItem = big(catBag0, 1.5), cupItem = big(cupDraw, 2.0), phoneItem = big(phoneDraw, 1.6);

// ---------------- cafe (prerendered, softly blurred)
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawCafe(c) {
  c.fillStyle = '#F2E2C8'; c.fillRect(BX0, BY0, BW, BH);                                           // wall
  c.fillStyle = '#E8D3B0'; for (let x = BX0; x < BX0 + BW; x += 300) c.fillRect(x, -2900, 150, 2640);   // wallpaper stripes
  c.fillStyle = '#5E8C7B'; c.fillRect(BX0, -1050, BW, 790); c.fillStyle = '#4A7566'; c.fillRect(BX0, -1070, BW, 34);   // wainscot
  c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 330) { c.beginPath(); c.moveTo(x, -1036); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#B07A4A'; c.fillRect(BX0, -260, BW, 1700); c.strokeStyle = 'rgba(0,0,0,.14)'; c.lineWidth = 4; for (let y = -260; y < 1400; y += 120) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); } for (let y = -260, r = 0; y < 1400; y += 120, r++) for (let x = BX0 + (r % 2) * 260; x < BX0 + BW; x += 520) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 120); c.stroke(); }
  c.fillStyle = '#7A4E2E'; c.fillRect(BX0, -290, BW, 40);
  // window (right): street outside
  c.fillStyle = '#7A4E2E'; rr(c, 120, -2420, 1100, 1560, 24); c.fill(); c.fillStyle = '#BFE3F7'; rr(c, 160, -2380, 1020, 1480, 14); c.fill();
  c.fillStyle = '#9FB4C8'; for (const [x, w, h] of [[200, 200, 700], [440, 260, 900], [740, 220, 600], [980, 160, 800]]) c.fillRect(x, -900 - h, w, h);
  c.fillStyle = '#FFFFFF'; c.globalAlpha = .7; for (const [x, y] of [[300, -2200], [800, -2100]]) { c.beginPath(); c.ellipse(x, y, 140, 50, 0, 0, TAU); c.fill(); } c.globalAlpha = 1;
  c.strokeStyle = '#7A4E2E'; c.lineWidth = 22; c.beginPath(); c.moveTo(670, -2380); c.lineTo(670, -900); c.moveTo(160, -1650); c.lineTo(1180, -1650); c.stroke();
  c.fillStyle = '#1F5A7A'; rr(c, 330, -2580, 760, 150, 26); c.fill(); fitTxt(c, 'BLUE CUP CAFÉ', 710, -2506, 92, '#FFF6DC', 700); c.fillStyle = '#FFE15A'; rr(c, 520, -2410, 380, 70, 16); c.fill(); fitTxt(c, 'MAIN STREET', 710, -2376, 44, '#1F2A44', 340, 'Cav7');
  // left: chalkboard menu + shelf
  c.fillStyle = '#7A4E2E'; rr(c, -1230, -2420, 640, 900, 18); c.fill(); c.fillStyle = '#2E3A38'; rr(c, -1204, -2394, 588, 848, 10); c.fill();
  fitTxt(c, 'TODAY', -910, -2290, 76, '#F7F2E8', 520); ['COFFEE', 'TEA', 'CAKE', 'LATTE'].forEach((t, i) => { fitTxt(c, t, -1090, -2130 + i * 130, 62, '#FFE15A', 300, 'Cav7', 'left'); fitTxt(c, ['£3', '£2', '£4', '£4'][i], -690, -2130 + i * 130, 62, '#F7F2E8', 120, 'Cav7', 'right'); });
  // pendant lamps
  for (const x of [-820, -130, 560]) { c.strokeStyle = '#4A4F5C'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, -3000); c.lineTo(x, -2780); c.stroke(); c.fillStyle = '#F2C14E'; c.beginPath(); c.moveTo(x - 90, -2630); c.lineTo(x + 90, -2630); c.lineTo(x + 40, -2780); c.lineTo(x - 40, -2780); c.closePath(); c.fill(); }
  // plant + chair back behind her
  c.fillStyle = '#7A4E2E'; rr(c, -780, -1480, 700, 100, 40); c.fill(); c.fillRect(-760, -1390, 24, 1130); c.fillRect(-120, -1390, 24, 1130);
  c.fillStyle = '#B4694A'; rr(c, 1380, -520, 190, 260, 18); c.fill(); c.fillStyle = '#3E8E55'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(1475 + (i - 3) * 38, -700 - (i % 3) * 60, 40, 160, (i - 3) * 0.3, 0, TAU); c.fill(); }
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawCafe);

// ---------------- wall clock (hands spin faster each level), table, tower of glasses
const CLK = { x: 400, y: -1800, r: 170 };
const CLK_SPIN = { hook: 0.6, A1: 0.8, A2: 1.0, B1: 1.3, B2: 1.6, C1: 2.0, C2: 2.4, outro: 1 };
function clock(c, t, L) { const sp = CLK_SPIN[L] || 1, a = t * sp;
  c.save(); c.translate(CLK.x, CLK.y); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.arc(8, 12, CLK.r + 14, 0, TAU); c.fill(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, CLK.r + 14, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, 0, CLK.r, 0, TAU); c.fill();
  c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; c.lineWidth = i % 3 ? 5 : 10; c.beginPath(); c.moveTo(Math.sin(an) * (CLK.r - 26), -Math.cos(an) * (CLK.r - 26)); c.lineTo(Math.sin(an) * (CLK.r - 8), -Math.cos(an) * (CLK.r - 8)); c.stroke(); }
  const hand = (an, len, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(-Math.sin(an) * 18, Math.cos(an) * 18); c.lineTo(Math.sin(an) * len, -Math.cos(an) * len); c.stroke(); };
  hand(a * 0.35, CLK.r * 0.52, 14, '#2B2F3A'); hand(a * 4.2, CLK.r * 0.8, 9, '#2B2F3A'); hand(a * 25, CLK.r * 0.86, 4, '#E0474C'); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill(); c.restore(); }
const NG = { hook: 4, A1: 5, A2: 6, B1: 7, B2: 8, C1: 9, C2: 10, outro: 10 };
const TX = -170, GH = 100, GS = 1.25;                                        // tower x, glass pitch
function glassDraw(c, i, lean, kind) { c.save(); c.translate(0, 0); c.fillStyle = 'rgba(190,225,245,.62)'; c.strokeStyle = '#6F8FA8'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-46, -118); c.lineTo(46, -118); c.lineTo(36, 0); c.lineTo(-36, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = kind === 0 ? 'rgba(122,78,46,.8)' : kind === 1 ? 'rgba(240,160,60,.75)' : 'rgba(224,71,76,.7)'; c.beginPath(); c.moveTo(-38, -26); c.lineTo(38, -26); c.lineTo(36, 0); c.lineTo(-36, 0); c.closePath(); c.fill();   // leftovers
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-30, -104); c.lineTo(-26, -40); c.stroke(); c.restore(); }
function glassPose(i, t, L) { const base = rnd(i, 1) - 0.5;
  let w = 0.012 + (L === 'C2' ? Math.max(0, t - ev('C2', 'react')) * 0.004 : 0); if (L === 'hook') w = 0.014 + 0.02 * talk('emma', t);
  const amp = w * Math.pow(i, 1.25), x = TX + base * 26 + Math.sin(t * 7.5 + i * 0.4) * amp * 40, y = CT - 14 - i * GH; return { x, y, r: base * 0.06 + Math.sin(t * 7.5 + i * 0.4) * amp }; }
function fallPose(i, u) { const g = 4300, x0 = glassPose(i, ev('C2', 'crash'), 'C2'); const d = i % 2 ? 1 : -1; const vx = d * (80 + rnd(i, 3) * 330) + (i - 4.5) * 25, vy = -250 - rnd(i, 4) * 450, w = d * (3 + rnd(i, 5) * 8);
  const fx = x0.x + vx * 0.25, onTable = fx > -780 && fx < -70, fl = onTable ? CT - 4 : -6; const dy = x0.y - fl, ul = (-vy + Math.sqrt(vy * vy - 2 * g * dy)) / g;
  const uu = Math.min(u, ul), x = x0.x + vx * uu + (u > ul ? vx * 0.28 * (1 - Math.exp(-(u - ul) * 6)) : 0), y = u < ul ? x0.y + vy * u + 0.5 * g * u * u : fl;
  const rot = u < ul ? x0.r + w * u : lerp(x0.r + w * ul, d * Math.PI / 2, eOut(clamp((u - ul) / 0.25))); return { x, y, r: rot, landed: u >= ul }; }
function table(c, t, L) {
  // cloth table (hides her legs): front panel + top
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(-420, 16, 400, 30, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-810, CT + 40); q.l(-30, CT + 40); q.l(-60, 0); q.l(-780, 0); q.z(); }, '#E0474C', { sd: 8, hd: 3, lw: 4 });
  c.save(); c.beginPath(); c.moveTo(-810, CT + 40); c.lineTo(-30, CT + 40); c.lineTo(-60, 0); c.lineTo(-780, 0); c.closePath(); c.clip(); c.fillStyle = 'rgba(255,255,255,.55)'; for (let x = -840; x < 0; x += 90) c.fillRect(x, CT, 45, 700); for (let y = CT + 40; y < 0; y += 90) c.fillRect(-840, y, 900, 45); c.restore();
  paint(c, q => { q.m(-840, CT); q.l(0, CT); q.l(-20, CT + 46); q.l(-820, CT + 46); q.z(); }, '#F7F2E8', { sd: 8, hd: 3, lw: 4 });
  // crumbs + napkins grow with the level
  const n = NG[L] || 4; c.fillStyle = '#C98B5A'; for (let k = 0; k < n * 5; k++) { const x = -800 + rnd(k, 8) * 740, y = CT + 6 + rnd(k, 9) * 30; if (Math.abs(x - TX) < 55) continue; c.beginPath(); c.arc(x, y, 4 + rnd(k, 2) * 4, 0, TAU); c.fill(); }
  c.fillStyle = '#FFFDF8'; for (let k = 0; k < n - 2; k++) { c.save(); c.translate(-760 + (k * 97) % 520, CT + 12); c.rotate(rnd(k, 7) * 3); c.fillRect(-18, -12, 36, 24); c.restore(); }
  // tower
  const crash = ev('C2', 'crash'), top = (NG[L] || 4) - 1;
  for (let i = 0; i <= top; i++) { let p = glassPose(i, t, L), kind = i % 3;
    if (L !== 'hook' && i === top) { const u = t - ev(L, 'glass'); if (u < 0) continue; const k = clamp(u / 0.2); p = { ...p, y: p.y - (1 - eIn(k)) * 900, r: p.r + (1 - k) * 0.3 }; if (k >= 1 && u < 0.45) { const q = (u - 0.2) / 0.25; p.x += Math.sin(q * 12) * 10 * (1 - q); } }
    if (L === 'C2' && t >= crash) { p = fallPose(i, t - crash); }
    c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(GS, GS); glassDraw(c, i, 0, kind); c.restore(); }
  if (L === 'C2' && t >= crash) { const u = t - crash; if (u < 0.5) { c.save(); c.globalAlpha = 1 - u / 0.5; c.fillStyle = '#fff'; for (let k = 0; k < 22; k++) { const an = rnd(k, 3) * TAU, d = 60 + u * 700 * (0.4 + rnd(k, 4)); c.beginPath(); c.arc(TX + Math.cos(an) * d, CT - 400 + Math.sin(an) * d * 0.8, 6, 0, TAU); c.fill(); } c.restore(); } }
}

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const cross = g => ({ armL: reach(g, -1, g.sw * 0.5, g.ySh + 240), armR: reach(g, 1, -g.sw * 0.5, g.ySh + 270) });
const hand2head = (g, s, k = 0.5) => reach(g, s, s * g.hw * k, g.headY + g.hh * 0.8);
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  const react = (t0, t1, mood = 'annoyed') => { if (t > t0 - 0.02 && t < t1) { Object.assign(st, cross(g)); st.mood = mood; st.blink = 0; return true; } return false; };
  if (L === 'hook') { st.mood = 'bored'; Object.assign(st, cross(g)); st.lookY = 0.2; if (t > hev('panic') - 0.05) { st.mood = 'annoyed'; st.blink = 0; } }
  if (L === 'A1') { st.mood = 'annoyed'; if (speaking('a1_h', t, 0.05, 0.4)) { st.mood = 'angry'; st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 260 + Math.sin(t * 12) * 30, { planar: true }); }   // jabs at the clock
    if (speaking('a1_e', t, 0, 0.1)) { st.mood = 'shock'; st.blink = 0; }
    react(e('react'), SP.a1_nar.t, 'annoyed'); if (t > e('react') && t < e('react') + 0.7) st.lookY = -0.6 + 0.2 * Math.sin(t * 8); }   // eye roll
  if (L === 'A2') { st.mood = 'tired'; if (speaking('a2_h', t, 0.05, 0.1)) { st.mood = 'tired'; st.armR = hand2head(g, 1, 0.4); }
    if (speaking('a2_e', t, 0, 0.1)) { st.mood = 'bored'; st.blink = 0; }
    if (speaking('a2_h2', t, 0.05, 0.2)) { Object.assign(st, cross(g)); st.mood = 'annoyed'; } react(e('react'), SP.a2_h2.t, 'annoyed'); }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.2)) { st.mood = 'worried'; gest(st, g, 'her', t, -1, 150); }
    if (speaking('b1_e', t, 0, 0.1)) { st.mood = 'skeptical'; st.blink = 0; }
    if (speaking('b1_h2', t, 0.05, 0.3)) { st.mood = 'skeptical'; if (t > e('seven') - 0.5) st.armR = reach(g, 1, 270, g.ySh - 40, { planar: true }); } react(e('react'), SP.b1_h2.t, 'skeptical'); }
  if (L === 'B2') { st.mood = 'tired'; if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'tired'; st.armL = hand2head(g, -1, 0.5); }
    if (speaking('b2_e', t, 0, 0.1)) { st.mood = 'annoyed'; Object.assign(st, cross(g)); }
    if (speaking('b2_h2', t, 0.05, 0.3)) { st.mood = 'bored'; st.lookY = 0.2; Object.assign(st, cross(g)); } react(e('react'), SP.b2_h2.t, 'skeptical'); }
  if (L === 'C1') { st.mood = 'sad'; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = 'sad'; st.armR = chest(g, 1, 0.3); st.armL = chest(g, -1, 0.3); }
    if (speaking('c1_e', t, 0, 0.1)) { st.mood = 'skeptical'; st.blink = 0; }
    if (speaking('c1_h2', t, 0.05, 0.3)) { st.mood = 'skeptical'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh - 80, { planar: true }); } react(e('react'), SP.c1_h2.t - 0.1, 'bored'); }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'sad'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('react') - 0.02 && t < SP.c2_e2.t) { st.mood = 'surprised'; st.blink = 0; Object.assign(st, cross(g)); }
    if (t > SP.c2_e2.t + 2.6) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('react') + 0.0 && L === 'C2' && t > SP.c2_h3.t - 0.5) { st.mood = 'shock'; st.blink = 0; st.armL = hand2head(g, -1, 0.9); st.armR = hand2head(g, 1, 0.9); }
    if (speaking('c2_h3', t, 0.05, 0.6)) { st.mood = 'worried'; st.blink = 0; if (t > e('crash') - 0.1) { st.mood = 'happy'; st.laugh = true; st.armL = hand2head(g, -1, 0.9); st.armR = hand2head(g, 1, 0.9); } }
    if (t > e('crash') + 0.3) { st.mood = 'happy'; st.laugh = true; st.armL = hand2head(g, -1, 0.9); st.armR = hand2head(g, 1, 0.9); } }
  return st; }
function emmaState(t, L) { const g = G.emma, e = k => ev(L, k), st = { t, talk: talk('emma', t), mood: 'happy', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0 };
  if (L === 'hook') { st.mood = 'worried'; st.turn = -0.2; st.look = -0.5; const u = t - 0.4; if (speaking('hook_e', t, 0.05, 0.3)) { const b = Math.sin(u * 20) * 22; st.armL = reach(g, -1, -g.sw * 0.35, g.ySh + 150 + b); st.armR = reach(g, 1, g.sw * 0.35, g.ySh + 150 - b); } else { st.armL = chest(g, -1, 0.35); st.armR = chest(g, 1, 0.35); } if (t > hev('panic') - 0.05) { st.mood = 'worried'; st.blink = 0; st.lookY = 0.3; } }
  if (L === 'A1') { st.mood = 'worried'; if (t > e('outfit') - 0.4) { st.mood = 'happy'; st.laugh = speaking('a1_e', t, 0, 0.1); const s = clamp((t - (e('outfit') - 0.4)) / 0.6); st.turn = -0.35 + Math.sin(t * 7) * 0.5 * s; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 60 + Math.sin(t * 7) * 30, { planar: true }); st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 60 - Math.sin(t * 7) * 30, { planar: true }); } if (t > SP.a1_e.t + SP.a1_e.d) { st.mood = 'surprised'; st.turn = -0.3; st.armL = chest(g, -1, 0.4); st.armR = chest(g, 1, 0.4); } }
  if (L === 'A2') { st.mood = 'worried'; if (speaking('a2_e', t, 0, 0.5)) { st.mood = 'shock'; st.blink = 0; st.armL = hand2head(g, -1, 0.8); st.armR = hand2head(g, 1, 0.8); st.tilt = 0.12 * Math.sin(t * 9); } }
  if (L === 'B1') { st.mood = 'worried'; if (speaking('b1_e', t, 0, 0.3)) { st.mood = 'worried'; if (t > e('cat') - 0.1) { st.items = { L: catItem }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 40 + Math.sin((t - e('cat')) * 14) * 10); st.armR = reach(g, 1, g.sw * 1.4, g.ySh + 20 + Math.sin(t * 9) * 30); } else gest(st, g, 'emma', t, -1, 120); }
    if (t > SP.b1_e.t + SP.b1_e.d - 0.01 && t < SP.b1_nar.t) { st.items = { L: catItem }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 40); st.mood = 'sad'; } }
  if (L === 'B2') { st.mood = 'worried'; if (speaking('b2_e', t, 0, 0.2)) { st.mood = 'surprised'; const u = t - SP.b2_e.t; st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 60 + Math.sin(u * 10) * 60, { planar: true }); st.armL = reach(g, -1, -g.sw * 1.6, g.ySh + 20 + Math.cos(u * 9) * 50, { planar: true }); }
    if (speaking('b2_h2', t, 0.05, 0.4)) { st.mood = 'sad'; st.armL = chest(g, -1, 0.3); st.armR = chest(g, 1, 0.3); st.lookY = 0.5; } }
  if (L === 'C1') { st.mood = 'happy'; if (t > e('cup') - 0.15) { st.items = { L: cupItem }; st.armL = reach(g, -1, -g.sw * 0.7, g.ySh - 160 + Math.sin(t * 5) * 14); st.mood = 'happy'; st.laugh = speaking('c1_e', t, 0, 0); } if (speaking('c1_h2', t, 0, 0.5)) { st.mood = 'worried'; st.blink = 0; st.lookY = 0.4; } }
  if (L === 'C2') { st.mood = 'worried'; const sp = SP.c2_e2; if (t > e('think') - 0.05) { st.mood = 'worried'; st.blink = 0; st.armR = hand2head(g, 1, 0.5); st.lookY = -0.3; }
    if (speaking('c2_e', t, 0.05, 0.1)) { st.mood = 'worried'; st.armR = hand2head(g, 1, 0.5); }
    if (t > sp.t - 0.1) { st.mood = 'sad'; st.armR = hang(g, 1); st.armL = hang(g, -1); }
    if (t > e('phone') - 0.25) { st.items = { L: phoneItem }; st.armL = reach(g, -1, -g.sw * 0.8, g.ySh - 120); st.mood = 'sad'; }
    if (t > e('crash') - 0.1) { st.items = {}; st.mood = 'surprised'; st.blink = 0; st.armL = hand2head(g, -1, 0.9); st.armR = hand2head(g, 1, 0.9); }
    if (t > e('crash') + 0.5) { st.mood = 'happy'; st.laugh = true; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'emma'], card: ['her', 'emma'], two: ['her', 'emma'], her: ['her'], emma: ['emma'], cover: ['her', 'emma'], tower: ['her'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH); clock(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  table(c, t, L);
  if (who.includes('emma')) heads.emma = K.put(c, EMM, emmaState(t, L), EX, 0);
  if (!heads.emma) heads.emma = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, eHY = G.emma.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(20, -1230, 0.8, 'cover'), WIDE: S(20, -1000, 0.5, 'wide'), CARD: S(20, fy(eHY, 0.66, 980), 0.66, 'card'), TWO: S(20, fy(eHY, 0.75, 820), 0.75, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 30, fy(hHY, 1.6, 960), 1.6, 'her'), HER_H: S(HX + 40, fy(hHY, 1.35, 1280), 1.35, 'her'),
  EM: S(EX - 20, fy(eHY, 1.0), 1.0, 'emma'), EM_H: S(EX - 20, fy(eHY, 1.0, 1230), 1.0, 'emma'), EM_CU: S(EX - 20, fy(eHY, 1.6, 960), 1.6, 'emma'),
  TOWER: S(-90, CT - 380, 0.9, 'two'), CUP: S(EX - 150, fy(eHY, 1.2, 1000) + 120, 1.2, 'emma'), CRASH: S(-200, -700, 0.62, 'two') };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < SP.hook_e.t - 0.12) return SH.COVER; if (t < hev('panic') - 0.05) return f(SH.EM_H); if (t < SP.hook.t - 0.1) return f(SH.HER_H); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  const react = e('react'), inReact = react < 1e8 && t >= react - 0.02;
  if (L === 'A1') { if (inReact) return f(SH.HER_CU); if (sp('a1_e') && t > e('outfit') - 0.3) return f(SH.TWO); }
  if (L === 'A2') { if (inReact) return f(SH.HER_CU); if (sp('a2_e')) return f(SH.EM_CU); }
  if (L === 'B1') { if (sp('b1_h2') && t > e('seven') - 0.45) return f(SH.TOWER); if (inReact) return f(SH.HER_CU); if (sp('b1_e') && t > e('cat') - 0.2) return f(SH.TWO); }
  if (L === 'B2') { if (inReact) return f(SH.HER_CU); if (sp('b2_e')) return f(SH.EM_CU); }
  if (L === 'C1') { if (sp('c1_h2') && t > e('brenda') - 0.35) return f(SH.CUP); if (inReact) return f(SH.HER_CU); if (sp('c1_e') && t > e('cup') - 0.2) return f(SH.CUP); }
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f([SH.HER, SH.HER_CU, SH.HER, SH.HER_CU, SH.HER][i] || SH.HER); }
    if (t > e('crash') - 0.05) return f(SH.CRASH);
    if (t > endOf('c2_h') && t < e('think') + 0.85) return f(SH.WIDE); if (t >= e('think') + 0.85 && t < SP.c2_e.t - 0.1) return f(SH.EM_CU); if (sp('c2_e')) return f(SH.EM);
    if (inReact && t < SP.c2_e2.t - 0.05) return f(SH.HER_CU); if (sp('c2_e2')) return f(t > e('phone') - 0.3 ? SH.EM_CU : SH.EM);
    if (t > endOf('c2_e2') && t < e('crash') - 0.05) return f(SH.HER_CU); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.EM;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud', 'crash']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- cover badge + frame
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1640); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -330 + 6, -62 + 10, 660, 124, 62); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -330, -62, 660, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -330, -62, 660, 124, 62); c.stroke();
  fitTxt(c, 'SORRY, SORRY, SORRY!', 0, 4, 54, '#E0474C', 600); c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { K.outro(c, t, { q: ['А КАК БЫ ТЫ СКАЗАЛ', 'ПОДРУГЕ, ЧТО ОБИДНО?'], rows: [['A2', "I'm upset that you're late."], ['B1', "I've been waiting for an hour."], ['B2', "Don't keep me waiting."], ['C1', "I'd appreciate a heads-up."]], cta: ['ОТПРАВЬ', 'ОПОЗДУНЬЕ'], heroX: 190, heroS: 0.42,
    hero: (cc, tt) => { const g = G.her, ge = G.emma; K.put(cc, EMM, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(ge, -1, -ge.sw * 2.0, ge.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(ge, 1), items: {} }, 1500, 60);
      K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { emma: ['EMMA', '#E8A91C'] };
  if (L === 'hook') { if (tag === 'cover') coverBadge(c, t);
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_e: 0.05, hook_h: 0.3 } }); K.titleRibbon(c, t, 540, 455); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  const e = k => ev(L, k), narT = (SP[L.toLowerCase() + '_nar'] || { t: 1e9 }).t;
  if (L === 'A1' && t > e('outfit') && t < narT - 0.1) K.pop(c, t, 'НАРЯД ЗАМЕТИЛА!', e('outfit') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 70);
  if (L === 'A2' && t > e('dress') && t < narT - 0.1) K.pop(c, t, 'ПРИ ЧЁМ ПЛАТЬЕ?!', e('dress') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 66);
  if (L === 'B1') { if (t > e('cat') && t < e('seven') - 0.4) K.pop(c, t, 'КОТ?!', e('cat') + 0.05, e('seven') - 0.45, 540, 1330, C.gold, -0.06, 96);
    if (t > e('seven') && t < narT - 0.1) K.pop(c, t, 'СТАКАН №7!', e('seven') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 90); }
  if (L === 'B2' && t > e('honk') && t < narT - 0.1) K.pop(c, t, 'ПРОБКИ?! ПЕШКОМ?!', e('honk') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 62);
  if (L === 'C1') { if (t > e('cup') && t < e('brenda') - 0.3) K.pop(c, t, 'ЧУЖОЙ СТАКАН!', e('cup') + 0.05, e('brenda') - 0.35, 540, 1330, C.gold, -0.06, 72);
    if (t > e('brenda') && t < narT - 0.1) K.pop(c, t, 'БРЕНДА?!', e('brenda') + 0.05, narT - 0.2, 540, 1330, C.gold, -0.06, 96); }
  if (L === 'C2') { if (t > e('think') && t < SP.c2_e.t - 0.05) K.dots(c, t, e('think') + 0.05, SP.c2_e.t - 0.05, 1450);
    if (t > e('phone') && t < e('crash') - 0.05) K.pop(c, t, 'ДРУГОЕ КАФЕ?!', e('phone') + 0.05, e('crash') - 0.1, 540, 1330, C.gold, -0.06, 78);
    if (t > e('crash') && t < narT - 0.1) K.pop(c, t, 'БАХ!', e('crash') + 0.02, narT - 0.2, 540, 1330, C.gold, -0.08, 130); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_h: 0.05, a1_e: 0.4, a2_h: 0.05, a2_e: 0.1, a2_h2: 0.4, b1_h: 0.05, b1_e: 0.05, b1_h2: 0.4, b2_h: 0.05, b2_e: 0.05, b2_h2: 0.4, c1_h: 0.05, c1_e: 0.05, c1_h2: 0.4, c2_e: 0.05, c2_e2: 0.4, c2_h3: 0.6 } });
  K.hud(c, t, sc);
}
E.run('late', NF, renderFrame);
