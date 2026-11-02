// "Customs found salo" episode renderer (hard_cut camera): node salo.js start end out.mp4 | --png=f1,f2
// London customs: inspection table with her open suitcase; Reggie (customs uniform) behind the table on the right, her on the left,
// the sniffer pug on the table at the right end. Evidence pile on the table: salo (A1) -> pickle jar (A2) -> salo on the scale (B1);
// black bread + garlic stay in the suitcase until C2. Suspicion meter (magnifier + stars) in the top-left corner.
// C2 twist: hard cut to the CONFISCATED room where all three eat salo on black bread. No black card.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/salo/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast: heroine in a travel hoodie; Reggie in customs uniform (white shirt, navy vest, peaked cap)
const HER = { ...BASE.her_lift, top: { type: 'hoodie', col: '#A3ADBB' }, bottom: { type: 'jeans', col: '#4A5A7A' }, shoes: { col: '#F4EFE6', acc: '#EE5E9A' } };
const OFC = { ...BASE.reggie, top: { type: 'longsleeve', col: '#F7F9FC' }, bottom: { type: 'trousers', col: '#1F2A44' } };
const G = { her: geom(HER), customs: geom(OFC) };
const HX = -350, BX = 430, CT = -760;                 // her / officer feet x, table top height
const TX0 = -200, TX1 = 880;                          // table left / right edge
const DOGX = 750, PILEX = 450, JARX = 600;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function vest(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.95, y0 + 10); q.l(-sw * 0.25, y0 + 10); q.l(0, y0 + 190); q.l(sw * 0.25, y0 + 10); q.l(sw * 0.95, y0 + 10); q.l(sw * 0.86, y0 + 560); q.l(-sw * 0.86, y0 + 560); q.z(); }, '#1F2A44', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#F2C14E'; rr(cc, -sw * 0.82, y0 + 250, sw * 0.62, 70, 10); cc.fill(); fitTxt(cc, 'BORDER', -sw * 0.51, y0 + 272, 22, '#1F2A44', sw * 0.56); fitTxt(cc, 'FORCE', -sw * 0.51, y0 + 300, 22, '#1F2A44', sw * 0.56);
  cc.fillStyle = '#C9CFD8'; cc.beginPath(); cc.arc(sw * 0.5, y0 + 270, 26, 0, TAU); cc.fill(); cc.fillStyle = '#F2C14E'; cc.beginPath(); cc.arc(sw * 0.5, y0 + 270, 16, 0, TAU); cc.fill(); }
function capOn(cc, a, g, tilt = 0) { const { hw, hh } = g; cc.save(); cc.translate(a.head.x, a.head.y - hh * 0.62); cc.rotate(tilt);
  paint(cc, q => { q.m(-hw * 1.05, 10); q.q(-hw * 1.2, -hh * 0.55, 0, -hh * 0.62); q.q(hw * 1.2, -hh * 0.55, hw * 1.05, 10); q.z(); }, '#1F2A44', { sd: 8, hd: 4, lw: 4 });
  cc.fillStyle = '#F2C14E'; cc.fillRect(-hw * 1.02, -18, hw * 2.04, 22); cc.fillStyle = '#2B2F3A'; cc.beginPath(); cc.ellipse(0, 14, hw * 1.15, 22, 0, 0, Math.PI); cc.fill();
  cc.fillStyle = '#F2C14E'; cc.beginPath(); cc.arc(0, -hh * 0.3, 20, 0, TAU); cc.fill(); cc.restore(); }

// ---------------- props (hand-local coords: y up = negative)
function saloDraw(c, s = 1, rot = 0, cut = false) { c.save(); c.scale(s, s); c.rotate(rot);
  // newspaper wrap (back half)
  paint(c, q => { q.m(-150, -20); q.l(150, -30); q.l(160, 60); q.l(-140, 70); q.z(); }, '#E6E1D3', { sd: 6, hd: 3, lw: 3 });
  c.strokeStyle = 'rgba(60,60,60,.35)'; c.lineWidth = 4; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-120, -2 + k * 16); c.lineTo(120, -10 + k * 16); c.stroke(); }
  // the brick
  paint(c, q => { q.m(-110, -120); q.l(110, -125); q.q(125, -125, 125, -105); q.l(122, 30); q.l(-122, 34); q.l(-125, -100); q.q(-125, -120, -110, -120); q.z(); }, '#FBF6EC', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#F2A7A0'; c.beginPath(); c.moveTo(-122, -38); c.bezierCurveTo(-40, -58, 40, -22, 122, -44); c.lineTo(122, -26); c.bezierCurveTo(40, -6, -40, -40, -122, -20); c.closePath(); c.fill();
  c.fillStyle = '#E58A86'; c.fillRect(-122, 16, 244, 14);
  c.fillStyle = 'rgba(200,170,120,.35)'; for (const [x, y] of [[-70, -90], [30, -100], [80, -70], [-20, -75]]) { c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  // newspaper front flap
  paint(c, q => { q.m(-160, 0); q.l(-30, 10); q.l(-20, 80); q.l(-150, 76); q.z(); }, '#EFEBDF', { sd: 4, hd: 2, lw: 3 });
  c.fillStyle = 'rgba(40,40,40,.5)'; c.fillRect(-140, 20, 90, 12); c.fillStyle = 'rgba(60,60,60,.3)'; for (let k = 0; k < 3; k++) c.fillRect(-140, 40 + k * 10, 100, 5);
  // tag 1 KG on a string
  c.strokeStyle = '#8A6A4A'; c.lineWidth = 3; c.beginPath(); c.moveTo(100, -110); c.quadraticCurveTo(150, -150, 170, -120); c.stroke();
  c.save(); c.translate(185, -95); c.rotate(0.25); c.fillStyle = '#FFE15A'; rr(c, -40, -26, 96, 56, 10); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 3; c.stroke(); fitTxt(c, '1 KG', 8, 2, 30, '#E0474C', 86); c.restore();
  c.restore(); }
const saloHand = s => ctx => { ctx.save(); ctx.translate(0, 20); saloDraw(ctx, s); ctx.restore(); };
function jarDraw(c, s = 1) { c.save(); c.scale(s, s);
  c.fillStyle = 'rgba(190,225,200,.55)'; rr(c, -60, -170, 120, 170, 24); c.fill(); c.strokeStyle = 'rgba(80,120,90,.8)'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#5E8C3A'; for (const [x, y, r] of [[-25, -40, 0.3], [20, -60, -0.2], [-15, -100, 0.1], [25, -120, 0.4], [-30, -140, -0.3]]) { c.save(); c.translate(x, y); c.rotate(r); rr(c, -16, -40, 32, 80, 16); c.fill(); c.restore(); }
  c.fillStyle = '#C9A13A'; rr(c, -64, -196, 128, 34, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, -46, -160, 14, 120, 7); c.fill(); c.restore(); }
function breadDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-120, 0); q.q(-130, -110, 0, -115); q.q(130, -110, 120, 0); q.z(); }, '#4A3226', { sd: 8, hd: 4, lw: 4 });
  c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 5; for (const x of [-60, 0, 60]) { c.beginPath(); c.moveTo(x - 20, -90); c.lineTo(x + 20, -60); c.stroke(); } c.restore(); }
function garlicDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(0, -100); q.q(60, -60, 50, -20); q.q(30, 10, 0, 6); q.q(-30, 10, -50, -20); q.q(-60, -60, 0, -100); q.z(); }, '#F6F0E2', { sd: 6, hd: 3, lw: 3 });
  c.strokeStyle = 'rgba(160,130,170,.6)'; c.lineWidth = 3; for (const x of [-20, 0, 20]) { c.beginPath(); c.moveTo(0, -95); c.quadraticCurveTo(x * 2, -50, x, 2); c.stroke(); } c.restore(); }
function radioDraw(c) { c.fillStyle = '#2B2F3A'; rr(c, -30, -120, 60, 120, 10); c.fill(); c.fillStyle = '#1B1E26'; c.fillRect(10, -170, 10, 55); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-12, -104, 7, 0, TAU); c.fill(); c.fillStyle = '#596070'; for (let k = 0; k < 4; k++) c.fillRect(-20, -80 + k * 14, 40, 6); }
function clipDraw(c, t, stamped, s = 1.6) { c.save(); c.scale(s, s); c.rotate(-0.08); c.fillStyle = '#8A5A3A'; rr(c, -90, -230, 180, 230, 10); c.fill(); c.fillStyle = '#FFFDF8'; rr(c, -78, -212, 156, 200, 6); c.fill();
  c.fillStyle = '#B8BDC6'; rr(c, -30, -244, 60, 30, 6); c.fill(); fitTxt(c, 'DECLARATION', 0, -190, 16, '#1F2A44', 140);
  c.fillStyle = 'rgba(30,40,60,.55)'; for (let k = 0; k < 5; k++) c.fillRect(-64, -164 + k * 22, 128 - (k % 2) * 30, 5);
  if (stamped) { c.save(); c.translate(0, -84); c.rotate(-0.22); c.strokeStyle = '#E0474C'; c.lineWidth = 6; rr(c, -82, -26, 164, 52, 8); c.stroke(); fitTxt(c, 'SUSPICIOUS', 0, 2, 26, '#E0474C', 150); c.restore(); }
  c.restore(); }
function sandwichDraw(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-70, 0); q.l(70, 0); q.l(66, -38); q.l(-66, -38); q.z(); }, '#4A3226', { sd: 4, hd: 2, lw: 3 }); c.fillStyle = '#FBF6EC'; rr(c, -62, -60, 124, 26, 6); c.fill(); c.fillStyle = '#F2A7A0'; c.fillRect(-62, -48, 124, 6); c.fillStyle = '#F6F0E2'; c.beginPath(); c.arc(-20, -64, 9, 0, TAU); c.arc(18, -64, 9, 0, TAU); c.fill(); c.restore(); }
const radioItem = ctx => radioDraw(ctx), breadItem = ctx => { ctx.save(); ctx.translate(0, 30); breadDraw(ctx, 0.95); ctx.restore(); }, garlicItem = ctx => garlicDraw(ctx, 0.9), sandItem = ctx => sandwichDraw(ctx, 1.1);
const clipItem = (t, st) => ctx => clipDraw(ctx, t, st);
const formItem = ctx => { ctx.save(); ctx.rotate(0.1); ctx.fillStyle = '#FFFDF8'; rr(ctx, -80, -220, 160, 210, 8); ctx.fill(); ctx.strokeStyle = '#1F2A44'; ctx.lineWidth = 4; ctx.stroke(); fitTxt(ctx, 'DECLARE', 0, -190, 26, '#2E9E4A', 140); ctx.fillStyle = 'rgba(30,40,60,.5)'; for (let k = 0; k < 5; k++) ctx.fillRect(-60, -160 + k * 26, 120, 6); ctx.restore(); };

// the sniffer pug with a wagging tail; st: { t, wag, tongue, tilt, bob, howl }
function dog(c, x, y, s, st) { const t = st.t; c.save(); c.translate(x, y - (st.bob ? Math.abs(Math.sin(t * 9)) * 22 : 0)); c.scale(s, s);
  c.save(); c.translate(120, -150); c.rotate(-0.4 + (st.wag ? Math.sin(t * 18) * 0.5 : 0)); c.strokeStyle = '#D9B485'; c.lineWidth = 24; c.lineCap = 'round'; c.beginPath(); c.arc(30, -10, 30, Math.PI, Math.PI * 2.6); c.stroke(); c.restore();
  // harness
  Hq.pug(c, { t, tongue: st.tongue, tilt: st.tilt || 0 });
  if (st.ears) for (const sx of [-1, 1]) { c.fillStyle = '#FFFFFF'; c.strokeStyle = '#3E471E'; c.lineWidth = 7; c.beginPath(); c.ellipse(-60 + sx * 120, -290, 62, 78, sx * 0.3, 0, TAU); c.fill(); c.stroke(); }
  c.fillStyle = '#E0474C'; rr(c, -40, -200, 130, 34, 12); c.fill(); fitTxt(c, 'K9', 25, -183, 24, '#FFFDF8', 80);
  if (st.howl) { c.save(); c.translate(-90, -400); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const r = 40 + k * 34 + ((t * 120) % 34); c.globalAlpha = 0.8 - k * 0.22; c.beginPath(); c.arc(0, 0, r, -2.4, -0.8); c.stroke(); } c.restore(); }
  c.restore(); }

// ---------------- customs hall (prerendered, softly blurred) and the CONFISCATED room
const BX0 = -2200, BY0 = -3400, BW = 4400, BH = 4800, BS = 0.5;
function drawHall(c) {
  c.fillStyle = '#E6ECF2'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = '#AFC2D4'; c.fillRect(BX0, -1250, BW, 990); c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 5; for (let x = BX0; x < BX0 + BW; x += 260) { c.beginPath(); c.moveTo(x, -1250); c.lineTo(x, -260); c.stroke(); }
  c.fillStyle = '#1F2A44'; rr(c, -900, -2600, 2400, 190, 22); c.fill(); fitTxt(c, 'UK BORDER FORCE', 300, -2505, 120, '#F2C14E', 2200);
  c.fillStyle = '#2E9E4A'; rr(c, -1500, -2300, 1000, 260, 18); c.fill(); fitTxt(c, 'NOTHING TO', -1000, -2210, 80, '#FFFDF8', 900); fitTxt(c, 'DECLARE', -1000, -2110, 90, '#FFFDF8', 900);
  c.fillStyle = '#C23C4A'; rr(c, 900, -2300, 1000, 260, 18); c.fill(); fitTxt(c, 'GOODS TO', 1400, -2210, 80, '#FFFDF8', 900); fitTxt(c, 'DECLARE', 1400, -2110, 90, '#FFFDF8', 900);
  c.fillStyle = '#FFFDF8'; rr(c, -420, -1950, 900, 560, 18); c.fill(); c.strokeStyle = '#1F2A44'; c.lineWidth = 8; c.stroke();
  fitTxt(c, 'NO MEAT', 30, -1840, 80, '#C23C4A', 800); fitTxt(c, 'NO DAIRY', 30, -1740, 80, '#C23C4A', 800); fitTxt(c, 'NO EXCUSES', 30, -1640, 70, '#1F2A44', 800); c.strokeStyle = '#C23C4A'; c.lineWidth = 14; c.beginPath(); c.arc(30, -1500, 70, 0, TAU); c.moveTo(-20, -1550); c.lineTo(80, -1450); c.stroke();
  c.fillStyle = '#C9CFD8'; c.fillRect(BX0, -260, BW, 1700); c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = -260; y < 1400; y += 160) for (let x = BX0 + ((y / 160) % 2) * 160; x < BX0 + BW; x += 320) c.fillRect(x, y, 160, 160);
  c.fillStyle = '#F2C14E'; c.fillRect(BX0, 120, BW, 36);
  // conveyor / x-ray machine far right
  c.fillStyle = '#8C93A0'; rr(c, 1350, -1150, 800, 700, 30); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, 1420, -1020, 300, 380, 20); c.fill(); c.fillStyle = '#5A606E'; c.fillRect(1200, -470, 1000, 60);
}
const RX = 9000;
function drawRoom(c) {
  c.fillStyle = '#F2E2C4'; c.fillRect(RX0, RY0, RW, RH);
  c.fillStyle = '#E3CFAA'; c.fillRect(RX0, -1250, RW, 990);
  c.fillStyle = '#C23C4A'; rr(c, RX - 520, -2180, 1040, 200, 22); c.fill(); c.strokeStyle = '#FFFDF8'; c.lineWidth = 10; rr(c, RX - 500, -2160, 1000, 160, 16); c.stroke(); fitTxt(c, 'CONFISCATED', RX, -2080, 110, '#FFFDF8', 940);
  // shelves with confiscated goods
  for (const [sx, sy] of [[RX - 1500, -1750], [RX + 700, -1750]]) { c.fillStyle = '#8A5A3A'; for (let k = 0; k < 3; k++) c.fillRect(sx, sy + k * 420, 800, 26);
    const box = [['CHEESE', '#F2C14E'], ['JAM', '#C23C4A'], ['SAUSAGE', '#B0623A'], ['HONEY', '#E9A23B'], ['CAVIAR', '#2B2F3A'], ['FISH', '#7FA6C8']];
    for (let k = 0; k < 6; k++) { const bx = sx + 40 + (k % 3) * 250, by = sy + Math.floor(k / 3) * 420; c.fillStyle = box[k][1]; rr(c, bx, by - 220, 210, 220, 12); c.fill(); fitTxt(c, box[k][0], bx + 105, by - 110, 46, '#FFFDF8', 190); } }
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.arc(RX + 900, -1650, 110, 0, TAU); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 12; c.stroke(); c.beginPath(); c.moveTo(RX + 900, -1650); c.lineTo(RX + 900, -1730); c.moveTo(RX + 900, -1650); c.lineTo(RX + 960, -1630); c.stroke();
  c.fillStyle = '#B8A07A'; c.fillRect(RX0, -260, RW, 1700); c.fillStyle = 'rgba(0,0,0,.05)'; for (let y = -260; y < 1400; y += 160) for (let x = RX0 + ((y / 160) % 2) * 160; x < RX0 + RW; x += 320) c.fillRect(x, y, 160, 160);
}
const RX0 = RX - 2200, RY0 = -3400, RW = 4400, RH = 4800;
const mkBG = (fn, x0, y0, w, h) => { const a = createCanvas(Math.round(w * BS), Math.round(h * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-x0, -y0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };   // drawn sharp, blurred once
const BGK = mkBG(drawHall, BX0, BY0, BW, BH), BGR = mkBG(drawRoom, RX0, RY0, RW, RH);

// ---------------- the table: suitcase lid + base, evidence pile, scale, the pug
const before = (L, list) => { const o = ['hook', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'outro']; return o.indexOf(L) < o.indexOf(list); };
function saloOnTable(t, L) { if (L === 'hook') return false; if (L === 'A1') return t > SP.a1_o.t + 0.6; return !(L === 'B1' && t > ev('B1', 'sniff') - 0.05 && t < ev('B1', 'scale')); }
const onScale = (t, L) => !before(L, 'B1') && (L !== 'B1' || t >= ev('B1', 'scale'));
function scaleDraw(c, x, kg) { c.fillStyle = '#C9CFD8'; rr(c, x - 160, CT - 40, 320, 40, 10); c.fill(); c.fillStyle = '#8C93A0'; rr(c, x - 130, CT - 70, 260, 30, 8); c.fill();
  c.fillStyle = '#2B2F3A'; rr(c, x - 120, CT + 8, 240, 74, 10); c.fill(); fitTxt(c, kg, x, CT + 46, 50, '#7CF29A', 220); }
function table(c, t, L) {
  // suitcase lid (behind the base)
  paint(c, q => { q.m(-30, CT - 120); q.l(400, CT - 120); q.l(440, CT - 360); q.l(-20, CT - 360); q.z(); }, '#5E9E6E', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#F7B6CF'; c.beginPath(); c.arc(80, CT - 245, 45, 0, TAU); c.fill(); c.fillStyle = '#FFE15A'; rr(c, 220, CT - 285, 140, 80, 12); c.fill(); fitTxt(c, 'MUM', 290, CT - 245, 34, '#C23C4A', 120); c.fillStyle = '#C23C4A'; c.beginPath(); c.moveTo(80, CT - 228); c.bezierCurveTo(50, CT - 250, 58, CT - 278, 80, CT - 262); c.bezierCurveTo(102, CT - 278, 110, CT - 250, 80, CT - 228); c.fill();   // heart drawn by hand (no ♥ glyph in the font)
  // table top + front
  paint(c, q => { q.m(TX0, CT); q.l(TX1, CT); q.l(TX1, CT + 60); q.l(TX0, CT + 60); q.z(); }, '#D9DEE6', { sd: 6, hd: 3, lw: 4 });
  paint(c, q => { q.m(TX0 + 20, CT + 60); q.l(TX1 - 20, CT + 60); q.l(TX1 - 20, 0); q.l(TX0 + 20, 0); q.z(); }, '#56627A', { sd: 10, hd: 4, lw: 4 });
  c.fillStyle = '#F2C14E'; rr(c, -190, CT + 110, 260, 70, 10); c.fill(); fitTxt(c, 'CUSTOMS', -60, CT + 146, 36, '#1F2A44', 240);
  // suitcase base with clothes (black bread + garlic hidden inside until C2)
  paint(c, q => { q.m(-40, CT - 130); q.l(410, CT - 130); q.l(400, CT); q.l(-30, CT); q.z(); }, '#4E8A5E', { sd: 8, hd: 4, lw: 4 });
  for (const [x, col] of [[20, '#EF7FAA'], [120, '#F2C14E'], [230, '#7FB0D8'], [320, '#FFFDF8']]) { c.fillStyle = col; c.beginPath(); c.ellipse(x + 30, CT - 132, 60, 26, 0, Math.PI, TAU); c.fill(); }
  // evidence pile
  if (onScale(t, L)) { const k = L === 'B1' ? eBack(clamp((t - ev('B1', 'scale')) / 0.25), 2) : 1; c.save(); c.translate(PILEX, CT); c.scale(k, k); c.translate(-PILEX, -CT); scaleDraw(c, PILEX, '1.0 KG'); c.restore(); }
  else if (L === 'A2' || L === 'A1') {}
  if (saloOnTable(t, L) && !(L === 'C2' && t > ev('C2', 'room'))) { c.save(); c.translate(PILEX, CT - (onScale(t, L) ? 70 : 0) - 34); saloDraw(c, 0.75); c.restore(); }
  if (!before(L, 'A2') && (L !== 'A2' || t > ev('A2', 'jar'))) { const k = L === 'A2' ? eBack(clamp((t - ev('A2', 'jar')) / 0.3), 2) : 1; c.save(); c.translate(JARX, CT); c.scale(k, k); jarDraw(c, 0.95); c.restore(); }
}
function dogState(t, L) { const e = k => ev(L, k), st = { t, wag: true, tongue: true, bob: false, tilt: 0 };
  if (L === 'hook') { st.bob = true; st.tilt = Math.sin(t * 3) * 0.12; }
  if (L === 'A1') { if (t < e('dog')) return null; st.bob = true; st.enter = clamp((t - e('dog')) / 0.45); }
  if (L === 'A2') { st.bob = speaking('a2_o', t, 0, 0.5); }
  if (L === 'B1') { st.bob = true; if (t > e('howl') - 0.05 && t < e('howl') + 1.3) { st.howl = true; st.tilt = -0.45; st.tongue = false; st.bob = false; } }
  if (L === 'B2') { st.bob = true; if (t > e('ears') - 0.05) { st.bob = false; st.tongue = false; st.wag = false; st.ears = true; } }
  if (L === 'C1') { st.bob = true; if (t > e('sit') - 0.05) { st.bob = false; st.tongue = false; st.wag = false; st.tilt = 0.12; } }
  if (L === 'C2') { st.bob = false; st.tongue = false; st.wag = false; if (t > e('think')) st.tilt = Math.sin(t * 2) * 0.15; if (t > e('bread') - 0.05) { st.tongue = true; st.wag = true; st.bob = true; } }
  return st; }
function drawDog(c, t, L) { const st = dogState(t, L); if (!st) return;
  let x = DOGX, y = CT; if (st.enter !== undefined && st.enter < 1) { const k = st.enter; x = lerp(1500, DOGX, eOut(k)); y = CT - Math.sin(k * Math.PI) * 260; }
  dog(c, x, y, 0.9, st); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const chest = (g, s, k = 0.6) => reach(g, s, s * g.sw * k, g.ySh + 230);
const cheeks = (st, g) => { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 90, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 90, { planar: true }); };
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { t, talk: talk('her', t), mood: 'neutral', turn: 0.3, look: 0.7, armL: hang(g, -1), armR: hang(g, 1), items: {} };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; cheeks(st, g); }
  if (L === 'A1') { st.mood = 'happy'; if (speaking('a1_h', t, 0.05, 0.3)) { const w = Math.sin(t * 12) * 10; st.headFirst = true; st.armR = reach(g, 1, g.hw * 0.15, g.headY + g.hh * 0.42 + w * 0.3, { fist: true }); st.armL = reach(g, -1, -g.sw * 1.5, g.ySh + 200 + w * 2); }   // piggy snout with both fists
    if (t > SP.a1_o.t + 0.3) { st.mood = 'worried'; st.blink = 0; st.armL = chest(g, -1); st.armR = chest(g, 1); } }
  if (L === 'A2') { st.mood = 'happy'; if (speaking('a2_h', t, 0.05, 0.3)) gest(st, g, 'her', t, -1, 160); if (t > e('susp') - 0.05) { st.mood = 'worried'; st.blink = 0; } }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('sniff') - 0.05) { st.mood = 'skeptical'; } if (t > e('scale')) st.mood = 'worried'; }
  if (L === 'B2') { st.mood = 'happy'; if (speaking('b2_h', t, 0.05, 0.3)) { st.armL = chest(g, -1, 0.25); st.armR = chest(g, 1, 0.25); } if (t > e('ears') - 0.05) { st.mood = 'surprised'; st.blink = 0; st.armL = hang(g, -1); st.armR = hang(g, 1); } }
  if (L === 'C1') { st.mood = 'neutral'; if (speaking('c1_h', t, 0.05, 0.3)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 160); } if (t > e('form')) { st.mood = 'happy'; } }
  if (L === 'C2') { st.mood = 'neutral'; st.turn = 0.4; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { st.mood = 'smug'; st.armL = chest(g, -1, 0.3); st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 60 + Math.sin(t * 2) * 30); }
    if (t > endOf('c2_h') + 0.1) { st.mood = 'neutral'; st.blink = 0; }
    if (t > e('bread') - 0.05) { st.mood = 'smug'; st.items = { R: breadItem }; st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 60); if (t > SP.c2_h2.t) { st.items.L = garlicItem; st.armL = reach(g, -1, -g.sw * 1.3, g.ySh - 40); } } }
  return st; }
function ofcState(t, L) { const g = G.customs, e = k => ev(L, k), st = { t, talk: talk('customs', t), mood: 'neutral', turn: -0.35, look: -0.8, armL: hang(g, -1), armR: hang(g, 1), items: {}, headX: 0, afterTorso: cc => vest(cc, g) };
  const holdOut = () => { st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 20); st.items.L = saloHand(1.2); };
  if (L === 'hook') { st.mood = 'skeptical'; holdOut(); st.lookY = 0; }
  if (L === 'A1') { st.mood = 'skeptical'; if (!saloOnTable(t, L)) holdOut(); if (t > SP.a1_o.t - 0.05) st.mood = 'shock';
    if (t > e('radio') - 0.05) { st.items.R = radioItem; st.armR = reach(g, 1, g.sw * 0.45, g.ySh + 120); st.lookY = 0.35; } if (t > e('dog')) st.mood = 'skeptical'; }
  if (L === 'A2') { st.mood = 'skeptical'; st.lookY = 0.35; st.items = { L: clipItem(t, t > e('susp')) }; st.armL = reach(g, -1, -g.sw * 0.4, g.ySh + 240);
    st.armR = reach(g, 1, g.sw * 0.1 + Math.sin(t * 16) * 18, g.ySh + 190 + (t > e('susp') - 0.15 && t < e('susp') + 0.1 ? -120 : 0));
    if (t > e('jar') - 0.25) { st.items = {}; st.armL = hang(g, -1); st.armR = reach(g, 1, JARX - BX, CT - 40); st.lookY = 0.3; } if (t > e('jar') + 0.3) st.armR = hang(g, 1); }
  if (L === 'B1') { st.mood = 'neutral'; if (speaking('b1_o', t, 0.05, 0.1)) st.mood = 'surprised';
    if (t > e('sniff') - 0.05 && t < e('scale')) { st.mood = 'happy'; st.blink = 1; st.items.R = saloHand(0.75); st.armR = reach(g, 1, g.hw * 0.4, g.headY + g.hh * 1.25); }
    if (t > e('scale') - 0.05) { st.mood = 'happy'; st.lookY = 0.4; } if (speaking('b1_o2', t, 0.05, 0.3)) { st.mood = 'smug'; st.lookY = 0; } }
  if (L === 'B2') { st.mood = 'neutral'; if (t > e('ears') - 0.05) { st.mood = 'shock'; st.blink = 0; st.turn = 0.1; st.look = 0.3; const hx = DOGX - BX - 54, hy = CT - 270; st.armR = reach(g, 1, hx + 100, hy); st.armL = reach(g, -1, hx - 100, hy); } }
  if (L === 'C1') { st.mood = 'skeptical'; if (t > e('form') - 0.05) { st.mood = 'happy'; st.items = { L: formItem }; st.armL = reach(g, -1, -g.sw * 2.1, g.ySh + 120); } if (t > e('sit')) st.mood = 'happy'; }
  if (L === 'C2') { st.mood = 'skeptical';
    if (t > e('think') - 0.05) { st.mood = 'neutral'; st.blink = 0; st.armR = reach(g, 1, g.hw * 0.5, g.headY + g.hh * 0.8); st.lookY = -0.3; }
    if (t > e('look') - 0.05) { const u = t - e('look'); st.armR = hang(g, 1); st.lookY = 0; st.turn = Math.sin(u * 7) * 0.6; st.look = st.turn * 1.4; st.mood = 'worried'; }
    if (speaking('c2_o', t, 0.05, 0.1)) { st.turn = -0.4; st.look = -0.9; st.mood = 'smug'; st.headX = -20; st.armR = reach(g, 1, g.hw * 0.4, g.headY + g.hh * 0.7); st.talk *= 0.6; }
    if (t > e('bread') - 0.05) { st.mood = 'happy'; st.armR = hang(g, 1); } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'customs'], card: ['her', 'customs'], two: ['her', 'customs'], her: ['her'], customs: ['customs'], cover: ['her', 'customs'], room: ['her', 'customs'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  if (tag === 'room') return room(c, t);
  c.drawImage(BGK, BX0, BY0, BW, BH);
  if (who.includes('customs')) heads.customs = K.put(c, OFC, { ...ofcState(t, L), front: (cc, a) => capOn(cc, a, G.customs) }, BX, 0);
  table(c, t, L); drawDog(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  K.mark(c, 'salo', PILEX, CT - 60, 120);
  if (!heads.customs) heads.customs = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }
// C2 twist: CONFISCATED room, all three eat salo on black bread
function room(c, t) { const heads = {}, g = G.her, gd = G.customs, u = t - ev('C2', 'room'), chew = 0.35 + 0.35 * Math.abs(Math.sin(t * 9));
  c.drawImage(BGR, RX0, RY0, RW, RH);
  const bite = (g0, s) => reach(g0, s, s * g0.hw * 0.6, g0.headY + g0.hh * (1.15 + 0.12 * Math.sin(t * 4)));
  heads.customs = K.put(c, OFC, { t, talk: chew, mood: 'happy', blink: 1, turn: -0.3, look: -0.6, armL: bite(gd, -1), armR: hang(gd, 1), items: { L: sandItem }, afterTorso: cc => { vest(cc, gd); cc.fillStyle = '#FFFDF8'; cc.beginPath(); cc.moveTo(-90, gd.ySh + 20); cc.lineTo(90, gd.ySh + 20); cc.lineTo(0, gd.ySh + 230); cc.closePath(); cc.fill(); }, front: (cc, a) => capOn(cc, a, gd, 0.35) }, RX + 360, 0);
  // little table with the feast
  paint(c, q => { q.m(RX - 380, CT); q.l(RX + 380, CT); q.l(RX + 380, CT + 50); q.l(RX - 380, CT + 50); q.z(); }, '#B0623A', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#7A4E2E'; c.fillRect(RX - 340, CT + 50, 40, 710); c.fillRect(RX + 300, CT + 50, 40, 710);
  c.fillStyle = '#E8C48A'; rr(c, RX - 250, CT - 26, 360, 26, 10); c.fill();
  c.save(); c.translate(RX - 150, CT - 26); breadDraw(c, 0.7); c.restore(); c.save(); c.translate(RX - 10, CT - 60); saloDraw(c, 0.5); c.restore(); c.save(); c.translate(RX + 80, CT - 26); garlicDraw(c, 0.6); c.restore();
  c.save(); c.translate(RX + 230, CT); jarDraw(c, 0.95); c.restore();
  dog(c, RX + 40, CT - 26 - 100, 0.72, { t, wag: true, tongue: false, bob: true, tilt: 0.1 }); c.save(); c.translate(RX - 10, CT - 26 - 100 - 175); sandwichDraw(c, 0.6); c.restore();
  heads.her = K.put(c, HER, { t, talk: chew, mood: 'happy', blink: 1, turn: 0.3, look: 0.6, armL: hang(g, -1), armR: bite(g, 1), items: { R: sandItem } }, RX - 400, 0);
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const hHY = G.her.headY, dHY = G.customs.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(160, fy((hHY + dHY) / 2, 0.66, 1160), 0.66, 'cover'), WIDE: S(250, -1000, 0.5, 'wide'), CARD: S(230, fy(dHY, 0.66, 980), 0.66, 'card'), TWO: S(230, fy(dHY, 0.72, 860), 0.72, 'two'),
  HER: S(HX + 40, fy(hHY, 1.0), 1.0, 'her'), HER_H: S(HX + 40, fy(hHY, 1.35, 1180), 1.35, 'her'),
  OFC: S(BX - 20, fy(dHY, 1.0), 1.0, 'customs'), OFC_CU: S(BX - 20, fy(dHY, 1.6, 960), 1.6, 'customs'), OFC_SALO: S(BX - 240, fy(dHY, 1.05, 930), 1.05, 'customs'),
  OFC_DOG: S(BX + 180, fy(dHY, 0.85, 860), 0.85, 'customs'), DOG_CU: S(DOGX - 40, CT - 220, 1.5, 'customs'), PILE: S(PILEX + 60, CT - 260, 1.25, 'customs'), SUITCASE: S(190, CT - 330, 1.45, 'customs'),
  ROOM: S(RX - 20, fy(dHY, 0.9, 1000), 0.9, 'room'), ROOM_CARD: S(RX - 20, fy(dHY, 0.82, 1130), 0.82, 'room') };
const C2Z = [1.0, 1.2, 1.4, 1.6].map(z => S(HX + 40, fy(hHY, z, 940), z, 'her'));   // "slow push-in" during the C2 speech: one closer shot per chunk
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('cu')) return SH.COVER; if (t < hev('shock')) return f(SH.OFC_SALO); if (t < hev('dog')) return f(SH.HER_H); if (t < hev('cover')) return f(SH.DOG_CU);
    const h = t - hev('cover'); if (h < 2.2) return f(SH.COVER); if (h < 3.7) return f(SH.SUITCASE); if (h < 5.8) return f(SH.COVER); if (h < 7.0) return f(SH.DOG_CU); if (h < 8.4) return f(SH.OFC_SALO); return f(SH.COVER); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < 1.15) return f(SH.WIDE);
  if (L === 'C2' && t > e('room') - 0.03) return f(t >= nar.t - 0.1 ? SH.ROOM_CARD : SH.ROOM);
  if (nar && t >= nar.t - 0.1) return f(SH.CARD);
  if (L === 'A1' && t > e('dog') - 0.05) return f(SH.WIDE);
  if (L === 'A2' && t > e('jar') - 0.3) return f(SH.WIDE);
  if (L === 'A2' && t > endOf('a2_o') - 0.1) return f(SH.OFC);
  if (L === 'B1' && t > e('sniff') - 0.05 && t < e('howl') - 0.05) return f(SH.OFC);
  if (L === 'B1' && t > e('howl') - 0.05 && t < e('scale') - 0.05) return f(SH.DOG_CU);
  if (L === 'B1' && t > e('scale') - 0.05 && t < SP.b1_o2.t - 0.1) return f(SH.PILE);
  if (L === 'B2' && (sp('b2_o') || t > e('ears') - 0.05)) return f(SH.OFC_DOG);
  if (L === 'C1' && t > e('sit') - 0.05) return f(SH.WIDE);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0); let wi = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * k / ch.length; if (t >= a - 0.05) i = k; wi += cnt[k]; }); return f(C2Z[i] || SH.HER); }
    if (t > endOf('c2_h') && t < e('think') + 0.9) return f(SH.WIDE); if (t >= e('think') + 0.9 && t < e('look') - 0.05) return f(SH.OFC_CU);
    if (t >= e('look') - 0.05 && t < SP.c2_o.t - 0.1) return f(SH.OFC); if (sp('c2_o')) return f(SH.OFC_CU);
    if (t > e('bread') - 0.05) return f(SH.HER); }
  const cur = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25);
  const single = who => who === 'her' ? SH.HER : SH.OFC;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays: title ribbon (big pink САЛО), cover badge, suspicion meter
function title(c, t) { const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.translate(540, 470); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 70, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 170, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 62, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore(); }
function coverBadge(c, t) { const p = 1 + 0.04 * Math.sin(t * 8); c.save(); c.translate(540, 1745); c.scale(p, p); c.rotate(-0.03); c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -300 + 6, -60 + 10, 600, 120, 60); c.fill(); c.fillStyle = '#FFE15A'; rr(c, -300, -60, 600, 120, 60); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -300, -60, 600, 120, 60); c.stroke();
  fitTxt(c, 'WHAT IS THIS?!', 0, 4, 56, '#E0474C', 540); c.restore(); }
function star5(c, x, y, r, col) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 3; c.stroke(); }
const STARS = { A1: 2, A2: 3, B2: 4, C1: 2 };
function starsAt(t, L) { const o = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']; let n = 1, ch = -1;
  for (const l of o) { if (o.indexOf(l) > o.indexOf(L)) break; const st = ev(l, 'star'); if (STARS[l] && t >= st) { n = STARS[l]; ch = st; } else if (STARS[l] && l !== L) n = STARS[l]; }
  return { n, ch }; }
function meter(c, t, sc) { const L = sc.id; if (L === 'hook' || L === 'outro') return; const nar = SP[L.toLowerCase() + '_nar'], u = t - sc.s;
  if (u < 1.2 || (nar && t > nar.t - 0.2)) return;
  const app = L === 'C2' && t > ev('C2', 'room'); const { n, ch } = starsAt(t, L); const chg = app ? ev('C2', 'room') : ch, since = t - chg, bump = since > 0 && since < 0.45 ? 1 + 0.25 * Math.sin(since / 0.45 * Math.PI) : 1;
  const label = app || (since > 0.2 && since < 2.2); const k = eBack(P(u, 1.2, 1.5), 1.6) * bump;
  c.save(); c.translate(70, 300); c.scale(k, k); const w = label ? 520 : 360, h = label ? 128 : 78;
  c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, 6, 8, w, h, 22); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 5; rr(c, 0, 0, w, h, 22); c.fill(); c.stroke();
  const iy = label ? 86 : 39;
  if (app) { c.fillStyle = C.pink; c.beginPath(); c.arc(42, iy, 22, 0, TAU); c.fill(); c.fillStyle = C.white; c.fillRect(30, iy - 3, 24, 6); }
  else { c.strokeStyle = C.oliveD; c.lineWidth = 7; c.beginPath(); c.arc(38, iy - 4, 17, 0, TAU); c.moveTo(50, iy + 8); c.lineTo(62, iy + 20); c.stroke(); }
  for (let i = 0; i < 5; i++) { const on = app || i < n; star5(c, 104 + i * 54, iy + 2, 23, on ? C.gold : '#D9D3C4'); }
  if (label) { UI.textFit(c, 'Unb9', 30, app ? 'АППЕТИТ' : 'ПОДОЗРИТЕЛЬНОСТЬ', w - 40); c.fillStyle = app ? C.pink : '#C23C4A'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(app ? 'АППЕТИТ' : 'ПОДОЗРИТЕЛЬНОСТЬ', 22, 32); }
  c.restore(); }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'Food! Pig! Good!'], ['A2', 'My mum made it.'], ['B1', "It's like bacon, but saltier."], ['B2', 'My mum swears by it.'], ['C1', 'Would it help if I declared it?'], ['C2', 'delicacy, sustain']];
    K.outro(c, t, { q: ['А КАК БЫ ТЫ ОБЪЯСНИЛ,', 'ЧТО ТАКОЕ САЛО?'], rows, cta: ['ОТПРАВЬ ТОМУ, КТО ВЕЗЁТ', 'САЛО ЧЕРЕЗ ГРАНИЦУ'], heroX: 190, heroS: 0.42, rowH: 95, boxY: 790,
      hero: (cc, tt) => { const g = G.her, gd = G.customs; K.put(cc, OFC, { t: tt, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, armL: reach(gd, -1, -gd.sw * 2.0, gd.ySh - 330 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(gd, 1), items: { R: sandItem }, afterTorso: cc2 => vest(cc2, gd), front: (cc2, a) => capOn(cc2, a, gd) }, 1500, 60);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: hang(g, 1), items: {} }, 0, 0); } });
    // A1 phrase greyed out and struck through
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 95, y = 790 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { customs: ['OFFICER', '#1F2A44'] };
  if (L === 'hook') { const cover = tag === 'cover'; if (cover) { title(c, t); if (t < SP.hook_o.t) coverBadge(c, t); }
    const hookProj = p => { const q = proj(p); return q.x < 0 || q.x > W ? { x: q.x < 0 ? 60 : W - 60, y: 1050 } : q; };
    K.bubbles(c, t, { id: 'hook' }, heads, hookProj, { cleanChunks: true, names, hold: { hook_o: 0.15 } }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.levelIntroNext(c, t); return; }
  if (L === 'C2') { const e = k => ev(L, k); if (t > e('think') && t < e('look') - 0.1) K.pop(c, t, '*ОФИЦЕР ДУМАЕТ*', e('think') + 0.05, e('look') - 0.15, 540, 1450, C.white, -0.04, 60); }
  K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { a1_o: 0.3, a2_o: 0.05, b1_o: 0.1, b1_o2: 0.4, b2_o: 0.05, c1_o: 0.05, c2_h: 0.05, c2_o: 0.1, c2_h2: 0.05 } });
  meter(c, t, sc);
  K.hud(c, t, sc);
}
E.run('salo', NF, renderFrame);
