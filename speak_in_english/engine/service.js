// "Service charge 15%" (rubric «A1 vs C2», compact form) renderer, hard_cut camera: node service.js start end out.mp4 | --png=f1,f2
// Candle-lit restaurant (halves room, "THE CROWN"): her seated left at a table for one with a FROZEN tomato soup (frost, the spoon
// stuck upright), the posh waiter (Daniel's voice) standing right in a black waistcoat + bow tie. The bill in a leather folder is the
// running prop: £60.00 + SERVICE 15% £9.00 = £69.00 on the BILL close-up (hook), struck through to £60.00 in C1.
// Gags: A1 she lifts the whole frozen soup out of the bowl on her spoon; A2 he hugs the bill; B1 the deep breath; B2 he checks his
// wristwatch (WATCH close-up: evening); C2 silent beat, then he whips out a dessert with a burning sparkler.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/service/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C, LVCOL } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf, wordT } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const INTRO = 0.45;

// ---------------- cast
const HER = { ...BASE.her_lift, necklace: true, top: { type: 'sweater', col: '#2E7D7A' }, bottom: { type: 'skirt', col: '#2E7D7A' }, shoes: { col: '#2B1A22', acc: null } };
const WTR = { kind: 'human', h: 1680, seed: 47, skin: '#F0C8A8', iris: '#3A4A5A', jaw: 1.15,
  hair: { style: 'short', col: '#1E1A18' }, mustache: '#1E1A18', brow: '#1E1A18', browW: 11, watch: '#D4AF37',
  build: { shoulder: 0.98 }, top: { type: 'longsleeve', col: '#FFFFFF' }, bottom: { type: 'trousers', col: '#1E1E24' }, shoes: { col: '#111111', acc: null } };
const SEAT = 330, TOP = -500;
const HX = -300, WX = 360;
const G = { her: geom(HER), waiter2: geom(WTR) };
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }
function waistcoat(cc, g) { const sw = g.sw, y0 = g.ySh;
  paint(cc, q => { q.m(-sw * 0.92, y0 + 14); q.l(-sw * 0.3, y0 + 14); q.l(0, y0 + 260); q.l(sw * 0.3, y0 + 14); q.l(sw * 0.92, y0 + 14); q.l(sw * 0.84, y0 + 600); q.l(-sw * 0.84, y0 + 600); q.z(); }, '#1E1E24', { sd: 10, hd: 4, lw: 4 });
  cc.fillStyle = '#C9A13A'; for (const y of [y0 + 320, y0 + 410, y0 + 500]) { cc.beginPath(); cc.arc(0, y, 9, 0, TAU); cc.fill(); }
  cc.fillStyle = '#FFFFFF'; rr(cc, sw * 0.38, y0 + 120, 70, 16, 4); cc.fill();
  cc.fillStyle = '#1E1E24'; cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(-62, y0 - 26); cc.lineTo(-62, y0 + 36); cc.closePath(); cc.fill(); cc.beginPath(); cc.moveTo(0, y0 + 4); cc.lineTo(62, y0 - 26); cc.lineTo(62, y0 + 36); cc.closePath(); cc.fill();
  cc.beginPath(); cc.arc(0, y0 + 4, 14, 0, TAU); cc.fill(); }

// ---------------- props (local coords: (0,0) = bottom centre unless noted)
function snowflake(c, x, y, r, rot = 0, col = '#FFFFFF') { c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.lineWidth = Math.max(2, r * 0.16); c.lineCap = 'round';
  for (let k = 0; k < 6; k++) { c.rotate(TAU / 6); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -r); c.moveTo(0, -r * 0.55); c.lineTo(-r * 0.25, -r * 0.8); c.moveTo(0, -r * 0.55); c.lineTo(r * 0.25, -r * 0.8); c.stroke(); } c.restore(); }
function plateDraw(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 6, 160, 30, 0, 0, TAU); c.fill(); c.fillStyle = '#F4F6FA'; c.beginPath(); c.ellipse(0, 0, 150, 28, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke(); c.beginPath(); c.ellipse(0, -2, 96, 16, 0, 0, TAU); c.stroke(); c.restore(); }
// soup bowl; frozen soup surface with frost, an ice cube and (spoon = true) the spoon frozen in upright
const SOUP = '#E0794E', SOUPI = '#F2B49A';
function frozenTop(c, rx, ry) { c.fillStyle = SOUP; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.clip(); c.fillStyle = 'rgba(235,248,255,.55)'; c.beginPath(); c.ellipse(-rx * 0.2, -ry * 0.15, rx * 0.75, ry * 0.6, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { const a = hash(k * 5.3) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * rx * 0.2, Math.sin(a) * ry * 0.2); c.lineTo(Math.cos(a) * rx * 0.85, Math.sin(a) * ry * 0.85); c.stroke(); } c.restore();
  c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.stroke(); }
function spoonDraw(c, len = 190) { c.fillStyle = '#C9CED6'; c.strokeStyle = '#8A919C'; c.lineWidth = 3; rr(c, -7, -len, 14, len, 6); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, -len - 4, 12, 18, 0, 0, TAU); c.fill(); c.stroke(); }
function bowlDraw(c, s = 1, o = {}) { c.save(); c.scale(s, s);
  plateDraw(c, 1.05);
  paint(c, q => { q.m(-125, -78); q.l(125, -78); q.q(118, -6, 0, -4); q.q(-118, -6, -125, -78); q.z(); }, '#FFFFFF', { sd: 6, hd: 3, lw: 4 });   // bowl
  c.fillStyle = '#5FA8C8'; c.fillRect(-120, -64, 240, 8);
  c.save(); c.translate(0, -78); if (o.empty) { c.fillStyle = '#E9ECF0'; c.beginPath(); c.ellipse(0, 0, 122, 22, 0, 0, TAU); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke(); }
  else { frozenTop(c, 122, 22); paint(c, q => { q.m(30, -6); q.l(70, -14); q.l(78, 8); q.l(38, 14); q.z(); }, 'rgba(210,240,255,.95)', { sd: 0, hd: 0, lw: 3 }); }   // ice cube
  c.restore();
  // icicles under the rim + frost sparkles
  c.fillStyle = 'rgba(220,244,255,.95)'; for (const x of [-100, -60, -16, 40, 92]) { c.beginPath(); c.moveTo(x - 9, -78); c.lineTo(x + 9, -78); c.lineTo(x, -78 + 22 + (Math.abs(x) % 3) * 8); c.fill(); }
  if (o.spoon && !o.empty) { c.save(); c.translate(-30, -84); c.rotate(-0.12); spoonDraw(c, 200); c.restore(); }
  if (!o.noFlakes) { snowflake(c, -150, -150, 16, 0.3); snowflake(c, 150, -130, 13, 0.1); }
  c.restore(); }
// the frozen soup "puck" hanging under the spoon (hand-local: the hand holds the top of the spoon)
function frozenOnSpoon(c) { c.save(); c.rotate(0.06); c.save(); c.scale(1, -1); spoonDraw(c, 150); c.restore();
  c.translate(0, 170); c.fillStyle = SOUP; rr(c, -118, -10, 236, 44, 18); c.fill(); c.fillStyle = '#C45E37'; rr(c, -118, 16, 236, 18, 9); c.fill();
  frozenTop(c, 120, 22);
  c.fillStyle = 'rgba(220,244,255,.95)'; for (const x of [-90, -40, 20, 80]) { c.beginPath(); c.moveTo(x - 8, 32); c.lineTo(x + 8, 32); c.lineTo(x, 60 + (Math.abs(x) % 4) * 6); c.fill(); }
  c.restore(); }
// leather bill folder: open = receipt facing up/out (held), closed (on the table); local (0,0) = centre
function folderOpen(c, s = 1, rot = -0.1) { c.save(); c.rotate(rot); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -108, -132, 228, 270, 12); c.fill(); c.fillStyle = '#4A2A1A'; rr(c, -116, -140, 232, 270, 12); c.fill(); c.strokeStyle = '#2E180E'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#FFFFFF'; rr(c, -84, -120, 168, 226, 6); c.fill(); c.fillStyle = 'rgba(60,60,70,.45)'; for (let y = -96; y < 40; y += 24) c.fillRect(-64, y, 70 + ((y / 24) % 3) * 14, 7);
  c.fillStyle = '#E0474C'; c.fillRect(-64, 62, 128, 12); c.fillStyle = '#2B2F3A'; c.fillRect(-64, 84, 128, 9); c.restore(); }
function folderClosed(c, s = 1) { c.save(); c.scale(s, s); paint(c, q => { q.m(-120, 0); q.l(120, 0); q.l(104, -40); q.l(-104, -40); q.z(); }, '#4A2A1A', { sd: 5, hd: 2, lw: 4 });
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-70, -40); c.lineTo(70, -40); c.lineTo(66, -52); c.lineTo(-66, -52); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-60, -24, 120, 5); c.restore(); }
function dessertDraw(c, s = 1) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-70, -120); q.l(70, -120); q.q(60, -60, 12, -50); q.l(12, -14); q.l(50, 0); q.l(-50, 0); q.l(-12, -14); q.l(-12, -50); q.q(-60, -60, -70, -120); q.z(); }, 'rgba(225,240,250,.9)', { sd: 4, hd: 2, lw: 4 });
  for (const [x, y, r, col] of [[-36, -138, 40, '#F7B6CF'], [34, -140, 40, '#FFF4D6'], [0, -176, 42, '#8A5A3A']]) { paint(c, q => q.e(x, y, r, r * 0.9), col, { sd: 3, hd: 2, lw: 3 }); }
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, -214, 30, 16, 0, 0, TAU); c.fill();
  paint(c, q => q.e(4, -236, 16, 16), '#D61E3A', { sd: 2, hd: 1, lw: 3 });
  c.restore(); }
// dessert with a burning sparkler (sparks drawn with paths)
function sparklerDessert(c, t, s = 1) { c.save(); c.scale(s, s); dessertDraw(c, 1);
  c.strokeStyle = '#7A7F88'; c.lineWidth = 6; c.beginPath(); c.moveTo(-14, -224); c.lineTo(-34, -400); c.stroke();
  const tx = -34, ty = -400, gl = c.createRadialGradient(tx, ty, 4, tx, ty, 120); gl.addColorStop(0, 'rgba(255,240,170,.9)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gl; c.fillRect(tx - 120, ty - 120, 240, 240);
  const fr = Math.floor(t * 30); c.lineCap = 'round';
  for (let i = 0; i < 18; i++) { const a = hash(i * 7.1 + fr * 1.37) * TAU, r0 = 10 + hash(i + fr * 0.7) * 20, r1 = r0 + 50 + hash(i * 3 + fr) * 110; c.strokeStyle = i % 3 ? '#FFE07A' : '#FFFFFF'; c.lineWidth = 5 + (i % 2) * 3;
    c.beginPath(); c.moveTo(tx + Math.cos(a) * r0, ty + Math.sin(a) * r0); c.lineTo(tx + Math.cos(a) * r1, ty + Math.sin(a) * r1); c.stroke(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(tx, ty, 9, 0, TAU); c.fill(); c.restore(); }
function candle(c, x, y, t) { c.fillStyle = '#C9A13A'; rr(c, x - 34, y - 14, 68, 16, 6); c.fill(); c.fillStyle = '#F7F2E8'; c.fillRect(x - 14, y - 150, 28, 138); const f = 1 + 0.12 * Math.sin(t * 17 + x);
  const gl = c.createRadialGradient(x, y - 170, 4, x, y - 170, 170); gl.addColorStop(0, 'rgba(255,210,120,.55)'); gl.addColorStop(1, 'rgba(255,210,120,0)'); c.fillStyle = gl; c.fillRect(x - 170, y - 340, 340, 340);
  paint(c, q => { q.m(x, y - 200 * f); q.q(x + 18, y - 166, x, y - 152); q.q(x - 18, y - 166, x, y - 200 * f); q.z(); }, '#F2A03B', { sd: 0, hd: 0, lw: 2 }); c.fillStyle = '#FFE7A0'; c.beginPath(); c.ellipse(x, y - 164, 6, 10, 0, 0, TAU); c.fill(); }
function coin(c, x, y, r, t) { const sx = Math.abs(Math.cos(t * 6 + x)); c.save(); c.translate(x, y); c.scale(Math.max(0.15, sx), 1); c.fillStyle = '#F2C14E'; c.strokeStyle = '#B8862A'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.arc(0, 0, r * 0.62, 0, TAU); c.stroke(); c.restore(); }
function sweat(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(0, -34); q.q(22, 0, 14, 14); q.q(0, 28, -14, 14); q.q(-22, 0, 0, -34); q.z(); }, '#8FD3F4', { sd: 0, hd: 0, lw: 3 }); c.restore(); }

// ---------------- full-screen inserts (solid backdrop). Key content sits between y 790 and 1410 (lesson card above, captions below)
function backdrop(c, a, b, id) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id }); }
const popK = t => eBack(clamp((t - CAM_AT(t)) / 0.25), 1.6);
// SOUP close-up (hook): frozen tomato soup, the spoon frozen upright with a cobweb (forty minutes!), snowflakes falling
function soupView(c, t) { backdrop(c, '#1E3A52', '#0E1E2E', 'soup'); const k = popK(t);
  c.save(); c.translate(540, 1300); c.scale(lerp(0.9, 1, k) * 3.0, lerp(0.9, 1, k) * 3.0);
  bowlDraw(c, 1, { spoon: false, noFlakes: true });
  c.save(); c.translate(-30, -84); c.rotate(-0.12); spoonDraw(c, 170); c.restore();
  // cobweb between the spoon and the bowl rim
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.2; const ax = -52, ay = -240, pts = [[-122, -80], [-110, -150], [-90, -205]];
  for (const [x, y] of pts) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(x, y); c.stroke(); }
  for (const f of [0.35, 0.6, 0.85]) { c.beginPath(); pts.forEach(([x, y], i) => { const px = lerp(ax, x, f), py = lerp(ay, y, f); i ? c.quadraticCurveTo(px + 6, py - 4, px, py) : c.moveTo(px, py); }); c.stroke(); }
  const sy = -150 + 10 * Math.sin(t * 2.4); c.beginPath(); c.moveTo(-74, -205); c.lineTo(-74, sy); c.stroke(); c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(-74, sy + 5, 5, 0, TAU); c.fill();   // tiny spider
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 1.2; for (const s of [-1, 1]) for (let k2 = 0; k2 < 3; k2++) { c.beginPath(); c.moveTo(-74, sy + 5); c.lineTo(-74 + s * 9, sy + k2 * 4); c.stroke(); }
  c.restore();
  for (let i = 0; i < 14; i++) { const x = 80 + hash(i * 3.7) * 920, y = 760 + ((hash(i * 1.3) * 700 + t * (50 + hash(i) * 40)) % 700); snowflake(c, x, y, 10 + hash(i * 9) * 16, t * 0.8 + i, 'rgba(255,255,255,.85)'); } }
// BILL close-up: the receipt in the open leather folder. hook: SERVICE 15% highlighted + circled; C1: struck through, total £60.00
const STRIKE = ev('C1', 'strike');
function billView(c, t) { backdrop(c, '#3A1620', '#1E0B12', 'bill'); const k0 = popK(t);
  c.save(); c.translate(540, 1100); c.rotate(-0.02); c.scale(lerp(0.9, 1, k0), lerp(0.9, 1, k0)); c.translate(-540, -1100);
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, 205, 785, 690, 650, 30); c.fill(); c.fillStyle = '#4A2A1A'; rr(c, 190, 770, 700, 650, 30); c.fill(); c.strokeStyle = '#2E180E'; c.lineWidth = 6; c.stroke();
  c.strokeStyle = '#C9A13A'; c.lineWidth = 3; rr(c, 210, 790, 660, 610, 22); c.stroke();
  const px = 250, pw = 580, py = 800; c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + pw, py); c.lineTo(px + pw, 1392); for (let i = 0; i <= 20; i++) c.lineTo(px + pw - i * pw / 20, 1392 + (i % 2 ? 12 : 0)); c.closePath(); c.fill();
  fitTxt(c, 'THE CROWN', 540, 850, 54, '#2E1219', 500); fitTxt(c, 'TABLE 4  ·  1 GUEST', 540, 896, 26, '#7A6E68', 500, 'Nun9');
  const dash = y => { c.strokeStyle = '#9A928C'; c.lineWidth = 3; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(px + 30, y); c.lineTo(px + pw - 30, y); c.stroke(); c.setLineDash([]); };
  const row = (name, price, y, sz = 42, col = '#2B2F3A', font = 'Nun9') => { UI.textFit(c, font, sz, name, 330); c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(name, px + 40, y); c.textAlign = 'right'; c.fillText(price, px + pw - 40, y); };
  dash(925); row('TOMATO SOUP', '£12.00', 968); row('STEAK', '£38.00', 1024); row('WINE', '£10.00', 1080); dash(1116);
  row('SUBTOTAL', '£60.00', 1156, 36, '#7A6E68');
  const sy = 1214, struck = t >= STRIKE, sk = struck ? eOut(clamp((t - STRIKE - 0.2) / 0.45)) : 0;
  if (!struck) { const hi = 0.7 + 0.15 * Math.sin(t * 9); c.save(); c.globalAlpha = hi; c.fillStyle = '#FFE15A'; rr(c, px + 18, sy - 32, pw - 36, 64, 12); c.fill(); c.restore(); }
  row('SERVICE 15%', '£9.00', sy, 44, struck ? '#9A928C' : '#C8102E', 'Unb9');
  if (!struck) { const ck = eOut(clamp((t - hev('bill') - 0.35) / 0.45)); if (ck > 0) { c.strokeStyle = '#C8102E'; c.lineWidth = 7; c.beginPath(); c.ellipse(540, sy, pw / 2 - 4, 46, -0.03, -1.2, -1.2 + TAU * ck); c.stroke(); } }
  if (sk > 0) { c.strokeStyle = '#C8102E'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(px + 26, sy + 2); c.lineTo(px + 26 + (pw - 52) * sk, sy - 2); c.stroke(); }
  dash(1262);
  const tk = struck ? eOut(clamp((t - STRIKE - 0.75) / 0.3)) : 0;
  c.save(); UI.font(c, 'Unb9', 42); c.fillStyle = '#2B2F3A'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('TOTAL', px + 40, 1318); const lw0 = c.measureText('TOTAL').width; const slide = struck ? eIO(clamp((t - STRIKE - 0.6) / 0.25)) : 0, rx0 = px + pw - 40, rx = lerp(rx0, px + 40 + lw0 + 170, slide);   // C1: the old total slides left, is struck, the new one is written on the right
  if (slide > 0) UI.font(c, 'Unb9', lerp(42, 32, slide)); c.textAlign = 'right'; c.fillStyle = tk > 0 ? '#9A928C' : '#2B2F3A'; c.fillText('£69.00', rx, 1318); const tw = c.measureText('£69.00').width; c.restore();
  if (tk > 0) { c.strokeStyle = '#C8102E'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(rx - 6 - tw, 1320); c.lineTo(rx - 6 - tw + (tw + 12) * tk, 1316); c.stroke(); }
  const nk = struck ? eBack(clamp((t - STRIKE - 1.05) / 0.3), 2.4) : 0;
  if (nk > 0) { c.save(); c.translate(742, 1312); c.rotate(-0.08); c.scale(nk, nk); UI.font(c, 'Cav7', 50); c.fillStyle = '#C8102E'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£60.00', 0, 0); c.restore(); }
  if (struck && sk < 1) { const pxx = px + 26 + (pw - 52) * sk; c.save(); c.translate(pxx, sy + 4); c.rotate(0.55); c.fillStyle = '#2B2F3A'; rr(c, -9, -170, 18, 170, 6); c.fill(); c.fillStyle = '#C9A13A'; c.fillRect(-9, -150, 18, 14); c.fillStyle = '#C8C8C8'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.lineTo(0, 22); c.fill(); c.restore(); }
  c.restore(); }
// WATCH close-up (B2 narrator "он посмотрел на часы"): his wrist in the white cuff, the gold watch shows evening (moon on the dial)
function watchView(c, t) { backdrop(c, '#2A1A3A', '#120A1C', 'watch'); const k = popK(t);
  c.save(); c.translate(540, 1100); c.scale(lerp(0.9, 1, k), lerp(0.9, 1, k)); c.rotate(-0.12);
  c.fillStyle = '#FFFFFF'; rr(c, -900, -150, 520, 300, 30); c.fill(); c.strokeStyle = '#C9D0DA'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#E9ECF0'; c.fillRect(-420, -150, 40, 300);   // shirt cuff
  c.fillStyle = '#F0C8A8'; rr(c, -390, -120, 760, 240, 110); c.fill();   // wrist + hand
  c.fillStyle = '#E2B694'; c.beginPath(); c.ellipse(330, 0, 130, 120, 0, 0, TAU); c.fill();
  c.fillStyle = '#8A6A22'; rr(c, -110, -150, 220, 300, 30); c.fill();   // strap
  c.fillStyle = '#D4AF37'; c.beginPath(); c.arc(0, 0, 220, 0, TAU); c.fill(); c.strokeStyle = '#9A7A1E'; c.lineWidth = 8; c.stroke(); c.fillStyle = '#B8902A'; rr(c, 214, -24, 34, 48, 8); c.fill();
  c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(0, 0, 184, 0, TAU); c.fill();
  c.strokeStyle = '#2B2F3A'; c.lineCap = 'round'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = i % 3 ? 160 : 140; c.lineWidth = i % 3 ? 5 : 10; c.beginPath(); c.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); c.lineTo(Math.sin(a) * 174, -Math.cos(a) * 174); c.stroke(); }
  c.save(); c.translate(0, -80); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(0, 0, 36, 0, TAU); c.fill(); c.fillStyle = '#FFFDF6'; c.beginPath(); c.arc(16, -10, 32, 0, TAU); c.fill(); c.restore();   // crescent moon
  for (const [x, y] of [[-60, -110], [60, -60], [-34, -40]]) { c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  fitTxt(c, 'PM', 0, 84, 40, '#7A6E68', 120, 'Unb9');
  const hand = (a, len, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a) * len, -Math.cos(a) * len); c.stroke(); };
  hand((9 + 40 / 60) / 12 * TAU, 100, 14, '#2B2F3A'); hand(40 / 60 * TAU, 150, 9, '#2B2F3A'); hand(Math.floor(t) / 60 * TAU * 6, 160, 3, '#C8102E');
  c.fillStyle = '#2B2F3A'; c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
  c.restore(); }

// ---------------- restaurant (prerendered, softly blurred) — the halves room, renamed
const BX0 = -2400, BY0 = -3800, BW = 4800, BH = 5200, BS = 0.5;
function drawRest(c) {
  c.fillStyle = '#4A1E2A'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,200,150,.06)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, BY0, 80, 3600);
  c.fillStyle = '#2E1219'; c.fillRect(BX0, -1450, BW, 1250); c.fillStyle = '#C9A06A'; c.fillRect(BX0, -1470, BW, 22);
  for (let x = BX0 + 60; x < BX0 + BW; x += 300) { c.fillStyle = 'rgba(255,255,255,.04)'; rr(c, x, -1400, 240, 1100, 12); c.fill(); }
  for (const [x, w] of [[-1700, 620], [1050, 620]]) { c.fillStyle = '#C9A06A'; c.fillRect(x - 16, -2600, w + 32, 1000); c.fillStyle = '#1B2444'; c.fillRect(x, -2584, w, 968);
    c.fillStyle = 'rgba(255,240,200,.9)'; for (let i = 0; i < 24; i++) { c.beginPath(); c.arc(x + 20 + hash(i * 7 + x) * (w - 40), -2560 + hash(i * 3 + x) * 560, 3 + hash(i) * 3, 0, TAU); c.fill(); }
    c.fillStyle = '#2B3352'; for (let i = 0; i < 6; i++) { const bw = w / 6, bh = 160 + hash(i + x) * 380; c.fillRect(x + i * bw, -1616 - bh, bw - 8, bh); } c.fillStyle = '#C9A06A'; c.fillRect(x + w / 2 - 8, -2584, 16, 968); }
    for (let i = 0; i < 26; i++) { const x = BX0 + 100 + i * 180, y = -2350 + Math.sin(i * 0.9) * 60; const g = c.createRadialGradient(x, y, 2, x, y, 60); g.addColorStop(0, 'rgba(255,220,140,.9)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 60, y - 60, 120, 120); }
  for (const [x, s] of [[-1700, 1], [1750, 1.1]]) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, -700, 300 * s, 110, 0, 0, TAU); c.fill(); c.fillRect(x - 12, -700, 24, 450); c.fillStyle = 'rgba(255,200,110,.5)'; c.beginPath(); c.arc(x, -770, 40, 0, TAU); c.fill(); }
  c.fillStyle = '#4A7A4A'; for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(-2150 + i * 40, -1000 - i * 70, 70, 190, -0.6 + i * 0.2, 0, TAU); c.fill(); } c.fillStyle = '#8A5A3A'; rr(c, -2220, -420, 260, 230, 20); c.fill();
  c.fillStyle = '#5A3428'; c.fillRect(BX0, -200, BW, 1600); c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = BX0; x < BX0 + BW; x += 240) c.fillRect(x, -200, 8, 1600);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRest);
function chair(c, x) { c.fillStyle = '#3A1A12'; rr(c, x - 160, -1080, 320, 600, 50); c.fill(); c.fillStyle = '#8A2F3A'; rr(c, x - 130, -1050, 260, 540, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, x - 110, -1030, 90, 500, 30); c.fill(); }

// ---------------- prop state over time
const LIFT = ev('A1', 'lift'), HUG = ev('A2', 'hug'), BREATH = ev('B1', 'breath'), WATCH = ev('B2', 'watch'), DES = ev('C2', 'dessert');
const FOLD_X = -10, HOOK_PUT = 3.85;
const lifting = (t, L) => L === 'A1' && t >= LIFT;
const hugging = (t, L) => L === 'A2' && t >= HUG;
const dessertOnTable = (t, L) => (L === 'C2' && t >= SP.c2_nar.t - 0.1) || L === 'outro';   // moves to the table exactly on the cut to the card shot
function tableFront(c, t, L) {
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-780, -20, 1560, 40);
  paint(c, q => { q.m(-720, TOP); q.l(720, TOP); q.l(750, -10); q.l(-750, -10); q.z(); }, '#FFFDF8', { sd: 6, hd: 3, lw: 4, inner: k => { k.strokeStyle = 'rgba(150,120,110,.22)'; k.lineWidth = 4; for (let x = -680; x < 720; x += 70) { k.beginPath(); k.moveTo(x, TOP + 30); k.quadraticCurveTo(x + 10, TOP + 260, x + 4, -20); k.stroke(); } } });
  c.fillStyle = '#2E7D7A'; c.fillRect(-90, TOP, 180, 420); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-90, TOP + 380, 180, 40);
  paint(c, q => { q.m(-760, TOP - 40); q.l(760, TOP - 40); q.l(730, TOP + 12); q.l(-730, TOP + 12); q.z(); }, '#F4EAD8', { sd: 4, hd: 2, lw: 4 });
  candle(c, 250, TOP - 26, t);
  c.save(); c.translate(HX + 10, TOP - 30); bowlDraw(c, 0.95, { spoon: true, empty: lifting(t, L) }); c.restore();   // the frozen soup
  if (!(L === 'hook' && t < HOOK_PUT) && !hugging(t, L)) { c.save(); c.translate(FOLD_X, TOP - 10); folderClosed(c, 0.95); c.restore(); }
  if (dessertOnTable(t, L)) { c.save(); c.translate(HX + 250, TOP - 24); plateDraw(c, 0.5); sparklerDessert(c, t, 0.7); c.restore(); }
  K.mark(c, 'soup', HX + 10, TOP - 110, 140); }

// ---------------- characters
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + base + Math.cos(u) * 20, { planar: true }); } };
const hang = (g, s) => reach(g, s, s * g.sw * 0.8, g.ySh + 330);
const onTable = (g, s) => reach(g, s, s * g.sw * 0.7, g.ySh + 335, { planar: true });
const toW = (g, s, x0, wx, wy, o = {}) => reach(g, s, wx - x0, wy - SEAT, o);
const seated = (g, t) => ({ t, mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: onTable(g, -1), armR: onTable(g, 1), items: {} });
const frac = (id, t) => (t - SP[id].t) / SP[id].d;
function herState(t, L) { const g = G.her, st = { ...seated(g, t), talk: talk('her', t), mood: 'annoyed', turn: 0.3, look: 0.7 };
  const palms = k => { st.armL = reach(g, -1, -g.sw * 1.7, g.ySh + 170 + Math.sin(t * 9) * 12 * k, { planar: true }); st.armR = reach(g, 1, g.sw * 1.7, g.ySh + 170 + Math.cos(t * 9) * 12 * k, { planar: true }); };
  if (L === 'hook') { st.mood = 'shock'; st.blink = 0; st.look = 0.8; st.lookY = t < HOOK_PUT ? 0.15 : 0.35; if (t > hev('back')) { st.mood = 'annoyed'; st.lookY = 0; } }
  if (L === 'A1') { st.mood = 'annoyed';
    if (speaking('a1_h', t, 0.05, 0.2) && t < LIFT) { st.mood = 'shock'; st.blink = 0; palms(1); }
    if (t >= LIFT) { const k = eOut(clamp((t - LIFT) / 0.35)); st.mood = t < LIFT + 0.6 ? 'shock' : 'annoyed'; st.blink = 0; st.look = 0.35; st.lookY = 0.1;
      st.armR = reach(g, 1, lerp(g.sw * 0.9, g.sw * 1.7, k), lerp(g.ySh + 330, g.ySh - 300, k), { planar: true }); st.items = { R: frozenOnSpoon }; } }
  if (L === 'A2') { st.mood = 'annoyed'; if (speaking('a2_h', t, 0.05, 0.2)) { st.mood = 'surprised'; palms(1); } if (speaking('a2_w', t)) st.mood = 'skeptical'; if (t > endOf('a2_w')) { st.mood = 'annoyed'; st.look = 0.9; } }
  if (L === 'B1') { st.mood = 'happy'; if (speaking('b1_h', t, 0.05, 0.2)) { gest(st, g, 'her', t, 1, 170); st.look = 0.5; } if (t > BREATH) { st.mood = 'surprised'; st.look = 0.8; } if (t > endOf('b1_w')) st.mood = 'skeptical'; }
  if (L === 'B2') { st.mood = 'annoyed'; if (speaking('b2_h', t, 0.05, 0.2)) { st.mood = 'angry'; st.armR = toW(g, 1, HX, FOLD_X - 60, TOP - 90, { planar: true }); st.lookY = 0.3; } if (t > SP.b2_w.t) { st.mood = 'annoyed'; st.look = 0.9; } if (t > endOf('b2_w') - 0.8) st.mood = 'shock'; }
  if (L === 'C1') { st.mood = 'neutral'; st.look = 0.6; if (speaking('c1_h', t, 0.05, 0.2)) { st.mood = frac('c1_h', t) < 0.45 ? 'neutral' : 'smug'; gest(st, g, 'her', t, 1, 170); } if (t > SP.c1_w.t) { st.mood = 'smug'; st.look = 0.8; } if (t > STRIKE) st.mood = 'happy'; }
  if (L === 'C2') { st.mood = 'smug'; st.turn = 0.2; st.look = 0.6;
    if (speaking('c2_h', t, 0.05, 0.1)) { gest(st, g, 'her', t, 1, 150); }
    if (t > endOf('c2_h')) { st.mood = 'smug'; st.blink = 1; }
    if (t > DES) { st.mood = 'surprised'; st.blink = 0; st.look = 0.8; }
    if (dessertOnTable(t, L)) { st.mood = 'happy'; st.laugh = true; st.look = 0.4; st.lookY = 0.2; } }
  return st; }
function wtrState(t, L) { const g = G.waiter2, st = { t, talk: talk('waiter2', t), mood: 'smug', turn: -0.25, look: -0.6, lookY: 0.1, armL: hang(g, -1), armR: hang(g, 1), items: {}, afterTorso: cc => waistcoat(cc, g) };
  if (L === 'hook') { st.mood = 'smug'; st.headY = 10; st.blink = t > 2.2 && t < 3.2 ? 1 : 0;
    if (t < HOOK_PUT) { st.armL = reach(g, -1, -g.sw * 2.0, g.ySh + 300, { planar: true }); st.items = { L: cc => folderOpen(cc, 0.9, -0.15) }; }
    else { st.look = -0.7; st.lookY = 0.2; } }
  if (L === 'A1') { if (speaking('a1_h', t, 0.05, 0.2)) { st.mood = 'surprised'; }
    if (speaking('a1_w', t, 0.05, 0.1)) { st.mood = 'happy'; const f = frac('a1_w', t); st.armL = reach(g, -1, -g.sw * 1.8, g.ySh + 230, { planar: true }); if (f > 0.55) { st.headY = 30 * Math.sin(clamp((f - 0.55) / 0.45) * Math.PI); st.blink = 1; } }
    if (t > endOf('a1_w') + 0.1) { st.mood = 'smug'; st.blink = 1; } }
  if (L === 'A2') { if (speaking('a2_h', t, 0.05, 0.2)) st.mood = 'skeptical';
    if (t >= HUG) { const k = eOut(clamp((t - HUG) / 0.3)); st.mood = 'happy'; st.blink = 1; st.tilt = 0.12 * k; st.headY = -6 * Math.sin(t * 5);
      st.armL = reach(g, -1, lerp(-g.sw * 0.8, -g.sw * 0.15, k), g.ySh + 260); st.armR = reach(g, 1, lerp(g.sw * 0.8, g.sw * 0.15, k), g.ySh + 250); st.items = { R: cc => { cc.save(); cc.translate(-60, -10); folderOpen(cc, 0.75, 0.25); cc.restore(); } }; } }
  if (L === 'B1') { if (speaking('b1_h', t, 0.05, 0.2)) st.mood = 'skeptical';
    if (speaking('b1_w', t, 0.05, 0.1)) st.mood = 'skeptical';
    if (t >= BREATH && t < endOf('b1_w') - 0.2) { const k = eOut(clamp((t - BREATH) / 0.5)); st.mood = 'smug'; st.blink = 1; st.headY = -26 * k; st.talk *= 0.6;
      st.armL = reach(g, -1, -g.sw * lerp(0.8, 2.1, k), g.ySh + lerp(330, 120, k), { planar: true }); st.armR = reach(g, 1, g.sw * lerp(0.8, 2.1, k), g.ySh + lerp(330, 120, k), { planar: true }); }
    if (t >= endOf('b1_w') - 0.2) { st.mood = 'smug'; st.blink = 0; } }
  if (L === 'B2') { if (speaking('b2_h', t, 0.05, 0.2)) st.mood = 'surprised';
    if (t >= WATCH && t < endOf('b2_w') - 1.0) { st.mood = 'neutral'; st.look = 0.15; st.lookY = 0.75; st.armR = reach(g, 1, -g.sw * 0.25, g.ySh + 140); }
    if (t >= endOf('b2_w') - 1.0) { st.mood = 'smug'; st.look = -0.7; st.lookY = 0; } }
  if (L === 'C1') { if (speaking('c1_h', t, 0.05, 0.2)) { const f = frac('c1_h', t); st.mood = f < 0.35 ? 'smug' : f < 0.7 ? 'skeptical' : 'worried'; }
    if (speaking('c1_w', t, 0.05, 0.3)) { st.mood = 'sad'; st.headY = 14; st.armR = reach(g, 1, g.sw * 0.2, g.ySh + 210); st.items = { R: cc => { cc.save(); cc.rotate(-0.6); cc.fillStyle = '#2B2F3A'; rr(cc, -7, -110, 14, 120, 5); cc.fill(); cc.fillStyle = '#C9A13A'; cc.fillRect(-7, -96, 14, 10); cc.restore(); } }; }
    if (t > endOf('c1_w') + 0.3) { st.mood = 'sad'; st.headY = 18; } }
  if (L === 'C2') { if (speaking('c2_h', t, 0.05, 0.1)) { const f = frac('c2_h', t); st.mood = f < 0.4 ? 'smug' : f < 0.75 ? 'surprised' : 'worried'; }
    if (t > endOf('c2_h')) { st.mood = 'sad'; st.headY = 22; st.look = -0.4; st.lookY = 0.4; }
    if (t >= DES && !dessertOnTable(t, L)) { const k = eBack(clamp((t - DES) / 0.35), 1.6); st.mood = t < SP.c2_w.t ? 'worried' : 'happy'; st.headY = lerp(22, 0, clamp((t - DES) / 0.3)); st.look = -0.6; st.lookY = 0;
      st.armR = reach(g, 1, lerp(g.sw * 0.9, -g.sw * 0.05, k), lerp(g.ySh + 380, g.ySh + 330, k)); st.items = { R: cc => { cc.save(); cc.translate(0, -12); plateDraw(cc, 0.55); sparklerDessert(cc, t, 0.8); cc.restore(); } }; }
    if (dessertOnTable(t, L)) { st.mood = 'sad'; st.headY = 16; st.look = -0.6; st.lookY = 0.3; } }
  return st; }

// ---------------- the world + which characters a shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', 'waiter2'], card: ['her', 'waiter2'], two: ['her', 'waiter2'], cover: ['her', 'waiter2'], her: ['her'], waiter2: ['waiter2'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.wide, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH);
  if (who.includes('waiter2')) { const r = K.put(c, WTR, wtrState(t, L), WX, 0); heads.waiter2 = r;
    if (hugging(t, L)) for (let i = 0; i < 4; i++) { const a = t * 1.6 + i * TAU / 4; coin(c, WX + Math.cos(a) * 250, r.y - 40 + Math.sin(a) * 90, 26, t + i); }
    if (L === 'C2' && t > endOf('c2_h') + 0.1 && t < DES + 0.3) sweat(c, r.x + 140, r.y - 60 + ((t * 120) % 60), 1.3); }
  chair(c, HX);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), HX, 0);
  tableFront(c, t, L);
  if (!heads.waiter2) heads.waiter2 = OFF; if (!heads.her) heads.her = OFFL;
  return heads; }

// ---------------- shots (world coordinates; face of a single at ~900 px)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const hHY = G.her.headY + SEAT, wHY = G.waiter2.headY;
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(30, fy(hHY, 0.62, 1420), 0.62, 'cover'), WIDE: S(30, fy(wHY, 0.56, 760), 0.56, 'wide'), CARD: S(30, fy(hHY, 0.5, 1180), 0.5, 'card'), CARD_A1: S(30, fy(hHY, 0.5, 1180), 0.5, 'card'), TWO: S(30, fy(hHY, 0.74, 1080), 0.74, 'two'),
  HER: S(HX + 20, fy(hHY, 1.0), 1.0, 'her'), HER_CU: S(HX + 20, fy(hHY, 1.3, 960), 1.3, 'her'),
  WTR: S(WX - 20, fy(wHY, 1.0), 1.0, 'waiter2'), WTR_CU: S(WX - 20, fy(wHY, 1.2, 820), 1.2, 'waiter2'),
  SOUP: U('soup', 1), BILL: U('bill', 2), WATCH: U('watch', 3) };
const C1Z = [SH.HER, S(HX + 20, fy(hHY, 1.15, 900), 1.15, 'her')];
const C2Z = [1.0, 1.18, 1.36].map(z => S(HX + 20, fy(hHY, z, 900), z, 'her'));
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = id => speaking(id, t, 0.1, 0.15);
  if (L === 'hook') { if (t < hev('soup')) return SH.COVER; if (t < hev('bill')) return f(SH.SOUP); if (t < hev('back')) return f(SH.BILL); return f(SH.TWO); }
  const u = t - sc.s, l = L.toLowerCase(), nar = SP[l + '_nar'];
  if (u < INTRO) return f(SH.WIDE);
  if (L === 'B2') { const a = wordT('b2_nar', 'посмотр'), b = wordT('b2_nar', 'запомин'); if (a && b && t >= a - 0.1 && t < b - 0.1) return f(SH.WATCH); }
  if (L === 'C1' && t >= STRIKE - 0.03 && t < STRIKE + 2.1) return f(SH.BILL);
  if (nar && t >= nar.t - 0.1) return f(L === 'A1' ? SH.CARD_A1 : SH.CARD);   // A1: the card is short, so the frame sits higher and the frozen soup stays clear of the captions
  if (L === 'C1' && sp('c1_h')) return f(frac('c1_h', t) < 0.5 ? C1Z[0] : C1Z[1]);
  if (L === 'C2') { if (sp('c2_h')) { const ch = (TL.cfg.chunks || {}).c2_h, p = SP.c2_h, w = p.words || [], cnt = ch.map(([en]) => en.trim().split(/\s+/).length), tot = cnt.reduce((a, b) => a + b, 0), chars = ch.map(([en]) => en.length), ctot = chars.reduce((a, b) => a + b, 0); let wi = 0, ci = 0, i = 0;
      ch.forEach((q, k) => { const a = w.length === tot ? p.t + w[wi][1] : p.t + p.d * ci / ctot; if (t >= a - 0.05) i = k; wi += cnt[k]; ci += chars[k]; }); return f(C2Z[i] || SH.HER); }
    if (t < endOf('c2_h') + 0.25) return f(C2Z[2]);
    return f(SH.WTR_CU); }
  // the latest line that has started wins: the cut to the next speaker comes 0.1 s before his line, never after (no off-screen bubble over the current shot)
  const cur = TL.speech.filter(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.1 && t < s.t + s.d + 0.25).pop();
  const single = who => who === 'her' ? SH.HER : SH.WTR;
  if (cur) return f(single(cur.who));
  const next = TL.speech.find(s => s.id.startsWith(l + '_') && s.who !== 'nar' && s.who !== 'tip' && t >= s.t - 0.6 && t < s.t);
  if (next) return f(single(next.who));
  return SH.TWO; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
// start time of the shot that is on screen at t (for the insert's pop-in)
function CAM_AT(t) { let fr = Math.min(CAM.length - 1, Math.round(t * FPS)); const tag = CAM[fr].tag; while (fr > 0 && CAM[fr - 1].tag === tag) fr--; return fr / FPS; }
const shake = E.makeShake(TL, ['impact', 'stamp', 'impact_soft', 'thud']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- overlays
// title overlay (hook, frame 0 .. 2.5 s): on screen from the first frame (no slide-in), fades out
function title(c, t) { const lines = TL.cfg.hook_title, a = 1 - clamp((t - 2.3) / 0.2); if (a <= 0) return; const rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 450); c.rotate(-0.05); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -175 + 14, 980, 350, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -175, 980, 350, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 74, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -112);
  UI.textFit(c, 'Unb9', 150, lines[1][0], 900); UI.strokeText(c, lines[1][0], 0, 4, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 66, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 122); c.restore();
  if (global.__QA) global.__QA.ui(c, 'title', { x: 50, y: 275, w: 980, h: 350, k: a, id: 'title' }); }
// short level intro (0.45 s): the level-colour circle left by levelIntroNext shrinks into the level pill, with the level name
function miniIntro(c, t, sc) { const u = t - sc.s; if (u > 0.42 || u < 0) return; const L = sc.id, i = UI.LV.indexOf(L); if (i < 0) return;
  const pw = 128, gap = 14, x0 = (W - (6 * pw + 5 * gap)) / 2, px = x0 + i * (pw + gap) + pw / 2, py = 253;
  const k = eIO(P(u, 0.04, 0.38)), cx = lerp(540, px, k), cy = lerp(960, py, k), R = lerp(330, 34, k);
  c.save(); c.globalAlpha = 1 - P(u, 0.34, 0.42); c.fillStyle = LVCOL[L]; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 8; c.stroke();
  c.translate(cx, cy); const s = lerp(1, 0.2, k); c.scale(s, s); c.textAlign = 'center'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 230); UI.strokeText(c, L, 0, 10, C.white, C.oliveD, 18); c.restore(); }
// A1 lesson card drawn here (the shared 'meter' card would say «ГРАММАТИКА»): label + note from cards.A1 — «СЧЁТ  +15%», ✗ платишь 15%
function cardA1(c, t, sc) { const nar = SP.a1_nar, cd = TL.cfg.cards.A1, u = t - nar.t + 0.15; if (u < 0) return;
  const out = P(t, sc.e - 0.35, sc.e - 0.05), k = eBack(P(u, 0, 0.35), 1.6), x = 90, w = 900, h = 300, y = 330 + (1 - k) * -80, n = t - nar.t;
  const pop = a => eBack(P(n, a, a + 0.3), 2);
  c.save(); c.globalAlpha = clamp(u / 0.15) * (1 - out); c.translate(540, y + h / 2); c.rotate((1 - k) * -0.08); c.translate(-540, -(y + h / 2));
  c.fillStyle = 'rgba(62,71,30,.28)'; rr(c, x + 12, y + 18, w, h, 44); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, x, y, w, h, 44); c.fill(); c.stroke();
  c.fillStyle = LVCOL.A1; rr(c, x + 40, y - 34, 230, 68, 34); c.fill(); c.stroke(); UI.font(c, 'Unb9', 30); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A1 • УРОК', x + 155, y + 2);
  const cx = x + 60, cy = y + 60; c.textAlign = 'left';
  UI.textFit(c, 'Unb9', 60, cd.label, 420); c.fillStyle = C.oliveD; c.fillText(cd.label, cx, cy + 50);
  const q = pop(0.25); if (q > 0) { c.save(); c.translate(cx + 780, cy + 50); c.scale(q, q); c.textAlign = 'right'; UI.font(c, 'Unb9', 76); UI.strokeText(c, '+15%', 0, 0, C.red, C.white, 10); c.restore(); }
  const q2 = pop(0.9); if (q2 > 0) { c.save(); c.translate(cx, cy + 165); c.scale(q2, q2); UI.cross(c, 34, 0, 34); UI.textFit(c, 'Nun9', 52, cd.note, 640); c.fillStyle = C.red; c.textAlign = 'left'; c.fillText(cd.note, 92, 4); c.restore(); }
  c.restore(); if (global.__QA) global.__QA.ui(c, 'card', { x, y, w, h, k, id: 'A1' }); }
function hud(c, t, sc) { if (sc.id === 'A1') cardA1(c, t, sc); else UI.card(c, t, sc); UI.captions(c, t); UI.sparkles(c, t); Hq.grain(c, W, HH, t, 0.04); UI.levelBar(c, t, sc, 1); UI.watermark(c); miniIntro(c, t, sc); UI.levelIntroNext(c, t); }
// rule: when the camera cuts away from a speaker whose line is over, the bubble is not carried onto the next shot
function liveHeads(heads, proj, t) { const out = { ...heads };
  for (const who of Object.keys(out)) { const q = proj(out[who]); if (q.x >= 0 && q.x <= W) continue; const live = TL.speech.some(s => s.who === who && t >= s.t - 0.1 && t < s.t + s.d); if (!live) delete out[who]; }
  return out; }
const names = { waiter2: ['WAITER', '#1E1E24'] };
const HOLD = { hook_w: 0.05, a1_h: 0.05, a1_w: 0.05, a2_h: 0.05, a2_w: 0.05, b1_h: 0.05, b1_w: 0.05, b2_h: 0.05, b2_w: 0.05, c1_h: 0.05, c1_w: 0.05, c2_h: 0.05, c2_w: 0.1 };
// the reply right before the narrator: its bubble fades 0.2 s earlier (the card pops 0.15 s before the narrator; never two texts stacked)
const TRIM = TL.speech.filter((s, i) => s.who === 'waiter2' && TL.speech[i + 1] && TL.speech[i + 1].who === 'nar' && TL.speech[i + 1].t - (s.t + s.d) < 0.4 && s.id !== 'hook_w');
function bubblesTrim(c, t, sc, heads, proj) { for (const s of TRIM) s.d -= 0.2; K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: HOLD }); for (const s of TRIM) s.d += 0.2; }
function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { const rows = [['A1', 'What? Fifteen! No!'], ['B1', 'Is the service charge optional?'], ['B2', "That's daylight robbery!"], ['C1', "I'd like it removed."]];
    K.outro(c, t, { q: ['ПЛАТИШЬ ЗА СЕРВИС,', 'ЕСЛИ ВСЁ ПЛОХО?'], qSize: 54, rows, cta: ['ОТПРАВЬ ПОДРУГЕ', 'ПЕРЕД УЖИНОМ'], heroX: 95, heroS: 0.34, heroY: [2350, 1985], ctaFit: true,
      hero: (cc, tt) => { const g = G.her, gw = G.waiter2, ws = 0.86;
        K.put(cc, WTR, { t: tt, mood: 'sad', turn: -0.2, look: -0.4, lookY: 0.2, talk: 0, headY: 14, armL: reach(gw, -1, -gw.sw * 0.8, gw.ySh + 330), armR: reach(gw, 1, gw.sw * 0.2, gw.ySh + 240), afterTorso: q => waistcoat(q, gw),
          items: { R: q => { q.save(); q.translate(0, -12); plateDraw(q, 0.45); sparklerDessert(q, tt, 0.62); q.restore(); } } }, 610, 0, ws);
        K.put(cc, HER, { t: tt, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(tt * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 1.4, g.ySh + 150, { planar: true }) }, 0, 0); } });
    const u = t - SC.outro.s, kk = P(u, 1.35, 1.7); if (kk > 0) { const bh = 140 + rows.length * 115, y = 740 - bh / 2 + 150; UI.textFit(c, 'Nun9', 46, rows[0][1], 740); const wd = c.measureText(rows[0][1]).width;
      c.save(); c.globalAlpha = 0.55 * kk; c.fillStyle = C.white; c.fillRect(214, y - 34, wd + 16, 68); c.restore(); c.strokeStyle = C.red; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(212, y + 2); c.lineTo(212 + (wd + 16) * eOut(kk), y + 2); c.stroke(); }
    Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { const n = tag.slice(3); if (n === 'soup') soupView(c, t); else if (n === 'watch') watchView(c, t); else billView(c, t);
    heads = { her: OFFL, waiter2: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  heads = liveHeads(heads, proj, t);
  if (L === 'hook') { title(c, t);
    K.bubbles(c, t, { id: 'hook' }, heads, proj, { cleanChunks: true, names, hold: HOLD }); UI.levelBar(c, t, { id: 'hook' }); K.stamp(c, t); UI.captions(c, t);
    Hq.grain(c, W, HH, t, 0.045); UI.sparkles(c, t); UI.watermark(c); UI.levelIntroNext(c, t); return; }
  bubblesTrim(c, t, sc, heads, proj);
  hud(c, t, sc);
}
E.run('service', NF, renderFrame);
