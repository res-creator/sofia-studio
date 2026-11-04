// "Подруга спойлерит" — rubric «Как ответить, когда…» (scene + 4 answers, worst -> best + twist), hard_cut camera: node spoiler.js start end out.mp4 | --png=f1,f2
// Cosy living room at night: the heroine (pink sweater) and Priya (teal hoodie) on one sofa facing the camera = facing the TV.
// Key props: the popcorn bowl on her lap, Priya's thick book "THE LAST SECRET" on Priya's lap, her mug on the coffee table.
// The TV is only seen as full-screen inserts on a solid backdrop (English UI): "MURDER AT THE MANOR · S1 · EPISODE 3".
// hook: Priya: "I can't believe he dies at the end!" -> she freezes with popcorn at her mouth, the popcorn drops.
// o1 «В ЛОБ»: she yells, the popcorn flies up, Priya ducks, "...the dog dies too" -> tears + popcorn rain on her head.
// o2 «ВЕЖЛИВО»: Priya pats her, "the funeral, though..." -> she hides behind a cushion, peeks, Priya pats the cushion.
// o3 «КАК НОСИТЕЛЬ»: open palm + remote, "episode three" -> Priya zips her mouth and throws away the key; TV insert EP 3; Bella tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: she sweetly takes Priya's book and opens it at THE END -> Priya snatches it back, hugs it, scoots away; she sips her tea.
// Twist: "Wait. Which show are you watching?" (TV insert) "Oh, that one? The butler did it." -> the popcorn bowl lands on her head. Moral. End screen 1/2/3/4.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, hash, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/spoiler/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
const FR = 'friend3';

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#EF7FAA' }, bottom: { type: 'joggers', col: '#8A94B8' }, shoes: { col: '#F4EFE6', acc: null } };
const PRI = BASE.priya;
const G = { her: geom(HER), [FR]: geom(PRI) };
const SEAT = 330, X = { her: -270, [FR]: 300 }, PIV = -380;
const HY = k => G[k].headY + SEAT;
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
function kernel(c, x, y, r, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#FFF8E6'; c.beginPath(); c.arc(-r * 0.4, 0, r * 0.62, 0, TAU); c.arc(r * 0.35, -r * 0.2, r * 0.58, 0, TAU); c.arc(0, r * 0.35, r * 0.55, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(160,120,60,.55)'; c.lineWidth = 2.5; c.stroke(); c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(r * 0.1, r * 0.1, r * 0.22, 0, TAU); c.fill(); c.restore(); }
// popcorn bowl; (0,0) = rim centre; full = 0..1 popcorn heap
function bowl(c, x, y, s = 1, rot = 0, full = 1) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (full > 0) for (let i = 0; i < 16; i++) { const a = hash(i * 3.1), b = hash(i * 7.7); kernel(c, -120 + a * 240, -18 - b * 70 * full - Math.sin(a * Math.PI) * 30 * full, 24, a * 6); }
  paint(c, q => { q.m(-160, -10); q.l(160, -10); q.q(150, 110, 0, 118); q.q(-150, 110, -160, -10); q.z(); }, '#E0474C', { sd: 8, hd: 4, lw: 4, inner: k => { k.fillStyle = '#FFFFFF'; for (let i = 0; i < 5; i++) k.fillRect(-140 + i * 64, -10, 26, 120); } });
  c.fillStyle = '#FFFDF8'; c.beginPath(); c.ellipse(0, -10, 162, 16, 0, 0, TAU); c.fill(); c.strokeStyle = '#B8303A'; c.lineWidth = 4; c.stroke(); c.restore(); }
// Priya's thick book; open = 0 closed (cover) .. 1 open at THE END (facing the camera)
function book(c, x, y, s = 1, rot = 0, open = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (open < 0.5) { const sq = 1 - open * 2; c.scale(lerp(0.2, 1, sq), 1);
    paint(c, q => { q.m(-110, -150); q.l(110, -150); q.l(110, 150); q.l(-110, 150); q.z(); }, '#7A3A8A', { sd: 8, hd: 4, lw: 4 });
    c.fillStyle = '#F2C14E'; c.fillRect(-110, -150, 26, 300); c.fillStyle = '#FFF4D8'; c.fillRect(104, -140, 10, 282);
    fitTxt(c, 'THE LAST', 14, -66, 34, '#F2C14E', 170); fitTxt(c, 'SECRET', 14, -24, 40, '#F2C14E', 170); c.strokeStyle = '#F2C14E'; c.lineWidth = 4; c.beginPath(); c.arc(14, 60, 34, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(14, 36); c.lineTo(14, 84); c.moveTo(-10, 60); c.lineTo(38, 60); c.stroke();
    c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(60, 150); c.lineTo(84, 150); c.lineTo(84, 200); c.lineTo(72, 188); c.lineTo(60, 200); c.closePath(); c.fill(); }   // bookmark ribbon
  else { const k = (open - 0.5) * 2; c.scale(lerp(0.3, 1, k), 1);
    paint(c, q => { q.m(-250, -170); q.l(250, -170); q.l(250, 170); q.l(-250, 170); q.z(); }, '#7A3A8A', { sd: 8, hd: 4, lw: 4 });
    for (const sd of [-1, 1]) { paint(c, q => { q.m(0, -150); q.q(sd * 120, -170, sd * 236, -156); q.l(sd * 236, 156); q.q(sd * 120, 146, 0, 160); q.z(); }, '#FFF9EC', { sd: 4, hd: 2, lw: 3 }); }
    c.fillStyle = 'rgba(90,70,60,.35)'; for (let i = 0; i < 9; i++) { const w = 150 + hash(i) * 40; c.fillRect(-206, -120 + i * 28, w, 7); }
    fitTxt(c, 'CHAPTER 40', 118, -96, 28, '#7A3A8A', 190); fitTxt(c, 'THE', 118, -12, 46, '#2B1A22', 190); fitTxt(c, 'END', 118, 44, 64, '#E0474C', 190);
    c.fillStyle = 'rgba(90,70,60,.35)'; c.fillRect(46, 96, 140, 6); c.fillRect(66, 116, 100, 6); c.restore(); return; }
  c.restore(); }
function cushion(c, x, y, s = 1, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  paint(c, q => { q.m(-160, -130); q.q(0, -110, 160, -130); q.q(140, 0, 160, 130); q.q(0, 110, -160, 130); q.q(-140, 0, -160, -130); q.z(); }, '#F2B33D', { sd: 10, hd: 5, lw: 4 });
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 8; c.beginPath(); c.moveTo(-90, -60); c.lineTo(90, 60); c.moveTo(90, -60); c.lineTo(-90, 60); c.stroke();
  c.fillStyle = '#E0474C'; for (const [a, b] of [[-160, -130], [160, -130], [-160, 130], [160, 130]]) { c.beginPath(); c.arc(a, b, 14, 0, TAU); c.fill(); } c.restore(); }
function mug(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); paint(c, q => { q.m(-46, -110); q.l(46, -110); q.l(40, 0); q.l(-40, 0); q.z(); }, '#4E7FB8', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = '#4E7FB8'; c.lineWidth = 14; c.beginPath(); c.arc(54, -58, 24, -1.3, 1.3); c.stroke(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, -58, 16, 0, TAU); c.fill(); c.restore(); }
const mugItem = { under: ctx => { ctx.save(); ctx.translate(-10, 50); mug(ctx, 0, 0, 0.8); ctx.restore(); } };
const remoteItem = { under: ctx => { ctx.save(); ctx.rotate(-0.25); paint(ctx, q => { q.m(-24, -150); q.l(24, -150); q.l(24, 30); q.l(-24, 30); q.z(); }, '#2B2F3A', { sd: 4, hd: 2, lw: 3 });
  ctx.fillStyle = '#E0474C'; ctx.beginPath(); ctx.arc(0, -124, 9, 0, TAU); ctx.fill(); ctx.fillStyle = '#9AA3B8'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) ctx.fillRect(-14 + j * 18, -96 + i * 22, 10, 10); ctx.restore(); } };
const kernelItem = { over: ctx => kernel(ctx, 0, -18, 18, 0.4) };
function keyIcon(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.strokeStyle = '#F2C14E'; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 22, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(22, 0); c.lineTo(80, 0); c.moveTo(62, 0); c.lineTo(62, 18); c.moveTo(76, 0); c.lineTo(76, 14); c.stroke(); c.restore(); }

// ---------------- living room (prerendered, softly blurred)
const BX0 = -2600, BY0 = -3200, BW = 5200, BH = 4600, BS = 0.5;
function drawRoom(c) {
  c.fillStyle = '#E9C9B8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(180,90,110,.10)'; for (let x = BX0; x < BX0 + BW; x += 140) c.fillRect(x, BY0, 50, 3200);
  // window with the night city (left)
  c.fillStyle = '#F7F2E8'; rr(c, -2050, -2350, 900, 1150, 18); c.fill(); const g = c.createLinearGradient(0, -2320, 0, -1230); g.addColorStop(0, '#1E2650'); g.addColorStop(1, '#4A3E78'); c.fillStyle = g; rr(c, -2020, -2320, 840, 1090, 10); c.fill();
  for (let i = 0; i < 8; i++) { const x = -2010 + i * 105, h = 160 + hash(i + 2) * 260; c.fillStyle = '#151A3A'; c.fillRect(x, -1230 - h, 95, h); c.fillStyle = 'rgba(255,220,120,.7)'; for (let k = 0; k < 6; k++) if (hash(i * 9 + k) > 0.45) c.fillRect(x + 14 + (k % 2) * 40, -1215 - h + 24 + Math.floor(k / 2) * 46, 20, 24); }
  c.fillStyle = '#FFF4C8'; c.beginPath(); c.arc(-1400, -2150, 60, 0, TAU); c.fill(); c.fillStyle = '#F7F2E8'; c.fillRect(-1610, -2320, 20, 1090);
  c.fillStyle = '#5B8DEF'; rr(c, -2180, -2420, 170, 1300, 30); c.fill(); rr(c, -1190, -2420, 170, 1300, 30); c.fill();
  // poster + fairy lights over the sofa
  c.fillStyle = '#2B2F3A'; rr(c, -420, -2380, 520, 640, 12); c.fill(); c.fillStyle = '#F49AB8'; c.fillRect(-395, -2355, 470, 590); c.fillStyle = '#FFF4D8'; c.beginPath(); c.arc(-160, -2120, 120, 0, TAU); c.fill(); c.fillStyle = '#7A3A8A'; c.fillRect(-395, -1930, 470, 165);
  c.strokeStyle = 'rgba(80,60,60,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-1000, -2600); for (let i = 0; i <= 12; i++) c.quadraticCurveTo(-920 + i * 180, -2480, -830 + i * 180, -2600); c.stroke();
  for (let i = 0; i < 24; i++) { c.fillStyle = ['#F2C14E', '#EE5E9A', '#5BD38A', '#5B8DEF'][i % 4]; c.beginPath(); c.arc(-960 + i * 90, -2545 + (i % 2) * 20, 13, 0, TAU); c.fill(); }
  // bookshelf (right)
  c.fillStyle = '#8A5434'; rr(c, 1250, -2500, 820, 2300, 16); c.fill(); c.fillStyle = '#6E4028'; for (let k = 0; k < 5; k++) c.fillRect(1280, -2470 + k * 450, 760, 24);
  for (let k = 0; k < 4; k++) for (let i = 0; i < 9; i++) { const h = 240 + hash(k * 13 + i) * 140, w = 52 + hash(i * 5 + k) * 30; c.fillStyle = ['#E0474C', '#4E7FB8', '#F2B33D', '#5EA65A', '#B8457A', '#3FB6A8'][(i + k) % 6]; c.fillRect(1300 + i * 80, -2446 + k * 450 + 426 - h, w, h); }
  // floor lamp (glow)
  const gl = c.createRadialGradient(-1000, -1500, 30, -1000, -1500, 700); gl.addColorStop(0, 'rgba(255,225,150,.55)'); gl.addColorStop(1, 'rgba(255,225,150,0)'); c.fillStyle = gl; c.fillRect(-1700, -2200, 1400, 1400);
  c.fillStyle = '#3A3036'; c.fillRect(-1010, -1450, 20, 1450); c.fillStyle = '#F7E6C8'; c.beginPath(); c.moveTo(-1120, -1460); c.lineTo(-880, -1460); c.lineTo(-940, -1680); c.lineTo(-1060, -1680); c.closePath(); c.fill();
  c.fillStyle = '#6A8E5A'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(2250 + i * 25, -1250 - i * 60, 60, 170, -0.6 + i * 0.22, 0, TAU); c.fill(); } c.fillStyle = '#B86A3A'; rr(c, 2160, -500, 220, 300, 20); c.fill();
  c.fillStyle = '#8A5A40'; c.fillRect(BX0, -120, BW, 1600); c.fillStyle = 'rgba(0,0,0,.1)'; for (let x = BX0; x < BX0 + BW; x += 220) c.fillRect(x, -120, 8, 1600);   // floor
  c.fillStyle = '#C96A8A'; c.beginPath(); c.ellipse(0, 120, 1700, 210, 0, 0, TAU); c.fill();   // rug
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawRoom);
const SX0 = -880, SX1 = 920;
function sofaBack(c) { paint(c, q => { q.m(SX0, -900); q.q(0, -950, SX1, -900); q.l(SX1, -330); q.l(SX0, -330); q.z(); }, '#4E7FB8', { sd: 12, hd: 6, lw: 4 });
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 8; c.beginPath(); c.moveTo(20, -900); c.lineTo(20, -360); c.stroke(); }
function sofaFront(c) { paint(c, q => { q.m(SX0 - 40, -440); q.l(SX1 + 40, -440); q.l(SX1 + 40, -90); q.l(SX0 - 40, -90); q.z(); }, '#5B8DD0', { sd: 10, hd: 5, lw: 4 });
  for (const x of [SX0 - 110, SX1 + 10]) paint(c, q => { q.m(x, -640); q.q(x + 50, -680, x + 100, -640); q.l(x + 100, -90); q.l(x, -90); q.z(); }, '#4E7FB8', { sd: 10, hd: 5, lw: 4 });   // armrests
  c.fillStyle = '#3A2A20'; for (const x of [SX0 - 90, SX1 + 50]) c.fillRect(x, -90, 34, 90); }
function coffeeTable(c, t, L) { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, -10, 880, 40, 0, 0, TAU); c.fill();
  paint(c, q => { q.m(-820, -300); q.l(820, -300); q.l(820, -250); q.l(-820, -250); q.z(); }, '#A8693F', { sd: 4, hd: 2, lw: 4 }); c.fillStyle = '#8A5434'; for (const x of [-780, 740]) c.fillRect(x, -250, 40, 250);
  if (!mugInHand(t, L)) mug(c, X.her - 120, -300, 1);
  paint(c, q => { q.m(250, -318); q.l(430, -318); q.l(430, -300); q.l(250, -300); q.z(); }, '#2B2F3A', { sd: 2, hd: 1, lw: 3 });   // the remote's spot
  if (!remoteInHand(t, L)) { c.save(); c.translate(340, -312); c.rotate(Math.PI / 2); paint(c, q => { q.m(-14, -80); q.l(14, -80); q.l(14, 80); q.l(-14, 80); q.z(); }, '#2B2F3A', { sd: 2, hd: 1, lw: 3 }); c.restore(); } }
const mugInHand = (t, L) => (L === 'o4' && t > ev('o4', 'sip') - 0.1) || L === 'end';
const remoteInHand = (t, L) => L === 'o3' && t < SP.o3_f.t + 0.1;

// ---------------- state of the props
const LAP = { x: X.her - 50, y: -580 };
function bowlState(t, L) {   // where the popcorn bowl is (world) — on her lap, flipping onto her head in the twist
  const s = { x: LAP.x, y: LAP.y, rot: 0, full: 1, onHead: 0 };
  if (L === 'o1' && t > ev('o1', 'throw')) s.full = 0.35;    // each option is a fresh take: the bowl is full again
  if (L === 'end' && t > ev('end', 'bowl')) { const k = eIO(clamp((t - ev('end', 'bowl')) / 0.45)); s.onHead = k; s.full = 0; }
  return s; }
function bookState(t, L) {   // Priya's book: on her lap; o4 in the heroine's hands, open at THE END; snatched back, hugged
  const lap = { x: X[FR] + scootX(t, L), y: -520, rot: 0.05, open: 0, s: 0.85, held: null };
  if (L !== 'o4' && L !== 'end') return lap;
  const ta = ev('o4', 'take'), tb = ev('o4', 'book'), sn = ev('o4', 'snatch'), hg = ev('o4', 'hug');
  if (L === 'end' || t > hg) return { x: X[FR] + scootX(t, L) - 10, y: -780, rot: -0.1, open: 0, s: 0.8, held: 'hug' };
  const herHold = { x: X.her + 40, y: -760, rot: 0, s: 0.95 };
  if (t < ta) return lap;
  if (t < ta + 0.45) { const k = eIO((t - ta) / 0.45); return { x: lerp(lap.x, herHold.x, k), y: lerp(lap.y, herHold.y, k) - Math.sin(k * Math.PI) * 120, rot: lerp(0.05, 0, k), open: 0, s: lerp(0.85, 0.95, k), held: k > 0.5 ? 'her' : null }; }
  if (t < sn) return { ...herHold, open: clamp((t - tb) / 0.35), held: 'her' };
  const k = eIO(clamp((t - sn) / 0.35)); const hug = { x: X[FR] - 10, y: -780 };
  return { x: lerp(herHold.x, hug.x, k), y: lerp(herHold.y, hug.y, k) - Math.sin(k * Math.PI) * 100, rot: lerp(0, -0.1, k), open: k < 0.4 ? 1 : 0, s: lerp(0.95, 0.8, k), held: k > 0.5 ? 'hug' : 'her' }; }
function cushionState(t, L) {   // rests in the left corner of the sofa; o2: up in front of her face, peek, (stays down later)
  const rest = { x: X.her - 360, y: -560, rot: -0.25, s: 0.9, up: 0 };
  if (L !== 'o2') return rest; const a = ev('o2', 'cushion'); if (t < a) return rest;
  const k = eBack(clamp((t - a) / 0.3), 1.3), face = { x: X.her + 10, y: HY('her') + 40 }, pk = t > ev('o2', 'peek') ? eIO(clamp((t - ev('o2', 'peek')) / 0.25)) * 70 : 0;
  const bump = t > ev('o2', 'poke') && t < ev('o2', 'poke') + 0.3 ? Math.sin((t - ev('o2', 'poke')) / 0.3 * Math.PI) * 18 : 0;
  return { x: lerp(rest.x, face.x, k) + bump, y: lerp(rest.y, face.y, k) + pk, rot: lerp(-0.25, 0.04, clamp(k)), s: 0.9, up: k }; }
const scootX = (t, L) => (L === 'o4' ? eIO(clamp((t - ev('o4', 'scoot')) / 0.4)) : L === 'end' ? 1 : 0) * 150;

// ---------------- popcorn particles (world)
function popcornFly(c, t, L, heads) {
  if (L === 'o1') { const a = ev('o1', 'throw'), u = t - a; if (u > 0 && u < 1.6) for (let i = 0; i < 26; i++) { const vx = (hash(i) - 0.5) * 900, vy = -1500 - hash(i + 9) * 700, x = LAP.x + vx * u, y = LAP.y - 20 + vy * u + 1700 * u * u; if (y < 0) kernel(c, x, y, 22, u * 8 + i); }
    const r = ev('o1', 'rain'), w = t - r, hd = heads.her; if (w > 0 && w < 1.0 && hd && hd.x > -1e4) for (let i = 0; i < 14; i++) { const d = hash(i * 4) * 0.5, ww = w - d; if (ww < 0) continue; const x = hd.x + (hash(i + 3) - 0.5) * 360, y = hd.y - 900 + 2600 * ww * ww; if (y < hd.y - hd.hh * 0.6) kernel(c, x, y, 20, i + ww * 6); } }
  if (L === 'end') { const b = ev('end', 'bowl'), u = t - b; if (u > 0 && u < 1.4) for (let i = 0; i < 22; i++) { const vx = (hash(i * 2) - 0.5) * 700, vy = -900 - hash(i + 5) * 600, x = LAP.x + vx * u, y = LAP.y - 600 + vy * u + 2200 * u * u; if (y < -100) kernel(c, x, y, 22, u * 9 + i); } } }
function stuckPopcorn(c, hd, n) { for (let i = 0; i < n; i++) kernel(c, hd.x + (hash(i * 7 + 1) - 0.5) * hd.hh * 1.6, hd.y - hd.hh * (0.75 + hash(i * 3) * 0.25), 18, i); }
function tears(c, hd, k, t) { if (k <= 0) return; c.save(); c.globalAlpha = 0.85 * k; c.fillStyle = '#6EC6F2';
  for (const s of [-1, 1]) { const x = hd.x + s * hd.hh * 0.38, y = hd.y + hd.hh * 0.12, L = hd.hh * (0.4 + 0.6 * k);
    c.beginPath(); c.moveTo(x - 10, y); c.quadraticCurveTo(x - 14 + Math.sin(t * 9 + s) * 4, y + L * 0.6, x - 6, y + L); c.lineTo(x + 6, y + L); c.quadraticCurveTo(x + 14, y + L * 0.6, x + 10, y); c.closePath(); c.fill();
    const dp = ((t * 2.2 + (s > 0 ? 0.5 : 0)) % 1); c.beginPath(); c.arc(x + s * 8, y + L + dp * 140, 11, 0, TAU); c.fill(); } c.restore(); }
function zipper(c, hd, k) { if (k <= 0) return; const x = hd.x + 6, y = hd.y + hd.hh * 0.48, w = hd.hh * 0.62 * k; c.save(); c.strokeStyle = '#2B2F3A'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - hd.hh * 0.31, y); c.lineTo(x - hd.hh * 0.31 + w, y); c.stroke();
  c.lineWidth = 4; for (let i = 0; i < 9 * k; i++) { const xx = x - hd.hh * 0.31 + i * hd.hh * 0.07; c.beginPath(); c.moveTo(xx, y - 9); c.lineTo(xx, y + 9); c.stroke(); }
  c.fillStyle = '#C9CED6'; rr(c, x - hd.hh * 0.31 + w - 8, y - 14, 16, 30, 5); c.fill(); c.restore(); }

// ---------------- characters (seated on the sofa); wreach = reach to a WORLD point (pose space is the undropped body, so subtract SEAT)
const wreach = (g, s, x, y, o) => reach(g, s, x, y - SEAT, o);
const gest = (st, g, who, t, side, base) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = wreach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + SEAT + base + Math.cos(u) * 20, { planar: true }); } };
const at = (g, who, side, wx, wy) => wreach(g, side, wx - X[who], wy, { planar: true });
const open = (g, s, k = 1.7, dy = 90) => wreach(g, s, s * g.sw * k, g.ySh + SEAT + dy, { planar: true });
const knees = (g, s, dx = 0.95) => wreach(g, s, s * g.sw * dx, g.ySh + SEAT + 360, { planar: true });
const seated = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, legPose: 'sit', drop: SEAT, legs: false, armL: knees(g, -1), armR: knees(g, 1), items: {} });
function herState(t, L) { const g = G.her, who = 'her', e = k => ev(L, k), st = { ...seated(g, t, who), mood: 'happy', turn: 0, look: 0 };
  if (L === 'hook') { st.headFirst = true; st.armR = wreach(g, 1, 45, HY('her') + 95); st.items = t < hev('freeze') + 0.15 ? { R: kernelItem } : {}; st.turn = 0.25; st.look = 0.6;
    if (t > hev('freeze') - 0.05) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; st.look = 0.9; st.headY = -6; if (t > hev('freeze') + 0.5) { st.armR = knees(g, 1); st.headFirst = false; } }
    if (t > hev('tv') - 0.05) { st.mood = 'worried'; st.look = 0; st.turn = 0; } if (t > hev('four')) { st.mood = 'annoyed'; st.look = 0.7; st.turn = 0.2; } }
  if (L === 'o1') { st.mood = 'annoyed'; st.turn = 0.3; st.look = 0.8;
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'angry'; const k = clamp((t - e('throw')) / 0.25); st.armL = wreach(g, -1, -g.sw * lerp(0.9, 1.9, k), g.ySh + SEAT + lerp(360, -260, eOut(k)), { planar: true }); st.armR = wreach(g, 1, g.sw * lerp(0.9, 1.9, k), g.ySh + SEAT + lerp(360, -260, eOut(k)), { planar: true }); }
    if (t > endOf('o1_h') + 0.1) { st.mood = 'annoyed'; }
    if (t > e('dog') - 0.1) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('tears') - 0.05) { st.mood = 'sad'; st.blink = 0.5; st.lookY = 0.3; st.look = 0; st.turn = 0; st.headY = Math.sin(t * 18) * 3; } }
  if (L === 'o2') { st.mood = 'sad'; st.turn = 0.25; st.look = 0.7;
    if (speaking('o2_h', t, 0.1, 0.2)) { st.mood = 'neutral'; st.armL = at(g, who, -1, X.her - 30, -760); st.armR = at(g, who, 1, X.her + 30, -760); }
    if (t > SP.o2_f.t) { st.mood = 'surprised'; } if (t > e('fun') - 0.05) { st.mood = 'shock'; st.blink = 0; }
    const cu = cushionState(t, L); if (cu.up > 0) { st.headFirst = true; st.armL = at(g, who, -1, cu.x - 120, cu.y + 40); st.armR = at(g, who, 1, cu.x + 120, cu.y + 40); st.mood = t > e('peek') ? 'worried' : 'shock'; st.look = t > e('poke') ? 0.9 : 0; st.lookY = 0; } }
  if (L === 'o3') { st.mood = 'neutral'; st.turn = 0.3; st.look = 0.8;
    if (remoteInHand(t, L)) { st.items = { L: remoteItem }; st.armL = wreach(g, -1, -g.sw * 1.5, g.ySh + SEAT - 60, { planar: true }); }
    if (speaking('o3_h', t, 0.1, 0.25)) { st.armR = open(g, 1, 2.0, 40 + Math.sin(t * 5) * 12); }
    if (t > SP.o3_f.t + 0.1) { st.mood = 'happy'; st.armL = knees(g, -1); st.armR = knees(g, 1); } if (t > e('zip')) { st.mood = 'smug'; } if (t > SP.o3_nar.t) { st.look = 0.2; st.turn = 0.1; st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'smug'; st.turn = 0.3; st.look = 0.8; const bk = bookState(t, L);
    if (t > e('take') - 0.1 && t < e('take') + 0.25) st.armR = at(g, who, 1, X[FR] - 40, -560);
    if (bk.held === 'her') { st.mood = 'happy'; st.squint = true; st.look = 0.5; const w = bk.open > 0 ? 240 : 110; st.armL = at(g, who, -1, bk.x - w * bk.s, bk.y + 40); st.armR = at(g, who, 1, bk.x + w * bk.s, bk.y + 40); }
    if (t > e('snatch') + 0.2) { st.mood = 'surprised'; st.squint = false; st.look = 0.8; }
    if (t > e('hug') + 0.1) { st.mood = 'smug'; st.look = 0.5; }
    if (mugInHand(t, L)) { const k = eIO(clamp((t - e('sip')) / 0.35)); st.headFirst = true; st.items = { R: mugItem }; st.armR = wreach(g, 1, lerp(-g.sw * 0.0 + 60, 40, k), lerp(-300, HY('her') + 150, k), { planar: true }); st.mood = 'happy'; st.blink = k > 0.8 ? 1 : 0; st.look = 0; st.turn = 0.05; } }
  if (L === 'end') { st.mood = 'neutral'; st.look = 0.8; st.turn = 0.3; st.items = { R: mugItem }; st.armR = wreach(g, 1, 60, -560, { planar: true });
    if (t > SP.end_f.t + 0.4) { st.mood = 'surprised'; } if (t > e('butler')) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (t > e('bowl') + 0.4) { st.mood = 'annoyed'; st.look = 0; st.turn = 0; st.lookY = -0.3; st.blink = 0.4; } if (t > SP.moral.t + 0.4) { st.lookY = 0; st.look = 0.6; st.turn = 0.2; } }
  return st; }
function priState(t, L) { const g = G[FR], who = FR, e = k => ev(L, k), st = { ...seated(g, t, who), mood: 'happy', turn: -0.3, look: -0.8 };
  const bk = bookState(t, L); if (bk.held === null && L !== 'o4') { st.armL = at(g, who, -1, X[FR] + scootX(t, L) - 70, -520); st.armR = at(g, who, 1, X[FR] + scootX(t, L) + 70, -520); }
  if (L === 'hook') { st.laugh = speaking('hook_f', t) && false; st.armL = wreach(g, -1, -g.sw * 1.7, g.ySh + SEAT + 40 + Math.sin(t * 8) * 25, { planar: true }); st.armR = wreach(g, 1, g.sw * 1.7, g.ySh + SEAT + 40 + Math.cos(t * 8) * 25, { planar: true });
    if (t > endOf('hook_f') + 0.05) { st.mood = 'happy'; st.armL = at(g, who, -1, X[FR] - 70, -520); st.armR = at(g, who, 1, X[FR] + 70, -520); } if (t > hev('fr') - 0.05) { st.mood = 'smug'; st.look = 0.2; st.turn = 0.1; } }
  if (L === 'o1') { st.mood = 'happy'; if (speaking('o1_h', t, 0.05, 0)) st.mood = 'surprised';
    if (t > e('duck') - 0.05 && t < SP.o1_f.t + 0.1) { st.mood = 'shock'; st.headY = 26; st.headFirst = true; st.armL = wreach(g, -1, -g.sw * 1.1, HY(FR) - 60, { planar: true }); st.armR = wreach(g, 1, g.sw * 1.1, HY(FR) - 60, { planar: true }); }
    if (speaking('o1_f', t, 0, 0.1)) { st.mood = 'neutral'; st.headY = Math.sin((t - SP.o1_f.t) * 12) * 10 * (t < SP.o1_f.t + 0.6 ? 1 : 0); if (t > e('dog')) { st.mood = 'happy'; gest(st, g, who, t, -1, 120); } }
    if (t > endOf('o1_f') + 0.1) { st.mood = 'worried'; } }
  if (L === 'o2') { st.mood = 'happy';
    if (speaking('o2_f', t, 0, 0) && t < e('fun')) { st.mood = 'happy'; st.armL = at(g, who, -1, X.her + G.her.sw * 0.9, G.her.ySh + SEAT + 10 + Math.sin(t * 9) * 12); }
    if (t > e('fun')) { st.mood = 'sad'; st.blink = 0.3; } if (t > e('cushion')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('poke') - 0.1 && t < e('poke') + 0.45) { const cu = cushionState(t, L); st.armL = at(g, who, -1, cu.x + 150, cu.y); st.mood = 'worried'; } }
  if (L === 'o3') { st.mood = 'happy'; if (speaking('o3_h', t, 0, 0)) st.mood = 'surprised';
    if (speaking('o3_f', t, 0.05, 0)) { st.mood = 'worried'; st.headFirst = true; st.armR = wreach(g, 1, g.sw * 0.7, HY(FR) + 120, { planar: true }); }
    const z = e('zip'), ky = e('key');
    if (t > z - 0.05 && t < ky) { const k = clamp((t - z) / 0.35); st.mood = 'neutral'; st.talk = 0; st.headFirst = true; st.armR = wreach(g, 1, lerp(-g.hh * 0.35, g.hh * 0.4, k), HY(FR) + g.hh * 0.5, { planar: true }); }
    if (t >= ky) { const k = clamp((t - ky) / 0.25); st.mood = 'smug'; st.talk = 0; st.armR = wreach(g, 1, g.sw * lerp(0.8, 2.0, k), g.ySh + SEAT + lerp(0, -300, k), { planar: true }); if (t > ky + 0.7) st.armR = at(g, who, 1, X[FR] + 70, -520); } }
  if (L === 'o4') { st.mood = 'happy'; st.armL = at(g, who, -1, X[FR] - 70, -520); st.armR = at(g, who, 1, X[FR] + 70, -520);
    if (t > e('take') - 0.1) { st.mood = 'surprised'; st.look = -0.8; } if (t > e('book')) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('snatch') - 0.1 && t < e('hug')) { const k = clamp((t - e('snatch')) / 0.25); st.armL = at(g, who, -1, lerp(X[FR] - 100, X.her + 200, Math.sin(k * Math.PI)), -760); st.mood = 'shock'; }
    if (bk.held === 'hug') { st.headFirst = false; st.armL = at(g, who, -1, bk.x + 90, bk.y + 60); st.armR = at(g, who, 1, bk.x - 90, bk.y + 70); st.mood = speaking('o4_f', t) ? 'shock' : 'annoyed'; st.turn = -0.2; st.look = -0.6; }
    if (t > e('scoot')) { st.mood = 'skeptical'; st.turn = -0.3; st.look = -0.9; } }
  if (L === 'end') { st.mood = 'neutral'; st.turn = -0.25; st.look = -0.7; st.armL = at(g, who, -1, bk.x + 90, bk.y + 60); st.armR = at(g, who, 1, bk.x - 90, bk.y + 70);
    if (t > SP.end_f.t - 0.05) { st.mood = 'skeptical'; st.tilt = 0.08; } if (t > e('which')) { st.mood = 'neutral'; st.tilt = 0; st.look = 0; st.turn = 0; st.lookY = -0.2; }
    if (t > e('tv_out')) { st.mood = 'happy'; st.look = -0.6; st.turn = -0.25; } if (t > e('butler')) { st.mood = 'smug'; gest(st, g, who, t, -1, 160); }
    if (t > e('bowl')) { st.mood = 'shock'; st.blink = 0; st.armL = at(g, who, -1, bk.x + 90, bk.y + 60); }
    if (t > e('pick')) { const u = t - e('pick'), hd = G.her; st.mood = 'happy'; st.headFirst = true;
      st.armL = u < 0.4 ? at(g, who, -1, X.her + 60, HY('her') - 150) : wreach(g, -1, -40, HY(FR) + 80, { planar: true }); st.items = { L: u < 0.75 && u > 0.25 ? kernelItem : null }; st.talk = u > 0.45 && u < 0.85 ? Math.abs(Math.sin(u * 20)) * 0.6 : 0; }
    if (t > SP.moral.t + 0.4) { st.mood = 'happy'; st.headFirst = false; st.armL = at(g, who, -1, bk.x + 90, bk.y + 60); st.items = {}; } }
  return st; }
// Priya leans in (hook) around a pivot hidden behind the sofa front
function priPose(t, L) { let rot = 0; if (L === 'hook') rot = -0.12 * (1 - P(t, endOf('hook_f'), endOf('hook_f') + 0.4)) + 0.01 * Math.sin(t * 6);
  if (L === 'o1' && t > ev('o1', 'duck') - 0.05 && t < SP.o1_f.t) rot = 0.06; if (L === 'o4' && t > ev('o4', 'hug')) rot = 0.06 * (1 - P(t, ev('o4', 'scoot') + 0.4, ev('o4', 'scoot') + 0.8));
  if (L === 'o2' && t > ev('o2', 'poke') - 0.1 && t < ev('o2', 'poke') + 0.45) rot = -0.08; return { rot }; }
function putR(c, cfg, st, x, p) { c.save(); c.translate(x, PIV); c.rotate(p.rot); c.translate(0, -PIV); const r = K.put(c, cfg, st, 0, 0); c.restore();
  const dx = r.x, dy = r.y - PIV, cs = Math.cos(p.rot), sn = Math.sin(p.rot); return { x: x + dx * cs - dy * sn, y: PIV + dx * sn + dy * cs, hh: r.hh, r: r.r }; }

// ---------------- world + which characters each shot draws (clean singles: only the tagged character)
const DRAW = { wide: ['her', FR], two: ['her', FR], cover: ['her', FR], her: ['her'], fr: [FR] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const who = DRAW[tag] || DRAW.two, heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); sofaBack(c);
  const cu = cushionState(t, L), bs = bowlState(t, L), bk = bookState(t, L);
  if (cu.up === 0) cushion(c, cu.x, cu.y, cu.s, cu.rot);
  if (who.includes(FR)) heads[FR] = putR(c, PRI, priState(t, L), X[FR] + scootX(t, L), priPose(t, L));
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  sofaFront(c); coffeeTable(c, t, L);
  if (bs.onHead === 0) bowl(c, bs.x, bs.y, 0.85, bs.rot, bs.full);
  if (who.includes(FR) && bk.held !== 'her') { if (bk.held === 'hug') book(c, bk.x, bk.y, bk.s, bk.rot, 0); else if (!(L === 'o4' && bk.held === null && t > ev('o4', 'take'))) book(c, bk.x, bk.y - 20, bk.s, 0.08, 0); else book(c, bk.x, bk.y, bk.s, bk.rot, bk.open); }
  if (who.includes('her') && bk.held === 'her') book(c, bk.x, bk.y, bk.s, bk.rot, bk.open);
  K.mark(c, 'bowl', LAP.x, LAP.y + 30, 150);
  const hd = heads.her;
  if (hd) { // her face gags
    if (L === 'o1' && t > ev('o1', 'tears')) tears(c, hd, clamp((t - ev('o1', 'tears')) / 0.4), t);
    if (L === 'o1' && t > ev('o1', 'rain') + 0.45) stuckPopcorn(c, hd, 5);
    if (cu.up > 0) cushion(c, cu.x, cu.y, cu.s, cu.rot);
    if (L === 'end' && bs.onHead > 0) { const k = bs.onHead, x = lerp(LAP.x, hd.x, k), y = lerp(LAP.y, hd.y - hd.hh * 0.95, k) - Math.sin(k * Math.PI) * 500; bowl(c, x, y, 0.85, lerp(0, Math.PI, k), 0); if (k >= 1) stuckPopcorn(c, { ...hd, y: hd.y + 40 }, 6); } }
  if (heads[FR]) { const ph = heads[FR];
    if (L === 'o3' && t > ev('o3', 'zip')) zipper(c, ph, clamp((t - ev('o3', 'zip')) / 0.35));
    if (L === 'o3' && t > ev('o3', 'key')) { const u = t - ev('o3', 'key'); if (u < 1.0) keyIcon(c, ph.x + 200 + u * 900, ph.y - 100 - u * 900 + u * u * 700, 1.4, u * 12); } }
  popcornFly(c, t, L, heads);
  if (!heads.her) heads.her = OFFL; if (!heads[FR]) heads[FR] = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(15, fy(HY('her'), 0.92, 1100), 0.92, 'cover'), WIDE: S(20, fy(HY('her'), 0.62, 1010), 0.62, 'wide'), TWO: S(15, fy(HY('her'), 0.95, 920), 0.95, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0, 880), 1.0, 'her'), HER_CU: S(X.her + 20, fy(HY('her'), 1.4, 930), 1.4, 'her'), HER_B: S(X.her + 50, fy(HY('her'), 0.9, 900), 0.9, 'her'),
  FR: S(X[FR] - 20, fy(HY(FR), 1.0, 960), 1.0, 'fr'), FR_CU: S(X[FR] - 20, fy(HY(FR), 1.35, 940), 1.35, 'fr'), FR_S: S(X[FR] + 130, fy(HY(FR), 1.0, 960), 1.0, 'fr'),
  TV: U('tv', 1) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  const sp = (id, pre = 0.1, post = 0.27) => speaking(id, t, pre, post);
  if (L === 'hook') { if (t < hev('freeze') - 0.02) return SH.COVER; if (t < hev('tv') - 0.05) return f(SH.HER_CU); if (t < hev('fr') - 0.05) return f(SH.TV); if (t < hev('four') - 0.05) return f(SH.FR_CU); return f(SH.TWO); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < endOf('o1_h') + 0.27) return f(SH.HER_B); if (t < endOf('o1_f') + 0.27) return f(SH.FR); if (t < SP.o1_nar.t + 0.9) return f(SH.HER_CU); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (sp('o2_h')) return f(SH.HER); if (t < e('fun') - 0.05) return f(SH.TWO); if (t < endOf('o2_f') + 0.27) return f(SH.FR_CU); return f(SH.TWO); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (sp('o3_h')) return f(SH.HER); if (t < e('key') + 0.9) return f(SH.FR); const g1 = K.wordT('o3_nar', 'где') ?? SP.o3_nar.t + 1.3, g2 = K.wordT('o3_nar', 'запоминай') ?? SP.o3_nar.t + 2.1;
    if (t < g1 - 0.05) return f(SH.TWO); if (t < g2 - 0.05) return f(SH.TV); return f(SH.HER); }
  if (L === 'o4') { if (t < e('take') - 0.15) return f(SH.WIDE); if (t < e('take') + 0.5) return f(SH.TWO); if (t < e('snatch') - 0.05) return f(SH.HER); if (t < e('scoot') - 0.05) return f(SH.FR); return f(SH.TWO); }
  if (L === 'end') { if (t < SP.end_f.t - 0.05) return f(SH.TWO); if (t < e('tv') - 0.03) return f(SH.FR_S); if (t < e('tv_out')) return f(SH.TV); if (t < endOf('end_f') + 0.05) return f(SH.FR_S); if (t < e('rim') - 0.05) return f(SH.HER_CU); return f(SH.TWO); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'clank']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- TV insert: the heroine's show (English UI) on a solid backdrop
function butler(c, x, y, s, grin, t) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#14101E';
  c.beginPath(); c.moveTo(-70, 0); c.lineTo(-80, -300); c.quadraticCurveTo(0, -340, 80, -300); c.lineTo(70, 0); c.closePath(); c.fill();   // tail coat
  c.beginPath(); c.arc(0, -380, 62, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-26, -310); c.lineTo(26, -310); c.lineTo(0, -200); c.closePath(); c.fill();
  c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(0, -300); c.lineTo(-24, -314); c.lineTo(-24, -286); c.closePath(); c.moveTo(0, -300); c.lineTo(24, -314); c.lineTo(24, -286); c.closePath(); c.fill();
  c.strokeStyle = '#14101E'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(70, -270); c.lineTo(150, -230); c.stroke(); c.fillStyle = '#C9CED6'; c.beginPath(); c.ellipse(170, -238, 80, 14, 0, 0, TAU); c.fill();   // tray
  if (grin > 0) { c.fillStyle = '#FFFFFF'; c.globalAlpha = grin; c.beginPath(); c.ellipse(-22, -392, 12, 8, 0, 0, TAU); c.fill(); c.fillRect(10, -394, 28, 5); c.beginPath(); c.arc(0, -362, 26, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 7; c.strokeStyle = '#FFFFFF'; c.stroke(); c.globalAlpha = 1; }
  c.restore(); }
function tvScreen(c, w, h, t, mode) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2A1E48'); g.addColorStop(1, '#5A3E6A'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = '#FFF4C8'; c.beginPath(); c.arc(w * 0.8, h * 0.2, 46, 0, TAU); c.fill(); c.fillStyle = '#2A1E48'; c.beginPath(); c.arc(w * 0.8 + 20, h * 0.2 - 14, 42, 0, TAU); c.fill();
  c.fillStyle = '#120E20'; c.beginPath(); c.moveTo(w * 0.08, h * 0.78); c.lineTo(w * 0.08, h * 0.42); c.lineTo(w * 0.2, h * 0.3); c.lineTo(w * 0.32, h * 0.42); c.lineTo(w * 0.32, h * 0.34); c.lineTo(w * 0.5, h * 0.22); c.lineTo(w * 0.68, h * 0.34); c.lineTo(w * 0.68, h * 0.78); c.closePath(); c.fill();   // the manor
  c.fillStyle = 'rgba(255,214,110,.85)'; for (let i = 0; i < 8; i++) if (hash(i * 3) > 0.3 || i === 5) c.fillRect(w * (0.12 + (i % 4) * 0.13), h * (0.46 + Math.floor(i / 4) * 0.14), 26, 34);
  const flick = mode === 'end' ? 0 : Math.sin(t * 7) * 0.5 + 0.5;
  if (mode === 'end') { butler(c, w * 0.8, h * 0.8, 0.7, clamp((t - ev('end', 'tv') - 0.3) / 0.2), t); }
  c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, h * 0.8, w, h * 0.2);
  fitTxt(c, 'MURDER AT THE MANOR', 26, h * 0.86, 34, '#FFFFFF', w * 0.66, 'Unb9', 'left');
  const ep = 'S1 · EPISODE 3 OF 10', hl = mode !== 'end';
  if (hl) { UI.font(c, 'Unb9', 30); const tw = c.measureText(ep).width; const k = 1 + 0.06 * Math.sin(t * 8); c.save(); c.translate(26 + tw / 2 + 18, h * 0.93); c.scale(k, k); c.fillStyle = C.pink; rr(c, -tw / 2 - 18, -24, tw + 36, 48, 24); c.fill(); fitTxt(c, ep, 0, 2, 30, '#FFFFFF', tw + 4); c.restore(); }
  else fitTxt(c, ep, 26, h * 0.93, 28, '#C9CED6', w * 0.6, 'Nun9', 'left');
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(w * 0.7, h * 0.92, w * 0.26, 8); c.fillStyle = '#E0474C'; c.fillRect(w * 0.7, h * 0.92, w * 0.26 * 0.3, 8); c.beginPath(); c.arc(w * 0.7 + w * 0.26 * 0.3, h * 0.92 + 4, 10, 0, TAU); c.fill();
  if (mode === 'end') { c.save(); c.globalAlpha = 0.9; c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(0, h * 0.06, w, h * 0.18); c.restore(); fitTxt(c, 'NOW WATCHING', w / 2, h * 0.15, 52, '#F2C14E', w * 0.8, 'Unb9'); }
  c.fillStyle = `rgba(255,255,255,${0.04 * flick})`; c.fillRect(0, 0, w, h); }
function tvView(c, t, L) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, '#2E3658'); g.addColorStop(1, '#151A30'); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.04)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore();
  if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'tv' });
  const t0 = L === 'hook' ? hev('tv') : L === 'end' ? ev('end', 'tv') : (K.wordT('o3_nar', 'где') ?? 0), k = eBack(clamp((t - t0 + 0.03) / 0.25), 1.5), mode = L === 'end' ? 'end' : 'ep';
  c.save(); c.translate(540, 900); c.scale(lerp(0.9, 1, k), lerp(0.9, 1, k)); const w = 940, h = 600;
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -w / 2 - 30 + 14, -h / 2 - 30 + 18, w + 60, h + 60, 30); c.fill(); c.fillStyle = '#14161E'; rr(c, -w / 2 - 30, -h / 2 - 30, w + 60, h + 60, 30); c.fill();
  c.save(); c.beginPath(); rr(c, -w / 2, -h / 2, w, h, 10); c.clip(); c.translate(-w / 2, -h / 2); tvScreen(c, w, h, t, mode); c.restore();
  c.fillStyle = '#14161E'; c.fillRect(-120, h / 2 + 30, 240, 40); c.fillRect(-260, h / 2 + 66, 520, 20); c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.35, 2.6); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 350); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 185, w: 980, h: 330, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
// option plate: pops big at the start of the option (<= 0.6 s), shrinks to a small label at the top, gone before the narrator line
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, nar = SP[sc.id + '_nar'], end = nar ? nar.t - 0.05 : (sc.id === 'o4' ? ev('o4', 'scoot') : sc.e), out = P(t, end - 0.2, end);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.55)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = Math.min(c.measureText(p[1]).width, 700), w = tw + 170, h = 100, s = k * lerp(0.85, Math.min(1.35, 960 / (w + 20)), big), y = 200;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); fitTxt(c, p[0], -w / 2 + 50, 4, 54, C.white, 60);
  fitTxt(c, p[1], -w / 2 + 116, 4, 54, C.oliveD, tw + 2, 'Unb9', 'left'); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + Priya (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gp = G[FR];
    K.put(c, PRI, { t, mood: 'smug', blink: 0, turn: -0.2, look: -0.4, armL: reach(gp, -1, gp.sw * 0.3, gp.ySh + 260, { planar: true }), armR: reach(gp, 1, -gp.sw * 0.2, gp.ySh + 280, { planar: true }) }, 640, 60);
    book(c, 640 + 20, gp.ySh + 60 + 300, 0.8, -0.1, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 260 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0);
    bowl(c, 0, g.headY - g.hh * 0.95, 0.85, Math.PI, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2); c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore();
  if (global.__QA && q > 0.5) global.__QA.ui(c, 'card', { x: 140, y: 220, w: 800, h: 170, k: q, id: 'question' });
  const tw = [wAt('outro', 'один', sp.t + 1.8), wAt('outro', 'два', sp.t + 2.4), wAt('outro', 'три', sp.t + 2.9), wAt('outro', 'четыре', sp.t + 3.2)];
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = i % 2 ? 715 : 285, y = 590 + Math.floor(i / 2) * 260, bump = 1 + 0.07 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -200 + 8, -110 + 12, 400, 220, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 8; rr(c, -200, -110, 400, 220, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 110); c.fillStyle = C.white; c.fillText(p[0], 0, -30); const lab = p[1].split(' '); if (lab.length > 1 && p[1].length > 12) { textFit(c, 'Unb9', 38, lab[0], 360); c.fillText(lab[0], 0, 48); textFit(c, 'Unb9', 38, lab.slice(1).join(' '), 360); c.fillText(lab.slice(1).join(' '), 0, 88); } else { textFit(c, 'Unb9', 40, p[1], 360); c.fillText(p[1], 0, 62); } c.restore();
    if (global.__QA) global.__QA.ui(c, 'card', { x: x - 200, y: y - 110, w: 400, h: 220, k: kk, id: 'btn' + i }); });
  const svT = wAt('outro', 'сохрани', sp.t + 4.6) - 0.15, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.3) / 0.5) * Math.PI), by = 1170;
  if (sk > 0) { c.save(); c.translate(290, by); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -200 + 6, -58 + 10, 400, 116, 58); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -200, -58, 400, 116, 58); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-150, -30); c.lineTo(-110, -30); c.lineTo(-110, 32); c.lineTo(-130, 15); c.lineTo(-150, 32); c.closePath(); c.fill();   // bookmark icon drawn with paths
    textFit(c, 'Unb9', 44, 'СОХРАНИ', 250); c.fillStyle = C.oliveD; c.fillText('СОХРАНИ', 30, 4); c.restore(); }
  const subT = svT + 0.55, bk = eBack(P(t, subT, subT + 0.3), 2);
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(720, by); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -210 + 6, -58 + 10, 420, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -210, -58, 420, 116, 58); c.fill(); c.stroke();
    textFit(c, 'Unb9', 40, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 360); c.fillStyle = C.white; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 760, mv), lerp(by + 330, by + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'two';
  let heads, proj;
  if (tag.startsWith('ui:')) { tvView(c, t, L); heads = { her: OFFL, [FR]: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.26); }
  const names = { [FR]: ['PRIYA', '#3FB6A8'] };
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, heads, proj, { cleanChunks: true, names, hold: { hook_f: -0.3, o1_h: -0.32, o1_f: -0.1, o2_h: -0.12, o2_f: -0.1, o3_h: -0.12, o3_f: -0.1, o4_h: -0.1, o4_f: 0.05, end_f: -0.28 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the moral
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('spoiler', NF, renderFrame);
