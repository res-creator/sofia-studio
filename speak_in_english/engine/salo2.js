// "Как будет «сало» по-английски?" — rubric «Ответ на вопрос из комментариев» (live scene + 4 answers), hard_cut camera: node salo2.js start end out.mp4 | --png=f1,f2
// A party in a London flat: buffet table with canapés, crisps and a wooden board with salo on rye bread; a tall dresser on the left —
// the host's cat sits on top in a napkin bib and never takes its eyes off the salo (absurd detail). Nigel holds a salo sandwich up to his eye.
// hook: "White cheese? Soap?" (he sniffs it) + comment plate.  Each answer restarts from the hook situation (Nigel holding the sandwich).
// 1 · ХОЛОДНО: "Fat. Pig. Eat." -> he slowly puts the sandwich back on the board, takes a crisp instead.
// 2 · С ЮМОРОМ: "...never went to the gym." (she flexes) -> he laughs, holds the sandwich at arm's length.
// 3 · КАК НОСИТЕЛЬ: garlic clove on her palm -> he bites -> "gorgeous!" (stars) + Bella tip.
// 4 · КОРОЛЕВСКИЙ ОТВЕТ: she presents the board like a crown -> "Two? I'm frightened, but I'm hungry." (a sandwich in each hand, sweating).
// Twist: Nigel's granny clicks her handbag open and pulls out a paper bundle -> insert: lardo, tag «SINCE 1962» -> her line -> wide: the cat leaps onto the table -> moral. End screen 1/2/3/4 + ask.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/salo2/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead (as in cake.js)
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#EE5E9A' }, bottom: { type: 'skirt', col: '#3E3A5C' }, shoes: { col: '#2B2F3A', acc: '#EE5E9A' } };
const NIG = { ...BASE.oliver, seed: 31, hair: { style: 'quiff', col: '#B5884A' }, brow: '#8A6438', top: { type: 'cardigan', col: '#5E8A6A' }, bottom: { type: 'trousers', col: '#4A4A5C' }, shoes: { col: '#6A3E26', acc: null } };
const GRAN = { ...BASE.doris, seed: 33, top: { type: 'cardigan', col: '#B58AC8' }, bottom: { type: 'skirt', col: '#5A4A7A' } };
const G = { her: geom(HER), nig: geom(NIG), gran: geom(GRAN) };
const X = { her: -380, nig: 400, gran: 1180 }, TX = 20, TOP = -760, TL0 = -250, TL1 = 290, CUPX = -720, CUPH = 1800, CUPW = 420, CHAIRX = 1500;
const BOARDX = 10, CRISPX = 215, CANX = -165;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function star(c, x, y, r, a = 1, col = '#FFF6C8') { c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const rr_ = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.restore(); }
function sweat(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(0, -34); q.q(22, 0, 16, 14); q.q(0, 30, -16, 14); q.q(-22, 0, 0, -34); q.z(); }, '#8FD0F5', { sd: 3, hd: 2, lw: 3 }); c.restore(); }

// ---------------- props (paths only)
// salo slice on rye bread; (0,0) = centre; bite 0..2 = bites taken from the right end; garlic = a garlic clove on top
function sandwich(c, s = 1, bite = 0, garlic = false) { c.save(); c.scale(s, s);
  c.save(); if (bite > 0) { c.beginPath(); c.rect(-90, -70, 180, 140); for (let i = 0; i < bite; i++) c.arc(78 - i * 34, -6 + i * 10, 34, 0, TAU); c.clip('evenodd'); }
  paint(c, q => { q.m(-80, -12); q.q(-82, -36, -60, -38); q.l(62, -38); q.q(84, -36, 80, -12); q.l(78, 26); q.q(76, 34, 66, 34); q.l(-66, 34); q.q(-76, 34, -78, 26); q.z(); }, '#5A3524', { sd: 4, hd: 2, lw: 3.5, inner: k => { k.fillStyle = 'rgba(255,220,180,.18)'; for (let i = 0; i < 9; i++) { k.beginPath(); k.arc(-60 + i * 15, -4 + (i % 3) * 10, 3, 0, TAU); k.fill(); } } });
  paint(c, q => { q.m(-70, -36); q.l(70, -36); q.q(74, -58, 62, -62); q.l(-62, -62); q.q(-74, -58, -70, -36); q.z(); }, '#FBF4EA', { sd: 3, hd: 2, lw: 3 });
  c.fillStyle = '#E79A9A'; c.fillRect(-66, -52, 132, 7); c.fillStyle = '#9A6A4A'; c.fillRect(-64, -64, 128, 5);
  c.fillStyle = 'rgba(60,40,30,.55)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-50 + i * 20, -43 + (i % 2) * 4, 2.5, 0, TAU); c.fill(); }
  c.restore();
  if (garlic) garlicClove(c, -20, -70, 0.7);
  c.restore(); }
function garlicClove(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(0, -40); q.q(30, -10, 26, 16); q.q(0, 30, -26, 16); q.q(-30, -10, 0, -40); q.z(); }, '#F6F0E2', { sd: 4, hd: 2, lw: 3 }); c.strokeStyle = 'rgba(160,140,110,.6)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(8, -6, 6, 20); c.stroke(); c.restore(); }
// wooden board; n = sandwiches on it (0..4)
function board(c, n) { paint(c, q => { q.m(-170, -20); q.l(170, -20); q.q(182, -20, 182, -8); q.l(182, 6); q.q(182, 18, 170, 18); q.l(-170, 18); q.q(-182, 18, -182, 6); q.l(-182, -8); q.q(-182, -20, -170, -20); q.z(); }, '#C98B5A', { sd: 5, hd: 3, lw: 3.5 });
  paint(c, q => { q.m(182, -6); q.l(232, -6); q.q(244, 0, 232, 6); q.l(182, 6); q.z(); }, '#B07A4A', { sd: 2, hd: 1, lw: 3 });
  const pos = [[-112, -50, -0.05], [0, -52, 0.04], [112, -50, -0.03], [-56, -100, 0.06]];
  for (let i = 0; i < Math.min(n, 4); i++) { c.save(); c.translate(pos[i][0], pos[i][1]); c.rotate(pos[i][2]); sandwich(c, 0.62); c.restore(); }
  garlicClove(c, 150, -34, 0.45); garlicClove(c, 165, -30, 0.4); }
function crispBowl(c) { c.fillStyle = '#F2C14E'; for (let i = 0; i < 9; i++) { c.save(); c.translate(-70 + i * 18, -58 - Math.abs(Math.sin(i * 1.7)) * 26); c.rotate(i * 0.7); c.beginPath(); c.ellipse(0, 0, 22, 14, 0, 0, TAU); c.fill(); c.strokeStyle = '#C98B2A'; c.lineWidth = 2.5; c.stroke(); c.restore(); }
  paint(c, q => { q.m(-100, -56); q.l(100, -56); q.q(92, 0, 0, 2); q.q(-92, 0, -100, -56); q.z(); }, '#4E8FC8', { sd: 6, hd: 3, lw: 3.5 }); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-70, -40, 140, 6); }
function canapes(c) { paint(c, q => q.e(0, -6, 110, 18), '#FFFDF6', { sd: 3, hd: 2, lw: 3 });
  for (let i = 0; i < 4; i++) { const x = -66 + i * 44; c.strokeStyle = '#C98B5A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, -16); c.lineTo(x, -70); c.stroke(); c.fillStyle = ['#F2C14E', '#E0474C', '#4CAF6A', '#F2C14E'][i]; rr(c, x - 16, -42, 32, 26, 6); c.fill(); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x, -76, 7, 0, TAU); c.fill(); } }
function wine(c, x) { c.save(); c.translate(x, 0); c.globalAlpha = 0.85; paint(c, q => { q.m(-24, -150); q.q(-26, -90, 0, -84); q.q(26, -90, 24, -150); q.z(); }, '#E8F2F8', { sd: 0, hd: 0, lw: 3, line: '#7A8A9A' }); c.fillStyle = 'rgba(150,20,50,.85)'; c.beginPath(); c.moveTo(-23, -122); c.quadraticCurveTo(-24, -90, 0, -86); c.quadraticCurveTo(24, -90, 23, -122); c.fill(); c.strokeStyle = '#7A8A9A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -84); c.lineTo(0, -6); c.moveTo(-20, -4); c.lineTo(20, -4); c.stroke(); c.restore(); }
// the handbag: (0,0) = handle top; open 0..1 = the flap lifts
function handbag(c, open = 0) { c.save(); c.strokeStyle = '#5A2E4A'; c.lineWidth = 9; c.beginPath(); c.moveTo(-50, 70); c.quadraticCurveTo(-50, 0, 0, 0); c.quadraticCurveTo(50, 0, 50, 70); c.stroke();
  paint(c, q => { q.m(-110, 70); q.l(110, 70); q.q(124, 70, 122, 90); q.l(116, 230); q.q(114, 246, 98, 246); q.l(-98, 246); q.q(-114, 246, -116, 230); q.l(-122, 90); q.q(-124, 70, -110, 70); q.z(); }, '#8E3E6A', { sd: 10, hd: 5, lw: 4 });
  c.save(); c.translate(0, 72); c.rotate(-1.2 * open); c.scale(1, 1 - 0.3 * open);
  paint(c, q => { q.m(-112, 0); q.l(112, 0); q.l(100, 86); q.q(0, 110, -100, 86); q.z(); }, '#A24A7A', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, 96, 13, 0, TAU); c.fill(); c.strokeStyle = '#9A7A2A'; c.lineWidth = 3; c.stroke(); c.restore();
  if (open > 0.3) { c.fillStyle = '#3A1A2E'; c.beginPath(); c.ellipse(0, 76, 104, 14 * open, 0, 0, TAU); c.fill(); }
  c.restore(); }
// the paper bundle: (0,0) = centre; open 0..1 = paper unfolds, showing a slab of lardo + tag «SINCE 1962»
function bundle(c, open = 0, s = 1) { c.save(); c.scale(s, s); const w = 230, h = 150;
  if (open > 0) { const k = eOut(open);
    for (const sg of [-1, 1]) paint(c, q => { q.m(sg * w / 2, -h / 2); q.l(sg * (w / 2 + 120 * k), -h / 2 - 40 * k); q.l(sg * (w / 2 + 140 * k), h / 2 + 30 * k); q.l(sg * w / 2, h / 2); q.z(); }, '#D9B482', { sd: 4, hd: 2, lw: 3.5 });
    paint(c, q => { q.m(-w / 2 - 10, h / 2); q.l(w / 2 + 10, h / 2); q.l(w / 2 + 30 * k, h / 2 + 50 * k); q.l(-w / 2 - 30 * k, h / 2 + 50 * k); q.z(); }, '#CFA874', { sd: 4, hd: 2, lw: 3.5 });
    // the slab: rind on top, white fat, pink meat streak, pepper + garlic
    paint(c, q => { q.m(-w / 2 + 6, -h / 2 + 20); q.l(w / 2 - 6, -h / 2 + 20); q.l(w / 2 - 6, h / 2 - 6); q.l(-w / 2 + 6, h / 2 - 6); q.z(); }, '#FBF4EA', { sd: 6, hd: 3, lw: 3.5 });
    c.fillStyle = '#8A5A3A'; c.fillRect(-w / 2 + 6, -h / 2 + 14, w - 12, 14); c.fillStyle = '#E79A9A'; c.fillRect(-w / 2 + 10, 18, w - 20, 16);
    c.fillStyle = 'rgba(60,40,30,.6)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(-w / 2 + 20 + i * 14, -h / 2 + 40 + (i % 3) * 12, 3, 0, TAU); c.fill(); }
    garlicClove(c, -60, -2, 0.6); garlicClove(c, 40, -6, 0.55);
    if (k > 0.5) { c.save(); c.globalAlpha = clamp((k - 0.5) * 2); c.translate(w / 2 + 70, -h / 2 - 50); c.rotate(0.2); c.strokeStyle = '#6A4A2A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-60, 30); c.lineTo(-110, 70); c.stroke();
      c.fillStyle = '#FFFDF6'; rr(c, -70, -32, 140, 64, 10); c.fill(); c.strokeStyle = '#3E471E'; c.lineWidth = 3; c.stroke(); fitTxt(c, 'SINCE', 0, -11, 22, '#C23C76', 120, 'Unb9'); fitTxt(c, '1962', 0, 16, 28, '#3E471E', 120, 'Unb9'); c.restore(); }
  } else { paint(c, q => { q.m(-w / 2, -h / 2); q.l(w / 2, -h / 2); q.l(w / 2, h / 2); q.l(-w / 2, h / 2); q.z(); }, '#D9B482', { sd: 8, hd: 4, lw: 4 });
    c.strokeStyle = 'rgba(120,80,40,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 2 + 50, 0); c.lineTo(-w / 2, h / 2); c.moveTo(w / 2, -h / 2); c.lineTo(w / 2 - 50, 0); c.lineTo(w / 2, h / 2); c.stroke();
    c.strokeStyle = '#B03A3A'; c.lineWidth = 5; c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.moveTo(0, -h / 2); c.lineTo(0, h / 2); c.stroke(); c.beginPath(); c.ellipse(-14, -12, 16, 10, -0.5, 0, TAU); c.ellipse(14, -12, 16, 10, 0.5, 0, TAU); c.stroke(); }
  c.restore(); }
// the host's cat: sits on top of the dresser in a napkin bib. (x,y) = bottom centre; look = world point it stares at; lick 0..1; jump = {k, x1, y1} for the leap
function cat(c, t, x, y, o = {}) { const look = o.look || { x: BOARDX, y: TOP }, s = o.s || 1;
  c.save(); c.translate(x, y); c.scale(s, s); if (o.rot) c.rotate(o.rot);
  const fur = '#EBA15E', furD = '#C9793A', furL = '#FFF1DE', sw = Math.sin(t * 2.6);
  // tail
  c.strokeStyle = furD; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); c.moveTo(70, -20); c.bezierCurveTo(170, -10, 170 + sw * 30, -120, 120 + sw * 50, -190); c.stroke(); c.strokeStyle = fur; c.lineWidth = 20; c.stroke();
  // body
  paint(c, q => { q.m(-90, 0); q.q(-110, -160, -40, -230); q.l(40, -230); q.q(110, -160, 90, 0); q.z(); }, fur, { sd: 12, hd: 6, lw: 4.5, inner: k => { k.strokeStyle = furD; k.lineWidth = 9; for (const yy of [-60, -110, -160]) { k.beginPath(); k.moveTo(-100, yy); k.quadraticCurveTo(-70, yy + 12, -50, yy); k.moveTo(100, yy); k.quadraticCurveTo(70, yy + 12, 50, yy); k.stroke(); } } });
  for (const sg of [-1, 1]) paint(c, q => q.e(sg * 34, -12, 30, 18), furL, { sd: 3, hd: 2, lw: 3.5 });
  // head
  c.save(); c.translate(0, -275); const dx = clamp((look.x - x) / 900, -1, 1), dy = clamp((look.y - (y - 275)) / 900, -1, 1); c.rotate(dx * 0.12);
  for (const sg of [-1, 1]) paint(c, q => { q.m(sg * 30, -60); q.l(sg * 78, -112); q.l(sg * 84, -30); q.z(); }, fur, { sd: 4, hd: 2, lw: 4 });
  paint(c, q => q.e(0, 0, 92, 78), fur, { sd: 10, hd: 5, lw: 4.5, inner: k => { k.strokeStyle = furD; k.lineWidth = 8; k.beginPath(); for (const xx of [-24, 0, 24]) { k.moveTo(xx, -76); k.lineTo(xx * 0.8, -44); } k.stroke(); } });
  paint(c, q => q.e(0, 30, 50, 34), furL, { sd: 3, hd: 2, lw: 0 });
  for (const sg of [-1, 1]) { c.fillStyle = '#FFFDF6'; c.beginPath(); c.ellipse(sg * 36, -12, 22, 26, 0, 0, TAU); c.fill(); c.strokeStyle = '#3E2A1A'; c.lineWidth = 3.5; c.stroke();
    c.fillStyle = '#2E4A1A'; c.beginPath(); c.ellipse(sg * 36 + dx * 9, -12 + dy * 9, 9, 20, 0, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(sg * 36 + dx * 9 - 3, -20 + dy * 9, 4, 0, TAU); c.fill(); }
  c.fillStyle = '#E2707E'; c.beginPath(); c.moveTo(-10, 14); c.lineTo(10, 14); c.lineTo(0, 24); c.closePath(); c.fill();
  c.strokeStyle = '#3E2A1A'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, 24); c.quadraticCurveTo(-12, 40, -22, 32); c.moveTo(0, 24); c.quadraticCurveTo(12, 40, 22, 32); c.stroke();
  const lk = o.lick || 0; if (lk > 0) { c.fillStyle = '#E2707E'; c.beginPath(); c.ellipse(10 + 8 * Math.sin(t * 14), 38, 12, 14 * lk, 0.3, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.5; for (const sg of [-1, 1]) for (const k of [-1, 1]) { c.beginPath(); c.moveTo(sg * 46, 26); c.lineTo(sg * 110, 18 + k * 12); c.stroke(); }
  c.restore();
  // napkin bib: white with a red check border, knot at the neck
  paint(c, q => { q.m(-62, -212); q.l(62, -212); q.l(0, -96); q.z(); }, '#FFFDF6', { sd: 3, hd: 2, lw: 3.5 });
  c.strokeStyle = '#E0474C'; c.lineWidth = 6; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(-50, -204); c.lineTo(0, -110); c.lineTo(50, -204); c.stroke(); c.setLineDash([]);
  for (const sg of [-1, 1]) paint(c, q => { q.m(sg * 10, -214); q.l(sg * 58, -236); q.l(sg * 52, -200); q.z(); }, '#FFFDF6', { sd: 2, hd: 1, lw: 3 });
  paint(c, q => q.a(0, -214, 12), '#FFFDF6', { sd: 2, hd: 1, lw: 3 });
  c.restore(); }

// ---------------- the flat (prerendered, softly blurred): wallpaper, window with a dusk London skyline, bunting + fairy lights, framed print, rug
const BX0 = -3300, BY0 = -4200, BW = 7000, BH = 6000, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E3EDE6'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(94,138,106,.10)'; for (let x = BX0; x < BX0 + BW; x += 160) for (let y = BY0; y < -100; y += 160) { c.beginPath(); c.arc(x + ((y / 160) % 2) * 80, y, 18, 0, TAU); c.fill(); }
  // window (dusk skyline: rooftops, chimneys, a clock tower)
  const wx0 = -320, wx1 = 560, wy0 = -2900, wy1 = -1900;
  c.fillStyle = '#FFFDF6'; rr(c, wx0 - 30, wy0 - 30, wx1 - wx0 + 60, wy1 - wy0 + 60, 16); c.fill();
  const g = c.createLinearGradient(0, wy0, 0, wy1); g.addColorStop(0, '#3E4A8A'); g.addColorStop(0.6, '#C97AA0'); g.addColorStop(1, '#F2B98A'); c.fillStyle = g; c.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  c.save(); c.beginPath(); c.rect(wx0, wy0, wx1 - wx0, wy1 - wy0); c.clip(); c.fillStyle = '#3A3050';
  c.beginPath(); c.moveTo(wx0, wy1); for (let x = wx0; x <= wx1; x += 80) { const hgt = 120 + ((x * 7) % 90); c.lineTo(x, wy1 - hgt); c.lineTo(x + 60, wy1 - hgt); c.lineTo(x + 60, wy1 - hgt + 30); } c.lineTo(wx1, wy1); c.closePath(); c.fill();
  c.fillRect(300, wy1 - 520, 70, 520); c.beginPath(); c.moveTo(290, wy1 - 520); c.lineTo(335, wy1 - 640); c.lineTo(380, wy1 - 520); c.fill(); c.fillStyle = '#F7E6B0'; c.beginPath(); c.arc(335, wy1 - 450, 24, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,240,180,.8)'; for (let i = 0; i < 18; i++) c.fillRect(wx0 + 30 + (i * 53) % (wx1 - wx0 - 60), wy1 - 40 - (i * 37) % 90, 10, 14);
  c.restore();
  c.fillStyle = '#FFFDF6'; c.fillRect((wx0 + wx1) / 2 - 9, wy0, 18, wy1 - wy0); c.fillRect(wx0, (wy0 + wy1) / 2 - 9, wx1 - wx0, 18);
  c.fillStyle = '#C9573A'; rr(c, wx0 - 170, wy0 - 70, 140, 1150, 30); c.fill(); rr(c, wx1 + 30, wy0 - 70, 140, 1150, 30); c.fill();
  // bunting + fairy lights across the wall
  for (const [y0, sag] of [[-2240, 120]]) { c.strokeStyle = '#7A6A5A'; c.lineWidth = 4; c.beginPath(); c.moveTo(-2600, y0); c.quadraticCurveTo(-1200, y0 + sag, 0, y0 - 10); c.quadraticCurveTo(1200, y0 + sag, 2600, y0); c.stroke();
    const cols = ['#EE5E9A', '#F2C14E', '#4E8FC8', '#4CAF6A', '#E0474C'];
    for (let i = 0; i < 26; i++) { const x = -2550 + i * 200, u = ((x + 2600) % 2600) / 2600, yy = y0 + Math.sin(u * Math.PI) * sag * 0.95 - 5; if (x > wx0 - 170 && x < wx1 + 170) continue; c.fillStyle = cols[i % 5]; c.beginPath(); c.moveTo(x - 50, yy); c.lineTo(x + 50, yy); c.lineTo(x, yy + 110); c.closePath(); c.fill(); } }
  c.strokeStyle = '#5A6A4A'; c.lineWidth = 3; c.beginPath(); c.moveTo(-2600, -1720); for (let x = -2600; x <= 2600; x += 100) c.lineTo(x, -1720 + Math.sin(x / 300) * 40); c.stroke();
  for (let x = -2600; x <= 2600; x += 100) { c.fillStyle = ['#FFE7A0', '#FFD0E0', '#D0F0FF'][((x / 100) % 3 + 3) % 3]; c.beginPath(); c.arc(x, -1712 + Math.sin(x / 300) * 40, 13, 0, TAU); c.fill(); }
  // framed print (a teapot) + a floor lamp on the right
  c.fillStyle = '#3E471E'; rr(c, 1500, -2500, 380, 460, 12); c.fill(); c.fillStyle = '#F7E6B0'; rr(c, 1524, -2476, 332, 412, 8); c.fill();
  paint(c, q => q.e(1690, -2240, 90, 70), '#4E8FC8', { sd: 6, hd: 3, lw: 3 }); c.fillStyle = '#4E8FC8'; c.fillRect(1600, -2250, -50, 16); c.beginPath(); c.arc(1690, -2320, 18, 0, TAU); c.fill();
  c.fillStyle = '#7A6A5A'; c.fillRect(2380, -1800, 16, 1800); paint(c, q => { q.m(2290, -1800); q.l(2490, -1800); q.l(2440, -2020); q.l(2340, -2020); q.z(); }, '#F2C14E', { sd: 6, hd: 3, lw: 3 });
  c.fillStyle = 'rgba(255,230,150,.25)'; c.beginPath(); c.moveTo(2290, -1800); c.lineTo(2490, -1800); c.lineTo(2700, -900); c.lineTo(2080, -900); c.fill();
  c.fillStyle = '#6A9E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-2450 + i * 30, -700 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#C9733A'; rr(c, -2530, -320, 240, 320, 20); c.fill();
  // skirting + floor + rug
  c.fillStyle = '#FFFDF6'; c.fillRect(BX0, -90, BW, 90);
  c.fillStyle = '#9C6E4A'; c.fillRect(BX0, 0, BW, 1800); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, 0, 8, 1800);
  c.fillStyle = '#C9573A'; c.beginPath(); c.ellipse(150, 140, 1300, 130, 0, 0, TAU); c.fill(); c.strokeStyle = '#F2C14E'; c.lineWidth = 12; c.beginPath(); c.ellipse(150, 140, 1220, 105, 0, 0, TAU); c.stroke();
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
// the tall dresser (left): plates behind glass up top, drawers below; the cat sits on top
function dresser(c) { const x0 = CUPX - CUPW / 2, w = CUPW, h = CUPH;
  c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(x0 + 14, -h + 20, w, h - 20);
  paint(c, q => { q.m(x0 - 20, -h - 30); q.l(x0 + w + 20, -h - 30); q.l(x0 + w + 20, -h); q.l(x0 - 20, -h); q.z(); }, '#8A5A3A', { sd: 4, hd: 2, lw: 4 });
  paint(c, q => { q.m(x0, -h); q.l(x0 + w, -h); q.l(x0 + w, 0); q.l(x0, 0); q.z(); }, '#B07A4A', { sd: 12, hd: 6, lw: 4 });
  c.fillStyle = '#D8EEF2'; rr(c, x0 + 30, -h + 40, w - 60, 820, 10); c.fill(); c.strokeStyle = '#8A5A3A'; c.lineWidth = 8; c.strokeRect(x0 + 30, -h + 40, w - 60, 820); c.beginPath(); c.moveTo(CUPX, -h + 40); c.lineTo(CUPX, -h + 860); c.stroke();
  for (const yy of [-h + 320, -h + 600]) { c.fillStyle = '#8A5A3A'; c.fillRect(x0 + 30, yy, w - 60, 14); for (let i = 0; i < 4; i++) { const px = x0 + 80 + i * 90; c.fillStyle = ['#FFFDF6', '#4E8FC8', '#FFFDF6', '#EE5E9A'][i]; c.beginPath(); c.ellipse(px, yy - 70, 38, 70, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 3; c.stroke(); } }
  for (let i = 0; i < 3; i++) { const yy = -h + 920 + i * 280; paint(c, q => { q.m(x0 + 30, yy); q.l(x0 + w - 30, yy); q.l(x0 + w - 30, yy + 240); q.l(x0 + 30, yy + 240); q.z(); }, '#C98B5A', { sd: 5, hd: 3, lw: 3.5 }); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(CUPX, yy + 120, 14, 0, TAU); c.fill(); } }
// buffet table with a cloth; items on it drawn in table()
function tableBack(c) { c.fillStyle = '#7A5A3A'; for (const x of [TL0 + 30, TL1 - 50]) c.fillRect(x, TOP, 22, -TOP); }
function table(c, t, L, nBoard) {
  paint(c, q => { q.m(TL0 - 20, TOP); q.l(TL1 + 20, TOP); q.l(TL1 + 34, TOP + 360); q.q((TL0 + TL1) / 2, TOP + 390, TL0 - 34, TOP + 360); q.z(); }, '#FFFDF6', { sd: 10, hd: 5, lw: 4, inner: k => { k.fillStyle = '#EE5E9A'; k.fillRect(TL0 - 40, TOP + 330, TL1 - TL0 + 80, 60); k.strokeStyle = 'rgba(0,0,0,.06)'; k.lineWidth = 8; for (let x = TL0 + 40; x < TL1; x += 80) { k.beginPath(); k.moveTo(x, TOP + 30); k.lineTo(x + 6, TOP + 330); k.stroke(); } } });
  c.save(); c.translate(CANX, TOP); canapes(c); c.restore();
  wine(c, CANX + 50 - 160 + 60);
  c.save(); c.translate(CRISPX, TOP); crispBowl(c); c.restore();
  if (nBoard >= 0) { c.save(); c.translate(BOARDX, TOP - 20); board(c, nBoard); c.restore(); K.mark(c, 'board', BOARDX, TOP - 70, 200); } }
// the armchair (right) by the granny
function armchair(c) { const x = CHAIRX; paint(c, q => { q.m(x - 260, -900); q.q(x - 260, -1020, x - 140, -1020); q.l(x + 140, -1020); q.q(x + 260, -1020, x + 260, -900); q.l(x + 260, -60); q.l(x - 260, -60); q.z(); }, '#4E8FC8', { sd: 12, hd: 6, lw: 4 });
  for (const sg of [-1, 1]) paint(c, q => { q.m(x + sg * 300, -560); q.q(x + sg * 300, -640, x + sg * 220, -640); q.l(x + sg * 180, -640); q.l(x + sg * 180, -60); q.l(x + sg * 300, -60); q.z(); }, '#3E7AB0', { sd: 8, hd: 4, lw: 4 });
  paint(c, q => { q.m(x - 190, -520); q.l(x + 190, -520); q.l(x + 190, -380); q.l(x - 190, -380); q.z(); }, '#6AA8DA', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#5A3A2A'; c.fillRect(x - 250, -60, 30, 60); c.fillRect(x + 220, -60, 30, 60); }

// ---------------- characters
const down = (g, s) => reach(g, s, s * g.sw * 1.08, g.ySh + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => reach(g, s, s * g.sw * k, g.ySh + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const gest = (st, g, who, t, side, b) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + b + Math.cos(u) * 20, { planar: true }); } };
const crossed = (st, g) => { st.armL = reach(g, -1, g.sw * 0.45, g.ySh + 300, { planar: true }); st.armR = reach(g, 1, -g.sw * 0.45, g.ySh + 330, { planar: true }); };
const sandItem = (s = 1.0, bite = 0, garlic = false, dy = -40) => (ctx) => { ctx.save(); ctx.translate(0, dy); sandwich(ctx, s, bite, garlic); ctx.restore(); };
const garlicItem = (ctx) => { ctx.save(); ctx.translate(0, -50); garlicClove(ctx, 0, 0, 1.6); ctx.restore(); };
const boardItem = (n) => (ctx) => { ctx.save(); ctx.translate(-30, -40); ctx.rotate(-0.06); board(ctx, n); ctx.restore(); };
const bagItem = (o) => (ctx) => { ctx.save(); ctx.translate(0, -10); handbag(ctx, o); ctx.restore(); };
const bundleItem = (o, s = 0.6) => (ctx) => { ctx.save(); ctx.translate(0, -60); bundle(ctx, o, s); ctx.restore(); };

function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'happy', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 1.6, g.ySh + 330, { planar: true });
    if (t > hev('sniff')) { st.mood = 'surprised'; }
    if (t > hev('nar')) { st.mood = 'smug'; st.squint = true; } }
  if (L === 'o1') { st.mood = 'bored'; crossed(st, g); st.look = 0.8;
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'annoyed'; st.blink = 0; }
    if (t > e('put')) { st.mood = 'bored'; st.blink = 1; } }
  if (L === 'o2') { st.mood = 'smug';
    if (speaking('o2_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 160); }
    if (t > e('flex') && t < endOf('o2_h') + 0.6) { const k = eOut(clamp((t - e('flex')) / 0.25)); st.armR = reach(g, 1, lerp(g.sw * 1.5, g.sw * 1.75, k), lerp(g.ySh + 300, g.ySh - 170, k), { planar: true }); st.mood = 'happy'; st.squint = true; }
    if (t > SP.o2_p.t) { st.mood = 'happy'; st.laugh = speaking('o2_p', t, 0, 0) && t < SP.o2_p.t + 1.6; st.blink = st.laugh ? 1 : 0; } }
  if (L === 'o3') { st.mood = 'happy'; st.turn = 0.3; st.look = 0.8;
    st.armR = reach(g, 1, g.sw * 1.5, g.ySh + 200, { planar: true }); if (t < endOf('o3_h') + 0.1) st.items.R = garlicItem;
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, -1, 200);
      if (t > e('garlic')) { const k = eOut(clamp((t - e('garlic')) / 0.3)); st.armR = reach(g, 1, lerp(g.sw * 1.5, g.sw * 2.0, k), lerp(g.ySh + 200, g.ySh + 120, k), { planar: true }); } }
    if (t > endOf('o3_h') + 0.1) { st.mood = 'smug'; st.look = 0.9; }
    if (t > e('wow')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.tilt = 0.05; } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.2; st.look = 0.6;
    const lift = SP.o4_h.t - 0.2; if (t > lift) { const k = eOut(clamp((t - lift) / 0.35)); st.armR = reach(g, 1, lerp(g.sw * 1.4, g.sw * 1.55, k), lerp(g.ySh + 400, g.ySh + 40, k), { planar: true }); st.items.R = boardItem(3); }
    if (speaking('o4_h', t, 0.1, 0.1)) { const u = t - SP.o4_h.t; st.mood = u > 9.5 ? 'smug' : 'happy'; st.squint = u < 4; gest(st, g, 'her', t, -1, 150); if (u > 9.6) { st.tilt = 0.05; st.armL = open(g, -1, 1.6, 120); } }
    if (t > endOf('o4_h') + 0.1) { st.mood = 'smug'; st.blink = 1; st.squint = true; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 1; st.turn = 0.4;
    if (t > e('clasp')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('react')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.armR = open(g, 1, 1.5, 110); st.armL = open(g, -1, 1.5, 110); }
    if (t > e('landc') + 0.3) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.look = -0.4; st.turn = -0.1; st.armL = open(g, -1, 1.6, 140 + Math.sin(t * 6) * 12); st.armR = down(g, 1); } }
  return st; }
function nigState(t, L) { const g = G.nig, e = k => ev(L, k), st = { ...base(g, t, 'party1'), mood: 'neutral', turn: -0.25, look: -0.7 };
  const holdS = (dy = 260, k = 1.15, it = sandItem()) => { st.armL = reach(g, -1, -g.sw * k, g.ySh + dy, { planar: true }); st.items.L = it; };
  holdS();
  if (L === 'hook') { st.mood = 'surprised'; st.browUp = true;
    if (t > hev('raise_')) { const k = eOut(clamp((t - hev('raise_')) / 0.3)); st.headFirst = false; st.armL = reach(g, -1, lerp(-g.sw * 1.15, -g.sw * 1.35, k), lerp(g.ySh + 260, g.headY - g.ySh * 0 + 20, k), { planar: true }); st.items.L = sandItem(); st.mood = 'skeptical'; st.look = -0.9; }
    if (t > hev('sniff')) { const k = eOut(clamp((t - hev('sniff')) / 0.25)); st.headFirst = true; st.armL = reach(g, -1, lerp(-g.sw * 1.35, -g.hw * 0.75, k), lerp(g.headY + 20, g.headY + g.hh * 0.45, k), { planar: true }); st.items.L = sandItem(); st.mood = 'worried'; st.blink = 1; st.look = -0.3; }
    if (t > SP.hook.t + 0.2) { st.headFirst = false; holdS(250, 1.25); st.mood = 'worried'; st.blink = 0; st.look = -0.7; }
    if (t > hev('bf') - 0.1) { st.mood = 'skeptical'; holdS(120, 1.35); st.look = -0.4; st.lookY = -0.3; } }
  if (L === 'o1') { st.mood = 'surprised';
    if (speaking('o1_h', t, 0, 0.2)) { st.mood = 'worried'; st.blink = 0; }
    if (t > e('put')) { const k = eIO(clamp((t - e('put')) / (e('land') - e('put')))); const tx = BOARDX - X.nig - 10, ty = TOP - 90; st.armL = reach(g, -1, lerp(-g.sw * 1.15, tx, k), lerp(g.ySh + 260, ty, k), { planar: true }); st.mood = 'worried'; st.look = -1; st.lookY = 0.5; st.headY = 6;
      if (t > e('land')) { st.items.L = null; const k2 = eIO(clamp((t - e('land')) / 0.4)); st.armL = reach(g, -1, lerp(tx, CRISPX - X.nig, k2), lerp(ty, TOP - 90, k2), { planar: true }); } }
    if (t > e('crisp')) { const k = eOut(clamp((t - e('crisp')) / 0.35)); st.items.L = null; st.armL = reach(g, -1, lerp(CRISPX - X.nig, -g.hw * 0.7, k), lerp(TOP - 90, g.headY + g.hh * 0.6, k), { planar: true }); st.headFirst = k > 0.5; st.mood = 'happy'; st.squint = true; st.look = -0.5; st.lookY = 0;
      st.items.L = (ctx) => { ctx.fillStyle = '#F2C14E'; ctx.beginPath(); ctx.ellipse(0, -30, 24, 16, 0.4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#C98B2A'; ctx.lineWidth = 3; ctx.stroke(); };
      if (t > e('crunch')) { st.items.L = null; st.armL = down(g, -1); st.headFirst = false; st.mood = 'happy'; st.blink = 1; st.headY = Math.abs(Math.sin((t - e('crunch')) * 10)) * 6; } } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0, 0.1)) st.mood = t > SP.o2_h.t + 1.4 ? 'surprised' : 'neutral';
    if (t > SP.o2_p.t - 0.1) { st.mood = 'happy'; st.laugh = t < e('arm'); st.blink = st.laugh ? 1 : 0; st.armR = reach(g, 1, g.sw * 0.5, g.ySh + 300 + Math.sin(t * 16) * 10, { planar: true }); }
    if (t > e('arm')) { const k = eOut(clamp((t - e('arm')) / 0.3)); st.armL = down(g, -1); st.items.L = null; st.armR = reach(g, 1, lerp(g.sw * 0.5, g.sw * 1.85, k), lerp(g.ySh + 300, g.ySh + 60, k), { planar: true }); st.items.R = sandItem(); st.mood = 'worried'; st.laugh = false; st.blink = 0; st.look = 1; st.turn = 0.1; st.lookY = 0; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0, 0.1)) { st.mood = t > SP.o3_h.t + 2.2 ? 'happy' : 'surprised'; }
    if (t > e('bite') - 0.25) { const k = eOut(clamp((t - e('bite') + 0.25) / 0.25)); st.headFirst = true; st.armL = reach(g, -1, lerp(-g.sw * 1.15, -g.hw * 0.55, k), lerp(g.ySh + 260, g.headY + g.hh * 0.7, k), { planar: true }); st.items.L = sandItem(1.0, t > e('bite') + 0.1 ? 1 : 0, true); st.mood = 'happy'; st.blink = 1; }
    if (t > e('bite') + 0.55) { st.headFirst = false; holdS(330, 0.55, sandItem(1.0, 1, true)); st.mood = 'happy'; st.blink = 1; st.headY = Math.abs(Math.sin((t - e('bite')) * 9)) * 7 * (t < SP.o3_p.t ? 1 : 0); }
    if (t > e('wow')) { st.mood = 'happy'; st.laugh = true; st.blink = 0; st.squint = false; st.browUp = true; st.armR = open(g, 1, 1.6, 120 + Math.sin(t * 7) * 15); }
    if (t > endOf('o3_p') + 0.2) { st.mood = 'happy'; st.laugh = false; st.blink = 1; st.headY = Math.abs(Math.sin(t * 8)) * 6; st.armR = down(g, 1); } }
  if (L === 'o4') { st.mood = 'surprised'; st.look = -0.8;
    if (speaking('o4_h', t, 0, 0)) { const u = t - SP.o4_h.t; st.mood = u > 9.6 ? 'worried' : u > 4 ? 'surprised' : 'neutral'; }
    if (t > e('two') - 0.15) { const k = eOut(clamp((t - e('two') + 0.15) / 0.3)); st.mood = 'worried'; st.blink = 0; st.browUp = true; st.look = -0.3;
      st.armL = reach(g, -1, -g.sw * lerp(1.15, 1.25, k), g.ySh + lerp(260, 120, k), { planar: true }); st.armR = reach(g, 1, g.sw * lerp(0.9, 1.25, k), g.ySh + lerp(400, 120, k), { planar: true }); st.items.L = sandItem(); st.items.R = sandItem();
      const u = t - SP.o4_p.t; if (u > 1.2) { st.mood = 'happy'; st.squint = true; } } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.9; st.turn = 0.3; holdS(260, 1.15);
    if (t > e('clasp')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('react')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('landc') + 0.3) { st.mood = 'happy'; st.laugh = true; st.blink = 1; st.look = -0.9; st.turn = -0.3; } }
  return st; }
function granState(t, L) { const g = G.gran, e = k => ev(L, k), st = { ...base(g, t, 'gran4'), mood: 'happy', turn: -0.3, look: -0.8, squint: true };
  const bagO = L === 'end' ? eOut(clamp((t - e('clasp')) / 0.25)) : 0;
  st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 330, { planar: true }); st.items.L = bagItem(bagO);
  if (L === 'end') {
    if (t > e('pull')) { const k = eOut(clamp((t - e('pull')) / 0.4)); st.armR = reach(g, 1, lerp(-g.sw * 0.6, g.sw * 1.2, k), lerp(g.ySh + 380, g.ySh + 40, k), { planar: true }); st.items.R = bundleItem(t > SP.end_g.t - 0.1 ? 1 : 0, t > SP.end_g.t - 0.1 ? 0.85 : 0.6); st.mood = 'smug'; }
    if (speaking('end_g', t, 0.1, 0.1)) { st.mood = 'happy'; st.squint = true; st.tilt = 0.04; }
    if (t > e('react')) { st.mood = 'happy'; st.laugh = true; st.blink = 1; } }
  return st; }

// cat: on the dresser; in the twist it leaps to the table next to the board
const CAT0 = { x: CUPX, y: -CUPH - 30 }, CAT1 = { x: BOARDX - 175, y: TOP };
function catPose(t, L, nigHand) { let x = CAT0.x, y = CAT0.y, rot = 0, lick = 0, look = nigHand || { x: BOARDX, y: TOP };
  const lk = (a, d = 0.6) => t > a && t < a + d ? Math.sin(clamp((t - a) / d) * Math.PI) : 0;
  if (L === 'hook') lick = Math.max(lk(0.4, 0.8), lk(hev('cat'), 1.0));
  if (L === 'o1') lick = lk(ev('o1', 'land') - 0.2, 0.8);
  if (L === 'o3') lick = lk(ev('o3', 'bite'), 1.0);
  if (L === 'o4') lick = lk(SP.o4_p.t + 0.3, 1.0);
  if (L === 'end') { const a = ev('end', 'jump'), b = ev('end', 'landc');
    if (t > a) { const k = clamp((t - a) / (b - a)); x = lerp(CAT0.x, CAT1.x, k); y = lerp(CAT0.y, CAT1.y, k) - Math.sin(k * Math.PI) * 420; rot = Math.sin(k * Math.PI) * 0.5; look = { x: BOARDX, y: TOP }; }
    if (t > b) { const u = t - b; y = CAT1.y + (u < 0.25 ? Math.sin(u / 0.25 * Math.PI) * -20 : 0); rot = 0; lick = 0.6 + 0.4 * Math.sin(u * 6); } }
  return { x, y, rot, lick, look }; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'nig', 'gran'], cover: ['her', 'nig'], two: ['her', 'nig'], her: ['her'], nig: ['nig'], gran: ['gran'], salo: [], cat: [], endw: ['her', 'nig', 'gran'] };
function boardCount(t, L) { if (L === 'o1' && t > ev('o1', 'land')) return 4; if (L === 'o4' && t > SP.o4_h.t - 0.2) return -1; if (L === 'end' && t > ev('end', 'landc') + 1.2) return 2; return 3; }
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  dresser(c);
  armchair(c);
  tableBack(c);
  // Nigel's sandwich hand (world) for the cat's stare
  const nst = nigState(t, L), nh = L === 'end' || (L === 'o1' && t > ev('o1', 'land')) ? null : { x: X.nig - 300, y: -1150 };
  if (who.includes('gran')) { const st = granState(t, L); heads.gran4 = K.put(c, GRAN, st, X.gran, 0); }
  if (who.includes('her')) { const st = herState(t, L); heads.her = K.put(c, HER, st, X.her, 0); }
  table(c, t, L, boardCount(t, L));
  if (who.includes('nig')) { heads.party1 = K.put(c, NIG, nst, X.nig, 0);
    const hd = heads.party1;
    if (L === 'o2' && t > ev('o2', 'arm') + 0.2) sweat(c, hd.x - hd.hh * 0.85, hd.y - hd.hh * 0.4 + ((t - ev('o2', 'arm')) % 1.2) * 50, 1.2);
    if (L === 'o4' && t > SP.o4_h.t + 9.6) sweat(c, hd.x - hd.hh * 0.85, hd.y - hd.hh * 0.4 + ((t - SP.o4_h.t) % 1.2) * 50, 1.2);
    if (L === 'o3' && t > ev('o3', 'wow')) { const u = t - ev('o3', 'wow'), k = eBack(clamp(u / 0.3), 2); for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.55 + Math.sin(t * 2 + i) * 0.05; star(c, hd.x + Math.cos(an) * hd.hh * 2.0, hd.y + Math.sin(an) * hd.hh * 1.7, (22 + (i % 2) * 14) * k, 1, i % 2 ? '#F2C14E' : '#FFF6C8'); } } }
  const cp = catPose(t, L, nh);
  if (!(L === 'end' && t > ev('end', 'landc') + 1.2)) cat(c, t, cp.x, cp.y, { look: cp.look, lick: cp.lick, rot: cp.rot, s: 0.95 });
  else { cat(c, t, cp.x, cp.y, { look: { x: BOARDX, y: TOP - 300 }, lick: cp.lick, s: 0.95 }); c.save(); c.translate(cp.x + 70, cp.y - 120); c.rotate(-0.3); sandwich(c, 0.62, 1); c.restore(); }
  K.mark(c, 'cat', cp.x, cp.y - 200, 160);
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(40, fy(HY('nig'), 0.6, 960), 0.6, 'cover'), WIDE: S(20, fy(HY('nig'), 0.52, 820), 0.52, 'cover'), TWO: S(10, fy(HY('nig'), 0.7, 780), 0.7, 'two'), TWO_R: S(160, fy(HY('nig'), 0.68, 780), 0.68, 'two'),
  HER: S(X.her + 60, fy(HY('her'), 1.0, 900), 1.0, 'her'), HER_W: S(X.her + 170, fy(HY('her'), 0.8, 880), 0.8, 'her'), HER_LOW: S(X.her + 120, fy(HY('her'), 0.86, 1000), 0.86, 'her'), HER_CU: S(X.her + 30, fy(HY('her'), 1.3, 960), 1.3, 'her'),
  NIG: S(X.nig - 40, fy(HY('nig'), 0.9, 920), 0.9, 'nig'), NIG_CU: S(X.nig - 30, fy(HY('nig'), 1.2, 960), 1.2, 'nig'), NIG_W: S(X.nig + 60, fy(HY('nig'), 0.72, 900), 0.72, 'nig'), NIG_T: S(X.nig - 170, fy(HY('nig'), 0.8, 860), 0.8, 'nig'),
  SALO: S(BOARDX, TOP - 60, 2.1, 'salo'), CAT: S(CUPX + 30, CAT0.y - 230, 1.55, 'cat'),
  GRAN: S(X.gran - 40, fy(HY('gran'), 1.0, 940), 1.0, 'gran'), ENDW: S(200, fy(HY('nig'), 0.42, 760), 0.42, 'endw'), BUNDLE: U('bundle', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < 2.7) return SH.COVER; if (t < SP.hook.t - 0.02) return f(SH.NIG_CU); if (t < hev('salo') - 0.02) return f(SH.TWO); if (t < hev('bf') - 0.02) return f(SH.SALO); if (t < hev('cat') - 0.02) return f(SH.NIG); return f(SH.CAT); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_p.t - 0.1) return f(SH.HER); if (t < SP.o1_nar.t - 0.05) return f(SH.NIG_T); if (t < e('crunch') - 0.02) return f(SH.SALO); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_p.t - 0.1) return f(SH.HER); if (t < SP.o2_nar.t - 0.05) return f(SH.NIG_W); return f(SH.TWO_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o3_h') + 0.02) return f(SH.HER_W); if (t < SP.o3_nar.t - 0.05) return f(SH.NIG); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('c3') - 0.02) return f(SH.HER_LOW); if (t < e('c4') - 0.02) return f(SH.HER); if (t < SP.o4_p.t - 0.1) return f(SH.HER_CU); return f(SH.NIG_CU); }
  if (L === 'end') { if (t < e('insert') - 0.02) return f(SH.GRAN); if (t < SP.end_g.t - 0.1) return f(SH.BUNDLE); if (t < e('react') - 0.02) return f(SH.GRAN); return f(SH.ENDW); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- insert: the paper bundle opening on a solid backdrop
function bundleView(c, t) { const a = ev('end', 'insert'), u = t - a; c.fillStyle = '#5A3A5A'; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'bundle' });
  c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 12; k++) c.fillRect(0, k * 180, W, 70);
  const k = eBack(clamp(u / 0.3), 1.8), op = eOut(clamp((u - 0.35) / 0.5)); c.save(); c.translate(540, 900); c.scale(2.2 * k, 2.2 * k); c.rotate(-0.03 + 0.02 * Math.sin(t * 3)); bundle(c, op, 1); c.restore();
  if (op > 0.6) { const s = eBack(clamp((u - 0.75) / 0.3), 2); star(c, 250, 620, 40 * s); star(c, 860, 1180, 30 * s, 0.9); star(c, 800, 560, 24 * s, 0.8); } }

// ---------------- overlays: title, comment plate, option plates
function title(c, t) { const a = 1 - P(t, hev('title_out') - 0.25, hev('title_out')); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 132, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 330, k: a, id: 'title' }); }
function commentPlate(c, t) { const a = hev('plate'), k = eBack(P(t, a, a + 0.3), 1.8) * (1 - P(t, SC.hook.e - 0.25, SC.hook.e - 0.05)); if (k <= 0) return;
  c.save(); c.translate(540, 350); c.rotate(-0.025); c.scale(k, k);
  c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, -450 + 8, -150 + 12, 900, 300, 34); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -450, -150, 900, 300, 34); c.fill();
  c.fillStyle = '#EE5E9A'; c.beginPath(); c.moveTo(-340, 145); c.lineTo(-300, 193); c.lineTo(-280, 145); c.fill();
  c.fillStyle = '#EE5E9A'; rr(c, -450, -150, 900, 70, [34, 34, 0, 0]); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -410, -133, 46, 34, 10); c.fill(); c.beginPath(); c.moveTo(-402, -103); c.lineTo(-406, -87); c.lineTo(-386, -101); c.fill();
  fitTxt(c, 'Вопрос из комментариев:', -345, -115, 36, '#FFFFFF', 700, 'Nun9', 'left');
  fitTxt(c, 'Девочки, я на вечеринке в Лондоне,', 0, -30, 44, '#1E2030', 840, 'Unb9'); fitTxt(c, 'принесла сало — а как его', 0, 30, 44, '#1E2030', 840, 'Unb9'); fitTxt(c, 'вообще назвать?!', 0, 90, 44, '#1E2030', 840, 'Unb9');
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x: 90, y: 200, w: 900, h: 300, k, id: 'comment' }); }
const PLATES = { o1: ['1', 'ХОЛОДНО', '#E0474C'], o2: ['2', 'С ЮМОРОМ', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD8'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  c.save(); UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, s = k * Math.min(lerp(1, 1.4, big), 900 / w), y = 215;
  c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w * s / 2, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: «КАКОЙ ОТВЕТ ТВОЙ?» -> (ask) «САЛО С ЧЕСНОКОМ ИЛИ БЕЗ?», 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor (all inside x 60–940)
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, wt = (w, d) => K.wordT('outro', w) ?? (sp.t + d), CX = 500;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Nigel (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34; 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gn = G.nig;
    K.put(c, NIG, { t, mood: 'happy', laugh: true, squint: true, turn: -0.2, look: -0.5, armL: reach(gn, -1, -gn.sw * 1.2, gn.ySh + 150, { planar: true }), armR: reach(gn, 1, gn.sw * 1.2, gn.ySh + 150 + Math.sin(t * 7) * 15, { planar: true }), items: { L: sandItem(), R: sandItem() } }, 640, 60);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.3, armL: open(g, -1, 1.6, 100 + Math.sin(t * 8) * 20), armR: reach(g, 1, g.sw * 1.5, g.ySh + 100, { planar: true }), items: { R: boardItem(2) } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.15, 0.5), 2.2), at = SP.ask.t - 0.05, sw = P(t, at - 0.12, at), aq = eBack(P(t, at, at + 0.3), 2.2);
  if (q > 0 && t < at) { c.save(); c.translate(CX, 290); c.scale(q * (1 - sw), q * (1 - sw)); UI.font(c, 'Unb9', 76); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.strokeText(c, 'КАКОЙ ОТВЕТ', 0, -48, C.oliveD, C.white, 14); UI.strokeText(c, 'ТВОЙ?', 0, 48, C.pink, C.white, 14); c.restore(); }
  if (aq > 0) { c.save(); c.translate(CX, 290); c.rotate(-0.03); c.scale(aq, aq); UI.textFit(c, 'Unb9', 82, 'С ЧЕСНОКОМ', 840); UI.strokeText(c, 'САЛО', 0, -100, C.oliveD, C.white, 14); UI.strokeText(c, 'С ЧЕСНОКОМ', 0, 0, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 82, 'ИЛИ БЕЗ?', 840); UI.strokeText(c, 'ИЛИ БЕЗ?', 0, 100, C.oliveD, C.white, 14);
    garlicClove(c, 395, -95, 1.0 + 0.05 * Math.sin(t * 6)); c.restore(); }
  const rows = [['1', 'ХОЛОДНО', 'Fat. Pig. Eat.', '#E0474C', 'один'], ['2', 'С ЮМОРОМ', 'Bacon that never went to the gym.', '#F2B33D', 'два'], ['3', 'КАК НОСИТЕЛЬ', "It's salo — cured pork fat.", '#4CAF6A', 'три'], ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', 'Show some respect — take two.', '#8E5BD8', 'четыре']];
  const y0 = aq > 0 ? lerp(520, 560, aq) : 520;
  rows.forEach(([n, ru, en, col, w], i) => { const a = wt(w, 1.3 + i * 0.35) - 0.1, k = eBack(P(t, a, a + 0.28), 2.0); if (k <= 0) return; const y = y0 + i * 160;
    c.save(); c.translate(CX, y); c.scale(k, k); c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, -420 + 8, -66 + 12, 840, 132, 36); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -420, -66, 840, 132, 36); c.fill(); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(-340, 0, 50, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); fitTxt(c, n, -340, 4, 70, C.white, 70);
    fitTxt(c, ru, -265, -24, 40, C.oliveD, 650, 'Unb9', 'left'); fitTxt(c, en, -265, 28, 34, C.pinkD, 650, 'Nun9', 'left'); c.restore(); });
  const bt = wt('пиши', 3.55) - 0.2, bk = eBack(P(t, bt, bt + 0.35), 2.2), by = y0 + 665;
  if (bk > 0) { c.save(); c.translate(CX, by); c.scale(bk, bk); c.fillStyle = C.gold; rr(c, -420, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-370, -30); c.lineTo(-330, -30); c.lineTo(-330, 32); c.lineTo(-350, 16); c.lineTo(-370, 32); c.closePath(); c.fill(); fitTxt(c, 'СОХРАНИ', -200, 4, 40, C.oliveD, 250);
    const subT = bt + 0.6, click = P(t, subT + 0.55, subT + 0.7), pressed = t > subT + 0.65, ss = 1 - 0.08 * Math.sin(click * Math.PI);
    c.save(); c.translate(220, 0); c.scale(ss, ss); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -200, -55, 400, 110, 55); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 6; c.stroke(); fitTxt(c, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4, 40, C.white, 340); c.restore(); c.restore();
    const mv = eIO(P(t, subT, subT + 0.55)); UI.tapCursor(c, lerp(930, CX + 260, mv), lerp(by + 330, by + 10, mv), 1, P(t, subT + 0.6, subT + 1.1)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads = {}, proj;
  if (tag.startsWith('ui:')) { bundleView(c, t); proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  // bubbles only for characters drawn in this shot (an off-screen speaker never gets a bubble over another shot)
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, hold: { hook_p: -0.2, o1_h: -0.22, o1_p: -0.2, o2_h: -0.22, o2_p: -0.2, o3_h: -0.22, o3_p: -0.2, o4_h: -0.15, o4_p: -0.1, end_g: -0.15 } });
  if (L === 'hook') { title(c, t); commentPlate(c, t); }
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('salo2', NF, renderFrame);
