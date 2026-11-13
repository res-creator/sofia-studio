// "Врач спрашивает: «Где болит?»" — rubric «Полезное» (scene + 4 answers, worst -> best), hard_cut camera: node wherehurt.js start end out.mp4 | --png=f1,f2
// A London GP's office: the heroine (blue jumper) stands bent with a hand on her lower back — a PINK HOT WATER BOTTLE is tied around her waist;
// Dr Fenwick (white coat, stethoscope, glasses) sits at his desk on a wheeled office chair. Absurd detail: the teaching skeleton in the corner
// wears a striped scarf and has a thermometer in its mouth.
// hook: "So. Where does it hurt?"; narrator: close on her (bottle, steam, wince); «back side» -> teaser: the doctor's shocked, blushing face; the office.
// o1 «В ЛОБ»: "Here. Everywhere. Big ouch." she flails (palms all over herself) -> "Everywhere? Even your eyebrows?" he clicks a penlight ->
//   close-up: the beam lands on her eyebrow, she squints.
// o2 «ВЕЖЛИВО»: "I have a pain in my back side." -> "Your... backside?" he blushes and rolls away on his chair into the wall (bonk) — a red cross:
//   wrong. Narrator: diagram insert (back view: BACKSIDE = the bum, red cross); «Доктор уже у стены» he is pressed against the wall, sweating.
// o3 «КАК НОСИТЕЛЬ»: he rolls back; "I've got a sharp pain in my lower back. It hurts when I bend down." (hand on the lower back, zap; she bends, winces)
//   -> "Right, that's helpful. Let's have a look." he snaps on a blue glove; narrator: diagram (LOWER BACK green tick); tip while she bends again.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: her precise line — his pen scribbles non-stop; «granny» she hunches like a granny (creak); «saint» a halo pops over her head;
//   "...You've just written my notes for me." -> notepad insert (her words, a gold star); he puts the pen down and applauds; the pen rolls off the desk.
// Twist (music silent): he rolls out and leans down for the pen — and freezes (zap, crack); "Ah. Lower back. Sharp. Could I borrow your hot water bottle?"
//   -> she unties the bottle and holds it out; the doctor sits with the pink bottle on his back, relieved; the skeleton nods; moral. End screen 1/2/3/4 + ask.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/wherehurt/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- cast
const HER = { ...BASE.her_lift, top: { type: 'sweater', col: '#8FBCE6' }, bottom: { type: 'jeans', col: '#5F7FB0' }, shoes: { col: '#FFFFFF', acc: '#EE5E9A' } };
const DOC = { ...BASE.reggie, h: 1700, glasses: { col: '#2B2F3A' }, top: { type: 'blazer', col: '#F7F9FC', shirt: '#A9C6F0', tie: '#2F3E5C' }, bottom: { type: 'trousers', col: '#3A4A62' }, shoes: { col: '#2A1E18', acc: null } };
const SEAT = 330;                                   // the doctor sits: upper body dropped by SEAT
const G = { her: geom(HER), doc1: geom(DOC, SEAT) };
const X = { her: -420, doc: 430 };
const DESK0 = 110, DESK1 = 880, DTOP = -760;        // desk (in front of the doctor)
const DOCX_OUT = 1230;                               // o2: pressed against the side wall; twist: rolled out beside the desk
const SKX = -40, SKY = -210, SKS = 0.9;             // the teaching skeleton (back wall, between them)
const BOTC = '#F25C9A', BOTD = '#B83A72';            // hot water bottle

// ---------------- props
// pink hot water bottle (ribbed rubber, neck + cap), (0,0) = centre; steam 0..1
function bottle(c, t, s = 1, rot = 0, steam = 1) { c.save(); c.scale(s, s); c.rotate(rot);
  paint(c, q => { q.m(-70, -95); q.q(-92, -95, -92, -70); q.l(-92, 92); q.q(-92, 115, -68, 115); q.l(68, 115); q.q(92, 115, 92, 92); q.l(92, -70); q.q(92, -95, 70, -95); q.l(30, -95); q.l(26, -130); q.l(-26, -130); q.l(-30, -95); q.z(); }, BOTC, { sd: 5, hd: 3, lw: 4,
    inner: k => { k.strokeStyle = 'rgba(255,255,255,.35)'; k.lineWidth = 7; k.lineCap = 'round'; for (let y = -55; y <= 80; y += 27) { k.beginPath(); k.moveTo(-62, y); k.lineTo(62, y); k.stroke(); } k.fillStyle = 'rgba(255,255,255,.4)'; k.beginPath(); k.ellipse(-60, -40, 12, 40, 0, 0, TAU); k.fill(); } });
  c.fillStyle = '#F7F2E8'; c.strokeStyle = '#8A2A50'; c.lineWidth = 4; rr(c, -34, -160, 68, 36, 8); c.fill(); c.stroke();
  if (steam > 0) { c.strokeStyle = `rgba(255,255,255,${0.8 * steam})`; c.lineWidth = 9; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = (t * 0.7 + i / 3) % 1; c.globalAlpha = (1 - u) * steam; c.beginPath(); c.moveTo(-40 + i * 40, -175 - u * 70); c.quadraticCurveTo(-25 + i * 40 + Math.sin(t * 4 + i) * 12, -205 - u * 70, -40 + i * 40, -235 - u * 70); c.stroke(); } c.globalAlpha = 1; }
  c.restore(); }
// strap around the waist + a bow (drawn over the torso); local coords of the character
function strap(c, g, k = 1) { if (k <= 0) return; const y = -g.h * 0.53, w = g.sw * 0.95; c.save(); c.globalAlpha = k;
  c.fillStyle = '#FFE1EE'; c.strokeStyle = BOTD; c.lineWidth = 3; c.beginPath(); c.moveTo(-w, y - 16); c.quadraticCurveTo(0, y - 4, w, y - 16); c.lineTo(w, y + 12); c.quadraticCurveTo(0, y + 24, -w, y + 12); c.closePath(); c.fill(); c.stroke();
  const bx = w * 0.35, by = y + 4; c.fillStyle = BOTC; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + s * 46, by - 34, bx + s * 52, by); c.quadraticCurveTo(bx + s * 46, by + 34, bx, by); c.fill(); c.stroke(); }
  c.beginPath(); c.arc(bx, by, 11, 0, TAU); c.fill(); c.stroke(); c.restore(); }
// stethoscope around the doctor's neck (local coords)
function stetho(c, g) { const y = g.ySh + 10, w = g.hw * 0.75; c.save(); c.strokeStyle = '#3A4050'; c.lineWidth = 10; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-w, y - 30); c.quadraticCurveTo(-w * 1.1, y + 120, -w * 0.35, y + 200); c.moveTo(w, y - 30); c.quadraticCurveTo(w * 1.1, y + 100, w * 0.55, y + 150); c.stroke();
  c.lineWidth = 7; c.beginPath(); c.moveTo(-w * 0.35, y + 200); c.quadraticCurveTo(-w * 0.1, y + 260, w * 0.2, y + 240); c.stroke();
  c.fillStyle = '#C9D2DA'; c.strokeStyle = '#3A4050'; c.lineWidth = 4; c.beginPath(); c.arc(w * 0.28, y + 236, 22, 0, TAU); c.fill(); c.stroke(); c.restore(); }
// penlight in the hand (+ a beam toward -x when on)
const torchItem = (on = 0) => ctx => { ctx.save(); ctx.translate(-10, 0); ctx.rotate(-0.25); ctx.fillStyle = '#C9D2DA'; ctx.strokeStyle = '#3A4050'; ctx.lineWidth = 3; rr(ctx, -70, -9, 110, 18, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FFE58A'; ctx.beginPath(); ctx.arc(-70, 0, 9, 0, TAU); ctx.fill();
  if (on > 0) { const g = ctx.createLinearGradient(-70, 0, -620, 0); g.addColorStop(0, `rgba(255,240,150,${0.75 * on})`); g.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-70, -8); ctx.lineTo(-620, -70); ctx.lineTo(-620, 70); ctx.lineTo(-70, 8); ctx.closePath(); ctx.fill(); }
  ctx.restore(); };
const penItem = () => ctx => { ctx.save(); ctx.rotate(0.6); ctx.fillStyle = '#2F3E5C'; rr(ctx, -6, -70, 12, 90, 5); ctx.fill(); ctx.fillStyle = '#C9A85A'; ctx.fillRect(-6, -70, 12, 14); ctx.restore(); };
const gloveItem = (u) => ctx => { const sn = u > 0.3 ? 1 : 0, st_ = 1 + (u < 0.3 ? u / 0.3 * 0.6 : 0); ctx.save(); ctx.rotate(-0.3); ctx.scale(1, st_); ctx.fillStyle = '#5FB0E8'; ctx.strokeStyle = '#2E6A9A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, 20); ctx.lineTo(-34, -40); for (let i = 0; i < 4; i++) { ctx.lineTo(-30 + i * 18, -95 + (i === 0 || i === 3 ? 18 : 0)); ctx.lineTo(-22 + i * 18, -40); } ctx.lineTo(34, -30); ctx.lineTo(34, 20); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  if (sn && u < 0.7) { ctx.save(); ctx.strokeStyle = '#FFE14A'; ctx.lineWidth = 7; ctx.lineCap = 'round'; const r = 60 + (u - 0.3) * 200; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.6, -40 + Math.sin(a) * r * 0.6); ctx.lineTo(Math.cos(a) * r, -40 + Math.sin(a) * r); ctx.stroke(); } ctx.restore(); } };
const bottleItem = t => ctx => { ctx.save(); ctx.translate(0, 70); bottle(ctx, t, 0.75, 0.1, 0.8); ctx.restore(); };
// lightning bolt (pain), (x, y) = centre
function bolt(c, x, y, s, k, rot = 0) { if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * k, s * k);
  c.fillStyle = '#FFE14A'; c.strokeStyle = '#2B2F3A'; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-20, -90); c.lineTo(40, -90); c.lineTo(10, -20); c.lineTo(50, -20); c.lineTo(-30, 95); c.lineTo(-5, 10); c.lineTo(-45, 10); c.closePath(); c.fill(); c.stroke(); c.restore(); }
function sweat(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (let i = 0; i < 3; i++) { const u = ((t * 1.4 + i * 0.33) % 1), x = hd.x + (i - 1) * hd.hh * 0.9 + (i === 1 ? hd.hh * 1.3 : 0), y = hd.y - hd.hh * 0.9 + u * hd.hh * 0.9;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.16); c.quadraticCurveTo(x + hd.hh * 0.09, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.09, y, x, y - hd.hh * 0.16); c.fill(); c.stroke(); } c.restore(); }
function blush(c, hd, k, big = 1) { if (k <= 0) return; const h = hd.hh; c.save(); c.globalAlpha = 0.55 * k; c.fillStyle = '#F0506C'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(hd.x + s * 0.5 * h, hd.y + 0.33 * h, 0.24 * h * big, 0.12 * h * big, 0, 0, TAU); c.fill(); } c.restore(); }
function halo(c, hd, t, k) { if (k <= 0) return; const h = hd.hh; c.save(); c.translate(hd.x, hd.y - h * 1.35 + Math.sin(t * 4) * 6); c.scale(k, k); c.strokeStyle = '#F2C14E'; c.lineWidth = h * 0.12; c.shadowColor = 'rgba(255,220,90,.9)'; c.shadowBlur = 20; c.beginPath(); c.ellipse(0, 0, h * 0.75, h * 0.2, 0, 0, TAU); c.stroke(); c.restore();
  c.save(); c.fillStyle = '#FFF2A8'; for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6; UI.star(c, hd.x + Math.cos(a) * h * 1.0, hd.y - h * 1.35 + Math.sin(a) * h * 0.3, h * 0.12 * k, a); } c.restore(); }
// the teaching skeleton on its stand, in a striped scarf, thermometer in its mouth; (x, y) = base on the floor
function skeleton(c, t, x, y, s, nod = 0) { c.save(); c.translate(x, y); c.scale(s, s); const bone = '#F7F2E4', ln = '#9A9078';
  c.fillStyle = '#5A606E'; c.fillRect(-8, -1100, 16, 1100); c.fillRect(-150, -14, 300, 14); for (const dx of [-150, 0, 150]) { c.beginPath(); c.arc(dx, 4, 14, 0, TAU); c.fill(); }
  c.strokeStyle = ln; c.lineCap = 'round'; const B = (x0, y0, x1, y1, w = 22) => { c.lineWidth = w + 8; c.strokeStyle = ln; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.lineWidth = w; c.strokeStyle = bone; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); for (const [px, py] of [[x0, y0], [x1, y1]]) { c.fillStyle = bone; c.beginPath(); c.arc(px, py, w * 0.7, 0, TAU); c.fill(); } };
  // legs + feet
  for (const sx of [-1, 1]) { B(sx * 55, -760, sx * 70, -420, 26); B(sx * 70, -420, sx * 66, -90, 22); B(sx * 66, -90, sx * 110, -70, 16); }
  // pelvis
  paint(c, q => { q.m(-120, -830); q.q(0, -900, 120, -830); q.q(130, -740, 50, -720); q.q(0, -760, -50, -720); q.q(-130, -740, -120, -830); q.z(); }, bone, { sd: 4, hd: 2, lw: 4 });
  // spine
  for (let i = 0; i < 9; i++) { c.fillStyle = bone; c.strokeStyle = ln; c.lineWidth = 4; rr(c, -18, -880 - i * 48, 36, 36, 8); c.fill(); c.stroke(); }
  // ribs
  c.lineWidth = 14; for (let i = 0; i < 5; i++) { const yy = -1220 + i * 58, w_ = 120 - Math.abs(i - 1.5) * 10; c.strokeStyle = ln; c.lineWidth = 20; c.beginPath(); c.moveTo(-14, yy); c.quadraticCurveTo(-w_ - 20, yy + 10, -w_ + 10, yy + 60); c.moveTo(14, yy); c.quadraticCurveTo(w_ + 20, yy + 10, w_ - 10, yy + 60); c.stroke(); c.strokeStyle = bone; c.lineWidth = 12; c.stroke(); }
  // arms (hanging, the right hand gives a little wave)
  B(-130, -1290, -175, -1000, 20); B(-175, -1000, -190, -760, 17); B(130, -1290, 175, -1000, 20); B(175, -1000, 192, -760, 17);
  for (const sx of [-1, 1]) { c.fillStyle = bone; c.beginPath(); c.ellipse(sx * 192, -730, 24, 34, 0, 0, TAU); c.fill(); c.strokeStyle = ln; c.lineWidth = 4; c.stroke(); }
  c.lineWidth = 26; c.strokeStyle = ln; c.beginPath(); c.moveTo(-140, -1300); c.quadraticCurveTo(0, -1260, 140, -1300); c.stroke(); c.lineWidth = 18; c.strokeStyle = bone; c.stroke();
  // skull (nods a little)
  c.save(); c.translate(0, -1420); c.rotate(Math.sin(t * 1.5) * 0.04 + nod * 0.12);
  paint(c, q => { q.m(-92, 10); q.q(-100, -130, 0, -135); q.q(100, -130, 92, 10); q.q(80, 60, 50, 70); q.l(46, 110); q.l(-46, 110); q.l(-50, 70); q.q(-80, 60, -92, 10); q.z(); }, bone, { sd: 5, hd: 3, lw: 4 });
  c.fillStyle = '#3A3530'; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 38, -10, 26, 30, 0, 0, TAU); c.fill(); } c.beginPath(); c.moveTo(0, 22); c.lineTo(-12, 50); c.lineTo(12, 50); c.closePath(); c.fill();
  c.strokeStyle = '#3A3530'; c.lineWidth = 3; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 12, 74); c.lineTo(i * 12, 104); c.stroke(); } c.beginPath(); c.moveTo(-44, 89); c.lineTo(44, 89); c.stroke();
  // thermometer in its mouth (wiggles)
  c.save(); c.translate(18, 90); c.rotate(-0.35 + Math.sin(t * 2.2) * 0.06); c.fillStyle = 'rgba(235,245,250,.95)'; c.strokeStyle = '#6A7A8A'; c.lineWidth = 3; rr(c, 0, -9, 150, 18, 9); c.fill(); c.stroke(); c.fillStyle = '#E0474C'; c.fillRect(8, -3, 100, 6); c.beginPath(); c.arc(150, 0, 13, 0, TAU); c.fill(); c.restore();
  c.restore();
  // striped scarf around the neck, one tail hanging
  paint(c, q => { q.m(-115, -1335); q.q(0, -1290, 115, -1335); q.l(118, -1285); q.q(0, -1240, -118, -1285); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 4, inner: k => { k.fillStyle = '#FFFFFF'; for (let i = -3; i <= 3; i++) k.fillRect(i * 34 - 8, -1350, 16, 120); } });
  c.save(); c.translate(70, -1290); c.rotate(-0.08 + Math.sin(t * 1.7) * 0.05); paint(c, q => { q.m(-34, 0); q.l(34, 0); q.l(30, 300); q.l(-30, 300); q.z(); }, '#E0474C', { sd: 4, hd: 2, lw: 4, inner: k => { k.fillStyle = '#FFFFFF'; for (let y = 30; y < 290; y += 64) k.fillRect(-40, y, 80, 22); } });
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 9, 300); c.lineTo(i * 10, 330); c.stroke(); } c.restore();
  c.restore(); }
// office chair (wheeled); (x, y) = floor centre; part: 'back' | 'front'
function chair(c, x, seatY, part) { c.save(); c.translate(x, 0);
  if (part === 'back') { paint(c, q => { q.m(-210, seatY - 520); q.q(-220, seatY - 620, 0, seatY - 630); q.q(220, seatY - 620, 210, seatY - 520); q.l(190, seatY - 120); q.l(-190, seatY - 120); q.z(); }, '#3A4050', { sd: 6, hd: 3, lw: 4 }); }
  else { c.fillStyle = '#5A606E'; c.fillRect(-16, seatY + 40, 32, -seatY - 120); c.strokeStyle = '#3A4050'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-170, -50); c.lineTo(170, -50); c.moveTo(0, -80); c.lineTo(-90, -40); c.moveTo(0, -80); c.lineTo(90, -40); c.stroke();
    c.fillStyle = '#2B2F3A'; for (const dx of [-170, -90, 0, 90, 170]) { c.beginPath(); c.arc(dx, -26, 24, 0, TAU); c.fill(); }
    paint(c, q => { q.m(-230, seatY - 10); q.q(-240, seatY + 50, -200, seatY + 60); q.l(200, seatY + 60); q.q(240, seatY + 50, 230, seatY - 10); q.z(); }, '#3A4050', { sd: 5, hd: 3, lw: 4 }); }
  c.restore(); }

// ---------------- the GP's office (prerendered, softly blurred)
const BX0 = -3000, BY0 = -4300, BW = 6600, BH = 6200, BS = 0.5;
function drawOffice(c) {
  c.fillStyle = '#DCEFE8'; c.fillRect(BX0, BY0, BW, BH);
  c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = BX0; x < BX0 + BW; x += 200) c.fillRect(x, BY0, 6, BH);
  c.fillStyle = '#F6FBF9'; c.fillRect(BX0, BY0, BW, -3000 - BY0); c.fillStyle = '#B9D8CD'; c.fillRect(BX0, -3020, BW, 30);
  c.fillStyle = '#BFDCD2'; c.fillRect(BX0, -720, BW, 500); c.fillStyle = '#9FC4B8'; c.fillRect(BX0, -730, BW, 20);   // wainscot
  // eye chart (left)
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-1500 + 14, -2300 + 18, 520, 760); c.fillStyle = '#FFFFFF'; c.fillRect(-1500, -2300, 520, 760); c.strokeStyle = '#9AA6B0'; c.lineWidth = 6; c.strokeRect(-1500, -2300, 520, 760);
  c.fillStyle = '#2B2F3A'; c.textAlign = 'center'; c.textBaseline = 'middle'; [['E', 170], ['F P', 110], ['T O Z', 80], ['L P E D', 60], ['P E C F D', 44], ['E D F C Z P', 32]].forEach(([s, sz], i) => { c.font = `${sz}px Unb9`; c.fillText(s, -1240, -2190 + [0, 150, 270, 370, 460, 540][i]); });
  c.fillStyle = '#E0474C'; c.fillRect(-1470, -1840, 460, 5);
  // examination couch with a paper roll (far left)
  paint(c, q => { q.m(-2300, -640); q.l(-1250, -640); q.l(-1250, -540); q.l(-2300, -540); q.z(); }, '#5FA8A0', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#FFFFFF'; c.fillRect(-2250, -660, 960, 26); c.fillStyle = '#C9D2DA'; for (const x of [-2250, -1310]) c.fillRect(x, -540, 30, 520);
  // clock + framed diplomas (centre)
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-30, -2560, 110, 0, TAU); c.fill(); c.strokeStyle = '#3A4050'; c.lineWidth = 14; c.stroke(); c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-30, -2560); c.lineTo(-30, -2635); c.moveTo(-30, -2560); c.lineTo(20, -2540); c.stroke();
  for (const [x, y] of [[-560, -2350], [330, -2420]]) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + 10, y + 12, 300, 220); c.fillStyle = '#C9A13A'; c.fillRect(x, y, 300, 220); c.fillStyle = '#FFFDF4'; c.fillRect(x + 22, y + 22, 256, 176); c.fillStyle = '#9AA6B0'; for (let i = 0; i < 4; i++) c.fillRect(x + 50, y + 60 + i * 30, 200 - (i % 2) * 60, 10); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(x + 230, y + 160, 18, 0, TAU); c.fill(); }
  // window with a rainy London (right, above the doctor)
  c.fillStyle = '#FFFFFF'; c.fillRect(560, -2400, 760, 900); const g = c.createLinearGradient(0, -2360, 0, -1540); g.addColorStop(0, '#9FB2C4'); g.addColorStop(1, '#D8E2EA'); c.fillStyle = g; c.fillRect(600, -2360, 680, 820);
  c.fillStyle = '#7A8A9A'; c.fillRect(1040, -2160, 46, 520); paint(c, q => { q.m(1030, -2160); q.l(1063, -2260); q.l(1096, -2160); q.z(); }, '#7A8A9A', { sd: 0, hd: 0, lw: 0 }); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(1063, -2110, 16, 0, TAU); c.fill();   // clock tower
  c.fillStyle = '#8A98A8'; for (const [x, w_, h_] of [[600, 160, 260], [780, 120, 330], [1120, 160, 230]]) c.fillRect(x, -1540 - h_, w_, h_);
  c.fillStyle = '#D9443C'; rr(c, 680, -1730, 260, 150, 18); c.fill(); c.fillStyle = '#F3E3C8'; for (let i = 0; i < 4; i++) { c.fillRect(698 + i * 60, -1712, 44, 34); c.fillRect(698 + i * 60, -1660, 44, 34); } c.fillStyle = '#2B2F3A'; for (const x of [730, 890]) { c.beginPath(); c.arc(x, -1580, 22, 0, TAU); c.fill(); }   // red double-decker
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; for (let i = 0; i < 40; i++) { const x = 610 + (i * 97) % 660, y = -2350 + (i * 211) % 780; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 12, y + 50); c.stroke(); }
  c.fillStyle = '#FFFFFF'; c.fillRect(925, -2360, 26, 820); c.fillRect(600, -1980, 680, 22); c.fillStyle = '#E9EDF1'; c.fillRect(540, -1510, 800, 34);
  // side wall (right) with a tall cabinet and a plant
  c.fillStyle = '#C3E0D6'; c.beginPath(); c.moveTo(1380, BY0); c.lineTo(1380, -150); c.lineTo(BX0 + BW, 100); c.lineTo(BX0 + BW, BY0); c.fill(); c.fillStyle = '#A9CFC2'; c.fillRect(1370, BY0, 24, BH);
  paint(c, q => { q.m(1500, -2100); q.l(2300, -2000); q.l(2300, 60); q.l(1500, -120); q.z(); }, '#E9EDF1', { sd: 6, hd: 3, lw: 4 }); c.fillStyle = '#9AA6B0'; rr(c, 1560, -1300, 20, 160, 10); c.fill();
  c.fillStyle = '#C9784A'; c.beginPath(); c.moveTo(-2600, -200); c.lineTo(-2380, -200); c.lineTo(-2410, 0); c.lineTo(-2570, 0); c.fill(); c.fillStyle = '#5A9A4A'; for (let i = 0; i < 7; i++) { c.save(); c.translate(-2490, -200); c.rotate(-1.2 + i * 0.4); c.beginPath(); c.ellipse(0, -150, 34, 150, 0, 0, TAU); c.fill(); c.restore(); }
  // floor (lino) + skirting
  c.fillStyle = '#B9C6D3'; c.fillRect(BX0, -220, BW, BY0 + BH + 220); c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = BX0; x < BX0 + BW; x += 240) for (let y = -200; y < 1800; y += 240) if (((x + y) / 240) % 2 === 0) c.fillRect(x, y, 240, 240);
  c.fillStyle = '#8FA0B2'; c.fillRect(BX0, -240, BW, 24);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGO = mkBG(drawOffice);
// the desk (front): drawer, papers, pen pot, monitor with a heartbeat line, notepad
function desk(c, t, L, scrib = 0, penOn = 1) {
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse((DESK0 + DESK1) / 2, -10, 420, 30, 0, 0, TAU); c.fill();
  // monitor (behind the desk top, right) + pen pot
  paint(c, q => { q.m(720, -1010); q.l(900, -1010); q.l(900, -860); q.l(720, -860); q.z(); }, '#3A4050', { sd: 5, hd: 3, lw: 4 }); c.fillStyle = '#BFE3F2'; c.fillRect(734, -996, 152, 122);
  c.strokeStyle = '#4CAF6A'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 14; i++) { const x = 738 + i * 10, ph = ((i + t * 8) % 14); const y = -935 - (ph > 6 && ph < 8 ? (ph < 7 ? 40 : -20) : 0); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  c.fillStyle = '#5A606E'; c.fillRect(797, -860, 26, 100); c.fillRect(750, -780, 120, 20);
  paint(c, q => { q.m(DESK0 - 30, DTOP - 20); q.l(DESK1 + 30, DTOP - 20); q.l(DESK1 + 30, DTOP + 30); q.l(DESK0 - 30, DTOP + 30); q.z(); }, '#C98B5A', { sd: 5, hd: 3, lw: 4 });
  paint(c, q => { q.m(DESK0, DTOP + 30); q.l(DESK1, DTOP + 30); q.l(DESK1, -20); q.l(DESK0, -20); q.z(); }, '#B07A4A', { sd: 6, hd: 3, lw: 4 });
  c.fillStyle = '#9C6238'; rr(c, DESK0 + 40, DTOP + 80, DESK1 - DESK0 - 80, 200, 14); c.fill(); c.fillStyle = '#F2C14E'; rr(c, (DESK0 + DESK1) / 2 - 50, DTOP + 170, 100, 18, 9); c.fill();
  // notepad + papers on the desk top
  c.fillStyle = '#FFFDF4'; c.save(); c.translate(330, DTOP - 26); c.rotate(-0.04); c.fillRect(-120, -22, 240, 26); c.restore();
  c.fillStyle = '#F7E9A8'; c.save(); c.translate(520, DTOP - 26); c.rotate(0.03); c.fillRect(-110, -20, 220, 22); c.fillStyle = '#E0474C'; c.fillRect(-110, -24, 220, 8); c.restore();
  c.fillStyle = '#3E73B8'; rr(c, 150, DTOP - 120, 70, 100, 10); c.fill(); c.fillStyle = '#2F3E5C'; for (const dx of [165, 185, 205]) { c.save(); c.translate(dx, DTOP - 120); c.rotate((dx - 185) * 0.01); c.fillRect(-4, -60, 8, 60); c.restore(); }
  if (penOn && L !== 'end') { c.save(); c.translate(540, DTOP - 34); c.rotate(0.2); c.fillStyle = '#2F3E5C'; rr(c, -45, -6, 90, 12, 5); c.fill(); c.restore(); }
  if (scrib > 0) { c.save(); c.strokeStyle = `rgba(43,47,58,${0.7 * scrib})`; c.lineWidth = 5; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const u = (t * 3 + i / 3) % 1; c.globalAlpha = (1 - u) * scrib; c.beginPath(); c.moveTo(250 + i * 40, DTOP - 80 - u * 60); c.lineTo(280 + i * 40, DTOP - 110 - u * 60); c.stroke(); } c.restore(); }
}

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const back = (g, s = -1, drop = 0) => reach(g, s, s * g.sw * 1.02, -g.h * 0.52 + drop, { planar: true });   // hand on the lower back (at the side)
const onDesk = (g, s, dx = 0.6) => reach(g, s, s * g.sw * dx, DTOP - 10, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
// her: { st, bend (rad, toward the doctor), drop, steam, strap }
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'worried', turn: 0.25, look: 0.7, armL: back(g, -1) };
  let bend = 0.12, drop = 40, bot = 1;
  if (L === 'hook') { st.armR = reach(g, 1, g.sw * 1.3, -g.h * 0.36, { planar: true }); st.blink = 0.25;
    if (t > hev('nar')) { st.mood = 'worried'; st.blink = 0.5 + 0.3 * Math.sin(t * 3); }
    if (t > hev('wide')) { st.mood = 'neutral'; st.blink = 0.3; } }
  if (L === 'o1') { st.mood = 'worried';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t; st.mood = 'shock'; bend = 0.05; drop = 20;
      if (t < e('every')) { st.armR = reach(g, 1, g.sw * 0.6, -g.h * 0.58, { planar: true }); st.mood = 'worried'; st.blink = 0.6; }
      else { const w = Math.sin(u * 7); st.armL = reach(g, -1, -g.sw * (1.6 + 0.4 * w), g.ySh + 120 + w * 180, { planar: true }); st.armR = reach(g, 1, g.sw * (1.6 - 0.4 * w), g.ySh + 120 - w * 180, { planar: true }); st.tilt = 0.08 * w; } }
    if (t > endOf('o1_h') + 0.1) { st.mood = 'worried'; st.blink = 0.2; }
    if (t > e('torch')) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('light')) { st.mood = 'annoyed'; st.blink = 0.65; st.look = 0.9; } }
  if (L === 'o2') { st.mood = 'happy'; st.blink = 0.2;
    if (speaking('o2_h', t, 0.05, 0.1)) { gest(st, g, 'her', t, 1, 160); }
    if (t > SP.o2_d.t + 0.4) { st.mood = 'surprised'; st.blink = 0; }
    if (t > e('roll')) { st.mood = 'shock'; st.armR = open(g, 1, 1.9, 60); bend = 0.04; }
    if (t > e('wall')) { st.mood = 'worried'; st.armR = reach(g, 1, g.sw * 0.35, g.ySh - 10, { planar: true }); st.headFirst = true; st.blink = 0.2; } }
  if (L === 'o3') { st.mood = 'neutral'; bend = 0.05; drop = 20; st.armL = down(g, -1);
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'neutral'; gest(st, g, 'her', t, 1, 160); }
    if (t > e('zap') - 0.1) { st.armL = back(g, -1); st.mood = 'worried'; }
    if (t > e('bend') && t < e('bend') + 1.2) { const k = Math.sin(clamp((t - e('bend')) / 1.2) * Math.PI); bend = 0.05 + 0.3 * k; drop = 20 + 120 * k; st.mood = 'worried'; st.blink = 0.4; }
    if (t > SP.o3_d.t) { st.mood = 'happy'; st.blink = 0.2; }
    if (t > e('tip') - 0.05) { const k = Math.sin(clamp((t - e('tip')) / 1.6) * Math.PI); bend = 0.05 + 0.3 * k; drop = 20 + 120 * k; st.mood = k > 0.4 ? 'worried' : 'neutral'; st.armL = back(g, -1); } }
  if (L === 'o4') { st.mood = 'smug'; bend = 0.02; drop = 0; st.blink = 0.3; st.armL = back(g, -1);
    if (speaking('o4_h', t, 0.05, 0.1)) { st.mood = 'happy'; gest(st, g, 'her', t, 1, 150); }
    if (t > e('granny') && t < e('granny') + 0.85) { const k = Math.sin(clamp((t - e('granny')) / 0.85) * Math.PI); bend = 0.02 + 0.35 * k; drop = 160 * k; st.mood = 'tired'; st.blink = 0.5; }
    if (t > e('halo')) { st.mood = 'smug'; st.blink = 0.55; st.armR = down(g, 1); }
    if (t > SP.o4_d.t) { st.mood = 'happy'; st.blink = 0; } }
  if (L === 'end') { st.mood = 'surprised'; bend = 0.02; drop = 0; st.blink = 0; st.armL = back(g, -1);
    if (t > e('ask')) { st.mood = 'happy'; st.armR = reach(g, 1, g.sw * 2.3, g.ySh + 140, { planar: true }); st.items = { R: bottleItem(t) }; bot = 0; st.armL = down(g, -1); }
    if (t > e('give')) { st.armR = open(g, 1, 1.6, 140); st.items = {}; st.laugh = true; st.mood = 'happy'; st.blink = 0.6; } }
  return { st, bend, drop, bot }; }
function docState(t, L) { const g = G.doc1, e = k => ev(L, k), st = { ...base(g, t, 'doc1'), mood: 'happy', turn: -0.25, look: -0.7, legPose: 'sit', drop: SEAT, armL: onDesk(g, -1), armR: onDesk(g, 1) };
  let x = X.doc, lean = 0, blushK = 0, sweatK = 0, scrib = 0, glove = 0, bottleOn = 0;
  if (L === 'hook') { st.items = { R: penItem() };
    if (speaking('hook_d', t, 0.05, 0.1)) { st.armL = open(g, -1, 1.5, 200); }
    if (t > hev('bs')) { st.mood = 'shock'; st.blink = 0; blushK = clamp((t - hev('bs')) / 0.3); st.armL = onDesk(g, -1); }
    if (t > hev('wide')) { st.mood = 'neutral'; blushK = 0; } }
  if (L === 'o1') { st.mood = 'neutral';
    if (speaking('o1_h', t, 0.05, 0.1)) { st.mood = 'surprised'; st.blink = 0; }
    if (speaking('o1_d', t, 0.05, 0.1)) { st.mood = 'skeptical'; }
    if (t > e('torch') - 0.2) { st.mood = 'happy'; st.armR = reach(g, 1, -g.sw * 0.2, g.ySh + 90, { planar: true }); st.items = { R: torchItem(t > e('torch') ? 1 : 0) }; } }
  if (L === 'o2') { st.mood = 'neutral'; st.items = { R: penItem() };
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'happy'; }
    if (t > SP.o2_h.t + 1.5) { st.mood = 'surprised'; st.blink = 0; }
    if (t > SP.o2_d.t) { st.mood = 'shock'; blushK = clamp((t - SP.o2_d.t) / 0.4); st.armL = reach(g, -1, -g.sw * 1.45, g.ySh - 110, { planar: true }); st.armR = reach(g, 1, g.sw * 1.45, g.ySh - 110, { planar: true }); st.items = {}; }
    if (t > e('roll')) { const k = eOut(clamp((t - e('roll')) / 0.55)); x = lerp(X.doc, DOCX_OUT, k); st.armL = open(g, -1, 1.5, -10); st.armR = open(g, 1, 1.5, -10); st.mood = 'shock'; blushK = 1; }
    if (t > e('roll') + 0.6) { sweatK = clamp((t - e('roll') - 0.6) / 0.3); st.mood = 'worried'; st.look = -0.9; } }
  if (L === 'o3') { const k = eIO(clamp((t - SC.o3.s) / 0.45)); x = lerp(DOCX_OUT, X.doc, k); st.mood = 'neutral'; st.items = { R: penItem() };
    if (speaking('o3_h', t, 0.05, 0.1)) { st.mood = 'happy'; st.blink = 0.2; }
    if (speaking('o3_d', t, 0.05, 0.1)) { st.mood = 'happy'; st.headY = Math.abs(Math.sin((t - SP.o3_d.t) * 6)) * 10; st.armL = open(g, -1, 1.4, 200); }
    if (t > e('glove')) { const u = t - e('glove'); glove = 1; st.items = { R: gloveItem(u) }; st.armR = reach(g, 1, g.sw * 1.3, g.ySh - 60 + Math.min(u, 0.3) * 120, { planar: true }); st.armL = reach(g, -1, g.sw * 0.9, g.ySh - 20 + Math.min(u, 0.3) * 120, { planar: true }); st.mood = 'smug'; st.blink = 0.4; }
    if (t > SP.o3_nar.t) { glove = 1; st.armL = onDesk(g, -1); st.armR = open(g, 1, 1.3, 150); st.mood = 'happy'; } }
  if (L === 'o4') { st.mood = 'neutral'; st.items = { R: penItem() };
    if (t > ev('o4', 'scrib') && t < endOf('o4_h') + 0.1) { scrib = 1; st.mood = 'surprised'; st.lookY = 0.45; st.look = -0.2; st.armR = reach(g, 1, g.sw * (0.4 + 0.15 * Math.sin(t * 30)), DTOP - 60 + Math.cos(t * 23) * 12, { planar: true }); }
    if (t > SP.o4_d.t - 0.1) { st.mood = 'happy'; st.lookY = 0; st.look = -0.7; }
    if (t > e('notes')) { st.items = {}; st.armR = onDesk(g, 1); }
    if (t > e('clap') - 0.1 && t < e('fall')) { const cl = Math.abs(Math.sin((t - e('clap')) * 11)); st.items = {}; st.armL = reach(g, -1, -g.sw * (0.25 + 0.35 * cl), g.ySh + 90, { planar: true }); st.armR = reach(g, 1, g.sw * (0.25 + 0.35 * cl), g.ySh + 90, { planar: true }); st.laugh = true; st.blink = 0.8; }
    if (t > e('fall')) { st.items = {}; st.mood = 'surprised'; st.lookY = 0.5; st.look = 0.4; st.armL = onDesk(g, -1); st.armR = onDesk(g, 1); } }
  if (L === 'end') { const u = t - e('bend'); x = lerp(X.doc, DOCX_OUT, eOut(clamp(u / 0.45))); st.items = {}; st.armL = onDesk(g, -1, 0.5); st.armR = down(g, 1);
    lean = 0.42 * eIO(clamp((u - 0.3) / 0.45)); st.mood = 'neutral'; st.lookY = 0.6; st.look = 0.5;
    st.armR = reach(g, 1, g.sw * 1.9, -g.h * 0.47 + SEAT + 120, { planar: true });
    if (t > e('freeze')) { st.mood = 'shock'; st.blink = 0; st.lookY = 0; st.look = -0.4; sweatK = clamp((t - e('freeze')) / 0.3); st.tilt = Math.sin(t * 40) * 0.01; }
    if (speaking('end_d', t, 0, 0.1)) { st.mood = t > e('ask') ? 'worried' : 'shock'; }
    if (t > e('give')) { const k = eOut(clamp((t - e('give')) / 0.5)); lean = lerp(0.42, 0, k); bottleOn = 1; st.mood = 'happy'; st.blink = 0.8; sweatK = 0; st.armR = down(g, 1); st.armL = open(g, -1, 1.4, 150); st.lookY = 0; } }
  return { st, x, lean, blushK, sweatK, scrib, glove, bottleOn }; }
// draws a character with the upper body rotated by ang around the hip (legs stay); returns the head
function putBent(c, cfg, g, st, x, ang, behind) {
  const hipY = -g.h * 0.47 + (st.drop || 0);
  if (Math.abs(ang) < 1e-3 && !behind) return K.put(c, cfg, st, x, 0);
  c.save(); c.beginPath(); c.rect(x - 2000, hipY - 10, 4000, 4000); c.clip(); K.put(c, cfg, { ...st, noArms: true }, x, 0); c.restore();
  c.save(); c.translate(x, hipY); c.rotate(ang); c.translate(-x, -hipY); if (behind) { c.save(); c.translate(x, 0); behind(c); c.restore(); } const hd = K.put(c, cfg, { ...st, legs: false }, x, 0); const M = c.getTransform(); c.restore();
  const cs = Math.cos(ang), sn = Math.sin(ang), dx = hd.x - x, dy = hd.y - hipY; return { ...hd, x: x + dx * cs - dy * sn, y: hipY + dx * sn + dy * cs }; }

// ---------------- world
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function world(c, t, L, tag) { const heads = {};
  c.drawImage(BGO, BX0, BY0, BW, BH);
  const nod = L === 'end' && t > ev('end', 'give') ? Math.sin(clamp((t - ev('end', 'give')) / 1.2) * Math.PI * 3) : 0;
  skeleton(c, t, SKX, SKY, SKS, nod); K.mark(c, 'skeleton', SKX, SKY - 1300 * SKS, 160);
  // doctor (chair back, legs, upper body), then the desk, then the heroine
  const D = docState(t, L), g = G.doc1, seatY = -g.h * 0.47 + SEAT + 10;
  const dEff = D.x;
  chair(c, dEff, seatY, 'back');
  if (D.bottleOn) { c.save(); c.translate(dEff - g.sw * 0.85, -g.h * 0.55 + SEAT); bottle(c, t, 0.85, -0.25, 1); c.restore(); }
  D.st.afterTorso = (ctx) => { stetho(ctx, g); if (D.bottleOn) strap(ctx, { ...g, h: g.h - SEAT * 1.6 }, 1); };
  if (D.glove) { D.st.front = (ctx, o) => { const a = D.st.armR; }; }
  const hd = putBent(c, DOC, g, D.st, dEff, D.lean, null);
  chair(c, dEff, seatY, 'front');
  if (D.glove && hd) { /* blue glove = a blue hand: drawn as a small mitt at the right hand position is handled by the arm colour below */ }
  heads.doc1 = hd;
  const deskShow = !(tag === 'docout');
  desk(c, t, L, D.scrib, !(L === 'o4' && t > ev('o4', 'fall')));
  // the falling pen (o4) and the pen on the floor (twist)
  if (L === 'o4' && t > ev('o4', 'fall')) { const u = t - ev('o4', 'fall'); const fx = u < 0.55 ? lerp(560, DESK1 + 80, clamp(u / 0.3)) : lerp(DESK1 + 80, DOCX_OUT + 300, eOut(clamp((u - 0.55) / 0.6))), fy = u < 0.3 ? DTOP - 34 : lerp(DTOP - 34, -30, clamp((u - 0.3) / 0.25) ** 2); c.save(); c.translate(fx, fy); c.rotate(u * 9); c.fillStyle = '#2F3E5C'; rr(c, -45, -6, 90, 12, 5); c.fill(); c.restore(); }
  if (L === 'end') { const picked = t > ev('end', 'give'); if (!picked) { c.save(); c.translate(DOCX_OUT + 300, -30); c.rotate(0.1); c.scale(1.8, 1.8); c.fillStyle = '#2F3E5C'; rr(c, -45, -6, 90, 12, 5); c.fill(); c.restore(); } }
  if (hd) { blush(c, hd, D.blushK, 1.3); sweat(c, hd, t, D.sweatK); }
  if (L === 'end' && t > ev('end', 'freeze') && t < ev('end', 'give')) { const k = eBack(clamp((t - ev('end', 'freeze')) / 0.2), 2); const hipY = -g.h * 0.47 + SEAT; bolt(c, dEff - g.sw * 1.15, hipY - 150, 1.0, k, -0.2); bolt(c, dEff + g.sw * 1.15, hipY - 200, 0.7, k, 0.3); }
  if (L === 'o2' && t > ev('o2', 'roll') && t < ev('o2', 'roll') + 0.6) { const u = t - ev('o2', 'roll'); c.save(); c.strokeStyle = 'rgba(43,47,58,.5)'; c.lineWidth = 10; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const xx = dEff - 330 - i * 30, yy = seatY - 380 + i * 120; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx - 220, yy); c.stroke(); } c.restore(); }
  if (L === 'o2' && t > ev('o2', 'roll') + 0.55 && t < ev('o2', 'roll') + 1.0) { const k = 1 - clamp((t - ev('o2', 'roll') - 0.55) / 0.45); c.save(); c.strokeStyle = `rgba(43,47,58,${k})`; c.lineWidth = 9; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; c.beginPath(); c.moveTo(dEff + 260 + Math.cos(a) * 40, seatY - 300 + Math.sin(a) * 200); c.lineTo(dEff + 260 + Math.cos(a) * 120, seatY - 300 + Math.sin(a) * 260); c.stroke(); } c.restore(); }
  // heroine
  const Hs = herState(t, L), gh = G.her;
  Hs.st.drop = Hs.drop; Hs.st.afterTorso = ctx => strap(ctx, gh, Hs.bot);
  const behind = Hs.bot ? ctx => { ctx.save(); ctx.translate(-gh.sw * 1.0, -gh.h * 0.55); bottle(ctx, t, 0.95, -0.22, 1); ctx.restore(); K.mark(ctx, 'bottle', -gh.sw * 1.0, -gh.h * 0.55, 120); } : null;
  const hh = putBent(c, HER, gh, Hs.st, X.her, Hs.bend, behind);
  heads.her = hh;
  if (L === 'o3') { const z = ev('o3', 'zap'), b_ = ev('o3', 'bend'), tp = ev('o3', 'tip'); const k = Math.max(eBack(clamp((t - z) / 0.2), 2) * (1 - clamp((t - z - 0.9) / 0.2)), (t > b_ + 0.25 && t < b_ + 1.2) ? 1 : 0, (t > tp + 0.4 && t < tp + 1.5) ? 1 : 0);
    if (k > 0) { const hipY = -gh.h * 0.47 + Hs.drop; bolt(c, X.her - gh.sw * 1.55, hipY - 140, 0.9, k, -0.25); } }
  if (L === 'o4' && t > ev('o4', 'halo')) halo(c, hh, t, eBack(clamp((t - ev('o4', 'halo')) / 0.3), 2));
  if (L === 'o1' && t > ev('o1', 'light')) { const k = clamp((t - ev('o1', 'light')) / 0.15); const ex = hh.x + hh.hh * 0.1, ey = hh.y - hh.hh * 0.32; const gr = c.createRadialGradient(ex, ey, 0, ex, ey, hh.hh * 0.6); gr.addColorStop(0, `rgba(255,250,200,${0.9 * k})`); gr.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = gr; c.beginPath(); c.arc(ex, ey, hh.hh * 0.6, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,240,150,${0.35 * k})`; c.beginPath(); c.moveTo(ex - 20, ey - 40); c.lineTo(ex + 2400, ey - 400); c.lineTo(ex + 2400, ey + 300); c.lineTo(ex - 20, ey + 40); c.closePath(); c.fill(); }
  if (L === 'end' && t > ev('end', 'give')) { /* skeleton nods (above) */ }
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(-40, fy(HY('her'), 0.7, 760), 0.7, 'cover'), WIDE: S(40, fy(HY('her'), 0.48, 860), 0.48, 'wide'),
  TWO: S(0, fy(HY('her'), 0.64, 820), 0.64, 'two'),
  HER: S(X.her + 60, fy(HY('her'), 0.95, 780), 0.95, 'her'), HER_CU: S(X.her + 40, fy(HY('her'), 1.9, 900), 1.9, 'her'),
  DOC: S(X.doc - 20, fy(HY('doc1'), 1.0, 880), 1.0, 'doc'), DOC_CU: S(X.doc - 20, fy(HY('doc1'), 1.3, 900), 1.3, 'doc'),
  WALL: S(430, fy(HY('her'), 0.45, 900), 0.45, 'wide'), OUT: S(DOCX_OUT - 120, fy(HY('doc1'), 0.8, 820), 0.8, 'doc'),
  DIAG: U('diag', 1), NOTES: U('notes', 2) };
const HO = 0.12;   // cut to the next speaker this long before the line starts
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('nar') - 0.02) return SH.COVER; if (t < hev('bs') - 0.02) return f(SH.HER); if (t < hev('wide') - 0.02) return f(SH.DOC_CU); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - HO) return f(SH.WIDE); if (t < SP.o1_d.t - HO) return f(SH.HER); if (t < e('light') - 0.02) return f(SH.DOC); return f(SH.HER_CU); }
  if (L === 'o2') { if (t < SP.o2_h.t - HO) return f(SH.WIDE); if (t < SP.o2_d.t - HO) return f(SH.HER); if (t < e('roll') - 0.02) return f(SH.DOC_CU); if (t < e('diag') - 0.02) return f(SH.WALL); if (t < e('wall') - 0.02) return f(SH.DIAG); return f(SH.WALL); }
  if (L === 'o3') { if (t < SP.o3_h.t - HO) return f(SH.WIDE); if (t < SP.o3_d.t - HO) return f(SH.HER); if (t < SP.o3_nar.t - 0.02) return f(SH.DOC); if (t < e('diag') - 0.02) return f(SH.TWO); if (t < e('tip') - 0.05) return f(SH.DIAG); return f(SH.HER); }
  if (L === 'o4') { if (t < SP.o4_h.t - HO) return f(SH.WIDE); if (t < e('scrib') - 0.02) return f(SH.HER); if (t < e('granny') - 0.02) return f(SH.TWO); if (t < SP.o4_d.t - HO) return f(SH.HER); if (t < e('notes') - 0.02) return f(SH.DOC); if (t < e('clap') - 0.02) return f(SH.NOTES); if (t < e('fall') - 0.02) return f(SH.DOC); return f(SH.TWO); }
  if (L === 'end') { if (t < e('ask') - 0.02) return f(SH.OUT); return f(SH.WALL); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'crack']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.1)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// body diagram (back view): o2 = BACKSIDE (the bum) red cross; o3 = LOWER BACK green tick (+ BACKSIDE small, crossed)
function diagView(c, t) { const good = sceneAt(t).id === 'o3', t0 = good ? ev('o3', 'diag') : ev('o2', 'diag'), u = t - t0;
  backdrop(c, t, good ? '#E3F4E6' : '#FBE3E6', good ? '#B9E0C2' : '#F2B8C0'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'diag' });
  const k = eBack(clamp((u + 0.05) / 0.3), 1.5); c.save(); c.translate(540, 860); c.scale(k, k);
  // paper card
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, -400 + 12, -560 + 16, 800, 1120, 40); c.fill(); c.fillStyle = '#FFFDF4'; rr(c, -400, -560, 800, 1120, 40); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 7; c.stroke();
  // figure from behind
  const sk = '#F2C9A8', sd = '#C98B6A';
  c.fillStyle = '#3A2820'; c.beginPath(); c.arc(0, -400, 92, 0, TAU); c.fill();
  c.fillStyle = sk; c.fillRect(-28, -320, 56, 50);
  paint(c, q => { q.m(-180, -270); q.q(0, -300, 180, -270); q.q(215, -250, 215, -190); q.l(160, 20); q.l(-160, 20); q.l(-215, -190); q.q(-215, -250, -180, -270); q.z(); }, '#8FBCE6', { sd: 5, hd: 3, lw: 5 });
  for (const s of [-1, 1]) paint(c, q => { q.m(s * 205, -230); q.l(s * 270, 40); q.l(s * 230, 60); q.l(s * 165, -150); q.z(); }, '#8FBCE6', { sd: 4, hd: 2, lw: 5 });
  for (const s of [-1, 1]) { c.fillStyle = sk; c.beginPath(); c.arc(s * 252, 80, 32, 0, TAU); c.fill(); }
  // jeans: bum + legs
  for (const s of [-1, 1]) paint(c, q => { q.m(s * 8, 120); q.l(s * 160, 110); q.l(s * 150, 470); q.l(s * 40, 470); q.z(); }, '#5F7FB0', { sd: 4, hd: 2, lw: 5 });
  paint(c, q => { q.m(-165, 20); q.l(165, 20); q.q(190, 120, 150, 190); q.q(80, 225, 0, 175); q.q(-80, 225, -150, 190); q.q(-190, 120, -165, 20); q.z(); }, '#5F7FB0', { sd: 5, hd: 3, lw: 5 });
  c.strokeStyle = '#3E5A86'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 30); c.lineTo(0, 175); c.stroke();
  // zones
  const pul = 0.75 + 0.25 * Math.sin(u * 8);
  const zone = (y, rx, ry, col, kk) => { if (kk <= 0) return; c.save(); c.globalAlpha = 0.55 * kk * pul; c.fillStyle = col; c.beginPath(); c.ellipse(0, y, rx, ry, 0, 0, TAU); c.fill(); c.globalAlpha = kk; c.strokeStyle = col; c.lineWidth = 8; c.setLineDash([18, 12]); c.stroke(); c.setLineDash([]); c.restore(); };
  const zk = clamp((u - 0.2) / 0.25);
  if (!good) { zone(120, 175, 95, '#E0474C', zk); }
  else { zone(-30, 170, 60, '#4CAF6A', zk); zone(125, 165, 85, '#9AA6B0', zk * 0.6); }
  const lk = eBack(clamp((u - 0.35) / 0.3), 2);
  const label = (txt, y, ay, col, sz, kk, mark) => { if (kk <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round'; c.globalAlpha = kk; c.beginPath(); c.moveTo(0, y + (ay > y ? sz * 0.7 : -sz * 0.7)); c.lineTo(0, ay); c.stroke(); c.restore();
    c.save(); c.translate(0, y); c.scale(kk, kk); UI.font(c, 'Unb9', sz); const w = c.measureText(txt).width + 70;
    c.fillStyle = col; rr(c, -w / 2, -sz * 0.75, w, sz * 1.5, sz * 0.75); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 4);
    if (mark) (mark === 'x' ? UI.cross : UI.check)(c, w / 2 + 6, -sz * 0.7, sz * 0.8); c.restore(); };
  if (!good) label('BACKSIDE', 330, 150, '#E0474C', 60, lk, 'x');
  else { label('LOWER BACK', -175, -50, '#3E9A58', 60, lk, 'v'); label('BACKSIDE', 340, 170, '#8A94A0', 40, lk * 0.9, 'x'); }
  c.restore(); }
// o4: the doctor's notepad: her words, written down; a gold star
function notesView(c, t) { backdrop(c, t, '#E8F0FA', '#BFD2EA'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'notes' });
  const u = t - ev('o4', 'notes'), k = eBack(clamp((u + 0.05) / 0.3), 1.5); c.save(); c.translate(540, 900); c.scale(k, k); c.rotate(-0.03);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-380 + 14, -520 + 18, 760, 1040); c.fillStyle = '#FFF8D8'; c.fillRect(-380, -520, 760, 1040);
  c.fillStyle = '#3E73B8'; c.fillRect(-380, -520, 760, 70); c.fillStyle = '#C9D2DA'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-320 + i * 80, -485, 14, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(127,176,216,.6)'; c.lineWidth = 3; for (let y = -360; y < 500; y += 90) { c.beginPath(); c.moveTo(-350, y + 40); c.lineTo(350, y + 40); c.stroke(); } c.strokeStyle = 'rgba(224,71,76,.5)'; c.beginPath(); c.moveTo(-280, -450); c.lineTo(-280, 520); c.stroke();
  const L_ = [['PATIENT NOTES', 46, '#3E73B8'], ['LOWER BACK', 64, '#2B2F3A'], ['SHARP — BENDING', 54, '#2B2F3A'], ['DULL — SITTING', 54, '#2B2F3A']];
  L_.forEach(([s, sz, col], i) => { const kk = clamp((u - i * 0.12) / 0.15); if (kk <= 0) return; c.save(); c.globalAlpha = kk; fitTxt(c, s, 30, -350 + i * 140, sz, col, 600, 'Unb9'); c.restore(); });
  const sk = eBack(clamp((u - 0.55) / 0.25), 2.5); if (sk > 0) { c.save(); c.translate(200, 330); c.scale(sk, sk); c.rotate(u * 0.5); c.fillStyle = '#F2C14E'; c.strokeStyle = '#B8862A'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 60 : 140; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); c.restore(); }
  c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 66, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 110, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112); c.restore();
  // rubric label «ПОЛЕЗНОЕ»
  c.save(); c.globalAlpha = a; c.translate(850, 92); c.rotate(0.04); UI.font(c, 'Unb9', 36); const w = c.measureText('ПОЛЕЗНОЕ').width + 50; c.fillStyle = C.green; rr(c, -w / 2, -30, w, 60, 30); c.fill(); c.strokeStyle = C.oliveD; c.lineWidth = 5; c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ПОЛЕЗНОЕ', 0, 3); c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 98, w: 980, h: 367, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4);
  // o2: a red cross on the plate — the answer is wrong (backside = the bum)
  if (sc.id === 'o2') { const xk = eBack(P(t, ev('o2', 'roll') + 0.7, ev('o2', 'roll') + 0.95), 2.5); if (xk > 0) UI.cross(c, w / 2 + 10, -10, 52 * xk); }
  if (sc.id === 'o3' || sc.id === 'o4') { const xk = eBack(P(t, SP[sc.id + '_d'].t + 0.2, SP[sc.id + '_d'].t + 0.45), 2.5); if (xk > 0) UI.check(c, w / 2 + 10, -10, 52 * xk); }
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor; then «ГРЕЛКА ИЛИ ТАБЛЕТКА?»
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function pillIcon(c, x, y, s) { c.save(); c.translate(x, y); c.rotate(-0.6); c.scale(s, s); c.fillStyle = '#FFFFFF'; c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -90, -38, 180, 76, 38); c.fill(); c.stroke(); c.save(); c.beginPath(); rr(c, -90, -38, 180, 76, 38); c.clip(); c.fillStyle = '#3E73B8'; c.fillRect(0, -40, 92, 80); c.restore(); c.beginPath(); rr(c, -90, -38, 180, 76, 38); c.stroke(); c.restore(); }
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, { textFit, strokeText, font } = UI, askT = SC.outro.ev.ask;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine + doctor (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gd = geom(DOC);
    c.save(); c.translate(640 - gd.sw * 0.95, -gd.h * 0.55); bottle(c, t, 0.9, -0.25, 1); c.restore();
    K.put(c, DOC, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, afterTorso: ctx => { stetho(ctx, gd); strap(ctx, gd, 1); }, armL: reach(gd, -1, -gd.sw * 1.6, gd.ySh + 60 + Math.sin(t * 7) * 20, { planar: true }), armR: down(gd, 1) }, 640, 0);
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0, look: 0, armL: reach(g, -1, -g.sw * 2.0, g.ySh - 160 + Math.sin(t * 8) * 30, { planar: true }), armR: reach(g, 1, g.sw * 0.8, g.ySh + 330), items: {} }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - P(t, askT - 0.15, askT)); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const aq = eBack(P(t, askT, askT + 0.3), 2.2); if (aq > 0) { c.save(); c.translate(540, 300); c.scale(aq, aq); textFit(c, 'Unb9', 84, 'ГРЕЛКА', 600); strokeText(c, 'ГРЕЛКА', 0, -62, C.pink, C.white, 16); textFit(c, 'Unb9', 64, 'ИЛИ ТАБЛЕТКА?', 860); strokeText(c, 'ИЛИ ТАБЛЕТКА?', 0, 42, C.oliveD, C.white, 14); c.restore();
    c.save(); c.translate(150, 250); c.scale(aq, aq); bottle(c, t, 0.6, -0.2, 1); c.restore(); pillIcon(c, 935, 230, 0.7 * aq); }
  const tw = [wAt('outro', 'один', sp.t + 1.3), wAt('outro', 'два', sp.t + 1.7), wAt('outro', 'три', sp.t + 2.0), wAt('outro', 'четыре', sp.t + 2.4)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.15) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.6, sp.t + sp.d - 0.6), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { ({ 'ui:diag': diagView, 'ui:notes': notesView })[tag](c, t); heads = { her: OFFL, doc1: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); }
  const onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) { const p = proj(heads[k]); if (p.x > -60 && p.x < W + 60) onScr[k] = heads[k]; }   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, hold: { hook_d: -0.1, o1_h: -0.22, o1_d: -0.2, o2_h: -0.22, o2_d: -0.2, o3_h: -0.22, o3_d: -0.2, o4_h: -0.15, o4_d: -0.2, end_d: -0.2 } });
  if (L === 'hook') title(c, t);
  if (!tag.startsWith('ui:')) plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('wherehurt', NF, renderFrame);
