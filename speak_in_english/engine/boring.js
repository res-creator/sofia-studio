// "I'm boring" — rubric «Так говорят только русские» (one typical mistake, ~24 s). Renderer (hard_cut camera): node boring.js start end out.mp4 | --png=f1,f2
// Café table for two (checked tablecloth, two cups), a wall clock between them. Frame 0: she is already yawning, the title is an overlay.
// He answers "Yeah. You kind of are.", gets up, swings his coat on and walks out; his cup keeps rocking, a tumbleweed rolls across the table.
// o1: narrator + lesson card (✗ I'm boring = я зануда / ✓ I'm bored = мне скучно) + Bella tip; o2: BORING tag on the slow clock vs BORED on her yawn; end screen.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/boring/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast: her in a date cardigan + pearls; Tom (polite young man in a sweater), his camel coat on the chair
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'cardigan', col: '#E0607E', col2: '#FFF6F0' }, bottom: { type: 'skirt', col: '#3B3550' }, shoes: { col: '#2B1A22', acc: null } };
const TOM = BASE.tom;
const COAT = '#B07A4A';
const TOMC = { ...TOM, top: { type: 'blazer', col: COAT, shirt: TOM.top.col, tie: TOM.top.col } };
const SEAT = 330, TOP = -500, HX = -300, DX = 300, TW = 640;   // seated drop, table top y, seat x, half table width
const G = { her: geom(HER), date: geom(TOM) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- café (prerendered, softly blurred)
const BX0 = -2200, BY0 = -3000, BW = 4400, BH = 4400, BS = 0.5;
function drawCafe(c) {
  c.fillStyle = '#E9DCC3'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(160,120,80,.10)'; for (let x = BX0; x < BX0 + BW; x += 120) c.fillRect(x, BY0, 50, BH);   // striped wallpaper
  c.fillStyle = '#6E8B6A'; c.fillRect(BX0, -900, BW, 900);                                                       // green wainscot
  c.fillStyle = '#5A7456'; c.fillRect(BX0, -920, BW, 30); for (let x = BX0 + 40; x < BX0 + BW; x += 260) { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; rr(c, x, -840, 200, 640, 10); c.stroke(); }
  // window on the left with the street
  c.fillStyle = '#7A5A3A'; rr(c, -1900, -2300, 900, 1250, 16); c.fill(); c.fillStyle = '#BFE0F0'; rr(c, -1860, -2260, 820, 1170, 8); c.fill();
  c.fillStyle = '#D9C9A8'; c.fillRect(-1860, -1500, 820, 410); c.fillStyle = '#A9C98A'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(-1760 + i * 220, -1560, 110, 0, TAU); c.fill(); }
  c.fillStyle = '#7A5A3A'; c.fillRect(-1460, -2260, 20, 1170); c.fillRect(-1860, -1700, 820, 20);
  c.fillStyle = '#C23C4A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-1900 + i * 150, -2300); c.lineTo(-1750 + i * 150, -2300); c.lineTo(-1825 + i * 150, -2190); c.fill(); }
  // framed pictures
  for (const [x, y, w, h, col] of [[-850, -2000, 300, 380, '#E9A23B'], [700, -2050, 380, 300, '#3FA7A0']]) { c.fillStyle = '#5A3A22'; rr(c, x - 16, y - 16, w + 32, h + 32, 8); c.fill(); c.fillStyle = '#FBF5E8'; c.fillRect(x, y, w, h); c.fillStyle = col; c.beginPath(); c.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, 0, TAU); c.fill(); }
  // counter + espresso machine on the right, the door with a bell further right
  c.fillStyle = '#8A5A3A'; rr(c, 1150, -1150, 900, 1150, 12); c.fill(); c.fillStyle = '#6A4228'; c.fillRect(1150, -1180, 900, 50);
  c.fillStyle = '#B9C2CC'; rr(c, 1350, -1500, 330, 330, 20); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 1390, -1460, 250, 90, 10); c.fill();
  c.fillStyle = '#F3EDDF'; for (let i = 0; i < 4; i++) { rr(c, 1720 + i * 70, -1260, 50, 70, 8); c.fill(); }
  // pendant lamps
  for (const x of [-1200, 0, 1250]) { c.strokeStyle = '#3A2A20'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, BY0); c.lineTo(x, -2550); c.stroke();
    const g = c.createRadialGradient(x, -2450, 20, x, -2450, 420); g.addColorStop(0, 'rgba(255,220,140,.45)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 420, -2870, 840, 840);
    c.fillStyle = '#2F4A3A'; c.beginPath(); c.moveTo(x - 130, -2420); c.quadraticCurveTo(x, -2620, x + 130, -2420); c.fill(); c.fillStyle = '#FFE6A8'; c.beginPath(); c.arc(x, -2420, 34, 0, Math.PI); c.fill(); }
  // floor
  c.fillStyle = '#8A6446'; c.fillRect(BX0, -60, BW, 1500); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, -60, 6, 1500);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGK = mkBG(drawCafe);

// ---------------- props
const CLX = 0, CLY = -1580, CLR = 100;
// wall clock; sec = second-hand position in ticks (60 per turn)
function clockDraw(c, r, sec, min = 50, hr = 3) {
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(r * 0.06, r * 0.08, r * 1.08, 0, TAU); c.fill();
  c.fillStyle = '#3A2A20'; c.beginPath(); c.arc(0, 0, r * 1.08, 0, TAU); c.fill(); c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(0, 0, r * 0.94, 0, TAU); c.fill();
  c.strokeStyle = '#3A2A20'; c.lineCap = 'round';
  for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, big = k % 5 === 0; c.lineWidth = r * (big ? 0.06 : 0.025); c.beginPath(); c.moveTo(Math.sin(a) * r * (big ? 0.7 : 0.8), -Math.cos(a) * r * (big ? 0.7 : 0.8)); c.lineTo(Math.sin(a) * r * 0.87, -Math.cos(a) * r * 0.87); c.stroke(); }
  const hand = (a, len, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(-Math.sin(a) * len * 0.15, Math.cos(a) * len * 0.15); c.lineTo(Math.sin(a) * len, -Math.cos(a) * len); c.stroke(); };
  hand((hr + min / 60) / 12 * TAU, r * 0.48, r * 0.09, '#2B2F3A'); hand(min / 60 * TAU, r * 0.72, r * 0.06, '#2B2F3A'); hand(sec / 60 * TAU, r * 0.8, r * 0.025, '#E0474C');
  c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, 0, r * 0.06, 0, TAU); c.fill(); }
// ticks of the wall clock: one per second of the video (the beat ticks land on sfx 'tick')
const secAt = t => { let n = 0; for (const s of TL.sfx) if (s.n === 'tick' && s.t <= t) n++; return 12 + n + Math.floor(t * 0.5); };
function cupDraw(c, s = 1, col = '#FFFDF8', steam = 0, t = 0) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(0, 4, 110, 18, 0, 0, TAU); c.fill();
  c.fillStyle = '#F3EDDF'; c.beginPath(); c.ellipse(0, 0, 105, 20, 0, 0, TAU); c.fill(); c.strokeStyle = '#B8A88A'; c.lineWidth = 3; c.stroke();   // saucer
  c.strokeStyle = col === '#FFFDF8' ? '#D9CDB8' : col; c.lineWidth = 14; c.beginPath(); c.arc(68, -62, 26, -1.2, 1.3); c.stroke();                  // handle
  paint(c, q => { q.m(-70, -112); q.l(70, -112); q.q(66, -10, 0, -8); q.q(-66, -10, -70, -112); q.z(); }, col, { sd: 6, hd: 3, lw: 3 });
  c.fillStyle = '#6A4228'; c.beginPath(); c.ellipse(0, -110, 66, 12, 0, 0, TAU); c.fill();
  if (steam > 0) { c.strokeStyle = `rgba(255,255,255,${0.55 * steam})`; c.lineWidth = 8; c.lineCap = 'round'; for (const dx of [-24, 18]) { c.beginPath(); for (let k = 0; k <= 12; k++) { const y = -130 - k * 12, x = dx + Math.sin(k * 0.6 + t * 4 + dx) * 10; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
  c.restore(); }
function weedDraw(c, r, t) { c.save(); c.rotate(t * 9); c.strokeStyle = '#9C7A4A'; c.lineWidth = 6; c.lineCap = 'round';
  for (let k = 0; k < 16; k++) { const a = hash(k) * TAU, b = a + 1.2 + hash(k + 9) * 2; c.beginPath(); c.arc((hash(k + 3) - 0.5) * r * 0.4, (hash(k + 5) - 0.5) * r * 0.4, r * (0.55 + hash(k + 7) * 0.45), a, b); c.stroke(); }
  c.strokeStyle = '#C9A46A'; c.lineWidth = 4; for (let k = 0; k < 10; k++) { const a = hash(k + 30) * TAU; c.beginPath(); c.arc(0, 0, r * (0.4 + hash(k + 40) * 0.5), a, a + 1.5); c.stroke(); } c.restore(); }
function flyDraw(c, t) { c.fillStyle = 'rgba(200,220,255,.75)'; const fl = Math.sin(t * 90) * 0.5; for (const s of [-1, 1]) { c.save(); c.rotate(s * (0.5 + fl)); c.beginPath(); c.ellipse(s * 14, -10, 16, 8, 0, 0, TAU); c.fill(); c.restore(); }
  c.fillStyle = '#22252E'; c.beginPath(); c.ellipse(0, 0, 14, 10, 0, 0, TAU); c.fill(); }
function chair(c, x, coat) { c.fillStyle = '#3A2418'; rr(c, x - 170, -1100, 340, 640, 60); c.fill(); c.fillStyle = '#5A3A26'; rr(c, x - 140, -1070, 280, 580, 46); c.fill(); c.strokeStyle = '#3A2418'; c.lineWidth = 14; for (const dx of [-60, 0, 60]) { c.beginPath(); c.moveTo(x + dx, -1050); c.lineTo(x + dx, -520); c.stroke(); }
  if (coat) { paint(c, q => { q.m(x + 120, -1090); q.q(x + 230, -1060, x + 220, -900); q.l(x + 250, -560); q.l(x + 150, -540); q.l(x + 130, -900); q.z(); }, COAT, { sd: 8, hd: 4, lw: 4 }); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 185, -1000); c.lineTo(x + 200, -600); c.stroke(); } }
// his cup rocks after he bumps the table getting up
const rockA = t => { const u = t - hev('rise'); return u > 0 && u < 3.5 ? 0.32 * Math.exp(-u * 1.1) * Math.sin(u * 13) : 0; };
function tableFront(c, t, L, tag) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, -10, TW + 60, 34, 0, 0, TAU); c.fill();
  // checked tablecloth hanging to the floor
  paint(c, q => { q.m(-TW + 20, TOP); q.l(TW - 20, TOP); q.l(TW + 30, -20); q.l(-TW - 30, -20); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.fillStyle = 'rgba(214,72,84,.55)'; for (let x = -TW - 40; x < TW + 40; x += 80) k.fillRect(x, TOP, 40, 520); for (let y = TOP + 20; y < 0; y += 80) k.fillRect(-TW - 40, y, 2 * TW + 80, 40); } });
  paint(c, q => { q.m(-TW - 20, TOP - 40); q.l(TW + 20, TOP - 40); q.l(TW, TOP + 14); q.l(-TW, TOP + 14); q.z(); }, '#F6EEDD', { sd: 4, hd: 2, lw: 4 });
  // little vase with a flower in the middle
  c.fillStyle = '#7FB0D8'; rr(c, -26, TOP - 120, 52, 100, 18); c.fill(); c.strokeStyle = '#3E8E4A'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, TOP - 110); c.quadraticCurveTo(10, TOP - 200, 0, TOP - 260); c.stroke();
  for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(Math.cos(a) * 20, TOP - 270 + Math.sin(a) * 20, 14, 0, TAU); c.fill(); } c.fillStyle = '#E0474C'; c.beginPath(); c.arc(0, TOP - 270, 12, 0, TAU); c.fill();
  // cups: hers (pink) and his (white); his rocks
  c.save(); c.translate(HX + 150, TOP - 26); cupDraw(c, 0.9, '#F7B6CF', L === 'hook' && t < hev('rise') ? 1 : 0.6, t); c.restore();
  const a = rockA(t); c.save(); c.translate(DX - 150 + (a > 0 ? 70 : -70) * 0.9, TOP - 26); c.rotate(a); c.translate(-(a > 0 ? 70 : -70) * 0.9, 0); cupDraw(c, 0.9, '#FFFDF8', L === 'hook' && t < hev('rise') ? 1 : 0, t); c.restore();
  K.mark(c, 'cups', 0, TOP - 80, 300);
  // tumbleweed rolls across the table top
  const u = t - hev('weed'); if (L === 'hook' && u > 0 && u < 1.2) { const x = lerp(-1100, 1100, u / 1.2), y = TOP - 95 - Math.abs(Math.sin(u * 7)) * 90; c.save(); c.translate(x, y); weedDraw(c, 85, t); c.restore(); }
}

// ---------------- characters
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const seated = (g, t) => ({ t, mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const yawnArms = (g, st, k = 1, t = 0) => { const w = Math.sin(t * 3) * 14; st.armL = reach(g, -1, -g.sw * lerp(0.9, 1.55, k), g.ySh + lerp(320, -380, k) + w, { planar: true }); st.armR = reach(g, 1, g.sw * lerp(0.9, 1.55, k), g.ySh + lerp(320, -380, k) - w, { planar: true }); };
function herState(t, L, tag) { const g = G.her, st = { ...seated(g, t), talk: talk('her', t), mood: 'tired', turn: 0.25, look: 0.6 };
  if (L === 'hook') {
    const sw = SP.hook_h, yEnd = sw.t + 1.25;   // the sigh/yawn, then "I'm so boring..."
    if (t < yEnd) { const k = eOut(clamp(t / 0.35 + 0.6)) * (1 - eIO(P(t, yEnd - 0.3, yEnd))); yawnArms(g, st, k, t); st.mood = 'tired'; st.blink = 1; st.talk = Math.max(st.talk, 0.85 * k + 0.15); st.tilt = -0.1 * k; st.look = 0.2; st.headY = -10 * k; }
    else if (t < hev('d0') + 0.2) { st.mood = 'bored'; st.tilt = 0.06; st.look = 0.75; st.armL = onTable(g, -1); st.armR = reach(g, 1, g.sw * 1.3, g.ySh + 300, { planar: true }); }
    if (t > hev('d0') + 0.2) { st.mood = 'surprised'; st.look = 0.9; }
    if (t > hev('rise')) { st.mood = 'shock'; st.blink = 0; st.look = 1; st.turn = 0.45; st.lookY = -0.3; }
    if (t > hev('shock') - 0.05) { st.mood = 'shock'; st.blink = 0; st.t = t + 1.2; st.turn = 0.15; st.look = 0.2; st.lookY = 0; 
      st.armL = reach(g, -1, -g.sw * 1.9, g.ySh + 40, { planar: true }); st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 40, { planar: true }); }   // open palms out: "what?!" 
  }
  if (L === 'o1') { st.mood = 'sad'; st.turn = 0.1; st.look = 0.25; st.lookY = 0.1;
    if (t > ev('o1', 'good')) { st.mood = 'worried'; st.look = 0; }
    if (speaking('tip1', t, 0.1, 0.4)) { st.mood = 'neutral'; st.look = 0; st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 120, { planar: true }); } }
  if (L === 'o2') { st.mood = 'tired'; st.blink = 1; st.turn = 0.05; st.look = 0; const u = t - ev('o2', 'her'), k = eOut(clamp(u / 0.3)); yawnArms(g, st, k, t); st.talk = 1.0 * k; st.tilt = -0.08 * k; }
  return st; }
function dateX(t, L) { const a = hev('walk'); return L === 'hook' && t > a ? lerp(DX, 1700, eIn(clamp((t - a) / 0.6)) * 0.4 + clamp((t - a) / 0.6) * 0.6) : (L === 'hook' ? DX : 1e5); }
function dateState(t, L) { const g = G.date, st = { ...seated(g, t), talk: talk('date3', t), mood: 'happy', turn: -0.25, look: -0.6 };
    if (L !== 'hook') return st;
  if (t > SP.hook_h.t + 1.2) { st.mood = 'neutral'; st.lookY = 0.1; }
  if (t > hev('beat')) { st.mood = 'neutral'; st.lookY = -0.35; st.look = -0.2; }     // thinking it over
  if (speaking('hook_d', t, 0.05, 0.1)) { st.mood = 'worried'; st.lookY = 0; st.look = -0.6; st.turn = -0.15; const u = t - SP.hook_d.t;
    st.headY = Math.max(0, Math.sin(u * 7)) * (u < 0.9 ? 18 : 0);   // sincere nods on "Yeah."
    st.armR = reach(g, 1, g.sw * 1.75, g.ySh + 150 + Math.sin(u * 4) * 12, { planar: true }); st.armL = onTable(g, -1); }
  const r = hev('rise'), k = eIO(clamp((t - r) / 0.3));
  if (t > r) { st.drop = SEAT * (1 - k); st.legs = k > 0.6; st.legPose = 'stand'; st.mood = 'happy'; st.look = -0.5; st.lookY = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); }
  const c0 = hev('coat'); if (t > c0 && t < c0 + 0.3) { const u = (t - c0) / 0.3; st.armR = reach(g, 1, g.sw * lerp(1.2, 2.2, u), g.ySh + lerp(250, -200, u), { planar: true }); st.armL = reach(g, -1, -g.sw * lerp(0.8, 1.9, u), g.ySh + lerp(300, -100, u), { planar: true }); }
  if (t > hev('walk')) { st.legPose = 'walk'; st.turn = 0.55; st.look = 0.9; st.mood = 'happy'; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 320 + Math.sin(t * 8) * 25); st.armR = reach(g, 1, g.sw * 0.9, g.ySh + 320 - Math.sin(t * 8) * 25); }
  return st; }
const dateCfg = t => t > hev('coat') + 0.12 ? TOMC : TOM;

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'date'], cover: ['her', 'date'], card: ['her', 'date'], her: ['her'], date: ['date'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGK, BX0, BY0, BW, BH);
  c.save(); c.translate(CLX, CLY); clockDraw(c, CLR, secAt(t)); c.restore(); K.mark(c, 'clock', CLX, CLY, CLR);
  const dx = dateX(t, L), coatOnChair = !(L === 'hook' && t > hev('coat') + 0.12) && L === 'hook';
  chair(c, HX, false); chair(c, DX, coatOnChair);
  if (who.includes('date') && dx < 1600) heads.date = K.put(c, dateCfg(t), dateState(t, L), dx, 0);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L, tag), HX, 0);
  tableFront(c, t, L, tag);
  // a fly circles over her while the narrator talks (silent)
  if (L === 'o1' && who.includes('her') && heads.her) { const hd = heads.her, u = t * 2.1; c.save(); c.translate(hd.x + Math.sin(u) * 260, hd.y - hd.hh * 1.6 + Math.sin(u * 2) * 70); c.scale(Math.cos(u) > 0 ? 1 : -1, 1); flyDraw(c, t); c.restore(); }
  if (!heads.date) heads.date = OFF; if (!heads.her) heads.her = OFFL; heads.date3 = heads.date;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, dHY = G.date.headY + SEAT;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(0, fy((hHY + dHY) / 2, 0.72, 1030), 0.72, 'cover'), WIDE: S(260, fy(hHY, 0.56, 1020), 0.56, 'wide'),
  DATE: S(DX - 30, fy(dHY, 1.0, 920), 1.0, 'date'), SHOCK: S(HX + 10, fy(hHY, 1.35, 920), 1.35, 'her'),
  CARD: S(-40, fy(hHY, 0.6, 930), 0.6, 'card'), YAWN: S(HX + 10, fy(hHY, 1.2, 1060), 1.2, 'her'),
  CLOCK: U('clock', 1), END: U('end', 2) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true });
  if (L === 'end') return f(SH.END);
  if (L === 'o2') return t < ev('o2', 'her') ? f(SH.CLOCK) : f(SH.YAWN);
  if (L === 'o1') return f(SH.CARD);
  if (t < SP.hook_d.t - 0.1) return SH.COVER;
  if (t < hev('rise')) return f(SH.DATE);
  if (t < hev('shock')) return f(SH.WIDE);
  return f(SH.SHOCK); }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
function drawWorld(c, t, L, cam, tag) { c.save(); c.translate(540, 960); c.rotate(cam.r * Math.PI / 180); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
// lesson card (own design): ✗ I'm boring = я зануда / ✓ I'm bored = мне скучно
function lessonCard(c, t) { const a = ev('o1', 'card'), g = ev('o1', 'good'), out = P(t, SC.o1.e - 0.25, SC.o1.e), k = eBack(P(t, a, a + 0.3), 1.6);
  if (t < a || out >= 1) return; const x = 80, y = 330, w = 920, h = 450;
  c.save(); c.globalAlpha = clamp((t - a) / 0.12) * (1 - out); c.translate(540, y + h / 2); c.rotate((1 - k) * -0.08 - 0.012); c.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); c.translate(-540, -(y + h / 2));
  c.fillStyle = 'rgba(62,71,30,.28)'; rr(c, x + 12, y + 18, w, h, 44); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, x, y, w, h, 44); c.fill(); c.stroke();
  // row 1: the mistake
  UI.cross(c, x + 90, y + 112, 46); fitTxt(c, "I'm boring", x + 165, y + 92, 84, C.oliveD, 520, 'Nun9', 'left');
  UI.font(c, 'Nun9', 84); const w1 = Math.min(520, c.measureText("I'm boring").width), sk = eOut(P(t, a + 0.45, a + 0.7));
  if (sk > 0) { c.strokeStyle = C.red; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 160, y + 96); c.lineTo(x + 160 + (w1 + 10) * sk, y + 96); c.stroke(); }
  fitTxt(c, '= «я зануда»', x + 165, y + 168, 54, C.red, 680, 'Nun9', 'left');
  c.strokeStyle = C.pinkL; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 50, y + 225); c.lineTo(x + w - 50, y + 225); c.stroke();
  // row 2: the fix (pops on «мне скучно»)
  const gk = eBack(P(t, g, g + 0.3), 2);
  if (gk > 0) { c.save(); c.translate(x + 90, y + 322); c.scale(gk, gk); c.translate(-(x + 90), -(y + 322)); UI.check(c, x + 90, y + 322, 46); fitTxt(c, "I'm bored", x + 165, y + 302, 84, C.oliveD, 520, 'Nun9', 'left'); fitTxt(c, '= «мне скучно»', x + 165, y + 378, 54, C.pinkD, 680, 'Nun9', 'left'); c.restore(); }
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x, y, w, h, k: 1, id: 'card' }); }
// tag plate (BORING on the clock / BORED on her)
function tagPlate(c, t, t0, txt, x, y, col, rot) { const k = eBack(P(t, t0, t0 + 0.28), 2.4); if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(rot + Math.sin(t * 3) * 0.02); c.scale(k, k);
  UI.font(c, 'Unb9', 120); const tw = c.measureText(txt).width + 110; c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -tw / 2 + 10, -95 + 14, tw, 190, 36); c.fill(); c.fillStyle = col; rr(c, -tw / 2, -95, tw, 190, 36); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 9; c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = C.white; c.fillText(txt, 0, 6); c.restore(); if (global.__QA) global.__QA.ui(c, 'label', { x: x - 300, y: y - 95, w: 600, h: 190, k, id: txt }); }
// o2 clock insert: the wall clock big on a solid backdrop; the second hand ticks and snaps back (time is stuck)
function clockInsert(c, t) { c.fillStyle = '#6E8B6A'; c.fillRect(0, 0, W, HH); c.fillStyle = 'rgba(255,255,255,.06)'; for (let k = 0; k < 14; k++) c.fillRect(k * 160, 0, 70, HH);
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'clock' });
  const u = t - ev('o2', 'clock'), z = lerp(1.08, 1, eOut(clamp(u / 0.4))), n = Math.floor(Math.max(0, u - 0.2) / 0.4) + 1, back = (u % 1.6) > 1.45;
  c.save(); c.translate(540, 1040); c.scale(z, z); clockDraw(c, 330, back ? 0 : Math.min(4, n) % 4, 50, 3); c.restore();
  tagPlate(c, t, ev('o2', 'boring'), 'BORING', 540, 520, '#7A8794', -0.05); }
// end screen: question, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; her and Tom between the question and the buttons
function bookmark(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-18, -26); c.lineTo(18, -26); c.lineTo(18, 28); c.lineTo(0, 14); c.lineTo(-18, 28); c.closePath(); c.fill(); c.restore(); }
function endScreen(c, t) { const s = SC.end.s, u = t - s, e = SC.end.ev, R = rr;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH); c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // characters
  const hk = eBack(P(u, 0.1, 0.55), 1.4), hy = lerp(1550, 1150, hk);
  c.save(); c.translate(770, hy); c.scale(0.41, 0.41); const gd = G.date; K.put(c, TOMC, { t, mood: 'happy', turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 1.9, gd.ySh - 250 + Math.sin(t * 8) * 30, { planar: true }), armR: hang(gd, 1), items: {} }, 0, 0); c.restore();
  c.save(); c.translate(310, hy); c.scale(0.41, 0.41); const g = G.her; K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.2, look: 0.4, armL: hang(g, -1), armR: reach(g, 1, g.sw * 2.0, g.ySh - 250 + Math.sin(t * 8 + 1) * 30, { planar: true }), items: {} }, 0, 0); c.restore();
  // question (2 lines), pulses when the narrator asks it
  const qk = eBack(P(u, 0.35, 0.7), 2.2), qp = 1 + 0.06 * Math.sin(clamp((t - e.q) / 0.5) * Math.PI);
  if (qk > 0) { c.save(); c.translate(540, 300); c.scale(qk * qp, qk * qp); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, 'КАКУЮ ОШИБКУ', 900); UI.strokeText(c, 'КАКУЮ ОШИБКУ', 0, -52, C.oliveD, C.white, 14); UI.textFit(c, 'Unb9', 74, 'РАЗОБРАТЬ СЛЕДУЮЩЕЙ?', 940); UI.strokeText(c, 'РАЗОБРАТЬ СЛЕДУЮЩЕЙ?', 0, 44, C.pink, C.white, 14); c.restore(); }
  // СОХРАНИ (gold, bookmark icon) — bounces on «Сохрани»
  const bk = eBack(P(t, e.save, e.save + 0.3), 2.2), bp = 1 + 0.07 * Math.sin(clamp((t - e.save - 0.3) / 0.6) * Math.PI * 2);
  if (bk > 0) { c.save(); c.translate(540, 1270); c.scale(bk * bp, bk * bp); c.fillStyle = 'rgba(0,0,0,.18)'; R(c, -280 + 8, -62 + 10, 560, 124, 62); c.fill(); c.fillStyle = C.gold; R(c, -280, -62, 560, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
    bookmark(c, -170, 2, 1.5, C.oliveD); fitTxt(c, 'СОХРАНИ', 40, 4, 54, C.oliveD, 330); c.restore(); }
  // ПОДПИСАТЬСЯ, clicked by the cursor
  const sk = eBack(P(t, e.sub, e.sub + 0.3), 2), click = P(t, e.sub + 0.8, e.sub + 0.95), pressed = t > e.sub + 0.9, sy = 1450;
  if (sk > 0) { c.save(); c.translate(540, sy); const ss = sk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.18)'; R(c, -280 + 8, -62 + 10, 560, 124, 62); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; R(c, -280, -62, 560, 124, 62); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
    fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 52, C.white, 480); c.restore();
    const mv = eIO(P(t, e.sub + 0.2, e.sub + 0.8)); UI.tapCursor(c, lerp(900, 640, mv), lerp(sy + 230, sy + 20, mv), 1, P(t, e.sub + 0.85, e.sub + 1.4)); }
  // iris-in from the previous shot
  if (u < 0.45) { const k = eOut(P(u, 0, 0.42)); c.save(); c.fillStyle = C.oliveD; c.beginPath(); c.rect(0, 0, W, HH); c.moveTo(540 + 1300 * k, 960); c.arc(540, 960, 1300 * k, 0, TAU, true); c.fill(); c.restore(); }
}
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], tag = cam.tag || 'wide';
  if (L === 'end' || tag === 'ui:end') { endScreen(c, t); Hq.grain(c, W, HH, t, 0.04); return; }
  if (tag === 'ui:clock') { clockInsert(c, t); Hq.vignette(c, W, HH, 0.2); UI.captions(c, t); Hq.grain(c, W, HH, t, 0.04); return; }
  const r = drawWorld(c, t, L, cam, tag), M = r.M, heads = r.heads; const proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26);
  if (L === 'hook') {
    const ta = 1 - P(t, 2.3, 2.6); if (ta > 0) { c.save(); c.globalAlpha = ta; K.titleRibbon(c, t, 540, 470); c.restore(); }
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, hold: { hook_h: 0.2, hook_d: -0.2 } });
  }
  if (L === 'o1') lessonCard(c, t);
  if (L === 'o2') { const hd = heads.her; if (hd && hd.x > -1e4) { const q = proj({ x: hd.x, y: hd.y - hd.hh * 2.1 }); tagPlate(c, t, ev('o2', 'bored'), 'BORED', 540, Math.min(520, q.y - 110), C.pink, 0.05); } }
  UI.captions(c, t);
  Hq.grain(c, W, HH, t, 0.045);
}
E.run('boring', NF, renderFrame);
