// "Авиакомпания потеряла чемодан (а в нём сало)" — rubric «Полезное» (useful4: scene + 4 answers, worst -> best), hard_cut camera: node lostbag.js start end out.mp4 | --png=f1,f2
// Airport baggage claim: an EMPTY carousel — only a trombone in a knitted hat with a «NOBODY'S» tag rides it round and round (absurd detail).
// The heroine (pink jumper) holds up her phone with the photo of her red suitcase; Denise (navy uniform) behind the LOST BAGGAGE desk, bored.
// Hook insert: the phone photo of the red suitcase -> x-ray: grandma's salo inside, glowing.
// o1 «В ЛОБ»: "Bag lost! You find! Fast!" -> "I'm not a sniffer dog, madam." — and she sniffs the air anyway (nose up, left, right).
// o2 «ВЕЖЛИВО»: "Sorry, I think maybe my bag is not here?" -> "Maybe it's just shy." — Denise on her knees at the carousel with a torch; the trombone rides past.
// o3 «КАК НОСИТЕЛЬ»: "I'd like to report a missing bag. Can I get a reference number?" -> the form + the reference slip (insert, stamp); tip.
// o4 «КОРОЛЕВСКИЙ ОТВЕТ»: the grand speech about grandma's salo -> Denise grabs the radio: "Code red. Pork on the loose." — red beacon, siren.
// Twist (music silent): Denise types, raises her brows; insert: the tracker — BAG FOUND, LISBON, FIRST CLASS; "It got an upgrade." Then the moral over the hall.
const fs = require('fs');
const Hq = require('./hq'); const { CAST: BASE } = require('./cast_v2'); const makeUI = require('./ui_v2'); const E = require('./engine_v2');
const { geom, reach } = require('./pose');
const { clamp, lerp, P, eOut, eIn, eIO, eBack, paint, rr, createCanvas } = Hq;
const TL = JSON.parse(fs.readFileSync('eps/lostbag/timeline.json', 'utf8'));
const UI = makeUI(TL); const { SP, SC, sceneAt, C } = UI; const K = require('./ep_kit')(TL, UI); K.stripTags();
const { talk, speaking, endOf } = K;
const W = 1080, HH = 1920, FPS = 30, NF = Math.ceil(TL.dur * FPS), TAU = Math.PI * 2;
const ev = (L, k) => ((SC[L] || {}).ev || {})[k] ?? 1e9;
const hev = k => SC.hook.ev[k];
// handovers: a negative per-line hold (bubble gone BEFORE the line ends) — ui_v2 clamps hold to >= 0.05, so shorten the bubble's span instead
{ const _bub = UI.bubble; UI.bubble = (ctx, sp, t, an, side, name) => _bub(ctx, sp.hold < 0.05 ? { ...sp, d: sp.d + sp.hold - 0.05 } : sp, t, an, side, name); }

// ---------------- cast
const NAVY = '#1F3A6B';
const HER = { ...BASE.her_lift };
const DEN = { ...BASE.linda, hair: { style: 'ponytail', col: '#8A4A2E' }, hairTie: '#F2C14E', necklace: false, top: { type: 'blazer', col: NAVY, shirt: '#F7F9FC', tie: '#F2C14E' }, bottom: { type: 'trousers', col: NAVY }, shoes: { col: '#1E1612', acc: null } };
const G = { her: geom(HER), agent2: geom(DEN), knee: geom(DEN, 430) };
const X = { her: 0, den: 760 };
const DX0 = 380, DX1 = 1040, DTOP = -840;                           // the LOST BAGGAGE desk
const WALL = -300, BTOP = -800, BLIP = -760;                         // back wall base, carousel belt top / rubber lip
const HX0 = -500, HX1 = -290, HCLIP = -400;                          // the hatch the belt comes out of (items are clipped right of HCLIP)
const XU = -1100;                                                    // o2: Denise kneels at the carousel here
function fitTxt(c, s, x, y, size, col, maxW, font = 'Unb9', align = 'center') { UI.textFit(c, font, size, s, maxW); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y); }

// ---------------- props
// the red hard-shell suitcase; (0,0) = bottom centre
function suitcase(c, s = 1, col = '#E0474C') { c.save(); c.scale(s, s);
  c.fillStyle = '#9AA3B2'; c.fillRect(-50, -470, 14, 90); c.fillRect(36, -470, 14, 90); c.fillStyle = '#2B2F3A'; rr(c, -64, -494, 128, 34, 14); c.fill();
  c.fillStyle = '#2B2F3A'; for (const x of [-110, 110]) { c.beginPath(); c.arc(x, -10, 20, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-150, -390); q.q(-150, -400, -130, -400); q.l(130, -400); q.q(150, -400, 150, -380); q.l(150, -40); q.q(150, -22, 130, -22); q.l(-130, -22); q.q(-150, -22, -150, -40); q.z(); }, col, { sd: 14, hd: 7, lw: 5 });
  c.strokeStyle = 'rgba(120,20,30,.35)'; c.lineWidth = 8; for (const x of [-75, 0, 75]) { c.beginPath(); c.moveTo(x, -370); c.lineTo(x, -50); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.28)'; rr(c, -130, -385, 40, 150, 18); c.fill();
  c.fillStyle = '#F2C14E'; c.beginPath(); c.arc(70, -110, 34, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(70, -110, 14, 0, TAU); c.fill();   // sticker
  c.restore(); }
// grandma's salo wrapped in newspaper; (0,0) = centre
function salo(c, s = 1, shades = false) { c.save(); c.scale(s, s);
  paint(c, q => { q.m(-150, -20); q.l(150, -30); q.l(160, 60); q.l(-140, 70); q.z(); }, '#E6E1D3', { sd: 6, hd: 3, lw: 3 });
  c.strokeStyle = 'rgba(60,60,60,.35)'; c.lineWidth = 4; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-120, -2 + k * 16); c.lineTo(120, -10 + k * 16); c.stroke(); }
  paint(c, q => { q.m(-110, -120); q.l(110, -125); q.q(125, -125, 125, -105); q.l(122, 30); q.l(-122, 34); q.l(-125, -100); q.q(-125, -120, -110, -120); q.z(); }, '#FBF6EC', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#F2A7A0'; c.beginPath(); c.moveTo(-122, -38); c.bezierCurveTo(-40, -58, 40, -22, 122, -44); c.lineTo(122, -26); c.bezierCurveTo(40, -6, -40, -40, -122, -20); c.closePath(); c.fill();
  c.fillStyle = '#E58A86'; c.fillRect(-122, 16, 244, 14);
  c.fillStyle = 'rgba(200,170,120,.35)'; for (const [x, y] of [[-70, -90], [30, -100], [80, -70], [-20, -75]]) { c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  paint(c, q => { q.m(-160, 0); q.l(-30, 10); q.l(-20, 80); q.l(-150, 76); q.z(); }, '#EFEBDF', { sd: 4, hd: 2, lw: 3 });
  if (shades) { c.fillStyle = '#1E1612'; for (const x of [-45, 45]) { c.beginPath(); c.ellipse(x, -82, 40, 26, 0, 0, TAU); c.fill(); } c.strokeStyle = '#1E1612'; c.lineWidth = 8; c.beginPath(); c.moveTo(-10, -86); c.lineTo(10, -86); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.4)'; for (const x of [-60, 30]) { c.beginPath(); c.ellipse(x, -90, 12, 7, -0.4, 0, TAU); c.fill(); } }
  c.restore(); }
// drawn heart (no font glyphs)
function heart(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.7, -r * 1.3, 0, -r * 0.45); c.bezierCurveTo(r * 0.7, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9); c.fill(); c.restore(); }
function radioDraw(c, s = 1) { c.save(); c.scale(s, s); c.fillStyle = '#2B2F3A'; rr(c, -30, -120, 60, 120, 10); c.fill(); c.fillStyle = '#1B1E26'; c.fillRect(10, -170, 10, 55); c.fillStyle = '#E0474C'; c.beginPath(); c.arc(-12, -104, 7, 0, TAU); c.fill(); c.fillStyle = '#596070'; for (let k = 0; k < 4; k++) c.fillRect(-20, -80 + k * 14, 40, 6); c.restore(); }
const radioItem = ctx => { ctx.save(); ctx.translate(0, 40); radioDraw(ctx, 1.25); ctx.restore(); };
// her phone, the screen towards the camera: the photo of the red suitcase
function phoneSmall(c, w = 230, h = 410) { c.fillStyle = '#2B2F3A'; rr(c, -w / 2, -h, w, h, 26); c.fill(); c.fillStyle = '#BFE3F5'; rr(c, -w / 2 + 12, -h + 14, w - 24, h - 28, 16); c.fill();
  c.fillStyle = '#9AA3B2'; c.fillRect(-w / 2 + 12, -h * 0.36, w - 24, h * 0.36 - 14); c.save(); c.translate(0, -h * 0.2); suitcase(c, 0.42); c.restore(); }
const phoneItem = ctx => { ctx.save(); ctx.translate(0, 70); phoneSmall(ctx); ctx.restore(); };
// the missing-baggage form + the reference slip (held)
const formItem = ctx => { ctx.save(); ctx.translate(-10, 40); ctx.rotate(-0.08); ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#9AA3B2'; ctx.lineWidth = 3; rr(ctx, -95, -250, 190, 260, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = NAVY; ctx.fillRect(-95, -250, 190, 40); ctx.fillStyle = '#C9CED6'; for (let k = 0; k < 5; k++) ctx.fillRect(-75, -185 + k * 34, 150, 8);
  ctx.fillStyle = '#F2C14E'; ctx.save(); ctx.translate(40, -40); ctx.rotate(0.15); rr(ctx, -50, -30, 100, 60, 6); ctx.fill(); ctx.restore(); ctx.restore(); };
const torchItemR = ctx => { ctx.save(); ctx.scale(-1, 1); torchItem(ctx); ctx.restore(); };
const torchItem = ctx => { ctx.save(); ctx.rotate(-0.2); ctx.fillStyle = '#2B2F3A'; rr(ctx, -110, -18, 120, 36, 10); ctx.fill(); ctx.fillStyle = '#F2C14E'; rr(ctx, -130, -26, 30, 52, 8); ctx.fill(); ctx.restore(); };
function tears(c, hd, t, k) { if (k <= 0) return; c.save(); c.globalAlpha = k; for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const u = ((t * 1.6 + i * 0.5) % 1), x = hd.x + s * hd.hh * 0.42, y = hd.y + hd.hh * 0.05 + u * hd.hh * 0.8;
  c.fillStyle = '#7CC7F2'; c.strokeStyle = '#2E7AB0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - hd.hh * 0.12); c.quadraticCurveTo(x + hd.hh * 0.08, y, x, y + hd.hh * 0.06); c.quadraticCurveTo(x - hd.hh * 0.08, y, x, y - hd.hh * 0.12); c.fill(); c.stroke(); } c.restore(); }

// ---------------- the trombone in a knitted hat (absurd detail): lies on the belt, slide leading (left), bell trailing (right); (0,0) = belt contact, centre
function trombone(c, t) { c.save(); c.translate(0, -8 + Math.sin(t * 9) * 2);
  const gold = '#E8B83A', goldD = '#A87A1A';
  c.lineCap = 'round'; c.strokeStyle = goldD; c.lineWidth = 30; c.beginPath(); c.moveTo(-230, -50); c.lineTo(120, -50); c.moveTo(-230, -120); c.lineTo(150, -120); c.stroke();
  c.strokeStyle = gold; c.lineWidth = 20; c.beginPath(); c.moveTo(-230, -50); c.lineTo(120, -50); c.moveTo(-230, -120); c.lineTo(150, -120); c.stroke();
  c.strokeStyle = gold; c.lineWidth = 20; c.beginPath(); c.arc(-230, -85, 35, Math.PI / 2, Math.PI * 1.5); c.stroke();      // slide bend (leading)
  c.beginPath(); c.arc(120, -85, 35, -Math.PI / 2, Math.PI / 2); c.stroke();
  c.fillStyle = goldD; for (const x of [-60, 60]) c.fillRect(x - 8, -130, 16, 90);                                                 // braces
  // the bell (trailing, right)
  paint(c, q => { q.m(150, -132); q.q(205, -134, 230, -200); q.l(250, -200); q.l(250, 0); q.l(230, 0); q.q(205, -66, 150, -108); q.z(); }, gold, { sd: 6, hd: 3, lw: 4 });
  // knitted hat over the bell: red with white stripes + pompom
  c.save(); c.translate(262, -100); c.rotate(0.12);
  paint(c, q => { q.m(-30, -118); q.q(110, -130, 110, 0); q.q(110, 130, -30, 118); q.z(); }, '#E0474C', { sd: 6, hd: 3, lw: 4 });
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 12; for (const x of [20, 55]) { c.beginPath(); c.moveTo(x, -110 + (x - 20) * 0.6); c.quadraticCurveTo(x + 40, 0, x, 110 - (x - 20) * 0.6); c.stroke(); }
  c.fillStyle = '#F7E6EC'; rr(c, -44, -122, 30, 244, 12); c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 3; for (let y = -110; y < 120; y += 22) { c.beginPath(); c.moveTo(-44, y); c.lineTo(-14, y); c.stroke(); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(118, 0, 30, 0, TAU); c.fill(); c.restore();
  // the luggage tag «NOBODY'S» hanging from the slide
  c.save(); c.translate(-40, -50); c.rotate(0.1 + Math.sin(t * 3) * 0.06); c.strokeStyle = '#2B2F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 30); c.stroke();
  c.fillStyle = '#F2C14E'; c.strokeStyle = '#8A6A1A'; c.lineWidth = 4; rr(c, -120, 30, 240, 96, 12); c.fill(); c.stroke(); fitTxt(c, "NOBODY'S", 0, 80, 54, '#2B2F3A', 210); c.restore();
  c.restore(); }
// trombone laps: it pops out of the hatch again whenever the next wide shot needs it (each lap starts inside the hatch, so the switch is never visible)
const TV = 55, TR0 = -180, TS = 0.75;
const LAPS = [-9.45, ev('o2', 'peek') - (-(XU + 120) + TR0) / TV, ev('end', 'moral') - (880 + TR0) / TV];
const tromX = t => { let l = LAPS[0]; for (const x of LAPS) if (t >= x) l = x; return TR0 - TV * (t - l); };

// ---------------- baggage hall background (prerendered, softly blurred)
const BX0 = -4400, BY0 = -5200, BW = 8800, BH = 7800, BS = 0.5;
function drawHall(c) {
  // ceiling + back wall
  c.fillStyle = '#E9ECF2'; c.fillRect(BX0, BY0, BW, 2000); for (let x = BX0; x < BX0 + BW; x += 700) { c.fillStyle = '#FFFFFF'; c.fillRect(x + 80, BY0 + 1500, 480, 50); }
  const wg = c.createLinearGradient(0, -3200, 0, WALL); wg.addColorStop(0, '#D4DCE6'); wg.addColorStop(1, '#E6EBF1'); c.fillStyle = wg; c.fillRect(BX0, -3200, BW, WALL + 3200);
  c.fillStyle = 'rgba(0,0,0,.05)'; for (let x = BX0; x < BX0 + BW; x += 400) c.fillRect(x, -3200, 6, 2900); for (let y = -3200; y < WALL; y += 400) c.fillRect(BX0, y, BW, 6);
  // windows high up: a plane taxiing outside
  c.fillStyle = '#9CCBE4'; c.fillRect(-4300, -3150, 3300, 700); c.fillStyle = '#C9D1DC'; for (let x = -4300; x <= -1000; x += 550) c.fillRect(x, -3150, 26, 700);
  c.save(); c.translate(-2600, -2700); c.fillStyle = '#F4F6FA'; rr(c, -420, -50, 840, 100, 50); c.fill(); c.fillStyle = '#3FB6A8'; c.beginPath(); c.moveTo(300, -40); c.lineTo(420, -200); c.lineTo(460, -200); c.lineTo(430, -30); c.fill(); c.fillStyle = '#5E7FA0'; for (let i = 0; i < 12; i++) c.fillRect(-300 + i * 50, -20, 22, 20); c.restore();
  // big hanging sign over the carousel: suitcase icon + BAGGAGE CLAIM + belt 3
  c.fillStyle = '#8A93A2'; c.fillRect(-2250, -3200, 16, 900); c.fillRect(-650, -3200, 16, 900);
  c.fillStyle = '#2B2F3A'; rr(c, -2900, -2350, 2900, 330, 30); c.fill();
  c.save(); c.translate(-2700, -2185); c.fillStyle = '#F2C14E'; rr(c, -60, -70, 120, 140, 16); c.fill(); c.fillStyle = '#2B2F3A'; rr(c, -26, -96, 52, 34, 10); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -14, -84, 28, 18, 6); c.fill(); c.restore();
  fitTxt(c, 'BAGGAGE CLAIM', -1500, -2185, 150, '#F2C14E', 2000); c.fillStyle = '#F2C14E'; rr(c, -260, -2300, 220, 230, 24); c.fill(); fitTxt(c, '3', -150, -2180, 190, '#2B2F3A', 200);
  // arrivals screen on the wall: belt 3 — LAST BAG DELIVERED
  c.fillStyle = '#2B2F3A'; rr(c, -3900, -1850, 1400, 760, 26); c.fill(); c.fillStyle = '#10141C'; rr(c, -3870, -1820, 1340, 700, 18); c.fill();
  c.textAlign = 'left'; c.textBaseline = 'middle'; UI.font(c, 'Unb9', 60); c.fillStyle = '#F2C14E'; c.fillText('ARRIVALS', -3820, -1740);
  for (let r = 0; r < 4; r++) { c.fillStyle = r % 2 ? '#1E232E' : '#181C26'; c.fillRect(-3850, -1670 + r * 130, 1300, 120); UI.font(c, 'Unb9', 46); c.fillStyle = '#FFE6A0'; c.fillText(['MADRID', 'PARIS', 'ROME', 'OSLO'][r], -3820, -1610 + r * 130); c.fillStyle = r === 0 ? '#7CF29A' : '#FFE6A0'; c.fillText(r === 0 ? 'BELT 3' : 'LANDED', -3150, -1610 + r * 130); }
  // behind the desk: the BAGGAGE SERVICES wall with shelves of unclaimed things
  c.fillStyle = NAVY; c.fillRect(150, -2900, 4300, 2600); c.fillStyle = '#F2C14E'; c.fillRect(150, -2900, 4300, 30);
  c.fillStyle = '#2B2F3A'; rr(c, 330, -2700, 1240, 300, 26); c.fill(); fitTxt(c, 'LOST BAGGAGE', 950, -2550, 130, '#FFFFFF', 1120);
  c.fillStyle = '#5E6E8E'; for (const y of [-2000, -1450]) c.fillRect(1500, y, 2800, 34);
  // unclaimed things on the shelves: an umbrella, a rubber ring, a lonely boot, a guitar case
  c.strokeStyle = '#2B2F3A'; c.lineWidth = 16; c.beginPath(); c.moveTo(1700, -2000); c.lineTo(1700, -2350); c.stroke(); c.fillStyle = '#E0474C'; c.beginPath(); c.moveTo(1560, -2330); c.quadraticCurveTo(1700, -2520, 1840, -2330); c.closePath(); c.fill();
  c.strokeStyle = '#F2A33A'; c.lineWidth = 50; c.beginPath(); c.arc(2250, -2140, 100, 0, TAU); c.stroke();
  c.fillStyle = '#3E8A4A'; rr(c, 2700, -2260, 120, 260, 20); c.fill(); rr(c, 2700, -2060, 230, 60, 20); c.fill();
  c.fillStyle = '#4A3A2E'; c.beginPath(); c.ellipse(3400, -1600, 120, 150, 0, 0, TAU); c.fill(); c.fillRect(3360, -1880, 80, 200);
  c.fillStyle = '#3F7FD0'; rr(c, 1700, -1700, 300, 250, 20); c.fill(); c.fillStyle = '#F2C14E'; rr(c, 2150, -1660, 260, 210, 20); c.fill();
  // wall base + floor
  c.fillStyle = '#B8C2D0'; c.fillRect(BX0, WALL - 40, BW, 60);
  const fg = c.createLinearGradient(0, WALL, 0, 1600); fg.addColorStop(0, '#D3D8E0'); fg.addColorStop(1, '#BCC3CF'); c.fillStyle = fg; c.fillRect(BX0, WALL + 20, BW, BY0 + BH - WALL);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; for (let y = WALL + 80, k = 0; y < BY0 + BH; y += 60 + k * 18, k++) { c.beginPath(); c.moveTo(BX0, y); c.lineTo(BX0 + BW, y); c.stroke(); }
  c.fillStyle = '#F2C14E'; for (let x = -3200; x < -300; x += 360) c.fillRect(x, -180, 200, 18);   // yellow safety line in front of the belt
  // carousel skirt (the moving belt + the hatch are drawn live)
  paint(c, q => { q.m(BX0, BLIP); q.l(-270, BLIP); q.q(-220, BLIP, -220, BLIP + 60); q.l(-220, WALL); q.l(BX0, WALL); q.z(); }, '#A9B1BD', { sd: 10, hd: 5, lw: 4 });
  c.fillStyle = '#6A707C'; c.fillRect(BX0, WALL - 60, -220 - BX0, 60); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(BX0, BLIP + 24, -220 - BX0, 10);
  c.fillStyle = '#10141C'; c.fillRect(BX0, WALL - 8, -220 - BX0, 8);
}
const mkBG = fn => { const a = createCanvas(Math.round(BW * BS), Math.round(BH * BS)); const c = a.getContext('2d'); c.scale(BS, BS); c.translate(-BX0, -BY0); fn(c); const b = createCanvas(a.width, a.height); const d = b.getContext('2d'); d.filter = 'blur(1.4px)'; d.drawImage(a, 0, 0); return b; };
const BGR = mkBG(drawHall);

// ---------------- live set: belt, trombone, hatch, desk
function belt(c, t) { c.fillStyle = '#3A3F4B'; c.fillRect(BX0, BTOP, -290 - BX0, BLIP - BTOP); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 6; const o = (t * TV) % 90;
  for (let x = -290 - o; x > BX0; x -= 90) { c.beginPath(); c.moveTo(x, BTOP); c.lineTo(x - 20, BLIP); c.stroke(); }
  c.fillStyle = '#2B2F3A'; c.fillRect(BX0, BLIP - 6, -290 - BX0, 16); }
function hatch(c, t) { paint(c, q => { q.m(HX0 - 30, -1330); q.l(HX1 + 30, -1330); q.l(HX1 + 30, BLIP); q.l(HX0 - 30, BLIP); q.z(); }, '#8A93A2', { sd: 8, hd: 4, lw: 4 });
  c.fillStyle = '#10141C'; c.fillRect(HX0, -1260, HX1 - HX0, BLIP - -1260); const tx = tromX(t), sw = clamp(1 - Math.abs(tx - (HX0 + 40)) / 260);
  for (let i = 0; i < 6; i++) { const x = HX0 + 8 + i * 37; c.save(); c.translate(x, -1260); c.rotate(-0.25 * sw * Math.sin(t * 6 + i)); c.fillStyle = '#22252E'; c.fillRect(0, 0, 30, BLIP + 1260 - 10); c.restore(); }
  c.fillStyle = '#F2C14E'; for (let i = 0; i < 6; i++) { c.save(); c.translate(HX0 - 30 + i * 52, -1330); c.beginPath(); c.moveTo(0, 0); c.lineTo(26, 0); c.lineTo(52, 40); c.lineTo(26, 40); c.fill(); c.restore(); } }
function tromboneLive(c, t) { const x = tromX(t); if (x < BX0 - 400 || x - 220 > HCLIP) return; c.save(); c.beginPath(); c.rect(BX0, -2000, HCLIP - BX0, 2000); c.clip(); c.translate(x, BTOP + 6); c.scale(TS, TS); trombone(c, t); c.restore(); K.mark(c, 'trombone', x, BTOP - 120, 260); }
const beaconOn = (t, L) => L === 'o4' && t > ev('o4', 'beacon');
function desk(c, t, L) {
  // desk top: radio (when not in her hand), red beacon, monitor (back side)
  if (!(L === 'o4' && t > ev('o4', 'radio'))) { c.save(); c.translate(500, DTOP - 30); radioDraw(c, 1.25); c.restore(); }
  const on = beaconOn(t, L); c.fillStyle = '#2B2F3A'; rr(c, 600, DTOP - 70, 120, 44, 10); c.fill();
  c.fillStyle = on ? (Math.sin(t * 20) > 0 ? '#FF3B3B' : '#C0202A') : '#9A3A40'; c.beginPath(); c.arc(660, DTOP - 70, 52, Math.PI, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(644, DTOP - 92, 14, 0, TAU); c.fill();
  if (on) { const a = t * 9; c.save(); c.globalCompositeOperation = 'lighter'; for (const s of [0, Math.PI]) { const g = c.createRadialGradient(660, DTOP - 80, 20, 660, DTOP - 80, 900); g.addColorStop(0, 'rgba(255,60,60,.55)'); g.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(660, DTOP - 80); c.arc(660, DTOP - 80, 900, a + s - 0.25, a + s + 0.25); c.closePath(); c.fill(); } c.restore(); }
  c.fillStyle = '#5A606C'; c.fillRect(935, DTOP - 120, 26, 90); paint(c, q => { q.m(850, DTOP - 380); q.l(1035, DTOP - 380); q.l(1035, DTOP - 115); q.l(850, DTOP - 115); q.z(); }, '#C9CED6', { sd: 6, hd: 3, lw: 4 });
  // the slab + front panel
  paint(c, q => { q.m(DX0 - 30, DTOP - 30); q.l(DX1 + 30, DTOP - 30); q.l(DX1 + 30, DTOP + 6); q.l(DX0 - 30, DTOP + 6); q.z(); }, '#5A606C', { sd: 4, hd: 3, lw: 4 });
  paint(c, q => { q.m(DX0, DTOP + 6); q.l(DX1, DTOP + 6); q.l(DX1, 0); q.l(DX0, 0); q.z(); }, NAVY, { sd: 12, hd: 6, lw: 4, box: [DX0, DTOP, DX1, 0], inner: k => {
    k.fillStyle = '#F2C14E'; k.fillRect(DX0, DTOP + 70, DX1 - DX0, 22);
    k.save(); k.translate(DX0 + 120, DTOP + 300); suitcase(k, 0.45, '#F2C14E'); k.restore(); k.fillStyle = NAVY; UI.font(k, 'Unb9', 90); k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('?', DX0 + 120, DTOP + 210);
    UI.textFit(k, 'Unb9', 66, 'LOST', 380); k.fillStyle = '#FFFFFF'; k.textAlign = 'left'; k.fillText('LOST', DX0 + 240, DTOP + 180); UI.textFit(k, 'Unb9', 66, 'BAGGAGE', 400); k.fillText('BAGGAGE', DX0 + 240, DTOP + 260);
    k.fillStyle = 'rgba(255,255,255,.08)'; k.fillRect(DX0, DTOP + 420, DX1 - DX0, 30); } });
  K.mark(c, 'desk', (DX0 + DX1) / 2, DTOP + 200, 320); }

// ---------------- characters
const gest = (st, g, who, t, side, base, drop = 0) => { const sp = TL.speech.find(s => s.who === who && t >= s.t && t < s.t + s.d); if (sp) { const u = (t - sp.t) * 4.5; st[side < 0 ? 'armL' : 'armR'] = reach(g, side, side * (g.sw * 1.5 + Math.sin(u) * 20), g.ySh + drop + base + Math.cos(u) * 20, { planar: true }); } };
const down = (g, s, drop = 0) => reach(g, s, s * g.sw * 1.08, g.ySh + drop + 540, { planar: true });
const open = (g, s, k = 1.7, dy = 90, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const hold = (g, s, dy = 330, k = 0.75, drop = 0) => reach(g, s, s * g.sw * k, g.ySh + drop + dy, { planar: true });
const base = (g, t, who) => ({ t, talk: talk(who, t), mood: 'neutral', turn: 0, look: 0, armL: down(g, -1), armR: down(g, 1), items: {} });
const PH = g => reach(g, 1, g.sw * 1.75, g.ySh - 30, { planar: true });          // hook: phone held up towards Denise
function herState(t, L) { const g = G.her, e = k => ev(L, k), st = { ...base(g, t, 'her'), mood: 'worried', turn: 0.25, look: 0.7 };
  if (L === 'hook') { st.mood = 'worried'; st.armR = PH(g); st.items = { R: phoneItem }; st.armL = hold(g, -1, 360, 0.5);
    if (speaking('hook_a', t, 0, 0.1) && t > SP.hook_a.t + 0.8) { st.mood = 'annoyed'; st.headY = 4; }
    if (t > hev('wide')) { st.mood = 'annoyed'; st.armR = hold(g, 1, 330, 0.7); st.items = { R: phoneItem }; } }
  if (L === 'o1') { st.mood = 'angry';
    if (speaking('o1_h', t, 0.05, 0.1)) { const u = t - SP.o1_h.t, hit = Math.abs(Math.sin(u * 6)); st.armL = open(g, -1, 1.5, 120 - hit * 80); st.armR = reach(g, 1, g.sw * (1.9 + 0.2 * hit), g.ySh + 60 - hit * 60, { planar: true }); st.headY = hit * 10; }
    if (t > SP.o1_a.t) { st.mood = 'shock'; st.blink = 0; }
    if (t > e('sniff') + 0.3) { st.mood = 'skeptical'; st.armL = hold(g, -1, 330, 0.55); st.armR = hold(g, 1, 330, 0.55); } }
  if (L === 'o2') { st.mood = 'worried'; st.armL = hold(g, -1, 300, 0.25); st.armR = hold(g, 1, 300, 0.25);
    if (speaking('o2_h', t, 0.05, 0.15)) { st.tilt = 0.07; st.lookY = 0.2; st.look = 0.5; }
    if (t > SP.o2_a.t) { st.mood = 'surprised'; st.tilt = 0; st.lookY = 0; }
    if (t > e('facepalm')) { const k = eOut(clamp((t - e('facepalm')) / 0.25)); st.mood = 'skeptical'; st.look = -0.2; st.turn = 0.1; st.armL = reach(g, -1, -g.sw * lerp(1.1, 2.2, k), g.ySh + lerp(500, 60, k), { planar: true }); st.armR = reach(g, 1, g.sw * lerp(1.1, 2.2, k), g.ySh + lerp(500, 60, k), { planar: true }); st.headY = -5 * k; } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.05, 0.15)) { st.mood = 'smug'; st.armL = hold(g, -1, 330, 0.5); const u = (t - SP.o3_h.t) * 4; st.armR = reach(g, 1, g.sw * (1.55 + 0.12 * Math.sin(u)), g.ySh + 170 + Math.cos(u) * 20, { planar: true }); }
    if (t > SP.o3_a.t) { st.mood = 'happy'; }
    if (t > e('give') - 0.2 && t < e('give') + 0.35) st.armR = reach(g, 1, g.sw * 1.9, g.ySh + 240, { planar: true });
    if (t > e('give') + 0.35) { st.mood = 'happy'; st.armR = hold(g, 1, 300, 0.85); st.items = { R: formItem }; }
    if (t > e('formend')) { st.mood = 'smug'; st.blink = 0; } }
  if (L === 'o4') { st.mood = 'worried'; st.items = { R: formItem }; st.armR = hold(g, 1, 300, 0.85);
    if (speaking('o4_h', t, 0.05, 0.1)) { const u = t - SP.o4_h.t;
      if (t < ev('o4', 'two')) { st.lookY = -0.3; st.look = 0.3; st.armL = reach(g, -1, -g.sw * 0.15, g.ySh + 200, { planar: true }); st.armR = reach(g, 1, g.sw * (2.2 + 0.1 * Math.sin(u * 2)), g.ySh - 110 + Math.sin(u * 2) * 15, { planar: true }); st.items = {}; st.tilt = -0.05; }
      else { st.mood = 'worried'; st.lookY = 0; st.look = 0.8; st.items = {}; const k = Math.sin(u * 5); st.armL = reach(g, -1, -g.sw * 0.45, g.ySh + 260 + k * 15, { planar: true }); st.armR = reach(g, 1, g.sw * 0.45, g.ySh + 260 + k * 15, { planar: true }); st.headY = 3 * k; } }
    if (t > endOf('o4_h') + 0.05) { st.mood = 'smug'; st.blink = 1; st.items = {}; st.armL = hold(g, -1, 330, 0.5); st.armR = hold(g, 1, 330, 0.5); }
    if (t > ev('o4', 'beacon')) { st.mood = 'shock'; st.blink = 0; st.armL = open(g, -1, 1.6, 80); st.armR = open(g, 1, 1.6, 80); } }
  if (L === 'end') { st.mood = 'worried'; st.armL = hold(g, -1, 300, 0.25); st.armR = hold(g, 1, 300, 0.25);
    if (t > e('joy')) { st.mood = 'happy'; st.laugh = true; st.blink = 0; st.armL = reach(g, -1, -g.sw * 2.0, g.ySh - 140 + Math.sin(t * 9) * 15, { planar: true }); st.armR = reach(g, 1, g.sw * 2.0, g.ySh - 140 + Math.sin(t * 9 + 1) * 15, { planar: true }); st.headY = -Math.abs(Math.sin(t * 7)) * 8; }
    if (t > e('moral')) { st.laugh = false; st.mood = 'happy'; st.blink = 1; st.armL = hold(g, -1, 300, 0.3); st.armR = hold(g, 1, 300, 0.3); st.headY = 0; } }
  return st; }
const DESKY = 345;   // Denise's hands resting on the desk (ySh + DESKY ~ just above the slab)
function denState(t, L) { const kn = L === 'o2' && t > ev('o2', 'peek'), g = kn ? G.knee : G.agent2, e = k => ev(L, k), st = { ...base(g, t, 'agent2'), mood: 'neutral', turn: -0.25, look: -0.7 };
  st.armL = hold(g, -1, DESKY, 1.0); st.armR = hold(g, 1, DESKY, 0.9);
  if (L === 'hook') { st.mood = 'bored'; st.blink = 0.5; st.headY = 6;
    if (speaking('hook_a', t, 0.05, 0.1)) { const u = (t - SP.hook_a.t) * 3; st.armL = reach(g, -1, -g.sw * (1.45 + 0.1 * Math.sin(u)), g.ySh + 230 + Math.cos(u) * 15, { planar: true }); }
    if (t > hev('wide')) { st.mood = 'bored'; st.blink = 0.6; } }
  if (L === 'o1') { st.mood = 'bored';
    if (speaking('o1_h', t, 0.1, 0.1)) { st.mood = 'shock'; st.blink = 0; st.breathe = 0; }
    if (speaking('o1_a', t, 0.05, 0.05)) { st.mood = 'skeptical'; st.blink = 0.4; }
    if (t > e('sniff') && t < e('sniffend')) { const u = t - e('sniff'), sw = Math.sin(u * 7.5); st.mood = 'skeptical'; st.blink = 1; st.lookY = -0.5; st.turn = -0.25 + 0.35 * sw; st.look = 0.6 * sw; st.headY = -14 - 6 * Math.abs(Math.sin(u * 15)); st.tilt = -0.06; }
    if (t > e('sniffend')) { st.mood = 'smug'; st.blink = 0.3; } }
  if (L === 'o2') { st.mood = 'neutral';
    if (speaking('o2_h', t, 0.05, 0.1)) { st.mood = 'skeptical'; }
    if (speaking('o2_a', t, 0.05, 0.1)) { st.mood = 'bored'; st.blink = 0.5; }
    if (kn) { st.legPose = 'squat'; st.drop = 430; st.mood = 'skeptical'; st.turn = 0.45; st.look = 0.9; st.lookY = 0.45; st.blink = 0;
      st.armR = reach(g, 1, g.sw * 2.0, g.ySh + 250, { planar: true }); st.items = { R: torchItemR }; st.armL = reach(g, -1, -g.sw * 0.9, g.ySh + 380, { planar: true });
      if (t > e('tromb') - 0.2 && t < e('tromb') + 0.9) { st.lookY = -0.6; st.mood = 'surprised'; st.look = 0.2; st.turn = 0; } } }
  if (L === 'o3') { st.mood = 'neutral';
    if (speaking('o3_h', t, 0.1, 0.1)) { st.mood = 'surprised'; }
    if (t > SP.o3_a.t - 0.05) { st.mood = 'happy'; }
    if (t > e('give') - 0.35 && t < e('give') + 0.35) { const k = eIO(clamp((t - e('give') + 0.35) / 0.35)); st.armL = reach(g, -1, -g.sw * lerp(1.0, 2.5, k), g.ySh + DESKY - 60 * k, { planar: true }); st.items = { L: formItem }; }
    if (t > e('give') + 0.35) { st.mood = 'happy'; st.blink = 0; } }
  if (L === 'o4') { st.mood = 'neutral';
    if (speaking('o4_h', t, 0, 0)) { st.mood = t > ev('o4', 'two') ? 'shock' : 'surprised'; st.blink = 0; if (t > ev('o4', 'two')) st.breathe = 0; }
    if (t > e('radio')) { const k = eOut(clamp((t - e('radio')) / 0.3)); st.mood = 'angry'; st.blink = 0; st.headFirst = true; st.items = { L: radioItem };
      st.armL = reach(g, -1, lerp(-g.sw * 1.5, -g.hw * 1.15, k), lerp(g.ySh + DESKY, g.headY + g.hh * 1.55, k), { planar: true }); st.turn = -0.1; st.look = -0.2; }
    if (t > endOf('o4_a') + 0.05) { st.mood = 'angry'; const u = (t - endOf('o4_a')) * 14; st.armR = reach(g, 1, g.sw * (0.9 + 0.08 * Math.sin(u)), g.ySh + DESKY - 10 + 10 * Math.cos(u), { planar: true }); st.turn = 0.25; st.look = 0.8; } }
  if (L === 'end') { st.mood = 'neutral'; st.turn = 0.3; st.look = 0.85; st.lookY = 0.1; const u = t * 16;
    st.armL = reach(g, -1, -g.sw * 0.35, g.ySh + DESKY - 8 + 10 * Math.sin(u), { planar: true }); st.armR = reach(g, 1, g.sw * 1.0, g.ySh + DESKY - 8 + 10 * Math.cos(u * 1.3), { planar: true });
    if (t > e('brows')) { st.mood = 'surprised'; st.blink = 0; st.headY = -10; st.armL = hold(g, -1, DESKY, 1.0); st.armR = hold(g, 1, DESKY, 0.9); }
    if (t > SP.end_a.t - 0.05) { st.mood = 'surprised'; st.turn = -0.25; st.look = -0.7; st.headY = 0; gest(st, g, 'agent2', t, -1, 160); }
    if (t > endOf('end_a') + 0.05) { st.mood = 'happy'; st.blink = 0; } }
  return st; }
const denX = (L, t) => (L === 'o2' && t > ev('o2', 'peek')) ? XU : X.den;   // behind the desk until she kneels under the belt (the cut to UNDER hides the move)
const denBehindDesk = (t, L) => !(L === 'o2' && t > ev('o2', 'peek'));

// ---------------- world + which characters each shot draws
const DRAW = { wide: ['her', 'agent2'], cover: ['her', 'agent2'], two: ['her', 'agent2'], her: ['her'], den: ['agent2'], under: ['agent2'] };
const OFF = { x: 1e5, y: -3000, hh: 100 }, OFFL = { x: -1e5, y: -3000, hh: 100 };
function sniffs(c, hd, t, L) { if (L !== 'o1') return; const a = ev('o1', 'sniff'), b = ev('o1', 'sniffend'); if (t < a || t > b) return; const u = t - a;
  c.save(); c.strokeStyle = 'rgba(90,110,140,.8)'; c.lineWidth = 7; c.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const v = ((u * 2.4 + i / 3) % 1), x = hd.x - hd.hh * (1.5 - v * 0.9), y = hd.y + hd.hh * 0.1 + (i - 1) * hd.hh * 0.3; c.globalAlpha = Math.sin(Math.PI * v); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + hd.hh * 0.18, y - hd.hh * 0.12, x + hd.hh * 0.36, y); c.stroke(); }
  c.restore(); }
function beam(c, t, L) { if (L !== 'o2' || t < ev('o2', 'peek') + 0.3) return; const g = G.knee, x0 = XU + g.sw * 2.0 + 150, y0 = g.ySh + 270; c.save(); const gr = c.createLinearGradient(x0, y0, x0 - 600, WALL); gr.addColorStop(0, 'rgba(255,240,170,.75)'); gr.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gr;
  c.beginPath(); c.moveTo(x0, y0 - 16); c.lineTo(x0 + 230, WALL - 150); c.lineTo(x0 + 150, WALL + 50); c.lineTo(x0, y0 + 16); c.fill(); c.fillStyle = 'rgba(255,240,170,.5)'; c.beginPath(); c.ellipse(x0 + 195, WALL - 50, 60, 95, 0, 0, TAU); c.fill(); c.restore(); }
function world(c, t, L, tag) { const who = DRAW[tag] || ['her', 'agent2'], heads = {};
  c.drawImage(BGR, BX0, BY0, BW, BH); belt(c, t); tromboneLive(c, t); hatch(c, t);
  if (who.includes('agent2')) { if (denBehindDesk(t, L)) { heads.agent2 = K.put(c, DEN, denState(t, L), denX(L, t), 0); desk(c, t, L); } else { desk(c, t, L); beam(c, t, L); heads.agent2 = K.put(c, DEN, denState(t, L), denX(L, t), 0); } }
  else desk(c, t, L);
  if (who.includes('her')) heads.her = K.put(c, HER, herState(t, L), X.her, 0);
  if (heads.agent2) sniffs(c, heads.agent2, t, L);
  if (L === 'end' && heads.her && t > ev('end', 'tears')) tears(c, heads.her, t, clamp((t - ev('end', 'tears')) / 0.3) * (1 - clamp((t - ev('end', 'moral') - 1.5) / 0.4)));
  if (!heads.her) heads.her = OFFL; if (!heads.agent2) heads.agent2 = OFF;
  return heads; }

// ---------------- shots (world coordinates)
const S = (x, y, z, tag) => ({ x, y, z, r: 0, tag });
const U = (name, i) => ({ x: 50000 + i * 1000, y: 0, z: 1, r: 0, tag: 'ui:' + name });
const HY = k => G[k].headY, fy = (hy, z, sy = 900) => hy + (960 - sy) / z;
const SH = { COVER: S(60, fy(HY('her'), 0.55, 1000), 0.55, 'cover'), WIDE: S(-120, fy(HY('her'), 0.42, 860), 0.42, 'wide'),
  TWO: S(430, fy(HY('her'), 0.72, 760), 0.72, 'two'),
  HER: S(X.her + 30, fy(HY('her'), 1.0), 1.0, 'her'), HER_R: S(X.her + 20, fy(HY('her'), 1.05, 640), 1.05, 'her'),
  DEN: S(X.den + 20, fy(HY('agent2'), 1.0), 1.0, 'den'), DEN_CU: S(X.den + 10, fy(HY('agent2'), 1.2, 880), 1.2, 'den'),
  UNDER: S(XU + 60, fy(G.agent2.headY + 430, 0.8, 900), 0.8, 'under'),
  PHONE: U('phone', 1), FORM: U('form', 2), MON: U('mon', 3) };
function shotHard(t) { const sc = sceneAt(t), L = sc.id, f = s => ({ ...s, force: true }), e = k => ev(L, k); if (L === 'outro') return SH.WIDE;
  if (L === 'hook') { if (t < hev('phone')) return SH.COVER; if (t < hev('wide') - 0.05) return f(SH.PHONE); return f(SH.WIDE); }
  if (L === 'o1') { if (t < SP.o1_h.t - 0.1) return f(SH.WIDE); if (t < SP.o1_a.t - 0.1) return f(SH.HER); if (t < SP.o1_nar.t - 0.05) return f(SH.DEN); return f(SH.TWO); }
  if (L === 'o2') { if (t < SP.o2_h.t - 0.1) return f(SH.WIDE); if (t < SP.o2_a.t - 0.1) return f(SH.HER); if (t < e('peek')) return f(SH.DEN); if (t < e('facepalm') - 0.05) return f(SH.UNDER); return f(SH.HER_R); }
  if (L === 'o3') { if (t < SP.o3_h.t - 0.1) return f(SH.WIDE); if (t < SP.o3_a.t - 0.1) return f(SH.HER); if (t < e('form')) return f(SH.TWO); if (t < e('formend')) return f(SH.FORM); return f(SH.TWO); }
  if (L === 'o4') { if (t < SP.o4_h.t - 0.1) return f(SH.WIDE); if (t < e('two')) return f(SH.HER); if (t < e('radio') - 0.05) return f(SH.TWO); if (t < e('wide')) return f(SH.DEN_CU); return f(SH.WIDE); }
  if (L === 'end') { if (t < e('screen')) return f(SH.DEN); if (t < SP.end_a.t - 0.1) return f(SH.MON); if (t < e('joy') - 0.05) return f(SH.DEN); if (t < e('moral') - 0.05) return f(SH.HER_R); return f(SH.WIDE); }
  return SH.WIDE; }
const CAM = E.simulateCamera(TL, shotHard, { k: 150, c: 20 });
const shake = E.makeShake(TL, ['impact', 'thud', 'stamp']);
function drawWorld(c, t, L, cam, tag, sh = { x: 0, y: 0, r: 0 }) { c.save(); c.translate(540 + sh.x, 960 + sh.y); c.rotate(cam.r * Math.PI / 180 + sh.r); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y); const heads = world(c, t, L, tag); const M = c.getTransform(); c.restore(); return { heads, M }; }

// ---------------- inserts on a solid backdrop
function backdrop(c, t, a, b) { const g = c.createLinearGradient(0, 0, 0, HH); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = -12; i < 12; i++) c.fillRect(-1600, i * 160 + (t * 40) % 160, 3200, 60); c.restore(); }
// hook: her phone — the photo of the red suitcase; on «самое ценное» it turns into an x-ray: grandma's salo inside, glowing
function phoneView(c, t) { backdrop(c, t, '#F9D7E4', '#EE9CBC'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'phone' });
  const u = t - hev('phone'), k = eBack(clamp((u + 0.05) / 0.3), 1.6), xr = eIO(clamp((t - hev('salo') + 0.1) / 0.35));
  c.save(); c.translate(540, 880); c.scale(k, k); c.translate(-540, -880);
  K.phone(c, 540, 880, 1.15, (q, w, h) => {
    q.fillStyle = '#F4F1EC'; q.fillRect(0, 0, w, h); q.fillStyle = '#2B2F3A'; q.fillRect(0, 0, w, 90); UI.textFit(q, 'Unb9', 36, 'PHOTOS', 300); q.fillStyle = '#FFFFFF'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('PHOTOS', w / 2, 52);
    // the photo: her suitcase at home, by the door
    q.fillStyle = '#F7E3B0'; q.fillRect(16, 110, w - 32, 520); q.fillStyle = '#C98B5A'; q.fillRect(16, 520, w - 32, 110);
    q.save(); q.translate(w / 2, 590); suitcase(q, 0.95); q.restore();
    q.fillStyle = '#2B2F3A'; UI.textFit(q, 'Unb9', 34, 'MY BAG', 300); q.fillText('MY BAG', w / 2, 680);
    if (xr > 0) { q.save(); q.globalAlpha = xr; q.fillStyle = '#0E2A4A'; q.fillRect(16, 110, w - 32, 520);
      q.strokeStyle = '#7FE3FF'; q.lineWidth = 6; q.beginPath(); q.roundRect(w / 2 - 142, 590 - 380, 284, 368, 20); q.stroke(); q.beginPath(); q.moveTo(w / 2 - 48, 590 - 380); q.lineTo(w / 2 - 48, 590 - 460); q.lineTo(w / 2 + 48, 590 - 460); q.lineTo(w / 2 + 48, 590 - 380); q.stroke();
      q.strokeStyle = 'rgba(127,227,255,.45)'; q.lineWidth = 4; for (let i = 0; i < 4; i++) { q.beginPath(); q.moveTo(w / 2 - 120, 260 + i * 40); q.quadraticCurveTo(w / 2, 240 + i * 40, w / 2 + 120, 260 + i * 40); q.stroke(); }
      const gl = 0.6 + 0.4 * Math.sin(t * 8); q.save(); q.translate(w / 2, 470); q.shadowColor = '#FFE15A'; q.shadowBlur = 40 * gl; salo(q, 0.62 + 0.03 * gl); q.restore();
      heart(q, w / 2, 330 - 10 * Math.sin(t * 5), 44 * eBack(clamp((t - hev('salo') - 0.2) / 0.3), 2), '#EE5E9A'); q.restore(); } });
  c.restore(); }
// o3: the missing-baggage report + the reference slip (stamped)
function formView(c, t) { backdrop(c, t, '#DDE8F4', '#9FB8D8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'form' });
  const u = t - ev('o3', 'form'), k = eBack(clamp((u + 0.05) / 0.3), 1.6), sk = eBack(clamp((u - 0.15) / 0.25), 1.8), stp = clamp((t - ev('o3', 'form') - 0.8) / 0.12);
  c.save(); c.translate(540, 820); c.scale(k, k); c.rotate(-0.03);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -360 + 14, -470 + 18, 720, 900, 26); c.fill(); c.fillStyle = '#FFFFFF'; rr(c, -360, -470, 720, 900, 26); c.fill(); c.strokeStyle = '#9AA3B2'; c.lineWidth = 5; c.stroke();
  c.fillStyle = NAVY; rr(c, -360, -470, 720, 150, [26, 26, 0, 0]); c.fill(); fitTxt(c, 'MISSING BAGGAGE', 0, -425, 54, '#FFFFFF', 640); fitTxt(c, 'REPORT', 0, -362, 54, '#F2C14E', 640);
  const rows = [['NAME', 'ME'], ['FLIGHT', 'FROM MADRID'], ['BAG', 'RED SUITCASE'], ['INSIDE', 'SALO (VERY IMPORTANT)']];
  rows.forEach(([a, b], i) => { const y = -240 + i * 125; fitTxt(c, a, -320, y - 28, 30, '#6A707C', 240, 'Unb9', 'left'); c.fillStyle = '#C9CED6'; c.fillRect(-320, y + 30, 640, 5); fitTxt(c, b, -320, y + 8, 40, i === 3 ? C.pinkD : NAVY, 640, 'Nun9', 'left'); });
  c.restore();
  // the reference slip
  if (sk > 0) { c.save(); c.translate(560, 1230); c.scale(sk, sk); c.rotate(0.06); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -330 + 10, -120 + 14, 660, 320, 22); c.fill(); c.fillStyle = '#F2C14E'; rr(c, -330, -120, 660, 320, 22); c.fill(); c.strokeStyle = '#8A6A1A'; c.lineWidth = 5; c.stroke();
    fitTxt(c, 'REFERENCE NUMBER', 0, -62, 40, '#2B2F3A', 600); fitTxt(c, 'LB-0427', 0, 30, 120, '#2B2F3A', 600);
    if (stp > 0) { const s2 = lerp(2.2, 1, eOut(stp)); c.save(); c.translate(150, 140); c.rotate(-0.12); c.scale(s2, s2); c.globalAlpha = clamp(stp * 2) * 0.9; c.strokeStyle = '#2E9A5A'; c.lineWidth = 9; rr(c, -150, -46, 300, 92, 16); c.stroke(); fitTxt(c, 'RECEIVED', 0, 4, 54, '#2E9A5A', 270); c.restore(); }
    c.restore(); } }
// twist: the tracking screen — BAG FOUND, LISBON, FIRST CLASS (the suitcase in a big first-class seat, salo in sunglasses on top)
function monView(c, t) { backdrop(c, t, '#E3E8F0', '#A8B4C8'); if (global.__QA) global.__QA.ui(c, 'insert', { x: 0, y: 0, w: W, h: HH, k: 1, id: 'mon' });
  const u = t - ev('end', 'screen'), k = eBack(clamp((u + 0.05) / 0.3), 1.6), r = i => eBack(clamp((u - 0.2 - i * 0.22) / 0.25), 2);
  c.save(); c.translate(540, 860); c.scale(k, k);
  c.fillStyle = '#5A606C'; c.fillRect(-40, 360, 80, 140); rr(c, -200, 480, 400, 40, 14); c.fill();
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -460 + 14, -420 + 18, 920, 800, 34); c.fill(); c.fillStyle = '#C9CED6'; rr(c, -460, -420, 920, 800, 34); c.fill();
  c.fillStyle = '#0F1E36'; rr(c, -420, -380, 840, 720, 18); c.fill();
  fitTxt(c, 'BAG TRACKER', -380, -320, 44, '#7FE3FF', 500, 'Unb9', 'left');
  if (r(0) > 0) { c.save(); c.translate(-330, -210); c.scale(r(0), r(0)); c.fillStyle = '#2E9A5A'; c.beginPath(); c.arc(0, 0, 44, 0, TAU); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, 2); c.lineTo(-4, 18); c.lineTo(22, -14); c.stroke(); c.restore(); fitTxt(c, 'BAG FOUND', -260, -208, 70, '#7CF29A', 560, 'Unb9', 'left'); }
  if (r(1) > 0) { c.save(); c.globalAlpha = clamp(r(1)); fitTxt(c, 'LISBON', -380, -100, 76, '#FFFFFF', 360, 'Unb9', 'left'); fitTxt(c, 'FIRST CLASS', -380, -10, 46, '#F2C14E', 330, 'Unb9', 'left'); c.restore(); }
  if (r(2) > 0) { c.save(); c.translate(250, 175); c.scale(r(2) * 0.85, r(2) * 0.85);
    // the seat
    c.fillStyle = '#8A1C2E'; rr(c, -190, -300, 150, 420, 50); c.fill(); rr(c, -200, 40, 380, 120, 40); c.fill(); c.fillStyle = '#B83A4E'; rr(c, -170, -270, 100, 300, 40); c.fill();
    c.save(); c.translate(30, 60); suitcase(c, 0.5); c.restore();
    c.save(); c.translate(30, -160); c.rotate(-0.08); salo(c, 0.5, true); c.restore();
    // a little drink on the armrest
    c.fillStyle = 'rgba(200,235,255,.8)'; c.beginPath(); c.moveTo(170, -30); c.lineTo(230, -30); c.lineTo(200, 10); c.fill(); c.fillStyle = '#C9D2DA'; c.fillRect(196, 8, 8, 40); c.fillRect(176, 46, 48, 8); c.restore(); }
  c.restore(); }

// ---------------- overlays
function title(c, t) { const a = 1 - P(t, 2.25, 2.5); if (a <= 0) return; const lines = TL.cfg.hook_title, rk2 = 1 + 0.012 * Math.sin(t * 5);
  c.save(); c.globalAlpha = a; c.translate(540, 300); c.rotate(-0.04); c.scale(rk2, rk2); c.fillStyle = 'rgba(0,0,0,.22)'; rr(c, -490 + 10, -165 + 14, 980, 330, 30); c.fill(); c.fillStyle = C.cream; c.strokeStyle = C.oliveD; c.lineWidth = 9; rr(c, -490, -165, 980, 330, 30); c.fill(); c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; UI.textFit(c, 'Unb9', 72, lines[0][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[0][0], 0, -102);
  UI.textFit(c, 'Unb9', 120, lines[1][0], 920); UI.strokeText(c, lines[1][0], 0, 6, C.pink, C.white, 14); UI.textFit(c, 'Unb9', 64, lines[2][0], 880); c.fillStyle = C.oliveD; c.fillText(lines[2][0], 0, 112);
  // rubric label «ПОЛЕЗНОЕ» (small, under the title box)
  c.save(); c.translate(0, 205); c.rotate(0.04); c.fillStyle = '#4CAF6A'; c.strokeStyle = C.oliveD; c.lineWidth = 6; rr(c, -150, -32, 300, 64, 32); c.fill(); c.stroke(); UI.textFit(c, 'Unb9', 36, 'ПОЛЕЗНОЕ', 250); c.fillStyle = C.white; c.fillText('ПОЛЕЗНОЕ', 0, 3); c.restore();
  c.restore();
  if (global.__QA) global.__QA.ui(c, 'card', { x: 50, y: 135, w: 980, h: 420, k: a, id: 'title' }); }
const PLATES = { o1: ['1', 'В ЛОБ', '#E0474C'], o2: ['2', 'ВЕЖЛИВО', '#F2B33D'], o3: ['3', 'КАК НОСИТЕЛЬ', '#4CAF6A'], o4: ['4', 'КОРОЛЕВСКИЙ ОТВЕТ', '#8E5BD0'] };
function plate(c, t, sc) { const p = PLATES[sc.id]; if (!p) return; const u = t - sc.s, out = P(t, sc.e - 0.15, sc.e);
  const k = eBack(P(u, 0, 0.25), 2.2) * (1 - eIn(out)), big = 1 - eIO(P(u, 0.3, 0.5)); if (k <= 0) return;
  UI.font(c, 'Unb9', 54); const tw = c.measureText(p[1]).width, w = tw + 200, h = 100, smax = Math.min(1, 760 / w), s = k * lerp(smax, Math.min(1.4, 880 / w), big), y = 215;
  c.save(); c.translate(540, y); c.scale(s, s); c.rotate(-0.025);
  c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -w / 2 + 6, -h / 2 + 9, w, h, 50); c.fill(); c.fillStyle = C.white; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 50); c.fill(); c.stroke();
  c.fillStyle = p[2]; c.beginPath(); c.arc(-w / 2 + 50, 0, 50, 0, TAU); c.fill(); c.stroke(); c.fillStyle = C.white; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[0], -w / 2 + 50, 4);
  c.fillStyle = C.oliveD; c.textAlign = 'left'; c.fillText(p[1], -w / 2 + 120, 4); c.restore();
  if (global.__QA) global.__QA.ui(c, 'label', { x: 540 - w / 2 * s, y: y - 50 * s, w: w * s, h: 100 * s, k, id: 'plate_' + sc.id }); }
function redAlert(c, t, L) { if (!beaconOn(t, L)) return; const k = 0.10 + 0.08 * Math.max(0, Math.sin(t * 20)); c.save(); c.fillStyle = `rgba(255,40,40,${k})`; c.fillRect(0, 0, W, HH); c.restore(); }

// ---------------- end screen: question, 1 / 2 / 3 / 4, СОХРАНИ, ПОДПИСАТЬСЯ clicked by the cursor, then the comment question (ask) big
const wAt = (id, w, fb) => K.wordT(id, w) ?? fb;
function endScreen(c, t) { const s = SC.outro.s, u = t - s, sp = SP.outro, sa = SP.ask, { textFit, strokeText, font } = UI;
  c.fillStyle = C.pinkL; c.fillRect(0, 0, W, HH);
  c.save(); c.translate(540, 960); c.rotate(0.3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -20; i < 20; i++) c.fillRect(-1600, i * 180 + (t * 50) % 180, 3200, 80); c.restore();
  // heroine hugging the salo + Denise (owner-approved outro layout: bottom-left, heroX 95, heroS 0.34, 2nd character at local x 640)
  const hy = lerp(2350, 1985, eBack(P(u, 0.4, 0.9), 1.4)); c.save(); c.translate(95, hy); c.scale(0.34, 0.34);
  { const g = G.her, gm = G.agent2; K.put(c, DEN, { t, mood: 'happy', laugh: true, turn: -0.2, look: -0.4, items: {}, armL: reach(gm, -1, -gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6) * 15, { planar: true }), armR: reach(gm, 1, gm.sw * 1.7, gm.ySh + 60 + Math.sin(t * 6 + 1) * 15, { planar: true }) }, 640, 0);
    const saloIt = q => { q.save(); q.translate(110, -40); salo(q, 0.8); q.restore(); };
    K.put(c, HER, { t, mood: 'happy', laugh: true, turn: 0.1, look: 0.2, armL: reach(g, -1, -g.sw * 0.3, g.ySh + 330, { planar: true }), armR: reach(g, 1, g.sw * 0.4, g.ySh + 300, { planar: true }), items: { L: saloIt } }, 0, 0); }
  c.restore();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const aK = sa ? eIO(P(t, sa.t - 0.15, sa.t + 0.15)) : 0;
  const q = eBack(P(u, 0.2, 0.55), 2.2) * (1 - aK); if (q > 0) { c.save(); c.translate(540, 300); c.scale(q, q); font(c, 'Unb9', 64); strokeText(c, 'А ТЫ БЫ', 0, -50, C.oliveD, C.white, 14); strokeText(c, 'ОТВЕТИЛА КАК?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const qa = sa ? eBack(P(t, sa.t - 0.05, sa.t + 0.3), 2.2) : 0; if (qa > 0) { const pl = 1 + 0.03 * Math.sin(t * 6); c.save(); c.translate(540, 290); c.scale(qa * pl, qa * pl); textFit(c, 'Unb9', 66, 'ЧТО САМОЕ ЦЕННОЕ', 900); strokeText(c, 'ЧТО САМОЕ ЦЕННОЕ', 0, -52, C.oliveD, C.white, 14); textFit(c, 'Unb9', 66, 'В ТВОЁМ ЧЕМОДАНЕ?', 900); strokeText(c, 'В ТВОЁМ ЧЕМОДАНЕ?', 0, 40, C.pink, C.white, 14); c.restore(); }
  const tw = [wAt('outro', 'один', sp.t + 1.2), wAt('outro', 'два', sp.t + 1.6), wAt('outro', 'три', sp.t + 1.9), wAt('outro', 'четыре', sp.t + 2.3)];
  const LBL = { o1: ['В ЛОБ'], o2: ['ВЕЖЛИВО'], o3: ['КАК', 'НОСИТЕЛЬ'], o4: ['КОРОЛЕВ-', 'СКИЙ'] };
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const p = PLATES[id], kk = eBack(P(t, tw[i] - 0.1, tw[i] + 0.2), 2.2); if (kk <= 0) return; const x = 290 + (i % 2) * 420, y = 600 + Math.floor(i / 2) * 200, bump = 1 + 0.06 * Math.sin(clamp((t - tw[i]) / 0.4) * Math.PI);
    c.save(); c.translate(x, y); c.scale(kk * bump, kk * bump); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -195 + 8, -80 + 12, 390, 160, 36); c.fill(); c.fillStyle = p[2]; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -195, -80, 390, 160, 36); c.fill(); c.stroke();
    font(c, 'Unb9', 120); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(p[0], -125, 8);
    const ls = LBL[id]; ls.forEach((s_, j) => { textFit(c, 'Unb9', 34, s_, 230); c.fillStyle = C.white; c.textAlign = 'left'; c.fillText(s_, -60, (j - (ls.length - 1) / 2) * 42 + 4); }); c.restore(); });
  const svT = wAt('outro', 'пиши', sp.t + 3.0) - 0.1, sk = eBack(P(t, svT, svT + 0.3), 2.2), pulse = 1 + 0.05 * Math.sin(clamp((t - svT - 0.4) / 0.5) * Math.PI);
  if (sk > 0) { c.save(); c.translate(540, 1000); c.scale(sk * pulse, sk * pulse); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -260 + 6, -60 + 10, 520, 120, 60); c.fill(); c.fillStyle = C.gold; c.strokeStyle = C.oliveD; c.lineWidth = 7; rr(c, -260, -60, 520, 120, 60); c.fill(); c.stroke();
    c.fillStyle = C.oliveD; c.beginPath(); c.moveTo(-190, -32); c.lineTo(-146, -32); c.lineTo(-146, 34); c.lineTo(-168, 16); c.lineTo(-190, 34); c.closePath(); c.fill();   // bookmark icon
    textFit(c, 'Unb9', 50, 'СОХРАНИ', 330); c.fillStyle = C.oliveD; c.textAlign = 'center'; c.fillText('СОХРАНИ', 40, 4); c.restore(); }
  const subT = Math.min(svT + 0.5, sp.t + sp.d - 0.6), bk = eBack(P(t, subT, subT + 0.3), 2), sy = 1200;
  if (bk > 0) { const click = P(t, subT + 0.8, subT + 0.95), pressed = t > subT + 0.9; c.save(); c.translate(560, sy); const ss = bk * (1 - 0.08 * Math.sin(click * Math.PI)); c.scale(ss, ss); c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -250 + 6, -58 + 10, 500, 116, 58); c.fill(); c.fillStyle = pressed ? C.olive : C.pink; rr(c, -250, -58, 500, 116, 58); c.fill(); textFit(c, 'Unb9', 42, pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 440); c.fillStyle = C.white; c.textAlign = 'center'; c.fillText(pressed ? 'ТЫ С НАМИ!' : 'ПОДПИСАТЬСЯ', 0, 4); c.restore();
    const mv = eIO(P(t, subT + 0.2, subT + 0.8)); UI.tapCursor(c, lerp(900, 620, mv), lerp(sy + 260, sy + 20, mv), 1, P(t, subT + 0.85, subT + 1.4)); }
  if (!sa || t < sa.t - 0.1) { c.save(); c.translate(0, -130); UI.captions(c, t); c.restore(); }   // the ask line is shown big at the top instead of as a caption
  Hq.grain(c, W, HH, t, 0.05); UI.outroIntro(c, t); }

function renderFrame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; const sc = sceneAt(t), L = sc.id;
  if (L === 'outro') { endScreen(c, t); return; }
  const fr = Math.min(CAM.length - 1, Math.round(t * FPS)), cam = CAM[fr], sh = shake(t), tag = cam.tag || 'wide';
  let heads, proj;
  if (tag.startsWith('ui:')) { if (tag === 'ui:phone') phoneView(c, t); else if (tag === 'ui:form') formView(c, t); else monView(c, t); heads = { her: OFFL, agent2: OFF }; proj = p => p; Hq.vignette(c, W, HH, 0.2); }
  else { const r = drawWorld(c, t, L, cam, tag, sh); heads = r.heads; const M = r.M; proj = p => ({ x: M.a * p.x + M.c * p.y + M.e, y: M.b * p.x + M.d * p.y + M.f }); Hq.vignette(c, W, HH, 0.24); redAlert(c, t, L); }
  const names = { agent2: ['DENISE', NAVY] }, onScr = {}; for (const k in heads) if (Math.abs(heads[k].x) < 1e4) onScr[k] = heads[k];   // a speaker who is not in the shot never gets a bubble
  if (!tag.startsWith('ui:')) K.bubbles(c, t, sc, onScr, proj, { cleanChunks: true, names, hold: { hook_a: -0.2, o1_h: -0.22, o1_a: 0.3, o2_h: -0.22, o2_a: -0.2, o3_h: -0.22, o3_a: -0.2, o4_h: -0.15, o4_a: -0.1, end_a: -0.2 } });
  if (L === 'hook') title(c, t);
  plate(c, t, sc);
  UI.captions(c, t); UI.watermark(c); Hq.grain(c, W, HH, t, 0.04);
  // the end screen wipes in from the twist
  const d = sc.e - t; if (L === 'end' && d < 0.18) { const k = eIn(1 - d / 0.18); c.save(); c.fillStyle = C.pinkL; c.beginPath(); c.arc(540, 960, 1300 * k * 0.25, 0, 7); c.fill(); c.restore(); }
}
E.run('lostbag', NF, renderFrame);
